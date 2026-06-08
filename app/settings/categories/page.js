'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import RequireAuth from '@/components/auth/RequireAuth';
import useCategories from '@/lib/useCategories';
import useConfirm from '@/lib/useConfirm';
import useAuth from '@/lib/useAuth';

function ManageCategoriesInner() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { categories, addCategory, removeCategory, hydrated, loading, error } =
    useCategories();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setBusy(true);
    const result = await addCategory(draft);
    setBusy(false);
    if (result.ok) {
      setDraft('');
      setFeedback({ tone: 'success', text: `Added "${result.name}".` });
    } else if (result.reason === 'empty') {
      setFeedback({ tone: 'error', text: 'Category name cannot be empty.' });
    } else if (result.reason === 'duplicate') {
      setFeedback({ tone: 'error', text: result.message ?? 'Category already exists.' });
    } else {
      setFeedback({ tone: 'error', text: result.message ?? 'Could not add category.' });
    }
  };

  const handleRemove = async (name) => {
    const confirmed = await confirm({
      title: 'Remove category',
      description: (
        <>
          Remove the category <strong>&ldquo;{name}&rdquo;</strong>? It will
          disappear from the picker, but existing entries already labelled with
          it will keep their label untouched.
        </>
      ),
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;
    const result = await removeCategory(name);
    if (result.ok) {
      setFeedback({ tone: 'success', text: `Removed "${name}".` });
    } else {
      setFeedback({ tone: 'error', text: result.message ?? 'Could not remove category.' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-[34px] text-[var(--color-primary)] leading-none">
          Manage categories
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
          Add or remove the labels you use when logging an entry.
        </p>
      </header>

      <form onSubmit={handleAdd} className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="New category"
            name="newCategory"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. coffee, rent, bonus"
            disabled={busy}
          />
        </div>
        <Button type="submit" variant="primary" size="md" disabled={busy}>
          {busy ? 'Adding...' : 'Add'}
        </Button>
      </form>

      {feedback && (
        <div
          className={`rounded-[12px] text-[13px] p-3 ${
            feedback.tone === 'success'
              ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
              : 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {error && !feedback && (
        <div className="rounded-[12px] bg-[var(--color-error-bg)] text-[var(--color-error)] text-[13px] p-3">
          {error}
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[20px] text-[var(--color-primary)]">
          {hydrated ? `${categories.length} categories` : 'Categories'}
        </h2>

        {loading && categories.length === 0 && (
          <div className="rounded-[12px] bg-[var(--color-surface-inset)] p-4 text-[13px] text-[var(--color-text-muted)] shadow-inset">
            Loading...
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="rounded-[12px] bg-[var(--color-surface-inset)] p-4 text-[13px] text-[var(--color-text-muted)] shadow-inset">
            No categories yet. Add one above to get started.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {categories.map((name) => (
            <div
              key={name}
              className="bg-[var(--color-surface)] rounded-[12px] p-4 shadow-raised flex items-center justify-between gap-3"
            >
              <span className="text-[14px] text-[var(--color-text)] truncate">
                {name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(name)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="md:hidden flex flex-col gap-3 pt-4 border-t border-[var(--color-divider)]">
        <h2 className="font-display text-[20px] text-[var(--color-primary)]">
          Account
        </h2>
        <div className="bg-[var(--color-surface)] rounded-[12px] p-4 shadow-raised flex items-center justify-between gap-3">
          <span className="text-[14px] text-[var(--color-text)]">Sign out</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </section>

      {confirmDialog}
    </div>
  );
}

export default function ManageCategoriesPage() {
  return (
    <RequireAuth>
      <ManageCategoriesInner />
    </RequireAuth>
  );
}
