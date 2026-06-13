// RawBlock buttons: square, 3px black border, uppercase + tracking. Hover is a
// full colour inversion; active thickens the border to 5px. No shadows.
const VARIANT_CLASSES = {
  primary:
    'bg-[var(--rb-ink)] text-[var(--rb-paper)] border-[3px] border-[var(--rb-ink)] hover:bg-[var(--rb-paper)] hover:text-[var(--rb-ink)] active:border-[5px]',
  secondary:
    'bg-[var(--rb-paper)] text-[var(--rb-ink)] border-[3px] border-[var(--rb-ink)] hover:bg-[var(--rb-ink)] hover:text-[var(--rb-paper)] active:border-[5px]',
  ghost:
    'bg-transparent text-[var(--rb-ink)] border-0 underline underline-offset-2 hover:text-[var(--color-info)]',
  destructive:
    'bg-[var(--color-error)] text-[var(--rb-paper)] border-[3px] border-[var(--rb-ink)] hover:bg-[var(--rb-ink)] hover:text-[var(--color-error)] active:border-[5px]',
};

const SIZE_CLASSES = {
  sm: 'h-[32px] px-4 text-[12px]',
  md: 'h-[44px] px-6 text-[14px]',
  lg: 'h-[56px] px-10 text-[18px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  children,
  ...props
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const disabledClass = disabled
    ? 'bg-[var(--color-surface-inset)] text-[var(--color-text-subtle)] border-[3px] border-[#cccccc] cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.08em] transition-colors ${
        disabled ? disabledClass : `${variantClass} ${disabledClass}`
      } ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
