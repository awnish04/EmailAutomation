import Stripe from 'stripe'
import type { Plan } from '@prisma/client'
import { prisma } from './prisma'

// ─── Singleton ──────────────────────────────────────────────────────────────

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined
}

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
    apiVersion: '2026-04-22.dahlia' as any,
    typescript: true,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForStripe.stripe = stripe
}

// ─── Plans ──────────────────────────────────────────────────────────────────

export interface PlanConfig {
  priceId: string | null
  price: number
  name: string
  description: string
}

export const PLANS: Record<Plan, PlanConfig> = {
  FREE: {
    priceId: null,
    price: 0,
    name: 'Free',
    description: '500 contacts, 1,000 emails/month',
  },
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    price: 29,
    name: 'Pro',
    description: '10,000 contacts, 50,000 emails/month, automations',
  },
  BUSINESS: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? '',
    price: 99,
    name: 'Business',
    description: 'Unlimited contacts, 500,000 emails/month, automations',
  },
}

// ─── Checkout Session ───────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout session for upgrading to a paid plan.
 */
export async function createCheckoutSession(
  userId: string,
  plan: 'PRO' | 'BUSINESS',
  returnUrl: string
) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  })

  const planConfig = PLANS[plan]
  if (!planConfig.priceId) {
    throw new Error(`No price ID configured for plan: ${plan}`)
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?success=true&plan=${plan}`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: {
      userId: user.id,
      plan,
    },
  }

  // Reuse existing Stripe customer if available
  if (user.stripeCustomerId) {
    sessionParams.customer = user.stripeCustomerId
  } else {
    sessionParams.customer_email = user.email
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  return {
    sessionId: session.id,
    url: session.url,
  }
}

// ─── Customer Portal ────────────────────────────────────────────────────────

/**
 * Create a Stripe Customer Portal session for managing subscriptions.
 */
export async function createPortalSession(
  stripeCustomerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  })

  return {
    url: session.url,
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Sync a Stripe subscription status to the database.
 */
export async function syncSubscription(
  stripeCustomerId: string,
  stripeSubscriptionId: string | null,
  plan: Plan
) {
  await prisma.user.updateMany({
    where: { stripeCustomerId },
    data: {
      plan,
      stripeSubscriptionId,
    },
  })
}
