import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const { contactId } = await req.json()

    if (!contactId) {
      return NextResponse.json(
        { error: 'contactId is required' },
        { status: 400 }
      )
    }

    const automation = await prisma.automation.findUnique({
      where: { id, userId: user.id },
    })

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    if (automation.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot enroll contacts in a non-active automation' },
        { status: 400 }
      )
    }

    const steps = automation.steps as any[]
    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Automation has no steps' },
        { status: 400 }
      )
    }

    // Verify contact belongs to user
    const contact = await prisma.contact.findUnique({
      where: { id: contactId, userId: user.id },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Check if already enrolled and active
    const existingEnrollment = await prisma.automationEnrollment.findFirst({
      where: {
        automationId: id,
        contactId,
        status: 'ACTIVE',
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Contact is already actively enrolled in this automation' },
        { status: 409 }
      )
    }

    // Create the enrollment
    const enrollment = await prisma.automationEnrollment.create({
      data: {
        automationId: id,
        contactId,
        currentStepId: steps[0].id,
        status: 'ACTIVE',
        stepHistory: [],
      },
    })

    // Increment automation totals
    await prisma.automation.update({
      where: { id },
      data: { totalEnrolled: { increment: 1 } },
    })

    // Trigger execution asynchronously
    // In production, this should ideally be pushed to a queue (like QStash or SQS)
    // For now, we do a fire-and-forget fetch to our execute endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    fetch(`${baseUrl}/api/automations/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass a secret token here if protecting the internal API
      },
      body: JSON.stringify({ enrollmentId: enrollment.id }),
    }).catch(console.error)

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Error enrolling contact:', error)
    return NextResponse.json(
      { error: 'Failed to enroll contact' },
      { status: 500 }
    )
  }
}
