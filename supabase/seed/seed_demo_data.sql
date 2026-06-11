-- ============================================================
-- TruckFixr AI Operating System — Demo Seed Data
--
-- All data below is FICTIONAL investor-demo data.
-- Every record sets is_demo = true AND metadata->'demo' = true
-- so it can be safely removed later (see cleanup SQL in
-- docs/supabase-setup.md).
--
-- BEFORE RUNNING:
-- 1. Create a user in Supabase Auth (Dashboard > Authentication).
-- 2. Replace YOUR_AUTH_USER_ID below with that user's UUID.
-- 3. Review every statement. Do not run on a database holding
--    real TruckFixr records without reviewing first.
--
-- Run manually with:
--   supabase db execute --file supabase/seed/seed_demo_data.sql
-- or paste into the Supabase SQL editor.
-- ============================================================

do $$
declare
  -- !!! REPLACE with your real auth.users id before running !!!
  admin_user_id uuid := 'YOUR_AUTH_USER_ID';

  ws_id uuid := '11111111-1111-4111-8111-111111111101';

  prospect_1 uuid := '22222222-2222-4222-8222-222222220001';
  prospect_2 uuid := '22222222-2222-4222-8222-222222220002';
  prospect_3 uuid := '22222222-2222-4222-8222-222222220003';
  prospect_4 uuid := '22222222-2222-4222-8222-222222220004';
  prospect_5 uuid := '22222222-2222-4222-8222-222222220005';

  funding_1 uuid := '33333333-3333-4333-8333-333333330001';
  funding_2 uuid := '33333333-3333-4333-8333-333333330002';
  funding_3 uuid := '33333333-3333-4333-8333-333333330003';
  funding_4 uuid := '33333333-3333-4333-8333-333333330004';
  funding_5 uuid := '33333333-3333-4333-8333-333333330005';

  doc_1 uuid := '44444444-4444-4444-8444-444444440001';
  doc_2 uuid := '44444444-4444-4444-8444-444444440002';
  doc_3 uuid := '44444444-4444-4444-8444-444444440003';

  run_1 uuid := '55555555-5555-4555-8555-555555550001';
  run_2 uuid := '55555555-5555-4555-8555-555555550002';
begin

-- ------------------------------------------------------------
-- Profile (assumes the auth user already exists)
-- ------------------------------------------------------------
insert into public.profiles (id, email, full_name, role, metadata)
values (admin_user_id, 'demo-admin@example.com', 'Demo Admin', 'founder',
        '{"demo": true}'::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Workspace + membership
-- ------------------------------------------------------------
insert into public.workspaces (id, name, slug, description, is_demo, created_by, metadata)
values (ws_id, 'TruckFixr Demo Workspace', 'truckfixr-demo',
        'Fictional investor-demo workspace for the TruckFixr AI Operating System.',
        true, admin_user_id, '{"demo": true}'::jsonb)
on conflict (id) do nothing;

insert into public.workspace_members (workspace_id, profile_id, role, status, metadata)
values (ws_id, admin_user_id, 'admin', 'active', '{"demo": true}'::jsonb)
on conflict (workspace_id, profile_id) do nothing;

-- ------------------------------------------------------------
-- 5 fictional prospects
-- ------------------------------------------------------------
insert into public.prospects
  (id, workspace_id, company_name, website, location, fleet_type, estimated_fleet_size,
   decision_maker, email, phone, maintenance_pain, uses_eld_telematics,
   pilot_fit_score, revenue_fit_score, grant_fit_score, outreach_status,
   next_action, notes, created_by, is_demo, metadata)
values
  (prospect_1, ws_id, 'Northline Haulage (Demo)', 'https://example.com/northline',
   'Mississauga, ON', 'Trucking/Logistics', '11-20',
   'Operations Manager', 'ops@example.com', '(555) 010-0001',
   'Frequent unplanned downtime on older tractors; no central maintenance view.',
   'Yes', 5, 4, 4, 'Discovery Booked',
   'Prepare discovery call agenda', 'Fictional demo record.', admin_user_id, true,
   '{"demo": true}'::jsonb),
  (prospect_2, ws_id, 'Greater GTA Builders Fleet (Demo)', 'https://example.com/gtabuilders',
   'Toronto, ON', 'Construction', '6-10',
   'Fleet Coordinator', 'fleet@example.com', '(555) 010-0002',
   'Seasonal equipment downtime spikes; paper-based repair logs.',
   'No', 4, 3, 4, 'Sent',
   'Follow up on intro email in 3 business days', 'Fictional demo record.', admin_user_id, true,
   '{"demo": true}'::jsonb),
  (prospect_3, ws_id, 'Capital Courier Co. (Demo)', 'https://example.com/capitalcourier',
   'Ottawa, ON', 'Courier', '21-50',
   'Director of Operations', 'dir-ops@example.com', '(555) 010-0003',
   'High vehicle utilization; reactive maintenance only.',
   'Yes', 4, 5, 3, 'Replied',
   'Book discovery call', 'Fictional demo record.', admin_user_id, true,
   '{"demo": true}'::jsonb),
  (prospect_4, ws_id, 'Lakeshore Contracting (Demo)', 'https://example.com/lakeshore',
   'Hamilton, ON', 'Contractor', '2-5',
   'Owner', 'owner@example.com', '(555) 010-0004',
   'Single point of failure when key truck is down.',
   'Unknown', 2, 2, 2, 'Researched',
   'Confirm fleet size before outreach', 'Fictional demo record.', admin_user_id, true,
   '{"demo": true}'::jsonb),
  (prospect_5, ws_id, 'Bruce Peninsula Freight (Demo)', 'https://example.com/bpfreight',
   'Owen Sound, ON', 'Trucking/Logistics', '6-10',
   'General Manager', 'gm@example.com', '(555) 010-0005',
   'Long routes; breakdowns far from preferred shops.',
   'Yes', 3, 3, 3, 'New',
   'Score and research decision maker', 'Fictional demo record.', admin_user_id, true,
   '{"demo": true}'::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 5 fictional sales outreach drafts
-- ------------------------------------------------------------
insert into public.sales_outreach_drafts
  (workspace_id, prospect_id, draft_type, subject, body, channel, status,
   created_by, is_demo, metadata)
values
  (ws_id, prospect_1, 'first_email', 'Fleet maintenance visibility at Northline',
   'Template draft - review before sending. Hi, mid-sized trucking teams often feel pressure around downtime... (fictional demo draft)',
   'email', 'approved', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, prospect_1, 'phone_script', null,
   'Template draft - review before sending. Hi, is this the Operations Manager? This is Dickson from TruckFixr... (fictional demo draft)',
   'phone', 'draft', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, prospect_2, 'first_email', 'Construction fleet uptime at GTA Builders',
   'Template draft - review before sending. Hi, construction fleets lose the most during peak season... (fictional demo draft)',
   'email', 'sent', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, prospect_3, 'linkedin_connect', null,
   'Template draft - review before sending. Hi, I work with TruckFixr on downtime visibility for courier fleets... (fictional demo draft)',
   'linkedin', 'sent', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, prospect_3, 'linkedin_follow_up', null,
   'Template draft - review before sending. Thanks for connecting. If reactive maintenance is on your radar... (fictional demo draft)',
   'linkedin', 'draft', admin_user_id, true, '{"demo": true}'::jsonb);

-- ------------------------------------------------------------
-- 5 fictional marketing content records
-- ------------------------------------------------------------
insert into public.marketing_content
  (workspace_id, title, topic, audience, content_type, platform, draft_body,
   status, content_status, created_by, is_demo, metadata)
values
  (ws_id, 'Why small fleets lose the most to downtime', 'Downtime economics',
   'Fleet Owner', 'Educational LinkedIn Post', 'LinkedIn',
   'Fictional demo draft body about downtime costs for 5-25 vehicle fleets.',
   'published', 'Published', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Founder note: what we learned in our first pilot', 'Pilot learnings',
   'Fleet Manager', 'Pilot Learning Post', 'LinkedIn',
   'Fictional demo draft body about pilot learnings.',
   'approved', 'Approved', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'ELD data is underused — here is the maintenance angle', 'Telematics',
   'Fleet Manager', 'Educational LinkedIn Post', 'LinkedIn',
   'Fictional demo draft body about ELD/telematics maintenance signals.',
   'draft', 'Drafted', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Pilot partner spotlight (anonymized)', 'Case study',
   'Investor', 'Case Study Draft', 'Blog',
   'Fictional demo case study draft with anonymized fleet.',
   'review', 'Drafted', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'R&D update: predicting failures from fault-code patterns', 'R&D credibility',
   'Grant/Funding Partner', 'Grant/R&D Credibility Post', 'LinkedIn',
   'Fictional demo draft about fault-code pattern research.',
   'draft', 'Idea', admin_user_id, true, '{"demo": true}'::jsonb);

-- ------------------------------------------------------------
-- 5 fictional funding opportunities
-- ------------------------------------------------------------
insert into public.funding_opportunities
  (id, workspace_id, name, organization, funding_type, source_url, deadline,
   amount_min, amount_max, eligibility_summary, fit_score, status, next_action,
   notes, created_by, is_demo, metadata)
values
  (funding_1, ws_id, 'Provincial Vehicle Tech R&D Program (Demo)', 'Demo Provincial Agency',
   'R&D Support', 'https://example.com/demo-rd-program', current_date + 45,
   50000, 150000, 'Ontario SMEs developing vehicle technology with a customer partner.',
   5, 'Fit', 'Draft project overview', 'Fictional demo program — verify from official sources.',
   admin_user_id, true, '{"demo": true}'::jsonb),
  (funding_2, ws_id, 'National Industrial Research Assistance (Demo)', 'Demo Federal Agency',
   'Grant', 'https://example.com/demo-irap', null,
   25000, 75000, 'Incorporated Canadian SMEs with technical uncertainty in product development.',
   4, 'Researching', 'Book intake call with advisor', 'Fictional demo program — verify from official sources.',
   admin_user_id, true, '{"demo": true}'::jsonb),
  (funding_3, ws_id, 'Graduate R&D Internship Match (Demo)', 'Demo Research Org',
   'Wage Subsidy', 'https://example.com/demo-internship', current_date + 90,
   10000, 30000, 'Companies partnering with a university researcher or graduate intern.',
   3, 'Researching', 'Identify academic partner', 'Fictional demo program — verify from official sources.',
   admin_user_id, true, '{"demo": true}'::jsonb),
  (funding_4, ws_id, 'Underrepresented Founders Growth Fund (Demo)', 'Demo Foundation',
   'Grant', 'https://example.com/demo-founders-fund', current_date + 20,
   10000, 25000, 'Early-stage companies led by underrepresented founders.',
   4, 'Applied', 'Await response; prepare follow-up', 'Fictional demo program — verify from official sources.',
   admin_user_id, true, '{"demo": true}'::jsonb),
  (funding_5, ws_id, 'First Hire Wage Support (Demo)', 'Demo Employment Agency',
   'Hiring Grant', 'https://example.com/demo-hiring', null,
   5000, 15000, 'Small businesses making their first technical hire.',
   2, 'Deferred', 'Revisit after first revenue milestone', 'Fictional demo program — verify from official sources.',
   admin_user_id, true, '{"demo": true}'::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 5 fictional R&D evidence records
-- ------------------------------------------------------------
insert into public.rd_evidence
  (workspace_id, evidence_type, title, summary, source, related_customer,
   evidence_date, technical_uncertainty, result_learning, business_value,
   grant_relevance, support_letter_potential, confidence_level, status,
   created_by, is_demo, metadata)
values
  (ws_id, 'Customer Discovery', 'Fleet managers cannot rank repair urgency',
   'Across fictional discovery calls, managers said fault codes lack severity context.',
   'Discovery calls', 'Northline Haulage (Demo)', current_date - 30,
   'Unknown whether severity can be inferred from fault-code co-occurrence.',
   'Co-occurrence patterns look promising on sample data.',
   'Severity ranking is the most-requested feature.',
   'Supports R&D program technical uncertainty narrative.', 'Yes', 'High', 'logged',
   admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Technical Experiment', 'Fault-code clustering prototype',
   'Prototype clustering of fictional fault-code sequences into failure precursors.',
   'Internal experiment', null, current_date - 21,
   'Whether unsupervised clustering yields actionable precursor groups.',
   'Initial clusters align with 3 known failure modes; noise remains high.',
   'Could reduce diagnostic time for partner fleets.',
   'Direct SR&ED-style experimental evidence.', 'No', 'Medium', 'logged',
   admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Pilot Feedback', 'Pilot fleet wants weekly summary, not live alerts',
   'Fictional pilot operator preferred a weekly digest over real-time notifications.',
   'Pilot check-in', 'Capital Courier Co. (Demo)', current_date - 14,
   'Optimal alert cadence for small fleet operators was unknown.',
   'Weekly digest increased engagement in the fictional pilot.',
   'Shapes product packaging for the SMB tier.',
   'Demonstrates customer-driven iteration.', 'Yes', 'High', 'reviewed',
   admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'ELD/Telematics Requirement', 'Telematics data export formats vary widely',
   'Fictional survey of ELD vendors showed inconsistent export schemas.',
   'Vendor docs review', null, current_date - 10,
   'Whether a unified ingestion layer can normalize major ELD formats.',
   'Three of five sampled formats map cleanly; two need custom adapters.',
   'Integration breadth is a sales differentiator.',
   'Supports integration R&D workstream.', 'Unknown', 'Medium', 'logged',
   admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Sales Conversation', 'Owner-operators budget by repair event, not monthly',
   'Fictional sales calls revealed budgeting psychology differences by fleet size.',
   'Sales calls', 'Lakeshore Contracting (Demo)', current_date - 7,
   null,
   'Pricing page should offer per-event framing for smallest fleets.',
   'Informs pricing experiments.',
   'Commercialization evidence for grant narratives.', 'No', 'Medium', 'logged',
   admin_user_id, true, '{"demo": true}'::jsonb);

-- ------------------------------------------------------------
-- 5 fictional engineering tasks
-- ------------------------------------------------------------
insert into public.engineering_tasks
  (workspace_id, title, description, task_type, priority, status, module,
   acceptance_criteria, created_by, is_demo, metadata)
values
  (ws_id, 'Normalize ELD export ingestion', 'Build adapter layer for the two non-standard ELD formats found in research.',
   'Feature', 'High', 'Planned', 'Telematics',
   'Both formats import without manual mapping.', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Weekly digest email template', 'Replace live alerts with a weekly fleet health digest.',
   'Feature', 'High', 'In Progress', 'Diagnostics',
   'Digest renders for a 10-vehicle fictional fleet.', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Fault-code severity heuristic v0', 'Encode the 3 validated precursor clusters as severity rules.',
   'Feature', 'Critical', 'Ready for Codex', 'Diagnostics',
   'Severity assigned for 90% of sample fault codes.', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Fix vehicle list pagination bug', 'Pagination skips page 2 when fleet has exactly 21 vehicles.',
   'Bug', 'Medium', 'Done', 'Vehicle Management',
   'Page 2 renders correctly at boundary sizes.', admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Document pilot onboarding runbook', 'Write the internal runbook used during fictional pilots.',
   'Documentation', 'Low', 'Planned', 'Onboarding',
   'Runbook covers setup through first digest.', admin_user_id, true, '{"demo": true}'::jsonb);

-- ------------------------------------------------------------
-- 5 fictional roadmap items
-- ------------------------------------------------------------
insert into public.roadmap_items
  (workspace_id, title, description, module, item_type, phase, priority, status,
   owner, risk_level, target_date, created_by, is_demo, metadata)
values
  (ws_id, 'Sales pipeline Supabase migration', 'Move prospects from localStorage to Supabase.',
   'Sales', 'Data', 'Phase 1', 'Critical', 'In Progress', 'Dickson', 'Medium',
   current_date + 14, admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Marketing content calendar view', 'Weekly calendar layout for planned content.',
   'Marketing', 'Feature', 'Phase 2', 'Medium', 'Planned', 'Codex', 'Low',
   current_date + 45, admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Grant readiness scoring automation', 'Auto-score readiness from checklist completion.',
   'Funding/R&D', 'Automation', 'Phase 2', 'High', 'Planned', 'Dickson', 'Medium',
   current_date + 60, admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'Agent run audit dashboard', 'Visualize agent_runs cost and outcomes.',
   'Dashboard', 'Feature', 'Phase 3', 'Medium', 'Planned', 'Future Hire', 'Low',
   null, admin_user_id, true, '{"demo": true}'::jsonb),
  (ws_id, 'ELD integration partner API', 'First live telematics partner integration.',
   'Integrations', 'Integration', 'Phase 3', 'High', 'Blocked', 'Developer', 'High',
   null, admin_user_id, true, '{"demo": true}'::jsonb)
on conflict do nothing;

-- ------------------------------------------------------------
-- 3 fictional document references
-- ------------------------------------------------------------
insert into public.documents
  (id, workspace_id, title, document_type, external_url, storage_provider,
   related_entity_type, related_entity_id, notes, created_by, is_demo, metadata)
values
  (doc_1, ws_id, 'Demo Pilot Agreement Template', 'agreement',
   'https://example.com/docs/pilot-agreement', 'google_drive',
   'prospect', prospect_1, 'Fictional template reference.', admin_user_id, true, '{"demo": true}'::jsonb),
  (doc_2, ws_id, 'Demo R&D Program Application Draft', 'application',
   'https://example.com/docs/rd-application', 'google_drive',
   'funding_opportunity', funding_1, 'Fictional application draft reference.', admin_user_id, true, '{"demo": true}'::jsonb),
  (doc_3, ws_id, 'Demo Investor One-Pager', 'pitch',
   'https://example.com/docs/one-pager', 'notion',
   null, null, 'Fictional investor one-pager reference.', admin_user_id, true, '{"demo": true}'::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Sample agent runs (no live AI — illustrative audit records)
-- ------------------------------------------------------------
insert into public.agent_runs
  (id, workspace_id, agent_type, use_case, input_prompt, output_text, provider,
   model_name, status, token_estimate, related_entity_type, related_entity_id,
   created_by, is_demo, metadata)
values
  (run_1, ws_id, 'sales_outreach', 'first_email_draft',
   'Draft a first outreach email for Northline Haulage... (fictional)',
   'Subject: Fleet maintenance visibility... (fictional output)', 'demo_provider',
   'demo-model-1', 'succeeded', 850, 'prospect', prospect_1,
   admin_user_id, true, '{"demo": true}'::jsonb),
  (run_2, ws_id, 'prospect_research', 'fleet_research',
   'Find 10 commercial fleet companies in Ontario... (fictional)',
   '[{"companyName": "..."}] (fictional output)', 'demo_provider',
   'demo-model-1', 'succeeded', 2400, null, null,
   admin_user_id, true, '{"demo": true}'::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Sample activity logs
-- ------------------------------------------------------------
insert into public.activity_logs
  (workspace_id, action, entity_type, entity_id, actor_id, summary, is_demo, metadata)
values
  (ws_id, 'prospect.created', 'prospect', prospect_1, admin_user_id,
   'Created demo prospect Northline Haulage', true, '{"demo": true}'::jsonb),
  (ws_id, 'prospect.status_changed', 'prospect', prospect_1, admin_user_id,
   'Moved Northline Haulage to Discovery Booked', true, '{"demo": true}'::jsonb),
  (ws_id, 'draft.approved', 'sales_outreach_draft', null, admin_user_id,
   'Approved first email draft for Northline Haulage', true, '{"demo": true}'::jsonb),
  (ws_id, 'funding.applied', 'funding_opportunity', funding_4, admin_user_id,
   'Marked Underrepresented Founders Growth Fund as Applied', true, '{"demo": true}'::jsonb);

end $$;
