'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthInput from '@/components/Auth/AuthInput';
import SocialButton from '@/components/Auth/SocialButton';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { gsap } from 'gsap';
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
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)', delay: 0.1 }
      );
    }
  }, []);

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
    } catch (err: any) {
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  const openPopup = (url: string) => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    return window.open(
      url,
      'Sufyra Authentication',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );
  };

  const handleSocialRegister = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    
    try {
      const redirectURL = `${getURL()}auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
          skipBrowserRedirect: true,
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        const popup = openPopup(data.url);
        
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            setLoading(false);
            router.refresh();
          }
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to register with ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-luxury-charcoal">
      {/* Decorative Gradient */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-luxury-gold/5 blur-[150px] rounded-full"></div>
      </div>

      <div ref={formRef} className="w-full max-w-lg luxury-card p-8 md:p-12 rounded-[30px] border border-luxury-gold/10">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-luxury-gold transition-colors font-bold mb-6">
            <ArrowLeft className="w-3 h-3" /> Back to Login
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-luxury-gold mb-2">Create Account</h1>
          <p className="text-white/40 text-sm italic">Join the exclusive world of Sufyra fragrances.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-gradient py-4 rounded-xl flex items-center justify-center gap-2 group hover:shadow-[0_0_25px_rgba(197,160,89,0.3)] transition-all disabled:opacity-50"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-luxury-charcoal">
                {loading ? 'Creating Account...' : 'Join Sufyra'}
              </span>
              {!loading && <UserPlus className="w-4 h-4 text-luxury-charcoal group-hover:scale-110 transition-transform" />}
            </button>
          </div>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-white/5 flex-grow"></div>
          <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Registration via Social</span>
          <div className="h-px bg-white/5 flex-grow"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SocialButton provider="google" onClick={() => handleSocialRegister('google')} isLoading={loading} />
          <SocialButton provider="facebook" onClick={() => handleSocialRegister('facebook')} isLoading={loading} />
        </div>

        <p className="mt-8 text-center text-[11px] text-white/30 leading-relaxed uppercase tracking-tighter font-medium">
          By joining, you agree to our <span className="text-luxury-gold cursor-pointer hover:underline">Terms of Service</span> and <span className="text-luxury-gold cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
