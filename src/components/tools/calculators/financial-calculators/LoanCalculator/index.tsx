'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoanType = 'mortgage' | 'auto' | 'personal' | 'other';
type TermUnit = 'years' | 'months';

interface AmortizationEntry {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const LOAN_TYPES: { value: LoanType; label: string }[] = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'personal', label: 'Personal Loan' },
  { value: 'other', label: 'Other' },
];

const TERM_UNITS: { value: TermUnit; label: string }[] = [
  { value: 'years', label: 'Years' },
  { value: 'months', label: 'Months' },
];

export function LoanCalculator() {
  const [loanType, setLoanType] = useState<LoanType>('personal');
  const [principal, setPrincipal] = useState<string>('10000');
  const [interestRate, setInterestRate] = useState<string>('5.5');
  const [loanTerm, setLoanTerm] = useState<string>('5');
  const [loanTermUnit, setLoanTermUnit] = useState<TermUnit>('years');
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const calculateMonthlyPayment = useCallback(() => {
    const principalNum = parseFloat(principal);
    const rateNum = parseFloat(interestRate);
    const termNum = parseFloat(loanTerm);

    if (isNaN(principalNum) || isNaN(rateNum) || isNaN(termNum) || 
        principalNum <= 0 || rateNum < 0 || termNum <= 0) {
      setMonthlyPayment(null);
      setTotalInterest(null);
      setTotalCost(null);
      setAmortizationSchedule([]);
      return;
    }

    // Convert term to years
    const years = loanTermUnit === 'months' ? termNum / 12 : termNum;
    const monthlyRate = rateNum / 100 / 12;
    const numberOfPayments = years * 12;

    let payment: number;
    if (monthlyRate === 0) {
      payment = principalNum / numberOfPayments;
    } else {
      payment = principalNum * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const interestTotal = (payment * numberOfPayments) - principalNum;
    const costTotal = principalNum + interestTotal;

    setMonthlyPayment(payment);
    setTotalInterest(interestTotal);
    setTotalCost(costTotal);

    // Generate amortization schedule
    const schedule: AmortizationEntry[] = [];
    let balance = principalNum;
    
    for (let i = 1; i <= numberOfPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        paymentNumber: i,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    setAmortizationSchedule(schedule);
  }, [principal, interestRate, loanTerm, loanTermUnit]);

  useEffect(() => {
    calculateMonthlyPayment();
  }, [calculateMonthlyPayment]);

  const handleCopy = () => {
    if (monthlyPayment !== null && totalInterest !== null && totalCost !== null) {
      const result = `Monthly Payment: $${monthlyPayment.toFixed(2)}\nTotal Interest: $${totalInterest.toFixed(2)}\nTotal Cost: $${totalCost.toFixed(2)}`;
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
      {/* Loan Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Loan Type</label>
        <select
          value={loanType}
          onChange={(e) => setLoanType(e.target.value as LoanType)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {LOAN_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loan Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Loan Amount</label>
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
        <label className="text-sm font-medium text-foreground">Interest Rate (Annual %)</label>
        <div className="relative">
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5.5"
            min="0"
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Loan Term */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Loan Term</label>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5"
            min="1"
            step="1"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Unit</label>
          <select
            value={loanTermUnit}
            onChange={(e) => setLoanTermUnit(e.target.value as TermUnit)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {TERM_UNITS.map((unit) => (
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
          <Calculator className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Monthly Payment</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(monthlyPayment)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Interest</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Total Cost</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {showAmortization ? 'Hide' : 'View'} Amortization Schedule
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Results'}
        </button>
      </div>

      {/* Amortization Schedule */}
      {showAmortization && amortizationSchedule.length > 0 && (
        <div className="border border-input rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Payment #</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Payment</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Principal</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Interest</th>
                  <th className="px-3 py-2 text-right font-medium text-foreground">Balance</th>
                </tr>
              </thead>
              <tbody>
                {amortizationSchedule.map((entry) => (
                  <tr key={entry.paymentNumber} className="border-t border-input">
                    <td className="px-3 py-2 text-foreground">{entry.paymentNumber}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.payment)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.principal)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.interest)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatCurrency(entry.balance)}</td>
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