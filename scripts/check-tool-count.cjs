#!/usr/bin/env node
// Fails the build if the TOOLS registry drops below MIN_TOOLS.
// Run: node scripts/check-tool-count.cjs
// Wired into prebuild via package.json.

const fs = require('fs');
const path = require('path');

const MIN_TOOLS = 206;

const src = fs.readFileSync(
  path.join(__dirname, '../src/lib/constants/tools.ts'),
  'utf8'
);

// Count `  slug:` lines (leading whitespace + slug:) — one per tool entry.
const count = (src.match(/^\s+slug:\s*'/gm) || []).length;

console.log(`[check-tool-count] Registry has ${count} tools (minimum: ${MIN_TOOLS})`);

if (count < MIN_TOOLS) {
  console.error(
    `\nERROR: Tool count dropped from ${MIN_TOOLS} to ${count}.\n` +
    `  • Did you accidentally delete tools from src/lib/constants/tools.ts?\n` +
    `  • If you intentionally reduced the count, update MIN_TOOLS in scripts/check-tool-count.cjs.\n`
  );
  process.exit(1);
}
