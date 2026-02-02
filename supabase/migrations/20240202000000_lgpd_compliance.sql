-- Migration: LGPD Compliance Tables
-- Created: 2026-02-02

-- 1. user_consents
create table if not exists public.user_consents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'terms', 'privacy', 'marketing'
  version text not null, -- '1.0', '2024-02-02'
  status text not null default 'accepted', -- 'accepted', 'revoked'
  ip_address text,
  user_agent text,
  accepted_at timestamptz default now() not null,
  revoked_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.user_consents enable row level security;

create policy "Users can view their own consents"
  on public.user_consents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own consents"
  on public.user_consents for insert
  with check (auth.uid() = user_id);

create policy "Users can update (revoke) their own consents"
  on public.user_consents for update
  using (auth.uid() = user_id);


-- 2. account_deletion_requests
create table if not exists public.account_deletion_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending',
  reason text,
  requested_at timestamptz default now() not null,
  completed_at timestamptz,
  updated_at timestamptz default now() not null
);

alter table public.account_deletion_requests enable row level security;

create policy "Users can view their own deletion requests"
  on public.account_deletion_requests for select
  using (auth.uid() = user_id);

create policy "Users can create deletion requests"
  on public.account_deletion_requests for insert
  with check (auth.uid() = user_id);

-- Admin policies depend on `has_role` function existing (assumed from project analysis)
create policy "Admins can view all deletion requests"
  on public.account_deletion_requests for select
  using ( public.has_role('admin', auth.uid()) );

create policy "Admins can update deletion requests"
  on public.account_deletion_requests for update
  using ( public.has_role('admin', auth.uid()) );


-- 3. audit_logs
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_resource text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now() not null
);

alter table public.audit_logs enable row level security;

create policy "Admins can view audit logs"
  on public.audit_logs for select
  using ( public.has_role('admin', auth.uid()) );

create policy "Users can view their own audit logs"
  on public.audit_logs for select
  using (auth.uid() = actor_id);

create policy "Authenticated actors can insert logs"
  on public.audit_logs for insert
  with check (auth.uid() = actor_id);
