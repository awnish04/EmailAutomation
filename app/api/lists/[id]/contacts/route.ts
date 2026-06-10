import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id: listId } = await params
    const body = await req.json()

    // Verify list belongs to user
    const list = await prisma.list.findUnique({
      where: { id: listId, userId: user.id },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    if (body.all) {
      // Add all active user contacts to the list
      const allContacts = await prisma.contact.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
        select: { id: true },
      })

      const data = allContacts.map((c) => ({
        contactId: c.id,
        listId,
      }))

      await prisma.contactList.createMany({
        data,
        skipDuplicates: true,
      })

      return NextResponse.json({
        message: `Added ${allContacts.length} contacts to list`,
        added: allContacts.length,
      })
    }

    if (!Array.isArray(body.contactIds) || body.contactIds.length === 0) {
      return NextResponse.json(
        { error: 'Must provide an array of contactIds or { all: true }' },
        { status: 400 }
      )
    }

    // Verify all contacts belong to user before adding
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: body.contactIds },
        userId: user.id,
      },
      select: { id: true },
    })

    const data = contacts.map((c) => ({
      contactId: c.id,
      listId,
    }))

    const result = await prisma.contactList.createMany({
      data,
      skipDuplicates: true,
    })

    return NextResponse.json({
      message: `Added ${result.count} contacts to list`,
      added: result.count,
    })
  } catch (error) {
    console.error('Error adding contacts to list:', error)
    return NextResponse.json(
      { error: 'Failed to add contacts to list' },
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
    const { id: listId } = await params
    const body = await req.json()

    if (!Array.isArray(body.contactIds) || body.contactIds.length === 0) {
      return NextResponse.json(
        { error: 'Must provide an array of contactIds' },
        { status: 400 }
      )
    }

    // Verify list belongs to user
    const list = await prisma.list.findUnique({
      where: { id: listId, userId: user.id },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const result = await prisma.contactList.deleteMany({
      where: {
        listId,
        contactId: { in: body.contactIds },
      },
    })

    return NextResponse.json({
      message: `Removed ${result.count} contacts from list`,
      removed: result.count,
    })
  } catch (error) {
    console.error('Error removing contacts from list:', error)
    return NextResponse.json(
      { error: 'Failed to remove contacts from list' },
      { status: 500 }
    )
  }
}
