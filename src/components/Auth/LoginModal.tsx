'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
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
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${getURL()}auth/callback`,
          }
        });
        if (error) throw error;
        alert('Verification email sent! Please check your inbox.');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
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
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[var(--background)] border border-luxury-gold/20 rounded-[30px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-[var(--foreground)] mb-2 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Join the Mansion'}
            </h2>
            <p className="text-luxury-gold text-[10px] uppercase tracking-[0.3em] font-bold">
              {mode === 'login' ? 'Access your collection' : 'Begin your aromatic journey'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] text-center uppercase tracking-widest font-bold">
              {error}
            </div>
          )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-gold text-luxury-charcoal py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 transition-all shadow-lg shadow-luxury-gold/10 disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-[var(--foreground)]/5 flex-grow"></div>
            <span className="text-[8px] uppercase tracking-widest text-[var(--foreground)]/20 font-bold whitespace-nowrap">Identity Verification</span>
            <div className="h-px bg-[var(--foreground)]/5 flex-grow"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SocialButton provider="google" onClick={() => handleSocialLogin('google')} isLoading={loading} />
            <SocialButton provider="facebook" onClick={() => handleSocialLogin('facebook')} isLoading={loading} />
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-[var(--foreground)]/40 hover:text-luxury-gold transition-colors"
            >
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span className="text-luxury-gold font-bold hover:underline">
                {mode === 'login' ? 'Register Now' : 'Login instead'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
