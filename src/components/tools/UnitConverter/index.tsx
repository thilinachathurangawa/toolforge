'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'length' | 'weight' | 'temperature' | 'area' | 'speed' | 'volume' | 'time';

interface Unit {
  value: string;
  label: string;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'length', label: 'Length' },
  { value: 'weight', label: 'Weight' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'area', label: 'Area' },
  { value: 'speed', label: 'Speed' },
  { value: 'volume', label: 'Volume' },
  { value: 'time', label: 'Time' },
];

const UNITS: Record<Category, Unit[]> = {
  length: [
    { value: 'meter', label: 'Meter' },
    { value: 'kilometer', label: 'Kilometer' },
    { value: 'centimeter', label: 'Centimeter' },
    { value: 'millimeter', label: 'Millimeter' },
    { value: 'mile', label: 'Mile' },
    { value: 'yard', label: 'Yard' },
    { value: 'foot', label: 'Foot' },
    { value: 'inch', label: 'Inch' },
  ],
  weight: [
    { value: 'kilogram', label: 'Kilogram' },
    { value: 'gram', label: 'Gram' },
    { value: 'milligram', label: 'Milligram' },
    { value: 'pound', label: 'Pound' },
    { value: 'ounce', label: 'Ounce' },
    { value: 'ton', label: 'Ton' },
  ],
  temperature: [
    { value: 'celsius', label: 'Celsius' },
    { value: 'fahrenheit', label: 'Fahrenheit' },
    { value: 'kelvin', label: 'Kelvin' },
  ],
  area: [
    { value: 'square_meter', label: 'Square Meter' },
    { value: 'square_kilometer', label: 'Square Kilometer' },
    { value: 'square_foot', label: 'Square Foot' },
    { value: 'square_yard', label: 'Square Yard' },
    { value: 'acre', label: 'Acre' },
    { value: 'hectare', label: 'Hectare' },
  ],
  speed: [
    { value: 'meter_per_second', label: 'Meter/Second' },
    { value: 'kilometer_per_hour', label: 'Kilometer/Hour' },
    { value: 'mile_per_hour', label: 'Mile/Hour' },
    { value: 'foot_per_second', label: 'Foot/Second' },
    { value: 'knot', label: 'Knot' },
  ],
  volume: [
    { value: 'liter', label: 'Liter' },
    { value: 'milliliter', label: 'Milliliter' },
    { value: 'cubic_meter', label: 'Cubic Meter' },
    { value: 'gallon', label: 'Gallon (US)' },
    { value: 'quart', label: 'Quart (US)' },
    { value: 'cup', label: 'Cup (US)' },
  ],
  time: [
    { value: 'second', label: 'Second' },
    { value: 'minute', label: 'Minute' },
    { value: 'hour', label: 'Hour' },
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ],
};

const COMMON_CONVERSIONS: Record<Category, string[]> = {
  length: ['1 inch = 2.54 cm', '1 km = 0.621 miles', '1 foot = 0.3048 meters'],
  weight: ['1 kg = 2.205 lbs', '1 oz = 28.35 grams', '1 ton = 1000 kg'],
  temperature: ['0°C = 32°F = 273.15K', '100°C = 212°F', '-40°C = -40°F'],
  area: ['1 acre = 43,560 sq ft', '1 hectare = 2.47 acres', '1 sq km = 100 hectares'],
  speed: ['1 mph = 1.609 km/h', '1 knot = 1.852 km/h', '1 m/s = 3.6 km/h'],
  volume: ['1 gallon = 3.785 liters', '1 liter = 1000 ml', '1 cup = 236.6 ml'],
  time: ['1 hour = 3600 seconds', '1 day = 24 hours', '1 year = 365 days'],
};

// Conversion rates to base unit
const CONVERSION_RATES: Record<Category, Record<string, number>> = {
  length: {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
  },
  weight: {
    kilogram: 1,
    gram: 0.001,
    milligram: 0.000001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000,
  },
  area: {
    square_meter: 1,
    square_kilometer: 1000000,
    square_foot: 0.092903,
    square_yard: 0.836127,
    acre: 4046.86,
    hectare: 10000,
  },
  speed: {
    meter_per_second: 1,
    kilometer_per_hour: 0.277778,
    mile_per_hour: 0.44704,
    foot_per_second: 0.3048,
    knot: 0.514444,
  },
  volume: {
    liter: 1,
    milliliter: 0.001,
    cubic_meter: 1000,
    gallon: 3.78541,
    quart: 0.946353,
    cup: 0.236588,
  },
  time: {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000,
    year: 31536000,
  },
  temperature: {}, // Special handling
};

export function UnitConverter() {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('foot');
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState<number | null>(null);
  const [precision, setPrecision] = useState(3);
  const [copied, setCopied] = useState(false);

  const units = UNITS[category];

  // Reset units when category changes
  useEffect(() => {
    const newUnits = UNITS[category];
    setFromUnit(newUnits[0].value);
    setToUnit(newUnits[1]?.value || newUnits[0].value);
    setInputValue('');
    setOutputValue(null);
  }, [category]);

  // Temperature conversion (special handling)
  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number;

    // Convert to Celsius first
    if (from === 'celsius') {
      celsius = value;
    } else if (from === 'fahrenheit') {
      celsius = (value - 32) * (5 / 9);
    } else if (from === 'kelvin') {
      celsius = value - 273.15;
    } else {
      return value;
    }

    // Convert from Celsius to target
    if (to === 'celsius') {
      return celsius;
    } else if (to === 'fahrenheit') {
      return (celsius * 9 / 5) + 32;
    } else if (to === 'kelvin') {
      return celsius + 273.15;
    }
    return celsius;
  };

  // Perform conversion
  const convert = useCallback(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || inputValue === '') {
      setOutputValue(null);
      return;
    }

    let result: number;

    if (category === 'temperature') {
      result = convertTemperature(value, fromUnit, toUnit);
    } else {
      const rates = CONVERSION_RATES[category];
      const fromRate = rates[fromUnit];
      const toRate = rates[toUnit];
      
      // Convert to base unit, then to target unit
      const baseValue = value * fromRate;
      result = baseValue / toRate;
    }

    setOutputValue(result);
  }, [category, fromUnit, toUnit, inputValue]);

  // Auto-convert on input change
  useEffect(() => {
    convert();
  }, [convert]);

  // Swap units
  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Copy result to clipboard
  const handleCopy = () => {
    if (outputValue !== null) {
      const result = `${outputValue.toFixed(precision)} ${UNITS[category].find(u => u.value === toUnit)?.label}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle precision change
  const handlePrecisionChange = (value: number) => {
    setPrecision(Math.max(2, Math.min(6, value)));
  };

  const formattedOutput = outputValue !== null ? outputValue.toFixed(precision) : '';

  return (
    <div className="w-full space-y-6">
      {/* Category Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Unit Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {units.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">To</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {units.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input and Output with Swap */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <button
            onClick={handleSwap}
            className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            title="Swap units"
          >
            <ArrowLeftRight size={20} />
          </button>
          <input
            type="text"
            readOnly
            value={formattedOutput}
            placeholder="Result"
            className="flex-1 px-3 py-2 text-sm bg-muted border border-input rounded-md"
          />
        </div>

        {/* Conversion Formula Display */}
        {outputValue !== null && inputValue && (
          <div className="text-sm text-center text-muted-foreground">
            {inputValue} {units.find(u => u.value === fromUnit)?.label} = {formattedOutput} {units.find(u => u.value === toUnit)?.label}
          </div>
        )}

        {/* Precision Control */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Precision:</label>
          <div className="flex gap-1">
            {[2, 3, 4, 5, 6].map((p) => (
              <button
                key={p}
                onClick={() => handlePrecisionChange(p)}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  precision === p
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={outputValue === null}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
      </div>

      {/* Common Conversions */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h3 className="text-sm font-medium text-foreground">Common Conversions</h3>
        <ul className="space-y-1">
          {COMMON_CONVERSIONS[category].map((conversion, index) => (
            <li key={index} className="text-xs text-muted-foreground">
              • {conversion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
