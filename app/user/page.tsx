"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUserStore } from "@/store/userStore";
import { Vote, ArrowRight, LockKeyhole, User } from "lucide-react";
import ElectionDashboard from "@/components/election-dashboard";
import { Navbar } from "@/components/navbar";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  


  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white ">
        <Navbar />
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <Vote className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Election <span className="text-blue-600">System</span>
            </h1>
          </div>
        </div>
        
        {isAuthenticated && user?.role === "USER" ? (
          <>
            <ElectionDashboard />
            {console.log("Rendering ElectionDashboard for USER")}
          </>
        ) : !isAuthenticated && (() => {
            router.push("/auth");
            return null;
          })()}
      </div>
    </main>
  );
}