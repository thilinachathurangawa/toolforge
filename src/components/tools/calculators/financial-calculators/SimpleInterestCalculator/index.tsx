'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Calculator } from 'lucide-react';

type TimeUnit = 'years' | 'months' | 'days';

const TIME_UNITS: { value: TimeUnit; label: string }[] = [
  { value: 'years', label: 'Years' },
  { value: 'months', label: 'Months' },
  { value: 'days', label: 'Days' },
];

export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState<string>('5000');
  const [rate, setRate] = useState<string>('6');
  const [time, setTime] = useState<string>('3');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('years');
  const [interest, setInterest] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [formula, setFormula] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const calculateSimpleInterest = useCallback(() => {
    const principalNum = parseFloat(principal);
    const rateNum = parseFloat(rate);
    const timeNum = parseFloat(time);

    if (isNaN(principalNum) || isNaN(rateNum) || isNaN(timeNum) || 
        principalNum <= 0 || rateNum < 0 || timeNum <= 0) {
      setInterest(null);
      setTotalAmount(null);
      setFormula('');
      return;
    }

    const rateDecimal = rateNum / 100;
    let timeInYears: number;

    switch(timeUnit) {
      case 'years':
        timeInYears = timeNum;
        break;
      case 'months':
        timeInYears = timeNum / 12;
        break;
      case 'days':
        timeInYears = timeNum / 365;
        break;
      default:
        timeInYears = timeNum;
    }

    const interestValue = principalNum * rateDecimal * timeInYears;
    const totalAmountValue = principalNum + interestValue;

    setInterest(interestValue);
    setTotalAmount(totalAmountValue);

    setFormula(`I = ${principalNum} × ${rateDecimal} × ${timeInYears.toFixed(2)} = ${interestValue.toFixed(2)}`);
  }, [principal, rate, time, timeUnit]);

  useEffect(() => {
    calculateSimpleInterest();
  }, [calculateSimpleInterest]);

  const handleCopy = () => {
    if (interest !== null && totalAmount !== null) {
      const result = `Simple Interest: $${interest.toFixed(2)}\nTotal Amount: $${totalAmount.toFixed(2)}\nFormula: ${formula}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Principal */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Principal (P)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Annual Interest Rate (R) %</label>
        <div className="relative">
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="6"
            min="0"
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Time (T)</label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="3"
            min="0"
            step="1"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Unit</label>
          <select
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {TIME_UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Simple Interest</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(interest)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Amount</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Formula Breakdown */}
        <div className="pt-3 border-t border-input">
          <p className="text-xs text-foreground/60 mb-1">Formula: I = P × R × T</p>
          <p className="text-sm font-mono text-foreground">{formula}</p>
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy Results'}
      </button>
    </div>
  );
}