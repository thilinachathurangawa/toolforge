'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, ArrowDownUp } from 'lucide-react';

function caesarShift(text: string, shift: number): string {
  return text.replace(/[a-zA-Z]/g, char => {
    const base = char >= 'a' ? 97 : 65;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
  });
}

export function Rot13CaesarCipher() {
  const [input, setInput] = useState('');
  const [shift, setShift] = useState(13);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const compute = useCallback(() => {
    setOutput(caesarShift(input, shift));
  }, [input, shift]);

  useEffect(() => { compute(); }, [compute]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swap = () => {
    setInput(output);
  };

  const textareaCls = 'w-full min-h-[140px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

  return (
    <div className="w-full space-y-5">
      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Input Text</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type or paste text to encode..."
          className={textareaCls}
        />
      </div>

      {/* Shift control */}
      <div className="p-4 border border-border rounded-xl bg-card space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Shift: <span className="font-mono font-semibold text-accent">{shift}</span>
            {shift === 13 && <span className="ml-2 text-xs text-muted-foreground">(ROT13)</span>}
          </label>
          <button
            onClick={() => setShift(13)}
            className="px-3 py-1 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            ROT13 (13)
          </button>
        </div>
        <input
          type="range"
          min={1}
          max={25}
          value={shift}
          onChange={e => setShift(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>13 (ROT13)</span>
          <span>25</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Manual:</label>
          <input
            type="number"
            min={1}
            max={25}
            value={shift}
            onChange={e => {
              const v = Math.min(25, Math.max(1, Number(e.target.value)));
              if (!isNaN(v)) setShift(v);
            }}
            className="w-20 px-2 py-1 text-sm font-mono text-center bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Output</label>
          <div className="flex gap-2">
            <button
              onClick={swap}
              disabled={!output}
              title="Move output to input"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDownUp size={12} />
              Swap
            </button>
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy Output'}
            </button>
          </div>
        </div>
        <textarea
          readOnly
          value={output}
          className={`${textareaCls} bg-muted`}
          placeholder="Encoded/decoded text will appear here..."
        />
      </div>

      {/* Educational note */}
      <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground space-y-1">
        <p><strong className="text-foreground">ROT13</strong> (shift 13) is its own inverse — applying it twice returns the original text.</p>
        <p>To <strong>decode</strong> any Caesar cipher, use shift <strong>{26 - shift}</strong> (26 minus the encoding shift).</p>
        <p>Numbers, punctuation, and spaces are never shifted.</p>
      </div>
    </div>
  );
}
