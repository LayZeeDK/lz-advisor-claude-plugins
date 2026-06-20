// lz-eval-prescale-probe.test.mjs
//
// FILE-form DISCRIMINATING coverage for the 10-PAIR PRE-SCALE PROBE driver (Plan 20-06, Task 3;
// CERTIFY-WORKS-BOARD-DECISION.md section 4, NO-SPEND). Deterministic STUB callModel + STUB callVoter --
// ZERO spend. Each test is mutation-proven per the plan's <behavior> block.
//
// HOST QUIRK (load-bearing, CLAUDE.md): on this host `node --test <dir>` spuriously exits 1 even when all
// tests pass; ALWAYS gate by the explicit FILE path:
//   node --test eval/lz-eval-prescale-probe.test.mjs
//
// Strictly ASCII, no BOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  runPrescaleProbe,
  decidePrescale,
  PROBE_PAIR_COUNT,
  PROBE_UNANIMITY_FLOOR,
  FROZEN_PAIR,
} from './lz-eval-prescale-probe.mjs';

import { LEXICAL_AUC_CEILING } from './lz-eval-baseline-guard.mjs';
import { authorContrastivePairs } from './lz-eval-contrastive-authoring.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Fixtures: arm-A-style contrastive pairs. To exercise the 'scale' path we need a corpus that PASSES gate
// (a) (the AUC at chance) -- so the truth-value flip is a SEMANTIC entity-RE-ORDER (the SUPPORTED claim
// leads with the same entity the evidence leads with; the REFUTED claim swaps the order), keeping the
// SAME token bag on both members. The leave-one-pair-out lexical AUC therefore finds no systematic class
// token (AUC ~ 0.5 -> passes the ceiling), mirroring the contrastive-screen GATE fixture. Each pair is
// authored from a real-class dense bundle (uid + evidence + corroboration), so gate (d) holds. Uids carry
// the '::' run-dir qualifier (the harvest convention); the probe maps '::' -> '--' for the vote-store key.
// ---------------------------------------------------------------------------
function semanticBundle(i) {
  const t = 'cohort ' + i;
  // The evidence leads with alpha (alpha exceeded beta). The SUPPORTED claim leads with alpha (matches ->
  // entails). The REFUTED overclaim leads with beta (swapped -> not entailed). Same token bag, >= 12 tokens.
  return {
    uid: 'rundir-p::cluster-' + i,
    claim: 'in the ' + t + ' alpha rose more than beta over the full reporting period this year',
    overclaim: 'in the ' + t + ' beta rose more than alpha over the full reporting period this year',
    evidence: ['In the ' + t + ' alpha exceeded beta over the full reporting period this year.'],
    corroboration_lower_bound: 3,
  };
}

function probePairs() {
  const bundles = [];

  for (let i = 0; i < PROBE_PAIR_COUNT; i += 1) {
    bundles.push(semanticBundle(i));
  }

  return authorContrastivePairs(bundles);
}

// A gold-blind SEMANTIC OOF judge stub: entails iff the CLAIM leads with the SAME entity the EVIDENCE leads
// with (the entity ORDER is the semantic label -- invisible to a bag of words because both claims carry the
// SAME tokens, only re-ordered). Reads only the rendered prompt's EVIDENCE + CLAIM blocks (gold-blind).
function makeOofJudgeStub() {
  const leadEntity = (text) => {
    const m = text.toLowerCase().match(/\b(alpha|beta)\b/);

    return m ? m[1] : '';
  };

  return async function callModel(_model, promptText) {
    const afterItems = promptText.split('\nITEMS:\n')[1] || '';
    const blocks = afterItems.split('\n\n').filter((b) => b.trim().length > 0);
    const objs = [];

    for (const b of blocks) {
      const lines = b.split('\n');
      const idLine = lines.find((l) => /^(p[0-9a-f]+)\)$/.test(l.trim()));
      const idMatch = idLine ? idLine.trim().match(/^(p[0-9a-f]+)\)$/) : null;

      if (!idMatch) {
        continue;
      }

      const claimLine = lines.find((l) => l.startsWith('CLAIM: '));
      const claim = claimLine ? claimLine.slice('CLAIM: '.length) : '';
      const evidenceLines = lines.filter((l) => l.startsWith('- '));
      const evidence = evidenceLines.join(' ');
      objs.push({ id: idMatch[1], entails: leadEntity(claim) === leadEntity(evidence), reason: 'semantic-oof-stub' });
    }

    return JSON.stringify(objs.reverse());
  };
}

// A scored-voter stub. By default a PERFECT voter (verdict matches gold) -> zero scored false-upholds.
// With { upholdAll: true } it upholds everything -> a scored false-uphold on every REFUTED item. Returns a
// vote { verdict, trace } the persistDualRunVote store accepts (trace stop_reason in STOP_REASONS).
function makeVoterStub({ upholdAll = false } = {}) {
  return async function callVoter({ gold }) {
    const verdict = upholdAll ? 'unrefuted' : gold;

    return {
      verdict,
      trace: { queries: ['q'], depth: 1, stop_reason: 'decisive-evidence' },
    };
  };
}

// ---------------------------------------------------------------------------
// (1) decidePrescale: 'scale' iff >=9/10 unanimity AND auc <= ceiling (DISCRIMINATING across each leg).
// ---------------------------------------------------------------------------

test('Task-3 decidePrescale: scale iff unanimityCount>=9 AND lexicalAuc<=ceiling (DISCRIMINATING)', () => {
  assert.equal(decidePrescale({ unanimityCount: 10, lexicalAuc: 0.5 }), 'scale', '10/10 + clean AUC -> scale');
  assert.equal(decidePrescale({ unanimityCount: 9, lexicalAuc: LEXICAL_AUC_CEILING }), 'scale', '9/10 + AUC exactly at ceiling -> scale (<= boundary)');

  // DISCRIMINATING: each leg, individually failed, forces 'reconstruct'.
  assert.equal(decidePrescale({ unanimityCount: 8, lexicalAuc: 0.5 }), 'reconstruct', '8/10 (< 9) -> reconstruct');
  assert.equal(decidePrescale({ unanimityCount: 10, lexicalAuc: LEXICAL_AUC_CEILING + 0.01 }), 'reconstruct', 'AUC above the ceiling -> reconstruct');
});

test('Task-3 decidePrescale: fails closed on a non-number (never tunes the bar)', () => {
  assert.throws(() => decidePrescale({ unanimityCount: NaN, lexicalAuc: 0.5 }), (e) => e.name === 'ContractError', 'a NaN unanimityCount fails closed');
  assert.throws(() => decidePrescale({ unanimityCount: 9, lexicalAuc: 'x' }), (e) => e.name === 'ContractError', 'a non-number lexicalAuc fails closed');
});

// ---------------------------------------------------------------------------
// (2) >=1 scored false-uphold sets earlyStopSignal but does NOT change the decision (run-but-NOT-gate).
// ---------------------------------------------------------------------------

test('Task-3 runPrescaleProbe: a scored false-uphold sets earlyStopSignal but NOT the decision (run-but-NOT-gate, DISCRIMINATING)', async () => {
  const pairs = probePairs();

  // The OOF gold panel is a PERFECT judge -> 10/10 unanimity + clean AUC -> the GATE says 'scale'. The
  // scored voter UPHOLDS everything -> a scored false-uphold on every REFUTED item -> earlyStopSignal set.
  const out = await runPrescaleProbe({
    pairs,
    callModel: makeOofJudgeStub(),
    callVoter: makeVoterStub({ upholdAll: true }),
    score: () => {},
    stub: true,
  });

  assert.equal(out.unanimityCount, 10, 'the OOF panel admits all 10 pairs');
  assert.ok(out.lexicalAucPass, 'the artifact-free corpus passes the AUC gate');
  assert.ok(out.scoredFalseUpholds >= 1, 'the always-uphold scored voter produced >= 1 scored false-uphold (got ' + out.scoredFalseUpholds + ')');
  assert.equal(out.earlyStopSignal, true, 'a scored false-uphold sets the VOLUNTARY early-stop signal');

  // CRUCIAL (run-but-NOT-gate): the decision is STILL 'scale' -- the scored voter is EXCLUDED from the gate.
  assert.equal(out.decision, 'scale', 'the scored false-uphold does NOT change the decision (the scored voter is run-but-NOT-gated)');

  // DISCRIMINATING: the SAME probe with a PERFECT scored voter clears the signal but keeps the SAME decision.
  const clean = await runPrescaleProbe({ pairs, callModel: makeOofJudgeStub(), callVoter: makeVoterStub(), score: () => {}, stub: true });
  assert.equal(clean.scoredFalseUpholds, 0, 'a perfect scored voter -> zero scored false-upholds');
  assert.equal(clean.earlyStopSignal, false, 'no scored false-uphold -> no early-stop signal');
  assert.equal(clean.decision, 'scale', 'the decision is unchanged by the scored voter outcome');
});

// ---------------------------------------------------------------------------
// (3) runPrescaleProbe over a STUB callModel + STUB callVoter runs ZERO spend (persists telemetry votes).
// ---------------------------------------------------------------------------

test('Task-3 runPrescaleProbe: STUB callModel + STUB callVoter run ZERO spend + persist telemetry votes (resumable)', async () => {
  const pairs = probePairs();
  const voteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-prescale-votes-'));

  try {
    assert.equal(process.env.LZ_SPEND, undefined, 'the test runs with LZ_SPEND unset (zero spend)');

    const out = await runPrescaleProbe({
      pairs,
      callModel: makeOofJudgeStub(),
      callVoter: makeVoterStub(),
      voteDir,
      score: () => {},
      stub: true,
    });

    assert.equal(out.probePairCount, PROBE_PAIR_COUNT, 'the probe ran over PROBE_PAIR_COUNT pairs');

    // The scored votes were persisted for telemetry (resumable skip-already-done). 20 items (10 pairs) ->
    // 20 vote files.
    const voteFiles = fs.readdirSync(voteDir).filter((f) => f.endsWith('.json'));
    assert.equal(voteFiles.length, 20, 'the scored voter persisted a telemetry vote per item (20 = 10 pairs x 2)');

    // Resumable: a re-run SKIPS the already-persisted votes (skip-already-done) -- no error, no overwrite.
    const rerun = await runPrescaleProbe({ pairs, callModel: makeOofJudgeStub(), callVoter: makeVoterStub(), voteDir, score: () => {}, stub: true });
    assert.equal(rerun.decision, out.decision, 'a re-run is idempotent (skip-already-done)');
  } finally {
    fs.rmSync(voteDir, { recursive: true, force: true });
  }
});

test('Task-3 runPrescaleProbe: a real-dispatch path (stub !== true) THROWS unless LZ_SPEND=1 (the spend hard-guard)', async () => {
  const pairs = probePairs();
  const neverCalled = async () => {
    throw new Error('the stub callModel must NEVER be reached -- requireSpend must throw FIRST');
  };

  await assert.rejects(
    () => runPrescaleProbe({ pairs, callModel: neverCalled, callVoter: makeVoterStub() }),
    (e) => e.name === 'ContractError' && /LZ_SPEND/.test(e.message),
    'the real-dispatch path calls requireSpend(callOof) FIRST and throws unless LZ_SPEND=1',
  );
});

// ---------------------------------------------------------------------------
// (4) PROBE_PAIR_COUNT=10 + PROBE_UNANIMITY_FLOOR=9 are frozen literals.
// ---------------------------------------------------------------------------

test('Task-3 PROBE_PAIR_COUNT=10 + PROBE_UNANIMITY_FLOOR=9 are frozen module literals', () => {
  assert.equal(PROBE_PAIR_COUNT, 10, 'the probe size is 10 pairs');
  assert.equal(PROBE_UNANIMITY_FLOOR, 9, 'the unanimity floor is 9 of 10');

  const src = fs.readFileSync(path.join(HERE, 'lz-eval-prescale-probe.mjs'), 'utf8');
  assert.ok(/export const PROBE_PAIR_COUNT = 10;/.test(src), 'PROBE_PAIR_COUNT is a frozen module literal');
  assert.ok(/export const PROBE_UNANIMITY_FLOOR = 9;/.test(src), 'PROBE_UNANIMITY_FLOOR is a frozen module literal');
  assert.ok(/run-but-NOT-gate|run-but-not-gate/.test(src), 'the run-but-not-gate discipline is documented');
  assert.ok(/earlyStopSignal/.test(src), 'the VOLUNTARY early-stop signal is present');
});

test('Task-3 FROZEN_PAIR is the OOF gold-decider identity byte-identical (IMPORTED, not re-authored)', () => {
  assert.deepEqual(FROZEN_PAIR, ['gpt-5.5', 'gemini-3.1-pro-preview'], 'the frozen OOF pair is byte-identical');

  const src = fs.readFileSync(path.join(HERE, 'lz-eval-prescale-probe.mjs'), 'utf8');
  assert.ok(/import\s+\{\s*makeBatchedOofProbe\s*\}\s+from\s+'\.\/lz-eval-oof-batch\.mjs'/.test(src), 'makeBatchedOofProbe is IMPORTED');
  assert.ok(/import\s+\{\s*runProbeConsensus\s*\}\s+from\s+'\.\/lz-eval-trap-assembler\.mjs'/.test(src), 'runProbeConsensus is IMPORTED');
  assert.ok(/persistDualRunVote/.test(src), 'persistDualRunVote is IMPORTED + used for the telemetry votes');
});

test('Task-3 the module source is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(path.join(HERE, 'lz-eval-prescale-probe.mjs'));

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'lz-eval-prescale-probe.mjs byte at offset ' + i + ' must be ASCII (<= 0x7F), got 0x' + buf[i].toString(16));
  }
});
