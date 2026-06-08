'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import EntryRow from '@/components/entries/EntryRow';
import RequireAuth from '@/components/auth/RequireAuth';
import { useEntries } from '@/lib/queries/entries';

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-[var(--color-surface)] rounded-[12px] p-4 shadow-raised-sm flex items-center justify-between gap-3 opacity-50"
        >
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-3 w-24 bg-[var(--color-surface-inset)] rounded" />
            <div className="h-4 w-40 bg-[var(--color-surface-inset)] rounded" />
          </div>
          <div className="h-4 w-16 bg-[var(--color-surface-inset)] rounded" />
        </div>
      ))}
    </div>
  );
}

function EntriesInner() {
  const { data: entries, loading, error } = useEntries();

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [entries],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[34px] text-[var(--color-primary)] leading-none">
            Entries
          </h1>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
            {loading ? 'Loading...' : `${sorted.length} entries, newest first.`}
          </p>
        </div>
        <Link href="/entries/new">
          <Button variant="primary" size="md">
            Add
          </Button>
        </Link>
      </header>

      {error ? (
        <div className="bg-[var(--color-surface)] rounded-[12px] p-4 shadow-raised">
          <p className="text-[13px] text-[var(--color-error)]">{error}</p>
        </div>
      ) : loading ? (
        <SkeletonRows />
      ) : sorted.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-[12px] p-6 shadow-raised flex flex-col items-start gap-3">
          <p className="text-[14px] text-[var(--color-text-muted)]">
            No entries yet — add your first one.
          </p>
          <Link href="/entries/new">
            <Button variant="primary" size="md">Add entry</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EntriesPage() {
  return (
    <RequireAuth>
      <EntriesInner />
    </RequireAuth>
  );
}
