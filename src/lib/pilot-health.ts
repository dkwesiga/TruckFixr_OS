import { type Prospect, type SalesPilotHealth } from "@/lib/types";

export const DEFAULT_SUCCESS_METRICS = [
  "Downtime visibility improved",
  "Issue response time improved",
  "Recurring faults identified",
  "Inspection compliance improved",
  "Repair decision speed improved",
  "Maintenance documentation improved",
];

export function defaultPilotHealth(): SalesPilotHealth {
  return {
    vehiclesOnboarded: 0,
    usersInvited: 0,
    inspectionsIssuesCaptured: 0,
    diagnosticInteractions: 0,
    maintenanceActionsCreated: 0,
    lastActivityDate: "",
    driverFeedback: "",
    fleetManagerFeedback: "",
    technicianFeedback: "",
    usabilityIssues: "",
    featureRequests: "",
    objectionsConcerns: "",
    successMetricsAchieved: [],
    conversionReadiness: "medium",
    supportLetterPotential: "medium",
    healthStatus: "Needs Attention",
  };
}

export function generatePilotSuccessPlan(prospect: Prospect) {
  const proposal = prospect.pilotProposal;
  const workflow = prospect.discoveryWorkflow;

  return [
    `# Pilot Success Plan: ${prospect.companyName}`,
    "",
    "## Pilot Scope",
    proposal?.pilotScope ??
      workflow?.preferredPilotScope ??
      "Confirm a focused pilot scope before activation.",
    "",
    "## Number of Vehicles",
    proposal?.vehiclesUsersIncluded ??
      workflow?.fleetSize ??
      prospect.estimatedFleetSize ??
      "To confirm",
    "",
    "## Modules Enabled",
    proposal?.modulesIncluded ??
      "Vehicle issue capture, maintenance visibility, inspection/repair notes, and diagnostic guidance drafts.",
    "",
    "## Expected Usage",
    "Fleet users should capture relevant issues, notes, and maintenance actions during the pilot period so TruckFixr can review practical workflow fit.",
    "",
    "## Weekly Check-in Cadence",
    "One weekly check-in with the pilot owner plus async notes as needed.",
    "",
    "## Data to Collect",
    proposal?.dataSourcesUsed ??
      workflow?.availableDataSources ??
      "Vehicle list, users, maintenance notes, inspection/issue examples, and pilot feedback.",
    "",
    "## Success Criteria",
    proposal?.successMetrics ??
      workflow?.successCriteria ??
      "Clearer repair visibility, stronger maintenance documentation, and actionable user feedback.",
    "",
    "## Paid Conversion Trigger",
    "Move to paid conversion when the fleet confirms pilot value, users can operate the workflow, and the decision maker agrees on scope and plan.",
    "",
    "---",
    "Internal plan only. Do not promise guaranteed downtime reduction or savings.",
  ].join("\n");
}

export function generateInternalHandoffNote(prospect: Prospect) {
  return [
    `# Internal Sales Handoff: ${prospect.companyName}`,
    "",
    "## Sales Notes",
    prospect.notes || "No sales notes captured.",
    "",
    "## Pain Points",
    prospect.discoveryWorkflow?.summary ||
      prospect.maintenancePain ||
      "No discovery summary captured.",
    "",
    "## Promised Features / Scope",
    prospect.pilotProposal?.modulesIncluded ||
      prospect.pilotProposal?.pilotScope ||
      "Confirm before kickoff.",
    "",
    "## Objections",
    prospect.discoveryWorkflow?.objections || "No objections captured.",
    "",
    "## Pricing Discussed",
    prospect.quote?.summaryMarkdown ||
      prospect.quote?.monthlyPrice ||
      "No quote summary captured.",
    "",
    "## Pilot Commitments",
    prospect.pilotProposal?.nextSteps || "Confirm pilot owner, scope, and kickoff.",
    "",
    "## Risk Factors",
    prospect.pilotProposal?.risksAssumptions ||
      prospect.pilotHealth?.objectionsConcerns ||
      "No risk factors captured.",
    "",
    "## Next Action Owner",
    prospect.nextActionOwner || "Dickson",
  ].join("\n");
}

export function generatePilotReviewReport(prospect: Prospect) {
  const health = prospect.pilotHealth ?? defaultPilotHealth();
  const metrics = health.successMetricsAchieved?.length
    ? health.successMetricsAchieved.map((metric) => `- ${metric}`).join("\n")
    : "- No success metrics marked achieved yet.";

  return [
    `# Pilot Review Report: ${prospect.companyName}`,
    "",
    "Draft only. Review internally before sharing externally.",
    "",
    "## Value Delivered",
    "Summarize practical value observed during the pilot without claiming guaranteed savings or downtime reduction.",
    "",
    "## Usage Summary",
    `- Vehicles onboarded: ${health.vehiclesOnboarded ?? 0}`,
    `- Users invited: ${health.usersInvited ?? 0}`,
    `- Inspections/issues captured: ${health.inspectionsIssuesCaptured ?? 0}`,
    `- Diagnostic interactions: ${health.diagnosticInteractions ?? 0}`,
    `- Maintenance actions created: ${health.maintenanceActionsCreated ?? 0}`,
    `- Last activity date: ${health.lastActivityDate || "Not recorded"}`,
    "",
    "## Feedback Summary",
    `- Driver feedback: ${health.driverFeedback || "Not captured"}`,
    `- Fleet manager feedback: ${health.fleetManagerFeedback || "Not captured"}`,
    `- Technician/maintenance feedback: ${health.technicianFeedback || "Not captured"}`,
    "",
    "## Success Metrics Achieved",
    metrics,
    "",
    "## Unresolved Issues",
    [
      health.usabilityIssues && `Usability: ${health.usabilityIssues}`,
      health.featureRequests && `Feature requests: ${health.featureRequests}`,
      health.objectionsConcerns && `Objections/concerns: ${health.objectionsConcerns}`,
    ]
      .filter(Boolean)
      .join("\n") || "No unresolved issues captured.",
    "",
    "## Recommended Paid Plan",
    prospect.quote?.selectedPlan || "Confirm plan before paid conversion.",
    "",
    "## R&D Evidence Summary",
    prospect.discoveryWorkflow?.availableDataSources ||
      "Capture pilot learnings, technical uncertainty, workflow feedback, and support-letter potential.",
    "",
    "## Support Letter / Testimonial Recommendation",
    `Support-letter potential: ${health.supportLetterPotential ?? "medium"}`,
    "",
    "## Next Commercial Step",
    health.healthStatus === "Ready for Paid Conversion"
      ? "Prepare paid conversion follow-up and confirm subscription plan."
      : "Resolve pilot risks, collect more feedback, and schedule a review conversation.",
    "",
    "---",
    "Do not publish or share customer-identifying information without written approval.",
  ].join("\n");
}
