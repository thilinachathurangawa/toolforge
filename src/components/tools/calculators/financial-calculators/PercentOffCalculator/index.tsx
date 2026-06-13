'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Percent } from 'lucide-react';

export function PercentOffCalculator() {
  const [originalPrice, setOriginalPrice] = useState<string>('50');
  const [quantity, setQuantity] = useState<string>('1');
  const [percentOff, setPercentOff] = useState<string>('25');
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [amountSaved, setAmountSaved] = useState<number | null>(null);
  const [amountSavedPerItem, setAmountSavedPerItem] = useState<number | null>(null);
  const [totalOriginalPrice, setTotalOriginalPrice] = useState<number | null>(null);
  const [totalSalePrice, setTotalSalePrice] = useState<number | null>(null);
  const [totalAmountSaved, setTotalAmountSaved] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const quickPercentages = [10, 20, 25, 50, 75];

  const calculatePercentOff = useCallback(() => {
    const priceNum = parseFloat(originalPrice);
    const qtyNum = parseFloat(quantity);
    const percentNum = parseFloat(percentOff);

    if (isNaN(priceNum) || isNaN(qtyNum) || isNaN(percentNum) || 
        priceNum <= 0 || qtyNum <= 0 || percentNum < 0 || percentNum > 100) {
      setSalePrice(null);
      setAmountSaved(null);
      setAmountSavedPerItem(null);
      setTotalOriginalPrice(null);
      setTotalSalePrice(null);
      setTotalAmountSaved(null);
      return;
    }

    const savedPerItem = priceNum * (percentNum / 100);
    const salePriceValue = priceNum - savedPerItem;
    const totalOriginal = priceNum * qtyNum;
    const totalSale = salePriceValue * qtyNum;
    const totalSaved = savedPerItem * qtyNum;

    setSalePrice(salePriceValue);
    setAmountSavedPerItem(savedPerItem);
    setAmountSaved(totalSaved);
    setTotalOriginalPrice(totalOriginal);
    setTotalSalePrice(totalSale);
    setTotalAmountSaved(totalSaved);
  }, [originalPrice, quantity, percentOff]);

  useEffect(() => {
    calculatePercentOff();
  }, [calculatePercentOff]);

  const handleCopy = () => {
    if (salePrice !== null && totalAmountSaved !== null) {
      const result = `Original Price: $${parseFloat(originalPrice).toFixed(2)}\nPercent Off: ${percentOff}%\nSale Price: $${salePrice.toFixed(2)}\nAmount Saved: $${totalAmountSaved.toFixed(2)}`;
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
    setPercentOff(percent.toString());
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
            placeholder="50"
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

      {/* Percent Off */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Percent Off</label>
        <div className="relative">
          <input
            type="number"
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="25"
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

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Percent className="w-4 h-4" />
          Percent Off Results
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Original Price:</span>
            <span className="text-foreground">{formatCurrency(parseFloat(originalPrice) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Percent Off:</span>
            <span className="text-foreground">{percentOff}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Amount Saved:</span>
            <span className="text-green-600 font-semibold">{formatCurrency(amountSavedPerItem)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Sale Price:</span>
            <span className="text-foreground font-semibold">{formatCurrency(salePrice)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-input">
            <span className="text-foreground/60">Total for {quantity} item{parseInt(quantity) > 1 ? 's' : ''}:</span>
            <span className="text-foreground font-semibold">{formatCurrency(totalSalePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Total Amount Saved:</span>
            <span className="text-green-600 font-semibold">{formatCurrency(totalAmountSaved)}</span>
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