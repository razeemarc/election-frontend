import type { Metadata } from "next"
import { UsersDataTable } from "@/components/dashboard/users-data-table"

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage system users",
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      <UsersDataTable />
    </div>
  )
}
