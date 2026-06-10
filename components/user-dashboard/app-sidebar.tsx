"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Mail,
  Users,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  Plus,
  Info,
  Check,
  Loader2,
  Wand2
} from "lucide-react"
import { NavUser } from "@/components/user-dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAgent } from "@/components/user-dashboard/AgentContext"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const NAV_MAIN = [
  {
    title: "Dashboard",
    url: "/user-dashboard/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    url: "/user-dashboard/users",
    icon: Users,
  },
  {
    title: "Campaigns",
    url: "/user-dashboard/email",
    icon: Mail,
  },
  {
    title: "Analytics",
    url: "/user-dashboard/analytics",
    icon: BarChart2,
  },
]

type Agent = {
  id: string
  name: string
  description: string | null
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isAgentModalOpen, setIsAgentModalOpen] = React.useState(false)
  const { agents, selectedAgent, setSelectedAgent, refreshAgents, isLoading } = useAgent()
  
  // Form state
  const [newAgentName, setNewAgentName] = React.useState("")
  const [newAgentDescription, setNewAgentDescription] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)

  const handleCreateAgent = async () => {
    if (!newAgentName) return
    setIsCreating(true)
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAgentName, description: newAgentDescription }),
      })
      if (res.ok) {
        await refreshAgents()
        setIsAgentModalOpen(false)
        setNewAgentName("")
        setNewAgentDescription("")
      }
    } catch (err) {
      console.error("Failed to create agent")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Sidebar collapsible="icon" className="bg-white border-r border-gray-200" {...props}>
        {/* Header */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                {/* Original Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-2 transition-opacity hover:opacity-90 mb-4"
                >
                  <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                    <svg
                      className="h-full w-full animate-[spin_8s_linear_infinite] text-emerald-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" />
                      <path strokeLinecap="round" d="M12 3a9 9 0 0 1 9 9" />
                      <path strokeLinecap="round" d="M12 21a9 9 0 0 1-9-9" />
                    </svg>
                    <div className="absolute h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-gray-900 select-none group-data-[collapsible=icon]:hidden">
                    Autonity
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Agent Selector (Dropdown Menu) */}
          <div className="mt-2 mb-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full group-data-[collapsible=icon]:w-auto flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 data-[state=open]:border-emerald-500/50 data-[state=open]:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-bold text-gray-900 truncate w-[110px]">{selectedAgent?.name || "Loading..."}</span>
                      <span className="text-[11px] text-gray-500 truncate w-[110px]">{selectedAgent?.description || "Select an agent"}</span>
                    </div>
                  </div>
                  <ChevronDown className="size-4 text-gray-400 group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px] rounded-xl p-2 shadow-xl border-gray-100">
                <DropdownMenuLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1.5">
                  MY AGENTS
                </DropdownMenuLabel>
                
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {agents.map((agent) => (
                    <DropdownMenuItem 
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`flex items-center justify-between rounded-lg p-2 cursor-pointer border ${selectedAgent?.id === agent.id ? "bg-emerald-50 border-emerald-100/50 hover:bg-emerald-100/50" : "bg-white border-transparent hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex size-7 shrink-0 items-center justify-center rounded-full border shadow-sm ${selectedAgent?.id === agent.id ? "bg-white border-gray-200 text-gray-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                          <CheckCircle2 className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[13px] font-semibold ${selectedAgent?.id === agent.id ? "text-gray-900" : "text-gray-600"}`}>{agent.name}</span>
                          <span className="text-[10px] text-gray-500 truncate w-[120px]">{agent.description}</span>
                        </div>
                      </div>
                      {selectedAgent?.id === agent.id && <Check className="size-4 text-emerald-600 shrink-0" />}
                    </DropdownMenuItem>
                  ))}
                </div>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault(); 
                    setIsAgentModalOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-lg p-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900 font-medium"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-600">
                    <Plus className="size-4" />
                  </div>
                  Create new agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Agent Workflow Button */}
          <div className="mb-6 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <Button 
              asChild
              className="w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center justify-start gap-2 bg-[#00A344] hover:bg-[#008f3b] text-white h-12 rounded-lg shadow-sm"
            >
              <Link href="/user-dashboard/campaigns/new">
                <Wand2 className="size-5 shrink-0" />
                <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold text-sm leading-tight">Run Agent Workflow</span>
                  <span className="text-[10px] text-white/80 font-normal truncate w-[110px]">
                    {selectedAgent ? `${selectedAgent.name}` : "Automate tasks"}
                  </span>
                </div>
              </Link>
            </Button>
          </div>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent className="px-2">
          <SidebarMenu>
            {NAV_MAIN.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} className="text-gray-600 hover:text-zinc-900 hover:bg-gray-100/80 rounded-lg">
                  <Link href={item.url}>
                    <item.icon className="size-4 shrink-0" />
                    <span className="font-medium text-[14px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t border-gray-100 p-4 group-data-[collapsible=icon]:p-2">
          <NavUser />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Create Agent Modal */}
      <Dialog open={isAgentModalOpen} onOpenChange={setIsAgentModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-[20px] gap-0">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-gray-900">Create New Agent</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Set up a new AI marketing agent
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-[13px] font-medium text-gray-700">Agent Name *</label>
                <Input 
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g., Job Application Agent, Real Estate Agent" 
                  className="rounded-lg border-gray-200 focus-visible:ring-emerald-500/20 text-sm shadow-sm h-10"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[13px] font-medium text-gray-700">Description</label>
                <Textarea 
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                  placeholder="What will this agent do?" 
                  className="rounded-lg border-gray-200 focus-visible:ring-emerald-500/20 text-sm shadow-sm resize-none min-h-[90px]"
                />
              </div>

              {/* Examples Box */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-800 mb-1">Examples:</h4>
                    <ul className="text-[11px] text-emerald-700 space-y-1">
                      <li>• Job Application Agent - Apply to job postings</li>
                      <li>• Real Estate Agent - Contact property agents</li>
                      <li>• E-commerce Agent - Reach out to store owners</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => setIsAgentModalOpen(false)}
              className="flex-1 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAgent}
              disabled={!newAgentName || isCreating}
              className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-white shadow-sm rounded-lg flex items-center justify-center gap-2"
            >
              {isCreating && <Loader2 className="size-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create Agent"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
