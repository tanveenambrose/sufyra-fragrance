'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthInput from '@/components/Auth/AuthInput';
import SocialButton from '@/components/Auth/SocialButton';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getURL } from '@/lib/utils';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // Save to users table
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            display_name: fullName,
            email: email,
            role: 'customer'
          });

        if (dbError) throw dbError;
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    
    try {
      const redirectURL = `${getURL()}auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
        }
      });
      
      if (error) throw error;
      // Note: Redirect happens automatically for OAuth
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to register with ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 md:pt-40 pb-12 px-4 flex items-center justify-center bg-[var(--background)] transition-colors duration-300">
      {/* Decorative Gradient */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-luxury-gold/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-lg luxury-card p-6 sm:p-8 md:p-12 rounded-[24px] sm:rounded-[30px] border border-luxury-gold/10 animate-[fade-in-up_1s_cubic-bezier(0.68,-0.55,0.265,1.55)_0.1s_both]">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-luxury-gold hover:text-luxury-gold/70 transition-colors font-bold mb-4 sm:mb-6 md:mb-8">
            <ArrowLeft className="w-3 h-3" /> Back to Login
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--foreground)] mb-3 sm:mb-4 tracking-tight leading-tight">Join the <br /> <span className="font-normal italic">Exclusive</span></h1>
          <p className="text-luxury-gold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-bold">The world of Sufyra fragrances</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="md:col-span-2">
            <AuthInput
              label="Full Name"
              type="text"
              placeholder="e.g. Tanveen Ambrose"
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <AuthInput
              label="Email Address"
              type="email"
              placeholder="e.g. amber@sufyra.shop"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={CheckCircle2}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="md:col-span-2 pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-charcoal text-white dark:bg-white dark:text-black py-3.5 sm:py-5 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] sm:text-[12px] hover:bg-luxury-gold dark:hover:bg-luxury-gold transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Join Sufyra'}
            </button>
          </div>
        </form>

        <div className="my-6 sm:my-8 flex items-center gap-4">
          <div className="h-px bg-[var(--foreground)]/5 flex-grow"></div>
          <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-[var(--foreground)]/20 font-bold whitespace-nowrap">Registration via Social</span>
          <div className="h-px bg-[var(--foreground)]/5 flex-grow"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <SocialButton provider="google" onClick={() => handleSocialRegister('google')} isLoading={loading} />
          <SocialButton provider="facebook" onClick={() => handleSocialRegister('facebook')} isLoading={loading} />
        </div>

        <p className="mt-6 sm:mt-8 text-center text-[10px] sm:text-[11px] text-[var(--foreground)]/30 leading-relaxed uppercase tracking-tighter font-medium">
          By joining, you agree to our <span className="text-luxury-gold cursor-pointer hover:underline">Terms of Service</span> and <span className="text-luxury-gold cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
