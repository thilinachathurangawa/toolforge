'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Search, AlertCircle } from 'lucide-react';

export function JsonPathFinder() {
  const [input, setInput] = useState('');
  const [path, setPath] = useState('$');
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const evaluatePath = useCallback(() => {
    try {
      setError(null);
      setOutput(null);

      if (!input.trim()) {
        return;
      }

      const data = JSON.parse(input);
      let result = data;

      // Simple JSONPath-like evaluation
      if (path === '$') {
        result = data;
      } else {
        const parts = path.replace(/^\$\.?/, '').split('.');
        for (const part of parts) {
          if (part === '') continue;
          
          // Handle array indices
          const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
          if (arrayMatch) {
            const [, key, index] = arrayMatch;
            result = result[key][parseInt(index, 10)];
          } else {
            result = result[part];
          }
          
          if (result === undefined) {
            throw new Error(`Path not found: ${part}`);
          }
        }
      }

      setOutput(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON or path';
      setError(errorMessage);
      setOutput(null);
    }
  }, [input, path]);

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    evaluatePath();
  }, [evaluatePath]);

  const commonPaths = [
    { label: 'Root', path: '$' },
    { label: 'First item', path: '$[0]' },
    { label: 'All items', path: '$[*]' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JSON Input</label>
          <textarea
            placeholder='{"users":[{"name":"John"},{"name":"Jane"}]}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JSONPath Expression</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="$.users[0].name"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <button
              onClick={evaluatePath}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              <Search size={16} />
              Find
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonPaths.map((cp) => (
              <button
                key={cp.path}
                onClick={() => setPath(cp.path)}
                className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                {cp.label}
              </button>
            ))}
          </div>
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
      {output !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Result</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            <pre className="text-sm font-mono text-foreground">{JSON.stringify(output, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
