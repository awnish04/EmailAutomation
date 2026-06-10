/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser, checkLimit } from "@/lib/auth"
import { contactSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(req.url)

    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Filters
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const tag = searchParams.get("tag")
    const listId = searchParams.get("listId")

    const where: {
      userId: string
      OR?: { email?: any; firstName?: any; lastName?: any }[]
      status?: any
      tags?: { has: string }
      contactLists?: { some: { listId: string } }
    } = {
      userId: user.id,
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status) {
      where.status = status as any
    }

    if (tag) {
      where.tags = {
        has: tag,
      }
    }

    if (listId) {
      where.contactLists = {
        some: {
          listId,
        },
      }
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.count({ where }),
    ])

    return NextResponse.json({
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()

    const body = await req.json()
    const listId = body.listId
    delete body.listId

    const validatedData = contactSchema.parse(body)

    // Check contact limits
    const limitCheck = await checkLimit("contacts")
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error:
            "Contact limit exceeded for your current plan. Please upgrade to add more contacts.",
        },
        { status: 403 }
      )
    }

    // Check if email already exists for this user
    const existingContact = await prisma.contact.findUnique({
      where: {
        userId_email: {
          userId: user.id,
          email: validatedData.email,
        },
      },
    })

    if (existingContact) {
      return NextResponse.json(
        { error: "A contact with this email already exists" },
        { status: 409 }
      )
    }

    // Create the contact
    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        userId: user.id,
        source: "api", // Or 'form' etc.
        contactLists: listId
          ? {
              create: {
                listId,
              },
            }
          : undefined,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error: any) {
    console.error("Error creating contact:", error)
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
}
