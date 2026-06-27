# SPEC: ROT13 / Caesar Cipher Tool
**File:** `docs/specs/tools/developer/ROT13_CAESAR_CIPHER.md`
**Status:** Completed
**Slug:** `rot13-caesar-cipher`
**Category:** developer

---

## SEO

- **Title:** `ROT13 / Caesar Cipher Tool — Encode & Decode Online | ToolForge`
- **Description:** `Encode or decode ROT13 and any Caesar cipher shift (1–25) online free. Real-time character shifting. No sign-up, no upload. Educational cipher tool for developers.`
- **Primary Keywords:** ROT13 decoder online, Caesar cipher tool
- **Secondary Keywords:** shift cipher calculator text, decrypt ROT13 string, caesar cipher encoder

---

## Functional Requirements

- Text input area (plain text or cipher text)
- Shift selector: numeric input or slider, range 1–25 (default 13 for ROT13)
- ROT13 preset button
- Real-time output as user types or adjusts shift
- Encode and Decode directions (since ROT13 is symmetric, encode = decode at shift 13)
- Copy button for output
- Only shifts A–Z and a–z; numbers and symbols pass through unchanged
- Pure algorithmic JS using charCodeAt / fromCharCode

---

## UI Layout

```
┌──────────────────────────────────────────────┐
│  Input Text:                                 │
│  ┌────────────────────────────────────────┐  │
│  │  Hello, World!                         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Shift:  [════════════════●] 13  [ROT13]     │
│                                              │
│  Output:                                     │
│  ┌────────────────────────────────────────┐  │
│  │  Uryyb, Jbeyq!                         │  │
│  └────────────────────────────────────────┘  │
│  [Copy Output]  [Swap Input/Output]          │
└──────────────────────────────────────────────┘
```

---

## Notes

- ROT13 is its own inverse at shift=13, so encode/decode are the same operation
- For other shifts, decoding = shifting by (26 - shift)
- The tool should always show the "encode" direction output; swapping input/output handles decoding
- Swap button: moves output to input and re-applies the shift
