
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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

type VoteModalProps = {
  isOpen: boolean
  onClose: () => void
  election: Election
}

export function VoteModal({ isOpen, onClose, election }: VoteModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error("Error", {
        description: "Please select a candidate to vote."
      })
      return
    }

    setIsSubmitting(true)

    // Find the selected candidate to get memberId
    const candidate = election.candidates.find(c => c.id === selectedCandidate)
    
    if (!candidate) {
      toast.error("Error", {
        description: "Selected candidate not found."
      })
      setIsSubmitting(false)
      return
    }

    const payload = {
      electionId: election.id,
      candidateId: selectedCandidate,
      memberId: candidate.memberId
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success("Vote Submitted", {
          description: data.message || "Your vote has been recorded successfully."
        })
        setSelectedCandidate("")
        onClose()
      } else {
        toast.error("Error", {
          description: data.message || "Failed to submit vote."
        })
      }
    } catch (error) {
      console.error('Vote submission error:', error)
      toast.error("Error", {
        description: "An error occurred while submitting your vote. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vote for {election.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
            {election.candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={candidate.id} id={candidate.id} />
                <Label htmlFor={candidate.id} className="cursor-pointer">
                  {candidate.member.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleVote} disabled={isSubmitting || !selectedCandidate}>
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}