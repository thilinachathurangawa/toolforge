'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalculateFor = 'voltage' | 'current' | 'resistance';

type VoltageUnit = 'V' | 'mV' | 'kV';
type CurrentUnit = 'A' | 'mA' | 'kA';
type ResistanceUnit = 'Ω' | 'kΩ' | 'MΩ';

const VOLTAGE_UNITS: { value: VoltageUnit; label: string }[] = [
  { value: 'V', label: 'V' },
  { value: 'mV', label: 'mV' },
  { value: 'kV', label: 'kV' },
];

const CURRENT_UNITS: { value: CurrentUnit; label: string }[] = [
  { value: 'A', label: 'A' },
  { value: 'mA', label: 'mA' },
  { value: 'kA', label: 'kA' },
];

const RESISTANCE_UNITS: { value: ResistanceUnit; label: string }[] = [
  { value: 'Ω', label: 'Ω' },
  { value: 'kΩ', label: 'kΩ' },
  { value: 'MΩ', label: 'MΩ' },
];

export function OhmsLawCalculator() {
  const [calculateFor, setCalculateFor] = useState<CalculateFor>('voltage');
  const [voltage, setVoltage] = useState<string>('12');
  const [voltageUnit, setVoltageUnit] = useState<VoltageUnit>('V');
  const [current, setCurrent] = useState<string>('2');
  const [currentUnit, setCurrentUnit] = useState<CurrentUnit>('A');
  const [resistance, setResistance] = useState<string>('6');
  const [resistanceUnit, setResistanceUnit] = useState<ResistanceUnit>('Ω');
  const [result, setResult] = useState<number | null>(null);
  const [power, setPower] = useState<number | null>(null);
  const [resultsInAllUnits, setResultsInAllUnits] = useState<{ [key: string]: number }>({});
  const [copied, setCopied] = useState(false);

  const convertToVolts = useCallback((value: number, from: VoltageUnit): number => {
    switch (from) {
      case 'V': return value;
      case 'mV': return value / 1000;
      case 'kV': return value * 1000;
      default: return value;
    }
  }, []);

  const convertToAmperes = useCallback((value: number, from: CurrentUnit): number => {
    switch (from) {
      case 'A': return value;
      case 'mA': return value / 1000;
      case 'kA': return value * 1000;
      default: return value;
    }
  }, []);

  const convertToOhms = useCallback((value: number, from: ResistanceUnit): number => {
    switch (from) {
      case 'Ω': return value;
      case 'kΩ': return value * 1000;
      case 'MΩ': return value * 1000000;
      default: return value;
    }
  }, []);

  const convertVoltageToAllUnits = useCallback((voltageInVolts: number): { [key: string]: number } => {
    return {
      'V': voltageInVolts,
      'mV': voltageInVolts * 1000,
      'kV': voltageInVolts / 1000
    };
  }, []);

  const convertCurrentToAllUnits = useCallback((currentInAmperes: number): { [key: string]: number } => {
    return {
      'A': currentInAmperes,
      'mA': currentInAmperes * 1000,
      'kA': currentInAmperes / 1000
    };
  }, []);

  const convertResistanceToAllUnits = useCallback((resistanceInOhms: number): { [key: string]: number } => {
    return {
      'Ω': resistanceInOhms,
      'kΩ': resistanceInOhms / 1000,
      'MΩ': resistanceInOhms / 1000000
    };
  }, []);

  const calculate = useCallback(() => {
    const voltageNum = parseFloat(voltage);
    const currentNum = parseFloat(current);
    const resistanceNum = parseFloat(resistance);

    if (calculateFor === 'voltage') {
      if (isNaN(currentNum) || isNaN(resistanceNum) || currentNum < 0 || resistanceNum < 0) {
        setResult(null);
        setPower(null);
        setResultsInAllUnits({});
        return;
      }
      const currentInAmperes = convertToAmperes(currentNum, currentUnit);
      const resistanceInOhms = convertToOhms(resistanceNum, resistanceUnit);
      const voltageInVolts = currentInAmperes * resistanceInOhms;
      const powerInWatts = voltageInVolts * currentInAmperes;
      setResult(voltageInVolts);
      setPower(powerInWatts);
      setResultsInAllUnits(convertVoltageToAllUnits(voltageInVolts));
    } else if (calculateFor === 'current') {
      if (isNaN(voltageNum) || isNaN(resistanceNum) || voltageNum < 0 || resistanceNum <= 0) {
        setResult(null);
        setPower(null);
        setResultsInAllUnits({});
        return;
      }
      const voltageInVolts = convertToVolts(voltageNum, voltageUnit);
      const resistanceInOhms = convertToOhms(resistanceNum, resistanceUnit);
      const currentInAmperes = voltageInVolts / resistanceInOhms;
      const powerInWatts = voltageInVolts * currentInAmperes;
      setResult(currentInAmperes);
      setPower(powerInWatts);
      setResultsInAllUnits(convertCurrentToAllUnits(currentInAmperes));
    } else if (calculateFor === 'resistance') {
      if (isNaN(voltageNum) || isNaN(currentNum) || voltageNum < 0 || currentNum <= 0) {
        setResult(null);
        setPower(null);
        setResultsInAllUnits({});
        return;
      }
      const voltageInVolts = convertToVolts(voltageNum, voltageUnit);
      const currentInAmperes = convertToAmperes(currentNum, currentUnit);
      const resistanceInOhms = voltageInVolts / currentInAmperes;
      const powerInWatts = voltageInVolts * currentInAmperes;
      setResult(resistanceInOhms);
      setPower(powerInWatts);
      setResultsInAllUnits(convertResistanceToAllUnits(resistanceInOhms));
    }
  }, [calculateFor, voltage, voltageUnit, current, currentUnit, resistance, resistanceUnit, convertToVolts, convertToAmperes, convertToOhms, convertVoltageToAllUnits, convertCurrentToAllUnits, convertResistanceToAllUnits]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null && power !== null) {
      let resultText = '';
      if (calculateFor === 'voltage') {
        resultText = `Voltage: ${resultsInAllUnits['V']?.toFixed(2)} V\n${resultsInAllUnits['mV']?.toFixed(2)} mV\n${resultsInAllUnits['kV']?.toFixed(4)} kV\nCurrent: ${current} ${currentUnit}\nResistance: ${resistance} ${resistanceUnit}\nPower: ${power.toFixed(2)} W`;
      } else if (calculateFor === 'current') {
        resultText = `Current: ${resultsInAllUnits['A']?.toFixed(4)} A\n${resultsInAllUnits['mA']?.toFixed(2)} mA\n${resultsInAllUnits['kA']?.toFixed(4)} kA\nVoltage: ${voltage} ${voltageUnit}\nResistance: ${resistance} ${resistanceUnit}\nPower: ${power.toFixed(2)} W`;
      } else if (calculateFor === 'resistance') {
        resultText = `Resistance: ${resultsInAllUnits['Ω']?.toFixed(4)} Ω\n${resultsInAllUnits['kΩ']?.toFixed(4)} kΩ\n${resultsInAllUnits['MΩ']?.toFixed(4)} MΩ\nVoltage: ${voltage} ${voltageUnit}\nCurrent: ${current} ${currentUnit}\nPower: ${power.toFixed(2)} W`;
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
          <option value="voltage">Voltage (V = I × R)</option>
          <option value="current">Current (I = V / R)</option>
          <option value="resistance">Resistance (R = V / I)</option>
        </select>
      </div>

      {/* Voltage */}
      {calculateFor !== 'voltage' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Voltage</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="12"
              min="0"
              step="0.1"
            />
            <select
              value={voltageUnit}
              onChange={(e) => setVoltageUnit(e.target.value as VoltageUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {VOLTAGE_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Current */}
      {calculateFor !== 'current' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Current</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="2"
              min="0"
              step="0.1"
            />
            <select
              value={currentUnit}
              onChange={(e) => setCurrentUnit(e.target.value as CurrentUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {CURRENT_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Resistance */}
      {calculateFor !== 'resistance' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Resistance</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={resistance}
              onChange={(e) => setResistance(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="6"
              min="0"
              step="0.1"
            />
            <select
              value={resistanceUnit}
              onChange={(e) => setResistanceUnit(e.target.value as ResistanceUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {RESISTANCE_UNITS.map((unit) => (
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
          <Zap className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {calculateFor === 'voltage' && (
            <>
              <div>
                <p className="text-foreground/60">Voltage (V)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['V'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Voltage (mV)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mV'])}</p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground/60">Voltage (kV)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['kV'], 4)}</p>
              </div>
            </>
          )}
          {calculateFor === 'current' && (
            <>
              <div>
                <p className="text-foreground/60">Current (A)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['A'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Current (mA)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mA'])}</p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground/60">Current (kA)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['kA'], 4)}</p>
              </div>
            </>
          )}
          {calculateFor === 'resistance' && (
            <>
              <div>
                <p className="text-foreground/60">Resistance (Ω)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['Ω'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Resistance (kΩ)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['kΩ'], 4)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground/60">Resistance (MΩ)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['MΩ'], 4)}</p>
              </div>
            </>
          )}
          <div className="col-span-2 border-t border-input pt-3">
            <p className="text-foreground/60">Power (P = V × I)</p>
            <p className="text-lg font-semibold text-foreground">{power !== null ? formatNumber(power) : '0.00'} W</p>
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
