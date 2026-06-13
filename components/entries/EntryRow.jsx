import Link from 'next/link';
import CurrencyChip from '@/components/ui/CurrencyChip';

// RawBlock row: bordered block, sign-only polarity (+/-) in black, no colour.
// Hover inverts the whole row. Used as the mobile/list view of entries.
export default function EntryRow({ entry }) {
  const sign = entry.type === 'income' ? '+' : '-';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(entry.amount);

  return (
    <Link
      href={`/entries/${entry.id}/edit`}
      className="group bg-white border-[3px] border-black p-4 flex items-center justify-between gap-3 transition-colors hover:bg-black hover:text-white"
    >
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.04em]">
          <span>{entry.date}</span>
          <CurrencyChip currency={entry.currency} className="group-hover:invert" />
        </div>
        <span className="text-[15px] font-semibold mt-1 truncate uppercase tracking-[0.02em]">
          {entry.category}
        </span>
        {entry.note && (
          <span className="text-[12px] truncate">{entry.note}</span>
        )}
      </div>
      <div className="font-mono text-[16px] font-bold whitespace-nowrap tabular-nums">
        {sign}
        {formatted}
      </div>
    </Link>
  );
}
