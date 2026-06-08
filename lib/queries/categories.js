'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import useAuth from '@/lib/useAuth';

const UNIQUE_VIOLATION = '23505';

function sortNames(list) {
  return [...list].sort((a, b) => a.localeCompare(b));
}

export function useCategoriesRemote() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client unavailable.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });
    if (err) {
      setError(err.message);
      setCategories([]);
    } else {
      setCategories(sortNames((data ?? []).map((row) => row.name)));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }
    fetchCategories();
  }, [authLoading, user, fetchCategories]);

  const addCategory = useCallback(
    async (rawName) => {
      const name = String(rawName ?? '').trim();
      if (!name) return { ok: false, reason: 'empty' };

      const supabase = getSupabaseClient();
      if (!supabase) return { ok: false, reason: 'offline', message: 'Offline.' };

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { ok: false, reason: 'unauth', message: 'Not signed in.' };
      }

      const { error: err } = await supabase
        .from('categories')
        .insert({ user_id: userData.user.id, name });

      if (err) {
        if (err.code === UNIQUE_VIOLATION) {
          return { ok: false, reason: 'duplicate', message: 'Category already exists' };
        }
        return { ok: false, reason: 'unknown', message: err.message };
      }

      setCategories((prev) => sortNames([...prev, name]));
      return { ok: true, name };
    },
    [],
  );

  const removeCategory = useCallback(
    async (name) => {
      const supabase = getSupabaseClient();
      if (!supabase) return { ok: false, reason: 'offline' };

      const { error: err } = await supabase
        .from('categories')
        .delete()
        .eq('name', name);

      if (err) return { ok: false, reason: 'unknown', message: err.message };

      setCategories((prev) => prev.filter((c) => c !== name));
      return { ok: true };
    },
    [],
  );

  const renameCategory = useCallback(
    async (oldName, rawNewName) => {
      const newName = String(rawNewName ?? '').trim();
      if (!newName) return { ok: false, reason: 'empty' };

      const supabase = getSupabaseClient();
      if (!supabase) return { ok: false, reason: 'offline' };

      const { error: err } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('name', oldName);

      if (err) {
        if (err.code === UNIQUE_VIOLATION) {
          return { ok: false, reason: 'duplicate', message: 'Category already exists' };
        }
        return { ok: false, reason: 'unknown', message: err.message };
      }

      setCategories((prev) =>
        sortNames(prev.map((c) => (c === oldName ? newName : c))),
      );
      return { ok: true, name: newName };
    },
    [],
  );

  return {
    categories,
    loading,
    error,
    addCategory,
    removeCategory,
    renameCategory,
    refetch: fetchCategories,
  };
}
