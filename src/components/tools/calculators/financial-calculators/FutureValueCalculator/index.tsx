'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, TrendingUp } from 'lucide-react';

type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually';

const COMPOUNDING_FREQUENCIES: { value: CompoundingFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export function FutureValueCalculator() {
  const [presentValue, setPresentValue] = useState<string>('5000');
  const [interestRate, setInterestRate] = useState<string>('7');
  const [timePeriod, setTimePeriod] = useState<string>('10');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('annually');
  const [monthlyDeposit, setMonthlyDeposit] = useState<string>('0');
  const [futureValue, setFutureValue] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalContributions, setTotalContributions] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateFutureValue = useCallback(() => {
    const presentNum = parseFloat(presentValue);
    const rateNum = parseFloat(interestRate);
    const periodNum = parseFloat(timePeriod);
    const depositNum = parseFloat(monthlyDeposit);

    if (isNaN(presentNum) || isNaN(rateNum) || isNaN(periodNum) || isNaN(depositNum) || 
        presentNum < 0 || rateNum < 0 || periodNum <= 0 || depositNum < 0) {
      setFutureValue(null);
      setTotalInterest(null);
      setTotalContributions(null);
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

    let fvValue: number;
    let totalInterestValue: number;
    let totalContributionsValue: number;

    if (depositNum > 0) {
      // With monthly deposits
      const monthlyRate = rate / 12;
      const totalMonths = periodNum * 12;
      const presentFV = presentNum * Math.pow(1 + monthlyRate, totalMonths);
      const depositFV = depositNum * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
      fvValue = presentFV + depositFV;
      totalContributionsValue = presentNum + (depositNum * totalMonths);
      totalInterestValue = fvValue - totalContributionsValue;
    } else {
      // Simple future value
      fvValue = presentNum * Math.pow((1 + rate / n), n * periodNum);
      totalContributionsValue = presentNum;
      totalInterestValue = fvValue - presentNum;
    }

    setFutureValue(fvValue);
    setTotalInterest(totalInterestValue);
    setTotalContributions(totalContributionsValue);
  }, [presentValue, interestRate, timePeriod, compoundingFrequency, monthlyDeposit]);

  useEffect(() => {
    calculateFutureValue();
  }, [calculateFutureValue]);

  const handleCopy = () => {
    if (futureValue !== null && totalInterest !== null) {
      const result = `Present Value: $${parseFloat(presentValue).toFixed(2)}\nFuture Value: $${futureValue.toFixed(2)}\nTotal Interest: $${totalInterest.toFixed(2)}`;
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
      {/* Present Value */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Present Value</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={presentValue}
            onChange={(e) => setPresentValue(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Interest Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Interest Rate (%)</label>
        <div className="relative">
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="7"
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
          placeholder="10"
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

      {/* Monthly Deposit (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Monthly Deposit (Optional)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="0"
            min="0"
            step="10"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Future Value Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Future Value:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(futureValue)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Interest:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Total Contributions:</p>
            <p className="text-foreground">{formatCurrency(totalContributions)}</p>
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