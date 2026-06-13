'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
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
import { useDisplayCurrency } from '@/lib/displayCurrency';
import { getThbToUsdRate, getThbToJpyRate } from '@/lib/fx';
import { daySpan, fromIso, toIso, startOfDay, addDays } from '@/lib/dateRange';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const INCOME_COLOR = '#059669';
const EXPENSE_COLOR = '#EF4444';
const NET_COLOR = '#8B5E3C';

const COMPACT_THRESHOLD = 1_000_000;
const VIEW_STORAGE_KEY = 'ledger-web:chart-view-v1';

function formatTick(value) {
  const v = Number.isFinite(value) ? value : 0;
  if (Math.abs(v) >= COMPACT_THRESHOLD) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v);
}

function formatAmount(value) {
  const v = Number.isFinite(value) ? value : 0;
  if (Math.abs(v) >= COMPACT_THRESHOLD) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(v);
  }
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
}

function shortMonthDay(d) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}

// Monday of the ISO week containing the date.
function isoWeekStart(d) {
  const day = startOfDay(d);
  const offset = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - offset);
  return day;
}

// Pick bucket granularity from the range length, then lay down empty buckets
// spanning [from, to] so the axis stays continuous even with gaps in the data.
function buildBuckets(entries, fromStr, toStr) {
  const span = daySpan(fromStr, toStr);
  const kind = span <= 31 ? 'daily' : span <= 180 ? 'weekly' : 'monthly';
  const from = fromIso(fromStr);
  const to = fromIso(toStr);
  if (!from || !to) return { buckets: [], kind };

  const buckets = [];
  if (kind === 'daily') {
    for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
      buckets.push({ key: toIso(d), label: shortMonthDay(d), incomeThb: 0, expenseThb: 0 });
    }
  } else if (kind === 'weekly') {
    for (let d = isoWeekStart(from); d <= to; d = addDays(d, 7)) {
      buckets.push({ key: toIso(d), label: shortMonthDay(d), incomeThb: 0, expenseThb: 0 });
    }
  } else {
    let d = new Date(from.getFullYear(), from.getMonth(), 1);
    const last = new Date(to.getFullYear(), to.getMonth(), 1);
    for (; d <= last; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: MONTH_LABELS[d.getMonth()],
        incomeThb: 0,
        expenseThb: 0,
      });
    }
  }

  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
  const keyForEntry = (ed) => {
    if (kind === 'daily') return toIso(ed);
    if (kind === 'weekly') return toIso(isoWeekStart(ed));
    return `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}`;
  };

  for (const e of entries) {
    const ed = fromIso(e?.date);
    if (!ed) continue;
    const idx = indexByKey.get(keyForEntry(ed));
    if (idx === undefined) continue;
    const amount = Number(e.amountThb) || 0;
    if (e.type === 'income') buckets[idx].incomeThb += amount;
    else if (e.type === 'expense') buckets[idx].expenseThb += amount;
  }
  return { buckets, kind };
}

function ChartTooltip({ active, payload, label, currency, view }) {
  if (!active || !payload || payload.length === 0) return null;
  const box = {
    backgroundColor: '#3E2723',
    color: '#FFFFFF',
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    padding: '8px 12px',
    borderRadius: 8,
    maxWidth: 220,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  };
  if (view === 'cumulative') {
    const cumulative = payload.find((p) => p.dataKey === 'cumulative')?.value ?? 0;
    return (
      <div style={box}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div>Running net: {formatAmount(cumulative)} {currency}</div>
      </div>
    );
  }
  const income = payload.find((p) => p.dataKey === 'income')?.value ?? 0;
  const expense = payload.find((p) => p.dataKey === 'expense')?.value ?? 0;
  return (
    <div style={box}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div>Income: {formatAmount(income)} {currency}</div>
      <div>Expense: {formatAmount(expense)} {currency}</div>
      <div style={{ marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 4 }}>
        Net: {formatAmount(income - expense)} {currency}
      </div>
    </div>
  );
}

// Presentational: renders whatever range the dashboard passes in. The only
// local state is the Bars/Cumulative lens, which is a view concern, not data.
export default function MonthlyChart({ entries, from, to }) {
  const { currency } = useDisplayCurrency();
  const [view, setView] = useState('bars');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === 'bars' || stored === 'cumulative') setView(stored);
    } catch {
      // localStorage disabled; keep default.
    }
  }, []);

  const handleView = (v) => {
    setView(v);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, v);
    } catch {
      // localStorage full or disabled; state still updates this session.
    }
  };

  const thbToDisplay = useMemo(() => {
    if (currency === 'USD') return getThbToUsdRate();
    if (currency === 'JPY') return getThbToJpyRate();
    return 1;
  }, [currency]);

  // Aggregate THB totals per bucket first, then scale once by the THB->display
  // rate so chart values stay consistent with the dashboard summary cards.
  const { chartData, kind } = useMemo(() => {
    const { buckets, kind: k } = buildBuckets(entries, from, to);
    let running = 0;
    const data = buckets.map((b) => {
      const income = b.incomeThb * thbToDisplay;
      const expense = b.expenseThb * thbToDisplay;
      running += income - expense;
      return { label: b.label, income, expense, cumulative: running };
    });
    return { chartData: data, kind: k };
  }, [entries, from, to, thbToDisplay]);

  const hasData = chartData.some((d) => d.income > 0 || d.expense > 0);

  const xAxisProps = {
    tick: { fontSize: 10, fontFamily: 'var(--font-sans)', fill: '#6D4C41' },
    angle: -35,
    textAnchor: 'end',
    dy: 6,
    height: 50,
    interval: 'preserveStartEnd',
  };
  const chartMargin = { top: 12, right: 8, left: 0, bottom: 28 };
  const isDenseDaily = kind === 'daily' && chartData.length > 14;
  const maxBarSize = isDenseDaily ? 10 : kind === 'daily' ? 16 : kind === 'weekly' ? 20 : 28;

  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-[20px] text-[var(--color-primary)] leading-none">
            Trend
          </h3>
          <span className="text-[12px] font-sans text-[var(--color-text-muted)]">· {currency}</span>
        </div>
        <div className="flex gap-1.5">
          <Pill size="sm" active={view === 'bars'} onClick={() => handleView('bars')}>Bars</Pill>
          <Pill size="sm" active={view === 'cumulative'} onClick={() => handleView('cumulative')}>Cumulative</Pill>
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
            {view === 'cumulative' ? (
              <AreaChart data={chartData} margin={chartMargin}>
                <defs>
                  <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NET_COLOR} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={NET_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E8DDD0" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#E8DDD0' }} {...xAxisProps} />
                <YAxis
                  tick={{ fontSize: 12, fontFamily: 'var(--font-sans)', fill: '#6D4C41' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatTick}
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(139, 94, 60, 0.25)' }}
                  content={<ChartTooltip currency={currency} view="cumulative" />}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke={NET_COLOR}
                  strokeWidth={2}
                  fill="url(#netFill)"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid stroke="#E8DDD0" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#E8DDD0' }} {...xAxisProps} />
                <YAxis
                  tick={{ fontSize: 12, fontFamily: 'var(--font-sans)', fill: '#6D4C41' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatTick}
                  width={48}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(139, 94, 60, 0.08)' }}
                  content={<ChartTooltip currency={currency} view="bars" />}
                />
                <Bar dataKey="income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={maxBarSize} />
                <Bar dataKey="expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={maxBarSize} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
