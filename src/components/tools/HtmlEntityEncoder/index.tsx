'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'encode' | 'decode';

const ENTITY_REF = [
  { char: '<', entity: '&lt;', dec: '&#60;', hex: '&#x3C;' },
  { char: '>', entity: '&gt;', dec: '&#62;', hex: '&#x3E;' },
  { char: '&', entity: '&amp;', dec: '&#38;', hex: '&#x26;' },
  { char: '"', entity: '&quot;', dec: '&#34;', hex: '&#x22;' },
  { char: "'", entity: '&apos;', dec: '&#39;', hex: '&#x27;' },
  { char: ' ', entity: '&nbsp;', dec: '&#160;', hex: '&#xA0;' },
  { char: '©', entity: '&copy;', dec: '&#169;', hex: '&#xA9;' },
  { char: '®', entity: '&reg;', dec: '&#174;', hex: '&#xAE;' },
  { char: '™', entity: '&trade;', dec: '&#8482;', hex: '&#x2122;' },
  { char: '€', entity: '&euro;', dec: '&#8364;', hex: '&#x20AC;' },
];

export function HtmlEntityEncoder() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copiedIn, setCopiedIn] = useState(false);
  const [copiedOut, setCopiedOut] = useState(false);
  const helperRef = useRef<HTMLDivElement | null>(null);

  const encode = useCallback((text: string): string => {
    if (!helperRef.current) return text;
    helperRef.current.textContent = text;
    return helperRef.current.innerHTML;
  }, []);

  const decode = useCallback((text: string): string => {
    if (!helperRef.current) return text;
    helperRef.current.innerHTML = text;
    return helperRef.current.textContent ?? '';
  }, []);

  useEffect(() => {
    if (!input) { setOutput(''); return; }
    try {
      setOutput(mode === 'encode' ? encode(input) : decode(input));
    } catch { setOutput(''); }
  }, [input, mode, encode, decode]);

  const copy = (text: string, which: 'in' | 'out') => {
    navigator.clipboard.writeText(text);
    if (which === 'in') { setCopiedIn(true); setTimeout(() => setCopiedIn(false), 2000); }
    else { setCopiedOut(true); setTimeout(() => setCopiedOut(false), 2000); }
  };

  const textareaCls = 'w-full min-h-[180px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

  return (
    <div className="w-full space-y-5">
      {/* Hidden helper div for DOM-based encode/decode */}
      <div ref={helperRef} className="hidden" aria-hidden="true" />

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['encode', 'decode'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setInput(''); setOutput(''); }}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize',
              mode === m
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Dual textarea */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === 'encode' ? 'Plain Text Input' : 'HTML Entity Input'}
            </label>
            <button
              onClick={() => copy(input, 'in')}
              disabled={!input}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              {copiedIn ? <Check size={11} /> : <Copy size={11} />}
              {copiedIn ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '<h1>Hello & "World"</h1>' : '&lt;h1&gt;Hello &amp; &quot;World&quot;&lt;/h1&gt;'}
            className={textareaCls}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === 'encode' ? 'HTML Entity Output' : 'Decoded Text Output'}
            </label>
            <button
              onClick={() => copy(output, 'out')}
              disabled={!output}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              {copiedOut ? <Check size={11} /> : <Copy size={11} />}
              {copiedOut ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            className={`${textareaCls} bg-muted`}
            placeholder="Output will appear here..."
          />
        </div>
      </div>

      {/* Quick reference */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Common HTML Entities Reference</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Char</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Named Entity</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Decimal</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Hex</th>
              </tr>
            </thead>
            <tbody>
              {ENTITY_REF.map((row, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-3 py-1.5 font-mono font-semibold">{row.char === ' ' ? '(space)' : row.char}</td>
                  <td className="px-3 py-1.5 font-mono text-accent">{row.entity}</td>
                  <td className="px-3 py-1.5 font-mono text-muted-foreground">{row.dec}</td>
                  <td className="px-3 py-1.5 font-mono text-muted-foreground">{row.hex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
