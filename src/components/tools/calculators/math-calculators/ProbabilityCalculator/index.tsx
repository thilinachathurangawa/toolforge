'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Dice3 } from 'lucide-react';

type CalculationType = 'single' | 'intersection' | 'union' | 'conditional';

const CALCULATION_TYPES: { value: CalculationType; label: string; symbol: string }[] = [
  { value: 'single', label: 'P(A)', symbol: 'P(A)' },
  { value: 'intersection', label: 'P(A∩B)', symbol: 'P(A∩B)' },
  { value: 'union', label: 'P(A∪B)', symbol: 'P(A∪B)' },
  { value: 'conditional', label: 'P(A|B)', symbol: 'P(A|B)' },
];

function ProbabilityCalculator() {
  const [calculationType, setCalculationType] = useState<CalculationType>('single');
  const [totalOutcomes, setTotalOutcomes] = useState<string>('52');
  const [favorableA, setFavorableA] = useState<string>('13');
  const [favorableB, setFavorableB] = useState<string>('4');
  const [probability, setProbability] = useState<number | null>(null);
  const [fraction, setFraction] = useState<string>('');
  const [percentage, setPercentage] = useState<number | null>(null);
  const [oddsInFavor, setOddsInFavor] = useState<string>('');
  const [oddsAgainst, setOddsAgainst] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // GCD function
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  // Simplify fraction
  const simplifyFraction = (numerator: number, denominator: number): string => {
    const divisor = gcd(numerator, denominator);
    const simplifiedNum = numerator / divisor;
    const simplifiedDen = denominator / divisor;
    return `${simplifiedNum}/${simplifiedDen}`;
  };

  // Calculate odds
  const calculateOdds = (favorable: number, total: number): { inFavor: string; against: string } => {
    const unfavorable = total - favorable;
    const divisor = gcd(favorable, unfavorable);
    return {
      inFavor: `${favorable / divisor}:${unfavorable / divisor}`,
      against: `${unfavorable / divisor}:${favorable / divisor}`
    };
  };

  const calculate = useCallback(() => {
    const total = parseInt(totalOutcomes);
    const favA = parseInt(favorableA);
    const favB = parseInt(favorableB);

    if (isNaN(total) || total <= 0 || isNaN(favA) || favA < 0) {
      setProbability(null);
      setFraction('');
      setPercentage(null);
      setOddsInFavor('');
      setOddsAgainst('');
      return;
    }

    let prob: number;
    let frac: string;

    switch (calculationType) {
      case 'single':
        prob = favA / total;
        frac = simplifyFraction(favA, total);
        break;
      case 'intersection':
        if (isNaN(favB) || favB < 0) {
          setProbability(null);
          setFraction('');
          setPercentage(null);
          return;
        }
        prob = (favA / total) * (favB / total);
        frac = simplifyFraction(favA * favB, total * total);
        break;
      case 'union':
        if (isNaN(favB) || favB < 0) {
          setProbability(null);
          setFraction('');
          setPercentage(null);
          return;
        }
        const pA = favA / total;
        const pB = favB / total;
        const pIntersection = pA * pB;
        prob = pA + pB - pIntersection;
        frac = simplifyFraction(favA * total + favB * total - favA * favB, total * total);
        break;
      case 'conditional':
        if (isNaN(favB) || favB <= 0) {
          setProbability(null);
          setFraction('');
          setPercentage(null);
          return;
        }
        const pIntersect = (favA / total) * (favB / total);
        prob = pIntersect / (favB / total);
        frac = simplifyFraction(favA, total);
        break;
      default:
        prob = 0;
        frac = '0/1';
    }

    setProbability(prob);
    setFraction(frac);
    setPercentage(prob * 100);

    if (calculationType === 'single') {
      const odds = calculateOdds(favA, total);
      setOddsInFavor(odds.inFavor);
      setOddsAgainst(odds.against);
    } else {
      setOddsInFavor('—');
      setOddsAgainst('—');
    }
  }, [calculationType, totalOutcomes, favorableA, favorableB]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (probability !== null) {
      const typeSymbol = CALCULATION_TYPES.find(t => t.value === calculationType)?.symbol || 'P';
      const resultText = `${typeSymbol} = ${fraction} = ${probability.toFixed(4)} = ${percentage?.toFixed(2)}%\n\nOdds in Favor: ${oddsInFavor}\nOdds Against: ${oddsAgainst}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setTotalOutcomes('');
    setFavorableA('');
    setFavorableB('');
    setProbability(null);
    setFraction('');
    setPercentage(null);
    setOddsInFavor('');
    setOddsAgainst('');
  };

  const getSteps = () => {
    const total = parseInt(totalOutcomes) || 0;
    const favA = parseInt(favorableA) || 0;
    const favB = parseInt(favorableB) || 0;

    const steps: string[] = [
      `Total outcomes: ${total}`,
      `Favorable outcomes (A): ${favA}`,
    ];

    if (calculationType !== 'single') {
      steps.push(`Favorable outcomes (B): ${favB}`);
    }

    switch (calculationType) {
      case 'single':
        steps.push(`P(A) = ${favA}/${total}`);
        steps.push(`Simplify: ${fraction}`);
        steps.push(`Decimal: ${probability?.toFixed(4) || 0}`);
        steps.push(`Percentage: ${percentage?.toFixed(2) || 0}%`);
        break;
      case 'intersection':
        steps.push(`P(A) = ${favA}/${total} = ${(favA / total).toFixed(4)}`);
        steps.push(`P(B) = ${favB}/${total} = ${(favB / total).toFixed(4)}`);
        steps.push(`P(A∩B) = P(A) × P(B) = ${(favA / total * favB / total).toFixed(4)}`);
        break;
      case 'union':
        steps.push(`P(A) = ${favA}/${total} = ${(favA / total).toFixed(4)}`);
        steps.push(`P(B) = ${favB}/${total} = ${(favB / total).toFixed(4)}`);
        steps.push(`P(A∩B) = P(A) × P(B) = ${(favA / total * favB / total).toFixed(4)}`);
        steps.push(`P(A∪B) = P(A) + P(B) - P(A∩B) = ${probability?.toFixed(4) || 0}`);
        break;
      case 'conditional':
        steps.push(`P(A∩B) = P(A) × P(B) = ${(favA / total * favB / total).toFixed(4)}`);
        steps.push(`P(B) = ${favB}/${total} = ${(favB / total).toFixed(4)}`);
        steps.push(`P(A|B) = P(A∩B) / P(B) = ${probability?.toFixed(4) || 0}`);
        break;
    }

    return steps;
  };

  return (
    <div className="w-full space-y-6">
      {/* Calculation Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Calculation Type</label>
        <div className="grid grid-cols-4 gap-2">
          {CALCULATION_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setCalculationType(type.value)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                calculationType === type.value
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-background border-input hover:bg-accent/50'
              }`}
              title={type.label}
            >
              {type.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Total Outcomes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Total Outcomes</label>
        <input
          type="number"
          value={totalOutcomes}
          onChange={(e) => setTotalOutcomes(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="52"
          min="1"
          step="1"
        />
      </div>

      {/* Favorable A */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Favorable Outcomes (A)</label>
        <input
          type="number"
          value={favorableA}
          onChange={(e) => setFavorableA(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="13"
          min="0"
          step="1"
        />
      </div>

      {/* Favorable B */}
      {calculationType !== 'single' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Favorable Outcomes (B)</label>
          <input
            type="number"
            value={favorableB}
            onChange={(e) => setFavorableB(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="4"
            min="0"
            step="1"
          />
        </div>
      )}

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Dice3 className="w-4 h-4" />
          Results
        </h3>

        <div className="text-center py-4">
          <p className="text-3xl font-bold text-foreground">
            {CALCULATION_TYPES.find(t => t.value === calculationType)?.symbol} = {fraction} = {probability !== null ? probability.toFixed(4) : '—'} = {percentage !== null ? `${percentage.toFixed(2)}%` : '—'}
          </p>
        </div>

        {/* Odds */}
        {calculationType === 'single' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground/60">Odds in Favor</p>
              <p className="text-lg font-semibold text-foreground">{oddsInFavor}</p>
            </div>
            <div>
              <p className="text-foreground/60">Odds Against</p>
              <p className="text-lg font-semibold text-foreground">{oddsAgainst}</p>
            </div>
          </div>
        )}

        {/* Step-by-step */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-2">Step-by-step:</p>
          <ol className="space-y-1 text-sm text-foreground">
            {getSteps().map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-foreground/60">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default ProbabilityCalculator;
