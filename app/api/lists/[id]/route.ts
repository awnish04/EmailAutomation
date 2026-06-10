import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const list = await prisma.list.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const contacts = await prisma.contact.findMany({
      where: {
        contactLists: {
          some: {
            listId: id,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      list,
      contacts,
      totalContacts: list._count.contacts,
      page,
      totalPages: Math.ceil(list._count.contacts / limit),
    })
  } catch (error) {
    console.error('Error fetching list details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch list details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const body = await req.json()

    const list = await prisma.list.findUnique({
      where: { id, userId: user.id },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const updatedList = await prisma.list.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
      },
    })

    return NextResponse.json(updatedList)
  } catch (error) {
    console.error('Error updating list:', error)
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params

    const list = await prisma.list.findUnique({
      where: { id, userId: user.id },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Deletes the list and cascades to ContactList join rows.
    // Does NOT delete the Contacts themselves.
    await prisma.list.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'List deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting list:', error)
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    )
  }
}
