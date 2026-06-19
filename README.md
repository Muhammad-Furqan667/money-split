# SplitRoom — Roommate Expense Tracker

A real-time shared expense tracker for two roommates. No login, no signup —
just both of you, live-synced, on a shared Supabase database.

**Stack:** Next.js 15 (App Router) · JavaScript (no TypeScript) · Plain CSS (no Tailwind) · Supabase (Postgres + Realtime)

---

## 1. One-time Supabase setup

1. Go to your Supabase project → **SQL Editor** → **New Query**.
2. Open `supabase-schema.sql` in this project, copy all of it, paste it in, and click **Run**.
   This creates the `expenses` and `roommates` tables, sets up Row Level
   Security policies, and turns on Realtime for both tables.
3. That's it — no other dashboard config needed.

## 2. Environment variables

`.env.local` is already filled in with your Supabase URL and anon key. If you
ever rotate keys or move to a new Supabase project, update these two values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> Note: the anon key is meant to be public-ish (it ships in frontend JS by
> design) — Supabase expects Row Level Security to be the real gate, which
> the schema script sets up. Since there's no login here, the RLS policies
> are scoped to just the `expenses` and `roommates` tables rather than
> wide open access to your whole project.

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first time either of
you opens it, you'll be asked for both roommates' names — these get written
to the shared `roommates` table, so the other person sees them immediately
too.

## 4. How the real-time sync works

- Every add/edit/delete writes straight to Supabase.
- Both browsers (yours and your roommate's) hold an open Supabase Realtime
  subscription. The instant one of you changes something, the other's
  screen refetches and updates — no refresh needed.
- A small "Live / Syncing / Offline" badge in the top bar shows connection
  status.
- localStorage is still used as a same-device cache so the dashboard isn't
  blank for a split second on load, and as a fallback if Supabase is briefly
  unreachable — but Supabase is the real source of truth.

## 5. Deploy to Vercel

```bash
vercel
```

Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings
(Project → Settings → Environment Variables) so the deployed app can reach
your Supabase project. No other configuration is needed.

## Project structure

```
app/
  types/index.js        Shared constants (categories, colors, icons)
  lib/
    supabase.js          Supabase client singleton
    storage.js            localStorage cache + Supabase read/write functions
    calculations.js       Settlement math, CSV export, chart data shaping
  hooks/
    useAppState.js        Central state: loads from Supabase, subscribes to
                           realtime changes, exposes CRUD methods
  styles/
    common.css             Shared buttons/cards/page-header classes
    forms.css               Shared input/label/error classes
  components/
    ui/        SetupScreen, Navbar (+ their .css files)
    dashboard/ Dashboard.jsx + Dashboard.css
    expenses/  AddExpenseForm, ExpenseHistory (+ .css)
    analytics/ Analytics.jsx + Analytics.css (charts via recharts)
    settings/  Settings.jsx + Settings.css
supabase-schema.sql       Run once in Supabase SQL Editor
```
