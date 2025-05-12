"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoteModal } from "./vote-model"
import { toast } from "sonner"
import { ElectionSkeleton } from "@/components/ui/election-skeleton"
import { Calendar, Clock, Users, Award, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  }

  const EmptyState = ({ message }: { message: string }) => (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
      </div>
      <p className="text-muted-foreground text-lg">{message}</p>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="current" className="rounded-md">
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Current Elections
            </span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-md">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Elections
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {isLoading ? (
            <ElectionSkeleton />
          ) : currentElections.length > 0 ? (
            <motion.div 
              className="grid gap-6 md:grid-cols-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {currentElections.map((election, i) => (
                <motion.div 
                  key={election.id}
                  custom={i}
                  variants={cardVariants}
                >
                  <ElectionCard
                    election={election}
                    onVoteClick={handleVoteClick}
                    buttonText="Vote Now"
                    buttonDisabled={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState message="No current elections available." />
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {isLoading ? (
            <ElectionSkeleton />
          ) : upcomingElections.length > 0 ? (
            <motion.div 
              className="grid gap-6 md:grid-cols-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {upcomingElections.map((election, i) => (
                <motion.div 
                  key={election.id}
                  custom={i}
                  variants={cardVariants}
                >
                  <ElectionCard
                    election={election}
                    onVoteClick={handleVoteClick}
                    buttonText="Coming Soon"
                    buttonDisabled={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState message="No upcoming elections scheduled." />
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
  
  const formattedTime = new Date(election.startTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedEndTime = new Date(election.endTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4 border-t-blue-500 dark:border-t-blue-400">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{election.title}</CardTitle>
          <Badge variant={buttonDisabled ? "outline" : "default"} className={buttonDisabled ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" : "bg-gradient-to-r from-blue-500 to-purple-500"}>
            {buttonDisabled ? "Upcoming" : "Active"}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 mt-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{formattedTime} - {formattedEndTime}</span>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Candidates ({election.candidates.length})</span>
          </div>
          <ul className="space-y-1.5 pl-6">
            {election.candidates.map((candidate) => (
              <li key={candidate.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                {candidate.member.name}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Button 
          className={`w-full ${!buttonDisabled ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" : ""}`}
          onClick={() => onVoteClick(election)} 
          disabled={buttonDisabled}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}