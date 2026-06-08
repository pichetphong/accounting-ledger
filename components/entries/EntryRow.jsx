import Link from 'next/link';
import CurrencyChip from '@/components/ui/CurrencyChip';

export default function EntryRow({ entry }) {
  const isIncome = entry.type === 'income';
  const sign = isIncome ? '+' : '-';
  const tone = isIncome ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(entry.amount);

  return (
    <Link
      href={`/entries/${entry.id}/edit`}
      className="bg-[var(--color-surface)] rounded-[12px] p-4 shadow-raised-sm flex items-center justify-between gap-3 transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[rgba(139,94,60,0.25)]"
    >
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-subtle)] font-mono">
          <span>{entry.date}</span>
          <CurrencyChip currency={entry.currency} />
        </div>
        <span className="text-[14px] font-medium text-[var(--color-text)] mt-1 truncate">
          {entry.category}
        </span>
        {entry.note && (
          <span className="text-[12px] text-[var(--color-text-muted)] truncate">
            {entry.note}
          </span>
        )}
      </div>
      <div className={`font-mono text-[16px] font-medium ${tone} whitespace-nowrap`}>
        {sign}
        {formatted}
      </div>
    </Link>
  );
}
