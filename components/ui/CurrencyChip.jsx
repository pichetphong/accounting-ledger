const CURRENCY_STYLE = {
  THB: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  USD: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  JPY: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
};

export default function CurrencyChip({ currency, className = '' }) {
  const style = CURRENCY_STYLE[currency] ?? 'bg-[var(--color-surface-inset)] text-[var(--color-text-muted)]';
  return (
    <span
      className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-mono font-medium ${style} ${className}`}
    >
      {currency}
    </span>
  );
}
