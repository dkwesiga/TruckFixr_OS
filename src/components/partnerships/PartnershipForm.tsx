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
import { type Partnership } from "@/lib/types";

export type PartnershipFormValues = Omit<
  Partnership,
  "id" | "createdDate" | "updatedDate"
>;

type PartnershipFormProps = {
  partnership?: Partnership | null;
  onCancel: () => void;
  onSave: (values: PartnershipFormValues) => void;
};

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

const yesNoMaybeOptions: Array<"Yes" | "No" | "Maybe"> = [
  "Yes",
  "No",
  "Maybe",
];

const longTextFields: Array<{
  key: keyof PartnershipFormValues;
  label: string;
  rows: number;
}> = [
  { key: "nextAction", label: "Next action", rows: 3 },
  { key: "notes", label: "Notes", rows: 5 },
];

const emptyValues: PartnershipFormValues = {
  partnerName: "",
  website: "",
  partnerType: "Referral Partner",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactLinkedIn: "",
  location: "Ontario, Canada",
  relationshipStatus: "Identified",
  referralPotential: "Medium",
  coPilotPotential: "Maybe",
  integrationPotential: "Maybe",
  lastContactDate: "",
  nextAction: "",
  notes: "",
  isDemo: false,
};

function toFormValues(
  partnership?: Partnership | null
): PartnershipFormValues {
  if (!partnership) {
    return emptyValues;
  }

  return {
    partnerName: partnership.partnerName,
    website: partnership.website ?? "",
    partnerType: partnership.partnerType,
    contactName: partnership.contactName ?? "",
    contactEmail: partnership.contactEmail ?? "",
    contactPhone: partnership.contactPhone ?? "",
    contactLinkedIn: partnership.contactLinkedIn ?? "",
    location: partnership.location ?? "",
    relationshipStatus: partnership.relationshipStatus,
    referralPotential: partnership.referralPotential,
    coPilotPotential: partnership.coPilotPotential,
    integrationPotential: partnership.integrationPotential,
    lastContactDate: partnership.lastContactDate ?? "",
    nextAction: partnership.nextAction ?? "",
    notes: partnership.notes ?? "",
    isDemo: partnership.isDemo ?? false,
  };
}

function normalizeOptional(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function PartnershipForm({
  partnership,
  onCancel,
  onSave,
}: PartnershipFormProps) {
  const [values, setValues] = useState<PartnershipFormValues>(() =>
    toFormValues(partnership)
  );
  const [validationError, setValidationError] = useState("");

  function updateField<K extends keyof PartnershipFormValues>(
    key: K,
    value: PartnershipFormValues[K]
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function handleSave() {
    if (!values.partnerName.trim()) {
      setValidationError("Partner name is required.");
      return;
    }

    const normalizedValues: PartnershipFormValues = {
      ...values,
      partnerName: values.partnerName.trim(),
      website: normalizeOptional(values.website),
      contactName: normalizeOptional(values.contactName),
      contactEmail: normalizeOptional(values.contactEmail),
      contactPhone: normalizeOptional(values.contactPhone),
      contactLinkedIn: normalizeOptional(values.contactLinkedIn),
      location: normalizeOptional(values.location),
      lastContactDate: normalizeOptional(values.lastContactDate),
      nextAction: normalizeOptional(values.nextAction),
      notes: normalizeOptional(values.notes),
    };

    onSave(normalizedValues);
    toast.success(partnership ? "Partnership updated." : "Partnership added.");
  }

  return (
    <div className="flex max-h-[74vh] flex-col gap-5 overflow-y-auto pr-1">
      {validationError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {validationError}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="partner-name">Partner name</Label>
          <Input
            id="partner-name"
            placeholder="Ontario Parts Supplier A"
            value={values.partnerName}
            onChange={(event) => updateField("partnerName", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            placeholder="https://example.com"
            value={values.website}
            onChange={(event) => updateField("website", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Ontario, Canada"
            value={values.location}
            onChange={(event) => updateField("location", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Partner type</Label>
          <Select
            value={values.partnerType}
            onValueChange={(value) =>
              updateField("partnerType", value as Partnership["partnerType"])
            }
          >
            <SelectTrigger>
              <SelectValue />
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
        </div>
        <div className="flex flex-col gap-2">
          <Label>Relationship status</Label>
          <Select
            value={values.relationshipStatus}
            onValueChange={(value) =>
              updateField(
                "relationshipStatus",
                value as Partnership["relationshipStatus"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
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
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">Contact name</Label>
          <Input
            id="contact-name"
            value={values.contactName}
            onChange={(event) => updateField("contactName", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">Contact email</Label>
          <Input
            id="contact-email"
            type="email"
            value={values.contactEmail}
            onChange={(event) => updateField("contactEmail", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-phone">Contact phone</Label>
          <Input
            id="contact-phone"
            value={values.contactPhone}
            onChange={(event) => updateField("contactPhone", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-linkedin">Contact LinkedIn</Label>
          <Input
            id="contact-linkedin"
            value={values.contactLinkedIn}
            onChange={(event) =>
              updateField("contactLinkedIn", event.target.value)
            }
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label>Referral potential</Label>
          <Select
            value={values.referralPotential}
            onValueChange={(value) =>
              updateField(
                "referralPotential",
                value as Partnership["referralPotential"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
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
        <div className="flex flex-col gap-2">
          <Label>Co-pilot potential</Label>
          <Select
            value={values.coPilotPotential}
            onValueChange={(value) =>
              updateField(
                "coPilotPotential",
                value as Partnership["coPilotPotential"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {yesNoMaybeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Integration potential</Label>
          <Select
            value={values.integrationPotential}
            onValueChange={(value) =>
              updateField(
                "integrationPotential",
                value as Partnership["integrationPotential"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {yesNoMaybeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="last-contact-date">Last contact date</Label>
          <Input
            id="last-contact-date"
            type="date"
            value={values.lastContactDate}
            onChange={(event) =>
              updateField("lastContactDate", event.target.value)
            }
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
              value={(values[key] as string) ?? ""}
              onChange={(event) => updateField(key, event.target.value)}
            />
          </div>
        ))}
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
          {partnership ? "Save Changes" : "Add Partnership"}
        </Button>
      </div>
    </div>
  );
}
