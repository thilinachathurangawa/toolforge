'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Globe, Cpu, WifiOff, Wifi, Copy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrowserScreenData {
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  outerWidth: number;
  outerHeight: number;
  language: string;
  languages: string;
  cookiesEnabled: boolean;
  onlineStatus: boolean;
  platform: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  doNotTrack: string;
}

function collectInfo(): BrowserScreenData {
  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    language: navigator.language,
    languages: navigator.languages?.join(', ') ?? navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency ?? 0,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    doNotTrack: navigator.doNotTrack ?? 'unspecified',
  };
}

interface DataCardProps {
  label: string;
  value: React.ReactNode;
}

function DataCard({ label, value }: DataCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold break-all">{value}</span>
    </div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{children}</div>
    </div>
  );
}

export function BrowserScreenInfo() {
  const [data, setData] = useState<BrowserScreenData | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => {
    setData(collectInfo());
  }, []);

  useEffect(() => {
    setData(collectInfo());

    const handleResize = () => {
      setData(prev => {
        if (!prev) return collectInfo();
        return {
          ...prev,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight,
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Loading browser information...
      </div>
    );
  }

  const statusBadge = (active: boolean, activeLabel: string, inactiveLabel: string) => (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        active
          ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-300'
          : 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-300'
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );

  return (
    <div className="flex flex-col gap-8 py-6 px-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Browser &amp; Screen Info</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <Section icon={<Monitor className="h-4 w-4" />} title="Screen & Display">
        <DataCard label="Screen Resolution" value={`${data.screenWidth} × ${data.screenHeight}`} />
        <DataCard label="Available Area" value={`${data.availWidth} × ${data.availHeight}`} />
        <DataCard label="Color Depth" value={`${data.colorDepth}-bit`} />
        <DataCard label="Pixel Depth" value={`${data.pixelDepth}-bit`} />
        <DataCard label="Device Pixel Ratio" value={`${data.devicePixelRatio}×`} />
        <DataCard label="Viewport Size" value={`${data.viewportWidth} × ${data.viewportHeight}`} />
        <DataCard label="Outer Window" value={`${data.outerWidth} × ${data.outerHeight}`} />
      </Section>

      <Section icon={<Globe className="h-4 w-4" />} title="Browser & System">
        <DataCard label="Language" value={data.language} />
        <DataCard
          label="All Languages"
          value={
            <span className="block truncate max-w-full" title={data.languages}>
              {data.languages}
            </span>
          }
        />
        <DataCard label="Cookies" value={statusBadge(data.cookiesEnabled, 'Enabled', 'Disabled')} />
        <DataCard
          label="Network"
          value={
            <span className="inline-flex items-center gap-1">
              {data.onlineStatus ? (
                <Wifi className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-red-600" />
              )}
              {statusBadge(data.onlineStatus, 'Online', 'Offline')}
            </span>
          }
        />
        <DataCard label="Platform" value={data.platform} />
        <DataCard
          label="CPU Threads"
          value={
            <span className="inline-flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
              {`${data.hardwareConcurrency} cores`}
            </span>
          }
        />
        <DataCard label="Touch Points" value={String(data.maxTouchPoints)} />
        <DataCard label="Do Not Track" value={data.doNotTrack} />
      </Section>
    </div>
  );
}
