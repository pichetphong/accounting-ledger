const VARIANT_CLASSES = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-strong)]',
  secondary:
    'bg-[var(--color-surface-hover)] text-[var(--color-primary)] hover:bg-[#f5e6cf]',
  ghost:
    'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]',
  destructive: 'bg-[var(--color-error)] text-white hover:bg-[#dc2626]',
};

const SIZE_CLASSES = {
  sm: 'h-[34px] px-[14px] text-[12px]',
  md: 'h-[42px] px-[18px] text-[14px]',
  lg: 'h-[50px] px-[24px] text-[16px]',
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
  const elevation =
    variant === 'ghost' || disabled
      ? ''
      : 'shadow-raised-sm shadow-raised-press';
  const disabledClass = disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[12px] font-medium transition-colors ${variantClass} ${sizeClass} ${elevation} ${disabledClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
