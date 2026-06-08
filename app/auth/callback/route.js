import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
    return NextResponse.redirect(`${origin}/`);
  } catch (err) {
    console.warn('[ledger-web] auth callback failed', err?.message ?? err);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }
}
