'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Mail, 
  ArrowUp, 
  ExternalLink
} from 'lucide-react';

const FacebookIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L21 3.5z" />
  </svg>
);

const Footer: React.FC = () => {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isAdminPage || isAuthPage) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-(--background) border-t border-(--foreground)/10 pt-10 pb-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Gradient Blob */}
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-luxury-gold/5 rounded-full blur-[90px] pointer-events-none" suppressHydrationWarning />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-luxury-bronze/5 rounded-full blur-[90px] pointer-events-none" suppressHydrationWarning />

      <div className="container mx-auto px-4 md:px-6 relative z-10" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8" suppressHydrationWarning>
          {/* Brand Section */}
          <div className="space-y-4" suppressHydrationWarning>
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <div className="relative h-9 w-36" suppressHydrationWarning>
                <Image
                  src={mounted && theme === 'light' ? "/logo-dark.png" : "/logo.png"}
                  alt="Sufyra Logo"
                  fill
                  sizes="(max-width: 768px) 130px, 150px"
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-(--foreground) font-medium text-xs leading-relaxed max-w-xs">
              Sufyra Fragrance brings you the finest handcrafted attar and perfume oils, blending tradition with modern luxury to create unforgettable scents.
            </p>
            <div className="flex items-center gap-3" suppressHydrationWarning>
              <button 
                onClick={scrollToTop}
                className="w-8 h-8 rounded-full border border-(--foreground)/15 flex items-center justify-center text-luxury-gold hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300 group"
                title="Back to Top"
              >
                <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-luxury-gold font-serif text-sm tracking-wider uppercase">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-(--foreground) hover:text-luxury-gold transition-colors text-xs font-semibold flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" suppressHydrationWarning />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-(--foreground) hover:text-luxury-gold transition-colors text-xs font-semibold flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" suppressHydrationWarning />
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=perfume-oil" className="text-(--foreground) hover:text-luxury-gold transition-colors text-xs font-semibold flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" suppressHydrationWarning />
                  Regular Versions
                </Link>
              </li>
              <li>
                <Link href="/products?category=combo" className="text-(--foreground) hover:text-luxury-gold transition-colors text-xs font-semibold flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" suppressHydrationWarning />
                  Combo Packs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-3">
            <h4 className="text-luxury-gold font-serif text-sm tracking-wider uppercase">Support</h4>
            <div className="space-y-3" suppressHydrationWarning>
              <a 
                href="mailto:sufyrafragrance@gmail.com" 
                className="flex items-center gap-2.5 text-(--foreground) hover:text-luxury-gold transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-(--foreground)/5 flex items-center justify-center group-hover:bg-luxury-gold/20 border border-(--foreground)/10 transition-all duration-300 shadow-sm shrink-0" suppressHydrationWarning>
                  <Mail size={16} className="text-luxury-gold" />
                </div>
                <div className="flex flex-col min-w-0" suppressHydrationWarning>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-(--foreground)/40 font-bold">Email Us</span>
                  <span className="text-xs font-bold truncate">sufyrafragrance@gmail.com</span>
                </div>
              </a>
              <a 
                href="https://wa.me/8801886141861" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-(--foreground) hover:text-luxury-gold transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-(--foreground)/5 flex items-center justify-center group-hover:bg-luxury-gold/20 border border-(--foreground)/10 transition-all duration-300 shadow-sm shrink-0" suppressHydrationWarning>
                  <WhatsAppIcon size={16} className="text-luxury-gold" />
                </div>
                <div className="flex flex-col min-w-0" suppressHydrationWarning>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-(--foreground)/40 font-bold">WhatsApp</span>
                  <span className="text-xs font-bold truncate">+880 1886-141861</span>
                </div>
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h4 className="text-luxury-gold font-serif text-sm tracking-wider uppercase">Socials</h4>
            <div className="space-y-3" suppressHydrationWarning>
              <a 
                href="https://www.facebook.com/SufyraFragrance/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-(--foreground) hover:text-luxury-gold transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-(--foreground)/5 flex items-center justify-center group-hover:bg-luxury-gold/20 border border-(--foreground)/10 transition-all duration-300 shadow-sm shrink-0" suppressHydrationWarning>
                  <FacebookIcon size={16} className="text-luxury-gold" />
                </div>
                <div className="flex flex-col min-w-0" suppressHydrationWarning>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-(--foreground)/40 font-bold">Facebook</span>
                  <span className="text-xs font-bold truncate">Sufyra Fragrance</span>
                </div>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
              <a 
                href="https://www.instagram.com/sufyra_fragrance" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-(--foreground) hover:text-luxury-gold transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-(--foreground)/5 flex items-center justify-center group-hover:bg-luxury-gold/20 border border-(--foreground)/10 transition-all duration-300 shadow-sm shrink-0" suppressHydrationWarning>
                  <InstagramIcon size={16} className="text-luxury-gold" />
                </div>
                <div className="flex flex-col min-w-0" suppressHydrationWarning>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-(--foreground)/40 font-bold">Instagram</span>
                  <span className="text-xs font-bold truncate">Sufyra Fragrance</span>
                </div>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-5 border-t border-(--foreground)/5 flex flex-col md:flex-row justify-between items-center gap-3" suppressHydrationWarning>
          <p className="text-[9px] uppercase tracking-[0.25em] text-(--foreground)/30 font-medium text-center md:text-left" suppressHydrationWarning>
            © {mounted ? new Date().getFullYear() : '2026'} Sufyra Fragrance. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4" suppressHydrationWarning>
            <span className="text-[9px] uppercase tracking-[0.2em] text-(--foreground)/30 hover:text-luxury-gold transition-colors cursor-pointer">Privacy Policy</span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-(--foreground)/30 hover:text-luxury-gold transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;