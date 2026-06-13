'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import useAuth from '@/lib/useAuth';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/entries', label: 'Entries' },
  { href: '/goals', label: 'Goals' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <header className="w-full border-b-[5px] border-black bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 px-4 h-16">
        <Link
          href="/"
          className="font-display text-[18px] md:text-[24px] uppercase tracking-[0.02em] text-black leading-none shrink-0"
        >
          Ledger
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.06em]">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 h-9 inline-flex items-center border-[3px] transition-colors ${
                  active ? 'bg-black text-white border-black' : 'bg-white text-black border-transparent hover:border-black'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {!user && (
            <Link href="/login" className="px-3 h-9 inline-flex items-center text-[var(--color-info)] underline">
              Sign in
            </Link>
          )}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/settings/categories"
            className="text-[13px] font-semibold uppercase tracking-[0.06em] text-black underline underline-offset-2 hover:text-[var(--color-info)]"
          >
            Settings
          </Link>
          {user && (
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
