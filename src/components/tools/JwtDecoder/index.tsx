'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Lock, AlertCircle } from 'lucide-react';

export function JwtDecoder() {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const decodeJWT = useCallback(() => {
    try {
      setError(null);
      setHeader(null);
      setPayload(null);
      setSignature('');

      if (!token.trim()) {
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      const [headerB64, payloadB64, sigB64] = parts;

      // Decode header
      const headerStr = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'));
      setHeader(JSON.parse(headerStr));

      // Decode payload
      const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      setPayload(JSON.parse(payloadStr));

      // Signature (cannot decode without secret, just show base64)
      setSignature(sigB64);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JWT token';
      setError(errorMessage);
      setHeader(null);
      setPayload(null);
      setSignature('');
    }
  }, [token]);

  const copy = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    decodeJWT();
  }, [decodeJWT]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JWT Token</label>
          <textarea
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <button
          onClick={decodeJWT}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <Lock size={16} />
          Decode
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Output */}
      {(header || payload) && (
        <div className="space-y-6">
          {/* Header */}
          {header && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Header</label>
                <button
                  onClick={() => copy(header)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 border border-input rounded-md bg-background">
                <pre className="text-sm font-mono text-foreground">{JSON.stringify(header, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Payload */}
          {payload && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Payload</label>
                <button
                  onClick={() => copy(payload)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 border border-input rounded-md bg-background">
                <pre className="text-sm font-mono text-foreground">
                  {JSON.stringify(payload, null, 2)}
                </pre>
                {payload.exp && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Expires at: {formatTimestamp(payload.exp)}
                    </p>
                  </div>
                )}
                {payload.iat && (
                  <p className="text-sm text-muted-foreground">
                    Issued at: {formatTimestamp(payload.iat)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Signature */}
          {signature && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Signature</label>
              <div className="p-4 border border-input rounded-md bg-background">
                <code className="text-sm font-mono text-foreground break-all">{signature}</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
