'use client';

import { useMemo } from 'react';
import AirDatepicker from '@/components/ui/AirDatepicker';

const RANGE_OPTIONS = { position: 'bottom right', buttons: ['clear'] };

export default function DateRangePicker({ from, to, onChange, className = '' }) {
  const selected = useMemo(() => (from && to ? [from, to] : []), [from, to]);
  const hasRange = Boolean(from && to);

  const handle = (isos) => {
    if (isos.length >= 2) {
      const sorted = [...isos].sort();
      onChange?.({ from: sorted[0], to: sorted[sorted.length - 1] });
    } else if (isos.length === 0) {
      onChange?.({ from: null, to: null });
    }
    // A single date means the range is still mid-selection; wait for the second.
  };

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-current opacity-80">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </span>
      <AirDatepicker
        range
        selected={selected}
        onChange={handle}
        options={RANGE_OPTIONS}
        inputProps={{
          placeholder: 'Pick dates',
          className: `h-8 w-[210px] max-w-full pl-9 pr-3 rounded-full text-[12px] font-medium cursor-pointer outline-none transition-colors placeholder:font-medium ${
            hasRange
              ? 'bg-[var(--color-primary)] text-white placeholder:text-white/70 shadow-raised-sm'
              : 'bg-[var(--color-surface-hover)] text-[var(--color-primary)] placeholder:text-[var(--color-primary)] hover:bg-[#f5e6cf]'
          }`,
        }}
      />
    </div>
  );
}
