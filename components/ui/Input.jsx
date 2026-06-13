// RawBlock input: grey sunken fill, 3px black border, Space Mono, square.
// Focus thickens the border to 5px (no glow). Label is uppercase Archivo Black.
export default function Input({
  label,
  helperText,
  error,
  id,
  className = '',
  type = 'text',
  ...props
}) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={inputId}
          className="font-display text-[14px] uppercase tracking-[0.04em] text-[var(--rb-ink)] mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`h-[44px] px-3 bg-[var(--color-surface-inset)] font-mono text-[15px] text-[var(--rb-ink)] placeholder-[var(--color-text-subtle)] border-[3px] outline-none focus:border-[5px] hover:bg-[var(--color-surface-hover)] ${
          error ? 'border-[var(--color-error)]' : 'border-[var(--rb-ink)]'
        } ${className}`}
        {...props}
      />
      {(helperText || error) && (
        <span
          className={`text-[12px] mt-1 ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'}`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
}
