"use client";

/**
 * Mode-aware data access for Sales/Prospects — the first module
 * connected to Supabase.
 *
 *  - local mode:    delegates to the existing localStorage helpers
 *  - demo mode:     localStorage + auto-loads fictional demo prospects
 *  - supabase mode: typed queries against public.prospects
 *
 * The React components consume ONLY this module (async API), so the
 * storage backend can change without touching the UI again.
 *
 * Supabase notes:
 *  - "Delete" archives (sets archived_at) instead of hard-deleting,
 *    matching the RLS model where only admins may hard-delete.
 *  - Legacy per-prospect draft fields round-trip through
 *    metadata.drafts until the UI moves to sales_outreach_drafts.
 */

import { demoProspects } from "@/lib/demo-data";
import * as localProspects from "@/lib/prospects";
import { type ProspectInput } from "@/lib/prospects";
import { calculateScores } from "@/lib/scoring";
import { getDataMode, type DataMode } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  type Json,
  type ProspectInsert,
  type ProspectRow,
  type ProspectUpdate,
} from "@/lib/supabase/types";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";
import { type Prospect } from "@/lib/types";

export { type ProspectInput } from "@/lib/prospects";

type Score = 1 | 2 | 3 | 4 | 5 | null;

const DEMO_SEEDED_KEY = "tf_os_demo_mode_seeded";

// ------------------------------------------------------------------
// Row mapping: ProspectRow (snake_case) <-> Prospect (camelCase)
// ------------------------------------------------------------------

function toScore(value: number | null): Score {
  if (value === null || value < 1 || value > 5) return null;
  return Math.round(value) as Exclude<Score, null>;
}

type DraftFields = Pick<
  Prospect,
  | "firstEmailDraft"
  | "linkedInConnectDraft"
  | "linkedInFollowUpDraft"
  | "phoneScript"
  | "cta"
  | "llmPersonalizationPrompt"
>;

function readDraftMetadata(metadata: Json): DraftFields {
  const drafts =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, Json | undefined>).drafts
      : undefined;

  if (!drafts || typeof drafts !== "object" || Array.isArray(drafts)) {
    return {};
  }

  const record = drafts as Record<string, Json | undefined>;
  const str = (key: string) =>
    typeof record[key] === "string" ? (record[key] as string) : undefined;

  return {
    firstEmailDraft: str("firstEmailDraft"),
    linkedInConnectDraft: str("linkedInConnectDraft"),
    linkedInFollowUpDraft: str("linkedInFollowUpDraft"),
    phoneScript: str("phoneScript"),
    cta: str("cta"),
    llmPersonalizationPrompt: str("llmPersonalizationPrompt"),
  };
}

const SALES_WORKFLOW_METADATA_KEYS = [
  "serviceArea",
  "vehicleTypes",
  "numberOfLocations",
  "inHouseMaintenance",
  "outsourcedMaintenance",
  "currentMaintenanceProcess",
  "currentMaintenanceSoftware",
  "eldTelematicsProvider",
  "leadSource",
  "leadSourceDetail",
  "campaignName",
  "campaignType",
  "referrerName",
  "referrerCompany",
  "eventName",
  "landingPageUrl",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "firstTouchDate",
  "latestTouchDate",
  "convertedFromCampaign",
  "urgency",
  "decisionMakerIdentified",
  "budgetOwnerIdentified",
  "pilotInterest",
  "buyingTimeline",
  "estimatedMonthlyValue",
  "estimatedPilotValue",
  "estimatedAnnualValue",
  "pricingFit",
  "commercialNotes",
  "rdFundingEvidenceScore",
  "speedToCloseScore",
  "commercialReadinessScore",
  "currentStage",
  "previousStage",
  "stageChangedDate",
  "stageNotes",
  "nextActionDueDate",
  "nextActionOwner",
  "priority",
  "stalled",
  "stalledReason",
  "consentStatus",
  "consentSource",
  "consentNotes",
  "consentCapturedAt",
  "unsubscribeStatus",
  "unsubscribedAt",
  "doNotContact",
  "doNotContactReason",
  "lastOutreachDate",
  "outreachCount30Days",
  "nextAllowedOutreachDate",
  "externalSource",
  "externalId",
  "syncStatus",
  "lastSyncedAt",
  "gmailThreadId",
  "gmailMessageId",
  "calendarEventId",
  "meetingUrl",
  "lastEmailSentAt",
  "lastEmailReceivedAt",
  "lastMeetingDate",
  "nextMeetingDate",
  "contacts",
  "outreachDrafts",
  "followUpSequence",
  "discoveryWorkflow",
  "pilotProposal",
  "quote",
  "onboardingChecklist",
  "pilotSuccessPlan",
  "internalHandoffNote",
  "pilotHealth",
  "pilotReviewReport",
  "lossNurture",
  "partnerReferrals",
  "intelligenceRecords",
  "handoffs",
  "archivedAt",
] as const satisfies readonly (keyof Prospect)[];

function readSalesWorkflowMetadata(metadata: Json): Partial<Prospect> {
  const workflow =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, Json | undefined>).salesWorkflow
      : undefined;

  if (!workflow || typeof workflow !== "object" || Array.isArray(workflow)) {
    return {};
  }

  return workflow as Partial<Prospect>;
}

function pickSalesWorkflowMetadata(
  input: Partial<ProspectInput>
): Partial<Record<(typeof SALES_WORKFLOW_METADATA_KEYS)[number], unknown>> {
  const metadata: Partial<
    Record<(typeof SALES_WORKFLOW_METADATA_KEYS)[number], unknown>
  > = {};

  SALES_WORKFLOW_METADATA_KEYS.forEach((key) => {
    if (input[key] !== undefined) {
      metadata[key] = input[key];
    }
  });

  return metadata;
}

export function rowToProspect(row: ProspectRow): Prospect {
  return {
    id: row.id,
    companyName: row.company_name,
    website: row.website ?? undefined,
    location: row.location,
    fleetType: (row.fleet_type ?? undefined) as Prospect["fleetType"],
    estimatedFleetSize: (row.estimated_fleet_size ??
      undefined) as Prospect["estimatedFleetSize"],
    decisionMaker: row.decision_maker ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    linkedIn: row.linkedin_url ?? undefined,
    sourceNotes: row.source_notes ?? undefined,
    maintenancePain: row.maintenance_pain ?? undefined,
    usesEldTelematics: row.uses_eld_telematics,
    pilotFitScore: toScore(row.pilot_fit_score),
    revenueFitScore: toScore(row.revenue_fit_score),
    grantFitScore: toScore(row.grant_fit_score),
    outreachStatus: row.outreach_status as Prospect["outreachStatus"],
    nextAction: row.next_action ?? undefined,
    lastContactDate: row.last_contact_date ?? undefined,
    notes: row.notes ?? undefined,
    ...readDraftMetadata(row.metadata),
    ...readSalesWorkflowMetadata(row.metadata),
    isDemo: row.is_demo,
    createdDate: row.created_at,
    updatedDate: row.updated_at,
  };
}

function prospectToRowFields(
  input: Partial<ProspectInput>
): Omit<ProspectUpdate, "id" | "workspace_id" | "created_at" | "updated_at"> {
  const fields: ProspectUpdate = {};

  if (input.companyName !== undefined) fields.company_name = input.companyName;
  if (input.website !== undefined) fields.website = input.website || null;
  if (input.location !== undefined) fields.location = input.location;
  if (input.fleetType !== undefined) fields.fleet_type = input.fleetType ?? null;
  if (input.estimatedFleetSize !== undefined)
    fields.estimated_fleet_size = input.estimatedFleetSize ?? null;
  if (input.decisionMaker !== undefined)
    fields.decision_maker = input.decisionMaker || null;
  if (input.email !== undefined) fields.email = input.email || null;
  if (input.phone !== undefined) fields.phone = input.phone || null;
  if (input.linkedIn !== undefined) fields.linkedin_url = input.linkedIn || null;
  if (input.sourceNotes !== undefined)
    fields.source_notes = input.sourceNotes || null;
  if (input.maintenancePain !== undefined)
    fields.maintenance_pain = input.maintenancePain || null;
  if (input.usesEldTelematics !== undefined)
    fields.uses_eld_telematics = input.usesEldTelematics;
  if (input.pilotFitScore !== undefined)
    fields.pilot_fit_score = input.pilotFitScore;
  if (input.revenueFitScore !== undefined)
    fields.revenue_fit_score = input.revenueFitScore;
  if (input.grantFitScore !== undefined)
    fields.grant_fit_score = input.grantFitScore;
  if (input.outreachStatus !== undefined)
    fields.outreach_status = input.outreachStatus;
  if (input.nextAction !== undefined)
    fields.next_action = input.nextAction || null;
  if (input.lastContactDate !== undefined)
    fields.last_contact_date = input.lastContactDate || null;
  if (input.notes !== undefined) fields.notes = input.notes || null;
  if (input.isDemo !== undefined) fields.is_demo = input.isDemo ?? false;

  const drafts: Record<string, string> = {};
  if (input.firstEmailDraft) drafts.firstEmailDraft = input.firstEmailDraft;
  if (input.linkedInConnectDraft)
    drafts.linkedInConnectDraft = input.linkedInConnectDraft;
  if (input.linkedInFollowUpDraft)
    drafts.linkedInFollowUpDraft = input.linkedInFollowUpDraft;
  if (input.phoneScript) drafts.phoneScript = input.phoneScript;
  if (input.cta) drafts.cta = input.cta;
  if (input.llmPersonalizationPrompt)
    drafts.llmPersonalizationPrompt = input.llmPersonalizationPrompt;

  const salesWorkflow = pickSalesWorkflowMetadata(input);
  const metadata: Record<string, Json> = {};

  if (Object.keys(drafts).length > 0) {
    metadata.drafts = drafts as Json;
  }

  if (Object.keys(salesWorkflow).length > 0) {
    metadata.salesWorkflow = salesWorkflow as Json;
  }

  if (Object.keys(metadata).length > 0) {
    fields.metadata = metadata as Json;
  }

  return fields;
}

// ------------------------------------------------------------------
// Demo mode: seed fictional prospects once per browser
// ------------------------------------------------------------------

function ensureDemoSeeded(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(DEMO_SEEDED_KEY) === "true") return;

  localProspects.loadDemoProspects(demoProspects);
  window.localStorage.setItem(DEMO_SEEDED_KEY, "true");
}

// ------------------------------------------------------------------
// Supabase implementations
// ------------------------------------------------------------------

async function supabaseListProspects(): Promise<Prospect[]> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();

  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load prospects: ${error.message}`);
  return (data ?? []).map(rowToProspect);
}

async function supabaseGetProspect(id: string): Promise<Prospect | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load prospect: ${error.message}`);
  return data ? rowToProspect(data) : null;
}

async function supabaseCreateProspect(input: ProspectInput): Promise<Prospect> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const calculated = calculateScores(input);

  const insert: ProspectInsert = {
    workspace_id: workspaceId,
    company_name: input.companyName,
    location: input.location,
    ...prospectToRowFields({
      ...input,
      pilotFitScore: input.pilotFitScore ?? calculated.pilotFitScore,
      revenueFitScore: input.revenueFitScore ?? calculated.revenueFitScore,
      grantFitScore: input.grantFitScore ?? calculated.grantFitScore,
    }),
  };

  const { data, error } = await supabase
    .from("prospects")
    .insert(insert)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create prospect: ${error.message}`);
  return rowToProspect(data);
}

async function supabaseUpdateProspect(
  id: string,
  updates: Partial<Prospect>
): Promise<Prospect | null> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("prospects")
    .update(prospectToRowFields(updates))
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update prospect: ${error.message}`);
  return data ? rowToProspect(data) : null;
}

/** Supabase mode archives instead of hard-deleting (RLS: delete is admin-only). */
async function supabaseArchiveProspect(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("prospects")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`Failed to archive prospect: ${error.message}`);
}

async function supabaseImportProspects(
  inputs: ProspectInput[]
): Promise<{ imported: number; skipped: number }> {
  const existing = await supabaseListProspects();
  const existingNames = new Set(
    existing.map((prospect) => prospect.companyName.trim().toLowerCase())
  );

  let imported = 0;
  let skipped = 0;

  for (const input of inputs) {
    const normalized = input.companyName.trim().toLowerCase();
    if (!input.companyName.trim() || !input.location.trim()) {
      skipped += 1;
      continue;
    }
    if (existingNames.has(normalized)) {
      skipped += 1;
      continue;
    }
    await supabaseCreateProspect(input);
    existingNames.add(normalized);
    imported += 1;
  }

  return { imported, skipped };
}

// ------------------------------------------------------------------
// Public mode-aware API (async everywhere so the UI is backend-agnostic)
// ------------------------------------------------------------------

export function getProspectsDataMode(): DataMode {
  return getDataMode();
}

export async function listProspects(): Promise<Prospect[]> {
  const mode = getDataMode();

  if (mode === "supabase") return supabaseListProspects();
  if (mode === "demo") ensureDemoSeeded();
  return localProspects.getProspects();
}

export async function getProspect(id: string): Promise<Prospect | null> {
  if (getDataMode() === "supabase") return supabaseGetProspect(id);
  return localProspects.getProspect(id);
}

export async function createProspect(input: ProspectInput): Promise<Prospect> {
  if (getDataMode() === "supabase") return supabaseCreateProspect(input);
  return localProspects.addProspect(input);
}

export async function updateProspect(
  id: string,
  updates: Partial<Prospect>
): Promise<Prospect | null> {
  if (getDataMode() === "supabase") return supabaseUpdateProspect(id, updates);
  return localProspects.updateProspect(id, updates);
}

/**
 * Removes a prospect from the active pipeline.
 * local/demo: hard delete from localStorage.
 * supabase:   archive (archived_at) — hard delete is admin-only via RLS.
 */
export async function removeProspect(id: string): Promise<void> {
  if (getDataMode() === "supabase") {
    await supabaseArchiveProspect(id);
    return;
  }
  localProspects.deleteProspect(id);
}

export async function archiveProspect(id: string): Promise<void> {
  return removeProspect(id);
}

export async function importProspects(
  inputs: ProspectInput[]
): Promise<{ imported: number; skipped: number }> {
  if (getDataMode() === "supabase") return supabaseImportProspects(inputs);
  return localProspects.importProspects(inputs);
}

// ------------------------------------------------------------------
// Sales outreach drafts (Supabase mode only — local mode keeps drafts
// on the prospect record itself, as today)
// ------------------------------------------------------------------

export type SalesOutreachDraftInput = {
  prospectId: string;
  draftType: string;
  subject?: string;
  body?: string;
  channel?: "email" | "linkedin" | "phone" | "other";
  status?: "draft" | "edited" | "approved" | "sent" | "discarded";
};

export async function listSalesOutreachDrafts(prospectId: string) {
  if (getDataMode() !== "supabase") {
    // Local/demo mode stores drafts on the prospect record; there is
    // no separate drafts collection to list.
    return [];
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("sales_outreach_drafts")
    .select("*")
    .eq("prospect_id", prospectId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load drafts: ${error.message}`);
  return data ?? [];
}

export async function createSalesOutreachDraft(input: SalesOutreachDraftInput) {
  if (getDataMode() !== "supabase") {
    throw new Error(
      "Standalone outreach drafts require Supabase mode. In local mode, drafts are stored on the prospect record."
    );
  }

  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("sales_outreach_drafts")
    .insert({
      workspace_id: workspaceId,
      prospect_id: input.prospectId,
      draft_type: input.draftType,
      subject: input.subject ?? null,
      body: input.body ?? null,
      channel: input.channel ?? null,
      status: input.status ?? "draft",
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create draft: ${error.message}`);
  return data;
}

export async function updateSalesOutreachDraft(
  id: string,
  input: Partial<SalesOutreachDraftInput>
) {
  if (getDataMode() !== "supabase") {
    throw new Error(
      "Standalone outreach drafts require Supabase mode. In local mode, drafts are stored on the prospect record."
    );
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("sales_outreach_drafts")
    .update({
      ...(input.draftType !== undefined && { draft_type: input.draftType }),
      ...(input.subject !== undefined && { subject: input.subject ?? null }),
      ...(input.body !== undefined && { body: input.body ?? null }),
      ...(input.channel !== undefined && { channel: input.channel ?? null }),
      ...(input.status !== undefined && { status: input.status }),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update draft: ${error.message}`);
  return data;
}
