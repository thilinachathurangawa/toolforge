// Pixel-level helpers: magic-wand / bucket-fill flood fill, the eyedropper's
// pixel read, and building a flood-filled region into something usable as a
// Fabric.js clipPath. All operate on canvas ImageData in the browser.

import { FabricImage, type FabricObject } from 'fabric';

export function getElementNaturalSize(el: HTMLImageElement | HTMLCanvasElement): {
  width: number;
  height: number;
} {
  if (el instanceof HTMLCanvasElement) return { width: el.width, height: el.height };
  return { width: el.naturalWidth || el.width, height: el.naturalHeight || el.height };
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, '0');
}

/** Reads a single pixel from a rendered canvas element and returns it as a hex color. */
export function pickColorFromCanvas(canvasEl: HTMLCanvasElement, x: number, y: number): string | null {
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return null;
  const px = Math.max(0, Math.min(canvasEl.width - 1, Math.round(x)));
  const py = Math.max(0, Math.min(canvasEl.height - 1, Math.round(y)));
  const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Flood-fills a contiguous region starting at (seedX, seedY) using a
 * Euclidean RGBA color-distance tolerance, 4-connected. Returns a same-sized
 * canvas whose opaque white pixels mark the matched region — usable as a
 * mask for the magic wand, quick "bucket" fill, or a background cutout.
 */
export function floodFillMask(
  source: HTMLImageElement | HTMLCanvasElement,
  seedX: number,
  seedY: number,
  tolerance: number
): HTMLCanvasElement {
  const { width: w, height: h } = getElementNaturalSize(source);
  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sctx = src.getContext('2d', { willReadFrequently: true });
  if (!sctx) throw new Error('Could not read image pixels.');
  sctx.drawImage(source, 0, 0, w, h);
  const { data } = sctx.getImageData(0, 0, w, h);

  const mask = document.createElement('canvas');
  mask.width = w;
  mask.height = h;
  const mctx = mask.getContext('2d');
  if (!mctx) throw new Error('Could not build the selection mask.');
  const maskData = mctx.createImageData(w, h);

  const sx = Math.max(0, Math.min(w - 1, Math.round(seedX)));
  const sy = Math.max(0, Math.min(h - 1, Math.round(seedY)));
  const seedIdx = (sy * w + sx) * 4;
  const sr = data[seedIdx];
  const sg = data[seedIdx + 1];
  const sb = data[seedIdx + 2];
  const sa = data[seedIdx + 3];
  const tol = tolerance * 2.55; // map a 0-100 tolerance slider onto the 0-255 channel scale

  const visited = new Uint8Array(w * h);
  const stack: number[] = [sy * w + sx];
  visited[sy * w + sx] = 1;

  while (stack.length) {
    const p = stack.pop() as number;
    const x = p % w;
    const y = (p - x) / w;
    const i = p * 4;
    const dr = data[i] - sr;
    const dg = data[i + 1] - sg;
    const db = data[i + 2] - sb;
    const da = data[i + 3] - sa;
    if (Math.sqrt(dr * dr + dg * dg + db * db + da * da) > tol) continue;

    maskData.data[i] = 255;
    maskData.data[i + 1] = 255;
    maskData.data[i + 2] = 255;
    maskData.data[i + 3] = 255;

    if (x > 0 && !visited[p - 1]) {
      visited[p - 1] = 1;
      stack.push(p - 1);
    }
    if (x < w - 1 && !visited[p + 1]) {
      visited[p + 1] = 1;
      stack.push(p + 1);
    }
    if (y > 0 && !visited[p - w]) {
      visited[p - w] = 1;
      stack.push(p - w);
    }
    if (y < h - 1 && !visited[p + w]) {
      visited[p + w] = 1;
      stack.push(p + w);
    }
  }

  mctx.putImageData(maskData, 0, 0);
  return mask;
}

/**
 * Wraps a mask canvas (as produced by floodFillMask, or a rect/ellipse/lasso
 * selection rendered to a canvas the same size as `target`) into a
 * Fabric.js clipPath positioned to align with `target`'s own local
 * (unscaled) coordinate space, so it lines up regardless of the target's
 * current scale/rotation.
 */
export function maskToClipPath(
  maskCanvas: HTMLCanvasElement,
  target: FabricObject,
  inverted: boolean
): FabricImage {
  const width = target.width ?? maskCanvas.width;
  const height = target.height ?? maskCanvas.height;
  const clip = new FabricImage(maskCanvas, {
    left: -width / 2,
    top: -height / 2,
    originX: 'left',
    originY: 'top',
    width: maskCanvas.width,
    height: maskCanvas.height,
    scaleX: width / maskCanvas.width,
    scaleY: height / maskCanvas.height,
  });
  clip.inverted = inverted;
  clip.isHelper = true;
  return clip;
}
