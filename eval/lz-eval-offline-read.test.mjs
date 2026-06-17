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
} from './lz-eval-offline-read.mjs';

import { EVAL_THRESHOLDS, clopperPearsonUpper } from './lz-eval-aggregate.mjs';

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

test('readDelta fails closed when a vote dir has MORE false-upholds than the declared nPooled (F10)', () => {
  const { gold, ids } = buildPool(15);
  // All 15 sonnet votes are false-upholds (unrefuted on refuted-gold); declare a SMALLER pool (10).
  // The post-count guard must fail closed -- else sonnetCorrect goes negative into passAtK.
  const sonnetDir = writeVotes(ids.map((id) => ({ id, verdict: 'unrefuted' })));
  const haikuDir = writeVotes(ids.map((id) => ({ id, verdict: 'refuted' })));

  try {
    assert.throws(
      () => readDelta({ sonnetVoteDir: sonnetDir, haikuVoteDir: haikuDir, goldLabels: gold, nPooled: 10, reliableTrials: 15 }),
      (e) => e.name === 'ContractError' && /exceeds nPooled/.test(e.message),
      'a false-uphold count exceeding nPooled fails closed',
    );
  } finally {
    fs.rmSync(sonnetDir, { recursive: true, force: true });
    fs.rmSync(haikuDir, { recursive: true, force: true });
  }
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
      () => persistVote(voteDir, { id: '', verdict: 'refuted', trace: { queries: [], depth: 0, stop_reason: 'x' } }),
      (e) => e.name === 'ContractError',
      'an empty id fails closed',
    );
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
