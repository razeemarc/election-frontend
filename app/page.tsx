"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ElectionDashboard from "../components/election-dashboard";
import { useUserStore } from "@/store/userStore";

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
  }, [user, isAuthenticated, router]);

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Election System</h1>
      {isAuthenticated && user?.role === "USER" ? (
        <>
          <ElectionDashboard />
          {console.log("Rendering ElectionDashboard for USER")}
        </>
      ) : !isAuthenticated ? (
        <>
          <div className="text-center">
            <p className="mb-4">Please log in to access the election system</p>
            <button 
              onClick={() => router.push("/auth")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
          {console.log("User not authenticated, showing login prompt")}
        </>
      ) : null}
    </main>
  );
}
