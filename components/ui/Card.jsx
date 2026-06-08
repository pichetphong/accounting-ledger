export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-[var(--color-surface)] rounded-[12px] p-6 shadow-raised ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
