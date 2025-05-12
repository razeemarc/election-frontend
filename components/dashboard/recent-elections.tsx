import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useRecentElections } from "@/hooks/useRecentElections"
import { Loader2, Calendar, Award, Clock } from "lucide-react"

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
  const { data: elections = [], isLoading, isError, error, refetch } = useRecentElections()
  const { toast } = useToast()

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
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return Math.abs(dateA - now.getTime()) - Math.abs(dateB - now.getTime())
    })
    .slice(0, 5)

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-purple-600 dark:text-purple-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm font-medium">Loading recent elections...</p>
      </div>
    )
  }

  // Show error state
  if (isError) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <p>Failed to load recent elections: {error?.message}</p>
      </div>
    )
  }

  // Generate a consistent color based on the election name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500 dark:bg-blue-600",
      "bg-green-500 dark:bg-green-600",
      "bg-purple-500 dark:bg-purple-600",
      "bg-amber-500 dark:bg-amber-600",
      "bg-pink-500 dark:bg-pink-600"
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Function to get the appropriate icon for each status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Clock size={14} className="mr-1" />
      case "Scheduled":
        return <Calendar size={14} className="mr-1" />
      case "Completed":
        return <Award size={14} className="mr-1" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {processed.map((election) => (
        <div 
          key={election.id} 
          className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
        >
          <Avatar className={`h-10 w-10 ring-2 ring-white dark:ring-gray-800 ${getAvatarColor(election.name)}`}>
            <AvatarImage src="/placeholder.svg" alt="Election" />
            <AvatarFallback className="text-white">{election.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">{election.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar size={12} className="mr-1 inline" />
              {election.date}
            </p>
          </div>
          <div className="ml-auto">
            <Badge
              className="flex items-center whitespace-nowrap"
              variant={
                election.status === "Active"
                  ? "default"
                  : election.status === "Scheduled"
                    ? "outline"
                    : "secondary"
              }
            >
              {getStatusIcon(election.status)}
              {election.status}
            </Badge>
          </div>
        </div>
      ))}
      
      {processed.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No recent elections found</p>
        </div>
      )}
    </div>
  )
}