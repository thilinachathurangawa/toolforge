# SPEC: Phase 2 — Core Tools
**File:** `docs/specs/phases/PHASE_2_CORE_TOOLS.md`  
**Status:** Pending (after Phase 1)  
**Version:** 1.0

---

## Overview

Build the first 8 high-traffic tools. Each tool follows the same component structure and has its own spec file in `docs/specs/tools/`.

---

## Tool Build Order (by search volume priority)

| # | Tool | Spec File | Est. Monthly Searches |
|---|---|---|---|
| 1 | Image Compressor | `tools/IMAGE_COMPRESSOR.md` | 90,000+ |
| 2 | QR Code Generator | `tools/QR_GENERATOR.md` | 60,000+ |
| 3 | Password Generator | `tools/PASSWORD_GENERATOR.md` | 50,000+ |
| 4 | Image Cropper | `tools/IMAGE_CROPPER.md` | 40,000+ |
| 5 | JSON Formatter | `tools/JSON_FORMATTER.md` | 35,000+ |
| 6 | Word Counter | `tools/WORD_COUNTER.md` | 30,000+ |
| 7 | Color Palette Extractor | `tools/COLOR_PALETTE.md` | 20,000+ |
| 8 | Base64 Encoder/Decoder | `tools/BASE64_ENCODER.md` | 18,000+ |

---

## Standard Tool Component Structure

Every tool MUST follow this structure:

```
src/components/tools/ToolName/
├── index.tsx          ← Main exported component
├── types.ts           ← Tool-specific TypeScript types
└── utils.ts           ← Tool-specific utility functions (if needed)
```

### Tool Component Template

```tsx
// index.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ToolName() {
  // 1. State
  // 2. Handlers
  // 3. Render: Input section → Process button → Output section
}
```

---

## Tool UI Standards

Every tool UI MUST have:
- [ ] Clear input area (drag & drop or text input)
- [ ] Action button (prominent, primary color)
- [ ] Output area with copy/download button
- [ ] Error handling with user-friendly messages
- [ ] Loading state during processing
- [ ] Mobile-friendly layout
- [ ] No data sent to any server

---

## Phase 2 Acceptance Criteria

- [ ] All 8 tools functional
- [ ] Each tool has SEO metadata
- [ ] Each tool has JSON-LD schema
- [ ] Each tool linked from homepage
- [ ] Ad units placed correctly on each tool page
- [ ] All tools work on mobile
- [ ] No tool sends data to external servers
