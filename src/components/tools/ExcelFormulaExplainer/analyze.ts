import { parseFormula } from './parser';
import {
  buildCompatibility,
  buildNarrative,
  buildSteps,
  buildTree,
  collectOperators,
  inventoryFunctions,
  summarizeReferences,
} from './explain';
import { diagnose, suggestRewrites } from './diagnose';
import type { Diagnostic, ExplainResult, ExplainedNode } from './types';

/** Errors first, then warnings, then notes; each group in source order. */
const SEVERITY_ORDER: Record<Diagnostic['severity'], number> = { error: 0, warning: 1, info: 2 };

function sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  return [...diagnostics].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.start - b.start
  );
}

/**
 * Parses a formula and produces everything the UI renders. Nothing here touches
 * the network — the formula text never leaves the browser.
 */
export function analyzeFormula(input: string): ExplainResult | null {
  const formula = input.trim();
  if (!formula) return null;

  const { ast, diagnostics: parseDiagnostics, separator } = parseFormula(formula);
  const inventory = inventoryFunctions(ast);
  const tree = buildTree(formula, ast);

  const hasFatalError = parseDiagnostics.some((d) => d.severity === 'error');
  const lint = hasFatalError ? [] : diagnose(formula, ast);

  return {
    formula,
    separator,
    ast,
    narrative: buildNarrative(formula, ast),
    tree: tree ? [tree] : [],
    steps: buildSteps(formula, ast),
    operators: collectOperators(ast),
    references: summarizeReferences(ast),
    diagnostics: sortDiagnostics([...parseDiagnostics, ...lint]),
    suggestions: hasFatalError ? [] : suggestRewrites(formula, ast),
    compatibility: buildCompatibility(inventory.known),
    unknownFunctions: inventory.unknown,
    functionsUsed: inventory.names,
    maxDepth: inventory.maxDepth,
  };
}

/* ----------------------------------------------------------------- export */

function flattenTree(nodes: ExplainedNode[], depth = 0): Array<{ node: ExplainedNode; depth: number }> {
  const out: Array<{ node: ExplainedNode; depth: number }> = [];
  nodes.forEach((node) => {
    out.push({ node, depth });
    out.push(...flattenTree(node.children, depth + 1));
  });
  return out;
}

export function toPlainText(result: ExplainResult): string {
  const lines: string[] = [];
  lines.push(`Formula: ${result.formula}`, '');

  if (result.narrative) {
    lines.push('IN PLAIN ENGLISH', result.narrative, '');
  }

  if (result.tree.length) {
    lines.push('BREAKDOWN');
    flattenTree(result.tree).forEach(({ node, depth }) => {
      const pad = '  '.repeat(depth);
      lines.push(`${pad}${node.label} (${node.kind})`);
      lines.push(`${pad}  ${node.description}`);
      if (node.syntax) lines.push(`${pad}  Syntax: ${node.syntax}`);
      node.args.forEach((arg) => {
        lines.push(`${pad}  - ${arg.paramName}: ${arg.text} — ${arg.paramDescription}`);
      });
    });
    lines.push('');
  }

  if (result.steps.length > 1) {
    lines.push('EVALUATION ORDER');
    result.steps.forEach((step) => lines.push(`${step.order}. ${step.expression} — ${step.description}`));
    lines.push('');
  }

  if (result.diagnostics.length) {
    lines.push('THINGS TO CHECK');
    result.diagnostics.forEach((d) => lines.push(`[${d.severity}] ${d.message}`));
    lines.push('');
  }

  if (result.suggestions.length) {
    lines.push('MODERNIZE');
    result.suggestions.forEach((s) => {
      lines.push(s.title);
      if (s.formula) lines.push(`  ${s.formula}`);
      lines.push(`  ${s.note}`);
    });
    lines.push('');
  }

  const refLines = describeReferences(result);
  if (refLines.length) {
    lines.push('REFERENCES', ...refLines, '');
  }

  return lines.join('\n').trimEnd();
}

export function toMarkdown(result: ExplainResult): string {
  const lines: string[] = [];
  lines.push('## Formula', '', '```', result.formula, '```', '');

  if (result.narrative) {
    lines.push('## In plain English', '', result.narrative, '');
  }

  if (result.tree.length) {
    lines.push('## Breakdown', '');
    flattenTree(result.tree).forEach(({ node, depth }) => {
      const pad = '  '.repeat(depth);
      lines.push(`${pad}- **${node.label}** — ${node.description}`);
      node.args.forEach((arg) => {
        lines.push(`${pad}  - \`${arg.text}\` → *${arg.paramName}*: ${arg.paramDescription}`);
      });
    });
    lines.push('');
  }

  if (result.steps.length > 1) {
    lines.push('## Evaluation order', '');
    result.steps.forEach((step) => lines.push(`${step.order}. \`${step.expression}\` — ${step.description}`));
    lines.push('');
  }

  if (result.diagnostics.length) {
    lines.push('## Things to check', '');
    result.diagnostics.forEach((d) => lines.push(`- **${d.severity}:** ${d.message}`));
    lines.push('');
  }

  if (result.suggestions.length) {
    lines.push('## Modernize', '');
    result.suggestions.forEach((s) => {
      lines.push(`- **${s.title}**`);
      if (s.formula) lines.push(`  - \`${s.formula}\``);
      lines.push(`  - ${s.note}`);
    });
    lines.push('');
  }

  const refLines = describeReferences(result);
  if (refLines.length) {
    lines.push('## References', '', ...refLines.map((l) => `- ${l}`), '');
  }

  return lines.join('\n').trimEnd();
}

function describeReferences(result: ExplainResult): string[] {
  const { references } = result;
  const lines: string[] = [];
  const listOf = (label: string, items: { raw: string; description: string }[]) => {
    if (!items.length) return;
    lines.push(`${label}: ${items.map((r) => `${r.raw} (${r.description})`).join(', ')}`);
  };
  listOf('Cells', references.cells);
  listOf('Ranges', references.ranges);
  listOf('Whole columns/rows', references.wholeColumnsOrRows);
  listOf('Table references', references.tables);
  listOf('Defined names', references.names);
  if (references.sheets.length) lines.push(`Sheets: ${references.sheets.join(', ')}`);
  if (references.workbooks.length) lines.push(`External workbooks: ${references.workbooks.join(', ')}`);
  if (references.volatileFunctions.length) {
    lines.push(`Volatile functions: ${references.volatileFunctions.join(', ')}`);
  }
  return lines;
}
