// lz-eval-p23-retain.test.mjs
//
// Co-test for the T-23-07 retention path control (Phase 23 gap closure; NO MODEL SPEND, NO NETWORK, NO
// FILESYSTEM ACCESS OF ANY KIND).
//
// Not one case here creates, reads, copies or removes a path. `retainRunDirectory` is pure validation
// and `path.resolve` works on paths that do not exist, so every case runs against composed strings
// under os.tmpdir() that are never realized on disk. That matters more than usual in this tree:
// eval/.cache/ holds irreplaceable retained capture evidence with no backup (T-23-06), and a co-test
// for the control guarding it must not be able to touch it even when a case fails.
//
// Asserted behaviors (one named test each, never a tautology):
//   - RUN_ID_RE and RETAIN_CACHE_ROOT are exported and Object.frozen.
//   - the run-id realized in Phase 23 -- 20260908-105102-post-training-quantization-4bit -- matches the
//     frozen pattern, so the pattern is anchored to the record rather than to a guess.
//   - a valid retention returns absolute, resolved paths and a destination inside the cache root.
//   - DISCRIMINATION PROOF 1 (traversal): a `..`-bearing run-id throws, as do the other escape shapes.
//   - DISCRIMINATION PROOF 2 (sibling prefix): a destRoot naming a SIBLING whose name begins with the
//     cache root's name throws.
//   - a destRoot fully outside the root, and the root itself as destRoot, are each handled.
//   - a missing / non-string / empty runId, destRoot or cacheRoot is a ContractError.
//
// HOW THE TWO PROOFS WERE PROVEN TO DISCRIMINATE (run, not assumed):
//   1. traversal -- the guard is the frozen RUN_ID_RE; weakening it to `/^.+$/` makes the `..` case FAIL.
//   2. sibling prefix -- weakening the containment test in assertInside from
//      `candidate === root || candidate.startsWith(root + path.sep)` to a bare
//      `candidate.startsWith(root)` makes the two sibling-prefix cases FAIL and leaves every other case
//      passing, which is what shows the `+ path.sep` is required and not cosmetic. (Both failures are
//      the same hazard shape: the `..`-climb case resolves ONTO the sibling, so a bare prefix test
//      admits it too.) Both weakenings were applied, observed failing, and restored; the failure output
//      is recorded in the gap-closure commit message.
//
// HOST QUIRK (required, not a style choice): on this host the gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-p23-retain.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import { RUN_ID_RE, RETAIN_CACHE_ROOT, retainRunDirectory } from './lz-eval-p23-retain.mjs';

// The run-id the Phase-23 lz retention actually produced, per 23-SECURITY.md's independent check.
const REALIZED_RUN_ID = '20260908-105102-post-training-quantization-4bit';

// A scratch containment root that is NEVER created. Named p23-baseline so the sibling case below reads
// as the concrete hazard 23-SECURITY.md named rather than as an abstract prefix puzzle.
const SCRATCH = path.join(os.tmpdir(), 'lz-eval-p23-retain-scratch');
const CACHE_ROOT = path.join(SCRATCH, 'p23-baseline');
const SIBLING_ROOT = path.join(SCRATCH, 'p23-baseline-evil');

function retain(runId, destRoot, cacheRoot = CACHE_ROOT) {
  return retainRunDirectory({ runId, destRoot, cacheRoot });
}

test('RUN_ID_RE and RETAIN_CACHE_ROOT are exported and frozen', () => {
  assert.ok(RUN_ID_RE instanceof RegExp);
  assert.ok(Object.isFrozen(RUN_ID_RE), 'RUN_ID_RE must be frozen');
  assert.equal(RUN_ID_RE.global, false, 'a global pattern would mutate lastIndex across test() calls');
  assert.ok(Object.isFrozen(RETAIN_CACHE_ROOT), 'RETAIN_CACHE_ROOT must be frozen');
  assert.equal(RETAIN_CACHE_ROOT.DIR, path.resolve(RETAIN_CACHE_ROOT.DIR), 'the root must be absolute');
  assert.equal(path.basename(RETAIN_CACHE_ROOT.DIR), '.cache');
});

test('the frozen pattern matches the run-id Phase 23 actually retained', () => {
  assert.ok(RUN_ID_RE.test(REALIZED_RUN_ID));
});

test('a valid retention returns resolved paths with the destination inside the cache root', () => {
  const destRoot = path.join(CACHE_ROOT, 'lz', 'q2');
  const result = retain(REALIZED_RUN_ID, destRoot);

  assert.deepEqual(result, {
    runId: REALIZED_RUN_ID,
    cacheRoot: CACHE_ROOT,
    destRoot,
    dest: path.join(destRoot, REALIZED_RUN_ID),
  });
  assert.ok(result.dest.startsWith(CACHE_ROOT + path.sep));
});

test('the cache root itself is an admissible destRoot', () => {
  const result = retain(REALIZED_RUN_ID, CACHE_ROOT);

  assert.equal(result.destRoot, CACHE_ROOT);
  assert.equal(result.dest, path.join(CACHE_ROOT, REALIZED_RUN_ID));
});

// ---------------------------------------------------------------------------
// DISCRIMINATION PROOF 1 -- traversal. Weakening RUN_ID_RE to /^.+$/ makes this case fail.
// ---------------------------------------------------------------------------
test('DISCRIMINATION: a `..`-bearing run-id is refused before path composition', () => {
  const destRoot = path.join(CACHE_ROOT, 'lz', 'q2');

  assert.throws(
    () => retain('20260908-105102-slug/../../../etc', destRoot),
    (err) => err instanceof ContractError && /frozen pattern/.test(err.message),
  );
});

test('the other run-id escape shapes are refused too', () => {
  const destRoot = path.join(CACHE_ROOT, 'lz', 'q2');

  for (const runId of [
    '..',
    '../p23-baseline-evil',
    '20260908-105102-a/b',
    '20260908-105102-a\\b',
    'C:/Windows/Temp',
    '/etc/passwd',
    '20260908-105102-Upper',
    '2026098-105102-short-date',
    '20260908-105102-',
  ]) {
    assert.throws(
      () => retain(runId, destRoot),
      (err) => err instanceof ContractError && /frozen pattern/.test(err.message),
      'expected the frozen pattern to refuse ' + JSON.stringify(runId),
    );
  }
});

// ---------------------------------------------------------------------------
// DISCRIMINATION PROOF 2 -- sibling prefix. This is the case a bare `startsWith(root)` gets WRONG:
// `<scratch>/p23-baseline-evil` shares the root's whole name as a prefix while sitting entirely outside
// it, so only the `+ path.sep` form refuses it. Weakening the guard makes ONLY this case fail.
// ---------------------------------------------------------------------------
test('DISCRIMINATION: a sibling destRoot whose name merely prefixes the cache root is refused', () => {
  const destRoot = path.join(SIBLING_ROOT, 'lz', 'q2');

  assert.ok(destRoot.startsWith(CACHE_ROOT), 'the fixture must actually share the root name prefix');
  assert.ok(!destRoot.startsWith(CACHE_ROOT + path.sep), 'and must not be a real child of it');

  assert.throws(
    () => retain(REALIZED_RUN_ID, destRoot),
    (err) => err instanceof ContractError && /outside the retention cache root/.test(err.message),
  );
});

test('a destRoot with no relation to the cache root is refused', () => {
  assert.throws(
    () => retain(REALIZED_RUN_ID, path.join(os.tmpdir(), 'somewhere-else')),
    (err) => err instanceof ContractError && /outside the retention cache root/.test(err.message),
  );
});

test('a destRoot that climbs out with .. is refused after resolution', () => {
  assert.throws(
    () => retain(REALIZED_RUN_ID, path.join(CACHE_ROOT, '..', 'p23-baseline-evil')),
    (err) => err instanceof ContractError && /outside the retention cache root/.test(err.message),
  );
});

test('a missing, non-string or empty argument is a ContractError', () => {
  const destRoot = path.join(CACHE_ROOT, 'lz', 'q2');

  assert.throws(() => retainRunDirectory(), (err) => err instanceof ContractError);
  assert.throws(() => retain('', destRoot), (err) => err instanceof ContractError && /runId/.test(err.message));
  assert.throws(() => retain(null, destRoot), (err) => err instanceof ContractError && /runId/.test(err.message));
  assert.throws(
    () => retain(REALIZED_RUN_ID, ''),
    (err) => err instanceof ContractError && /destRoot/.test(err.message),
  );
  assert.throws(
    () => retain(REALIZED_RUN_ID, destRoot, ''),
    (err) => err instanceof ContractError && /cacheRoot/.test(err.message),
  );
});
