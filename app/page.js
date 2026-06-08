'use client';

// Dashboard splits monthly totals into two views:
//   Section A "All currencies" = display-currency view. THB totals are
//   converted to the user's display currency at today's FX rate. Convertible
//   apples-to-apples comparison.
//   Section B "By currency" = audit view. Each currency's raw amounts are
//   summed in their native unit — no FX applied. Useful for reconciling
//   against bank/wallet statements that live in a single currency.

import { useMemo } from 'react';
import Link from 'next/link';
import SummaryCard from '@/components/dashboard/SummaryCard';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import EntryRow from '@/components/entries/EntryRow';
import Button from '@/components/ui/Button';
import RequireAuth from '@/components/auth/RequireAuth';
import { useEntries } from '@/lib/queries/entries';
import { useDisplayCurrency } from '@/lib/displayCurrency';
import { getThbToUsdRate, getThbToJpyRate } from '@/lib/fx';
import { SUPPORTED_CURRENCIES } from '@/lib/fx';

function thisMonth(entries) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return entries.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  });
}

function DashboardInner() {
  const { data: entries, loading, error } = useEntries();
  const { currency } = useDisplayCurrency();

  const { incomeThb, expenseThb, netThb, recent, monthly } = useMemo(() => {
    const mo = thisMonth(entries);
    const inc = mo
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amountThb, 0);
    const exp = mo
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amountThb, 0);
    const rec = [...entries]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);
    return {
      incomeThb: inc,
      expenseThb: exp,
      netThb: inc - exp,
      recent: rec,
      monthly: mo,
    };
  }, [entries]);

  // Convert THB totals to the display currency using the CURRENT FX rate,
  // not each entry's locked rate at insert time. The locked per-entry rate
  // is correct for the audit trail on /entries, but the dashboard answers
  // "what's this worth right now?" so we apply today's rate to the THB sum.
  // Dashboard reads the rate at render time; if the FX cache refreshes in
  // the background, the values won't auto-update until the next render.
  const { income, expense, net } = useMemo(() => {
    let thbToDisplay = 1;
    if (currency === 'USD') thbToDisplay = getThbToUsdRate();
    else if (currency === 'JPY') thbToDisplay = getThbToJpyRate();
    return {
      income: incomeThb * thbToDisplay,
      expense: expenseThb * thbToDisplay,
      net: netThb * thbToDisplay,
    };
  }, [currency, incomeThb, expenseThb, netThb]);

  // Section B: sum raw `amount` per currency, no FX. Every supported currency
  // renders even if there are zero entries — keeps the layout stable and
  // signals to the user that the section is there for them.
  const perCurrency = useMemo(() => {
    return SUPPORTED_CURRENCIES.map((ccy) => {
      const rows = monthly.filter((e) => e.currency === ccy);
      const inc = rows
        .filter((e) => e.type === 'income')
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const exp = rows
        .filter((e) => e.type === 'expense')
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);
      return { currency: ccy, income: inc, expense: exp, net: inc - exp };
    });
  }, [monthly]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-[34px] text-[var(--color-primary)] leading-none">
          Dashboard
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
          This month at a glance.
        </p>
      </header>

      {error && (
        <div className="rounded-[12px] bg-[var(--color-error-bg)] text-[var(--color-error)] text-[13px] p-3">
          {error}
        </div>
      )}

      {/* Order: KPI summary -> primary visualization -> per-currency drilldown. */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="font-display text-[20px] text-[var(--color-primary)] leading-none">
            All currencies
          </h3>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
            Sums in {currency} equivalent.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Net" amount={net} currency={currency} tone="net" />
          <SummaryCard label="Income" amount={income} currency={currency} tone="income" />
          <SummaryCard label="Expense" amount={expense} currency={currency} tone="expense" />
        </div>
      </section>

      <MonthlyChart />

      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-display text-[20px] text-[var(--color-primary)] leading-none">
            By currency
          </h3>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
            Raw amounts — no conversion.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          {perCurrency.map((row) => (
            <div key={row.currency} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[var(--color-primary)] font-sans">
                  {row.currency}
                </span>
                <span className="text-[14px] text-[var(--color-text-subtle)] font-sans">
                  ·
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SummaryCard
                  label="Net"
                  amount={row.net}
                  currency={row.currency}
                  tone="net"
                  size="sm"
                />
                <SummaryCard
                  label="Income"
                  amount={row.income}
                  currency={row.currency}
                  tone="income"
                  size="sm"
                />
                <SummaryCard
                  label="Expense"
                  amount={row.expense}
                  currency={row.currency}
                  tone="expense"
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[20px] text-[var(--color-primary)]">
          Recent entries
        </h2>
        {loading ? (
          <SkeletonRows />
        ) : recent.length === 0 ? (
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
            {recent.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
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

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
