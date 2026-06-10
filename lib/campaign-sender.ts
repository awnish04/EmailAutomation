import { prisma } from '@/lib/prisma'
import { sendBulkEmails, injectTracking, BulkEmailItem } from '@/lib/resend'
import { getContactsInSegment } from '@/lib/segment-evaluator'
import { Contact } from '@prisma/client'

export async function sendCampaign(campaignId: string, userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // 1. Check campaign status
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, userId: userId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
    throw new Error('Only DRAFT or SCHEDULED campaigns can be sent')
  }

  if (!campaign.listId && !campaign.segmentId) {
    throw new Error('Campaign must have a target list or segment before sending')
  }

  // 2. Get recipients
  let recipients: Contact[] = []

  if (campaign.listId) {
    const contactLists = await prisma.contactList.findMany({
      where: {
        listId: campaign.listId,
        contact: {
          status: 'ACTIVE',
        }
      },
      include: {
        contact: true,
      }
    })
    recipients = contactLists.map(cl => cl.contact)
  } else if (campaign.segmentId) {
    recipients = await getContactsInSegment(userId, campaign.segmentId)
  }

  if (recipients.length === 0) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'CANCELLED',
        sentAt: new Date(),
        totalSent: 0,
      },
    })
    console.warn(`[CampaignSender] Campaign ${campaignId}: No active recipients found. Marked as CANCELLED.`)
    return { total: 0, sent: 0, failed: 0, results: [] }
  }

  // 3. Check user email quota
  const planLimits = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, emailsSentThisMonth: true },
  })
  
  // Limits based on lib/auth.ts
  const limitMap: Record<string, number> = { FREE: 1000, PRO: 50000, BUSINESS: 500000 }
  const maxEmails = limitMap[planLimits!.plan]
  
  if (planLimits!.emailsSentThisMonth + recipients.length > maxEmails) {
    throw new Error(`Sending this campaign would exceed your monthly limit of ${maxEmails} emails.`)
  }

  // 4. Set campaign status to SENDING
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING' },
  })

  // 5. Process recipients and prepare emails
  const bulkEmails: BulkEmailItem[] = []
  
  for (const recipient of recipients) {
    let html = campaign.htmlContent
    
    html = html.replace(/{{first_name}}/gi, recipient.firstName || '')
    html = html.replace(/{{last_name}}/gi, recipient.lastName || '')
    html = html.replace(/{{email}}/gi, recipient.email)
    
    const unsubLink = `${baseUrl}/unsubscribe?c=${campaignId}&ct=${recipient.id}`
    html = html.replace(/{{unsubscribe_link}}/gi, unsubLink)
    
    html = injectTracking(html, campaignId, recipient.id, baseUrl)

    // Always send from the verified Resend domain, using the campaign's display name
    const verifiedDomain = process.env.RESEND_DOMAIN || 'aiemailmarkeing.com'
    const fromAddress = `${campaign.fromName} <noreply@${verifiedDomain}>`

    bulkEmails.push({
      to: recipient.email,
      from: fromAddress,
      subject: campaign.subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubLink}>`,
        'Reply-To': campaign.fromEmail, // replies go to the actual user email
      }
    })
  }

  // c. Send via Resend
  const sendResult = await sendBulkEmails(bulkEmails)

  // d. Create CampaignContact records based on results
  const campaignContactData = recipients.map(recipient => {
    const resultForRecipient = sendResult.results.find(r => r.to === recipient.email)
    const isSent = !!resultForRecipient?.messageId
    
    return {
      campaignId: campaignId,
      contactId: recipient.id,
      sent: isSent,
      sentAt: isSent ? new Date() : null,
      messageId: resultForRecipient?.messageId || null,
    }
  })

  // We only create CampaignContacts that haven't been created yet. 
  // Wait, in launch/route.ts we already created CampaignContact records! 
  // Let's UPDATE existing CampaignContact records instead of creating new ones if they already exist.
  // We can do this with Promise.all and updateMany/update.
  
  await Promise.all(campaignContactData.map(async (data) => {
    const existing = await prisma.campaignContact.findFirst({
      where: { campaignId: data.campaignId, contactId: data.contactId }
    })
    if (existing) {
      await prisma.campaignContact.update({
        where: { id: existing.id },
        data: {
          sent: data.sent,
          sentAt: data.sentAt,
          messageId: data.messageId
        }
      })
    } else {
      await prisma.campaignContact.create({
        data
      })
    }
  }))

  // 6. Set campaign status to SENT and update totals
  // Always mark as SENT so the dashboard reflects the attempt
  const totalSentNow = sendResult.sent
  const totalFailedNow = sendResult.failed
  
  if (totalFailedNow > 0) {
    console.warn(`[CampaignSender] Campaign ${campaignId}: ${totalSentNow} sent, ${totalFailedNow} failed. Check Resend domain verification.`)
  }
  
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      totalSent: totalSentNow,
    },
  })

  // 7. Increment user.emailsSentThisMonth
  if (totalSentNow > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailsSentThisMonth: { increment: totalSentNow }
      }
    })
  }

  return {
    sent: sendResult.sent,
    failed: sendResult.failed,
  }
}
