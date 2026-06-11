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
import { type EngineeringTask, type WorkstreamPriority } from "@/lib/types";

export type EngineeringTaskFormValues = Omit<
  EngineeringTask,
  "id" | "createdDate" | "updatedDate"
>;

type EngineeringTaskFormProps = {
  task?: EngineeringTask | null;
  onCancel: () => void;
  onSave: (values: EngineeringTaskFormValues) => void;
};

const priorities: WorkstreamPriority[] = ["Low", "Medium", "High", "Critical"];

const affectedAreas: EngineeringTask["affectedArea"][] = [
  "Mobile UI",
  "Diagnostics",
  "Vehicle Management",
  "Onboarding",
  "Landing Page",
  "Supabase",
  "Security",
  "Payments",
  "Telematics",
  "Grant/R&D",
  "Dashboard",
  "Other",
];

const issueTypes: EngineeringTask["issueType"][] = [
  "Bug",
  "Feature",
  "Improvement",
  "Refactor",
  "Documentation",
  "Test",
  "Security",
  "Integration",
];

const statuses: EngineeringTask["status"][] = [
  "Planned",
  "In Progress",
  "Blocked",
  "Ready for Codex",
  "PR Drafted",
  "Review Needed",
  "Done",
  "Deferred",
];

const longTextFields: Array<{
  key: keyof EngineeringTaskFormValues;
  label: string;
  rows: number;
}> = [
  { key: "businessReason", label: "Business reason", rows: 3 },
  { key: "userStory", label: "User story", rows: 3 },
  { key: "currentBehavior", label: "Current behavior", rows: 4 },
  { key: "desiredBehavior", label: "Desired behavior", rows: 4 },
  { key: "acceptanceCriteria", label: "Acceptance criteria", rows: 4 },
  { key: "filesLikelyInvolved", label: "Files likely involved", rows: 3 },
  { key: "risks", label: "Risks", rows: 3 },
  { key: "testRequirements", label: "Test requirements", rows: 3 },
  { key: "doNotChangeAreas", label: "Do-not-change areas", rows: 3 },
  { key: "notesForAI", label: "Notes for AI", rows: 4 },
];

const emptyValues: EngineeringTaskFormValues = {
  title: "",
  businessReason: "",
  userStory: "",
  priority: "Medium",
  affectedArea: "Dashboard",
  issueType: "Feature",
  currentBehavior: "",
  desiredBehavior: "",
  acceptanceCriteria: "",
  filesLikelyInvolved: "",
  risks: "",
  testRequirements: "",
  doNotChangeAreas: "",
  notesForAI: "",
  status: "Planned",
  isDemo: false,
};

function toFormValues(task?: EngineeringTask | null): EngineeringTaskFormValues {
  if (!task) {
    return emptyValues;
  }

  return {
    title: task.title,
    businessReason: task.businessReason ?? "",
    userStory: task.userStory ?? "",
    priority: task.priority,
    affectedArea: task.affectedArea,
    issueType: task.issueType,
    currentBehavior: task.currentBehavior ?? "",
    desiredBehavior: task.desiredBehavior ?? "",
    acceptanceCriteria: task.acceptanceCriteria ?? "",
    filesLikelyInvolved: task.filesLikelyInvolved ?? "",
    risks: task.risks ?? "",
    testRequirements: task.testRequirements ?? "",
    doNotChangeAreas: task.doNotChangeAreas ?? "",
    notesForAI: task.notesForAI ?? "",
    status: task.status,
    isDemo: task.isDemo ?? false,
  };
}

function normalizeOptional(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function EngineeringTaskForm({
  task,
  onCancel,
  onSave,
}: EngineeringTaskFormProps) {
  const [values, setValues] = useState<EngineeringTaskFormValues>(() =>
    toFormValues(task)
  );
  const [validationError, setValidationError] = useState("");

  function updateField<K extends keyof EngineeringTaskFormValues>(
    key: K,
    value: EngineeringTaskFormValues[K]
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function handleSave() {
    if (!values.title.trim()) {
      setValidationError("Task title is required.");
      return;
    }

    const normalizedValues: EngineeringTaskFormValues = {
      ...values,
      title: values.title.trim(),
      businessReason: normalizeOptional(values.businessReason),
      userStory: normalizeOptional(values.userStory),
      currentBehavior: normalizeOptional(values.currentBehavior),
      desiredBehavior: normalizeOptional(values.desiredBehavior),
      acceptanceCriteria: normalizeOptional(values.acceptanceCriteria),
      filesLikelyInvolved: normalizeOptional(values.filesLikelyInvolved),
      risks: normalizeOptional(values.risks),
      testRequirements: normalizeOptional(values.testRequirements),
      doNotChangeAreas: normalizeOptional(values.doNotChangeAreas),
      notesForAI: normalizeOptional(values.notesForAI),
    };

    onSave(normalizedValues);
    toast.success(task ? "Engineering task updated." : "Engineering task added.");
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
          <Label htmlFor="task-title">Task title</Label>
          <Input
            id="task-title"
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Improve mobile diagnostic form layout"
          />
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
              updateField("status", value as EngineeringTask["status"])
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
          <Label>Affected area</Label>
          <Select
            value={values.affectedArea}
            onValueChange={(value) =>
              updateField(
                "affectedArea",
                value as EngineeringTask["affectedArea"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {affectedAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Issue type</Label>
          <Select
            value={values.issueType}
            onValueChange={(value) =>
              updateField("issueType", value as EngineeringTask["issueType"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {issueTypes.map((issueType) => (
                  <SelectItem key={issueType} value={issueType}>
                    {issueType}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-4">
        {longTextFields.map(({ key, label, rows }) => (
          <div className="flex flex-col gap-2" key={key}>
            <Label htmlFor={key}>{label}</Label>
            <Textarea
              id={key}
              rows={rows}
              value={
                (values[key as keyof EngineeringTaskFormValues] as string) ?? ""
              }
              onChange={(event) =>
                updateField(
                  key as keyof EngineeringTaskFormValues,
                  event.target.value
                )
              }
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
          {task ? "Save Changes" : "Add Engineering Task"}
        </Button>
      </div>
    </div>
  );
}
