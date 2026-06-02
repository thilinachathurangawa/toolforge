'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, GitCompareArrows, AlertCircle } from 'lucide-react';

type DiffType = 'added' | 'removed' | 'unchanged';

interface DiffLine {
  type: DiffType;
  content: string;
  lineNumber?: number;
}

export function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffs, setDiffs] = useState<DiffLine[]>([]);
  const [copied, setCopied] = useState(false);

  const computeDiff = useCallback(() => {
    if (!text1.trim() && !text2.trim()) {
      setDiffs([]);
      return;
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: DiffLine[] = [];

    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined && line2 !== undefined) {
        result.push({ type: 'added', content: line2, lineNumber: i + 1 });
      } else if (line1 !== undefined && line2 === undefined) {
        result.push({ type: 'removed', content: line1, lineNumber: i + 1 });
      } else if (line1 !== line2) {
        result.push({ type: 'removed', content: line1, lineNumber: i + 1 });
        result.push({ type: 'added', content: line2, lineNumber: i + 1 });
      } else {
        result.push({ type: 'unchanged', content: line1, lineNumber: i + 1 });
      }
    }

    setDiffs(result);
  }, [text1, text2]);

  const copy = () => {
    const text = diffs.map(d => {
      const prefix = d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' ';
      return `${prefix} ${d.content}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    computeDiff();
  }, [computeDiff]);

  const getDiffClass = (type: DiffType) => {
    switch (type) {
      case 'added': return 'bg-green-500/10 text-green-500';
      case 'removed': return 'bg-red-500/10 text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Original Text</label>
          <textarea
            placeholder="Enter original text..."
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Modified Text</label>
          <textarea
            placeholder="Enter modified text..."
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

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
                className={`px-4 py-2 border-b border-border last:border-b-0 font-mono text-sm ${getDiffClass(diff.type)}`}
              >
                <span className="mr-2 opacity-50">{diff.lineNumber}</span>
                {diff.type === 'added' && <span className="mr-2">+</span>}
                {diff.type === 'removed' && <span className="mr-2">-</span>}
                <span>{diff.content || '(empty line)'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
