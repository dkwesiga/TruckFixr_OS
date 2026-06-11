"use client";

/**
 * Roadmap items data access — PLACEHOLDER (not wired into UI).
 *
 * The Roadmap module currently runs in local mode via
 * src/lib/roadmap.ts. Table: public.roadmap_items
 * (see migration 20260609000300).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";

export type RoadmapItemRecord = Record<string, unknown>;

export async function listRoadmapItems(): Promise<RoadmapItemRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("roadmap_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load roadmap items: ${error.message}`);
  return data ?? [];
}

export async function createRoadmapItem(
  input: RoadmapItemRecord
): Promise<RoadmapItemRecord> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("roadmap_items")
    .insert({ ...input, workspace_id: workspaceId })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create roadmap item: ${error.message}`);
  return data;
}
