// lz-eval-offline-read.mjs
//
// The OFFLINE known-gold Haiku-vs-Sonnet gating-read DECISION DRIVER (Plan 19-04, Task 1; EVAL-01 /
// EVAL-02 / EVAL-04). This module is the DETERMINISTIC seam around the model votes: it owns the D-06
// Sonnet-as-calibrator gate, the Haiku-MINUS-Sonnet pooled DELTA read, the Pass@1 / Pass^k /
// per-stratum false-uphold reporting, the VOID / PASS / FAIL-RAISE outcome resolver, and the
// resumable filesystem vote persistence (skip-already-done, D-08) + per-vote search trace (D-10).
//
// It does NOT itself spawn subagents. The model VOTES come from the D-08 dynamic Workflow over the
// nested voter subagents (Sonnet calibrator first, then the Haiku variant); that Workflow writes each
// vote (verdict + search trace) into the gitignored eval/.cache/ via persistVote() below, and this
// module reads those vote files back and computes the mechanical decision. The deterministic decision
// logic is the unit-tested seam (lz-eval-offline-read.test.mjs); the model dispatch is the Workflow.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in
// the distributed plugin tree. It imports the FROZEN engine (lz-eval-aggregate.mjs) + the search
// spine (lz-eval-search-loop.mjs) WITHIN the eval tree, and the SHIPPED runtime aggregator's
// hardening primitives ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER
// runtime -> eval) -- so no eval dependency can ever leak into the marketplace package. NEVER add an
// eval/ import to any plugin-tree file. The module is node stdlib + the in-eval engine/spine + the
// runtime hardening primitives; zero direct npm deps (the CI math is jstat-backed via the frozen
// engine, never hand-rolled here).
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); JSON reads go
// through the shared lz-eval-readjson.mjs helper, which strips a BOM at read time.
//
// Pure functions are exported for the validation fixture; the thin CLI is guarded so that `import`-ing
// this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// (1) The FROZEN, OFF-MODEL engine (consumed, NOT rewritten -- Plan 18-03 / re-registered 19-03). The
//     CI math (clopperPearsonUpper, passAtK, passHatK) is jstat-backed INSIDE this engine; the gate
//     verdict (lockRuleVerdict) and the false-uphold counter (countFalseUpholds) / DELTA (delta) are
//     the pre-registered mechanical decision. We NEVER re-derive any of these here.
import {
  countFalseUpholds,
  delta,
  clopperPearsonUpper,
  clopperPearsonUpperOneSided,
  passAtK,
  passHatK,
  lockRuleVerdict,
  EVAL_THRESHOLDS,
} from './lz-eval-aggregate.mjs';

// (2) The Plan-01 search-and-stop spine: the offline read drives searchAndStop bound to the
//     staticKsAdapter (the per-claim date cutoff enforced, NEVER live web -- D-07). Re-exported by use
//     so the Workflow / CLI can compose a vote from the same deterministic core the test samples.
import { searchAndStop, staticKsAdapter, dateFilter } from './lz-eval-search-loop.mjs';

// (3) Cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (D-10; eval ->
//     runtime, one-directional, never the reverse). safeId guards a content-derived vote basename
//     before it can index gold or reach any path; ContractError backs the fail-closed reads. The
//     shared fail-closed JSON read lives in lz-eval-readjson.mjs (F12).
import {
  ContractError,
  safeId,
  listJson,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Shared fail-closed JSON read (Group-B F12 de-dup); re-exported to preserve the prior export surface.
import { readJson } from './lz-eval-readjson.mjs';
export { readJson };

// searchAndStop / staticKsAdapter / dateFilter are part of the deterministic spine the offline read
// composes; referenced where a vote is produced (CLI / Workflow). Kept exported-by-use so a lint pass
// does not flag the spine import while the per-module Workflow wiring lives agent-side.
void searchAndStop;
void staticKsAdapter;
void dateFilter;

// ---------------------------------------------------------------------------
// The search-and-stop trace stop_reason enum (mirrors searchAndStop's three outcomes). persistVote
// validates the recorded stop_reason against this set (D1-10) so a typo'd / unknown reason can never be
// persisted into a vote -- the trace must be diagnosable (genuine parity vs both-stopped-early), which
// requires a KNOWN stop_reason, not merely any string.
// ---------------------------------------------------------------------------
export const STOP_REASONS = Object.freeze(['decisive-evidence', 'exhausted', 'min-not-met']);

// ---------------------------------------------------------------------------
// The D-06 SATURATION pre-condition / Sonnet-as-calibrator gate (the gate ON the gate).
//
// Sonnet runs FIRST as the difficulty calibrator. A stratum DISCRIMINATES only if Sonnet is
// demonstrably BELOW ceiling on it -- i.e. Sonnet catches the traps with a NON-TRIVIAL false-uphold
// count gap (it does NOT ace the stratum). The mechanical reading of "below ceiling" here is: Sonnet
// recorded at least one false-uphold on the stratum (a both-models-ace tie -- Sonnet 0 false-upholds
// -- is the saturation fallacy that voided the Phase-18 supplied-evidence pilots and is NEVER read as
// Haiku-safe).
//
// This is decided BEFORE the frozen engine runs: a 'saturated' calibrator forces VOID (the engine has
// no VOID branch -- lockRuleVerdict returns only PASS / FAIL-RAISE). The recorded CP(1,N) ceiling
// label is computed via the frozen clopperPearsonUpper for the run artifact; the DISCRIMINATION
// DECISION itself is the exact-zero Sonnet-false-uphold check, never a CI-width comparison (the
// Pitfall-3 clustering caveat -- the CP value is a LABEL, never re-derived as a clustered CI).
//
// Returns { status: 'below-ceiling' | 'saturated', sonnetFalseUpholds, trials, ceiling, reason }.
// ---------------------------------------------------------------------------
export function calibratorGate({ sonnetFalseUpholds, trials } = {}) {
  if (!Number.isInteger(sonnetFalseUpholds) || sonnetFalseUpholds < 0) {
    throw new ContractError(
      'calibratorGate requires a non-negative integer sonnetFalseUpholds: ' + JSON.stringify(sonnetFalseUpholds),
      'calibratorGate',
    );
  }

  if (!Number.isInteger(trials) || trials < EVAL_THRESHOLDS.MIN_K) {
    throw new ContractError(
      'calibratorGate requires trials >= MIN_K (' + EVAL_THRESHOLDS.MIN_K + '): ' + JSON.stringify(trials),
      'calibratorGate',
    );
  }

  if (sonnetFalseUpholds > trials) {
    throw new ContractError(
      'calibratorGate: sonnetFalseUpholds (' + sonnetFalseUpholds + ') cannot exceed trials (' + trials + ')',
      'calibratorGate',
    );
  }

  // The recorded CP(1,N) ceiling LABEL for the run artifact (the FORMULA at the realized n, D-05).
  // This value is a LABEL, never re-derived as a clustered CI (Pitfall 3).
  const ceiling = clopperPearsonUpper(1, trials, EVAL_THRESHOLDS.ALPHA);

  // DISCRIMINATION = Sonnet recorded at least one false-uphold (below ceiling). Zero false-upholds is
  // the saturation fallacy (a both-models-ace tie) -> NON-discriminating -> harden + re-calibrate, or
  // VOID if no hardened stratum can put Sonnet below ceiling.
  if (sonnetFalseUpholds >= 1) {
    return Object.freeze({
      status: 'below-ceiling',
      sonnetFalseUpholds,
      trials,
      ceiling,
      reason: 'sonnet-below-ceiling',
    });
  }

  return Object.freeze({
    status: 'saturated',
    sonnetFalseUpholds,
    trials,
    ceiling,
    reason: 'sonnet-aces-stratum (non-discriminating -- harden + re-calibrate, else VOID)',
  });
}

// ---------------------------------------------------------------------------
// scorePositiveControls({ voteDir, positiveControlGold, nControls }) -- the RE-PLAN-5 Finding-1 power
// check. With EVERY retained trap gold=refuted, a 0-false-uphold result is CONFOUNDED -- observationally
// identical to a DEGENERATE ALWAYS-REFUTE prior (a voter that refutes everything on thin evidence scores
// a perfect 0 for the WRONG reason and measures nothing). The interleaved gold=unrefuted POSITIVE CONTROLS
// (native unmutated Supported seeds whose date-filtered survivors GENUINELY ENTAIL the claim) are the
// inverse check: the voter SHOULD vote unrefuted on them. This reads ONLY the 'unrefuted'-gold control
// pooled records (one per control claim) and returns the voter's control accuracy + the
// alwaysRefuteArtifact flag.
//
// W-2 (fail closed in TWO directions, mirroring readDelta's F3/F4 realized-count guard):
//   1) the realized control vote count MUST equal nControls (a partial/stale control dir fails closed);
//   2) EVERY control record's gold (from positiveControlGold[safeId(rec.id)]) MUST be 'unrefuted' -- a
//      'refuted'-gold record in the control voteDir is a refuted-gold trap LEAKED into the control arm
//      (an invariant violation), FAIL CLOSED with a ContractError. The function reads ONLY 'unrefuted'-gold
//      records; a refuted-gold record is never silently scored.
//
// alwaysRefuteArtifact is true when the voter REFUTES the controls beyond the PRE-REGISTERED tolerance:
// the default tolerance is ZERO -- ANY positive-control refute voids the saturation read (a
// hyper-conservative collapsed decision boundary, NOT capability -- the read cannot interpret a clean
// trap rate of 0 if the voter cannot uphold a control). Returns { upheld, refuted, accuracy,
// alwaysRefuteArtifact, nControls }. Every control vote id is routed through safeId before any path
// (CARRIED T-19-TRAVERSE discipline). EVAL_THRESHOLDS is byte-identical (this function does not touch it).
// ---------------------------------------------------------------------------
export function scorePositiveControls({ voteDir, positiveControlGold, nControls } = {}) {
  if (typeof voteDir !== 'string' || voteDir.length === 0) {
    throw new ContractError('scorePositiveControls requires a voteDir (gitignored eval/.cache/)', 'scorePositiveControls');
  }

  if (positiveControlGold == null || typeof positiveControlGold !== 'object') {
    throw new ContractError('scorePositiveControls requires a positiveControlGold map', 'scorePositiveControls');
  }

  if (!Number.isInteger(nControls) || nControls <= 0) {
    throw new ContractError('scorePositiveControls requires a positive integer nControls: ' + JSON.stringify(nControls), 'scorePositiveControls');
  }

  // W-2 part 1: the realized control vote count must equal nControls (a partial/interrupted or stale
  // control dir fails closed -- mirrors readDelta's F3/F4 realized-count guard).
  const files = listJson(voteDir);

  if (files.length !== nControls) {
    throw new ContractError(
      'scorePositiveControls: realized control vote count != nControls (partial/stale control pool): got ' +
        files.length + ' nControls=' + nControls,
      'scorePositiveControls',
    );
  }

  let upheld = 0;
  let refuted = 0;

  for (const f of files) {
    // listJson returns BASENAMES (sorted, *.json-only) -- join the voteDir before reading (mirrors the
    // engine's countFalseUpholds: path.join(voteDir, f) then readJson).
    const votePath = path.join(voteDir, f);
    const rec = readJson(votePath);

    if (rec == null || typeof rec !== 'object') {
      throw new ContractError('scorePositiveControls: malformed control vote record: ' + JSON.stringify(rec), votePath);
    }

    // Route the content-derived id through safeId (T-19-TRAVERSE) BEFORE the gold lookup -- the VALIDATED
    // id is the goldLabels key (mirrors the engine's read-time safeId discipline).
    const id = safeId(String(rec.id), votePath);
    const gold = positiveControlGold[id];

    // W-2 part 2: the control arm is gold-separated from the trap arm. A 'refuted'-gold record in the
    // control voteDir is a refuted-gold trap leaked into the control arm -- an invariant violation, NEVER
    // silently scored. FAIL CLOSED.
    if (gold !== 'unrefuted') {
      throw new ContractError(
        'scorePositiveControls: a non-unrefuted-gold record appeared in the control voteDir (a refuted-gold ' +
          'trap leaked into the control arm -- invariant violation): id=' + JSON.stringify(id) + ' gold=' + JSON.stringify(gold),
        'scorePositiveControls',
      );
    }

    if (rec.verdict === 'unrefuted') {
      // The CORRECT vote on a control (the survivors entail the claim -> uphold).
      upheld += 1;
    } else if (rec.verdict === 'refuted') {
      // A WRONG refute on an unrefuted-gold control.
      refuted += 1;
    } else {
      throw new ContractError(
        'scorePositiveControls: a control record carries a non-{unrefuted,refuted} verdict: id=' +
          JSON.stringify(id) + ' verdict=' + JSON.stringify(rec.verdict),
        'scorePositiveControls',
      );
    }
  }

  const accuracy = upheld / nControls;
  // The PRE-REGISTERED tolerance is ZERO: ANY control refute voids the saturation read (always-refute
  // artifact). This is a hyper-conservative collapsed decision boundary, NOT capability -- the read
  // cannot prove the voter CAN uphold when warranted if it refutes even one control.
  const alwaysRefuteArtifact = refuted >= 1;

  return Object.freeze({ upheld, refuted, accuracy, alwaysRefuteArtifact, nControls });
}

// ---------------------------------------------------------------------------
// classifyCalibration({ sonnetFalseUpholds, trials, positiveControl, traceAudit }) -- the RE-PLAN-5
// Finding-3 pre-registered NON-ZERO decision rule. The frozen engine returns only saturated-vs-below-ceiling
// and does NOT fix what "1 false-uphold over N" MEANS; without a written rule a single uphold could be
// relabeled post hoc. classifyCalibration WRAPS calibratorGate (consumed BYTE-IDENTICAL) and LAYERS the
// pre-registered rule, returning ONE of FOUR terminal labels:
//   - 'SATURATED-VOID': 0 false-upholds + positive-controls UPHELD (not always-refute) + clean traces. A
//     LEGITIMATE evidence-justified VOID (Sonnet aces resist-uphold-on-absence AND can uphold when
//     warranted).
//   - 'ALWAYS-REFUTE-ARTIFACT-VOID': positive-controls REFUTED (alwaysRefuteArtifact=true) -- decided
//     FIRST, regardless of the trap rate. The saturation read is uninterpretable, NOT a clean saturation.
//   - 'BELOW-CEILING-PROCEED': >= 1 false-uphold on a CLEAN min-met trace + positive-controls upheld -- a
//     GENUINE below-ceiling signal -> PROCEED to 19-05.
//   - 'ARTIFACT-VOID-REDO': >= 1 false-uphold but an upheld claim's trace is min-not-met / truncated /
//     quota-killed -- a false-uphold on a bad trace is an artifact, not resistance; void/redo that vote,
//     NEVER a below-ceiling PROCEED.
//
// W-3: anyUpholdOnMinNotMet is DERIVED MECHANICALLY here from the supplied upheld pooled records' traces
// (stop_reason === 'min-not-met'), NOT taken as a human-supplied boolean. ONLY
// anyUpholdOnTruncatedOrQuotaKilled stays a caller-supplied inspection flag (truncation/quota-kill is an
// out-of-band run condition not recoverable from the persisted trace stop_reason enum). So traceAudit is
// { upheldRecords: [pooledRecord...], anyUpholdOnTruncatedOrQuotaKilled: boolean }.
//
// calibratorGate is consumed UNCHANGED (classifyCalibration calls it with { sonnetFalseUpholds, trials }).
// Fails closed on a missing positiveControl (the read is confounded without it -- the WHOLE POINT of
// Finding 1), a missing traceAudit (a below-ceiling read is unaudited), or an upheldRecords whose count
// != sonnetFalseUpholds (the audited set must match the false-uphold count). Returns
// { label, calibration, reason, anyUpholdOnMinNotMet }.
// ---------------------------------------------------------------------------
export function classifyCalibration({ sonnetFalseUpholds, trials, positiveControl, traceAudit } = {}) {
  if (positiveControl == null || typeof positiveControl !== 'object' || typeof positiveControl.alwaysRefuteArtifact !== 'boolean') {
    throw new ContractError(
      'classifyCalibration requires a positiveControl (scorePositiveControls output) -- the read is CONFOUNDED without it (Finding 1)',
      'classifyCalibration',
    );
  }

  if (traceAudit == null || typeof traceAudit !== 'object' || !Array.isArray(traceAudit.upheldRecords) ||
    typeof traceAudit.anyUpholdOnTruncatedOrQuotaKilled !== 'boolean') {
    throw new ContractError(
      'classifyCalibration requires a traceAudit { upheldRecords:[pooledRecord...], anyUpholdOnTruncatedOrQuotaKilled:boolean }',
      'classifyCalibration',
    );
  }

  // calibratorGate consumed BYTE-IDENTICAL (it validates sonnetFalseUpholds + trials + the MIN_K floor).
  const calibration = calibratorGate({ sonnetFalseUpholds, trials });

  // The audited upheld set MUST match the false-uphold count (every false-uphold pooled record is audited).
  if (traceAudit.upheldRecords.length !== sonnetFalseUpholds) {
    throw new ContractError(
      'classifyCalibration: traceAudit.upheldRecords count (' + traceAudit.upheldRecords.length +
        ') must equal sonnetFalseUpholds (' + sonnetFalseUpholds + ') -- the audited set must match the false-uphold count',
      'classifyCalibration',
    );
  }

  // W-3: DERIVE anyUpholdOnMinNotMet MECHANICALLY from the upheld pooled records' traces (NOT a passed
  // boolean). An uphold cast on a min-not-met trace is an artifact, not resistance below ceiling.
  const anyUpholdOnMinNotMet = traceAudit.upheldRecords.some(
    (r) => r != null && r.trace != null && r.trace.stop_reason === 'min-not-met',
  );

  // (1) A control collapse voids the read FIRST -- regardless of the trap rate (Finding 1: a degenerate
  // always-refute prior would also score 0 false-upholds; the controls are the only de-confounder).
  if (positiveControl.alwaysRefuteArtifact === true) {
    return Object.freeze({
      label: 'ALWAYS-REFUTE-ARTIFACT-VOID',
      calibration,
      anyUpholdOnMinNotMet,
      reason: 'the voter REFUTED the positive controls -> always-refute artifact -> VOID/uninterpretable (Finding 1), NOT a clean saturation',
    });
  }

  // (2) >= 1 false-uphold on a BAD trace (min-not-met derived, or truncated/quota-killed inspection) is an
  // ARTIFACT, not resistance below ceiling -- void/redo that vote, NEVER a PROCEED.
  if (sonnetFalseUpholds >= 1 && (anyUpholdOnMinNotMet || traceAudit.anyUpholdOnTruncatedOrQuotaKilled)) {
    return Object.freeze({
      label: 'ARTIFACT-VOID-REDO',
      calibration,
      anyUpholdOnMinNotMet,
      reason: 'a false-uphold landed on a min-not-met / truncated / quota-killed trace -> ARTIFACT (void/redo that vote), never a below-ceiling PROCEED (Finding 3 (ii))',
    });
  }

  // (3) >= 1 GENUINE false-uphold (clean min-met trace + controls upheld) -> a below-ceiling PROCEED.
  if (sonnetFalseUpholds >= 1) {
    return Object.freeze({
      label: 'BELOW-CEILING-PROCEED',
      calibration,
      anyUpholdOnMinNotMet,
      reason: 'a GENUINE below-ceiling false-uphold on a clean min-met probe-consensus-retained trace + positive-controls upheld -> PROCEED to 19-05',
    });
  }

  // (4) 0 false-upholds + positive-controls UPHELD on clean traces -> a LEGITIMATE evidence-justified
  // SATURATED-VOID (the gate CAN register a non-zero AND the voter CAN uphold when warranted).
  //
  // RE-PLAN-7 NOTE: this SATURATED-VOID label is the CARRIED RE-PLAN-5 RELATIVE-read framing, kept for
  // back-compat ONLY. It is NO LONGER the decision path: the RE-PLAN-7 ABSOLUTE per-model path
  // (certifyModel below) reads the SAME clean earned 0 -- on a difficulty-floor-met, covariate-matched
  // set with the controls upheld + the CI tight -- as WORKS (the PIVOT). A clean EARNED 0 is PROOF the
  // model works, NOT a VOID.
  return Object.freeze({
    label: 'SATURATED-VOID',
    calibration,
    anyUpholdOnMinNotMet,
    reason: '0 false-upholds + positive-controls upheld on clean traces -> LEGITIMATE evidence-justified saturation -> VOID (a closed-book PASS never flips Haiku ON)',
  });
}

// ---------------------------------------------------------------------------
// certifyModel({ model, falseUpholds, nTrap, overRefusals, nCtrl, traceAudit, difficultyFloorMet,
//   covariateOverlapMet, evidenceAbsentStratumMet }) -- the RE-PLAN-7 ABSOLUTE PER-MODEL verdict (THE
// PIVOT). The relative Haiku-MINUS-Sonnet delta + the SATURATED-VOID framing are SUPERSEDED: this
// proves, for a SINGLE model M in voter role, WHETHER it WORKS as the lz-deep-research verify-voter.
// Sonnet is a SUBJECT on trial, NOT the yardstick.
//
// TWO estimands, pooled PER-CLAIM (denominator N_claims, NEVER N*k -- the k=9 votes share one packet,
// positively correlated; the per-claim pooling happens upstream via reducePooledVerdict):
//   - ESTIMAND A -- FALSE-UPHOLD rate over the retained refuted-gold traps; statistic =
//     clopperPearsonUpperOneSided(falseUpholds, nTrap) (the F2-pinned ONE-SIDED 95% upper); PASS_A iff
//     CP1s <= TAU_FU (0.10). The catastrophic arm: silently shipped bad research.
//   - ESTIMAND B -- OVER-REFUSAL rate over the gold=unrefuted positive controls (the F1 always-refute
//     detector, REUSING scorePositiveControls' over-refusal count); CP1s(overRefusals, nCtrl); PASS_B
//     iff CP1s <= TAU_OR (0.15).
//
// THE PIVOT (SATURATION-as-PASS): a clean EARNED 0 certifies WORKS only when ALL THREE hold JOINTLY:
//   (a) the difficulty floor is met (the set is hard+representative -- including the F5 subject-specific
//       Claude held-out check + the covariate-overlap check; difficultyFloorMet AND covariateOverlapMet),
//   (b) the CI upper bound is tight (CP1s <= TAU at the realized N -- both estimands pass),
//   (c) the positive-control arm passes (the 0 is EARNED, not an always-refuse artifact -- PASS_B).
//
// VERDICT(M):
//   - 'VOID-on-power'    : nTrap < N_TRAP_FLOOR OR nCtrl < N_CTRL_FLOOR OR evidenceAbsentStratumMet false
//                          (the read lacks power; certifyModel is the AUTHORITATIVE power gate, W3 --
//                          the 36/24 adequacy floor, distinct from the assembler's build-floor of 3).
//   - 'VOID-difficulty'  : difficultyFloorMet === false (the F5 Claude held-out reference aced the set).
//   - 'VOID-covariate'   : covariateOverlapMet === false (the F5 trap/control distributions diverge).
//   - 'VOID-artifact'    : an always-refute control collapse (PASS_B fails AND every control refuted) OR
//                          an uphold on a min-not-met / truncated / quota-killed trace (the W-3 derived
//                          min-not-met OR the caller-supplied truncated/quota-killed flag).
//   - 'WORKS'            : PASS_A AND PASS_B (with the floors met).
//   - 'DOES-NOT-WORK'    : otherwise (a CI exceeds its TAU).
//
// W-3: anyUpholdOnMinNotMet is DERIVED MECHANICALLY from traceAudit.upheldRecords' trace stop_reason
// (NOT a passed boolean -- the carried derivation from classifyCalibration); only
// anyUpholdOnTruncatedOrQuotaKilled stays caller-supplied. certifyModel consumes the FROZEN engine
// (clopperPearsonUpperOneSided + the 2 TAU + N floors) UNCHANGED; it edits no engine number. Returns
// { verdict, estimandA:{cpUpper, pass}, estimandB:{cpUpper, pass}, anyUpholdOnMinNotMet, reason }.
// ---------------------------------------------------------------------------
export function certifyModel({
  model,
  falseUpholds,
  nTrap,
  overRefusals,
  nCtrl,
  traceAudit,
  difficultyFloorMet,
  covariateOverlapMet,
  evidenceAbsentStratumMet,
} = {}) {
  if (typeof model !== 'string' || model.length === 0) {
    throw new ContractError('certifyModel requires a non-empty model string', 'certifyModel');
  }

  for (const [name, v] of [['falseUpholds', falseUpholds], ['nTrap', nTrap], ['overRefusals', overRefusals], ['nCtrl', nCtrl]]) {
    if (!Number.isInteger(v) || v < 0) {
      throw new ContractError('certifyModel requires a non-negative integer ' + name + ': ' + JSON.stringify(v), 'certifyModel');
    }
  }

  if (falseUpholds > nTrap) {
    throw new ContractError('certifyModel: falseUpholds (' + falseUpholds + ') cannot exceed nTrap (' + nTrap + ')', 'certifyModel');
  }

  if (overRefusals > nCtrl) {
    throw new ContractError('certifyModel: overRefusals (' + overRefusals + ') cannot exceed nCtrl (' + nCtrl + ')', 'certifyModel');
  }

  // The F5/F7 floor flags are REQUIRED booleans -- the read is CONFOUNDED without them (mirroring
  // classifyCalibration's confounded-without-positiveControl guard). A missing flag fails closed.
  for (const [name, v] of [['difficultyFloorMet', difficultyFloorMet], ['covariateOverlapMet', covariateOverlapMet], ['evidenceAbsentStratumMet', evidenceAbsentStratumMet]]) {
    if (typeof v !== 'boolean') {
      throw new ContractError('certifyModel requires a boolean ' + name + ' (the read is confounded without the F5/F7 floors): ' + JSON.stringify(v), 'certifyModel');
    }
  }

  if (traceAudit == null || typeof traceAudit !== 'object' || !Array.isArray(traceAudit.upheldRecords) ||
    typeof traceAudit.anyUpholdOnTruncatedOrQuotaKilled !== 'boolean') {
    throw new ContractError(
      'certifyModel requires a traceAudit { upheldRecords:[pooledRecord...], anyUpholdOnTruncatedOrQuotaKilled:boolean }',
      'certifyModel',
    );
  }

  // The audited upheld set MUST match the false-uphold count (every false-uphold pooled record is audited
  // -- mirrors classifyCalibration). Without this an uphold's bad trace could be hidden from the W-3 scan.
  if (traceAudit.upheldRecords.length !== falseUpholds) {
    throw new ContractError(
      'certifyModel: traceAudit.upheldRecords count (' + traceAudit.upheldRecords.length +
        ') must equal falseUpholds (' + falseUpholds + ') -- the audited set must match the false-uphold count',
      'certifyModel',
    );
  }

  // W-3: DERIVE anyUpholdOnMinNotMet MECHANICALLY from the upheld pooled records' traces (carried from
  // classifyCalibration). An uphold cast on a min-not-met trace is an artifact, not capability.
  const anyUpholdOnMinNotMet = traceAudit.upheldRecords.some(
    (r) => r != null && r.trace != null && r.trace.stop_reason === 'min-not-met',
  );

  // The two estimands via the FROZEN engine's ONE-SIDED CP (F2). Computed up front so the WORKS reason
  // can cite them; the VOID gates below short-circuit before reading them as a verdict.
  const estimandA = Object.freeze({
    cpUpper: clopperPearsonUpperOneSided(falseUpholds, nTrap),
    pass: clopperPearsonUpperOneSided(falseUpholds, nTrap) <= EVAL_THRESHOLDS.TAU_FU,
  });
  const estimandB = Object.freeze({
    cpUpper: clopperPearsonUpperOneSided(overRefusals, nCtrl),
    pass: clopperPearsonUpperOneSided(overRefusals, nCtrl) <= EVAL_THRESHOLDS.TAU_OR,
  });

  // The control arm is an always-refute artifact when EVERY control was refuted (overRefusals === nCtrl)
  // -- a degenerate always-refute prior, mirroring scorePositiveControls' alwaysRefuteArtifact (tolerance
  // ZERO collapses to this only at a full sweep; PASS_B already catches lesser over-refusal as a CI miss).
  const alwaysRefuteArtifact = nCtrl > 0 && overRefusals === nCtrl;

  const out = (verdict, reason) => Object.freeze({ verdict, estimandA, estimandB, anyUpholdOnMinNotMet, reason });

  // --- The PRE-REGISTERED verdict order (never tuned) ---

  // (1) VOID-on-power FIRST: the read lacks power below a load-bearing floor (W3 -- certifyModel is the
  // AUTHORITATIVE power gate; the 36/24 adequacy floor is distinct from the assembler build-floor of 3).
  if (nTrap < EVAL_THRESHOLDS.N_TRAP_FLOOR || nCtrl < EVAL_THRESHOLDS.N_CTRL_FLOOR) {
    return out('VOID-on-power', 'below the adequacy floor (N_TRAP_FLOOR=' + EVAL_THRESHOLDS.N_TRAP_FLOOR + ' / N_CTRL_FLOOR=' + EVAL_THRESHOLDS.N_CTRL_FLOOR + ') -- the one-sided CP cannot bind (the authoritative power gate, W3); never tuned');
  }

  // (1b) F7: an unmet evidence-absent stratum floor is VOID-on-power SCOPED to evidence-absent -- NOT a
  // silent WORKS over a sub-construct WiCE cannot supply (do not launder WiCE power into evidence-absent).
  if (evidenceAbsentStratumMet === false) {
    return out('VOID-on-power', 'the evidence-absent stratum floor is unmet (F7) -> VOID-on-power scoped to evidence-absent -- never a silent WORKS over a sub-construct WiCE cannot supply');
  }

  // (2) The F5 floors: difficulty (the Claude held-out reference must NOT ace the set) + covariate overlap
  // (the trap/control distributions must overlap -- no STYLE bypass).
  if (difficultyFloorMet === false) {
    return out('VOID-difficulty', 'the F5 subject-specific difficulty floor is unmet (the Claude held-out reference aced the retained set -> too easy to certify capability)');
  }

  if (covariateOverlapMet === false) {
    return out('VOID-covariate', 'the F5 trap/control covariate distributions diverge beyond tolerance -> a model could pass by STYLE not judgment');
  }

  // (3) VOID-artifact: an always-refute control collapse (PASS_B fails AND the control arm is an
  // always-refute artifact) OR an uphold on a bad trace (min-not-met derived, or truncated/quota-killed).
  if (alwaysRefuteArtifact && !estimandB.pass) {
    return out('VOID-artifact', 'the control arm collapsed to an always-refute artifact (every control refuted, PASS_B fails) -- not capability; the WHOLE POINT of F1');
  }

  if (falseUpholds >= 1 && (anyUpholdOnMinNotMet || traceAudit.anyUpholdOnTruncatedOrQuotaKilled)) {
    return out('VOID-artifact', 'a false-uphold landed on a min-not-met / truncated / quota-killed trace -> ARTIFACT (not capability), never a WORKS (W-3 mechanical min-not-met derivation)');
  }

  // (4) WORKS iff PASS_A AND PASS_B (the floors above already met). The PIVOT: a clean EARNED 0 with the
  // floors met + the CI tight + the controls upheld certifies WORKS -- the SATURATED-VOID label is RETIRED.
  if (estimandA.pass && estimandB.pass) {
    return out('WORKS', 'PASS_A (CP1s false-uphold <= TAU_FU) AND PASS_B (CP1s over-refusal <= TAU_OR) on a difficulty-floor-met, covariate-matched set with the controls upheld + the CI tight -> WORKS (the PIVOT; a clean earned 0 is PROOF, the SATURATED-VOID framing is RETIRED). Clears the closed-book SCREEN, NOT a ship certificate -- Phase-20 is the real gate.');
  }

  // (5) Otherwise a CI exceeds its TAU -> DOES-NOT-WORK.
  return out('DOES-NOT-WORK', 'a CI exceeds its TAU (PASS_A=' + estimandA.pass + ', PASS_B=' + estimandB.pass + ') -> DOES-NOT-WORK under its own best prompt');
}

// ---------------------------------------------------------------------------
// decisionMatrix({ haiku, sonnet, opus }) (each a certifyModel result) -- the RE-PLAN-7 cross-product
// of the INDEPENDENT per-model verdicts encoding the FOUR Opus-voter nuances.
//   - cell = the Haiku x Sonnet cross-product (nuance i -- the SHIP matrix is the cheap tiers ONLY):
//     'both' / 'only-sonnet' / 'only-haiku' / 'neither'; if either subject is a VOID flavor the cell
//     surfaces 'VOID' naming which subject + which flavor (Opus is NEVER a ship cell).
//   - opusReference = { verdict, opusFailsBar } (nuance ii -- Opus is the reference ROW; opusFailsBar is
//     the NEW first-class MAJOR finding: the quality anchor the plugin leans on is below its own gate).
//   - nearOpusDiagnostic = { meaningful, value } (nuance iii -- CONDITIONAL on Opus clearing the bar;
//     tracking a model that is itself wrong is not reassurance, so value is null + meaningful false when
//     Opus does NOT WORK). The actual Haiku/Sonnet-tracks-Opus number is computed at the Task-4 settle
//     from the shared-set agreement; here it is a placeholder 'computed-at-settle' marker when meaningful.
//   - raiseToUser = true ALWAYS (settle-OR-raise; never auto-resolve) -- explicitly true on opusFailsBar
//     and on any subject VOID.
//   - framing = 'clears-the-closed-book-SCREEN' (F4 -- never 'production-safe'; a closed-book WORKS does
//     NOT flip Haiku ON; the Phase-20 live shadow is the named precondition for the flip).
// Returns { cell, opusReference, nearOpusDiagnostic, raiseToUser, framing }.
// ---------------------------------------------------------------------------
export function decisionMatrix({ haiku, sonnet, opus } = {}) {
  for (const [name, r] of [['haiku', haiku], ['sonnet', sonnet], ['opus', opus]]) {
    if (r == null || typeof r !== 'object' || typeof r.verdict !== 'string') {
      throw new ContractError('decisionMatrix requires a ' + name + ' certifyModel result (with a verdict string)', 'decisionMatrix');
    }
  }

  const isVoid = (v) => v.startsWith('VOID');
  const haikuWorks = haiku.verdict === 'WORKS';
  const sonnetWorks = sonnet.verdict === 'WORKS';

  // The SHIP cell is the Haiku x Sonnet cross-product ONLY (nuance i -- Opus is never a ship cell). A
  // subject VOID surfaces explicitly (which subject + which flavor) so it is never silently read as
  // 'neither' (a VOID is a power/validity failure, NOT a DOES-NOT-WORK capability verdict).
  let cell;

  if (isVoid(haiku.verdict) || isVoid(sonnet.verdict)) {
    const voids = [];

    if (isVoid(haiku.verdict)) {
      voids.push('haiku:' + haiku.verdict);
    }

    if (isVoid(sonnet.verdict)) {
      voids.push('sonnet:' + sonnet.verdict);
    }

    cell = 'VOID(' + voids.join(',') + ')';
  } else if (haikuWorks && sonnetWorks) {
    cell = 'both';
  } else if (sonnetWorks) {
    cell = 'only-sonnet';
  } else if (haikuWorks) {
    cell = 'only-haiku';
  } else {
    cell = 'neither';
  }

  const opusFailsBar = opus.verdict !== 'WORKS';

  const opusReference = Object.freeze({
    verdict: opus.verdict,
    opusFailsBar,
  });

  // nuance iii: the near-Opus diagnostic is CONDITIONAL on Opus clearing the bar. The actual
  // tracks-Opus number is computed at the Task-4 settle over the shared set; suppressed when Opus fails.
  const nearOpusDiagnostic = Object.freeze({
    meaningful: !opusFailsBar,
    value: opusFailsBar ? null : 'computed-at-settle',
  });

  return Object.freeze({
    cell,
    opusReference,
    nearOpusDiagnostic,
    // settle-OR-raise: ALWAYS raise (a both-WORKS cell still does not auto-flip Haiku ON). Explicitly
    // true on opusFailsBar (the MAJOR finding) and on any subject VOID -- covered by the always-true.
    raiseToUser: true,
    framing: 'clears-the-closed-book-SCREEN',
  });
}

// ---------------------------------------------------------------------------
// The pooled DELTA read (EVAL-02 / D-05). Given the per-seat vote directories (sonnet + haiku) over
// the SHARED SUBTLE open-book pool and the gold labels, compute via the FROZEN engine:
//   - the Sonnet + Haiku false-uphold counts (countFalseUpholds -- off-model verdict-vs-gold);
//   - the pooled EXCESS (delta(haiku, sonnet)) -- the SOLE gated quantity (Haiku-MINUS-Sonnet);
//   - the pooled n (the realized claim-trial count, the shared trial pool size);
//   - the CP(1, N_pooled) ceiling LABEL (clopperPearsonUpper, the recorded value of record, D-05);
//   - the SUBTLE-open-book delta upper bound the engine's hard gate reads.
//   - Pass@1 / Pass^k (the EVAL-02 sampling reliability, computed PER SEAT via the engine combinatorics).
//
// THE GATE IS THE EXACT-ZERO POOLED EXCESS COUNT (Pitfall 3): the recorded pooled CP(1,N) value is a
// LABEL, NEVER re-derived as a clustered / design-effect CI; "~0.05" is never presented as a coverage
// guarantee. The engine's 0.25 per-claim anchor discriminates 0-vs->=1 excess ONLY at the per-claim
// RELIABILITY scale (CP(0,15)~=0.218 PASS, CP(1,15)~=0.319 FAIL) -- at the LARGE pooled n the CP upper
// on a single excess is small (e.g. CP(2,80)~=0.087 < 0.25), so reading the engine anchor at the
// pooled n would let a non-zero excess SLIDE UNDER the gate. To keep "any single excess fails"
// MECHANICALLY true, the engine-facing subtleOpenBookDeltaUpper is the CP upper on the
// EXACT-ZERO-vs->=1 excess COUNT evaluated at the per-claim reliability scale (reliableTrials): a zero
// pooled excess -> CP(0, reliableTrials) (PASS-side of 0.25); ANY non-zero excess -> CP(1,
// reliableTrials) (FAIL-side of 0.25), independent of how large the pooled n is. The pooled CP(1,N)
// label is recorded separately as the run-artifact value of record.
//
// goldLabels maps a vote id -> its expected verdict ('refuted' for a bad/trap seed). Both seat
// directories index the SAME gold (the shared pool). k is the EVAL-02 reporting k (floor MIN_K = 5);
// reliableTrials is the realized per-claim trial depth (>= RELIABLE_TRIALS = 15 before a PASS).
// ---------------------------------------------------------------------------
export function readDelta({
  sonnetVoteDir,
  haikuVoteDir,
  goldLabels,
  nPooled,
  reliableTrials,
  k = EVAL_THRESHOLDS.MIN_K,
} = {}) {
  if (typeof sonnetVoteDir !== 'string' || typeof haikuVoteDir !== 'string') {
    throw new ContractError('readDelta requires sonnetVoteDir + haikuVoteDir paths', 'readDelta');
  }

  if (!Number.isInteger(nPooled) || nPooled <= 0) {
    throw new ContractError('readDelta requires a positive integer nPooled: ' + JSON.stringify(nPooled), 'readDelta');
  }

  if (!Number.isInteger(reliableTrials) || reliableTrials < 1) {
    throw new ContractError('readDelta requires a positive integer reliableTrials (>= 1; reliableTrials=0 feeds a degenerate clopperPearsonUpper(_,0,_)): ' + JSON.stringify(reliableTrials), 'readDelta');
  }

  if (!Number.isInteger(k) || k < EVAL_THRESHOLDS.MIN_K) {
    throw new ContractError('readDelta requires k >= MIN_K (' + EVAL_THRESHOLDS.MIN_K + '): ' + JSON.stringify(k), 'readDelta');
  }

  // passHatK/passAtK are undefined for n < k (they return NaN by contract). Guard nPooled >= k here so
  // a NaN can never land silently in the frozen read output; a pool smaller than the reporting k is a
  // misconfigured run, not a valid read.
  if (nPooled < k) {
    throw new ContractError('readDelta requires nPooled >= k (else passHatK is NaN in the read): nPooled=' + nPooled + ' k=' + k, 'readDelta');
  }

  // D1-17: the pooled pool must be at least the per-claim reliability depth. A PASS is declared at
  // reliable=RELIABLE_TRIALS (15); a pooled pool smaller than reliableTrials cannot support the
  // reliability the gate reads (the declared reliability would exceed the realized sample) -- a
  // misconfigured read, never a silent over-claim of reliability.
  if (nPooled < reliableTrials) {
    throw new ContractError('readDelta requires nPooled >= reliableTrials (pool smaller than the reliability depth): nPooled=' + nPooled + ' reliableTrials=' + reliableTrials, 'readDelta');
  }

  // F3/F4 / probe-#5: cross-validate the DECLARED nPooled against the REALIZED per-seat vote population
  // BEFORE counting. countFalseUpholds returns ONLY a count, never the number of files it read, so
  // without this an UNDER-filled vote dir -- the NORMAL mid-interruption state of the resumable D-08 run
  // (persistVote skip-already-done) -- would silently inflate correct = nPooled - falseUpholds and
  // over-report Pass@1/Pass^k over a pool the run never completed; an OVER-filled (stale) dir skews the
  // other way and can drive correct negative into passAtK. Each seat must hold EXACTLY nPooled votes
  // (one per shared-pool claim). Fail closed in BOTH directions. (This subsumes the prior superset-only
  // guard, which caught only falseUpholds > nPooled.)
  const sonnetTrials = listJson(sonnetVoteDir).length;
  const haikuTrials = listJson(haikuVoteDir).length;

  if (sonnetTrials !== nPooled || haikuTrials !== nPooled) {
    throw new ContractError(
      'readDelta: realized per-seat vote count != nPooled (partial/interrupted or stale pool): sonnet=' +
        sonnetTrials + ' haiku=' + haikuTrials + ' nPooled=' + nPooled,
      'readDelta',
    );
  }

  // The FROZEN off-model verdict-vs-gold counts over the shared SUBTLE pool (each routes every vote id
  // through safeId inside the engine -- T-19-TRAVERSE).
  const sonnetFalseUpholds = countFalseUpholds(sonnetVoteDir, goldLabels);
  const haikuFalseUpholds = countFalseUpholds(haikuVoteDir, goldLabels);

  // The SOLE gated quantity: the Haiku-MINUS-Sonnet pooled EXCESS (never Haiku's absolute rate, D-06).
  const pooledExcess = delta(haikuFalseUpholds, sonnetFalseUpholds);

  // The recorded CP(1, N_pooled) ceiling LABEL (the run-artifact value of record, D-05). LABEL only --
  // NEVER re-derived as a clustered CI (Pitfall 3); "~0.05" is never presented as a coverage guarantee.
  const pooledCeilingLabel = clopperPearsonUpper(1, nPooled, EVAL_THRESHOLDS.ALPHA);

  // The SUBTLE-open-book delta upper bound the engine's hard gate reads. To make "any single excess
  // fails" MECHANICALLY true regardless of the (large) pooled n, this is the CP upper on the
  // EXACT-ZERO-vs->=1 excess COUNT at the per-claim RELIABILITY scale: zero pooled excess -> CP(0,
  // reliableTrials) (PASS-side of the 0.25 anchor); ANY non-zero excess -> CP(1, reliableTrials)
  // (FAIL-side). A negative excess (Haiku BETTER than Sonnet) is a zero-excess clean read. The CI x is
  // the EXACT-ZERO-count indicator (0 or 1), NEVER the raw excess magnitude (so 1 excess and 5 excess
  // both FAIL identically -- the gate is the count being non-zero, not its size).
  const excessIndicator = pooledExcess > 0 ? 1 : 0;
  const subtleOpenBookDeltaUpper = clopperPearsonUpper(excessIndicator, reliableTrials, EVAL_THRESHOLDS.ALPHA);

  // EVAL-02 sampling reliability PER SEAT (passes = nPooled - falseUpholds; combinatorics via the
  // engine, NEVER hand-rolled). These are reported alongside the gate, they do not themselves gate.
  const sonnetCorrect = nPooled - sonnetFalseUpholds;
  const haikuCorrect = nPooled - haikuFalseUpholds;

  return Object.freeze({
    sonnetFalseUpholds,
    haikuFalseUpholds,
    pooledExcess,
    nPooled,
    reliableTrials,
    k,
    pooledCeilingLabel,
    subtleOpenBookDeltaUpper,
    passAt1: Object.freeze({
      sonnet: passAtK(nPooled, sonnetCorrect, 1),
      haiku: passAtK(nPooled, haikuCorrect, 1),
    }),
    passHatK: Object.freeze({
      sonnet: passHatK(nPooled, sonnetCorrect, k),
      haiku: passHatK(nPooled, haikuCorrect, k),
    }),
  });
}

// ---------------------------------------------------------------------------
// The settle-OR-raise OUTCOME RESOLVER (EVAL-04). VOID is decided BEFORE the frozen engine runs:
//   - calibrator 'saturated' (no Sonnet-below-ceiling stratum) -> 'VOID' (the engine never sees a
//     saturated stratum -- a both-models-ace tie is NEVER read as Haiku-safe, D-06). RAISE to user.
//   - calibrator 'below-ceiling' -> delegate to the FROZEN lockRuleVerdict for PASS / FAIL-RAISE.
//
// The engine PASSES only when the SUBTLE-open-book delta upper bound is at/below the anchor (a clean
// ZERO pooled excess), the escalation fraction is below the kill band, AND reliableTrials >= 15. Any
// non-zero pooled excess pushes subtleOpenBookDeltaUpper above the anchor -> FAIL-RAISE.
//
// Returns { outcome: 'VOID' | 'PASS' | 'FAIL-RAISE', raiseToUser: boolean, shipsSonnetDefault, reason,
//   ...the read fields }. Sonnet-default ships in EVERY non-PASS case (settle-OR-raise honored).
// ---------------------------------------------------------------------------
export function resolveOutcome({ calibration, read, escalationFraction } = {}) {
  if (calibration == null || typeof calibration !== 'object' || typeof calibration.status !== 'string') {
    throw new ContractError('resolveOutcome requires a calibration result (calibratorGate output)', 'resolveOutcome');
  }

  // GATE-ON-THE-GATE: a saturated calibrator is VOID, decided BEFORE the engine. The delta is NOT read
  // (a both-models-ace tie is never read as Haiku-safe). RAISE to user; Sonnet-default ships.
  if (calibration.status === 'saturated') {
    return Object.freeze({
      outcome: 'VOID',
      raiseToUser: true,
      shipsSonnetDefault: true,
      reason: 'saturation pre-condition failed (no Sonnet-below-ceiling stratum) -- defer the tier to Phase-20 shadow',
      calibration,
    });
  }

  if (calibration.status !== 'below-ceiling') {
    throw new ContractError('resolveOutcome: unknown calibration.status ' + JSON.stringify(calibration.status), 'resolveOutcome');
  }

  if (read == null || typeof read !== 'object') {
    throw new ContractError('resolveOutcome requires a read (readDelta output) on a below-ceiling stratum', 'resolveOutcome');
  }

  if (!Number.isFinite(escalationFraction) || escalationFraction < 0 || escalationFraction > 1) {
    // Range-check [0,1]: an escalation FRACTION outside [0,1] is a computation error. Left unguarded, a
    // negative value silently clears the cost gate (escalationFraction < ESCALATION_KILL_HIGH), masking
    // the error as a PASS-eligible read. Fail closed.
    throw new ContractError('resolveOutcome requires escalationFraction in [0,1]: ' + JSON.stringify(escalationFraction), 'resolveOutcome');
  }

  // Below ceiling: delegate to the FROZEN engine (PASS / FAIL-RAISE only -- VOID is handled above).
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: read.subtleOpenBookDeltaUpper,
    escalationFraction,
    reliableTrials: read.reliableTrials,
  });

  const isPass = verdict === 'PASS';

  return Object.freeze({
    outcome: verdict, // 'PASS' | 'FAIL-RAISE'
    raiseToUser: !isPass,
    shipsSonnetDefault: !isPass, // on PASS the Haiku-first flag flips ON; otherwise Sonnet-default ships
    haikuFirstFlag: isPass ? 'ON' : 'OFF',
    reason: isPass
      ? 'all three gates clear at reliable=15 on a Sonnet-below-ceiling stratum -- clear Haiku for Phase-20 shadow/canary'
      : 'a gate failed (non-zero pooled excess, kill-band escalation, or insufficient reliability) -- raise to user; Sonnet-default ships',
    escalationFraction,
    calibration,
    read,
  });
}

// ---------------------------------------------------------------------------
// Resumable vote persistence (D-08): the D-08 dynamic Workflow writes each vote here, and a re-run
// SKIPS an already-persisted vote (skip-already-done) so a credit / account interruption mid-run is
// recoverable. A vote record is { id, seat, verdict, trace:{queries[], depth, stop_reason} }: the
// per-vote SEARCH TRACE (D-10) makes a null delta diagnosable as genuine parity vs both-stopped-early.
//
// votePath = voteDir/<safeId(seat-id)>.json. The basename is safeId-guarded (T-19-TRAVERSE) so a
// content-derived id can never traverse. Returns { persisted: boolean, skipped: boolean, path }.
// persisted=true on a fresh write; skipped=true when the vote already exists (idempotent re-run).
// ---------------------------------------------------------------------------
export function votePath(voteDir, id) {
  if (typeof voteDir !== 'string' || voteDir.length === 0) {
    throw new ContractError('votePath requires a voteDir (gitignored eval/.cache/)', 'votePath');
  }

  const base = safeId(String(id), 'votePath') + '.json';

  return path.join(voteDir, base);
}

export function votePersisted(voteDir, id) {
  return fs.existsSync(votePath(voteDir, id));
}

export function persistVote(voteDir, vote, { overwrite = false } = {}) {
  if (typeof voteDir !== 'string' || voteDir.length === 0) {
    throw new ContractError('persistVote requires a voteDir (gitignored eval/.cache/)', 'persistVote');
  }

  if (vote == null || typeof vote !== 'object') {
    throw new ContractError('persistVote requires a vote object', 'persistVote');
  }

  if (typeof vote.id !== 'string' || vote.id.length === 0) {
    throw new ContractError('persistVote vote requires a non-empty id', 'persistVote');
  }

  if (vote.verdict !== 'unrefuted' && vote.verdict !== 'refuted') {
    throw new ContractError(
      'persistVote vote.verdict must be in {unrefuted,refuted}: ' + JSON.stringify(vote.verdict),
      'persistVote',
    );
  }

  // The per-vote SEARCH TRACE is REQUIRED (D-10): { queries:[], depth, stop_reason }. A null delta is
  // only diagnosable as parity-vs-both-stopped-early when the trace is present.
  const t = vote.trace;

  if (
    t == null ||
    typeof t !== 'object' ||
    !Array.isArray(t.queries) ||
    typeof t.depth !== 'number' ||
    typeof t.stop_reason !== 'string'
  ) {
    throw new ContractError(
      'persistVote vote.trace must be { queries:[], depth:number, stop_reason:string } (D-10)',
      'persistVote',
    );
  }

  // D1-10: the stop_reason must be one of the search-and-stop enum values (not just any string). An
  // unknown reason means the trace did not come from the shared loop and is not diagnosable.
  if (!STOP_REASONS.includes(t.stop_reason)) {
    throw new ContractError(
      'persistVote vote.trace.stop_reason must be one of ' + STOP_REASONS.join('|') + ': ' + JSON.stringify(t.stop_reason),
      'persistVote',
    );
  }

  const p = votePath(voteDir, vote.id);

  // SKIP-ALREADY-DONE (D-08): a re-run does NOT re-cast or overwrite an existing vote unless told to.
  if (!overwrite && fs.existsSync(p)) {
    return Object.freeze({ persisted: false, skipped: true, path: p });
  }

  fs.mkdirSync(voteDir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(vote, null, 2) + '\n', 'utf8');

  return Object.freeze({ persisted: true, skipped: false, path: p });
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--resolve <run-dir>` it reads a
// run config (run.json: { sonnetVoteDir, haikuVoteDir, goldLabels, nPooled, reliableTrials,
// calibration:{sonnetFalseUpholds,trials}, escalationFraction }) from <run-dir> and prints the
// outcome (VOID / PASS / FAIL-RAISE); exits 0 / 2. The actual read (Task 2) is driven by the D-08
// Workflow; this CLI is a convenience that composes the exported deterministic functions over an
// already-persisted vote set.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const mode = process.argv[2];

    if (mode === '--resolve') {
      const runDir = process.argv[3];

      if (!runDir || !fs.existsSync(runDir) || !fs.statSync(runDir).isDirectory()) {
        console.error('lz-eval-offline-read: missing or invalid <run-dir>');
        process.exit(2);
      }

      const cfg = readJson(path.join(runDir, 'run.json'));
      const calibration = calibratorGate({
        sonnetFalseUpholds: cfg.calibration.sonnetFalseUpholds,
        trials: cfg.calibration.trials,
      });

      let read = null;

      if (calibration.status === 'below-ceiling') {
        read = readDelta({
          sonnetVoteDir: path.resolve(runDir, cfg.sonnetVoteDir),
          haikuVoteDir: path.resolve(runDir, cfg.haikuVoteDir),
          goldLabels: cfg.goldLabels,
          nPooled: cfg.nPooled,
          reliableTrials: cfg.reliableTrials,
        });
      }

      const outcome = resolveOutcome({ calibration, read, escalationFraction: cfg.escalationFraction });
      console.log(JSON.stringify(outcome, null, 2));
      process.exit(0);
    }

    console.error('lz-eval-offline-read: usage: node lz-eval-offline-read.mjs --resolve <run-dir>');
    process.exit(2);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-offline-read: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
