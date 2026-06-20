'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Divide } from 'lucide-react';

function RatioCalculator() {
  const [valueA, setValueA] = useState<string>('12');
  const [valueB, setValueB] = useState<string>('18');
  const [valueC, setValueC] = useState<string>('24');
  const [scaleFactor, setScaleFactor] = useState<string>('2');
  const [simplifiedRatio, setSimplifiedRatio] = useState<number[]>([]);
  const [scaledRatio, setScaledRatio] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  // GCD function
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  // GCD for multiple numbers
  const gcdMultiple = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    if (numbers.length === 1) return numbers[0];
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      result = gcd(result, numbers[i]);
    }
    return result;
  };

  const calculate = useCallback(() => {
    const a = parseFloat(valueA);
    const b = parseFloat(valueB);
    const c = valueC ? parseFloat(valueC) : NaN;
    const scale = parseFloat(scaleFactor);

    const values: number[] = [];
    if (!isNaN(a)) values.push(a);
    if (!isNaN(b)) values.push(b);
    if (!isNaN(c)) values.push(c);

    if (values.length < 2) {
      setSimplifiedRatio([]);
      setScaledRatio([]);
      return;
    }

    // Simplify ratio
    const divisor = gcdMultiple(values);
    const simplified = values.map(v => v / divisor);
    setSimplifiedRatio(simplified);

    // Scale ratio
    if (!isNaN(scale) && scale !== 0) {
      const scaled = simplified.map(v => v * scale);
      setScaledRatio(scaled);
    } else {
      setScaledRatio([]);
    }
  }, [valueA, valueB, valueC, scaleFactor]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (simplifiedRatio.length > 0) {
      const ratioStr = simplifiedRatio.join(':');
      const scaledStr = scaledRatio.length > 0 ? scaledRatio.join(':') : '—';
      const resultText = `Simplified Ratio: ${ratioStr}\nScaled Ratio (×${scaleFactor}): ${scaledStr}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setValueA('');
    setValueB('');
    setValueC('');
    setScaleFactor('');
    setSimplifiedRatio([]);
    setScaledRatio([]);
  };

  const getSteps = () => {
    const a = parseFloat(valueA) || 0;
    const b = parseFloat(valueB) || 0;
    const c = valueC ? parseFloat(valueC) : NaN;
    const values: number[] = [];
    if (!isNaN(a)) values.push(a);
    if (!isNaN(b)) values.push(b);
    if (!isNaN(c)) values.push(c);

    if (values.length < 2) return [];

    const divisor = gcdMultiple(values);
    const steps = [
      `Find GCD of ${values.join(', ')}: ${divisor}`,
      'Divide each by GCD:',
    ];

    values.forEach((v, i) => {
      steps.push(`${v} / ${divisor} = ${simplifiedRatio[i]?.toFixed(2) || 0}`);
    });

    steps.push(`Simplified ratio: ${simplifiedRatio.join(':')}`);

    return steps;
  };

  return (
    <div className="w-full space-y-6">
      {/* Ratio Values */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Enter ratio values</label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">A</label>
            <input
              type="number"
              value={valueA}
              onChange={(e) => setValueA(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="12"
              step="0.01"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">B</label>
            <input
              type="number"
              value={valueB}
              onChange={(e) => setValueB(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="18"
              step="0.01"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">C (optional)</label>
            <input
              type="number"
              value={valueC}
              onChange={(e) => setValueC(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="24"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Scale Factor */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Scale by factor</label>
        <input
          type="number"
          value={scaleFactor}
          onChange={(e) => setScaleFactor(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="2"
          step="0.01"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Divide className="w-4 h-4" />
          Results
        </h3>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-foreground/60">Simplified Ratio</p>
            <p className="text-2xl font-semibold text-foreground">
              {simplifiedRatio.length > 0 ? simplifiedRatio.join(':') : '—'}
            </p>
          </div>

          {simplifiedRatio.length >= 2 && (
            <div>
              <p className="text-foreground/60">As Fraction</p>
              <p className="text-lg font-semibold text-foreground">
                {simplifiedRatio[0]}/{simplifiedRatio[1]}
              </p>
            </div>
          )}

          {scaledRatio.length > 0 && (
            <div>
              <p className="text-foreground/60">Scaled Ratio (×{scaleFactor})</p>
              <p className="text-2xl font-semibold text-foreground">
                {scaledRatio.join(':')}
              </p>
            </div>
          )}
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

export default RatioCalculator;
