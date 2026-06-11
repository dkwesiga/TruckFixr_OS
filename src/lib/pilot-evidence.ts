import { addRDEvidence, type RDEvidenceInput } from "@/lib/funding";
import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import { type PilotEvidence } from "@/lib/types";

export type PilotEvidenceInput = Omit<
  PilotEvidence,
  "id" | "createdDate" | "updatedDate"
>;

function makeId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `pilot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getPilotEvidence(): PilotEvidence[] {
  return getItem<PilotEvidence[]>(STORAGE_KEYS.PILOT_EVIDENCE) ?? [];
}

export function savePilotEvidence(items: PilotEvidence[]): void {
  setItem(STORAGE_KEYS.PILOT_EVIDENCE, items);
}

export function addPilotEvidence(input: PilotEvidenceInput): PilotEvidence {
  const now = new Date().toISOString();
  const item: PilotEvidence = {
    ...input,
    id: makeId(),
    createdDate: now,
    updatedDate: now,
  };

  savePilotEvidence([item, ...getPilotEvidence()]);
  return item;
}

export function updatePilotEvidence(
  id: string,
  updates: Partial<PilotEvidence>
): PilotEvidence | null {
  const items = getPilotEvidence();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updated: PilotEvidence = {
    ...items[index],
    ...updates,
    id,
    createdDate: items[index].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const next = [...items];
  next[index] = updated;
  savePilotEvidence(next);
  return updated;
}

export function deletePilotEvidence(id: string): void {
  savePilotEvidence(getPilotEvidence().filter((item) => item.id !== id));
}

function anonymizedFleetContext(item: PilotEvidence) {
  const parts = [
    item.fleetType || "Fleet type not specified",
    item.fleetSize ? `${item.fleetSize} vehicles` : "Fleet size not specified",
    "Ontario",
  ];

  return parts.join(", ");
}

export function generateCaseStudyOutline(item: PilotEvidence) {
  return [
    `# Case Study: ${item.pilotName}`,
    "",
    "## Fleet Context",
    anonymizedFleetContext(item),
    "",
    "## Challenge",
    item.problemStatement ?? "Problem statement not documented yet.",
    "",
    "## Approach",
    item.solutionDeployed ?? "Solution deployed not documented yet.",
    "",
    "## Observations",
    item.outcomesObserved ?? "Factual outcomes have not been documented yet.",
    "",
    "## Technical Learnings",
    item.technicalLearnings ?? "Technical learnings not documented yet.",
    "",
    "## Next Steps",
    item.expansionPotential ?? item.nextAction ?? "Next steps not documented yet.",
    "",
    "---",
    "Draft only. Do not publish without customer approval.",
    "Do not include identifying information without written consent.",
  ].join("\n");
}

export function buildPilotEvidenceMarkdown(item: PilotEvidence) {
  return [
    `# Pilot Evidence: ${item.pilotName}`,
    `**Pilot Type:** ${item.pilotType}`,
    `**Pilot Status:** ${item.pilotStatus}`,
    `**Fleet Type:** ${item.fleetType ?? "Not set"}`,
    `**Fleet Size:** ${item.fleetSize ?? "Not set"}`,
    `**Start Date:** ${item.startDate ?? "Not set"}`,
    `**End Date:** ${item.endDate ?? "Not set"}`,
    `**Primary Contact:** ${item.primaryContact ?? "Not set"}`,
    `**Grant Evidence Value:** ${item.grantEvidenceValue}`,
    `**Support Letter Potential:** ${item.supportLetterPotential}`,
    `**Case Study Potential:** ${item.caseStudyPotential}`,
    "",
    "## Problem Statement",
    item.problemStatement ?? "Not documented",
    "",
    "## Solution Deployed",
    item.solutionDeployed ?? "Not documented",
    "",
    "## Outcomes Observed",
    item.outcomesObserved ?? "Not documented",
    "",
    "## Technical Learnings",
    item.technicalLearnings ?? "Not documented",
    "",
    "## Product Feedback",
    item.productFeedback ?? "Not documented",
    "",
    "## Expansion Potential",
    item.expansionPotential ?? "Not documented",
    "",
    "## Revenue Impact",
    item.revenueImpact ?? "Not documented",
    "",
    "## Next Action",
    item.nextAction ?? "Not documented",
    "",
    "## Notes",
    item.notes ?? "Not documented",
    "",
    "---",
    "Draft only. Do not include identifying information without explicit written customer consent.",
  ].join("\n");
}

function supportLetterToFundingValue(value: PilotEvidence["supportLetterPotential"]) {
  if (value === "Maybe") {
    return "Unknown" as const;
  }

  return value;
}

function confidenceFromGrantValue(value: PilotEvidence["grantEvidenceValue"]) {
  return value;
}

export function createRDEvidenceFromPilot(item: PilotEvidence) {
  const input: RDEvidenceInput = {
    date: item.endDate ?? item.startDate ?? new Date().toISOString().slice(0, 10),
    evidenceType: "Pilot Feedback",
    source: `${item.pilotType} - ${item.pilotName}`,
    customerPartner: item.pilotName,
    fleetSegment: [item.fleetType, item.fleetSize].filter(Boolean).join(", "),
    problemObserved: item.problemStatement ?? "",
    technicalUncertainty: item.technicalLearnings ?? "",
    experimentTestConducted: item.solutionDeployed ?? "",
    resultLearning: item.outcomesObserved ?? "",
    commercializationEvidence:
      item.revenueImpact ?? item.expansionPotential ?? item.productFeedback ?? "",
    grantRelevance:
      item.grantEvidenceValue === "High"
        ? "Pilot evidence suggests strong relevance for future grant and case-study support."
        : "Pilot evidence should be reviewed and supplemented before being used in a grant narrative.",
    supportLetterPotential: supportLetterToFundingValue(item.supportLetterPotential),
    confidenceLevel: confidenceFromGrantValue(item.grantEvidenceValue),
    nextAction: item.nextAction ?? "",
    notes: item.notes ?? "",
    isDemo: item.isDemo,
  };

  return addRDEvidence(input);
}

export function loadDemoPilotEvidence(items: PilotEvidenceInput[]) {
  const currentItems = getPilotEvidence();
  const realItems = currentItems.filter((item) => !item.isDemo);
  const now = new Date().toISOString();
  const demoItems: PilotEvidence[] = items.map((item, index) => ({
    ...item,
    id: `demo_pilot_${index + 1}`,
    createdDate: now,
    updatedDate: now,
  }));

  savePilotEvidence([...demoItems, ...realItems]);
}

export function clearDemoPilotEvidence() {
  savePilotEvidence(getPilotEvidence().filter((item) => !item.isDemo));
}
