'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IngredientKey =
  | 'all-purpose-flour'
  | 'white-sugar'
  | 'butter'
  | 'water'
  | 'milk'
  | 'honey'
  | 'salt'
  | 'rice'
  | 'rolled-oats';

type UnitKey = 'cups' | 'tbsp' | 'tsp' | 'ml' | 'g' | 'floz';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const INGREDIENTS: { key: IngredientKey; label: string }[] = [
  { key: 'all-purpose-flour', label: 'All-Purpose Flour' },
  { key: 'white-sugar',       label: 'White Sugar' },
  { key: 'butter',            label: 'Butter' },
  { key: 'water',             label: 'Water' },
  { key: 'milk',              label: 'Milk' },
  { key: 'honey',             label: 'Honey' },
  { key: 'salt',              label: 'Salt (table)' },
  { key: 'rice',              label: 'Rice (uncooked)' },
  { key: 'rolled-oats',       label: 'Rolled Oats' },
];

/** Grams per cup for each ingredient */
const DENSITY_G_PER_CUP: Record<IngredientKey, number> = {
  'all-purpose-flour': 120,
  'white-sugar':       200,
  'butter':            227,
  'water':             237,
  'milk':              245,
  'honey':             340,
  'salt':              292,
  'rice':              185,
  'rolled-oats':        90,
};

const UNITS: { key: UnitKey; label: string; short: string }[] = [
  { key: 'cups', label: 'Cups',         short: 'c'    },
  { key: 'tbsp', label: 'Tablespoons',  short: 'tbsp' },
  { key: 'tsp',  label: 'Teaspoons',    short: 'tsp'  },
  { key: 'ml',   label: 'Milliliters',  short: 'ml'   },
  { key: 'g',    label: 'Grams',        short: 'g'    },
  { key: 'floz', label: 'Fluid Ounces', short: 'fl oz'},
];

// Volume units expressed in ml (canonical volume unit)
const ML_PER_UNIT: Partial<Record<UnitKey, number>> = {
  cups: 236.588,
  tbsp: 14.7868,   // 236.588 / 16
  tsp:  4.92892,   // 236.588 / 48
  ml:   1,
  floz: 29.5735,   // 236.588 / 8
};

const isVolumeUnit = (u: UnitKey): boolean => u !== 'g';
const isMassUnit   = (u: UnitKey): boolean => u === 'g';

// ---------------------------------------------------------------------------
// Conversion core
// ---------------------------------------------------------------------------

/**
 * Convert `value` in `fromUnit` to every other unit, using the ingredient's
 * density for mass↔volume conversions.
 *
 * Strategy:
 *   - Normalise to ml first (if volume input) or grams first (if mass input).
 *   - From ml → any volume unit is trivial.
 *   - From ml → grams: ml → cups → g using density.
 *   - From g  → any volume unit: g → cups → ml → target.
 *   - From g  → g is identity.
 */
function convertAll(
  value: number,
  fromUnit: UnitKey,
  ingredient: IngredientKey,
): Record<UnitKey, number | null> {
  const gPerCup = DENSITY_G_PER_CUP[ingredient];
  const mlPerCup = 236.588;

  // Work in ml for volume, grams for mass — then spread to all targets.
  let baseMl: number | null = null;
  let baseG: number | null = null;

  if (isMassUnit(fromUnit)) {
    baseG  = value;
    // grams → cups → ml
    const cups = value / gPerCup;
    baseMl = cups * mlPerCup;
  } else {
    const mlFactor = ML_PER_UNIT[fromUnit]!;
    baseMl = value * mlFactor;
    // ml → cups → grams
    const cups = baseMl / mlPerCup;
    baseG  = cups * gPerCup;
  }

  const result: Record<UnitKey, number | null> = {} as Record<UnitKey, number | null>;

  for (const { key } of UNITS) {
    if (key === fromUnit) {
      result[key] = value;
    } else if (isMassUnit(key)) {
      result[key] = baseG;
    } else {
      // volume target
      const targetFactor = ML_PER_UNIT[key]!;
      result[key] = baseMl !== null ? baseMl / targetFactor : null;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatValue(val: number | null): string {
  if (val === null) return '—';
  if (val === 0) return '0';
  if (val < 0.001) return val.toExponential(3);
  if (val < 0.01)  return val.toFixed(4);
  if (val < 1)     return val.toFixed(3);
  if (val < 100)   return val.toFixed(2);
  if (val < 10000) return val.toFixed(1);
  return Math.round(val).toLocaleString();
}

// Quick-reference fractions for cups, tbsp, tsp — common in printed recipes
const CUP_FRACTIONS: [number, string][] = [
  [1,     '1'],
  [0.75,  '¾'],
  [0.667, '⅔'],
  [0.5,   '½'],
  [0.333, '⅓'],
  [0.25,  '¼'],
  [0.125, '⅛'],
];

function toFraction(cups: number): string | null {
  for (const [frac, label] of CUP_FRACTIONS) {
    if (Math.abs(cups - frac) < 0.02) return label + ' cup';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CookingMeasurementConverter() {
  const [ingredient, setIngredient] = useState<IngredientKey>('all-purpose-flour');
  const [inputValue, setInputValue] = useState<string>('');
  const [fromUnit, setFromUnit]     = useState<UnitKey>('cups');

  const numericValue = parseFloat(inputValue);
  const hasValue = inputValue.trim() !== '' && !isNaN(numericValue) && numericValue >= 0;

  const results = useMemo(() => {
    if (!hasValue) return null;
    return convertAll(numericValue, fromUnit, ingredient);
  }, [numericValue, fromUnit, ingredient, hasValue]);

  // Fraction hint — only meaningful for cups output
  const fractionHint = useMemo(() => {
    if (!results) return null;
    const cups = results['cups'];
    if (cups === null || fromUnit === 'cups') return null;
    return toFraction(cups);
  }, [results, fromUnit]);

  // Unit icon colours — purely decorative indicator of unit family
  const unitBadgeClass = (key: UnitKey) =>
    key === 'g'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';

  return (
    <div className="w-full space-y-6">

      {/* ── Ingredient selector ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="cmc-ingredient">
          Ingredient
        </label>
        <select
          id="cmc-ingredient"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value as IngredientKey)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {INGREDIENTS.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Density used: <span className="font-medium tabular-nums">{DENSITY_G_PER_CUP[ingredient]} g</span> per cup
        </p>
      </div>

      {/* ── Input row ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="cmc-value">
          Amount
        </label>
        <div className="flex gap-2">
          <input
            id="cmc-value"
            type="number"
            min="0"
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 2.5"
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <select
            value={fromUnit}
            aria-label="From unit"
            onChange={(e) => setFromUnit(e.target.value as UnitKey)}
            className="w-40 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {UNITS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results grid ── */}
      {!hasValue && (
        <div className="rounded-lg border border-dashed border-input p-8 text-center text-sm text-muted-foreground">
          Enter an amount above to see all conversions.
        </div>
      )}

      {hasValue && results && (
        <div className="space-y-3">
          {fractionHint && (
            <p className="text-xs text-muted-foreground text-center">
              Closest cup fraction: <span className="font-semibold text-foreground">{fractionHint}</span>
            </p>
          )}

          {/* Two-column family split: volume | mass */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Volume column */}
            <div className="rounded-lg border border-input overflow-hidden">
              <div className="px-3 py-2 bg-sky-50 dark:bg-sky-950/30 border-b border-input">
                <span className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
                  Volume
                </span>
              </div>
              <div className="divide-y divide-input">
                {UNITS.filter((u) => u.key !== 'g').map(({ key, label, short }) => {
                  const val = results[key];
                  const isSource = key === fromUnit;
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5',
                        isSource && 'bg-muted/60',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-block w-12 text-center text-xs font-mono rounded px-1 py-0.5',
                            unitBadgeClass(key),
                          )}
                        >
                          {short}
                        </span>
                        <span className="text-sm text-foreground">{label}</span>
                        {isSource && (
                          <span className="text-xs text-muted-foreground italic">(input)</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatValue(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mass column */}
            <div className="rounded-lg border border-input overflow-hidden">
              <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-input">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Mass
                </span>
              </div>
              <div className="divide-y divide-input">
                {UNITS.filter((u) => u.key === 'g').map(({ key, label, short }) => {
                  const val = results[key];
                  const isSource = key === fromUnit;
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5',
                        isSource && 'bg-muted/60',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-block w-12 text-center text-xs font-mono rounded px-1 py-0.5',
                            unitBadgeClass(key),
                          )}
                        >
                          {short}
                        </span>
                        <span className="text-sm text-foreground">{label}</span>
                        {isSource && (
                          <span className="text-xs text-muted-foreground italic">(input)</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatValue(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Density note */}
              <div className="px-3 py-2 bg-muted/40 border-t border-input">
                <p className="text-xs text-muted-foreground">
                  Mass values use the ingredient density above. Different brands and
                  measuring techniques can vary by ±5–10%.
                </p>
              </div>
            </div>
          </div>

          {/* Summary sentence */}
          <p className="text-xs text-center text-muted-foreground pt-1">
            {inputValue}{' '}
            {UNITS.find((u) => u.key === fromUnit)?.label.toLowerCase()} of{' '}
            {INGREDIENTS.find((i) => i.key === ingredient)?.label.toLowerCase()}
            {' '}={' '}
            <span className="font-medium text-foreground">
              {formatValue(results['g'])} g
            </span>
            {' '}·{' '}
            <span className="font-medium text-foreground">
              {formatValue(results['ml'])} ml
            </span>
          </p>
        </div>
      )}

      {/* ── Quick-reference card ── */}
      <div className="rounded-lg border border-input bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
          Volume equivalents (all ingredients)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
          {[
            ['1 cup', '16 tbsp'],
            ['1 cup', '48 tsp'],
            ['1 cup', '236.6 ml'],
            ['1 cup', '8 fl oz'],
            ['1 tbsp', '3 tsp'],
            ['1 tbsp', '14.8 ml'],
          ].map(([a, b]) => (
            <div key={a + b} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{a}</span> = {b}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
