/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { campaignSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    const status = searchParams.get('status')

    const where: any = { userId: user.id }
    if (status) {
      where.status = status
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          list: { select: { id: true, name: true } },
          segment: { select: { id: true, name: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ])

    // Calculate dynamic stats
    const campaignsWithStats = campaigns.map((campaign: { totalSent: number; totalOpened: number; totalClicked: number }) => {
      const openRate = campaign.totalSent > 0 
        ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1) 
        : '0.0'
      const clickRate = campaign.totalSent > 0 
        ? ((campaign.totalClicked / campaign.totalSent) * 100).toFixed(1) 
        : '0.0'

      return {
        ...campaign,
        stats: {
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
        }
      }
    })

    return NextResponse.json({
      campaigns: campaignsWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const validatedData = campaignSchema.parse(body)

    const campaign = await prisma.campaign.create({
      data: {
        ...validatedData,
        userId: user.id,
        status: validatedData.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
