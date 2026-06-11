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
import { type FundingOpportunity } from "@/lib/types";

export type FundingOpportunityFormValues = Omit<
  FundingOpportunity,
  "id" | "createdDate" | "updatedDate"
>;

type Props = {
  opportunity?: FundingOpportunity | null;
  onCancel: () => void;
  onSave: (values: FundingOpportunityFormValues) => void;
};

const fundingTypes = [
  "Grant",
  "Loan",
  "Wage Subsidy",
  "Accelerator",
  "Competition",
  "Investor",
  "R&D Support",
  "Hiring Grant",
  "Pilot Funding",
  "Other",
] as const;

const statuses = [
  "Researching",
  "Fit",
  "Applied",
  "Follow-up",
  "Not Fit",
  "Won",
  "Lost",
  "Deferred",
] as const;

const yesNoUnknown = ["Yes", "No", "Unknown"] as const;
const scoreOptions = ["1", "2", "3", "4", "5"] as const;

function empty(): FundingOpportunityFormValues {
  return {
    programName: "",
    funderOrganization: "",
    fundingType: "Grant",
    amountRange: "",
    deadline: "",
    eligibilitySummary: "",
    truckFixrFitScore: null,
    requiredPartner: "Unknown",
    customerSupportLetterNeeded: "Unknown",
    contactPerson: "",
    contactEmail: "",
    status: "Researching",
    nextAction: "",
    notes: "",
    sourceLink: "",
    grantReadiness: {},
  };
}

function fromOpportunity(o: FundingOpportunity): FundingOpportunityFormValues {
  return {
    programName: o.programName,
    funderOrganization: o.funderOrganization,
    fundingType: o.fundingType,
    amountRange: o.amountRange ?? "",
    deadline: o.deadline ?? "",
    eligibilitySummary: o.eligibilitySummary ?? "",
    truckFixrFitScore: o.truckFixrFitScore,
    requiredPartner: o.requiredPartner,
    customerSupportLetterNeeded: o.customerSupportLetterNeeded,
    contactPerson: o.contactPerson ?? "",
    contactEmail: o.contactEmail ?? "",
    status: o.status,
    nextAction: o.nextAction ?? "",
    notes: o.notes ?? "",
    sourceLink: o.sourceLink ?? "",
    grantReadiness: o.grantReadiness ?? {},
    isDemo: o.isDemo,
  };
}

export function FundingOpportunityForm({ opportunity, onCancel, onSave }: Props) {
  const [values, setValues] = useState<FundingOpportunityFormValues>(
    opportunity ? fromOpportunity(opportunity) : empty()
  );

  function set<K extends keyof FundingOpportunityFormValues>(
    key: K,
    value: FundingOpportunityFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(values);
  }

  return (
    <form className="space-y-4 overflow-y-auto max-h-[70vh] pr-1" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fo-programName">Program name *</Label>
          <Input
            id="fo-programName"
            required
            value={values.programName}
            onChange={(e) => set("programName", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fo-funderOrg">Funder organization *</Label>
          <Input
            id="fo-funderOrg"
            required
            value={values.funderOrganization}
            onChange={(e) => set("funderOrganization", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Funding type *</Label>
          <Select
            value={values.fundingType}
            onValueChange={(v) =>
              set("fundingType", v as FundingOpportunityFormValues["fundingType"])
            }
          >
            <SelectTrigger className="border-[#e0c0b1] bg-[#f7f9fb]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fundingTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status *</Label>
          <Select
            value={values.status}
            onValueChange={(v) =>
              set("status", v as FundingOpportunityFormValues["status"])
            }
          >
            <SelectTrigger className="border-[#e0c0b1] bg-[#f7f9fb]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Fit score</Label>
          <Select
            value={values.truckFixrFitScore?.toString() ?? ""}
            onValueChange={(v) =>
              set(
                "truckFixrFitScore",
                v ? (parseInt(v) as 1 | 2 | 3 | 4 | 5) : null
              )
            }
          >
            <SelectTrigger className="border-[#e0c0b1] bg-[#f7f9fb]">
              <SelectValue placeholder="Unscored" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {scoreOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}/5
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fo-amountRange">Amount range</Label>
          <Input
            id="fo-amountRange"
            placeholder="e.g. $50,000 – $500,000"
            value={values.amountRange}
            onChange={(e) => set("amountRange", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fo-deadline">Deadline</Label>
          <Input
            id="fo-deadline"
            type="date"
            value={values.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Required partner?</Label>
          <Select
            value={values.requiredPartner}
            onValueChange={(v) =>
              set(
                "requiredPartner",
                v as FundingOpportunityFormValues["requiredPartner"]
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
        <div className="space-y-1.5">
          <Label>Support letter needed?</Label>
          <Select
            value={values.customerSupportLetterNeeded}
            onValueChange={(v) =>
              set(
                "customerSupportLetterNeeded",
                v as FundingOpportunityFormValues["customerSupportLetterNeeded"]
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
        <div className="space-y-1.5">
          <Label htmlFor="fo-contactPerson">Contact person</Label>
          <Input
            id="fo-contactPerson"
            value={values.contactPerson}
            onChange={(e) => set("contactPerson", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fo-contactEmail">Contact email</Label>
          <Input
            id="fo-contactEmail"
            type="email"
            value={values.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fo-sourceLink">Source link</Label>
          <Input
            id="fo-sourceLink"
            type="url"
            placeholder="https://"
            value={values.sourceLink}
            onChange={(e) => set("sourceLink", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fo-eligibility">Eligibility summary</Label>
        <Textarea
          id="fo-eligibility"
          rows={3}
          value={values.eligibilitySummary}
          onChange={(e) => set("eligibilitySummary", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fo-nextAction">Next action</Label>
        <Input
          id="fo-nextAction"
          value={values.nextAction}
          onChange={(e) => set("nextAction", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fo-notes">Notes</Label>
        <Textarea
          id="fo-notes"
          rows={3}
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
          {opportunity ? "Save changes" : "Add opportunity"}
        </Button>
      </div>
    </form>
  );
}
