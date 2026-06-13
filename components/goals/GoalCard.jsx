'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useAuth from '@/lib/useAuth';
import useConfirm from '@/lib/useConfirm';
import { useDisplayCurrency } from '@/lib/displayCurrency';
import { getThbToUsdRate, getThbToJpyRate } from '@/lib/fx';
import { deleteGoal } from '@/lib/queries/goals';

const COMPACT_THRESHOLD = 1_000_000;

function formatAmount(amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  if (Math.abs(value) >= COMPACT_THRESHOLD) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function pad2(n) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function computeCountdown(deadlineISO) {
  // Deadline is a date string; treat it as end-of-day local time.
  const target = new Date(deadlineISO + 'T23:59:59').getTime();
  const now = Date.now();
  const ms = target - now;
  const overdue = ms < 0;
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  return { days, hours, minutes, seconds, overdue };
}

function sumThb(entries, type) {
  let s = 0;
  for (const e of entries) {
    if (e.type !== type) continue;
    s += Number(e.amountThb) || 0;
  }
  return s;
}

function sumAmount(entries, type) {
  let s = 0;
  for (const e of entries) {
    if (e.type !== type) continue;
    s += Number(e.amount) || 0;
  }
  return s;
}

export function computeGoalProgress(goal, entries) {
  const list = Array.isArray(entries) ? entries : [];
  const sinceISO = (goal.createdAt ?? '').slice(0, 10);
  const relevant = sinceISO
    ? list.filter((e) => e?.date && e.date >= sinceISO)
    : list;
  if (goal.currency === 'ALL') {
    const incomeTHB = sumThb(relevant, 'income');
    const expenseTHB = sumThb(relevant, 'expense');
    return { progress: incomeTHB - expenseTHB, native: 'THB' };
  }
  const inCcy = relevant.filter((e) => e.currency === goal.currency);
  const income = sumAmount(inCcy, 'income');
  if (goal.mode === 'income') {
    return { progress: income, native: goal.currency };
  }
  const expense = sumAmount(inCcy, 'expense');
  return { progress: income - expense, native: goal.currency };
}

export default function GoalCard({ goal, entries, onChanged }) {
  const { user } = useAuth();
  const { currency: displayCurrency } = useDisplayCurrency();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [countdown, setCountdown] = useState(() => computeCountdown(goal.deadline));
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(computeCountdown(goal.deadline));
    }, 1000);
    return () => clearInterval(id);
  }, [goal.deadline]);

  const thbToDisplay = useMemo(() => {
    if (displayCurrency === 'USD') return getThbToUsdRate();
    if (displayCurrency === 'JPY') return getThbToJpyRate();
    return 1;
  }, [displayCurrency]);

  const { progress, native } = useMemo(
    () => computeGoalProgress(goal, entries ?? []),
    [goal, entries],
  );

  // ALL goals render in display-currency (legacy behaviour). Currency-specific
  // goals always render in their own native currency — they ignore the
  // display-currency toggle entirely so the audit-style view stays honest.
  const isAll = goal.currency === 'ALL';
  const renderCurrency = isAll ? displayCurrency : native;
  const renderScale = isAll ? thbToDisplay : 1;
  const progressDisplay = progress * renderScale;
  const targetDisplay = goal.targetAmount * renderScale;
  const progressPct = goal.targetAmount > 0
    ? Math.max(0, Math.min(100, (progress / goal.targetAmount) * 100))
    : 0;

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete goal',
      description: (
        <>
          Delete the goal <strong>&ldquo;{goal.name}&rdquo;</strong>? This
          cannot be undone.
        </>
      ),
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;
    setDeleting(true);
    const { error } = await deleteGoal(goal.id);
    setDeleting(false);
    if (error) {
      console.warn('[ledger-web] deleteGoal failed', error.message);
      return;
    }
    if (onChanged) onChanged();
  };

  const countdownColor = countdown.overdue
    ? 'text-[var(--color-error)]'
    : 'text-[var(--color-primary)]';

  const showSignedIn = Boolean(user);

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          Goal
        </span>
        <h3 className="font-display text-[22px] uppercase text-[var(--rb-ink)] mt-1 flex items-baseline gap-2 flex-wrap">
          {!isAll && (
            <span className="font-mono text-[12px] text-[var(--color-text-muted)] tracking-wide">
              {goal.currency} /
            </span>
          )}
          <span>{goal.name}</span>
        </h3>
        <p className="text-[14px] text-[var(--color-text-muted)] mt-1">
          Target: {formatAmount(targetDisplay)} {renderCurrency}
          {' · '}
          <span className="text-[var(--color-text-subtle)]">
            {goal.mode === 'income' && !isAll ? 'income only' : 'net'}
          </span>
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[26px] text-[var(--color-text)]">
          {formatAmount(progressDisplay)}
        </span>
        <span className="font-mono text-[12px] text-[var(--color-text-subtle)]">
          {renderCurrency} saved
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 border-2 border-[var(--rb-ink)] bg-[var(--rb-paper)] overflow-hidden">
          <div
            className="h-full bg-[var(--rb-ink)] transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="font-mono text-[12px] text-[var(--color-text-muted)] w-10 text-right">
          {progressPct.toFixed(0)}%
        </span>
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        {countdown.overdue ? (
          <>
            <span className={`text-[14px] font-sans ${countdownColor}`}>
              Overdue by
            </span>
            <span className={`font-display text-[28px] leading-none ${countdownColor}`}>
              {countdown.days}
            </span>
            <span className={`text-[14px] font-sans ${countdownColor}`}>
              days
            </span>
            <span className={`font-mono text-[14px] ${countdownColor}`}>
              {pad2(countdown.hours)}:{pad2(countdown.minutes)}:{pad2(countdown.seconds)}
            </span>
          </>
        ) : (
          <>
            <span className={`font-display text-[28px] leading-none ${countdownColor}`}>
              {countdown.days}
            </span>
            <span className="text-[14px] font-sans text-[var(--color-text-muted)]">
              days
            </span>
            <span className="font-mono text-[14px] text-[var(--color-text-muted)]">
              {pad2(countdown.hours)}:{pad2(countdown.minutes)}:{pad2(countdown.seconds)}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--color-divider)]">
        <span className="text-[12px] text-[var(--color-text-subtle)]">
          Deadline {goal.deadline}
        </span>
        {showSignedIn && (
          <div className="flex items-center gap-1">
            <Link href={`/goals/${goal.id}/edit`}>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {confirmDialog}
    </Card>
  );
}
