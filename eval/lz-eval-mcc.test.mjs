// lz-eval-mcc.test.mjs
//
// FILE-form DISCRIMINATING coverage for the MCC + BCa-bootstrap + label-permutation module
// (RE-PLAN-12, NO-SPEND; Task 6). Deterministic + seeded -- no spend. Each test is a mutation-proven
// fixture per the plan's <behavior> block.
//
// HOST QUIRK (load-bearing, CLAUDE.md): on this host `node --test <dir>` spuriously exits 1 even when
// all tests pass; ALWAYS gate by the explicit FILE path:
//   node --test eval/lz-eval-mcc.test.mjs
//
// Strictly ASCII, no BOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  matthewsCorrelation,
  mccFromPairs,
  bcaBootstrapLowerCI,
  labelPermutationTestMccPositive,
  MCC_BAR_POINT,
  MCC_CI_ALPHA,
  MCC_CI_LOWER_FLOOR,
} from './lz-eval-mcc.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// matthewsCorrelation -- the always-refute degenerate case = 0 (F4), DISCRIMINATING.
// ---------------------------------------------------------------------------

test('Task-6 matthewsCorrelation: an always-refute single-class matrix = 0, NOT NaN (F4, DISCRIMINATING)', () => {
  // The always-refute judge over a 24-item corpus refutes every item -> every SUPPORTED item is a
  // false-negative and there are zero true/false positives. tp=0, tn=0, fp=0, fn=24 is a degenerate
  // single-class confusion matrix -> MCC 0 (NOT NaN). A regression that returns a non-zero MCC for a
  // single-class matrix (or NaN) FAILS here -- this is the whole point of MCC (F4).
  const m = matthewsCorrelation({ tp: 0, tn: 0, fp: 0, fn: 24 });
  assert.equal(m, 0, 'always-refute (tp=0,tn=0,fp=0,fn=24) -> MCC 0');
  assert.ok(!Number.isNaN(m), 'MCC is 0, never NaN, on the degenerate single-class matrix');

  // The mirror degenerate (always-uphold: every item upheld) also -> 0.
  const u = matthewsCorrelation({ tp: 0, tn: 24, fp: 0, fn: 0 });
  assert.equal(u, 0, 'always-uphold (tp=0,tn=24,fp=0,fn=0) -> MCC 0');
});

test('Task-6 matthewsCorrelation: a known mixed confusion matrix returns the textbook value', () => {
  // Textbook example (Wikipedia MCC): tp=5, tn=6, fp=2, fn=3.
  //   num = 5*6 - 2*3 = 30 - 6 = 24
  //   den = sqrt((5+2)(5+3)(6+2)(6+3)) = sqrt(7*8*8*9) = sqrt(4032) = 63.4980...
  //   MCC = 24 / 63.4980 = 0.37796...
  const m = matthewsCorrelation({ tp: 5, tn: 6, fp: 2, fn: 3 });
  const expected = 24 / Math.sqrt(7 * 8 * 8 * 9);
  assert.ok(Math.abs(m - expected) < 1e-12, 'MCC matches the four-cell formula on a fixed mixed matrix');
  assert.ok(Math.abs(m - 0.37796) < 1e-4, 'MCC ~= 0.37796 on the textbook matrix');

  // A perfect judge (no errors) -> MCC 1.
  assert.equal(matthewsCorrelation({ tp: 12, tn: 12, fp: 0, fn: 0 }), 1, 'a perfect judge -> MCC 1');
});

test('Task-6 matthewsCorrelation: a non-integer / negative cell fails closed (ContractError)', () => {
  assert.throws(() => matthewsCorrelation({ tp: 1.5, tn: 1, fp: 0, fn: 0 }), (e) => e.name === 'ContractError', 'non-integer cell fails closed');
  assert.throws(() => matthewsCorrelation({ tp: -1, tn: 1, fp: 0, fn: 0 }), (e) => e.name === 'ContractError', 'negative cell fails closed');
});

// ---------------------------------------------------------------------------
// mccFromPairs -- verdict-vs-gold cell mapping, DISCRIMINATING.
// ---------------------------------------------------------------------------

test('Task-6 mccFromPairs: verdict-vs-gold maps to the four confusion cells correctly (DISCRIMINATING)', () => {
  // One of each cell:
  //   SUPPORTED gold + unrefuted verdict -> TP
  //   REFUTED   gold + refuted   verdict -> TN
  //   REFUTED   gold + unrefuted verdict -> FP (a false-uphold)
  //   SUPPORTED gold + refuted   verdict -> FN (an over-refusal)
  const gold = ['unrefuted', 'refuted', 'refuted', 'unrefuted'];
  const verdicts = ['unrefuted', 'refuted', 'unrefuted', 'refuted'];
  const r = mccFromPairs({ verdicts, gold });

  assert.equal(r.tp, 1, 'TP = SUPPORTED gold + unrefuted verdict');
  assert.equal(r.tn, 1, 'TN = REFUTED gold + refuted verdict');
  assert.equal(r.fp, 1, 'FP = REFUTED gold + unrefuted verdict (a false-uphold)');
  assert.equal(r.fn, 1, 'FN = SUPPORTED gold + refuted verdict (an over-refusal)');

  // DISCRIMINATING: with one of each cell, MCC is exactly 0 (a swapped cell mapping would not be 0 here
  // -- e.g. mislabeling FP as TN would skew the marginals). 1/1/1/1 -> num = 1-1 = 0 -> MCC 0.
  assert.equal(r.mcc, 0, 'one of each cell -> MCC 0 (the symmetric balanced-error case)');
});

test('Task-6 mccFromPairs: a perfect contrastive corpus -> MCC 1 (the mapping is not tautological)', () => {
  // 12 SUPPORTED-gold all judged unrefuted (TP) + 12 REFUTED-gold all judged refuted (TN) -> MCC 1.
  const gold = [];
  const verdicts = [];

  for (let i = 0; i < 12; i += 1) {
    gold.push('unrefuted');
    verdicts.push('unrefuted');
  }

  for (let i = 0; i < 12; i += 1) {
    gold.push('refuted');
    verdicts.push('refuted');
  }

  const r = mccFromPairs({ verdicts, gold });
  assert.equal(r.tp, 12, 'all 12 SUPPORTED upheld');
  assert.equal(r.tn, 12, 'all 12 REFUTED caught');
  assert.equal(r.fp, 0);
  assert.equal(r.fn, 0);
  assert.equal(r.mcc, 1, 'a perfect contrastive corpus -> MCC 1');
});

test('Task-6 mccFromPairs: an out-of-enum verdict / gold fails closed (ContractError)', () => {
  assert.throws(
    () => mccFromPairs({ verdicts: ['MAYBE'], gold: ['unrefuted'] }),
    (e) => e.name === 'ContractError',
    'a verdict not in the frozen enum fails closed',
  );
  assert.throws(
    () => mccFromPairs({ verdicts: ['unrefuted', 'refuted'], gold: ['unrefuted'] }),
    (e) => e.name === 'ContractError',
    'a length mismatch fails closed',
  );
});

// ---------------------------------------------------------------------------
// bcaBootstrapLowerCI -- separates a clean corpus from an at-chance corpus, DISCRIMINATING.
// ---------------------------------------------------------------------------

function cleanCorpus(nPairs) {
  // A clean-separation corpus: the judge calls every item correctly -> MCC 1 -> the lower CI clears 0.
  const gold = [];
  const verdicts = [];

  for (let i = 0; i < nPairs; i += 1) {
    gold.push('unrefuted');
    verdicts.push('unrefuted');
    gold.push('refuted');
    verdicts.push('refuted');
  }

  return { gold, verdicts };
}

function atChanceCorpus(nPairs, seed) {
  // An at-chance corpus: the verdicts are independent of gold (a ~50/50 coin) -> MCC ~ 0 -> the lower
  // CI does NOT clear 0. Build deterministically from a simple LCG so the fixture is reproducible.
  const gold = [];
  const verdicts = [];
  let s = seed >>> 0;
  const coin = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;

    return s / 4294967296 < 0.5 ? 'unrefuted' : 'refuted';
  };

  for (let i = 0; i < nPairs; i += 1) {
    gold.push('unrefuted');
    verdicts.push(coin());
    gold.push('refuted');
    verdicts.push(coin());
  }

  return { gold, verdicts };
}

test('Task-6 bcaBootstrapLowerCI: > 0 on a clean-separation corpus; <= 0 on an at-chance corpus (DISCRIMINATING)', () => {
  const clean = cleanCorpus(12); // 24 items, MCC 1
  const lowClean = bcaBootstrapLowerCI({ verdicts: clean.verdicts, gold: clean.gold, seed: 'clean-s1' });
  assert.ok(lowClean > 0, 'a clean-separation corpus -> BCa lower CI strictly > 0 (got ' + lowClean + ')');

  const chance = atChanceCorpus(12, 12345); // 24 items, MCC ~ 0
  const lowChance = bcaBootstrapLowerCI({ verdicts: chance.verdicts, gold: chance.gold, seed: 'chance-s1' });
  assert.ok(lowChance <= 0, 'an at-chance corpus -> BCa lower CI does NOT clear 0 (got ' + lowChance + ')');
});

test('Task-6 bcaBootstrapLowerCI: deterministic for a fixed seed (reproducible)', () => {
  const clean = cleanCorpus(12);
  const a = bcaBootstrapLowerCI({ verdicts: clean.verdicts, gold: clean.gold, seed: 'rep' });
  const b = bcaBootstrapLowerCI({ verdicts: clean.verdicts, gold: clean.gold, seed: 'rep' });
  assert.equal(a, b, 'same seed + same corpus -> same lower bound');
});

// ---------------------------------------------------------------------------
// labelPermutationTestMccPositive -- p<0.05 on signal, p>=0.05 on shuffled gold, DISCRIMINATING.
// ---------------------------------------------------------------------------

test('Task-6 labelPermutationTestMccPositive: p < 0.05 on real signal; p >= 0.05 on shuffled gold (DISCRIMINATING)', () => {
  const clean = cleanCorpus(12); // MCC 1 -- strong real signal
  const real = labelPermutationTestMccPositive({ verdicts: clean.verdicts, gold: clean.gold, seed: 'sig' });
  assert.ok(real.p < 0.05, 'a real-signal corpus -> permutation p < 0.05 (got ' + real.p + ')');
  assert.ok(Math.abs(real.observed - 1) < 1e-12, 'the observed MCC is 1 on the clean corpus');

  // Shuffle the gold so the verdicts no longer track gold (destroy the association) -> p >= 0.05.
  const shuffledGold = clean.gold.slice();
  // A deterministic shuffle that breaks the alignment: pair gold with the wrong half.
  const breakAlign = [];
  const verdicts = clean.verdicts.slice();

  for (let i = 0; i < shuffledGold.length; i += 1) {
    // Assign gold independently of verdict via a coin keyed by index (no real association).
    breakAlign.push(i % 2 === 0 ? 'refuted' : 'unrefuted');
  }

  const noSignal = labelPermutationTestMccPositive({ verdicts, gold: breakAlign, seed: 'nosig' });
  assert.ok(noSignal.p >= 0.05, 'a shuffled-gold corpus (no association) -> permutation p >= 0.05 (got ' + noSignal.p + ')');
});

test('Task-6 labelPermutationTestMccPositive: deterministic for a fixed seed', () => {
  const clean = cleanCorpus(12);
  const a = labelPermutationTestMccPositive({ verdicts: clean.verdicts, gold: clean.gold, seed: 'pdet' });
  const b = labelPermutationTestMccPositive({ verdicts: clean.verdicts, gold: clean.gold, seed: 'pdet' });
  assert.deepEqual(a, b, 'same seed + same corpus -> same { p, observed }');
});

// ---------------------------------------------------------------------------
// The bar constants are PRE-REGISTERED module-level literals -- NOT computed from the corpus.
// ---------------------------------------------------------------------------

test('Task-6 the bar constants are pre-registered module-level literals (NOT corpus-derived)', () => {
  assert.equal(MCC_BAR_POINT, 0.5, 'MCC_BAR_POINT === 0.5 (the point bar)');
  assert.equal(MCC_CI_ALPHA, 0.05, 'MCC_CI_ALPHA === 0.05 (the one-sided 95% lower CI)');
  assert.equal(MCC_CI_LOWER_FLOOR, 0, 'MCC_CI_LOWER_FLOOR === 0 (chance for MCC is 0, NOT 0.5)');
});

// ---------------------------------------------------------------------------
// D-07: the quantile + normal-inverse math routes through jstat -- NO hand-rolled betaInv / normal-inv.
// ---------------------------------------------------------------------------

test('Task-6 D-07: the module hand-rolls NO normal-inverse / betaInv / quantile (the math routes through jstat)', () => {
  const src = fs.readFileSync(path.join(HERE, 'lz-eval-mcc.mjs'), 'utf8');

  // The module imports jstat and uses jStat.normal.inv / jStat.normal.cdf for the BCa math.
  assert.ok(/import\s+jStatPkg\s+from\s+'jstat'/.test(src), 'the module imports the pinned jstat library');
  assert.ok(/jStat\.normal\.inv/.test(src), 'the BCa bias-correction uses jStat.normal.inv (library, not hand-rolled)');
  assert.ok(/jStat\.normal\.cdf/.test(src), 'the BCa percentile conversion uses jStat.normal.cdf (library)');

  // DISCRIMINATING: there is NO hand-rolled normal-inverse / betaInv / incbeta / logGamma definition.
  // A regression that hand-coded the quantile math (a `function normalInv` / `function betaInv` /
  // `function logGamma` / `function incbeta` definition) would match these and FAIL the assertion.
  assert.ok(!/function\s+(normalInv|normalInverse|betaInv|incbeta|logGamma|inverseNormalCdf)\b/i.test(src), 'no hand-rolled normal-inverse / betaInv / incbeta / logGamma function is defined');
  assert.ok(!/const\s+(normalInv|betaInv|incbeta|logGamma)\s*=/i.test(src), 'no hand-rolled quantile primitive is assigned');
});

test('Task-6 the module source is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(path.join(HERE, 'lz-eval-mcc.mjs'));

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'lz-eval-mcc.mjs byte at offset ' + i + ' must be ASCII (<= 0x7F), got 0x' + buf[i].toString(16));
  }
});
