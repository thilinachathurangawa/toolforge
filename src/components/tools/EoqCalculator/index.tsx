'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, X } from 'lucide-react';

export function EoqCalculator() {
  const [annualDemand, setAnnualDemand] = useState('1000');
  const [orderingCost, setOrderingCost] = useState('50');
  const [holdingCost, setHoldingCost] = useState('2');
  const [result, setResult] = useState<{
    eoq: number;
    ordersPerYear: number;
    totalOrderingCost: number;
    totalHoldingCost: number;
    totalAnnualCost: number;
    orderingPct: number;
    holdingPct: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const D = parseFloat(annualDemand);
    const S = parseFloat(orderingCost);
    const H = parseFloat(holdingCost);

    if (!isNaN(D) && !isNaN(S) && !isNaN(H) && D > 0 && S > 0 && H > 0) {
      const eoqExact = Math.sqrt((2 * D * S) / H);
      const eoq = Math.round(eoqExact);
      const ordersPerYear = D / eoqExact;
      const totalOrderingCost = ordersPerYear * S;
      const totalHoldingCost = (eoqExact / 2) * H;
      const totalAnnualCost = totalOrderingCost + totalHoldingCost;
      const orderingPct = (totalOrderingCost / totalAnnualCost) * 100;
      const holdingPct = (totalHoldingCost / totalAnnualCost) * 100;

      setResult({ eoq, ordersPerYear, totalOrderingCost, totalHoldingCost, totalAnnualCost, orderingPct, holdingPct });
    } else {
      setResult(null);
    }
  }, [annualDemand, orderingCost, holdingCost]);

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `EOQ: ${result.eoq} units`,
      `Orders per year: ${result.ordersPerYear.toFixed(2)}`,
      `Total ordering cost: $${result.totalOrderingCost.toFixed(2)}`,
      `Total holding cost: $${result.totalHoldingCost.toFixed(2)}`,
      `Total annual cost: $${result.totalAnnualCost.toFixed(2)}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setAnnualDemand('');
    setOrderingCost('');
    setHoldingCost('');
    setResult(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Annual Demand (units/year)</label>
          <input
            type="number"
            value={annualDemand}
            onChange={(e) => setAnnualDemand(e.target.value)}
            placeholder="e.g., 1000"
            min="0"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Ordering Cost per Order ($)</label>
          <input
            type="number"
            value={orderingCost}
            onChange={(e) => setOrderingCost(e.target.value)}
            placeholder="e.g., 50"
            min="0"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Holding Cost per Unit/Year ($)</label>
          <input
            type="number"
            value={holdingCost}
            onChange={(e) => setHoldingCost(e.target.value)}
            placeholder="e.g., 2"
            min="0"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Economic Order Quantity</span>
            <span className="text-2xl font-bold text-accent">{result.eoq} units</span>
          </div>

          {/* Formula breakdown */}
          <div className="pt-2 border-t border-border space-y-1">
            <p className="text-xs font-medium text-foreground">Formula Breakdown:</p>
            <p className="text-xs text-muted-foreground font-mono">EOQ = √((2 × {annualDemand} × {orderingCost}) / {holdingCost})</p>
            <p className="text-xs text-muted-foreground font-mono">
              = √({(2 * parseFloat(annualDemand) * parseFloat(orderingCost)).toLocaleString()} / {holdingCost})
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              = √{((2 * parseFloat(annualDemand) * parseFloat(orderingCost)) / parseFloat(holdingCost)).toFixed(2)} ≈ {result.eoq} units
            </p>
          </div>

          {/* Metrics */}
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs font-medium text-foreground">Additional Metrics:</p>
            <ul className="space-y-1">
              <li className="flex justify-between text-xs">
                <span className="text-muted-foreground">Orders per year:</span>
                <span className="font-medium">{result.ordersPerYear.toFixed(2)}</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total ordering cost:</span>
                <span className="font-medium">${result.totalOrderingCost.toFixed(2)}</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total holding cost:</span>
                <span className="font-medium">${result.totalHoldingCost.toFixed(2)}</span>
              </li>
              <li className="flex justify-between text-xs border-t border-border pt-1 mt-1">
                <span className="text-muted-foreground font-medium">Total annual cost:</span>
                <span className="font-bold text-accent">${result.totalAnnualCost.toFixed(2)}</span>
              </li>
            </ul>
          </div>

          {/* Cost breakdown bar */}
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs font-medium text-foreground">Cost Breakdown:</p>
            <div className="w-full h-4 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${result.orderingPct}%` }}
              />
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${result.holdingPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Ordering: {result.orderingPct.toFixed(0)}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Holding: {result.holdingPct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={!result}
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

      {/* Info box */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h3 className="text-sm font-medium text-foreground">About EOQ</h3>
        <p className="text-xs text-muted-foreground">
          Economic Order Quantity (EOQ) is the order size that minimizes total inventory costs. At EOQ, ordering cost equals
          holding cost — the two curves cross at the lowest point of total cost. Order more than EOQ and holding costs dominate;
          order less and ordering costs dominate.
        </p>
        <p className="text-xs font-mono text-muted-foreground pt-1">
          EOQ = √(2DS / H) &nbsp; where D = annual demand, S = ordering cost, H = holding cost
        </p>
      </div>
    </div>
  );
}
