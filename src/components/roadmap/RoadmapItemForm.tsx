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
import { type RoadmapItem, type WorkstreamPriority } from "@/lib/types";

export type RoadmapItemFormValues = Omit<
  RoadmapItem,
  "id" | "createdDate" | "updatedDate"
>;

type RoadmapItemFormProps = {
  item?: RoadmapItem | null;
  onCancel: () => void;
  onSave: (values: RoadmapItemFormValues) => void;
};

const modules: RoadmapItem["module"][] = [
  "Sales",
  "Marketing",
  "Engineering",
  "Funding/R&D",
  "Dashboard",
  "Settings",
  "Integrations",
  "Pilot Evidence",
  "Partnerships",
];

const phases: RoadmapItem["phase"][] = [
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Phase 4",
  "Future",
];

const roadmapTypes: RoadmapItem["type"][] = [
  "Feature",
  "Bug",
  "Improvement",
  "Integration",
  "Security",
  "UX",
  "Data",
  "Automation",
];

const priorities: WorkstreamPriority[] = ["Low", "Medium", "High", "Critical"];

const statuses: RoadmapItem["status"][] = [
  "Planned",
  "In Progress",
  "Blocked",
  "Done",
  "Deferred",
];

const owners: RoadmapItem["owner"][] = [
  "Dickson",
  "Codex",
  "Developer",
  "Future Hire",
];

const riskLevels: RoadmapItem["riskLevel"][] = ["Low", "Medium", "High"];

const longTextFields: Array<{
  key: keyof RoadmapItemFormValues;
  label: string;
  rows: number;
}> = [
  { key: "businessReason", label: "Business reason", rows: 3 },
  { key: "successCriteria", label: "Success criteria", rows: 4 },
  { key: "notes", label: "Notes", rows: 4 },
  { key: "codexPromptUsed", label: "Codex prompt used", rows: 3 },
];

const emptyValues: RoadmapItemFormValues = {
  title: "",
  module: "Dashboard",
  phase: "Phase 1",
  type: "Feature",
  priority: "Medium",
  status: "Planned",
  businessReason: "",
  successCriteria: "",
  owner: "Codex",
  riskLevel: "Medium",
  targetDate: "",
  notes: "",
  codexPromptUsed: "",
  isDemo: false,
};

function toFormValues(item?: RoadmapItem | null): RoadmapItemFormValues {
  if (!item) {
    return emptyValues;
  }

  return {
    title: item.title,
    module: item.module,
    phase: item.phase,
    type: item.type,
    priority: item.priority,
    status: item.status,
    businessReason: item.businessReason ?? "",
    successCriteria: item.successCriteria ?? "",
    owner: item.owner,
    riskLevel: item.riskLevel,
    targetDate: item.targetDate ?? "",
    notes: item.notes ?? "",
    codexPromptUsed: item.codexPromptUsed ?? "",
    isDemo: item.isDemo ?? false,
  };
}

function normalizeOptional(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function RoadmapItemForm({
  item,
  onCancel,
  onSave,
}: RoadmapItemFormProps) {
  const [values, setValues] = useState<RoadmapItemFormValues>(() =>
    toFormValues(item)
  );
  const [validationError, setValidationError] = useState("");

  function updateField<K extends keyof RoadmapItemFormValues>(
    key: K,
    value: RoadmapItemFormValues[K]
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function handleSave() {
    if (!values.title.trim()) {
      setValidationError("Roadmap title is required.");
      return;
    }

    const normalizedValues: RoadmapItemFormValues = {
      ...values,
      title: values.title.trim(),
      businessReason: normalizeOptional(values.businessReason),
      successCriteria: normalizeOptional(values.successCriteria),
      targetDate: normalizeOptional(values.targetDate),
      notes: normalizeOptional(values.notes),
      codexPromptUsed: normalizeOptional(values.codexPromptUsed),
    };

    onSave(normalizedValues);
    toast.success(item ? "Roadmap item updated." : "Roadmap item added.");
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
          <Label htmlFor="roadmap-title">Title</Label>
          <Input
            id="roadmap-title"
            placeholder="Launch command center weekly export"
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Module</Label>
          <Select
            value={values.module}
            onValueChange={(value) =>
              updateField("module", value as RoadmapItem["module"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Phase</Label>
          <Select
            value={values.phase}
            onValueChange={(value) =>
              updateField("phase", value as RoadmapItem["phase"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {phases.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Type</Label>
          <Select
            value={values.type}
            onValueChange={(value) =>
              updateField("type", value as RoadmapItem["type"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roadmapTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Priority</Label>
          <Select
            value={values.priority}
            onValueChange={(value) =>
              updateField("priority", value as WorkstreamPriority)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select
            value={values.status}
            onValueChange={(value) =>
              updateField("status", value as RoadmapItem["status"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Owner</Label>
          <Select
            value={values.owner}
            onValueChange={(value) =>
              updateField("owner", value as RoadmapItem["owner"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {owners.map((owner) => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Risk level</Label>
          <Select
            value={values.riskLevel}
            onValueChange={(value) =>
              updateField("riskLevel", value as RoadmapItem["riskLevel"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {riskLevels.map((riskLevel) => (
                  <SelectItem key={riskLevel} value={riskLevel}>
                    {riskLevel}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="roadmap-target-date">Target date</Label>
          <Input
            id="roadmap-target-date"
            type="date"
            value={values.targetDate}
            onChange={(event) => updateField("targetDate", event.target.value)}
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
          {item ? "Save Changes" : "Add Roadmap Item"}
        </Button>
      </div>
    </div>
  );
}
