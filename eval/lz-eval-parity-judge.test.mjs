// lz-eval-parity-judge.test.mjs
//
// Validation fixture for the deterministic, OFF-MODEL judge-cell scorer (Plan 22-01, Task 1).
// Dev-only eval-tree test: imports the SCRIPT under test + node stdlib only. The scorer imports
// readJson from lz-eval-readjson.mjs (which imports the SHIPPED runtime aggregator's hardening
// primitives across trees, one-directional eval -> runtime), so this test transitively requires the
// plugin-tree runtime aggregator to resolve. It does NOT need jstat (the scorer is pure arithmetic).
//
// Asserts the PAR-04 SCORING-side load-bearing behaviors (each a DISTINCT named test that genuinely
// exercises the behavior, never a tautology):
//   - cellVerdict records a win ONLY when both orderings agree, else TIE (Pattern 3 / D-06).
//   - scoreJudgeCells groups by (question, dimension), resolves A/B -> lz|builtin per ordering, and
//     reports the per-cell verdict + descriptive mean/SEM over the k samples.
//   - SEM is the sample-stddev / sqrt(k), a pure arithmetic descriptor (NOT a CI gate -- D-07).
//   - k outside PARITY_K_RANGE is a ContractError; a missing ordering for a cell is a ContractError.
//   - PARITY_K_RANGE is Object.frozen.
//
// DISCRIMINATION (the invert-the-fix proof, required by the plan): a case proving cellVerdict would
// FAIL if the agreement rule were relaxed to "win if EITHER ordering prefers lz". The disagreeing
// pair ('lz','builtin') MUST resolve to 'tie'; the relaxed rule would call it 'lz-win'.
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase gate
// MUST target the explicit FILE form:
//   node --test eval/lz-eval-parity-judge.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real
// test passes. The suite is one file, so the file form is the equivalent reliable gate.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  cellVerdict,
  scoreJudgeCells,
  PARITY_K_RANGE,
} from './lz-eval-parity-judge.mjs';

// ---------------------------------------------------------------------------
// cellVerdict: win iff BOTH orderings agree, else TIE (Pattern 3 / D-06).
// ---------------------------------------------------------------------------

test('cellVerdict: both orderings prefer lz -> lz-win', () => {
  assert.equal(cellVerdict('lz', 'lz'), 'lz-win');
});

test('cellVerdict: both orderings prefer builtin -> builtin-win', () => {
  assert.equal(cellVerdict('builtin', 'builtin'), 'builtin-win');
});

test('cellVerdict: disagreement (lz vs builtin) -> tie (position bias)', () => {
  // DISCRIMINATION: this is the invert-the-fix proof. The pre-registered rule requires BOTH
  // orderings to agree. A relaxed "win if EITHER ordering prefers lz" rule would return 'lz-win'
  // here. The assertion below FAILS under that relaxed rule -- it is not a tautology.
  const verdict = cellVerdict('lz', 'builtin');
  assert.equal(verdict, 'tie');
  assert.notEqual(verdict, 'lz-win'); // the relaxed (either-prefers) rule would flip this
});

test('cellVerdict: a tie in one ordering -> tie overall', () => {
  assert.equal(cellVerdict('lz', 'tie'), 'tie');
  assert.equal(cellVerdict('tie', 'builtin'), 'tie');
  assert.equal(cellVerdict('builtin', 'lz'), 'tie');
});

test('cellVerdict: an invalid preference token is a ContractError', () => {
  assert.throws(() => cellVerdict('lz', 'maybe'), ContractError);
  assert.throws(() => cellVerdict('nope', 'lz'), ContractError);
});

// ---------------------------------------------------------------------------
// PARITY_K_RANGE: Object.frozen, MIN 3 / MAX 5.
// ---------------------------------------------------------------------------

test('PARITY_K_RANGE is Object.frozen with MIN 3 / MAX 5', () => {
  assert.ok(Object.isFrozen(PARITY_K_RANGE), 'PARITY_K_RANGE must be Object.frozen (anti-drift)');
  assert.equal(PARITY_K_RANGE.MIN, 3);
  assert.equal(PARITY_K_RANGE.MAX, 5);
});

// ---------------------------------------------------------------------------
// scoreJudgeCells: group by (question, dimension), resolve A/B per ordering, apply cellVerdict,
// report mean + SEM over k samples.
// ---------------------------------------------------------------------------

// orderingMap: which of A/B is the lz report per ordering label.
//   'AB' = ordering where A is lz, B is builtin
//   'BA' = ordering where B is lz, A is builtin
const ORDERING_MAP = Object.freeze({
  AB: 'A', // in ordering 'AB', the lz report sits at slot A
  BA: 'B', // in ordering 'BA', the lz report sits at slot B
});

// Build k=3 samples for one (question, dimension, ordering) cell where the judge prefers a given slot.
function samples({ question, dimension, ordering, preferred, scores }) {
  return scores.map((score, i) => ({
    question,
    dimension,
    ordering,
    sample: i,
    score,
    verdict: score >= 0.7 ? 'pass' : 'fail',
    preferred, // 'A' | 'B' | 'tie'
    notes: '',
  }));
}

test('scoreJudgeCells: both orderings agree lz -> lz-win cell with mean + SEM over k', () => {
  // In ordering AB, lz is slot A; preferred A -> lz. In ordering BA, lz is slot B; preferred B -> lz.
  const records = [
    ...samples({ question: 'q1', dimension: 'factual', ordering: 'AB', preferred: 'A', scores: [0.8, 0.9, 1.0] }),
    ...samples({ question: 'q1', dimension: 'factual', ordering: 'BA', preferred: 'B', scores: [0.7, 0.8, 0.9] }),
  ];

  const cells = scoreJudgeCells({ records, orderingMap: ORDERING_MAP });

  assert.equal(cells.length, 1);

  const cell = cells[0];

  assert.equal(cell.question, 'q1');
  assert.equal(cell.dimension, 'factual');
  assert.equal(cell.verdict, 'lz-win');

  // mean of the lz scores: ordering AB lz=slot A scores [0.8,0.9,1.0]; ordering BA lz=slot B
  // scores [0.7,0.8,0.9]. The lz pool is the union of the slot the lz report occupied per ordering.
  // meanScoreLz over [0.8,0.9,1.0,0.7,0.8,0.9] = 5.1/6 = 0.85.
  assert.ok(Math.abs(cell.meanScoreLz - 0.85) < 1e-9, 'meanScoreLz=' + cell.meanScoreLz);

  // SEM descriptive, present + finite + non-negative (NOT a gate).
  assert.ok(Number.isFinite(cell.semLz) && cell.semLz >= 0, 'semLz=' + cell.semLz);
  assert.ok(Number.isFinite(cell.semBuiltin) && cell.semBuiltin >= 0, 'semBuiltin=' + cell.semBuiltin);
});

test('scoreJudgeCells: orderings DISAGREE -> tie (the union-of-cells discrimination)', () => {
  // ordering AB preferred A (=lz); ordering BA preferred A (=builtin, since lz is slot B in BA).
  // The two orderings disagree on the winner -> TIE. A relaxed "either prefers lz" rule would call
  // this lz-win (AB prefers lz); the assertion FAILS under that relaxed rule.
  const records = [
    ...samples({ question: 'q1', dimension: 'citation', ordering: 'AB', preferred: 'A', scores: [0.9, 0.9, 0.9] }),
    ...samples({ question: 'q1', dimension: 'citation', ordering: 'BA', preferred: 'A', scores: [0.6, 0.6, 0.6] }),
  ];

  const cells = scoreJudgeCells({ records, orderingMap: ORDERING_MAP });

  assert.equal(cells.length, 1);
  assert.equal(cells[0].verdict, 'tie');
});

test('scoreJudgeCells: SEM equals sample-stddev / sqrt(k) for a known sample', () => {
  // lz slot A scores [0.2, 0.4, 0.6] (ordering AB), lz slot B scores [0.2, 0.4, 0.6] (ordering BA).
  // Combined lz pool [0.2,0.4,0.6,0.2,0.4,0.6], mean 0.4. Sample variance (n-1=5):
  //   sum sq dev = 2*((0.2)^2 + 0^2 + (0.2)^2) = 2*(0.04+0+0.04)=0.16; /5 = 0.032; stddev=sqrt(0.032).
  //   SEM = stddev / sqrt(6).
  const records = [
    ...samples({ question: 'q2', dimension: 'completeness', ordering: 'AB', preferred: 'tie', scores: [0.2, 0.4, 0.6] }),
    ...samples({ question: 'q2', dimension: 'completeness', ordering: 'BA', preferred: 'tie', scores: [0.2, 0.4, 0.6] }),
  ];

  const cells = scoreJudgeCells({ records, orderingMap: ORDERING_MAP });
  const cell = cells[0];

  const expectedStd = Math.sqrt(0.16 / 5);
  const expectedSem = expectedStd / Math.sqrt(6);

  assert.ok(Math.abs(cell.semLz - expectedSem) < 1e-9, 'semLz=' + cell.semLz + ' expected=' + expectedSem);
});

test('scoreJudgeCells: a k outside PARITY_K_RANGE is a ContractError', () => {
  // k=2 (below MIN 3) per ordering.
  const records = [
    ...samples({ question: 'q3', dimension: 'factual', ordering: 'AB', preferred: 'A', scores: [0.8, 0.9] }),
    ...samples({ question: 'q3', dimension: 'factual', ordering: 'BA', preferred: 'B', scores: [0.8, 0.9] }),
  ];

  assert.throws(
    () => scoreJudgeCells({ records, orderingMap: ORDERING_MAP }),
    ContractError,
  );

  // k=6 (above MAX 5) per ordering.
  const tooMany = [
    ...samples({ question: 'q4', dimension: 'factual', ordering: 'AB', preferred: 'A', scores: [0.8, 0.9, 1.0, 0.8, 0.9, 1.0] }),
    ...samples({ question: 'q4', dimension: 'factual', ordering: 'BA', preferred: 'B', scores: [0.8, 0.9, 1.0, 0.8, 0.9, 1.0] }),
  ];

  assert.throws(
    () => scoreJudgeCells({ records: tooMany, orderingMap: ORDERING_MAP }),
    ContractError,
  );
});

test('scoreJudgeCells: a missing ordering for a cell is a ContractError (no silent half-cell)', () => {
  // Only ordering AB present for (q5, factual) -- the swap requires BOTH orderings.
  const records = samples({ question: 'q5', dimension: 'factual', ordering: 'AB', preferred: 'A', scores: [0.8, 0.9, 1.0] });

  assert.throws(
    () => scoreJudgeCells({ records, orderingMap: ORDERING_MAP }),
    ContractError,
  );
});

test('scoreJudgeCells: an ordering label absent from orderingMap is a ContractError', () => {
  const records = [
    ...samples({ question: 'q6', dimension: 'factual', ordering: 'AB', preferred: 'A', scores: [0.8, 0.9, 1.0] }),
    ...samples({ question: 'q6', dimension: 'factual', ordering: 'ZZ', preferred: 'B', scores: [0.7, 0.8, 0.9] }),
  ];

  assert.throws(
    () => scoreJudgeCells({ records, orderingMap: ORDERING_MAP }),
    ContractError,
  );
});

test('scoreJudgeCells: an unequal k between the two orderings of a cell is a ContractError', () => {
  // AB has k=3, BA has k=4 -> mismatched sample counts cannot form a clean swap cell.
  const records = [
    ...samples({ question: 'q7', dimension: 'factual', ordering: 'AB', preferred: 'A', scores: [0.8, 0.9, 1.0] }),
    ...samples({ question: 'q7', dimension: 'factual', ordering: 'BA', preferred: 'B', scores: [0.7, 0.8, 0.9, 1.0] }),
  ];

  assert.throws(
    () => scoreJudgeCells({ records, orderingMap: ORDERING_MAP }),
    ContractError,
  );
});

test('scoreJudgeCells: multiple cells are grouped + sorted deterministically by (question, dimension)', () => {
  const records = [
    ...samples({ question: 'qB', dimension: 'citation', ordering: 'AB', preferred: 'A', scores: [0.9, 0.9, 0.9] }),
    ...samples({ question: 'qB', dimension: 'citation', ordering: 'BA', preferred: 'B', scores: [0.9, 0.9, 0.9] }),
    ...samples({ question: 'qA', dimension: 'factual', ordering: 'AB', preferred: 'B', scores: [0.9, 0.9, 0.9] }),
    ...samples({ question: 'qA', dimension: 'factual', ordering: 'BA', preferred: 'A', scores: [0.9, 0.9, 0.9] }),
  ];

  const cells = scoreJudgeCells({ records, orderingMap: ORDERING_MAP });

  assert.equal(cells.length, 2);
  // sorted: qA before qB.
  assert.equal(cells[0].question, 'qA');
  assert.equal(cells[1].question, 'qB');
  // (qA, factual): AB preferred B (builtin, lz is A), BA preferred A (builtin, lz is B) -> both
  // prefer builtin -> builtin-win.
  assert.equal(cells[0].verdict, 'builtin-win');
});

// ---------------------------------------------------------------------------
// CR-01 REGRESSION GUARD (22-REVIEW.md): the (question, dimension) composite key separator.
//
// Until 2026-09-05 the separator was a LITERAL NUL byte typed into the source. Same runtime value
// as the escape that replaced it -- so no test can distinguish the two spellings, and none should
// try. What these tests guard is the FAILURE the literal invited: a formatter, editor, or
// copy-paste silently dropping the invisible byte, collapsing the separator to '' (or a human
// "fixing" it to a space). Every pre-existing fixture in this file uses a spaceless question id
// ('q1', 'qA'), so the whole suite passes under a ' ' separator -- these do not.
//
// DISCRIMINATION (verified by inverting the fix): with CELL_KEY_SEP = ' ' the collision test throws
// ContractError instead of returning 2 cells, and the round-trip test reports question 'latency' /
// dimension 'budget'. With CELL_KEY_SEP = '' the round-trip test reports single characters. Both
// fail loudly.
// ---------------------------------------------------------------------------

test('scoreJudgeCells: CR-01 -- a multi-word question round-trips intact through the cell key', () => {
  const records = [
    ...samples({
      question: 'latency budget',
      dimension: 'factual',
      ordering: 'AB',
      preferred: 'A',
      scores: [0.8, 0.9, 1.0],
    }),
    ...samples({
      question: 'latency budget',
      dimension: 'factual',
      ordering: 'BA',
      preferred: 'B',
      scores: [0.8, 0.9, 1.0],
    }),
  ];

  const cells = scoreJudgeCells({ records, orderingMap: ORDERING_MAP });

  assert.equal(cells.length, 1);
  // A ' ' separator splits this into question 'latency' / dimension 'budget'; a '' separator
  // splits it into single characters. Only a separator that cannot occur in either component
  // round-trips both fields.
  assert.equal(cells[0].question, 'latency budget');
  assert.equal(cells[0].dimension, 'factual');
  assert.equal(cells[0].verdict, 'lz-win');
});

test('scoreJudgeCells: CR-01 -- two cells whose space-joined keys collide stay distinct', () => {
  // ('latency budget', 'factual') and ('latency', 'budget factual') both join to the string
  // 'latency budget factual' under a ' ' separator. Merged, that single key carries 6 samples per
  // ordering -- k=6, outside PARITY_K_RANGE -- so the scorer would throw instead of returning two
  // cells. Under a separator that cannot occur in either component they remain two distinct cells.
  const records = [
    ...samples({
      question: 'latency budget',
      dimension: 'factual',
      ordering: 'AB',
      preferred: 'A',
      scores: [0.8, 0.9, 1.0],
    }),
    ...samples({
      question: 'latency budget',
      dimension: 'factual',
      ordering: 'BA',
      preferred: 'B',
      scores: [0.8, 0.9, 1.0],
    }),
    ...samples({
      question: 'latency',
      dimension: 'budget factual',
      ordering: 'AB',
      preferred: 'B',
      scores: [0.5, 0.6, 0.7],
    }),
    ...samples({
      question: 'latency',
      dimension: 'budget factual',
      ordering: 'BA',
      preferred: 'A',
      scores: [0.5, 0.6, 0.7],
    }),
  ];

  const cells = scoreJudgeCells({ records, orderingMap: ORDERING_MAP });

  assert.equal(cells.length, 2);

  const byKey = new Map(cells.map((c) => [c.question + '|' + c.dimension, c]));

  assert.ok(byKey.has('latency budget|factual'));
  assert.ok(byKey.has('latency|budget factual'));
  // Distinct cells keep distinct verdicts: the first pair agrees on lz, the second on builtin.
  assert.equal(byKey.get('latency budget|factual').verdict, 'lz-win');
  assert.equal(byKey.get('latency|budget factual').verdict, 'builtin-win');
});

test('scoreJudgeCells: CR-01 -- the module source carries no literal NUL byte', () => {
  // The separator must be written as an escape. A literal NUL is invisible in an editor, is
  // stripped or rewritten by most formatters, and makes the whole file read as BINARY to ripgrep
  // -- so `rg` for any symbol in it returns "binary file matches" and no lines, a silent false
  // negative on the module that decides win/tie/loss (CLAUDE.md, Content Search).
  const src = readFileSync(new URL('./lz-eval-parity-judge.mjs', import.meta.url), 'utf8');

  assert.equal(
    src.includes(String.fromCharCode(0)),
    false,
    'lz-eval-parity-judge.mjs must contain no literal NUL byte',
  );
  assert.ok(
    /const CELL_KEY_SEP = '\\u0000';/.test(src),
    'the cell-key separator must be declared as an escape, not a literal byte',
  );
});
