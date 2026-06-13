'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, TrendingUp } from 'lucide-react';

export function MarginCalculator() {
  const [costPrice, setCostPrice] = useState<string>('50');
  const [sellingPrice, setSellingPrice] = useState<string>('75');
  const [profitAmount, setProfitAmount] = useState<number | null>(null);
  const [profitMargin, setProfitMargin] = useState<number | null>(null);
  const [markupPercentage, setMarkupPercentage] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateMargin = useCallback(() => {
    const costNum = parseFloat(costPrice);
    const sellingNum = parseFloat(sellingPrice);

    if (isNaN(costNum) || isNaN(sellingNum) || costNum < 0 || sellingNum < 0) {
      setProfitAmount(null);
      setProfitMargin(null);
      setMarkupPercentage(null);
      return;
    }

    const profitValue = sellingNum - costNum;
    
    if (sellingNum === 0) {
      setProfitAmount(profitValue);
      setProfitMargin(0);
      setMarkupPercentage(costNum === 0 ? 0 : (profitValue / costNum) * 100);
      return;
    }

    const marginValue = (profitValue / sellingNum) * 100;
    const markupValue = costNum === 0 ? 0 : (profitValue / costNum) * 100;

    setProfitAmount(profitValue);
    setProfitMargin(marginValue);
    setMarkupPercentage(markupValue);
  }, [costPrice, sellingPrice]);

  useEffect(() => {
    calculateMargin();
  }, [calculateMargin]);

  const handleCopy = () => {
    if (profitAmount !== null && profitMargin !== null && markupPercentage !== null) {
      const result = `Cost Price: $${parseFloat(costPrice).toFixed(2)}\nSelling Price: $${parseFloat(sellingPrice).toFixed(2)}\nProfit: $${profitAmount.toFixed(2)}\nProfit Margin: ${profitMargin.toFixed(2)}%\nMarkup: ${markupPercentage.toFixed(2)}%`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const profitColor = profitAmount !== null ? (profitAmount >= 0 ? 'text-green-600' : 'text-red-600') : 'text-foreground';

  return (
    <div className="w-full space-y-6">
      {/* Cost Price */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Cost Price</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="50"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Selling Price */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Selling Price</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="75"
            min="0"
            step="1"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Margin Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Cost Price:</p>
            <p className="text-foreground">{formatCurrency(parseFloat(costPrice) || 0)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Selling Price:</p>
            <p className="text-foreground">{formatCurrency(parseFloat(sellingPrice) || 0)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Profit:</p>
            <p className={`text-lg font-semibold ${profitColor}`}>{formatCurrency(profitAmount)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Markup:</p>
            <p className="text-foreground">{markupPercentage !== null ? `${markupPercentage.toFixed(2)}%` : '0.00%'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Profit Margin:</p>
            <p className="text-lg font-semibold text-foreground">{profitMargin !== null ? `${profitMargin.toFixed(2)}%` : '0.00%'}</p>
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