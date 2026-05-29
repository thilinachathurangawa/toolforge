'use client';

import Script from 'next/script';
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

  return (
    <AdContextProvider>
      {loadAdsense && (
        <Script
          id="adsense-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adsenseClientId}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      )}
      {children}
    </AdContextProvider>
  );
}
