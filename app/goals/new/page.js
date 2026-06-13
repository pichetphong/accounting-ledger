'use client';

import GoalForm from '@/components/goals/GoalForm';
import RequireAuth from '@/components/auth/RequireAuth';

export default function NewGoalPage() {
  return (
    <RequireAuth>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-[44px] md:text-[56px] uppercase text-[var(--rb-ink)] leading-[0.95]">
            New goal
          </h1>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
            Pick a currency to track in, or pick ALL to convert everything to THB.
          </p>
        </header>
        <GoalForm />
      </div>
    </RequireAuth>
  );
}
