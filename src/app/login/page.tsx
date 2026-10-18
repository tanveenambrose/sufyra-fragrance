'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import AuthInput from '@/components/Auth/AuthInput';
import SocialButton from '@/components/Auth/SocialButton';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getURL } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      if (nextUrl) {
        router.push(nextUrl);
      } else if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, authLoading, router, nextUrl, isAdmin]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      const authorizedAdmins = ['racoctanveen15@gmail.com', 'rs80359@gmail.com'];
      const userEmail = data.user?.email || email.trim().toLowerCase();
      const isUserAdmin = authorizedAdmins.includes(userEmail);

      if (nextUrl) {
        router.push(nextUrl);
      } else if (isUserAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');

    try {
      const redirectURL = nextUrl
        ? `${getURL()}auth/callback?next=${encodeURIComponent(nextUrl)}`
        : `${getURL()}auth/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col lg:flex-row bg-(--background) transition-colors duration-300 relative overflow-x-hidden lg:overflow-hidden select-none">
      {/* Decorative ambient gradients for mobile/tablet background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 lg:hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-luxury-gold/5 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-luxury-gold/5 blur-[100px] rounded-full" />
      </div>

      {/* Left Column: Form (Full height flex on desktop, fitting viewport without vertical scrolling) */}
      <div className="w-full lg:w-1/2 xl:w-[48%] h-full flex flex-col justify-between p-5 sm:p-8 md:p-10 lg:px-12 xl:px-16 overflow-y-auto lg:overflow-y-auto relative z-10">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between w-full pb-4 shrink-0">
          <Link href="/" className="relative h-8 w-28 sm:h-9 sm:w-32 transition-transform hover:scale-105">
            <Image
              src={mounted && theme === 'light' ? '/logo- dark.png' : '/logo.png'}
              alt="Sufyra"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-(--foreground)/60 hover:text-luxury-gold transition-colors py-1.5 px-3 rounded-full hover:bg-(--foreground)/5 border border-transparent hover:border-luxury-gold/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Link>
          </div>
        </header>

        {/* Center: Form Container (fits comfortably without scrolling on desktop) */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-2 sm:py-4">
          <div className="mb-4 sm:mb-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-[9px] font-bold uppercase tracking-[0.25em] mb-2">
              <Sparkles className="w-2.5 h-2.5" />
              Sufyra Privé
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-serif text-(--foreground) tracking-tight leading-snug">
              Welcome <span className="font-normal italic">Back</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-(--foreground)/50 tracking-wider mt-1">
              Sign in to manage your collection &amp; sanctuary
            </p>
          </div>

          {error && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-3.5">
            <AuthInput
              label="Email Address"
              type="email"
              placeholder="e.g. sanctuary@sufyra.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <AuthInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                className="text-[9px] sm:text-[10px] uppercase tracking-widest text-luxury-gold hover:text-luxury-gold/70 transition-colors font-bold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-gradient text-luxury-charcoal py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-[0.25em] text-[11px] sm:text-xs hover:scale-[1.01] active:scale-98 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer mt-1"
            >
              {loading ? 'Entering Sanctuary...' : 'Sign In'}
            </button>
          </form>

          <div className="my-3 sm:my-4 flex items-center gap-3">
            <div className="h-px bg-(--foreground)/10 grow" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-(--foreground)/30 font-bold whitespace-nowrap">
              Or continue with
            </span>
            <div className="h-px bg-(--foreground)/10 grow" />
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <SocialButton provider="google" onClick={() => handleSocialLogin('google')} isLoading={loading} />
            <SocialButton provider="facebook" onClick={() => handleSocialLogin('facebook')} isLoading={loading} />
          </div>

          <div className="mt-4 sm:mt-5 text-center">
            <p className="text-xs text-(--foreground)/50">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-luxury-gold font-bold hover:underline inline-flex items-center gap-1 group">
                Register Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="pt-3 pb-1 text-center text-[10px] sm:text-[11px] text-(--foreground)/30 tracking-wider shrink-0">
          © 2026 Sufyra Fragrance • All Rights Reserved
        </footer>
      </div>

      {/* Right Column: Complementing Luxury Perfume Image (Desktop) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 xl:w-[52%] h-full bg-luxury-charcoal overflow-hidden items-end justify-center p-8 xl:p-12 select-none">
        {/* Background Perfume Bottle Image */}
        <Image
          src="/hero.png"
          alt="Sufyra Luxury Perfume Oil"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center scale-100"
        />

        {/* Atmospheric overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-black/20" />
        <div className="absolute inset-0 bg-linear-to-r from-(--background)/30 via-transparent to-transparent" />
        <div className="absolute top-1/4 -right-10 w-80 h-80 bg-luxury-gold/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Glassmorphic Brand Accent Card */}
        <div className="relative z-10 w-full max-w-md backdrop-blur-xl bg-black/45 border border-luxury-gold/25 p-6 rounded-2xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold text-[9px] font-bold uppercase tracking-[0.25em]">
              <Sparkles className="w-3 h-3" />
              Signature Elixirs
            </span>
            <span className="text-white/60 text-[10px] tracking-widest uppercase font-medium">Sufyra Paris</span>
          </div>

          <p className="font-serif text-base xl:text-lg text-white/90 leading-relaxed italic">
            &quot;Perfume is the most intense form of memory. It is the key to our heart, and the soul of our identity.&quot;
          </p>

          <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px] text-white/70">
            <span className="font-medium">100% Pure Attar Oil</span>
            <span className="text-luxury-gold tracking-widest uppercase text-[9px] font-bold">Concentrated Formula</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-(--background) flex items-center justify-center" />}>
      <LoginFormContent />
    </Suspense>
  );
}
