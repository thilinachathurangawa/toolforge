'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, TrendingUp } from 'lucide-react';

type SDType = 'population' | 'sample';

const SD_TYPES: { value: SDType; label: string }[] = [
  { value: 'population', label: 'Population' },
  { value: 'sample', label: 'Sample' },
];

function StandardDeviationCalculator() {
  const [input, setInput] = useState<string>('2, 4, 4, 4, 5, 5, 7, 9');
  const [type, setType] = useState<SDType>('population');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [standardDeviation, setStandardDeviation] = useState<number | null>(null);
  const [variance, setVariance] = useState<number | null>(null);
  const [mean, setMean] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [sum, setSum] = useState<number | null>(null);
  const [sumSquaredDifferences, setSumSquaredDifferences] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const parseNumbers = useCallback((inputStr: string): number[] => {
    return inputStr
      .split(/[\s,\n]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));
  }, []);

  const calculate = useCallback(() => {
    const nums = parseNumbers(input);
    setNumbers(nums);
    setCount(nums.length);

    if (nums.length === 0) {
      setStandardDeviation(null);
      setVariance(null);
      setMean(null);
      setSum(null);
      setSumSquaredDifferences(null);
      return;
    }

    const total = nums.reduce((acc, num) => acc + num, 0);
    const avg = total / nums.length;
    setMean(avg);
    setSum(total);

    const squaredDifferences = nums.map(num => Math.pow(num - avg, 2));
    const sumSquaredDiffs = squaredDifferences.reduce((acc, val) => acc + val, 0);
    setSumSquaredDifferences(sumSquaredDiffs);

    let varianceValue: number;
    if (type === 'population') {
      varianceValue = sumSquaredDiffs / nums.length;
    } else {
      if (nums.length < 2) {
        varianceValue = 0;
      } else {
        varianceValue = sumSquaredDiffs / (nums.length - 1);
      }
    }
    setVariance(varianceValue);
    setStandardDeviation(Math.sqrt(varianceValue));
  }, [input, type, parseNumbers]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (standardDeviation !== null && variance !== null) {
      const resultText = `Type: ${type === 'population' ? 'Population' : 'Sample'}\nStandard Deviation: ${standardDeviation.toFixed(4)}\nVariance: ${variance.toFixed(4)}\nMean: ${mean?.toFixed(4) || '—'}\nCount: ${count}\nSum: ${sum?.toFixed(4) || '—'}\nSum of Squared Differences: ${sumSquaredDifferences?.toFixed(4) || '—'}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInput('');
    setNumbers([]);
    setStandardDeviation(null);
    setVariance(null);
    setMean(null);
    setCount(0);
    setSum(null);
    setSumSquaredDifferences(null);
  };

  const getSteps = () => {
    if (mean === null || sumSquaredDifferences === null) return [];
    
    const steps = [
      `Calculate mean: ${sum?.toFixed(2)} / ${count} = ${mean.toFixed(2)}`,
      `Calculate squared differences from mean`,
      `Sum of squared differences: ${sumSquaredDifferences.toFixed(2)}`,
    ];

    if (type === 'population') {
      steps.push(`Divide by n (${count}): ${sumSquaredDifferences.toFixed(2)} / ${count} = ${variance?.toFixed(4) || 0}`);
    } else {
      steps.push(`Divide by n-1 (${count - 1}): ${sumSquaredDifferences.toFixed(2)} / ${count - 1} = ${variance?.toFixed(4) || 0}`);
    }

    steps.push(`Take square root: √${variance?.toFixed(4) || 0} = ${standardDeviation?.toFixed(4) || 0}`);

    return steps;
  };

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Enter numbers (comma, space, or line separated)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y min-h-[80px]"
          placeholder="2, 4, 4, 4, 5, 5, 7, 9"
        />
      </div>

      {/* Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {SD_TYPES.map((sdType) => (
            <button
              key={sdType.value}
              onClick={() => setType(sdType.value)}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                type === sdType.value
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-background border-input hover:bg-accent/50'
              }`}
            >
              {sdType.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Results
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Standard Deviation</p>
            <p className="text-2xl font-semibold text-foreground">
              {standardDeviation !== null ? standardDeviation.toFixed(4) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Variance</p>
            <p className="text-2xl font-semibold text-foreground">
              {variance !== null ? variance.toFixed(4) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Mean</p>
            <p className="text-lg font-semibold text-foreground">
              {mean !== null ? mean.toFixed(4) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Count</p>
            <p className="text-lg font-semibold text-foreground">{count}</p>
          </div>
          <div>
            <p className="text-foreground/60">Sum</p>
            <p className="text-lg font-semibold text-foreground">
              {sum !== null ? sum.toFixed(2) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Sum of Squared Differences</p>
            <p className="text-lg font-semibold text-foreground">
              {sumSquaredDifferences !== null ? sumSquaredDifferences.toFixed(2) : '—'}
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

export default StandardDeviationCalculator;
