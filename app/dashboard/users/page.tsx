import type { Metadata } from "next"
import { UsersDataTable } from "@/components/dashboard/users-data-table"

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage system users",
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <UsersDataTable />
    </div>
  )
}
