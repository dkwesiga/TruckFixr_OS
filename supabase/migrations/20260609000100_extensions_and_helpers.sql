-- ============================================================
-- TruckFixr AI Operating System — Migration 1
-- Extensions + reusable helper functions
--
-- DO NOT apply automatically. Review before running.
-- Apply with: supabase db push   (or run in SQL editor)
-- ============================================================

-- UUID generation (gen_random_uuid is built into Postgres 13+ via pgcrypto)
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- set_updated_at(): reusable trigger function that stamps
-- updated_at on every row update. Applied per-table in later
-- migrations.
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Stamps updated_at = now() on row update. Attach as a BEFORE UPDATE trigger.';
