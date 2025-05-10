"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

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

type VoteModalProps = {
  isOpen: boolean
  onClose: () => void
  election: Election
}

export function VoteModal({ isOpen, onClose, election }: VoteModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVote = () => {
    if (!selectedCandidate) {
      toast({
        title: "Error",
        description: "Please select a candidate to vote.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully.",
      })
      setIsSubmitting(false)
      setSelectedCandidate("")
      onClose()
    }, 1000)
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
                  {candidate.name}
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
