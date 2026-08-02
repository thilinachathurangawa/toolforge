# CR3 to JPG Converter — Spec

## Slug
`cr3-to-jpg`

## Category
`image`

## Component Location
`src/components/tools/Cr3ToJpg/index.tsx`

## Overview
Converts Canon RAW (.CR3) files to JPG entirely in the browser. A CR3 is an ISO base media
container; the camera stores a full-resolution JPEG rendering in the first `trak`, a `PRVW`
preview and a `THMB` thumbnail, plus EXIF as `CMT1` (IFD0), `CMT2` (Exif IFD) and `CMT4` (GPS)
inside the Canon `uuid` box. The tool parses that container, takes the largest embedded JPEG,
re-encodes it to the requested quality/size, and rebuilds the EXIF into the output.

**Not implemented and deliberately out of scope:** demosaicing the raw sensor data. The output is
the camera's own rendering, so it cannot recover highlight/shadow latitude. The UI states this.
There is no server-side fallback — nothing is uploaded.

## UI Controls

### Upload Section
- Large drag & drop zone with "Drop CR3 files here or click to browse"
- File input accepting `.cr3` files (multiple)
- File list showing: name, size, thumbnail preview, remove button
- Clear all button

### Conversion Settings
- **JPG Quality**: Slider 10-100% (default 90%)
- **Output Resolution**: Original/75%/50%/Custom width & height
- **Keep Aspect Ratio**: Toggle, shown only for Custom (enabled by default)
- **Auto Orientation**: Toggle (enabled by default) — rotates per the EXIF orientation tag and
  rewrites the tag to 1 so the pixels aren't rotated twice downstream
- **Remove Metadata**: Toggle (disabled by default)

No background-color or color-space controls: the source is an opaque JPEG so there is nothing to
matte against, and `canvas.toBlob` only emits sRGB, so an Adobe RGB option would be cosmetic.

### Batch Processing
- Progress bar with current/total files
- Per-file status indicators (pending/processing/done/error)
- Estimated remaining time
- Cancel button (stops processing)
- Retry failed files button

### Preview Section
- Side-by-side comparison: Original CR3 preview vs Converted JPG
- Before/After slider
- Zoom controls (25%, 50%, 100%, 200%, Fit)
- Pan functionality
- Fullscreen preview button
- Metadata display panel (camera model, ISO, aperture, shutter speed, etc.)

### Download Options
- Download individual JPG buttons
- Download All as ZIP button
- Filename options: Preserve original/Custom prefix/Custom suffix
- File rename input field

### Privacy Notice
- "Your files are never uploaded to our servers. All processing happens locally in your browser whenever supported."
- Server fallback notification when browser limitations require it

## Core Logic

### File Validation
```typescript
const isCr3File = (file: File): boolean => {
  return /\.cr3$/i.test(file.name) || 
         file.type === 'image/x-canon-cr3' ||
         file.type === '';
};
```

### CR3 Decoding Strategy
Implemented in `src/components/tools/Cr3ToJpg/cr3.ts` — no external decoder, no WASM.

1. Walk top-level boxes with `File.slice()`, loading only `moov` and small `uuid` boxes; `mdat` is
   skipped by size so a 50 MB file never lands in memory whole.
2. Collect JPEG candidates: each `trak`'s first sample (from `stco`/`co64` + `stsz`), plus `PRVW`
   and `THMB`.
3. Verify candidates with a 3-byte read for the SOI marker — this is what rejects the multi-megabyte
   raw track cheaply — then take the largest and read just those bytes.
4. Parse `CMT1`/`CMT2`/`CMT4` as standalone TIFF blocks; fall back to the embedded JPEG's APP1.
5. If box walking finds nothing, sweep the file for SOI…EOI runs as a last resort.

### Conversion Pipeline
1. **File Upload**: Validate `.cr3` extension / MIME type
2. **Extraction**: `extractCr3Image()` returns `{ jpeg, source, tiff }`
3. **Decode**: `createImageBitmap(blob, { imageOrientation: 'none' })`, with an `<img>` fallback for
   browsers lacking it — auto-rotation is suppressed so we control orientation ourselves
4. **Image Processing**: resize, then `ctx.transform` for EXIF orientations 2–8
5. **JPG Encoding**: `canvas.toBlob` at the chosen quality, retrying at 60%/36% scale if the browser
   rejects the canvas size (Safari caps canvas area well below a 45 MP frame)
6. **Metadata**: rebuild an EXIF APP1 from the parsed IFDs and splice it in after SOI, unless the
   user asked for it stripped. Maker notes (`0x927C`) and other offset-bearing tags are dropped —
   their pointers are absolute to the original file
7. **Download**: blob URLs, revoked on reset and unmount

### Batch Processing
```typescript
const processBatch = async (files: File[]): Promise<ConversionResult[]> => {
  const results: ConversionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    setProgress({ current: i + 1, total: files.length });
    
    try {
      const result = await convertSingleFile(files[i], settings);
      results.push(result);
    } catch (error) {
      results.push({ 
        file: files[i], 
        status: 'error', 
        error: error.message 
      });
    }
    
    // Update UI incrementally
    setResults([...results]);
  }
  
  return results;
};
```

### Memory Management
- Process files sequentially (not parallel) to avoid memory spikes
- Revoke object URLs after download
- Clean up canvas contexts
- Handle files >100MB with chunked processing

## TypeScript Interfaces

```typescript
interface ConversionSettings {
  quality: number; // 0.1 to 1.0
  backgroundColor: string;
  outputResolution: 'original' | 'half' | 'three-quarters' | 'custom';
  customWidth?: number;
  customHeight?: number;
  keepAspectRatio: boolean;
  colorSpace: 'srgb' | 'adobergb';
  autoOrientation: boolean;
  removeMetadata: boolean;
}

interface ExifMetadata {
  cameraModel?: string;
  dateTaken?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  lens?: string;
  focalLength?: string;
  whiteBalance?: string;
}

interface ConversionResult {
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  convertedBlob?: Blob;
  previewUrl?: string;
  originalSize: number;
  convertedSize?: number;
  error?: string;
  metadata?: ExifMetadata;
}

interface ConversionProgress {
  current: number;
  total: number;
  estimatedTimeRemaining?: number;
}
```

## Dependencies
- `jszip` - ZIP file generation for batch downloads
- Existing UI libraries (lucide-react, tailwindcss)

Container parsing and EXIF read/write are hand-rolled in `cr3.ts`. `exif-js` is **not** used: it
targets JPEG/TIFF and returns nothing for a CR3, and it cannot write EXIF back out.

## Error Handling

### Error Types
- **Invalid File Format**: "Please upload valid CR3 files (.cr3 extension)"
- **Corrupted CR3**: "The CR3 file appears to be corrupted and cannot be decoded"
- **Insufficient Memory**: "This file is too large for browser-based processing. Try our server-side conversion."
- **Browser Not Supported**: "Your browser doesn't support WebAssembly. Please use Chrome, Firefox, or Edge."
- **Conversion Failed**: "Conversion failed. Please try again or use server-side processing."

### Recovery Suggestions
- For corrupted files: "Try opening the file in Canon's Digital Photo Professional to verify integrity"
- For memory issues: "Process files individually instead of in batches"
- For browser issues: "Update your browser or try a different modern browser"

## Performance Optimizations

### Web Workers
Run conversion logic in a Web Worker to avoid blocking the UI:
```typescript
const conversionWorker = new Worker('/workers/cr3-converter.worker.ts');
```

### Lazy Loading
Dynamically import heavy libraries:
```typescript
const loadDecoder = async () => {
  if (!decoderModule) {
    decoderModule = await import('libraw-wasm');
  }
  return decoderModule;
};
```

### Progressive Loading
- Show low-res preview first
- Load full-resolution when user zooms
- Lazy load thumbnails in file list

## Accessibility
- Keyboard navigation for all controls
- ARIA labels on buttons and inputs
- Focus management in modals
- Screen reader announcements for progress updates
- High contrast mode support

## SEO Keywords
- "CR3 to JPG converter"
- "Canon RAW converter online"
- "convert CR3 to JPG free"
- "Canon RAW image converter"
- "browser CR3 converter"
- "batch CR3 conversion"
- "Canon RAW to JPG"

## Content Outline

**Intro**: What CR3 files are (Canon's proprietary RAW format), why photographers need to convert them to JPG (sharing, web use, compatibility), and the challenges of CR3 conversion (proprietary format, large file sizes).

**Steps**: 
1. Upload CR3 files via drag & drop or file picker
2. Configure conversion settings (quality, resolution, color space)
3. Review EXIF metadata and previews
4. Start conversion and monitor progress
5. Download individual JPGs or all as ZIP

**Why**: 
- Client-side processing when possible (privacy, speed)
- Batch processing for efficiency
- EXIF metadata preservation
- Configurable quality and resolution
- Free, no sign-up required

**FAQs**: 
- What is a CR3 file and why do I need to convert it?
- Is my data safe when using this converter?
- Can I convert multiple CR3 files at once?
- What JPG quality should I use?
- Does this preserve EXIF metadata?
- What if my browser doesn't support CR3 decoding?

**Related**: 
- `heic-to-jpg` (similar RAW conversion for Apple format)
- `image-converter` (general format conversion)
- `image-compressor` (optimize JPG after conversion)
- `image-resizer` (resize converted images)
- `cr2-to-jpg` (older Canon RAW format)

## Technical Challenges & Solutions

### CR3 Format Complexity
- **Challenge**: CR3 is Canon's proprietary format with limited open-source support
- **Solution**: Use WebAssembly port of libraw or similar RAW decoding library
- **Fallback**: Server-side processing with user consent

### Browser Memory Limits
- **Challenge**: CR3 files can be 50MB+ (RAW data), causing browser crashes
- **Solution**: Sequential processing, memory cleanup, chunked decoding for large files
- **Fallback**: Server-side processing for files >100MB

### Cross-Browser Compatibility
- **Challenge**: WebAssembly support varies across browsers
- **Solution**: Feature detection, graceful degradation, clear messaging
- **Fallback**: Server-side processing for unsupported browsers

## Implementation Phases

### Phase 1: MVP
- Basic CR3 to JPG conversion
- Single file processing
- Quality slider
- Simple download

### Phase 2: Enhanced Features
- Batch processing
- EXIF metadata display
- Preview functionality
- ZIP download

### Phase 3: Advanced Features
- Before/After slider
- Advanced output options
- Server-side fallback
- Performance optimizations

## Testing Requirements
- Test with various Canon camera models (R5, R6, EOS R series)
- Test with different CR3 file sizes (small, medium, large)
- Test batch processing with 10+ files
- Test error handling (corrupted files, unsupported formats)
- Test across browsers (Chrome, Firefox, Safari, Edge)
- Test mobile responsiveness
- Test accessibility with screen readers