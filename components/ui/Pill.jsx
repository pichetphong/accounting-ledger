const SIZE_CLASSES = {
  md: 'px-3 h-8 text-[12px]',
  sm: 'px-2 h-[26px] text-[11px]',
};

export default function Pill({
  active = false,
  onClick,
  children,
  size = 'md',
  className = '',
}) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const base = `inline-flex items-center justify-center rounded-full font-medium transition-colors cursor-pointer select-none ${sizeClass}`;
  const state = active
    ? 'bg-[var(--color-primary)] text-white shadow-raised-sm'
    : 'bg-[var(--color-surface-hover)] text-[var(--color-primary)] hover:bg-[#f5e6cf]';

  return (
    <button type="button" onClick={onClick} className={`${base} ${state} ${className}`}>
      {children}
    </button>
  );
}
