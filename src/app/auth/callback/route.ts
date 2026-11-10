import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { sendWelcomeEmail } from '@/lib/sendWelcomeEmail';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/';
  
  // Use the incoming request's origin as the base for redirects
  // This ensures the user stays on the same domain (Vercel or localhost)
  const baseUrl = origin.endsWith('/') ? origin : `${origin}/`;

  if (errorParam) {
    console.error('[OAuth Callback] Provider returned error:', errorParam, errorDescription);
    const redirectUrl = new URL(`${baseUrl}login`);
    redirectUrl.searchParams.set('error', errorDescription || errorParam);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (data?.user?.email) {
        try {
          const userEmail = data.user.email;
          const userName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.user_metadata?.display_name;
          const provider = data.user.app_metadata?.provider || 'oauth';

          await sendWelcomeEmail({
            email: userEmail,
            name: userName,
            userId: data.user.id,
            provider,
          });
        } catch (emailErr) {
          console.error('[OAuth Callback] Non-blocking welcome email error:', emailErr);
        }
      }

      // Ensure we don't have double slashes
      const redirectPath = next.startsWith('/') ? next.substring(1) : next;
      return NextResponse.redirect(`${baseUrl}${redirectPath}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}auth/auth-code-error`);
}
