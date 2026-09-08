// lz-eval-contrastive-authoring.test.mjs
//
// FILE-form DISCRIMINATING coverage for the ARM-A contrastive minimal-pair AUTHORING + adjudication
// harness + the construct-validity verdict (Plan 20-06, Task 1; D-21 / CERTIFY-WORKS-BOARD-DECISION.md,
// NO-SPEND). Deterministic STUB callModel -- ZERO spend. Each test is mutation-proven per the plan's
// <behavior> block.
//
// HOST QUIRK (load-bearing, CLAUDE.md): on this host `node --test <dir>` spuriously exits 1 even when
// all tests pass; ALWAYS gate by the explicit FILE path:
//   node --test eval/lz-eval-contrastive-authoring.test.mjs
//
// Strictly ASCII, no BOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  authorContrastivePair,
  authorContrastivePairs,
  adjudicateContrastivePairs,
  constructValidityVerdict,
  isUnderpowered,
  MIN_TRAP_PAIRS,
  FROZEN_PAIR,
  ARM_A_SEED,
  ARM_A_SEED_PAIRS,
} from './lz-eval-contrastive-authoring.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// A REAL-CLASS dense bundle fixture (the harvest denseTrapMonitor member shape) with an authored overclaim
// (the minimal truth-value flip the SAME evidence does NOT entail). Uids are ':'-free (Windows constraint).
// ---------------------------------------------------------------------------
function denseBundle(i) {
  return {
    uid: 'rundir-a::cluster-' + i,
    claim: 'The measured value in cohort ' + i + ' rose by about twelve percent over the reporting period.',
    overclaim: 'The measured value in cohort ' + i + ' rose by more than twelve hundred percent over the reporting period.',
    evidence: [
      'The cohort ' + i + ' report recorded a baseline value at the start of the period.',
      'The same report recorded a follow-up value about twelve percent higher at the end of the period.',
    ],
    corroboration_lower_bound: 3,
  };
}

// ---------------------------------------------------------------------------
// (1) authorContrastivePair flips ONLY the truth-value + carries source_uid (gate (d) provenance).
// ---------------------------------------------------------------------------

test('Task-1 authorContrastivePair: SUPPORTED is the real bundle, REFUTED flips only the truth-value, BOTH carry source_uid (DISCRIMINATING)', () => {
  const b = denseBundle(7);
  const pair = authorContrastivePair(b);

  // The SUPPORTED side is the real bundle (gold unrefuted at adjudication); the REFUTED side is the
  // authored overclaim. The EVIDENCE is IDENTICAL on both sides (only the claim truth-value flips).
  assert.equal(pair.supported.claim, b.claim, 'SUPPORTED claim is the real bundle claim');
  assert.equal(pair.refuted.claim, b.overclaim, 'REFUTED claim is the authored overclaim (the truth-value flip)');
  assert.deepEqual(pair.supported.evidence, b.evidence, 'SUPPORTED evidence is the real bundle evidence');
  assert.deepEqual(pair.refuted.evidence, b.evidence, 'REFUTED evidence is IDENTICAL (only the claim flips, not the evidence)');

  // gate (d): the provenance source_uid is the real bundle uid on the pair AND both members.
  assert.equal(pair.source_uid, b.uid, 'the pair carries source_uid = the real bundle uid');
  assert.equal(pair.supported.source_uid, b.uid, 'the SUPPORTED member carries source_uid');
  assert.equal(pair.refuted.source_uid, b.uid, 'the REFUTED member carries source_uid');
});

test('Task-1 authorContrastivePair: gate (d) fails closed -- a bundle without a uid is rejected (no synthetic-from-scratch)', () => {
  const noUid = { claim: 'x rose by twelve percent over the long reporting period this season', overclaim: 'x rose by twelve hundred percent over the long reporting period this season', evidence: ['e'] };
  assert.throws(() => authorContrastivePair(noUid), (e) => e.name === 'ContractError', 'a bundle missing a uid is rejected (gate (d) minimal-edit-from-a-real-bundle)');
});

test('Task-1 authorContrastivePair: the refuted overclaim must clear the MIN_COMPLEXITY_TOKENS floor (no pass-by-style)', () => {
  const tooShort = { uid: 'rundir-a::c1', claim: 'The measured value rose by about twelve percent this period overall.', overclaim: 'It tripled.', evidence: ['e'], corroboration_lower_bound: 2 };
  assert.throws(() => authorContrastivePair(tooShort), (e) => e.name === 'ContractError', 'a trivially-short overclaim (< 12 tokens) is rejected');
});

// ---------------------------------------------------------------------------
// (2) adjudicateContrastivePairs runs the all-agree gold-blind consensus over a STUB callModel with ZERO
//     spend + the gold direction NEVER appears in the rendered packet prompt.
// ---------------------------------------------------------------------------

// A SEMANTIC gold-blind judge keyed on a recoverable signal in the rendered prompt: it entails iff the
// CLAIM contains 'about twelve percent' (the SUPPORTED phrasing) and does NOT contain a clear overclaim
// magnitude ('hundred percent' / 'tripled' / 'eliminated'). It reads ONLY the prompt -- never the
// expectedEntailment (gold-blind). Captures every rendered prompt for the gold-leak assertion.
function makeArmAJudgeStub(capturedPrompts) {
  return async function callModel(_model, promptText) {
    if (Array.isArray(capturedPrompts)) {
      capturedPrompts.push(promptText);
    }

    const afterItems = promptText.split('\nITEMS:\n')[1] || '';
    const blocks = afterItems.split('\n\n').filter((b) => b.trim().length > 0);
    const objs = [];

    for (const b of blocks) {
      const lines = b.split('\n');
      const idLine = lines.find((l) => /^(p[0-9a-f]+)\)$/.test(l.trim()));
      const idMatch = idLine ? idLine.trim().match(/^(p[0-9a-f]+)\)$/) : null;

      if (!idMatch) {
        continue;
      }

      const claimLine = lines.find((l) => l.startsWith('CLAIM: '));
      const claim = claimLine ? claimLine.slice('CLAIM: '.length) : '';
      // The overclaim carries 'hundred percent' (an exaggerated magnitude the evidence does not entail);
      // the SUPPORTED claim carries 'about twelve percent'. The judge entails ONLY the supported phrasing.
      const isOverclaim = /hundred percent/.test(claim);
      objs.push({ id: idMatch[1], entails: !isOverclaim, reason: 'arm-a-stub' });
    }

    return JSON.stringify(objs.reverse());
  };
}

test('Task-1 adjudicateContrastivePairs: all-agree gold-blind over a STUB -> SUPPORTED upheld, REFUTED caught, ZERO false-upholds, ZERO spend (DISCRIMINATING)', async () => {
  const bundles = [];

  for (let i = 0; i < 12; i += 1) {
    bundles.push(denseBundle(i));
  }

  const pairs = authorContrastivePairs(bundles);
  const captured = [];
  const out = await adjudicateContrastivePairs({ pairs, callModel: makeArmAJudgeStub(captured), score: () => {}, stub: true });

  // 12 pairs -> 24 items; the stub judges every item correctly.
  assert.equal(out.verdicts.length, 24, '24 items adjudicated (12 pairs)');
  assert.equal(out.gold.length, 24, '24 gold labels');

  // Every item retained (the OOF pair all-agrees on the correct entailment direction).
  assert.equal(out.retainedCount, 24, 'all 24 items retained (the all-agree gold-blind consensus matched gold)');

  // A perfect judge -> ZERO false-upholds (a REFUTED-gold item upheld). This is arm A's catastrophic event.
  assert.equal(out.falseUpholds, 0, 'a perfect judge yields ZERO false-upholds (arm A clears TAU_FU at 0)');

  // DISCRIMINATING: the verdicts exactly match the gold (SUPPORTED -> unrefuted, REFUTED -> refuted).
  for (let i = 0; i < out.verdicts.length; i += 1) {
    assert.equal(out.verdicts[i], out.gold[i], 'verdict ' + i + ' matches gold');
  }
});

test('Task-1 adjudicateContrastivePairs: the GOLD DIRECTION (expectedEntailment) NEVER appears in the rendered packet prompt (gold-blind)', async () => {
  const bundles = [denseBundle(0), denseBundle(1)];
  const pairs = authorContrastivePairs(bundles);
  const captured = [];
  await adjudicateContrastivePairs({ pairs, callModel: makeArmAJudgeStub(captured), score: () => {}, stub: true });

  assert.ok(captured.length > 0, 'at least one prompt was rendered');

  for (const prompt of captured) {
    // The gold direction lives ONLY in the downstream consensus compare -- it is NEVER rendered.
    assert.ok(!/expectedEntailment/.test(prompt), 'the rendered prompt never contains the literal expectedEntailment key');
    assert.ok(!/gold\s*[:=]\s*(unrefuted|refuted)/.test(prompt), 'the rendered prompt never contains the gold label');
    // The packet rubric asks the model to decide entailment -- it must NOT be told the answer per item.
    assert.ok(!/the (supported|refuted) side/i.test(prompt), 'the rendered prompt never names the supported/refuted side');
  }
});

test('Task-1 adjudicateContrastivePairs: a false-uphold IS counted when the judge wrongly upholds a REFUTED item (DISCRIMINATING)', async () => {
  const bundles = [denseBundle(0), denseBundle(1)];
  const pairs = authorContrastivePairs(bundles);

  // A degenerate ALWAYS-UPHOLD judge: entails=true for every item (it upholds the overclaims too).
  const alwaysUphold = async (_model, promptText) => {
    const afterItems = promptText.split('\nITEMS:\n')[1] || '';
    const blocks = afterItems.split('\n\n').filter((b) => b.trim().length > 0);
    const objs = [];

    for (const b of blocks) {
      const lines = b.split('\n');
      const idLine = lines.find((l) => /^(p[0-9a-f]+)\)$/.test(l.trim()));
      const idMatch = idLine ? idLine.trim().match(/^(p[0-9a-f]+)\)$/) : null;

      if (idMatch) {
        objs.push({ id: idMatch[1], entails: true, reason: 'always-uphold' });
      }
    }

    return JSON.stringify(objs);
  };

  const out = await adjudicateContrastivePairs({ pairs, callModel: alwaysUphold, score: () => {}, stub: true });

  // 2 pairs -> 2 REFUTED items, all wrongly upheld -> 2 false-upholds (the always-uphold judge fails arm A).
  assert.equal(out.falseUpholds, 2, 'the always-uphold judge yields 2 false-upholds (the catastrophic arm-A event)');
});

// ---------------------------------------------------------------------------
// (3) constructValidityVerdict requires ALL THREE gates (d, a, b).
// ---------------------------------------------------------------------------

test('Task-1 constructValidityVerdict: constructValid iff minimalEdit AND lexicalGatePass AND difficultyGatePass (DISCRIMINATING)', () => {
  const pairs = authorContrastivePairs([denseBundle(0), denseBundle(1)]);

  // All three gates pass -> constructValid -> works-eligible.
  const all = constructValidityVerdict({ pairs, lexicalAuc: 0.52, lexicalGatePass: true, notEasier: true });
  assert.equal(all.minimalEdit, true, 'every pair carries source_uid -> minimalEdit');
  assert.equal(all.lexicalGatePass, true, 'gate (a) lexical AUC pass');
  assert.equal(all.difficultyGatePass, true, 'gate (b) not-easier pass');
  assert.equal(all.constructValid, true, 'all three gates -> constructValid');
  assert.equal(all.certScope, 'works-eligible', 'constructValid -> works-eligible');

  // DISCRIMINATING: each gate, individually failed, forces constructValid=false + certScope='scoped'.
  assert.equal(constructValidityVerdict({ pairs, lexicalGatePass: false, notEasier: true }).constructValid, false, 'gate (a) fail -> not constructValid');
  assert.equal(constructValidityVerdict({ pairs, lexicalGatePass: true, notEasier: false }).constructValid, false, 'gate (b) fail -> not constructValid');
  assert.equal(constructValidityVerdict({ pairs, lexicalGatePass: false, notEasier: false }).certScope, 'scoped', 'any gate fail -> scoped');
});

test('Task-1 constructValidityVerdict: gate (d) fails CLOSED when a pair lacks source_uid (no synthetic-from-scratch)', () => {
  // A synthetic pair fabricated without provenance (no source_uid anywhere).
  const synthetic = [{ supported: { claim: 'a' }, refuted: { claim: 'b' } }];
  const v = constructValidityVerdict({ pairs: synthetic, lexicalGatePass: true, notEasier: true });
  assert.equal(v.minimalEdit, false, 'a pair missing source_uid fails minimalEdit closed');
  assert.equal(v.constructValid, false, 'no minimalEdit -> not constructValid even with (a) + (b) passing');
});

// ---------------------------------------------------------------------------
// (4) MIN_TRAP_PAIRS=30 + an under-30 set flags underpowered.
// ---------------------------------------------------------------------------

test('Task-1 MIN_TRAP_PAIRS=30 frozen + an under-30 set is underpowered (CP-upper(0/12) > TAU_FU 0.10) (DISCRIMINATING)', () => {
  assert.equal(MIN_TRAP_PAIRS, 30, 'the arm-A floor is 30 (the 12-trap seed is underpowered for TAU_FU 0.10)');

  // 12 pairs -> underpowered; 30 pairs -> powered.
  const twelve = authorContrastivePairs(ARM_A_SEED.slice(0, 12));
  assert.equal(isUnderpowered(twelve), true, '12 pairs is underpowered (< MIN_TRAP_PAIRS)');

  const thirty = authorContrastivePairs(ARM_A_SEED.slice(0, 30));
  assert.equal(isUnderpowered(thirty), false, '30 pairs is powered (>= MIN_TRAP_PAIRS)');
});

// ---------------------------------------------------------------------------
// (5) the committed seed is >= 30 pairs (arm A clears CP-upper(0/30) <= TAU_FU 0.10).
// ---------------------------------------------------------------------------

test('Task-1 the committed arm-A seed is >= MIN_TRAP_PAIRS pairs (the 12-trap seed EXPANDED to >= 30)', () => {
  assert.ok(ARM_A_SEED.length >= MIN_TRAP_PAIRS, 'the committed seed carries >= 30 dense bundles (got ' + ARM_A_SEED.length + ')');
  assert.ok(ARM_A_SEED_PAIRS.length >= MIN_TRAP_PAIRS, 'the authored seed pairs are >= 30 (got ' + ARM_A_SEED_PAIRS.length + ')');
  assert.equal(isUnderpowered(ARM_A_SEED_PAIRS), false, 'the committed seed is powered (not underpowered)');

  // Every seed pair is a real minimal-edit-from-a-real-bundle (gate (d) provenance on the committed set).
  for (const pair of ARM_A_SEED_PAIRS) {
    assert.ok(typeof pair.source_uid === 'string' && pair.source_uid.length > 0, 'each seed pair carries source_uid');
    assert.ok(pair.refuted.claim !== pair.supported.claim, 'each seed pair flips the claim truth-value (refuted != supported)');
  }
});

test('Task-1 the seed uids are colon-free (Windows vote-store filename constraint, only the :: qualifier separates)', () => {
  for (const b of ARM_A_SEED) {
    const withoutQualifier = b.uid.split('::').join('');
    assert.ok(!withoutQualifier.includes(':'), 'uid ' + b.uid + ' carries no bare colon (only the :: qualifier)');
  }
});

// ---------------------------------------------------------------------------
// (6) requireSpend throws on a real-dispatch path with LZ_SPEND unset (the LZ_SPEND hard-guard).
// ---------------------------------------------------------------------------

test('Task-1 adjudicateContrastivePairs: a real-dispatch path (stub !== true) THROWS unless LZ_SPEND=1 (the spend hard-guard)', async () => {
  const pairs = authorContrastivePairs([denseBundle(0)]);
  const neverCalled = async () => {
    throw new Error('the stub callModel must NEVER be reached -- requireSpend must throw FIRST');
  };

  // LZ_SPEND is NOT set in the test environment -> the real-dispatch path (no stub flag) must throw.
  assert.equal(process.env.LZ_SPEND, undefined, 'the test runs with LZ_SPEND unset (zero spend)');

  await assert.rejects(
    () => adjudicateContrastivePairs({ pairs, callModel: neverCalled }),
    (e) => e.name === 'ContractError' && /LZ_SPEND/.test(e.message),
    'the real-dispatch path calls requireSpend(callOof) FIRST and throws unless LZ_SPEND=1',
  );
});

// ---------------------------------------------------------------------------
// The frozen OOF pair is consumed byte-identical (IMPORTED, not re-authored).
// ---------------------------------------------------------------------------

test('Task-1 FROZEN_PAIR is the OOF gold-decider identity byte-identical (IMPORTED, not re-authored)', () => {
  assert.deepEqual(FROZEN_PAIR, ['gpt-5.5', 'gemini-3.1-pro-preview'], 'the frozen OOF pair is byte-identical to the decider identity');

  // Source-level: the frozen seams are IMPORTED (consumed byte-identical), never re-authored.
  const src = fs.readFileSync(path.join(HERE, 'lz-eval-contrastive-authoring.mjs'), 'utf8');
  assert.ok(/import\s+\{\s*makeBatchedOofProbe\s*\}\s+from\s+'\.\/lz-eval-oof-batch\.mjs'/.test(src), 'makeBatchedOofProbe is IMPORTED');
  assert.ok(/import\s+\{\s*runProbeConsensus\s*\}\s+from\s+'\.\/lz-eval-trap-assembler\.mjs'/.test(src), 'runProbeConsensus is IMPORTED');
  assert.ok(/FROZEN_OOF_PAIR[\s\S]{0,40}requireSpend[\s\S]{0,60}from\s+'\.\/lz-eval-live-cert\.mjs'/.test(src) || /import\s+\{\s*FROZEN_OOF_PAIR,\s*requireSpend\s*\}\s+from\s+'\.\/lz-eval-live-cert\.mjs'/.test(src), 'FROZEN_OOF_PAIR + requireSpend are IMPORTED from lz-eval-live-cert.mjs');
});

// ---------------------------------------------------------------------------
// The module source is strictly ASCII (committed bytes, CLAUDE.md).
// ---------------------------------------------------------------------------

test('Task-1 the module source is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(path.join(HERE, 'lz-eval-contrastive-authoring.mjs'));

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'lz-eval-contrastive-authoring.mjs byte at offset ' + i + ' must be ASCII (<= 0x7F), got 0x' + buf[i].toString(16));
  }
});
