"use client"

import { useState } from "react"
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
  position: string
  requestDate: string
  status: "Pending" | "Approved" | "Denied"
}

const data: Participant[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    election: "Student Council Election",
    position: "President",
    requestDate: "2025-05-10",
    status: "Pending",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    election: "Student Council Election",
    position: "Vice President",
    requestDate: "2025-05-11",
    status: "Pending",
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    election: "Board of Directors",
    position: "Member",
    requestDate: "2025-05-20",
    status: "Approved",
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    election: "Department Head Selection",
    position: "Department Head",
    requestDate: "2025-04-05",
    status: "Denied",
  },
  {
    id: "5",
    name: "Edward Norton",
    email: "edward.norton@example.com",
    election: "Community Representative",
    position: "Representative",
    requestDate: "2025-05-15",
    status: "Pending",
  },
  {
    id: "6",
    name: "Fiona Apple",
    email: "fiona.apple@example.com",
    election: "Club President Election",
    position: "President",
    requestDate: "2025-04-01",
    status: "Approved",
  },
  {
    id: "7",
    name: "George Lucas",
    email: "george.lucas@example.com",
    election: "Faculty Senate",
    position: "Senator",
    requestDate: "2025-06-20",
    status: "Pending",
  },
  {
    id: "8",
    name: "Hannah Montana",
    email: "hannah.montana@example.com",
    election: "Student Union Representatives",
    position: "Representative",
    requestDate: "2025-03-10",
    status: "Approved",
  },
]

export function ParticipantsDataTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

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
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => <div>{row.getValue("position")}</div>,
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
        const isPending = participant.status === "Pending"

        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!isPending}
              onClick={() => console.log("Approve", participant.id)}
            >
              <Check className="h-4 w-4 text-green-500" />
              <span className="sr-only">Approve</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!isPending}
              onClick={() => console.log("Deny", participant.id)}
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
                  No participants found.
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
