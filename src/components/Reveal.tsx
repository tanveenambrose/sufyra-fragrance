'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  triggerSelector?: string;
}

export default function Reveal({ children, className = '', triggerSelector = '.reveal' }: RevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = containerRef.current?.querySelectorAll(triggerSelector);
      
      if (elements) {
        elements.forEach((el) => {
          gsap.fromTo(el as HTMLElement, 
            { y: 20, opacity: 0 },
            {
              scrollTrigger: {
                trigger: el as HTMLElement,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              y: 0,
              opacity: 1,
              duration: 1,
              ease: 'power3.out',
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [triggerSelector]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
