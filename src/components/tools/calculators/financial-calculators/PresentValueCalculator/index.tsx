'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Calculator } from 'lucide-react';

type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually';

const COMPOUNDING_FREQUENCIES: { value: CompoundingFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export function PresentValueCalculator() {
  const [futureValue, setFutureValue] = useState<string>('10000');
  const [discountRate, setDiscountRate] = useState<string>('5');
  const [timePeriod, setTimePeriod] = useState<string>('5');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('annually');
  const [presentValue, setPresentValue] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculatePresentValue = useCallback(() => {
    const futureNum = parseFloat(futureValue);
    const rateNum = parseFloat(discountRate);
    const periodNum = parseFloat(timePeriod);

    if (isNaN(futureNum) || isNaN(rateNum) || isNaN(periodNum) || 
        futureNum <= 0 || rateNum < 0 || periodNum <= 0) {
      setPresentValue(null);
      setDiscountAmount(null);
      return;
    }

    const rate = rateNum / 100;
    let n: number;
    switch(compoundingFrequency) {
      case 'daily': n = 365; break;
      case 'monthly': n = 12; break;
      case 'quarterly': n = 4; break;
      case 'annually': n = 1; break;
      default: n = 1;
    }

    const pvValue = futureNum / Math.pow((1 + rate / n), n * periodNum);
    const discountValue = futureNum - pvValue;

    setPresentValue(pvValue);
    setDiscountAmount(discountValue);
  }, [futureValue, discountRate, timePeriod, compoundingFrequency]);

  useEffect(() => {
    calculatePresentValue();
  }, [calculatePresentValue]);

  const handleCopy = () => {
    if (presentValue !== null && discountAmount !== null) {
      const result = `Future Value: $${parseFloat(futureValue).toFixed(2)}\nPresent Value: $${presentValue.toFixed(2)}\nDiscount Amount: $${discountAmount.toFixed(2)}`;
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
      {/* Future Value */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Future Value</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={futureValue}
            onChange={(e) => setFutureValue(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="10000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Discount Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Discount Rate (%)</label>
        <div className="relative">
          <input
            type="number"
            value={discountRate}
            onChange={(e) => setDiscountRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5"
            min="0"
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Time Period */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Time Period (Years)</label>
        <input
          type="number"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="5"
          min="0"
          step="1"
        />
      </div>

      {/* Compounding Frequency */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Compounding Frequency</label>
        <select
          value={compoundingFrequency}
          onChange={(e) => setCompoundingFrequency(e.target.value as CompoundingFrequency)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {COMPOUNDING_FREQUENCIES.map((freq) => (
            <option key={freq.value} value={freq.value}>
              {freq.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Present Value Results
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Future Value:</span>
            <span className="text-foreground">{formatCurrency(parseFloat(futureValue) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Present Value:</span>
            <span className="text-lg font-semibold text-foreground">{formatCurrency(presentValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Discount Amount:</span>
            <span className="text-green-600 font-semibold">{formatCurrency(discountAmount)}</span>
          </div>
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