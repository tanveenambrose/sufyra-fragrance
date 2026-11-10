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

const FacebookIcon = ({ size = 15, className = "" }: { size?: number, className?: string }) => (
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

const InstagramIcon = ({ size = 15, className = "" }: { size?: number, className?: string }) => (
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

const WhatsAppIcon = ({ size = 15, className = "" }: { size?: number, className?: string }) => (
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
    <footer className="bg-(--background) border-t border-(--foreground)/10 pt-7 sm:pt-10 pb-5 sm:pb-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Gradient Blob */}
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-luxury-gold/5 rounded-full blur-[80px] pointer-events-none" suppressHydrationWarning />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-luxury-bronze/5 rounded-full blur-[80px] pointer-events-none" suppressHydrationWarning />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" suppressHydrationWarning>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 mb-6 sm:mb-8" suppressHydrationWarning>
          {/* Brand Section - Spans full width on mobile */}
          <div className="col-span-2 lg:col-span-1 space-y-3" suppressHydrationWarning>
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-block transition-transform hover:scale-105">
                <div className="relative h-8 w-32" suppressHydrationWarning>
                  <Image
                    src={mounted && theme === 'light' ? "/logo-dark.png" : "/logo.png"}
                    alt="Sufyra Logo"
                    fill
                    sizes="(max-width: 768px) 120px, 140px"
                    className="object-contain"
                  />
                </div>
              </Link>
              <button 
                onClick={scrollToTop}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-(--foreground)/15 flex items-center justify-center text-luxury-gold hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300 group"
                title="Back to Top"
              >
                <ArrowUp size={13} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <p className="text-(--foreground)/70 font-medium text-[11px] sm:text-xs leading-relaxed max-w-sm">
              Handcrafted attar and concentrated perfume oils blending royal tradition with modern sophistication.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 space-y-2.5">
            <h4 className="text-luxury-gold font-serif text-xs sm:text-sm tracking-wider uppercase font-bold">Explore</h4>
            <ul className="space-y-1.5 text-[11px] sm:text-xs">
              <li>
                <Link href="/" className="text-(--foreground)/80 hover:text-luxury-gold transition-colors font-medium flex items-center gap-1.5 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-(--foreground)/80 hover:text-luxury-gold transition-colors font-medium flex items-center gap-1.5 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=perfume-oil" className="text-(--foreground)/80 hover:text-luxury-gold transition-colors font-medium flex items-center gap-1.5 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  Regular Scents
                </Link>
              </li>
              <li>
                <Link href="/products?category=combo" className="text-(--foreground)/80 hover:text-luxury-gold transition-colors font-medium flex items-center gap-1.5 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  Combo Packs
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="col-span-1 space-y-2.5">
            <h4 className="text-luxury-gold font-serif text-xs sm:text-sm tracking-wider uppercase font-bold">Socials</h4>
            <ul className="space-y-2 text-[11px] sm:text-xs" suppressHydrationWarning>
              <li>
                <a 
                  href="https://www.facebook.com/SufyraFragrance/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-(--foreground)/80 hover:text-luxury-gold transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-(--foreground)/5 flex items-center justify-center text-luxury-gold shrink-0 border border-(--foreground)/10">
                    <FacebookIcon size={12} />
                  </div>
                  <span className="font-medium truncate">Facebook</span>
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/sufyra_fragrance" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-(--foreground)/80 hover:text-luxury-gold transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-(--foreground)/5 flex items-center justify-center text-luxury-gold shrink-0 border border-(--foreground)/10">
                    <InstagramIcon size={12} />
                  </div>
                  <span className="font-medium truncate">Instagram</span>
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Support - Spans full width on mobile */}
          <div className="col-span-2 lg:col-span-1 space-y-2.5">
            <h4 className="text-luxury-gold font-serif text-xs sm:text-sm tracking-wider uppercase font-bold">Concierge Support</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2" suppressHydrationWarning>
              <a 
                href="mailto:sufyrafragrance@gmail.com" 
                className="flex items-center gap-2 p-2 rounded-xl bg-(--foreground)/3 hover:bg-(--foreground)/6 border border-(--foreground)/10 transition-all text-(--foreground) hover:text-luxury-gold group"
              >
                <div className="w-7 h-7 rounded-lg bg-(--foreground)/5 flex items-center justify-center group-hover:bg-luxury-gold/20 text-luxury-gold shrink-0 border border-(--foreground)/10">
                  <Mail size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[7.5px] uppercase tracking-wider text-(--foreground)/50 font-bold">Email Us</span>
                  <span className="text-[11px] font-semibold truncate">sufyrafragrance@gmail.com</span>
                </div>
              </a>

              <a 
                href="https://wa.me/8801886141861" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-(--foreground)/3 hover:bg-(--foreground)/6 border border-(--foreground)/10 transition-all text-(--foreground) hover:text-luxury-gold group"
              >
                <div className="w-7 h-7 rounded-lg bg-(--foreground)/5 flex items-center justify-center group-hover:bg-luxury-gold/20 text-luxury-gold shrink-0 border border-(--foreground)/10">
                  <WhatsAppIcon size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[7.5px] uppercase tracking-wider text-(--foreground)/50 font-bold">WhatsApp Concierge</span>
                  <span className="text-[11px] font-semibold truncate">+880 1886-141861</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-4 border-t border-(--foreground)/10 flex flex-col sm:flex-row justify-between items-center gap-2" suppressHydrationWarning>
          <p className="text-[9px] uppercase tracking-[0.2em] text-(--foreground)/40 font-medium text-center sm:text-left" suppressHydrationWarning>
            © {new Date().getFullYear()} Sufyra Fragrance. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-(--foreground)/40 font-semibold" suppressHydrationWarning>
            <span>Handcrafted in Bangladesh</span>
            <span>•</span>
            <span>Pure Oil Extracts</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
