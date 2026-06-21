'use client';

import { useEffect } from 'react';
import { adConfig } from '@/lib/constants/site';
import { AdContextProvider } from './ad-context';

interface AdProviderProps {
  children: React.ReactNode;
}

/**
 * Loads ad network scripts when enabled and provides ad config to child components.
 * GA4 remains in the root layout; this provider handles monetization scripts only.
 */
export function AdProvider({ children }: AdProviderProps) {
  const loadAdsense =
    adConfig.enabled && Boolean(adConfig.adsenseClientId);

  useEffect(() => {
    if (!loadAdsense) return;

    // Load AdSense script using regular script tag to avoid data-nscript attribute issue
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adsenseClientId}`;
    script.crossOrigin = 'anonymous';
    
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [loadAdsense]);

  return (
    <AdContextProvider>
      {children}
    </AdContextProvider>
  );
}
