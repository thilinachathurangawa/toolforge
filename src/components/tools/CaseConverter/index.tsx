'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_\-./]+/)
    .filter(Boolean);
}

const transforms: { label: string; fn: (t: string) => string }[] = [
  { label: 'UPPERCASE', fn: (t) => t.toUpperCase() },
  { label: 'lowercase', fn: (t) => t.toLowerCase() },
  {
    label: 'Title Case',
    fn: (t) => t.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w/g, (c) => c.toLowerCase()),
  },
  {
    label: 'Sentence case',
    fn: (t) =>
      t
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()),
  },
  {
    label: 'camelCase',
    fn: (t) =>
      splitWords(t)
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join(''),
  },
  {
    label: 'PascalCase',
    fn: (t) =>
      splitWords(t)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(''),
  },
  { label: 'snake_case', fn: (t) => splitWords(t).map((w) => w.toLowerCase()).join('_') },
  { label: 'kebab-case', fn: (t) => splitWords(t).map((w) => w.toLowerCase()).join('-') },
];

export function CaseConverter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { chars, words };
  }, [text]);

  const apply = (fn: (t: string) => string) => setText((prev) => fn(prev));

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here…"
        rows={10}
        className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
      />

      <div className="flex flex-wrap gap-2">
        {transforms.map((t) => (
          <button
            key={t.label}
            onClick={() => apply(t.fn)}
            className="px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{stats.words}</span> words ·{' '}
          <span className="font-medium text-foreground">{stats.chars}</span> characters
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setText('')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Trash2 size={16} /> Clear
          </button>
          <button
            onClick={copy}
            disabled={!text}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
