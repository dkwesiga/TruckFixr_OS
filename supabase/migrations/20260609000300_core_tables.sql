-- ============================================================
-- TruckFixr AI Operating System — Migration 3
-- Core business tables for all internal OS modules.
--
-- Conventions used by every business table:
--   id            uuid primary key
--   workspace_id  tenant scope (RLS anchor)
--   created_by    profile that created the record
--   created_at / updated_at / archived_at
--   is_demo       demo data flag (safe cleanup target)
--   metadata      jsonb escape hatch for AI/integration data
--
-- Major business records also carry integration sync fields:
--   external_source / external_id / sync_status / last_synced_at
--
-- DO NOT apply automatically. Review before running.
-- ============================================================

-- ------------------------------------------------------------
-- company_profiles: the "Settings" company positioning record
-- (maps to the frontend CompanySettings interface).
-- ------------------------------------------------------------
create table if not exists public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_name text not null,
  core_positioning text,
  primary_icp text,
  secondary_icp text,
  strategic_icp text,
  cta text,
  pilot_offer text,
  discovery_pilot_value text,
  early_partner_range text,
  paid_implementation_range text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_company_profiles_updated_at
  before update on public.company_profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- ai_provider_settings: model/provider preferences per use case.
-- SECURITY: never store API keys or secrets in this table.
-- Keys live in environment variables / Edge Function secrets.
-- ------------------------------------------------------------
create table if not exists public.ai_provider_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  model_name text not null,
  use_case text,
  temperature numeric,
  max_tokens integer,
  is_enabled boolean not null default true,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

comment on table public.ai_provider_settings is
  'Provider/model preferences only. NEVER store API keys or secrets here.';

create trigger trg_ai_provider_settings_updated_at
  before update on public.ai_provider_settings
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- prospects: Sales Agent pipeline records.
-- Maps to the frontend Prospect interface (camelCase -> snake_case).
-- Outreach draft text lives in sales_outreach_drafts; the legacy
-- per-prospect draft fields round-trip through metadata for v1.
-- ------------------------------------------------------------
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_name text not null,
  website text,
  location text not null,
  fleet_type text
    check (fleet_type is null or fleet_type in
      ('Trucking/Logistics', 'Construction', 'Contractor', 'Courier', 'Mixed', 'Other')),
  estimated_fleet_size text,
  decision_maker text,
  contact_name text,
  email text,
  phone text,
  linkedin_url text,
  source_notes text,
  maintenance_pain text,
  uses_eld_telematics text not null default 'Unknown'
    check (uses_eld_telematics in ('Yes', 'No', 'Unknown')),
  pilot_fit_score smallint check (pilot_fit_score between 1 and 5),
  revenue_fit_score smallint check (revenue_fit_score between 1 and 5),
  grant_fit_score smallint check (grant_fit_score between 1 and 5),
  outreach_status text not null default 'New'
    check (outreach_status in
      ('New', 'Researched', 'Drafted', 'Approved', 'Sent', 'Replied',
       'Discovery Booked', 'Pilot Fit', 'Proposal Sent', 'Won', 'Nurture', 'Lost')),
  next_action text,
  last_contact_date date,
  notes text,
  approval_status text not null default 'none'
    check (approval_status in ('none', 'pending', 'approved', 'rejected')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  approval_notes text,
  external_source text,
  external_id text,
  sync_status text not null default 'not_synced'
    check (sync_status in ('not_synced', 'pending', 'synced', 'failed', 'imported', 'exported')),
  last_synced_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_prospects_updated_at
  before update on public.prospects
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- sales_outreach_drafts: outreach drafts per prospect.
-- draft_type examples: first_email | linkedin_connect |
-- linkedin_follow_up | phone_script | personalization_prompt
-- ------------------------------------------------------------
create table if not exists public.sales_outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  draft_type text not null,
  subject text,
  body text,
  channel text
    check (channel is null or channel in ('email', 'linkedin', 'phone', 'other')),
  status text not null default 'draft'
    check (status in ('draft', 'edited', 'approved', 'sent', 'discarded')),
  approval_status text not null default 'none'
    check (approval_status in ('none', 'pending', 'approved', 'rejected')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  approval_notes text,
  generated_by_agent_run_id uuid,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_sales_outreach_drafts_updated_at
  before update on public.sales_outreach_drafts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- marketing_content: Marketing Agent content pipeline.
-- Maps to the frontend ContentItem interface. content_status uses
-- the existing frontend vocabulary; status mirrors a simpler
-- workflow state for integrations.
-- ------------------------------------------------------------
create table if not exists public.marketing_content (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  topic text,
  audience text,
  content_type text,
  platform text,
  draft_title text,
  draft_body text,
  suggested_hashtags text[],
  risk_notes text,
  recommended_channel text,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'scheduled', 'published', 'deferred')),
  content_status text not null default 'Idea'
    check (content_status in ('Idea', 'Drafted', 'Approved', 'Published', 'Deferred')),
  approval_status text not null default 'none'
    check (approval_status in ('none', 'pending', 'approved', 'rejected')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  approval_notes text,
  scheduled_for timestamptz,
  published_at timestamptz,
  notes text,
  external_source text,
  external_id text,
  sync_status text not null default 'not_synced'
    check (sync_status in ('not_synced', 'pending', 'synced', 'failed', 'imported', 'exported')),
  last_synced_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_marketing_content_updated_at
  before update on public.marketing_content
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- funding_opportunities: grants/loans/subsidies pipeline.
-- Maps to the frontend FundingOpportunity interface. The 12-item
-- grant readiness checklist lives in metadata->'grantReadiness'.
-- ------------------------------------------------------------
create table if not exists public.funding_opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  organization text,
  funding_type text
    check (funding_type is null or funding_type in
      ('Grant', 'Loan', 'Wage Subsidy', 'Accelerator', 'Competition', 'Investor',
       'R&D Support', 'Hiring Grant', 'Pilot Funding', 'Other')),
  source_url text,
  deadline date,
  amount_min numeric,
  amount_max numeric,
  eligibility_summary text,
  fit_score smallint check (fit_score between 1 and 5),
  required_partner text not null default 'Unknown'
    check (required_partner in ('Yes', 'No', 'Unknown')),
  customer_support_letter_needed text not null default 'Unknown'
    check (customer_support_letter_needed in ('Yes', 'No', 'Unknown')),
  contact_person text,
  contact_email text,
  status text not null default 'Researching'
    check (status in
      ('Researching', 'Fit', 'Applied', 'Follow-up', 'Not Fit', 'Won', 'Lost', 'Deferred')),
  next_action text,
  notes text,
  external_source text,
  external_id text,
  sync_status text not null default 'not_synced'
    check (sync_status in ('not_synced', 'pending', 'synced', 'failed', 'imported', 'exported')),
  last_synced_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_funding_opportunities_updated_at
  before update on public.funding_opportunities
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- funding_outreach_drafts: investor/funder outreach drafts.
-- funding_opportunity_id is nullable so investor outreach not tied
-- to a specific program can still be stored.
-- ------------------------------------------------------------
create table if not exists public.funding_outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  funding_opportunity_id uuid references public.funding_opportunities(id) on delete set null,
  recipient_name text,
  recipient_email text,
  subject text,
  body text,
  status text not null default 'draft'
    check (status in ('draft', 'edited', 'approved', 'sent', 'discarded')),
  approval_status text not null default 'none'
    check (approval_status in ('none', 'pending', 'approved', 'rejected')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  approval_notes text,
  generated_by_agent_run_id uuid,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_funding_outreach_drafts_updated_at
  before update on public.funding_outreach_drafts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- rd_evidence: R&D evidence log (SR&ED / grant support).
-- Maps to the frontend RDEvidence interface; detailed R&D fields
-- (technical uncertainty, experiment, result) live in dedicated
-- columns where stable, metadata for the rest.
-- ------------------------------------------------------------
create table if not exists public.rd_evidence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  evidence_type text not null,
  title text,
  summary text,
  source text,
  related_customer text,
  related_project text,
  evidence_date date,
  problem_observed text,
  technical_uncertainty text,
  experiment_conducted text,
  result_learning text,
  business_value text,
  technical_value text,
  grant_relevance text,
  support_letter_potential text not null default 'Unknown'
    check (support_letter_potential in ('Yes', 'No', 'Unknown')),
  confidence_level text not null default 'Medium'
    check (confidence_level in ('Low', 'Medium', 'High')),
  next_action text,
  notes text,
  document_id uuid,
  status text not null default 'logged'
    check (status in ('logged', 'reviewed', 'used_in_application', 'archived')),
  external_source text,
  external_id text,
  sync_status text not null default 'not_synced'
    check (sync_status in ('not_synced', 'pending', 'synced', 'failed', 'imported', 'exported')),
  last_synced_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_rd_evidence_updated_at
  before update on public.rd_evidence
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- engineering_tasks: engineering backlog with AI-prompt support.
-- Maps to the frontend EngineeringTask interface; AI scaffolding
-- fields (risks, doNotChangeAreas, notesForAI) live in metadata.
-- ------------------------------------------------------------
create table if not exists public.engineering_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text,
  task_type text,
  priority text not null default 'Medium'
    check (priority in ('Critical', 'High', 'Medium', 'Low')),
  status text not null default 'Planned'
    check (status in
      ('Planned', 'In Progress', 'Blocked', 'Ready for Codex', 'PR Drafted',
       'Review Needed', 'Done', 'Deferred')),
  module text,
  business_reason text,
  user_story text,
  current_behavior text,
  desired_behavior text,
  github_issue_url text,
  codex_prompt text,
  acceptance_criteria text,
  test_plan text,
  rollback_plan text,
  completed_at timestamptz,
  external_source text,
  external_id text,
  sync_status text not null default 'not_synced'
    check (sync_status in ('not_synced', 'pending', 'synced', 'failed', 'imported', 'exported')),
  last_synced_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_engineering_tasks_updated_at
  before update on public.engineering_tasks
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- roadmap_items: product/ops roadmap.
-- Maps to the frontend RoadmapItem interface; owner/riskLevel/
-- module/type live in dedicated columns or metadata.
-- ------------------------------------------------------------
create table if not exists public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text,
  module text,
  item_type text,
  phase text
    check (phase is null or phase in ('Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Future')),
  priority text not null default 'Medium'
    check (priority in ('Critical', 'High', 'Medium', 'Low')),
  status text not null default 'Planned'
    check (status in ('Planned', 'In Progress', 'Blocked', 'Done', 'Deferred')),
  owner text,
  risk_level text
    check (risk_level is null or risk_level in ('Low', 'Medium', 'High')),
  target_date date,
  dependency_notes text,
  decision_notes text,
  business_reason text,
  success_criteria text,
  notes text,
  external_source text,
  external_id text,
  sync_status text not null default 'not_synced'
    check (sync_status in ('not_synced', 'pending', 'synced', 'failed', 'imported', 'exported')),
  last_synced_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_roadmap_items_updated_at
  before update on public.roadmap_items
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- documents: lightweight references to external documents
-- (Drive, Notion, etc). Not a file store.
-- ------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  document_type text,
  external_url text,
  storage_provider text,
  related_entity_type text,
  related_entity_id uuid,
  notes text,
  external_source text,
  external_id text,
  sync_status text not null default 'not_synced'
    check (sync_status in ('not_synced', 'pending', 'synced', 'failed', 'imported', 'exported')),
  last_synced_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- agent_runs: audit log of AI agent executions (prompt in/out).
-- No live AI in v1; table exists so future Edge Functions can log.
-- ------------------------------------------------------------
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_type text not null,
  use_case text,
  input_prompt text,
  output_text text,
  provider text,
  model_name text,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'succeeded', 'failed', 'cancelled')),
  error_message text,
  token_estimate integer,
  cost_estimate numeric,
  related_entity_type text,
  related_entity_id uuid,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_agent_runs_updated_at
  before update on public.agent_runs
  for each row execute function public.set_updated_at();

-- Link drafts to the agent run that generated them (FK added after
-- agent_runs exists; drafts tables were created earlier).
alter table public.sales_outreach_drafts
  add constraint fk_sales_drafts_agent_run
  foreign key (generated_by_agent_run_id) references public.agent_runs(id)
  on delete set null;

alter table public.funding_outreach_drafts
  add constraint fk_funding_drafts_agent_run
  foreign key (generated_by_agent_run_id) references public.agent_runs(id)
  on delete set null;

alter table public.rd_evidence
  add constraint fk_rd_evidence_document
  foreign key (document_id) references public.documents(id)
  on delete set null;

-- ------------------------------------------------------------
-- activity_logs: manual, meaningful activity entries written by
-- app code (no automatic triggers in v1). Append-only by design.
-- ------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id uuid,
  actor_id uuid references public.profiles(id),
  summary text,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- saved_prompts: user-saved prompt snippets.
-- prompt_templates: reusable parameterized templates.
-- ------------------------------------------------------------
create table if not exists public.saved_prompts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  prompt_text text not null,
  use_case text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_saved_prompts_updated_at
  before update on public.saved_prompts
  for each row execute function public.set_updated_at();

create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  template_text text not null,
  variables text[],
  use_case text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  is_demo boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_prompt_templates_updated_at
  before update on public.prompt_templates
  for each row execute function public.set_updated_at();
