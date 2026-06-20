// lz-eval-harvest.test.mjs
//
// Validation fixture for the LIVE over-refusal control-set + dense-trap monitor-set LOADER (Plan 20-02,
// Task 1; D-02 / D-03). Dev-only eval-tree test: imports the SCRIPT under test (which imports the SHIPPED
// runtime aggregator's hardening primitives ACROSS trees, one-directional eval -> runtime) plus node
// stdlib. NO model spend, NO network -- the loader is a PURE function of an on-disk STUB run-dir corpus
// written to a tmpdir (zero committed bytes).
//
// Every behavior assertion is DISCRIMINATING (proves the loader actually selects / stratifies / separates),
// never a tautology that would pass if the function returned a constant. Coverage (each a DISTINCT named
// test):
//   - SUPPORTED-only selection: a non-SUPPORTED (Low/Contested/Unsupported) survivor in the stub corpus
//     is EXCLUDED from the over-refusal control arm;
//   - dense / contested oversampling: the dense band is OVER-represented vs a flat sample (a discriminating
//     pair -- the dense claims rank ahead of the sparse ones, never a tautology);
//   - two-arms-NEVER-pooled: the over-refusal arm and the dense-trap arm are SEPARATE arrays, DISJOINT
//     (no shared member), and the result carries no combined-N field;
//   - fail-closed reads on a malformed run dir (a non-array survivors.json, a malformed record).
//
// HOST QUIRK (load-bearing): on this host (Node v24.x / Windows arm64 / Git Bash) the phase gate MUST
// target the explicit FILE form:
//   node --test eval/lz-eval-harvest.test.mjs
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
  harvest,
  readRunDirClaims,
  listRunDirs,
  stratifyOversampleDense,
  isSupportedClaim,
  isDenseClaim,
  HARVEST_TARGETS,
} from './lz-eval-harvest.mjs';

import { resetEvidenceJoinCache } from './lz-eval-evidence-join.mjs';

// Resolve test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and headless
// `claude -p`). The stub corpus is written to a per-test tmpdir, not under HERE, so no committed bytes.
const HERE = path.dirname(fileURLToPath(import.meta.url));
void HERE;

// ---------------------------------------------------------------------------
// Helper: write a stub run-dir corpus. `dirs` maps a run-dir basename -> an array of survivor records.
// Each run dir gets a survivors.json. Returns the corpus dir path. The records use the FROZEN survivor
// shape ({id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence, escalate}).
// ---------------------------------------------------------------------------
function writeCorpus(dirs) {
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-harvest-corpus-'));

  for (const [name, survivors] of Object.entries(dirs)) {
    const runDir = path.join(corpus, name);
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify(survivors, null, 2) + '\n', 'utf8');
  }

  return corpus;
}

// Build a survivor record with the frozen shape (sensible defaults; override per test).
function survivor({ id, confidence = 'High', corroboration = 1, escalate = false }) {
  return {
    id,
    claim: 'claim ' + id,
    sources: Array.from({ length: corroboration }, (_v, i) => 's' + i),
    corroboration_lower_bound: corroboration,
    quote_fidelity: 'verified',
    confidence,
    escalate,
  };
}

// ===========================================================================
// SUPPORTED-only selection (D-02): only High/Medium-confidence survivors are live positives.
// ===========================================================================

test('isSupportedClaim DISCRIMINATES: High/Medium are SUPPORTED; Low/Contested/Unsupported are NOT', () => {
  assert.equal(isSupportedClaim(survivor({ id: 'a', confidence: 'High' })), true, 'High is SUPPORTED');
  assert.equal(isSupportedClaim(survivor({ id: 'b', confidence: 'Medium' })), true, 'Medium is SUPPORTED');
  assert.equal(isSupportedClaim(survivor({ id: 'c', confidence: 'Low' })), false, 'Low is NOT a SUPPORTED positive');
  assert.equal(isSupportedClaim(survivor({ id: 'd', confidence: 'Contested' })), false, 'Contested is NOT a SUPPORTED positive');
  assert.equal(isSupportedClaim(survivor({ id: 'e', confidence: 'Unsupported' })), false, 'Unsupported is NOT a SUPPORTED positive');
});

test('harvest EXCLUDES a non-SUPPORTED claim from the over-refusal control arm (SUPPORTED-only selection)', () => {
  // The stub corpus mixes SUPPORTED (High/Medium) positives with a Low + an Unsupported survivor. The
  // over-refusal control arm must contain ONLY the SUPPORTED claims -- the Low/Unsupported are excluded.
  const survivors = [
    survivor({ id: 'cluster0', confidence: 'High', corroboration: 3 }),
    survivor({ id: 'cluster1', confidence: 'Medium', corroboration: 2 }),
    survivor({ id: 'cluster2', confidence: 'Low', corroboration: 3 }),
    survivor({ id: 'cluster3', confidence: 'Unsupported', corroboration: 4 }),
    survivor({ id: 'cluster4', confidence: 'High', corroboration: 1 }),
  ];
  const corpus = writeCorpus({ run0: survivors });

  try {
    const res = harvest({ corpusDir: corpus });
    const allClaims = [...res.overRefusalControls, ...res.denseTrapMonitor];
    const ids = allClaims.map((r) => r.id);

    // Exactly the 3 SUPPORTED claims (cluster0/1/4) are harvested; the Low + Unsupported are excluded.
    assert.equal(res.nCtrl + res.nTrap, 3, 'only the 3 SUPPORTED (High/Medium) claims are harvested across both arms');
    assert.ok(!ids.includes('cluster2'), 'the Low-confidence claim is EXCLUDED');
    assert.ok(!ids.includes('cluster3'), 'the Unsupported claim is EXCLUDED');
    assert.ok(ids.includes('cluster0') && ids.includes('cluster1') && ids.includes('cluster4'), 'all 3 SUPPORTED claims are present');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// Dense / contested oversampling (D-02): the dense band is over-represented vs a flat sample.
// ===========================================================================

test('isDenseClaim DISCRIMINATES: >= source floor OR Contested is dense; a single-source High is sparse', () => {
  assert.equal(isDenseClaim(survivor({ id: 'a', confidence: 'High', corroboration: 3 })), true, '3 sources >= floor -> dense');
  assert.equal(isDenseClaim(survivor({ id: 'b', confidence: 'High', corroboration: 1 })), false, '1 source < floor -> sparse');
  assert.equal(isDenseClaim(survivor({ id: 'c', confidence: 'Contested', corroboration: 1 })), true, 'Contested -> dense regardless of source count');
});

test('stratifyOversampleDense ranks the dense band AHEAD of the sparse band (front-weighted oversampling)', () => {
  // A discriminating pair: with one dense (3-source) and one sparse (1-source) SUPPORTED claim, the dense
  // claim must rank FIRST in the ordered stream -- so a fixed-size front draw oversamples dense vs a flat
  // (uid-sorted) sample where the sparse claim could lead.
  const dense = Object.assign(survivor({ id: 'cZ', confidence: 'High', corroboration: 3 }), { __uid: 'r::cZ' });
  const sparse = Object.assign(survivor({ id: 'cA', confidence: 'High', corroboration: 1 }), { __uid: 'r::cA' });
  // Pass them in the order that a FLAT uid-sort would put sparse (cA) first -- proving the stratifier
  // re-orders dense ahead, not merely preserving input order.
  const strata = stratifyOversampleDense([sparse, dense]);

  assert.equal(strata.dense.length, 1, 'one dense claim');
  assert.equal(strata.sparse.length, 1, 'one sparse claim');
  assert.equal(strata.ordered[0].id, 'cZ', 'the dense claim ranks FIRST (oversampled), ahead of the alphabetically-earlier sparse cA');
  assert.equal(strata.ordered[1].id, 'cA', 'the sparse claim ranks AFTER the dense band');
});

test('harvest OVERSAMPLES the dense band vs a flat sample (the dense-trap arm draws dense claims first)', () => {
  // 2 dense (3-source) + 3 sparse (1-source) SUPPORTED claims. With a small nTrapTarget=2, the dense-trap
  // monitor arm must be EXACTLY the 2 dense claims -- proving the dense band is over-represented (a flat
  // sample would mix in sparse claims).
  const survivors = [
    survivor({ id: 'dense0', confidence: 'High', corroboration: 3 }),
    survivor({ id: 'sparse0', confidence: 'High', corroboration: 1 }),
    survivor({ id: 'dense1', confidence: 'Medium', corroboration: 4 }),
    survivor({ id: 'sparse1', confidence: 'High', corroboration: 1 }),
    survivor({ id: 'sparse2', confidence: 'Medium', corroboration: 1 }),
  ];
  const corpus = writeCorpus({ run0: survivors });

  try {
    const res = harvest({ corpusDir: corpus, nTrapTarget: 2, nCtrlTarget: 40 });
    const trapIds = res.denseTrapMonitor.map((r) => r.id);

    assert.equal(res.nTrap, 2, 'the dense-trap arm fills to nTrapTarget=2');
    assert.ok(trapIds.includes('dense0') && trapIds.includes('dense1'), 'the dense-trap arm is the 2 DENSE claims (oversampled)');
    assert.ok(!trapIds.some((id) => id.startsWith('sparse')), 'no sparse claim leaked into the dense-trap arm (over-represents dense)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// Two arms NEVER pooled (D-03): separate, disjoint arrays; no combined-N field.
// ===========================================================================

test('harvest returns TWO DISTINCT arms that are DISJOINT and NEVER pooled into one N (D-03)', () => {
  // Enough SUPPORTED claims to fill both arms with disjoint draws. The two arms must be SEPARATE arrays,
  // share NO member uid, and the result must carry NO combined-N field (pooling is the defect this guards).
  const survivors = [];

  for (let i = 0; i < 12; i += 1) {
    // Half dense (3-source), half sparse (1-source) -- all SUPPORTED High.
    survivors.push(survivor({ id: 'cluster' + String(i).padStart(2, '0'), confidence: 'High', corroboration: i % 2 === 0 ? 3 : 1 }));
  }

  const corpus = writeCorpus({ run0: survivors });

  try {
    const res = harvest({ corpusDir: corpus, nCtrlTarget: 4, nTrapTarget: 3 });

    assert.ok(Array.isArray(res.overRefusalControls), 'the over-refusal control arm is its own array');
    assert.ok(Array.isArray(res.denseTrapMonitor), 'the dense-trap monitor arm is its own array');
    assert.notEqual(res.overRefusalControls, res.denseTrapMonitor, 'the two arms are DISTINCT array objects');

    // DISJOINT: no uid appears in both arms (no double-count, no pooling).
    const ctrlUids = new Set(res.overRefusalControls.map((r) => r.uid));
    const overlap = res.denseTrapMonitor.filter((r) => ctrlUids.has(r.uid));
    assert.equal(overlap.length, 0, 'the two arms are DISJOINT -- no member appears in both (no pooling)');

    // The result reports counts PER ARM and carries NO combined-N field (summing them is forbidden).
    assert.equal(typeof res.nCtrl, 'number', 'nCtrl reported per arm');
    assert.equal(typeof res.nTrap, 'number', 'nTrap reported per arm');
    assert.equal(res.nCtrl, res.overRefusalControls.length, 'nCtrl matches the control arm length');
    assert.equal(res.nTrap, res.denseTrapMonitor.length, 'nTrap matches the trap arm length');
    assert.ok(!('n' in res) && !('nPooled' in res) && !('nTotal' in res), 'the result carries NO combined-N field (the two arms are NEVER pooled)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('harvest is a PURE function of the corpus: two calls return byte-identical arms (no PRNG, reproducible)', () => {
  const survivors = [];

  for (let i = 0; i < 8; i += 1) {
    survivors.push(survivor({ id: 'cluster' + i, confidence: 'High', corroboration: i % 2 === 0 ? 3 : 1 }));
  }

  const corpus = writeCorpus({ run0: survivors, run1: survivors.map((s) => Object.assign({}, s, { id: s.id + 'b' })) });

  try {
    const a = harvest({ corpusDir: corpus, nCtrlTarget: 5, nTrapTarget: 3 });
    const b = harvest({ corpusDir: corpus, nCtrlTarget: 5, nTrapTarget: 3 });

    assert.deepEqual(a.overRefusalControls, b.overRefusalControls, 'the over-refusal arm is reproducible (no PRNG)');
    assert.deepEqual(a.denseTrapMonitor, b.denseTrapMonitor, 'the dense-trap arm is reproducible (no PRNG)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('harvest qualifies cluster ids by run dir (a repeated cluster id across run dirs is distinct)', () => {
  // The same cluster0 id appears in two run dirs; the harvest uids must be distinct (run-dir-qualified).
  const corpus = writeCorpus({
    runA: [survivor({ id: 'cluster0', confidence: 'High', corroboration: 3 })],
    runB: [survivor({ id: 'cluster0', confidence: 'High', corroboration: 3 })],
  });

  try {
    const res = harvest({ corpusDir: corpus, nCtrlTarget: 40, nTrapTarget: 40 });
    const all = [...res.overRefusalControls, ...res.denseTrapMonitor];
    const uids = all.map((r) => r.uid);

    assert.equal(new Set(uids).size, uids.length, 'every harvested uid is distinct (run-dir-qualified)');
    assert.ok(uids.includes('runA::cluster0') && uids.includes('runB::cluster0'), 'the run-dir prefix disambiguates the repeated cluster id');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('harvest reports below-floor flags on a short corpus (Stage-0 / D-19 reads these; the loader never throws)', () => {
  // A corpus with too few SUPPORTED claims to clear the frozen floors (30). The harvester does NOT throw
  // (the feasibility decision is Stage 0 / D-19); it REPORTS the shortfall.
  const corpus = writeCorpus({ run0: [survivor({ id: 'cluster0', confidence: 'High', corroboration: 3 })] });

  try {
    const res = harvest({ corpusDir: corpus });
    assert.equal(res.belowTrapFloor, true, 'a 1-claim corpus is below the N_trap floor (30)');
    assert.equal(res.belowCtrlFloor, true, 'a 1-claim corpus is below the N_ctrl floor (30)');
    assert.equal(HARVEST_TARGETS.N_CTRL_FLOOR, 30, 'the frozen-floor headroom N_ctrl floor is 30 (D-03)');
    assert.equal(HARVEST_TARGETS.N_TRAP_FLOOR, 30, 'the frozen-floor headroom N_trap floor is 30 (D-03)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// Fail-closed reads (mirror the offline readJson / scorePositiveControls discipline).
// ===========================================================================

test('readRunDirClaims fails closed on a malformed run dir (non-array survivors.json, malformed record, missing file)', () => {
  // (1) non-array survivors.json.
  const badArr = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-harvest-bad-'));
  fs.mkdirSync(path.join(badArr, 'run0'), { recursive: true });
  fs.writeFileSync(path.join(badArr, 'run0', 'survivors.json'), JSON.stringify({ not: 'an array' }) + '\n', 'utf8');

  // (2) a malformed record (missing confidence).
  const badRec = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-harvest-bad-'));
  fs.mkdirSync(path.join(badRec, 'run0'), { recursive: true });
  fs.writeFileSync(path.join(badRec, 'run0', 'survivors.json'), JSON.stringify([{ id: 'cluster0', claim: 'x' }]) + '\n', 'utf8');

  // (3) a missing survivors.json.
  const missing = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-harvest-bad-'));
  fs.mkdirSync(path.join(missing, 'run0'), { recursive: true });

  try {
    assert.throws(
      () => readRunDirClaims(path.join(badArr, 'run0')),
      (e) => e.name === 'ContractError' && /must be an array/.test(e.message),
      'a non-array survivors.json fails closed',
    );
    assert.throws(
      () => readRunDirClaims(path.join(badRec, 'run0')),
      (e) => e.name === 'ContractError' && /confidence/.test(e.message),
      'a record missing confidence fails closed',
    );
    assert.throws(
      () => readRunDirClaims(path.join(missing, 'run0')),
      (e) => e.name === 'ContractError' && /no survivors\.json/.test(e.message),
      'a missing survivors.json fails closed',
    );
  } finally {
    fs.rmSync(badArr, { recursive: true, force: true });
    fs.rmSync(badRec, { recursive: true, force: true });
    fs.rmSync(missing, { recursive: true, force: true });
  }
});

test('harvest propagates a malformed-run-dir fail (the corpus read fails closed, never silently skips bad data)', () => {
  // A run dir with a malformed record: harvest must fail closed (it reads every run dir via
  // readRunDirClaims) -- it does NOT silently absorb a corrupt run dir.
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-harvest-corpus-'));
  fs.mkdirSync(path.join(corpus, 'run0'), { recursive: true });
  fs.writeFileSync(path.join(corpus, 'run0', 'survivors.json'), JSON.stringify([{ id: 'cluster0' }]) + '\n', 'utf8');

  try {
    assert.throws(
      () => harvest({ corpusDir: corpus }),
      (e) => e.name === 'ContractError',
      'a malformed record in the corpus fails the harvest closed',
    );
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('listRunDirs lists only child dirs carrying a survivors.json, sorted, and fails closed on a missing corpus', () => {
  const corpus = writeCorpus({ runB: [survivor({ id: 'c0', confidence: 'High' })], runA: [survivor({ id: 'c0', confidence: 'High' })] });
  // A scratch child WITHOUT a survivors.json must be skipped (not an error).
  fs.mkdirSync(path.join(corpus, 'scratch'), { recursive: true });

  try {
    const dirs = listRunDirs(corpus);
    const names = dirs.map((d) => path.basename(d));
    assert.deepEqual(names, ['runA', 'runB'], 'only survivors.json-bearing children, sorted; scratch skipped');
    assert.throws(
      () => listRunDirs(path.join(corpus, 'does-not-exist')),
      (e) => e.name === 'ContractError' && /does not exist/.test(e.message),
      'a missing corpus dir fails closed',
    );
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// No-spend invariant: the harvester carries no LZ_SPEND code (it is a pure on-disk loader).
// ===========================================================================

test('the harvester source carries NO LZ_SPEND / network code (a pure on-disk loader, no spend)', () => {
  const src = fs.readFileSync(new URL('./lz-eval-harvest.mjs', import.meta.url), 'utf8');
  // The invariant is no spend CODE PATH -- the harvester never reads process.env.LZ_SPEND (a prose
  // reference to the term in a comment is fine; a `process.env.LZ_SPEND` guard would be the defect).
  assert.ok(!/process\.env\.LZ_SPEND/.test(src), 'the harvester carries no LZ_SPEND code path (spend lives in lz-eval-live-cert.mjs)');
  assert.ok(!/\bfetch\s*\(/.test(src) && !/https?:\/\//.test(src), 'the harvester performs no network I/O (on-disk run dirs only)');
  // The tree-boundary statement is present (eval -> runtime, NEVER ships).
  assert.ok(/NEVER ships|NEVER in\b|one-directional/.test(src), 'the eval-tree boundary statement is present');
});

// ===========================================================================
// ARM-B evidence-text JOIN (BLOCKING-BUG fix, Plan 20-05): the surfaced members now carry the REAL stored
// evidence TEXT ([{ sentence }]) so the Stage-2 verify-voter judges against text, not a bare URL. This is an
// ADDITIVE field -- the nCtrl/nTrap counts + the two-arms-never-pooled discipline are byte-identical.
// ===========================================================================

// Write a run-dir corpus WITH claims/*.json + excerpts/*.txt synthesized from the survivors so the
// evidence-text JOIN has real worker quotes + excerpt passages to recover. Each survivor's `claim` becomes a
// worker claim `text` (exact-match), with a `quote` + an `excerpt_id` pointing to an excerpt passage; the
// worker `source` is the survivor's first source so the join's source-scope filter matches.
function writeCorpusWithEvidence(dirs) {
  resetEvidenceJoinCache();
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-harvest-ev-corpus-'));

  for (const [name, survivors] of Object.entries(dirs)) {
    const runDir = path.join(corpus, name);
    fs.mkdirSync(path.join(runDir, 'claims'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'excerpts'), { recursive: true });
    fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify(survivors, null, 2) + '\n', 'utf8');

    const claimsBySource = {};
    const excerptTexts = {};
    let excerptSeq = 0;

    for (const s of survivors) {
      const source = (Array.isArray(s.sources) && s.sources[0]) || 's0';
      const excerptId = 'e' + (excerptSeq += 1);
      const quote = 'verbatim backing quote for ' + s.id;
      (claimsBySource[source] = claimsBySource[source] || []).push({
        id: 'wc-' + s.id,
        text: s.claim,
        quote,
        excerpt_id: excerptId,
        load_bearing: true,
      });
      excerptTexts[excerptId] = 'Excerpt passage for ' + s.id + ': ' + quote + ' with full surrounding context.';
    }

    let wIdx = 0;

    for (const [source, claims] of Object.entries(claimsBySource)) {
      wIdx += 1;
      fs.writeFileSync(
        path.join(runDir, 'claims', 'w-extract-' + wIdx + '.json'),
        JSON.stringify({ worker: 'w-extract-' + wIdx, source, claims }, null, 2) + '\n',
        'utf8',
      );
    }

    for (const [excerptId, text] of Object.entries(excerptTexts)) {
      fs.writeFileSync(path.join(runDir, 'excerpts', excerptId + '.txt'), text + '\n', 'utf8');
    }
  }

  return corpus;
}

// A survivor whose `sources` carry real (URL-like) source ids + a `claim` text that the synthesized worker
// claims will exact-match (so the join recovers evidence text).
function survivorWithSource({ id, confidence = 'High', corroboration = 3, source }) {
  return {
    id,
    claim: 'supported claim text for ' + id + ' that the voter must judge against evidence',
    sources: [source || ('https://example.org/' + id)],
    corroboration_lower_bound: corroboration,
    quote_fidelity: 'verified',
    confidence,
    escalate: false,
  };
}

test('harvest surfaces ARM-B members with the JOINED evidence TEXT (NOT a URL) -- additive field for the Stage-2 voter', () => {
  const survivors = [
    survivorWithSource({ id: 'cluster0', confidence: 'High', corroboration: 3 }),
    survivorWithSource({ id: 'cluster1', confidence: 'Medium', corroboration: 2 }),
    survivorWithSource({ id: 'cluster2', confidence: 'High', corroboration: 1 }),
  ];
  const corpus = writeCorpusWithEvidence({ run0: survivors });

  try {
    resetEvidenceJoinCache();
    const res = harvest({ corpusDir: corpus, nCtrlTarget: 40, nTrapTarget: 40 });
    const members = [...res.overRefusalControls, ...res.denseTrapMonitor];

    assert.ok(members.length >= 1, 'at least one SUPPORTED member is harvested');

    for (const m of members) {
      assert.ok(Array.isArray(m.evidence), 'every surfaced member carries an evidence array (additive field)');
      assert.ok(m.evidence.length >= 1, 'the member evidence is recovered (joined from claims/excerpts)');
      assert.ok(m.evidence.every((e) => e && typeof e.sentence === 'string' && e.sentence.length > 0), 'every evidence item is a non-empty { sentence }');
      assert.ok(!/https?:\/\//.test(JSON.stringify(m.evidence)), 'the member evidence is TEXT, NEVER a bare URL (the bug)');
      assert.ok(m.evidence.some((e) => e.sentence.includes('verbatim backing quote')), 'the verbatim worker quote text is present');
    }
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('the additive ARM-B evidence join leaves nCtrl/nTrap + the member uids byte-identical (regression: counts unchanged)', () => {
  // Build TWO corpora from the SAME survivors: one WITH claims/excerpts (evidence recovered) and one WITHOUT
  // (evidence:[]). The arm counts + the member uids + the two-arms disjointness must be byte-identical -- the
  // evidence join is purely additive and never perturbs the selection / stratification / counting.
  const survivors = [];

  for (let i = 0; i < 12; i += 1) {
    survivors.push(survivorWithSource({ id: 'cluster' + String(i).padStart(2, '0'), confidence: 'High', corroboration: i % 2 === 0 ? 3 : 1 }));
  }

  const withEvidence = writeCorpusWithEvidence({ run0: survivors });
  // The no-evidence corpus: same survivors.json, NO claims/excerpts dirs (the join returns evidence:[]).
  const noEvidence = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-harvest-noev-corpus-'));
  fs.mkdirSync(path.join(noEvidence, 'run0'), { recursive: true });
  fs.writeFileSync(path.join(noEvidence, 'run0', 'survivors.json'), JSON.stringify(survivors, null, 2) + '\n', 'utf8');

  try {
    resetEvidenceJoinCache();
    const a = harvest({ corpusDir: withEvidence, nCtrlTarget: 4, nTrapTarget: 3 });
    resetEvidenceJoinCache();
    const b = harvest({ corpusDir: noEvidence, nCtrlTarget: 4, nTrapTarget: 3 });

    // Counts byte-identical.
    assert.equal(a.nCtrl, b.nCtrl, 'nCtrl is unchanged by the additive evidence join');
    assert.equal(a.nTrap, b.nTrap, 'nTrap is unchanged by the additive evidence join');

    // Member uids byte-identical (same selection / stratification / disjointness).
    assert.deepEqual(a.overRefusalControls.map((r) => r.uid), b.overRefusalControls.map((r) => r.uid), 'the over-refusal arm membership is unchanged');
    assert.deepEqual(a.denseTrapMonitor.map((r) => r.uid), b.denseTrapMonitor.map((r) => r.uid), 'the dense-trap arm membership is unchanged');

    // The two-arms-never-pooled discipline is intact (no combined-N field) in BOTH.
    assert.ok(!('n' in a) && !('nPooled' in a) && !('nTotal' in a), 'no combined-N field with the evidence join');

    // The WITH-evidence members carry text; the NO-evidence members carry evidence:[] (additive, never dropped).
    assert.ok(a.overRefusalControls.every((r) => Array.isArray(r.evidence) && r.evidence.length >= 1), 'WITH evidence: members carry recovered text');
    assert.ok(b.overRefusalControls.every((r) => Array.isArray(r.evidence) && r.evidence.length === 0), 'NO evidence: members carry evidence:[] (never dropped -- counts stay identical)');
  } finally {
    fs.rmSync(withEvidence, { recursive: true, force: true });
    fs.rmSync(noEvidence, { recursive: true, force: true });
  }
});
