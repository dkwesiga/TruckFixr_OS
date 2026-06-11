# Supabase Schema Mapping — TruckFixr AI Operating System

This document maps the existing frontend TypeScript interfaces
(`src/lib/types.ts`, localStorage-backed) to the Supabase schema in
`supabase/migrations/`. It records every mismatch found during the
Phase 1 codebase inspection and the decision taken for each.

> Scope note: this is the **internal** TruckFixr AI Operating System
> (execution infrastructure), not the customer-facing TruckFixr product.

---

## Current persistence model (before Supabase)

- All data lives in `localStorage` under `tf_os_*` keys
  (`src/lib/storage.ts`).
- IDs are `crypto.randomUUID()` strings (Supabase-compatible) with a
  legacy fallback `prospect_<timestamp>_<rand>` (NOT uuid — see risks).
- Timestamps are ISO strings on `createdDate` / `updatedDate`.
- Demo records use `isDemo: true`.
- Auth is a `NEXT_PUBLIC_` password gate via `sessionStorage` — there
  is **no Supabase Auth session yet** (see risks).

---

## Mapping by module

### 1. `Prospect` → `public.prospects` (CONNECTED in v1)

| Frontend field | Column | Notes |
|---|---|---|
| `id` | `id uuid` | localStorage ids that aren't uuids cannot be migrated as-is |
| `companyName` | `company_name` | required both sides |
| `website` | `website` | optional → nullable |
| `location` | `location` | required both sides |
| `fleetType` | `fleet_type` | CHECK matches the 6 frontend options |
| `estimatedFleetSize` | `estimated_fleet_size` | free text (see mismatch #2) |
| `decisionMaker` | `decision_maker` | spec also asked for `contact_name`; both exist |
| — | `contact_name` | new column, not yet in frontend type |
| `email` / `phone` | `email` / `phone` | |
| `linkedIn` | `linkedin_url` | renamed per spec |
| `sourceNotes` | `source_notes` | |
| `maintenancePain` | `maintenance_pain` | |
| `usesEldTelematics` | `uses_eld_telematics` | CHECK Yes/No/Unknown |
| `pilotFitScore` etc. | `pilot_fit_score` etc. | `smallint` 1–5 CHECK, null = unscored |
| `outreachStatus` | `outreach_status` | CHECK matches all 12 statuses exactly |
| `nextAction` | `next_action` | |
| `lastContactDate` | `last_contact_date date` | frontend string `""` → null |
| `notes` | `notes` | |
| `firstEmailDraft`, `linkedInConnectDraft`, `linkedInFollowUpDraft`, `phoneScript`, `cta`, `llmPersonalizationPrompt` | `metadata->'drafts'` | **Mismatch #1** — see below |
| `isDemo` | `is_demo` | |
| `createdDate` / `updatedDate` | `created_at` / `updated_at` | trigger maintains `updated_at` |
| — | `approval_status`, `approved_by`, `approved_at`, `approval_notes` | new approval workflow columns |
| — | `external_source`, `external_id`, `sync_status`, `last_synced_at` | new integration sync columns |
| — | `workspace_id`, `created_by`, `archived_at` | new multi-tenant/lifecycle columns |

### 2. `CompanySettings` → `public.company_profiles`
Straight camelCase→snake_case rename of all 10 fields. Currently the
Settings page keeps using localStorage; table is ready.

### 3. `ContentItem` → `public.marketing_content`
| Frontend | Column | Notes |
|---|---|---|
| `topic` | `topic` (+ `title` required) | table requires `title`; map `topic`→`title` on future migration |
| `audience`, `contentType` | `audience`, `content_type` | stored as text, no CHECK (10+ frontend variants) |
| `draftTitle` / `draftContent` | `draft_title` / `draft_body` | renamed per spec (`draft_body`) |
| `suggestedHashtags` | `suggested_hashtags text[]` | |
| `contentStatus` | `content_status` | CHECK matches frontend 5 values |
| — | `status`, `platform`, `scheduled_for`, `published_at`, approval + sync fields | new |

### 4. `FundingOpportunity` → `public.funding_opportunities`
| Frontend | Column | Notes |
|---|---|---|
| `programName` | `name` | **renamed per spec** |
| `funderOrganization` | `organization` | renamed per spec |
| `amountRange` (string) | `amount_min` / `amount_max` (numeric) | **Mismatch #2** — see below |
| `truckFixrFitScore` | `fit_score` | renamed per spec |
| `sourceLink` | `source_url` | renamed per spec |
| `grantReadiness` (12-key checklist) | `metadata->'grantReadiness'` | jsonb keeps checklist flexible |
| `requiredPartner`, `customerSupportLetterNeeded`, `contactPerson`, `contactEmail` | dedicated columns | preserved |
| `status` | `status` | CHECK matches frontend 8 values |

### 5. `RDEvidence` → `public.rd_evidence`
| Frontend | Column | Notes |
|---|---|---|
| `date` | `evidence_date` | renamed per spec |
| `customerPartner` | `related_customer` | renamed per spec |
| `experimentTestConducted` | `experiment_conducted` | shortened |
| `resultLearning` | `result_learning` | |
| `commercializationEvidence` | `business_value` | closest spec column; original key kept in metadata on migration |
| `fleetSegment` | `metadata` | no spec column; flexible field |
| — | `title`, `summary`, `related_project`, `technical_value`, `document_id`, `status` | new spec columns |

### 6. `InvestorContact` → no dedicated table (v1)
The spec's table list has no `investors` table. Investor outreach maps
to `funding_outreach_drafts` (recipient fields) and investor contacts
can live in `funding_opportunities` with `funding_type = 'Investor'`
or in `metadata`. **Recommendation:** add a dedicated
`investor_contacts` table in a future migration if investor relations
grows; documented as future action.

### 7. `EngineeringTask` → `public.engineering_tasks`
| Frontend | Column | Notes |
|---|---|---|
| `issueType` | `task_type` | renamed per spec |
| `affectedArea` | `module` | renamed per spec |
| `businessReason`, `userStory`, `currentBehavior`, `desiredBehavior`, `acceptanceCriteria` | dedicated columns | |
| `filesLikelyInvolved`, `risks`, `testRequirements`, `doNotChangeAreas`, `notesForAI` | `metadata` | AI-prompt scaffolding; `test_plan` column covers testRequirements going forward |
| `status` | `status` | CHECK matches frontend 8 values incl. "Ready for Codex" |
| — | `github_issue_url`, `codex_prompt`, `rollback_plan`, `completed_at`, sync fields | new |

### 8. `RoadmapItem` → `public.roadmap_items`
| Frontend | Column | Notes |
|---|---|---|
| `module` | `module` | text, no CHECK (9 variants) |
| `type` | `item_type` | renamed (avoid reserved-feeling name) |
| `owner` | `owner` | text, no CHECK (names will change) |
| `riskLevel` | `risk_level` | CHECK Low/Medium/High |
| `codexPromptUsed` | `metadata` | |
| — | `dependency_notes`, `decision_notes`, `target_date date` | new spec columns |

### 9. `PilotEvidence` / `Partnership` → no dedicated tables (v1)
Not in the spec's table list. Both fit naturally as future tables
(`pilot_evidence`, `partnerships`) following the same conventions.
Until then they stay localStorage-only. **Documented future action.**

---

## Mismatches found & decisions

1. **Prospect draft fields**: the frontend stores outreach drafts as
   columns on the prospect; the spec normalizes them into
   `sales_outreach_drafts`. *Smallest safe adjustment:* v1 round-trips
   the legacy draft fields through `prospects.metadata->'drafts'` so
   the existing UI keeps working unchanged, while the normalized
   drafts table exists for the future UI. No data loss either way.
2. **`amountRange` (string) vs `amount_min`/`amount_max` (numeric)**:
   spec wins. Future funding-module migration must parse strings like
   `"$25k–$75k"` → numbers, keeping the original string in `metadata`.
3. **`estimatedFleetSize` enum drift**: frontend union has 8 values
   (incl. odd `5-8`, `8-12`, `15-20`); stored as plain text in SQL to
   avoid CHECK breakage. Recommend normalizing the union later.
4. **Legacy non-uuid ids**: localStorage fallback ids
   (`prospect_...`, `demo_prospect_1`) are not uuids. Data migrated
   into Supabase must receive fresh uuids; keep old id in
   `metadata->'legacyId'` if traceability matters.
5. **`InvestorContact` has no spec table** — see §6 above.
6. **Auth mismatch**: app uses a password gate, not Supabase Auth.
   RLS requires a real session. v1 ships auth-ready SQL; the app gains
   Supabase Auth in a later step (this is the main blocker for using
   supabase mode end-to-end).
7. **Naming conflict**: `src/lib/prospects.ts` (localStorage) vs the
   new `src/lib/data/prospects.ts` (mode-aware). The UI now imports
   only from `lib/data/prospects`; the old module remains as the local
   backend implementation. Same pattern reserved for other modules.

## Migration risks

- **Do not** run migrations against a database with real data without
  a backup; all files assume an empty/new project.
- RLS helper functions are `security definer` — review them before
  applying (they are intentionally narrow).
- CHECK constraints encode today's frontend vocabularies; changing a
  status list later requires a corrective migration (never edit an
  applied migration).
- localStorage → Supabase data migration is **not** automated in v1;
  it should be a deliberate script run once auth + workspace exist.

## Future actions required

1. Add Supabase Auth (email magic link is enough) and a profile
   bootstrap flow; then supabase mode becomes fully usable.
2. Write a one-time localStorage→Supabase import script (or UI
   button) using the existing `exportAllData()` snapshot format.
3. Add `investor_contacts`, `pilot_evidence`, `partnerships` tables.
4. Move prospect draft fields from `metadata->'drafts'` into
   `sales_outreach_drafts` and update `ProspectDrafts.tsx`.
5. Replace `src/lib/supabase/types.ts` with generated types:
   `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts`
