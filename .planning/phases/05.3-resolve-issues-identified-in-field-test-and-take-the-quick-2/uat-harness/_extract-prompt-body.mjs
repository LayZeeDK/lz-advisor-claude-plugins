#!/usr/bin/env node
// Extract the Compodoc scenario prompt body from compodoc-scenario-prompt.md
// and write it to a destination file. Used by the Phase 5.3 validation run.
//
// Usage: node _extract-prompt-body.mjs <scenario.md> <dest.md>

import { readFileSync, writeFileSync } from 'node:fs';

const scenarioPath = process.argv[2];
const destPath = process.argv[3];

if (!scenarioPath || !destPath) {
  process.stderr.write('usage: node _extract-prompt-body.mjs <scenario.md> <dest.md>\n');
  process.exit(2);
}

const content = readFileSync(scenarioPath, 'utf8');
const startIdx = content.indexOf('Set up Compodoc integration');
const endNeedle = 'installed version.';
const endIdx = content.indexOf(endNeedle, startIdx);

if (startIdx < 0 || endIdx < 0) {
  process.stderr.write('[extract] could not find prompt body boundaries\n');
  process.exit(1);
}

const afterEnd = content.indexOf('\n', endIdx + endNeedle.length);
const body = content.slice(startIdx, afterEnd > 0 ? afterEnd : content.length).trim();

writeFileSync(destPath, body);
process.stdout.write(`[extract] wrote ${body.length} bytes to ${destPath}\n`);
