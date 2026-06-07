'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, MapPin, Globe, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IPInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  org: string;
  timezone: string;
  latitude: number;
  longitude: number;
  postal: string;
}

export function AddressLookup() {
  const [inputIP, setInputIP] = useState('');
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const lookupIP = async (ip: string) => {
    if (!ip) {
      setError('Please enter an IP address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      if (data.error) {
        setError(data.reason || 'Failed to lookup IP address');
        setIpInfo(null);
      } else {
        setIpInfo(data);
      }
    } catch (err) {
      setError('Failed to lookup IP address. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMyIP = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data.error) {
        setError(data.reason || 'Failed to get your IP address');
      } else {
        setInputIP(data.ip);
        setIpInfo(data);
      }
    } catch (err) {
      setError('Failed to get your IP address. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!ipInfo) return;
    
    const infoText = `IP: ${ipInfo.ip}
City: ${ipInfo.city}
Region: ${ipInfo.region}
Country: ${ipInfo.country} (${ipInfo.country_code})
ISP: ${ipInfo.org}
Timezone: ${ipInfo.timezone}
Lat/Lon: ${ipInfo.latitude}, ${ipInfo.longitude}
Postal: ${ipInfo.postal}`;
    
    navigator.clipboard.writeText(infoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupIP(inputIP);
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">IP Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputIP}
                onChange={(e) => setInputIP(e.target.value)}
                placeholder="Enter IP address or domain"
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                type="button"
                onClick={getMyIP}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
              >
                My IP
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Search size={18} />
            {loading ? 'Looking up...' : 'Lookup'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {ipInfo && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">IP Information</h3>
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Info'}
            </button>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Globe size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">IP Address</p>
                <p className="text-sm font-medium text-foreground break-all">{ipInfo.ip}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <MapPin size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground">
                  {ipInfo.city}, {ipInfo.region}, {ipInfo.country} ({ipInfo.country_code})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Globe size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">ISP / Organization</p>
                <p className="text-sm font-medium text-foreground break-all">{ipInfo.org}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Clock size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Timezone</p>
                <p className="text-sm font-medium text-foreground">{ipInfo.timezone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <MapPin size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Coordinates</p>
                <p className="text-sm font-medium text-foreground">
                  {ipInfo.latitude}, {ipInfo.longitude}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <MapPin size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Postal Code</p>
                <p className="text-sm font-medium text-foreground">{ipInfo.postal}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
