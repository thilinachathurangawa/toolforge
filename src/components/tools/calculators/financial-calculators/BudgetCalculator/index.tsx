'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, PieChart } from 'lucide-react';

type BudgetRule = '503020' | '702010' | 'custom';

const BUDGET_RULES: { value: BudgetRule; label: string; description: string }[] = [
  { value: '503020', label: '50/30/20 Rule', description: '50% Needs, 30% Wants, 20% Savings' },
  { value: '702010', label: '70/20/10 Rule', description: '70% Needs, 20% Wants, 10% Savings' },
  { value: 'custom', label: 'Custom', description: 'Set your own percentages' },
];

export function BudgetCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('5000');
  const [budgetRule, setBudgetRule] = useState<BudgetRule>('503020');
  const [customNeeds, setCustomNeeds] = useState<string>('50');
  const [customWants, setCustomWants] = useState<string>('30');
  const [budgetAllocation, setBudgetAllocation] = useState<{
    needs: number;
    wants: number;
    savings: number;
    needsPercent: number;
    wantsPercent: number;
    savingsPercent: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateBudget = useCallback(() => {
    const incomeNum = parseFloat(monthlyIncome);
    const customNeedsNum = parseFloat(customNeeds);
    const customWantsNum = parseFloat(customWants);

    if (isNaN(incomeNum) || incomeNum <= 0) {
      setBudgetAllocation(null);
      return;
    }

    let needsPercent: number;
    let wantsPercent: number;
    let savingsPercent: number;

    switch(budgetRule) {
      case '503020':
        needsPercent = 50;
        wantsPercent = 30;
        savingsPercent = 20;
        break;
      case '702010':
        needsPercent = 70;
        wantsPercent = 20;
        savingsPercent = 10;
        break;
      case 'custom':
        if (isNaN(customNeedsNum) || isNaN(customWantsNum) || 
            customNeedsNum < 0 || customWantsNum < 0 || 
            customNeedsNum + customWantsNum > 100) {
          setBudgetAllocation(null);
          return;
        }
        needsPercent = customNeedsNum;
        wantsPercent = customWantsNum;
        savingsPercent = 100 - customNeedsNum - customWantsNum;
        break;
    }

    const needs = incomeNum * (needsPercent / 100);
    const wants = incomeNum * (wantsPercent / 100);
    const savings = incomeNum * (savingsPercent / 100);

    setBudgetAllocation({
      needs,
      wants,
      savings,
      needsPercent,
      wantsPercent,
      savingsPercent,
    });
  }, [monthlyIncome, budgetRule, customNeeds, customWants]);

  useEffect(() => {
    calculateBudget();
  }, [calculateBudget]);

  const handleCopy = () => {
    if (budgetAllocation) {
      const result = `Monthly Income: $${parseFloat(monthlyIncome).toFixed(2)}\nNeeds (${budgetAllocation.needsPercent}%): $${budgetAllocation.needs.toFixed(2)}\nWants (${budgetAllocation.wantsPercent}%): $${budgetAllocation.wants.toFixed(2)}\nSavings (${budgetAllocation.savingsPercent}%): $${budgetAllocation.savings.toFixed(2)}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Monthly Income */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Monthly Income</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Budget Rule */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Budget Rule</label>
        <select
          value={budgetRule}
          onChange={(e) => setBudgetRule(e.target.value as BudgetRule)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {BUDGET_RULES.map((rule) => (
            <option key={rule.value} value={rule.value}>
              {rule.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-foreground/60">
          {BUDGET_RULES.find(r => r.value === budgetRule)?.description}
        </p>
      </div>

      {/* Custom Percentages */}
      {budgetRule === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Needs %</label>
            <div className="relative">
              <input
                type="number"
                value={customNeeds}
                onChange={(e) => setCustomNeeds(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="50"
                min="0"
                max="100"
                step="1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Wants %</label>
            <div className="relative">
              <input
                type="number"
                value={customWants}
                onChange={(e) => setCustomWants(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="30"
                min="0"
                max="100"
                step="1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {budgetAllocation && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Budget Allocation
          </h3>
          
          {/* Budget Breakdown */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground/60">Needs ({budgetAllocation.needsPercent}%)</span>
                <span className="text-foreground font-semibold">{formatCurrency(budgetAllocation.needs)}</span>
              </div>
              <div className="h-2 bg-input rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all" 
                  style={{ width: `${budgetAllocation.needsPercent}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground/60">Wants ({budgetAllocation.wantsPercent}%)</span>
                <span className="text-foreground font-semibold">{formatCurrency(budgetAllocation.wants)}</span>
              </div>
              <div className="h-2 bg-input rounded-full overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all" 
                  style={{ width: `${budgetAllocation.wantsPercent}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground/60">Savings/Debt ({budgetAllocation.savingsPercent}%)</span>
                <span className="text-foreground font-semibold">{formatCurrency(budgetAllocation.savings)}</span>
              </div>
              <div className="h-2 bg-input rounded-full overflow-hidden">
                <div 
                  className="bg-green-600 h-full transition-all" 
                  style={{ width: `${budgetAllocation.savingsPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-input">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">Total:</span>
              <span className="text-foreground font-semibold">{formatCurrency(budgetAllocation.needs + budgetAllocation.wants + budgetAllocation.savings)}</span>
            </div>
          </div>
        </div>
      )}

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