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
          className="text-[14px] font-medium text-[var(--color-primary)] mb-[6px]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`h-[42px] px-[14px] rounded-[12px] bg-[var(--color-surface-inset)] text-[14px] text-[var(--color-text)] placeholder-[var(--color-text-subtle)] shadow-inset outline-none focus:ring-[3px] focus:ring-[rgba(139,94,60,0.25)] ${error ? 'border border-[var(--color-error)] bg-[#fef2f2] shadow-none' : ''} ${className}`}
        {...props}
      />
      {(helperText || error) && (
        <span
          className={`text-[12px] mt-1 ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-subtle)]'}`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
}
