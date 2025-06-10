"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Moon, Sun, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "@/components/theme-provider"
import { useUserStore } from "@/store/userStore"
import Cookies from "js-cookie"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Get user data from Zustand store
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)

  // Logout handler
  const handleLogout = () => {
    // Clear cookies (adjust cookie names as needed)
    Cookies.remove("token")
    Cookies.remove("user")
    // Clear Zustand store
    logout()
    // Optionally, redirect to login page
    window.location.href = "/auth"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" className="font-bold text-xl ml-10">
           Election management 
          </Link>
          <nav className="hidden md:flex items-center gap-6">
           
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
         

          {/* Simplified Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  {/* Removed AvatarImage */}
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-0 mt-1">
              {/* User Info */}
              <div className="flex flex-col items-center p-6 pb-4 border-b">
                <Avatar className="h-16 w-16 mb-2">
                  {/* Removed AvatarImage */}
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <p className="text-lg font-medium">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
              </div>
              
              {/* Logout Only */}
              <div className="p-2">
                <DropdownMenuItem
                  className="flex justify-center px-6 py-3 text-base hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={handleLogout}
                >
                  Log Out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/about"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/profile"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}