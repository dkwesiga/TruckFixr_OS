"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BellIcon,
  DatabaseIcon,
  HelpCircleIcon,
  LogOutIcon,
  SearchIcon,
} from "lucide-react";

import { MobileNav } from "@/components/layout/MobileNav";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getPageMeta } from "@/lib/demo-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";
import { getDataMode, isSupabaseConfigured } from "@/lib/supabase/env";
import { DASHBOARD_AUTH_KEY, DASHBOARD_LOGIN_PATH, getItem, STORAGE_KEYS } from "@/lib/storage";

type DemoModeState = {
  active: boolean;
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const meta = getPageMeta(pathname);
  const [isDemoDataLoaded, setIsDemoDataLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const isSupabaseMode =
    getDataMode() === "supabase" && isSupabaseConfigured();

  const searchPlaceholder =
    pathname === "/sales"
      ? "Search prospects..."
      : pathname === "/funding"
        ? "Search funding opportunities..."
        : "Global system search...";

  useEffect(() => {
    function syncDemoMode() {
      setIsDemoDataLoaded(
        getItem<DemoModeState>(STORAGE_KEYS.DEMO_MODE)?.active ?? false,
      );
    }

    syncDemoMode();
    window.addEventListener("storage", syncDemoMode);
    window.addEventListener("tf_os_storage_change", syncDemoMode);

    return () => {
      window.removeEventListener("storage", syncDemoMode);
      window.removeEventListener("tf_os_storage_change", syncDemoMode);
    };
  }, []);

  // Resolve the signed-in user's email in supabase mode.
  useEffect(() => {
    if (!isSupabaseMode) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, [isSupabaseMode]);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      window.sessionStorage.removeItem(DASHBOARD_AUTH_KEY);
      router.replace(DASHBOARD_LOGIN_PATH);
    }
  }

  // Derive display name: first part of email or fallback.
  const displayName = userEmail
    ? userEmail.split("@")[0]
    : "Dickson";
  const displayRole = isSupabaseMode && userEmail ? userEmail : "Founder & CEO";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[#e0c0b1] bg-[#f7f9fb]/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav />
          <div className="hidden min-w-56 max-w-80 md:block">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="h-10 rounded-full border-0 bg-slate-200/70 pl-10 text-sm shadow-none placeholder:text-slate-500 focus-visible:ring-orange-500"
                placeholder={searchPlaceholder}
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-xl font-bold text-slate-950">
                {meta.title}
              </h1>
              {isDemoDataLoaded ? (
                <Badge className="rounded-full border border-[#e0c0b1] bg-[#ffdbca] px-3 py-1 text-xs font-bold text-[#582200] hover:bg-[#ffdbca]">
                  <DatabaseIcon className="mr-1 size-3" />
                  Demo Mode Active
                </Badge>
              ) : null}
            </div>
            <p className="hidden text-sm text-[#584237] lg:block">
              {meta.description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex items-center gap-3 border-r border-[#e0c0b1] pr-4 text-[#584237]">
            <button
              aria-label="Notifications"
              className="flex size-11 items-center justify-center rounded transition-colors hover:text-orange-700"
              type="button"
            >
              <BellIcon className="size-5" />
            </button>
            <button
              aria-label="Help"
              className="flex size-11 items-center justify-center rounded transition-colors hover:text-orange-700"
              type="button"
            >
              <HelpCircleIcon className="size-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-4 text-slate-950">
                {displayName}
              </p>
              <p className="max-w-[180px] truncate text-xs font-semibold text-[#584237]">
                {displayRole}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg border border-[#e0c0b1] bg-slate-950 text-sm font-bold text-orange-500 ring-2 ring-white">
              {initials}
            </div>
            {isSupabaseMode ? (
              <button
                aria-label="Sign out"
                title="Sign out"
                className="flex size-9 items-center justify-center rounded-lg border border-[#e0c0b1] text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                type="button"
                onClick={handleSignOut}
              >
                <LogOutIcon className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
