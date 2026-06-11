import {
  type Prospect,
  type SalesHandoff,
  type SalesIntelligenceRecord,
  type SalesLossNurtureRecord,
} from "@/lib/types";

export const LOSS_REASONS = [
  "No response",
  "Not enough vehicles",
  "No urgent maintenance pain",
  "Uses existing maintenance software",
  "Wants ELD/telematics integration first",
  "Price/budget concern",
  "Not decision maker",
  "Timing not right",
  "Wants more proof/case studies",
  "Internal maintenance team not interested",
  "Product missing required feature",
  "Chose another solution",
  "Not a fit",
] as const;

export const OBJECTION_CATEGORIES = [
  "no urgent pain",
  "already uses maintenance software",
  "wants ELD/telematics integration first",
  "concerned about price",
  "concerned about AI accuracy",
  "concerned about driver adoption",
  "concerned about data privacy",
  "too busy to pilot",
  "decision maker not engaged",
  "wants proof/case study",
  "needs mobile app/PWA improvement",
  "requires multi-location support",
  "prefers current repair provider workflow",
  "not enough vehicles",
  "timing not right",
] as const;

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getRecommendedObjectionResponse(objectionType?: string) {
  switch (objectionType) {
    case "already uses maintenance software":
      return "Position TruckFixr as a practical maintenance visibility layer for pilot workflows, not a forced replacement.";
    case "wants ELD/telematics integration first":
      return "Acknowledge integration value, then propose a scoped discovery pilot that documents required ELD fields and workflow assumptions.";
    case "concerned about price":
      return "Clarify pilot scope and commercial path. Avoid discounting before confirming fleet size, pain, and decision process.";
    case "concerned about AI accuracy":
      return "Emphasize human review, decision support, and operational visibility. Do not claim autonomous diagnosis.";
    case "concerned about driver adoption":
      return "Lead with low-friction issue capture, simple mobile workflows, and pilot feedback loops.";
    case "concerned about data privacy":
      return "Clarify that Version 1 pilots should use approved data only and avoid sensitive customer details without consent.";
    case "wants proof/case study":
      return "Offer anonymized pilot learnings and explain that customer-identifying claims require written approval.";
    case "needs mobile app/PWA improvement":
      return "Create an Engineering/Roadmap handoff and avoid promising delivery dates without review.";
    case "not enough vehicles":
      return "Move to nurture unless there is strong strategic, referral, or learning value.";
    case "timing not right":
      return "Set a check-in date and capture the future trigger.";
    default:
      return "Capture the objection, confirm the decision process, and choose nurture/lost/handoff based on commercial fit.";
  }
}

export function countObjections(prospects: Prospect[]) {
  const counts = new Map<string, number>();

  prospects.forEach((prospect) => {
    (prospect.intelligenceRecords ?? []).forEach((record) => {
      const key = record.objectionType || "Uncategorized";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    if (prospect.lossNurture?.mainObjection) {
      const key = prospect.lossNurture.mainObjection;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function createIntelligenceRecord(
  input: Omit<SalesIntelligenceRecord, "id" | "createdAt">
): SalesIntelligenceRecord {
  return {
    ...input,
    id: createId("intel"),
    createdAt: new Date().toISOString(),
  };
}

export function generateHandoffPrompts(
  prospect: Prospect,
  lossNurture?: SalesLossNurtureRecord
): SalesHandoff[] {
  const now = new Date().toISOString();
  const objection =
    lossNurture?.mainObjection ||
    prospect.intelligenceRecords?.[0]?.objectionType ||
    "sales learning";
  const pain =
    prospect.discoveryWorkflow?.summary ||
    prospect.maintenancePain ||
    "No structured pain point captured.";
  const missingFeature =
    lossNurture?.missingFeature ||
    prospect.intelligenceRecords?.find((record) => record.missingFeature)
      ?.missingFeature;

  return [
    {
      id: createId("handoff"),
      target: "Marketing Agent",
      trigger: "Repeated objection, proof request, or confirmed fleet pain",
      outputType: "Objection-handling content prompt",
      status: "Draft",
      notes: [
        `Create founder-led content for TruckFixr based on this sales learning: ${objection}.`,
        `Prospect context: ${prospect.companyName}, ${prospect.location}, ${prospect.fleetType ?? "fleet type unknown"}.`,
        `Pain/context: ${pain}`,
        "Output ideas: LinkedIn post, nurture email, landing-page proof block, or case-study outline.",
        "Safety: no customer names or claims without explicit approval; no guaranteed savings or downtime reduction.",
      ].join("\n"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("handoff"),
      target: "Funding/R&D Agent",
      trigger: "Customer discovery, technical uncertainty, integration request, or support-letter potential",
      outputType: "R&D evidence prompt",
      status: "Draft",
      notes: [
        `Turn this sales learning into an R&D evidence note for TruckFixr: ${objection}.`,
        `Prospect context: ${prospect.companyName}, ${prospect.location}.`,
        `Data/integration context: ${prospect.eldTelematicsProvider || prospect.discoveryWorkflow?.availableDataSources || "Not captured"}.`,
        `Technical uncertainty / workflow challenge: ${prospect.discoveryWorkflow?.objections || missingFeature || "To define"}.`,
        "Output: R&D evidence entry, grant relevance, support-letter potential, next validation step.",
      ].join("\n"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("handoff"),
      target: "Engineering Agent",
      trigger: "Missing feature, product issue, integration request, or adoption blocker",
      outputType: "Engineering task prompt",
      status: "Draft",
      notes: [
        `Create an engineering task from this sales blocker: ${missingFeature || objection}.`,
        `Prospect context: ${prospect.companyName}; current stage: ${prospect.currentStage ?? prospect.outreachStatus}.`,
        `Desired outcome: reduce sales/pilot friction while keeping scope focused.`,
        "Required output: user story, acceptance criteria, likely files, risks, tests, rollback steps.",
        "Safety: do not modify auth, payments, or Supabase RLS without explicit approval.",
      ].join("\n"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("handoff"),
      target: "Roadmap",
      trigger: "Recurring objection or commercially important product gap",
      outputType: "Roadmap item prompt",
      status: "Draft",
      notes: [
        `Create/update a roadmap item for this commercial learning: ${missingFeature || objection}.`,
        `Impact rationale: affects conversion, pilot activation, or paid expansion for ${prospect.companyName}.`,
        `Linked evidence: ${pain}`,
        "Recommend priority, risk level, phase, success criteria, and affected module.",
      ].join("\n"),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function generateLossNurtureSummary(
  prospect: Prospect,
  record: SalesLossNurtureRecord
) {
  return [
    `# Loss / Nurture Summary: ${prospect.companyName}`,
    "",
    `**Reason:** ${record.reason || "Not captured"}`,
    `**Main objection:** ${record.mainObjection || "Not captured"}`,
    `**Current solution/workaround:** ${record.currentSolution || "Not captured"}`,
    `**Competitor:** ${record.competitor || "Unknown"}`,
    `**Price concern:** ${record.priceConcern || "None captured"}`,
    `**Timing issue:** ${record.timingIssue || "None captured"}`,
    `**Missing feature:** ${record.missingFeature || "None captured"}`,
    `**Decision blocker:** ${record.decisionBlocker || "None captured"}`,
    `**Future trigger:** ${record.futureTrigger || "None captured"}`,
    `**Next check-in date:** ${record.nextCheckInDate || "Not scheduled"}`,
    `**Recommended nurture sequence:** ${record.recommendedNurtureSequence || "Not selected"}`,
    "",
    "## Recommended Response",
    getRecommendedObjectionResponse(record.mainObjection),
    "",
    "---",
    "Internal sales learning only. Do not publish customer-identifying details without approval.",
  ].join("\n");
}
