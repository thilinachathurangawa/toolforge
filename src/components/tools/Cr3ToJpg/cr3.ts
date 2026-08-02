/**
 * CR3 (Canon RAW v3) reader.
 *
 * A .CR3 is an ISO base media file (the same box container MP4 uses). Alongside
 * the compressed sensor data it stores complete JPEG renderings produced by the
 * camera — a full-resolution one in the first `trak`, a ~1620px `PRVW`, and a
 * small `THMB` — plus EXIF in the Canon `uuid` box as `CMT1` (IFD0), `CMT2`
 * (Exif IFD) and `CMT4` (GPS IFD), each a self-contained little-endian TIFF.
 *
 * This module locates those JPEGs and parses/rebuilds the EXIF. It does not
 * demosaic the raw sensor data — that needs a full RAW pipeline.
 */

/* ------------------------------------------------------------------ */
/* ISO-BMFF container                                                  */
/* ------------------------------------------------------------------ */

const CANON_UUID = '85c0b687820f11e08111f4ce462b6a48';
const PREVIEW_UUID = 'eaf42b5e1c984b88b9fbb7dc406e4d16';

/** Boxes we descend into generically; `trak` and `uuid` are handled by name. */
const CONTAINER_BOXES = new Set(['moov']);

/** Don't pull a whole `mdat` into memory just because it is a `uuid` sibling. */
const MAX_INLINE_BOX = 48 * 1024 * 1024;

export interface JpegCandidate {
  /** Absolute byte offset in the file. */
  offset: number;
  length: number;
  /** Where it came from, e.g. "full-size preview". */
  source: string;
}

export interface Cr3Container {
  candidates: JpegCandidate[];
  cmt1?: Uint8Array;
  cmt2?: Uint8Array;
  cmt4?: Uint8Array;
}

interface Box {
  type: string;
  uuid?: string;
  /** Absolute file offsets. */
  dataStart: number;
  dataEnd: number;
  end: number;
}

const readU16BE = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const readU32BE = (b: Uint8Array, o: number) =>
  ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;

function boxType(b: Uint8Array, o: number): string {
  return String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
}

function hex(b: Uint8Array, o: number, len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += b[o + i].toString(16).padStart(2, '0');
  return s;
}

/**
 * Walk sibling boxes in [from, to). `buf` holds the bytes for the file range
 * starting at `bufBase`; all offsets in and out are absolute file offsets.
 */
function* iterBoxes(buf: Uint8Array, bufBase: number, from: number, to: number): Generator<Box> {
  let pos = from;
  while (pos + 8 <= to) {
    const i = pos - bufBase;
    if (i < 0 || i + 8 > buf.length) return;

    let size = readU32BE(buf, i);
    let dataStart = pos + 8;

    if (size === 1) {
      if (i + 16 > buf.length) return;
      // 64-bit size: the high word is never meaningfully large for our files.
      size = readU32BE(buf, i + 8) * 0x100000000 + readU32BE(buf, i + 12);
      dataStart = pos + 16;
    } else if (size === 0) {
      size = to - pos;
    }
    if (size < dataStart - pos || pos + size > to) return;

    const type = boxType(buf, i + 4);
    let uuid: string | undefined;
    if (type === 'uuid') {
      if (dataStart - bufBase + 16 > buf.length) return;
      uuid = hex(buf, dataStart - bufBase, 16);
      dataStart += 16;
    }

    yield { type, uuid, dataStart, dataEnd: pos + size, end: pos + size };
    pos += size;
  }
}

/** First sample of a track: `stco`/`co64` gives the offset, `stsz` the length. */
function readSampleTable(buf: Uint8Array, base: number, from: number, to: number) {
  let offset: number | null = null;
  let length: number | null = null;

  for (const box of iterBoxes(buf, base, from, to)) {
    const i = box.dataStart - base;
    if (box.type === 'stco') {
      if (readU32BE(buf, i + 4) > 0) offset = readU32BE(buf, i + 8);
    } else if (box.type === 'co64') {
      if (readU32BE(buf, i + 4) > 0) {
        offset = readU32BE(buf, i + 8) * 0x100000000 + readU32BE(buf, i + 12);
      }
    } else if (box.type === 'stsz') {
      const uniform = readU32BE(buf, i + 4);
      const count = readU32BE(buf, i + 8);
      if (uniform > 0) length = uniform;
      else if (count > 0) length = readU32BE(buf, i + 12);
    }
  }
  return offset !== null && length !== null ? { offset, length } : null;
}

/** THMB/PRVW wrap their JPEG behind a short fixed header; find the SOI. */
function jpegInsideBox(buf: Uint8Array, base: number, box: Box, source: string): JpegCandidate | null {
  const start = box.dataStart - base;
  const end = Math.min(box.dataEnd - base, buf.length);
  const searchTo = Math.min(start + 64, end - 3);
  for (let i = start; i <= searchTo; i++) {
    if (buf[i] === 0xff && buf[i + 1] === 0xd8 && buf[i + 2] === 0xff) {
      return { offset: base + i, length: end - i, source };
    }
  }
  return null;
}

function scanBoxes(buf: Uint8Array, base: number, from: number, to: number, out: Cr3Container): void {
  for (const box of iterBoxes(buf, base, from, to)) {
    if (box.type === 'trak') {
      const sample = readSampleTableIn(buf, base, box);
      if (sample && sample.length > 1024) {
        out.candidates.push({ ...sample, source: 'embedded preview' });
      }
      continue;
    }

    if (CONTAINER_BOXES.has(box.type)) {
      scanBoxes(buf, base, box.dataStart, box.dataEnd, out);
      continue;
    }

    switch (box.type) {
      case 'uuid':
        if (box.uuid === CANON_UUID || box.uuid === PREVIEW_UUID) {
          scanBoxes(buf, base, box.dataStart, box.dataEnd, out);
        }
        break;
      case 'CMT1':
        out.cmt1 = buf.slice(box.dataStart - base, box.dataEnd - base);
        break;
      case 'CMT2':
        out.cmt2 = buf.slice(box.dataStart - base, box.dataEnd - base);
        break;
      case 'CMT4':
        out.cmt4 = buf.slice(box.dataStart - base, box.dataEnd - base);
        break;
      case 'PRVW': {
        const found = jpegInsideBox(buf, base, box, 'preview image');
        if (found) out.candidates.push(found);
        break;
      }
      case 'THMB': {
        const found = jpegInsideBox(buf, base, box, 'thumbnail');
        if (found) out.candidates.push(found);
        break;
      }
    }
  }
}

/** Descend a `trak` to its `stbl` and read the first sample's location. */
function readSampleTableIn(buf: Uint8Array, base: number, trak: Box) {
  for (const mdia of iterBoxes(buf, base, trak.dataStart, trak.dataEnd)) {
    if (mdia.type !== 'mdia') continue;
    for (const minf of iterBoxes(buf, base, mdia.dataStart, mdia.dataEnd)) {
      if (minf.type !== 'minf') continue;
      for (const stbl of iterBoxes(buf, base, minf.dataStart, minf.dataEnd)) {
        if (stbl.type !== 'stbl') continue;
        const sample = readSampleTable(buf, base, stbl.dataStart, stbl.dataEnd);
        if (sample) return sample;
      }
    }
  }
  return null;
}

async function readRange(file: File, start: number, length: number): Promise<Uint8Array> {
  const end = Math.min(file.size, start + length);
  if (start >= end) return new Uint8Array(0);
  return new Uint8Array(await file.slice(start, end).arrayBuffer());
}

export function isIsoBmff(head: Uint8Array): boolean {
  return head.length >= 12 && boxType(head, 4) === 'ftyp';
}

/**
 * Read the container. Only `moov` and small `uuid` boxes are loaded; the JPEG
 * payloads themselves are left in the file and fetched on demand, so a 50 MB
 * CR3 never lands in memory whole.
 */
export async function readCr3Container(file: File): Promise<Cr3Container> {
  const out: Cr3Container = { candidates: [] };
  let pos = 0;

  while (pos + 8 <= file.size) {
    const header = await readRange(file, pos, 32);
    if (header.length < 8) break;

    let size = readU32BE(header, 0);
    let headerLen = 8;
    if (size === 1) {
      if (header.length < 16) break;
      size = readU32BE(header, 8) * 0x100000000 + readU32BE(header, 12);
      headerLen = 16;
    } else if (size === 0) {
      size = file.size - pos;
    }
    if (size < headerLen || pos + size > file.size) break;

    const type = boxType(header, 4);
    if ((type === 'moov' || type === 'uuid') && size <= MAX_INLINE_BOX) {
      const body = await readRange(file, pos, size);
      scanBoxes(body, pos, pos, pos + size, out);
    }
    pos += size;
  }

  return out;
}

/** Last-resort sweep for files whose box structure we couldn't follow. */
export async function scanForJpegs(file: File): Promise<JpegCandidate[]> {
  const bytes = await readRange(file, 0, file.size);
  const found: JpegCandidate[] = [];

  for (let i = 0; i + 3 < bytes.length && found.length < 16; i++) {
    if (bytes[i] !== 0xff || bytes[i + 1] !== 0xd8 || bytes[i + 2] !== 0xff) continue;
    const end = walkJpeg(bytes, i);
    if (end && end - i > 8 * 1024) {
      found.push({ offset: i, length: end - i, source: 'recovered image' });
      i = end - 1;
    }
  }
  return found;
}

/** Follow JPEG markers from SOI to EOI; returns the offset just past EOI. */
function walkJpeg(b: Uint8Array, start: number): number | null {
  let o = start + 2;
  while (o + 1 < b.length) {
    if (b[o] !== 0xff) return null;
    const marker = b[o + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01 || marker === 0xff) {
      o += 2;
      continue;
    }
    if (marker === 0xd9) return o + 2;
    if (o + 3 >= b.length) return null;
    const len = readU16BE(b, o + 2);
    if (len < 2) return null;
    if (marker === 0xda) {
      // Entropy-coded data follows; skip to the next non-RST marker.
      o += 2 + len;
      while (o + 1 < b.length) {
        if (b[o] === 0xff && b[o + 1] !== 0x00 && !(b[o + 1] >= 0xd0 && b[o + 1] <= 0xd7)) break;
        o++;
      }
      continue;
    }
    o += 2 + len;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* TIFF / EXIF                                                         */
/* ------------------------------------------------------------------ */

export interface TiffEntry {
  tag: number;
  type: number;
  count: number;
  /** Raw value bytes in the source file's byte order. */
  value: Uint8Array;
  little: boolean;
}

export interface TiffData {
  little: boolean;
  ifd0: TiffEntry[];
  exif: TiffEntry[];
  gps: TiffEntry[];
}

export const TAG = {
  make: 0x010f,
  model: 0x0110,
  orientation: 0x0112,
  software: 0x0131,
  exifIfd: 0x8769,
  gpsIfd: 0x8825,
  exposureTime: 0x829a,
  fNumber: 0x829d,
  iso: 0x8827,
  dateTimeOriginal: 0x9003,
  focalLength: 0x920a,
  makerNote: 0x927c,
  pixelXDimension: 0xa002,
  pixelYDimension: 0xa003,
  interopIfd: 0xa005,
  whiteBalance: 0xa403,
  lensModel: 0xa434,
} as const;

const TYPE_SIZE: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8,
};

function readU16(b: Uint8Array, o: number, le: boolean): number {
  return le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1];
}

function readU32(b: Uint8Array, o: number, le: boolean): number {
  return (
    (le
      ? b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)
      : (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0
  );
}

function parseIfd(b: Uint8Array, offset: number, le: boolean): TiffEntry[] {
  const entries: TiffEntry[] = [];
  if (offset < 8 || offset + 2 > b.length) return entries;

  const count = readU16(b, offset, le);
  for (let i = 0; i < count; i++) {
    const e = offset + 2 + i * 12;
    if (e + 12 > b.length) break;

    const type = readU16(b, e + 2, le);
    const unit = TYPE_SIZE[type];
    if (!unit) continue;

    const entryCount = readU32(b, e + 4, le);
    const byteLength = unit * entryCount;
    if (byteLength > 1024 * 1024) continue;

    let value: Uint8Array;
    if (byteLength <= 4) {
      value = b.slice(e + 8, e + 8 + byteLength);
    } else {
      const at = readU32(b, e + 8, le);
      if (at + byteLength > b.length) continue;
      value = b.slice(at, at + byteLength);
    }
    if (value.length < byteLength) continue;

    entries.push({ tag: readU16(b, e, le), type, count: entryCount, value, little: le });
  }
  return entries;
}

export function parseTiff(bytes?: Uint8Array | null): TiffData | null {
  if (!bytes || bytes.length < 8) return null;

  const little = bytes[0] === 0x49 && bytes[1] === 0x49;
  const big = bytes[0] === 0x4d && bytes[1] === 0x4d;
  if (!little && !big) return null;
  if (readU16(bytes, 2, little) !== 42) return null;

  const ifd0 = parseIfd(bytes, readU32(bytes, 4, little), little);
  const exifPtr = ifd0.find((e) => e.tag === TAG.exifIfd);
  const gpsPtr = ifd0.find((e) => e.tag === TAG.gpsIfd);

  return {
    little,
    ifd0,
    exif: exifPtr ? parseIfd(bytes, entryNumber(exifPtr) ?? 0, little) : [],
    gps: gpsPtr ? parseIfd(bytes, entryNumber(gpsPtr) ?? 0, little) : [],
  };
}

/** Extract the TIFF block from a JPEG's APP1 Exif segment. */
export function findApp1(jpeg: Uint8Array): Uint8Array | null {
  let o = 2;
  while (o + 4 <= jpeg.length && jpeg[o] === 0xff) {
    const marker = jpeg[o + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      o += 2;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break;

    const len = readU16BE(jpeg, o + 2);
    if (len < 2 || o + 2 + len > jpeg.length) break;
    if (
      marker === 0xe1 &&
      len > 8 &&
      jpeg[o + 4] === 0x45 && jpeg[o + 5] === 0x78 && jpeg[o + 6] === 0x69 && jpeg[o + 7] === 0x66
    ) {
      return jpeg.slice(o + 10, o + 2 + len);
    }
    o += 2 + len;
  }
  return null;
}

export function findEntry(entries: TiffEntry[], tag: number): TiffEntry | undefined {
  return entries.find((e) => e.tag === tag);
}

export function entryNumber(entry?: TiffEntry): number | null {
  if (!entry || entry.value.length === 0) return null;
  const { value, little, type } = entry;
  switch (type) {
    case 1:
    case 6:
      return value[0];
    case 3:
      return readU16(value, 0, little);
    case 8: {
      const v = readU16(value, 0, little);
      return v > 0x7fff ? v - 0x10000 : v;
    }
    case 4:
      return readU32(value, 0, little);
    case 9: {
      const v = readU32(value, 0, little);
      return v > 0x7fffffff ? v - 0x100000000 : v;
    }
    case 5:
    case 10: {
      const den = readU32(value, 4, little);
      if (den === 0) return null;
      let num = readU32(value, 0, little);
      if (type === 10 && num > 0x7fffffff) num -= 0x100000000;
      return num / den;
    }
    default:
      return null;
  }
}

export function entryString(entry?: TiffEntry): string | null {
  if (!entry || entry.type !== 2) return null;
  let s = '';
  for (const byte of entry.value) {
    if (byte === 0) break;
    s += String.fromCharCode(byte);
  }
  s = s.trim();
  return s.length > 0 ? s : null;
}

/* ------------------------------------------------------------------ */
/* EXIF writing                                                        */
/* ------------------------------------------------------------------ */

/** Offsets inside these point outside the block we rebuild, so they're dropped. */
const SKIP_IFD0 = new Set([
  TAG.exifIfd, TAG.gpsIfd, TAG.interopIfd,
  0x0111, 0x0117, 0x014a, 0x0201, 0x0202, 0x02bc, 0xc4a5,
]);
const SKIP_EXIF = new Set([TAG.exifIfd, TAG.gpsIfd, TAG.interopIfd, TAG.makerNote]);

interface OutEntry {
  tag: number;
  type: number;
  count: number;
  data: Uint8Array;
}

/** Re-order multi-byte values into little-endian, which is what we write. */
function toLittleEndian(entry: TiffEntry): Uint8Array {
  const unit = entry.type === 5 || entry.type === 10 ? 4 : TYPE_SIZE[entry.type] ?? 1;
  if (entry.little || unit <= 1) return entry.value;

  const out = new Uint8Array(entry.value.length);
  for (let i = 0; i + unit <= entry.value.length; i += unit) {
    for (let j = 0; j < unit; j++) out[i + j] = entry.value[i + unit - 1 - j];
  }
  return out;
}

function convert(entries: TiffEntry[], skip: Set<number>): OutEntry[] {
  return entries
    .filter((e) => !skip.has(e.tag))
    .map((e) => ({ tag: e.tag, type: e.type, count: e.count, data: toLittleEndian(e) }));
}

function shortEntry(tag: number, value: number): OutEntry {
  const data = new Uint8Array(2);
  data[0] = value & 0xff;
  data[1] = (value >> 8) & 0xff;
  return { tag, type: 3, count: 1, data };
}

function longEntry(tag: number, value: number): OutEntry {
  const data = new Uint8Array(4);
  new DataView(data.buffer).setUint32(0, value >>> 0, true);
  return { tag, type: 4, count: 1, data };
}

function upsert(entries: OutEntry[], entry: OutEntry): void {
  const i = entries.findIndex((e) => e.tag === entry.tag);
  if (i >= 0) entries[i] = entry;
  else entries.push(entry);
}

const padded = (n: number) => n + (n & 1);
const ifdBytes = (count: number) => 2 + 12 * count + 4;
const valueBytes = (entries: OutEntry[]) =>
  entries.reduce((sum, e) => sum + (e.data.length <= 4 ? 0 : padded(e.data.length)), 0);

function writeIfd(
  out: Uint8Array,
  view: DataView,
  entries: OutEntry[],
  ifdOffset: number,
  valueOffset: number,
): void {
  const sorted = [...entries].sort((a, b) => a.tag - b.tag);
  view.setUint16(ifdOffset, sorted.length, true);

  let p = ifdOffset + 2;
  let v = valueOffset;
  for (const entry of sorted) {
    view.setUint16(p, entry.tag, true);
    view.setUint16(p + 2, entry.type, true);
    view.setUint32(p + 4, entry.count, true);
    if (entry.data.length <= 4) {
      out.set(entry.data, p + 8);
    } else {
      view.setUint32(p + 8, v, true);
      out.set(entry.data, v);
      v += padded(entry.data.length);
    }
    p += 12;
  }
  view.setUint32(p, 0, true);
}

export interface ExifOverrides {
  orientation?: number;
  width?: number;
  height?: number;
  software?: string;
}

/**
 * Rebuild an EXIF APP1 segment (marker + length included) from parsed IFDs.
 * Maker notes are dropped: their internal pointers are absolute to the original
 * file and would decode as garbage once relocated.
 */
export function buildExifApp1(source: TiffData | null, overrides: ExifOverrides = {}): Uint8Array | null {
  if (!source) return null;

  const ifd0 = convert(source.ifd0, SKIP_IFD0);
  const exif = convert(source.exif, SKIP_EXIF);
  const gps = convert(source.gps, new Set());

  if (overrides.orientation !== undefined) upsert(ifd0, shortEntry(TAG.orientation, overrides.orientation));
  if (overrides.software) {
    const text = `${overrides.software}\0`;
    const data = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) data[i] = text.charCodeAt(i) & 0x7f;
    upsert(ifd0, { tag: TAG.software, type: 2, count: data.length, data });
  }
  if (overrides.width) upsert(exif, longEntry(TAG.pixelXDimension, overrides.width));
  if (overrides.height) upsert(exif, longEntry(TAG.pixelYDimension, overrides.height));

  if (ifd0.length === 0 && exif.length === 0 && gps.length === 0) return null;

  // Sub-IFD pointers live in IFD0 and are inline, so they add no value bytes.
  const exifPtr = exif.length > 0 ? longEntry(TAG.exifIfd, 0) : null;
  const gpsPtr = gps.length > 0 ? longEntry(TAG.gpsIfd, 0) : null;
  if (exifPtr) ifd0.push(exifPtr);
  if (gpsPtr) ifd0.push(gpsPtr);

  const ifd0At = 8;
  const ifd0Values = ifd0At + ifdBytes(ifd0.length);
  const exifAt = ifd0Values + valueBytes(ifd0);
  const exifValues = exifAt + (exifPtr ? ifdBytes(exif.length) : 0);
  const gpsAt = exifValues + valueBytes(exif);
  const gpsValues = gpsAt + (gpsPtr ? ifdBytes(gps.length) : 0);
  const total = gpsValues + valueBytes(gps);

  // APP1 payload is "Exif\0\0" + TIFF, and its length field is 16-bit.
  if (total + 8 > 0xffff) return null;

  if (exifPtr) new DataView(exifPtr.data.buffer).setUint32(0, exifAt, true);
  if (gpsPtr) new DataView(gpsPtr.data.buffer).setUint32(0, gpsAt, true);

  const tiff = new Uint8Array(total);
  const view = new DataView(tiff.buffer);
  tiff[0] = 0x49;
  tiff[1] = 0x49;
  view.setUint16(2, 42, true);
  view.setUint32(4, ifd0At, true);

  writeIfd(tiff, view, ifd0, ifd0At, ifd0Values);
  if (exifPtr) writeIfd(tiff, view, exif, exifAt, exifValues);
  if (gpsPtr) writeIfd(tiff, view, gps, gpsAt, gpsValues);

  const app1 = new Uint8Array(4 + 6 + total);
  app1[0] = 0xff;
  app1[1] = 0xe1;
  new DataView(app1.buffer).setUint16(2, 2 + 6 + total, false);
  app1.set([0x45, 0x78, 0x69, 0x66, 0x00, 0x00], 4);
  app1.set(tiff, 10);
  return app1;
}

/** Splice an APP1 segment in immediately after the SOI marker. */
export function insertApp1(jpeg: Uint8Array, app1: Uint8Array): Uint8Array {
  const out = new Uint8Array(jpeg.length + app1.length);
  out.set(jpeg.subarray(0, 2), 0);
  out.set(app1, 2);
  out.set(jpeg.subarray(2), 2 + app1.length);
  return out;
}

/* ------------------------------------------------------------------ */
/* Public helpers                                                      */
/* ------------------------------------------------------------------ */

export interface Cr3Image {
  jpeg: Uint8Array;
  source: string;
  tiff: TiffData | null;
}

/**
 * Pull the largest usable JPEG out of a CR3, together with its EXIF. Candidates
 * are checked for an SOI marker before being read in full, so the multi-megabyte
 * raw track is rejected after a 3-byte read.
 */
export async function extractCr3Image(file: File): Promise<Cr3Image> {
  const container = await readCr3Container(file);

  const verified: JpegCandidate[] = [];
  for (const candidate of container.candidates) {
    if (candidate.length < 1024 || candidate.offset + candidate.length > file.size) continue;
    const head = await readRange(file, candidate.offset, 3);
    if (head.length === 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
      verified.push(candidate);
    }
  }

  if (verified.length === 0) {
    verified.push(...(await scanForJpegs(file)));
  }
  if (verified.length === 0) {
    throw new Error('No embedded image found — this file may not be a Canon CR3.');
  }

  verified.sort((a, b) => b.length - a.length);
  const best = verified[0];
  const jpeg = await readRange(file, best.offset, best.length);

  // CMT1/CMT2/CMT4 are the camera's own EXIF; fall back to the JPEG's APP1.
  let tiff = parseTiff(container.cmt1);
  if (tiff) {
    if (tiff.exif.length === 0) tiff.exif = parseTiff(container.cmt2)?.ifd0 ?? [];
    if (tiff.gps.length === 0) tiff.gps = parseTiff(container.cmt4)?.ifd0 ?? [];
  } else {
    tiff = parseTiff(findApp1(jpeg));
  }

  return { jpeg, source: best.source, tiff };
}
