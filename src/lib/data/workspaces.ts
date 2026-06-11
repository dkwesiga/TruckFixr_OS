"use client";

/**
 * Workspace data access (Supabase mode).
 *
 * v1 keeps workspace handling simple: the active workspace is the
 * first workspace the signed-in user belongs to (RLS already limits
 * the query to member workspaces). The id is cached per session.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string | null;
  isDemo: boolean;
};

let cachedWorkspaceId: string | null = null;

export async function listWorkspaces(): Promise<WorkspaceSummary[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, slug, is_demo")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load workspaces: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: row.slug === null ? null : String(row.slug),
    isDemo: Boolean(row.is_demo),
  }));
}

/**
 * Resolves the active workspace id for the current Supabase session.
 * Throws a clear, user-facing error when no session or workspace exists.
 */
export async function getActiveWorkspaceId(): Promise<string> {
  if (cachedWorkspaceId) {
    return cachedWorkspaceId;
  }

  const supabase = getSupabaseBrowserClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    throw new Error(
      "Supabase mode requires a signed-in Supabase Auth session. Sign in to Supabase (Auth UI is a planned next step), or switch NEXT_PUBLIC_DATA_MODE to local."
    );
  }

  const workspaces = await listWorkspaces();

  if (workspaces.length === 0) {
    throw new Error(
      "No workspace found for this user. Run the seed SQL (supabase/seed/seed_demo_data.sql) or create a workspace and workspace_members row for your profile."
    );
  }

  cachedWorkspaceId = workspaces[0].id;
  return cachedWorkspaceId;
}

export function clearActiveWorkspaceCache(): void {
  cachedWorkspaceId = null;
}
