'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Shuffle } from 'lucide-react';

function PermutationCombinationCalculator() {
  const [n, setN] = useState<string>('10');
  const [r, setR] = useState<string>('3');
  const [permutation, setPermutation] = useState<number | null>(null);
  const [combination, setCombination] = useState<number | null>(null);
  const [nFactorial, setNFactorial] = useState<number | null>(null);
  const [rFactorial, setRFactorial] = useState<number | null>(null);
  const [nMinusRFactorial, setNMinusRFactorial] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate factorial
  const factorial = (num: number): number => {
    if (num < 0) return NaN;
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };

  // Calculate permutation nPr
  const calculatePermutation = (nVal: number, rVal: number): number => {
    if (rVal > nVal || rVal < 0) return 0;
    return factorial(nVal) / factorial(nVal - rVal);
  };

  // Calculate combination nCr
  const calculateCombination = (nVal: number, rVal: number): number => {
    if (rVal > nVal || rVal < 0) return 0;
    return factorial(nVal) / (factorial(rVal) * factorial(nVal - rVal));
  };

  // Format large numbers with commas
  const formatNumber = (num: number | null): string => {
    if (num === null) return '—';
    return num.toLocaleString();
  };

  const calculate = useCallback(() => {
    const nVal = parseInt(n);
    const rVal = parseInt(r);

    if (isNaN(nVal) || isNaN(rVal) || nVal < 0 || rVal < 0) {
      setPermutation(null);
      setCombination(null);
      setNFactorial(null);
      setRFactorial(null);
      setNMinusRFactorial(null);
      return;
    }

    const nFact = factorial(nVal);
    const rFact = factorial(rVal);
    const nMinusRFact = factorial(nVal - rVal);
    const perm = calculatePermutation(nVal, rVal);
    const comb = calculateCombination(nVal, rVal);

    setNFactorial(nFact);
    setRFactorial(rFact);
    setNMinusRFactorial(nMinusRFact);
    setPermutation(perm);
    setCombination(comb);
  }, [n, r]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (permutation !== null && combination !== null) {
      const resultText = `Permutation (nPr): ${formatNumber(permutation)}\nCombination (nCr): ${formatNumber(combination)}\n\nPermutation Formula: nPr = n! / (n-r)!\n${n}P${r} = ${n}! / ${parseInt(n) - parseInt(r)}! = ${formatNumber(permutation)}\n\nCombination Formula: nCr = n! / (r! × (n-r)!)\n${n}C${r} = ${n}! / (${r}! × ${parseInt(n) - parseInt(r)}!) = ${formatNumber(combination)}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setN('');
    setR('');
    setPermutation(null);
    setCombination(null);
    setNFactorial(null);
    setRFactorial(null);
    setNMinusRFactorial(null);
  };

  const getPermutationSteps = () => {
    const nVal = parseInt(n) || 0;
    const rVal = parseInt(r) || 0;
    return [
      `n! = ${nVal}! = ${formatNumber(nFactorial)}`,
      `(n-r)! = ${nVal - rVal}! = ${formatNumber(nMinusRFactorial)}`,
      `nPr = ${formatNumber(nFactorial)} / ${formatNumber(nMinusRFactorial)} = ${formatNumber(permutation)}`,
    ];
  };

  const getCombinationSteps = () => {
    const nVal = parseInt(n) || 0;
    const rVal = parseInt(r) || 0;
    return [
      `n! = ${nVal}! = ${formatNumber(nFactorial)}`,
      `r! = ${rVal}! = ${formatNumber(rFactorial)}`,
      `(n-r)! = ${nVal - rVal}! = ${formatNumber(nMinusRFactorial)}`,
      `nCr = ${formatNumber(nFactorial)} / (${formatNumber(rFactorial)} × ${formatNumber(nMinusRFactorial)}) = ${formatNumber(combination)}`,
    ];
  };

  return (
    <div className="w-full space-y-6">
      {/* n Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">n (total items)</label>
        <input
          type="number"
          value={n}
          onChange={(e) => setN(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="10"
          min="0"
          step="1"
        />
      </div>

      {/* r Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">r (items to choose)</label>
        <input
          type="number"
          value={r}
          onChange={(e) => setR(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="3"
          min="0"
          step="1"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Shuffle className="w-4 h-4" />
          Results
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Permutation (nPr)</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatNumber(permutation)}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Combination (nCr)</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatNumber(combination)}
            </p>
          </div>
        </div>

        {/* Permutation Formula */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Permutation Formula:</p>
          <p className="text-sm font-mono text-foreground">nPr = n! / (n-r)!</p>
          <p className="text-sm font-mono text-foreground">
            {n}P{r} = {n}! / {parseInt(n) - parseInt(r)}! = {formatNumber(permutation)}
          </p>
        </div>

        {/* Combination Formula */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Combination Formula:</p>
          <p className="text-sm font-mono text-foreground">nCr = n! / (r! × (n-r)!)</p>
          <p className="text-sm font-mono text-foreground">
            {n}C{r} = {n}! / ({r}! × {parseInt(n) - parseInt(r)}!) = {formatNumber(combination)}
          </p>
        </div>

        {/* Factorial Breakdown */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-2">Factorial Breakdown:</p>
          <div className="space-y-1 text-sm text-foreground">
            <p>{n}! = {formatNumber(nFactorial)}</p>
            {rFactorial !== null && rFactorial > 0 && <p>{r}! = {formatNumber(rFactorial)}</p>}
            <p>({parseInt(n) - parseInt(r)})! = {formatNumber(nMinusRFactorial)}</p>
          </div>
        </div>

        {/* Step-by-step */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-2">Step-by-step:</p>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Permutation:</p>
              <ol className="space-y-1 text-sm text-foreground">
                {getPermutationSteps().map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-foreground/60">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Combination:</p>
              <ol className="space-y-1 text-sm text-foreground">
                {getCombinationSteps().map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-foreground/60">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
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

export default PermutationCombinationCalculator;
