"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, UserCheck, FileText, Clipboard, AlertCircle, CheckCircle2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserStore } from "@/store/userStore"
import { motion } from "framer-motion"
import { useElectionsList } from "@/hooks/useElectionsList"

// Define Election type
interface Election {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
}

export function ParticipateElection() {
  const [name, setName] = useState("")
  const [selectedElectionId, setSelectedElectionId] = useState<string>("")
  const { data: elections = [], isLoading: isElectionsLoading, isError } = useElectionsList()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { user } = useUserStore()

  // REMOVE this entire useEffect block and related state:
  // useEffect(() => {
  //   const fetchElections = async () => {
  //     try {
  //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elections`)
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch elections")
  //       }
  //       const data = await response.json()
  //       setElections(data)
  //     } catch (error) {
  //       console.error("Error fetching elections:", error)
  //       toast.error("Error", {
  //         description: "Failed to load elections. Please try again later."
  //       })
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }
  //   fetchElections()
  // }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!selectedElectionId || !date) {
      toast.error("Error", {
        description: "Please fill in all required fields."
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format date to YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0]

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: user?.name || "",
          electionId: selectedElectionId,
          proposedElectionDate: formattedDate,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsSubmitted(true)
        toast.success("Application Submitted", {
          description: "Your election participation request has been submitted successfully."
        })
        
        // Reset form
        setSelectedElectionId("")
        setDate(undefined)
      } else {
        // Display the specific error message from the API
        toast.error("Error", {
          description: data.message || "Failed to submit application."
        })
      }
      
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Error", {
        description: "An error occurred. Please try again later."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  const SubmissionSuccess = () => (
    <motion.div 
      className="text-center py-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-green-50 dark:bg-green-900/20 rounded-full mx-auto p-4 w-20 h-20 flex items-center justify-center mb-4">
        <CheckCircle2 className="h-10 w-10 text-green-500 dark:text-green-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Application Submitted Successfully!</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Your candidacy application has been received and is being reviewed.</p>
      <Button 
        onClick={() => setIsSubmitted(false)} 
        variant="outline"
        className="bg-white dark:bg-gray-800"
      >
        Submit Another Application
      </Button>
    </motion.div>
  )

  return (
    <Card className="w-full overflow-hidden border-t-4 border-t-purple-500 dark:border-t-purple-400 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
        <div className="flex items-center gap-2 mb-2">
          <UserCheck className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          <CardTitle>Participate in an Election</CardTitle>
        </div>
        <CardDescription>Fill out this form to register as a candidate for an upcoming election.</CardDescription>
      </CardHeader>
      
      {isSubmitted ? (
        <CardContent className="pt-6">
          <SubmissionSuccess />
        </CardContent>
      ) : (
        <CardContent className="pt-6">
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial="hidden"
            animate="visible"
            variants={formVariants}
          >
            <motion.div className="space-y-2" variants={itemVariants}>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-gray-500" />
                <Label htmlFor="name" className="font-medium">Your Full Name</Label>
              </div>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={user?.name || ""}
                  readOnly
                  required
                  className="pl-3 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-xs font-normal">
                    From Profile
                  </Badge>
                </div>
              </div>
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <div className="flex items-center gap-2 mb-1">
                <Clipboard className="h-4 w-4 text-gray-500" />
                <Label className="font-medium">Election Title</Label>
              </div>
              <Select
                disabled={isElectionsLoading}
                value={selectedElectionId}
                onValueChange={setSelectedElectionId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an election" />
                </SelectTrigger>
                <SelectContent>
                  {elections.map((election) => (
                    <SelectItem key={election.id} value={election.id}>
                      {election.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isElectionsLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> Loading available elections...
                </p>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <Label className="font-medium">Proposed Election Date</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal", 
                      !date && "text-muted-foreground",
                      date && "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button 
                type="submit" 
                className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg" 
                disabled={isSubmitting || isElectionsLoading}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : "Submit Application"}
              </Button>
            </motion.div>
          </motion.form>
        </CardContent>
      )}
    </Card>
  )
}

function Badge({ 
  children, 
  variant = "default",
  className = "" 
}: { 
  children: React.ReactNode, 
  variant?: "default" | "secondary", 
  className?: string 
}) {
  return (
    <span 
      className={`px-2 py-0.5 rounded-full ${
        variant === "default" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : 
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      } ${className}`}
    >
      {children}
    </span>
  );
}