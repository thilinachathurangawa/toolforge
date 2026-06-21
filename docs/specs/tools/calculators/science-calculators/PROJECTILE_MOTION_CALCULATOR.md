# SPEC: Projectile Motion Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/PROJECTILE_MOTION_CALCULATOR.md`
**Status:** Pending
**Slug:** `projectile-motion-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Projectile Motion Calculator — Calculate Trajectory Physics | ToolForge`
- **Description:** `Calculate projectile motion trajectory, range, time of flight, and max height. Our free calculator handles launch angle and velocity. Perfect for physics.`
- **Primary Keyword:** projectile motion calculator
- **Secondary Keywords:** trajectory calculator, projectile range calculator, physics projectile calculator, launch angle calculator, ballistics calculator

---

## Functional Requirements

- [ ] Initial velocity input (m/s, km/h, mph)
- [ ] Launch angle input (degrees)
- [ ] Initial height input (optional, meters)
- [ ] Real-time calculation of trajectory parameters
- [ ] Calculate maximum height
- [ ] Calculate time of flight
- [ ] Calculate horizontal range
- [ ] Display trajectory equation
- [ ] Show velocity components (Vx, Vy)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in physics formulas)

---

## Library

No external library needed — use built-in projectile motion formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Projectile Motion Calculator           │
├─────────────────────────────────────────┤
│  Initial Velocity: [50        ] [m/s ▼] │
│  Launch Angle: [45        ] [°]          │
│  Initial Height: [0        ] [m]        │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Max Height: 63.77 m                    │
│  Time of Flight: 7.21 s                │
│  Horizontal Range: 255.1 m            │
│                                         │
│  Velocity Components:                   │
│  Vx: 35.36 m/s                         │
│  Vy: 35.36 m/s                         │
│                                         │
│  Trajectory Equation:                   │
│  y = x·tan(45°) - (9.81·x²)/(2·35.36²) │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  initialVelocity: number;
  velocityUnit: 'm/s' | 'km/h' | 'mph';
  launchAngle: number;
  initialHeight: number;
  maxHeight: number | null;
  timeOfFlight: number | null;
  horizontalRange: number | null;
  velocityX: number | null;
  velocityY: number | null;
  trajectoryEquation: string;
  copied: boolean;
}
```

---

## Formulas

```typescript
// Projectile Motion Formulas (assuming no air resistance):
// Vx = V₀ · cos(θ)
// Vy = V₀ · sin(θ)
// Time to max height: t_up = Vy / g
// Max height: H = h₀ + Vy² / (2g)
// Time of flight: T = (Vy + √(Vy² + 2gh₀)) / g
// Horizontal range: R = Vx · T
// Trajectory: y = h₀ + x·tan(θ) - (g·x²) / (2·V₀²·cos²(θ))

const g = 9.81; // acceleration due to gravity (m/s²)

function calculateProjectileMotion(
  initialVelocity: number,
  launchAngle: number,
  initialHeight: number
): {
  maxHeight: number;
  timeOfFlight: number;
  horizontalRange: number;
  velocityX: number;
  velocityY: number;
  trajectoryEquation: string;
} {
  const angleRad = (launchAngle * Math.PI) / 180;
  const Vx = initialVelocity * Math.cos(angleRad);
  const Vy = initialVelocity * Math.sin(angleRad);
  
  // Time to reach maximum height
  const t_up = Vy / g;
  
  // Maximum height
  const maxHeight = initialHeight + (Vy * Vy) / (2 * g);
  
  // Time of flight (when y = 0)
  const discriminant = Math.sqrt(Vy * Vy + 2 * g * initialHeight);
  const timeOfFlight = (Vy + discriminant) / g;
  
  // Horizontal range
  const horizontalRange = Vx * timeOfFlight;
  
  // Trajectory equation
  const trajectoryEquation = `y = ${initialHeight} + x·tan(${launchAngle}°) - (${g}·x²)/(2·${initialVelocity}²·cos²(${launchAngle}°))`;
  
  return {
    maxHeight,
    timeOfFlight,
    horizontalRange,
    velocityX: Vx,
    velocityY: Vy,
    trajectoryEquation
  };
}

// Unit Conversions
function convertToMetersPerSecond(value: number, from: string): number {
  switch(from) {
    case 'm/s': return value;
    case 'km/h': return value / 3.6;
    case 'mph': return value / 2.23694;
    default: return value;
  }
}

function convertFromMetersPerSecond(value: number, to: string): number {
  switch(to) {
    case 'm/s': return value;
    case 'km/h': return value * 3.6;
    case 'mph': return value * 2.23694;
    default: return value;
  }
}
```

---

## How to Use Content (for SEO section)

1. Enter the initial velocity of the projectile
2. Enter the launch angle in degrees
3. Optionally enter the initial height (default is 0 for ground level)
4. Click calculate to get trajectory parameters
5. View maximum height, time of flight, horizontal range, and velocity components
6. See the trajectory equation for the projectile path
7. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free projectile motion calculator helps you analyze the trajectory of projectiles using fundamental physics formulas. Calculate maximum height, time of flight, horizontal range, and velocity components (Vx, Vy) from initial velocity and launch angle. The calculator also provides the trajectory equation, allowing you to predict the projectile's path at any point. Perfect for students, physicists, engineers, and anyone working with ballistics or motion problems. The calculator supports multiple units for velocity including meters per second, kilometers per hour, and miles per hour. All calculations assume no air resistance and standard gravity (9.81 m/s²). All calculations happen instantly in your browser with complete privacy.
