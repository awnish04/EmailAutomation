import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { listSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()

    const lists = await prisma.list.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(lists)
  } catch (error) {
    console.error('Error fetching lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const validatedData = listSchema.parse(body)

    const list = await prisma.list.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error: any) {
    console.error('Error creating list:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    )
  }
}
