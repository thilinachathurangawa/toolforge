'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Box } from 'lucide-react';

type Shape = 'sphere' | 'cube' | 'cylinder' | 'rectangularPrism' | 'cone' | 'pyramid';

const SHAPES: { value: Shape; label: string }[] = [
  { value: 'sphere', label: 'Sphere' },
  { value: 'cube', label: 'Cube' },
  { value: 'cylinder', label: 'Cylinder' },
  { value: 'rectangularPrism', label: 'Rectangular Prism' },
  { value: 'cone', label: 'Cone' },
  { value: 'pyramid', label: 'Pyramid (Square Base)' },
];

function VolumeCalculator() {
  const [shape, setShape] = useState<Shape>('sphere');
  const [inputs, setInputs] = useState<Record<string, string>>({
    radius: '5',
    side: '5',
    height: '10',
    length: '10',
    width: '5',
    base: '10',
  });
  const [volume, setVolume] = useState<number | null>(null);
  const [surfaceArea, setSurfaceArea] = useState<number | null>(null);
  const [formula, setFormula] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    let calcVolume: number | null = null;
    let calcSurfaceArea: number | null = null;
    let calcFormula = '';

    switch (shape) {
      case 'sphere': {
        const radius = parseFloat(inputs.radius) || 0;
        calcVolume = (4/3) * Math.PI * Math.pow(radius, 3);
        calcSurfaceArea = 4 * Math.PI * Math.pow(radius, 2);
        calcFormula = `Volume = (4/3) × π × r³ = (4/3) × π × ${radius}³ = ${calcVolume.toFixed(2)}`;
        break;
      }
      case 'cube': {
        const side = parseFloat(inputs.side) || 0;
        calcVolume = Math.pow(side, 3);
        calcSurfaceArea = 6 * Math.pow(side, 2);
        calcFormula = `Volume = s³ = ${side}³ = ${calcVolume}`;
        break;
      }
      case 'cylinder': {
        const radius = parseFloat(inputs.radius) || 0;
        const height = parseFloat(inputs.height) || 0;
        calcVolume = Math.PI * Math.pow(radius, 2) * height;
        calcSurfaceArea = 2 * Math.PI * radius * (radius + height);
        calcFormula = `Volume = π × r² × h = π × ${radius}² × ${height} = ${calcVolume.toFixed(2)}`;
        break;
      }
      case 'rectangularPrism': {
        const length = parseFloat(inputs.length) || 0;
        const width = parseFloat(inputs.width) || 0;
        const height = parseFloat(inputs.height) || 0;
        calcVolume = length * width * height;
        calcSurfaceArea = 2 * (length * width + width * height + height * length);
        calcFormula = `Volume = l × w × h = ${length} × ${width} × ${height} = ${calcVolume}`;
        break;
      }
      case 'cone': {
        const radius = parseFloat(inputs.radius) || 0;
        const height = parseFloat(inputs.height) || 0;
        calcVolume = (1/3) * Math.PI * Math.pow(radius, 2) * height;
        const slantHeight = Math.sqrt(Math.pow(radius, 2) + Math.pow(height, 2));
        calcSurfaceArea = Math.PI * radius * (radius + slantHeight);
        calcFormula = `Volume = (1/3) × π × r² × h = (1/3) × π × ${radius}² × ${height} = ${calcVolume.toFixed(2)}`;
        break;
      }
      case 'pyramid': {
        const base = parseFloat(inputs.base) || 0;
        const height = parseFloat(inputs.height) || 0;
        calcVolume = (1/3) * Math.pow(base, 2) * height;
        const slantHeight = Math.sqrt(Math.pow(base/2, 2) + Math.pow(height, 2));
        calcSurfaceArea = Math.pow(base, 2) + 2 * base * slantHeight;
        calcFormula = `Volume = (1/3) × b² × h = (1/3) × ${base}² × ${height} = ${calcVolume.toFixed(2)}`;
        break;
      }
    }

    setVolume(calcVolume);
    setSurfaceArea(calcSurfaceArea);
    setFormula(calcFormula);
  }, [shape, inputs]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = () => {
    if (volume !== null) {
      const resultText = `Shape: ${shape}\nVolume: ${volume.toFixed(4)} cubic units\nSurface Area: ${surfaceArea !== null ? surfaceArea.toFixed(4) : 'N/A'} square units\n\nFormula: ${formula}`;
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInputs({
      radius: '',
      side: '',
      height: '',
      length: '',
      width: '',
      base: '',
    });
    setVolume(null);
    setSurfaceArea(null);
    setFormula('');
  };

  const getInputFields = () => {
    switch (shape) {
      case 'sphere':
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
      case 'cube':
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
      case 'cylinder':
        return (
          <>
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
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Height</label>
              <input
                type="number"
                value={inputs.height}
                onChange={(e) => setInputs({ ...inputs, height: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="10"
                step="0.01"
              />
            </div>
          </>
        );
      case 'rectangularPrism':
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
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Height</label>
              <input
                type="number"
                value={inputs.height}
                onChange={(e) => setInputs({ ...inputs, height: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="10"
                step="0.01"
              />
            </div>
          </>
        );
      case 'cone':
        return (
          <>
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
            <div className="space-y-1">
              <label className="text-xs text-foreground/60">Height</label>
              <input
                type="number"
                value={inputs.height}
                onChange={(e) => setInputs({ ...inputs, height: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="10"
                step="0.01"
              />
            </div>
          </>
        );
      case 'pyramid':
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
                placeholder="10"
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
      case 'sphere':
        steps.push(`Radius: ${inputs.radius}`);
        steps.push(`r³ = ${inputs.radius} × ${inputs.radius} × ${inputs.radius} = ${Math.pow(parseFloat(inputs.radius) || 0, 3).toFixed(2)}`);
        steps.push(`Volume = (4/3) × π × ${Math.pow(parseFloat(inputs.radius) || 0, 3).toFixed(2)} = ${volume?.toFixed(2) || 0}`);
        steps.push(`r² = ${inputs.radius} × ${inputs.radius} = ${Math.pow(parseFloat(inputs.radius) || 0, 2).toFixed(2)}`);
        steps.push(`Surface Area = 4 × π × ${Math.pow(parseFloat(inputs.radius) || 0, 2).toFixed(2)} = ${surfaceArea?.toFixed(2) || 0}`);
        break;
      case 'cube':
        steps.push(`Side: ${inputs.side}`);
        steps.push(`Volume = ${inputs.side}³ = ${volume?.toFixed(2) || 0}`);
        steps.push(`Surface Area = 6 × ${inputs.side}² = ${surfaceArea?.toFixed(2) || 0}`);
        break;
      case 'cylinder':
        steps.push(`Radius: ${inputs.radius}`);
        steps.push(`Height: ${inputs.height}`);
        steps.push(`r² = ${inputs.radius}² = ${Math.pow(parseFloat(inputs.radius) || 0, 2).toFixed(2)}`);
        steps.push(`Volume = π × ${Math.pow(parseFloat(inputs.radius) || 0, 2).toFixed(2)} × ${inputs.height} = ${volume?.toFixed(2) || 0}`);
        break;
      case 'rectangularPrism':
        steps.push(`Length: ${inputs.length}`);
        steps.push(`Width: ${inputs.width}`);
        steps.push(`Height: ${inputs.height}`);
        steps.push(`Volume = ${inputs.length} × ${inputs.width} × ${inputs.height} = ${volume?.toFixed(2) || 0}`);
        steps.push(`Surface Area = 2 × (${inputs.length}×${inputs.width} + ${inputs.width}×${inputs.height} + ${inputs.height}×${inputs.length}) = ${surfaceArea?.toFixed(2) || 0}`);
        break;
      case 'cone':
        steps.push(`Radius: ${inputs.radius}`);
        steps.push(`Height: ${inputs.height}`);
        steps.push(`r² = ${inputs.radius}² = ${Math.pow(parseFloat(inputs.radius) || 0, 2).toFixed(2)}`);
        steps.push(`Volume = (1/3) × π × ${Math.pow(parseFloat(inputs.radius) || 0, 2).toFixed(2)} × ${inputs.height} = ${volume?.toFixed(2) || 0}`);
        break;
      case 'pyramid':
        steps.push(`Base: ${inputs.base}`);
        steps.push(`Height: ${inputs.height}`);
        steps.push(`b² = ${inputs.base}² = ${Math.pow(parseFloat(inputs.base) || 0, 2).toFixed(2)}`);
        steps.push(`Volume = (1/3) × ${Math.pow(parseFloat(inputs.base) || 0, 2).toFixed(2)} × ${inputs.height} = ${volume?.toFixed(2) || 0}`);
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
          <Box className="w-4 h-4" />
          Results
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60">Volume</p>
            <p className="text-2xl font-semibold text-foreground">
              {volume !== null ? `${volume.toFixed(4)} cubic units` : '—'}
            </p>
          </div>
          <div>
            <p className="text-foreground/60">Surface Area</p>
            <p className="text-2xl font-semibold text-foreground">
              {surfaceArea !== null ? `${surfaceArea.toFixed(4)} sq units` : '—'}
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

export default VolumeCalculator;
