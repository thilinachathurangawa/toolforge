'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';

interface HeaderAnalysis {
  name: string;
  present: boolean;
  value?: string;
  recommendation: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export function SecurityHeaderAnalyzer() {
  const [input, setInput] = useState('');
  const [analyses, setAnalyses] = useState<HeaderAnalysis[]>([]);
  const [copied, setCopied] = useState(false);

  const securityHeaders: { name: string; recommendation: string; severity: HeaderAnalysis['severity'] }[] = [
    {
      name: 'Content-Security-Policy',
      recommendation: 'Implement a strict CSP to prevent XSS attacks',
      severity: 'critical',
    },
    {
      name: 'Strict-Transport-Security',
      recommendation: 'Enable HSTS to enforce HTTPS connections',
      severity: 'high',
    },
    {
      name: 'X-Frame-Options',
      recommendation: 'Use to prevent clickjacking attacks',
      severity: 'high',
    },
    {
      name: 'X-Content-Type-Options',
      recommendation: 'Set to nosniff to prevent MIME sniffing',
      severity: 'medium',
    },
    {
      name: 'X-XSS-Protection',
      recommendation: 'Enable XSS filter (though CSP is preferred)',
      severity: 'medium',
    },
    {
      name: 'Referrer-Policy',
      recommendation: 'Control referrer information leakage',
      severity: 'medium',
    },
    {
      name: 'Permissions-Policy',
      recommendation: 'Control browser features and APIs',
      severity: 'medium',
    },
    {
      name: 'Cache-Control',
      recommendation: 'Set appropriate caching directives for sensitive data',
      severity: 'low',
    },
  ];

  const analyzeHeaders = useCallback(() => {
    const results: HeaderAnalysis[] = [];

    // Parse headers (format: "Header-Name: value")
    const headerLines = input.split('\n').filter(line => line.trim());
    const headerMap = new Map<string, string>();

    headerLines.forEach(line => {
      const [name, ...valueParts] = line.split(':');
      if (name && valueParts.length > 0) {
        headerMap.set(name.trim(), valueParts.join(':').trim());
      }
    });

    securityHeaders.forEach(header => {
      const present = headerMap.has(header.name);
      results.push({
        name: header.name,
        present,
        value: headerMap.get(header.name),
        recommendation: header.recommendation,
        severity: header.severity,
      });
    });

    setAnalyses(results);
  }, [input]);

  const copy = () => {
    const text = analyses.map(a => {
      const status = a.present ? '✓' : '✗';
      return `${status} ${a.name}: ${a.recommendation}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    analyzeHeaders();
  }, [analyzeHeaders]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const presentCount = analyses.filter(a => a.present).length;
  const score = Math.round((presentCount / analyses.length) * 100);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">HTTP Headers</label>
          <textarea
            placeholder="Content-Security-Policy: default-src 'self'&#10;Strict-Transport-Security: max-age=31536000"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <button
          onClick={analyzeHeaders}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <ShieldCheck size={16} />
          Analyze
        </button>
      </div>

      {/* Score */}
      {analyses.length > 0 && (
        <div className="p-4 border border-input rounded-md bg-background">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Security Score</span>
            <span className="text-2xl font-bold text-accent">{score}%</span>
          </div>
          <div className="mt-2 w-full bg-secondary rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {presentCount} of {analyses.length} security headers present
          </div>
        </div>
      )}

      {/* Analysis */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Header Analysis</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            {analyses.map((analysis, index) => (
              <div
                key={index}
                className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                  !analysis.present ? 'bg-destructive/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${analysis.present ? 'text-green-500' : 'text-red-500'}`}>
                    {analysis.present ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{analysis.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${getSeverityColor(analysis.severity)}`}>
                        {analysis.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{analysis.recommendation}</p>
                    {analysis.value && (
                      <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                        {analysis.value}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
