// lz-eval-sliceA-gold.test.mjs
//
// Validation fixture for the OFF-MODEL Slice-A AVeriTeC filter + collapse + per-direction descriptive
// tally + the frozen feasibility gate (Plan 22-02, Task 2; PAR-06 / D-11 / D-14). Dev-only eval-tree
// test: imports the SCRIPT under test + node stdlib + the committed synthetic fixture only. The module
// reuses the mccFromPairs cell mapping for the per-direction tally; this test asserts the
// collapse/filter/gate/tally BEHAVIOR, never the underlying cell math (owned by lz-eval-mcc.test.mjs).
//
// Asserts the PAR-06 / D-11 / D-14 load-bearing behaviors (each a DISTINCT named test, never a
// tautology):
//   - collapseAvtLabel maps Supported->unrefuted, Refuted->refuted, Conflicting->null (EXCLUDE),
//     NEI->null (HOLD OUT).
//   - filterSliceA strips every leaky gold field (justification/fact_checking_article/questions/
//     label/speaker) and emits ONLY claim + claim_date; it rejects pronoun / leaky-token / over-long
//     claims; it partitions the survivors per collapsed direction.
//   - sliceAFeasibilityGate clears at the resolved counts (N_SUP_MIN/N_REF_MIN both > 0) and names the
//     provisional limits.
//   - tallyPerDirection returns the FOUR confusion cells PER DIRECTION (never a pooled rate, no CI).
//   - SLICE_A_GATE is Object.frozen (N_SUP_MIN 8, N_REF_MIN 8).
//
// DISCRIMINATION (the invert-the-fix proofs, required by the plan):
//   - the gate FAILS to clear on a falsehood-only corpus (N_SUP_MIN unmet) -- proves the both-
//     directions-populated rule is load-bearing.
//   - filterSliceA DROPS a verdict-leaking-token claim that an un-filtered pass would keep.
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-sliceA-gold.test.mjs
// The directory form spuriously exits 1 on this host even when every real test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
import { readJson } from './lz-eval-readjson.mjs';

import {
  SLICE_A_GATE,
  collapseAvtLabel,
  filterSliceA,
  sliceAFeasibilityGate,
  tallyPerDirection,
} from './lz-eval-sliceA-gold.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(HERE, '__fixtures__', 'sliceA-seed.json');

function loadFixtureItems() {
  const data = readJson(FIXTURE);

  return data.claims;
}

// ---------------------------------------------------------------------------
// SLICE_A_GATE: frozen feasibility-gate constants (D-14, RESOLVED FEASIBLE).
// ---------------------------------------------------------------------------

test('SLICE_A_GATE is Object.frozen and carries the resolved feasibility thresholds (N_SUP_MIN 8, N_REF_MIN 8)', () => {
  assert.ok(Object.isFrozen(SLICE_A_GATE), 'SLICE_A_GATE must be Object.frozen (anti-result-shopping)');
  assert.equal(SLICE_A_GATE.N_SUP_MIN, 8);
  assert.equal(SLICE_A_GATE.N_REF_MIN, 8);
});

// ---------------------------------------------------------------------------
// collapseAvtLabel: 4-way -> unrefuted|refuted|null (D-11).
// ---------------------------------------------------------------------------

test('collapseAvtLabel: Supported -> unrefuted, Refuted -> refuted', () => {
  assert.equal(collapseAvtLabel('Supported'), 'unrefuted');
  assert.equal(collapseAvtLabel('Refuted'), 'refuted');
});

test('collapseAvtLabel: Conflicting Evidence/Cherrypicking -> null (EXCLUDE)', () => {
  assert.equal(collapseAvtLabel('Conflicting Evidence/Cherrypicking'), null);
});

test('collapseAvtLabel: Not Enough Evidence -> null (HOLD OUT NEI)', () => {
  assert.equal(collapseAvtLabel('Not Enough Evidence'), null);
});

test('collapseAvtLabel: an unknown label is a ContractError (fail-closed)', () => {
  assert.throws(() => collapseAvtLabel('Mostly True'), ContractError);
});

// ---------------------------------------------------------------------------
// filterSliceA: report-shaped + non-leaking filter; emits claim + claim_date ONLY; partitions.
// ---------------------------------------------------------------------------

test('filterSliceA: collapses + filters the fixture to 3 unrefuted + 3 refuted clean survivors', () => {
  const { unrefuted, refuted } = filterSliceA({ items: loadFixtureItems() });
  assert.equal(unrefuted.length, 3, 'three clean Supported -> unrefuted survive');
  assert.equal(refuted.length, 3, 'three clean Refuted survive (leaky/pronoun/over-long dropped)');
});

test('filterSliceA: emits ONLY claim + claim_date downstream (strips every leaky gold field, T-22-05)', () => {
  const { unrefuted, refuted } = filterSliceA({ items: loadFixtureItems() });

  for (const rec of [...unrefuted, ...refuted]) {
    const keys = Object.keys(rec).sort();
    assert.deepEqual(keys, ['claim', 'claim_date'], 'the voter-facing record carries claim + claim_date only: ' + keys);
    assert.equal(typeof rec.claim, 'string');
    assert.equal(typeof rec.claim_date, 'string');
    // No leaky gold field leaks through.
    assert.equal(rec.justification, undefined);
    assert.equal(rec.fact_checking_article, undefined);
    assert.equal(rec.questions, undefined);
    assert.equal(rec.label, undefined);
    assert.equal(rec.speaker, undefined);
  }
});

test('filterSliceA: EXCLUDES Conflicting and HOLDS OUT NEI (neither survives in either partition)', () => {
  const { unrefuted, refuted } = filterSliceA({ items: loadFixtureItems() });
  const all = [...unrefuted, ...refuted].map((r) => r.claim);
  assert.ok(!all.some((c) => /carbon tax/.test(c)), 'the Conflicting carbon-tax claim must be excluded');
  assert.ok(!all.some((c) => /beetle|bridge restoration/.test(c)), 'the NEI claims must be held out');
});

// ---------------------------------------------------------------------------
// DISCRIMINATION: filterSliceA drops a verdict-leaking-token claim an un-filtered pass would keep.
// ---------------------------------------------------------------------------

test('filterSliceA: DROPS the verdict-leaking-token claim (an un-filtered pass would keep it)', () => {
  // DISCRIMINATION: the fixture carries a Refuted claim containing "debunked hoax" -- verdict-leaking
  // tokens. An UN-filtered pass (collapse only) would keep it as a clean refuted item, making refuted
  // count 4. The leaky-token filter MUST drop it, so refuted count is 3 and no surviving claim carries
  // a leaky token. If the leaky-token rule were removed, this assertion FAILS.
  const { refuted } = filterSliceA({ items: loadFixtureItems() });
  assert.equal(refuted.length, 3, 'the leaky-token claim must be dropped (not 4)');

  for (const rec of refuted) {
    assert.ok(
      !/\b(false|fake|hoax|debunk|fact-check)\b/i.test(rec.claim),
      'no surviving claim may carry a verdict-leaking token: ' + rec.claim,
    );
  }
});

test('filterSliceA: drops a 1st/2nd-person pronoun claim and an over-long claim', () => {
  const { refuted } = filterSliceA({ items: loadFixtureItems() });
  const claims = refuted.map((r) => r.claim);
  assert.ok(!claims.some((c) => /\bI\b|\bour\b/.test(c)), 'the pronoun claim must be dropped');
  assert.ok(claims.every((c) => c.length <= 220), 'no surviving claim exceeds 220 chars');
});

// ---------------------------------------------------------------------------
// sliceAFeasibilityGate: clears at the resolved counts; names provisional limits.
// ---------------------------------------------------------------------------

test('sliceAFeasibilityGate: clears at the resolved counts (95 Supported / 216 Refuted, both > 0)', () => {
  const { cleared, provisionalLimits } = sliceAFeasibilityGate({ supportedCount: 95, refutedCount: 216 });
  assert.equal(cleared, true);
  assert.ok(Array.isArray(provisionalLimits), 'provisionalLimits is always an array');
  const joined = provisionalLimits.join(' | ').toLowerCase();
  assert.ok(/2020/.test(joined), 'the uniform-2020 caveat must be named');
  assert.ok(/topical|narrow/.test(joined), 'the topical-narrowness caveat must be named');
});

test('sliceAFeasibilityGate: clears exactly at the thresholds (8 / 8, both populated)', () => {
  const { cleared } = sliceAFeasibilityGate({ supportedCount: 8, refutedCount: 8 });
  assert.equal(cleared, true);
});

// ---------------------------------------------------------------------------
// DISCRIMINATION: a falsehood-only corpus does NOT clear (both directions must be populated).
// ---------------------------------------------------------------------------

test('sliceAFeasibilityGate: a falsehood-only corpus (0 Supported) does NOT clear (both-directions rule)', () => {
  // DISCRIMINATION: a corpus with 0 clean Supported but 216 Refuted is falsehood-only -- the confusion
  // matrix would be one-sided. The gate requires BOTH directions populated AND >= N_SUP_MIN, so it must
  // NOT clear. If the supportedCount >= N_SUP_MIN check (or the > 0 rule) were dropped, this assertion
  // FAILS.
  const { cleared } = sliceAFeasibilityGate({ supportedCount: 0, refutedCount: 216 });
  assert.equal(cleared, false);
});

test('sliceAFeasibilityGate: a below-threshold count (7 < N_SUP_MIN 8) does NOT clear', () => {
  const { cleared } = sliceAFeasibilityGate({ supportedCount: 7, refutedCount: 216 });
  assert.equal(cleared, false);
});

test('sliceAFeasibilityGate: still names the provisional limits even when it does NOT clear', () => {
  const { cleared, provisionalLimits } = sliceAFeasibilityGate({ supportedCount: 0, refutedCount: 0 });
  assert.equal(cleared, false);
  assert.ok(provisionalLimits.length >= 1, 'provisionalLimits is always named (scopes the read)');
});

// ---------------------------------------------------------------------------
// tallyPerDirection: four confusion cells PER DIRECTION, never pooled, no CI/cert (D-11).
// ---------------------------------------------------------------------------

test('tallyPerDirection: returns per-direction confusion cells, never a single pooled rate', () => {
  // gold: 2 unrefuted (Supported) + 2 refuted; verdicts: the voter catches one of each correctly,
  // and over-refuses one Supported (fn) + false-upholds one Refuted (fp).
  const gold = ['unrefuted', 'unrefuted', 'refuted', 'refuted'];
  const verdicts = ['unrefuted', 'refuted', 'refuted', 'unrefuted'];
  const tally = tallyPerDirection({ verdicts, gold });

  // The result is split per direction -- the unrefuted axis (TP/FN) and the refuted axis (TN/FP).
  assert.ok(tally.unrefuted, 'a per-direction unrefuted block exists');
  assert.ok(tally.refuted, 'a per-direction refuted block exists');
  assert.equal(tally.unrefuted.tp, 1, 'one Supported correctly upheld (TP)');
  assert.equal(tally.unrefuted.fn, 1, 'one Supported over-refused (FN)');
  assert.equal(tally.refuted.tn, 1, 'one Refuted correctly caught (TN)');
  assert.equal(tally.refuted.fp, 1, 'one Refuted false-upheld (FP)');

  // NEVER a pooled accuracy / rate / CI -- D-11 forbids it (descriptive only).
  assert.equal(tally.accuracy, undefined, 'no pooled accuracy');
  assert.equal(tally.rate, undefined, 'no pooled rate');
  assert.equal(tally.ci, undefined, 'no confidence interval');
  assert.equal(tally.lowerCI, undefined, 'no CI bound');
  assert.equal(tally.pass, undefined, 'no pass/fail cert');
});

test('tallyPerDirection: a perfect voter -> per-direction cells with zero errors', () => {
  const gold = ['unrefuted', 'refuted'];
  const verdicts = ['unrefuted', 'refuted'];
  const tally = tallyPerDirection({ verdicts, gold });
  assert.equal(tally.unrefuted.tp, 1);
  assert.equal(tally.unrefuted.fn, 0);
  assert.equal(tally.refuted.tn, 1);
  assert.equal(tally.refuted.fp, 0);
});

test('tallyPerDirection: a verdicts/gold length mismatch is a ContractError (delegated)', () => {
  assert.throws(
    () => tallyPerDirection({ verdicts: ['unrefuted'], gold: ['unrefuted', 'refuted'] }),
    ContractError,
  );
});
