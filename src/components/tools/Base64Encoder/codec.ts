/**
 * Pure Base64 / Base32 / Hex codec used by the Base64 Encoder tool.
 * Kept free of React and DOM-only APIs so the conversion rules can be
 * reasoned about — and tested — on their own.
 */

export type Alphabet = 'base64' | 'base64url' | 'base32' | 'hex';
export type Charset = 'utf-8' | 'latin1';
export type PaddingMode = 'default' | 'add' | 'remove';

export const MIME_EXTENSIONS: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
  'image/svg+xml': '.svg',
  'image/x-icon': '.ico',
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/gzip': '.gz',
  'application/json': '.json',
  'text/plain': '.txt',
  'text/html': '.html',
  'text/csv': '.csv',
};

export const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const CHUNK = 0x8000;

/* ------------------------- byte-level helpers ------------------------- */

export function textToBytes(text: string, charset: Charset): Uint8Array {
  if (charset === 'utf-8') return new TextEncoder().encode(text);

  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0xff) {
      throw new Error(
        `"${text[i]}" cannot be represented in Latin-1/ASCII. Switch the character set to UTF-8.`
      );
    }
    out[i] = code;
  }
  return out;
}

export function bytesToText(bytes: Uint8Array, charset: Charset): string {
  if (charset === 'utf-8') return new TextDecoder('utf-8').decode(bytes);

  let out = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode(...Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function bytesToBase32(bytes: Uint8Array): string {
  let out = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += B32_ALPHABET[(value >>> bits) & 31];
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
  while (out.length % 8) out += '=';
  return out;
}

export function base32ToBytes(raw: string): Uint8Array {
  const clean = cleanBase32(raw);
  const out: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < clean.length; i++) {
    const index = B32_ALPHABET.indexOf(clean[i]);
    if (index === -1) throw new Error(`"${clean[i]}" is not a valid Base32 character.`);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 255);
    }
  }
  return new Uint8Array(out);
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

export function hexToBytes(raw: string): Uint8Array {
  const clean = cleanHex(raw);
  if (clean.length % 2) throw new Error('Hex input has an odd number of digits.');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) throw new Error('Hex input contains invalid digits.');
    out[i / 2] = byte;
  }
  return out;
}

/* --------------------------- input cleaning --------------------------- */

/** Splits a `data:<mime>;base64,<payload>` URI into its parts. */
export function splitDataUri(raw: string): { body: string; mime: string | null } {
  const value = raw.trim();
  if (!/^data:/i.test(value)) return { body: value, mime: null };

  const marker = value.toLowerCase().indexOf(';base64,');
  if (marker === -1) return { body: value, mime: null };

  const header = value.slice(5, marker);
  return { body: value.slice(marker + ';base64,'.length), mime: header.split(';')[0] || null };
}

/** Whitespace-tolerant, URL-safe-tolerant, padding-repairing Base64 cleanup. */
export function normalizeBase64(raw: string): string {
  let value = splitDataUri(raw).body.replace(/\s+/g, '');
  value = value.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  const remainder = value.length % 4;
  if (remainder === 2 || remainder === 3) value += '='.repeat(4 - remainder);
  return value;
}

export function cleanBase32(raw: string): string {
  return splitDataUri(raw).body.toUpperCase().replace(/[\s=]/g, '');
}

export function cleanHex(raw: string): string {
  return raw.trim().replace(/^0x/i, '').replace(/[\s:,_-]/g, '');
}

/* ---------------------------- codec facade ---------------------------- */

export function validateEncoded(raw: string, alphabet: Alphabet): { ok: true } | { ok: false; error: string } {
  if (alphabet === 'hex') {
    const clean = cleanHex(raw);
    if (!clean) return { ok: false, error: 'Nothing to decode.' };
    if (/[^0-9a-f]/i.test(clean)) {
      return { ok: false, error: 'Input contains characters that are not valid hexadecimal digits.' };
    }
    if (clean.length % 2) {
      return { ok: false, error: 'Hex input has an odd number of digits, so it cannot map to whole bytes.' };
    }
    return { ok: true };
  }

  if (alphabet === 'base32') {
    const clean = cleanBase32(raw);
    if (!clean) return { ok: false, error: 'Nothing to decode.' };
    if (/[^A-Z2-7]/.test(clean)) {
      return { ok: false, error: 'Input contains characters that are not valid Base32 (A–Z and 2–7 only).' };
    }
    return { ok: true };
  }

  const normalized = normalizeBase64(raw);
  if (!normalized) return { ok: false, error: 'Nothing to decode.' };
  if (/[^A-Za-z0-9+/=]/.test(normalized)) {
    return { ok: false, error: 'Input contains characters that are not valid Base64.' };
  }
  if (normalized.length % 4 !== 0) {
    return {
      ok: false,
      error: 'This string cannot be padded to a multiple of 4 characters — it looks truncated.',
    };
  }
  try {
    atob(normalized);
  } catch {
    return { ok: false, error: 'The input is not decodable Base64.' };
  }
  return { ok: true };
}

export function decodeToBytes(raw: string, alphabet: Alphabet): Uint8Array {
  if (alphabet === 'hex') return hexToBytes(raw);
  if (alphabet === 'base32') return base32ToBytes(raw);
  return base64ToBytes(normalizeBase64(raw));
}

export function encodeBytes(bytes: Uint8Array, alphabet: Alphabet, urlSafe: boolean): string {
  if (alphabet === 'hex') return bytesToHex(bytes);
  if (alphabet === 'base32') return bytesToBase32(bytes);

  const base64 = bytesToBase64(bytes);
  if (alphabet === 'base64url' || urlSafe) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return base64;
}

export function applyPadding(value: string, padding: PaddingMode, alphabet: Alphabet): string {
  if (padding === 'default' || alphabet === 'hex') return value;
  const stripped = value.replace(/=+$/, '');
  if (padding === 'remove') return stripped;

  const block = alphabet === 'base32' ? 8 : 4;
  let padded = stripped;
  while (padded.length % block) padded += '=';
  return padded;
}

export function wrapLines(value: string, length: number): string {
  if (!Number.isFinite(length) || length < 1) return value;
  const lines: string[] = [];
  for (let i = 0; i < value.length; i += length) lines.push(value.slice(i, i + length));
  return lines.join('\n');
}

/* --------------------------- content sniffing --------------------------- */

export function printableRatio(bytes: Uint8Array): number {
  if (!bytes.length) return 0;
  const limit = Math.min(bytes.length, 4096);
  let printable = 0;
  for (let i = 0; i < limit; i++) {
    const byte = bytes[i];
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte !== 127)) printable++;
  }
  return printable / limit;
}

/** True when the bytes are valid UTF-8 and read as text rather than binary. */
export function decodesToText(bytes: Uint8Array): boolean {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return false;
  }
  return printableRatio(bytes) >= 0.9;
}

/**
 * Auto-detect guard. Short words like "test" are technically valid Base64, so a
 * candidate must also be long enough and decode to something text-like.
 */
export function looksEncoded(raw: string, alphabet: Alphabet): boolean {
  const trimmed = raw.trim();
  if (trimmed.length < 8) return false;
  if (/^data:[^,]*;base64,/i.test(trimmed)) return true;

  const validation = validateEncoded(trimmed, alphabet);
  if (!validation.ok) return false;

  try {
    const bytes = decodeToBytes(trimmed, alphabet);
    return bytes.length > 0 && decodesToText(bytes);
  } catch {
    return false;
  }
}

export function sniffMime(bytes: Uint8Array): string {
  const startsWith = (signature: number[]) =>
    bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);

  if (startsWith([0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (startsWith([0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return 'image/gif';
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (startsWith([0x42, 0x4d])) return 'image/bmp';
  if (startsWith([0x00, 0x00, 0x01, 0x00])) return 'image/x-icon';
  if (startsWith([0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
  if (startsWith([0x1f, 0x8b])) return 'application/gzip';
  if (startsWith([0x50, 0x4b, 0x03, 0x04])) return 'application/zip';

  if (printableRatio(bytes) >= 0.95) {
    const head = new TextDecoder('utf-8').decode(bytes.subarray(0, 64)).trimStart();
    if (head.startsWith('{') || head.startsWith('[')) return 'application/json';
    if (head.startsWith('<svg') || head.startsWith('<?xml')) return 'image/svg+xml';
    return 'text/plain';
  }
  return 'application/octet-stream';
}

export function extensionFor(mime: string): string {
  return MIME_EXTENSIONS[mime] || '';
}

/* ------------------------------ formatting ------------------------------ */

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string | null> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes));
  return bytesToHex(new Uint8Array(digest));
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}
