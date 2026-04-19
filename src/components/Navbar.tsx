'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X, User as UserIcon, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useAuth } from '@/hooks/useAuth';
import { gsap } from 'gsap';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, signOut } = useAuth();
  const itemCount = useCart((state) => state.getItemCount());
  const totalPrice = useCart((state) => state.getTotalPrice());
  const setIsCartOpen = useCart((state) => state.setIsCartOpen);
  const navRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  // Handle mobile menu opening/closing with GSAP for smoother transition
  useEffect(() => {
    if (!isMounted) return;
    
    if (isMenuOpen) {
      gsap.to(mobileMenuRef.current, {
        x: 0,
        duration: 0.5,
        ease: 'power3.out'
      });
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(mobileMenuRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in'
      });
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen, isMounted]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-luxury-charcoal/90 backdrop-blur-md py-2 shadow-2xl' : 'bg-transparent py-4'
        }`}
      suppressHydrationWarning
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo - Adjust size for mobile completeness */}
          <Link href="/" className="flex items-center nav-item transition-transform hover:scale-105 h-8 w-24 md:h-12 md:w-44 relative flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Sufyra Logo"
              fill
              sizes="(max-width: 768px) 100px, 180px"
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Products Dropdown */}
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

          {/* Search Bar - Logo only on mobile, Both on desktop */}
          <div className="flex items-center justify-end flex-grow max-w-[40%] sm:max-w-[45%] nav-item transition-all duration-300">
            <div className="relative w-full group flex justify-end items-center">
              {/* Input: Hidden on mobile (< sm), visible on larger devices */}
              <input
                type="text"
                placeholder="Search scents..."
                className="hidden sm:block w-full bg-white/5 border border-white/10 rounded-full py-2 px-6 focus:outline-none focus:border-luxury-gold transition-all text-sm placeholder:text-white/20 group-hover:bg-white/10"
              />
              {/* Search Icon: In desktop it's absolute inside input, In mobile it's just the icon */}
              <button className="sm:absolute sm:right-4 p-2 text-white/40 hover:text-luxury-gold transition-colors">
                <Search className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          {/* Right side Actions */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 nav-item flex-shrink-0">
            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-4">
              {isMounted && user ? (
                <>
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
                </>
              ) : (
                <Link href="/login" className="text-[10px] uppercase tracking-widest hover:text-luxury-gold transition-colors font-bold whitespace-nowrap border border-white/10 px-4 py-1.5 rounded-full">
                  Login
                </Link>
              )}
            </div>
            
            {/* Mobile Auth Logic - Profile Icon if logged in, else Login button */}
            <div className="lg:hidden flex items-center">
              {isMounted && user ? (
                <button className="p-1">
                   <UserIcon className="w-5 h-5 text-luxury-gold" />
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold border border-luxury-gold/30 px-3 py-1 rounded-full whitespace-nowrap"
                >
                  Login
                </Link>
              )}
            </div>

            <button className="relative group p-1" onClick={() => setIsCartOpen(true)}>
              <div className="flex items-center gap-1 md:gap-2">
                <ShoppingBag className="w-5 h-5 group-hover:text-luxury-gold transition-colors text-white/60" />
                {/* Desktop Cart Summary */}
                <div className="hidden lg:flex flex-col items-start leading-none text-[10px] uppercase tracking-tighter w-16">
                   {isMounted ? (
                     <>
                       <span className="font-bold">{itemCount} items</span>
                       <span className="text-luxury-gold font-bold">{totalPrice}৳</span>
                     </>
                   ) : (
                     <span className="font-bold">...</span>
                   )}
                </div>
                {/* Mobile Badge Only */}
                {isMounted && itemCount > 0 && (
                  <span className="lg:hidden absolute -top-1 -right-1 bg-luxury-gold text-luxury-charcoal text-[8px] font-bold px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
            </button>

            <button className="lg:hidden p-1 text-white/60 hover:text-luxury-gold transition-colors" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slider - 75% width from right */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden pointer-events-none ${isMenuOpen ? 'block' : 'hidden'}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Slider */}
        <div 
          ref={mobileMenuRef}
          className="absolute top-0 right-0 bottom-0 w-[75%] bg-[#0A0A0A] border-l border-white/10 shadow-2xl pointer-events-auto translate-x-full flex flex-col"
        >
          {/* Header of mobile menu */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <span className="font-serif text-luxury-gold text-lg tracking-widest uppercase">Navigation</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-white/40 hover:text-luxury-gold transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Links and Cart Summary */}
          <div className="flex-grow overflow-y-auto py-8 px-6 space-y-8">
            {/* Bag Section inside Sidebar (Mobile only) */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/20">
                    <ShoppingBag size={18} className="text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-0.5">My Bag</p>
                    <p className="text-sm text-luxury-cream font-bold">{itemCount} Items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-0.5">Total</p>
                  <p className="text-sm text-luxury-gold font-bold">{totalPrice}৳</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-3 bg-luxury-gold text-luxury-charcoal rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                View Bag & Checkout
              </button>
            </div>

            <div className="space-y-6 pt-4">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)} 
                className="block text-xl uppercase tracking-widest font-serif text-luxury-cream hover:text-luxury-gold transition-colors"
              >
                Home
              </Link>

              {/* Products with Sub-menu */}
              <div className="space-y-4">
                <button 
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  className="flex items-center justify-between w-full text-xl uppercase tracking-widest font-serif text-luxury-cream hover:text-luxury-gold transition-colors"
                >
                  <span>Products</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`pl-4 space-y-4 overflow-hidden transition-all duration-300 ${isProductsOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <Link 
                    href="/products?category=perfume-oil" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/50 hover:text-luxury-gold"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold/50" />
                    Regular Versions
                  </Link>
                  <Link 
                    href="/products?category=combo" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/50 hover:text-luxury-gold"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold/50" />
                    Combo Packs
                  </Link>
                </div>
              </div>
            </div>

            {isMounted && user ? (
              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/30">
                    <UserIcon size={18} className="text-luxury-gold" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Logged In As</span>
                    <span className="text-sm text-luxury-cream font-bold truncate max-w-[120px]">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }} 
                  className="w-full py-4 rounded-xl border border-red-500/20 text-red-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-500/5 transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-8 border-t border-white/5">
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="block w-full luxury-gradient py-4 rounded-xl text-center text-luxury-charcoal font-bold uppercase tracking-widest text-xs"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-white/5 text-center">
            <p className="text-[8px] uppercase tracking-[0.4em] text-white/10">Sufyra Signature Fragrances</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
