'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, DollarSign } from 'lucide-react';

type CommissionStructure = 'flat' | 'tiered' | 'graduated';

const COMMISSION_STRUCTURES: { value: CommissionStructure; label: string }[] = [
  { value: 'flat', label: 'Flat Rate' },
  { value: 'tiered', label: 'Tiered' },
  { value: 'graduated', label: 'Graduated' },
];

export function CommissionCalculator() {
  const [salesAmount, setSalesAmount] = useState<string>('10000');
  const [commissionRate, setCommissionRate] = useState<string>('10');
  const [commissionStructure, setCommissionStructure] = useState<CommissionStructure>('flat');
  const [baseSalary, setBaseSalary] = useState<string>('0');
  const [commissionAmount, setCommissionAmount] = useState<number | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateCommission = useCallback(() => {
    const salesNum = parseFloat(salesAmount);
    const rateNum = parseFloat(commissionRate);
    const baseNum = parseFloat(baseSalary);

    if (isNaN(salesNum) || isNaN(rateNum) || isNaN(baseNum) || 
        salesNum <= 0 || rateNum < 0 || baseNum < 0) {
      setCommissionAmount(null);
      setTotalEarnings(null);
      return;
    }

    const commissionValue = salesNum * (rateNum / 100);
    const totalEarningsValue = baseNum + commissionValue;

    setCommissionAmount(commissionValue);
    setTotalEarnings(totalEarningsValue);
  }, [salesAmount, commissionRate, baseSalary]);

  useEffect(() => {
    calculateCommission();
  }, [calculateCommission]);

  const handleCopy = () => {
    if (commissionAmount !== null && totalEarnings !== null) {
      const result = `Sales Amount: $${parseFloat(salesAmount).toFixed(2)}\nCommission Rate: ${commissionRate}%\nCommission Amount: $${commissionAmount.toFixed(2)}\nBase Salary: $${parseFloat(baseSalary).toFixed(2)}\nTotal Earnings: $${totalEarnings.toFixed(2)}`;
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
      {/* Sales Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Sales Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={salesAmount}
            onChange={(e) => setSalesAmount(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="10000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Commission Structure */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Commission Structure</label>
        <select
          value={commissionStructure}
          onChange={(e) => setCommissionStructure(e.target.value as CommissionStructure)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {COMMISSION_STRUCTURES.map((structure) => (
            <option key={structure.value} value={structure.value}>
              {structure.label}
            </option>
          ))}
        </select>
      </div>

      {/* Commission Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Commission Rate (%)</label>
        <div className="relative">
          <input
            type="number"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="10"
            min="0"
            max="100"
            step="0.5"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Base Salary (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Base Salary (Optional)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="0"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Commission Results
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Sales Amount:</span>
            <span className="text-foreground">{formatCurrency(parseFloat(salesAmount) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Commission Rate:</span>
            <span className="text-foreground">{commissionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Commission:</span>
            <span className="text-green-600 font-semibold">{formatCurrency(commissionAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Base Salary:</span>
            <span className="text-foreground">{formatCurrency(parseFloat(baseSalary) || 0)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-input">
            <span className="text-foreground/60 font-semibold">Total Earnings:</span>
            <span className="text-foreground font-semibold">{formatCurrency(totalEarnings)}</span>
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