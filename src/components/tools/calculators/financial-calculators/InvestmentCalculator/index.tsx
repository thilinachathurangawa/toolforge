'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, TrendingUp } from 'lucide-react';

interface YearlyData {
  year: number;
  value: number;
  invested: number;
  profit: number;
}

export function InvestmentCalculator() {
  const [initialInvestment, setInitialInvestment] = useState<string>('10000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('500');
  const [expectedReturn, setExpectedReturn] = useState<string>('8');
  const [investmentPeriod, setInvestmentPeriod] = useState<string>('10');
  const [finalValue, setFinalValue] = useState<number | null>(null);
  const [totalInvested, setTotalInvested] = useState<number | null>(null);
  const [totalProfit, setTotalProfit] = useState<number | null>(null);
  const [roi, setROI] = useState<number | null>(null);
  const [annualizedReturn, setAnnualizedReturn] = useState<number | null>(null);
  const [showProjection, setShowProjection] = useState(false);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [copied, setCopied] = useState(false);

  const calculateInvestment = useCallback(() => {
    const initialNum = parseFloat(initialInvestment);
    const contributionNum = parseFloat(monthlyContribution);
    const returnNum = parseFloat(expectedReturn);
    const periodNum = parseFloat(investmentPeriod);

    if (isNaN(initialNum) || isNaN(contributionNum) || isNaN(returnNum) || isNaN(periodNum) || 
        initialNum < 0 || contributionNum < 0 || returnNum < 0 || periodNum <= 0) {
      setFinalValue(null);
      setTotalInvested(null);
      setTotalProfit(null);
      setROI(null);
      setAnnualizedReturn(null);
      setYearlyData([]);
      return;
    }

    const rate = returnNum / 100;
    const totalMonths = periodNum * 12;

    // Future value calculation
    const initialFV = initialNum * Math.pow(1 + rate / 12, totalMonths);
    const contributionFV = contributionNum * ((Math.pow(1 + rate / 12, totalMonths) - 1) / (rate / 12));
    const finalValueValue = initialFV + contributionFV;
    const totalInvestedValue = initialNum + (contributionNum * totalMonths);
    const totalProfitValue = finalValueValue - totalInvestedValue;
    const roiValue = (totalProfitValue / totalInvestedValue) * 100;

    // CAGR calculation
    const annualizedReturnValue = totalInvestedValue > 0 
      ? (Math.pow(finalValueValue / totalInvestedValue, 1 / periodNum) - 1) * 100 
      : 0;

    setFinalValue(finalValueValue);
    setTotalInvested(totalInvestedValue);
    setTotalProfit(totalProfitValue);
    setROI(roiValue);
    setAnnualizedReturn(annualizedReturnValue);

    // Generate yearly projection
    const data: YearlyData[] = [];
    for (let year = 1; year <= periodNum; year++) {
      const yearMonths = year * 12;
      const yearInitialFV = initialNum * Math.pow(1 + rate / 12, yearMonths);
      const yearContributionFV = contributionNum * ((Math.pow(1 + rate / 12, yearMonths) - 1) / (rate / 12));
      const yearValue = yearInitialFV + yearContributionFV;
      const yearInvested = initialNum + (contributionNum * yearMonths);
      
      data.push({
        year,
        value: yearValue,
        invested: yearInvested,
        profit: yearValue - yearInvested
      });
    }
    setYearlyData(data);
  }, [initialInvestment, monthlyContribution, expectedReturn, investmentPeriod]);

  useEffect(() => {
    calculateInvestment();
  }, [calculateInvestment]);

  const handleCopy = () => {
    if (finalValue !== null && totalProfit !== null && roi !== null && totalInvested !== null) {
      const result = `Initial Investment: $${parseFloat(initialInvestment).toFixed(2)}\nMonthly Contribution: $${parseFloat(monthlyContribution).toFixed(2)}\nFinal Value: $${finalValue.toFixed(2)}\nTotal Invested: $${totalInvested.toFixed(2)}\nTotal Profit: $${totalProfit.toFixed(2)}\nROI: ${roi.toFixed(2)}%`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const roiColor = roi !== null ? (roi >= 0 ? 'text-green-600' : 'text-red-600') : 'text-foreground';
  const profitColor = totalProfit !== null ? (totalProfit >= 0 ? 'text-green-600' : 'text-red-600') : 'text-foreground';

  return (
    <div className="w-full space-y-6">
      {/* Initial Investment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Initial Investment</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="10000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Monthly Contribution */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Monthly Contribution</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="500"
            min="0"
            step="10"
          />
        </div>
      </div>

      {/* Expected Return */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Expected Annual Return (%)</label>
        <div className="relative">
          <input
            type="number"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="8"
            min="0"
            step="0.5"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Investment Period */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Investment Period (Years)</label>
        <input
          type="number"
          value={investmentPeriod}
          onChange={(e) => setInvestmentPeriod(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="10"
          min="1"
          step="1"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Investment Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Final Value:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(finalValue)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Invested:</p>
            <p className="text-foreground">{formatCurrency(totalInvested)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Profit:</p>
            <p className={`text-lg font-semibold ${profitColor}`}>{formatCurrency(totalProfit)}</p>
          </div>
          <div>
            <p className="text-foreground/60">ROI:</p>
            <p className={`text-lg font-semibold ${roiColor}`}>{roi !== null ? `${roi.toFixed(2)}%` : '0.00%'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Annualized Return (CAGR):</p>
            <p className="text-foreground">{annualizedReturn !== null ? `${annualizedReturn.toFixed(2)}%` : '0.00%'}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowProjection(!showProjection)}
          className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {showProjection ? 'Hide' : 'View'} Yearly Projection
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Results'}
        </button>
      </div>

      {/* Yearly Projection */}
      {showProjection && yearlyData.length > 0 && (
        <div className="border border-input rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Year</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Value</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Invested</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Profit</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((entry) => (
                  <tr key={entry.year} className="border-t border-input">
                    <td className="px-3 py-2 text-foreground">{entry.year}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.value)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.invested)}</td>
                    <td className={`px-3 py-2 text-right ${entry.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(entry.profit)}</td>
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