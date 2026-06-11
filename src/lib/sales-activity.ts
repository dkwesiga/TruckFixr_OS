import { getProspectStage } from "@/lib/sales-workflow";
import { type Prospect } from "@/lib/types";

export type SalesActivityItem = {
  id: string;
  prospectId: string;
  companyName: string;
  type:
    | "Stage"
    | "Outreach"
    | "Discovery"
    | "Proposal"
    | "Pilot"
    | "Lost/Nurture"
    | "Referral"
    | "Handoff";
  label: string;
  detail?: string;
  date: string;
};

export type SalesFinalMetrics = {
  followUpsDueToday: number;
  draftsNeedingApproval: number;
  consentBlockedProspects: number;
  proposalsPending: number;
  activePilots: number;
  nurtureCheckInsDue: number;
  handoffsReadyToWrite: number;
};

export type SalesCockpitAlert = {
  id: string;
  prospectId: string;
  companyName: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  detail: string;
  recommendedAction: string;
};

const severityWeight: Record<SalesCockpitAlert["severity"], number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function isTodayOrPast(dateValue?: string) {
  if (!dateValue) return false;
  const value = new Date(`${dateValue}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return Number.isFinite(value) && value <= today.getTime();
}

function daysSince(dateValue?: string) {
  if (!dateValue) return Infinity;
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return Infinity;
  return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
}

function pushAlert(
  alerts: SalesCockpitAlert[],
  prospect: Prospect,
  input: Omit<SalesCockpitAlert, "prospectId" | "companyName">
) {
  alerts.push({
    ...input,
    prospectId: prospect.id,
    companyName: prospect.companyName,
  });
}

function pushActivity(
  items: SalesActivityItem[],
  prospect: Prospect,
  input: Omit<SalesActivityItem, "prospectId" | "companyName">
) {
  if (!input.date) return;
  items.push({
    ...input,
    prospectId: prospect.id,
    companyName: prospect.companyName,
  });
}

export function getSalesFinalMetrics(prospects: Prospect[]): SalesFinalMetrics {
  return prospects.reduce<SalesFinalMetrics>(
    (metrics, prospect) => {
      const followUpsDue = (prospect.followUpSequence ?? []).some(
        (step) =>
          step.status !== "completed" &&
          step.status !== "dismissed" &&
          isTodayOrPast(step.dueDate)
      );
      const needsApproval = (prospect.outreachDrafts ?? []).filter(
        (draft) =>
          draft.status !== "Archived" &&
          draft.approvalStatus !== "Approved" &&
          draft.approvalStatus !== "Rejected"
      ).length;
      const blocked =
        prospect.doNotContact ||
        prospect.unsubscribeStatus ||
        prospect.consentStatus === "unsubscribed" ||
        prospect.consentStatus === "do_not_contact";
      const proposalPending =
        prospect.pilotProposal?.status === "Draft" ||
        prospect.pilotProposal?.status === "Sent" ||
        prospect.pilotProposal?.status === "Needs Review" ||
        prospect.pilotProposal?.status === "Revised";
      const nurtureDue =
        getProspectStage(prospect) === "Nurture" &&
        isTodayOrPast(prospect.lossNurture?.nextCheckInDate);

      return {
        followUpsDueToday: metrics.followUpsDueToday + (followUpsDue ? 1 : 0),
        draftsNeedingApproval: metrics.draftsNeedingApproval + needsApproval,
        consentBlockedProspects:
          metrics.consentBlockedProspects + (blocked ? 1 : 0),
        proposalsPending: metrics.proposalsPending + (proposalPending ? 1 : 0),
        activePilots:
          metrics.activePilots + (getProspectStage(prospect) === "Pilot Active" ? 1 : 0),
        nurtureCheckInsDue:
          metrics.nurtureCheckInsDue + (nurtureDue ? 1 : 0),
        handoffsReadyToWrite:
          metrics.handoffsReadyToWrite +
          (prospect.handoffs ?? []).filter((handoff) => handoff.status === "Accepted")
            .length,
      };
    },
    {
      followUpsDueToday: 0,
      draftsNeedingApproval: 0,
      consentBlockedProspects: 0,
      proposalsPending: 0,
      activePilots: 0,
      nurtureCheckInsDue: 0,
      handoffsReadyToWrite: 0,
    }
  );
}

export function buildSalesActivityFeed(
  prospects: Prospect[],
  limit = 20
): SalesActivityItem[] {
  const items: SalesActivityItem[] = [];

  prospects.forEach((prospect) => {
    pushActivity(items, prospect, {
      id: `${prospect.id}_stage_${prospect.stageChangedDate ?? prospect.updatedDate}`,
      type: "Stage",
      label: `Stage: ${getProspectStage(prospect)}`,
      detail: prospect.stageNotes,
      date: prospect.stageChangedDate ?? prospect.updatedDate,
    });

    (prospect.outreachDrafts ?? []).forEach((draft) => {
      pushActivity(items, prospect, {
        id: `${prospect.id}_draft_${draft.id}`,
        type: "Outreach",
        label:
          draft.status === "Sent"
            ? `Manually marked sent: ${draft.draftType}`
            : `Draft created: ${draft.draftType}`,
        detail: draft.approvalStatus,
        date: draft.manuallyMarkedSentDate ?? draft.generatedAt,
      });
    });

    if (prospect.discoveryWorkflow?.completedAt) {
      pushActivity(items, prospect, {
        id: `${prospect.id}_discovery`,
        type: "Discovery",
        label: "Discovery completed",
        detail: prospect.discoveryWorkflow.summary,
        date: prospect.discoveryWorkflow.completedAt,
      });
    }

    if (prospect.pilotProposal?.createdAt) {
      pushActivity(items, prospect, {
        id: `${prospect.id}_proposal`,
        type: "Proposal",
        label: `Pilot proposal ${prospect.pilotProposal.status.toLowerCase()}`,
        detail: prospect.pilotProposal.pilotObjective,
        date: prospect.pilotProposal.updatedAt ?? prospect.pilotProposal.createdAt,
      });
    }

    if (prospect.pilotHealth?.lastActivityDate) {
      pushActivity(items, prospect, {
        id: `${prospect.id}_pilot_health`,
        type: "Pilot",
        label: `Pilot health: ${prospect.pilotHealth.healthStatus}`,
        detail:
          prospect.pilotHealth.featureRequests ||
          prospect.pilotHealth.objectionsConcerns ||
          prospect.pilotHealth.fleetManagerFeedback,
        date: prospect.pilotHealth.lastActivityDate,
      });
    }

    if (prospect.lossNurture && prospect.updatedDate) {
      pushActivity(items, prospect, {
        id: `${prospect.id}_loss_nurture`,
        type: "Lost/Nurture",
        label: `Loss/nurture: ${prospect.lossNurture.reason ?? "Review needed"}`,
        detail:
          prospect.lossNurture.mainObjection ||
          prospect.lossNurture.futureTrigger ||
          prospect.lossNurture.recommendedNurtureSequence,
        date: prospect.updatedDate,
      });
    }

    (prospect.partnerReferrals ?? []).forEach((referral) => {
      pushActivity(items, prospect, {
        id: `${prospect.id}_referral_${referral.id}`,
        type: "Referral",
        label: `Referral: ${referral.referralStatus}`,
        detail: referral.partnerName,
        date:
          referral.nextFollowUpDate ??
          referral.lastContactDate ??
          referral.referralDate ??
          prospect.updatedDate,
      });
    });

    (prospect.handoffs ?? []).forEach((handoff) => {
      pushActivity(items, prospect, {
        id: `${prospect.id}_handoff_${handoff.id}`,
        type: "Handoff",
        label: `${handoff.target}: ${handoff.status}`,
        detail: handoff.outputType,
        date: handoff.updatedAt,
      });
    });
  });

  return items
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function buildSalesCockpitAlerts(
  prospects: Prospect[],
  limit = 12
): SalesCockpitAlert[] {
  const alerts: SalesCockpitAlert[] = [];

  prospects.forEach((prospect) => {
    const stage = getProspectStage(prospect);
    const hasOpenDrafts = (prospect.outreachDrafts ?? []).some(
      (draft) => draft.status !== "Archived" && draft.status !== "Sent"
    );
    const blocked =
      prospect.doNotContact ||
      prospect.unsubscribeStatus ||
      prospect.consentStatus === "unsubscribed" ||
      prospect.consentStatus === "do_not_contact";

    if (blocked && hasOpenDrafts) {
      pushAlert(alerts, prospect, {
        id: `${prospect.id}_consent_block`,
        severity: "Critical",
        title: "Consent blocker with active drafts",
        detail:
          "This prospect has do-not-contact, unsubscribe, or blocked consent status while outreach drafts still exist.",
        recommendedAction:
          "Do not send. Archive drafts or resolve consent before any outreach.",
      });
    }

    const overdueSteps = (prospect.followUpSequence ?? []).filter(
      (step) =>
        step.status !== "completed" &&
        step.status !== "dismissed" &&
        isTodayOrPast(step.dueDate)
    );

    if (overdueSteps.length) {
      pushAlert(alerts, prospect, {
        id: `${prospect.id}_followups_due`,
        severity: overdueSteps.length >= 3 ? "High" : "Medium",
        title: `${overdueSteps.length} follow-up step${
          overdueSteps.length === 1 ? "" : "s"
        } due`,
        detail: overdueSteps.map((step) => step.stepName).join(", "),
        recommendedAction:
          "Review the sequence, complete the step manually, or dismiss it with notes.",
      });
    }

    const acceptedHandoffs = (prospect.handoffs ?? []).filter(
      (handoff) => handoff.status === "Accepted"
    );

    if (acceptedHandoffs.length) {
      pushAlert(alerts, prospect, {
        id: `${prospect.id}_accepted_handoffs`,
        severity: "High",
        title: "Accepted handoff ready to write",
        detail: acceptedHandoffs
          .map((handoff) => `${handoff.target}: ${handoff.outputType}`)
          .join(", "),
        recommendedAction:
          "Use the Handoffs tab to create draft records in the target modules.",
      });
    }

    if (
      prospect.pilotProposal &&
      ["Draft", "Needs Review", "Sent", "Revised"].includes(
        prospect.pilotProposal.status
      )
    ) {
      pushAlert(alerts, prospect, {
        id: `${prospect.id}_proposal_pending`,
        severity: prospect.pilotProposal.status === "Sent" ? "High" : "Medium",
        title: `Pilot proposal ${prospect.pilotProposal.status.toLowerCase()}`,
        detail:
          prospect.pilotProposal.nextSteps ||
          prospect.pilotProposal.pilotObjective ||
          "Proposal needs a clear next action.",
        recommendedAction:
          "Confirm owner, next review date, and whether a follow-up sequence is needed.",
      });
    }

    if (stage === "Pilot Active" && daysSince(prospect.pilotHealth?.lastActivityDate) > 7) {
      pushAlert(alerts, prospect, {
        id: `${prospect.id}_pilot_stale`,
        severity: "High",
        title: "Active pilot has no recent health update",
        detail:
          "Pilot health has not been updated in more than 7 days or has no activity date.",
        recommendedAction:
          "Update pilot health, record feedback, and confirm the next pilot success action.",
      });
    }

    if ((prospect.outreachCount30Days ?? 0) >= 5) {
      pushAlert(alerts, prospect, {
        id: `${prospect.id}_outreach_volume`,
        severity: "Medium",
        title: "High outreach volume",
        detail: `${prospect.outreachCount30Days ?? 0} outreach touches are recorded in the last 30 days.`,
        recommendedAction:
          "Pause, move to nurture, or wait until the next allowed outreach date.",
      });
    }

    if (prospect.stalled) {
      pushAlert(alerts, prospect, {
        id: `${prospect.id}_stalled`,
        severity: prospect.priority === "Critical" ? "High" : "Medium",
        title: "Prospect marked stalled",
        detail: prospect.stalledReason || "No stalled reason recorded.",
        recommendedAction:
          "Update stalled reason, assign a next owner/date, or move the prospect to nurture/lost.",
      });
    }
  });

  return alerts
    .sort((a, b) => {
      const severityDelta = severityWeight[b.severity] - severityWeight[a.severity];
      if (severityDelta !== 0) return severityDelta;
      return a.companyName.localeCompare(b.companyName);
    })
    .slice(0, limit);
}
