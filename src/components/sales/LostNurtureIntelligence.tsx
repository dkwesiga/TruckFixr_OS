"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileTextIcon,
  LightbulbIcon,
  PlusIcon,
  SaveIcon,
  SendToBackIcon,
} from "lucide-react";

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
  countObjections,
  createIntelligenceRecord,
  generateHandoffPrompts,
  generateLossNurtureSummary,
  getRecommendedObjectionResponse,
  LOSS_REASONS,
  OBJECTION_CATEGORIES,
} from "@/lib/sales-intelligence";
import {
  type Prospect,
  type SalesHandoff,
  type SalesIntelligenceRecord,
  type SalesLossNurtureRecord,
  type SalesPipelineStage,
} from "@/lib/types";

type LostNurtureIntelligenceProps = {
  prospects: Prospect[];
  selectedProspectId: string | null;
  onSelectProspect: (id: string) => void;
  onSetStage: (prospect: Prospect, stage: SalesPipelineStage) => void;
  onUpdateProspect: (prospect: Prospect, updates: Partial<Prospect>) => void;
};

const emptyLossNurture: SalesLossNurtureRecord = {
  reason: "",
  mainObjection: "",
  currentSolution: "",
  competitor: "",
  priceConcern: "",
  timingIssue: "",
  missingFeature: "",
  decisionBlocker: "",
  futureTrigger: "",
  nextCheckInDate: "",
  recommendedNurtureSequence: "",
};

const emptyIntelligenceDraft: Omit<SalesIntelligenceRecord, "id" | "createdAt"> =
  {
    objectionType: "",
    objectionDetail: "",
    recommendedResponse: "",
    competitorOrAlternative: "",
    missingFeature: "",
    roadmapImplication: "",
    pricingConcern: "",
    integrationRequirement: "",
    proofRequirement: "",
  };

const nurtureSequences = [
  "Proof/case study nurture",
  "ELD integration nurture",
  "Timing check-in nurture",
  "Small fleet education nurture",
  "Price/value nurture",
  "Product gap follow-up",
] as const;

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function LostNurtureIntelligence({
  prospects,
  selectedProspectId,
  onSelectProspect,
  onSetStage,
  onUpdateProspect,
}: LostNurtureIntelligenceProps) {
  const selectedProspect = useMemo(() => {
    return (
      prospects.find((prospect) => prospect.id === selectedProspectId) ??
      prospects[0] ??
      null
    );
  }, [prospects, selectedProspectId]);
  const [lossDraft, setLossDraft] =
    useState<SalesLossNurtureRecord>(emptyLossNurture);
  const [intelligenceDraft, setIntelligenceDraft] = useState(
    emptyIntelligenceDraft
  );
  const [summary, setSummary] = useState("");
  const objectionCounts = useMemo(() => countObjections(prospects), [prospects]);

  useEffect(() => {
    if (!selectedProspect) return;

    setLossDraft({
      ...emptyLossNurture,
      ...selectedProspect.lossNurture,
    });
    setIntelligenceDraft(emptyIntelligenceDraft);
    setSummary(
      selectedProspect.lossNurture
        ? generateLossNurtureSummary(selectedProspect, selectedProspect.lossNurture)
        : ""
    );
  }, [selectedProspect]);

  if (!selectedProspect) {
    return (
      <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-white p-5">
        <p className="font-bold text-slate-950">No prospect selected</p>
        <p className="mt-2 text-sm text-slate-600">
          Add or import a prospect before creating lost/nurture intelligence.
        </p>
      </div>
    );
  }

  function updateLoss<K extends keyof SalesLossNurtureRecord>(
    key: K,
    value: SalesLossNurtureRecord[K]
  ) {
    setLossDraft((current) => ({ ...current, [key]: value }));
  }

  function updateIntelligence<K extends keyof typeof intelligenceDraft>(
    key: K,
    value: (typeof intelligenceDraft)[K]
  ) {
    setIntelligenceDraft((current) => ({ ...current, [key]: value }));
  }

  function normalizedLossRecord(): SalesLossNurtureRecord {
    return {
      reason: normalizeOptional(lossDraft.reason),
      mainObjection: normalizeOptional(lossDraft.mainObjection),
      currentSolution: normalizeOptional(lossDraft.currentSolution),
      competitor: normalizeOptional(lossDraft.competitor),
      priceConcern: normalizeOptional(lossDraft.priceConcern),
      timingIssue: normalizeOptional(lossDraft.timingIssue),
      missingFeature: normalizeOptional(lossDraft.missingFeature),
      decisionBlocker: normalizeOptional(lossDraft.decisionBlocker),
      futureTrigger: normalizeOptional(lossDraft.futureTrigger),
      nextCheckInDate: normalizeOptional(lossDraft.nextCheckInDate),
      recommendedNurtureSequence: normalizeOptional(
        lossDraft.recommendedNurtureSequence
      ),
    };
  }

  function saveLossNurture(stage: SalesPipelineStage) {
    const record = normalizedLossRecord();
    const nextSummary = generateLossNurtureSummary(selectedProspect, record);
    setSummary(nextSummary);
    onUpdateProspect(selectedProspect, {
      lossNurture: record,
      nextAction:
        stage === "Nurture"
          ? "Follow nurture sequence and check back on the future trigger."
          : "Review loss reason and create learning handoffs.",
    });
    onSetStage(selectedProspect, stage);
  }

  function addIntelligenceRecord() {
    const record = createIntelligenceRecord({
      objectionType: normalizeOptional(intelligenceDraft.objectionType),
      objectionDetail: normalizeOptional(intelligenceDraft.objectionDetail),
      recommendedResponse:
        normalizeOptional(intelligenceDraft.recommendedResponse) ??
        getRecommendedObjectionResponse(intelligenceDraft.objectionType),
      competitorOrAlternative: normalizeOptional(
        intelligenceDraft.competitorOrAlternative
      ),
      missingFeature: normalizeOptional(intelligenceDraft.missingFeature),
      roadmapImplication: normalizeOptional(intelligenceDraft.roadmapImplication),
      pricingConcern: normalizeOptional(intelligenceDraft.pricingConcern),
      integrationRequirement: normalizeOptional(
        intelligenceDraft.integrationRequirement
      ),
      proofRequirement: normalizeOptional(intelligenceDraft.proofRequirement),
    });

    onUpdateProspect(selectedProspect, {
      intelligenceRecords: [record, ...(selectedProspect.intelligenceRecords ?? [])],
    });
    setIntelligenceDraft(emptyIntelligenceDraft);
  }

  function generateHandoffs() {
    const handoffs = generateHandoffPrompts(
      selectedProspect,
      normalizedLossRecord()
    );
    onUpdateProspect(selectedProspect, {
      lossNurture: normalizedLossRecord(),
      handoffs: [...handoffs, ...(selectedProspect.handoffs ?? [])],
    });
  }

  function updateHandoffStatus(id: string, status: SalesHandoff["status"]) {
    onUpdateProspect(selectedProspect, {
      handoffs: (selectedProspect.handoffs ?? []).map((handoff) =>
        handoff.id === id
          ? { ...handoff, status, updatedAt: new Date().toISOString() }
          : handoff
      ),
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
            <p className="mt-2 text-sm text-slate-600">
              Capture why an opportunity is lost or nurtured, then turn the
              learning into useful handoffs.
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
            <p className="font-bold">Common objections</p>
            {objectionCounts.length ? (
              <div className="mt-3 space-y-2">
                {objectionCounts.slice(0, 5).map((item) => (
                  <div
                    className="flex items-center justify-between gap-3 text-sm"
                    key={item.label}
                  >
                    <span>{item.label}</span>
                    <span className="rounded bg-white px-2 py-0.5 font-bold">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm">No objection records yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Lost / Nurture Workflow
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-950">
            Structured decision record
          </h4>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Loss/nurture reason</Label>
              <Select
                value={lossDraft.reason}
                onValueChange={(value) => updateLoss("reason", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {LOSS_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Main objection</Label>
              <Select
                value={lossDraft.mainObjection}
                onValueChange={(value) => updateLoss("mainObjection", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select objection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {OBJECTION_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {[
              ["currentSolution", "Current solution / workaround"],
              ["competitor", "Competitor, if known"],
              ["priceConcern", "Price concern"],
              ["timingIssue", "Timing issue"],
              ["missingFeature", "Missing feature"],
              ["decisionBlocker", "Decision blocker"],
              ["futureTrigger", "Future trigger"],
            ].map(([key, label]) => (
              <div className="flex flex-col gap-2" key={key}>
                <Label>{label}</Label>
                <Input
                  value={String(lossDraft[key as keyof SalesLossNurtureRecord] ?? "")}
                  onChange={(event) =>
                    updateLoss(
                      key as keyof SalesLossNurtureRecord,
                      event.target.value
                    )
                  }
                />
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <Label>Next check-in date</Label>
              <Input
                type="date"
                value={lossDraft.nextCheckInDate ?? ""}
                onChange={(event) =>
                  updateLoss("nextCheckInDate", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Recommended nurture sequence</Label>
              <Select
                value={lossDraft.recommendedNurtureSequence}
                onValueChange={(value) =>
                  updateLoss("recommendedNurtureSequence", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sequence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {nurtureSequences.map((sequence) => (
                      <SelectItem key={sequence} value={sequence}>
                        {sequence}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => saveLossNurture("Lost")}>
              Mark Lost
            </Button>
            <Button
              className="bg-[#9d4300] text-white hover:bg-orange-600"
              onClick={() => saveLossNurture("Nurture")}
            >
              <SaveIcon data-icon="inline-start" />
              Save as Nurture
            </Button>
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex items-center gap-2">
            <LightbulbIcon className="size-5 text-orange-600" />
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Sales Intelligence
              </p>
              <h4 className="text-lg font-bold text-slate-950">
                Objection record
              </h4>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>Objection type</Label>
              <Select
                value={intelligenceDraft.objectionType}
                onValueChange={(value) => {
                  updateIntelligence("objectionType", value);
                  updateIntelligence(
                    "recommendedResponse",
                    getRecommendedObjectionResponse(value)
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select objection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {OBJECTION_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {[
              ["objectionDetail", "Objection detail"],
              ["recommendedResponse", "Recommended response"],
              ["competitorOrAlternative", "Competitor or alternative solution"],
              ["missingFeature", "Missing feature"],
              ["roadmapImplication", "Roadmap implication"],
              ["pricingConcern", "Pricing concern"],
              ["integrationRequirement", "Integration requirement"],
              ["proofRequirement", "Proof/case-study requirement"],
            ].map(([key, label]) => (
              <div className="flex flex-col gap-2" key={key}>
                <Label>{label}</Label>
                <Textarea
                  rows={2}
                  value={String(intelligenceDraft[key as keyof typeof intelligenceDraft] ?? "")}
                  onChange={(event) =>
                    updateIntelligence(
                      key as keyof typeof intelligenceDraft,
                      event.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end border-t pt-4">
            <Button
              className="bg-[#0d1e3d] text-white hover:bg-[#1a2f5a]"
              onClick={addIntelligenceRecord}
            >
              <PlusIcon data-icon="inline-start" />
              Add objection record
            </Button>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Cross-Agent Handoff Prompts
              </p>
              <h4 className="mt-1 text-lg font-bold text-slate-950">
                Marketing, R&D, Engineering, Roadmap
              </h4>
            </div>
            <Button variant="outline" onClick={generateHandoffs}>
              <SendToBackIcon data-icon="inline-start" />
              Generate handoffs
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {(selectedProspect.handoffs ?? []).length ? (
              (selectedProspect.handoffs ?? []).map((handoff) => (
                <article
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  key={handoff.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-950">
                        {handoff.target}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {handoff.outputType} - {handoff.status}
                      </p>
                    </div>
                    <Select
                      value={handoff.status}
                      onValueChange={(value) =>
                        updateHandoffStatus(
                          handoff.id,
                          value as SalesHandoff["status"]
                        )
                      }
                    >
                      <SelectTrigger className="w-[160px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {[
                            "Draft",
                            "Reviewed",
                            "Accepted",
                            "Completed",
                            "Rejected",
                          ].map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-3 text-xs leading-5 text-white">
                    {handoff.notes}
                  </pre>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                No handoff prompts yet. Save a loss/nurture record or objection,
                then generate handoffs.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-5 text-orange-600" />
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Summary Preview
              </p>
              <h4 className="text-lg font-bold text-slate-950">
                Loss / nurture learning
              </h4>
            </div>
          </div>
          <pre className="mt-4 max-h-[700px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-xs leading-5 text-white">
            {summary ||
              "Save a lost or nurture record to generate a structured summary."}
          </pre>
        </article>
      </section>
    </div>
  );
}
