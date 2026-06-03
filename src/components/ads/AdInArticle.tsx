'use client';

import { cn } from '@/lib/utils';
import { AdSlot } from './AdSlot';

interface AdInArticleProps {
  className?: string;
  adsenseSlot?: string;
  adsterraKey?: string;
}

/** In-content ad between tool input and output sections. */
export function AdInArticle({ className, adsenseSlot, adsterraKey }: AdInArticleProps) {
  return (
    <div className={cn('w-full flex justify-center py-6 my-2 border-y border-border/40', className)}>
      <AdSlot format="in-article" adsenseSlot={adsenseSlot} adsterraKey={adsterraKey} className="w-full max-w-[728px]" />
    </div>
  );
}
