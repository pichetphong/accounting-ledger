'use client';

import { useTheme } from '@/lib/theme';

// RawBlock toggle: text only (no icons), labelled with the mode it switches to.
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="h-9 px-3 border-[3px] border-[var(--rb-ink)] bg-[var(--rb-paper)] text-[var(--rb-ink)] text-[12px] font-semibold uppercase tracking-[0.06em] hover:bg-[var(--rb-ink)] hover:text-[var(--rb-paper)] transition-colors cursor-pointer"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
