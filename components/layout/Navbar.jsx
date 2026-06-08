'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Pill from '@/components/ui/Pill';
import Button from '@/components/ui/Button';
import { SUPPORTED_CURRENCIES } from '@/lib/fx';
import { useDisplayCurrency } from '@/lib/displayCurrency';
import useAuth from '@/lib/useAuth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { currency, setCurrency } = useDisplayCurrency();
  // The display-currency pill only affects values rendered on the dashboard,
  // so hide it on every other route to avoid suggesting it does something
  // elsewhere.
  const showCurrencyPill = pathname === '/';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <header className="w-full px-4 pt-6 pb-2">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-display text-[18px] md:text-[28px] tracking-tight md:tracking-normal text-[var(--color-primary)] leading-none shrink-0"
        >
          Accounting Ledger
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-[14px] text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-primary)]">Dashboard</Link>
          <Link href="/entries" className="hover:text-[var(--color-primary)]">Entries</Link>
          <Link href="/goals" className="hover:text-[var(--color-primary)]">Goals</Link>
          {!user && (
            <Link href="/login" className="hover:text-[var(--color-primary)]">Sign in</Link>
          )}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {showCurrencyPill && (
            <div className="flex items-center gap-1 bg-[var(--color-bg)] p-1 rounded-full shadow-inset">
              {SUPPORTED_CURRENCIES.map((c) => (
                <Pill key={c} active={currency === c} onClick={() => setCurrency(c)}>
                  {c}
                </Pill>
              ))}
            </div>
          )}
          <Link
            href="/settings/categories"
            className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            Settings
          </Link>
          {user && (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          )}
        </div>
        {showCurrencyPill && (
          <div className="md:hidden flex items-center gap-[2px] bg-[var(--color-bg)] p-[3px] rounded-full shadow-inset">
            {SUPPORTED_CURRENCIES.map((c) => (
              <Pill
                key={c}
                size="sm"
                active={currency === c}
                onClick={() => setCurrency(c)}
              >
                {c}
              </Pill>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
