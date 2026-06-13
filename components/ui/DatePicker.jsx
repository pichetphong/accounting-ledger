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
        <label htmlFor={name} className="text-[14px] font-medium text-[var(--color-primary)] mb-[6px]">
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
            'h-[42px] px-[14px] rounded-[12px] bg-[var(--color-surface-inset)] text-[14px] text-[var(--color-text)] placeholder-[var(--color-text-subtle)] shadow-inset outline-none cursor-pointer focus:ring-[3px] focus:ring-[rgba(139,94,60,0.25)]',
        }}
      />
    </div>
  );
}
