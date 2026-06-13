'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, GraduationCap } from 'lucide-react';

type RepaymentPlan = 'standard' | 'graduated' | 'extended';

const REPAYMENT_PLANS: { value: RepaymentPlan; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: '10-year fixed payments' },
  { value: 'graduated', label: 'Graduated', description: 'Payments increase over time' },
  { value: 'extended', label: 'Extended', description: '25-year fixed payments' },
];

interface PaymentScheduleEntry {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function StudentLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('30000');
  const [interestRate, setInterestRate] = useState<string>('6.8');
  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlan>('standard');
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPaid, setTotalPaid] = useState<number | null>(null);
  const [totalMonths, setTotalMonths] = useState<number | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const calculateStudentLoan = useCallback(() => {
    const amountNum = parseFloat(loanAmount);
    const rateNum = parseFloat(interestRate);

    if (isNaN(amountNum) || isNaN(rateNum) || amountNum <= 0 || rateNum < 0) {
      setMonthlyPayment(null);
      setTotalInterest(null);
      setTotalPaid(null);
      setTotalMonths(null);
      setPaymentSchedule([]);
      return;
    }

    const monthlyRate = rateNum / 100 / 12;
    let months: number;
    let payment: number;

    switch(repaymentPlan) {
      case 'standard':
        months = 10 * 12;
        if (monthlyRate === 0) {
          payment = amountNum / months;
        } else {
          payment = amountNum * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        }
        break;
      case 'extended':
        months = 25 * 12;
        if (monthlyRate === 0) {
          payment = amountNum / months;
        } else {
          payment = amountNum * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        }
        break;
      case 'graduated':
        months = 10 * 12;
        // For graduated, calculate based on standard 10-year then adjust
        if (monthlyRate === 0) {
          payment = amountNum / months;
        } else {
          payment = amountNum * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        }
        // For simplicity, use the average payment for graduated plan
        payment = payment * 0.8; // Starting payment lower
        break;
    }

    // Calculate total interest and payment schedule
    let balance = amountNum;
    let totalInterestValue = 0;
    const schedule: PaymentScheduleEntry[] = [];

    for (let i = 1; i <= months; i++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = payment - interestPayment;

      if (repaymentPlan === 'graduated') {
        // Increase payment by 2% each year
        const year = Math.floor((i - 1) / 12);
        principalPayment = payment * Math.pow(1.02, year) - interestPayment;
      }

      if (principalPayment <= 0) {
        break;
      }

      if (principalPayment > balance) {
        principalPayment = balance;
      }

      totalInterestValue += interestPayment;
      balance -= principalPayment;

      schedule.push({
        paymentNumber: i,
        payment: interestPayment + principalPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });

      if (balance <= 0) {
        break;
      }
    }

    const actualMonths = schedule.length;
    const totalPaidValue = amountNum + totalInterestValue;
    const avgPayment = totalPaidValue / actualMonths;

    setMonthlyPayment(avgPayment);
    setTotalInterest(totalInterestValue);
    setTotalPaid(totalPaidValue);
    setTotalMonths(actualMonths);
    setPaymentSchedule(schedule);
  }, [loanAmount, interestRate, repaymentPlan]);

  useEffect(() => {
    calculateStudentLoan();
  }, [calculateStudentLoan]);

  const handleCopy = () => {
    if (monthlyPayment !== null && totalInterest !== null && totalPaid !== null) {
      const result = `Student Loan Amount: $${parseFloat(loanAmount).toFixed(2)}\nMonthly Payment: $${monthlyPayment.toFixed(2)}\nPayoff Time: ${totalMonths} months\nTotal Interest: $${totalInterest.toFixed(2)}\nTotal Paid: $${totalPaid.toFixed(2)}`;
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
      {/* Loan Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Student Loan Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="30000"
            min="0"
            step="1000"
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
            placeholder="6.8"
            min="0"
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Repayment Plan */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Repayment Plan</label>
        <select
          value={repaymentPlan}
          onChange={(e) => setRepaymentPlan(e.target.value as RepaymentPlan)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {REPAYMENT_PLANS.map((plan) => (
            <option key={plan.value} value={plan.value}>
              {plan.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-foreground/60">
          {REPAYMENT_PLANS.find(p => p.value === repaymentPlan)?.description}
        </p>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Student Loan Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Monthly Payment:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(monthlyPayment)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Payoff Time:</p>
            <p className="text-lg font-semibold text-foreground">{formatYearsAndMonths(totalMonths)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Interest:</p>
            <p className="text-lg font-semibold text-red-600">{formatCurrency(totalInterest)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Total Paid:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {showSchedule ? 'Hide' : 'View'} Payment Schedule
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Results'}
        </button>
      </div>

      {/* Payment Schedule */}
      {showSchedule && paymentSchedule.length > 0 && (
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
                {paymentSchedule.map((entry) => (
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