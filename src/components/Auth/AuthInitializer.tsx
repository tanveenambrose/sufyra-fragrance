'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthInitializer() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthParams = async () => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        console.error('Auth error detected:', error, errorDescription);
      }

      if (code) {
        console.log('Universal Auth Handler: Detecting code, exchanging...');
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (!exchangeError) {
            console.log('Universal Auth Handler: Success!');
            // Clean up the URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            
            // Refresh to ensure all components see the new session
            router.refresh();
          } else {
            console.error('Universal Auth Handler: Exchange failed', exchangeError);
          }
        } catch (err) {
          console.error('Universal Auth Handler: Unexpected error', err);
        }
      }
    };

    handleAuthParams();
  }, [router]);

  return null; // This component doesn't render anything
}
