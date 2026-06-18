// lz-eval-offline-read.test.mjs
//
// Validation fixture for the OFFLINE known-gold gating-read DECISION DRIVER (Plan 19-04, Task 1;
// EVAL-02 / D-06 / D-08). Dev-only eval-tree test: imports the SCRIPT under test (which imports the
// FROZEN engine + the search spine WITHIN the eval tree, and the SHIPPED runtime aggregator's
// hardening primitives ACROSS trees, one-directional eval -> runtime) plus node stdlib. jstat is
// loaded transitively via the frozen engine (the CI math is engine-owned, never re-derived here).
//
// The driver is the DETERMINISTIC seam around the model votes: the D-06 Sonnet-as-calibrator gate, the
// Haiku-MINUS-Sonnet pooled DELTA read, the VOID / PASS / FAIL-RAISE outcome resolver, and the
// resumable filesystem vote persistence + per-vote search trace. The model vote DISPATCH is the D-08
// Workflow (Task 2, run by the orchestrator + human) -- this suite uses INJECTED FIXTURES (vote files
// written to a tmpdir, NO real model calls) so it samples the decision logic, never the dispatch.
//
// Every behavior assertion is DISCRIMINATING (proves the function actually flips / decides), never a
// tautology that would pass if the function returned a constant. Coverage (each a DISTINCT named test):
//   - calibratorGate returns 'saturated' for a near-ceiling (zero false-uphold) Sonnet count and
//     'below-ceiling' for a clearly-below (>=1) count -- the gate genuinely DISCRIMINATES;
//   - resolveOutcome returns VOID on a saturated calibrator REGARDLESS of the Haiku delta (VOID
//     precedes the engine -- a both-models-ace tie is never read as Haiku-safe, D-06);
//   - resolveOutcome returns FAIL-RAISE on a NON-ZERO pooled excess at reliable>=15;
//   - resolveOutcome returns PASS ONLY on a ZERO pooled excess AT reliable=15 with escalation below
//     the kill band;
//   - readDelta populates the pooled excess / n / CP labels / Pass@1 / Pass^k from the FROZEN engine;
//   - persistVote records the per-vote search trace (queries[], depth, stop_reason) and SKIPS an
//     already-persisted vote (D-08 skip-already-done resumability).
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase gate
// MUST target the explicit FILE form:
//   node --test eval/lz-eval-offline-read.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes. The suite is one file, so the file form is the equivalent reliable gate.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  calibratorGate,
  readDelta,
  resolveOutcome,
  votePath,
  votePersisted,
  persistVote,
  scorePositiveControls,
  classifyCalibration,
  certifyModel,
  decisionMatrix,
} from './lz-eval-offline-read.mjs';

import { EVAL_THRESHOLDS, clopperPearsonUpper, clopperPearsonUpperOneSided } from './lz-eval-aggregate.mjs';

// Resolve fixtures test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`). Vote fixtures are written to a per-test tmpdir, not under HERE, so no
// committed bytes; HERE is established for parity with the sibling eval tests.
const HERE = path.dirname(fileURLToPath(import.meta.url));
void HERE;

// ---------------------------------------------------------------------------
// Helper: write a directory of vote files { id, verdict } over a gold map. Mirrors the on-disk shape
// countFalseUpholds reads. Returns the vote dir path. Each vote id must have a gold label.
// ---------------------------------------------------------------------------
function writeVotes(votes) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-offline-votes-'));

  for (const v of votes) {
    fs.writeFileSync(path.join(dir, v.id + '.json'), JSON.stringify({ id: v.id, verdict: v.verdict }) + '\n', 'utf8');
  }

  return dir;
}

// Build a shared SUBTLE pool of N trap (refuted-gold) trials; the gold map labels every id 'refuted'.
function buildPool(n) {
  const gold = {};
  const ids = [];

  for (let i = 0; i < n; i += 1) {
    const id = 'trap-' + String(i).padStart(3, '0');
    gold[id] = 'refuted';
    ids.push(id);
  }

  return { gold, ids };
}

// ===========================================================================
// calibratorGate (D-06): the Sonnet-as-calibrator saturation pre-condition gate.
// ===========================================================================

test('calibratorGate DISCRIMINATES: zero Sonnet false-upholds -> saturated; >=1 -> below-ceiling', () => {
  // Sonnet aces the stratum (0 false-upholds) -> the stratum is NON-discriminating (saturated): a
  // both-models-ace tie that must NEVER be read as Haiku-safe.
  const saturated = calibratorGate({ sonnetFalseUpholds: 0, trials: 15 });
  assert.equal(saturated.status, 'saturated', 'Sonnet acing the stratum (0 false-upholds) -> saturated');

  // Sonnet records >=1 false-uphold -> demonstrably BELOW ceiling -> the stratum discriminates.
  const below = calibratorGate({ sonnetFalseUpholds: 1, trials: 15 });
  assert.equal(below.status, 'below-ceiling', 'a non-zero Sonnet false-uphold count -> below-ceiling');

  assert.notEqual(saturated.status, below.status, 'the calibrator gate genuinely DISCRIMINATES (not a constant)');
});

test('calibratorGate records the CP(1,N) ceiling LABEL via the frozen engine (a number, not re-derived)', () => {
  const res = calibratorGate({ sonnetFalseUpholds: 2, trials: 60 });
  assert.equal(typeof res.ceiling, 'number', 'the ceiling LABEL is a number');
  assert.ok(res.ceiling > 0 && res.ceiling < 1, 'CP(1,60) sits strictly in (0,1)');
  // CP(1,60) ~= 0.0894 per the locked lock-rule table -- proves it is the frozen formula, not a stub.
  assert.ok(Math.abs(res.ceiling - 0.0894) < 0.01, 'the recorded ceiling matches the locked CP(1,60) table value (~0.0894)');
});

test('calibratorGate fails closed on out-of-contract inputs (negative count, trials < MIN_K, count > trials)', () => {
  assert.throws(
    () => calibratorGate({ sonnetFalseUpholds: -1, trials: 15 }),
    (err) => err.name === 'ContractError',
    'a negative false-uphold count fails closed',
  );
  assert.throws(
    () => calibratorGate({ sonnetFalseUpholds: 0, trials: EVAL_THRESHOLDS.MIN_K - 1 }),
    (err) => err.name === 'ContractError' && /MIN_K/.test(err.message),
    'trials below MIN_K fails closed',
  );
  assert.throws(
    () => calibratorGate({ sonnetFalseUpholds: 16, trials: 15 }),
    (err) => err.name === 'ContractError',
    'a false-uphold count exceeding trials fails closed',
  );
});

// ===========================================================================
// resolveOutcome (EVAL-04): VOID precedes the engine; below-ceiling delegates to lockRuleVerdict.
// ===========================================================================

test('resolveOutcome returns VOID on a saturated calibrator REGARDLESS of the Haiku delta (D-06)', () => {
  // A saturated calibrator forces VOID BEFORE the engine runs. Even a perfectly clean read (which would
  // otherwise PASS) cannot rescue a saturated stratum -- a both-models-ace tie is never Haiku-safe.
  const calibration = calibratorGate({ sonnetFalseUpholds: 0, trials: 15 });

  // A read that on a below-ceiling stratum WOULD pass (zero excess, reliable=15) -- proving VOID is not
  // a consequence of the read, but of the saturation pre-condition.
  const wouldPassRead = {
    subtleOpenBookDeltaUpper: 0.218, // CP(0,15) PASS-side
    reliableTrials: 15,
  };

  const out = resolveOutcome({ calibration, read: wouldPassRead, escalationFraction: 0.1 });
  assert.equal(out.outcome, 'VOID', 'a saturated calibrator -> VOID, regardless of a clean read');
  assert.equal(out.raiseToUser, true, 'VOID raises the decision to the user');
  assert.equal(out.shipsSonnetDefault, true, 'Sonnet-default ships on VOID (settle-OR-raise)');
});

test('resolveOutcome does NOT even require a read on a saturated calibrator (VOID precedes the engine)', () => {
  // VOID is decided BEFORE the engine -- so a saturated calibrator with NO read at all still resolves
  // (the engine, which needs a read, is never reached). This proves the precedence ordering.
  const calibration = calibratorGate({ sonnetFalseUpholds: 0, trials: 15 });
  const out = resolveOutcome({ calibration, read: null, escalationFraction: 0.1 });
  assert.equal(out.outcome, 'VOID', 'VOID resolves with no read (the engine is never reached)');
});

test('resolveOutcome returns FAIL-RAISE on a NON-ZERO pooled excess at reliable>=15', () => {
  const { gold, ids } = buildPool(15);
  // Sonnet: 1 false-uphold; Haiku: 2 false-upholds -> pooled excess = +1 (non-zero) -> FAIL.
  const sonnetVotes = ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' }));
  const haikuVotes = ids.map((id, i) => ({ id, verdict: i < 2 ? 'unrefuted' : 'refuted' }));
  const sonnetDir = writeVotes(sonnetVotes);
  const haikuDir = writeVotes(haikuVotes);

  try {
    const read = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels: gold,
      nPooled: 15,
      reliableTrials: 15,
    });
    assert.equal(read.pooledExcess, 1, 'Haiku has one excess false-uphold over Sonnet');

    // Sonnet recorded a false-uphold -> below-ceiling -> the engine reads the delta.
    const calibration = calibratorGate({ sonnetFalseUpholds: read.sonnetFalseUpholds, trials: 15 });
    assert.equal(calibration.status, 'below-ceiling', 'Sonnet below ceiling -> the delta is read');

    const out = resolveOutcome({ calibration, read, escalationFraction: 0.1 });
    assert.equal(out.outcome, 'FAIL-RAISE', 'a non-zero pooled excess at reliable=15 -> FAIL-RAISE');
    assert.equal(out.raiseToUser, true, 'FAIL-RAISE raises to the user');
    assert.equal(out.shipsSonnetDefault, true, 'Sonnet-default ships on FAIL-RAISE');
    assert.equal(out.haikuFirstFlag, 'OFF', 'the Haiku-first flag stays OFF on FAIL-RAISE');
  } finally {
    fs.rmSync(sonnetDir, { recursive: true, force: true });
    fs.rmSync(haikuDir, { recursive: true, force: true });
  }
});

test('resolveOutcome returns PASS ONLY on a ZERO pooled excess AT reliable=15 with escalation below the kill band', () => {
  const { gold, ids } = buildPool(15);
  // Sonnet: 1 false-uphold (below ceiling); Haiku: 1 false-uphold -> pooled excess = 0 (clean).
  const sonnetVotes = ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' }));
  const haikuVotes = ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' }));
  const sonnetDir = writeVotes(sonnetVotes);
  const haikuDir = writeVotes(haikuVotes);

  try {
    const read = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels: gold,
      nPooled: 15,
      reliableTrials: 15,
    });
    assert.equal(read.pooledExcess, 0, 'zero pooled excess (Haiku matches Sonnet)');

    const calibration = calibratorGate({ sonnetFalseUpholds: read.sonnetFalseUpholds, trials: 15 });
    assert.equal(calibration.status, 'below-ceiling', 'Sonnet below ceiling');

    const out = resolveOutcome({ calibration, read, escalationFraction: 0.1 });
    assert.equal(out.outcome, 'PASS', 'zero excess at reliable=15, escalation below kill band -> PASS');
    assert.equal(out.raiseToUser, false, 'a PASS does not raise to the user');
    assert.equal(out.haikuFirstFlag, 'ON', 'the Haiku-first flag flips ON on PASS (COST-02)');
  } finally {
    fs.rmSync(sonnetDir, { recursive: true, force: true });
    fs.rmSync(haikuDir, { recursive: true, force: true });
  }
});

test('resolveOutcome FAILs a clean read when reliability is below 15 OR escalation hits the kill band (PASS is conjunctive)', () => {
  const { gold, ids } = buildPool(15);
  const sonnetVotes = ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' }));
  const haikuVotes = ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' }));
  const sonnetDir = writeVotes(sonnetVotes);
  const haikuDir = writeVotes(haikuVotes);

  try {
    // reliability below 15: even a zero-excess clean read cannot declare PASS (not enough evidence).
    const earlyRead = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels: gold,
      nPooled: 15,
      reliableTrials: 10,
    });
    // Each read gets its OWN calibration derived from that read's sonnetFalseUpholds (not reused
    // across distinct sub-reads -- the calibration is per-read, not shared).
    const earlyCalibration = calibratorGate({ sonnetFalseUpholds: earlyRead.sonnetFalseUpholds, trials: 15 });
    const earlyOut = resolveOutcome({ calibration: earlyCalibration, read: earlyRead, escalationFraction: 0.1 });
    assert.equal(earlyOut.outcome, 'FAIL-RAISE', 'a clean read at reliable<15 cannot PASS (reliability gate)');

    // escalation in the kill band (>= 0.50): a zero-excess clean read at reliable=15 still FAILs on cost.
    const reliableRead = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels: gold,
      nPooled: 15,
      reliableTrials: 15,
    });
    // Separate calibration for the reliable read (same vote dirs, same sonnetFalseUpholds in this case,
    // but derived independently -- the pattern enforces per-read calibration discipline).
    const reliableCalibration = calibratorGate({ sonnetFalseUpholds: reliableRead.sonnetFalseUpholds, trials: 15 });
    const killBandOut = resolveOutcome({ calibration: reliableCalibration, read: reliableRead, escalationFraction: 0.55 });
    assert.equal(killBandOut.outcome, 'FAIL-RAISE', 'a clean read with kill-band escalation FAILs on cost');
  } finally {
    fs.rmSync(sonnetDir, { recursive: true, force: true });
    fs.rmSync(haikuDir, { recursive: true, force: true });
  }
});

test('resolveOutcome fails closed on an escalationFraction outside [0,1] (a negative would silently clear the cost gate -- F10)', () => {
  const calibration = calibratorGate({ sonnetFalseUpholds: 1, trials: 15 });
  const read = { subtleOpenBookDeltaUpper: 0.2, reliableTrials: 15 };
  // A negative escalationFraction is `< ESCALATION_KILL_HIGH`, so it would silently CLEAR the cost gate
  // and mask a computation error as PASS-eligible. The range guard fails it closed.
  assert.throws(
    () => resolveOutcome({ calibration, read, escalationFraction: -0.1 }),
    (e) => e.name === 'ContractError' && /\[0,1\]/.test(e.message),
    'a negative escalationFraction fails closed (does not silently clear the cost gate)',
  );
  assert.throws(
    () => resolveOutcome({ calibration, read, escalationFraction: 1.5 }),
    (e) => e.name === 'ContractError',
    'an escalationFraction > 1 fails closed',
  );
});

// ===========================================================================
// readDelta (EVAL-02 / D-05): the pooled DELTA read over the FROZEN engine.
// ===========================================================================

test('readDelta computes the Sonnet/Haiku counts, pooled excess, CP labels, and Pass@1/Pass^k via the engine', () => {
  const { gold, ids } = buildPool(20);
  // Sonnet 2 false-upholds; Haiku 2 false-upholds -> excess 0.
  const sonnetVotes = ids.map((id, i) => ({ id, verdict: i < 2 ? 'unrefuted' : 'refuted' }));
  const haikuVotes = ids.map((id, i) => ({ id, verdict: i < 2 ? 'unrefuted' : 'refuted' }));
  const sonnetDir = writeVotes(sonnetVotes);
  const haikuDir = writeVotes(haikuVotes);

  try {
    const read = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels: gold,
      nPooled: 20,
      reliableTrials: 20,
    });
    assert.equal(read.sonnetFalseUpholds, 2, 'Sonnet false-uphold count from the engine counter');
    assert.equal(read.haikuFalseUpholds, 2, 'Haiku false-uphold count from the engine counter');
    assert.equal(read.pooledExcess, 0, 'pooled excess = Haiku - Sonnet via the engine delta');
    assert.equal(read.nPooled, 20, 'realized pooled n recorded');
    assert.equal(typeof read.pooledCeilingLabel, 'number', 'CP(1,N_pooled) label is a number (LABEL only, Pitfall 3)');
    assert.ok(read.pooledCeilingLabel > 0 && read.pooledCeilingLabel < 1, 'the pooled ceiling label sits in (0,1)');
    assert.equal(typeof read.passAt1.haiku, 'number', 'Pass@1 reported per seat');
    assert.equal(typeof read.passHatK.haiku, 'number', 'Pass^k reported per seat');
  } finally {
    fs.rmSync(sonnetDir, { recursive: true, force: true });
    fs.rmSync(haikuDir, { recursive: true, force: true });
  }
});

test('readDelta is DISCRIMINATING: the engine-facing delta upper crosses the 0.25 anchor on zero-vs-nonzero excess', () => {
  const { gold, ids } = buildPool(15);
  // Clean (zero excess): Sonnet 1, Haiku 1.
  const cleanSonnet = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
  const cleanHaiku = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
  // Excess: Sonnet 1, Haiku 3 -> excess +2.
  const dirtySonnet = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
  const dirtyHaiku = writeVotes(ids.map((id, i) => ({ id, verdict: i < 3 ? 'unrefuted' : 'refuted' })));

  try {
    const clean = readDelta({ sonnetVoteDir: cleanSonnet, haikuVoteDir: cleanHaiku, goldLabels: gold, nPooled: 15, reliableTrials: 15 });
    const dirty = readDelta({ sonnetVoteDir: dirtySonnet, haikuVoteDir: dirtyHaiku, goldLabels: gold, nPooled: 15, reliableTrials: 15 });

    assert.ok(clean.subtleOpenBookDeltaUpper <= EVAL_THRESHOLDS.DELTA_UPPER_MAX, 'zero excess -> delta upper at/below the 0.25 anchor (PASS-side)');
    assert.ok(dirty.subtleOpenBookDeltaUpper > EVAL_THRESHOLDS.DELTA_UPPER_MAX, 'a non-zero excess -> delta upper above the 0.25 anchor (FAIL-side)');
    assert.notEqual(
      clean.subtleOpenBookDeltaUpper <= EVAL_THRESHOLDS.DELTA_UPPER_MAX,
      dirty.subtleOpenBookDeltaUpper <= EVAL_THRESHOLDS.DELTA_UPPER_MAX,
      'the engine-facing delta upper genuinely flips across the anchor on excess count',
    );
  } finally {
    for (const d of [cleanSonnet, cleanHaiku, dirtySonnet, dirtyHaiku]) {
      fs.rmSync(d, { recursive: true, force: true });
    }
  }
});

test('readDelta treats ANY non-zero excess identically (the EXACT-ZERO count gate, not the magnitude -- Pitfall 3)', () => {
  const { gold, ids } = buildPool(15);
  const sonnet = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
  // excess +1
  const haiku1 = writeVotes(ids.map((id, i) => ({ id, verdict: i < 2 ? 'unrefuted' : 'refuted' })));
  // excess +5
  const haiku5 = writeVotes(ids.map((id, i) => ({ id, verdict: i < 6 ? 'unrefuted' : 'refuted' })));
  // A second sonnet dir for read5 (same votes as sonnet -- separate object so neither read shares a dir).
  // Created here so it is in scope for the finally block regardless of assertion throws.
  const sonnet1 = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));

  try {
    const read1 = readDelta({ sonnetVoteDir: sonnet, haikuVoteDir: haiku1, goldLabels: gold, nPooled: 15, reliableTrials: 15 });
    const read5 = readDelta({ sonnetVoteDir: sonnet1, haikuVoteDir: haiku5, goldLabels: gold, nPooled: 15, reliableTrials: 15 });

    assert.equal(read1.pooledExcess, 1, 'excess +1');
    assert.equal(read5.pooledExcess, 5, 'excess +5');
    // The engine-facing delta upper is the SAME (CP(1,15)) for any non-zero excess -- the gate is the
    // count being non-zero, never its size (so 1 excess and 5 excess both FAIL identically).
    assert.equal(read1.subtleOpenBookDeltaUpper, read5.subtleOpenBookDeltaUpper, 'any non-zero excess maps to the same CP(1,reliable) FAIL-side value');
    assert.ok(read1.subtleOpenBookDeltaUpper > EVAL_THRESHOLDS.DELTA_UPPER_MAX, 'both are FAIL-side of the anchor');
  } finally {
    for (const d of [sonnet, haiku1, haiku5, sonnet1]) {
      fs.rmSync(d, { recursive: true, force: true });
    }
  }
});

test('readDelta clamps a NEGATIVE excess (Haiku BETTER than Sonnet) to a zero-excess clean read', () => {
  const { gold, ids } = buildPool(15);
  // Sonnet 3 false-upholds; Haiku 1 -> excess -2 (Haiku is BETTER). This is a clean read (no Haiku-only
  // excess), so the engine-facing delta upper sits PASS-side of the anchor.
  const sonnet = writeVotes(ids.map((id, i) => ({ id, verdict: i < 3 ? 'unrefuted' : 'refuted' })));
  const haiku = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));

  try {
    const read = readDelta({ sonnetVoteDir: sonnet, haikuVoteDir: haiku, goldLabels: gold, nPooled: 15, reliableTrials: 15 });
    assert.equal(read.pooledExcess, -2, 'Haiku has fewer false-upholds (negative excess)');
    assert.ok(read.subtleOpenBookDeltaUpper <= EVAL_THRESHOLDS.DELTA_UPPER_MAX, 'a negative excess is a clean read (PASS-side of the anchor)');
  } finally {
    fs.rmSync(sonnet, { recursive: true, force: true });
    fs.rmSync(haiku, { recursive: true, force: true });
  }
});

test('readDelta fails closed on out-of-contract inputs (missing dirs, non-positive nPooled, k < MIN_K)', () => {
  const { gold } = buildPool(5);
  assert.throws(() => readDelta({ goldLabels: gold, nPooled: 15, reliableTrials: 15 }), (e) => e.name === 'ContractError', 'missing vote dirs fail closed');
  assert.throws(
    () => readDelta({ sonnetVoteDir: 'a', haikuVoteDir: 'b', goldLabels: gold, nPooled: 0, reliableTrials: 15 }),
    (e) => e.name === 'ContractError',
    'non-positive nPooled fails closed',
  );
  assert.throws(
    () => readDelta({ sonnetVoteDir: 'a', haikuVoteDir: 'b', goldLabels: gold, nPooled: 15, reliableTrials: 15, k: EVAL_THRESHOLDS.MIN_K - 1 }),
    (e) => e.name === 'ContractError' && /MIN_K/.test(e.message),
    'k below MIN_K fails closed',
  );
});

test('readDelta fails closed on reliableTrials=0 (a degenerate clopperPearsonUpper(_,0,_) input -- F4)', () => {
  const { gold } = buildPool(5);
  // The old guard was `reliableTrials < 0`, so 0 slipped through into a degenerate CP(_,0,_). The
  // tightened `< 1` guard rejects it. (A partial-run reliableTrials between 1 and 14 still computes --
  // see the reliable<15 FAIL-RAISE test above -- so the fix does not over-constrain.)
  assert.throws(
    () => readDelta({ sonnetVoteDir: 'a', haikuVoteDir: 'b', goldLabels: gold, nPooled: 15, reliableTrials: 0 }),
    (e) => e.name === 'ContractError' && /positive integer reliableTrials|degenerate/.test(e.message),
    'reliableTrials=0 fails closed',
  );
});

test('readDelta fails closed when nPooled < k (passHatK would be NaN in the read -- F6)', () => {
  const { gold } = buildPool(5);
  // nPooled=3 < default k=5: passHatK(3,_,5) would be NaN. The guard rejects it before any vote read
  // (so the dummy dirs are never touched).
  assert.throws(
    () => readDelta({ sonnetVoteDir: 'a', haikuVoteDir: 'b', goldLabels: gold, nPooled: 3, reliableTrials: 15 }),
    (e) => e.name === 'ContractError' && /nPooled >= k/.test(e.message),
    'nPooled below the reporting k fails closed (no NaN passHatK)',
  );
});

test('readDelta fails closed when the realized per-seat vote count != nPooled (under-filled interrupted run OR over-filled stale dir -- F3/F4/probe-#5)', () => {
  const { gold, ids } = buildPool(15);

  // UNDER-FILLED: only 10 of the 15 pool votes written, but nPooled declared 15. Pre-fix readDelta
  // computed correct = 15 - falseUpholds over a 10-vote dir and over-reported Pass@1/Pass^k -- the exact
  // silent reliability over-report probe-#5 surfaced (the resumable D-08 run's normal mid-interruption
  // state). The realized-count guard must fail closed.
  const underS = writeVotes(ids.slice(0, 10).map((id) => ({ id, verdict: 'refuted' })));
  const underH = writeVotes(ids.slice(0, 10).map((id) => ({ id, verdict: 'refuted' })));

  try {
    assert.throws(
      () => readDelta({ sonnetVoteDir: underS, haikuVoteDir: underH, goldLabels: gold, nPooled: 15, reliableTrials: 10 }),
      (e) => e.name === 'ContractError' && /realized per-seat vote count != nPooled/.test(e.message),
      'an under-filled (interrupted) vote dir fails closed -- no silent reliability over-report',
    );
  } finally {
    fs.rmSync(underS, { recursive: true, force: true });
    fs.rmSync(underH, { recursive: true, force: true });
  }

  // OVER-FILLED: 15 votes written but nPooled declared 10 (a stale / oversized dir). Must throw too --
  // this is the direction the prior superset-only guard caught; the realized-count guard subsumes it.
  const overS = writeVotes(ids.map((id) => ({ id, verdict: 'unrefuted' })));
  const overH = writeVotes(ids.map((id) => ({ id, verdict: 'refuted' })));

  try {
    assert.throws(
      () => readDelta({ sonnetVoteDir: overS, haikuVoteDir: overH, goldLabels: gold, nPooled: 10, reliableTrials: 10 }),
      (e) => e.name === 'ContractError' && /realized per-seat vote count != nPooled/.test(e.message),
      'an over-filled (stale) vote dir fails closed',
    );
  } finally {
    fs.rmSync(overS, { recursive: true, force: true });
    fs.rmSync(overH, { recursive: true, force: true });
  }
});

test('readDelta fails closed when nPooled < reliableTrials (pool smaller than the reliability depth -- D1-17)', () => {
  const { gold } = buildPool(5);
  // nPooled=10 < reliableTrials=15: the pool cannot support the per-claim reliability the gate reads at
  // (a PASS is declared at reliable=15). The guard fires before any vote dir is touched (dummy dirs).
  assert.throws(
    () => readDelta({ sonnetVoteDir: 'a', haikuVoteDir: 'b', goldLabels: gold, nPooled: 10, reliableTrials: 15 }),
    (e) => e.name === 'ContractError' && /nPooled >= reliableTrials/.test(e.message),
    'nPooled below reliableTrials fails closed',
  );
});

// ===========================================================================
// persistVote (D-08 / D-10): resumable vote persistence + the per-vote search trace.
// ===========================================================================

test('persistVote records the per-vote search trace { queries[], depth, stop_reason } (D-10)', () => {
  const voteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-offline-persist-'));

  try {
    const vote = {
      id: 'haiku--trap-001',
      seat: 'haiku',
      verdict: 'refuted',
      trace: { queries: ['disconfirm:r0:x', 'disconfirm:r1:x', 'disconfirm:r2:x'], depth: 7, stop_reason: 'exhausted' },
    };
    const res = persistVote(voteDir, vote);
    assert.equal(res.persisted, true, 'a fresh vote is persisted');
    assert.equal(res.skipped, false, 'a fresh vote is not skipped');

    const onDisk = JSON.parse(fs.readFileSync(res.path, 'utf8'));
    assert.deepEqual(onDisk.trace.queries, vote.trace.queries, 'the per-vote search trace queries are recorded');
    assert.equal(onDisk.trace.depth, 7, 'the trace depth is recorded (null-delta diagnosability, D-10)');
    assert.equal(onDisk.trace.stop_reason, 'exhausted', 'the trace stop_reason is recorded');
  } finally {
    fs.rmSync(voteDir, { recursive: true, force: true });
  }
});

test('persistVote SKIPS an already-persisted vote (D-08 skip-already-done resumability)', () => {
  const voteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-offline-resume-'));

  try {
    const vote = {
      id: 'sonnet--trap-002',
      seat: 'sonnet',
      verdict: 'unrefuted',
      trace: { queries: ['disconfirm:r0:y'], depth: 5, stop_reason: 'decisive-evidence' },
    };

    assert.equal(votePersisted(voteDir, vote.id), false, 'the vote is not yet persisted');

    const first = persistVote(voteDir, vote);
    assert.equal(first.persisted, true, 'first write persists');
    assert.equal(votePersisted(voteDir, vote.id), true, 'the vote is now on disk');

    // A re-run (skip-already-done): the SECOND attempt must SKIP, not re-cast or overwrite. Mutate the
    // verdict to prove the original is preserved (the re-run never re-votes a completed seat).
    const second = persistVote(voteDir, { ...vote, verdict: 'refuted' });
    assert.equal(second.persisted, false, 'a re-run does NOT re-persist an existing vote');
    assert.equal(second.skipped, true, 'the existing vote is skipped (interruption-recoverable)');

    const onDisk = JSON.parse(fs.readFileSync(votePath(voteDir, vote.id), 'utf8'));
    assert.equal(onDisk.verdict, 'unrefuted', 'the ORIGINAL vote is preserved (skip, not overwrite)');

    // The explicit overwrite escape hatch DOES overwrite (so a forced re-run is still possible).
    const forced = persistVote(voteDir, { ...vote, verdict: 'refuted' }, { overwrite: true });
    assert.equal(forced.persisted, true, 'overwrite:true re-persists');
    const after = JSON.parse(fs.readFileSync(votePath(voteDir, vote.id), 'utf8'));
    assert.equal(after.verdict, 'refuted', 'overwrite:true replaces the vote');
  } finally {
    fs.rmSync(voteDir, { recursive: true, force: true });
  }
});

test('persistVote fails closed on a missing trace, bad verdict, or empty id (D-10 trace is REQUIRED)', () => {
  const voteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-offline-failclosed-'));

  try {
    assert.throws(
      () => persistVote(voteDir, { id: 'x', verdict: 'refuted' }),
      (e) => e.name === 'ContractError' && /trace/.test(e.message),
      'a vote with NO search trace fails closed (D-10)',
    );
    assert.throws(
      () => persistVote(voteDir, { id: 'x', verdict: 'maybe', trace: { queries: [], depth: 0, stop_reason: 'x' } }),
      (e) => e.name === 'ContractError' && /verdict/.test(e.message),
      'an out-of-enum verdict fails closed',
    );
    assert.throws(
      () => persistVote(voteDir, { id: '', verdict: 'refuted', trace: { queries: [], depth: 0, stop_reason: 'decisive-evidence' } }),
      (e) => e.name === 'ContractError',
      'an empty id fails closed',
    );
  } finally {
    fs.rmSync(voteDir, { recursive: true, force: true });
  }
});

test('persistVote fails closed on an unknown trace.stop_reason; every known enum value persists (D1-10)', () => {
  const voteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-offline-stopreason-'));

  try {
    // A structurally-valid trace whose stop_reason is NOT a search-and-stop enum value fails closed: a
    // vote whose trace did not come from the shared loop is not diagnosable (parity vs stopped-early).
    assert.throws(
      () => persistVote(voteDir, { id: 'haiku--trap-090', verdict: 'refuted', trace: { queries: ['q'], depth: 3, stop_reason: 'made-up' } }),
      (e) => e.name === 'ContractError' && /stop_reason/.test(e.message),
      'an out-of-enum stop_reason fails closed (D1-10)',
    );

    // DISCRIMINATING control: each of the three real search-and-stop enum values persists.
    for (const reason of ['decisive-evidence', 'exhausted', 'min-not-met']) {
      const res = persistVote(voteDir, { id: 'ok--' + reason, verdict: 'refuted', trace: { queries: ['q'], depth: 3, stop_reason: reason } });
      assert.equal(res.persisted, true, 'a known stop_reason (' + reason + ') persists');
    }
  } finally {
    fs.rmSync(voteDir, { recursive: true, force: true });
  }
});

test('votePath routes the vote id through safeId (a traversal id is rejected, T-19-TRAVERSE)', () => {
  const voteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-offline-safeid-'));

  try {
    // A crafted id that attempts parent traversal must be rejected before it can reach any path.
    assert.throws(
      () => votePath(voteDir, '../evil'),
      (e) => e.name === 'ContractError',
      'a traversal vote id is rejected by safeId',
    );

    // A well-formed id resolves under the vote dir (basename only).
    const p = votePath(voteDir, 'haiku--trap-003');
    assert.ok(p.startsWith(voteDir), 'a well-formed id resolves under the vote dir');
    assert.ok(!p.includes('..'), 'no parent-dir reference in the resolved path');
  } finally {
    fs.rmSync(voteDir, { recursive: true, force: true });
  }
});

// ===========================================================================
// scorePositiveControls (RE-PLAN-5 Finding 1): the positive-control accuracy + the always-refute artifact.
// ===========================================================================

// Write a control vote dir of { id, verdict } records (the shape scorePositiveControls reads) + the
// matching positiveControlGold map (every id -> 'unrefuted'). Returns { dir, gold }.
function writeControlVotes(votes) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-offline-controls-'));
  const gold = {};

  for (const v of votes) {
    fs.writeFileSync(path.join(dir, v.id + '.json'), JSON.stringify({ id: v.id, verdict: v.verdict, seat: 'sonnet' }) + '\n', 'utf8');
    gold[v.id] = 'unrefuted';
  }

  return { dir, gold };
}

test('scorePositiveControls DISCRIMINATES: an all-uphold control voter -> accuracy 1.0 + alwaysRefuteArtifact false; an all-refute voter -> alwaysRefuteArtifact true', () => {
  // The voter UPHOLDS every positive control (the correct vote -- the survivors entail the original
  // claim) -> accuracy 1.0, NOT an always-refute artifact.
  const upholdVotes = [
    { id: 'ctrl-000', verdict: 'unrefuted' },
    { id: 'ctrl-001', verdict: 'unrefuted' },
    { id: 'ctrl-002', verdict: 'unrefuted' },
  ];
  const up = writeControlVotes(upholdVotes);

  // The voter REFUTES the controls (a degenerate always-refute prior) -> alwaysRefuteArtifact true (the
  // saturation read is uninterpretable). DISCRIMINATING: the OPPOSITE alwaysRefuteArtifact value.
  const refuteVotes = [
    { id: 'ctrl-100', verdict: 'refuted' },
    { id: 'ctrl-101', verdict: 'refuted' },
    { id: 'ctrl-102', verdict: 'refuted' },
  ];
  const ref = writeControlVotes(refuteVotes);

  try {
    const upScore = scorePositiveControls({ voteDir: up.dir, positiveControlGold: up.gold, nControls: 3 });
    assert.equal(upScore.upheld, 3, 'all 3 controls upheld');
    assert.equal(upScore.refuted, 0, 'no control refuted');
    assert.equal(upScore.accuracy, 1.0, 'accuracy 1.0 (the voter upholds every control)');
    assert.equal(upScore.alwaysRefuteArtifact, false, 'an all-uphold voter is NOT an always-refute artifact');

    const refScore = scorePositiveControls({ voteDir: ref.dir, positiveControlGold: ref.gold, nControls: 3 });
    assert.equal(refScore.refuted, 3, 'all 3 controls refuted (degenerate always-refute prior)');
    assert.equal(refScore.alwaysRefuteArtifact, true, 'an all-refute voter IS an always-refute artifact (the saturation read is VOID/uninterpretable)');

    assert.notEqual(upScore.alwaysRefuteArtifact, refScore.alwaysRefuteArtifact, 'scorePositiveControls genuinely DISCRIMINATES uphold vs refute');
  } finally {
    fs.rmSync(up.dir, { recursive: true, force: true });
    fs.rmSync(ref.dir, { recursive: true, force: true });
  }
});

test('scorePositiveControls: ANY single control refute (tolerance ZERO) -> alwaysRefuteArtifact true', () => {
  // 4 controls upheld, 1 refuted -> the PRE-REGISTERED tolerance is ZERO, so even one refute voids the
  // saturation read. DISCRIMINATING: the all-uphold case above is false; this one refute flips it true.
  const votes = [
    { id: 'ctrl-200', verdict: 'unrefuted' },
    { id: 'ctrl-201', verdict: 'unrefuted' },
    { id: 'ctrl-202', verdict: 'refuted' }, // the single wrong refute
    { id: 'ctrl-203', verdict: 'unrefuted' },
    { id: 'ctrl-204', verdict: 'unrefuted' },
  ];
  const c = writeControlVotes(votes);

  try {
    const score = scorePositiveControls({ voteDir: c.dir, positiveControlGold: c.gold, nControls: 5 });
    assert.equal(score.refuted, 1, 'exactly one control refuted');
    assert.equal(score.alwaysRefuteArtifact, true, 'a single control refute (tolerance ZERO) -> always-refute artifact');
  } finally {
    fs.rmSync(c.dir, { recursive: true, force: true });
  }
});

test('scorePositiveControls FAILS CLOSED on a realized-count mismatch (a partial/stale control pool -- W-2)', () => {
  const votes = [
    { id: 'ctrl-300', verdict: 'unrefuted' },
    { id: 'ctrl-301', verdict: 'unrefuted' },
  ];
  const c = writeControlVotes(votes);

  try {
    // Only 2 control votes written but nControls declared 3 -> fail closed (mirrors readDelta's F3/F4).
    assert.throws(
      () => scorePositiveControls({ voteDir: c.dir, positiveControlGold: c.gold, nControls: 3 }),
      (e) => e.name === 'ContractError' && /realized control vote count != nControls/.test(e.message),
      'a partial control pool fails closed (W-2 realized-count guard)',
    );
  } finally {
    fs.rmSync(c.dir, { recursive: true, force: true });
  }
});

test('scorePositiveControls FAILS CLOSED on a refuted-gold record in the control voteDir (a trap leaked into the control arm -- W-2)', () => {
  // The control arm is gold-separated from the trap arm. A 'refuted'-gold record in the control voteDir
  // is a refuted-gold trap leaked into the control arm -- an invariant violation, NEVER silently scored.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-offline-controls-leak-'));

  try {
    fs.writeFileSync(path.join(dir, 'ctrl-400.json'), JSON.stringify({ id: 'ctrl-400', verdict: 'unrefuted' }) + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'trap-500.json'), JSON.stringify({ id: 'trap-500', verdict: 'refuted' }) + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'ctrl-401.json'), JSON.stringify({ id: 'ctrl-401', verdict: 'unrefuted' }) + '\n', 'utf8');

    // The gold map marks the two ctrl-* records 'unrefuted' but the leaked trap 'refuted' -- the W-2 guard
    // must FAIL CLOSED on the refuted-gold record (it reads ONLY 'unrefuted'-gold records).
    const gold = { 'ctrl-400': 'unrefuted', 'trap-500': 'refuted', 'ctrl-401': 'unrefuted' };

    assert.throws(
      () => scorePositiveControls({ voteDir: dir, positiveControlGold: gold, nControls: 3 }),
      (e) => e.name === 'ContractError' && /non-unrefuted-gold record appeared in the control voteDir/.test(e.message),
      'a refuted-gold record in the control voteDir fails closed (W-2)',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ===========================================================================
// classifyCalibration (RE-PLAN-5 Finding 3): the pre-registered NON-ZERO decision rule -- the FOUR
// terminal labels, with anyUpholdOnMinNotMet DERIVED MECHANICALLY from the supplied pooled traces (W-3).
// ===========================================================================

// A pooled upheld-claim record carrying a representative trace (the shape classifyCalibration audits).
function upheldRecord(id, stopReason) {
  return { id, seat: 'sonnet', verdict: 'unrefuted', trace: { queries: ['q0', 'q1', 'q2'], depth: 6, stop_reason: stopReason } };
}

test('classifyCalibration DISCRIMINATES the FOUR terminal labels (the pre-registered NON-ZERO decision rule)', () => {
  // (1) 0 false-upholds + controls UPHELD (not always-refute) + clean traces -> SATURATED-VOID.
  const saturated = classifyCalibration({
    sonnetFalseUpholds: 0,
    trials: 60,
    positiveControl: { alwaysRefuteArtifact: false, upheld: 9, refuted: 0, accuracy: 1, nControls: 9 },
    traceAudit: { upheldRecords: [], anyUpholdOnTruncatedOrQuotaKilled: false },
  });
  assert.equal(saturated.label, 'SATURATED-VOID', '0 false-upholds + controls upheld + clean -> SATURATED-VOID');

  // (2) 0 false-upholds + controls REFUTED -> ALWAYS-REFUTE-ARTIFACT-VOID (decided FIRST, regardless of trap rate).
  const artifact = classifyCalibration({
    sonnetFalseUpholds: 0,
    trials: 60,
    positiveControl: { alwaysRefuteArtifact: true, upheld: 0, refuted: 9, accuracy: 0, nControls: 9 },
    traceAudit: { upheldRecords: [], anyUpholdOnTruncatedOrQuotaKilled: false },
  });
  assert.equal(artifact.label, 'ALWAYS-REFUTE-ARTIFACT-VOID', '0 false-upholds + controls refuted -> ALWAYS-REFUTE-ARTIFACT-VOID');

  // (3) >= 1 false-uphold + clean traces + controls upheld -> BELOW-CEILING-PROCEED.
  const below = classifyCalibration({
    sonnetFalseUpholds: 2,
    trials: 60,
    positiveControl: { alwaysRefuteArtifact: false, upheld: 9, refuted: 0, accuracy: 1, nControls: 9 },
    traceAudit: { upheldRecords: [upheldRecord('t1', 'exhausted'), upheldRecord('t2', 'decisive-evidence')], anyUpholdOnTruncatedOrQuotaKilled: false },
  });
  assert.equal(below.label, 'BELOW-CEILING-PROCEED', '>=1 false-uphold on clean min-met traces + controls upheld -> BELOW-CEILING-PROCEED');

  // (4) >= 1 false-uphold but an upheld claim's trace is min-not-met -> ARTIFACT-VOID-REDO.
  const redo = classifyCalibration({
    sonnetFalseUpholds: 2,
    trials: 60,
    positiveControl: { alwaysRefuteArtifact: false, upheld: 9, refuted: 0, accuracy: 1, nControls: 9 },
    traceAudit: { upheldRecords: [upheldRecord('t1', 'exhausted'), upheldRecord('t2', 'min-not-met')], anyUpholdOnTruncatedOrQuotaKilled: false },
  });
  assert.equal(redo.label, 'ARTIFACT-VOID-REDO', '>=1 false-uphold on a min-not-met trace -> ARTIFACT-VOID-REDO (never PROCEED)');

  // All four labels are distinct -- the classifier genuinely DISCRIMINATES (not a constant).
  assert.equal(new Set([saturated.label, artifact.label, below.label, redo.label]).size, 4, 'the four terminal labels are distinct');

  // calibratorGate is consumed UNCHANGED: its raw status alone CANNOT distinguish (1) from (2) (both 0
  // false-upholds -> 'saturated') nor (3) from (4) (both >=1 -> 'below-ceiling'); classifyCalibration LAYERS the rule.
  assert.equal(saturated.calibration.status, 'saturated', '(1) wraps a saturated calibratorGate');
  assert.equal(artifact.calibration.status, 'saturated', '(2) ALSO wraps a saturated calibratorGate (status insufficient to distinguish)');
  assert.equal(below.calibration.status, 'below-ceiling', '(3) wraps a below-ceiling calibratorGate');
  assert.equal(redo.calibration.status, 'below-ceiling', '(4) ALSO wraps a below-ceiling calibratorGate (status insufficient to distinguish)');
});

test('classifyCalibration: anyUpholdOnMinNotMet is DERIVED MECHANICALLY from the trace -- flipping ONE upheld trace stop_reason moves BELOW-CEILING-PROCEED -> ARTIFACT-VOID-REDO with NO other input change (W-3)', () => {
  // Identical inputs EXCEPT one upheld record's trace stop_reason: 'exhausted' (clean) vs 'min-not-met'.
  // The label MUST move (3)->(4) with no other change -- proving anyUpholdOnMinNotMet is DERIVED from the
  // trace, NOT a caller-supplied boolean (anyUpholdOnTruncatedOrQuotaKilled stays false in BOTH).
  const base = {
    sonnetFalseUpholds: 1,
    trials: 60,
    positiveControl: { alwaysRefuteArtifact: false, upheld: 9, refuted: 0, accuracy: 1, nControls: 9 },
  };

  const clean = classifyCalibration({
    ...base,
    traceAudit: { upheldRecords: [upheldRecord('t1', 'exhausted')], anyUpholdOnTruncatedOrQuotaKilled: false },
  });
  assert.equal(clean.label, 'BELOW-CEILING-PROCEED', 'a clean exhausted trace -> BELOW-CEILING-PROCEED');
  assert.equal(clean.anyUpholdOnMinNotMet, false, 'no min-not-met derived from a clean trace');

  const dirty = classifyCalibration({
    ...base,
    traceAudit: { upheldRecords: [upheldRecord('t1', 'min-not-met')], anyUpholdOnTruncatedOrQuotaKilled: false },
  });
  assert.equal(dirty.label, 'ARTIFACT-VOID-REDO', 'flipping the SAME upheld trace to min-not-met -> ARTIFACT-VOID-REDO');
  assert.equal(dirty.anyUpholdOnMinNotMet, true, 'min-not-met is DERIVED from the trace stop_reason (not a passed boolean)');
});

test('classifyCalibration: a truncated/quota-killed inspection flag also forces ARTIFACT-VOID-REDO on a >=1 false-uphold (the human-inspection leg, W-3)', () => {
  // The ONLY caller-supplied leg: truncation / quota-kill is out-of-band (not recoverable from the
  // persisted trace stop_reason enum). With clean min-met traces but the inspection flag set -> REDO.
  const redo = classifyCalibration({
    sonnetFalseUpholds: 1,
    trials: 60,
    positiveControl: { alwaysRefuteArtifact: false, upheld: 9, refuted: 0, accuracy: 1, nControls: 9 },
    traceAudit: { upheldRecords: [upheldRecord('t1', 'exhausted')], anyUpholdOnTruncatedOrQuotaKilled: true },
  });
  assert.equal(redo.label, 'ARTIFACT-VOID-REDO', 'a truncated/quota-killed inspection flag forces ARTIFACT-VOID-REDO even on a clean trace');
});

test('classifyCalibration FAILS CLOSED on a missing positiveControl, a missing traceAudit, or an upheldRecords count != sonnetFalseUpholds', () => {
  // A missing positiveControl: the read is CONFOUNDED without it (the WHOLE POINT of Finding 1).
  assert.throws(
    () => classifyCalibration({ sonnetFalseUpholds: 0, trials: 60, traceAudit: { upheldRecords: [], anyUpholdOnTruncatedOrQuotaKilled: false } }),
    (e) => e.name === 'ContractError' && /positiveControl/.test(e.message),
    'a missing positiveControl fails closed (Finding 1)',
  );

  // A missing traceAudit: a below-ceiling read is unaudited.
  assert.throws(
    () => classifyCalibration({ sonnetFalseUpholds: 1, trials: 60, positiveControl: { alwaysRefuteArtifact: false } }),
    (e) => e.name === 'ContractError' && /traceAudit/.test(e.message),
    'a missing traceAudit fails closed',
  );

  // upheldRecords count (1) != sonnetFalseUpholds (2): the audited set must match the false-uphold count.
  assert.throws(
    () => classifyCalibration({
      sonnetFalseUpholds: 2,
      trials: 60,
      positiveControl: { alwaysRefuteArtifact: false },
      traceAudit: { upheldRecords: [upheldRecord('t1', 'exhausted')], anyUpholdOnTruncatedOrQuotaKilled: false },
    }),
    (e) => e.name === 'ContractError' && /must equal sonnetFalseUpholds/.test(e.message),
    'an upheldRecords count != sonnetFalseUpholds fails closed',
  );
});

test('classifyCalibration consumes calibratorGate BYTE-IDENTICAL (it still enforces the MIN_K floor on trials)', () => {
  // calibratorGate is wrapped UNCHANGED -- so its trials >= MIN_K guard still fires through the wrapper.
  assert.throws(
    () => classifyCalibration({
      sonnetFalseUpholds: 0,
      trials: EVAL_THRESHOLDS.MIN_K - 1,
      positiveControl: { alwaysRefuteArtifact: false },
      traceAudit: { upheldRecords: [], anyUpholdOnTruncatedOrQuotaKilled: false },
    }),
    (e) => e.name === 'ContractError' && /MIN_K/.test(e.message),
    'classifyCalibration surfaces calibratorGate trials < MIN_K (calibratorGate is consumed unchanged)',
  );
});

// ===========================================================================
// certifyModel + decisionMatrix (Plan 19-04, Task 2; RE-PLAN-7 -- THE PIVOT). The ABSOLUTE per-model
// verdict (the relative Haiku-MINUS-Sonnet delta + the SATURATED-VOID framing are RETIRED). A clean
// EARNED 0 on a hard, covariate-matched set with the controls upheld + the CI tight certifies WORKS.
// Every assertion is DISCRIMINATING (the four labels are distinct; the one-sided CP is proven wired;
// the four Opus-voter nuances flip on the Opus verdict).
// ===========================================================================

// A pooled upheld-claim record carrying a representative trace (the shape certifyModel audits via W-3).
function upheldTrapRecord(id, stopReason) {
  return { id, seat: 'sonnet', verdict: 'unrefuted', trace: { queries: ['q0', 'q1', 'q2'], depth: 6, stop_reason: stopReason } };
}

// A WORKS-clean traceAudit: the upheld set matches the false-uphold count, no min-not-met / truncation.
function cleanTraceAudit(falseUpholds) {
  const upheldRecords = [];

  for (let i = 0; i < falseUpholds; i += 1) {
    upheldRecords.push(upheldTrapRecord('t' + i, 'exhausted'));
  }

  return { upheldRecords, anyUpholdOnTruncatedOrQuotaKilled: false };
}

test('certifyModel: a clean EARNED 0/36 trap arm + a passing 0/24 control arm + floors met -> WORKS (the PIVOT, NOT the retired SATURATED-VOID)', () => {
  const res = certifyModel({
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });

  assert.equal(res.verdict, 'WORKS', 'a clean earned 0 with the floors met + the CI tight + the controls upheld -> WORKS (the PIVOT)');
  assert.equal(res.estimandA.pass, true, 'PASS_A: CP1s(0,36)=0.0798 <= TAU_FU (0.10)');
  assert.equal(res.estimandB.pass, true, 'PASS_B: CP1s(0,24)=0.1173 <= TAU_OR (0.15)');
  assert.ok(Math.abs(res.estimandA.cpUpper - clopperPearsonUpperOneSided(0, 36)) < 1e-12, 'estimandA.cpUpper is the ONE-SIDED CP at (0,36)');
  assert.ok(Math.abs(res.estimandB.cpUpper - clopperPearsonUpperOneSided(0, 24)) < 1e-12, 'estimandB.cpUpper is the ONE-SIDED CP at (0,24)');
  assert.equal(res.anyUpholdOnMinNotMet, false, 'no min-not-met derived from a clean (empty) upheld set');
});

test('certifyModel: a false-uphold CI exceeding TAU_FU (2/30) -> DOES-NOT-WORK (estimand A fails)', () => {
  const res = certifyModel({
    model: 'haiku',
    falseUpholds: 2,
    nTrap: 36,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(2),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });

  // CP1s(2,30)=0.1953 but with nTrap=36 here CP1s(2,36) is still > 0.10 -- estimand A fails the bar.
  assert.equal(res.verdict, 'DOES-NOT-WORK', 'a false-uphold CI above TAU_FU -> DOES-NOT-WORK');
  assert.equal(res.estimandA.pass, false, 'PASS_A fails (CP1s(2,36) > TAU_FU)');
  assert.ok(res.estimandA.cpUpper > EVAL_THRESHOLDS.TAU_FU, 'the false-uphold CI exceeds TAU_FU');
});

test('certifyModel uses the ONE-SIDED CP (a 1/46 trap arm PASSES one-sided but FAILS two-sided -> WORKS, proving the F2 convention is wired)', () => {
  // CP1s(1,46)=0.0990 <= 0.10 (PASS one-sided) while CP2s(1,46)=0.1153 > 0.10 (would FAIL two-sided).
  // A regression delegating to the two-sided clopperPearsonUpper would return DOES-NOT-WORK here.
  assert.ok(clopperPearsonUpperOneSided(1, 46) <= EVAL_THRESHOLDS.TAU_FU, 'CP1s(1,46) <= TAU_FU (one-sided PASS)');
  assert.ok(clopperPearsonUpper(1, 46) > EVAL_THRESHOLDS.TAU_FU, 'CP2s(1,46) > TAU_FU (two-sided would FAIL)');

  const res = certifyModel({
    model: 'sonnet',
    falseUpholds: 1,
    nTrap: 46,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(1),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });

  assert.equal(res.verdict, 'WORKS', 'a 1/46 trap arm that passes one-sided certifies WORKS (proves the one-sided convention is wired)');
  assert.equal(res.estimandA.pass, true, 'PASS_A one-sided at (1,46)');
});

test('certifyModel: nTrap below N_TRAP_FLOOR (or nCtrl below N_CTRL_FLOOR) -> VOID-on-power FIRST (the authoritative power gate, W3)', () => {
  // nTrap=4 (the assembler build-floor of 3 builds an arm, but certifyModel is the authoritative power
  // gate -- 4 is far below the 36 adequacy floor). DISCRIMINATING vs the assembler build-floor.
  const lowTrap = certifyModel({
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 4,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });
  assert.equal(lowTrap.verdict, 'VOID-on-power', 'nTrap=4 < N_TRAP_FLOOR=36 -> VOID-on-power (the authoritative power gate)');

  const lowCtrl = certifyModel({
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 0,
    nCtrl: 10,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });
  assert.equal(lowCtrl.verdict, 'VOID-on-power', 'nCtrl=10 < N_CTRL_FLOOR=24 -> VOID-on-power');
});

test('certifyModel: an upheld false-uphold on a min-not-met trace -> VOID-artifact (W-3 mechanical derivation; an uphold on a bad trace is an artifact, not capability)', () => {
  const res = certifyModel({
    model: 'haiku',
    falseUpholds: 1,
    nTrap: 46,
    overRefusals: 0,
    nCtrl: 24,
    // One upheld record on a min-not-met trace -> derived anyUpholdOnMinNotMet -> VOID-artifact.
    traceAudit: { upheldRecords: [upheldTrapRecord('t0', 'min-not-met')], anyUpholdOnTruncatedOrQuotaKilled: false },
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });

  assert.equal(res.verdict, 'VOID-artifact', 'a false-uphold on a min-not-met trace -> VOID-artifact');
  assert.equal(res.anyUpholdOnMinNotMet, true, 'min-not-met is DERIVED MECHANICALLY from the trace stop_reason (W-3), not a passed boolean');
});

test('certifyModel: an always-refute control collapse -> VOID-artifact (the F1 always-refute prior is caught by the over-refusal arm)', () => {
  // The control arm collapses to an always-refute artifact: every control refuted (overRefusals=nCtrl).
  const res = certifyModel({
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 24,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });

  assert.equal(res.verdict, 'VOID-artifact', 'an always-refute control collapse -> VOID-artifact, NEVER WORKS (the WHOLE POINT of F1)');
});

test('certifyModel: a failed difficulty / covariate / evidence-absent floor -> the respective VOID (F5/F7)', () => {
  const base = {
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  };

  assert.equal(certifyModel({ ...base, difficultyFloorMet: false }).verdict, 'VOID-difficulty', 'difficultyFloorMet=false -> VOID-difficulty (F5)');
  assert.equal(certifyModel({ ...base, covariateOverlapMet: false }).verdict, 'VOID-covariate', 'covariateOverlapMet=false -> VOID-covariate (F5)');
  // The evidence-absent stratum floor (F7): an unmet stratum is VOID-on-power scoped to evidence-absent,
  // NEVER a silent WORKS over a sub-construct WiCE cannot supply.
  assert.equal(certifyModel({ ...base, evidenceAbsentStratumMet: false }).verdict, 'VOID-on-power', 'evidenceAbsentStratumMet=false -> VOID-on-power scoped to evidence-absent (F7)');
});

test('certifyModel: PASS_A AND PASS_B conjunction -- passing the trap arm but OVER-REFUSING the controls is NOT WORKS (the always-refute prior is caught)', () => {
  // ESTIMAND A passes (0 false-upholds on a clean trap arm) but ESTIMAND B fails (over-refuses the
  // controls beyond TAU_OR: 3/24 -> CP1s(3,24)=0.2923 > 0.15). NOT WORKS -- DOES-NOT-WORK on the control arm.
  const res = certifyModel({
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 3,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });

  assert.equal(res.estimandA.pass, true, 'PASS_A: the trap arm is clean');
  assert.equal(res.estimandB.pass, false, 'PASS_B fails: the over-refusal CI exceeds TAU_OR');
  assert.notEqual(res.verdict, 'WORKS', 'passing only ESTIMAND A is NEVER WORKS (the always-refute prior must be ruled out by the control arm)');
  assert.equal(res.verdict, 'DOES-NOT-WORK', 'over-refusing the controls beyond TAU_OR (not a full collapse) -> DOES-NOT-WORK');
});

test('certifyModel fails closed on out-of-contract inputs (negative counts, missing floor flags, missing traceAudit)', () => {
  const base = {
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  };

  assert.throws(() => certifyModel({ ...base, falseUpholds: -1 }), (e) => e.name === 'ContractError', 'a negative falseUpholds fails closed');
  assert.throws(() => certifyModel({ ...base, model: '' }), (e) => e.name === 'ContractError', 'an empty model fails closed');
  assert.throws(() => certifyModel({ ...base, difficultyFloorMet: undefined }), (e) => e.name === 'ContractError', 'a missing floor flag fails closed (the read is confounded without the F5/F7 floors)');
  assert.throws(() => certifyModel({ ...base, traceAudit: null }), (e) => e.name === 'ContractError', 'a missing traceAudit fails closed');
});

// ---- decisionMatrix: the four ship cells + the four Opus-voter nuances ----

function worksResult(model) {
  return certifyModel({
    model,
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });
}

function doesNotWorkResult(model) {
  return certifyModel({
    model,
    falseUpholds: 2,
    nTrap: 36,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(2),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });
}

test('decisionMatrix DISCRIMINATES the four ship cells (both / only-sonnet / only-haiku / neither) over the Haiku x Sonnet cross-product', () => {
  const works = worksResult('opus'); // a WORKS Opus so the cell is the only thing varying

  const both = decisionMatrix({ haiku: worksResult('haiku'), sonnet: worksResult('sonnet'), opus: works });
  assert.equal(both.cell, 'both', 'both subjects WORKS -> cell "both"');

  const onlySonnet = decisionMatrix({ haiku: doesNotWorkResult('haiku'), sonnet: worksResult('sonnet'), opus: works });
  assert.equal(onlySonnet.cell, 'only-sonnet', 'only Sonnet WORKS -> "only-sonnet"');

  const onlyHaiku = decisionMatrix({ haiku: worksResult('haiku'), sonnet: doesNotWorkResult('sonnet'), opus: works });
  assert.equal(onlyHaiku.cell, 'only-haiku', 'only Haiku WORKS -> "only-haiku"');

  const neither = decisionMatrix({ haiku: doesNotWorkResult('haiku'), sonnet: doesNotWorkResult('sonnet'), opus: works });
  assert.equal(neither.cell, 'neither', 'neither subject WORKS -> "neither"');

  assert.equal(new Set([both.cell, onlySonnet.cell, onlyHaiku.cell, neither.cell]).size, 4, 'the four ship cells are distinct (the matrix genuinely DISCRIMINATES)');
});

test('decisionMatrix: the SHIP cell is the Haiku x Sonnet cross-product -- Opus is NOT a ship cell (nuance i)', () => {
  // Opus DOES-NOT-WORK but BOTH cheap tiers WORK -> the ship cell is still "both" (Opus is the reference
  // ROW, never a ship cell). DISCRIMINATING: the Opus verdict does NOT change the cell.
  const m = decisionMatrix({ haiku: worksResult('haiku'), sonnet: worksResult('sonnet'), opus: doesNotWorkResult('opus') });
  assert.equal(m.cell, 'both', 'the ship cell is Haiku x Sonnet only -- Opus failing does not change it (nuance i)');
});

test('decisionMatrix: opusFailsBar is the NEW first-class MAJOR finding + raiseToUser true when Opus is NOT WORKS (nuance ii)', () => {
  const opusFails = decisionMatrix({ haiku: worksResult('haiku'), sonnet: worksResult('sonnet'), opus: doesNotWorkResult('opus') });
  assert.equal(opusFails.opusReference.opusFailsBar, true, 'opusFailsBar TRUE when Opus is NOT WORKS (the quality anchor is below its own gate -- MAJOR finding)');
  assert.equal(opusFails.raiseToUser, true, 'opusFailsBar -> raiseToUser true (RAISE distinctly)');

  const opusWorks = decisionMatrix({ haiku: worksResult('haiku'), sonnet: worksResult('sonnet'), opus: worksResult('opus') });
  assert.equal(opusWorks.opusReference.opusFailsBar, false, 'opusFailsBar FALSE when Opus WORKS (DISCRIMINATING)');
});

test('decisionMatrix: the near-Opus diagnostic is CONDITIONAL on Opus clearing the bar (nuance iii)', () => {
  // When Opus WORKS the near-Opus diagnostic is meaningful (a computed value); when Opus does NOT work
  // it is suppressed (value null, meaningful false -- tracking a wrong model is not reassurance).
  const opusWorks = decisionMatrix({ haiku: worksResult('haiku'), sonnet: worksResult('sonnet'), opus: worksResult('opus') });
  assert.equal(opusWorks.nearOpusDiagnostic.meaningful, true, 'near-Opus meaningful when Opus WORKS');

  const opusFails = decisionMatrix({ haiku: worksResult('haiku'), sonnet: worksResult('sonnet'), opus: doesNotWorkResult('opus') });
  assert.equal(opusFails.nearOpusDiagnostic.meaningful, false, 'near-Opus NOT meaningful when Opus fails (nuance iii)');
  assert.equal(opusFails.nearOpusDiagnostic.value, null, 'the near-Opus value is suppressed (null) when Opus fails');
});

test('decisionMatrix: framing is always "clears-the-closed-book-SCREEN" (F4 -- never production-safe) + raiseToUser is always true (settle-OR-raise)', () => {
  const m = decisionMatrix({ haiku: worksResult('haiku'), sonnet: worksResult('sonnet'), opus: worksResult('opus') });
  assert.equal(m.framing, 'clears-the-closed-book-SCREEN', 'the framing is locked to the SCREEN (F4 -- not production-safe)');
  assert.equal(m.raiseToUser, true, 'raiseToUser is always true (settle-OR-raise; a both-WORKS cell still does not auto-flip Haiku ON)');
});

test('decisionMatrix: a subject VOID surfaces in the cell + raiseToUser true', () => {
  const voidHaiku = certifyModel({
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 4, // below floor -> VOID-on-power
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });
  const m = decisionMatrix({ haiku: voidHaiku, sonnet: worksResult('sonnet'), opus: worksResult('opus') });
  assert.match(m.cell, /VOID/, 'a subject VOID is surfaced in the cell');
  assert.equal(m.raiseToUser, true, 'a subject VOID raises to the user');
});

test('RETIRED SATURATED-VOID framing: the SAME clean-earned-0 inputs the carried classifyCalibration labels SATURATED-VOID now certify WORKS via the RE-PLAN-7 certifyModel path (a clean earned 0 -> WORKS, the PIVOT)', () => {
  // The carried classifyCalibration (kept for back-compat) still labels a clean earned 0 SATURATED-VOID
  // -- but it is NOT the RE-PLAN-7 decision path. The RE-PLAN-7 certifyModel path reads the SAME clean
  // earned 0 (on a difficulty-floor-met, covariate-matched set with the controls upheld + the CI tight)
  // as WORKS. No RE-PLAN-7 test asserts a clean earned 0 -> VOID.
  const legacy = classifyCalibration({
    sonnetFalseUpholds: 0,
    trials: 60,
    positiveControl: { alwaysRefuteArtifact: false, upheld: 24, refuted: 0, accuracy: 1, nControls: 24 },
    traceAudit: { upheldRecords: [], anyUpholdOnTruncatedOrQuotaKilled: false },
  });
  assert.equal(legacy.label, 'SATURATED-VOID', 'the CARRIED back-compat classifyCalibration still labels a clean earned 0 SATURATED-VOID (legacy relative read)');

  const pivot = worksResult('sonnet');
  assert.equal(pivot.verdict, 'WORKS', 'the RE-PLAN-7 certifyModel path reads the SAME clean earned 0 as WORKS (the SATURATED-VOID framing is RETIRED for the decision path)');
});

// ===========================================================================
// Additional coverage -- D1 hardening assertions (Plan 19 Group D)
// ===========================================================================

// ---------------------------------------------------------------------------
// calibratorGate: below-ceiling case at trials=60 (stable above MIN_K).
// ---------------------------------------------------------------------------
test('calibratorGate below-ceiling at trials=60 (stable above MIN_K)', () => {
  const res = calibratorGate({ sonnetFalseUpholds: 3, trials: 60 });
  assert.equal(res.status, 'below-ceiling', 'sonnetFalseUpholds=3 at trials=60 -> below-ceiling');
  assert.equal(res.trials, 60, 'trials recorded as 60');
  assert.equal(res.sonnetFalseUpholds, 3, 'sonnetFalseUpholds recorded as 3');
});

// ---------------------------------------------------------------------------
// calibratorGate: {sonnetFalseUpholds:15, trials:15} (100% miss, at-ceiling) -> below-ceiling.
// All 15 trials are false-upholds: Sonnet fails every trap -> clearly below ceiling, not saturated.
// ---------------------------------------------------------------------------
test('calibratorGate {sonnetFalseUpholds:15, trials:15} (100% miss, at-ceiling) -> below-ceiling', () => {
  const res = calibratorGate({ sonnetFalseUpholds: 15, trials: 15 });
  assert.equal(res.status, 'below-ceiling', 'sonnetFalseUpholds=trials=15 (100% miss) -> below-ceiling (not saturated)');
  assert.equal(res.sonnetFalseUpholds, 15, 'sonnetFalseUpholds recorded');
  assert.equal(res.trials, 15, 'trials recorded');
});

// ---------------------------------------------------------------------------
// calibratorGate: ceiling equals clopperPearsonUpper(1, 60, ALPHA) exactly (not magic 0.0894).
// ---------------------------------------------------------------------------
test('calibratorGate ceiling at trials=60 equals clopperPearsonUpper(1, 60, ALPHA) exactly', () => {
  const res = calibratorGate({ sonnetFalseUpholds: 2, trials: 60 });
  const expected = clopperPearsonUpper(1, 60, EVAL_THRESHOLDS.ALPHA);
  assert.equal(res.ceiling, expected, 'ceiling === clopperPearsonUpper(1, 60, ALPHA) exactly (no magic constant)');
  // The frozen engine value should be near 0.0894 -- prove the formula is wired, not a stub.
  assert.ok(Math.abs(expected - 0.0894) < 0.01, 'clopperPearsonUpper(1, 60, ALPHA) is near the locked table value 0.0894');
});

// ---------------------------------------------------------------------------
// readDelta: standalone assertion -- with zero excess at reliableTrials=10,
// subtleOpenBookDeltaUpper === clopperPearsonUpper(0, 10, ALPHA) (formula identity, decoupled from
// resolveOutcome). At reliableTrials=15 (sufficient), the same zero-excess upper is <= DELTA_UPPER_MAX.
// These are two assertions on the same zero-excess CP formula, each independently discriminating.
// ---------------------------------------------------------------------------
test('readDelta subtleOpenBookDeltaUpper with zero excess equals clopperPearsonUpper(0, reliableTrials, ALPHA) exactly', () => {
  // Part 1: formula identity at reliableTrials=10 (decoupled from resolveOutcome).
  // CP(0, 10, alpha) ~= 0.308 (above DELTA_UPPER_MAX because 10 < RELIABLE_TRIALS -- the formula is
  // still wired correctly; the wider CI reflects fewer trials, not a wrong formula).
  {
    const { gold, ids } = buildPool(10);
    const sonnetDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
    const haikuDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));

    try {
      const read = readDelta({
        sonnetVoteDir: sonnetDir,
        haikuVoteDir: haikuDir,
        goldLabels: gold,
        nPooled: 10,
        reliableTrials: 10,
      });
      assert.equal(read.pooledExcess, 0, 'zero excess confirmed at reliableTrials=10');
      const expected10 = clopperPearsonUpper(0, 10, EVAL_THRESHOLDS.ALPHA);
      assert.equal(read.subtleOpenBookDeltaUpper, expected10, 'subtleOpenBookDeltaUpper === clopperPearsonUpper(0, 10, ALPHA) exactly');
    } finally {
      fs.rmSync(sonnetDir, { recursive: true, force: true });
      fs.rmSync(haikuDir, { recursive: true, force: true });
    }
  }

  // Part 2: at reliableTrials=15 (the canonical RELIABLE_TRIALS), zero excess yields a value
  // that is BOTH equal to clopperPearsonUpper(0, 15, ALPHA) AND <= DELTA_UPPER_MAX (PASS-side).
  {
    const { gold, ids } = buildPool(15);
    const sonnetDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
    const haikuDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));

    try {
      const read = readDelta({
        sonnetVoteDir: sonnetDir,
        haikuVoteDir: haikuDir,
        goldLabels: gold,
        nPooled: 15,
        reliableTrials: 15,
      });
      assert.equal(read.pooledExcess, 0, 'zero excess confirmed at reliableTrials=15');
      const expected15 = clopperPearsonUpper(0, 15, EVAL_THRESHOLDS.ALPHA);
      assert.equal(read.subtleOpenBookDeltaUpper, expected15, 'subtleOpenBookDeltaUpper === clopperPearsonUpper(0, 15, ALPHA) exactly');
      assert.ok(read.subtleOpenBookDeltaUpper <= EVAL_THRESHOLDS.DELTA_UPPER_MAX, 'zero-excess at reliableTrials=15 is <= DELTA_UPPER_MAX (PASS-side)');
    } finally {
      fs.rmSync(sonnetDir, { recursive: true, force: true });
      fs.rmSync(haikuDir, { recursive: true, force: true });
    }
  }
});

// ---------------------------------------------------------------------------
// readDelta: nPooled === k boundary succeeds (no throw).
// ---------------------------------------------------------------------------
test('readDelta nPooled === k boundary case succeeds (no throw)', () => {
  const k = EVAL_THRESHOLDS.MIN_K;
  const { gold, ids } = buildPool(k);
  // Sonnet: 1 false-uphold; Haiku: 1 false-uphold -> excess = 0.
  const sonnetDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
  const haikuDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));

  try {
    // nPooled === k === MIN_K is the exact boundary: must succeed, not throw.
    const read = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels: gold,
      nPooled: k,
      reliableTrials: k,
      k,
    });
    assert.equal(read.nPooled, k, 'nPooled=k succeeds and records the pool size');
  } finally {
    fs.rmSync(sonnetDir, { recursive: true, force: true });
    fs.rmSync(haikuDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// resolveOutcome: escalationFraction exactly === ESCALATION_KILL_HIGH (0.50) -> FAIL-RAISE.
// The cost gate is a STRICT less-than (escalationFraction < KILL_HIGH), so the boundary itself fails.
// ---------------------------------------------------------------------------
test('resolveOutcome escalationFraction === ESCALATION_KILL_HIGH (0.50) -> FAIL-RAISE (strict <)', () => {
  const { gold, ids } = buildPool(15);
  // Sonnet 1, Haiku 1 -> zero excess (otherwise PASS-eligible except for escalation).
  const sonnetDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
  const haikuDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));

  try {
    const read = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels: gold,
      nPooled: 15,
      reliableTrials: 15,
    });
    const calibration = calibratorGate({ sonnetFalseUpholds: read.sonnetFalseUpholds, trials: 15 });
    assert.equal(calibration.status, 'below-ceiling', 'sonnet below ceiling -> delta is read');

    const out = resolveOutcome({
      calibration,
      read,
      escalationFraction: EVAL_THRESHOLDS.ESCALATION_KILL_HIGH,
    });
    assert.equal(out.outcome, 'FAIL-RAISE', 'escalationFraction exactly at KILL_HIGH (0.50) -> FAIL-RAISE (strict < means boundary itself fails)');
  } finally {
    fs.rmSync(sonnetDir, { recursive: true, force: true });
    fs.rmSync(haikuDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// resolveOutcome: just below ESCALATION_KILL_HIGH with clean read + reliable=15 -> PASS.
// Confirms the boundary is tight: the value just below the kill threshold clears the cost gate.
// ---------------------------------------------------------------------------
test('resolveOutcome just below ESCALATION_KILL_HIGH with clean read + reliable=15 -> PASS', () => {
  const { gold, ids } = buildPool(15);
  // Sonnet 1, Haiku 1 -> zero excess.
  const sonnetDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));
  const haikuDir = writeVotes(ids.map((id, i) => ({ id, verdict: i < 1 ? 'unrefuted' : 'refuted' })));

  try {
    const read = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels: gold,
      nPooled: 15,
      reliableTrials: 15,
    });
    const calibration = calibratorGate({ sonnetFalseUpholds: read.sonnetFalseUpholds, trials: 15 });
    assert.equal(calibration.status, 'below-ceiling', 'sonnet below ceiling');

    // One floating-point step below 0.50 clears the strict-< cost gate.
    const justBelow = EVAL_THRESHOLDS.ESCALATION_KILL_HIGH - Number.EPSILON;
    const out = resolveOutcome({ calibration, read, escalationFraction: justBelow });
    assert.equal(out.outcome, 'PASS', 'just below ESCALATION_KILL_HIGH with clean read + reliable=15 -> PASS');
  } finally {
    fs.rmSync(sonnetDir, { recursive: true, force: true });
    fs.rmSync(haikuDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// resolveOutcome: saturated calibrator with a FAIL-side read -> still VOID.
// VOID precedes the engine regardless of the read (the delta is never consulted on saturation).
// ---------------------------------------------------------------------------
test('resolveOutcome saturated calibrator with a FAIL-side read -> still VOID (VOID precedes engine)', () => {
  // A saturated calibrator: Sonnet aces the stratum.
  const calibration = calibratorGate({ sonnetFalseUpholds: 0, trials: 15 });
  assert.equal(calibration.status, 'saturated', 'calibrator is saturated');

  // A read that would be FAIL-RAISE on a below-ceiling stratum (non-zero excess).
  const failRead = {
    subtleOpenBookDeltaUpper: 0.4, // above the 0.25 anchor -> FAIL-side
    reliableTrials: 15,
  };

  const out = resolveOutcome({ calibration, read: failRead, escalationFraction: 0.1 });
  assert.equal(out.outcome, 'VOID', 'saturated calibrator with FAIL-side read -> VOID (engine is never reached)');
  assert.equal(out.raiseToUser, true, 'VOID raises to user');
  assert.equal(out.shipsSonnetDefault, true, 'Sonnet-default ships on VOID');
});

// ---------------------------------------------------------------------------
// readDelta F4 guard: throws at reliableTrials=-1 (negative) and reliableTrials=0.5 (non-integer).
// ---------------------------------------------------------------------------
test('readDelta F4 guard: throws at reliableTrials=-1 (negative) and reliableTrials=0.5 (non-integer)', () => {
  const { gold } = buildPool(5);
  assert.throws(
    () => readDelta({ sonnetVoteDir: 'a', haikuVoteDir: 'b', goldLabels: gold, nPooled: 15, reliableTrials: -1 }),
    (e) => e.name === 'ContractError',
    'reliableTrials=-1 (negative) fails closed',
  );
  assert.throws(
    () => readDelta({ sonnetVoteDir: 'a', haikuVoteDir: 'b', goldLabels: gold, nPooled: 15, reliableTrials: 0.5 }),
    (e) => e.name === 'ContractError',
    'reliableTrials=0.5 (non-integer) fails closed',
  );
});

// ---------------------------------------------------------------------------
// votePersisted: returns false for a nonexistent dir/id (no file exists yet).
// ---------------------------------------------------------------------------
test('votePersisted returns false for a nonexistent dir/id', () => {
  const nonexistentDir = path.join(os.tmpdir(), 'lz-offline-nonexistent-' + Date.now());
  // Neither the dir nor the vote file exists; votePersisted must return false, not throw.
  const result = votePersisted(nonexistentDir, 'some-vote-id');
  assert.equal(result, false, 'votePersisted returns false when the dir/id does not exist');
});
