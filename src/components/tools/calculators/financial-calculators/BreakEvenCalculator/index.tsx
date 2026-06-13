'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Target } from 'lucide-react';

export function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState<string>('5000');
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<string>('10');
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState<string>('25');
  const [breakEvenUnits, setBreakEvenUnits] = useState<number | null>(null);
  const [breakEvenRevenue, setBreakEvenRevenue] = useState<number | null>(null);
  const [contributionMargin, setContributionMargin] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateBreakEven = useCallback(() => {
    const fixedNum = parseFloat(fixedCosts);
    const variableNum = parseFloat(variableCostPerUnit);
    const sellingNum = parseFloat(sellingPricePerUnit);

    if (isNaN(fixedNum) || isNaN(variableNum) || isNaN(sellingNum) || 
        fixedNum < 0 || variableNum < 0 || sellingNum <= 0) {
      setBreakEvenUnits(null);
      setBreakEvenRevenue(null);
      setContributionMargin(null);
      return;
    }

    const contributionMarginValue = sellingNum - variableNum;
    
    if (contributionMarginValue <= 0) {
      setBreakEvenUnits(null);
      setBreakEvenRevenue(null);
      setContributionMargin(contributionMarginValue);
      return;
    }

    const breakEvenUnitsValue = fixedNum / contributionMarginValue;
    const breakEvenRevenueValue = breakEvenUnitsValue * sellingNum;

    setBreakEvenUnits(breakEvenUnitsValue);
    setBreakEvenRevenue(breakEvenRevenueValue);
    setContributionMargin(contributionMarginValue);
  }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit]);

  useEffect(() => {
    calculateBreakEven();
  }, [calculateBreakEven]);

  const handleCopy = () => {
    if (breakEvenUnits !== null && breakEvenRevenue !== null) {
      const result = `Fixed Costs: $${parseFloat(fixedCosts).toFixed(2)}\nVariable Cost per Unit: $${parseFloat(variableCostPerUnit).toFixed(2)}\nSelling Price per Unit: $${parseFloat(sellingPricePerUnit).toFixed(2)}\nBreak-Even Units: ${breakEvenUnits.toFixed(2)}\nBreak-Even Revenue: $${breakEvenRevenue.toFixed(2)}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null) return '0';
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isLoss = contributionMargin !== null && contributionMargin <= 0;

  return (
    <div className="w-full space-y-6">
      {/* Fixed Costs */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Fixed Costs</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Variable Cost per Unit */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Variable Cost per Unit</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={variableCostPerUnit}
            onChange={(e) => setVariableCostPerUnit(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="10"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Selling Price per Unit */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Selling Price per Unit</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={sellingPricePerUnit}
            onChange={(e) => setSellingPricePerUnit(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="25"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4" />
          Break-Even Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Contribution Margin:</p>
            <p className={`text-lg font-semibold ${isLoss ? 'text-red-600' : 'text-foreground'}`}>
              {contributionMargin !== null ? formatCurrency(contributionMargin) : '$0.00'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Break-Even Units:</p>
            <p className={`text-lg font-semibold ${isLoss ? 'text-red-600' : 'text-foreground'}`}>
              {isLoss ? '∞ (Loss)' : formatNumber(breakEvenUnits)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Break-Even Revenue:</p>
            <p className={`text-lg font-semibold ${isLoss ? 'text-red-600' : 'text-foreground'}`}>
              {isLoss ? 'N/A (Loss)' : formatCurrency(breakEvenRevenue)}
            </p>
          </div>
        </div>

        {isLoss && (
          <div className="pt-3 border-t border-input">
            <p className="text-xs text-red-600">
              Warning: Your selling price is less than or equal to your variable cost. This means you will lose money on each unit sold.
            </p>
          </div>
        )}
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