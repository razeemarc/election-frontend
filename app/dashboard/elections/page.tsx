'use client'

import { useState, useEffect } from "react";
import { mutate } from 'swr'; // <-- Add this import
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
import { Badge } from "@/components/ui/badge";
import { ElectionsDataTable } from "@/components/dashboard/elections-data-table";
import { useUserStore } from "@/store/userStore";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  candidacies: {
    electionId: string;
  }[];
}

export default function ElectionsPage() {
  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore(); // Get current user from store
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "17:00",
  });

  // Fetch members when component mounts
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`);
        const data = await response.json();
        setMembers(data.members);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };
    
    fetchMembers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredUsers = members.filter(user => 
    !selectedUsers.some(selected => selected.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectUser = (user: Member) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleSubmit = async () => {    
    if (!user?.id) {
      console.error("No user logged in");
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        memberId: user.id,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        memberIds: selectedUsers.map(user => user.id)
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/election`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create election');
      }

      const newElection = await response.json();
      console.log("Election created:", newElection);

      // Trigger a revalidation of the elections data
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elections`);

      setOpen(false);
      // Reset form
      setFormData({
        title: "",
        description: "",
        startDate: "",
        startTime: "09:00",
        endDate: "",
        endTime: "17:00",
      });
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error creating election:", error);
    } finally {
      setLoading(false);
    }
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
                <Label htmlFor="title">Election Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
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
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Election"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}