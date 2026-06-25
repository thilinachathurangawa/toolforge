'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Conversion helpers ───────────────────────────────────────────────────────

function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

function celsiusToKelvin(c: number): number {
  return c + 273.15;
}

function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

function kelvinToCelsius(k: number): number {
  return k - 273.15;
}

function formatTemp(value: number): string {
  // Show up to 4 decimal places, strip trailing zeros
  return parseFloat(value.toFixed(4)).toString();
}

// ─── Quick presets ────────────────────────────────────────────────────────────

const PRESETS: { label: string; celsius: number }[] = [
  { label: 'Absolute Zero', celsius: -273.15 },
  { label: 'Freezing', celsius: 0 },
  { label: 'Room Temp', celsius: 20 },
  { label: 'Body Temp', celsius: 37 },
  { label: 'Boiling', celsius: 100 },
];

// ─── Reference table data ─────────────────────────────────────────────────────

const REFERENCE_ROWS: { description: string; celsius: number }[] = [
  { description: 'Absolute Zero', celsius: -273.15 },
  { description: 'Dry Ice (CO₂)', celsius: -78.5 },
  { description: 'Frozen Food Storage', celsius: -18 },
  { description: 'Water Freezing', celsius: 0 },
  { description: 'Refrigerator', celsius: 4 },
  { description: 'Room Temperature', celsius: 20 },
  { description: 'Human Body Temp', celsius: 37 },
  { description: 'Pasteurization', celsius: 72 },
  { description: 'Water Boiling', celsius: 100 },
  { description: 'Oven (Moderate)', celsius: 175 },
];

// ─── Component ────────────────────────────────────────────────────────────────

type Field = 'celsius' | 'fahrenheit' | 'kelvin';

interface CopiedState {
  celsius: boolean;
  fahrenheit: boolean;
  kelvin: boolean;
}

export function TemperatureConverter() {
  const [celsius, setCelsius] = useState('');
  const [fahrenheit, setFahrenheit] = useState('');
  const [kelvin, setKelvin] = useState('');
  const [copied, setCopied] = useState<CopiedState>({
    celsius: false,
    fahrenheit: false,
    kelvin: false,
  });

  // ── Sync all fields from a single source ──────────────────────────────────

  const syncFromCelsius = useCallback((rawC: string) => {
    setCelsius(rawC);
    const c = parseFloat(rawC);
    if (rawC === '' || rawC === '-' || isNaN(c)) {
      setFahrenheit('');
      setKelvin('');
      return;
    }
    setFahrenheit(formatTemp(celsiusToFahrenheit(c)));
    setKelvin(formatTemp(celsiusToKelvin(c)));
  }, []);

  const syncFromFahrenheit = useCallback((rawF: string) => {
    setFahrenheit(rawF);
    const f = parseFloat(rawF);
    if (rawF === '' || rawF === '-' || isNaN(f)) {
      setCelsius('');
      setKelvin('');
      return;
    }
    const c = fahrenheitToCelsius(f);
    setCelsius(formatTemp(c));
    setKelvin(formatTemp(celsiusToKelvin(c)));
  }, []);

  const syncFromKelvin = useCallback((rawK: string) => {
    setKelvin(rawK);
    const k = parseFloat(rawK);
    if (rawK === '' || rawK === '-' || isNaN(k)) {
      setCelsius('');
      setFahrenheit('');
      return;
    }
    const c = kelvinToCelsius(k);
    setCelsius(formatTemp(c));
    setFahrenheit(formatTemp(celsiusToFahrenheit(c)));
  }, []);

  // ── Copy handler ─────────────────────────────────────────────────────────

  const handleCopy = useCallback(
    (field: Field) => {
      const valueMap: Record<Field, string> = {
        celsius,
        fahrenheit,
        kelvin,
      };
      const val = valueMap[field];
      if (!val) return;
      navigator.clipboard.writeText(val).then(() => {
        setCopied((prev) => ({ ...prev, [field]: true }));
        setTimeout(
          () => setCopied((prev) => ({ ...prev, [field]: false })),
          2000
        );
      });
    },
    [celsius, fahrenheit, kelvin]
  );

  // ── Preset handler ───────────────────────────────────────────────────────

  const applyPreset = useCallback(
    (c: number) => {
      syncFromCelsius(formatTemp(c));
    },
    [syncFromCelsius]
  );

  // ── Input field renderer ─────────────────────────────────────────────────

  function InputRow({
    label,
    unit,
    value,
    field,
    onChange,
    placeholder,
  }: {
    label: string;
    unit: string;
    value: string;
    field: Field;
    onChange: (v: string) => void;
    placeholder: string;
  }) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">
          {label}{' '}
          <span className="text-muted-foreground font-normal">({unit})</span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            aria-label={label}
          />
          <button
            onClick={() => handleCopy(field)}
            disabled={!value}
            title={`Copy ${label} value`}
            className={cn(
              'flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-colors',
              value
                ? 'border-input bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'border-input bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            )}
          >
            {copied[field] ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
            <span className="hidden sm:inline">
              {copied[field] ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* ── Converter inputs ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <InputRow
          label="Celsius"
          unit="°C"
          value={celsius}
          field="celsius"
          onChange={syncFromCelsius}
          placeholder="e.g. 100"
        />
        <InputRow
          label="Fahrenheit"
          unit="°F"
          value={fahrenheit}
          field="fahrenheit"
          onChange={syncFromFahrenheit}
          placeholder="e.g. 212"
        />
        <InputRow
          label="Kelvin"
          unit="K"
          value={kelvin}
          field="kelvin"
          onChange={syncFromKelvin}
          placeholder="e.g. 373.15"
        />
      </div>

      {/* ── Quick-preset buttons ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.celsius)}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-input"
            >
              {preset.label}
              <span className="ml-1 text-muted-foreground">
                ({formatTemp(preset.celsius)}°C)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Reference table ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Common Temperature Reference Points
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-left">
                <th className="px-4 py-2.5 font-semibold text-foreground whitespace-nowrap">
                  Description
                </th>
                <th className="px-4 py-2.5 font-semibold text-foreground text-right whitespace-nowrap">
                  °C
                </th>
                <th className="px-4 py-2.5 font-semibold text-foreground text-right whitespace-nowrap">
                  °F
                </th>
                <th className="px-4 py-2.5 font-semibold text-foreground text-right whitespace-nowrap">
                  K
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {REFERENCE_ROWS.map((row, index) => {
                const f = celsiusToFahrenheit(row.celsius);
                const k = celsiusToKelvin(row.celsius);
                return (
                  <tr
                    key={row.description}
                    className={cn(
                      'transition-colors hover:bg-muted/30',
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    )}
                  >
                    <td className="px-4 py-2.5 text-foreground whitespace-nowrap">
                      {row.description}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatTemp(row.celsius)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatTemp(f)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatTemp(k)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
