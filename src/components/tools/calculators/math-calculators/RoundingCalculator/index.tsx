'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ArrowUpDown } from 'lucide-react';

function RoundingCalculator() {
  const [number, setNumber] = useState<string>('3.14159');
  const [decimalPlaces, setDecimalPlaces] = useState<string>('2');
  const [result, setResult] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'same'>('same');
  const [copied, setCopied] = useState(false);

  const roundToPlaces = (num: number, places: number): number => {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
  };

  const getRoundingDirection = (original: number, rounded: number): 'up' | 'down' | 'same' => {
    if (original === rounded) return 'same';
    return original < rounded ? 'up' : 'down';
  };

  const getRoundingDigit = (num: number, places: number): number => {
    const factor = Math.pow(10, places + 1);
    const shifted = Math.abs(num * factor);
    return Math.floor(shifted) % 10;
  };

  const calculate = useCallback(() => {
    const num = parseFloat(number);
    const places = parseInt(decimalPlaces);

    if (isNaN(num) || isNaN(places)) {
      setResult(null);
      setDirection('same');
      return;
    }

    const rounded = roundToPlaces(num, places);
    setResult(rounded);
    setDirection(getRoundingDirection(num, rounded));
  }, [number, decimalPlaces]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      const resultText = `Original: ${number}\nRounded to: ${decimalPlaces} decimal places\nResult: ${result.toFixed(6)}\nDirection: ${direction}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setNumber('');
    setDecimalPlaces('');
    setResult(null);
    setDirection('same');
  };

  const getSteps = () => {
    const num = parseFloat(number) || 0;
    const places = parseInt(decimalPlaces) || 0;
    const roundingDigit = getRoundingDigit(num, places);

    return [
      `Number: ${num}`,
      `Look at ${places + 1}${getOrdinalSuffix(places + 1)} decimal: ${roundingDigit}`,
      roundingDigit >= 5 ? `${roundingDigit} >= 5, so round up` : `${roundingDigit} < 5, so round down`,
      `Result: ${result?.toFixed(6) || 0}`,
    ];
  };

  const getOrdinalSuffix = (n: number): string => {
    if (n === 1) return 'st';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
  };

  return (
    <div className="w-full space-y-6">
      {/* Number */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Number</label>
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="3.14159"
          step="0.00001"
        />
      </div>

      {/* Decimal Places */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Decimal Places</label>
        <input
          type="number"
          value={decimalPlaces}
          onChange={(e) => setDecimalPlaces(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="2"
          step="1"
        />
        <p className="text-xs text-foreground/60">(Use negative for tens, hundreds, etc.)</p>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" />
          Result
        </h3>

        <div className="text-center py-4">
          <p className="text-4xl font-bold text-foreground">
            {result !== null ? result.toFixed(6) : '—'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Original</p>
            <p className="text-lg font-semibold text-foreground">{number}</p>
          </div>
          <div>
            <p className="text-foreground/60">Rounded to</p>
            <p className="text-lg font-semibold text-foreground">
              {decimalPlaces} decimal place{parseInt(decimalPlaces) !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Direction</p>
            <p className="text-lg font-semibold text-foreground capitalize">{direction}</p>
          </div>
        </div>

        {/* Step-by-step */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-2">Step-by-step:</p>
          <ol className="space-y-1 text-sm text-foreground">
            {getSteps().map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-foreground/60">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default RoundingCalculator;
