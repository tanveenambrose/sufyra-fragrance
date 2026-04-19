'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useAuth } from '@/hooks/useAuth';
import { gsap } from 'gsap';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, signOut } = useAuth();
  const itemCount = useCart((state) => state.getItemCount());
  const totalPrice = useCart((state) => state.getTotalPrice());
  const setIsCartOpen = useCart((state) => state.setIsCartOpen);
  const navRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Elegant entrance for navbar elements
      gsap.from('.nav-item', {
        y: -10,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power2.out',
      });
    }, navRef); // Scope selector to navRef

    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-luxury-charcoal/90 backdrop-blur-md py-2 shadow-2xl' : 'bg-transparent py-4'
        }`}
      suppressHydrationWarning
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo - Takes about 30% on mobile */}
          <Link href="/" className="flex items-center nav-item transition-transform hover:scale-105 h-9 w-28 md:h-12 md:w-44 relative flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Sufyra Logo"
              fill
              sizes="(max-width: 768px) 120px, 180px"
              className="object-contain"
              priority
            />
          </Link>

          {/* Products Dropdown */}
          <div className="hidden lg:block relative group nav-item">
            <Link 
              href="/products" 
              className="text-[10px] uppercase tracking-widest hover:text-luxury-gold transition-colors font-bold flex items-center gap-1.5 py-4"
            >
              Products
              <div className="w-1.5 h-1.5 border-r border-b border-current translate-y-[-20%] rotate-45 group-hover:rotate-[225deg] transition-transform duration-300" />
            </Link>
            
            <div className="absolute top-full left-0 w-48 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
              <div className="bg-luxury-charcoal border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
                <Link 
                  href="/products?category=perfume-oil" 
                  className="block px-6 py-4 text-[10px] uppercase tracking-widest text-white/60 hover:text-luxury-gold hover:bg-white/5 transition-all border-b border-white/5"
                >
                  Regular
                </Link>
                <Link 
                  href="/products?category=combo" 
                  className="block px-6 py-4 text-[10px] uppercase tracking-widest text-white/60 hover:text-luxury-gold hover:bg-white/5 transition-all"
                >
                  Combo
                </Link>
              </div>
            </div>
          </div>

          {/* Search Bar - Takes 40% of the screen width as requested */}
          <div className="flex-grow max-w-[30%] nav-item">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 md:py-2 px-4 md:px-6 focus:outline-none focus:border-luxury-gold transition-all text-[11px] md:text-sm placeholder:text-white/20 group-hover:bg-white/10"
              />
              <Search className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-white/30" />
            </div>
          </div>


          {/* Right side Actions - Icons always visible */}
          <div className="flex items-center gap-3 md:gap-6 nav-item flex-shrink-0">
            {isMounted && user ? (
              <div className="hidden lg:flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button 
                  onClick={() => signOut()}
                  className="text-white/40 hover:text-red-400 transition-colors p-1"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:flex text-[10px] uppercase tracking-widest hover:text-luxury-gold transition-colors font-bold whitespace-nowrap">
                Login
              </Link>
            )}
            
            <button className="relative group p-1" onClick={() => setIsCartOpen(true)}>
              <div className="flex items-center gap-1 md:gap-2">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 group-hover:text-luxury-gold transition-colors text-luxury-gold" />
                <div className="hidden sm:flex flex-col items-start leading-none text-[8px] md:text-[10px] uppercase tracking-tighter w-12 md:w-16">
                   {isMounted ? (
                     <>
                       <span className="font-bold">{itemCount} items</span>
                       <span className="text-luxury-gold font-bold">{totalPrice}৳</span>
                     </>
                   ) : (
                     <span className="font-bold">...</span>
                   )}
                </div>
                {/* Mobile Badge */}
                {isMounted && itemCount > 0 && (
                  <span className="sm:hidden absolute -top-1 -right-1 bg-luxury-gold text-luxury-charcoal text-[8px] font-bold px-1 rounded-full min-w-[14px]">
                    {itemCount}
                  </span>
                )}
              </div>
            </button>

            <button className="lg:hidden p-1 text-white/60 hover:text-luxury-gold transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-luxury-charcoal z-40 transition-transform duration-500 lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl uppercase tracking-widest font-serif text-luxury-cream">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:text-luxury-gold transition-colors">Home</Link>
          <Link href="/products" onClick={() => setIsMenuOpen(false)} className="hover:text-luxury-gold transition-colors">Products</Link>
          {isMounted && user ? (
            <div className="flex flex-col items-center gap-4 mt-4">
              <span className="text-sm text-luxury-gold font-bold">{user.email}</span>
              <button 
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }} 
                className="text-sm text-red-400 font-bold uppercase tracking-widest"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-luxury-gold transition-colors text-sm">Login / Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
