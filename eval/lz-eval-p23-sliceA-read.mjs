// lz-eval-p23-sliceA-read.mjs
//
// NET-NEW (Plan 23-02, Task 2; NO-SPEND): the SEED-005 DISPATCH-PROVENANCE writer, its fail-closed
// score-time cross-check, and the DESCRIPTIVE never-pooled Slice-A read (ENV-03). THE AUTHORITY is
// 23-CONTEXT.md (D-08/D-09/D-14) + SEED-005 + eval/lz-eval-p23-prereg.md.
//
// WHY THIS LANDS BEFORE VERDICT ONE (SEED-005): the Phase-22 transcription-fidelity check came back
// INCONCLUSIVE, not passing. 62 of 63 transcript files were zero bytes and the transport retained no
// readable copy of the outbound prompt, so "what the instrument actually was" is unrecoverable for that
// run -- the single weakest link in the whole Phase-22 record, by the record's own assessment. Nothing
// here can be retrofitted after a write-once run, which is why it exists in wave 2 rather than beside
// the dispatch in wave 5.
//
// THE T-22-15 SUBSTITUTION DEFECT, FIXED HERE (escalated from 22-SECURITY.md): building the dispatch
// text with a plain string replacement VALUE lets the corpus's own dollar sequences act as replacement
// patterns -- $& inserts the match, $` the text before it, $' the text after it, $$ a single dollar.
// The claim that reaches the voter is then not the claim in the corpus. Measured in Phase 22: 27 of 60
// records carried a dollar sign and NONE carried a hazardous sequence, so that run was not corrupted;
// this fix lands before the first Phase-23 verdict. Every substitution here goes through a REPLACER
// FUNCTION, in ONE call site, in a single scan -- and `replace` never re-scans the text a replacer
// inserts, so a claim containing a placeholder literal cannot be re-substituted either.
//
// NEVER POOLED (ENV-03 / D-11): sliceARead composes the frozen gold module's tallyPerDirection and
// returns EXACTLY { unrefuted, refuted, n, drawSeed, provisionalLimits } -- no pooled rate, no
// accuracy, no Clopper-Pearson, no confidence interval, and no pass/fail field a reader could mistake
// for a certification. The co-test asserts that EXACT key set, which is strictly stronger than
// checking that a few named pooled metrics are absent: it forecloses every one, including names nobody
// has thought of yet. Slice A REPORTS; it never passes or fails anything.
//
// ANSWER-LEAK CONTROL (T-23-03): the dispatch template carries ONLY the claim text and the as-of
// cutoff. It never carries the gold label, the justification, the fact-checking article, the questions,
// the speaker, or the `drawIndex` -- the join key gold is recovered by at score time lives on the
// dispatch RECORD, outside the dispatched string.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees
// by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It adds NO package and
// performs NO network call; a co-test asserts both from this file's own source.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. There is no CLI: Plan 23-05 drives the dispatch and the read from the session.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// The frozen gold module: tallyPerDirection owns the never-pooled four cells, and
// sliceAFeasibilityGate owns the first two PROVISIONAL limit strings (see PROVISIONAL_LIMITS below).
import { tallyPerDirection, sliceAFeasibilityGate } from './lz-eval-sliceA-gold.mjs';

// The frozen draw constants: N_PER_DIRECTION fixes how many definite verdicts a COMPLETE read requires.
import { DRAW } from './lz-eval-p23-sliceA-draw.mjs';

// The two gold directions and the two admissible verdict labels.
const DIRECTIONS = Object.freeze(['unrefuted', 'refuted']);

// ---------------------------------------------------------------------------
// The FROZEN voter prompt template. It carries the claim and the as-of cutoff and NOTHING else -- no
// gold label, no justification, no fact-checking article, no questions, no speaker, no drawIndex
// (T-23-03). Built as an array joined by newline so the frozen text is readable line by line and the
// substitution surface is exactly the two placeholders below.
// ---------------------------------------------------------------------------
const VOTER_PROMPT_TEMPLATE = Object.freeze(
  [
    'You are a verify-voter. Decide whether the CLAIM below is REFUTED by the evidence you can find.',
    '',
    'Judge the claim AS OF the cutoff date below, not as of today. Evidence published after the cutoff',
    'is out of scope.',
    '',
    'CUTOFF (day-month-year): {{CLAIM_DATE}}',
    'CLAIM: {{CLAIM}}',
    '',
    'Answer with exactly one word, lowercase, and nothing else: refuted, or unrefuted.',
  ].join('\n'),
);

// The ONE substitution scan, and it is GLOBAL BY REQUIREMENT. The template carries TWO placeholders
// ({{CLAIM_DATE}} and {{CLAIM}}); without /g only the first would be replaced and the dispatched prompt
// would still carry a literal {{CLAIM}}.
//
// The /g flag does NOT weaken the T-22-15 fix below. `replace` scans the ORIGINAL string once and never
// re-scans the text a replacer inserts, so global-vs-non-global has no bearing on re-substitution: a
// claim containing the literal string {{CLAIM_DATE}} cannot itself be substituted either way.
const PLACEHOLDER_RE = /\{\{(CLAIM|CLAIM_DATE)\}\}/g;

// ---------------------------------------------------------------------------
// The three PROVISIONAL limits recorded with every Slice-A read. The FIRST TWO are OWNED by the frozen
// gold module -- they are recovered through its own accessor rather than re-typed here, so a change
// there propagates rather than drifting. The THIRD is new to this read: the reference standard is
// 2020-labelled while the voter searches the live 2026 web, so a disagreement can be an evidence-set
// mismatch rather than a voter error.
// ---------------------------------------------------------------------------
function provisionalLimits() {
  const { provisionalLimits: owned } = sliceAFeasibilityGate({
    supportedCount: DRAW.N_PER_DIRECTION,
    refutedCount: DRAW.N_PER_DIRECTION,
  });

  return owned.concat([
    'evidence-set mismatch (the AVeriTeC reference standard was labelled against 2020 evidence while ' +
      'the verify-voter searches the live 2026 web, so a verdict-vs-gold disagreement may reflect a ' +
      'different evidence set rather than a voter error)',
  ]);
}

// ---------------------------------------------------------------------------
// assertNonNegativeInteger / assertNonEmptyString -- the argument-checking shape
// sliceAFeasibilityGate already uses (lz-eval-sliceA-gold.mjs:220-238).
// ---------------------------------------------------------------------------
function assertNonNegativeInteger(name, v, where) {
  if (!Number.isInteger(v) || v < 0) {
    throw new ContractError(
      where + ' requires a non-negative integer ' + name + ': ' + JSON.stringify(v),
      where,
    );
  }
}

function assertNonEmptyString(name, v, where) {
  if (typeof v !== 'string' || v.length === 0) {
    throw new ContractError(
      where + ' requires a non-empty string ' + name + ': ' + JSON.stringify(v),
      where,
    );
  }
}

function assertDirection(direction, where) {
  if (!DIRECTIONS.includes(direction)) {
    throw new ContractError(
      where + ' requires direction to be unrefuted|refuted: ' + JSON.stringify(direction),
      where,
    );
  }
}

// The per-item record key. drawIndex + direction together identify one drawn item.
function recordKey(direction, drawIndex) {
  return direction + '-' + drawIndex;
}

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// buildDispatchString({ claim, claimDate }) -- render the frozen voter prompt for ONE drawn item.
//
// THE SUBSTITUTION IS A REPLACER FUNCTION, DELIBERATELY (T-22-15). `String.prototype.replace` with a
// string VALUE interprets $&, $`, $' and $$ in that value as replacement patterns, so a claim
// containing any of them would be silently mangled on its way to the voter. A replacer function
// receives the value and inserts it literally. There is exactly ONE call site.
// ---------------------------------------------------------------------------
export function buildDispatchString({ claim, claimDate } = {}) {
  assertNonEmptyString('claim', claim, 'buildDispatchString');
  assertNonEmptyString('claimDate', claimDate, 'buildDispatchString');

  const values = { CLAIM: claim, CLAIM_DATE: claimDate };

  return VOTER_PROMPT_TEMPLATE.replace(PLACEHOLDER_RE, (_match, key) => values[key]);
}

// ---------------------------------------------------------------------------
// writeDispatchRecord({ dir, drawIndex, direction, sent }) -- persist the EXACT dispatched string plus
// its sha256, at dispatch time, keyed by direction + drawIndex. This is what closes SEED-005: after
// the run, "what the instrument actually was" is recoverable from disk instead of being an
// unverifiable assumption.
//
// It REFUSES to overwrite an existing record (T-23-09). That write-once discipline is what makes a
// partial re-roll distinguishable from a resume: a resume skips items that already have a record, and
// a re-roll trips this error instead of quietly replacing the evidence.
//
// Returns { file, direction, drawIndex, sent, sha256 }.
// ---------------------------------------------------------------------------
export function writeDispatchRecord({ dir, drawIndex, direction, sent } = {}) {
  assertNonEmptyString('dir', dir, 'writeDispatchRecord');
  assertNonNegativeInteger('drawIndex', drawIndex, 'writeDispatchRecord');
  assertDirection(direction, 'writeDispatchRecord');
  assertNonEmptyString('sent', sent, 'writeDispatchRecord');

  if (!fs.existsSync(dir)) {
    throw new ContractError(
      'writeDispatchRecord dispatch directory does not exist (create it before dispatching): ' + JSON.stringify(dir),
      'writeDispatchRecord',
    );
  }

  const file = path.join(dir, recordKey(direction, drawIndex) + '.dispatch.json');

  if (fs.existsSync(file)) {
    throw new ContractError(
      'writeDispatchRecord refuses to overwrite an existing dispatch record for direction ' +
        direction +
        ' drawIndex ' +
        drawIndex +
        ' (write-once provenance, SEED-005: a re-roll must be distinguishable from a resume): ' +
        JSON.stringify(file),
      'writeDispatchRecord',
    );
  }

  const record = { direction, drawIndex, sent, sha256: sha256Hex(sent) };
  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n', 'utf8');

  return { file, ...record };
}

// ---------------------------------------------------------------------------
// readSliceAVerdicts({ dispatchDir, verdictDir }) -- load every persisted verdict, pair it with its
// dispatch record by direction + drawIndex, and FAIL CLOSED. This is the cross-check SEED-005 asks
// for, not an advisory one:
//   - a verdict with NO dispatch record throws, naming the unmatched drawIndex;
//   - a dispatch record whose stored sha256 disagrees with its stored string throws;
//   - a verdict outside the unrefuted|refuted|null enum throws.
// A `null` verdict is admissible on disk (an abstain) and is carried through; sliceARead is what
// refuses to read a pool with too few DEFINITE verdicts.
//
// Returns pairs sorted by direction then drawIndex, each
// { direction, drawIndex, verdict, sent, sha256 }.
// ---------------------------------------------------------------------------
export function readSliceAVerdicts({ dispatchDir, verdictDir } = {}) {
  assertNonEmptyString('dispatchDir', dispatchDir, 'readSliceAVerdicts');
  assertNonEmptyString('verdictDir', verdictDir, 'readSliceAVerdicts');

  for (const [name, dir] of [['dispatchDir', dispatchDir], ['verdictDir', verdictDir]]) {
    if (!fs.existsSync(dir)) {
      throw new ContractError(
        'readSliceAVerdicts ' + name + ' does not exist: ' + JSON.stringify(dir),
        'readSliceAVerdicts',
      );
    }
  }

  const dispatch = new Map();

  for (const name of fs.readdirSync(dispatchDir).sort()) {
    if (!name.endsWith('.dispatch.json')) {
      continue;
    }

    const record = JSON.parse(fs.readFileSync(path.join(dispatchDir, name), 'utf8'));
    assertDirection(record.direction, 'readSliceAVerdicts');
    assertNonNegativeInteger('drawIndex', record.drawIndex, 'readSliceAVerdicts');
    assertNonEmptyString('sent', record.sent, 'readSliceAVerdicts');

    const actual = sha256Hex(record.sent);

    if (record.sha256 !== actual) {
      throw new ContractError(
        'readSliceAVerdicts dispatch record sha256 does not match its stored string for direction ' +
          record.direction +
          ' drawIndex ' +
          record.drawIndex +
          ' (stored ' +
          JSON.stringify(record.sha256) +
          ', recomputed ' +
          JSON.stringify(actual) +
          ') -- the instrument on disk has been altered (SEED-005, fail-closed)',
        'readSliceAVerdicts',
      );
    }

    dispatch.set(recordKey(record.direction, record.drawIndex), record);
  }

  const pairs = [];

  for (const name of fs.readdirSync(verdictDir).sort()) {
    if (!name.endsWith('.verdict.json')) {
      continue;
    }

    const verdictRecord = JSON.parse(fs.readFileSync(path.join(verdictDir, name), 'utf8'));
    assertDirection(verdictRecord.direction, 'readSliceAVerdicts');
    assertNonNegativeInteger('drawIndex', verdictRecord.drawIndex, 'readSliceAVerdicts');

    const verdict = verdictRecord.verdict == null ? null : verdictRecord.verdict;

    if (verdict !== null && !DIRECTIONS.includes(verdict)) {
      throw new ContractError(
        'readSliceAVerdicts verdict must be unrefuted|refuted|null: ' + JSON.stringify(verdictRecord.verdict),
        'readSliceAVerdicts',
      );
    }

    const key = recordKey(verdictRecord.direction, verdictRecord.drawIndex);
    const record = dispatch.get(key);

    if (record === undefined) {
      throw new ContractError(
        'readSliceAVerdicts found a verdict with NO dispatch record: direction ' +
          verdictRecord.direction +
          ' drawIndex ' +
          verdictRecord.drawIndex +
          ' (SEED-005: a verdict whose dispatched string was never recorded cannot be scored)',
        'readSliceAVerdicts',
      );
    }

    pairs.push({
      direction: record.direction,
      drawIndex: record.drawIndex,
      verdict,
      sent: record.sent,
      sha256: record.sha256,
    });
  }

  pairs.sort((a, b) => {
    if (a.direction !== b.direction) {
      return a.direction < b.direction ? -1 : 1;
    }

    return a.drawIndex - b.drawIndex;
  });

  return pairs;
}

// ---------------------------------------------------------------------------
// sliceARead({ pairs, gold, drawSeed }) -- the DESCRIPTIVE, NEVER-POOLED read (ENV-03).
//
// `pairs` is readSliceAVerdicts' output. `gold` is an array of { direction, drawIndex, label } rows,
// the held-back reference standard recovered by the drawIndex join key. Every pair must have a gold
// row, and that row's label must agree with the pair's direction -- the direction IS the gold
// direction by construction, so a disagreement means the join is wrong and reading on would silently
// mis-score.
//
// A pool with fewer than DRAW.N_PER_DIRECTION * 2 DEFINITE verdicts is a ContractError, not a partial
// read: a smaller-n tally looks exactly like a complete one and nothing downstream would know.
//
// Returns EXACTLY { unrefuted, refuted, n, drawSeed, provisionalLimits } -- see the module header for
// why the absence of a pooled field is asserted as an exact key set rather than as named absences.
// ---------------------------------------------------------------------------
export function sliceARead({ pairs, gold, drawSeed } = {}) {
  assertNonNegativeInteger('drawSeed', drawSeed, 'sliceARead');

  if (!Array.isArray(pairs)) {
    throw new ContractError('sliceARead requires a pairs array: ' + JSON.stringify(pairs), 'sliceARead');
  }

  if (!Array.isArray(gold)) {
    throw new ContractError('sliceARead requires a gold array: ' + JSON.stringify(gold), 'sliceARead');
  }

  const required = DRAW.N_PER_DIRECTION * 2;
  const definite = pairs.filter((p) => DIRECTIONS.includes(p.verdict));

  if (definite.length < required) {
    throw new ContractError(
      'sliceARead requires ' +
        required +
        ' definite verdicts and found ' +
        definite.length +
        ' (an incomplete pool is not a partial read -- a smaller-n tally is indistinguishable from a ' +
        'complete one downstream)',
      'sliceARead',
    );
  }

  const goldByKey = new Map();

  for (const row of gold) {
    assertDirection(row.direction, 'sliceARead');
    assertNonNegativeInteger('drawIndex', row.drawIndex, 'sliceARead');
    assertDirection(row.label, 'sliceARead');
    goldByKey.set(recordKey(row.direction, row.drawIndex), row.label);
  }

  const verdicts = [];
  const goldLabels = [];

  for (const pair of definite) {
    const key = recordKey(pair.direction, pair.drawIndex);
    const label = goldByKey.get(key);

    if (label === undefined) {
      throw new ContractError(
        'sliceARead found no gold row for direction ' +
          pair.direction +
          ' drawIndex ' +
          pair.drawIndex +
          ' (the drawIndex join key is how gold is recovered at score time)',
        'sliceARead',
      );
    }

    if (label !== pair.direction) {
      throw new ContractError(
        'sliceARead gold label ' +
          JSON.stringify(label) +
          ' disagrees with the drawn direction ' +
          JSON.stringify(pair.direction) +
          ' at drawIndex ' +
          pair.drawIndex +
          ' (the direction IS the gold direction; a disagreement means the join is wrong)',
        'sliceARead',
      );
    }

    verdicts.push(pair.verdict);
    goldLabels.push(label);
  }

  // Compose the frozen gold module's never-pooled cell split. The pooled mcc mccFromPairs also
  // computes is not exposed by tallyPerDirection and is not reconstructed here.
  const tally = tallyPerDirection({ verdicts, gold: goldLabels });

  return {
    unrefuted: tally.unrefuted,
    refuted: tally.refuted,
    n: definite.length,
    drawSeed,
    provisionalLimits: provisionalLimits(),
  };
}
