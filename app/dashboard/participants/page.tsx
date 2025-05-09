import type { Metadata } from "next"
import { ParticipantsDataTable } from "@/components/dashboard/participants-data-table"

export const metadata: Metadata = {
  title: "Participant Requests",
  description: "Manage participant requests",
}

export default function ParticipantsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Participant Requests</h1>
      <ParticipantsDataTable />
    </div>
  )
}
