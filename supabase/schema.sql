-- Done. — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

create extension if not exists "pgcrypto";

-- Tasks table
create table if not exists public.tasks (
  id                  uuid primary key default gen_random_uuid(),
  user_identifier     text not null,
  original_message    text not null,
  task_title          text not null,
  task_description    text,
  steps               jsonb not null default '[]',
  status              text not null default 'pending'
                        check (status in ('pending', 'in_progress', 'completed', 'abandoned')),
  priority            text not null default 'medium'
                        check (priority in ('low', 'medium', 'high')),
  next_followup_at    timestamptz,
  followup_count      integer not null default 0,
  last_interaction_at timestamptz not null default now(),
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists tasks_user_status_idx
  on public.tasks (user_identifier, status);

create index if not exists tasks_followup_idx
  on public.tasks (next_followup_at)
  where status in ('pending', 'in_progress') and next_followup_at is not null;

-- Conversations table
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  user_identifier text not null,
  task_id         uuid references public.tasks (id) on delete set null,
  message_text    text not null,
  is_from_user    boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists conversations_user_idx
  on public.conversations (user_identifier, created_at desc);

-- Enable Row Level Security (recommended for production)
alter table public.tasks        enable row level security;
alter table public.conversations enable row level security;

-- Permissive policies so the anon key can read/write
-- (tighten these when you add real auth)
create policy "anon full access on tasks"
  on public.tasks for all using (true) with check (true);

create policy "anon full access on conversations"
  on public.conversations for all using (true) with check (true);
