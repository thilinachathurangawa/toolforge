'use client';

import { cn } from '@/lib/utils';
import { AdSlot } from './AdSlot';

interface AdBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
  /** Optional AdSense slot unit ID when monetization is enabled */
  adsenseSlot?: string;
  /** Optional Adsterra key when monetization is enabled */
  adsterraKey?: string;
}

export function AdBanner({ position = 'top', className, adsenseSlot, adsterraKey }: AdBannerProps) {
  return (
    <div
      className={cn(
        'w-full flex justify-center py-2',
        position === 'top' ? 'pb-4' : 'pt-6',
        className
      )}
      data-ad-position={position}
    >
      <AdSlot format="banner" adsenseSlot={adsenseSlot} adsterraKey={adsterraKey} className="w-full max-w-[728px]" />
    </div>
  );
}
