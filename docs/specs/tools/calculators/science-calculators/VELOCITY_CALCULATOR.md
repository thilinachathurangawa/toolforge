# SPEC: Velocity Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/VELOCITY_CALCULATOR.md`
**Status:** Pending
**Slug:** `velocity-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Velocity Calculator — Calculate Speed with v = d/t | ToolForge`
- **Description:** `Calculate velocity, speed, and distance with our free velocity calculator. Solve for velocity, distance, or time using the formula v = d/t. Perfect for physics problems.`
- **Primary Keyword:** velocity calculator
- **Secondary Keywords:** speed calculator, distance calculator, time calculator, velocity formula, physics calculator, motion calculator

---

## Functional Requirements

- [ ] Distance input (meters, kilometers, miles, feet)
- [ ] Time input (seconds, minutes, hours)
- [ ] Real-time velocity calculation
- [ ] Unit conversion support
- [ ] Display result in multiple units (m/s, km/h, mph, ft/s)
- [ ] Solve for distance (given velocity and time)
- [ ] Solve for time (given velocity and distance)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in physics formulas)

---

## Library

No external library needed — use built-in velocity formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Velocity Calculator                     │
├─────────────────────────────────────────┤
│  Calculate: [Velocity ▼]                │
│                                         │
│  Distance: [100        ] [meters ▼]     │
│  Time: [10        ] [seconds ▼]         │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Velocity: 10 m/s                       │
│  36 km/h                                │
│  22.37 mph                              │
│  32.81 ft/s                             │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculateFor: 'velocity' | 'distance' | 'time';
  distance: number;
  distanceUnit: 'meters' | 'kilometers' | 'miles' | 'feet';
  time: number;
  timeUnit: 'seconds' | 'minutes' | 'hours';
  velocity: number;
  velocityUnit: 'm/s' | 'km/h' | 'mph' | 'ft/s';
  result: number | null;
  resultsInAllUnits: {[key: string]: number};
  copied: boolean;
}
```

---

## Formulas

```typescript
// Velocity Formula: v = d/t
// Distance Formula: d = v × t
// Time Formula: t = d/v

function calculateVelocity(distance: number, time: number): number {
  if (time === 0) return 0;
  return distance / time;
}

function calculateDistance(velocity: number, time: number): number {
  return velocity * time;
}

function calculateTime(distance: number, velocity: number): number {
  if (velocity === 0) return 0;
  return distance / velocity;
}

// Unit Conversions
function convertToMeters(value: number, from: string): number {
  switch(from) {
    case 'meters': return value;
    case 'kilometers': return value * 1000;
    case 'miles': return value * 1609.34;
    case 'feet': return value * 0.3048;
    default: return value;
  }
}

function convertFromMeters(value: number, to: string): number {
  switch(to) {
    case 'meters': return value;
    case 'kilometers': return value / 1000;
    case 'miles': return value / 1609.34;
    case 'feet': return value / 0.3048;
    default: return value;
  }
}

function convertToSeconds(value: number, from: string): number {
  switch(from) {
    case 'seconds': return value;
    case 'minutes': return value * 60;
    case 'hours': return value * 3600;
    default: return value;
  }
}

function convertFromSeconds(value: number, to: string): number {
  switch(to) {
    case 'seconds': return value;
    case 'minutes': return value / 60;
    case 'hours': return value / 3600;
    default: return value;
  }
}

// Convert velocity to all units
function convertVelocityToAllUnits(velocityInMetersPerSecond: number): {[key: string]: number} {
  return {
    'm/s': velocityInMetersPerSecond,
    'km/h': velocityInMetersPerSecond * 3.6,
    'mph': velocityInMetersPerSecond * 2.23694,
    'ft/s': velocityInMetersPerSecond * 3.28084
  };
}
```

---

## How to Use Content (for SEO section)

1. Select what you want to calculate (velocity, distance, or time)
2. Enter the known values in the input fields
3. Choose the appropriate units for each value
4. Click calculate to get your result
5. View the result in multiple units for convenience
6. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free velocity calculator helps you solve physics problems involving motion, speed, and distance. Using the fundamental formula v = d/t (velocity equals distance divided by time), you can calculate any of these three variables when you know the other two. Perfect for students, teachers, engineers, and anyone working with physics problems. The calculator supports multiple units including meters, kilometers, miles, feet, seconds, minutes, and hours, making it versatile for any application. Results are displayed in multiple velocity units (m/s, km/h, mph, ft/s) for easy conversion. All calculations happen instantly in your browser with complete privacy.
