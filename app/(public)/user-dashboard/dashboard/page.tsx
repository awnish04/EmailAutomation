import { Suspense } from "react"
import {
  Search,
  Mail,
  CornerDownLeft,
  Zap,
  Users,
  MousePointerClick,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card } from "@/components/ui/card"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardCharts } from "@/components/user-dashboard/dashboard-charts"

// Auto-revalidate every 30 seconds so stats update after campaigns complete
export const revalidate = 30

export default async function DashboardPage() {
  const user = await requireUser()

  // ── Stats ──────────────────────────────────────────────────────────────
  const [totalContacts, recentCampaignsRaw, eventsList] = await Promise.all([
    prisma.contact.count({ where: { userId: user.id } }),
    prisma.campaign.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        totalSent: true,
        totalOpened: true,
      },
    }),
    prisma.emailEvent.count({
      where: { userId: user.id, type: "CLICKED" }, // Mocking replied with clicked for now
    }),
  ])

  const totalSent = recentCampaignsRaw.reduce<number>(
    (s: number, c: { totalSent: number }) => s + c.totalSent,
    0
  )
  const totalOpened = recentCampaignsRaw.reduce<number>(
    (s: number, c: { totalOpened: number }) => s + c.totalOpened,
    0
  )
  const totalReplied = eventsList

  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
  const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0

  // ── Chart Data (Last 14 Days) ──────────────────────────────────────────
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const chartCampaigns = await prisma.campaign.findMany({
    where: {
      userId: user.id,
      sentAt: { gte: fourteenDaysAgo },
    },
    select: { sentAt: true, totalSent: true, totalOpened: true },
  })

  // Create an array of the last 14 days with zeroed values
  const chartData: {
    dateStr: string
    date: string
    sent: number
    opened: number
  }[] = []
  const today = new Date()
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    chartData.push({
      dateStr: d.toDateString(),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sent: 0,
      opened: 0,
    })
  }

  // Populate data
  chartCampaigns.forEach((c: typeof chartCampaigns[number]) => {
    if (!c.sentAt) return
    const cDateStr = c.sentAt.toDateString()
    const bucket = chartData.find((b) => b.dateStr === cDateStr)
    if (bucket) {
      bucket.sent += c.totalSent
      bucket.opened += c.totalOpened
    }
  })

  // ── Pipeline Data ───────────────────────────────────────────────────────
  const isLeadGenActive = totalContacts > 0
  const isEmailSenderActive = totalSent > 0
  const isReplyHandlerActive = totalReplied > 0

  const kpis = [
    {
      label: "Total Contacts",
      value: totalContacts.toLocaleString(),
      icon: Users,
      color: "bg-sky-50 text-sky-500",
      sub: `${totalContacts > 0 ? "+1" : "0"} today`,
    },
    {
      label: "Emails Sent",
      value: totalSent.toLocaleString(),
      icon: Mail,
      color: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "Open Rate",
      value: `${openRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-500",
    },
    {
      label: "Reply Rate",
      value: `${replyRate.toFixed(1)}%`,
      icon: MousePointerClick,
      color: "bg-purple-50 text-purple-500",
    },
  ]

  const now = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── Sticky Header (Old Design) ── */}
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 bg-white/80 px-6 backdrop-blur-sm">
        <SidebarTrigger className="-ml-1 text-gray-500" />
        <Separator
          orientation="vertical"
          className="mr-2 h-6 border-gray-200"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-gray-900">
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-[11px] font-semibold tracking-wide text-gray-400 uppercase sm:block">
            Updated {now}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-8 p-6 md:p-8">
        {/* ── Page Title (Combined) ── */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Marketing Agent
          </h1>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-emerald-600 uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        {/* ── KPI Cards (Old Design) ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((card) => (
            <Card
              key={card.label}
              className="flex flex-col gap-3 border-gray-200/60 p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    card.color
                  )}
                >
                  <card.icon className="size-5" />
                </span>
                {card.sub && (
                  <span className="text-[11px] font-bold text-gray-400">
                    {card.sub}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <p className="text-[32px] leading-none font-black text-gray-900">
                  {card.value}
                </p>
                <p className="mt-1.5 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  {card.label}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Charts & Recent Campaigns (Old Design Match) ── */}
        <DashboardCharts
          recentCampaigns={recentCampaignsRaw}
          chartData={chartData}
        />

        {/* ── Pipeline Cards (New Design) ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Agent Pipeline</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Lead Generator */}
            <div className="rounded-[20px] border border-gray-200/60 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <Search className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Lead Generator</h3>
                  <p className="text-[12px] font-medium text-gray-500">
                    Finding leads via web scraping
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isLeadGenActive ? "bg-emerald-500" : "bg-gray-400"
                    )}
                  />
                  {isLeadGenActive ? "Active" : "Idle"}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-gray-500">Leads Found</span>
                  <span className="font-bold text-blue-600">
                    {totalContacts}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-gray-500">Status</span>
                  <span className="font-bold text-gray-900">
                    Waiting for instructions
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100" />
              </div>
            </div>

            {/* Email Sender */}
            <div className="rounded-[20px] border border-gray-200/60 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                  <Mail className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Email Sender</h3>
                  <p className="text-[12px] font-medium text-gray-500">
                    Sending personalized emails
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isEmailSenderActive ? "bg-emerald-500" : "bg-gray-400"
                    )}
                  />
                  {isEmailSenderActive ? "Active" : "Waiting"}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-gray-500">Emails Sent</span>
                  <span className="font-bold text-emerald-600">
                    {totalSent} / {totalContacts}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-gray-500">
                    Ready to Send
                  </span>
                  <span className="font-bold text-gray-900">0 leads</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-100" />
                  <span className="shrink-0 text-[10px] font-medium text-gray-400">
                    Waiting for leads...
                  </span>
                </div>
              </div>
            </div>

            {/* Reply Handler */}
            <div className="rounded-[20px] border border-purple-100 bg-white p-6 shadow-sm shadow-purple-500/5">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                  <CornerDownLeft className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Reply Handler</h3>
                  <p className="text-[12px] font-medium text-gray-500">
                    Auto-responding to emails
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isReplyHandlerActive ? "bg-emerald-500" : "bg-gray-400"
                    )}
                  />
                  {isReplyHandlerActive ? "Active" : "Waiting"}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-gray-500">
                    Replies Handled
                  </span>
                  <span className="font-bold text-purple-600">
                    {totalReplied}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-gray-500">
                    Opened Emails
                  </span>
                  <span className="font-bold text-gray-900">{totalOpened}</span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2">
                  <span className="text-[11px] font-bold text-purple-600">
                    Waiting for incoming emails
                  </span>
                  <span className="text-[11px] font-bold text-purple-300">
                    —
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Activity (New Design) ── */}
        <div className="space-y-4 pb-12">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <div className="overflow-hidden rounded-[20px] border border-gray-200/60 bg-white shadow-sm">
            <div className="flex flex-col items-center justify-center bg-gray-50/50 p-16 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 shadow-sm">
                <Zap className="size-5 text-amber-500" />
              </div>
              <p className="mb-1 text-[15px] font-bold text-gray-900">
                No recent activity
              </p>
              <p className="text-[13px] font-medium text-gray-500">
                Use the AI Assistant to start a new campaign
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
