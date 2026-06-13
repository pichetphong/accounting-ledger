'use client';

// Dashboard splits totals into two views:
//   Section A "All currencies" = display-currency view. THB totals are
//   converted to the user's display currency at today's FX rate. Convertible
//   apples-to-apples comparison.
//   Section B "By currency" = audit view. Each currency's raw amounts are
//   summed in their native unit — no FX applied. Useful for reconciling
//   against bank/wallet statements that live in a single currency.
// Every section reads the same date range from useDashboardRange, so the whole
// page reflects one selected period.

import { useMemo } from 'react';
import Link from 'next/link';
import SummaryCard from '@/components/dashboard/SummaryCard';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import EntryRow from '@/components/entries/EntryRow';
import EntryTable from '@/components/entries/EntryTable';
import Button from '@/components/ui/Button';
import RequireAuth from '@/components/auth/RequireAuth';
import { useEntries } from '@/lib/queries/entries';
import { useDisplayCurrency } from '@/lib/displayCurrency';
import useDashboardRange from '@/lib/useDashboardRange';
import { getThbToUsdRate, getThbToJpyRate, SUPPORTED_CURRENCIES } from '@/lib/fx';

function sumThb(rows, type) {
  return rows.filter((e) => e.type === type).reduce((s, e) => s + e.amountThb, 0);
}

// Percent change vs the prior period; null when there's no prior baseline to
// compare against (avoids a misleading "+Infinity%").
function pctChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function DashboardInner() {
  const range = useDashboardRange();
  const { currency } = useDisplayCurrency();
  const { data: entries, loading, error } = useEntries({ from: range.from, to: range.to });
  const { data: prevEntries } = useEntries({ from: range.prev.from, to: range.prev.to });

  const thbToDisplay = useMemo(() => {
    if (currency === 'USD') return getThbToUsdRate();
    if (currency === 'JPY') return getThbToJpyRate();
    return 1;
  }, [currency]);

  const { incomeThb, expenseThb, netThb, deltas, savingsRate, recent } = useMemo(() => {
    const inc = sumThb(entries, 'income');
    const exp = sumThb(entries, 'expense');
    const net = inc - exp;
    const prevInc = sumThb(prevEntries, 'income');
    const prevExp = sumThb(prevEntries, 'expense');
    const rec = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
    return {
      incomeThb: inc,
      expenseThb: exp,
      netThb: net,
      deltas: {
        income: pctChange(inc, prevInc),
        expense: pctChange(exp, prevExp),
        net: pctChange(net, prevInc - prevExp),
      },
      savingsRate: inc > 0 ? (net / inc) * 100 : null,
      recent: rec,
    };
  }, [entries, prevEntries]);

  const { income, expense, net } = useMemo(() => ({
    income: incomeThb * thbToDisplay,
    expense: expenseThb * thbToDisplay,
    net: netThb * thbToDisplay,
  }), [thbToDisplay, incomeThb, expenseThb, netThb]);

  // Section B: sum raw `amount` per currency, no FX. Every supported currency
  // renders even with zero entries, keeping the layout stable.
  const perCurrency = useMemo(() => {
    return SUPPORTED_CURRENCIES.map((ccy) => {
      const rows = entries.filter((e) => e.currency === ccy);
      const inc = rows.filter((e) => e.type === 'income').reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const exp = rows.filter((e) => e.type === 'expense').reduce((s, e) => s + (Number(e.amount) || 0), 0);
      return { currency: ccy, income: inc, expense: exp, net: inc - exp };
    });
  }, [entries]);

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b-[5px] border-black pb-3">
        <h1 className="font-display text-[44px] md:text-[56px] uppercase text-black leading-[0.95]">
          Dashboard
        </h1>
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-black mt-2">
          {range.label} / at a glance
        </p>
      </header>

      <DashboardFilters range={range} />

      {error && (
        <div className="border-[3px] border-[var(--color-error)] bg-white text-[var(--color-error)] text-[13px] p-3">
          {error}
        </div>
      )}

      {/* Order: KPI summary -> primary visualization -> per-currency drilldown. */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="font-display text-[22px] uppercase text-black leading-none">
              All currencies
            </h3>
            <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-[var(--color-text-muted)] mt-1">
              Sums in {currency} equivalent
            </p>
          </div>
          {savingsRate != null && (
            <span className="font-mono text-[12px] uppercase tracking-[0.04em] text-black">
              Saved <span className="font-bold">{savingsRate.toFixed(0)}%</span> of income
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Net" amount={net} currency={currency} tone="net" delta={deltas.net} deltaLabel="vs prev period" />
          <SummaryCard label="Income" amount={income} currency={currency} tone="income" delta={deltas.income} deltaLabel="vs prev period" />
          <SummaryCard label="Expense" amount={expense} currency={currency} tone="expense" delta={deltas.expense} deltaPositiveIsGood={false} deltaLabel="vs prev period" />
        </div>
      </section>

      <MonthlyChart entries={entries} from={range.from} to={range.to} />

      <CategoryBreakdown entries={entries} currency={currency} thbToDisplay={thbToDisplay} />

      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-display text-[22px] uppercase text-black leading-none">
            By currency
          </h3>
          <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-[var(--color-text-muted)] mt-1">
            Raw amounts / no conversion
          </p>
        </div>
        <div className="flex flex-col gap-5">
          {perCurrency.map((row) => (
            <div key={row.currency} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[var(--color-primary)] font-sans">
                  {row.currency}
                </span>
                <span className="text-[14px] text-[var(--color-text-subtle)] font-sans">·</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SummaryCard label="Net" amount={row.net} currency={row.currency} tone="net" size="sm" />
                <SummaryCard label="Income" amount={row.income} currency={row.currency} tone="income" size="sm" />
                <SummaryCard label="Expense" amount={row.expense} currency={row.currency} tone="expense" size="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[22px] uppercase text-black">
          Recent entries
        </h2>
        {loading ? (
          <SkeletonRows />
        ) : recent.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-[12px] p-6 border-[3px] border-black flex flex-col items-start gap-3">
            <p className="text-[14px] text-[var(--color-text-muted)]">
              No entries in this range.
            </p>
            <Link href="/entries/new">
              <Button variant="primary" size="md">Add entry</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <EntryTable entries={recent} />
            </div>
            <div className="md:hidden flex flex-col gap-3">
              {recent.map((entry) => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-[var(--color-surface)] rounded-[12px] p-4 border-[3px] border-black flex items-center justify-between gap-3 opacity-50"
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

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
