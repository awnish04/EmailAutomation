import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, getUserPlan } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()

    const automations = await prisma.automation.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(automations)
  } catch (error) {
    console.error('Error fetching automations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    
    const planDetails = await getUserPlan()
    if (!planDetails || !planDetails.hasAutomations) {
      return NextResponse.json(
        { error: 'Automations are not available on your current plan. Please upgrade to Pro or Business.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, trigger, steps } = body

    if (!name || !trigger || !steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: 'Invalid automation payload. Requires name, trigger, and at least one step.' },
        { status: 400 }
      )
    }

    const automation = await prisma.automation.create({
      data: {
        name,
        trigger,
        steps,
        userId: user.id,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(automation, { status: 201 })
  } catch (error) {
    console.error('Error creating automation:', error)
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    )
  }
}
