'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, List } from 'lucide-react';

function FactorCalculator() {
  const [number, setNumber] = useState<string>('24');
  const [factors, setFactors] = useState<number[]>([]);
  const [factorPairs, setFactorPairs] = useState<Array<[number, number]>>([]);
  const [factorCount, setFactorCount] = useState<number>(0);
  const [factorSum, setFactorSum] = useState<number>(0);
  const [numberType, setNumberType] = useState<'prime' | 'composite' | 'neither'>('neither');
  const [isPerfect, setIsPerfect] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  // Find all factors of a number
  const findFactors = (n: number): number[] => {
    if (n <= 0) return [];
    const factors: number[] = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        factors.push(i);
        if (i !== n / i) {
          factors.push(n / i);
        }
      }
    }
    return factors.sort((a, b) => a - b);
  };

  // Find factor pairs
  const findFactorPairs = (factors: number[], n: number): Array<[number, number]> => {
    const pairs: Array<[number, number]> = [];
    const used = new Set<number>();
    
    for (const factor of factors) {
      if (!used.has(factor)) {
        const pair = n / factor;
        pairs.push([factor, pair]);
        used.add(factor);
        used.add(pair);
      }
    }
    
    return pairs.sort((a, b) => a[0] - b[0]);
  };

  // Determine if number is prime
  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  };

  // Determine if number is perfect
  const isPerfectNumber = (n: number): boolean => {
    const factors = findFactors(n).filter(f => f !== n);
    const sum = factors.reduce((acc, f) => acc + f, 0);
    return sum === n;
  };

  const calculate = useCallback(() => {
    const num = parseInt(number);

    if (isNaN(num) || num <= 0) {
      setFactors([]);
      setFactorPairs([]);
      setFactorCount(0);
      setFactorSum(0);
      setNumberType('neither');
      setIsPerfect(false);
      return;
    }

    const foundFactors = findFactors(num);
    const pairs = findFactorPairs(foundFactors, num);
    const count = foundFactors.length;
    const sum = foundFactors.reduce((acc, f) => acc + f, 0);
    const type = isPrime(num) ? 'prime' : 'composite';
    const perfect = isPerfectNumber(num);

    setFactors(foundFactors);
    setFactorPairs(pairs);
    setFactorCount(count);
    setFactorSum(sum);
    setNumberType(type);
    setIsPerfect(perfect);
  }, [number]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (factors.length > 0) {
      const pairsStr = factorPairs.map(([a, b]) => `${a} × ${b}`).join(', ');
      const resultText = `Number: ${number}\nFactors: ${factors.join(', ')}\nFactor Pairs: ${pairsStr}\nNumber of Factors: ${factorCount}\nSum of Factors: ${factorSum}\nType: ${numberType}\nPerfect Number: ${isPerfect ? 'Yes' : 'No'}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setNumber('');
    setFactors([]);
    setFactorPairs([]);
    setFactorCount(0);
    setFactorSum(0);
    setNumberType('neither');
    setIsPerfect(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Number Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Number</label>
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="24"
          min="1"
          step="1"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <List className="w-4 h-4" />
          Results
        </h3>

        {/* Factors */}
        <div>
          <p className="text-sm text-foreground/60 mb-2">Factors:</p>
          <div className="flex flex-wrap gap-2">
            {factors.length > 0 ? (
              factors.map((factor, index) => (
                <span key={index} className="px-2 py-1 text-sm bg-background border border-input rounded">
                  {factor}
                </span>
              ))
            ) : (
              <p className="text-sm text-foreground">—</p>
            )}
          </div>
        </div>

        {/* Factor Pairs */}
        {factorPairs.length > 0 && (
          <div>
            <p className="text-sm text-foreground/60 mb-2">Factor Pairs:</p>
            <div className="flex flex-wrap gap-2">
              {factorPairs.map(([a, b], index) => (
                <span key={index} className="px-2 py-1 text-sm bg-background border border-input rounded">
                  {a} × {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Number of Factors</p>
            <p className="text-lg font-semibold text-foreground">{factorCount}</p>
          </div>
          <div>
            <p className="text-foreground/60">Sum of Factors</p>
            <p className="text-lg font-semibold text-foreground">{factorSum}</p>
          </div>
          <div>
            <p className="text-foreground/60">Type</p>
            <p className="text-lg font-semibold text-foreground capitalize">{numberType}</p>
          </div>
          <div>
            <p className="text-foreground/60">Perfect Number</p>
            <p className="text-lg font-semibold text-foreground">{isPerfect ? 'Yes' : 'No'}</p>
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

export default FactorCalculator;
