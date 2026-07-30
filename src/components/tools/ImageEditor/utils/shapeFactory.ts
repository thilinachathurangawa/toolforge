// Point-array / path-data builders for the shape tool. Fabric.js ships
// Rect/Circle/Ellipse/Triangle/Line natively; arrow, polygon, star and heart
// are built here as Polygon points or a fixed Path so the shape tool covers
// the full P1 shape list.

export interface Pt {
  x: number;
  y: number;
}

/** Regular polygon centered at (radius, radius) so its own bounding box starts at 0,0. */
export function polygonPoints(sides: number, radius: number): Pt[] {
  const points: Pt[] = [];
  const step = (2 * Math.PI) / sides;
  for (let i = 0; i < sides; i++) {
    const angle = i * step - Math.PI / 2;
    points.push({ x: radius + radius * Math.cos(angle), y: radius + radius * Math.sin(angle) });
  }
  return points;
}

/** Five/six/etc-pointed star, alternating outer/inner radius, centered the same way as polygonPoints. */
export function starPoints(spikes: number, outerRadius: number, innerRadius: number): Pt[] {
  const points: Pt[] = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    points.push({ x: outerRadius + r * Math.cos(angle), y: outerRadius + r * Math.sin(angle) });
  }
  return points;
}

/** A right-pointing arrow (shaft + triangular head) starting at (0,0). */
export function arrowPoints(length: number, thickness: number): Pt[] {
  const headWidth = thickness * 3;
  const headLength = Math.min(length * 0.4, thickness * 3);
  const shaftHalf = thickness / 2;
  const shaftEnd = length - headLength;
  return [
    { x: 0, y: -shaftHalf },
    { x: shaftEnd, y: -shaftHalf },
    { x: shaftEnd, y: -headWidth / 2 },
    { x: length, y: 0 },
    { x: shaftEnd, y: headWidth / 2 },
    { x: shaftEnd, y: shaftHalf },
    { x: 0, y: shaftHalf },
  ];
}

/** A 100x90 heart, top-left origin — pass to a Fabric Path and scale to taste. */
export const HEART_PATH_DATA =
  'M 50 25 C 50 8, 25 8, 25 30 C 25 52, 50 70, 50 88 C 50 70, 75 52, 75 30 C 75 8, 50 8, 50 25 Z';
