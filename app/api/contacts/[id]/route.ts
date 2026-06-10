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

    const contact = await prisma.contact.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        contactLists: {
          include: {
            list: true,
          },
        },
        campaignContacts: {
          include: {
            campaign: {
              select: {
                id: true,
                name: true,
                subject: true,
                status: true,
              },
            },
          },
          orderBy: {
            sentAt: 'desc',
          },
        },
        automationEnrollments: {
          include: {
            automation: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
          orderBy: {
            enrolledAt: 'desc',
          },
        },
        emailEvents: {
          orderBy: {
            occurredAt: 'desc',
          },
          take: 50,
        },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
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

    // Validate update fields (can use a partial of contactSchema if preferred)
    const updateData: any = {}
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.status !== undefined) updateData.status = body.status
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    // Ensure contact exists and belongs to user
    const existingContact = await prisma.contact.findUnique({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
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

    // Verify ownership before deleting
    const existingContact = await prisma.contact.findUnique({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Cascade delete handles related records
    await prisma.contact.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Contact deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
