'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/lib/useAuth';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-[14px] text-[var(--color-text-muted)]">Loading...</span>
      </div>
    );
  }

  if (!user) return null;

  return children;
}
