import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireUser()
    const agents = await prisma.agent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(agents)
  } catch (error) {
    console.error("GET agents error:", error)
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const { name, description } = await req.json()
    
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    })
    return NextResponse.json(agent)
  } catch (error) {
    console.error("POST agents error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
