'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually';

interface YearlyData {
  year: number;
  amount: number;
  interest: number;
  deposits: number;
}

const COMPOUNDING_FREQUENCIES: { value: CompoundingFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<string>('10000');
  const [interestRate, setInterestRate] = useState<string>('5');
  const [timePeriod, setTimePeriod] = useState<string>('10');
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('annually');
  const [additionalDeposit, setAdditionalDeposit] = useState<string>('0');
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalDeposits, setTotalDeposits] = useState<number | null>(null);
  const [showGrowthTable, setShowGrowthTable] = useState(false);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [copied, setCopied] = useState(false);

  const calculateCompoundInterest = useCallback(() => {
    const principalNum = parseFloat(principal);
    const rateNum = parseFloat(interestRate);
    const yearsNum = parseFloat(timePeriod);
    const depositNum = parseFloat(additionalDeposit);

    if (isNaN(principalNum) || isNaN(rateNum) || isNaN(yearsNum) || 
        principalNum <= 0 || rateNum < 0 || yearsNum <= 0 || isNaN(depositNum) || depositNum < 0) {
      setFinalAmount(null);
      setTotalInterest(null);
      setTotalDeposits(null);
      setYearlyData([]);
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

    let resultAmount: number;
    let resultInterest: number;
    let resultDeposits: number;

    if (depositNum > 0) {
      // With regular monthly deposits
      const monthlyRate = rate / 12;
      const totalMonths = yearsNum * 12;
      const principalFV = principalNum * Math.pow(1 + monthlyRate, totalMonths);
      const depositFV = depositNum * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
      resultAmount = principalFV + depositFV;
      resultDeposits = principalNum + (depositNum * totalMonths);
      resultInterest = resultAmount - resultDeposits;
    } else {
      // Standard compound interest
      resultAmount = principalNum * Math.pow((1 + rate/n), n * yearsNum);
      resultInterest = resultAmount - principalNum;
      resultDeposits = principalNum;
    }

    setFinalAmount(resultAmount);
    setTotalInterest(resultInterest);
    setTotalDeposits(resultDeposits);

    // Generate yearly data
    const data: YearlyData[] = [];
    for (let year = 1; year <= yearsNum; year++) {
      if (depositNum > 0) {
        const monthlyRate = rate / 12;
        const totalMonths = year * 12;
        const principalFV = principalNum * Math.pow(1 + monthlyRate, totalMonths);
        const depositFV = depositNum * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
        const yearAmount = principalFV + depositFV;
        const yearDeposits = principalNum + (depositNum * totalMonths);
        data.push({
          year,
          amount: yearAmount,
          interest: yearAmount - yearDeposits,
          deposits: yearDeposits
        });
      } else {
        const yearAmount = principalNum * Math.pow((1 + rate/n), n * year);
        data.push({
          year,
          amount: yearAmount,
          interest: yearAmount - principalNum,
          deposits: principalNum
        });
      }
    }
    setYearlyData(data);
  }, [principal, interestRate, timePeriod, compoundingFrequency, additionalDeposit]);

  useEffect(() => {
    calculateCompoundInterest();
  }, [calculateCompoundInterest]);

  const handleCopy = () => {
    if (finalAmount !== null && totalInterest !== null && totalDeposits !== null) {
      const result = `Final Amount: $${finalAmount.toFixed(2)}\nTotal Interest: $${totalInterest.toFixed(2)}\nTotal Deposits: $${totalDeposits.toFixed(2)}`;
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
        <label className="text-sm font-medium text-foreground">Principal Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="10000"
            min="0"
            step="100"
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

      {/* Time Period */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Time Period (Years)</label>
        <input
          type="number"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="10"
          min="1"
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

      {/* Additional Monthly Deposit */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Additional Monthly Deposit (Optional)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={additionalDeposit}
            onChange={(e) => setAdditionalDeposit(e.target.value)}
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
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Final Amount</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(finalAmount)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Interest</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Total Deposits</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalDeposits)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowGrowthTable(!showGrowthTable)}
          className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {showGrowthTable ? 'Hide' : 'View'} Year-by-Year Growth
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Results'}
        </button>
      </div>

      {/* Year-by-Year Growth Table */}
      {showGrowthTable && yearlyData.length > 0 && (
        <div className="border border-input rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Year</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Amount</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Interest</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Deposits</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((entry) => (
                  <tr key={entry.year} className="border-t border-input">
                    <td className="px-3 py-2 text-foreground">{entry.year}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.amount)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.interest)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.deposits)}</td>
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