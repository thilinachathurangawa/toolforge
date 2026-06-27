'use strict';

var major = parseInt(process.versions.node.split('.')[0], 10);
var min = 18;

if (major < min) {
  console.error('');
  console.error('ToolForge requires Node.js ' + min + ' or newer.');
  console.error('Current version: ' + process.version);
  console.error('');
  console.error('Install Node 20 LTS from https://nodejs.org/ or run:');
  console.error('  nvm install 20 && nvm use 20');
  console.error('');
  process.exit(1);
}

// Copy pdf.worker.min.mjs to public/ so it's served as a static asset.
// This avoids webpack bundling the file through Terser (which chokes on import.meta).
var fs = require('fs');
var path = require('path');

var src = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
var dest = path.join(__dirname, '..', 'public', 'pdf.worker.min.mjs');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
}
