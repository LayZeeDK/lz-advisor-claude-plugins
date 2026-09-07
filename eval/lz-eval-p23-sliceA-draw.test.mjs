// lz-eval-p23-sliceA-draw.test.mjs
//
// Co-test for the deterministic seeded BALANCED Slice-A draw (Plan 23-02, Task 1; NO-SPEND). Dev-only
// eval-tree test: it imports the module under test, the frozen gold module it composes, and node
// stdlib only. There is NO model call and NO network anywhere in this file -- drawBalanced is a pure
// transform over filterSliceA's output and the one real-data case reads the gitignored on-disk cache.
//
// WHY THE BALANCE AND THE SEED MATTER:
//   - D-08: ENV-03 reports the tally PER CONFUSION-MATRIX DIRECTION and NEVER pools, so an unbalanced
//     draw leaves the smaller direction's row uninformative. 20 + 20 is load-bearing, not tidiness.
//   - D-09: the selection is deterministic under a seed fixed BEFORE the draw was ever computed. The
//     realized list is quoted into the Plan 23-04 freeze commit, so a later re-seed is an amendment
//     with a timestamp rather than an edit (T-23-13).
//   - D-10: the pool is the RE-VERIFIED 83 unrefuted / 181 refuted read off the on-disk AVeriTeC dev
//     cache, NOT the 95/216 the Phase-22 pre-registration records.
//
// Asserted behaviors (one named test each, never a tautology):
//   - DRAW is Object.frozen and carries SEED 20260907 + N_PER_DIRECTION 20.
//   - mulberry32(DRAW.SEED) emits a PINNED first-five sequence, asserted byte-for-byte, so the
//     generator's stream is a contract and a refactor cannot silently change the selection.
//   - drawBalanced over the real re-verified pool returns exactly 20 unrefuted + 20 refuted.
//   - drawBalanced is deterministic: two calls with the same seed and pool are deep-equal.
//   - every drawn entry's key set is exactly ['direction', 'drawIndex', 'voterRecord'] and every
//     voterRecord's key set is exactly ['claim', 'claim_date'] -- an EXACT-SET assertion, strictly
//     stronger than checking for the absence of any named gold field (T-23-03).
//   - drawIndex is the entry's position in that direction's filterSliceA output, so gold is recovered
//     by it at score time and it is never part of the dispatched record.
//   - a pool holding the SAME claim string at two positions yields two DISTINCT entries with distinct
//     drawIndex values (the pool may legitimately contain duplicates; merging them would shrink the
//     draw below 20).
//   - claimsEqual decides equality after normalize('NFC') and byte-exactly thereafter, never
//     case-folded.
//   - a non-integer / negative seed or nPerDirection is a ContractError.
//
// DISCRIMINATION (the invert-the-fix proofs, required by the plan and by project convention):
//   - a synthetic pool with 19 survivors in ONE direction throws a ContractError naming drawBalanced.
//     A silently-smaller draw would satisfy every count assertion above while destroying the balance
//     D-08 exists to guarantee, so this is the assertion that makes the >= nPerDirection rule
//     load-bearing.
//   - a DIFFERENT seed over the SAME pool yields a DIFFERENT selection. Without it, a drawBalanced
//     that ignored its seed entirely would still pass the deep-equal determinism test.
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-p23-sliceA-draw.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
import { readJson } from './lz-eval-readjson.mjs';
import { filterSliceA } from './lz-eval-sliceA-gold.mjs';

import { DRAW, mulberry32, drawBalanced, claimsEqual } from './lz-eval-p23-sliceA-draw.mjs';

// Resolve the cache test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`). HERE is the repo-level eval/ dir.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV_JSON = path.join(HERE, '.cache', 'chenxwh__AVeriTeC', 'data', 'dev.json');

// eval/.cache/ is gitignored and absent on a fresh clone -- the real-pool cases skip rather than
// fabricating a fixture that would prove nothing (T-23-06).
function loadRealPool(t) {
  if (!fs.existsSync(DEV_JSON)) {
    t.skip('gitignored AVeriTeC dev cache absent: ' + path.basename(DEV_JSON));

    return null;
  }

  const data = readJson(DEV_JSON);
  const items = Array.isArray(data) ? data : data.claims;

  return filterSliceA({ items });
}

// A synthetic pool of `n` distinct report-shaped records per direction. It never touches the gold
// corpus, so the contract cases below run on a fresh clone.
function syntheticPool(nUnrefuted, nRefuted) {
  const make = (tag, n) => {
    const out = [];

    for (let i = 0; i < n; i += 1) {
      out.push({ claim: tag + ' synthetic claim number ' + i, claim_date: '2020-01-0' + ((i % 9) + 1) });
    }

    return out;
  };

  return { unrefuted: make('unrefuted', nUnrefuted), refuted: make('refuted', nRefuted) };
}

// ---------------------------------------------------------------------------
// DRAW: the frozen seed + per-direction size (D-08 / D-09).
// ---------------------------------------------------------------------------

test('D-08/D-09: DRAW is Object.frozen and carries the pre-registered SEED 20260907 + N_PER_DIRECTION 20', () => {
  assert.ok(Object.isFrozen(DRAW), 'DRAW must be Object.frozen (anti-result-shopping; a re-seed is an amendment)');
  assert.equal(DRAW.SEED, 20260907);
  assert.equal(DRAW.N_PER_DIRECTION, 20);
  assert.deepEqual(Object.keys(DRAW).sort(), ['N_PER_DIRECTION', 'SEED']);
});

// ---------------------------------------------------------------------------
// mulberry32: the generator's stream is a CONTRACT, pinned byte-for-byte.
// ---------------------------------------------------------------------------

test('D-09: mulberry32(DRAW.SEED) emits a PINNED first-five sequence (the stream is a contract, not an implementation detail)', () => {
  // These five doubles were produced by this exact implementation and are now frozen. A refactor that
  // changed the shift/multiply chain, the float step, or the rounding rule would change the SELECTION
  // silently; this assertion is what makes that impossible.
  const rand = mulberry32(DRAW.SEED);
  const five = [rand(), rand(), rand(), rand(), rand()];

  assert.deepEqual(five, [
    0.39220033842138946,
    0.767114817397669,
    0.6287771270144731,
    0.11036127503030002,
    0.18690357194282115,
  ]);
});

test('D-09: mulberry32 emits floats in the half-open unit interval [0, 1)', () => {
  const rand = mulberry32(DRAW.SEED);

  for (let i = 0; i < 200; i += 1) {
    const v = rand();
    assert.ok(v >= 0 && v < 1, 'value out of [0,1): ' + v);
  }
});

test('D-09: mulberry32 is a ContractError on a non-integer or negative seed (fail-closed)', () => {
  assert.throws(() => mulberry32(1.5), ContractError);
  assert.throws(() => mulberry32(-1), ContractError);
  assert.throws(() => mulberry32('20260907'), ContractError);
});

// ---------------------------------------------------------------------------
// drawBalanced over the REAL re-verified pool (D-10: 83 / 181).
// ---------------------------------------------------------------------------

test('D-10: the on-disk AVeriTeC dev cache re-verifies at 83 unrefuted / 181 refuted (NOT the recorded 95/216)', (t) => {
  const pool = loadRealPool(t);

  if (pool == null) {
    return;
  }

  assert.equal(pool.unrefuted.length, 83, 'the re-verified clean unrefuted yield is 83');
  assert.equal(pool.refuted.length, 181, 'the re-verified clean refuted yield is 181');
});

test('D-08: drawBalanced over the real pool returns EXACTLY 20 unrefuted + 20 refuted', (t) => {
  const pool = loadRealPool(t);

  if (pool == null) {
    return;
  }

  const drawn = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });
  assert.equal(drawn.unrefuted.length, 20);
  assert.equal(drawn.refuted.length, 20);
  assert.deepEqual(Object.keys(drawn).sort(), ['refuted', 'unrefuted']);
});

test('D-09: drawBalanced over the real pool is REPRODUCIBLE -- two same-seed calls are deep-equal', (t) => {
  const pool = loadRealPool(t);

  if (pool == null) {
    return;
  }

  const a = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });
  const b = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });
  assert.deepEqual(a, b);
});

test('T-23-03: every real drawn entry carries EXACTLY [direction, drawIndex, voterRecord] and every voterRecord EXACTLY [claim, claim_date]', (t) => {
  const pool = loadRealPool(t);

  if (pool == null) {
    return;
  }

  const drawn = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });

  for (const entry of [...drawn.unrefuted, ...drawn.refuted]) {
    // An EXACT-SET assertion, not an absence check: it forecloses every gold field, including one the
    // upstream schema has not grown yet.
    assert.deepEqual(Object.keys(entry).sort(), ['direction', 'drawIndex', 'voterRecord']);
    assert.deepEqual(Object.keys(entry.voterRecord).sort(), ['claim', 'claim_date']);
    assert.equal(typeof entry.voterRecord.claim, 'string');
    assert.equal(typeof entry.voterRecord.claim_date, 'string');
  }
});

test('T-23-03: drawIndex is the position in that direction\'s filterSliceA output -- the join key gold is recovered by, and it lives OUTSIDE voterRecord', (t) => {
  const pool = loadRealPool(t);

  if (pool == null) {
    return;
  }

  const drawn = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });

  for (const [direction, entries] of [['unrefuted', drawn.unrefuted], ['refuted', drawn.refuted]]) {
    const seen = new Set();

    for (const entry of entries) {
      assert.equal(entry.direction, direction);
      assert.ok(Number.isInteger(entry.drawIndex) && entry.drawIndex >= 0, 'drawIndex is a non-negative integer');
      assert.ok(entry.drawIndex < pool[direction].length, 'drawIndex indexes the direction pool');
      assert.deepEqual(
        entry.voterRecord,
        pool[direction][entry.drawIndex],
        'the voterRecord is the filterSliceA output at drawIndex, unchanged',
      );
      assert.ok(!seen.has(entry.drawIndex), 'no drawIndex is selected twice: ' + entry.drawIndex);
      seen.add(entry.drawIndex);
      assert.equal(entry.voterRecord.drawIndex, undefined, 'drawIndex must never be inside the dispatched record');
    }
  }
});

test('D-09: drawBalanced returns DEFENSIVE COPIES -- mutating the result does not reach the pool or a second call', (t) => {
  const pool = loadRealPool(t);

  if (pool == null) {
    return;
  }

  const a = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });
  a.unrefuted.push({ direction: 'unrefuted', drawIndex: 999, voterRecord: { claim: 'x', claim_date: 'y' } });
  const b = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });
  assert.equal(b.unrefuted.length, DRAW.N_PER_DIRECTION);
});

// ---------------------------------------------------------------------------
// DISCRIMINATION 1: a 19-survivor direction THROWS -- never a silently smaller draw.
// ---------------------------------------------------------------------------

test('D-08 DISCRIMINATION: a pool with 19 survivors in one direction is a ContractError naming drawBalanced, NOT a smaller draw', () => {
  // DISCRIMINATION: with the >= nPerDirection guard removed this call would return 19 + 20 and every
  // other assertion in this file would still pass -- while the per-direction balance D-08 requires
  // was silently lost. The throw is what makes the rule load-bearing.
  const pool = syntheticPool(19, 20);
  assert.throws(
    () => drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: 20 }),
    (err) => {
      assert.ok(err instanceof ContractError, 'must be a ContractError');
      assert.equal(err.file, 'drawBalanced', 'the error names drawBalanced');
      assert.match(err.message, /19/, 'the message reports the short survivor count');

      return true;
    },
  );
});

test('D-08: a pool holding EXACTLY nPerDirection survivors in a direction still draws (the boundary is >=, not >)', () => {
  const drawn = drawBalanced({ pool: syntheticPool(20, 20), seed: DRAW.SEED, nPerDirection: 20 });
  assert.equal(drawn.unrefuted.length, 20);
  assert.equal(drawn.refuted.length, 20);
});

// ---------------------------------------------------------------------------
// DISCRIMINATION 2: a different seed yields a different selection (the seed really drives it).
// ---------------------------------------------------------------------------

test('D-09 DISCRIMINATION: a DIFFERENT seed over the SAME pool yields a DIFFERENT selection', () => {
  // DISCRIMINATION: a drawBalanced that ignored its seed and took the first nPerDirection entries
  // would pass the deep-equal determinism test above. This assertion FAILS for such an
  // implementation, which is what proves the seed actually drives the selection.
  const pool = syntheticPool(60, 60);
  const a = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: 20 });
  const b = drawBalanced({ pool, seed: DRAW.SEED + 1, nPerDirection: 20 });
  const ai = a.unrefuted.map((e) => e.drawIndex);
  const bi = b.unrefuted.map((e) => e.drawIndex);
  assert.notDeepEqual(ai, bi, 'two different seeds must not select the same indices in the same order');
});

test('D-09: a synthetic same-seed pair is deep-equal (determinism without touching the gitignored cache)', () => {
  const pool = syntheticPool(60, 60);
  const a = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: 20 });
  const b = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: 20 });
  assert.deepEqual(a, b);
});

// ---------------------------------------------------------------------------
// Duplicate claims stay DISTINCT entries (merging them would shrink the draw below 20).
// ---------------------------------------------------------------------------

test('D-08: the SAME claim string at two pool positions yields two DISTINCT entries with distinct drawIndex values', () => {
  const dup = 'A duplicated report-shaped claim that appears at two separate pool positions.';
  const pool = {
    unrefuted: [
      { claim: dup, claim_date: '2020-03-04' },
      { claim: dup, claim_date: '2020-03-04' },
    ],
    refuted: [
      { claim: 'A refuted report-shaped claim held for the balance requirement.', claim_date: '2020-03-05' },
      { claim: 'A second refuted report-shaped claim held for the balance requirement.', claim_date: '2020-03-06' },
    ],
  };
  const drawn = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: 2 });
  assert.equal(drawn.unrefuted.length, 2, 'both duplicate positions survive -- they are NOT merged');
  const indices = drawn.unrefuted.map((e) => e.drawIndex).sort();
  assert.deepEqual(indices, [0, 1], 'the two entries are distinguished by drawIndex');
  assert.equal(drawn.unrefuted[0].voterRecord.claim, dup);
  assert.equal(drawn.unrefuted[1].voterRecord.claim, dup);
});

// ---------------------------------------------------------------------------
// claimsEqual: ONE comparison rule -- normalize('NFC') then byte-exact, never case-folded.
// ---------------------------------------------------------------------------

test('claim equality: an NFD and an NFC spelling of the same claim ARE the same claim (normalize(\'NFC\') first)', () => {
  // U+00E9 (composed e-acute) vs U+0065 U+0301 (e + combining acute). Written as escapes so this
  // source stays strictly ASCII per CLAUDE.md.
  const nfc = 'The caf\u00e9 claim under a single frozen comparison rule.';
  const nfd = 'The cafe\u0301 claim under a single frozen comparison rule.';
  assert.notEqual(nfc, nfd, 'the two spellings differ byte-for-byte before normalization');
  assert.ok(claimsEqual(nfc, nfd), 'after normalize(\'NFC\') they are the same claim');
});

test('claim equality: it is BYTE-EXACT after normalization -- never case-folded and never trimmed', () => {
  assert.ok(!claimsEqual('Alpha beta gamma', 'alpha beta gamma'), 'case is significant');
  assert.ok(!claimsEqual('Alpha beta gamma', 'Alpha beta gamma '), 'trailing whitespace is significant');
  assert.ok(claimsEqual('Alpha beta gamma', 'Alpha beta gamma'), 'identical strings are equal');
});

test('claim equality: a non-string argument is a ContractError (fail-closed; no String() coercion)', () => {
  assert.throws(() => claimsEqual('Alpha', null), ContractError);
  assert.throws(() => claimsEqual(undefined, 'Alpha'), ContractError);
});

// ---------------------------------------------------------------------------
// Argument validation, in the sliceAFeasibilityGate shape.
// ---------------------------------------------------------------------------

test('drawBalanced: a non-integer / negative seed or nPerDirection is a ContractError', () => {
  const pool = syntheticPool(30, 30);
  assert.throws(() => drawBalanced({ pool, seed: 1.5, nPerDirection: 20 }), ContractError);
  assert.throws(() => drawBalanced({ pool, seed: -1, nPerDirection: 20 }), ContractError);
  assert.throws(() => drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: -20 }), ContractError);
  assert.throws(() => drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: 2.5 }), ContractError);
});

test('drawBalanced: a malformed pool is a ContractError (missing direction, or a non-array direction)', () => {
  assert.throws(() => drawBalanced({ pool: {}, seed: DRAW.SEED, nPerDirection: 1 }), ContractError);
  assert.throws(
    () => drawBalanced({ pool: { unrefuted: [], refuted: null }, seed: DRAW.SEED, nPerDirection: 0 }),
    ContractError,
  );
  assert.throws(() => drawBalanced(), ContractError);
});
