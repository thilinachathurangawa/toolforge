'use client';

import { cn } from '@/lib/utils';
import { AdSlot } from './AdSlot';

interface AdSidebarProps {
  className?: string;
  rectSlot?: string;
  skyscraperSlot?: string;
  adseraRectKey?: string;
  adseraSkyscraperKey?: string;
}

/** Desktop-only sticky sidebar ad stack (300×250 + 300×600). */
export function AdSidebar({ className, rectSlot, skyscraperSlot, adseraRectKey, adseraSkyscraperKey }: AdSidebarProps) {
  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col gap-6 w-[300px] shrink-0',
        className
      )}
      aria-label="Sidebar advertisements"
    >
      <div className="sticky top-24 flex flex-col gap-6">
        <AdSlot format="sidebar-rect" adsenseSlot={rectSlot} adseraKey={adseraRectKey} />
        <AdSlot format="sidebar-skyscraper" adsenseSlot={skyscraperSlot} adseraKey={adseraSkyscraperKey} />
      </div>
    </aside>
  );
}
