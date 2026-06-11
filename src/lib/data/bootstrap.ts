"use client";

/**
 * First-time workspace bootstrap.
 *
 * Called once after a user signs in for the first time (or re-signs in
 * on a new device). Idempotent: safe to call every sign-in.
 *
 * 1. Upserts the user's profile row.
 * 2. If the user has no workspace yet, creates "TruckFixr HQ" and
 *    adds them as admin.
 *
 * RLS allows this because:
 *  - profiles_insert_own: id = auth.uid()
 *  - workspaces_insert_authenticated: any authenticated user may create
 *  - workspace_members_insert: profile_id = auth.uid()
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearActiveWorkspaceCache } from "@/lib/data/workspaces";

export async function bootstrapWorkspace(
  userId: string,
  email: string,
): Promise<string> {
  const supabase = getSupabaseBrowserClient();

  // 1. Upsert own profile
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, email, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  if (profileError) {
    throw new Error(`Profile setup failed: ${profileError.message}`);
  }

  // 2. Check existing workspace membership
  const { data: memberships, error: memberError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("profile_id", userId)
    .limit(1);
  if (memberError) {
    throw new Error(`Workspace check failed: ${memberError.message}`);
  }

  if (memberships && memberships.length > 0) {
    clearActiveWorkspaceCache();
    return String(memberships[0].workspace_id);
  }

  // 3. Create workspace
  const { data: ws, error: wsError } = await supabase
    .from("workspaces")
    .insert({ name: "TruckFixr HQ", slug: "truckfixr-hq", created_by: userId })
    .select("id")
    .single();
  if (wsError) {
    throw new Error(`Workspace creation failed: ${wsError.message}`);
  }

  const workspaceId = String((ws as { id: string }).id);

  // 4. Join as admin
  const { error: joinError } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspaceId, profile_id: userId, role: "admin" });
  if (joinError) {
    throw new Error(`Workspace join failed: ${joinError.message}`);
  }

  clearActiveWorkspaceCache();
  return workspaceId;
}
