"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViewElections } from "./view-elections"
import { ParticipateElection } from "./participate-election"


export default function ElectionDashboard() {
  const [activeTab, setActiveTab] = useState<string>("view")

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="view" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="view">View Elections</TabsTrigger>
          <TabsTrigger value="participate">Participate in Election</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <ViewElections />
        </TabsContent>
        <TabsContent value="participate">
          <ParticipateElection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
