'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home' },
  { href: '/entries', label: 'Entries' },
  { href: '/entries/new', label: 'Add' },
  { href: '/goals', label: 'Goals' },
  { href: '/settings/categories', label: 'Set' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[var(--rb-paper)] border-t-[5px] border-[var(--rb-ink)]">
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 text-center py-3 text-[11px] font-bold uppercase tracking-[0.04em] border-l-[3px] border-[var(--rb-ink)] first:border-l-0 transition-colors ${
                active ? 'bg-[var(--rb-ink)] text-[var(--rb-paper)]' : 'bg-[var(--rb-paper)] text-[var(--rb-ink)]'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
