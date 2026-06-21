# SPEC: Tile Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/TILE_CALCULATOR.md`
**Status:** Pending
**Slug:** `tile-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Tile Calculator — Calculate Tiles Needed for Flooring & Walls | ToolForge`
- **Description:** `Calculate tiles needed instantly with our free tile calculator. Estimate tiles for flooring, walls, and backsplashes with waste factor.`
- **Primary Keyword:** tile calculator
- **Secondary Keywords:** tile estimator, flooring tile calculator, wall tile calculator, backsplash calculator

---

## Functional Requirements

- [ ] Area input (length × width)
- [ ] Tile size input
- [ ] Multiple areas support
- [ ] Add/remove areas
- [ ] Unit selection (feet, meters, inches)
- [ ] Tile shape selection (square, rectangle)
- [ ] Grout width input
- [ ] Waste factor (5-15%)
- [ ] Tiles needed calculation
- [ ] Cost estimation
- [ ] Copy results to clipboard
- [ ] No external library needed

---

## Library

No external library needed — use built-in tile calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Tile Calculator                        │
├─────────────────────────────────────────┤
│  Units: [Feet ▼]                         │
│  Tile Size: [12] × [12] inches          │
│  Grout Width: [0.25] inches             │
│  Waste Factor: [10%]                     │
│  Price per Tile: [$2.50]                │
│                                         │
│  Area 1:                                │
│  Length: [10]  Width: [12]              │
│  Area: 120 sq ft                        │
│                                         │
│  Area 2:                                │
│  Length: [8]   Width: [6]               │
│  Area: 48 sq ft                         │
│                                         │
│  [+ Add Area]                           │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Total Area: 168 sq ft                  │
│  Tile Size: 12" × 12" (1 sq ft)         │
│                                         │
│  Tiles Needed:                           │
│  Base tiles: 168                         │
│  With waste (10%): 185                   │
│                                         │
│  Cost Estimate: $462.50                 │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  units: 'feet' | 'meters' | 'inches';
  tileSize: { length: number; width: number };
  tileSizeUnits: 'inches' | 'cm';
  groutWidth: number;
  wasteFactor: number;
  pricePerTile: number;
  areas: {
    id: string;
    name: string;
    length: number;
    width: number;
    area: number;
  }[];
  results: {
    totalArea: number;
    tileArea: number;
    baseTiles: number;
    tilesWithWaste: number;
    costEstimate: number;
  };
}
```

---

## Formulas

```typescript
// Calculate area
function calculateArea(length: number, width: number): number {
  
  return length * width;
}

// Calculate tile area
function calculateTileArea(tileLength: number, tileWidth: number): number {
  
  return tileLength * tileWidth;
}

// Calculate tiles needed (without waste)
function calculateTilesNeeded(area: number, tileArea: number): number {
  
  return Math.ceil(area / tileArea);
}

// Calculate tiles with waste factor
function calculateTilesWithWaste(baseTiles: number, wasteFactor: number): number {
  
  return Math.ceil(baseTiles * (1 + wasteFactor / 100));
}

// Calculate tiles needed considering grout
function calculateTilesWithGrout(
  area: number,
  tileLength: number,
  tileWidth: number,
  groutWidth: number
): number {
  
  // Effective tile size including grout
  const effectiveLength = tileLength + groutWidth;
  const effectiveWidth = tileWidth + groutWidth;
  const effectiveTileArea = effectiveLength * effectiveWidth;
  
  return Math.ceil(area / effectiveTileArea);
}

// Convert units
function convertToSquareFeet(
  area: number,
  from: 'feet' | 'meters' | 'inches'
): number {
  
  const conversions = {
    feet: (v: number) => v, // Already in sq ft
    meters: (v: number) => v * 10.764, // 1 sq m = 10.764 sq ft
    inches: (v: number) => v / 144 // 1 sq in = 1/144 sq ft
  };
  
  return conversions[from](area);
}

// Convert tile size to feet
function convertTileSizeToFeet(
  size: number,
  from: 'inches' | 'cm'
): number {
  
  const conversions = {
    inches: (v: number) => v / 12, // inches to feet
    cm: (v: number) => (v / 100) * 3.28084 // cm to feet
  };
  
  return conversions[from](size);
}

// Calculate total area for multiple areas
function calculateTotalArea(areas: { area: number }[]): number {
  
  return areas.reduce((total, area) => total + area.area, 0);
}

// Calculate cost estimate
function calculateCostEstimate(tilesNeeded: number, pricePerTile: number): number {
  
  return tilesNeeded * pricePerTile;
}

// Calculate number of boxes needed
function calculateBoxesNeeded(tilesNeeded: number, tilesPerBox: number): number {
  
  return Math.ceil(tilesNeeded / tilesPerBox);
}

// Calculate grout needed (in pounds)
function calculateGroutNeeded(
  totalArea: number,
  groutWidth: number,
  tileDepth: number = 0.25
): number {
  
  // Simplified grout calculation
  // Grout volume = total grout line length × grout width × tile depth
  // This is a rough estimate
  const groutLineLength = totalArea * 12; // Approximate line length in feet
  const groutVolume = groutLineLength * (groutWidth / 12) * tileDepth;
  
  // Convert to pounds (approximate)
  return groutVolume * 100; // Rough conversion
}

// Calculate edge tiles (for borders)
function calculateEdgeTiles(
  perimeter: number,
  tileLength: number,
  tileWidth: number
): number {
  
  const tilesPerSide = Math.ceil(perimeter / Math.max(tileLength, tileWidth));
  return tilesPerSide;
}
```

---

## How to Use Content (for SEO section)

1. Select units (feet, meters, or inches)
2. Enter tile size (length × width)
3. Set grout width (typically 0.25-0.5 inches)
4. Set waste factor (typically 10-15% for cuts and breaks)
5. Optionally enter price per tile for cost estimate
6. Add areas by entering length and width
7. Add more areas as needed
8. Click calculate to see tiles needed and cost estimate

---

## About Content (for SEO section)

Our free tile calculator helps you estimate the number of tiles needed for flooring, walls, or backsplashes. Enter the area dimensions and tile size to instantly calculate how many tiles you need. The calculator accounts for grout width and includes a waste factor (typically 10-15%) to cover cuts and breakage. Add multiple areas to calculate tiles for an entire room or multiple rooms. Includes cost estimation based on price per tile. Perfect for home improvement projects, bathroom renovations, kitchen backsplashes, or any tiling project. Supports both imperial and metric units. All calculations happen in your browser with complete privacy and instant results.
