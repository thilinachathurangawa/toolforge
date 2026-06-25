#!/usr/bin/env node
/*
 * validate-tool-content.cjs
 * ---------------------------------------------------------------------------
 * Enforces the ToolForge tool-page content standard (see docs/specs/ADDING_A_TOOL.md).
 * Run with:  npm run validate:content
 *
 * HARD failures (exit 1):
 *   - a tool in TOOL_CONTENT whose slug is not in the TOOLS registry
 *   - a related-tool slug that does not exist, or a tool linking to itself
 *   - a missing/empty required section (intro, steps, why, faqs, related)
 *   - fewer than 3 FAQs or fewer than 2 related links
 *
 * WARNINGS (exit 0, but printed):
 *   - a tool page under the ~380-word content floor
 *   - any sentence (>= 6 words) repeated across two or more tools (mail-merge smell)
 *   - a registered tool that has no long-form content entry at all
 */
const fs = require('fs');
const path = require('path');

let ts;
try {
  ts = require(path.join(process.cwd(), 'node_modules/typescript'));
} catch {
  console.error('Could not load the local typescript package. Run from the repo root after `npm install`.');
  process.exit(2);
}

function load(file) {
  const src = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} };
  // Stub relative imports (e.g. the FAQ type) so data-only modules evaluate.
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports;
}

const FLOOR = 380; // target minimum words of prose per tool page

const { TOOLS } = load('src/lib/constants/tools.ts');
const { TOOL_CONTENT } = load('src/lib/content/tool-content.ts');
const slugs = new Set(TOOLS.map((t) => t.slug));

const wc = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const errors = [];
const warnings = [];

// ---- Per-tool structural + accuracy-adjacent checks -----------------------
for (const [slug, c] of Object.entries(TOOL_CONTENT)) {
  if (!slugs.has(slug)) errors.push(`${slug}: not found in the TOOLS registry`);

  for (const field of ['intro', 'steps', 'why', 'faqs', 'related']) {
    if (!Array.isArray(c[field]) || c[field].length === 0) {
      errors.push(`${slug}: missing or empty "${field}"`);
    }
  }
  if (Array.isArray(c.faqs) && c.faqs.length < 3) errors.push(`${slug}: needs at least 3 FAQs (has ${c.faqs.length})`);
  if (Array.isArray(c.related) && c.related.length < 2) errors.push(`${slug}: needs at least 2 related links (has ${c.related.length})`);

  (c.related || []).forEach((r) => {
    if (!slugs.has(r.slug)) errors.push(`${slug}: related slug "${r.slug}" does not exist`);
    if (r.slug === slug) errors.push(`${slug}: links to itself in related`);
    if (!r.note || !r.note.trim()) errors.push(`${slug}: related "${r.slug}" is missing a note`);
  });

  const total =
    (c.intro || []).reduce((a, p) => a + wc(p), 0) +
    (c.steps || []).reduce((a, s) => a + wc(s), 0) +
    (c.why || []).reduce((a, s) => a + wc(s), 0) +
    (c.faqs || []).reduce((a, f) => a + wc(f.question) + wc(f.answer), 0);
  if (total < FLOOR) warnings.push(`${slug}: ${total} words (under the ${FLOOR}-word floor)`);
}

// ---- Cross-tool duplicate-sentence check (anti-templating) ----------------
const seen = {};
for (const [slug, c] of Object.entries(TOOL_CONTENT)) {
  const text = [
    ...(c.intro || []),
    ...(c.why || []),
    ...(c.steps || []),
    ...(c.faqs || []).flatMap((f) => [f.question, f.answer]),
  ].join(' ');
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => wc(s) >= 6)
    .forEach((s) => {
      const k = s.toLowerCase();
      (seen[k] = seen[k] || new Set()).add(slug);
    });
}
Object.entries(seen)
  .filter(([, set]) => set.size > 1)
  .forEach(([sentence, set]) => {
    warnings.push(`duplicate sentence across [${[...set].join(', ')}]: "${sentence.slice(0, 80)}..."`);
  });

// ---- Coverage: registered tools with no content entry ---------------------
const uncovered = TOOLS.filter((t) => !TOOL_CONTENT[t.slug]).map((t) => t.slug);
uncovered.forEach((s) => warnings.push(`${s}: registered tool has no TOOL_CONTENT entry`));

// ---- Report ----------------------------------------------------------------
console.log(`Tools in registry: ${TOOLS.length}`);
console.log(`Tools with long-form content: ${Object.keys(TOOL_CONTENT).length}`);
console.log('');

if (warnings.length) {
  console.log(`WARNINGS (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  console.log('');
}
if (errors.length) {
  console.log(`ERRORS (${errors.length}):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log('\nFAILED — fix the errors above.');
  process.exit(1);
}
console.log('PASSED — content structure is valid.' + (warnings.length ? ' (see warnings above)' : ''));
