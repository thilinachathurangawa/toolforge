'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Divide } from 'lucide-react';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

const OPERATIONS: { value: Operation; label: string; symbol: string }[] = [
  { value: 'add', label: 'Add', symbol: '+' },
  { value: 'subtract', label: 'Subtract', symbol: '-' },
  { value: 'multiply', label: 'Multiply', symbol: '×' },
  { value: 'divide', label: 'Divide', symbol: '÷' },
];

function FractionCalculator() {
  const [operation, setOperation] = useState<Operation>('add');
  const [fraction1, setFraction1] = useState({ numerator: '1', denominator: '2' });
  const [fraction2, setFraction2] = useState({ numerator: '1', denominator: '4' });
  const [result, setResult] = useState<{ numerator: number; denominator: number } | null>(null);
  const [mixedNumber, setMixedNumber] = useState<string>('');
  const [decimal, setDecimal] = useState<number | null>(null);
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

  // Simplify fraction
  const simplifyFraction = (numerator: number, denominator: number): { numerator: number; denominator: number } => {
    const divisor = gcd(numerator, denominator);
    return {
      numerator: numerator / divisor,
      denominator: denominator / divisor
    };
  };

  // Convert to mixed number
  const toMixedNumber = (numerator: number, denominator: number): string => {
    if (denominator === 0) return 'Undefined';
    if (Math.abs(numerator) < Math.abs(denominator)) {
      return `${numerator}/${denominator}`;
    }
    const whole = Math.floor(Math.abs(numerator) / Math.abs(denominator));
    const remainder = Math.abs(numerator) % Math.abs(denominator);
    const sign = numerator < 0 ? '-' : '';
    if (remainder === 0) {
      return `${sign}${whole}`;
    }
    return `${sign}${whole} ${remainder}/${Math.abs(denominator)}`;
  };

  const calculate = useCallback(() => {
    const num1 = parseFloat(fraction1.numerator);
    const den1 = parseFloat(fraction1.denominator);
    const num2 = parseFloat(fraction2.numerator);
    const den2 = parseFloat(fraction2.denominator);

    if (isNaN(num1) || isNaN(den1) || isNaN(num2) || isNaN(den2) || den1 === 0 || den2 === 0) {
      setResult(null);
      setMixedNumber('');
      setDecimal(null);
      return;
    }

    let resultNum: number;
    let resultDen: number;

    switch (operation) {
      case 'add':
        resultNum = num1 * den2 + num2 * den1;
        resultDen = den1 * den2;
        break;
      case 'subtract':
        resultNum = num1 * den2 - num2 * den1;
        resultDen = den1 * den2;
        break;
      case 'multiply':
        resultNum = num1 * num2;
        resultDen = den1 * den2;
        break;
      case 'divide':
        if (num2 === 0) {
          setResult(null);
          setMixedNumber('');
          setDecimal(null);
          return;
        }
        resultNum = num1 * den2;
        resultDen = den1 * num2;
        break;
      default:
        resultNum = 0;
        resultDen = 1;
    }

    const simplified = simplifyFraction(resultNum, resultDen);
    setResult(simplified);
    setMixedNumber(toMixedNumber(simplified.numerator, simplified.denominator));
    setDecimal(simplified.numerator / simplified.denominator);
  }, [operation, fraction1, fraction2]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null && decimal !== null) {
      const resultText = `Result: ${result.numerator}/${result.denominator}\nMixed Number: ${mixedNumber}\nDecimal: ${decimal.toFixed(4)}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSteps = () => {
    const num1 = parseFloat(fraction1.numerator) || 0;
    const den1 = parseFloat(fraction1.denominator) || 1;
    const num2 = parseFloat(fraction2.numerator) || 0;
    const den2 = parseFloat(fraction2.denominator) || 1;
    const opSymbol = OPERATIONS.find(op => op.value === operation)?.symbol || '';

    switch (operation) {
      case 'add':
        return [
          `Find common denominator: ${den1} × ${den2} = ${den1 * den2}`,
          `Convert fractions: ${num1}/${den1} = ${(num1 * den2)}/${den1 * den2}, ${num2}/${den2} = ${(num2 * den1)}/${den1 * den2}`,
          `Add numerators: ${(num1 * den2)} + ${(num2 * den1)} = ${num1 * den2 + num2 * den1}`,
          `Result: ${num1 * den2 + num2 * den1}/${den1 * den2}`,
          `Simplify: ${result?.numerator}/${result?.denominator}`,
        ];
      case 'subtract':
        return [
          `Find common denominator: ${den1} × ${den2} = ${den1 * den2}`,
          `Convert fractions: ${num1}/${den1} = ${(num1 * den2)}/${den1 * den2}, ${num2}/${den2} = ${(num2 * den1)}/${den1 * den2}`,
          `Subtract numerators: ${(num1 * den2)} - ${(num2 * den1)} = ${num1 * den2 - num2 * den1}`,
          `Result: ${num1 * den2 - num2 * den1}/${den1 * den2}`,
          `Simplify: ${result?.numerator}/${result?.denominator}`,
        ];
      case 'multiply':
        return [
          `Multiply numerators: ${num1} × ${num2} = ${num1 * num2}`,
          `Multiply denominators: ${den1} × ${den2} = ${den1 * den2}`,
          `Result: ${num1 * num2}/${den1 * den2}`,
          `Simplify: ${result?.numerator}/${result?.denominator}`,
        ];
      case 'divide':
        return [
          `Flip second fraction: ${num2}/${den2} → ${den2}/${num2}`,
          `Multiply numerators: ${num1} × ${den2} = ${num1 * den2}`,
          `Multiply denominators: ${den1} × ${num2} = ${den1 * num2}`,
          `Result: ${num1 * den2}/${den1 * num2}`,
          `Simplify: ${result?.numerator}/${result?.denominator}`,
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Operation Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Operation</label>
        <div className="grid grid-cols-4 gap-2">
          {OPERATIONS.map((op) => (
            <button
              key={op.value}
              onClick={() => setOperation(op.value)}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                operation === op.value
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-background border-input hover:bg-accent/50'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fraction 1 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Fraction 1</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">Numerator</label>
            <input
              type="number"
              value={fraction1.numerator}
              onChange={(e) => setFraction1({ ...fraction1, numerator: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="1"
              step="1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">Denominator</label>
            <input
              type="number"
              value={fraction1.denominator}
              onChange={(e) => setFraction1({ ...fraction1, denominator: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="2"
              step="1"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Fraction 2 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Fraction 2</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">Numerator</label>
            <input
              type="number"
              value={fraction2.numerator}
              onChange={(e) => setFraction2({ ...fraction2, numerator: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="1"
              step="1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">Denominator</label>
            <input
              type="number"
              value={fraction2.denominator}
              onChange={(e) => setFraction2({ ...fraction2, denominator: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="4"
              step="1"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Divide className="w-4 h-4" />
          Results
        </h3>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Fraction</p>
            <p className="text-lg font-semibold text-foreground">
              {result ? `${result.numerator}/${result.denominator}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Mixed Number</p>
            <p className="text-lg font-semibold text-foreground">{mixedNumber || '—'}</p>
          </div>
          <div>
            <p className="text-foreground/60">Decimal</p>
            <p className="text-lg font-semibold text-foreground">
              {decimal !== null ? decimal.toFixed(4) : '—'}
            </p>
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

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy Result'}
      </button>
    </div>
  );
}

export default FractionCalculator;
