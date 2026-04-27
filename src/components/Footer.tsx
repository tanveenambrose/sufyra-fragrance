'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Mail, 
  Phone, 
  ArrowUp, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';

const FacebookIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
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

const InstagramIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
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

const WhatsAppIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
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
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isAdminPage) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[var(--background)] border-t border-[var(--foreground)]/10 pt-16 pb-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Gradient Blob */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-luxury-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-luxury-bronze/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <div className="relative h-12 w-44">
                <Image
                  src={mounted && theme === 'light' ? "/logo- dark.png" : "/logo.png"}
                  alt="Sufyra Logo"
                  fill
                  sizes="(max-width: 768px) 150px, 180px"
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-[var(--foreground)] font-medium text-sm leading-relaxed max-w-xs">
              Sufyra Fragrance brings you the finest handcrafted attar and perfume oils, blending tradition with modern luxury to create unforgettable scents.
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={scrollToTop}
                className="w-10 h-10 rounded-full border border-[var(--foreground)]/10 flex items-center justify-center text-luxury-gold hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300 group"
                title="Back to Top"
              >
                <ArrowUp size={18} className="group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-luxury-gold font-serif text-lg tracking-wider uppercase">Explore</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-[var(--foreground)] hover:text-luxury-gold transition-colors text-sm font-bold flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[var(--foreground)] hover:text-luxury-gold transition-colors text-sm font-bold flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=perfume-oil" className="text-[var(--foreground)] hover:text-luxury-gold transition-colors text-sm font-bold flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  Regular Versions
                </Link>
              </li>
              <li>
                <Link href="/products?category=combo" className="text-[var(--foreground)] hover:text-luxury-gold transition-colors text-sm font-bold flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  Combo Packs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-6">
            <h4 className="text-luxury-gold font-serif text-lg tracking-wider uppercase">Support</h4>
            <div className="space-y-4">
              <a 
                href="mailto:sufyrafragrance@gmail.com" 
                className="flex items-center gap-3 text-[var(--foreground)]/60 hover:text-luxury-gold transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-luxury-gold/10 border border-[var(--foreground)]/5 transition-colors">
                  <Mail size={18} className="text-luxury-gold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold">Email Us</span>
                  <span className="text-sm">sufyrafragrance@gmail.com</span>
                </div>
              </a>
              <a 
                href="https://wa.me/message/ALWRUNUBV6L3A1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[var(--foreground)]/60 hover:text-luxury-gold transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-luxury-gold/10 border border-[var(--foreground)]/5 transition-colors">
                  <WhatsAppIcon size={18} className="text-luxury-gold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold">WhatsApp</span>
                  <span className="text-sm">+880 1886-141861</span>
                </div>
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h4 className="text-luxury-gold font-serif text-lg tracking-wider uppercase">Socials</h4>
            <div className="space-y-4">
              <a 
                href="https://www.facebook.com/SufyraFragrance/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[var(--foreground)]/60 hover:text-luxury-gold transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-luxury-gold/10 border border-[var(--foreground)]/5 transition-colors">
                  <FacebookIcon size={18} className="text-luxury-gold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold">Facebook</span>
                  <span className="text-sm">Syfura Fragrance</span>
                </div>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
              <a 
                href="https://www.instagram.com/sufyra_fragrance" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[var(--foreground)]/60 hover:text-luxury-gold transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-luxury-gold/10 border border-[var(--foreground)]/5 transition-colors">
                  <InstagramIcon size={18} className="text-luxury-gold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold">Instagram</span>
                  <span className="text-sm">Sufyra Fragrance</span>
                </div>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-[var(--foreground)]/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--foreground)]/20 font-medium text-center md:text-left">
            © {new Date().getFullYear()} Sufyra Fragrance. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]/20 hover:text-luxury-gold transition-colors cursor-pointer">Privacy Policy</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]/20 hover:text-luxury-gold transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
