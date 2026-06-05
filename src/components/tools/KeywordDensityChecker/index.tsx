'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const stopWords = [
  'the', 'and', 'is', 'in', 'to', 'of', 'a', 'for', 'it', 'on',
  'with', 'as', 'this', 'that', 'are', 'was', 'at', 'by', 'be',
  'or', 'from', 'but', 'not', 'have', 'has', 'had', 'will', 'would',
  'should', 'could', 'may', 'might', 'must', 'shall', 'can',
];

interface KeywordResult {
  word: string;
  count: number;
  density: number;
}

export function KeywordDensityChecker() {
  const [inputText, setInputText] = useState('');
  const [excludeStopWords, setExcludeStopWords] = useState(true);
  const [minWordLength, setMinWordLength] = useState(3);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [phraseLength, setPhraseLength] = useState<1 | 2 | 3>(1);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [sortBy, setSortBy] = useState<'count' | 'density' | 'alphabetical'>('count');
  const [totalWords, setTotalWords] = useState(0);
  const [uniqueWords, setUniqueWords] = useState(0);
  const [copied, setCopied] = useState(false);

  const analyzeText = useCallback(() => {
    if (!inputText.trim()) {
      setResults([]);
      setTotalWords(0);
      setUniqueWords(0);
      return;
    }

    let text = inputText;
    if (!caseSensitive) {
      text = text.toLowerCase();
    }

    // Split into words
    let words = (text.match(/\b[\w']+\b/g) || []) as string[];
    
    // Filter by minimum length
    words = words.filter(word => word.length >= minWordLength);
    
    // Remove stop words if enabled
    if (excludeStopWords) {
      const stopWordsLower = stopWords.map(w => w.toLowerCase());
      words = words.filter(word => !stopWordsLower.includes(word.toLowerCase()));
    }

    setTotalWords(words.length);

    // Create phrases based on phrase length
    const phrases: string[] = [];
    for (let i = 0; i <= words.length - phraseLength; i++) {
      const phrase = words.slice(i, i + phraseLength).join(' ');
      phrases.push(phrase);
    }

    // Count frequency
    const frequency: Record<string, number> = {};
    phrases.forEach(phrase => {
      frequency[phrase] = (frequency[phrase] || 0) + 1;
    });

    // Calculate density and create results
    const keywordResults: KeywordResult[] = Object.entries(frequency).map(([word, count]) => ({
      word,
      count,
      density: (count / phrases.length) * 100,
    }));

    setUniqueWords(Object.keys(frequency).length);
    setResults(keywordResults);
  }, [inputText, excludeStopWords, minWordLength, caseSensitive, phraseLength]);

  const sortResults = useCallback(() => {
    const sorted = [...results];
    switch (sortBy) {
      case 'count':
        sorted.sort((a, b) => b.count - a.count);
        break;
      case 'density':
        sorted.sort((a, b) => b.density - a.density);
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.word.localeCompare(b.word));
        break;
    }
    return sorted;
  }, [results, sortBy]);

  const handleCopy = () => {
    const sorted = sortResults();
    const text = sorted.map(r => `${r.word}: ${r.count} (${r.density.toFixed(2)}%)`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
    setTotalWords(0);
    setUniqueWords(0);
  };

  const exportToCSV = () => {
    const sorted = sortResults();
    const headers = ['Word', 'Count', 'Density (%)'];
    const rows = sorted.map(r => [r.word, r.count, r.density.toFixed(2)]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword-density.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortedResults = sortResults();

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Input Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Input Content</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type your text here..."
            rows={8}
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Options</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={excludeStopWords}
                onChange={(e) => setExcludeStopWords(e.target.checked)}
                className="rounded accent-accent"
              />
              Exclude stop words
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded accent-accent"
              />
              Case sensitive
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Min word length</label>
              <input
                type="number"
                value={minWordLength}
                onChange={(e) => setMinWordLength(parseInt(e.target.value))}
                min="1"
                max="10"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phrase length</label>
              <select
                value={phraseLength}
                onChange={(e) => setPhraseLength(parseInt(e.target.value) as 1 | 2 | 3)}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value={1}>1 word</option>
                <option value={2}>2 words</option>
                <option value={3}>3 words</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex gap-3">
          <button
            onClick={analyzeText}
            disabled={!inputText.trim()}
            className="flex-1 px-4 py-3 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Analyze
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-3 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Results</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                Total words: {totalWords} | Unique: {uniqueWords}
              </span>
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
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="count">Count</option>
                <option value="density">Density</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-foreground">Word/Phrase</th>
                    <th className="text-right py-2 px-3 font-medium text-foreground">Count</th>
                    <th className="text-right py-2 px-3 font-medium text-foreground">Density</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.slice(0, 50).map((result, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 font-mono text-foreground">{result.word}</td>
                      <td className="text-right py-2 px-3 text-foreground">{result.count}</td>
                      <td className="text-right py-2 px-3 text-foreground">{result.density.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedResults.length > 50 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing top 50 results out of {sortedResults.length}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
