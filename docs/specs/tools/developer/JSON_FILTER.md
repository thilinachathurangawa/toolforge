# SPEC: JSON Filter Tool
**File:** `docs/specs/tools/developer/JSON_FILTER.md`
**Status:** **v2 shipped** (Part 1 is the v1 audit that motivated it)
**Slug:** `json-filter`
**Category:** developer
**Component:** `src/components/tools/JsonFilter/index.tsx`
**Engine:** `src/components/tools/JsonFilter/query.ts` — path parsing, operator
semantics, collection detection, key discovery, projection, sorting, diagnostics and
JSON error location, all React-free and testable on their own.

---

## SEO

- **Title:** `JSON Filter Tool — Filter JSON Data Online | ToolForge`
- **Description:** `Filter JSON arrays and objects by keys, values, or custom conditions. Extract specific data from large JSON. No sign-up required.`
- **Primary Keyword:** json filter
- **Secondary Keywords:** filter json data, query json, json search tool
- **Add for v2:** filter json array by value, json where clause, extract fields from json,
  filter json by nested key, json filter online

---

## Scope boundary with the sibling JSON tools

Three tools sit next to each other and must not blur into one another:

- **JSON Path Finder** — *navigation*: walk to one value at a known path.
- **JSON Filter** (this tool) — *selection*: given a collection, keep the items that
  satisfy one or more conditions, and shape what comes out.
- **JSON Formatter** — *presentation*: pretty-print and validate.

v2 gives JSON Filter a small **source path** input purely to point at the collection to
filter (`data.users`). It does not grow into a path explorer, and it does not adopt a
query language — see the Cut decisions in Part 2.

---

# Part 1 — v1 audit

Read from the current component, not assumed. v1 is ~100 lines of logic: parse, wrap in
an array, keep items that have a key, optionally substring-match its value.

### Works today
- Paste JSON, live re-filter on every change (a `useEffect` calls the filter callback).
- `JSON.parse` with the error message surfaced in a red panel.
- Non-array input is wrapped in a one-element array so a single object is accepted.
- Empty filter key → the whole (wrapped) document is echoed back, formatted.
- Filter key → keeps items where `item[key]` is neither `undefined` nor `null`.
- Filter value → case-insensitive substring match on `String(item[key])`.
- Output pretty-printed at 2 spaces with a Copy button.

### Not built, though v1's own spec required it
| # | Requirement from the v1 spec | State |
|---|---|---|
| M1 | "Show number of filtered results" | **Missing** — no count anywhere in the UI |
| M2 | "Handle JSON arrays **and objects**" | Only arrays really: an object is wrapped in `[obj]`, so you get the whole object back if the key exists, never a subset of its keys |
| M3 | "custom conditions" (registry description + About copy) | **Missing** — one key plus one substring is the entire model |

Note also that every checkbox in the v1 spec is unticked while the header says
"Completed" — the document was never reconciled with the build.

### Bugs and sharp edges
| # | Problem | Evidence |
|---|---------|----------|
| B1 | **A `null` item crashes the whole filter.** `item[filterKey]` on `null` throws, the `catch` swallows it, and the user sees `Cannot read properties of null (reading 'x')` styled as a JSON syntax error. | `filterJSON` |
| B2 | **Value-only search silently does nothing.** With the key blank the function returns early and `filterValue` is ignored — no error, no hint. | early `return` on `!filterKey.trim()` |
| B3 | **Substring matching on numbers is surprising.** `filterValue: "3"` matches `30`, `13`, and `-3`; there is no numeric comparison, so "price over 100" is inexpressible. | `String(value).includes(...)` |
| B4 | **Object and array values stringify to `[object Object]`,** so any value match against a nested field matches nothing meaningful. | same line |
| B5 | **Primitive items behave oddly.** For string items, `item['length']` or `item['0']` resolves, so those items pass a key filter that should not apply to them. | `item[filterKey]` |
| B6 | **Re-parses the entire document on every keystroke** — including keystrokes in the two filter boxes, which cannot change the parse result. No debounce, no memoisation. Pasting a few MB makes typing crawl. | `JSON.parse` inside `filterJSON`, dep array includes `filterKey`/`filterValue` |
| B7 | Parse errors give the raw engine message with a byte position, never a line/column or an excerpt. | `catch` |
| B8 | Filter errors and parse errors are indistinguishable in the UI. | single `error` string |
| B9 | The **Apply Filter** button is redundant — filtering is already live — but its presence implies results are stale until clicked. | button + effect |
| B10 | No result count, so an empty result is ambiguous: bad key, no matches, or empty input all look identical. | — |
| B11 | Output shape is always an array, so a single object in comes back as `[{…}]`. | `Array.isArray(data) ? data : [data]` |
| B12 | Input textarea is `resize-none` and fixed at 150 px for arbitrarily large documents. | className |
| B13 | No size guard at all: a 50 MB paste is parsed synchronously on the main thread. | — |
| B14 | No `aria-live` on the error or result region; the label/`input` pairs are not associated with `htmlFor`/`id`. | JSX |

### Missing basics for a tool of this kind
No file upload or drag & drop, no sample data, no clear button, no download, no minify
or indent choice, no key sorting, no wrap toggle, no projection (choosing which fields
come out), no sorting or limiting of results, and no way to discover which keys the
pasted data actually contains.

### Content drift
`TOOL_CONTENT['json-filter']` is currently *accurate* — it honestly says matching is a
case-insensitive substring, that nesting is unsupported, and that numeric ranges are
not possible. That honesty is exactly what v2 invalidates: three of its four FAQs and
half its `why` bullets become wrong the moment operators and nested paths land, so the
entry must be rewritten alongside the code.

---

# Part 2 — Enhancement option catalogue

Every option worth considering, with a decision. **Do** = v2 scope, **Cut** = rejected
with a reason, **Defer** = good, but later.

### A. The predicate model (the heart of the upgrade)
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| A1 | Multiple conditions, combined with **AND** or **OR** | High | M | **Do** |
| A2 | A real operator set: `exists`, `not exists`, `=`, `≠`, `contains`, `not contains`, `starts with`, `ends with`, `>`, `≥`, `<`, `≤`, `matches regex`, `is empty`, `is null`, `is true`, `is false`, `type is` | High | M | **Do** |
| A3 | Type-aware comparison: numeric operators parse both sides as numbers and skip non-numeric values instead of coercing them to strings | High | S | **Do** |
| A4 | Case-sensitivity toggle (one global switch, not per condition) | Med | XS | **Do** |
| A5 | Nested key paths — `address.city`, `items[0].sku` | High | S | **Do** |
| A6 | Wildcards in paths — `items[*].sku`, `*.id` — with "any element matches" semantics | High | M | **Do** |
| A7 | Invert the whole query (keep everything that does *not* match) | Med | XS | **Do** |
| A8 | Regex operator with flags, and a clear error for an invalid pattern | Med | S | **Do** |
| A9 | Key-less full-text search across all of an item's values (fixes B2 properly) | High | S | **Do** |
| A10 | A jq-style expression language | High | XL | **Cut** — a second parser to own and debug; the condition rows cover the same ground without a syntax to learn, which is this tool's selling point |
| A11 | Arbitrary JS predicates (`item.age > 30` via `new Function`) | Med | S | **Cut** — executing pasted code in the user's page is not a trade this tool needs to make |
| A12 | Saved/named filter presets | Low | M | **Defer** |

### B. Choosing what to filter
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| B1 | **Source path** input: filter `data.users` rather than the document root | High | S | **Do** |
| B2 | **Auto-detected collections** offered as one-click chips — `data.users (128 items)`, `results (12 items)` | High | M | **Do** — turns the source path from a guess into a choice |
| B3 | Filter a plain **object's entries** by key or value, returning an object (fixes M2/B11) | High | S | **Do** |
| B4 | Recursive mode: match objects anywhere in the document, at any depth | Med | M | **Defer** |
| B5 | NDJSON / JSON Lines input | Low | S | **Defer** |

### C. Shaping the output
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| C1 | **Projection**: pick which keys survive (include list) | High | S | **Do** |
| C2 | Exclude mode for the same control | Med | XS | **Do** |
| C3 | **Pluck**: return a flat array of one field's values | Med | XS | **Do** |
| C4 | Preserve input shape — object in, object out | High | S | **Do** |
| C5 | Sort results by a key, ascending or descending | Med | S | **Do** |
| C6 | Limit to the first N results | Med | XS | **Do** |
| C7 | Deduplicate by a key | Low | S | **Defer** |
| C8 | Flatten nested objects into dotted keys | Low | M | **Defer** |
| C9 | Group by a key | Low | M | **Cut** — a different tool's job; reshaping is not filtering |
| C10 | Convert the result to CSV | Low | M | **Cut** — `json-to-csv` exists; link to it from `related` instead |

### D. Presenting the result
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| D1 | **"X of Y items matched"** with the percentage (finally delivers M1) | High | XS | **Do** |
| D2 | Indent 2 / 4 / tab, plus a minify toggle | Med | XS | **Do** |
| D3 | Sort object keys alphabetically in the output | Low | XS | **Do** |
| D4 | Download the result as `.json` | Med | XS | **Do** |
| D5 | Wrap / no-wrap toggle for long lines | Med | XS | **Do** |
| D6 | **Diagnostic empty state**: "128 items scanned, 0 matched — the key `status` exists on 0 of them" | High | S | **Do** — the single biggest cure for B10 |
| D7 | Render cap for enormous results (show the first ~2000 lines with a notice, full text still copyable/downloadable) | Med | S | **Do** |
| D8 | Syntax highlighting | Low | M | **Defer** |
| D9 | Per-item badge showing which condition matched | Low | M | **Cut** — clutter for a marginal insight |

### E. Input experience
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| E1 | File upload + drag & drop for `.json`/`.txt` | High | S | **Do** |
| E2 | Load-example button with a realistic nested dataset | High | XS | **Do** |
| E3 | Clear / reset | Med | XS | **Do** |
| E4 | Prettify + validate the input in place | Med | XS | **Do** |
| E5 | Parse errors with **line and column** and a short excerpt with a caret | High | S | **Do** |
| E6 | Parse once per input change (memoised), debounced; conditions re-filter the parsed value without re-parsing (fixes B6) | High | S | **Do** |
| E7 | Size guard: amber warning over 2 MB, refuse over 10 MB with a message | Med | XS | **Do** |
| E8 | **Key discovery**: detected paths with type and occurrence count, click one to fill a condition | High | M | **Do** — pairs with B2 and removes the guesswork behind every condition |
| E9 | Resizable input textarea | Low | XS | **Do** |
| E10 | Persist display options (indent, wrap, case sensitivity) to `localStorage` | Low | XS | **Do** |
| E11 | Query history | Low | M | **Defer** |

### F. Robustness
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| F1 | Per-item error isolation — a `null` or primitive item is skipped, never fatal (fixes B1/B5) | High | S | **Do** |
| F2 | Separate parse-error and query-error channels in the UI (fixes B8) | Med | XS | **Do** |
| F3 | Ignore `__proto__`/`constructor`/`prototype` segments when walking a path, and read own properties only | Med | XS | **Do** |
| F4 | Note that very large integers lose precision through `JSON.parse` | Low | XS | **Do** (one-line caveat in the content, not a feature) |
| F5 | Web Worker for multi-MB documents | Low | M | **Defer** |

### G. Accessibility & polish
| ID | Enhancement | Value | Effort | Decision |
|----|-------------|-------|--------|----------|
| G1 | `htmlFor`/`id` on every control; `aria-live` for the match count and errors | High | S | **Do** |
| G2 | Condition rows fully keyboard-operable, with focus moved to a newly added row and `aria-label`s on the remove buttons | High | S | **Do** |
| G3 | Drop the redundant Apply button; keep filtering live and debounced (fixes B9) | Med | XS | **Do** |
| G4 | Warning vs error colours that hold contrast in dark mode | Med | XS | **Do** |

### H. Explicitly out of scope
- Editing or patching the JSON, JSON5/comments/trailing-comma tolerance, schema
  validation, and any server-side processing.
- Charting or aggregation (sum/avg/group) — this tool selects, it does not summarise.

---

# Part 3 — v2 scope (implemented)

Four decisions taken during implementation, all deviations from or additions to the
catalogue above:

- **Incomplete ≠ invalid (new).** A condition row missing a path or value is marked
  *incomplete* — inactive, with a quiet grey hint — while a bad regex or a non-numeric
  bound is a real *error* in red. An unusable row of either kind never drops every item,
  which is what a naive implementation does the moment you start typing.
- **Parse errors are located by our own scanner, not by reading the engine's message.**
  The plan assumed a character offset could be scraped from `JSON.parse`'s error, but
  current V8 emits a quoted snippet with no position, older V8 says "at position N", and
  Firefox reports line/column. `query.ts` therefore contains a small validating scanner
  that runs only after a parse has already failed and reports the exact offset itself,
  falling back to the engine message if it disagrees.
- **Object sources are matched as `{ key, value }`.** Each entry is filtered as that
  two-field shape, so `key starts with db` and `value.host contains x` both work, and the
  result keeps its object form. Sorting is disabled for object sources — key order is the
  source's own — rather than left as a control that silently does nothing.
- **Include lifts dotted paths to flat keys.** `profile.city` becomes a key literally
  named `profile.city`, which doubles as a one-field flatten and keeps the deferred C8
  out of scope.

### Layout

A single column, because the tool is a pipeline: input → source → conditions → shape →
result. Everything below the conditions is collapsible so the default view stays small.

```
┌──────────────────────────────────────────────────────────┐
│  JSON Input                       2.1 KB · 128 items     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ { "data": { "users": [ { "name": "Ada", … } ] } }  │  │
│  └────────────────────────────────────────────────────┘  │
│  [Upload] [Load example] [Prettify] [Clear]              │
│  ⚠ Line 14, column 9: Unexpected token }                 │
│      13 |   { "id": 3, "name": "Lin" },                  │
│      14 |   { "id": 4, }                                 │
│                  ^                                       │
├──────────────────────────────────────────────────────────┤
│  Filter                                                  │
│  Source: [ data.users            ]                       │
│  Detected: [data.users (128)] [data.audit (9)] [root (1)]│
│                                                          │
│  Match [All ▾] of these conditions      ☐ Invert         │
│   ┌──────────────────────────────────────────────────┐   │
│   │ [role      ▾] [equals    ▾] [admin        ] [✕] │   │
│   │ [logins    ▾] [≥         ▾] [10           ] [✕] │   │
│   │ [profile.city ▾] [contains ▾] [zür        ] [✕] │   │
│   └──────────────────────────────────────────────────┘   │
│  [+ Add condition]   ☐ Case sensitive                    │
│  Or search every value: [ zürich            ]            │
│                                                          │
│  Keys found: role (string, 128) · logins (number, 128)   │
│              profile.city (string, 121) · tags[*] (…)    │
├──────────────────────────────────────────────────────────┤
│  Output ▾                                                │
│  Fields: (•) All  ( ) Include  ( ) Exclude  ( ) Pluck    │
│          [ name, role, logins                        ]   │
│  Sort by [logins ▾] [desc ▾]   Limit [100]               │
│  Indent [2 ▾]  ☐ Minify  ☐ Sort keys  ☐ Wrap lines      │
├──────────────────────────────────────────────────────────┤
│  Result — 12 of 128 items matched (9.4%)                  │
│  [Copy] [Download .json]                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [ { "name": "Ada", "role": "admin", … } ]          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

Empty-result state, in place of the output box:
  0 of 128 items matched.
  · "role" exists on 128 items — 0 equal "admin" (values seen: user, editor, owner)
  · "logins" exists on 0 items — check the spelling or pick from Keys found
```

### Functional requirements (all implemented)

**Input**
1. Textarea (resizable), file upload, and drag & drop for `.json`/`.txt`; the file name
   and size are shown once loaded.
2. Parse once per input change, debounced ~200 ms, memoised so condition edits never
   re-parse (E6/B6).
3. Parse failure reports line, column, the offending line, and a caret — derived from
   the error's character offset (E5).
4. Amber warning above 2 MB; refuse above 10 MB with a message naming the limit (E7).
5. Prettify (reformat valid input in place), Load example, and Clear (E2–E4).

**Source**
6. Source path input accepting dots and array indexes, defaulting to the document root.
7. Auto-detected collections — every array of length ≥ 1, plus the root — offered as
   chips labelled with path and item count; clicking one sets the source (B2).
8. If the source resolves to an array, items are filtered. If it resolves to a plain
   object, its **entries** are filtered and an object is returned (B3/C4). Anything else
   is a query error explaining what the path resolved to.

**Conditions**
9. Zero or more condition rows: **path**, **operator**, **value**. Rows combine with
   All (AND) or Any (OR); an Invert switch negates the combined result (A1/A7).
10. Operators per A2. Numeric operators require both sides to be numeric and skip items
    whose value is not (A3). `exists`/`is null`/`is empty`/`is true`/`is false`/`type is`
    take no value input.
11. Paths support dots, `[n]`, and `[*]`/`*`; a wildcard passes if **any** matched value
    satisfies the condition (A5/A6).
12. A separate "search every value" box matches text against every scalar value found
    anywhere inside an item, at any depth (A9).
13. Case sensitivity is one global toggle applying to string comparison and search (A4).
14. An invalid regex reports the engine message against that row without killing the
    rest of the query (A8/F2).
15. Items that are `null` or primitives are skipped for key-based conditions rather than
    throwing; the full-value search still applies to them (F1).
16. Path walking reads own properties only and ignores `__proto__`, `constructor`, and
    `prototype` segments (F3).

**Key discovery**
17. Scan up to the first 200 items of the source and list the paths found with their
    inferred type and occurrence count; clicking a path fills the next condition's path
    (E8). Nested objects contribute dotted paths; arrays contribute `[*]` paths.

**Output shaping**
18. Field mode: All / Include / Exclude / Pluck, with a comma-separated field list.
    Pluck returns a flat array of that one path's values (C1–C3).
19. Sort by a path, ascending or descending, with a stable comparison that puts missing
    values last (C5); limit to the first N (C6).
20. Indent 2/4/tab, minify, sort keys, wrap lines — the last three persisted to
    `localStorage` (D2/D3/D5/E10).

**Result**
21. Header reads "X of Y items matched (Z%)", announced via `aria-live` (D1/G1).
22. Copy and Download `.json` (D4).
23. Renders at most ~2000 lines with a notice that the full result is still copied and
    downloaded in full (D7).
24. The empty result state explains itself per D6: items scanned, and for each condition
    how many items even had that path, plus a few distinct values seen.

**Cross-cutting**
25. No Apply button — filtering is live (G3). Parse errors, query errors, and warnings
    are three visually distinct channels (F2/G4).
26. Labels, ids, `aria-live`, keyboard-operable condition rows, focus to new rows (G1/G2).

### Component state (proposed)

```typescript
type Combinator = 'all' | 'any';
type FieldMode = 'all' | 'include' | 'exclude' | 'pluck';
type Operator =
  | 'exists' | 'notExists' | 'eq' | 'neq' | 'contains' | 'notContains'
  | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'regex' | 'isEmpty' | 'isNull' | 'isTrue' | 'isFalse' | 'typeIs';

interface Condition {
  id: string;
  path: string;
  operator: Operator;
  value: string;
}

interface CompiledCondition {   // produced by query.ts, one per row
  condition: Condition;
  segments: PathSegment[];      // parsed path, wildcards included
  regex: RegExp | null;
  numericValue: number | null;
  error: string | null;         // shown in red: bad regex, non-numeric bound
  incomplete: boolean;          // not filled in yet: inactive, grey hint
}

interface KeyInfo { path: string; type: string; count: number }

interface Collection { path: string; label: string; count: number }

type Status = { level: 'warn' | 'error'; message: string; detail?: string } | null;

type Source =
  | { kind: 'array'; items: unknown[] }
  | { kind: 'object'; entries: { key: string; value: unknown }[] }
  | { kind: 'invalid'; message: string };

state: {
  input: string; debouncedInput: string;
  fileName: string | null; fileError: string | null; isDragging: boolean;
  sourcePath: string;
  conditions: Condition[]; combinator: Combinator; invert: boolean; search: string;
  fieldMode: FieldMode; fields: string;
  sortPath: string; sortDir: 'asc' | 'desc'; limit: string;
  display: {                       // persisted to localStorage
    indent: 2 | 4 | 'tab'; minify: boolean; sortKeys: boolean;
    wrap: boolean; caseSensitive: boolean;
  };
  hydrated: boolean;
  showOutputOptions: boolean; showKeys: boolean; copied: boolean;
}

// derived (useMemo): input bytes · parsed value · detected collections · resolved
// source · compiled conditions · key inventory · pipeline result · serialised output ·
// diagnostics · render-capped output
```

### Module split (as built)

| File | Holds |
|------|-------|
| `query.ts` | Types and `OPERATORS`, path parsing/walking, condition compiling and matching, deep search, collection detection, key inventory, diagnostics, projection, sorting, the pipeline, serialising, and `parseJson` with its error locator. No React, no DOM. |
| `index.tsx` | State, debouncing, `localStorage`, file handling, and the UI. |

### Test matrix

Automated assertions run against `query.ts` the same way as the Base64 codec: transpile
the module, exercise the exported functions. **66 assertions, all passing** — including
nine real-world syntax mistakes checked for correct line reporting (trailing commas in
objects and arrays, a missing comma between members, single-quoted and unquoted keys, an
unclosed brace, an unterminated string, `NaN` as a value, and trailing content).

| Case | Expected | Result |
|------|----------|--------|
| `[{"a":1},{"a":2}]`, `a ≥ 2` | one item — numeric comparison, not substring (A3/B3) | ✅ auto |
| `a contains "1"` on the same data | one item; `a = 1` matches both `1` and `"1"` | ✅ auto |
| `price > 100` where one item has `price: "abc"` | non-numeric item skipped, no error (A3/F1) | ✅ auto |
| Numeric operator given a non-numeric bound | row error, not a silent empty result | ✅ auto |
| `starts with` / `ends with` | match only at the right end | ✅ auto |
| `type is` across null / array / object / string / number / boolean | one match each (A2) | ✅ auto |
| `type is int` | row error listing the valid type names | ✅ auto |
| `is empty` over `""`, `[]`, `{}`, `0` | three matches — `0` is not empty | ✅ auto |
| `is null` / `is true` / `is false` | strict, `"true"` does not count | ✅ auto |
| `exists` where the key is present but `null` | matches — the key is there (A2) | ✅ auto |
| `not exists` | exact complement of `exists` | ✅ auto |
| `not equals` / `does not contain` on an item lacking the key | matches — nothing there equals it | ✅ auto |
| Object-valued field with `contains` | compares via JSON, never `[object Object]` (B4) | ✅ auto |
| `[{"p":{"c":"Zürich"}}]`, `p.c contains "zür"` | matches (A5) | ✅ auto |
| Same with Case sensitive on | no match (A4) | ✅ auto |
| Regex under both case settings | honours the switch (A8) | ✅ auto |
| `t[0] = "a"` and `t[*].s = "B"` | index and wildcard paths both work (A5/A6) | ✅ auto |
| `a.* ≥ 5` | bare wildcard walks object values | ✅ auto |
| Leading `$` in a path / unclosed `[` | tolerated / row error | ✅ auto |
| Paths `__proto__.polluted`, `constructor` | resolve to nothing (F3) | ✅ auto |
| Two conditions, All vs Any | AND gives 0, OR gives 2 (A1) | ✅ auto |
| Invert on a matching query | complement returned (A7) | ✅ auto |
| Search `"zürich"` with no conditions | matches at any depth — v1 ignored this entirely (A9/B2) | ✅ auto |
| Search combined with a condition | ANDs together | ✅ auto |
| Rows with a blank path or value | inactive and grey, not errors, nothing dropped | ✅ auto |
| A row with a broken regex | never empties the result; sibling rows still filter | ✅ auto |
| `[null, {"x":1}, 5, "str"]` with `x exists` | one item, no crash (F1/B1) | ✅ auto |
| `["abc", {"length":2}]` with `length exists` | only the object — no string-property accident (B5) | ✅ auto |
| Deep search over primitive items | still reaches them | ✅ auto |
| Source `data.users` on a wrapped document | filters that array, not the root (B1) | ✅ auto |
| Collection detection on a two-array document | both found with correct counts (B2) | ✅ auto |
| Source resolving to a number / to nothing | query error naming the type / "Nothing found" (F2) | ✅ auto |
| Object source, `value.host contains "x"` | returns an **object** of surviving entries (B3/C4/M2) | ✅ auto |
| Object source, `key starts with "db"` | filters on the entry key | ✅ auto |
| Object source unit | reported as "entries", not "items" | ✅ auto |
| Multi-value source path `*.u` | resolved values concatenated into one collection | ✅ auto |
| Include `role, name` | only those keys, in the order given (C1) | ✅ auto |
| Include `profile.city` | lifted to a flat `profile.city` key | ✅ auto |
| Exclude `password, profile` | those keys removed from every item (C2) | ✅ auto |
| Pluck `profile.city` | flat array; items missing the path are dropped (C3) | ✅ auto |
| Sort asc / desc / missing values / equal keys | ordered, missing last both ways, stable (C5) | ✅ auto |
| Limit 10 on 128 items | 10 returned, header still reports 128 scanned and 128 matched (C6/D1) | ✅ auto |
| Diagnostics on a query matching nothing | path presence, match count, sample values (D6) | ✅ auto |
| Diagnostics on a misspelled key | "exists on 0" | ✅ auto |
| Indent 2 / 4 / tab, minify, deep sort keys | exact output shapes (D2/D3) | ✅ auto |
| Nine common syntax mistakes | correct line plus a caret excerpt (E5) | ✅ auto |
| Engine message noise | `at position N` and `is not valid JSON` tails stripped | ✅ auto |
| Key discovery: nested, wildcard, mixed types | correct paths, counts, and `mixed` where honest (E8) | ✅ auto |
| 5000-line result | render cap notice; Copy and Download still give everything (D7) | ⬜ manual |
| 3 MB input / 12 MB input | amber warning / refused (E7) | ⬜ manual |
| Typing in a condition box with 2 MB pasted | no re-parse, stays responsive (E6/B6) | ⬜ manual |
| Upload a `.json`, then drop another onto the input | both load (E1) | ⬜ manual |
| Keyboard-only pass: add, edit, remove a condition | reachable, labelled, focus lands on the new row (G1/G2) | ⬜ manual |

---

# Part 4 — Content (rewritten)

`TOOL_CONTENT['json-filter']` was honest about v1's limits, which is exactly why v2
invalidated it. Rewritten in the same change:

- The "case-insensitive substring" bullet is gone; "no query language to learn" stays,
  restated as rows of path / operator / value with real comparisons behind them.
- "Can I filter on nested fields?" flipped from no to yes, with `profile.city`,
  `addresses[0].postcode`, and `items[*].sku` as worked examples.
- "Can I filter on a numeric range, like price over 100?" flipped from no to yes, noting
  that non-numeric values are skipped rather than coerced.
- "How do the conditions work together?" now covers All/Any, Invert, and that unfinished
  rows are ignored rather than treated as errors.
- New FAQs: filtering records inside a wrapper object via the source path and detected
  chips; what Include / Exclude / Pluck do; and why a very large integer can come back
  changed (`JSON.parse` doubles — F4).
- Privacy claim kept and still true: no network calls anywhere in the tool.
- `related` now also links `json-diff` alongside `json-path-finder`, `json-formatter`,
  and `json-to-csv` (the CSV route that replaced the Cut C10).

Validation run: `npm run validate:content` → **PASSED**, `npm run type-check` → clean,
`npm run build` → succeeds (245 pages).

---

## How to Use content (source for the steps section)

1. Paste your JSON, or upload / drop a `.json` file.
2. If your records sit inside a wrapper, pick the collection — the detected arrays are
   offered as one-click chips, or type a source path such as `data.users`.
3. Add conditions: choose a path (or click one from the discovered keys), an operator
   such as equals, contains, or ≥, and a value. Combine them with All or Any, and tick
   Invert to keep everything that does not match.
4. Or type in "search every value" to find records containing text at any depth.
5. Shape the result: keep all fields, include or exclude a list, or pluck a single
   field's values; sort and limit if you like.
6. Read the "X of Y items matched" header, then copy or download the result.

---

## Change log
- **v1** — shipped: single key + optional substring value, live filtering, copy.
- **v2 (this spec, shipped)** — condition rows with 18 operators, nested and wildcard
  paths, All/Any/Invert, deep value search, source-path selection with auto-detected
  collections, key discovery, object-entry filtering with shape preservation, projection
  and pluck, sorting and limiting, output formatting options, match counts and a
  self-explaining empty state, engine-independent line/column parse errors, file upload
  and drag & drop, size guards, memoised parsing, and an accessibility pass.

## Verifying the engine

`query.ts` has no React or DOM dependency, so it can be transpiled with the repo's local
`typescript`, evaluated, and asserted against directly — that is how the 66-assertion
matrix above runs. Re-run it after touching any of these, which regress silently:
`matchesValue` (operator semantics), `resolvePathValues` (wildcard fan-out and the
blocked-key guard), the negative-operator negation in `matchesCondition`, `sortItems`
(missing-last and stability), and `locateJsonError` (line reporting across syntax
mistakes, since engine messages differ by browser and version).
