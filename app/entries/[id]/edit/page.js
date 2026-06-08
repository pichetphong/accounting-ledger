'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import EntryForm from '@/components/entries/EntryForm';
import RequireAuth from '@/components/auth/RequireAuth';
import { getSupabaseClient } from '@/lib/supabase/client';

function fromRow(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    amount: Number(row.amount),
    currency: row.currency,
    fx_rate: Number(row.fx_rate),
    amount_thb: Number(row.amount_thb),
    category: row.category ?? '',
    note: row.note ?? '',
  };
}

function EditEntryInner({ id }) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('id', id)
        .single();
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setEntry(fromRow(data));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-[14px] text-[var(--color-text-muted)]">Loading...</span>
      </div>
    );
  }

  if (notFound || !entry) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-[var(--color-surface)] rounded-[12px] p-6 shadow-raised flex flex-col items-start gap-3">
          <p className="text-[14px] text-[var(--color-text)]">Entry not found.</p>
          <Link
            href="/entries"
            className="text-[13px] text-[var(--color-primary)] underline"
          >
            Back to entries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-[34px] text-[var(--color-primary)] leading-none">
          Edit entry
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
          Update the fields, or delete this entry.
        </p>
      </header>
      <EntryForm initialValues={entry} mode="edit" />
    </div>
  );
}

export default function EditEntryPage({ params }) {
  // Next 15 dynamic params arrive as a thenable promise — unwrap with React.use().
  const { id } = use(params);
  return (
    <RequireAuth>
      <EditEntryInner id={id} />
    </RequireAuth>
  );
}
