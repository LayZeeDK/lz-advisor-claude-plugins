// lz-eval-difficulty-proxy.mjs
//
// NET-NEW (Plan 20-06, Task 2; D-21 / CERTIFY-WORKS-BOARD-DECISION.md section 3 (b), NO-SPEND): the
// ONE-SIDED difficulty-proxy guard (construct-validity gate (b)). THE AUTHORITY is
// CERTIFY-WORKS-BOARD-DECISION.md section 3 (b): the difficulty proxy is a ONE-SIDED DIRECTIONAL guard.
// Compute the proxy (corroboration distribution + claim length + paraphrase spread) and report it
// descriptively; FAIL the certificate ONLY if the CONSTRUCTED cell is detectably EASIER than the harvested
// dense-SUPPORTED cell beyond a pre-registered margin (easier-direction SMD > 0.5 at the pre-registered
// one-sided alpha). PASS if HARDER or statistically indistinguishable. A symmetric equivalence/TOST test
// is EXPLICITLY REJECTED (underpowered at N~30; the threat is strictly one-tailed -- only an EASIER cell
// fakes specificity).
//
// THE PROXY (board section 3 (b) + 20-PATTERNS-CERTIFY-WORKS.md Item 3): a per-item difficulty score that
// is HIGHER for an EASIER item:
//   - corroboration distribution: rec.corroboration_lower_bound (more corroborating sources -> easier to
//     uphold the SUPPORTED claim -> EASIER); read off the dense bundle (isDenseClaim reads it);
//   - claim length: a SHORTER claim is EASIER (fewer qualifiers to satisfy) -> the proxy adds (1 / length);
//   - paraphrase spread: a LOWER lexical variation between the pair's members is EASIER (the truth-value
//     edit is more salient) -> the proxy adds (1 - jaccard-ish spread).
// The proxy is deterministic, no model call. The SMD compares the constructed cell's proxy distribution to
// the harvested dense-SUPPORTED cell's; a HIGHER constructed-cell mean => the constructed cell is EASIER.
//
// THE CI (D-07 discipline): the SMD itself (mean-difference / pooled-SD) is a PURE hand-rolled
// computation. The one-sided CI uses a SEEDED deterministic bootstrap (resampling is allowed) whose
// bias-correction normal-inverse / normal-cdf quantile math routes through the pinned jstat@1.9.6 (the
// SAME jstat-quantile discipline as eval/lz-eval-mcc.mjs bcaBootstrapLowerCI -- never a hand-rolled
// normal-inverse). The lexical AUC (gate (a), eval/lz-eval-baseline-guard.mjs) stays ZERO-DEP; ONLY this
// gate's CI quantile math routes through jstat.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports jstat directly (ONLY allowed under eval/, D-07) + the SHIPPED runtime
// aggregator's ContractError ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER
// runtime -> eval). It does NOT edit the frozen engine.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).
//
// Pure functions are exported for the validation fixture; the thin CLI is guarded so that `import`-ing
// this module does NOT run the CLI.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// (1) The pinned stats library -- ONLY allowed under eval/ (D-07). The SMD CI's bias-correction
//     normal-inverse / normal-cdf quantile math routes through jStat (the SAME discipline as
//     eval/lz-eval-mcc.mjs bcaBootstrapLowerCI). The SMD itself is hand-rolled.
import jStatPkg from 'jstat';

// (2) Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (D-10; eval -> runtime,
//     one-directional, never the reverse).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

const { jStat } = jStatPkg;

// ---------------------------------------------------------------------------
// THE PRE-REGISTERED BAR (module-level literals; FROZEN BEFORE any pair is authored or scored, recorded
// in the re-authored eval/lz-eval-live-lock-rule.md WITH A TIMESTAMP, Plan 20-06 Task 3). The bar is
// literature-unspecified, so the pre-register -> author -> score ORDERING is the ONLY anti-result-shopping
// defense. NOT computed from the corpus.
//   EASIER_DIRECTION_SMD_MARGIN = 0.5: the certificate FAILS only when the constructed cell is detectably
//     EASIER beyond a standardized-mean-difference of 0.5 (a medium effect, Cohen's d convention).
//   DIFFICULTY_GUARD_ALPHA = 0.05: the one-sided alpha (mirrors eval/lz-eval-mcc.mjs MCC_CI_ALPHA) -- the
//     one-sided lower bound on the easier-direction SMD must exceed the margin for a FAIL.
// ---------------------------------------------------------------------------
export const EASIER_DIRECTION_SMD_MARGIN = 0.5;
export const DIFFICULTY_GUARD_ALPHA = 0.05;

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32 over a 32-bit FNV-1a hash of the seed) -- the SEEDED resampling source
// for the one-sided bootstrap CI. RESAMPLING is allowed (D-07); the distribution/quantile math routes
// through jStat (below). This is the SAME standard algorithm eval/lz-eval-mcc.mjs + eval/lz-eval-oof-
// batch.mjs use for their seeded resampling (mirrored, not a frozen-contract re-derivation -- it is
// index selection only, no distribution math).
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

// ---------------------------------------------------------------------------
// Tokenize (mirrors eval/lz-eval-baseline-guard.mjs tokenize -- lowercase ASCII word tokens). Used for
// the claim-length + paraphrase-spread proxy components.
// ---------------------------------------------------------------------------
function tokenize(text) {
  if (typeof text !== 'string') {
    return [];
  }

  const matches = text.toLowerCase().match(/[a-z0-9]+/g);

  return matches === null ? [] : matches;
}

function tokenCount(text) {
  return tokenize(text).length;
}

// The evidence text of a cell item (joined). Accepts a string, an array of strings, or an array of
// { sentence } / { text } objects.
function evidenceText(evidence) {
  if (typeof evidence === 'string') {
    return evidence;
  }

  if (Array.isArray(evidence)) {
    return evidence
      .map((e) => {
        if (typeof e === 'string') {
          return e;
        }

        if (e != null && typeof e === 'object') {
          if (typeof e.sentence === 'string') {
            return e.sentence;
          }

          if (typeof e.text === 'string') {
            return e.text;
          }
        }

        return '';
      })
      .join(' ');
  }

  return '';
}

// The paraphrase-spread component: 1 - jaccard(claimTokens, evidenceTokens). A LOWER spread (the claim
// closely paraphrases the evidence) is EASIER -> a HIGHER proxy value. Bounded in [0,1].
function paraphraseSpread(claim, evidence) {
  const c = new Set(tokenize(claim));
  const e = new Set(tokenize(evidenceText(evidence)));

  if (c.size === 0 && e.size === 0) {
    return 1; // no tokens -> maximally close paraphrase -> easiest -> proxy 1.
  }

  let inter = 0;

  for (const t of c) {
    if (e.has(t)) {
      inter += 1;
    }
  }

  const union = c.size + e.size - inter;
  const jaccard = union === 0 ? 0 : inter / union;

  // closeness (1 - spread): a higher jaccard = a closer paraphrase = easier. Return the closeness directly.
  return jaccard;
}

// ---------------------------------------------------------------------------
// difficultyProxy({ cell }) -- given a cell (an array of items, each { corroboration_lower_bound, claim,
// evidence }), returns { vector, mean } where `vector` is the per-item difficulty proxy (HIGHER = EASIER)
// = corroboration + (1 / max(1, claimLength)) + paraphraseCloseness. Deterministic, no model call.
//   - corroboration: rec.corroboration_lower_bound (more sources -> easier).
//   - 1/claimLength: a shorter claim -> a higher value -> easier.
//   - paraphraseCloseness: the jaccard of claim vs evidence tokens (a closer paraphrase -> easier).
// The three components are summed into a single scalar per item (the relative comparison across cells is
// what the SMD reads; the absolute scale is immaterial because the SMD standardizes by the pooled SD).
// ---------------------------------------------------------------------------
export function difficultyProxy({ cell } = {}) {
  if (!Array.isArray(cell) || cell.length === 0) {
    throw new ContractError('difficultyProxy requires a non-empty cell array', 'difficultyProxy');
  }

  const vector = cell.map((item) => {
    if (item == null || typeof item !== 'object') {
      throw new ContractError('difficultyProxy cell item must be an object', 'difficultyProxy');
    }

    const corroboration = Number.isInteger(item.corroboration_lower_bound) ? item.corroboration_lower_bound : 0;
    const claimLen = tokenCount(item.claim);
    const lengthEase = 1 / Math.max(1, claimLen);
    const closeness = paraphraseSpread(item.claim, item.evidence);

    return corroboration + lengthEase + closeness;
  });

  const mean = vector.reduce((s, x) => s + x, 0) / vector.length;

  return { vector, mean };
}

// ---------------------------------------------------------------------------
// standardizedMeanDifference(a, b) -- the hand-rolled SMD (Cohen's d) = (mean(a) - mean(b)) / pooledSD.
// POSITIVE when cell `a` (the constructed cell) is EASIER (higher proxy) than cell `b` (the harvested
// dense-SUPPORTED cell). Pooled SD uses the (n-1) sample variance per cell. A degenerate zero-pooled-SD
// (both cells constant) -> SMD 0 (no detectable difference). PURE -- no jstat (only the CI uses jstat).
// ---------------------------------------------------------------------------
function mean(xs) {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function sampleVariance(xs, m) {
  if (xs.length < 2) {
    return 0;
  }

  let acc = 0;

  for (const x of xs) {
    const d = x - m;
    acc += d * d;
  }

  return acc / (xs.length - 1);
}

function standardizedMeanDifference(a, b) {
  const ma = mean(a);
  const mb = mean(b);
  const va = sampleVariance(a, ma);
  const vb = sampleVariance(b, mb);
  const na = a.length;
  const nb = b.length;

  // Pooled SD (the classic two-sample Cohen's d denominator).
  const pooledVar = ((na - 1) * va + (nb - 1) * vb) / Math.max(1, na + nb - 2);
  const pooledSd = Math.sqrt(pooledVar);

  if (pooledSd === 0) {
    return 0;
  }

  return (ma - mb) / pooledSd;
}

// ---------------------------------------------------------------------------
// smdOneSidedLowerCI({ constructed, harvested, alpha, seed, resamples }) -- the one-sided (1 - alpha)
// BCa-style bootstrap LOWER bound on the EASIER-direction SMD (constructed minus harvested). RESAMPLING is
// seeded + deterministic; the bias-correction z0 (normal-inverse of the fraction of bootstrap SMDs below
// the observed) + the adjusted percentile (normal-inverse / normal-cdf) route through jStat (the SAME
// discipline as eval/lz-eval-mcc.mjs bcaBootstrapLowerCI). Returns the one-sided lower bound on the SMD.
// A lower bound > the margin means the constructed cell is detectably EASIER (the gate FAILS).
// ---------------------------------------------------------------------------
function smdOneSidedLowerCI({ constructed, harvested, alpha = DIFFICULTY_GUARD_ALPHA, seed = 'difficulty-proxy', resamples = 2000 }) {
  const na = constructed.length;
  const nb = harvested.length;

  if (na < 2 || nb < 2) {
    // Too few items for a meaningful interval -> return the point SMD (a defined, non-NaN bound). The
    // guard then reads the point estimate; the N>=30 arms always clear this.
    return standardizedMeanDifference(constructed, harvested);
  }

  const observed = standardizedMeanDifference(constructed, harvested);
  const rand = mulberry32(hash32(String(seed) + '|smd|' + String(na) + '|' + String(nb) + '|' + String(resamples)));
  const boot = [];

  for (let r = 0; r < resamples; r += 1) {
    const a = new Array(na);
    const b = new Array(nb);

    for (let i = 0; i < na; i += 1) {
      a[i] = constructed[Math.floor(rand() * na)];
    }

    for (let i = 0; i < nb; i += 1) {
      b[i] = harvested[Math.floor(rand() * nb)];
    }

    boot.push(standardizedMeanDifference(a, b));
  }

  boot.sort((x, y) => x - y);

  // BCa bias-correction z0 = normal-inverse of the fraction of bootstrap SMDs strictly below the observed.
  let below = 0;

  for (const s of boot) {
    if (s < observed) {
      below += 1;
    }
  }

  let propBelow = below / resamples;

  if (propBelow <= 0) {
    propBelow = 1 / (2 * resamples);
  } else if (propBelow >= 1) {
    propBelow = 1 - 1 / (2 * resamples);
  }

  const z0 = jStat.normal.inv(propBelow, 0, 1);

  // The acceleration a = the jackknife skewness of the SMD (leave-one-out over the COMBINED resampling
  // index set is intractable two-sample; use the standard a=0 simplification for the two-sample BCa lower
  // bound -- conservative, matching the zero-variance-jackknife fallback in eval/lz-eval-mcc.mjs).
  const a = 0;

  const zAlpha = jStat.normal.inv(alpha, 0, 1);
  const adjusted = z0 + (z0 + zAlpha) / (1 - a * (z0 + zAlpha));
  let p = jStat.normal.cdf(adjusted, 0, 1);

  if (p <= 0) {
    p = 0;
  } else if (p >= 1) {
    p = 1;
  }

  const rank = Math.max(0, Math.min(boot.length - 1, Math.floor(p * (boot.length - 1))));

  return boot[rank];
}

// ---------------------------------------------------------------------------
// oneSidedNotEasierGuard({ constructedCell, harvestedDenseCell, seed, margin, alpha }) -- gate (b). Computes
// the difficulty proxy for BOTH cells, the easier-direction SMD (constructed minus harvested), and the
// one-sided lower CI. Returns { smd, ciBound, margin, notEasier } where:
//   notEasier = NOT(the constructed cell is detectably EASIER beyond `margin` at `alpha`)
//             = NOT(ciBound > margin).
// PASS (notEasier:true) iff the constructed cell is HARDER or statistically indistinguishable (the SMD
// lower bound does NOT exceed the easier-direction margin). FAIL (notEasier:false) iff the constructed
// cell is detectably EASIER (the SMD lower bound > margin). A symmetric TOST is NOT used (the threat is
// strictly one-tailed -- board section 3 (b)).
// ---------------------------------------------------------------------------
export function oneSidedNotEasierGuard({
  constructedCell,
  harvestedDenseCell,
  seed = 'difficulty-proxy',
  margin = EASIER_DIRECTION_SMD_MARGIN,
  alpha = DIFFICULTY_GUARD_ALPHA,
} = {}) {
  const constructed = difficultyProxy({ cell: constructedCell });
  const harvested = difficultyProxy({ cell: harvestedDenseCell });

  const smd = standardizedMeanDifference(constructed.vector, harvested.vector);
  const ciBound = smdOneSidedLowerCI({ constructed: constructed.vector, harvested: harvested.vector, alpha, seed });

  // The constructed cell is detectably EASIER iff its easier-direction SMD lower bound exceeds the margin.
  const detectablyEasier = ciBound > margin;
  const notEasier = !detectablyEasier;

  return {
    smd,
    ciBound,
    margin,
    alpha,
    constructedMean: constructed.mean,
    harvestedMean: harvested.mean,
    notEasier,
  };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--constants` it prints the
// pre-registered constants (the values Task 3 records in the re-authored lock rule WITH A TIMESTAMP).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const mode = process.argv[2];

  if (mode === '--constants') {
    console.log('EASIER_DIRECTION_SMD_MARGIN=' + EASIER_DIRECTION_SMD_MARGIN);
    console.log('DIFFICULTY_GUARD_ALPHA=' + DIFFICULTY_GUARD_ALPHA);
    process.exit(0);
  }

  console.error('lz-eval-difficulty-proxy: usage: node lz-eval-difficulty-proxy.mjs --constants');
  process.exit(2);
}
/* node:coverage enable */
