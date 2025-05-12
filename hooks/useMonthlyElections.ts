import { useQuery } from "@tanstack/react-query"

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

export function useMonthlyElections() {
  return useQuery<ApiResponse, Error>({
    queryKey: ["monthly-elections"],
    queryFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/monthly-elections`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error("Failed to fetch monthly election data")
      return response.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}