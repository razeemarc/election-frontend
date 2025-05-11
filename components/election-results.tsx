"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, Calendar, User } from "lucide-react"

// Define types based on the API response
interface Member {
  id: string
  name: string
  email: string
}

interface Candidate {
  id: string
  member: Member
  status: "PENDING" | "APPROVED"
  voteCount: number
}

interface Election {
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

export default function ElectionResults() {
  const [elections, setElections] = useState<Election[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchElectionResults = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/results/`)

        if (!response.ok) {
          throw new Error(`Failed to fetch election results: ${response.status}`)
        }

        const data: ApiResponse = await response.json()

        if (data.success) {
          setElections(data.data)
        } else {
          throw new Error("API returned unsuccessful response")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching election results:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchElectionResults()
  }, [])

  // Calculate the maximum vote count for an election to set the progress bar scale
  const getMaxVotes = (candidates: Candidate[]) => {
    if (candidates.length === 0) return 1
    return Math.max(...candidates.map((candidate) => candidate.voteCount), 1)
  }

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading Election Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Election Results</h1>

      {elections.length === 0 ? (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No elections found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {elections.map((election) => {
            const maxVotes = getMaxVotes(election.candidates)
            const totalVotes = election.candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0)
            const isActive = new Date(election.endTime) > new Date()

            return (
              <Card key={election.id} className="w-full overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{election.title}</CardTitle>
                      <CardDescription>{election.description}</CardDescription>
                    </div>
                    <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Ended"}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(election.startTime)} - {formatDate(election.endTime)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {election.candidates.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No candidates for this election</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-sm text-muted-foreground mb-2">Total votes: {totalVotes}</div>
                      {election.candidates.map((candidate) => {
                        const votePercentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0

                        return (
                          <div key={candidate.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-slate-500" />
                                <div>
                                  <div className="font-medium">{candidate.member.name}</div>
                                  <div className="text-xs text-muted-foreground">{candidate.member.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {candidate.voteCount} {candidate.voteCount === 1 ? "vote" : "votes"}
                                </Badge>
                                {votePercentage > 0 && <Badge variant="secondary">{votePercentage}%</Badge>}
                              </div>
                            </div>
                            <Progress value={(candidate.voteCount / maxVotes) * 100} className="h-2" />
                          </div>
                        )
                      })}

                      {/* Show winner if election has ended */}
                      {!isActive && totalVotes > 0 && <WinnerDisplay candidates={election.candidates} />}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function WinnerDisplay({ candidates }: { candidates: Candidate[] }) {
  if (candidates.length === 0) return null

  // Find the candidate with the most votes
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount)
  const winner = sortedCandidates[0]

  // Check if there's a tie
  const isTie =
    sortedCandidates.length > 1 &&
    sortedCandidates[0].voteCount === sortedCandidates[1].voteCount &&
    sortedCandidates[0].voteCount > 0

  if (winner.voteCount === 0) return null

  return (
    <div className="mt-6 pt-4 border-t">
      {isTie ? (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Award className="h-5 w-5" />
          <span className="font-medium">Tie between multiple candidates</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Award className="h-5 w-5" />
          <span className="font-medium">Winner: {winner.member.name}</span>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Election Results</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
