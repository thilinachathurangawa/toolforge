'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

function PercentageErrorCalculator() {
  const [exactValue, setExactValue] = useState<string>('100');
  const [approximateValue, setApproximateValue] = useState<string>('95');
  const [percentageError, setPercentageError] = useState<number | null>(null);
  const [absoluteError, setAbsoluteError] = useState<number | null>(null);
  const [relativeError, setRelativeError] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    const exact = parseFloat(exactValue);
    const approximate = parseFloat(approximateValue);

    if (isNaN(exact) || isNaN(approximate)) {
      setPercentageError(null);
      setAbsoluteError(null);
      setRelativeError(null);
      return;
    }

    if (exact === 0) {
      setPercentageError(null);
      setAbsoluteError(Math.abs(approximate - exact));
      setRelativeError(null);
      return;
    }

    const absError = Math.abs(approximate - exact);
    const relError = absError / Math.abs(exact);
    const pctError = relError * 100;

    setAbsoluteError(absError);
    setRelativeError(relError);
    setPercentageError(pctError);
  }, [exactValue, approximateValue]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (percentageError !== null && absoluteError !== null) {
      const resultText = `Percentage Error: ${percentageError.toFixed(4)}%\nAbsolute Error: ${absoluteError.toFixed(4)}\nRelative Error: ${relativeError?.toFixed(6) || '—'}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setExactValue('');
    setApproximateValue('');
    setPercentageError(null);
    setAbsoluteError(null);
    setRelativeError(null);
  };

  const getFormula = () => {
    const exact = parseFloat(exactValue) || 0;
    const approximate = parseFloat(approximateValue) || 0;
    const diff = approximate - exact;
    return `|${approximate} - ${exact}| / ${exact} × 100 = ${percentageError?.toFixed(2) || 0}%`;
  };

  const getSteps = () => {
    const exact = parseFloat(exactValue) || 0;
    const approximate = parseFloat(approximateValue) || 0;
    const diff = approximate - exact;

    return [
      `Calculate difference: ${approximate} - ${exact} = ${diff.toFixed(4)}`,
      `Take absolute value: |${diff.toFixed(4)}| = ${Math.abs(diff).toFixed(4)}`,
      `Divide by exact: ${Math.abs(diff).toFixed(4)} / ${exact} = ${relativeError?.toFixed(6) || 0}`,
      `Multiply by 100: ${relativeError?.toFixed(6) || 0} × 100 = ${percentageError?.toFixed(2) || 0}%`,
    ];
  };

  return (
    <div className="w-full space-y-6">
      {/* Exact Value */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Exact Value</label>
        <input
          type="number"
          value={exactValue}
          onChange={(e) => setExactValue(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="100"
          step="0.01"
        />
      </div>

      {/* Approximate Value */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Approximate Value</label>
        <input
          type="number"
          value={approximateValue}
          onChange={(e) => setApproximateValue(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="95"
          step="0.01"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Results
        </h3>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Percentage Error</p>
            <p className="text-2xl font-semibold text-foreground">
              {percentageError !== null ? `${percentageError.toFixed(2)}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Absolute Error</p>
            <p className="text-2xl font-semibold text-foreground">
              {absoluteError !== null ? absoluteError.toFixed(4) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Relative Error</p>
            <p className="text-2xl font-semibold text-foreground">
              {relativeError !== null ? relativeError.toFixed(6) : '—'}
            </p>
          </div>
        </div>

        {/* Formula */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Formula:</p>
          <p className="text-sm font-mono text-foreground">{getFormula()}</p>
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

export default PercentageErrorCalculator;
