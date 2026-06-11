"use client";

/**
 * Funding opportunities data access — PLACEHOLDER (not wired into UI).
 *
 * The Funding module currently runs in local mode via
 * src/lib/funding.ts. Tables: public.funding_opportunities and
 * public.funding_outreach_drafts (see migration 20260609000300).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";

export type FundingOpportunityRecord = Record<string, unknown>;

export async function listFundingOpportunities(): Promise<
  FundingOpportunityRecord[]
> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("funding_opportunities")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("deadline", { ascending: true, nullsFirst: false });

  if (error)
    throw new Error(`Failed to load funding opportunities: ${error.message}`);
  return data ?? [];
}

export async function createFundingOpportunity(
  input: FundingOpportunityRecord
): Promise<FundingOpportunityRecord> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("funding_opportunities")
    .insert({ ...input, workspace_id: workspaceId })
    .select("*")
    .single();

  if (error)
    throw new Error(`Failed to create funding opportunity: ${error.message}`);
  return data;
}
