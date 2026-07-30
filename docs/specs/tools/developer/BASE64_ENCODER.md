# SPEC: Base64 Encoder & Decoder Tool
**File:** `docs/specs/tools/developer/BASE64_ENCODER.md`
**Status:** **v2 shipped** (Part 1 is the v1 audit that motivated it)
**Slug:** `base64-encoder`
**Category:** developer
**Component:** `src/components/tools/Base64Encoder/index.tsx`
**Codec:** `src/components/tools/Base64Encoder/codec.ts` — the pure, React-free
conversion rules, split out so they can be reasoned about and tested on their own.

---

## SEO

- **Title:** `Base64 Encoder & Decoder — Encode/Decode Online Free | ToolForge`
- **Description:** `Encode text or files to Base64 and decode Base64 strings online for free. Supports text, images, and files.`
- **Primary Keyword:** base64 encode online
- **Secondary Keywords:** base64 decoder, text to base64, base64 converter, decode base64, base64 to image, url-safe base64

---

## Library

None. Browser built-ins only — `btoa`/`atob`, `TextEncoder`/`TextDecoder`, `FileReader`, `Blob`, `canvas`, `crypto.subtle`, `CompressionStream`.

---

# Part 1 — v1 audit (as of the current component)

This audit is the basis for the v2 scope. Everything below was read from the
component source, not assumed.

### Works correctly today
- Four tabs: Text, File, Image, Decode.
- Text encode/decode with UTF-8 and ASCII (`btoa`/`atob`).
- Auto mode: guesses decode when the input parses as Base64, else encode.
- URL-safe toggle: `+`→`-`, `/`→`_`, padding stripped on encode; reversed on decode.
- Line wrapping at a configurable length (default 76).
- Padding override: add `=` to a multiple of 4, or strip trailing `=`.
- Input/output byte counts.
- File → Base64 (raw, data-URI prefix stripped) with size warning above 10 MB.
- Image → Base64 with live preview and three output shapes: data URI, CSS
  `background-image`, HTML `<img>` tag.
- Decode tab: paste Base64 (data-URI prefix tolerated) → download as a file.
- Split output into fixed 1000-character chunks; drag & drop on File/Image tabs;
  session history of the last 10 conversions; copy and download everywhere.

### Broken or misleading (must fix or remove in v2)
| # | Problem | Evidence |
|---|---------|----------|
| B1 | **"UTF-16" encoding is not UTF-16.** Encode path uses `TextEncoder`, which only emits UTF-8; the decode path uses `TextDecoder('utf-16le')`. Round-trip is asymmetric and produces mojibake. | `encodeBase64` / `decodeBase64` |
| B2 | **Hash verification always fails.** It hashes the Base64 input and compares it to the decoded output — two different strings by definition. Also uses a non-cryptographic 32-bit hash. | `processText`, `simpleHash` |
| B3 | **Padding override corrupts decoded text.** `applyPadding` runs on the result in every mode, so choosing "Add padding" while decoding appends `=` to plain text. | `processText` |
| B4 | **Line wrap applies to decoded text.** Guard is `mode !== 'decode'`, so Auto-mode decodes get wrapped too. | `processText` |
| B5 | **Wrapped Base64 cannot be decoded back.** The validator regex rejects newlines, so pasting the tool's own 76-column output fails validation. | `validateBase64` |
| B6 | **URL-safe Base64 fails validation.** The regex excludes `-` and `_`, so URL-safe input never auto-detects and errors in explicit Decode mode. | `validateBase64` |
| B7 | **Auto-detect misfires on short words.** Any 4/8/12-character alphanumeric word (`test`, `password`) is valid Base64, so it is silently decoded to garbage instead of encoded. | `processText` |
| B8 | **History corrupts the input.** Entries store values truncated to 50 chars with `...` appended; clicking one loads that truncated string back into the input. | `addToHistory` |
| B9 | **Errors persist across tabs.** `error` is shared and never cleared on tab switch; a File-tab size warning shows as a red error on the Text tab. | shared `error` state |
| B10 | **The >10 MB "warning" is styled as a hard error** (destructive red, `AlertTriangle`) even though processing continues. | `handleFileUpload`, `handleImageUpload` |
| B11 | **Decode-to-file always writes `application/octet-stream`** and ignores the MIME type present in a pasted data URI. Whitespace/newlines and URL-safe characters are not normalised before `atob`. | `decodeBase64ToFile` |
| B12 | Non-Auto modes do not recompute on input change — output goes stale until **Process** is clicked, with no visual hint that it is stale. | `useEffect` guard |
| B13 | Deprecated `escape`/`unescape` used for the UTF-8 path. | `encodeBase64`, `decodeBase64` |

### Dead code / cosmetic controls (violates the CLAUDE.md "no non-functional controls" rule)
| # | Control or function | Reality |
|---|---|---|
| D1 | **Compress (gzip)** checkbox | `compressData()` is defined but never called. The checkbox does nothing. |
| D2 | **Image resize** width/height inputs | `resizeImage()` is defined but never called. Values are ignored. |
| D3 | **Convert to** PNG/JPG/WebP select | `convertImageFormat()` is defined but never called. Output is always the original format. |
| D4 | **Multiple image upload** | `handleMultipleFileUpload()` reads each file into an empty `onload`; `imageFiles` is never rendered. Only the first file is used. |
| D5 | Base32 encode/decode | `encodeBase32`/`decodeBase32` exist with no UI. |
| D6 | Hex → Base64 | `hexToBase64()` exists with no UI. |
| D7 | **Merge Chunks** button | Re-joins the chunks the tool just split — always a no-op round trip. There is no way to paste external chunks. |
| D8 | Chunk size | Hard-coded to 1000; `chunkSize` state has no input. |
| D9 | `dropZoneRef`, `Zap` import | Unused. |

### Content drift
`TOOL_CONTENT['base64-encoder']` describes "three tabs" and never mentions the
Decode tab, advanced options, history, or split. It must be rewritten in v2 to
match whatever ships (see Part 4).

---

# Part 2 — Enhancement option catalogue

Every option we could reasonably add, with a decision. **Do** = in v2 scope,
**Wire** = the code already exists and only needs to be connected, **Cut** =
remove the control/dead code, **Defer** = worth doing later, not now.

### A. Correctness & trust (highest value — these are bugs users hit)
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| A1 | Whitespace/newline-tolerant decode (strip all `\s` before `atob`) | High | XS | **Do** |
| A2 | Accept URL-safe alphabet on decode automatically (no toggle needed) | High | XS | **Do** |
| A3 | Strip a `data:*;base64,` prefix on decode in the Text tab too | High | XS | **Do** |
| A4 | Smarter auto-detect: require length ≥ 8, valid alphabet, **and** a decode that yields mostly printable characters; otherwise encode | High | S | **Do** |
| A5 | Show the detected direction as a badge ("Detected: Base64 → decoding") so Auto is never a mystery | High | XS | **Do** |
| A6 | Apply line-wrap and padding overrides **only when encoding** | High | XS | **Do** |
| A7 | Replace UTF-16 with a real implementation (`TextEncoder`-free UTF-16LE byte packing) or drop the option and keep UTF-8/Latin-1 | High | S | **Do** (drop to UTF-8 + Latin-1/ASCII; see D-decisions) |
| A8 | Replace `escape`/`unescape` with `TextEncoder`/`TextDecoder` | Med | XS | **Do** |
| A9 | Real round-trip verification: SHA-256 (`crypto.subtle`) of the original bytes vs the bytes recovered from the output, shown as pass/fail | Med | S | **Do** (replaces B2) |
| A10 | Per-tab error state; clear on tab switch and on input clear | Med | XS | **Do** |
| A11 | Distinguish warnings (amber) from errors (red) | Med | XS | **Do** |
| A12 | Strict-mode toggle: reject non-canonical Base64 (bad padding, stray chars) instead of silently repairing it | Low | S | **Defer** |

### B. Live, low-friction editing
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| B1 | Debounced live conversion in **all** modes; retire the Process button | High | S | **Do** |
| B2 | **Swap** button — move output into input and flip direction (one-click round-trip check) | High | XS | **Do** |
| B3 | Paste from clipboard button | Low | XS | **Cut** (browser paste is enough) |
| B4 | "Load example" button per tab | Med | XS | **Do** |
| B5 | Drag & drop a `.txt`/`.json` file onto the Text tab to fill the input | Med | XS | **Do** |
| B6 | `Ctrl/Cmd+Enter` to convert, `Ctrl/Cmd+K` to clear | Low | XS | **Defer** |
| B7 | Auto-copy output on conversion (opt-in) | Low | XS | **Cut** (surprising) |
| B8 | Persist options (encoding, URL-safe, wrap) to `localStorage` | Med | XS | **Do** |

### C. Better output information
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| C1 | Stats row: input bytes, output bytes, **size overhead %** (Base64 is ~+33%), character count, line count | High | XS | **Do** |
| C2 | Detected MIME type + human file size for decoded binary | High | S | **Do** |
| C3 | Preview a decoded payload before download: image thumbnail for image MIME types, text preview for text | High | S | **Do** |
| C4 | Monospace output with wrap/no-wrap toggle | Low | XS | **Do** |
| C5 | Output format selector for files: raw Base64 / data URI / CSS `background-image` / HTML `<img>` / JSON string — unify File and Image tabs on one selector | High | S | **Do** |
| C6 | Syntax-highlighted or line-numbered output | Low | M | **Cut** |
| C7 | Data-URI size guidance ("inlining >4 KB usually hurts page load") | Low | XS | **Do** (static hint) |

### D. Options currently faked — wire up or cut
| ID | Enhancement | Decision | Rationale |
|----|-------------|----------|-----------|
| D1 | gzip compress before encoding | **Cut** | Output is only useful to a receiver that gunzips it; confusing in a general-purpose encoder. Delete the checkbox and `compressData`. |
| D2 | Image resize before encoding | **Cut** | Overlaps the existing Image Resizer / Image Compressor tools; link to them from `related` instead. Delete inputs and `resizeImage`. |
| D3 | Image format conversion (PNG/JPG/WebP) | **Cut** | Same reason — belongs to the image converter tools. Delete select and `convertImageFormat`. |
| D4 | Multiple file upload with batch results | **Do** | Genuinely useful and already half-built: render a per-file row list with name, size, MIME, Base64 output, and per-row copy/download + "copy all as JSON". |
| D5 | Base32 encode/decode | **Wire** | Code exists and is correct; expose as an "Output alphabet" choice (Base64 / Base64URL / Base32 / Hex) in the Text tab. |
| D6 | Hex → Base64 | **Wire** | Same selector as D5, plus hex input detection. |
| D7 | Split / merge chunks | **Do (rework)** | Keep Split with a **user-editable chunk size** and per-chunk copy. Replace the no-op Merge with a real "paste chunks (one per line) → join → decode" flow, or cut Merge entirely if we want the smaller surface. |
| D8 | Editable chunk size | **Do** | Part of D7. |
| D9 | Remove unused `dropZoneRef` and `Zap` import | **Do** | Cleanup. |

### E. History
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| E1 | Store **full** input/output; display truncated. Fixes the corrupting click-to-restore | High | XS | **Do** |
| E2 | Restore mode + options with the entry, not just the text | Med | XS | **Do** |
| E3 | Per-entry copy and delete, plus Clear all | Med | XS | **Do** |
| E4 | Persist history to `localStorage` (opt-in, with a "clear" control and a note that it stays on this device) | Med | S | **Do** |
| E5 | Show a size/time label per entry | Low | XS | **Do** |

### F. Structure / simplification (pick one — see "Recommended shape")
| ID | Option | Notes |
|----|--------|-------|
| F1 | **Two tabs + direction toggle** — "Text" and "Files & Images", each with Encode ⇄ Decode | Removes the 4th tab, removes the duplicate "Decode to File" button, and makes Base64→file a natural direction rather than a separate mode. **Recommended.** |
| F2 | Keep the current four tabs, fix bugs only | Smaller diff, but keeps the Text/Decode overlap (both edit the same `textInput`) and the awkward Decode tab. |
| F3 | Single page, no tabs, everything visible | Too dense for the number of options. Rejected. |

### G. Robustness
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| G1 | Encode file bytes via `ArrayBuffer` + chunked `btoa` instead of `readAsDataURL` string splitting, so large files do not blow the call stack | Med | S | **Do** |
| G2 | Hard cap with a clear message (e.g. 25 MB) plus the existing soft warning at 10 MB | Med | XS | **Do** |
| G3 | Web Worker for >5 MB encodes to keep the UI responsive | Low | M | **Defer** |
| G4 | Streaming/progress bar for large files | Low | M | **Defer** |
| G5 | `URL.revokeObjectURL` after download completes (currently revoked immediately after `click()`) | Low | XS | **Do** |

### H. Accessibility & polish
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| H1 | Real `<label htmlFor>` on every control; drop the `document.getElementById` filename read in the Decode tab in favour of React state | High | XS | **Do** |
| H2 | `aria-live` region for conversion result + error announcements | Med | XS | **Do** |
| H3 | Tabs as a proper `role="tablist"` with arrow-key navigation | Med | S | **Do** |
| H4 | Visible focus rings on all buttons; keyboard-activatable drop zones | Med | XS | **Do** |
| H5 | Amber/red status colours that meet contrast in dark mode | Med | XS | **Do** |

### I. Explicitly out of scope
- Encryption of any kind (Base64 is not security — the content must keep saying so).
- Server-side processing. Everything stays client-side.
- Base58/Base85/quoted-printable — separate tools if ever wanted.
- Image editing (crop, rotate, optimise) — existing image tools own that.

---

# Part 3 — v2 accepted scope (implemented)

Two deliberate deviations from the option catalogue, decided during implementation:

- **D5/D6 — the alphabet selector is symmetric.** It governs the *encoded* side
  (Base64 / Base64URL / Base32 / Hex) while the decoded side is always text, so the
  tool stays a single encode/decode model instead of gaining a second "convert
  between representations" mode. The dead `hexToBase64` helper is therefore replaced
  by a full text ⇄ Hex path rather than resurrected as-is. Converting hex to Base64
  is still possible in two steps: decode as Hex, then Swap and encode as Base64.
- **D7 — Merge is cut, not reworked.** Split keeps a user-editable chunk size and
  per-chunk copy; rejoining is just pasting the chunks back into the input, which
  now works because decoding ignores whitespace and line breaks. A second textarea
  for the same job would have added surface for nothing.

### Shipped shape (F1)

```
┌──────────────────────────────────────────────────────┐
│  [ Text ]  [ Files & Images ]              [History] │
├──────────────────────────────────────────────────────┤
│  Direction:  ( Auto )  ( Encode )  ( Decode )        │
│  Detected: Base64 → decoding                        │
│                                                      │
│  Input                              1,024 bytes      │
│  ┌────────────────────────────────────────────────┐  │
│  │ Hello, World!                                  │  │
│  └────────────────────────────────────────────────┘  │
│  [Load example] [Clear]        drop a .txt file here │
│                                                      │
│  Alphabet: [Base64 ▾]  ☐ URL-safe  ☐ Wrap [76]      │
│  Padding: [Default ▾]  Charset: [UTF-8 ▾]           │
│  ☐ Verify round-trip (SHA-256)          [Advanced ▾] │
│                                                      │
│  Output          1,368 bytes · +33.6% · 18 lines     │
│  ┌────────────────────────────────────────────────┐  │
│  │ SGVsbG8sIFdvcmxkIQ==                           │  │
│  └────────────────────────────────────────────────┘  │
│  [Copy] [Download] [Swap ⇄] [Split ▾]                │
└──────────────────────────────────────────────────────┘

[Files & Images tab — Encode direction]
┌──────────────────────────────────────────────────────┐
│  Direction: ( Encode )  ( Decode )                   │
│  ┌───────── drag & drop, or click to choose ───────┐ │
│  │  Any file · multiple files supported            │ │
│  └─────────────────────────────────────────────────┘ │
│  Output as: [Data URI ▾]   (raw · data URI · CSS ·   │
│              HTML <img> · JSON string)               │
│                                                      │
│  photo.png   412 KB · image/png     [Copy][Download] │
│    [preview]  data:image/png;base64,iVBORw0KG…       │
│  notes.txt    2 KB · text/plain     [Copy][Download] │
│                                     [Copy all: JSON] │
│  ⚠ Inlining assets over ~4 KB usually slows pages.   │
└──────────────────────────────────────────────────────┘

[Files & Images tab — Decode direction]
┌──────────────────────────────────────────────────────┐
│  Paste Base64 or a data URI                          │
│  ┌─────────────────────────────────────────────────┐ │
│  │ data:image/png;base64,iVBORw0KG…                │ │
│  └─────────────────────────────────────────────────┘ │
│  Detected: image/png · 412 KB                        │
│  ┌── preview ──┐                                     │
│  │  [image]    │   Filename: [decoded.png        ]   │
│  └─────────────┘   [Download]                        │
└──────────────────────────────────────────────────────┘
```

### Functional requirements — v2 (all implemented)

**Text tab**
1. Direction: Auto / Encode / Decode. Auto shows the detected direction as a badge (A5).
2. Auto-detect rule (A4): decode only if the cleaned input is ≥ 8 chars, matches the
   Base64 or Base64URL alphabet, has a valid length after padding repair, decodes
   without throwing, **and** the decoded bytes are ≥ 90 % printable/UTF-8-valid.
   Otherwise encode.
3. Decode input normalisation (A1–A3): strip all whitespace, strip a `data:…;base64,`
   prefix, map `-_` → `+/`, re-pad to a multiple of 4.
4. Alphabet selector (D5/D6): **Base64**, **Base64URL**, **Base32**, **Hex**. Hex and
   Base32 use the existing helpers; Base64URL replaces the URL-safe checkbox when
   selected (keep the checkbox only for Base64).
5. Charset: **UTF-8** (default) and **Latin-1/ASCII**. UTF-16 is removed (A7).
6. Line wrap and padding overrides apply to encode output only (A6).
7. Optional round-trip verification via SHA-256 over the original vs recovered bytes,
   reported as "Round-trip verified" / "Round-trip mismatch" (A9).
8. Live debounced conversion (~150 ms) in all directions; no Process button (B1).
9. Stats: input bytes, output bytes, overhead %, characters, lines (C1).
10. Actions: Copy, Download, **Swap** (B2), Split, Clear, Load example (B4).
11. Split: user-editable chunk size (default 1000), per-chunk copy, chunk count, and a
    line explaining that pasting chunks back into the input rejoins them. Merge removed.
12. Dropping a text file on the input fills it (B5).

**Files & Images tab**
13. One tab replaces the old File, Image, and Decode tabs, with an Encode/Decode
    direction toggle (F1).
14. Encode: multiple files (D4). Per file: name, human size, detected MIME, output,
    copy, download. Plus "Copy all as JSON".
15. Output format selector shared by all file types (C5): raw Base64, data URI,
    CSS `background-image`, HTML `<img>`, JSON string. Image-only formats are
    disabled for non-image files rather than silently producing nonsense.
16. Images get a thumbnail preview and their intrinsic dimensions.
17. Encode reads an `ArrayBuffer` and Base64-encodes in chunks (G1).
18. Soft warning at 10 MB (amber), hard refusal above 25 MB with a clear message (G2).
19. Decode: paste Base64 or a data URI → detect MIME (from the data URI, else by
    magic-byte sniffing for png/jpg/gif/webp/pdf/zip) → show size and a preview
    (image thumbnail or text excerpt) → editable filename (React state, not
    `getElementById`) → Download with the correct Blob MIME type (B11, C2, C3, H1).

**Cross-cutting**
20. Per-tab error/warning state, cleared on tab switch and on clear (A10, A11).
21. History stores full values, restores mode and options, offers per-entry copy and
    delete plus Clear all, and optionally persists to `localStorage` with an explicit
    "stored on this device only" note (E1–E5).
22. Options persist to `localStorage` (B8).
23. Remove all dead code: `compressData`, `resizeImage`, `convertImageFormat`,
    `simpleHash`, `dropZoneRef`, `Zap`, and the checkboxes/selects that drove them
    (D1–D3, D9).
24. Accessibility per H1–H5.

### Module split

| File | Holds |
|------|-------|
| `codec.ts` | Types `Alphabet`/`Charset`/`PaddingMode`, byte helpers, data-URI and whitespace cleanup, `validateEncoded`, `encodeBytes`/`decodeToBytes`, `applyPadding`, `wrapLines`, `looksEncoded`, `sniffMime`, `printableRatio`, `sha256Hex`. No React, no DOM-only APIs. |
| `index.tsx` | The component: state, effects, `formatFileOutput`, `triggerDownload`, and the UI. |

### Component state (as built)

```typescript
type Tab = 'text' | 'files';
type Direction = 'auto' | 'encode' | 'decode';
type Resolved = 'encode' | 'decode';
type FileFormat = 'raw' | 'data-uri' | 'css' | 'html' | 'json';
type Status = { level: 'warn' | 'error'; message: string } | null;

interface EncodedFile {
  id: string; name: string; size: number; mime: string; base64: string;
  width?: number; height?: number;      // images only
}

interface TextOptions {                 // persisted to localStorage
  alphabet: Alphabet; charset: Charset; urlSafe: boolean;
  lineWrap: boolean; lineLength: number; padding: PaddingMode;
}

interface HistoryItem {
  id: string; direction: Resolved;
  input: string; output: string;        // full values, never truncated
  options: Pick<TextOptions, 'alphabet' | 'charset' | 'urlSafe'>;
  timestamp: number;
}

state: {
  activeTab: Tab; hydrated: boolean;
  // text
  textInput; textOutput; direction: Direction; detected: Resolved | null;
  options: TextOptions; showAdvanced; outputWrap;
  verifyRoundTrip; roundTrip: { ok: boolean; digest: string | null } | null;
  textStatus: Status; chunkSize: number; chunks: string[];
  // files
  fileDirection: 'encode' | 'decode'; files: EncodedFile[]; fileFormat: FileFormat;
  fileStatus: Status; isEncodingFiles: boolean;
  decodeInput; debouncedDecodeInput; decodeFilename; filenameTouched;
  previewUrl: string | null;            // object URL, revoked on change
  // shared
  history: HistoryItem[]; showHistory; rememberHistory;
  copiedId: string | null; dragZone: Tab | null; announcement: string;
}
```

Conversion runs in a 150 ms debounced effect and the decode textarea in a 250 ms one.
Auto-detection lives inside the debounced pass rather than in a render-time memo, so a
long paste is never decoded speculatively on every keystroke; stats and the decoded
payload analysis are `useMemo`-derived.

### Test matrix

Automated assertions run against `codec.ts` (transpile the module, exercise the
exported functions — see the change log). **58 assertions, all passing.**

| Case | Expected | Result |
|------|----------|--------|
| `Hello, World!` encode | `SGVsbG8sIFdvcmxkIQ==` | ✅ auto |
| `test` / `password` in Auto | **encodes**, never decodes to garbage — A4 | ✅ auto |
| Long English sentence in Auto | encodes | ✅ auto |
| `SGVsbG8=` in Auto | decodes to `Hello` | ✅ auto |
| Output wrapped at 76 columns, pasted back | decodes cleanly — A1/B5 | ✅ auto |
| URL-safe output, decoded with no toggle | round-trips — A2/B6 | ✅ auto |
| `data:text/plain;base64,SGVsbG8=` (and `;charset=utf-8;`) | decodes to `Hello` — A3 | ✅ auto |
| `SGVsbG8` (padding stripped) | repaired, decodes to `Hello` | ✅ auto |
| `SGVsb` (length ≡ 1 mod 4) | rejected as truncated | ✅ auto |
| Emoji + accents, UTF-8 | identical round trip | ✅ auto |
| Latin-1 with an emoji | refused with a "switch to UTF-8" message — A7 | ✅ auto |
| "Add padding" applied to decoded text | text unmodified — B3 | ✅ auto |
| Padding override under Hex | no-op | ✅ auto |
| Base32 `foobar` | `MZXW6YTBOI======` (RFC 4648) — D5 | ✅ auto |
| Base32 rejects `0`/`1` | error | ✅ auto |
| Hex `Hello` ⇄ `48656c6c6f`, `0x`/separators tolerated — D6 | round trip | ✅ auto |
| Base64URL output | never contains `+`, `/`, or `=` | ✅ auto |
| PNG/JPEG/GIF/WebP/PDF/ZIP/gzip/text/JSON signatures | correct MIME — C2 | ✅ auto |
| Random binary | `application/octet-stream` | ✅ auto |
| Base64 of PNG header in the Text tab, Auto | encodes (not mistaken for text) | ✅ auto |
| 300 KB buffer | encodes without a stack overflow — G1 | ✅ auto |
| Round-trip check, clean vs one corrupted character | pass / fail — A9 | ✅ auto |
| Auto-decode with Wrap on | decoded text is not wrapped — B4 | ✅ by construction (wrap is inside the encode branch) |
| Three files at once | three rows, each with its own output and copy — D4 | ⬜ manual |
| 12 MB file / 30 MB file | amber warning / refused — G2 | ⬜ manual |
| PNG data URI in files → Decode | previews and downloads as `image/png` — B11 | ⬜ manual |
| History entry >60 chars, restored | full original input returns — E1 | ⬜ manual |
| Tab switch after a file warning | Text tab shows no error — A10 | ⬜ manual |
| Keyboard-only pass over both tabs | every control reachable and labelled — H1–H4 | ⬜ manual |

---

# Part 4 — Content (rewritten)

`TOOL_CONTENT['base64-encoder']` in `src/lib/content/tool-content.ts` was stale — it
described "three tabs" and never mentioned the Decode tab, advanced options, history,
or split. It has been rewritten to match what ships:

- Two tabs, live conversion, and the visible auto-detect verdict.
- The alphabet selector (Base64 / Base64URL / Base32 / Hex), both character sets,
  padding, wrapping, split chunk size, Swap, and round-trip verification.
- Multi-file encoding with the raw / data URI / CSS / HTML / JSON output shapes, and
  decode-to-file with signature-based MIME detection and previews.
- No mention of any Cut feature (gzip, resize, format conversion). `related` now
  links to Image Compressor and Image Converter so users who wanted those land
  somewhere real.
- Honest privacy wording: no network calls; browser APIs only; history stays in
  memory unless the user opts into "Remember on this device".
- New FAQs cover the short-word auto-detect surprise, the ~33 % size overhead, which
  alphabet to pick, that encoding is not encryption, and rebuilding a file.

Validation run: `npm run validate:content` → **PASSED**, `npm run type-check` → clean,
`npm run build` → succeeds (214 tool pages prerendered).

---

## How to Use content (source for the steps section)

1. Choose the **Text** tab for strings, or **Files & Images** for files.
2. Leave direction on **Auto** and paste — the tool shows whether it is encoding or
   decoding — or pick Encode/Decode explicitly.
3. Optionally change the alphabet (Base64, URL-safe Base64, Base32, Hex), the
   character set, line wrapping, or padding.
4. For files, drop one or more in and pick the output shape: raw Base64, data URI,
   CSS background, HTML `<img>`, or a JSON string.
5. To turn Base64 back into a file, switch Files & Images to **Decode**, paste the
   string, check the detected type and preview, name the file, and download.
6. Copy or download the result, or hit **Swap** to feed the output back in and confirm
   the round trip.

---

## Change log
- **v1** — shipped: four tabs, advanced options, history, split, image formats.
- **v2 (this spec, shipped)** — bug fixes A1–A11, live debounced conversion, two-tab
  structure with direction toggles, multi-file encoding, Base32/Hex alphabets,
  MIME-aware decode with previews, real SHA-256 round-trip verification, Swap,
  persisted options and opt-in history, removal of the gzip/resize/format-conversion
  placeholders and all dead code, an accessibility pass, and extraction of the codec
  into `codec.ts`.

## Verifying the codec

`codec.ts` is deliberately free of React and DOM-only APIs, so its rules can be
exercised directly: transpile it with the repo's local `typescript`, evaluate it, and
assert against the exported functions (`encodeBytes`, `decodeToBytes`,
`validateEncoded`, `looksEncoded`, `sniffMime`, `applyPadding`, `wrapLines`,
`bytesEqual`, …). The 58-assertion matrix above was run that way; keep it in mind when
changing detection thresholds or the padding-repair rules, since those are the parts
most likely to regress silently.
