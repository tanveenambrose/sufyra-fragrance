'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  LogOut, 
  ArrowLeft, 
  Menu, 
  X, 
  ClipboardList, 
  Bell, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RealtimeOrderAlert {
  id: string;
  delivery_name: string;
  total_price: number;
  product_name: string;
  created_at: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState<RealtimeOrderAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Web Audio chime synthesizer
  const playOrderChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: Gold chime tone (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.9);

      // Note 2: Harmonic shimmer (F#5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(739.99, now + 0.08);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 1.1);
    } catch {
      // AudioContext muted/unpermitted by browser policy until gesture
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  // Reset count when admin visits orders page
  useEffect(() => {
    if (pathname === '/admin/orders') {
      setNewOrdersCount(0);
    }
  }, [pathname]);

  // Real-time Supabase Subscription across the entire admin dashboard
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-global-realtime-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as RealtimeOrderAlert;
          setNewOrdersCount((prev) => prev + 1);
          setLatestAlert(newOrder);
          playOrderChime();

          if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
          alertTimeoutRef.current = setTimeout(() => {
            setLatestAlert(null);
          }, 12000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, [isAdmin, playOrderChime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-charcoal flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-luxury-cream relative">
      {/* Real-time Order Alert Toast (Top-Right Floating) */}
      {latestAlert && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full bg-[#0F0F0F]/95 backdrop-blur-2xl border border-luxury-gold/40 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-luxury-gold/25 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-luxury-gold">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-luxury-gold"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] flex items-center gap-1.5">
                <Sparkles size={12} />
                New Order Placed!
              </span>
            </div>
            <button 
              onClick={() => setLatestAlert(null)} 
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-2.5 space-y-1">
            <p className="text-sm font-bold text-luxury-cream">{latestAlert.delivery_name || 'Customer'}</p>
            <p className="text-xs text-luxury-gold font-mono font-semibold">
              ৳{latestAlert.total_price} • #{latestAlert.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-[11px] text-white/50 truncate">
              {(() => {
                try {
                  if (latestAlert.product_name?.startsWith('[') && latestAlert.product_name?.endsWith(']')) {
                    const items = JSON.parse(latestAlert.product_name);
                    return items.map((x: { name: string }) => x.name).join(', ');
                  }
                  return latestAlert.product_name;
                } catch {
                  return latestAlert.product_name;
                }
              })()}
            </p>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/10 flex justify-between items-center text-[10px]">
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Feed
            </span>
            <Link 
              href="/admin/orders" 
              onClick={() => {
                setLatestAlert(null);
                setNewOrdersCount(0);
              }}
              className="font-bold uppercase tracking-widest text-luxury-gold hover:underline flex items-center gap-1 group"
            >
              View in Orders 
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-[#0A0A0A] border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-luxury-gold hover:bg-white/5 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="font-serif text-lg text-luxury-gold tracking-widest">ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          {newOrdersCount > 0 && (
            <Link 
              href="/admin/orders" 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-luxury-gold/20 border border-luxury-gold text-luxury-gold text-[9px] font-bold uppercase tracking-wider animate-pulse"
            >
              <Bell size={12} />
              {newOrdersCount} New
            </Link>
          )}
          <Link href="/" className="p-2 text-white/40 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft size={16} className="text-luxury-gold" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Sufyra Home</span>
            </Link>
            <div className="mt-6">
              <h1 className="font-serif text-2xl text-luxury-gold tracking-widest">ADMIN</h1>
              <p className="text-[9px] uppercase tracking-[0.5em] text-white/20 mt-1">Management Console</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Notification Indicator */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Realtime Active</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
            className="p-1 text-white/30 hover:text-luxury-gold transition-colors"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>

        <nav className="flex-grow p-6 space-y-2">
          {[
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/products', icon: ShoppingBag, label: 'Products' },
            { href: '/admin/products/new', icon: PlusCircle, label: 'Add Product' },
            { href: '/admin/orders', icon: ClipboardList, label: 'Orders', badge: newOrdersCount },
          ].map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={() => {
                setIsSidebarOpen(false);
                if (item.href === '/admin/orders') setNewOrdersCount(0);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm group ${
                pathname === item.href ? 'bg-white/[0.04] border border-luxury-gold/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-luxury-gold/50 group-hover:text-luxury-gold transition-colors" />
                <span className="uppercase tracking-widest text-[10px] font-bold">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-luxury-gold text-luxury-charcoal uppercase tracking-wider animate-bounce">
                  +{item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-4 py-3">
             <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/20 flex-shrink-0">
                <span className="text-[10px] font-bold text-luxury-gold">{user?.email?.charAt(0).toUpperCase()}</span>
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold truncate">{user?.email}</span>
                <span className="text-[8px] text-white/40 uppercase tracking-widest">Administrator</span>
             </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all text-sm group"
          >
            <LogOut size={18} />
            <span className="uppercase tracking-widest text-[10px] font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-10 min-h-screen">
        <div key={pathname} className="max-w-6xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
