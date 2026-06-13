// RawBlock currency tag: square, white fill, 2px black border, mono.
export default function CurrencyChip({ currency, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-[1px] border-2 border-[var(--rb-ink)] bg-[var(--rb-paper)] text-[var(--rb-ink)] text-[10px] font-mono font-bold uppercase tracking-[0.06em] ${className}`}
    >
      {currency}
    </span>
  );
}
