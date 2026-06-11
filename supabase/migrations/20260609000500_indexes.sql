-- ============================================================
-- TruckFixr AI Operating System — Migration 5
-- Practical indexes for common query patterns.
--
-- DO NOT apply automatically. Review before running.
-- ============================================================

-- workspace_members lookups (drives every RLS check)
create index if not exists idx_workspace_members_profile
  on public.workspace_members (profile_id, status);
create index if not exists idx_workspace_members_workspace
  on public.workspace_members (workspace_id, status);

-- prospects
create index if not exists idx_prospects_workspace on public.prospects (workspace_id);
create index if not exists idx_prospects_outreach_status on public.prospects (workspace_id, outreach_status);
create index if not exists idx_prospects_created_at on public.prospects (workspace_id, created_at desc);
create index if not exists idx_prospects_updated_at on public.prospects (workspace_id, updated_at desc);
create index if not exists idx_prospects_created_by on public.prospects (created_by);
create index if not exists idx_prospects_is_demo on public.prospects (workspace_id, is_demo);
create index if not exists idx_prospects_archived_at on public.prospects (workspace_id, archived_at);
create index if not exists idx_prospects_external on public.prospects (external_source, external_id);
create index if not exists idx_prospects_sync_status on public.prospects (workspace_id, sync_status);

-- sales_outreach_drafts
create index if not exists idx_sales_drafts_workspace on public.sales_outreach_drafts (workspace_id);
create index if not exists idx_sales_drafts_prospect on public.sales_outreach_drafts (prospect_id);
create index if not exists idx_sales_drafts_status on public.sales_outreach_drafts (workspace_id, status);

-- marketing_content
create index if not exists idx_marketing_content_workspace on public.marketing_content (workspace_id);
create index if not exists idx_marketing_content_status on public.marketing_content (workspace_id, content_status);
create index if not exists idx_marketing_content_created_at on public.marketing_content (workspace_id, created_at desc);
create index if not exists idx_marketing_content_archived on public.marketing_content (workspace_id, archived_at);

-- funding_opportunities
create index if not exists idx_funding_workspace on public.funding_opportunities (workspace_id);
create index if not exists idx_funding_status on public.funding_opportunities (workspace_id, status);
create index if not exists idx_funding_type on public.funding_opportunities (workspace_id, funding_type);
create index if not exists idx_funding_deadline on public.funding_opportunities (workspace_id, deadline);
create index if not exists idx_funding_archived on public.funding_opportunities (workspace_id, archived_at);

-- funding_outreach_drafts
create index if not exists idx_funding_drafts_workspace on public.funding_outreach_drafts (workspace_id);
create index if not exists idx_funding_drafts_opportunity on public.funding_outreach_drafts (funding_opportunity_id);

-- rd_evidence
create index if not exists idx_rd_evidence_workspace on public.rd_evidence (workspace_id);
create index if not exists idx_rd_evidence_type on public.rd_evidence (workspace_id, evidence_type);
create index if not exists idx_rd_evidence_date on public.rd_evidence (workspace_id, evidence_date desc);
create index if not exists idx_rd_evidence_archived on public.rd_evidence (workspace_id, archived_at);

-- engineering_tasks
create index if not exists idx_engineering_tasks_workspace on public.engineering_tasks (workspace_id);
create index if not exists idx_engineering_tasks_status on public.engineering_tasks (workspace_id, status);
create index if not exists idx_engineering_tasks_priority on public.engineering_tasks (workspace_id, priority);
create index if not exists idx_engineering_tasks_archived on public.engineering_tasks (workspace_id, archived_at);

-- roadmap_items
create index if not exists idx_roadmap_items_workspace on public.roadmap_items (workspace_id);
create index if not exists idx_roadmap_items_status on public.roadmap_items (workspace_id, status);
create index if not exists idx_roadmap_items_priority on public.roadmap_items (workspace_id, priority);
create index if not exists idx_roadmap_items_archived on public.roadmap_items (workspace_id, archived_at);

-- documents
create index if not exists idx_documents_workspace on public.documents (workspace_id);
create index if not exists idx_documents_related on public.documents (related_entity_type, related_entity_id);

-- agent_runs
create index if not exists idx_agent_runs_workspace on public.agent_runs (workspace_id);
create index if not exists idx_agent_runs_agent_type on public.agent_runs (workspace_id, agent_type);
create index if not exists idx_agent_runs_created_at on public.agent_runs (workspace_id, created_at desc);
create index if not exists idx_agent_runs_related on public.agent_runs (related_entity_type, related_entity_id);

-- activity_logs
create index if not exists idx_activity_logs_workspace on public.activity_logs (workspace_id, created_at desc);
create index if not exists idx_activity_logs_entity on public.activity_logs (entity_type, entity_id);

-- saved_prompts / prompt_templates
create index if not exists idx_saved_prompts_workspace on public.saved_prompts (workspace_id);
create index if not exists idx_prompt_templates_workspace on public.prompt_templates (workspace_id);

-- ------------------------------------------------------------
-- FUTURE: full-text search.
-- When search is needed, add a generated tsvector column + GIN
-- index per table. Example (do NOT run until needed):
--
--   alter table public.prospects
--     add column search_vector tsvector
--     generated always as (
--       setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
--       setweight(to_tsvector('english', coalesce(location, '')), 'B') ||
--       setweight(to_tsvector('english', coalesce(notes, '')), 'C')
--     ) stored;
--
--   create index idx_prospects_search
--     on public.prospects using gin (search_vector);
--
-- Not implemented in v1 — current UI filters client-side.
-- ------------------------------------------------------------
