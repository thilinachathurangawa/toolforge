'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalculateFor = 'density' | 'mass' | 'volume';

type MassUnit = 'kg' | 'g' | 'lb' | 'oz';
type VolumeUnit = 'm³' | 'L' | 'mL' | 'ft³' | 'in³';
type DensityUnit = 'kg/m³' | 'g/cm³' | 'g/mL' | 'lb/ft³';

const MASS_UNITS: { value: MassUnit; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
];

const VOLUME_UNITS: { value: VolumeUnit; label: string }[] = [
  { value: 'm³', label: 'm³' },
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
  { value: 'ft³', label: 'ft³' },
  { value: 'in³', label: 'in³' },
];

const DENSITY_UNITS: { value: DensityUnit; label: string }[] = [
  { value: 'kg/m³', label: 'kg/m³' },
  { value: 'g/cm³', label: 'g/cm³' },
  { value: 'g/mL', label: 'g/mL' },
  { value: 'lb/ft³', label: 'lb/ft³' },
];

const WATER_DENSITY = 1000; // kg/m³

export function DensityCalculator() {
  const [calculateFor, setCalculateFor] = useState<CalculateFor>('density');
  const [mass, setMass] = useState<string>('1000');
  const [massUnit, setMassUnit] = useState<MassUnit>('g');
  const [volume, setVolume] = useState<string>('1000');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('mL');
  const [density, setDensity] = useState<string>('1');
  const [densityUnit, setDensityUnit] = useState<DensityUnit>('g/mL');
  const [specificGravity, setSpecificGravity] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [resultsInAllUnits, setResultsInAllUnits] = useState<{ [key: string]: number }>({});
  const [copied, setCopied] = useState(false);

  const convertToKilograms = useCallback((value: number, from: MassUnit): number => {
    switch (from) {
      case 'kg': return value;
      case 'g': return value / 1000;
      case 'lb': return value * 0.453592;
      case 'oz': return value * 0.0283495;
      default: return value;
    }
  }, []);

  const convertToCubicMeters = useCallback((value: number, from: VolumeUnit): number => {
    switch (from) {
      case 'm³': return value;
      case 'L': return value / 1000;
      case 'mL': return value / 1000000;
      case 'ft³': return value * 0.0283168;
      case 'in³': return value * 0.0000163871;
      default: return value;
    }
  }, []);

  const convertToKgPerCubicMeter = useCallback((value: number, from: DensityUnit): number => {
    switch (from) {
      case 'kg/m³': return value;
      case 'g/cm³': return value * 1000;
      case 'g/mL': return value * 1000;
      case 'lb/ft³': return value * 16.0185;
      default: return value;
    }
  }, []);

  const convertDensityToAllUnits = useCallback((densityInKgPerCubicMeter: number): { [key: string]: number } => {
    return {
      'kg/m³': densityInKgPerCubicMeter,
      'g/cm³': densityInKgPerCubicMeter / 1000,
      'g/mL': densityInKgPerCubicMeter / 1000,
      'lb/ft³': densityInKgPerCubicMeter / 16.0185
    };
  }, []);

  const convertMassToAllUnits = useCallback((massInKg: number): { [key: string]: number } => {
    return {
      'kg': massInKg,
      'g': massInKg * 1000,
      'lb': massInKg / 0.453592,
      'oz': massInKg / 0.0283495
    };
  }, []);

  const convertVolumeToAllUnits = useCallback((volumeInCubicMeters: number): { [key: string]: number } => {
    return {
      'm³': volumeInCubicMeters,
      'L': volumeInCubicMeters * 1000,
      'mL': volumeInCubicMeters * 1000000,
      'ft³': volumeInCubicMeters / 0.0283168,
      'in³': volumeInCubicMeters / 0.0000163871
    };
  }, []);

  const calculate = useCallback(() => {
    const massNum = parseFloat(mass);
    const volumeNum = parseFloat(volume);
    const densityNum = parseFloat(density);

    if (calculateFor === 'density') {
      if (isNaN(massNum) || isNaN(volumeNum) || massNum < 0 || volumeNum <= 0) {
        setResult(null);
        setSpecificGravity(null);
        setResultsInAllUnits({});
        return;
      }
      const massInKg = convertToKilograms(massNum, massUnit);
      const volumeInCubicMeters = convertToCubicMeters(volumeNum, volumeUnit);
      const densityInKgPerCubicMeter = massInKg / volumeInCubicMeters;
      setResult(densityInKgPerCubicMeter);
      setSpecificGravity(densityInKgPerCubicMeter / WATER_DENSITY);
      setResultsInAllUnits(convertDensityToAllUnits(densityInKgPerCubicMeter));
    } else if (calculateFor === 'mass') {
      if (isNaN(densityNum) || isNaN(volumeNum) || densityNum < 0 || volumeNum <= 0) {
        setResult(null);
        setSpecificGravity(null);
        setResultsInAllUnits({});
        return;
      }
      const densityInKgPerCubicMeter = convertToKgPerCubicMeter(densityNum, densityUnit);
      const volumeInCubicMeters = convertToCubicMeters(volumeNum, volumeUnit);
      const massInKg = densityInKgPerCubicMeter * volumeInCubicMeters;
      setResult(massInKg);
      setSpecificGravity(densityInKgPerCubicMeter / WATER_DENSITY);
      setResultsInAllUnits(convertMassToAllUnits(massInKg));
    } else if (calculateFor === 'volume') {
      if (isNaN(densityNum) || isNaN(massNum) || densityNum <= 0 || massNum < 0) {
        setResult(null);
        setSpecificGravity(null);
        setResultsInAllUnits({});
        return;
      }
      const densityInKgPerCubicMeter = convertToKgPerCubicMeter(densityNum, densityUnit);
      const massInKg = convertToKilograms(massNum, massUnit);
      const volumeInCubicMeters = massInKg / densityInKgPerCubicMeter;
      setResult(volumeInCubicMeters);
      setSpecificGravity(densityInKgPerCubicMeter / WATER_DENSITY);
      setResultsInAllUnits(convertVolumeToAllUnits(volumeInCubicMeters));
    }
  }, [calculateFor, mass, massUnit, volume, volumeUnit, density, densityUnit, convertToKilograms, convertToCubicMeters, convertToKgPerCubicMeter, convertDensityToAllUnits, convertMassToAllUnits, convertVolumeToAllUnits]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      let resultText = '';
      if (calculateFor === 'density') {
        resultText = `Density: ${resultsInAllUnits['kg/m³']?.toFixed(2)} kg/m³\n${resultsInAllUnits['g/cm³']?.toFixed(4)} g/cm³\n${resultsInAllUnits['g/mL']?.toFixed(4)} g/mL\n${resultsInAllUnits['lb/ft³']?.toFixed(2)} lb/ft³\nSpecific Gravity: ${specificGravity?.toFixed(2)}`;
      } else if (calculateFor === 'mass') {
        resultText = `Mass: ${resultsInAllUnits['kg']?.toFixed(4)} kg\n${resultsInAllUnits['g']?.toFixed(2)} g\n${resultsInAllUnits['lb']?.toFixed(4)} lb\n${resultsInAllUnits['oz']?.toFixed(2)} oz\nDensity: ${density} ${densityUnit}\nSpecific Gravity: ${specificGravity?.toFixed(2)}`;
      } else if (calculateFor === 'volume') {
        resultText = `Volume: ${resultsInAllUnits['m³']?.toFixed(6)} m³\n${resultsInAllUnits['L']?.toFixed(4)} L\n${resultsInAllUnits['mL']?.toFixed(2)} mL\n${resultsInAllUnits['ft³']?.toFixed(4)} ft³\nDensity: ${density} ${densityUnit}\nSpecific Gravity: ${specificGravity?.toFixed(2)}`;
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
          <option value="density">Density (ρ = m/V)</option>
          <option value="mass">Mass (m = ρ × V)</option>
          <option value="volume">Volume (V = m/ρ)</option>
        </select>
      </div>

      {/* Mass */}
      {calculateFor !== 'mass' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Mass (m)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={mass}
              onChange={(e) => setMass(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="1000"
              min="0"
              step="0.1"
            />
            <select
              value={massUnit}
              onChange={(e) => setMassUnit(e.target.value as MassUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {MASS_UNITS.map((unit) => (
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
              placeholder="1000"
              min="0"
              step="0.1"
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

      {/* Density */}
      {calculateFor !== 'density' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Density (ρ)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="1"
              min="0"
              step="0.01"
            />
            <select
              value={densityUnit}
              onChange={(e) => setDensityUnit(e.target.value as DensityUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {DENSITY_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Box className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {calculateFor === 'density' && (
            <>
              <div>
                <p className="text-foreground/60">Density (kg/m³)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['kg/m³'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Density (g/cm³)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['g/cm³'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Density (g/mL)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['g/mL'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Density (lb/ft³)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['lb/ft³'])}</p>
              </div>
            </>
          )}
          {calculateFor === 'mass' && (
            <>
              <div>
                <p className="text-foreground/60">Mass (kg)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['kg'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Mass (g)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['g'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Mass (lb)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['lb'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Mass (oz)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['oz'])}</p>
              </div>
            </>
          )}
          {calculateFor === 'volume' && (
            <>
              <div>
                <p className="text-foreground/60">Volume (m³)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['m³'], 6)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Volume (L)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['L'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Volume (mL)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mL'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Volume (ft³)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['ft³'], 4)}</p>
              </div>
            </>
          )}
          {specificGravity !== null && (
            <div className="col-span-2 border-t border-input pt-3">
              <p className="text-foreground/60">Specific Gravity (relative to water)</p>
              <p className="text-lg font-semibold text-foreground">{formatNumber(specificGravity)}</p>
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
