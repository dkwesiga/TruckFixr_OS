"use client";

/**
 * Documents data access — PLACEHOLDER (not wired into UI).
 *
 * Lightweight references to external documents (Drive, Notion, ...).
 * Table: public.documents (see migration 20260609000300).
 */

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveWorkspaceId } from "@/lib/data/workspaces";

export type DocumentRecord = Record<string, unknown>;

export async function listDocuments(): Promise<DocumentRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load documents: ${error.message}`);
  return data ?? [];
}

export async function createDocument(
  input: DocumentRecord
): Promise<DocumentRecord> {
  const supabase = getSupabaseBrowserClient();
  const workspaceId = await getActiveWorkspaceId();
  const { data, error } = await supabase
    .from("documents")
    .insert({ ...input, workspace_id: workspaceId })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create document: ${error.message}`);
  return data;
}
