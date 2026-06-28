'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, ArrowLeftRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Direction = 'letter-to-number' | 'number-to-letter';

export function ColumnLetterConverter() {
  const [direction, setDirection] = useState<Direction>('letter-to-number');
  const [letterInput, setLetterInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Column letter to number (A=1, Z=26, AA=27, XFD=16384)
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
    if (result > 16384) {
      throw new Error('Column exceeds Excel maximum (XFD/16384)');
    }
    return result;
  };

  // Column number to letter (1=A, 26=Z, 27=AA, 16384=XFD)
  const columnNumberToLetter = (num: number): string => {
    if (num < 1 || num > 16384) {
      throw new Error('Column number must be between 1 and 16384');
    }
    
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  };

  // Perform conversion based on direction
  useEffect(() => {
    setError('');
    if (direction === 'letter-to-number' && letterInput) {
      try {
        const num = columnLetterToNumber(letterInput);
        setResult(num.toString());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid input');
        setResult('');
      }
    } else if (direction === 'number-to-letter' && numberInput) {
      try {
        const num = parseInt(numberInput);
        if (isNaN(num)) {
          throw new Error('Invalid number');
        }
        const letter = columnNumberToLetter(num);
        setResult(letter);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid input');
        setResult('');
      }
    } else {
      setResult('');
      setError('');
    }
  }, [direction, letterInput, numberInput]);

  const handleSwap = () => {
    setDirection(direction === 'letter-to-number' ? 'number-to-letter' : 'letter-to-number');
    setLetterInput('');
    setNumberInput('');
    setResult('');
    setError('');
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setLetterInput('');
    setNumberInput('');
    setResult('');
    setError('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Direction Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Conversion Direction</label>
        <div className="flex gap-2">
          <button
            onClick={() => setDirection('letter-to-number')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              direction === 'letter-to-number'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            Letter → Number
          </button>
          <button
            onClick={() => setDirection('number-to-letter')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              direction === 'number-to-letter'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            Number → Letter
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {direction === 'letter-to-number' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Column Letter</label>
              <input
                type="text"
                value={letterInput}
                onChange={(e) => setLetterInput(e.target.value)}
                placeholder="e.g., A, Z, AB, XFD"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">Max: XFD (16384)</p>
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
              <label className="text-sm font-medium text-foreground">Column Number</label>
              <input
                type="text"
                value={result}
                readOnly
                placeholder="Result"
                className={cn(
                  'w-full px-3 py-2 text-sm bg-muted border border-input rounded-md font-mono',
                  error && 'border-red-500'
                )}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Column Number</label>
              <input
                type="number"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                placeholder="e.g., 1, 26, 28, 16384"
                min="1"
                max="16384"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono"
              />
              <p className="text-xs text-muted-foreground">Range: 1 to 16384</p>
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
              <label className="text-sm font-medium text-foreground">Column Letter</label>
              <input
                type="text"
                value={result}
                readOnly
                placeholder="Result"
                className={cn(
                  'w-full px-3 py-2 text-sm bg-muted border border-input rounded-md font-mono uppercase',
                  error && 'border-red-500'
                )}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
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
          <li className="text-xs text-muted-foreground">• A ↔ 1</li>
          <li className="text-xs text-muted-foreground">• Z ↔ 26</li>
          <li className="text-xs text-muted-foreground">• AA ↔ 27</li>
          <li className="text-xs text-muted-foreground">• AB ↔ 28</li>
          <li className="text-xs text-muted-foreground">• AZ ↔ 52</li>
          <li className="text-xs text-muted-foreground">• BA ↔ 53</li>
          <li className="text-xs text-muted-foreground">• XFD ↔ 16384</li>
        </ul>
      </div>
    </div>
  );
}
