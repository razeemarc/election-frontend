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
import { ArrowUpDown, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type Participant = {
  id: string
  name: string
  email: string
  election: string
  requestDate: string
  status: "Pending" | "Approved" | "Denied"
  memberId: string
  electionId: string
}

export function ParticipantsDataTable() {
  const [data, setData] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    const fetchPendingCandidates = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/pending`)
        const result = await response.json()
        
        if (result.success) {
          // Transform API data to match our table format
          const participants = result.data.map((candidate: any) => ({
            id: candidate.id,
            name: candidate.member.name,
            email: candidate.member.email,
            election: candidate.election.title,
            requestDate: new Date(candidate.appliedAt).toISOString().split('T')[0],
            status: "Pending", // Since we're only fetching pending candidates
            memberId: candidate.memberId,
            electionId: candidate.electionId
          }))
          
          setData(participants)
        }
      } catch (error) {
        console.error("Failed to fetch pending candidates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingCandidates()
  }, [])

  const handleApprove = async (candidateId: string, memberId: string, electionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/approve/${memberId}/${electionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "APPROVED"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve candidate')
      }

      // Remove the approved candidate from the list
      setData(prevData => prevData.filter(participant => participant.id !== candidateId))
    } catch (error) {
      console.error("Error approving candidate:", error)
    }
  }

  const handleDeny = async (candidateId: string, memberId: string, electionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/reject/${memberId}/${electionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to reject candidate')
      }

      // Remove the rejected candidate from the list
      setData(prevData => prevData.filter(participant => participant.id !== candidateId))
    } catch (error) {
      console.error("Error rejecting candidate:", error)
    }
  }

  const columns: ColumnDef<Participant>[] = [
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
      accessorKey: "election",
      header: "Election",
      cell: ({ row }) => <div>{row.getValue("election")}</div>,
    },
    {
      accessorKey: "requestDate",
      header: "Request Date",
      cell: ({ row }) => <div>{row.getValue("requestDate")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "Approved" ? "default" : status === "Pending" ? "outline" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const participant = row.original

        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleApprove(participant.id, participant.memberId, participant.electionId)}
            >
              <Check className="h-4 w-4 text-green-500" />
              <span className="sr-only">Approve</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleDeny(participant.id, participant.memberId, participant.electionId)}
            >
              <X className="h-4 w-4 text-red-500" />
              <span className="sr-only">Deny</span>
            </Button>
          </div>
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
    return <div className="flex justify-center py-8">Loading pending candidates...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter participants..."
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
                  No pending candidates found.
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