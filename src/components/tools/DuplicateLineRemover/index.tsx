'use client';

import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

export function DuplicateLineRemover() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [removed, setRemoved] = useState<number | null>(null);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trim, setTrim] = useState(true);
  const [keepEmpty, setKeepEmpty] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = () => {
    const lines = input.split('\n');
    const seen = new Set<string>();
    const result: string[] = [];
    let dupes = 0;
    for (const line of lines) {
      const isEmpty = line.trim() === '';
      if (isEmpty && keepEmpty) {
        result.push(line);
        continue;
      }
      if (isEmpty && !keepEmpty) {
        // drop blank lines entirely when not keeping them
        continue;
      }
      let key = trim ? line.trim() : line;
      if (!caseSensitive) key = key.toLowerCase();
      if (seen.has(key)) {
        dupes++;
      } else {
        seen.add(key);
        result.push(line);
      }
    }
    setOutput(result.join('\n'));
    setRemoved(dupes);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-accent" />
      {label}
    </label>
  );

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Toggle label="Case sensitive comparison" checked={caseSensitive} onChange={setCaseSensitive} />
        <Toggle label="Trim whitespace before comparing" checked={trim} onChange={setTrim} />
        <Toggle label="Keep empty lines" checked={keepEmpty} onChange={setKeepEmpty} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your list, one item per line…"
            rows={14}
            className="w-full px-4 py-3 text-sm font-mono bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Output</label>
            {removed !== null && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/10 text-accent">
                {removed} duplicate{removed === 1 ? '' : 's'} removed
              </span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            rows={14}
            placeholder="Deduplicated result appears here…"
            className="w-full px-4 py-3 text-sm font-mono bg-muted border border-input rounded-lg resize-y"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={run} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
          <Sparkles size={16} /> Remove Duplicates
        </button>
        <button onClick={copy} disabled={!output} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors">
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Output'}
        </button>
      </div>
    </div>
  );
}
