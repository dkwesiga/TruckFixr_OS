"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArchiveIcon,
  CheckCircle2Icon,
  PlusIcon,
  SaveIcon,
  UserRoundIcon,
} from "lucide-react";
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
  calculateCommercialScores,
  getProspectStage,
  getRecommendedNextStep,
  SALES_PIPELINE_STAGES,
} from "@/lib/sales-workflow";
import {
  type Prospect,
  type ProspectContact,
  type SalesDiscoveryWorkflow,
  type SalesPipelineStage,
  type SalesPriority,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type ProspectDetailWorkflowProps = {
  prospects: Prospect[];
  selectedProspectId: string | null;
  onSelectProspect: (id: string) => void;
  onUpdateProspect: (prospect: Prospect, updates: Partial<Prospect>) => void;
  onSetStage: (prospect: Prospect, stage: SalesPipelineStage) => void;
  onEditProspect: (prospect: Prospect) => void;
};

type ContactDraft = Omit<ProspectContact, "id" | "archivedAt">;

const emptyContact: ContactDraft = {
  name: "",
  title: "",
  role: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  preferredChannel: "Email",
  influenceLevel: "medium",
  decisionRole: "unknown",
  consentStatus: "unknown",
  consentSource: "",
  doNotContact: false,
  notes: "",
  lastContactedDate: "",
  nextFollowUpDate: "",
};

const emptyDiscovery: SalesDiscoveryWorkflow = {
  fleetSize: "",
  vehicleTypes: "",
  locations: "",
  maintenanceModel: "",
  maintenanceSoftware: "",
  eldTelematicsProvider: "",
  inspectionProcess: "",
  commonBreakdowns: "",
  diagnosticDelays: "",
  repeatRepairs: "",
  inspectionIssues: "",
  downtimeImpact: "",
  communicationGaps: "",
  documentationGaps: "",
  currentWorkaround: "",
  decisionMaker: "",
  budgetOwner: "",
  urgency: "Medium",
  willingnessToPilot: "Maybe",
  preferredPilotScope: "",
  successCriteria: "",
  timeline: "",
  objections: "",
  availableDataSources: "",
  supportLetterPotential: "Medium",
  paidConversionLikelihood: "Medium",
  recommendedStageTransition: "Discovery Completed",
  summary: "",
};

const priorities: SalesPriority[] = ["Low", "Medium", "High", "Critical"];

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function buildDiscoverySummary(prospect: Prospect, workflow: SalesDiscoveryWorkflow) {
  const painPoints = [
    workflow.commonBreakdowns && `common breakdowns: ${workflow.commonBreakdowns}`,
    workflow.diagnosticDelays && `diagnostic delays: ${workflow.diagnosticDelays}`,
    workflow.repeatRepairs && `repeat repairs: ${workflow.repeatRepairs}`,
    workflow.downtimeImpact && `downtime impact: ${workflow.downtimeImpact}`,
  ]
    .filter(Boolean)
    .join("; ");
  const fitNotes = [
    workflow.willingnessToPilot && `pilot interest: ${workflow.willingnessToPilot}`,
    workflow.timeline && `timeline: ${workflow.timeline}`,
    workflow.successCriteria && `success criteria: ${workflow.successCriteria}`,
  ]
    .filter(Boolean)
    .join("; ");

  return [
    `Discovery summary for ${prospect.companyName}`,
    "",
    `Fleet profile: ${workflow.fleetSize || prospect.estimatedFleetSize || "fleet size not confirmed"} vehicles; ${workflow.vehicleTypes || prospect.vehicleTypes || "vehicle types not confirmed"}; ${workflow.locations || prospect.location}.`,
    "",
    `Pain discovery: ${painPoints || prospect.maintenancePain || "No specific pain captured yet."}`,
    "",
    `Pilot fit: ${fitNotes || "Pilot fit details need follow-up."}`,
    "",
    `R&D/funding fit: ${workflow.availableDataSources || "Data sources not confirmed."} Support-letter potential: ${workflow.supportLetterPotential || "Medium"}.`,
    "",
    `Objections/risks: ${workflow.objections || "No objections captured yet."}`,
    "",
    `Next best action: ${getRecommendedNextStep({
      ...prospect,
      discoveryWorkflow: workflow,
    })}`,
  ].join("\n");
}

function toContactDraft(contact?: ProspectContact): ContactDraft {
  if (!contact) return emptyContact;

  return {
    name: contact.name,
    title: contact.title ?? "",
    role: contact.role ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    linkedinUrl: contact.linkedinUrl ?? "",
    preferredChannel: contact.preferredChannel ?? "Email",
    influenceLevel: contact.influenceLevel ?? "medium",
    decisionRole: contact.decisionRole ?? "unknown",
    consentStatus: contact.consentStatus ?? "unknown",
    consentSource: contact.consentSource ?? "",
    doNotContact: contact.doNotContact ?? false,
    notes: contact.notes ?? "",
    lastContactedDate: contact.lastContactedDate ?? "",
    nextFollowUpDate: contact.nextFollowUpDate ?? "",
  };
}

export function ProspectDetailWorkflow({
  prospects,
  selectedProspectId,
  onSelectProspect,
  onUpdateProspect,
  onSetStage,
  onEditProspect,
}: ProspectDetailWorkflowProps) {
  const selectedProspect = useMemo(() => {
    return (
      prospects.find((prospect) => prospect.id === selectedProspectId) ??
      prospects[0] ??
      null
    );
  }, [prospects, selectedProspectId]);
  const [stageDraft, setStageDraft] = useState({
    currentStage: "New Prospect" as SalesPipelineStage,
    stageNotes: "",
    nextAction: "",
    nextActionDueDate: "",
    nextActionOwner: "Dickson",
    priority: "Medium" as SalesPriority,
    stalled: false,
    stalledReason: "",
  });
  const [contactDraft, setContactDraft] = useState<ContactDraft>(emptyContact);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [discoveryDraft, setDiscoveryDraft] =
    useState<SalesDiscoveryWorkflow>(emptyDiscovery);

  useEffect(() => {
    if (!selectedProspect) return;

    setStageDraft({
      currentStage: getProspectStage(selectedProspect),
      stageNotes: selectedProspect.stageNotes ?? "",
      nextAction: selectedProspect.nextAction ?? "",
      nextActionDueDate: selectedProspect.nextActionDueDate ?? "",
      nextActionOwner: selectedProspect.nextActionOwner ?? "Dickson",
      priority: selectedProspect.priority ?? "Medium",
      stalled: selectedProspect.stalled ?? false,
      stalledReason: selectedProspect.stalledReason ?? "",
    });
    setDiscoveryDraft({
      ...emptyDiscovery,
      ...selectedProspect.discoveryWorkflow,
    });
    setContactDraft(emptyContact);
    setEditingContactId(null);
  }, [selectedProspect]);

  if (!selectedProspect) {
    return (
      <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-white p-5">
        <p className="font-bold text-slate-950">No prospect selected</p>
        <p className="mt-2 text-sm text-slate-600">
          Add or import a prospect to start the detail workflow.
        </p>
      </div>
    );
  }

  const activeContacts = (selectedProspect.contacts ?? []).filter(
    (contact) => !contact.archivedAt
  );
  const scores = calculateCommercialScores(selectedProspect);

  function updateStageField<K extends keyof typeof stageDraft>(
    key: K,
    value: (typeof stageDraft)[K]
  ) {
    setStageDraft((current) => ({ ...current, [key]: value }));
  }

  function updateContactField<K extends keyof ContactDraft>(
    key: K,
    value: ContactDraft[K]
  ) {
    setContactDraft((current) => ({ ...current, [key]: value }));
  }

  function updateDiscoveryField<K extends keyof SalesDiscoveryWorkflow>(
    key: K,
    value: SalesDiscoveryWorkflow[K]
  ) {
    setDiscoveryDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveStageMetadata() {
    onUpdateProspect(selectedProspect, {
      ...stageDraft,
      stalledReason: stageDraft.stalled
        ? normalizeOptional(stageDraft.stalledReason)
        : undefined,
      nextAction: normalizeOptional(stageDraft.nextAction),
      nextActionDueDate: normalizeOptional(stageDraft.nextActionDueDate),
      nextActionOwner: normalizeOptional(stageDraft.nextActionOwner),
      stageNotes: normalizeOptional(stageDraft.stageNotes),
      commercialReadinessScore:
        selectedProspect.commercialReadinessScore ??
        scores.commercialReadinessScore,
      rdFundingEvidenceScore:
        selectedProspect.rdFundingEvidenceScore ?? scores.rdFundingEvidenceScore,
      speedToCloseScore:
        selectedProspect.speedToCloseScore ?? scores.speedToCloseScore,
    });
  }

  function handleSaveContact() {
    if (!contactDraft.name.trim()) {
      toast.error("Contact name is required.");
      return;
    }

    const contacts = selectedProspect.contacts ?? [];
    const normalizedContact: ProspectContact = {
      id: editingContactId ?? createId("contact"),
      name: contactDraft.name.trim(),
      title: normalizeOptional(contactDraft.title),
      role: normalizeOptional(contactDraft.role),
      email: normalizeOptional(contactDraft.email),
      phone: normalizeOptional(contactDraft.phone),
      linkedinUrl: normalizeOptional(contactDraft.linkedinUrl),
      preferredChannel: contactDraft.preferredChannel,
      influenceLevel: contactDraft.influenceLevel,
      decisionRole: contactDraft.decisionRole,
      consentStatus: contactDraft.consentStatus,
      consentSource: normalizeOptional(contactDraft.consentSource),
      doNotContact: contactDraft.doNotContact,
      notes: normalizeOptional(contactDraft.notes),
      lastContactedDate: normalizeOptional(contactDraft.lastContactedDate),
      nextFollowUpDate: normalizeOptional(contactDraft.nextFollowUpDate),
    };

    onUpdateProspect(selectedProspect, {
      contacts: editingContactId
        ? contacts.map((contact) =>
            contact.id === editingContactId ? normalizedContact : contact
          )
        : [normalizedContact, ...contacts],
    });
    setContactDraft(emptyContact);
    setEditingContactId(null);
  }

  function handleEditContact(contact: ProspectContact) {
    setEditingContactId(contact.id);
    setContactDraft(toContactDraft(contact));
  }

  function handleArchiveContact(contactId: string) {
    onUpdateProspect(selectedProspect, {
      contacts: (selectedProspect.contacts ?? []).map((contact) =>
        contact.id === contactId
          ? { ...contact, archivedAt: new Date().toISOString() }
          : contact
      ),
    });
  }

  function handleSaveDiscovery(markComplete = false) {
    const workflow: SalesDiscoveryWorkflow = {
      ...discoveryDraft,
      completedAt: markComplete
        ? new Date().toISOString()
        : discoveryDraft.completedAt,
    };
    const summary = buildDiscoverySummary(selectedProspect, workflow);
    const nextStage = workflow.recommendedStageTransition ?? "Discovery Completed";

    onUpdateProspect(selectedProspect, {
      discoveryWorkflow: {
        ...workflow,
        summary,
      },
      vehicleTypes:
        normalizeOptional(workflow.vehicleTypes) ?? selectedProspect.vehicleTypes,
      currentMaintenanceSoftware:
        normalizeOptional(workflow.maintenanceSoftware) ??
        selectedProspect.currentMaintenanceSoftware,
      eldTelematicsProvider:
        normalizeOptional(workflow.eldTelematicsProvider) ??
        selectedProspect.eldTelematicsProvider,
      urgency: workflow.urgency,
      pilotInterest:
        workflow.willingnessToPilot === "Yes"
          ? "Yes"
          : workflow.willingnessToPilot === "No"
            ? "No"
            : "Maybe",
      nextAction: "Review discovery summary and decide pilot scope.",
    });

    if (markComplete) {
      onSetStage(selectedProspect, nextStage);
    }
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
            <p className="mt-1 text-sm text-slate-600">
              {selectedProspect.location} -{" "}
              {selectedProspect.fleetType ?? "Fleet type unknown"}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {selectedProspect.maintenancePain ||
                "No maintenance pain captured yet."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["Current stage", getProspectStage(selectedProspect)],
              [
                "Commercial readiness",
                `${selectedProspect.commercialReadinessScore ?? scores.commercialReadinessScore}/5`,
              ],
              ["Recommended next step", getRecommendedNextStep(selectedProspect)],
            ].map(([label, value]) => (
              <article className="rounded-lg bg-white p-3" key={label}>
                <p className="text-xs font-bold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {value}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Stage Metadata
              </p>
              <h4 className="mt-1 text-lg font-bold text-slate-950">
                Manual pipeline control
              </h4>
            </div>
            <Button variant="outline" onClick={() => onEditProspect(selectedProspect)}>
              Edit basics
            </Button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Current stage</Label>
              <Select
                value={stageDraft.currentStage}
                onValueChange={(value) =>
                  updateStageField("currentStage", value as SalesPipelineStage)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SALES_PIPELINE_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select
                value={stageDraft.priority}
                onValueChange={(value) =>
                  updateStageField("priority", value as SalesPriority)
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
              <Label htmlFor="next-action">Next action</Label>
              <Input
                id="next-action"
                value={stageDraft.nextAction}
                onChange={(event) =>
                  updateStageField("nextAction", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="next-action-due">Next action due date</Label>
              <Input
                id="next-action-due"
                type="date"
                value={stageDraft.nextActionDueDate}
                onChange={(event) =>
                  updateStageField("nextActionDueDate", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="next-action-owner">Next action owner</Label>
              <Input
                id="next-action-owner"
                value={stageDraft.nextActionOwner}
                onChange={(event) =>
                  updateStageField("nextActionOwner", event.target.value)
                }
              />
            </div>
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700">
              <input
                checked={stageDraft.stalled}
                className="size-4"
                type="checkbox"
                onChange={(event) =>
                  updateStageField("stalled", event.target.checked)
                }
              />
              Stalled
            </label>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="stage-notes">Stage notes</Label>
              <Textarea
                id="stage-notes"
                rows={3}
                value={stageDraft.stageNotes}
                onChange={(event) =>
                  updateStageField("stageNotes", event.target.value)
                }
              />
            </div>
            {stageDraft.stalled ? (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="stalled-reason">Stalled reason</Label>
                <Textarea
                  id="stalled-reason"
                  rows={2}
                  value={stageDraft.stalledReason}
                  onChange={(event) =>
                    updateStageField("stalledReason", event.target.value)
                  }
                />
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onSetStage(selectedProspect, stageDraft.currentStage)}
            >
              Move stage
            </Button>
            <Button
              className="bg-[#9d4300] text-white hover:bg-orange-600"
              onClick={handleSaveStageMetadata}
            >
              <SaveIcon data-icon="inline-start" />
              Save metadata
            </Button>
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Contacts
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-950">
            Decision team
          </h4>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {activeContacts.length ? (
                activeContacts.map((contact) => (
                  <article
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    key={contact.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">
                          {contact.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {contact.title ?? contact.decisionRole ?? "Role unknown"}
                        </p>
                      </div>
                      {contact.doNotContact ? (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                          DNC
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      {contact.email || contact.phone || contact.linkedinUrl || "No contact channel set"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditContact(contact)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="border-slate-200 text-slate-600"
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchiveContact(contact.id)}
                      >
                        <ArchiveIcon data-icon="inline-start" />
                        Archive
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  No contacts yet. Add at least one decision maker or influencer.
                </div>
              )}
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <UserRoundIcon className="size-4 text-orange-600" />
                <p className="font-bold text-slate-950">
                  {editingContactId ? "Edit contact" : "Add contact"}
                </p>
              </div>
              <div className="mt-3 grid gap-3">
                <Input
                  placeholder="Name"
                  value={contactDraft.name}
                  onChange={(event) =>
                    updateContactField("name", event.target.value)
                  }
                />
                <Input
                  placeholder="Title"
                  value={contactDraft.title ?? ""}
                  onChange={(event) =>
                    updateContactField("title", event.target.value)
                  }
                />
                <Input
                  placeholder="Role"
                  value={contactDraft.role ?? ""}
                  onChange={(event) =>
                    updateContactField("role", event.target.value)
                  }
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={contactDraft.email ?? ""}
                  onChange={(event) =>
                    updateContactField("email", event.target.value)
                  }
                />
                <Input
                  placeholder="Phone"
                  value={contactDraft.phone ?? ""}
                  onChange={(event) =>
                    updateContactField("phone", event.target.value)
                  }
                />
                <Input
                  placeholder="LinkedIn URL"
                  value={contactDraft.linkedinUrl ?? ""}
                  onChange={(event) =>
                    updateContactField("linkedinUrl", event.target.value)
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    value={contactDraft.decisionRole}
                    onValueChange={(value) =>
                      updateContactField(
                        "decisionRole",
                        value as ProspectContact["decisionRole"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[
                          "decision maker",
                          "influencer",
                          "user",
                          "blocker",
                          "unknown",
                        ].map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select
                    value={contactDraft.influenceLevel}
                    onValueChange={(value) =>
                      updateContactField(
                        "influenceLevel",
                        value as ProspectContact["influenceLevel"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {["low", "medium", "high"].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={contactDraft.lastContactedDate ?? ""}
                    onChange={(event) =>
                      updateContactField("lastContactedDate", event.target.value)
                    }
                  />
                  <Input
                    type="date"
                    value={contactDraft.nextFollowUpDate ?? ""}
                    onChange={(event) =>
                      updateContactField("nextFollowUpDate", event.target.value)
                    }
                  />
                </div>
                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700">
                  <input
                    checked={contactDraft.doNotContact ?? false}
                    className="size-4"
                    type="checkbox"
                    onChange={(event) =>
                      updateContactField("doNotContact", event.target.checked)
                    }
                  />
                  Do not contact
                </label>
                <Textarea
                  placeholder="Contact notes"
                  rows={3}
                  value={contactDraft.notes ?? ""}
                  onChange={(event) =>
                    updateContactField("notes", event.target.value)
                  }
                />
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {editingContactId ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingContactId(null);
                      setContactDraft(emptyContact);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button
                  className="bg-[#9d4300] text-white hover:bg-orange-600"
                  onClick={handleSaveContact}
                >
                  <PlusIcon data-icon="inline-start" />
                  {editingContactId ? "Save contact" : "Add contact"}
                </Button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-[#e0c0b1] bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[#584237]">
              Discovery Workflow
            </p>
            <h4 className="mt-1 text-lg font-bold text-slate-950">
              Fleet, pain, buying fit, and R&D evidence
            </h4>
          </div>
          {discoveryDraft.completedAt ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
              <CheckCircle2Icon className="size-4" />
              Completed
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-5 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Fleet size"
                value={discoveryDraft.fleetSize ?? ""}
                onChange={(event) =>
                  updateDiscoveryField("fleetSize", event.target.value)
                }
              />
              <Input
                placeholder="Vehicle types"
                value={discoveryDraft.vehicleTypes ?? ""}
                onChange={(event) =>
                  updateDiscoveryField("vehicleTypes", event.target.value)
                }
              />
              <Input
                placeholder="Locations"
                value={discoveryDraft.locations ?? ""}
                onChange={(event) =>
                  updateDiscoveryField("locations", event.target.value)
                }
              />
              <Input
                placeholder="Maintenance model"
                value={discoveryDraft.maintenanceModel ?? ""}
                onChange={(event) =>
                  updateDiscoveryField("maintenanceModel", event.target.value)
                }
              />
              <Input
                placeholder="Maintenance software"
                value={discoveryDraft.maintenanceSoftware ?? ""}
                onChange={(event) =>
                  updateDiscoveryField("maintenanceSoftware", event.target.value)
                }
              />
              <Input
                placeholder="ELD / telematics provider"
                value={discoveryDraft.eldTelematicsProvider ?? ""}
                onChange={(event) =>
                  updateDiscoveryField(
                    "eldTelematicsProvider",
                    event.target.value
                  )
                }
              />
            </div>
            {[
              ["inspectionProcess", "Current inspection/reporting process"],
              ["commonBreakdowns", "Common breakdowns"],
              ["diagnosticDelays", "Diagnostic delays"],
              ["repeatRepairs", "Repeat repairs"],
              ["downtimeImpact", "Downtime impact"],
              ["communicationGaps", "Communication gaps"],
              ["documentationGaps", "Maintenance documentation gaps"],
              ["currentWorkaround", "Current workaround"],
            ].map(([key, label]) => (
              <div className="flex flex-col gap-2" key={key}>
                <Label>{label}</Label>
                <Textarea
                  rows={2}
                  value={String(discoveryDraft[key as keyof SalesDiscoveryWorkflow] ?? "")}
                  onChange={(event) =>
                    updateDiscoveryField(
                      key as keyof SalesDiscoveryWorkflow,
                      event.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Decision maker"
                value={discoveryDraft.decisionMaker ?? ""}
                onChange={(event) =>
                  updateDiscoveryField("decisionMaker", event.target.value)
                }
              />
              <Input
                placeholder="Budget owner"
                value={discoveryDraft.budgetOwner ?? ""}
                onChange={(event) =>
                  updateDiscoveryField("budgetOwner", event.target.value)
                }
              />
              <Select
                value={discoveryDraft.urgency}
                onValueChange={(value) =>
                  updateDiscoveryField(
                    "urgency",
                    value as SalesDiscoveryWorkflow["urgency"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {["Low", "Medium", "High", "Critical"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={discoveryDraft.willingnessToPilot}
                onValueChange={(value) =>
                  updateDiscoveryField(
                    "willingnessToPilot",
                    value as SalesDiscoveryWorkflow["willingnessToPilot"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Willingness to pilot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {["Yes", "No", "Maybe"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={discoveryDraft.supportLetterPotential}
                onValueChange={(value) =>
                  updateDiscoveryField(
                    "supportLetterPotential",
                    value as SalesDiscoveryWorkflow["supportLetterPotential"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Support letter potential" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {["Low", "Medium", "High"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={discoveryDraft.paidConversionLikelihood}
                onValueChange={(value) =>
                  updateDiscoveryField(
                    "paidConversionLikelihood",
                    value as SalesDiscoveryWorkflow["paidConversionLikelihood"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Paid conversion likelihood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {["Low", "Medium", "High"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {[
              ["preferredPilotScope", "Preferred pilot scope"],
              ["successCriteria", "Success criteria"],
              ["timeline", "Timeline"],
              ["objections", "Objections"],
              ["availableDataSources", "Available data sources"],
            ].map(([key, label]) => (
              <div className="flex flex-col gap-2" key={key}>
                <Label>{label}</Label>
                <Textarea
                  rows={2}
                  value={String(discoveryDraft[key as keyof SalesDiscoveryWorkflow] ?? "")}
                  onChange={(event) =>
                    updateDiscoveryField(
                      key as keyof SalesDiscoveryWorkflow,
                      event.target.value
                    )
                  }
                />
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <Label>Recommended stage after completion</Label>
              <Select
                value={discoveryDraft.recommendedStageTransition}
                onValueChange={(value) =>
                  updateDiscoveryField(
                    "recommendedStageTransition",
                    value as SalesPipelineStage
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SALES_PIPELINE_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {discoveryDraft.summary ? (
              <div className="rounded-lg bg-slate-950 p-4 text-xs leading-5 text-white">
                <pre className="whitespace-pre-wrap">{discoveryDraft.summary}</pre>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => handleSaveDiscovery(false)}>
            Save discovery
          </Button>
          <Button
            className="bg-[#9d4300] text-white hover:bg-orange-600"
            onClick={() => handleSaveDiscovery(true)}
          >
            Complete discovery
          </Button>
        </div>
      </section>
    </div>
  );
}
