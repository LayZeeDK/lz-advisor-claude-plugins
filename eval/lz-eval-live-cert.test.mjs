// lz-eval-live-cert.test.mjs
//
// Validation fixture for the LIVE over-refusal + full-WORKS certification STAGED ORCHESTRATOR (Plan
// 20-02, Task 2; D-01..D-07). Dev-only eval-tree test: imports the SCRIPT under test (which COMPOSES the
// FROZEN seams WITHIN the eval tree + the SHIPPED runtime aggregator's hardening primitives ACROSS trees,
// one-directional eval -> runtime) plus node stdlib. It exercises ONLY the DETERMINISTIC SEAMS with
// STUBS -- the suite causes ZERO model spend (every model-spend stage is hard-guarded behind LZ_SPEND=1,
// which the suite never sets).
//
// Every behavior assertion is DISCRIMINATING (proves the seam actually guards / composes / separates),
// never a tautology. Coverage (each a DISTINCT named test):
//   - the LZ_SPEND hard-guard THROWS when the env is unset (a spend-stage entrypoint refuses to spend);
//   - the orchestrator COMPOSES certifyModel (over-refusal arm present) and decisionMatrix with
//     raiseToUser === true (settle-OR-raise; the Haiku flip deferred);
//   - the N-freeze guard REJECTS an N below the floor (30) and passes the two arms SEPARATELY to
//     certifyModel (never one pooled N) -- the two arms are NEVER pooled;
//   - the OOF+human hybrid adjudicator residue router DISCRIMINATES OOF-primary vs human-residue;
//   - the frozen CP estimator / EVAL_THRESHOLDS / certifyModel are IMPORTED, never redefined.
//
// HOST QUIRK (load-bearing): on this host (Node v24.x / Windows arm64 / Git Bash) the phase gate MUST
// target the explicit FILE form:
//   node --test eval/lz-eval-live-cert.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes. The suite is one file, so the file form is the equivalent reliable gate.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  requireSpend,
  freezeArms,
  composeVerdict,
  composeDecision,
  classifyAdjudicationResidue,
  stage0FeasibilityProbe,
  stage1FreezeGold,
  stage2DualRun,
  stage3UnanimousUpholdAudit,
  persistDualRunVote,
  FROZEN_OOF_PAIR,
  LIVE_N_TARGETS,
} from './lz-eval-live-cert.mjs';

import { EVAL_THRESHOLDS, clopperPearsonUpperOneSided } from './lz-eval-aggregate.mjs';

// Resolve test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and headless
// `claude -p`).
const HERE = path.dirname(fileURLToPath(import.meta.url));
void HERE;

// ---------------------------------------------------------------------------
// Helpers: a clean WORKS-shaped certifyModel input (mirrors the offline-read test discipline) + arms of
// N members with distinct uids. NO model calls -- the counts are stubs.
// ---------------------------------------------------------------------------
function cleanTraceAudit(falseUpholds) {
  const upheldRecords = [];

  for (let i = 0; i < falseUpholds; i += 1) {
    upheldRecords.push({ id: 't' + i, seat: 'sonnet', verdict: 'unrefuted', trace: { queries: ['q0', 'q1', 'q2'], depth: 6, stop_reason: 'exhausted' } });
  }

  return { upheldRecords, anyUpholdOnTruncatedOrQuotaKilled: false };
}

function arm(prefix, n, { corroboration = 3 } = {}) {
  const out = [];

  for (let i = 0; i < n; i += 1) {
    out.push(Object.freeze({ uid: prefix + '::cluster' + String(i).padStart(2, '0'), id: 'cluster' + String(i).padStart(2, '0'), confidence: 'High', corroboration_lower_bound: corroboration }));
  }

  return out;
}

// ===========================================================================
// The LZ_SPEND hard-guard (D-07 / T-20-05): every model-spend stage THROWS unless LZ_SPEND=1.
// ===========================================================================

test('requireSpend THROWS when LZ_SPEND is unset (the dry-run path runs stubs only -- no spend)', () => {
  const saved = process.env.LZ_SPEND;
  delete process.env.LZ_SPEND;

  try {
    assert.throws(
      () => requireSpend('stage2DualRun'),
      (e) => e.name === 'ContractError' && /LZ_SPEND/.test(e.message),
      'a spend stage refuses to spend without LZ_SPEND=1',
    );
  } finally {
    if (saved === undefined) {
      delete process.env.LZ_SPEND;
    } else {
      process.env.LZ_SPEND = saved;
    }
  }
});

test('the spend-stage entrypoints (stage2DualRun / stage3UnanimousUpholdAudit) THROW on LZ_SPEND unset (hard-guard fires FIRST)', () => {
  const saved = process.env.LZ_SPEND;
  delete process.env.LZ_SPEND;

  const frozen = freezeArms({ overRefusalControls: arm('r', 30), denseTrapMonitor: arm('t', 30) });

  try {
    // The guard fires BEFORE the not-wired throw -- even with valid args + transports, no spend occurs.
    assert.throws(
      () => stage2DualRun({ frozen, callVoter: () => {}, callOof: () => {} }),
      (e) => e.name === 'ContractError' && /LZ_SPEND/.test(e.message),
      'stage2DualRun hard-guards on LZ_SPEND before any spend',
    );
    assert.throws(
      () => stage3UnanimousUpholdAudit({ frozen, callAuditor: () => {} }),
      (e) => e.name === 'ContractError' && /LZ_SPEND/.test(e.message),
      'stage3UnanimousUpholdAudit hard-guards on LZ_SPEND before any spend',
    );
  } finally {
    if (saved === undefined) {
      delete process.env.LZ_SPEND;
    } else {
      process.env.LZ_SPEND = saved;
    }
  }
});

test('requireSpend RETURNS true when LZ_SPEND=1 (the guard DISCRIMINATES -- not a constant throw)', () => {
  const saved = process.env.LZ_SPEND;
  process.env.LZ_SPEND = '1';

  try {
    assert.equal(requireSpend('stage2DualRun'), true, 'with LZ_SPEND=1 the guard returns true (it genuinely gates, not a constant throw)');
  } finally {
    if (saved === undefined) {
      delete process.env.LZ_SPEND;
    } else {
      process.env.LZ_SPEND = saved;
    }
  }
});

// ===========================================================================
// The N-freeze guard (D-03 / D-07): two SEPARATE arms, at-or-above floor, DISJOINT, frozen in advance.
// ===========================================================================

test('freezeArms REJECTS an arm below the frozen floor (30) -- the read lacks power, never freeze below it', () => {
  // The control arm below floor -> reject.
  assert.throws(
    () => freezeArms({ overRefusalControls: arm('r', 29), denseTrapMonitor: arm('t', 30) }),
    (e) => e.name === 'ContractError' && /N_CTRL_FLOOR/.test(e.message),
    'a 29-member control arm is below N_CTRL_FLOOR=30 -> rejected',
  );
  // The trap arm below floor -> reject.
  assert.throws(
    () => freezeArms({ overRefusalControls: arm('r', 30), denseTrapMonitor: arm('t', 29) }),
    (e) => e.name === 'ContractError' && /N_TRAP_FLOOR/.test(e.message),
    'a 29-member trap arm is below N_TRAP_FLOOR=30 -> rejected',
  );
});

test('freezeArms ACCEPTS two distinct at-floor arms and freezes SEPARATE counts (never one pooled N)', () => {
  const frozen = freezeArms({ overRefusalControls: arm('r', 40), denseTrapMonitor: arm('t', 34) });
  assert.equal(frozen.nCtrl, 40, 'nCtrl frozen separately');
  assert.equal(frozen.nTrap, 34, 'nTrap frozen separately');
  assert.equal(frozen.frozenAt, 'stage-1', 'the snapshot is frozen at the Stage-1 [HUMAN BLOCK] boundary');
  // The two arms are NEVER pooled -- there is no combined-N field; the counts are separate.
  assert.ok(!('n' in frozen) && !('nPooled' in frozen) && !('nTotal' in frozen), 'the frozen snapshot carries NO pooled N (the two arms are NEVER pooled)');
  assert.equal(Object.isFrozen(frozen), true, 'the snapshot is frozen (N cannot grow -- anti-optional-stopping)');
});

test('freezeArms REJECTS overlapping arms (a shared member would double-count a claim across the two estimands)', () => {
  const ctrl = arm('shared', 30);
  const trap = arm('shared', 30); // identical uids -> overlap
  assert.throws(
    () => freezeArms({ overRefusalControls: ctrl, denseTrapMonitor: trap }),
    (e) => e.name === 'ContractError' && /share a member uid/.test(e.message),
    'overlapping arms fail closed (the arms are NEVER pooled)',
  );
});

// ===========================================================================
// certifyModel composition over the two SEPARATE arms (the over-refusal CP gate MOVED to the live arm).
// ===========================================================================

test('composeVerdict passes the two arms SEPARATELY to certifyModel: ESTIMAND B (over-refusal) reads nCtrl, ESTIMAND A reads nTrap', () => {
  // A clean dual-arm WORKS input: 0 false-upholds over a 36-trap arm; 0 over-refusals over a 24-control
  // arm; floors met. The over-refusal arm (ESTIMAND B) is PRESENT and read SEPARATELY from the trap arm.
  const res = composeVerdict({
    model: 'sonnet',
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 0,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });

  assert.equal(res.verdict, 'WORKS', 'a clean two-arm read -> WORKS (both estimands pass at the floors)');
  // ESTIMAND B (over-refusal) is present + read from nCtrl, byte-identical to the frozen one-sided CP.
  assert.equal(res.estimandB.pass, true, 'ESTIMAND B (over-refusal) PASSES: CP1s(0,24) <= TAU_OR (the gate MOVED to the live arm)');
  assert.ok(Math.abs(res.estimandB.cpUpper - clopperPearsonUpperOneSided(0, 24)) < 1e-12, 'estimandB.cpUpper is the FROZEN one-sided CP over the over-refusal arm (nCtrl), not re-derived');
  // ESTIMAND A (false-uphold) is read from the SEPARATE trap arm (nTrap) -- never pooled with nCtrl.
  assert.ok(Math.abs(res.estimandA.cpUpper - clopperPearsonUpperOneSided(0, 36)) < 1e-12, 'estimandA.cpUpper is the FROZEN one-sided CP over the dense-trap arm (nTrap), separate from nCtrl');
});

test('composeVerdict surfaces an OVER-REFUSAL failure distinctly from a clean trap arm (the over-refusal gate binds at the live arm)', () => {
  // 0 false-upholds (trap arm clean) but the controls are OVER-REFUSED beyond TAU_OR -> NOT WORKS. This
  // proves the over-refusal arm is a SEPARATE binding gate (moved here), not folded into the trap arm.
  const res = composeVerdict({
    model: 'haiku',
    falseUpholds: 0,
    nTrap: 36,
    overRefusals: 6,
    nCtrl: 24,
    traceAudit: cleanTraceAudit(0),
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    evidenceAbsentStratumMet: true,
  });

  assert.notEqual(res.verdict, 'WORKS', 'a clean trap arm but over-refused controls is NOT WORKS (the over-refusal gate binds separately)');
  assert.equal(res.estimandA.pass, true, 'ESTIMAND A (trap arm) still passes -- the failure is the SEPARATE over-refusal arm');
  assert.equal(res.estimandB.pass, false, 'ESTIMAND B (over-refusal) FAILS: 6/24 over-refusals exceed TAU_OR');
});

test('composeDecision composes decisionMatrix with raiseToUser === true ALWAYS (settle-OR-raise; the Haiku flip is DEFERRED)', () => {
  const works = composeVerdict({
    model: 'm', falseUpholds: 0, nTrap: 36, overRefusals: 0, nCtrl: 24,
    traceAudit: cleanTraceAudit(0), difficultyFloorMet: true, covariateOverlapMet: true, evidenceAbsentStratumMet: true,
  });

  const decision = composeDecision({ haiku: works, sonnet: works, opus: works });

  // Even a both-WORKS cell does NOT auto-flip Haiku ON -- raiseToUser is ALWAYS true (D-06).
  assert.equal(decision.raiseToUser, true, 'raiseToUser is ALWAYS true (settle-OR-raise; never auto-flip Haiku)');
  assert.equal(decision.framing, 'clears-the-closed-book-SCREEN', 'the frozen non-terminal framing is preserved');
  assert.equal(decision.cell, 'both', 'a both-WORKS Haiku x Sonnet cell -- but still raises to the user');
});

// ===========================================================================
// The OOF + human HYBRID adjudicator residue router (D-04).
// ===========================================================================

test('classifyAdjudicationResidue DISCRIMINATES OOF-primary (all-agree) vs human-residue (split / indeterminate / cheap-conflict)', () => {
  const oof = (a, b) => ({ 'gpt-5.5': a, 'gemini-3.1-pro-preview': b });

  // (1) All-agree OOF, cheap agrees -> the OOF pair is the PRIMARY gold.
  const primary = classifyAdjudicationResidue({ oofProbes: oof(true, true), cheapVerdict: true });
  assert.equal(primary.gold, 'oof', 'a unanimous OOF pair with no cheap conflict -> OOF is the gold (PRIMARY)');
  assert.equal(primary.oofConsensus, true, 'the OOF consensus is surfaced');

  // (2) OOF split -> human residue.
  const split = classifyAdjudicationResidue({ oofProbes: oof(true, false), cheapVerdict: true });
  assert.equal(split.gold, 'human', 'an OOF split routes to the maintainer');
  assert.equal(split.residueReason, 'oof-split', 'the residue reason is oof-split');

  // (3) Response-set-indeterminate (a non-boolean OOF verdict) -> human residue (Guerdan: leaves the
  // binary denominator, never coerced).
  const indeterminate = classifyAdjudicationResidue({ oofProbes: oof('multi-defensible', true), cheapVerdict: true });
  assert.equal(indeterminate.gold, 'human', 'a multi-defensible (non-boolean) OOF verdict routes to the maintainer');
  assert.equal(indeterminate.residueReason, 'response-set-indeterminate', 'the residue reason is response-set-indeterminate');

  // (4) Cheap contradicts a unanimous OOF -> human residue.
  const cheapConflict = classifyAdjudicationResidue({ oofProbes: oof(true, true), cheapVerdict: false });
  assert.equal(cheapConflict.gold, 'human', 'cheap contradicting a unanimous OOF routes to the maintainer');
  assert.equal(cheapConflict.residueReason, 'cheap-vs-unanimous-oof', 'the residue reason is cheap-vs-unanimous-oof');

  // The router genuinely DISCRIMINATES -- not a constant.
  assert.notEqual(primary.gold, split.gold, 'the residue router genuinely discriminates OOF-primary from human-residue');
});

test('FROZEN_OOF_PAIR is the byte-identical out-of-family gold-decider identity (gpt-5.5 + gemini-3.1-pro-preview)', () => {
  assert.deepEqual([...FROZEN_OOF_PAIR], ['gpt-5.5', 'gemini-3.1-pro-preview'], 'the frozen OOF pair is byte-identical');
  assert.equal(Object.isFrozen(FROZEN_OOF_PAIR), true, 'the OOF pair identity is frozen');
});

// ===========================================================================
// Stage 0 (D-19) + Stage 1 freeze (NO SPEND) over a stub corpus.
// ===========================================================================

function writeCorpus(survivorsByDir) {
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-livecert-corpus-'));

  for (const [name, survivors] of Object.entries(survivorsByDir)) {
    const runDir = path.join(corpus, name);
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify(survivors, null, 2) + '\n', 'utf8');
  }

  return corpus;
}

function supportedSurvivor(id, corroboration) {
  return { id, claim: 'c ' + id, sources: Array.from({ length: corroboration }, (_v, i) => 's' + i), corroboration_lower_bound: corroboration, quote_fidelity: 'verified', confidence: 'High', escalate: false };
}

test('stage0FeasibilityProbe is NO-SPEND and returns NOT-feasible (raise) on a short corpus; feasible on an at-floor corpus', () => {
  // A short corpus: well below the floor -> NOT feasible -> raise to the user (Sonnet ships regardless).
  const shortCorpus = writeCorpus({ run0: [supportedSurvivor('cluster0', 3)] });
  // An at-floor corpus: enough dense SUPPORTED claims to clear BOTH floors with disjoint arms.
  const survivors = [];

  for (let i = 0; i < 70; i += 1) {
    survivors.push(supportedSurvivor('cluster' + String(i).padStart(2, '0'), 3));
  }

  const okCorpus = writeCorpus({ run0: survivors });

  try {
    const short = stage0FeasibilityProbe({ corpusDir: shortCorpus });
    assert.equal(short.feasible, false, 'a 1-claim corpus is not feasible (below floor)');
    assert.equal(short.raiseToUser, true, 'NOT feasible -> raise to the user (D-19)');
    assert.equal(short.shipsSonnetDefault, true, 'Sonnet-default ships regardless');

    const ok = stage0FeasibilityProbe({ corpusDir: okCorpus });
    assert.equal(ok.feasible, true, 'a 70-claim corpus clears both frozen floors -> feasible');
  } finally {
    fs.rmSync(shortCorpus, { recursive: true, force: true });
    fs.rmSync(okCorpus, { recursive: true, force: true });
  }
});

test('stage1FreezeGold freezes the gold over an at-floor harvest and commits the acceptance rule with BYTE-IDENTICAL TAU references (NO SPEND)', () => {
  const survivors = [];

  for (let i = 0; i < 80; i += 1) {
    survivors.push(supportedSurvivor('cluster' + String(i).padStart(2, '0'), 3));
  }

  const corpus = writeCorpus({ run0: survivors });

  try {
    const stage0 = stage0FeasibilityProbe({ corpusDir: corpus });
    assert.equal(stage0.feasible, true, 'precondition: the harvest is feasible');

    const stage1 = stage1FreezeGold({ harvestResult: stage0.harvest });
    assert.equal(stage1.frozen.frozenAt, 'stage-1', 'the gold is frozen at the Stage-1 [HUMAN BLOCK] boundary');
    assert.ok(stage1.frozen.nCtrl >= LIVE_N_TARGETS.N_CTRL_FLOOR, 'the control arm is at-or-above floor');
    assert.ok(stage1.frozen.nTrap >= LIVE_N_TARGETS.N_TRAP_FLOOR, 'the trap arm is at-or-above floor');

    // The acceptance rule carries the FROZEN TAU references byte-identical -- NOT new thresholds (D-03).
    assert.equal(stage1.acceptanceRule.TAU_FU, EVAL_THRESHOLDS.TAU_FU, 'TAU_FU is byte-identical to EVAL_THRESHOLDS (0.10)');
    assert.equal(stage1.acceptanceRule.TAU_OR, EVAL_THRESHOLDS.TAU_OR, 'TAU_OR is byte-identical to EVAL_THRESHOLDS (0.15)');
    assert.equal(stage1.acceptanceRule.N_CTRL_FLOOR, EVAL_THRESHOLDS.N_CTRL_FLOOR, 'N_CTRL_FLOOR is byte-identical (24)');
    assert.equal(stage1.acceptanceRule.estimator, 'clopperPearsonUpperOneSided', 'the CP estimator is the frozen one-sided form');
    assert.match(stage1.acceptanceRule.optionalStopping, /forbidden/, 'optional stopping is forbidden (N frozen in advance)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// persistDualRunVote: the frozen resumable vote store + the required per-vote search trace (NO SPEND).
// ===========================================================================

test('persistDualRunVote requires the per-vote search trace and SKIPS an already-persisted vote (frozen resumable store, no spend)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-livecert-votes-'));

  try {
    // A trace-less vote is rejected by the frozen persistVote (the per-vote search trace is REQUIRED).
    assert.throws(
      () => persistDualRunVote(dir, { id: 'cluster0', verdict: 'unrefuted' }),
      (e) => e.name === 'ContractError',
      'a vote without a search trace is rejected (the frozen store requires it)',
    );

    const vote = { id: 'cluster0', verdict: 'unrefuted', trace: { queries: ['q0'], depth: 3, stop_reason: 'exhausted' } };
    const first = persistDualRunVote(dir, vote);
    assert.equal(first.persisted, true, 'the first write persists');

    const second = persistDualRunVote(dir, vote);
    assert.equal(second.skipped, true, 'a re-run SKIPS an already-persisted vote (resumable, D-08)');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ===========================================================================
// The frozen seams are IMPORTED, never redefined (anti-drift -- the byte-identity discipline).
// ===========================================================================

test('the orchestrator IMPORTS the frozen seams (certifyModel / decisionMatrix / clopperPearsonUpperOneSided / EVAL_THRESHOLDS), never redefines them', () => {
  const src = fs.readFileSync(new URL('./lz-eval-live-cert.mjs', import.meta.url), 'utf8');

  // IMPORTED (consumed byte-identical).
  assert.match(src, /import\s*\{[\s\S]*certifyModel[\s\S]*\}\s*from\s*'\.\/lz-eval-offline-read\.mjs'/, 'certifyModel is imported from the frozen offline-read seam');
  assert.match(src, /import\s*\{[\s\S]*clopperPearsonUpperOneSided[\s\S]*EVAL_THRESHOLDS[\s\S]*\}\s*from\s*'\.\/lz-eval-aggregate\.mjs'/, 'clopperPearsonUpperOneSided + EVAL_THRESHOLDS are imported from the frozen engine');

  // NEVER redefined (no local re-derivation of the frozen primitives).
  assert.ok(!/function\s+clopperPearson/.test(src), 'the CP estimator is NOT re-implemented locally');
  assert.ok(!/const\s+EVAL_THRESHOLDS\s*=\s*Object\.freeze/.test(src), 'EVAL_THRESHOLDS is NOT redefined locally');
  assert.ok(!/function\s+certifyModel/.test(src), 'certifyModel is NOT re-implemented locally');
});

test('the guarded CLI is present (importing the module does NOT run the CLI)', () => {
  const src = fs.readFileSync(new URL('./lz-eval-live-cert.mjs', import.meta.url), 'utf8');
  assert.match(src, /if\s*\(process\.argv\[1\]\s*&&\s*fileURLToPath\(import\.meta\.url\)\s*===\s*path\.resolve\(process\.argv\[1\]\)\)/, 'the guarded-CLI guard is present (import-safe)');
  // The eval-tree boundary statement is present (eval -> runtime, NEVER ships).
  assert.match(src, /NEVER (in the distributed|ships)|one-directional/, 'the eval-tree boundary statement is present');
});
