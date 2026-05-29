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
