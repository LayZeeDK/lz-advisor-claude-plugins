// lz-eval-sliceA-gold.mjs
//
// NET-NEW (Plan 22-02, Task 2; NO-SPEND): the OFF-MODEL Slice-A AVeriTeC filter + 4-way->binary
// collapse + per-confusion-matrix-direction DESCRIPTIVE tally + the frozen feasibility gate (PAR-06 /
// D-11 / D-14). THE AUTHORITY is 22-CONTEXT.md (D-11/D-14) + 22-RESEARCH.md "D-14 RESOLUTION" + the
// "Reusing the confusion-matrix cell logic for Slice A" code example.
//
// THE ROLE SEPARATION (the ratified construct-validity principle): AVeriTeC's OPEN-book gold scores the
// OPEN-book verify-voter DESCRIPTIVELY -- it never grades a closed-book judge. The closed-book gold
// (WiCE/LLM-AggreFact) calibrates the JUDGE (lz-eval-judge-calibration.mjs). Different roles, no
// mismatch (resolves the Phase 18-21 construct VOID). Slice A is JUDGE-FREE and DESCRIPTIVE: it is a
// verdict-vs-gold tally reported PER-DIRECTION, NEVER a pass/fail certificate and NEVER an OOF screen.
//
// COLLAPSE (D-11): Supported -> unrefuted, Refuted -> refuted, EXCLUDE Conflicting Evidence/
// Cherrypicking (kappa noise), HOLD OUT Not Enough Evidence (NEI). Conflicting + NEI collapse to null.
//
// ANSWER-LEAK CONTROL (D-11 / T-22-05): filterSliceA strips every leaky gold field (justification,
// fact_checking_article, questions, label, speaker) and passes the verify-voter ONLY the claim + the
// claim_date cutoff -- so the gold can never reach the voter.
//
// PER-DIRECTION TALLY, NEVER POOLED (D-11): tallyPerDirection reuses the mccFromPairs cell mapping
// (tp/tn/fp/fn) and reports the cells SPLIT by gold direction (the unrefuted/TP-FN axis and the
// refuted/TN-FP axis). It emits NO pooled accuracy / rate, NO Clopper-Pearson, NO confidence interval,
// NO pass/fail cert -- it is DESCRIPTIVE only. (Pitfall 1: never re-litigate the closed-vs-open VOID by
// computing a CP cert here.)
//
// THE FROZEN FEASIBILITY GATE (D-14, RESOLVED FEASIBLE): SLICE_A_GATE freezes N_SUP_MIN = 8,
// N_REF_MIN = 8; both directions must be populated. Observed on the cached AVeriTeC dev set: 95 clean
// Supported, 216 clean Refuted -> GATE CLEARS. The provisional limits (uniform 2020 claim_date +
// topical narrowness) are always named -- they SCOPE the read, they do NOT block.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError + the MCC cell
// engine ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It
// has NO out-of-family transport (D-18); the gold is the free AVeriTeC only.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The thin CLI is guarded so importing this module runs nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// The MCC cell engine -- reused for the per-direction tally cell mapping (D-11; the SAME
// unrefuted|refuted cells the judge calibration uses). We consume only the tp/tn/fp/fn cells; the
// pooled mcc it also returns is NOT exposed by Slice A (descriptive, never pooled).
import { mccFromPairs } from './lz-eval-mcc.mjs';

// Fail-closed BOM-stripping JSON read (the established eval-tree convention) -- used by the CLI to read
// the on-disk AVeriTeC dev JSON.
import { readJson } from './lz-eval-readjson.mjs';

// ---------------------------------------------------------------------------
// SLICE_A_GATE: the RESOLVED D-14 feasibility-gate thresholds, FROZEN BEFORE any grading (D-20). The
// pre-registration (Plan 22-04) records these; a co-test asserts Object.isFrozen. They are NOT
// computed from the corpus -- they are the load-bearing pre-registered floor.
//   N_SUP_MIN : the minimum clean Supported (-> unrefuted) items required (8).
//   N_REF_MIN : the minimum clean Refuted items required (8).
// ---------------------------------------------------------------------------
export const SLICE_A_GATE = Object.freeze({
  N_SUP_MIN: 8,
  N_REF_MIN: 8,
});

// The provisional limits recorded with EVERY Slice-A run (D-14: they SCOPE the read, never block).
const PROVISIONAL_LIMITS = Object.freeze([
  'uniform 2020 claim_date (out-of-cutoff for a 2026 voter; the voter judges the claim as-of 2020)',
  'topical narrowness (the AVeriTeC dev set is ~34% US-2020-politics, ~21% COVID -- NOT a ' +
    'representative cross-section of general research questions; Slice A speaks to fact-check-style ' +
    'claims, not Slice B natural breadth)',
]);

// The AVeriTeC 4-way -> binary collapse map (D-11). Conflicting + NEI map to null (excluded / held out).
const AVT_COLLAPSE = Object.freeze({
  Supported: 'unrefuted',
  Refuted: 'refuted',
  'Conflicting Evidence/Cherrypicking': null,
  'Not Enough Evidence': null,
});

// The report-shaped + non-leaking filter knobs (D-11 / RESEARCH D-14 RESOLUTION (a)).
const FILTER = Object.freeze({
  MIN_CHARS: 45,
  MAX_CHARS: 220,
  // <= 1 sentence-ending punctuation mark -> a single proposition.
  MAX_SENTENCE_PUNCT: 1,
});

// First/second-person pronoun tokens (drops debate soundbites; D-14 RESOLUTION (a)).
const PRONOUN_RE = /\b(i|me|my|mine|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves)\b/i;

// Verdict-leaking tokens (the claim text must not itself reveal the verdict; D-14 RESOLUTION (a)).
const LEAKY_TOKEN_RE = /\b(false|fake|hoax|debunk|debunked|fact-check|fact-checked)\b/i;

// Sentence-ending punctuation (period / question mark / exclamation).
const SENTENCE_PUNCT_RE = /[.?!]/g;

// ---------------------------------------------------------------------------
// collapseAvtLabel(avtLabel) -- map the AVeriTeC 4-way label to unrefuted|refuted|null (D-11). An
// unknown label is a ContractError (fail-closed -- a typo'd / new label must never silently default).
// ---------------------------------------------------------------------------
export function collapseAvtLabel(avtLabel) {
  if (!Object.prototype.hasOwnProperty.call(AVT_COLLAPSE, avtLabel)) {
    throw new ContractError(
      'unknown AVeriTeC label (expected Supported|Refuted|Conflicting Evidence/Cherrypicking|Not Enough Evidence): ' +
        JSON.stringify(avtLabel),
      'collapseAvtLabel',
    );
  }

  return AVT_COLLAPSE[avtLabel];
}

// ---------------------------------------------------------------------------
// reportShapedAndNonLeaking(claim) -- the conservative filter predicate (D-14 RESOLUTION (a)):
//   - 45..220 chars (single proposition, not a fragment / not an over-long run-on)
//   - <= 1 sentence-ending punctuation mark (a single proposition)
//   - no 1st/2nd-person pronoun (drops debate soundbites)
//   - no verdict-leaking token (false/fake/hoax/debunk/fact-check)
// Returns true iff the claim survives ALL of the above. A non-string / empty claim returns false (the
// caller treats it as filtered out, not a crash).
// ---------------------------------------------------------------------------
function reportShapedAndNonLeaking(claim) {
  if (typeof claim !== 'string') {
    return false;
  }

  const len = claim.length;

  if (len < FILTER.MIN_CHARS || len > FILTER.MAX_CHARS) {
    return false;
  }

  const punctMatches = claim.match(SENTENCE_PUNCT_RE);
  const punctCount = punctMatches ? punctMatches.length : 0;

  if (punctCount > FILTER.MAX_SENTENCE_PUNCT) {
    return false;
  }

  if (PRONOUN_RE.test(claim)) {
    return false;
  }

  if (LEAKY_TOKEN_RE.test(claim)) {
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// filterSliceA({ items }) -- collapse + filter + partition the AVeriTeC dev items.
//   - drops Conflicting (EXCLUDE) + NEI (HOLD OUT) via collapseAvtLabel -> null.
//   - drops any surviving claim that fails the report-shaped + non-leaking filter.
//   - emits ONLY { claim, claim_date } downstream (every leaky gold field stripped, T-22-05).
//   - partitions the survivors into { unrefuted, refuted } per the collapsed direction.
// `items` is an array of AVeriTeC rows ({ claim, label, claim_date, ...leaky fields }). A missing
// label is a ContractError (via collapseAvtLabel). A missing claim_date on a surviving item is a
// ContractError (the date cutoff is load-bearing -- the voter judges as-of that date, D-11).
// ---------------------------------------------------------------------------
export function filterSliceA({ items } = {}) {
  if (!Array.isArray(items)) {
    throw new ContractError('filterSliceA requires an items array: ' + JSON.stringify(items), 'filterSliceA');
  }

  const unrefuted = [];
  const refuted = [];

  for (const item of items) {
    if (item == null || typeof item !== 'object') {
      throw new ContractError('filterSliceA item is not an object: ' + JSON.stringify(item), 'filterSliceA');
    }

    const collapsed = collapseAvtLabel(item.label);

    // Conflicting / NEI collapse to null -> excluded / held out.
    if (collapsed == null) {
      continue;
    }

    // The report-shaped + non-leaking filter (drops pronoun / leaky-token / over-long / multi-sentence).
    if (!reportShapedAndNonLeaking(item.claim)) {
      continue;
    }

    if (typeof item.claim_date !== 'string' || item.claim_date.length === 0) {
      throw new ContractError(
        'filterSliceA surviving item missing a non-empty claim_date (the as-of cutoff is load-bearing): ' +
          JSON.stringify(item.claim),
        'filterSliceA',
      );
    }

    // Emit ONLY claim + claim_date -- strip every leaky gold field (justification,
    // fact_checking_article, questions, label, speaker). The voter never sees the gold.
    const voterRecord = { claim: item.claim, claim_date: item.claim_date };

    if (collapsed === 'unrefuted') {
      unrefuted.push(voterRecord);
    } else {
      refuted.push(voterRecord);
    }
  }

  return { unrefuted, refuted };
}

// ---------------------------------------------------------------------------
// sliceAFeasibilityGate({ supportedCount, refutedCount }) -- the pre-registered feasibility gate
// (D-14). Clears IFF supportedCount >= N_SUP_MIN AND refutedCount >= N_REF_MIN AND BOTH directions are
// populated (> 0). Returns { cleared, provisionalLimits }; provisionalLimits ALWAYS names the uniform-
// 2020 + topical-narrowness caveats (they scope the read, even when the gate does not clear). A
// non-integer / negative count is a ContractError.
// ---------------------------------------------------------------------------
export function sliceAFeasibilityGate({ supportedCount, refutedCount } = {}) {
  for (const [name, v] of [['supportedCount', supportedCount], ['refutedCount', refutedCount]]) {
    if (!Number.isInteger(v) || v < 0) {
      throw new ContractError(
        'sliceAFeasibilityGate requires a non-negative integer ' + name + ': ' + JSON.stringify(v),
        'sliceAFeasibilityGate',
      );
    }
  }

  const cleared =
    supportedCount >= SLICE_A_GATE.N_SUP_MIN &&
    refutedCount >= SLICE_A_GATE.N_REF_MIN &&
    supportedCount > 0 &&
    refutedCount > 0;

  // provisionalLimits is a fresh copy so a caller cannot mutate the frozen source array.
  return { cleared, provisionalLimits: PROVISIONAL_LIMITS.slice() };
}

// ---------------------------------------------------------------------------
// tallyPerDirection({ verdicts, gold }) -- the FOUR confusion-matrix cells reported PER DIRECTION
// (D-11), reusing the mccFromPairs cell mapping. Returns:
//   {
//     unrefuted: { tp, fn },   // the Supported/unrefuted axis: caught-as-unrefuted (tp) vs over-refused (fn)
//     refuted:   { tn, fp },   // the Refuted axis: caught-as-refuted (tn) vs false-upheld (fp)
//   }
// It NEVER emits a pooled accuracy / rate, a Clopper-Pearson bound, a confidence interval, or a
// pass/fail cert (D-11; descriptive only). The pooled mcc that mccFromPairs also computes is discarded.
// A verdicts/gold length mismatch or an out-of-enum label is a ContractError (delegated to
// mccFromPairs).
// ---------------------------------------------------------------------------
export function tallyPerDirection({ verdicts, gold } = {}) {
  // Reuse the SAME cell mapping the calibration gate uses (D-11). mccFromPairs fails closed on a length
  // mismatch / an out-of-enum label.
  const { tp, tn, fp, fn } = mccFromPairs({ verdicts, gold });

  // Split the cells by gold DIRECTION -- never pooled. The unrefuted (Supported) axis owns TP+FN; the
  // refuted axis owns TN+FP.
  return {
    unrefuted: { tp, fn },
    refuted: { tn, fp },
  };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Single positional <averitec-dev.json>
// holding { claims: [...] }; prints the per-direction filtered counts + the feasibility-gate result;
// exits 0 if the gate clears, 1 if it does not, 2 on a contract error. NO model call -- it reads the
// cached gold from disk (zero spend).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv[2];

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('lz-eval-sliceA-gold: missing or invalid <averitec-dev.json>');
    process.exit(2);
  }

  try {
    const data = readJson(inputPath);
    const items = Array.isArray(data) ? data : data.claims;
    const { unrefuted, refuted } = filterSliceA({ items });
    const { cleared, provisionalLimits } = sliceAFeasibilityGate({
      supportedCount: unrefuted.length,
      refutedCount: refuted.length,
    });
    console.log('clean unrefuted=' + unrefuted.length + ' clean refuted=' + refuted.length + ' gate-cleared=' + cleared);

    for (const limit of provisionalLimits) {
      console.log('provisional: ' + limit);
    }

    process.exit(cleared ? 0 : 1);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-sliceA-gold: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
