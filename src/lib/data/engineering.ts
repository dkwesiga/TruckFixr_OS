"use client";

/**
 * Engineering tasks data access — PLACEHOLDER (not wired into UI).
 *
 * The Engineering module currently runs in local mode via
 * src/lib/engineering.ts. Table: public.engineering_tasks
 * (see migration 20260609000300).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";

export type EngineeringTaskRecord = Record<string, unknown>;

export async function listEngineeringTasks(): Promise<EngineeringTaskRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("engineering_tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error)
    throw new Error(`Failed to load engineering tasks: ${error.message}`);
  return data ?? [];
}

export async function createEngineeringTask(
  input: EngineeringTaskRecord
): Promise<EngineeringTaskRecord> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("engineering_tasks")
    .insert({ ...input, workspace_id: workspaceId })
    .select("*")
    .single();

  if (error)
    throw new Error(`Failed to create engineering task: ${error.message}`);
  return data;
}
