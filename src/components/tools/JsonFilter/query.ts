/**
 * Query engine for the JSON Filter tool.
 *
 * Deliberately free of React and DOM APIs: path parsing, operator semantics,
 * collection detection, key discovery, projection, sorting and diagnostics all
 * live here so they can be reasoned about — and tested — on their own.
 */

/* -------------------------------- types -------------------------------- */

export type Combinator = 'all' | 'any';
export type FieldMode = 'all' | 'include' | 'exclude' | 'pluck';
export type SortDirection = 'asc' | 'desc';
export type Indent = 2 | 4 | 'tab';

export type Operator =
  | 'exists'
  | 'notExists'
  | 'eq'
  | 'neq'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'regex'
  | 'isEmpty'
  | 'isNull'
  | 'isTrue'
  | 'isFalse'
  | 'typeIs';

export interface Condition {
  id: string;
  path: string;
  operator: Operator;
  value: string;
}

export type PathSegment =
  | { kind: 'key'; key: string }
  | { kind: 'index'; index: number }
  | { kind: 'wildcard' };

export interface CompiledCondition {
  condition: Condition;
  segments: PathSegment[];
  regex: RegExp | null;
  numericValue: number | null;
  /** A genuine mistake worth showing in red — a bad regex, a non-numeric bound. */
  error: string | null;
  /** Simply not filled in yet: inactive, but not the user's error. */
  incomplete: boolean;
}

export interface QueryConfig {
  combinator: Combinator;
  invert: boolean;
  search: string;
  caseSensitive: boolean;
}

export interface KeyInfo {
  path: string;
  type: string;
  count: number;
}

export interface Collection {
  path: string;
  label: string;
  count: number;
}

/** An object source is filtered entry by entry, each entry seen as { key, value }. */
export interface ObjectEntry {
  key: string;
  value: unknown;
}

export type Source =
  | { kind: 'array'; items: unknown[] }
  | { kind: 'object'; entries: ObjectEntry[] }
  | { kind: 'invalid'; message: string };

export interface PipelineOptions {
  fieldMode: FieldMode;
  fields: string[];
  sortPath: string;
  sortDir: SortDirection;
  limit: number | null;
}

export interface PipelineResult {
  total: number;
  matched: number;
  returned: number;
  value: unknown;
  unit: 'items' | 'entries';
}

export interface Diagnostic {
  path: string;
  label: string;
  presentCount: number;
  matchCount: number;
  samples: string[];
}

export interface ParseFailure {
  message: string;
  line?: number;
  column?: number;
  excerpt?: string;
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; failure: ParseFailure };

/* ------------------------------ operators ------------------------------ */

export const OPERATORS: {
  value: Operator;
  label: string;
  needsValue: boolean;
  numeric?: boolean;
}[] = [
  { value: 'eq', label: 'equals', needsValue: true },
  { value: 'neq', label: 'not equals', needsValue: true },
  { value: 'contains', label: 'contains', needsValue: true },
  { value: 'notContains', label: 'does not contain', needsValue: true },
  { value: 'startsWith', label: 'starts with', needsValue: true },
  { value: 'endsWith', label: 'ends with', needsValue: true },
  { value: 'gt', label: 'greater than (>)', needsValue: true, numeric: true },
  { value: 'gte', label: 'at least (≥)', needsValue: true, numeric: true },
  { value: 'lt', label: 'less than (<)', needsValue: true, numeric: true },
  { value: 'lte', label: 'at most (≤)', needsValue: true, numeric: true },
  { value: 'regex', label: 'matches regex', needsValue: true },
  { value: 'typeIs', label: 'type is', needsValue: true },
  { value: 'exists', label: 'exists', needsValue: false },
  { value: 'notExists', label: 'does not exist', needsValue: false },
  { value: 'isEmpty', label: 'is empty', needsValue: false },
  { value: 'isNull', label: 'is null', needsValue: false },
  { value: 'isTrue', label: 'is true', needsValue: false },
  { value: 'isFalse', label: 'is false', needsValue: false },
];

export const JSON_TYPES = ['string', 'number', 'boolean', 'null', 'array', 'object'];

const NEGATIVE_OPERATORS: Operator[] = ['neq', 'notContains', 'notExists'];
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function operatorInfo(operator: Operator) {
  return OPERATORS.find((entry) => entry.value === operator) ?? OPERATORS[0];
}

/* ------------------------------- helpers ------------------------------- */

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function jsonType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  const type = typeof value;
  return type === 'object' ? 'object' : type;
}

/** Text form used for string comparison — objects stringify usefully, not as [object Object]. */
export function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (value === undefined) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value) ?? '';
    } catch {
      return '';
    }
  }
  return String(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function sameText(a: string, b: string, caseSensitive: boolean): boolean {
  return caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();
}

function containsText(haystack: string, needle: string, caseSensitive: boolean): boolean {
  return caseSensitive
    ? haystack.includes(needle)
    : haystack.toLowerCase().includes(needle.toLowerCase());
}

/* ----------------------------- path handling ----------------------------- */

export class PathError extends Error {}

/** Parses `a.b[0].c[*]` (a leading `$` is tolerated) into segments. */
export function parsePath(raw: string): PathSegment[] {
  const segments: PathSegment[] = [];
  const source = raw.trim().replace(/^\$/, '');
  let buffer = '';

  const flush = () => {
    if (!buffer) return;
    segments.push(buffer === '*' ? { kind: 'wildcard' } : { kind: 'key', key: buffer });
    buffer = '';
  };

  let index = 0;
  while (index < source.length) {
    const char = source[index];

    if (char === '.') {
      flush();
      index += 1;
      continue;
    }

    if (char === '[') {
      flush();
      const close = source.indexOf(']', index);
      if (close === -1) throw new PathError('Unclosed "[" in the path.');

      const inner = source.slice(index + 1, close).trim().replace(/^['"]|['"]$/g, '');
      if (inner === '*') segments.push({ kind: 'wildcard' });
      else if (/^\d+$/.test(inner)) segments.push({ kind: 'index', index: Number(inner) });
      else if (inner) segments.push({ kind: 'key', key: inner });
      else throw new PathError('Empty "[]" in the path.');

      index = close + 1;
      continue;
    }

    buffer += char;
    index += 1;
  }

  flush();
  return segments;
}

/**
 * Every value the path resolves to. Wildcards fan out, missing branches drop out,
 * and own properties only are read so `__proto__` and friends cannot be reached.
 */
export function resolvePathValues(root: unknown, segments: PathSegment[]): unknown[] {
  let current: unknown[] = [root];

  for (const segment of segments) {
    const next: unknown[] = [];

    for (const value of current) {
      if (value === null || value === undefined) continue;

      if (segment.kind === 'wildcard') {
        if (Array.isArray(value)) next.push(...value);
        else if (isPlainObject(value)) next.push(...Object.values(value));
        continue;
      }

      if (segment.kind === 'index') {
        if (Array.isArray(value) && segment.index < value.length) next.push(value[segment.index]);
        continue;
      }

      if (BLOCKED_KEYS.has(segment.key)) continue;
      if (isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, segment.key)) {
        next.push(value[segment.key]);
      }
    }

    if (!next.length) return [];
    current = next;
  }

  return current;
}

export function resolveFirst(root: unknown, path: string): unknown {
  try {
    return resolvePathValues(root, parsePath(path))[0];
  } catch {
    return undefined;
  }
}

/* --------------------------- condition compiling --------------------------- */

export function compileCondition(condition: Condition, caseSensitive: boolean): CompiledCondition {
  const info = operatorInfo(condition.operator);
  const compiled: CompiledCondition = {
    condition,
    segments: [],
    regex: null,
    numericValue: null,
    error: null,
    incomplete: false,
  };

  if (!condition.path.trim()) {
    compiled.incomplete = true;
    return compiled;
  }

  try {
    compiled.segments = parsePath(condition.path);
  } catch (error) {
    compiled.error = error instanceof Error ? error.message : 'Invalid path.';
    return compiled;
  }

  if (info.needsValue && !condition.value.trim()) {
    compiled.incomplete = true;
    return compiled;
  }

  if (info.numeric) {
    const numeric = toNumber(condition.value);
    if (numeric === null) {
      compiled.error = 'Enter a number to compare with.';
      return compiled;
    }
    compiled.numericValue = numeric;
  }

  if (condition.operator === 'regex') {
    try {
      compiled.regex = new RegExp(condition.value, caseSensitive ? '' : 'i');
    } catch (error) {
      compiled.error = error instanceof Error ? error.message : 'Invalid regular expression.';
      return compiled;
    }
  }

  if (condition.operator === 'typeIs' && !JSON_TYPES.includes(condition.value.trim().toLowerCase())) {
    compiled.error = `Use one of: ${JSON_TYPES.join(', ')}.`;
    return compiled;
  }

  return compiled;
}

export function compileConditions(
  conditions: Condition[],
  caseSensitive: boolean
): CompiledCondition[] {
  return conditions.map((condition) => compileCondition(condition, caseSensitive));
}

/* --------------------------- condition matching --------------------------- */

function matchesValue(
  value: unknown,
  compiled: CompiledCondition,
  caseSensitive: boolean
): boolean {
  const { condition, regex, numericValue } = compiled;
  const raw = condition.value;

  switch (condition.operator) {
    case 'exists':
      return value !== undefined;
    case 'isNull':
      return value === null;
    case 'isTrue':
      return value === true;
    case 'isFalse':
      return value === false;
    case 'isEmpty':
      if (typeof value === 'string') return value.length === 0;
      if (Array.isArray(value)) return value.length === 0;
      if (isPlainObject(value)) return Object.keys(value).length === 0;
      return false;
    case 'typeIs':
      return jsonType(value) === raw.trim().toLowerCase();
    case 'eq': {
      const left = toNumber(value);
      const right = toNumber(raw);
      if (left !== null && right !== null) return left === right;
      return sameText(toText(value), raw, caseSensitive);
    }
    case 'contains':
      return containsText(toText(value), raw, caseSensitive);
    case 'startsWith':
      return caseSensitive
        ? toText(value).startsWith(raw)
        : toText(value).toLowerCase().startsWith(raw.toLowerCase());
    case 'endsWith':
      return caseSensitive
        ? toText(value).endsWith(raw)
        : toText(value).toLowerCase().endsWith(raw.toLowerCase());
    case 'regex':
      return regex ? regex.test(toText(value)) : false;
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const left = toNumber(value);
      if (left === null || numericValue === null) return false;
      if (condition.operator === 'gt') return left > numericValue;
      if (condition.operator === 'gte') return left >= numericValue;
      if (condition.operator === 'lt') return left < numericValue;
      return left <= numericValue;
    }
    default:
      return false;
  }
}

/**
 * A condition passes when **any** resolved value satisfies it. Negative operators
 * are the logical negation of their positive twin, so an item that lacks the path
 * counts as "not equal to" / "does not contain".
 */
export function matchesCondition(
  item: unknown,
  compiled: CompiledCondition,
  caseSensitive: boolean
): boolean {
  // An unusable row must never silently drop every item.
  if (compiled.error || compiled.incomplete) return true;

  const values = resolvePathValues(item, compiled.segments);
  const operator = compiled.condition.operator;

  if (NEGATIVE_OPERATORS.includes(operator)) {
    const positive: Operator =
      operator === 'neq' ? 'eq' : operator === 'notContains' ? 'contains' : 'exists';
    const twin: CompiledCondition = {
      ...compiled,
      condition: { ...compiled.condition, operator: positive },
    };
    return !values.some((value) => matchesValue(value, twin, caseSensitive));
  }

  return values.some((value) => matchesValue(value, compiled, caseSensitive));
}

/** Text match against every scalar value nested anywhere inside the item. */
export function deepSearch(value: unknown, needle: string, caseSensitive: boolean): boolean {
  if (!needle) return true;

  const visit = (candidate: unknown, depth: number): boolean => {
    if (depth > 20) return false;
    if (Array.isArray(candidate)) return candidate.some((entry) => visit(entry, depth + 1));
    if (isPlainObject(candidate)) {
      return Object.values(candidate).some((entry) => visit(entry, depth + 1));
    }
    return containsText(toText(candidate), needle, caseSensitive);
  };

  return visit(value, 0);
}

export function itemMatches(
  item: unknown,
  compiled: CompiledCondition[],
  config: QueryConfig
): boolean {
  const active = compiled.filter((entry) => !entry.error && !entry.incomplete);

  let result: boolean;
  if (!active.length) {
    result = true;
  } else if (config.combinator === 'all') {
    result = active.every((entry) => matchesCondition(item, entry, config.caseSensitive));
  } else {
    result = active.some((entry) => matchesCondition(item, entry, config.caseSensitive));
  }

  const search = config.search.trim();
  if (search) result = result && deepSearch(item, search, config.caseSensitive);

  return config.invert ? !result : result;
}

/* ------------------------- collections and sources ------------------------- */

/** Arrays worth offering as a filter source, plus the document root. */
export function detectCollections(root: unknown, maxResults = 12): Collection[] {
  const found: Collection[] = [];

  if (Array.isArray(root)) {
    found.push({ path: '', label: 'root', count: root.length });
  } else if (isPlainObject(root)) {
    found.push({ path: '', label: 'root (object)', count: Object.keys(root).length });
  }

  const walk = (value: unknown, path: string, depth: number) => {
    if (depth > 4 || found.length > 200) return;

    if (isPlainObject(value)) {
      for (const [key, child] of Object.entries(value)) {
        const childPath = path ? `${path}.${key}` : key;
        if (Array.isArray(child) && child.length > 0) {
          found.push({ path: childPath, label: childPath, count: child.length });
        }
        walk(child, childPath, depth + 1);
      }
      return;
    }

    if (Array.isArray(value) && value.length > 0) {
      // Only descend the first element: sibling elements share its shape in practice.
      walk(value[0], `${path}[0]`, depth + 1);
    }
  };

  walk(root, '', 0);

  const seen = new Set<string>();
  return found
    .filter((entry) => {
      if (seen.has(entry.path)) return false;
      seen.add(entry.path);
      return true;
    })
    .slice(0, maxResults);
}

export function resolveSource(root: unknown, sourcePath: string): Source {
  const path = sourcePath.trim();

  let values: unknown[];
  if (!path || path === '$') {
    values = [root];
  } else {
    try {
      values = resolvePathValues(root, parsePath(path));
    } catch (error) {
      return { kind: 'invalid', message: error instanceof Error ? error.message : 'Invalid path.' };
    }
  }

  if (!values.length) {
    return { kind: 'invalid', message: `Nothing found at "${path}" — check the path or pick a detected collection.` };
  }

  if (values.length > 1) {
    return { kind: 'array', items: values };
  }

  const value = values[0];
  if (Array.isArray(value)) return { kind: 'array', items: value };
  if (isPlainObject(value)) {
    return {
      kind: 'object',
      entries: Object.entries(value).map(([key, entryValue]) => ({ key, value: entryValue })),
    };
  }

  return {
    kind: 'invalid',
    message: `"${path || 'root'}" is a ${jsonType(value)}, not a list or object — there is nothing to filter there.`,
  };
}

/* ----------------------------- key discovery ----------------------------- */

export function collectKeys(items: unknown[], sampleLimit = 200, maxPaths = 80): KeyInfo[] {
  const counts = new Map<string, { count: number; types: Set<string> }>();

  const record = (path: string, value: unknown, seen: Set<string>) => {
    if (seen.has(path)) return;
    seen.add(path);
    const entry = counts.get(path) ?? { count: 0, types: new Set<string>() };
    entry.count += 1;
    entry.types.add(jsonType(value));
    counts.set(path, entry);
  };

  const walk = (value: unknown, prefix: string, depth: number, seen: Set<string>) => {
    if (depth > 3) return;

    if (isPlainObject(value)) {
      for (const [key, child] of Object.entries(value)) {
        if (BLOCKED_KEYS.has(key)) continue;
        const path = prefix ? `${prefix}.${key}` : key;
        record(path, child, seen);
        walk(child, path, depth + 1, seen);
      }
      return;
    }

    if (Array.isArray(value) && prefix) {
      const path = `${prefix}[*]`;
      for (const child of value.slice(0, 20)) {
        record(path, child, seen);
        walk(child, path, depth + 1, seen);
      }
    }
  };

  for (const item of items.slice(0, sampleLimit)) {
    walk(item, '', 0, new Set<string>());
  }

  return Array.from(counts.entries())
    .map(([path, entry]) => ({
      path,
      type: entry.types.size === 1 ? Array.from(entry.types)[0] : 'mixed',
      count: entry.count,
    }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
    .slice(0, maxPaths);
}

/* ------------------------------ diagnostics ------------------------------ */

export function buildDiagnostics(
  items: unknown[],
  compiled: CompiledCondition[],
  config: QueryConfig,
  sampleLimit = 500
): Diagnostic[] {
  const sample = items.slice(0, sampleLimit);

  return compiled
    .filter((entry) => !entry.error && !entry.incomplete)
    .map((entry) => {
      const info = operatorInfo(entry.condition.operator);
      let presentCount = 0;
      let matchCount = 0;
      const samples: string[] = [];

      for (const item of sample) {
        const values = resolvePathValues(item, entry.segments);
        if (values.some((value) => value !== undefined)) {
          presentCount += 1;
          for (const value of values) {
            const text = toText(value);
            if (text && samples.length < 4 && !samples.includes(text)) samples.push(text.slice(0, 40));
          }
        }
        if (matchesCondition(item, entry, config.caseSensitive)) matchCount += 1;
      }

      return {
        path: entry.condition.path,
        label: `${entry.condition.path} ${info.label}${info.needsValue ? ` "${entry.condition.value}"` : ''}`,
        presentCount,
        matchCount,
        samples,
      };
    });
}

/* ------------------------- projection and ordering ------------------------- */

export function projectValue(value: unknown, mode: FieldMode, fields: string[]): unknown {
  if (mode === 'all' || !fields.length) return value;

  if (mode === 'pluck') {
    return resolveFirst(value, fields[0]);
  }

  if (!isPlainObject(value)) return value;

  if (mode === 'include') {
    const output: Record<string, unknown> = {};
    for (const field of fields) {
      const resolved = field.includes('.') || field.includes('[')
        ? resolveFirst(value, field)
        : Object.prototype.hasOwnProperty.call(value, field)
          ? value[field]
          : undefined;
      if (resolved !== undefined) output[field] = resolved;
    }
    return output;
  }

  const excluded = new Set(fields);
  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!excluded.has(key)) output[key] = entry;
  }
  return output;
}

export function sortItems(items: unknown[], path: string, direction: SortDirection): unknown[] {
  if (!path.trim()) return items;

  const decorated = items.map((item, index) => ({ item, index, key: resolveFirst(item, path) }));

  decorated.sort((a, b) => {
    const aMissing = a.key === undefined || a.key === null;
    const bMissing = b.key === undefined || b.key === null;
    if (aMissing && bMissing) return a.index - b.index;
    if (aMissing) return 1; // missing values always sort last
    if (bMissing) return -1;

    const aNumber = toNumber(a.key);
    const bNumber = toNumber(b.key);
    let comparison: number;
    if (aNumber !== null && bNumber !== null) {
      comparison = aNumber - bNumber;
    } else {
      comparison = toText(a.key).localeCompare(toText(b.key));
    }

    if (comparison === 0) return a.index - b.index; // stable
    return direction === 'asc' ? comparison : -comparison;
  });

  return decorated.map((entry) => entry.item);
}

/* -------------------------------- pipeline -------------------------------- */

export function runPipeline(
  source: Source,
  compiled: CompiledCondition[],
  config: QueryConfig,
  options: PipelineOptions
): PipelineResult {
  if (source.kind === 'invalid') {
    return { total: 0, matched: 0, returned: 0, value: null, unit: 'items' };
  }

  if (source.kind === 'object') {
    const matchedEntries = source.entries.filter((entry) => itemMatches(entry, compiled, config));
    const limited =
      options.limit && options.limit > 0 ? matchedEntries.slice(0, options.limit) : matchedEntries;

    if (options.fieldMode === 'pluck' && options.fields.length) {
      const plucked = limited
        .map((entry) => projectValue(entry.value, 'pluck', options.fields))
        .filter((entry) => entry !== undefined);
      return {
        total: source.entries.length,
        matched: matchedEntries.length,
        returned: plucked.length,
        value: plucked,
        unit: 'entries',
      };
    }

    const output: Record<string, unknown> = {};
    for (const entry of limited) {
      output[entry.key] = projectValue(entry.value, options.fieldMode, options.fields);
    }
    return {
      total: source.entries.length,
      matched: matchedEntries.length,
      returned: limited.length,
      value: output,
      unit: 'entries',
    };
  }

  const matched = source.items.filter((item) => itemMatches(item, compiled, config));
  const sorted = sortItems(matched, options.sortPath, options.sortDir);
  const limited = options.limit && options.limit > 0 ? sorted.slice(0, options.limit) : sorted;

  let value: unknown[];
  if (options.fieldMode === 'pluck' && options.fields.length) {
    value = limited
      .map((item) => projectValue(item, 'pluck', options.fields))
      .filter((item) => item !== undefined);
  } else {
    value = limited.map((item) => projectValue(item, options.fieldMode, options.fields));
  }

  return {
    total: source.items.length,
    matched: matched.length,
    returned: value.length,
    value,
    unit: 'items',
  };
}

/* ------------------------------ serialising ------------------------------ */

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) output[key] = sortDeep(value[key]);
    return output;
  }
  return value;
}

export function serialize(
  value: unknown,
  options: { indent: Indent; minify: boolean; sortKeys: boolean }
): string {
  const prepared = options.sortKeys ? sortDeep(value) : value;
  if (options.minify) return JSON.stringify(prepared) ?? '';
  const indent = options.indent === 'tab' ? '\t' : options.indent;
  return JSON.stringify(prepared, null, indent) ?? '';
}

/* -------------------------------- parsing -------------------------------- */

class ScanError {
  constructor(
    public offset: number,
    public message: string
  ) {}
}

/**
 * Locates the first syntax fault ourselves.
 *
 * Engines are inconsistent here — V8 used to append "at position N", newer
 * versions emit a quoted snippet instead, and Firefox reports line/column — so
 * scraping the message is unreliable. This only runs after `JSON.parse` has
 * already failed, and returns null if it disagrees, in which case the caller
 * falls back to the engine's own message.
 */
function locateJsonError(text: string): ScanError | null {
  const length = text.length;
  let index = 0;

  const isDigit = (char: string | undefined) => char !== undefined && char >= '0' && char <= '9';
  const fail = (message: string, at = index): never => {
    throw new ScanError(Math.min(at, Math.max(0, length - 1)), message);
  };

  const skipWhitespace = () => {
    while (index < length) {
      const char = text[index];
      if (char === ' ' || char === '\n' || char === '\r' || char === '\t') index += 1;
      else break;
    }
  };

  const scanString = () => {
    index += 1; // opening quote
    while (index < length) {
      const char = text[index];
      if (char === '\\') {
        const escape = text[index + 1];
        if (escape === undefined) fail('The string ends in an unfinished escape.');
        if (!'"\\/bfnrtu'.includes(escape)) fail(`"\\${escape}" is not a valid string escape.`, index);
        if (escape === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(index + 2, index + 6))) {
            fail('A \\u escape needs four hex digits.', index);
          }
          index += 6;
          continue;
        }
        index += 2;
        continue;
      }
      if (char === '"') {
        index += 1;
        return;
      }
      if (char === '\n') fail('This string is not closed — strings cannot span lines.', index);
      index += 1;
    }
    fail('This string is never closed.');
  };

  const scanNumber = () => {
    const start = index;
    if (text[index] === '-') index += 1;
    if (text[index] === '0') index += 1;
    else if (isDigit(text[index])) while (isDigit(text[index])) index += 1;
    else fail('Expected a digit here.', start);

    if (text[index] === '.') {
      index += 1;
      if (!isDigit(text[index])) fail('Expected a digit after the decimal point.');
      while (isDigit(text[index])) index += 1;
    }
    if (text[index] === 'e' || text[index] === 'E') {
      index += 1;
      if (text[index] === '+' || text[index] === '-') index += 1;
      if (!isDigit(text[index])) fail('Expected a digit in the exponent.');
      while (isDigit(text[index])) index += 1;
    }
  };

  const scanValue = (depth: number): void => {
    if (depth > 400) fail('This JSON is nested too deeply.');
    skipWhitespace();
    if (index >= length) fail('The JSON ends before this value is complete.');

    const char = text[index];
    if (char === '{') {
      index += 1;
      scanObject(depth);
      return;
    }
    if (char === '[') {
      index += 1;
      scanArray(depth);
      return;
    }
    if (char === '"') {
      scanString();
      return;
    }
    if (char === '-' || isDigit(char)) {
      scanNumber();
      return;
    }
    for (const literal of ['true', 'false', 'null']) {
      if (text.startsWith(literal, index)) {
        index += literal.length;
        return;
      }
    }
    fail(`Unexpected ${JSON.stringify(char)} where a value was expected.`);
  };

  const scanObject = (depth: number) => {
    skipWhitespace();
    if (text[index] === '}') {
      index += 1;
      return;
    }
    for (;;) {
      skipWhitespace();
      if (text[index] !== '"') fail('Expected a quoted property name.');
      scanString();
      skipWhitespace();
      if (text[index] !== ':') fail('Expected ":" after the property name.');
      index += 1;
      scanValue(depth + 1);
      skipWhitespace();
      if (text[index] === ',') {
        index += 1;
        skipWhitespace();
        if (text[index] === '}') fail('Trailing comma before "}".');
        continue;
      }
      if (text[index] === '}') {
        index += 1;
        return;
      }
      fail('Expected "," or "}" here.');
    }
  };

  const scanArray = (depth: number) => {
    skipWhitespace();
    if (text[index] === ']') {
      index += 1;
      return;
    }
    for (;;) {
      scanValue(depth + 1);
      skipWhitespace();
      if (text[index] === ',') {
        index += 1;
        skipWhitespace();
        if (text[index] === ']') fail('Trailing comma before "]".');
        continue;
      }
      if (text[index] === ']') {
        index += 1;
        return;
      }
      fail('Expected "," or "]" here.');
    }
  };

  try {
    scanValue(0);
    skipWhitespace();
    if (index < length) fail('Unexpected content after the end of the JSON value.');
    return null;
  } catch (error) {
    return error instanceof ScanError ? error : null;
  }
}

function cleanEngineMessage(raw: string): string {
  return raw
    .replace(/\s*in JSON at position[\s\S]*$/, '')
    .replace(/,\s*(?:\.\.\.)?"[\s\S]*$/, '')
    .trim();
}

export function parseJson(text: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    const raw = error instanceof Error ? error.message : 'Invalid JSON';
    const located = locateJsonError(text);
    const failure: ParseFailure = {
      message: located ? located.message : cleanEngineMessage(raw) || 'Invalid JSON',
    };

    let offset: number | null = located ? located.offset : null;
    if (offset === null) {
      const position = /position (\d+)/.exec(raw);
      if (position) offset = Number(position[1]);
    }

    if (offset !== null) {
      const clamped = Math.max(0, Math.min(offset, Math.max(0, text.length - 1)));
      const before = text.slice(0, clamped);
      const line = before.split('\n').length;
      const column = clamped - before.lastIndexOf('\n');
      const lineText = (text.split('\n')[line - 1] ?? '').slice(0, 160);
      const gutter = String(line);

      failure.line = line;
      failure.column = column;
      failure.excerpt = `${gutter} | ${lineText}\n${' '.repeat(gutter.length)} | ${' '.repeat(
        Math.max(0, Math.min(column, lineText.length + 1) - 1)
      )}^`;
    }

    return { ok: false, failure };
  }
}

/* --------------------------------- misc --------------------------------- */

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export function parseFieldList(value: string): string[] {
  return value
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);
}
