'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Filter, AlertCircle } from 'lucide-react';

export function JsonFilter() {
  const [input, setInput] = useState('');
  const [filterKey, setFilterKey] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filterJSON = useCallback(() => {
    try {
      setError(null);
      setOutput('');

      if (!input.trim()) {
        return;
      }

      const data = JSON.parse(input);
      const array = Array.isArray(data) ? data : [data];

      if (!filterKey.trim()) {
        setOutput(JSON.stringify(array, null, 2));
        return;
      }

      const filtered = array.filter((item: any) => {
        const value = item[filterKey];
        if (value === undefined || value === null) return false;
        
        if (filterValue.trim()) {
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        }
        return true;
      });

      setOutput(JSON.stringify(filtered, null, 2));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setOutput('');
    }
  }, [input, filterKey, filterValue]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    filterJSON();
  }, [filterJSON]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JSON Input</label>
          <textarea
            placeholder='[{"name":"John","age":30},{"name":"Jane","age":25}]'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Filter Key</label>
            <input
              type="text"
              placeholder="name"
              value={filterKey}
              onChange={(e) => setFilterKey(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Filter Value (optional)</label>
            <input
              type="text"
              placeholder="John"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        <button
          onClick={filterJSON}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <Filter size={16} />
          Apply Filter
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
      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Filtered Result</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            <pre className="text-sm font-mono text-foreground">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
