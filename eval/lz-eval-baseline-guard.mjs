// lz-eval-baseline-guard.mjs
//
// NET-NEW (RE-PLAN-12, NO-SPEND; Task 7): the DUAL-BASELINE artifact guard -- the SKEPTIC's
// sufficiency condition for the contrastive MCC screen. THE AUTHORITY is 19-04-REPLAN-DECISION-12.md
// (the dual-baseline guard) + 19-04-CERTIFY-WORKS-RESEARCH.md (F3: naive minimal-pair construction has
// a "myopia" failure mode where a model overfocuses on the EDITED feature).
//
// THE ONE EMPIRICAL UNKNOWN this guard adjudicates: whether the ~12 manual contrastive minimal-pairs
// can be authored with a genuinely label-flipping edit WITHOUT a claim-side or lexical artifact. The
// guard is MECHANICAL (no discretionary knob): BOTH a lexical/overlap baseline (TF-IDF / bag-of-words
// on claim+evidence) AND a no-evidence claim-only baseline must score AT CHANCE on separating the
// SUPPORTED from the REFUTED items. If EITHER baseline separates them above chance, a lexical /
// claim-side artifact exists -> the caller (the contrastive screen) AUTO-DEMOTES to a non-gating
// diagnostic and offline reverts to trap-only.
//
// THE SCALE (load-bearing): chance for MCC is 0 (a separation-MCC of 0 = no association = chance), NOT
// 0.5 (0.5 is the chance ACCURACY between two balanced classes -- a DIFFERENT scale). 19-04-DECISION-12
// writes "AT CHANCE (CI includes 0.5)" as accuracy-scale shorthand; RE-PLAN-12 encodes the guard on the
// MCC scale where chance is 0. The "at chance" test therefore compares the SEPARATION-MCC's one-sided
// BCa lower CI to 0 (NOT 0.5): lowerCI <= 0 is at chance; lowerCI > 0 separates the pairs. A 0.5
// comparator would be a scale-mix BUG -- a real lexical artifact at separation-MCC ~0.4 has a lower CI
// > 0 but < 0.5 and would be WRONGLY called at-chance under a 0.5 comparator. The comparator constant
// AT_CHANCE_MCC = 0 is pinned + the Task-7 test asserts it DISCRIMINATING-ly.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the MCC module (which routes the quantile math through the
// pinned stats library for the BCa CI) + ContractError across-tree (eval -> runtime, one-directional).
// It does NOT edit the frozen engine. THIS module stays ZERO-DEP: the lexical-overlap AUC (gate (a),
// Plan 20-06 Task 2) is hand-rolled rank/counting math -- the pinned stats library is reached ONLY
// transitively (via the MCC module's BCa lower CI for the dual-baseline separation), NEVER in the AUC path.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import {
  matthewsCorrelation,
  bcaBootstrapLowerCI,
} from './lz-eval-mcc.mjs';

import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// THE PINNED COMPARATOR CONSTANT (load-bearing): chance for the SEPARATION-MCC is 0, NOT 0.5. A
// baseline is "at chance" iff its separation-MCC one-sided BCa lower CI is <= AT_CHANCE_MCC (0). A
// regression that swapped this to 0.5 (the accuracy scale) is a scale-mix bug the Task-7 test catches.
export const AT_CHANCE_MCC = 0;

// ---------------------------------------------------------------------------
// THE PRE-REGISTERED LEXICAL-OVERLAP AUC CEILING (Plan 20-06, Task 2; construct-validity gate (a)).
// CERTIFY-WORKS-BOARD-DECISION.md section 3 (a): a pre-registered, zero-dependency lexical-overlap baseline
// must NOT separate the SUPPORTED/REFUTED members of a contrastive pair above this ceiling (the truth-value
// must not be lexically readable). The board's stated band is [0.60, 0.65]; this PINS 0.65 -- the most
// PERMISSIVE end of the band, conservative against FALSE-FAILING a genuinely clean corpus. It is a NEW
// module-level LITERAL, FROZEN BEFORE any pair is authored or scored (recorded in the re-authored
// eval/lz-eval-live-lock-rule.md WITH A TIMESTAMP, Plan 20-06 Task 3) -- the anti-result-shopping anchor.
// NOT computed from the corpus. The AUC is the Mann-Whitney probability that a random SUPPORTED item
// outranks a random REFUTED item by the zero-dep lexical-overlap score; 0.5 is no-separation, 1.0 is a
// perfect lexical artifact. PASS iff auc <= LEXICAL_AUC_CEILING.
// ---------------------------------------------------------------------------
export const LEXICAL_AUC_CEILING = 0.65;

// ---------------------------------------------------------------------------
// Tokenize a text into a bag of lowercase word tokens (ASCII word characters). Deterministic.
// ---------------------------------------------------------------------------
function tokenize(text) {
  if (typeof text !== 'string') {
    return [];
  }

  const matches = text.toLowerCase().match(/[a-z0-9]+/g);

  return matches === null ? [] : matches;
}

// Build a term-frequency map for a token list.
function termFreq(tokens) {
  const tf = new Map();

  for (const t of tokens) {
    tf.set(t, (tf.get(t) || 0) + 1);
  }

  return tf;
}

// Distinct-token set of a TF map (presence, not frequency -- a token is a class signal by membership).
function tokenSet(tf) {
  return new Set(tf.keys());
}

// ---------------------------------------------------------------------------
// Normalize a `pairs` input into a flat list of items { gold, claimTokens, evidenceTokens }. A `pair`
// is { supported, refuted } where each side is { claim, evidence } (evidence a string or array of
// strings). The SUPPORTED side has gold 'unrefuted'; the REFUTED side gold 'refuted'. ContractError on
// a malformed pair.
// ---------------------------------------------------------------------------
function evidenceText(evidence) {
  if (Array.isArray(evidence)) {
    return evidence
      .map((e) => {
        if (typeof e === 'string') {
          return e;
        }

        if (e && typeof e === 'object' && typeof e.sentence === 'string') {
          return e.sentence;
        }

        return '';
      })
      .join(' ');
  }

  if (typeof evidence === 'string') {
    return evidence;
  }

  return '';
}

function flattenPairs(pairs, where) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new ContractError(where + ' requires a non-empty pairs array', where);
  }

  const items = [];

  for (let i = 0; i < pairs.length; i += 1) {
    const pair = pairs[i];

    if (!pair || typeof pair !== 'object' || !pair.supported || !pair.refuted) {
      throw new ContractError(where + ' pair ' + i + ' must carry { supported, refuted }', where);
    }

    for (const [side, gold] of [['supported', 'unrefuted'], ['refuted', 'refuted']]) {
      const item = pair[side];

      if (!item || typeof item !== 'object' || typeof item.claim !== 'string') {
        throw new ContractError(where + ' pair ' + i + ' ' + side + ' must carry a claim string', where);
      }

      items.push({
        gold,
        pairId: i,
        claimTokens: termFreq(tokenize(item.claim)),
        evidenceTokens: termFreq(tokenize(evidenceText(item.evidence))),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// A DETERMINISTIC log-odds (Naive-Bayes-style) token-class separation classifier on a chosen feature
// (claim+evidence, or claim-only), evaluated LEAVE-ONE-PAIR-OUT. For each item, the per-token class
// log-odds is log((presence_count_in_supported + smooth) / (presence_count_in_refuted + smooth))
// computed over all items EXCEPT BOTH items of the item's own pair (leave-one-pair-out). The item's
// score is the sum of its tokens' log-odds; score > 0 -> 'unrefuted', else -> 'refuted'.
//
// WHY log-odds + leave-one-PAIR-out: a contrastive pair's two items are near-identical (same evidence,
// near-identical claim). A plain leave-one-OUT scheme (centroid OR log-odds) suffers PARTNER-PULL --
// the item's near-identical opposite-class PARTNER remains in the training counts and systematically
// inverts the prediction (a SPURIOUS strong NEGATIVE separation even on an artifact-free corpus).
// Excluding the WHOLE pair removes the partner: a token shared by BOTH classes (boilerplate) or unique
// to ONE pair (a per-pair label-flip word, now excluded with the pair) contributes ~0 net class signal;
// ONLY a token that SYSTEMATICALLY marks a class ACROSS pairs accumulates signal. So an artifact-free
// corpus scores ~chance (separation-MCC ~ 0) and a genuine lexical/claim-side artifact (a recurring
// class marker) scores well above 0.
// ---------------------------------------------------------------------------
function separationVerdicts(items, featureFn) {
  // Pre-extract each item's distinct token set on the chosen feature.
  const tokenSets = items.map((it) => tokenSet(featureFn(it)));

  const SMOOTH = 0.5; // Laplace smoothing so an unseen-in-a-class token is bounded, not +/-Infinity.
  const verdicts = [];

  for (let i = 0; i < items.length; i += 1) {
    // Leave-one-PAIR-out class presence counts: exclude every item of item i's own pair (both the item
    // and its near-identical opposite-class partner) so partner-pull cannot invert the prediction.
    const supCount = new Map();
    const refCount = new Map();

    for (let j = 0; j < items.length; j += 1) {
      if (items[j].pairId === items[i].pairId) {
        continue;
      }

      const target = items[j].gold === 'unrefuted' ? supCount : refCount;

      for (const tok of tokenSets[j]) {
        target.set(tok, (target.get(tok) || 0) + 1);
      }
    }

    let score = 0;

    for (const tok of tokenSets[i]) {
      const s = (supCount.get(tok) || 0) + SMOOTH;
      const r = (refCount.get(tok) || 0) + SMOOTH;
      score += Math.log(s / r);
    }

    // score > 0 -> the tokens lean SUPPORTED -> 'unrefuted'; score <= 0 -> 'refuted' (a 0 tie -> refuted,
    // the conservative no-separation guess; a balanced corpus produces no systematic class signal).
    verdicts.push(score > 0 ? 'unrefuted' : 'refuted');
  }

  return verdicts;
}

// The lexical feature: claim + evidence tokens merged (a bag-of-words over the whole item).
function lexicalFeature(item) {
  const merged = new Map(item.claimTokens);

  for (const [k, v] of item.evidenceTokens) {
    merged.set(k, (merged.get(k) || 0) + v);
  }

  return merged;
}

// The claim-only feature: the claim tokens ONLY (no evidence) -- the F3 myopia catcher.
function claimOnlyFeature(item) {
  return item.claimTokens;
}

// ---------------------------------------------------------------------------
// Run a baseline: classify the items by the feature's log-odds class separation, then score the
// SEPARATION-MCC (the classifier's verdicts vs the true gold) + its one-sided BCa lower CI. Returns
// { separationMcc, lowerCI }.
// ---------------------------------------------------------------------------
function runBaseline(items, featureFn, seed) {
  const verdicts = separationVerdicts(items, featureFn);
  const gold = items.map((it) => it.gold);
  const separationMcc = matthewsCorrelation(cellsOf(verdicts, gold));
  const lowerCI = bcaBootstrapLowerCI({ verdicts, gold, seed });

  return { separationMcc, lowerCI };
}

function cellsOf(verdicts, gold) {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (let i = 0; i < verdicts.length; i += 1) {
    if (gold[i] === 'unrefuted' && verdicts[i] === 'unrefuted') {
      tp += 1;
    } else if (gold[i] === 'refuted' && verdicts[i] === 'refuted') {
      tn += 1;
    } else if (gold[i] === 'refuted' && verdicts[i] === 'unrefuted') {
      fp += 1;
    } else {
      fn += 1;
    }
  }

  return { tp, tn, fp, fn };
}

// ---------------------------------------------------------------------------
// separationScores(items, featureFn) -- the CONTINUOUS leave-one-PAIR-out log-odds SCORE per item (the
// same machinery as separationVerdicts, but returning the raw score, not the thresholded verdict). The
// AUC reads these continuous scores. REUSES the SAME lexicalFeature token bag + the SAME leave-one-PAIR-
// out partner-pull discipline so an artifact-free corpus scores ~chance (AUC ~ 0.5) and a real lexical
// artifact ranks the SUPPORTED items systematically above the REFUTED items (AUC well above 0.5).
// ---------------------------------------------------------------------------
function separationScores(items, featureFn) {
  const tokenSets = items.map((it) => tokenSet(featureFn(it)));
  const SMOOTH = 0.5;
  const scores = [];

  for (let i = 0; i < items.length; i += 1) {
    const supCount = new Map();
    const refCount = new Map();

    for (let j = 0; j < items.length; j += 1) {
      if (items[j].pairId === items[i].pairId) {
        continue;
      }

      const target = items[j].gold === 'unrefuted' ? supCount : refCount;

      for (const tok of tokenSets[j]) {
        target.set(tok, (target.get(tok) || 0) + 1);
      }
    }

    let score = 0;

    for (const tok of tokenSets[i]) {
      const s = (supCount.get(tok) || 0) + SMOOTH;
      const r = (refCount.get(tok) || 0) + SMOOTH;
      score += Math.log(s / r);
    }

    scores.push(score);
  }

  return scores;
}

// ---------------------------------------------------------------------------
// mannWhitneyAuc(scores, gold) -- a ZERO-DEP, hand-rolled Mann-Whitney-U / rank-based AUC over the
// per-item lexical-overlap score. The AUC is the probability that a random SUPPORTED ('unrefuted') item
// outranks a random REFUTED item by `score`. Computed by the pairwise count (every SUPPORTED-vs-REFUTED
// pair: +1 if the SUPPORTED score is higher, +1/2 on an EXACT tie, 0 if lower) divided by the total
// cross-class pair count. The +1/2 tie credit is EXPLICIT + deterministic (the truth-value must not be
// lexically readable -- a tie contributes no separation signal). AUC in [0,1]; 0.5 = no-separation;
// 1.0 = a perfect lexical artifact (every SUPPORTED outranks every REFUTED). Pure counting/ranking math
// -- NO stats library (the lexical baseline stays zero-dep, board section 6).
// ---------------------------------------------------------------------------
function mannWhitneyAuc(scores, gold) {
  const pos = [];
  const neg = [];

  for (let i = 0; i < scores.length; i += 1) {
    if (gold[i] === 'unrefuted') {
      pos.push(scores[i]);
    } else {
      neg.push(scores[i]);
    }
  }

  // A degenerate single-class corpus has no cross-class pair to rank -> AUC is undefined; return 0.5 (the
  // no-separation value) so a degenerate input never spuriously fails the ceiling.
  if (pos.length === 0 || neg.length === 0) {
    return 0.5;
  }

  let wins = 0;

  for (const p of pos) {
    for (const n of neg) {
      if (p > n) {
        wins += 1;
      } else if (p === n) {
        wins += 0.5; // EXPLICIT deterministic tie credit (+1/2).
      }
    }
  }

  return wins / (pos.length * neg.length);
}

// ---------------------------------------------------------------------------
// lexicalOverlapAuc({ pairs }) -- construct-validity gate (a). Computes the zero-dep, hand-rolled
// Mann-Whitney AUC over the per-item leave-one-PAIR-out lexical-overlap score (claim + evidence). Returns
// { auc, pass } where pass = auc <= LEXICAL_AUC_CEILING (the pre-registered ceiling, frozen 0.65). An
// artifact-free corpus scores ~0.5 (the truth-value is NOT lexically readable -> pass); a corpus where a
// lexical token systematically marks the SUPPORTED class scores well above 0.5 (a readable artifact ->
// fail). REUSES the SAME lexicalFeature + leave-one-pair-out discipline as the dual-baseline guard;
// stays ZERO-DEP (no stats lib).
// ---------------------------------------------------------------------------
export function lexicalOverlapAuc({ pairs } = {}) {
  const items = flattenPairs(pairs, 'lexicalOverlapAuc');
  const scores = separationScores(items, lexicalFeature);
  const gold = items.map((it) => it.gold);
  const auc = mannWhitneyAuc(scores, gold);

  return { auc, pass: auc <= LEXICAL_AUC_CEILING };
}

// ---------------------------------------------------------------------------
// lexicalBaselineSeparation({ pairs }) -- the TF / bag-of-words nearest-centroid separation-MCC over
// CLAIM + EVIDENCE. Can a lexical model separate the SUPPORTED items from the REFUTED items?
// Returns { separationMcc, lowerCI }.
// ---------------------------------------------------------------------------
export function lexicalBaselineSeparation({ pairs } = {}) {
  const items = flattenPairs(pairs, 'lexicalBaselineSeparation');

  return runBaseline(items, lexicalFeature, 'baseline-lexical');
}

// ---------------------------------------------------------------------------
// claimOnlyBaselineSeparation({ pairs }) -- the SAME nearest-centroid separation-MCC on the CLAIM TEXT
// ONLY (no evidence). Can a claim-side model separate the pair? This is the F3 myopia catcher.
// Returns { separationMcc, lowerCI }.
// ---------------------------------------------------------------------------
export function claimOnlyBaselineSeparation({ pairs } = {}) {
  const items = flattenPairs(pairs, 'claimOnlyBaselineSeparation');

  return runBaseline(items, claimOnlyFeature, 'baseline-claim-only');
}

// ---------------------------------------------------------------------------
// dualBaselineGuard({ pairs }) -> { lexicalSeparation, claimOnlySeparation, lexicalAtChance,
//   claimOnlyAtChance, guardPasses }. The guard is MECHANICAL -- the SAME `bcaBootstrapLowerCI <=
//   AT_CHANCE_MCC (0)` rule for BOTH baselines (no per-baseline tuned knob).
//   lexicalAtChance   = the lexical SEPARATION-MCC's one-sided BCa lower CI <= 0 (cannot separate above chance)
//   claimOnlyAtChance = the claim-only SEPARATION-MCC's one-sided BCa lower CI <= 0
//   guardPasses       = lexicalAtChance AND claimOnlyAtChance (BOTH at chance)
// If EITHER baseline separates above chance (its separation-MCC lower CI > 0) -> guardPasses=false ->
// the caller AUTO-DEMOTES the contrastive screen to a non-gating diagnostic + offline reverts to trap-only.
// ---------------------------------------------------------------------------
export function dualBaselineGuard({ pairs } = {}) {
  const lexicalSeparation = lexicalBaselineSeparation({ pairs });
  const claimOnlySeparation = claimOnlyBaselineSeparation({ pairs });

  // The SHARED mechanical rule (same comparator for both baselines): at chance iff lowerCI <= AT_CHANCE_MCC.
  const lexicalAtChance = lexicalSeparation.lowerCI <= AT_CHANCE_MCC;
  const claimOnlyAtChance = claimOnlySeparation.lowerCI <= AT_CHANCE_MCC;
  const guardPasses = lexicalAtChance && claimOnlyAtChance;

  return {
    lexicalSeparation,
    claimOnlySeparation,
    lexicalAtChance,
    claimOnlyAtChance,
    guardPasses,
  };
}
