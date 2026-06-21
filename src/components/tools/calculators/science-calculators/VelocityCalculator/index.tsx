'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalculateFor = 'velocity' | 'distance' | 'time';

type DistanceUnit = 'meters' | 'kilometers' | 'miles' | 'feet';
type TimeUnit = 'seconds' | 'minutes' | 'hours';
type VelocityUnit = 'm/s' | 'km/h' | 'mph' | 'ft/s';

const DISTANCE_UNITS: { value: DistanceUnit; label: string }[] = [
  { value: 'meters', label: 'Meters' },
  { value: 'kilometers', label: 'Kilometers' },
  { value: 'miles', label: 'Miles' },
  { value: 'feet', label: 'Feet' },
];

const TIME_UNITS: { value: TimeUnit; label: string }[] = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
];

const VELOCITY_UNITS: { value: VelocityUnit; label: string }[] = [
  { value: 'm/s', label: 'm/s' },
  { value: 'km/h', label: 'km/h' },
  { value: 'mph', label: 'mph' },
  { value: 'ft/s', label: 'ft/s' },
];

export function VelocityCalculator() {
  const [calculateFor, setCalculateFor] = useState<CalculateFor>('velocity');
  const [distance, setDistance] = useState<string>('100');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('meters');
  const [time, setTime] = useState<string>('10');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('seconds');
  const [velocity, setVelocity] = useState<string>('10');
  const [velocityUnit, setVelocityUnit] = useState<VelocityUnit>('m/s');
  const [result, setResult] = useState<number | null>(null);
  const [resultsInAllUnits, setResultsInAllUnits] = useState<{ [key: string]: number }>({});
  const [copied, setCopied] = useState(false);

  const convertToMeters = useCallback((value: number, from: DistanceUnit): number => {
    switch (from) {
      case 'meters': return value;
      case 'kilometers': return value * 1000;
      case 'miles': return value * 1609.34;
      case 'feet': return value * 0.3048;
      default: return value;
    }
  }, []);

  const convertToSeconds = useCallback((value: number, from: TimeUnit): number => {
    switch (from) {
      case 'seconds': return value;
      case 'minutes': return value * 60;
      case 'hours': return value * 3600;
      default: return value;
    }
  }, []);

  const convertVelocityToAllUnits = useCallback((velocityInMetersPerSecond: number): { [key: string]: number } => {
    return {
      'm/s': velocityInMetersPerSecond,
      'km/h': velocityInMetersPerSecond * 3.6,
      'mph': velocityInMetersPerSecond * 2.23694,
      'ft/s': velocityInMetersPerSecond * 3.28084
    };
  }, []);

  const calculate = useCallback(() => {
    const distanceNum = parseFloat(distance);
    const timeNum = parseFloat(time);
    const velocityNum = parseFloat(velocity);

    if (calculateFor === 'velocity') {
      if (isNaN(distanceNum) || isNaN(timeNum) || distanceNum < 0 || timeNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const distanceInMeters = convertToMeters(distanceNum, distanceUnit);
      const timeInSeconds = convertToSeconds(timeNum, timeUnit);
      const velocityInMetersPerSecond = distanceInMeters / timeInSeconds;
      setResult(velocityInMetersPerSecond);
      setResultsInAllUnits(convertVelocityToAllUnits(velocityInMetersPerSecond));
    } else if (calculateFor === 'distance') {
      if (isNaN(velocityNum) || isNaN(timeNum) || velocityNum < 0 || timeNum <= 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const velocityInMetersPerSecond = convertToMetersPerSecond(velocityNum, velocityUnit);
      const timeInSeconds = convertToSeconds(timeNum, timeUnit);
      const distanceInMeters = velocityInMetersPerSecond * timeInSeconds;
      setResult(distanceInMeters);
      setResultsInAllUnits({
        'meters': distanceInMeters,
        'kilometers': distanceInMeters / 1000,
        'miles': distanceInMeters / 1609.34,
        'feet': distanceInMeters / 0.3048
      });
    } else if (calculateFor === 'time') {
      if (isNaN(velocityNum) || isNaN(distanceNum) || velocityNum <= 0 || distanceNum < 0) {
        setResult(null);
        setResultsInAllUnits({});
        return;
      }
      const velocityInMetersPerSecond = convertToMetersPerSecond(velocityNum, velocityUnit);
      const distanceInMeters = convertToMeters(distanceNum, distanceUnit);
      const timeInSeconds = distanceInMeters / velocityInMetersPerSecond;
      setResult(timeInSeconds);
      setResultsInAllUnits({
        'seconds': timeInSeconds,
        'minutes': timeInSeconds / 60,
        'hours': timeInSeconds / 3600
      });
    }
  }, [calculateFor, distance, distanceUnit, time, timeUnit, velocity, velocityUnit, convertToMeters, convertToSeconds, convertVelocityToAllUnits]);

  const convertToMetersPerSecond = useCallback((value: number, from: VelocityUnit): number => {
    switch (from) {
      case 'm/s': return value;
      case 'km/h': return value / 3.6;
      case 'mph': return value / 2.23694;
      case 'ft/s': return value / 3.28084;
      default: return value;
    }
  }, []);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (result !== null) {
      let resultText = '';
      if (calculateFor === 'velocity') {
        resultText = `Velocity: ${resultsInAllUnits['m/s']?.toFixed(2)} m/s\n${resultsInAllUnits['km/h']?.toFixed(2)} km/h\n${resultsInAllUnits['mph']?.toFixed(2)} mph\n${resultsInAllUnits['ft/s']?.toFixed(2)} ft/s`;
      } else if (calculateFor === 'distance') {
        resultText = `Distance: ${resultsInAllUnits['meters']?.toFixed(2)} m\n${resultsInAllUnits['kilometers']?.toFixed(2)} km\n${resultsInAllUnits['miles']?.toFixed(2)} miles\n${resultsInAllUnits['feet']?.toFixed(2)} ft`;
      } else if (calculateFor === 'time') {
        resultText = `Time: ${resultsInAllUnits['seconds']?.toFixed(2)} s\n${resultsInAllUnits['minutes']?.toFixed(2)} min\n${resultsInAllUnits['hours']?.toFixed(2)} h`;
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
          <option value="velocity">Velocity</option>
          <option value="distance">Distance</option>
          <option value="time">Time</option>
        </select>
      </div>

      {/* Distance */}
      {calculateFor !== 'distance' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Distance</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="100"
              min="0"
              step="0.1"
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {DISTANCE_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Time */}
      {calculateFor !== 'time' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Time</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="10"
              min="0"
              step="0.1"
            />
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
              className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {TIME_UNITS.map((unit) => (
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
              placeholder="10"
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

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {calculateFor === 'velocity' && (
            <>
              <div>
                <p className="text-foreground/60">Velocity (m/s)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['m/s'])}</p>
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
          {calculateFor === 'distance' && (
            <>
              <div>
                <p className="text-foreground/60">Distance (m)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['meters'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Distance (km)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['kilometers'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Distance (miles)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['miles'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Distance (ft)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['feet'])}</p>
              </div>
            </>
          )}
          {calculateFor === 'time' && (
            <>
              <div>
                <p className="text-foreground/60">Time (s)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['seconds'])}</p>
              </div>
              <div>
                <p className="text-foreground/60">Time (min)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['minutes'])}</p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground/60">Time (h)</p>
                <p className="text-lg font-semibold text-foreground">{formatNumber(resultsInAllUnits['hours'])}</p>
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
