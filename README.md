# Accounting Ledger

Personal expense tracker that replaces the Excel-based ledger. Single-user, three currencies (THB, USD, JPY), FX rate locked per entry, goal tracking with countdown.

## Stack

- Next.js 15 (App Router) — JavaScript
- React 19
- Tailwind CSS v4
- Supabase (planned — Phase 2)

## Design

CafeBlend design system — see `/references/cafeblend-DESIGN.md` in the DG-OS office. Neumorphic raised/inset shadows on a warm cream background, DM Serif Display for headlines, Work Sans for body, IBM Plex Mono for numbers.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To enable Supabase sync (Phase 2), copy `.env.local.example` to `.env.local` and fill in the project URL and anon key.

## Status

**Phase 1 — Scaffold.** Frontend with mock data only. Supabase client returns `null` if env vars are missing. FX rates hardcoded. No real auth.

### Roadmap

- Phase 1 — UI scaffold with mock data (current)
- Phase 2 — Real Supabase auth + queries + writes
- Phase 3 — Live FX rate API, charts
- Phase 4 — PWA / offline

## Routes

- `/` — dashboard
- `/entries` — entry list
- `/entries/new` — add entry
- `/goals` — goal tracking
- `/login` — magic-link sign in (stub)
