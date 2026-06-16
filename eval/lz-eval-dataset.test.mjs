// lz-eval-dataset.test.mjs
//
// Validation fixture for the zero-hand-authoring eval DATASET LOADER (Plan 18-04).
// Dev-only eval-tree test: imports the SCRIPT under test (which imports the SHIPPED runtime
// aggregator's hardening primitives across trees, one-directional eval -> runtime) plus node
// stdlib only. No jstat is needed here, but the loader's cross-tree import means this test
// transitively requires the plugin-tree runtime aggregator to resolve; eval/node_modules/ must
// exist for consistent module resolution (`cd eval && npm install`).
//
// The dataset loader MUST run fully OFFLINE: every assertion below is driven by the committed
// vendored WiCE fixtures + the committed derived manifest -- NO network and NO HF_TOKEN. The
// hf-CLI fetch path is exercised only at eval time (Plan 18-05), never here.
//
// Asserts the EVAL-01 / D-02d / D-04 / Pitfall-2 load-bearing behaviors (each a DISTINCT named
// test that genuinely exercises the behavior, never a tautology):
//   - remapLabel: supported -> unrefuted; partially_supported -> refuted (tagged SUBTLE);
//     not_supported -> refuted; an unknown label throws ContractError (fail closed).
//   - the remap is DISCRIMINATING (partially_supported -> refuted is NOT supported -> unrefuted).
//   - verifySha256 fails closed (/checksum mismatch/ naming the file) on a wrong buffer and passes
//     on a matching one -- so a tampered/HTML-error body never silently verifies.
//   - the gated-401 / missing-token path throws an actionable /HF_TOKEN/ (or `hf auth login`)
//     error naming the gated dataset and does NOT retry as transient.
//   - loadManifest maps a committed row to { source, stratum, book, expected_verdict }; a
//     malformed manifest fails closed via ContractError (never a bare JSON.parse crash).
//   - stratify produces the EVAL-01 fractions (~40% supported / ~60% bad, ~half the bad SUBTLE)
//     within tolerance on an offline pool.
//   - the manifest/vendor DRIFT GATE (Task 2): every manifest WiCE uid is covered by a vendored
//     record AND each vendored file's recomputed sha256 matches the manifest -- fail-closed.
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase
// gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-dataset.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real
// test passes. The suite is one file, so the file form is the equivalent reliable gate.
//
// The byte-order mark is code point U+FEFF. In this source it appears ONLY via
// String.fromCharCode(0xFEFF) -- NEVER as a literal byte (ASCII-only source per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  remapLabel,
  verifySha256,
  preflightToken,
  loadManifest,
  stratify,
  STRATA_FRACTIONS,
} from './lz-eval-dataset.mjs';

// Resolve fixtures test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`).
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.join(HERE, '__fixtures__', 'lz-eval-manifest.json');

// ---------------------------------------------------------------------------
// D-02d: WiCE label remap to the FROZEN verdict enum (unrefuted | refuted). The remap is the
// spine of the gate; the test proves it actually FLIPS (not a tautology) and fails closed on an
// unknown label.
// ---------------------------------------------------------------------------

test('D-02d remapLabel maps the three WiCE labels to the frozen enum (subtle tag on partially_supported)', () => {
  assert.equal(remapLabel('supported').expected_verdict, 'unrefuted', 'supported -> unrefuted');
  assert.equal(
    remapLabel('partially_supported').expected_verdict,
    'refuted',
    'partially_supported -> refuted (the SUBTLE substratum)',
  );
  assert.equal(remapLabel('not_supported').expected_verdict, 'refuted', 'not_supported -> refuted');

  // partially_supported is tagged the SUBTLE substratum (the false-uphold trap).
  assert.equal(remapLabel('partially_supported').stratum, 'subtle', 'partially_supported is tagged subtle');
  assert.equal(remapLabel('supported').stratum, 'supported', 'supported stratum tag');
  assert.equal(remapLabel('not_supported').stratum, 'not-supported', 'not_supported stratum tag');
});

test('D-02d remapLabel is DISCRIMINATING: partially_supported -> refuted is NOT supported -> unrefuted', () => {
  // A tautological remap (always returning the same verdict) would pass the prior test if it
  // returned 'refuted' for everything. This guard proves the supported branch genuinely differs
  // from the partially_supported branch -- the remap flips.
  const sup = remapLabel('supported').expected_verdict;
  const ps = remapLabel('partially_supported').expected_verdict;
  assert.notEqual(sup, ps, 'supported and partially_supported must remap to DIFFERENT verdicts');
  assert.equal(sup, 'unrefuted');
  assert.equal(ps, 'refuted');
});

test('D-02d remapLabel fails closed on an unknown label (ContractError, no silent default)', () => {
  assert.throws(
    () => remapLabel('mostly_true'),
    (err) => err.name === 'ContractError' && /unknown wice label/i.test(err.message),
    'an unknown source label must throw ContractError, never default-coerce',
  );
});

// ---------------------------------------------------------------------------
// D-04 / T-18-DATATAMPER: sha256 verify fails closed on a mismatch (never hash an HTML error
// page and pass). The fixture writes the bad/good buffers in-memory -- no committed bad fixture.
// ---------------------------------------------------------------------------

test('D-04 verifySha256 throws /checksum mismatch/ naming the file on a wrong buffer', () => {
  const buf = Buffer.from('the real downloaded bytes', 'utf8');
  const wrongSha = 'deadbeef'.repeat(8); // 64 hex chars, deliberately wrong.

  assert.throws(
    () => verifySha256(buf, wrongSha, 'data/subclaim_dev.jsonl'),
    (err) =>
      err.name === 'ContractError' &&
      /checksum mismatch/i.test(err.message) &&
      err.file === 'data/subclaim_dev.jsonl',
    'a sha256 mismatch must fail closed with the offending file named',
  );
});

test('D-04 verifySha256 passes (returns the digest) when the buffer matches the expected sha', () => {
  const buf = Buffer.from('the real downloaded bytes', 'utf8');
  const expected = createHash('sha256').update(buf).digest('hex');
  const got = verifySha256(buf, expected, 'data/subclaim_dev.jsonl');
  assert.equal(got, expected, 'a matching buffer verifies and returns its digest');
});

// ---------------------------------------------------------------------------
// Pitfall 2 / T-18-TOKENLEAK: a gated dataset without a token surfaces an actionable HF_TOKEN
// error naming the gated dataset and does NOT retry as transient.
// ---------------------------------------------------------------------------

test('Pitfall-2 preflightToken throws an actionable /HF_TOKEN/ error for a gated repo with no token', () => {
  // Simulate the absent-token environment WITHOUT mutating the real process env: pass an explicit
  // empty token resolver. The error must name the gated dataset and mention HF_TOKEN / hf auth login.
  assert.throws(
    () => preflightToken('lytang/LLM-AggreFact', { gated: true, resolveToken: () => null }),
    (err) =>
      err.name === 'ContractError' &&
      /HF_TOKEN/.test(err.message) &&
      /hf auth login/.test(err.message) &&
      /lytang\/LLM-AggreFact/.test(err.message),
    'a gated repo with no token must surface an actionable HF_TOKEN error naming the dataset',
  );
});

test('Pitfall-2 preflightToken passes for a gated repo WHEN a token is present', () => {
  // A present token clears the pre-flight (returns the token). No retry logic is involved.
  const tok = preflightToken('lytang/LLM-AggreFact', { gated: true, resolveToken: () => 'hf_xxx' });
  assert.equal(tok, 'hf_xxx', 'a present token clears the gated pre-flight');
});

test('Pitfall-2 preflightToken does NOT require a token for an UNGATED repo (WiCE closed-book gate)', () => {
  // The WiCE spine is ungated, so the closed-book SUBTLE gate runs with NO token. preflightToken
  // returns null (no token needed) without throwing.
  const tok = preflightToken('jon-tow/wice', { gated: false, resolveToken: () => null });
  assert.equal(tok, null, 'an ungated repo needs no token (WiCE closed-book runs without HF_TOKEN)');
});

// ---------------------------------------------------------------------------
// EVAL-01: the committed derived manifest maps a uid -> { source, stratum, book, expected_verdict };
// a malformed manifest fails closed (ContractError, never a bare JSON.parse crash).
// ---------------------------------------------------------------------------

test('EVAL-01 loadManifest maps the committed manifest rows to a uid -> row index', () => {
  const m = loadManifest(MANIFEST);
  assert.ok(Array.isArray(m.examples) && m.examples.length >= 60, 'manifest has >= 60 examples');

  // Every example exposes the load-bearing fields.
  for (const ex of m.examples) {
    assert.equal(typeof ex.uid, 'string', 'uid is a string');
    assert.ok(ex.expected_verdict === 'unrefuted' || ex.expected_verdict === 'refuted', 'frozen verdict enum');
    assert.equal(typeof ex.stratum, 'string', 'stratum present');
    assert.ok(ex.book === 'open' || ex.book === 'closed', 'book is open|closed');
  }

  // byUid lookup resolves a known WiCE row to its remapped fields.
  const someWice = m.examples.find((e) => e.source === 'wice');
  assert.ok(someWice, 'manifest contains WiCE rows');
  const row = m.byUid.get(someWice.uid);
  assert.equal(row.source, 'wice');
  assert.equal(row.expected_verdict, someWice.expected_verdict);
});

test('EVAL-01 loadManifest fails closed on a malformed manifest (ContractError, not a bare crash)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-manifest-'));

  try {
    const bad = path.join(dir, 'manifest.json');
    fs.writeFileSync(bad, 'not json at all', 'utf8');
    assert.throws(
      () => loadManifest(bad),
      (err) => err.name === 'ContractError' && /malformed JSON|cannot read/.test(err.message),
      'a malformed manifest must fail closed via ContractError',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('EVAL-01 loadManifest fails closed when examples[] is missing/not an array', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-manifest-shape-'));

  try {
    const bad = path.join(dir, 'manifest.json');
    fs.writeFileSync(bad, JSON.stringify({ schema_version: 1, examples: 'oops' }), 'utf8');
    assert.throws(
      () => loadManifest(bad),
      (err) => err.name === 'ContractError' && /examples/i.test(err.message),
      'a manifest without an examples[] array must fail closed',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// EVAL-01 / D-02d: programmatic stratification produces the EVAL-01 fractions (~40% supported /
// ~60% bad, ~half the bad SUBTLE). Driven by an offline labeled pool.
// ---------------------------------------------------------------------------

test('EVAL-01 stratify yields ~40% supported / ~60% bad with ~half the bad SUBTLE (within tolerance)', () => {
  // Build an offline labeled pool with plenty of each WiCE label so the sampler can hit the
  // target fractions. The sampler is deterministic given a fixed target size.
  const pool = [];

  for (let i = 0; i < 200; i += 1) {
    pool.push({ uid: 'sup-' + i, source_label: 'supported' });
  }

  for (let i = 0; i < 200; i += 1) {
    pool.push({ uid: 'ps-' + i, source_label: 'partially_supported' });
  }

  for (let i = 0; i < 200; i += 1) {
    pool.push({ uid: 'ns-' + i, source_label: 'not_supported' });
  }

  const N = 60;
  const sample = stratify(pool, N);
  assert.equal(sample.length, N, 'stratify returns exactly N examples');

  const supported = sample.filter((e) => e.expected_verdict === 'unrefuted').length;
  const bad = N - supported;
  const subtle = sample.filter((e) => e.stratum === 'subtle').length;

  // ~40% supported (0.40) within a +/-0.10 band; ~60% bad is the complement.
  const supFrac = supported / N;
  assert.ok(supFrac >= 0.3 && supFrac <= 0.5, 'supported fraction ~40% (got ' + supFrac.toFixed(2) + ')');

  // ~half the bad is SUBTLE (partially_supported) within tolerance.
  const subtleFracOfBad = subtle / bad;
  assert.ok(
    subtleFracOfBad >= 0.4 && subtleFracOfBad <= 0.6,
    '~half the bad is SUBTLE (got ' + subtleFracOfBad.toFixed(2) + ')',
  );

  // The exported fractions are the frozen contract the loader stratifies to.
  assert.equal(STRATA_FRACTIONS.SUPPORTED_FRACTION, 0.4);
  assert.equal(STRATA_FRACTIONS.BAD_FRACTION, 0.6);
  assert.equal(STRATA_FRACTIONS.SUBTLE_FRACTION_OF_BAD, 0.5);
});

test('EVAL-01 stratify is DISCRIMINATING: a supported-only pool cannot satisfy the bad fraction', () => {
  // A pool with NO bad claims cannot meet the ~60% bad target -- stratify must fail closed rather
  // than silently returning an all-supported (tautological) sample.
  const pool = [];

  for (let i = 0; i < 100; i += 1) {
    pool.push({ uid: 'sup-' + i, source_label: 'supported' });
  }

  assert.throws(
    () => stratify(pool, 60),
    (err) => err.name === 'ContractError' && /insufficient|stratum/i.test(err.message),
    'a pool that cannot satisfy a stratum must fail closed, not return a degenerate sample',
  );
});

// The manifest/vendor DRIFT-GATE test cases (Task 2) are appended below this line.
