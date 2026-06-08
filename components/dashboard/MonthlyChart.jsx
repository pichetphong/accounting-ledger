'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '@/components/ui/Card';
import Pill from '@/components/ui/Pill';
import { useEntries } from '@/lib/queries/entries';
import { useDisplayCurrency } from '@/lib/displayCurrency';
import { getThbToUsdRate, getThbToJpyRate } from '@/lib/fx';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const INCOME_COLOR = '#059669';
const EXPENSE_COLOR = '#EF4444';

const COMPACT_THRESHOLD = 1_000_000;

const RANGE_STORAGE_KEY = 'ledger-web:chart-range-v1';
const DEFAULT_RANGE = '6M';
const RANGES = ['1W', '1M', '3M', '6M', '1Y'];

const RANGE_HEADING = {
  '1W': 'Last 1 week',
  '1M': 'Last 1 month',
  '3M': 'Last 3 months',
  '6M': 'Last 6 months',
  '1Y': 'Last 1 year',
};

function formatTick(value) {
  const v = Number.isFinite(value) ? value : 0;
  if (Math.abs(v) >= COMPACT_THRESHOLD) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(v);
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v);
}

function formatAmount(value) {
  const v = Number.isFinite(value) ? value : 0;
  if (Math.abs(v) >= COMPACT_THRESHOLD) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(v);
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(v);
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isoDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shortMonthDay(d) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}

// Monday of the ISO week containing the date.
function isoWeekStart(d) {
  const day = startOfDay(d);
  const dayOfWeek = day.getDay(); // 0..6 (Sun..Sat)
  const offset = (dayOfWeek + 6) % 7; // distance back to Monday
  day.setDate(day.getDate() - offset);
  return day;
}

function buildDailyBuckets(entries, days) {
  const now = startOfDay(new Date());
  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({
      key: isoDateKey(d),
      label: shortMonthDay(d),
      start: new Date(d),
      end: new Date(d),
      incomeThb: 0,
      expenseThb: 0,
    });
  }
  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
  for (const e of entries) {
    if (!e?.date) continue;
    const idx = indexByKey.get(String(e.date).slice(0, 10));
    if (idx === undefined) continue;
    const amount = Number(e.amountThb) || 0;
    if (e.type === 'income') buckets[idx].incomeThb += amount;
    else if (e.type === 'expense') buckets[idx].expenseThb += amount;
  }
  return buckets;
}

function buildWeeklyBuckets(entries, weeks) {
  const now = startOfDay(new Date());
  const thisWeekStart = isoWeekStart(now);
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = new Date(thisWeekStart);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    buckets.push({
      key: isoDateKey(start),
      label: shortMonthDay(start),
      start,
      end,
      incomeThb: 0,
      expenseThb: 0,
    });
  }
  const earliest = buckets[0].start.getTime();
  const latest = buckets[buckets.length - 1].end.getTime();
  for (const e of entries) {
    if (!e?.date) continue;
    const ed = new Date(`${String(e.date).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(ed.getTime())) continue;
    const t = ed.getTime();
    if (t < earliest || t > latest) continue;
    const weekStart = isoWeekStart(ed);
    const key = isoDateKey(weekStart);
    const idx = buckets.findIndex((b) => b.key === key);
    if (idx === -1) continue;
    const amount = Number(e.amountThb) || 0;
    if (e.type === 'income') buckets[idx].incomeThb += amount;
    else if (e.type === 'expense') buckets[idx].expenseThb += amount;
  }
  return buckets;
}

function buildMonthlyBuckets(entries, months) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    buckets.push({
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: MONTH_LABELS[month],
      year,
      month,
      incomeThb: 0,
      expenseThb: 0,
    });
  }
  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
  for (const e of entries) {
    if (!e?.date) continue;
    const ed = new Date(`${String(e.date).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(ed.getTime())) continue;
    const key = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}`;
    const idx = indexByKey.get(key);
    if (idx === undefined) continue;
    const amount = Number(e.amountThb) || 0;
    if (e.type === 'income') buckets[idx].incomeThb += amount;
    else if (e.type === 'expense') buckets[idx].expenseThb += amount;
  }
  return buckets;
}

function buildBucketsForRange(entries, range) {
  switch (range) {
    case '1W':
      return { buckets: buildDailyBuckets(entries, 7), kind: 'daily' };
    case '1M':
      return { buckets: buildDailyBuckets(entries, 30), kind: 'daily' };
    case '3M':
      return { buckets: buildWeeklyBuckets(entries, 13), kind: 'weekly' };
    case '6M':
      return { buckets: buildMonthlyBuckets(entries, 6), kind: 'monthly' };
    case '1Y':
      return { buckets: buildMonthlyBuckets(entries, 12), kind: 'monthly' };
    default:
      return { buckets: buildMonthlyBuckets(entries, 6), kind: 'monthly' };
  }
}

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload || payload.length === 0) return null;
  const income = payload.find((p) => p.dataKey === 'income')?.value ?? 0;
  const expense = payload.find((p) => p.dataKey === 'expense')?.value ?? 0;
  const net = income - expense;
  return (
    <div
      style={{
        backgroundColor: '#3E2723',
        color: '#FFFFFF',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        padding: '8px 12px',
        borderRadius: 8,
        maxWidth: 220,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div>Income: {formatAmount(income)} {currency}</div>
      <div>Expense: {formatAmount(expense)} {currency}</div>
      <div style={{ marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 4 }}>
        Net: {formatAmount(net)} {currency}
      </div>
    </div>
  );
}

export default function MonthlyChart() {
  const { data: entries } = useEntries();
  const { currency } = useDisplayCurrency();
  const [range, setRange] = useState(DEFAULT_RANGE);

  // Hydrate from localStorage after mount — same SSR-safe pattern used in
  // DisplayCurrencyProvider, so the SSR pass and the first client paint
  // agree on the default and then snap to the persisted value.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(RANGE_STORAGE_KEY);
      if (stored && RANGES.includes(stored)) setRange(stored);
    } catch {
      // localStorage disabled; keep default.
    }
  }, []);

  const handleSetRange = (next) => {
    if (!RANGES.includes(next)) return;
    setRange(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(RANGE_STORAGE_KEY, next);
    } catch {
      // localStorage full or disabled; state still updates for this session.
    }
  };

  const thbToDisplay = useMemo(() => {
    if (currency === 'USD') return getThbToUsdRate();
    if (currency === 'JPY') return getThbToJpyRate();
    return 1;
  }, [currency]);

  // Aggregate THB totals per bucket first, then scale the whole bucket
  // by the current THB to display rate exactly once. Same approach as the
  // dashboard summary cards, so chart values and card values stay consistent.
  const { chartData, kind } = useMemo(() => {
    const { buckets, kind: k } = buildBucketsForRange(entries, range);
    const data = buckets.map((b) => ({
      label: b.label,
      income: b.incomeThb * thbToDisplay,
      expense: b.expenseThb * thbToDisplay,
    }));
    return { chartData: data, kind: k };
  }, [entries, range, thbToDisplay]);

  const hasData = chartData.some((d) => d.income > 0 || d.expense > 0);

  // Always rotate x-axis labels so every range (1W / 1M / 3M / 6M / 1Y) shares
  // the same axis treatment, regardless of bucket count.
  const xAxisProps = {
    tick: { fontSize: 10, fontFamily: 'var(--font-sans)', fill: '#6D4C41' },
    angle: -35,
    textAnchor: 'end',
    dy: 6,
    height: 50,
    interval: 'preserveStartEnd',
  };
  const chartMargin = { top: 12, right: 8, left: 0, bottom: 28 };
  const isDense1M = range === '1M';
  const maxBarSize = isDense1M ? 10 : kind === 'daily' ? 16 : kind === 'weekly' ? 20 : 28;

  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-[20px] text-[var(--color-primary)] leading-none">
            {RANGE_HEADING[range]}
          </h3>
          <span className="text-[12px] font-sans text-[var(--color-text-muted)]">
            · {currency}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {RANGES.map((r) => (
            <Pill
              key={r}
              size="sm"
              active={range === r}
              onClick={() => handleSetRange(r)}
            >
              {r}
            </Pill>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="mt-4 h-[200px] md:h-[240px] flex items-center justify-center rounded-[12px] shadow-inset bg-[var(--color-bg)]">
          <span className="text-[13px] text-[var(--color-text-muted)] font-sans text-center px-4">
            No data in this range — add an entry to see your trend.
          </span>
        </div>
      ) : (
        <div className="mt-4 h-[200px] md:h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={chartMargin}>
              <CartesianGrid stroke="#E8DDD0" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#E8DDD0' }}
                {...xAxisProps}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: 'var(--font-sans)', fill: '#6D4C41' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatTick}
                width={48}
              />
              <Tooltip
                cursor={{ fill: 'rgba(139, 94, 60, 0.08)' }}
                content={<ChartTooltip currency={currency} />}
              />
              <Bar
                dataKey="income"
                fill={INCOME_COLOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={maxBarSize}
              />
              <Bar
                dataKey="expense"
                fill={EXPENSE_COLOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={maxBarSize}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
