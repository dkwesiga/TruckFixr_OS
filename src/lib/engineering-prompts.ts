import { type EngineeringTask } from "@/lib/types";

export type EngineeringPromptType =
  | "Bug fix"
  | "Feature development"
  | "Weekly codebase review"
  | "Mobile/PWA layout review"
  | "Supabase security/RLS review"
  | "Landing page conversion improvement"
  | "PR review"
  | "Test generation"
  | "Documentation update"
  | "ELD/telematics integration planning";

export const engineeringPromptTypes: EngineeringPromptType[] = [
  "Bug fix",
  "Feature development",
  "Weekly codebase review",
  "Mobile/PWA layout review",
  "Supabase security/RLS review",
  "Landing page conversion improvement",
  "PR review",
  "Test generation",
  "Documentation update",
  "ELD/telematics integration planning",
];

function truckFixrContext() {
  return [
    "TruckFixr product context:",
    "- TruckFixr Fleet AI is an Ontario-based internal product for commercial truck repair and fleet maintenance workflows.",
    "- The team is small and founder-led, so implementation quality, change focus, and reviewability matter.",
    "- This Engineering Agent manages scoped product work only. No automatic code modification or direct main-branch merge is allowed.",
  ].join("\n");
}

function promptInstruction(promptType: EngineeringPromptType) {
  switch (promptType) {
    case "Bug fix":
      return "Focus on isolating the root cause, proposing a small fix, and validating the behavior change.";
    case "Feature development":
      return "Focus on a scoped feature plan, implementation notes, and how to keep the change small and reversible.";
    case "Weekly codebase review":
      return "Focus on risks, regressions, missing tests, and the highest-value cleanup opportunities for this task area.";
    case "Mobile/PWA layout review":
      return "Focus on responsive behavior, viewport fit, tap targets, and layout regressions across mobile and tablet sizes.";
    case "Supabase security/RLS review":
      return "Focus on security boundaries, RLS assumptions, data access paths, and whether the written task requires explicit approval before changes.";
    case "Landing page conversion improvement":
      return "Focus on clearer value communication, stronger CTAs, and low-risk copy or layout improvements tied to fleet pilot conversion.";
    case "PR review":
      return "Focus on reviewing the intended changes, spotting regressions, and summarizing concrete follow-up actions.";
    case "Test generation":
      return "Focus on the smallest useful test coverage that proves the task behavior and catches likely regressions.";
    case "Documentation update":
      return "Focus on concise internal documentation that reflects the task accurately and avoids speculative claims.";
    case "ELD/telematics integration planning":
      return "Focus on architecture, constraints, security concerns, data boundaries, and a phased plan before any implementation.";
  }
}

function formatTaskDetails(task: EngineeringTask) {
  return JSON.stringify(
    {
      title: task.title,
      businessReason: task.businessReason,
      userStory: task.userStory,
      priority: task.priority,
      affectedArea: task.affectedArea,
      issueType: task.issueType,
      currentBehavior: task.currentBehavior,
      desiredBehavior: task.desiredBehavior,
      acceptanceCriteria: task.acceptanceCriteria,
      filesLikelyInvolved: task.filesLikelyInvolved,
      risks: task.risks,
      testRequirements: task.testRequirements,
      doNotChangeAreas: task.doNotChangeAreas,
      notesForAI: task.notesForAI,
      status: task.status,
    },
    null,
    2
  );
}

export function generateEngineeringPrompt(
  task: EngineeringTask,
  promptType: EngineeringPromptType
) {
  return [
    `Prompt type: ${promptType}`,
    "",
    truckFixrContext(),
    "",
    "Task focus:",
    promptInstruction(promptType),
    "",
    "Full task details:",
    formatTaskDetails(task),
    "",
    `Affected area: ${task.affectedArea}`,
    `Files likely involved: ${task.filesLikelyInvolved ?? "Not specified"}`,
    `Do-not-change areas: ${task.doNotChangeAreas ?? "Not specified"}`,
    "",
    "Required outputs:",
    "- Proposed implementation plan",
    "- Test plan",
    "- Security review",
    "- Rollback steps",
    "- Explanation of all files changed",
    "",
    "Safety rules:",
    "- Work only from the written task spec",
    "- Make small, focused changes only",
    "- Do not modify authentication, payments, or Supabase RLS without explicit written approval",
    "- Do not expose API keys or customer data",
    "- Do not merge directly to main",
    "- Always provide a test plan",
    "- Always include rollback steps",
    "- Explain all files changed",
  ].join("\n");
}

function impactSummary(task: EngineeringTask) {
  const text = [
    task.businessReason,
    task.affectedArea,
    task.issueType,
    task.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const pilotImpact = /pilot|mobile ui|diagnostics|vehicle|onboarding|fleet/.test(
    text
  )
    ? "High"
    : "Medium";
  const revenueImpact = /landing page|payments|onboarding|dashboard|feature|conversion/.test(
    text
  )
    ? "High"
    : "Medium";
  const grantImpact = /grant|r&d|rd|telematics|supabase|security|diagnostics/.test(
    text
  )
    ? "High"
    : "Low";

  return { pilotImpact, revenueImpact, grantImpact };
}

export function generateSprintReport(tasks: EngineeringTask[]) {
  const generatedAt = new Date().toISOString();

  return [
    "# TruckFixr Engineering Sprint Plan",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Selected Tasks",
    ...tasks.flatMap((task, index) => {
      const impact = impactSummary(task);

      return [
        `${index + 1}. ${task.title}`,
        `- Business reason: ${task.businessReason ?? "Not specified"}`,
        `- Priority: ${task.priority}`,
        `- Status: ${task.status}`,
        `- Pilot impact: ${impact.pilotImpact}`,
        `- Revenue impact: ${impact.revenueImpact}`,
        `- Grant impact: ${impact.grantImpact}`,
        `- Risks and required reviews: ${task.risks ?? "Standard engineering review and focused QA"}`,
        `- Expected outputs: ${task.acceptanceCriteria ?? "Scoped implementation, review notes, and verification steps"}`,
        `- Codex prompt to run: ${task.issueType === "Bug" ? "Bug fix" : "Feature development"} for ${task.title}`,
        "",
      ];
    }),
  ].join("\n");
}

export function generateGitHubIssueMarkdown(task: EngineeringTask) {
  return [
    `# ${task.title}`,
    "",
    "## Business Reason",
    task.businessReason ?? "Not specified",
    "",
    "## User Story",
    task.userStory ?? "Not specified",
    "",
    "## Priority",
    task.priority,
    "",
    "## Affected Area",
    task.affectedArea,
    "",
    "## Current Behavior",
    task.currentBehavior ?? "Not specified",
    "",
    "## Desired Behavior",
    task.desiredBehavior ?? "Not specified",
    "",
    "## Acceptance Criteria",
    task.acceptanceCriteria ?? "Not specified",
    "",
    "## Likely Files",
    task.filesLikelyInvolved ?? "Not specified",
    "",
    "## Risks",
    task.risks ?? "Not specified",
    "",
    "## Test Requirements",
    task.testRequirements ?? "Not specified",
    "",
    "## Do-Not-Change Areas",
    task.doNotChangeAreas ?? "Not specified",
    "",
    "## Notes for AI",
    task.notesForAI ?? "Not specified",
  ].join("\n");
}

export function generatePrChecklistMarkdown(task: EngineeringTask) {
  return [
    "# PR Checklist",
    "",
    `## Summary of Changes`,
    `- Task: ${task.title}`,
    `- Business purpose: ${task.businessReason ?? "Not specified"}`,
    "",
    "## Files Changed",
    task.filesLikelyInvolved ?? "- To be filled during implementation",
    "",
    "## Tests Run",
    task.testRequirements ?? "- To be filled during implementation",
    "",
    "## Screenshots if UI Changed",
    "- Attach before/after screenshots if applicable",
    "",
    "## Security/Privacy Impact",
    task.affectedArea === "Security" || task.affectedArea === "Supabase"
      ? "- Review required for security-sensitive changes"
      : "- No major security impact expected unless implementation expands scope",
    "",
    "## Database Impact",
    /supabase|database|rls/i.test(
      [task.affectedArea, task.filesLikelyInvolved, task.notesForAI]
        .filter(Boolean)
        .join(" ")
    )
      ? "- Possible database impact. Review carefully."
      : "- No database impact expected.",
    "",
    "## Auth/Payment Impact",
    /auth|payment|payments|security/i.test(
      [task.affectedArea, task.doNotChangeAreas, task.notesForAI]
        .filter(Boolean)
        .join(" ")
    )
      ? "- Check whether auth or payment boundaries were touched."
      : "- No auth or payment impact expected.",
    "",
    "## Rollback Steps",
    "- Revert the scoped task changes",
    "- Re-run the task test plan",
    "- Confirm the previous behavior is restored",
    "",
    "## Human Review Required",
    "Yes",
  ].join("\n");
}
