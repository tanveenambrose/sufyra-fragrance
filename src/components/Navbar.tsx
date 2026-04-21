'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, User as UserIcon, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/useCart';
import { useAuth } from '@/hooks/useAuth';
import { gsap } from 'gsap';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const itemCount = useCart((state) => state.getItemCount());
  const totalPrice = useCart((state) => state.getTotalPrice());
  const setIsCartOpen = useCart((state) => state.setIsCartOpen);
  const navRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchExpanded(false);
    } else if (isMounted && window.innerWidth < 640 && !isSearchExpanded) {
      setIsSearchExpanded(true);
    } else {
      router.push('/products');
    }
  };

  useEffect(() => {
    if (isAdminPage) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminPage]);

  useEffect(() => {
    if (isAdminPage || !navRef.current) return;

    const ctx = gsap.context(() => {
      // Elegant entrance for navbar elements
      const navItems = navRef.current?.querySelectorAll('.nav-item');
      if (navItems && navItems.length > 0) {
        gsap.from(navItems, {
          y: -10,
          opacity: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power2.out',
        });
      }
    }, navRef); // Scope selector to navRef

    return () => ctx.revert();
  }, [isAdminPage]);

  // Handle mobile menu opening/closing with GSAP for smoother transition
  useEffect(() => {
    if (isAdminPage || !isMounted || !mobileMenuRef.current) return;
    
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
  }, [isMenuOpen, isMounted, isAdminPage]);

  if (isAdminPage) return null;

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#0A0A0A]/95 backdrop-blur-md py-2 shadow-2xl' : 'bg-transparent py-4'
          }`}
        suppressHydrationWarning
      >
        <div className="container mx-auto px-4 md:px-6" suppressHydrationWarning>
          <div className="flex items-center justify-between gap-2 md:gap-4 relative" suppressHydrationWarning>
            {/* Logo - Adjust size for mobile completeness */}
            <Link href="/" className={`items-center nav-item transition-transform hover:scale-105 h-8 w-24 md:h-12 md:w-44 grow-0 shrink-0 relative ${isSearchExpanded ? 'hidden sm:flex' : 'flex'}`}>
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
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
                  <Link
                    href="/products?category=perfume-oil"
                    className="block px-6 py-4 text-[10px] uppercase tracking-widest text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all border-b border-white/5"
                  >
                    Regular
                  </Link>
                  <Link
                    href="/products?category=combo"
                    className="block px-6 py-4 text-[10px] uppercase tracking-widest text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all"
                  >
                    Combo
                  </Link>
                </div>
              </div>
            </div>

            {/* Search Bar - Expanded on mobile when clicked */}
            <div className={`flex items-center justify-end transition-all duration-300 nav-item ${isSearchExpanded ? 'flex-grow px-2' : 'flex-grow max-w-[40%] sm:max-w-[45%]'}`}>
              <form onSubmit={handleSearch} className="relative w-full group flex justify-end items-center h-10">
                <div className={`relative w-full flex items-center ${isSearchExpanded ? 'block' : 'hidden sm:flex'}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus={isSearchExpanded}
                    placeholder="Search scents..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-6 pr-10 focus:outline-none focus:border-luxury-gold text-sm placeholder:text-white/20 group-hover:bg-white/10 transition-all"
                  />
                  {isSearchExpanded && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="absolute right-3 p-1 text-white/40 hover:text-luxury-gold sm:hidden"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {!isSearchExpanded && (
                  <button
                    type="submit"
                    onClick={handleSearch}
                    className="h-10 w-10 text-white/60 hover:text-luxury-gold transition-colors flex items-center justify-center shrink-0 sm:absolute sm:right-1"
                  >
                    <Search className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                )}

                {/* Desktop Search Icon inside input when not expanded (sm and up) */}
                <button
                  type="submit"
                  className={`hidden sm:flex items-center justify-center text-white/40 hover:text-luxury-gold transition-colors absolute right-4`}
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right side Actions */}
            <div className={`items-center gap-2 sm:gap-4 md:gap-6 nav-item flex-shrink-0 ${isSearchExpanded ? 'hidden sm:flex' : 'flex'}`}>
              {/* Desktop Auth */}
              <div className="hidden lg:flex items-center gap-4">
                {isMounted && user ? (
                  <>
                    <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    {isAdmin && (
                      <Link href="/admin" className="text-[10px] uppercase tracking-widest text-luxury-gold hover:text-white transition-colors font-bold whitespace-nowrap border border-luxury-gold/20 px-4 py-1.5 rounded-full bg-luxury-gold/5">
                        Admin Panel
                      </Link>
                    )}
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
              <div className="lg:hidden flex items-center h-10">
                {isMounted && user ? (
                  <button className="p-1 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-luxury-gold" />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold border border-luxury-gold/50 px-3 py-1.5 rounded-full whitespace-nowrap flex items-center justify-center bg-luxury-gold/5"
                  >
                    Login
                  </Link>
                )}
              </div>

              <button className="relative group p-1 h-10 flex items-center justify-center" onClick={() => setIsCartOpen(true)}>
                <div className="flex items-center gap-1 md:gap-2">
                  <ShoppingBag className="w-5 h-5 group-hover:text-luxury-gold transition-colors text-white/80" />
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

              <button className="lg:hidden p-1 h-10 flex items-center justify-center text-white/80 hover:text-luxury-gold transition-colors" onClick={() => setIsMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slider - Moved outside of <nav> to be completely independent of navbar state */}
      <div
        className={`fixed inset-0 lg:hidden pointer-events-none`}
        style={{ zIndex: 9999 }} // Force top-most level
      >
        {/* Backdrop - Solid darkness */}
        <div
          className={`absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{ display: isMenuOpen ? 'block' : 'none' }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Slider - Consistent with main site background (Luxury Charcoal) */}
        <div
          ref={mobileMenuRef}
          className="absolute top-0 right-0 bottom-0 w-[75%] bg-[#0A0A0A] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,1)] pointer-events-auto translate-x-full flex flex-col opacity-100"
          suppressHydrationWarning
        >
          {/* Header of mobile menu */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
            <span className="font-serif text-luxury-gold text-lg tracking-[0.2em] uppercase font-bold">Navigation</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-white/60 hover:text-luxury-gold transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Links and Cart Summary */}
          <div className="flex-grow overflow-y-auto py-8 px-6 space-y-10">
            {/* Bag Section inside Sidebar (Mobile only) */}
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/10 shadow-lg space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/30">
                    <ShoppingBag size={20} className="text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold/60 font-bold mb-1">My Bag</p>
                    <p className="text-base text-luxury-cream font-bold">{itemCount} Items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold/60 font-bold mb-1">Total</p>
                  <p className="text-base text-luxury-gold font-bold">{totalPrice}৳</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-4 luxury-gradient text-luxury-charcoal rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-luxury-gold/10 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                View Bag & Checkout
              </button>
            </div>

            <div className="space-y-8 pt-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-2xl uppercase tracking-[0.1em] font-serif text-luxury-cream hover:text-luxury-gold transition-colors font-medium"
              >
                Home
              </Link>

              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="block text-2xl uppercase tracking-[0.1em] font-serif text-luxury-gold hover:text-white transition-colors font-medium border-b border-luxury-gold/10 pb-2"
                >
                  Admin Panel
                </Link>
              )}

              {/* Products with Sub-menu */}
              <div className="space-y-6">
                <button
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  className="flex items-center justify-between w-full text-2xl uppercase tracking-[0.1em] font-serif text-luxury-cream hover:text-luxury-gold transition-colors font-medium border-b border-white/5 pb-2"
                >
                  <span>Products</span>
                  <ChevronDown className={`w-6 h-6 transition-transform duration-300 text-luxury-gold/50 ${isProductsOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`pl-4 space-y-5 overflow-hidden transition-all duration-300 ${isProductsOpen ? 'max-h-52 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <Link
                    href="/products?category=perfume-oil"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-white/70 hover:text-luxury-gold font-bold transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                    Regular Versions
                  </Link>
                  <Link
                    href="/products?category=combo"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-white/70 hover:text-luxury-gold font-bold transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                    Combo Packs
                  </Link>
                </div>
              </div>
            </div>

            {isMounted && user ? (
              <div className="pt-10 border-t border-white/10 space-y-7">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/40">
                    <UserIcon size={22} className="text-luxury-gold" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">Logged In As</span>
                    <span className="text-base text-luxury-cream font-bold truncate max-w-[150px]">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-4 rounded-xl border-2 border-red-500/30 text-red-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all bg-red-500/5 shadow-lg shadow-red-500/5"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-10 border-t border-white/10">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full luxury-gradient py-4 rounded-xl text-center text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-luxury-gold/20"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-white/10 text-center bg-white/[0.01]">
            <p className="text-[9px] uppercase tracking-[0.5em] text-white/20 font-medium">Sufyra Signature Fragrances</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
