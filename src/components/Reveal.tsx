'use client';

import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  triggerSelector?: string;
}

export default function Reveal({ children, className = '', triggerSelector = '.reveal' }: RevealProps) {
  const containerRef = useScrollReveal(triggerSelector);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
