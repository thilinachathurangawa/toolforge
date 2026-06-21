'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalculateFor = 'pressure' | 'volume' | 'moles' | 'temperature';

type PressureUnit = 'atm' | 'kPa' | 'mmHg' | 'torr' | 'bar';
type VolumeUnit = 'L' | 'mL' | 'm³';
type TemperatureUnit = 'K' | '°C' | '°F';

const PRESSURE_UNITS: { value: PressureUnit; label: string }[] = [
  { value: 'atm', label: 'atm' },
  { value: 'kPa', label: 'kPa' },
  { value: 'mmHg', label: 'mmHg' },
  { value: 'torr', label: 'torr' },
  { value: 'bar', label: 'bar' },
];

const VOLUME_UNITS: { value: VolumeUnit; label: string }[] = [
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
  { value: 'm³', label: 'm³' },
];

const TEMPERATURE_UNITS: { value: TemperatureUnit; label: string }[] = [
  { value: 'K', label: 'K' },
  { value: '°C', label: '°C' },
  { value: '°F', label: '°F' },
];

const R_ATM = 0.0821; // L·atm/(mol·K)

export function IdealGasLawCalculator() {
  const [calculateFor, setCalculateFor] = useState<CalculateFor>('pressure');
  const [pressure, setPressure] = useState<string>('1');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('atm');
  const [volume, setVolume] = useState<string>('22.4');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('L');
  const [moles, setMoles] = useState<string>('1');
  const [temperature, setTemperature] = useState<string>('273.15');
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('K');
  const [result, setResult] = useState<number | null>(null);
  const [resultsInAllUnits, setResultsInAllUnits] = useState<{ [key: string]: number }>({});
  const [copied, setCopied] = useState(false);

  const convertToAtm = useCallback((value: number, from: PressureUnit): number => {
    switch (from) {
      case 'atm': return value;
      case 'kPa': return value / 101.325;
      case 'mmHg': return value / 760;
      case 'torr': return value / 760;
      case 'bar': return value / 1.01325;
      default: return value;
    }
  }, []);

  const convertToLiters = useCallback((value: number, from: VolumeUnit): number => {
    switch (from) {
      case 'L': return value;
      case 'mL': return value / 1000;
      case 'm³': return value * 1000;
      default: return value;
    }
  }, []);

  const convertToKelvin = useCallback((value: number, from: TemperatureUnit): number => {
    switch (from) {
      case 'K': return value;
      case '°C': return value + 273.15;
      case '°F': return (value - 32) * 5/9 + 273.15;
      default: return value;
    }
  }, []);

  const convertPressureToAllUnits = useCallback((pressureInAtm: number): { [key: string]: number } => {
    return {
      'atm': pressureInAtm,
      'kPa': pressureInAtm * 101.325,
      'mmHg': pressureInAtm * 760,
      'torr': pressureInAtm * 760,
      'bar': pressureInAtm * 1.01325
    };
  }, []);

  const convertVolumeToAllUnits = useCallback((volumeInLiters: number): { [key: string]: number } => {
    return {
      'L': volumeInLiters,
      'mL': volumeInLiters * 1000,
      'm³': volumeInLiters / 1000
    };
  }, []);

  const convertTemperatureToAllUnits = useCallback((temperatureInKelvin: number): { [key: string]: number } => {
    return {
      'K': temperatureInKelvin,
      '°C': temperatureInKelvin - 273.15,
      '°F': (temperatureInKelvin - 273.15) * 9/5 + 32
    };
  }, []);

  const calculate = useCallback(() => {
    const pressureNum = parseFloat(pressure);
    const volumeNum = parseFloat(volume);
    const molesNum = parseFloat(moles);
    const temperatureNum = parseFloat(temperature);

    if (calculateFor === 'pressure') {
      if (isNaN(molesNum) || isNaN(temperatureNum) || isNaN(volumeNum) || molesNum < 0 || temperatureNum <= 0 || volumeNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const volumeInLiters = convertToLiters(volumeNum, volumeUnit);
      const temperatureInKelvin = convertToKelvin(temperatureNum, temperatureUnit);
      const pressureInAtm = (molesNum * R_ATM * temperatureInKelvin) / volumeInLiters;
      setResult(pressureInAtm);
      setResultsInAllUnits(convertPressureToAllUnits(pressureInAtm));
    } else if (calculateFor === 'volume') {
      if (isNaN(pressureNum) || isNaN(molesNum) || isNaN(temperatureNum) || pressureNum <= 0 || molesNum < 0 || temperatureNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const pressureInAtm = convertToAtm(pressureNum, pressureUnit);
      const temperatureInKelvin = convertToKelvin(temperatureNum, temperatureUnit);
      const volumeInLiters = (molesNum * R_ATM * temperatureInKelvin) / pressureInAtm;
      setResult(volumeInLiters);
      setResultsInAllUnits(convertVolumeToAllUnits(volumeInLiters));
    } else if (calculateFor === 'moles') {
      if (isNaN(pressureNum) || isNaN(volumeNum) || isNaN(temperatureNum) || pressureNum <= 0 || volumeNum <= 0 || temperatureNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const pressureInAtm = convertToAtm(pressureNum, pressureUnit);
      const volumeInLiters = convertToLiters(volumeNum, volumeUnit);
      const temperatureInKelvin = convertToKelvin(temperatureNum, temperatureUnit);
      const molesResult = (pressureInAtm * volumeInLiters) / (R_ATM * temperatureInKelvin);
      setResult(molesResult);
      setResultsInAllUnits({ 'mol': molesResult });
    } else if (calculateFor === 'temperature') {
      if (isNaN(pressureNum) || isNaN(volumeNum) || isNaN(molesNum) || pressureNum <= 0 || volumeNum <= 0 || molesNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const pressureInAtm = convertToAtm(pressureNum, pressureUnit);
      const volumeInLiters = convertToLiters(volumeNum, volumeUnit);
      const temperatureInKelvin = (pressureInAtm * volumeInLiters) / (molesNum * R_ATM);
      setResult(temperatureInKelvin);
      setResultsInAllUnits(convertTemperatureToAllUnits(temperatureInKelvin));
    }
  }, [calculateFor, pressure, pressureUnit, volume, volumeUnit, moles, temperature, temperatureUnit, convertToAtm, convertToLiters, convertToKelvin, convertPressureToAllUnits, convertVolumeToAllUnits, convertTemperatureToAllUnits]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      let resultText = '';
      if (calculateFor === 'pressure') {
        resultText = `Pressure: ${resultsInAllUnits['atm']?.toFixed(4)} atm\n${resultsInAllUnits['kPa']?.toFixed(2)} kPa\n${resultsInAllUnits['mmHg']?.toFixed(2)} mmHg\n${resultsInAllUnits['bar']?.toFixed(4)} bar\nVolume: ${volume} ${volumeUnit}\nMoles: ${moles} mol\nTemperature: ${temperature} ${temperatureUnit}`;
      } else if (calculateFor === 'volume') {
        resultText = `Volume: ${resultsInAllUnits['L']?.toFixed(4)} L\n${resultsInAllUnits['mL']?.toFixed(2)} mL\n${resultsInAllUnits['m³']?.toFixed(6)} m³\nPressure: ${pressure} ${pressureUnit}\nMoles: ${moles} mol\nTemperature: ${temperature} ${temperatureUnit}`;
      } else if (calculateFor === 'moles') {
        resultText = `Moles: ${resultsInAllUnits['mol']?.toFixed(4)} mol\nPressure: ${pressure} ${pressureUnit}\nVolume: ${volume} ${volumeUnit}\nTemperature: ${temperature} ${temperatureUnit}`;
      } else if (calculateFor === 'temperature') {
        resultText = `Temperature: ${resultsInAllUnits['K']?.toFixed(4)} K\n${resultsInAllUnits['°C']?.toFixed(2)} °C\n${resultsInAllUnits['°F']?.toFixed(2)} °F\nPressure: ${pressure} ${pressureUnit}\nVolume: ${volume} ${volumeUnit}\nMoles: ${moles} mol`;
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
          <option value="pressure">Pressure (P = nRT/V)</option>
          <option value="volume">Volume (V = nRT/P)</option>
          <option value="moles">Moles (n = PV/RT)</option>
          <option value="temperature">Temperature (T = PV/nR)</option>
        </select>
      </div>

      {/* Pressure */}
      {calculateFor !== 'pressure' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Pressure (P)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={pressure}
              onChange={(e) => setPressure(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="1"
              min="0"
              step="0.01"
            />
            <select
              value={pressureUnit}
              onChange={(e) => setPressureUnit(e.target.value as PressureUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {PRESSURE_UNITS.map((unit) => (
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
              placeholder="22.4"
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

      {/* Moles */}
      {calculateFor !== 'moles' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Moles (n)</label>
          <input
            type="number"
            value={moles}
            onChange={(e) => setMoles(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="1"
            min="0"
            step="0.01"
          />
        </div>
      )}

      {/* Temperature */}
      {calculateFor !== 'temperature' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Temperature (T)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="273.15"
              min="0"
              step="0.01"
            />
            <select
              value={temperatureUnit}
              onChange={(e) => setTemperatureUnit(e.target.value as TemperatureUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {TEMPERATURE_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Gas Constant Info */}
      <div className="bg-muted/30 rounded-lg p-3 text-xs text-foreground/70">
        <p>R = {R_ATM} L·atm/(mol·K)</p>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Wind className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {calculateFor === 'pressure' && (
            <>
              <div>
                <p className="text-foreground/60">Pressure (atm)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['atm'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Pressure (kPa)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['kPa'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Pressure (mmHg)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mmHg'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Pressure (bar)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['bar'], 4)}</p>
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
              <div className="col-span-2">
                <p className="text-foreground/60">Volume (m³)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['m³'], 6)}</p>
              </div>
            </>
          )}
          {calculateFor === 'moles' && (
            <div className="col-span-2">
              <p className="text-foreground/60">Moles (mol)</p>
              <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['mol'], 4)}</p>
            </div>
          )}
          {calculateFor === 'temperature' && (
            <>
              <div>
                <p className="text-foreground/60">Temperature (K)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['K'], 4)}</p>
              </div>
              <div>
                <p className="text-foreground/60">Temperature (°C)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['°C'])}</p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground/60">Temperature (°F)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['°F'])}</p>
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
