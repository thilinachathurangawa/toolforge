'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Square, Plus, Trash2 } from 'lucide-react';

interface Area {
  id: string;
  name: string;
  length: string;
  width: string;
  area: number;
}

export function TileCalculator() {
  const [units, setUnits] = useState<'feet' | 'meters' | 'inches'>('feet');
  const [tileLength, setTileLength] = useState<string>('12');
  const [tileWidth, setTileWidth] = useState<string>('12');
  const [tileSizeUnits, setTileSizeUnits] = useState<'inches' | 'cm'>('inches');
  const [groutWidth, setGroutWidth] = useState<string>('0.25');
  const [wasteFactor, setWasteFactor] = useState<string>('10');
  const [pricePerTile, setPricePerTile] = useState<string>('2.50');
  const [areas, setAreas] = useState<Area[]>([
    { id: '1', name: 'Area 1', length: '10', width: '12', area: 120 },
  ]);
  const [results, setResults] = useState<{
    totalArea: number;
    tileArea: number;
    baseTiles: number;
    tilesWithWaste: number;
    costEstimate: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateArea = useCallback((length: number, width: number): number => {
    return length * width;
  }, []);

  const calculateTileArea = useCallback((length: number, width: number): number => {
    return length * width;
  }, []);

  const calculateResults = useCallback(() => {
    let totalArea = 0;

    areas.forEach(area => {
      const length = parseFloat(area.length) || 0;
      const width = parseFloat(area.width) || 0;
      totalArea += calculateArea(length, width);
    });

    const tileLen = parseFloat(tileLength) || 12;
    const tileWid = parseFloat(tileWidth) || 12;
    const tileArea = calculateTileArea(tileLen, tileWid);

    const baseTiles = Math.ceil(totalArea / tileArea);
    const waste = parseFloat(wasteFactor) || 0;
    const tilesWithWaste = Math.ceil(baseTiles * (1 + waste / 100));

    const price = parseFloat(pricePerTile) || 0;
    const costEstimate = tilesWithWaste * price;

    setResults({
      totalArea,
      tileArea,
      baseTiles,
      tilesWithWaste,
      costEstimate
    });
  }, [areas, tileLength, tileWidth, wasteFactor, pricePerTile, calculateArea, calculateTileArea]);

  React.useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const addArea = () => {
    setAreas([
      ...areas,
      { id: Date.now().toString(), name: `Area ${areas.length + 1}`, length: '10', width: '10', area: 100 }
    ]);
  };

  const removeArea = (id: string) => {
    setAreas(areas.filter(area => area.id !== id));
  };

  const updateArea = (id: string, field: keyof Area, value: string) => {
    setAreas(areas.map(area => 
      area.id === id ? { ...area, [field]: value } : area
    ));
  };

  const handleCopy = () => {
    if (results) {
      const result = `Total Area: ${results.totalArea.toFixed(2)} ${units}\nTiles Needed: ${results.tilesWithWaste}`;
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
          {(['feet', 'meters', 'inches'] as const).map((unit) => (
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

      {/* Tile Size */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Tile Size</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-foreground/60">Length</label>
            <input
              type="number"
              value={tileLength}
              onChange={(e) => setTileLength(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="12"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-foreground/60">Width</label>
            <input
              type="number"
              value={tileWidth}
              onChange={(e) => setTileWidth(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="12"
              min="0"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-foreground/60">Tile Size Units</label>
          <div className="flex gap-2">
            {(['inches', 'cm'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setTileSizeUnits(unit)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  tileSizeUnits === unit
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grout Width */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Grout Width ({tileSizeUnits})</label>
        <input
          type="number"
          value={groutWidth}
          onChange={(e) => setGroutWidth(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="0.25"
          min="0"
          step="0.125"
        />
      </div>

      {/* Waste Factor */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Waste Factor (%)</label>
        <input
          type="number"
          value={wasteFactor}
          onChange={(e) => setWasteFactor(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="10"
          min="0"
          max="20"
        />
      </div>

      {/* Price per Tile */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Price per Tile (optional)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
          <input
            type="number"
            value={pricePerTile}
            onChange={(e) => setPricePerTile(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="2.50"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Areas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Areas</h3>
          <button
            onClick={addArea}
            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Area
          </button>
        </div>

        {areas.map((area) => (
          <div key={area.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-foreground/60">Area Name</label>
                  <input
                    type="text"
                    value={area.name}
                    onChange={(e) => updateArea(area.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60">Length</label>
                    <input
                      type="number"
                      value={area.length}
                      onChange={(e) => updateArea(area.id, 'length', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60">Width</label>
                    <input
                      type="number"
                      value={area.width}
                      onChange={(e) => updateArea(area.id, 'width', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeArea(area.id)}
                className="p-1 text-foreground/50 hover:text-destructive transition-colors"
                title="Remove area"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-foreground/60">
              Area: {calculateArea(parseFloat(area.length) || 0, parseFloat(area.width) || 0).toFixed(2)} {units}
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {results && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Square className="w-4 h-4" />
            Results
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Area:</span>
              <span className="text-foreground">{results.totalArea.toFixed(2)} {units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Tile Size:</span>
              <span className="text-foreground">{tileLength}" × {tileWidth}" ({results.tileArea.toFixed(2)} sq {tileSizeUnits})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Base Tiles:</span>
              <span className="text-foreground">{results.baseTiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Tiles with Waste ({wasteFactor}%):</span>
              <span className="text-foreground font-semibold">{results.tilesWithWaste}</span>
            </div>
          </div>

          {pricePerTile && (
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
