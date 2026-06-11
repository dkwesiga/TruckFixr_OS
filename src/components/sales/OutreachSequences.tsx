"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangleIcon, CopyIcon, PlusIcon, SaveIcon, SendIcon } from "lucide-react";
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
import { copyToClipboard } from "@/lib/export";
import {
  generateSequence,
  getComplianceWarnings,
  SEQUENCE_NAMES,
  type OutreachSequenceName,
} from "@/lib/outreach-sequences";
import {
  type Prospect,
  type ProspectContact,
  type SalesFollowUpStep,
  type SalesOutreachDraft,
} from "@/lib/types";

type OutreachSequencesProps = {
  prospects: Prospect[];
  selectedProspectId: string | null;
  onSelectProspect: (id: string) => void;
  onUpdateProspect: (prospect: Prospect, updates: Partial<Prospect>) => void;
};

const channels: SalesFollowUpStep["channel"][] = [
  "email",
  "linkedin",
  "phone",
  "other",
];

const stepStatuses: SalesFollowUpStep["status"][] = [
  "open",
  "in_progress",
  "completed",
  "dismissed",
];

const draftStatuses: SalesOutreachDraft["status"][] = [
  "Draft",
  "Needs Review",
  "Approved",
  "Sent",
  "Used",
  "Archived",
];

const approvalStatuses: SalesOutreachDraft["approvalStatus"][] = [
  "Not Reviewed",
  "Needs Review",
  "Approved",
  "Rejected",
];

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function firstContact(prospect: Prospect): ProspectContact | undefined {
  return (prospect.contacts ?? []).find((contact) => !contact.archivedAt);
}

export function OutreachSequences({
  prospects,
  selectedProspectId,
  onSelectProspect,
  onUpdateProspect,
}: OutreachSequencesProps) {
  const selectedProspect = useMemo(() => {
    return (
      prospects.find((prospect) => prospect.id === selectedProspectId) ??
      prospects[0] ??
      null
    );
  }, [prospects, selectedProspectId]);
  const [selectedSequence, setSelectedSequence] =
    useState<OutreachSequenceName>("Cold outbound sequence");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [steps, setSteps] = useState<SalesFollowUpStep[]>([]);
  const [drafts, setDrafts] = useState<SalesOutreachDraft[]>([]);

  useEffect(() => {
    if (!selectedProspect) return;

    setSelectedContactId(firstContact(selectedProspect)?.id ?? "");
    setSteps(selectedProspect.followUpSequence ?? []);
    setDrafts(selectedProspect.outreachDrafts ?? []);
  }, [selectedProspect]);

  if (!selectedProspect) {
    return (
      <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-white p-5">
        <p className="font-bold text-slate-950">No prospect selected</p>
        <p className="mt-2 text-sm text-slate-600">
          Add or import a prospect before creating outreach sequences.
        </p>
      </div>
    );
  }

  const contacts = (selectedProspect.contacts ?? []).filter(
    (contact) => !contact.archivedAt
  );
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) ??
    firstContact(selectedProspect);
  const warnings = getComplianceWarnings(selectedProspect, selectedContact);
  const hasBlocker = warnings.some((warning) => warning.level === "block");

  function saveOutreach(updates?: Partial<Prospect>) {
    onUpdateProspect(selectedProspect, {
      followUpSequence: steps,
      outreachDrafts: drafts,
      ...updates,
    });
  }

  function generateSelectedSequence() {
    const generated = generateSequence(
      selectedProspect,
      selectedSequence,
      selectedContact
    );
    const nextSteps = [...generated.steps, ...steps];
    const nextDrafts = [...generated.drafts, ...drafts];
    setSteps(nextSteps);
    setDrafts(nextDrafts);
    onUpdateProspect(selectedProspect, {
      followUpSequence: nextSteps,
      outreachDrafts: nextDrafts,
      currentStage: "Outreach Drafted",
      outreachStatus: "Drafted",
      nextAction: hasBlocker
        ? "Review compliance blockers before using outreach drafts."
        : "Review outreach drafts and manually approve before sending.",
    });
  }

  function updateStep<K extends keyof SalesFollowUpStep>(
    id: string,
    key: K,
    value: SalesFollowUpStep[K]
  ) {
    setSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, [key]: value } : step))
    );
  }

  function addStep() {
    setSteps((current) => [
      {
        id: createId("sequence_step"),
        sequenceName: selectedSequence,
        stepName: "Manual follow-up step",
        dueDate: new Date().toISOString().slice(0, 10),
        channel: "email",
        status: "open",
        notes: "",
      },
      ...current,
    ]);
  }

  function removeStep(id: string) {
    setSteps((current) => current.filter((step) => step.id !== id));
  }

  function updateDraft<K extends keyof SalesOutreachDraft>(
    id: string,
    key: K,
    value: SalesOutreachDraft[K]
  ) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id ? { ...draft, [key]: value } : draft
      )
    );
  }

  async function copyDraft(body: string) {
    const didCopy = await copyToClipboard(body);
    toast[didCopy ? "success" : "error"](
      didCopy ? "Draft copied." : "Clipboard copy failed."
    );
  }

  function markDraftSent(draft: SalesOutreachDraft) {
    const today = new Date().toISOString().slice(0, 10);
    const nextDrafts = drafts.map((currentDraft) =>
      currentDraft.id === draft.id
        ? {
            ...currentDraft,
            status: "Sent" as const,
            manuallyMarkedSentDate: today,
          }
        : currentDraft
    );
    setDrafts(nextDrafts);
    onUpdateProspect(selectedProspect, {
      followUpSequence: steps,
      outreachDrafts: nextDrafts,
      lastOutreachDate: today,
      outreachCount30Days: (selectedProspect.outreachCount30Days ?? 0) + 1,
      currentStage: "Outreach Sent",
      outreachStatus: "Sent",
      nextAction: "Track reply and follow-up manually.",
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
              Draft-only outreach sequences. Nothing is auto-sent, posted, or submitted.
              Sent dates are manual tracking fields only.
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
            <p className="font-bold">Compliance review</p>
            {warnings.length ? (
              <div className="mt-3 space-y-2">
                {warnings.map((warning) => (
                  <div className="flex gap-2 text-sm" key={warning.message}>
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    <span>{warning.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm">
                No compliance warnings detected. Human review is still required.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e0c0b1] bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label>Sequence template</Label>
            <Select
              value={selectedSequence}
              onValueChange={(value) =>
                setSelectedSequence(value as OutreachSequenceName)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SEQUENCE_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Related contact</Label>
            <Select value={selectedContactId} onValueChange={setSelectedContactId}>
              <SelectTrigger>
                <SelectValue placeholder="No contact selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              className="w-full bg-[#9d4300] text-white hover:bg-orange-600"
              onClick={generateSelectedSequence}
            >
              <PlusIcon data-icon="inline-start" />
              Generate sequence
            </Button>
          </div>
          <div className="flex items-end">
            <Button className="w-full" variant="outline" onClick={() => saveOutreach()}>
              <SaveIcon data-icon="inline-start" />
              Save edits
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Follow-Up Steps
              </p>
              <h4 className="mt-1 text-lg font-bold text-slate-950">
                Manual action queue
              </h4>
            </div>
            <Button variant="outline" onClick={addStep}>
              <PlusIcon data-icon="inline-start" />
              Add step
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {steps.length ? (
              steps.map((step) => (
                <article
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  key={step.id}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={step.stepName}
                      onChange={(event) =>
                        updateStep(step.id, "stepName", event.target.value)
                      }
                    />
                    <Input
                      type="date"
                      value={step.dueDate ?? ""}
                      onChange={(event) =>
                        updateStep(step.id, "dueDate", event.target.value)
                      }
                    />
                    <Select
                      value={step.channel}
                      onValueChange={(value) =>
                        updateStep(
                          step.id,
                          "channel",
                          value as SalesFollowUpStep["channel"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {channels.map((channel) => (
                            <SelectItem key={channel} value={channel}>
                              {channel}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      value={step.status}
                      onValueChange={(value) =>
                        updateStep(
                          step.id,
                          "status",
                          value as SalesFollowUpStep["status"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {stepStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Textarea
                      className="sm:col-span-2"
                      placeholder="Step notes"
                      rows={2}
                      value={step.notes ?? ""}
                      onChange={(event) =>
                        updateStep(step.id, "notes", event.target.value)
                      }
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" onClick={() => removeStep(step.id)}>
                      Remove
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                No follow-up sequence steps yet.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Outreach Drafts
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-950">
            Review before manual use
          </h4>

          <div className="mt-4 space-y-4">
            {drafts.length ? (
              drafts.map((draft) => (
                <article
                  className="rounded-lg border border-slate-200 bg-white p-3"
                  key={draft.id}
                >
                  <div className="grid gap-3 lg:grid-cols-4">
                    <Input
                      placeholder="Subject"
                      value={draft.subject ?? ""}
                      onChange={(event) =>
                        updateDraft(draft.id, "subject", event.target.value)
                      }
                    />
                    <Select
                      value={draft.status}
                      onValueChange={(value) =>
                        updateDraft(
                          draft.id,
                          "status",
                          value as SalesOutreachDraft["status"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {draftStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      value={draft.approvalStatus}
                      onValueChange={(value) =>
                        updateDraft(
                          draft.id,
                          "approvalStatus",
                          value as SalesOutreachDraft["approvalStatus"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {approvalStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={draft.manuallyMarkedSentDate ?? ""}
                      onChange={(event) =>
                        updateDraft(
                          draft.id,
                          "manuallyMarkedSentDate",
                          event.target.value
                        )
                      }
                    />
                    <Textarea
                      className="lg:col-span-4"
                      rows={8}
                      value={draft.body}
                      onChange={(event) =>
                        updateDraft(draft.id, "body", event.target.value)
                      }
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={() => copyDraft(draft.body)}>
                      <CopyIcon data-icon="inline-start" />
                      Copy
                    </Button>
                    <Button
                      className="border-orange-200 text-orange-700"
                      disabled={hasBlocker}
                      variant="outline"
                      onClick={() => markDraftSent(draft)}
                    >
                      <SendIcon data-icon="inline-start" />
                      Mark manually sent
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                No outreach drafts yet. Generate a sequence to create draft-only
                messages.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
