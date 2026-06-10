/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useCallback } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Cell,
} from "recharts"
import {
  Users,
  Mail,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  UserMinus,
  Zap,
  ExternalLink,
  ArrowUpDown,
  AlertTriangle,
  Send,
  CheckCircle2,
  Download,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { NumberTicker } from "../ui/number-ticker"

// ─── Types ───────────────────────────────────────────────────────────────────

interface DeliverabilityFunnel {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
}

interface SendTimeSlot {
  hour: number
  opens: number
}

interface AnalyticsData {
  overview: {
    totalContacts: number
    contactsGrowth: number
    emailsSent: number
    avgOpenRate: number
    avgClickRate: number
    bounceRate: number
    unsubscribeRate: number
  }
  emailsByDay: { date: string; sent: number; opened: number; clicked: number }[]
  campaignPerformance: {
    id: string
    name: string
    sent: number
    opened: number
    clicked: number
    bounced: number
    openRate: number
    clickRate: number
    sentAt: string | null
  }[]
  contactGrowth: { date: string; count: number }[]
  deliverabilityFunnel: DeliverabilityFunnel
  sendTimeHeatmap: SendTimeSlot[]
}

interface AnalyticsClientProps {
  initialData: AnalyticsData
  initialRange: string
  activeAutomations: number
}

// ─── Chart configs ────────────────────────────────────────────────────────────

const emailChartConfig = {
  sent: { label: "Sent", color: "var(--chart-1)" },
  opened: { label: "Opened", color: "var(--chart-2)" },
  clicked: { label: "Clicked", color: "var(--chart-3)" },
} satisfies ChartConfig

const contactChartConfig = {
  count: { label: "New Contacts", color: "var(--chart-1)" },
} satisfies ChartConfig

const heatmapChartConfig = {
  opens: { label: "Opens", color: "var(--chart-2)" },
} satisfies ChartConfig

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsClient({
  initialData,
  initialRange,
  activeAutomations,
}: AnalyticsClientProps) {
  const [data, setData] = useState<AnalyticsData>(initialData)
  const [range, setRange] = useState(initialRange)
  const [loading, setLoading] = useState(false)
  const [sortCol, setSortCol] = useState<string>("sent")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [drawerCampaign, setDrawerCampaign] = useState<
    AnalyticsData["campaignPerformance"][0] | null
  >(null)

  const fetchData = useCallback(async (r: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?range=${r}`)
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      setData(json)
    } catch {
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  const onRangeChange = (r: string) => {
    setRange(r)
    fetchData(r)
  }

  const overview = data.overview
  const kpis = [
    {
      label: "Total Contacts",
      value: overview.totalContacts,
      growth: overview.contactsGrowth,
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
    },
    {
      label: "Emails Sent",
      value: overview.emailsSent,
      icon: Mail,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Avg Open Rate",
      value: overview.avgOpenRate,
      isPercentage: true,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Avg Click Rate",
      value: overview.avgClickRate,
      isPercentage: true,
      icon: MousePointerClick,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Bounce Rate",
      value: overview.bounceRate,
      isPercentage: true,
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Unsubscribe Rate",
      value: overview.unsubscribeRate,
      isPercentage: true,
      icon: UserMinus,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      label: "Active Automations",
      value: activeAutomations,
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ]

  const sortedCampaigns = [...data.campaignPerformance].sort((a, b) => {
    const aVal = (a as any)[sortCol] ?? 0
    const bVal = (b as any)[sortCol] ?? 0
    return sortDir === "asc" ? aVal - bVal : bVal - aVal
  })

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortCol(col)
      setSortDir("desc")
    }
  }

  const contactGrowthWeekly = aggregateByWeek(data.contactGrowth)

  // Deliverability funnel
  const funnel = data.deliverabilityFunnel
  const funnelSteps = [
    {
      label: "Sent",
      value: funnel.sent,
      icon: Send,
      color: "bg-chart-1",
      pct: 100,
    },
    {
      label: "Delivered",
      value: funnel.delivered,
      icon: CheckCircle2,
      color: "bg-sky-400",
      pct: funnel.sent > 0 ? (funnel.delivered / funnel.sent) * 100 : 0,
    },
    {
      label: "Opened",
      value: funnel.opened,
      icon: Mail,
      color: "bg-emerald-400",
      pct: funnel.sent > 0 ? (funnel.opened / funnel.sent) * 100 : 0,
    },
    {
      label: "Clicked",
      value: funnel.clicked,
      icon: MousePointerClick,
      color: "bg-amber-400",
      pct: funnel.sent > 0 ? (funnel.clicked / funnel.sent) * 100 : 0,
    },
    {
      label: "Bounced",
      value: funnel.bounced,
      icon: AlertTriangle,
      color: "bg-red-400",
      pct: funnel.sent > 0 ? (funnel.bounced / funnel.sent) * 100 : 0,
    },
  ]

  // Heatmap: label hours
  const labelHour = (h: number) => {
    if (h === 0) return "12am"
    if (h === 12) return "12pm"
    return h < 12 ? `${h}am` : `${h - 12}pm`
  }
  const maxOpens = Math.max(...data.sendTimeHeatmap.map((s) => s.opens), 1)

  return (
    <div className="relative mx-auto min-h-[calc(100vh-3rem)] max-w-[1400px] flex-1 p-6 md:p-8">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-500" />
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Performance insights for your email automation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {["7d", "30d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                  range === r
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900"
            onClick={() => {
              toast.info("Export feature coming soon")
            }}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="border-gray-200/60 bg-white shadow-sm transition-colors hover:border-gray-300"
          >
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    kpi.bg
                  )}
                >
                  <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                </span>
                {kpi.growth !== undefined && (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      kpi.growth >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {kpi.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(kpi.growth).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="flex items-end text-2xl font-black text-gray-900">
                <NumberTicker
                  value={kpi.value}
                  decimalPlaces={kpi.isPercentage ? 1 : 0}
                />
                {kpi.isPercentage && (
                  <span className="ml-0.5 text-base text-gray-400">%</span>
                )}
              </p>
              <p className="mt-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                {kpi.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="border-gray-200/60 bg-white shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-gray-900">Email Performance</CardTitle>
            <CardDescription className="text-gray-500">
              Daily sent, opened, and clicked breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={emailChartConfig}
              className="aspect-auto h-[280px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={data.emailsByDay}
                margin={{ left: 12, right: 12 }}
              >
                <defs>
                  <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                  <linearGradient id="fillOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-2)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-2)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                  <linearGradient id="fillClicked" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.06} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      className="border-white/10 bg-background"
                      labelFormatter={(v) =>
                        new Date(v).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                  }
                />
                <Area
                  dataKey="clicked"
                  type="monotone"
                  fill="url(#fillClicked)"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="opened"
                  type="monotone"
                  fill="url(#fillOpened)"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="sent"
                  type="monotone"
                  fill="url(#fillSent)"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 bg-white shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900">Contact Growth</CardTitle>
            <CardDescription className="text-gray-500">
              New contacts added per week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={contactChartConfig}
              className="aspect-auto h-[280px] w-full"
            >
              <BarChart accessibilityLayer data={contactGrowthWeekly}>
                <CartesianGrid vertical={false} strokeOpacity={0.06} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel={false}
                      className="border-white/10 bg-background"
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Deliverability Funnel + Send-Time Heatmap */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Deliverability Funnel */}
        <Card className="border-gray-200/60 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Send className="h-5 w-5 text-emerald-500" />
              Deliverability Funnel
            </CardTitle>
            <CardDescription className="text-gray-500">
              Email journey from send to click
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelSteps.map((step, i) => (
              <div key={step.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <step.icon
                      className={cn(
                        "h-3.5 w-3.5",
                        i === 4 ? "text-red-400" : "text-gray-400"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        i === 4 ? "text-red-400" : "text-gray-700"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">
                      {step.value.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "w-12 text-right font-bold tabular-nums",
                        i === 4 ? "text-red-400" : "text-gray-900"
                      )}
                    >
                      {step.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      step.color
                    )}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Best Send Time Heatmap */}
        <Card className="border-gray-200/60 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Best Send Times
            </CardTitle>
            <CardDescription className="text-gray-500">
              Opens by hour of day (your audience&#39;s timezone)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={heatmapChartConfig}
              className="aspect-auto h-[200px] w-full"
            >
              <BarChart
                data={data.sendTimeHeatmap}
                margin={{ left: 0, right: 0 }}
              >
                <CartesianGrid vertical={false} strokeOpacity={0.04} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(h) => (h % 6 === 0 ? labelHour(h) : "")}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  content={
                    <ChartTooltipContent
                      className="border-gray-200 bg-white"
                      labelFormatter={(h) =>
                        `${labelHour(Number(h))} – ${labelHour((Number(h) + 1) % 24)}`
                      }
                    />
                  }
                />
                <Bar dataKey="opens" radius={[4, 4, 0, 0]} maxBarSize={20}>
                  {data.sendTimeHeatmap.map((entry) => (
                    <Cell
                      key={entry.hour}
                      fill={`rgba(110, 231, 183, ${0.15 + (entry.opens / maxOpens) * 0.85})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            {maxOpens > 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Peak hour:{" "}
                <span className="font-semibold text-emerald-400">
                  {labelHour(
                    data.sendTimeHeatmap.reduce(
                      (best, s) => (s.opens > best.opens ? s : best),
                      data.sendTimeHeatmap[0]
                    ).hour
                  )}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Campaign Performance Table */}
      <Card className="mb-8 border-gray-200/60 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Campaign Performance</CardTitle>
          <CardDescription className="text-gray-500">
            Click a row to see detailed breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="pl-6 font-bold text-gray-900">
                    Campaign
                  </TableHead>
                  <SortableHead
                    label="Sent"
                    col="sent"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    toggle={toggleSort}
                  />
                  <SortableHead
                    label="Opens"
                    col="opened"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    toggle={toggleSort}
                  />
                  <SortableHead
                    label="Open Rate"
                    col="openRate"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    toggle={toggleSort}
                  />
                  <SortableHead
                    label="Clicks"
                    col="clicked"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    toggle={toggleSort}
                  />
                  <SortableHead
                    label="Click Rate"
                    col="clickRate"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    toggle={toggleSort}
                  />
                  <TableHead className="font-bold text-gray-900">
                    Bounced
                  </TableHead>
                  <TableHead className="pr-6 font-bold text-gray-900">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCampaigns.length === 0 ? (
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-gray-500"
                    >
                      No campaigns found in this period
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCampaigns.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50"
                      onClick={() => setDrawerCampaign(c)}
                    >
                      <TableCell className="max-w-[180px] truncate pl-6 font-bold text-gray-900">
                        {c.name}
                      </TableCell>
                      <TableCell className="font-medium text-gray-700">
                        {c.sent.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-gray-700">
                        {c.opened.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <RateBadge value={c.openRate} />
                      </TableCell>
                      <TableCell className="font-medium text-gray-700">
                        {c.clicked.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <RateBadge value={c.clickRate} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm font-bold",
                            c.bounced > 0 ? "text-red-500" : "text-gray-400"
                          )}
                        >
                          {c.bounced.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-sm font-medium text-gray-500">
                        {c.sentAt
                          ? new Date(c.sentAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Detail Drawer */}
      <Sheet
        open={!!drawerCampaign}
        onOpenChange={(open) => !open && setDrawerCampaign(null)}
      >
        <SheetContent className="w-full border-gray-200 bg-white sm:max-w-lg">
          {drawerCampaign && (
            <>
              <SheetHeader>
                <SheetTitle className="text-gray-900">
                  {drawerCampaign.name}
                </SheetTitle>
                <SheetDescription className="text-gray-500">
                  Campaign detail breakdown
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <StatBlock label="Total Sent" value={drawerCampaign.sent} />
                  <StatBlock
                    label="Total Opened"
                    value={drawerCampaign.opened}
                  />
                  <StatBlock
                    label="Open Rate"
                    value={`${drawerCampaign.openRate.toFixed(1)}%`}
                  />
                  <StatBlock
                    label="Click Rate"
                    value={`${drawerCampaign.clickRate.toFixed(1)}%`}
                  />
                  <StatBlock label="Bounced" value={drawerCampaign.bounced} />
                  <StatBlock label="Clicks" value={drawerCampaign.clicked} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Funnel
                  </p>
                  <div className="space-y-3">
                    <FunnelBar
                      label="Sent"
                      value={drawerCampaign.sent}
                      max={drawerCampaign.sent}
                      color="bg-chart-1"
                    />
                    <FunnelBar
                      label="Opened"
                      value={drawerCampaign.opened}
                      max={drawerCampaign.sent}
                      color="bg-chart-2"
                    />
                    <FunnelBar
                      label="Clicked"
                      value={drawerCampaign.clicked}
                      max={drawerCampaign.sent}
                      color="bg-chart-3"
                    />
                    <FunnelBar
                      label="Bounced"
                      value={drawerCampaign.bounced}
                      max={drawerCampaign.sent}
                      color="bg-red-400"
                    />
                  </div>
                </div>
                {drawerCampaign.sentAt && (
                  <p className="text-xs text-muted-foreground">
                    Sent on{" "}
                    {new Date(drawerCampaign.sentAt).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function SortableHead({
  label,
  col,
  sortCol,
  sortDir,
  toggle,
}: {
  label: string
  col: string
  sortCol: string
  sortDir: "asc" | "desc"
  toggle: (c: string) => void
}) {
  return (
    <TableHead>
      <button
        className="flex items-center gap-1 font-bold text-gray-900 transition-colors hover:text-gray-700"
        onClick={() => toggle(col)}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3",
            sortCol === col ? "text-emerald-500" : "text-gray-300"
          )}
        />
      </button>
    </TableHead>
  )
}

function RateBadge({ value }: { value: number }) {
  const colorClass =
    value >= 25
      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
      : value >= 15
        ? "bg-amber-50 text-amber-600 border-amber-200"
        : "bg-gray-50 text-gray-500 border-gray-200"
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold tabular-nums", colorClass)}
    >
      {value.toFixed(1)}%
    </Badge>
  )
}

function StatBlock({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

function FunnelBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-500">{label}</span>
        <span className="font-bold text-gray-900">
          {value.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function aggregateByWeek(
  contactGrowth: { date: string; count: number }[]
): { label: string; count: number }[] {
  if (contactGrowth.length === 0) return []
  const weeks: { label: string; count: number }[] = []
  let weekCount = 0,
    weekStart = ""
  contactGrowth.forEach((day, i) => {
    if (i % 7 === 0) {
      if (weekStart) weeks.push({ label: weekStart, count: weekCount })
      weekStart = new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      weekCount = 0
    }
    weekCount += day.count
  })
  if (weekStart) weeks.push({ label: weekStart, count: weekCount })
  return weeks
}
