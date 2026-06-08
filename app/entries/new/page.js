'use client';

import EntryForm from '@/components/entries/EntryForm';
import RequireAuth from '@/components/auth/RequireAuth';

export default function NewEntryPage() {
  return (
    <RequireAuth>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-[34px] text-[var(--color-primary)] leading-none">
            New entry
          </h1>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
            FX rate is locked at the moment of saving.
          </p>
        </header>
        <EntryForm />
      </div>
    </RequireAuth>
  );
}
