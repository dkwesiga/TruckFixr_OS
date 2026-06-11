"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  BanIcon,
  CalendarCheckIcon,
  ClipboardListIcon,
  Code2Icon,
  ContactIcon,
  FileOutputIcon,
  HandshakeIcon,
  HistoryIcon,
  LightbulbIcon,
  MedalIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TruckIcon,
  WalletCardsIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { exportToMarkdown } from "@/lib/export";
import {
  getFundingOpportunities,
  getInvestorContacts,
  getRDEvidence,
} from "@/lib/funding";
import { getEngineeringTasks } from "@/lib/engineering";
import { getPartnerships } from "@/lib/partnerships";
import { getPilotEvidence } from "@/lib/pilot-evidence";
import { getProspects } from "@/lib/prospects";
import { getRoadmapItems } from "@/lib/roadmap";
import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import { getContentItems } from "@/lib/content";
import {
  type ContentItem,
  type EngineeringTask,
  type FundingOpportunity,
  type InvestorContact,
  type Partnership,
  type PilotEvidence,
  type Prospect,
  type RDEvidence,
  type RoadmapItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type WeeklyPanelState = {
  topPriorities: string[];
  decisionsNeeded: string;
};

type ActivityItem = {
  id: string;
  type: string;
  name: string;
  status: string;
  updatedDate: string;
};

type Snapshot = {
  prospects: Prospect[];
  contentItems: ContentItem[];
  fundingOpportunities: FundingOpportunity[];
  rdEvidenceItems: RDEvidence[];
  investorContacts: InvestorContact[];
  engineeringTasks: EngineeringTask[];
  pilotEvidence: PilotEvidence[];
  partnerships: Partnership[];
  roadmapItems: RoadmapItem[];
};

const defaultWeeklyPanel: WeeklyPanelState = {
  topPriorities: ["", "", "", "", ""],
  decisionsNeeded: "",
};

const activityBadgeClasses: Record<string, string> = {
  Sales: "bg-blue-100 text-blue-700",
  Marketing: "bg-purple-100 text-purple-700",
  "Funding/R&D": "bg-orange-100 text-orange-700",
  Engineering: "bg-slate-100 text-slate-700",
  Evidence: "bg-emerald-100 text-emerald-700",
  Partnerships: "bg-indigo-100 text-indigo-700",
  Roadmap: "bg-amber-100 text-amber-700",
};

const quickActions = [
  { label: "Add Prospect", href: "/sales", icon: SearchIcon },
  { label: "Add Content Idea", href: "/marketing", icon: LightbulbIcon },
  { label: "Log R&D Evidence", href: "/funding", icon: MedalIcon },
  { label: "Add Engineering Task", href: "/engineering", icon: Code2Icon },
  { label: "Add Funding Opportunity", href: "/funding", icon: WalletCardsIcon },
  { label: "Add Partnership", href: "/partnerships", icon: HandshakeIcon },
];

function getStoredWeeklyPanel() {
  return (
    getItem<WeeklyPanelState>(STORAGE_KEYS.DASHBOARD_WEEKLY_PANEL) ??
    defaultWeeklyPanel
  );
}

function getWeekOfDate() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);

  monday.setDate(now.getDate() + diff);

  return monday.toISOString().slice(0, 10);
}

function formatRelativeTime(dateValue: string) {
  const timestamp = new Date(dateValue).getTime();

  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  const diffMs = timestamp - Date.now();
  const minutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  return formatter.format(days, "day");
}

function collectRecentActivity(snapshot: Snapshot): ActivityItem[] {
  const items: ActivityItem[] = [
    ...snapshot.prospects.map((item) => ({
      id: `prospect-${item.id}`,
      type: "Sales",
      name: item.companyName,
      status: item.outreachStatus,
      updatedDate: item.updatedDate,
    })),
    ...snapshot.contentItems.map((item) => ({
      id: `content-${item.id}`,
      type: "Marketing",
      name: item.topic,
      status: item.contentStatus,
      updatedDate: item.updatedDate,
    })),
    ...snapshot.fundingOpportunities.map((item) => ({
      id: `funding-${item.id}`,
      type: "Funding/R&D",
      name: item.programName,
      status: item.status,
      updatedDate: item.updatedDate,
    })),
    ...snapshot.rdEvidenceItems.map((item) => ({
      id: `rd-${item.id}`,
      type: "Funding/R&D",
      name: item.source ?? item.evidenceType,
      status: item.confidenceLevel,
      updatedDate: item.updatedDate,
    })),
    ...snapshot.investorContacts.map((item) => ({
      id: `investor-${item.id}`,
      type: "Funding/R&D",
      name: item.investorName,
      status: item.status,
      updatedDate: item.updatedDate,
    })),
    ...snapshot.engineeringTasks.map((item) => ({
      id: `engineering-${item.id}`,
      type: "Engineering",
      name: item.title,
      status: item.status,
      updatedDate: item.updatedDate,
    })),
    ...snapshot.pilotEvidence.map((item) => ({
      id: `pilot-${item.id}`,
      type: "Evidence",
      name: item.pilotName,
      status: item.pilotStatus,
      updatedDate: item.updatedDate,
    })),
    ...snapshot.partnerships.map((item) => ({
      id: `partnership-${item.id}`,
      type: "Partnerships",
      name: item.partnerName,
      status: item.relationshipStatus,
      updatedDate: item.updatedDate,
    })),
    ...snapshot.roadmapItems.map((item) => ({
      id: `roadmap-${item.id}`,
      type: "Roadmap",
      name: item.title,
      status: item.status,
      updatedDate: item.updatedDate,
    })),
  ];

  return items
    .sort(
      (a, b) =>
        new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
    )
    .slice(0, 10);
}

function buildWeeklySummaryMarkdown(
  weeklyPanel: WeeklyPanelState,
  blockedItems: EngineeringTask[],
  snapshot: Snapshot
) {
  const kpiLines = [
    `- Prospects tracked: ${snapshot.prospects.length}`,
    `- Outreach drafts ready: ${
      snapshot.prospects.filter(
        (item) =>
          item.firstEmailDraft ||
          item.linkedInConnectDraft ||
          item.linkedInFollowUpDraft ||
          item.phoneScript
      ).length
    }`,
    `- Discovery calls booked: ${
      snapshot.prospects.filter(
        (item) => item.outreachStatus === "Discovery Booked"
      ).length
    }`,
    `- Content ideas: ${snapshot.contentItems.length}`,
    `- Funding opportunities: ${snapshot.fundingOpportunities.length}`,
    `- Applications in progress: ${
      snapshot.fundingOpportunities.filter((item) =>
        ["Applied", "Follow-up"].includes(item.status)
      ).length
    }`,
    `- R&D evidence items: ${snapshot.rdEvidenceItems.length}`,
    `- Investor contacts: ${snapshot.investorContacts.length}`,
    `- Engineering tasks: ${snapshot.engineeringTasks.length}`,
    `- Ready for Codex: ${
      snapshot.engineeringTasks.filter(
        (item) => item.status === "Ready for Codex"
      ).length
    }`,
    `- Active pilots: ${
      snapshot.pilotEvidence.filter((item) => item.pilotStatus === "Active")
        .length
    }`,
    `- Active partnerships: ${
      snapshot.partnerships.filter((item) =>
        [
          "Active Conversation",
          "Formal Agreement",
          "Referral Active",
          "Integration Planning",
        ].includes(item.relationshipStatus)
      ).length
    }`,
  ];

  return [
    "# TruckFixr Weekly Operating Summary",
    `**Week of:** ${getWeekOfDate()}`,
    "",
    "## Top 5 Priorities",
    weeklyPanel.topPriorities.some((item) => item.trim())
      ? weeklyPanel.topPriorities.map((item) => `- ${item || "Open"}`).join("\n")
      : "- No priorities entered yet",
    "",
    "## Blocked Items",
    blockedItems.length
      ? blockedItems.map((item) => `- ${item.title}`).join("\n")
      : "- No blocked engineering tasks",
    "",
    "## Decisions Needed",
    weeklyPanel.decisionsNeeded.trim() || "No decisions recorded yet.",
    "",
    "## KPI Snapshot",
    kpiLines.join("\n"),
  ].join("\n");
}

export default function CommandCenterPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    prospects: [],
    contentItems: [],
    fundingOpportunities: [],
    rdEvidenceItems: [],
    investorContacts: [],
    engineeringTasks: [],
    pilotEvidence: [],
    partnerships: [],
    roadmapItems: [],
  });
  const [weeklyPanel, setWeeklyPanel] = useState<WeeklyPanelState>(
    defaultWeeklyPanel
  );

  useEffect(() => {
    setSnapshot({
      prospects: getProspects(),
      contentItems: getContentItems(),
      fundingOpportunities: getFundingOpportunities(),
      rdEvidenceItems: getRDEvidence(),
      investorContacts: getInvestorContacts(),
      engineeringTasks: getEngineeringTasks(),
      pilotEvidence: getPilotEvidence(),
      partnerships: getPartnerships(),
      roadmapItems: getRoadmapItems(),
    });
    setWeeklyPanel(getStoredWeeklyPanel());
  }, []);

  const blockedItems = useMemo(
    () =>
      snapshot.engineeringTasks.filter((item) => item.status === "Blocked"),
    [snapshot.engineeringTasks]
  );

  const recentActivity = useMemo(
    () => collectRecentActivity(snapshot),
    [snapshot]
  );

  const kpiSections = useMemo(
    () => [
      {
        title: "Sales & Marketing",
        cards: [
          {
            label: "Prospects Tracked",
            value: snapshot.prospects.length,
            icon: SearchIcon,
            className: "text-blue-700",
          },
          {
            label: "Outreach Drafts Ready",
            value: snapshot.prospects.filter(
              (item) =>
                item.firstEmailDraft ||
                item.linkedInConnectDraft ||
                item.linkedInFollowUpDraft ||
                item.phoneScript
            ).length,
            icon: ClipboardListIcon,
            className: "text-orange-700",
          },
          {
            label: "Discovery Calls Booked",
            value: snapshot.prospects.filter(
              (item) => item.outreachStatus === "Discovery Booked"
            ).length,
            icon: CalendarCheckIcon,
            className: "text-green-800",
          },
          {
            label: "Content Ideas",
            value: snapshot.contentItems.length,
            icon: LightbulbIcon,
            className: "text-purple-700",
          },
        ],
      },
      {
        title: "Funding & R&D",
        cards: [
          {
            label: "Funding Opportunities",
            value: snapshot.fundingOpportunities.length,
            icon: WalletCardsIcon,
            className: "text-[#9d4300]",
          },
          {
            label: "Applications In Progress",
            value: snapshot.fundingOpportunities.filter((item) =>
              ["Applied", "Follow-up"].includes(item.status)
            ).length,
            icon: ClipboardListIcon,
            className: "text-blue-700",
          },
          {
            label: "R&D Evidence Items",
            value: snapshot.rdEvidenceItems.length,
            icon: MedalIcon,
            className: "text-emerald-700",
          },
          {
            label: "Investor Contacts",
            value: snapshot.investorContacts.length,
            icon: ContactIcon,
            className: "text-slate-700",
          },
        ],
      },
      {
        title: "Product & Operations",
        cards: [
          {
            label: "Engineering Tasks",
            value: snapshot.engineeringTasks.length,
            icon: Code2Icon,
            className: "text-slate-700",
          },
          {
            label: "Ready for Codex",
            value: snapshot.engineeringTasks.filter(
              (item) => item.status === "Ready for Codex"
            ).length,
            icon: Code2Icon,
            className: "text-orange-700",
          },
          {
            label: "Active Pilots",
            value: snapshot.pilotEvidence.filter(
              (item) => item.pilotStatus === "Active"
            ).length,
            icon: TruckIcon,
            className: "text-green-800",
          },
          {
            label: "Active Partnerships",
            value: snapshot.partnerships.filter((item) =>
              [
                "Active Conversation",
                "Formal Agreement",
                "Referral Active",
                "Integration Planning",
              ].includes(item.relationshipStatus)
            ).length,
            icon: HandshakeIcon,
            className: "text-indigo-700",
          },
        ],
      },
    ],
    [snapshot]
  );

  function persistWeeklyPanel(nextPanel: WeeklyPanelState) {
    setWeeklyPanel(nextPanel);
    setItem(STORAGE_KEYS.DASHBOARD_WEEKLY_PANEL, nextPanel);
  }

  function updatePriority(index: number, value: string) {
    const nextPriorities = [...weeklyPanel.topPriorities];
    nextPriorities[index] = value;
    persistWeeklyPanel({
      ...weeklyPanel,
      topPriorities: nextPriorities,
    });
  }

  function handleExportWeeklySummary() {
    exportToMarkdown(
      buildWeeklySummaryMarkdown(weeklyPanel, blockedItems, snapshot),
      "truckfixr-weekly-operating-summary.md"
    );
    toast.success("Weekly operating summary exported.");
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold leading-tight text-slate-950">
            Command Center
          </h2>
          <p className="mt-1 text-sm text-[#584237]">
            Live operating snapshot for TruckFixr Fleet AI across sales,
            marketing, funding, product, and partnerships.
          </p>
        </div>
        <Button
          className="bg-[#9d4300] text-white hover:bg-orange-600"
          onClick={handleExportWeeklySummary}
        >
          <FileOutputIcon data-icon="inline-start" />
          Export Weekly Summary
        </Button>
      </section>

      <section className="grid gap-6">
        {kpiSections.map((section) => (
          <div className="space-y-3" key={section.title}>
            <div className="flex items-center gap-3">
              <StarIcon className="size-5 text-[#9d4300]" />
              <h3 className="text-lg font-bold text-slate-950">
                {section.title}
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {section.cards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm"
                    key={card.label}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#584237]">
                        {card.label}
                      </p>
                      <Icon className={cn("size-5", card.className)} />
                    </div>
                    <div className={cn("mt-3 text-3xl font-bold", card.className)}>
                      {card.value}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_1.55fr]">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <StarIcon className="size-5 text-[#9d4300]" />
            <div>
              <h3 className="text-xl font-bold text-slate-950">
                Weekly Priority Panel
              </h3>
              <p className="text-sm text-[#584237]">
                Update the current week, review blockers, and capture decisions
                that need founder attention.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-950">
                Top 5 Priorities
              </p>
              {weeklyPanel.topPriorities.map((priority, index) => (
                <Input
                  className="h-11 border-[#e0c0b1] bg-[#f7f9fb]"
                  key={`priority-${index}`}
                  placeholder={`Priority ${index + 1}`}
                  value={priority}
                  onChange={(event) => updatePriority(index, event.target.value)}
                />
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BanIcon className="size-4 text-red-600" />
                <p className="text-sm font-semibold text-slate-950">
                  Blocked Items
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {blockedItems.length ? (
                  blockedItems.map((item) => (
                    <div
                      className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                      key={item.id}
                    >
                      {item.title}
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] px-3 py-2 text-sm text-[#584237]">
                    No blocked engineering tasks right now.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-950">
                Decisions Needed
              </p>
              <Textarea
                className="min-h-32 border-[#e0c0b1] bg-[#f7f9fb]"
                placeholder="Capture decisions that need founder input this week."
                value={weeklyPanel.decisionsNeeded}
                onChange={(event) =>
                  persistWeeklyPanel({
                    ...weeklyPanel,
                    decisionsNeeded: event.target.value,
                  })
                }
              />
            </div>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <PlusIcon className="size-5 text-[#9d4300]" />
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Quick Actions
                </h3>
                <p className="text-sm text-[#584237]">
                  Jump straight into the modules where work gets created and updated.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button asChild className="h-auto justify-between px-4 py-4" key={action.label} variant="outline">
                    <Link href={action.href}>
                      <span className="flex items-center gap-3">
                        <Icon className="size-4 text-[#9d4300]" />
                        <span>{action.label}</span>
                      </span>
                      <ArrowRightIcon className="size-4 text-slate-400" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </article>

          <article className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-[#e0c0b1] px-5 py-4">
              <div className="flex items-center gap-3">
                <HistoryIcon className="size-5 text-[#584237]" />
                <div>
                  <h3 className="font-semibold text-slate-950">
                    Recent Activity
                  </h3>
                  <p className="text-sm text-[#584237]">
                    Last 10 items added or updated across the operating system.
                  </p>
                </div>
              </div>
            </header>

            <div className="divide-y divide-slate-200">
              {recentActivity.length ? (
                recentActivity.map((item) => (
                  <div
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    key={item.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={cn(
                            "border-transparent",
                            activityBadgeClasses[item.type] ??
                              "bg-slate-100 text-slate-700"
                          )}
                          variant="secondary"
                        >
                          {item.type}
                        </Badge>
                        <p className="truncate font-semibold text-slate-950">
                          {item.name}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-[#584237]">{item.status}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      {formatRelativeTime(item.updatedDate)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-sm text-[#584237]">
                  No recent activity yet. Add work in the modules to start building
                  the operating timeline.
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
