'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = '4-band' | '5-band' | 'smd';

interface ColorCode {
  name: string;
  digit?: number;
  multiplier?: number;
  tolerance?: number;
  color: string;
}

const COLOR_CODES: ColorCode[] = [
  { name: 'Black', digit: 0, multiplier: 1, color: '#000000' },
  { name: 'Brown', digit: 1, multiplier: 10, tolerance: 1, color: '#8B4513' },
  { name: 'Red', digit: 2, multiplier: 100, tolerance: 2, color: '#FF0000' },
  { name: 'Orange', digit: 3, multiplier: 1000, color: '#FFA500' },
  { name: 'Yellow', digit: 4, multiplier: 10000, color: '#FFFF00' },
  { name: 'Green', digit: 5, multiplier: 100000, tolerance: 0.5, color: '#008000' },
  { name: 'Blue', digit: 6, multiplier: 1000000, tolerance: 0.25, color: '#0000FF' },
  { name: 'Violet', digit: 7, multiplier: 10000000, tolerance: 0.1, color: '#EE82EE' },
  { name: 'Grey', digit: 8, tolerance: 0.05, color: '#808080' },
  { name: 'White', digit: 9, color: '#FFFFFF' },
  { name: 'Gold', multiplier: 0.1, tolerance: 5, color: '#FFD700' },
  { name: 'Silver', multiplier: 0.01, tolerance: 10, color: '#C0C0C0' },
];

const TOLERANCE_COLORS: ColorCode[] = COLOR_CODES.filter(c => c.tolerance !== undefined);

export function ResistorColorCodeCalculator() {
  const [mode, setMode] = useState<Mode>('4-band');
  const [band1, setBand1] = useState<string>('Brown');
  const [band2, setBand2] = useState<string>('Black');
  const [band3, setBand3] = useState<string>('Red');
  const [band4, setBand4] = useState<string>('Gold');
  const [band5, setBand5] = useState<string>('Gold');
  const [smdCode, setSmdCode] = useState<string>('');
  const [resistance, setResistance] = useState<number | null>(null);
  const [tolerance, setTolerance] = useState<number | null>(null);
  const [minResistance, setMinResistance] = useState<number | null>(null);
  const [maxResistance, setMaxResistance] = useState<number | null>(null);
  const [formattedResistance, setFormattedResistance] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const formatResistance = useCallback((ohms: number): string => {
    if (ohms >= 1000000) {
      return `${(ohms / 1000000).toFixed(2)} MΩ`;
    } else if (ohms >= 1000) {
      return `${(ohms / 1000).toFixed(2)} kΩ`;
    } else {
      return `${ohms.toFixed(2)} Ω`;
    }
  }, []);

  const calculate4BandResistance = useCallback((): { resistance: number; tolerance: number } => {
    const digit1 = COLOR_CODES.find(c => c.name === band1)?.digit ?? 0;
    const digit2 = COLOR_CODES.find(c => c.name === band2)?.digit ?? 0;
    const multiplier = COLOR_CODES.find(c => c.name === band3)?.multiplier ?? 1;
    const toleranceValue = COLOR_CODES.find(c => c.name === band4)?.tolerance ?? 20;
    
    const resistanceValue = (digit1 * 10 + digit2) * multiplier;
    
    return { resistance: resistanceValue, tolerance: toleranceValue };
  }, [band1, band2, band3, band4]);

  const calculate5BandResistance = useCallback((): { resistance: number; tolerance: number } => {
    const digit1 = COLOR_CODES.find(c => c.name === band1)?.digit ?? 0;
    const digit2 = COLOR_CODES.find(c => c.name === band2)?.digit ?? 0;
    const digit3 = COLOR_CODES.find(c => c.name === band3)?.digit ?? 0;
    const multiplier = COLOR_CODES.find(c => c.name === band4)?.multiplier ?? 1;
    const toleranceValue = COLOR_CODES.find(c => c.name === band5)?.tolerance ?? 20;
    
    const resistanceValue = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
    
    return { resistance: resistanceValue, tolerance: toleranceValue };
  }, [band1, band2, band3, band4, band5]);

  const calculateSMDResistance = useCallback((): { resistance: number; tolerance: number } => {
    const code = smdCode.trim();
    if (!code) return { resistance: 0, tolerance: 5 };
    
    let resistanceValue = 0;
    let toleranceValue = 5;
    
    if (code.length === 3) {
      // 3-digit SMD code: first two digits are significant, third is multiplier
      const digits = parseInt(code.substring(0, 2));
      const multiplier = Math.pow(10, parseInt(code[2]));
      resistanceValue = digits * multiplier;
    } else if (code.length === 4) {
      // 4-digit SMD code: first three digits are significant, fourth is multiplier
      const digits = parseInt(code.substring(0, 3));
      const multiplier = Math.pow(10, parseInt(code[3]));
      resistanceValue = digits * multiplier;
    }
    
    return { resistance: resistanceValue, tolerance: toleranceValue };
  }, [smdCode]);

  const calculate = useCallback(() => {
    if (mode === '4-band') {
      const result = calculate4BandResistance();
      setResistance(result.resistance);
      setTolerance(result.tolerance);
      setFormattedResistance(formatResistance(result.resistance));
      const toleranceDecimal = result.tolerance / 100;
      setMinResistance(result.resistance * (1 - toleranceDecimal));
      setMaxResistance(result.resistance * (1 + toleranceDecimal));
    } else if (mode === '5-band') {
      const result = calculate5BandResistance();
      setResistance(result.resistance);
      setTolerance(result.tolerance);
      setFormattedResistance(formatResistance(result.resistance));
      const toleranceDecimal = result.tolerance / 100;
      setMinResistance(result.resistance * (1 - toleranceDecimal));
      setMaxResistance(result.resistance * (1 + toleranceDecimal));
    } else if (mode === 'smd') {
      const result = calculateSMDResistance();
      setResistance(result.resistance);
      setTolerance(result.tolerance);
      setFormattedResistance(formatResistance(result.resistance));
      const toleranceDecimal = result.tolerance / 100;
      setMinResistance(result.resistance * (1 - toleranceDecimal));
      setMaxResistance(result.resistance * (1 + toleranceDecimal));
    }
  }, [mode, calculate4BandResistance, calculate5BandResistance, calculateSMDResistance, formatResistance]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (resistance !== null && tolerance !== null) {
      const resultText = `Resistance: ${formattedResistance}\nTolerance: ±${tolerance}%\nMin: ${formatResistance(minResistance || 0)}\nMax: ${formatResistance(maxResistance || 0)}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
    if (value == null) return '0.00';
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const getColorStyle = (colorName: string): React.CSSProperties => {
    const colorCode = COLOR_CODES.find(c => c.name === colorName);
    return {
      backgroundColor: colorCode?.color || '#CCCCCC',
      border: colorName === 'White' ? '1px solid #000' : 'none'
    };
  };

  return (
    <div className="w-full space-y-6">
      {/* Mode Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          <option value="4-band">4-Band Resistor</option>
          <option value="5-band">5-Band Resistor</option>
          <option value="smd">SMD Resistor</option>
        </select>
      </div>

      {mode === 'smd' ? (
        /* SMD Code Input */
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">SMD Code</label>
          <input
            type="text"
            value={smdCode}
            onChange={(e) => setSmdCode(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="103"
            maxLength={4}
          />
          <p className="text-xs text-foreground/50">Enter 3 or 4-digit SMD code (e.g., 103 for 10kΩ)</p>
        </div>
      ) : (
        /* Color Band Selections */
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Band 1</label>
            <div className="flex gap-2">
              <select
                value={band1}
                onChange={(e) => setBand1(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {COLOR_CODES.filter(c => c.digit !== undefined).map((color) => (
                  <option key={color.name} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
              <div 
                className="w-12 h-10 rounded-md border border-input"
                style={getColorStyle(band1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Band 2</label>
            <div className="flex gap-2">
              <select
                value={band2}
                onChange={(e) => setBand2(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {COLOR_CODES.filter(c => c.digit !== undefined).map((color) => (
                  <option key={color.name} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
              <div 
                className="w-12 h-10 rounded-md border border-input"
                style={getColorStyle(band2)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Band 3 {mode === '5-band' ? '(Digit)' : '(Multiplier)'}</label>
            <div className="flex gap-2">
              <select
                value={band3}
                onChange={(e) => setBand3(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {mode === '5-band' 
                  ? COLOR_CODES.filter(c => c.digit !== undefined).map((color) => (
                      <option key={color.name} value={color.name}>
                        {color.name}
                      </option>
                    ))
                  : COLOR_CODES.filter(c => c.multiplier !== undefined).map((color) => (
                      <option key={color.name} value={color.name}>
                        {color.name}
                      </option>
                    ))
                }
              </select>
              <div 
                className="w-12 h-10 rounded-md border border-input"
                style={getColorStyle(band3)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Band 4 {mode === '5-band' ? '(Multiplier)' : '(Tolerance)'}</label>
            <div className="flex gap-2">
              <select
                value={band4}
                onChange={(e) => setBand4(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {mode === '5-band'
                  ? COLOR_CODES.filter(c => c.multiplier !== undefined).map((color) => (
                      <option key={color.name} value={color.name}>
                        {color.name}
                      </option>
                    ))
                  : TOLERANCE_COLORS.map((color) => (
                      <option key={color.name} value={color.name}>
                        {color.name}
                      </option>
                    ))
                }
              </select>
              <div 
                className="w-12 h-10 rounded-md border border-input"
                style={getColorStyle(band4)}
              />
            </div>
          </div>

          {mode === '5-band' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Band 5 (Tolerance)</label>
              <div className="flex gap-2">
                <select
                  value={band5}
                  onChange={(e) => setBand5(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  {TOLERANCE_COLORS.map((color) => (
                    <option key={color.name} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div 
                  className="w-12 h-10 rounded-md border border-input"
                  style={getColorStyle(band5)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <p className="text-foreground/60">Resistance</p>
            <p className="text-2xl font-semibold text-foreground">{formattedResistance}</p>
          </div>
          <div>
            <p className="text-foreground/60">Tolerance</p>
            <p className="text-lg font-semibold text-foreground">{tolerance !== null ? `±${tolerance}%` : '0%'}</p>
          </div>
          <div>
            <p className="text-foreground/60">Min Value</p>
            <p className="text-lg font-semibold text-foreground">{formatResistance(minResistance || 0)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Max Value</p>
            <p className="text-lg font-semibold text-foreground">{formatResistance(maxResistance || 0)}</p>
          </div>
        </div>
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
