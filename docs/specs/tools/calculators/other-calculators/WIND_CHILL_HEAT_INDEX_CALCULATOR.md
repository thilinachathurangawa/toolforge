# SPEC: Wind Chill / Heat Index Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/WIND_CHILL_HEAT_INDEX_CALCULATOR.md`
**Status:** Pending
**Slug:** `wind-chill-heat-index-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Wind Chill & Heat Index Calculator — NWS Formulas | ToolForge`
- **Description:** `Calculate wind chill and heat index instantly with our free calculator using official NWS formulas. Know how it really feels outside.`
- **Primary Keyword:** wind chill calculator
**Secondary Keywords:** heat index calculator, feels like temperature, wind chill formula, heat index formula

---

## Functional Requirements

- [ ] Temperature input
- [ ] Wind speed input (for wind chill)
- [ ] Relative humidity input (for heat index)
- [ ] Unit selection (Fahrenheit/Celsius)
- [ ] Wind speed unit selection (mph/km/h)
- [ ] Calculate wind chill
- [ ] Calculate heat index
- [ ] Display "feels like" temperature
- [ ] Safety warnings (danger zones)
- [ ] Copy results to clipboard
- [ ] Use NWS (National Weather Service) formulas

---

## Library

No external library needed — use NWS formulas for wind chill and heat index

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Wind Chill / Heat Index Calculator     │
├─────────────────────────────────────────┤
│  Temperature: [32] °F                   │
│                                         │
│  Wind Chill:                            │
│  Wind Speed: [15] mph                   │
│                                         │
│  Heat Index:                            │
│  Relative Humidity: [50]%               │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Temperature: 32°F                      │
│  Feels Like: 24°F (Wind Chill)          │
│                                         │
│  Wind Chill: 24°F                       │
│  Heat Index: N/A                        │
│                                         │
│  Safety Warning:                        │
│  ⚠️ Cold: Risk of hypothermia           │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  temperature: number;
  temperatureUnit: 'F' | 'C';
  windSpeed: number;
  windSpeedUnit: 'mph' | 'km/h';
  humidity: number;
  results: {
    windChill: number | null;
    heatIndex: number | null;
    feelsLike: number;
    safetyWarning: string;
  };
}
```

---

## Formulas

```typescript
// Convert Fahrenheit to Celsius
function fahrenheitToCelsius(fahrenheit: number): number {
  
  return (fahrenheit - 32) * 5 / 9;
}

// Convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius: number): number {
  
  return (celsius * 9 / 5) + 32;
}

// Convert mph to km/h
function mphToKmh(mph: number): number {
  
  return mph * 1.60934;
}

// Convert km/h to mph
function kmhToMph(kmh: number): number {
  
  return kmh / 1.60934;
}

// NWS Wind Chill Formula (valid for T ≤ 50°F and wind ≥ 3 mph)
function calculateWindChill(
  temperatureF: number,
  windSpeedMph: number
): number | null {
  
  // Wind chill only calculated for temperatures ≤ 50°F and wind ≥ 3 mph
  if (temperatureF > 50 || windSpeedMph < 3) {
    return null;
  }
  
  const T = temperatureF;
  const V = windSpeedMph;
  
  // NWS Wind Chill Formula
  const windChill = 35.74 + (0.6215 * T) - (35.75 * Math.pow(V, 0.16)) + (0.4275 * T * Math.pow(V, 0.16));
  
  return windChill;
}

// NWS Heat Index Formula (valid for T ≥ 80°F and humidity ≥ 40%)
function calculateHeatIndex(
  temperatureF: number,
  humidity: number
): number | null {
  
  // Heat index only calculated for temperatures ≥ 80°F and humidity ≥ 40%
  if (temperatureF < 80 || humidity < 40) {
    return null;
  }
  
  const T = temperatureF;
  const RH = humidity;
  
  // Simple heat index formula (Rothfusz regression)
  let HI = -42.379 + 2.04901523 * T + 10.14333127 * RH
           - 0.22475541 * T * RH - 0.00683783 * T * T
           - 0.05481717 * RH * RH + 0.00122874 * T * T * RH
           + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
  
  // Adjustments for specific conditions
  if (RH < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (RH > 85 && T >= 80 && T <= 87) {
    HI += ((RH - 85) / 10) * ((87 - T) / 5);
  }
  
  return HI;
}

// Calculate "feels like" temperature
function calculateFeelsLike(
  temperatureF: number,
  windSpeedMph: number,
  humidity: number
): { feelsLike: number; type: 'windChill' | 'heatIndex' | 'actual' } {
  
  const windChill = calculateWindChill(temperatureF, windSpeedMph);
  const heatIndex = calculateHeatIndex(temperatureF, humidity);
  
  if (windChill !== null) {
    return { feelsLike: windChill, type: 'windChill' };
  } else if (heatIndex !== null) {
    return { feelsLike: heatIndex, type: 'heatIndex' };
  } else {
    return { feelsLike: temperatureF, type: 'actual' };
  }
}

// Get safety warning for wind chill
function getWindChillWarning(windChillF: number): string {
  
  if (windChillF <= -40) {
    return '🔴 Extreme Danger: Exposed skin freezes in minutes';
  } else if (windChillF <= -30) {
    return '🟠 High Risk: Frostbite possible in 10-30 minutes';
  } else if (windChillF <= -20) {
    return '🟡 Moderate Risk: Frostbite possible in 30 minutes';
  } else if (windChillF <= -10) {
    return '🟢 Low Risk: Dress warmly, cover exposed skin';
  } else {
    return '✅ Safe: Normal cold weather precautions';
  }
}

// Get safety warning for heat index
function getHeatIndexWarning(heatIndexF: number): string {
  
  if (heatIndexF >= 130) {
    return '🔴 Extreme Danger: Heat stroke highly likely';
  } else if (heatIndexF >= 125) {
    return '🟠 Extreme Danger: Heat stroke likely';
  } else if (heatIndexF >= 105) {
    return '🟠 Danger: Heat stroke possible';
  } else if (heatIndexF >= 90) {
    return '🟡 Extreme Caution: Heat exhaustion possible';
  } else if (heatIndexF >= 80) {
    return '🟢 Caution: Fatigue possible with prolonged exposure';
  } else {
    return '✅ Safe: Normal summer weather';
  }
}

// Calculate dew point (simplified)
function calculateDewPoint(temperatureF: number, humidity: number): number {
  
  const T = temperatureF;
  const RH = humidity;
  
  // Magnus formula approximation
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * T) / (b + T)) + Math.log(RH / 100);
  const dewPointC = (b * alpha) / (a - alpha);
  
  return celsiusToFahrenheit(dewPointC);
}
```

---

## How to Use Content (for SEO section)

1. Enter the current temperature
2. For wind chill: enter wind speed
3. For heat index: enter relative humidity
4. Select units (Fahrenheit/Celsius, mph/km/h)
5. Click calculate to see wind chill and/or heat index
6. View the "feels like" temperature
7. Check safety warnings for dangerous conditions

---

## About Content (for SEO section)

Our free wind chill and heat index calculator helps you understand how the weather really feels outside. Using official National Weather Service (NWS) formulas, calculate wind chill for cold conditions and heat index for hot, humid conditions. Enter temperature, wind speed, and humidity to see the "feels like" temperature along with safety warnings for dangerous conditions. Wind chill is calculated for temperatures below 50°F with wind above 3 mph. Heat index is calculated for temperatures above 80°F with humidity above 40%. Perfect for outdoor activities, travel planning, or weather awareness. All calculations happen in your browser with complete privacy and instant results.
