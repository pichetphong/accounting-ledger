-- ledger-web migration: add currency + mode columns to goals
-- Date: 2026-06-08
-- Apply via Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--
-- What this does:
--   1. Adds `currency` column (THB / USD / JPY / ALL) -- default ALL keeps existing goals behaving as before
--   2. Adds `mode` column (income / net) -- default net keeps existing goals behaving as before
--   3. Both columns are NOT NULL with check constraints to prevent bad values
--
-- Safe to re-run? No -- ADD COLUMN will fail if column already exists.
-- If you accidentally run twice, ignore the "column already exists" error.

ALTER TABLE public.goals
  ADD COLUMN currency text NOT NULL DEFAULT 'ALL'
    CHECK (currency IN ('THB', 'USD', 'JPY', 'ALL'));

ALTER TABLE public.goals
  ADD COLUMN mode text NOT NULL DEFAULT 'net'
    CHECK (mode IN ('income', 'net'));

-- ============================================================
-- Verification queries (run these after the ALTERs to confirm)
-- ============================================================

-- Should return 2 rows: currency + mode, both NOT NULL with defaults
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'goals'
  AND column_name IN ('currency', 'mode');

-- Should show existing goals all defaulted to ALL/net
SELECT id, name, target_amount, currency, mode, deadline
FROM public.goals
ORDER BY created_at DESC;
