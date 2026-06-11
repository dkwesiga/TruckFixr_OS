"use client";

import { useEffect, useMemo, useState } from "react";
import { FileTextIcon, HandshakeIcon, PlusIcon, SaveIcon, SendToBackIcon } from "lucide-react";

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
  buildReferralSummary,
  countReferralMetrics,
  createEmptyReferral,
  generateReferralOutreachPrompt,
  REFERRAL_STATUSES,
  SALES_PARTNER_TYPES,
  syncReferralToPartnership,
} from "@/lib/sales-referrals";
import { type Prospect, type SalesPartnerReferral } from "@/lib/types";

type PartnersReferralsWorkflowProps = {
  prospects: Prospect[];
  selectedProspectId: string | null;
  onSelectProspect: (id: string) => void;
  onUpdateProspect: (prospect: Prospect, updates: Partial<Prospect>) => void;
};

function numberOrUndefined(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function PartnersReferralsWorkflow({
  prospects,
  selectedProspectId,
  onSelectProspect,
  onUpdateProspect,
}: PartnersReferralsWorkflowProps) {
  const selectedProspect = useMemo(() => {
    return (
      prospects.find((prospect) => prospect.id === selectedProspectId) ??
      prospects[0] ??
      null
    );
  }, [prospects, selectedProspectId]);
  const metrics = useMemo(() => countReferralMetrics(prospects), [prospects]);
  const [referralDraft, setReferralDraft] =
    useState<SalesPartnerReferral | null>(null);
  const [editingReferralId, setEditingReferralId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!selectedProspect) return;

    const firstReferral = selectedProspect.partnerReferrals?.[0];
    setReferralDraft(firstReferral ?? createEmptyReferral(selectedProspect));
    setEditingReferralId(firstReferral?.id ?? null);
    setSummary(
      firstReferral ? buildReferralSummary(selectedProspect, firstReferral) : ""
    );
    setPrompt(
      firstReferral
        ? generateReferralOutreachPrompt(selectedProspect, firstReferral)
        : ""
    );
  }, [selectedProspect]);

  if (!selectedProspect || !referralDraft) {
    return (
      <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-white p-5">
        <p className="font-bold text-slate-950">No prospect selected</p>
        <p className="mt-2 text-sm text-slate-600">
          Add or import a prospect before tracking referrals.
        </p>
      </div>
    );
  }

  const referrals = selectedProspect.partnerReferrals ?? [];

  function updateReferral<K extends keyof SalesPartnerReferral>(
    key: K,
    value: SalesPartnerReferral[K]
  ) {
    setReferralDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function normalizeReferral(referral: SalesPartnerReferral): SalesPartnerReferral {
    return {
      ...referral,
      partnerName: referral.partnerName.trim(),
      company: normalizeOptional(referral.company),
      partnerType: normalizeOptional(referral.partnerType),
      contactPerson: normalizeOptional(referral.contactPerson),
      email: normalizeOptional(referral.email),
      phone: normalizeOptional(referral.phone),
      linkedinUrl: normalizeOptional(referral.linkedinUrl),
      notes: normalizeOptional(referral.notes),
      lastContactDate: normalizeOptional(referral.lastContactDate),
      nextFollowUpDate: normalizeOptional(referral.nextFollowUpDate),
      referredProspect: normalizeOptional(referral.referredProspect),
      referralDate: normalizeOptional(referral.referralDate),
      outcome: normalizeOptional(referral.outcome),
      partnerNotes: normalizeOptional(referral.partnerNotes),
      rdFundingValueGenerated: normalizeOptional(referral.rdFundingValueGenerated),
    };
  }

  function saveReferral(syncToPartnership = false) {
    if (!selectedProspect || !referralDraft) return;
    if (!referralDraft.partnerName.trim()) return;

    let nextReferral = normalizeReferral(referralDraft);

    if (syncToPartnership) {
      const partnership = syncReferralToPartnership(nextReferral);
      nextReferral = {
        ...nextReferral,
        linkedPartnershipId: partnership.id,
      };
    }

    const nextReferrals = editingReferralId
      ? referrals.map((item) =>
          item.id === editingReferralId ? nextReferral : item
        )
      : [nextReferral, ...referrals];

    onUpdateProspect(selectedProspect, {
      partnerReferrals: nextReferrals,
      leadSource: selectedProspect.leadSource || "Partner referral",
      referrerName: nextReferral.partnerName,
      referrerCompany: nextReferral.company,
      nextAction:
        nextReferral.nextFollowUpDate
          ? `Follow up with ${nextReferral.partnerName} on ${nextReferral.nextFollowUpDate}.`
          : "Follow up with referral partner.",
    });
    setEditingReferralId(nextReferral.id);
    setSummary(buildReferralSummary(selectedProspect, nextReferral));
    setPrompt(generateReferralOutreachPrompt(selectedProspect, nextReferral));
  }

  function startNewReferral() {
    setReferralDraft(createEmptyReferral(selectedProspect));
    setEditingReferralId(null);
    setSummary("");
    setPrompt("");
  }

  function editReferral(referral: SalesPartnerReferral) {
    setReferralDraft(referral);
    setEditingReferralId(referral.id);
    setSummary(buildReferralSummary(selectedProspect, referral));
    setPrompt(generateReferralOutreachPrompt(selectedProspect, referral));
  }

  function deleteReferral(id: string) {
    onUpdateProspect(selectedProspect, {
      partnerReferrals: referrals.filter((referral) => referral.id !== id),
    });
    startNewReferral();
  }

  function regenerateOutputs() {
    if (!selectedProspect || !referralDraft) return;

    setSummary(buildReferralSummary(selectedProspect, referralDraft));
    setPrompt(generateReferralOutreachPrompt(selectedProspect, referralDraft));
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
              Track referral partners tied to this prospect and optionally sync
              the relationship into the Partnership Agent.
            </p>
          </div>
          <div className="grid gap-2 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900 sm:grid-cols-2">
            <p className="text-sm font-bold">Partners: {metrics.totalPartners}</p>
            <p className="text-sm font-bold">Referrals: {metrics.referralsMade}</p>
            <p className="text-sm font-bold">
              Discovery: {metrics.discoveryCallsBooked}
            </p>
            <p className="text-sm font-bold">Pilots: {metrics.pilotsStarted}</p>
            <p className="text-sm font-bold">
              Paid won: {metrics.paidCustomersWon}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <HandshakeIcon className="size-5 text-orange-600" />
              <div>
                <p className="text-xs font-bold uppercase text-[#584237]">
                  Referral Records
                </p>
                <h4 className="text-lg font-bold text-slate-950">
                  Prospect-linked partners
                </h4>
              </div>
            </div>
            <Button variant="outline" onClick={startNewReferral}>
              <PlusIcon data-icon="inline-start" />
              New referral
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {referrals.length ? (
              referrals.map((referral) => (
                <article
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  key={referral.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">
                        {referral.partnerName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {referral.partnerType ?? "Referral Partner"} -{" "}
                        {referral.referralStatus ?? "Identified"}
                      </p>
                    </div>
                    {referral.linkedPartnershipId ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                        Synced
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {referral.contactPerson || referral.email || "No contact set"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => editReferral(referral)}>
                      Edit
                    </Button>
                    <Button
                      className="border-red-200 text-red-700"
                      size="sm"
                      variant="outline"
                      onClick={() => deleteReferral(referral.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                No referral records yet.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Referral Editor
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-950">
            {editingReferralId ? "Edit referral" : "Add referral"}
          </h4>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Partner name"
              value={referralDraft.partnerName}
              onChange={(event) => updateReferral("partnerName", event.target.value)}
            />
            <Input
              placeholder="Company"
              value={referralDraft.company ?? ""}
              onChange={(event) => updateReferral("company", event.target.value)}
            />
            <div className="flex flex-col gap-2">
              <Label>Partner type</Label>
              <Select
                value={referralDraft.partnerType}
                onValueChange={(value) => updateReferral("partnerType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SALES_PARTNER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Referral status</Label>
              <Select
                value={referralDraft.referralStatus}
                onValueChange={(value) =>
                  updateReferral(
                    "referralStatus",
                    value as SalesPartnerReferral["referralStatus"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {REFERRAL_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Contact person"
              value={referralDraft.contactPerson ?? ""}
              onChange={(event) => updateReferral("contactPerson", event.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={referralDraft.email ?? ""}
              onChange={(event) => updateReferral("email", event.target.value)}
            />
            <Input
              placeholder="Phone"
              value={referralDraft.phone ?? ""}
              onChange={(event) => updateReferral("phone", event.target.value)}
            />
            <Input
              placeholder="LinkedIn URL"
              value={referralDraft.linkedinUrl ?? ""}
              onChange={(event) => updateReferral("linkedinUrl", event.target.value)}
            />
            <Input
              placeholder="Referred prospect"
              value={referralDraft.referredProspect ?? ""}
              onChange={(event) =>
                updateReferral("referredProspect", event.target.value)
              }
            />
            <Input
              type="date"
              value={referralDraft.referralDate ?? ""}
              onChange={(event) => updateReferral("referralDate", event.target.value)}
            />
            <Input
              type="date"
              value={referralDraft.lastContactDate ?? ""}
              onChange={(event) =>
                updateReferral("lastContactDate", event.target.value)
              }
            />
            <Input
              type="date"
              value={referralDraft.nextFollowUpDate ?? ""}
              onChange={(event) =>
                updateReferral("nextFollowUpDate", event.target.value)
              }
            />
            <Input
              placeholder="Estimated value"
              type="number"
              value={referralDraft.estimatedValue ?? ""}
              onChange={(event) =>
                updateReferral("estimatedValue", numberOrUndefined(event.target.value))
              }
            />
            <Input
              placeholder="R&D/funding value generated"
              value={referralDraft.rdFundingValueGenerated ?? ""}
              onChange={(event) =>
                updateReferral("rdFundingValueGenerated", event.target.value)
              }
            />
            {[
              ["referralsMade", "Referrals made"],
              ["discoveryCallsBooked", "Discovery calls booked"],
              ["pilotsStarted", "Pilots started"],
              ["paidCustomersWon", "Paid customers won"],
            ].map(([key, label]) => (
              <Input
                key={key}
                placeholder={label}
                type="number"
                value={referralDraft[key as keyof SalesPartnerReferral] as number | undefined ?? ""}
                onChange={(event) =>
                  updateReferral(
                    key as keyof SalesPartnerReferral,
                    numberOrUndefined(event.target.value) as never
                  )
                }
              />
            ))}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Outcome</Label>
              <Textarea
                rows={2}
                value={referralDraft.outcome ?? ""}
                onChange={(event) => updateReferral("outcome", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Partner notes</Label>
              <Textarea
                rows={3}
                value={referralDraft.partnerNotes ?? ""}
                onChange={(event) =>
                  updateReferral("partnerNotes", event.target.value)
                }
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={regenerateOutputs}>
              Preview prompt
            </Button>
            <Button variant="outline" onClick={() => saveReferral(true)}>
              <SendToBackIcon data-icon="inline-start" />
              Save + sync Partnership
            </Button>
            <Button
              className="bg-[#9d4300] text-white hover:bg-orange-600"
              onClick={() => saveReferral(false)}
            >
              <SaveIcon data-icon="inline-start" />
              Save referral
            </Button>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-5 text-orange-600" />
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Referral Summary
              </p>
              <h4 className="text-lg font-bold text-slate-950">
                Partner value record
              </h4>
            </div>
          </div>
          <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-xs leading-5 text-white">
            {summary || "Save or preview a referral to generate a summary."}
          </pre>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <p className="text-xs font-bold uppercase text-[#584237]">
            Partner Outreach Prompt
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-950">
            Copy-ready prompt for manual drafting
          </h4>
          <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-xs leading-5 text-white">
            {prompt || "Save or preview a referral to generate a prompt."}
          </pre>
        </article>
      </section>
    </div>
  );
}
