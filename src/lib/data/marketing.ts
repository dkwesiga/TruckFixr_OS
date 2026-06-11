"use client";

/**
 * Marketing content data access — PLACEHOLDER (not wired into UI).
 *
 * The Marketing module currently runs in local mode via
 * src/lib/content.ts. These typed helpers exist so the module can be
 * switched to Supabase later without redesigning the data layer.
 * Table: public.marketing_content (see migration 20260609000300).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";

export type MarketingContentRecord = Record<string, unknown>;

export async function listMarketingContent(): Promise<MarketingContentRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("marketing_content")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load marketing content: ${error.message}`);
  return data ?? [];
}

export async function createMarketingContent(
  input: MarketingContentRecord
): Promise<MarketingContentRecord> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("marketing_content")
    .insert({ ...input, workspace_id: workspaceId })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create marketing content: ${error.message}`);
  return data;
}
