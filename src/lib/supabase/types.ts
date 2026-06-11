/**
 * Supabase database types — PLACEHOLDER.
 *
 * The prospects table (the only module connected in v1) is typed by
 * hand below so the data layer is fully type-safe today. Once a
 * Supabase project exists, replace this entire file with generated
 * types:
 *
 *   supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
 *
 * (or, with a linked local project: `supabase gen types typescript --linked`)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SyncStatus =
  | "not_synced"
  | "pending"
  | "synced"
  | "failed"
  | "imported"
  | "exported";

export type ApprovalStatus = "none" | "pending" | "approved" | "rejected";

export interface ProspectRow {
  id: string;
  workspace_id: string;
  company_name: string;
  website: string | null;
  location: string;
  fleet_type: string | null;
  estimated_fleet_size: string | null;
  decision_maker: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  source_notes: string | null;
  maintenance_pain: string | null;
  uses_eld_telematics: "Yes" | "No" | "Unknown";
  pilot_fit_score: number | null;
  revenue_fit_score: number | null;
  grant_fit_score: number | null;
  outreach_status: string;
  next_action: string | null;
  last_contact_date: string | null;
  notes: string | null;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  external_source: string | null;
  external_id: string | null;
  sync_status: SyncStatus;
  last_synced_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  is_demo: boolean;
  metadata: Json;
}

export type ProspectInsert = Partial<ProspectRow> & {
  workspace_id: string;
  company_name: string;
  location: string;
};

export type ProspectUpdate = Partial<ProspectRow>;

export interface SalesOutreachDraftRow {
  id: string;
  workspace_id: string;
  prospect_id: string;
  draft_type: string;
  subject: string | null;
  body: string | null;
  channel: "email" | "linkedin" | "phone" | "other" | null;
  status: "draft" | "edited" | "approved" | "sent" | "discarded";
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  generated_by_agent_run_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  is_demo: boolean;
  metadata: Json;
}

export type SalesOutreachDraftInsert = Partial<SalesOutreachDraftRow> & {
  workspace_id: string;
  prospect_id: string;
  draft_type: string;
};

export type SalesOutreachDraftUpdate = Partial<SalesOutreachDraftRow>;

/**
 * Minimal Database shape covering the connected tables. Tables not
 * yet connected use a permissive Row type until generated types
 * replace this file.
 */
type LooseTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      prospects: {
        Row: ProspectRow;
        Insert: ProspectInsert;
        Update: ProspectUpdate;
        Relationships: [];
      };
      sales_outreach_drafts: {
        Row: SalesOutreachDraftRow;
        Insert: SalesOutreachDraftInsert;
        Update: SalesOutreachDraftUpdate;
        Relationships: [];
      };
      workspaces: LooseTable;
      profiles: LooseTable;
      workspace_members: LooseTable;
      company_profiles: LooseTable;
      ai_provider_settings: LooseTable;
      marketing_content: LooseTable;
      funding_opportunities: LooseTable;
      funding_outreach_drafts: LooseTable;
      rd_evidence: LooseTable;
      engineering_tasks: LooseTable;
      roadmap_items: LooseTable;
      documents: LooseTable;
      agent_runs: LooseTable;
      activity_logs: LooseTable;
      saved_prompts: LooseTable;
      prompt_templates: LooseTable;
    };
    Views: Record<string, never>;
    Functions: {
      is_workspace_member: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
      is_workspace_admin: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
