"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheckIcon, FileTextIcon, PlusIcon, SaveIcon } from "lucide-react";

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
  DEFAULT_SUCCESS_METRICS,
  defaultPilotHealth,
  generateInternalHandoffNote,
  generatePilotReviewReport,
  generatePilotSuccessPlan,
} from "@/lib/pilot-health";
import { createDefaultOnboardingChecklist } from "@/lib/sales-proposals";
import {
  type Prospect,
  type SalesOnboardingChecklistItem,
  type SalesPilotHealth,
} from "@/lib/types";

type OnboardingPilotHealthProps = {
  prospects: Prospect[];
  selectedProspectId: string | null;
  onSelectProspect: (id: string) => void;
  onUpdateProspect: (prospect: Prospect, updates: Partial<Prospect>) => void;
};

const healthStatuses: SalesPilotHealth["healthStatus"][] = [
  "Healthy",
  "Needs Attention",
  "At Risk",
  "Ready for Review",
  "Ready for Paid Conversion",
];

const readinessOptions = ["low", "medium", "high"] as const;

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function numberOrUndefined(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function OnboardingPilotHealth({
  prospects,
  selectedProspectId,
  onSelectProspect,
  onUpdateProspect,
}: OnboardingPilotHealthProps) {
  const selectedProspect = useMemo(() => {
    return (
      prospects.find((prospect) => prospect.id === selectedProspectId) ??
      prospects[0] ??
      null
    );
  }, [prospects, selectedProspectId]);
  const [checklist, setChecklist] = useState<SalesOnboardingChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [successPlan, setSuccessPlan] = useState("");
  const [handoffNote, setHandoffNote] = useState("");
  const [healthDraft, setHealthDraft] =
    useState<SalesPilotHealth>(defaultPilotHealth);
  const [reviewReport, setReviewReport] = useState("");

  useEffect(() => {
    if (!selectedProspect) return;

    setChecklist(
      selectedProspect.onboardingChecklist?.length
        ? selectedProspect.onboardingChecklist
        : createDefaultOnboardingChecklist()
    );
    setSuccessPlan(
      selectedProspect.pilotSuccessPlan ||
        generatePilotSuccessPlan(selectedProspect)
    );
    setHandoffNote(
      selectedProspect.internalHandoffNote ||
        generateInternalHandoffNote(selectedProspect)
    );
    setHealthDraft({
      ...defaultPilotHealth(),
      ...selectedProspect.pilotHealth,
    });
    setReviewReport(
      selectedProspect.pilotReviewReport ||
        generatePilotReviewReport(selectedProspect)
    );
    setNewChecklistItem("");
  }, [selectedProspect]);

  if (!selectedProspect) {
    return (
      <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-white p-5">
        <p className="font-bold text-slate-950">No prospect selected</p>
        <p className="mt-2 text-sm text-slate-600">
          Add or import a prospect before creating onboarding and pilot health records.
        </p>
      </div>
    );
  }

  const completedCount = checklist.filter((item) => item.completed).length;
  const completionPercent = checklist.length
    ? Math.round((completedCount / checklist.length) * 100)
    : 0;

  function updateHealth<K extends keyof SalesPilotHealth>(
    key: K,
    value: SalesPilotHealth[K]
  ) {
    setHealthDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleChecklistItem(id: string) {
    setChecklist((current) =>
      current.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  function updateChecklistItem(
    id: string,
    key: keyof SalesOnboardingChecklistItem,
    value: string
  ) {
    setChecklist((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  }

  function addChecklistItem() {
    if (!newChecklistItem.trim()) return;

    setChecklist((current) => [
      ...current,
      {
        id: createId("onboarding"),
        label: newChecklistItem.trim(),
        completed: false,
      },
    ]);
    setNewChecklistItem("");
  }

  function removeChecklistItem(id: string) {
    setChecklist((current) => current.filter((item) => item.id !== id));
  }

  function toggleSuccessMetric(metric: string) {
    setHealthDraft((current) => {
      const existing = current.successMetricsAchieved ?? [];
      const next = existing.includes(metric)
        ? existing.filter((item) => item !== metric)
        : [...existing, metric];

      return {
        ...current,
        successMetricsAchieved: next,
      };
    });
  }

  function saveOnboarding() {
    onUpdateProspect(selectedProspect, {
      onboardingChecklist: checklist,
      pilotSuccessPlan: successPlan,
      internalHandoffNote: handoffNote,
      currentStage:
        selectedProspect.currentStage === "Pilot Agreed"
          ? "Onboarding"
          : selectedProspect.currentStage,
      nextAction:
        completionPercent === 100
          ? "Activate pilot and begin weekly health tracking."
          : "Complete onboarding checklist before pilot activation.",
    });
  }

  function saveHealth() {
    onUpdateProspect(selectedProspect, {
      pilotHealth: healthDraft,
      currentStage:
        healthDraft.healthStatus === "Ready for Paid Conversion"
          ? "Pilot Review"
          : "Pilot Active",
      nextAction:
        healthDraft.healthStatus === "Ready for Paid Conversion"
          ? "Generate pilot review and prepare paid conversion follow-up."
          : "Continue pilot check-ins and capture usage/feedback.",
    });
  }

  function generateReport() {
    const nextReport = generatePilotReviewReport({
      ...selectedProspect,
      pilotHealth: healthDraft,
      pilotSuccessPlan: successPlan,
      internalHandoffNote: handoffNote,
      onboardingChecklist: checklist,
    });
    setReviewReport(nextReport);
    onUpdateProspect(selectedProspect, {
      pilotHealth: healthDraft,
      pilotSuccessPlan: successPlan,
      internalHandoffNote: handoffNote,
      onboardingChecklist: checklist,
      pilotReviewReport: nextReport,
      currentStage:
        healthDraft.healthStatus === "Ready for Paid Conversion"
          ? "Pilot Review"
          : selectedProspect.currentStage,
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
              Onboarding checklist, pilot success plan, health tracking, and review report.
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
            <p className="font-bold">Pilot readiness</p>
            <p className="mt-2 text-sm">
              Checklist complete: {completedCount}/{checklist.length} ({completionPercent}%)
            </p>
            <p className="mt-1 text-sm">
              Health status: {healthDraft.healthStatus}
            </p>
            <p className="mt-1 text-sm">
              Conversion readiness: {healthDraft.conversionReadiness}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex items-center gap-2">
            <ClipboardCheckIcon className="size-5 text-orange-600" />
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Onboarding Checklist
              </p>
              <h4 className="text-lg font-bold text-slate-950">
                Pilot activation tasks
              </h4>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {checklist.map((item) => (
              <div
                className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-[auto_1fr_0.8fr_0.8fr_auto]"
                key={item.id}
              >
                <input
                  checked={item.completed}
                  className="mt-3 size-4"
                  type="checkbox"
                  onChange={() => toggleChecklistItem(item.id)}
                />
                <Input
                  value={item.label}
                  onChange={(event) =>
                    updateChecklistItem(item.id, "label", event.target.value)
                  }
                />
                <Input
                  placeholder="Owner"
                  value={item.owner ?? ""}
                  onChange={(event) =>
                    updateChecklistItem(item.id, "owner", event.target.value)
                  }
                />
                <Input
                  placeholder="Notes"
                  value={item.notes ?? ""}
                  onChange={(event) =>
                    updateChecklistItem(item.id, "notes", event.target.value)
                  }
                />
                <Button variant="outline" onClick={() => removeChecklistItem(item.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Add checklist item"
              value={newChecklistItem}
              onChange={(event) => setNewChecklistItem(event.target.value)}
            />
            <Button variant="outline" onClick={addChecklistItem}>
              <PlusIcon data-icon="inline-start" />
              Add
            </Button>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>Pilot success plan</Label>
              <Textarea
                rows={12}
                value={successPlan}
                onChange={(event) => setSuccessPlan(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Internal handoff note</Label>
              <Textarea
                rows={10}
                value={handoffNote}
                onChange={(event) => setHandoffNote(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end border-t pt-4">
            <Button
              className="bg-[#9d4300] text-white hover:bg-orange-600"
              onClick={saveOnboarding}
            >
              <SaveIcon data-icon="inline-start" />
              Save onboarding
            </Button>
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Pilot Health
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-950">
            Usage, feedback, and conversion readiness
          </h4>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["vehiclesOnboarded", "Vehicles onboarded"],
              ["usersInvited", "Users invited"],
              ["inspectionsIssuesCaptured", "Inspections/issues captured"],
              ["diagnosticInteractions", "Diagnostic interactions"],
              ["maintenanceActionsCreated", "Maintenance actions created"],
            ].map(([key, label]) => (
              <div className="flex flex-col gap-2" key={key}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={healthDraft[key as keyof SalesPilotHealth] as number | undefined ?? ""}
                  onChange={(event) =>
                    updateHealth(
                      key as keyof SalesPilotHealth,
                      numberOrUndefined(event.target.value) as never
                    )
                  }
                />
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <Label>Last activity date</Label>
              <Input
                type="date"
                value={healthDraft.lastActivityDate ?? ""}
                onChange={(event) =>
                  updateHealth("lastActivityDate", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Health status</Label>
              <Select
                value={healthDraft.healthStatus}
                onValueChange={(value) =>
                  updateHealth(
                    "healthStatus",
                    value as SalesPilotHealth["healthStatus"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {healthStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Conversion readiness</Label>
              <Select
                value={healthDraft.conversionReadiness}
                onValueChange={(value) =>
                  updateHealth(
                    "conversionReadiness",
                    value as SalesPilotHealth["conversionReadiness"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {readinessOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Support-letter potential</Label>
              <Select
                value={healthDraft.supportLetterPotential}
                onValueChange={(value) =>
                  updateHealth(
                    "supportLetterPotential",
                    value as SalesPilotHealth["supportLetterPotential"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {readinessOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            {[
              ["driverFeedback", "Driver feedback"],
              ["fleetManagerFeedback", "Fleet manager feedback"],
              ["technicianFeedback", "Technician/maintenance feedback"],
              ["usabilityIssues", "Usability issues"],
              ["featureRequests", "Feature requests"],
              ["objectionsConcerns", "Objections/concerns"],
            ].map(([key, label]) => (
              <div className="flex flex-col gap-2" key={key}>
                <Label>{label}</Label>
                <Textarea
                  rows={2}
                  value={String(healthDraft[key as keyof SalesPilotHealth] ?? "")}
                  onChange={(event) =>
                    updateHealth(
                      key as keyof SalesPilotHealth,
                      event.target.value as never
                    )
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-bold text-slate-950">
              Success metrics achieved
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {DEFAULT_SUCCESS_METRICS.map((metric) => (
                <label
                  className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700"
                  key={metric}
                >
                  <input
                    checked={(healthDraft.successMetricsAchieved ?? []).includes(metric)}
                    className="size-4"
                    type="checkbox"
                    onChange={() => toggleSuccessMetric(metric)}
                  />
                  {metric}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={saveHealth}>
              <SaveIcon data-icon="inline-start" />
              Save health
            </Button>
            <Button
              className="bg-[#0d1e3d] text-white hover:bg-[#1a2f5a]"
              onClick={generateReport}
            >
              Generate review report
            </Button>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-[#e0c0b1] bg-white p-4">
        <div className="flex items-center gap-2">
          <FileTextIcon className="size-5 text-orange-600" />
          <div>
            <p className="text-xs font-bold uppercase text-[#584237]">
              Pilot Review Report
            </p>
            <h4 className="text-lg font-bold text-slate-950">
              Factual review draft
            </h4>
          </div>
        </div>
        <pre className="mt-4 max-h-[620px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-white">
          {reviewReport}
        </pre>
      </section>
    </div>
  );
}
