'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalculateFrom = 'h_concentration' | 'oh_concentration' | 'ph' | 'poh';

export function PHCalculator() {
  const [calculateFrom, setCalculateFrom] = useState<CalculateFrom>('h_concentration');
  const [hConcentration, setHConcentration] = useState<string>('1e-7');
  const [ohConcentration, setOHConcentration] = useState<string>('1e-7');
  const [ph, setPh] = useState<string>('7');
  const [poh, setPoh] = useState<string>('7');
  const [phResult, setPhResult] = useState<number | null>(null);
  const [pohResult, setPohResult] = useState<number | null>(null);
  const [hConcResult, setHConcResult] = useState<number | null>(null);
  const [ohConcResult, setOhConcResult] = useState<number | null>(null);
  const [classification, setClassification] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const parseScientificNotation = useCallback((value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.includes('e') || cleaned.includes('E')) {
      return parseFloat(cleaned);
    }
    return parseFloat(cleaned);
  }, []);

  const formatScientificNotation = useCallback((value: number): string => {
    if (value === 0) return '0';
    if (value >= 0.01 && value <= 100) {
      return value.toFixed(4);
    }
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exponent);
    return `${mantissa.toFixed(2)} × 10${exponent >= 0 ? '+' : ''}${exponent}`;
  }, []);

  const classifyPH = useCallback((phValue: number): string => {
    if (phValue < 0) return 'Invalid (pH cannot be negative)';
    if (phValue < 3) return 'Strongly Acidic';
    if (phValue < 6) return 'Weakly Acidic';
    if (phValue < 7) return 'Slightly Acidic';
    if (phValue === 7) return 'Neutral';
    if (phValue < 8) return 'Slightly Basic';
    if (phValue < 11) return 'Weakly Basic';
    if (phValue < 14) return 'Strongly Basic';
    return 'Invalid (pH cannot exceed 14)';
  }, []);

  const calculate = useCallback(() => {
    const hConcNum = parseScientificNotation(hConcentration);
    const ohConcNum = parseScientificNotation(ohConcentration);
    const phNum = parseFloat(ph);
    const pohNum = parseFloat(poh);

    if (calculateFrom === 'h_concentration') {
      if (isNaN(hConcNum) || hConcNum <= 0) {
        setPhResult(null);
        setPohResult(null);
        setHConcResult(null);
        setOhConcResult(null);
        setClassification('');
        return;
      }
      const phValue = -Math.log10(hConcNum);
      const pohValue = 14 - phValue;
      const ohConcValue = 1.0e-14 / hConcNum;
      setPhResult(phValue);
      setPohResult(pohValue);
      setHConcResult(hConcNum);
      setOhConcResult(ohConcValue);
      setClassification(classifyPH(phValue));
    } else if (calculateFrom === 'oh_concentration') {
      if (isNaN(ohConcNum) || ohConcNum <= 0) {
        setPhResult(null);
        setPohResult(null);
        setHConcResult(null);
        setOhConcResult(null);
        setClassification('');
        return;
      }
      const pohValue = -Math.log10(ohConcNum);
      const phValue = 14 - pohValue;
      const hConcValue = 1.0e-14 / ohConcNum;
      setPhResult(phValue);
      setPohResult(pohValue);
      setHConcResult(hConcValue);
      setOhConcResult(ohConcNum);
      setClassification(classifyPH(phValue));
    } else if (calculateFrom === 'ph') {
      if (isNaN(phNum) || phNum < 0 || phNum > 14) {
        setPhResult(null);
        setPohResult(null);
        setHConcResult(null);
        setOhConcResult(null);
        setClassification('');
        return;
      }
      const pohValue = 14 - phNum;
      const hConcValue = Math.pow(10, -phNum);
      const ohConcValue = Math.pow(10, -pohValue);
      setPhResult(phNum);
      setPohResult(pohValue);
      setHConcResult(hConcValue);
      setOhConcResult(ohConcValue);
      setClassification(classifyPH(phNum));
    } else if (calculateFrom === 'poh') {
      if (isNaN(pohNum) || pohNum < 0 || pohNum > 14) {
        setPhResult(null);
        setPohResult(null);
        setHConcResult(null);
        setOhConcResult(null);
        setClassification('');
        return;
      }
      const phValue = 14 - pohNum;
      const hConcValue = Math.pow(10, -phValue);
      const ohConcValue = Math.pow(10, -pohNum);
      setPhResult(phValue);
      setPohResult(pohNum);
      setHConcResult(hConcValue);
      setOhConcResult(ohConcValue);
      setClassification(classifyPH(phValue));
    }
  }, [calculateFrom, hConcentration, ohConcentration, ph, poh, parseScientificNotation, classifyPH]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (phResult !== null && pohResult !== null && hConcResult !== null && ohConcResult !== null) {
      const resultText = `pH: ${phResult.toFixed(2)}\npOH: ${pohResult.toFixed(2)}\n[H⁺]: ${formatScientificNotation(hConcResult)} M\n[OH⁻]: ${formatScientificNotation(ohConcResult)} M\nClassification: ${classification}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
    if (value == null) return '0.00';
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <div className="w-full space-y-6">
      {/* Calculate From */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Calculate From</label>
        <select
          value={calculateFrom}
          onChange={(e) => setCalculateFrom(e.target.value as CalculateFrom)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          <option value="h_concentration">H⁺ Concentration</option>
          <option value="oh_concentration">OH⁻ Concentration</option>
          <option value="ph">pH</option>
          <option value="poh">pOH</option>
        </select>
      </div>

      {/* H+ Concentration */}
      {calculateFrom !== 'h_concentration' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">H⁺ Concentration (M)</label>
          <input
            type="text"
            value={hConcentration}
            onChange={(e) => setHConcentration(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="1e-7"
          />
          <p className="text-xs text-foreground/50">Use scientific notation (e.g., 1e-7)</p>
        </div>
      )}

      {/* OH- Concentration */}
      {calculateFrom !== 'oh_concentration' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">OH⁻ Concentration (M)</label>
          <input
            type="text"
            value={ohConcentration}
            onChange={(e) => setOHConcentration(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="1e-7"
          />
          <p className="text-xs text-foreground/50">Use scientific notation (e.g., 1e-7)</p>
        </div>
      )}

      {/* pH */}
      {calculateFrom !== 'ph' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">pH</label>
          <input
            type="number"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="7"
            min="0"
            max="14"
            step="0.01"
          />
        </div>
      )}

      {/* pOH */}
      {calculateFrom !== 'poh' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">pOH</label>
          <input
            type="number"
            value={poh}
            onChange={(e) => setPoh(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="7"
            min="0"
            max="14"
            step="0.01"
          />
        </div>
      )}

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">pH</p>
            <p className="text-lg font-semibold text-foreground">{phResult !== null ? formatNumber(phResult) : '0.00'}</p>
          </div>
          <div>
            <p className="text-foreground/60">pOH</p>
            <p className="text-lg font-semibold text-foreground">{pohResult !== null ? formatNumber(pohResult) : '0.00'}</p>
          </div>
          <div>
            <p className="text-foreground/60">[H⁺] (M)</p>
            <p className="text-lg font-semibold text-foreground">{hConcResult !== null ? formatScientificNotation(hConcResult) : '0'}</p>
          </div>
          <div>
            <p className="text-foreground/60">[OH⁻] (M)</p>
            <p className="text-lg font-semibold text-foreground">{ohConcResult !== null ? formatScientificNotation(ohConcResult) : '0'}</p>
          </div>
        </div>

        {classification && (
          <div className="border-t border-input pt-3">
            <p className="text-foreground/60">Classification</p>
            <p className="text-lg font-semibold text-foreground">{classification}</p>
          </div>
        )}
      </div>

      {/* Action Button */}
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
