"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ElectionDashboard from "../components/election-dashboard";
import { useUserStore } from "@/store/userStore";
import { Vote, ArrowRight, LockKeyhole, User } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  
  useEffect(() => {
    console.log("User role:", user?.role);
    console.log("Is authenticated:", isAuthenticated);
    
    if (isAuthenticated && user?.role === "ADMIN") {
      console.log("Redirecting admin to dashboard");
      router.push("/dashboard");
    }
    else if (isAuthenticated && user?.role === "USER") {
      console.log("Redirecting admin to dashboard");
      router.push("/user");
    }
  }, [user, isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white ">
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
        ) : !isAuthenticated ? (
          <>
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl border border-gray-100">
              <div className="md:flex">
                <div className="md:shrink-0 hidden md:block">
                  <div className="h-full w-48 bg-blue-600 flex items-center justify-center">
                    <Vote className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div className="p-8">
                  <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold mb-1">
                    Secure Voting Platform
                  </div>
                  <h2 className="block mt-1 text-2xl leading-tight font-bold text-gray-900">
                    Welcome to our Election Management System
                  </h2>
                  <p className="mt-4 text-gray-600">
                    Please log in to access the election system. Cast your vote securely and transparently with our state-of-the-art voting platform.
                  </p>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center text-gray-700">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Access your personalized dashboard</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Vote className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Participate in active elections</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <LockKeyhole className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Secure and private voting experience</span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button
                      onClick={() => router.push("/auth")}
                      className="group w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <span>Go to Login</span>
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {console.log("User not authenticated, showing login prompt")}
          </>
        ) : null}
      </div>
    </main>
  );
}