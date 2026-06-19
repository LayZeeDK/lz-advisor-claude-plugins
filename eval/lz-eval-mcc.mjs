// lz-eval-mcc.mjs
//
// NET-NEW (RE-PLAN-12, NO-SPEND): the MCC + BCa-bootstrap + label-permutation module + the
// PRE-REGISTERED bar constants -- the confound-robust metric that structurally breaks the
// always-refute confound WITHOUT a separately-hand-built positive corpus (the CERTIFY-WORKS-RESEARCH
// finding F4). THE AUTHORITY is 19-04-REPLAN-DECISION-12.md (the board-converged STAGED path to
// certified WORKS) + 19-04-CERTIFY-WORKS-RESEARCH.md (the 7 verified findings).
//
// WHY MCC (F4): the Matthews Correlation Coefficient (Chicco & Jurman) is high ONLY when ALL FOUR
// confusion-matrix cells are good. A degenerate single-class judge -- the always-refute (refuse
// everything) judge -- scores MCC 0 (NOT a high accuracy that a one-sided rate would inflate). MCC
// therefore breaks the always-refute confound STRUCTURALLY, over a difficulty-matched contrastive
// corpus, WITHOUT a separately-hand-built positive corpus.
//
// THE SDT CONSTRAINT (F5/F7, load-bearing): offline NEVER certifies WORKS. A valid WORKS/sensitivity
// verdict MATHEMATICALLY REQUIRES positive trials (d-prime / balanced-accuracy / MCC / AUC all need
// BOTH a hit rate AND a false-alarm rate). The OFFLINE arm is a confound-robust SCREEN whose output
// label is SCREEN-PASS / PROVISIONAL; only the LIVE stage (Phase 20) certifies WORKS. This module is
// the metric engine for that screen, not a WORKS certifier.
//
// THE PRE-REGISTERED BAR: the bar constants below (MCC_BAR_POINT / MCC_CI_ALPHA / MCC_CI_LOWER_FLOOR)
// are module-level literals, CHOSEN NOW and FROZEN BEFORE any contrastive pair is authored or scored.
// Task 8 records them in the lock-rule + manifest WITH A TIMESTAMP; Task 9 authors + scores the pairs.
// The bar is literature-unspecified (RESEARCH GAP), so the pre-register -> author -> score ORDERING is
// the ONLY defense against result-shopping. They are NOT computed from the corpus.
//
// D-07 (the owner directive): bootstrap/permutation RESAMPLING (a seeded deterministic PRNG over the
// item indices) is allowed, but ALL distribution/quantile math -- the BCa bias-correction normal-inverse
// + the percentile/quantile selection -- routes through the pinned jstat@1.9.6 (jStat.normal.inv /
// jStat.normal.cdf). Hand-rolling logGamma/incbeta/betaInv/normal-inverse/quantile is FORBIDDEN. There
// is NO hand-coded normal-inverse / betaInv anywhere in this module.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's hardening primitives ACROSS
// trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It does NOT edit
// the frozen engine (eval/lz-eval-aggregate.mjs); it imports jstat directly for the quantile math.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

// (1) The pinned stats library -- ONLY allowed under eval/ (D-07; jstat 1.9.6 default-export shape).
import jStatPkg from 'jstat';

// (2) Cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (D-10; eval ->
//     runtime, one-directional, never the reverse). safeId guards content-derived ids; ContractError
//     is the fail-closed signal.
import {
  ContractError,
  safeId,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

const { jStat } = jStatPkg;

// ---------------------------------------------------------------------------
// THE PRE-REGISTERED BAR (module-level literals; FROZEN BEFORE any pair is authored or scored).
// Task 8 records these in the lock-rule + manifest WITH A TIMESTAMP; Task 9 authors/scores. These are
// the load-bearing anti-result-shopping anchor. They are NOT derived from the corpus.
//   MCC_BAR_POINT       : the MCC point estimate must be >= this (0.5).
//   MCC_CI_ALPHA        : the one-sided CI alpha (0.05 -> a one-sided 95% lower bound).
//   MCC_CI_LOWER_FLOOR  : the one-sided lower-CI bound must be STRICTLY > this (0). For MCC, 0 is the
//                         chance value (no association), NOT 0.5 (which is the chance ACCURACY between
//                         two balanced classes -- a DIFFERENT scale).
// ---------------------------------------------------------------------------
export const MCC_BAR_POINT = 0.5;
export const MCC_CI_ALPHA = 0.05;
export const MCC_CI_LOWER_FLOOR = 0;

// The FROZEN verdict + gold enum (the same enum the runtime tally reads). A SUPPORTED-gold item should
// be judged 'unrefuted' (the evidence entails the claim); a REFUTED-gold item should be judged
// 'refuted'. The contrastive corpus carries gold in {'unrefuted','refuted'} and verdicts in the same.
const VERDICT_ENUM = Object.freeze(['unrefuted', 'refuted']);

// ---------------------------------------------------------------------------
// matthewsCorrelation({ tp, tn, fp, fn }) -- the four-cell MCC:
//   MCC = (tp*tn - fp*fn) / sqrt((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn))
// When ANY of the four marginal products is zero (a degenerate single-class confusion matrix -- the
// always-refute / always-uphold judge), the denominator is zero -> RETURN 0 (NOT NaN). This is the
// whole point of MCC (F4): the always-refute judge scores 0, never a spuriously-high value. Fail-closed
// ContractError on a non-integer / negative cell.
// ---------------------------------------------------------------------------
export function matthewsCorrelation({ tp, tn, fp, fn } = {}) {
  for (const [name, v] of [['tp', tp], ['tn', tn], ['fp', fp], ['fn', fn]]) {
    if (!Number.isInteger(v) || v < 0) {
      throw new ContractError(
        'matthewsCorrelation requires a non-negative integer ' + name + ': ' + JSON.stringify(v),
        'matthewsCorrelation',
      );
    }
  }

  const numerator = tp * tn - fp * fn;
  const m1 = tp + fp;
  const m2 = tp + fn;
  const m3 = tn + fp;
  const m4 = tn + fn;

  // A degenerate single-class confusion matrix (one or more marginal products zero) -> the denominator
  // is zero. By the MCC convention (Chicco & Jurman) the coefficient is 0 in this case -- the judge has
  // NO discriminative association. RETURN 0, never NaN (the always-refute judge scores 0, F4).
  if (m1 === 0 || m2 === 0 || m3 === 0 || m4 === 0) {
    return 0;
  }

  const denominator = Math.sqrt(m1 * m2 * m3 * m4);

  return numerator / denominator;
}

// ---------------------------------------------------------------------------
// mccFromPairs({ verdicts, gold }) -- map each item's verdict-vs-gold to a confusion cell, then MCC.
// THE CELL MAPPING (treating SUPPORTED/unrefuted as the POSITIVE class):
//   SUPPORTED gold ('unrefuted') + unrefuted verdict -> TP  (the supported item upheld)
//   REFUTED   gold ('refuted')   + refuted verdict   -> TN  (the refuted item caught)
//   REFUTED   gold ('refuted')   + unrefuted verdict -> FP  (a false-uphold)
//   SUPPORTED gold ('unrefuted') + refuted verdict   -> FN  (an over-refusal)
// `verdicts` and `gold` are parallel arrays of {'unrefuted','refuted'} (or arrays of { id, verdict }
// and { id, gold } -- normalized below). Returns { mcc, tp, tn, fp, fn }. ContractError on a verdict /
// gold not in the frozen enum, or a length mismatch.
// ---------------------------------------------------------------------------
function normalizeVerdictList(list, field, where) {
  if (!Array.isArray(list)) {
    throw new ContractError(where + ' requires an array for ' + field + ': ' + JSON.stringify(list), where);
  }

  return list.map((entry, i) => {
    let value;
    let id;

    if (typeof entry === 'string') {
      value = entry;
      id = String(i);
    } else if (entry && typeof entry === 'object') {
      value = entry[field] !== undefined ? entry[field] : entry.value;
      id = entry.id !== undefined ? safeId(String(entry.id), where) : String(i);
    } else {
      throw new ContractError(where + ' invalid ' + field + ' entry at index ' + i + ': ' + JSON.stringify(entry), where);
    }

    if (!VERDICT_ENUM.includes(value)) {
      throw new ContractError(
        where + ' ' + field + ' must be one of ' + JSON.stringify(VERDICT_ENUM) + ': ' + JSON.stringify(value),
        where,
      );
    }

    return { id, value };
  });
}

export function mccFromPairs({ verdicts, gold } = {}) {
  const v = normalizeVerdictList(verdicts, 'verdict', 'mccFromPairs');
  const g = normalizeVerdictList(gold, 'gold', 'mccFromPairs');

  if (v.length !== g.length) {
    throw new ContractError(
      'mccFromPairs requires verdicts.length === gold.length: ' + v.length + ' !== ' + g.length,
      'mccFromPairs',
    );
  }

  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (let i = 0; i < v.length; i += 1) {
    const verdict = v[i].value;
    const goldLabel = g[i].value;

    if (goldLabel === 'unrefuted' && verdict === 'unrefuted') {
      tp += 1;
    } else if (goldLabel === 'refuted' && verdict === 'refuted') {
      tn += 1;
    } else if (goldLabel === 'refuted' && verdict === 'unrefuted') {
      fp += 1;
    } else {
      // goldLabel === 'unrefuted' && verdict === 'refuted'
      fn += 1;
    }
  }

  return { mcc: matthewsCorrelation({ tp, tn, fp, fn }), tp, tn, fp, fn };
}

// ---------------------------------------------------------------------------
// A deterministic PRNG (mulberry32 over a 32-bit FNV-1a hash of the seed) -- the SEEDED resampling
// source for the bootstrap + the permutation test. RESAMPLING is allowed (D-07); only the
// distribution/quantile math is required to route through jstat (none lives here -- this is index
// selection only).
// ---------------------------------------------------------------------------
function hash32(str) {
  let h = 2166136261 >>> 0;

  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }

  return h >>> 0;
}

function mulberry32(a) {
  let t = a >>> 0;

  return function next() {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);

    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Compute MCC over a list of (verdict, gold) cells given an index selection (a resample / the identity).
function mccOverIndices(verdictValues, goldValues, indices) {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (const i of indices) {
    const verdict = verdictValues[i];
    const goldLabel = goldValues[i];

    if (goldLabel === 'unrefuted' && verdict === 'unrefuted') {
      tp += 1;
    } else if (goldLabel === 'refuted' && verdict === 'refuted') {
      tn += 1;
    } else if (goldLabel === 'refuted' && verdict === 'unrefuted') {
      fp += 1;
    } else {
      fn += 1;
    }
  }

  return matthewsCorrelation({ tp, tn, fp, fn });
}

// ---------------------------------------------------------------------------
// bcaBootstrapLowerCI({ verdicts, gold, alpha = MCC_CI_ALPHA, resamples = 2000, seed }) -- the
// one-sided (1 - alpha) bias-corrected-and-accelerated (BCa) bootstrap LOWER-CI bound on MCC.
//
// RESAMPLING is allowed (a seeded deterministic PRNG over the item indices). The BCa bias-correction
// z0 (the normal-inverse of the fraction of bootstrap MCCs below the observed MCC), the acceleration a
// (the jackknife skewness), and the adjusted percentile (the normal-inverse / normal-cdf) ALL route
// through jStat.normal.inv / jStat.normal.cdf -- NEVER a hand-coded normal-inverse / quantile (D-07).
// The percentile SELECTION over the sorted bootstrap distribution is an index pick (not distribution
// math); the z-to-percentile conversion is jStat.normal.cdf.
//
// Returns the one-sided lower bound. For a one-sided (1 - alpha) lower CI we take the alpha-quantile of
// the BCa-adjusted bootstrap distribution. Degenerate (all bootstrap MCCs identical, or a zero-variance
// jackknife) falls back to the observed MCC for the bias/acceleration terms (a defined, non-NaN bound).
// ---------------------------------------------------------------------------
export function bcaBootstrapLowerCI({ verdicts, gold, alpha = MCC_CI_ALPHA, resamples = 2000, seed = 'bca' } = {}) {
  const v = normalizeVerdictList(verdicts, 'verdict', 'bcaBootstrapLowerCI');
  const g = normalizeVerdictList(gold, 'gold', 'bcaBootstrapLowerCI');

  if (v.length !== g.length) {
    throw new ContractError(
      'bcaBootstrapLowerCI requires verdicts.length === gold.length: ' + v.length + ' !== ' + g.length,
      'bcaBootstrapLowerCI',
    );
  }

  const n = v.length;

  if (n < 2) {
    throw new ContractError('bcaBootstrapLowerCI requires n >= 2: ' + n, 'bcaBootstrapLowerCI');
  }

  const verdictValues = v.map((e) => e.value);
  const goldValues = g.map((e) => e.value);

  const allIdx = [];

  for (let i = 0; i < n; i += 1) {
    allIdx.push(i);
  }

  const observed = mccOverIndices(verdictValues, goldValues, allIdx);

  // (1) The bootstrap distribution (seeded resampling-with-replacement).
  const rand = mulberry32(hash32(String(seed) + '|bca|' + String(n) + '|' + String(resamples)));
  const boot = [];

  for (let b = 0; b < resamples; b += 1) {
    const idx = new Array(n);

    for (let i = 0; i < n; i += 1) {
      idx[i] = Math.floor(rand() * n);
    }

    boot.push(mccOverIndices(verdictValues, goldValues, idx));
  }

  boot.sort((a, b) => a - b);

  // (2) The bias-correction z0 = normal-inverse of the fraction of bootstrap stats < observed.
  let below = 0;

  for (const stat of boot) {
    if (stat < observed) {
      below += 1;
    }
  }

  let propBelow = below / resamples;

  // Guard the normal-inverse against the 0 / 1 degenerate (would be +/-Infinity). Clamp into (0,1).
  if (propBelow <= 0) {
    propBelow = 1 / (2 * resamples);
  } else if (propBelow >= 1) {
    propBelow = 1 - 1 / (2 * resamples);
  }

  const z0 = jStat.normal.inv(propBelow, 0, 1);

  // (3) The acceleration a = the jackknife skewness of MCC (leave-one-out).
  const jack = [];

  for (let leaveOut = 0; leaveOut < n; leaveOut += 1) {
    const idx = [];

    for (let i = 0; i < n; i += 1) {
      if (i !== leaveOut) {
        idx.push(i);
      }
    }

    jack.push(mccOverIndices(verdictValues, goldValues, idx));
  }

  const jackMean = jack.reduce((s, x) => s + x, 0) / n;
  let num = 0;
  let den = 0;

  for (const j of jack) {
    const d = jackMean - j;
    num += d * d * d;
    den += d * d;
  }

  // den === 0 -> zero-variance jackknife (a constant MCC) -> acceleration 0 (a well-defined fallback).
  const a = den === 0 ? 0 : num / (6 * Math.pow(den, 1.5));

  // (4) The BCa-adjusted lower percentile. zAlpha = normal-inverse of alpha (the one-sided lower tail).
  const zAlpha = jStat.normal.inv(alpha, 0, 1);
  const adjusted = z0 + (z0 + zAlpha) / (1 - a * (z0 + zAlpha));
  // Convert the adjusted z back to a percentile via the normal CDF (jstat, never hand-rolled).
  let p = jStat.normal.cdf(adjusted, 0, 1);

  if (p <= 0) {
    p = 0;
  } else if (p >= 1) {
    p = 1;
  }

  // (5) Select the p-quantile of the sorted bootstrap distribution (an index pick over the resamples).
  const rank = Math.max(0, Math.min(boot.length - 1, Math.floor(p * (boot.length - 1))));

  return boot[rank];
}

// ---------------------------------------------------------------------------
// labelPermutationTestMccPositive({ verdicts, gold, permutations = 5000, seed }) -- the one-sided
// permutation p-value for MCC > 0. Shuffle the GOLD labels (a seeded deterministic permutation),
// recompute MCC each time, and return { p, observed } where p = the fraction of permuted MCCs >= the
// observed MCC (a COUNTING test -- no quantile/distribution math needed). The +1/(perm+1) smoothing
// keeps p strictly positive (the standard Monte-Carlo permutation convention).
// ---------------------------------------------------------------------------
export function labelPermutationTestMccPositive({ verdicts, gold, permutations = 5000, seed = 'perm' } = {}) {
  const v = normalizeVerdictList(verdicts, 'verdict', 'labelPermutationTestMccPositive');
  const g = normalizeVerdictList(gold, 'gold', 'labelPermutationTestMccPositive');

  if (v.length !== g.length) {
    throw new ContractError(
      'labelPermutationTestMccPositive requires verdicts.length === gold.length: ' + v.length + ' !== ' + g.length,
      'labelPermutationTestMccPositive',
    );
  }

  const n = v.length;

  if (n < 2) {
    throw new ContractError('labelPermutationTestMccPositive requires n >= 2: ' + n, 'labelPermutationTestMccPositive');
  }

  const verdictValues = v.map((e) => e.value);
  const goldValues = g.map((e) => e.value);
  const allIdx = [];

  for (let i = 0; i < n; i += 1) {
    allIdx.push(i);
  }

  const observed = mccOverIndices(verdictValues, goldValues, allIdx);

  const rand = mulberry32(hash32(String(seed) + '|perm|' + String(n) + '|' + String(permutations)));
  let geObserved = 0;

  for (let p = 0; p < permutations; p += 1) {
    // A fresh Fisher-Yates shuffle of the gold labels (seeded, deterministic).
    const shuffled = goldValues.slice();

    for (let i = n - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }

    const permMcc = mccOverIndices(verdictValues, shuffled, allIdx);

    if (permMcc >= observed) {
      geObserved += 1;
    }
  }

  // +1/(perm+1) Monte-Carlo smoothing (standard) -- p is never exactly 0.
  const p = (geObserved + 1) / (permutations + 1);

  return { p, observed };
}
