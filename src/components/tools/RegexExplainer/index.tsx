'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, BookOpen, AlertCircle } from 'lucide-react';

export function RegexExplainer() {
  const [pattern, setPattern] = useState('');
  const [explanation, setExplanation] = useState<ExplanationPart[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  interface ExplanationPart {
    pattern: string;
    description: string;
    type: 'literal' | 'character-class' | 'quantifier' | 'anchor' | 'group' | 'special';
  }

  const explainRegex = useCallback(() => {
    try {
      setError(null);
      setExplanation([]);

      if (!pattern.trim()) {
        return;
      }

      // Test if pattern is valid
      new RegExp(pattern);

      const parts: ExplanationPart[] = [];
      let i = 0;

      while (i < pattern.length) {
        const char = pattern[i];
        const nextChar = pattern[i + 1];

        // Character classes
        if (char === '[') {
          const end = pattern.indexOf(']', i);
          if (end !== -1) {
            parts.push({
              pattern: pattern.substring(i, end + 1),
              description: 'Character class - matches any character in the set',
              type: 'character-class',
            });
            i = end + 1;
            continue;
          }
        }

        // Anchors
        if (char === '^' && i === 0) {
          parts.push({
            pattern: '^',
            description: 'Start of string anchor',
            type: 'anchor',
          });
          i++;
          continue;
        }

        if (char === '$' && i === pattern.length - 1) {
          parts.push({
            pattern: '$',
            description: 'End of string anchor',
            type: 'anchor',
          });
          i++;
          continue;
        }

        // Quantifiers
        if (['*', '+', '?', '{'].includes(char)) {
          let quant = char;
          if (char === '{') {
            const end = pattern.indexOf('}', i);
            if (end !== -1) {
              quant = pattern.substring(i, end + 1);
              i = end + 1;
              parts.push({
                pattern: quant,
                description: 'Quantifier - specifies repetition',
                type: 'quantifier',
              });
              continue;
            }
          } else {
            const descriptions: Record<string, string> = {
              '*': 'Zero or more occurrences',
              '+': 'One or more occurrences',
              '?': 'Zero or one occurrence (optional)',
            };
            parts.push({
              pattern: char,
              description: descriptions[char],
              type: 'quantifier',
            });
            i++;
            continue;
          }
        }

        // Groups
        if (char === '(') {
          const end = pattern.indexOf(')', i);
          if (end !== -1) {
            const group = pattern.substring(i, end + 1);
            const isCapture = !group.startsWith('(?:');
            parts.push({
              pattern: group,
              description: isCapture ? 'Capturing group - captures matched text' : 'Non-capturing group',
              type: 'group',
            });
            i = end + 1;
            continue;
          }
        }

        // Special characters
        if (char === '\\') {
          if (nextChar) {
            const special: Record<string, string> = {
              d: 'Any digit (0-9)',
              D: 'Any non-digit',
              w: 'Any word character (a-z, A-Z, 0-9, _)',
              W: 'Any non-word character',
              s: 'Any whitespace character',
              S: 'Any non-whitespace character',
              n: 'Newline character',
              t: 'Tab character',
              r: 'Carriage return',
              b: 'Word boundary',
              B: 'Non-word boundary',
            };
            parts.push({
              pattern: char + nextChar,
              description: special[nextChar] || `Escaped character: ${nextChar}`,
              type: 'special',
            });
            i += 2;
            continue;
          }
        }

        // Wildcard
        if (char === '.') {
          parts.push({
            pattern: '.',
            description: 'Wildcard - matches any single character (except newline)',
            type: 'special',
          });
          i++;
          continue;
        }

        // Literal
        parts.push({
          pattern: char,
          description: `Literal character "${char}"`,
          type: 'literal',
        });
        i++;
      }

      setExplanation(parts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid regex';
      setError(errorMessage);
      setExplanation([]);
    }
  }, [pattern]);

  const copy = () => {
    const text = explanation.map(e => `${e.pattern}: ${e.description}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    explainRegex();
  }, [explainRegex]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'literal': return 'text-green-400';
      case 'character-class': return 'text-blue-400';
      case 'quantifier': return 'text-yellow-400';
      case 'anchor': return 'text-purple-400';
      case 'group': return 'text-pink-400';
      case 'special': return 'text-orange-400';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Regular Expression</label>
          <div className="flex gap-2">
            <span className="px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md">/</span>
            <input
              type="text"
              placeholder="[a-z]+\d+"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <span className="px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md">/</span>
          </div>
        </div>

        <button
          onClick={explainRegex}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <BookOpen size={16} />
          Explain
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

      {/* Explanation */}
      {explanation.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Explanation</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            {explanation.map((part, index) => (
              <div
                key={index}
                className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <code className={`text-sm font-mono px-2 py-1 rounded bg-muted ${getTypeColor(part.type)}`}>
                    {part.pattern}
                  </code>
                  <span className="text-sm text-foreground">{part.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
