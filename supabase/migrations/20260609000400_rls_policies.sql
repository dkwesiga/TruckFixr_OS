-- ============================================================
-- TruckFixr AI Operating System — Migration 4
-- Row Level Security for all tables.
--
-- Policy model:
--   - Active workspace members: SELECT / INSERT / UPDATE
--   - Workspace admins only: DELETE (prefer archive over delete)
--   - activity_logs: members can read + insert; no update/delete
--   - profiles: user can read/update own profile
--   - Never use the service role key in client-side code.
--
-- DO NOT apply automatically. Review before running.
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ------------------------------------------------------------
-- workspaces
-- ------------------------------------------------------------
alter table public.workspaces enable row level security;

create policy "workspaces_select_member"
  on public.workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

-- Any authenticated user may create a workspace (they become its
-- admin via app code inserting a workspace_members row).
create policy "workspaces_insert_authenticated"
  on public.workspaces for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "workspaces_update_admin"
  on public.workspaces for update
  to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

create policy "workspaces_delete_admin"
  on public.workspaces for delete
  to authenticated
  using (public.is_workspace_admin(id));

-- ------------------------------------------------------------
-- workspace_members
-- ------------------------------------------------------------
alter table public.workspace_members enable row level security;

create policy "workspace_members_select_member"
  on public.workspace_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id) or profile_id = auth.uid());

-- Bootstrapping: a user may insert themselves; admins may add others.
create policy "workspace_members_insert"
  on public.workspace_members for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    or public.is_workspace_admin(workspace_id)
  );

create policy "workspace_members_update_admin"
  on public.workspace_members for update
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "workspace_members_delete_admin"
  on public.workspace_members for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id));

-- ------------------------------------------------------------
-- Standard business-table policies.
-- Same pattern for every workspace-scoped table:
--   select/insert/update -> active member
--   delete               -> admin only
-- ------------------------------------------------------------

-- company_profiles
alter table public.company_profiles enable row level security;
create policy "company_profiles_select" on public.company_profiles for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "company_profiles_insert" on public.company_profiles for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "company_profiles_update" on public.company_profiles for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "company_profiles_delete" on public.company_profiles for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- ai_provider_settings
alter table public.ai_provider_settings enable row level security;
create policy "ai_provider_settings_select" on public.ai_provider_settings for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "ai_provider_settings_insert" on public.ai_provider_settings for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "ai_provider_settings_update" on public.ai_provider_settings for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "ai_provider_settings_delete" on public.ai_provider_settings for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- prospects
alter table public.prospects enable row level security;
create policy "prospects_select" on public.prospects for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "prospects_insert" on public.prospects for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "prospects_update" on public.prospects for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "prospects_delete" on public.prospects for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- sales_outreach_drafts
alter table public.sales_outreach_drafts enable row level security;
create policy "sales_outreach_drafts_select" on public.sales_outreach_drafts for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "sales_outreach_drafts_insert" on public.sales_outreach_drafts for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "sales_outreach_drafts_update" on public.sales_outreach_drafts for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "sales_outreach_drafts_delete" on public.sales_outreach_drafts for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- marketing_content
alter table public.marketing_content enable row level security;
create policy "marketing_content_select" on public.marketing_content for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "marketing_content_insert" on public.marketing_content for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "marketing_content_update" on public.marketing_content for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "marketing_content_delete" on public.marketing_content for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- funding_opportunities
alter table public.funding_opportunities enable row level security;
create policy "funding_opportunities_select" on public.funding_opportunities for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "funding_opportunities_insert" on public.funding_opportunities for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "funding_opportunities_update" on public.funding_opportunities for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "funding_opportunities_delete" on public.funding_opportunities for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- funding_outreach_drafts
alter table public.funding_outreach_drafts enable row level security;
create policy "funding_outreach_drafts_select" on public.funding_outreach_drafts for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "funding_outreach_drafts_insert" on public.funding_outreach_drafts for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "funding_outreach_drafts_update" on public.funding_outreach_drafts for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "funding_outreach_drafts_delete" on public.funding_outreach_drafts for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- rd_evidence
alter table public.rd_evidence enable row level security;
create policy "rd_evidence_select" on public.rd_evidence for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "rd_evidence_insert" on public.rd_evidence for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "rd_evidence_update" on public.rd_evidence for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "rd_evidence_delete" on public.rd_evidence for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- engineering_tasks
alter table public.engineering_tasks enable row level security;
create policy "engineering_tasks_select" on public.engineering_tasks for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "engineering_tasks_insert" on public.engineering_tasks for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "engineering_tasks_update" on public.engineering_tasks for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "engineering_tasks_delete" on public.engineering_tasks for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- roadmap_items
alter table public.roadmap_items enable row level security;
create policy "roadmap_items_select" on public.roadmap_items for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "roadmap_items_insert" on public.roadmap_items for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "roadmap_items_update" on public.roadmap_items for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "roadmap_items_delete" on public.roadmap_items for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- documents
alter table public.documents enable row level security;
create policy "documents_select" on public.documents for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "documents_insert" on public.documents for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "documents_update" on public.documents for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "documents_delete" on public.documents for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- agent_runs
alter table public.agent_runs enable row level security;
create policy "agent_runs_select" on public.agent_runs for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "agent_runs_insert" on public.agent_runs for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "agent_runs_update" on public.agent_runs for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "agent_runs_delete" on public.agent_runs for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- ------------------------------------------------------------
-- activity_logs: append-only for members. No update policy and
-- no member delete policy on purpose; admins may delete (e.g.
-- demo cleanup).
-- ------------------------------------------------------------
alter table public.activity_logs enable row level security;
create policy "activity_logs_select" on public.activity_logs for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "activity_logs_insert" on public.activity_logs for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "activity_logs_delete_admin" on public.activity_logs for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- saved_prompts
alter table public.saved_prompts enable row level security;
create policy "saved_prompts_select" on public.saved_prompts for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "saved_prompts_insert" on public.saved_prompts for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "saved_prompts_update" on public.saved_prompts for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "saved_prompts_delete" on public.saved_prompts for delete
  to authenticated using (public.is_workspace_admin(workspace_id));

-- prompt_templates
alter table public.prompt_templates enable row level security;
create policy "prompt_templates_select" on public.prompt_templates for select
  to authenticated using (public.is_workspace_member(workspace_id));
create policy "prompt_templates_insert" on public.prompt_templates for insert
  to authenticated with check (public.is_workspace_member(workspace_id));
create policy "prompt_templates_update" on public.prompt_templates for update
  to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "prompt_templates_delete" on public.prompt_templates for delete
  to authenticated using (public.is_workspace_admin(workspace_id));
