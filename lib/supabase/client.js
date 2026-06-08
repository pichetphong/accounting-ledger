'use client';

import { createBrowserClient } from '@supabase/ssr';

// Phase 2 decision: we deliberately skip middleware-based session refresh.
// The client-side AuthProvider + createBrowserClient already persist the
// session in cookies and refresh tokens on focus, which is sufficient for
// a single-user, mostly-online PWA-style app. Revisit if we add SSR pages
// that need to read the session server-side.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let memoizedClient = null;

export function getSupabaseClient() {
  if (memoizedClient) return memoizedClient;
  if (!url || !anonKey) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[ledger-web] Supabase env vars missing. Cloud sync is disabled. Copy .env.local.example to .env.local to enable.',
      );
    }
    return null;
  }
  memoizedClient = createBrowserClient(url, anonKey);
  return memoizedClient;
}

// Back-compat export for any straggling imports.
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;
