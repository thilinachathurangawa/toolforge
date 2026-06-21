'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Shuffle } from 'lucide-react';

export function RandomNumberGenerator() {
  const [min, setMin] = useState<string>('1');
  const [max, setMax] = useState<string>('100');
  const [count, setCount] = useState<string>('10');
  const [uniqueOnly, setUniqueOnly] = useState<boolean>(true);
  const [sortResults, setSortResults] = useState<boolean>(false);
  const [decimalPlaces, setDecimalPlaces] = useState<string>('0');
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<{ timestamp: Date; numbers: number[] }[]>([]);
  const [copied, setCopied] = useState(false);

  const generateSecureRandomNumber = useCallback((minVal: number, maxVal: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const random = array[0] / (0xFFFFFFFF + 1);
    return Math.floor(random * (maxVal - minVal + 1)) + minVal;
  }, []);

  const generateRandomDecimal = useCallback((minVal: number, maxVal: number, decimals: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const random = array[0] / (0xFFFFFFFF + 1);
    const value = random * (maxVal - minVal) + minVal;
    return Number(value.toFixed(decimals));
  }, []);

  const generateRandomNumbers = useCallback(() => {
    const minVal = parseInt(min) || 0;
    const maxVal = parseInt(max) || 100;
    const countVal = parseInt(count) || 1;
    const decimals = parseInt(decimalPlaces) || 0;

    if (minVal > maxVal) {
      alert('Minimum value must be less than or equal to maximum value');
      return;
    }

    if (countVal <= 0 || countVal > 1000) {
      alert('Count must be between 1 and 1000');
      return;
    }

    const generated: number[] = [];
    const maxAttempts = countVal * 100;
    let attempts = 0;

    while (generated.length < countVal && attempts < maxAttempts) {
      let number: number;

      if (decimals === 0) {
        number = generateSecureRandomNumber(minVal, maxVal);
      } else {
        number = generateRandomDecimal(minVal, maxVal, decimals);
      }

      if (!uniqueOnly || !generated.includes(number)) {
        generated.push(number);
      }

      attempts++;
    }

    let finalResults = generated;
    if (sortResults) {
      finalResults = [...generated].sort((a, b) => a - b);
    }

    setResults(finalResults);
    setHistory([{ timestamp: new Date(), numbers: finalResults }, ...history.slice(0, 9)]);
  }, [min, max, count, uniqueOnly, sortResults, decimalPlaces, generateSecureRandomNumber, generateRandomDecimal, history]);

  const calculateStatistics = useCallback((numbers: number[]) => {
    if (numbers.length === 0) return null;

    const minVal = Math.min(...numbers);
    const maxVal = Math.max(...numbers);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;

    return { min: minVal, max: maxVal, average, sum };
  }, []);

  const handleCopy = () => {
    if (results.length > 0) {
      const result = results.join(', ');
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCSV = () => {
    if (results.length > 0) {
      const csv = 'Number\n' + results.map(n => n.toString()).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'random_numbers.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const stats = calculateStatistics(results);

  return (
    <div className="w-full space-y-6">
      {/* Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Range</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-foreground/60">Min</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="1"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-foreground/60">Max</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Options</h3>
        <div>
          <label className="text-xs text-foreground/60">Count (1-1000)</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="10"
            min="1"
            max="1000"
          />
        </div>
        <div>
          <label className="text-xs text-foreground/60">Decimal places (0 for integers)</label>
          <input
            type="number"
            value={decimalPlaces}
            onChange={(e) => setDecimalPlaces(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="0"
            min="0"
            max="10"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={uniqueOnly}
              onChange={(e) => setUniqueOnly(e.target.checked)}
              className="w-4 h-4 rounded border-input bg-background text-accent focus:ring-accent/20"
            />
            <span className="text-sm text-foreground">Unique numbers only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sortResults}
              onChange={(e) => setSortResults(e.target.checked)}
              className="w-4 h-4 rounded border-input bg-background text-accent focus:ring-accent/20"
            />
            <span className="text-sm text-foreground">Sort results</span>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateRandomNumbers}
        className="w-full px-4 py-3 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <Shuffle className="w-4 h-4" />
        Generate
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Results</h3>
          
          <div className="bg-background rounded-md p-3">
            <p className="text-sm font-mono break-all">{results.join(', ')}</p>
          </div>

          {stats && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Min:</span>
                <span className="text-foreground">{stats.min}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Max:</span>
                <span className="text-foreground">{stats.max}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Average:</span>
                <span className="text-foreground">{stats.average.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Sum:</span>
                <span className="text-foreground">{stats.sum}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 px-3 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Download CSV
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">History</h3>
          <div className="space-y-1 text-xs">
            {history.map((entry, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-foreground/60">
                  {entry.timestamp.toLocaleTimeString()}:
                </span>
                <span className="text-foreground font-mono">
                  {entry.numbers.slice(0, 5).join(', ')}{entry.numbers.length > 5 ? '...' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
