import { useQuery } from "@tanstack/react-query"

export interface Election {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
}

const fetchElections = async (): Promise<Election[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elections`)
  if (!response.ok) throw new Error("Failed to fetch elections")
  return response.json()
}

export function useElectionsList() {
  return useQuery<Election[], Error>({
    queryKey: ["elections-list"],
    queryFn: fetchElections,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}