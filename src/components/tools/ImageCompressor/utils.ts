import type { OutputFormat, Preset } from './types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

export const FORMAT_LABELS: Record<OutputFormat, string> = {
  original: 'Keep original',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
};

export function extensionForMime(mime: string, fallbackName: string): string {
  const known = EXTENSION_BY_MIME[mime];
  if (known) return known;
  const fromName = fallbackName.split('.').pop();
  return fromName && fromName !== fallbackName ? fromName.toLowerCase() : 'img';
}

/**
 * Always derive the extension from the blob's real MIME type — reusing the source
 * extension ships a WebP file named `photo.png` as soon as conversion is enabled.
 */
export function buildOutputName(originalName: string, outputMime: string): string {
  const base = originalName.replace(/\.[^/.]+$/, '') || 'image';
  return `${base}_compressed.${extensionForMime(outputMime, originalName)}`;
}

/**
 * Browsers silently fall back to PNG when asked to encode a type they don't
 * support, which would make output *larger*. Probe before offering the format.
 */
export function detectEncodeSupport(mime: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL(mime).startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

export function readImageDimensions(
  url: string
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Canvas re-encoding keeps only the first frame of an animated GIF. Count the
 * Graphic Control Extension blocks (0x21 0xF9 0x04) so we can warn up front.
 */
export async function isAnimatedGif(file: File): Promise<boolean> {
  if (file.type !== 'image/gif') return false;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let frames = 0;
    for (let i = 0; i < bytes.length - 3; i++) {
      if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04) {
        frames++;
        if (frames > 1) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export const RESIZE_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Don't resize", value: null },
  { label: '4K — 3840px', value: 3840 },
  { label: '2K — 2560px', value: 2560 },
  { label: 'Full HD — 1920px', value: 1920 },
  { label: 'HD — 1280px', value: 1280 },
  { label: 'Web — 1080px', value: 1080 },
  { label: 'Small — 800px', value: 800 },
];

export const QUALITY_PRESETS = [
  { label: 'Maximum', value: 0.95 },
  { label: 'Balanced', value: 0.8 },
  { label: 'Small', value: 0.6 },
  { label: 'Tiny', value: 0.4 },
];

export function buildPresets(webpSupported: boolean): Preset[] {
  const efficient: OutputFormat = webpSupported ? 'image/webp' : 'image/jpeg';
  return [
    {
      id: 'web',
      label: 'Web',
      hint: `${webpSupported ? 'WebP' : 'JPEG'} · 1920px · 80%`,
      settings: {
        mode: 'quality',
        format: efficient,
        maxDimension: 1920,
        quality: 0.8,
        stripMetadata: true,
      },
    },
    {
      id: 'email',
      label: 'Email',
      hint: 'JPEG · 1280px · under 2 MB',
      settings: {
        mode: 'targetSize',
        format: 'image/jpeg',
        maxDimension: 1280,
        targetSizeKB: 2048,
        stripMetadata: true,
      },
    },
    {
      id: 'social',
      label: 'Social',
      hint: 'JPEG · 1080px · 85%',
      settings: {
        mode: 'quality',
        format: 'image/jpeg',
        maxDimension: 1080,
        quality: 0.85,
        stripMetadata: true,
      },
    },
    {
      id: 'archive',
      label: 'Archive',
      hint: 'Keep format · full size · 95%',
      settings: {
        mode: 'quality',
        format: 'original',
        maxDimension: null,
        quality: 0.95,
        stripMetadata: false,
      },
    },
  ];
}
