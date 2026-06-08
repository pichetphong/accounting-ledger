'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import useAuth from '@/lib/useAuth';

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    deadline: row.deadline,
    currency: row.currency ?? 'ALL',
    mode: row.mode ?? 'net',
    createdAt: row.created_at,
  };
}

export function useGoals() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client unavailable.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('goals')
      .select('*')
      .order('deadline', { ascending: true });
    if (err) {
      setError(err.message);
      setData([]);
    } else {
      setData((rows ?? []).map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    fetchGoals();
  }, [authLoading, user, fetchGoals]);

  return { data, loading, error, refetch: fetchGoals };
}

export async function createGoal({ user_id, name, target_amount, deadline, currency, mode }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client unavailable.' } };
  }
  const row = {
    user_id,
    name: String(name ?? '').trim(),
    target_amount: Number(target_amount),
    deadline,
    currency: currency ?? 'ALL',
    mode: mode ?? 'net',
  };
  const { data, error } = await supabase
    .from('goals')
    .insert(row)
    .select()
    .single();
  if (error) return { data: null, error };
  return { data: fromRow(data), error: null };
}

export async function updateGoal(id, patch) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client unavailable.' } };
  }
  const dbPatch = {};
  if ('name' in patch) dbPatch.name = patch.name;
  if ('target_amount' in patch) dbPatch.target_amount = patch.target_amount;
  if ('deadline' in patch) dbPatch.deadline = patch.deadline;
  if ('currency' in patch) dbPatch.currency = patch.currency;
  if ('mode' in patch) dbPatch.mode = patch.mode;

  const { data, error } = await supabase
    .from('goals')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();
  if (error) return { data: null, error };
  return { data: fromRow(data), error: null };
}

export async function deleteGoal(id) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: { message: 'Supabase client unavailable.' } };
  }
  const { error } = await supabase.from('goals').delete().eq('id', id);
  return { error };
}
