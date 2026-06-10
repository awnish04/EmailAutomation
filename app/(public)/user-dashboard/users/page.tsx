/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ContactsClient } from "@/components/user-dashboard/contacts-client"

export const dynamic = "force-dynamic"

async function ContactsData({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await requireUser()

  // Parse initial search params for SSR
  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1
  const limit =
    typeof searchParams.limit === "string" ? parseInt(searchParams.limit) : 50
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined
  const status =
    typeof searchParams.status === "string" && searchParams.status !== "all"
      ? searchParams.status
      : undefined
  const listId =
    typeof searchParams.listId === "string" && searchParams.listId !== "all"
      ? searchParams.listId
      : undefined

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = { userId: user.id }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ]
  }

  if (status) {
    where.status = status
  }

  if (listId) {
    where.contactLists = {
      some: { listId },
    }
  }

  // Fetch parallel data
  const [contacts, total, lists, rawTags, statusCounts] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        tags: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.contact.count({ where }),
    prisma.list.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.contact.findMany({
      where: { userId: user.id },
      select: { tags: true },
    }),
    prisma.contact.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { id: true },
    }),
  ])

  // Aggregate unique tags efficiently
  const uniqueTags = new Set<string>()
  rawTags.forEach((c: { tags: string[] }) =>
    c.tags.forEach((t) => uniqueTags.add(t))
  )

  // Build contact stats
  const statusMap = Object.fromEntries(
    statusCounts.map((s: { status: string; _count: { id: number } }) => [
      s.status,
      s._count.id,
    ])
  )
  const contactStats = {
    active: statusMap["ACTIVE"] ?? 0,
    unsubscribed: statusMap["UNSUBSCRIBED"] ?? 0,
    bounced: statusMap["BOUNCED"] ?? 0,
    complained: statusMap["COMPLAINED"] ?? 0,
  }

  // Convert dates to strings for Client Component serialization
  const serializedContacts = contacts.map(
    (c: { createdAt: Date } & Record<string, any>) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })
  ) as any[]

  return (
    <ContactsClient
      initialContacts={serializedContacts}
      initialTotal={total}
      lists={lists}
      allTags={Array.from(uniqueTags).sort()}
      contactStats={contactStats}
    />
  )
}

export default function ContactsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      }
    >
      <ContactsData searchParams={searchParams} />
    </Suspense>
  )
}
