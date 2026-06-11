-- ============================================================
-- TruckFixr AI Operating System — Migration 2
-- Auth-ready workspace model: profiles, workspaces, members
-- + membership helper functions used by all RLS policies
--
-- DO NOT apply automatically. Review before running.
-- ============================================================

-- ------------------------------------------------------------
-- profiles: 1:1 with auth.users. Created lazily after signup
-- (app code or a future trigger can insert the row).
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- workspaces: top-level tenant container. The internal OS will
-- usually have one workspace ("TruckFixr HQ") plus optional
-- demo workspaces.
-- ------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  is_demo boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create trigger trg_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- workspace_members: profile <-> workspace join with a role.
-- Roles: admin | sales | marketing | engineering | funding | viewer
-- ------------------------------------------------------------
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null
    check (role in ('admin', 'sales', 'marketing', 'engineering', 'funding', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'invited', 'suspended', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (workspace_id, profile_id)
);

create trigger trg_workspace_members_updated_at
  before update on public.workspace_members
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Membership helper functions (SECURITY DEFINER so RLS policies
-- can call them without recursive policy evaluation).
-- ------------------------------------------------------------
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.profile_id = auth.uid()
      and wm.status = 'active'
  );
$$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.profile_id = auth.uid()
      and wm.role = 'admin'
      and wm.status = 'active'
  );
$$;

comment on function public.is_workspace_member(uuid) is
  'True when auth.uid() is an active member of the workspace. Used by RLS.';
comment on function public.is_workspace_admin(uuid) is
  'True when auth.uid() is an active admin of the workspace. Used by RLS.';
