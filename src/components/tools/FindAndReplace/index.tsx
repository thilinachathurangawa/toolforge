'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function FindAndReplace() {
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [copied, setCopied] = useState(false);

  const { output, count, error } = useMemo(() => {
    if (!find) return { output: text, count: 0, error: null as string | null };
    try {
      const flags = matchCase ? 'g' : 'gi';
      const pattern = useRegex ? find : escapeRegExp(find);
      const re = new RegExp(pattern, flags);
      const matches = text.match(re);
      const n = matches ? matches.length : 0;
      return { output: text.replace(re, replace), count: n, error: null };
    } catch (e) {
      return { output: text, count: 0, error: e instanceof Error ? e.message : 'Invalid regular expression' };
    }
  }, [text, find, replace, matchCase, useRegex]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls =
    'w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

  return (
    <div className="w-full space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to edit…"
          rows={8}
          className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Find</label>
          <input value={find} onChange={(e) => setFind(e.target.value)} className={inputCls} placeholder={useRegex ? 'e.g. \\d{4}' : 'text to find'} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Replace with</label>
          <input value={replace} onChange={(e) => setReplace(e.target.value)} className={inputCls} placeholder="replacement" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="accent-accent" />
          Match case
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} className="accent-accent" />
          Use regular expressions
        </label>
        {find && !error && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/10 text-accent">
            {count} replacement{count === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          <AlertCircle size={16} /> Invalid regex: {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Result</label>
          <button onClick={copy} disabled={!output} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea value={output} readOnly rows={8} className="w-full px-4 py-3 text-sm bg-muted border border-input rounded-lg resize-y" />
      </div>
    </div>
  );
}
