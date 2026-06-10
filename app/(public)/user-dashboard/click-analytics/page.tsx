/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ClickAnalyticsClient } from "@/components/user-dashboard/click-analytics-client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export const dynamic = "force-dynamic"

async function ClickAnalyticsData() {
  const user = await requireUser()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Fetch click events
  const clickEvents = await prisma.emailEvent.findMany({
    where: {
      userId: user.id,
      type: "CLICKED",
      occurredAt: { gte: thirtyDaysAgo },
    },
    select: { occurredAt: true, metadata: true },
    orderBy: { occurredAt: "asc" },
  })

  // Aggregate by date
  const clicksByDayMap = new Map<string, number>()
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(d.getDate() + i + 1)
    clicksByDayMap.set(
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      0
    )
  }

  const linkCounts = new Map<string, number>()

  clickEvents.forEach((e: (typeof clickEvents)[0]) => {
    // Chart data
    const dateStr = e.occurredAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    if (clicksByDayMap.has(dateStr)) {
      clicksByDayMap.set(dateStr, (clicksByDayMap.get(dateStr) || 0) + 1)
    }

    // Link counts
    const url = (e.metadata as any)?.url
    if (url && typeof url === "string") {
      linkCounts.set(url, (linkCounts.get(url) ?? 0) + 1)
    }
  })

  const clickData = Array.from(clicksByDayMap.entries()).map(
    ([date, clicks]) => ({ date, clicks })
  )

  const topLinks = Array.from(linkCounts.entries())
    .map(([url, clicks]) => ({ url, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  return <ClickAnalyticsClient clickData={clickData} topLinks={topLinks} />
}

export default function ClickAnalyticsPage() {
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
              <BreadcrumbPage>Click Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="mx-auto max-w-5xl p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Click Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See which links in your emails get the most clicks over the last 30
            days.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          }
        >
          <ClickAnalyticsData />
        </Suspense>
      </main>
    </>
  )
}
