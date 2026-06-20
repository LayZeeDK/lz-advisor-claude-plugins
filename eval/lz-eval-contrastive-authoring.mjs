// lz-eval-contrastive-authoring.mjs
//
// NET-NEW (Plan 20-06, Task 1; D-21 / CERTIFY-WORKS-BOARD-DECISION.md, NO-SPEND build / STUB-exercised):
// the ARM-A (false-uphold) CONTRASTIVE MINIMAL-PAIR AUTHORING + adjudication harness + the
// construct-validity verdict. THE AUTHORITY is CERTIFY-WORKS-BOARD-DECISION.md (the two-arm split-source
// cert; sections 1-3) + 20-CONTEXT.md D-21 (the board re-plan directive that supersedes the infeasible
// D-02 "harvest dense-SUPPORTED from own output" false-uphold source).
//
// THE TWO-ARM SPLIT-SOURCE DESIGN (load-bearing): arm B (over-refusal) STAYS live-harvested
// (eval/lz-eval-harvest.mjs; D-02 valid for arm B). arm A (false-uphold) is now MANUALLY-CONSTRUCTED
// contrastive minimal-pairs, each a MINIMAL EDIT of a REAL live dense evidence bundle of the SAME class
// as the over-refusal positives (flip ONLY the truth-value; preserve density / length / style). N >= 30
// (the 12-trap seed EXPANDED; CP-upper(0/12) ~ 0.22-0.27 > TAU_FU 0.10 is UNDERPOWERED; 0/30 clears 0.10).
// THIS HARNESS OWNS ONLY ARM A -- it NEVER sees arm B's over-refusal controls; the two arms are NEVER
// pooled into one N (a function or return shape that pools them is a DEFECT).
//
// THE OFFLINE TWIN: eval/lz-eval-contrastive-screen.mjs (runContrastiveScreen) is the offline analog.
// This file COPIES its itemPacket / flattenPairItems shape (the gold direction the consensus compares to
// is NEVER rendered into the prompt) and REUSES the SAME strict makeBatchedOofProbe -> runProbeConsensus
// all-agree gold-blind contract on the live OOF pair (gpt-5.5 + gemini-3.1-pro-preview).
//
// THE LZ_SPEND HARD-GUARD (D-07 / T-20-27): adjudicateContrastivePairs calls requireSpend('callOof')
// FIRST before any real Copilot dispatch -- it THROWS unless process.env.LZ_SPEND === '1'. The stub test
// path (stub: true) runs ZERO spend; the entire FILE-form test suite runs stubs only. NO model spend in
// this build.
//
// Frozen primitives consumed BYTE-IDENTICAL (REUSE; never re-authored, never re-derived):
//   - makeBatchedOofProbe (eval/lz-eval-oof-batch.mjs) + runProbeConsensus (eval/lz-eval-trap-assembler.mjs)
//     -- the strict all-agree gold-blind adjudication (a packet is RETAINED only if EVERY probe agrees
//     entails === expectedEntailment);
//   - FROZEN_OOF_PAIR (eval/lz-eval-live-cert.mjs:100 -- gpt-5.5 + gemini-3.1-pro-preview) + requireSpend;
//   - SUBSTRING_REJECT_MAX_CHARS (40) + MIN_COMPLEXITY_TOKENS (12) (eval/lz-eval-control-construction.mjs)
//     -- the minimal-edit construction guards.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees by
// relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). Zero npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).
//
// Pure functions are exported for the validation fixture; the thin CLI is guarded so that `import`-ing
// this module does NOT run the CLI.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// (1) The FROZEN OOF all-agree gold-blind seams (CONSUMED byte-identical).
import { makeBatchedOofProbe } from './lz-eval-oof-batch.mjs';
import { runProbeConsensus } from './lz-eval-trap-assembler.mjs';

// (2) The FROZEN OOF gold-decider identity + the LZ_SPEND hard-guard (CONSUMED byte-identical).
import { FROZEN_OOF_PAIR, requireSpend } from './lz-eval-live-cert.mjs';

// (3) The minimal-edit construction guards (the pre-registered literal constants; CONSUMED byte-identical).
import {
  SUBSTRING_REJECT_MAX_CHARS,
  MIN_COMPLEXITY_TOKENS,
} from './lz-eval-control-construction.mjs';

// (4) Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (D-10; eval -> runtime,
//     one-directional, never the reverse).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// THE FROZEN ARM-A FLOOR (module-level literal; pre-registered, recorded in the re-authored lock rule
// WITH A TIMESTAMP before any pair is authored or scored, Task 3). Fewer than MIN_TRAP_PAIRS pairs ->
// arm A is UNDERPOWERED for TAU_FU 0.10 (CP-upper(0/12) ~ 0.22-0.27 > 0.10); the harness flags
// underpowered:true so a downstream cert can NEVER WORKS on arm A. N is FROZEN before scoring (no optional
// stopping). NOT computed from the corpus.
// ---------------------------------------------------------------------------
export const MIN_TRAP_PAIRS = 30;

// The FROZEN OOF gold-decider pair (re-exported from the byte-identical FROZEN_OOF_PAIR -- never a new
// identity). The arm-A adjudication consumes THIS exact pair as the gold adjudicator (board section 6).
export const FROZEN_PAIR = FROZEN_OOF_PAIR;

// ---------------------------------------------------------------------------
// Helpers (pure). Mirrored from eval/lz-eval-control-construction.mjs (the construction guards are private
// there; the CONSTANTS are imported byte-identical above, and these helpers mirror the same discipline so
// the harness applies the SAME complexity floor + substring read the offline construction does).
// ---------------------------------------------------------------------------

// Whitespace-token count of a string (the complexity floor metric -- mirrors control-construction).
function tokenCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

// The longest EXACT shared substring length between two strings (a rolling two-row LCS-substring DP --
// mirrors control-construction's longestCommonSubstringLength; the strings here are short excerpts).
function longestCommonSubstringLength(a, b) {
  const s = String(a || '');
  const t = String(b || '');

  if (s.length === 0 || t.length === 0) {
    return 0;
  }

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

// The evidence text of a bundle, joined for the complexity + substring reads. A bundle carries
// { evidence: ['...'] } OR { evidence: [{ sentence }] } OR an evidence string. Coerces to '' on malformed.
function bundleEvidenceText(bundle) {
  if (bundle == null || typeof bundle !== 'object') {
    return '';
  }

  const ev = bundle.evidence;

  if (typeof ev === 'string') {
    return ev;
  }

  if (Array.isArray(ev)) {
    return ev
      .map((e) => {
        if (typeof e === 'string') {
          return e;
        }

        if (e != null && typeof e === 'object' && typeof e.sentence === 'string') {
          return e.sentence;
        }

        if (e != null && typeof e === 'object' && typeof e.text === 'string') {
          return e.text;
        }

        return '';
      })
      .filter((x) => x.length > 0)
      .join(' ');
  }

  return '';
}

// Normalize a bundle's evidence into the survivor array shape {sentence} (the OOF packet shape).
function bundleSurvivors(bundle) {
  const ev = bundle && bundle.evidence;

  if (Array.isArray(ev)) {
    return ev.map((e) => (typeof e === 'string' ? { sentence: e } : e));
  }

  if (typeof ev === 'string') {
    return [{ sentence: ev }];
  }

  return [];
}

// ---------------------------------------------------------------------------
// authorContrastivePair(denseBundle, { overclaim }): given a REAL dense bundle (a harvest
// denseTrapMonitor member: { uid, claim, evidence, corroboration_lower_bound }), returns a
// { supported, refuted } pair where:
//   - the SUPPORTED side is the REAL bundle (gold 'unrefuted' -- the evidence entails the claim);
//   - the REFUTED side is a MINIMAL EDIT that flips ONLY the truth-value (an overclaim/contradiction the
//     SAME evidence does NOT entail), preserving density / length / style. The evidence is IDENTICAL on
//     both sides (the edit is claim-side-by-construction here -- only the claim's truth-value flips). The
//     REFUTED side must clear the MIN_COMPLEXITY_TOKENS floor (a trivially-short member would pass by
//     style). The substring read targets CROSS-PAIR lexical leakage downstream (gate (a) the AUC), NOT
//     the SUPPORTED/REFUTED partner overlap (a contrastive pair's two members SHARE most tokens by
//     construction; a >= 40-char shared run vs its own partner is EXPECTED and allowed).
//
// Each pair carries provenance: source_uid = the real bundle uid (the minimal-edit-from-a-real-bundle
// provenance, gate (d)). A bundle missing a uid is rejected (no synthetic-from-scratch -- gate (d) fails
// closed downstream).
//
// `overclaim` is the INJECTED minimal-edit text (the human author writes the truth-value flip; the harness
// does NOT fabricate it). When omitted, the SEED fixture below supplies the authored overclaim per bundle.
// ---------------------------------------------------------------------------
export function authorContrastivePair(denseBundle, { overclaim } = {}) {
  if (denseBundle == null || typeof denseBundle !== 'object') {
    throw new ContractError('authorContrastivePair requires a dense bundle object', 'authorContrastivePair');
  }

  if (typeof denseBundle.uid !== 'string' || denseBundle.uid.length === 0) {
    throw new ContractError('authorContrastivePair requires a real-bundle uid (gate (d): minimal-edit-from-a-real-bundle, no synthetic-from-scratch): ' + JSON.stringify(denseBundle.uid), 'authorContrastivePair');
  }

  if (typeof denseBundle.claim !== 'string' || denseBundle.claim.length === 0) {
    throw new ContractError('authorContrastivePair requires a non-empty bundle claim', 'authorContrastivePair');
  }

  const refutedClaim = typeof overclaim === 'string' ? overclaim : denseBundle.overclaim;

  if (typeof refutedClaim !== 'string' || refutedClaim.length === 0) {
    throw new ContractError('authorContrastivePair requires an authored overclaim (the truth-value flip) for uid ' + denseBundle.uid, 'authorContrastivePair');
  }

  // The REFUTED side flips ONLY the truth-value; the edit must NOT be a trivially-short member (it would
  // let a model pass by style, not judgment). Clear the complexity floor on the refuted claim.
  if (tokenCount(refutedClaim) < MIN_COMPLEXITY_TOKENS) {
    throw new ContractError('authorContrastivePair refuted claim below the complexity floor (' + MIN_COMPLEXITY_TOKENS + ' tokens) for uid ' + denseBundle.uid, 'authorContrastivePair');
  }

  const evidence = denseBundle.evidence;
  const corroboration = Number.isInteger(denseBundle.corroboration_lower_bound) ? denseBundle.corroboration_lower_bound : 0;

  return Object.freeze({
    source_uid: denseBundle.uid,
    corroboration_lower_bound: corroboration,
    supported: Object.freeze({
      id: denseBundle.uid + '::sup',
      claim: denseBundle.claim,
      evidence,
      source_uid: denseBundle.uid,
    }),
    refuted: Object.freeze({
      id: denseBundle.uid + '::ref',
      claim: refutedClaim,
      evidence,
      source_uid: denseBundle.uid,
    }),
  });
}

// ---------------------------------------------------------------------------
// authorContrastivePairs(denseBundles): map authorContrastivePair over an array of REAL dense bundles
// (each carrying an authored overclaim). Returns the frozen pair array. The two arms are NEVER pooled:
// this only sees arm-A dense bundles (the false-uphold source), never arm B's over-refusal controls.
// ---------------------------------------------------------------------------
export function authorContrastivePairs(denseBundles) {
  if (!Array.isArray(denseBundles) || denseBundles.length === 0) {
    throw new ContractError('authorContrastivePairs requires a non-empty dense-bundle array', 'authorContrastivePairs');
  }

  return Object.freeze(denseBundles.map((b) => authorContrastivePair(b)));
}

// ---------------------------------------------------------------------------
// The per-item packet shape runProbeConsensus / makeBatchedOofProbe expect (COPIED byte-faithful from
// eval/lz-eval-contrastive-screen.mjs:106-138). The packet renders ONLY the evidence survivors + the
// claim (gold-blind); expectedEntailment is the gold direction (SUPPORTED/'unrefuted' -> 'true';
// REFUTED/'refuted' -> 'false') and is NEVER placed in the rendered prompt -- it lives ONLY in the
// downstream consensus compare.
// ---------------------------------------------------------------------------
function itemPacket(item, i) {
  const id = item && item.id !== undefined ? String(item.id) : 'ci-' + i;
  const claim = item && typeof item.claim === 'string' ? item.claim : '';
  const survivors = bundleSurvivors(item);
  const expectedEntailment = item && item.gold === 'unrefuted' ? 'true' : 'false';

  return {
    trap: { uid: id, claim, enrichedKs: survivors },
    enrichedKs: survivors,
    stratum: 'contrastive',
    decisiveRank: -1,
    expectedEntailment,
  };
}

// Flatten the pairs into the 2N-item (item, gold) sequence (COPIED from the offline twin). A pair is
// { supported, refuted }; the SUPPORTED side -> gold 'unrefuted', the REFUTED side -> gold 'refuted'.
function flattenPairItems(pairs) {
  const items = [];

  for (let p = 0; p < pairs.length; p += 1) {
    const pair = pairs[p];

    if (!pair || typeof pair !== 'object' || !pair.supported || !pair.refuted) {
      throw new ContractError('flattenPairItems pair ' + p + ' must carry { supported, refuted }', 'flattenPairItems');
    }

    items.push({ ...pair.supported, gold: 'unrefuted', id: pair.supported.id !== undefined ? pair.supported.id : 'pair-' + p + '-sup' });
    items.push({ ...pair.refuted, gold: 'refuted', id: pair.refuted.id !== undefined ? pair.refuted.id : 'pair-' + p + '-ref' });
  }

  return items;
}

// ---------------------------------------------------------------------------
// adjudicateContrastivePairs({ pairs, callModel, frozenPair = FROZEN_PAIR, score, stub = false }):
//   flattens pairs into the 2N-item (item, gold) sequence, builds ONE makeBatchedOofProbe per FROZEN_PAIR
//   model, runs probe.prepare(packets) FIRST (the documented PRE-PASS shape -- an unprepared packet
//   fail-closes to DROP), then runProbeConsensus per item; maps retained-vs-gold to the verdict.
//
//   A SUPPORTED item is RETAINED (upheld) iff BOTH probes agree entails='true'; a REFUTED item iff BOTH
//   agree entails='false' -- the SAME strict all-agree gold-blind screen as the offline twin. The mapped
//   verdict: a retained item matches its gold; a non-retained item is the OPPOSITE verdict (the consensus
//   did not agree on the gold direction). For arm A, a REFUTED item that the voter would UPHOLD (verdict
//   'unrefuted' against a 'refuted' gold) is a FALSE-UPHOLD -- the catastrophic event TAU_FU bounds.
//
//   callModel is INJECTED. A real run is the LZ_SPEND-gated Copilot transport -- this harness calls
//   requireSpend('callOof') FIRST before any real dispatch. The test passes a deterministic STUB with
//   { stub: true } -> the spend guard is bypassed (ZERO spend) for the no-spend seam exercise.
//
//   Returns { verdicts, gold, retainedCount, falseUpholds, residue } -- arm A ONLY (never pooled with arm B).
// ---------------------------------------------------------------------------
export async function adjudicateContrastivePairs({
  pairs,
  callModel,
  frozenPair = FROZEN_PAIR,
  score,
  stub = false,
} = {}) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new ContractError('adjudicateContrastivePairs requires a non-empty pairs array', 'adjudicateContrastivePairs');
  }

  if (typeof callModel !== 'function') {
    throw new ContractError('adjudicateContrastivePairs requires a callModel function', 'adjudicateContrastivePairs');
  }

  // The LZ_SPEND hard-guard: any REAL dispatch (stub !== true) THROWS unless LZ_SPEND=1. The stub seam
  // test bypasses it (zero spend). requireSpend('callOof') FIRST -- before building or preparing probes.
  if (stub !== true) {
    requireSpend('callOof');
  }

  const items = flattenPairItems(pairs);
  const goldList = items.map((it) => it.gold);
  const packets = items.map((it, i) => itemPacket(it, i));

  // ONE batched OOF probe per frozen-pair model (gpt-5.5 + gemini-3.1-pro-preview); PREPARE each before
  // the consensus loop (the documented PRE-PASS shape).
  const probes = frozenPair.map((model) => makeBatchedOofProbe({ callModel: (prompt) => callModel(model, prompt), model, score }));

  for (const probe of probes) {
    // eslint-disable-next-line no-await-in-loop
    await probe.prepare(packets);
  }

  const verdicts = [];
  let retainedCount = 0;
  let residue = 0;

  for (let i = 0; i < packets.length; i += 1) {
    const packet = packets[i];
    // eslint-disable-next-line no-await-in-loop
    const consensus = await runProbeConsensus(probes, packet);
    const gold = goldList[i];

    if (consensus.retained) {
      retainedCount += 1;
      verdicts.push(gold === 'unrefuted' ? 'unrefuted' : 'refuted');
    } else {
      // A non-retained item: the consensus did not agree on the gold direction (a split or a reject).
      // Map it to the OPPOSITE verdict; a split is residue (the OOF pair did not all-agree).
      if (consensus.split) {
        residue += 1;
      }

      verdicts.push(gold === 'unrefuted' ? 'refuted' : 'unrefuted');
    }
  }

  // A FALSE-UPHOLD (arm A's catastrophic event): a REFUTED-gold item the voter UPHELD ('unrefuted').
  let falseUpholds = 0;

  for (let i = 0; i < verdicts.length; i += 1) {
    if (goldList[i] === 'refuted' && verdicts[i] === 'unrefuted') {
      falseUpholds += 1;
    }
  }

  return {
    verdicts,
    gold: goldList,
    retainedCount,
    falseUpholds,
    residue,
  };
}

// ---------------------------------------------------------------------------
// constructValidityVerdict({ pairs, lexicalAuc, notEasier }): folds the three construct-validity gates
// into the per-corpus verdict (board section 3):
//   - gate (d) [MANDATORY]: every pair carries source_uid (minimal-edit-from-a-real-bundle) -> minimalEdit.
//     A pair missing source_uid fails minimalEdit CLOSED (no synthetic-from-scratch).
//   - gate (a) [PRIMARY]: lexicalAuc <= LEXICAL_AUC_CEILING (the truth-value is not lexically readable) ->
//     lexicalGatePass. The caller computes lexicalAuc + the pass via eval/lz-eval-baseline-guard.mjs's
//     lexicalOverlapAuc (Task 2); this folds the boolean.
//   - gate (b): notEasier === true (the constructed cell is HARDER or statistically indistinguishable;
//     NOT detectably easier) -> difficultyGatePass. The caller computes notEasier via
//     eval/lz-eval-difficulty-proxy.mjs's oneSidedNotEasierGuard (Task 2).
// constructValid = minimalEdit AND lexicalGatePass AND difficultyGatePass. A failing gate -> a downstream
// cert is SCOPED (scoped to the unverified distribution claim), never WORKS (board section 2).
//
// lexicalAuc / notEasier are passed in (not computed here) so the construct-validity verdict stays a pure
// fold over already-collected gate results (the two arms' gates are computed by the Task-2 modules).
// ---------------------------------------------------------------------------
export function constructValidityVerdict({ pairs, lexicalAuc, lexicalGatePass, notEasier } = {}) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new ContractError('constructValidityVerdict requires a non-empty pairs array', 'constructValidityVerdict');
  }

  // gate (d) MANDATORY: every pair carries source_uid (a real-bundle provenance). A missing source_uid on
  // ANY pair (or either member) fails minimalEdit CLOSED.
  let minimalEdit = true;

  for (const pair of pairs) {
    const ok =
      pair != null &&
      typeof pair === 'object' &&
      typeof pair.source_uid === 'string' &&
      pair.source_uid.length > 0 &&
      pair.supported != null &&
      typeof pair.supported.source_uid === 'string' &&
      pair.supported.source_uid.length > 0 &&
      pair.refuted != null &&
      typeof pair.refuted.source_uid === 'string' &&
      pair.refuted.source_uid.length > 0;

    if (!ok) {
      minimalEdit = false;
      break;
    }
  }

  // gate (a) PRIMARY: lexicalGatePass is the boolean from lexicalOverlapAuc (auc <= ceiling). Accept an
  // explicit boolean; otherwise it must be supplied (fail closed if absent so a missing gate is not
  // silently treated as a pass).
  const lexicalGate = lexicalGatePass === true;

  // gate (b): notEasier === true.
  const difficultyGatePass = notEasier === true;

  const constructValid = minimalEdit && lexicalGate && difficultyGatePass;

  return Object.freeze({
    minimalEdit,
    lexicalAuc: typeof lexicalAuc === 'number' ? lexicalAuc : null,
    lexicalGatePass: lexicalGate,
    difficultyGatePass,
    constructValid,
    // The downstream verdict scope: a failing gate -> SCOPED, never WORKS (board section 2).
    certScope: constructValid ? 'works-eligible' : 'scoped',
  });
}

// ---------------------------------------------------------------------------
// underpowered(pairs): arm A is UNDERPOWERED when it carries fewer than MIN_TRAP_PAIRS (30) pairs --
// CP-upper(0/12) ~ 0.22-0.27 > TAU_FU 0.10. A downstream cert can NEVER WORKS on an underpowered arm A.
// ---------------------------------------------------------------------------
export function isUnderpowered(pairs) {
  return !Array.isArray(pairs) || pairs.length < MIN_TRAP_PAIRS;
}

// ===========================================================================
// THE COMMITTED ARM-A SEED (>= MIN_TRAP_PAIRS pairs). Each entry is a REAL-CLASS dense evidence bundle
// (uid + claim + evidence + corroboration_lower_bound) with an AUTHORED overclaim -- the minimal
// truth-value flip the SAME evidence does NOT entail (an exaggerated magnitude, an over-broadened scope,
// or an unwarranted causal/temporal claim). The 12-trap seed is EXPANDED to >= 30 (the underpowered 12 is
// the seed material; the remaining pairs are authored from the SAME class of dense bundle). Each overclaim
// preserves the claim's density / length / style and clears the complexity floor.
//
// Uids are ':'-free (Windows vote-store filename constraint) -- the '::' qualifier is the only separator.
// These are AUTHORING FIXTURES for the no-spend seam exercise + the construct-validity gate; the REAL live
// run (re-authored Plan 20-05) authors arm A from the live harvested denseTrapMonitor members at spend time.
// ===========================================================================
function bundle(uid, claim, overclaim, evidence, corroboration) {
  return Object.freeze({ uid, claim, overclaim, evidence, corroboration_lower_bound: corroboration });
}

export const ARM_A_SEED = Object.freeze([
  // --- The 12-trap seed material (dense / contested-evidence bundles; magnitude/scope/causal flips). ---
  bundle('seed-econ-01', 'The regional unemployment rate fell from 8.1 percent to 6.4 percent over the two-year period.', 'The regional unemployment rate fell from 8.1 percent to under 2.0 percent over the two-year period.', ['The regional labor bureau reported the unemployment rate at 8.1 percent at the start of the period.', 'The same bureau reported the rate at 6.4 percent two years later, a decline of 1.7 points.'], 3),
  bundle('seed-clin-02', 'The trial reported a statistically significant reduction in relapse among the treated cohort.', 'The trial reported that the treatment completely eliminated relapse across the entire treated cohort.', ['The randomized trial enrolled 410 participants across two treatment arms.', 'The treated arm showed a relapse rate of 14 percent versus 23 percent in the control arm, p less than 0.05.'], 4),
  bundle('seed-clim-03', 'Average sea-surface temperature in the basin rose by roughly 0.6 degrees over three decades.', 'Average sea-surface temperature in the basin rose by roughly six degrees over three decades.', ['The oceanographic survey recorded a basin mean of 21.2 degrees in the first decade.', 'The same survey recorded a basin mean of 21.8 degrees in the third decade, about 0.6 degrees warmer.'], 3),
  bundle('seed-tech-04', 'The new index halved the median query latency relative to the previous build.', 'The new index reduced the median query latency to essentially zero relative to the previous build.', ['Benchmarks recorded a median query latency of 240 milliseconds on the previous build.', 'The same benchmark suite recorded 118 milliseconds on the new index, roughly half.'], 2),
  bundle('seed-demo-05', 'The city population grew by about 12 percent between the two census counts.', 'The city population more than tripled in size between the two successive decennial census counts.', ['The first census recorded a city population of 612,000 residents.', 'The second census, a decade later, recorded 685,000 residents, a rise of about 12 percent.'], 3),
  bundle('seed-fin-06', 'The fund returned 7.3 percent net of fees in the reporting year.', 'The fund returned more than 70 percent net of fees in the reporting year.', ['The audited statement reported a gross return of 8.1 percent for the reporting year.', 'After a 0.8 percent fee load the net return was 7.3 percent.'], 2),
  bundle('seed-bio-07', 'The enzyme variant increased reaction throughput under the tested conditions.', 'The enzyme variant increased reaction throughput by a factor of one thousand under the tested conditions.', ['The assay measured a baseline throughput of 1,000 units per hour for the wild-type enzyme.', 'The variant assay measured 1,450 units per hour under the same tested conditions.'], 3),
  bundle('seed-edu-08', 'Reading scores in the pilot schools improved modestly over the baseline cohort.', 'Reading scores in the pilot schools doubled over the baseline cohort within a single term.', ['The baseline cohort scored a mean of 512 on the standardized reading assessment.', 'The pilot cohort scored a mean of 529 on the same assessment, a modest gain.'], 2),
  bundle('seed-energy-09', 'The retrofit cut building energy use by approximately 18 percent year over year.', 'The retrofit cut building energy use to almost nothing year over year.', ['Metered consumption was 1.42 gigawatt-hours in the year before the retrofit.', 'Metered consumption was 1.16 gigawatt-hours in the year after, about 18 percent lower.'], 3),
  bundle('seed-epi-10', 'Reported case counts in the district declined steadily across the surveillance window.', 'Reported case counts in the district were driven to zero across the surveillance window.', ['The surveillance log recorded 1,240 cases in the opening month of the window.', 'The same log recorded 410 cases in the closing month, a steady decline but not zero.'], 4),
  bundle('seed-trade-11', 'Bilateral trade volume between the two states rose over the measured interval.', 'Bilateral trade volume between the two states rose by an order of magnitude over the measured interval.', ['Customs data recorded 4.2 billion in bilateral trade at the start of the interval.', 'Customs data recorded 5.1 billion at the end of the interval, a rise of roughly 21 percent.'], 2),
  bundle('seed-agri-12', 'Crop yield per hectare improved after the irrigation change in the trial plots.', 'Crop yield per hectare improved fivefold after the irrigation change in the trial plots.', ['Control plots yielded a mean of 6.1 tonnes per hectare in the trial season.', 'Treated plots yielded a mean of 6.9 tonnes per hectare under the irrigation change.'], 3),
  // --- The EXPANSION to N >= 30 (>= 18 more, SAME class of dense bundle; same minimal truth-value flips). ---
  bundle('seed-pharma-13', 'The drug shortened the median hospital stay relative to standard care.', 'The drug shortened the median hospital stay to a single day relative to standard care.', ['Standard-care patients had a median stay of 9.2 days in the cohort.', 'Drug-arm patients had a median stay of 7.1 days, about two days shorter.'], 3),
  bundle('seed-transit-14', 'Daily ridership on the new line exceeded the planning forecast in its first quarter.', 'Daily ridership on the new line exceeded the planning forecast tenfold in its first quarter.', ['The planning forecast projected 48,000 daily riders for the first quarter.', 'The recorded average was 56,000 daily riders, about 17 percent above forecast.'], 2),
  bundle('seed-mfg-15', 'Defect rates on the assembly line fell after the process audit.', 'Defect rates on the assembly line fell to zero after the process audit.', ['The pre-audit defect rate was 3.4 per thousand units across the sampled batches.', 'The post-audit defect rate was 1.9 per thousand units across the same sampling scheme.'], 3),
  bundle('seed-water-16', 'Contaminant concentration in the reservoir dropped after the new filtration stage.', 'Contaminant concentration in the reservoir dropped below all detectable limits after the new filtration stage.', ['Pre-filtration samples averaged 42 micrograms per liter of the target contaminant.', 'Post-filtration samples averaged 28 micrograms per liter, a measurable but partial drop.'], 4),
  bundle('seed-labor-17', 'Median wages in the sector rose faster than the national average over the decade.', 'Median wages in the sector rose more than ten times faster than the national average over the decade.', ['Sector median wages rose 2.9 percent annually over the decade per the wage survey.', 'The national average over the same decade was 2.1 percent annually.'], 2),
  bundle('seed-housing-18', 'New housing starts in the metro area increased relative to the prior year.', 'New housing starts in the metro area increased a hundredfold relative to the prior year.', ['Permitting records show 11,200 housing starts in the prior year.', 'Permitting records show 12,600 starts in the current year, about a 12 percent rise.'], 3),
  bundle('seed-vaccine-19', 'The vaccine reduced symptomatic infection in the vaccinated arm of the trial.', 'The vaccine eradicated symptomatic infection in the vaccinated arm of the trial.', ['The trial recorded a symptomatic infection rate of 4.1 percent in the vaccinated arm.', 'The unvaccinated arm recorded 11.7 percent, a significant relative reduction but not eradication.'], 4),
  bundle('seed-retail-20', 'Online sales as a share of total revenue grew across the reported quarters.', 'Online sales became the entire share of total revenue across the reported quarters.', ['Online sales were 22 percent of total revenue in the opening quarter.', 'Online sales were 31 percent of total revenue in the closing quarter, a clear but partial shift.'], 2),
  bundle('seed-forest-21', 'Tree cover in the protected zone recovered after the replanting program.', 'Tree cover in the protected zone fully recovered to pre-disturbance levels after the replanting program.', ['Satellite analysis estimated 61 percent canopy cover before the replanting program.', 'Satellite analysis estimated 68 percent canopy cover three years after, a partial recovery.'], 3),
  bundle('seed-telecom-22', 'Average broadband speeds in the rural region improved after the infrastructure rollout.', 'Average broadband speeds in the rural region improved by a factor of fifty after the infrastructure rollout.', ['Pre-rollout median speed in the region was 24 megabits per second.', 'Post-rollout median speed was 41 megabits per second, a substantial but bounded gain.'], 2),
  bundle('seed-mortality-23', 'Infant mortality in the province declined over the program period.', 'Infant mortality in the province was completely eliminated over the program period.', ['The health registry recorded 18.4 infant deaths per thousand at the program start.', 'The registry recorded 12.1 per thousand at the program end, a real decline but not elimination.'], 4),
  bundle('seed-emissions-24', 'Industrial emissions in the corridor decreased after the regulation took effect.', 'Industrial emissions in the corridor decreased to pre-industrial levels after the regulation took effect.', ['Monitored emissions were 2.1 million tonnes in the year before the regulation.', 'Monitored emissions were 1.7 million tonnes in the year after, an 18 percent cut.'], 3),
  bundle('seed-startup-25', 'The platform user base expanded during the funded growth phase.', 'The platform user base expanded to encompass the entire addressable market during the funded growth phase.', ['The platform reported 1.2 million active users at the start of the growth phase.', 'The platform reported 1.9 million active users at the end, strong but partial penetration.'], 2),
  bundle('seed-soil-26', 'Soil organic carbon increased in the plots under the new tillage practice.', 'Soil organic carbon increased tenfold in the plots under the new tillage practice.', ['Baseline plots measured 1.8 percent soil organic carbon at the trial start.', 'Treated plots measured 2.2 percent soil organic carbon after three seasons.'], 3),
  bundle('seed-crime-27', 'Reported property crime in the precinct fell over the intervention period.', 'Reported property crime in the precinct fell to zero over the intervention period.', ['The precinct logged 1,510 property-crime reports in the year before the intervention.', 'The precinct logged 1,180 reports in the year after, a clear but partial drop.'], 4),
  bundle('seed-fishery-28', 'Fish stock biomass in the managed zone rebounded after the catch limits.', 'Fish stock biomass in the managed zone rebounded to historic maxima after the catch limits.', ['Stock assessments estimated 38,000 tonnes of biomass before the catch limits.', 'Stock assessments estimated 46,000 tonnes three years after, a meaningful rebound.'], 3),
  bundle('seed-grid-29', 'Renewable generation share on the grid rose during the transition program.', 'Renewable generation share on the grid rose to one hundred percent during the transition program.', ['Renewables supplied 28 percent of grid generation at the program start.', 'Renewables supplied 37 percent at the program end, a substantial but partial rise.'], 2),
  bundle('seed-literacy-30', 'Adult literacy rates in the district climbed after the outreach campaign.', 'Adult literacy rates in the district reached universal levels after the outreach campaign.', ['The district survey measured 71 percent adult literacy before the campaign.', 'The district survey measured 78 percent adult literacy after, a real but bounded gain.'], 3),
  bundle('seed-traffic-31', 'Average commute times on the corridor decreased after the signal retiming.', 'Average commute times on the corridor decreased by ninety percent after the signal retiming.', ['The corridor averaged a 28-minute commute before the signal retiming.', 'The corridor averaged a 24-minute commute after, a modest improvement.'], 2),
  bundle('seed-recycling-32', 'Household recycling participation rose after the curbside program launched.', 'Household recycling participation rose to total community-wide adoption after the curbside program launched.', ['Participation was 44 percent of households before the curbside program.', 'Participation was 58 percent of households after, a clear but partial increase.'], 3),
]);

// The authored arm-A seed pairs (>= MIN_TRAP_PAIRS). Authored at import time from ARM_A_SEED so the
// committed seed count is asserted in the test (arm A clears CP-upper(0/30) <= TAU_FU 0.10).
export const ARM_A_SEED_PAIRS = authorContrastivePairs(ARM_A_SEED);

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--seed-count` it prints the committed
// arm-A seed pair count + the MIN_TRAP_PAIRS floor (NO model spend -- pure construction). The real live
// adjudication is the human-gated re-authored Plan 20-05 (LZ_SPEND=1).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const mode = process.argv[2];

  if (mode === '--seed-count') {
    const n = ARM_A_SEED_PAIRS.length;
    console.log('arm-A seed pairs=' + n + ' (floor MIN_TRAP_PAIRS=' + MIN_TRAP_PAIRS + (n >= MIN_TRAP_PAIRS ? ', OK' : ', UNDERPOWERED') + '); two arms never pooled (arm A only)');
    process.exit(0);
  }

  console.error('lz-eval-contrastive-authoring: usage: node lz-eval-contrastive-authoring.mjs --seed-count');
  process.exit(2);
}
/* node:coverage enable */

// Silence the unused-import lint for the substring guard (it is documented as the CROSS-PAIR leakage read
// the downstream AUC gate (a) consumes; the harness exposes the constant for the lock-rule manifest).
void SUBSTRING_REJECT_MAX_CHARS;
void longestCommonSubstringLength;
void bundleEvidenceText;
