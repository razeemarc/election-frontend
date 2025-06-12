"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentElections } from "@/components/dashboard/recent-elections"

import { ChevronUp, Activity, Users, CalendarCheck, Clock } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalElections: 0,
    totalUsers: 0,
    activeElections: 0,
    pendingRequests: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`)
        const json = await res.json()
        if (json.success) {
          setStats(json.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex flex-col gap-6">
    
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-1 rounded-full text-sm font-medium text-blue-600 dark:text-blue-300 flex items-center">
          <Activity size={14} className="mr-1" />
          Elections Analytics
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-500/5">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 text-blue-600 dark:text-blue-300">
              <Activity size={16} />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.totalElections}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
              <ChevronUp size={14} className="mr-1" />
              <span>Growing steadily</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-500/5">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-2 text-green-600 dark:text-green-300">
              <CalendarCheck size={16} />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.activeElections}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
              <ChevronUp size={14} className="mr-1" />
              <span>Currently running</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-500/5">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2 text-purple-600 dark:text-purple-300">
              <Users size={16} />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center">
              <ChevronUp size={14} className="mr-1" />
              <span>Active accounts</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-500/5">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-2 text-amber-600 dark:text-amber-300">
              <Clock size={16} />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.pendingRequests}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center">
              <ChevronUp size={14} className="mr-1" />
              <span>Awaiting approval</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-gray-800 dark:to-gray-800/80">
            <CardTitle className="flex items-center">
              <Activity size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
              Election Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Overview />
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/30 dark:from-gray-800 dark:to-gray-800/80">
            <CardTitle className="flex items-center">
              <CalendarCheck size={18} className="mr-2 text-purple-600 dark:text-purple-400" />
              Recent Elections
            </CardTitle>
            <CardDescription>Recently created or updated elections</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <RecentElections />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}