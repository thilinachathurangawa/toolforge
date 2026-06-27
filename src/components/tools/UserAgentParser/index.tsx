'use client';

import React, { useState, useCallback } from 'react';
import { Globe, Monitor, Laptop, Smartphone, Copy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type DeviceType = 'Desktop' | 'Mobile' | 'Tablet';

interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
}

interface OsInfo {
  name: string;
  version: string;
}

interface DeviceInfo {
  type: DeviceType;
  brand: string;
}

interface ParsedUA {
  browser: BrowserInfo;
  os: OsInfo;
  device: DeviceInfo;
}

function parseUserAgent(ua: string): ParsedUA {
  const browser: BrowserInfo = { name: 'Unknown', version: 'Unknown', engine: 'Unknown' };
  const os: OsInfo = { name: 'Unknown', version: 'Unknown' };
  const device: DeviceInfo = { type: 'Desktop', brand: '' };

  let m: RegExpMatchArray | null;
  if ((m = ua.match(/Edg\/([^\s]+)/))) { browser.name = 'Edge'; browser.version = m[1]; browser.engine = 'Blink'; }
  else if ((m = ua.match(/OPR\/([^\s]+)/))) { browser.name = 'Opera'; browser.version = m[1]; browser.engine = 'Blink'; }
  else if ((m = ua.match(/Chrome\/([^\s]+)/))) { browser.name = 'Chrome'; browser.version = m[1]; browser.engine = 'Blink'; }
  else if ((m = ua.match(/Firefox\/([^\s]+)/))) { browser.name = 'Firefox'; browser.version = m[1]; browser.engine = 'Gecko'; }
  else if ((m = ua.match(/Version\/([^\s]+).*Safari/))) { browser.name = 'Safari'; browser.version = m[1]; browser.engine = 'WebKit'; }
  else if ((m = ua.match(/MSIE ([^\s;]+)/))) { browser.name = 'IE'; browser.version = m[1]; browser.engine = 'Trident'; }

  if ((m = ua.match(/Windows NT ([\d.]+)/))) {
    os.name = 'Windows';
    const v: Record<string, string> = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' };
    os.version = v[m[1]] ?? m[1];
  } else if ((m = ua.match(/Mac OS X ([\d_]+)/))) { os.name = 'macOS'; os.version = m[1].replace(/_/g, '.'); }
  else if ((m = ua.match(/Android ([\d.]+)/))) { os.name = 'Android'; os.version = m[1]; }
  else if ((m = ua.match(/iPhone OS ([\d_]+)/))) { os.name = 'iOS'; os.version = m[1].replace(/_/g, '.'); }
  else if ((m = ua.match(/iPad.*OS ([\d_]+)/))) { os.name = 'iPadOS'; os.version = m[1].replace(/_/g, '.'); }
  else if (/Linux/.test(ua)) { os.name = 'Linux'; os.version = ''; }
  else if (/CrOS/.test(ua)) { os.name = 'ChromeOS'; os.version = ''; }

  if (/Mobile|iPhone|Android.*Mobile/.test(ua)) { device.type = 'Mobile'; }
  else if (/iPad|Tablet|Android(?!.*Mobile)/.test(ua)) { device.type = 'Tablet'; }

  return { browser, os, device };
}

const deviceTypeBadgeClass: Record<DeviceType, string> = {
  Desktop: 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300',
  Mobile: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-300',
  Tablet: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-300',
};

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  rows: { label: string; value: string | React.ReactNode }[];
}

function InfoCard({ icon, title, rows }: InfoCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-sm font-semibold break-all">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserAgentParser() {
  const getMyUA = () => (typeof navigator !== 'undefined' ? navigator.userAgent : '');

  const [uaString, setUaString] = useState<string>(getMyUA);
  const [parsed, setParsed] = useState<ParsedUA>(() => parseUserAgent(getMyUA()));
  const [copied, setCopied] = useState(false);

  const handleParse = useCallback(() => {
    setParsed(parseUserAgent(uaString));
  }, [uaString]);

  const handleUseMyUA = useCallback(() => {
    const ua = getMyUA();
    setUaString(ua);
    setParsed(parseUserAgent(ua));
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(uaString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [uaString]);

  const DeviceIcon = parsed.device.type === 'Mobile' ? Smartphone : parsed.device.type === 'Tablet' ? Laptop : Monitor;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor="ua-input" className="text-sm font-medium">
            User Agent String
          </label>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'Copied!' : 'Copy UA'}
          </button>
        </div>
        <textarea
          id="ua-input"
          rows={4}
          value={uaString}
          onChange={(e) => setUaString(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleParse}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Parse
          </button>
          <button
            onClick={handleUseMyUA}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Use My UA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InfoCard
          icon={<Globe className="h-4 w-4" />}
          title="Browser"
          rows={[
            { label: 'Name', value: parsed.browser.name },
            { label: 'Version', value: parsed.browser.version },
            { label: 'Engine', value: parsed.browser.engine },
          ]}
        />
        <InfoCard
          icon={<Monitor className="h-4 w-4" />}
          title="Operating System"
          rows={[
            { label: 'Name', value: parsed.os.name },
            { label: 'Version', value: parsed.os.version || '—' },
          ]}
        />
        <InfoCard
          icon={<DeviceIcon className="h-4 w-4" />}
          title="Device"
          rows={[
            {
              label: 'Type',
              value: (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                    deviceTypeBadgeClass[parsed.device.type]
                  )}
                >
                  {parsed.device.type}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
