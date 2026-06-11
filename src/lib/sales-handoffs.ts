import { addContentItem, getContentItems } from "@/lib/content";
import { addEngineeringTask, getEngineeringTasks } from "@/lib/engineering";
import { addRDEvidence, getRDEvidence } from "@/lib/funding";
import { addRoadmapItem, getRoadmapItems } from "@/lib/roadmap";
import { type Prospect, type SalesHandoff } from "@/lib/types";

export type HandoffWriteResult = {
  target: SalesHandoff["target"];
  createdType: "Content Item" | "Engineering Task" | "R&D Evidence" | "Roadmap Item";
  createdId: string;
  title: string;
  wasDuplicate?: boolean;
};

function handoffSourceLabel(prospect: Prospect, handoff: SalesHandoff) {
  return `Sales handoff from ${prospect.companyName}: ${handoff.trigger}`;
}

function buildNotes(prospect: Prospect, handoff: SalesHandoff) {
  return [
    handoff.notes,
    "",
    `Sales handoff ID: ${handoff.id}`,
    `Source prospect: ${prospect.companyName}`,
    `Location: ${prospect.location}`,
    `Fleet type: ${prospect.fleetType ?? "Unknown"}`,
    `Fleet size: ${prospect.estimatedFleetSize ?? "Unknown"}`,
    `Sales trigger: ${handoff.trigger}`,
    "Generated from Sales Agent handoff write-through. Draft only; review before use.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function findExistingHandoffWrite(
  handoff: SalesHandoff
): HandoffWriteResult | null {
  const marker = `Sales handoff ID: ${handoff.id}`;

  if (handoff.target === "Marketing Agent") {
    const item = getContentItems().find(
      (contentItem) =>
        contentItem.contextNotes?.includes(marker) ||
        contentItem.approvalNotes?.includes(marker)
    );

    return item
      ? {
          target: handoff.target,
          createdType: "Content Item",
          createdId: item.id,
          title: item.topic,
          wasDuplicate: true,
        }
      : null;
  }

  if (handoff.target === "Engineering Agent") {
    const task = getEngineeringTasks().find(
      (engineeringTask) =>
        engineeringTask.notesForAI?.includes(marker) ||
        engineeringTask.businessReason?.includes(marker)
    );

    return task
      ? {
          target: handoff.target,
          createdType: "Engineering Task",
          createdId: task.id,
          title: task.title,
          wasDuplicate: true,
        }
      : null;
  }

  if (handoff.target === "Funding/R&D Agent") {
    const evidence = getRDEvidence().find(
      (item) =>
        item.notes?.includes(marker) ||
        item.grantRelevance?.includes(marker)
    );

    return evidence
      ? {
          target: handoff.target,
          createdType: "R&D Evidence",
          createdId: evidence.id,
          title: evidence.problemObserved ?? evidence.source ?? "R&D evidence",
          wasDuplicate: true,
        }
      : null;
  }

  const roadmapItem = getRoadmapItems().find((item) =>
    item.notes?.includes(marker)
  );

  return roadmapItem
    ? {
        target: handoff.target,
        createdType: "Roadmap Item",
        createdId: roadmapItem.id,
        title: roadmapItem.title,
        wasDuplicate: true,
      }
    : null;
}

export function writeSalesHandoffToTarget(
  prospect: Prospect,
  handoff: SalesHandoff
): HandoffWriteResult {
  const existingWrite = findExistingHandoffWrite(handoff);

  if (existingWrite) {
    return existingWrite;
  }

  const notes = buildNotes(prospect, handoff);

  if (handoff.target === "Marketing Agent") {
    const item = addContentItem({
      topic: handoffSourceLabel(prospect, handoff),
      audience: "Fleet Owner",
      contentType:
        handoff.outputType.toLowerCase().includes("email")
          ? "Prospect Nurturing Email"
          : "Educational LinkedIn Post",
      cta: "Book a 20-minute discovery call",
      contextNotes: notes,
      draftTitle: `Sales learning: ${prospect.companyName}`,
      draftContent: handoff.notes,
      recommendedChannel: "LinkedIn / Email",
      approvalNotes: "Created from Sales Agent handoff. Human approval required.",
      contentStatus: "Idea",
    });

    return {
      target: handoff.target,
      createdType: "Content Item",
      createdId: item.id,
      title: item.topic,
    };
  }

  if (handoff.target === "Engineering Agent") {
    const task = addEngineeringTask({
      title: handoffSourceLabel(prospect, handoff),
      businessReason: `Sales feedback suggests a product improvement or risk for ${prospect.fleetType ?? "fleet"} prospects.`,
      userStory:
        "As Dickson, I want this sales learning reviewed before product promises are made so TruckFixr keeps roadmap commitments realistic.",
      priority: prospect.priority === "Critical" ? "Critical" : "High",
      affectedArea: "Dashboard",
      issueType: "Improvement",
      currentBehavior: prospect.lossNurture?.currentSolution,
      desiredBehavior: handoff.notes,
      acceptanceCriteria:
        "Review the sales learning, identify whether product work is needed, and document any do-not-promise constraints.",
      risks: "Do not promise delivery dates or modify auth, payments, or Supabase RLS without explicit approval.",
      testRequirements: "Add or update tests only if code changes are made.",
      doNotChangeAreas: "Authentication, payments, Supabase RLS, production data.",
      notesForAI: notes,
      status: "Planned",
    });

    return {
      target: handoff.target,
      createdType: "Engineering Task",
      createdId: task.id,
      title: task.title,
    };
  }

  if (handoff.target === "Funding/R&D Agent") {
    const evidence = addRDEvidence({
      date: new Date().toISOString().slice(0, 10),
      evidenceType: "Sales Conversation",
      source: prospect.companyName,
      customerPartner: prospect.companyName,
      fleetSegment: prospect.fleetType ?? "Unknown",
      problemObserved:
        prospect.maintenancePain ||
        prospect.lossNurture?.mainObjection ||
        "Sales conversation surfaced maintenance visibility or adoption evidence.",
      technicalUncertainty:
        prospect.lossNurture?.missingFeature ||
        "Review whether this learning creates a technical uncertainty or product experiment.",
      experimentTestConducted: "None yet. Created as a draft evidence entry from Sales Agent.",
      resultLearning: handoff.notes,
      commercializationEvidence:
        "Prospect feedback may support positioning, pilot scope, partner evidence, or grant narrative.",
      grantRelevance: notes,
      supportLetterPotential: "Unknown",
      confidenceLevel: "Medium",
      nextAction: "Review and decide whether this belongs in a grant/R&D evidence package.",
      notes,
    });

    return {
      target: handoff.target,
      createdType: "R&D Evidence",
      createdId: evidence.id,
      title: evidence.problemObserved ?? evidence.source ?? "R&D evidence",
    };
  }

  const item = addRoadmapItem({
    title: handoffSourceLabel(prospect, handoff),
    module: "Sales",
    phase: "Future",
    type: "Improvement",
    priority: prospect.priority === "Critical" ? "Critical" : "High",
    status: "Planned",
    businessReason:
      "Sales learning should be reviewed as a potential roadmap improvement before making customer commitments.",
    successCriteria:
      "Decision made: accept into roadmap, defer, or reject with reason. No customer promise made automatically.",
    owner: "Dickson",
    riskLevel: prospect.lossNurture?.missingFeature ? "High" : "Medium",
    notes,
  });

  return {
    target: handoff.target,
    createdType: "Roadmap Item",
    createdId: item.id,
    title: item.title,
  };
}

export function markHandoffCompleted(
  handoff: SalesHandoff,
  result: HandoffWriteResult
): SalesHandoff {
  const stamp = new Date().toISOString();
  const verb = result.wasDuplicate ? "Linked existing" : "Created";
  const completionNote = `${verb} ${result.createdType} (${result.createdId}) on ${stamp}.`;

  return {
    ...handoff,
    status: "Completed",
    notes: [handoff.notes, completionNote].filter(Boolean).join("\n\n"),
    updatedAt: stamp,
  };
}
