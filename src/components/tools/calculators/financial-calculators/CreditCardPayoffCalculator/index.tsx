'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, CreditCard } from 'lucide-react';

export function CreditCardPayoffCalculator() {
  const [balance, setBalance] = useState<string>('5000');
  const [interestRate, setInterestRate] = useState<string>('18.99');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('200');
  const [minimumPayment, setMinimumPayment] = useState<string>('150');
  const [payoffMonths, setPayoffMonths] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPaid, setTotalPaid] = useState<number | null>(null);
  const [savingsWithHigherPayment, setSavingsWithHigherPayment] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateCreditCardPayoff = useCallback(() => {
    const balanceNum = parseFloat(balance);
    const rateNum = parseFloat(interestRate);
    const paymentNum = parseFloat(monthlyPayment);
    const minPaymentNum = parseFloat(minimumPayment);

    if (isNaN(balanceNum) || isNaN(rateNum) || isNaN(paymentNum) || isNaN(minPaymentNum) || 
        balanceNum <= 0 || rateNum < 0 || paymentNum <= 0 || minPaymentNum <= 0) {
      setPayoffMonths(null);
      setTotalInterest(null);
      setTotalPaid(null);
      setSavingsWithHigherPayment(null);
      return;
    }

    const monthlyRate = rateNum / 100 / 12;

    // Calculate payoff with current payment
    let currentBalance = balanceNum;
    let currentTotalInterest = 0;
    let currentMonths = 0;

    if (paymentNum <= currentBalance * monthlyRate) {
      setPayoffMonths(null);
      setTotalInterest(null);
      setTotalPaid(null);
      setSavingsWithHigherPayment(null);
      return;
    }

    while (currentBalance > 0 && currentMonths < 600) {
      const interestPayment = currentBalance * monthlyRate;
      const principalPayment = paymentNum - interestPayment;
      
      currentTotalInterest += interestPayment;
      currentBalance -= principalPayment;
      currentMonths++;
    }

    setPayoffMonths(currentMonths);
    setTotalInterest(currentTotalInterest);
    setTotalPaid(balanceNum + currentTotalInterest);

    // Calculate payoff with minimum payment for comparison
    if (paymentNum > minPaymentNum) {
      let minBalance = balanceNum;
      let minTotalInterest = 0;
      let minMonths = 0;

      while (minBalance > 0 && minMonths < 600) {
        const interestPayment = minBalance * monthlyRate;
        const principalPayment = minPaymentNum - interestPayment;
        
        if (principalPayment <= 0) {
          break;
        }
        
        minTotalInterest += interestPayment;
        minBalance -= principalPayment;
        minMonths++;
      }

      if (minMonths < 600) {
        const minTotalPaid = balanceNum + minTotalInterest;
        setSavingsWithHigherPayment(minTotalPaid - (balanceNum + currentTotalInterest));
      } else {
        setSavingsWithHigherPayment(null);
      }
    } else {
      setSavingsWithHigherPayment(null);
    }
  }, [balance, interestRate, monthlyPayment, minimumPayment]);

  useEffect(() => {
    calculateCreditCardPayoff();
  }, [calculateCreditCardPayoff]);

  const handleCopy = () => {
    if (payoffMonths !== null && totalInterest !== null && totalPaid !== null) {
      const result = `Credit Card Balance: $${parseFloat(balance).toFixed(2)}\nMonthly Payment: $${parseFloat(monthlyPayment).toFixed(2)}\nPayoff Time: ${payoffMonths} months\nTotal Interest: $${totalInterest.toFixed(2)}\nTotal Paid: $${totalPaid.toFixed(2)}`;
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
      {/* Balance */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Credit Card Balance</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
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
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="18.99"
            min="0"
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

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
            placeholder="200"
            min="0"
            step="10"
          />
        </div>
      </div>

      {/* Minimum Payment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Minimum Payment</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
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
          <CreditCard className="w-4 h-4" />
          Credit Card Payoff Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Time to Payoff:</p>
            <p className="text-lg font-semibold text-foreground">{formatYearsAndMonths(payoffMonths)}</p>
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

        {savingsWithHigherPayment !== null && savingsWithHigherPayment > 0 && (
          <div className="pt-3 border-t border-input">
            <p className="text-sm text-green-600 font-semibold">
              You'll save {formatCurrency(savingsWithHigherPayment)} compared to making minimum payments
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