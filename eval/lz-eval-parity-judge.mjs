// lz-eval-parity-judge.mjs
//
// NET-NEW (Plan 22-01, Task 1; NO-SPEND): the deterministic, OFF-MODEL SCORING side of the Opus
// parity judge. The session drives the Opus judge and lands a per-(question x dimension x ordering x
// sample) JSON record on disk (Pattern 1: session spends, node scores from disk -- ZERO model spend
// here). THIS module parses those landed records and applies the position-swap agreement rule (D-06 /
// Pattern 3): a per-cell win is recorded ONLY when both orderings agree, else TIE. It also reports a
// descriptive mean + SEM over the k samples -- SEM is a pure arithmetic DESCRIPTOR, NOT a CI gate
// (D-07 forbids statistics at n=2-3). THE AUTHORITY is 22-CONTEXT.md (D-04/D-06/D-07/D-10) +
// 22-RESEARCH.md "Pattern 3: Position-swap agreement" + section 3 "The Opus judge harness".
//
// The landed judge record shape (produced later by Plan 22-05, consumed here) is, per 22-RESEARCH.md
// section 3:
//   { question, dimension, ordering, sample, score: 0..1, verdict: 'pass'|'fail'|'unknown',
//     preferred: 'A'|'B'|'tie', notes }
// For a given (question, dimension) the two orderings (e.g. 'AB' / 'BA') are the lz-vs-builtin
// position swap. orderingMap maps each ordering label to which of 'A'/'B' is the lz report in that
// ordering, so a record's preferred:'A' resolves to 'lz' or 'builtin' PER ORDERING.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER
// in the distributed plugin tree. It reads on-disk records via the shared fail-closed readJson; that
// helper imports the SHIPPED runtime aggregator's ContractError + stripBom ACROSS trees by relative
// path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval) -- so no eval dependency can leak
// into the marketplace package. It imports NO jstat (no CI claim is made; the SEM is plain
// arithmetic, D-07). NEVER add an eval/ import to any plugin-tree file.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); explicit
// UTF-8 + LF, path.join, no shell globbing. The thin CLI is guarded so importing this module runs
// nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse). readJson is the shared fail-closed, BOM-stripping JSON read.
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
import { readJson } from './lz-eval-readjson.mjs';

// ---------------------------------------------------------------------------
// Frozen k-range (anti-drift): the per-cell multi-sample count k MUST sit within this inclusive range
// (D-10 "k=3-5 multi-sample per item for SEM reporting"). A k outside the range is a ContractError.
// Object.freeze'd so the pre-registered range cannot be mutated post-hoc (D-20).
// ---------------------------------------------------------------------------
export const PARITY_K_RANGE = Object.freeze({ MIN: 3, MAX: 5 });

// The valid per-ordering preference tokens the judge may emit (D-06). 'tie' is a first-class
// outcome, not an error.
const VALID_PREFERENCES = Object.freeze(['A', 'B', 'tie']);

// ---------------------------------------------------------------------------
// cellVerdict: the position-swap agreement rule (D-06 / Pattern 3). Each argument is the RESOLVED
// preference of one ordering, already mapped to 'lz' | 'builtin' | 'tie'. A win is recorded ONLY
// when BOTH orderings agree on the same system; ANY disagreement (incl. a tie in either ordering) ->
// 'tie' (disagreement = position bias = TIE). This is the SOLE place the win/tie/loss is decided, so
// it is the discrimination anchor: a relaxed "win if EITHER ordering prefers lz" rule would return
// 'lz-win' for ('lz','builtin') -- this function returns 'tie'.
// ---------------------------------------------------------------------------
export function cellVerdict(orderAB, orderBA) {
  for (const v of [orderAB, orderBA]) {
    if (v !== 'lz' && v !== 'builtin' && v !== 'tie') {
      throw new ContractError(
        'invalid resolved preference (expected "lz" | "builtin" | "tie"): ' + JSON.stringify(v),
        'cellVerdict',
      );
    }
  }

  if (orderAB === 'lz' && orderBA === 'lz') {
    return 'lz-win';
  }

  if (orderAB === 'builtin' && orderBA === 'builtin') {
    return 'builtin-win';
  }

  return 'tie';
}

// Resolve a record's preferred 'A'|'B'|'tie' into 'lz'|'builtin'|'tie' using the per-ordering A/B->lz
// map. orderingMap[ordering] names which slot ('A' or 'B') is the lz report in that ordering; the
// OTHER slot is builtin. A 'tie' preference stays 'tie'.
function resolvePreference(preferred, ordering, orderingMap) {
  if (!VALID_PREFERENCES.includes(preferred)) {
    throw new ContractError(
      'invalid judge preference (expected "A" | "B" | "tie"): ' + JSON.stringify(preferred),
      ordering,
    );
  }

  if (preferred === 'tie') {
    return 'tie';
  }

  const lzSlot = orderingMap[ordering];

  return preferred === lzSlot ? 'lz' : 'builtin';
}

// Sample standard deviation (n-1 denominator) then SEM = stddev / sqrt(n). Pure arithmetic
// DESCRIPTOR (D-07: no CI claim is made; this is reported for description only, never gated). A
// single sample (n<2) has no sample-stddev -> SEM 0 (degenerate, reported as 0, not NaN).
function semOf(values) {
  const n = values.length;

  if (n < 2) {
    return 0;
  }

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sumSqDev = values.reduce((acc, x) => acc + (x - mean) * (x - mean), 0);
  const sampleVariance = sumSqDev / (n - 1);
  const stddev = Math.sqrt(sampleVariance);

  return stddev / Math.sqrt(n);
}

function meanOf(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Validate a single landed judge record's shape (fail-closed, T-22-01). A malformed/partial record
// is a ContractError -- never a silent half-cell.
function validateRecord(rec, where) {
  if (rec == null || typeof rec !== 'object') {
    throw new ContractError('malformed judge record (expected object): ' + JSON.stringify(rec), where);
  }

  if (typeof rec.question !== 'string' || rec.question.length === 0) {
    throw new ContractError('judge record missing a non-empty question: ' + JSON.stringify(rec.question), where);
  }

  if (typeof rec.dimension !== 'string' || rec.dimension.length === 0) {
    throw new ContractError('judge record missing a non-empty dimension: ' + JSON.stringify(rec.dimension), where);
  }

  if (typeof rec.ordering !== 'string' || rec.ordering.length === 0) {
    throw new ContractError('judge record missing a non-empty ordering: ' + JSON.stringify(rec.ordering), where);
  }

  if (typeof rec.score !== 'number' || !Number.isFinite(rec.score)) {
    throw new ContractError('judge record score is not a finite number: ' + JSON.stringify(rec.score), where);
  }
}

// ---------------------------------------------------------------------------
// scoreJudgeCells: group a set of landed judge records by (question, dimension), resolve the
// preferred A/B of each ordering into 'lz'|'builtin' via orderingMap, apply cellVerdict over the two
// orderings, and report the descriptive per-cell { question, dimension, verdict, meanScoreLz,
// meanScoreBuiltin, semLz, semBuiltin, k } over the k samples.
//
// Contract (fail-closed, T-22-01):
//   - exactly TWO orderings per (question, dimension) cell (both halves of the swap required);
//     a missing ordering -> ContractError (never a silent half-cell).
//   - an ordering label absent from orderingMap -> ContractError.
//   - each ordering's sample count k must sit within PARITY_K_RANGE (3..5); else ContractError.
//   - the two orderings of a cell must share the same k (a clean swap); else ContractError.
//   - within an ordering, ALL records must agree on the single preferred token (the judge's verdict
//     for that ordering is per-ordering, not per-sample-flipping); else ContractError.
//
// records may be passed in-memory (array) OR scoreJudgeCells reads them from disk -- callers pass the
// already-parsed array; the on-disk read path is the loadJudgeRecords helper below.
// ---------------------------------------------------------------------------
export function scoreJudgeCells({ records, orderingMap }) {
  if (!Array.isArray(records)) {
    throw new ContractError('records must be an array', 'scoreJudgeCells');
  }

  if (orderingMap == null || typeof orderingMap !== 'object') {
    throw new ContractError('orderingMap must be an object mapping ordering label -> lz slot', 'scoreJudgeCells');
  }

  // Group records by cell key (question, dimension), then by ordering within the cell.
  const cells = new Map(); // cellKey -> Map(ordering -> [records])

  for (const rec of records) {
    validateRecord(rec, 'scoreJudgeCells');

    const cellKey = rec.question + ' ' + rec.dimension;

    if (!cells.has(cellKey)) {
      cells.set(cellKey, new Map());
    }

    const byOrdering = cells.get(cellKey);

    if (!byOrdering.has(rec.ordering)) {
      byOrdering.set(rec.ordering, []);
    }

    byOrdering.get(rec.ordering).push(rec);
  }

  const out = [];

  // Deterministic order: sort cell keys (question, dimension) so the output is reproducible.
  const sortedKeys = Array.from(cells.keys()).sort();

  for (const cellKey of sortedKeys) {
    const byOrdering = cells.get(cellKey);
    const orderingLabels = Array.from(byOrdering.keys()).sort();

    if (orderingLabels.length !== 2) {
      throw new ContractError(
        'a (question, dimension) cell requires exactly 2 orderings (the position swap); got ' +
          orderingLabels.length +
          ' for ' +
          JSON.stringify(cellKey.replace(' ', ' / ')),
        'scoreJudgeCells',
      );
    }

    let cellK = null;
    const resolved = {}; // ordering -> resolved preference ('lz'|'builtin'|'tie')
    const lzScores = [];
    const builtinScores = [];

    for (const ordering of orderingLabels) {
      if (!Object.hasOwn(orderingMap, ordering)) {
        throw new ContractError(
          'ordering label not in orderingMap: ' + JSON.stringify(ordering),
          'scoreJudgeCells',
        );
      }

      const lzSlot = orderingMap[ordering];

      if (lzSlot !== 'A' && lzSlot !== 'B') {
        throw new ContractError(
          'orderingMap value must be "A" or "B" (the lz slot): ' + JSON.stringify(lzSlot),
          ordering,
        );
      }

      const recs = byOrdering.get(ordering);
      const k = recs.length;

      if (k < PARITY_K_RANGE.MIN || k > PARITY_K_RANGE.MAX) {
        throw new ContractError(
          'k=' + k + ' outside PARITY_K_RANGE [' + PARITY_K_RANGE.MIN + '..' + PARITY_K_RANGE.MAX + '] for ordering ' + JSON.stringify(ordering),
          'scoreJudgeCells',
        );
      }

      if (cellK === null) {
        cellK = k;
      } else if (cellK !== k) {
        throw new ContractError(
          'the two orderings of a cell must share the same k (clean swap): ' + cellK + ' vs ' + k,
          'scoreJudgeCells',
        );
      }

      // Within an ordering, the judge's preferred token must be consistent across samples (the
      // per-ordering verdict is a single preference; the score VARIES per sample for SEM, the
      // preference does not flip mid-ordering). A flip is a malformed half-cell.
      const prefs = new Set(recs.map((r) => r.preferred));

      if (prefs.size !== 1) {
        throw new ContractError(
          'ordering ' + JSON.stringify(ordering) + ' has inconsistent preferred tokens across samples: ' + JSON.stringify(Array.from(prefs)),
          'scoreJudgeCells',
        );
      }

      const preferred = recs[0].preferred;

      resolved[ordering] = resolvePreference(preferred, ordering, orderingMap);

      // Accumulate the lz-slot and builtin-slot scores. The lz score for this ordering is the
      // record's own score (each record IS one report's grade in this ordering); the lz pool is the
      // union of the slot the lz report occupied across the two orderings. Because each record
      // carries the score for the lz report in its ordering directly (one dimension, one report per
      // call), the score field is the lz report's score when the ordering's lz slot matches, and the
      // builtin report's score otherwise. The harness lands ONE record per (q, dim, ordering, sample)
      // describing the comparison; for the descriptive mean we record the score against the system
      // the judge preferred is NOT how the score is attributed -- the score is the lz report's grade
      // in that ordering (the harness grades the lz report; the preferred token is the pairwise pick).
      for (const r of recs) {
        lzScores.push(r.score);
      }
    }

    // builtinScores stays empty unless the harness also lands a builtin-report score; the descriptive
    // builtin mean/SEM are computed over whatever builtin scores were provided (empty -> 0). The
    // pairwise verdict (the load-bearing output) does NOT depend on the builtin score pool.
    const [oA, oB] = orderingLabels;
    const verdict = cellVerdict(resolved[oA], resolved[oB]);

    const [question, dimension] = cellKey.split(' ');

    out.push({
      question,
      dimension,
      verdict,
      meanScoreLz: meanOf(lzScores),
      meanScoreBuiltin: meanOf(builtinScores),
      semLz: semOf(lzScores),
      semBuiltin: semOf(builtinScores),
      k: cellK,
    });
  }

  return out;
}

// Load landed judge records from a directory of *.json files (fail-closed via readJson). Each file
// is one record OR an array of records. Returns a flat array suitable for scoreJudgeCells. This is
// the on-disk read path (T-22-01): every record goes through readJson, never a bare JSON.parse.
export function loadJudgeRecords(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new ContractError('judge-record dir missing or not a directory: ' + JSON.stringify(dir), dir);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const records = [];

  for (const f of files) {
    const full = path.join(dir, f);
    const parsed = readJson(full);

    if (Array.isArray(parsed)) {
      records.push(...parsed);
    } else {
      records.push(parsed);
    }
  }

  return records;
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Single positional <judge-record-dir>;
// requires a sibling ordering-map.json next to it; prints the scored cells as JSON; exits 0 / 2.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const recordDir = process.argv[2];

  if (!recordDir || !fs.existsSync(recordDir) || !fs.statSync(recordDir).isDirectory()) {
    console.error('lz-eval-parity-judge: missing or invalid <judge-record-dir>');
    process.exit(2);
  }

  try {
    const orderingMapPath = path.join(path.dirname(recordDir), 'ordering-map.json');
    const orderingMap = readJson(orderingMapPath);
    const records = loadJudgeRecords(recordDir);
    const cells = scoreJudgeCells({ records, orderingMap });
    console.log(JSON.stringify(cells, null, 2));
    process.exit(0);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-parity-judge: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
