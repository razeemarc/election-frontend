import { useQuery } from "@tanstack/react-query"

interface Election {
  id: string
  title: string
  startTime: string
  endTime: string
  admin: { name: string }
  candidates: { id: string }[]
}

export function useRecentElections() {
  return useQuery<Election[], Error>({
    queryKey: ["recent-elections"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elections`)
      if (!response.ok) throw new Error("Failed to fetch elections")
      return response.json()
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}