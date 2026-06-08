'use client';

import { getSupabaseClient } from '@/lib/supabase/client';
import { mockCategories } from '@/lib/mockData';

const STORAGE_KEY = 'ledger-web:categories';
const MIGRATION_MARKER = 'ledger-web:categories-migrated-v1';

function readLocalCategories() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => typeof x === 'string')
      .map((x) => x.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function setMigrationMarker() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MIGRATION_MARKER, new Date().toISOString());
  } catch {
    // Storage full or disabled; ignore so repeat attempts simply happen again.
  }
}

function hasMigrationMarker() {
  if (typeof window === 'undefined') return true;
  try {
    return Boolean(window.localStorage.getItem(MIGRATION_MARKER));
  } catch {
    return true;
  }
}

// One-shot migration. Idempotent: gated by a localStorage marker and by an
// existence check against the remote table for the active user.
//
// Behaviour:
//   - Marker present                       -> no-op
//   - Remote table already has rows        -> set marker, no-op
//   - Remote empty + local has entries     -> bulk insert local, set marker
//   - Remote empty + local empty           -> seed with mockCategories, set marker
export async function runCategoryMigration(userId) {
  if (!userId) return { skipped: true, reason: 'no-user' };
  if (hasMigrationMarker()) return { skipped: true, reason: 'marker' };

  const supabase = getSupabaseClient();
  if (!supabase) return { skipped: true, reason: 'no-client' };

  const { count, error: countErr } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true });

  if (countErr) {
    return { skipped: true, reason: 'count-error', error: countErr };
  }

  if ((count ?? 0) > 0) {
    setMigrationMarker();
    return { skipped: true, reason: 'remote-non-empty' };
  }

  const local = readLocalCategories();
  const seed = local.length > 0 ? local : [...mockCategories];

  const rows = seed.map((name) => ({ user_id: userId, name }));

  const { error: insertErr } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'user_id,name', ignoreDuplicates: true });

  if (insertErr) {
    return { skipped: true, reason: 'insert-error', error: insertErr };
  }

  setMigrationMarker();
  return { skipped: false, inserted: rows.length, source: local.length > 0 ? 'local' : 'seed' };
}
