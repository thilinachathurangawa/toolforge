# SPEC: Excel Formula Explainer Tool
**File:** `docs/specs/tools/workplace/EXCEL_FORMULA_EXPLAINER.md`
**Status:** v2 shipped — **E1–E28 implemented** (P1–P5 complete). E29 and E30 deliberately deferred, with the reasoning kept below. The defect table is retained as the record of what v1 did and is now the parser's fixture list; every row produces its "correct output" column.
**Slug:** `excel-formula-explainer`
**Category:** workplace
**Subcategory:** excel-tools

---

## SEO

- **Title:** `Excel Formula Explainer — Understand Complex Formulas | ToolForge`
- **Description:** `Paste any Excel or Google Sheets formula and get instant plain-English explanations. Learn what each function does, understand arguments, and identify cell references.`
- **Primary Keyword:** excel formula explainer
- **Secondary Keywords:** excel formula help, understand excel formulas, excel function explanation, google sheets formula help
- **Keywords unlocked by the enhancements below:** excel formula breakdown, nested formula explainer, excel formula debugger, why is my formula wrong, excel formula checker, format/beautify excel formula, excel formula evaluation order, vlookup vs xlookup converter, excel formula syntax error

---

## Functional Requirements

Original v1 scope, all now delivered:

- [x] Text input for pasting Excel/Google Sheets formulas
- [x] Parse formulas and identify all functions used, including nested — real tokenizer + recursive-descent parser
- [x] Reference database — **231 functions**, shared with `excel-function-reference`
- [x] Display explanation for each function in the formula
- [x] List all cell references found in the formula — absolute, whole-column/row, sheet-qualified, external workbook, table, named, spilled
- [x] Handle nested function explanations with proper hierarchy — collapsible tree, unlimited depth
- [x] Support for array formulas and special operators — `{}` constants, every operator, plus the `--` and `(A=x)*(B=y)` idioms
- [x] Copy explanation to clipboard — plain text, Markdown, or `.md` download
- [x] Clear/reset button
- [x] Example formulas for quick testing — eight, all parsing correctly
- [x] No external library needed (built-in parsing)

---

## v1 implementation audit (historical — this is what was replaced)

`src/components/tools/ExcelFormulaExplainer/index.tsx` was a single 1091-line
file holding the function database, the parser, and the UI. Parsing was two
regexes:

```ts
const cellRefRegex  = /([A-Z]+[0-9]+:[A-Z]+[0-9]+|[A-Z]+[0-9]+)/g;
const functionRegex = /([A-Z]+)\(([^)]*)\)/g;
```

`[^)]*` cannot cross a closing parenthesis, so the outer call of any nested
formula stops at the *first* `)` and the inner call is consumed with it. This is
not an edge case — it is the tool's headline use case.

### Verified defects — all fixed in v2

Every row below was run against the v1 parsing code and the output recorded.
The "correct output" column is now what the tool produces; these rows are the
parser's regression fixtures.

| Input | v1 output | v2 output (what ships now) |
| --- | --- | --- |
| `=IFERROR(VLOOKUP(A1,B:C,2,FALSE),"Not found")` — a **shipped example button** | `IFERROR` with a single malformed arg `VLOOKUP(A1,B:C,2,FALSE`; `VLOOKUP` never reported; `"Not found"` never reported | `IFERROR(value, value_if_error)` with `VLOOKUP(...)` explained as a child node |
| `=INDEX(A2:A100,MATCH(1,(B2:B100=F1)*(C2:C100=F2),0))` — the formula in the tool's own SEO intro | `INDEX` only, args mangled; `MATCH` missing | `INDEX` → `MATCH` → the `*` array-AND idiom |
| `=TEXTJOIN(", ",TRUE,A1:A5)` | args parsed as `["\"", "\"", "TRUE", "A1:A5"]` — the comma **inside the string literal** splits the argument list | `[", ", TRUE, A1:A5]`; also `TEXTJOIN` isn't in the database |
| `=SUM($A$1:$A$10)` | **no** cell references found | `$A$1:$A$10`, absolute, 10 cells |
| `=VLOOKUP(A1,B:C,2,FALSE)` — the placeholder text | `B:C` **not** listed as a reference | whole-column range `B:C` |
| `=SUM(Sheet1!A1:A10)` | `A1:A10` — sheet name silently dropped | `Sheet1!A1:A10`, external sheet flagged |
| `=LOG10(A1)` | `LOG10` reported as a **cell reference**; no function found | `LOG10` function, arg `A1` |
| `=STDEV.P(A1:A10)` | function name parsed as `P`, then dropped as unknown | `STDEV.P` |
| `=sum(a1:a10)` (Excel accepts lowercase) | nothing found at all | same as uppercase |
| `=IF(A1>0,"See A1 note","")` | `A1` counted twice — once from the string literal | one reference |
| `=SUM(Table1[Amount])` | no references | structured table reference |
| `=SUM(A1:A10` (unbalanced) | silently returns nothing — no error shown | "missing closing parenthesis" with a caret |
| `=A1*B1` (operators, no function) | **entire results panel renders nothing**, including the cell-reference block, because the panel is gated on `parsedFunctions.length > 0` | reference list + operator explanation |
| `=SUM(A1:A2)+SUM(B1:B2)` | `SUM` listed twice with identical text | two positions of one function, or one entry with two call sites |
| `=SUM(A1:A10;B1:B10)` (EU locale separator) | one arg | two args |
| Any unknown function | silently dropped, with no message | "not in our reference — here is what we can still tell you" |

Additionally:

- **Arguments are matched to parameters by index only.** `func.info.arguments[argIndex]`
  falls off the end for variadic functions, so the 4th argument of
  `SUM(A1,B1,C1,D1)` is labelled the generic string `"Argument"`. Repeating
  argument groups (`SUMIFS`, `IFS`, `SWITCH`) are never described past the
  hard-coded first two pairs.
- **No argument-count validation.** `=VLOOKUP(A1)` is explained as if valid.
- **Interaction is inconsistent.** Clicking an example explains immediately;
  typing requires pressing "Explain Formula", and editing the formula after an
  explanation leaves stale results on screen with no indication they are stale.
- **No `aria-live` region**, so nothing is announced when results appear.
- The function database (82 entries) is a private const inside the component,
  while `ExcelFunctionReference` maintains its own separate list of ~281 entries.
  Two sources of truth for the same data, and the explainer has the smaller one.

### Content accuracy debt — resolved

`TOOL_CONTENT['excel-formula-explainer']` made the following claims that v1 did
not deliver. All were rewritten alongside the v2 implementation, and each is now
true of the shipped tool. Recorded here so the same drift is recognisable if it
recurs:

- *"the parser identifies function calls inside other function calls and explains
  each layer separately rather than stopping at the outer function"* — it does
  exactly the opposite: it stops at the outer function and discards the inner one.
- *"explains the overall intent of the full expression"* — there is no
  whole-formula narrative anywhere in the component.
- *"For nested formulas (like INDEX/MATCH or IF with nested IFs), each layer is
  explained in sequence so you can follow the logic from the innermost function
  outward"* (steps) — no hierarchy and no ordering exist.
- *"a set of pre-loaded examples (VLOOKUP, INDEX/MATCH, SUMIF, nested IF)"* —
  there is no INDEX/MATCH example and no nested-IF example in `EXAMPLE_FORMULAS`.
- The privacy claim (*"All parsing happens in your browser"*) **is accurate** and
  must stay accurate: no enhancement below may introduce a network call without
  updating that copy.

---

## File layout (as shipped)

The parser modules are pure and importable, so they were verified outside a
browser — the defect table above was run against them directly, exactly as
`InternetSpeedTest/utils.ts` was.

```
src/components/tools/ExcelFormulaExplainer/
  index.tsx          orchestration + UI shell
  types.ts           Token, AstNode, Diagnostic, Explanation, ReferenceInfo
  tokenizer.ts       string → tokens (strings, refs, numbers, operators, names)
  parser.ts          tokens → AST, with error recovery and positions
  explain.ts         AST → per-node explanation, narrative, evaluation order
  diagnose.ts        lint rules (E15) + modernization suggestions (E16)
  format.ts          pretty-print / minify (E20)
  analyze.ts         composes parse + explain + diagnose; text/Markdown export
  FormulaTree.tsx    collapsible nested breakdown
  HighlightedFormula.tsx  syntax-highlighted, paren-matched input overlay
src/lib/data/excel-functions.ts   shared function database (E26)
```

`src/lib/data/excel-functions.ts` is the **single source of truth**, shared with
`ExcelFunctionReference` — which previously kept its own copy-pasted duplicate of
the same 82 entries. Both tools now read the same 231.

---

## Enhancement Options

Grouped by cost and dependency, not by appeal. IDs are referenced by the phase
plan.

**Status: E1–E28 are implemented.** E29 and E30 remain open and the
recommendation for both is still "not yet" / "not here" — the reasoning is kept
as written so the decision stays on record rather than being rediscovered.

### Tier 0 — Correctness: replace the regexes with a real parser

**E1. Tokenizer + recursive-descent parser producing an AST** ⭐ foundational
Hand-written, ~250 lines, no dependency. Token kinds: number, string, boolean,
error literal (`#REF!`, `#N/A`, …), reference, name, function-name, operator,
separator, paren, brace. Parser handles precedence (`:` > space > `,` > unary
`-` > `%` > `^` > `*` `/` > `+` `-` > `&` > comparison), nesting to arbitrary
depth, and records `{start, end}` positions on every node so the UI can map a
node back to the exact characters. This single change fixes 9 of the 16 rows in
the defect table.

**E2. Complete reference grammar**
Recognize and classify, with the type shown to the user:
absolute/mixed (`$A$1`, `A$1`), whole column/row (`B:C`, `3:7`), sheet-qualified
(`Sheet1!A1`), quoted sheet names (`'Q3 Data'!A1:B9`), 3-D ranges
(`Sheet1:Sheet4!A1`), external workbook (`[Book1.xlsx]Sheet1!A1`), structured
table references (`Table1[Amount]`, `Table1[[#Headers],[Qty]]`), defined names,
spilled-range operator (`A1#`), and implicit intersection (`@A1:A10`). Report
range size in cells so a full-column range is visibly 1,048,576 rows.

**E3. Function-name grammar**
`[A-Z]+` misses more names than it matches in modern Excel. Accept letters,
digits, `.` and `_` (`LOG10`, `STDEV.P`, `NORM.S.INV`, `T.TEST`,
`PERCENTILE.INC`, `_xlfn.XLOOKUP`, `_xlfn.LAMBDA`), strip the `_xlfn.` /
`_xlws.` prefixes for lookup, and normalize case so lowercase-typed formulas
work.

**E4. Argument splitting that respects context**
Split on separators only at depth 0 and **outside string literals**, honouring
doubled quotes (`""` inside a string), array-constant braces, and both `,` and
`;` separators (auto-detected, with a manual override for locale-specific
formulas). Fixes the `TEXTJOIN(", ",…)` class of bug.

**E5. Syntax validation with positions**
Unbalanced or unexpected parentheses, unterminated string, empty argument slot,
missing operand, stray separator, curly/smart quotes pasted from a document or
web page (a very common real-world paste failure), and a leading `=` typed twice.
Show the message with a caret under the offending character rather than silently
returning nothing. Distinguish **error** (cannot parse) from **warning** (parsed,
but suspicious).

**E6. Degrade gracefully instead of rendering nothing**
Two current dead ends: a formula with no recognized function shows an empty
screen, and an unknown function is dropped without a word. Render whatever is
known — references, operators, structure — and label unknown names explicitly
("`FOOBAR` is not in our reference; it takes 3 arguments here"), with a link to
the Excel Function Reference tool.

**E7. Fix or replace the broken shipped example**
`=IFERROR(VLOOKUP(A1,B:C,2,FALSE),"Not found")` must produce a correct nested
breakdown, and the example set should be extended to cover the formulas the SEO
copy claims exist (INDEX/MATCH, nested IF) plus one dynamic-array formula.

### Tier 1 — Explanation depth (the actual product)

**E8. Nested tree breakdown with hierarchy** ⭐ highest user value
Render the AST as an indented, collapsible tree — outer function, its arguments,
each argument that is itself a call expanded beneath it, unlimited depth. Each
node shows: the function, its category, its plain-English purpose, and the
sub-expression it was built from. Replaces the current flat numbered list.

**E9. Correct argument-to-parameter mapping**
Model parameters properly in the database — `{ name, description, optional,
repeating, group }` — so variadic tails (`SUM(number1, [number2], …)`) and
repeating pairs (`SUMIFS`, `IFS`, `SWITCH`, `COUNTIFS`) are named correctly for
every supplied argument rather than falling off the end into the literal string
"Argument". Validate the count against min/max and flag "VLOOKUP expects 3–4
arguments, 1 given".

**E10. Whole-formula narrative in plain English** ⭐
One short paragraph composed from the AST, above the tree: *"Look up the value
in A1 in the first column of columns B:C and return the matching value from
column 2, requiring an exact match. If that lookup fails with any error, show
'Not found' instead."* This is what most visitors actually want, and it is what
the intro copy already promises. Composed from per-function narrative templates
plus argument substitution — deterministic, no model, no network.

**E11. Step-by-step evaluation order**
Number the nodes innermost-outward, mirroring Excel's own "Evaluate Formula"
dialog: *Step 1 — `(B2:B100=F1)*(C2:C100=F2)` builds an array of 1s and 0s.
Step 2 — MATCH finds the first 1. Step 3 — INDEX returns that row.* Directly
answers "which part runs first", the most common comprehension failure.

**E12. Operator explanations**
The current tool explains none. Cover `&` (join text), `*` `/` `+` `-` `^` `%`,
comparison operators, unary minus, the `--` double-unary coercion idiom, `:`
(range), space (intersection), `,` (union), `{1,2;3,4}` array constants, `#`
(spill), `@` (implicit intersection). Explain the *idioms* too — `(A=x)*(B=y)`
as array AND, `--(A1:A10>5)` as boolean-to-number coercion — because these are
exactly the parts of an inherited formula that look like line noise.

**E13. Syntax highlighting and parenthesis matching**
Colour functions, references, strings, numbers, and operators in the input
(overlay technique — a highlighted `<pre>` behind a transparent textarea, so
paste, undo, and mobile keyboards keep working). Rainbow-match parentheses by
depth, and highlight the matching pair plus the corresponding tree node on
hover/caret. Bidirectional: hovering a tree node highlights its characters in
the formula.

**E14. Dependency summary**
Beyond the current flat cell list: unique cells, ranges (with cell counts),
distinct sheets referenced, external workbooks, defined names, table references,
and a count of hard-coded literal values. Flag **volatile** functions (`NOW`,
`TODAY`, `RAND`, `RANDBETWEEN`, `OFFSET`, `INDIRECT`, `CELL`, `INFO`) because
they force recalculation of the dependency chain on every edit.

**E15. Diagnostics — what is likely wrong or risky** ⭐ strong differentiator
A rule pass over the AST, each finding with a severity and a one-line reason:
- `VLOOKUP` with `col_index_num` greater than the width of `table_array` → guaranteed `#REF!`
- `VLOOKUP`/`HLOOKUP`/`MATCH` with the 4th/3rd argument omitted → silent approximate match on unsorted data
- lookup table given as a relative range → breaks when the formula is filled down
- `IFERROR` wrapping a whole expression → hides `#VALUE!` and `#DIV/0!`, not just "not found"
- division where the denominator is a cell with no zero guard
- full-column ranges inside `SUMPRODUCT`/array contexts → recalculation cost
- nesting deeper than ~7 levels, or the same sub-expression repeated (a `LET` candidate)
- `INDIRECT`/`OFFSET` present → volatile and un-traceable by Excel's audit tools
- mixed absolute/relative anchoring that will not survive a fill
- text-vs-number comparison (`"5"` against a numeric cell)

**E16. Modernization suggestions**
Where a clearly better modern equivalent exists, show the rewritten formula with
a copy button and a note on version availability:
`VLOOKUP` → `XLOOKUP`; nested `IF` chains → `IFS`/`SWITCH`; `CONCATENATE` →
`TEXTJOIN`/`&`; `INDEX`+`MATCH` → `XLOOKUP`; `SUMPRODUCT((A=x)*(B=y))` →
`SUMIFS`; CSE array entry → native dynamic arrays; repeated sub-expressions →
`LET`.

**E17. Excel vs Google Sheets compatibility flags**
Per function, mark Excel-only (`DATEDIF` quirks, `LAMBDA` scope, `GROUPBY`,
`PIVOTBY`, `TEXTSPLIT`), Sheets-only (`QUERY`, `ARRAYFORMULA`, `IMPORTRANGE`,
`SPLIT`, `REGEXEXTRACT`, `GOOGLEFINANCE`, `FLATTEN`), and note the Excel version
a function first shipped in (2019 / 365) so a user knows why a formula pasted
from the web returns `#NAME?`. The current FAQ hand-waves this; the tool should
state it per function.

**E18. `LET` and `LAMBDA` name binding**
Both are increasingly common and completely opaque to a flat parser. Resolve
`LET` name/value pairs and show each name with the expression it stands for, then
substitute those names in the narrative. For `LAMBDA`, list the parameters and
explain the body once rather than per call site.

### Tier 2 — UX, output, and accessibility

**E19. Live explanation, no click gate**
Debounced (~250 ms) explain-as-you-type, which also removes the current
stale-results problem where editing the formula leaves an old breakdown on
screen. Keep an explicit button for keyboard users and set `Ctrl/Cmd+Enter` as
the shortcut. Parsing a formula is microseconds — there is no reason to gate it.

**E20. Formula beautifier / minifier**
Pretty-print the formula across multiple indented lines (the way spreadsheet
professionals format long formulas with `Alt+Enter`), and collapse back to a
single line. Copyable both ways, and pasteable straight back into Excel. This is
a standalone search-traffic feature ("format excel formula") that falls out of
the AST for almost nothing.

**E21. Better export**
The current copy produces plain text with `•` bullets. Add: copy as Markdown
(for documentation and tickets), copy as an indented plain-text tree, download
as `.md`/`.txt`, and per-section copy buttons. Include the narrative (E10), the
evaluation order (E11), and the diagnostics (E15).

**E22. Shareable link + recent formulas**
Encode the formula into `?f=` so a colleague can open the same breakdown — the
formula is the only input, so the link is complete and honest (unlike a speed
test result, nothing is being asserted as measured). Keep the last ~10 formulas
in `localStorage` with a clear-history control, strictly local.

**E23. Detail level toggle: Simple / Detailed**
Simple = narrative + tree with one line per function. Detailed = adds syntax
signatures, per-argument descriptions, evaluation order, dependency summary, and
diagnostics. The current single view is simultaneously too sparse for a learner
and too shallow for an auditor.

**E24. Accessibility and mobile**
`aria-live="polite"` on the results region, the breakdown as a real nested list,
labelled controls, visible focus on tree nodes, and `prefers-reduced-motion`
respected by any expand/collapse animation. On mobile: horizontal scroll
containment for long formulas (a 300-character formula currently forces the page
to scroll sideways), and verify the tree at 320 px.

**E25. Per-function deep links**
Each function in the breakdown links to its entry in
`excel-function-reference`, and offers inline expansion showing the full syntax
and an example. Strengthens the internal linking between the two Excel tools
that already cross-reference each other in `TOOL_CONTENT`.

### Tier 3 — Breadth of the function database

**E26. Expand and centralize the database** — target 220+ functions
Move to `src/lib/data/excel-functions.ts`, shared with `ExcelFunctionReference`
(which already holds ~281 entries the explainer cannot see). Priority gaps in
the explainer's current 82:
- **Dynamic array (365):** `FILTER`, `SORT`, `SORTBY`, `UNIQUE`, `SEQUENCE`, `RANDARRAY`, `LET`, `LAMBDA`, `VSTACK`, `HSTACK`, `TOCOL`, `TOROW`, `WRAPROWS`, `WRAPCOLS`, `CHOOSECOLS`, `CHOOSEROWS`, `TAKE`, `DROP`, `EXPAND`, `GROUPBY`, `PIVOTBY`, `BYROW`, `BYCOL`, `MAP`, `REDUCE`, `SCAN`
- **Text:** `TEXTJOIN`, `CONCAT`, `TEXTSPLIT`, `TEXTBEFORE`, `TEXTAFTER`, `VALUE`, `NUMBERVALUE`, `CLEAN`, `REPT`, `CHAR`, `CODE`, `UNICHAR`, `EXACT`, `DOLLAR`, `FIXED`
- **Math/aggregate:** `SUMPRODUCT` *(a glaring omission — it is in every serious workbook)*, `SUBTOTAL`, `AGGREGATE`, `PRODUCT`, `CEILING`, `FLOOR`, `MROUND`, `TRUNC`, `SIGN`, `RANDBETWEEN`, `LOG`, `LOG10`, `LN`, `EXP`, `PI`, `GCD`, `LCM`, `SUMSQ`
- **Lookup/reference:** `CHOOSE`, `TRANSPOSE`, `ROW`, `COLUMN`, `ROWS`, `COLUMNS`, `ADDRESS`, `AREAS`, `HYPERLINK`, `FORMULATEXT`, `GETPIVOTDATA`
- **Date/time:** `WEEKDAY`, `WEEKNUM`, `ISOWEEKNUM`, `WORKDAY`, `WORKDAY.INTL`, `NETWORKDAYS`, `NETWORKDAYS.INTL`, `DATEVALUE`, `TIMEVALUE`, `YEARFRAC`, `DAYS`, `DAYS360`
- **Statistical:** `MAXIFS`, `MINIFS`, `LARGE`, `SMALL`, `COUNTBLANK`, `STDEV.P`, `STDEV.S`, `VAR.P`, `VAR.S`, `MODE.SNGL`, `MODE.MULT`, `PERCENTILE.INC`, `PERCENTILE.EXC`, `QUARTILE`, `CORREL`, `SLOPE`, `INTERCEPT`, `FORECAST`, `TREND`, `LINEST`, `RANK.EQ`, `RANK.AVG`
- **Financial:** `XIRR`, `XNPV`, `IPMT`, `PPMT`, `CUMIPMT`, `CUMPRINC`, `SLN`, `DB`, `DDB`, `SYD`, `EFFECT`, `NOMINAL`
- **Information/logical:** `ISNA`, `ISERR`, `ISLOGICAL`, `ISREF`, `ISFORMULA`, `ISODD`, `ISEVEN`, `NA`, `ERROR.TYPE`, `XOR`, `INFO`, `SHEET`, `SHEETS`
- Each entry needs the E9 parameter model, the E10 narrative template, the E17
  availability flag, and the min/max arity — so this is a data-shape migration,
  not a copy-paste job.

**E27. Google Sheets–only functions**
`QUERY` (with a note that its argument is SQL-like and not further parsed),
`ARRAYFORMULA`, `IMPORTRANGE`, `IMPORTHTML`, `SPLIT`, `JOIN`, `REGEXMATCH`,
`REGEXEXTRACT`, `REGEXREPLACE`, `GOOGLEFINANCE`, `GOOGLETRANSLATE`, `FLATTEN`,
`SPARKLINE`. The tool's title and description both promise Google Sheets support;
right now not one Sheets-specific function is covered.

**E28. Error-value glossary**
When a formula contains a literal error value or an error-handling function,
explain the error family inline: `#N/A`, `#REF!`, `#VALUE!`, `#DIV/0!`, `#NAME?`,
`#NUM!`, `#NULL!`, `#SPILL!`, `#CALC!`, `#GETTING_DATA` — what causes each and
which handler catches it (`IFERROR` catches all, `IFNA` catches only `#N/A`).

### Tier 4 — Bigger bets (decide before building)

**E29. Evaluate with sample values** — *recommendation: defer, revisit after Tier 1*
Let the user supply values for the referenced cells and compute the result,
showing the value produced at each step. Genuinely the most powerful possible
version of this tool, and it composes perfectly with E11's evaluation order.
Cost is the honest problem: a correct evaluator means implementing Excel
semantics — serial-number dates, type coercion, array broadcasting, error
propagation, `SUMPRODUCT`/array behaviour — for every supported function.
Doing it for a *subset* and hiding the rest is defensible, but any mismatch
against real Excel is worse than not offering it. If built, it must be a clearly
labelled preview covering an explicit function whitelist.

**E30. Natural-language → formula generation** — *recommendation: don't*
"Describe what you want, get a formula" is the reverse of this tool and has
obvious appeal, but there is no deterministic client-side way to do it. It needs
a model API, which means the formula text leaves the browser, which falsifies the
privacy claim in `TOOL_CONTENT` and adds a per-request cost to a free tool. If it
is ever wanted, it belongs in a separate, separately-worded tool — not bolted
onto the explainer.

**Also considered and rejected:** OCR/screenshot input (a dependency and a
network or WASM cost for a problem solved by copy-paste); VBA/Power Query M
parsing (a different language, different tool); live Excel file upload (out of
scope, and it breaks the no-upload promise).

---

## Phase plan

| Phase | Contents | Status |
| --- | --- | --- |
| **P1 — Fix what is broken** | E1–E7 + the file split | ✅ done — defect table all-green |
| **P2 — Deliver the promise** | E8, E9, E10, E11, E12 | ✅ done — copy is now honest |
| **P3 — Differentiate** | E13, E14, E15, E16, E17, E18 | ✅ done |
| **P4 — Polish** | E19–E25 | ✅ done |
| **P5 — Breadth** | E26, E27, E28 | ✅ done — 82 → 231 functions, centralized |
| **Deferred** | E29, E30 | Explicit decisions above; unchanged |

---

## Component state (target, post-enhancement)

```typescript
state: {
  formula: string;
  separator: ',' | ';' | 'auto';
  detail: 'simple' | 'detailed';
  result: {
    ast: AstNode | null;
    narrative: string;              // E10
    steps: EvaluationStep[];        // E11
    tree: ExplainedNode[];          // E8 — nested, each with mapped args (E9)
    references: {                   // E2, E14
      cells: RefInfo[]; ranges: RefInfo[]; names: string[];
      tables: string[]; sheets: string[]; workbooks: string[];
      volatileFunctions: string[]; literalCount: number;
    };
    operators: OperatorNote[];      // E12
    diagnostics: Diagnostic[];      // E5 syntax + E15 lint, with severity + position
    suggestions: Rewrite[];         // E16
    unknownFunctions: string[];     // E6
  } | null;
  history: string[];                // E22, localStorage
}
```

---

## Definition of done — met

1. ✅ Every row of the defect table produces the "v2 output" column.
2. ✅ Parser modules are pure and were verified independently of the browser (the
   `InternetSpeedTest/utils.ts` precedent), with the defect table as fixtures.
3. ✅ `TOOL_CONTENT['excel-formula-explainer']` updated so every claim matches
   shipped behaviour — nesting, narrative, example list, Sheets coverage — and
   the browser-only privacy statement remains true. Nothing added makes a network
   request; the only persistence is `localStorage` for the recent-formula list.
   `TOOL_CONTENT['excel-function-reference']` was corrected at the same time: it
   claimed "an example formula" for every entry, which no version ever had.
4. ✅ `npm run validate:content`, `npm run type-check`, `npm run build`, and
   `next lint` all pass.
5. ✅ This spec's **Status** line records what shipped and what was deliberately
   left out, in the style of `INTERNET_SPEED_TEST.md`.

**Not verified:** the visual layer. There is no browser automation in this repo,
so the highlight overlay's alignment with the textarea, the tree at 320 px, and
the `prefers-reduced-motion` behaviour were reasoned about and built for, but not
observed. They are worth a manual pass.

---

## Library

No external library. Tokenizer and recursive-descent parser are hand-written —
roughly 400 lines total across `tokenizer.ts` and `parser.ts`, no bundle cost,
and full control over error positions and Excel-specific grammar (structured
references, spill operator, `#` error literals) that a generic expression parser
would not model.

---

## UI Layout (target)

```
┌──────────────────────────────────────────────────────────────┐
│  Excel Formula Explainer                                     │
├──────────────────────────────────────────────────────────────┤
│  Paste your formula:        Separator: [auto ▾]  [Simple|Detailed]│
│  ┌────────────────────────────────────────────────────────┐  │
│  │ =IFERROR(VLOOKUP(A1,B:C,2,FALSE),"Not found")          │  │ ← syntax-highlighted,
│  │            ^ rainbow-matched parens                     │  │   live (E13, E19)
│  └────────────────────────────────────────────────────────┘  │
│  Examples: [VLOOKUP] [INDEX/MATCH] [Nested IF] [FILTER] …    │
│  [Format] [Minify] [Share] [Clear]                            │
├──────────────────────────────────────────────────────────────┤
│  In plain English                                       (E10) │
│  Look up A1 in the first column of B:C and return the value  │
│  from column 2, requiring an exact match. If that fails with  │
│  any error, show "Not found" instead.                         │
├──────────────────────────────────────────────────────────────┤
│  Breakdown                                          (E8, E9)  │
│  ▼ IFERROR  · Logical                                         │
│    IFERROR(value, value_if_error)                             │
│    ├ value        ▼ VLOOKUP · Lookup & Reference              │
│    │                ├ lookup_value  A1   — value to find      │
│    │                ├ table_array   B:C  — 2 whole columns    │
│    │                ├ col_index_num 2    — return 2nd column  │
│    │                └ range_lookup  FALSE — exact match        │
│    └ value_if_error "Not found" — shown when the lookup errors │
├──────────────────────────────────────────────────────────────┤
│  Evaluation order (E11)   1 VLOOKUP → 2 IFERROR               │
├──────────────────────────────────────────────────────────────┤
│  Things to check                                       (E15)  │
│  ⚠ IFERROR hides every error, not just "not found" — a typo   │
│    in the range would be silently reported as not found.      │
│  ⚠ B:C is a whole-column range (1,048,576 rows each).         │
├──────────────────────────────────────────────────────────────┤
│  Modernize                                             (E16)  │
│  =XLOOKUP(A1,B:B,C:C,"Not found")            [Copy]           │
├──────────────────────────────────────────────────────────────┤
│  References  A1 (cell) · B:C (whole columns) · no external    │
│  sheets · no volatile functions                        (E14)  │
├──────────────────────────────────────────────────────────────┤
│  [Copy explanation ▾ text | markdown | tree]           (E21)  │
└──────────────────────────────────────────────────────────────┘
```

---

## Parsing logic (target)

The v1 regex approach is documented in the audit above and is being **removed**,
not extended. The replacement shape:

```typescript
// tokenizer.ts — string → tokens, positions preserved
type TokenKind =
  | 'number' | 'string' | 'boolean' | 'error'
  | 'ref' | 'name' | 'func' | 'operator'
  | 'separator' | 'lparen' | 'rparen' | 'lbrace' | 'rbrace';

interface Token { kind: TokenKind; value: string; start: number; end: number; }

function tokenize(input: string, separator: ',' | ';'): Token[];
// - consumes string literals whole, honouring doubled quotes ("" inside a string)
// - recognizes $-anchoring, sheet!ref, 'quoted sheet'!ref, [Book]Sheet!ref,
//   Table[Column], A1#, whole-column B:C and whole-row 3:7
// - accepts function names containing digits, '.' and '_' (LOG10, STDEV.P, _xlfn.XLOOKUP)
// - normalizes case for lookup, preserves the original for display

// parser.ts — tokens → AST, with recovery so partial input still explains
type AstNode =
  | { type: 'call'; name: string; args: AstNode[]; start: number; end: number }
  | { type: 'binary'; op: string; left: AstNode; right: AstNode; /* … */ }
  | { type: 'unary'; op: string; operand: AstNode; /* … */ }
  | { type: 'array'; rows: AstNode[][]; /* … */ }
  | { type: 'ref'; ref: ReferenceInfo; /* … */ }
  | { type: 'literal'; value: string; kind: 'number'|'string'|'boolean'|'error'; /* … */ };

function parse(tokens: Token[]): { ast: AstNode | null; diagnostics: Diagnostic[] };
// precedence, low → high: comparison < & < +- < */ < ^ < % < unary- < space/, < :
// every diagnostic carries {start, end, severity, message} for the caret display
```

---

## How to Use Content (for SEO section)

1. Paste your Excel or Google Sheets formula — the breakdown appears as you type
2. Read the plain-English summary at the top to get the formula's overall intent
3. Expand the breakdown tree to see each nested function and what every argument does
4. Follow the evaluation order to see which part of the formula runs first
5. Check the diagnostics for likely mistakes, hidden errors, and performance risks
6. Review the reference list to see which cells, ranges, and sheets the formula depends on
7. Use Format to break a long formula across indented lines, or copy the explanation as text or Markdown

---

## About Content (for SEO section)

*(Shipped copy lives in `TOOL_CONTENT['excel-formula-explainer']`. The rule that
produced the debt above still applies: no claim goes in ahead of the code.)*

Our Excel Formula Explainer breaks complex spreadsheet formulas down into plain
English. Paste any Excel or Google Sheets formula and the tool parses it into its
real structure — every nested function, every argument, every operator — then
explains what each part does and the order it runs in. It flags common mistakes
such as approximate-match lookups, error handlers that hide more than they
should, and volatile functions that slow a workbook down, and it suggests modern
replacements where one exists. All parsing happens in your browser; no formula
text is sent anywhere.
