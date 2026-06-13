import Card from '@/components/ui/Card';

const TONE = {
  net: 'text-[var(--color-primary)]',
  income: 'text-[var(--color-success)]',
  expense: 'text-[var(--color-error)]',
};

// Switch to compact notation (e.g. 33.05M) at or above 1,000,000 so big
// totals like 33M THB stay inside the card width on the 3-column grid.
const COMPACT_THRESHOLD = 1_000_000;

const SIZE_STYLES = {
  md: {
    card: 'p-6',
    label: 'text-[14px]',
    amount: 'text-[26px]',
    currency: 'text-[12px]',
  },
  sm: {
    card: 'p-4',
    label: 'text-[14px]',
    amount: 'text-[18px]',
    currency: 'text-[10px]',
  },
};

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

// Percent change vs a prior period. `positiveIsGood` flips the colour so a
// rising expense reads red while rising income reads green.
function DeltaBadge({ delta, positiveIsGood, label }) {
  if (delta == null || !Number.isFinite(delta)) return null;
  const up = delta >= 0;
  const good = up === positiveIsGood;
  const color = good ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]';
  const magnitude = Math.abs(delta);
  const shown = magnitude >= 1000 ? '999+' : magnitude.toFixed(0);
  return (
    <span className={`text-[11px] font-sans font-medium ${color}`}>
      {up ? '▲' : '▼'} {shown}% {label}
    </span>
  );
}

export default function SummaryCard({
  label,
  amount,
  currency = 'THB',
  tone = 'net',
  size = 'md',
  delta = null,
  deltaPositiveIsGood = true,
  deltaLabel = 'vs last month',
}) {
  const formatted = formatAmount(amount);
  const sz = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  return (
    <Card className={`flex flex-col gap-2 overflow-hidden min-w-0 ${sz.card}`}>
      <span
        className={`font-display ${sz.label} text-[var(--color-text-muted)] leading-none`}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-2 min-w-0">
        <span
          className={`font-mono ${sz.amount} font-medium tabular-nums truncate ${TONE[tone] ?? TONE.net}`}
        >
          {formatted}
        </span>
        <span
          className={`font-mono ${sz.currency} text-[var(--color-text-subtle)] whitespace-nowrap shrink-0`}
        >
          {currency}
        </span>
      </div>
      <DeltaBadge delta={delta} positiveIsGood={deltaPositiveIsGood} label={deltaLabel} />
    </Card>
  );
}
