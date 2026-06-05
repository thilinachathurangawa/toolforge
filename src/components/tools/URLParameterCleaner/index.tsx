'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const trackingParameters = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'msclkid',
  'session_id', 'sessionid', 'sid',
  'timestamp', 'ts', 't',
  'ref', 'referrer',
  'click_id', 'clickid',
  'mc_cid', 'mc_eid',
];

interface UrlParameter {
  name: string;
  value: string;
  isTracking: boolean;
  selected: boolean;
}

export function URLParameterCleaner() {
  const [inputUrl, setInputUrl] = useState('');
  const [cleanedUrl, setCleanedUrl] = useState('');
  const [parameters, setParameters] = useState<UrlParameter[]>([]);
  const [whitelist, setWhitelist] = useState('');
  const [blacklist, setBlacklist] = useState('');
  const [copied, setCopied] = useState(false);
  const [removedCount, setRemovedCount] = useState(0);

  const parseUrl = useCallback(() => {
    if (!inputUrl.trim()) {
      setParameters([]);
      return;
    }

    try {
      const urlObj = new URL(inputUrl);
      const params: UrlParameter[] = [];
      
      urlObj.searchParams.forEach((value, name) => {
        const isTracking = trackingParameters.includes(name.toLowerCase()) || 
                          blacklist.toLowerCase().split(',').map(s => s.trim()).includes(name.toLowerCase());
        params.push({
          name,
          value,
          isTracking,
          selected: isTracking,
        });
      });
      
      setParameters(params);
    } catch (e) {
      setParameters([]);
    }
  }, [inputUrl, blacklist]);

  const cleanUrl = useCallback(() => {
    if (!inputUrl.trim()) {
      setCleanedUrl('');
      return;
    }

    try {
      const urlObj = new URL(inputUrl);
      const whitelistItems = whitelist.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
      const blacklistItems = blacklist.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
      
      let removed = 0;
      
      parameters.forEach(param => {
        const shouldRemove = param.selected || 
                            blacklistItems.includes(param.name.toLowerCase()) ||
                            (param.isTracking && !whitelistItems.includes(param.name.toLowerCase()));
        
        if (shouldRemove) {
          urlObj.searchParams.delete(param.name);
          removed++;
        }
      });
      
      setCleanedUrl(urlObj.toString());
      setRemovedCount(removed);
    } catch (e) {
      setCleanedUrl(inputUrl);
      setRemovedCount(0);
    }
  }, [inputUrl, parameters, whitelist, blacklist]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputUrl('');
    setCleanedUrl('');
    setParameters([]);
    setWhitelist('');
    setBlacklist('');
    setRemovedCount(0);
  };

  const toggleParameter = (index: number) => {
    const newParams = [...parameters];
    newParams[index].selected = !newParams[index].selected;
    setParameters(newParams);
  };

  const selectAllTracking = () => {
    const newParams = parameters.map(p => ({
      ...p,
      selected: p.isTracking
    }));
    setParameters(newParams);
  };

  const deselectAll = () => {
    const newParams = parameters.map(p => ({ ...p, selected: false }));
    setParameters(newParams);
  };

  const selectAll = () => {
    const newParams = parameters.map(p => ({ ...p, selected: true }));
    setParameters(newParams);
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Input URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Input URL</label>
          <textarea
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onBlur={parseUrl}
            placeholder="Paste your URL with parameters here..."
            rows={3}
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none font-mono text-sm"
          />
        </div>

        {/* Detected Parameters */}
        {parameters.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Detected Parameters ({parameters.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllTracking}
                  className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                >
                  Select Tracking
                </button>
                <button
                  onClick={selectAll}
                  className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {parameters.map((param, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    param.isTracking ? "bg-red-50/50 border-red-200 dark:bg-red-900/20 dark:border-red-800" : "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={param.selected}
                      onChange={() => toggleParameter(index)}
                      className="rounded accent-accent"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground font-mono">{param.name}</span>
                        {param.isTracking && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded dark:bg-red-900/30 dark:text-red-400">
                            Tracking
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{param.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Filter */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">Custom Filter</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Whitelist (comma-separated)</label>
            <input
              type="text"
              value={whitelist}
              onChange={(e) => setWhitelist(e.target.value)}
              placeholder="id, ref, page"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Blacklist (comma-separated)</label>
            <input
              type="text"
              value={blacklist}
              onChange={(e) => setBlacklist(e.target.value)}
              placeholder="fbclid, gclid, utm_*"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Clean Button */}
        <button
          onClick={cleanUrl}
          disabled={!inputUrl.trim()}
          className="w-full px-4 py-3 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clean URL
        </button>
      </div>

      {/* Output Section */}
      {cleanedUrl && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Cleaned URL</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Removed: {removedCount} parameters</span>
              <div className="flex gap-2">
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
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Trash2 size={16} />
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-foreground font-mono break-all">{cleanedUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
}
