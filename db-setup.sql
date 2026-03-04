-- ================================================================
-- NexaFlow — Supabase Database Setup
-- Run this entire file in the Supabase SQL Editor
-- Project: moabhslreqhhzpaoboix
-- ================================================================

-- ================================================================
-- 1. TABLES
-- ================================================================

-- Profiles (public user data, linked to auth.users)
create table if not exists profiles (
  id              uuid references auth.users on delete cascade primary key,
  full_name       text,
  email           text,
  job_title       text default '',
  bio             text default '',
  avatar_initials text,
  role            text default 'admin',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Workspace settings
create table if not exists workspace_settings (
  user_id        uuid references auth.users on delete cascade primary key,
  workspace_name text default 'My Workspace',
  workspace_slug text,
  timezone       text default 'America/Los_Angeles',
  allow_public_sharing boolean default true,
  require_sso          boolean default false,
  compact_mode         boolean default false,
  particles_enabled    boolean default true,
  accent_color         text default '#00f5ff',
  notif_failures       boolean default true,
  notif_digest         boolean default true,
  notif_agents         boolean default true,
  notif_team           boolean default false,
  notif_product        boolean default true,
  notif_billing        boolean default true,
  notif_marketing      boolean default false,
  slack_connected      boolean default false,
  slack_channel        text default '',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Workflows
create table if not exists workflows (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade not null,
  name          text not null,
  description   text default '',
  status        text default 'active' check (status in ('active', 'paused', 'draft')),
  trigger_type  text default 'webhook' check (trigger_type in ('webhook', 'schedule', 'manual', 'api', 'email', 'form')),
  schedule_cron text,
  node_count    int default 3,
  last_run_at   timestamptz,
  run_count     bigint default 0,
  success_count bigint default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Executions (workflow run history)
create table if not exists executions (
  id               uuid default gen_random_uuid() primary key,
  workflow_id      uuid references workflows on delete cascade not null,
  user_id          uuid references auth.users on delete cascade not null,
  workflow_name    text not null,
  status           text default 'running' check (status in ('running', 'success', 'failed', 'cancelled')),
  trigger_type     text default 'manual',
  started_at       timestamptz default now(),
  completed_at     timestamptz,
  duration_ms      int,
  error_message    text,
  steps_total      int default 5,
  steps_completed  int default 0,
  log_output       jsonb default '[]'::jsonb
);

-- AI Agents
create table if not exists agents (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete cascade not null,
  name             text not null,
  emoji            text default '🤖',
  type             text not null,
  status           text default 'active' check (status in ('active', 'idle', 'error')),
  model            text default 'claude-sonnet-4-6',
  description      text default '',
  color_from       text default '#00f5ff',
  color_to         text default '#0080ff',
  config           jsonb default '{}'::jsonb,
  tasks_completed  bigint default 0,
  success_rate     numeric(5,2) default 99.0,
  avg_response_ms  int default 500,
  created_at       timestamptz default now()
);

-- Integrations
create table if not exists integrations (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete cascade not null,
  name             text not null,
  emoji            text default '🔗',
  category         text not null,
  description      text default '',
  connected        boolean default false,
  api_calls_today  int default 0,
  webhooks_count   int default 0,
  connected_at     timestamptz,
  created_at       timestamptz default now()
);

-- Team invites
create table if not exists team_invites (
  id           uuid default gen_random_uuid() primary key,
  invited_by   uuid references auth.users on delete cascade not null,
  email        text not null,
  role         text default 'viewer' check (role in ('admin', 'editor', 'viewer', 'billing')),
  created_at   timestamptz default now(),
  expires_at   timestamptz default (now() + interval '7 days'),
  accepted_at  timestamptz
);

-- API Keys
create table if not exists api_keys (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  name        text not null,
  key_prefix  text not null,
  key_hash    text not null,
  permissions text default 'full_access',
  last_used   timestamptz,
  created_at  timestamptz default now()
);

-- ================================================================
-- 2. ROW LEVEL SECURITY
-- ================================================================

alter table profiles          enable row level security;
alter table workspace_settings enable row level security;
alter table workflows          enable row level security;
alter table executions         enable row level security;
alter table agents             enable row level security;
alter table integrations       enable row level security;
alter table team_invites       enable row level security;
alter table api_keys           enable row level security;

-- Profiles
create policy "profiles_select" on profiles for select using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Workspace settings
create policy "ws_all" on workspace_settings for all using (auth.uid() = user_id);

-- Workflows
create policy "workflows_all" on workflows for all using (auth.uid() = user_id);

-- Executions
create policy "executions_all" on executions for all using (auth.uid() = user_id);

-- Agents
create policy "agents_all" on agents for all using (auth.uid() = user_id);

-- Integrations
create policy "integrations_all" on integrations for all using (auth.uid() = user_id);

-- Team invites
create policy "invites_all" on team_invites for all using (auth.uid() = invited_by);

-- API Keys
create policy "api_keys_all" on api_keys for all using (auth.uid() = user_id);

-- ================================================================
-- 3. FUNCTIONS & TRIGGERS
-- ================================================================

-- Auto-create profile + workspace settings on signup
create or replace function handle_new_user()
returns trigger as $$
declare
  full_name_val text;
  workspace_name_val text;
  slug_val text;
begin
  full_name_val := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  workspace_name_val := coalesce(new.raw_user_meta_data->>'company', full_name_val || '''s Workspace');
  slug_val := lower(regexp_replace(workspace_name_val, '[^a-z0-9]', '-', 'g'));

  insert into profiles (id, full_name, email, avatar_initials)
  values (
    new.id,
    full_name_val,
    new.email,
    upper(left(full_name_val, 1) || coalesce(split_part(full_name_val, ' ', 2), ''))
  );

  insert into workspace_settings (user_id, workspace_name, workspace_slug)
  values (new.id, workspace_name_val, slug_val);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Update workflow stats after execution completes
create or replace function update_workflow_stats()
returns trigger as $$
begin
  if new.status in ('success', 'failed') and old.status = 'running' then
    update workflows
    set
      run_count = run_count + 1,
      success_count = success_count + (case when new.status = 'success' then 1 else 0 end),
      last_run_at = new.completed_at,
      updated_at = now()
    where id = new.workflow_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_execution_complete on executions;
create trigger on_execution_complete
  after update on executions
  for each row execute procedure update_workflow_stats();

-- ================================================================
-- 4. HELPER VIEWS
-- ================================================================

-- Analytics summary per user
create or replace view user_analytics as
select
  e.user_id,
  count(*)::bigint as total_executions,
  count(*) filter (where e.status = 'success')::bigint as successful,
  count(*) filter (where e.status = 'failed')::bigint as failed,
  count(*) filter (where e.status = 'cancelled')::bigint as cancelled,
  round(
    count(*) filter (where e.status = 'success')::numeric /
    nullif(count(*) filter (where e.status in ('success','failed')), 0) * 100, 2
  ) as success_rate,
  avg(e.duration_ms) filter (where e.duration_ms is not null)::int as avg_duration_ms
from executions e
group by e.user_id;

-- ================================================================
-- 5. INDEXES (performance)
-- ================================================================

create index if not exists idx_workflows_user_id     on workflows(user_id);
create index if not exists idx_executions_user_id    on executions(user_id);
create index if not exists idx_executions_workflow_id on executions(workflow_id);
create index if not exists idx_executions_started_at on executions(started_at desc);
create index if not exists idx_agents_user_id        on agents(user_id);
create index if not exists idx_integrations_user_id  on integrations(user_id);

-- ================================================================
-- DONE — Run this in Supabase SQL Editor
-- Then the app will be ready to use
-- ================================================================
