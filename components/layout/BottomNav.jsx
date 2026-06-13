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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t-[5px] border-black">
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 text-center py-3 text-[11px] font-bold uppercase tracking-[0.04em] border-l-[3px] border-black first:border-l-0 transition-colors ${
                active ? 'bg-black text-white' : 'bg-white text-black'
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
