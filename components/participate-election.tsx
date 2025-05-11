"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [elections, setElections] = useState<Election[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch elections on component mount
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elections`)
        if (!response.ok) {
          throw new Error("Failed to fetch elections")
        }
        const data = await response.json()
        setElections(data)
      } catch (error) {
        console.error("Error fetching elections:", error)
        toast.error("Error", {
          description: "Failed to load elections. Please try again later."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchElections()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name || !selectedElectionId || !date) {
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
          userName: name,
          electionId: selectedElectionId,
          proposedElectionDate: formattedDate,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success("Application Submitted", {
          description: "Your election participation request has been submitted successfully."
        })
        
        // Reset form
        setName("")
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Participate in an Election</CardTitle>
        <CardDescription>Fill out this form to register as a candidate for an upcoming election.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Election Title</Label>
            <Select
              disabled={isLoading}
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
          </div>

          <div className="space-y-2">
            <Label>Proposed Election Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <CardFooter className="px-0 pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
