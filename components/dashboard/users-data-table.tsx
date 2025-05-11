"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Lock, Unlock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type Member = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MODERATOR" | "USER"
  isBlocked: boolean
  candidacies: {
    electionId: string
  }[]
  lastLogin?: string
}

export function UsersDataTable() {
  const [data, setData] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`)
        const result = await response.json()
        
        // Transform API data to match our table format
        const members = result.members.map((member: Member) => ({
          ...member,
          status: member.isBlocked ? "Blocked" : "Active",
          role: member.role === "ADMIN" ? "Admin" : 
                member.role === "MODERATOR" ? "Moderator" : "User",
          lastLogin: member.lastLogin || "Never logged in"
        }))
        
        setData(members)
      } catch (error) {
        console.error("Failed to fetch members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const handleBlockToggle = async (memberId: string, isCurrentlyBlocked: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/block/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          block: !isCurrentlyBlocked
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update member status')
      }

      // Update local state to reflect the change
      setData(prevData => 
        prevData.map(member => 
          member.id === memberId 
            ? { 
                ...member, 
                isBlocked: !isCurrentlyBlocked, 
                status: !isCurrentlyBlocked ? "Active" : "Blocked" 
              } 
            : member
        )
      )
    } catch (error) {
      console.error("Error updating member status:", error)
    }
  }

  const columns: ColumnDef<Member>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={row.getValue("name")} />
            <AvatarFallback>{(row.getValue("name") as string).charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{row.getValue("name")}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant={role === "Admin" ? "default" : role === "Moderator" ? "secondary" : "outline"}>{role}</Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return <Badge variant={status === "Active" ? "default" : "destructive"}>{status}</Badge>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original
        const isBlocked = member.isBlocked
        
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleBlockToggle(member.id, isBlocked)}
          >
            {isBlocked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Unblock
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Block
              </>
            )}
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  if (loading) {
    return <div className="flex justify-center py-8">Loading members...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter users..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}