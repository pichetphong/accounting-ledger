'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import GoalCard from '@/components/goals/GoalCard';
import RequireAuth from '@/components/auth/RequireAuth';
import { useGoals } from '@/lib/queries/goals';
import { useEntries } from '@/lib/queries/entries';

function GoalSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-[12px] p-6 border-[3px] border-[var(--rb-ink)] flex flex-col gap-4 opacity-50">
      <div className="h-3 w-16 bg-[var(--color-surface-inset)] rounded" />
      <div className="h-5 w-48 bg-[var(--color-surface-inset)] rounded" />
      <div className="h-7 w-40 bg-[var(--color-surface-inset)] rounded" />
      <div className="h-2 w-full bg-[var(--color-surface-inset)] rounded-full" />
      <div className="h-6 w-32 bg-[var(--color-surface-inset)] rounded" />
    </div>
  );
}

function GoalsInner() {
  const { data: goals, loading: goalsLoading, error, refetch } = useGoals();
  const { data: entries } = useEntries();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[44px] md:text-[56px] uppercase text-[var(--rb-ink)] leading-[0.95]">
            Goals
          </h1>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
            Countdown updates every second.
          </p>
        </div>
        <Link href="/goals/new">
          <Button variant="primary" size="md">
            Add goal
          </Button>
        </Link>
      </header>

      {error && (
        <div className="border-[3px] border-[var(--color-error)] bg-[var(--rb-paper)] text-[var(--color-error)] text-[13px] p-3">
          {error}
        </div>
      )}

      {goalsLoading ? (
        <div className="flex flex-col gap-4">
          <GoalSkeleton />
          <GoalSkeleton />
        </div>
      ) : goals.length === 0 ? (
        <Card className="flex flex-col items-start gap-3">
          <p className="text-[14px] text-[var(--color-text-muted)]">
            No goals yet — set your first savings target.
          </p>
          <Link href="/goals/new">
            <Button variant="primary" size="md">
              Add goal
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              entries={entries}
              onChanged={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GoalsPage() {
  return (
    <RequireAuth>
      <GoalsInner />
    </RequireAuth>
  );
}
