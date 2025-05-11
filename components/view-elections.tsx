"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoteModal } from "./vote-model"
import { toast } from "sonner"
import { ElectionSkeleton } from "@/components/ui/election-skeleton"

// Define the types based on the API response structure
type Member = {
  id: string
  name: string
}

type Candidate = {
  id: string
  memberId: string
  electionId: string
  appliedAt: string
  proposedElectionDate: string
  status: string
  member: Member
}

type Admin = {
  id: string
  name: string
  email: string
}

type Election = {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  createdBy: string
  createdAt: string
  admin: Admin
  candidates: Candidate[]
}

export function ViewElections() {
  const [currentElections, setCurrentElections] = useState<Election[]>([])
  const [upcomingElections, setUpcomingElections] = useState<Election[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedElection, setSelectedElection] = useState<Election | null>(null)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)

  useEffect(() => {
    const fetchElections = async () => {
      setIsLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      try {
        // Fetch current elections
        const currentResponse = await fetch(`${apiUrl}/api/user/elections/current`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include'
        })
        
        // Fetch upcoming elections
        const upcomingResponse = await fetch(`${apiUrl}/api/user/elections/upcoming`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include'
        })
        
        if (currentResponse.ok && upcomingResponse.ok) {
          const currentData = await currentResponse.json()
          const upcomingData = await upcomingResponse.json()
          
          setCurrentElections(currentData.data)
          setUpcomingElections(upcomingData.data)
        } else {
          const errorData = await currentResponse.json()
          toast.error("Error", {
            description: errorData.message || "Failed to fetch elections"
          })
        }
      } catch (error) {
        console.error('Failed to fetch elections:', error)
        toast.error("Error", {
          description: "An error occurred while fetching elections. Please try again later."
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchElections()
  }, [])

  const handleVoteClick = (election: Election) => {
    setSelectedElection(election)
    setIsVoteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="current">Current Elections</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Elections</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {isLoading ? (
            <ElectionSkeleton />
          ) : currentElections.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {currentElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  onVoteClick={handleVoteClick}
                  buttonText="Vote Now"
                  buttonDisabled={false}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-muted-foreground">No current elections available.</p>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {isLoading ? (
            <ElectionSkeleton />
          ) : upcomingElections.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  onVoteClick={handleVoteClick}
                  buttonText="Coming Soon"
                  buttonDisabled={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-muted-foreground">No upcoming elections scheduled.</p>
          )}
        </TabsContent>
      </Tabs>

      {selectedElection && (
        <VoteModal isOpen={isVoteModalOpen} onClose={() => setIsVoteModalOpen(false)} election={selectedElection} />
      )}
    </div>
  )
}

function ElectionCard({
  election,
  onVoteClick,
  buttonText,
  buttonDisabled,
}: {
  election: Election
  onVoteClick: (election: Election) => void
  buttonText: string
  buttonDisabled: boolean
}) {
  const formattedDate = new Date(election.startTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{election.title}</CardTitle>
          <Badge variant={buttonDisabled ? "secondary" : "default"}>
            {buttonDisabled ? "Upcoming" : "Active"}
          </Badge>
        </div>
        <CardDescription>Date: {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">Candidates: {election.candidates.length}</p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {election.candidates.map((candidate) => (
            <li key={candidate.id}>{candidate.member.name}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onVoteClick(election)} disabled={buttonDisabled}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}
