'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Triangle } from 'lucide-react';

type SolveFor = 'a' | 'b' | 'c';

const SOLVE_OPTIONS: { value: SolveFor; label: string }[] = [
  { value: 'a', label: 'Side a' },
  { value: 'b', label: 'Side b' },
  { value: 'c', label: 'Hypotenuse (c)' },
];

function PythagoreanTheoremCalculator() {
  const [solveFor, setSolveFor] = useState<SolveFor>('c');
  const [sideA, setSideA] = useState<string>('3');
  const [sideB, setSideB] = useState<string>('4');
  const [sideC, setSideC] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [formula, setFormula] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);

    let calcResult: number | null = null;
    let calcFormula = '';

    switch (solveFor) {
      case 'c':
        if (!isNaN(a) && !isNaN(b)) {
          calcResult = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
          calcFormula = `a² + b² = c²\n${a}² + ${b}² = c²\n${a * a} + ${b * b} = c²\n${a * a + b * b} = c²\nc = √${a * a + b * b} = ${calcResult.toFixed(4)}`;
        }
        break;
      case 'a':
        if (!isNaN(b) && !isNaN(c)) {
          calcResult = Math.sqrt(Math.pow(c, 2) - Math.pow(b, 2));
          calcFormula = `a² + b² = c²\na² = c² - b²\na² = ${c}² - ${b}²\na² = ${c * c} - ${b * b}\na² = ${c * c - b * b}\na = √${c * c - b * b} = ${calcResult.toFixed(4)}`;
        }
        break;
      case 'b':
        if (!isNaN(a) && !isNaN(c)) {
          calcResult = Math.sqrt(Math.pow(c, 2) - Math.pow(a, 2));
          calcFormula = `a² + b² = c²\nb² = c² - a²\nb² = ${c}² - ${a}²\nb² = ${c * c} - ${a * a}\nb² = ${c * c - a * a}\nb = √${c * c - a * a} = ${calcResult.toFixed(4)}`;
        }
        break;
    }

    setResult(calcResult);
    setFormula(calcFormula);
  }, [solveFor, sideA, sideB, sideC]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      const resultText = `Pythagorean Theorem: a² + b² = c²\n\nSolving for: ${solveFor}\nSide a: ${sideA}\nSide b: ${sideB}\nSide c: ${sideC || result.toFixed(4)}\n\nResult: ${solveFor} = ${result.toFixed(4)}\n\n${formula}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSideA('');
    setSideB('');
    setSideC('');
    setResult(null);
    setFormula('');
  };

  const getSteps = () => {
    const a = parseFloat(sideA) || 0;
    const b = parseFloat(sideB) || 0;
    const c = parseFloat(sideC) || 0;

    switch (solveFor) {
      case 'c':
        return [
          `a = ${a}, b = ${b}`,
          `a² = ${a}² = ${a * a}`,
          `b² = ${b}² = ${b * b}`,
          `a² + b² = ${a * a} + ${b * b} = ${a * a + b * b}`,
          `c = √${a * a + b * b} = ${result?.toFixed(4) || 0}`,
        ];
      case 'a':
        return [
          `b = ${b}, c = ${c}`,
          `c² = ${c}² = ${c * c}`,
          `b² = ${b}² = ${b * b}`,
          `a² = c² - b² = ${c * c} - ${b * b} = ${c * c - b * b}`,
          `a = √${c * c - b * b} = ${result?.toFixed(4) || 0}`,
        ];
      case 'b':
        return [
          `a = ${a}, c = ${c}`,
          `c² = ${c}² = ${c * c}`,
          `a² = ${a}² = ${a * a}`,
          `b² = c² - a² = ${c * c} - ${a * a} = ${c * c - a * a}`,
          `b = √${c * c - a * a} = ${result?.toFixed(4) || 0}`,
        ];
    }
  };

  const getInputFields = () => {
    switch (solveFor) {
      case 'c':
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Side a</label>
              <input
                type="number"
                value={sideA}
                onChange={(e) => setSideA(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="3"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Side b</label>
              <input
                type="number"
                value={sideB}
                onChange={(e) => setSideB(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="4"
                step="0.01"
              />
            </div>
          </>
        );
      case 'a':
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Side b</label>
              <input
                type="number"
                value={sideB}
                onChange={(e) => setSideB(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="4"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Hypotenuse (c)</label>
              <input
                type="number"
                value={sideC}
                onChange={(e) => setSideC(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="5"
                step="0.01"
              />
            </div>
          </>
        );
      case 'b':
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Side a</label>
              <input
                type="number"
                value={sideA}
                onChange={(e) => setSideA(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="3"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Hypotenuse (c)</label>
              <input
                type="number"
                value={sideC}
                onChange={(e) => setSideC(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="5"
                step="0.01"
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Solve For Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Find</label>
        <div className="grid grid-cols-3 gap-2">
          {SOLVE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSolveFor(option.value)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                solveFor === option.value
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-background border-input hover:bg-accent/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Known Sides</label>
        <div className="grid grid-cols-2 gap-4">{getInputFields()}</div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Triangle className="w-4 h-4" />
          Results
        </h3>

        <div className="text-center py-4">
          <p className="text-4xl font-bold text-foreground">
            {solveFor} = {result !== null ? result.toFixed(4) : '—'}
          </p>
        </div>

        {/* Formula */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Formula:</p>
          <p className="text-sm font-mono text-foreground whitespace-pre-line">{formula}</p>
        </div>

        {/* Triangle Visualization */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-2">Triangle Visualization:</p>
          <div className="bg-background p-4 rounded border border-input flex items-center justify-center">
            <pre className="text-foreground text-sm">
              {solveFor === 'c' ? `
        │\\
        │ \\
      ${sideB || 'b'} │  \\ ${result?.toFixed(2) || 'c'}
        │   \\
        └────┘
           ${sideA || 'a'}
              ` : solveFor === 'a' ? `
        │\\
        │ \\
      ${sideB || 'b'} │  \\ ${sideC || 'c'}
        │   \\
        └────┘
           ${result?.toFixed(2) || 'a'}
              ` : `
        │\\
        │ \\
      ${result?.toFixed(2) || 'b'} │  \\ ${sideC || 'c'}
        │   \\
        └────┘
           ${sideA || 'a'}
              `}
            </pre>
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

export default PythagoreanTheoremCalculator;
