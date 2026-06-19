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
import { spawnSync } from 'node:child_process';
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

// (5) Cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (eval -> runtime,
// one-directional). ContractError backs the fail-closed reads; safeId guards a content-derived vote id
// (T-19-TRAVERSE) before it is used as a path / map key; listJson is the sorted fail-closed *.json listing.
import {
  ContractError,
  safeId,
  listJson,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// (6) The shared fail-closed JSON read (the eval-tree helper; strips a BOM, never a bare JSON.parse).
import { readJson } from './lz-eval-readjson.mjs';

// STOP_REASONS / scorePositiveControls / runProbeConsensus are part of the composed live arm; referenced
// where a dual-run vote / control score / consensus pass is produced (Stage 2). Kept exported-by-use so a
// lint pass does not flag the import while the model-spend wiring stays behind the LZ_SPEND hard-guard
// (the dry-run uses stubs). makeBatchedOofProbe is USED by makeOofAdjudicator (the callOof transport).
void STOP_REASONS;
void scorePositiveControls;
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
// readArmVotes(voteDir): read every persisted vote in ONE arm's vote dir into an id -> verdict map. The
// votes were cast at Stage 2 (the human-gated spend) and persisted via persistDualRunVote (the frozen
// persistVote -- the per-vote search trace + skip-already-done discipline). This READ is NON-SPEND: it
// only reads already-cast votes off disk. Each record is the frozen vote shape
// { id, verdict:'unrefuted'|'refuted', trace:{...} }; a malformed record / non-{unrefuted,refuted}
// verdict fails closed (mirrors scorePositiveControls' read discipline). Every content-derived vote id is
// routed through safeId (T-19-TRAVERSE) BEFORE it is used as a map key. Returns a Map(id -> verdict).
// ---------------------------------------------------------------------------
function readArmVotes(voteDir) {
  if (typeof voteDir !== 'string' || voteDir.length === 0) {
    throw new ContractError('readArmVotes requires a voteDir', 'readArmVotes');
  }

  const files = listJson(voteDir);
  const byId = new Map();

  for (const f of files) {
    const votePath_ = path.join(voteDir, f);
    const rec = readJson(votePath_);

    if (rec == null || typeof rec !== 'object') {
      throw new ContractError('readArmVotes: malformed vote record: ' + JSON.stringify(rec), votePath_);
    }

    if (typeof rec.id !== 'string' || rec.id.length === 0) {
      throw new ContractError('readArmVotes: vote record missing a non-empty string id: ' + JSON.stringify(rec), votePath_);
    }

    const id = safeId(String(rec.id), votePath_);

    if (rec.verdict !== 'unrefuted' && rec.verdict !== 'refuted') {
      throw new ContractError('readArmVotes: vote record carries a non-{unrefuted,refuted} verdict: id=' + JSON.stringify(id) + ' verdict=' + JSON.stringify(rec.verdict), votePath_);
    }

    if (byId.has(id)) {
      throw new ContractError('readArmVotes: duplicate vote id in the arm vote dir: ' + JSON.stringify(id), votePath_);
    }

    byId.set(id, rec.verdict);
  }

  return byId;
}

// ---------------------------------------------------------------------------
// scoreArmFromVotes({ arm, voteDir, kind }): build ONE arm's certifyModel count from the persisted votes.
// The arm is the FROZEN member list (each carrying a `uid`); kind is 'over-refusal' (the control arm,
// ESTIMAND B) or 'dense-trap' (the monitor arm, ESTIMAND A). For EVERY frozen member a vote MUST exist
// (a partial / stale vote dir fails closed -- mirrors scorePositiveControls' realized-count guard); the
// vote is read by the member's uid. The COUNT depends on the arm kind:
//   - 'over-refusal' control arm: a SUPPORTED positive the voter SHOULD uphold -> a 'refuted' vote is an
//     OVER-REFUSAL (the wrong refute). overRefusals = # 'refuted' votes; n = nCtrl.
//   - 'dense-trap' monitor arm: a dense / contested claim where a cheap voter wrongly upholds an
//     unsupported overreach -> an 'unrefuted' vote is a FALSE-UPHOLD. falseUpholds = # 'unrefuted'
//     votes; n = nTrap.
// The two arms are scored SEPARATELY -- this function never sees the other arm's votes; the caller passes
// the two SEPARATE counts to certifyModel (NEVER one pooled N). Returns { count, n } (count is the arm's
// failure count: overRefusals or falseUpholds). NON-SPEND (reads cast votes off disk).
// ---------------------------------------------------------------------------
export function scoreArmFromVotes({ arm, voteDir, kind } = {}) {
  if (!Array.isArray(arm) || arm.length === 0) {
    throw new ContractError('scoreArmFromVotes requires a non-empty frozen arm member list', 'scoreArmFromVotes');
  }

  if (kind !== 'over-refusal' && kind !== 'dense-trap') {
    throw new ContractError('scoreArmFromVotes kind must be one of over-refusal|dense-trap: ' + JSON.stringify(kind), 'scoreArmFromVotes');
  }

  const votes = readArmVotes(voteDir);

  // The realized vote count MUST equal the frozen arm size (a partial / stale vote dir fails closed --
  // the denominator is the FROZEN N, never a realized subset; mirrors scorePositiveControls W-2 part 1).
  if (votes.size !== arm.length) {
    throw new ContractError(
      'scoreArmFromVotes: realized vote count (' + votes.size + ') != frozen arm size (' + arm.length +
        ') -- a partial / stale vote dir; the denominator is the FROZEN N (' + kind + ' arm)',
      'scoreArmFromVotes',
    );
  }

  let count = 0;

  for (const member of arm) {
    if (member == null || typeof member.uid !== 'string' || member.uid.length === 0) {
      throw new ContractError('scoreArmFromVotes: a frozen arm member is missing a string uid: ' + JSON.stringify(member), 'scoreArmFromVotes');
    }

    if (!votes.has(member.uid)) {
      throw new ContractError('scoreArmFromVotes: no persisted vote for frozen arm member uid=' + JSON.stringify(member.uid) + ' (' + kind + ' arm)', 'scoreArmFromVotes');
    }

    const verdict = votes.get(member.uid);

    // The arm kind decides which verdict is the FAILURE direction (the two arms are scored oppositely):
    //   over-refusal control arm: a 'refuted' on a SUPPORTED positive is the wrong refute (over-refusal);
    //   dense-trap monitor arm:   an 'unrefuted' on a dense overreach is the wrong uphold (false-uphold).
    if (kind === 'over-refusal') {
      if (verdict === 'refuted') {
        count += 1;
      }
    } else if (verdict === 'unrefuted') {
      count += 1;
    }
  }

  return Object.freeze({ count, n: arm.length });
}

// ---------------------------------------------------------------------------
// scoreFromPersistedVotes({ frozen, ctrlArm, trapArm, ctrlVoteDir, trapVoteDir, model, traceAudit,
//   difficultyFloorMet, covariateOverlapMet, evidenceAbsentStratumMet }): the NODE-SIDE DETERMINISTIC
// SCORER (NO SPEND -- the decoupling deliverable of this no-spend build). It READS the persisted dual-run
// votes from the two SEPARATE arm vote dirs (ctrlVoteDir / trapVoteDir), builds the two un-pooled per-arm
// inputs ({ overRefusals, nCtrl } from the over-refusal control arm; { falseUpholds, nTrap } from the
// dense-trap monitor arm), and calls the FROZEN certifyModel for ONE model over the two SEPARATE arms.
// This DECOUPLES scoring from the live transport: the live spend (Stage 2/3) writes votes to disk via
// persistDualRunVote; THIS node scorer reads them back and scores -- with ZERO spend, runnable via
// `Bash(node:*)` from the session (D-20).
//
// The frozen Stage-1 snapshot (freezeArms output) binds the FROZEN N: ctrlArm.length MUST equal
// frozen.nCtrl and trapArm.length MUST equal frozen.nTrap (the denominator is the FROZEN N -- no optional
// stopping). The two arms are passed SEPARATELY to certifyModel (overRefusals/nCtrl is ESTIMAND B;
// falseUpholds/nTrap is ESTIMAND A) -- NEVER pooled. certifyModel is consumed UNCHANGED (it owns the WORKS
// verdict, the floors, the one-sided CP). Returns the per-model certifyModel verdict; the caller composes
// the three per-model verdicts via composeDecision (decisionMatrix) for the final verdict.
// ---------------------------------------------------------------------------
export function scoreFromPersistedVotes({
  frozen,
  ctrlArm,
  trapArm,
  ctrlVoteDir,
  trapVoteDir,
  model,
  traceAudit,
  difficultyFloorMet,
  covariateOverlapMet,
  evidenceAbsentStratumMet,
} = {}) {
  if (frozen == null || typeof frozen !== 'object' || frozen.frozenAt !== 'stage-1') {
    throw new ContractError('scoreFromPersistedVotes requires the Stage-1 frozen snapshot (freezeArms output)', 'scoreFromPersistedVotes');
  }

  if (!Array.isArray(ctrlArm) || !Array.isArray(trapArm)) {
    throw new ContractError('scoreFromPersistedVotes requires the two SEPARATE frozen arms (ctrlArm + trapArm arrays)', 'scoreFromPersistedVotes');
  }

  // The denominator is the FROZEN N (no optional stopping) -- the arms passed in MUST match the Stage-1
  // freeze exactly. A grown / shrunk arm is a result-shopping defect; fail closed.
  if (ctrlArm.length !== frozen.nCtrl) {
    throw new ContractError('scoreFromPersistedVotes: ctrlArm size (' + ctrlArm.length + ') != frozen.nCtrl (' + frozen.nCtrl + ') -- the denominator is the FROZEN N (no optional stopping)', 'scoreFromPersistedVotes');
  }

  if (trapArm.length !== frozen.nTrap) {
    throw new ContractError('scoreFromPersistedVotes: trapArm size (' + trapArm.length + ') != frozen.nTrap (' + frozen.nTrap + ') -- the denominator is the FROZEN N (no optional stopping)', 'scoreFromPersistedVotes');
  }

  // The two arms scored SEPARATELY off disk -- ESTIMAND B (over-refusal) from the control arm, ESTIMAND A
  // (false-uphold) from the dense-trap arm. NEVER pooled.
  const ctrl = scoreArmFromVotes({ arm: ctrlArm, voteDir: ctrlVoteDir, kind: 'over-refusal' });
  const trap = scoreArmFromVotes({ arm: trapArm, voteDir: trapVoteDir, kind: 'dense-trap' });

  // The FROZEN certifyModel owns ALL the gate logic; forward the two SEPARATE arm counts + the floors.
  return certifyModel({
    model,
    falseUpholds: trap.count,
    nTrap: trap.n,
    overRefusals: ctrl.count,
    nCtrl: ctrl.n,
    traceAudit,
    difficultyFloorMet,
    covariateOverlapMet,
    evidenceAbsentStratumMet,
  });
}

// ===========================================================================
// callOof -- the COPILOT CLI NODE TRANSPORT (D-20). This is the ONLY transport that CAN be node code: the
// Copilot CLI is an EXTERNAL subprocess (NOT the Agent tool, which a bare `node` process cannot reach).
// The Claude voter spend (callVoter) + the Stage-3 audit (callAuditor) are session-Agent-driven (see
// eval/lz-eval-live-cert-driver.md); only the OOF gold adjudication is node-wireable here. The OOF spend
// is the metered Copilot AI Credits pool (D-20) -- hard-guarded behind requireSpend / LZ_SPEND.
// ===========================================================================

// ---------------------------------------------------------------------------
// COPILOT_CLI_DEFAULTS: the documented Copilot CLI invocation posture (CLAUDE.md copilot-cli-invocation).
// The transport PIPES the prompt via stdin (NO -p flag; a multi-line -p arg is silently dropped + embedded
// quotes break the argv hand-off), OMITS --allow-all-tools (the Claude Code classifier auto-DENIES it),
// and passes --model <slug> --effort high. The frozen OOF pair slugs are gpt-5.5 + gemini-3.1-pro-preview
// (the -preview suffix is REQUIRED; the bare gemini-3.1-pro errors). The binary path is resolvable from
// PATH (`copilot`) by default; an explicit bin overrides for a non-PATH install.
// ---------------------------------------------------------------------------
export const COPILOT_CLI_DEFAULTS = Object.freeze({
  bin: 'copilot',
  effort: 'high',
  timeoutMs: 180000,
});

// ---------------------------------------------------------------------------
// makeCopilotCallModel({ model, bin, effort, timeoutMs, runner }): build the callModel(promptText) ->
// Promise<rawString> transport that makeBatchedOofProbe consumes, wired over the Copilot CLI subprocess.
// HARD-GUARDED: it calls requireSpend('callOof') FIRST -- a real OOF spend THROWS unless LZ_SPEND=1 (the
// dry-run + the test suite run stubs only; the guard fires on any accidental spend entry). The runner is
// INJECTABLE (default node:child_process spawnSync) so the test drives a deterministic stub with ZERO
// spend; the test asserts (a) the guard throws on LZ_SPEND unset and (b) the wiring shape (the prompt is
// PIPED via stdin, -p is NEVER passed, --allow-all-tools is NEVER passed, --model + --effort are passed).
//
// The transport returns the subprocess STDOUT verbatim (the raw model response); makeBatchedOofProbe's
// reused score.mjs slice parses the JSON array out of it. A non-zero exit / spawn error fails closed with
// a ContractError (the OOF response is not usable -> the batch DP3 re-run/split path applies upstream).
// ---------------------------------------------------------------------------
export function makeCopilotCallModel({
  model,
  bin = COPILOT_CLI_DEFAULTS.bin,
  effort = COPILOT_CLI_DEFAULTS.effort,
  timeoutMs = COPILOT_CLI_DEFAULTS.timeoutMs,
  runner = spawnSync,
} = {}) {
  if (typeof model !== 'string' || model.length === 0) {
    throw new ContractError('makeCopilotCallModel requires a non-empty model slug (e.g. gpt-5.5 / gemini-3.1-pro-preview)', 'makeCopilotCallModel');
  }

  // The argv: NO -p (stdin is the prompt), NO --allow-all-tools (classifier-denied). --model + --effort
  // only. Pinned here so the wiring shape is assertable (the test inspects the argv the runner receives).
  const args = ['--model', model, '--effort', effort];

  async function callModel(promptText) {
    // HARD-GUARD FIRST: refuse to spend Copilot Credits unless explicitly authorized.
    requireSpend('callOof');

    if (typeof promptText !== 'string' || promptText.length === 0) {
      throw new ContractError('makeCopilotCallModel: promptText must be a non-empty string', 'makeCopilotCallModel');
    }

    // PIPE the prompt via stdin (input), NEVER as a -p arg. spawnSync's `input` option writes to the
    // child's stdin -- the documented BEST method (preserves newlines + quotes; no flattening/escaping).
    const res = runner(bin, args, {
      input: promptText,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 64 * 1024 * 1024,
    });

    if (res == null || typeof res !== 'object') {
      throw new ContractError('makeCopilotCallModel: the runner returned no result', 'makeCopilotCallModel');
    }

    if (res.error) {
      throw new ContractError('makeCopilotCallModel: copilot spawn failed: ' + String(res.error.message || res.error), 'makeCopilotCallModel');
    }

    if (typeof res.status === 'number' && res.status !== 0) {
      throw new ContractError('makeCopilotCallModel: copilot exited non-zero (' + res.status + '): ' + String(res.stderr || ''), 'makeCopilotCallModel');
    }

    return String(res.stdout == null ? '' : res.stdout);
  }

  // Surface the argv + posture for the wiring-shape assertion (the test verifies -p / --allow-all-tools
  // are NEVER in the argv and that --model + --effort are).
  callModel.argv = Object.freeze([bin, ...args]);
  callModel.model = model;

  return callModel;
}

// ---------------------------------------------------------------------------
// makeOofAdjudicator({ seed, batchSize, hardBatchSize, hardNearBoundaryIds, makeCallModel }): build the
// FROZEN-OOF-PAIR gold adjudicator -- ONE makeBatchedOofProbe per frozen OOF model, each wired over the
// Copilot CLI transport (makeCopilotCallModel by default; injectable for the test stub). This composes the
// OOF batch adapter (lz-eval-oof-batch.mjs) UNCHANGED -- it only supplies the per-model callModel. The
// returned { probes, prepare } shape matches what runProbeConsensus + the Stage-2 adjudication consume:
// `prepare(packets)` pre-seeds every probe's resolver map (the documented PRE-PASS) before the per-packet
// consensus loop. HARD-GUARDED transitively: each probe's callModel calls requireSpend('callOof') FIRST,
// so building the adjudicator is NO-SPEND but DISPATCHING it (prepare) THROWS unless LZ_SPEND=1.
//
// This is the `callOof` the Stage-2 dual-run injects (the human-gated Plan 20-05 wiring). The test builds
// it with a stub makeCallModel + asserts the two frozen-pair probes are present (gpt-5.5 +
// gemini-3.1-pro-preview) and that prepare fails closed on LZ_SPEND unset.
// ---------------------------------------------------------------------------
export function makeOofAdjudicator({
  seed,
  batchSize,
  hardBatchSize,
  hardNearBoundaryIds = [],
  makeCallModel = makeCopilotCallModel,
} = {}) {
  if (typeof makeCallModel !== 'function') {
    throw new ContractError('makeOofAdjudicator requires a makeCallModel factory (default makeCopilotCallModel)', 'makeOofAdjudicator');
  }

  // ONE probe per FROZEN OOF model (gpt-5.5 + gemini-3.1-pro-preview), byte-identical to FROZEN_OOF_PAIR.
  const probes = FROZEN_OOF_PAIR.map((model) =>
    makeBatchedOofProbe({
      callModel: makeCallModel({ model }),
      model,
      seed,
      batchSize,
      hardBatchSize,
      hardNearBoundaryIds,
    }),
  );

  // PRE-PASS: pre-seed every probe's resolver map before the consensus loop (the documented shape -- a
  // packet not pre-prepared fail-closes to a DROP). Each probe.prepare drives its callModel, which
  // requireSpend-guards -- so prepare is the spend boundary (NO spend until LZ_SPEND=1).
  async function prepare(packets) {
    const events = [];

    for (const probe of probes) {
      const res = await probe.prepare(packets);
      events.push({ model: probe.model, batchEvents: res.batchEvents });
    }

    return Object.freeze({ events });
  }

  return Object.freeze({ probes, prepare, pair: FROZEN_OOF_PAIR });
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
