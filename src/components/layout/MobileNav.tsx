"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon, MenuIcon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

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
import { navigationItems } from "@/lib/demo-data";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    window.localStorage.setItem(DASHBOARD_AUTH_KEY, JSON.stringify(false));
    toast.success("Signed out of the internal dashboard.");
    router.replace(DASHBOARD_LOGIN_PATH);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="lg:hidden" variant="outline" size="icon">
          <MenuIcon />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <WrenchIcon className="size-4" />
            TruckFixr OS
          </SheetTitle>
          <SheetDescription>
            Navigate between the internal placeholder workspaces.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm",
                pathname === item.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <div className="font-medium">{item.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {item.description}
              </div>
            </Link>
          ))}
          <Button
            className="mt-4 justify-start"
            variant="ghost"
            onClick={handleLogout}
          >
            <LogOutIcon data-icon="inline-start" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
