'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, DollarSign } from 'lucide-react';

type InputType = 'annual' | 'hourly' | 'monthly' | 'weekly';

const INPUT_TYPES: { value: InputType; label: string }[] = [
  { value: 'annual', label: 'Annual Salary' },
  { value: 'hourly', label: 'Hourly Wage' },
  { value: 'monthly', label: 'Monthly Salary' },
  { value: 'weekly', label: 'Weekly Salary' },
];

export function SalaryCalculator() {
  const [inputType, setInputType] = useState<InputType>('annual');
  const [amount, setAmount] = useState<string>('50000');
  const [hoursPerWeek, setHoursPerWeek] = useState<string>('40');
  const [weeksPerYear, setWeeksPerYear] = useState<string>('52');
  const [annualSalary, setAnnualSalary] = useState<number | null>(null);
  const [monthlySalary, setMonthlySalary] = useState<number | null>(null);
  const [weeklySalary, setWeeklySalary] = useState<number | null>(null);
  const [hourlyWage, setHourlyWage] = useState<number | null>(null);
  const [biWeeklyPay, setBiWeeklyPay] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateSalaryConversions = useCallback(() => {
    const amountNum = parseFloat(amount);
    const hoursNum = parseFloat(hoursPerWeek);
    const weeksNum = parseFloat(weeksPerYear);

    if (isNaN(amountNum) || amountNum <= 0 || isNaN(hoursNum) || hoursNum <= 0 || isNaN(weeksNum) || weeksNum <= 0) {
      setAnnualSalary(null);
      setMonthlySalary(null);
      setWeeklySalary(null);
      setHourlyWage(null);
      setBiWeeklyPay(null);
      return;
    }

    // Convert input to annual salary first
    let annualValue: number;
    switch(inputType) {
      case 'annual':
        annualValue = amountNum;
        break;
      case 'hourly':
        annualValue = amountNum * hoursNum * weeksNum;
        break;
      case 'monthly':
        annualValue = amountNum * 12;
        break;
      case 'weekly':
        annualValue = amountNum * weeksNum;
        break;
    }

    const monthlyValue = annualValue / 12;
    const weeklyValue = annualValue / weeksNum;
    const hourlyValue = annualValue / (hoursNum * weeksNum);
    const biWeeklyValue = weeklyValue * 2;

    setAnnualSalary(annualValue);
    setMonthlySalary(monthlyValue);
    setWeeklySalary(weeklyValue);
    setHourlyWage(hourlyValue);
    setBiWeeklyPay(biWeeklyValue);
  }, [amount, inputType, hoursPerWeek, weeksPerYear]);

  useEffect(() => {
    calculateSalaryConversions();
  }, [calculateSalaryConversions]);

  const handleCopy = () => {
    if (annualSalary !== null) {
      const result = `Annual Salary: ${formatCurrency(annualSalary)}\nMonthly Salary: ${formatCurrency(monthlySalary)}\nWeekly Salary: ${formatCurrency(weeklySalary)}\nHourly Wage: ${formatCurrency(hourlyWage)}`;
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
      {/* Input Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Input Type</label>
        <select
          value={inputType}
          onChange={(e) => setInputType(e.target.value as InputType)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {INPUT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="50000"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Hours per Week */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Hours per Week</label>
        <input
          type="number"
          value={hoursPerWeek}
          onChange={(e) => setHoursPerWeek(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="40"
          min="0"
          step="1"
        />
      </div>

      {/* Weeks per Year */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Weeks per Year</label>
        <input
          type="number"
          value={weeksPerYear}
          onChange={(e) => setWeeksPerYear(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="52"
          min="0"
          step="1"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Salary Conversions
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Annual Salary:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(annualSalary)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Monthly Salary:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(monthlySalary)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Weekly Salary:</p>
            <p className="text-foreground">{formatCurrency(weeklySalary)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Bi-Weekly Pay:</p>
            <p className="text-foreground">{formatCurrency(biWeeklyPay)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Hourly Wage:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(hourlyWage)}</p>
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