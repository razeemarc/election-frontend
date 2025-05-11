import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface Election {
  id: string
  title: string
  startTime: string
  endTime: string
  admin: {
    name: string
  }
  candidates: {
    id: string
  }[]
}

export function RecentElections() {
  const [recentElections, setRecentElections] = useState<{
    id: string
    name: string
    date: string
    status: "Active" | "Scheduled" | "Completed"
  }[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elections`)
        if (!response.ok) {
          throw new Error('Failed to fetch elections')
        }
        const elections: Election[] = await response.json()
        
        // Process elections to get the 5 closest to current date
        const now = new Date()
        const processed = elections
          .map(election => {
            const startDate = new Date(election.startTime)
            const endDate = new Date(election.endTime)
            
            let status: "Active" | "Scheduled" | "Completed" = "Scheduled"
            if (now >= startDate && now <= endDate) {
              status = "Active"
            } else if (now > endDate) {
              status = "Completed"
            }
            
            return {
              id: election.id,
              name: election.title,
              date: startDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              status,
              adminName: election.admin.name,
              candidateCount: election.candidates.length
            }
          })
          // Sort by closest to current date (either upcoming or recently ended)
          .sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            return Math.abs(dateA - now.getTime()) - Math.abs(dateB - now.getTime())
          })
          // Take the first 5
          .slice(0, 5)
        
        setRecentElections(processed)
      } catch (error) {
        console.error('Error fetching elections:', error)
        toast({
          title: "Error",
          description: "Failed to load recent elections",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchElections()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-4">Loading recent elections...</div>
  }

  return (
    <div className="space-y-8">
      {recentElections.map((election) => (
        <div key={election.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg" alt="Election" />
            <AvatarFallback>{election.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{election.name}</p>
            <p className="text-sm text-muted-foreground">
              {election.date} 
            </p>
          </div>
          <div className="ml-auto">
            <Badge
              variant={
                election.status === "Active" 
                  ? "default" 
                  : election.status === "Scheduled" 
                    ? "outline" 
                    : "secondary"
              }
            >
              {election.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}