// p22-baseline-manifest-defects.test.mjs
//
// RED BY DESIGN -- this file is EXPECTED TO FAIL until eval/lz-eval-baseline-manifest.mjs is fixed.
//
// It lives in eval/__known-defects__/ and NOT in eval/*.test.mjs deliberately: the phase gate
// ("every eval/*.test.mjs green, FILE-form") must keep reporting the true state of the SHIPPED
// contract, and a knowingly-red file inside that glob would either be silenced or would mask a real
// regression. Run it explicitly:
//
//   node --test eval/__known-defects__/p22-baseline-manifest-defects.test.mjs
//
// Provenance: authored by gsd-nyquist-auditor for Phase 22 validation, reproducing the two defects
// found by the 2026-09-05 security audit (22-SECURITY.md T-22-06 / F3 / F4). Both defects sit in
// modules whose co-tests are GREEN -- i.e. the existing tests do not discriminate. These two do.
//
// DEFECT 1 (22-SECURITY.md T-22-06, lz-eval-baseline-manifest.mjs:91-98)
//   extractSystemInit reads `event.version`, but a real Claude Code system/init event carries
//   `claude_code_version`. Verified against both real captures under eval/.cache/p22-baseline/:
//   the streams carry `claude_code_version: 2.1.186` and extraction throws
//   "system/init event has no CC version". Consequence: NO MANIFEST can ever be produced from a real
//   capture, which is the mechanical cause of 22-VERIFICATION.md gap SC1.
//
// DEFECT 2 (22-SECURITY.md F4, lz-eval-baseline-manifest.mjs:185-190)
//   validateManifest checks the report with existsSync ONLY, while eval/lz-eval-parity-driver.md:127
//   documents the gate as "non-empty report + system/init model + cost". A zero-byte report.md
//   therefore validates, and a background-wait-truncated capture (T-22-13) can be graded as complete.
//
// Fixing the implementation is OUT OF SCOPE for the auditor; both defects are ESCALATED.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { extractSystemInit, buildManifest, validateManifest } from '../lz-eval-baseline-manifest.mjs';

// The real system/init key set, reduced to the fields the extractor reads. Shape confirmed against
// eval/.cache/p22-baseline/{builtin,lz}/qB1-run1.stream.jsonl (both carry claude_code_version, and
// neither carries `version`).
const REAL_INIT_LINE = JSON.stringify({
  type: 'system',
  subtype: 'init',
  cwd: '/repo',
  session_id: 'a-session',
  model: 'claude-opus-4-8',
  permissionMode: 'auto',
  claude_code_version: '2.1.186',
  plugins: [],
});

test('DEFECT 1 -- extractSystemInit pins the CC version from a REAL system/init event (claude_code_version)', () => {
  const info = extractSystemInit(REAL_INIT_LINE + '\n');

  assert.equal(info.model, 'claude-opus-4-8');
  assert.equal(
    info.ccVersion,
    '2.1.186',
    'the real system/init carries claude_code_version, not version -- an unpinnable run means no MANIFEST can ever be built (D-15/D-16, T-22-06)',
  );
});

test('DEFECT 1 (live) -- the on-disk Phase-22 captures can be pinned', (t) => {
  const captures = [
    'eval/.cache/p22-baseline/builtin/qB1-run1.stream.jsonl',
    'eval/.cache/p22-baseline/lz/qB1-run1.stream.jsonl',
  ].filter((p) => fs.existsSync(p));

  if (captures.length === 0) {
    // The run dir is gitignored; on a fresh clone there is nothing to assert against.
    t.skip('no captured stream-json under eval/.cache/p22-baseline/ (gitignored run dir)');

    return;
  }

  for (const capture of captures) {
    const info = extractSystemInit(fs.readFileSync(capture, 'utf8'));

    assert.match(info.ccVersion, /^\d+\.\d+\.\d+/, 'expected a real CC version pin from ' + capture);
  }
});

test('DEFECT 2 -- validateManifest rejects a zero-byte report.md (driver: "non-empty report")', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p22-manifest-'));
  const reportPath = path.join(dir, 'report.md');

  fs.writeFileSync(reportPath, '');

  const manifest = buildManifest({
    system: { model: 'claude-opus-4-8', ccVersion: '2.1.186', plugins: [] },
    reportPath,
    costUsd: 1.23,
    workflowSurface: 'built-in /deep-research, closed-source',
    question: 'qB1',
    qid: 'qB1',
    runK: 1,
  });

  try {
    assert.throws(
      () => validateManifest(manifest),
      /report/i,
      'a truncated capture that wrote a zero-byte report.md must FAIL CLOSED (lz-eval-parity-driver.md:127, T-22-13)',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('DEFECT 2 control -- a NON-empty report.md still validates (the guard must not over-reject)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p22-manifest-'));
  const reportPath = path.join(dir, 'report.md');

  fs.writeFileSync(reportPath, '# Report\n\nSubstantive findings.\n');

  const manifest = buildManifest({
    system: { model: 'claude-opus-4-8', ccVersion: '2.1.186', plugins: [] },
    reportPath,
    costUsd: 1.23,
    workflowSurface: 'lz-advisor:lz-deep-research',
    question: 'qB1',
    qid: 'qB1',
    runK: 1,
  });

  try {
    assert.equal(validateManifest(manifest), true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
