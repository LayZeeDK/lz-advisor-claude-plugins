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
  fetchDataset,
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

// ---------------------------------------------------------------------------
// D-04 (drift fails closed at Wave 2 -- Task 2): the manifest's WiCE uid set is COVERED by the
// vendored records under eval/__fixtures__/wice-vendored/ and each vendored file's recomputed
// sha256 MATCHES its manifest entry. Any miss or mismatch fails the test (ContractError). The
// coverage assertion is discriminating (matched count >= 1 AND equals the manifest WiCE uid count
// -- a vacuous empty scan cannot pass). This is the gate that makes manifest/vendor drift fail at
// Wave 2, not at the costly live eval run.
// ---------------------------------------------------------------------------

const WICE_DIR = path.join(HERE, '__fixtures__', 'wice-vendored');
const WICE_RECORDS = path.join(WICE_DIR, 'records');

test('D-04 manifest/vendor DRIFT GATE: every manifest WiCE uid is vendored AND its sha256 matches', () => {
  const m = loadManifest(MANIFEST);

  // The WiCE source row carries the per-vendored-file sha256.
  const wiceSource = m.sources.find((s) => s.id === 'wice');
  assert.ok(wiceSource, 'manifest has a WiCE source entry');
  assert.equal(wiceSource.vendored, true, 'WiCE is marked vendored');

  const manifestWiceUids = m.examples.filter((e) => e.source === 'wice').map((e) => e.uid);
  assert.ok(manifestWiceUids.length >= 1, 'there is at least one WiCE example (non-vacuous)');

  // (a) COVERAGE: every manifest WiCE uid has a matching vendored record under records/.
  let matched = 0;

  for (const uid of manifestWiceUids) {
    const recPath = path.join(WICE_RECORDS, uid + '.json');
    assert.ok(fs.existsSync(recPath), 'manifest WiCE uid is vendored: ' + uid);
    matched += 1;
  }

  assert.equal(
    matched,
    manifestWiceUids.length,
    'matched-uid count must equal the manifest WiCE uid count (no vacuous empty-set pass)',
  );

  // (b) sha256 MATCH: recompute sha256 over each vendored file (raw committed bytes) and assert it
  // equals the manifest's recorded sha256 for that file. verifySha256 fails closed on mismatch.
  for (const sf of wiceSource.files) {
    const recPath = path.join(WICE_DIR, sf.file);
    assert.ok(fs.existsSync(recPath), 'manifest source file is vendored: ' + sf.file);
    const buf = fs.readFileSync(recPath);
    // verifySha256 throws ContractError /checksum mismatch/ on any divergence.
    const got = verifySha256(buf, sf.sha256, sf.file);
    assert.equal(got, sf.sha256, 'recomputed sha256 matches the manifest for ' + sf.file);
  }

  // The vendored uid set must equal the manifest source-file set (no orphan vendored records and
  // none missing).
  const vendoredUids = fs
    .readdirSync(WICE_RECORDS)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -'.json'.length))
    .sort();
  const manifestUidSet = [...manifestWiceUids].sort();
  assert.deepEqual(vendoredUids, manifestUidSet, 'no orphan vendored records and none missing');
});

test('D-04 DRIFT GATE is DISCRIMINATING: a tampered vendored buffer fails the sha256 check', () => {
  // Prove the drift gate would FIRE on a real regression: a single flipped byte in a vendored
  // record yields a different sha256, and verifySha256 throws. (We do NOT mutate the committed
  // tree; we tamper an in-memory copy of a real vendored file against its manifest sha.)
  const m = loadManifest(MANIFEST);
  const wiceSource = m.sources.find((s) => s.id === 'wice');
  const sf = wiceSource.files[0];
  const recPath = path.join(WICE_DIR, sf.file);
  const buf = fs.readFileSync(recPath);
  const tampered = Buffer.from(buf);
  tampered[0] = tampered[0] === 0x7b ? 0x20 : 0x7b; // flip the leading byte

  assert.throws(
    () => verifySha256(tampered, sf.sha256, sf.file),
    (err) => err.name === 'ContractError' && /checksum mismatch/i.test(err.message),
    'a tampered vendored record must fail the drift gate (sha256 mismatch)',
  );
});

// ---------------------------------------------------------------------------
// Plan 19-03 / EVAL-01 / D-07: the manifest gains the AVeriTeC OPEN-BOOK retrieval-difficulty strata
// rows (buried / evidence-absent / date-sensitive). The drift gate is extended to cover them:
//   - every AVeriTeC example uid is covered (and the matched-count == uid-count discriminating guard
//     holds -- no vacuous empty-set pass);
//   - NO AVeriTeC row carries a `text` field (the CC-BY-NC license-clean assertion -- mutated NC
//     text lives ONLY in gitignored eval/.cache/, never the committed manifest, D-07/Pitfall 5);
//   - the UPDATED 'averitec' source row is gated:false + repoType:'model' (D-12), repoType-
//     discriminable from WiCE, with a pinned revision + per-file sha256, and there is EXACTLY ONE
//     chenxwh/AVeriTeC source entry (the existing wrong-gated row was corrected in place, not
//     duplicated).
// The OQ-1 leakage probe (lz-eval-traps.mjs leakageProbe) screened the dev-KS seeds CLEAN BEFORE this
// manifest was locked; that gate is exercised in lz-eval-traps.test.mjs (the probe DISCRIMINATES) and
// was run on the real seeds at construction time (exit 0).
// ---------------------------------------------------------------------------

test('EVAL-01 AVeriTeC open-book DRIFT GATE: every AVeriTeC uid is covered AND the strata discriminate', () => {
  const m = loadManifest(MANIFEST);

  const avtRows = m.examples.filter((e) => e.source === 'averitec');
  assert.ok(avtRows.length >= 1, 'there is at least one AVeriTeC example (non-vacuous)');

  // (a) COVERAGE: the matched-count must equal the AVeriTeC uid count (no vacuous empty-set pass).
  const avtUids = avtRows.map((e) => e.uid);
  let matched = 0;

  for (const uid of avtUids) {
    assert.equal(typeof uid, 'string', 'AVeriTeC uid is a string');
    assert.ok(uid.length > 0, 'AVeriTeC uid is non-empty');
    matched += 1;
  }

  assert.equal(matched, avtUids.length, 'matched-uid count must equal the AVeriTeC uid count (no vacuous pass)');

  // No duplicate AVeriTeC uids (loadManifest already fails closed on dupes; assert here too).
  assert.equal(new Set(avtUids).size, avtUids.length, 'AVeriTeC uids are unique');

  // (b) STRATA DISCRIMINATE: the open-book rows span the three retrieval-difficulty strata so the
  // set is not a single-stratum (non-discriminating) sample.
  const strata = new Set(avtRows.map((e) => e.stratum));

  for (const s of ['buried', 'evidence-absent', 'date-sensitive']) {
    assert.ok(strata.has(s), 'the AVeriTeC open-book set includes the ' + s + ' stratum');
  }

  assert.ok(strata.size >= 3, 'the open-book rows DISCRIMINATE across >= 3 strata (not a single stratum)');
});

test('EVAL-01 license-clean: NO AVeriTeC row carries a `text` field (CC-BY-NC, D-07/Pitfall 5)', () => {
  const m = loadManifest(MANIFEST);
  const avtRows = m.examples.filter((e) => e.source === 'averitec');

  // The committed manifest carries uids + remapped labels + the mutation recipe/seed -- NEVER the
  // mutated NC claim prose. A `text` field on any AVeriTeC row is a license violation.
  for (const row of avtRows) {
    assert.equal('text' in row, false, 'AVeriTeC row ' + row.uid + ' must NOT carry a text field (NC license)');
    // Each AVeriTeC trap row instead carries the mutation recipe (method, not text).
    assert.ok(row.recipe && typeof row.recipe === 'object', 'AVeriTeC row ' + row.uid + ' carries the mutation recipe');
    assert.equal(typeof row.recipe.transform, 'string', 'the recipe records the transform class');
    assert.equal(typeof row.recipe.uid_seed, 'number', 'the recipe records the source seed claim_id');
  }

  // DISCRIMINATING: a vacuous empty AVeriTeC set would pass the loop trivially -- assert non-empty.
  assert.ok(avtRows.length >= 1, 'the no-text assertion is non-vacuous (>= 1 AVeriTeC row)');
});

test('D-12 the AVeriTeC source row is gated:false + repoType:model, distinct from WiCE, NOT duplicated', () => {
  const m = loadManifest(MANIFEST);

  // EXACTLY ONE chenxwh/AVeriTeC source entry (the wrong-gated row was corrected in place, not added).
  const avtSources = m.sources.filter((s) => s.repo === 'chenxwh/AVeriTeC');
  assert.equal(avtSources.length, 1, 'exactly one chenxwh/AVeriTeC source entry (no duplicate add)');

  const avt = avtSources[0];
  assert.equal(avt.id, 'averitec', 'the AVeriTeC source id is averitec');
  assert.equal(avt.gated, false, 'AVeriTeC is gated:false (D-12: an ungated model repo, token-free)');
  assert.equal(avt.repoType, 'model', 'AVeriTeC repoType is model (D-12)');
  assert.equal(avt.vendored, false, 'AVeriTeC is fetch-only (never vendored)');
  assert.equal(avt.license, 'CC-BY-NC-4.0', 'AVeriTeC license is CC-BY-NC-4.0');

  // The revision is pinned (NOT the placeholder, NOT a moving ref).
  assert.ok(/^[0-9a-f]{40}$/.test(avt.revision), 'AVeriTeC revision is a pinned 40-hex commit (not PENDING/main)');
  assert.notEqual(avt.revision, 'PENDING_ENUMERATE_AT_EVAL_TIME', 'the placeholder revision was replaced');

  // Per-file sha256 is pinned for the fetch-only KS files (the integrity guard) -- valid 64-hex.
  assert.ok(Array.isArray(avt.files) && avt.files.length >= 1, 'AVeriTeC carries pinned files');

  for (const f of avt.files) {
    assert.ok(/^[0-9a-f]{64}$/.test(f.sha256), 'AVeriTeC file ' + f.file + ' has a valid 64-hex sha256');
  }

  // DISCRIMINATING (repoType differs from WiCE -- not a blanket flip): WiCE stays dataset.
  const wice = m.sources.find((s) => s.id === 'wice');
  assert.notEqual(avt.repoType || 'dataset', wice.repoType || 'dataset', 'AVeriTeC repoType differs from WiCE (per-source, not blanket)');
  assert.equal(wice.repoType || 'dataset', 'dataset', 'WiCE stays a dataset repo');
});

test('EVAL-01 the existing WiCE drift-gate assertions are UNCHANGED by the AVeriTeC extension', () => {
  // Re-assert the WiCE coverage + sha256 invariants hold after the manifest extension (no relaxation).
  const m = loadManifest(MANIFEST);
  const wiceSource = m.sources.find((s) => s.id === 'wice');
  assert.equal(wiceSource.vendored, true, 'WiCE stays vendored');

  const manifestWiceUids = m.examples.filter((e) => e.source === 'wice').map((e) => e.uid);
  assert.ok(manifestWiceUids.length >= 1, 'WiCE examples remain present');

  for (const uid of manifestWiceUids) {
    const recPath = path.join(WICE_RECORDS, uid + '.json');
    assert.ok(fs.existsSync(recPath), 'WiCE uid still vendored after the AVeriTeC extension: ' + uid);
  }

  // A spot sha256 recompute on the first WiCE file still matches (no relaxation of the integrity gate).
  const sf = wiceSource.files[0];
  const buf = fs.readFileSync(path.join(WICE_DIR, sf.file));
  const got = verifySha256(buf, sf.sha256, sf.file);
  assert.equal(got, sf.sha256, 'WiCE sha256 integrity is intact after the AVeriTeC extension');
});

// ---------------------------------------------------------------------------
// D-12 (loader fix -- per-source parameterization, NOT a blanket flip): fetchDataset must thread a
// per-source `repoType` (default 'dataset') and emit it as the `--repo-type` arg, so AVeriTeC fetches
// as a 'model' repo while WiCE stays 'dataset'. A capturing `runner` (the existing injectable seam)
// records the argv WITHOUT shelling out. The assertions are DISCRIMINATING (assert.notEqual style):
// they prove the per-source value actually FLIPS, never that fetchDataset emits a constant.
// ---------------------------------------------------------------------------

// A capturing runner: records the argv passed to `hf` and returns a clean exit (status 0) so
// fetchDataset completes without touching the network. The download dir is never created.
function captureRunner() {
  const calls = [];
  const runner = (cmd, args) => {
    calls.push({ cmd, args });

    return { status: 0, stdout: '', stderr: '' };
  };

  return { runner, calls };
}

// Pull the value following a flag out of an argv array (e.g. flagValue(args, '--repo-type')).
function flagValue(args, flag) {
  const i = args.indexOf(flag);

  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
}

test('D-12 fetchDataset emits --repo-type model for an AVeriTeC-shaped (model+ungated) call', () => {
  const { runner, calls } = captureRunner();
  // chenxwh/AVeriTeC is an UNGATED `model` repo (D-12): repoType:'model', gated:false -> token-free.
  fetchDataset('chenxwh/AVeriTeC', {
    revision: 'a'.repeat(40),
    repoType: 'model',
    gated: false,
    runner,
  });

  assert.equal(calls.length, 1, 'fetchDataset shelled out exactly once');
  assert.equal(flagValue(calls[0].args, '--repo-type'), 'model', 'AVeriTeC fetches as --repo-type model');
  assert.equal(calls[0].args[0], 'download', 'hf download invocation');
  assert.ok(calls[0].args.includes('chenxwh/AVeriTeC'), 'the repo is the AVeriTeC repo');
});

test('D-12 fetchDataset emits --repo-type dataset for a WiCE-shaped (dataset+ungated) call', () => {
  const { runner, calls } = captureRunner();
  // jon-tow/wice stays a real `dataset` repo (Pitfall 6: a blanket --repo-type model flip would 404).
  fetchDataset('jon-tow/wice', {
    revision: 'b'.repeat(40),
    repoType: 'dataset',
    gated: false,
    runner,
  });

  assert.equal(flagValue(calls[0].args, '--repo-type'), 'dataset', 'WiCE fetches as --repo-type dataset');
});

test('D-12 fetchDataset DISCRIMINATES: the --repo-type flips per source (model vs dataset)', () => {
  // The load-bearing anti-blanket-flip assertion: the SAME function emits DIFFERENT --repo-type
  // values for the two sources. A blanket flip (or a hardcode) would make these equal.
  const avt = captureRunner();
  fetchDataset('chenxwh/AVeriTeC', { revision: 'a'.repeat(40), repoType: 'model', gated: false, runner: avt.runner });
  const wice = captureRunner();
  fetchDataset('jon-tow/wice', { revision: 'b'.repeat(40), repoType: 'dataset', gated: false, runner: wice.runner });

  const avtType = flagValue(avt.calls[0].args, '--repo-type');
  const wiceType = flagValue(wice.calls[0].args, '--repo-type');
  assert.notEqual(avtType, wiceType, 'the per-source --repo-type values must DIFFER (not a blanket flip)');
  assert.equal(avtType, 'model');
  assert.equal(wiceType, 'dataset');
});

test('D-12 fetchDataset defaults repoType to dataset when omitted (back-compat)', () => {
  const { runner, calls } = captureRunner();
  // No repoType passed -> the default is 'dataset' (existing WiCE callers are byte-unaffected).
  fetchDataset('jon-tow/wice', { revision: 'c'.repeat(40), gated: false, runner });

  assert.equal(flagValue(calls[0].args, '--repo-type'), 'dataset', 'omitted repoType defaults to dataset');
});

test('D-12 fetchDataset does NOT throw for an ungated repo with no token (preflightToken returns null)', () => {
  const { runner } = captureRunner();
  // An ungated source with no token must clear the pre-flight (no HF_TOKEN required) and proceed.
  assert.doesNotThrow(
    () =>
      fetchDataset('chenxwh/AVeriTeC', {
        revision: 'a'.repeat(40),
        repoType: 'model',
        gated: false,
        runner,
      }),
    'an ungated AVeriTeC fetch needs no token (gated:false -> preflightToken returns null)',
  );
});
