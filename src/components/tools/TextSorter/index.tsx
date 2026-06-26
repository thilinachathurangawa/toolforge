'use client';

import React, { useState } from 'react';
import { Copy, Check, ArrowDownAZ, ArrowUpZA, ArrowDownWideNarrow, ArrowUpNarrowWide, FlipVertical2, Shuffle } from 'lucide-react';

export function TextSorter() {
  const [text, setText] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [removeBlank, setRemoveBlank] = useState(true);
  const [copied, setCopied] = useState(false);

  const getLines = () => {
    let lines = text.split('\n');
    if (removeBlank) lines = lines.filter((l) => l.trim() !== '');
    return lines;
  };

  const setLines = (lines: string[]) => setText(lines.join('\n'));

  const cmp = (a: string, b: string) =>
    caseInsensitive ? a.toLowerCase().localeCompare(b.toLowerCase()) : a.localeCompare(b);

  const sortAZ = () => setLines(getLines().sort(cmp));
  const sortZA = () => setLines(getLines().sort((a, b) => cmp(b, a)));
  const byLenShort = () => setLines(getLines().sort((a, b) => a.length - b.length));
  const byLenLong = () => setLines(getLines().sort((a, b) => b.length - a.length));
  const reverse = () => setLines(getLines().reverse());
  const shuffle = () => {
    const lines = getLines();
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    setLines(lines);
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = text.trim() ? text.split('\n').filter((l) => l.trim() !== '').length : 0;

  const actions = [
    { label: 'A → Z', icon: ArrowDownAZ, fn: sortAZ },
    { label: 'Z → A', icon: ArrowUpZA, fn: sortZA },
    { label: 'Length ↑', icon: ArrowUpNarrowWide, fn: byLenShort },
    { label: 'Length ↓', icon: ArrowDownWideNarrow, fn: byLenLong },
    { label: 'Reverse', icon: FlipVertical2, fn: reverse },
    { label: 'Shuffle', icon: Shuffle, fn: shuffle },
  ];

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={caseInsensitive} onChange={(e) => setCaseInsensitive(e.target.checked)} className="accent-accent" />
          Case-insensitive sort
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={removeBlank} onChange={(e) => setRemoveBlank(e.target.checked)} className="accent-accent" />
          Remove blank lines
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.fn}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <a.icon size={16} /> {a.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your list, one item per line…"
        rows={14}
        className="w-full px-4 py-3 text-sm font-mono bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{lineCount}</span> lines
        </span>
        <button onClick={copy} disabled={!text} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 transition-colors">
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
