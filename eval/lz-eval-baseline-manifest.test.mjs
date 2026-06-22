// lz-eval-baseline-manifest.test.mjs
//
// Validation fixture for the OFF-MODEL baseline-capture MANIFEST writer/validator (Plan 22-02, Task 3;
// PAR-03 / D-15 / D-16). Dev-only eval-tree test: imports the SCRIPT under test + node stdlib only. The
// module mirrors loadManifest's fail-closed ContractError discipline; this test asserts the
// extract/build/validate BEHAVIOR + the fail-closed guards, never any model/network path (there is
// none -- the capture itself is the session spend in Plan 22-05).
//
// Asserts the PAR-03 / D-15 / D-16 load-bearing behaviors (each a DISTINCT named test, never a
// tautology):
//   - extractSystemInit parses the FIRST system/init event from a stream-json capture and returns
//     { ccVersion, model, plugins }; a missing model line is a ContractError (fail-closed -- an
//     unpinned run cannot be graded).
//   - buildManifest pins the CC version + model, the report path, the per-run cost, the workflow
//     surface, and the question id + run index.
//   - validateManifest fails CLOSED on a missing model / missing report / missing cost (each a
//     distinct ContractError message).
//   - validateManifest accepts a BUILT-IN run and an lz run symmetrically (both pin a version + model).
//
// DISCRIMINATION (the invert-the-fix proof, required by the plan):
//   - validateManifest would WRONGLY accept a manifest with no system/init model if the fail-closed
//     guard were removed (invert-the-fix proof).
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-baseline-manifest.test.mjs
// The directory form spuriously exits 1 on this host even when every real test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  buildManifest,
  extractSystemInit,
  validateManifest,
} from './lz-eval-baseline-manifest.mjs';

// A realistic stream-json capture: one JSON object per line. The FIRST event is the system/init line
// carrying model + the CC version + the loaded plugins; subsequent lines are assistant / result events.
function streamWithInit({ model = 'claude-opus-4-8', version = '2.1.185' } = {}) {
  const lines = [
    JSON.stringify({
      type: 'system',
      subtype: 'init',
      model,
      version,
      tools: ['WebSearch', 'WebFetch'],
      plugins: ['lz-advisor@lz-advisor-claude-plugins'],
    }),
    JSON.stringify({ type: 'assistant', message: { content: 'working' } }),
    JSON.stringify({ type: 'result', subtype: 'success', total_cost_usd: 1.23 }),
  ];

  return lines.join('\n') + '\n';
}

// A stream-json capture whose system/init event is present but carries NO model (the truncated /
// malformed capture; RESEARCH Pitfall 4).
function streamMissingModel() {
  const lines = [
    JSON.stringify({ type: 'system', subtype: 'init', version: '2.1.185', tools: ['WebSearch'], plugins: [] }),
    JSON.stringify({ type: 'result', subtype: 'success', total_cost_usd: 1.0 }),
  ];

  return lines.join('\n') + '\n';
}

// A temp report.md so validateManifest's existence check has a real file to find.
function withTempReport(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-manifest-'));
  const reportPath = path.join(dir, 'report.md');
  fs.writeFileSync(reportPath, '# Synthetic report\n', 'utf8');

  try {
    return fn(reportPath, dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// extractSystemInit: parse the FIRST system/init event; fail closed on a missing model.
// ---------------------------------------------------------------------------

test('extractSystemInit: parses the first system/init event -> { ccVersion, model, plugins }', () => {
  const info = extractSystemInit(streamWithInit());
  assert.equal(info.model, 'claude-opus-4-8');
  assert.equal(info.ccVersion, '2.1.185');
  assert.deepEqual(info.plugins, ['lz-advisor@lz-advisor-claude-plugins']);
});

test('extractSystemInit: a missing model line is a ContractError (fail-closed; an unpinned run cannot be graded)', () => {
  assert.throws(() => extractSystemInit(streamMissingModel()), ContractError);
});

test('extractSystemInit: an empty / no-init stream is a ContractError', () => {
  assert.throws(() => extractSystemInit(''), ContractError);
  assert.throws(
    () => extractSystemInit(JSON.stringify({ type: 'assistant', message: {} }) + '\n'),
    ContractError,
  );
});

test('extractSystemInit: tolerates blank lines and reads the FIRST init even with leading noise', () => {
  const stream = '\n' + streamWithInit() + JSON.stringify({ type: 'system', subtype: 'init', model: 'other' }) + '\n';
  const info = extractSystemInit(stream);
  assert.equal(info.model, 'claude-opus-4-8', 'the FIRST init event wins, not a later one');
});

// ---------------------------------------------------------------------------
// buildManifest: pin CC version + model + report + cost + surface + qid + runK.
// ---------------------------------------------------------------------------

test('buildManifest: pins the CC version + model + report path + per-run cost + surface + qid + runK', () => {
  const system = extractSystemInit(streamWithInit());
  const manifest = buildManifest({
    system,
    reportPath: 'eval/.cache/p22-baseline/builtin/q1-run1.report.md',
    costUsd: 1.23,
    workflowSurface: 'built-in /deep-research, closed-source',
    question: 'What is the current state of X?',
    qid: 'q1',
    runK: 1,
  });

  assert.equal(manifest.ccVersion, '2.1.185');
  assert.equal(manifest.model, 'claude-opus-4-8');
  assert.equal(manifest.reportPath, 'eval/.cache/p22-baseline/builtin/q1-run1.report.md');
  assert.equal(manifest.costUsd, 1.23);
  assert.equal(manifest.workflowSurface, 'built-in /deep-research, closed-source');
  assert.equal(manifest.qid, 'q1');
  assert.equal(manifest.runK, 1);
});

// ---------------------------------------------------------------------------
// validateManifest: fail closed on a missing model / report / cost.
// ---------------------------------------------------------------------------

test('validateManifest: accepts a complete built-in manifest (the report exists)', () => {
  withTempReport((reportPath) => {
    const system = extractSystemInit(streamWithInit());
    const manifest = buildManifest({
      system,
      reportPath,
      costUsd: 2.5,
      workflowSurface: 'built-in /deep-research, closed-source',
      question: 'Q',
      qid: 'q1',
      runK: 1,
    });
    // Must not throw.
    assert.equal(validateManifest(manifest), true);
  });
});

test('validateManifest: accepts an lz-advisor manifest symmetrically (both surfaces pin a version + model)', () => {
  withTempReport((reportPath) => {
    const system = extractSystemInit(streamWithInit());
    const manifest = buildManifest({
      system,
      reportPath,
      costUsd: 3.1,
      workflowSurface: 'lz-advisor:lz-deep-research',
      question: 'Q',
      qid: 'q1',
      runK: 2,
    });
    assert.equal(validateManifest(manifest), true);
  });
});

test('validateManifest: a missing model fails closed (distinct ContractError)', () => {
  withTempReport((reportPath) => {
    const system = extractSystemInit(streamWithInit());
    const manifest = buildManifest({
      system,
      reportPath,
      costUsd: 1.0,
      workflowSurface: 'built-in /deep-research, closed-source',
      question: 'Q',
      qid: 'q1',
      runK: 1,
    });
    delete manifest.model;
    assert.throws(() => validateManifest(manifest), /model/i);
  });
});

test('validateManifest: a non-existent report fails closed (distinct ContractError)', () => {
  const system = extractSystemInit(streamWithInit());
  const manifest = buildManifest({
    system,
    reportPath: path.join(os.tmpdir(), 'does-not-exist-lz-eval', 'report.md'),
    costUsd: 1.0,
    workflowSurface: 'built-in /deep-research, closed-source',
    question: 'Q',
    qid: 'q1',
    runK: 1,
  });
  assert.throws(() => validateManifest(manifest), /report/i);
});

test('validateManifest: a missing cost fails closed (distinct ContractError)', () => {
  withTempReport((reportPath) => {
    const system = extractSystemInit(streamWithInit());
    const manifest = buildManifest({
      system,
      reportPath,
      costUsd: 1.0,
      workflowSurface: 'built-in /deep-research, closed-source',
      question: 'Q',
      qid: 'q1',
      runK: 1,
    });
    delete manifest.costUsd;
    assert.throws(() => validateManifest(manifest), /cost/i);
  });
});

// ---------------------------------------------------------------------------
// DISCRIMINATION: the fail-closed model guard is load-bearing.
// ---------------------------------------------------------------------------

test('validateManifest: a manifest with no model is REJECTED -- the fail-closed guard is load-bearing (invert-the-fix)', () => {
  // DISCRIMINATION: a truncated/empty headless capture yields a manifest with no system/init model.
  // validateManifest MUST reject it (an unpinned CC-version+model run cannot be graded, D-15/D-16). If
  // the fail-closed model guard were removed, validateManifest would WRONGLY return true. This test
  // asserts the rejection; with the guard removed it FAILS (validateManifest would not throw).
  withTempReport((reportPath) => {
    const system = extractSystemInit(streamWithInit());
    const manifest = buildManifest({
      system,
      reportPath,
      costUsd: 1.0,
      workflowSurface: 'built-in /deep-research, closed-source',
      question: 'Q',
      qid: 'q1',
      runK: 1,
    });
    manifest.model = '';
    assert.throws(() => validateManifest(manifest), ContractError, 'an empty model must fail closed');
  });
});
