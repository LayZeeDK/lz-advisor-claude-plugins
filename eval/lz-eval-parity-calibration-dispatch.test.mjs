// ---------------------------------------------------------------------------
// Co-test for the UID-FREE dispatch materializer. The anti-leak guarantee here is what stands between
// a tool-enabled judge persona and the WiCE gold labels on disk (AMENDMENT RECORD 3), so each guard is
// proven to FIRE, not merely to exist.
// ---------------------------------------------------------------------------
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  DispatchError,
  extractFrozenPrompt,
  renderDispatch,
  generateDispatch,
} from './lz-eval-parity-calibration-dispatch.mjs';
import { loadCalibrationItems, buildJudgePayload } from './lz-eval-parity-calibration-harness.mjs';

const PROMPT_MD = path.join(import.meta.dirname, 'lz-eval-parity-calibration-prompt.md');

function mkTmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'lz-dispatch-'));
}

test('extractFrozenPrompt: pulls the prompt VERBATIM from the pinned prompt file (never re-typed)', () => {
  const frozen = extractFrozenPrompt(fs.readFileSync(PROMPT_MD, 'utf8'));

  assert.ok(frozen.startsWith('You are a careful fact-checking judge.'), 'starts at the frozen opening line');
  assert.match(frozen, /FULL support is required for "unrefuted"/, 'carries the decisive subtle-overreach rule');
  assert.match(frozen, /Output STRICT JSON on a single line/, 'carries the output contract');
  // The extracted block is the judge's whole instruction -- it must NOT drag in the surrounding
  // commentary, which discusses the gold mapping and would leak the answer key's structure.
  assert.ok(!frozen.includes('WiCE gold label it must match'), 'stops at the fence, excluding the gold-mapping table');
  assert.ok(!frozen.includes('TEMPERATURE FIDELITY CAVEAT'), 'excludes the transport notes');
});

test('extractFrozenPrompt: a prompt file without the fenced block is a DispatchError (fail-closed)', () => {
  assert.throws(() => extractFrozenPrompt('# no frozen block here\n'), DispatchError);
});

test('renderDispatch: substitutes all three placeholders and leaves none behind', () => {
  const frozen = extractFrozenPrompt(fs.readFileSync(PROMPT_MD, 'utf8'));
  const body = renderDispatch({
    frozen,
    payload: { claim: 'CLAIM_SENTINEL', context: 'CONTEXT_SENTINEL', evidence: 'EVIDENCE_SENTINEL' },
  });

  assert.match(body, /CLAIM_SENTINEL/);
  assert.match(body, /CONTEXT_SENTINEL/);
  assert.match(body, /EVIDENCE_SENTINEL/);
  assert.ok(!/<the claim text>|<the claim_context|<the evidence document>/.test(body), 'no placeholder survives');
});

test('renderDispatch: a missing context renders as "(none)", never as an empty section', () => {
  const frozen = extractFrozenPrompt(fs.readFileSync(PROMPT_MD, 'utf8'));

  for (const context of [undefined, null, '', '   ']) {
    const body = renderDispatch({ frozen, payload: { claim: 'c', context, evidence: 'e' } });
    assert.match(body, /\(none\)/, 'empty context becomes the explicit (none) marker');
  }
});

// The two guards that carry the anti-leak promise. Each is proven to FIRE on the exact shape it exists
// to catch -- a guard that never fires is decoration.
test('renderDispatch: a uid reaching the body is a DispatchError (the judge must not get its gold key)', () => {
  const frozen = extractFrozenPrompt(fs.readFileSync(PROMPT_MD, 'utf8'));

  assert.throws(
    () => renderDispatch({ frozen, payload: { claim: 'see dev00003-0', context: null, evidence: 'e' } }),
    (err) => err instanceof DispatchError && /uid reached the dispatch body/.test(err.message),
    'a uid in ANY substituted field fails closed',
  );

  // DISCRIMINATION: the same shape without the uid renders fine, so the guard keys on the uid alone.
  const ok = renderDispatch({ frozen, payload: { claim: 'see the record', context: null, evidence: 'e' } });
  assert.match(ok, /see the record/);
});

test('renderDispatch: a WiCE gold marker reaching the body is a DispatchError', () => {
  const frozen = extractFrozenPrompt(fs.readFileSync(PROMPT_MD, 'utf8'));

  for (const leak of ['partially_supported', 'not_supported', 'supporting_sentences']) {
    assert.throws(
      () => renderDispatch({ frozen, payload: { claim: 'c', context: null, evidence: 'x ' + leak + ' y' } }),
      (err) => err instanceof DispatchError && /gold marker/.test(err.message),
      leak + ' fails closed',
    );
  }
});

// The end-to-end guarantee over the REAL 60-item set: this is the assertion the metered run relies on.
test('generateDispatch: all 60 real dispatch files are uid-free and gold-free', () => {
  const outDir = mkTmp();

  try {
    const items = loadCalibrationItems();
    const map = generateDispatch({ outDir, items });

    assert.equal(map.length, 60, 'one dispatch per calibration item');
    assert.equal(new Set(map.map((m) => m.uid)).size, 60, 'the orchestrator map covers 60 distinct uids');

    for (const entry of map) {
      const body = fs.readFileSync(path.join(outDir, 'item-' + entry.idx + '.txt'), 'utf8');
      assert.ok(!/dev\d{5}-\d/.test(body), 'no uid in item-' + entry.idx);
      assert.ok(!/supporting_sentences|partially_supported|not_supported/.test(body), 'no gold marker in item-' + entry.idx);
      assert.match(body, /You are a careful fact-checking judge\./, 'item-' + entry.idx + ' carries the frozen prompt');
    }

    // The uid map is written for the ORCHESTRATOR (it names the verdict files) and must never be a
    // dispatch file itself.
    const mapOnDisk = JSON.parse(fs.readFileSync(path.join(outDir, '_map.json'), 'utf8'));
    assert.equal(mapOnDisk.length, 60);
    assert.ok(!fs.existsSync(path.join(outDir, 'item-_map.txt')), 'the map is not dispatched');
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});

test('generateDispatch: each dispatch carries its own item\'s claim (no cross-wiring of payloads)', () => {
  const outDir = mkTmp();

  try {
    const items = loadCalibrationItems();
    const map = generateDispatch({ outDir, items });
    const byUid = new Map(items.map((it) => [it.uid, it]));

    // Spot-check across the range rather than only the head -- an off-by-one in the index/uid pairing
    // would misfile every verdict and silently destroy the calibration.
    for (const entry of [map[0], map[17], map[42], map[59]]) {
      const body = fs.readFileSync(path.join(outDir, 'item-' + entry.idx + '.txt'), 'utf8');
      const expected = buildJudgePayload(byUid.get(entry.uid));
      assert.ok(body.includes(expected.claim), 'item-' + entry.idx + ' carries the claim of ' + entry.uid);
    }
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});
