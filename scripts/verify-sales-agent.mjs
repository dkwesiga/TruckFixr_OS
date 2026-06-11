import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import ts from "typescript";

const root = process.cwd();
const outDir = join(root, "node_modules", ".cache", "truckfixr-sales-verify");
const sourceFiles = [
  "src/lib/types.ts",
  "src/lib/storage.ts",
  "src/lib/content-templates.ts",
  "src/lib/content.ts",
  "src/lib/engineering.ts",
  "src/lib/funding.ts",
  "src/lib/roadmap.ts",
  "src/lib/scoring.ts",
  "src/lib/sales-workflow.ts",
  "src/lib/outreach-sequences.ts",
  "src/lib/sales-proposals.ts",
  "src/lib/pilot-health.ts",
  "src/lib/sales-activity.ts",
  "src/lib/sales-handoffs.ts",
].filter((file) => existsSync(join(root, file)));

function outName(sourceFile) {
  return `${basename(sourceFile, ".ts")}.mjs`;
}

function rewriteAliases(source) {
  return source.replaceAll(/from\s+"@\/lib\/([^"]+)"/g, (_match, importPath) => {
    return `from "./${basename(importPath)}.mjs"`;
  });
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const sourceFile of sourceFiles) {
  const absolutePath = join(root, sourceFile);
  const transpiled = ts.transpileModule(rewriteAliases(readFileSync(absolutePath, "utf8")), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
    },
    fileName: absolutePath,
  });

  const outputPath = join(outDir, outName(sourceFile));
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, transpiled.outputText);
}

const localStorageData = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => localStorageData.get(key) ?? null,
    setItem: (key, value) => localStorageData.set(key, String(value)),
    removeItem: (key) => localStorageData.delete(key),
  },
  dispatchEvent: () => true,
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
};

const { calculateScores } = await import(`file:///${join(outDir, "scoring.mjs").replaceAll("\\", "/")}`);
const { generateSequence, getComplianceWarnings } = await import(
  `file:///${join(outDir, "outreach-sequences.mjs").replaceAll("\\", "/")}`
);
const { defaultPilotProposal, generateQuoteSummaryMarkdown, defaultQuote } = await import(
  `file:///${join(outDir, "sales-proposals.mjs").replaceAll("\\", "/")}`
);
const { defaultPilotHealth, generatePilotReviewReport } = await import(
  `file:///${join(outDir, "pilot-health.mjs").replaceAll("\\", "/")}`
);
const { getSalesFinalMetrics, buildSalesCockpitAlerts } = await import(
  `file:///${join(outDir, "sales-activity.mjs").replaceAll("\\", "/")}`
);
const { writeSalesHandoffToTarget } = await import(
  `file:///${join(outDir, "sales-handoffs.mjs").replaceAll("\\", "/")}`
);
const { getContentItems } = await import(`file:///${join(outDir, "content.mjs").replaceAll("\\", "/")}`);

function baseProspect(overrides = {}) {
  return {
    id: "prospect_1",
    companyName: "Reliable Fleet Co.",
    location: "Ontario, Canada",
    fleetType: "Trucking/Logistics",
    estimatedFleetSize: "11-20",
    decisionMaker: "Pat Fleet",
    email: "pat@example.com",
    maintenancePain: "Repair visibility gaps and repeat downtime issues.",
    usesEldTelematics: "Yes",
    pilotFitScore: null,
    revenueFitScore: null,
    grantFitScore: null,
    outreachStatus: "New",
    createdDate: "2026-06-01T00:00:00.000Z",
    updatedDate: "2026-06-10T00:00:00.000Z",
    ...overrides,
  };
}

const highScore = calculateScores(baseProspect());
assert.equal(highScore.pilotFitScore, 5);
assert.ok(highScore.revenueFitScore >= 4);
assert.ok(highScore.grantFitScore >= 4);
assert.deepEqual(calculateScores({}), {
  pilotFitScore: 2,
  revenueFitScore: 2,
  grantFitScore: 2,
});

const sequenceProspect = baseProspect({
  contacts: [{ id: "contact_1", name: "Pat Fleet", consentStatus: "express" }],
});
const sequence = generateSequence(
  sequenceProspect,
  "Cold outbound sequence",
  sequenceProspect.contacts[0]
);
assert.equal(sequence.steps.length, 4);
assert.equal(sequence.drafts.length, 4);
assert.ok(sequence.drafts.every((draft) => draft.body.includes("Template draft")));
assert.equal(getComplianceWarnings(baseProspect({ doNotContact: true })).at(0)?.level, "block");

const proposal = defaultPilotProposal(baseProspect());
assert.equal(proposal.status, "Draft");
assert.ok(proposal.pilotObjective?.includes("Reliable Fleet Co."));
const quote = defaultQuote(baseProspect({ pilotProposal: proposal }));
assert.ok(generateQuoteSummaryMarkdown(baseProspect(), quote).includes("Template draft"));

const health = defaultPilotHealth();
assert.ok(generatePilotReviewReport(baseProspect(), health).includes("Draft only"));

const metricsProspect = baseProspect({
  currentStage: "Pilot Active",
  followUpSequence: [
    {
      id: "step_1",
      sequenceName: "Cold outbound sequence",
      stepName: "Manual follow-up",
      dueDate: "2026-01-01",
      channel: "email",
      status: "open",
    },
  ],
  outreachDrafts: [
    {
      id: "draft_1",
      channel: "email",
      draftType: "cold email",
      body: "Draft",
      status: "Draft",
      approvalStatus: "Needs Review",
      generatedAt: "2026-06-01T00:00:00.000Z",
    },
  ],
  handoffs: [
    {
      id: "handoff_1",
      target: "Marketing Agent",
      trigger: "Prospect needs nurture",
      outputType: "Prospect Nurturing Email",
      status: "Accepted",
      notes: "Create a careful nurture angle.",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
  ],
});
const metrics = getSalesFinalMetrics([metricsProspect]);
assert.equal(metrics.followUpsDueToday, 1);
assert.equal(metrics.draftsNeedingApproval, 1);
assert.equal(metrics.activePilots, 1);
assert.equal(metrics.handoffsReadyToWrite, 1);
assert.ok(buildSalesCockpitAlerts([metricsProspect]).some((alert) => alert.id.includes("accepted_handoffs")));

const firstWrite = writeSalesHandoffToTarget(metricsProspect, metricsProspect.handoffs[0]);
const secondWrite = writeSalesHandoffToTarget(metricsProspect, metricsProspect.handoffs[0]);
assert.equal(firstWrite.createdId, secondWrite.createdId);
assert.equal(secondWrite.wasDuplicate, true);
assert.equal(getContentItems().length, 1);

console.log("Sales Agent verification passed.");
