// lz-eval-aggregate.mjs
//
// Deterministic, OFF-MODEL eval aggregator for the lz-advisor Haiku-vs-Sonnet verify-voter gate
// (Plan 18-03). This is the SOLE HARD GATE engine: the verdict is mechanical so the Haiku-vs-Sonnet
// decision cannot be rationalized post-hoc (D-01), the confidence-interval math comes from the
// pinned library so it is not hand-rolled (D-07), and the lock rule (eval/lz-eval-lock-rule.md) is
// pre-registered before any model call (EVAL-04). Plan 18-05's staged eval run consumes this.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in
// the distributed plugin tree. It is the ONLY place jstat is allowed. It imports the SHIPPED runtime
// aggregator's hardening primitives ACROSS trees by relative path -- ONE-DIRECTIONAL (eval ->
// runtime, NEVER runtime -> eval) -- so no eval dependency can ever leak into the marketplace
// package. NEVER add an eval/ import to any plugin-tree file.
//
// All CI / Pass@k math is LIBRARY-COMPUTED via the pinned jstat@1.9.6 (jStat.beta.inv for the
// Clopper-Pearson upper bound, jStat.normal.inv for Wilson, jStat.combination for Pass@k). There is
// NO in-repo logGamma / incbeta / betaInv and NO hand-coded Clopper-Pearson / Wilson / comb --
// hand-rolling the statistics is FORBIDDEN by the 2026-06-16 owner directive (D-07). The test pins
// only the verified anchors to prove the library is wired.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark; the
// imported stripBom handles a BOM at read time (ASCII-only source per CLAUDE.md).
//
// Pure functions + the frozen EVAL_THRESHOLDS are exported for the validation fixture; the thin CLI
// is guarded so that `import`-ing this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// (1) The pinned stats library -- ONLY allowed under eval/ (D-07; jstat 1.9.6 default-export shape).
import jStatPkg from 'jstat';

// (2) Cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (D-10; eval ->
//     runtime, one-directional, never the reverse). From eval/ to the plugin tree: up one level,
//     then into plugins/. readJson is module-private in the runtime aggregator, so its 14-line
//     fail-closed shape is copied below using the IMPORTED ContractError + stripBom (no bare
//     JSON.parse on untrusted vote files).
import {
  ContractError,
  stripBom,
  safeId,
  listJson,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

const { jStat } = jStatPkg;

// ---------------------------------------------------------------------------
// Frozen eval thresholds (D-07): the single source of truth turning the prose "~" into integers.
// The lock-rule numbers in eval/lz-eval-lock-rule.md MUST match this object byte-for-byte
// (anti-drift). Copy the Object.freeze shape from the runtime CEILINGS.
// ---------------------------------------------------------------------------
//
// ALPHA              : two-sided significance for the Clopper-Pearson upper bound (95% CI).
// RELIABLE_TRIALS    : the per-claim trial count SUBTLE must reach before a PASS may be declared
//                      (D-06: escalate the SUBTLE subset to reliable=15 before declaring PASS).
// MIN_K              : EVAL-02 floor (run each claim k>=5).
// ESCALATION_KILL_LOW / _HIGH : the cost-gate kill BAND. Haiku is killed on cost when the escalation
//                      fraction crosses this band (D-07 "kill Haiku if escalation > 40-50%"). The
//                      conservative edge (HIGH = 0.50) is the kill threshold the lock rule enforces.
// DELTA_UPPER_MAX    : the SUBTLE open-book Haiku-MINUS-Sonnet false-uphold DELTA upper-CI ceiling
//                      that encodes "~0" (D-07). Set to sit BETWEEN the zero-excess-at-reliable-15
//                      Clopper-Pearson ceiling (CP(0,15) ~= 0.218, PASS) and the one-excess ceiling
//                      (CP(1,15) ~= 0.319, FAIL) -- so a clean (zero-excess) Haiku clears and any
//                      non-zero excess false-uphold fails. This is the SOLE HARD GATE quantity.
// STRATA             : the EVAL-01 sampling fractions (~40% supported / ~60% bad, ~half the bad
//                      SUBTLE) -- carried here as the frozen contract; the loader (Plan 18-04)
//                      stratifies to them.
export const EVAL_THRESHOLDS = Object.freeze({
  ALPHA: 0.05,
  RELIABLE_TRIALS: 15,
  MIN_K: 5,
  ESCALATION_KILL_LOW: 0.4,
  ESCALATION_KILL_HIGH: 0.5,
  DELTA_UPPER_MAX: 0.25,
  STRATA: Object.freeze({
    SUPPORTED_FRACTION: 0.4,
    BAD_FRACTION: 0.6,
    SUBTLE_FRACTION_OF_BAD: 0.5,
  }),
});

// ---------------------------------------------------------------------------
// Library-computed confidence intervals + Pass@k combinatorics (D-07: jstat, NEVER hand-rolled).
// ---------------------------------------------------------------------------

// Clopper-Pearson (exact-binomial) UPPER bound = Beta^{-1}(1 - alpha/2 ; x + 1, n - x).
// x = false-uphold (excess) count, n = trials, alpha default 0.05.
// Degenerate boundaries handled explicitly (not by the library): n === 0 -> 1 (no information),
// x === n -> 1 (the upper bound is certain).
export function clopperPearsonUpper(x, n, alpha = EVAL_THRESHOLDS.ALPHA) {
  if (n === 0) {
    return 1; // zero trials -> no information -> 1, regardless of x (CP(x,0) === 1).
  }

  // n > 0: x > n is impossible (more excess events than trials). Fail closed -- left unguarded,
  // n - x < 0 feeds jStat.beta.inv a negative shape parameter and returns a silent NaN into a frozen
  // output object (the stated degenerate-boundary handling above stops at n===0 / x===n; this
  // completes it). NOT reachable via the consumers (x in {0,1}, n >= 1) -- defense in depth.
  if (x > n) {
    throw new ContractError('clopperPearsonUpper requires x <= n when n > 0: x=' + JSON.stringify(x) + ' n=' + JSON.stringify(n), 'clopperPearsonUpper');
  }

  if (x === n) {
    return 1;
  }

  return jStat.beta.inv(1 - alpha / 2, x + 1, n - x);
}

// Wilson score UPPER bound (the alternative interval per D-07), composed from jStat.normal.inv -- no
// separate hand-coded formula table. n === 0 -> 1 (no trials).
export function wilsonUpper(x, n, conf = 1 - EVAL_THRESHOLDS.ALPHA) {
  if (n === 0) {
    return 1;
  }

  // n > 0: x > n is impossible -> p = x/n > 1 would silently corrupt the interval. Fail closed (same
  // rationale as clopperPearsonUpper; unreachable via the consumers, defense in depth).
  if (x > n) {
    throw new ContractError('wilsonUpper requires x <= n when n > 0: x=' + JSON.stringify(x) + ' n=' + JSON.stringify(n), 'wilsonUpper');
  }

  const z = jStat.normal.inv(1 - (1 - conf) / 2, 0, 1); // ~1.95996 for 95%
  const p = x / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));

  return Math.min(1, center + half);
}

// C(a, k) where the combinatorial identity C(a, k) = 0 for a < k is applied EXPLICITLY before
// calling the library. jStat.combination returns NaN (not 0) when a < k, so a bare
// jStat.combination(n - c, k) poisons Pass@1 whenever c is large enough that n - c < k (e.g. all
// trials correct -> n - c = 0). This is the standard Pass@k formulation (HumanEval): the "ways to
// pick k from the FAILURES" is zero when there are fewer than k failures. It is NOT a hand-rolled
// special function -- every actual combination value still comes from the library (D-07); only the
// degenerate a < k identity (a documented combinatorial fact) is applied.
function comb(a, k) {
  return a < k ? 0 : jStat.combination(a, k);
}

// Pass@k (optimistic: at least one of k samples passes) via the library's combinatorics
// (D-07 prefers the library comb over a hand-rolled one). n < k is undefined -> NaN.
export function passAtK(n, c, k) {
  if (c < 0 || c > n) {
    throw new ContractError('passAtK requires 0 <= c <= n: c=' + JSON.stringify(c) + ' n=' + JSON.stringify(n), 'passAtK');
  }

  return n < k ? NaN : 1 - comb(n - c, k) / comb(n, k);
}

// Pass^k (conservative: all k samples pass) via the library's combinatorics. n < k -> NaN.
export function passHatK(n, c, k) {
  if (c < 0 || c > n) {
    throw new ContractError('passHatK requires 0 <= c <= n: c=' + JSON.stringify(c) + ' n=' + JSON.stringify(n), 'passHatK');
  }

  return n < k ? NaN : comb(c, k) / comb(n, k);
}

// ---------------------------------------------------------------------------
// Fail-closed JSON read (copy of the runtime aggregator's module-private readJson shape, using the
// IMPORTED ContractError + stripBom -- never a bare JSON.parse on an untrusted vote file). T-18-PARSE.
// ---------------------------------------------------------------------------

const readText = (p) => fs.readFileSync(p, 'utf8');

function readJson(p) {
  let text;

  try {
    text = stripBom(readText(p));
  } catch (err) {
    throw new ContractError('cannot read file: ' + err.message, p);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new ContractError('malformed JSON: ' + err.message, p);
  }
}

// ---------------------------------------------------------------------------
// Per-stratum false-uphold counting (EVAL-02 / D-01): DETERMINISTIC, OFF-MODEL verdict-vs-gold.
// ---------------------------------------------------------------------------
//
// A vote file under voteDir is { id, verdict } where verdict is the FROZEN enum 'unrefuted' |
// 'refuted' (the same enum the runtime tally reads). goldLabels maps a claim id -> its expected
// verdict ('unrefuted' for a supported claim; 'refuted' for a partially-/not-supported claim).
//
// PASS for a verdict trial = (verdict === expected_verdict).
// A FALSE-UPHOLD event = (expected_verdict === 'refuted' && verdict === 'unrefuted') -- a bad/refuted
// claim wrongly called unrefuted. This is the gated phenomenon (the silent false-uphold). The count
// is over the shared trial pool in voteDir; the correct-unrefuted control claims are NOT counted
// (the check is against GOLD, not "any unrefuted verdict") -- this is what makes the counter
// DISCRIMINATING rather than tautological.
//
// listJson (cross-tree import) gives a sorted, *.json-only, fail-closed listing for determinism.
export function countFalseUpholds(voteDir, goldLabels) {
  if (goldLabels == null || typeof goldLabels !== 'object') {
    throw new ContractError('invalid goldLabels (expected object): ' + JSON.stringify(goldLabels), voteDir);
  }

  const files = listJson(voteDir);
  let falseUpholds = 0;

  for (const f of files) {
    const votePath = path.join(voteDir, f);
    const rec = readJson(votePath);

    if (rec == null || typeof rec !== 'object') {
      throw new ContractError('malformed vote record (expected object): ' + JSON.stringify(rec), votePath);
    }

    // Route the content-derived id through the runtime safeId (T-18-TRAVERSE): a crafted id (e.g.
    // '../evil') must be rejected before it can index gold or reach any path. The VALIDATED id it
    // returns is used as the goldLabels lookup key below (mirrors the runtime aggregator's read-time
    // safeId discipline) -- it is NOT discarded.
    const id = safeId(String(rec.id), votePath);

    const verdict = rec.verdict;

    if (verdict !== 'unrefuted' && verdict !== 'refuted') {
      throw new ContractError(
        'invalid verdict (expected "unrefuted" or "refuted"): ' + JSON.stringify(verdict),
        votePath,
      );
    }

    const expected = goldLabels[id];

    if (expected == null) {
      throw new ContractError('no gold label for vote id: ' + JSON.stringify(id), votePath);
    }

    if (expected === 'refuted' && verdict === 'unrefuted') {
      falseUpholds += 1;
    }
  }

  return falseUpholds;
}

// ---------------------------------------------------------------------------
// Haiku-MINUS-Sonnet DELTA (D-06): the gated quantity is the EXCESS false-uphold count, never
// Haiku's absolute rate. Both counts come from countFalseUpholds over the SHARED SUBTLE pool.
// ---------------------------------------------------------------------------
export function delta(haikuCount, sonnetCount) {
  return haikuCount - sonnetCount;
}

// ---------------------------------------------------------------------------
// Mechanical lock-rule verdict (EVAL-04 / D-07 / COST-02): deterministic PASS / FAIL-RAISE given the
// counts. The lock rule eval/lz-eval-lock-rule.md is the pre-registered, prose form of this check;
// its numbers MUST match EVAL_THRESHOLDS byte-for-byte.
// ---------------------------------------------------------------------------
//
// PASS requires ALL of:
//   - the SUBTLE open-book Haiku-MINUS-Sonnet false-uphold DELTA upper-CI bound <= DELTA_UPPER_MAX
//     (the SOLE HARD GATE: a zero-excess Haiku at reliable=15 clears; any non-zero excess fails);
//   - escalationFraction < ESCALATION_KILL_HIGH (the cost gate: above the 40-50% kill band, Haiku is
//     killed on cost);
//   - reliableTrials >= RELIABLE_TRIALS (enough evidence: SUBTLE escalated to reliable=15 first).
// FAIL on ANY gate -> 'FAIL-RAISE' (raise the decision to the user, EVAL-03; Sonnet-default ships in
// the interim). The OFF-by-default Haiku-first flag flips ON only on PASS (COST-02).
export function lockRuleVerdict({ subtleOpenBookDeltaUpper, escalationFraction, reliableTrials }) {
  const falseUpholdGateClears = subtleOpenBookDeltaUpper <= EVAL_THRESHOLDS.DELTA_UPPER_MAX;
  const costGateClears = escalationFraction < EVAL_THRESHOLDS.ESCALATION_KILL_HIGH;
  const reliabilityMet = reliableTrials >= EVAL_THRESHOLDS.RELIABLE_TRIALS;

  if (falseUpholdGateClears && costGateClears && reliabilityMet) {
    return 'PASS';
  }

  return 'FAIL-RAISE';
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Single positional <vote-dir>; expects
// a sibling gold.json next to it (or in its parent); prints the false-uphold count; exits 0 / 2.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const voteDir = process.argv[2];

  if (!voteDir || !fs.existsSync(voteDir) || !fs.statSync(voteDir).isDirectory()) {
    console.error('lz-eval-aggregate: missing or invalid <vote-dir>');
    process.exit(2);
  }

  try {
    // The gold file sits alongside the vote dir (gold.json in its parent), mirroring the committed
    // fixture layout. The CLI is a thin convenience; the eval run (Plan 18-05) calls the exported
    // functions directly.
    const goldPath = path.join(path.dirname(voteDir), 'gold.json');
    const gold = readJson(goldPath);
    const count = countFalseUpholds(voteDir, gold);
    console.log('false_upholds: ' + count);
    process.exit(0);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-aggregate: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
