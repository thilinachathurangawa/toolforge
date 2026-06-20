'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Calculator } from 'lucide-react';

const QUICK_ROOTS = [
  { degree: 2, label: '√', name: 'Square' },
  { degree: 3, label: '³√', name: 'Cube' },
  { degree: 4, label: '⁴√', name: '4th' },
];

function RootCalculator() {
  const [number, setNumber] = useState<string>('64');
  const [rootDegree, setRootDegree] = useState<string>('3');
  const [result, setResult] = useState<number | null>(null);
  const [radicalForm, setRadicalForm] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    const num = parseFloat(number);
    const degree = parseFloat(rootDegree);

    if (isNaN(num) || isNaN(degree)) {
      setResult(null);
      setRadicalForm('');
      return;
    }

    if (degree === 0) {
      setResult(null);
      setRadicalForm('');
      return;
    }

    const rootResult = Math.pow(num, 1 / degree);
    setResult(rootResult);

    // Generate radical form
    const degreeSymbols: { [key: number]: string } = {
      2: '√',
      3: '³√',
      4: '⁴√',
    };
    const symbol = degreeSymbols[degree] || `ⁿ√(${degree})`;
    setRadicalForm(`${symbol}${num}`);
  }, [number, rootDegree]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      const resultText = `Radical Form: ${radicalForm}\nDecimal: ${result.toFixed(6)}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setNumber('');
    setRootDegree('');
    setResult(null);
    setRadicalForm('');
  };

  const handleQuickRoot = (degree: number) => {
    setRootDegree(degree.toString());
  };

  const getSteps = () => {
    const num = parseFloat(number) || 0;
    const degree = parseFloat(rootDegree) || 1;

    const rootName = degree === 2 ? 'square' : degree === 3 ? 'cube' : `${degree}th`;

    return [
      `Number: ${num}`,
      `Root degree: ${degree} (${rootName} root)`,
      `Calculate: ${num}^(1/${degree})`,
      `Result: ${result?.toFixed(4) || 0}`,
    ];
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
          placeholder="64"
          step="0.01"
        />
      </div>

      {/* Root Degree */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Root Degree (n)</label>
        <input
          type="number"
          value={rootDegree}
          onChange={(e) => setRootDegree(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="3"
          step="1"
          min="1"
        />
      </div>

      {/* Quick Roots */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Quick Roots</label>
        <div className="flex gap-2">
          {QUICK_ROOTS.map((quick) => (
            <button
              key={quick.degree}
              onClick={() => handleQuickRoot(quick.degree)}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                parseFloat(rootDegree) === quick.degree
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-background border-input hover:bg-accent/50'
              }`}
              title={`${quick.name} Root`}
            >
              {quick.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Result
        </h3>

        <div className="text-center py-4">
          <p className="text-4xl font-bold text-foreground">
            {result !== null ? result.toFixed(4) : '—'}
          </p>
        </div>

        {/* Radical Form */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Radical Form:</p>
          <p className="text-2xl font-mono text-foreground">{radicalForm}</p>
        </div>

        {/* Decimal */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Decimal:</p>
          <p className="text-2xl font-semibold text-foreground">
            {result !== null ? result.toFixed(6) : '—'}
          </p>
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

export default RootCalculator;
