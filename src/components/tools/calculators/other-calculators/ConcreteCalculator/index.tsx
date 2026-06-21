'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Construction, Plus, Trash2 } from 'lucide-react';

interface Shape {
  id: string;
  type: 'slab' | 'footing' | 'column' | 'tube';
  dimensions: {
    length?: string;
    width?: string;
    depth?: string;
    diameter?: string;
    height?: string;
    outerDiameter?: string;
    innerDiameter?: string;
  };
  volume: number;
}

export function ConcreteCalculator() {
  const [units, setUnits] = useState<'feet' | 'meters' | 'yards'>('feet');
  const [bagSize, setBagSize] = useState<40 | 60 | 80>(80);
  const [wasteFactor, setWasteFactor] = useState<string>('5');
  const [pricePerBag, setPricePerBag] = useState<string>('5');
  const [shapes, setShapes] = useState<Shape[]>([
    { id: '1', type: 'slab', dimensions: { length: '20', width: '10', depth: '0.5' }, volume: 100 },
  ]);
  const [results, setResults] = useState<{
    totalVolume: number;
    volumeInYards: number;
    bagsNeeded: { 40: number; 60: number; 80: number };
    costEstimate: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateSlabVolume = useCallback((length: number, width: number, depth: number): number => {
    return length * width * depth;
  }, []);

  const calculateFootingVolume = useCallback((length: number, width: number, depth: number): number => {
    return length * width * depth;
  }, []);

  const calculateColumnVolume = useCallback((diameter: number, height: number): number => {
    const radius = diameter / 2;
    return Math.PI * radius * radius * height;
  }, []);

  const calculateTubeVolume = useCallback((outerDiameter: number, innerDiameter: number, height: number): number => {
    const outerRadius = outerDiameter / 2;
    const innerRadius = innerDiameter / 2;
    const outerVolume = Math.PI * outerRadius * outerRadius * height;
    const innerVolume = Math.PI * innerRadius * innerRadius * height;
    return outerVolume - innerVolume;
  }, []);

  const calculateVolume = useCallback((shape: Shape): number => {
    const dims = shape.dimensions;
    switch (shape.type) {
      case 'slab':
        return calculateSlabVolume(parseFloat(dims.length || '0'), parseFloat(dims.width || '0'), parseFloat(dims.depth || '0'));
      case 'footing':
        return calculateFootingVolume(parseFloat(dims.length || '0'), parseFloat(dims.width || '0'), parseFloat(dims.depth || '0'));
      case 'column':
        return calculateColumnVolume(parseFloat(dims.diameter || '0'), parseFloat(dims.height || '0'));
      case 'tube':
        return calculateTubeVolume(parseFloat(dims.outerDiameter || '0'), parseFloat(dims.innerDiameter || '0'), parseFloat(dims.height || '0'));
      default:
        return 0;
    }
  }, [calculateSlabVolume, calculateFootingVolume, calculateColumnVolume, calculateTubeVolume]);

  const calculateResults = useCallback(() => {
    let totalVolume = 0;

    shapes.forEach(shape => {
      totalVolume += calculateVolume(shape);
    });

    const volumeInYards = units === 'feet' ? totalVolume / 27 : totalVolume * 1.30795;
    const waste = parseFloat(wasteFactor) || 0;
    const volumeWithWaste = volumeInYards * (1 + waste / 100);

    const coveragePerBag: { [size: number]: number } = {
      40: 0.011,
      60: 0.017,
      80: 0.022
    };

    const bagsNeeded = {
      40: Math.ceil(volumeWithWaste / coveragePerBag[40]),
      60: Math.ceil(volumeWithWaste / coveragePerBag[60]),
      80: Math.ceil(volumeWithWaste / coveragePerBag[80])
    };

    const price = parseFloat(pricePerBag) || 0;
    const costEstimate = bagsNeeded[bagSize] * price;

    setResults({
      totalVolume,
      volumeInYards,
      bagsNeeded,
      costEstimate
    });
  }, [shapes, units, wasteFactor, pricePerBag, bagSize, calculateVolume]);

  React.useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const addShape = () => {
    setShapes([
      ...shapes,
      { id: Date.now().toString(), type: 'slab', dimensions: { length: '10', width: '10', depth: '0.5' }, volume: 50 }
    ]);
  };

  const removeShape = (id: string) => {
    setShapes(shapes.filter(shape => shape.id !== id));
  };

  const updateShape = (id: string, field: keyof Shape, value: string | Shape['type']) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, [field]: value } : shape
    ));
  };

  const updateDimension = (id: string, field: string, value: string) => {
    setShapes(shapes.map(shape => 
      shape.id === id ? { ...shape, dimensions: { ...shape.dimensions, [field]: value } } : shape
    ));
  };

  const handleCopy = () => {
    if (results) {
      const result = `Total Volume: ${results.totalVolume.toFixed(2)} ${units}\nVolume in Yards: ${results.volumeInYards.toFixed(2)} cu yd\n${bagSize}lb bags needed: ${results.bagsNeeded[bagSize]}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Units */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Units</label>
        <div className="flex gap-2">
          {(['feet', 'meters', 'yards'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => setUnits(unit)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                units === unit
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {unit.charAt(0).toUpperCase() + unit.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bag Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Bag Size (lb)</label>
        <div className="flex gap-2">
          {([40, 60, 80] as const).map((size) => (
            <button
              key={size}
              onClick={() => setBagSize(size)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                bagSize === size
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {size}lb
            </button>
          ))}
        </div>
      </div>

      {/* Waste Factor */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Waste Factor (%)</label>
        <input
          type="number"
          value={wasteFactor}
          onChange={(e) => setWasteFactor(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="5"
          min="0"
          max="20"
        />
      </div>

      {/* Price per Bag */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Price per Bag (optional)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={pricePerBag}
            onChange={(e) => setPricePerBag(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="5.00"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Shapes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Shapes</h3>
          <button
            onClick={addShape}
            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Shape
          </button>
        </div>

        {shapes.map((shape) => (
          <div key={shape.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-foreground/60">Shape Type</label>
                  <select
                    value={shape.type}
                    onChange={(e) => updateShape(shape.id, 'type', e.target.value as Shape['type'])}
                    className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="slab">Slab</option>
                    <option value="footing">Footing</option>
                    <option value="column">Column (Round)</option>
                    <option value="tube">Tube (Round)</option>
                  </select>
                </div>

                {shape.type === 'slab' || shape.type === 'footing' ? (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Length</label>
                      <input
                        type="number"
                        value={shape.dimensions.length}
                        onChange={(e) => updateDimension(shape.id, 'length', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Width</label>
                      <input
                        type="number"
                        value={shape.dimensions.width}
                        onChange={(e) => updateDimension(shape.id, 'width', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Depth</label>
                      <input
                        type="number"
                        value={shape.dimensions.depth}
                        onChange={(e) => updateDimension(shape.id, 'depth', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                  </div>
                ) : shape.type === 'column' ? (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Diameter</label>
                      <input
                        type="number"
                        value={shape.dimensions.diameter}
                        onChange={(e) => updateDimension(shape.id, 'diameter', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Height</label>
                      <input
                        type="number"
                        value={shape.dimensions.height}
                        onChange={(e) => updateDimension(shape.id, 'height', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                  </div>
                ) : shape.type === 'tube' ? (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Outer Diameter</label>
                      <input
                        type="number"
                        value={shape.dimensions.outerDiameter}
                        onChange={(e) => updateDimension(shape.id, 'outerDiameter', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Inner Diameter</label>
                      <input
                        type="number"
                        value={shape.dimensions.innerDiameter}
                        onChange={(e) => updateDimension(shape.id, 'innerDiameter', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Height</label>
                      <input
                        type="number"
                        value={shape.dimensions.height}
                        onChange={(e) => updateDimension(shape.id, 'height', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => removeShape(shape.id)}
                className="p-1 text-foreground/50 hover:text-destructive transition-colors"
                title="Remove shape"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-foreground/60">
              Volume: {calculateVolume(shape).toFixed(2)} {units}
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {results && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Construction className="w-4 h-4" />
            Results
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Volume:</span>
              <span className="text-foreground">{results.totalVolume.toFixed(2)} {units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Volume in Yards:</span>
              <span className="text-foreground font-semibold">{results.volumeInYards.toFixed(2)} cu yd</span>
            </div>
          </div>

          <div className="border-t border-foreground/10 pt-3">
            <h4 className="text-xs font-medium text-foreground/60 mb-2">Bags Needed</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/60">40lb bags:</span>
                <span className="text-foreground">{results.bagsNeeded[40]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">60lb bags:</span>
                <span className="text-foreground">{results.bagsNeeded[60]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">80lb bags:</span>
                <span className="text-foreground font-semibold">{results.bagsNeeded[80]}</span>
              </div>
            </div>
          </div>

          {pricePerBag && (
            <div className="border-t border-foreground/10 pt-3">
              <div className="flex justify-between">
                <span className="text-foreground/60">Cost Estimate:</span>
                <span className="text-foreground font-semibold">${results.costEstimate.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="w-full mt-3 px-3 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Results'}
          </button>
        </div>
      )}
    </div>
  );
}
