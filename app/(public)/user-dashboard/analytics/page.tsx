/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AnalyticsClient } from "@/components/user-dashboard/analytics-client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export const dynamic = "force-dynamic"

// Explicit types so TypeScript doesn't fall back to `any` when
// Prisma's generated client isn't available at Vercel's type-check time.
type CampaignRow = {
  id: string
  name: string
  totalSent: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalUnsubscribed: number
  sentAt: Date | null
}

async function AnalyticsData({ range }: { range: string }) {
  const user = await requireUser()

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Total contacts
  const totalContacts = await prisma.contact.count({
    where: { userId: user.id },
  })

  // Contacts in previous period for growth comparison
  const prevStart = new Date(startDate)
  prevStart.setDate(prevStart.getDate() - days)
  const prevContacts = await prisma.contact.count({
    where: { userId: user.id, createdAt: { gte: prevStart, lt: startDate } },
  })
  const newContactsInRange = await prisma.contact.count({
    where: { userId: user.id, createdAt: { gte: startDate } },
  })
  const contactsGrowth =
    prevContacts === 0
      ? newContactsInRange > 0
        ? 100
        : 0
      : Math.round(((newContactsInRange - prevContacts) / prevContacts) * 100)

  // Campaigns in period — cast to CampaignRow[] so reduce parameters are typed
  const campaigns = (await prisma.campaign.findMany({
    where: { userId: user.id, sentAt: { gte: startDate } },
    select: {
      id: true,
      name: true,
      totalSent: true,
      totalOpened: true,
      totalClicked: true,
      totalBounced: true,
      totalUnsubscribed: true,
      sentAt: true,
    },
    orderBy: { sentAt: "desc" },
  })) as CampaignRow[]

  const emailsSent = campaigns.reduce(
    (s: number, c: CampaignRow) => s + c.totalSent,
    0
  )
  const totalOpened = campaigns.reduce(
    (s: number, c: CampaignRow) => s + c.totalOpened,
    0
  )
  const totalClicked = campaigns.reduce(
    (s: number, c: CampaignRow) => s + c.totalClicked,
    0
  )
  const totalBounced = campaigns.reduce(
    (s: number, c: CampaignRow) => s + c.totalBounced,
    0
  )
  const totalUnsub = campaigns.reduce(
    (s: number, c: CampaignRow) => s + c.totalUnsubscribed,
    0
  )

  const avgOpenRate = emailsSent > 0 ? (totalOpened / emailsSent) * 100 : 0
  const avgClickRate = emailsSent > 0 ? (totalClicked / emailsSent) * 100 : 0
  const bounceRate = emailsSent > 0 ? (totalBounced / emailsSent) * 100 : 0
  const unsubscribeRate = emailsSent > 0 ? (totalUnsub / emailsSent) * 100 : 0

  // Emails by day
  const emailsByDayMap = new Map<
    string,
    { sent: number; opened: number; clicked: number }
  >()
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i + 1)
    emailsByDayMap.set(d.toISOString().split("T")[0], {
      sent: 0,
      opened: 0,
      clicked: 0,
    })
  }
  campaigns.forEach((c: CampaignRow) => {
    if (c.sentAt) {
      const key = c.sentAt.toISOString().split("T")[0]
      const e = emailsByDayMap.get(key)
      if (e) e.sent += c.totalSent
    }
  })
  const events = await prisma.emailEvent.groupBy({
    by: ["type", "occurredAt"],
    where: {
      userId: user.id,
      occurredAt: { gte: startDate },
      type: { in: ["OPENED", "CLICKED"] },
    },
    _count: true,
  })
  events.forEach((e: any) => {
    const key = e.occurredAt.toISOString().split("T")[0]
    const existing = emailsByDayMap.get(key)
    if (existing) {
      
      if (e.type === "OPENED") existing.opened += e._count
      if (e.type === "CLICKED") existing.clicked += e._count
    }
  })
  const emailsByDay = Array.from(emailsByDayMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Campaign performance table
  const campaignPerformance = campaigns.map((c: CampaignRow) => ({
    id: c.id,
    name: c.name,
    sent: c.totalSent,
    opened: c.totalOpened,
    clicked: c.totalClicked,
    bounced: c.totalBounced,
    openRate: c.totalSent > 0 ? (c.totalOpened / c.totalSent) * 100 : 0,
    clickRate: c.totalSent > 0 ? (c.totalClicked / c.totalSent) * 100 : 0,
    sentAt: c.sentAt?.toISOString() ?? null,
  }))

  // Top clicked links — REMOVED

  // Contact growth by day
  const contactGrowthRaw = await prisma.contact.groupBy({
    by: ["createdAt"],
    where: { userId: user.id, createdAt: { gte: startDate } },
    _count: { id: true },
  })
  const contactGrowthMap = new Map<string, number>()
  contactGrowthRaw.forEach((r: { createdAt: Date; _count: { id: number } }) => {
    const key = new Date(r.createdAt).toISOString().split("T")[0]
    contactGrowthMap.set(key, (contactGrowthMap.get(key) ?? 0) + r._count.id)
  })
  const contactGrowth = Array.from(contactGrowthMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Automation stats — REMOVED

  const activeAutomations = 0

  // Send-time heatmap: group by hour of day
  const heatmapEvents = await prisma.emailEvent.findMany({
    where: { userId: user.id, type: "OPENED", occurredAt: { gte: startDate } },
    select: { occurredAt: true },
    take: 2000,
  })
  const heatmapByHour: Record<number, number> = {}
  for (let h = 0; h < 24; h++) heatmapByHour[h] = 0
  heatmapEvents.forEach((e: { occurredAt: Date }) => {
    const hour = new Date(e.occurredAt).getHours()
    heatmapByHour[hour] = (heatmapByHour[hour] ?? 0) + 1
  })
  const sendTimeHeatmap = Object.entries(heatmapByHour).map(
    ([hour, opens]) => ({
      hour: parseInt(hour),
      opens,
    })
  )

  // Deliverability funnel: Sent → Delivered → Opened → Clicked
  const deliverabilityFunnel = {
    sent: emailsSent,
    delivered: emailsSent - totalBounced,
    opened: totalOpened,
    clicked: totalClicked,
    bounced: totalBounced,
    unsubscribed: totalUnsub,
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-full"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <AnalyticsClient
        initialData={{
          overview: {
            totalContacts,
            contactsGrowth,
            emailsSent,
            avgOpenRate,
            avgClickRate,
            bounceRate,
            unsubscribeRate,
          },
          emailsByDay,
          campaignPerformance,
          contactGrowth,
          deliverabilityFunnel,
          sendTimeHeatmap,
        }}
        initialRange={range}
        activeAutomations={activeAutomations}
      />
    </>
  )
}

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      }
    >
      <AnalyticsPageInner searchParams={searchParams} />
    </Suspense>
  )
}

async function AnalyticsPageInner({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const range = params.range ?? "30d"
  return <AnalyticsData range={range} />
}
