'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, AlertCircle, GitCompare } from 'lucide-react';

type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

interface DiffResult {
  path: string;
  type: DiffType;
  oldValue?: any;
  newValue?: any;
}

export function JsonDiff() {
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [diffs, setDiffs] = useState<DiffResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const compareJSON = useCallback(() => {
    try {
      setError(null);
      setDiffs([]);

      if (!json1.trim() || !json2.trim()) {
        return;
      }

      const obj1 = JSON.parse(json1);
      const obj2 = JSON.parse(json2);

      const results: DiffResult[] = [];
      const compare = (a: any, b: any, path = ''): void => {
        // Handle arrays
        if (Array.isArray(a) && Array.isArray(b)) {
          const maxLength = Math.max(a.length, b.length);
          for (let i = 0; i < maxLength; i++) {
            const currentPath = path ? `${path}[${i}]` : `[${i}]`;
            if (i >= a.length) {
              results.push({ path: currentPath, type: 'added', newValue: b[i] });
            } else if (i >= b.length) {
              results.push({ path: currentPath, type: 'removed', oldValue: a[i] });
            } else {
              compare(a[i], b[i], currentPath);
            }
          }
          return;
        }

        // Handle objects
        if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
          const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
          for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            if (!(key in a)) {
              results.push({ path: currentPath, type: 'added', newValue: b[key] });
            } else if (!(key in b)) {
              results.push({ path: currentPath, type: 'removed', oldValue: a[key] });
            } else {
              compare(a[key], b[key], currentPath);
            }
          }
          return;
        }

        // Handle primitives
        if (a !== b) {
          results.push({ path, type: 'modified', oldValue: a, newValue: b });
        } else {
          results.push({ path, type: 'unchanged', oldValue: a });
        }
      };

      compare(obj1, obj2);
      setDiffs(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setDiffs([]);
    }
  }, [json1, json2]);

  const copy = () => {
    const text = diffs.map(d => {
      const prefix = d.type === 'added' ? '+' : d.type === 'removed' ? '-' : d.type === 'modified' ? '~' : ' ';
      return `${prefix} ${d.path}: ${JSON.stringify(d.oldValue)} → ${JSON.stringify(d.newValue)}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    compareJSON();
  }, [compareJSON]);

  const getDiffColor = (type: DiffType) => {
    switch (type) {
      case 'added': return 'text-green-500 bg-green-500/10';
      case 'removed': return 'text-red-500 bg-red-500/10';
      case 'modified': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JSON 1 (Original)</label>
          <textarea
            placeholder='{"name":"John","age":30}'
            value={json1}
            onChange={(e) => setJson1(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JSON 2 (Modified)</label>
          <textarea
            placeholder='{"name":"John","age":31}'
            value={json2}
            onChange={(e) => setJson2(e.target.value)}
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
      {diffs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Differences</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            {diffs.map((diff, index) => (
              <div
                key={index}
                className={`px-4 py-2 border-b border-border last:border-b-0 ${getDiffColor(diff.type)}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{diff.path}</span>
                  {diff.type === 'modified' && (
                    <span className="text-xs">
                      {JSON.stringify(diff.oldValue)} → {JSON.stringify(diff.newValue)}
                    </span>
                  )}
                  {diff.type === 'added' && (
                    <span className="text-xs">+ {JSON.stringify(diff.newValue)}</span>
                  )}
                  {diff.type === 'removed' && (
                    <span className="text-xs">- {JSON.stringify(diff.oldValue)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
