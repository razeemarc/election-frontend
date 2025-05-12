
"use client"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { Navbar } from "@/components/navbar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useRef } from "react"

const inter = Inter({ subsets: ["latin"] })

// REMOVE this block:
// export const metadata: Metadata = {
//   title: "Voting Management System",
//   description: "Dashboard for managing elections and users",
//   generator: 'v0.dev'
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Create QueryClient only on the client
  const queryClientRef = useRef<QueryClient | null>(null)
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient()
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClientRef.current}>
          <ThemeProvider>
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}