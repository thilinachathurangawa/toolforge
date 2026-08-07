import type { AstNode } from './types';

/**
 * Pretty-printer and minifier, both driven from the AST so the output is always
 * a formula Excel will accept — the input is re-rendered, never string-edited.
 */

/** Beyond this rendered width a call is broken across indented lines. */
const WRAP_WIDTH = 34;
const INDENT = '    ';

const SPACED_OPERATORS = new Set(['=', '<>', '<', '>', '<=', '>=', '&', '+', '-', '*', '/', '^']);

interface RenderOptions {
  separator: ',' | ';';
  pretty: boolean;
}

function renderInline(node: AstNode, sep: ',' | ';'): string {
  return render(node, { separator: sep, pretty: false }, 0);
}

function render(node: AstNode, opts: RenderOptions, level: number): string {
  const sep = opts.separator;

  switch (node.type) {
    case 'literal':
      return node.raw;

    case 'ref':
      return node.ref.raw;

    case 'missing':
      return '';

    case 'paren':
      return `(${render(node.expression, opts, level)})`;

    case 'union':
      return `(${node.items.map((i) => render(i, opts, level)).join(sep)})`;

    case 'array':
      return `{${node.rows.map((row) => row.map((c) => renderInline(c, sep)).join(sep)).join(';')}}`;

    case 'unary':
      return `${node.op}${render(node.operand, opts, level)}`;

    case 'postfix':
      return `${render(node.operand, opts, level)}${node.op}`;

    case 'binary': {
      const left = render(node.left, opts, level);
      const right = render(node.right, opts, level);
      if (node.op === ':') return `${left}:${right}`;
      if (node.op === ' ') return `${left} ${right}`;
      const pad = opts.pretty && SPACED_OPERATORS.has(node.op) ? ' ' : '';
      return `${left}${pad}${node.op}${pad}${right}`;
    }

    case 'call': {
      const inline = `${node.rawName}(${node.args.map((a) => renderInline(a, sep)).join(sep)})`;
      if (!opts.pretty || inline.length <= WRAP_WIDTH || node.args.length === 0) {
        if (!opts.pretty) return inline;
        // Short enough to keep on one line, but re-render children so any
        // deeply nested long call inside still gets to wrap.
        const rendered = node.args.map((a) => render(a, opts, level)).join(sep);
        return rendered.includes('\n')
          ? wrapCall(node, opts, level)
          : `${node.rawName}(${rendered})`;
      }
      return wrapCall(node, opts, level);
    }

    default:
      return '';
  }
}

function wrapCall(node: Extract<AstNode, { type: 'call' }>, opts: RenderOptions, level: number): string {
  const inner = INDENT.repeat(level + 1);
  const closing = INDENT.repeat(level);
  const args = node.args
    .map((a) => `${inner}${render(a, opts, level + 1)}`)
    .join(`${opts.separator}\n`);
  return `${node.rawName}(\n${args}\n${closing})`;
}

/** Multi-line, indented rendering — the way long formulas are kept readable. */
export function prettyPrint(ast: AstNode | null, separator: ',' | ';'): string {
  if (!ast) return '';
  return `=${render(ast, { separator, pretty: true }, 0)}`;
}

/** Single line, no padding — ready to paste back into a cell. */
export function minify(ast: AstNode | null, separator: ',' | ';'): string {
  if (!ast) return '';
  return `=${render(ast, { separator, pretty: false }, 0)}`;
}
