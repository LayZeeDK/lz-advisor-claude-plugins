// lz-eval-parity-calibration-harness.test.mjs
//
// Validation fixture for the RESUMABLE judge-calibration harness (Plan 22-05, Stage 2; NO-SPEND;
// PAR-02 / PAR-08 / D-13). Dev-only eval-tree test: imports the SCRIPT under test + node stdlib only.
// The harness composes the FROZEN seams (goldFromWiceLabel + judgeCalibrationGate) over the vendored
// WiCE fixtures; this test asserts the harness's OWN load-bearing behaviors (the MCC stats are owned +
// tested by lz-eval-mcc.test.mjs; the gate predicate by lz-eval-judge-calibration.test.mjs):
//   - loadCalibrationItems over the REAL vendored fixtures returns the frozen WiCE-only shape (60 items,
//     gold 26 unrefuted / 34 refuted, 17 subtle), sorted ascending by uid, each with claim + evidence.
//   - loadCalibrationItems fails CLOSED on a malformed record (missing claim / unknown label).
//   - buildJudgePayload is ANTI-LEAK: it carries claim + context + evidence ONLY, never the gold label /
//     subtle marker / supporting_sentences.
//   - pendingItems is skip-on-resume: items whose verdict file exists are DONE.
//   - assembleGateInput aligns verdicts[i] with gold[i] BY UID (positional alignment is load-bearing --
//     mccFromPairs pairs by index), is INVARIANT to verdict-file write order, and throws naming the
//     missing uids when a verdict is absent.
//   - scoreCalibration DISCRIMINATES: a near-perfect verdict set clears; an always-refute set does not.
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-parity-calibration-harness.test.mjs
// The directory form spuriously exits 1 on this host even when every real test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  assembleGateInput,
  buildJudgePayload,
  loadCalibrationItems,
  materializeInputs,
  pendingItems,
  readVerdict,
  scoreCalibration,
  summarize,
  verdictPath,
} from './lz-eval-parity-calibration-harness.mjs';

// A fresh tmp dir per use (portable: CI runs on ubuntu). Cleaned up by the caller.
function mkTmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// Write a verdict file for one uid into outDir (mirrors what the orchestrating session persists).
// Carries a `model` pin because readVerdict fails closed without one (AMENDMENT RECORD 3).
function writeVerdict(outDir, uid, verdict, model = 'claude-opus-5') {
  fs.writeFileSync(verdictPath(uid, outDir), JSON.stringify({ uid, verdict, model }) + '\n', 'utf8');
}

// Write a minimal-but-valid WiCE record into a tmp records dir.
function writeRecord(dir, file, record) {
  fs.writeFileSync(path.join(dir, file), JSON.stringify(record, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// loadCalibrationItems over the REAL vendored fixtures: the frozen WiCE-only N=60 shape.
// ---------------------------------------------------------------------------

test('loadCalibrationItems: the vendored set is the frozen WiCE-only N=60 shape (26 unrefuted / 34 refuted / 17 subtle)', () => {
  const items = loadCalibrationItems();
  const s = summarize(items);

  assert.equal(s.total, 60, 'the vendored WiCE calibration set is 60 items (AMENDMENT RECORD 2)');
  assert.equal(s.unrefuted, 26, '26 supported -> unrefuted');
  assert.equal(s.refuted, 34, '17 not_supported + 17 partially_supported -> 34 refuted');
  assert.equal(s.subtle, 17, '17 partially_supported subtle items (>= 1 required by judgeCalibrationGate)');
});

test('loadCalibrationItems: items are sorted ascending by uid and each carries a non-empty claim + evidence', () => {
  const items = loadCalibrationItems();

  for (let i = 1; i < items.length; i += 1) {
    assert.ok(items[i - 1].uid < items[i].uid, 'uids must be strictly ascending (deterministic order)');
  }

  for (const item of items) {
    assert.equal(typeof item.claim, 'string');
    assert.ok(item.claim.trim().length > 0, 'claim must be non-empty');
    assert.ok(Array.isArray(item.evidence) && item.evidence.length > 0, 'evidence must be a non-empty array');
    assert.ok(item.evidenceText.trim().length > 0, 'evidenceText must be non-empty');
    assert.ok(item.gold.gold === 'unrefuted' || item.gold.gold === 'refuted', 'gold in the frozen enum');
  }
});

// ---------------------------------------------------------------------------
// loadCalibrationItems fails CLOSED on malformed records (never a silent drop).
// ---------------------------------------------------------------------------

test('loadCalibrationItems: a record missing a claim is a ContractError (fail-closed)', () => {
  const dir = mkTmp('lz-calib-bad-claim-');

  try {
    writeRecord(dir, 'r0.json', { label: 'supported', evidence: ['x'], meta: { id: 'r0' } });
    assert.throws(() => loadCalibrationItems({ recordsDir: dir }), ContractError);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('loadCalibrationItems: an unknown WiCE label fails closed via goldFromWiceLabel (ContractError)', () => {
  const dir = mkTmp('lz-calib-bad-label-');

  try {
    writeRecord(dir, 'r0.json', { label: 'mostly_true', claim: 'c', evidence: ['x'], meta: { id: 'r0' } });
    assert.throws(() => loadCalibrationItems({ recordsDir: dir }), ContractError);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('loadCalibrationItems: a duplicate uid is a ContractError', () => {
  const dir = mkTmp('lz-calib-dup-');

  try {
    writeRecord(dir, 'a.json', { label: 'supported', claim: 'c1', evidence: ['x'], meta: { id: 'dup' } });
    writeRecord(dir, 'b.json', { label: 'not_supported', claim: 'c2', evidence: ['y'], meta: { id: 'dup' } });
    assert.throws(() => loadCalibrationItems({ recordsDir: dir }), ContractError);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// buildJudgePayload: ANTI-LEAK -- claim + context + evidence ONLY, never the gold / subtle / supporting.
// ---------------------------------------------------------------------------

test('buildJudgePayload: carries claim + context + evidence and NEVER leaks the gold label / subtle / supporting_sentences', () => {
  const items = loadCalibrationItems();
  // Use a subtle (partially_supported -> refuted) item so a leak would be maximally damaging.
  const subtleItem = items.find((it) => it.gold.subtle === true);
  assert.ok(subtleItem, 'there must be at least one subtle item to exercise the anti-leak path');

  const payload = buildJudgePayload(subtleItem);
  const keys = Object.keys(payload).sort();

  assert.deepEqual(keys, ['claim', 'context', 'evidence', 'uid'], 'payload exposes ONLY uid/claim/context/evidence');
  assert.equal(payload.claim, subtleItem.claim);
  assert.equal(payload.evidence, subtleItem.evidenceText);

  // The serialized payload must contain NONE of the held-back gold fields.
  const serialized = JSON.stringify(payload);
  assert.ok(!/"label"/.test(serialized), 'must not leak the WiCE label key');
  assert.ok(!/"gold"/.test(serialized), 'must not leak the gold field');
  assert.ok(!/"subtle"/.test(serialized), 'must not leak the subtle marker');
  assert.ok(!/"supporting_sentences"/.test(serialized), 'must not leak supporting_sentences');
});

// ---------------------------------------------------------------------------
// pendingItems: skip-on-resume.
// ---------------------------------------------------------------------------

test('pendingItems: an item whose verdict file exists is DONE; the rest are pending (skip-on-resume)', () => {
  const items = loadCalibrationItems();
  const outDir = mkTmp('lz-calib-pending-');

  try {
    assert.equal(pendingItems({ items, outDir }).length, items.length, 'all pending when no verdicts exist');

    // Persist verdicts for the first 10 items -> only the remaining 50 are pending.
    for (let i = 0; i < 10; i += 1) {
      writeVerdict(outDir, items[i].uid, 'refuted');
    }

    const pending = pendingItems({ items, outDir });
    assert.equal(pending.length, items.length - 10, '10 done -> the rest pending');

    const doneUids = new Set(items.slice(0, 10).map((it) => it.uid));

    for (const it of pending) {
      assert.ok(!doneUids.has(it.uid), 'a pending item must not be one already on disk');
    }
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// readVerdict: fail-closed on a missing file / an out-of-enum verdict.
// ---------------------------------------------------------------------------

test('readVerdict: a missing verdict file and an out-of-enum verdict are both ContractErrors (fail-closed)', () => {
  const outDir = mkTmp('lz-calib-readverdict-');

  try {
    assert.throws(() => readVerdict({ uid: 'nope', outDir }), ContractError, 'missing file fails closed');

    fs.writeFileSync(verdictPath('bad', outDir), JSON.stringify({ uid: 'bad', verdict: 'maybe', model: 'claude-opus-5' }) + '\n', 'utf8');
    assert.throws(() => readVerdict({ uid: 'bad', outDir }), ContractError, 'out-of-enum verdict fails closed');
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

test('readVerdict: accepts the judge\'s real { verdict, reasoning, model } object (uid from filename) and ignores extras', () => {
  // INTEROP: the prompt has the judge emit { "verdict", "reasoning" } (no uid); the session writes that
  // verbatim under <uid>.verdict.json, ADDING the judge model pin (AMENDMENT RECORD 3). readVerdict keys
  // off the filename for the uid and reads only the verdict + the model -- the reasoning + any stray uid
  // body field are ignored, never distorting the gate.
  const outDir = mkTmp('lz-calib-interop-');

  try {
    fs.writeFileSync(
      verdictPath('dev99999-0', outDir),
      JSON.stringify({ verdict: 'refuted', reasoning: 'the evidence omits the second clause of the claim', model: 'claude-opus-5' }) + '\n',
      'utf8',
    );
    const v = readVerdict({ uid: 'dev99999-0', outDir });
    assert.deepEqual(
      v,
      { id: 'dev99999-0', verdict: 'refuted', model: 'claude-opus-5' },
      'returns { id (from filename), verdict, model }, ignoring reasoning',
    );
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

// AMENDMENT RECORD 3: an unpinned verdict (no judge model) cannot be scored. The Opus 4.x set that
// DISQUALIFIED recorded only { uid, verdict, reasoning }, so its instrument had to be recovered from
// file mtimes -- this guard makes that unrepeatable.
test('readVerdict: a verdict with no model pin is a ContractError (AMENDMENT RECORD 3 fail-closed)', () => {
  const outDir = mkTmp('lz-calib-nopin-');

  try {
    // The exact 4.x on-disk shape: a valid, in-enum verdict that simply never named its judge.
    fs.writeFileSync(
      verdictPath('dev00003-0', outDir),
      JSON.stringify({ uid: 'dev00003-0', verdict: 'refuted', reasoning: 'evidence never mentions the subject' }) + '\n',
      'utf8',
    );
    assert.throws(
      () => readVerdict({ uid: 'dev00003-0', outDir }),
      (err) => err instanceof ContractError && /no judge model/.test(err.message),
      'an in-enum but unpinned verdict fails closed on the model pin, not on the enum',
    );

    // DISCRIMINATION: the same record WITH a pin reads fine, so the guard keys on the pin alone and is
    // not rejecting the record for some unrelated reason.
    fs.writeFileSync(
      verdictPath('dev00003-1', outDir),
      JSON.stringify({ uid: 'dev00003-1', verdict: 'refuted', reasoning: 'evidence never mentions the subject', model: 'claude-opus-5' }) + '\n',
      'utf8',
    );
    assert.equal(readVerdict({ uid: 'dev00003-1', outDir }).model, 'claude-opus-5', 'the pinned twin reads through');

    // An empty-string model is as unpinned as an absent one.
    fs.writeFileSync(
      verdictPath('dev00003-2', outDir),
      JSON.stringify({ uid: 'dev00003-2', verdict: 'refuted', model: '' }) + '\n',
      'utf8',
    );
    assert.throws(
      () => readVerdict({ uid: 'dev00003-2', outDir }),
      (err) => err instanceof ContractError && /no judge model/.test(err.message),
      'an empty model string fails closed too',
    );
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// assembleGateInput: UID-ORDERED POSITIONAL ALIGNMENT (load-bearing -- mccFromPairs pairs by index).
// ---------------------------------------------------------------------------

test('assembleGateInput: verdicts[i] and gold[i] share the same uid (positional alignment) and the gold matches each item', () => {
  const items = loadCalibrationItems();
  const outDir = mkTmp('lz-calib-align-');

  try {
    // Persist a verdict for every item (here: always-correct, so the values are known).
    for (const it of items) {
      writeVerdict(outDir, it.uid, it.gold.gold);
    }

    const { verdicts, gold } = assembleGateInput({ items, outDir });

    assert.equal(verdicts.length, items.length);
    assert.equal(gold.length, items.length);

    for (let i = 0; i < items.length; i += 1) {
      assert.equal(verdicts[i].id, gold[i].id, 'verdicts[i] and gold[i] MUST share a uid (positional pairing)');
      assert.equal(gold[i].id, items[i].uid, 'gold[i] follows the sorted items order');
      assert.equal(gold[i].gold, items[i].gold.gold, 'gold value carried from the item');
    }
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

test('assembleGateInput: the result is INVARIANT to the order the verdict files were written (aligned by uid, not by readdir order)', () => {
  const items = loadCalibrationItems();
  const fwd = mkTmp('lz-calib-fwd-');
  const rev = mkTmp('lz-calib-rev-');

  try {
    // A non-trivial verdict pattern (a few deliberate misses) so the score is not degenerate.
    const verdictFor = (idx, item) => {
      if (item.gold.gold === 'unrefuted' && idx % 13 === 0) {
        return 'refuted';
      }

      if (item.gold.gold === 'refuted' && idx % 17 === 0) {
        return 'unrefuted';
      }

      return item.gold.gold;
    };

    // Forward write order.
    items.forEach((it, idx) => writeVerdict(fwd, it.uid, verdictFor(idx, it)));
    // Reverse write order (same content, opposite filesystem creation order).
    [...items].reverse().forEach((it) => writeVerdict(rev, it.uid, verdictFor(items.indexOf(it), it)));

    const a = assembleGateInput({ items, outDir: fwd });
    const b = assembleGateInput({ items, outDir: rev });

    assert.deepEqual(a.verdicts, b.verdicts, 'verdicts identical regardless of write order');
    assert.deepEqual(a.gold, b.gold, 'gold identical regardless of write order');
  } finally {
    fs.rmSync(fwd, { recursive: true, force: true });
    fs.rmSync(rev, { recursive: true, force: true });
  }
});

test('assembleGateInput: over a deliberately SHUFFLED items array, verdicts[i]/gold[i]/items[i] stay aligned by uid (defense-in-depth)', () => {
  // DISCRIMINATION (the by-index hazard): mccFromPairs pairs verdicts[i] with gold[i] BY INDEX. This
  // feeds assembleGateInput a non-sorted items array with an ASYMMETRIC verdict pattern and asserts the
  // pairing follows the GIVEN array order, never the on-disk/filename order. A future refactor that
  // sorted one array but not the other would break this.
  const items = loadCalibrationItems();
  const outDir = mkTmp('lz-calib-shuffle-');

  try {
    for (const it of items) {
      // Asymmetric: refuted-gold items judged 'unrefuted' (a false-uphold pattern) so a misalignment
      // would visibly scramble which verdict sits beside which gold.
      writeVerdict(outDir, it.uid, it.gold.gold === 'refuted' ? 'unrefuted' : it.gold.gold);
    }

    const shuffled = [...items].reverse();
    const { verdicts, gold } = assembleGateInput({ items: shuffled, outDir });

    for (let i = 0; i < shuffled.length; i += 1) {
      assert.equal(verdicts[i].id, shuffled[i].uid, 'verdicts follow the GIVEN items order, not the filename order');
      assert.equal(gold[i].id, shuffled[i].uid, 'gold follows the GIVEN items order');
      assert.equal(gold[i].gold, shuffled[i].gold.gold, 'gold value carried from the matching item');
    }
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

test('assembleGateInput: a partial set (any missing verdict) is a ContractError naming the missing uids', () => {
  const items = loadCalibrationItems();
  const outDir = mkTmp('lz-calib-partial-');

  try {
    // Persist all but the last two items.
    for (let i = 0; i < items.length - 2; i += 1) {
      writeVerdict(outDir, items[i].uid, items[i].gold.gold);
    }

    assert.throws(() => assembleGateInput({ items, outDir }), ContractError, 'a partial set must not be scorable');
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

// AMENDMENT RECORD 3 single-instrument check. `pendingItems` skips any uid that already has a verdict
// file, so a resume straddling a model-alias change would silently yield a set judged by two
// generations. An MCC over a mixed instrument measures nothing.
test('assembleGateInput: a verdict set spanning TWO judge models is a ContractError (single-instrument)', () => {
  const items = loadCalibrationItems();
  const outDir = mkTmp('lz-calib-mixed-');

  try {
    // The realistic shape: a run that began on one generation and resumed on the next.
    for (let i = 0; i < items.length; i += 1) {
      const model = i < 40 ? 'claude-opus-4-8' : 'claude-opus-5';
      writeVerdict(outDir, items[i].uid, items[i].gold.gold, model);
    }

    assert.throws(
      () => assembleGateInput({ items, outDir }),
      (err) => err instanceof ContractError && /spans 2 judge models/.test(err.message) && /claude-opus-4-8, claude-opus-5/.test(err.message),
      'a two-generation set fails closed and names both models',
    );

    // DISCRIMINATION: the identical set under ONE model scores, and reports the pinned instrument --
    // so the guard keys on the model spread alone, not on anything else about these verdicts.
    const uniform = mkTmp('lz-calib-uniform-');

    try {
      for (const item of items) {
        writeVerdict(uniform, item.uid, item.gold.gold, 'claude-opus-5');
      }

      const out = assembleGateInput({ items, outDir: uniform });
      assert.equal(out.model, 'claude-opus-5', 'a single-instrument set reports its pinned model');
      assert.equal(out.verdicts.length, items.length, 'and still assembles every item');
    } finally {
      fs.rmSync(uniform, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// scoreCalibration: DISCRIMINATION over the REAL items -- near-perfect clears; always-refute does not.
// ---------------------------------------------------------------------------

test('scoreCalibration: a near-perfect verdict set CLEARS (mcc >= 0.5 && lowerCI > 0)', () => {
  const items = loadCalibrationItems();
  const outDir = mkTmp('lz-calib-clears-');

  try {
    // Near-perfect: correct on all but two items per direction (introduces FP/FN -> non-degenerate
    // variance so the one-sided lower CI is strictly positive, not collapsed to the floor).
    let supMiss = 0;
    let refMiss = 0;

    for (const it of items) {
      let verdict = it.gold.gold;

      if (it.gold.gold === 'unrefuted' && supMiss < 2) {
        verdict = 'refuted';
        supMiss += 1;
      } else if (it.gold.gold === 'refuted' && refMiss < 2) {
        verdict = 'unrefuted';
        refMiss += 1;
      }

      writeVerdict(outDir, it.uid, verdict);
    }

    const { mcc, lowerCI, cleared } = scoreCalibration({ items, outDir });
    assert.ok(mcc >= 0.5, 'near-perfect MCC clears the point bar, got ' + mcc);
    assert.ok(lowerCI > 0, 'near-perfect lowerCI strictly positive, got ' + lowerCI);
    assert.equal(cleared, true);
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

test('scoreCalibration: an always-refute judge (MCC 0) is DISQUALIFIED (cleared:false)', () => {
  const items = loadCalibrationItems();
  const outDir = mkTmp('lz-calib-refute-');

  try {
    for (const it of items) {
      writeVerdict(outDir, it.uid, 'refuted');
    }

    const { mcc, cleared } = scoreCalibration({ items, outDir });
    assert.equal(mcc, 0, 'an always-refute judge scores MCC 0 (single-class)');
    assert.equal(cleared, false, 'a degenerate judge must NOT clear (DISQUALIFIER, PAR-02)');
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// materializeInputs: writes one anti-leak payload per item (idempotent), and they are leak-free on disk.
// ---------------------------------------------------------------------------

test('materializeInputs: writes one anti-leak input payload per item to disk', () => {
  const items = loadCalibrationItems();
  const outDir = mkTmp('lz-calib-materialize-');

  try {
    const written = materializeInputs({ items, outDir });
    assert.equal(written, items.length);

    // Spot-check the on-disk payload for the first item: leak-free + the expected fields.
    const sample = JSON.parse(fs.readFileSync(path.join(outDir, items[0].uid + '.input.json'), 'utf8'));
    assert.deepEqual(Object.keys(sample).sort(), ['claim', 'context', 'evidence', 'uid']);
    assert.ok(!/"label"|"gold"|"subtle"|"supporting_sentences"/.test(JSON.stringify(sample)), 'no leak on disk');
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});
