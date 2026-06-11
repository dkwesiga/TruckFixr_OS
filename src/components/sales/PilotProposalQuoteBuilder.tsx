"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2Icon, FileTextIcon, SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createDefaultOnboardingChecklist,
  defaultPilotProposal,
  defaultQuote,
  generatePilotProposalMarkdown,
  generateQuoteSummaryMarkdown,
  TRUCKFIXR_PRICING,
  type TruckFixrPlan,
} from "@/lib/sales-proposals";
import { type Prospect, type SalesPilotProposal, type SalesQuote } from "@/lib/types";

type PilotProposalQuoteBuilderProps = {
  prospects: Prospect[];
  selectedProspectId: string | null;
  onSelectProspect: (id: string) => void;
  onUpdateProspect: (prospect: Prospect, updates: Partial<Prospect>) => void;
};

const proposalStatuses: SalesPilotProposal["status"][] = [
  "Draft",
  "Needs Review",
  "Sent",
  "Accepted",
  "Rejected",
  "Revised",
];

const pricingPaths: SalesPilotProposal["pricingPath"][] = [
  "Free structured pilot",
  "Paid pilot",
  "Discounted early adopter pilot",
  "Standard subscription quote",
  "Custom strategic pilot",
];

const plans = Object.keys(TRUCKFIXR_PRICING) as TruckFixrPlan[];

function numberOrUndefined(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function PilotProposalQuoteBuilder({
  prospects,
  selectedProspectId,
  onSelectProspect,
  onUpdateProspect,
}: PilotProposalQuoteBuilderProps) {
  const selectedProspect = useMemo(() => {
    return (
      prospects.find((prospect) => prospect.id === selectedProspectId) ??
      prospects[0] ??
      null
    );
  }, [prospects, selectedProspectId]);
  const [proposalDraft, setProposalDraft] = useState<SalesPilotProposal | null>(
    null
  );
  const [quoteDraft, setQuoteDraft] = useState<SalesQuote | null>(null);

  useEffect(() => {
    if (!selectedProspect) {
      setProposalDraft(null);
      setQuoteDraft(null);
      return;
    }

    setProposalDraft(defaultPilotProposal(selectedProspect));
    setQuoteDraft(defaultQuote(selectedProspect));
  }, [selectedProspect]);

  if (!selectedProspect || !proposalDraft || !quoteDraft) {
    return (
      <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-white p-5">
        <p className="font-bold text-slate-950">No prospect selected</p>
        <p className="mt-2 text-sm text-slate-600">
          Add or import a prospect before building a proposal or quote.
        </p>
      </div>
    );
  }

  const proposalMarkdown =
    proposalDraft.proposalMarkdown ??
    generatePilotProposalMarkdown(selectedProspect, proposalDraft);
  const quoteSummary =
    quoteDraft.summaryMarkdown ??
    generateQuoteSummaryMarkdown(selectedProspect, quoteDraft);

  function updateProposal<K extends keyof SalesPilotProposal>(
    key: K,
    value: SalesPilotProposal[K]
  ) {
    setProposalDraft((current) =>
      current ? { ...current, [key]: value, updatedAt: new Date().toISOString() } : current
    );
  }

  function updateQuote<K extends keyof SalesQuote>(key: K, value: SalesQuote[K]) {
    setQuoteDraft((current) =>
      current ? { ...current, [key]: value, updatedAt: new Date().toISOString() } : current
    );
  }

  function handleGenerateProposal() {
    if (!selectedProspect || !proposalDraft) return;

    const markdown = generatePilotProposalMarkdown(selectedProspect, proposalDraft);
    const nextProposal = {
      ...proposalDraft,
      proposalMarkdown: markdown,
      updatedAt: new Date().toISOString(),
    };
    setProposalDraft(nextProposal);
    onUpdateProspect(selectedProspect, {
      pilotProposal: nextProposal,
      currentStage:
        selectedProspect.currentStage === "Discovery Completed"
          ? "Pilot Proposed"
          : selectedProspect.currentStage,
      outreachStatus:
        selectedProspect.outreachStatus === "Pilot Fit"
          ? "Proposal Sent"
          : selectedProspect.outreachStatus,
      nextAction: "Review pilot proposal and confirm whether it is ready to send manually.",
    });
  }

  function handleSaveProposal() {
    if (!selectedProspect || !proposalDraft) return;

    const shouldCreateOnboarding = proposalDraft.status === "Accepted";
    onUpdateProspect(selectedProspect, {
      pilotProposal: {
        ...proposalDraft,
        proposalMarkdown,
        updatedAt: new Date().toISOString(),
      },
      onboardingChecklist: shouldCreateOnboarding
        ? selectedProspect.onboardingChecklist ?? createDefaultOnboardingChecklist()
        : selectedProspect.onboardingChecklist,
      currentStage: shouldCreateOnboarding
        ? "Pilot Agreed"
        : selectedProspect.currentStage,
      nextAction: shouldCreateOnboarding
        ? "Create onboarding checklist and schedule pilot kickoff."
        : selectedProspect.nextAction,
    });
  }

  function handleGenerateQuote() {
    if (!selectedProspect || !quoteDraft) return;

    const summaryMarkdown = generateQuoteSummaryMarkdown(selectedProspect, quoteDraft);
    const nextQuote = {
      ...quoteDraft,
      summaryMarkdown,
      updatedAt: new Date().toISOString(),
    };
    setQuoteDraft(nextQuote);
    onUpdateProspect(selectedProspect, {
      quote: nextQuote,
      currentStage: "Paid Proposal Sent",
      outreachStatus: "Proposal Sent",
      estimatedMonthlyValue: Number.parseInt(
        String(nextQuote.monthlyPrice ?? "").replace(/[^\d]/g, ""),
        10
      ) || selectedProspect.estimatedMonthlyValue,
      estimatedAnnualValue: Number.parseInt(
        String(nextQuote.annualPrice ?? "").replace(/[^\d]/g, ""),
        10
      ) || selectedProspect.estimatedAnnualValue,
      nextAction: "Review quote summary and follow up on paid conversion manually.",
    });
  }

  function handleSaveQuote() {
    if (!selectedProspect || !quoteDraft) return;

    onUpdateProspect(selectedProspect, {
      quote: {
        ...quoteDraft,
        summaryMarkdown: quoteSummary,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Label>Selected prospect</Label>
            <Select
              value={selectedProspect.id}
              onValueChange={(value) => onSelectProspect(value)}
            >
              <SelectTrigger className="mt-2 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {prospects.map((prospect) => (
                    <SelectItem key={prospect.id} value={prospect.id}>
                      {prospect.companyName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <h3 className="mt-4 text-2xl font-bold text-slate-950">
              {selectedProspect.companyName}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Proposal and quote drafts use discovery data when available. Nothing
              is sent or submitted automatically.
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-bold text-orange-900">Commercial context</p>
            <p className="mt-2 text-sm text-orange-900">
              Pilot proposal: {selectedProspect.pilotProposal?.status ?? "Not generated"}
            </p>
            <p className="mt-1 text-sm text-orange-900">
              Quote: {selectedProspect.quote?.selectedPlan ?? "Not generated"}
            </p>
            {selectedProspect.onboardingChecklist?.length ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                <CheckCircle2Icon className="size-4" />
                Onboarding checklist created
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-5 text-orange-600" />
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Pilot Proposal Builder
              </p>
              <h4 className="text-lg font-bold text-slate-950">
                Scoped pilot draft
              </h4>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={proposalDraft.status}
                onValueChange={(value) =>
                  updateProposal("status", value as SalesPilotProposal["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {proposalStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Pricing path</Label>
              <Select
                value={proposalDraft.pricingPath}
                onValueChange={(value) =>
                  updateProposal(
                    "pricingPath",
                    value as SalesPilotProposal["pricingPath"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pricingPaths.map((path) => (
                      <SelectItem key={path} value={path}>
                        {path}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {[
              ["pilotObjective", "Pilot objective"],
              ["pilotScope", "Pilot scope"],
              ["vehiclesUsersIncluded", "Vehicles / users included"],
              ["modulesIncluded", "Modules / features included"],
              ["dataSourcesUsed", "Data sources used"],
              ["successMetrics", "Success metrics"],
              ["timeline", "Timeline"],
              ["risksAssumptions", "Risks and assumptions"],
              ["nextSteps", "Next steps"],
            ].map(([key, label]) => (
              <div className="flex flex-col gap-2 sm:col-span-2" key={key}>
                <Label>{label}</Label>
                <Textarea
                  rows={2}
                  value={String(proposalDraft[key as keyof SalesPilotProposal] ?? "")}
                  onChange={(event) =>
                    updateProposal(
                      key as keyof SalesPilotProposal,
                      event.target.value as SalesPilotProposal[keyof SalesPilotProposal]
                    )
                  }
                />
              </div>
            ))}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="review-date">Review date</Label>
              <Input
                id="review-date"
                type="date"
                value={proposalDraft.reviewDate ?? ""}
                onChange={(event) =>
                  updateProposal("reviewDate", event.target.value)
                }
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleSaveProposal}>
              <SaveIcon data-icon="inline-start" />
              Save proposal
            </Button>
            <Button
              className="bg-[#9d4300] text-white hover:bg-orange-600"
              onClick={handleGenerateProposal}
            >
              Generate proposal
            </Button>
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Proposal Preview
          </p>
          <pre className="mt-4 max-h-[760px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-white">
            {proposalMarkdown}
          </pre>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Quote Builder
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-950">
            Paid conversion summary
          </h4>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Selected plan</Label>
              <Select
                value={quoteDraft.selectedPlan}
                onValueChange={(value) => {
                  const plan = value as TruckFixrPlan;
                  updateQuote("selectedPlan", plan);
                  updateQuote("monthlyPrice", TRUCKFIXR_PRICING[plan].monthly);
                  updateQuote("annualPrice", TRUCKFIXR_PRICING[plan].annual);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {plans.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="quote-expiry">Quote expiry date</Label>
              <Input
                id="quote-expiry"
                type="date"
                value={quoteDraft.quoteExpiryDate ?? ""}
                onChange={(event) =>
                  updateQuote("quoteExpiryDate", event.target.value)
                }
              />
            </div>
            <Input
              placeholder="Powered vehicles"
              type="number"
              value={quoteDraft.poweredVehicles ?? ""}
              onChange={(event) =>
                updateQuote("poweredVehicles", numberOrUndefined(event.target.value))
              }
            />
            <Input
              placeholder="Trailers"
              type="number"
              value={quoteDraft.trailers ?? ""}
              onChange={(event) =>
                updateQuote("trailers", numberOrUndefined(event.target.value))
              }
            />
            <Input
              placeholder="Users"
              type="number"
              value={quoteDraft.users ?? ""}
              onChange={(event) =>
                updateQuote("users", numberOrUndefined(event.target.value))
              }
            />
            <Input
              placeholder="Pilot price"
              value={quoteDraft.pilotPrice ?? ""}
              onChange={(event) => updateQuote("pilotPrice", event.target.value)}
            />
            <Input
              placeholder="Monthly price"
              value={quoteDraft.monthlyPrice ?? ""}
              onChange={(event) => updateQuote("monthlyPrice", event.target.value)}
            />
            <Input
              placeholder="Annual price"
              value={quoteDraft.annualPrice ?? ""}
              onChange={(event) => updateQuote("annualPrice", event.target.value)}
            />
            <Input
              placeholder="Custom price"
              value={quoteDraft.customPrice ?? ""}
              onChange={(event) => updateQuote("customPrice", event.target.value)}
            />
            <Input
              placeholder="Discount"
              value={quoteDraft.discount ?? ""}
              onChange={(event) => updateQuote("discount", event.target.value)}
            />
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Discount reason</Label>
              <Textarea
                rows={2}
                value={quoteDraft.discountReason ?? ""}
                onChange={(event) =>
                  updateQuote("discountReason", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={quoteDraft.notes ?? ""}
                onChange={(event) => updateQuote("notes", event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleSaveQuote}>
              <SaveIcon data-icon="inline-start" />
              Save quote
            </Button>
            <Button
              className="bg-[#0d1e3d] text-white hover:bg-[#1a2f5a]"
              onClick={handleGenerateQuote}
            >
              Generate quote summary
            </Button>
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Quote Preview
          </p>
          <pre className="mt-4 max-h-[760px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-white">
            {quoteSummary}
          </pre>
        </article>
      </section>
    </div>
  );
}
