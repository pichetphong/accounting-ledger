'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase/client';
import useAuth from '@/lib/useAuth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setError('We could not complete that sign-in link. Please request a new one.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Sign-in is unavailable. Supabase is not configured.');
      return;
    }

    setSubmitting(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: redirectTo },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSentTo(trimmed);
    setSent(true);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={submitting || sent}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitting || sent || !email.trim()}
        >
          {submitting ? 'Sending...' : sent ? 'Link sent' : 'Send magic link'}
        </Button>
        {error && (
          <div className="border-[3px] border-[var(--color-error)] bg-white text-[var(--color-error)] text-[13px] p-3">
            {error}
          </div>
        )}
        {sent && (
          <div className="border-[3px] border-[var(--color-info)] bg-white text-[var(--color-info)] text-[13px] p-3">
            Check your email — we sent a sign-in link to <strong>{sentTo}</strong>.
          </div>
        )}
      </form>
    </Card>
  );
}

function LoginFallback() {
  return (
    <Card>
      <p className="text-[13px] text-[var(--color-text-muted)]">Loading...</p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <header>
        <h1 className="font-display text-[44px] md:text-[56px] uppercase text-black leading-[0.95]">
          Sign in to Accounting Ledger
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
          We will email you a magic link.
        </p>
      </header>

      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
