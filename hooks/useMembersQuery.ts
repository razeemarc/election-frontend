import { useQuery } from "@tanstack/react-query"

export const fetchMembers = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`)
  if (!response.ok) {
    throw new Error(`Error fetching members: ${response.status}`)
  }
  const result = await response.json()
  return result.members.map((member: any) => ({
    ...member,
    status: member.isBlocked ? "Blocked" : "Active",
    role: member.role === "ADMIN" ? "Admin" : 
          member.role === "MODERATOR" ? "Moderator" : "User",
    lastLogin: member.lastLogin || "Never logged in"
  }))
}

export function useMembersQuery() {
  return useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}