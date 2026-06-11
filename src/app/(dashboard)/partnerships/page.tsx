"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CopyIcon,
  FileOutputIcon,
  HandshakeIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  PartnershipForm,
  type PartnershipFormValues,
} from "@/components/partnerships/PartnershipForm";
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
  buildPartnershipMarkdown,
  generatePartnershipDrafts,
  generatePartnershipLLMPrompt,
  partnershipDraftLabels,
  type PartnershipDraftKey,
} from "@/lib/partnership-templates";
import {
  addPartnership,
  deletePartnership,
  getPartnerships,
  updatePartnership,
} from "@/lib/partnerships";
import {
  copyToClipboard,
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
} from "@/lib/export";
import { type Partnership } from "@/lib/types";
import { cn } from "@/lib/utils";

const partnerTypes: Partnership["partnerType"][] = [
  "Parts Supplier",
  "ELD/Telematics Provider",
  "Fleet Management Platform",
  "Truck Manufacturer",
  "Repair Shop Partner",
  "Referral Partner",
  "Accelerator/Incubator",
  "Government/Economic Dev",
  "Industry Association",
  "Other",
];

const relationshipStatuses: Partnership["relationshipStatus"][] = [
  "Identified",
  "Contacted",
  "Active Conversation",
  "Formal Agreement",
  "Referral Active",
  "Integration Planning",
  "Dormant",
  "Not a Fit",
];

const referralPotentials: Partnership["referralPotential"][] = [
  "Low",
  "Medium",
  "High",
];

const relationshipStatusClasses: Record<
  Partnership["relationshipStatus"],
  string
> = {
  Identified: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-100 text-blue-700",
  "Active Conversation": "bg-orange-100 text-orange-700",
  "Formal Agreement": "bg-green-100 text-green-800",
  "Referral Active": "bg-emerald-100 text-emerald-700",
  "Integration Planning": "bg-purple-100 text-purple-700",
  Dormant: "bg-slate-200 text-slate-700",
  "Not a Fit": "bg-red-100 text-red-700",
};

const draftOrder: PartnershipDraftKey[] = [
  "initialInquiry",
  "referralProposal",
  "coPilotOpportunity",
  "integrationStarter",
  "followUp",
];

type PartnershipFilters = {
  search: string;
  partnerType: "" | Partnership["partnerType"];
  relationshipStatus: "" | Partnership["relationshipStatus"];
  referralPotential: "" | Partnership["referralPotential"];
};

const emptyFilters: PartnershipFilters = {
  search: "",
  partnerType: "",
  relationshipStatus: "",
  referralPotential: "",
};

function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return timestamp.toLocaleDateString();
}

export default function PartnershipsPage() {
  const [items, setItems] = useState<Partnership[]>([]);
  const [filters, setFilters] = useState<PartnershipFilters>(emptyFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partnership | null>(null);
  const [deletingItem, setDeletingItem] = useState<Partnership | null>(null);
  const [draftItem, setDraftItem] = useState<Partnership | null>(null);
  const [promptItem, setPromptItem] = useState<Partnership | null>(null);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    setItems(getPartnerships());
  }, []);

  const filteredItems = useMemo(() => {
    const search = deferredSearch.trim().toLowerCase();

    return items.filter((item) => {
      if (
        search &&
        !`${item.partnerName} ${item.contactName ?? ""} ${item.location ?? ""} ${
          item.notes ?? ""
        } ${item.nextAction ?? ""}`
          .toLowerCase()
          .includes(search)
      ) {
        return false;
      }

      if (filters.partnerType && item.partnerType !== filters.partnerType) {
        return false;
      }

      if (
        filters.relationshipStatus &&
        item.relationshipStatus !== filters.relationshipStatus
      ) {
        return false;
      }

      if (
        filters.referralPotential &&
        item.referralPotential !== filters.referralPotential
      ) {
        return false;
      }

      return true;
    });
  }, [deferredSearch, filters, items]);

  const kpiCards = useMemo(
    () => [
      { label: "Total Partners", value: items.length, className: "text-slate-700" },
      {
        label: "Active Conversations",
        value: items.filter(
          (item) => item.relationshipStatus === "Active Conversation"
        ).length,
        className: "text-orange-700",
      },
      {
        label: "Formal Agreements",
        value: items.filter(
          (item) => item.relationshipStatus === "Formal Agreement"
        ).length,
        className: "text-green-800",
      },
      {
        label: "High Referral Potential",
        value: items.filter((item) => item.referralPotential === "High").length,
        className: "text-blue-700",
      },
      {
        label: "Co-pilot Potential",
        value: items.filter((item) => item.coPilotPotential === "Yes").length,
        className: "text-purple-700",
      },
      {
        label: "Integration Potential",
        value: items.filter((item) => item.integrationPotential === "Yes").length,
        className: "text-emerald-700",
      },
    ],
    [items]
  );

  const currentDrafts = useMemo(
    () => (draftItem ? generatePartnershipDrafts(draftItem) : null),
    [draftItem]
  );

  const currentPrompt = useMemo(
    () => (promptItem ? generatePartnershipLLMPrompt(promptItem) : ""),
    [promptItem]
  );

  function refreshItems() {
    setItems(getPartnerships());
  }

  function handleSave(values: PartnershipFormValues) {
    if (editingItem) {
      updatePartnership(editingItem.id, values);
    } else {
      addPartnership(values);
    }

    refreshItems();
    setIsFormOpen(false);
    setEditingItem(null);
  }

  function handleDeleteConfirmed() {
    if (!deletingItem) {
      return;
    }

    deletePartnership(deletingItem.id);
    refreshItems();
    setDeletingItem(null);
    toast.success("Partnership deleted.");
  }

  function updateFilter<K extends keyof PartnershipFilters>(
    key: K,
    value: PartnershipFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleExportMarkdown(item: Partnership) {
    exportToMarkdown(
      buildPartnershipMarkdown(item),
      `${item.partnerName.toLowerCase().replace(/\s+/g, "-")}.md`
    );
    toast.success("Partnership markdown exported.");
  }

  async function handleCopyDraft(draftKey: PartnershipDraftKey) {
    if (!currentDrafts) {
      return;
    }

    const didCopy = await copyToClipboard(currentDrafts[draftKey]);

    if (didCopy) {
      toast.success(`${partnershipDraftLabels[draftKey]} copied.`);
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  async function handleCopyPrompt() {
    if (!currentPrompt) {
      return;
    }

    const didCopy = await copyToClipboard(currentPrompt);

    if (didCopy) {
      toast.success("LLM prompt copied.");
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  return (
    <div className="space-y-6">
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
              placeholder="Search by partner, contact, or location"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.partnerType}
                onValueChange={(value) =>
                  updateFilter(
                    "partnerType",
                    value as PartnershipFilters["partnerType"]
                  )
                }
              >
                <SelectTrigger className="h-11 w-[220px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Partner type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {partnerTypes.map((partnerType) => (
                      <SelectItem key={partnerType} value={partnerType}>
                        {partnerType}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.relationshipStatus}
                onValueChange={(value) =>
                  updateFilter(
                    "relationshipStatus",
                    value as PartnershipFilters["relationshipStatus"]
                  )
                }
              >
                <SelectTrigger className="h-11 w-[210px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Relationship status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {relationshipStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={filters.referralPotential}
                onValueChange={(value) =>
                  updateFilter(
                    "referralPotential",
                    value as PartnershipFilters["referralPotential"]
                  )
                }
              >
                <SelectTrigger className="h-11 w-[190px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Referral potential" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {referralPotentials.map((potential) => (
                      <SelectItem key={potential} value={potential}>
                        {potential}
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
              Add Partnership
            </Button>
            <Button
              variant="outline"
              onClick={() => exportToCSV(items, "truckfixr-os-partnerships.csv")}
            >
              <FileOutputIcon data-icon="inline-start" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToJSON(
                  { exportedAt: new Date().toISOString(), partnerships: items },
                  "truckfixr-os-partnerships.json"
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
          <table className="w-full min-w-[1440px] border-collapse text-left">
            <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
              <tr>
                <th className="px-6 py-5">Partner</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Referral</th>
                <th className="px-6 py-5">Co-pilot</th>
                <th className="px-6 py-5">Integration</th>
                <th className="px-6 py-5">Last Contact</th>
                <th className="px-6 py-5">Next Action</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-sm font-semibold text-[#584237]"
                    colSpan={9}
                  >
                    No partnerships match the current search and filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr className="hover:bg-slate-50" key={item.id}>
                    <td className="px-6 py-5">
                      <div className="max-w-[240px]">
                        <div className="font-semibold text-slate-950">
                          {item.partnerName}
                          {item.isDemo ? (
                            <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                              Demo
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-[#584237]">
                          {item.contactName ?? "No contact yet"}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-700">{item.partnerType}</td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-semibold",
                          relationshipStatusClasses[item.relationshipStatus]
                        )}
                      >
                        {item.relationshipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {item.referralPotential}
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        className="border-transparent bg-slate-100 text-slate-700"
                        variant="secondary"
                      >
                        {item.coPilotPotential}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        className="border-transparent bg-slate-100 text-slate-700"
                        variant="secondary"
                      >
                        {item.integrationPotential}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {formatDate(item.lastContactDate)}
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      <div className="max-w-[220px]">
                        {item.nextAction ?? "No next action set"}
                      </div>
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
                          onClick={() => setDraftItem(item)}
                        >
                          <SparklesIcon data-icon="inline-start" />
                          Generate Outreach Draft
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPromptItem(item)}
                        >
                          <SearchIcon data-icon="inline-start" />
                          Generate LLM Prompt
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <HandshakeIcon className="size-5 text-[#9d4300]" />
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Relationship Strategy
              </h2>
              <p className="text-sm text-[#584237]">
                Use this tracker for referral motion, co-pilot opportunities, and
                integration planning. No auto-sending lives here.
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">Drafting Rules</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#584237]">
            <div className="rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] p-3">
              Lead with shared customer value: fleet uptime, maintenance visibility,
              and faster maintenance decisions.
            </div>
            <div className="rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] p-3">
              Keep the tone practical and founder-led from Dickson. Do not promise
              outcomes or invent a fit that has not been earned.
            </div>
          </div>
        </article>
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
              {editingItem ? "Edit Partnership" : "Add Partnership"}
            </DialogTitle>
            <DialogDescription>
              Track strategic relationships with suppliers, telematics providers,
              associations, and referral partners.
            </DialogDescription>
          </DialogHeader>
          <PartnershipForm
            partnership={editingItem}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(draftItem)}
        onOpenChange={(open) => {
          if (!open) {
            setDraftItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {draftItem
                ? `Outreach Drafts: ${draftItem.partnerName}`
                : "Outreach Drafts"}
            </DialogTitle>
            <DialogDescription>
              Deterministic templates for founder-led partnership outreach. Review
              before sending.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[68vh] gap-4 overflow-y-auto pr-1">
            {currentDrafts
              ? draftOrder.map((draftKey) => (
                  <article
                    className="rounded-xl border border-[#e0c0b1] bg-[#f7f9fb] p-4"
                    key={draftKey}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-950">
                        {partnershipDraftLabels[draftKey]}
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyDraft(draftKey)}
                      >
                        <CopyIcon data-icon="inline-start" />
                        Copy
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-800">
                      {currentDrafts[draftKey]}
                    </pre>
                  </article>
                ))
              : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(promptItem)}
        onOpenChange={(open) => {
          if (!open) {
            setPromptItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {promptItem
                ? `LLM Prompt: ${promptItem.partnerName}`
                : "LLM Prompt"}
            </DialogTitle>
            <DialogDescription>
              Copy-ready prompt for ChatGPT, Claude, or Perplexity. No auto-send.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl bg-[#f7f9fb] p-4 font-sans text-sm leading-6 text-slate-800">
              {currentPrompt}
            </pre>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCopyPrompt}>
                <CopyIcon data-icon="inline-start" />
                Copy Prompt
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
            <DialogTitle>Delete partnership?</DialogTitle>
            <DialogDescription>
              {deletingItem
                ? `This will permanently remove ${deletingItem.partnerName} from the relationship tracker.`
                : "This partnership record will be permanently removed."}
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
