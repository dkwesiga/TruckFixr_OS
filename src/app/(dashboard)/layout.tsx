"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getDataMode, isSupabaseConfigured } from "@/lib/supabase/env";
import {
  DASHBOARD_AUTH_KEY,
  DASHBOARD_LOGIN_PATH,
  getItem,
  STORAGE_KEYS,
} from "@/lib/storage";

type DemoModeState = {
  active: boolean;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Primary auth gate: sessionStorage flag (set by password gate or auth callback).
  // In supabase mode, also fall back to checking a live Supabase session so that
  // a page refresh on a new tab doesn't log the user out while their JWT is valid.
  useEffect(() => {
    const storedAuth = window.sessionStorage.getItem(DASHBOARD_AUTH_KEY);

    if (storedAuth === "true") {
      setIsAuthenticated(true);
      setIsDemoModeActive(
        getItem<DemoModeState>(STORAGE_KEYS.DEMO_MODE)?.active ?? false,
      );
      setIsReady(true);
      return;
    }

    if (getDataMode() === "supabase" && isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          window.sessionStorage.setItem(DASHBOARD_AUTH_KEY, "true");
          setIsAuthenticated(true);
          setIsDemoModeActive(
            getItem<DemoModeState>(STORAGE_KEYS.DEMO_MODE)?.active ?? false,
          );
        } else {
          router.replace(DASHBOARD_LOGIN_PATH);
        }
        setIsReady(true);
      });
      return;
    }

    router.replace(DASHBOARD_LOGIN_PATH);
    setIsReady(true);
  }, [router]);

  // In supabase mode, keep auth state in sync across the session lifetime
  // (token refresh, sign-out from another tab, etc.).
  useEffect(() => {
    if (getDataMode() !== "supabase" || !isSupabaseConfigured()) return;

    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        window.sessionStorage.removeItem(DASHBOARD_AUTH_KEY);
        setIsAuthenticated(false);
        router.replace(DASHBOARD_LOGIN_PATH);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        window.sessionStorage.setItem(DASHBOARD_AUTH_KEY, "true");
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Keep demo-mode banner in sync with localStorage changes.
  useEffect(() => {
    function syncDemoMode() {
      setIsDemoModeActive(
        getItem<DemoModeState>(STORAGE_KEYS.DEMO_MODE)?.active ?? false,
      );
    }

    window.addEventListener("storage", syncDemoMode);
    window.addEventListener("tf_os_storage_change", syncDemoMode);

    return () => {
      window.removeEventListener("storage", syncDemoMode);
      window.removeEventListener("tf_os_storage_change", syncDemoMode);
    };
  }, []);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-muted-foreground">
        Preparing the TruckFixr OS workspace&hellip;
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fb]">
      <div className="min-h-screen min-w-0 lg:pl-[260px]">
        <Sidebar />
        <div className="flex min-w-0 flex-col">
          <TopBar />
          {isDemoModeActive ? (
            <div className="border-b border-orange-200 bg-orange-500 px-4 py-3 text-sm font-bold leading-6 text-white sm:px-6">
              ⚠️ Demo mode active — this is sample data only. Not real customer
              or investor information.
            </div>
          ) : null}
          <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
