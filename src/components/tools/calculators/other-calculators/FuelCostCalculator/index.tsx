'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Car, Plus, Trash2 } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  fuelEfficiency: string;
}

export function FuelCostCalculator() {
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial');
  const [distance, setDistance] = useState<string>('250');
  const [roundTrip, setRoundTrip] = useState<boolean>(false);
  const [fuelEfficiency, setFuelEfficiency] = useState<string>('25');
  const [fuelPrice, setFuelPrice] = useState<string>('3.50');
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', name: 'Vehicle 1', fuelEfficiency: '25' },
    { id: '2', name: 'Vehicle 2', fuelEfficiency: '20' },
  ]);
  const [results, setResults] = useState<{
    totalDistance: number;
    fuelNeeded: number;
    totalCost: number;
    costPerMile: number;
    costPerKm: number;
    comparisons: { name: string; cost: number; fuelEfficiency: number }[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateFuelNeeded = useCallback((dist: number, efficiency: number, unit: 'imperial' | 'metric'): number => {
    if (unit === 'imperial') {
      return dist / efficiency;
    } else {
      return (dist * efficiency) / 100;
    }
  }, []);

  const calculateResults = useCallback(() => {
    const dist = parseFloat(distance) || 0;
    const eff = parseFloat(fuelEfficiency) || 0;
    const price = parseFloat(fuelPrice) || 0;
    const actualDistance = roundTrip ? dist * 2 : dist;

    const fuelNeeded = calculateFuelNeeded(actualDistance, eff, units);
    const totalCost = fuelNeeded * price;
    const costPerMile = totalCost / actualDistance;
    const costPerKm = costPerMile * 0.621371;

    const comparisons = vehicles.map(vehicle => {
      const vehicleEff = parseFloat(vehicle.fuelEfficiency) || 0;
      const vehicleFuel = calculateFuelNeeded(actualDistance, vehicleEff, units);
      const vehicleCost = vehicleFuel * price;
      return {
        name: vehicle.name,
        cost: vehicleCost,
        fuelEfficiency: vehicleEff
      };
    }).sort((a, b) => a.cost - b.cost);

    setResults({
      totalDistance: actualDistance,
      fuelNeeded,
      totalCost,
      costPerMile,
      costPerKm,
      comparisons
    });
  }, [distance, roundTrip, fuelEfficiency, fuelPrice, units, vehicles, calculateFuelNeeded]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      { id: Date.now().toString(), name: `Vehicle ${vehicles.length + 1}`, fuelEfficiency: '25' }
    ]);
  };

  const removeVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const updateVehicle = (id: string, field: keyof Vehicle, value: string) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const handleCopy = () => {
    if (results) {
      const result = `Total Distance: ${results.totalDistance} ${units === 'imperial' ? 'miles' : 'km'}\nFuel Needed: ${results.fuelNeeded.toFixed(2)} ${units === 'imperial' ? 'gallons' : 'liters'}\nTotal Cost: $${results.totalCost.toFixed(2)}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Units */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Units</label>
        <div className="flex gap-2">
          {(['imperial', 'metric'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => setUnits(unit)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                units === unit
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {unit === 'imperial' ? 'Imperial (mi, gal)' : 'Metric (km, L)'}
            </button>
          ))}
        </div>
      </div>

      {/* Trip Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Trip Details</h3>
        <div>
          <label className="text-xs text-foreground/60">Distance ({units === 'imperial' ? 'miles' : 'km'})</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="250"
            min="0"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={roundTrip}
            onChange={(e) => setRoundTrip(e.target.checked)}
            className="w-4 h-4 rounded border-input bg-background text-accent focus:ring-accent/20"
          />
          <span className="text-sm text-foreground">Round trip</span>
        </label>
      </div>

      {/* Vehicle Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Vehicle Details</h3>
        <div>
          <label className="text-xs text-foreground/60">Fuel Efficiency ({units === 'imperial' ? 'MPG' : 'L/100km'})</label>
          <input
            type="number"
            value={fuelEfficiency}
            onChange={(e) => setFuelEfficiency(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="25"
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="text-xs text-foreground/60">Fuel Price (per {units === 'imperial' ? 'gallon' : 'liter'})</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
            <input
              type="number"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="3.50"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Comparison */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Vehicle Comparison</h3>
          <button
            onClick={addVehicle}
            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>

        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-muted/30 rounded-lg p-3 flex gap-2 items-center">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={vehicle.name}
                onChange={(e) => updateVehicle(vehicle.id, 'name', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <input
                type="number"
                value={vehicle.fuelEfficiency}
                onChange={(e) => updateVehicle(vehicle.id, 'fuelEfficiency', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="25"
                min="0"
                step="0.1"
              />
            </div>
            <button
              onClick={() => removeVehicle(vehicle.id)}
              className="p-1 text-foreground/50 hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Results */}
      {results && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Car className="w-4 h-4" />
            Results
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Distance:</span>
              <span className="text-foreground">{results.totalDistance} {units === 'imperial' ? 'mi' : 'km'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Fuel Needed:</span>
              <span className="text-foreground">{results.fuelNeeded.toFixed(2)} {units === 'imperial' ? 'gal' : 'L'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Cost:</span>
              <span className="text-foreground font-semibold">{formatCurrency(results.totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Cost per {units === 'imperial' ? 'Mile' : 'Km'}:</span>
              <span className="text-foreground">{formatCurrency(units === 'imperial' ? results.costPerMile : results.costPerKm)}</span>
            </div>
          </div>

          {results.comparisons.length > 1 && (
            <div className="border-t border-foreground/10 pt-3">
              <h4 className="text-xs font-medium text-foreground/60 mb-2">Vehicle Comparison</h4>
              <div className="space-y-1 text-xs">
                {results.comparisons.map((vehicle, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-foreground/60">{vehicle.name}:</span>
                    <span className="text-foreground">{formatCurrency(vehicle.cost)} ({vehicle.fuelEfficiency} {units === 'imperial' ? 'MPG' : 'L/100km'})</span>
                  </div>
                ))}
                {results.comparisons.length > 1 && (
                  <div className="flex justify-between pt-1 border-t border-foreground/10">
                    <span className="text-foreground/60">Savings:</span>
                    <span className="text-foreground font-semibold">{formatCurrency(results.comparisons[results.comparisons.length - 1].cost - results.comparisons[0].cost)}</span>
                  </div>
                )}
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
