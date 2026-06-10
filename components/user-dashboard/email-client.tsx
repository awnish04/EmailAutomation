"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Plus,
  Copy,
  Trash2,
  BarChart2,
  Edit,
  Mail,
  FileText,
  ChevronRight,
  Send,
  TrendingUp,
  MousePointerClick,
  Zap,
  MoreHorizontal,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  totalSent: number
  totalOpened: number
  totalClicked: number
  createdAt: string
  sentAt: string | null
}

interface Template {
  id: string
  name: string
  subject: string
  htmlContent: string
  updatedAt: string
}

interface EmailClientProps {
  initialCampaigns: Campaign[]
  initialTemplates: Template[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Health indicator removed per user request
const statusConfig: Record<
  string,
  { label: string; cls: string; pulse?: boolean }
> = {
  DRAFT: { label: "Draft", cls: "border-gray-200 bg-gray-50 text-gray-600" },
  SCHEDULED: {
    label: "Scheduled",
    cls: "border-sky-200 bg-sky-50 text-sky-700",
  },
  SENDING: {
    label: "Sending",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
    pulse: true,
  },
  SENT: {
    label: "Sent",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    cls: "border-red-200 bg-red-50 text-red-700",
  },
}

export function EmailClient({
  initialCampaigns,
  initialTemplates,
}: EmailClientProps) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [templates, setTemplates] = useState(initialTemplates)

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft campaign?")) return
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Campaign deleted")
        setCampaigns(campaigns.filter((c) => c.id !== id))
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${campaign.name} (Copy)`,
          subject: campaign.subject,
          status: "DRAFT",
        }),
      })
      if (res.ok) {
        toast.success("Campaign duplicated as draft")
        router.refresh()
      } else {
        toast.error("Failed to duplicate")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  // Summary stats
  const totalSent = campaigns.reduce((s, c) => s + c.totalSent, 0)
  const totalOpened = campaigns.reduce((s, c) => s + c.totalOpened, 0)
  const totalClicked = campaigns.reduce((s, c) => s + c.totalClicked, 0)
  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
  const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0

  const renderCampaignTable = (filteredCampaigns: Campaign[]) => {
    if (filteredCampaigns.length === 0) {
      return (
        <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-[24px] border-2 border-dashed border-gray-200 bg-white/50 transition-all">
          <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50 shadow-inner">
            <Mail className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">No campaigns yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Launch your first email campaign to start reaching out to prospects.
            </p>
          </div>
          <Button asChild className="mt-2 rounded-xl bg-[#00A344] px-6 text-white shadow-sm hover:bg-[#008f3b]">
            <Link href="/user-dashboard/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create your first automated campaign
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="overflow-hidden rounded-[20px] border border-gray-200/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="font-bold text-gray-900 pl-6">Campaign</TableHead>
                <TableHead className="font-bold text-gray-900">Status</TableHead>
                <TableHead className="font-bold text-gray-900">Sent</TableHead>
                <TableHead className="font-bold text-gray-900">Opens</TableHead>
                <TableHead className="font-bold text-gray-900">Clicks</TableHead>
                <TableHead className="font-bold text-gray-900">Date</TableHead>
                <TableHead className="text-right font-bold text-gray-900 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => {
                const openRate = campaign.totalSent > 0 ? Math.round((campaign.totalOpened / campaign.totalSent) * 100) : 0
                const clickRate = campaign.totalSent > 0 ? ((campaign.totalClicked / campaign.totalSent) * 100).toFixed(1) : "0.0"
                const sConfig = statusConfig[campaign.status] || statusConfig.DRAFT

                return (
                  <TableRow key={campaign.id} className="border-gray-100 transition-colors hover:bg-gray-50/50 group">
                    <TableCell className="pl-6 max-w-[250px]">
                      <div className="space-y-1">
                        <p className="truncate font-bold text-gray-900 text-[15px]" title={campaign.name}>{campaign.name}</p>
                        <p className="truncate text-xs font-medium text-gray-500" title={campaign.subject}>{campaign.subject}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase", sConfig.cls)}>
                        {sConfig.pulse && <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-amber-500" />}
                        {sConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell><span className="font-semibold text-gray-900">{campaign.totalSent.toLocaleString()}</span></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-900">{campaign.totalOpened.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-emerald-600">{openRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-900">{campaign.totalClicked.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-amber-500">{clickRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-500">
                        {campaign.sentAt ? format(new Date(campaign.sentAt), "MMM d, yyyy") : format(new Date(campaign.createdAt), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 transition-opacity group-hover:opacity-100">
                        {campaign.status === "DRAFT" && (
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                        {campaign.status !== "DRAFT" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 rounded-lg text-gray-500 hover:bg-gray-200/50 hover:text-gray-900">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 shadow-lg">
                              <DropdownMenuLabel className="text-gray-900">Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="cursor-pointer focus:bg-gray-50" asChild>
                                <Link href={`/api/campaigns/${campaign.id}/preview`} target="_blank" className="flex items-center">
                                  <Eye className="mr-2 h-4 w-4 text-gray-500" /> <span className="text-gray-700 font-medium">View Email</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer focus:bg-gray-50" asChild>
                                <Link href="/user-dashboard/analytics" className="flex items-center">
                                  <BarChart2 className="mr-2 h-4 w-4 text-gray-500" /> <span className="text-gray-700 font-medium">Report</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-100" />
                              <DropdownMenuItem className="cursor-pointer focus:bg-gray-50" onClick={() => handleDuplicate(campaign)}>
                                <Copy className="mr-2 h-4 w-4 text-gray-500" /> <span className="text-gray-700 font-medium">Duplicate</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-[#fafafa]">
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-6">
        <SidebarTrigger className="-ml-1 text-gray-500" />
        <div className="ml-4 flex items-center gap-2">
          <Mail className="size-4 text-emerald-500" />
          <h1 className="text-lg leading-tight font-bold text-gray-900">
            Email Campaigns
          </h1>
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto p-6 md:p-8">
        {/* Subtle Background Gradient */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-emerald-50/40 via-[#fafafa] to-cyan-50/20" />

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Summary stats bar */}
          {campaigns.length > 0 && (
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-4 rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 shadow-inner">
                  <Send className="h-5 w-5" />
                </span>
                <div>
                  <p className="mb-1 text-2xl leading-none font-black text-gray-900">
                    {totalSent.toLocaleString()}
                  </p>
                  <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Total Sent
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-inner">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="mb-1 text-2xl leading-none font-black text-gray-900">
                    {avgOpenRate.toFixed(1)}%
                  </p>
                  <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Avg Open Rate
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-inner">
                  <MousePointerClick className="h-5 w-5" />
                </span>
                <div>
                  <p className="mb-1 text-2xl leading-none font-black text-gray-900">
                    {avgClickRate.toFixed(1)}%
                  </p>
                  <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Avg Click Rate
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 shadow-inner">
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <p className="mb-1 text-2xl leading-none font-black text-gray-900">
                    {campaigns.filter((c) => c.status === "SENDING").length > 0
                      ? campaigns.filter((c) => c.status === "SENDING").length
                      : campaigns.filter((c) => c.status === "SENT").length}
                  </p>
                  <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    {campaigns.filter((c) => c.status === "SENDING").length > 0
                      ? "Sending Now"
                      : "Sent Campaigns"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Send className="h-5 w-5 text-emerald-500" />
                Sent Campaigns
              </h2>
              <Button
                asChild
                className="h-11 rounded-xl bg-[#00A344] px-6 font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-[#008f3b]"
              >
                <Link href="/user-dashboard/campaigns/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Automated Campaign
                </Link>
              </Button>
            </div>

            {renderCampaignTable(campaigns.filter((c) => c.status === "SENT"))}
          </div>
        </div>
      </main>
    </div>
  )
}
