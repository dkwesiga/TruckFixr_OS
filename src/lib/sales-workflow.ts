import {
  type OutreachStatus,
  type Prospect,
  type SalesPipelineStage,
  type SalesPriority,
} from "@/lib/types";

type Score = 1 | 2 | 3 | 4 | 5;

export const SALES_PIPELINE_STAGES: SalesPipelineStage[] = [
  "New Prospect",
  "Researching",
  "Qualified",
  "Outreach Drafted",
  "Outreach Sent",
  "Follow-Up Due",
  "Replied",
  "Discovery Booked",
  "Discovery Completed",
  "Pilot Proposed",
  "Pilot Agreed",
  "Onboarding",
  "Pilot Active",
  "Pilot Review",
  "Paid Proposal Sent",
  "Won",
  "Nurture",
  "Lost",
];

export const STAGE_TO_OUTREACH_STATUS: Partial<
  Record<SalesPipelineStage, OutreachStatus>
> = {
  "New Prospect": "New",
  Researching: "Researched",
  Qualified: "Researched",
  "Outreach Drafted": "Drafted",
  "Outreach Sent": "Sent",
  "Follow-Up Due": "Sent",
  Replied: "Replied",
  "Discovery Booked": "Discovery Booked",
  "Discovery Completed": "Pilot Fit",
  "Pilot Proposed": "Proposal Sent",
  "Pilot Agreed": "Pilot Fit",
  Onboarding: "Pilot Fit",
  "Pilot Active": "Pilot Fit",
  "Pilot Review": "Pilot Fit",
  "Paid Proposal Sent": "Proposal Sent",
  Won: "Won",
  Nurture: "Nurture",
  Lost: "Lost",
};

const OUTREACH_STATUS_TO_STAGE: Record<OutreachStatus, SalesPipelineStage> = {
  New: "New Prospect",
  Researched: "Researching",
  Drafted: "Outreach Drafted",
  Approved: "Outreach Drafted",
  Sent: "Outreach Sent",
  Replied: "Replied",
  "Discovery Booked": "Discovery Booked",
  "Pilot Fit": "Discovery Completed",
  "Proposal Sent": "Pilot Proposed",
  Won: "Won",
  Nurture: "Nurture",
  Lost: "Lost",
};

export type SalesAction = {
  id: string;
  title: string;
  prospectId: string;
  companyName: string;
  priority: SalesPriority;
  reason: string;
  dueDate?: string;
  relatedStage: SalesPipelineStage;
  recommendedChannel: "Email" | "Phone" | "LinkedIn" | "Internal";
  status: "open" | "in_progress" | "completed" | "dismissed";
};

function clampScore(value: number): Score {
  return Math.max(1, Math.min(5, Math.round(value))) as Score;
}

function daysAgo(dateValue?: string) {
  if (!dateValue) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getProspectStage(prospect: Prospect): SalesPipelineStage {
  return prospect.currentStage ?? OUTREACH_STATUS_TO_STAGE[prospect.outreachStatus];
}

export function applyStageTransition(
  prospect: Prospect,
  nextStage: SalesPipelineStage,
  stageNotes?: string
): Partial<Prospect> {
  const currentStage = getProspectStage(prospect);
  const mappedStatus = STAGE_TO_OUTREACH_STATUS[nextStage];

  return {
    currentStage: nextStage,
    previousStage: currentStage,
    stageChangedDate: new Date().toISOString(),
    stageNotes: stageNotes ?? prospect.stageNotes,
    outreachStatus: mappedStatus ?? prospect.outreachStatus,
    stalled: false,
    stalledReason: undefined,
  };
}

export function calculateCommercialScores(prospect: Partial<Prospect>): {
  rdFundingEvidenceScore: Score;
  speedToCloseScore: Score;
  commercialReadinessScore: Score;
} {
  const pilotFit = prospect.pilotFitScore ?? 2;
  const revenueFit = prospect.revenueFitScore ?? 2;
  const grantFit = prospect.grantFitScore ?? 2;
  const hasPain = Boolean(prospect.maintenancePain?.trim() || prospect.notes?.trim());
  const hasDecisionMaker = Boolean(
    prospect.decisionMaker?.trim() ||
      prospect.decisionMakerIdentified ||
      prospect.email?.trim() ||
      prospect.phone?.trim()
  );
  const hasTelematics =
    prospect.usesEldTelematics === "Yes" ||
    Boolean(prospect.eldTelematicsProvider?.trim());
  const urgent = prospect.urgency === "High" || prospect.urgency === "Critical";
  const pilotInterest = prospect.pilotInterest === "Yes";
  const supportLetter =
    prospect.discoveryWorkflow?.supportLetterPotential === "High" ||
    prospect.pilotHealth?.supportLetterPotential === "high";

  let rdWeight = grantFit;
  if (hasTelematics) rdWeight += 1;
  if (supportLetter) rdWeight += 1;
  if (prospect.discoveryWorkflow?.availableDataSources) rdWeight += 1;

  let speedWeight = 2;
  if (hasDecisionMaker) speedWeight += 1;
  if (urgent) speedWeight += 1;
  if (pilotInterest) speedWeight += 1;
  if (daysAgo(prospect.lastContactDate) <= 7) speedWeight += 1;

  const rdFundingEvidenceScore = clampScore(rdWeight);
  const speedToCloseScore = clampScore(speedWeight);
  const commercialReadinessScore = clampScore(
    pilotFit * 0.4 +
      rdFundingEvidenceScore * 0.25 +
      revenueFit * 0.2 +
      speedToCloseScore * 0.15
  );

  return {
    rdFundingEvidenceScore,
    speedToCloseScore,
    commercialReadinessScore: hasPain || hasDecisionMaker ? commercialReadinessScore : 2,
  };
}

export function getRecommendedNextStep(prospect: Prospect): string {
  const stage = getProspectStage(prospect);
  const readiness =
    prospect.commercialReadinessScore ??
    calculateCommercialScores(prospect).commercialReadinessScore;

  if (prospect.doNotContact || prospect.consentStatus === "do_not_contact") {
    return "Do not contact. Review compliance notes before any next step.";
  }

  if (stage === "New Prospect") return "Research company, fleet size, and decision maker.";
  if (stage === "Researching" && readiness >= 4) return "Draft first outreach and prepare a call opener.";
  if (stage === "Outreach Sent" && daysAgo(prospect.lastOutreachDate) >= 3) {
    return "Send a manual follow-up draft after review.";
  }
  if (stage === "Replied") return "Book or confirm a discovery call.";
  if (stage === "Discovery Booked") return "Complete the discovery workflow and summarize fit.";
  if (stage === "Discovery Completed") return "Generate a scoped pilot proposal.";
  if (stage === "Pilot Proposed") return "Follow up on the pilot proposal and confirm objections.";
  if (stage === "Pilot Active") return "Check pilot health and capture R&D evidence.";
  if (stage === "Pilot Review") return "Generate pilot review and paid conversion recommendation.";
  if (stage === "Paid Proposal Sent") return "Follow up on paid proposal and record decision.";
  if (stage === "Won") return "Create onboarding checklist and internal handoff note.";
  if (stage === "Nurture") return "Schedule next check-in and add nurture reason.";
  if (stage === "Lost") return "Capture loss reason and create learning handoffs.";

  return "Set a clear next action and due date.";
}

export function buildDailyActionQueue(prospects: Prospect[]): SalesAction[] {
  return prospects
    .flatMap((prospect): SalesAction[] => {
      const stage = getProspectStage(prospect);
      const actions: SalesAction[] = [];
      const readiness =
        prospect.commercialReadinessScore ??
        calculateCommercialScores(prospect).commercialReadinessScore;
      const priority: SalesPriority =
        prospect.priority ?? (readiness >= 4 ? "High" : "Medium");

      if (prospect.doNotContact || prospect.consentStatus === "do_not_contact") {
        return [];
      }

      if (stage === "New Prospect") {
        actions.push({
          id: `${prospect.id}-research`,
          title: "Research this new prospect",
          prospectId: prospect.id,
          companyName: prospect.companyName,
          priority,
          reason: "New prospects need company, fleet, and decision-maker context.",
          dueDate: prospect.nextActionDueDate ?? todayDate(),
          relatedStage: stage,
          recommendedChannel: "Internal",
          status: "open",
        });
      }

      if (stage === "Researching" || stage === "Qualified") {
        actions.push({
          id: `${prospect.id}-draft`,
          title: "Draft first outreach",
          prospectId: prospect.id,
          companyName: prospect.companyName,
          priority,
          reason: readiness >= 4 ? "High readiness prospect." : "Research is ready for outreach.",
          dueDate: prospect.nextActionDueDate ?? addDays(1),
          relatedStage: stage,
          recommendedChannel: prospect.email ? "Email" : "LinkedIn",
          status: "open",
        });
      }

      if (
        (stage === "Outreach Sent" || stage === "Follow-Up Due") &&
        daysAgo(prospect.lastOutreachDate ?? prospect.lastContactDate) >= 3
      ) {
        actions.push({
          id: `${prospect.id}-follow-up`,
          title: "Follow up: no reply after 3 days",
          prospectId: prospect.id,
          companyName: prospect.companyName,
          priority,
          reason: "Manual follow-up is due after outreach.",
          dueDate: prospect.nextActionDueDate ?? todayDate(),
          relatedStage: "Follow-Up Due",
          recommendedChannel: prospect.email ? "Email" : "Phone",
          status: "open",
        });
      }

      if (stage === "Replied") {
        actions.push({
          id: `${prospect.id}-discovery`,
          title: "Book discovery call",
          prospectId: prospect.id,
          companyName: prospect.companyName,
          priority: "High",
          reason: "Reply captured; move the conversation to structured discovery.",
          dueDate: prospect.nextActionDueDate ?? todayDate(),
          relatedStage: stage,
          recommendedChannel: "Email",
          status: "open",
        });
      }

      if (stage === "Discovery Completed") {
        actions.push({
          id: `${prospect.id}-proposal`,
          title: "Generate pilot proposal",
          prospectId: prospect.id,
          companyName: prospect.companyName,
          priority: readiness >= 4 ? "High" : "Medium",
          reason: "Discovery is complete; define scope, review date, and commercial path.",
          dueDate: prospect.nextActionDueDate ?? addDays(1),
          relatedStage: stage,
          recommendedChannel: "Internal",
          status: "open",
        });
      }

      if (stage === "Pilot Active") {
        actions.push({
          id: `${prospect.id}-pilot-health`,
          title: "Check pilot health",
          prospectId: prospect.id,
          companyName: prospect.companyName,
          priority: prospect.pilotHealth?.healthStatus === "At Risk" ? "Critical" : "High",
          reason: "Active pilots need feedback, usage, and conversion signals.",
          dueDate: prospect.nextActionDueDate ?? addDays(2),
          relatedStage: stage,
          recommendedChannel: "Internal",
          status: "open",
        });
      }

      return actions;
    })
    .sort((a, b) => {
      const priorityOrder: Record<SalesPriority, number> = {
        Critical: 0,
        High: 1,
        Medium: 2,
        Low: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export function generateWeeklySalesReview(prospects: Prospect[]): string {
  const actions = buildDailyActionQueue(prospects).slice(0, 10);
  const stageCounts = SALES_PIPELINE_STAGES.map((stage) => ({
    stage,
    count: prospects.filter((prospect) => getProspectStage(prospect) === stage).length,
  })).filter((item) => item.count > 0);
  const stalled = prospects.filter((prospect) => prospect.stalled);
  const highFit = prospects.filter((prospect) => {
    const readiness =
      prospect.commercialReadinessScore ??
      calculateCommercialScores(prospect).commercialReadinessScore;
    return readiness >= 4;
  });
  const activePilots = prospects.filter(
    (prospect) => getProspectStage(prospect) === "Pilot Active"
  );
  const objections = prospects
    .flatMap((prospect) => prospect.intelligenceRecords ?? [])
    .map((record) => record.objectionType || record.objectionDetail)
    .filter(Boolean);

  return [
    "# TruckFixr Weekly Sales Review",
    `**Generated:** ${new Date().toLocaleDateString("en-CA")}`,
    "",
    "## Priority Actions",
    actions.length
      ? actions
          .map(
            (action) =>
              `- ${action.title} - ${action.companyName} (${action.priority}): ${action.reason}`
          )
          .join("\n")
      : "- No open rule-based actions found.",
    "",
    "## Pipeline Health",
    stageCounts.length
      ? stageCounts.map((item) => `- ${item.stage}: ${item.count}`).join("\n")
      : "- No prospects in the pipeline.",
    `- Stalled opportunities: ${stalled.length}`,
    `- High-fit prospects: ${highFit.length}`,
    `- Estimated pilot value: CAD $${prospects.reduce((sum, prospect) => sum + (prospect.estimatedPilotValue ?? 0), 0).toLocaleString("en-CA")}`,
    `- Estimated subscription value: CAD $${prospects.reduce((sum, prospect) => sum + (prospect.estimatedAnnualValue ?? 0), 0).toLocaleString("en-CA")}`,
    "",
    "## Pilot Health",
    activePilots.length
      ? activePilots
          .map(
            (prospect) =>
              `- ${prospect.companyName}: ${prospect.pilotHealth?.healthStatus ?? "No health status"}`
          )
          .join("\n")
      : "- No active pilots recorded.",
    "",
    "## Sales Learning",
    objections.length
      ? objections.map((objection) => `- ${objection}`).join("\n")
      : "- Add objections and loss/nurture notes to improve this section.",
    "",
    "## Cross-Agent Handoffs",
    prospects
      .flatMap((prospect) =>
        (prospect.handoffs ?? []).map(
          (handoff) => `- ${handoff.target}: ${handoff.outputType} (${handoff.status})`
        )
      )
      .join("\n") || "- No handoffs created yet.",
    "",
    "## Founder Focus",
    "Do these 5 actions this week.",
    ...actions.slice(0, 5).map((action, index) => `${index + 1}. ${action.title} - ${action.companyName}`),
  ].join("\n");
}
