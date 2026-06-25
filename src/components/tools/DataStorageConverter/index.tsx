'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageUnit {
  key: string;
  label: string;
  abbreviation: string;
  bytes: number;
}

const UNITS: StorageUnit[] = [
  { key: 'B',  label: 'Bytes',     abbreviation: 'B',  bytes: 1 },
  { key: 'KB', label: 'Kilobytes', abbreviation: 'KB', bytes: 1024 },
  { key: 'MB', label: 'Megabytes', abbreviation: 'MB', bytes: 1024 ** 2 },
  { key: 'GB', label: 'Gigabytes', abbreviation: 'GB', bytes: 1024 ** 3 },
  { key: 'TB', label: 'Terabytes', abbreviation: 'TB', bytes: 1024 ** 4 },
  { key: 'PB', label: 'Petabytes', abbreviation: 'PB', bytes: 1024 ** 5 },
];

/**
 * Format a numeric result with smart precision:
 * - Up to 10 significant digits
 * - If the absolute value is >= 0.001, show up to 10 significant decimal places
 *   but trim trailing zeros
 * - If the absolute value is < 0.001 (but non-zero), use scientific notation
 * - Whole numbers (no fractional part) display without a decimal point
 */
function formatValue(value: number): string {
  if (!isFinite(value)) return '—';
  if (value === 0) return '0';

  const abs = Math.abs(value);

  // Scientific notation for very small values
  if (abs > 0 && abs < 0.001) {
    return value.toExponential(9).replace(/\.?0+e/, 'e');
  }

  // Use toPrecision for up to 10 significant digits, then strip trailing zeros
  const precise = parseFloat(value.toPrecision(10));
  // Check if it's a whole number
  if (Number.isInteger(precise)) {
    return precise.toLocaleString('en-US');
  }

  // Format with enough decimals then strip trailing zeros
  // toPrecision may produce e-notation for very large precise values — handle that
  const str = precise.toFixed(10);
  // Remove trailing zeros after decimal
  const trimmed = str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return parseFloat(trimmed).toLocaleString('en-US', { maximumFractionDigits: 10 });
}

export function DataStorageConverter() {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('MB');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }, []);

  const numericInput = parseFloat(inputValue);
  const hasValidInput = inputValue.trim() !== '' && !isNaN(numericInput) && isFinite(numericInput);

  const sourceUnit = UNITS.find((u) => u.key === selectedUnit);

  const results: { unit: StorageUnit; formatted: string; raw: number }[] = UNITS.map((unit) => {
    if (!hasValidInput || !sourceUnit) {
      return { unit, formatted: '', raw: 0 };
    }
    const bytes = numericInput * sourceUnit.bytes;
    const converted = bytes / unit.bytes;
    return { unit, formatted: formatValue(converted), raw: converted };
  });

  return (
    <div className="w-full space-y-6">
      {/* Input row */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Enter a value</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 1.5"
            min="0"
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {UNITS.map((unit) => (
              <option key={unit.key} value={unit.key}>
                {unit.label} ({unit.abbreviation})
              </option>
            ))}
          </select>
        </div>
        {inputValue !== '' && isNaN(numericInput) && (
          <p className="text-xs text-destructive">Please enter a valid number.</p>
        )}
      </div>

      {/* Results grid */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Converted values</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          {UNITS.map((unit, idx) => {
            const result = results.find((r) => r.unit.key === unit.key);
            const displayValue = hasValidInput && result ? result.formatted : '—';
            const isSource = unit.key === selectedUnit;
            const copyText = result ? result.formatted : '';

            return (
              <div
                key={unit.key}
                className={cn(
                  'flex items-center justify-between px-4 py-3 gap-4',
                  idx !== UNITS.length - 1 && 'border-b border-border',
                  isSource && 'bg-accent/5'
                )}
              >
                {/* Unit label */}
                <div className="w-36 shrink-0">
                  <span className="text-sm font-medium text-foreground">
                    {unit.label}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({unit.abbreviation})
                  </span>
                  {isSource && (
                    <span className="ml-2 text-xs font-medium text-accent">
                      ← input
                    </span>
                  )}
                </div>

                {/* Value */}
                <div className="flex-1 text-sm text-right font-mono text-foreground truncate">
                  {displayValue}
                </div>

                {/* Copy button */}
                <button
                  onClick={() => hasValidInput && handleCopy(copyText, unit.key)}
                  disabled={!hasValidInput}
                  title={hasValidInput ? `Copy ${displayValue} ${unit.abbreviation}` : 'Enter a value first'}
                  className={cn(
                    'shrink-0 flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors',
                    hasValidInput
                      ? 'border-input bg-background text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer'
                      : 'border-transparent text-muted-foreground/30 cursor-not-allowed'
                  )}
                >
                  {copiedKey === unit.key ? (
                    <>
                      <Check size={12} className="text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reference table */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h3 className="text-sm font-medium text-foreground">Base-2 reference (binary)</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {[
            '1 KB = 1,024 B',
            '1 MB = 1,024 KB',
            '1 GB = 1,024 MB',
            '1 TB = 1,024 GB',
            '1 PB = 1,024 TB',
            '1 GB = 1,073,741,824 B',
          ].map((fact) => (
            <li key={fact} className="text-xs text-muted-foreground">
              • {fact}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
