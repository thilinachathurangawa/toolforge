# SPEC: Shoe Size Converter Tool
**File:** `docs/specs/tools/calculators/other-calculators/SHOE_SIZE_CONVERTER.md`
**Status:** Pending
**Slug:** `shoe-size-converter`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Shoe Size Converter — US, EU, UK, CM Size Conversion | ToolForge`
- **Description:** `Convert shoe sizes between US, EU, UK, and CM with our free shoe size converter. Accurate conversions for men, women, and kids.`
- **Primary Keyword:** shoe size converter
- **Secondary Keywords:** shoe size conversion, us to eu shoe size, shoe size chart, international shoe size converter

---

## Functional Requirements

- [ ] Size input (number)
- [ ] Region selection (US, EU, UK, CM)
- [ ] Gender selection (Men, Women, Kids)
- [ ] Real-time conversion to all regions
- [ ] Display conversions in US, EU, UK, and CM
- [ ] Shoe size chart reference
- [ ] Copy results to clipboard
- [ ] No external library needed

---

## Library

No external library needed — use built-in conversion formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Shoe Size Converter                    │
├─────────────────────────────────────────┤
│  Gender: [Men ▼]                         │
│                                         │
│  Enter Size:                             │
│  Size: [10]                              │
│  Region: [US ▼]                          │
│                                         │
│  [Convert]                              │
├─────────────────────────────────────────┤
│  Conversions:                            │
│  US: 10                                 │
│  EU: 44                                 │
│  UK: 9                                  │
│  CM: 28.0                               │
│                                         │
│  Size Chart:                            │
│  US | EU | UK | CM                      │
│  9  | 43 | 8  | 27.3                    │
│  10 | 44 | 9  | 28.0                    │
│  11 | 45 | 10 | 28.7                    │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  gender: 'men' | 'women' | 'kids';
  size: number;
  region: 'US' | 'EU' | 'UK' | 'CM';
  conversions: {
    US: number;
    EU: number;
    UK: number;
    CM: number;
  };
}
```

---

## Formulas

```typescript
// Convert shoe size to centimeters (base unit)
function sizeToCM(size: number, region: 'US' | 'EU' | 'UK' | 'CM', gender: 'men' | 'women' | 'kids'): number {
  
  switch (region) {
    case 'CM':
      return size;
    
    case 'US':
      if (gender === 'men') {
        return (size + 1) * 2.54 + 1.5; // US men's to CM
      } else if (gender === 'women') {
        return (size + 1.5) * 2.54 + 1.5; // US women's to CM
      } else { // kids
        return (size + 12) * 2.54 + 0.8; // US kids to CM
      }
    
    case 'EU':
      // EU to CM: EU = 1.5 * CM + 2
      return (size - 2) / 1.5;
    
    case 'UK':
      if (gender === 'men') {
        return (size + 1) * 2.54 + 1.5; // UK men's to CM
      } else if (gender === 'women') {
        return (size + 1.5) * 2.54 + 1.5; // UK women's to CM
      } else { // kids
        return (size + 12) * 2.54 + 0.8; // UK kids to CM
      }
    
    default:
      return size;
  }
}

// Convert centimeters to target region
function cmToSize(cm: number, targetRegion: 'US' | 'EU' | 'UK' | 'CM', gender: 'men' | 'women' | 'kids'): number {
  
  switch (targetRegion) {
    case 'CM':
      return cm;
    
    case 'US':
      if (gender === 'men') {
        return (cm - 1.5) / 2.54 - 1; // CM to US men's
      } else if (gender === 'women') {
        return (cm - 1.5) / 2.54 - 1.5; // CM to US women's
      } else { // kids
        return (cm - 0.8) / 2.54 - 12; // CM to US kids
      }
    
    case 'EU':
      // CM to EU: EU = 1.5 * CM + 2
      return Math.round(1.5 * cm + 2);
    
    case 'UK':
      if (gender === 'men') {
        return (cm - 1.5) / 2.54 - 1; // CM to UK men's
      } else if (gender === 'women') {
        return (cm - 1.5) / 2.54 - 1.5; // CM to UK women's
      } else { // kids
        return (cm - 0.8) / 2.54 - 12; // CM to UK kids
      }
    
    default:
      return cm;
  }
}

// Convert between any two regions
function convertShoeSize(
  size: number,
  fromRegion: 'US' | 'EU' | 'UK' | 'CM',
  toRegion: 'US' | 'EU' | 'UK' | 'CM',
  gender: 'men' | 'women' | 'kids'
): number {
  
  const cm = sizeToCM(size, fromRegion, gender);
  return cmToSize(cm, toRegion, gender);
}

// Convert to all regions
function convertToAllRegions(
  size: number,
  fromRegion: 'US' | 'EU' | 'UK' | 'CM',
  gender: 'men' | 'women' | 'kids'
): { US: number; EU: number; UK: number; CM: number } {
  
  const cm = sizeToCM(size, fromRegion, gender);
  
  return {
    US: cmToSize(cm, 'US', gender),
    EU: cmToSize(cm, 'EU', gender),
    UK: cmToSize(cm, 'UK', gender),
    CM: cm
  };
}

// Generate size chart
function generateSizeChart(gender: 'men' | 'women' | 'kids'): {
  US: number;
  EU: number;
  UK: number;
  CM: number;
}[] {
  
  const chart: { US: number; EU: number; UK: number; CM: number }[] = [];
  
  if (gender === 'men') {
    for (let us = 6; us <= 15; us++) {
      const conversions = convertToAllRegions(us, 'US', gender);
      chart.push(conversions);
    }
  } else if (gender === 'women') {
    for (let us = 5; us <= 12; us++) {
      const conversions = convertToAllRegions(us, 'US', gender);
      chart.push(conversions);
    }
  } else { // kids
    for (let us = 1; us <= 13; us++) {
      const conversions = convertToAllRegions(us, 'US', gender);
      chart.push(conversions);
    }
  }
  
  return chart;
}

// Find nearest standard size
function findNearestSize(
  cm: number,
  gender: 'men' | 'women' | 'kids',
  region: 'US' | 'EU' | 'UK' | 'CM'
): number {
  
  const chart = generateSizeChart(gender);
  let nearest = chart[0][region];
  let minDiff = Math.abs(chart[0][region] - cm);
  
  for (const size of chart) {
    const diff = Math.abs(size[region] - cm);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = size[region];
    }
  }
  
  return nearest;
}
```

---

## How to Use Content (for SEO section)

1. Select gender (Men, Women, or Kids)
2. Enter your shoe size
3. Select the region of your size (US, EU, UK, or CM)
4. Click convert to see your size in all regions
5. View the size chart for reference
6. Copy results for easy sharing

---

## About Content (for SEO section)

Our free shoe size converter helps you find your shoe size across different international sizing systems. Enter your size in US, EU, UK, or centimeters and instantly see the equivalent size in all other regions. The converter supports men's, women's, and kids' sizing, accounting for the differences between each system. Includes a comprehensive size chart for quick reference. Perfect for online shopping, international travel, or finding the right fit when buying shoes from different countries. All conversions use accurate formulas based on standard sizing systems. All calculations happen in your browser with complete privacy and instant results.
