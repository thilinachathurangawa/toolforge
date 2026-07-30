import type { BlendMode, CropRatioPreset, DocSize, ShapeKind } from './types';

export const MAX_HISTORY_STEPS = 100;

export const AUTOSAVE_DB_NAME = 'toolforge-image-editor';
export const AUTOSAVE_STORE_NAME = 'sessions';
export const AUTOSAVE_KEY = 'current-session';

export const CROP_RATIO_PRESETS: CropRatioPreset[] = [
  { id: 'free', label: 'Free', ratio: null },
  { id: '1-1', label: '1:1', ratio: 1 },
  { id: '4-3', label: '4:3', ratio: 4 / 3 },
  { id: '16-9', label: '16:9', ratio: 16 / 9 },
  { id: '9-16', label: '9:16', ratio: 9 / 16 },
];

export const SOCIAL_CROP_PRESETS: (CropRatioPreset & { size: DocSize })[] = [
  { id: 'ig-post', label: 'Instagram Post', ratio: 1, size: { width: 1080, height: 1080 } },
  { id: 'ig-story', label: 'Instagram Story', ratio: 9 / 16, size: { width: 1080, height: 1920 } },
  { id: 'fb-cover', label: 'Facebook Cover', ratio: 820 / 312, size: { width: 820, height: 312 } },
  { id: 'linkedin-banner', label: 'LinkedIn Banner', ratio: 1584 / 396, size: { width: 1584, height: 396 } },
  { id: 'yt-thumb', label: 'YouTube Thumbnail', ratio: 16 / 9, size: { width: 1280, height: 720 } },
  { id: 'x-post', label: 'Twitter / X Post', ratio: 1600 / 900, size: { width: 1600, height: 900 } },
];

export const NEW_DOC_PRESETS: { id: string; label: string; size: DocSize }[] = [
  { id: 'square', label: 'Square (1080×1080)', size: { width: 1080, height: 1080 } },
  { id: 'landscape', label: 'Landscape (1600×900)', size: { width: 1600, height: 900 } },
  { id: 'portrait', label: 'Portrait (1080×1350)', size: { width: 1080, height: 1350 } },
  { id: 'a4', label: 'A4 Print (2480×3508)', size: { width: 2480, height: 3508 } },
];

export const FONT_FAMILIES = [
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
];

export const BLEND_MODE_LABELS: Record<BlendMode, string> = {
  'source-over': 'Normal',
  multiply: 'Multiply',
  screen: 'Screen',
  overlay: 'Overlay',
  darken: 'Darken',
  lighten: 'Lighten',
  difference: 'Difference',
  'color-dodge': 'Color Dodge',
  'color-burn': 'Color Burn',
};

export const SHAPE_LABELS: Record<ShapeKind, string> = {
  rect: 'Rectangle',
  'rounded-rect': 'Rounded Rectangle',
  ellipse: 'Ellipse',
  triangle: 'Triangle',
  line: 'Line',
  arrow: 'Arrow',
  polygon: 'Polygon',
  star: 'Star',
  heart: 'Heart',
};

export const ZOOM_STEPS = [0.1, 0.25, 0.5, 1, 1.5, 2, 3, 4, 8, 16];

export const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/avif',
  'image/heic',
  'image/heif',
];

export const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.ico,.avif,.heic,.heif';
