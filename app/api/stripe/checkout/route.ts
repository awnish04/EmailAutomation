/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createCheckoutSession, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const { plan } = await req.json()

    if (!plan || (plan !== 'PRO' && plan !== 'BUSINESS')) {
      return NextResponse.json(
        { error: 'Valid plan (PRO or BUSINESS) is required' },
        { status: 400 }
      )
    }

    const planConfig = PLANS[plan as keyof typeof PLANS]
    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: `Price ID for ${plan} is not configured on the server` },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // We pass baseUrl and standard paths, but handle success/cancel logic
    // through the createCheckoutSession helper which will append ?success or ?canceled
    const session = await createCheckoutSession(
      user.id,
      plan as 'PRO' | 'BUSINESS',
      `${baseUrl}/user-dashboard/settings` // Success redirects to settings
    )

    // Optional override for cancel URL if needed (the lib defaults both to the same base, 
    // let's assume the helper is fine, or we can just send the session URL)
    
    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
