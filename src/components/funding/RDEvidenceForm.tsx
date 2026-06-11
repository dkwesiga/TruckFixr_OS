"use client";

import { useState } from "react";

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
import { type RDEvidence } from "@/lib/types";

export type RDEvidenceFormValues = Omit<
  RDEvidence,
  "id" | "createdDate" | "updatedDate"
>;

type Props = {
  evidence?: RDEvidence | null;
  onCancel: () => void;
  onSave: (values: RDEvidenceFormValues) => void;
};

const evidenceTypes = [
  "Customer Discovery",
  "Pilot Feedback",
  "Technical Experiment",
  "Product Improvement",
  "ELD/Telematics Requirement",
  "Sales Conversation",
  "Grant Requirement",
  "Budget Justification",
  "Support Letter",
  "Market Evidence",
  "Compliance Requirement",
] as const;

const yesNoUnknown = ["Yes", "No", "Unknown"] as const;
const confidenceLevels = ["Low", "Medium", "High"] as const;

function empty(): RDEvidenceFormValues {
  return {
    date: new Date().toISOString().slice(0, 10),
    evidenceType: "Customer Discovery",
    source: "",
    customerPartner: "",
    fleetSegment: "",
    problemObserved: "",
    technicalUncertainty: "",
    experimentTestConducted: "",
    resultLearning: "",
    commercializationEvidence: "",
    grantRelevance: "",
    supportLetterPotential: "Unknown",
    confidenceLevel: "Medium",
    nextAction: "",
    notes: "",
  };
}

function fromEvidence(e: RDEvidence): RDEvidenceFormValues {
  return {
    date: e.date,
    evidenceType: e.evidenceType,
    source: e.source ?? "",
    customerPartner: e.customerPartner ?? "",
    fleetSegment: e.fleetSegment ?? "",
    problemObserved: e.problemObserved ?? "",
    technicalUncertainty: e.technicalUncertainty ?? "",
    experimentTestConducted: e.experimentTestConducted ?? "",
    resultLearning: e.resultLearning ?? "",
    commercializationEvidence: e.commercializationEvidence ?? "",
    grantRelevance: e.grantRelevance ?? "",
    supportLetterPotential: e.supportLetterPotential,
    confidenceLevel: e.confidenceLevel,
    nextAction: e.nextAction ?? "",
    notes: e.notes ?? "",
    isDemo: e.isDemo,
  };
}

export function RDEvidenceForm({ evidence, onCancel, onSave }: Props) {
  const [values, setValues] = useState<RDEvidenceFormValues>(
    evidence ? fromEvidence(evidence) : empty()
  );

  function set<K extends keyof RDEvidenceFormValues>(
    key: K,
    value: RDEvidenceFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(values);
  }

  return (
    <form
      className="space-y-4 overflow-y-auto max-h-[70vh] pr-1"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="rd-date">Date *</Label>
          <Input
            id="rd-date"
            type="date"
            required
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Evidence type *</Label>
          <Select
            value={values.evidenceType}
            onValueChange={(v) =>
              set("evidenceType", v as RDEvidenceFormValues["evidenceType"])
            }
          >
            <SelectTrigger className="border-[#e0c0b1] bg-[#f7f9fb]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {evidenceTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Confidence level *</Label>
          <Select
            value={values.confidenceLevel}
            onValueChange={(v) =>
              set(
                "confidenceLevel",
                v as RDEvidenceFormValues["confidenceLevel"]
              )
            }
          >
            <SelectTrigger className="border-[#e0c0b1] bg-[#f7f9fb]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {confidenceLevels.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="rd-source">Source</Label>
          <Input
            id="rd-source"
            placeholder="Interview, call, survey…"
            value={values.source}
            onChange={(e) => set("source", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rd-customer">Customer / partner</Label>
          <Input
            id="rd-customer"
            value={values.customerPartner}
            onChange={(e) => set("customerPartner", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rd-fleetSegment">Fleet segment</Label>
          <Input
            id="rd-fleetSegment"
            placeholder="e.g. Ontario trucking 5-20 units"
            value={values.fleetSegment}
            onChange={(e) => set("fleetSegment", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rd-problem">Problem observed</Label>
        <Textarea
          id="rd-problem"
          rows={2}
          value={values.problemObserved}
          onChange={(e) => set("problemObserved", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rd-uncertainty">Technical uncertainty</Label>
        <Textarea
          id="rd-uncertainty"
          rows={2}
          value={values.technicalUncertainty}
          onChange={(e) => set("technicalUncertainty", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rd-experiment">Experiment / test conducted</Label>
        <Textarea
          id="rd-experiment"
          rows={2}
          value={values.experimentTestConducted}
          onChange={(e) => set("experimentTestConducted", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rd-result">Result / learning</Label>
        <Textarea
          id="rd-result"
          rows={2}
          value={values.resultLearning}
          onChange={(e) => set("resultLearning", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rd-commercialization">Commercialization evidence</Label>
        <Textarea
          id="rd-commercialization"
          rows={2}
          value={values.commercializationEvidence}
          onChange={(e) => set("commercializationEvidence", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rd-grantRelevance">Grant relevance</Label>
          <Textarea
            id="rd-grantRelevance"
            rows={2}
            value={values.grantRelevance}
            onChange={(e) => set("grantRelevance", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Support letter potential</Label>
          <Select
            value={values.supportLetterPotential}
            onValueChange={(v) =>
              set(
                "supportLetterPotential",
                v as RDEvidenceFormValues["supportLetterPotential"]
              )
            }
          >
            <SelectTrigger className="border-[#e0c0b1] bg-[#f7f9fb]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {yesNoUnknown.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rd-nextAction">Next action</Label>
        <Input
          id="rd-nextAction"
          value={values.nextAction}
          onChange={(e) => set("nextAction", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rd-notes">Notes</Label>
        <Textarea
          id="rd-notes"
          rows={2}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#9d4300] text-white hover:bg-orange-600"
        >
          {evidence ? "Save changes" : "Add evidence"}
        </Button>
      </div>
    </form>
  );
}
