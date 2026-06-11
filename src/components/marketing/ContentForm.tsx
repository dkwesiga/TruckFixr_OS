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
  type ContentAudience,
  type ContentItem,
  type ContentStatus,
  type ContentType,
} from "@/lib/types";

export type ContentFormValues = Omit<
  ContentItem,
  "id" | "createdDate" | "updatedDate" | "riskNotes"
>;

type ContentFormProps = {
  item?: ContentItem | null;
  onCancel: () => void;
  onSave: (values: ContentFormValues) => void;
};

const audiences: ContentAudience[] = [
  "Fleet Owner",
  "Owner-Operator",
  "Fleet Manager",
  "Repair Partner",
  "Grant/Funding Partner",
  "Investor",
  "Ecosystem Partner",
];

const contentTypes: ContentType[] = [
  "LinkedIn Founder Post",
  "Educational LinkedIn Post",
  "Pilot Learning Post",
  "Grant/R&D Credibility Post",
  "Prospect Nurturing Email",
  "Blog Outline",
  "Case Study Draft",
  "Event Announcement",
  "Investor Update Snippet",
  "Landing Page Copy Suggestion",
];

const contentStatuses: ContentStatus[] = [
  "Idea",
  "Drafted",
  "Approved",
  "Published",
  "Deferred",
];

const emptyValues: ContentFormValues = {
  topic: "",
  audience: "Fleet Owner",
  contentType: "LinkedIn Founder Post",
  cta: "Book a 20-minute discovery call",
  contextNotes: "",
  customerName: "",
  draftTitle: "",
  draftContent: "",
  suggestedHashtags: [],
  recommendedChannel: "LinkedIn",
  approvalNotes: "",
  contentStatus: "Idea",
  isDemo: false,
};

function toFormValues(item?: ContentItem | null): ContentFormValues {
  if (!item) {
    return emptyValues;
  }

  return {
    topic: item.topic,
    audience: item.audience,
    contentType: item.contentType,
    cta: item.cta ?? "",
    contextNotes: item.contextNotes ?? "",
    customerName: item.customerName ?? "",
    draftTitle: item.draftTitle ?? "",
    draftContent: item.draftContent ?? "",
    suggestedHashtags: item.suggestedHashtags ?? [],
    recommendedChannel: item.recommendedChannel ?? "",
    approvalNotes: item.approvalNotes ?? "",
    contentStatus: item.contentStatus,
    isDemo: item.isDemo ?? false,
  };
}

function normalizeOptional(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function ContentForm({ item, onCancel, onSave }: ContentFormProps) {
  const [values, setValues] = useState<ContentFormValues>(() =>
    toFormValues(item)
  );
  const [hashtagsInput, setHashtagsInput] = useState(
    (item?.suggestedHashtags ?? []).join(", ")
  );
  const [validationError, setValidationError] = useState("");

  function updateField<K extends keyof ContentFormValues>(
    key: K,
    value: ContentFormValues[K]
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function handleSave() {
    if (!values.topic.trim()) {
      setValidationError("Topic is required.");
      return;
    }

    const normalizedValues: ContentFormValues = {
      ...values,
      topic: values.topic.trim(),
      cta: normalizeOptional(values.cta),
      contextNotes: normalizeOptional(values.contextNotes),
      customerName: normalizeOptional(values.customerName),
      draftTitle: normalizeOptional(values.draftTitle),
      draftContent: normalizeOptional(values.draftContent),
      suggestedHashtags: hashtagsInput
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      recommendedChannel: normalizeOptional(values.recommendedChannel),
      approvalNotes: normalizeOptional(values.approvalNotes),
    };

    onSave(normalizedValues);
    toast.success(item ? "Content item updated." : "Content idea added.");
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
          <Label htmlFor="content-topic">Topic</Label>
          <Input
            id="content-topic"
            value={values.topic}
            onChange={(event) => updateField("topic", event.target.value)}
            placeholder="Why small fleets lose repair knowledge when drivers leave"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Audience</Label>
          <Select
            value={values.audience}
            onValueChange={(value) =>
              updateField("audience", value as ContentAudience)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {audiences.map((audience) => (
                  <SelectItem key={audience} value={audience}>
                    {audience}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Content type</Label>
          <Select
            value={values.contentType}
            onValueChange={(value) =>
              updateField("contentType", value as ContentType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {contentTypes.map((contentType) => (
                  <SelectItem key={contentType} value={contentType}>
                    {contentType}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="content-cta">CTA</Label>
          <Input
            id="content-cta"
            value={values.cta ?? ""}
            onChange={(event) => updateField("cta", event.target.value)}
            placeholder="Book a 20-minute discovery call"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Content status</Label>
          <Select
            value={values.contentStatus}
            onValueChange={(value) =>
              updateField("contentStatus", value as ContentStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {contentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="customer-name">Customer name (optional)</Label>
          <Input
            id="customer-name"
            value={values.customerName ?? ""}
            onChange={(event) =>
              updateField("customerName", event.target.value)
            }
            placeholder="Only add if approved for mention"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="recommended-channel">Recommended channel</Label>
          <Input
            id="recommended-channel"
            value={values.recommendedChannel ?? ""}
            onChange={(event) =>
              updateField("recommendedChannel", event.target.value)
            }
            placeholder="LinkedIn"
          />
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="context-notes">Context notes</Label>
          <Textarea
            id="context-notes"
            value={values.contextNotes ?? ""}
            onChange={(event) =>
              updateField("contextNotes", event.target.value)
            }
            rows={4}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="draft-title">Draft title</Label>
          <Input
            id="draft-title"
            value={values.draftTitle ?? ""}
            onChange={(event) =>
              updateField("draftTitle", event.target.value)
            }
            placeholder="LinkedIn Founder Post: Fleet repair knowledge"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="draft-content">Draft content</Label>
          <Textarea
            id="draft-content"
            value={values.draftContent ?? ""}
            onChange={(event) =>
              updateField("draftContent", event.target.value)
            }
            rows={12}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hashtags">Suggested hashtags</Label>
          <Input
            id="hashtags"
            value={hashtagsInput}
            onChange={(event) => setHashtagsInput(event.target.value)}
            placeholder="#TruckFixr, #FleetMaintenance, #OntarioFleets"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="approval-notes">Approval notes</Label>
          <Textarea
            id="approval-notes"
            value={values.approvalNotes ?? ""}
            onChange={(event) =>
              updateField("approvalNotes", event.target.value)
            }
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
          {item ? "Save Changes" : "Add Content Idea"}
        </Button>
      </div>
    </div>
  );
}
