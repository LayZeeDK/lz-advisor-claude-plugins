// lz-eval-evidence-join.test.mjs
//
// Validation fixture for the SHARED evidence-text JOIN (Phase 20, Plan 20-05 blocking-bug fix). The join
// reconstructs a survivor cluster's REAL stored evidence TEXT (cluster -> claims -> excerpts) as
// [{ sentence }] -- NEVER a bare URL -- and FLAGS a cluster with no recoverable text so the caller drops it.
// It is shared by BOTH live-cert harvest arms (arm A lz-eval-armA-native.mjs, arm B lz-eval-harvest.mjs).
//
// THIS IS A NO-SPEND TEST. It sets NO LZ_SPEND, dispatches NO real OOF/Copilot call, spawns NO Agent. Every
// fixture is a tmpdir run-dir corpus (zero committed bytes). Every assertion is DISCRIMINATING.
//
// HOST QUIRK (load-bearing): on this host (Node v24.x / Windows arm64 / Git Bash) the phase gate MUST target
// the explicit FILE form: node --test eval/lz-eval-evidence-join.test.mjs (the directory form spuriously
// exits 1 on this host even when every real test passes).
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  joinClusterEvidence,
  resetEvidenceJoinCache,
  EXCERPT_CHAR_CAP,
  EVIDENCE_OVERLAP_JACCARD,
} from './lz-eval-evidence-join.mjs';

// Write a single run-dir with survivors + claims/*.json + excerpts/*.txt. `workers` is an array of
// { source, claims:[{ id, text, quote, excerpt_id }] }; `excerpts` maps excerpt_id -> passage text.
function writeRunDir({ workers = [], excerpts = {} } = {}) {
  resetEvidenceJoinCache();
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-ev-join-'));
  const runDir = path.join(corpus, 'run0');
  fs.mkdirSync(path.join(runDir, 'claims'), { recursive: true });
  fs.mkdirSync(path.join(runDir, 'excerpts'), { recursive: true });
  fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify([], null, 2) + '\n', 'utf8');

  workers.forEach((w, i) => {
    fs.writeFileSync(
      path.join(runDir, 'claims', 'w-extract-' + (i + 1) + '.json'),
      JSON.stringify({ worker: 'w-extract-' + (i + 1), source: w.source, claims: w.claims }, null, 2) + '\n',
      'utf8',
    );
  });

  for (const [id, text] of Object.entries(excerpts)) {
    fs.writeFileSync(path.join(runDir, 'excerpts', id + '.txt'), text, 'utf8');
  }

  return { corpus, runDir };
}

test('the documented thresholds are exported (cap 1200 chars, overlap Jaccard 0.6)', () => {
  assert.equal(EXCERPT_CHAR_CAP, 1200, 'the per-excerpt char cap is the documented 1200');
  assert.equal(EVIDENCE_OVERLAP_JACCARD, 0.6, 'the overlap Jaccard threshold is the documented 0.6');
});

test('joinClusterEvidence EXACT-matches a cluster claim to a worker text and returns quote + excerpt TEXT (never a URL)', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      claims: [{ id: 'c1', text: 'the reaction yields a net energy release', quote: 'net energy release observed', excerpt_id: 'e1' }],
    }],
    excerpts: { e1: 'Lab note: net energy release observed in every trial under standard pressure.' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the reaction yields a net energy release', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'the exact text is matched');
    assert.equal(joined.reason, 'exact', 'the match path is exact');
    assert.ok(!/https?:\/\//.test(JSON.stringify(joined.evidence)), 'the evidence is TEXT, never a URL');
    assert.ok(joined.evidence.some((e) => e.sentence.includes('net energy release observed')), 'the verbatim quote is present');
    assert.ok(joined.evidence.some((e) => e.sentence.includes('every trial under standard pressure')), 'the excerpt passage is joined');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence uses the OVERLAP path (Jaccard >= 0.6) when the cluster claim is a paraphrase', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{
      source: 'https://example.org/doc',
      claims: [{ id: 'c1', text: 'the catalyst markedly accelerates the forward reaction rate', quote: 'catalyst accelerates forward reaction', excerpt_id: 'e1' }],
    }],
    excerpts: { e1: 'The catalyst markedly accelerates the forward reaction rate under load.' },
  });

  try {
    // A paraphrase with high token overlap but NOT byte-exact.
    const joined = joinClusterEvidence(runDir, { claim: 'the catalyst markedly accelerates the forward reaction rate notably', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'the paraphrase matches via overlap');
    assert.equal(joined.reason, 'overlap', 'the match path is overlap');
    assert.ok(joined.evidence.some((e) => e.sentence.includes('catalyst accelerates forward reaction')), 'the worker quote is recovered');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence FLAGS matched:false when the cluster source has no eligible worker claims', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{ source: 'https://example.org/other', claims: [{ id: 'c1', text: 'unrelated text', quote: 'q', excerpt_id: 'e1' }] }],
    excerpts: { e1: 'passage' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'a claim whose source is not present', sources: ['https://example.org/missing'] });

    assert.equal(joined.matched, false, 'no eligible worker claim -> matched:false');
    assert.equal(joined.evidence.length, 0, 'no evidence emitted');
    assert.equal(joined.reason, 'no-eligible-worker-claims-for-cluster-sources', 'the reason names the missing source scope');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence FLAGS matched:false when an eligible worker claim exists but none matches the cluster claim', () => {
  const { corpus, runDir } = writeRunDir({
    workers: [{ source: 'https://example.org/doc', claims: [{ id: 'c1', text: 'completely different subject matter entirely', quote: 'q', excerpt_id: 'e1' }] }],
    excerpts: { e1: 'passage' },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'zzz qqq vvv no shared tokens at all', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, false, 'an eligible-but-non-matching worker claim -> matched:false');
    assert.equal(joined.reason, 'no-worker-claim-matched-cluster-claim', 'the reason names the no-match');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence caps the excerpt at 1200 chars + strips non-ASCII bytes; the quote is emitted in full', () => {
  const big = 'X'.repeat(5000);
  const accented = 'mu' + String.fromCharCode(0x00b5) + ' alpha ' + String.fromCharCode(0x03b1) + ' done'; // non-ASCII micro + alpha
  const { corpus, runDir } = writeRunDir({
    workers: [{ source: 'https://example.org/doc', claims: [{ id: 'c1', text: 'the cap claim', quote: accented, excerpt_id: 'e1' }] }],
    excerpts: { e1: big },
  });

  try {
    const joined = joinClusterEvidence(runDir, { claim: 'the cap claim', sources: ['https://example.org/doc'] });

    assert.equal(joined.matched, true, 'matched');

    for (const e of joined.evidence) {
      assert.ok(e.sentence.length <= EXCERPT_CHAR_CAP, 'no sentence exceeds the cap');

      for (let i = 0; i < e.sentence.length; i += 1) {
        assert.ok(e.sentence.charCodeAt(i) <= 0x7f, 'every char is ASCII');
      }
    }

    assert.ok(joined.evidence.some((e) => e.sentence.includes('mu alpha') && e.sentence.includes('done')), 'the quote is recovered with non-ASCII bytes stripped');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence fails closed on a missing run-dir path / non-object cluster (ContractError)', () => {
  assert.throws(() => joinClusterEvidence('', { claim: 'x', sources: [] }), (e) => e.name === 'ContractError', 'empty run dir fails closed');
  assert.throws(() => joinClusterEvidence('/tmp/whatever', null), (e) => e.name === 'ContractError', 'a null cluster fails closed');
});

test('joinClusterEvidence fails closed on a malformed worker file (missing claims[] array)', () => {
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-ev-join-bad-'));
  const runDir = path.join(corpus, 'run0');
  fs.mkdirSync(path.join(runDir, 'claims'), { recursive: true });
  fs.writeFileSync(path.join(runDir, 'claims', 'w-extract-1.json'), JSON.stringify({ worker: 'w', source: 's' }) + '\n', 'utf8');

  try {
    resetEvidenceJoinCache();
    assert.throws(
      () => joinClusterEvidence(runDir, { claim: 'x', sources: ['s'] }),
      (e) => e.name === 'ContractError' && /claims\[\] array/.test(e.message),
      'a worker file without a claims[] array fails closed',
    );
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('the shared join source carries NO LZ_SPEND / network code and is strictly ASCII (no BOM)', () => {
  const buf = fs.readFileSync(new URL('./lz-eval-evidence-join.mjs', import.meta.url));
  assert.notEqual(buf[0], 0xef, 'no UTF-8 BOM byte 0');

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'byte ' + i + ' is ASCII (<= 0x7f): got 0x' + buf[i].toString(16));
  }

  const src = buf.toString('utf8');
  assert.ok(!/process\.env\.LZ_SPEND/.test(src), 'the join carries no LZ_SPEND code path (pure on-disk)');
  assert.ok(!/\bfetch\s*\(/.test(src), 'the join performs no network fetch');
});
