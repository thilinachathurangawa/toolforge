// src/lib/constants/tools.ts
// Central registry of all tools — drives routing, SEO, and UI

export type ToolCategory =
  | 'image'
  | 'text'
  | 'developer'
  | 'converter'
  | 'generator'
  | 'calculator'
  | 'security';

export interface Tool {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  keywords: string[];
  icon: string;
  isNew?: boolean;
  isPopular?: boolean;
  relatedTools?: string[];
  phase: 1 | 2 | 3 | 4; // which phase this tool ships in
}

export const TOOLS: Tool[] = [
  // ── Phase 2: Core Tools ──────────────────────────────────────────

  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    shortDescription: 'Compress JPG, PNG, WebP without losing quality',
    description:
      'Compress and optimize images online for free. Reduce JPG, PNG, and WebP file sizes without losing quality. No upload required — works in your browser.',
    category: 'image',
    tags: ['compress', 'optimize', 'jpg', 'png', 'webp', 'image', 'reduce'],
    keywords: ['compress image online free', 'reduce image size', 'image optimizer'],
    icon: 'ImageDown',
    isPopular: true,
    relatedTools: ['image-resizer', 'image-converter', 'image-cropper'],
    phase: 2,
  },
  {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    shortDescription: 'Create QR codes for URLs, text, WiFi, and more',
    description:
      'Generate QR codes for URLs, text, email, phone, and WiFi for free. Download as PNG or SVG. No sign-up required.',
    category: 'generator',
    tags: ['qr', 'qrcode', 'barcode', 'generate', 'url', 'wifi'],
    keywords: ['free QR code generator', 'create QR code online', 'QR code maker'],
    icon: 'QrCode',
    isPopular: true,
    relatedTools: ['barcode-generator', 'password-generator'],
    phase: 2,
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    shortDescription: 'Generate strong, random, secure passwords',
    description:
      'Generate strong, random, secure passwords instantly. Customize length, symbols, numbers, and more. Free online password generator.',
    category: 'security',
    tags: ['password', 'security', 'random', 'secure', 'generate'],
    keywords: ['strong password generator', 'random password generator', 'secure password'],
    icon: 'KeyRound',
    isPopular: true,
    relatedTools: ['hash-generator', 'uuid-generator'],
    phase: 2,
  },
  {
    slug: 'image-cropper',
    name: 'Image Cropper',
    shortDescription: 'Crop and resize images with custom aspect ratios',
    description:
      'Crop and resize images online for free. Supports custom ratios, square, 16:9, and more. Download cropped image instantly.',
    category: 'image',
    tags: ['crop', 'resize', 'cut', 'image', 'aspect ratio'],
    keywords: ['crop image online free', 'image crop tool', 'cut image online'],
    icon: 'Crop',
    relatedTools: ['image-compressor', 'image-resizer', 'image-converter'],
    phase: 2,
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortDescription: 'Format, validate, and beautify JSON online',
    description:
      'Format, beautify, and validate JSON online for free. Minify JSON, fix errors, and view JSON tree structure. No sign-up required.',
    category: 'developer',
    tags: ['json', 'format', 'validate', 'beautify', 'minify', 'developer'],
    keywords: ['JSON formatter online', 'JSON beautifier', 'validate JSON', 'format JSON'],
    icon: 'Braces',
    isPopular: true,
    relatedTools: ['base64-encoder', 'url-encoder', 'hash-generator'],
    phase: 2,
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, sentences in real time',
    description:
      'Count words, characters, sentences, and paragraphs in real time. Free online word counter for writers, students, and bloggers.',
    category: 'text',
    tags: ['word', 'character', 'count', 'text', 'writer', 'sentence'],
    keywords: ['word counter online', 'character count', 'word count tool'],
    icon: 'AlignLeft',
    relatedTools: ['lorem-ipsum', 'case-converter', 'markdown-previewer'],
    phase: 2,
  },
  {
    slug: 'color-palette',
    name: 'Color Palette Extractor',
    shortDescription: 'Extract dominant colors from any image',
    description:
      'Upload an image and instantly extract its dominant color palette. Get HEX, RGB, and HSL codes. Free, no sign-up required.',
    category: 'image',
    tags: ['color', 'palette', 'extract', 'image', 'hex', 'rgb'],
    keywords: ['color palette from image', 'extract colors from image', 'dominant colors'],
    icon: 'Palette',
    relatedTools: ['image-compressor', 'image-cropper', 'color-picker'],
    phase: 2,
  },
  {
    slug: 'base64-encoder',
    name: 'Base64 Encoder / Decoder',
    shortDescription: 'Encode and decode text, files, and images to Base64',
    description:
      'Encode text or files to Base64 and decode Base64 strings online for free. Supports text, images, and files.',
    category: 'developer',
    tags: ['base64', 'encode', 'decode', 'developer', 'convert'],
    keywords: ['base64 encode online', 'base64 decoder', 'text to base64'],
    icon: 'Binary',
    relatedTools: ['url-encoder', 'hash-generator', 'json-formatter'],
    phase: 2,
  },

  // ── Phase 3: Extended Tools ───────────────────────────────────────

  {
    slug: 'image-resizer',
    name: 'Image Resizer',
    shortDescription: 'Resize images to any width and height online for free',
    description: 'Resize images to any width and height online for free. Maintain aspect ratio or set custom dimensions. Download resized images instantly.',
    category: 'image',
    tags: ['resize', 'image', 'dimension', 'scale', 'width', 'height'],
    keywords: ['resize image online free', 'change image size', 'image dimensions', 'resize photo', 'scale image'],
    icon: 'Maximize',
    relatedTools: ['image-compressor', 'image-cropper'],
    phase: 3,
  },
  {
    slug: 'image-converter',
    name: 'Image Format Converter',
    shortDescription: 'Convert between JPG, PNG, WebP, GIF formats',
    description: 'Convert images between JPG, PNG, WebP, and GIF formats online for free. Fast browser-based conversion.',
    category: 'image',
    tags: ['convert', 'format', 'jpg', 'png', 'webp', 'image'],
    keywords: ['image format converter', 'convert png to jpg', 'webp converter'],
    icon: 'RefreshCw',
    relatedTools: ['image-compressor', 'image-resizer'],
    phase: 3,
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    shortDescription: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes online for free. Instant hash generation with no data sent to server.',
    category: 'security',
    tags: ['hash', 'md5', 'sha256', 'sha1', 'sha512', 'crypto', 'security'],
    keywords: ['hash generator online', 'MD5 hash', 'SHA-256 generator', 'SHA-1 hash', 'cryptographic hash'],
    icon: 'Hash',
    relatedTools: ['password-generator', 'base64-encoder'],
    phase: 3,
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    shortDescription: 'Encode and decode URL strings',
    description: 'Encode and decode URL strings and query parameters online for free.',
    category: 'developer',
    tags: ['url', 'encode', 'decode', 'percent', 'developer'],
    keywords: ['URL encoder online', 'URL decoder', 'percent encode'],
    icon: 'Link',
    relatedTools: ['base64-encoder', 'json-formatter'],
    phase: 3,
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    shortDescription: 'Convert length, weight, temperature, and more',
    description: 'Convert between units of length, weight, temperature, area, speed, and more. Free online unit converter.',
    category: 'converter',
    tags: ['unit', 'convert', 'length', 'weight', 'temperature'],
    keywords: ['unit converter online', 'length converter', 'weight converter'],
    icon: 'ArrowLeftRight',
    relatedTools: [],
    phase: 3,
  },
  {
    slug: 'markdown-previewer',
    name: 'Markdown Previewer',
    shortDescription: 'Write and preview Markdown in real time',
    description: 'Write Markdown and see a live preview side by side. Supports GitHub Flavored Markdown.',
    category: 'text',
    tags: ['markdown', 'preview', 'text', 'editor', 'github'],
    keywords: ['markdown previewer online', 'markdown editor', 'live markdown preview'],
    icon: 'FileText',
    relatedTools: ['word-counter', 'lorem-ipsum'],
    phase: 3,
  },
  {
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    shortDescription: 'Generate placeholder text for designs',
    description: 'Generate Lorem Ipsum placeholder text instantly. Choose words, sentences, or paragraphs. Perfect for designs and mockups.',
    category: 'generator',
    tags: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy', 'filler'],
    keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text generator', 'lorem ipsum text', 'filler text'],
    icon: 'Type',
    relatedTools: ['word-counter', 'markdown-previewer'],
    phase: 3,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────

export const CATEGORIES: { value: ToolCategory; label: string; icon: string }[] = [
  { value: 'image', label: 'Image Tools', icon: 'Image' },
  { value: 'text', label: 'Text Tools', icon: 'Type' },
  { value: 'developer', label: 'Developer Tools', icon: 'Code2' },
  { value: 'converter', label: 'Converters', icon: 'ArrowLeftRight' },
  { value: 'generator', label: 'Generators', icon: 'Wand2' },
  { value: 'calculator', label: 'Calculators', icon: 'Calculator' },
  { value: 'security', label: 'Security', icon: 'Shield' },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

export function getRelatedTools(slug: string): Tool[] {
  const tool = getTool(slug);
  if (!tool?.relatedTools) return [];
  return tool.relatedTools
    .map((s) => getTool(s))
    .filter((t): t is Tool => t !== undefined);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase();
  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q))
  );
}
