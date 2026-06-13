'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Receipt } from 'lucide-react';

export function SalesTaxCalculator() {
  const [priceBeforeTax, setPriceBeforeTax] = useState<string>('100');
  const [quantity, setQuantity] = useState<string>('1');
  const [taxRate, setTaxRate] = useState<string>('8.25');
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [taxPerItem, setTaxPerItem] = useState<number | null>(null);
  const [priceBeforeTaxTotal, setPriceBeforeTaxTotal] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateSalesTax = useCallback(() => {
    const priceNum = parseFloat(priceBeforeTax);
    const qtyNum = parseFloat(quantity);
    const rateNum = parseFloat(taxRate);

    if (isNaN(priceNum) || isNaN(qtyNum) || isNaN(rateNum) || 
        priceNum <= 0 || qtyNum <= 0 || rateNum < 0) {
      setTaxAmount(null);
      setTotalPrice(null);
      setTaxPerItem(null);
      setPriceBeforeTaxTotal(null);
      return;
    }

    const taxPerItemValue = priceNum * (rateNum / 100);
    const taxTotal = taxPerItemValue * qtyNum;
    const priceBeforeTaxTotalValue = priceNum * qtyNum;
    const totalPriceValue = priceBeforeTaxTotalValue + taxTotal;

    setTaxPerItem(taxPerItemValue);
    setTaxAmount(taxTotal);
    setPriceBeforeTaxTotal(priceBeforeTaxTotalValue);
    setTotalPrice(totalPriceValue);
  }, [priceBeforeTax, quantity, taxRate]);

  useEffect(() => {
    calculateSalesTax();
  }, [calculateSalesTax]);

  const handleCopy = () => {
    if (totalPrice !== null && taxAmount !== null) {
      const result = `Price Before Tax: $${parseFloat(priceBeforeTax).toFixed(2)}\nTax Amount: $${taxAmount.toFixed(2)}\nTotal Price: $${totalPrice.toFixed(2)}`;
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
      {/* Price Before Tax */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Price Before Tax</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={priceBeforeTax}
            onChange={(e) => setPriceBeforeTax(e.target.value)}
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

      {/* Tax Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tax Rate (%)</label>
        <div className="relative">
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="8.25"
            min="0"
            step="0.25"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">%</span>
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Sales Tax Results
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Price Before Tax:</span>
            <span className="text-foreground">{formatCurrency(parseFloat(priceBeforeTax) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Tax Amount:</span>
            <span className="text-foreground">{formatCurrency(taxPerItem)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Total Price:</span>
            <span className="text-foreground font-semibold">{formatCurrency(parseFloat(priceBeforeTax) + (taxPerItem || 0))}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-input">
            <span className="text-foreground/60">Total for {quantity} item{parseInt(quantity) > 1 ? 's' : ''}:</span>
            <span className="text-foreground font-semibold">{formatCurrency(totalPrice)}</span>
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