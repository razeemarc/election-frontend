"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Moon, Sun, User, LogOut, Vote, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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
    setIsDropdownOpen(false)
    // Optionally, redirect to login page
    window.location.href = "/auth"
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Gradient overlay for extra visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      
      <div className="relative container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left side - Logo */}
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {user?.role !== "ADMIN" && (
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                whileHover={{ rotate: 5, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Vote className="h-6 w-6 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <motion.h1 
                  className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Election Management
                </motion.h1>
                <motion.div 
                  className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4 }}
                />
              </div>
            </Link>
          )}
        </motion.div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="h-4 w-4 text-yellow-500" />
                )}
              </motion.div>
            </Button>
          </motion.div>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full p-1 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200/50 dark:border-blue-700/50 transition-all duration-300"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Avatar className="h-8 w-8 ring-2 ring-white/50 dark:ring-gray-800/50">
                  {/* Removed AvatarImage */}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </motion.div>

            {/* Enhanced Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    className="absolute right-0 top-full mt-2 z-50"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                      {/* User Info Section */}
                      <div className="relative p-6 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/50 dark:to-purple-950/50">
                        <div className="absolute top-0 right-0 p-2">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                          </motion.div>
                        </div>
                        
                        <div className="flex flex-col items-center text-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Avatar className="h-16 w-16 mb-3 ring-4 ring-white/50 dark:ring-gray-800/50 shadow-lg">
                              {/* Removed AvatarImage */}
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          
                          <motion.h3 
                            className="text-lg font-semibold text-gray-900 dark:text-white mb-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            {user?.name || "User"}
                          </motion.h3>
                          
                          <motion.p 
                            className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {user?.email || ""}
                          </motion.p>
                        </div>
                      </div>
                      
                      {/* Actions Section */}
                      <div className="p-3">
                        <motion.button
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200 font-medium group"
                          onClick={handleLogout}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                          Log Out
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                
                <SheetContent side="right" className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-l border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <motion.div 
                      className="flex items-center gap-3 p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <Vote className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Navigation
                      </h2>
                    </motion.div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-6">
                      <div className="space-y-3">
                        {[
                          { href: "/", label: "Home", delay: 0.1 },
                          { href: "/dashboard", label: "Dashboard", delay: 0.2 },
                          { href: "/about", label: "About", delay: 0.3 },
                          { href: "/profile", label: "Profile", delay: 0.4 }
                        ].map((item) => (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: item.delay }}
                          >
                            <Link
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all duration-200 group"
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                                {item.label}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </nav>

                    {/* Footer */}
                    <motion.div 
                      className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-950/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Connected as {user?.name}</span>
                      </div>
                    </motion.div>
                  </div>
                </SheetContent>
              </Sheet>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}