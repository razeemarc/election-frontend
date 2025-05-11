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
import { ArrowUpDown, MoreHorizontal, PenLine, Trash2, Calendar, Clock, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"

export type Election = {
  id: string
  title: string

  startTime: string
  endTime: string
  status: "Draft" | "Scheduled" | "Active" | "Completed" | "Cancelled"
  participants: number
  votes: number
  admin: {
    name: string
  }
  candidates: {
    id: string
  }[]
}

interface Member {
  id: string
  name: string
  email: string
  role: string
  isBlocked: boolean
  candidacies: {
    electionId: string;
  }[];
}

export function ElectionsDataTable() {
  const [data, setData] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentElection, setCurrentElection] = useState<Election | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Member[]>([])
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const [editFormData, setEditFormData] = useState({
    title: "",
   
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  })

  // Fetch elections data
  const fetchElections = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elections`)
      const elections = await response.json()
      
      const processedElections = elections.map((election: any) => {
        const now = new Date()
        const startTime = new Date(election.startTime)
        const endTime = new Date(election.endTime)
        
        let status: "Draft" | "Scheduled" | "Active" | "Completed" | "Cancelled" = "Scheduled"
        
        if (now < startTime) {
          status = "Scheduled"
        } else if (now >= startTime && now <= endTime) {
          status = "Active"
        } else if (now > endTime) {
          status = "Completed"
        }
        
        return {
          id: election.id,
          title: election.title,
        
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status,
          participants: election.candidates?.length || 0,
          votes: election.votes?.length || 0,
          admin: election.admin,
          candidates: election.candidates || []
        }
      })
      
      setData(processedElections)
    } catch (error) {
      console.error("Failed to fetch elections:", error)
      toast({
        title: "Error",
        description: "Failed to fetch elections. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch members
  const fetchMembers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`)
      const data = await response.json()
      setMembers(data.members)
    } catch (error) {
      console.error("Failed to fetch members:", error)
    }
  }

  useEffect(() => {
    fetchElections()
    fetchMembers()
  }, [])

  // Handle opening edit dialog
  const handleEditElection = (election: Election) => {
    setCurrentElection(election)
    
    // Format date and time for form inputs
    const startDateTime = new Date(election.startTime)
    const endDateTime = new Date(election.endTime)
    
    setEditFormData({
      title: election.title,
     
      startDate: startDateTime.toISOString().split('T')[0],
      startTime: startDateTime.toISOString().split('T')[1].substring(0, 5),
      endDate: endDateTime.toISOString().split('T')[0],
      endTime: endDateTime.toISOString().split('T')[1].substring(0, 5),
    })
    
    // Fetch candidates for this election and set them as selected users
    const fetchCandidates = async () => {
      try {
        // This is a placeholder. In a real app, you'd fetch the actual candidates
        // For now, let's assume we're using just the IDs from election.candidates
        const candidateMembers = members.filter(member => 
          election.candidates.some(candidate => candidate.id === member.id)
        )
        setSelectedUsers(candidateMembers)
      } catch (error) {
        console.error("Failed to fetch candidates:", error)
      }
    }
    
    fetchCandidates()
    setEditDialogOpen(true)
  }

  // Handle opening delete dialog
  const handleDeleteDialog = (election: Election) => {
    setCurrentElection(election)
    setDeleteDialogOpen(true)
  }

  // Handle input change for edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  // User filtering and selection
  const filteredUsers = members.filter(user => 
    !selectedUsers.some(selected => selected.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectUser = (user: Member) => {
    setSelectedUsers([...selectedUsers, user])
  }

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId))
  }

  // Handle saving edited election
  const handleSaveEdit = async () => {
    if (!currentElection) return
    
    setIsSubmitting(true)
    try {
      const startDateTime = `${editFormData.startDate}T${editFormData.startTime}:00`
      const endDateTime = `${editFormData.endDate}T${editFormData.endTime}:00`
      
      const payload = {
        id: currentElection.id,
        title: editFormData.title,
       
        startTime: startDateTime,
        endTime: endDateTime,
        memberIds: selectedUsers.map(user => user.id)
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/election/${currentElection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update election')
      }
      
      await fetchElections() // Refresh the elections list
      
      toast({
        title: "Success",
        description: "Election updated successfully",
      })
      
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating election:", error)
      toast({
        title: "Error",
        description: "Failed to update election. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete election
  const handleDelete = async () => {
    if (!currentElection) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/election/${currentElection.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete election')
      }
      
      // Remove the election from the local state
      setData(data.filter(election => election.id !== currentElection.id))
      
      toast({
        title: "Success",
        description: "Election deleted successfully",
      })
      
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting election:", error)
      toast({
        title: "Error",
        description: "Failed to delete election. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: ColumnDef<Election>[] = [
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
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "startTime",
      header: "Start Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("startTime"))
        return date.toLocaleDateString()
      }
    },
    {
      accessorKey: "endTime",
      header: "End Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("endTime"))
        return date.toLocaleDateString()
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={
              status === "Active"
                ? "default"
                : status === "Scheduled"
                  ? "outline"
                  : status === "Completed"
                    ? "secondary"
                    : "destructive"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "participants",
      header: "Participants",
      cell: ({ row }) => <div className="text-center">{row.getValue("participants")}</div>,
    },
    {
      accessorKey: "votes",
      header: "Votes",
      cell: ({ row }) => <div className="text-center">{row.getValue("votes")}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const election = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(election.id)}>
                Copy election ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditElection(election)}>
                <PenLine className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDeleteDialog(election)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    return <div className="flex justify-center py-8">Loading elections...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter elections..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                  No elections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Election Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Election</DialogTitle>
            <DialogDescription>
              Update the details of this election.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Election Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={editFormData.title}
                  onChange={handleInputChange}
                  placeholder="Enter election title"
                />
              </div>
            
              
              <div className="space-y-2">
                <Label htmlFor="participants">Select Participants</Label>
                <Popover open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      role="combobox" 
                      aria-expanded={userDropdownOpen}
                      className="w-full justify-between"
                    >
                      {selectedUsers.length > 0 
                        ? `${selectedUsers.length} users selected` 
                        : "Select users..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search users..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => {
                              selectUser(user);
                              setSearchQuery("");
                            }}
                          >
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-sm text-gray-500">{user.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map(user => (
                      <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                        {user.name}
                        <button
                          onClick={() => removeUser(user.id)}
                          className="rounded-full h-4 w-4 inline-flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="flex gap-2">
                    <div className="relative w-full">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={editFormData.startDate}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="time"
                        name="startTime"
                        value={editFormData.startTime}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="flex gap-2">
                    <div className="relative w-full">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={editFormData.endDate}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="time"
                        name="endTime"
                        value={editFormData.endTime}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the election 
              "{currentElection?.title}" and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}