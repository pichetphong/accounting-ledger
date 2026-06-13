// RawBlock filter chip: square, black border, uppercase + tracking. Active
// inverts to a solid black block. Used for currency / type / range toggles.
const SIZE_CLASSES = {
  md: 'px-3 h-8 text-[12px] border-[3px]',
  sm: 'px-2.5 h-[26px] text-[11px] border-2',
};

export default function Pill({
  active = false,
  onClick,
  children,
  size = 'md',
  className = '',
}) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const base = `inline-flex items-center justify-center font-semibold uppercase tracking-[0.06em] border-[var(--rb-ink)] transition-colors cursor-pointer select-none ${sizeClass}`;
  const state = active
    ? 'bg-[var(--rb-ink)] text-[var(--rb-paper)]'
    : 'bg-[var(--rb-paper)] text-[var(--rb-ink)] hover:bg-[var(--rb-ink)] hover:text-[var(--rb-paper)]';

  return (
    <button type="button" onClick={onClick} className={`${base} ${state} ${className}`}>
      {children}
    </button>
  );
}
