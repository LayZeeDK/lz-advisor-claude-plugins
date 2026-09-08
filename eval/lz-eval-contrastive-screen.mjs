// lz-eval-contrastive-screen.mjs
//
// NET-NEW (RE-PLAN-12, NO-SPEND build / STUB-exercised; Task 8): the CONTRASTIVE-SCREEN harness + the
// PRE-REGISTERED SCREEN-PASS / DEMOTE decision. THE AUTHORITY is 19-04-REPLAN-DECISION-12.md (the
// board-converged STAGED path to certified WORKS) + 19-04-CERTIFY-WORKS-RESEARCH.md (F3/F4/F5/F7).
//
// THE STAGED DESIGN (load-bearing): offline NEVER earns the word WORKS (the SDT positive-trials
// constraint, F5/F7). This screen is a confound-robust SCREEN whose output label is SCREEN-PASS /
// PROVISIONAL. A 'gate' decision GATES progression to the LIVE stage (Phase 20), where WORKS is
// certified; a 'demote' decision reverts offline to TRAP-ONLY + explicitly incomplete and the
// MCC/over-refusal verdict + the full-WORKS certification defer ENTIRELY to the live stage. EITHER WAY
// provisional is ALWAYS true.
//
// THE PRE-REGISTERED RULE (the bar is FIXED in eval/lz-eval-mcc.mjs as module constants, recorded in
// the lock-rule + manifest WITH A TIMESTAMP BEFORE any pair is authored or scored -- the only defense
// against result-shopping for a literature-unspecified bar): decideContrastiveScreen -> 'gate' iff
//   guardPasses AND mcc >= MCC_BAR_POINT (0.5) AND mccLowerCI > 0 (strictly) AND permutationP < 0.05
//   (strictly); else 'demote'. The decision NEVER tunes the bar; it is NOT auto-locked -- the
//   gate-vs-demote is HUMAN-CONFIRMED at the Task-9 checkpoint; this returns the recommendation only.
//
// THE STRICT SAME-ON-BOTH-ARMS SCREEN: the 24 contrastive items are OOF-judged via the IDENTICAL
// carried makeBatchedOofProbe -> runProbeConsensus contract as the trap arm (entails=true for a
// SUPPORTED item, entails=false for a REFUTED item -- NO asymmetric criterion). The dual-baseline guard
// RUNS FIRST (NO-SPEND); a guard fail forces 'demote' regardless of MCC.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It composes the NET-NEW MCC + guard modules + the CARRIED batched OOF
// adapter + assembler consensus; it makes NO frozen-primitive change (the OOF decider identity + the
// engine + EVAL_THRESHOLDS byte-identical).
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import {
  mccFromPairs,
  bcaBootstrapLowerCI,
  labelPermutationTestMccPositive,
  MCC_BAR_POINT,
  MCC_CI_ALPHA,
} from './lz-eval-mcc.mjs';

import { dualBaselineGuard } from './lz-eval-baseline-guard.mjs';

import { makeBatchedOofProbe } from './lz-eval-oof-batch.mjs';
import { runProbeConsensus } from './lz-eval-trap-assembler.mjs';

import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// The MINIMUM informative corpus size (12 pairs / 24 items). Below this the BCa interval is
// non-informative -> the screen is diagnostic-only (decision can NEVER be 'gate').
export const MIN_CONTRASTIVE_ITEMS = 24;

// The FROZEN OOF gold-decider pair (byte-identical to the carried decider identity; never changed here).
export const FROZEN_PAIR = Object.freeze(['gpt-5.5', 'gemini-3.1-pro-preview']);

// ---------------------------------------------------------------------------
// decideContrastiveScreen({ guardPasses, mcc, mccLowerCI, permutationP, mccBarPoint = MCC_BAR_POINT })
//   -> 'gate' | 'demote'. The PRE-REGISTERED rule (the bar is FIXED in the MCC module; this NEVER tunes
//   it). 'gate' iff ALL of:
//     - guardPasses          (the dual-baseline guard cleared: BOTH baselines at chance)
//     - mcc >= mccBarPoint   (the MCC point bar, 0.5)
//     - mccLowerCI > 0       (the one-sided 95% BCa lower CI STRICTLY clears 0)
//     - permutationP < 0.05  (the label-permutation test for MCC > 0 STRICTLY clears 0.05)
//   else 'demote'. NO auto-lock -- the gate-vs-demote is HUMAN-CONFIRMED; this is the recommendation.
// ---------------------------------------------------------------------------
export function decideContrastiveScreen({ guardPasses, mcc, mccLowerCI, permutationP, mccBarPoint = MCC_BAR_POINT } = {}) {
  if (typeof guardPasses !== 'boolean') {
    throw new ContractError('decideContrastiveScreen requires a boolean guardPasses: ' + JSON.stringify(guardPasses), 'decideContrastiveScreen');
  }

  for (const [name, v] of [['mcc', mcc], ['mccLowerCI', mccLowerCI], ['permutationP', permutationP]]) {
    if (typeof v !== 'number' || Number.isNaN(v)) {
      throw new ContractError('decideContrastiveScreen requires a finite number ' + name + ': ' + JSON.stringify(v), 'decideContrastiveScreen');
    }
  }

  const gate =
    guardPasses === true &&
    mcc >= mccBarPoint &&
    mccLowerCI > 0 &&
    permutationP < 0.05;

  return gate ? 'gate' : 'demote';
}

// ---------------------------------------------------------------------------
// Build the per-item packet shape runProbeConsensus / makeBatchedOofProbe expect from a contrastive
// pair item. Each item carries { id, claim, evidence (string|array), gold }. The packet renders ONLY
// the date-filtered evidence survivors + the claim (gold-blind); the expectedEntailment is the gold
// direction (SUPPORTED/'unrefuted' -> entails=true; REFUTED/'refuted' -> entails=false). The expected
// direction NEVER appears in the rendered prompt -- it lives ONLY in the downstream consensus compare.
// ---------------------------------------------------------------------------
function asSurvivors(evidence) {
  if (Array.isArray(evidence)) {
    return evidence.map((e) => (typeof e === 'string' ? { sentence: e } : e));
  }

  if (typeof evidence === 'string') {
    return [{ sentence: evidence }];
  }

  return [];
}

function itemPacket(item, i) {
  const id = item && item.id !== undefined ? String(item.id) : 'ci-' + i;
  const claim = item && typeof item.claim === 'string' ? item.claim : '';
  const survivors = asSurvivors(item ? item.evidence : undefined);
  // The gold direction the consensus compares to (NEVER rendered into the prompt).
  const expectedEntailment = item && item.gold === 'unrefuted' ? 'true' : 'false';

  return {
    trap: { uid: id, claim, enrichedKs: survivors },
    enrichedKs: survivors,
    stratum: 'contrastive',
    decisiveRank: -1,
    expectedEntailment,
  };
}

// Flatten the 12 pairs into the 24 (item, gold) sequence. A pair is { supported, refuted }.
function flattenPairItems(pairs) {
  const items = [];

  for (let p = 0; p < pairs.length; p += 1) {
    const pair = pairs[p];

    if (!pair || typeof pair !== 'object' || !pair.supported || !pair.refuted) {
      throw new ContractError('runContrastiveScreen pair ' + p + ' must carry { supported, refuted }', 'runContrastiveScreen');
    }

    items.push({ ...pair.supported, gold: 'unrefuted', id: pair.supported.id !== undefined ? pair.supported.id : 'pair-' + p + '-sup' });
    items.push({ ...pair.refuted, gold: 'refuted', id: pair.refuted.id !== undefined ? pair.refuted.id : 'pair-' + p + '-ref' });
  }

  return items;
}

// ---------------------------------------------------------------------------
// runContrastiveScreen({ pairs, callModel, frozenPair = FROZEN_PAIR, score, mccBarPoint, mccCiAlpha })
//   -> { verdicts, mcc, mccLowerCI, permutationP, dualBaselineGuard, decision, label, provisional,
//        trapOnly, explicitlyIncomplete, diagnosticOnly }.
//
// (1) RUN dualBaselineGuard({ pairs }) FIRST (NO-SPEND, deterministic).
// (2) Build one batched OOF probe per frozenPair model (makeBatchedOofProbe) and call probe.prepare(...)
//     for EACH probe BEFORE the consensus loop (an UNPREPARED packet fail-closes to DROP, which would
//     drop all 24 items -> N<24 -> diagnostic-only for the WRONG reason). Then OOF-judge each of the 24
//     items via runProbeConsensus over the prepared probes (a SUPPORTED item is RETAINED-as-upheld only
//     if BOTH probes agree entails=true; a REFUTED item if BOTH agree entails=false -- the SAME strict
//     screen as the trap arm). retained === verdict-matches-gold -> map to the verdict enum.
// (3) Compute mcc = mccFromPairs(verdicts, gold), mccLowerCI = bcaBootstrapLowerCI(...), permutationP =
//     labelPermutationTestMccPositive(...).
// (4) decision = decideContrastiveScreen({ guardPasses, mcc, mccLowerCI, permutationP }).
// (5) label = decision === 'gate' ? 'SCREEN-PASS' : 'PROVISIONAL'; provisional = true ALWAYS (offline
//     NEVER WORKS). On 'demote' flag trapOnly + explicitlyIncomplete. If pairs.length < 12 (i.e. fewer
//     than 24 items) -> diagnosticOnly = true (decision can NEVER be 'gate').
//
// The OOF judging maps runProbeConsensus's `retained` (BOTH probes agree entails matches gold) to the
// verdict: a SUPPORTED item retained -> 'unrefuted' (upheld); a REFUTED item retained -> 'refuted'
// (caught). A NON-retained item is the OPPOSITE verdict (the consensus did NOT agree on the gold
// direction). This is the SAME strict makeBatchedOofProbe contract on both arms -- NO asymmetric
// criterion. `score` is passed through to makeBatchedOofProbe for provenance only (it accepts-but-does-
// not-use it).
// ---------------------------------------------------------------------------
export async function runContrastiveScreen({
  pairs,
  callModel,
  frozenPair = FROZEN_PAIR,
  score,
  mccBarPoint = MCC_BAR_POINT,
  mccCiAlpha = MCC_CI_ALPHA,
} = {}) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new ContractError('runContrastiveScreen requires a non-empty pairs array', 'runContrastiveScreen');
  }

  if (typeof callModel !== 'function') {
    throw new ContractError('runContrastiveScreen requires a callModel function', 'runContrastiveScreen');
  }

  // (1) The dual-baseline guard runs FIRST (NO-SPEND). A guard fail forces 'demote' downstream.
  const guard = dualBaselineGuard({ pairs });

  // The 24-item (item, gold) sequence + the packets.
  const items = flattenPairItems(pairs);
  const goldList = items.map((it) => it.gold);
  const packets = items.map((it, i) => itemPacket(it, i));

  // (2) One batched OOF probe per frozen-pair model; PREPARE each before the consensus loop.
  const probes = frozenPair.map((model) => makeBatchedOofProbe({ callModel: (prompt) => callModel(model, prompt), model, score }));

  for (const probe of probes) {
    // The prepare pre-pass dispatches the batched calls + seeds the per-packet resolver map. REQUIRED
    // before runProbeConsensus reads each packet (an unprepared packet fail-closes to DROP).
    // eslint-disable-next-line no-await-in-loop
    await probe.prepare(packets);
  }

  // OOF-judge each item via the SAME strict all-agree consensus as the trap arm.
  const verdicts = [];

  for (let i = 0; i < packets.length; i += 1) {
    const packet = packets[i];
    // eslint-disable-next-line no-await-in-loop
    const consensus = await runProbeConsensus(probes, packet);
    const gold = goldList[i];

    // retained === BOTH probes agreed the entailment matches the gold direction (entails=true for a
    // SUPPORTED item, entails=false for a REFUTED item). A retained SUPPORTED item -> 'unrefuted'
    // (upheld); a retained REFUTED item -> 'refuted' (caught). A non-retained item is the OPPOSITE
    // verdict (the consensus did not agree on the gold direction). SAME strictness on both arms.
    if (consensus.retained) {
      verdicts.push(gold === 'unrefuted' ? 'unrefuted' : 'refuted');
    } else {
      verdicts.push(gold === 'unrefuted' ? 'refuted' : 'unrefuted');
    }
  }

  // (3) Score the verdicts vs gold -> MCC + the one-sided 95% BCa lower-CI + the permutation p.
  const { mcc } = mccFromPairs({ verdicts, gold: goldList });
  const mccLowerCI = bcaBootstrapLowerCI({ verdicts, gold: goldList, alpha: mccCiAlpha, seed: 'contrastive-screen' });
  const { p: permutationP } = labelPermutationTestMccPositive({ verdicts, gold: goldList, seed: 'contrastive-screen' });

  // N-floor: below 24 items the interval is non-informative -> diagnostic-only (NEVER 'gate').
  const diagnosticOnly = items.length < MIN_CONTRASTIVE_ITEMS;

  // (4) The PRE-REGISTERED decision (the recommendation; human-confirmed at the checkpoint).
  let decision = decideContrastiveScreen({
    guardPasses: guard.guardPasses,
    mcc,
    mccLowerCI,
    permutationP,
    mccBarPoint,
  });

  // A diagnostic-only corpus can NEVER 'gate' (the interval is non-informative).
  if (diagnosticOnly) {
    decision = 'demote';
  }

  // (5) The label + the always-provisional flag (offline NEVER WORKS, SDT).
  const label = decision === 'gate' ? 'SCREEN-PASS' : 'PROVISIONAL';
  const provisional = true; // ALWAYS -- the whole offline read is PROVISIONAL-for-WORKS.
  const trapOnly = decision === 'demote';
  const explicitlyIncomplete = decision === 'demote';

  return {
    verdicts,
    mcc,
    mccLowerCI,
    permutationP,
    dualBaselineGuard: guard,
    decision,
    label,
    provisional,
    trapOnly,
    explicitlyIncomplete,
    diagnosticOnly,
  };
}
