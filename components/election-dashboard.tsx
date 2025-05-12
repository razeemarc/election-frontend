"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViewElections } from "./view-elections"
import { ParticipateElection } from "./participate-election"
import { Card } from "@/components/ui/card"
import { ChevronRight, Vote, UserPlus, CalendarCheck } from "lucide-react"
import { motion } from "framer-motion"

export default function ElectionDashboard() {
  const [activeTab, setActiveTab] = useState<string>("view")
  const [mounted, setMounted] = useState(false)
  
  // Handle animation after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, delay: 0.2 }
    }
  }

  return (
    <motion.div 
      className="max-w-5xl mx-auto py-8 px-4"
      initial="hidden"
      animate={mounted ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Election Dashboard
        </h1>
        <p className="text-muted-foreground">
          View ongoing elections or apply to participate in upcoming elections
        </p>
      </div>

      <Card className="overflow-hidden border-none shadow-lg">
        <Tabs 
          defaultValue="view" 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-white/80 dark:bg-black/20 backdrop-blur-sm">
              <TabsTrigger 
                value="view" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <Vote className="h-4 w-4" />
                <span>View Elections</span>
              </TabsTrigger>
              <TabsTrigger 
                value="participate"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <UserPlus className="h-4 w-4" />
                <span>Participate in Election</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={tabContentVariants}
            >
              <TabsContent value="view" className="m-0">
                <ViewElections />
              </TabsContent>
              <TabsContent value="participate" className="m-0">
                <ParticipateElection />
              </TabsContent>
            </motion.div>
          </div>
        </Tabs>
      </Card>

      
    </motion.div>
  )
}