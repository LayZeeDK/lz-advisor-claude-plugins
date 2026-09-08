// lz-eval-oof-batch.test.mjs
//
// FILE-form deterministic coverage for the BATCHED OUT-OF-FAMILY probe adapter + the contamination
// gate (RE-PLAN-8, NO-SPEND; Task 4, DP1-DP4). Drives makeBatchedOofProbe + runContaminationGate
// with deterministic STUB callModels (NO SPEND). Asserts the DISCRIMINATING behaviors from the plan's
// <behavior> block.
//
// HOST QUIRK (load-bearing, CLAUDE.md): on this host `node --test <dir>` spuriously exits 1 even when
// all tests pass; ALWAYS gate by the explicit FILE path:
//   node --test eval/lz-eval-oof-batch.test.mjs
//
// Strictly ASCII, no BOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  makeBatchedOofProbe,
  runContaminationGate,
  packBatches,
  packetIdentity,
  renderBatchedPrompt,
  RUBRIC_PREAMBLE,
} from './lz-eval-oof-batch.mjs';
import { sliceByIdEntails } from './lz-eval-oof-batch-parse.mjs';
import { runProbeConsensus } from './lz-eval-trap-assembler.mjs';

// ---------------------------------------------------------------------------
// Helpers: build a stub packet (the shape runProbeConsensus passes the probe) + a stub callModel that
// answers entails per a GROUND-TRUTH keyed by the packet's claim text (so the stub is gold-blind: it
// reads ONLY what the rendered prompt carries -- the opaque ids + the EVIDENCE/CLAIM blocks -- and
// never the expectedEntailment). The stub PARSES the rendered prompt to recover (opaqueId -> claim),
// answers each item, and emits the DP2 JSON array IN A PERMUTED ORDER to prove de-mapping.
// ---------------------------------------------------------------------------

function mkPacket(uid, claim, survivors, expectedEntailment) {
  return {
    trap: { uid, claim, enrichedKs: survivors.map((s) => ({ sentence: s })) },
    enrichedKs: survivors.map((s) => ({ sentence: s })),
    stratum: 'evidence-absent',
    decisiveRank: -1,
    expectedEntailment,
  };
}

// Parse the rendered prompt back into [{ opaque, claim }] (the stub model "reads" the prompt).
function parsePromptItems(promptText) {
  // Items are separated by a blank line after the "ITEMS:" marker; each item starts with "<id>)".
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

    const opaque = idMatch[1];
    const claimLine = lines.find((l) => l.startsWith('CLAIM: '));
    const claim = claimLine ? claimLine.slice('CLAIM: '.length) : '';
    items.push({ opaque, claim });
  }

  return items;
}

// A gold-blind stub callModel: answers entails by a claim -> boolean GT map. Emits the JSON array in
// REVERSE order (a permutation) to prove the adapter de-maps by opaque id, not position.
function makeStubCallModel(claimGT, opts = {}) {
  const overrides = opts.overrides || {}; // opaque-position overrides keyed by claim -> raw value
  const wholeBatchFail = opts.wholeBatchFail || null; // a function(callCount) -> bool to force a parse failure

  let callCount = 0;

  return async function callModel(promptText) {
    callCount += 1;

    if (wholeBatchFail && wholeBatchFail(callCount)) {
      return 'I cannot produce a JSON array for this batch. Here is a prose summary instead.';
    }

    const items = parsePromptItems(promptText);
    const objs = items.map(({ opaque, claim }) => {
      if (Object.prototype.hasOwnProperty.call(overrides, claim)) {
        return { id: opaque, entails: overrides[claim], reason: 'override' };
      }

      const entails = claimGT[claim];

      return { id: opaque, entails, reason: 'stub' };
    });

    // Emit in REVERSE order (a permutation) to prove de-mapping by opaque id.
    objs.reverse();

    return JSON.stringify(objs);
  };
}

// ---------------------------------------------------------------------------
// Test 1: the batched adapter parses + de-maps under a PERMUTED opaque-id order (DISCRIMINATING).
// ---------------------------------------------------------------------------

test('Task-4 DP1/DP2: a <=8 packet batch parses via the reused score.mjs slice + de-maps each opaque id back to its packet under a permuted response order', async () => {
  const packets = [
    mkPacket('t1', 'X income doubled', ['X earned more than 200000 annually', 'X now makes millions'], 'false'),
    mkPacket('t2', 'revenue more than doubled', ['revenue was 25B', 'revenue rose to 48B'], 'false'),
    mkPacket('c1', 'the vaccine reduced risk', ['RCT 4000 participants', 'infections 70 percent lower'], 'true'),
  ];

  // Gold-blind GT keyed by claim text (the stub reads ONLY the rendered prompt).
  const claimGT = {
    'X income doubled': false,
    'revenue more than doubled': true,
    'the vaccine reduced risk': true,
  };

  const callModel = makeStubCallModel(claimGT);
  const probe = makeBatchedOofProbe({ callModel, model: 'gpt-5.5', batchSize: 8, hardBatchSize: 6, seed: 'seed-A' });

  await probe.prepare(packets);

  const r1 = await probe(packets[0]);
  const r2 = await probe(packets[1]);
  const r3 = await probe(packets[2]);

  assert.equal(r1.accepted, true, 't1 resolved');
  assert.equal(r1.entails, false, 't1 entails de-mapped correctly (claim "X income doubled" -> false) despite reversed response order');
  assert.equal(r2.accepted, true, 't2 resolved');
  assert.equal(r2.entails, true, 't2 entails de-mapped (claim "revenue more than doubled" -> true)');
  assert.equal(r3.accepted, true, 'c1 resolved');
  assert.equal(r3.entails, true, 'c1 entails de-mapped');

  // DISCRIMINATING: a positional/ordinal de-map would return t1's entails from the LAST emitted object
  // (the reverse put c1's answer first). The opaque-id de-map gets it right; an ordinal regression would
  // return entails=true for t1 (c1's value) -- which the r1.entails===false assertion above catches.
});

// ---------------------------------------------------------------------------
// Test 2: hard near-boundary packets ride in <=6 batches; a 7-hard set splits 6+1, never one of 7.
// ---------------------------------------------------------------------------

test('Task-4 DP1: hard near-boundary packets ride in <=hardBatchSize (6) batches -- a 7-hard set splits into 6 + 1, never a single batch of 7', () => {
  const hardIds = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];
  const packets = hardIds.map((id, i) => mkPacket(id, 'hard claim ' + i, ['ev ' + i], 'false'));
  const batches = packBatches(packets, { batchSize: 8, hardBatchSize: 6, hardNearBoundaryIds: hardIds });

  // 7 hard packets -> two hard batches of 6 + 1 (NOT a single batch of 7, NOT a batch of 8).
  assert.equal(batches.length, 2, '7 hard packets split into exactly 2 batches');
  assert.equal(batches[0].length, 6, 'the first hard batch is <=hardBatchSize (6)');
  assert.equal(batches[1].length, 1, 'the remaining hard packet rides alone (6 + 1)');
  assert.ok(batches.every((b) => b.length <= 6), 'NO hard batch exceeds hardBatchSize (6)');
});

test('Task-4 DP1: non-hard packets pack into <=batchSize (8); hard + normal mix keeps hard in <=6 batches', () => {
  const hardIds = ['h1', 'h2'];
  const normalIds = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'];
  const packets = [...hardIds, ...normalIds].map((id) => mkPacket(id, 'claim ' + id, ['ev'], 'false'));
  const batches = packBatches(packets, { batchSize: 8, hardBatchSize: 6, hardNearBoundaryIds: hardIds });

  // 2 hard -> one hard batch of 2; 9 normal -> 8 + 1.
  assert.equal(batches.length, 3, '2 hard (one batch) + 9 normal (8+1) = 3 batches');
  const hardBatch = batches.find((b) => b.every((e) => hardIds.includes(e.identity)));
  assert.ok(hardBatch && hardBatch.length <= 6, 'the hard batch is <=6');
  const normalBatches = batches.filter((b) => b.some((e) => normalIds.includes(e.identity)));
  assert.ok(normalBatches.every((b) => b.length <= 8), 'no normal batch exceeds 8');
});

// ---------------------------------------------------------------------------
// Test 3: DP3 fail-closed-to-DROP -- a per-packet defect drops ONLY that packet -> attrition.probeDropped.
// ---------------------------------------------------------------------------

test('Task-4 DP3: a per-packet defect (missing id / non-boolean entails) drops ONLY that packet (accepted:false) while the others resolve; runProbeConsensus counts the drop as a decline', async () => {
  const packets = [
    mkPacket('ok1', 'claim ok one', ['ev1'], 'false'),
    mkPacket('bad', 'claim bad two', ['ev2'], 'false'),
    mkPacket('ok2', 'claim ok three', ['ev3'], 'false'),
  ];
  const claimGT = { 'claim ok one': false, 'claim ok three': false };
  // "claim bad two" is OMITTED from claimGT -> the stub emits entails=undefined for it -> non-boolean
  // -> DP3 fail-closed-to-DROP on JUST that packet.
  const callModel = makeStubCallModel(claimGT);
  const probe = makeBatchedOofProbe({ callModel, model: 'gemini-3.1-pro-preview', seed: 'seed-B' });

  await probe.prepare(packets);

  const r1 = await probe(packets[0]);
  const rb = await probe(packets[1]);
  const r2 = await probe(packets[2]);

  assert.equal(r1.accepted, true, 'ok1 resolved (others unaffected)');
  assert.equal(r2.accepted, true, 'ok2 resolved (others unaffected)');
  assert.equal(rb.accepted, false, 'the defective packet is fail-closed-to-DROP (accepted:false)');
  assert.match(rb.reason, /oof-batch-unresolved/, 'the drop reason marks it unresolved (-> attrition.probeDropped), NEVER a fabricated retain');

  // runProbeConsensus treats accepted:false as a decline (drop), NOT a retain (the assembler counts
  // it in attrition.probeDropped). Verify the per-packet contract drives the consensus as a single
  // declined judge.
  const consensus = await runProbeConsensus([probe], { trap: packets[1].trap, enrichedKs: packets[1].enrichedKs, stratum: 'evidence-absent', decisiveRank: -1, expectedEntailment: 'false' });
  assert.equal(consensus.retained, false, 'the consensus DROPS the unresolved packet (a probe-decline)');
  assert.equal(consensus.split, false, 'an unresolved DROP is a decline (accepted:false), not an inter-judge split');
});

test('Task-4 DP3: a duplicate id in the response drops that packet (never a fabricated retain)', async () => {
  // Force a duplicate by making the stub emit two objects for the same opaque id.
  const packets = [mkPacket('d1', 'claim dup one', ['ev1'], 'false'), mkPacket('d2', 'claim dup two', ['ev2'], 'false')];

  const callModel = async (promptText) => {
    const items = parsePromptItems(promptText);
    // Emit BOTH objects under the FIRST item's opaque id (a duplicate); the second packet's id never appears.
    const dupId = items[0].opaque;

    return JSON.stringify([
      { id: dupId, entails: false, reason: 'a' },
      { id: dupId, entails: false, reason: 'b' },
    ]);
  };
  const probe = makeBatchedOofProbe({ callModel, model: 'gpt-5.5', seed: 'seed-C' });
  await probe.prepare(packets);

  const r1 = await probe(packets[0]);
  const r2 = await probe(packets[1]);

  assert.equal(r1.accepted, false, 'the duplicated id is treated as a defect -> dropped (no fabricated retain)');
  assert.equal(r2.accepted, false, 'the missing id is dropped');
});

test('Task-4 DP3: a WHOLE-BATCH JSON failure re-runs the batch ONCE then SPLITS it in half (recorded), never a silent whole-batch drop', async () => {
  const packets = [
    mkPacket('w1', 'claim w one', ['ev1'], 'false'),
    mkPacket('w2', 'claim w two', ['ev2'], 'false'),
    mkPacket('w3', 'claim w three', ['ev3'], 'true'),
    mkPacket('w4', 'claim w four', ['ev4'], 'true'),
  ];
  const claimGT = {
    'claim w one': false,
    'claim w two': false,
    'claim w three': true,
    'claim w four': true,
  };

  // Fail the WHOLE batch on the first two calls (the original + the one re-run), then succeed on the
  // split halves (calls 3+).
  const callModel = makeStubCallModel(claimGT, { wholeBatchFail: (n) => n <= 2 });
  const probe = makeBatchedOofProbe({ callModel, model: 'gpt-5.5', batchSize: 8, seed: 'seed-D' });

  await probe.prepare(packets);
  const events = probe.getBatchEvents();

  assert.ok(events.some((e) => e.action === 'rerun-once'), 'DP3 re-runs the batch ONCE on a whole-batch parse failure (recorded)');
  assert.ok(events.some((e) => e.action === 'split-in-half'), 'DP3 SPLITS the batch in half after the re-run fails (recorded)');

  // After the split halves succeed, all four packets resolve (the split recovered the batch).
  const results = await Promise.all(packets.map((p) => probe(p)));
  assert.ok(results.every((r) => r.accepted === true), 'the split halves recovered every packet (NOT a silent whole-batch drop)');
});

// ---------------------------------------------------------------------------
// Test 4: the expected direction NEVER leaks into the rendered prompt (gold-blind).
// ---------------------------------------------------------------------------

test('Task-4 gold-blind: the rendered batched prompt contains the rubric only -- neither the gold direction (refuted/unrefuted) nor the per-packet expectedEntailment', () => {
  const packets = [
    mkPacket('g1', 'X income doubled', ['X earned 200000', 'X makes millions'], 'false'),
    mkPacket('g2', 'the team won the cup', ['the team reached the final'], 'true'),
  ];
  const batches = packBatches(packets, { batchSize: 8, hardBatchSize: 6, hardNearBoundaryIds: [] });
  // Render with opaque ids (a single batch).
  const ordered = batches[0].map((e, i) => ({ opaque: 'p' + String(i).padStart(8, '0'), packet: e.packet }));
  const prompt = renderBatchedPrompt(ordered);

  assert.ok(prompt.startsWith(RUBRIC_PREAMBLE), 'the prompt PREAMBLE is the reused gold-blind entailment rubric');
  assert.ok(!/refuted/i.test(prompt), 'the prompt NEVER contains the gold word "refuted"');
  assert.ok(!/unrefuted/i.test(prompt), 'the prompt NEVER contains the gold word "unrefuted"');
  // The per-packet expectedEntailment ('false' / 'true' as the gold direction) must not be injected
  // as a directive. The rubric legitimately explains entails=true/false as JUDGE OUTPUT options, but
  // it must NOT state the EXPECTED answer for any item. Assert no item block carries an expectation.
  const afterItems = prompt.split('\nITEMS:\n')[1] || '';
  assert.ok(!/expectedEntailment/i.test(afterItems), 'no item block carries the expectedEntailment field');
  assert.ok(!/expected[ _-]?(answer|direction|entail)/i.test(afterItems), 'no item block carries an expected-answer hint');
});

// ---------------------------------------------------------------------------
// Test 5: the DP4 contamination gate (>=11/12 pass; 10/12 -> the batch-5 directive; reversed-order present).
// ---------------------------------------------------------------------------

test('Task-4 DP4: the contamination gate passes at 12/12 and 11/12 (one benign flip tolerated) and FAILS at 10/12 with the batch-size-5-and-revalidate directive', () => {
  // 12-packet hardest slice (ids h0..h10 + one reversed-order variant "h2-rev").
  const ids = ['h0', 'h1', 'h2', 'h2-rev', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10'];
  assert.equal(ids.length, 12, 'the gate slice is 12 packets');
  assert.ok(ids.includes('h2-rev'), 'the 12-packet slice INCLUDES one reversed-order variant');

  // 12/12 exact agreement -> PASS.
  const single = {};
  const batched = {};

  for (const id of ids) {
    single[id] = id.length % 2 === 0; // arbitrary deterministic boolean
    batched[id] = single[id];
  }

  const full = runContaminationGate({ singleResults: single, batchedResults: batched, model: 'gpt-5.5' });
  assert.equal(full.agreement, 12, '12/12 agreement');
  assert.equal(full.pass, true, '12/12 PASSES');
  assert.equal(full.directive, null, 'no directive on pass');

  // 11/12 (one benign near-determinism flip) -> still PASS (the gate never requires 100%).
  const batched11 = { ...batched };
  batched11['h5'] = !batched['h5'];
  const one = runContaminationGate({ singleResults: single, batchedResults: batched11, model: 'gpt-5.5' });
  assert.equal(one.agreement, 11, '11/12 agreement (one flip)');
  assert.equal(one.pass, true, '11/12 PASSES (91.7% tolerates one benign flip; 100% would false-trip)');

  // 10/12 -> FAIL with the batch-5 directive.
  const batched10 = { ...batched };
  batched10['h5'] = !batched['h5'];
  batched10['h6'] = !batched['h6'];
  const two = runContaminationGate({ singleResults: single, batchedResults: batched10, model: 'gemini-3.1-pro-preview' });
  assert.equal(two.agreement, 10, '10/12 agreement (two flips)');
  assert.equal(two.pass, false, '10/12 FAILS');
  assert.equal(two.directive, 'batch-size-5-and-revalidate', '<11/12 returns the batch-size-5-and-revalidate directive');
});

// ---------------------------------------------------------------------------
// Test 6: no engine / decider mutation -- the module composes the score.mjs slice + the injected
// transport; it imports neither the frozen engine nor the OOF decider identity.
// ---------------------------------------------------------------------------

test('Task-4 no-mutation: the adapter returns entails as the model reported it (the consensus compares to expectedEntailment); the module composes the reused slice + the injected callModel only', async () => {
  // The probe must NOT compare to expectedEntailment itself -- it returns the model's raw entails and
  // lets runProbeConsensus do the comparison. A trap (expected false) where the model says entails=true
  // (a split) must surface as a SPLIT in the consensus, not as a silently-flipped retain.
  const packets = [mkPacket('s1', 'survivors EXCEED the overreach', ['$200K -> millions'], 'false')];
  const claimGT = { 'survivors EXCEED the overreach': true }; // the model reads the survivors as ENTAILING -> entails=true
  const callModel = makeStubCallModel(claimGT);
  const probe = makeBatchedOofProbe({ callModel, model: 'gpt-5.5', seed: 'seed-E' });
  await probe.prepare(packets);

  const r = await probe(packets[0]);
  assert.equal(r.accepted, true, 'the probe resolves (it does not pre-judge)');
  assert.equal(r.entails, true, 'the probe returns the model-reported entails UNCHANGED (true), NOT the expected false');

  // The consensus then SPLITS (entails=true != expectedEntailment 'false').
  const consensus = await runProbeConsensus([probe], { trap: packets[0].trap, enrichedKs: packets[0].enrichedKs, stratum: 'evidence-absent', decisiveRank: -1, expectedEntailment: 'false' });
  assert.equal(consensus.retained, false, 'the consensus DROPS the packet (the survivors entail the overreach -- the seed-75 disqualify direction)');
  assert.equal(consensus.split, true, 'a model entails=true on a refuted-gold trap is an inter-judge SPLIT, never a fabricated retain');
});

// ---------------------------------------------------------------------------
// Test 7: the reused slice helper is the score.mjs slice (fence-strip + first-[/last-] + byId), with
// the DP3 non-boolean preservation (NOT score.mjs's coerce-to-false).
// ---------------------------------------------------------------------------

test('Task-4 slice: sliceByIdEntails reuses the score.mjs fence-strip + first-[/last-] slice + byId, tolerates conversational filler, and PRESERVES a non-boolean entails (DP3, NOT coerce-to-false)', () => {
  // Conversational filler + a markdown fence around the array (the proven score.mjs shape).
  const raw = 'Sure, here you go:\n```json\n[{"id":"pA","entails":true,"reason":"x"},{"id":"pB","entails":false,"reason":"y"}]\n```\nHope that helps.';
  const parsed = sliceByIdEntails(raw);
  assert.equal(parsed.ok, true, 'a fenced array amid filler parses (the reused slice)');
  assert.equal(parsed.byId.pa, true, 'byId lowercases the id (pA -> pa)');
  assert.equal(parsed.byId.pb, false, 'byId extracts entails=false');

  // A non-boolean entails is PRESERVED (not coerced to false) so the adapter fail-closed-DROPS it.
  const rawBad = '[{"id":"pC","entails":"maybe","reason":"z"}]';
  const parsedBad = sliceByIdEntails(rawBad);
  assert.equal(parsedBad.ok, true, 'the array still slices');
  assert.notEqual(parsedBad.byId.pc, false, 'a non-boolean entails is NOT silently coerced to false (DP3)');
  assert.notEqual(parsedBad.byId.pc, true, 'a non-boolean entails is NOT true either -- the adapter drops it');

  // A batch-level summary (no array) is a WHOLE-BATCH failure.
  const summary = 'All items entail their claims. No JSON to report.';
  const parsedSummary = sliceByIdEntails(summary);
  assert.equal(parsedSummary.ok, false, 'a batch-level summary (no array) is a whole-batch parse failure');
});

test('Task-4 identity: packetIdentity uses the trap uid/id, never the array position (the ordinal leak DP1 forbids)', () => {
  assert.equal(packetIdentity({ trap: { uid: 'u1' } }), 'u1', 'uid is the identity');
  assert.equal(packetIdentity({ trap: { id: 'i1' } }), 'i1', 'id is the identity when uid is absent');
  assert.equal(packetIdentity({ id: 'top' }), 'top', 'a top-level id is the identity fallback');
});
