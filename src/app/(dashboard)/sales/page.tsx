"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CopyIcon,
  DownloadIcon,
  FileOutputIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CSVImport } from "@/components/sales/CSVImport";
import { ProspectDrafts } from "@/components/sales/ProspectDrafts";
import {
  ProspectForm,
  type ProspectFormValues,
} from "@/components/sales/ProspectForm";
import { ResearchPromptGenerator } from "@/components/sales/ResearchPromptGenerator";
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
import { generateOutreachTemplates } from "@/lib/outreach-templates";
import {
  addProspect,
  deleteProspect,
  getProspects,
  updateProspect,
} from "@/lib/prospects";
import { getItem, STORAGE_KEYS } from "@/lib/storage";
import {
  type CompanySettings,
  type OutreachStatus,
  type Prospect,
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

const statusClasses: Record<OutreachStatus, string> = {
  New: "bg-slate-100 text-slate-600",
  Researched: "bg-blue-100 text-blue-700",
  Drafted: "bg-yellow-100 text-yellow-800",
  Approved: "bg-purple-100 text-purple-700",
  Sent: "bg-orange-100 text-orange-700",
  Replied: "bg-teal-100 text-teal-700",
  "Discovery Booked": "bg-green-100 text-green-700",
  "Pilot Fit": "bg-emerald-100 text-emerald-700",
  "Proposal Sent": "bg-indigo-100 text-indigo-700",
  Won: "bg-green-100 font-bold text-green-800",
  Nurture: "bg-slate-100 text-slate-700",
  Lost: "bg-red-100 text-red-700",
};

const outreachStatuses: OutreachStatus[] = [
  "New",
  "Researched",
  "Drafted",
  "Approved",
  "Sent",
  "Replied",
  "Discovery Booked",
  "Pilot Fit",
  "Proposal Sent",
  "Won",
  "Nurture",
  "Lost",
];

const fleetTypes = [
  "Trucking/Logistics",
  "Construction",
  "Contractor",
  "Courier",
  "Mixed",
  "Other",
] as const;

const scoreOptions = ["1", "2", "3", "4", "5"] as const;

type ScoreFilter = "" | "1" | "2" | "3" | "4" | "5";

type ProspectFilters = {
  search: string;
  status: "" | OutreachStatus;
  fleetType: "" | Prospect["fleetType"];
  pilotFitScore: ScoreFilter;
  grantFitScore: ScoreFilter;
};

const emptyFilters: ProspectFilters = {
  search: "",
  status: "",
  fleetType: "",
  pilotFitScore: "",
  grantFitScore: "",
};

function formatScore(score: Prospect["pilotFitScore"]) {
  return score === null ? "Unscored" : `${score}/5`;
}

function formatOptional(value?: string) {
  return value?.trim() ? value : "Not set";
}

function countByStatus(prospects: Prospect[], status: OutreachStatus) {
  return prospects.filter((prospect) => prospect.outreachStatus === status).length;
}

function countHighScore(
  prospects: Prospect[],
  key: "grantFitScore" | "revenueFitScore"
) {
  return prospects.filter((prospect) => {
    const score = prospect[key];
    return typeof score === "number" && score >= 4;
  }).length;
}

function getStoredSettings() {
  return (
    getItem<CompanySettings>(STORAGE_KEYS.SETTINGS) ?? defaultCompanySettings
  );
}

function ensureDraftFields(prospect: Prospect, settings: CompanySettings) {
  const templates = generateOutreachTemplates(prospect, settings);

  return {
    firstEmailDraft: prospect.firstEmailDraft || templates.firstEmailDraft,
    linkedInConnectDraft:
      prospect.linkedInConnectDraft || templates.linkedInConnectDraft,
    linkedInFollowUpDraft:
      prospect.linkedInFollowUpDraft || templates.linkedInFollowUpDraft,
    phoneScript: prospect.phoneScript || templates.phoneScript,
    cta: prospect.cta || templates.cta,
    llmPersonalizationPrompt:
      prospect.llmPersonalizationPrompt || templates.llmPersonalizationPrompt,
  };
}

function buildProspectMarkdown(prospect: Prospect, settings: CompanySettings) {
  const drafts = ensureDraftFields(prospect, settings);

  return [
    `# Prospect: ${prospect.companyName}`,
    `**Location:** ${prospect.location}`,
    `**Fleet Type:** ${formatOptional(prospect.fleetType)}`,
    `**Fleet Size:** ${formatOptional(prospect.estimatedFleetSize)}`,
    `**Decision Maker:** ${formatOptional(prospect.decisionMaker)}`,
    `**Status:** ${prospect.outreachStatus}`,
    `**Pilot Fit:** ${formatScore(prospect.pilotFitScore)} | **Revenue Fit:** ${formatScore(prospect.revenueFitScore)} | **Grant Fit:** ${formatScore(prospect.grantFitScore)}`,
    "",
    "## First Email Draft",
    drafts.firstEmailDraft,
    "",
    "## LinkedIn Connection Request",
    drafts.linkedInConnectDraft,
    "",
    "## LinkedIn Follow-Up",
    drafts.linkedInFollowUpDraft,
    "",
    "## Phone Script",
    drafts.phoneScript,
    "",
    "## LLM Personalization Prompt",
    drafts.llmPersonalizationPrompt,
    "",
    "---",
    "Template draft - review before sending. Do not send automatically.",
  ].join("\n");
}

export default function SalesPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ProspectFilters>(emptyFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isResearchOpen, setIsResearchOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [deletingProspect, setDeletingProspect] = useState<Prospect | null>(null);
  const [draftProspect, setDraftProspect] = useState<Prospect | null>(null);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    setProspects(getProspects());
  }, []);

  const selectedProspects = useMemo(
    () => prospects.filter((prospect) => selectedIds.includes(prospect.id)),
    [prospects, selectedIds]
  );

  const filteredProspects = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return prospects.filter((prospect) => {
      if (
        normalizedSearch &&
        !`${prospect.companyName} ${prospect.location}`
          .toLowerCase()
          .includes(normalizedSearch)
      ) {
        return false;
      }

      if (filters.status && prospect.outreachStatus !== filters.status) {
        return false;
      }

      if (filters.fleetType && prospect.fleetType !== filters.fleetType) {
        return false;
      }

      if (
        filters.pilotFitScore &&
        String(prospect.pilotFitScore ?? "") !== filters.pilotFitScore
      ) {
        return false;
      }

      if (
        filters.grantFitScore &&
        String(prospect.grantFitScore ?? "") !== filters.grantFitScore
      ) {
        return false;
      }

      return true;
    });
  }, [deferredSearch, filters, prospects]);

  const kpiCards = useMemo(
    () => [
      { label: "Total Prospects", value: prospects.length, className: "text-slate-700" },
      { label: "Researched", value: countByStatus(prospects, "Researched"), className: "text-blue-700" },
      { label: "Drafted", value: countByStatus(prospects, "Drafted"), className: "text-yellow-700" },
      { label: "Approved", value: countByStatus(prospects, "Approved"), className: "text-purple-700" },
      { label: "Sent", value: countByStatus(prospects, "Sent"), className: "text-orange-700" },
      { label: "Discovery Booked", value: countByStatus(prospects, "Discovery Booked"), className: "text-green-700" },
      { label: "Pilot Fit", value: countByStatus(prospects, "Pilot Fit"), className: "text-emerald-700" },
      { label: "Won", value: countByStatus(prospects, "Won"), className: "font-bold text-green-800" },
      { label: "High Grant Fit", value: countHighScore(prospects, "grantFitScore"), className: "text-teal-700" },
      { label: "High Revenue Fit", value: countHighScore(prospects, "revenueFitScore"), className: "text-indigo-700" },
    ],
    [prospects]
  );

  function refreshProspects() {
    const nextProspects = getProspects();
    setProspects(nextProspects);

    if (draftProspect) {
      const refreshedDraftProspect =
        nextProspects.find((prospect) => prospect.id === draftProspect.id) ?? null;
      setDraftProspect(refreshedDraftProspect);
    }
  }

  function handleSave(values: ProspectFormValues) {
    if (editingProspect) {
      updateProspect(editingProspect.id, values);
    } else {
      addProspect(values);
    }

    refreshProspects();
    setIsFormOpen(false);
    setEditingProspect(null);
  }

  function handleOpenDrafts(prospect: Prospect) {
    const settings = getStoredSettings();
    updateProspect(prospect.id, ensureDraftFields(prospect, settings));
    refreshProspects();
    const refreshedProspect =
      getProspects().find((item) => item.id === prospect.id) ?? prospect;
    setDraftProspect(refreshedProspect);
  }

  async function handleCopyEmail(prospect: Prospect) {
    const settings = getStoredSettings();
    const drafts = ensureDraftFields(prospect, settings);
    updateProspect(prospect.id, drafts);
    refreshProspects();

    const didCopy = await copyToClipboard(drafts.firstEmailDraft);

    if (didCopy) {
      toast.success("Email draft copied.");
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  function handleExportProspectMarkdown(prospect: Prospect) {
    const settings = getStoredSettings();
    const content = buildProspectMarkdown(prospect, settings);

    exportToMarkdown(
      content,
      `${prospect.companyName.toLowerCase().replaceAll(/\s+/g, "-")}.md`
    );
    toast.success("Prospect markdown exported.");
  }

  function handleExportSelectedMarkdown() {
    if (selectedProspects.length === 0) {
      toast.error("Select at least one prospect first.");
      return;
    }

    const settings = getStoredSettings();
    const content = selectedProspects
      .map((prospect) => buildProspectMarkdown(prospect, settings))
      .join("\n\n");

    exportToMarkdown(content, "truckfixr-os-selected-prospects.md");
    toast.success("Selected prospects exported as markdown.");
  }

  function handleDeleteConfirmed() {
    if (!deletingProspect) {
      return;
    }

    deleteProspect(deletingProspect.id);
    setSelectedIds((currentIds) =>
      currentIds.filter((id) => id !== deletingProspect.id)
    );
    refreshProspects();
    setDeletingProspect(null);
    toast.success("Prospect deleted.");
  }

  function handleExportCSV() {
    exportToCSV(prospects, "truckfixr-os-prospects.csv");
  }

  function handleExportJSON() {
    exportToJSON(
      { exportedAt: new Date().toISOString(), prospects },
      "truckfixr-os-prospects.json"
    );
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((currentIds) => {
      if (checked) {
        return currentIds.includes(id) ? currentIds : [...currentIds, id];
      }

      return currentIds.filter((currentId) => currentId !== id);
    });
  }

  function updateFilter<K extends keyof ProspectFilters>(
    key: K,
    value: ProspectFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

      <section className="flex flex-col gap-4 rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <Input
              className="h-11 border-[#e0c0b1] bg-[#f7f9fb] sm:max-w-sm"
              placeholder="Search company name or location"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  updateFilter("status", value as ProspectFilters["status"])
                }
              >
                <SelectTrigger className="h-11 w-[180px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Outreach status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {outreachStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.fleetType ?? ""}
                onValueChange={(value) =>
                  updateFilter(
                    "fleetType",
                    value as ProspectFilters["fleetType"]
                  )
                }
              >
                <SelectTrigger className="h-11 w-[180px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Fleet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {fleetTypes.map((fleetType) => (
                      <SelectItem key={fleetType} value={fleetType}>
                        {fleetType}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.pilotFitScore}
                onValueChange={(value) =>
                  updateFilter(
                    "pilotFitScore",
                    value as ProspectFilters["pilotFitScore"]
                  )
                }
              >
                <SelectTrigger className="h-11 w-[160px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Pilot fit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {scoreOptions.map((score) => (
                      <SelectItem key={score} value={score}>
                        {score}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.grantFitScore}
                onValueChange={(value) =>
                  updateFilter(
                    "grantFitScore",
                    value as ProspectFilters["grantFitScore"]
                  )
                }
              >
                <SelectTrigger className="h-11 w-[160px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Grant fit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {scoreOptions.map((score) => (
                      <SelectItem key={score} value={score}>
                        {score}
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

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm font-semibold text-[#584237]">
            {filteredProspects.length} result
            {filteredProspects.length === 1 ? "" : "s"} shown
            {selectedIds.length > 0 ? `, ${selectedIds.length} selected` : ""}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-[#9d4300] text-white hover:bg-orange-600"
              onClick={() => {
                setEditingProspect(null);
                setIsFormOpen(true);
              }}
            >
              <PlusIcon data-icon="inline-start" />
              Add Prospect
            </Button>
            <Button variant="outline" onClick={() => setIsCsvImportOpen(true)}>
              <UploadIcon data-icon="inline-start" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={() => setIsResearchOpen(true)}>
              <SearchIcon data-icon="inline-start" />
              Research Prompt
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <DownloadIcon data-icon="inline-start" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <FileOutputIcon data-icon="inline-start" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={handleExportSelectedMarkdown}>
              <FileOutputIcon data-icon="inline-start" />
              Export Selected as Markdown
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-collapse text-left">
            <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
              <tr>
                <th className="px-6 py-5">Company Name</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Fleet Type</th>
                <th className="px-6 py-5">Fleet Size</th>
                <th className="px-6 py-5">Decision Maker</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Pilot Fit</th>
                <th className="px-6 py-5">Revenue Fit</th>
                <th className="px-6 py-5">Last Contact</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProspects.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-sm font-semibold text-[#584237]"
                    colSpan={10}
                  >
                    No prospects match the current search and filters.
                  </td>
                </tr>
              ) : (
                filteredProspects.map((prospect) => (
                  <tr className="hover:bg-slate-50" key={prospect.id}>
                    <td className="px-6 py-5 font-medium text-slate-950">
                      <label className="flex items-start gap-3">
                        <input
                          checked={selectedIds.includes(prospect.id)}
                          className="mt-1 size-4 rounded border-[#e0c0b1]"
                          type="checkbox"
                          onChange={(event) =>
                            toggleSelected(prospect.id, event.target.checked)
                          }
                        />
                        <span>
                          {prospect.companyName}
                          {prospect.isDemo ? (
                            <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                              Demo
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {prospect.location}
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {formatOptional(prospect.fleetType)}
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {formatOptional(prospect.estimatedFleetSize)}
                    </td>
                    <td className="px-6 py-5 text-slate-950">
                      {formatOptional(prospect.decisionMaker)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-semibold",
                          statusClasses[prospect.outreachStatus]
                        )}
                      >
                        {prospect.outreachStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[#9d4300]">
                      {formatScore(prospect.pilotFitScore)}
                    </td>
                    <td className="px-6 py-5 text-indigo-700">
                      {formatScore(prospect.revenueFitScore)}
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {formatOptional(prospect.lastContactDate)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProspect(prospect);
                            setIsFormOpen(true);
                          }}
                        >
                          <PencilIcon data-icon="inline-start" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDrafts(prospect)}
                        >
                          <SparklesIcon data-icon="inline-start" />
                          Generate Drafts
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyEmail(prospect)}
                        >
                          <CopyIcon data-icon="inline-start" />
                          Copy Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportProspectMarkdown(prospect)}
                        >
                          <FileOutputIcon data-icon="inline-start" />
                          Export Markdown
                        </Button>
                        <Button
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingProspect(prospect)}
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
            setEditingProspect(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingProspect ? "Edit Prospect" : "Add Prospect"}
            </DialogTitle>
            <DialogDescription>
              Score Ontario commercial fleet prospects and prepare outreach for
              the Sales Agent.
            </DialogDescription>
          </DialogHeader>
          <ProspectForm
            prospect={editingProspect}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingProspect(null);
            }}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCsvImportOpen} onOpenChange={setIsCsvImportOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import Prospects from CSV</DialogTitle>
            <DialogDescription>
              Accepted headers: companyName, location, website, fleetType,
              estimatedFleetSize, decisionMaker, email, phone, notes.
            </DialogDescription>
          </DialogHeader>
          <CSVImport
            onImported={() => {
              refreshProspects();
              setIsCsvImportOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isResearchOpen} onOpenChange={setIsResearchOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Research Prompt Generator</DialogTitle>
            <DialogDescription>
              Generate a copy-ready prompt, parse JSON results, and add
              research prospects into the pipeline.
            </DialogDescription>
          </DialogHeader>
          <ResearchPromptGenerator
            onImported={() => {
              refreshProspects();
              setIsResearchOpen(false);
            }}
            onManualAdd={() => {
              setIsResearchOpen(false);
              setEditingProspect(null);
              setIsFormOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(draftProspect)}
        onOpenChange={(open) => {
          if (!open) {
            setDraftProspect(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {draftProspect
                ? `Outreach Drafts: ${draftProspect.companyName}`
                : "Outreach Drafts"}
            </DialogTitle>
            <DialogDescription>
              Review, edit, regenerate, and copy deterministic outreach drafts.
            </DialogDescription>
          </DialogHeader>
          {draftProspect ? (
            <ProspectDrafts
              prospect={draftProspect}
              settings={getStoredSettings()}
              onUpdated={refreshProspects}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingProspect)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingProspect(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete prospect?</DialogTitle>
            <DialogDescription>
              {deletingProspect
                ? `This will permanently remove ${deletingProspect.companyName} from the Sales Agent pipeline.`
                : "This prospect will be permanently removed."}
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
