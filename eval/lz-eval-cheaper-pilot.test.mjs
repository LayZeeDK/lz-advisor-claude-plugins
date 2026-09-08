// lz-eval-cheaper-pilot.test.mjs
//
// FILE-form deterministic coverage for the NON-GATING cheaper-model PILOT (RE-PLAN-8, NO-SPEND;
// Task 5, DP7-DP10). Drives classifyCheaperRole + runCheaperPilot with deterministic STUB callModels
// (NO SPEND). Asserts the DISCRIMINATING behaviors from the plan's <behavior> block.
//
// HOST QUIRK (load-bearing, CLAUDE.md): on this host `node --test <dir>` spuriously exits 1 even when
// all tests pass; ALWAYS gate by the explicit FILE path:
//   node --test eval/lz-eval-cheaper-pilot.test.mjs
//
// Strictly ASCII, no BOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { classifyCheaperRole, runCheaperPilot, PILOT_THRESHOLDS } from './lz-eval-cheaper-pilot.mjs';
import { clopperPearsonUpperOneSided, EVAL_THRESHOLDS } from './lz-eval-aggregate.mjs';

// ---------------------------------------------------------------------------
// classifyCheaperRole -- the DP9 thresholds, one-sided CP, per-arm NOT n*k.
// ---------------------------------------------------------------------------

test('Task-5 DP9 classifyCheaperRole: 0/36 false-accepts + control CP clears + <=1 self-split + agreement>=62/66 -> decider (CP1s(0,36)=0.0798<=TAU_FU)', () => {
  // Anchor: CP1s(0,36) must be the engine value (prove the per-arm CP is wired).
  assert.ok(Math.abs(clopperPearsonUpperOneSided(0, 36) - 0.0798) < 1e-3, 'CP1s(0,36) ~= 0.0798');

  const role = classifyCheaperRole({
    falseAccepts: 0,
    nTrap: 36,
    falseVetoes: 1, // CP1s(1,30)=0.1486 <= TAU_OR 0.15 -> one over-refusal clears
    nCtrl: 30,
    selfConsistency: 1.0,
    frozenPairAgreement: 62,
    selfSplits: 1,
  });
  assert.equal(role, 'decider', '0 false-accepts + control CP clears + 1 self-split + 62/66 -> decider (amendment-only)');
});

test('Task-5 DP9 classifyCheaperRole: 1/36 false-accepts -> CP1s(1,36)=0.1251 > TAU_FU 0.10 -> NEVER decider (a 1-miss arm would need N>=46)', () => {
  assert.ok(clopperPearsonUpperOneSided(1, 36) > EVAL_THRESHOLDS.TAU_FU, 'CP1s(1,36) exceeds TAU_FU (one false-accept fails the decider trap bar)');

  const role = classifyCheaperRole({
    falseAccepts: 1,
    nTrap: 36,
    falseVetoes: 0,
    nCtrl: 30,
    selfConsistency: 1.0,
    frozenPairAgreement: 66,
    selfSplits: 0,
  });
  // With falseAccepts=1 it cannot be 'decider' (trap bar fails) and cannot be 'pre-filter'
  // (pre-filter requires falseAccepts===0). It still has agreement 66/66 + self-consistency 1.0 ->
  // 'diagnostic-annotator' (>=0.95 self-consistency AND >=60/66 agreement).
  assert.notEqual(role, 'decider', '1 false-accept is NEVER decider');
  assert.equal(role, 'diagnostic-annotator', 'a 1-false-accept but otherwise consistent + high-agreement model is a diagnostic-annotator');
});

test('Task-5 DP9 classifyCheaperRole: agreement>=62/66 + 0 false-accepts but a self-split (>1) -> pre-filter (not all decider sub-bars)', () => {
  const role = classifyCheaperRole({
    falseAccepts: 0,
    nTrap: 36,
    falseVetoes: 0,
    nCtrl: 30,
    selfConsistency: 0.9, // below the annotator 0.95, but agreement + 0 false-accepts qualify pre-filter
    frozenPairAgreement: 62,
    selfSplits: 3, // > DECIDER_MAX_SELF_SPLITS (1) -> NOT decider
  });
  assert.equal(role, 'pre-filter', 'agreement>=62 + 0 false-accepts but a self-split fails the decider -> pre-filter');
});

test('Task-5 DP9 classifyCheaperRole: control arm CP exceeds TAU_OR (2 over-refusals/30) blocks decider even at 0 false-accepts -> pre-filter', () => {
  // CP1s(2,30) > 0.15 -> control bar fails -> NOT decider; but 0 false-accepts + agreement 62 -> pre-filter.
  assert.ok(clopperPearsonUpperOneSided(2, 30) > EVAL_THRESHOLDS.TAU_OR, 'CP1s(2,30) exceeds TAU_OR (the control bar fails)');

  const role = classifyCheaperRole({
    falseAccepts: 0,
    nTrap: 36,
    falseVetoes: 2,
    nCtrl: 30,
    selfConsistency: 1.0,
    frozenPairAgreement: 62,
    selfSplits: 0,
  });
  assert.equal(role, 'pre-filter', '0 false-accepts + agreement>=62 but the control CP fails -> pre-filter (NOT decider)');
});

test('Task-5 DP9 classifyCheaperRole: self-consistency>=0.95 + agreement>=60/66 (but <62 or a false-accept) -> diagnostic-annotator', () => {
  const role = classifyCheaperRole({
    falseAccepts: 0,
    nTrap: 36,
    falseVetoes: 5,
    nCtrl: 30,
    selfConsistency: 0.97,
    frozenPairAgreement: 60, // >=60 (annotator) but <62 (pre-filter/decider)
    selfSplits: 0,
  });
  assert.equal(role, 'diagnostic-annotator', 'self-consistency>=0.95 + agreement>=60 but <62 -> diagnostic-annotator');
});

test('Task-5 DP9 classifyCheaperRole: below all bars -> none', () => {
  const role = classifyCheaperRole({
    falseAccepts: 3,
    nTrap: 36,
    falseVetoes: 8,
    nCtrl: 30,
    selfConsistency: 0.5,
    frozenPairAgreement: 40,
    selfSplits: 12,
  });
  assert.equal(role, 'none', 'a weak model on all axes -> none');
});

test('Task-5 DP8: classifyCheaperRole uses the PER-ARM packet CP, NEVER pooled over n*k (a 1-false-accept/36 model is NOT decider even if n*k would dilute it)', () => {
  // If the implementation (wrongly) pooled over n*k = 36*5 = 180, CP1s(1,180) ~= 0.026 <= 0.10 would
  // FALSELY clear the trap bar and the model could become 'decider'. The per-arm CP1s(1,36)=0.1251
  // > 0.10 forbids it. Assert the boundary the per-arm convention enforces.
  assert.ok(clopperPearsonUpperOneSided(1, 180) <= EVAL_THRESHOLDS.TAU_FU, 'CP1s(1, n*k=180) would WRONGLY clear -- the pooling pitfall');
  assert.ok(clopperPearsonUpperOneSided(1, 36) > EVAL_THRESHOLDS.TAU_FU, 'CP1s(1, 36) per-arm correctly FAILS');

  const role = classifyCheaperRole({
    falseAccepts: 1,
    nTrap: 36,
    falseVetoes: 0,
    nCtrl: 30,
    selfConsistency: 1.0,
    frozenPairAgreement: 66,
    selfSplits: 0,
  });
  assert.notEqual(role, 'decider', 'the per-arm packet CP (NOT n*k) keeps a 1-false-accept model out of decider');
});

// ---------------------------------------------------------------------------
// runCheaperPilot -- structure + the stability certificate + non-gating.
// ---------------------------------------------------------------------------

// Build n>=66 candidates: 36 traps (20 hard) + 30 controls, each { uid, expectedEntailment, hard }.
function makeCandidates() {
  const candidates = [];

  for (let i = 0; i < 36; i += 1) {
    candidates.push({ uid: 'trap-' + String(i).padStart(3, '0'), expectedEntailment: 'false', hard: i < 20 });
  }

  for (let i = 0; i < 30; i += 1) {
    candidates.push({ uid: 'ctrl-' + String(i).padStart(3, '0'), expectedEntailment: 'true', hard: false });
  }

  return candidates;
}

// A PERFECT deterministic stub: every model answers the gold direction (traps entails=false, controls
// entails=true), identical across k reshuffles -> 100% self-consistency, 0 false-accepts/vetoes.
function perfectCallModel(model, packet) {
  return String(packet.expectedEntailment) === 'true';
}

test('Task-5 runCheaperPilot: structure -- each measured model gets {falseAccepts,nTrap,falseVetoes,nCtrl,estimandA,estimandB,selfConsistency,selfSplits,frozenPairAgreement,role}; the frozen pair is the reference', async () => {
  const candidates = makeCandidates();
  const out = await runCheaperPilot({
    candidates,
    callModel: perfectCallModel,
    seed: 'pilot-seed',
    k: 5,
    nTrap: 36,
    nCtrl: 30,
  });

  assert.ok(out.perModel, 'perModel present');
  for (const m of ['gpt-5-mini', 'gemini-3.5-flash', 'gpt-5.4-mini']) {
    const pm = out.perModel[m];
    assert.ok(pm, 'measured model ' + m + ' present (default model list)');
    for (const key of ['falseAccepts', 'nTrap', 'falseVetoes', 'nCtrl', 'estimandA', 'estimandB', 'selfConsistency', 'selfSplits', 'frozenPairAgreement', 'role']) {
      assert.ok(Object.prototype.hasOwnProperty.call(pm, key), m + ' has ' + key);
    }
    assert.equal(pm.nTrap, 36, 'nTrap=36 (the pilot trap arm)');
    assert.equal(pm.nCtrl, 30, 'nCtrl=30 (the pilot control arm)');
    assert.ok(typeof pm.estimandA.cpUpper === 'number', 'estimandA.cpUpper is a number');
    assert.ok(typeof pm.estimandB.cpUpper === 'number', 'estimandB.cpUpper is a number');
  }
});

test('Task-5 DP10 stability certificate: frozen-pair 100% self-consistent -> stabilityCertificate.k1=true (k=1 main screen)', async () => {
  const candidates = makeCandidates();
  const out = await runCheaperPilot({ candidates, callModel: perfectCallModel, seed: 's', k: 5 });

  assert.equal(out.frozenPairSelfConsistency, 1.0, 'a deterministic frozen pair is 100% self-consistent');
  assert.equal(out.stabilityCertificate.k1, true, '100% self-consistency -> k1 certificate true (main gold-screen runs k=1)');
  assert.equal(out.stabilityCertificate.frozenPairSelfConsistency, 1.0, 'the certificate records the self-consistency');
});

test('Task-5 DP10 stability certificate: frozen-pair NOT 100% self-consistent -> stabilityCertificate.k1=false (main screen k>1)', async () => {
  const candidates = makeCandidates();
  // A flaky frozen pair: gpt-5.5 flips its vote on reshuffle index 2 for the first trap -> a self-split
  // on that packet -> frozenPairSelfConsistency < 1.0.
  const flaky = (model, packet, r) => {
    const base = String(packet.expectedEntailment) === 'true';

    if (model === 'gpt-5.5' && packet.uid === 'trap-000' && r === 2) {
      return !base; // flip -> the frozen pair member is not self-consistent on this packet
    }

    return base;
  };
  const out = await runCheaperPilot({ candidates, callModel: flaky, seed: 's', k: 5 });

  assert.ok(out.frozenPairSelfConsistency < 1.0, 'the flaky frozen pair is < 100% self-consistent');
  assert.equal(out.stabilityCertificate.k1, false, '<100% self-consistency -> k1 certificate false (main screen falls back to k>1)');
});

test('Task-5 non-gating: runCheaperPilot returns NO retain/membership signal (it cannot enter the assembler retain AND) and sets no gold freeze', async () => {
  const candidates = makeCandidates();
  const out = await runCheaperPilot({ candidates, callModel: perfectCallModel, seed: 's', k: 5 });

  assert.equal(out.gating, false, 'the pilot output is explicitly NON-GATING');
  assert.ok(!('retained' in out), 'no retain signal');
  assert.ok(!('retain' in out), 'no retain signal');
  assert.ok(!('membership' in out), 'no membership signal');
  // The pilot reports its OWN sample sizes, NOT a gold freeze decision.
  assert.deepEqual(out.sampleSizes, { nTrap: 36, nCtrl: 30, n: 66 }, 'the pilot reports its own 36/30 measurement sample (NOT the gold N_trap/N_ctrl freeze)');
  // No per-model field carries an N_trap/N_ctrl FREEZE or a retain decision.
  for (const m of Object.keys(out.perModel)) {
    assert.ok(!('N_trap_freeze' in out.perModel[m]) && !('freeze' in out.perModel[m]), m + ' carries no freeze decision');
  }
});

test('Task-5 reconciliation: runCheaperPilot consumes candidates read-only -- the candidates array is not mutated', async () => {
  const candidates = makeCandidates();
  const snapshot = JSON.stringify(candidates);
  await runCheaperPilot({ candidates, callModel: perfectCallModel, seed: 's', k: 5 });
  assert.equal(JSON.stringify(candidates), snapshot, 'the gold candidates are not mutated by the pilot');
});

test('Task-5 a false-accepting cheap model is measured (falseAccepts>0) and is NEVER classified decider', async () => {
  const candidates = makeCandidates();
  // gpt-5-mini calls ONE trap entails=true (a false-accept); others perfect.
  const stub = (model, packet) => {
    if (model === 'gpt-5-mini' && packet.uid === 'trap-000') {
      return true; // a false-accept on a trap (expected false)
    }

    return String(packet.expectedEntailment) === 'true';
  };
  const out = await runCheaperPilot({ candidates, callModel: stub, seed: 's', k: 5 });

  assert.equal(out.perModel['gpt-5-mini'].falseAccepts, 1, 'the false-accept is counted on the PACKET (1/36), not pooled over n*k');
  assert.notEqual(out.perModel['gpt-5-mini'].role, 'decider', 'a model with >=1 false-accept is NEVER decider (CP1s(1,36)=0.1251>0.10)');
  // The other measured models stay perfect.
  assert.equal(out.perModel['gemini-3.5-flash'].falseAccepts, 0, 'the other models are unaffected');
});

test('Task-5 PILOT_THRESHOLDS are pre-registered constants (n=66, 36/30, k=5, the DP9 agreement bars)', () => {
  assert.equal(PILOT_THRESHOLDS.N_TRAP, 36);
  assert.equal(PILOT_THRESHOLDS.N_CTRL, 30);
  assert.equal(PILOT_THRESHOLDS.K, 5);
  assert.equal(PILOT_THRESHOLDS.AGREEMENT_DENOMINATOR, 66);
  assert.equal(PILOT_THRESHOLDS.ANNOTATOR_AGREEMENT, 60);
  assert.equal(PILOT_THRESHOLDS.PREFILTER_AGREEMENT, 62);
  assert.equal(PILOT_THRESHOLDS.DECIDER_AGREEMENT, 62);
  assert.equal(PILOT_THRESHOLDS.ANNOTATOR_SELF_CONSISTENCY, 0.95);
});
