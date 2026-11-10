'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';
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

  // Forgot password OTP multi-step states
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');
  const errorParam = searchParams.get('error');
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (errorParam) {
      setError(errorParam);
    }
  }, [errorParam]);

  // Cooldown countdown for resending code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (!authLoading && user && !forgotPasswordMode) {
      if (nextUrl) {
        router.push(nextUrl);
      } else if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, authLoading, router, nextUrl, isAdmin, forgotPasswordMode]);

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
          ...(provider === 'facebook' ? { scopes: 'email,public_profile' } : {}),
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : `Failed to sign in with ${provider}.`;
      if (errMsg.toLowerCase().includes('not enabled') || errMsg.toLowerCase().includes('validation_failed')) {
        setError(`${provider === 'facebook' ? 'Facebook' : 'Google'} sign-in is being set up in the sanctuary. Please sign in with Google or email.`);
      } else {
        setError(errMsg);
      }
      setLoading(false);
    }
  };

  // Step 1: Request 6-digit verification code
  const handleSendVerificationCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const res = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setResetStep('code');
      setResendCooldown(60);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to dispatch verification code.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Validate 6-digit verification code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = resetCode.trim();
    if (cleanCode.length !== 6) {
      setResetError('Please enter the full 6-digit verification code.');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const res = await fetch('/api/auth/forgot-password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim(), code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }

      setResetStep('password');
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 3 & 4: Reset password and auto-login session (Step 8!)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const res = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          code: resetCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password.');
      }

      // Step 8: Log the user into their account session immediately!
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: resetEmail.trim(),
        password: newPassword,
      });

      if (loginError) {
        console.warn('Auto-login notice:', loginError.message);
      }

      setResetStep('success');

      setTimeout(() => {
        router.push(nextUrl || '/');
      }, 2000);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setResetLoading(false);
    }
  };

  const resetForgotState = () => {
    setForgotPasswordMode(false);
    setResetStep('email');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col lg:flex-row bg-(--background) transition-colors duration-300 relative overflow-x-hidden lg:overflow-hidden select-none">
      {/* Decorative ambient gradients for mobile/tablet background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 lg:hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-luxury-gold/5 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-luxury-gold/5 blur-[100px] rounded-full" />
      </div>

      {/* Left Column: Form Container */}
      <div className="w-full lg:w-1/2 xl:w-[48%] h-full flex flex-col justify-between p-5 sm:p-8 md:p-10 lg:px-12 xl:px-16 overflow-y-auto lg:overflow-y-auto relative z-10">
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
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-(--foreground)/60 hover:text-luxury-gold transition-colors py-1.5 px-3 rounded-full hover:bg-(--foreground)/5 border border-transparent hover:border-luxury-gold/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Link>
          </div>
        </header>

        {/* Center: Form Container */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-2 sm:py-4">
          {forgotPasswordMode ? (
            <div className="animate-in fade-in duration-300">
              <div className="mb-4 sm:mb-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-[9px] font-bold uppercase tracking-[0.25em] mb-2">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Sanctuary Recovery
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif text-(--foreground) tracking-tight leading-snug">
                  {resetStep === 'email' && (
                    <>Forgot <span className="font-normal italic">Password?</span></>
                  )}
                  {resetStep === 'code' && (
                    <>Enter <span className="font-normal italic">Verification Code</span></>
                  )}
                  {resetStep === 'password' && (
                    <>Establish <span className="font-normal italic">New Password</span></>
                  )}
                  {resetStep === 'success' && (
                    <>Access <span className="font-normal italic">Restored</span></>
                  )}
                </h1>
                <p className="text-[11px] sm:text-xs text-(--foreground)/50 tracking-wider mt-1">
                  {resetStep === 'email' && 'Submit your email to receive a secure 6-digit access code.'}
                  {resetStep === 'code' && `We sent a 6-digit verification code to ${resetEmail}`}
                  {resetStep === 'password' && 'Enter and confirm your new sanctuary passphrase.'}
                  {resetStep === 'success' && 'Your password has been updated and your session activated.'}
                </p>
              </div>

              {resetError && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center animate-in shake duration-200">
                  {resetError}
                </div>
              )}

              {/* Stage 1: Email Form */}
              {resetStep === 'email' && (
                <form onSubmit={handleSendVerificationCode} className="space-y-3.5">
                  <AuthInput
                    label="Registered Email Address"
                    type="email"
                    placeholder="e.g. sanctuary@sufyra.com"
                    icon={Mail}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full luxury-gradient text-luxury-charcoal py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-[0.25em] text-[11px] sm:text-xs hover:scale-[1.01] active:scale-98 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer mt-2"
                  >
                    {resetLoading ? 'Transmitting Code...' : 'Send Verification Code'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={resetForgotState}
                      className="text-xs text-(--foreground)/50 hover:text-luxury-gold transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Stage 2: 6-Digit Code Form */}
              {resetStep === 'code' && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-(--foreground)/70 mb-2">
                      6-Digit Security Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        pattern="\d{6}"
                        inputMode="numeric"
                        placeholder="••••••"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-(--foreground)/5 border border-luxury-gold/30 rounded-xl px-4 py-3 text-center text-2xl tracking-[10px] font-mono text-(--foreground) focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-all"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[10px] text-(--foreground)/40 mt-1.5 text-center">
                      Code is valid for 10 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || resetCode.length !== 6}
                    className="w-full luxury-gradient text-luxury-charcoal py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-[0.25em] text-[11px] sm:text-xs hover:scale-[1.01] active:scale-98 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer"
                  >
                    {resetLoading ? 'Verifying...' : 'Verify Security Code'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 text-(--foreground)/50">
                    <button
                      type="button"
                      onClick={() => setResetStep('email')}
                      className="hover:text-luxury-gold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || resetLoading}
                      onClick={() => handleSendVerificationCode()}
                      className="hover:text-luxury-gold transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3 h-3 ${resetLoading ? 'animate-spin' : ''}`} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* Stage 3: New Password Input */}
              {resetStep === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <AuthInput
                    label="New Password"
                    type="password"
                    placeholder="At least 6 characters"
                    icon={Lock}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <AuthInput
                    label="Confirm New Password"
                    type="password"
                    placeholder="Repeat new password"
                    icon={KeyRound}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full luxury-gradient text-luxury-charcoal py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-[0.25em] text-[11px] sm:text-xs hover:scale-[1.01] active:scale-98 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer mt-2"
                  >
                    {resetLoading ? 'Saving & Signing In...' : 'Update Password & Enter'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetForgotState}
                      className="text-xs text-(--foreground)/50 hover:text-luxury-gold transition-colors cursor-pointer"
                    >
                      Cancel Recovery
                    </button>
                  </div>
                </form>
              )}

              {/* Stage 4: Success Message */}
              {resetStep === 'success' && (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3.5 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <div>
                    <h3 className="text-base font-serif text-emerald-400 font-bold">Password Updated Successfully</h3>
                    <p className="text-xs text-(--foreground)/70 mt-1 leading-relaxed">
                      You are now logged into your Sufyra Privé sanctuary. Directing to your collection...
                    </p>
                  </div>
                  <div className="w-5 h-5 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin mx-auto mt-2" />
                </div>
              )}
            </div>
          ) : (
            <div>
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
                    onClick={() => {
                      setResetEmail(email);
                      setResetStep('email');
                      setResetError('');
                      setForgotPasswordMode(true);
                    }}
                    className="text-[9px] sm:text-[10px] uppercase tracking-widest text-luxury-gold hover:text-luxury-gold/70 transition-colors font-bold cursor-pointer"
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
          )}
        </div>

        {/* Footer Note */}
        <footer className="pt-3 pb-1 text-center text-[10px] sm:text-[11px] text-(--foreground)/30 tracking-wider shrink-0">
          © 2026 Sufyra Fragrance • All Rights Reserved
        </footer>
      </div>

      {/* Right Column: Luxury Perfume Image (Desktop) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 xl:w-[52%] h-full bg-luxury-charcoal overflow-hidden items-end justify-center p-8 xl:p-12 select-none">
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
