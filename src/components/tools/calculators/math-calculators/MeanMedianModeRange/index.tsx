'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, BarChart3 } from 'lucide-react';

function MeanMedianModeRange() {
  const [input, setInput] = useState<string>('1, 2, 2, 3, 4, 5, 5, 5');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [mean, setMean] = useState<number | null>(null);
  const [median, setMedian] = useState<number | null>(null);
  const [modes, setModes] = useState<number[]>([]);
  const [range, setRange] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [sum, setSum] = useState<number | null>(null);
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const parseNumbers = useCallback((inputStr: string): number[] => {
    return inputStr
      .split(/[\s,\n]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
  }, []);

  const calculate = useCallback(() => {
    const nums = parseNumbers(input);
    setNumbers(nums);
    setCount(nums.length);

    if (nums.length === 0) {
      setMean(null);
      setMedian(null);
      setModes([]);
      setRange(null);
      setSum(null);
      setMin(null);
      setMax(null);
      return;
    }

    // Mean
    const total = nums.reduce((acc, num) => acc + num, 0);
    const avg = total / nums.length;
    setMean(avg);
    setSum(total);

    // Median
    const mid = Math.floor(nums.length / 2);
    const med = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
    setMedian(med);

    // Mode
    const frequency: { [key: number]: number } = {};
    nums.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const modeValues = Object.entries(frequency)
      .filter(([_, freq]) => freq === maxFreq)
      .map(([num]) => parseFloat(num))
      .sort((a, b) => a - b);
    
    // If all numbers appear equally, there's no mode
    if (maxFreq === 1) {
      setModes([]);
    } else {
      setModes(modeValues);
    }

    // Range
    const minimum = nums[0];
    const maximum = nums[nums.length - 1];
    setMin(minimum);
    setMax(maximum);
    setRange(maximum - minimum);
  }, [input, parseNumbers]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (mean !== null && sum !== null) {
      const resultText = `Mean: ${mean.toFixed(2)}\nMedian: ${median?.toFixed(2) || '—'}\nMode: ${modes.length > 0 ? modes.map(m => m.toFixed(2)).join(', ') : 'No mode'}\nRange: ${range?.toFixed(2) || '—'}\nCount: ${count}\nSum: ${sum.toFixed(2)}\nMin: ${min?.toFixed(2) || '—'}\nMax: ${max?.toFixed(2) || '—'}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInput('');
    setNumbers([]);
    setMean(null);
    setMedian(null);
    setModes([]);
    setRange(null);
    setCount(0);
    setSum(null);
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
          placeholder="1, 2, 2, 3, 4, 5, 5, 5"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Statistical Results
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Mean (Average)</p>
            <p className="text-2xl font-semibold text-foreground">
              {mean !== null ? mean.toFixed(3) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Median</p>
            <p className="text-2xl font-semibold text-foreground">
              {median !== null ? median.toFixed(3) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Mode</p>
            <p className="text-lg font-semibold text-foreground">
              {modes.length > 0 ? modes.map(m => m.toFixed(2)).join(', ') : 'No mode'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Range</p>
            <p className="text-2xl font-semibold text-foreground">
              {range !== null ? range.toFixed(2) : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Count</p>
            <p className="text-2xl font-semibold text-foreground">{count}</p>
          </div>
          <div>
            <p className="text-foreground/60">Sum</p>
            <p className="text-2xl font-semibold text-foreground">
              {sum !== null ? sum.toFixed(2) : '—'}
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
            <p className="text-sm text-foreground/60 mb-2">Numbers entered (sorted):</p>
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

export default MeanMedianModeRange;
