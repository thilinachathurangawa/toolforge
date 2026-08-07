import type { Anchoring, Diagnostic, ReferenceInfo, Token } from './types';

/**
 * Formula tokenizer.
 *
 * Replaces the v1 approach of running two regexes over the whole string, which
 * could not see nested calls, split arguments inside string literals, or
 * recognise anything more elaborate than `A1` and `A1:B2`.
 */

const MAX_ROW = 1_048_576;
const MAX_COL = 16_384; // XFD

/** Longest first, so `#N/A` never shadows a longer literal. */
const ERROR_LITERALS = [
  '#GETTING_DATA',
  '#EXTERNAL!',
  '#BLOCKED!',
  '#CONNECT!',
  '#UNKNOWN!',
  '#SPILL!',
  '#VALUE!',
  '#FIELD!',
  '#BUSY!',
  '#DIV/0!',
  '#NAME?',
  '#NULL!',
  '#CALC!',
  '#NUM!',
  '#REF!',
  '#N/A',
];

const SMART_QUOTES: Record<string, string> = {
  '“': '"',
  '”': '"',
  '‘': "'",
  '’': "'",
};

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function isLetter(ch: string): boolean {
  return /[A-Za-zÀ-ɏͰ-￿]/.test(ch);
}

/** Characters that may appear inside a name, sheet name, or reference body. */
function isNameChar(ch: string): boolean {
  return isLetter(ch) || isDigit(ch) || ch === '_' || ch === '.' || ch === '\\';
}

export function columnToNumber(letters: string): number {
  let n = 0;
  for (const ch of letters.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

const CELL_RE = /^(\$?)([A-Za-z]{1,3})(\$?)([0-9]{1,7})$/;
const COL_RE = /^(\$?)([A-Za-z]{1,3})$/;
const ROW_RE = /^(\$?)([0-9]{1,7})$/;

function isValidCell(part: string): boolean {
  const m = CELL_RE.exec(part);
  if (!m) return false;
  const col = columnToNumber(m[2]);
  const row = parseInt(m[4], 10);
  return col >= 1 && col <= MAX_COL && row >= 1 && row <= MAX_ROW;
}

function anchoringOf(parts: string[]): Anchoring {
  const dollars = parts.join('').split('$').length - 1;
  // Each cell part can carry up to two anchors; a column/row part just one.
  const slots = parts.reduce((n, p) => n + (CELL_RE.test(p) ? 2 : 1), 0);
  if (dollars === 0) return 'relative';
  if (dollars === slots) return 'absolute';
  return 'mixed';
}

function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Turns a reference body such as `$A$1:$A$10` into a classified description.
 * `body` has already had any sheet or workbook qualifier stripped off.
 */
export function classifyReference(
  raw: string,
  body: string,
  sheet: string | undefined,
  workbook: string | undefined,
  isTable: boolean
): ReferenceInfo {
  const base = { raw, body, sheet, workbook };

  if (isTable) {
    return {
      ...base,
      kind: 'table',
      anchoring: 'none',
      description: 'structured table reference',
    };
  }

  const parts = body.split(':');

  if (parts.length === 1 && isValidCell(parts[0])) {
    return {
      ...base,
      kind: 'cell',
      anchoring: anchoringOf(parts),
      cellCount: 1,
      description: 'single cell',
    };
  }

  if (parts.length === 2 && parts.every(isValidCell)) {
    const [a, b] = parts.map((p) => CELL_RE.exec(p)!);
    const cols = Math.abs(columnToNumber(a[2]) - columnToNumber(b[2])) + 1;
    const rows = Math.abs(parseInt(a[4], 10) - parseInt(b[4], 10)) + 1;
    const cellCount = cols * rows;
    return {
      ...base,
      kind: 'range',
      anchoring: anchoringOf(parts),
      cellCount,
      description: `range of ${formatCount(cellCount)} cell${cellCount === 1 ? '' : 's'} (${formatCount(rows)} × ${formatCount(cols)})`,
    };
  }

  if (parts.length === 2 && parts.every((p) => COL_RE.test(p))) {
    const nums = parts.map((p) => columnToNumber(COL_RE.exec(p)![2]));
    if (nums.every((n) => n >= 1 && n <= MAX_COL)) {
      const cols = Math.abs(nums[0] - nums[1]) + 1;
      return {
        ...base,
        kind: 'whole-column',
        anchoring: anchoringOf(parts),
        cellCount: cols * MAX_ROW,
        description: `${cols} whole column${cols === 1 ? '' : 's'} (${formatCount(cols * MAX_ROW)} cells)`,
      };
    }
  }

  if (parts.length === 2 && parts.every((p) => ROW_RE.test(p))) {
    const nums = parts.map((p) => parseInt(ROW_RE.exec(p)![2], 10));
    if (nums.every((n) => n >= 1 && n <= MAX_ROW)) {
      const rows = Math.abs(nums[0] - nums[1]) + 1;
      return {
        ...base,
        kind: 'whole-row',
        anchoring: anchoringOf(parts),
        cellCount: rows * MAX_COL,
        description: `${rows} whole row${rows === 1 ? '' : 's'} (${formatCount(rows * MAX_COL)} cells)`,
      };
    }
  }

  return {
    ...base,
    kind: 'name',
    anchoring: 'none',
    description: sheet ? 'named range on another sheet' : 'defined name',
  };
}

interface TokenizeResult {
  tokens: Token[];
  diagnostics: Diagnostic[];
  /** The argument separator the formula appears to use. */
  separator: ',' | ';';
}

export function tokenize(source: string): TokenizeResult {
  const input = source;
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let i = 0;
  let spaceBefore = false;
  let braceDepth = 0;
  let sawSemicolonSeparator = false;
  let sawCommaSeparator = false;

  const push = (kind: Token['kind'], start: number, end: number, ref?: ReferenceInfo) => {
    tokens.push({ kind, value: input.slice(start, end), start, end, spaceBefore, ref });
    spaceBefore = false;
  };

  /** Scans a run of name characters, allowing `$` anywhere for references. */
  const scanRun = (from: number): number => {
    let j = from;
    while (j < input.length && (isNameChar(input[j]) || input[j] === '$')) j++;
    return j;
  };

  /** Scans a balanced `[...]` group used by structured table references. */
  const scanBrackets = (from: number): number => {
    let j = from;
    let depth = 0;
    while (j < input.length) {
      if (input[j] === '[') depth++;
      else if (input[j] === ']') {
        depth--;
        if (depth === 0) return j + 1;
      }
      j++;
    }
    return -1;
  };

  while (i < input.length) {
    const ch = input[i];

    // ---------------------------------------------------------- whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      spaceBefore = true;
      i++;
      continue;
    }

    // ------------------------------------------------------- leading equals
    if (ch === '=' && tokens.length === 0) {
      push('equals', i, i + 1);
      i++;
      continue;
    }

    // ------------------------------------------------------- smart quotes
    if (SMART_QUOTES[ch]) {
      const replacement = SMART_QUOTES[ch];
      diagnostics.push({
        severity: 'warning',
        code: 'smart-quote',
        message: `Curly quote ${ch} found. Excel only accepts straight quotes (${replacement}); pasting from a document or web page is the usual cause.`,
        start: i,
        end: i + 1,
      });
      if (replacement === '"') {
        // Consume as a string so the rest of the formula still parses.
        const start = i;
        let j = i + 1;
        while (j < input.length && !SMART_QUOTES[input[j]] && input[j] !== '"') j++;
        const end = j < input.length ? j + 1 : input.length;
        push('string', start, end);
        i = end;
        continue;
      }
      i++;
      continue;
    }

    // ------------------------------------------------------------- strings
    if (ch === '"') {
      const start = i;
      let j = i + 1;
      let closed = false;
      while (j < input.length) {
        if (input[j] === '"') {
          if (input[j + 1] === '"') {
            j += 2; // escaped quote inside the string
            continue;
          }
          j++;
          closed = true;
          break;
        }
        j++;
      }
      if (!closed) {
        diagnostics.push({
          severity: 'error',
          code: 'unterminated-string',
          message: 'This text value is missing its closing double quote.',
          start,
          end: input.length,
        });
      }
      push('string', start, j);
      i = j;
      continue;
    }

    // ------------------------------------------------------ error literals
    if (ch === '#') {
      const rest = input.slice(i).toUpperCase();
      const hit = ERROR_LITERALS.find((lit) => rest.startsWith(lit));
      if (hit) {
        push('errorLiteral', i, i + hit.length);
        i += hit.length;
        continue;
      }
      // A bare `#` after a reference is the spilled-range operator.
      push('operator', i, i + 1);
      i++;
      continue;
    }

    // ------------------------------------------------------------- numbers
    if (isDigit(ch) || (ch === '.' && isDigit(input[i + 1] ?? ''))) {
      const start = i;
      let j = i;
      while (j < input.length && isDigit(input[j])) j++;
      if (input[j] === '.') {
        j++;
        while (j < input.length && isDigit(input[j])) j++;
      }
      if ((input[j] === 'e' || input[j] === 'E') && /[0-9+-]/.test(input[j + 1] ?? '')) {
        j++;
        if (input[j] === '+' || input[j] === '-') j++;
        while (j < input.length && isDigit(input[j])) j++;
      }

      // `3:7` is a whole-row range, not two numbers.
      if (input[j] === ':' && isDigit(input[j + 1] ?? '') && !input.slice(start, j).includes('.')) {
        let k = j + 1;
        while (k < input.length && isDigit(input[k])) k++;
        const body = input.slice(start, k);
        push('ref', start, k, classifyReference(body, body, undefined, undefined, false));
        i = k;
        continue;
      }

      push('number', start, j);
      i = j;
      continue;
    }

    // ------------------------------- quoted sheet name, or workbook prefix
    if (ch === "'" || ch === '[' || isLetter(ch) || ch === '_' || ch === '$' || ch === '\\') {
      const start = i;
      let j = i;
      let workbook: string | undefined;
      let sheet: string | undefined;

      // [Book1.xlsx] workbook qualifier
      if (input[j] === '[') {
        const close = scanBrackets(j);
        if (close > 0) {
          workbook = input.slice(j + 1, close - 1);
          j = close;
        }
      }

      // 'Quoted sheet name'! — may itself start with the workbook part
      if (input[j] === "'") {
        let k = j + 1;
        let closed = false;
        while (k < input.length) {
          if (input[k] === "'") {
            if (input[k + 1] === "'") {
              k += 2;
              continue;
            }
            closed = true;
            break;
          }
          k++;
        }
        if (closed && input[k + 1] === '!') {
          const quoted = input.slice(j + 1, k).replace(/''/g, "'");
          const bracket = /^\[([^\]]+)\](.*)$/.exec(quoted);
          if (bracket) {
            workbook = bracket[1];
            sheet = bracket[2];
          } else {
            sheet = quoted;
          }
          j = k + 2;
        } else {
          diagnostics.push({
            severity: 'error',
            code: 'unterminated-sheet-name',
            message: 'This quoted sheet name is missing its closing apostrophe.',
            start: j,
            end: input.length,
          });
          push('operator', j, j + 1);
          i = j + 1;
          continue;
        }
      } else {
        // Unquoted sheet name, possibly a 3-D range like Sheet1:Sheet4!A1
        const runEnd = scanRun(j);
        if (runEnd > j) {
          if (input[runEnd] === '!') {
            sheet = input.slice(j, runEnd);
            j = runEnd + 1;
          } else if (input[runEnd] === ':') {
            const secondEnd = scanRun(runEnd + 1);
            if (secondEnd > runEnd + 1 && input[secondEnd] === '!') {
              sheet = input.slice(j, secondEnd);
              j = secondEnd + 1;
            }
          }
        }
      }

      // ------------------------------------------------------- the ref body
      const bodyStart = j;
      let bodyEnd = scanRun(j);

      // Structured table reference: Table1[Amount] / Table1[[#Headers],[Qty]]
      let isTable = false;
      if (input[bodyEnd] === '[') {
        const close = scanBrackets(bodyEnd);
        if (close > 0) {
          bodyEnd = close;
          isTable = true;
        }
      }

      if (bodyEnd === bodyStart) {
        // Nothing usable — emit the character as an operator and move on.
        push('operator', start, start + 1);
        i = start + 1;
        continue;
      }

      const firstRun = input.slice(bodyStart, bodyEnd);

      // Function call — the name is followed immediately by an opening paren.
      if (!isTable && input[bodyEnd] === '(' && !sheet && !workbook) {
        push('func', start, bodyEnd);
        i = bodyEnd;
        continue;
      }

      // Boolean literals
      if (!isTable && !sheet && !workbook && /^(TRUE|FALSE)$/i.test(firstRun)) {
        push('boolean', start, bodyEnd);
        i = bodyEnd;
        continue;
      }

      // Range operator: extend across `:` when the right side is also a ref.
      let end = bodyEnd;
      if (!isTable && input[end] === ':') {
        const secondEnd = scanRun(end + 1);
        if (secondEnd > end + 1 && input[secondEnd] !== '(') {
          end = secondEnd;
        }
      }

      const body = input.slice(bodyStart, end);
      let ref = classifyReference(input.slice(start, end), body, sheet, workbook, isTable);

      // Spilled-range operator: A1#
      if (input[end] === '#' && !ERROR_LITERALS.some((l) => input.slice(end).toUpperCase().startsWith(l))) {
        end += 1;
        ref = {
          ...ref,
          raw: input.slice(start, end),
          kind: 'spill',
          description: 'the whole spilled range produced by that formula',
        };
      }

      push('ref', start, end, ref);
      i = end;
      continue;
    }

    // -------------------------------------------------------------- braces
    if (ch === '{') {
      braceDepth++;
      push('lbrace', i, i + 1);
      i++;
      continue;
    }
    if (ch === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      push('rbrace', i, i + 1);
      i++;
      continue;
    }

    // -------------------------------------------------------------- parens
    if (ch === '(') {
      push('lparen', i, i + 1);
      i++;
      continue;
    }
    if (ch === ')') {
      push('rparen', i, i + 1);
      i++;
      continue;
    }

    // ---------------------------------------------------------- separators
    if (ch === ',' || ch === ';') {
      if (braceDepth > 0 && ch === ';') {
        push('arrayRowSep', i, i + 1);
      } else {
        if (braceDepth === 0) {
          if (ch === ';') sawSemicolonSeparator = true;
          else sawCommaSeparator = true;
        }
        push('separator', i, i + 1);
      }
      i++;
      continue;
    }

    // ----------------------------------------------------------- operators
    const two = input.slice(i, i + 2);
    if (two === '<>' || two === '<=' || two === '>=') {
      push('operator', i, i + 2);
      i += 2;
      continue;
    }
    if ('+-*/^&%<>=@:'.includes(ch)) {
      push('operator', i, i + 1);
      i++;
      continue;
    }

    diagnostics.push({
      severity: 'error',
      code: 'unexpected-character',
      message: `"${ch}" is not valid in an Excel formula.`,
      start: i,
      end: i + 1,
    });
    i++;
  }

  const separator: ',' | ';' = sawSemicolonSeparator && !sawCommaSeparator ? ';' : ',';

  return { tokens, diagnostics, separator };
}
