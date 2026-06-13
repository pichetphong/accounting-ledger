'use client';

import { useMemo } from 'react';
import AirDatepicker from '@/components/ui/AirDatepicker';
import { fromIso } from '@/lib/dateRange';

// Single-date field styled to match the app's Input. `value`/`onChange` are
// ISO date strings (YYYY-MM-DD), so it drops into existing form state. `min`
// (ISO) disables earlier dates in the calendar.
export default function DatePicker({ label, name, value, onChange, min, required = false }) {
  const selected = useMemo(() => (value ? [value] : []), [value]);
  const options = useMemo(() => (min ? { minDate: fromIso(min) } : {}), [min]);

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={name} className="font-display text-[14px] uppercase tracking-[0.04em] text-black mb-1">
          {label}
        </label>
      )}
      <AirDatepicker
        selected={selected}
        options={options}
        onChange={(isos) => onChange?.(isos[0] ?? '')}
        inputProps={{
          id: name,
          name,
          required,
          placeholder: 'Select date',
          className:
            'h-[44px] px-3 bg-[var(--color-surface-inset)] font-mono text-[15px] text-black placeholder-[var(--color-text-subtle)] border-[3px] border-black outline-none cursor-pointer focus:border-[5px] hover:bg-[#e8e8e8]',
        }}
      />
    </div>
  );
}
