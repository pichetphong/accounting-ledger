'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DatePicker from '@/components/ui/DatePicker';
import Pill from '@/components/ui/Pill';
import CategoryPicker from '@/components/entries/CategoryPicker';
import useConfirm from '@/lib/useConfirm';
import {
  SUPPORTED_CURRENCIES,
  getRate,
  getThbToUsdRate,
  fetchFxRates,
} from '@/lib/fx';
import useCategories from '@/lib/useCategories';
import { createEntry, updateEntry, deleteEntry } from '@/lib/queries/entries';

const TODAY = new Date().toISOString().slice(0, 10);

function readInitial(initialValues, key, fallback) {
  if (!initialValues) return fallback;
  const v = initialValues[key];
  if (v === undefined || v === null) return fallback;
  return v;
}

export default function EntryForm({ initialValues = null, mode = 'create' }) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [date, setDate] = useState(() => {
    const d = readInitial(initialValues, 'date', TODAY);
    return String(d).slice(0, 10);
  });
  const [type, setType] = useState(() => readInitial(initialValues, 'type', 'expense'));
  const [amount, setAmount] = useState(() => {
    const v = readInitial(initialValues, 'amount', '');
    return v === '' ? '' : String(v);
  });
  const [currency, setCurrency] = useState(() => readInitial(initialValues, 'currency', 'THB'));
  const [category, setCategory] = useState(() => readInitial(initialValues, 'category', ''));
  const [note, setNote] = useState(() => readInitial(initialValues, 'note', '') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [fxTick, setFxTick] = useState(0);
  const [fxRefreshing, setFxRefreshing] = useState(false);

  const { categories, addCategory } = useCategories();

  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  useEffect(() => {
    fetchFxRates().then(() => setFxTick((n) => n + 1));
  }, []);

  // fxRate is the entry-currency -> THB rate. This is the value persisted
  // to the DB and used to compute amount_thb, regardless of how the
  // locked-rate caption is displayed below.
  // fxTick is in the deps so the cached rates picked up by getRate() are
  // re-read after a refresh.
  const fxRate = useMemo(() => getRate(currency, 'THB'), [currency, fxTick]);

  const rateDisplay = useMemo(() => {
    if (currency === 'THB') {
      return { text: `1 THB = ${getThbToUsdRate().toFixed(4)} USD` };
    }
    return { text: `1 ${currency} = ${fxRate.toFixed(2)} THB` };
  }, [currency, fxRate]);

  const handleRefreshRates = async () => {
    setFxRefreshing(true);
    try {
      await fetchFxRates({ force: true });
      setFxTick((n) => n + 1);
    } finally {
      setFxRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    if (!category) {
      setError('Pick a category first.');
      return;
    }

    setSubmitting(true);
    const payload = {
      date,
      type,
      amount: amt,
      currency,
      fx_rate: currency === 'THB' ? 1 : fxRate,
      amount_thb: currency === 'THB' ? amt : amt * fxRate,
      category,
      note: note.trim() || null,
    };

    if (isEdit && initialValues?.id) {
      const { error: err } = await updateEntry(initialValues.id, payload);
      setSubmitting(false);
      if (err) {
        setError(err.message ?? 'Could not save entry.');
        return;
      }
    } else {
      const { error: err } = await createEntry(payload);
      setSubmitting(false);
      if (err) {
        setError(err.message ?? 'Could not save entry.');
        return;
      }
    }
    router.push('/entries');
  };

  const handleDelete = async () => {
    if (!initialValues?.id) return;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
    const confirmed = await confirm({
      title: 'Delete this entry?',
      description: (
        <>
          <div>{String(date).slice(0, 10)} · {category || 'no category'}</div>
          <div className="mt-1 font-mono text-[13px] text-[var(--color-text)]">
            {formatted} {currency}
          </div>
          <div className="mt-2">This cannot be undone.</div>
        </>
      ),
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;
    setDeleting(true);
    const { error: err } = await deleteEntry(initialValues.id);
    setDeleting(false);
    if (err) {
      setError(err.message ?? 'Could not delete entry.');
      return;
    }
    router.push('/entries');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <DatePicker
          label="Date"
          name="date"
          value={date}
          onChange={setDate}
          required
        />

        <div className="flex flex-col">
          <span className="font-display text-[14px] uppercase tracking-[0.04em] text-black mb-1">
            Type
          </span>
          <div className="flex gap-2">
            <Pill active={type === 'expense'} onClick={() => setType('expense')}>
              Expense
            </Pill>
            <Pill active={type === 'income'} onClick={() => setType('income')}>
              Income
            </Pill>
          </div>
        </div>

        <Input
          label="Amount"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <div className="flex flex-col">
          <span className="font-display text-[14px] uppercase tracking-[0.04em] text-black mb-1">
            Currency
          </span>
          <div className="flex gap-2">
            {SUPPORTED_CURRENCIES.map((c) => (
              <Pill key={c} active={currency === c} onClick={() => setCurrency(c)}>
                {c}
              </Pill>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="font-display text-[14px] uppercase tracking-[0.04em] text-black mb-1">
            Category
          </span>
          <CategoryPicker
            value={category}
            categories={categories}
            onSelect={setCategory}
            onCreate={addCategory}
          />
        </div>

        <Input
          label="Note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="optional"
        />

        <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[var(--color-bg)] border-[3px] border-black px-4 py-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--color-text-subtle)] uppercase tracking-wide">
              Locked rate
            </span>
            <span className="font-mono text-[13px] text-[var(--color-text)]">
              {rateDisplay.text}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRefreshRates}
            disabled={fxRefreshing}
            className="text-[12px] text-[var(--color-primary)] underline cursor-pointer disabled:opacity-50"
          >
            {fxRefreshing ? 'refreshing...' : 'refresh'}
          </button>
        </div>

        {error && (
          <div className="text-[12px] text-[var(--color-error)]">{error}</div>
        )}

        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Save entry'}
        </Button>

        {isEdit && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleDelete}
            disabled={deleting}
            className="text-[var(--color-error)] hover:bg-[var(--color-error-bg)]"
          >
            {deleting ? 'Deleting...' : 'Delete entry'}
          </Button>
        )}
      </form>
      {confirmDialog}
    </>
  );
}
