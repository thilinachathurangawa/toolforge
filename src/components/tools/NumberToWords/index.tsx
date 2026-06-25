'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Conversion logic (pure, no external dependencies)
// ---------------------------------------------------------------------------

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];
const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion'];

function convertHundreds(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
  return (
    ones[Math.floor(n / 100)] +
    ' Hundred' +
    (n % 100 ? ' ' + convertHundreds(n % 100) : '')
  );
}

function toWords(n: number): string {
  if (n === 0) return 'Zero';
  const chunks: string[] = [];
  let i = 0;
  let remaining = n;
  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk !== 0) {
      chunks.unshift(convertHundreds(chunk) + (scales[i] ? ' ' + scales[i] : ''));
    }
    remaining = Math.floor(remaining / 1000);
    i++;
  }
  return chunks.join(', ');
}

// Maximum integer supported: 999 quadrillion (999,999,999,999,999,999)
const MAX_INTEGER = 999_999_999_999_999_999;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = 'standard' | 'cheque';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseInput(raw: string, mode: Mode): { intPart: number; centsPadded: string; error: string | null } {
  const trimmed = raw.trim();

  if (trimmed === '' || trimmed === '-') {
    return { intPart: 0, centsPadded: '00', error: null };
  }

  if (mode === 'standard') {
    // Integer only — reject decimals
    if (!/^\d+$/.test(trimmed)) {
      return { intPart: 0, centsPadded: '00', error: 'Enter a whole number (no decimals, no commas, no negative sign).' };
    }
    const n = Number(trimmed);
    if (n > MAX_INTEGER) {
      return { intPart: 0, centsPadded: '00', error: 'Number exceeds the maximum of 999 Quadrillion.' };
    }
    return { intPart: n, centsPadded: '00', error: null };
  }

  // Cheque mode — allow optional decimal with up to 2 digits
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) {
    return { intPart: 0, centsPadded: '00', error: 'Enter a valid amount, e.g. 1234.56 (up to two decimal places, no commas).' };
  }

  const [intStr, decStr = ''] = trimmed.split('.');
  const n = Number(intStr);
  if (n > MAX_INTEGER) {
    return { intPart: 0, centsPadded: '00', error: 'Number exceeds the maximum of 999 Quadrillion.' };
  }

  const centsPadded = decStr.padEnd(2, '0');
  return { intPart: n, centsPadded, error: null };
}

function buildResult(raw: string, mode: Mode): string {
  const { intPart, centsPadded, error } = parseInput(raw, mode);
  if (error || raw.trim() === '' || raw.trim() === '-') return '';

  if (mode === 'standard') {
    return toWords(intPart);
  }

  // Cheque mode
  const dollarWords = toWords(intPart);
  return `${dollarWords} Dollars and ${centsPadded}/100 Cents`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NumberToWords() {
  const [mode, setMode] = useState<Mode>('standard');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { error } = parseInput(input, mode);
  const result = input.trim() ? buildResult(input, mode) : '';

  const handleModeChange = useCallback((next: Mode) => {
    setMode(next);
    setInput('');
  }, []);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const placeholder =
    mode === 'standard' ? 'e.g. 1234567' : 'e.g. 1234.56';

  return (
    <div className="w-full space-y-6">
      {/* Mode toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mode</label>
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {(['standard', 'cheque'] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                mode === m
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m === 'standard' ? 'Standard' : 'Cheque / Bank'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === 'standard'
            ? 'Converts a whole number to plain English — e.g. 1,234 → One Thousand Two Hundred Thirty-Four.'
            : 'Formats a dollar amount for cheques — e.g. 1234.56 → One Thousand Two Hundred Thirty-Four Dollars and 56/100 Cents.'}
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label htmlFor="ntw-input" className="text-sm font-medium text-foreground">
          {mode === 'standard' ? 'Number' : 'Amount'}
        </label>
        <input
          id="ntw-input"
          type="text"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors',
            error
              ? 'border-destructive focus:border-destructive'
              : 'border-input focus:border-accent'
          )}
        />
        {error && (
          <div className="flex items-start gap-2 text-destructive text-xs">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Result</label>
          <button
            onClick={handleCopy}
            disabled={!result}
            aria-label="Copy result to clipboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div
          className={cn(
            'min-h-[72px] p-4 border border-input rounded-md bg-muted/40 text-sm leading-relaxed transition-all',
            result ? 'text-foreground' : 'text-muted-foreground italic'
          )}
        >
          {result || (mode === 'standard' ? 'Enter a number above to see it in words.' : 'Enter an amount above to see it formatted for a cheque.')}
        </div>
      </div>

      {/* Quick examples */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick examples</p>
        <div className="flex flex-wrap gap-2">
          {(mode === 'standard'
            ? [
                { label: '0', value: '0' },
                { label: '100', value: '100' },
                { label: '1,000', value: '1000' },
                { label: '1,000,000', value: '1000000' },
                { label: '999,999,999', value: '999999999' },
              ]
            : [
                { label: '$0.00', value: '0.00' },
                { label: '$9.99', value: '9.99' },
                { label: '$100.50', value: '100.50' },
                { label: '$1,234.56', value: '1234.56' },
                { label: '$50,000.00', value: '50000.00' },
              ]
          ).map((ex) => (
            <button
              key={ex.value}
              onClick={() => setInput(ex.value)}
              className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-mono"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
