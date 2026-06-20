'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Calculator } from 'lucide-react';

function AverageCalculator() {
  const [input, setInput] = useState<string>('10, 20, 30, 40, 50');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [sum, setSum] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
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
      setAverage(null);
      setSum(null);
      setMin(null);
      setMax(null);
      return;
    }

    const total = nums.reduce((acc, num) => acc + num, 0);
    const avg = total / nums.length;
    const minimum = Math.min(...nums);
    const maximum = Math.max(...nums);

    setSum(total);
    setAverage(avg);
    setMin(minimum);
    setMax(maximum);
  }, [input, parseNumbers]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (average !== null && sum !== null) {
      const resultText = `Average: ${average.toFixed(2)}\nSum: ${sum.toFixed(2)}\nCount: ${count}\nMinimum: ${min?.toFixed(2)}\nMaximum: ${max?.toFixed(2)}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInput('');
    setNumbers([]);
    setAverage(null);
    setSum(null);
    setCount(0);
    setMin(null);
    setMax(null);
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
          placeholder="10, 20, 30, 40, 50"
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
            <p className="text-foreground/60">Average (Mean)</p>
            <p className="text-2xl font-semibold text-foreground">
              {average !== null ? average.toFixed(2) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Sum</p>
            <p className="text-2xl font-semibold text-foreground">
              {sum !== null ? sum.toFixed(2) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Count</p>
            <p className="text-2xl font-semibold text-foreground">{count}</p>
          </div>
          <div>
            <p className="text-foreground/60">Range</p>
            <p className="text-2xl font-semibold text-foreground">
              {min !== null && max !== null ? `${min.toFixed(2)} - ${max.toFixed(2)}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Minimum</p>
            <p className="text-lg font-semibold text-foreground">
              {min !== null ? min.toFixed(2) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Maximum</p>
            <p className="text-lg font-semibold text-foreground">
              {max !== null ? max.toFixed(2) : '—'}
            </p>
          </div>
        </div>

        {/* Numbers List */}
        {numbers.length > 0 && (
          <div className="pt-3 border-t border-input">
            <p className="text-sm text-foreground/60 mb-2">Numbers entered:</p>
            <div className="flex flex-wrap gap-2">
              {numbers.map((num, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-background border border-input rounded">
                  {num.toFixed(2)}
                </span>
              ))}
            </div>
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

export default AverageCalculator;
