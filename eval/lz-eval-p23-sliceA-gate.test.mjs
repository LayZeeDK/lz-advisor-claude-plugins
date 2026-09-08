// lz-eval-p23-sliceA-gate.test.mjs
//
// NET-NEW (Phase 23 validation gap closure, ENV-03): the half of Plan 23-05 Task 2's discrimination
// proof that its SUMMARY recorded as NOT-EXERCISED -- "with the directories present, remove one
// dispatch record and observe FAIL".
//
// WHY IT WAS NOT EXERCISED, AND WHY THAT WAS RIGHT: the only dispatch directory in existence is
// eval/.cache/p23-read/sliceA/dispatch/, which holds 40 write-once provenance records from a metered
// run, in a gitignored cache with no backup (T-23-06). Deleting one to watch a gate go red would have
// destroyed irreplaceable evidence to prove a property of a five-line predicate.
//
// WHAT THIS TEST DOES INSTEAD. The gate is an inline `node -e` script in the plan's <automated> block
// and every path it names is RELATIVE. So the gate is extracted VERBATIM from the committed plan text
// and executed against scratch fixture directories in the OS temp tree, with cwd set there. That
// exercises the committed gate source itself rather than a re-implementation of it, and it realizes no
// path inside eval/.cache/ at any point -- asserted below rather than assumed.
//
// The plan file is READ, never modified. Nothing under eval/.cache/ or .lz-research/ is read, written,
// moved or deleted by this file.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF endings.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const PLAN = path.join(
  REPO,
  '.planning',
  'phases',
  '23-judge-free-confidence-and-operating-envelope-for-lz-deep-res',
  '23-05-PLAN.md',
);

// The relative cache prefix the gate composes its paths from. Named here so the containment
// assertions below can prove the extracted script cannot escape a foreign cwd.
const CACHE_PREFIX = 'eval/.cache/p23-read/sliceA';
const RECORD_REL = 'eval/lz-eval-p23-sliceA-read-record.md';

/**
 * Pull the Task 2 gate out of the committed plan. Identified by its own error string rather than by
 * block index, so re-ordering the plan's tasks cannot silently select a different gate.
 */
function extractGateSource() {
  const planText = fs.readFileSync(PLAN, 'utf8');
  const blocks = [...planText.matchAll(/<automated>([\s\S]*?)<\/automated>/g)].map((m) => m[1]);
  const matching = blocks.filter((b) => b.includes('must not outlive a dispatch that never ran'));

  assert.equal(
    matching.length,
    1,
    'exactly one <automated> block in 23-05-PLAN.md must be the Task 2 dispatch-completeness gate',
  );

  const raw = matching[0].trim();
  const prefix = 'node -e "';

  assert.ok(raw.startsWith(prefix), 'the Task 2 gate must be an inline `node -e "..."` script');
  assert.ok(raw.endsWith('"'), 'the Task 2 gate must close its inline double-quoted script');

  const source = raw.slice(prefix.length, -1);

  assert.ok(
    !source.includes('\\'),
    'the extracted gate must carry no backslash escape, or slicing the shell quotes would not recover it verbatim',
  );

  return source;
}

/** A scratch repo-shaped tree in the OS temp dir. Never inside this repo. */
function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'p23-sliceA-gate-'));

  assert.ok(
    !path.resolve(root).startsWith(REPO + path.sep),
    'the fixture root must sit outside this repository',
  );

  return root;
}

function seedDispatch(root, nDispatch, nVerdicts) {
  const d = path.join(root, ...CACHE_PREFIX.split('/'), 'dispatch');
  const v = path.join(root, ...CACHE_PREFIX.split('/'), 'verdicts');
  fs.mkdirSync(d, { recursive: true });
  fs.mkdirSync(v, { recursive: true });

  for (let i = 0; i < nDispatch; i += 1) {
    fs.writeFileSync(path.join(d, `item-${i}.json`), '{}\n');
  }

  for (let i = 0; i < nVerdicts; i += 1) {
    fs.writeFileSync(path.join(v, `item-${i}.json`), '{}\n');
  }
}

function seedRecord(root) {
  const p = path.join(root, ...RECORD_REL.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, '');
}

/** Run the extracted gate with cwd inside the fixture. */
function runGate(source, root) {
  const script = path.join(root, 'gate.cjs');
  fs.writeFileSync(script, source);
  const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });

  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

test('ENV-03: the extracted Task 2 gate names only RELATIVE cache paths, so a foreign cwd cannot reach the real records', () => {
  const source = extractGateSource();

  assert.ok(source.includes(`'${CACHE_PREFIX}/dispatch'`), 'the gate must name the dispatch directory');
  assert.ok(source.includes(`'${CACHE_PREFIX}/verdicts'`), 'the gate must name the verdicts directory');
  assert.ok(
    !/[A-Za-z]:[\\/]/.test(source) && !/'\//.test(source),
    'the gate must carry no absolute path, or redirecting it by cwd would not be sound',
  );
});

test('ENV-03: the gate PASSES the never-ran path -- no directories and no record', () => {
  const source = extractGateSource();
  const root = makeFixture();
  const r = runGate(source, root);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\[OK\] no dispatch or verdict directory and no read record/);
});

test('ENV-03: the gate FAILS when a read record outlives a dispatch that never ran', () => {
  const source = extractGateSource();
  const root = makeFixture();
  seedRecord(root);
  const r = runGate(source, root);

  assert.notEqual(r.status, 0, 'a record with no dispatch behind it must FAIL the gate');
  assert.match(r.stderr, /a record must not outlive a dispatch that never ran/);
});

test('ENV-03: the gate PASSES a complete dispatch -- 40 records and 40 verdicts', () => {
  const source = extractGateSource();
  const root = makeFixture();
  seedDispatch(root, 40, 40);
  const r = runGate(source, root);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\[OK\] 40 dispatch records and 40 verdicts/);
});

// THE NOT-EXERCISED HALF, exercised: one dispatch record short, directories present.
test('ENV-03: the gate FAILS when one dispatch record is removed from a started run (Plan 23-05 Task 2, previously NOT-EXERCISED)', () => {
  const source = extractGateSource();
  const root = makeFixture();
  seedDispatch(root, 40, 40);

  const dispatchDir = path.join(root, ...CACHE_PREFIX.split('/'), 'dispatch');
  const victim = fs.readdirSync(dispatchDir)[0];
  fs.rmSync(path.join(dispatchDir, victim));

  assert.equal(fs.readdirSync(dispatchDir).length, 39, 'the fixture must be one dispatch record short');

  const r = runGate(source, root);

  assert.notEqual(r.status, 0, 'a partial dispatch must not hide inside the never-ran path');
  assert.match(r.stderr, /a dispatch STARTED, so it must complete: expected 40 dispatch records, found 39/);
});

test('ENV-03: the gate FAILS when one verdict is missing from a started run', () => {
  const source = extractGateSource();
  const root = makeFixture();
  seedDispatch(root, 40, 39);
  const r = runGate(source, root);

  assert.notEqual(r.status, 0, 'a dispatch short of 40 verdicts must FAIL the gate');
  assert.match(r.stderr, /expected 40 verdicts, found 39/);
});

test('ENV-03: this test realizes no path inside the repository eval/.cache tree', () => {
  const realCache = path.join(REPO, 'eval', '.cache');
  const fixtures = fs.readdirSync(os.tmpdir()).filter((n) => n.startsWith('p23-sliceA-gate-'));

  for (const f of fixtures) {
    assert.ok(
      !path.resolve(os.tmpdir(), f).startsWith(realCache),
      'no fixture may resolve inside eval/.cache/',
    );
  }
});
