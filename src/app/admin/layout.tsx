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
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Package,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';

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
      const timer = setTimeout(() => setNewOrdersCount(0), 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Real-time Supabase postgres_changes listener for new orders
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-orders-stream')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as RealtimeOrderAlert;

          playOrderChime();
          setNewOrdersCount((prev) => prev + 1);
          setLatestAlert(newOrder);

          if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
          }
          alertTimeoutRef.current = setTimeout(() => {
            setLatestAlert(null);
          }, 9000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [isAdmin, playOrderChime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-3 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
        <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-luxury-gold/70 animate-pulse">
          Authenticating Executive Session...
        </p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const navLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/admin/revenue-analytics', icon: TrendingUp, label: 'Analytics', exact: false },
    { href: '/admin/products', icon: ShoppingBag, label: 'Products', exact: true },
    { href: '/admin/products/new', icon: PlusCircle, label: 'Add Product', exact: false },
    { href: '/admin/orders', icon: ClipboardList, label: 'Orders', badge: newOrdersCount, exact: false },
  ];

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) selection:bg-luxury-gold/30 selection:text-white relative flex flex-col antialiased transition-colors duration-300">
      {/* Real-time Order Alert Toast (Top-Right Floating) */}
      {latestAlert && (
        <div className="fixed top-5 right-5 z-200 max-w-sm w-full bg-luxury-charcoal/95 backdrop-blur-2xl border border-luxury-gold/40 rounded-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.2)] animate-in slide-in-from-top-4 duration-300 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-luxury-gold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-luxury-gold"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] flex items-center gap-1.5">
                <Sparkles size={12} className="text-luxury-gold" />
                New Order Received
              </span>
            </div>
            <button 
              onClick={() => setLatestAlert(null)} 
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-sm font-bold text-white">{latestAlert.delivery_name || 'Customer'}</p>
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
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
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
              Inspect Order 
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-(--navbar) backdrop-blur-xl border-b border-luxury-gold/15 px-4 py-2.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 -ml-1 text-luxury-gold hover:bg-(--foreground)/5 rounded-xl transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold font-serif font-bold text-xs">
              S
            </span>
            <span className="font-serif text-sm tracking-[0.2em] text-luxury-gold font-bold">SUFYRA</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {newOrdersCount > 0 && (
            <Link 
              href="/admin/orders" 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-luxury-gold/20 border border-luxury-gold text-luxury-gold text-[9px] font-bold uppercase tracking-wider animate-pulse"
            >
              <Bell size={12} />
              {newOrdersCount}
            </Link>
          )}
          <Link 
            href="/" 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-(--foreground)/15 text-(--foreground)/70 hover:text-luxury-gold hover:border-luxury-gold/30 text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={12} />
            Store
          </Link>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex">
        {/* Desktop & Mobile Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-(--background) backdrop-blur-2xl border-r border-luxury-gold/15 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          {/* Top Brand Crest */}
          <div>
            <div className="p-6 border-b border-(--foreground)/10 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-luxury-gold/20 via-luxury-gold/10 to-transparent border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:scale-105 transition-transform">
                  <Package size={20} className="text-luxury-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-serif text-lg tracking-[0.25em] text-luxury-gold font-bold">SUFYRA</h1>
                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 font-bold">PRO</span>
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-(--foreground)/50 mt-0.5 font-sans font-medium">Executive Console</p>
                </div>
              </Link>
              
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-(--foreground)/50 hover:text-(--foreground) rounded-lg hover:bg-(--foreground)/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Realtime Status Pill & Sound Control */}
            <div className="px-5 py-3 mx-4 mt-4 rounded-xl bg-(--foreground)/3 border border-(--foreground)/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-500">Realtime Active</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute order notification chime' : 'Enable order notification chime'}
                className="p-1 rounded-md text-(--foreground)/50 hover:text-luxury-gold hover:bg-(--foreground)/5 transition-colors flex items-center gap-1 text-[9px]"
              >
                {soundEnabled ? (
                  <Volume2 size={13} className="text-luxury-gold" />
                ) : (
                  <VolumeX size={13} className="text-(--foreground)/30" />
                )}
              </button>
            </div>

            {/* Vertical Navigation Bar */}
            <div className="px-4 py-5">
              <p className="px-3 pb-2 text-[8px] uppercase tracking-[0.3em] font-bold text-(--foreground)/40">
                Administration
              </p>
              <nav className="flex flex-col space-y-1.5">
                {navLinks.map((item) => {
                  const isActive = item.exact 
                    ? pathname === item.href 
                    : pathname.startsWith(item.href);

                  return (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      onClick={() => {
                        setIsSidebarOpen(false);
                        if (item.href === '/admin/orders') setNewOrdersCount(0);
                      }}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all text-xs group relative ${
                        isActive 
                          ? 'bg-linear-to-r from-luxury-gold/20 via-luxury-gold/10 to-transparent text-luxury-gold border-l-2 border-luxury-gold font-bold shadow-[0_4px_20px_rgba(212,175,55,0.08)]' 
                          : 'text-(--foreground)/70 hover:text-luxury-gold hover:bg-(--foreground)/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon 
                          size={18} 
                          className={`transition-colors ${
                            isActive ? 'text-luxury-gold' : 'text-(--foreground)/40 group-hover:text-luxury-gold'
                          }`} 
                        />
                        <span className="uppercase tracking-[0.18em] text-[11px] font-medium">{item.label}</span>
                      </div>
                      
                      {item.badge && item.badge > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-luxury-gold text-black uppercase tracking-wider animate-bounce">
                          +{item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-(--foreground)/10">
                <p className="px-3 pb-2 text-[8px] uppercase tracking-[0.3em] font-bold text-(--foreground)/40">
                  Storefront
                </p>
                <Link 
                  href="/" 
                  target="_blank"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-(--foreground)/60 hover:text-luxury-gold hover:bg-(--foreground)/5 transition-all text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={16} className="text-(--foreground)/40 group-hover:text-luxury-gold transition-colors" />
                    <span className="uppercase tracking-[0.18em] text-[11px] font-medium">Live Boutique</span>
                  </div>
                  <ArrowRight size={13} className="text-(--foreground)/30 group-hover:text-luxury-gold group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>
          </div>

          {/* User Profile & Sign Out Footer */}
          <div className="p-4 m-4 rounded-2xl bg-(--foreground)/4 border border-(--foreground)/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} className="text-luxury-gold" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-(--foreground) truncate">
                  {user?.email?.split('@')[0]}
                </span>
                <span className="text-[8px] text-luxury-gold/90 uppercase tracking-[0.2em] font-mono">
                  Master Administrator
                </span>
              </div>
            </div>

            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-500 hover:text-red-400 transition-all text-xs font-semibold uppercase tracking-wider group"
            >
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:pl-72 flex-1 min-w-0 flex flex-col min-h-screen">
          {/* Top Ambient Ribbon on Desktop */}
          <div className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-(--navbar) backdrop-blur-md border-b border-(--foreground)/10 text-xs text-(--foreground)/60 sticky top-0 z-30 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-(--foreground)/60">
                Sufyra Parfumerie Control Plane
              </span>
              <span className="text-(--foreground)/20">•</span>
              <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Secure Cloud Cluster
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <ThemeToggle />
              <span className="text-(--foreground)/20">|</span>
              <Link 
                href="/admin/products/new" 
                className="flex items-center gap-1.5 text-luxury-gold hover:text-(--foreground) font-medium tracking-wider uppercase text-[10px] transition-colors"
              >
                <PlusCircle size={13} />
                New Fragrance
              </Link>
              <span className="text-(--foreground)/20">|</span>
              <Link 
                href="/" 
                target="_blank"
                className="flex items-center gap-1 text-(--foreground)/60 hover:text-(--foreground) transition-colors"
              >
                <span>Boutique</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          {/* Page Children Container */}
          <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
