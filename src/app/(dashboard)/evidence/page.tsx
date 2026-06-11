"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  CopyIcon,
  FileOutputIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  PilotEvidenceForm,
  type PilotEvidenceFormValues,
} from "@/components/evidence/PilotEvidenceForm";
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
  copyToClipboard,
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
} from "@/lib/export";
import {
  addPilotEvidence,
  buildPilotEvidenceMarkdown,
  createRDEvidenceFromPilot,
  deletePilotEvidence,
  generateCaseStudyOutline,
  getPilotEvidence,
  updatePilotEvidence,
} from "@/lib/pilot-evidence";
import { type PilotEvidence } from "@/lib/types";
import { cn } from "@/lib/utils";

const pilotTypes: PilotEvidence["pilotType"][] = [
  "Discovery Pilot",
  "Implementation Pilot",
  "Informal Assessment",
];

const pilotStatuses: PilotEvidence["pilotStatus"][] = [
  "Active",
  "Completed",
  "Paused",
  "Cancelled",
];

const grantValues: PilotEvidence["grantEvidenceValue"][] = [
  "Low",
  "Medium",
  "High",
];

const statusClasses: Record<PilotEvidence["pilotStatus"], string> = {
  Active: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  Paused: "bg-yellow-100 text-yellow-800",
  Cancelled: "bg-red-100 text-red-700",
};

type EvidenceFilters = {
  search: string;
  pilotStatus: "" | PilotEvidence["pilotStatus"];
  pilotType: "" | PilotEvidence["pilotType"];
  grantEvidenceValue: "" | PilotEvidence["grantEvidenceValue"];
};

const emptyFilters: EvidenceFilters = {
  search: "",
  pilotStatus: "",
  pilotType: "",
  grantEvidenceValue: "",
};

function countByStatus(items: PilotEvidence[], status: PilotEvidence["pilotStatus"]) {
  return items.filter((item) => item.pilotStatus === status).length;
}

export default function EvidencePage() {
  const [items, setItems] = useState<PilotEvidence[]>([]);
  const [filters, setFilters] = useState<EvidenceFilters>(emptyFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PilotEvidence | null>(null);
  const [deletingItem, setDeletingItem] = useState<PilotEvidence | null>(null);
  const [caseStudyItem, setCaseStudyItem] = useState<PilotEvidence | null>(null);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    setItems(getPilotEvidence());
  }, []);

  const filteredItems = useMemo(() => {
    const search = deferredSearch.trim().toLowerCase();

    return items.filter((item) => {
      if (
        search &&
        !`${item.pilotName} ${item.fleetType ?? ""} ${item.problemStatement ?? ""}`
          .toLowerCase()
          .includes(search)
      ) {
        return false;
      }

      if (filters.pilotStatus && item.pilotStatus !== filters.pilotStatus) {
        return false;
      }

      if (filters.pilotType && item.pilotType !== filters.pilotType) {
        return false;
      }

      if (
        filters.grantEvidenceValue &&
        item.grantEvidenceValue !== filters.grantEvidenceValue
      ) {
        return false;
      }

      return true;
    });
  }, [deferredSearch, filters, items]);

  const caseStudyMarkdown = useMemo(
    () => (caseStudyItem ? generateCaseStudyOutline(caseStudyItem) : ""),
    [caseStudyItem]
  );

  const kpiCards = useMemo(
    () => [
      { label: "Total Pilots", value: items.length, className: "text-slate-700" },
      { label: "Active", value: countByStatus(items, "Active"), className: "text-green-700" },
      {
        label: "Completed",
        value: countByStatus(items, "Completed"),
        className: "text-blue-700",
      },
      {
        label: "High Grant Evidence Value",
        value: items.filter((item) => item.grantEvidenceValue === "High").length,
        className: "text-emerald-700",
      },
      {
        label: "Support Letter Potential",
        value: items.filter((item) => item.supportLetterPotential === "Yes").length,
        className: "text-orange-700",
      },
      {
        label: "Case Study Potential",
        value: items.filter((item) => item.caseStudyPotential === "Yes").length,
        className: "text-purple-700",
      },
    ],
    [items]
  );

  function refreshItems() {
    setItems(getPilotEvidence());
  }

  function handleSave(values: PilotEvidenceFormValues) {
    if (editingItem) {
      updatePilotEvidence(editingItem.id, values);
    } else {
      addPilotEvidence(values);
    }

    refreshItems();
    setIsFormOpen(false);
    setEditingItem(null);
  }

  function handleDeleteConfirmed() {
    if (!deletingItem) {
      return;
    }

    deletePilotEvidence(deletingItem.id);
    refreshItems();
    setDeletingItem(null);
    toast.success("Pilot evidence deleted.");
  }

  function updateFilter<K extends keyof EvidenceFilters>(
    key: K,
    value: EvidenceFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleGenerateRDEvidence(item: PilotEvidence) {
    createRDEvidenceFromPilot(item);
    toast.success("R&D evidence entry created in Funding.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-orange-500 px-5 py-4 text-white shadow-sm">
        <div className="flex gap-3">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm font-bold leading-6">
            Do not include customer names or identifying information in any exported
            document without explicit written consent from the customer.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
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
              placeholder="Search pilots"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.pilotStatus}
                onValueChange={(value) =>
                  updateFilter("pilotStatus", value as EvidenceFilters["pilotStatus"])
                }
              >
                <SelectTrigger className="h-11 w-[170px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Pilot status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pilotStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.pilotType}
                onValueChange={(value) =>
                  updateFilter("pilotType", value as EvidenceFilters["pilotType"])
                }
              >
                <SelectTrigger className="h-11 w-[210px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Pilot type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pilotTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.grantEvidenceValue}
                onValueChange={(value) =>
                  updateFilter(
                    "grantEvidenceValue",
                    value as EvidenceFilters["grantEvidenceValue"]
                  )
                }
              >
                <SelectTrigger className="h-11 w-[200px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Evidence value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {grantValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
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
              Add Pilot Evidence
            </Button>
            <Button
              variant="outline"
              onClick={() => exportToCSV(items, "truckfixr-os-pilot-evidence.csv")}
            >
              <FileOutputIcon data-icon="inline-start" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToJSON(
                  { exportedAt: new Date().toISOString(), pilotEvidence: items },
                  "truckfixr-os-pilot-evidence.json"
                )
              }
            >
              <FileOutputIcon data-icon="inline-start" />
              Export JSON
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] border-collapse text-left">
            <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
              <tr>
                <th className="px-6 py-5">Pilot</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Fleet</th>
                <th className="px-6 py-5">Grant Value</th>
                <th className="px-6 py-5">Support Letter</th>
                <th className="px-6 py-5">Case Study</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-sm font-semibold text-[#584237]"
                    colSpan={8}
                  >
                    No pilot evidence matches the current search and filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr className="hover:bg-slate-50" key={item.id}>
                    <td className="px-6 py-5">
                      <div className="max-w-[240px]">
                        <div className="font-semibold text-slate-950">
                          {item.pilotName}
                          {item.isDemo ? (
                            <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                              Demo
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-[#584237]">
                          {item.problemStatement ?? "No problem statement added yet."}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-700">{item.pilotType}</td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-semibold",
                          statusClasses[item.pilotStatus]
                        )}
                      >
                        {item.pilotStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {[item.fleetType, item.fleetSize && `${item.fleetSize} vehicles`]
                        .filter(Boolean)
                        .join(" · ") || "Not set"}
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {item.grantEvidenceValue}
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {item.supportLetterPotential}
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {item.caseStudyPotential}
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
                          onClick={() => setCaseStudyItem(item)}
                        >
                          <CopyIcon data-icon="inline-start" />
                          Generate Case Study Outline
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateRDEvidence(item)}
                        >
                          <FileOutputIcon data-icon="inline-start" />
                          Generate R&D Evidence Entry
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            exportToMarkdown(
                              buildPilotEvidenceMarkdown(item),
                              `${item.pilotName.toLowerCase().replace(/\s+/g, "-")}.md`
                            )
                          }
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
              {editingItem ? "Edit Pilot Evidence" : "Add Pilot Evidence"}
            </DialogTitle>
            <DialogDescription>
              Capture structured pilot outcomes without making unverified claims.
            </DialogDescription>
          </DialogHeader>
          <PilotEvidenceForm
            evidence={editingItem}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(caseStudyItem)}
        onOpenChange={(open) => {
          if (!open) {
            setCaseStudyItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {caseStudyItem
                ? `Case Study Outline: ${caseStudyItem.pilotName}`
                : "Case Study Outline"}
            </DialogTitle>
            <DialogDescription>
              Draft only. Review for consent and identifying details before sharing externally.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-[#9d4300]">
              Do not include customer names or identifying information without written consent.
            </div>
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg bg-[#f7f9fb] p-4 font-sans text-sm leading-6 text-slate-800">
              {caseStudyMarkdown}
            </pre>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  caseStudyMarkdown
                    ? copyToClipboard(caseStudyMarkdown).then((didCopy) => {
                        if (didCopy) {
                          toast.success("Case study outline copied.");
                          return;
                        }

                        toast.error("Clipboard copy failed.");
                      })
                    : undefined
                }
              >
                <CopyIcon data-icon="inline-start" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  caseStudyItem && caseStudyMarkdown
                    ? exportToMarkdown(
                        caseStudyMarkdown,
                        `${caseStudyItem.pilotName
                          .toLowerCase()
                          .replace(/\s+/g, "-")}-case-study.md`
                      )
                    : undefined
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
            <DialogTitle>Delete pilot evidence?</DialogTitle>
            <DialogDescription>
              {deletingItem
                ? `This will permanently remove ${deletingItem.pilotName} from the evidence tracker.`
                : "This pilot evidence record will be permanently removed."}
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
