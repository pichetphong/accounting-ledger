'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import GoalForm from '@/components/goals/GoalForm';
import RequireAuth from '@/components/auth/RequireAuth';
import { getSupabaseClient } from '@/lib/supabase/client';

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    deadline: row.deadline,
    currency: row.currency ?? 'ALL',
    mode: row.mode ?? 'net',
    createdAt: row.created_at,
  };
}

function EditGoalInner({ id }) {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setGoal(fromRow(data));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-[14px] text-[var(--color-text-muted)]">Loading...</span>
      </div>
    );
  }

  if (notFound || !goal) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-[var(--color-surface)] rounded-[12px] p-6 shadow-raised flex flex-col items-start gap-3">
          <p className="text-[14px] text-[var(--color-text)]">Goal not found.</p>
          <Link
            href="/goals"
            className="text-[13px] text-[var(--color-primary)] underline"
          >
            Back to goals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-[34px] text-[var(--color-primary)] leading-none">
          Edit goal
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
          Update the goal&apos;s currency, mode, target or deadline.
        </p>
      </header>
      <GoalForm initialValues={goal} mode="edit" />
    </div>
  );
}

export default function EditGoalPage({ params }) {
  const { id } = use(params);
  return (
    <RequireAuth>
      <EditGoalInner id={id} />
    </RequireAuth>
  );
}
