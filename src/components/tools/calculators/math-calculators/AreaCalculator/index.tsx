'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Square } from 'lucide-react';

type Shape = 'rectangle' | 'square' | 'circle' | 'triangle' | 'trapezoid' | 'parallelogram' | 'ellipse';

const SHAPES: { value: Shape; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'square', label: 'Square' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'trapezoid', label: 'Trapezoid' },
  { value: 'parallelogram', label: 'Parallelogram' },
  { value: 'ellipse', label: 'Ellipse' },
];

function AreaCalculator() {
  const [shape, setShape] = useState<Shape>('rectangle');
  const [inputs, setInputs] = useState<Record<string, string>>({
    length: '10',
    width: '5',
    side: '5',
    radius: '5',
    base: '10',
    height: '5',
    base1: '10',
    base2: '6',
    side1: '4',
    side2: '4',
    majorAxis: '10',
    minorAxis: '6',
  });
  const [area, setArea] = useState<number | null>(null);
  const [perimeter, setPerimeter] = useState<number | null>(null);
  const [formula, setFormula] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    let calcArea: number | null = null;
    let calcPerimeter: number | null = null;
    let calcFormula = '';

    switch (shape) {
      case 'rectangle': {
        const length = parseFloat(inputs.length) || 0;
        const width = parseFloat(inputs.width) || 0;
        calcArea = length * width;
        calcPerimeter = 2 * (length + width);
        calcFormula = `Area = length × width = ${length} × ${width} = ${calcArea}`;
        break;
      }
      case 'square': {
        const side = parseFloat(inputs.side) || 0;
        calcArea = side * side;
        calcPerimeter = 4 * side;
        calcFormula = `Area = side² = ${side}² = ${calcArea}`;
        break;
      }
      case 'circle': {
        const radius = parseFloat(inputs.radius) || 0;
        calcArea = Math.PI * radius * radius;
        calcPerimeter = 2 * Math.PI * radius;
        calcFormula = `Area = π × r² = π × ${radius}² = ${calcArea.toFixed(2)}`;
        break;
      }
      case 'triangle': {
        const base = parseFloat(inputs.base) || 0;
        const height = parseFloat(inputs.height) || 0;
        calcArea = 0.5 * base * height;
        calcFormula = `Area = 0.5 × base × height = 0.5 × ${base} × ${height} = ${calcArea}`;
        break;
      }
      case 'trapezoid': {
        const base1 = parseFloat(inputs.base1) || 0;
        const base2 = parseFloat(inputs.base2) || 0;
        const height = parseFloat(inputs.height) || 0;
        calcArea = 0.5 * (base1 + base2) * height;
        calcFormula = `Area = 0.5 × (base1 + base2) × height = 0.5 × (${base1} + ${base2}) × ${height} = ${calcArea}`;
        break;
      }
      case 'parallelogram': {
        const base = parseFloat(inputs.base) || 0;
        const height = parseFloat(inputs.height) || 0;
        calcArea = base * height;
        calcFormula = `Area = base × height = ${base} × ${height} = ${calcArea}`;
        break;
      }
      case 'ellipse': {
        const majorAxis = parseFloat(inputs.majorAxis) || 0;
        const minorAxis = parseFloat(inputs.minorAxis) || 0;
        calcArea = Math.PI * majorAxis * minorAxis;
        calcFormula = `Area = π × a × b = π × ${majorAxis} × ${minorAxis} = ${calcArea.toFixed(2)}`;
        break;
      }
    }

    setArea(calcArea);
    setPerimeter(calcPerimeter);
    setFormula(calcFormula);
  }, [shape, inputs]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (area !== null) {
      const perimeterLabel = shape === 'circle' ? 'Circumference' : 'Perimeter';
      const resultText = `Shape: ${shape}\nArea: ${area.toFixed(4)} square units\n${perimeterLabel}: ${perimeter !== null ? perimeter.toFixed(4) : 'N/A'} units\n\nFormula: ${formula}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInputs({
      length: '',
      width: '',
      side: '',
      radius: '',
      base: '',
      height: '',
      base1: '',
      base2: '',
      side1: '',
      side2: '',
      majorAxis: '',
      minorAxis: '',
    });
    setArea(null);
    setPerimeter(null);
    setFormula('');
  };

  const getInputFields = () => {
    switch (shape) {
      case 'rectangle':
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Length</label>
              <input
                type="number"
                value={inputs.length}
                onChange={(e) => setInputs({ ...inputs, length: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="10"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Width</label>
              <input
                type="number"
                value={inputs.width}
                onChange={(e) => setInputs({ ...inputs, width: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="5"
                step="0.01"
              />
            </div>
          </>
        );
      case 'square':
        return (
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">Side</label>
            <input
              type="number"
              value={inputs.side}
              onChange={(e) => setInputs({ ...inputs, side: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="5"
              step="0.01"
            />
          </div>
        );
      case 'circle':
        return (
          <div className="space-y-1">
            <label className="text-xs text-foreground/60">Radius</label>
            <input
              type="number"
              value={inputs.radius}
              onChange={(e) => setInputs({ ...inputs, radius: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="5"
              step="0.01"
            />
          </div>
        );
      case 'triangle':
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Base</label>
              <input
                type="number"
                value={inputs.base}
                onChange={(e) => setInputs({ ...inputs, base: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="10"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Height</label>
              <input
                type="number"
                value={inputs.height}
                onChange={(e) => setInputs({ ...inputs, height: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="5"
                step="0.01"
              />
            </div>
          </>
        );
      case 'trapezoid':
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Base 1</label>
              <input
                type="number"
                value={inputs.base1}
                onChange={(e) => setInputs({ ...inputs, base1: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="10"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Base 2</label>
              <input
                type="number"
                value={inputs.base2}
                onChange={(e) => setInputs({ ...inputs, base2: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="6"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Height</label>
              <input
                type="number"
                value={inputs.height}
                onChange={(e) => setInputs({ ...inputs, height: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="5"
                step="0.01"
              />
            </div>
          </>
        );
      case 'parallelogram':
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Base</label>
              <input
                type="number"
                value={inputs.base}
                onChange={(e) => setInputs({ ...inputs, base: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="10"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Height</label>
              <input
                type="number"
                value={inputs.height}
                onChange={(e) => setInputs({ ...inputs, height: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="5"
                step="0.01"
              />
            </div>
          </>
        );
      case 'ellipse':
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Major Axis (a)</label>
              <input
                type="number"
                value={inputs.majorAxis}
                onChange={(e) => setInputs({ ...inputs, majorAxis: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="10"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Minor Axis (b)</label>
              <input
                type="number"
                value={inputs.minorAxis}
                onChange={(e) => setInputs({ ...inputs, minorAxis: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="6"
                step="0.01"
              />
            </div>
          </>
        );
    }
  };

  const getSteps = () => {
    const steps: string[] = [];
    
    switch (shape) {
      case 'rectangle':
        steps.push(`Length: ${inputs.length}`);
        steps.push(`Width: ${inputs.width}`);
        steps.push(`Area = ${inputs.length} × ${inputs.width} = ${area?.toFixed(2) || 0}`);
        steps.push(`Perimeter = 2 × (${inputs.length} + ${inputs.width}) = ${perimeter?.toFixed(2) || 0}`);
        break;
      case 'square':
        steps.push(`Side: ${inputs.side}`);
        steps.push(`Area = ${inputs.side}² = ${area?.toFixed(2) || 0}`);
        steps.push(`Perimeter = 4 × ${inputs.side} = ${perimeter?.toFixed(2) || 0}`);
        break;
      case 'circle':
        steps.push(`Radius: ${inputs.radius}`);
        steps.push(`Area = π × ${inputs.radius}² = ${area?.toFixed(2) || 0}`);
        steps.push(`Circumference = 2 × π × ${inputs.radius} = ${perimeter?.toFixed(2) || 0}`);
        break;
      case 'triangle':
        steps.push(`Base: ${inputs.base}`);
        steps.push(`Height: ${inputs.height}`);
        steps.push(`Area = 0.5 × ${inputs.base} × ${inputs.height} = ${area?.toFixed(2) || 0}`);
        break;
      case 'trapezoid':
        steps.push(`Base 1: ${inputs.base1}`);
        steps.push(`Base 2: ${inputs.base2}`);
        steps.push(`Height: ${inputs.height}`);
        steps.push(`Area = 0.5 × (${inputs.base1} + ${inputs.base2}) × ${inputs.height} = ${area?.toFixed(2) || 0}`);
        break;
      case 'parallelogram':
        steps.push(`Base: ${inputs.base}`);
        steps.push(`Height: ${inputs.height}`);
        steps.push(`Area = ${inputs.base} × ${inputs.height} = ${area?.toFixed(2) || 0}`);
        break;
      case 'ellipse':
        steps.push(`Major Axis: ${inputs.majorAxis}`);
        steps.push(`Minor Axis: ${inputs.minorAxis}`);
        steps.push(`Area = π × ${inputs.majorAxis} × ${inputs.minorAxis} = ${area?.toFixed(2) || 0}`);
        break;
    }
    
    return steps;
  };

  return (
    <div className="w-full space-y-6">
      {/* Shape Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Shape</label>
        <select
          value={shape}
          onChange={(e) => setShape(e.target.value as Shape)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {SHAPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Input Fields */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {shape.charAt(0).toUpperCase() + shape.slice(1)} Inputs
        </label>
        <div className="grid grid-cols-2 gap-4">{getInputFields()}</div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Square className="w-4 h-4" />
          Results
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Area</p>
            <p className="text-2xl font-semibold text-foreground">
              {area !== null ? `${area.toFixed(4)} sq units` : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">
              {shape === 'circle' ? 'Circumference' : 'Perimeter'}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {perimeter !== null ? `${perimeter.toFixed(4)} units` : '—'}
            </p>
          </div>
        </div>

        {/* Formula */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-1">Formula:</p>
          <p className="text-sm font-mono text-foreground">{formula}</p>
        </div>

        {/* Step-by-step */}
        <div className="pt-3 border-t border-input">
          <p className="text-sm text-foreground/60 mb-2">Step-by-step:</p>
          <ol className="space-y-1 text-sm text-foreground">
            {getSteps().map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-foreground/60">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default AreaCalculator;
