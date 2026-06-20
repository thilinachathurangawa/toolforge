'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Zap } from 'lucide-react';

function ExponentCalculator() {
  const [base, setBase] = useState<string>('2');
  const [exponent, setExponent] = useState<string>('10');
  const [result, setResult] = useState<number | null>(null);
  const [expandedForm, setExpandedForm] = useState<string>('');
  const [scientificNotation, setScientificNotation] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    const baseNum = parseFloat(base);
    const expNum = parseFloat(exponent);

    if (isNaN(baseNum) || isNaN(expNum)) {
      setResult(null);
      setExpandedForm('');
      setScientificNotation('');
      return;
    }

    const calcResult = Math.pow(baseNum, expNum);
    setResult(calcResult);

    // Generate expanded form for small integer exponents
    if (Number.isInteger(expNum) && expNum >= 0 && expNum <= 10) {
      if (expNum === 0) {
        setExpandedForm('1');
      } else {
        const parts = Array(Math.abs(expNum)).fill(baseNum.toString());
        setExpandedForm(parts.join(' × '));
      }
    } else {
      setExpandedForm('Not available for this exponent');
    }

    // Convert to scientific notation
    if (calcResult === 0) {
      setScientificNotation('0');
    } else {
      const exp = Math.floor(Math.log10(Math.abs(calcResult)));
      const mantissa = (calcResult / Math.pow(10, exp)).toFixed(3);
      setScientificNotation(`${mantissa} × 10^${exp}`);
    }
  }, [base, exponent]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      const resultText = `Calculation: ${base}^${exponent} = ${result.toFixed(4)}\nExpanded: ${expandedForm}\nScientific Notation: ${scientificNotation}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setBase('');
    setExponent('');
    setResult(null);
    setExpandedForm('');
    setScientificNotation('');
  };

  const getSteps = () => {
    const baseNum = parseFloat(base) || 0;
    const expNum = parseFloat(exponent) || 0;

    return [
      `Base: ${baseNum}`,
      `Exponent: ${expNum}`,
      expNum >= 0 && Number.isInteger(expNum) && expNum <= 10
        ? `Multiply base by itself ${expNum} times`
        : `Calculate using power function`,
      `Result: ${result?.toFixed(4) || 0}`,
    ];
  };

  return (
    <div className="w-full space-y-6">
      {/* Base */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Base (b)</label>
        <input
          type="number"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="2"
          step="0.01"
        />
      </div>

      {/* Exponent */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Exponent (n)</label>
        <input
          type="number"
          value={exponent}
          onChange={(e) => setExponent(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="10"
          step="0.01"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Result
        </h3>

        <div className="text-center py-4">
          <p className="text-4xl font-bold text-foreground">
            {result !== null ? result.toFixed(4) : '—'}
          </p>
        </div>

        {/* Calculation */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Calculation:</p>
          <p className="text-sm font-mono text-foreground">
            {base}^{exponent} = {result !== null ? result.toFixed(4) : '—'}
          </p>
        </div>

        {/* Expanded Form */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Expanded Form:</p>
          <p className="text-sm text-foreground">{expandedForm}</p>
        </div>

        {/* Scientific Notation */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Scientific Notation:</p>
          <p className="text-sm text-foreground">{scientificNotation}</p>
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

export default ExponentCalculator;
