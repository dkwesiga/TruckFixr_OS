# Supabase Setup — TruckFixr AI Operating System

Backend foundation for the **internal** TruckFixr AI Operating System
(not the customer-facing product). The app runs in three data modes;
Supabase is optional until you flip the switch.

---

## 1. Design overview

- **Hybrid schema**: dedicated columns for stable business fields +
  `metadata jsonb` on every table for future AI/integration data.
- **Multi-tenant ready**: every business table carries `workspace_id`;
  RLS restricts all access to active workspace members.
- **Lifecycle**: `created_at` / `updated_at` (trigger-maintained) /
  `archived_at` (prefer archiving over deleting business records).
- **Demo-safe**: every demo record sets `is_demo = true` and
  `metadata->'demo' = true` for surgical cleanup.
- **Integration-ready**: major records carry `external_source`,
  `external_id`, `sync_status` (`not_synced | pending | synced |
  failed | imported | exported`), `last_synced_at`.

## 2. Tables

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`; person identity |
| `workspaces` | tenant container (usually one: TruckFixr HQ) |
| `workspace_members` | membership + role (`admin/sales/marketing/engineering/funding/viewer`) |
| `company_profiles` | company positioning (Settings module) |
| `ai_provider_settings` | model/provider prefs — **never API keys** |
| `prospects` | Sales Agent pipeline (CONNECTED in v1) |
| `sales_outreach_drafts` | outreach drafts per prospect |
| `marketing_content` | Marketing Agent content pipeline |
| `funding_opportunities` | grants/loans/subsidies pipeline |
| `funding_outreach_drafts` | funder/investor outreach drafts |
| `rd_evidence` | R&D evidence log (SR&ED/grant support) |
| `engineering_tasks` | engineering backlog + AI prompt fields |
| `roadmap_items` | roadmap |
| `documents` | references to external docs (not a file store) |
| `agent_runs` | audit log of AI agent executions |
| `activity_logs` | manual app-written activity entries (append-only) |
| `saved_prompts` / `prompt_templates` | prompt library |

## 3. Workspace / auth model

Supabase-Auth-ready from day one, app integration optional:
`auth.users` → `profiles` → `workspace_members` → `workspaces`.
RLS policies call two `security definer` helpers:
`is_workspace_member(uuid)` and `is_workspace_admin(uuid)`.

> v1 limitation: the app's login page is a password gate, not Supabase
> Auth. Until Supabase Auth is added to the UI, supabase mode requires
> creating a session manually (e.g. via a small test script) — see §10.

## 4. RLS summary

- Members: `select` / `insert` / `update` on workspace rows.
- Admins only: hard `delete` (the app archives instead).
- `activity_logs`: members read + insert; no updates; admin delete only.
- `profiles`: each user manages their own row.
- **Never use the service role key in client-side code.**

## 5. Environment variables

Copy `.env.example` → `.env.local` and fill in:

```
NEXT_PUBLIC_DATA_MODE=local            # local | demo | supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=             # server-side only, optional in v1
```

Security rules:
- Only `NEXT_PUBLIC_*` values reach the browser.
- Service role + AI provider keys must never be `NEXT_PUBLIC_`.

## 6. Data modes

| Mode | Behavior | Requires Supabase? |
|---|---|---|
| `local` (default) | localStorage, exactly as before | No |
| `demo` | localStorage + auto-seeded fictional prospects + "Investor Demo Mode — Fictional Data" banner | No |
| `supabase` | Sales/Prospects reads/writes Supabase; other modules stay local | Yes |

If `supabase` mode is on but env vars are missing, the Sales page shows:
*"Supabase mode is enabled, but Supabase environment variables are
missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY,
or switch NEXT_PUBLIC_DATA_MODE to local."* — no crash.

## 7. Manual migration commands

**Do not apply migrations automatically. Review the SQL first.**

```bash
# one-time: link the repo to your Supabase project
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

# review, then push all migrations in supabase/migrations/
npx supabase db push
```

Alternative: paste each file (in filename order) into the Supabase
Dashboard SQL editor:
1. `20260609000100_extensions_and_helpers.sql`
2. `20260609000200_workspaces_profiles.sql`
3. `20260609000300_core_tables.sql`
4. `20260609000400_rls_policies.sql`
5. `20260609000500_indexes.sql`

## 8. Manual seed commands

1. Create a user: Dashboard → Authentication → Add user.
2. Edit `supabase/seed/seed_demo_data.sql` and replace
   `YOUR_AUTH_USER_ID` with that user's UUID.
3. Run it:

```bash
npx supabase db execute --file supabase/seed/seed_demo_data.sql
```

(or paste into the SQL editor.)

## 9. Type generation

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

Until then, `src/lib/supabase/types.ts` is a reviewed hand-written
placeholder (prospects + drafts fully typed).

## 10. Testing the Sales/Prospects Supabase connection

1. Apply migrations (§7) and seed (§8).
2. Set in `.env.local`:
   `NEXT_PUBLIC_DATA_MODE=supabase` + URL + anon key.
3. `npm run dev`, open `/sales`.
4. Expected today: a clear banner — *"Supabase mode requires a
   signed-in Supabase Auth session..."* because the app has no
   Supabase sign-in UI yet (v1 limitation, next implementation step).
5. To verify the pipeline end-to-end before the auth UI exists, create
   a session in the browser console on the app's origin:
   ```js
   // DevTools console — test only, with a user you created in §8
   const { createClient } = await import("https://esm.sh/@supabase/supabase-js");
   const sb = createClient("https://YOUR_PROJECT.supabase.co", "YOUR_ANON_KEY");
   await sb.auth.signInWithPassword({ email: "you@example.com", password: "..." });
   ```
   The app's client picks up the persisted session on reload; the
   Sales page then lists the 5 seeded demo prospects, and add/edit/
   stage-advance/archive all write to Supabase.

## 11. Switching back to local mode

Set `NEXT_PUBLIC_DATA_MODE=local` in `.env.local` and restart the dev
server. localStorage data was never touched by supabase mode.

## 12. Cleaning demo data safely

Only ever delete by demo flag:

```sql
-- review counts first
select 'prospects' t, count(*) from public.prospects where is_demo or metadata->>'demo' = 'true'
union all select 'marketing_content', count(*) from public.marketing_content where is_demo or metadata->>'demo' = 'true';

-- delete demo rows (children first where FKs apply)
delete from public.activity_logs        where is_demo or metadata->>'demo' = 'true';
delete from public.agent_runs           where is_demo or metadata->>'demo' = 'true';
delete from public.sales_outreach_drafts   where is_demo or metadata->>'demo' = 'true';
delete from public.funding_outreach_drafts where is_demo or metadata->>'demo' = 'true';
delete from public.documents            where is_demo or metadata->>'demo' = 'true';
delete from public.rd_evidence          where is_demo or metadata->>'demo' = 'true';
delete from public.prospects            where is_demo or metadata->>'demo' = 'true';
delete from public.funding_opportunities where is_demo or metadata->>'demo' = 'true';
delete from public.marketing_content    where is_demo or metadata->>'demo' = 'true';
delete from public.engineering_tasks    where is_demo or metadata->>'demo' = 'true';
delete from public.roadmap_items        where is_demo or metadata->>'demo' = 'true';
-- optionally the demo workspace itself (cascades memberships)
delete from public.workspaces where is_demo or metadata->>'demo' = 'true';
```

## 13. Migration safety & rollback

- **Do not apply migrations automatically.**
- **Review SQL before running.**
- **Back up the database before destructive changes**
  (Dashboard → Database → Backups, or `pg_dump`).
- **Do not edit already-applied migration files.** Create a new
  corrective migration instead.
- **Do not run destructive rollback SQL on a database holding real
  TruckFixr records.**
- Only delete demo records via `is_demo = true` or
  `metadata->>'demo' = 'true'` (see §12).
