"use client";

/**
 * Activity logs data access — PLACEHOLDER (not wired into UI).
 *
 * Manual, meaningful activity entries written by app code (no
 * automatic logging triggers in v1). Append-only: no update helper
 * by design. Table: public.activity_logs
 * (see migration 20260609000300).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";

export type ActivityLogRecord = Record<string, unknown>;

export type ActivityLogInput = {
  action: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};

export async function listActivityLogs(limit = 100): Promise<ActivityLogRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load activity logs: ${error.message}`);
  return data ?? [];
}

export async function logActivity(
  input: ActivityLogInput
): Promise<ActivityLogRecord> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("activity_logs")
    .insert({
      workspace_id: workspaceId,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      summary: input.summary ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to write activity log: ${error.message}`);
  return data;
}
