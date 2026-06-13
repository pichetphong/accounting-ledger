// RawBlock card: white fill, thick black border, square, no shadow. Pass
// `elevated` for a heavier 5px border (more border weight = more importance).
export default function Card({ className = '', elevated = false, children, ...props }) {
  const border = elevated ? 'border-[5px]' : 'border-[3px]';
  return (
    <div
      className={`bg-[var(--color-surface)] ${border} border-[var(--rb-ink)] p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
