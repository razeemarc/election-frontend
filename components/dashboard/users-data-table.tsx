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
import { 
  ArrowUpDown, 
  Lock, 
  Unlock, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  UserX,
  UserPlus,
  UserCheck,
  Download,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMembersQuery } from "@/hooks/useMembersQuery"
// REMOVE: import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

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
  const { data = [], isLoading, isError, error, refetch } = useMembersQuery()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [activeTab, setActiveTab] = useState("all")
  const [pageSize, setPageSize] = useState(10)

  // REMOVE this entire useEffect and its fetchMembers function
  // useEffect(() => {
  //   const fetchMembers = async () => { ... }
  //   fetchMembers()
  // }, [])

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

      // Instead of setData, just refetch the query data
      refetch()
    } catch (error) {
      console.error("Error updating member status:", error)
    }
  }

  const columns: ColumnDef<Member>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-transparent">
            Name
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.getValue("name")}`} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {(row.getValue("name") as string).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-xs text-muted-foreground">{row.getValue("email")}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge 
            variant={role === "Admin" ? "default" : role === "Moderator" ? "secondary" : "outline"} 
            className="font-medium"
          >
            {role === "Admin" && <div className="mr-1 h-2 w-2 rounded-full bg-white inline-block" />}
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className="flex items-center">
            <div className={`mr-2 h-2 w-2 rounded-full ${status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
            <span className={`text-sm ${status === "Active" ? "text-green-600" : "text-red-600"}`}>{status}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "candidacies",
      header: "Elections",
      cell: ({ row }) => {
        const candidacies = row.original.candidacies || []
        return (
          <div className="flex items-center">
            {candidacies.length > 0 ? (
              <Badge variant="outline" className="bg-blue-50">
                {candidacies.length} {candidacies.length === 1 ? 'election' : 'elections'}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>
        )
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
            variant={isBlocked ? "outline" : "ghost"} 
            size="sm" 
            onClick={() => handleBlockToggle(member.id, isBlocked)}
            className={`${isBlocked ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
          >
            {isBlocked ? (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Unblock
              </>
            ) : (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Block
              </>
            )}
          </Button>
        )
      },
    },
  ]

  // Filter data based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      table.resetColumnFilters()
    } else if (activeTab === "active") {
      table.getColumn("status")?.setFilterValue("Active")
    } else if (activeTab === "blocked") {
      table.getColumn("status")?.setFilterValue("Blocked")
    }
  }, [activeTab])

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

  // Update page size when it changes
  useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  // Calculate stats
  const totalUsers = Array.isArray(data) ? data.length : 0
  const activeUsers = Array.isArray(data) ? data.filter(user => user && user.isBlocked === false).length : 0
  const blockedUsers = Array.isArray(data) ? data.filter(user => user && user.isBlocked === true).length : 0

  // Render loading state
  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">Users Management</CardTitle>
          <CardDescription>View and manage all system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg flex-1"></div>
            ))}
          </div>
          <div className="bg-gray-100 animate-pulse h-96 rounded-lg w-full"></div>
        </CardContent>
      </Card>
    )
  }

  // Render error state
  if (isError) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">Users Management</CardTitle>
          <CardDescription>View and manage all system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <UserX className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">Error Loading Users</h3>
              <p className="text-muted-foreground">{(error as Error).message}</p>
              <Button 
                onClick={() => refetch()} 
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <span>Users Management</span>
         
        </CardTitle>
        <CardDescription>View and manage all system users</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-700">{totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-red-600">{blockedUsers}</div>
              <div className="text-sm text-muted-foreground">Blocked Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
              <TabsTrigger value="all" className="px-4">All Users</TabsTrigger>
              <TabsTrigger value="active" className="px-4">Active</TabsTrigger>
              <TabsTrigger value="blocked" className="px-4">Blocked</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="pl-8 pr-4"
              />
            </div>
            {/* <Button variant="outline" size="icon" className="hidden md:flex">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="hidden md:flex">
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-medium text-muted-foreground">
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
                    className={`${row.original.isBlocked ? "bg-red-50/30" : ""} hover:bg-muted/40 transition-colors`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <UserX className="h-8 w-8 mb-2" />
                      <p>No users found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div>
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
            </div>
            <div className="flex items-center gap-2">
              <span>Show</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue>{pageSize}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}