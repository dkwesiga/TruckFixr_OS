import {
  type Prospect,
  type SalesOnboardingChecklistItem,
  type SalesPilotProposal,
  type SalesQuote,
} from "@/lib/types";

export const TRUCKFIXR_PRICING = {
  "Owner-Operator": { monthly: "CAD $19/month", annual: "CAD $190/year" },
  "Small Fleet": { monthly: "CAD $49/month", annual: "CAD $490/year" },
  "Fleet Growth": { monthly: "CAD $99/month", annual: "CAD $990/year" },
  "Fleet Pro": { monthly: "CAD $199/month", annual: "CAD $1,990/year" },
  "Custom Fleet": { monthly: "Custom", annual: "Custom" },
} as const;

export type TruckFixrPlan = keyof typeof TRUCKFIXR_PRICING;

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function valueOrFallback(value: string | undefined, fallback: string) {
  return value?.trim() ? value.trim() : fallback;
}

function estimatePlan(prospect: Prospect): TruckFixrPlan {
  const size = prospect.discoveryWorkflow?.fleetSize ?? prospect.estimatedFleetSize ?? "";

  if (/50\+|51|60|70|80|90|100/i.test(size)) return "Custom Fleet";
  if (/21-50|2[1-9]|3[0-9]|4[0-9]/i.test(size)) return "Fleet Pro";
  if (/11-20|15-20|1[1-9]|20/i.test(size)) return "Fleet Growth";
  if (/6-10|8-12|5-8/i.test(size)) return "Small Fleet";
  return "Owner-Operator";
}

export function defaultPilotProposal(prospect: Prospect): SalesPilotProposal {
  const now = new Date().toISOString();
  const workflow = prospect.discoveryWorkflow;

  return {
    id: prospect.pilotProposal?.id ?? createId("pilot_proposal"),
    status: prospect.pilotProposal?.status ?? "Draft",
    pricingPath:
      prospect.pilotProposal?.pricingPath ??
      (workflow?.willingnessToPilot === "Yes"
        ? "Paid pilot"
        : "Discounted early adopter pilot"),
    pilotObjective:
      prospect.pilotProposal?.pilotObjective ??
      `Validate whether TruckFixr can improve maintenance visibility and repair decision support for ${prospect.companyName}.`,
    pilotScope:
      prospect.pilotProposal?.pilotScope ??
      valueOrFallback(
        workflow?.preferredPilotScope,
        "Start with a focused group of vehicles, users, and maintenance workflows before expanding scope."
      ),
    vehiclesUsersIncluded:
      prospect.pilotProposal?.vehiclesUsersIncluded ??
      valueOrFallback(
        workflow?.fleetSize || prospect.estimatedFleetSize,
        "Vehicle and user count to be confirmed before kickoff."
      ),
    modulesIncluded:
      prospect.pilotProposal?.modulesIncluded ??
      "Vehicle issue capture, maintenance visibility, inspection/repair notes, and AI-assisted diagnostic guidance drafts for review.",
    dataSourcesUsed:
      prospect.pilotProposal?.dataSourcesUsed ??
      valueOrFallback(
        workflow?.availableDataSources,
        "Driver-reported issues, repair notes, vehicle list, and maintenance history shared by the fleet."
      ),
    successMetrics:
      prospect.pilotProposal?.successMetrics ??
      valueOrFallback(
        workflow?.successCriteria,
        "Clearer repair visibility, faster internal maintenance decisions, stronger documentation, and actionable pilot feedback."
      ),
    timeline:
      prospect.pilotProposal?.timeline ??
      valueOrFallback(workflow?.timeline, "30-day discovery pilot plus a review conversation."),
    reviewDate: prospect.pilotProposal?.reviewDate ?? "",
    risksAssumptions:
      prospect.pilotProposal?.risksAssumptions ??
      valueOrFallback(
        workflow?.objections,
        "Pilot results depend on timely fleet feedback, accurate vehicle/user setup, and consistent usage during the pilot window."
      ),
    nextSteps:
      prospect.pilotProposal?.nextSteps ??
      "Confirm scope, review pilot proposal, identify pilot owner, and schedule kickoff.",
    createdAt: prospect.pilotProposal?.createdAt ?? now,
    updatedAt: now,
  };
}

export function generatePilotProposalMarkdown(
  prospect: Prospect,
  proposal: SalesPilotProposal
) {
  const workflow = prospect.discoveryWorkflow;

  return [
    `# TruckFixr Pilot Proposal: ${prospect.companyName}`,
    "",
    "Template draft - review before sending. Do not send automatically.",
    "",
    "## 1. Prospect Summary",
    `${prospect.companyName} is a ${prospect.fleetType ?? "commercial fleet"} prospect in ${prospect.location}.`,
    "",
    "## 2. Fleet Profile",
    `Fleet size: ${workflow?.fleetSize ?? prospect.estimatedFleetSize ?? "To confirm"}`,
    `Vehicle types: ${workflow?.vehicleTypes ?? prospect.vehicleTypes ?? "To confirm"}`,
    `Locations: ${workflow?.locations ?? prospect.location}`,
    `Maintenance model: ${workflow?.maintenanceModel ?? "To confirm"}`,
    `Maintenance software / ELD: ${workflow?.maintenanceSoftware ?? prospect.currentMaintenanceSoftware ?? "To confirm"} / ${workflow?.eldTelematicsProvider ?? prospect.eldTelematicsProvider ?? "To confirm"}`,
    "",
    "## 3. Pain Points",
    workflow?.summary ??
      prospect.maintenancePain ??
      "Pain points to be confirmed through discovery.",
    "",
    "## 4. Pilot Objective",
    proposal.pilotObjective,
    "",
    "## 5. Pilot Scope",
    proposal.pilotScope,
    "",
    "## 6. Vehicles / Users Included",
    proposal.vehiclesUsersIncluded ?? "To confirm before kickoff.",
    "",
    "## 7. Modules / Features Included",
    proposal.modulesIncluded ?? "To confirm.",
    "",
    "## 8. Data Sources Used",
    proposal.dataSourcesUsed ?? "To confirm.",
    "",
    "## 9. Success Metrics",
    proposal.successMetrics ?? "To confirm.",
    "",
    "## 10. TruckFixr Responsibilities",
    "- Configure pilot workspace and operating templates",
    "- Support setup and weekly check-ins",
    "- Review pilot feedback and summarize findings",
    "- Generate pilot review and paid conversion recommendation",
    "",
    "## 11. Fleet Responsibilities",
    "- Confirm pilot owner and decision maker",
    "- Provide vehicle/user list and relevant maintenance context",
    "- Use the pilot workflow consistently during the pilot period",
    "- Participate in review conversation and feedback capture",
    "",
    "## 12. Timeline",
    proposal.timeline ?? "To confirm.",
    "",
    "## 13. Review Date",
    proposal.reviewDate || "To be scheduled before activation.",
    "",
    "## 14. Pricing / Commercial Path",
    proposal.pricingPath,
    "",
    "## 15. Risks and Assumptions",
    proposal.risksAssumptions ?? "To confirm.",
    "",
    "## 16. Next Steps",
    proposal.nextSteps ?? "Confirm pilot scope and schedule kickoff.",
    "",
    "---",
    "Draft only. Human review required before sending. No savings or downtime reduction guarantees are made.",
  ].join("\n");
}

export function defaultQuote(prospect: Prospect): SalesQuote {
  const now = new Date().toISOString();
  const selectedPlan = prospect.quote?.selectedPlan ?? estimatePlan(prospect);
  const pricing = TRUCKFIXR_PRICING[selectedPlan];

  return {
    id: prospect.quote?.id ?? createId("quote"),
    selectedPlan,
    poweredVehicles: prospect.quote?.poweredVehicles,
    trailers: prospect.quote?.trailers,
    users: prospect.quote?.users,
    pilotPrice: prospect.quote?.pilotPrice ?? "",
    discount: prospect.quote?.discount ?? "",
    discountReason: prospect.quote?.discountReason ?? "",
    monthlyPrice: prospect.quote?.monthlyPrice ?? pricing.monthly,
    annualPrice: prospect.quote?.annualPrice ?? pricing.annual,
    customPrice: prospect.quote?.customPrice ?? "",
    quoteExpiryDate: prospect.quote?.quoteExpiryDate ?? "",
    notes: prospect.quote?.notes ?? "",
    summaryMarkdown: prospect.quote?.summaryMarkdown,
    createdAt: prospect.quote?.createdAt ?? now,
    updatedAt: now,
  };
}

export function generateQuoteSummaryMarkdown(prospect: Prospect, quote: SalesQuote) {
  return [
    `# TruckFixr Quote Summary: ${prospect.companyName}`,
    "",
    "Template draft - review before sending. Do not process payment from this system.",
    "",
    `**Selected plan:** ${quote.selectedPlan}`,
    `**Powered vehicles:** ${quote.poweredVehicles ?? "To confirm"}`,
    `**Trailers:** ${quote.trailers ?? "To confirm"}`,
    `**Users:** ${quote.users ?? "To confirm"}`,
    `**Pilot price:** ${quote.pilotPrice || "To confirm"}`,
    `**Monthly price:** ${quote.monthlyPrice || "To confirm"}`,
    `**Annual price:** ${quote.annualPrice || "To confirm"}`,
    `**Custom price:** ${quote.customPrice || "N/A"}`,
    `**Discount:** ${quote.discount || "None"}`,
    `**Discount reason:** ${quote.discountReason || "N/A"}`,
    `**Quote expiry:** ${quote.quoteExpiryDate || "To confirm"}`,
    "",
    "## Commercial Notes",
    quote.notes || prospect.commercialNotes || "No additional commercial notes captured.",
    "",
    "## Recommended Paid Conversion Path",
    "Confirm decision maker approval, align on onboarding checklist, and schedule kickoff/review dates before any paid conversion.",
    "",
    "---",
    "Draft only. Human review required before sending. No payments are processed in TruckFixr OS.",
  ].join("\n");
}

export function createDefaultOnboardingChecklist(): SalesOnboardingChecklistItem[] {
  return [
    "Confirm decision maker",
    "Confirm pilot owner/contact",
    "Collect vehicle list",
    "Collect users/drivers/managers",
    "Confirm locations",
    "Confirm maintenance process",
    "Confirm existing software/ELD/telematics",
    "Set kickoff date",
    "Define success metrics",
    "Schedule review date",
    "Prepare workspace/account setup",
    "Send kickoff note",
    "Schedule check-in",
  ].map((label) => ({
    id: createId("onboarding"),
    label,
    completed: false,
  }));
}
