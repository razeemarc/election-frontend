"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, Calendar, User, Clock, ChevronRight, AlertTriangle, CheckCircle2, Users } from "lucide-react"

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
      <Card className="w-full max-w-4xl mx-auto my-8 border-red-200 dark:border-red-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <CardTitle className="text-red-600 dark:text-red-400">Error Loading Election Results</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Election Results
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          View the latest results from all elections
        </p>
      </div>

      {elections.length === 0 ? (
        <Card className="w-full max-w-4xl mx-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 shadow-md">
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-center text-muted-foreground">No elections found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {elections.map((election) => {
            const maxVotes = getMaxVotes(election.candidates)
            const totalVotes = election.candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0)
            const isActive = new Date(election.endTime) > new Date()
            const gradientFromColor = isActive ? "from-blue-50" : "from-slate-50"
            const gradientToColor = isActive ? "to-blue-100/30" : "to-slate-100/30"
            const darkGradientFromColor = isActive ? "dark:from-blue-900/20" : "dark:from-slate-900/40"
            const darkGradientToColor = isActive ? "dark:to-blue-900/5" : "dark:to-slate-900/20"

            return (
              <Card 
                key={election.id} 
                className="w-full overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <CardHeader className={`bg-gradient-to-r ${gradientFromColor} ${gradientToColor} ${darkGradientFromColor} ${darkGradientToColor}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold">{election.title}</CardTitle>
                      <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">{election.description}</CardDescription>
                    </div>
                    <Badge 
                      variant={isActive ? "default" : "secondary"}
                      className={`${isActive 
                        ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"} 
                        px-3 py-1 text-xs font-medium flex items-center gap-1`}
                    >
                      {isActive ? (
                        <>
                          <Clock className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Ended
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-4">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(election.startTime)} - {formatDate(election.endTime)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 pb-8">
                  {election.candidates.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
                      <User className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                      <p>No candidates for this election</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <Users className="h-4 w-4" />
                        <span>Total votes: <span className="font-semibold text-slate-700 dark:text-slate-300">{totalVotes}</span></span>
                      </div>
                      
                      <div className="space-y-6">
                        {election.candidates.map((candidate, index) => {
                          const votePercentage = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0
                          const isLeading = 
                            !isActive && 
                            index === 0 && 
                            election.candidates.sort((a, b) => b.voteCount - a.voteCount)[0].id === candidate.id && 
                            candidate.voteCount > 0

                          return (
                            <div 
                              key={candidate.id} 
                              className={`space-y-3 p-4 rounded-lg transition-all ${
                                isLeading ? "bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                    isLeading ? "bg-green-500" : "bg-blue-500"
                                  }`}>
                                    {candidate.member.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                      {candidate.member.name}
                                      {isLeading && (
                                        <Award className="h-4 w-4 text-amber-500" />
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{candidate.member.email}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-mono bg-white dark:bg-slate-900">
                                    {candidate.voteCount} {candidate.voteCount === 1 ? "vote" : "votes"}
                                  </Badge>
                                  {votePercentage > 0 && (
                                    <Badge 
                                      variant="secondary" 
                                      className="font-medium"
                                      style={{
                                        backgroundColor: isLeading ? 'rgba(34, 197, 94, 0.1)' : undefined,
                                        color: isLeading ? 'rgb(22, 163, 74)' : undefined
                                      }}
                                    >
                                      {votePercentage}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="relative pt-1">
                                <Progress 
                                  value={(candidate.voteCount / maxVotes) * 100} 
                                  className={`h-2 ${isLeading ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}
                                  style={{
                                    "--progress-background": isLeading ? "rgb(34, 197, 94)" : undefined
                                  } as React.CSSProperties}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>

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
    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
      {isTie ? (
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-lg">Tie Result</span>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80">Multiple candidates have received the same number of votes</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-lg">Winner: {winner.member.name}</span>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
              Received {winner.voteCount} {winner.voteCount === 1 ? 'vote' : 'votes'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Election Results
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          View the latest results from all elections
        </p>
      </div>
      
      <div className="grid gap-8">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/30 dark:from-slate-900/40 dark:to-slate-900/20">
              <div className="flex justify-between">
                <div className="space-y-3 w-2/3">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-40" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <Skeleton className="h-4 w-32" />
              
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-3 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
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