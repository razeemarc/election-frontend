"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"

interface MonthlyData {
  name: string
  total: number
}

interface ApiMonthData {
  month: number
  name: string
  count: number
}

interface ApiResponse {
  success: boolean
  data: {
    year: number
    months: ApiMonthData[]
  }
}

export function Overview() {
  const [chartData, setChartData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setIsLoading(true)
        // Get token from localStorage or wherever you store your auth token
        const token = localStorage.getItem("token")
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/monthly-elections`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch monthly election data")
        }

        const result = await response.json() as ApiResponse
        
        if (result.success && result.data.months) {
          // Transform the data to match the component's expected format
          const formattedData: MonthlyData[] = result.data.months.map(item => ({
            name: item.name,
            total: item.count
          }))
          
          setChartData(formattedData)
        } else {
          throw new Error("Invalid data structure received from API")
        }
      } catch (err) {
        console.error("Error fetching monthly election data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthlyData()
  }, [])

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-[350px]">Loading chart data...</div>
  }

  // Show error state
  if (error) {
    return <div className="text-red-500 flex items-center justify-center h-[350px]">Error: {error}</div>
  }

  // Use the static data as fallback if API call fails or returns empty data
  const fallbackData: MonthlyData[] = [
    { name: "Jan", total: 2 },
    { name: "Feb", total: 3 },
    { name: "Mar", total: 1 },
    { name: "Apr", total: 4 },
    { name: "May", total: 2 },
    { name: "Jun", total: 5 },
    { name: "Jul", total: 3 },
    { name: "Aug", total: 2 },
    { name: "Sep", total: 4 },
    { name: "Oct", total: 3 },
    { name: "Nov", total: 2 },
    { name: "Dec", total: 1 },
  ]

  // Use API data if available, otherwise use fallback data
  const displayData = chartData.length > 0 ? chartData : fallbackData

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={displayData}>
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`} 
        />
        <Bar 
          dataKey="total" 
          fill="currentColor" 
          radius={[4, 4, 0, 0]} 
          className="fill-primary" 
        />
      </BarChart>
    </ResponsiveContainer>
  )
}