'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DatePicker from '@/components/ui/DatePicker';
import Pill from '@/components/ui/Pill';
import useAuth from '@/lib/useAuth';
import { createGoal, updateGoal } from '@/lib/queries/goals';

const GOAL_CURRENCIES = ['THB', 'USD', 'JPY', 'ALL'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function CurrencySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-[42px] px-[14px] rounded-[12px] bg-[var(--color-surface-inset)] text-[14px] text-left border-[3px] border-black outline-none focus:border-[5px] flex items-center justify-between"
      >
        <span className="text-[var(--color-text)]">{value}</span>
        <span className="text-[var(--color-text-muted)] text-[12px] ml-2">
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 bg-[var(--color-surface)] rounded-[12px] border-[3px] border-black p-2 flex flex-col gap-[2px]">
          {GOAL_CURRENCIES.map((c) => {
            const active = c === value;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-[8px] text-[13px] transition-colors ${
                  active
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GoalForm({ initialValues = null, mode = 'create' }) {
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = mode === 'edit';

  const [name, setName] = useState(() => initialValues?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(() => {
    const v = initialValues?.targetAmount;
    return v === undefined || v === null ? '' : String(v);
  });
  const [deadline, setDeadline] = useState(() => {
    const d = initialValues?.deadline;
    return d ? String(d).slice(0, 10) : '';
  });
  const [goalCurrency, setGoalCurrency] = useState(() => initialValues?.currency ?? 'ALL');
  const [goalMode, setGoalMode] = useState(() => initialValues?.mode ?? 'net');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isAll = goalCurrency === 'ALL';
  const effectiveMode = isAll ? 'net' : goalMode;
  const targetLabel = isAll ? 'Target (THB)' : `Target (${goalCurrency})`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Goal name is required.');
      return;
    }
    const amt = Number(targetAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Target amount must be a positive number.');
      return;
    }
    if (!deadline) {
      setError('Pick a deadline date.');
      return;
    }
    if (!isEdit && deadline <= todayISO()) {
      setError('Deadline must be in the future.');
      return;
    }
    if (!user) {
      setError('Not signed in.');
      return;
    }

    setSubmitting(true);
    if (isEdit && initialValues?.id) {
      const { error: err } = await updateGoal(initialValues.id, {
        name: trimmedName,
        target_amount: amt,
        deadline,
        currency: goalCurrency,
        mode: effectiveMode,
      });
      setSubmitting(false);
      if (err) {
        setError(err.message ?? 'Could not save goal.');
        return;
      }
    } else {
      const { error: err } = await createGoal({
        user_id: user.id,
        name: trimmedName,
        target_amount: amt,
        deadline,
        currency: goalCurrency,
        mode: effectiveMode,
      });
      setSubmitting(false);
      if (err) {
        setError(err.message ?? 'Could not save goal.');
        return;
      }
    }
    router.push('/goals');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. emergency fund"
        required
      />

      <div className="flex flex-col">
        <span className="font-display text-[14px] uppercase tracking-[0.04em] text-black mb-1">
          Currency
        </span>
        <CurrencySelect value={goalCurrency} onChange={setGoalCurrency} />
        <span className="text-[12px] text-[var(--color-text-subtle)] mt-1">
          ALL tracks every currency together (converted to THB). Pick a single
          currency to track only entries in that currency.
        </span>
      </div>

      <div className="flex flex-col">
        <span className="font-display text-[14px] uppercase tracking-[0.04em] text-black mb-1">
          Mode
        </span>
        <div className="flex gap-2 flex-wrap">
          <Pill
            size="sm"
            active={effectiveMode === 'income'}
            onClick={() => {
              if (!isAll) setGoalMode('income');
            }}
            className={isAll ? 'opacity-40 cursor-not-allowed' : ''}
          >
            Income only
          </Pill>
          <Pill
            size="sm"
            active={effectiveMode === 'net'}
            onClick={() => {
              if (!isAll) setGoalMode('net');
            }}
            className={isAll ? 'opacity-40 cursor-not-allowed' : ''}
          >
            Net (income minus expense)
          </Pill>
        </div>
        <span className="text-[12px] text-[var(--color-text-subtle)] mt-1">
          {isAll
            ? 'ALL goals always use net across currencies.'
            : 'Income-only counts only income. Net subtracts expenses too.'}
        </span>
      </div>

      <Input
        label={targetLabel}
        name="targetAmount"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
        placeholder="0.00"
        helperText={
          isAll
            ? 'ALL goals are stored in THB and shown in your display currency.'
            : `Progress is tracked in ${goalCurrency} — no conversion applied.`
        }
        required
      />

      <DatePicker
        label="Deadline"
        name="deadline"
        value={deadline}
        onChange={setDeadline}
        min={isEdit ? undefined : todayISO()}
        required
      />

      {error && (
        <div className="text-[12px] text-[var(--color-error)]">{error}</div>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Save goal'}
        </Button>
        <Link
          href="/goals"
          className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] px-3"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
