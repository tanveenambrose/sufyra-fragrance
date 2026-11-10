import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'User Data Deletion Instructions | Sufyra Fragrance',
  description: 'Step-by-step instructions for deleting your user data from Sufyra Fragrance.',
};

export default function DataDeletionPage() {
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
            <Trash2 size={14} className="text-luxury-gold" />
            <span className="text-[9px] uppercase tracking-[0.25em] text-luxury-gold font-bold">
              Meta Platform Policy &amp; Data Rights
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-(--foreground) tracking-tight">
            User Data Deletion Instructions
          </h1>
          <p className="text-xs uppercase tracking-widest text-luxury-gold font-bold">
            Sufyra Fragrance Patron Protection
          </p>
          <p className="text-sm text-(--foreground)/70 leading-relaxed font-sans pt-2">
            In compliance with Meta (Facebook) Platform policies, GDPR, and international privacy standards, patrons have the right to request deletion of any personal data associated with their Sufyra Fragrance account at any time.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-6 text-sm text-(--foreground)/80 leading-relaxed font-sans">
          {/* Method 1 */}
          <section className="luxury-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-4">
            <h2 className="text-base font-serif text-(--foreground) font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-luxury-gold" />
              Method 1: Revoke Facebook App Permissions via Facebook
            </h2>
            <p className="text-xs sm:text-sm text-(--foreground)/70">
              If you signed up or logged in using your Facebook account, you can remove Sufyra Fragrance directly from your Meta settings:
            </p>
            <ol className="list-decimal list-inside space-y-2 pl-2 text-xs sm:text-sm text-(--foreground)/75">
              <li>Log in to your Facebook account and navigate to <strong>Settings &amp; Privacy &rarr; Settings</strong>.</li>
              <li>In the left sidebar, click on <strong>Apps and Websites</strong>.</li>
              <li>Find <strong>Sufyra Fragrance</strong> in the list of active applications.</li>
              <li>Click <strong>Remove</strong> to revoke all access and permissions.</li>
              <li>Check the box to request that Facebook delete all historical interactions and data shared with the app.</li>
            </ol>
          </section>

          {/* Method 2 */}
          <section className="luxury-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-4">
            <h2 className="text-base font-serif text-(--foreground) font-bold flex items-center gap-2">
              <Mail size={16} className="text-luxury-gold" />
              Method 2: Direct Sanctuary Deletion Request
            </h2>
            <p className="text-xs sm:text-sm text-(--foreground)/70">
              To permanently erase your profile, order history, and contact information from our central database:
            </p>
            <div className="bg-white/2 border border-luxury-gold/20 p-4 rounded-xl space-y-2 text-xs text-(--foreground)/80">
              <p>
                Send an email from your registered email address to:
              </p>
              <p className="font-mono text-luxury-gold font-bold text-sm">
                sufyrafragrance@gmail.com
              </p>
              <p className="text-(--foreground)/60">
                <strong>Subject Line:</strong> Data Deletion Request - [Your Name]
              </p>
              <p className="text-(--foreground)/60">
                Our security desk will process your manifest erasure within 48 business hours and provide confirmation via email.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="luxury-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-3">
            <h2 className="text-base font-serif text-(--foreground) font-bold flex items-center gap-2">
              <ShieldCheck size={16} className="text-luxury-gold" />
              Concierge Assistance
            </h2>
            <p className="text-xs sm:text-sm text-(--foreground)/70">
              For immediate support regarding account privacy, contact our master perfumery concierge via WhatsApp at{' '}
              <a
                href="https://wa.me/8801886141861"
                target="_blank"
                rel="noopener noreferrer"
                className="text-luxury-gold hover:underline font-semibold"
              >
                +880 1886-141861
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
