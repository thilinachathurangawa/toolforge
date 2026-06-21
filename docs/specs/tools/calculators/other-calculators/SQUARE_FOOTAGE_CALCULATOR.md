# SPEC: Square Footage Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/SQUARE_FOOTAGE_CALCULATOR.md`
**Status:** Pending
**Slug:** `square-footage-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Square Footage Calculator — Calculate Area & Total Square Feet | ToolForge`
- **Description:** `Calculate square footage instantly with our free square footage calculator. Measure room area, calculate total square feet, and estimate materials.`
- **Primary Keyword:** square footage calculator
- **Secondary Keywords:** area calculator, square feet calculator, room size calculator, flooring calculator

---

## Functional Requirements

- [ ] Room dimensions input (length, width)
- [ ] Multiple rooms support
- [ ] Add/remove rooms
- [ ] Shape selection (rectangle, circle, triangle)
- [ ] Unit selection (feet, meters, yards)
- [ ] Total area calculation
- [ ] Perimeter calculation
- [ ] Material estimation (flooring, paint, etc.)
- [ ] Copy results to clipboard
- [ ] No external library needed

---

## Library

No external library needed — use built-in area calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Square Footage Calculator              │
├─────────────────────────────────────────┤
│  Units: [Feet ▼]                         │
│                                         │
│  Room 1:                                │
│  Shape: [Rectangle ▼]                   │
│  Length: [12]  Width: [10]              │
│  Area: 120 sq ft                        │
│                                         │
│  Room 2:                                │
│  Shape: [Rectangle ▼]                   │
│  Length: [15]  Width: [12]              │
│  Area: 180 sq ft                        │
│                                         │
│  [+ Add Room]                           │
│                                         │
│  [Calculate Total]                      │
├─────────────────────────────────────────┤
│  Results:                               │
│  Total Area: 300 sq ft                  │
│  Total Perimeter: 98 ft                  │
│                                         │
│  Material Estimates:                    │
│  Flooring (10% waste): 330 sq ft       │
│  Paint (2 coats): 600 sq ft             │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  units: 'feet' | 'meters' | 'yards';
  rooms: {
    id: string;
    name: string;
    shape: 'rectangle' | 'circle' | 'triangle';
    dimensions: {
      length?: number;
      width?: number;
      radius?: number;
      base?: number;
      height?: number;
    };
    area: number;
    perimeter: number;
  }[];
  results: {
    totalArea: number;
    totalPerimeter: number;
    materialEstimates: {
      flooring: number;
      paint: number;
    };
  };
}
```

---

## Formulas

```typescript
// Calculate rectangle area
function calculateRectangleArea(length: number, width: number): number {
  
  return length * width;
}

// Calculate rectangle perimeter
function calculateRectanglePerimeter(length: number, width: number): number {
  
  return 2 * (length + width);
}

// Calculate circle area
function calculateCircleArea(radius: number): number {
  
  return Math.PI * radius * radius;
}

// Calculate circle perimeter (circumference)
function calculateCirclePerimeter(radius: number): number {
  
  return 2 * Math.PI * radius;
}

// Calculate triangle area
function calculateTriangleArea(base: number, height: number): number {
  
  return 0.5 * base * height;
}

// Calculate triangle perimeter
function calculateTrianglePerimeter(side1: number, side2: number, side3: number): number {
  
  return side1 + side2 + side3;
}

// Calculate area based on shape
function calculateArea(
  shape: 'rectangle' | 'circle' | 'triangle',
  dimensions: { length?: number; width?: number; radius?: number; base?: number; height?: number }
): number {
  
  switch (shape) {
    case 'rectangle':
      return calculateRectangleArea(dimensions.length || 0, dimensions.width || 0);
    case 'circle':
      return calculateCircleArea(dimensions.radius || 0);
    case 'triangle':
      return calculateTriangleArea(dimensions.base || 0, dimensions.height || 0);
    default:
      return 0;
  }
}

// Calculate perimeter based on shape
function calculatePerimeter(
  shape: 'rectangle' | 'circle' | 'triangle',
  dimensions: { length?: number; width?: number; radius?: number; side1?: number; side2?: number; side3?: number }
): number {
  
  switch (shape) {
    case 'rectangle':
      return calculateRectanglePerimeter(dimensions.length || 0, dimensions.width || 0);
    case 'circle':
      return calculateCirclePerimeter(dimensions.radius || 0);
    case 'triangle':
      return calculateTrianglePerimeter(
        dimensions.side1 || 0,
        dimensions.side2 || 0,
        dimensions.side3 || 0
      );
    default:
      return 0;
  }
}

// Convert between units
function convertArea(
  area: number,
  from: 'feet' | 'meters' | 'yards',
  to: 'feet' | 'meters' | 'yards'
): number {
  
  const toSquareFeet = {
    feet: (v: number) => v,
    meters: (v: number) => v * 10.764, // 1 sq m = 10.764 sq ft
    yards: (v: number) => v * 9 // 1 sq yd = 9 sq ft
  };
  
  const fromSquareFeet = {
    feet: (v: number) => v,
    meters: (v: number) => v / 10.764,
    yards: (v: number) => v / 9
  };
  
  const inSquareFeet = toSquareFeet[from](area);
  return fromSquareFeet[to](inSquareFeet);
}

// Calculate total area for multiple rooms
function calculateTotalArea(rooms: { area: number }[]): number {
  
  return rooms.reduce((total, room) => total + room.area, 0);
}

// Calculate total perimeter for multiple rooms
function calculateTotalPerimeter(rooms: { perimeter: number }[]): number {
  
  return rooms.reduce((total, room) => total + room.perimeter, 0);
}

// Estimate flooring material (with waste percentage)
function estimateFlooringMaterial(totalArea: number, wastePercentage: number = 10): number {
  
  return totalArea * (1 + wastePercentage / 100);
}

// Estimate paint material (with coats)
function estimatePaintMaterial(totalArea: number, coats: number = 2): number {
  
  return totalArea * coats;
}

// Estimate carpet tiles
function estimateCarpetTiles(totalArea: number, tileSize: number): number {
  
  return Math.ceil(totalArea / tileSize);
}

// Estimate wallpaper rolls
function estimateWallpaperRolls(totalArea: number, rollCoverage: number = 56): number {
  
  return Math.ceil(totalArea / rollCoverage);
}
```

---

## How to Use Content (for SEO section)

1. Select units (feet, meters, or yards)
2. Add rooms by entering dimensions
3. Choose shape (rectangle, circle, or triangle)
4. Enter dimensions based on shape
5. Add more rooms as needed
6. Click calculate to see total area and perimeter
7. View material estimates for flooring, paint, etc.

---

## About Content (for SEO section

Our free square footage calculator helps you calculate the area of rooms and total square footage for any space. Enter room dimensions for rectangular, circular, or triangular shapes to instantly calculate area and perimeter. Add multiple rooms to get the total square footage for an entire floor or building. The calculator includes material estimation for flooring, paint, carpet tiles, and wallpaper, accounting for waste and multiple coats. Perfect for home improvement projects, real estate calculations, construction planning, or any situation where you need to measure area. Supports feet, meters, and yards. All calculations happen in your browser with complete privacy and instant results.
