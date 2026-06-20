'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Calculator } from 'lucide-react';

type Mode = 'convert' | 'operate';
type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

const MODES: { value: Mode; label: string }[] = [
  { value: 'convert', label: 'Convert' },
  { value: 'operate', label: 'Operate' },
];

const OPERATIONS: { value: Operation; label: string; symbol: string }[] = [
  { value: 'add', label: 'Addition', symbol: '+' },
  { value: 'subtract', label: 'Subtraction', symbol: '-' },
  { value: 'multiply', label: 'Multiplication', symbol: '×' },
  { value: 'divide', label: 'Division', symbol: '÷' },
];

function ScientificNotationCalculator() {
  const [mode, setMode] = useState<Mode>('convert');
  const [standardForm, setStandardForm] = useState<string>('1234567');
  const [mantissa, setMantissa] = useState<string>('1');
  const [exponent, setExponent] = useState<string>('6');
  const [operation, setOperation] = useState<Operation>('multiply');
  const [num1Mantissa, setNum1Mantissa] = useState<string>('2.5');
  const [num1Exponent, setNum1Exponent] = useState<string>('3');
  const [num2Mantissa, setNum2Mantissa] = useState<string>('4');
  const [num2Exponent, setNum2Exponent] = useState<string>('2');
  const [resultMantissa, setResultMantissa] = useState<number | null>(null);
  const [resultExponent, setResultExponent] = useState<number | null>(null);
  const [resultStandard, setResultStandard] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Convert standard form to scientific notation
  const toScientificNotation = (num: number): { mantissa: number; exponent: number; string: string } => {
    if (num === 0) return { mantissa: 0, exponent: 0, string: '0 × 10⁰' };
    
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const mant = num / Math.pow(10, exp);
    
    return {
      mantissa: mant,
      exponent: exp,
      string: `${mant.toFixed(6)} × 10^${exp}`
    };
  };

  // Convert scientific notation to standard form
  const toStandardForm = (mant: number, exp: number): number => {
    return mant * Math.pow(10, exp);
  };

  // Format number with commas
  const formatWithCommas = (num: number): string => {
    return num.toLocaleString();
  };

  // Normalize mantissa to 1-10 range
  const normalizeMantissa = (mant: number, exp: number): { mantissa: number; exponent: number } => {
    if (mant === 0) return { mantissa: 0, exponent: 0 };
    
    let newMant = mant;
    let newExp = exp;
    
    while (Math.abs(newMant) >= 10) {
      newMant /= 10;
      newExp += 1;
    }
    
    while (Math.abs(newMant) < 1 && newMant !== 0) {
      newMant *= 10;
      newExp -= 1;
    }
    
    return { mantissa: newMant, exponent: newExp };
  };

  const calculate = useCallback(() => {
    if (mode === 'convert') {
      const num = parseFloat(standardForm);
      if (isNaN(num)) {
        setMantissa('');
        setExponent('');
        setResultMantissa(null);
        setResultExponent(null);
        setResultStandard('');
        return;
      }

      const sci = toScientificNotation(num);
      setMantissa(sci.mantissa.toFixed(6));
      setExponent(sci.exponent.toString());
      setResultMantissa(sci.mantissa);
      setResultExponent(sci.exponent);
      setResultStandard(formatWithCommas(num));
    } else {
      const m1 = parseFloat(num1Mantissa);
      const e1 = parseFloat(num1Exponent);
      const m2 = parseFloat(num2Mantissa);
      const e2 = parseFloat(num2Exponent);

      if (isNaN(m1) || isNaN(e1) || isNaN(m2) || isNaN(e2)) {
        setResultMantissa(null);
        setResultExponent(null);
        setResultStandard('');
        return;
      }

      let result: number;
      let steps: string[] = [];

      const std1 = toStandardForm(m1, e1);
      const std2 = toStandardForm(m2, e2);

      switch (operation) {
        case 'add':
          result = std1 + std2;
          steps.push(`Convert to standard: ${m1} × 10^${e1} = ${formatWithCommas(std1)}`);
          steps.push(`Convert to standard: ${m2} × 10^${e2} = ${formatWithCommas(std2)}`);
          steps.push(`Add: ${formatWithCommas(std1)} + ${formatWithCommas(std2)} = ${formatWithCommas(result)}`);
          break;
        case 'subtract':
          result = std1 - std2;
          steps.push(`Convert to standard: ${m1} × 10^${e1} = ${formatWithCommas(std1)}`);
          steps.push(`Convert to standard: ${m2} × 10^${e2} = ${formatWithCommas(std2)}`);
          steps.push(`Subtract: ${formatWithCommas(std1)} - ${formatWithCommas(std2)} = ${formatWithCommas(result)}`);
          break;
        case 'multiply':
          const multMant = m1 * m2;
          const multExp = e1 + e2;
          const normalizedMult = normalizeMantissa(multMant, multExp);
          result = toStandardForm(normalizedMult.mantissa, normalizedMult.exponent);
          steps.push(`Multiply mantissas: ${m1} × ${m2} = ${multMant}`);
          steps.push(`Add exponents: ${e1} + ${e2} = ${multExp}`);
          steps.push(`Result: ${multMant} × 10^${multExp}`);
          steps.push(`Normalize: ${normalizedMult.mantissa.toFixed(6)} × 10^${normalizedMult.exponent}`);
          break;
        case 'divide':
          const divMant = m1 / m2;
          const divExp = e1 - e2;
          const normalizedDiv = normalizeMantissa(divMant, divExp);
          result = toStandardForm(normalizedDiv.mantissa, normalizedDiv.exponent);
          steps.push(`Divide mantissas: ${m1} ÷ ${m2} = ${divMant}`);
          steps.push(`Subtract exponents: ${e1} - ${e2} = ${divExp}`);
          steps.push(`Result: ${divMant} × 10^${divExp}`);
          steps.push(`Normalize: ${normalizedDiv.mantissa.toFixed(6)} × 10^${normalizedDiv.exponent}`);
          break;
      }

      const sci = toScientificNotation(result);
      const normalized = normalizeMantissa(sci.mantissa, sci.exponent);
      
      setResultMantissa(normalized.mantissa);
      setResultExponent(normalized.exponent);
      setResultStandard(formatWithCommas(result));
    }
  }, [mode, standardForm, mantissa, exponent, operation, num1Mantissa, num1Exponent, num2Mantissa, num2Exponent]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (resultMantissa !== null && resultExponent !== null) {
      const sciNotation = `${resultMantissa.toFixed(6)} × 10^${resultExponent}`;
      const resultText = `Scientific Notation: ${sciNotation}\nStandard Form: ${resultStandard}\n\nMantissa: ${resultMantissa.toFixed(6)}\nExponent: ${resultExponent}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setStandardForm('');
    setMantissa('');
    setExponent('');
    setNum1Mantissa('');
    setNum1Exponent('');
    setNum2Mantissa('');
    setNum2Exponent('');
    setResultMantissa(null);
    setResultExponent(null);
    setResultStandard('');
  };

  const getSteps = () => {
    if (mode === 'convert') {
      const num = parseFloat(standardForm) || 0;
      return [
        `Number: ${num}`,
        `Find exponent: log10(|${num}|) = ${Math.floor(Math.log10(Math.abs(num)))}`,
        `Calculate mantissa: ${num} / 10^${Math.floor(Math.log10(Math.abs(num)))} = ${(num / Math.pow(10, Math.floor(Math.log10(Math.abs(num))))).toFixed(6)}`,
        `Result: ${(num / Math.pow(10, Math.floor(Math.log10(Math.abs(num))))).toFixed(6)} × 10^${Math.floor(Math.log10(Math.abs(num)))}`,
      ];
    } else {
      const m1 = parseFloat(num1Mantissa) || 0;
      const e1 = parseFloat(num1Exponent) || 0;
      const m2 = parseFloat(num2Mantissa) || 0;
      const e2 = parseFloat(num2Exponent) || 0;
      const std1 = toStandardForm(m1, e1);
      const std2 = toStandardForm(m2, e2);

      const steps: string[] = [];
      
      if (operation === 'add' || operation === 'subtract') {
        steps.push(`Convert to standard: ${m1} × 10^${e1} = ${formatWithCommas(std1)}`);
        steps.push(`Convert to standard: ${m2} × 10^${e2} = ${formatWithCommas(std2)}`);
        const op = operation === 'add' ? '+' : '-';
        const result = operation === 'add' ? std1 + std2 : std1 - std2;
        steps.push(`${operation === 'add' ? 'Add' : 'Subtract'}: ${formatWithCommas(std1)} ${op} ${formatWithCommas(std2)} = ${formatWithCommas(result)}`);
        steps.push(`Convert to scientific: ${formatWithCommas(result)} = ${resultMantissa?.toFixed(6)} × 10^${resultExponent}`);
      } else {
        if (operation === 'multiply') {
          const multMant = m1 * m2;
          const multExp = e1 + e2;
          steps.push(`Multiply mantissas: ${m1} × ${m2} = ${multMant}`);
          steps.push(`Add exponents: ${e1} + ${e2} = ${multExp}`);
          steps.push(`Result: ${multMant} × 10^${multExp}`);
        } else {
          const divMant = m1 / m2;
          const divExp = e1 - e2;
          steps.push(`Divide mantissas: ${m1} ÷ ${m2} = ${divMant}`);
          steps.push(`Subtract exponents: ${e1} - ${e2} = ${divExp}`);
          steps.push(`Result: ${divMant} × 10^${divExp}`);
        }
        steps.push(`Normalize: ${resultMantissa?.toFixed(6)} × 10^${resultExponent}`);
      }
      
      return steps;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                mode === m.value
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-background border-input hover:bg-accent/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Convert Mode */}
      {mode === 'convert' && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Standard Form</label>
            <input
              type="number"
              value={standardForm}
              onChange={(e) => setStandardForm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="1234567"
              step="any"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Mantissa</label>
              <input
                type="number"
                value={mantissa}
                onChange={(e) => setMantissa(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="1.234567"
                step="any"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Exponent</label>
              <input
                type="number"
                value={exponent}
                onChange={(e) => setExponent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="6"
                step="1"
              />
            </div>
          </div>
        </>
      )}

      {/* Operate Mode */}
      {mode === 'operate' && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Operation</label>
            <div className="grid grid-cols-4 gap-2">
              {OPERATIONS.map((op) => (
                <button
                  key={op.value}
                  onClick={() => setOperation(op.value)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    operation === op.value
                      ? 'bg-accent border-accent text-accent-foreground'
                      : 'bg-background border-input hover:bg-accent/50'
                  }`}
                  title={op.label}
                >
                  {op.symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Number 1</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={num1Mantissa}
                  onChange={(e) => setNum1Mantissa(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder="2.5"
                  step="any"
                />
                <input
                  type="number"
                  value={num1Exponent}
                  onChange={(e) => setNum1Exponent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder="3"
                  step="1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Number 2</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={num2Mantissa}
                  onChange={(e) => setNum2Mantissa(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder="4"
                  step="any"
                />
                <input
                  type="number"
                  value={num2Exponent}
                  onChange={(e) => setNum2Exponent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder="2"
                  step="1"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Results
        </h3>

        <div className="text-center py-4">
          <p className="text-3xl font-bold text-foreground">
            {resultMantissa !== null && resultExponent !== null
              ? `${resultMantissa.toFixed(6)} × 10^${resultExponent}`
              : '—'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Standard Form</p>
            <p className="text-lg font-semibold text-foreground">{resultStandard}</p>
          </div>
          <div>
            <p className="text-foreground/60">Mantissa</p>
            <p className="text-lg font-semibold text-foreground">
              {resultMantissa !== null ? resultMantissa.toFixed(6) : '—'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Exponent</p>
            <p className="text-lg font-semibold text-foreground">
              {resultExponent !== null ? resultExponent : '—'}
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

export default ScientificNotationCalculator;
