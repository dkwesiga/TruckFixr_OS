"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  CopyIcon,
  DownloadIcon,
  FileOutputIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  ContentForm,
  type ContentFormValues,
} from "@/components/marketing/ContentForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addContentItem,
  deleteContentItem,
  getContentItems,
  updateContentItem,
} from "@/lib/content";
import {
  detectContentRisks,
  generateContentDraft,
  generateContentLLMPrompt,
} from "@/lib/content-templates";
import { copyToClipboard, exportToCSV, exportToJSON, exportToMarkdown } from "@/lib/export";
import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import {
  type CompanySettings,
  type ContentAudience,
  type ContentItem,
  type ContentStatus,
  type ContentType,
  type WeeklyContentDay,
  type WeeklyContentPlan,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const defaultCompanySettings: CompanySettings = {
  companyName: "TruckFixr Fleet AI",
  corePositioning:
    "AI maintenance intelligence for small and mid-sized commercial fleets",
  primaryICP: "Ontario trucking/logistics fleets with 5-25 vehicles",
  secondaryICP: "Construction and contractor fleets",
  strategicICP: "ELD/telematics-ready fleet partners",
  cta: "Book a 20-minute discovery call",
  pilotOffer:
    "30-day diagnostic discovery pilot plus 60-90 day paid implementation pilot",
  discoveryPilotValue: "$1,000",
  earlyPartnerRange: "Free to $500",
  paidImplementationRange: "$2,500-$6,000",
};

const contentStatuses: ContentStatus[] = [
  "Idea",
  "Drafted",
  "Approved",
  "Published",
  "Deferred",
];

const audiences: ContentAudience[] = [
  "Fleet Owner",
  "Owner-Operator",
  "Fleet Manager",
  "Repair Partner",
  "Grant/Funding Partner",
  "Investor",
  "Ecosystem Partner",
];

const contentTypes: ContentType[] = [
  "LinkedIn Founder Post",
  "Educational LinkedIn Post",
  "Pilot Learning Post",
  "Grant/R&D Credibility Post",
  "Prospect Nurturing Email",
  "Blog Outline",
  "Case Study Draft",
  "Event Announcement",
  "Investor Update Snippet",
  "Landing Page Copy Suggestion",
];

const weeklyTemplate: Array<{
  day: WeeklyContentDay;
  label: string;
  defaultType: ContentType;
}> = [
  {
    day: "Monday",
    label: "Mon",
    defaultType: "LinkedIn Founder Post",
  },
  {
    day: "Tuesday",
    label: "Tue",
    defaultType: "Educational LinkedIn Post",
  },
  {
    day: "Wednesday",
    label: "Wed",
    defaultType: "Prospect Nurturing Email",
  },
  {
    day: "Thursday",
    label: "Thu",
    defaultType: "Pilot Learning Post",
  },
  {
    day: "Friday",
    label: "Fri",
    defaultType: "Grant/R&D Credibility Post",
  },
];

const emptyPlan: WeeklyContentPlan = {
  Monday: null,
  Tuesday: null,
  Wednesday: null,
  Thursday: null,
  Friday: null,
};

const statusClasses: Record<ContentStatus, string> = {
  Idea: "bg-slate-100 text-slate-700",
  Drafted: "bg-yellow-100 text-yellow-800",
  Approved: "bg-purple-100 text-purple-700",
  Published: "bg-green-100 text-green-800",
  Deferred: "bg-slate-200 text-slate-700",
};

type ContentFilters = {
  search: string;
  contentType: "" | ContentType;
  audience: "" | ContentAudience;
  status: "" | ContentStatus;
};

const emptyFilters: ContentFilters = {
  search: "",
  contentType: "",
  audience: "",
  status: "",
};

function getStoredSettings() {
  return (
    getItem<CompanySettings>(STORAGE_KEYS.SETTINGS) ?? defaultCompanySettings
  );
}

function getStoredPlan() {
  return (
    getItem<WeeklyContentPlan>(STORAGE_KEYS.MARKETING_WEEKLY_PLAN) ?? emptyPlan
  );
}

function sanitizePlan(
  plan: WeeklyContentPlan,
  items: ContentItem[]
): WeeklyContentPlan {
  const validIds = new Set(items.map((item) => item.id));

  return {
    Monday: plan.Monday && validIds.has(plan.Monday) ? plan.Monday : null,
    Tuesday: plan.Tuesday && validIds.has(plan.Tuesday) ? plan.Tuesday : null,
    Wednesday:
      plan.Wednesday && validIds.has(plan.Wednesday) ? plan.Wednesday : null,
    Thursday:
      plan.Thursday && validIds.has(plan.Thursday) ? plan.Thursday : null,
    Friday: plan.Friday && validIds.has(plan.Friday) ? plan.Friday : null,
  };
}

function buildContentMarkdown(item: ContentItem, settings: CompanySettings) {
  const riskFlags = detectContentRisks(item);

  return [
    `# Content Item: ${item.topic}`,
    `**Audience:** ${item.audience}`,
    `**Content Type:** ${item.contentType}`,
    `**Status:** ${item.contentStatus}`,
    `**Recommended Channel:** ${item.recommendedChannel ?? "Not set"}`,
    `**CTA:** ${item.cta ?? settings.cta}`,
    item.customerName
      ? `**Customer Name:** ${item.customerName}`
      : "**Customer Name:** Not set",
    "",
    "## Draft Title",
    item.draftTitle ?? "Not generated yet.",
    "",
    "## Draft Content",
    item.draftContent ?? "Not generated yet.",
    "",
    "## Suggested Hashtags",
    item.suggestedHashtags?.length
      ? item.suggestedHashtags.join(" ")
      : "Not generated yet.",
    "",
    "## Context Notes",
    item.contextNotes ?? "None",
    "",
    "## Approval Notes",
    item.approvalNotes ?? "None",
    "",
    "## Risk Flags",
    riskFlags.length ? riskFlags.join(" | ") : "No active flags",
    "",
    "---",
    "Template draft - review before publishing.",
  ].join("\n");
}

function buildWeeklyPlanMarkdown(
  plan: WeeklyContentPlan,
  items: ContentItem[],
  settings: CompanySettings
) {
  return [
    "# TruckFixr OS Weekly Content Plan",
    "",
    ...weeklyTemplate.flatMap(({ day, defaultType }) => {
      const item = items.find((entry) => entry.id === plan[day]);

      return [
        `## ${day}`,
        item
          ? `- ${item.topic} (${item.contentType})`
          : `- Unassigned (${defaultType})`,
        item ? `- Audience: ${item.audience}` : "- Audience: Open",
        item
          ? `- CTA: ${item.cta ?? settings.cta}`
          : `- CTA: ${settings.cta}`,
        "",
      ];
    }),
  ].join("\n");
}

function countItemsByStatus(items: ContentItem[], status: ContentStatus) {
  return items.filter((item) => item.contentStatus === status).length;
}

function countLinkedInPosts(items: ContentItem[]) {
  return items.filter((item) =>
    [
      "LinkedIn Founder Post",
      "Educational LinkedIn Post",
      "Pilot Learning Post",
      "Grant/R&D Credibility Post",
    ].includes(item.contentType)
  ).length;
}

export default function MarketingPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [plan, setPlan] = useState<WeeklyContentPlan>(emptyPlan);
  const [filters, setFilters] = useState<ContentFilters>(emptyFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ContentItem | null>(null);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const storedItems = getContentItems();
    const storedPlan = sanitizePlan(getStoredPlan(), storedItems);

    setItems(storedItems);
    setPlan(storedPlan);
    setItem(STORAGE_KEYS.MARKETING_WEEKLY_PLAN, storedPlan);
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return items.filter((item) => {
      if (
        normalizedSearch &&
        !item.topic.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (filters.contentType && item.contentType !== filters.contentType) {
        return false;
      }

      if (filters.audience && item.audience !== filters.audience) {
        return false;
      }

      if (filters.status && item.contentStatus !== filters.status) {
        return false;
      }

      return true;
    });
  }, [deferredSearch, filters, items]);

  const assignedCount = useMemo(
    () => Object.values(plan).filter(Boolean).length,
    [plan]
  );

  const kpiCards = useMemo(
    () => [
      { label: "Total Ideas", value: items.length, className: "text-slate-700" },
      { label: "Drafted", value: countItemsByStatus(items, "Drafted"), className: "text-yellow-700" },
      { label: "Approved", value: countItemsByStatus(items, "Approved"), className: "text-purple-700" },
      { label: "Published", value: countItemsByStatus(items, "Published"), className: "text-green-800" },
      { label: "LinkedIn Posts", value: countLinkedInPosts(items), className: "text-blue-700" },
      {
        label: "Prospect Emails",
        value: items.filter((item) => item.contentType === "Prospect Nurturing Email").length,
        className: "text-orange-700",
      },
      {
        label: "Grant/R&D Posts",
        value: items.filter((item) => item.contentType === "Grant/R&D Credibility Post").length,
        className: "text-emerald-700",
      },
      { label: "This Week's Content", value: assignedCount, className: "text-indigo-700" },
    ],
    [assignedCount, items]
  );

  function refreshItems() {
    const nextItems = getContentItems();
    const nextPlan = sanitizePlan(plan, nextItems);

    setItems(nextItems);
    setPlan(nextPlan);
    setItem(STORAGE_KEYS.MARKETING_WEEKLY_PLAN, nextPlan);
  }

  function handleSave(values: ContentFormValues) {
    if (editingItem) {
      updateContentItem(editingItem.id, values);
    } else {
      addContentItem(values);
    }

    refreshItems();
    setIsFormOpen(false);
    setEditingItem(null);
  }

  function handleGenerateDraft(item: ContentItem) {
    const generated = generateContentDraft(item, getStoredSettings());

    updateContentItem(item.id, {
      ...generated,
      contentStatus:
        item.contentStatus === "Approved" || item.contentStatus === "Published"
          ? item.contentStatus
          : "Drafted",
    });
    refreshItems();
    toast.success("Content draft generated.");
  }

  async function handleGeneratePrompt(item: ContentItem) {
    const prompt = generateContentLLMPrompt(item, getStoredSettings());
    const didCopy = await copyToClipboard(prompt);

    if (didCopy) {
      toast.success("LLM prompt copied.");
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  async function handleCopyDraft(item: ContentItem) {
    const storedItem =
      item.draftContent || item.draftTitle
        ? item
        : {
            ...item,
            ...generateContentDraft(item, getStoredSettings()),
          };

    if (!item.draftContent && !item.draftTitle) {
      updateContentItem(item.id, storedItem);
      refreshItems();
    }

    const draftText = [storedItem.draftTitle, storedItem.draftContent]
      .filter(Boolean)
      .join("\n\n");
    const didCopy = await copyToClipboard(draftText);

    if (didCopy) {
      toast.success("Draft copied.");
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  function handleExportMarkdown(item: ContentItem) {
    exportToMarkdown(
      buildContentMarkdown(item, getStoredSettings()),
      `${item.topic.toLowerCase().replace(/\s+/g, "-")}.md`
    );
    toast.success("Content markdown exported.");
  }

  function handleDeleteConfirmed() {
    if (!deletingItem) {
      return;
    }

    deleteContentItem(deletingItem.id);
    refreshItems();
    setDeletingItem(null);
    toast.success("Content item deleted.");
  }

  function handleExportCSV() {
    exportToCSV(items, "truckfixr-os-marketing-content.csv");
  }

  function handleExportJSON() {
    exportToJSON(
      { exportedAt: new Date().toISOString(), contentItems: items, weeklyPlan: plan },
      "truckfixr-os-marketing-content.json"
    );
  }

  function handleExportWeeklyPlan() {
    exportToMarkdown(
      buildWeeklyPlanMarkdown(plan, items, getStoredSettings()),
      "truckfixr-os-weekly-content-plan.md"
    );
    toast.success("Weekly plan exported as markdown.");
  }

  function updateFilter<K extends keyof ContentFilters>(
    key: K,
    value: ContentFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handlePlanChange(day: WeeklyContentDay, value: string) {
    const nextPlan = {
      ...plan,
      [day]: value === "__none" ? null : value,
    };

    setPlan(nextPlan);
    setItem(STORAGE_KEYS.MARKETING_WEEKLY_PLAN, nextPlan);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <article
            className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm"
            key={card.label}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#584237]">
              {card.label}
            </p>
            <div className={cn("mt-3 text-3xl", card.className)}>
              {card.value}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <Input
              className="h-11 border-[#e0c0b1] bg-[#f7f9fb] sm:max-w-sm"
              placeholder="Search by topic"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.contentType}
                onValueChange={(value) =>
                  updateFilter("contentType", value as ContentFilters["contentType"])
                }
              >
                <SelectTrigger className="h-11 w-[220px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {contentTypes.map((contentType) => (
                      <SelectItem key={contentType} value={contentType}>
                        {contentType}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.audience}
                onValueChange={(value) =>
                  updateFilter("audience", value as ContentFilters["audience"])
                }
              >
                <SelectTrigger className="h-11 w-[210px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {audiences.map((audience) => (
                      <SelectItem key={audience} value={audience}>
                        {audience}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  updateFilter("status", value as ContentFilters["status"])
                }
              >
                <SelectTrigger className="h-11 w-[180px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {contentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="outline" onClick={() => setFilters(emptyFilters)}>
            Clear filters
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm font-semibold text-[#584237]">
            {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"} shown
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-[#9d4300] text-white hover:bg-orange-600"
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
            >
              <PlusIcon data-icon="inline-start" />
              Add Content Idea
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <DownloadIcon data-icon="inline-start" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <FileOutputIcon data-icon="inline-start" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={handleExportWeeklyPlan}>
              <CalendarDaysIcon data-icon="inline-start" />
              Export Weekly Plan
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.8fr_0.95fr]">
        <article className="overflow-hidden rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] border-collapse text-left">
              <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
                <tr>
                  <th className="px-6 py-5">Topic</th>
                  <th className="px-6 py-5">Audience</th>
                  <th className="px-6 py-5">Content Type</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Risk Flags</th>
                  <th className="px-6 py-5">Updated</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-sm font-semibold text-[#584237]"
                      colSpan={7}
                    >
                      No content items match the current search and filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const riskFlags = detectContentRisks(item);

                    return (
                      <tr className="hover:bg-slate-50" key={item.id}>
                        <td className="px-6 py-5">
                          <div className="max-w-[260px]">
                            <div className="font-semibold text-slate-950">
                              {item.topic}
                              {item.isDemo ? (
                                <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                                  Demo
                                </span>
                              ) : null}
                            </div>
                            {item.draftTitle ? (
                              <p className="mt-1 text-xs text-[#584237]">
                                {item.draftTitle}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-700">{item.audience}</td>
                        <td className="px-6 py-5 text-slate-700">
                          <div className="max-w-[220px]">{item.contentType}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              "rounded-full px-4 py-2 text-sm font-semibold",
                              statusClasses[item.contentStatus]
                            )}
                          >
                            {item.contentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {riskFlags.length ? (
                            <div className="flex max-w-[220px] flex-wrap gap-2">
                              {riskFlags.map((flag) => (
                                <Badge
                                  className="border-amber-200 bg-amber-50 text-amber-800"
                                  key={flag}
                                  variant="outline"
                                >
                                  <AlertTriangleIcon className="mr-1 size-3.5" />
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">None</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-slate-600">
                          {new Date(item.updatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingItem(item);
                                setIsFormOpen(true);
                              }}
                            >
                              <PencilIcon data-icon="inline-start" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateDraft(item)}
                            >
                              <SparklesIcon data-icon="inline-start" />
                              Generate Draft
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGeneratePrompt(item)}
                            >
                              <SearchIcon data-icon="inline-start" />
                              Generate LLM Prompt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyDraft(item)}
                            >
                              <CopyIcon data-icon="inline-start" />
                              Copy Draft
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportMarkdown(item)}
                            >
                              <FileOutputIcon data-icon="inline-start" />
                              Export Markdown
                            </Button>
                            <Button
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingItem(item)}
                            >
                              <Trash2Icon data-icon="inline-start" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="space-y-6">
          <section className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Weekly Content Planner
                </h2>
                <p className="text-sm text-[#584237]">
                  Assign one content item to each weekday slot. No auto-publishing.
                </p>
              </div>
              <CalendarDaysIcon className="size-5 text-[#9d4300]" />
            </div>
            <div className="space-y-3">
              {weeklyTemplate.map(({ day, label, defaultType }) => {
                const assignedItem =
                  items.find((item) => item.id === plan[day]) ?? null;

                return (
                  <div
                    className="rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] p-4"
                    key={day}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {label} - {day}
                        </p>
                        <p className="text-xs text-[#584237]">
                          Default: {defaultType}
                        </p>
                      </div>
                      <Badge
                        className="border-transparent bg-white text-[#584237]"
                        variant="secondary"
                      >
                        {assignedItem ? "Assigned" : "Open"}
                      </Badge>
                    </div>
                    <Select
                      value={plan[day] ?? "__none"}
                      onValueChange={(value) => handlePlanChange(day, value)}
                    >
                      <SelectTrigger className="h-11 border-[#e0c0b1] bg-white">
                        <SelectValue placeholder="Assign content item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="__none">Unassigned</SelectItem>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.topic}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {assignedItem ? (
                      <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                        <p className="font-semibold text-slate-950">
                          {assignedItem.contentType}
                        </p>
                        <p className="mt-1">{assignedItem.audience}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">Risk Rules</h3>
            <div className="mt-4 space-y-3 text-sm text-[#584237]">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                Claim words like guarantee, save, savings, proven, or certified
                trigger an evidence check.
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                Customer names are flagged for approval confirmation before use.
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                Grant and funding claims should be verified against the source.
              </div>
            </div>
          </section>
        </aside>
      </section>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Content Item" : "Add Content Idea"}
            </DialogTitle>
            <DialogDescription>
              Plan founder-led content, nurture drafts, and credibility assets
              for TruckFixr without auto-publishing.
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            item={editingItem}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingItem(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete content item?</DialogTitle>
            <DialogDescription>
              {deletingItem
                ? `This will permanently remove "${deletingItem.topic}" from the Marketing Agent queue.`
                : "This content item will be permanently removed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteConfirmed}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
