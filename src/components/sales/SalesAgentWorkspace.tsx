"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";

import { PilotProposalQuoteBuilder } from "@/components/sales/PilotProposalQuoteBuilder";
import { ProspectDetailWorkflow } from "@/components/sales/ProspectDetailWorkflow";
import { OnboardingPilotHealth } from "@/components/sales/OnboardingPilotHealth";
import { LostNurtureIntelligence } from "@/components/sales/LostNurtureIntelligence";
import { PartnersReferralsWorkflow } from "@/components/sales/PartnersReferralsWorkflow";
import { OutreachSequences } from "@/components/sales/OutreachSequences";
import { SalesFinalPolishPanel } from "@/components/sales/SalesFinalPolishPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildDailyActionQueue,
  calculateCommercialScores,
  generateWeeklySalesReview,
  getProspectStage,
  getRecommendedNextStep,
  SALES_PIPELINE_STAGES,
} from "@/lib/sales-workflow";
import { type Prospect, type SalesPipelineStage } from "@/lib/types";
import { cn } from "@/lib/utils";

type SalesAgentWorkspaceProps = {
  prospects: Prospect[];
  onSetStage: (prospect: Prospect, stage: SalesPipelineStage) => void;
  onUpdateProspect: (prospect: Prospect, updates: Partial<Prospect>) => void;
  onEditProspect: (prospect: Prospect | null, scoringMode?: boolean) => void;
  onExportWeeklyReview: (content: string) => void;
};

const tabItems = [
  ["command", "Command Center"],
  ["pipeline", "Pipeline"],
  ["detail", "Prospect Detail"],
  ["actions", "Daily Queue"],
  ["outreach", "Outreach"],
  ["discovery", "Discovery"],
  ["proposals", "Pilots"],
  ["health", "Health"],
  ["quotes", "Quotes"],
  ["lost", "Lost/Nurture"],
  ["partners", "Partners"],
  ["intelligence", "Intelligence"],
  ["handoffs", "Handoffs"],
  ["review", "Weekly Review"],
  ["settings", "Sales Settings"],
] as const;

const stageColors: Partial<Record<SalesPipelineStage, string>> = {
  "New Prospect": "border-slate-200 bg-slate-50 text-slate-700",
  Researching: "border-blue-200 bg-blue-50 text-blue-700",
  Qualified: "border-cyan-200 bg-cyan-50 text-cyan-700",
  "Outreach Drafted": "border-yellow-200 bg-yellow-50 text-yellow-800",
  "Outreach Sent": "border-orange-200 bg-orange-50 text-orange-700",
  "Follow-Up Due": "border-amber-200 bg-amber-50 text-amber-800",
  Replied: "border-teal-200 bg-teal-50 text-teal-700",
  "Discovery Booked": "border-green-200 bg-green-50 text-green-700",
  "Discovery Completed": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Pilot Proposed": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "Pilot Agreed": "border-violet-200 bg-violet-50 text-violet-700",
  Onboarding: "border-purple-200 bg-purple-50 text-purple-700",
  "Pilot Active": "border-lime-200 bg-lime-50 text-lime-700",
  "Pilot Review": "border-sky-200 bg-sky-50 text-sky-700",
  "Paid Proposal Sent": "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  Won: "border-green-300 bg-green-100 font-bold text-green-800",
  Nurture: "border-slate-200 bg-slate-100 text-slate-700",
  Lost: "border-red-200 bg-red-50 text-red-700",
};

function formatCurrency(value: number) {
  return `CAD $${value.toLocaleString("en-CA")}`;
}

function getStageCount(prospects: Prospect[], stage: SalesPipelineStage) {
  return prospects.filter((prospect) => getProspectStage(prospect) === stage).length;
}

function PipelineCard({
  prospect,
  onSetStage,
}: {
  prospect: Prospect;
  onSetStage: (prospect: Prospect, stage: SalesPipelineStage) => void;
}) {
  const currentStage = getProspectStage(prospect);
  const stageIndex = SALES_PIPELINE_STAGES.indexOf(currentStage);
  const nextStage = SALES_PIPELINE_STAGES[stageIndex + 1];
  const scores = calculateCommercialScores(prospect);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-950">{prospect.companyName}</p>
          <p className="mt-1 text-xs text-slate-500">{prospect.location}</p>
        </div>
        <span className="rounded bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">
          {prospect.commercialReadinessScore ?? scores.commercialReadinessScore}/5
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs text-slate-600">
        {prospect.nextAction || getRecommendedNextStep(prospect)}
      </p>
      {nextStage ? (
        <Button
          className="mt-3 w-full"
          size="sm"
          variant="outline"
          onClick={() => onSetStage(prospect, nextStage)}
        >
          Move to {nextStage}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      ) : null}
    </article>
  );
}

function PlaceholderPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-white p-5">
      <p className="text-base font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

export function SalesAgentWorkspace({
  prospects,
  onSetStage,
  onUpdateProspect,
  onEditProspect,
  onExportWeeklyReview,
}: SalesAgentWorkspaceProps) {
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(
    prospects[0]?.id ?? null
  );
  const actions = buildDailyActionQueue(prospects);
  const weeklyReview = generateWeeklySalesReview(prospects);
  const estimatedPilotValue = prospects.reduce(
    (sum, prospect) => sum + (prospect.estimatedPilotValue ?? 0),
    0
  );
  const estimatedAnnualValue = prospects.reduce(
    (sum, prospect) => sum + (prospect.estimatedAnnualValue ?? 0),
    0
  );
  const activePilots = getStageCount(prospects, "Pilot Active");
  const won = getStageCount(prospects, "Won");
  const stalled = prospects.filter((prospect) => prospect.stalled).length;
  const highReadiness = prospects.filter((prospect) => {
    const score =
      prospect.commercialReadinessScore ??
      calculateCommercialScores(prospect).commercialReadinessScore;
    return score >= 4;
  }).length;

  useEffect(() => {
    if (!prospects.length) {
      setSelectedProspectId(null);
      return;
    }

    if (!selectedProspectId || !prospects.some((p) => p.id === selectedProspectId)) {
      setSelectedProspectId(prospects[0].id);
    }
  }, [prospects, selectedProspectId]);

  return (
    <section className="rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#584237]">
            Full Sales Agent Workflow
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            Prospect to pilot to paid conversion
          </h2>
        </div>
        <Button
          className="bg-[#9d4300] text-white hover:bg-orange-600"
          onClick={() => onEditProspect(null)}
        >
          Add Prospect
        </Button>
      </div>

      <Tabs defaultValue="command" className="gap-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto min-w-max flex-wrap justify-start gap-2 bg-slate-100 p-2">
            {tabItems.map(([value, label]) => (
              <TabsTrigger className="h-11 px-3" key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="command">
          <div className="grid gap-4 lg:grid-cols-4">
            {[
              ["High readiness", highReadiness],
              ["Daily actions", actions.length],
              ["Active pilots", activePilots],
              ["Won", won],
            ].map(([label, value]) => (
              <article
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                key={label}
              >
                <p className="text-xs font-bold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {value}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4 lg:col-span-2">
              <p className="font-bold text-slate-950">Next recommended action</p>
              {actions[0] ? (
                <div className="mt-3 rounded-lg bg-orange-50 p-4 text-sm text-orange-900">
                  <p className="font-bold">{actions[0].title}</p>
                  <p className="mt-1">
                    {actions[0].companyName} - {actions[0].reason}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  No open rule-based sales actions. Add prospects or update stages
                  to generate the queue.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-bold text-slate-950">Pipeline value</p>
              <p className="mt-3 text-sm text-slate-600">
                Pilot value: <strong>{formatCurrency(estimatedPilotValue)}</strong>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Annual value: <strong>{formatCurrency(estimatedAnnualValue)}</strong>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Stalled: <strong>{stalled}</strong>
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <div className="overflow-x-auto">
            <div className="grid min-w-[1200px] grid-cols-6 gap-3 xl:grid-cols-9">
              {SALES_PIPELINE_STAGES.map((stage) => (
                <div
                  className={cn(
                    "rounded-xl border p-3",
                    stageColors[stage] ?? "border-slate-200 bg-slate-50"
                  )}
                  key={stage}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-bold">{stage}</p>
                    <span className="rounded bg-white/70 px-2 py-0.5 text-xs font-bold">
                      {getStageCount(prospects, stage)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {prospects
                      .filter((prospect) => getProspectStage(prospect) === stage)
                      .slice(0, 4)
                      .map((prospect) => (
                        <PipelineCard
                          key={prospect.id}
                          prospect={prospect}
                          onSetStage={onSetStage}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="detail">
          <ProspectDetailWorkflow
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onEditProspect={onEditProspect}
            onSelectProspect={setSelectedProspectId}
            onSetStage={onSetStage}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="actions">
          <div className="space-y-3">
            {actions.slice(0, 10).map((action) => (
              <article
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
                key={action.id}
              >
                <div>
                  <p className="font-bold text-slate-950">{action.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {action.companyName} - {action.reason}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                    {action.priority}
                  </span>
                  <span className="rounded bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">
                    {action.recommendedChannel}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Due {action.dueDate ?? "not set"}
                  </span>
                </div>
              </article>
            ))}
            {actions.length === 0 ? (
              <PlaceholderPanel
                title="Daily queue is empty"
                body="Move prospects through stages or add next action dates to create rule-based recommendations."
              />
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="outreach">
          <OutreachSequences
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onSelectProspect={setSelectedProspectId}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="discovery">
          <ProspectDetailWorkflow
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onEditProspect={onEditProspect}
            onSelectProspect={setSelectedProspectId}
            onSetStage={onSetStage}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="proposals">
          <PilotProposalQuoteBuilder
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onSelectProspect={setSelectedProspectId}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="health">
          <OnboardingPilotHealth
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onSelectProspect={setSelectedProspectId}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="quotes">
          <PilotProposalQuoteBuilder
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onSelectProspect={setSelectedProspectId}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="lost">
          <LostNurtureIntelligence
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onSelectProspect={setSelectedProspectId}
            onSetStage={onSetStage}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="partners">
          <PartnersReferralsWorkflow
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onSelectProspect={setSelectedProspectId}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="intelligence">
          <LostNurtureIntelligence
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onSelectProspect={setSelectedProspectId}
            onSetStage={onSetStage}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="handoffs">
          <SalesFinalPolishPanel
            prospects={prospects}
            selectedProspectId={selectedProspectId}
            onSelectProspect={setSelectedProspectId}
            onUpdateProspect={onUpdateProspect}
          />
        </TabsContent>

        <TabsContent value="review">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-950">Weekly Sales Review</p>
                <p className="text-sm text-slate-600">
                  Rule-based review generated from current prospect records.
                </p>
              </div>
              <Button variant="outline" onClick={() => onExportWeeklyReview(weeklyReview)}>
                Export Markdown
              </Button>
            </div>
            <pre className="mt-4 max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-white">
              {weeklyReview}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <PlaceholderPanel
            title="Sales Settings"
            body="Phase 1 keeps settings in the shared Settings module. Future sales settings can cover stage defaults, scoring weights, sequence timing, and compliance thresholds."
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
