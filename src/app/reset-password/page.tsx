'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthInput from '@/components/Auth/AuthInput';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidSession(true);
        } else {
          // Listen for auth state change in case the hash/token is still resolving
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            if (event === 'PASSWORD_RECOVERY' || (s && event === 'SIGNED_IN')) {
              setHasValidSession(true);
            }
          });

          // Wait a short moment before declaring no session
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              setHasValidSession(true);
            }
            setCheckingSession(false);
          }, 1200);

          return () => subscription.unsubscribe();
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-(--background) transition-colors duration-300 relative overflow-x-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-luxury-gold/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-luxury-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full lg:w-1/2 xl:w-[48%] min-h-screen flex flex-col justify-between p-5 sm:p-8 md:p-10 lg:px-12 xl:px-16 relative z-10">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between w-full pb-4 shrink-0">
          <Link href="/" className="relative h-8 w-28 sm:h-9 sm:w-32 transition-transform hover:scale-105">
            <Image
              src={mounted && theme === 'light' ? '/logo-dark.png' : '/logo.png'}
              alt="Sufyra"
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-contain object-left"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-(--foreground)/60 hover:text-luxury-gold transition-colors py-1.5 px-3 rounded-full hover:bg-(--foreground)/5 border border-transparent hover:border-luxury-gold/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </header>

        {/* Center Card */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-6">
          <div className="mb-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-[9px] font-bold uppercase tracking-[0.25em] mb-2">
              <Sparkles className="w-2.5 h-2.5" />
              Sanctuary Security
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-(--foreground) tracking-tight leading-snug">
              Set New <span className="font-normal italic">Password</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-(--foreground)/50 tracking-wider mt-1">
              Create a secure passphrase for your Sufyra Privé account
            </p>
          </div>

          {checkingSession ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-8 h-8 border-2 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
              <p className="text-xs text-(--foreground)/50 tracking-wider">Verifying recovery credentials...</p>
            </div>
          ) : !hasValidSession ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">Recovery Link Expired or Invalid</h3>
                <p className="text-xs text-(--foreground)/60 mt-1">
                  The password recovery link may have expired or has already been used.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block luxury-gradient text-luxury-charcoal px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
              >
                Request New Link
              </Link>
            </div>
          ) : success ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-base font-serif text-emerald-400 font-bold">Password Updated Successfully</h3>
                <p className="text-xs text-(--foreground)/60 mt-1">
                  Your credentials have been updated. Redirecting you to sign in...
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-luxury-gold font-bold uppercase tracking-widest hover:underline"
              >
                Sign in now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              <AuthInput
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <AuthInput
                label="Confirm New Password"
                type="password"
                placeholder="Repeat your new password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full luxury-gradient text-luxury-charcoal py-3.5 rounded-full font-bold uppercase tracking-[0.25em] text-xs hover:scale-[1.01] active:scale-98 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? 'Updating Credentials...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <footer className="pt-3 pb-1 text-center text-[10px] sm:text-[11px] text-(--foreground)/30 tracking-wider shrink-0">
          © 2026 Sufyra Fragrance • All Rights Reserved
        </footer>
      </div>

      {/* Right Column: Luxury Perfume Image (Desktop) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 xl:w-[52%] min-h-screen bg-luxury-charcoal overflow-hidden items-end justify-center p-8 xl:p-12 select-none">
        <Image
          src="/hero.png"
          alt="Sufyra Luxury Perfume Oil"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center scale-100"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-black/20" />
        <div className="absolute inset-0 bg-linear-to-r from-(--background)/30 via-transparent to-transparent" />
        <div className="absolute top-1/4 -right-10 w-80 h-80 bg-luxury-gold/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md backdrop-blur-xl bg-black/45 border border-luxury-gold/25 p-6 rounded-2xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold text-[9px] font-bold uppercase tracking-[0.25em]">
              <Sparkles className="w-3 h-3" />
              Account Protection
            </span>
            <span className="text-white/60 text-[10px] tracking-widest uppercase font-medium">Sufyra Security</span>
          </div>

          <p className="font-serif text-base xl:text-lg text-white/90 leading-relaxed italic">
            &quot;True luxury guarantees peace of mind and effortless access to your olfactory sanctuaries.&quot;
          </p>

          <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px] text-white/70">
            <span className="font-medium">Encrypted Authentication</span>
            <span className="text-luxury-gold tracking-widest uppercase text-[9px] font-bold">Supabase Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-(--background) flex items-center justify-center" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

