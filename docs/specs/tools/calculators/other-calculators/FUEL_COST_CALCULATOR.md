# SPEC: Fuel Cost Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/FUEL_COST_CALCULATOR.md`
**Status:** Pending
**Slug:** `fuel-cost-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Fuel Cost Calculator — Calculate Gas & Trip Cost | ToolForge`
- **Description:** `Calculate fuel costs for your trip with our free fuel cost calculator. Estimate gas costs based on MPG, price per gallon, and distance.`
- **Primary Keyword:** fuel cost calculator
- **Secondary Keywords:** gas cost calculator, trip cost calculator, mpg calculator, fuel efficiency calculator

---

## Functional Requirements

- [ ] Distance input (miles or km)
- [ ] Fuel efficiency input (MPG or L/100km)
- [ ] Fuel price input (per gallon or per liter)
- [ ] Unit conversion (imperial/metric)
- [ ] Round trip calculation
- [ ] Multiple vehicles comparison
- [ ] Total cost calculation
- [ ] Fuel consumption estimate
- [ ] Copy results to clipboard
- [ ] No external library needed

---

## Library

No external library needed — use built-in fuel cost calculation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Fuel Cost Calculator                   │
├─────────────────────────────────────────┤
│  Units: [Imperial (mi, gal)] [Metric (km, L)] │
│                                         │
│  Trip Details:                          │
│  Distance: [250] miles                  │
│  [ ] Round trip                          │
│                                         │
│  Vehicle Details:                        │
│  Fuel Efficiency: [25] MPG              │
│  Fuel Price: [$3.50] per gallon         │
│                                         │
│  [Calculate Cost]                       │
├─────────────────────────────────────────┤
│  Results:                               │
│  Total Distance: 250 miles              │
│  Fuel Needed: 10.00 gallons             │
│  Total Cost: $35.00                     │
│  Cost per Mile: $0.14                   │
│                                         │
│  Comparison:                            │
│  Vehicle 1: $35.00 (25 MPG)            │
│  Vehicle 2: $43.75 (20 MPG)             │
│  Savings: $8.75                         │
│                                         │
│  [Add Vehicle] [Copy Results]           │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  units: 'imperial' | 'metric';
  distance: number;
  roundTrip: boolean;
  fuelEfficiency: number;
  fuelPrice: number;
  vehicles: {
    name: string;
    fuelEfficiency: number;
  }[];
  results: {
    totalDistance: number;
    fuelNeeded: number;
    totalCost: number;
    costPerMile: number;
    costPerKm: number;
  };
}
```

---

## Formulas

```typescript
// Calculate fuel needed
function calculateFuelNeeded(
  distance: number,
  fuelEfficiency: number,
  units: 'imperial' | 'metric'
): number {
  
  if (units === 'imperial') {
    // Distance in miles, efficiency in MPG
    return distance / fuelEfficiency;
  } else {
    // Distance in km, efficiency in L/100km
    return (distance * fuelEfficiency) / 100;
  }
}

// Calculate total fuel cost
function calculateFuelCost(
  fuelNeeded: number,
  fuelPrice: number
): number {
  
  return fuelNeeded * fuelPrice;
}

// Calculate cost per distance unit
function calculateCostPerDistance(
  totalCost: number,
  distance: number,
  units: 'imperial' | 'metric'
): { costPerMile: number; costPerKm: number } {
  
  const costPerMile = totalCost / distance;
  const costPerKm = costPerMile * 0.621371; // Convert to km
  
  return { costPerMile, costPerKm };
}

// Convert MPG to L/100km
function mpgToLPer100km(mpg: number): number {
  return 235.215 / mpg;
}

// Convert L/100km to MPG
function lPer100kmToMPG(lPer100km: number): number {
  return 235.215 / lPer100km;
}

// Convert miles to kilometers
function milesToKm(miles: number): number {
  return miles * 1.60934;
}

// Convert kilometers to miles
function kmToMiles(km: number): number {
  return km / 1.60934;
}

// Convert gallons to liters
function gallonsToLiters(gallons: number): number {
  return gallons * 3.78541;
}

// Convert liters to gallons
function litersToGallons(liters: number): number {
  return liters / 3.78541;
}

// Calculate trip cost with multiple vehicles
function compareVehicleCosts(
  distance: number,
  vehicles: { name: string; fuelEfficiency: number }[],
  fuelPrice: number,
  units: 'imperial' | 'metric'
): { name: string; cost: number; fuelEfficiency: number }[] {
  
  return vehicles.map(vehicle => {
    const fuelNeeded = calculateFuelNeeded(distance, vehicle.fuelEfficiency, units);
    const cost = calculateFuelCost(fuelNeeded, fuelPrice);
    
    return {
      name: vehicle.name,
      cost,
      fuelEfficiency: vehicle.fuelEfficiency
    };
  }).sort((a, b) => a.cost - b.cost);
}

// Calculate savings between vehicles
function calculateSavings(
  cost1: number,
  cost2: number
): { savings: number; percentage: number } {
  
  const savings = Math.abs(cost1 - cost2);
  const higherCost = Math.max(cost1, cost2);
  const percentage = (savings / higherCost) * 100;
  
  return { savings, percentage };
}

// Calculate annual fuel cost
function calculateAnnualFuelCost(
  dailyDistance: number,
  fuelEfficiency: number,
  fuelPrice: number,
  daysPerYear: number = 365,
  units: 'imperial' | 'metric'
): number {
  
  const annualDistance = dailyDistance * daysPerYear;
  const fuelNeeded = calculateFuelNeeded(annualDistance, fuelEfficiency, units);
  return calculateFuelCost(fuelNeeded, fuelPrice);
}

// Calculate carbon footprint (simplified)
function calculateCarbonFootprint(
  fuelNeeded: number,
  units: 'imperial' | 'metric'
): number {
  
  // CO2 emissions: ~8.89 kg CO2 per gallon of gasoline
  // ~2.31 kg CO2 per liter of gasoline
  const co2PerGallon = 8.89;
  const co2PerLiter = 2.31;
  
  if (units === 'imperial') {
    return fuelNeeded * co2PerGallon;
  } else {
    return fuelNeeded * co2PerLiter;
  }
}
```

---

## How to Use Content (for SEO section)

1. Choose units (imperial or metric)
2. Enter trip distance
3. Select round trip if applicable
4. Enter vehicle fuel efficiency (MPG or L/100km)
5. Enter current fuel price
6. Click calculate to see fuel cost and consumption
7. Add multiple vehicles to compare costs

---

## About Content (for SEO section)

Our free fuel cost calculator helps you estimate gas costs for any trip. Enter the distance, your vehicle's fuel efficiency (MPG or L/100km), and current fuel prices to instantly calculate the total fuel cost. The calculator shows fuel needed, cost per mile, and can compare costs between multiple vehicles. Supports both imperial (miles, gallons) and metric (kilometers, liters) units. Perfect for road trip planning, budgeting for commuting, or comparing vehicle efficiency. You can also calculate annual fuel costs and estimate carbon footprint. All calculations happen in your browser with complete privacy and instant results.
