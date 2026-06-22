// lz-eval-parity-verdict.test.mjs
//
// Validation fixture for the deterministic, OFF-MODEL two-layer parity verdict (Plan 22-01, Task 2).
// Dev-only eval-tree test: imports the SCRIPT under test + node stdlib only. The verdict module
// imports only the SHIPPED runtime aggregator's ContractError across trees (one-directional eval ->
// runtime) + the Task-1 scorer's cell shape; it needs NO jstat (the verdict is a count comparison,
// D-07).
//
// Asserts the PAR-05 / D-05 / D-07 load-bearing behaviors (each a DISTINCT named test that genuinely
// exercises the behavior, never a tautology):
//   - parityVerdict returns PARITY iff (a) the absolute FLOOR passes on every question AND (b) zero
//     LOSS on factual/citation AND (c) <= 1 LOSS across the other dims.
//   - floor fails on ANY question -> NAMED-GAP (the absolute floor is load-bearing, D-05).
//   - floor passes but the parity bar (b)/(c) is breached -> SCOPED-PARITY-OR-NAMED-GAP.
//   - the verdict is PURE (same inputs -> same output).
//   - a loss count on an unknown dimension name is a ContractError (the 5 dims are fixed, D-04).
//
// DISCRIMINATION (the invert-the-fix proof, required by the plan):
//   - a test proving the verdict FLIPS from PARITY to a non-PARITY outcome if MAX_LOSS_FLOOR_DIMS
//     were relaxed from 0 to 1 (a factual/citation loss MUST break parity).
//   - a test asserting Object.isFrozen(PARITY_BAR) (anti-result-shopping, D-20).
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-parity-verdict.test.mjs
// The directory form spuriously exits 1 on this host even when every real test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  PARITY_BAR,
  parityVerdict,
} from './lz-eval-parity-verdict.mjs';

// The five D-04 dimensions (verbatim). The verdict's lossByDimension keys are validated against this set.
const ALL_DIMS = ['factual', 'citation', 'completeness', 'source_quality', 'tool_process_efficiency'];

// A floor-pass map where every frozen question passes (the absolute FLOOR holds, D-05).
const FLOOR_ALL_PASS = Object.freeze({ q1: true, q2: true, q3: true });

// Zero-loss across every dimension.
function noLosses() {
  const out = {};

  for (const d of ALL_DIMS) {
    out[d] = 0;
  }

  return out;
}

// ---------------------------------------------------------------------------
// PARITY_BAR: frozen constants chosen BEFORE grading (D-20).
// ---------------------------------------------------------------------------

test('PARITY_BAR is Object.frozen and carries the pre-registered constants (D-20)', () => {
  assert.ok(Object.isFrozen(PARITY_BAR), 'PARITY_BAR must be Object.frozen (anti-result-shopping)');
  assert.deepEqual(PARITY_BAR.FLOOR_DIMS, ['factual', 'citation']);
  assert.ok(Object.isFrozen(PARITY_BAR.FLOOR_DIMS), 'FLOOR_DIMS must also be frozen');
  assert.equal(PARITY_BAR.MAX_LOSS_FLOOR_DIMS, 0);
  assert.equal(PARITY_BAR.MAX_LOSS_OTHER_DIMS, 1);
  assert.equal(PARITY_BAR.PASS_THRESHOLD, 0.7);
});

// ---------------------------------------------------------------------------
// PARITY: floor passes everywhere + zero floor-dim loss + <= 1 other-dim loss.
// ---------------------------------------------------------------------------

test('parityVerdict: floor passes + zero floor loss + zero other loss -> PARITY', () => {
  const verdict = parityVerdict({ floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: noLosses() });
  assert.equal(verdict, 'PARITY');
});

test('parityVerdict: floor passes + exactly 1 other-dim loss -> PARITY (<= 1 allowed)', () => {
  const losses = noLosses();
  losses.completeness = 1; // one loss in a non-floor dimension is tolerated (D-07c)
  const verdict = parityVerdict({ floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: losses });
  assert.equal(verdict, 'PARITY');
});

// ---------------------------------------------------------------------------
// DISCRIMINATION: a floor-dim loss MUST break parity (MAX_LOSS_FLOOR_DIMS === 0).
// ---------------------------------------------------------------------------

test('parityVerdict: a single factual LOSS flips PARITY -> SCOPED-PARITY-OR-NAMED-GAP (floor loss breaks parity)', () => {
  // DISCRIMINATION: with MAX_LOSS_FLOOR_DIMS === 0, ONE factual loss must break parity. If the bar
  // were relaxed to MAX_LOSS_FLOOR_DIMS === 1 the verdict would be PARITY -- the assertion below
  // FAILS under that relaxed bar, so it is not a tautology. The floor (D-05) still passes here, so
  // the non-PARITY outcome is the scoped form, not NAMED-GAP.
  const losses = noLosses();
  losses.factual = 1;
  const verdict = parityVerdict({ floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: losses });
  assert.equal(verdict, 'SCOPED-PARITY-OR-NAMED-GAP');
  assert.notEqual(verdict, 'PARITY'); // the relaxed MAX_LOSS_FLOOR_DIMS=1 bar would make this PARITY
});

test('parityVerdict: a single citation LOSS also breaks parity (citation is a floor dim)', () => {
  const losses = noLosses();
  losses.citation = 1;
  const verdict = parityVerdict({ floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: losses });
  assert.equal(verdict, 'SCOPED-PARITY-OR-NAMED-GAP');
});

test('parityVerdict: two other-dim losses breach (c) -> SCOPED-PARITY-OR-NAMED-GAP', () => {
  const losses = noLosses();
  losses.completeness = 1;
  losses.source_quality = 1; // total 2 other-dim losses > MAX_LOSS_OTHER_DIMS (1)
  const verdict = parityVerdict({ floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: losses });
  assert.equal(verdict, 'SCOPED-PARITY-OR-NAMED-GAP');
});

// ---------------------------------------------------------------------------
// NAMED-GAP: the absolute floor fails on ANY question (load-bearing, D-05).
// ---------------------------------------------------------------------------

test('parityVerdict: floor fails on one question -> NAMED-GAP (floor is load-bearing)', () => {
  const floor = { q1: true, q2: false, q3: true }; // q2 fails the absolute floor
  const verdict = parityVerdict({ floorPassByQuestion: floor, lossByDimension: noLosses() });
  assert.equal(verdict, 'NAMED-GAP');
});

test('parityVerdict: floor fails AND parity bar would otherwise pass -> still NAMED-GAP (floor dominates)', () => {
  // DISCRIMINATION: even with zero losses everywhere (parity bar (b)/(c) clean), a floor failure
  // forces NAMED-GAP. This proves the floor check is not bypassed by a clean parity bar.
  const floor = { q1: false };
  const verdict = parityVerdict({ floorPassByQuestion: floor, lossByDimension: noLosses() });
  assert.equal(verdict, 'NAMED-GAP');
  assert.notEqual(verdict, 'PARITY');
});

test('parityVerdict: floor fails -> NAMED-GAP takes precedence over a floor-dim loss too', () => {
  const floor = { q1: true, q2: false };
  const losses = noLosses();
  losses.factual = 1;
  const verdict = parityVerdict({ floorPassByQuestion: floor, lossByDimension: losses });
  assert.equal(verdict, 'NAMED-GAP');
});

// ---------------------------------------------------------------------------
// Purity + fail-closed validation.
// ---------------------------------------------------------------------------

test('parityVerdict: pure -- same inputs produce the same output', () => {
  const args = { floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: noLosses() };
  const a = parityVerdict(args);
  const b = parityVerdict(args);
  assert.equal(a, b);
  assert.equal(a, 'PARITY');
});

test('parityVerdict: an unknown dimension name in lossByDimension is a ContractError (D-04 fixes the 5 dims)', () => {
  const losses = noLosses();
  losses.made_up_dimension = 1;
  assert.throws(
    () => parityVerdict({ floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: losses }),
    ContractError,
  );
});

test('parityVerdict: an empty floorPassByQuestion is a ContractError (no questions = no floor evidence)', () => {
  assert.throws(
    () => parityVerdict({ floorPassByQuestion: {}, lossByDimension: noLosses() }),
    ContractError,
  );
});

test('parityVerdict: a non-boolean floor flag is a ContractError', () => {
  assert.throws(
    () => parityVerdict({ floorPassByQuestion: { q1: 'yes' }, lossByDimension: noLosses() }),
    ContractError,
  );
});

test('parityVerdict: a negative or non-integer loss count is a ContractError', () => {
  const negative = noLosses();
  negative.completeness = -1;
  assert.throws(
    () => parityVerdict({ floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: negative }),
    ContractError,
  );

  const fractional = noLosses();
  fractional.completeness = 0.5;
  assert.throws(
    () => parityVerdict({ floorPassByQuestion: FLOOR_ALL_PASS, lossByDimension: fractional }),
    ContractError,
  );
});
