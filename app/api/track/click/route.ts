import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  
  const campaignId = searchParams.get('cid') || searchParams.get('campaignId')
  const contactId = searchParams.get('ctid') || searchParams.get('contactId')
  const encodedUrl = searchParams.get('url')
  const messageId = searchParams.get('mid')

  // Default redirect if parsing fails
  const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!encodedUrl) {
    return NextResponse.redirect(fallbackUrl)
  }

  // Decode the destination URL
  let decodedUrl = fallbackUrl
  try {
    // Handling case where url is passed directly vs base64 encoded
    // The prompt specified base64, but standard injectTracking just passed it raw (encodedURIComponent)
    // We'll support both for robustness.
    if (encodedUrl.startsWith('http')) {
      decodedUrl = encodedUrl
    } else {
      decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf8')
    }
  } catch (e) {
    console.error('Failed to decode URL', e)
    return NextResponse.redirect(fallbackUrl)
  }

  // If no identifiers, just redirect
  if (!campaignId || !contactId) {
    return NextResponse.redirect(decodedUrl)
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { userId: true },
    })

    if (!campaign) {
      return NextResponse.redirect(decodedUrl)
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    const userAgent = req.headers.get('user-agent')

    const campaignContact = await prisma.campaignContact.findFirst({
      where: {
        campaignId,
        contactId,
      },
    })

    if (campaignContact) {
      // If first click, update aggregate
      if (!campaignContact.clicked) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { totalClicked: { increment: 1 } },
        })

        await prisma.campaignContact.update({
          where: { id: campaignContact.id },
          data: {
            clicked: true,
            clickedAt: new Date(),
          },
        })
      }

      // Record the specific click event
      await prisma.emailEvent.create({
        data: {
          userId: campaign.userId,
          contactId,
          campaignId,
          type: 'CLICKED',
          messageId,
          metadata: { 
            link: decodedUrl,
            ip, 
            userAgent 
          },
        },
      })
    }
  } catch (error) {
    console.error('Error tracking click:', error)
    // Always redirect even if DB tracking fails
  }

  return NextResponse.redirect(decodedUrl)
}
