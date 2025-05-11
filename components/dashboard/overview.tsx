"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

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
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-blue-600 dark:text-blue-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm font-medium">Loading chart data...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg flex flex-col items-center justify-center h-[350px]">
        <p className="font-medium mb-2">Unable to load chart data</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    )
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

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-sm">{`${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400 text-sm">{`Elections: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[350px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar
            dataKey="total"
            radius={[8, 8, 0, 0]}
            className="fill-blue-500 dark:fill-blue-600 hover:fill-blue-600 dark:hover:fill-blue-500 transition-colors"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}