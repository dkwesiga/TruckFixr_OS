"use client";

/**
 * Agent runs data access — PLACEHOLDER (not wired into UI).
 *
 * Audit log for AI agent executions. No live AI in v1; future Edge
 * Functions write here. Table: public.agent_runs
 * (see migration 20260609000300).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";

export type AgentRunRecord = Record<string, unknown>;

export async function listAgentRuns(): Promise<AgentRunRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(`Failed to load agent runs: ${error.message}`);
  return data ?? [];
}

export async function createAgentRun(
  input: AgentRunRecord
): Promise<AgentRunRecord> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("agent_runs")
    .insert({ ...input, workspace_id: workspaceId })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create agent run: ${error.message}`);
  return data;
}
