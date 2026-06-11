"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CopyIcon,
  FileOutputIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  RoadmapItemForm,
  type RoadmapItemFormValues,
} from "@/components/roadmap/RoadmapItemForm";
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
  addRoadmapItem,
  buildRoadmapMarkdown,
  deleteRoadmapItem,
  generateWeeklyImprovementReport,
  getRoadmapItems,
  updateRoadmapItem,
} from "@/lib/roadmap";
import {
  copyToClipboard,
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
} from "@/lib/export";
import { type RoadmapItem, type WorkstreamPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

const modules: RoadmapItem["module"][] = [
  "Sales",
  "Marketing",
  "Engineering",
  "Funding/R&D",
  "Dashboard",
  "Settings",
  "Integrations",
  "Pilot Evidence",
  "Partnerships",
];

const phases: RoadmapItem["phase"][] = [
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Phase 4",
  "Future",
];

const priorities: WorkstreamPriority[] = ["Low", "Medium", "High", "Critical"];

const statuses: RoadmapItem["status"][] = [
  "Planned",
  "In Progress",
  "Blocked",
  "Done",
  "Deferred",
];

const owners: RoadmapItem["owner"][] = [
  "Dickson",
  "Codex",
  "Developer",
  "Future Hire",
];

const priorityClasses: Record<WorkstreamPriority, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const statusClasses: Record<RoadmapItem["status"], string> = {
  Planned: "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Blocked: "bg-red-100 text-red-700",
  Done: "bg-green-100 text-green-800",
  Deferred: "bg-slate-200 text-slate-700",
};

const riskClasses: Record<RoadmapItem["riskLevel"], string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

type RoadmapFilters = {
  search: string;
  module: "" | RoadmapItem["module"];
  phase: "" | RoadmapItem["phase"];
  status: "" | RoadmapItem["status"];
  priority: "" | WorkstreamPriority;
  owner: "" | RoadmapItem["owner"];
};

const emptyFilters: RoadmapFilters = {
  search: "",
  module: "",
  phase: "",
  status: "",
  priority: "",
  owner: "",
};

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [filters, setFilters] = useState<RoadmapFilters>(emptyFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<RoadmapItem | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    setItems(getRoadmapItems());
  }, []);

  const filteredItems = useMemo(() => {
    const search = deferredSearch.trim().toLowerCase();

    return items.filter((item) => {
      if (
        search &&
        !`${item.title} ${item.businessReason ?? ""} ${item.notes ?? ""} ${
          item.module
        }`
          .toLowerCase()
          .includes(search)
      ) {
        return false;
      }

      if (filters.module && item.module !== filters.module) {
        return false;
      }

      if (filters.phase && item.phase !== filters.phase) {
        return false;
      }

      if (filters.status && item.status !== filters.status) {
        return false;
      }

      if (filters.priority && item.priority !== filters.priority) {
        return false;
      }

      if (filters.owner && item.owner !== filters.owner) {
        return false;
      }

      return true;
    });
  }, [deferredSearch, filters, items]);

  const reportMarkdown = useMemo(
    () => generateWeeklyImprovementReport(items),
    [items]
  );

  function refreshItems() {
    setItems(getRoadmapItems());
  }

  function handleSave(values: RoadmapItemFormValues) {
    if (editingItem) {
      updateRoadmapItem(editingItem.id, values);
    } else {
      addRoadmapItem(values);
    }

    refreshItems();
    setIsFormOpen(false);
    setEditingItem(null);
  }

  function handleDeleteConfirmed() {
    if (!deletingItem) {
      return;
    }

    deleteRoadmapItem(deletingItem.id);
    refreshItems();
    setDeletingItem(null);
    toast.success("Roadmap item deleted.");
  }

  function updateFilter<K extends keyof RoadmapFilters>(
    key: K,
    value: RoadmapFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleCopyReport() {
    const didCopy = await copyToClipboard(reportMarkdown);

    if (didCopy) {
      toast.success("Weekly improvement report copied.");
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <Input
              className="h-11 border-[#e0c0b1] bg-[#f7f9fb] sm:max-w-sm"
              placeholder="Search roadmap items"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.module}
                onValueChange={(value) =>
                  updateFilter("module", value as RoadmapFilters["module"])
                }
              >
                <SelectTrigger className="h-11 w-[190px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.phase}
                onValueChange={(value) =>
                  updateFilter("phase", value as RoadmapFilters["phase"])
                }
              >
                <SelectTrigger className="h-11 w-[150px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {phases.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  updateFilter("status", value as RoadmapFilters["status"])
                }
              >
                <SelectTrigger className="h-11 w-[170px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.priority}
                onValueChange={(value) =>
                  updateFilter("priority", value as RoadmapFilters["priority"])
                }
              >
                <SelectTrigger className="h-11 w-[170px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.owner}
                onValueChange={(value) =>
                  updateFilter("owner", value as RoadmapFilters["owner"])
                }
              >
                <SelectTrigger className="h-11 w-[170px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {owners.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
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
              Add Roadmap Item
            </Button>
            <Button variant="outline" onClick={() => setIsReportOpen(true)}>
              <SparklesIcon data-icon="inline-start" />
              Generate Weekly Improvement Report
            </Button>
            <Button
              variant="outline"
              onClick={() => exportToCSV(items, "truckfixr-os-roadmap.csv")}
            >
              <FileOutputIcon data-icon="inline-start" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToJSON(
                  { exportedAt: new Date().toISOString(), roadmapItems: items },
                  "truckfixr-os-roadmap.json"
                )
              }
            >
              <FileOutputIcon data-icon="inline-start" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToMarkdown(
                  buildRoadmapMarkdown(items),
                  "truckfixr-os-roadmap.md"
                )
              }
            >
              <FileOutputIcon data-icon="inline-start" />
              Export Markdown
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1480px] border-collapse text-left">
            <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
              <tr>
                <th className="px-6 py-5">Title</th>
                <th className="px-6 py-5">Module</th>
                <th className="px-6 py-5">Phase</th>
                <th className="px-6 py-5">Priority</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Risk</th>
                <th className="px-6 py-5">Owner</th>
                <th className="px-6 py-5">Target</th>
                <th className="px-6 py-5">Updated</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-sm font-semibold text-[#584237]"
                    colSpan={10}
                  >
                    No roadmap items match the current search and filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr className="hover:bg-slate-50" key={item.id}>
                    <td className="px-6 py-5">
                      <div className="max-w-[240px]">
                        <div className="font-semibold text-slate-950">
                          {item.title}
                          {item.isDemo ? (
                            <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                              Demo
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-[#584237]">
                          {item.type}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-700">{item.module}</td>
                    <td className="px-6 py-5 text-slate-700">{item.phase}</td>
                    <td className="px-6 py-5">
                      <Badge
                        className={cn("border-transparent", priorityClasses[item.priority])}
                        variant="secondary"
                      >
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        className={cn("border-transparent", statusClasses[item.status])}
                        variant="secondary"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        className={cn("border-transparent", riskClasses[item.riskLevel])}
                        variant="secondary"
                      >
                        {item.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-slate-700">{item.owner}</td>
                    <td className="px-6 py-5 text-slate-700">
                      {item.targetDate ?? "Not set"}
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
                ))
              )}
            </tbody>
          </table>
        </div>
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
              {editingItem ? "Edit Roadmap Item" : "Add Roadmap Item"}
            </DialogTitle>
            <DialogDescription>
              Track features, bugs, integrations, and follow-on improvements for
              TruckFixr OS.
            </DialogDescription>
          </DialogHeader>
          <RoadmapItemForm
            item={editingItem}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Weekly Improvement Report</DialogTitle>
            <DialogDescription>
              Generated from the current roadmap state, recent completions, and
              planned priorities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl bg-[#f7f9fb] p-4 font-sans text-sm leading-6 text-slate-800">
              {reportMarkdown}
            </pre>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCopyReport}>
                <CopyIcon data-icon="inline-start" />
                Copy Report
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportToMarkdown(
                    reportMarkdown,
                    "truckfixr-weekly-improvement-report.md"
                  )
                }
              >
                <FileOutputIcon data-icon="inline-start" />
                Export Markdown
              </Button>
            </div>
          </div>
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
            <DialogTitle>Delete roadmap item?</DialogTitle>
            <DialogDescription>
              {deletingItem
                ? `This will permanently remove "${deletingItem.title}" from the roadmap tracker.`
                : "This roadmap item will be permanently removed."}
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
