import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { getURL } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/';
  const baseUrl = getURL();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure we don't have double slashes
      const redirectPath = next.startsWith('/') ? next.substring(1) : next;
      return NextResponse.redirect(`${baseUrl}${redirectPath}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}auth/auth-code-error`);
}
