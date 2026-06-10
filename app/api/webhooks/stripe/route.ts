import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, PLANS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { Plan } from '@prisma/client'

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Stripe Webhook signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        const userId = session.metadata?.userId
        const planStr = session.metadata?.plan as Plan

        if (!userId || !planStr) {
          throw new Error('Missing metadata in checkout session')
        }

        const customerId = typeof session.customer === 'string' 
          ? session.customer 
          : session.customer?.id

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id

        if (!customerId || !subscriptionId) {
          throw new Error('Missing customer or subscription ID in session')
        }

        // Update user to the new plan and save Stripe IDs
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: planStr,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        })

        console.log(`User ${userId} upgraded to ${planStr}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id

        if (!customerId) throw new Error('Missing customer ID')

        // If payment fails or subscription is paused
        if (subscription.status === 'past_due' || subscription.status === 'unpaid' || subscription.status === 'canceled') {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: 'FREE' },
          })
          console.log(`Downgraded customer ${customerId} to FREE (status: ${subscription.status})`)
          break
        }

        // Subscription is active. Check which plan price they are on.
        if (subscription.status === 'active') {
          const priceId = subscription.items.data[0]?.price.id
          
          let updatedPlan: Plan = 'FREE'
          if (priceId === PLANS.PRO.priceId) updatedPlan = 'PRO'
          if (priceId === PLANS.BUSINESS.priceId) updatedPlan = 'BUSINESS'

          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: updatedPlan },
          })
          console.log(`Customer ${customerId} plan synced to ${updatedPlan}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id

        if (!customerId) throw new Error('Missing customer ID')

        // Downgrade to free, but keep the customer ID so they can easily resubscribe later
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { 
            plan: 'FREE',
            stripeSubscriptionId: null,
          },
        })

        console.log(`Subscription deleted. Downgraded customer ${customerId} to FREE`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('Webhook processed successfully', { status: 200 })
  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error)
    // We return 500 here so Stripe knows it failed and will retry
    return new Response('Webhook handler failed', { status: 500 })
  }
}
