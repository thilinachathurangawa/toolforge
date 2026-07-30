'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  History,
  Image as ImageIcon,
  Info,
  Scissors,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  WrapText,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type Alphabet,
  type Charset,
  type PaddingMode,
  applyPadding,
  byteLength,
  bytesEqual,
  bytesToBase64,
  bytesToText,
  decodeToBytes,
  encodeBytes,
  extensionFor,
  formatBytes,
  isImageMime,
  looksEncoded,
  printableRatio,
  sha256Hex,
  sniffMime,
  splitDataUri,
  textToBytes,
  validateEncoded,
  wrapLines,
} from './codec';

/* ------------------------------- types ------------------------------- */

type Tab = 'text' | 'files';
type Direction = 'auto' | 'encode' | 'decode';
type Resolved = 'encode' | 'decode';
type FileDirection = 'encode' | 'decode';
type FileFormat = 'raw' | 'data-uri' | 'css' | 'html' | 'json';

type Status = { level: 'warn' | 'error'; message: string } | null;

interface EncodedFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  base64: string;
  width?: number;
  height?: number;
}

interface TextOptions {
  alphabet: Alphabet;
  charset: Charset;
  urlSafe: boolean;
  lineWrap: boolean;
  lineLength: number;
  padding: PaddingMode;
}

interface HistoryItem {
  id: string;
  direction: Resolved;
  input: string;
  output: string;
  options: Pick<TextOptions, 'alphabet' | 'charset' | 'urlSafe'>;
  timestamp: number;
}

/* ----------------------------- constants ----------------------------- */

const SAMPLE_TEXT = 'Hello, World! — Grüße aus Zürich 🚀';
const SAMPLE_BASE64 = 'SGVsbG8sIFdvcmxkISDigJQgR3LDvMOfZSBhdXMgWsO8cmljaCDwn5qA';

const WARN_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const INLINE_HINT_SIZE = 4 * 1024;
const MAX_TEXT_DROP_SIZE = 2 * 1024 * 1024;
const MAX_PREVIEW_SIZE = 12 * 1024 * 1024;

const OPTIONS_KEY = 'toolforge:base64:options';
const HISTORY_KEY = 'toolforge:base64:history';
const REMEMBER_KEY = 'toolforge:base64:remember-history';

const ALPHABET_LABELS: Record<Alphabet, string> = {
  base64: 'Base64',
  base64url: 'Base64URL',
  base32: 'Base32',
  hex: 'Hex',
};

const FILE_FORMAT_LABELS: Record<FileFormat, string> = {
  raw: 'Raw Base64',
  'data-uri': 'Data URI',
  css: 'CSS background-image',
  html: 'HTML <img> tag',
  json: 'JSON string',
};


function formatFileOutput(file: EncodedFile, format: FileFormat): string {
  const dataUri = `data:${file.mime};base64,${file.base64}`;

  switch (format) {
    case 'raw':
      return file.base64;
    case 'css':
      return isImageMime(file.mime) ? `background-image: url("${dataUri}");` : dataUri;
    case 'html':
      return isImageMime(file.mime)
        ? `<img src="${dataUri}" alt="${file.name}"${file.width ? ` width="${file.width}" height="${file.height}"` : ''} />`
        : dataUri;
    case 'json':
      return JSON.stringify({ name: file.name, mime: file.mime, size: file.size, data: file.base64 });
    case 'data-uri':
    default:
      return dataUri;
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke after the browser has had a chance to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ------------------------------ component ------------------------------ */

export function Base64Encoder() {
  const [activeTab, setActiveTab] = useState<Tab>('text');

  // Text tab
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [direction, setDirection] = useState<Direction>('auto');
  const [detected, setDetected] = useState<Resolved | null>(null);
  const [options, setOptions] = useState<TextOptions>({
    alphabet: 'base64',
    charset: 'utf-8',
    urlSafe: false,
    lineWrap: false,
    lineLength: 76,
    padding: 'default',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [outputWrap, setOutputWrap] = useState(true);
  const [verifyRoundTrip, setVerifyRoundTrip] = useState(false);
  const [roundTrip, setRoundTrip] = useState<{ ok: boolean; digest: string | null } | null>(null);
  const [textStatus, setTextStatus] = useState<Status>(null);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunks, setChunks] = useState<string[]>([]);

  // Files tab
  const [fileDirection, setFileDirection] = useState<FileDirection>('encode');
  const [files, setFiles] = useState<EncodedFile[]>([]);
  const [fileFormat, setFileFormat] = useState<FileFormat>('data-uri');
  const [fileStatus, setFileStatus] = useState<Status>(null);
  const [isEncodingFiles, setIsEncodingFiles] = useState(false);
  const [decodeInput, setDecodeInput] = useState('');
  const [debouncedDecodeInput, setDebouncedDecodeInput] = useState('');
  const [decodeFilename, setDecodeFilename] = useState('decoded');
  const [filenameTouched, setFilenameTouched] = useState(false);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [rememberHistory, setRememberHistory] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragZone, setDragZone] = useState<Tab | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const [hydrated, setHydrated] = useState(false);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ text: null, files: null });
  const fileIdCounter = useRef(0);
  const historyIdCounter = useRef(0);

  const { alphabet, charset, urlSafe, lineWrap, lineLength, padding } = options;

  const setOption = useCallback(<K extends keyof TextOptions>(key: K, value: TextOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ------------------------- persisted preferences ------------------------- */

  useEffect(() => {
    try {
      const storedOptions = window.localStorage.getItem(OPTIONS_KEY);
      if (storedOptions) {
        const parsed = JSON.parse(storedOptions) as Partial<TextOptions>;
        setOptions((prev) => ({ ...prev, ...parsed }));
      }
      const remember = window.localStorage.getItem(REMEMBER_KEY) === 'true';
      setRememberHistory(remember);
      if (remember) {
        const storedHistory = window.localStorage.getItem(HISTORY_KEY);
        if (storedHistory) setHistory(JSON.parse(storedHistory) as HistoryItem[]);
      }
    } catch {
      /* ignore unreadable or disabled storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
    } catch {
      /* ignore */
    }
  }, [options, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(REMEMBER_KEY, String(rememberHistory));
      if (rememberHistory) {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } else {
        window.localStorage.removeItem(HISTORY_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [rememberHistory, history, hydrated]);

  /* ------------------------------ conversion ------------------------------ */

  const convert = useCallback(() => {
    if (!textInput.trim()) {
      setTextOutput('');
      setDetected(null);
      setTextStatus(null);
      setAnnouncement('');
      return;
    }

    // Detection only runs here, inside the debounced pass, so a long paste is
    // never decoded speculatively on every keystroke.
    const resolved: Resolved =
      direction === 'auto' ? (looksEncoded(textInput, alphabet) ? 'decode' : 'encode') : direction;
    setDetected(resolved);

    try {
      if (resolved === 'encode') {
        const bytes = textToBytes(textInput, charset);
        let output = encodeBytes(bytes, alphabet, urlSafe);
        output = applyPadding(output, padding, alphabet);
        if (lineWrap) output = wrapLines(output, lineLength);

        setTextOutput(output);
        setTextStatus(null);
        setAnnouncement(
          `Encoded ${bytes.length} bytes to ${output.length} ${ALPHABET_LABELS[alphabet]} characters.`
        );
        return;
      }

      const validation = validateEncoded(textInput, alphabet);
      if (!validation.ok) {
        setTextOutput('');
        setTextStatus({ level: 'error', message: validation.error });
        setAnnouncement(validation.error);
        return;
      }

      const bytes = decodeToBytes(textInput, alphabet);
      const text = bytesToText(bytes, charset);
      setTextOutput(text);

      if (charset === 'utf-8' && text.includes('�')) {
        setTextStatus({
          level: 'warn',
          message:
            'These bytes are not valid UTF-8 text — the payload looks binary. Use the Files & Images tab to decode it to a file instead.',
        });
      } else {
        setTextStatus(null);
      }
      setAnnouncement(`Decoded to ${bytes.length} bytes of text.`);
    } catch (error) {
      setTextOutput('');
      const message = error instanceof Error ? error.message : 'Conversion failed.';
      setTextStatus({ level: 'error', message });
      setAnnouncement(message);
    }
  }, [textInput, direction, alphabet, charset, urlSafe, lineWrap, lineLength, padding]);

  // Live, debounced conversion in every direction — no Process button.
  useEffect(() => {
    const timer = setTimeout(convert, 150);
    return () => clearTimeout(timer);
  }, [convert]);

  /* --------------------------- round-trip check --------------------------- */

  useEffect(() => {
    if (!verifyRoundTrip || !textOutput || !textInput.trim() || textStatus?.level === 'error') {
      setRoundTrip(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const source =
          detected === 'encode' ? textToBytes(textInput, charset) : decodeToBytes(textInput, alphabet);
        const recovered =
          detected === 'encode' ? decodeToBytes(textOutput, alphabet) : textToBytes(textOutput, charset);

        const digest = await sha256Hex(source);
        const recoveredDigest = await sha256Hex(recovered);
        const ok = digest && recoveredDigest ? digest === recoveredDigest : bytesEqual(source, recovered);
        if (!cancelled) setRoundTrip({ ok, digest });
      } catch {
        if (!cancelled) setRoundTrip({ ok: false, digest: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verifyRoundTrip, textInput, textOutput, detected, alphabet, charset, textStatus]);

  /* -------------------------------- history -------------------------------- */

  const commitHistory = useCallback(() => {
    if (!textInput.trim() || !textOutput || !detected) return;

    setHistory((prev) => {
      if (prev[0] && prev[0].input === textInput && prev[0].output === textOutput) return prev;
      historyIdCounter.current += 1;
      const item: HistoryItem = {
        id: `history-${Date.now()}-${historyIdCounter.current}`,
        direction: detected,
        input: textInput,
        output: textOutput,
        options: { alphabet, charset, urlSafe },
        timestamp: Date.now(),
      };
      return [item, ...prev].slice(0, 10);
    });
  }, [textInput, textOutput, detected, alphabet, charset, urlSafe]);

  const restoreHistory = useCallback((item: HistoryItem) => {
    setActiveTab('text');
    setDirection(item.direction);
    setOptions((prev) => ({ ...prev, ...item.options }));
    setTextInput(item.input);
    setShowHistory(false);
  }, []);

  /* ------------------------------ clipboard ------------------------------ */

  const handleCopy = useCallback((value: string, id: string) => {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedId(id);
        setAnnouncement('Copied to clipboard.');
        setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
      })
      .catch(() => setAnnouncement('Copying failed — your browser blocked clipboard access.'));
  }, []);

  /* ------------------------------- text tab ------------------------------- */

  const stats = useMemo(() => {
    const inputBytes = byteLength(textInput);
    const outputBytes = byteLength(textOutput);
    const overhead = inputBytes > 0 ? ((outputBytes - inputBytes) / inputBytes) * 100 : 0;
    return {
      inputBytes,
      outputBytes,
      overhead,
      characters: textOutput.length,
      lines: textOutput ? textOutput.split('\n').length : 0,
    };
  }, [textInput, textOutput]);

  const handleSwap = useCallback(() => {
    if (!textOutput) return;
    commitHistory();
    const next = textOutput;
    setTextInput(next);
    setTextOutput('');
    setChunks([]);
    setDirection(detected === 'encode' ? 'decode' : 'encode');
  }, [textOutput, detected, commitHistory]);

  const handleClearText = useCallback(() => {
    setTextInput('');
    setTextOutput('');
    setTextStatus(null);
    setChunks([]);
    setRoundTrip(null);
    setDetected(null);
  }, []);

  const handleTextDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragZone(null);
      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      if (file.size > MAX_TEXT_DROP_SIZE) {
        setTextStatus({
          level: 'error',
          message: `${file.name} is larger than 2 MB — use the Files & Images tab for large files.`,
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setTextInput(String(reader.result ?? ''));
        setTextStatus(null);
      };
      reader.onerror = () => setTextStatus({ level: 'error', message: `Could not read ${file.name}.` });
      reader.readAsText(file);
    },
    []
  );

  /* ------------------------------- files tab ------------------------------- */

  const encodeFile = useCallback(async (file: File): Promise<EncodedFile> => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = bytesToBase64(bytes);
    const mime = file.type || sniffMime(bytes);

    let width: number | undefined;
    let height: number | undefined;
    if (isImageMime(mime)) {
      const dimensions = await new Promise<{ width: number; height: number } | null>((resolve) => {
        const image = new window.Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => resolve(null);
        image.src = `data:${mime};base64,${base64}`;
      });
      if (dimensions) {
        width = dimensions.width;
        height = dimensions.height;
      }
    }

    fileIdCounter.current += 1;
    return {
      id: `file-${fileIdCounter.current}-${file.name}`,
      name: file.name,
      size: file.size,
      mime,
      base64,
      width,
      height,
    };
  }, []);

  const handleFiles = useCallback(
    async (list: FileList | File[]) => {
      const incoming = Array.from(list);
      if (!incoming.length) return;

      const rejected = incoming.filter((file) => file.size > MAX_FILE_SIZE);
      const accepted = incoming.filter((file) => file.size <= MAX_FILE_SIZE);
      const oversized = accepted.filter((file) => file.size > WARN_FILE_SIZE);

      if (rejected.length) {
        setFileStatus({
          level: 'error',
          message: `${rejected.map((file) => file.name).join(', ')} exceeded the ${formatBytes(
            MAX_FILE_SIZE
          )} limit and ${rejected.length > 1 ? 'were' : 'was'} skipped.`,
        });
      } else if (oversized.length) {
        setFileStatus({
          level: 'warn',
          message: `${oversized
            .map((file) => file.name)
            .join(', ')} is over ${formatBytes(WARN_FILE_SIZE)} — encoding may take a moment.`,
        });
      } else {
        setFileStatus(null);
      }

      if (!accepted.length) return;

      setIsEncodingFiles(true);
      try {
        const encoded = await Promise.all(accepted.map(encodeFile));
        setFiles((prev) => [...prev, ...encoded]);
        setAnnouncement(`Encoded ${encoded.length} file${encoded.length > 1 ? 's' : ''} to Base64.`);
      } catch (error) {
        setFileStatus({
          level: 'error',
          message: error instanceof Error ? error.message : 'Could not read the selected files.',
        });
      } finally {
        setIsEncodingFiles(false);
      }
    },
    [encodeFile]
  );

  const hasImages = files.some((file) => isImageMime(file.mime));

  useEffect(() => {
    if (!hasImages && (fileFormat === 'css' || fileFormat === 'html')) setFileFormat('data-uri');
  }, [hasImages, fileFormat]);

  // Debounce the decode textarea so large pastes do not re-decode per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDecodeInput(decodeInput), 250);
    return () => clearTimeout(timer);
  }, [decodeInput]);

  const decoded = useMemo(() => {
    if (!debouncedDecodeInput.trim()) return null;

    const validation = validateEncoded(debouncedDecodeInput, 'base64');
    if (!validation.ok) return { ok: false as const, error: validation.error };

    try {
      const { mime: declaredMime } = splitDataUri(debouncedDecodeInput);
      const bytes = decodeToBytes(debouncedDecodeInput, 'base64');
      if (!bytes.length) return { ok: false as const, error: 'Nothing to decode.' };

      const mime = declaredMime || sniffMime(bytes);
      const textPreview =
        !isImageMime(mime) && printableRatio(bytes) >= 0.9
          ? new TextDecoder('utf-8').decode(bytes.subarray(0, 600))
          : null;
      // A data URI, not an object URL: the site's CSP allows `img-src data:` but
      // not `blob:`, so a blob preview would be refused in production.
      const previewSrc =
        isImageMime(mime) && bytes.length <= MAX_PREVIEW_SIZE
          ? `data:${mime};base64,${bytesToBase64(bytes)}`
          : null;

      return {
        ok: true as const,
        bytes,
        mime,
        size: bytes.length,
        textPreview,
        previewSrc,
        declaredMime,
      };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : 'Could not decode this string.',
      };
    }
  }, [debouncedDecodeInput]);

  const decodedMime = decoded?.ok ? decoded.mime : null;

  useEffect(() => {
    if (!decodedMime || filenameTouched) return;
    setDecodeFilename(`decoded${extensionFor(decodedMime)}`);
  }, [decodedMime, filenameTouched]);

  const handleDecodeDownload = useCallback(() => {
    if (!decoded?.ok) return;
    const name = decodeFilename.trim() || `decoded${extensionFor(decoded.mime)}`;
    triggerDownload(new Blob([new Uint8Array(decoded.bytes)], { type: decoded.mime }), name);
    setAnnouncement(`Downloaded ${name}.`);
  }, [decoded, decodeFilename]);

  /* --------------------------------- tabs --------------------------------- */

  const handleTabKeyDown = useCallback((event: React.KeyboardEvent) => {
    const order: Tab[] = ['text', 'files'];
    const currentIndex = order.indexOf(activeTab);
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % order.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + order.length) % order.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = order.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = order[nextIndex];
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  }, [activeTab]);

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setTextStatus(null);
    setFileStatus(null);
  }, []);

  /* -------------------------------- render -------------------------------- */

  const statusBox = (status: Status) =>
    status && (
      <div
        className={cn(
          'flex items-start gap-2 p-3 rounded-md border text-sm',
          status.level === 'error'
            ? 'bg-destructive/10 border-destructive/20 text-destructive'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/30 text-amber-700 dark:text-amber-400'
        )}
      >
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>{status.message}</span>
      </div>
    );

  const tabButton = (tab: Tab, label: string, Icon: typeof FileText) => (
    <button
      ref={(node) => {
        tabRefs.current[tab] = node;
      }}
      role="tab"
      id={`base64-tab-${tab}`}
      aria-selected={activeTab === tab}
      aria-controls={`base64-panel-${tab}`}
      tabIndex={activeTab === tab ? 0 : -1}
      onClick={() => switchTab(tab)}
      onKeyDown={handleTabKeyDown}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        activeTab === tab
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
      )}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="w-full space-y-6">
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Conversion mode" className="flex gap-2 p-1 bg-muted rounded-lg">
          {tabButton('text', 'Text', FileText)}
          {tabButton('files', 'Files & Images', ImageIcon)}
        </div>
        <button
          onClick={() => setShowHistory((value) => !value)}
          aria-expanded={showHistory}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <History size={16} />
          History{history.length > 0 ? ` (${history.length})` : ''}
        </button>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="p-4 border border-border rounded-xl bg-card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium">Recent conversions</h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberHistory}
                  onChange={(event) => setRememberHistory(event.target.checked)}
                  className="rounded"
                />
                Remember on this device
              </label>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet. Conversions are recorded when you copy, download, swap, or leave the input field.
            </p>
          ) : (
            <ul className="space-y-2">
              {history.map((item) => (
                <li key={item.id} className="p-2 bg-muted rounded-md text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium uppercase">
                      {item.direction} · {ALPHABET_LABELS[item.options.alphabet]}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {formatBytes(byteLength(item.output))}
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </span>
                  </div>
                  <p className="mt-1 truncate text-muted-foreground font-mono">
                    {item.input.slice(0, 60)}
                    {item.input.length > 60 ? '…' : ''} → {item.output.slice(0, 60)}
                    {item.output.length > 60 ? '…' : ''}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => restoreHistory(item)}
                      className="px-2 py-1 bg-background rounded hover:bg-background/70 transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleCopy(item.output, `history-${item.id}`)}
                      className="px-2 py-1 bg-background rounded hover:bg-background/70 transition-colors"
                    >
                      {copiedId === `history-${item.id}` ? 'Copied!' : 'Copy output'}
                    </button>
                    <button
                      onClick={() => setHistory((prev) => prev.filter((entry) => entry.id !== item.id))}
                      className="px-2 py-1 bg-background rounded hover:bg-background/70 transition-colors text-muted-foreground"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ------------------------------ Text panel ------------------------------ */}
      {activeTab === 'text' && (
        <div role="tabpanel" id="base64-panel-text" aria-labelledby="base64-tab-text" className="space-y-4">
          {/* Direction */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Direction:</span>
            <div className="flex items-center gap-2">
              {(['auto', 'encode', 'decode'] as Direction[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setDirection(value)}
                  aria-pressed={direction === value}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    direction === value
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            {direction === 'auto' && detected && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-accent/10 text-accent">
                <Info size={13} />
                {detected === 'decode'
                  ? `Detected: ${ALPHABET_LABELS[alphabet]} → text (decoding)`
                  : `Detected: text → ${ALPHABET_LABELS[alphabet]} (encoding)`}
              </span>
            )}
          </div>

          {/* Primary options */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label htmlFor="base64-alphabet" className="block text-sm font-medium">
                Alphabet
              </label>
              <select
                id="base64-alphabet"
                value={alphabet}
                onChange={(event) => setOption('alphabet', event.target.value as Alphabet)}
                className="px-3 py-2 text-sm bg-background border border-input rounded-md"
              >
                <option value="base64">Base64 (standard)</option>
                <option value="base64url">Base64URL (URL / JWT safe)</option>
                <option value="base32">Base32 (RFC 4648)</option>
                <option value="hex">Hex (base16)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="base64-charset" className="block text-sm font-medium">
                Character set
              </label>
              <select
                id="base64-charset"
                value={charset}
                onChange={(event) => setOption('charset', event.target.value as Charset)}
                className="px-3 py-2 text-sm bg-background border border-input rounded-md"
              >
                <option value="utf-8">UTF-8</option>
                <option value="latin1">Latin-1 / ASCII</option>
              </select>
            </div>

            {alphabet === 'base64' && (
              <label className="flex items-center gap-2 text-sm pb-2">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(event) => setOption('urlSafe', event.target.checked)}
                  className="rounded"
                />
                URL-safe output
              </label>
            )}

            <label className="flex items-center gap-2 text-sm pb-2">
              <input
                type="checkbox"
                checked={verifyRoundTrip}
                onChange={(event) => setVerifyRoundTrip(event.target.checked)}
                className="rounded"
              />
              Verify round-trip
            </label>

            <button
              onClick={() => setShowAdvanced((value) => !value)}
              aria-expanded={showAdvanced}
              className="flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings size={16} />
              {showAdvanced ? 'Hide' : 'Show'} advanced
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Advanced options */}
          {showAdvanced && (
            <div className="p-4 border border-border rounded-xl bg-card grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label htmlFor="base64-padding" className="block text-sm font-medium">
                  Padding
                </label>
                <select
                  id="base64-padding"
                  value={padding}
                  disabled={alphabet === 'hex'}
                  onChange={(event) => setOption('padding', event.target.value as PaddingMode)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md disabled:opacity-50"
                >
                  <option value="default">Default</option>
                  <option value="add">Add “=” padding</option>
                  <option value="remove">Remove “=” padding</option>
                </select>
                <p className="text-xs text-muted-foreground">Applies to encoded output only.</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="base64-wrap" className="block text-sm font-medium">
                  Line wrapping
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="base64-wrap"
                    type="checkbox"
                    checked={lineWrap}
                    onChange={(event) => setOption('lineWrap', event.target.checked)}
                    className="rounded"
                  />
                  <input
                    type="number"
                    aria-label="Characters per line"
                    value={lineLength}
                    min={1}
                    max={999}
                    disabled={!lineWrap}
                    onChange={(event) => setOption('lineLength', Math.max(1, Number(event.target.value) || 1))}
                    className="w-20 px-2 py-1 text-sm bg-background border border-input rounded-md disabled:opacity-50"
                  />
                  <span className="text-xs text-muted-foreground">chars</span>
                </div>
                <p className="text-xs text-muted-foreground">76 matches the MIME convention.</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="base64-chunk" className="block text-sm font-medium">
                  Split chunk size
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="base64-chunk"
                    type="number"
                    value={chunkSize}
                    min={1}
                    onChange={(event) => setChunkSize(Math.max(1, Number(event.target.value) || 1))}
                    className="w-24 px-2 py-1 text-sm bg-background border border-input rounded-md"
                  />
                  <span className="text-xs text-muted-foreground">chars</span>
                </div>
                <p className="text-xs text-muted-foreground">Used by the Split button below.</p>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="base64-input" className="text-sm font-medium">
                Input
              </label>
              <span className="text-xs text-muted-foreground">
                {stats.inputBytes > 0 ? `${stats.inputBytes.toLocaleString()} bytes` : 'Drop a text file to load it'}
              </span>
            </div>
            <textarea
              id="base64-input"
              placeholder="Type or paste text to encode, or a Base64 string to decode…"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              onBlur={commitHistory}
              onDragOver={(event) => {
                event.preventDefault();
                setDragZone('text');
              }}
              onDragLeave={() => setDragZone(null)}
              onDrop={handleTextDrop}
              className={cn(
                'w-full min-h-[130px] px-3 py-2 text-sm font-mono bg-background border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
                dragZone === 'text' ? 'border-accent bg-accent/5' : 'border-input'
              )}
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTextInput(direction === 'decode' ? SAMPLE_BASE64 : SAMPLE_TEXT)}
                className="px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Load example
              </button>
              <button
                onClick={handleClearText}
                disabled={!textInput && !textOutput}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            </div>
          </div>

          {statusBox(textStatus)}

          {/* Round-trip result */}
          {verifyRoundTrip && roundTrip && (
            <div
              className={cn(
                'flex items-start gap-2 p-3 rounded-md border text-sm',
                roundTrip.ok
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-500/30 text-green-700 dark:text-green-400'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              )}
            >
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>
                {roundTrip.ok
                  ? 'Round-trip verified — re-decoding the output reproduces the input byte for byte.'
                  : 'Round-trip mismatch — the output does not decode back to the original bytes.'}
                {roundTrip.digest && (
                  <span className="block mt-0.5 font-mono text-xs opacity-80">
                    SHA-256 {roundTrip.digest.slice(0, 16)}…
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Output */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="base64-output" className="text-sm font-medium">
                Output
              </label>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {stats.outputBytes > 0 && (
                  <>
                    <span>{stats.outputBytes.toLocaleString()} bytes</span>
                    {stats.inputBytes > 0 && (
                      <span>
                        {stats.overhead >= 0 ? '+' : ''}
                        {stats.overhead.toFixed(1)}%
                      </span>
                    )}
                    <span>{stats.characters.toLocaleString()} chars</span>
                    <span>
                      {stats.lines} line{stats.lines === 1 ? '' : 's'}
                    </span>
                  </>
                )}
                <button
                  onClick={() => setOutputWrap((value) => !value)}
                  aria-pressed={outputWrap}
                  title={outputWrap ? 'Disable line wrapping in the output box' : 'Wrap long lines in the output box'}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <WrapText size={14} />
                  {outputWrap ? 'Wrap' : 'No wrap'}
                </button>
              </div>
            </div>
            <textarea
              id="base64-output"
              readOnly
              value={textOutput}
              wrap={outputWrap ? 'soft' : 'off'}
              placeholder="Output appears here as you type…"
              className={cn(
                'w-full min-h-[130px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-y',
                outputWrap ? 'break-all' : 'overflow-x-auto whitespace-pre'
              )}
            />
          </div>

          {/* Output actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                handleCopy(textOutput, 'text-output');
                commitHistory();
              }}
              disabled={!textOutput}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {copiedId === 'text-output' ? <Check size={16} /> : <Copy size={16} />}
              {copiedId === 'text-output' ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => {
                triggerDownload(
                  new Blob([textOutput], { type: 'text/plain;charset=utf-8' }),
                  detected === 'decode' ? 'decoded.txt' : 'encoded.txt'
                );
                commitHistory();
              }}
              disabled={!textOutput}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={handleSwap}
              disabled={!textOutput}
              title="Move the output into the input and flip the direction"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeftRight size={16} />
              Swap
            </button>
            <button
              onClick={() => {
                const parts: string[] = [];
                for (let i = 0; i < textOutput.length; i += chunkSize) {
                  parts.push(textOutput.slice(i, i + chunkSize));
                }
                setChunks(parts);
              }}
              disabled={!textOutput}
              title={`Split the output into ${chunkSize}-character chunks`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Scissors size={16} />
              Split
            </button>
          </div>

          {/* Chunks */}
          {chunks.length > 0 && (
            <div className="p-4 border border-border rounded-xl bg-card space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  {chunks.length} chunk{chunks.length === 1 ? '' : 's'} of {chunkSize} characters
                </h3>
                <button
                  onClick={() => setChunks([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              <ul className="max-h-56 overflow-y-auto space-y-1">
                {chunks.map((chunk, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-xs font-mono">
                    <span className="shrink-0 text-muted-foreground">#{index + 1}</span>
                    <span className="flex-1 truncate">{chunk}</span>
                    <button
                      onClick={() => handleCopy(chunk, `chunk-${index}`)}
                      className="shrink-0 p-1 hover:bg-background rounded transition-colors"
                      aria-label={`Copy chunk ${index + 1}`}
                    >
                      {copiedId === `chunk-${index}` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                To rejoin chunks, paste them back into the input — surrounding whitespace and line breaks are ignored.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------- Files panel ---------------------------- */}
      {activeTab === 'files' && (
        <div role="tabpanel" id="base64-panel-files" aria-labelledby="base64-tab-files" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Direction:</span>
            {(['encode', 'decode'] as FileDirection[]).map((value) => (
              <button
                key={value}
                onClick={() => {
                  setFileDirection(value);
                  setFileStatus(null);
                }}
                aria-pressed={fileDirection === value}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  fileDirection === value
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {value === 'encode' ? 'File → Base64' : 'Base64 → file'}
              </button>
            ))}
          </div>

          {fileDirection === 'encode' ? (
            <div className="p-6 border border-border rounded-xl bg-card space-y-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                  dragZone === 'files' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragZone('files');
                }}
                onDragLeave={() => setDragZone(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragZone(null);
                  if (event.dataTransfer.files?.length) void handleFiles(event.dataTransfer.files);
                }}
              >
                <input
                  type="file"
                  id="base64-file-upload"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files?.length) void handleFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
                <label
                  htmlFor="base64-file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload
                    size={44}
                    className={cn('mb-2', dragZone === 'files' ? 'text-accent' : 'text-muted-foreground')}
                  />
                  <span className="text-sm font-medium">Click to choose files, or drag and drop</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Any file type · multiple files · up to {formatBytes(MAX_FILE_SIZE)} each
                  </span>
                </label>
              </div>

              {statusBox(fileStatus)}
              {isEncodingFiles && <p className="text-sm text-muted-foreground">Encoding…</p>}

              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-1">
                  <label htmlFor="base64-file-format" className="block text-sm font-medium">
                    Output as
                  </label>
                  <select
                    id="base64-file-format"
                    value={fileFormat}
                    onChange={(event) => setFileFormat(event.target.value as FileFormat)}
                    className="px-3 py-2 text-sm bg-background border border-input rounded-md"
                  >
                    {(Object.keys(FILE_FORMAT_LABELS) as FileFormat[]).map((format) => (
                      <option
                        key={format}
                        value={format}
                        disabled={(format === 'css' || format === 'html') && !hasImages}
                      >
                        {FILE_FORMAT_LABELS[format]}
                      </option>
                    ))}
                  </select>
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(
                            files.map((file) => ({
                              name: file.name,
                              mime: file.mime,
                              size: file.size,
                              data: file.base64,
                            })),
                            null,
                            2
                          ),
                          'files-json'
                        )
                      }
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      {copiedId === 'files-json' ? <Check size={16} /> : <Copy size={16} />}
                      Copy all as JSON
                    </button>
                    <button
                      onClick={() => {
                        setFiles([]);
                        setFileStatus(null);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      <X size={16} />
                      Remove all
                    </button>
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <>
                  <ul className="space-y-3">
                    {files.map((file) => {
                      const output = formatFileOutput(file, fileFormat);
                      const encodedLength = file.base64.length;
                      return (
                        <li key={file.id} className="p-3 border border-border rounded-lg space-y-2">
                          <div className="flex items-start gap-3">
                            {isImageMime(file.mime) && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={`data:${file.mime};base64,${file.base64}`}
                                alt={file.name}
                                className="w-16 h-16 object-contain bg-muted rounded border border-border"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatBytes(file.size)} · {file.mime}
                                {file.width ? ` · ${file.width}×${file.height}px` : ''} ·{' '}
                                {encodedLength.toLocaleString()} Base64 chars
                              </p>
                            </div>
                            <button
                              onClick={() => setFiles((prev) => prev.filter((entry) => entry.id !== file.id))}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              aria-label={`Remove ${file.name}`}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <textarea
                            readOnly
                            value={output}
                            aria-label={`Base64 output for ${file.name}`}
                            className="w-full min-h-[70px] px-3 py-2 text-xs font-mono bg-muted border border-input rounded-md resize-y break-all"
                          />

                          {(fileFormat === 'css' || fileFormat === 'html') && !isImageMime(file.mime) && (
                            <p className="text-xs text-muted-foreground">
                              CSS and HTML embedding only applies to images — this file is shown as a data URI.
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleCopy(output, `file-${file.id}`)}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                            >
                              {copiedId === `file-${file.id}` ? <Check size={14} /> : <Copy size={14} />}
                              {copiedId === `file-${file.id}` ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                              onClick={() =>
                                triggerDownload(
                                  new Blob([output], { type: 'text/plain;charset=utf-8' }),
                                  `${file.name}.base64.txt`
                                )
                              }
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                            >
                              <Download size={14} />
                              Download
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {files.some((file) => file.size > INLINE_HINT_SIZE) && (
                    <p className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Info size={14} className="mt-0.5 shrink-0" />
                      Inlining assets larger than about {formatBytes(INLINE_HINT_SIZE)} usually slows a page down —
                      Base64 adds roughly a third to the size and the data cannot be cached separately.
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="p-6 border border-border rounded-xl bg-card space-y-4">
              <div className="space-y-2">
                <label htmlFor="base64-decode-input" className="text-sm font-medium">
                  Paste Base64 or a data URI
                </label>
                <textarea
                  id="base64-decode-input"
                  placeholder="iVBORw0KGgoAAAANSUhEUg… or data:image/png;base64,…"
                  value={decodeInput}
                  onChange={(event) => setDecodeInput(event.target.value)}
                  className="w-full min-h-[130px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-y break-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <p className="text-xs text-muted-foreground">
                  Line breaks, spaces, missing padding, and URL-safe characters are handled automatically.
                </p>
              </div>

              {decoded && !decoded.ok && statusBox({ level: 'error', message: decoded.error })}

              {decoded?.ok && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-accent font-medium">{decoded.mime}</span>
                    <span className="text-muted-foreground">{formatBytes(decoded.size)}</span>
                    <span className="text-xs text-muted-foreground">
                      {decoded.declaredMime ? 'type from data URI' : 'type detected from file signature'}
                    </span>
                  </div>

                  {decoded.previewSrc && (
                    <div className="border border-border rounded-lg p-4 flex justify-center bg-muted/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={decoded.previewSrc}
                        alt="Decoded preview"
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </div>
                  )}

                  {decoded.textPreview && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Text preview</span>
                      <pre className="max-h-48 overflow-auto p-3 text-xs font-mono bg-muted border border-input rounded-md whitespace-pre-wrap break-all">
                        {decoded.textPreview}
                        {decoded.size > 600 ? '\n…' : ''}
                      </pre>
                    </div>
                  )}

                  {!decoded.previewSrc && !decoded.textPreview && (
                    <p className="text-sm text-muted-foreground">
                      {isImageMime(decoded.mime)
                        ? `This image is over ${formatBytes(MAX_PREVIEW_SIZE)}, so it is not previewed here — download it to view it.`
                        : 'Binary payload — no preview available, but it can still be downloaded.'}
                    </p>
                  )}

                  <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1">
                      <label htmlFor="base64-decode-filename" className="block text-sm font-medium">
                        Filename
                      </label>
                      <input
                        id="base64-decode-filename"
                        type="text"
                        value={decodeFilename}
                        onChange={(event) => {
                          setDecodeFilename(event.target.value);
                          setFilenameTouched(true);
                        }}
                        className="px-3 py-2 text-sm bg-background border border-input rounded-md"
                      />
                    </div>
                    <button
                      onClick={handleDecodeDownload}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                    >
                      <Download size={16} />
                      Download file
                    </button>
                    <button
                      onClick={() => {
                        setDecodeInput('');
                        setFilenameTouched(false);
                        setDecodeFilename('decoded');
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      <X size={16} />
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
