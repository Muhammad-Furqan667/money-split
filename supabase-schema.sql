-- ============================================================
-- SplitRoom — Supabase schema setup
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New Query → paste → Run)
-- ============================================================

-- 1. EXPENSES TABLE
create table if not exists expenses (
  id text primary key,
  amount numeric(10, 2) not null check (amount > 0),
  description text not null,
  category text not null check (
    category in ('Groceries', 'Rent', 'Internet', 'Utilities', 'Food', 'Transport', 'Other')
  ),
  paid_by text not null,
  date date not null,
  created_at timestamptz not null default now()
);

-- 2. ROOMMATES TABLE (single row holding both names)
create table if not exists roommates (
  id int primary key default 1,
  name1 text not null,
  name2 text not null,
  configured boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Seed the single roommates row if it doesn't exist yet
insert into roommates (id, name1, name2, configured)
values (1, '', '', false)
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- This is a 2-person personal tool with no login system, so we
-- can't gate access by user identity. Instead we scope policies
-- tightly to exactly the operations the app needs — anyone with
-- your anon key can read/write expenses and the roommates row,
-- but cannot touch any other table or run arbitrary SQL.
-- ============================================================

alter table expenses enable row level security;
alter table roommates enable row level security;

-- Expenses: allow full CRUD (this is the shared household ledger)
create policy "Allow all access to expenses"
  on expenses for all
  using (true)
  with check (true);

-- Roommates: allow read + update only (no insert/delete —
-- there should only ever be exactly one row, id = 1)
create policy "Allow read roommates"
  on roommates for select
  using (true);

create policy "Allow update roommates"
  on roommates for update
  using (true)
  with check (id = 1);

-- ============================================================
-- REALTIME
-- Enable realtime broadcasts so both roommates see changes
-- instantly without refreshing.
-- ============================================================

alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table roommates;
