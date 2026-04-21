'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import AuthInput from '@/components/Auth/AuthInput';
import SocialButton from '@/components/Auth/SocialButton';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { gsap } from 'gsap';
import { getURL } from '@/lib/utils';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: 0.2 }
      );
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
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
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-luxury-charcoal">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-luxury-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-luxury-gold/5 blur-[120px] rounded-full"></div>
      </div>

      <div ref={formRef} className="w-full max-w-md luxury-card p-8 md:p-10 rounded-[30px] border border-luxury-gold/10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-luxury-gold mb-3">Welcome Back</h1>
          <p className="text-white/40 text-sm italic">Enter your credentials to access your luxury sanctuary.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6">
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

          <div className="flex justify-end">
            <button type="button" className="text-[10px] uppercase tracking-widest text-luxury-gold hover:text-luxury-gold/70 transition-colors font-bold">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-gradient py-4 rounded-xl flex items-center justify-center gap-2 group hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all disabled:opacity-50"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-luxury-charcoal">
              {loading ? 'Entering Sanctuary...' : 'Sign In'}
            </span>
            {!loading && <LogIn className="w-4 h-4 text-luxury-charcoal group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-white/5 flex-grow"></div>
          <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold whitespace-nowrap">Or continue with</span>
          <div className="h-px bg-white/5 flex-grow"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SocialButton provider="google" onClick={() => handleSocialLogin('google')} isLoading={loading} />
          <SocialButton provider="facebook" onClick={() => handleSocialLogin('facebook')} isLoading={loading} />
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-white/40">
            Don't have an account?{' '}
            <Link href="/register" className="text-luxury-gold font-bold hover:underline inline-flex items-center gap-1 group">
              Register Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
