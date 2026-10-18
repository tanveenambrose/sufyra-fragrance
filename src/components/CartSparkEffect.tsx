'use client';

import React from 'react';

// Luxury 4-pointed sparkle star SVG
export function SparkleStar({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  );
}

// 8 radiant gold particles arranged radially around the cart/items icon
const SPARK_PARTICLES = [
  { tx: '20px', ty: '-18px', size: 14, delay: '0s', color: '#D4AF37' },
  { tx: '-20px', ty: '-16px', size: 12, delay: '0.04s', color: '#FDE047' },
  { tx: '24px', ty: '6px', size: 10, delay: '0.08s', color: '#F59E0B' },
  { tx: '-22px', ty: '8px', size: 11, delay: '0.05s', color: '#D4AF37' },
  { tx: '14px', ty: '22px', size: 13, delay: '0.12s', color: '#FDE047' },
  { tx: '-14px', ty: '20px', size: 10, delay: '0.09s', color: '#FCD34D' },
  { tx: '0px', ty: '-24px', size: 13, delay: '0.02s', color: '#D4AF37' },
  { tx: '0px', ty: '22px', size: 10, delay: '0.14s', color: '#FDE047' },
];

export default function CartSparkBurst({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-50">
      {/* Expanding gold ripple wave */}
      <span className="absolute w-8 h-8 rounded-full border border-luxury-gold/80 animate-gold-halo pointer-events-none" />
      <span className="absolute w-5 h-5 rounded-full bg-luxury-gold/30 blur-[2px] animate-gold-halo pointer-events-none" style={{ animationDelay: '0.06s' }} />

      {/* Radiant sparkling stars */}
      {SPARK_PARTICLES.map((p, idx) => (
        <span
          key={idx}
          className="absolute animate-spark-pop inline-flex items-center justify-center pointer-events-none drop-shadow-[0_0_8px_rgba(212,175,55,0.9)]"
          style={{
            ['--tx' as string]: p.tx,
            ['--ty' as string]: p.ty,
            animationDelay: p.delay,
            color: p.color,
          }}
        >
          <SparkleStar size={p.size} />
        </span>
      ))}
    </div>
  );
}
