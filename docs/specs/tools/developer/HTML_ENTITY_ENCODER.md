# SPEC: HTML Entity Encoder / Decoder
**File:** `docs/specs/tools/developer/HTML_ENTITY_ENCODER.md`
**Status:** Completed
**Slug:** `html-entity-encoder`
**Category:** developer

---

## SEO

- **Title:** `HTML Entity Encoder Decoder — Escape Special Characters Online | ToolForge`
- **Description:** `Encode or decode HTML entities online free. Convert <, >, &, ", ' to &lt; &gt; &amp; and back. Includes named, decimal, and hex entity reference. Nothing uploaded.`
- **Primary Keywords:** HTML entity encoder decoder, convert text to HTML entities
- **Secondary Keywords:** escape special characters HTML online, HTML encode decode tool

---

## Functional Requirements

- Dual textarea layout side by side
- Mode toggle: Encode / Decode
- Encode converts: `<` `>` `&` `"` `'` and extended characters to named/numeric entities
- Decode maps entity strings back to raw characters
- DOM-based approach: hidden textarea for reliable entity parsing
- Quick reference checklist of common entities below the tool
- Copy buttons for both sides
- Real-time transformation as user types

---

## UI Layout

```
┌──────────────────────────────────────────────┐
│  [Encode]  [Decode]                          │
├────────────────────┬─────────────────────────┤
│  Input:            │  Output:                │
│  ┌──────────────┐  │  ┌───────────────────┐  │
│  │ <h1>Hello</h1│  │  │ &lt;h1&gt;Hello   │  │
│  │ & world      │  │  │ &lt;/h1&gt;       │  │
│  └──────────────┘  │  │ &amp; world       │  │
│  [Copy]            │  └───────────────────┘  │
│                    │  [Copy]                 │
├──────────────────────────────────────────────┤
│  Common Entities Reference:                  │
│  < → &lt;   > → &gt;   & → &amp;            │
│  " → &quot; ' → &apos;  space → &nbsp;       │
└──────────────────────────────────────────────┘
```

---

## Notes

- Use a hidden `textarea` element to leverage the browser's built-in entity encoding/decoding
- For encoding: `element.textContent = input; return element.innerHTML`
- For decoding: `element.innerHTML = input; return element.textContent`
- Include common entity reference table with ~10 examples
