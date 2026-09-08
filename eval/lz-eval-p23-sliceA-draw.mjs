// lz-eval-p23-sliceA-draw.mjs
//
// NET-NEW (Plan 23-02, Task 1; NO-SPEND): the DETERMINISTIC SEEDED BALANCED 20+20 draw over
// filterSliceA's OUTPUT -- the frozen 40-item Slice-A item set ENV-03 votes on. THE AUTHORITY is
// 23-CONTEXT.md (D-08/D-09/D-10) + eval/lz-eval-p23-prereg.md.
//
// WHY BALANCED (D-08): ENV-03 reports the verdict-vs-gold tally PER CONFUSION-MATRIX DIRECTION and
// NEVER pools it. An unbalanced draw therefore leaves the smaller direction's row uninformative -- the
// balance is what makes the read say anything at all, not tidiness. A direction short of
// N_PER_DIRECTION survivors is a ContractError, never a silently smaller draw.
//
// WHY SEEDED (D-09 / T-23-13): the selection is deterministic under DRAW.SEED, fixed BEFORE the draw
// was ever computed. The realized list is quoted into the Plan 23-04 freeze commit and pinned by its
// anti-drift co-test, so a later re-seed is an amendment with a timestamp rather than an edit.
//
// WHY THE POOL IS RE-VERIFIED (D-10): the pool comes from filterSliceA over the on-disk AVeriTeC dev
// cache, which yields 83 unrefuted / 181 refuted -- NOT the 95 clean Supported / 216 clean Refuted the
// Phase-22 pre-registration records from a 2026-06-22 inspection. The 8/8 feasibility floor still
// clears with wide margin and both directions stay populated, so the gate outcome is unchanged, but
// 83/181 is the number this phase plans on. The discrepancy is RECORDED, never silently reconciled.
//
// ANSWER-LEAK CONTROL (T-23-03): this module samples the OUTPUT of filterSliceA, which emits only
// { claim, claim_date } BY CONSTRUCTION rather than by enumerating fields to strip. Sampling raw gold
// rows would bypass that strip. `drawIndex` -- the join key gold is recovered by at score time -- lives
// OUTSIDE `voterRecord` and is never dispatched. This is an allowlist, not a blocklist: a blocklist
// fails silently the moment the upstream schema gains a field.
//
// ONE CLAIM-TEXT COMPARISON RULE, STATED: claim strings are compared after normalize('NFC') and
// byte-exactly thereafter -- never case-folded, never trimmed. So an NFD and an NFC spelling of the
// same claim are the same claim, while two spellings differing in case are not. Two IDENTICAL claim
// strings drawn from different pool positions stay DISTINCT entries, distinguished by `drawIndex`,
// because the pool may legitimately contain duplicates and silently merging them would shrink the draw
// below N_PER_DIRECTION.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees
// by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It adds no package: the
// seeded generator is written inline precisely so a textbook function does not become a supply-chain
// surface (T-23-SC).
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The thin CLI is guarded so importing this module runs nothing. NO model call, NO network.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Fail-closed BOM-stripping JSON read (the established eval-tree convention) -- used by the CLI to read
// the on-disk AVeriTeC dev JSON.
import { readJson } from './lz-eval-readjson.mjs';

// The frozen leak-stripping filter this module COMPOSES rather than rebuilds (D-09): the draw samples
// its OUTPUT, so the answer-leak strip cannot be bypassed.
import { filterSliceA } from './lz-eval-sliceA-gold.mjs';

// ---------------------------------------------------------------------------
// DRAW: the pre-registered seed + per-direction draw size, FROZEN BEFORE the draw was ever computed
// (D-08 / D-09 / T-23-13). A co-test asserts Object.isFrozen.
//   SEED             : 20260907 -- this phase's planning date. It was chosen before any selection was
//                      computed, precisely so it cannot have been tuned to produce a flattering draw.
//                      RE-SEEDING AFTER SEEING THE DRAW IS FORBIDDEN: the realized list is whatever
//                      this seed produces, and Plan 23-04 quotes that list into the freeze commit.
//   N_PER_DIRECTION  : 20 -- 20 unrefuted + 20 refuted = the frozen 40-item set (D-08).
// ---------------------------------------------------------------------------
export const DRAW = Object.freeze({
  SEED: 20260907,
  N_PER_DIRECTION: 20,
});

// The two pool directions, in the order they are drawn. Order is part of the deterministic contract:
// one generator instance is consumed left to right, so swapping these would change the selection.
const DIRECTIONS = Object.freeze(['unrefuted', 'refuted']);

// ---------------------------------------------------------------------------
// assertNonNegativeInteger(name, v, where) -- the argument-checking shape sliceAFeasibilityGate
// already uses (lz-eval-sliceA-gold.mjs:220-238), reused verbatim in spirit so every numeric argument
// in the tree fails closed the same way.
// ---------------------------------------------------------------------------
function assertNonNegativeInteger(name, v, where) {
  if (!Number.isInteger(v) || v < 0) {
    throw new ContractError(
      where + ' requires a non-negative integer ' + name + ': ' + JSON.stringify(v),
      where,
    );
  }
}

// ---------------------------------------------------------------------------
// mulberry32(seed) -- a deterministic 32-bit PRNG returning a function that yields a float in the
// HALF-OPEN unit interval [0, 1). Written inline (no package) per 23-PATTERNS: this is a textbook
// generator and adding a dependency for it would buy a supply-chain surface for fifteen lines.
//
// THE STREAM IS A CONTRACT, not an implementation detail. A co-test pins the first five outputs for
// DRAW.SEED byte-for-byte, because a change to the shift/multiply chain or to the final float step
// would silently change the SELECTION while every count assertion still passed. The float step is
// fixed here and no rounding rule is left to the caller: the unsigned 32-bit result is divided by
// 2**32, which is what makes the interval half-open.
//
// The algorithm is byte-identical to the private generator already used by eval/lz-eval-mcc.mjs for
// bootstrap resampling; it is duplicated rather than exported from there because that module is a
// frozen scoring path and this one only needs the fifteen lines.
// ---------------------------------------------------------------------------
export function mulberry32(seed) {
  assertNonNegativeInteger('seed', seed, 'mulberry32');

  let t = seed >>> 0;

  return function next() {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);

    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// claimsEqual(a, b) -- THE single claim-text comparison rule (stated in the header): equality is
// decided after normalize('NFC') and is byte-exact thereafter. Never case-folded, never trimmed. A
// non-string argument is a ContractError -- no String() coercion, because a silently coerced null
// would compare equal to the string 'null'.
//
// Exported so the rule is a CHECKABLE CONTRACT rather than a comment, and so Plan 23-02's read module
// can cross-check a persisted dispatch record's claim against the drawn claim under the SAME rule
// instead of inventing a second one.
// ---------------------------------------------------------------------------
export function claimsEqual(a, b) {
  for (const [name, v] of [['a', a], ['b', b]]) {
    if (typeof v !== 'string') {
      throw new ContractError(
        'claimsEqual requires a string ' + name + ' (no coercion): ' + JSON.stringify(v),
        'claimsEqual',
      );
    }
  }

  return a.normalize('NFC') === b.normalize('NFC');
}

// ---------------------------------------------------------------------------
// selectIndices(len, count, rand) -- a seeded partial Fisher-Yates shuffle over the POSITION INDICES
// 0..len-1, returning the first `count` of them in shuffled order. Partial because only `count`
// positions are needed; the rounding rule is Math.floor over rand() * (len - i), and rand()'s
// half-open range guarantees i <= j < len so no swap can read out of bounds.
// ---------------------------------------------------------------------------
function selectIndices(len, count, rand) {
  const idx = [];

  for (let i = 0; i < len; i += 1) {
    idx.push(i);
  }

  for (let i = 0; i < count; i += 1) {
    const j = i + Math.floor(rand() * (len - i));
    const tmp = idx[i];
    idx[i] = idx[j];
    idx[j] = tmp;
  }

  return idx.slice(0, count);
}

// ---------------------------------------------------------------------------
// drawBalanced({ pool, seed, nPerDirection }) -- the deterministic BALANCED draw (D-08 / D-09).
//
// `pool` is the { unrefuted, refuted } object filterSliceA returns. Its OUTPUT is what gets sampled,
// never the raw gold rows (T-23-03). Returns
//   { unrefuted: [ { drawIndex, direction, voterRecord }, ... ], refuted: [ ... ] }
// where each direction's array holds exactly `nPerDirection` entries:
//   drawIndex   : the entry's position in THAT direction's filterSliceA output. This is the join key
//                 gold is recovered by at score time. It lives OUTSIDE voterRecord and is NEVER
//                 dispatched to a voter.
//   direction   : 'unrefuted' | 'refuted' -- the gold direction, kept for the per-direction tally.
//   voterRecord : the { claim, claim_date } object as emitted by filterSliceA, UNCHANGED.
//
// A direction holding fewer than `nPerDirection` survivors is a ContractError naming drawBalanced --
// never a smaller draw, because that would destroy the balance D-08 requires while every count check
// still looked plausible. The returned arrays are fresh (the .slice() defensive-copy idiom), so a
// caller cannot mutate a later call's result.
// ---------------------------------------------------------------------------
export function drawBalanced({ pool, seed, nPerDirection } = {}) {
  assertNonNegativeInteger('seed', seed, 'drawBalanced');
  assertNonNegativeInteger('nPerDirection', nPerDirection, 'drawBalanced');

  if (pool == null || typeof pool !== 'object') {
    throw new ContractError(
      'drawBalanced requires a { unrefuted, refuted } pool object (filterSliceA output): ' + JSON.stringify(pool),
      'drawBalanced',
    );
  }

  for (const direction of DIRECTIONS) {
    if (!Array.isArray(pool[direction])) {
      throw new ContractError(
        'drawBalanced pool.' + direction + ' must be an array (filterSliceA output): ' + JSON.stringify(pool[direction]),
        'drawBalanced',
      );
    }

    if (pool[direction].length < nPerDirection) {
      throw new ContractError(
        'drawBalanced cannot draw a BALANCED set: pool.' +
          direction +
          ' holds ' +
          pool[direction].length +
          ' survivors, fewer than the required ' +
          nPerDirection +
          ' (D-08: an unbalanced draw leaves the smaller direction uninformative; a smaller draw is NOT a fallback)',
        'drawBalanced',
      );
    }
  }

  // ONE generator instance, consumed in DIRECTIONS order -- part of the deterministic contract.
  const rand = mulberry32(seed);
  const out = {};

  for (const direction of DIRECTIONS) {
    const records = pool[direction];
    const picked = selectIndices(records.length, nPerDirection, rand);
    const entries = [];

    for (const drawIndex of picked) {
      entries.push({ drawIndex, direction, voterRecord: records[drawIndex] });
    }

    // Defensive copy, matching the existing .slice() idiom.
    out[direction] = entries.slice();
  }

  return out;
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Single positional <averitec-dev.json>
// holding { claims: [...] }; runs filterSliceA then drawBalanced and prints ONE machine-readable line
// carrying the per-direction counts, the seed, and the first + last drawIndex per direction. Exits 0 on
// success, 2 on a ContractError. NO model call -- it reads the cached gold from disk (zero spend).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv[2];

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('lz-eval-p23-sliceA-draw: missing or invalid <averitec-dev.json>');
    process.exit(2);
  }

  try {
    const data = readJson(inputPath);
    const items = Array.isArray(data) ? data : data.claims;
    const pool = filterSliceA({ items });
    const drawn = drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });
    const edges = DIRECTIONS.map((d) => {
      const list = drawn[d];

      return d + '-first=' + list[0].drawIndex + ' ' + d + '-last=' + list[list.length - 1].drawIndex;
    });
    console.log(
      'drawn unrefuted=' +
        drawn.unrefuted.length +
        ' refuted=' +
        drawn.refuted.length +
        ' seed=' +
        DRAW.SEED +
        ' pool-unrefuted=' +
        pool.unrefuted.length +
        ' pool-refuted=' +
        pool.refuted.length +
        ' ' +
        edges.join(' '),
    );

    for (const direction of DIRECTIONS) {
      for (const entry of drawn[direction]) {
        console.log(direction + ' drawIndex=' + entry.drawIndex + ' claim=' + entry.voterRecord.claim);
      }
    }

    process.exit(0);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-p23-sliceA-draw: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
