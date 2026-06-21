'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Bolt } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalculateFor = 'kineticEnergy' | 'mass' | 'velocity';

type MassUnit = 'kg' | 'g' | 'lb' | 'oz';
type VelocityUnit = 'm/s' | 'km/h' | 'mph' | 'ft/s';
type EnergyUnit = 'J' | 'kJ' | 'cal' | 'BTU';

const MASS_UNITS: { value: MassUnit; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
];

const VELOCITY_UNITS: { value: VelocityUnit; label: string }[] = [
  { value: 'm/s', label: 'm/s' },
  { value: 'km/h', label: 'km/h' },
  { value: 'mph', label: 'mph' },
  { value: 'ft/s', label: 'ft/s' },
];

const ENERGY_UNITS: { value: EnergyUnit; label: string }[] = [
  { value: 'J', label: 'J' },
  { value: 'kJ', label: 'kJ' },
  { value: 'cal', label: 'cal' },
  { value: 'BTU', label: 'BTU' },
];

export function KineticEnergyCalculator() {
  const [calculateFor, setCalculateFor] = useState<CalculateFor>('kineticEnergy');
  const [mass, setMass] = useState<string>('10');
  const [massUnit, setMassUnit] = useState<MassUnit>('kg');
  const [velocity, setVelocity] = useState<string>('20');
  const [velocityUnit, setVelocityUnit] = useState<VelocityUnit>('m/s');
  const [kineticEnergy, setKineticEnergy] = useState<string>('2000');
  const [energyUnit, setEnergyUnit] = useState<EnergyUnit>('J');
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

  const convertToMetersPerSecond = useCallback((value: number, from: VelocityUnit): number => {
    switch (from) {
      case 'm/s': return value;
      case 'km/h': return value / 3.6;
      case 'mph': return value / 2.23694;
      case 'ft/s': return value / 3.28084;
      default: return value;
    }
  }, []);

  const convertEnergyToAllUnits = useCallback((energyInJoules: number): { [key: string]: number } => {
    return {
      'J': energyInJoules,
      'kJ': energyInJoules / 1000,
      'cal': energyInJoules / 4.184,
      'BTU': energyInJoules / 1055.06
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

  const convertVelocityToAllUnits = useCallback((velocityInMetersPerSecond: number): { [key: string]: number } => {
    return {
      'm/s': velocityInMetersPerSecond,
      'km/h': velocityInMetersPerSecond * 3.6,
      'mph': velocityInMetersPerSecond * 2.23694,
      'ft/s': velocityInMetersPerSecond * 3.28084
    };
  }, []);

  const convertToJoules = useCallback((value: number, from: EnergyUnit): number => {
    switch (from) {
      case 'J': return value;
      case 'kJ': return value * 1000;
      case 'cal': return value * 4.184;
      case 'BTU': return value * 1055.06;
      default: return value;
    }
  }, []);

  const calculate = useCallback(() => {
    const massNum = parseFloat(mass);
    const velocityNum = parseFloat(velocity);
    const kineticEnergyNum = parseFloat(kineticEnergy);

    if (calculateFor === 'kineticEnergy') {
      if (isNaN(massNum) || isNaN(velocityNum) || massNum < 0 || velocityNum < 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const massInKg = convertToKilograms(massNum, massUnit);
      const velocityInMetersPerSecond = convertToMetersPerSecond(velocityNum, velocityUnit);
      const energyInJoules = 0.5 * massInKg * Math.pow(velocityInMetersPerSecond, 2);
      setResult(energyInJoules);
      setResultsInAllUnits(convertEnergyToAllUnits(energyInJoules));
    } else if (calculateFor === 'mass') {
      if (isNaN(kineticEnergyNum) || isNaN(velocityNum) || kineticEnergyNum < 0 || velocityNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const energyInJoules = convertToJoules(kineticEnergyNum, energyUnit);
      const velocityInMetersPerSecond = convertToMetersPerSecond(velocityNum, velocityUnit);
      const massInKg = (2 * energyInJoules) / Math.pow(velocityInMetersPerSecond, 2);
      setResult(massInKg);
      setResultsInAllUnits(convertMassToAllUnits(massInKg));
    } else if (calculateFor === 'velocity') {
      if (isNaN(kineticEnergyNum) || isNaN(massNum) || kineticEnergyNum < 0 || massNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const energyInJoules = convertToJoules(kineticEnergyNum, energyUnit);
      const massInKg = convertToKilograms(massNum, massUnit);
      const velocityInMetersPerSecond = Math.sqrt((2 * energyInJoules) / massInKg);
      setResult(velocityInMetersPerSecond);
      setResultsInAllUnits(convertVelocityToAllUnits(velocityInMetersPerSecond));
    }
  }, [calculateFor, mass, massUnit, velocity, velocityUnit, kineticEnergy, energyUnit, convertToKilograms, convertToMetersPerSecond, convertEnergyToAllUnits, convertMassToAllUnits, convertVelocityToAllUnits, convertToJoules]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      let resultText = '';
      if (calculateFor === 'kineticEnergy') {
        resultText = `Kinetic Energy: ${resultsInAllUnits['J']?.toFixed(2)} J\n${resultsInAllUnits['kJ']?.toFixed(2)} kJ\n${resultsInAllUnits['cal']?.toFixed(2)} cal\n${resultsInAllUnits['BTU']?.toFixed(2)} BTU`;
      } else if (calculateFor === 'mass') {
        resultText = `Mass: ${resultsInAllUnits['kg']?.toFixed(4)} kg\n${resultsInAllUnits['g']?.toFixed(2)} g\n${resultsInAllUnits['lb']?.toFixed(4)} lb\n${resultsInAllUnits['oz']?.toFixed(2)} oz`;
      } else if (calculateFor === 'velocity') {
        resultText = `Velocity: ${resultsInAllUnits['m/s']?.toFixed(4)} m/s\n${resultsInAllUnits['km/h']?.toFixed(2)} km/h\n${resultsInAllUnits['mph']?.toFixed(2)} mph\n${resultsInAllUnits['ft/s']?.toFixed(2)} ft/s`;
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
          <option value="kineticEnergy">Kinetic Energy (KE = ½mv²)</option>
          <option value="mass">Mass (m = 2KE/v²)</option>
          <option value="velocity">Velocity (v = √(2KE/m))</option>
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

      {/* Velocity */}
      {calculateFor !== 'velocity' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Velocity</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={velocity}
              onChange={(e) => setVelocity(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="20"
              min="0"
              step="0.1"
            />
            <select
              value={velocityUnit}
              onChange={(e) => setVelocityUnit(e.target.value as VelocityUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {VELOCITY_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Kinetic Energy */}
      {calculateFor !== 'kineticEnergy' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Kinetic Energy</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={kineticEnergy}
              onChange={(e) => setKineticEnergy(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="2000"
              min="0"
              step="0.1"
            />
            <select
              value={energyUnit}
              onChange={(e) => setEnergyUnit(e.target.value as EnergyUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {ENERGY_UNITS.map((unit) => (
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
          <Bolt className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {calculateFor === 'kineticEnergy' && (
            <>
              <div>
                <p className="text-foreground/60">Kinetic Energy (J)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['J'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Kinetic Energy (kJ)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['kJ'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Kinetic Energy (cal)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['cal'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Kinetic Energy (BTU)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['BTU'])}</p>
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
          {calculateFor === 'velocity' && (
            <>
              <div>
                <p className="text-foreground/60">Velocity (m/s)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['m/s'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Velocity (km/h)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['km/h'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Velocity (mph)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mph'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Velocity (ft/s)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['ft/s'])}</p>
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
