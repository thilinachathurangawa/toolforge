'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

type VelocityUnit = 'm/s' | 'km/h' | 'mph';

const VELOCITY_UNITS: { value: VelocityUnit; label: string }[] = [
  { value: 'm/s', label: 'm/s' },
  { value: 'km/h', label: 'km/h' },
  { value: 'mph', label: 'mph' },
];

const g = 9.81; // acceleration due to gravity (m/s²)

export function ProjectileMotionCalculator() {
  const [initialVelocity, setInitialVelocity] = useState<string>('50');
  const [velocityUnit, setVelocityUnit] = useState<VelocityUnit>('m/s');
  const [launchAngle, setLaunchAngle] = useState<string>('45');
  const [initialHeight, setInitialHeight] = useState<string>('0');
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [timeOfFlight, setTimeOfFlight] = useState<number | null>(null);
  const [horizontalRange, setHorizontalRange] = useState<number | null>(null);
  const [velocityX, setVelocityX] = useState<number | null>(null);
  const [velocityY, setVelocityY] = useState<number | null>(null);
  const [trajectoryEquation, setTrajectoryEquation] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const convertToMetersPerSecond = useCallback((value: number, from: VelocityUnit): number => {
    switch (from) {
      case 'm/s': return value;
      case 'km/h': return value / 3.6;
      case 'mph': return value / 2.23694;
      default: return value;
    }
  }, []);

  const calculate = useCallback(() => {
    const velocityNum = parseFloat(initialVelocity);
    const angleNum = parseFloat(launchAngle);
    const heightNum = parseFloat(initialHeight);

    if (isNaN(velocityNum) || isNaN(angleNum) || isNaN(heightNum) || velocityNum < 0 || angleNum < 0 || angleNum > 90 || heightNum < 0) {
      setMaxHeight(null);
      setTimeOfFlight(null);
      setHorizontalRange(null);
      setVelocityX(null);
      setVelocityY(null);
      setTrajectoryEquation('');
      return;
    }

    const velocityInMetersPerSecond = convertToMetersPerSecond(velocityNum, velocityUnit);
    const angleRad = (angleNum * Math.PI) / 180;
    
    const Vx = velocityInMetersPerSecond * Math.cos(angleRad);
    const Vy = velocityInMetersPerSecond * Math.sin(angleRad);
    
    // Time to reach maximum height
    const t_up = Vy / g;
    
    // Maximum height
    const maxHeightValue = heightNum + (Vy * Vy) / (2 * g);
    
    // Time of flight (when y = 0)
    const discriminant = Math.sqrt(Vy * Vy + 2 * g * heightNum);
    const timeOfFlightValue = (Vy + discriminant) / g;
    
    // Horizontal range
    const horizontalRangeValue = Vx * timeOfFlightValue;
    
    setMaxHeight(maxHeightValue);
    setTimeOfFlight(timeOfFlightValue);
    setHorizontalRange(horizontalRangeValue);
    setVelocityX(Vx);
    setVelocityY(Vy);
    
    // Trajectory equation
    const eq = `y = ${heightNum} + x·tan(${angleNum}°) - (${g}·x²)/(2·${velocityInMetersPerSecond.toFixed(2)}²·cos²(${angleNum}°))`;
    setTrajectoryEquation(eq);
  }, [initialVelocity, velocityUnit, launchAngle, initialHeight, convertToMetersPerSecond]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (maxHeight !== null && timeOfFlight !== null && horizontalRange !== null) {
      const resultText = `Max Height: ${maxHeight.toFixed(2)} m\nTime of Flight: ${timeOfFlight.toFixed(2)} s\nHorizontal Range: ${horizontalRange.toFixed(2)} m\nVelocity X: ${velocityX?.toFixed(2)} m/s\nVelocity Y: ${velocityY?.toFixed(2)} m/s\nTrajectory Equation: ${trajectoryEquation}`;
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
      {/* Initial Velocity */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Initial Velocity</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={initialVelocity}
            onChange={(e) => setInitialVelocity(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="50"
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

      {/* Launch Angle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Launch Angle (degrees)</label>
        <input
          type="number"
          value={launchAngle}
          onChange={(e) => setLaunchAngle(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="45"
          min="0"
          max="90"
          step="0.1"
        />
      </div>

      {/* Initial Height */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Initial Height (meters)</label>
        <input
          type="number"
          value={initialHeight}
          onChange={(e) => setInitialHeight(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="0"
          min="0"
          step="0.1"
        />
        <p className="text-xs text-foreground/50">Default is 0 for ground level</p>
      </div>

      {/* Gravity Info */}
      <div className="bg-muted/30 rounded-lg p-3 text-xs text-foreground/70">
        <p>Gravity (g): {g} m/s² (assumes no air resistance)</p>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4" />
          Results
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Max Height (m)</p>
            <p className="text-lg font-semibold text-foreground">{formatNumber(maxHeight)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Time of Flight (s)</p>
            <p className="text-lg font-semibold text-foreground">{formatNumber(timeOfFlight)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Horizontal Range (m)</p>
            <p className="text-lg font-semibold text-foreground">{formatNumber(horizontalRange)}</p>
          </div>
          <div>
            <p className="text-foreground/60">Velocity X (m/s)</p>
            <p className="text-lg font-semibold text-foreground">{formatNumber(velocityX)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-foreground/60">Velocity Y (m/s)</p>
            <p className="text-lg font-semibold text-foreground">{formatNumber(velocityY)}</p>
          </div>
        </div>

        {trajectoryEquation && (
          <div className="border-t border-input pt-3">
            <p className="text-foreground/60 text-sm">Trajectory Equation</p>
            <p className="text-xs font-mono text-foreground mt-1 break-all">{trajectoryEquation}</p>
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
