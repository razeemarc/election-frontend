import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { UserNav } from "@/components/dashboard/user-nav"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex items-center justify-end h-16 px-4">
            <UserNav />
          </div>
        </header>
        
        <div className="flex flex-1 h-full">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}