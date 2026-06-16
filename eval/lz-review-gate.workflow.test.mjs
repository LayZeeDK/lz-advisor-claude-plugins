// lz-review-gate.workflow.test.mjs
//
// Anti-drift + structural test for the enhanced review-gate WORKFLOW script
// (eval/lz-review-gate.workflow.mjs). The workflow cannot import the control-logic lib at workflow
// runtime, so it INLINES a copy of the canonical shared block from eval/lz-review-gate-lib.mjs.
// This test guards that the inlined copy matches the canonical (so the unit-tested logic and the
// shipped-in-the-workflow logic can never diverge) -- the same discipline as the lock-rule <->
// EVAL_THRESHOLDS anti-drift test. It also pins the workflow's structural contract (meta block,
// per-agent effort discipline, real reviewer agentType).
//
// HOST QUIRK: gate on the explicit FILE form: node --test eval/lz-review-gate.workflow.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.join(HERE, 'lz-review-gate-lib.mjs');
const WF = path.join(HERE, 'lz-review-gate.workflow.mjs');

const START = 'LZ-REVIEW-GATE-SHARED-START';
const END = 'LZ-REVIEW-GATE-SHARED-END';

// Extract the lines STRICTLY BETWEEN the marker lines (exclusive), normalizing only trailing
// whitespace per line + leading/trailing blank lines. Internal content and middle blank-line
// structure are preserved, so any real code drift still fails.
function extractSharedBlock(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => l.includes(START));
  const endIdx = lines.findIndex((l) => l.includes(END));
  assert.ok(startIdx >= 0, `${file}: missing ${START} marker`);
  assert.ok(endIdx > startIdx, `${file}: missing or misordered ${END} marker`);
  const between = lines.slice(startIdx + 1, endIdx).map((l) => l.replace(/\s+$/, ''));

  while (between.length > 0 && between[0] === '') {
    between.shift();
  }

  while (between.length > 0 && between[between.length - 1] === '') {
    between.pop();
  }

  return between.join('\n');
}

test('anti-drift: workflow inlined shared block matches the lib canonical block', () => {
  const libBlock = extractSharedBlock(LIB);
  const wfBlock = extractSharedBlock(WF);
  assert.ok(libBlock.length > 200, 'lib shared block unexpectedly small -- markers wrong?');
  assert.equal(wfBlock, libBlock);
});

test('anti-drift: shared block defines all canonical control functions', () => {
  const libBlock = extractSharedBlock(LIB);
  const fns = [
    'parseReviewerSentinel',
    'missedIsNone',
    'isConverged',
    'nextRequests',
    'groupSlug',
    'computeRemainingGroups',
    'hasNullStage',
    'dedupeFindingLines',
  ];

  for (const fn of fns) {
    assert.match(libBlock, new RegExp(`function ${fn}\\(`), `missing function ${fn} in shared block`);
  }
});

test('workflow structural contract: meta + effort discipline + real reviewer agentType', () => {
  const text = fs.readFileSync(WF, 'utf8');
  assert.match(text, /export const meta = \{/);
  assert.match(text, /name: 'lz-review-gate'/);
  // executor + synth at medium, reviewer at high; NEVER xhigh (xhigh provokes extra tool uses that
  // burn the reviewer's maxTurns 3 and re-trigger the empty-output failure).
  assert.match(text, /effort: 'medium'/);
  assert.match(text, /effort: 'high'/);
  assert.ok(!/effort:\s*'xhigh'/.test(text), 'reviewer effort must be high, not xhigh (protects maxTurns 3)');
  // the Opus reviewer is the REAL plugin agent (frontmatter model: opus applies), not a generic opus agent
  assert.match(text, /agentType: 'lz-advisor:reviewer'/);
  // sibling-agent design: executor/synth forced onto sonnet
  assert.match(text, /model: 'sonnet'/);
});

test('both shared-logic source files are strictly ASCII', () => {
  for (const f of [LIB, WF]) {
    const buf = fs.readFileSync(f);

    for (let i = 0; i < buf.length; i += 1) {
      assert.ok(buf[i] <= 0x7f, `${f}: non-ASCII byte 0x${buf[i].toString(16)} at offset ${i}`);
    }
  }
});
