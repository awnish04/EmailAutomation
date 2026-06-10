import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { sendCampaign } from '@/lib/campaign-sender'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await requireUser()

    const result = await sendCampaign(id, user.id)

    return NextResponse.json({
      message: 'Campaign sent successfully',
      sent: result.sent,
      failed: result.failed,
      campaignId: id,
    })

  } catch (error: any) {
    console.error('Error sending campaign:', error)
    
    // Try to reset status if it failed catastrophically
    try {
      await prisma.campaign.update({
        where: { id },
        data: { status: 'DRAFT' } // Revert to draft so user can try again
      })
    } catch (e) {
      // Ignore inner error
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send campaign' },
      { status: 400 }
    )
  }
}
