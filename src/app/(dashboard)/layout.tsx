"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import {
  DASHBOARD_AUTH_KEY,
  DASHBOARD_LOGIN_PATH,
} from "@/lib/storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedAuth = window.sessionStorage.getItem(DASHBOARD_AUTH_KEY);

    if (storedAuth !== "true") {
      router.replace(DASHBOARD_LOGIN_PATH);
      setIsReady(true);
      return;
    }

    setIsAuthenticated(true);
    setIsReady(true);
  }, [router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-muted-foreground">
        Preparing the TruckFixr OS workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="min-h-screen lg:pl-[260px]">
        <Sidebar />
        <div className="flex min-w-0 flex-col">
          <TopBar />
          <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
