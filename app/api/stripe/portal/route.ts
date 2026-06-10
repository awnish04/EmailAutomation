/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { createPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()

    // Fetch user directly from DB to get the Stripe Customer ID
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true }
    })

    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe to a plan first.' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/user-dashboard/settings`

    const session = await createPortalSession(
      dbUser.stripeCustomerId,
      returnUrl
    )

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Error creating Stripe portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
