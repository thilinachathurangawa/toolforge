'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, FileJson, AlertCircle, Upload } from 'lucide-react';

export function HarViewer() {
  const [input, setInput] = useState('');
  const [harData, setHarData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parseHAR = useCallback(() => {
    try {
      setError(null);
      setHarData(null);

      if (!input.trim()) {
        return;
      }

      const data = JSON.parse(input);

      // Validate HAR format
      if (!data.log) {
        throw new Error('Invalid HAR format: missing log object');
      }

      setHarData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid HAR file';
      setError(errorMessage);
      setHarData(null);
    }
  }, [input]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(harData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    parseHAR();
  }, [parseHAR]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">HAR File</label>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors cursor-pointer">
              <Upload size={16} />
              Upload HAR
              <input
                type="file"
                accept=".har,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Or paste HAR content</label>
          <textarea
            placeholder='{"log": {"version": "1.2", ...}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
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
      {harData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">HAR Data</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Summary */}
          {harData.log && (
            <div className="p-4 border border-input rounded-md bg-background space-y-2">
              <div className="text-sm">
                <span className="font-medium">Version:</span> {harData.log.version}
              </div>
              {harData.log.entries && (
                <div className="text-sm">
                  <span className="font-medium">Entries:</span> {harData.log.entries.length}
                </div>
              )}
              {harData.log.pages && (
                <div className="text-sm">
                  <span className="font-medium">Pages:</span> {harData.log.pages.length}
                </div>
              )}
            </div>
          )}

          {/* Entries */}
          {harData.log?.entries && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Requests</label>
              <div className="border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
                {harData.log.entries.slice(0, 20).map((entry: any, index: number) => (
                  <div key={index} className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                    <div className="text-sm font-medium text-foreground">{entry.request?.method}</div>
                    <div className="text-sm text-muted-foreground truncate">{entry.request?.url}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Status: {entry.response?.status} - {entry.response?.statusText}
                    </div>
                  </div>
                ))}
                {harData.log.entries.length > 20 && (
                  <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                    ... and {harData.log.entries.length - 20} more entries
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
