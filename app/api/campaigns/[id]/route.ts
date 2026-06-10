import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        list: { select: { id: true, name: true } },
        segment: { select: { id: true, name: true } },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get basic stats summary from CampaignContact
    const stats = await prisma.campaignContact.groupBy({
      by: ['sent', 'opened', 'clicked', 'bounced', 'unsubscribed'],
      where: { campaignId: id },
      _count: true,
    })

    // This gives detailed numbers of how many exact combinations exist.
    // The top-level campaign model also holds aggregate totals for performance.
    
    return NextResponse.json({
      campaign,
      detailedStats: stats,
    })
  } catch (error) {
    console.error('Error fetching campaign details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const body = await req.json()

    const campaign = await prisma.campaign.findUnique({
      where: { id, userId: user.id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Build update payload — only include defined fields
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.subject !== undefined) updateData.subject = body.subject
    if (body.htmlContent !== undefined) updateData.htmlContent = body.htmlContent
    if (body.fromName !== undefined) updateData.fromName = body.fromName
    if (body.fromEmail !== undefined) updateData.fromEmail = body.fromEmail
    if (body.listId !== undefined) updateData.listId = body.listId
    if (body.segmentId !== undefined) updateData.segmentId = body.segmentId
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.scheduledAt

    // Allow explicit status override (for launching)
    if (body.status && ['DRAFT', 'SCHEDULED', 'SENDING', 'CANCELLED'].includes(body.status)) {
      updateData.status = body.status
      if (body.status === 'SENDING') {
        updateData.sentAt = new Date()
      }
    } else if (body.scheduledAt) {
      updateData.status = 'SCHEDULED'
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id, userId: user.id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft campaigns can be deleted' },
        { status: 400 }
      )
    }

    await prisma.campaign.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Campaign deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
