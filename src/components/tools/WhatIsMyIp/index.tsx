'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Wifi, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IpResult {
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

interface IpState {
  ipv4: IpResult;
  ipv6: IpResult;
}

const INITIAL_RESULT: IpResult = { address: null, isLoading: true, error: null };

async function fetchIpv4(): Promise<string> {
  const res = await fetch('https://api.ipify.org?format=json');
  if (!res.ok) throw new Error('Failed to fetch');
  const data: { ip: string } = await res.json();
  return data.ip;
}

async function fetchIpv6(): Promise<string> {
  const res = await fetch('https://api6.ipify.org?format=json');
  if (!res.ok) throw new Error('Failed to fetch');
  const data: { ip: string } = await res.json();
  return data.ip;
}

export function WhatIsMyIp() {
  const [state, setState] = useState<IpState>({
    ipv4: { ...INITIAL_RESULT },
    ipv6: { ...INITIAL_RESULT },
  });
  const [copiedV4, setCopiedV4] = useState(false);
  const [copiedV6, setCopiedV6] = useState(false);

  const fetchAll = useCallback(() => {
    setState({ ipv4: { ...INITIAL_RESULT }, ipv6: { ...INITIAL_RESULT } });

    fetchIpv4()
      .then(address =>
        setState(prev => ({ ...prev, ipv4: { address, isLoading: false, error: null } }))
      )
      .catch(() =>
        setState(prev => ({
          ...prev,
          ipv4: { address: null, isLoading: false, error: 'Not available' },
        }))
      );

    fetchIpv6()
      .then(address =>
        setState(prev => ({ ...prev, ipv6: { address, isLoading: false, error: null } }))
      )
      .catch(() =>
        setState(prev => ({
          ...prev,
          ipv6: { address: null, isLoading: false, error: 'Not available' },
        }))
      );
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const copyToClipboard = useCallback(
    async (text: string, type: 'v4' | 'v6') => {
      await navigator.clipboard.writeText(text);
      if (type === 'v4') {
        setCopiedV4(true);
        setTimeout(() => setCopiedV4(false), 2000);
      } else {
        setCopiedV6(true);
        setTimeout(() => setCopiedV6(false), 2000);
      }
    },
    []
  );

  const isRefreshing = state.ipv4.isLoading || state.ipv6.isLoading;

  return (
    <div className="flex flex-col items-center gap-8 py-8 px-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Wifi className="h-5 w-5" />
        <span className="text-sm font-medium uppercase tracking-widest">Your Public IP Addresses</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* IPv4 Card */}
        <IpCard
          label="IPv4"
          result={state.ipv4}
          badgeClass="bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300"
          copied={copiedV4}
          onCopy={addr => copyToClipboard(addr, 'v4')}
        />

        {/* IPv6 Card */}
        <IpCard
          label="IPv6"
          result={state.ipv6}
          badgeClass="bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-300"
          copied={copiedV6}
          onCopy={addr => copyToClipboard(addr, 'v6')}
          notAvailableMessage="Your connection does not have an IPv6 address."
        />
      </div>

      <button
        onClick={fetchAll}
        disabled={isRefreshing}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
        Refresh Both
      </button>

      <p className="text-xs text-muted-foreground text-center max-w-md">
        Addresses are retrieved via api.ipify.org and api6.ipify.org — your publicly visible addresses.
        IPv6 shows "Not available" if your network or ISP does not assign one.
      </p>
    </div>
  );
}

interface IpCardProps {
  label: string;
  result: IpResult;
  badgeClass: string;
  copied: boolean;
  onCopy: (addr: string) => void;
  notAvailableMessage?: string;
}

function IpCard({ label, result, badgeClass, copied, onCopy, notAvailableMessage }: IpCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-border bg-card shadow-sm">
      <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset', badgeClass)}>
        {label}
      </span>

      {result.isLoading ? (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="h-8 w-full max-w-[240px] rounded-lg bg-muted animate-pulse" />
        </div>
      ) : result.address ? (
        <>
          <span className="text-2xl md:text-3xl font-mono font-bold tracking-tight break-all text-center leading-tight">
            {result.address}
          </span>
          <button
            onClick={() => onCopy(result.address!)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          {notAvailableMessage ?? result.error ?? 'Not available'}
        </p>
      )}
    </div>
  );
}
