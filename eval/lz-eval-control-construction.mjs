// lz-eval-control-construction.mjs
//
// NET-NEW (RE-PLAN-9, NO-SPEND): the PRE-SPECIFIED positive-control CONSTRUCTION rule. The authority is
// 19-04-REPLAN-DECISION-9.md (the board-converged, probe-gated build-OR-descope of the control arm). This
// is NEVER a post-hoc rescue of weak controls: the construction is pre-specified (the two threshold
// constants + the 1/3 hard-positive fraction are pinned NOW, before any probe/vote; Task 9 records them
// in the lock-rule + manifest + anti-drift).
//
// constructControls produces CANDIDATES only. The SOLE retain decider is the CARRIED strict OUT-OF-FAMILY
// all-agree decider (eval/lz-eval-oof-batch.mjs makeBatchedOofProbe -> eval/lz-eval-trap-assembler.mjs
// runProbeConsensus, entails=true required for a control). constructControls NEVER enters the retain AND
// and NEVER tunes a threshold toward a desired control count (the N_CTRL_FLOOR=24 floor is load-bearing).
//
// THREE STACKED EASINESS GUARDS (board-converged; force SEMANTIC, not lexical, entailment):
//   (a) trap-matched COVARIATE strata -- bin each candidate by domain / date-cutoff / excerpt-count /
//       claim-length / specificity / retrieval-sparsity, so the trap-vs-control covariate match is
//       measurable downstream (Task 8). A control mismatched on a stratum is binned correctly (reported),
//       not silently discarded.
//   (b) exact-substring-overlap REJECTION at SUBSTRING_REJECT_MAX_CHARS (40 -- about one clause) +
//       a complexity/length filter at MIN_COMPLEXITY_TOKENS (12 whitespace tokens). A control whose
//       evidence shares a >= 40-char exact run with the trap claim/evidence is lexically-dominated and
//       REJECTED; a trivially-short / low-complexity control would let a model pass by STYLE and is
//       REJECTED.
//   (c) a >=1/3 HARD-POSITIVE stratum -- controls carrying a specific magnitude/attribution the excerpts
//       DO entail. constructControls reports hardPositiveCount; an under-1/3-hard set is FLAGGED (the
//       caller / survival probe treats it as a fail condition, never silently passing).
//
// THE ONLY SUBSTANTIVE RE-PLAN-9 CHANGE is the positive-control source/construction; everything else is
// CARRIED BYTE-IDENTICAL. This module imports NONE of the frozen primitives (not the jstat engine, not the
// assembler). It is a pure, deterministic candidate-construction layer.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees by
// relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). zero npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (D-10; eval -> runtime,
// one-directional, never the reverse).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// PRE-REGISTERED NUMERIC CONSTANTS (chosen NOW, before any probe/vote; Task 9 records them in the
// lock-rule + manifest + anti-drift). These are module-level LITERALS, NEVER computed from the candidate
// count -- the construction is never tuned toward a desired N (the floor is load-bearing).
//
// SUBSTRING_REJECT_MAX_CHARS = 40: a control whose evidence shares ANY exact substring of >= 40 characters
//   (about one clause) with the trap claim/evidence is REJECTED as lexically-dominated; short shared
//   phrases below 40 chars are allowed (force SEMANTIC, not lexical, entailment).
// MIN_COMPLEXITY_TOKENS = 12: a control whose evidence is fewer than 12 whitespace-delimited tokens is
//   REJECTED as trivially-short / low-complexity (it would let a model pass by style, not judgment).
// ---------------------------------------------------------------------------
export const SUBSTRING_REJECT_MAX_CHARS = 40;
export const MIN_COMPLEXITY_TOKENS = 12;

// The 6 trap-matched COVARIATE strata (board-converged). A candidate is binned by each axis so the
// trap-vs-control covariate match is measurable downstream (Task 8).
export const COVARIATE_STRATA = Object.freeze([
  'domain',
  'date-cutoff',
  'excerpt-count',
  'claim-length',
  'specificity',
  'retrieval-sparsity',
]);

// The pre-registered HARD-POSITIVE fraction (>=1/3): controls carrying a specific magnitude/attribution
// the excerpts DO entail (force SEMANTIC entailment; resist a pass-by-style set).
export const HARD_POSITIVE_FRACTION = 1 / 3;

// ---------------------------------------------------------------------------
// Helpers (pure).
// ---------------------------------------------------------------------------

// The evidence text of a candidate, joined for the substring + complexity checks. A candidate carries
// { evidence: [{ text, date }] } (the loadControlSource shape) OR { evidence: ['...'] } OR an evidenceText
// string. Returns a single joined string (never throws on a malformed shape -- it coerces to '').
function candidateEvidenceText(candidate) {
  if (candidate == null || typeof candidate !== 'object') {
    return '';
  }

  if (typeof candidate.evidenceText === 'string') {
    return candidate.evidenceText;
  }

  const ev = candidate.evidence;

  if (typeof ev === 'string') {
    return ev;
  }

  if (Array.isArray(ev)) {
    return ev
      .map((e) => {
        if (typeof e === 'string') {
          return e;
        }

        if (e != null && typeof e === 'object' && typeof e.text === 'string') {
          return e.text;
        }

        return '';
      })
      .filter((s) => s.length > 0)
      .join(' ');
  }

  return '';
}

// Whitespace-token count of a string (the complexity floor metric).
function tokenCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

// The longest EXACT shared substring length between two strings (a quadratic-space LCS-substring DP). The
// strings here are short evidence/claim excerpts, so the O(n*m) table is fine for the unit suite + the
// ~50-candidate survival probe. Returns the length (in characters) of the longest common contiguous run.
function longestCommonSubstringLength(a, b) {
  const s = String(a || '');
  const t = String(b || '');

  if (s.length === 0 || t.length === 0) {
    return 0;
  }

  // Rolling two-row DP over the t axis (keep memory linear in t.length).
  let prev = new Array(t.length + 1).fill(0);
  let best = 0;

  for (let i = 1; i <= s.length; i += 1) {
    const curr = new Array(t.length + 1).fill(0);

    for (let j = 1; j <= t.length; j += 1) {
      if (s[i - 1] === t[j - 1]) {
        curr[j] = prev[j - 1] + 1;

        if (curr[j] > best) {
          best = curr[j];
        }
      }
    }

    prev = curr;
  }

  return best;
}

// The substringRejectAgainst arg is the trap pool the controls must NOT lexically overlap: an array of
// strings (trap claims/evidence) OR a single string. Returns a flat array of strings.
function normalizeRejectAgainst(substringRejectAgainst) {
  if (typeof substringRejectAgainst === 'string') {
    return [substringRejectAgainst];
  }

  if (Array.isArray(substringRejectAgainst)) {
    return substringRejectAgainst
      .map((x) => {
        if (typeof x === 'string') {
          return x;
        }

        if (x != null && typeof x === 'object') {
          // Accept a trap-record shape { claim, evidence } and flatten it.
          const claim = typeof x.claim === 'string' ? x.claim : '';
          const ev = candidateEvidenceText(x);

          return (claim + ' ' + ev).trim();
        }

        return '';
      })
      .filter((s) => s.length > 0);
  }

  return [];
}

// Bin ONE candidate into the 6 covariate strata. Each axis is derived from the candidate's recorded
// covariate fields (or computed: claim-length from the claim token count, excerpt-count from the evidence
// length). Returns a { domain, date-cutoff, excerpt-count, claim-length, specificity, retrieval-sparsity }
// bin descriptor (string-valued bins). DISCRIMINATING: a candidate with a given (domain, excerpt-count,
// claim-length) lands in the matching stratum bin.
function binCovariates(candidate) {
  const cov = candidate != null && typeof candidate.covariates === 'object' && candidate.covariates != null ? candidate.covariates : {};
  const claimTokens = tokenCount(candidate && candidate.claim);
  const evItems = Array.isArray(candidate && candidate.evidence) ? candidate.evidence.length : 0;

  // claim-length bin: short (<12) / medium (12-24) / long (>24) tokens.
  const claimLengthBin = claimTokens < 12 ? 'short' : claimTokens <= 24 ? 'medium' : 'long';

  // excerpt-count bin: sparse (<=2) / moderate (3-5) / dense (>5).
  const excerptCountBin = evItems <= 2 ? 'sparse' : evItems <= 5 ? 'moderate' : 'dense';

  return {
    domain: typeof cov.domain === 'string' && cov.domain.length > 0 ? cov.domain : 'unknown',
    'date-cutoff': typeof candidate.cutoff === 'string' && candidate.cutoff.length > 0 ? candidate.cutoff.slice(0, 4) : (typeof cov['date-cutoff'] === 'string' ? cov['date-cutoff'] : 'unknown'),
    'excerpt-count': excerptCountBin,
    'claim-length': claimLengthBin,
    specificity: typeof cov.specificity === 'string' && cov.specificity.length > 0 ? cov.specificity : 'unknown',
    'retrieval-sparsity': typeof cov['retrieval-sparsity'] === 'string' && cov['retrieval-sparsity'].length > 0 ? cov['retrieval-sparsity'] : excerptCountBin,
  };
}

// ---------------------------------------------------------------------------
// constructControls({ candidates, trapStrata, covariateTolerance, hardPositiveFraction = 1/3,
//   substringRejectAgainst, substringRejectMaxChars = SUBSTRING_REJECT_MAX_CHARS,
//   minComplexity = MIN_COMPLEXITY_TOKENS }) -> { controls, strata, rejected, hardPositiveCount }.
//
// PRODUCES CANDIDATES ONLY. The strict OOF all-agree decider (the carried runProbeConsensus, entails=true)
// is the SOLE retain decider over `controls`. constructControls returns NO retain decision -- it returns
// the constructed candidate set + their covariate bins + the rejected set + the hard-positive count.
//
//   (1) BIN each candidate into the 6 trap-matched covariate strata; report the per-stratum distribution.
//   (2) REJECT any candidate whose evidence has an EXACT-SUBSTRING overlap >= substringRejectMaxChars (40)
//       with the trap claim/evidence (substringRejectAgainst) + apply the complexity/length filter
//       (minComplexity = 12 tokens) -- the rejected candidates land in `rejected` with a reason.
//   (3) ENFORCE the >=hardPositiveFraction (>=1/3) HARD-POSITIVE stratum -- compute hardPositiveCount over
//       the SURVIVING controls; a surviving set with < 1/3 hard positives is FLAGGED (underHardPositive:true).
//
// The thresholds are PRE-REGISTERED CONSTANTS (the defaults), NEVER tuned toward a desired N.
// ---------------------------------------------------------------------------
export function constructControls({
  candidates,
  trapStrata,
  covariateTolerance,
  hardPositiveFraction = HARD_POSITIVE_FRACTION,
  substringRejectAgainst,
  substringRejectMaxChars = SUBSTRING_REJECT_MAX_CHARS,
  minComplexity = MIN_COMPLEXITY_TOKENS,
} = {}) {
  if (!Array.isArray(candidates)) {
    throw new ContractError('constructControls requires a candidates array', 'construct-controls');
  }

  void trapStrata; // the trap covariate strata are CONSUMED downstream (Task 8 covariate-match), not here.
  void covariateTolerance; // tolerance is a downstream (Task 8) statistic, not a construction knob.

  const rejectPool = normalizeRejectAgainst(substringRejectAgainst);
  const controls = [];
  const rejected = [];

  // Per-stratum distribution: for each of the 6 covariate axes, count the surviving controls per bin.
  const strata = {};

  for (const axis of COVARIATE_STRATA) {
    strata[axis] = {};
  }

  for (const cand of candidates) {
    if (cand == null || typeof cand !== 'object') {
      rejected.push({ uid: null, reason: 'malformed-candidate' });
      continue;
    }

    const evText = candidateEvidenceText(cand);
    const tokens = tokenCount(evText);

    // (2a) COMPLEXITY/LENGTH filter: reject a trivially-short / low-complexity control.
    if (tokens < minComplexity) {
      rejected.push({ uid: cand.uid || null, reason: 'complexity-below-floor', tokens });
      continue;
    }

    // (2b) EXACT-SUBSTRING-overlap rejection: reject a control whose evidence shares a >= threshold-char
    // exact run with ANY trap claim/evidence (lexically-dominated -> force SEMANTIC entailment).
    let maxOverlap = 0;

    for (const trap of rejectPool) {
      const overlap = longestCommonSubstringLength(evText, trap);

      if (overlap > maxOverlap) {
        maxOverlap = overlap;
      }

      if (maxOverlap >= substringRejectMaxChars) {
        break;
      }
    }

    if (maxOverlap >= substringRejectMaxChars) {
      rejected.push({ uid: cand.uid || null, reason: 'substring-dominated', overlap: maxOverlap });
      continue;
    }

    // SURVIVOR: bin it into the 6 covariate strata + record it as a control CANDIDATE.
    const bin = binCovariates(cand);

    for (const axis of COVARIATE_STRATA) {
      const b = bin[axis];
      strata[axis][b] = (strata[axis][b] || 0) + 1;
    }

    controls.push({ ...cand, covariateBin: bin, hardPositive: cand.hardPositive === true });
  }

  // (3) HARD-POSITIVE fraction over the surviving controls. A control is hard-positive when it carries a
  // specific magnitude/attribution the excerpts DO entail (the candidate flags hardPositive:true).
  const hardPositiveCount = controls.filter((c) => c.hardPositive === true).length;
  const underHardPositive = controls.length > 0 && hardPositiveCount / controls.length < hardPositiveFraction;

  return {
    controls,
    strata,
    rejected,
    hardPositiveCount,
    hardPositiveFraction,
    underHardPositive,
    // Recorded so the survival probe (Task 8) can fold a substring-dominated / under-hard construction
    // into its selection-easy guard; NOT a retain decision (the OOF decider decides retain).
    substringRejectMaxChars,
    minComplexity,
  };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--constants` it prints the
// pre-registered constants (the values Task 9 records in the lock-rule + manifest + anti-drift).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const mode = process.argv[2];

  if (mode === '--constants') {
    console.log('SUBSTRING_REJECT_MAX_CHARS=' + SUBSTRING_REJECT_MAX_CHARS);
    console.log('MIN_COMPLEXITY_TOKENS=' + MIN_COMPLEXITY_TOKENS);
    console.log('HARD_POSITIVE_FRACTION=1/3');
    console.log('COVARIATE_STRATA=' + COVARIATE_STRATA.join(','));
    process.exit(0);
  }

  console.error('lz-eval-control-construction: usage: node lz-eval-control-construction.mjs --constants');
  process.exit(2);
}
/* node:coverage enable */
