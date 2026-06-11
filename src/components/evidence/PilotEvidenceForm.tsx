"use client";

import { useState } from "react";
import { toast } from "sonner";

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
import { type PilotEvidence } from "@/lib/types";

export type PilotEvidenceFormValues = Omit<
  PilotEvidence,
  "id" | "createdDate" | "updatedDate"
>;

type Props = {
  evidence?: PilotEvidence | null;
  onCancel: () => void;
  onSave: (values: PilotEvidenceFormValues) => void;
};

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

const yesNoMaybe: Array<"Yes" | "No" | "Maybe"> = ["Yes", "No", "Maybe"];

const longTextFields: Array<{
  key: keyof PilotEvidenceFormValues;
  label: string;
  rows: number;
}> = [
  { key: "problemStatement", label: "Problem statement", rows: 3 },
  { key: "solutionDeployed", label: "Solution deployed", rows: 3 },
  { key: "outcomesObserved", label: "Outcomes observed", rows: 4 },
  { key: "technicalLearnings", label: "Technical learnings", rows: 4 },
  { key: "productFeedback", label: "Product feedback", rows: 3 },
  { key: "expansionPotential", label: "Expansion potential", rows: 3 },
  { key: "revenueImpact", label: "Revenue impact", rows: 3 },
  { key: "nextAction", label: "Next action", rows: 2 },
  { key: "notes", label: "Notes", rows: 3 },
];

function empty(): PilotEvidenceFormValues {
  return {
    pilotName: "",
    fleetType: "",
    fleetSize: "",
    pilotType: "Discovery Pilot",
    pilotStatus: "Active",
    startDate: "",
    endDate: "",
    primaryContact: "",
    problemStatement: "",
    solutionDeployed: "",
    outcomesObserved: "",
    technicalLearnings: "",
    productFeedback: "",
    expansionPotential: "",
    revenueImpact: "",
    grantEvidenceValue: "Medium",
    supportLetterPotential: "Maybe",
    caseStudyPotential: "Maybe",
    nextAction: "",
    notes: "",
    isDemo: false,
  };
}

function fromEvidence(item: PilotEvidence): PilotEvidenceFormValues {
  return {
    pilotName: item.pilotName,
    fleetType: item.fleetType ?? "",
    fleetSize: item.fleetSize ?? "",
    pilotType: item.pilotType,
    pilotStatus: item.pilotStatus,
    startDate: item.startDate ?? "",
    endDate: item.endDate ?? "",
    primaryContact: item.primaryContact ?? "",
    problemStatement: item.problemStatement ?? "",
    solutionDeployed: item.solutionDeployed ?? "",
    outcomesObserved: item.outcomesObserved ?? "",
    technicalLearnings: item.technicalLearnings ?? "",
    productFeedback: item.productFeedback ?? "",
    expansionPotential: item.expansionPotential ?? "",
    revenueImpact: item.revenueImpact ?? "",
    grantEvidenceValue: item.grantEvidenceValue,
    supportLetterPotential: item.supportLetterPotential,
    caseStudyPotential: item.caseStudyPotential,
    nextAction: item.nextAction ?? "",
    notes: item.notes ?? "",
    isDemo: item.isDemo ?? false,
  };
}

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function PilotEvidenceForm({ evidence, onCancel, onSave }: Props) {
  const [values, setValues] = useState<PilotEvidenceFormValues>(
    evidence ? fromEvidence(evidence) : empty()
  );
  const [error, setError] = useState("");

  function set<K extends keyof PilotEvidenceFormValues>(
    key: K,
    value: PilotEvidenceFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!values.pilotName.trim()) {
      setError("Pilot name is required.");
      return;
    }

    const normalized: PilotEvidenceFormValues = {
      ...values,
      pilotName: values.pilotName.trim(),
      fleetType: normalizeOptional(values.fleetType),
      fleetSize: normalizeOptional(values.fleetSize),
      startDate: normalizeOptional(values.startDate),
      endDate: normalizeOptional(values.endDate),
      primaryContact: normalizeOptional(values.primaryContact),
      problemStatement: normalizeOptional(values.problemStatement),
      solutionDeployed: normalizeOptional(values.solutionDeployed),
      outcomesObserved: normalizeOptional(values.outcomesObserved),
      technicalLearnings: normalizeOptional(values.technicalLearnings),
      productFeedback: normalizeOptional(values.productFeedback),
      expansionPotential: normalizeOptional(values.expansionPotential),
      revenueImpact: normalizeOptional(values.revenueImpact),
      nextAction: normalizeOptional(values.nextAction),
      notes: normalizeOptional(values.notes),
    };

    onSave(normalized);
    toast.success(evidence ? "Pilot evidence updated." : "Pilot evidence added.");
  }

  return (
    <div className="flex max-h-[74vh] flex-col gap-5 overflow-y-auto pr-1">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pilot-name">Pilot name</Label>
          <Input
            id="pilot-name"
            value={values.pilotName}
            onChange={(event) => set("pilotName", event.target.value)}
            placeholder="Fleet Partner A"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Pilot type</Label>
          <Select
            value={values.pilotType}
            onValueChange={(value) =>
              set("pilotType", value as PilotEvidence["pilotType"])
            }
          >
            <SelectTrigger>
              <SelectValue />
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
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fleet-type">Fleet type</Label>
          <Input
            id="fleet-type"
            value={values.fleetType ?? ""}
            onChange={(event) => set("fleetType", event.target.value)}
            placeholder="Trucking"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fleet-size">Fleet size</Label>
          <Input
            id="fleet-size"
            value={values.fleetSize ?? ""}
            onChange={(event) => set("fleetSize", event.target.value)}
            placeholder="10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Pilot status</Label>
          <Select
            value={values.pilotStatus}
            onValueChange={(value) =>
              set("pilotStatus", value as PilotEvidence["pilotStatus"])
            }
          >
            <SelectTrigger>
              <SelectValue />
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
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="primary-contact">Primary contact</Label>
          <Input
            id="primary-contact"
            value={values.primaryContact ?? ""}
            onChange={(event) => set("primaryContact", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="start-date">Start date</Label>
          <Input
            id="start-date"
            type="date"
            value={values.startDate ?? ""}
            onChange={(event) => set("startDate", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="end-date">End date</Label>
          <Input
            id="end-date"
            type="date"
            value={values.endDate ?? ""}
            onChange={(event) => set("endDate", event.target.value)}
          />
        </div>
      </section>

      <section className="grid gap-4">
        {longTextFields.map(({ key, label, rows }) => (
          <div className="flex flex-col gap-2" key={key}>
            <Label htmlFor={key}>{label}</Label>
            <Textarea
              id={key}
              rows={rows}
              value={(values[key as keyof PilotEvidenceFormValues] as string) ?? ""}
              onChange={(event) =>
                set(
                  key as keyof PilotEvidenceFormValues,
                  event.target.value
                )
              }
            />
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label>Grant evidence value</Label>
          <Select
            value={values.grantEvidenceValue}
            onValueChange={(value) =>
              set(
                "grantEvidenceValue",
                value as PilotEvidence["grantEvidenceValue"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
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
        <div className="flex flex-col gap-2">
          <Label>Support letter potential</Label>
          <Select
            value={values.supportLetterPotential}
            onValueChange={(value) =>
              set(
                "supportLetterPotential",
                value as PilotEvidence["supportLetterPotential"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {yesNoMaybe.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Case study potential</Label>
          <Select
            value={values.caseStudyPotential}
            onValueChange={(value) =>
              set(
                "caseStudyPotential",
                value as PilotEvidence["caseStudyPotential"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {yesNoMaybe.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="bg-[#9d4300] text-white hover:bg-orange-600"
          type="button"
          onClick={handleSave}
        >
          {evidence ? "Save Changes" : "Add Pilot Evidence"}
        </Button>
      </div>
    </div>
  );
}
