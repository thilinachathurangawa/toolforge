'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, TrendingUp } from 'lucide-react';

type PeriodUnit = 'days' | 'months' | 'years';

const PERIOD_UNITS: { value: PeriodUnit; label: string }[] = [
  { value: 'days', label: 'Days' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

export function ROICalculator() {
  const [initialInvestment, setInitialInvestment] = useState<string>('1000');
  const [finalValue, setFinalValue] = useState<string>('1500');
  const [investmentPeriod, setInvestmentPeriod] = useState<string>('6');
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('months');
  const [roi, setROI] = useState<number | null>(null);
  const [profit, setProfit] = useState<number | null>(null);
  const [annualizedROI, setAnnualizedROI] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateROI = useCallback(() => {
    const initialNum = parseFloat(initialInvestment);
    const finalNum = parseFloat(finalValue);
    const periodNum = parseFloat(investmentPeriod);

    if (isNaN(initialNum) || isNaN(finalNum) || initialNum <= 0) {
      setROI(null);
      setProfit(null);
      setAnnualizedROI(null);
      return;
    }

    const profitValue = finalNum - initialNum;
    const roiValue = (profitValue / initialNum) * 100;
    
    setROI(roiValue);
    setProfit(profitValue);

    // Calculate annualized ROI if period is provided
    if (!isNaN(periodNum) && periodNum > 0 && periodUnit !== 'years') {
      let years: number;
      switch(periodUnit) {
        case 'days':
          years = periodNum / 365;
          break;
        case 'months':
          years = periodNum / 12;
          break;
        default:
          years = periodNum;
      }

      if (years > 0 && initialNum > 0) {
        const annualizedValue = (Math.pow(finalNum / initialNum, 1 / years) - 1) * 100;
        setAnnualizedROI(annualizedValue);
      } else {
        setAnnualizedROI(null);
      }
    } else if (periodUnit === 'years' && !isNaN(periodNum) && periodNum > 0) {
      const years = periodNum;
      if (years > 0 && initialNum > 0) {
        const annualizedValue = (Math.pow(finalNum / initialNum, 1 / years) - 1) * 100;
        setAnnualizedROI(annualizedValue);
      } else {
        setAnnualizedROI(null);
      }
    } else {
      setAnnualizedROI(null);
    }
  }, [initialInvestment, finalValue, investmentPeriod, periodUnit]);

  useEffect(() => {
    calculateROI();
  }, [calculateROI]);

  const handleCopy = () => {
    if (roi !== null && profit !== null) {
      const result = `ROI: ${roi.toFixed(2)}%\nProfit: $${profit.toFixed(2)}${annualizedROI !== null ? `\nAnnualized ROI: ${annualizedROI.toFixed(2)}%` : ''}`;
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
  const profitColor = profit !== null ? (profit >= 0 ? 'text-green-600' : 'text-red-600') : 'text-foreground';

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
            placeholder="1000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Final Value */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Final Value</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={finalValue}
            onChange={(e) => setFinalValue(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="1500"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Investment Period (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Investment Period (Optional)</label>
          <input
            type="number"
            value={investmentPeriod}
            onChange={(e) => setInvestmentPeriod(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="6"
            min="0"
            step="1"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Unit</label>
          <select
            value={periodUnit}
            onChange={(e) => setPeriodUnit(e.target.value as PeriodUnit)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {PERIOD_UNITS.map((unit) => (
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
          <TrendingUp className="w-4 h-4" />
          ROI Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">ROI</p>
            <p className={`text-lg font-semibold ${roiColor}`}>{roi !== null ? `${roi.toFixed(2)}%` : '0.00%'}</p>
          </div>
          <div>
            <p className="text-foreground/60">Profit/Loss</p>
            <p className={`text-lg font-semibold ${profitColor}`}>{formatCurrency(profit)}</p>
          </div>
          {annualizedROI !== null && (
            <div className="col-span-2">
              <p className="text-foreground/60">Annualized ROI</p>
              <p className={`text-lg font-semibold ${roiColor}`}>{annualizedROI.toFixed(2)}%</p>
            </div>
          )}
        </div>

        {/* Investment Summary */}
        <div className="pt-3 border-t border-input">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Initial:</span>
              <span className="text-foreground">{formatCurrency(parseFloat(initialInvestment) || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Final:</span>
              <span className="text-foreground">{formatCurrency(parseFloat(finalValue) || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Return:</span>
              <span className={profitColor}>{profit !== null ? (profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`) : '$0.00'}</span>
            </div>
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