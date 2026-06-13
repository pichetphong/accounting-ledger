'use client';

import { useEffect, useRef } from 'react';
import AirDatepickerLib from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';
import localeEn from 'air-datepicker/locale/en';
import { toIso, fromIso } from '@/lib/dateRange';

// Thin React wrapper around the vanilla air-datepicker. The library owns the
// input's text; selection is synced in via `selected` (ISO date strings) and
// reported out via `onChange` (also ISO strings). A guard ref stops the
// programmatic sync from echoing back through onSelect into an update loop.
export default function AirDatepicker({
  selected = [],
  onChange,
  range = false,
  options = {},
  inputProps = {},
}) {
  const inputRef = useRef(null);
  const dpRef = useRef(null);
  const syncingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const dp = new AirDatepickerLib(inputRef.current, {
      locale: localeEn,
      dateFormat: 'MMM d, yyyy',
      autoClose: true,
      buttons: false,
      range,
      multipleDatesSeparator: ' - ',
      ...options,
      onSelect({ date }) {
        if (syncingRef.current) return;
        const arr = Array.isArray(date) ? date : date ? [date] : [];
        onChangeRef.current?.(arr.map(toIso));
      },
    });
    dpRef.current = dp;
    return () => dp.destroy();
    // Instantiate once; options are static for our call sites.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push external selection into the picker without retriggering onSelect.
  // Keyed on the joined ISO list so a fresh array identity each render doesn't
  // cause needless re-syncs.
  const key = selected.join('|');
  useEffect(() => {
    const dp = dpRef.current;
    if (!dp) return;
    syncingRef.current = true;
    const dates = key ? key.split('|').map(fromIso).filter(Boolean) : [];
    if (dates.length) dp.selectDate(dates, { silent: true });
    else dp.clear({ silent: true });
    syncingRef.current = false;
  }, [key]);

  return <input ref={inputRef} readOnly {...inputProps} />;
}
