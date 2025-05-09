import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentElections() {
  return (
    <div className="space-y-8">
      {recentElections.map((election) => (
        <div key={election.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={election.avatar || "/placeholder.svg"} alt="Election" />
            <AvatarFallback>{election.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{election.name}</p>
            <p className="text-sm text-muted-foreground">{election.date}</p>
          </div>
          <div className="ml-auto">
            <Badge
              variant={
                election.status === "Active" ? "default" : election.status === "Scheduled" ? "outline" : "secondary"
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

const recentElections = [
  {
    id: "1",
    name: "Student Council Election",
    avatar: "/placeholder.svg?height=36&width=36",
    date: "May 20, 2025",
    status: "Active",
  },
  {
    id: "2",
    name: "Board of Directors",
    avatar: "/placeholder.svg?height=36&width=36",
    date: "June 5, 2025",
    status: "Scheduled",
  },
  {
    id: "3",
    name: "Department Head Selection",
    avatar: "/placeholder.svg?height=36&width=36",
    date: "April 15, 2025",
    status: "Completed",
  },
  {
    id: "4",
    name: "Community Representative",
    avatar: "/placeholder.svg?height=36&width=36",
    date: "May 30, 2025",
    status: "Scheduled",
  },
  {
    id: "5",
    name: "Club President Election",
    avatar: "/placeholder.svg?height=36&width=36",
    date: "April 10, 2025",
    status: "Active",
  },
]
