import { useQuery } from "@tanstack/react-query"

export interface Member {
  id: string
  name: string
  email: string
}

export interface Candidate {
  id: string
  member: Member
  status: "PENDING" | "APPROVED"
  voteCount: number
}

export interface Election {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  candidates: Candidate[]
}

interface ApiResponse {
  success: boolean
  data: Election[]
}

const fetchElectionResults = async (): Promise<Election[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/results/`)
  if (!response.ok) {
    throw new Error(`Failed to fetch election results: ${response.status}`)
  }
  const data: ApiResponse = await response.json()
  if (!data.success) {
    throw new Error("API returned unsuccessful response")
  }
  return data.data
}

export function useElectionResults() {
  return useQuery<Election[], Error>({
    queryKey: ["election-results"],
    queryFn: fetchElectionResults,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}