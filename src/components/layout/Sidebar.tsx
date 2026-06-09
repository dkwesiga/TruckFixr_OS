"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DASHBOARD_AUTH_KEY, DASHBOARD_LOGIN_PATH } from "@/lib/storage";
import { navigationItems } from "@/lib/demo-data";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    window.localStorage.setItem(DASHBOARD_AUTH_KEY, JSON.stringify(false));
    toast.success("Signed out of the internal dashboard.");
    router.replace(DASHBOARD_LOGIN_PATH);
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
      <div className="border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <WrenchIcon className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-sidebar-foreground">TruckFixr OS</p>
            <p className="text-sm text-muted-foreground">Internal workspace</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-3 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <div className="font-medium">{item.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {item.description}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Button
          className="w-full justify-start"
          variant="ghost"
          onClick={handleLogout}
        >
          <LogOutIcon data-icon="inline-start" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
