// lz-eval-resume-fixture.test.mjs
//
// Anti-drift LOCKSTEP integration fixture for the lz-deep-research cross-session RESUME feature
// (Plan 20-07; D-21). Dev-only eval-tree test: imports the SHIPPED runtime aggregator ACROSS trees
// (one-directional eval -> runtime) plus node stdlib. It exercises ONLY on-disk fixture state and the
// idempotent aggregator -- ZERO model spend (no Agent call, no model, no network). The canonical case
// is the Montreal partial recovery: claims/ + excerpts/ + sources/ + candidates/ complete; a valid
// stage-1 survivors.json that is DEGENERATE (all-Unsupported, written before any vote was cast); some
// votes present + some MISSING (cluster-keyed); NO report.md; NO run_state.json.
//
// Every assertion is DISCRIMINATING (it would catch a real regression), never a tautology:
//   - the degenerate-aggregate trap: re-running the idempotent aggregator OVERWRITES the premature
//     all-Unsupported stage-1 survivors.json with the true post-vote tally (a naive resume that
//     consumed the stage-1 file as final would emit a silently-wrong all-Unsupported report);
//   - the missing votes are detectable CLUSTER-KEYED (resume casts ONLY the missing seats; the
//     existing votes stay valid -- cluster ids are reproducible + are already the vote keys, no re-keying);
//   - the ANTI-DRIFT LOCKSTEP identity: the decompose.json / run_state.json field names + the per-phase
//     done-signals documented in SKILL.md MATCH those in lz-deep-research-schema.md (a drift fails);
//   - run_state.json { stage2_complete: true } is the SENTINEL, NEVER inferred from survivors.json.
//
// HOST QUIRK (load-bearing): on this host (Node v24.x / Windows arm64 / Git Bash) the phase gate MUST
// target the explicit FILE form:
//   node --test eval/lz-eval-resume-fixture.test.mjs
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

// The SHIPPED runtime aggregator, imported ACROSS trees (eval -> runtime, one-directional). This is the
// SAME idempotent reducer the resume path re-drives; the fixture re-runs it UNCHANGED (ZERO aggregator
// changes). No eval import is ever added to a plugin-tree file (the cross-tree boundary is one-directional).
import { aggregate } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Resolve test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and headless
// `claude -p`).
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_MD = path.join(HERE, '..', 'plugins', 'lz-advisor', 'skills', 'lz-deep-research', 'SKILL.md');
const SCHEMA_MD = path.join(HERE, '..', 'plugins', 'lz-advisor', 'references', 'lz-deep-research-schema.md');

// ---------------------------------------------------------------------------
// Fixture builder: the Montreal partial run-dir. Two clusters that do NOT merge (jaccard < 0.6 on the
// claim texts), so the aggregator yields cluster0 + cluster1 deterministically. cluster0 is corroborated
// by two distinct sources and (once votes are filled) tallies to High; cluster1 has one source and stays
// Unsupported until/unless its seats are cast. The PREMATURE stage-1 survivors.json marks BOTH Unsupported
// (the degenerate state a crash-before-voting leaves behind).
// ---------------------------------------------------------------------------

const CLAIM_0 = 'Montreal averages eighty-two centimetres of snowfall in January';
const CLAIM_1 = 'The bridge reopened to vehicle traffic after structural repairs';

function buildPartialRunDir() {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-resume-montreal-'));

  for (const sub of ['candidates', 'claims', 'excerpts', 'sources', 'votes']) {
    fs.mkdirSync(path.join(runDir, sub), { recursive: true });
  }

  // Phase-0 done-signal: scope.md present (scope is fixed).
  fs.writeFileSync(path.join(runDir, 'scope.md'), 'Scope: Montreal winter facts.\n', 'utf8');

  // Phase-1 done-signal: decompose.json present (decomposition + Gate-1 spend already paid). The field
  // names here are checked against the schema doc in the lockstep test below.
  fs.writeFileSync(
    path.join(runDir, 'decompose.json'),
    JSON.stringify(
      {
        angles: [{ id: 'a0', text: 'snowfall', priority: 1 }],
        gate1_note: 'prioritize the climate angle',
        selected_urls: ['https://example.org/a/snow', 'https://example.org/b/snow'],
      },
      null,
      2,
    ),
    'utf8',
  );

  // Phase-2 done-signal: candidates/ present.
  fs.writeFileSync(
    path.join(runDir, 'candidates', 'a0.json'),
    JSON.stringify({ worker: 'a0', candidates: [{ url: 'https://example.org/a/snow', title: 'A' }] }, null, 2),
    'utf8',
  );

  // Phase-3 done-signals: claims/ + excerpts/ + sources/ complete. cluster0 is corroborated by TWO
  // distinct sources (w0 + w1, same claim text -> merges into one cluster, two sources); cluster1 by one.
  fs.writeFileSync(
    path.join(runDir, 'claims', 'w0.json'),
    JSON.stringify(
      { worker: 'w0', source: 'https://example.org/a/snow', claims: [{ id: 'c0', text: CLAIM_0, quote: CLAIM_0, excerpt_id: 'e0' }] },
      null,
      2,
    ),
    'utf8',
  );
  fs.writeFileSync(
    path.join(runDir, 'claims', 'w1.json'),
    JSON.stringify(
      { worker: 'w1', source: 'https://example.org/b/snow', claims: [{ id: 'c0b', text: CLAIM_0, quote: CLAIM_0, excerpt_id: 'e1' }] },
      null,
      2,
    ),
    'utf8',
  );
  fs.writeFileSync(
    path.join(runDir, 'claims', 'w2.json'),
    JSON.stringify(
      { worker: 'w2', source: 'https://example.org/c/bridge', claims: [{ id: 'c1', text: CLAIM_1, quote: CLAIM_1, excerpt_id: 'e2' }] },
      null,
      2,
    ),
    'utf8',
  );

  // Excerpts: each quote is verbatim-present in its cited excerpt (so the quote-recheck verifies, no drops).
  fs.writeFileSync(path.join(runDir, 'excerpts', 'e0.txt'), CLAIM_0 + '\n', 'utf8');
  fs.writeFileSync(path.join(runDir, 'excerpts', 'e1.txt'), CLAIM_0 + '\n', 'utf8');
  fs.writeFileSync(path.join(runDir, 'excerpts', 'e2.txt'), CLAIM_1 + '\n', 'utf8');

  // Source records (aggregator does NOT read these; present for completeness of the Phase-3 done-signal).
  for (const [id, title] of [
    ['https%3A%2F%2Fexample.org%2Fa%2Fsnow', 'A snow study'],
    ['https%3A%2F%2Fexample.org%2Fb%2Fsnow', 'B snow review'],
    ['https%3A%2F%2Fexample.org%2Fc%2Fbridge', 'C bridge report'],
  ]) {
    fs.writeFileSync(path.join(runDir, 'sources', id + '.json'), JSON.stringify({ id, url: id, title }, null, 2), 'utf8');
  }

  // Phase-5 PARTIAL done-signals: cluster0's three seats are CAST (cluster-keyed, all unrefuted); cluster1's
  // three seats are MISSING. This is the resume gap -- the missing seats are detectable by cluster id.
  for (let seat = 0; seat < 3; seat += 1) {
    fs.writeFileSync(path.join(runDir, 'votes', 'cluster0-' + seat + '.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
  }

  // Phase-4 PREMATURE stage-1 survivors.json: the DEGENERATE all-Unsupported array a crash-before-voting
  // leaves behind. Both clusters marked Unsupported. NO report.md, NO run_state.json.
  fs.writeFileSync(
    path.join(runDir, 'survivors.json'),
    JSON.stringify(
      [
        { id: 'cluster0', claim: CLAIM_0, sources: ['https://example.org/a/snow', 'https://example.org/b/snow'], corroboration_lower_bound: 2, quote_fidelity: 'verified', confidence: 'Unsupported', escalate: false },
        { id: 'cluster1', claim: CLAIM_1, sources: ['https://example.org/c/bridge'], corroboration_lower_bound: 1, quote_fidelity: 'verified', confidence: 'Unsupported', escalate: false },
      ],
      null,
      2,
    ),
    'utf8',
  );

  return runDir;
}

// The cluster ids a deterministic aggregator run yields over this fixture (mergeClusters first-seen order).
const EXPECTED_CLUSTER_IDS = ['cluster0', 'cluster1'];

// Detect, per cluster id, which of the VOTES_PER_CLAIM (3) seats are missing on disk -- the resume signal.
function missingSeats(runDir, clusterId) {
  const missing = [];

  for (let seat = 0; seat < 3; seat += 1) {
    if (!fs.existsSync(path.join(runDir, 'votes', clusterId + '-' + seat + '.json'))) {
      missing.push(seat);
    }
  }

  return missing;
}

// ===========================================================================
// The degenerate-aggregate trap (the highest-risk correctness item; D-21 / T-20-28).
// ===========================================================================

test('report.md ABSENT + NO run_state sentinel => the run is incomplete (completion is NEVER inferred from survivors.json)', () => {
  const runDir = buildPartialRunDir();

  try {
    // The terminal sentinel is absent AND the stage-2 sentinel is absent -> the run did not finish.
    assert.equal(fs.existsSync(path.join(runDir, 'report.md')), false, 'report.md is absent (the run did not finish)');
    assert.equal(fs.existsSync(path.join(runDir, 'run_state.json')), false, 'run_state.json is absent (stage 2 never completed)');

    // The PREMATURE stage-1 survivors.json is degenerate: ALL Unsupported. A naive resume that read THIS
    // as the final tally would emit a silently-wrong all-Unsupported report. Completion must NOT be
    // inferred from these confidence values.
    const premature = JSON.parse(fs.readFileSync(path.join(runDir, 'survivors.json'), 'utf8'));
    assert.ok(premature.length > 0 && premature.every((s) => s.confidence === 'Unsupported'), 'the stage-1 survivors.json is degenerate (all-Unsupported -- the trap)');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('the degenerate-aggregate trap: re-running the IDEMPOTENT aggregator OVERWRITES the premature all-Unsupported survivors.json with the true post-vote tally', () => {
  const runDir = buildPartialRunDir();

  try {
    // RESUME step 1: fill the MISSING cluster1 seats (cast cluster-keyed; the existing cluster0 votes stay).
    for (const seat of missingSeats(runDir, 'cluster1')) {
      fs.writeFileSync(path.join(runDir, 'votes', 'cluster1-' + seat + '.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
    }

    // RESUME step 2: ALWAYS re-run stage 2 (the aggregator is idempotent + cheap). The fixture re-runs the
    // UNCHANGED aggregator over the on-disk run-dir, exactly as the SKILL's resume path shells it.
    const result = aggregate(runDir);
    fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify(result.survivors, null, 2), 'utf8');

    // The re-run OVERWROTE the degenerate stage-1 file: now there is at least one NON-Unsupported survivor
    // (cluster0 is 3/3 unrefuted -> High). If the resume had consumed the premature file as final, this
    // would still be all-Unsupported -- so this assertion DISCRIMINATES the trap.
    const afterReRun = JSON.parse(fs.readFileSync(path.join(runDir, 'survivors.json'), 'utf8'));
    assert.ok(afterReRun.some((s) => s.confidence !== 'Unsupported'), 'the re-run produced a NON-Unsupported tally (the premature all-Unsupported was NOT consumed as final)');

    const byId = Object.fromEntries(afterReRun.map((s) => [s.id, s]));
    assert.equal(byId.cluster0.confidence, 'High', 'cluster0 (3/3 unrefuted) tallies to High after the votes are filled');
    assert.equal(byId.cluster1.confidence, 'High', 'cluster1 (now 3/3 unrefuted after the resume fill) tallies to High');

    // RESUME step 3: the SENTINEL is written only AFTER a clean stage-2 exit. The aggregate() call above
    // returned without throwing (a clean exit), so the SKILL writes run_state.json now.
    fs.writeFileSync(path.join(runDir, 'run_state.json'), JSON.stringify({ stage2_complete: true }), 'utf8');
    const sentinel = JSON.parse(fs.readFileSync(path.join(runDir, 'run_state.json'), 'utf8'));
    assert.equal(sentinel.stage2_complete, true, 'run_state.json { stage2_complete: true } is the AUTHORITATIVE stage-2-complete sentinel (not inferred from survivors.json)');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('the aggregator is idempotent over the FILLED run-dir: a second re-run reproduces the byte-identical survivors array', () => {
  const runDir = buildPartialRunDir();

  try {
    for (const seat of missingSeats(runDir, 'cluster1')) {
      fs.writeFileSync(path.join(runDir, 'votes', 'cluster1-' + seat + '.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
    }

    const first = aggregate(runDir).survivors;
    const second = aggregate(runDir).survivors;
    assert.deepEqual(second, first, 'two stage-2 runs over the same filled run-dir produce byte-identical survivors (idempotent -- safe to re-run on resume)');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

// ===========================================================================
// Cluster-keyed missing-vote detection (resume casts ONLY the missing seats; no re-keying; D-21 / D-15).
// ===========================================================================

test('the missing votes are detectable CLUSTER-KEYED: cluster0 fully cast, cluster1 fully missing -- resume casts only the gap', () => {
  const runDir = buildPartialRunDir();

  try {
    // cluster0's three seats are present (cast before the crash); cluster1's three are missing.
    assert.deepEqual(missingSeats(runDir, 'cluster0'), [], 'cluster0 has all three seats cast -- a resume re-casts NONE of them');
    assert.deepEqual(missingSeats(runDir, 'cluster1'), [0, 1, 2], 'cluster1 has all three seats missing -- a resume casts exactly these');

    // The existing cluster0 votes stay valid under the SAME cluster id (no re-keying): the aggregator reads
    // votes/cluster0-<seat>.json by the reproducible stage-1 cluster id. Fill ONLY the cluster1 gap and the
    // existing cluster0 votes still tally.
    for (const seat of missingSeats(runDir, 'cluster1')) {
      fs.writeFileSync(path.join(runDir, 'votes', 'cluster1-' + seat + '.json'), JSON.stringify({ verdict: 'unrefuted' }), 'utf8');
    }

    const survivors = aggregate(runDir).survivors;
    const ids = survivors.map((s) => s.id).sort();
    assert.deepEqual(ids, EXPECTED_CLUSTER_IDS, 'the aggregator yields the reproducible cluster ids (cluster0, cluster1) the vote files are keyed by -- no re-keying');
    assert.equal(survivors.find((s) => s.id === 'cluster0').confidence, 'High', 'the PRE-EXISTING cluster0 votes (never re-cast) still tally to High -- they stayed valid under the same key');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

// ===========================================================================
// The anti-drift LOCKSTEP identity (D-12 / D-21): the SKILL prose + the schema record agree on the field
// names + the per-phase done-signals. A drift between any surface fails the test.
// ===========================================================================

test('LOCKSTEP: the decompose.json / run_state.json field names appear in BOTH SKILL.md AND the schema reference (a drift fails)', () => {
  const skill = fs.readFileSync(SKILL_MD, 'utf8');
  const schema = fs.readFileSync(SCHEMA_MD, 'utf8');

  // Every resume-contract token MUST be present in BOTH surfaces -- if one surface drops or renames a field,
  // exactly one of these assertions fails, catching the drift.
  const lockstepTokens = ['decompose.json', 'run_state.json', 'stage2_complete', 'selected_urls', 'gate1_note', 'angles'];

  for (const token of lockstepTokens) {
    assert.ok(skill.includes(token), 'SKILL.md documents the resume token "' + token + '" (lockstep with the schema)');
    assert.ok(schema.includes(token), 'the schema reference documents the resume token "' + token + '" (lockstep with the SKILL)');
  }
});

test('LOCKSTEP: the per-phase done-signals are documented in BOTH SKILL.md AND the schema reference', () => {
  const skill = fs.readFileSync(SKILL_MD, 'utf8');
  const schema = fs.readFileSync(SCHEMA_MD, 'utf8');

  // The done-signal filenames the resume path keys off, in pipeline order.
  const doneSignals = ['scope.md', 'decompose.json', 'survivors.json', 'run_state.json', 'report.md'];

  for (const sig of doneSignals) {
    assert.ok(skill.includes(sig), 'SKILL.md names the done-signal "' + sig + '"');
    assert.ok(schema.includes(sig), 'the schema reference names the done-signal "' + sig + '"');
  }

  // The vote-file key shape (cluster-keyed) must be documented in both (no re-keying contract).
  assert.ok(/votes\//.test(skill) && /cluster/.test(skill), 'SKILL.md documents the cluster-keyed vote files (votes/<cluster-id>-<seat>.json)');
  assert.ok(/votes\//.test(schema) && /cluster/.test(schema), 'the schema reference documents the cluster-keyed vote files');
});

test('LOCKSTEP: the degenerate-aggregate mitigation (report.md absent -> re-run stage 2; never infer from survivors.json) is documented in SKILL.md', () => {
  const skill = fs.readFileSync(SKILL_MD, 'utf8');

  // The mitigation prose the fixture above behaviorally proves -- documented as a directive in the SKILL.
  assert.ok(/report\.md/.test(skill), 'SKILL.md references report.md as the terminal sentinel');
  assert.ok(/idempotent/.test(skill), 'SKILL.md states the aggregator is idempotent (safe to re-run stage 2)');
  assert.ok(/NEVER infer|never infer/.test(skill), 'SKILL.md states completion is NEVER inferred from survivors.json confidence values');
  assert.ok(/stage2_complete/.test(skill), 'SKILL.md names the run_state.json stage2_complete sentinel as the authoritative signal');
});

// ===========================================================================
// The eval-tree boundary is one-directional (eval -> runtime). The fixture imports the runtime aggregator
// and never the reverse; this test documents + asserts the boundary statement is present.
// ===========================================================================

test('the cross-tree import is one-directional (eval imports the runtime aggregator; no eval import in any plugin-tree file)', () => {
  const self = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  assert.match(self, /from '\.\.\/plugins\/lz-advisor\/skills\/lz-deep-research\/scripts\/lz-deep-research-aggregate\.mjs'/, 'this fixture imports the SHIPPED runtime aggregator across-tree (eval -> runtime)');

  // The shipped SKILL + references must NOT import anything from the eval tree (the boundary is one-directional).
  const skill = fs.readFileSync(SKILL_MD, 'utf8');
  const schema = fs.readFileSync(SCHEMA_MD, 'utf8');
  assert.ok(!/from '.*\/eval\//.test(skill) && !/import .*eval\//.test(skill), 'SKILL.md adds no eval-tree import (one-directional boundary)');
  assert.ok(!/from '.*\/eval\//.test(schema) && !/import .*eval\//.test(schema), 'the schema reference adds no eval-tree import (one-directional boundary)');
});
