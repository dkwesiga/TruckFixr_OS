import {
  BanIcon,
  CalendarCheckIcon,
  ClipboardListIcon,
  Code2Icon,
  ContactIcon,
  HistoryIcon,
  LightbulbIcon,
  MedalIcon,
  SearchIcon,
  ShareIcon,
  StarIcon,
  TruckIcon,
  UsersIcon,
  WalletCardsIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const kpiCards = [
  {
    label: "Prospects Tracked",
    value: "24",
    tag: "Growth",
    icon: SearchIcon,
    color: "text-blue-600",
    tagClass: "bg-blue-50 text-blue-700",
  },
  {
    label: "Outreach Drafts",
    value: "12",
    tag: "Sales",
    icon: ClipboardListIcon,
    color: "text-amber-500",
    tagClass: "bg-amber-50 text-amber-600",
  },
  {
    label: "Discovery Calls Booked",
    value: "3",
    tag: "Converted",
    icon: CalendarCheckIcon,
    color: "text-green-600",
    tagClass: "bg-green-50 text-green-700",
  },
  {
    label: "Content Ideas",
    value: "18",
    tag: "Marketing",
    icon: LightbulbIcon,
    color: "text-purple-600",
    tagClass: "bg-purple-50 text-purple-700",
  },
  {
    label: "Funding Opportunities",
    value: "8",
    tag: "Active",
    icon: WalletCardsIcon,
    color: "text-[#9d4300]",
    tagClass: "bg-orange-50 text-[#9d4300]",
  },
  {
    label: "Applications in Progress",
    value: "2",
    tag: "In Flow",
    icon: ClipboardListIcon,
    color: "text-blue-600",
    tagClass: "bg-blue-50 text-blue-700",
  },
  {
    label: "R&D Evidence Items",
    value: "15",
    tag: "Verified",
    icon: MedalIcon,
    color: "text-purple-600",
    tagClass: "bg-purple-50 text-purple-700",
  },
  {
    label: "Investor Contacts",
    value: "6",
    tag: "Network",
    icon: ContactIcon,
    color: "text-slate-600",
    tagClass: "bg-slate-100 text-slate-700",
  },
  {
    label: "Engineering Tasks",
    value: "11",
    tag: "Sprint",
    icon: Code2Icon,
    color: "text-slate-700",
    tagClass: "bg-slate-100 text-slate-700",
  },
  {
    label: "Ready for Codex",
    value: "4",
    tag: "ML Ready",
    icon: Code2Icon,
    color: "text-[#9d4300]",
    tagClass: "bg-orange-50 text-[#9d4300]",
  },
  {
    label: "Active Pilots",
    value: "2",
    tag: "Operational",
    icon: TruckIcon,
    color: "text-green-600",
    tagClass: "bg-green-50 text-green-700",
  },
  {
    label: "Active Partnerships",
    value: "7",
    tag: "B2B",
    icon: UsersIcon,
    color: "text-indigo-700",
    tagClass: "bg-indigo-50 text-indigo-700",
  },
];

const weeklyPriorities = [
  "Finalize FleetX Integration documentation",
  "Review Series A Pitch Deck with AI Sales Coach",
  "Interview 3 Lead Mechanics for R&D data validation",
  "Configure automatic LinkedIn marketing sequence",
  "Verify API uptime for North American fleet nodes",
];

const blockers = [
  { label: "AWS RDS Latency", owner: "DevOps" },
  { label: "Partner API Keys", owner: "Admin" },
];

const recentActivity = [
  {
    department: "Sales",
    activity: "New prospect added: Midwest Logistics",
    status: "Researched",
    time: "12m ago",
    chip: "bg-blue-100 text-blue-700",
    statusClass: "text-blue-700",
  },
  {
    department: "Marketing",
    activity: "Twitter thread campaign scheduled",
    status: "Drafted",
    time: "45m ago",
    chip: "bg-purple-100 text-purple-700",
    statusClass: "text-amber-600",
  },
  {
    department: "Engineering",
    activity: "PR #442: Codex V2 Core Refactor",
    status: "Approved",
    time: "1h ago",
    chip: "bg-slate-100 text-slate-700",
    statusClass: "text-purple-700",
  },
  {
    department: "Sales",
    activity: "Sales Agent replied to email: Titan Fleet",
    status: "In Flow",
    time: "2h ago",
    chip: "bg-blue-100 text-blue-700",
    statusClass: "text-green-700",
  },
  {
    department: "Funding",
    activity: "SBIR Grant Phase II submission draft",
    status: "Pending",
    time: "3h ago",
    chip: "bg-orange-100 text-orange-700",
    statusClass: "text-amber-600",
  },
  {
    department: "Pilots",
    activity: "Reliability report: 99.8% fleet uptime",
    status: "Optimal",
    time: "Yesterday",
    chip: "bg-green-100 text-green-700",
    statusClass: "text-green-700",
  },
];

export default function CommandCenterPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-3xl font-bold leading-10 text-slate-950">
            System Overview
          </h2>
          <p className="text-sm text-[#584237]">
            Real-time performance metrics across all AI-driven departments.
          </p>
        </div>
        <Button className="h-12 rounded-lg bg-orange-500 px-6 text-base font-bold text-white shadow-lg shadow-orange-900/10 hover:bg-[#9d4300]">
          <ShareIcon className="mr-2 size-5" />
          Export Weekly Summary
        </Button>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              className="rounded-xl border border-[#e0c0b1] bg-white p-6 shadow-sm transition-colors hover:border-orange-500"
              key={metric.label}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <Icon className={cn("size-5", metric.color)} />
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-semibold",
                    metric.tagClass
                  )}
                >
                  {metric.tag}
                </span>
              </div>
              <div className="text-4xl font-bold leading-10 text-slate-950">
                {metric.value}
              </div>
              <p className="mt-1 text-sm font-semibold text-[#2b1710]">
                {metric.label}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.95fr]">
        <div className="space-y-6">
          <article className="overflow-hidden rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-[#e0c0b1] bg-slate-100/70 px-5 py-4">
              <StarIcon className="size-5 text-[#9d4300]" />
              <h3 className="font-semibold text-slate-950">
                Weekly Priorities
              </h3>
            </header>
            <div className="space-y-4 p-5">
              {weeklyPriorities.map((priority) => (
                <div className="flex items-start gap-3" key={priority}>
                  <span className="mt-1 size-4 rounded border-2 border-orange-500" />
                  <p className="text-sm leading-6 text-slate-900">{priority}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-[#e0c0b1] bg-red-50 px-5 py-4">
              <BanIcon className="size-5 text-red-600" />
              <h3 className="font-semibold text-slate-950">Blocked Items</h3>
            </header>
            <div className="space-y-3 p-5">
              {blockers.map((blocked) => (
                <div
                  className="flex items-center justify-between rounded border border-[#e0c0b1] bg-white px-3 py-2"
                  key={blocked.label}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-red-600" />
                    <span className="text-sm text-slate-900">
                      {blocked.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#584237]">
                    {blocked.owner}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="overflow-hidden rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-[#e0c0b1] bg-slate-100/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <HistoryIcon className="size-5 text-[#584237]" />
              <h3 className="font-semibold text-slate-950">Recent Activity</h3>
            </div>
            <button
              className="text-sm font-bold text-[#9d4300] hover:text-orange-600"
              type="button"
            >
              View All
            </button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase text-[#584237]">
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Activity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0c0b1]">
                {recentActivity.map((item) => (
                  <tr
                    className="transition-colors hover:bg-slate-50"
                    key={`${item.department}-${item.time}`}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "rounded px-2 py-1 text-xs font-semibold",
                          item.chip
                        )}
                      >
                        {item.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {item.activity}
                    </td>
                    <td className={cn("px-6 py-4 font-medium", item.statusClass)}>
                      {item.status}
                    </td>
                    <td className="px-6 py-4 text-right text-[#584237]">
                      {item.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
