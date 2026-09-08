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
// EXTENDED (Plan 23-01, Tasks 1-2; NO-SPEND) with the ENV-02 Stage-0 behaviors:
//   - extractSystemInit pins the CC version from a REAL system/init event, which carries
//     `claude_code_version` and NOT `version` (D-11, confirmed empirically against both q1 captures).
//   - a TRUNCATED final result line is a ContractError, never a promotion of the earlier
//     under-reporting result event (23-REVIEW.md CR-06), while garbage in the MIDDLE is still skipped.
//   - extractTerminalCost reads the per-run cost from the LAST type=result event of a capture stream
//     (D-22: that terminal event's total_cost_usd IS the resolved per-run cost source).
//   - aggregateRunCost sums extractTerminalCost over a CALLER-ENUMERATED stream list (T-23-12: the
//     enumeration is never discovered from the filesystem).
//   - validateManifest rejects a zero-byte report.md (Phase-22 validation defect B2 / security F4).
//
// DISCRIMINATION (the invert-the-fix proofs, required by the plan):
//   - validateManifest would WRONGLY accept a manifest with no system/init model if the fail-closed
//     guard were removed (invert-the-fix proof).
//   - extractTerminalCost over the REAL built-in q1 cold stream returns 48.5367785 and NOT
//     0.7800860000000001 -- that stream carries TWO result events, and a first-result-event
//     implementation would return the smaller figure. The not-equal assertion is what discriminates.
//   - aggregateRunCost over the built-in q1 chain returns 67.085261 and NOT 114.166644 -- the latter
//     is what folding the different-session broad-partial stream in would produce.
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-baseline-manifest.test.mjs
// The directory form spuriously exits 1 on this host even when every real test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  aggregateRunCost,
  buildManifest,
  extractSystemInit,
  extractTerminalCost,
  validateManifest,
} from './lz-eval-baseline-manifest.mjs';

// Resolve the gitignored capture cache test-file-relative (NEVER process.cwd() -- cwd drifts under GSD
// worktrees and headless `claude -p`). HERE is the repo-level eval/ dir.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, '.cache', 'p22-baseline');

const CAPTURE = Object.freeze({
  BUILTIN_COLD: path.join(CACHE, 'builtin', 'qB1-run1.stream.jsonl'),
  BUILTIN_RESUME2: path.join(CACHE, 'builtin', 'qB1-run1.resume2.stream.jsonl'),
  BUILTIN_RESUME3: path.join(CACHE, 'builtin', 'qB1-run1.resume3.stream.jsonl'),
  BUILTIN_BROAD_PARTIAL: path.join(CACHE, 'builtin', 'qB1-run1.broad-partial-2026-06-22.stream.jsonl'),
  BUILTIN_REPORT: path.join(CACHE, 'builtin', 'qB1-run1.report.md'),
  LZ_COLD: path.join(CACHE, 'lz', 'qB1-run1.stream.jsonl'),
  LZ_RESUME: path.join(CACHE, 'lz', 'qB1-run1.resume.stream.jsonl'),
  LZ_REPORT: path.join(CACHE, 'lz', 'qB1-run1.report.md'),
});

// eval/.cache/ is gitignored and absent on a fresh clone -- every real-capture case skips rather than
// fabricating a fixture (T-23-06).
function readCaptures(t, paths) {
  const missing = paths.filter((p) => !fs.existsSync(p));

  if (missing.length > 0) {
    t.skip('gitignored capture absent: ' + missing.map((p) => path.basename(p)).join(', '));

    return null;
  }

  return paths.map((p) => fs.readFileSync(p, 'utf8'));
}

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

// ---------------------------------------------------------------------------
// Plan 23-01 Task 1 -- D-11: the REAL system/init field is `claude_code_version`.
// ---------------------------------------------------------------------------

test('D-11: extractSystemInit pins ccVersion from the REAL on-disk lz q1 capture (claude_code_version)', (t) => {
  const texts = readCaptures(t, [CAPTURE.LZ_COLD]);

  if (texts === null) {
    return;
  }

  const info = extractSystemInit(texts[0]);

  assert.equal(
    info.ccVersion,
    '2.1.186',
    'the real system/init carries claude_code_version, not version -- reading only `version` throws here (T-22-06 / validation B1)',
  );
  // The lz surface runs the Sonnet executor by design (the advisor strategy), so this capture pins
  // claude-sonnet-4-6[1m] -- NOT the built-in surface's claude-opus-4-8.
  assert.equal(info.model, 'claude-sonnet-4-6[1m]');
});

test('D-11: extractSystemInit PREFERS claude_code_version when an event carries both fields', () => {
  const stream =
    JSON.stringify({
      type: 'system',
      subtype: 'init',
      model: 'claude-opus-4-8',
      claude_code_version: '2.1.186',
      version: '2.1.185',
      plugins: [],
    }) + '\n';

  assert.equal(extractSystemInit(stream).ccVersion, '2.1.186');
});

test('D-11: extractSystemInit still throws with "CC version" when NEITHER field is present', () => {
  const stream = JSON.stringify({ type: 'system', subtype: 'init', model: 'claude-opus-4-8' }) + '\n';

  assert.throws(() => extractSystemInit(stream), ContractError);
  assert.throws(() => extractSystemInit(stream), /CC version/);
});

// ---------------------------------------------------------------------------
// Plan 23-01 Task 1 -- D-22: the per-run cost source is the LAST type=result event.
// ---------------------------------------------------------------------------

test('D-22: extractTerminalCost reads the LAST result event of the real built-in q1 cold stream (48.5367785, NOT 0.7800860000000001)', (t) => {
  const texts = readCaptures(t, [CAPTURE.BUILTIN_COLD]);

  if (texts === null) {
    return;
  }

  const cost = extractTerminalCost(texts[0]);

  assert.equal(cost, 48.5367785);
  // DISCRIMINATION: that stream carries TWO result events. A first-result-event implementation would
  // return 0.7800860000000001 -- a fraction of the run's real cost.
  assert.notEqual(
    cost,
    0.7800860000000001,
    'the FIRST result event is not the terminal one -- LAST-wins is the whole point of the rule',
  );
});

test('D-22: extractTerminalCost reads the real lz q1 cold stream terminal cost (8.927337350000004)', (t) => {
  const texts = readCaptures(t, [CAPTURE.LZ_COLD]);

  if (texts === null) {
    return;
  }

  assert.equal(extractTerminalCost(texts[0]), 8.927337350000004);
});

test('D-22: extractTerminalCost throws a ContractError when the stream carries NO result event', () => {
  const stream = JSON.stringify({ type: 'system', subtype: 'init', model: 'm', claude_code_version: '1.2.3' }) + '\n';

  assert.throws(() => extractTerminalCost(stream), ContractError);
  assert.throws(() => extractTerminalCost(''), ContractError);
});

test('D-22: extractTerminalCost throws when the terminal result event has no finite total_cost_usd (no default is substituted)', () => {
  const absent = JSON.stringify({ type: 'result', subtype: 'success' }) + '\n';
  const nonFinite = JSON.stringify({ type: 'result', subtype: 'success', total_cost_usd: null }) + '\n';
  const negative = JSON.stringify({ type: 'result', subtype: 'success', total_cost_usd: -1 }) + '\n';

  assert.throws(() => extractTerminalCost(absent), ContractError);
  assert.throws(() => extractTerminalCost(nonFinite), ContractError);
  assert.throws(() => extractTerminalCost(negative), ContractError);
});

test('CR-06 DISCRIMINATION: a TRUNCATED final result line is a ContractError -- it must NOT promote the earlier under-reporting result event', () => {
  // DISCRIMINATION: the scanner skipped an unparseable line with `continue` and kept last-result-wins,
  // so a capture whose final line is a partially flushed result object silently made the
  // SECOND-TO-LAST result event terminal. On the real built-in q1 shape -- two result events, the first
  // reporting 0.78 against the run's 48.54 -- that under-reports by ~98% with no error and no signal.
  // The skip is safe for the GUARD and unsafe for the SELECTION (23-REVIEW.md CR-06).
  const first = JSON.stringify({ type: 'result', subtype: 'success', total_cost_usd: 0.7800860000000001 });
  const truncatedTail = '{"type":"result","subtype":"success","total_cost_us';
  const stream = first + '\n' + truncatedTail;

  assert.throws(
    () => extractTerminalCost(stream),
    (err) => {
      assert.ok(err instanceof ContractError);
      assert.equal(err.file, 'extractTerminalCost');
      assert.match(err.message, /truncated/, 'the message names truncation, not a missing result event');
      assert.match(err.message, /no earlier result event is substituted/, 'and refuses to impute');

      return true;
    },
  );

  // The refusal must be about the SELECTION, so the same tail after a SINGLE result event is refused
  // too -- there is no readable terminal event either way.
  assert.throws(() => extractTerminalCost(first + '\n' + truncatedTail + '\n'), ContractError);
});

test('CR-06: garbage in the MIDDLE of a stream is still skipped -- only a malformed tail is refused', () => {
  // The distinction is the whole fix: a malformed line BEFORE the terminal result event cannot change
  // which event is terminal, so refusing it would break every capture that carries a stray log line.
  const lines = [
    JSON.stringify({ type: 'system', subtype: 'init', model: 'm', claude_code_version: '1.2.3' }),
    'this line is not JSON at all',
    JSON.stringify({ type: 'result', subtype: 'success', total_cost_usd: 0.78 }),
    '{"type":"result","subtype":"success","total_cost_us',
    JSON.stringify({ type: 'result', subtype: 'success', total_cost_usd: 48.5367785 }),
    '',
  ];

  assert.equal(extractTerminalCost(lines.join('\n')), 48.5367785, 'the LAST readable result event wins');
});

test('T-23-12: aggregateRunCost sums the CALLER-ENUMERATED lz q1 stream list (cold + resume = 18.1152213)', (t) => {
  const texts = readCaptures(t, [CAPTURE.LZ_COLD, CAPTURE.LZ_RESUME]);

  if (texts === null) {
    return;
  }

  assert.equal(aggregateRunCost({ streamTexts: texts }), 18.1152213);
});

test('T-23-12: aggregateRunCost is order-independent -- a shuffled stream list yields the identical total', (t) => {
  const texts = readCaptures(t, [CAPTURE.LZ_COLD, CAPTURE.LZ_RESUME]);

  if (texts === null) {
    return;
  }

  const inOrder = aggregateRunCost({ streamTexts: texts });
  const shuffled = aggregateRunCost({ streamTexts: texts.slice().reverse() });

  assert.equal(shuffled, inOrder);
  assert.equal(shuffled, 18.1152213);
});

test('T-23-12: aggregateRunCost requires a caller-supplied array -- it never discovers streams itself', () => {
  assert.throws(() => aggregateRunCost({}), ContractError);
  assert.throws(() => aggregateRunCost({ streamTexts: 'eval/.cache/p22-baseline/lz' }), ContractError);
});

// ---------------------------------------------------------------------------
// Plan 23-01 Task 1 -- ENV-02: the lz q1 capture becomes ADMISSIBLE.
// ---------------------------------------------------------------------------

test('ENV-02: the lz q1 MANIFEST built from the REAL capture validates (pinned, costed, report present)', (t) => {
  const texts = readCaptures(t, [CAPTURE.LZ_COLD, CAPTURE.LZ_RESUME, CAPTURE.LZ_REPORT]);

  if (texts === null) {
    return;
  }

  const manifest = buildManifest({
    system: extractSystemInit(texts[0]),
    reportPath: CAPTURE.LZ_REPORT,
    costUsd: aggregateRunCost({ streamTexts: [texts[0], texts[1]] }),
    workflowSurface: 'lz-advisor:lz-deep-research',
    question: 'qB1',
    qid: 'qB1',
    runK: 1,
  });

  assert.equal(manifest.ccVersion, '2.1.186');
  assert.equal(manifest.costUsd, 18.1152213);
  assert.equal(validateManifest(manifest), true);
});

// ---------------------------------------------------------------------------
// Plan 23-01 Task 2 -- Phase-22 validation defect B2 / security flag F4: a zero-byte report.md
// currently VALIDATES, so a background-truncated capture can be graded as complete.
// ---------------------------------------------------------------------------

// A temp report.md with caller-chosen content, so the size guard has a real file to stat.
function withReportOfSize(contents, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-manifest-size-'));
  const reportPath = path.join(dir, 'report.md');
  fs.writeFileSync(reportPath, contents, 'utf8');

  try {
    return fn(reportPath);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function manifestForReport(reportPath) {
  return buildManifest({
    system: extractSystemInit(streamWithInit()),
    reportPath,
    costUsd: 1.23,
    workflowSurface: 'built-in /deep-research, closed-source',
    question: 'qB1',
    qid: 'qB1',
    runK: 1,
  });
}

test('B2/F4: validateManifest REJECTS a zero-byte report.md with "report" in the message (the driver gate is "non-empty report")', () => {
  withReportOfSize('', (reportPath) => {
    assert.throws(() => validateManifest(manifestForReport(reportPath)), ContractError);
    assert.throws(() => validateManifest(manifestForReport(reportPath)), /report/i);
  });
});

test('B2/F4 control: a NON-empty report.md still validates -- the size guard must not over-reject', () => {
  withReportOfSize('# Report\n\nSubstantive findings.\n', (reportPath) => {
    assert.equal(validateManifest(manifestForReport(reportPath)), true);
  });
});

test('B2/F4: a single-byte report.md validates -- the guard is zero-bytes, not a content heuristic', () => {
  withReportOfSize('x', (reportPath) => {
    assert.equal(validateManifest(manifestForReport(reportPath)), true);
  });
});

test('B2/F4: the absent-reportPath and non-existent-file branches keep their own "report" messages', () => {
  const manifest = manifestForReport(path.join(os.tmpdir(), 'does-not-exist-lz-eval-23-01', 'report.md'));

  assert.throws(() => validateManifest(manifest), /report/i);

  delete manifest.reportPath;
  assert.throws(() => validateManifest(manifest), /report/i);
});

// ---------------------------------------------------------------------------
// Plan 23-01 Task 2 -- the built-in q1 capture becomes admissible under an ENUMERATED cost rule.
// ---------------------------------------------------------------------------

test('T-23-12: the built-in q1 cost is the sum over exactly THREE enumerated streams (67.085261) and EXCLUDES the different-session broad-partial stream', (t) => {
  const texts = readCaptures(t, [
    CAPTURE.BUILTIN_COLD,
    CAPTURE.BUILTIN_RESUME2,
    CAPTURE.BUILTIN_RESUME3,
    CAPTURE.BUILTIN_BROAD_PARTIAL,
    CAPTURE.BUILTIN_REPORT,
  ]);

  if (texts === null) {
    return;
  }

  const [cold, resume2, resume3, broadPartial] = texts;
  const enumerated = [cold, resume2, resume3];
  const costUsd = aggregateRunCost({ streamTexts: enumerated });

  assert.equal(costUsd, 67.085261);

  // DISCRIMINATION: the broad-partial stream sits in the SAME directory but is a different session_id
  // from an earlier BROAD attempt. A directory-glob implementation would fold its 47.081383 in and
  // roughly double the published figure -- which is exactly why aggregateRunCost takes the list from
  // its caller (T-23-12).
  assert.equal(extractTerminalCost(broadPartial), 47.081383);
  assert.notEqual(
    aggregateRunCost({ streamTexts: [...enumerated, broadPartial] }),
    costUsd,
    'including the broad-partial stream must change the total -- otherwise this test proves nothing',
  );
  assert.notEqual(costUsd, 114.166644, 'the built-in total must NOT include the broad-partial stream');

  const manifest = buildManifest({
    system: extractSystemInit(cold),
    reportPath: CAPTURE.BUILTIN_REPORT,
    costUsd,
    costStreams: [
      { path: 'qB1-run1.stream.jsonl', role: 'cold run', terminalCostUsd: extractTerminalCost(cold), isError: true },
      {
        path: 'qB1-run1.resume2.stream.jsonl',
        role: 'report-recovery resume',
        terminalCostUsd: extractTerminalCost(resume2),
        isError: false,
      },
      {
        path: 'qB1-run1.resume3.stream.jsonl',
        role: 'verifier-completion resume',
        terminalCostUsd: extractTerminalCost(resume3),
        isError: false,
      },
    ],
    resumeCycles: 3,
    workflowSurface: 'built-in /deep-research, closed-source',
    question: 'qB1',
    qid: 'qB1',
    runK: 1,
  });

  assert.equal(manifest.model, 'claude-opus-4-8');
  assert.equal(manifest.ccVersion, '2.1.186');
  assert.equal(manifest.costStreams.length, 3, 'exactly the three enumerated streams');
  assert.equal(manifest.resumeCycles, 3);

  for (const entry of manifest.costStreams) {
    assert.equal(typeof entry.isError, 'boolean', 'every enumerated stream carries an is_error note');
  }

  assert.equal(validateManifest(manifest), true);
});

test('T-23-12: buildManifest threads costStreams / resumeCycles through, and omits them when the caller supplies none', () => {
  const withProvenance = buildManifest({
    system: extractSystemInit(streamWithInit()),
    reportPath: 'x/report.md',
    costUsd: 1,
    costStreams: [{ path: 'a.jsonl', terminalCostUsd: 1, isError: false }],
    costStreamsExcluded: [{ path: 'b.jsonl', reason: 'different session_id' }],
    resumeCycles: 2,
    workflowSurface: 's',
    question: 'q',
    qid: 'q',
    runK: 1,
  });

  assert.equal(withProvenance.costStreams.length, 1);
  assert.equal(withProvenance.costStreamsExcluded[0].reason, 'different session_id');
  assert.equal(withProvenance.resumeCycles, 2);

  // The pre-existing 8-field shape is unchanged for a caller that supplies no provenance.
  const bare = buildManifest({
    system: extractSystemInit(streamWithInit()),
    reportPath: 'x/report.md',
    costUsd: 1,
    workflowSurface: 's',
    question: 'q',
    qid: 'q',
    runK: 1,
  });

  assert.equal(bare.costStreams, undefined);
  assert.equal(bare.resumeCycles, undefined);
});
