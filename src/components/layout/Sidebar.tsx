"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheckIcon,
  CodeIcon,
  DollarSignIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MapIcon,
  MegaphoneIcon,
  SettingsIcon,
  TruckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DASHBOARD_AUTH_KEY, DASHBOARD_LOGIN_PATH } from "@/lib/storage";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export const sidebarNavItems: SidebarNavItem[] = [
  { title: "Command Center", href: "/", icon: LayoutDashboardIcon },
  { title: "Sales Agent", href: "/sales", icon: UsersIcon },
  { title: "Marketing Agent", href: "/marketing", icon: MegaphoneIcon },
  { title: "Funding & R&D", href: "/funding", icon: DollarSignIcon },
  { title: "Engineering", href: "/engineering", icon: CodeIcon },
  { title: "Pilot Evidence", href: "/evidence", icon: ClipboardCheckIcon },
  { title: "Partnerships", href: "/partnerships", icon: HandshakeIcon },
  { title: "Roadmap", href: "/roadmap", icon: MapIcon },
  { title: "Settings", href: "/settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    window.sessionStorage.removeItem(DASHBOARD_AUTH_KEY);
    toast.success("Logged out of TruckFixr OS.");
    router.replace(DASHBOARD_LOGIN_PATH);
  }

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-[260px] flex-col overflow-hidden bg-slate-950 text-white lg:flex">
      <div className="px-6 py-8">
        <p className="text-2xl font-extrabold text-[#c85b08]">
          TruckFixr OS
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
          Fleet AI Startup
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-12 items-center gap-3 rounded-lg border-r-4 px-4 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "border-orange-500 bg-slate-900 text-orange-500"
                  : "border-transparent text-slate-300 opacity-80 hover:bg-slate-900 hover:text-white hover:opacity-100"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="min-w-0 flex-1 truncate font-medium">
                {item.title}
              </span>
              {item.badge ? (
                <Badge className="bg-orange-500 text-white">
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
          <TruckIcon className="size-4 text-orange-500" />
          Ontario Fleet AI Console
        </div>
        <Button
          className="h-12 w-full justify-start rounded-lg px-4 text-slate-300 opacity-80 hover:bg-slate-900 hover:text-white hover:opacity-100"
          variant="ghost"
          onClick={handleLogout}
        >
          <LogOutIcon className="mr-3 size-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
