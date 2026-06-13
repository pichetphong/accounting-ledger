'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Pill from '@/components/ui/Pill';
import DateRangePicker from '@/components/ui/DateRangePicker';
import EntryRow from '@/components/entries/EntryRow';
import EntryTable from '@/components/entries/EntryTable';
import RequireAuth from '@/components/auth/RequireAuth';
import { useEntries } from '@/lib/queries/entries';

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
];

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-[var(--color-surface)] rounded-[12px] p-4 border-[3px] border-[var(--rb-ink)] flex items-center justify-between gap-3 opacity-50"
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
  const [range, setRange] = useState({ from: null, to: null });
  const [type, setType] = useState('all');
  const { data: entries, loading, error } = useEntries(range);

  const sorted = useMemo(() => {
    const rows = type === 'all' ? entries : entries.filter((e) => e.type === type);
    return [...rows].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries, type]);

  const filtersActive = Boolean(range.from && range.to) || type !== 'all';

  const incomeRows = useMemo(() => sorted.filter((e) => e.type === 'income'), [sorted]);
  const expenseRows = useMemo(() => sorted.filter((e) => e.type === 'expense'), [sorted]);

  const clearFilters = () => {
    setRange({ from: null, to: null });
    setType('all');
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between border-b-[5px] border-[var(--rb-ink)] pb-3">
        <div>
          <h1 className="font-display text-[44px] md:text-[56px] uppercase text-[var(--rb-ink)] leading-[0.95]">
            Entries
          </h1>
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--rb-ink)] mt-2">
            {loading ? 'Loading...' : `${sorted.length} entries / newest first`}
          </p>
        </div>
        <Link href="/entries/new">
          <Button variant="primary" size="md">
            Add
          </Button>
        </Link>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {TYPES.map((t) => (
            <Pill key={t.key} size="sm" active={type === t.key} onClick={() => setType(t.key)}>
              {t.label}
            </Pill>
          ))}
        </div>
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
      </div>

      {error ? (
        <div className="bg-[var(--color-surface)] rounded-[12px] p-4 border-[3px] border-[var(--rb-ink)]">
          <p className="text-[13px] text-[var(--color-error)]">{error}</p>
        </div>
      ) : loading ? (
        <SkeletonRows />
      ) : sorted.length === 0 ? (
        filtersActive ? (
          <div className="bg-[var(--color-surface)] rounded-[12px] p-6 border-[3px] border-[var(--rb-ink)] flex flex-col items-start gap-3">
            <p className="text-[14px] text-[var(--color-text-muted)]">
              No entries match these filters.
            </p>
            <Button variant="secondary" size="md" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-[12px] p-6 border-[3px] border-[var(--rb-ink)] flex flex-col items-start gap-3">
            <p className="text-[14px] text-[var(--color-text-muted)]">
              No entries yet — add your first one.
            </p>
            <Link href="/entries/new">
              <Button variant="primary" size="md">Add entry</Button>
            </Link>
          </div>
        )
      ) : (
        <>
          {/* Desktop: income/expense split side by side (single table when the
              type filter narrows to one side). Mobile: card list. */}
          <div className="hidden md:block">
            {type === 'all' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <EntryTable title="Income" entries={incomeRows} compact />
                <EntryTable title="Expense" entries={expenseRows} compact />
              </div>
            ) : (
              <EntryTable title={type === 'income' ? 'Income' : 'Expense'} entries={sorted} />
            )}
          </div>
          <div className="md:hidden flex flex-col gap-3">
            {sorted.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        </>
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
