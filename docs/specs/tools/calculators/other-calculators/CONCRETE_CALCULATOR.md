# SPEC: Concrete Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/CONCRETE_CALCULATOR.md`
**Status:** Pending
**Slug:** `concrete-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Concrete Calculator — Estimate Concrete Volume & Bags | ToolForge`
- **Description:** `Calculate concrete volume instantly with our free concrete calculator. Estimate bags of concrete needed for slabs, footings, columns, and more.`
- **Primary Keyword:** concrete calculator
- **Secondary Keywords:** concrete volume calculator, concrete bags calculator, cement calculator, concrete estimator

---

## Functional Requirements

- [ ] Shape selection (slab, footing, column, tube, stairs)
- [ ] Dimensions input based on shape
- [ ] Multiple shapes support
- [ ] Add/remove shapes
- [ ] Unit selection (feet, meters, yards)
- [ ] Volume calculation
- [ ] Bag estimation (40lb, 60lb, 80lb bags)
- [ ] Cost estimation
- [ ] Waste factor (5-10%)
- [ ] Copy results to clipboard
- [ ] No external library needed

---

## Library

No external library needed — use built-in volume calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Concrete Calculator                    │
├─────────────────────────────────────────┤
│  Units: [Feet ▼]                         │
│  Bag Size: [80lb ▼]                      │
│  Waste Factor: [5%]                      │
│                                         │
│  Shape 1: Slab                          │
│  Length: [20]  Width: [10]  Depth: [0.5]│
│  Volume: 100 cu ft                      │
│                                         │
│  Shape 2: Footing                       │
│  Length: [30] Width: [2] Depth: [1]     │
│  Volume: 60 cu ft                       │
│                                         │
│  [+ Add Shape]                          │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Total Volume: 160 cu ft                │
│  Volume in Yards: 5.93 cu yd            │
│                                         │
│  Bags Needed:                           │
│  80lb bags: 30                          │
│  60lb bags: 40                          │
│  40lb bags: 60                          │
│                                         │
│  Cost Estimate (at $5/bag): $150        │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  units: 'feet' | 'meters' | 'yards';
  bagSize: 40 | 60 | 80;
  wasteFactor: number;
  pricePerBag: number;
  shapes: {
    id: string;
    type: 'slab' | 'footing' | 'column' | 'tube' | 'stairs';
    dimensions: {
      length?: number;
      width?: number;
      depth?: number;
      diameter?: number;
      height?: number;
      radius?: number;
      run?: number;
      rise?: number;
      numberOfSteps?: number;
    };
    volume: number;
  }[];
  results: {
    totalVolume: number;
    volumeInYards: number;
    bagsNeeded: { 40: number; 60: number; 80: number };
    costEstimate: number;
  };
}
```

---

## Formulas

```typescript
// Calculate slab volume
function calculateSlabVolume(length: number, width: number, depth: number): number {
  
  return length * width * depth;
}

// Calculate footing volume
function calculateFootingVolume(length: number, width: number, depth: number): number {
  
  return length * width * depth;
}

// Calculate column volume (rectangular)
function calculateColumnVolume(length: number, width: number, height: number): number {
  
  return length * width * height;
}

// Calculate round column volume (cylindrical)
function calculateRoundColumnVolume(diameter: number, height: number): number {
  
  const radius = diameter / 2;
  return Math.PI * radius * radius * height;
}

// Calculate tube volume (cylindrical hollow)
function calculateTubeVolume(outerDiameter: number, innerDiameter: number, height: number): number {
  
  const outerRadius = outerDiameter / 2;
  const innerRadius = innerDiameter / 2;
  const outerVolume = Math.PI * outerRadius * outerRadius * height;
  const innerVolume = Math.PI * innerRadius * innerRadius * height;
  return outerVolume - innerVolume;
}

// Calculate stairs volume
function calculateStairsVolume(
  run: number,
  rise: number,
  width: number,
  numberOfSteps: number
): number {
  
  const stepVolume = run * rise * width;
  const platformVolume = run * width * rise; // Top platform
  return (stepVolume * numberOfSteps) + platformVolume;
}

// Calculate volume based on shape
function calculateVolume(
  shape: 'slab' | 'footing' | 'column' | 'tube' | 'stairs',
  dimensions: any
): number {
  
  switch (shape) {
    case 'slab':
      return calculateSlabVolume(
        dimensions.length || 0,
        dimensions.width || 0,
        dimensions.depth || 0
      );
    case 'footing':
      return calculateFootingVolume(
        dimensions.length || 0,
        dimensions.width || 0,
        dimensions.depth || 0
      );
    case 'column':
      if (dimensions.diameter) {
        return calculateRoundColumnVolume(
          dimensions.diameter || 0,
          dimensions.height || 0
        );
      }
      return calculateColumnVolume(
        dimensions.length || 0,
        dimensions.width || 0,
        dimensions.height || 0
      );
    case 'tube':
      return calculateTubeVolume(
        dimensions.outerDiameter || 0,
        dimensions.innerDiameter || 0,
        dimensions.height || 0
      );
    case 'stairs':
      return calculateStairsVolume(
        dimensions.run || 0,
        dimensions.rise || 0,
        dimensions.width || 0,
        dimensions.numberOfSteps || 0
      );
    default:
      return 0;
  }
}

// Convert cubic feet to cubic yards
function cubicFeetToCubicYards(cubicFeet: number): number {
  
  return cubicFeet / 27;
}

// Convert cubic meters to cubic yards
function cubicMetersToCubicYards(cubicMeters: number): number {
  
  return cubicMeters * 1.30795;
}

// Calculate bags needed
function calculateBagsNeeded(
  volumeInCubicYards: number,
  bagSize: number,
  wasteFactor: number = 0.05
): number {
  
  // Coverage per bag (in cubic yards)
  const coveragePerBag: { [size: number]: number } = {
    40: 0.011, // 40lb bag covers ~0.011 cu yd
    60: 0.017, // 60lb bag covers ~0.017 cu yd
    80: 0.022  // 80lb bag covers ~0.022 cu yd
  };
  
  const coverage = coveragePerBag[bagSize] || 0.022;
  const volumeWithWaste = volumeInCubicYards * (1 + wasteFactor);
  const bags = volumeWithWaste / coverage;
  
  return Math.ceil(bags);
}

// Calculate bags for all sizes
function calculateAllBagSizes(volumeInCubicYards: number, wasteFactor: number = 0.05): {
  40: number;
  60: number;
  80: number;
} {
  
  return {
    40: calculateBagsNeeded(volumeInCubicYards, 40, wasteFactor),
    60: calculateBagsNeeded(volumeInCubicYards, 60, wasteFactor),
    80: calculateBagsNeeded(volumeInCubicYards, 80, wasteFactor)
  };
}

// Calculate cost estimate
function calculateCostEstimate(bagsNeeded: number, pricePerBag: number): number {
  
  return bagsNeeded * pricePerBag;
}

// Calculate total volume for multiple shapes
function calculateTotalVolume(shapes: { volume: number }[]): number {
  
  return shapes.reduce((total, shape) => total + shape.volume, 0);
}
```

---

## How to Use Content (for SEO section)

1. Select units (feet, meters, or yards)
2. Choose bag size (40lb, 60lb, or 80lb)
3. Set waste factor (typically 5-10%)
4. Add shapes (slab, footing, column, tube, or stairs)
5. Enter dimensions for each shape
6. Add more shapes as needed
7. Click calculate to see total volume and bags needed
8. View cost estimate based on price per bag

---

## About Content (for SEO section)

Our free concrete calculator helps you estimate the amount of concrete needed for any project. Choose from common shapes including slabs, footings, columns, tubes, and stairs. Enter dimensions to instantly calculate the volume in cubic feet or cubic yards. The calculator estimates the number of concrete bags needed (40lb, 60lb, or 80lb) and includes a waste factor to account for spillage and uneven surfaces. Add multiple shapes to calculate the total concrete needed for complex projects. Perfect for DIY projects, construction planning, or estimating material costs. Supports both imperial and metric units. All calculations happen in your browser with complete privacy and instant results.
