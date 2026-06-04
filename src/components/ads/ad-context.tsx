'use client';

import { createContext, useContext } from 'react';
import { adConfig } from '@/lib/constants/site';

export interface AdContextValue {
  enabled: boolean;
  adsenseClientId: string;
  adsterraBannerKey: string;
  adsterraSidebarRectKey: string;
  adsterraSidebarSkyscraperKey: string;
  adseraSidebarRectKey: string;
  adseraSidebarSkyscraperKey: string;
}

const AdContext = createContext<AdContextValue | null>(null);

export function AdContextProvider({ children }: { children: React.ReactNode }) {
  const value: AdContextValue = {
    enabled: adConfig.enabled,
    adsenseClientId: adConfig.adsenseClientId,
    adsterraBannerKey: adConfig.adsterraBannerKey,
    adsterraSidebarRectKey: adConfig.adsterraSidebarRectKey,
    adsterraSidebarSkyscraperKey: adConfig.adsterraSidebarSkyscraperKey,
    adseraSidebarRectKey: adConfig.adseraSidebarRectKey,
    adseraSidebarSkyscraperKey: adConfig.adseraSidebarSkyscraperKey,
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
