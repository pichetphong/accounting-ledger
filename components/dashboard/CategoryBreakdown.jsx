'use client';

import { useMemo } from 'react';
import Card from '@/components/ui/Card';

const TOP_N = 6;

function formatAmount(value) {
  const v = Number.isFinite(value) ? value : 0;
  if (Math.abs(v) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(v);
  }
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

// Ranked expense-by-category list for the given entries (already scoped to the
// period by the caller). Amounts come from amountThb scaled to the display
// currency, matching the dashboard cards. Categories beyond TOP_N collapse
// into "Other" so the longest tails don't dominate the card.
export default function CategoryBreakdown({ entries, currency, thbToDisplay }) {
  const { rows, total } = useMemo(() => {
    const byCat = new Map();
    for (const e of entries) {
      if (e.type !== 'expense') continue;
      const cat = e.category?.trim() || 'Uncategorized';
      byCat.set(cat, (byCat.get(cat) || 0) + (Number(e.amountThb) || 0));
    }
    const sorted = [...byCat.entries()]
      .map(([category, thb]) => ({ category, amount: thb * thbToDisplay }))
      .sort((a, b) => b.amount - a.amount);
    const sum = sorted.reduce((s, r) => s + r.amount, 0);

    if (sorted.length <= TOP_N) return { rows: sorted, total: sum };
    const head = sorted.slice(0, TOP_N);
    const otherAmount = sorted.slice(TOP_N).reduce((s, r) => s + r.amount, 0);
    return { rows: [...head, { category: 'Other', amount: otherAmount }], total: sum };
  }, [entries, thbToDisplay]);

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-[20px] text-[var(--color-primary)] leading-none">
          Where it went
        </h3>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
          Expenses by category · {currency}
        </p>
      </div>

      {rows.length === 0 || total <= 0 ? (
        <div className="h-[120px] flex items-center justify-center rounded-[12px] shadow-inset bg-[var(--color-bg)]">
          <span className="text-[13px] text-[var(--color-text-muted)] text-center px-4">
            No expenses in this range yet.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => {
            const pct = total > 0 ? (r.amount / total) * 100 : 0;
            return (
              <div key={r.category} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-medium text-[var(--color-text)] truncate">
                    {r.category}
                  </span>
                  <span className="font-mono text-[13px] text-[var(--color-text-muted)] whitespace-nowrap shrink-0">
                    {formatAmount(r.amount)}
                    <span className="text-[var(--color-text-subtle)]"> · {pct.toFixed(0)}%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-surface-inset)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
