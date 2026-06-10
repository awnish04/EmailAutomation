"use client"

import { usePathname } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/user-dashboard/app-sidebar"
import { AgentProvider } from "@/components/user-dashboard/AgentContext"

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Login page gets no sidebar
  if (pathname === "/user-dashboard/login") {
    return <>{children}</>
  }

  return (
    <div suppressHydrationWarning>
      <AgentProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </AgentProvider>
    </div>
  )
}

