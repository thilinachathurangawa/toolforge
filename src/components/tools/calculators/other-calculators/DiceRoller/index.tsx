'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Dice1, RefreshCw } from 'lucide-react';

interface DiceSelection {
  type: 'D4' | 'D6' | 'D8' | 'D10' | 'D12' | 'D20' | 'custom';
  sides: number;
  count: number;
}

export function DiceRoller() {
  const [selectedDice, setSelectedDice] = useState<DiceSelection[]>([
    { type: 'D6', sides: 6, count: 2 },
  ]);
  const [customSides, setCustomSides] = useState<string>('100');
  const [customCount, setCustomCount] = useState<string>('5');
  const [results, setResults] = useState<{
    rolls: { type: string; sides: number; rolls: number[]; sum: number }[];
    totalSum: number;
  } | null>(null);
  const [history, setHistory] = useState<{ timestamp: Date; results: { type: string; rolls: number[]; sum: number }[] }[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [copied, setCopied] = useState(false);

  const rollDie = useCallback((sides: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (array[0] % sides) + 1;
  }, []);

  const rollDice = useCallback((sides: number, count: number): number[] => {
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(rollDie(sides));
    }
    return rolls;
  }, [rollDie]);

  const handleRoll = useCallback(() => {
    setIsRolling(true);
    
    setTimeout(() => {
      const rollResults = selectedDice.map(dice => {
        const sides = dice.type === 'custom' ? parseInt(customSides) || 100 : dice.sides;
        const count = dice.type === 'custom' ? parseInt(customCount) || 5 : dice.count;
        const rolls = rollDice(sides, count);
        const sum = rolls.reduce((acc, val) => acc + val, 0);
        return {
          type: dice.type === 'custom' ? `D${sides}` : dice.type,
          sides,
          rolls,
          sum
        };
      });

      const totalSum = rollResults.reduce((acc, result) => acc + result.sum, 0);

      setResults({ rolls: rollResults, totalSum });
      setHistory([{ timestamp: new Date(), results: rollResults }, ...history.slice(0, 9)]);
      setIsRolling(false);
    }, 500);
  }, [selectedDice, customSides, customCount, rollDice, history]);

  const addDice = (type: 'D4' | 'D6' | 'D8' | 'D10' | 'D12' | 'D20') => {
    const existing = selectedDice.find(d => d.type === type);
    if (existing) {
      setSelectedDice(selectedDice.map(d => 
        d.type === type ? { ...d, count: d.count + 1 } : d
      ));
    } else {
      const sidesMap = { D4: 4, D6: 6, D8: 8, D10: 10, D12: 12, D20: 20 };
      setSelectedDice([...selectedDice, { type, sides: sidesMap[type], count: 1 }]);
    }
  };

  const removeDice = (type: string) => {
    setSelectedDice(selectedDice.filter(d => d.type !== type));
  };

  const updateDiceCount = (type: string, count: number) => {
    if (count <= 0) {
      removeDice(type);
    } else {
      setSelectedDice(selectedDice.map(d => 
        d.type === type ? { ...d, count } : d
      ));
    }
  };

  const handleCopy = () => {
    if (results) {
      const result = results.rolls.map(r => `${r.type}: ${r.rolls.join(', ')} (Sum: ${r.sum})`).join('\n');
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDiceIcon = (type: string) => {
    return <Dice1 className="w-4 h-4" />;
  };

  return (
    <div className="w-full space-y-6">
      {/* Standard Dice */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Standard Dice</h3>
        <div className="flex flex-wrap gap-2">
          {(['D4', 'D6', 'D8', 'D10', 'D12', 'D20'] as const).map((type) => (
            <button
              key={type}
              onClick={() => addDice(type)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Dice */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Custom Dice</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-foreground/60">Sides</label>
            <input
              type="number"
              value={customSides}
              onChange={(e) => setCustomSides(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="100"
              min="2"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-foreground/60">Count</label>
            <input
              type="number"
              value={customCount}
              onChange={(e) => setCustomCount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="5"
              min="1"
            />
          </div>
        </div>
        <button
          onClick={() => {
            const sides = parseInt(customSides) || 100;
            const count = parseInt(customCount) || 5;
            setSelectedDice([...selectedDice.filter(d => d.type !== 'custom'), { type: 'custom', sides, count }]);
          }}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Add Custom Dice
        </button>
      </div>

      {/* Selected Dice */}
      {selectedDice.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Selected Dice</h3>
          <div className="space-y-2">
            {selectedDice.map((dice) => (
              <div key={dice.type} className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
                <span className="text-sm font-medium">{dice.type === 'custom' ? `D${dice.sides}` : dice.type}</span>
                <span className="text-xs text-foreground/60">x</span>
                <input
                  type="number"
                  value={dice.count}
                  onChange={(e) => updateDiceCount(dice.type, parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  min="1"
                />
                <button
                  onClick={() => removeDice(dice.type)}
                  className="ml-auto text-foreground/50 hover:text-destructive transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roll Button */}
      <button
        onClick={handleRoll}
        disabled={isRolling || selectedDice.length === 0}
        className="w-full px-4 py-3 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRolling ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Rolling...
          </>
        ) : (
          <>
            <Dice1 className="w-4 h-4" />
            Roll Dice
          </>
        )}
      </button>

      {/* Results */}
      {results && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Results</h3>
          
          <div className="space-y-2">
            {results.rolls.map((roll, index) => (
              <div key={index} className="bg-background rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{roll.type}</span>
                  <span className="text-sm text-foreground/60">Sum: {roll.sum}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {roll.rolls.map((val, i) => (
                    <span key={i} className="inline-flex items-center justify-center w-8 h-8 text-sm bg-accent text-accent-foreground rounded-md">
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-foreground/10 pt-3">
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Sum:</span>
              <span className="text-foreground font-semibold">{results.totalSum}</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full px-3 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Results'}
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">History</h3>
          <div className="space-y-1 text-xs">
            {history.map((entry, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-foreground/60">
                  {entry.timestamp.toLocaleTimeString()}:
                </span>
                <span className="text-foreground font-mono">
                  {entry.results.map(r => `${r.type}: ${r.sum}`).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
