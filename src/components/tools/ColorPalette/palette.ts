/**
 * Colour engine for the Color Palette Extractor.
 *
 * Pixel sampling, median-cut quantisation with coverage, the vibrant selector,
 * colour-space conversion, perceptual distance, nearest-name lookup, WCAG
 * contrast, sorting and the export serialisers. No React, no DOM — so the maths
 * can be asserted directly rather than eyeballed in a browser.
 */

/* -------------------------------- types -------------------------------- */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export type Algorithm = 'dominant' | 'vibrant';
export type SortMode = 'coverage' | 'hue' | 'lightness' | 'saturation';
export type ColorFormat = 'hex' | 'rgb' | 'hsl';
export type Sensitivity = 'fast' | 'balanced' | 'fine';
export type SwatchRole = 'vibrant' | 'muted' | 'light' | 'dark';
export type ExportFormat = 'css' | 'scss' | 'tailwind' | 'json' | 'list' | 'svg';

export interface Swatch {
  id: string;
  rgb: RGB;
  hex: string;
  hsl: HSL;
  /** Share of the sampled, considered pixels this colour represents (0–1). */
  coverage: number;
  name: string;
  contrastWhite: number;
  contrastBlack: number;
  role?: SwatchRole;
  origin: 'extracted' | 'picked';
}

export interface PixelBuffer {
  data: ArrayLike<number>;
  width: number;
  height: number;
}

export interface ExtractOptions {
  algorithm: Algorithm;
  colorCount: number;
  sensitivity: Sensitivity;
  ignoreExtremes: boolean;
}

export interface ExtractResult {
  swatches: Swatch[];
  /** Share of all pixels that were fully or mostly transparent. */
  transparentShare: number;
  /** Share of all pixels skipped as near-white or near-black. */
  extremeShare: number;
  /** Share of considered pixels represented by the returned swatches. */
  coveredShare: number;
  sampledPixels: number;
}

interface Bucket {
  rgb: RGB;
  count: number;
}

/* ----------------------------- sensitivity ----------------------------- */

const SENSITIVITY: Record<Sensitivity, { maxSamples: number; mergeDistance: number }> = {
  fast: { maxSamples: 8000, mergeDistance: 14 },
  balanced: { maxSamples: 25000, mergeDistance: 9 },
  fine: { maxSamples: 60000, mergeDistance: 5 },
};

export const SENSITIVITY_LABELS: Record<Sensitivity, string> = {
  fast: 'fast — merges similar colours freely',
  balanced: 'balanced',
  fine: 'fine — keeps subtle differences apart',
};

/** Pixels this transparent are ignored entirely. */
const MIN_ALPHA = 128;
const NEAR_WHITE = 242;
const NEAR_BLACK = 13;

/* ---------------------------- conversions ---------------------------- */

export function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((channel) => clamp255(channel).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.trim().replace(/^#/, '');
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((char) => char + char)
          .join('')
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
    else if (max === green) hue = ((blue - red) / delta + 2) / 6;
    else hue = ((red - green) / delta + 4) / 6;
  }

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

/** Normalised 0–1 saturation and lightness, for the vibrant scorer. */
function rgbToSl(rgb: RGB): { s: number; l: number } {
  const hsl = rgbToHsl(rgb);
  return { s: hsl.s / 100, l: hsl.l / 100 };
}

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface Lab {
  l: number;
  a: number;
  b: number;
}

export function rgbToLab(rgb: RGB): Lab {
  const r = channelToLinear(rgb.r);
  const g = channelToLinear(rgb.g);
  const b = channelToLinear(rgb.b);

  // Linear sRGB → CIE XYZ (D65)
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;

  const f = (value: number) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** CIE76 colour difference — close enough for merging and naming, and cheap. */
export function deltaE(a: RGB, b: RGB): number {
  const first = rgbToLab(a);
  const second = rgbToLab(b);
  return Math.sqrt(
    (first.l - second.l) ** 2 + (first.a - second.a) ** 2 + (first.b - second.b) ** 2
  );
}

/* --------------------------- named colours --------------------------- */

const NAMED_COLORS: Record<string, string> = {
  Black: '#000000',
  'Dim Gray': '#696969',
  Gray: '#808080',
  'Dark Gray': '#A9A9A9',
  Silver: '#C0C0C0',
  'Light Gray': '#D3D3D3',
  Gainsboro: '#DCDCDC',
  'White Smoke': '#F5F5F5',
  White: '#FFFFFF',
  Snow: '#FFFAFA',
  Ivory: '#FFFFF0',
  'Floral White': '#FFFAF0',
  Seashell: '#FFF5EE',
  Linen: '#FAF0E6',
  'Old Lace': '#FDF5E6',
  Beige: '#F5F5DC',
  'Antique White': '#FAEBD7',
  Bisque: '#FFE4C4',
  Wheat: '#F5DEB3',
  Tan: '#D2B48C',
  'Burly Wood': '#DEB887',
  'Navajo White': '#FFDEAD',
  Moccasin: '#FFE4B5',
  Peru: '#CD853F',
  Chocolate: '#D2691E',
  'Saddle Brown': '#8B4513',
  Sienna: '#A0522D',
  Brown: '#A52A2A',
  Maroon: '#800000',
  'Dark Red': '#8B0000',
  Firebrick: '#B22222',
  'Indian Red': '#CD5C5C',
  Red: '#FF0000',
  Crimson: '#DC143C',
  Salmon: '#FA8072',
  'Light Salmon': '#FFA07A',
  'Dark Salmon': '#E9967A',
  Coral: '#FF7F50',
  Tomato: '#FF6347',
  'Orange Red': '#FF4500',
  'Dark Orange': '#FF8C00',
  Orange: '#FFA500',
  Gold: '#FFD700',
  Yellow: '#FFFF00',
  'Light Yellow': '#FFFFE0',
  'Lemon Chiffon': '#FFFACD',
  Khaki: '#F0E68C',
  'Dark Khaki': '#BDB76B',
  'Pale Goldenrod': '#EEE8AA',
  Goldenrod: '#DAA520',
  'Dark Goldenrod': '#B8860B',
  Olive: '#808000',
  'Olive Drab': '#6B8E23',
  'Dark Olive Green': '#556B2F',
  'Yellow Green': '#9ACD32',
  'Green Yellow': '#ADFF2F',
  Chartreuse: '#7FFF00',
  'Lawn Green': '#7CFC00',
  'Light Green': '#90EE90',
  'Pale Green': '#98FB98',
  'Spring Green': '#00FF7F',
  'Medium Spring Green': '#00FA9A',
  Lime: '#00FF00',
  'Lime Green': '#32CD32',
  'Forest Green': '#228B22',
  Green: '#008000',
  'Dark Green': '#006400',
  'Sea Green': '#2E8B57',
  'Medium Sea Green': '#3CB371',
  'Dark Sea Green': '#8FBC8F',
  'Light Sea Green': '#20B2AA',
  Teal: '#008080',
  'Dark Cyan': '#008B8B',
  Aqua: '#00FFFF',
  'Light Cyan': '#E0FFFF',
  'Pale Turquoise': '#AFEEEE',
  Turquoise: '#40E0D0',
  'Medium Turquoise': '#48D1CC',
  'Dark Turquoise': '#00CED1',
  'Cadet Blue': '#5F9EA0',
  'Powder Blue': '#B0E0E6',
  'Light Blue': '#ADD8E6',
  'Sky Blue': '#87CEEB',
  'Light Sky Blue': '#87CEFA',
  'Deep Sky Blue': '#00BFFF',
  'Dodger Blue': '#1E90FF',
  'Cornflower Blue': '#6495ED',
  'Steel Blue': '#4682B4',
  'Royal Blue': '#4169E1',
  Blue: '#0000FF',
  'Medium Blue': '#0000CD',
  'Dark Blue': '#00008B',
  Navy: '#000080',
  'Midnight Blue': '#191970',
  'Slate Blue': '#6A5ACD',
  'Dark Slate Blue': '#483D8B',
  'Medium Slate Blue': '#7B68EE',
  'Slate Gray': '#708090',
  'Light Slate Gray': '#778899',
  'Dark Slate Gray': '#2F4F4F',
  Lavender: '#E6E6FA',
  Thistle: '#D8BFD8',
  Plum: '#DDA0DD',
  Violet: '#EE82EE',
  Orchid: '#DA70D6',
  Fuchsia: '#FF00FF',
  'Medium Orchid': '#BA55D3',
  'Medium Purple': '#9370DB',
  'Blue Violet': '#8A2BE2',
  'Dark Violet': '#9400D3',
  'Dark Orchid': '#9932CC',
  'Dark Magenta': '#8B008B',
  Purple: '#800080',
  Indigo: '#4B0082',
  'Rebecca Purple': '#663399',
  'Pale Violet Red': '#DB7093',
  'Medium Violet Red': '#C71585',
  'Deep Pink': '#FF1493',
  'Hot Pink': '#FF69B4',
  Pink: '#FFC0CB',
  'Light Pink': '#FFB6C1',
  'Misty Rose': '#FFE4E1',
  'Lavender Blush': '#FFF0F5',
  'Rosy Brown': '#BC8F8F',
  'Peach Puff': '#FFDAB9',
  'Papaya Whip': '#FFEFD5',
  'Blanched Almond': '#FFEBCD',
  Cornsilk: '#FFF8DC',
  'Light Goldenrod Yellow': '#FAFAD2',
  Honeydew: '#F0FFF0',
  'Mint Cream': '#F5FFFA',
  Azure: '#F0FFFF',
  'Alice Blue': '#F0F8FF',
  'Ghost White': '#F8F8FF',
  'Light Steel Blue': '#B0C4DE',
  Aquamarine: '#7FFFD4',
  'Medium Aquamarine': '#66CDAA',
};

const NAMED_LIST: { name: string; rgb: RGB; lab: Lab }[] = Object.entries(NAMED_COLORS).map(
  ([name, hex]) => {
    const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
    return { name, rgb, lab: rgbToLab(rgb) };
  }
);

export function nearestColorName(rgb: RGB): string {
  const lab = rgbToLab(rgb);
  let best = NAMED_LIST[0];
  let bestDistance = Infinity;

  for (const entry of NAMED_LIST) {
    const distance =
      (lab.l - entry.lab.l) ** 2 + (lab.a - entry.lab.a) ** 2 + (lab.b - entry.lab.b) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = entry;
    }
  }

  return best.name;
}

/* ------------------------------ sampling ------------------------------ */

interface SampleResult {
  pixels: RGB[];
  transparentShare: number;
  extremeShare: number;
  totalPixels: number;
}

export function samplePixels(
  buffer: PixelBuffer,
  options: { maxSamples: number; ignoreExtremes: boolean }
): SampleResult {
  const totalPixels = buffer.width * buffer.height;
  if (totalPixels <= 0) {
    return { pixels: [], transparentShare: 0, extremeShare: 0, totalPixels: 0 };
  }

  // Ceil, not floor, so maxSamples is a genuine ceiling on the work done.
  const stride = Math.max(1, Math.ceil(totalPixels / Math.max(1, options.maxSamples)));
  const pixels: RGB[] = [];
  let inspected = 0;
  let transparent = 0;
  let extreme = 0;

  for (let index = 0; index < totalPixels; index += stride) {
    const offset = index * 4;
    inspected += 1;

    if (buffer.data[offset + 3] < MIN_ALPHA) {
      transparent += 1;
      continue;
    }

    const r = buffer.data[offset];
    const g = buffer.data[offset + 1];
    const b = buffer.data[offset + 2];

    if (options.ignoreExtremes) {
      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);
      if (min >= NEAR_WHITE || max <= NEAR_BLACK) {
        extreme += 1;
        continue;
      }
    }

    pixels.push({ r, g, b });
  }

  return {
    pixels,
    transparentShare: inspected ? transparent / inspected : 0,
    extremeShare: inspected ? extreme / inspected : 0,
    totalPixels,
  };
}

/* ----------------------------- median cut ----------------------------- */

interface Box {
  pixels: RGB[];
  min: RGB;
  max: RGB;
  volumeChannel: 'r' | 'g' | 'b';
  volume: number;
}

function measureBox(pixels: RGB[]): Box {
  const min: RGB = { r: 255, g: 255, b: 255 };
  const max: RGB = { r: 0, g: 0, b: 0 };

  for (const pixel of pixels) {
    if (pixel.r < min.r) min.r = pixel.r;
    if (pixel.g < min.g) min.g = pixel.g;
    if (pixel.b < min.b) min.b = pixel.b;
    if (pixel.r > max.r) max.r = pixel.r;
    if (pixel.g > max.g) max.g = pixel.g;
    if (pixel.b > max.b) max.b = pixel.b;
  }

  const ranges: [Box['volumeChannel'], number][] = [
    ['r', max.r - min.r],
    ['g', max.g - min.g],
    ['b', max.b - min.b],
  ];
  ranges.sort((a, b) => b[1] - a[1]);

  return { pixels, min, max, volumeChannel: ranges[0][0], volume: ranges[0][1] };
}

function averageOf(pixels: RGB[]): RGB {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const pixel of pixels) {
    r += pixel.r;
    g += pixel.g;
    b += pixel.b;
  }
  const size = pixels.length || 1;
  return { r: Math.round(r / size), g: Math.round(g / size), b: Math.round(b / size) };
}

/**
 * Median-cut quantisation. Returns one bucket per cluster with its average colour
 * and pixel population, ordered by population. A box that cannot be split (every
 * pixel identical) simply stops splitting, so a two-colour image asked for six
 * colours honestly returns two.
 */
export function medianCut(pixels: RGB[], count: number): Bucket[] {
  if (!pixels.length) return [];
  if (count <= 1) return [{ rgb: averageOf(pixels), count: pixels.length }];

  let boxes: Box[] = [measureBox(pixels)];

  while (boxes.length < count) {
    // Split the box with the largest colour spread, weighted by how many pixels it holds.
    let target = -1;
    let targetScore = 0;
    boxes.forEach((box, index) => {
      if (box.volume <= 0 || box.pixels.length < 2) return;
      const score = box.volume * Math.log2(box.pixels.length + 1);
      if (score > targetScore) {
        targetScore = score;
        target = index;
      }
    });
    if (target === -1) break;

    const box = boxes[target];
    const channel = box.volumeChannel;
    const sorted = box.pixels.slice().sort((a, b) => a[channel] - b[channel]);
    const middle = Math.floor(sorted.length / 2);
    const left = sorted.slice(0, middle);
    const right = sorted.slice(middle);
    if (!left.length || !right.length) break;

    boxes = [...boxes.slice(0, target), measureBox(left), measureBox(right), ...boxes.slice(target + 1)];
  }

  return boxes
    .map((box) => ({ rgb: averageOf(box.pixels), count: box.pixels.length }))
    .sort((a, b) => b.count - a.count);
}

/** Folds near-identical buckets together, summing their populations. */
export function mergeSimilar(buckets: Bucket[], minDistance: number): Bucket[] {
  const kept: Bucket[] = [];

  for (const bucket of buckets) {
    const near = kept.find((entry) => deltaE(entry.rgb, bucket.rgb) < minDistance);
    if (near) {
      const total = near.count + bucket.count;
      near.rgb = {
        r: Math.round((near.rgb.r * near.count + bucket.rgb.r * bucket.count) / total),
        g: Math.round((near.rgb.g * near.count + bucket.rgb.g * bucket.count) / total),
        b: Math.round((near.rgb.b * near.count + bucket.rgb.b * bucket.count) / total),
      };
      near.count = total;
      continue;
    }
    kept.push({ ...bucket });
  }

  return kept.sort((a, b) => b.count - a.count);
}

/* ---------------------------- vibrant set ---------------------------- */

const VIBRANT_TARGETS: {
  role: SwatchRole;
  saturation: number;
  lightness: number;
  minSaturation?: number;
  maxSaturation?: number;
  minLightness?: number;
  maxLightness?: number;
}[] = [
  { role: 'vibrant', saturation: 1, lightness: 0.5, minSaturation: 0.35, minLightness: 0.3, maxLightness: 0.7 },
  { role: 'light', saturation: 1, lightness: 0.74, minSaturation: 0.3, minLightness: 0.55 },
  { role: 'dark', saturation: 1, lightness: 0.26, minSaturation: 0.3, maxLightness: 0.45 },
  { role: 'muted', saturation: 0.3, lightness: 0.5, maxSaturation: 0.45, minLightness: 0.3, maxLightness: 0.7 },
];

/** Android-Palette-style weighting: colourfulness, then lightness fit, then how common it is. */
function scoreCandidate(
  bucket: Bucket,
  target: (typeof VIBRANT_TARGETS)[number],
  maxPopulation: number
): number {
  const { s, l } = rgbToSl(bucket.rgb);
  if (target.minSaturation !== undefined && s < target.minSaturation) return -1;
  if (target.maxSaturation !== undefined && s > target.maxSaturation) return -1;
  if (target.minLightness !== undefined && l < target.minLightness) return -1;
  if (target.maxLightness !== undefined && l > target.maxLightness) return -1;

  const saturationScore = 1 - Math.abs(s - target.saturation);
  const lightnessScore = 1 - Math.abs(l - target.lightness);
  const populationScore = maxPopulation ? bucket.count / maxPopulation : 0;
  return 0.24 * saturationScore + 0.52 * lightnessScore + 0.24 * populationScore;
}

function selectVibrant(buckets: Bucket[], colorCount: number): { bucket: Bucket; role?: SwatchRole }[] {
  const maxPopulation = buckets.reduce((max, bucket) => Math.max(max, bucket.count), 0);
  const used = new Set<Bucket>();
  const chosen: { bucket: Bucket; role?: SwatchRole }[] = [];

  for (const target of VIBRANT_TARGETS) {
    if (chosen.length >= colorCount) break;
    let best: Bucket | null = null;
    let bestScore = 0;

    for (const bucket of buckets) {
      if (used.has(bucket)) continue;
      const score = scoreCandidate(bucket, target, maxPopulation);
      if (score > bestScore) {
        bestScore = score;
        best = bucket;
      }
    }

    if (best) {
      used.add(best);
      chosen.push({ bucket: best, role: target.role });
    }
  }

  // Any remaining slots are filled with the most common colours left over.
  for (const bucket of buckets) {
    if (chosen.length >= colorCount) break;
    if (used.has(bucket)) continue;
    used.add(bucket);
    chosen.push({ bucket });
  }

  return chosen;
}

/* ------------------------------- extract ------------------------------- */

function toSwatch(bucket: Bucket, total: number, role?: SwatchRole): Swatch {
  const hex = rgbToHex(bucket.rgb);
  return {
    id: `extracted-${hex}`,
    rgb: bucket.rgb,
    hex,
    hsl: rgbToHsl(bucket.rgb),
    coverage: total ? bucket.count / total : 0,
    name: nearestColorName(bucket.rgb),
    contrastWhite: contrastRatio(bucket.rgb, { r: 255, g: 255, b: 255 }),
    contrastBlack: contrastRatio(bucket.rgb, { r: 0, g: 0, b: 0 }),
    role,
    origin: 'extracted',
  };
}

export function pickedSwatch(rgb: RGB): Swatch {
  const hex = rgbToHex(rgb);
  return {
    id: `picked-${hex}`,
    rgb,
    hex,
    hsl: rgbToHsl(rgb),
    coverage: 0,
    name: nearestColorName(rgb),
    contrastWhite: contrastRatio(rgb, { r: 255, g: 255, b: 255 }),
    contrastBlack: contrastRatio(rgb, { r: 0, g: 0, b: 0 }),
    origin: 'picked',
  };
}

export function extractPalette(buffer: PixelBuffer, options: ExtractOptions): ExtractResult {
  const { maxSamples, mergeDistance } = SENSITIVITY[options.sensitivity];
  const sample = samplePixels(buffer, { maxSamples, ignoreExtremes: options.ignoreExtremes });

  const empty: ExtractResult = {
    swatches: [],
    transparentShare: sample.transparentShare,
    extremeShare: sample.extremeShare,
    coveredShare: 0,
    sampledPixels: sample.pixels.length,
  };
  if (!sample.pixels.length) return empty;

  const requested = Math.max(1, Math.min(24, options.colorCount));
  const total = sample.pixels.length;

  if (options.algorithm === 'vibrant') {
    const candidates = mergeSimilar(
      medianCut(sample.pixels, Math.min(32, Math.max(16, requested * 3))),
      mergeDistance
    );
    const chosen = selectVibrant(candidates, requested);
    const swatches = chosen.map((entry) => toSwatch(entry.bucket, total, entry.role));
    return {
      ...empty,
      swatches,
      coveredShare: swatches.reduce((sum, swatch) => sum + swatch.coverage, 0),
      sampledPixels: total,
    };
  }

  // Over-quantise a little, merge near-duplicates, then keep the most common.
  const buckets = mergeSimilar(medianCut(sample.pixels, requested + 2), mergeDistance).slice(
    0,
    requested
  );
  const swatches = buckets.map((bucket) => toSwatch(bucket, total));

  return {
    ...empty,
    swatches,
    coveredShare: swatches.reduce((sum, swatch) => sum + swatch.coverage, 0),
    sampledPixels: total,
  };
}

/* ------------------------------- sorting ------------------------------- */

export function sortSwatches(swatches: Swatch[], mode: SortMode): Swatch[] {
  const sorted = swatches.slice();
  switch (mode) {
    case 'hue':
      sorted.sort((a, b) => a.hsl.h - b.hsl.h);
      break;
    case 'lightness':
      sorted.sort((a, b) => a.hsl.l - b.hsl.l);
      break;
    case 'saturation':
      sorted.sort((a, b) => b.hsl.s - a.hsl.s);
      break;
    case 'coverage':
    default:
      sorted.sort((a, b) => b.coverage - a.coverage);
      break;
  }
  return sorted;
}

/* ------------------------------ formatting ------------------------------ */

export function formatColor(swatch: Swatch, format: ColorFormat): string {
  if (format === 'rgb') return `rgb(${swatch.rgb.r}, ${swatch.rgb.g}, ${swatch.rgb.b})`;
  if (format === 'hsl') return `hsl(${swatch.hsl.h}, ${swatch.hsl.s}%, ${swatch.hsl.l}%)`;
  return swatch.hex;
}

export function wcagLabel(ratio: number): 'AAA' | 'AA' | 'AA Large' | 'Fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

function slug(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base ? `${base}-${index + 1}` : `color-${index + 1}`;
}

export function paletteToSvg(swatches: Swatch[]): string {
  const width = 120;
  const height = 160;
  const rects = swatches
    .map((swatch, index) => {
      const x = index * width;
      const textColor = swatch.contrastWhite >= swatch.contrastBlack ? '#FFFFFF' : '#111111';
      return [
        `  <rect x="${x}" y="0" width="${width}" height="${height}" fill="${swatch.hex}" />`,
        `  <text x="${x + width / 2}" y="${height - 34}" font-family="monospace" font-size="14" fill="${textColor}" text-anchor="middle">${swatch.hex}</text>`,
        `  <text x="${x + width / 2}" y="${height - 14}" font-family="sans-serif" font-size="11" fill="${textColor}" text-anchor="middle" opacity="0.85">${
          swatch.origin === 'picked' ? 'picked' : `${(swatch.coverage * 100).toFixed(1)}%`
        }</text>`,
      ].join('\n');
    })
    .join('\n');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width * swatches.length}" height="${height}" viewBox="0 0 ${width * swatches.length} ${height}">`,
    rects,
    '</svg>',
    '',
  ].join('\n');
}

export function exportPalette(swatches: Swatch[], format: ExportFormat): string {
  if (!swatches.length) return '';

  switch (format) {
    case 'css':
      return [
        ':root {',
        ...swatches.map((swatch, index) => `  --${slug(swatch.name, index)}: ${swatch.hex};`),
        '}',
        '',
      ].join('\n');

    case 'scss':
      return `${swatches
        .map((swatch, index) => `$${slug(swatch.name, index)}: ${swatch.hex};`)
        .join('\n')}\n`;

    case 'tailwind':
      return [
        'colors: {',
        ...swatches.map((swatch, index) => `  '${slug(swatch.name, index)}': '${swatch.hex}',`),
        '}',
        '',
      ].join('\n');

    case 'json':
      return `${JSON.stringify(
        swatches.map((swatch) => ({
          hex: swatch.hex,
          rgb: swatch.rgb,
          hsl: swatch.hsl,
          name: swatch.name,
          coverage: swatch.origin === 'picked' ? null : Number((swatch.coverage * 100).toFixed(2)),
          contrast: {
            onWhite: Number(swatch.contrastWhite.toFixed(2)),
            onBlack: Number(swatch.contrastBlack.toFixed(2)),
          },
          role: swatch.role ?? null,
          origin: swatch.origin,
        })),
        null,
        2
      )}\n`;

    case 'svg':
      return paletteToSvg(swatches);

    case 'list':
    default:
      return `${swatches.map((swatch) => swatch.hex).join('\n')}\n`;
  }
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}
