"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import {
  DASHBOARD_AUTH_KEY,
  DASHBOARD_LOGIN_PATH,
} from "@/lib/storage";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { value: isAuthenticated, isReady } = useLocalStorage(
    DASHBOARD_AUTH_KEY,
    false
  );

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace(DASHBOARD_LOGIN_PATH);
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-muted-foreground">
        Preparing the TruckFixr OS workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
