'use client';

import { useRouter } from 'next/navigation';

// Desktop-only spreadsheet view (the mobile path uses EntryRow cards). RawBlock:
// black gridlines, inverted header, mono numerals, sign-only polarity. Rows are
// click-to-edit; inline editing is a deliberate later phase.
//
// - `title`     renders an inverted caption bar above the table (Income/Expense).
// - `compact`   drops the original-currency Amount column so two tables fit side
//               by side; the THB column carries the value.
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(
    Number.isFinite(n) ? n : 0,
  );

export default function EntryTable({ entries, title = null, compact = false }) {
  const router = useRouter();
  const netThb = entries.reduce(
    (s, e) => s + (e.type === 'income' ? e.amountThb : -e.amountThb),
    0,
  );
  const cols = compact ? 3 : 4; // colSpan for the footer label

  return (
    <div>
      {title && (
        <div className="bg-[var(--rb-ink)] text-[var(--rb-paper)] font-display text-[16px] uppercase tracking-[0.06em] px-3 py-2 border-[3px] border-b-0 border-[var(--rb-ink)]">
          {title}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="border-[3px] border-[var(--rb-ink)] px-3 py-6 text-center font-mono text-[12px] uppercase tracking-[0.04em] text-[var(--rb-ink)]">
          No entries
        </div>
      ) : (
        <div className="border-[3px] border-[var(--rb-ink)] overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[var(--rb-ink)] text-[var(--rb-paper)] font-mono text-[11px] uppercase tracking-[0.06em]">
                <th className="px-3 py-2 font-bold whitespace-nowrap">Date</th>
                <th className="px-3 py-2 font-bold">Name</th>
                <th className="px-3 py-2 font-bold whitespace-nowrap">Category</th>
                {!compact && <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Amount</th>}
                <th className="px-3 py-2 font-bold text-right whitespace-nowrap">THB</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const sign = e.type === 'income' ? '+' : '-';
                return (
                  <tr
                    key={e.id}
                    onClick={() => router.push(`/entries/${e.id}/edit`)}
                    className="border-t-[3px] border-[var(--rb-ink)] bg-[var(--rb-paper)] cursor-pointer transition-colors hover:bg-[var(--rb-ink)] hover:text-[var(--rb-paper)]"
                  >
                    <td className="px-3 py-2 font-mono text-[13px] whitespace-nowrap align-top">{e.date}</td>
                    <td className="px-3 py-2 text-[13px] align-top max-w-[220px] truncate">
                      {e.note || e.category || '—'}
                    </td>
                    <td className="px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.02em] whitespace-nowrap align-top">
                      {e.category || '—'}
                    </td>
                    {!compact && (
                      <td className="px-3 py-2 font-mono text-[13px] text-right whitespace-nowrap align-top tabular-nums">
                        {sign}{fmt(e.amount)} <span className="text-[10px]">{e.currency}</span>
                      </td>
                    )}
                    <td className="px-3 py-2 font-mono text-[13px] font-bold text-right whitespace-nowrap align-top tabular-nums">
                      {sign}{fmt(e.amountThb)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-[3px] border-[var(--rb-ink)] bg-[var(--color-surface-inset)] font-mono text-[12px] font-bold uppercase tracking-[0.04em]">
                <td className="px-3 py-2 whitespace-nowrap" colSpan={cols}>
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'} / total
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                  {netThb < 0 ? '-' : '+'}{fmt(Math.abs(netThb))} THB
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
