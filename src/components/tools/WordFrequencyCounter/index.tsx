'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';

const STOP_WORDS = new Set([
  'the', 'and', 'a', 'an', 'to', 'of', 'in', 'is', 'it', 'that', 'for', 'on', 'with', 'as', 'are', 'was', 'were',
  'be', 'been', 'being', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us',
  'them', 'my', 'your', 'his', 'its', 'our', 'their', 'at', 'by', 'from', 'or', 'but', 'not', 'no', 'so', 'if',
  'then', 'than', 'too', 'very', 'can', 'will', 'just', 'do', 'does', 'did', 'has', 'have', 'had', 'would', 'could',
  'should', 'about', 'into', 'over', 'after', 'up', 'down', 'out', 'off', 'all', 'any', 'some', 'more', 'most',
]);

type SortKey = 'count' | 'word';

export function WordFrequencyCounter() {
  const [text, setText] = useState('');
  const [ignoreStop, setIgnoreStop] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [asc, setAsc] = useState(false);

  const { rows, totalWords, uniqueWords } = useMemo(() => {
    const matches = text.toLowerCase().match(/[\w']+/g) || [];
    const total = matches.length;
    const freq = new Map<string, number>();
    for (const w of matches) {
      if (ignoreStop && STOP_WORDS.has(w)) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
    const counted = total || 1;
    let list = Array.from(freq.entries()).map(([word, count]) => ({
      word,
      count,
      pct: ((count / counted) * 100).toFixed(1),
    }));
    list = list.sort((a, b) => {
      if (sortKey === 'word') return asc ? a.word.localeCompare(b.word) : b.word.localeCompare(a.word);
      return asc ? a.count - b.count : b.count - a.count;
    });
    return { rows: list, totalWords: total, uniqueWords: freq.size };
  }, [text, ignoreStop, sortKey, asc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(key === 'word');
    }
  };

  return (
    <div className="w-full space-y-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text to analyze word frequency…"
        rows={8}
        className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={ignoreStop} onChange={(e) => setIgnoreStop(e.target.checked)} className="accent-accent" />
          Ignore common stop words
        </label>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{totalWords}</span> total ·{' '}
          <span className="font-medium text-foreground">{uniqueWords}</span> unique
        </div>
      </div>

      {rows.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr className="text-left">
                  <th className="px-4 py-2 w-12 text-muted-foreground font-medium">#</th>
                  <th className="px-4 py-2">
                    <button onClick={() => toggleSort('word')} className="inline-flex items-center gap-1 font-medium text-foreground">
                      Word <ArrowUpDown size={13} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-right">
                    <button onClick={() => toggleSort('count')} className="inline-flex items-center gap-1 font-medium text-foreground">
                      Count <ArrowUpDown size={13} className="text-muted-foreground" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.word} className="border-t border-border">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-mono text-foreground">{r.word}</td>
                    <td className="px-4 py-2 text-right font-medium text-foreground">{r.count}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{r.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
