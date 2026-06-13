'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, TrendingDown } from 'lucide-react';

type PayoffMethod = 'avalanche' | 'snowball';

interface Debt {
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

const PAYOFF_METHODS: { value: PayoffMethod; label: string; description: string }[] = [
  { value: 'avalanche', label: 'Avalanche', description: 'Pay highest interest first' },
  { value: 'snowball', label: 'Snowball', description: 'Pay lowest balance first' },
];

export function DebtPayoffCalculator() {
  const [monthlyPayment, setMonthlyPayment] = useState<string>('500');
  const [debtBalance, setDebtBalance] = useState<string>('5000');
  const [debtInterestRate, setDebtInterestRate] = useState<string>('18');
  const [debtMinimumPayment, setDebtMinimumPayment] = useState<string>('150');
  const [payoffMethod, setPayoffMethod] = useState<PayoffMethod>('avalanche');
  const [monthsToPayoff, setMonthsToPayoff] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPaid, setTotalPaid] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateDebtPayoff = useCallback(() => {
    const paymentNum = parseFloat(monthlyPayment);
    const balanceNum = parseFloat(debtBalance);
    const rateNum = parseFloat(debtInterestRate);
    const minPaymentNum = parseFloat(debtMinimumPayment);

    if (isNaN(paymentNum) || isNaN(balanceNum) || isNaN(rateNum) || isNaN(minPaymentNum) || 
        paymentNum <= 0 || balanceNum <= 0 || rateNum < 0 || minPaymentNum <= 0) {
      setMonthsToPayoff(null);
      setTotalInterest(null);
      setTotalPaid(null);
      return;
    }

    const monthlyRate = rateNum / 100 / 12;
    let balance = balanceNum;
    let totalInterestValue = 0;
    let months = 0;

    if (paymentNum <= minPaymentNum) {
      setMonthsToPayoff(null);
      setTotalInterest(null);
      setTotalPaid(null);
      return;
    }

    while (balance > 0 && months < 600) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = paymentNum - interestPayment;
      
      if (principalPayment <= 0) {
        // Payment only covers interest
        setMonthsToPayoff(null);
        setTotalInterest(null);
        setTotalPaid(null);
        return;
      }

      totalInterestValue += interestPayment;
      balance -= principalPayment;
      months++;
    }

    setMonthsToPayoff(months);
    setTotalInterest(totalInterestValue);
    setTotalPaid(balanceNum + totalInterestValue);
  }, [monthlyPayment, debtBalance, debtInterestRate, debtMinimumPayment]);

  useEffect(() => {
    calculateDebtPayoff();
  }, [calculateDebtPayoff]);

  const handleCopy = () => {
    if (monthsToPayoff !== null && totalInterest !== null && totalPaid !== null) {
      const result = `Debt Balance: $${parseFloat(debtBalance).toFixed(2)}\nMonthly Payment: $${parseFloat(monthlyPayment).toFixed(2)}\nPayoff Time: ${monthsToPayoff} months\nTotal Interest: $${totalInterest.toFixed(2)}\nTotal Paid: $${totalPaid.toFixed(2)}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatYearsAndMonths = (months: number | null) => {
    if (months === null) return 'N/A';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} years`;
    return `${years} years, ${remainingMonths} months`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Monthly Payment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Monthly Payment</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="500"
            min="0"
            step="10"
          />
        </div>
      </div>

      {/* Debt Balance */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Debt Balance</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={debtBalance}
            onChange={(e) => setDebtBalance(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Interest Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Interest Rate (Annual %)</label>
        <div className="relative">
          <input
            type="number"
            value={debtInterestRate}
            onChange={(e) => setDebtInterestRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="18"
            min="0"
            step="0.5"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Minimum Payment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Minimum Payment</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={debtMinimumPayment}
            onChange={(e) => setDebtMinimumPayment(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="150"
            min="0"
            step="10"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Debt Payoff Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Time to Payoff:</p>
            <p className="text-lg font-semibold text-foreground">{formatYearsAndMonths(monthsToPayoff)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Interest:</p>
            <p className="text-lg font-semibold text-red-600">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Total Amount Paid:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalPaid)}</p>
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