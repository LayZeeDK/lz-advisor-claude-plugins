// lz-eval-contrastive-screen.test.mjs
//
// FILE-form DISCRIMINATING coverage for the contrastive-screen harness + the PRE-REGISTERED
// SCREEN-PASS / DEMOTE decision (RE-PLAN-12, NO-SPEND; Task 8). Deterministic STUB callModels -- NO
// SPEND. Each test is mutation-proven per the plan's <behavior> block.
//
// HOST QUIRK (load-bearing, CLAUDE.md): on this host `node --test <dir>` spuriously exits 1 even when
// all tests pass; ALWAYS gate by the explicit FILE path:
//   node --test eval/lz-eval-contrastive-screen.test.mjs
//
// Strictly ASCII, no BOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  decideContrastiveScreen,
  runContrastiveScreen,
  MIN_CONTRASTIVE_ITEMS,
  FROZEN_PAIR,
} from './lz-eval-contrastive-screen.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// decideContrastiveScreen -- the PRE-REGISTERED rule, DISCRIMINATING across each leg.
// ---------------------------------------------------------------------------

test('Task-8 decideContrastiveScreen: gate iff guardPasses AND mcc>=0.5 AND mccLowerCI>0 AND permutationP<0.05 (DISCRIMINATING)', () => {
  // All four legs clear -> 'gate'.
  assert.equal(
    decideContrastiveScreen({ guardPasses: true, mcc: 0.7, mccLowerCI: 0.3, permutationP: 0.01 }),
    'gate',
    'all four legs clear -> gate',
  );

  // DISCRIMINATING: each leg, individually failed, forces 'demote'.
  assert.equal(decideContrastiveScreen({ guardPasses: false, mcc: 0.7, mccLowerCI: 0.3, permutationP: 0.01 }), 'demote', 'guardPasses=false -> demote');
  assert.equal(decideContrastiveScreen({ guardPasses: true, mcc: 0.49, mccLowerCI: 0.3, permutationP: 0.01 }), 'demote', 'mcc=0.49 (< 0.5) -> demote');
  assert.equal(decideContrastiveScreen({ guardPasses: true, mcc: 0.7, mccLowerCI: 0, permutationP: 0.01 }), 'demote', 'mccLowerCI=0 (not strictly > 0) -> demote');
  assert.equal(decideContrastiveScreen({ guardPasses: true, mcc: 0.7, mccLowerCI: 0.3, permutationP: 0.05 }), 'demote', 'permutationP=0.05 (not strictly < 0.05) -> demote');

  // The boundary: mcc EXACTLY 0.5 (>= clears) with the other legs clear -> 'gate'.
  assert.equal(decideContrastiveScreen({ guardPasses: true, mcc: 0.5, mccLowerCI: 1e-9, permutationP: 0.0499 }), 'gate', 'mcc===0.5 + lowerCI just > 0 + p just < 0.05 -> gate (>= / strict-> boundaries)');
});

test('Task-8 decideContrastiveScreen: never tunes the bar (a non-number / NaN fails closed)', () => {
  assert.throws(() => decideContrastiveScreen({ guardPasses: true, mcc: NaN, mccLowerCI: 0.3, permutationP: 0.01 }), (e) => e.name === 'ContractError', 'a NaN mcc fails closed');
  assert.throws(() => decideContrastiveScreen({ guardPasses: 'yes', mcc: 0.7, mccLowerCI: 0.3, permutationP: 0.01 }), (e) => e.name === 'ContractError', 'a non-boolean guardPasses fails closed');
});

// ---------------------------------------------------------------------------
// STUB callModel: a gold-blind entailment judge. It parses the rendered batched prompt (the opaque ids
// + EVIDENCE/CLAIM blocks), looks up a per-claim ground-truth (keyed by a marker in the claim text), and
// emits the DP2 JSON array. It reads ONLY the prompt -- never the expectedEntailment (gold-blind).
// ---------------------------------------------------------------------------

function parsePromptItems(promptText) {
  const afterItems = promptText.split('\nITEMS:\n')[1] || '';
  const blocks = afterItems.split('\n\n').filter((b) => b.trim().length > 0);
  const items = [];

  for (const b of blocks) {
    const lines = b.split('\n');
    const idLine = lines.find((l) => /^(p[0-9a-f]+)\)$/.test(l.trim()));
    const idMatch = idLine ? idLine.trim().match(/^(p[0-9a-f]+)\)$/) : null;

    if (!idMatch) {
      continue;
    }

    const claimLine = lines.find((l) => l.startsWith('CLAIM: '));
    const claim = claimLine ? claimLine.slice('CLAIM: '.length) : '';
    items.push({ opaque: idMatch[1], claim });
  }

  return items;
}

// A judge that returns entails = (the claim contains 'TRUTHY'). The DEMOTE-by-guard fixtures encode the
// GROUND TRUTH in the claim text via a TRUTHY/FALSY marker so the stub is gold-blind (it never sees
// gold/expected). Used where a recurring class marker is INTENTIONAL (the artifact fixtures).
function makeJudgeStub() {
  return async function callModel(_model, promptText) {
    const items = parsePromptItems(promptText);
    const objs = items.map(({ opaque, claim }) => ({ id: opaque, entails: /TRUTHY/.test(claim), reason: 'stub' }));

    // Emit in reverse to prove de-mapping by opaque id, not position.
    return JSON.stringify(objs.reverse());
  };
}

// A SEMANTIC judge (the GATE path): entails iff the claim's leading entity matches the evidence's
// leading entity (the entity ORDER is the semantic label -- invisible to a bag-of-words guard because
// both claims carry the SAME tokens, only re-ordered). The stub reads the rendered prompt's EVIDENCE +
// CLAIM blocks only (gold-blind). This lets the GATE fixture be artifact-free (the guard passes) while
// the OOF stub still judges every item perfectly.
function makeSemanticJudgeStub() {
  const leadEntity = (text) => {
    const m = text.toLowerCase().match(/\b(alpha|beta)\b/);

    return m ? m[1] : '';
  };

  return async function callModel(_model, promptText) {
    // Parse each item's opaque id + its EVIDENCE block + its CLAIM.
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
      // The evidence lines are the '- ...' bullets between 'EVIDENCE:' and 'CLAIM:'.
      const evidenceLines = lines.filter((l) => l.startsWith('- '));
      const evidence = evidenceLines.join(' ');

      // entails iff the claim leads with the SAME entity the evidence leads with (the semantic relation).
      objs.push({ id: idMatch[1], entails: leadEntity(claim) === leadEntity(evidence), reason: 'semantic-stub' });
    }

    return JSON.stringify(objs.reverse());
  };
}

// A perfect-judgment contrastive corpus: each SUPPORTED claim carries TRUTHY (it entails its evidence)
// and each REFUTED claim carries FALSY (it does not). Artifact-free per the guard (the TRUTHY/FALSY
// marker is the SEMANTIC label, but we keep claim text otherwise per-pair-symmetric so the guard's
// leave-one-pair-out log-odds finds no systematic class token beyond the marker; we deliberately make
// the guard pass by using per-pair-unique markers so the lexical/claim baselines stay at chance).
//
// NOTE: for the GATE path we need BOTH guardPasses=true AND a strong OOF MCC. The OOF stub keys on
// TRUTHY/FALSY; the GUARD keys on systematic class tokens. To make the guard pass we must NOT let
// TRUTHY/FALSY be a systematic class token -- so we inject a per-pair-unique nonce alongside, and the
// guard fixture below is a SEPARATE artifact-free corpus. For the gate test we instead STUB the guard
// indirectly: we use an artifact-free claim/evidence body and place the TRUTHY/FALSY marker only where
// the OOF stub reads it; since the guard sees the SAME tokens, we keep the marker constant across both
// classes' surface and vary only a semantic nonce -- see gatePairs below.

// GATE fixture: artifact-free body (the guard passes) + a per-item OOF ground-truth the SEMANTIC stub
// reads from the entity ORDER. The SUPPORTED claim leads with the SAME entity the evidence leads with
// ('alpha rose more than beta' over evidence 'alpha exceeded beta'); the REFUTED claim swaps the order
// ('beta rose more than alpha'). Both claims carry the SAME bag of tokens (only re-ordered), so the
// leave-one-pair-out log-odds guard finds NO systematic class token -> guardPasses=true. The semantic
// stub judges each item perfectly from the entity order -> a perfect OOF MCC. Together: GATE.
function gatePairs() {
  const topics = ['region', 'sector', 'market', 'district', 'cohort', 'sample', 'county', 'province', 'zone', 'area', 'unit', 'group'];
  const pairs = [];

  for (let i = 0; i < 12; i += 1) {
    const t = topics[i % topics.length];
    // The evidence leads with alpha (alpha exceeded beta). The supported claim leads with alpha (matches
    // -> entails true). The refuted claim leads with beta (swapped -> entails false). Same token bag.
    const evidence = ['In the ' + t + ' alpha exceeded beta over the period.'];
    pairs.push({
      supported: { id: 'sup-' + i, claim: 'alpha rose more than beta in the ' + t, evidence },
      refuted: { id: 'ref-' + i, claim: 'beta rose more than alpha in the ' + t, evidence },
    });
  }

  return pairs;
}

// DEMOTE-by-guard fixture: a CLAIM-SIDE artifact (every supported claim carries a recurring class token
// 'supportedtoken') so the dual-baseline guard FAILS -> decision must be 'demote' regardless of the OOF
// MCC. The OOF stub still judges perfectly (TRUTHY/FALSY), so this isolates the guard-first behavior.
function demoteByGuardPairs() {
  const pairs = [];

  for (let i = 0; i < 12; i += 1) {
    const subject = 'study ' + i + ' region alpha beta gamma metric value sample cohort baseline period';
    const evidence = ['The cohort report for case ' + i + ' lists the metric and the period.'];
    pairs.push({
      supported: { id: 'sup-' + i, claim: subject + ' supportedtoken TRUTHY the value rose', evidence },
      refuted: { id: 'ref-' + i, claim: subject + ' FALSY the value rose', evidence },
    });
  }

  return pairs;
}

// ---------------------------------------------------------------------------
// runContrastiveScreen -- structure + the gate / demote labels + provisional ALWAYS true.
// ---------------------------------------------------------------------------

test('Task-8 runContrastiveScreen GATE: guard passes + perfect OOF MCC -> SCREEN-PASS, provisional===true (DISCRIMINATING)', async () => {
  const pairs = gatePairs();
  const out = await runContrastiveScreen({ pairs, callModel: makeSemanticJudgeStub(), score: () => {} });

  // The dual-baseline guard ran FIRST and passed (the body is artifact-free).
  assert.equal(out.dualBaselineGuard.guardPasses, true, 'the dual-baseline guard passed (artifact-free body)');

  // A perfect OOF judgment -> MCC 1 -> all four legs clear -> 'gate'.
  assert.equal(out.decision, 'gate', 'guard passes + perfect OOF MCC -> gate');
  assert.equal(out.label, 'SCREEN-PASS', 'gate -> label SCREEN-PASS');
  assert.equal(out.provisional, true, 'provisional is ALWAYS true -- the offline read is PROVISIONAL-for-WORKS (offline NEVER WORKS)');
  assert.equal(out.trapOnly, false, 'a gate does NOT revert to trap-only');
  assert.equal(out.diagnosticOnly, false, 'N >= 24 -> not diagnostic-only');
  assert.ok(out.mcc >= 0.5 && out.mccLowerCI > 0 && out.permutationP < 0.05, 'the MCC bar legs all cleared');
});

test('Task-8 runContrastiveScreen DEMOTE-by-guard: a claim-side artifact -> guard fails -> PROVISIONAL + trap-only (DISCRIMINATING)', async () => {
  const pairs = demoteByGuardPairs();
  const out = await runContrastiveScreen({ pairs, callModel: makeJudgeStub(), score: () => {} });

  // The guard ran FIRST and FAILED (the claim-side artifact separates) -> demote regardless of OOF MCC.
  assert.equal(out.dualBaselineGuard.guardPasses, false, 'the dual-baseline guard FAILED (claim-side artifact)');
  assert.equal(out.dualBaselineGuard.claimOnlyAtChance, false, 'the claim-only baseline separated the pair (F3)');
  assert.equal(out.decision, 'demote', 'a guard fail forces demote even when the OOF MCC would clear');
  assert.equal(out.label, 'PROVISIONAL', 'demote -> label PROVISIONAL');
  assert.equal(out.provisional, true, 'provisional is ALWAYS true on demote too');
  assert.equal(out.trapOnly, true, 'demote -> offline reverts to trap-only');
  assert.equal(out.explicitlyIncomplete, true, 'demote -> the MCC/over-refusal verdict defers to the live stage (explicitly incomplete)');
});

test('Task-8 runContrastiveScreen: the dual-baseline guard RUNS FIRST (a guard fail forces demote regardless of MCC)', async () => {
  // The guard-fail fixture would yield a perfect OOF MCC (the stub judges TRUTHY/FALSY correctly), yet
  // the decision is 'demote' -- proving the guard runs first and short-circuits the gate.
  const pairs = demoteByGuardPairs();
  const out = await runContrastiveScreen({ pairs, callModel: makeJudgeStub(), score: () => {} });
  assert.equal(out.dualBaselineGuard.guardPasses, false, 'guard failed');
  // The raw OOF MCC over the verdicts would still be high (the stub is a perfect judge) -- prove it.
  assert.ok(out.mcc >= 0.5, 'the OOF MCC alone would have cleared the bar (mcc=' + out.mcc + ') -- but the guard forced demote');
  assert.equal(out.decision, 'demote', 'the guard-first short-circuit forced demote');
});

// ---------------------------------------------------------------------------
// NO asymmetric criterion -- the SAME strict makeBatchedOofProbe contract on both arms.
// ---------------------------------------------------------------------------

test('Task-8 NO asymmetric criterion: the screen uses the single makeBatchedOofProbe contract on both arms', () => {
  const src = fs.readFileSync(path.join(HERE, 'lz-eval-contrastive-screen.mjs'), 'utf8');

  // The module imports + composes the carried makeBatchedOofProbe + runProbeConsensus -- the SAME strict
  // all-agree screen as the trap arm (NO separate looser path for the SUPPORTED items).
  assert.ok(/import\s+\{\s*makeBatchedOofProbe\s*\}\s+from\s+'\.\/lz-eval-oof-batch\.mjs'/.test(src), 'the screen reuses the carried makeBatchedOofProbe');
  assert.ok(/import\s+\{\s*runProbeConsensus\s*\}\s+from\s+'\.\/lz-eval-trap-assembler\.mjs'/.test(src), 'the screen reuses the carried runProbeConsensus consensus');

  // DISCRIMINATING: there is exactly ONE consensus path (a single runProbeConsensus call in the item
  // loop), NOT a branched looser criterion for SUPPORTED vs REFUTED items.
  const consensusCalls = (src.match(/runProbeConsensus\(/g) || []).length;
  assert.equal(consensusCalls, 1, 'exactly ONE runProbeConsensus call (the SAME strict screen on both arms, no asymmetric branch)');
  assert.ok(!/SUPPORTED[\s\S]{0,80}looser|looser[\s\S]{0,80}SUPPORTED/i.test(src), 'no looser-criterion-for-supported branch');
});

// ---------------------------------------------------------------------------
// N < 24 -> diagnostic-only (DISCRIMINATING).
// ---------------------------------------------------------------------------

test('Task-8 N<24 -> diagnostic-only (decision can NEVER be gate) (DISCRIMINATING)', async () => {
  // 6 pairs = 12 items < MIN_CONTRASTIVE_ITEMS (24). Even with a perfect OOF MCC + guard pass, the
  // interval is non-informative -> diagnostic-only -> decision forced to 'demote' (never gate).
  const pairs = gatePairs().slice(0, 6); // 12 items
  const out = await runContrastiveScreen({ pairs, callModel: makeSemanticJudgeStub(), score: () => {} });

  assert.equal(out.diagnosticOnly, true, 'fewer than 24 items -> diagnostic-only');
  assert.equal(out.decision, 'demote', 'a diagnostic-only corpus can NEVER gate');
  assert.equal(out.label, 'PROVISIONAL', 'diagnostic-only -> PROVISIONAL');

  // DISCRIMINATING: the FULL 12-pair corpus (24 items) with the SAME stub DOES gate -- proving the
  // diagnostic-only flag is the N-floor, not a always-demote bug.
  const full = await runContrastiveScreen({ pairs: gatePairs(), callModel: makeSemanticJudgeStub(), score: () => {} });
  assert.equal(full.diagnosticOnly, false, 'the full 24-item corpus is NOT diagnostic-only');
  assert.equal(full.decision, 'gate', 'the full 24-item corpus gates (the N-floor is the only difference)');

  assert.equal(MIN_CONTRASTIVE_ITEMS, 24, 'the N floor is 24 (12 pairs)');
});

test('Task-8 the FROZEN_PAIR is the OOF gold-decider identity (byte-identical)', () => {
  assert.deepEqual(FROZEN_PAIR, ['gpt-5.5', 'gemini-3.1-pro-preview'], 'the frozen OOF pair is byte-identical to the decider identity');
});

test('Task-8 the module source is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(path.join(HERE, 'lz-eval-contrastive-screen.mjs'));

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'lz-eval-contrastive-screen.mjs byte at offset ' + i + ' must be ASCII (<= 0x7F), got 0x' + buf[i].toString(16));
  }
});
