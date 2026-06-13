// Shared date-range helpers. App state carries ranges as inclusive ISO date
// strings (YYYY-MM-DD) in local time; the date picker wants Date objects, so
// conversion happens at that boundary only.

export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Parse an ISO date (or the date part of a timestamp) to a local-midnight Date.
export function fromIso(s) {
  if (!s) return null;
  const d = new Date(`${String(s).slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function addDays(d, n) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

// Inclusive day count between two ISO dates, e.g. same day -> 1.
export function daySpan(fromStr, toStr) {
  const a = fromIso(fromStr);
  const b = fromIso(toStr);
  if (!a || !b) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

export const PRESETS = ['1W', '1M', '3M', '6M', '1Y'];

export const PRESET_HEADING = {
  '1W': 'Last 1 week',
  '1M': 'Last 1 month',
  '3M': 'Last 3 months',
  '6M': 'Last 6 months',
  '1Y': 'Last 1 year',
};

// Resolve a preset to a concrete {from, to} ISO range ending today.
export function presetRange(preset, now = new Date()) {
  const today = startOfDay(now);
  const to = toIso(today);
  switch (preset) {
    case '1W':
      return { from: toIso(addDays(today, -6)), to };
    case '1M':
      return { from: toIso(addDays(today, -29)), to };
    case '3M':
      return { from: toIso(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())), to };
    case '6M':
      return { from: toIso(new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())), to };
    case '1Y':
      return { from: toIso(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())), to };
    default:
      return { from: toIso(new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())), to };
  }
}

const SHORT_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const SHORT_DATE_YEAR = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function formatRangeLabel(fromStr, toStr) {
  const a = fromIso(fromStr);
  const b = fromIso(toStr);
  if (!a && !b) return 'Pick dates';
  if (a && !b) return SHORT_DATE_YEAR.format(a);
  const sameYear = a.getFullYear() === b.getFullYear();
  const left = sameYear ? SHORT_DATE.format(a) : SHORT_DATE_YEAR.format(a);
  return `${left} - ${SHORT_DATE_YEAR.format(b)}`;
}
