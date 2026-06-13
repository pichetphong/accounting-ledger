import Card from '@/components/ui/Card';

const COMPACT_THRESHOLD = 1_000_000;

const SIZE_STYLES = {
  md: { card: 'p-5', label: 'text-[13px]', amount: 'text-[28px]', currency: 'text-[12px]' },
  sm: { card: 'p-4', label: 'text-[12px]', amount: 'text-[20px]', currency: 'text-[10px]' },
};

function formatAmount(amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  if (Math.abs(value) >= COMPACT_THRESHOLD) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
  }
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

// RawBlock keeps polarity monochrome: percent change shows as a black arrow,
// no green/red (see ADR 0001). `tone`/`deltaPositiveIsGood` are accepted for
// call-site compatibility but no longer drive colour.
function DeltaBadge({ delta, label }) {
  if (delta == null || !Number.isFinite(delta)) return null;
  const up = delta >= 0;
  const magnitude = Math.abs(delta);
  const shown = magnitude >= 1000 ? '999+' : magnitude.toFixed(0);
  return (
    <span className="text-[11px] font-mono font-bold uppercase tracking-[0.04em] text-[var(--rb-ink)]">
      {up ? '▲' : '▼'} {shown}% {label}
    </span>
  );
}

export default function SummaryCard({
  label,
  amount,
  currency = 'THB',
  size = 'md',
  delta = null,
  deltaLabel = 'vs last month',
  // eslint-disable-next-line no-unused-vars
  tone = 'net',
  // eslint-disable-next-line no-unused-vars
  deltaPositiveIsGood = true,
}) {
  const formatted = formatAmount(amount);
  const sz = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  return (
    <Card className={`flex flex-col gap-2 overflow-hidden min-w-0 ${sz.card}`}>
      <span className={`font-display ${sz.label} uppercase tracking-[0.04em] text-[var(--rb-ink)] leading-none`}>
        {label}
      </span>
      <div className="flex items-baseline gap-2 min-w-0">
        <span className={`font-mono ${sz.amount} font-bold tabular-nums truncate text-[var(--rb-ink)]`}>
          {formatted}
        </span>
        <span className={`font-mono ${sz.currency} text-[var(--color-text-muted)] whitespace-nowrap shrink-0 uppercase`}>
          {currency}
        </span>
      </div>
      <DeltaBadge delta={delta} label={deltaLabel} />
    </Card>
  );
}
