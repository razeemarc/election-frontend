"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    // If user is not an admin, redirect to home
    if (user?.role !== "ADMIN") {
      console.log("User role is not ADMIN, redirecting to home");
      router.push("/");
    }
  }, [user, isAuthenticated, router]);

  // Don't render anything until we've checked authentication
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex  w-full min-h-screen">
        <DashboardSidebar />
        <div className="flex-1   p-8">{children}</div>
      </div>
    </SidebarProvider>
  );
}