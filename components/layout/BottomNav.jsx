'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Dashboard' },
  { href: '/entries', label: 'Entries' },
  { href: '/entries/new', label: 'Add' },
  { href: '/goals', label: 'Goals' },
  { href: '/settings/categories', label: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-20">
      <div className="bg-[var(--color-bg)] rounded-[16px] shadow-raised px-2 py-2 flex items-center justify-between">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 text-center py-2 rounded-[12px] text-[11px] font-medium transition-colors ${
                active
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)]'
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
