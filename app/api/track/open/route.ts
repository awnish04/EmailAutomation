import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// 1x1 transparent GIF
const pixel = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // In our injectTracking we used 'cid' and 'ctid'
    const campaignId = searchParams.get('cid') || searchParams.get('campaignId')
    const contactId = searchParams.get('ctid') || searchParams.get('contactId')
    const messageId = searchParams.get('mid')

    if (!campaignId || !contactId) {
      return new Response(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { userId: true },
    })

    if (!campaign) {
      return new Response(pixel, { headers: { 'Content-Type': 'image/gif' } })
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    const userAgent = req.headers.get('user-agent')

    // Find the campaign contact
    const campaignContact = await prisma.campaignContact.findFirst({
      where: {
        campaignId,
        contactId,
      },
    })

    if (campaignContact) {
      // If this is the first open, update campaign aggregate
      if (!campaignContact.opened) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { totalOpened: { increment: 1 } },
        })

        // Mark contact as opened
        await prisma.campaignContact.update({
          where: { id: campaignContact.id },
          data: {
            opened: true,
            openedAt: new Date(),
          },
        })
      }

      // Always create an EmailEvent for every open (allows tracking multiple opens)
      await prisma.emailEvent.create({
        data: {
          userId: campaign.userId,
          contactId,
          campaignId,
          type: 'OPENED',
          messageId,
          metadata: { ip, userAgent },
        },
      })
    }

  } catch (error) {
    console.error('Error tracking open:', error)
    // Always return the pixel even if DB fails, to not break the client experience
  }

  return new Response(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
