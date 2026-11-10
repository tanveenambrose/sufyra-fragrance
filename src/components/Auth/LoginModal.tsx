'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthInput from './AuthInput';
import SocialButton from './SocialButton';
import { getURL } from '@/lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // OTP forgot password states
  const [otpStep, setOtpStep] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        onSuccess();
      } else if (mode === 'register') {
        const { data: signUpData, error } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password,
          options: {
            emailRedirectTo: `${getURL()}auth/callback`,
          }
        });
        if (error) throw error;

        // Dispatch welcome email from official Sufyra email system
        try {
          fetch('/api/auth/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              name: email.split('@')[0],
              userId: signUpData.user?.id,
              provider: 'email',
            }),
          }).catch((mailErr) => console.warn('[LoginModal] Welcome email warning:', mailErr));
        } catch (mErr) {
          console.warn('[LoginModal] Welcome email dispatch error:', mErr);
        }

        alert('Verification email sent! Please check your inbox.');
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP code
  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      setOtpError('Please provide a valid email address.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setOtpStep('code');
      setResendCooldown(60);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Failed to send recovery code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/forgot-password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail.trim(), code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired code.');
      }

      setOtpStep('password');
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3 & 4: Reset password & log user into session (Step 8!)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setOtpError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setOtpError('Passwords do not match.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail.trim(),
          code: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      // Step 8: Auto sign in user session!
      await supabase.auth.signInWithPassword({
        email: otpEmail.trim(),
        password: newPassword,
      });

      setOtpStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${getURL()}auth/callback`,
          ...(provider === 'facebook' ? { scopes: 'email,public_profile' } : {}),
        }
      });
      if (error) throw error;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : `Failed to sign in with ${provider}.`;
      if (errMsg.toLowerCase().includes('not enabled') || errMsg.toLowerCase().includes('validation_failed')) {
        setError(`${provider === 'facebook' ? 'Facebook' : 'Google'} authentication is being configured. Please use Google or email login.`);
      } else {
        setError(errMsg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-(--background) border border-luxury-gold/20 rounded-[30px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-(--foreground)/5 hover:bg-(--foreground)/10 rounded-full text-(--foreground)/40 hover:text-(--foreground) transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-(--foreground) mb-2 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join the Mansion' : 'Account Recovery'}
            </h2>
            <p className="text-luxury-gold text-[10px] uppercase tracking-[0.3em] font-bold">
              {mode === 'login' ? 'Access your collection' : mode === 'register' ? 'Begin your aromatic journey' : 'Recover sanctuary access'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] text-center uppercase tracking-widest font-bold">
              {error}
            </div>
          )}

          {mode === 'forgot' ? (
            <div>
              {otpError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                  {otpError}
                </div>
              )}

              {otpStep === 'email' && (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <AuthInput
                    label="Email Address"
                    type="email"
                    placeholder="e.g. sanctuary@sufyra.com"
                    icon={Mail}
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-luxury-gold text-luxury-charcoal py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer"
                  >
                    {otpLoading ? 'Transmitting Code...' : 'Send Security Code'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-(--foreground)/50 hover:text-luxury-gold transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {otpStep === 'code' && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-(--foreground)/70 mb-2">
                      6-Digit Security Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="\d{6}"
                      inputMode="numeric"
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-(--foreground)/5 border border-luxury-gold/30 rounded-xl px-4 py-3 text-center text-2xl tracking-[10px] font-mono text-(--foreground) focus:outline-none focus:border-luxury-gold transition-all"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otpCode.length !== 6}
                    className="w-full bg-luxury-gold text-luxury-charcoal py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 text-(--foreground)/50">
                    <button
                      type="button"
                      onClick={() => setOtpStep('email')}
                      className="hover:text-luxury-gold transition-colors cursor-pointer"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || otpLoading}
                      onClick={() => handleSendCode()}
                      className="hover:text-luxury-gold transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {otpStep === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
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
                    label="Confirm Password"
                    type="password"
                    placeholder="Repeat new password"
                    icon={KeyRound}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-luxury-gold text-luxury-charcoal py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer"
                  >
                    {otpLoading ? 'Updating...' : 'Update & Enter Sanctuary'}
                  </button>
                </form>
              )}

              {otpStep === 'success' && (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-serif text-emerald-400 font-bold">Access Restored</h3>
                  <p className="text-xs text-(--foreground)/70">
                    Your password was updated and you are now signed in. Entering sanctuary...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
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

              {mode === 'login' && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpEmail(email);
                      setOtpStep('email');
                      setOtpError('');
                      setMode('forgot');
                    }}
                    className="text-[9px] uppercase tracking-widest text-luxury-gold hover:text-luxury-gold/70 transition-colors font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-luxury-gold text-luxury-charcoal py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}

          {mode !== 'forgot' && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-(--foreground)/5 grow"></div>
                <span className="text-[8px] uppercase tracking-widest text-(--foreground)/20 font-bold whitespace-nowrap">Identity Verification</span>
                <div className="h-px bg-(--foreground)/5 grow"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SocialButton provider="google" onClick={() => handleSocialLogin('google')} isLoading={loading} />
                <SocialButton provider="facebook" onClick={() => handleSocialLogin('facebook')} isLoading={loading} />
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-xs text-(--foreground)/40 hover:text-luxury-gold transition-colors cursor-pointer"
                >
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-luxury-gold font-bold hover:underline">
                    {mode === 'login' ? 'Register Now' : 'Login instead'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
