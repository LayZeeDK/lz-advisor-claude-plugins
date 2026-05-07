#!/usr/bin/env node
// Extract FAIL agent-text fragments from a regression-gate-*/  3x re-run log.
//
// Each gate log contains 3 run blocks separated by `=== Run N ===` markers.
// Within each block, the fixture's stdout/stderr is captured between
//   `--- Run N output (full) ---` and `--- end Run N output ---`.
// On FAIL, the fixture appends `--- reviewer output (last 200 lines) ---` (or
// `--- security-reviewer output (last 200 lines) ---`) followed by the
// agent's text response.
//
// This script extracts the agent-text segment for each FAIL run and writes
// it to a per-run file so future parser changes can replay against it via
// `bash <fixture>.sh --from-trace <file>`.
//
// Usage:
//   node extract-from-log.mjs <log_path> <out_dir> <prefix>
//
// Example:
//   node extract-from-log.mjs regression-gate-0.13.0/D-reviewer-budget-3x.log \
//        traces/ 0.13.0-strict-D-reviewer-budget

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , logPath, outDir, prefix] = process.argv;

if (!logPath || !outDir || !prefix) {
  console.error('Usage: extract-from-log.mjs <log_path> <out_dir> <prefix>');
  process.exit(64);
}

const text = readFileSync(logPath, 'utf8');
mkdirSync(outDir, { recursive: true });

// Split by `=== Run N ===` boundaries (preserving the marker via lookahead).
const runBlocks = text.split(/(?=^=== Run \d+ ===$)/m).filter(b => b.startsWith('=== Run '));

let extracted = 0;
let skipped = 0;

for (const block of runBlocks) {
  const runNumMatch = block.match(/^=== Run (\d+) ===/);

  if (!runNumMatch) {
    continue;
  }

  const runNum = runNumMatch[1];
  const isFail = /^Run \d+: EXIT (?:[1-9]\d*|non-zero) /m.test(block);

  if (!isFail) {
    skipped++;
    continue;
  }

  // Extract agent text between `--- {reviewer|security-reviewer} output (last 200 lines) ---`
  // and `--- end Run N output ---`.
  const startRe = /^--- (?:security-)?reviewer output \(last 200 lines\) ---$/m;
  // Two end-marker conventions exist:
  //   - Plan 07-17 (regression-gate-0.13.0/): `--- end Run N ---`
  //   - Updated runner (regression-gate-0.13.1+/): `--- end Run N output ---`
  // Accept either.
  const endRe = new RegExp(`^--- end Run ${runNum}(?: output)? ---$`, 'm');

  const startMatch = startRe.exec(block);
  const endMatch = endRe.exec(block);

  if (!startMatch || !endMatch) {
    console.error(`[WARN] Run ${runNum} FAIL but no agent-text fragment found (start=${!!startMatch} end=${!!endMatch}); skipping`);
    skipped++;
    continue;
  }

  const startIdx = startMatch.index + startMatch[0].length + 1;
  const endIdx = endMatch.index;
  const fragment = block.slice(startIdx, endIdx).replace(/^\n+/, '').replace(/\n+$/, '\n');

  const outPath = resolve(outDir, `${prefix}-run-${runNum}.txt`);
  writeFileSync(outPath, fragment);

  console.log(`[OK] Run ${runNum}: extracted ${fragment.length} bytes -> ${outPath}`);
  extracted++;
}

console.log(`[INFO] Done: ${extracted} FAIL fragments extracted, ${skipped} runs skipped (PASS or no-fragment).`);
