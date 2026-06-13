'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, DollarSign } from 'lucide-react';

export function TipCalculator() {
  const [billAmount, setBillAmount] = useState<string>('50');
  const [tipPercentage, setTipPercentage] = useState<string>('15');
  const [numberOfPeople, setNumberOfPeople] = useState<string>('2');
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [perPersonBill, setPerPersonBill] = useState<number | null>(null);
  const [perPersonTip, setPerPersonTip] = useState<number | null>(null);
  const [perPersonTotal, setPerPersonTotal] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const quickPercentages = [10, 15, 18, 20, 25];

  const calculateTip = useCallback(() => {
    const billNum = parseFloat(billAmount);
    const tipNum = parseFloat(tipPercentage);
    const peopleNum = parseFloat(numberOfPeople);

    if (isNaN(billNum) || isNaN(tipNum) || isNaN(peopleNum) || 
        billNum <= 0 || tipNum < 0 || peopleNum <= 0) {
      setTipAmount(null);
      setTotalAmount(null);
      setPerPersonBill(null);
      setPerPersonTip(null);
      setPerPersonTotal(null);
      return;
    }

    const tipValue = billNum * (tipNum / 100);
    const totalValue = billNum + tipValue;
    const perPersonBillValue = billNum / peopleNum;
    const perPersonTipValue = tipValue / peopleNum;
    const perPersonTotalValue = perPersonBillValue + perPersonTipValue;

    setTipAmount(tipValue);
    setTotalAmount(totalValue);
    setPerPersonBill(perPersonBillValue);
    setPerPersonTip(perPersonTipValue);
    setPerPersonTotal(perPersonTotalValue);
  }, [billAmount, tipPercentage, numberOfPeople]);

  useEffect(() => {
    calculateTip();
  }, [calculateTip]);

  const handleCopy = () => {
    if (totalAmount !== null && tipAmount !== null) {
      const result = `Bill Amount: $${parseFloat(billAmount).toFixed(2)}\nTip Amount: $${tipAmount.toFixed(2)}\nTotal Amount: $${totalAmount.toFixed(2)}\nPer Person: $${perPersonTotal.toFixed(2)}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleQuickPercentage = (percent: number) => {
    setTipPercentage(percent.toString());
  };

  return (
    <div className="w-full space-y-6">
      {/* Bill Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Bill Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="50"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Tip Percentage */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tip Percentage</label>
        <div className="relative">
          <input
            type="number"
            value={tipPercentage}
            onChange={(e) => setTipPercentage(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="15"
            min="0"
            max="100"
            step="1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
        {/* Quick Percentage Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickPercentages.map((percent) => (
            <button
              key={percent}
              onClick={() => handleQuickPercentage(percent)}
              className="px-3 py-1 text-xs font-medium bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {percent}%
            </button>
          ))}
        </div>
      </div>

      {/* Number of People */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Split Between</label>
        <input
          type="number"
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="2"
          min="1"
          step="1"
        />
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Tip Results
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Bill Amount:</span>
            <span className="text-foreground">{formatCurrency(parseFloat(billAmount) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Tip Amount:</span>
            <span className="text-foreground">{formatCurrency(tipAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Total Amount:</span>
            <span className="text-foreground font-semibold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Per Person Breakdown */}
        <div className="pt-3 border-t border-input">
          <p className="text-xs text-foreground/60 mb-2">Per Person:</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Bill portion:</span>
              <span className="text-foreground">{formatCurrency(perPersonBill)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Tip portion:</span>
              <span className="text-foreground">{formatCurrency(perPersonTip)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60 font-semibold">Total per person:</span>
              <span className="text-foreground font-semibold">{formatCurrency(perPersonTotal)}</span>
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