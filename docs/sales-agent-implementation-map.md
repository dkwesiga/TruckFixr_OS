# Sales Agent Implementation Map

## Current Sales Agent Files

- `src/app/(dashboard)/sales/page.tsx` - main Sales Agent page, KPI cards, filters, prospect table, CSV/JSON/Markdown export, CSV import, research prompt modal, prospect form modal, outreach drafts modal, and delete confirmation.
- `src/components/sales/ProspectForm.tsx` - add/edit prospect form with scoring fields and deterministic auto-score support.
- `src/components/sales/ProspectDrafts.tsx` - deterministic outreach draft review/edit/copy/regenerate workflow.
- `src/components/sales/CSVImport.tsx` - CSV upload, parse, preview, duplicate skip, and local/Supabase-aware import.
- `src/components/sales/ResearchPromptGenerator.tsx` - research prompt generation and paste-back JSON import.
- `src/lib/prospects.ts` - localStorage prospect CRUD and demo load/clear helpers.
- `src/lib/data/prospects.ts` - mode-aware data access for local, demo, and Supabase prospects.
- `src/lib/scoring.ts` - rule-based pilot, revenue, and grant scoring.
- `src/lib/outreach-templates.ts` - deterministic first email, LinkedIn, phone, CTA, and LLM prompt templates.
- `src/lib/demo-data.ts` - fictional demo prospects and cross-module demo data.

## Existing Data Model

The existing `Prospect` interface supports:

- Basic company/contact fields
- Fleet type and fleet size
- Maintenance pain
- ELD/telematics usage
- Pilot, revenue, and grant fit scores
- Legacy outreach status
- Next action and last contact date
- Deterministic outreach draft fields
- Demo flag and timestamps

The existing Sales page uses `outreachStatus` as the main pipeline field.

## New Data Model Added In Phase 1

Phase 1 adds optional, backward-compatible fields to `Prospect`:

- Full `SalesPipelineStage` lifecycle from `New Prospect` through `Won`, `Nurture`, and `Lost`
- Stage metadata: previous stage, changed date, notes, owner, priority, stalled reason
- Company operations fields: service area, vehicle types, maintenance process, software, ELD provider
- Lead attribution fields: source, campaign, referrer, event, landing page, and UTM data
- Commercial qualification fields: urgency, pilot interest, timeline, estimated values, pricing fit
- Additional scores: R&D/funding evidence, speed-to-close, commercial readiness
- Compliance fields: consent status, unsubscribe, do-not-contact, outreach cadence
- Integration-ready fields: external source/id, sync status, Gmail/calendar metadata
- Multiple contacts: `ProspectContact[]`
- Outreach drafts and follow-up sequences
- Discovery workflow model
- Pilot proposal model
- Quote model
- Onboarding checklist model
- Pilot health model
- Lost/nurture record model
- Partner/referral, objection intelligence, and cross-agent handoff models

All new fields are optional so existing localStorage data, demo records, CSV imports, and Supabase rows remain valid.

## Files Changed In Phase 1

- `src/lib/types.ts`
  - Added Sales workflow types and optional fields on `Prospect`.
- `src/lib/sales-workflow.ts`
  - Added full pipeline stage list, stage mapping, transition helper, commercial score helper, daily action queue, and weekly review generator.
- `src/components/sales/SalesAgentWorkspace.tsx`
  - Added tabbed Sales Agent workspace with command center, pipeline/Kanban, prospect detail preview, daily action queue, outreach sequence overview, discovery/proposal/health/quote placeholders, intelligence, handoffs, and weekly review export.
- `src/components/sales/ProspectDetailWorkflow.tsx`
  - Added selected prospect detail workflow with stage metadata editing, multiple contact add/edit/archive, and structured discovery form.
- `src/components/sales/PilotProposalQuoteBuilder.tsx`
  - Added selected prospect pilot proposal builder and quote builder with editable fields, deterministic markdown previews, save/generate actions, and onboarding checklist creation when proposal is accepted.
- `src/components/sales/OnboardingPilotHealth.tsx`
  - Added editable onboarding checklist, pilot success plan, internal handoff note, pilot health tracking, success metric checkboxes, and pilot review report preview/generation.
- `src/components/sales/LostNurtureIntelligence.tsx`
  - Added structured lost/nurture workflow, objection/intelligence record creation, common objection counts, summary preview, and cross-agent handoff prompt review/status updates.
- `src/components/sales/PartnersReferralsWorkflow.tsx`
  - Added Sales-side partner/referral records, referral metric tracking, partner outreach prompt previews, referral summaries, and sync into the existing Partnership Agent.
- `src/components/sales/OutreachSequences.tsx`
  - Added editable outreach sequence generation, follow-up step editing, draft review, copy buttons, approval status editing, compliance warnings, and manual sent-date tracking.
- `src/components/sales/SalesFinalPolishPanel.tsx`
  - Added final Sales metrics, derived activity timeline, accepted handoff queue, and cross-module draft write-through controls.
  - Added founder cockpit alerts for consent blockers, due follow-ups, accepted handoffs, pending proposals, stale pilots, high outreach volume, and stalled prospects.
- `src/lib/sales-proposals.ts`
  - Added deterministic pilot proposal generation, quote summary generation, TruckFixr pricing defaults, and default onboarding checklist generation.
- `src/lib/pilot-health.ts`
  - Added deterministic pilot success plan, internal handoff note, default health model, success metric defaults, and pilot review report generation.
- `src/lib/sales-intelligence.ts`
  - Added loss reason defaults, objection categories, objection counts, recommended responses, loss/nurture summaries, and cross-agent handoff prompt generation.
- `src/lib/sales-referrals.ts`
  - Added Sales partner/referral defaults, referral status options, summary generation, outreach prompt generation, metrics aggregation, and Partnership Agent sync helpers.
- `src/lib/outreach-sequences.ts`
  - Added deterministic cold outbound, warm referral, post-discovery, pilot proposal follow-up, pilot-to-paid conversion, and nurture sequence generation with consent/do-not-contact warnings.
- `src/lib/sales-handoffs.ts`
  - Added write-through helpers that turn accepted Sales handoffs into draft Marketing content, Engineering tasks, Funding/R&D evidence, or Roadmap items.
  - Added duplicate-safe handoff markers so repeat writes link the existing draft record instead of creating duplicates.
- `src/lib/sales-activity.ts`
  - Added derived Sales activity feed and final Sales metrics across outreach, proposals, pilots, nurture, consent, and handoffs.
  - Added rule-based cockpit alerts for the highest-leverage daily Sales risks.
- `src/app/(dashboard)/sales/page.tsx`
  - Mounted the new Sales workspace above the existing prospect KPI cards and table.
  - Added manual full-pipeline stage transition handler.
  - Added prospect workflow update handler for detail/contact/discovery saves.
- `src/lib/data/prospects.ts`
  - Added Supabase metadata round-trip support for optional Sales workflow fields.

## New Components Added

- `SalesAgentWorkspace`
  - Provides Phase 2 navigation structure.
  - Keeps the existing Prospect List table as the stable working list.
  - Adds the first Pipeline/Kanban and Daily Action Queue implementation.
  - Generates weekly sales review Markdown from current prospect data.
- `ProspectDetailWorkflow`
  - Lets the user select a prospect from the Sales Agent workspace.
  - Saves stage metadata including current stage, priority, next action, owner, due date, stalled flag, and stage notes.
  - Supports multiple contacts per company with add, edit, and archive behavior.
  - Captures a structured discovery workflow and generates a deterministic discovery summary.
  - Can mark discovery complete and move the prospect to the recommended pipeline stage.
- `PilotProposalQuoteBuilder`
  - Generates scoped pilot proposal markdown from discovery and prospect data.
  - Supports proposal status, pricing path, scope, modules, data sources, success metrics, review date, risks, and next steps.
  - Generates paid conversion quote summaries from TruckFixr pricing defaults.
  - Supports Owner-Operator, Small Fleet, Fleet Growth, Fleet Pro, and Custom Fleet plans.
  - Creates onboarding checklist items when a proposal is marked accepted.
- `OnboardingPilotHealth`
  - Supports editable onboarding checklist items with owner, notes, completion, add, and remove actions.
  - Supports editable pilot success plan and internal sales handoff note.
  - Tracks vehicles/users/usage, feedback, issues, feature requests, conversion readiness, support-letter potential, and pilot health status.
  - Tracks success metrics achieved.
  - Generates a factual pilot review report with usage, feedback, success metrics, unresolved issues, R&D evidence summary, and next commercial step.
- `LostNurtureIntelligence`
  - Captures structured loss/nurture reasons, main objection, current workaround, competitor, price/timing blockers, missing feature, future trigger, and next check-in date.
  - Adds sales intelligence records with objection type, detail, recommended response, competitor/alternative, missing feature, roadmap implication, pricing concern, integration requirement, and proof requirement.
  - Shows common objection counts across all prospects.
  - Generates handoff prompts for Marketing, Funding/R&D, Engineering, and Roadmap without writing directly into those modules.
  - Supports handoff statuses: Draft, Reviewed, Accepted, Completed, Rejected.
- `PartnersReferralsWorkflow`
  - Tracks Sales-side partner/referral records tied to prospects.
  - Supports partner type, contact, referral status, referral date, follow-up date, estimated value, outcome, and partner notes.
  - Tracks referrals made, discovery calls booked, pilots started, paid customers won, and R&D/funding value generated.
  - Generates referral summaries and partner outreach prompts.
  - Can save and sync a referral into the existing Partnership Agent local storage.
- `OutreachSequences`
  - Generates editable outreach steps and draft-only messages for the core TruckFixr Sales sequences.
  - Shows consent, unsubscribe, do-not-contact, cadence, and next-allowed-date warnings.
  - Lets Dickson edit follow-up steps, due dates, channels, statuses, notes, draft subjects, draft bodies, draft statuses, and approval statuses.
  - Tracks manually sent dates without sending email, posting to LinkedIn, or calling any external API.
- `SalesFinalPolishPanel`
  - Shows final Sales operational metrics: follow-ups due, drafts needing review, consent blocked prospects, pending proposals, active pilots, nurture check-ins due, and accepted handoffs.
  - Shows rule-based founder cockpit alerts so Dickson can see what needs attention before scanning every prospect.
  - Shows a recent activity timeline derived from prospect stage changes, outreach drafts, discovery completion, proposal generation, pilot health, loss/nurture, partner referrals, and handoffs.
  - Lets reviewed handoffs be marked Accepted and written into the correct internal module as draft records.
  - Marks written handoffs Completed with the created record id, and links existing records if the same handoff was already written.

## Assumptions Made

- Local mode remains the default data mode.
- Supabase mode should not be forced; current Supabase helpers stay intact.
- The legacy `outreachStatus` field remains for compatibility with existing table filters and exports.
- `currentStage` is the new full pipeline stage, with fallback mapping from `outreachStatus`.
- No messages are sent automatically. All outreach remains draft/manual.
- Existing Partnership, Marketing, Funding/R&D, Engineering, Roadmap, and Pilot Evidence modules remain the system of record for deeper cross-module workflows until handoff writing is implemented.

## Current Gaps / Future Work

- Prospect Detail is implemented as an embedded workspace panel, not a dedicated route.
- Discovery workflow is editable and persists on the selected prospect.
- Proposal and quote builder are implemented as embedded workspace panels.
- Onboarding checklist editing and pilot health tracking are implemented.
- Lost/nurture, sales intelligence, and cross-agent handoff prompt generation are implemented.
- Partner/referral workflow is implemented inside Sales Agent and can sync records into the Partnership Agent.
- Outreach sequences are implemented with editable steps, draft review, compliance warnings, and manual sent-date tracking.
- Cross-module handoff write-through is implemented for Marketing, Engineering, Funding/R&D, and Roadmap draft records.
- Final Sales metrics and a derived activity timeline are implemented in the Handoffs tab.
- Founder cockpit alerts and duplicate-safe handoff write-through are implemented.
- Supabase metadata round-trip exists for optional workflow fields, but a dedicated normalized schema/migration is still future work.
- Weekly Sales Review is rule-based and intentionally does not call a live AI provider.

## Conflicts With Current Codebase

- The current Sales page is large. Phase 1 avoids rewriting it by placing the new workspace above the existing table.
- Existing `OutreachStatus` is narrower than the requested full pipeline. Phase 1 adds `SalesPipelineStage` separately to avoid breaking status badge records, filters, and exports.
- Supabase placeholder types do not yet include every requested field. Phase 1 keeps new fields optional and local-safe while deferring database schema expansion.

## Recommended Next Phase

Phase 10 should build Sales Agent verification and persistence hardening:

1. Add focused tests for deterministic generators, handoff write-through, activity metrics, and prospect metadata round-trip behavior.
2. Add optional persistent activity logs if Supabase mode becomes the default system of record.
3. Tighten mobile QA for the expanded Sales workspace.
4. Add keyboard/accessibility QA for the largest Sales forms and cockpit controls.
5. Keep all generated outputs draft-only with no auto-send, auto-post, auto-submit, or auto-commit behavior.
