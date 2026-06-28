'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, ArrowLeftRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Direction = 'a1-to-r1c1' | 'r1c1-to-a1';

export function CellReferenceConverter() {
  const [direction, setDirection] = useState<Direction>('a1-to-r1c1');
  const [a1Input, setA1Input] = useState('');
  const [r1c1Input, setR1c1Input] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Column letter to number (A=1, Z=26, AA=27)
  const columnLetterToNumber = (letter: string): number => {
    letter = letter.toUpperCase();
    let result = 0;
    for (let i = 0; i < letter.length; i++) {
      const charCode = letter.charCodeAt(i);
      if (charCode < 65 || charCode > 90) {
        throw new Error('Invalid column letter');
      }
      result = result * 26 + (charCode - 64);
    }
    return result;
  };

  // Column number to letter (1=A, 26=Z, 27=AA)
  const columnNumberToLetter = (num: number): string => {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  };

  // A1 to R1C1 conversion
  const a1ToR1C1 = (a1: string): string => {
    // Handle ranges
    if (a1.includes(':')) {
      const [start, end] = a1.split(':');
      return `${a1ToR1C1(start)}:${a1ToR1C1(end)}`;
    }
    
    const match = a1.match(/^([A-Z]+)(\d+)$/i);
    if (!match) return a1;
    
    const [, col, row] = match;
    const colNum = columnLetterToNumber(col);
    
    return `R${row}C${colNum}`;
  };

  // R1C1 to A1 conversion
  const r1c1ToA1 = (r1c1: string): string => {
    // Handle ranges
    if (r1c1.includes(':')) {
      const [start, end] = r1c1.split(':');
      return `${r1c1ToA1(start)}:${r1c1ToA1(end)}`;
    }
    
    const match = r1c1.match(/^R(\d+)C(\d+)$/i);
    if (!match) return r1c1;
    
    const [, row, col] = match;
    const colLetter = columnNumberToLetter(parseInt(col));
    
    return `${colLetter}${row}`;
  };

  // Perform conversion based on direction
  useEffect(() => {
    if (direction === 'a1-to-r1c1' && a1Input) {
      try {
        setResult(a1ToR1C1(a1Input));
      } catch (e) {
        setResult('Invalid A1 format');
      }
    } else if (direction === 'r1c1-to-a1' && r1c1Input) {
      try {
        setResult(r1c1ToA1(r1c1Input));
      } catch (e) {
        setResult('Invalid R1C1 format');
      }
    } else {
      setResult('');
    }
  }, [direction, a1Input, r1c1Input]);

  const handleSwap = () => {
    setDirection(direction === 'a1-to-r1c1' ? 'r1c1-to-a1' : 'a1-to-r1c1');
    setA1Input('');
    setR1c1Input('');
    setResult('');
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setA1Input('');
    setR1c1Input('');
    setResult('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Direction Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Conversion Direction</label>
        <div className="flex gap-2">
          <button
            onClick={() => setDirection('a1-to-r1c1')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              direction === 'a1-to-r1c1'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            A1 → R1C1
          </button>
          <button
            onClick={() => setDirection('r1c1-to-a1')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              direction === 'r1c1-to-a1'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            R1C1 → A1
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {direction === 'a1-to-r1c1' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">A1 Notation</label>
              <input
                type="text"
                value={a1Input}
                onChange={(e) => setA1Input(e.target.value)}
                placeholder="e.g., B12 or A1:B10"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono"
              />
              <p className="text-xs text-muted-foreground">Examples: B12, A1:B10, Z100</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                title="Swap direction"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">R1C1 Notation</label>
              <input
                type="text"
                value={result}
                readOnly
                placeholder="Result"
                className="w-full px-3 py-2 text-sm bg-muted border border-input rounded-md font-mono"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">R1C1 Notation</label>
              <input
                type="text"
                value={r1c1Input}
                onChange={(e) => setR1c1Input(e.target.value)}
                placeholder="e.g., R12C2 or R1C1:R10C3"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono"
              />
              <p className="text-xs text-muted-foreground">Examples: R12C2, R1C1:R10C3, R100C26</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                title="Swap direction"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">A1 Notation</label>
              <input
                type="text"
                value={result}
                readOnly
                placeholder="Result"
                className="w-full px-3 py-2 text-sm bg-muted border border-input rounded-md font-mono"
              />
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={!result}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          <X size={16} />
          Clear
        </button>
      </div>

      {/* Examples */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h3 className="text-sm font-medium text-foreground">Common Conversions</h3>
        <ul className="space-y-1">
          <li className="text-xs text-muted-foreground">• A1 ↔ R1C1</li>
          <li className="text-xs text-muted-foreground">• B12 ↔ R12C2</li>
          <li className="text-xs text-muted-foreground">• Z26 ↔ R26C26</li>
          <li className="text-xs text-muted-foreground">• AA27 ↔ R27C27</li>
          <li className="text-xs text-muted-foreground">• A1:B10 ↔ R1C1:R10C2</li>
        </ul>
      </div>
    </div>
  );
}
