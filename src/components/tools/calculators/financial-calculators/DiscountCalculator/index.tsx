'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Tag } from 'lucide-react';

export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState<string>('100');
  const [discountPercentage, setDiscountPercentage] = useState<string>('20');
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [savingsPercentage, setSavingsPercentage] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateDiscount = useCallback(() => {
    const priceNum = parseFloat(originalPrice);
    const discountNum = parseFloat(discountPercentage);

    if (isNaN(priceNum) || isNaN(discountNum) || priceNum <= 0 || discountNum < 0 || discountNum > 100) {
      setFinalPrice(null);
      setDiscountAmount(null);
      setSavingsPercentage(null);
      return;
    }

    const discountValue = priceNum * (discountNum / 100);
    const finalPriceValue = priceNum - discountValue;
    
    setFinalPrice(finalPriceValue);
    setDiscountAmount(discountValue);
    setSavingsPercentage(discountNum);
  }, [originalPrice, discountPercentage]);

  useEffect(() => {
    calculateDiscount();
  }, [calculateDiscount]);

  const handleCopy = () => {
    if (finalPrice !== null && discountAmount !== null) {
      const result = `Original Price: $${parseFloat(originalPrice).toFixed(2)}\nDiscount: $${discountAmount.toFixed(2)} (${savingsPercentage}%)\nFinal Price: $${finalPrice.toFixed(2)}`;
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
      {/* Original Price */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Original Price</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="100"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Discount Percentage */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Discount Percentage</label>
        <div className="relative">
          <input
            type="number"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
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
          <Tag className="w-4 h-4" />
          Discount Results
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Original Price:</span>
            <span className="text-foreground">{formatCurrency(parseFloat(originalPrice) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Discount Amount:</span>
            <span className="text-green-600 font-semibold">{formatCurrency(discountAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Final Price:</span>
            <span className="text-foreground font-semibold">{formatCurrency(finalPrice)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-input">
            <span className="text-foreground/60">You Save:</span>
            <span className="text-green-600 font-semibold">{formatCurrency(discountAmount)} ({savingsPercentage}%)</span>
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