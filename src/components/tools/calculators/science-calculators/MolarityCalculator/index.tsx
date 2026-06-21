'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalculateFor = 'molarity' | 'moles' | 'volume';

type MolesUnit = 'mol' | 'mmol';
type VolumeUnit = 'L' | 'mL';
type MolarityUnit = 'M' | 'mM';

const MOLES_UNITS: { value: MolesUnit; label: string }[] = [
  { value: 'mol', label: 'mol' },
  { value: 'mmol', label: 'mmol' },
];

const VOLUME_UNITS: { value: VolumeUnit; label: string }[] = [
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
];

const MOLARITY_UNITS: { value: MolarityUnit; label: string }[] = [
  { value: 'M', label: 'M' },
  { value: 'mM', label: 'mM' },
];

export function MolarityCalculator() {
  const [calculateFor, setCalculateFor] = useState<CalculateFor>('molarity');
  const [moles, setMoles] = useState<string>('0.5');
  const [molesUnit, setMolesUnit] = useState<MolesUnit>('mol');
  const [volume, setVolume] = useState<string>('0.5');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('L');
  const [molarity, setMolarity] = useState<string>('1');
  const [molarityUnit, setMolarityUnit] = useState<MolarityUnit>('M');
  const [molarMass, setMolarMass] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [mass, setMass] = useState<number | null>(null);
  const [resultsInAllUnits, setResultsInAllUnits] = useState<{ [key: string]: number }>({});
  const [copied, setCopied] = useState(false);

  const convertToMoles = useCallback((value: number, from: MolesUnit): number => {
    switch (from) {
      case 'mol': return value;
      case 'mmol': return value / 1000;
      default: return value;
    }
  }, []);

  const convertToLiters = useCallback((value: number, from: VolumeUnit): number => {
    switch (from) {
      case 'L': return value;
      case 'mL': return value / 1000;
      default: return value;
    }
  }, []);

  const convertToMolarity = useCallback((value: number, from: MolarityUnit): number => {
    switch (from) {
      case 'M': return value;
      case 'mM': return value / 1000;
      default: return value;
    }
  }, []);

  const convertMolarityToAllUnits = useCallback((molarityInMolar: number): { [key: string]: number } => {
    return {
      'M': molarityInMolar,
      'mM': molarityInMolar * 1000
    };
  }, []);

  const convertMolesToAllUnits = useCallback((molesInMol: number): { [key: string]: number } => {
    return {
      'mol': molesInMol,
      'mmol': molesInMol * 1000
    };
  }, []);

  const convertVolumeToAllUnits = useCallback((volumeInLiters: number): { [key: string]: number } => {
    return {
      'L': volumeInLiters,
      'mL': volumeInLiters * 1000
    };
  }, []);

  const calculate = useCallback(() => {
    const molesNum = parseFloat(moles);
    const volumeNum = parseFloat(volume);
    const molarityNum = parseFloat(molarity);
    const molarMassNum = parseFloat(molarMass);

    if (calculateFor === 'molarity') {
      if (isNaN(molesNum) || isNaN(volumeNum) || molesNum < 0 || volumeNum <= 0) {
        setResult(null);
        setMass(null);
        setResultsInAllUnits({});
        return;
      }
      const molesInMol = convertToMoles(molesNum, molesUnit);
      const volumeInLiters = convertToLiters(volumeNum, volumeUnit);
      const molarityInMolar = molesInMol / volumeInLiters;
      setResult(molarityInMolar);
      setResultsInAllUnits(convertMolarityToAllUnits(molarityInMolar));
      if (molarMassNum > 0) {
        setMass(molesInMol * molarMassNum);
      } else {
        setMass(null);
      }
    } else if (calculateFor === 'moles') {
      if (isNaN(molarityNum) || isNaN(volumeNum) || molarityNum < 0 || volumeNum <= 0) {
        setResult(null);
        setMass(null);
        setResultsInAllUnits({});
        return;
      }
      const molarityInMolar = convertToMolarity(molarityNum, molarityUnit);
      const volumeInLiters = convertToLiters(volumeNum, volumeUnit);
      const molesInMol = molarityInMolar * volumeInLiters;
      setResult(molesInMol);
      setResultsInAllUnits(convertMolesToAllUnits(molesInMol));
      if (molarMassNum > 0) {
        setMass(molesInMol * molarMassNum);
      } else {
        setMass(null);
      }
    } else if (calculateFor === 'volume') {
      if (isNaN(molarityNum) || isNaN(molesNum) || molarityNum <= 0 || molesNum < 0) {
        setResult(null);
        setMass(null);
        setResultsInAllUnits({});
        return;
      }
      const molarityInMolar = convertToMolarity(molarityNum, molarityUnit);
      const molesInMol = convertToMoles(molesNum, molesUnit);
      const volumeInLiters = molesInMol / molarityInMolar;
      setResult(volumeInLiters);
      setResultsInAllUnits(convertVolumeToAllUnits(volumeInLiters));
      if (molarMassNum > 0) {
        setMass(molesInMol * molarMassNum);
      } else {
        setMass(null);
      }
    }
  }, [calculateFor, moles, molesUnit, volume, volumeUnit, molarity, molarityUnit, molarMass, convertToMoles, convertToLiters, convertToMolarity, convertMolarityToAllUnits, convertMolesToAllUnits, convertVolumeToAllUnits]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      let resultText = '';
      if (calculateFor === 'molarity') {
        resultText = `Molarity: ${resultsInAllUnits['M']?.toFixed(4)} M\n${resultsInAllUnits['mM']?.toFixed(2)} mM\nMoles: ${moles} ${molesUnit}\nVolume: ${volume} ${volumeUnit}`;
      } else if (calculateFor === 'moles') {
        resultText = `Moles: ${resultsInAllUnits['mol']?.toFixed(4)} mol\n${resultsInAllUnits['mmol']?.toFixed(2)} mmol\nMolarity: ${molarity} ${molarityUnit}\nVolume: ${volume} ${volumeUnit}`;
      } else if (calculateFor === 'volume') {
        resultText = `Volume: ${resultsInAllUnits['L']?.toFixed(4)} L\n${resultsInAllUnits['mL']?.toFixed(2)} mL\nMolarity: ${molarity} ${molarityUnit}\nMoles: ${moles} ${molesUnit}`;
      }
      if (mass !== null) {
        resultText += `\nMass: ${mass.toFixed(2)} g`;
      }
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
      {/* Calculate For */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Calculate</label>
        <select
          value={calculateFor}
          onChange={(e) => setCalculateFor(e.target.value as CalculateFor)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          <option value="molarity">Molarity (M = n/V)</option>
          <option value="moles">Moles (n = M × V)</option>
          <option value="volume">Volume (V = n/M)</option>
        </select>
      </div>

      {/* Moles */}
      {calculateFor !== 'moles' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Moles (n)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={moles}
              onChange={(e) => setMoles(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="0.5"
              min="0"
              step="0.01"
            />
            <select
              value={molesUnit}
              onChange={(e) => setMolesUnit(e.target.value as MolesUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {MOLES_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Volume */}
      {calculateFor !== 'volume' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Volume (V)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="0.5"
              min="0"
              step="0.01"
            />
            <select
              value={volumeUnit}
              onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {VOLUME_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Molarity */}
      {calculateFor !== 'molarity' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Molarity (M)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={molarity}
              onChange={(e) => setMolarity(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="1"
              min="0"
              step="0.01"
            />
            <select
              value={molarityUnit}
              onChange={(e) => setMolarityUnit(e.target.value as MolarityUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {MOLARITY_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Molar Mass (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Molar Mass (Optional) - g/mol</label>
        <input
          type="number"
          value={molarMass}
          onChange={(e) => setMolarMass(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="58.44"
          min="0"
          step="0.01"
        />
        <p className="text-xs text-foreground/50">Enter molar mass to calculate mass of solute</p>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Beaker className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {calculateFor === 'molarity' && (
            <>
              <div>
                <p className="text-foreground/60">Molarity (M)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['M'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Molarity (mM)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mM'])}</p>
              </div>
            </>
          )}
          {calculateFor === 'moles' && (
            <>
              <div>
                <p className="text-foreground/60">Moles (mol)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mol'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Moles (mmol)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mmol'])}</p>
              </div>
            </>
          )}
          {calculateFor === 'volume' && (
            <>
              <div>
                <p className="text-foreground/60">Volume (L)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['L'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Volume (mL)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mL'])}</p>
              </div>
            </>
          )}
          {mass !== null && (
            <div className="col-span-2 border-t border-input pt-3">
              <p className="text-foreground/60">Mass (g)</p>
              <p className="text-lg font-semibold text-foreground">{formatNumber(mass)}</p>
            </div>
          )}
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
