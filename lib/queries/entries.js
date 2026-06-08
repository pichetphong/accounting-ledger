'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import useAuth from '@/lib/useAuth';

// Normalises a DB row (snake_case, amount_thb) into the in-app entry shape
// (camelCase, amountThb) so the existing EntryRow/SummaryCard/dashboard
// math keeps working unchanged.
function fromRow(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    amount: Number(row.amount),
    currency: row.currency,
    fxRate: Number(row.fx_rate),
    amountThb: Number(row.amount_thb),
    category: row.category ?? '',
    note: row.note ?? '',
    createdAt: row.created_at,
  };
}

export function useEntries() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client unavailable.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false })
      .limit(200);
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
    fetchEntries();
  }, [authLoading, user, fetchEntries]);

  return { data, loading, error, refetch: fetchEntries };
}

export async function createEntry(payload) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client unavailable.' } };
  }
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return { data: null, error: { message: 'Not signed in.' } };
  }
  const row = {
    user_id: userData.user.id,
    date: payload.date,
    type: payload.type,
    amount: payload.amount,
    currency: payload.currency,
    fx_rate: payload.fx_rate,
    amount_thb: payload.amount_thb,
    category: payload.category || null,
    note: payload.note || null,
  };
  const { data, error } = await supabase
    .from('entries')
    .insert(row)
    .select()
    .single();
  if (error) return { data: null, error };
  return { data: fromRow(data), error: null };
}

export async function updateEntry(id, patch) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client unavailable.' } };
  }
  const dbPatch = {};
  if ('date' in patch) dbPatch.date = patch.date;
  if ('type' in patch) dbPatch.type = patch.type;
  if ('amount' in patch) dbPatch.amount = patch.amount;
  if ('currency' in patch) dbPatch.currency = patch.currency;
  if ('fx_rate' in patch) dbPatch.fx_rate = patch.fx_rate;
  if ('amount_thb' in patch) dbPatch.amount_thb = patch.amount_thb;
  if ('category' in patch) dbPatch.category = patch.category;
  if ('note' in patch) dbPatch.note = patch.note;

  const { data, error } = await supabase
    .from('entries')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();
  if (error) return { data: null, error };
  return { data: fromRow(data), error: null };
}

export async function deleteEntry(id) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: { message: 'Supabase client unavailable.' } };
  }
  const { error } = await supabase.from('entries').delete().eq('id', id);
  return { error };
}
