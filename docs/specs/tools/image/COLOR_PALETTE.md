# SPEC: Color Palette Extractor Tool
**File:** `docs/specs/tools/image/COLOR_PALETTE.md`
**Status:** **v2 shipped** (Part 1 is the v1 audit that motivated it)
**Slug:** `color-palette`
**Category:** image
**Component:** `src/components/tools/ColorPalette/index.tsx`
**Engine:** `src/components/tools/ColorPalette/palette.ts` — sampling, median-cut
quantisation with coverage, the vibrant selector, colour-space conversion, perceptual
distance, nearest-name lookup, WCAG contrast, sorting and the export serialisers.
React-free and testable on its own.
**Dependencies:** none. `color-thief-browser` and its type shim
(`src/types/color-thief-browser.d.ts`) were removed in v2.

---

## SEO

- **Title:** `Color Palette Extractor — Extract Colors from Any Image | ToolForge`
- **Description:** `Upload an image and instantly extract its dominant color palette. Get HEX, RGB, and HSL codes. Free, no sign-up required.`
- **Primary Keyword:** color palette from image
- **Secondary Keywords:** extract colors from image, dominant colors, image color picker
- **Add for v2:** pick color from image, hex code from photo, image color analyzer,
  dominant color percentage, palette from photo

> Note: **"image color picker" is already a targeted keyword the tool does not serve** —
> v1 has no way to sample the colour of a specific pixel. Option B4 closes that gap.

---

## Scope boundary with the sibling colour tools

- **Color Palette Extractor** (this tool) — *derive* colours from a real image, and pick
  exact pixel colours out of it.
- **Color Palette Generator** — *invent* schemes from a base colour (harmonies, shades,
  tints).
- **Color Converter** — convert *one* colour between formats.

v2 therefore adds coverage data, contrast data, naming, and an eyedropper here, and
deliberately does **not** add harmonies or shade ramps — it links to the generator for
those instead.

---

# Part 1 — v1 audit

Read from the current component. v1 is: upload → data URL → `<img>` → ColorThief →
swatches with HEX/RGB/HSL → copy hex, download JSON or a PNG strip.

### Works today
- File picker upload, filtered to `image/jpeg`, `image/png`, `image/webp`.
- Preview via `FileReader` data URL.
- `ColorThief.getPalette(img, numColors)` for 3–12 colours, driven by a range slider.
- Correct RGB→HEX and RGB→HSL conversion for each swatch.
- Click a swatch (or its small button) to copy the HEX; a tick confirms for 2 seconds.
- Remove the loaded file; a generic error panel.
- Download the palette as JSON, or as a PNG strip of labelled swatches.

### Bugs and broken promises
| # | Problem | Evidence |
|---|---------|----------|
| B1 | **Drag & drop does not exist.** The upload area reads "Drop image here or click to upload", but there is no `onDragOver`/`onDrop` anywhere in the component. Dropping a file does nothing useful — the browser may simply navigate away from the page to the dropped file. | no drag handlers in `index.tsx` |
| B2 | **Extraction can run before the image has decoded.** `extractPalette` reads `imageRef.current` on click with no `onLoad` gate or `decode()` await, so a click on a freshly-swapped image throws and surfaces the generic "Failed to extract colors. Please try a different image." — blaming the image for a race. | `extractPalette` |
| B3 | **GIF is advertised but rejected.** The registry FAQ and the long-form content promise "JPG, PNG, WebP, GIF and more", while the file input's `accept` list excludes GIF (and AVIF, BMP, SVG). | `accept="image/jpeg,image/png,image/webp"` |
| B4 | **A "sensitivity setting" is documented twice but does not exist** — neither in the UI nor as a ColorThief argument (the `quality` parameter is never passed). | `TOOL_CONTENT` steps + FAQ vs component |
| B5 | **"3 to 20 colors" is claimed twice; the slider is 3–12.** The registry FAQ separately claims a default of 10; the actual default is 6. | content vs `numColors` |
| B6 | **"The tool automatically extracts dominant colors"** (registry `howToUse`) is false — extraction only happens when the button is clicked. | registry vs component |
| B7 | **JSON download revokes its object URL immediately after `click()`** and never appends the anchor to the DOM — the same pattern that silently cancels downloads in some browsers. | `downloadPaletteAsJson` |
| B8 | **No handling for a corrupt or undecodable file.** The `<img>` has no `onError`, so the preview stays broken and the only feedback is the generic extraction error. | JSX |
| B9 | **No size guard or downscaling.** A 24 MP photo is analysed at full natural size on the main thread; ColorThief's default `quality` of 10 is the only thing keeping it tolerable. | — |
| B10 | **Transparency is never mentioned or handled explicitly.** ColorThief skips mostly-transparent pixels internally, so a logo on a transparent background can yield surprisingly few or odd colours with no explanation. | — |
| B11 | **Only HEX can be copied.** RGB and HSL are displayed but not copyable — clicking that text does nothing, and there is no format toggle. | swatch markup |
| B12 | **No copy-all.** Every colour must be copied one at a time; there is no CSS/SCSS/Tailwind/array output. | — |
| B13 | `crossOrigin="anonymous"` is set on an image that is always a `data:` URL — a leftover from an intended URL-input feature that never shipped. | `<img>` |
| B14 | **PNG export wastes a third of its canvas** (`textHeight = 60` for one 12 px line drawn at +20) and includes only HEX — no RGB, no coverage, no title, and no 2× option for retina. | `downloadPaletteAsPng` |
| B15 | **Accessibility:** the "Number of colors" label is not tied to the slider (no `htmlFor`/`id`), every swatch button carries the identical `title="Click to copy HEX"` with no accessible name saying *which* colour, copy feedback is never announced, and the RGB/HSL text is 10 px. | JSX |
| B16 | Duplicate or near-identical swatches are possible with no dedupe or minimum-distance control, and there is no way to remove one. | — |

### Capability gaps for a tool of this kind
No coverage percentages (what share of the image each colour occupies), no eyedropper for
sampling an exact pixel, no colour names, no WCAG contrast information, no sorting, no
clipboard paste, no sample images, no alternative extraction algorithms, and no export
beyond raw JSON and a PNG strip.

### Content drift (a CLAUDE.md violation to fix)
`TOOL_CONTENT['color-palette']` currently describes a **sensitivity setting that does not
exist**, a **3–20 range** that is really 3–12, and **drag & drop** that is not
implemented. The registry entry adds a false "automatically extracts" claim and a wrong
default of 10. Two paths exist for each claim: delete it, or make it true. v2 chooses to
make most of them true — sensitivity becomes a real control (A3) and drag & drop gets
implemented (B1) — and corrects the rest.

---

# Part 2 — Enhancement option catalogue

**Do** = v2 scope, **Cut** = rejected with a reason, **Defer** = later.

### A. Extraction engine
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| A1 | **Own quantizer instead of ColorThief**, so each swatch carries a **coverage percentage** ("this colour is 34 % of the image") | High | M | **Do** — see the decision note below |
| A2 | Algorithm choice: **Dominant** (median cut) and **Vibrant set** (vibrant / muted / light / dark, à la the Android Palette API) | High | M | **Do** |
| A3 | **Sensitivity / accuracy control** — pixel sampling step plus how aggressively near-identical colours merge (also makes the documented-but-absent setting real) | High | S | **Do** |
| A4 | Ignore near-white and near-black pixels (background suppression) | Med | S | **Do** |
| A5 | Minimum perceptual distance between swatches, so a palette never returns two of the same colour | Med | S | **Do** |
| A6 | Skip transparent pixels explicitly, and say so when many were skipped | Med | XS | **Do** |
| A7 | Downscale to a max long edge (~1000 px) before analysis | High | XS | **Do** |
| A8 | k-means refinement pass over the median-cut result for tighter centroids | Med | M | **Defer** |
| A9 | Extract from a dragged rectangular region only | Med | M | **Defer** |
| A10 | Palette from several images at once | Low | M | **Defer** |

> **Decision note on A1.** ColorThief cannot report coverage — it returns bare RGB
> triples — and coverage is the single most requested piece of information a palette tool
> can add. Writing the quantizer ourselves (median cut over a sampled pixel array) also
> gives explicit alpha handling, a real sensitivity knob, deterministic dedupe, and a pure
> module we can test in isolation, and it **removes the `color-thief-browser`
> dependency** entirely rather than layering our own pass on top of it.

### B. Working with the image
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| B1 | **Real drag & drop** (fixes the false promise) | High | XS | **Do** |
| B2 | Paste an image from the clipboard (`Ctrl/Cmd+V`) | Med | S | **Do** |
| B3 | **Eyedropper**: hover or click the image to read that pixel's exact colour, with a zoom loupe, and add it to the palette | High | M | **Do** — this is what "image color picker" promises |
| B4 | Image URL input | Low | M | **Cut** — remote fetches taint the canvas without CORS headers, and a proxy would break the "nothing leaves your browser" guarantee |
| B5 | Two or three sample images to try the tool with | Med | XS | **Do** |
| B6 | Show dimensions, file size, and format of the loaded image | Low | XS | **Do** |
| B7 | Accept GIF, AVIF, BMP alongside JPG/PNG/WebP (makes the documented list true) | Med | XS | **Do** |
| B8 | Accept SVG | Low | S | **Defer** — needs intrinsic-size handling and blocks external refs |

### C. The palette itself
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| C1 | Sort by coverage, hue, lightness, or saturation | High | S | **Do** |
| C2 | Coverage bar or percentage on each swatch | High | XS | **Do** (from A1) |
| C3 | **Nearest colour name** from the CSS named-colour set ("Slate Gray", "Coral") | Med | S | **Do** |
| C4 | **WCAG contrast** for each swatch against white and black, with AA/AAA badges and the better text colour indicated | High | S | **Do** |
| C5 | Remove a swatch you do not want | Med | XS | **Do** |
| C6 | Live re-extraction as the count and sensitivity change | High | XS | **Do** |
| C7 | Add an eyedropper pick to the palette | Med | XS | **Do** (pairs with B3) |
| C8 | Contrast grid of every swatch against every other | Med | M | **Defer** |
| C9 | Shades and tints for a chosen swatch | Med | M | **Cut** — Color Palette Generator owns harmonies and ramps; link to it |
| C10 | Colour-blindness simulation of the palette | Low | M | **Defer** |
| C11 | Lock swatches and re-roll the rest | Low | M | **Defer** |

### D. Copying and exporting
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| D1 | Format toggle (HEX / RGB / HSL) that drives what a swatch click copies (fixes B11) | High | XS | **Do** |
| D2 | **Copy all** as CSS custom properties, SCSS variables, Tailwind colour keys, a JSON array, or plain HEX list | High | S | **Do** |
| D3 | Improved PNG export: tighter layout, HEX + coverage labels, optional title, light or dark background, 2× scale | Med | S | **Do** |
| D4 | SVG export of the palette | Med | XS | **Do** |
| D5 | Richer JSON (hex, rgb, hsl, coverage, name, contrast) rather than the bare v1 shape | Med | XS | **Do** |
| D6 | GIMP `.gpl` / Adobe `.ase` swatch files | Low | M | **Defer** — `.ase` is a binary format with little payoff here |
| D7 | Shareable URL with the palette encoded | Low | S | **Defer** |
| D8 | Fix the download lifecycle (append the anchor, revoke later) | Med | XS | **Do** (fixes B7) |

### E. Robustness and UX
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| E1 | Auto-extract once the image has decoded — no button (makes the registry claim true, fixes B6) | High | XS | **Do** |
| E2 | Await `img.decode()` before analysing (fixes B2) | High | XS | **Do** |
| E3 | `onError` handling for corrupt files, with a specific message (fixes B8) | Med | XS | **Do** |
| E4 | Soft warning above ~8 MP and a hard limit at 25 MB, with a "working…" state | Med | S | **Do** |
| E5 | Persist display preferences (format, sort, algorithm) to `localStorage` | Low | XS | **Do** |
| E6 | Analyse in a Web Worker | Low | M | **Defer** — downscaling (A7) already keeps the work to a few milliseconds |
| E7 | Drop the pointless `crossOrigin` attribute (B13) | Low | XS | **Do** |

### F. Accessibility
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| F1 | Each swatch button gets a real accessible name ("Copy #FF5733, 34 % coverage") | High | XS | **Do** |
| F2 | `aria-live` announcement on copy and on extraction completing | Med | XS | **Do** |
| F3 | Slider and every control properly labelled via `htmlFor`/`id` (fixes B15) | High | XS | **Do** |
| F4 | Visible focus rings on swatches; readable metadata text instead of 10 px | Med | XS | **Do** |
| F5 | Eyedropper reachable by keyboard, or clearly announced as pointer-only | Med | S | **Do** |

### G. Explicitly out of scope
- Uploading anything to a server; any network call at all.
- Image editing (crop, rotate, filters) — the image tools own that.
- Harmonies, shade ramps, and scheme generation — the Color Palette Generator owns those.
- AI/marketing-style colour naming beyond nearest-named-colour lookup.

---

# Part 3 — v2 scope (implemented)

Five decisions taken during implementation:

- **The eyedropper reads one pixel on demand.** Rather than keeping a second
  full-resolution canvas in memory (96 MB for a 24 MP photo), each hover draws just the
  hovered pixel through `drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1)` with smoothing off.
  That is exact at any image size and allocates nothing per move. The loupe is CSS
  (`background-position` at 8× with `image-rendering: pixelated`), so no second canvas
  exists at all.
- **Sample images are drawn, not shipped.** Three canvas-drawn samples (sunset, logo,
  artwork) exercise gradients, flat brand colours on white, and blocky artwork. No binary
  assets enter the repo and nothing pretends to be a photograph it is not.
- **The sampling budget is a ceiling, not a target.** `stride` uses `Math.ceil`, so the
  sample count can never exceed the budget for the chosen sensitivity (8k / 25k / 60k).
- **Dominant over-quantises then trims.** Median cut runs for `count + 2` clusters, merges
  near-identical ones, then keeps the most common `count`. That yields cleaner, more
  distinct palettes than cutting to exactly `count`, and it is what makes "ask for 12 from
  a 2-colour graphic, get 2" fall out naturally rather than being special-cased.
- **Removals are keyed by hex and survive option changes** within the same image, so
  nudging the colour count does not resurrect a swatch you dismissed. A "Restore N removed
  colours" link undoes it; loading a new image clears the list.

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  ┌──── drop an image, click to browse, or paste ────────┐  │
│  │  JPG · PNG · WebP · GIF · AVIF · BMP                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  [Try a sample: photo · logo · artwork]                    │
├────────────────────────────────────────────────────────────┤
│  sunset.jpg · 3024×4032 · 2.4 MB · analysed at 750×1000    │
│  ┌──────────────────────┐   Eyedropper: on ⦿              │
│  │                      │   ┌────────┐ #C2734A            │
│  │   [image preview]    │   │ loupe  │ rgb(194,115,74)     │
│  │                      │   └────────┘ [Add to palette]    │
│  └──────────────────────┘                                  │
├────────────────────────────────────────────────────────────┤
│  Algorithm [Dominant ▾]   Colors ──●──── 6                 │
│  Sensitivity ──●──── balanced    ☐ Ignore near-white/black │
│  Sort [Coverage ▾]   Format [HEX ▾]                        │
├────────────────────────────────────────────────────────────┤
│  Palette — 6 colours · 96 % of pixels covered              │
│  ┌────────┬────────┬────────┬────────┬────────┬────────┐  │
│  │        │        │        │        │        │        │  │
│  │  34 %  │  22 %  │  17 %  │  12 %  │   8 %  │   3 %  │  │
│  └────────┴────────┴────────┴────────┴────────┴────────┘  │
│   #2E1A12   #C2734A  …                                     │
│   Dark Brown          AA on white ✓  AAA ✗   [copy] [✕]    │
│                                                            │
│  [Copy all ▾ CSS · SCSS · Tailwind · JSON · HEX list]      │
│  [Download PNG] [Download SVG] [Download JSON]             │
└────────────────────────────────────────────────────────────┘
```

### Functional requirements (all implemented)

**Loading**
1. Upload by picker, **drag & drop**, or clipboard paste; accept JPG, PNG, WebP, GIF,
   AVIF, BMP (B1, B2, B7).
2. Show name, dimensions, file size, and the downscaled size actually analysed (B6, A7).
3. Reject over 25 MB with a clear message; warn softly above ~8 MP (E4).
4. Handle decode failure with a specific error, not the extraction error (E3).
5. Two or three bundled sample images (B5).

**Extraction**
6. Own quantizer: sample the downscaled pixels, median-cut into N buckets, return each
   bucket's average colour **and its share of sampled pixels** (A1, C2).
7. Algorithms: **Dominant** (coverage-ordered median cut) and **Vibrant set** (vibrant,
   muted, light, dark, plus a dominant fallback when a slot has no candidate) (A2).
8. Colour count 3–16, live (C6, E1) — no Extract button; runs after `decode()` (E2).
9. Sensitivity control mapping to sampling step plus the merge threshold in a perceptual
   space; three or four named stops rather than a naked number (A3).
10. Optional near-white/near-black suppression (A4); fully transparent pixels always
    skipped, with a note when a large share was skipped (A6).
11. Enforce a minimum perceptual distance so swatches are never near-duplicates (A5).

**Palette**
12. Per swatch: colour, coverage %, HEX, RGB, HSL, nearest CSS colour name, contrast
    ratios against white and black with AA/AAA verdicts, copy, and remove (C2–C5).
13. Sort by coverage, hue, lightness, or saturation (C1).
14. Eyedropper: hover the preview for a magnified loupe and live readout, click to pick,
    then optionally add the picked colour to the palette (B3, C7).
15. Header states the colour count and the total share of pixels the palette covers.

**Output**
16. Format toggle governs what a swatch copy puts on the clipboard (D1).
17. Copy all as CSS variables, SCSS, Tailwind keys, JSON, or a HEX list (D2).
18. Download PNG (labelled, optional title, light/dark background, 2×), SVG, and a rich
    JSON including coverage, name, and contrast (D3–D5), with a correct download
    lifecycle (D8).

**Cross-cutting**
19. Display preferences persisted (E5); `crossOrigin` removed (E7).
20. Accessibility per F1–F5.

### Component state (proposed)

```typescript
type Algorithm = 'dominant' | 'vibrant';
type SortMode = 'coverage' | 'hue' | 'lightness' | 'saturation';
type ColorFormat = 'hex' | 'rgb' | 'hsl';
type Sensitivity = 'fast' | 'balanced' | 'fine';

interface Swatch {
  id: string;
  rgb: { r: number; g: number; b: number };
  hex: string;
  hsl: { h: number; s: number; l: number };
  coverage: number;              // 0–1 share of sampled pixels
  name: string;                  // nearest CSS named colour
  contrastWhite: number;         // WCAG ratio
  contrastBlack: number;
  role?: 'vibrant' | 'muted' | 'light' | 'dark';   // vibrant algorithm only
}

interface ImageInfo {
  name: string; size: number; type: string;
  width: number; height: number;
  sampledWidth: number; sampledHeight: number;
  transparentShare: number;      // drives the "pixels skipped" note
}

state: {
  imageUrl: string | null; imageInfo: ImageInfo | null;
  status: { level: 'warn' | 'error'; message: string } | null;
  isAnalysing: boolean;
  algorithm: Algorithm; colorCount: number; sensitivity: Sensitivity;
  ignoreExtremes: boolean;
  swatches: Swatch[]; removedIds: string[];
  sort: SortMode; format: ColorFormat;
  eyedropperOn: boolean; hoverColor: Swatch | null; pickedColor: Swatch | null;
  copiedId: string | null; announcement: string;
}
```

### Module split (as built)

| File | Holds |
|------|-------|
| `palette.ts` | Types, sensitivity table, RGB/HEX/HSL/Lab conversion, `relativeLuminance`, `contrastRatio`, `deltaE`, the named-colour table and `nearestColorName`, `samplePixels`, `medianCut`, `mergeSimilar`, the vibrant scorer, `extractPalette`, `pickedSwatch`, `sortSwatches`, `formatColor`, `wcagLabel`, `paletteToSvg`, `exportPalette`. No React, no DOM. |
| `index.tsx` | State, `localStorage`, file/paste/drop handling, decode-then-downscale analysis, the one-pixel eyedropper, PNG rendering, and the UI. |

### Test matrix

Automated assertions run against `palette.ts` by transpiling the module and building
synthetic images pixel by pixel. **45 assertions, all passing.**

| Case | Expected | Result |
|------|----------|--------|
| Solid red 100×100 image | one swatch `#FF0000`, coverage 100 % | ✅ auto |
| Half red / half blue | two swatches at ~50 % each | ✅ auto |
| Two-colour image asked for 6 colours | honestly returns 2, no near-duplicates (A5) | ✅ auto |
| Gradient image | ≥4 distinct swatches, coverage descending under sort=coverage | ✅ auto |
| Coverage across counts 3/6/12/16 | never exceeds 100 % (A1) | ✅ auto |
| `medianCut` on an empty pixel list | returns nothing, no throw | ✅ auto |
| `mergeSimilar` on two near-identical reds | folded into one, populations summed (A5) | ✅ auto |
| Fully transparent image | no swatches, `transparentShare` 1, no crash (A6) | ✅ auto |
| Half-transparent logo | only opaque pixels counted; share reported (A6) | ✅ auto |
| Alpha 127 vs 128 | skipped / kept — the threshold holds | ✅ auto |
| White page with a small red logo, suppression off vs on | white dominates / red surfaces (A4) | ✅ auto |
| `extremeShare` after suppression | reports the 90 % that was skipped | ✅ auto |
| An all-white image with suppression on | no swatches rather than a throw | ✅ auto |
| Sensitivity fast vs fine on banded colours | fine keeps at least as many apart (A3) | ✅ auto |
| Two identical runs | byte-identical palettes — deterministic | ✅ auto |
| 600×600 buffer at balanced sensitivity | sample count within the 25 k budget (A7) | ✅ auto |
| Vibrant on a six-colour image | 6 swatches, ≥2 roles assigned, gaps filled from dominant (A2) | ✅ auto |
| Vibrant slot on red/grey/black/white | picks the saturated colour (s > 80) | ✅ auto |
| Vibrant coverage | also within 100 % | ✅ auto |
| RGB→HEX→RGB for 0, 1, 127, 128, 254, 255 | identical round trip | ✅ auto |
| `hexToRgb('#f00')` / rubbish / 5 digits | shorthand expands, invalid returns null | ✅ auto |
| RGB→HSL for red, white, black, mid grey | 0/100/50, 0/0/100, 0/0/0, 0/0/50 | ✅ auto |
| RGB→HSL hue for green, cyan, blue, magenta | 120, 180, 240, 300 | ✅ auto |
| White on black | 21:1 | ✅ auto |
| `#767676` on white | ≈4.54:1 — the AA boundary | ✅ auto |
| Contrast symmetry | ratio(a,b) == ratio(b,a) | ✅ auto |
| WCAG labels at 21 / 7 / 6.9 / 4.5 / 4.49 / 3 / 2.9 | AAA, AAA, AA, AA, AA Large, AA Large, Fail | ✅ auto |
| A black swatch's stored contrasts | 21:1 on white, 1:1 on black | ✅ auto |
| Nearest name for `#FF0000`, `#708090`, `#010101`, `#FFFFFF` | Red, Slate Gray, Black, White | ✅ auto |
| Nearest name for an off-palette peach | Salmon / Coral / Orange family | ✅ auto |
| Exact CSS colours resolve to themselves | Red, Teal, Gold, Indigo | ✅ auto |
| Sort by hue / lightness / saturation | monotonic in the chosen channel (C1) | ✅ auto |
| Sorting | does not mutate the input array | ✅ auto |
| A picked swatch | coverage 0, marked `picked` (B3/C7) | ✅ auto |
| CSS / SCSS / Tailwind exports | match strict syntax patterns (D2) | ✅ auto |
| HEX list export | one hex per line | ✅ auto |
| JSON export | parses; carries hex, name, coverage, contrast, origin (D5) | ✅ auto |
| JSON coverage for an extracted colour | reported as a percentage | ✅ auto |
| SVG export | well-formed, one rect per swatch, correct width, labels (D4) | ✅ auto |
| Exports of an empty palette | empty strings, not malformed output | ✅ auto |
| Two colours sharing a name | export slugs stay unique | ✅ auto |
| `formatColor` in hex / rgb / hsl | exact strings (D1) | ✅ auto |
| `formatBytes` | 512 B, 1.5 KB, 3.34 MB | ✅ auto |
| 4000×3000 photo end to end | downscaled to the 1000 px long edge, sub-second (A7) | ⬜ manual |
| Eyedropper over a known pixel in the browser | exact RGB from the full-resolution image (B3) | ⬜ manual |
| PNG export at 1× and 2× | correct dimensions, no clipped labels (D3) | ⬜ manual |
| Drag & drop, clipboard paste, sample buttons | all load an image (B1, B2, B5) | ⬜ manual |
| Corrupt file / 30 MB file | specific decode error / refused with the limit named (E3, E4) | ⬜ manual |
| Keyboard-only pass | every control labelled; swatch names announce colour and coverage (F1–F5) | ⬜ manual |

---

# Part 4 — Content (corrected)

Both content surfaces were wrong; both were fixed in the same change.

**`TOOL_CONTENT['color-palette']`** — rewritten
- "3 to 20 colors" (twice) → the real **3–16**.
- The **sensitivity setting** is now real (A3), so the mention stays — and now describes
  what it actually does, in `steps` and in the "colors don't match what I see" FAQ, which
  also covers near-white/black suppression and the Vibrant algorithm.
- "Click Extract to analyze" removed — extraction is automatic once the image decodes.
- Drag & drop kept, and now true; clipboard paste added.
- Coverage percentages, the eyedropper, colour names, WCAG verdicts, sorting, and the
  copy-all formats are all covered in `intro`, `steps`, and `why`.
- New FAQs: what the percentage means, how the quantiser works, how to sample one exact
  pixel, whether a colour is safe for text, and which export format to pick.
- Privacy claim kept and now stronger: no upload **and** no third-party library in the
  path.
- `related` gains `image-compressor`; the `color-palette-generator` note now explicitly
  points at harmonies and shades (the Cut C9).

**Registry entry (`src/lib/constants/tools.ts`)** — corrected
- "The tool automatically extracts dominant colors" is now true; kept.
- "By default, we extract the 10 most dominant colors" → six by default, 3–16, with a note
  that an image with fewer distinct colours returns the real number.
- The format list now matches the `accept` attribute: JPG, PNG, WebP, GIF, AVIF, BMP, with
  the 25 MB limit named.
- `howToUse` and `aboutContent` updated for coverage, contrast, and the eyedropper.

Validation run: `npm run validate:content` → **PASSED**, `npm run type-check` → clean,
`npm run build` → succeeds (245 pages).

---

## How to Use content (source for the steps section)

1. Drop an image onto the tool, browse for it, or paste one from your clipboard.
2. The palette appears automatically as soon as the image decodes — no button to press.
3. Choose how many colours you want (3–16), pick Dominant or Vibrant, and nudge
   Sensitivity if colours are merging too eagerly or splitting too finely.
4. Read each swatch's share of the image, its HEX/RGB/HSL, its nearest colour name, and
   whether it passes WCAG AA as text on white or black.
5. Turn on the eyedropper and hover the image to read any exact pixel colour, then add it
   to your palette.
6. Copy a single colour in your chosen format, copy the whole palette as CSS, SCSS,
   Tailwind, JSON, or a HEX list, or download it as PNG, SVG, or JSON.

---

## Change log
- **v1** — shipped: ColorThief extraction, 3–12 colours, HEX/RGB/HSL display, hex copy,
  JSON and PNG export.
- **v2 (this spec, shipped)** — own quantizer with coverage percentages, Dominant and
  Vibrant algorithms, a real sensitivity control, near-white/black suppression, explicit
  transparency handling, dedupe, downscaling, working drag & drop plus clipboard paste and
  drawn samples, an eyedropper with a loupe, colour names, WCAG contrast verdicts,
  sorting, swatch removal with restore, a format toggle, copy-all in five formats,
  improved PNG/@2×/SVG/JSON export, automatic extraction, size and decode guards, and an
  accessibility pass — with `color-thief-browser` and its type shim removed.

## Verifying the engine

`palette.ts` has no React or DOM dependency, so it can be transpiled with the repo's local
`typescript`, evaluated, and asserted against directly, feeding it synthetic images built
pixel by pixel — that is how the 45-assertion matrix above runs. Re-run it after touching
any of these, which regress silently: `medianCut` and `mergeSimilar` (palette composition
and the honest-count behaviour), `samplePixels` (the alpha threshold, suppression
thresholds, and the sample ceiling), `scoreCandidate` (vibrant role selection),
`contrastRatio`/`wcagLabel` (accessibility verdicts users will trust), and the export
serialisers (each has a strict syntax test).
