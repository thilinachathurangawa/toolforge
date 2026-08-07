import { lookupFunction } from '@/lib/data/excel-functions';
import type { AstNode, CallNode, Diagnostic, Token } from './types';
import { tokenize } from './tokenizer';

/**
 * Recursive-descent parser producing an AST with source positions on every
 * node. It recovers from errors rather than bailing out, so a half-typed
 * formula still produces something the UI can explain.
 *
 * Precedence, lowest to highest:
 *   comparison  <  &  <  + -  <  * /  <  ^  <  unary -  <  % #  <  : (range)
 * Unary minus binds tighter than `^`, matching Excel, where -2^2 is 4.
 */

const COMPARISON_OPS = new Set(['=', '<>', '<', '>', '<=', '>=']);

export interface ParseResult {
  ast: AstNode | null;
  diagnostics: Diagnostic[];
  tokens: Token[];
  separator: ',' | ';';
}

export function parseFormula(source: string): ParseResult {
  const { tokens, diagnostics: lexDiagnostics, separator } = tokenize(source);
  const diagnostics: Diagnostic[] = [...lexDiagnostics];

  let pos = 0;

  const peek = (offset = 0): Token | undefined => tokens[pos + offset];
  const at = (kind: Token['kind'], value?: string): boolean => {
    const t = tokens[pos];
    if (!t || t.kind !== kind) return false;
    return value === undefined || t.value === value;
  };
  const next = (): Token | undefined => tokens[pos++];
  const endOf = (node: AstNode | undefined, fallback: number) => node?.end ?? fallback;
  const sourceEnd = source.length;

  const report = (
    severity: Diagnostic['severity'],
    code: string,
    message: string,
    start: number,
    end: number
  ) => {
    // One message per position keeps a cascade of recovery errors readable.
    if (diagnostics.some((d) => d.code === code && d.start === start)) return;
    diagnostics.push({ severity, code, message, start, end });
  };

  const missing = (start: number): AstNode => ({ type: 'missing', start, end: start });

  /** True when the token could begin an operand (used for intersection). */
  const startsOperand = (t: Token | undefined): boolean =>
    !!t &&
    (t.kind === 'ref' ||
      t.kind === 'func' ||
      t.kind === 'number' ||
      t.kind === 'string' ||
      t.kind === 'boolean' ||
      t.kind === 'errorLiteral' ||
      t.kind === 'lparen' ||
      t.kind === 'lbrace');

  /* --------------------------------------------------------------- levels */

  function parseExpression(): AstNode {
    return parseComparison();
  }

  function parseComparison(): AstNode {
    let left = parseConcat();
    while (at('operator') && COMPARISON_OPS.has(tokens[pos].value)) {
      const op = next()!;
      const right = parseConcat();
      left = { type: 'binary', op: op.value, left, right, start: left.start, end: endOf(right, op.end) };
    }
    return left;
  }

  function parseConcat(): AstNode {
    let left = parseAdditive();
    while (at('operator', '&')) {
      const op = next()!;
      const right = parseAdditive();
      left = { type: 'binary', op: '&', left, right, start: left.start, end: endOf(right, op.end) };
    }
    return left;
  }

  function parseAdditive(): AstNode {
    let left = parseMultiplicative();
    while (at('operator', '+') || at('operator', '-')) {
      const op = next()!;
      const right = parseMultiplicative();
      left = { type: 'binary', op: op.value, left, right, start: left.start, end: endOf(right, op.end) };
    }
    return left;
  }

  function parseMultiplicative(): AstNode {
    let left = parseExponent();
    while (at('operator', '*') || at('operator', '/')) {
      const op = next()!;
      const right = parseExponent();
      left = { type: 'binary', op: op.value, left, right, start: left.start, end: endOf(right, op.end) };
    }
    return left;
  }

  function parseExponent(): AstNode {
    const left = parseUnary();
    if (at('operator', '^')) {
      const op = next()!;
      const right = parseExponent(); // right-associative
      return { type: 'binary', op: '^', left, right, start: left.start, end: endOf(right, op.end) };
    }
    return left;
  }

  function parseUnary(): AstNode {
    if (at('operator', '-') || at('operator', '+') || at('operator', '@')) {
      const op = next()!;
      const operand = parseUnary();
      return { type: 'unary', op: op.value, operand, start: op.start, end: endOf(operand, op.end) };
    }
    return parseRange();
  }

  function parseRange(): AstNode {
    let left = parsePostfix();
    for (;;) {
      if (at('operator', ':')) {
        const op = next()!;
        const right = parsePostfix();
        left = { type: 'binary', op: ':', left, right, start: left.start, end: endOf(right, op.end) };
        continue;
      }
      // Excel's intersection operator is a space between two references.
      const t = peek();
      if (t && t.spaceBefore && startsOperand(t) && (left.type === 'ref' || left.type === 'paren')) {
        const right = parsePostfix();
        left = { type: 'binary', op: ' ', left, right, start: left.start, end: endOf(right, left.end) };
        continue;
      }
      return left;
    }
  }

  function parsePostfix(): AstNode {
    let node = parsePrimary();
    for (;;) {
      if (at('operator', '%')) {
        const op = next()!;
        node = { type: 'postfix', op: '%', operand: node, start: node.start, end: op.end };
        continue;
      }
      if (at('operator', '#')) {
        const op = next()!;
        node = { type: 'postfix', op: '#', operand: node, start: node.start, end: op.end };
        continue;
      }
      return node;
    }
  }

  function parseArguments(call: { start: number; name: string }): { args: AstNode[]; end: number } {
    const args: AstNode[] = [];
    const open = next()!; // the '(' token
    let end = open.end;

    if (at('rparen')) {
      end = next()!.end;
      return { args, end };
    }

    for (;;) {
      if (!peek()) {
        report(
          'error',
          'missing-close-paren',
          `${call.name} is missing its closing parenthesis.`,
          call.start,
          sourceEnd
        );
        return { args, end: sourceEnd };
      }

      if (at('separator') || at('rparen')) {
        // An empty slot, as in IF(A1,,0)
        const here = peek()!.start;
        args.push(missing(here));
        report(
          'warning',
          'empty-argument',
          `Argument ${args.length} of ${call.name} is empty. Excel reads an empty argument as 0 or as empty text, which is rarely what is intended.`,
          here,
          here
        );
      } else {
        args.push(parseExpression());
      }

      if (at('separator')) {
        next();
        continue;
      }
      if (at('rparen')) {
        end = next()!.end;
        return { args, end };
      }

      const stray = peek();
      if (!stray) {
        report(
          'error',
          'missing-close-paren',
          `${call.name} is missing its closing parenthesis.`,
          call.start,
          sourceEnd
        );
        return { args, end: sourceEnd };
      }
      report(
        'error',
        'unexpected-token',
        `Unexpected "${stray.value}" inside ${call.name}. An argument separator or a closing parenthesis was expected here.`,
        stray.start,
        stray.end
      );
      next();
    }
  }

  function parseArrayConstant(open: Token): AstNode {
    const rows: AstNode[][] = [[]];
    for (;;) {
      if (!peek()) {
        report('error', 'missing-close-brace', 'This array constant is missing its closing brace.', open.start, sourceEnd);
        return { type: 'array', rows, start: open.start, end: sourceEnd };
      }
      if (at('rbrace')) {
        const close = next()!;
        return { type: 'array', rows, start: open.start, end: close.end };
      }
      rows[rows.length - 1].push(parseExpression());
      if (at('separator')) {
        next();
        continue;
      }
      if (at('arrayRowSep')) {
        next();
        rows.push([]);
        continue;
      }
      if (at('rbrace')) continue;

      const stray = peek()!;
      report(
        'error',
        'unexpected-token',
        `Unexpected "${stray.value}" inside an array constant.`,
        stray.start,
        stray.end
      );
      next();
    }
  }

  function parsePrimary(): AstNode {
    const t = peek();
    if (!t) {
      return missing(sourceEnd);
    }

    switch (t.kind) {
      case 'number':
        next();
        return { type: 'literal', kind: 'number', raw: t.value, value: t.value, start: t.start, end: t.end };

      case 'string': {
        next();
        // Trailing quote may be a curly one when the text was pasted from a
        // document; the tokenizer already flagged it.
        const inner = t.value
          .replace(/^["“”]/, '')
          .replace(/["“”]$/, '')
          .replace(/""/g, '"');
        return { type: 'literal', kind: 'string', raw: t.value, value: inner, start: t.start, end: t.end };
      }

      case 'boolean':
        next();
        return {
          type: 'literal',
          kind: 'boolean',
          raw: t.value,
          value: t.value.toUpperCase(),
          start: t.start,
          end: t.end,
        };

      case 'errorLiteral':
        next();
        return { type: 'literal', kind: 'error', raw: t.value, value: t.value, start: t.start, end: t.end };

      case 'ref':
        next();
        return { type: 'ref', ref: t.ref!, start: t.start, end: t.end };

      case 'func': {
        next();
        const rawName = t.value;
        const canonical = rawName.replace(/^_xlfn\./i, '').replace(/^_xlws\./i, '').toUpperCase();
        const { args, end } = parseArguments({ start: t.start, name: canonical });
        const call: CallNode = {
          type: 'call',
          rawName,
          name: canonical,
          args,
          def: lookupFunction(rawName),
          start: t.start,
          end,
        };
        return call;
      }

      case 'lparen': {
        const open = next()!;
        const first = parseExpression();
        if (at('separator')) {
          // Union: (A1:A3,C1:C3)
          const items = [first];
          while (at('separator')) {
            next();
            items.push(parseExpression());
          }
          if (at('rparen')) {
            const close = next()!;
            return { type: 'union', items, start: open.start, end: close.end };
          }
          report('error', 'missing-close-paren', 'This group is missing its closing parenthesis.', open.start, sourceEnd);
          return { type: 'union', items, start: open.start, end: sourceEnd };
        }
        if (at('rparen')) {
          const close = next()!;
          return { type: 'paren', expression: first, start: open.start, end: close.end };
        }
        report('error', 'missing-close-paren', 'This group is missing its closing parenthesis.', open.start, sourceEnd);
        return { type: 'paren', expression: first, start: open.start, end: endOf(first, open.end) };
      }

      case 'lbrace':
        return parseArrayConstant(next()!);

      case 'rparen':
        report(
          'error',
          'unmatched-close-paren',
          'There is a closing parenthesis here with no matching opening parenthesis.',
          t.start,
          t.end
        );
        next();
        return missing(t.start);

      default:
        report(
          'error',
          'unexpected-token',
          `"${t.value}" cannot start a value here. An operand such as a number, a text value, or a cell reference was expected.`,
          t.start,
          t.end
        );
        next();
        return missing(t.start);
    }
  }

  /* ----------------------------------------------------------------- run */

  if (at('equals')) next();

  if (!peek()) {
    return { ast: null, diagnostics, tokens, separator };
  }

  const ast = parseExpression();

  if (peek()) {
    const stray = peek()!;
    report(
      'error',
      'unexpected-trailing',
      `Unexpected "${stray.value}" after the end of the formula.`,
      stray.start,
      tokens[tokens.length - 1].end
    );
  }

  return { ast, diagnostics, tokens, separator };
}

/* ------------------------------------------------------------- traversal */

export function walk(node: AstNode, visit: (n: AstNode, depth: number) => void, depth = 0): void {
  visit(node, depth);
  switch (node.type) {
    case 'call':
      node.args.forEach((a) => walk(a, visit, depth + 1));
      break;
    case 'binary':
      walk(node.left, visit, depth + 1);
      walk(node.right, visit, depth + 1);
      break;
    case 'unary':
      walk(node.operand, visit, depth + 1);
      break;
    case 'postfix':
      walk(node.operand, visit, depth + 1);
      break;
    case 'paren':
      walk(node.expression, visit, depth + 1);
      break;
    case 'union':
      node.items.forEach((a) => walk(a, visit, depth + 1));
      break;
    case 'array':
      node.rows.forEach((row) => row.forEach((a) => walk(a, visit, depth + 1)));
      break;
    default:
      break;
  }
}
