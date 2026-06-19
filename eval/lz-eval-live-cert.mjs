// lz-eval-live-cert.mjs
//
// NET-NEW (Plan 20-02, Task 2; D-01..D-07, D-19): the LIVE over-refusal + full-WORKS certification
// STAGED ORCHESTRATOR. The authority is 20-CONTEXT.md (D-01..D-07/D-19) + 19-04-REPLAN-DECISION-12.md
// (the LIVE stage is the PRIMARY over-refusal + full-WORKS certifier; the over-refusal CP gate MOVES
// here from the offline read; the frozen primitives carry BYTE-IDENTICAL).
//
// This module OWNS only the staging + the harvest wiring; it COMPOSES the frozen `eval/` certification
// seams. It does NOT re-implement, re-derive, or re-define any frozen primitive:
//   - certifyModel / decisionMatrix / scorePositiveControls / persistVote / STOP_REASONS
//     (eval/lz-eval-offline-read.mjs) -- the ABSOLUTE per-model verdict + the resumable vote store;
//   - clopperPearsonUpperOneSided + EVAL_THRESHOLDS (eval/lz-eval-aggregate.mjs) -- the frozen CP
//     estimator + TAU_FU 0.10 / TAU_OR 0.15 / N_CTRL_FLOOR 24 floors (consumed byte-identical);
//   - makeBatchedOofProbe + runProbeConsensus (eval/lz-eval-oof-batch.mjs + lz-eval-trap-assembler.mjs)
//     -- the OUT-OF-FAMILY all-agree gold adjudicator (gpt-5.5 + gemini-3.1-pro-preview);
//   - the harvest loader (eval/lz-eval-harvest.mjs, Task 1) -- the two-arms control-set loader.
//
// THE TWO ARMS ARE NEVER POOLED (D-03): the over-refusal control arm (nCtrl, target 40 / floor 30) and
// the dense-trap false-uphold MONITOR arm (nTrap, target ~34-40 / floor 30) are frozen as SEPARATE
// counts and passed SEPARATELY to certifyModel (overRefusals/nCtrl is ESTIMAND B; falseUpholds/nTrap is
// ESTIMAND A). N is FROZEN in advance -- NO optional-stopping / add-until-pass.
//
// THE LZ_SPEND HARD-GUARD (D-07 / T-20-05): EVERY model-spend stage THROWS unless
// process.env.LZ_SPEND === '1'. The dry-run path runs STUBS only (no spend); the entire deterministic-
// seam test suite runs with NO spend. The actual spend is the human-authorized BLOCKING checkpoint of
// Plan 20-05; this plan builds the seams + guards and triggers NO live spend.
//
// THE HYBRID ADJUDICATOR (D-04): the frozen OUT-OF-FAMILY all-agree pair is PRIMARY; the solo maintainer
// resolves ONLY the residue (OOF-split / response-set-indeterminate / cheap-vs-unanimous-OOF). Guerdan
// response-set exclusion: a multi-defensible item LEAVES the binary denominator and routes to the human,
// NEVER coerced to a forced binary gold.
//
// STAGING (D-07): Stage 0 (D-19 harvest feasibility probe -- NO spend) -> Stage 1 [HUMAN BLOCK] (freeze
// the gold control set + the dense-trap set + the acceptance rule) -> Stage 2 (dual-run CHEAP+STRONG over
// the FROZEN artifacts in ONE scored pass -> certifyModel CP) -> Stage 3 (unanimous-uphold audit /
// load-bearing census). Settle-OR-raise: decisionMatrix.raiseToUser is ALWAYS true; Sonnet-default ships
// regardless.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the FROZEN engine + the frozen seams WITHIN the eval tree and
// the SHIPPED runtime aggregator's hardening primitives ACROSS trees by relative path -- ONE-DIRECTIONAL
// (eval -> runtime, NEVER runtime -> eval) -- so no eval dependency can ever leak into the marketplace
// package. NEVER add an eval/ import to any plugin-tree file. Zero direct npm deps (the CI math is
// jstat-backed via the frozen engine, never hand-rolled here).
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).
//
// Pure functions are exported for the validation fixture; the thin CLI is guarded so that `import`-ing
// this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// (1) The FROZEN ABSOLUTE per-model seams (CONSUMED byte-identical -- the over-refusal CP gate MOVES here).
import {
  certifyModel,
  decisionMatrix,
  scorePositiveControls,
  persistVote,
  STOP_REASONS,
} from './lz-eval-offline-read.mjs';

// (2) The FROZEN CP estimator + thresholds (imported, NEVER re-derived -- byte-identical).
import { clopperPearsonUpperOneSided, EVAL_THRESHOLDS } from './lz-eval-aggregate.mjs';

// (3) The OUT-OF-FAMILY gold adjudicator (composed unchanged for the live adjudication consensus).
import { makeBatchedOofProbe } from './lz-eval-oof-batch.mjs';
import { runProbeConsensus } from './lz-eval-trap-assembler.mjs';

// (4) The Task-1 two-arms control-set loader (the harvest the orchestrator drives).
import { harvest, HARVEST_TARGETS } from './lz-eval-harvest.mjs';

// (5) Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (eval -> runtime, one-directional).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// STOP_REASONS / scorePositiveControls are part of the composed live arm; referenced where a dual-run
// vote / control score is produced (Stage 2). Kept exported-by-use so a lint pass does not flag the
// import while the model-spend wiring stays behind the LZ_SPEND hard-guard (the dry-run uses stubs).
void STOP_REASONS;
void scorePositiveControls;
void makeBatchedOofProbe;
void runProbeConsensus;

// ---------------------------------------------------------------------------
// The FROZEN OOF gold-decider identity (byte-identical -- gpt-5.5 + gemini-3.1-pro-preview). The live
// adjudication reuses this exact pair as the strict all-agree gold screen over the harvested positives.
// ---------------------------------------------------------------------------
export const FROZEN_OOF_PAIR = Object.freeze(['gpt-5.5', 'gemini-3.1-pro-preview']);

// ---------------------------------------------------------------------------
// The frozen live-arm N targets (D-03): run-config TARGETS above the frozen floor, NOT threshold changes.
// EVAL_THRESHOLDS (TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24) stay byte-identical. The two arms are
// NEVER pooled. These mirror lz-eval-harvest.mjs HARVEST_TARGETS + the live lock rule (prose == config).
// ---------------------------------------------------------------------------
export const LIVE_N_TARGETS = Object.freeze({
  N_CTRL_TARGET: HARVEST_TARGETS.N_CTRL_TARGET, // 40
  N_CTRL_FLOOR: HARVEST_TARGETS.N_CTRL_FLOOR, // 30
  N_TRAP_TARGET: HARVEST_TARGETS.N_TRAP_TARGET, // 40
  N_TRAP_FLOOR: HARVEST_TARGETS.N_TRAP_FLOOR, // 30
});

// ---------------------------------------------------------------------------
// requireSpend(stageLabel): the LZ_SPEND HARD-GUARD (D-07 / T-20-05). EVERY model-spend stage calls this
// FIRST; it THROWS a ContractError unless process.env.LZ_SPEND === '1'. The dry-run path (and the entire
// deterministic-seam test suite) never sets LZ_SPEND, so it runs stubs only and the guard fires on any
// accidental spend-stage entry. The message names the stage + the LZ_SPEND requirement so a refusal is
// diagnosable.
// ---------------------------------------------------------------------------
export function requireSpend(stageLabel) {
  if (process.env.LZ_SPEND !== '1') {
    throw new ContractError(
      'refusing to spend at ' + String(stageLabel) + ': set LZ_SPEND=1 to authorize the staged blocking spend (Plan 20-05). The dry-run + the test suite run stubs only.',
      'lz-eval-live-cert',
    );
  }

  return true;
}

// ---------------------------------------------------------------------------
// freezeArms({ overRefusalControls, denseTrapMonitor }): the N-FREEZE GUARD (D-03 / D-07, the anti-
// optional-stopping discipline). It validates the two SEPARATE arms BEFORE any scored vote: each must be
// a non-empty array AT-OR-ABOVE its frozen floor (N_CTRL_FLOOR / N_TRAP_FLOOR), and the two arms must be
// DISJOINT (no shared uid -- they are NEVER pooled). Returns a FROZEN { nCtrl, nTrap, ctrlUids, trapUids }
// snapshot -- the frozen N the acceptance rule is committed to BEFORE Stage 2. An arm below its floor
// fails closed (the read lacks power -- Stage 0 / D-19 is the feasibility decision; Stage 1 freeze must
// not proceed below the floor). N is FROZEN here, once, in advance -- never grown after a CP read.
// ---------------------------------------------------------------------------
export function freezeArms({ overRefusalControls, denseTrapMonitor } = {}) {
  if (!Array.isArray(overRefusalControls) || !Array.isArray(denseTrapMonitor)) {
    throw new ContractError('freezeArms requires the two SEPARATE arms (overRefusalControls + denseTrapMonitor arrays)', 'freezeArms');
  }

  const nCtrl = overRefusalControls.length;
  const nTrap = denseTrapMonitor.length;

  if (nCtrl < LIVE_N_TARGETS.N_CTRL_FLOOR) {
    throw new ContractError(
      'freezeArms: the over-refusal control arm is BELOW the frozen floor (nCtrl=' + nCtrl + ' < N_CTRL_FLOOR=' + LIVE_N_TARGETS.N_CTRL_FLOOR + ') -- the read lacks power; do not freeze below the floor (Stage 0/D-19 is the feasibility decision)',
      'freezeArms',
    );
  }

  if (nTrap < LIVE_N_TARGETS.N_TRAP_FLOOR) {
    throw new ContractError(
      'freezeArms: the dense-trap monitor arm is BELOW the frozen floor (nTrap=' + nTrap + ' < N_TRAP_FLOOR=' + LIVE_N_TARGETS.N_TRAP_FLOOR + ') -- the read lacks power; do not freeze below the floor',
      'freezeArms',
    );
  }

  // DISJOINT: the two arms are NEVER pooled -- no member uid may appear in both (a shared member would
  // double-count one claim across the two estimands).
  const ctrlUids = new Set(overRefusalControls.map((r) => r.uid));
  const trapUids = new Set(denseTrapMonitor.map((r) => r.uid));

  for (const uid of trapUids) {
    if (ctrlUids.has(uid)) {
      throw new ContractError('freezeArms: the two arms share a member uid (' + uid + ') -- the arms are NEVER pooled; a shared member double-counts a claim', 'freezeArms');
    }
  }

  // The frozen snapshot the acceptance rule binds to BEFORE Stage 2. Object.freeze so it cannot grow.
  return Object.freeze({
    nCtrl,
    nTrap,
    ctrlUids: Object.freeze([...ctrlUids]),
    trapUids: Object.freeze([...trapUids]),
    frozenAt: 'stage-1',
  });
}

// ---------------------------------------------------------------------------
// composeVerdict({ model, falseUpholds, nTrap, overRefusals, nCtrl, traceAudit, difficultyFloorMet,
//   covariateOverlapMet, evidenceAbsentStratumMet }): COMPOSE the frozen certifyModel for ONE model over
// the TWO SEPARATE arms. ESTIMAND A (false-uphold) reads the dense-trap monitor arm (falseUpholds/nTrap);
// ESTIMAND B (over-refusal -- the gate MOVED here) reads the harvested SUPPORTED control arm
// (overRefusals/nCtrl). The two arms are passed SEPARATELY -- this function NEVER sums them into one N.
// certifyModel is consumed UNCHANGED (it owns the WORKS verdict, the floors, the one-sided CP). This is a
// thin compose wrapper so the orchestrator + the test exercise the seam without re-deriving anything.
// ---------------------------------------------------------------------------
export function composeVerdict(args = {}) {
  // The frozen seam owns ALL the gate logic; we only forward the two SEPARATE arms + the floors.
  return certifyModel({
    model: args.model,
    falseUpholds: args.falseUpholds,
    nTrap: args.nTrap,
    overRefusals: args.overRefusals,
    nCtrl: args.nCtrl,
    traceAudit: args.traceAudit,
    difficultyFloorMet: args.difficultyFloorMet,
    covariateOverlapMet: args.covariateOverlapMet,
    evidenceAbsentStratumMet: args.evidenceAbsentStratumMet,
  });
}

// ---------------------------------------------------------------------------
// composeDecision({ haiku, sonnet, opus }): COMPOSE the frozen decisionMatrix over the three per-model
// verdicts (each a composeVerdict result). raiseToUser is ALWAYS true (settle-OR-raise; the Haiku flip is
// DEFERRED -- D-06). The orchestrator surfaces this verdict + the distribution-scope caveat in the report.
// ---------------------------------------------------------------------------
export function composeDecision({ haiku, sonnet, opus } = {}) {
  return decisionMatrix({ haiku, sonnet, opus });
}

// ---------------------------------------------------------------------------
// classifyAdjudicationResidue({ oofProbes, cheapVerdict }): the D-04 HYBRID adjudicator residue router.
// Given the per-OOF-model entails verdicts (oofProbes: { 'gpt-5.5': boolean|null, 'gemini-...': ... }) and
// the CHEAP voter's verdict on the same item, decide whether the OOF pair is the gold (all-agree, PRIMARY)
// or the item is RESIDUE routed to the solo maintainer. Residue (Guerdan response-set exclusion -- the
// item LEAVES the binary denominator, NEVER coerced):
//   - 'oof-split'                 -- the OOF pair disagrees (or a probe abstained/null) -> maintainer;
//   - 'response-set-indeterminate'-- the OOF pair returns a non-boolean (multi-defensible) -> maintainer;
//   - 'cheap-vs-unanimous-oof'    -- the OOF pair unanimously agrees but CHEAP contradicts it -> maintainer
//                                    (a unanimous-OOF-vs-cheap conflict the human resolves).
// Returns { gold: 'oof'|'human', residueReason, oofConsensus: boolean|null }. When gold==='oof' the
// oofConsensus is the all-agree boolean; when gold==='human' it is null (the item leaves the binary
// denominator). This is a PURE classifier over already-collected verdicts -- NO spend (the OOF + cheap
// votes are collected at Stage 2 behind the LZ_SPEND guard; this routes them).
// ---------------------------------------------------------------------------
export function classifyAdjudicationResidue({ oofProbes, cheapVerdict } = {}) {
  if (oofProbes == null || typeof oofProbes !== 'object') {
    throw new ContractError('classifyAdjudicationResidue requires an oofProbes map (per OOF model)', 'classifyAdjudicationResidue');
  }

  const verdicts = FROZEN_OOF_PAIR.map((m) => oofProbes[m]);

  // response-set-indeterminate: any OOF probe returned a non-boolean, non-null (multi-defensible) value.
  for (const v of verdicts) {
    if (v != null && typeof v !== 'boolean') {
      return Object.freeze({ gold: 'human', residueReason: 'response-set-indeterminate', oofConsensus: null });
    }
  }

  // oof-split: a probe abstained (null) OR the pair disagrees -> route to the maintainer.
  if (verdicts.some((v) => v == null) || verdicts[0] !== verdicts[1]) {
    return Object.freeze({ gold: 'human', residueReason: 'oof-split', oofConsensus: null });
  }

  // The OOF pair unanimously agrees -> it is the PRIMARY gold... unless CHEAP contradicts it.
  const oofConsensus = verdicts[0];

  if (typeof cheapVerdict === 'boolean' && cheapVerdict !== oofConsensus) {
    return Object.freeze({ gold: 'human', residueReason: 'cheap-vs-unanimous-oof', oofConsensus: null });
  }

  // All-agree OOF (and no cheap conflict) -> the OOF pair is the gold (PRIMARY adjudicator, D-04).
  return Object.freeze({ gold: 'oof', residueReason: null, oofConsensus });
}

// ===========================================================================
// The STAGED orchestrator (D-07). Each model-spend stage is hard-guarded by requireSpend(); the dry-run
// runs stubs only. The stages are exported as discrete entrypoints so the test exercises the deterministic
// seams (Stage 0 selection, the N-freeze guard, the certifyModel composition, the LZ_SPEND hard-guard)
// with STUBS, no spend.
// ===========================================================================

// ---------------------------------------------------------------------------
// stage0FeasibilityProbe({ corpusDir, runDirs }): the D-19 harvest feasibility probe -- NO SPEND. Drives
// the Task-1 harvest over the curated corpus and decides whether the shipping skill emitted enough
// difficulty-representative SUPPORTED claims to construct BOTH arms at-or-above the frozen floor. Returns
// the harvest result + a feasible flag (both arms at-or-above floor). If NOT feasible -> the over-refusal
// arm is not constructible at the target N -> CHEAP is not certifiable -> keep STRONG, RAISE to the user
// (settle-OR-raise; Sonnet-default ships regardless). This is on-disk only -- no model spend, no guard.
// ---------------------------------------------------------------------------
export function stage0FeasibilityProbe({ corpusDir, runDirs } = {}) {
  const h = harvest({ corpusDir, runDirs });

  const feasible = !h.belowCtrlFloor && !h.belowTrapFloor;

  return Object.freeze({
    feasible,
    harvest: h,
    raiseToUser: !feasible,
    shipsSonnetDefault: true,
    reason: feasible
      ? 'both arms reach the frozen floor -- proceed to Stage 1 [HUMAN BLOCK] freeze'
      : 'an arm is below the frozen floor (the difficulty-matched dense-evidence positives are not constructible at the target N) -> CHEAP is not certifiable; keep STRONG indefinitely, RAISE to the user. Sonnet-default ships regardless (D-19).',
  });
}

// ---------------------------------------------------------------------------
// stage1FreezeGold({ harvestResult }): Stage 1 [HUMAN BLOCK] -- freeze the gold control set + the dense-
// trap set + the acceptance rule BEFORE any CHEAP scored vote. It calls the N-freeze guard (freezeArms)
// over the harvested two arms and returns the FROZEN snapshot + the acceptance rule (the 0.15/0.10
// ceilings + the CP estimator name, byte-identical to EVAL_THRESHOLDS -- NOT new numbers). This is the
// pre-registration boundary: after this, N is frozen and the acceptance rule is committed; NO optional
// stopping. This step is NON-SPEND (it freezes already-harvested artifacts); the model spend is Stage 2.
// ---------------------------------------------------------------------------
export function stage1FreezeGold({ harvestResult } = {}) {
  if (harvestResult == null || typeof harvestResult !== 'object') {
    throw new ContractError('stage1FreezeGold requires the Stage-0 harvest result', 'stage1FreezeGold');
  }

  const frozen = freezeArms({
    overRefusalControls: harvestResult.overRefusalControls,
    denseTrapMonitor: harvestResult.denseTrapMonitor,
  });

  // The acceptance rule -- the FROZEN TAU references byte-identical (NOT new thresholds; D-03). The CP
  // estimator is the frozen one-sided form. The two arms are NEVER pooled (separate estimands).
  const acceptanceRule = Object.freeze({
    estimator: 'clopperPearsonUpperOneSided',
    TAU_FU: EVAL_THRESHOLDS.TAU_FU, // 0.10 -- the dense-trap false-uphold gate (ESTIMAND A)
    TAU_OR: EVAL_THRESHOLDS.TAU_OR, // 0.15 -- the over-refusal gate (ESTIMAND B, MOVED to the live arm)
    N_CTRL_FLOOR: EVAL_THRESHOLDS.N_CTRL_FLOOR, // 24 -- byte-identical frozen floor
    worksRule: 'WORKS = ESTIMAND A (CP1s false-uphold <= TAU_FU) AND ESTIMAND B (CP1s over-refusal <= TAU_OR) with the N floors met; the two arms are NEVER pooled',
    optionalStopping: 'forbidden -- N is frozen here, in advance; never grown after a CP read',
  });

  return Object.freeze({ frozen, acceptanceRule });
}

// ---------------------------------------------------------------------------
// stage2DualRun({ frozen, callVoter, callOof }): Stage 2 -- the dual-run CHEAP + STRONG over the FROZEN
// artifacts in ONE scored pass, computing the per-model verdict via the frozen certifyModel. This is a
// MODEL-SPEND stage: it calls requireSpend() FIRST and THROWS unless LZ_SPEND=1. The dry-run never
// reaches the spend (the test asserts the guard throws). callVoter (the CHEAP+STRONG voter transport) +
// callOof (the OOF gold transport) are INJECTED so the real spend wiring lives at the Plan-20-05
// checkpoint, never in this build. NO optional stopping -- the frozen N from Stage 1 is the denominator.
//
// (The full Stage-2 scoring loop -- persistVote per claim with the required search trace, the OOF+human
// hybrid adjudication via classifyAdjudicationResidue, the certifyModel composition over the two frozen
// arms -- is driven by the human-authorized Plan 20-05; this build wires the entrypoint + the hard-guard
// so the deterministic seams are exercisable with stubs and ZERO spend.)
// ---------------------------------------------------------------------------
export function stage2DualRun({ frozen, callVoter, callOof } = {}) {
  // HARD-GUARD FIRST: refuse to spend unless explicitly authorized. The test asserts this throws when
  // LZ_SPEND is unset (the dry-run path).
  requireSpend('stage2DualRun');

  if (frozen == null || typeof frozen !== 'object' || frozen.frozenAt !== 'stage-1') {
    throw new ContractError('stage2DualRun requires the Stage-1 frozen snapshot (freezeArms output)', 'stage2DualRun');
  }

  if (typeof callVoter !== 'function' || typeof callOof !== 'function') {
    throw new ContractError('stage2DualRun requires injected callVoter + callOof transports (the human-gated Plan 20-05 wiring)', 'stage2DualRun');
  }

  // The Plan-20-05 scored pass lands here behind the hard-guard. Surfacing it as a not-yet-wired throw
  // keeps the build NO-SPEND and the seam exercisable; the entrypoint + guard are the deliverable.
  throw new ContractError('stage2DualRun scored pass is the human-authorized Plan 20-05 spend (not wired in this no-spend build)', 'stage2DualRun');
}

// ---------------------------------------------------------------------------
// stage3UnanimousUpholdAudit({ frozen, callAuditor }): Stage 3 -- the unanimous-uphold audit / load-bearing
// census folded in (D-05/D-07). A MODEL-SPEND stage: requireSpend() FIRST. Census on load-bearing /
// high-consequence claims, sample elsewhere -- the only mechanism that catches a unanimous (contested-
// trigger-invisible) false-uphold. Wired as a guarded entrypoint for Plan 20-05; NO spend in this build.
// ---------------------------------------------------------------------------
export function stage3UnanimousUpholdAudit({ frozen, callAuditor } = {}) {
  requireSpend('stage3UnanimousUpholdAudit');

  if (frozen == null || typeof frozen !== 'object' || frozen.frozenAt !== 'stage-1') {
    throw new ContractError('stage3UnanimousUpholdAudit requires the Stage-1 frozen snapshot', 'stage3UnanimousUpholdAudit');
  }

  if (typeof callAuditor !== 'function') {
    throw new ContractError('stage3UnanimousUpholdAudit requires an injected callAuditor transport (the human-gated Plan 20-05 wiring)', 'stage3UnanimousUpholdAudit');
  }

  throw new ContractError('stage3UnanimousUpholdAudit is the human-authorized Plan 20-05 spend (not wired in this no-spend build)', 'stage3UnanimousUpholdAudit');
}

// ---------------------------------------------------------------------------
// persistDualRunVote(voteDir, vote): a thin compose over the frozen persistVote -- the dual-run vote set
// reuses the frozen resumable vote store (skip-already-done) + the REQUIRED per-vote search trace. The
// frozen persistVote owns the validation (verdict in {unrefuted,refuted}; trace { queries, depth,
// stop_reason in STOP_REASONS }). This wrapper is NON-SPEND (it writes an already-cast vote to disk);
// exposed so the test exercises the trace-required + skip-already-done discipline over the live vote set.
// ---------------------------------------------------------------------------
export function persistDualRunVote(voteDir, vote, opts = {}) {
  return persistVote(voteDir, vote, opts);
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--stage0 <corpus-dir>` it runs the
// D-19 feasibility probe (NO SPEND) over a curated corpus on disk and prints the feasibility verdict;
// exits 0 (feasible / not feasible are both clean completions -- settle-OR-raise) or 2 on a ContractError.
// The model-spend stages (Stage 2/3) are NEVER run from this CLI -- they are the human-authorized blocking
// checkpoint of Plan 20-05, hard-guarded behind LZ_SPEND=1.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const mode = process.argv[2];

    if (mode === '--stage0') {
      const corpusDir = process.argv[3];

      if (!corpusDir || !fs.existsSync(corpusDir) || !fs.statSync(corpusDir).isDirectory()) {
        console.error('lz-eval-live-cert: missing or invalid <corpus-dir>');
        process.exit(2);
      }

      const res = stage0FeasibilityProbe({ corpusDir });
      console.log(JSON.stringify({ feasible: res.feasible, reason: res.reason, nCtrl: res.harvest.nCtrl, nTrap: res.harvest.nTrap }, null, 2));
      process.exit(0);
    }

    console.error('lz-eval-live-cert: usage: node lz-eval-live-cert.mjs --stage0 <corpus-dir> (the spend stages are the human-gated Plan 20-05; LZ_SPEND=1)');
    process.exit(2);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-live-cert: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
