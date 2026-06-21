'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Thermometer, Wind } from 'lucide-react';

export function WindChillHeatIndexCalculator() {
  const [temperature, setTemperature] = useState<string>('32');
  const [temperatureUnit, setTemperatureUnit] = useState<'F' | 'C'>('F');
  const [windSpeed, setWindSpeed] = useState<string>('15');
  const [humidity, setHumidity] = useState<string>('50');
  const [results, setResults] = useState<{
    windChill: number | null;
    heatIndex: number | null;
    feelsLike: number;
    safetyWarning: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fahrenheitToCelsius = useCallback((f: number): number => {
    return (f - 32) * 5 / 9;
  }, []);

  const celsiusToFahrenheit = useCallback((c: number): number => {
    return (c * 9 / 5) + 32;
  }, []);

  const calculateWindChill = useCallback((tempF: number, windSpeedMph: number): number | null => {
    if (tempF > 50 || windSpeedMph < 3) return null;
    
    const T = tempF;
    const V = windSpeedMph;
    
    return 35.74 + (0.6215 * T) - (35.75 * Math.pow(V, 0.16)) + (0.4275 * T * Math.pow(V, 0.16));
  }, []);

  const calculateHeatIndex = useCallback((tempF: number, humidityPercent: number): number | null => {
    if (tempF < 80 || humidityPercent < 40) return null;
    
    const T = tempF;
    const RH = humidityPercent;
    
    let HI = -42.379 + 2.04901523 * T + 10.14333127 * RH
             - 0.22475541 * T * RH - 0.00683783 * T * T
             - 0.05481717 * RH * RH + 0.00122874 * T * T * RH
             + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    
    if (RH < 13 && T >= 80 && T <= 112) {
      HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (RH > 85 && T >= 80 && T <= 87) {
      HI += ((RH - 85) / 10) * ((87 - T) / 5);
    }
    
    return HI;
  }, []);

  const getWindChillWarning = useCallback((windChillF: number): string => {
    if (windChillF <= -40) return '🔴 Extreme Danger: Exposed skin freezes in minutes';
    if (windChillF <= -30) return '🟠 High Risk: Frostbite possible in 10-30 minutes';
    if (windChillF <= -20) return '🟡 Moderate Risk: Frostbite possible in 30 minutes';
    if (windChillF <= -10) return '🟢 Low Risk: Dress warmly, cover exposed skin';
    return '✅ Safe: Normal cold weather precautions';
  }, []);

  const getHeatIndexWarning = useCallback((heatIndexF: number): string => {
    if (heatIndexF >= 130) return '🔴 Extreme Danger: Heat stroke highly likely';
    if (heatIndexF >= 125) return '🟠 Extreme Danger: Heat stroke likely';
    if (heatIndexF >= 105) return '🟠 Danger: Heat stroke possible';
    if (heatIndexF >= 90) return '🟡 Extreme Caution: Heat exhaustion possible';
    if (heatIndexF >= 80) return '🟢 Caution: Fatigue possible with prolonged exposure';
    return '✅ Safe: Normal summer weather';
  }, []);

  const handleCalculate = useCallback(() => {
    const temp = parseFloat(temperature) || 0;
    const wind = parseFloat(windSpeed) || 0;
    const humid = parseFloat(humidity) || 0;

    let tempF = temperatureUnit === 'C' ? celsiusToFahrenheit(temp) : temp;
    const windMph = wind; // Assuming mph input
    const humidityPercent = humid;

    const windChill = calculateWindChill(tempF, windMph);
    const heatIndex = calculateHeatIndex(tempF, humidityPercent);

    let feelsLike: number;
    let safetyWarning: string;

    if (windChill !== null) {
      feelsLike = windChill;
      safetyWarning = getWindChillWarning(windChill);
    } else if (heatIndex !== null) {
      feelsLike = heatIndex;
      safetyWarning = getHeatIndexWarning(heatIndex);
    } else {
      feelsLike = tempF;
      safetyWarning = '✅ Safe: Normal weather conditions';
    }

    setResults({
      windChill,
      heatIndex,
      feelsLike,
      safetyWarning
    });
  }, [temperature, temperatureUnit, windSpeed, humidity, calculateWindChill, calculateHeatIndex, getWindChillWarning, getHeatIndexWarning, celsiusToFahrenheit]);

  React.useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const handleCopy = () => {
    if (results) {
      const result = `Temperature: ${temperature}°${temperatureUnit}\nFeels Like: ${results.feelsLike.toFixed(1)}°F\n${results.safetyWarning}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Temperature */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Temperature</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            placeholder="32"
          />
          <div className="flex gap-1">
            {(['F', 'C'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setTemperatureUnit(unit)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  temperatureUnit === unit
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                °{unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wind Speed */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Wind className="w-4 h-4" />
          Wind Speed (mph)
        </label>
        <input
          type="number"
          value={windSpeed}
          onChange={(e) => setWindSpeed(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="15"
          min="0"
        />
      </div>

      {/* Humidity */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Relative Humidity (%)</label>
        <input
          type="number"
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="50"
          min="0"
          max="100"
        />
      </div>

      {/* Results */}
      {results && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Results
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Temperature:</span>
              <span className="text-foreground">{temperature}°{temperatureUnit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Feels Like:</span>
              <span className="text-foreground font-semibold">{results.feelsLike.toFixed(1)}°F</span>
            </div>
            {results.windChill !== null && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Wind Chill:</span>
                <span className="text-foreground">{results.windChill.toFixed(1)}°F</span>
              </div>
            )}
            {results.heatIndex !== null && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Heat Index:</span>
                <span className="text-foreground">{results.heatIndex.toFixed(1)}°F</span>
              </div>
            )}
          </div>

          <div className="border-t border-foreground/10 pt-3">
            <div className="text-sm">
              <span className="text-foreground/60">Safety Warning:</span>
              <p className="text-foreground mt-1">{results.safetyWarning}</p>
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
