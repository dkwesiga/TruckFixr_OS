"use client";

import { useMemo } from "react";
import { ArrowRightIcon, CheckCircleIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildSalesActivityFeed,
  buildSalesCockpitAlerts,
  getSalesFinalMetrics,
  type SalesActivityItem,
  type SalesCockpitAlert,
} from "@/lib/sales-activity";
import {
  markHandoffCompleted,
  writeSalesHandoffToTarget,
} from "@/lib/sales-handoffs";
import { type Prospect, type SalesHandoff } from "@/lib/types";
import { cn } from "@/lib/utils";

type SalesFinalPolishPanelProps = {
  prospects: Prospect[];
  selectedProspectId: string | null;
  onSelectProspect: (id: string) => void;
  onUpdateProspect: (prospect: Prospect, updates: Partial<Prospect>) => void;
};

const handoffStatuses: SalesHandoff["status"][] = [
  "Draft",
  "Reviewed",
  "Accepted",
  "Completed",
  "Rejected",
];

const activityColors: Record<SalesActivityItem["type"], string> = {
  Stage: "bg-slate-100 text-slate-700",
  Outreach: "bg-orange-50 text-orange-700",
  Discovery: "bg-green-50 text-green-700",
  Proposal: "bg-indigo-50 text-indigo-700",
  Pilot: "bg-emerald-50 text-emerald-700",
  "Lost/Nurture": "bg-red-50 text-red-700",
  Referral: "bg-cyan-50 text-cyan-700",
  Handoff: "bg-purple-50 text-purple-700",
};

const alertColors: Record<SalesCockpitAlert["severity"], string> = {
  Critical: "border-red-300 bg-red-50 text-red-900",
  High: "border-orange-300 bg-orange-50 text-orange-900",
  Medium: "border-yellow-300 bg-yellow-50 text-yellow-900",
  Low: "border-slate-300 bg-slate-50 text-slate-800",
};

function timeAgo(dateValue: string) {
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return "date unknown";
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 48) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function SalesFinalPolishPanel({
  prospects,
  selectedProspectId,
  onSelectProspect,
  onUpdateProspect,
}: SalesFinalPolishPanelProps) {
  const metrics = useMemo(() => getSalesFinalMetrics(prospects), [prospects]);
  const activity = useMemo(() => buildSalesActivityFeed(prospects), [prospects]);
  const alerts = useMemo(() => buildSalesCockpitAlerts(prospects), [prospects]);
  const handoffRows = useMemo(
    () =>
      prospects.flatMap((prospect) =>
        (prospect.handoffs ?? []).map((handoff) => ({
          prospect,
          handoff,
        }))
      ),
    [prospects]
  );

  function updateHandoffStatus(
    prospect: Prospect,
    handoffId: string,
    status: SalesHandoff["status"]
  ) {
    onUpdateProspect(prospect, {
      handoffs: (prospect.handoffs ?? []).map((handoff) =>
        handoff.id === handoffId
          ? { ...handoff, status, updatedAt: new Date().toISOString() }
          : handoff
      ),
    });
  }

  function writeThrough(prospect: Prospect, handoff: SalesHandoff) {
    if (handoff.status !== "Accepted") {
      toast.warning("Accept the handoff before writing it into another module.");
      return;
    }

    const result = writeSalesHandoffToTarget(prospect, handoff);
    onUpdateProspect(prospect, {
      handoffs: (prospect.handoffs ?? []).map((currentHandoff) =>
        currentHandoff.id === handoff.id
          ? markHandoffCompleted(currentHandoff, result)
          : currentHandoff
      ),
      nextAction: `Review created ${result.createdType}: ${result.title}`,
    });
    toast[result.wasDuplicate ? "info" : "success"](
      result.wasDuplicate
        ? `Linked existing ${result.createdType}.`
        : `Created ${result.createdType}.`
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Follow-ups due", metrics.followUpsDueToday, "Manual follow-up steps due today or overdue"],
          ["Drafts need review", metrics.draftsNeedingApproval, "Outreach drafts not approved or rejected"],
          ["Consent blocked", metrics.consentBlockedProspects, "Do-not-contact, unsubscribed, or blocked consent"],
          ["Accepted handoffs", metrics.handoffsReadyToWrite, "Ready for write-through into other modules"],
          ["Pending proposals", metrics.proposalsPending, "Draft, sent, revised, or needs-review proposals"],
          ["Active pilots", metrics.activePilots, "Prospects currently in Pilot Active"],
          ["Nurture due", metrics.nurtureCheckInsDue, "Nurture check-ins due today or overdue"],
        ].map(([label, value, note]) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            key={label}
          >
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-[#e0c0b1] bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[#584237]">
              Founder Cockpit Alerts
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">
              Highest-leverage Sales risks today
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            Rule-based signals only. No external API calls.
          </p>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {alerts.length ? (
            alerts.map((alert) => (
              <button
                className={cn(
                  "min-h-11 rounded-lg border p-4 text-left shadow-sm",
                  alertColors[alert.severity]
                )}
                key={alert.id}
                onClick={() => onSelectProspect(alert.prospectId)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-white/80 px-2 py-1 text-xs font-bold">
                    {alert.severity}
                  </span>
                  <span className="text-sm font-bold">{alert.companyName}</span>
                </div>
                <p className="mt-3 font-bold">{alert.title}</p>
                <p className="mt-1 text-sm leading-5">{alert.detail}</p>
                <p className="mt-2 text-xs font-bold uppercase">
                  {alert.recommendedAction}
                </p>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600 xl:col-span-2">
              No urgent cockpit alerts. Keep prospect stages, follow-ups, consent,
              proposals, and pilot health current to maintain this view.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.25fr]">
        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Activity Timeline
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">
                Last 20 Sales events
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {activity.length ? (
              activity.map((item) => (
                <button
                  className="flex min-h-11 w-full items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-orange-200 hover:bg-orange-50"
                  key={item.id}
                  onClick={() => onSelectProspect(item.prospectId)}
                >
                  <span
                    className={cn(
                      "mt-0.5 rounded px-2 py-1 text-xs font-bold",
                      activityColors[item.type]
                    )}
                  >
                    {item.type}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-950">
                      {item.companyName}
                    </span>
                    <span className="block text-sm text-slate-700">{item.label}</span>
                    {item.detail ? (
                      <span className="mt-1 line-clamp-2 block text-xs text-slate-500">
                        {item.detail}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {timeAgo(item.date)}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                No Sales workflow activity yet.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-[#e0c0b1] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#584237]">
                Cross-Module Write-Through
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">
                Accepted Sales handoffs
              </h3>
            </div>
            <p className="max-w-md text-sm text-slate-600">
              Creates draft records only. No publishing, API calls, emails, commits,
              or submissions.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {handoffRows.length ? (
              handoffRows.map(({ prospect, handoff }) => (
                <article
                  className={cn(
                    "rounded-lg border p-4",
                    selectedProspectId === prospect.id
                      ? "border-orange-300 bg-orange-50"
                      : "border-slate-200 bg-slate-50"
                  )}
                  key={handoff.id}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-white px-2 py-1 text-xs font-bold text-slate-700">
                          {handoff.target}
                        </span>
                        <span className="rounded bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">
                          {handoff.outputType}
                        </span>
                      </div>
                      <p className="mt-3 font-bold text-slate-950">
                        {prospect.companyName}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{handoff.trigger}</p>
                      {handoff.notes ? (
                        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">
                          {handoff.notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-2">
                      <Select
                        value={handoff.status}
                        onValueChange={(value) =>
                          updateHandoffStatus(
                            prospect,
                            handoff.id,
                            value as SalesHandoff["status"]
                          )
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {handoffStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        className="min-h-11 bg-[#9d4300] text-white hover:bg-orange-600"
                        disabled={handoff.status !== "Accepted"}
                        onClick={() => writeThrough(prospect, handoff)}
                      >
                        <ExternalLinkIcon data-icon="inline-start" />
                        Write to module
                      </Button>
                      <Button
                        className="min-h-11"
                        variant="outline"
                        onClick={() => onSelectProspect(prospect.id)}
                      >
                        Select prospect
                        <ArrowRightIcon data-icon="inline-end" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                No handoff prompts yet. Generate handoffs from the Lost/Nurture or
                Intelligence tabs, then mark the ones you trust as Accepted.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="mt-0.5 size-5 text-green-700" />
          <div>
            <p className="font-bold text-slate-950">Safety guardrails remain active</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Cross-module write-through creates internal draft records only. It does
              not send messages, post content, submit grants, call GitHub, or modify
              production systems. Dickson still reviews every output before use.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
