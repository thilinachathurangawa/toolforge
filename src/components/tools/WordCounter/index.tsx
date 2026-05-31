'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { X, Clock, Mic, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: number;
  speakingTime: number;
  keywords: Array<{ word: string; count: number }>;
}

export function WordCounter() {
  const [text, setText] = useState('');
  const [charLimit, setCharLimit] = useState<number | null>(null);

  const calculateStats = useCallback((input: string): TextStats => {
    const trimmed = input.trim();
    
    // Words: split by whitespace, filter empty strings
    const words = trimmed ? trimmed.split(/\s+/).filter(w => w.length > 0).length : 0;
    
    // Characters
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, '').length;
    
    // Sentences: split by sentence terminators (. ! ?)
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
    
    // Paragraphs: split by double newlines or single newlines with content
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n|\n/).filter(p => p.trim().length > 0).length : 0;
    
    // Lines: count actual line breaks + 1 if content exists
    const lines = input ? input.split('\n').length : 0;
    
    // Reading time: average 200 words per minute
    const readingTime = Math.ceil(words / 200);
    
    // Speaking time: average 130 words per minute
    const speakingTime = Math.ceil(words / 130);
    
    // Keyword density: count word frequency (ignore common words, case-insensitive)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'if', 'then', 'else', 'because', 'since', 'although', 'though', 'while', 'after', 'before', 'during', 'until', 'from', 'as', 'than', 'so', 'not', 'no', 'yes', 'all', 'some', 'any', 'each', 'every', 'both', 'few', 'many', 'much', 'more', 'most', 'other', 'another', 'such', 'only', 'own', 'same', 'just', 'also', 'now', 'here', 'there', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'once']);
    
    const wordMap = new Map<string, number>();
    const wordsList = trimmed.toLowerCase().split(/\s+/).filter(w => w.length > 0 && !commonWords.has(w));
    
    wordsList.forEach(word => {
      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });
    
    const keywords = Array.from(wordMap.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      keywords,
    };
  }, []);

  const stats = useMemo(() => calculateStats(text), [text, calculateStats]);
  const isOverLimit = charLimit !== null && stats.characters > charLimit;

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Text Input Section */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Paste or type your text here...
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text to see real-time statistics..."
            className={cn(
              "w-full min-h-[200px] px-4 py-3 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent",
              isOverLimit && "border-destructive focus:ring-destructive/20 focus:border-destructive"
            )}
          />
        </div>

        {/* Character Limit Warning */}
        {isOverLimit && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm font-medium text-destructive">
              Character limit exceeded ({stats.characters} / {charLimit})
            </p>
          </div>
        )}

        {/* Clear Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">
              Character Limit:
            </label>
            <input
              type="number"
              min="0"
              placeholder="No limit"
              value={charLimit || ''}
              onChange={(e) => setCharLimit(e.target.value ? parseInt(e.target.value) : null)}
              className="w-24 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <button
            onClick={handleClear}
            disabled={!text}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
            Clear Text
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      {text && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-6">
          <h3 className="text-sm font-medium text-foreground">Stats</h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatItem label="Words" value={stats.words.toLocaleString()} />
            <StatItem label="Characters" value={stats.characters.toLocaleString()} />
            <StatItem label="No Spaces" value={stats.charactersNoSpaces.toLocaleString()} />
            <StatItem label="Sentences" value={stats.sentences.toLocaleString()} />
            <StatItem label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
            <StatItem label="Lines" value={stats.lines.toLocaleString()} />
          </div>

          {/* Time Estimates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock size={20} className="text-accent" />
              <div>
                <p className="text-xs text-text-secondary">Reading Time</p>
                <p className="text-sm font-medium text-foreground">
                  {stats.readingTime} min{stats.readingTime !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mic size={20} className="text-accent" />
              <div>
                <p className="text-xs text-text-secondary">Speaking Time</p>
                <p className="text-sm font-medium text-foreground">
                  {stats.speakingTime} min{stats.speakingTime !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Keyword Density */}
          {stats.keywords.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Hash size={16} className="text-accent" />
                <h4 className="text-sm font-medium text-foreground">Top Keywords</h4>
              </div>
              <div className="space-y-2">
                {stats.keywords.map((keyword, index) => (
                  <div key={keyword.word} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                      {index + 1}. {keyword.word}
                    </span>
                    <span className="font-mono text-accent">({keyword.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-muted/50 rounded-lg">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-lg font-bold text-accent">{value}</p>
    </div>
  );
}
