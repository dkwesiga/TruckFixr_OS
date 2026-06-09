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
import {
  type OutreachStatus,
  type Prospect,
} from "@/lib/types";

type Score = 1 | 2 | 3 | 4 | 5 | null;

export type ProspectFormValues = Omit<
  Prospect,
  "id" | "createdDate" | "updatedDate"
>;

type ProspectFormProps = {
  prospect?: Prospect | null;
  onCancel: () => void;
  onSave: (values: ProspectFormValues) => void;
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

const fleetSizes = ["2-5", "6-10", "11-20", "21-50", "50+"] as const;
const eldOptions = ["Yes", "No", "Unknown"] as const;
const scoreOptions = ["1", "2", "3", "4", "5"] as const;

const emptyValues: ProspectFormValues = {
  companyName: "",
  website: "",
  location: "",
  fleetType: undefined,
  estimatedFleetSize: undefined,
  decisionMaker: "",
  email: "",
  phone: "",
  linkedIn: "",
  maintenancePain: "",
  usesEldTelematics: "Unknown",
  pilotFitScore: null,
  revenueFitScore: null,
  grantFitScore: null,
  outreachStatus: "New",
  nextAction: "",
  lastContactDate: "",
  notes: "",
  firstEmailDraft: "",
  linkedInConnectDraft: "",
  linkedInFollowUpDraft: "",
  phoneScript: "",
  cta: "Book a 20-minute discovery call",
  isDemo: false,
};

function toFormValues(prospect?: Prospect | null): ProspectFormValues {
  if (!prospect) {
    return emptyValues;
  }

  return {
    companyName: prospect.companyName,
    website: prospect.website ?? "",
    location: prospect.location,
    fleetType: prospect.fleetType,
    estimatedFleetSize: prospect.estimatedFleetSize,
    decisionMaker: prospect.decisionMaker ?? "",
    email: prospect.email ?? "",
    phone: prospect.phone ?? "",
    linkedIn: prospect.linkedIn ?? "",
    maintenancePain: prospect.maintenancePain ?? "",
    usesEldTelematics: prospect.usesEldTelematics,
    pilotFitScore: prospect.pilotFitScore,
    revenueFitScore: prospect.revenueFitScore,
    grantFitScore: prospect.grantFitScore,
    outreachStatus: prospect.outreachStatus,
    nextAction: prospect.nextAction ?? "",
    lastContactDate: prospect.lastContactDate ?? "",
    notes: prospect.notes ?? "",
    firstEmailDraft: prospect.firstEmailDraft ?? "",
    linkedInConnectDraft: prospect.linkedInConnectDraft ?? "",
    linkedInFollowUpDraft: prospect.linkedInFollowUpDraft ?? "",
    phoneScript: prospect.phoneScript ?? "",
    cta: prospect.cta ?? "Book a 20-minute discovery call",
    isDemo: prospect.isDemo ?? false,
  };
}

function normalizeOptional(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function parseScore(value: string): Score {
  if (!value) {
    return null;
  }

  return Number(value) as Score;
}

function scoreToString(value: Score) {
  return value === null ? "" : String(value);
}

export function ProspectForm({
  prospect,
  onCancel,
  onSave,
}: ProspectFormProps) {
  const [values, setValues] = useState<ProspectFormValues>(() =>
    toFormValues(prospect)
  );
  const [validationError, setValidationError] = useState("");

  function updateField<K extends keyof ProspectFormValues>(
    key: K,
    value: ProspectFormValues[K]
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function handleSave() {
    if (!values.companyName.trim() || !values.location.trim()) {
      setValidationError("Company name and location are required.");
      return;
    }

    const normalizedValues: ProspectFormValues = {
      ...values,
      companyName: values.companyName.trim(),
      website: normalizeOptional(values.website),
      location: values.location.trim(),
      decisionMaker: normalizeOptional(values.decisionMaker),
      email: normalizeOptional(values.email),
      phone: normalizeOptional(values.phone),
      linkedIn: normalizeOptional(values.linkedIn),
      maintenancePain: normalizeOptional(values.maintenancePain),
      nextAction: normalizeOptional(values.nextAction),
      lastContactDate: normalizeOptional(values.lastContactDate),
      notes: normalizeOptional(values.notes),
      firstEmailDraft: normalizeOptional(values.firstEmailDraft),
      linkedInConnectDraft: normalizeOptional(values.linkedInConnectDraft),
      linkedInFollowUpDraft: normalizeOptional(values.linkedInFollowUpDraft),
      phoneScript: normalizeOptional(values.phoneScript),
      cta: normalizeOptional(values.cta),
    };

    onSave(normalizedValues);
    toast.success(prospect ? "Prospect updated." : "Prospect added.");
  }

  return (
    <div className="flex max-h-[72vh] flex-col gap-5 overflow-y-auto pr-1">
      {validationError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {validationError}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-name">Company name</Label>
          <Input
            id="company-name"
            value={values.companyName}
            onChange={(event) =>
              updateField("companyName", event.target.value)
            }
            placeholder="TruckFixr Fleet AI"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={values.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Ontario, Canada"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={values.website ?? ""}
            onChange={(event) => updateField("website", event.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Fleet type</Label>
          <Select
            value={values.fleetType ?? ""}
            onValueChange={(value) =>
              updateField(
                "fleetType",
                value as ProspectFormValues["fleetType"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fleet type" />
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
        </div>
        <div className="flex flex-col gap-2">
          <Label>Estimated fleet size</Label>
          <Select
            value={values.estimatedFleetSize ?? ""}
            onValueChange={(value) =>
              updateField(
                "estimatedFleetSize",
                value as ProspectFormValues["estimatedFleetSize"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fleet size" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fleetSizes.map((fleetSize) => (
                  <SelectItem key={fleetSize} value={fleetSize}>
                    {fleetSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="decision-maker">Decision maker name</Label>
          <Input
            id="decision-maker"
            value={values.decisionMaker ?? ""}
            onChange={(event) =>
              updateField("decisionMaker", event.target.value)
            }
            placeholder="Operations lead"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email ?? ""}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="ops@example.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={values.phone ?? ""}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="(555) 555-0123"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            value={values.linkedIn ?? ""}
            onChange={(event) => updateField("linkedIn", event.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label>ELD/telematics usage</Label>
          <Select
            value={values.usesEldTelematics}
            onValueChange={(value) =>
              updateField(
                "usesEldTelematics",
                value as ProspectFormValues["usesEldTelematics"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {eldOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {[
          ["pilotFitScore", "Pilot fit score"],
          ["revenueFitScore", "Revenue fit score"],
          ["grantFitScore", "Grant fit score"],
        ].map(([key, label]) => (
          <div className="flex flex-col gap-2" key={key}>
            <Label>{label}</Label>
            <Select
              value={scoreToString(values[key as keyof ProspectFormValues] as Score)}
              onValueChange={(value) =>
                updateField(key as keyof ProspectFormValues, parseScore(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
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
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Outreach status</Label>
          <Select
            value={values.outreachStatus}
            onValueChange={(value) =>
              updateField("outreachStatus", value as OutreachStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
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
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="next-action">Next action</Label>
          <Input
            id="next-action"
            value={values.nextAction ?? ""}
            onChange={(event) =>
              updateField("nextAction", event.target.value)
            }
            placeholder="Research decision maker"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="maintenance-pain">Maintenance pain/notes</Label>
          <Textarea
            id="maintenance-pain"
            value={values.maintenancePain ?? ""}
            onChange={(event) =>
              updateField("maintenancePain", event.target.value)
            }
            rows={4}
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={values.notes ?? ""}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
          />
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
          {prospect ? "Save Changes" : "Add Prospect"}
        </Button>
      </div>
    </div>
  );
}
