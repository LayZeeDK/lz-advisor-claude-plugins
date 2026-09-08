// lz-eval-judge-calibration.test.mjs
//
// Validation fixture for the OFF-MODEL judge-MCC-calibration gate (Plan 22-02, Task 1; PAR-02 / D-13).
// Dev-only eval-tree test: imports the SCRIPT under test + node stdlib only. The calibration module
// delegates ALL stats to eval/lz-eval-mcc.mjs (mccFromPairs + bcaBootstrapLowerCI -> jstat); this test
// asserts the GATE logic + the de-dup + the zero-subtle ContractError, never the underlying stats math
// (that is owned + tested by lz-eval-mcc.test.mjs).
//
// Asserts the PAR-02 / D-13 load-bearing behaviors (each a DISTINCT named test, never a tautology):
//   - judgeCalibrationGate computes mcc + the one-sided lower CI by DELEGATING to mccFromPairs +
//     bcaBootstrapLowerCI, and returns { mcc, lowerCI, cleared } with
//     cleared === (mcc >= JUDGE_MCC_BAR.POINT && lowerCI > JUDGE_MCC_BAR.LOWER_FLOOR).
//   - cleared === false is a DISQUALIFIER (the function returns the flag; the caller stops).
//   - dedupAgreFactVsWice drops any LLM-AggreFact item whose uid is already in the WiCE set.
//   - the calibration gold MUST include >= 1 WiCE partially_supported remap (subtle:true) -- a
//     zero-subtle set is a ContractError.
//   - JUDGE_MCC_BAR re-exports the frozen lz-eval-mcc.mjs bars and is Object.frozen.
//
// DISCRIMINATION (the invert-the-fix proof, required by the plan):
//   - a sub-bar calibration set (a degenerate always-refute judge, MCC 0) returns cleared:false; a
//     well-calibrated near-perfect set returns cleared:true.
//   - a PERFECT-agreement set (MCC 1.0) is the load-bearing boundary case: a perfect set has a
//     ZERO-VARIANCE bootstrap, so the one-sided BCa lower CI collapses to exactly the floor (0). The
//     gate uses `lowerCI > LOWER_FLOOR` (STRICT), so a perfect set is DISQUALIFIED (cleared:false)
//     EVEN THOUGH its MCC 1.0 clears the POINT bar. A buggy `>=` floor would WRONGLY clear it. This is
//     the exact invert-the-fix discriminator the plan requires (lowerCI sits exactly at the floor).
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-judge-calibration.test.mjs
// The directory form spuriously exits 1 on this host even when every real test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
import { MCC_BAR_POINT, MCC_CI_ALPHA, MCC_CI_LOWER_FLOOR } from './lz-eval-mcc.mjs';

import {
  JUDGE_MCC_BAR,
  dedupAgreFactVsWice,
  goldFromWiceLabel,
  judgeCalibrationGate,
} from './lz-eval-judge-calibration.mjs';

// A WELL-CALIBRATED (near-perfect) judge: high MCC with a strictly-positive one-sided lower CI. BOTH
// directions populated. 11/12 correct in each direction -> MCC ~= 0.83, lowerCI ~= 0.53 (> the floor)
// -> the gate CLEARS. One refuted item carries the WiCE partially_supported remap (subtle:true). A
// non-degenerate (non-zero-variance) bootstrap is required for a positive lower CI -- a perfect set
// has zero variance and collapses to the floor (the boundary case below), so the "clears" case uses a
// near-perfect, not a perfect, set.
function wellCalibrated() {
  const gold = [];
  const verdicts = [];

  for (let i = 0; i < 12; i += 1) {
    gold.push({ id: 'sup' + i, gold: 'unrefuted', subtle: false });
    // 11/12 correct in the unrefuted direction (item 11 is a miss).
    verdicts.push({ id: 'sup' + i, verdict: i < 11 ? 'unrefuted' : 'refuted' });
  }

  for (let i = 0; i < 12; i += 1) {
    // Mark the first refuted item subtle (a WiCE partially_supported -> refuted remap).
    gold.push({ id: 'ref' + i, gold: 'refuted', subtle: i === 0 });
    // 11/12 correct in the refuted direction (item 11 is a miss).
    verdicts.push({ id: 'ref' + i, verdict: i < 11 ? 'refuted' : 'unrefuted' });
  }

  return { verdicts, gold };
}

// A PERFECTLY-calibrated judge: every verdict matches gold, both directions populated -> MCC === 1.0.
// The bootstrap is ZERO-VARIANCE (every resample is also perfect), so the one-sided BCa lower CI
// collapses to exactly the floor (0). The STRICT `lowerCI > LOWER_FLOOR` gate therefore DISQUALIFIES a
// perfect set even though MCC 1.0 clears the POINT bar -- the boundary discriminator (a `>=` bug would
// wrongly clear it). One subtle item present.
function perfectCalib() {
  const gold = [];
  const verdicts = [];

  for (let i = 0; i < 6; i += 1) {
    gold.push({ id: 'sup' + i, gold: 'unrefuted', subtle: false });
    verdicts.push({ id: 'sup' + i, verdict: 'unrefuted' });
  }

  for (let i = 0; i < 6; i += 1) {
    gold.push({ id: 'ref' + i, gold: 'refuted', subtle: i === 0 });
    verdicts.push({ id: 'ref' + i, verdict: 'refuted' });
  }

  return { verdicts, gold };
}

// A degenerate always-refute judge: every verdict is 'refuted' regardless of gold. MCC === 0 (the
// single-class confusion matrix), so it MUST be disqualified (cleared:false). One subtle item present.
function alwaysRefuteCalib() {
  const { gold } = wellCalibrated();
  const verdicts = gold.map((g) => ({ id: g.id, verdict: 'refuted' }));

  return { verdicts, gold };
}

// ---------------------------------------------------------------------------
// JUDGE_MCC_BAR: frozen, re-exporting the lz-eval-mcc.mjs default bars (D-13 / D-20).
// ---------------------------------------------------------------------------

test('JUDGE_MCC_BAR is Object.frozen and re-exports the lz-eval-mcc.mjs default bars', () => {
  assert.ok(Object.isFrozen(JUDGE_MCC_BAR), 'JUDGE_MCC_BAR must be Object.frozen (anti-result-shopping)');
  assert.equal(JUDGE_MCC_BAR.POINT, MCC_BAR_POINT);
  assert.equal(JUDGE_MCC_BAR.ALPHA, MCC_CI_ALPHA);
  assert.equal(JUDGE_MCC_BAR.LOWER_FLOOR, MCC_CI_LOWER_FLOOR);
});

// ---------------------------------------------------------------------------
// judgeCalibrationGate: clears on a well-calibrated judge, disqualifies a degenerate one.
// ---------------------------------------------------------------------------

test('judgeCalibrationGate: a well-calibrated judge clears (mcc >= POINT && lowerCI > FLOOR)', () => {
  const { mcc, lowerCI, cleared } = judgeCalibrationGate(wellCalibrated());
  assert.ok(mcc >= JUDGE_MCC_BAR.POINT, 'well-calibrated judge MCC should be >= the point bar, got ' + mcc);
  assert.ok(lowerCI > JUDGE_MCC_BAR.LOWER_FLOOR, 'well-calibrated judge lowerCI should be > the floor, got ' + lowerCI);
  assert.equal(cleared, true);
});

test('judgeCalibrationGate: an always-refute judge (MCC 0) is DISQUALIFIED (cleared:false)', () => {
  // DISCRIMINATION: the degenerate single-class judge scores MCC 0 (the lz-eval-mcc.mjs convention),
  // which is below the POINT bar (0.5) AND not above the lower floor -> cleared:false. This is the
  // DISQUALIFIER the gate must surface; a silent grade would be a critical bug.
  const { mcc, cleared } = judgeCalibrationGate(alwaysRefuteCalib());
  assert.equal(mcc, 0, 'an always-refute judge must score MCC 0 (single-class)');
  assert.equal(cleared, false);
});

test('judgeCalibrationGate: cleared tracks the MCC bar -- the flag flips with the calibration quality', () => {
  // The two sets share the same gold; cleared flips true -> false as the judge degrades from
  // well-calibrated to always-refute. This proves the gate is sensitive to calibration, not a constant.
  assert.equal(judgeCalibrationGate(wellCalibrated()).cleared, true);
  assert.equal(judgeCalibrationGate(alwaysRefuteCalib()).cleared, false);
});

// ---------------------------------------------------------------------------
// DISCRIMINATION: the `>` on the lower-CI floor is load-bearing.
// ---------------------------------------------------------------------------

test('judgeCalibrationGate: a perfect (zero-variance) set whose lowerCI is exactly the floor is DISQUALIFIED (> not >=)', () => {
  // DISCRIMINATION (invert-the-fix): the perfect set scores MCC 1.0 (clears the POINT bar) BUT its
  // zero-variance bootstrap collapses the one-sided BCa lower CI to exactly the floor (0). The gate
  // uses `lowerCI > LOWER_FLOOR` (STRICT), so the perfect set is DISQUALIFIED. A buggy `>=` floor would
  // WRONGLY clear it (MCC 1.0 >= POINT). This is the exact at-floor discriminator.
  const r = judgeCalibrationGate(perfectCalib());

  assert.ok(r.mcc >= JUDGE_MCC_BAR.POINT, 'the perfect set MCC must clear the POINT bar, got ' + r.mcc);
  assert.equal(r.lowerCI, JUDGE_MCC_BAR.LOWER_FLOOR, 'the perfect zero-variance set lowerCI must collapse to the floor');

  // STRICT `>` -> cleared:false. The relaxed `>=` predicate would be true; the module must NOT match it.
  const strict = r.mcc >= JUDGE_MCC_BAR.POINT && r.lowerCI > JUDGE_MCC_BAR.LOWER_FLOOR;
  const relaxed = r.mcc >= JUDGE_MCC_BAR.POINT && r.lowerCI >= JUDGE_MCC_BAR.LOWER_FLOOR;
  assert.equal(strict, false, 'the strict predicate is false at the floor');
  assert.equal(relaxed, true, 'the relaxed (buggy) predicate would be true at the floor');
  assert.equal(r.cleared, false, 'a lowerCI exactly at the floor must NOT clear (> is strict, not >=)');
  assert.equal(r.cleared, strict, 'cleared must equal the STRICT predicate, never the relaxed one');
});

// ---------------------------------------------------------------------------
// dedupAgreFactVsWice: LLM-AggreFact embeds WiCE -> drop overlapping uids (mandatory, D-13).
// ---------------------------------------------------------------------------

test('dedupAgreFactVsWice: drops AggreFact items whose uid is already in the WiCE set', () => {
  const wice = [{ uid: 'w1' }, { uid: 'w2' }, { uid: 'w3' }];
  const aggrefact = [{ uid: 'w2' }, { uid: 'a1' }, { uid: 'w3' }, { uid: 'a2' }];
  const deduped = dedupAgreFactVsWice({ wice, aggrefact });
  const uids = deduped.map((x) => x.uid).sort();
  assert.deepEqual(uids, ['a1', 'a2'], 'only the non-WiCE AggreFact uids survive');
});

test('dedupAgreFactVsWice: with no overlap, the AggreFact array passes through unchanged', () => {
  const wice = [{ uid: 'w1' }];
  const aggrefact = [{ uid: 'a1' }, { uid: 'a2' }];
  const deduped = dedupAgreFactVsWice({ wice, aggrefact });
  assert.deepEqual(deduped.map((x) => x.uid).sort(), ['a1', 'a2']);
});

// ---------------------------------------------------------------------------
// goldFromWiceLabel: DELEGATES to remapLabel to derive { id, gold, subtle } (D-13).
// ---------------------------------------------------------------------------

test('goldFromWiceLabel: partially_supported -> { gold: refuted, subtle: true } (the SUBTLE substratum)', () => {
  const g = goldFromWiceLabel({ id: 'w1', wiceLabel: 'partially_supported' });
  assert.equal(g.id, 'w1');
  assert.equal(g.gold, 'refuted');
  assert.equal(g.subtle, true, 'partially_supported is the subtle-overreach substratum');
});

test('goldFromWiceLabel: supported -> { gold: unrefuted, subtle: false }; not_supported -> { gold: refuted, subtle: false }', () => {
  const sup = goldFromWiceLabel({ id: 'w2', wiceLabel: 'supported' });
  assert.equal(sup.gold, 'unrefuted');
  assert.equal(sup.subtle, false);

  const not = goldFromWiceLabel({ id: 'w3', wiceLabel: 'not_supported' });
  assert.equal(not.gold, 'refuted');
  assert.equal(not.subtle, false);
});

test('goldFromWiceLabel: an unknown WiCE label fails closed via remapLabel (ContractError)', () => {
  assert.throws(() => goldFromWiceLabel({ id: 'w4', wiceLabel: 'totally_unknown' }), ContractError);
});

// ---------------------------------------------------------------------------
// Zero-subtle calibration set is a ContractError (D-13: MUST include partially_supported subtle items).
// ---------------------------------------------------------------------------

test('judgeCalibrationGate: a calibration set with zero subtle items is a ContractError (D-13)', () => {
  const { verdicts, gold } = perfectCalib();
  const noSubtle = gold.map((g) => ({ ...g, subtle: false }));
  assert.throws(
    () => judgeCalibrationGate({ verdicts, gold: noSubtle }),
    ContractError,
    'a calibration set with no WiCE partially_supported subtle item must throw',
  );
});

test('judgeCalibrationGate: a verdicts/gold length mismatch is a ContractError (delegated to mccFromPairs)', () => {
  const { verdicts, gold } = perfectCalib();
  assert.throws(
    () => judgeCalibrationGate({ verdicts: verdicts.slice(1), gold }),
    ContractError,
  );
});
