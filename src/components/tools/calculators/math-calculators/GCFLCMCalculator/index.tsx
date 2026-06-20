'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Calculator } from 'lucide-react';

function GCFLCMCalculator() {
  const [input, setInput] = useState<string>('48, 180');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [gcf, setGcf] = useState<number | null>(null);
  const [lcm, setLcm] = useState<number | null>(null);
  const [primeFactorizations, setPrimeFactorizations] = useState<{ [key: number]: string }>({});
  const [euclidSteps, setEuclidSteps] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Euclid's Algorithm for GCF
  const euclidGCF = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  // GCF for multiple numbers
  const gcfMultiple = (nums: number[]): number => {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    let result = nums[0];
    for (let i = 1; i < nums.length; i++) {
      result = euclidGCF(result, nums[i]);
    }
    return result;
  };

  // LCM using GCF
  const calculateLCM = (a: number, b: number): number => {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / euclidGCF(a, b);
  };

  // LCM for multiple numbers
  const lcmMultiple = (nums: number[]): number => {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    let result = nums[0];
    for (let i = 1; i < nums.length; i++) {
      result = calculateLCM(result, nums[i]);
    }
    return result;
  };

  // Prime factorization
  const primeFactorization = (n: number): { [prime: number]: number } => {
    const factors: { [prime: number]: number } = {};
    let d = 2;
    let num = Math.abs(n);
    while (num > 1) {
      while (num % d === 0) {
        factors[d] = (factors[d] || 0) + 1;
        num /= d;
      }
      d++;
    }
    return factors;
  };

  // Format prime factorization
  const formatFactorization = (factors: { [prime: number]: number }): string => {
    return Object.entries(factors)
      .map(([prime, exp]) => `${prime}^${exp}`)
      .join(' × ');
  };

  // Generate Euclid's algorithm steps
  const generateEuclidSteps = (nums: number[]): string[] => {
    if (nums.length < 2) return [];
    
    const steps: string[] = [];
    let a = nums[0];
    let b = nums[1];
    
    steps.push(`Starting with ${a} and ${b}`);
    
    let iteration = 0;
    while (b !== 0 && iteration < 20) {
      const quotient = Math.floor(a / b);
      const remainder = a % b;
      steps.push(`${a} ÷ ${b} = ${quotient} remainder ${remainder}`);
      a = b;
      b = remainder;
      iteration++;
    }
    
    steps.push(`GCF = ${a}`);
    return steps;
  };

  const calculate = useCallback(() => {
    const nums = input
      .split(',')
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n) && n > 0 && Number.isInteger(n));

    setNumbers(nums);

    if (nums.length < 2) {
      setGcf(null);
      setLcm(null);
      setPrimeFactorizations({});
      setEuclidSteps([]);
      return;
    }

    const gcfValue = gcfMultiple(nums);
    const lcmValue = lcmMultiple(nums);
    setGcf(gcfValue);
    setLcm(lcmValue);

    // Calculate prime factorizations
    const factorizations: { [key: number]: string } = {};
    nums.forEach(num => {
      const factors = primeFactorization(num);
      factorizations[num] = formatFactorization(factors);
    });
    setPrimeFactorizations(factorizations);

    // Generate Euclid steps
    setEuclidSteps(generateEuclidSteps(nums));
  }, [input]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (gcf !== null && lcm !== null) {
      const factorizationText = Object.entries(primeFactorizations)
        .map(([num, fact]) => `${num} = ${fact}`)
        .join('\n');
      
      const resultText = `GCF (GCD): ${gcf}\nLCM: ${lcm}\n\nPrime Factorization:\n${factorizationText}\n\nVerification:\nGCF × LCM = ${gcf} × ${lcm} = ${gcf * lcm}\nProduct = ${numbers.join(' × ')} = ${numbers.reduce((a, b) => a * b, 1)}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInput('');
    setNumbers([]);
    setGcf(null);
    setLcm(null);
    setPrimeFactorizations({});
    setEuclidSteps([]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Enter numbers (comma separated)
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="48, 180"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Results
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">GCF (GCD)</p>
            <p className="text-2xl font-semibold text-foreground">
              {gcf !== null ? gcf : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">LCM</p>
            <p className="text-2xl font-semibold text-foreground">
              {lcm !== null ? lcm : '—'}
            </p>
          </div>
        </div>

        {/* Prime Factorization */}
        {Object.keys(primeFactorizations).length > 0 && (
          <div className="pt-3 border-t border-input">
            <p className="text-sm text-foreground/60 mb-2">Prime Factorization:</p>
            <div className="space-y-1 text-sm text-foreground">
              {Object.entries(primeFactorizations).map(([num, fact]) => (
                <p key={num} className="font-mono">
                  {num} = {fact}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Verification */}
        {gcf !== null && lcm !== null && numbers.length >= 2 && (
          <div className="pt-3 border-t border-input">
            <p className="text-sm text-foreground/60 mb-2">Verification:</p>
            <div className="space-y-1 text-sm text-foreground">
              <p>GCF × LCM = {gcf} × {lcm} = {gcf * lcm}</p>
              <p>Product = {numbers.join(' × ')} = {numbers.reduce((a, b) => a * b, 1)}</p>
              <p className={gcf * lcm === numbers.reduce((a, b) => a * b, 1) ? 'text-green-600' : 'text-red-600'}>
                {gcf * lcm === numbers.reduce((a, b) => a * b, 1) ? '✓ Verified' : '✗ Verification failed'}
              </p>
            </div>
          </div>
        )}

        {/* Euclid's Algorithm */}
        {euclidSteps.length > 0 && (
          <div className="pt-3 border-t border-input">
            <p className="text-sm text-foreground/60 mb-2">Euclid's Algorithm:</p>
            <ol className="space-y-1 text-sm text-foreground">
              {euclidSteps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-foreground/60">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
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

export default GCFLCMCalculator;
