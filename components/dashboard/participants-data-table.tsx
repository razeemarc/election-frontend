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
import { ArrowUpDown, Check, X, Search, Loader2, UserPlus, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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

  const getRandomColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", 
      "bg-teal-500", "bg-orange-500", "bg-cyan-500"
    ];
    
    // Generate a consistent index based on the name string
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

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
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-semibold">
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const colorClass = getRandomColor(name);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
              <AvatarFallback className={`${colorClass} text-white`}>
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium">{name}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-gray-600">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "election",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-semibold">
            Election
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("election")}</div>,
    },
    {
      accessorKey: "requestDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-semibold">
            Request Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          {row.getValue("requestDate")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge 
            variant={status === "Approved" ? "default" : status === "Pending" ? "outline" : "destructive"}
            className={`${status === "Pending" ? "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100" : ""} px-3 py-1`}
          >
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
              className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:text-green-600"
              onClick={() => handleApprove(participant.id, participant.memberId, participant.electionId)}
              title="Approve"
            >
              <Check className="h-4 w-4 text-green-500" />
              <span className="sr-only">Approve</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={() => handleDeny(participant.id, participant.memberId, participant.electionId)}
              title="Deny"
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
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-gray-600">Loading pending candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="shadow-md border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">Pending Candidates</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Review and manage participant requests
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-white px-3 py-1">
              <UserPlus className="h-4 w-4 mr-1" />
              <span>{data.length} Pending</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search participants..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="text-gray-700 font-semibold">
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
                    <TableRow 
                      key={row.id} 
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-blue-50 transition-colors border-b last:border-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <UserPlus className="h-10 w-10 mb-2 text-gray-400" />
                        <p className="text-lg font-medium">No pending candidates found</p>
                        <p className="text-gray-400 text-sm mt-1">All requests have been processed</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="flex-1 text-sm text-gray-600">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
              selected.
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}