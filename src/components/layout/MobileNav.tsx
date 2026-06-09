"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon, MenuIcon, TruckIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DASHBOARD_AUTH_KEY, DASHBOARD_LOGIN_PATH } from "@/lib/storage";
import { sidebarNavItems } from "@/components/layout/Sidebar";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    window.sessionStorage.removeItem(DASHBOARD_AUTH_KEY);
    toast.success("Logged out of TruckFixr OS.");
    router.replace(DASHBOARD_LOGIN_PATH);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="size-10 border-[#e0c0b1] bg-white lg:hidden"
          variant="outline"
          size="icon"
        >
          <MenuIcon />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] border-slate-800 bg-slate-950 p-0 text-white" side="left">
        <SheetHeader>
          <div className="px-6 py-8 text-left">
            <SheetTitle className="text-2xl font-extrabold text-[#c85b08]">
              TruckFixr OS
            </SheetTitle>
            <SheetDescription className="mt-1 text-xs font-bold uppercase text-slate-400">
              Fleet AI Startup
            </SheetDescription>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-lg border-r-4 px-4 py-3 text-sm font-semibold transition-colors",
                  pathname === item.href
                    ? "border-orange-500 bg-slate-900 text-orange-500"
                    : "border-transparent text-slate-300 opacity-80 hover:bg-slate-900 hover:text-white hover:opacity-100"
                )}
              >
                <Icon className="size-5" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {item.title}
                </span>
                {item.badge ? (
                  <Badge className="bg-orange-500 text-slate-950">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
            <TruckIcon className="size-4 text-orange-500" />
            Ontario Fleet AI Console
          </div>
          <Button
            className="mt-2 h-12 justify-start rounded-lg px-4 text-slate-300 opacity-80 hover:bg-slate-900 hover:text-white hover:opacity-100"
            variant="ghost"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-3 size-5" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
