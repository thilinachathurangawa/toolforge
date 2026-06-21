'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Square, Plus, Trash2 } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle' | 'triangle';
  length: string;
  width: string;
  radius: string;
  base: string;
  height: string;
  area: number;
}

export function SquareFootageCalculator() {
  const [units, setUnits] = useState<'feet' | 'meters' | 'yards'>('feet');
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Room 1', shape: 'rectangle', length: '12', width: '10', radius: '', base: '', height: '', area: 120 },
  ]);
  const [results, setResults] = useState<{
    totalArea: number;
    totalPerimeter: number;
    materialEstimates: {
      flooring: number;
      paint: number;
    };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateRectangleArea = useCallback((length: number, width: number): number => {
    return length * width;
  }, []);

  const calculateCircleArea = useCallback((radius: number): number => {
    return Math.PI * radius * radius;
  }, []);

  const calculateTriangleArea = useCallback((base: number, height: number): number => {
    return 0.5 * base * height;
  }, []);

  const calculateArea = useCallback((room: Room): number => {
    switch (room.shape) {
      case 'rectangle':
        return calculateRectangleArea(parseFloat(room.length) || 0, parseFloat(room.width) || 0);
      case 'circle':
        return calculateCircleArea(parseFloat(room.radius) || 0);
      case 'triangle':
        return calculateTriangleArea(parseFloat(room.base) || 0, parseFloat(room.height) || 0);
      default:
        return 0;
    }
  }, [calculateRectangleArea, calculateCircleArea, calculateTriangleArea]);

  const calculateResults = useCallback(() => {
    let totalArea = 0;
    let totalPerimeter = 0;

    rooms.forEach(room => {
      const area = calculateArea(room);
      totalArea += area;

      // Simple perimeter calculation (rectangle only for now)
      if (room.shape === 'rectangle') {
        const length = parseFloat(room.length) || 0;
        const width = parseFloat(room.width) || 0;
        totalPerimeter += 2 * (length + width);
      }
    });

    const flooring = totalArea * 1.1; // 10% waste
    const paint = totalArea * 2; // 2 coats

    setResults({
      totalArea,
      totalPerimeter,
      materialEstimates: {
        flooring,
        paint
      }
    });
  }, [rooms, calculateArea]);

  React.useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const addRoom = () => {
    setRooms([
      ...rooms,
      { id: Date.now().toString(), name: `Room ${rooms.length + 1}`, shape: 'rectangle', length: '10', width: '10', radius: '', base: '', height: '', area: 100 }
    ]);
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  const updateRoom = (id: string, field: keyof Room, value: string) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, [field]: value } : room
    ));
  };

  const handleCopy = () => {
    if (results) {
      const result = `Total Area: ${results.totalArea.toFixed(2)} ${units}\nFlooring (10% waste): ${results.materialEstimates.flooring.toFixed(2)} ${units}\nPaint (2 coats): ${results.materialEstimates.paint.toFixed(2)} ${units}`;
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

      {/* Rooms */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Rooms</h3>
          <button
            onClick={addRoom}
            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>

        {rooms.map((room) => (
          <div key={room.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-foreground/60">Room Name</label>
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground/60">Shape</label>
                  <select
                    value={room.shape}
                    onChange={(e) => updateRoom(room.id, 'shape', e.target.value as Room['shape'])}
                    className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>

                {room.shape === 'rectangle' && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Length</label>
                      <input
                        type="number"
                        value={room.length}
                        onChange={(e) => updateRoom(room.id, 'length', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Width</label>
                      <input
                        type="number"
                        value={room.width}
                        onChange={(e) => updateRoom(room.id, 'width', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {room.shape === 'circle' && (
                  <div>
                    <label className="text-xs text-foreground/60">Radius</label>
                    <input
                      type="number"
                      value={room.radius}
                      onChange={(e) => updateRoom(room.id, 'radius', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      min="0"
                    />
                  </div>
                )}

                {room.shape === 'triangle' && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Base</label>
                      <input
                        type="number"
                        value={room.base}
                        onChange={(e) => updateRoom(room.id, 'base', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-foreground/60">Height</label>
                      <input
                        type="number"
                        value={room.height}
                        onChange={(e) => updateRoom(room.id, 'height', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeRoom(room.id)}
                className="p-1 text-foreground/50 hover:text-destructive transition-colors"
                title="Remove room"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-foreground/60">
              Area: {calculateArea(room).toFixed(2)} {units}
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
              <span className="text-foreground font-semibold">{results.totalArea.toFixed(2)} {units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Perimeter:</span>
              <span className="text-foreground">{results.totalPerimeter.toFixed(2)} {units}</span>
            </div>
          </div>

          <div className="border-t border-foreground/10 pt-3">
            <h4 className="text-xs font-medium text-foreground/60 mb-2">Material Estimates</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/60">Flooring (10% waste):</span>
                <span className="text-foreground">{results.materialEstimates.flooring.toFixed(2)} {units}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Paint (2 coats):</span>
                <span className="text-foreground">{results.materialEstimates.paint.toFixed(2)} {units}</span>
              </div>
            </div>
          </div>

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
