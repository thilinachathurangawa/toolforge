'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, PiggyBank } from 'lucide-react';

type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually';

interface YearlyData {
  year: number;
  balance: number;
  contributions: number;
  interest: number;
}

const COMPOUNDING_FREQUENCIES: { value: CompoundingFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export function SavingsCalculator() {
  const [initialAmount, setInitialAmount] = useState<string>('1000');
  const [monthlyDeposit, setMonthlyDeposit] = useState<string>('200');
  const [interestRate, setInterestRate] = useState<string>('5');
  const [years, setYears] = useState<string>('10');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('monthly');
  const [futureValue, setFutureValue] = useState<number | null>(null);
  const [totalContributions, setTotalContributions] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [copied, setCopied] = useState(false);

  const calculateSavings = useCallback(() => {
    const initialNum = parseFloat(initialAmount);
    const depositNum = parseFloat(monthlyDeposit);
    const rateNum = parseFloat(interestRate);
    const yearsNum = parseFloat(years);

    if (isNaN(initialNum) || isNaN(depositNum) || isNaN(rateNum) || isNaN(yearsNum) || 
        initialNum < 0 || depositNum < 0 || rateNum < 0 || yearsNum <= 0) {
      setFutureValue(null);
      setTotalContributions(null);
      setTotalInterest(null);
      setYearlyData([]);
      return;
    }

    const rate = rateNum / 100;
    const monthlyRate = rate / 12;
    const totalMonths = yearsNum * 12;

    // Future value of initial amount
    const initialFV = initialNum * Math.pow(1 + monthlyRate, totalMonths);
    
    // Future value of monthly deposits
    const depositFV = depositNum * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    
    const resultFV = initialFV + depositFV;
    const resultContributions = initialNum + (depositNum * totalMonths);
    const resultInterest = resultFV - resultContributions;

    setFutureValue(resultFV);
    setTotalContributions(resultContributions);
    setTotalInterest(resultInterest);

    // Generate yearly breakdown
    const data: YearlyData[] = [];
    for (let year = 1; year <= yearsNum; year++) {
      const yearMonths = year * 12;
      const yearInitialFV = initialNum * Math.pow(1 + monthlyRate, yearMonths);
      const yearDepositFV = depositNum * ((Math.pow(1 + monthlyRate, yearMonths) - 1) / monthlyRate);
      const yearFV = yearInitialFV + yearDepositFV;
      const yearContributions = initialNum + (depositNum * yearMonths);
      
      data.push({
        year,
        balance: yearFV,
        contributions: yearContributions,
        interest: yearFV - yearContributions
      });
    }
    setYearlyData(data);
  }, [initialAmount, monthlyDeposit, interestRate, years, compoundingFrequency]);

  useEffect(() => {
    calculateSavings();
  }, [calculateSavings]);

  const handleCopy = () => {
    if (futureValue !== null && totalContributions !== null && totalInterest !== null) {
      const result = `Future Value: $${futureValue.toFixed(2)}\nTotal Contributions: $${totalContributions.toFixed(2)}\nTotal Interest: $${totalInterest.toFixed(2)}`;
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
      {/* Initial Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Initial Savings Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="1000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Monthly Deposit */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Monthly Deposit</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="200"
            min="0"
            step="10"
          />
        </div>
      </div>

      {/* Interest Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Annual Interest Rate (%)</label>
        <div className="relative">
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5"
            min="0"
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Years */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Time Period (Years)</label>
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="10"
          min="1"
          step="1"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <PiggyBank className="w-4 h-4" />
          Savings Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Future Value</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(futureValue)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Contributions</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalContributions)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Total Interest Earned</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalInterest)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {showBreakdown ? 'Hide' : 'View'} Yearly Breakdown
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Results'}
        </button>
      </div>

      {/* Yearly Breakdown */}
      {showBreakdown && yearlyData.length > 0 && (
        <div className="border border-input rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Year</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Balance</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Contributions</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Interest</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((entry) => (
                  <tr key={entry.year} className="border-t border-input">
                    <td className="px-3 py-2 text-foreground">{entry.year}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.balance)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.contributions)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.interest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}