'use client';

import { cn } from '@/lib/utils';
import { AdSlot } from './AdSlot';

interface AdBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
  /** Optional AdSense slot unit ID when monetization is enabled */
  adsenseSlot?: string;
}

export function AdBanner({ position = 'top', className, adsenseSlot }: AdBannerProps) {
  return (
    <div
      className={cn(
        'w-full flex justify-center py-2',
        position === 'top' ? 'pb-4' : 'pt-6',
        className
      )}
      data-ad-position={position}
    >
      <AdSlot format="banner" adsenseSlot={adsenseSlot} className="w-full max-w-[728px]" />
    </div>
  );
}
