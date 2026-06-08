-- ledger-web — planned Supabase schema.
-- Apply this after the Supabase project is created (Phase 2).
-- Order matters: enable extensions, create tables, then policies.

create extension if not exists "pgcrypto";

-- ============================================================
-- entries
-- ============================================================
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null,
  currency text not null check (currency in ('THB', 'USD', 'JPY')),
  fx_rate numeric(14, 6) not null,
  amount_thb numeric(14, 2) not null,
  category text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists entries_user_date_idx
  on public.entries (user_id, date desc);

alter table public.entries enable row level security;

create policy "entries_select_own"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "entries_insert_own"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "entries_update_own"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entries_delete_own"
  on public.entries for delete
  using (auth.uid() = user_id);

-- ============================================================
-- goals
-- currency/mode added 2026-06-08 — see migrations/20260608_add_goal_currency_mode.sql
-- ============================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2) not null,
  deadline date not null,
  currency text not null default 'ALL' check (currency in ('THB', 'USD', 'JPY', 'ALL')),
  mode text not null default 'net' check (mode in ('income', 'net')),
  created_at timestamptz not null default now()
);

create index if not exists goals_user_idx
  on public.goals (user_id);

alter table public.goals enable row level security;

create policy "goals_select_own"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "goals_insert_own"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "goals_update_own"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "goals_delete_own"
  on public.goals for delete
  using (auth.uid() = user_id);

-- ============================================================
-- categories
-- Master list of category labels owned by each user. Referenced
-- from lib/useCategories.js (Phase 1 backs this with localStorage).
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists categories_user_idx
  on public.categories (user_id);

alter table public.categories enable row level security;

create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);
