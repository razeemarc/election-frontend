"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoteModal } from "./vote-model"


// Mock data for elections
const mockElections = [
  {
    id: "1",
    title: "Student Council Election",
    date: "2025-06-15",
    status: "current" as const,
    candidates: [
      { id: "c1", name: "Alex Johnson", votes: 120 },
      { id: "c2", name: "Sarah Williams", votes: 95 },
      { id: "c3", name: "Michael Brown", votes: 78 },
    ],
  },
  {
    id: "2",
    title: "Class Representative Election",
    date: "2025-06-20",
    status: "current" as const,
    candidates: [
      { id: "c4", name: "Emily Davis", votes: 45 },
      { id: "c5", name: "David Wilson", votes: 52 },
    ],
  },
  {
    id: "3",
    title: "School Board Election",
    date: "2025-07-10",
    status: "upcoming" as const,
    candidates: [
      { id: "c6", name: "Jennifer Taylor", votes: 0 },
      { id: "c7", name: "Robert Miller", votes: 0 },
      { id: "c8", name: "Patricia Moore", votes: 0 },
    ],
  },
  {
    id: "4",
    title: "Sports Committee Election",
    date: "2025-07-25",
    status: "upcoming" as const,
    candidates: [
      { id: "c9", name: "Thomas Anderson", votes: 0 },
      { id: "c10", name: "Jessica Martin", votes: 0 },
    ],
  },
]

type Election = {
  id: string
  title: string
  date: string
  status: "current" | "upcoming"
  candidates: Candidate[]
}

type Candidate = {
  id: string
  name: string
  votes: number
}

export function ViewElections() {
  const [elections] = useState<Election[]>(mockElections)
  const [selectedElection, setSelectedElection] = useState<Election | null>(null)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)

  const currentElections = elections.filter((election) => election.status === "current")
  const upcomingElections = elections.filter((election) => election.status === "upcoming")

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
          {currentElections.length > 0 ? (
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
          {upcomingElections.length > 0 ? (
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
  const formattedDate = new Date(election.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{election.title}</CardTitle>
          <Badge variant={election.status === "current" ? "default" : "secondary"}>
            {election.status === "current" ? "Active" : "Upcoming"}
          </Badge>
        </div>
        <CardDescription>Date: {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">Candidates: {election.candidates.length}</p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {election.candidates.map((candidate) => (
            <li key={candidate.id}>{candidate.name}</li>
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
