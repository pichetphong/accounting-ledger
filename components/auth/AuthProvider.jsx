'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { runCategoryMigration } from '@/lib/queries/migrateLocalCategories';

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastMigratedUserId = useRef(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[ledger-web] getSession failed', err?.message ?? err);
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return;
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (lastMigratedUserId.current === user.id) return;
    lastMigratedUserId.current = user.id;
    runCategoryMigration(user.id).catch((err) => {
      console.warn('[ledger-web] category migration failed', err?.message ?? err);
    });
  }, [user]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ user, session, loading, signOut }),
    [user, session, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
