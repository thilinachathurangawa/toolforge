'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

type VatMode = 'add' | 'remove';

const VAT_MODES: { value: VatMode; label: string }[] = [
  { value: 'add', label: 'Add VAT' },
  { value: 'remove', label: 'Remove VAT' },
];

export function VATCalculator() {
  const [mode, setMode] = useState<VatMode>('add');
  const [price, setPrice] = useState<string>('100');
  const [quantity, setQuantity] = useState<string>('1');
  const [vatRate, setVatRate] = useState<string>('20');
  const [priceExcludingVAT, setPriceExcludingVAT] = useState<number | null>(null);
  const [vatAmount, setVatAmount] = useState<number | null>(null);
  const [priceIncludingVAT, setPriceIncludingVAT] = useState<number | null>(null);
  const [totalExcludingVAT, setTotalExcludingVAT] = useState<number | null>(null);
  const [totalIncludingVAT, setTotalIncludingVAT] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateVAT = useCallback(() => {
    const priceNum = parseFloat(price);
    const qtyNum = parseFloat(quantity);
    const rateNum = parseFloat(vatRate);

    if (isNaN(priceNum) || isNaN(qtyNum) || isNaN(rateNum) || 
        priceNum <= 0 || qtyNum <= 0 || rateNum < 0 || rateNum > 100) {
      setPriceExcludingVAT(null);
      setVatAmount(null);
      setPriceIncludingVAT(null);
      setTotalExcludingVAT(null);
      setTotalIncludingVAT(null);
      return;
    }

    if (mode === 'add') {
      const vatPerItem = priceNum * (rateNum / 100);
      const priceIncludingVATValue = priceNum + vatPerItem;
      const totalExcludingVATValue = priceNum * qtyNum;
      const totalVAT = vatPerItem * qtyNum;
      const totalIncludingVATValue = totalExcludingVATValue + totalVAT;

      setPriceExcludingVAT(priceNum);
      setVatAmount(vatPerItem);
      setPriceIncludingVAT(priceIncludingVATValue);
      setTotalExcludingVAT(totalExcludingVATValue);
      setTotalIncludingVAT(totalIncludingVATValue);
    } else {
      const priceIncludingVATValue = priceNum;
      const priceExcludingVATValue = priceNum / (1 + rateNum / 100);
      const vatPerItem = priceIncludingVATValue - priceExcludingVATValue;
      const totalIncludingVATValue = priceIncludingVATValue * qtyNum;
      const totalExcludingVATValue = priceExcludingVATValue * qtyNum;

      setPriceIncludingVAT(priceIncludingVATValue);
      setPriceExcludingVAT(priceExcludingVATValue);
      setVatAmount(vatPerItem);
      setTotalIncludingVAT(totalIncludingVATValue);
      setTotalExcludingVAT(totalExcludingVATValue);
    }
  }, [mode, price, quantity, vatRate]);

  useEffect(() => {
    calculateVAT();
  }, [calculateVAT]);

  const handleCopy = () => {
    if (priceExcludingVAT !== null && vatAmount !== null && priceIncludingVAT !== null) {
      const result = `Price (Excl. VAT): $${priceExcludingVAT.toFixed(2)}\nVAT Amount: $${vatAmount.toFixed(2)}\nPrice (Incl. VAT): $${priceIncludingVAT.toFixed(2)}`;
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
      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as VatMode)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {VAT_MODES.map((modeOption) => (
            <option key={modeOption.value} value={modeOption.value}>
              {modeOption.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Price</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="100"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="1"
          min="1"
          step="1"
        />
      </div>

      {/* VAT Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">VAT Rate (%)</label>
        <div className="relative">
          <input
            type="number"
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="20"
            min="0"
            max="100"
            step="1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4" />
          VAT Results
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Price (Excl. VAT):</span>
            <span className="text-foreground">{formatCurrency(priceExcludingVAT)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">VAT Amount:</span>
            <span className="text-foreground">{formatCurrency(vatAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Price (Incl. VAT):</span>
            <span className="text-foreground font-semibold">{formatCurrency(priceIncludingVAT)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-input">
            <span className="text-foreground/60">Total for {quantity} item{parseInt(quantity) > 1 ? 's' : ''} (Incl. VAT):</span>
            <span className="text-foreground font-semibold">{formatCurrency(totalIncludingVAT)}</span>
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