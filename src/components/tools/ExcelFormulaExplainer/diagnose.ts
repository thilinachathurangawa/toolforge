import type { AstNode, CallNode, Diagnostic, ReferenceInfo, Rewrite } from './types';
import { columnToNumber } from './tokenizer';
import { nodeText } from './explain';

/**
 * Rules that look at a parsed formula and report likely mistakes, hidden risks,
 * and modern replacements. Everything here is derived from the AST — no rule
 * fires on a formula the parser could not read.
 */

const MAX_ROW = 1_048_576;

function numberToColumn(n: number): string {
  let out = '';
  let value = n;
  while (value > 0) {
    const rem = (value - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    value = Math.floor((value - 1) / 26);
  }
  return out;
}

function unwrap(node: AstNode): AstNode {
  return node.type === 'paren' ? unwrap(node.expression) : node;
}

function asCall(node: AstNode | undefined): CallNode | null {
  if (!node) return null;
  const n = unwrap(node);
  return n.type === 'call' ? n : null;
}

function numericLiteral(node: AstNode | undefined): number | null {
  if (!node) return null;
  const n = unwrap(node);
  if (n.type === 'literal' && n.kind === 'number') {
    const value = Number(n.value);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

function refOf(node: AstNode | undefined): ReferenceInfo | null {
  if (!node) return null;
  const n = unwrap(node);
  return n.type === 'ref' ? n.ref : null;
}

/** Walks every node, tracking nesting depth of function calls. */
function walkAll(node: AstNode, visit: (n: AstNode, depth: number) => void, depth = 0): void {
  visit(node, depth);
  const nextDepth = node.type === 'call' ? depth + 1 : depth;
  switch (node.type) {
    case 'call':
      node.args.forEach((a) => walkAll(a, visit, nextDepth));
      break;
    case 'binary':
      walkAll(node.left, visit, nextDepth);
      walkAll(node.right, visit, nextDepth);
      break;
    case 'unary':
    case 'postfix':
      walkAll(node.operand, visit, nextDepth);
      break;
    case 'paren':
      walkAll(node.expression, visit, nextDepth);
      break;
    case 'union':
      node.items.forEach((a) => walkAll(a, visit, nextDepth));
      break;
    case 'array':
      node.rows.flat().forEach((a) => walkAll(a, visit, nextDepth));
      break;
    default:
      break;
  }
}

/* --------------------------------------------------------- range geometry */

interface RangeGeometry {
  startCol: number;
  endCol: number;
  startRow?: number;
  endRow?: number;
  colAnchor: string;
  rowAnchor: string;
  prefix: string;
  width: number;
}

const CELL_PART = /^(\$?)([A-Za-z]{1,3})(\$?)([0-9]{1,7})$/;
const COL_PART = /^(\$?)([A-Za-z]{1,3})$/;

/** Extracts column/row bounds from a range so lookup rewrites can be built. */
function geometryOf(ref: ReferenceInfo | null): RangeGeometry | null {
  if (!ref) return null;
  const prefix = ref.raw.slice(0, ref.raw.length - ref.body.length);
  const parts = ref.body.split(':');
  if (parts.length !== 2) return null;

  const cells = parts.map((p) => CELL_PART.exec(p));
  if (cells[0] && cells[1]) {
    const startCol = columnToNumber(cells[0][2]);
    const endCol = columnToNumber(cells[1][2]);
    return {
      startCol: Math.min(startCol, endCol),
      endCol: Math.max(startCol, endCol),
      startRow: parseInt(cells[0][4], 10),
      endRow: parseInt(cells[1][4], 10),
      colAnchor: cells[0][1],
      rowAnchor: cells[0][3],
      prefix,
      width: Math.abs(endCol - startCol) + 1,
    };
  }

  const cols = parts.map((p) => COL_PART.exec(p));
  if (cols[0] && cols[1]) {
    const startCol = columnToNumber(cols[0][2]);
    const endCol = columnToNumber(cols[1][2]);
    return {
      startCol: Math.min(startCol, endCol),
      endCol: Math.max(startCol, endCol),
      colAnchor: cols[0][1],
      rowAnchor: '',
      prefix,
      width: Math.abs(endCol - startCol) + 1,
    };
  }

  return null;
}

/** Builds a single-column reference at `offset` columns into the geometry. */
function columnSlice(geo: RangeGeometry, offset: number): string {
  const letter = numberToColumn(geo.startCol + offset);
  if (geo.startRow === undefined || geo.endRow === undefined) {
    return `${geo.prefix}${geo.colAnchor}${letter}:${geo.colAnchor}${letter}`;
  }
  return `${geo.prefix}${geo.colAnchor}${letter}${geo.rowAnchor}${geo.startRow}:${geo.colAnchor}${letter}${geo.rowAnchor}${geo.endRow}`;
}

/* ------------------------------------------------------------ lint rules */

export function diagnose(source: string, ast: AstNode | null): Diagnostic[] {
  const out: Diagnostic[] = [];
  if (!ast) return out;

  const push = (
    severity: Diagnostic['severity'],
    code: string,
    message: string,
    node: { start: number; end: number }
  ) => {
    if (out.some((d) => d.code === code && d.start === node.start)) return;
    out.push({ severity, code, message, start: node.start, end: node.end });
  };

  const textCounts = new Map<string, number>();

  walkAll(ast, (node, depth) => {
    if (node.type === 'call' || node.type === 'binary') {
      const text = nodeText(source, node);
      if (text.length >= 10) textCounts.set(text, (textCounts.get(text) ?? 0) + 1);
    }

    if (node.type === 'binary' && node.op === '/') {
      const denominator = refOf(node.right);
      if (denominator && denominator.kind === 'cell') {
        push(
          'info',
          'unguarded-division',
          `Dividing by ${denominator.raw} produces #DIV/0! whenever that cell is blank or zero. Wrapping the division in IFERROR, or testing the denominator first, avoids the error appearing in the sheet.`,
          node
        );
      }
    }

    if (node.type === 'binary' && ['=', '<>', '<', '>', '<=', '>='].includes(node.op)) {
      const sides = [unwrap(node.left), unwrap(node.right)];
      const numericText = sides.find(
        (s) => s.type === 'literal' && s.kind === 'string' && s.value.trim() !== '' && !Number.isNaN(Number(s.value))
      );
      const hasRef = sides.some((s) => s.type === 'ref');
      if (numericText && hasRef) {
        push(
          'warning',
          'text-number-comparison',
          `A number written in quotes is text, not a number. Excel never treats "${(numericText as { value: string }).value}" as equal to the number ${(numericText as { value: string }).value}, so this comparison may never be true.`,
          node
        );
      }
    }

    if (node.type !== 'call') return;

    const call = node;
    const def = call.def;

    if (depth >= 7) {
      push(
        'info',
        'deep-nesting',
        `This formula nests functions ${depth + 1} levels deep. Splitting it across helper columns, or naming the repeated parts with LET, usually makes it far easier to maintain.`,
        call
      );
    }

    if (!def) return;

    // ---- argument count -------------------------------------------------
    const supplied = call.args.length;
    if (supplied < def.minArgs) {
      push(
        'error',
        'too-few-arguments',
        `${def.name} needs at least ${def.minArgs} argument${def.minArgs === 1 ? '' : 's'} but only ${supplied} ${supplied === 1 ? 'was' : 'were'} given. Expected syntax: ${def.syntax}`,
        call
      );
    } else if (supplied > def.maxArgs) {
      push(
        'error',
        'too-many-arguments',
        `${def.name} accepts at most ${def.maxArgs} argument${def.maxArgs === 1 ? '' : 's'} but ${supplied} were given. Expected syntax: ${def.syntax}`,
        call
      );
    }

    // ---- volatility -----------------------------------------------------
    if (def.volatile) {
      push(
        'info',
        'volatile-function',
        `${def.name} is volatile: it recalculates every time anything in the workbook changes, not only when its own inputs change. A few are harmless; many in a large sheet make it feel slow.`,
        call
      );
    }

    if (def.name === 'INDIRECT' || def.name === 'OFFSET') {
      push(
        'warning',
        'opaque-reference',
        `${def.name} builds its reference while the formula runs, so Excel's Trace Precedents cannot follow it and inserting or deleting rows will not update it. A structured table reference or INDEX is usually safer.`,
        call
      );
    }

    // ---- lookup rules ---------------------------------------------------
    if (def.name === 'VLOOKUP' || def.name === 'HLOOKUP') {
      const tableRef = refOf(call.args[1]);
      const geo = geometryOf(tableRef);
      const index = numericLiteral(call.args[2]);

      if (geo && index !== null && def.name === 'VLOOKUP' && index > geo.width) {
        push(
          'error',
          'col-index-out-of-range',
          `Column ${index} is outside ${tableRef!.raw}, which is only ${geo.width} column${geo.width === 1 ? '' : 's'} wide. This VLOOKUP always returns #REF!.`,
          call
        );
      }
      if (index !== null && index < 1) {
        push('error', 'col-index-invalid', `The column number must be 1 or greater; ${index} always returns #VALUE!.`, call);
      }

      if (call.args.length < 4) {
        push(
          'warning',
          'approximate-match-default',
          `${def.name} defaults to an approximate match when the last argument is omitted. That only works on data sorted ascending, and on unsorted data it silently returns the wrong row. Add FALSE (or 0) for an exact match.`,
          call
        );
      } else {
        const last = unwrap(call.args[3]);
        if (last.type === 'literal' && last.kind === 'boolean' && last.value === 'TRUE') {
          push(
            'warning',
            'approximate-match-explicit',
            `TRUE requests an approximate match, which requires the first column of ${tableRef?.raw ?? 'the table'} to be sorted ascending. Use FALSE unless that is genuinely intended.`,
            call
          );
        }
      }

      if (tableRef && tableRef.anchoring === 'relative' && tableRef.kind === 'range') {
        push(
          'warning',
          'unanchored-lookup-table',
          `The lookup table ${tableRef.raw} has no $ anchors, so filling this formula down shifts the table with it and later rows search the wrong cells. Anchor it as an absolute reference.`,
          call
        );
      }
    }

    if (def.name === 'MATCH' && call.args.length < 3) {
      push(
        'warning',
        'match-type-default',
        'MATCH defaults to match type 1, an approximate match that assumes the data is sorted ascending. Add 0 as the third argument for an exact match.',
        call
      );
    }

    // ---- error handling -------------------------------------------------
    if (def.name === 'IFERROR') {
      push(
        'warning',
        'iferror-masks-everything',
        'IFERROR catches every error, not just "not found". A typo in a range name (#NAME?), a deleted column (#REF!), or text where a number belongs (#VALUE!) will all be reported as the fallback value, hiding a real problem. IFNA catches only #N/A.',
        call
      );
    }

    // ---- performance ----------------------------------------------------
    call.args.forEach((arg) => {
      const ref = refOf(arg);
      if (ref && (ref.kind === 'whole-column' || ref.kind === 'whole-row')) {
        push(
          'info',
          'whole-column-range',
          `${ref.raw} covers ${ref.description}. Excel handles that efficiently in SUM-style functions, but inside SUMPRODUCT or an array formula it forces work across every one of those cells.`,
          arg
        );
      }
    });
  });

  textCounts.forEach((count, text) => {
    if (count < 2) return;
    const start = source.indexOf(text);
    push(
      'info',
      'repeated-subexpression',
      `"${text}" is calculated ${count} times in this formula. LET lets you name it once and reuse the name, which is both faster and easier to read.`,
      { start: start < 0 ? 0 : start, end: start < 0 ? 0 : start + text.length }
    );
  });

  return out;
}

/* ------------------------------------------------------- modernization */

export function suggestRewrites(source: string, ast: AstNode | null): Rewrite[] {
  const out: Rewrite[] = [];
  if (!ast) return out;

  const seen = new Set<string>();
  const add = (rewrite: Rewrite) => {
    const key = `${rewrite.title}|${rewrite.formula ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(rewrite);
  };

  walkAll(ast, (node) => {
    if (node.type !== 'call' || !node.def) return;
    const call = node;
    const def = call.def!;

    // VLOOKUP → XLOOKUP, with the real rewritten formula where it is derivable.
    if (def.name === 'VLOOKUP') {
      const lookupValue = call.args[0] ? nodeText(source, call.args[0]) : null;
      const tableRef = refOf(call.args[1]);
      const geo = geometryOf(tableRef);
      const index = numericLiteral(call.args[2]);
      if (lookupValue && geo && index !== null && index >= 1 && index <= geo.width) {
        const lookupCol = columnSlice(geo, 0);
        const returnCol = columnSlice(geo, index - 1);
        add({
          title: 'Replace VLOOKUP with XLOOKUP',
          formula: `=XLOOKUP(${lookupValue},${lookupCol},${returnCol})`,
          note: 'XLOOKUP defaults to an exact match, can return a column to the left of the lookup column, and survives inserted columns because the return column is named directly instead of counted. Available in Excel 2021, Microsoft 365, and Google Sheets.',
        });
      } else {
        add({
          title: 'Consider XLOOKUP instead of VLOOKUP',
          note: 'XLOOKUP names the lookup and return ranges separately, so it defaults to an exact match and does not break when a column is inserted inside the table. Available in Excel 2021, Microsoft 365, and Google Sheets.',
        });
      }
    }

    // INDEX(range, MATCH(...)) → XLOOKUP
    if (def.name === 'INDEX') {
      const inner = asCall(call.args[1]);
      if (inner?.name === 'MATCH' && call.args.length <= 2 && inner.args.length >= 2) {
        const returnRange = nodeText(source, call.args[0]);
        const lookupValue = nodeText(source, inner.args[0]);
        const lookupRange = nodeText(source, inner.args[1]);
        add({
          title: 'Replace INDEX/MATCH with XLOOKUP',
          formula: `=XLOOKUP(${lookupValue},${lookupRange},${returnRange})`,
          note: 'XLOOKUP does the same job in one function instead of two nested ones, and it takes a not-found value directly rather than needing an IFERROR wrapper.',
        });
      }
    }

    // Nested IF chain → IFS
    if (def.name === 'IF') {
      const branches: string[] = [];
      let cursor: CallNode | null = call;
      let depth = 0;
      let fallback: string | null = null;
      while (cursor && cursor.name === 'IF' && cursor.args.length >= 2) {
        branches.push(nodeText(source, cursor.args[0]), nodeText(source, cursor.args[1]));
        depth += 1;
        const elseBranch = cursor.args[2];
        const nested = asCall(elseBranch);
        if (nested && nested.name === 'IF') {
          cursor = nested;
        } else {
          fallback = elseBranch ? nodeText(source, elseBranch) : null;
          cursor = null;
        }
      }
      if (depth >= 3) {
        const tail = fallback ? `,TRUE,${fallback}` : '';
        add({
          title: `Replace ${depth} nested IFs with IFS`,
          formula: `=IFS(${branches.join(',')}${tail})`,
          note: 'IFS tests conditions in order and returns the value paired with the first true one, so the conditions stay in a flat list instead of burying each one inside the previous IF. Available in Excel 2019 and later, and in Google Sheets.',
        });
      }
    }

    // CONCATENATE → & or TEXTJOIN
    if (def.name === 'CONCATENATE' && call.args.length > 0) {
      const parts = call.args.map((a) => nodeText(source, a));
      add({
        title: 'Replace CONCATENATE with the & operator',
        formula: `=${parts.join('&')}`,
        note: 'CONCATENATE is kept only for backwards compatibility. The & operator does the same thing more briefly, and TEXTJOIN adds a delimiter and can skip empty cells.',
      });
    }

    // SUMPRODUCT used purely as a multi-condition count or sum
    if (def.name === 'SUMPRODUCT' && call.args.length === 1) {
      const inner = unwrap(call.args[0]);
      if (inner.type === 'binary' && inner.op === '*') {
        add({
          title: 'Consider SUMIFS or COUNTIFS instead of SUMPRODUCT',
          note: 'Multiplying comparison results inside SUMPRODUCT was the standard way to apply several conditions before SUMIFS and COUNTIFS existed. Those functions are clearer and do not evaluate every cell in the range.',
        });
      }
    }

    // Renamed statistical functions and other legacy entries
    if (def.legacy) {
      add({
        title: `${def.name} has been superseded by ${def.legacy.replacement}`,
        note: def.legacy.note,
      });
    }
  });

  return out;
}
