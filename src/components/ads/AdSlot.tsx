'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAds } from './ad-context';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export type AdFormat = 'banner' | 'sidebar-rect' | 'sidebar-skyscraper' | 'in-article';

interface AdSlotProps {
  format: AdFormat;
  /** AdSense ad slot ID (ca-pub slot unit) — required for live AdSense units */
  adsenseSlot?: string;
  /** Adsterra ad key — required for live Adsterra units */
  adsterraKey?: string;
  className?: string;
  label?: string;
}

const FORMAT_CONFIG: Record<
  AdFormat,
  { desktop: string; mobile: string; placeholder: string; width: number; height: number }
> = {
  banner: {
    desktop: '728 × 90',
    mobile: '320 × 50',
    placeholder: 'min-h-[50px] md:min-h-[90px] max-w-[728px]',
    width: 728,
    height: 90,
  },
  'sidebar-rect': {
    desktop: '300 × 250',
    mobile: '',
    placeholder: 'min-h-[250px] w-full max-w-[300px]',
    width: 300,
    height: 250,
  },
  'sidebar-skyscraper': {
    desktop: '300 × 600',
    mobile: '',
    placeholder: 'min-h-[600px] w-full max-w-[300px]',
    width: 300,
    height: 600,
  },
  'in-article': {
    desktop: '728 × 90',
    mobile: '320 × 50',
    placeholder: 'min-h-[50px] md:min-h-[90px] max-w-[728px]',
    width: 728,
    height: 90,
  },
};

export function AdSlot({ format, adsenseSlot, adsterraKey, className, label = 'Advertisement' }: AdSlotProps) {
  const { enabled, adsenseClientId, adsterraBannerKey, adsterraSidebarKey } = useAds();
  const insRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const config = FORMAT_CONFIG[format];

  // Determine which ad network to use
  const showAdSense = enabled && adsenseClientId && adsenseSlot;
  const showAdsterra = enabled && adsterraKey;

  // Map format to Adsterra key
  const getAdsterraKey = () => {
    if (adsterraKey) return adsterraKey;
    if (format === 'banner') return adsterraBannerKey;
    if (format === 'sidebar-rect' || format === 'sidebar-skyscraper') return adsterraSidebarKey;
    return null;
  };

  const adsterraKeyToUse = getAdsterraKey();

  // AdSense loading effect
  useEffect(() => {
    if (!showAdSense || !insRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setIsLoaded(true);
    } catch {
      // Ad blocker or script not ready
    }
  }, [showAdSense]);

  // Adsterra iframe HTML generation
  const generateAdsterraHTML = (key: string, width: number, height: number) => {
    return `<!DOCTYPE html>
<html>
<head>
  <style>body { margin: 0; padding: 0; overflow: hidden; }</style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key': '${key}',
      'format': 'iframe',
      'height': ${height},
      'width': ${width},
      'params': {}
    };
  </script>
  <script type="text/javascript" src="//www.highperformanceformat.com/${key}/invoke.js"></script>
</body>
</html>`;
  };

  // Show AdSense ad
  if (showAdSense) {
    return (
      <div className={cn('w-full flex flex-col items-center gap-1', className)}>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
        <div
          className={cn(
            'w-full flex justify-center overflow-hidden rounded-xl',
            config.placeholder,
            !isLoaded && 'ad-placeholder animate-pulse'
          )}
        >
          <ins
            ref={insRef}
            className="adsbygoogle block w-full"
            style={{ display: 'block' }}
            data-ad-client={adsenseClientId}
            data-ad-slot={adsenseSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Show Adsterra ad
  if (showAdsterra && adsterraKeyToUse) {
    const adHTML = generateAdsterraHTML(adsterraKeyToUse, config.width, config.height);
    
    return (
      <div className={cn('w-full flex flex-col items-center gap-1', className)}>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
        <div
          className={cn(
            'w-full flex justify-center overflow-hidden rounded-xl',
            config.placeholder
          )}
        >
          <iframe
            srcDoc={adHTML}
            style={{ 
              width: format === 'banner' || format === 'in-article' ? '100%' : `${config.width}px`, 
              height: `${config.height}px`, 
              border: 'none', 
              overflow: 'hidden' 
            }}
            scrolling="no"
            frameBorder="0"
            title={`${label} - ${format}`}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  // Show placeholder
  return (
    <div className={cn('w-full flex flex-col items-center gap-1.5', className)}>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <div
        className={cn(
          'ad-placeholder w-full relative overflow-hidden group',
          config.placeholder
        )}
        role="img"
        aria-label={`${label} placeholder`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase text-center px-2">
          {config.desktop}
          {config.mobile && (
            <>
              <span className="hidden md:inline"> · </span>
              <span className="md:hidden">{config.mobile}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
