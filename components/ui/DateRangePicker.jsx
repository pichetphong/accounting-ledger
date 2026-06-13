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
      <AirDatepicker
        range
        selected={selected}
        onChange={handle}
        options={RANGE_OPTIONS}
        inputProps={{
          placeholder: 'Pick dates',
          className: `h-8 w-[200px] max-w-full px-3 border-[3px] border-[var(--rb-ink)] text-[12px] font-mono uppercase tracking-[0.04em] cursor-pointer outline-none transition-colors ${
            hasRange
              ? 'bg-[var(--rb-ink)] text-[var(--rb-paper)] placeholder:text-[var(--rb-paper)]'
              : 'bg-[var(--rb-paper)] text-[var(--rb-ink)] placeholder:text-[var(--rb-ink)] hover:bg-[var(--rb-ink)] hover:text-[var(--rb-paper)] hover:placeholder:text-[var(--rb-paper)]'
          }`,
        }}
      />
    </div>
  );
}
