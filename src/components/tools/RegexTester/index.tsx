'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, AlertCircle, Search } from 'lucide-react';

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const testRegex = useCallback(() => {
    try {
      setError(null);
      setMatches([]);

      if (!pattern.trim()) {
        return;
      }

      const regex = new RegExp(pattern, flags);
      const found: RegExpMatchArray[] = [];
      
      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(text)) !== null) {
          found.push(match);
          if (!flags.includes('g')) break;
        }
      } else {
        const match = text.match(regex);
        if (match) found.push(match);
      }

      setMatches(found);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid regex';
      setError(errorMessage);
      setMatches([]);
    }
  }, [pattern, flags, text]);

  React.useEffect(() => {
    testRegex();
  }, [testRegex]);

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedText = useMemo(() => {
    if (!pattern || error) return text;
    
    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const parts = text.split(regex);
      let result = '';
      let matchIndex = 0;
      
      text.replace(regex, (match) => {
        result += text.substring(result.length, text.indexOf(match, matchIndex));
        result += `<mark class="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">${match}</mark>`;
        matchIndex = text.indexOf(match, matchIndex) + match.length;
        return match;
      });
      
      if (result === '') return text;
      return result;
    } catch {
      return text;
    }
  }, [text, pattern, flags, error]);

  return (
    <div className="w-full space-y-6">
      {/* Pattern Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Regular Expression</label>
          <div className="flex gap-2">
            <span className="px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md">/</span>
            <input
              type="text"
              placeholder="[a-z]+"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <span className="px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md">/</span>
            <input
              type="text"
              placeholder="gim"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="w-20 px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['g', 'i', 'm', 's', 'u', 'y'].map((flag) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  flags.includes(flag)
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Test Text</label>
          <textarea
            placeholder="Enter text to test against the regex..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <button
          onClick={testRegex}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <Search size={16} />
          Test
        </button>
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

      {/* Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Matches ({matches.length})</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Regex'}
            </button>
          </div>
          
          <div className="p-4 border border-input rounded-md bg-background max-h-[200px] overflow-y-auto">
            <div 
              className="text-sm font-mono whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Match Details</label>
            <div className="border border-input rounded-md bg-background max-h-[200px] overflow-y-auto">
              {matches.map((match, index) => (
                <div key={index} className="px-4 py-2 border-b border-border last:border-b-0">
                  <div className="text-sm font-mono">
                    <span className="text-muted-foreground">Match {index + 1}:</span>{' '}
                    <span className="text-accent">{match[0]}</span>
                  </div>
                  {match.length > 1 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {match.slice(1).map((group, i) => (
                        <span key={i} className="mr-2">
                          Group {i + 1}: {group}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    Index: {match.index}, Length: {match[0].length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
