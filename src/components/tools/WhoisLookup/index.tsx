'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, FileText, Globe, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhoisInfo {
  domain: string;
  registrar: string;
  createdDate: Date;
  updatedDate: Date;
  expiresDate: Date;
  status: string[];
  nameServers: string[];
  registrant: {
    organization?: string;
    country?: string;
    state?: string;
  };
}

export function WhoisLookup() {
  const [domain, setDomain] = useState('');
  const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const lookupWhois = async () => {
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Using whoisjson.com API (free tier)
      const response = await fetch(`https://whoisjson.com/api/v1/whois?domain_name=${domain}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error_message || 'Failed to lookup WHOIS information');
        setWhoisInfo(null);
      } else {
        const info: WhoisInfo = {
          domain: data.domain_name || domain,
          registrar: data.registrar?.name || 'Unknown',
          createdDate: data.created_date ? new Date(data.created_date) : new Date(),
          updatedDate: data.updated_date ? new Date(data.updated_date) : new Date(),
          expiresDate: data.expires_date ? new Date(data.expires_date) : new Date(),
          status: data.status || [],
          nameServers: data.name_servers || [],
          registrant: {
            organization: data.registrant?.organization,
            country: data.registrant?.country,
            state: data.registrant?.state,
          },
        };
        setWhoisInfo(info);
      }
    } catch (err) {
      setError('Failed to lookup WHOIS information. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!whoisInfo) return;

    const text = `Domain: ${whoisInfo.domain}
Registrar: ${whoisInfo.registrar}
Created: ${whoisInfo.createdDate.toLocaleDateString()}
Updated: ${whoisInfo.updatedDate.toLocaleDateString()}
Expires: ${whoisInfo.expiresDate.toLocaleDateString()}
Status: ${whoisInfo.status.join(', ')}
Name Servers: ${whoisInfo.nameServers.join(', ')}
Registrant: ${whoisInfo.registrant.organization || 'N/A'}
Country: ${whoisInfo.registrant.country || 'N/A'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupWhois();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiresDate: Date) => {
    const today = new Date();
    const diff = expiresDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Domain Name</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              disabled={loading}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Search size={18} />
            {loading ? 'Looking up...' : 'Lookup WHOIS'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {whoisInfo && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">WHOIS Information</h3>
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
                <p className="text-xs text-muted-foreground">Domain</p>
                <p className="text-sm font-medium text-foreground break-all">{whoisInfo.domain}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <FileText size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Registrar</p>
                <p className="text-sm font-medium text-foreground">{whoisInfo.registrar}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Calendar size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(whoisInfo.createdDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Calendar size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(whoisInfo.updatedDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Calendar size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(whoisInfo.expiresDate)}</p>
                </div>
              </div>
            </div>

            {whoisInfo.status.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <FileText size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {whoisInfo.status.map((status, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-0.5 bg-secondary rounded text-foreground"
                      >
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {whoisInfo.nameServers.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Globe size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Name Servers</p>
                  <div className="space-y-1 mt-1">
                    {whoisInfo.nameServers.map((ns, index) => (
                      <p key={index} className="text-sm font-medium text-foreground">
                        • {ns}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(whoisInfo.registrant.organization || whoisInfo.registrant.country) && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <FileText size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Registrant</p>
                  {whoisInfo.registrant.organization && (
                    <p className="text-sm font-medium text-foreground mt-1">
                      Organization: {whoisInfo.registrant.organization}
                    </p>
                  )}
                  {whoisInfo.registrant.country && (
                    <p className="text-sm font-medium text-foreground">
                      Country: {whoisInfo.registrant.country}
                    </p>
                  )}
                  {whoisInfo.registrant.state && (
                    <p className="text-sm font-medium text-foreground">
                      State: {whoisInfo.registrant.state}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Days Until Expiry</p>
              <p
                className={cn(
                  "text-lg font-semibold",
                  getDaysUntilExpiry(whoisInfo.expiresDate) < 30
                    ? "text-red-500"
                    : getDaysUntilExpiry(whoisInfo.expiresDate) < 90
                    ? "text-yellow-500"
                    : "text-green-500"
                )}
              >
                {getDaysUntilExpiry(whoisInfo.expiresDate)} days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
