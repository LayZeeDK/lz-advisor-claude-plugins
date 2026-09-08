// lz-eval-survival-probe.mjs
//
// NET-NEW (RE-PLAN-9, NO-SPEND build / STUB-exercised): the SURVIVAL-PROBE harness + the PRE-REGISTERED
// build-OR-descope DECISION RULE. The authority is 19-04-REPLAN-DECISION-9.md (the board-converged,
// probe-gated build-OR-descope of the positive-control arm). The decision rule is FIXED HERE before the
// probe runs; the probe outcome (a fact) decides the branch (pre-registration discipline -- the gold
// VOIDed BEFORE any subject vote, so re-pre-registering the control arm is pre-registration-clean).
//
// THE ONLY SUBSTANTIVE RE-PLAN-9 CHANGE is the positive-control source/construction/probe; everything else
// is CARRIED BYTE-IDENTICAL. This harness:
//   - CONSUMES clopperPearsonUpperOneSided + EVAL_THRESHOLDS.TAU_OR + N_CTRL_FLOOR from the FROZEN engine
//     (eval/lz-eval-aggregate.mjs) -- it NEVER edits the engine (N_CTRL_FLOOR=24 stays FROZEN; no floor
//     relaxation -- Path A is DEAD by board consensus);
//   - REUSES the CARRIED batched OOF adapter (eval/lz-eval-oof-batch.mjs makeBatchedOofProbe) + the SAME
//     reused parser slice (eval/.cache/oof-probe/score.mjs, ported byte-faithfully as sliceByIdEntails in
//     eval/lz-eval-oof-batch-parse.mjs) -- it passes the slice in as the adapter's `score` arg, NEVER
//     authoring a second parser;
//   - applies the SAME strict OOF all-agree screen as the trap arm (entails=true required for a control,
//     entails=false for a trap -- symmetric strictness; NO asymmetric criterion -- Path B is DEAD by
//     board consensus).
//
// runSurvivalProbe is NON-GATING for the trap arm: it decides ONLY the control arm's build-vs-descope.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the FROZEN engine + the carried adapter WITHIN the eval tree. zero
// npm deps. STUB-exercised in the unit suite (NO SPEND).
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The FROZEN engine (CONSUMED, never edited): clopperPearsonUpperOneSided + EVAL_THRESHOLDS (TAU_OR +
// N_CTRL_FLOOR). N_CTRL_FLOOR=24 stays FROZEN -- no floor relaxation (Path A DEAD). The decision rule
// CONSUMES these; it NEVER mutates them (eval -> the engine is a one-directional read).
import { clopperPearsonUpperOneSided, EVAL_THRESHOLDS } from './lz-eval-aggregate.mjs';

// The CARRIED RE-PLAN-8 batched OOF adapter (committed 5e048a3) -- REUSED UNCHANGED to screen the new
// control candidates (the SAME strict all-agree screen as the trap arm). makeBatchedOofProbe returns one
// probe per OOF model with the EXISTING runProbeConsensus per-packet contract.
import { makeBatchedOofProbe } from './lz-eval-oof-batch.mjs';

// The CARRIED runProbeConsensus (the ALL-AGREE-RETAIN decider) -- REUSED UNCHANGED. A control is RETAINED
// only if EVERY OOF probe agrees accepted:true AND entails === expectedEntailment ('true' for a control).
import { runProbeConsensus } from './lz-eval-trap-assembler.mjs';

// The SAME reused parser slice the batched OOF adapter uses (the byte-faithful port of
// eval/.cache/oof-probe/score.mjs's fence-strip + first-`[`/last-`]` slice + byId extraction). Passed in
// as the adapter's `score` arg -- NEVER a second parser.
import { sliceByIdEntails } from './lz-eval-oof-batch-parse.mjs';

// ---------------------------------------------------------------------------
// The FROZEN gold-decider pair (the OOF screen identity -- byte-identical; gpt-5.5 + gemini-3.1-pro-preview).
// The survival probe reuses this exact pair as the strict all-agree screen over the control candidates.
// ---------------------------------------------------------------------------
export const FROZEN_PAIR = Object.freeze(['gpt-5.5', 'gemini-3.1-pro-preview']);

// The CI-headroom anchors the decision rule is built on (VERIFIED against the FROZEN engine):
//   CP1s(0,24)=0.1173 <= TAU_OR 0.15  -> the 0-over-refusal clear at the FROZEN 24 floor;
//   CP1s(1,24)=0.1829 >  TAU_OR 0.15  -> a single over-refusal at 24 BREACHES (24 is the 0-OR floor);
//   CP1s(1,30)=0.1486 <= TAU_OR 0.15  -> the ~30 target ABSORBS one over-refusal.
// These are NOT re-derived -- they are computed from the frozen clopperPearsonUpperOneSided.

// ---------------------------------------------------------------------------
// decideControlArm({ retainedCount, covariateMatched, licenseDateUsable, selectionEasy, nCtrlFloor = 24 })
//   -> 'build' | 'descope'.
//
// The PRE-REGISTERED rule (fixed BEFORE the probe runs):
//   CLEARS  -> 'build'   iff retainedCount >= nCtrlFloor (24, FROZEN) AND covariateMatched AND
//                            licenseDateUsable AND NOT selectionEasy.
//   FAILS ANY condition -> 'descope' (defer the over-refusal arm to the Phase-20 LIVE shadow; ship the
//                            offline read TRAP-ONLY + explicitly incomplete; DEMOTE SATURATION-as-WORKS to
//                            PROVISIONAL until the live stage clears TAU_OR).
//
// NO floor relaxation (24 FROZEN; Path A DEAD); NO asymmetric criterion (the SAME strict screen on both
// arms; Path B DEAD); NO auto-lock -- decideControlArm returns the RECOMMENDATION; the T-spend checkpoint
// RAISES it for HUMAN confirmation (the build-vs-descope decision is human-confirmed).
// ---------------------------------------------------------------------------
export function decideControlArm({
  retainedCount,
  covariateMatched,
  licenseDateUsable,
  selectionEasy,
  nCtrlFloor = EVAL_THRESHOLDS.N_CTRL_FLOOR,
} = {}) {
  const clears =
    Number.isFinite(retainedCount) &&
    retainedCount >= nCtrlFloor &&
    covariateMatched === true &&
    licenseDateUsable === true &&
    selectionEasy !== true;

  return clears ? 'build' : 'descope';
}

// ---------------------------------------------------------------------------
// computeCovariateMatch(retainedControls, trapStrata, covariateTolerance): the trap-vs-control
// COVARIATE-MATCH statistic. For each of the control covariate axes present in trapStrata, compare the
// retained controls' per-bin distribution to the trap distribution; the arm is MATCHED when, across every
// shared axis, the per-bin relative-frequency divergence is within covariateTolerance. Returns
// { matched:boolean, perAxis:{axis -> maxBinDivergence} }.
//
// This is a deterministic distribution-overlap check (no model call). A trap-vs-control covariate
// divergence beyond tolerance is a FAIL condition (decideControlArm -> 'descope').
// ---------------------------------------------------------------------------
export function computeCovariateMatch(retainedControls, trapStrata, covariateTolerance = 0.5) {
  const perAxis = {};

  if (trapStrata == null || typeof trapStrata !== 'object') {
    // No trap strata to match against -> treat as matched (the caller supplies trapStrata at run time).
    return { matched: true, perAxis };
  }

  // Build the control per-axis per-bin distribution from the retained controls' covariateBin.
  const ctrlDist = {};

  for (const c of retainedControls || []) {
    const bin = c && c.covariateBin ? c.covariateBin : null;

    if (bin == null) {
      continue;
    }

    for (const axis of Object.keys(bin)) {
      ctrlDist[axis] = ctrlDist[axis] || {};
      const b = bin[axis];
      ctrlDist[axis][b] = (ctrlDist[axis][b] || 0) + 1;
    }
  }

  const ctrlTotal = (retainedControls || []).length || 1;
  let matched = true;

  for (const axis of Object.keys(trapStrata)) {
    const trapBins = trapStrata[axis];

    if (trapBins == null || typeof trapBins !== 'object') {
      continue;
    }

    const trapTotal = Object.values(trapBins).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
    const ctrlBins = ctrlDist[axis] || {};
    const allBins = new Set([...Object.keys(trapBins), ...Object.keys(ctrlBins)]);
    let maxDiv = 0;

    for (const b of allBins) {
      const trapFreq = (Number(trapBins[b]) || 0) / trapTotal;
      const ctrlFreq = (Number(ctrlBins[b]) || 0) / ctrlTotal;
      const div = Math.abs(trapFreq - ctrlFreq);

      if (div > maxDiv) {
        maxDiv = div;
      }
    }

    perAxis[axis] = maxDiv;

    if (maxDiv > covariateTolerance) {
      matched = false;
    }
  }

  return { matched, perAxis };
}

// ---------------------------------------------------------------------------
// runSurvivalProbe({ controlCandidates, trapStrata, callModel, frozenPair = FROZEN_PAIR,
//   covariateTolerance, score = sliceByIdEntails, nCtrlFloor = 24, target = 30 })
//   -> { retained, retainedCount, covariateMatch, licenseDateUsable, selectionEasy, decision, provisional }.
//
// Builds ONE batched OOF probe per frozen-pair model (makeBatchedOofProbe, the SAME strict screen as the
// trap arm), screens the ~50 control candidates (a control is RETAINED only if BOTH frozen-pair probes
// agree entails=true via runProbeConsensus -- NO asymmetric criterion), computes the trap-vs-control
// COVARIATE-MATCH statistic, carries licenseDateUsable (from Task 6's per-source verification) +
// selectionEasy (substring-dominated / construction-flagged from Task 7), calls decideControlArm, and sets
// provisional = (decision === 'descope').
//
// ~50 items / TARGET ~30+ retained for CI headroom; N_CTRL_FLOOR=24 FROZEN; on 'descope' the over-refusal
// arm is DEFERRED to the Phase-20 LIVE shadow, the offline read ships TRAP-ONLY + explicitly incomplete,
// and SATURATION-as-WORKS is DEMOTED to PROVISIONAL until the live stage clears TAU_OR. NON-GATING for the
// trap arm. STUB-exercised (NO SPEND): the unit suite injects deterministic STUB callModels.
// ---------------------------------------------------------------------------
export async function runSurvivalProbe({
  controlCandidates,
  trapStrata,
  callModel,
  frozenPair = FROZEN_PAIR,
  covariateTolerance = 0.5,
  score = sliceByIdEntails,
  nCtrlFloor = EVAL_THRESHOLDS.N_CTRL_FLOOR,
  target = 30,
  licenseDateUsable = true,
  selectionEasy = false,
  seed = 1,
} = {}) {
  if (!Array.isArray(controlCandidates)) {
    throw new ContractErrorLike('runSurvivalProbe requires a controlCandidates array');
  }

  void target; // the ~30+ target is documented CI headroom; the floor (24) is the load-bearing decider.

  // Build one batched OOF probe per frozen-pair model (the SAME strict all-agree screen as the trap arm).
  // makeBatchedOofProbe consumes the SAME reused parser slice via the `score` arg (NEVER a second parser).
  const probes = frozenPair.map((model) =>
    makeBatchedOofProbe({ callModel: (prompt) => callModel(model, prompt), model, seed, score }),
  );

  // PRE-PASS: prepare every probe over the FULL candidate set before the consensus loop (the documented
  // adapter shape -- the per-packet probe reads a pre-computed resolverMap; this avoids flush-boundary
  // deadlock). Each candidate is a packet { trap, enrichedKs }: trap=the control claim, enrichedKs=the
  // strictly-pre-cutoff surviving evidence (the closed-book-mirroring packet).
  const packets = controlCandidates.map((c) => ({
    trap: { uid: c.uid, claim: c.claim, enrichedKs: toSentences(c) },
    enrichedKs: toSentences(c),
    stratum: 'positive-control',
    expectedEntailment: 'true',
  }));

  for (const probe of probes) {
    if (typeof probe.prepare === 'function') {
      // eslint-disable-next-line no-await-in-loop
      await probe.prepare(packets);
    }
  }

  // SCREEN each candidate through the strict all-agree consensus (entails=true required for a control --
  // the SAME strict screen as the trap arm; entails=false for a trap). A control is RETAINED only if ALL
  // frozen-pair probes agree entails=true.
  const retained = [];

  for (let i = 0; i < controlCandidates.length; i += 1) {
    const c = controlCandidates[i];
    const packet = packets[i];
    // eslint-disable-next-line no-await-in-loop
    const consensus = await runProbeConsensus(probes, {
      trap: packet.trap,
      enrichedKs: packet.enrichedKs,
      stratum: 'positive-control',
      decisiveRank: -1,
      expectedEntailment: 'true',
    });

    if (consensus.retained) {
      retained.push(c);
    }
  }

  const retainedCount = retained.length;

  // The trap-vs-control covariate-match statistic (per-stratum distribution overlap within tolerance).
  const covariateMatch = computeCovariateMatch(retained, trapStrata, covariateTolerance);

  // The decision rule (the build-vs-descope branch decided by the probe outcome -- a fact).
  const decision = decideControlArm({
    retainedCount,
    covariateMatched: covariateMatch.matched,
    licenseDateUsable,
    selectionEasy,
    nCtrlFloor,
  });

  return {
    retained,
    retainedCount,
    covariateMatch,
    covariateMatched: covariateMatch.matched,
    licenseDateUsable,
    selectionEasy,
    decision,
    // on 'descope': SATURATION-as-WORKS is DEMOTED to PROVISIONAL (the over-refusal arm is a named Phase-20
    // obligation); on 'build': provisional false.
    provisional: decision === 'descope',
  };
}

// A control candidate's evidence as a sentence array (the closed-book-mirroring enrichedKs the OOF probe
// reads). Accepts the loadControlSource shape { evidence: [{ text }] } or [string].
function toSentences(candidate) {
  const ev = candidate != null && Array.isArray(candidate.evidence) ? candidate.evidence : [];

  return ev
    .map((e) => {
      if (typeof e === 'string') {
        return { sentence: e };
      }

      if (e != null && typeof e === 'object' && typeof e.text === 'string') {
        return { sentence: e.text };
      }

      return { sentence: '' };
    })
    .filter((s) => s.sentence.length > 0);
}

// A minimal local fail-closed error (the harness avoids a cross-tree ContractError import where it only
// needs to fail an argument contract; the named-shape mirrors the eval-tree discipline).
class ContractErrorLike extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContractError';
    this.file = 'run-survival-probe';
  }
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--anchors` it prints the verified
// CI-headroom anchors computed from the FROZEN engine (the values the decision rule + Task 9 record).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const mode = process.argv[2];

  if (mode === '--anchors') {
    const cp1s = (x, n) => clopperPearsonUpperOneSided(x, n, EVAL_THRESHOLDS.ALPHA);
    console.log('N_CTRL_FLOOR=' + EVAL_THRESHOLDS.N_CTRL_FLOOR + ' (FROZEN)');
    console.log('TAU_OR=' + EVAL_THRESHOLDS.TAU_OR);
    console.log('CP1s(0,24)=' + cp1s(0, 24).toFixed(4) + ' <= TAU_OR (clear at the frozen floor)');
    console.log('CP1s(1,24)=' + cp1s(1, 24).toFixed(4) + ' > TAU_OR (a single over-refusal breaches at 24)');
    console.log('CP1s(1,30)=' + cp1s(1, 30).toFixed(4) + ' <= TAU_OR (the 30 target absorbs one)');
    process.exit(0);
  }

  console.error('lz-eval-survival-probe: usage: node lz-eval-survival-probe.mjs --anchors');
  process.exit(2);
}
/* node:coverage enable */
