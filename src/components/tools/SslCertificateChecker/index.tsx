'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, Shield, Calendar, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CertificateInfo {
  grade: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  daysUntilExpiry: number;
  protocol: string;
  chain: string[];
}

export function SslCertificateChecker() {
  const [domain, setDomain] = useState('');
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const checkSSL = async () => {
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Using SSL Labs API
      const response = await fetch(
        `https://api.ssllabs.com/api/v3/analyze?host=${domain}&startNew=on&fromCache=on&maxAge=24`
      );
      const data = await response.json();

      if (data.status === 'ERROR') {
        setError(data.message || 'Failed to analyze SSL certificate');
        setCertInfo(null);
        return;
      }

      if (data.status === 'IN_PROGRESS' || data.status === 'DNS') {
        setError('Analysis in progress. Please try again in a few seconds.');
        setCertInfo(null);
        return;
      }

      if (data.status === 'READY' && data.endpoints && data.endpoints.length > 0) {
        const endpoint = data.endpoints[0];
        const details = endpoint.details;

        const info: CertificateInfo = {
          grade: endpoint.grade || 'N/A',
          issuer: details.cert?.issuer?.[0]?.value || 'Unknown',
          subject: details.cert?.subject?.[0]?.value || domain,
          validFrom: details.cert?.validFrom ? new Date(details.cert.validFrom) : new Date(),
          validTo: details.cert?.validTo ? new Date(details.cert.validTo) : new Date(),
          daysUntilExpiry: 0,
          protocol: details.protocol || 'Unknown',
          chain: details.chain?.certificates?.map((c: any) => c.subject?.[0]?.value || 'Unknown') || [],
        };

        info.daysUntilExpiry = Math.ceil(
          (info.validTo.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        setCertInfo(info);
      } else {
        setError('Failed to analyze SSL certificate. Please try again.');
        setCertInfo(null);
      }
    } catch (err) {
      setError('Failed to analyze SSL certificate. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!certInfo) return;

    const text = `Domain: ${domain}
Grade: ${certInfo.grade}
Issuer: ${certInfo.issuer}
Subject: ${certInfo.subject}
Valid From: ${certInfo.validFrom.toLocaleDateString()}
Valid To: ${certInfo.validTo.toLocaleDateString()}
Days Until Expiry: ${certInfo.daysUntilExpiry}
Protocol: ${certInfo.protocol}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkSSL();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade.startsWith('B')) return 'text-yellow-500';
    if (grade.startsWith('C')) return 'text-orange-500';
    return 'text-red-500';
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
            {loading ? 'Analyzing...' : 'Check SSL'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {certInfo && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">SSL Certificate</h3>
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
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Grade</p>
                <p className={cn("text-2xl font-bold", getGradeColor(certInfo.grade))}>
                  {certInfo.grade}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Lock size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Issuer</p>
                <p className="text-sm font-medium text-foreground break-all">{certInfo.issuer}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Lock size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="text-sm font-medium text-foreground break-all">{certInfo.subject}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Calendar size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Valid From</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(certInfo.validFrom)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Calendar size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Valid To</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(certInfo.validTo)}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Days Until Expiry</p>
              <p
                className={cn(
                  "text-lg font-semibold",
                  certInfo.daysUntilExpiry < 30
                    ? "text-red-500"
                    : certInfo.daysUntilExpiry < 90
                    ? "text-yellow-500"
                    : "text-green-500"
                )}
              >
                {certInfo.daysUntilExpiry} days
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Lock size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Protocol</p>
                <p className="text-sm font-medium text-foreground">{certInfo.protocol}</p>
              </div>
            </div>

            {certInfo.chain.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Shield size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Certificate Chain</p>
                  <div className="space-y-1 mt-1">
                    {certInfo.chain.map((cert, index) => (
                      <p key={index} className="text-sm font-medium text-foreground">
                        • {cert}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
