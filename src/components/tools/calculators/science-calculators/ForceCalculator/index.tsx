'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalculateFor = 'force' | 'mass' | 'acceleration';

type MassUnit = 'kg' | 'g' | 'lb' | 'oz';
type AccelerationUnit = 'm/s²' | 'ft/s²' | 'g';
type ForceUnit = 'N' | 'lbf' | 'dyn';

const MASS_UNITS: { value: MassUnit; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
];

const ACCELERATION_UNITS: { value: AccelerationUnit; label: string }[] = [
  { value: 'm/s²', label: 'm/s²' },
  { value: 'ft/s²', label: 'ft/s²' },
  { value: 'g', label: 'g' },
];

const FORCE_UNITS: { value: ForceUnit; label: string }[] = [
  { value: 'N', label: 'N' },
  { value: 'lbf', label: 'lbf' },
  { value: 'dyn', label: 'dyn' },
];

export function ForceCalculator() {
  const [calculateFor, setCalculateFor] = useState<CalculateFor>('force');
  const [mass, setMass] = useState<string>('10');
  const [massUnit, setMassUnit] = useState<MassUnit>('kg');
  const [acceleration, setAcceleration] = useState<string>('9.8');
  const [accelerationUnit, setAccelerationUnit] = useState<AccelerationUnit>('m/s²');
  const [force, setForce] = useState<string>('98');
  const [forceUnit, setForceUnit] = useState<ForceUnit>('N');
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

  const convertToMetersPerSecondSquared = useCallback((value: number, from: AccelerationUnit): number => {
    switch (from) {
      case 'm/s²': return value;
      case 'ft/s²': return value * 0.3048;
      case 'g': return value * 9.80665;
      default: return value;
    }
  }, []);

  const convertForceToAllUnits = useCallback((forceInNewtons: number): { [key: string]: number } => {
    return {
      'N': forceInNewtons,
      'lbf': forceInNewtons * 0.224809,
      'dyn': forceInNewtons * 100000
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

  const convertAccelerationToAllUnits = useCallback((accelerationInMetersPerSecondSquared: number): { [key: string]: number } => {
    return {
      'm/s²': accelerationInMetersPerSecondSquared,
      'ft/s²': accelerationInMetersPerSecondSquared / 0.3048,
      'g': accelerationInMetersPerSecondSquared / 9.80665
    };
  }, []);

  const convertToNewtons = useCallback((value: number, from: ForceUnit): number => {
    switch (from) {
      case 'N': return value;
      case 'lbf': return value / 0.224809;
      case 'dyn': return value / 100000;
      default: return value;
    }
  }, []);

  const calculate = useCallback(() => {
    const massNum = parseFloat(mass);
    const accelerationNum = parseFloat(acceleration);
    const forceNum = parseFloat(force);

    if (calculateFor === 'force') {
      if (isNaN(massNum) || isNaN(accelerationNum) || massNum < 0 || accelerationNum < 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const massInKg = convertToKilograms(massNum, massUnit);
      const accelerationInMetersPerSecondSquared = convertToMetersPerSecondSquared(accelerationNum, accelerationUnit);
      const forceInNewtons = massInKg * accelerationInMetersPerSecondSquared;
      setResult(forceInNewtons);
      setResultsInAllUnits(convertForceToAllUnits(forceInNewtons));
    } else if (calculateFor === 'mass') {
      if (isNaN(forceNum) || isNaN(accelerationNum) || forceNum < 0 || accelerationNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const forceInNewtons = convertToNewtons(forceNum, forceUnit);
      const accelerationInMetersPerSecondSquared = convertToMetersPerSecondSquared(accelerationNum, accelerationUnit);
      const massInKg = forceInNewtons / accelerationInMetersPerSecondSquared;
      setResult(massInKg);
      setResultsInAllUnits(convertMassToAllUnits(massInKg));
    } else if (calculateFor === 'acceleration') {
      if (isNaN(forceNum) || isNaN(massNum) || forceNum < 0 || massNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const forceInNewtons = convertToNewtons(forceNum, forceUnit);
      const massInKg = convertToKilograms(massNum, massUnit);
      const accelerationInMetersPerSecondSquared = forceInNewtons / massInKg;
      setResult(accelerationInMetersPerSecondSquared);
      setResultsInAllUnits(convertAccelerationToAllUnits(accelerationInMetersPerSecondSquared));
    }
  }, [calculateFor, mass, massUnit, acceleration, accelerationUnit, force, forceUnit, convertToKilograms, convertToMetersPerSecondSquared, convertForceToAllUnits, convertMassToAllUnits, convertAccelerationToAllUnits, convertToNewtons]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      let resultText = '';
      if (calculateFor === 'force') {
        resultText = `Force: ${resultsInAllUnits['N']?.toFixed(2)} N\n${resultsInAllUnits['lbf']?.toFixed(2)} lbf\n${resultsInAllUnits['dyn']?.toFixed(0)} dyn`;
      } else if (calculateFor === 'mass') {
        resultText = `Mass: ${resultsInAllUnits['kg']?.toFixed(4)} kg\n${resultsInAllUnits['g']?.toFixed(2)} g\n${resultsInAllUnits['lb']?.toFixed(4)} lb\n${resultsInAllUnits['oz']?.toFixed(2)} oz`;
      } else if (calculateFor === 'acceleration') {
        resultText = `Acceleration: ${resultsInAllUnits['m/s²']?.toFixed(4)} m/s²\n${resultsInAllUnits['ft/s²']?.toFixed(4)} ft/s²\n${resultsInAllUnits['g']?.toFixed(4)} g`;
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
          <option value="force">Force (F = ma)</option>
          <option value="mass">Mass (m = F/a)</option>
          <option value="acceleration">Acceleration (a = F/m)</option>
        </select>
      </div>

      {/* Mass */}
      {calculateFor !== 'mass' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Mass</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={mass}
              onChange={(e) => setMass(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="10"
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

      {/* Acceleration */}
      {calculateFor !== 'acceleration' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Acceleration</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={acceleration}
              onChange={(e) => setAcceleration(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="9.8"
              min="0"
              step="0.1"
            />
            <select
              value={accelerationUnit}
              onChange={(e) => setAccelerationUnit(e.target.value as AccelerationUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {ACCELERATION_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Force */}
      {calculateFor !== 'force' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Force</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={force}
              onChange={(e) => setForce(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="98"
              min="0"
              step="0.1"
            />
            <select
              value={forceUnit}
              onChange={(e) => setForceUnit(e.target.value as ForceUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {FORCE_UNITS.map((unit) => (
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
          <ArrowUp className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {calculateFor === 'force' && (
            <>
              <div>
                <p className="text-foreground/60">Force (N)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['N'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Force (lbf)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['lbf'])}</p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground/60">Force (dyn)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['dyn'], 0)}</p>
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
          {calculateFor === 'acceleration' && (
            <>
              <div>
                <p className="text-foreground/60">Acceleration (m/s²)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['m/s²'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Acceleration (ft/s²)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['ft/s²'], 4)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground/60">Acceleration (g)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['g'], 4)}</p>
              </div>
            </>
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
