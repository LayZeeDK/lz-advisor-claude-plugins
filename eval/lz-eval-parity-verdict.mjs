// lz-eval-parity-verdict.mjs
//
// NET-NEW (Plan 22-01, Task 2; NO-SPEND): the deterministic, OFF-MODEL two-layer mechanical parity
// verdict. Mirrors the lockRuleVerdict idiom (eval/lz-eval-aggregate.mjs): a PURE function reading
// Object.freeze'd module-level constants chosen and committed BEFORE any grading (D-20
// anti-result-shopping), so the parity call cannot be rationalized post-hoc. THE AUTHORITY is
// 22-CONTEXT.md (D-04/D-05/D-07) + 22-RESEARCH.md "Pattern 2: Frozen-constant mechanical verdict" +
// "The two-layer mechanical verdict shape".
//
// Two layers (NEITHER alone suffices, D-05):
//   (1) the absolute quality FLOOR -- the Sonnet skill must pass factual AND citation on EVERY frozen
//       question; a floor failure on ANY question -> NAMED-GAP (the floor is load-bearing).
//   (2) the comparative PARITY bar (D-07): PARITY iff (a) the floor passes on all questions AND
//       (b) zero clear LOSS on factual OR citation AND (c) <= 1 clear LOSS across the other 3 dims.
//
// The verdict is a COUNT comparison, never a statistic -- D-07 forbids confidence intervals /
// non-inferiority margins at n=2-3; there is NO jstat import and nothing is routed through statistics.
// The verdict is NEVER a ship gate (D-03): the Sonnet-default skill ships regardless; the output is
// PARITY | SCOPED-PARITY-OR-NAMED-GAP | NAMED-GAP -- confidence / an operating envelope / an honest
// named gap.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER
// in the distributed plugin tree. It imports only the SHIPPED runtime aggregator's ContractError
// ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). NEVER add
// an eval/ import to any plugin-tree file.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The thin CLI is guarded so importing this module runs nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// THE PRE-REGISTERED PARITY BAR (module-level literals; FROZEN BEFORE any report is graded, D-20).
// The lock rule (the Plan 22-04 pre-registration) records these WITH A TIMESTAMP; a co-test asserts
// Object.isFrozen. They are NOT computed from the grades -- they are the load-bearing anti-result-
// shopping anchor.
//   FLOOR_DIMS          : the two dimensions the absolute floor + the zero-loss rule cover (D-05/D-07b).
//   MAX_LOSS_FLOOR_DIMS : the max tolerated LOSS count across factual+citation (0 -- a single
//                         floor-dim loss breaks parity, D-07b).
//   MAX_LOSS_OTHER_DIMS : the max tolerated LOSS count across the other 3 dims (1, D-07c).
//   PASS_THRESHOLD      : the per-dimension 0..1 pass/fail threshold (D-04 default 0.7; a pre-
//                         registration knob frozen in Plan 22-04). Carried here as the frozen contract
//                         for the judge-score derivation; the verdict consumes already-derived
//                         win/tie/loss + floor-pass booleans, so it is informational at this layer.
// ---------------------------------------------------------------------------
export const PARITY_BAR = Object.freeze({
  FLOOR_DIMS: Object.freeze(['factual', 'citation']),
  MAX_LOSS_FLOOR_DIMS: 0,
  MAX_LOSS_OTHER_DIMS: 1,
  PASS_THRESHOLD: 0.7,
});

// The five Anthropic dimensions (verbatim, D-04). lossByDimension keys are validated against this
// fixed set -- an unknown dimension is a ContractError (the dims are fixed; a stray key is a bug, not
// a silent skip). FLOOR_DIMS is a subset; the remaining three are the "other" dims for rule (c).
const ALL_DIMS = Object.freeze([
  'factual',
  'citation',
  'completeness',
  'source_quality',
  'tool_process_efficiency',
]);

// ---------------------------------------------------------------------------
// parityVerdict: the two-layer mechanical verdict.
//   floorPassByQuestion: { [questionId]: boolean }  -- per-question absolute-floor pass (factual AND
//     citation both passed for that question). Must be a non-empty object of booleans.
//   lossByDimension:     { [dimension]: integer >= 0 } -- the clear-LOSS count per dimension (a LOSS
//     is a per-cell 'builtin-win' from the scorer, summed across questions for that dimension). Every
//     key must be one of the 5 D-04 dims; missing dims default to 0.
//
// Returns (per 22-RESEARCH.md "two-layer mechanical verdict shape", D-07):
//   'PARITY'                      iff floorPasses && floorDimLosses === MAX_LOSS_FLOOR_DIMS &&
//                                      otherLosses <= MAX_LOSS_OTHER_DIMS
//   'NAMED-GAP'                   iff !floorPasses (the absolute floor is load-bearing, D-05)
//   'SCOPED-PARITY-OR-NAMED-GAP'  otherwise (floor passes but the parity bar (b)/(c) is breached, D-03)
//
// PURE: no I/O, no clock, no randomness. Same inputs -> same output.
// ---------------------------------------------------------------------------
export function parityVerdict({ floorPassByQuestion, lossByDimension }) {
  if (floorPassByQuestion == null || typeof floorPassByQuestion !== 'object' || Array.isArray(floorPassByQuestion)) {
    throw new ContractError(
      'floorPassByQuestion must be an object { questionId: boolean }: ' + JSON.stringify(floorPassByQuestion),
      'parityVerdict',
    );
  }

  if (lossByDimension == null || typeof lossByDimension !== 'object' || Array.isArray(lossByDimension)) {
    throw new ContractError(
      'lossByDimension must be an object { dimension: integer >= 0 }: ' + JSON.stringify(lossByDimension),
      'parityVerdict',
    );
  }

  const questionIds = Object.keys(floorPassByQuestion);

  if (questionIds.length === 0) {
    throw new ContractError('floorPassByQuestion is empty (no questions = no floor evidence)', 'parityVerdict');
  }

  // Validate every floor flag is a boolean (a string / number flag is a malformed input, not a
  // truthy pass).
  for (const q of questionIds) {
    const flag = floorPassByQuestion[q];

    if (typeof flag !== 'boolean') {
      throw new ContractError(
        'floorPassByQuestion[' + JSON.stringify(q) + '] is not a boolean: ' + JSON.stringify(flag),
        'parityVerdict',
      );
    }
  }

  // Validate every loss key is a known D-04 dimension and every count is a non-negative integer.
  for (const dim of Object.keys(lossByDimension)) {
    if (!ALL_DIMS.includes(dim)) {
      throw new ContractError(
        'unknown dimension in lossByDimension (the 5 D-04 dims are fixed): ' + JSON.stringify(dim),
        'parityVerdict',
      );
    }

    const count = lossByDimension[dim];

    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
      throw new ContractError(
        'lossByDimension[' + JSON.stringify(dim) + '] must be a non-negative integer: ' + JSON.stringify(count),
        'parityVerdict',
      );
    }
  }

  // Layer 1: the absolute FLOOR -- every question must pass (D-05).
  const floorPasses = questionIds.every((q) => floorPassByQuestion[q] === true);

  // Layer 2 inputs: loss tallies. Missing dims default to 0.
  const lossFor = (dim) => (Object.hasOwn(lossByDimension, dim) ? lossByDimension[dim] : 0);

  const floorDimLosses = PARITY_BAR.FLOOR_DIMS.reduce((acc, dim) => acc + lossFor(dim), 0);
  const otherDims = ALL_DIMS.filter((dim) => !PARITY_BAR.FLOOR_DIMS.includes(dim));
  const otherLosses = otherDims.reduce((acc, dim) => acc + lossFor(dim), 0);

  if (
    floorPasses &&
    floorDimLosses === PARITY_BAR.MAX_LOSS_FLOOR_DIMS &&
    otherLosses <= PARITY_BAR.MAX_LOSS_OTHER_DIMS
  ) {
    return 'PARITY';
  }

  return floorPasses ? 'SCOPED-PARITY-OR-NAMED-GAP' : 'NAMED-GAP';
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Single positional <verdict-input.json>
// holding { floorPassByQuestion, lossByDimension }; prints the verdict; exits 0 / 2.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv[2];

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('lz-eval-parity-verdict: missing or invalid <verdict-input.json>');
    process.exit(2);
  }

  try {
    const text = fs.readFileSync(inputPath, 'utf8');
    const input = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
    const verdict = parityVerdict(input);
    console.log(verdict);
    process.exit(0);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-parity-verdict: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
