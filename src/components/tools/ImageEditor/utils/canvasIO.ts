// File import/export and IndexedDB session persistence for the Image Editor.
// Everything here runs entirely in the browser — no image data is ever sent
// to a server.

import type { Canvas } from 'fabric';
import { AUTOSAVE_DB_NAME, AUTOSAVE_KEY, AUTOSAVE_STORE_NAME } from '../constants';
import type { ExportOptions } from '../types';

function isHeicFile(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

/**
 * Resolves any supported input file to an object URL fabric can load.
 * HEIC/HEIF (iPhone photos) are transcoded to JPEG client-side via heic2any
 * first, since no current desktop browser decodes HEIC natively.
 */
export async function fileToImageURL(file: File): Promise<string> {
  if (isHeicFile(file)) {
    let heic2any: typeof import('heic2any').default;
    try {
      heic2any = (await import('heic2any')).default;
    } catch {
      throw new Error('Could not load the HEIC decoder. Please refresh and try again.');
    }
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return URL.createObjectURL(blob);
  }
  return URL.createObjectURL(file);
}

/** Reads the first image found in a native ClipboardEvent (Ctrl/Cmd+V). */
export function imageFromClipboardEvent(e: ClipboardEvent): File | null {
  const items = e.clipboardData?.items;
  if (!items) return null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}

/** Renders the canvas at the requested scale/format/quality to a Blob. */
export async function exportCanvasToBlob(canvas: Canvas, opts: ExportOptions): Promise<Blob> {
  const mime = opts.format === 'jpeg' ? 'image/jpeg' : opts.format === 'webp' ? 'image/webp' : 'image/png';
  const rendered = canvas.toCanvasElement(opts.scale);

  let target: HTMLCanvasElement = rendered;
  if (opts.format === 'jpeg') {
    // JPEG has no alpha channel — composite onto white first so transparent
    // areas export as white instead of an undefined/black fill.
    target = document.createElement('canvas');
    target.width = rendered.width;
    target.height = rendered.height;
    const ctx = target.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, target.width, target.height);
      ctx.drawImage(rendered, 0, 0);
    }
  }

  return new Promise((resolve, reject) => {
    target.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not export the image.'))),
      mime,
      opts.format === 'png' ? undefined : opts.quality
    );
  });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Autosave (IndexedDB) ─────────────────────────────────────────────────
// Uses the native IndexedDB API directly (no wrapper library) to persist the
// current Fabric.js scene graph JSON locally so a closed/reloaded tab isn't
// a lost edit. Nothing here ever leaves the browser.

interface StoredSession {
  json: Record<string, unknown>;
  savedAt: number;
}

function openSessionDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const request = indexedDB.open(AUTOSAVE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(AUTOSAVE_STORE_NAME)) {
        request.result.createObjectStore(AUTOSAVE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSession(json: Record<string, unknown>): Promise<void> {
  try {
    const db = await openSessionDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readwrite');
      const entry: StoredSession = { json, savedAt: Date.now() };
      tx.objectStore(AUTOSAVE_STORE_NAME).put(entry, AUTOSAVE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Autosave is a convenience, not a requirement — fail silently.
  }
}

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const db = await openSessionDB();
    const result = await new Promise<StoredSession | null>((resolve, reject) => {
      const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readonly');
      const req = tx.objectStore(AUTOSAVE_STORE_NAME).get(AUTOSAVE_KEY);
      req.onsuccess = () => resolve((req.result as StoredSession | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    const db = await openSessionDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readwrite');
      tx.objectStore(AUTOSAVE_STORE_NAME).delete(AUTOSAVE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Nothing to clean up.
  }
}
