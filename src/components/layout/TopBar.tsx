"use client";

import { usePathname } from "next/navigation";
import {
  BellIcon,
  DatabaseIcon,
  HelpCircleIcon,
  SearchIcon,
} from "lucide-react";

import { MobileNav } from "@/components/layout/MobileNav";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getPageMeta, overviewMetrics, workstreams } from "@/lib/demo-data";

export function TopBar() {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const isDemoDataLoaded = overviewMetrics.length > 0 && workstreams.length > 0;
  const searchPlaceholder =
    pathname === "/sales"
      ? "Search prospects..."
      : pathname === "/funding"
        ? "Search funding opportunities..."
        : "Global system search...";

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
              className="rounded p-1 transition-colors hover:text-orange-700"
              type="button"
            >
              <BellIcon className="size-5" />
            </button>
            <button
              aria-label="Help"
              className="rounded p-1 transition-colors hover:text-orange-700"
              type="button"
            >
              <HelpCircleIcon className="size-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-4 text-slate-950">
                Dickson
              </p>
              <p className="text-xs font-semibold text-[#584237]">
                Founder & CEO
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg border border-[#e0c0b1] bg-slate-950 text-sm font-bold text-orange-500 ring-2 ring-white">
              DK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
