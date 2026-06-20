'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Percent } from 'lucide-react';

type CalculationType = 'type1' | 'type2' | 'type3';

const CALCULATION_TYPES: { value: CalculationType; label: string; description: string }[] = [
  { value: 'type1', label: 'What is X% of Y?', description: 'Find the part' },
  { value: 'type2', label: 'X is what % of Y?', description: 'Find the percentage' },
  { value: 'type3', label: 'X is Y% of what?', description: 'Find the total' },
];

function PercentageCalculator() {
  const [calculationType, setCalculationType] = useState<CalculationType>('type1');
  const [input1, setInput1] = useState<string>('25');
  const [input2, setInput2] = useState<string>('200');
  const [result, setResult] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    const num1 = parseFloat(input1);
    const num2 = parseFloat(input2);

    if (isNaN(num1) || isNaN(num2)) {
      setResult(null);
      return;
    }

    let calculatedResult: number;

    switch (calculationType) {
      case 'type1':
        // What is X% of Y? = (X / 100) × Y
        calculatedResult = (num1 / 100) * num2;
        break;
      case 'type2':
        // X is what % of Y? = (X / Y) × 100
        calculatedResult = num2 !== 0 ? (num1 / num2) * 100 : 0;
        break;
      case 'type3':
        // X is Y% of what? = X / (Y / 100)
        calculatedResult = num1 !== 0 ? num2 / (num1 / 100) : 0;
        break;
      default:
        calculatedResult = 0;
    }

    setResult(calculatedResult);
  }, [calculationType, input1, input2]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      const typeInfo = CALCULATION_TYPES.find(t => t.value === calculationType);
      const resultText = `${typeInfo?.label}\nResult: ${result.toFixed(2)}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFormula = () => {
    const num1 = parseFloat(input1) || 0;
    const num2 = parseFloat(input2) || 0;

    switch (calculationType) {
      case 'type1':
        return `(${num1} / 100) × ${num2} = ${result?.toFixed(2) || 0}`;
      case 'type2':
        return `(${num1} / ${num2}) × 100 = ${result?.toFixed(2) || 0}%`;
      case 'type3':
        return `${num2} / (${num1} / 100) = ${result?.toFixed(2) || 0}`;
      default:
        return '';
    }
  };

  const getSteps = () => {
    const num1 = parseFloat(input1) || 0;
    const num2 = parseFloat(input2) || 0;

    switch (calculationType) {
      case 'type1':
        return [
          `Convert percentage to decimal: ${num1 / 100}`,
          `Multiply by total: ${(num1 / 100).toFixed(4)} × ${num2}`,
          `Result: ${result?.toFixed(2) || 0}`,
        ];
      case 'type2':
        return [
          `Divide part by total: ${num1} / ${num2}`,
          `Multiply by 100: ${(num1 / num2).toFixed(4)} × 100`,
          `Result: ${result?.toFixed(2) || 0}%`,
        ];
      case 'type3':
        return [
          `Convert percentage to decimal: ${num1 / 100}`,
          `Divide part by decimal: ${num2} / ${(num1 / 100).toFixed(4)}`,
          `Result: ${result?.toFixed(2) || 0}`,
        ];
      default:
        return [];
    }
  };

  const getInputLabels = () => {
    switch (calculationType) {
      case 'type1':
        return { input1: 'Percentage (%)', input2: 'Of (Total)' };
      case 'type2':
        return { input1: 'Part (X)', input2: 'Total (Y)' };
      case 'type3':
        return { input1: 'Part (X)', input2: 'Percentage (Y%)' };
      default:
        return { input1: 'Input 1', input2: 'Input 2' };
    }
  };

  const labels = getInputLabels();

  return (
    <div className="w-full space-y-6">
      {/* Calculation Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Calculation Type</label>
        <div className="grid grid-cols-1 gap-2">
          {CALCULATION_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setCalculationType(type.value)}
              className={`text-left px-4 py-3 text-sm rounded-md border transition-colors ${
                calculationType === type.value
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-background border-input hover:bg-accent/50'
              }`}
            >
              <div className="font-medium">{type.label}</div>
              <div className="text-xs text-foreground/60">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{labels.input1}</label>
          <input
            type="number"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="25"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{labels.input2}</label>
          <input
            type="number"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="200"
            step="0.01"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Percent className="w-4 h-4" />
          Result
        </h3>

        <div className="text-center py-4">
          <p className="text-4xl font-bold text-foreground">
            {result !== null ? result.toFixed(2) : '0.00'}
            {calculationType === 'type2' && '%'}
          </p>
        </div>

        {/* Formula */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Formula:</p>
          <p className="text-sm font-mono text-foreground">{getFormula()}</p>
        </div>

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

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy Result'}
      </button>
    </div>
  );
}

export default PercentageCalculator;
