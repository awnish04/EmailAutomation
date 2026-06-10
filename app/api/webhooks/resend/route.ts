import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
      console.warn('RESEND_WEBHOOK_SECRET is not set, skipping verification')
      // For production, you should throw here. We'll proceed for dev ease,
      // but in a real app this is a security risk.
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Verify signature if secret is present
    if (WEBHOOK_SECRET) {
      const headerPayload = await headers()
      
      // Resend uses Svix for webhooks, but they might send standard Svix headers 
      // OR a custom resend-signature. Resend officially says they use Svix headers.
      const svix_id = headerPayload.get('svix-id') || headerPayload.get('resend-webhook-id')
      const svix_timestamp = headerPayload.get('svix-timestamp') || headerPayload.get('resend-webhook-timestamp')
      const svix_signature = headerPayload.get('svix-signature') || headerPayload.get('resend-signature')

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Missing webhook signatures', { status: 400 })
      }

      const wh = new Webhook(WEBHOOK_SECRET)
      try {
        wh.verify(body, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        })
      } catch (err) {
        console.error('Error verifying Resend webhook:', err)
        return new Response('Invalid signature', { status: 400 })
      }
    }

    // Handle the webhook event
    const type = payload.type
    const data = payload.data

    if (!data?.email_id) {
      return new Response('OK', { status: 200 }) // Ignore malformed or irrelevant events
    }

    const messageId = data.email_id

    // Find the campaign contact by messageId
    const campaignContact = await prisma.campaignContact.findFirst({
      where: { messageId },
      include: {
        campaign: true,
      }
    })

    if (!campaignContact) {
      // Could be an email sent outside of a campaign (e.g. transactional reset password)
      return new Response('OK', { status: 200 })
    }

    const { campaignId, contactId } = campaignContact
    const userId = campaignContact.campaign.userId

    // Process based on event type
    switch (type) {
      case 'email.sent':
      case 'email.delivered':
        if (!campaignContact.sent) {
          await prisma.campaignContact.update({
            where: { id: campaignContact.id },
            data: { sent: true, sentAt: new Date(data.created_at) },
          })
        }
        break

      case 'email.opened':
        // Fallback server-side open tracking in case our pixel didn't fire
        if (!campaignContact.opened) {
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { totalOpened: { increment: 1 } },
          })
          await prisma.campaignContact.update({
            where: { id: campaignContact.id },
            data: { opened: true, openedAt: new Date(data.created_at) },
          })
          await prisma.emailEvent.create({
            data: {
              userId,
              contactId,
              campaignId,
              type: 'OPENED',
              messageId,
              metadata: { source: 'resend_webhook', ...data },
              occurredAt: new Date(data.created_at)
            },
          })
        }
        break

      case 'email.clicked':
        // Fallback server-side click tracking
        if (!campaignContact.clicked) {
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { totalClicked: { increment: 1 } },
          })
          await prisma.campaignContact.update({
            where: { id: campaignContact.id },
            data: { clicked: true, clickedAt: new Date(data.created_at) },
          })
          await prisma.emailEvent.create({
            data: {
              userId,
              contactId,
              campaignId,
              type: 'CLICKED',
              messageId,
              metadata: { source: 'resend_webhook', link: data.click?.url, ...data },
              occurredAt: new Date(data.created_at)
            },
          })
        }
        break

      case 'email.bounced':
        if (!campaignContact.bounced) {
          await prisma.campaignContact.update({
            where: { id: campaignContact.id },
            data: { bounced: true },
          })
          await prisma.contact.update({
            where: { id: contactId },
            data: { status: 'BOUNCED' },
          })
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { totalBounced: { increment: 1 } },
          })
          await prisma.emailEvent.create({
            data: {
              userId,
              contactId,
              campaignId,
              type: 'BOUNCED',
              messageId,
              metadata: { reason: data.bounce?.type, ...data },
              occurredAt: new Date(data.created_at)
            },
          })
        }
        break

      case 'email.complained':
        await prisma.contact.update({
          where: { id: contactId },
          data: { status: 'COMPLAINED' },
        })
        await prisma.emailEvent.create({
          data: {
            userId,
            contactId,
            campaignId,
            type: 'COMPLAINED',
            messageId,
            metadata: data,
            occurredAt: new Date(data.created_at)
          },
        })
        break

      // Handle custom unsubscribe via Resend subscription management (if configured)
      case 'email.unsubscribed':
        if (!campaignContact.unsubscribed) {
          await prisma.campaignContact.update({
            where: { id: campaignContact.id },
            data: { unsubscribed: true },
          })
          await prisma.contact.update({
            where: { id: contactId },
            data: { status: 'UNSUBSCRIBED' },
          })
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { totalUnsubscribed: { increment: 1 } },
          })
          await prisma.emailEvent.create({
            data: {
              userId,
              contactId,
              campaignId,
              type: 'UNSUBSCRIBED',
              messageId,
              metadata: data,
              occurredAt: new Date(data.created_at)
            },
          })
        }
        break
    }

    // Always return 200 so Resend knows we received it
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error processing Resend webhook:', error)
    // Return 200 even on error to prevent Resend from retrying endlessly if it's a code bug.
    // In a stricter system, you might return 500 to trigger Resend's backoff.
    return new Response('Processed with errors', { status: 200 })
  }
}
