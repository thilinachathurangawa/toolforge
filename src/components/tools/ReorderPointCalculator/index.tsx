'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReorderPointCalculator() {
  const [dailyUsage, setDailyUsage] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [safetyStock, setSafetyStock] = useState('');
  const [currentInventory, setCurrentInventory] = useState('');
  const [result, setResult] = useState<{
    reorderPoint: number | null;
    demandDuringLeadTime: number | null;
    isBelowReorderPoint: boolean;
    daysUntilStockout: number | null;
  }>({ reorderPoint: null, demandDuringLeadTime: null, isBelowReorderPoint: false, daysUntilStockout: null });
  const [copied, setCopied] = useState(false);

  // Reorder Point Formula: (Daily Usage × Lead Time) + Safety Stock
  const calculateReorderPoint = (
    dailyUsage: number,
    leadTime: number,
    safetyStock: number
  ): number => {
    return (dailyUsage * leadTime) + safetyStock;
  };

  // Calculate days until stockout
  const calculateDaysUntilStockout = (
    currentInventory: number,
    dailyUsage: number
  ): number => {
    if (dailyUsage <= 0) return Infinity;
    return Math.floor(currentInventory / dailyUsage);
  };

  // Perform calculation
  useEffect(() => {
    const daily = parseFloat(dailyUsage);
    const lead = parseFloat(leadTime);
    const safety = parseFloat(safetyStock);
    const current = parseFloat(currentInventory);

    if (!isNaN(daily) && !isNaN(lead) && !isNaN(safety)) {
      const demandDuringLeadTime = daily * lead;
      const reorderPoint = calculateReorderPoint(daily, lead, safety);
      
      let isBelowReorderPoint = false;
      let daysUntilStockout = null;

      if (!isNaN(current) && current > 0) {
        isBelowReorderPoint = current < reorderPoint;
        daysUntilStockout = calculateDaysUntilStockout(current, daily);
      }

      setResult({
        reorderPoint,
        demandDuringLeadTime,
        isBelowReorderPoint,
        daysUntilStockout,
      });
    } else {
      setResult({
        reorderPoint: null,
        demandDuringLeadTime: null,
        isBelowReorderPoint: false,
        daysUntilStockout: null,
      });
    }
  }, [dailyUsage, leadTime, safetyStock, currentInventory]);

  const handleCopy = () => {
    if (result.reorderPoint !== null) {
      const text = `Reorder Point: ${result.reorderPoint} units\nDemand during lead time: ${result.demandDuringLeadTime} units\nSafety stock: ${parseFloat(safetyStock)} units`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setDailyUsage('');
    setLeadTime('');
    setSafetyStock('');
    setCurrentInventory('');
    setResult({
      reorderPoint: null,
      demandDuringLeadTime: null,
      isBelowReorderPoint: false,
      daysUntilStockout: null,
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Input Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Average Daily Usage (units/day)</label>
          <input
            type="number"
            value={dailyUsage}
            onChange={(e) => setDailyUsage(e.target.value)}
            placeholder="e.g., 50"
            min="0"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Lead Time (days)</label>
          <input
            type="number"
            value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
            placeholder="e.g., 10"
            min="0"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Safety Stock (units)</label>
          <input
            type="number"
            value={safetyStock}
            onChange={(e) => setSafetyStock(e.target.value)}
            placeholder="e.g., 100"
            min="0"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Current Inventory (optional)</label>
          <input
            type="number"
            value={currentInventory}
            onChange={(e) => setCurrentInventory(e.target.value)}
            placeholder="e.g., 300"
            min="0"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      {/* Results */}
      {result.reorderPoint !== null && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-foreground">Results</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reorder Point:</span>
              <span className="text-lg font-bold text-accent">{result.reorderPoint} units</span>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-medium text-foreground">Formula Breakdown:</p>
              <p className="text-xs text-muted-foreground font-mono">
                ({parseFloat(dailyUsage)} × {parseFloat(leadTime)}) + {parseFloat(safetyStock)} = {result.demandDuringLeadTime} + {parseFloat(safetyStock)} = {result.reorderPoint}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-medium text-foreground">Breakdown:</p>
              <ul className="space-y-1">
                <li className="text-xs text-muted-foreground">• Demand during lead time: {result.demandDuringLeadTime} units</li>
                <li className="text-xs text-muted-foreground">• Safety stock buffer: {parseFloat(safetyStock)} units</li>
                <li className="text-xs text-muted-foreground">• Total reorder point: {result.reorderPoint} units</li>
              </ul>
            </div>

            {result.isBelowReorderPoint && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-500">Order Now!</p>
                  <p className="text-xs text-red-500">
                    Current inventory ({parseFloat(currentInventory)}) is below reorder point ({result.reorderPoint}).
                    {result.daysUntilStockout !== null && result.daysUntilStockout !== Infinity && (
                      <span> Stockout in approximately {result.daysUntilStockout} days.</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {!result.isBelowReorderPoint && currentInventory && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-500">
                  Current inventory ({parseFloat(currentInventory)}) is above reorder point ({result.reorderPoint}). No immediate action needed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={result.reorderPoint === null}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Results'}
        </button>
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          <X size={16} />
          Clear
        </button>
      </div>

      {/* Formula Info */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h3 className="text-sm font-medium text-foreground">About Reorder Point</h3>
        <p className="text-xs text-muted-foreground">
          The reorder point is the inventory level at which you should place a new order to avoid stockouts. 
          It accounts for demand during the lead time plus a safety stock buffer for uncertainty.
        </p>
        <div className="pt-2">
          <p className="text-xs font-medium text-foreground">Formula:</p>
          <p className="text-xs text-muted-foreground font-mono">
            Reorder Point = (Daily Usage × Lead Time) + Safety Stock
          </p>
        </div>
      </div>
    </div>
  );
}
