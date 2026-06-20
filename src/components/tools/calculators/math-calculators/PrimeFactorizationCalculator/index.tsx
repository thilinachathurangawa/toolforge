'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, TreePine } from 'lucide-react';

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

function PrimeFactorizationCalculator() {
  const [number, setNumber] = useState<string>('84');
  const [primeFactors, setPrimeFactors] = useState<{ [prime: number]: number }>({});
  const [factorList, setFactorList] = useState<number[]>([]);
  const [factorTree, setFactorTree] = useState<TreeNode | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Check if prime
  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  };

  // Prime factorization
  const primeFactorization = (n: number): { [prime: number]: number } => {
    const factors: { [prime: number]: number } = {};
    let num = n;
    let d = 2;
    while (num > 1) {
      while (num % d === 0) {
        factors[d] = (factors[d] || 0) + 1;
        num /= d;
      }
      d++;
    }
    return factors;
  };

  // Generate factor tree
  const generateFactorTree = (n: number): TreeNode => {
    const node: TreeNode = { value: n };
    
    if (n <= 1) return node;
    if (isPrime(n)) return node;
    
    // Find smallest factor
    let factor = 2;
    while (n % factor !== 0 && factor <= Math.sqrt(n)) {
      factor++;
    }
    
    if (factor > Math.sqrt(n)) return node; // n is prime
    
    node.left = { value: factor };
    node.right = generateFactorTree(n / factor);
    
    return node;
  };

  // Generate factorization steps
  const generateSteps = (n: number): string[] => {
    const steps: string[] = [];
    let num = n;
    let d = 2;
    
    while (num > 1) {
      if (num % d === 0) {
        steps.push(`${num} ÷ ${d} = ${num / d}`);
        num /= d;
      } else {
        d++;
      }
    }
    
    steps.push(`${d - 1} is prime`);
    return steps;
  };

  // Render factor tree
  const renderFactorTree = (node: TreeNode | null, depth: number = 0): React.ReactNode => {
    if (!node) return null;
    
    const indent = depth * 20;
    
    return (
      <div style={{ marginLeft: `${indent}px` }}>
        <div className="text-foreground font-mono">{node.value}</div>
        {node.left && node.right && (
          <div className="flex gap-4">
            <div>{renderFactorTree(node.left, depth + 1)}</div>
            <div>{renderFactorTree(node.right, depth + 1)}</div>
          </div>
        )}
      </div>
    );
  };

  const calculate = useCallback(() => {
    const num = parseInt(number);

    if (isNaN(num) || num <= 1) {
      setPrimeFactors({});
      setFactorList([]);
      setFactorTree(null);
      setSteps([]);
      return;
    }

    const factors = primeFactorization(num);
    const list: number[] = [];
    Object.entries(factors).forEach(([prime, exp]) => {
      for (let i = 0; i < exp; i++) {
        list.push(parseInt(prime));
      }
    });
    
    const tree = generateFactorTree(num);
    const calcSteps = generateSteps(num);

    setPrimeFactors(factors);
    setFactorList(list);
    setFactorTree(tree);
    setSteps(calcSteps);
  }, [number]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (Object.keys(primeFactors).length > 0) {
      const exponential = Object.entries(primeFactors)
        .map(([prime, exp]) => `${prime}${exp > 1 ? `^${exp}` : ''}`)
        .join(' × ');
      const resultText = `Number: ${number}\nPrime Factors: ${exponential}\nAs List: ${factorList.join(', ')}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setNumber('');
    setPrimeFactors({});
    setFactorList([]);
    setFactorTree(null);
    setSteps([]);
  };

  const formatExponential = (factors: { [prime: number]: number }): string => {
    return Object.entries(factors)
      .map(([prime, exp]) => `${prime}${exp > 1 ? `^${exp}` : ''}`)
      .join(' × ');
  };

  const verifyProduct = (): boolean => {
    const product = factorList.reduce((acc, f) => acc * f, 1);
    return product === parseInt(number);
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
          placeholder="84"
          min="2"
          step="1"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TreePine className="w-4 h-4" />
          Results
        </h3>

        {/* Prime Factors */}
        <div>
          <p className="text-sm text-foreground/60 mb-1">Prime Factors:</p>
          <p className="text-2xl font-semibold text-foreground font-mono">
            {Object.keys(primeFactors).length > 0 ? formatExponential(primeFactors) : '—'}
          </p>
        </div>

        {/* As List */}
        <div>
          <p className="text-sm text-foreground/60 mb-1">As List:</p>
          <div className="flex flex-wrap gap-2">
            {factorList.length > 0 ? (
              factorList.map((factor, index) => (
                <span key={index} className="px-2 py-1 text-sm bg-background border border-input rounded">
                  {factor}
                </span>
              ))
            ) : (
              <p className="text-sm text-foreground">—</p>
            )}
          </div>
        </div>

        {/* Factor Tree */}
        {factorTree && (
          <div>
            <p className="text-sm text-foreground/60 mb-2">Factor Tree:</p>
            <div className="bg-background p-4 rounded border border-input">
              {renderFactorTree(factorTree)}
            </div>
          </div>
        )}

        {/* Verification */}
        {factorList.length > 0 && (
          <div>
            <p className="text-sm text-foreground/60 mb-1">Verification:</p>
            <p className="text-sm text-foreground">
              {factorList.join(' × ')} = {factorList.reduce((acc, f) => acc * f, 1)}{' '}
              {verifyProduct() ? '✓' : '✗'}
            </p>
          </div>
        )}

        {/* Step-by-step */}
        {steps.length > 0 && (
          <div>
            <p className="text-sm text-foreground/60 mb-2">Step-by-step:</p>
            <ol className="space-y-1 text-sm text-foreground">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-foreground/60">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
              <li className="flex gap-2">
                <span className="text-foreground/60">{steps.length + 1}.</span>
                <span>Result: {formatExponential(primeFactors)}</span>
              </li>
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

export default PrimeFactorizationCalculator;
