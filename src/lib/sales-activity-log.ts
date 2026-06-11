import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import {
  type Prospect,
  type SalesActivityLog,
  type SalesPipelineStage,
} from "@/lib/types";

const MAX_SALES_ACTIVITY_LOGS = 250;

function createActivityId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `sales_activity_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getSalesActivityLogs(): SalesActivityLog[] {
  return getItem<SalesActivityLog[]>(STORAGE_KEYS.SALES_ACTIVITY_LOGS) ?? [];
}

export function saveSalesActivityLogs(logs: SalesActivityLog[]): void {
  setItem(STORAGE_KEYS.SALES_ACTIVITY_LOGS, logs.slice(0, MAX_SALES_ACTIVITY_LOGS));
}

export function addSalesActivityLog(
  input: Omit<SalesActivityLog, "id" | "createdAt">
): SalesActivityLog {
  const log: SalesActivityLog = {
    ...input,
    id: createActivityId(),
    createdAt: new Date().toISOString(),
  };

  saveSalesActivityLogs([log, ...getSalesActivityLogs()]);
  return log;
}

export function logStageChange(
  prospect: Prospect,
  stage: SalesPipelineStage
): SalesActivityLog {
  return addSalesActivityLog({
    prospectId: prospect.id,
    companyName: prospect.companyName,
    eventType: "stage_changed",
    title: `Moved to ${stage}`,
    detail: prospect.stageNotes,
  });
}

function latestDraftMarkedSent(prospect: Prospect, updates: Partial<Prospect>) {
  const previousSentIds = new Set(
    (prospect.outreachDrafts ?? [])
      .filter((draft) => draft.manuallyMarkedSentDate || draft.status === "Sent")
      .map((draft) => draft.id)
  );

  return (updates.outreachDrafts ?? []).find(
    (draft) =>
      !previousSentIds.has(draft.id) &&
      (draft.manuallyMarkedSentDate || draft.status === "Sent")
  );
}

function hasNewDrafts(prospect: Prospect, updates: Partial<Prospect>) {
  const existingIds = new Set((prospect.outreachDrafts ?? []).map((draft) => draft.id));
  return (updates.outreachDrafts ?? []).some((draft) => !existingIds.has(draft.id));
}

function hasNewCompletedHandoff(prospect: Prospect, updates: Partial<Prospect>) {
  const previousCompletedIds = new Set(
    (prospect.handoffs ?? [])
      .filter((handoff) => handoff.status === "Completed")
      .map((handoff) => handoff.id)
  );

  return (updates.handoffs ?? []).find(
    (handoff) =>
      handoff.status === "Completed" && !previousCompletedIds.has(handoff.id)
  );
}

export function inferSalesActivityLogs(
  prospect: Prospect,
  updates: Partial<Prospect>
): Array<Omit<SalesActivityLog, "id" | "createdAt">> {
  const logs: Array<Omit<SalesActivityLog, "id" | "createdAt">> = [];
  const base = {
    prospectId: prospect.id,
    companyName: prospect.companyName,
  };

  if (updates.currentStage && updates.currentStage !== prospect.currentStage) {
    logs.push({
      ...base,
      eventType: "stage_changed",
      title: `Moved to ${updates.currentStage}`,
      detail: updates.stageNotes ?? updates.nextAction,
    });
  }

  if (
    updates.discoveryWorkflow?.completedAt &&
    updates.discoveryWorkflow.completedAt !== prospect.discoveryWorkflow?.completedAt
  ) {
    logs.push({
      ...base,
      eventType: "discovery_completed",
      title: "Discovery workflow completed",
      detail: updates.discoveryWorkflow.summary,
    });
  }

  if (updates.pilotProposal) {
    logs.push({
      ...base,
      eventType:
        updates.pilotProposal.status === "Accepted" ||
        updates.pilotProposal.status === "Rejected"
          ? "proposal_decided"
          : "proposal_updated",
      title: `Pilot proposal ${updates.pilotProposal.status.toLowerCase()}`,
      detail: updates.pilotProposal.nextSteps,
    });
  }

  if (updates.pilotHealth) {
    logs.push({
      ...base,
      eventType: "pilot_health_updated",
      title: `Pilot health: ${updates.pilotHealth.healthStatus}`,
      detail:
        updates.pilotHealth.featureRequests ||
        updates.pilotHealth.objectionsConcerns ||
        updates.pilotHealth.fleetManagerFeedback,
    });
  }

  if (hasNewDrafts(prospect, updates)) {
    logs.push({
      ...base,
      eventType: "draft_generated",
      title: "Outreach draft generated",
      detail: updates.nextAction,
    });
  }

  const sentDraft = latestDraftMarkedSent(prospect, updates);
  if (sentDraft) {
    logs.push({
      ...base,
      eventType: "draft_marked_sent",
      title: `Draft manually marked sent: ${sentDraft.draftType}`,
      detail: sentDraft.manuallyMarkedSentDate,
    });
  }

  const completedHandoff = hasNewCompletedHandoff(prospect, updates);
  if (completedHandoff) {
    logs.push({
      ...base,
      eventType: "handoff_written",
      title: `Handoff written: ${completedHandoff.target}`,
      detail: completedHandoff.outputType,
    });
  } else if (updates.handoffs) {
    logs.push({
      ...base,
      eventType: "handoff_status_changed",
      title: "Handoff status updated",
      detail: updates.handoffs.map((handoff) => handoff.status).join(", "),
    });
  }

  if (!logs.length) {
    logs.push({
      ...base,
      eventType: "prospect_updated",
      title: "Prospect workflow updated",
      detail: updates.nextAction,
    });
  }

  return logs;
}

export function logProspectWorkflowUpdate(
  prospect: Prospect,
  updates: Partial<Prospect>
): SalesActivityLog[] {
  const inferredLogs = inferSalesActivityLogs(prospect, updates).map((log) => ({
    ...log,
    id: createActivityId(),
    createdAt: new Date().toISOString(),
  }));

  saveSalesActivityLogs([...inferredLogs, ...getSalesActivityLogs()]);
  return inferredLogs;
}
