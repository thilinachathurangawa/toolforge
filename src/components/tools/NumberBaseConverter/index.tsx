'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseField {
  id: 'binary' | 'octal' | 'decimal' | 'hex';
  label: string;
  base: number;
  badge: string;
  placeholder: string;
  pattern: RegExp;
  patternDescription: string;
}

const BASE_FIELDS: BaseField[] = [
  {
    id: 'binary',
    label: 'Binary',
    base: 2,
    badge: 'Base 2',
    placeholder: 'e.g. 1010',
    pattern: /^[01]*$/,
    patternDescription: 'Only digits 0 and 1 are valid in binary.',
  },
  {
    id: 'octal',
    label: 'Octal',
    base: 8,
    badge: 'Base 8',
    placeholder: 'e.g. 17',
    pattern: /^[0-7]*$/,
    patternDescription: 'Only digits 0–7 are valid in octal.',
  },
  {
    id: 'decimal',
    label: 'Decimal',
    base: 10,
    badge: 'Base 10',
    placeholder: 'e.g. 255',
    pattern: /^[0-9]*$/,
    patternDescription: 'Only digits 0–9 are valid in decimal.',
  },
  {
    id: 'hex',
    label: 'Hexadecimal',
    base: 16,
    badge: 'Base 16',
    placeholder: 'e.g. FF',
    pattern: /^[0-9A-Fa-f]*$/,
    patternDescription: 'Only digits 0–9 and letters A–F are valid in hex.',
  },
];

type FieldId = BaseField['id'];

interface FieldState {
  value: string;
  error: string | null;
}

type FormState = Record<FieldId, FieldState>;

const EMPTY_STATE: FormState = {
  binary: { value: '', error: null },
  octal: { value: '', error: null },
  decimal: { value: '', error: null },
  hex: { value: '', error: null },
};

function convertFromDecimal(decimal: number): Record<FieldId, string> {
  return {
    binary: decimal.toString(2),
    octal: decimal.toString(8),
    decimal: decimal.toString(10),
    hex: decimal.toString(16).toUpperCase(),
  };
}

export function NumberBaseConverter() {
  const [fields, setFields] = useState<FormState>(EMPTY_STATE);
  const [copiedId, setCopiedId] = useState<FieldId | null>(null);

  const handleChange = useCallback(
    (sourceId: FieldId, rawValue: string) => {
      const field = BASE_FIELDS.find((f) => f.id === sourceId)!;

      // Always allow clearing the field
      if (rawValue === '') {
        setFields(EMPTY_STATE);
        return;
      }

      // Validate characters
      if (!field.pattern.test(rawValue)) {
        setFields((prev) => ({
          ...prev,
          [sourceId]: {
            value: rawValue,
            error: field.patternDescription,
          },
        }));
        return;
      }

      // Parse the value in the source base
      const parsed = parseInt(rawValue, field.base);

      // Guard against overflow beyond MAX_SAFE_INTEGER
      if (!Number.isFinite(parsed) || parsed > Number.MAX_SAFE_INTEGER || parsed < 0) {
        setFields((prev) => ({
          ...prev,
          [sourceId]: {
            value: rawValue,
            error: `Value exceeds the maximum safe integer (2^53 − 1).`,
          },
        }));
        return;
      }

      // Convert to all bases
      const converted = convertFromDecimal(parsed);

      const next: FormState = {
        binary: { value: converted.binary, error: null },
        octal: { value: converted.octal, error: null },
        decimal: { value: converted.decimal, error: null },
        hex: { value: converted.hex, error: null },
      };

      // Preserve the user's original casing/input in the source field
      next[sourceId] = {
        value: sourceId === 'hex' ? rawValue.toUpperCase() : rawValue,
        error: null,
      };

      setFields(next);
    },
    []
  );

  const handleCopy = useCallback((id: FieldId, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleClear = () => {
    setFields(EMPTY_STATE);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Type a value in any field — all other bases update instantly.
        </p>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {BASE_FIELDS.map((field) => {
          const state = fields[field.id];
          const hasError = Boolean(state.error);

          return (
            <div key={field.id} className="space-y-1.5">
              {/* Label row */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`nbc-${field.id}`}
                  className="text-sm font-medium text-foreground"
                >
                  {field.label}
                </label>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                  {field.badge}
                </span>
              </div>

              {/* Input + copy button */}
              <div className="flex items-stretch gap-2">
                <input
                  id={`nbc-${field.id}`}
                  type="text"
                  inputMode={field.id === 'decimal' ? 'numeric' : 'text'}
                  autoComplete="off"
                  spellCheck={false}
                  value={state.value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-mono bg-background border rounded-md',
                    'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
                    'transition-colors',
                    hasError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-input'
                  )}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `nbc-${field.id}-error` : undefined}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(field.id, state.value)}
                  disabled={!state.value || hasError}
                  title={`Copy ${field.label} value`}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  {copiedId === field.id ? (
                    <>
                      <Check size={14} />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Inline error */}
              {hasError && (
                <p
                  id={`nbc-${field.id}-error`}
                  className="text-xs text-red-500"
                >
                  {state.error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick-reference table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-2 bg-muted border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Quick reference — common values
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Decimal</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Binary</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Octal</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hex</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 8, 10, 15, 16, 255, 256, 1024, 65535].map((dec) => (
                <tr
                  key={dec}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  title={`Click to load ${dec}`}
                  onClick={() => handleChange('decimal', String(dec))}
                >
                  <td className="px-4 py-1.5 text-foreground">{dec}</td>
                  <td className="px-4 py-1.5 text-muted-foreground">{dec.toString(2)}</td>
                  <td className="px-4 py-1.5 text-muted-foreground">{dec.toString(8)}</td>
                  <td className="px-4 py-1.5 text-muted-foreground">{dec.toString(16).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
