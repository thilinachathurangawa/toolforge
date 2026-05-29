'use client';

import { createContext, useContext } from 'react';
import { adConfig } from '@/lib/constants/site';

export interface AdContextValue {
  enabled: boolean;
  adsenseClientId: string;
  adsterraBannerKey: string;
  adsterraSidebarKey: string;
}

const AdContext = createContext<AdContextValue | null>(null);

export function AdContextProvider({ children }: { children: React.ReactNode }) {
  const value: AdContextValue = {
    enabled: adConfig.enabled,
    adsenseClientId: adConfig.adsenseClientId,
    adsterraBannerKey: adConfig.adsterraBannerKey,
    adsterraSidebarKey: adConfig.adsterraSidebarKey,
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within AdProvider');
  }
  return context;
}
