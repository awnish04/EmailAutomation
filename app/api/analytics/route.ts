/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(req.url)

    const range = searchParams.get("range") || "30d"
    const days = parseInt(range.replace("d", "")) || 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const previousPeriodStartDate = new Date(startDate)
    previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - days)

    // ── 1. Overview ──────────────────────────────────────────────────────────
    const totalContacts = await prisma.contact.count({
      where: { userId: user.id },
    })

    const contactsAddedThisPeriod = await prisma.contact.count({
      where: { userId: user.id, createdAt: { gte: startDate } },
    })

    const contactsAddedPreviousPeriod = await prisma.contact.count({
      where: {
        userId: user.id,
        createdAt: { gte: previousPeriodStartDate, lt: startDate },
      },
    })

    const contactsGrowth =
      contactsAddedPreviousPeriod === 0
        ? contactsAddedThisPeriod > 0
          ? 100
          : 0
        : ((contactsAddedThisPeriod - contactsAddedPreviousPeriod) /
            contactsAddedPreviousPeriod) *
          100

    // ── 2. Campaign totals ───────────────────────────────────────────────────
    const campaignsInRange = await prisma.campaign.findMany({
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
    })

    const emailsSent = campaignsInRange.reduce(
      (s: any, c: { totalSent: any }) => s + c.totalSent,
      0
    )
    const totalOpened = campaignsInRange.reduce(
      (s: any, c: { totalOpened: any }) => s + c.totalOpened,
      0
    )
    const totalClicked = campaignsInRange.reduce(
      (s: any, c: { totalClicked: any }) => s + c.totalClicked,
      0
    )
    const totalBounced = campaignsInRange.reduce(
      (s: any, c: { totalBounced: any }) => s + c.totalBounced,
      0
    )
    const totalUnsub = campaignsInRange.reduce(
      (s: any, c: { totalUnsubscribed: any }) => s + c.totalUnsubscribed,
      0
    )

    const avgOpenRate = emailsSent > 0 ? (totalOpened / emailsSent) * 100 : 0
    const avgClickRate = emailsSent > 0 ? (totalClicked / emailsSent) * 100 : 0
    const bounceRate = emailsSent > 0 ? (totalBounced / emailsSent) * 100 : 0
    const unsubscribeRate = emailsSent > 0 ? (totalUnsub / emailsSent) * 100 : 0

    // ── 3. Deliverability funnel ─────────────────────────────────────────────
    const deliverabilityFunnel = {
      sent: emailsSent,
      delivered: emailsSent - totalBounced,
      opened: totalOpened,
      clicked: totalClicked,
      bounced: totalBounced,
      unsubscribed: totalUnsub,
    }

    // ── 4. Emails by day ─────────────────────────────────────────────────────
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

    campaignsInRange.forEach((c) => {
      if (c.sentAt) {
        const key = c.sentAt.toISOString().split("T")[0]
        const e = emailsByDayMap.get(key)
        if (e) e.sent += c.totalSent
      }
    })

    const eventsInRange = await prisma.emailEvent.groupBy({
      by: ["type", "occurredAt"],
      where: {
        userId: user.id,
        occurredAt: { gte: startDate },
        type: { in: ["OPENED", "CLICKED"] },
      },
      _count: true,
    })

    eventsInRange.forEach((e) => {
      const key = e.occurredAt.toISOString().split("T")[0]
      const slot = emailsByDayMap.get(key)
      if (slot) {
        if (e.type === "OPENED") slot.opened += e._count
        if (e.type === "CLICKED") slot.clicked += e._count
      }
    })

    const emailsByDay = Array.from(emailsByDayMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // ── 5. Campaign performance table ────────────────────────────────────────
    const campaignPerformance = campaignsInRange.map((c) => ({
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

    // ── 6. Top clicked links ─────────────────────────────────────────────────
    const clickEvents = await prisma.emailEvent.findMany({
      where: {
        userId: user.id,
        type: "CLICKED",
        occurredAt: { gte: startDate },
      },
      select: { metadata: true },
      take: 500,
    })

    const linkCounts: Record<string, number> = {}
    clickEvents.forEach((e) => {
      const meta = e.metadata as { url?: string; link?: string } | null
      const url = meta?.url || meta?.link
      if (url && typeof url === "string") {
        linkCounts[url] = (linkCounts[url] || 0) + 1
      }
    })

    const topLinks = Object.entries(linkCounts)
      .map(([url, clicks]) => ({ url, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // ── 7. Contact growth by day ─────────────────────────────────────────────
    const contactsByDate = await prisma.contact.groupBy({
      by: ["createdAt"],
      where: { userId: user.id, createdAt: { gte: startDate } },
      _count: true,
    })

    const contactGrowthMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i + 1)
      contactGrowthMap.set(d.toISOString().split("T")[0], 0)
    }

    contactsByDate.forEach((c) => {
      const key = c.createdAt.toISOString().split("T")[0]
      const existing = contactGrowthMap.get(key)
      if (existing !== undefined) contactGrowthMap.set(key, existing + c._count)
    })

    const contactGrowth = Array.from(contactGrowthMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // ── 8. Automation stats ──────────────────────────────────────────────────
    const automations = await prisma.automation.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        totalEnrolled: true,
        totalCompleted: true,
        status: true,
      },
    })

    const automationStats = automations.map(
      (a: {
        id: any
        name: any
        status: any
        totalEnrolled: number
        totalCompleted: number
      }) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        enrolled: a.totalEnrolled,
        completed: a.totalCompleted,
        completionRate:
          a.totalEnrolled > 0 ? (a.totalCompleted / a.totalEnrolled) * 100 : 0,
      })
    )

    // ── 9. Send-time heatmap (opens by hour) ─────────────────────────────────
    const openEventsRaw = await prisma.emailEvent.findMany({
      where: {
        userId: user.id,
        type: "OPENED",
        occurredAt: { gte: startDate },
      },
      select: { occurredAt: true },
      take: 2000,
    })

    const heatmapByHour: Record<number, number> = {}
    for (let h = 0; h < 24; h++) heatmapByHour[h] = 0
    openEventsRaw.forEach((e: { occurredAt: string | number | Date }) => {
      const hour = new Date(e.occurredAt).getHours()
      heatmapByHour[hour] = (heatmapByHour[hour] ?? 0) + 1
    })

    const sendTimeHeatmap = Object.entries(heatmapByHour)
      .map(([hour, opens]) => ({ hour: parseInt(hour), opens }))
      .sort((a, b) => a.hour - b.hour)

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
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
      topLinks,
      contactGrowth,
      automationStats,
      deliverabilityFunnel,
      sendTimeHeatmap,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
