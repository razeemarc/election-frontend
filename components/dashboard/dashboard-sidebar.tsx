"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Users, Vote, Settings, LogOut, Trophy } from "lucide-react"
import { useUserStore } from "@/store/userStore"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useUserStore((state) => state.logout)
  
  const handleLogout = () => {
    logout() // Clear user data from store and remove token from cookies
    router.push("/auth") // Redirect to auth page
  }
  
  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Elections",
      href: "/dashboard/elections",
      icon: Vote,
    },
    {
      title: "Participant Requests",
      href: "/dashboard/participants",
      icon: Users,
    },
    {
      title: "User Management",
      href: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Results",
      href: "/dashboard/result",
      icon: Trophy,
    },
  ]
  
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="flex h-16 items-center border-b px-6 py-4 mb-8">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold">
          <Vote className="h-6 w-6 text-blue-600" />
          <span className="text-lg">Votin System</span>
        </Link>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4 pt-8">
        <SidebarMenu>
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <SidebarMenuItem key={route.href} className="mb-1">
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className={`w-full rounded-lg transition-colors ${
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Link href={route.href} className="flex items-center gap-3 px-4 py-2">
                    <route.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                    <span className={`font-medium ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                      {route.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 px-3 py-4 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="w-full rounded-lg px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3 font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}