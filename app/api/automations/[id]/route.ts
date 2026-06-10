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

    const automation = await prisma.automation.findUnique({
      where: { id, userId: user.id },
    })

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    const stats = await prisma.automationEnrollment.groupBy({
      by: ['status'],
      where: { automationId: id },
      _count: true,
    })

    return NextResponse.json({
      automation,
      enrollmentStats: stats,
    })
  } catch (error) {
    console.error('Error fetching automation details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automation details' },
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

    const automation = await prisma.automation.findUnique({
      where: { id, userId: user.id },
    })

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    if (automation.status === 'ACTIVE' && body.steps) {
      return NextResponse.json(
        { error: 'Cannot modify steps of an active automation. Pause it first.' },
        { status: 400 }
      )
    }

    const updatedAutomation = await prisma.automation.update({
      where: { id },
      data: {
        name: body.name,
        trigger: body.trigger,
        steps: body.steps,
        status: body.status,
      },
    })

    return NextResponse.json(updatedAutomation)
  } catch (error) {
    console.error('Error updating automation:', error)
    return NextResponse.json(
      { error: 'Failed to update automation' },
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

    const automation = await prisma.automation.findUnique({
      where: { id, userId: user.id },
    })

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    // Cancel all active enrollments before deleting
    await prisma.automationEnrollment.updateMany({
      where: { automationId: id, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    })

    await prisma.automation.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Automation deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting automation:', error)
    return NextResponse.json(
      { error: 'Failed to delete automation' },
      { status: 500 }
    )
  }
}
