import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Mail } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Sufyra Fragrance',
  description: 'Privacy policy and data governance practices at Sufyra Fragrance.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-(--background) pt-24 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-luxury-gold hover:text-luxury-gold/70 transition-colors font-bold mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Sanctuary
        </Link>

        {/* Header Card */}
        <div className="luxury-card p-8 sm:p-12 rounded-3xl border border-luxury-gold/20 mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold/30 bg-luxury-gold/10">
            <ShieldCheck size={14} className="text-luxury-gold" />
            <span className="text-[9px] uppercase tracking-[0.25em] text-luxury-gold font-bold">
              Legal Sanctuary &amp; Governance
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-(--foreground) tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs uppercase tracking-widest text-luxury-gold font-bold">
            Last Updated: November 2026 • Sufyra Fragrance
          </p>
          <p className="text-sm text-(--foreground)/70 leading-relaxed font-sans pt-2">
            At Sufyra Fragrance, we treat the confidentiality of our patrons with the same reverence and meticulous care as our artisanal attar formulations. This Privacy Policy details how we collect, safeguard, and honor your personal information.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-(--foreground)/80 leading-relaxed font-sans">
          <section className="luxury-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-3">
            <h2 className="text-base font-serif text-(--foreground) font-bold flex items-center gap-2">
              <Lock size={16} className="text-luxury-gold" />
              1. Information We Collect
            </h2>
            <p>
              When you visit our boutique, create a patron account, or acquire a fragrance, we may collect:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-(--foreground)/70">
              <li><strong>Contact Details:</strong> Your full name, email address, delivery destination, and phone number for order fulfillment and courier communication.</li>
              <li><strong>Authentication Data:</strong> Login credentials or identity provider tokens when you register using Google or Facebook OAuth.</li>
              <li><strong>Order Manifests:</strong> Scent selections, bottle sizes (3ml, 6ml, bespoke sets), and transactional history.</li>
            </ul>
          </section>

          <section className="luxury-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-3">
            <h2 className="text-base font-serif text-(--foreground) font-bold flex items-center gap-2">
              <Eye size={16} className="text-luxury-gold" />
              2. How We Utilize Your Data
            </h2>
            <p>
              Your data is strictly utilized to elevate your personal fragrance experience:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-(--foreground)/70">
              <li>Processing and delivering your artisanal perfumery orders nationwide via Cash on Delivery.</li>
              <li>Dispatching procurement status notifications, tracking numbers, and bespoke welcome packages.</li>
              <li>Providing dedicated WhatsApp concierge assistance regarding scent notes and olfactory profiles.</li>
              <li><strong>Zero Data Selling:</strong> We never sell, rent, monetize, or trade patron records to third-party advertisers.</li>
            </ul>
          </section>

          <section className="luxury-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-3">
            <h2 className="text-base font-serif text-(--foreground) font-bold flex items-center gap-2">
              <ShieldCheck size={16} className="text-luxury-gold" />
              3. Meta (Facebook) &amp; Google Sign-In
            </h2>
            <p>
              When using Facebook Login or Google Sign-In, we only request basic profile permissions (your name and verified email address) to authenticate your access securely. You may revoke access at any time through your Facebook Account Settings.
            </p>
            <p className="text-xs text-luxury-gold">
              For instructions on deleting your authentication records, visit our <Link href="/data-deletion" className="underline font-bold hover:text-luxury-gold/80">User Data Deletion Page</Link>.
            </p>
          </section>

          <section className="luxury-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-3">
            <h2 className="text-base font-serif text-(--foreground) font-bold flex items-center gap-2">
              <Mail size={16} className="text-luxury-gold" />
              4. Concierge &amp; Inquiries
            </h2>
            <p>
              If you have any questions regarding your data privacy or wish to update your records, please contact our concierge:
            </p>
            <div className="pt-2 text-xs space-y-1 text-(--foreground)/70">
              <p><strong>Email:</strong> <a href="mailto:sufyrafragrance@gmail.com" className="text-luxury-gold hover:underline">sufyrafragrance@gmail.com</a></p>
              <p><strong>WhatsApp Concierge:</strong> <a href="https://wa.me/8801886141861" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:underline">+880 1886-141861</a></p>
              <p><strong>Sanctuary:</strong> Sufyra Fragrance, Dhaka, Bangladesh</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
