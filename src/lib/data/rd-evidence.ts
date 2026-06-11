"use client";

/**
 * R&D evidence data access — PLACEHOLDER (not wired into UI).
 *
 * The R&D evidence log currently runs in local mode via
 * src/lib/funding.ts. Table: public.rd_evidence
 * (see migration 20260609000300).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";

export type RDEvidenceRecord = Record<string, unknown>;

export async function listRDEvidence(): Promise<RDEvidenceRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("rd_evidence")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("evidence_date", { ascending: false, nullsFirst: false });

  if (error) throw new Error(`Failed to load R&D evidence: ${error.message}`);
  return data ?? [];
}

export async function createRDEvidence(
  input: RDEvidenceRecord
): Promise<RDEvidenceRecord> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("rd_evidence")
    .insert({ ...input, workspace_id: workspaceId })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create R&D evidence: ${error.message}`);
  return data;
}
