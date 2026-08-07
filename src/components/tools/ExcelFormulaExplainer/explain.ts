import { paramForIndex } from '@/lib/data/excel-functions';
import type {
  AstNode,
  CallNode,
  CompatibilityNote,
  EvaluationStep,
  ExplainedArgument,
  ExplainedNode,
  OperatorNote,
  ReferenceSummary,
} from './types';

/**
 * Turns an AST into everything the UI shows: a nested breakdown, a plain-English
 * narrative, the evaluation order, operator notes, and a dependency summary.
 */

/* ------------------------------------------------------------- operators */

interface OperatorSpec {
  name: string;
  description: string;
  /** `{l}` and `{r}` are replaced with the operand phrases. */
  phrase: string;
}

const BINARY_OPERATORS: Record<string, OperatorSpec> = {
  '+': { name: 'Addition', description: 'Adds two values together.', phrase: 'add {l} and {r}' },
  '-': { name: 'Subtraction', description: 'Subtracts the value on the right from the value on the left.', phrase: 'subtract {r} from {l}' },
  '*': { name: 'Multiplication', description: 'Multiplies two values.', phrase: 'multiply {l} by {r}' },
  '/': { name: 'Division', description: 'Divides the left value by the right value. Dividing by zero produces #DIV/0!.', phrase: 'divide {l} by {r}' },
  '^': { name: 'Exponent', description: 'Raises a number to a power.', phrase: 'raise {l} to the power of {r}' },
  '&': { name: 'Concatenation', description: 'Joins two values into a single piece of text.', phrase: 'join {l} and {r} into one piece of text' },
  '=': { name: 'Equal to', description: 'Compares two values and returns TRUE when they match. Text comparison ignores case.', phrase: 'check whether {l} equals {r}' },
  '<>': { name: 'Not equal to', description: 'Returns TRUE when two values differ.', phrase: 'check whether {l} is different from {r}' },
  '<': { name: 'Less than', description: 'Returns TRUE when the left value is smaller.', phrase: 'check whether {l} is less than {r}' },
  '>': { name: 'Greater than', description: 'Returns TRUE when the left value is larger.', phrase: 'check whether {l} is greater than {r}' },
  '<=': { name: 'Less than or equal to', description: 'Returns TRUE when the left value is smaller than or equal to the right.', phrase: 'check whether {l} is at most {r}' },
  '>=': { name: 'Greater than or equal to', description: 'Returns TRUE when the left value is larger than or equal to the right.', phrase: 'check whether {l} is at least {r}' },
  ':': { name: 'Range', description: 'Builds a rectangular range spanning the two references.', phrase: 'take the range from {l} to {r}' },
  ' ': { name: 'Intersection', description: 'A space between two references returns only the cells they share.', phrase: 'take the cells where {l} and {r} overlap' },
};

const UNARY_OPERATORS: Record<string, OperatorSpec> = {
  '-': { name: 'Negation', description: 'Reverses the sign of a number.', phrase: 'take the negative of {x}' },
  '+': { name: 'Unary plus', description: 'Has no effect on the value; Excel keeps it for compatibility.', phrase: '{x}' },
  '@': { name: 'Implicit intersection', description: 'Forces a formula to return a single value instead of spilling a whole array.', phrase: 'take the single value from {x}' },
};

const POSTFIX_OPERATORS: Record<string, OperatorSpec> = {
  '%': { name: 'Percent', description: 'Divides the preceding number by 100.', phrase: '{x} as a percentage' },
  '#': { name: 'Spilled range', description: 'Refers to the entire range a dynamic array formula spills into, however large it grows.', phrase: 'the whole spilled range from {x}' },
};

/* --------------------------------------------------------------- helpers */

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function upperFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stripPeriod(text: string): string {
  return text.replace(/\.\s*$/, '');
}

export function nodeText(source: string, node: AstNode): string {
  return source.slice(node.start, node.end).trim();
}

/** Unwraps redundant parentheses so descriptions read naturally. */
function unwrap(node: AstNode): AstNode {
  return node.type === 'paren' ? unwrap(node.expression) : node;
}

/**
 * Renders a narrative template. Supports `{n}`, `{n|fallback}` for an omitted
 * optional argument, and `{n?text}` which emits `text` only when argument `n`
 * was supplied, with `$` inside standing for the argument phrase.
 */
function renderTemplate(template: string, phrases: (string | undefined)[]): string {
  return template.replace(/\{(\d+)(\?[^{}]*|\|[^{}]*)?\}/g, (_all, indexText: string, modifier?: string) => {
    const index = parseInt(indexText, 10);
    const value = phrases[index];
    if (!modifier) return value ?? '';
    if (modifier.startsWith('?')) {
      if (value === undefined) return '';
      return modifier.slice(1).replace(/\$/g, value);
    }
    return value ?? modifier.slice(1);
  });
}

/* ------------------------------------------------------------- narrative */

const MAX_NARRATIVE_DEPTH = 2;

const CONDITION_PHRASES: Record<string, string> = {
  '=': '{l} equals {r}',
  '<>': '{l} is different from {r}',
  '<': '{l} is less than {r}',
  '>': '{l} is greater than {r}',
  '<=': '{l} is at most {r}',
  '>=': '{l} is at least {r}',
};

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Argument phrases for a call. For a variadic function whose repeating group is
 * a single value — SUM, AVERAGE, AND, MAX — every supplied argument is folded
 * into the first placeholder, so `SUM(A1:A10,B1:B10)` reads as "add up A1:A10
 * and B1:B10" rather than dropping everything after the first.
 */
function argumentPhrases(source: string, n: CallNodeLike, depth: number): (string | undefined)[] {
  const phrases = n.args.map((a) =>
    a.type === 'missing' ? undefined : describeArgument(source, a, depth + 1)
  );
  const def = n.def;
  if (def && def.repeatFrom !== undefined && def.repeatSize === 1 && n.args.length > def.repeatFrom + 1) {
    const head = phrases.slice(0, def.repeatFrom);
    const tail = phrases.slice(def.repeatFrom).filter((p): p is string => Boolean(p));
    return [...head, joinList(tail)];
  }
  return phrases;
}

type CallNodeLike = Extract<AstNode, { type: 'call' }>;

/** One-line phrase describing what a node produces. */
export function describeNode(source: string, node: AstNode, depth = 0): string {
  const n = unwrap(node);

  switch (n.type) {
    case 'call': {
      // LET binds names before it calculates, so it reads as a list of
      // definitions followed by the expression that uses them.
      if (n.name === 'LET' && n.args.length >= 3) {
        const bindings: string[] = [];
        for (let i = 0; i + 1 < n.args.length - 1; i += 2) {
          bindings.push(`${nodeText(source, n.args[i])} as ${describeArgument(source, n.args[i + 1], depth + 1)}`);
        }
        const final = n.args[n.args.length - 1];
        return `define ${joinList(bindings)}, then ${describeNode(source, final, depth + 1)}`;
      }

      const argPhrases = argumentPhrases(source, n, depth);
      if (n.def?.narrative) {
        // Only use the sentence template when every placeholder it treats as
        // mandatory was actually supplied; an incomplete formula otherwise
        // renders as "look up A1 in the first column of  and return...".
        const required = [...n.def.narrative.matchAll(/\{(\d+)\}/g)].map((m) => parseInt(m[1], 10));
        if (required.every((index) => argPhrases[index] !== undefined)) {
          return renderTemplate(n.def.narrative, argPhrases);
        }
      }
      if (n.def) {
        const list = argPhrases.filter(Boolean).join(', ');
        const base = lowerFirst(stripPeriod(n.def.description));
        return list ? `${base} (${list})` : base;
      }
      return `call ${n.name} with ${n.args.length} argument${n.args.length === 1 ? '' : 's'}`;
    }

    case 'binary': {
      // Recognise the idioms that make inherited formulas look like line noise.
      const idiom = describeIdiom(source, n, depth);
      if (idiom) return idiom;
      const spec = BINARY_OPERATORS[n.op];
      const l = describeArgument(source, n.left, depth + 1);
      const r = describeArgument(source, n.right, depth + 1);
      if (!spec) return `${l} ${n.op} ${r}`;
      return spec.phrase.replace('{l}', l).replace('{r}', r);
    }

    case 'unary': {
      if (n.op === '-' && unwrap(n.operand).type === 'unary' && (unwrap(n.operand) as { op: string }).op === '-') {
        const inner = (unwrap(n.operand) as { operand: AstNode }).operand;
        return `convert the TRUE/FALSE results of ${describeArgument(source, inner, depth + 1)} into 1s and 0s`;
      }
      const spec = UNARY_OPERATORS[n.op];
      const x = describeArgument(source, n.operand, depth + 1);
      return spec ? spec.phrase.replace('{x}', x) : `${n.op}${x}`;
    }

    case 'postfix': {
      const spec = POSTFIX_OPERATORS[n.op];
      const x = describeArgument(source, n.operand, depth + 1);
      return spec ? spec.phrase.replace('{x}', x) : `${x}${n.op}`;
    }

    case 'union':
      return `combine the ranges ${n.items.map((it) => nodeText(source, it)).join(' and ')} into one reference`;

    case 'array':
      return `use the fixed list of values ${nodeText(source, n)}`;

    case 'ref':
      return `use ${n.ref.raw}`;

    case 'literal':
      return `use the ${n.kind} value ${n.kind === 'string' ? `"${n.value}"` : n.value}`;

    default:
      return 'nothing — this part of the formula is empty';
  }
}

/** How a node reads when it appears inside another node's description. */
function describeArgument(source: string, node: AstNode, depth: number): string {
  const n = unwrap(node);

  if (n.type === 'ref') return n.ref.raw;
  if (n.type === 'literal') return n.kind === 'string' ? `"${n.value}"` : n.value;
  if (n.type === 'missing') return 'nothing';
  // Array constants and unions read best as the literal text the user wrote.
  if (n.type === 'array' || n.type === 'union') return nodeText(source, n);

  // A comparison used as a condition reads better bare: "A1 is greater than 0"
  // rather than "(check whether A1 is greater than 0)".
  if (n.type === 'binary' && CONDITION_PHRASES[n.op] && depth <= MAX_NARRATIVE_DEPTH) {
    return CONDITION_PHRASES[n.op]
      .replace('{l}', describeArgument(source, n.left, depth + 1))
      .replace('{r}', describeArgument(source, n.right, depth + 1));
  }

  if (depth <= MAX_NARRATIVE_DEPTH) {
    const inner = describeNode(source, n, depth);
    return `(${inner})`;
  }
  return nodeText(source, n);
}

/** Named idioms that a literal operator reading would obscure. */
function describeIdiom(source: string, node: AstNode, depth: number): string | null {
  if (node.type !== 'binary' || node.op !== '*') return null;
  const left = unwrap(node.left);
  const right = unwrap(node.right);
  const isComparison = (n: AstNode) =>
    n.type === 'binary' && ['=', '<>', '<', '>', '<=', '>='].includes(n.op);
  if (isComparison(left) && isComparison(right)) {
    return `require both ${describeArgument(source, left, depth + 1)} and ${describeArgument(
      source,
      right,
      depth + 1
    )} to be true — multiplying TRUE/FALSE gives 1 only when every test matches`;
  }
  return null;
}

export function buildNarrative(source: string, ast: AstNode | null): string {
  if (!ast) return '';
  const phrase = describeNode(source, ast, 0);
  if (!phrase) return '';
  return `${upperFirst(phrase.trim())}.`;
}

/* ------------------------------------------------------------------ tree */

function kindLabel(node: AstNode): string {
  switch (node.type) {
    case 'binary':
      return 'Operator';
    case 'unary':
      return 'Operator';
    case 'postfix':
      return 'Operator';
    case 'array':
      return 'Array constant';
    case 'union':
      return 'Reference';
    default:
      return 'Expression';
  }
}

/**
 * Builds the visible breakdown. References and plain literals do not get their
 * own node — they appear as the arguments of the node that uses them.
 */
export function buildTree(source: string, node: AstNode | null, idPath = '0'): ExplainedNode | null {
  if (!node) return null;
  const n = unwrap(node);

  if (n.type === 'ref' || n.type === 'literal' || n.type === 'missing') return null;

  const children: ExplainedNode[] = [];
  const args: ExplainedArgument[] = [];

  if (n.type === 'call') {
    n.args.forEach((argNode, index) => {
      const param = n.def ? paramForIndex(n.def, index, n.args.length) : undefined;
      const child = buildTree(source, argNode, `${idPath}.${index}`);
      if (child) children.push(child);
      args.push({
        paramName: param?.name ?? `argument ${index + 1}`,
        paramDescription: param?.description ?? 'Not described in our reference for this function.',
        optional: param?.optional ?? false,
        text: argNode.type === 'missing' ? '(empty)' : nodeText(source, argNode),
        node: argNode,
        child: child ?? undefined,
      });
    });

    return {
      id: idPath,
      node: n,
      label: n.rawName,
      kind: n.def?.category ?? 'Not in our reference',
      description: n.def ? n.def.description : `${n.name} is not in our function reference, so we cannot describe what it does. It is called here with ${n.args.length} argument${n.args.length === 1 ? '' : 's'}.`,
      syntax: n.def?.syntax,
      def: n.def,
      args,
      children,
      start: n.start,
      end: n.end,
    };
  }

  const operandNodes: AstNode[] =
    n.type === 'binary'
      ? [n.left, n.right]
      : n.type === 'unary' || n.type === 'postfix'
        ? [n.operand]
        : n.type === 'union'
          ? n.items
          : n.type === 'array'
            ? n.rows.flat()
            : [];

  operandNodes.forEach((operand, index) => {
    const child = buildTree(source, operand, `${idPath}.${index}`);
    if (child) children.push(child);
  });

  const spec =
    n.type === 'binary'
      ? BINARY_OPERATORS[n.op]
      : n.type === 'unary'
        ? UNARY_OPERATORS[n.op]
        : n.type === 'postfix'
          ? POSTFIX_OPERATORS[n.op]
          : undefined;

  return {
    id: idPath,
    node: n,
    label:
      n.type === 'binary' || n.type === 'unary' || n.type === 'postfix'
        ? n.op === ' '
          ? '(space)'
          : n.op
        : nodeText(source, n),
    kind: spec ? `${spec.name} operator` : kindLabel(n),
    description: spec ? `${spec.description} Here it will ${describeNode(source, n, 0)}.` : describeNode(source, n, 0),
    args: [],
    children,
    start: n.start,
    end: n.end,
  };
}

/* ------------------------------------------------------- evaluation order */

const MAX_STEPS = 20;

export function buildSteps(source: string, ast: AstNode | null): EvaluationStep[] {
  if (!ast) return [];
  const collected: AstNode[] = [];

  const visit = (node: AstNode) => {
    const n = unwrap(node);
    switch (n.type) {
      case 'call':
        n.args.forEach(visit);
        collected.push(n);
        break;
      case 'binary':
        visit(n.left);
        visit(n.right);
        collected.push(n);
        break;
      case 'unary':
      case 'postfix':
        visit(n.operand);
        collected.push(n);
        break;
      case 'union':
        n.items.forEach(visit);
        break;
      case 'array':
        n.rows.flat().forEach(visit);
        break;
      default:
        break;
    }
  };

  visit(ast);

  return collected.slice(0, MAX_STEPS).map((node, index) => ({
    order: index + 1,
    expression: nodeText(source, node),
    description: upperFirst(describeNode(source, node, MAX_NARRATIVE_DEPTH)),
    start: node.start,
    end: node.end,
  }));
}

/* ------------------------------------------------------- operators in use */

export function collectOperators(ast: AstNode | null): OperatorNote[] {
  if (!ast) return [];
  const seen = new Map<string, OperatorNote>();

  const add = (symbol: string, spec: OperatorSpec | undefined) => {
    if (!spec || seen.has(symbol)) return;
    seen.set(symbol, { symbol: symbol === ' ' ? '(space)' : symbol, name: spec.name, description: spec.description });
  };

  const visit = (node: AstNode) => {
    switch (node.type) {
      case 'binary':
        add(node.op, BINARY_OPERATORS[node.op]);
        visit(node.left);
        visit(node.right);
        break;
      case 'unary':
        add(node.op, UNARY_OPERATORS[node.op]);
        visit(node.operand);
        break;
      case 'postfix':
        add(node.op, POSTFIX_OPERATORS[node.op]);
        visit(node.operand);
        break;
      case 'call':
        node.args.forEach(visit);
        break;
      case 'paren':
        visit(node.expression);
        break;
      case 'union':
        node.items.forEach(visit);
        break;
      case 'array':
        node.rows.flat().forEach(visit);
        break;
      default:
        break;
    }
  };

  visit(ast);
  return [...seen.values()];
}

/* --------------------------------------------------------- reference list */

export function summarizeReferences(ast: AstNode | null): ReferenceSummary {
  const summary: ReferenceSummary = {
    cells: [],
    ranges: [],
    wholeColumnsOrRows: [],
    tables: [],
    names: [],
    sheets: [],
    workbooks: [],
    volatileFunctions: [],
    literalCount: 0,
    totalCells: 0,
  };
  if (!ast) return summary;

  const seenRefs = new Set<string>();
  const sheets = new Set<string>();
  const workbooks = new Set<string>();
  const volatiles = new Set<string>();

  const visit = (node: AstNode) => {
    switch (node.type) {
      case 'ref': {
        const { ref } = node;
        if (ref.sheet) sheets.add(ref.sheet);
        if (ref.workbook) workbooks.add(ref.workbook);
        if (!seenRefs.has(ref.raw)) {
          seenRefs.add(ref.raw);
          if (ref.cellCount) summary.totalCells += ref.cellCount;
          if (ref.kind === 'cell') summary.cells.push(ref);
          else if (ref.kind === 'range') summary.ranges.push(ref);
          else if (ref.kind === 'whole-column' || ref.kind === 'whole-row') summary.wholeColumnsOrRows.push(ref);
          else if (ref.kind === 'table') summary.tables.push(ref);
          else summary.names.push(ref);
        }
        break;
      }
      case 'literal':
        summary.literalCount += 1;
        break;
      case 'call':
        if (node.def?.volatile) volatiles.add(node.name);
        node.args.forEach(visit);
        break;
      case 'binary':
        visit(node.left);
        visit(node.right);
        break;
      case 'unary':
      case 'postfix':
        visit(node.operand);
        break;
      case 'paren':
        visit(node.expression);
        break;
      case 'union':
        node.items.forEach(visit);
        break;
      case 'array':
        node.rows.flat().forEach(visit);
        break;
      default:
        break;
    }
  };

  visit(ast);
  summary.sheets = [...sheets];
  summary.workbooks = [...workbooks];
  summary.volatileFunctions = [...volatiles];
  return summary;
}

/* ------------------------------------------------------------ inventories */

export interface FunctionInventory {
  known: CallNode[];
  unknown: string[];
  names: string[];
  maxDepth: number;
}

export function inventoryFunctions(ast: AstNode | null): FunctionInventory {
  const known: CallNode[] = [];
  const unknown: string[] = [];
  const names: string[] = [];
  let maxDepth = 0;

  if (!ast) return { known, unknown, names, maxDepth };

  const visit = (node: AstNode, depth: number) => {
    if (node.type === 'call') {
      maxDepth = Math.max(maxDepth, depth + 1);
      if (node.def) {
        known.push(node);
        if (!names.includes(node.name)) names.push(node.name);
      } else if (!unknown.includes(node.name)) {
        unknown.push(node.name);
      }
      node.args.forEach((a) => visit(a, depth + 1));
      return;
    }
    switch (node.type) {
      case 'binary':
        visit(node.left, depth);
        visit(node.right, depth);
        break;
      case 'unary':
      case 'postfix':
        visit(node.operand, depth);
        break;
      case 'paren':
        visit(node.expression, depth);
        break;
      case 'union':
        node.items.forEach((a) => visit(a, depth));
        break;
      case 'array':
        node.rows.flat().forEach((a) => visit(a, depth));
        break;
      default:
        break;
    }
  };

  visit(ast, 0);
  return { known, unknown, names, maxDepth };
}

export function buildCompatibility(known: CallNode[]): CompatibilityNote[] {
  const notes = new Map<string, CompatibilityNote>();
  known.forEach((call) => {
    const def = call.def!;
    if (notes.has(def.name)) return;
    if (def.availability === 'sheets') {
      notes.set(def.name, {
        functionName: def.name,
        availability: 'sheets',
        message: `${def.name} exists only in Google Sheets. Excel returns #NAME? for it.`,
      });
      return;
    }
    if (def.availability === 'excel') {
      notes.set(def.name, {
        functionName: def.name,
        availability: 'excel',
        since: def.since,
        message: `${def.name} exists only in Excel${def.since ? ` (${def.since})` : ''}. Google Sheets does not have it.`,
      });
      return;
    }
    if (def.since) {
      notes.set(def.name, {
        functionName: def.name,
        availability: 'excel',
        since: def.since,
        message: `${def.name} was added in ${def.since}. Older Excel versions return #NAME? — a workbook opened there will show _xlfn.${def.name}.`,
      });
    }
  });
  return [...notes.values()];
}
