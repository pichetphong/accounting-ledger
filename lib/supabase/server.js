import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side Supabase factory. Phase 2 only uses this from the magic-link
// route handler at app/auth/callback/route.js; no server components consume it yet.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getSupabaseServerClient() {
  if (!url || !anonKey) {
    throw new Error('Supabase env vars missing on the server.');
  }
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookies are read-only. Safe to ignore
          // when the middleware/route-handler path has already refreshed the session.
        }
      },
    },
  });
}
