'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PRESETS,
  PRESET_HEADING,
  presetRange,
  startOfDay,
  toIso,
  fromIso,
  addDays,
  daySpan,
  formatRangeLabel,
} from '@/lib/dateRange';

const STORAGE_KEY = 'ledger-web:dashboard-range-v1';

function monthRange(now = new Date()) {
  const today = startOfDay(now);
  return {
    from: toIso(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toIso(today),
  };
}

// Owns the dashboard-wide date range: every section reads `from`/`to` from here.
// `mode` is 'month' (calendar month to date, the default), 'preset' (a rolling
// 1W..1Y window), or 'custom' (user-picked). Selection persists across visits.
export default function useDashboardRange() {
  const [mode, setMode] = useState('month');
  const [preset, setPreset] = useState('6M');
  const [custom, setCustom] = useState({ from: null, to: null });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (['month', 'preset', 'custom'].includes(s.mode)) setMode(s.mode);
      if (PRESETS.includes(s.preset)) setPreset(s.preset);
      if (s.custom?.from && s.custom?.to) setCustom(s.custom);
    } catch {
      // localStorage disabled or malformed; keep defaults.
    }
  }, []);

  const persist = (next) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, preset, custom, ...next }));
    } catch {
      // localStorage full or disabled; in-session state still updates.
    }
  };

  const selectMonth = () => {
    setMode('month');
    persist({ mode: 'month' });
  };

  const selectPreset = (p) => {
    setMode('preset');
    setPreset(p);
    persist({ mode: 'preset', preset: p });
  };

  const selectCustom = ({ from, to }) => {
    if (from && to) {
      setMode('custom');
      setCustom({ from, to });
      persist({ mode: 'custom', custom: { from, to } });
    } else {
      setMode('month');
      persist({ mode: 'month' });
    }
  };

  const { from, to } = useMemo(() => {
    if (mode === 'preset') return presetRange(preset);
    if (mode === 'custom' && custom.from && custom.to) return custom;
    return monthRange();
  }, [mode, preset, custom]);

  // Equal-length window immediately before [from, to], for period-over-period.
  const prev = useMemo(() => {
    const span = daySpan(from, to);
    const f = fromIso(from);
    if (!f || !span) return { from: null, to: null };
    const prevTo = addDays(f, -1);
    const prevFrom = addDays(prevTo, -(span - 1));
    return { from: toIso(prevFrom), to: toIso(prevTo) };
  }, [from, to]);

  const label = useMemo(() => {
    if (mode === 'month') return 'This month';
    if (mode === 'preset') return PRESET_HEADING[preset];
    return formatRangeLabel(from, to);
  }, [mode, preset, from, to]);

  return { mode, preset, custom, from, to, prev, label, selectMonth, selectPreset, selectCustom };
}
