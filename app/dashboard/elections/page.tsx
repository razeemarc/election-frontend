'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, Clock, Check, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ElectionsDataTable } from "@/components/dashboard/elections-data-table";

// Mock users data
const users = [
  { id: "1", name: "John Smith", email: "john.smith@example.com", department: "Engineering" },
  { id: "2", name: "Sarah Johnson", email: "sarah.johnson@example.com", department: "Marketing" },
  { id: "3", name: "Michael Brown", email: "michael.brown@example.com", department: "HR" },
  { id: "4", name: "Emma Davis", email: "emma.davis@example.com", department: "Finance" },
  { id: "5", name: "James Wilson", email: "james.wilson@example.com", department: "Engineering" },
  { id: "6", name: "Olivia Taylor", email: "olivia.taylor@example.com", department: "Product" },
  { id: "7", name: "William Anderson", email: "william.anderson@example.com", department: "Sales" },
  { id: "8", name: "Sophia Martinez", email: "sophia.martinez@example.com", department: "Marketing" },
  { id: "9", name: "Benjamin Thomas", email: "benjamin.thomas@example.com", department: "Engineering" },
  { id: "10", name: "Isabella Garcia", email: "isabella.garcia@example.com", department: "Legal" },
];

export default function ElectionsPage() {
  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<typeof users>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    status: "Draft",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "17:00",
  });

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: any) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const filteredUsers = users.filter(user => 
    !selectedUsers.some(selected => selected.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectUser = (user: { id: string; name: string; email: string; department: string; }) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleSubmit = () => {    
    const newElection = {
      id: Math.floor(Math.random() * 1000).toString(),
      name: formData.name,
      participants: selectedUsers.length,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      votes: 0,
      // Include the selected users
      selectedUsers: selectedUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email
      }))
    };
    
    console.log("New election created:", newElection);
    // Here you would typically add this to your data array
    // and/or send it to your backend
    
    setOpen(false);
    // Reset form
    setFormData({
      name: "",
      status: "Draft",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "17:00",
    });
    setSelectedUsers([]);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Elections</h1>
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Election
        </Button>
      </div>
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow p-4">
        <ElectionsDataTable />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Election</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new election.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Election Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter election name"
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
                            <Check
                              className="ml-auto h-4 w-4 opacity-0"
                            />
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
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative w-24">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
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
  value={formData.endDate}
  onChange={handleInputChange}
  className="pl-10"
/>
</div>
<div className="relative w-24">
  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
  <Input
    type="time"
    name="endTime"
    value={formData.endTime}
    onChange={handleInputChange}
    className="pl-10"
/>
</div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit}>Create Election</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}