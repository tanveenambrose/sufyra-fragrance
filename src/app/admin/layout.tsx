'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, PlusCircle, LogOut, ArrowLeft, Menu, X } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-charcoal flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-luxury-cream">
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
        <Link href="/" className="p-2 text-white/40">
          <ArrowLeft size={20} />
        </Link>
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

        <nav className="flex-grow p-6 space-y-2">
          {[
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/products', icon: ShoppingBag, label: 'Products' },
            { href: '/admin/products/new', icon: PlusCircle, label: 'Add Product' },
          ].map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm group"
            >
              <item.icon size={18} className="text-luxury-gold/50 group-hover:text-luxury-gold transition-colors" />
              <span className="uppercase tracking-widest text-[10px] font-bold">{item.label}</span>
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
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
