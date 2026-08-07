import type { ExcelFunctionDef } from '@/lib/data/excel-functions';

/* ------------------------------------------------------------------ tokens */

export type TokenKind =
  | 'number'
  | 'string'
  | 'boolean'
  | 'errorLiteral'
  | 'ref'
  | 'name'
  | 'func'
  | 'operator'
  | 'separator'
  | 'lparen'
  | 'rparen'
  | 'lbrace'
  | 'rbrace'
  | 'arrayRowSep'
  | 'equals';

export interface Token {
  kind: TokenKind;
  /** Text exactly as it appears in the formula. */
  value: string;
  start: number;
  end: number;
  /** Whitespace preceded this token — Excel's intersection operator. */
  spaceBefore: boolean;
  /** Populated for `ref` tokens. */
  ref?: ReferenceInfo;
}

/* -------------------------------------------------------------- references */

export type RefKind =
  | 'cell'
  | 'range'
  | 'whole-column'
  | 'whole-row'
  | 'table'
  | 'name'
  | 'spill';

export type Anchoring = 'relative' | 'absolute' | 'mixed' | 'none';

export interface ReferenceInfo {
  /** The reference exactly as written, including any sheet or workbook part. */
  raw: string;
  kind: RefKind;
  /** The `A1:B2` part, without sheet or workbook qualifiers. */
  body: string;
  sheet?: string;
  workbook?: string;
  anchoring: Anchoring;
  /** Number of cells covered, when it can be determined. */
  cellCount?: number;
  /** Short plain-English label, e.g. "range of 10 cells, absolute". */
  description: string;
}

/* --------------------------------------------------------------------- AST */

export interface NodeBase {
  start: number;
  end: number;
}

export interface CallNode extends NodeBase {
  type: 'call';
  /** Name as written, e.g. `sum` or `_xlfn.XLOOKUP`. */
  rawName: string;
  /** Canonical uppercase name used for lookups. */
  name: string;
  args: AstNode[];
  /** Byte ranges of each argument, including empty slots. */
  def?: ExcelFunctionDef;
}

export interface BinaryNode extends NodeBase {
  type: 'binary';
  op: string;
  left: AstNode;
  right: AstNode;
}

export interface UnaryNode extends NodeBase {
  type: 'unary';
  op: string;
  operand: AstNode;
}

export interface PostfixNode extends NodeBase {
  type: 'postfix';
  op: '%' | '#';
  operand: AstNode;
}

export interface ParenNode extends NodeBase {
  type: 'paren';
  expression: AstNode;
}

export interface UnionNode extends NodeBase {
  type: 'union';
  items: AstNode[];
}

export interface ArrayNode extends NodeBase {
  type: 'array';
  rows: AstNode[][];
}

export interface RefNode extends NodeBase {
  type: 'ref';
  ref: ReferenceInfo;
}

export interface LiteralNode extends NodeBase {
  type: 'literal';
  kind: 'number' | 'string' | 'boolean' | 'error';
  /** Raw source text, e.g. `"Not found"` with quotes. */
  raw: string;
  /** Display text, e.g. `Not found` without quotes. */
  value: string;
}

/** Emitted where the parser could not build a real node, so rendering survives. */
export interface MissingNode extends NodeBase {
  type: 'missing';
}

export type AstNode =
  | CallNode
  | BinaryNode
  | UnaryNode
  | PostfixNode
  | ParenNode
  | UnionNode
  | ArrayNode
  | RefNode
  | LiteralNode
  | MissingNode;

/* ------------------------------------------------------------- diagnostics */

export type Severity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  severity: Severity;
  /** Stable identifier, useful for tests and for suppressing duplicates. */
  code: string;
  message: string;
  start: number;
  end: number;
}

/* ------------------------------------------------------------- explanation */

export interface ExplainedArgument {
  /** Parameter name from the function definition, e.g. `lookup_value`. */
  paramName: string;
  paramDescription: string;
  optional: boolean;
  /** The argument text exactly as written. */
  text: string;
  node: AstNode;
  /** Present when the argument is itself a function call. */
  child?: ExplainedNode;
}

export interface ExplainedNode {
  /** Node id, unique within one explanation, used for React keys and hover. */
  id: string;
  node: AstNode;
  /** `SUM`, `A1:A10`, `"Not found"`, `*` … whatever heads this node. */
  label: string;
  /** Category for a call; a descriptive kind for everything else. */
  kind: string;
  /** Plain-English description of what this node does. */
  description: string;
  syntax?: string;
  def?: ExcelFunctionDef;
  args: ExplainedArgument[];
  children: ExplainedNode[];
  start: number;
  end: number;
}

export interface EvaluationStep {
  order: number;
  /** The sub-expression exactly as written. */
  expression: string;
  description: string;
  start: number;
  end: number;
}

export interface OperatorNote {
  symbol: string;
  name: string;
  description: string;
}

export interface Rewrite {
  title: string;
  formula?: string;
  note: string;
}

export interface ReferenceSummary {
  cells: ReferenceInfo[];
  ranges: ReferenceInfo[];
  wholeColumnsOrRows: ReferenceInfo[];
  tables: ReferenceInfo[];
  names: ReferenceInfo[];
  sheets: string[];
  workbooks: string[];
  volatileFunctions: string[];
  literalCount: number;
  /** Total cells addressed by all ranges, when computable. */
  totalCells: number;
}

export interface CompatibilityNote {
  functionName: string;
  availability: 'excel' | 'sheets';
  since?: string;
  message: string;
}

export interface ExplainResult {
  formula: string;
  separator: ',' | ';';
  ast: AstNode | null;
  narrative: string;
  tree: ExplainedNode[];
  steps: EvaluationStep[];
  operators: OperatorNote[];
  references: ReferenceSummary;
  diagnostics: Diagnostic[];
  suggestions: Rewrite[];
  compatibility: CompatibilityNote[];
  unknownFunctions: string[];
  /** Distinct known functions, in the order first seen. */
  functionsUsed: string[];
  /** Deepest nesting level reached. */
  maxDepth: number;
}
