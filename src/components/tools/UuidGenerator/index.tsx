'use client';

import React, { useState, useCallback } from 'react';
import { Copy, RefreshCw, Check, Download } from 'lucide-react';

// Generate UUID v4 using crypto API
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([generateUUID()]);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState(false);

  const generateUuids = useCallback(() => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  }, [count]);

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySingle = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uuids.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Count:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <button
            onClick={generateUuids}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            <RefreshCw size={16} />
            Generate
          </button>
        </div>
      </div>

      {/* UUID List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Generated UUIDs</label>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={download}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        <div className="border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
          {uuids.map((uuid, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
            >
              <code className="text-sm font-mono text-foreground">{uuid}</code>
              <button
                onClick={() => copySingle(uuid)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
