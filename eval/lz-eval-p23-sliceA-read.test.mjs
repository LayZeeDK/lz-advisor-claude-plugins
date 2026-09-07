// lz-eval-p23-sliceA-read.test.mjs
//
// Co-test for the SEED-005 dispatch-provenance writer plus the never-pooled DESCRIPTIVE Slice-A read
// (Plan 23-02, Task 2; NO-SPEND). Dev-only eval-tree test: it imports the module under test, the frozen
// gold module it composes, node stdlib, and nothing else. There is NO model call and NO network
// anywhere in this file or in the module -- every fixture is an fs.mkdtempSync temp directory.
//
// WHY THIS EXISTS BEFORE VERDICT ONE (SEED-005 / D-14): the Phase-22 transcription-fidelity check came
// back INCONCLUSIVE, not passing -- 62 of 63 transcript files were zero bytes and the transport kept no
// readable copy of the outbound prompt, so "what the instrument actually was" is unrecoverable for that
// run. Provenance CANNOT be retrofitted after a write-once run. It has to be in place first, which is
// why this lands in wave 2 and not beside the dispatch in wave 5.
//
// Asserted behaviors (one named test each, never a tautology):
//   - buildDispatchString carries the claim text and the claim_date VERBATIM.
//   - it throws a ContractError on an absent / empty claim and on an absent / empty claim_date.
//   - writeDispatchRecord persists the exact dispatched string plus its sha256, keyed by direction and
//     drawIndex, and REFUSES to overwrite an existing record (the write-once discipline that makes a
//     partial re-roll distinguishable from a resume).
//   - readSliceAVerdicts pairs every verdict with its dispatch record and FAILS CLOSED: an unmatched
//     verdict throws naming the drawIndex, and a stored digest that disagrees with the stored string
//     throws too.
//   - sliceARead's output key set is EXACTLY ['drawSeed', 'n', 'provisionalLimits', 'refuted',
//     'unrefuted'] -- no pooled rate, no accuracy, no interval, no pass/fail field.
//   - sliceARead carries the three PROVISIONAL limit strings, the first two owned by the frozen gold
//     module.
//   - an incomplete pool (fewer than 40 definite verdicts) is a ContractError, not a partial read.
//
// DISCRIMINATION (the invert-the-fix proofs, required by the plan):
//   - THE T-22-15 SUBSTITUTION DEFECT. A claim containing $&, $`, $' or $$ must round-trip VERBATIM.
//     Implemented with a plain string replacement value instead of a replacer function, those
//     sequences are interpreted as special patterns and the instrument is silently mangled -- the
//     traced failure mode is a mangled prompt, NOT an answer leak, so neither existing Phase-22
//     anti-leak guard would have fired. Measured in Phase 22: 27 of 60 records carried a dollar sign
//     and none carried a hazardous sequence, so that run was not corrupted; the fix lands before
//     verdict one.
//   - THE ANSWER-LEAK CHECK IS VALUE-BASED, NOT NAME-BASED. The dispatch string must contain no VALUE
//     from a synthetic full gold row, enumerated from the fixture's own fields, so the assertion stays
//     valid if the corpus schema gains a field nobody has thought of yet (T-23-03).
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-p23-sliceA-read.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
import { filterSliceA } from './lz-eval-sliceA-gold.mjs';
import { DRAW } from './lz-eval-p23-sliceA-draw.mjs';

import {
  buildDispatchString,
  writeDispatchRecord,
  readSliceAVerdicts,
  sliceARead,
} from './lz-eval-p23-sliceA-read.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MODULE_SOURCE = path.join(HERE, 'lz-eval-p23-sliceA-read.mjs');

const N_TOTAL = DRAW.N_PER_DIRECTION * 2;

function tempDirs() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'p23-sliceA-read-'));
  const dispatchDir = path.join(root, 'dispatch');
  const verdictDir = path.join(root, 'verdicts');
  fs.mkdirSync(dispatchDir, { recursive: true });
  fs.mkdirSync(verdictDir, { recursive: true });

  return { root, dispatchDir, verdictDir };
}

function writeVerdict(verdictDir, direction, drawIndex, verdict) {
  const file = path.join(verdictDir, direction + '-' + drawIndex + '.verdict.json');
  fs.writeFileSync(file, JSON.stringify({ direction, drawIndex, verdict }, null, 2) + '\n', 'utf8');

  return file;
}

// A complete, internally consistent run: N_PER_DIRECTION dispatched + voted items per direction. The
// `verdictFor` hook decides each verdict so a caller can shape the confusion cells.
function materializeRun({ dispatchDir, verdictDir, verdictFor }) {
  const gold = [];

  for (const direction of ['unrefuted', 'refuted']) {
    for (let i = 0; i < DRAW.N_PER_DIRECTION; i += 1) {
      const claim = 'A ' + direction + ' report-shaped claim at pool position ' + i + ' under test.';
      const claimDate = '2020-06-1' + (i % 10);
      const sent = buildDispatchString({ claim, claimDate });
      writeDispatchRecord({ dir: dispatchDir, drawIndex: i, direction, sent });
      writeVerdict(verdictDir, direction, i, verdictFor({ direction, drawIndex: i }));
      gold.push({ direction, drawIndex: i, label: direction });
    }
  }

  return gold;
}

// ---------------------------------------------------------------------------
// buildDispatchString: the claim + the as-of cutoff, verbatim, and nothing else.
// ---------------------------------------------------------------------------

test('D-14: buildDispatchString carries the claim text and the claim_date VERBATIM', () => {
  const claim = 'Forty percent of the state energy resources came from renewables in 2019.';
  const sent = buildDispatchString({ claim, claimDate: '2020-10-13' });
  assert.ok(sent.includes(claim), 'the claim text must appear verbatim');
  assert.ok(sent.includes('2020-10-13'), 'the as-of cutoff must appear verbatim');
  assert.equal(typeof sent, 'string');
  assert.ok(sent.length > claim.length, 'the template adds the voter instruction around the claim');
});

test('D-14: buildDispatchString leaves NO unsubstituted placeholder behind', () => {
  const sent = buildDispatchString({ claim: 'A claim long enough to look like a real corpus row.', claimDate: '2020-01-01' });
  assert.ok(!/\{\{[A-Z_]+\}\}/.test(sent), 'no {{PLACEHOLDER}} may survive substitution: ' + sent);
});

test('D-14: buildDispatchString throws a ContractError on an absent or empty claim / claim_date', () => {
  assert.throws(() => buildDispatchString({ claim: '', claimDate: '2020-01-01' }), ContractError);
  assert.throws(() => buildDispatchString({ claimDate: '2020-01-01' }), ContractError);
  assert.throws(() => buildDispatchString({ claim: 'A perfectly ordinary claim string.', claimDate: '' }), ContractError);
  assert.throws(() => buildDispatchString({ claim: 'A perfectly ordinary claim string.' }), ContractError);
  assert.throws(() => buildDispatchString(), ContractError);
});

// ---------------------------------------------------------------------------
// DISCRIMINATION 1: the T-22-15 substitution defect (escalated from Phase 22).
// ---------------------------------------------------------------------------

test('T-22-15 DISCRIMINATION: each of the four special dollar sequences round-trips VERBATIM into the dispatch string', () => {
  // DISCRIMINATION: with a plain string replacement value instead of a replacer function,
  // String.prototype.replace INTERPRETS these sequences -- $& inserts the match, $` the text before
  // it, $' the text after it, $$ a single dollar -- so the claim that reaches the voter is not the
  // claim in the corpus. The failure is a silently mangled instrument, not an answer leak, so neither
  // Phase-22 anti-leak guard fires on it.
  const cases = [
    ['dollar-ampersand', 'Budget line $& was approved by the committee without amendment in 2019.'],
    ['dollar-backtick', 'Budget line $` was approved by the committee without amendment in 2019.'],
    ['dollar-apostrophe', "Budget line $' was approved by the committee without amendment in 2019."],
    ['doubled-dollar', 'Budget line $$ was approved by the committee without amendment in 2019.'],
  ];

  for (const [name, claim] of cases) {
    const sent = buildDispatchString({ claim, claimDate: '2020-02-02' });
    assert.ok(sent.includes(claim), name + ' must round-trip verbatim, got: ' + JSON.stringify(sent));
  }
});

test('T-22-15: a claim carrying ALL FOUR sequences at once still round-trips verbatim', () => {
  const claim = "The $& and $` and $' and $$ sequences all appear in this single corpus-shaped claim.";
  const sent = buildDispatchString({ claim, claimDate: '2020-03-03' });
  assert.ok(sent.includes(claim), 'the combined claim must round-trip verbatim, got: ' + JSON.stringify(sent));
});

test('T-22-15: a dollar sequence in the CLAIM_DATE also round-trips verbatim (both call sites are covered)', () => {
  const claimDate = '2020-04-04 $& $$';
  const sent = buildDispatchString({ claim: 'An ordinary report-shaped claim for the cutoff test.', claimDate });
  assert.ok(sent.includes(claimDate), 'the cutoff must round-trip verbatim, got: ' + JSON.stringify(sent));
});

// ---------------------------------------------------------------------------
// DISCRIMINATION 2: the answer-leak check is VALUE-based, enumerated from the fixture itself.
// ---------------------------------------------------------------------------

test('T-23-03 DISCRIMINATION: the dispatch string contains NO VALUE from a synthetic full gold row (enumerated from the fixture, not from hardcoded field names)', () => {
  // A full AVeriTeC-shaped row: the claim + the cutoff are dispatchable, every other field is gold and
  // must never reach the voter. The assertion iterates the FIXTURE'S OWN entries, so it stays valid if
  // the corpus schema gains a field this test never heard of.
  const fullRow = {
    claim: 'The urban population of the country at independence was approximately seven million people.',
    claim_date: '2020-09-09',
    label: 'Supported',
    justification: 'GOLD-JUSTIFICATION-e3f1 the reference standard reasoning that must never be dispatched',
    fact_checking_article: 'https://example.invalid/GOLD-ARTICLE-9a2c',
    questions: ['GOLD-QUESTION-77bd what was the population', 'GOLD-QUESTION-12ef when was independence'],
    speaker: 'GOLD-SPEAKER-4d0a',
    reporting_source: 'GOLD-SOURCE-8b6e',
  };

  const { unrefuted } = filterSliceA({ items: [fullRow] });
  assert.equal(unrefuted.length, 1, 'the synthetic row must survive the report-shaped filter');

  const sent = buildDispatchString({ claim: unrefuted[0].claim, claimDate: unrefuted[0].claim_date });

  for (const [field, value] of Object.entries(fullRow)) {
    if (field === 'claim' || field === 'claim_date') {
      continue;
    }

    const needles = Array.isArray(value) ? value : [value];

    for (const needle of needles) {
      assert.ok(
        !sent.includes(String(needle)),
        'gold field ' + field + ' leaked into the dispatch string: ' + JSON.stringify(needle),
      );
    }
  }
});

test('T-23-03: the dispatch string never carries the drawIndex (the join key is not dispatched)', () => {
  const dirs = tempDirs();
  const claim = 'A report-shaped claim used to check that the join key stays out of the payload.';
  const sent = buildDispatchString({ claim, claimDate: '2020-05-05' });
  const record = writeDispatchRecord({ dir: dirs.dispatchDir, drawIndex: 4242, direction: 'unrefuted', sent });
  assert.ok(!record.sent.includes('4242'), 'the dispatched string must not carry the drawIndex');
  assert.equal(record.drawIndex, 4242, 'the record itself does carry it, outside the dispatched string');
});

// ---------------------------------------------------------------------------
// writeDispatchRecord: write-once provenance (SEED-005 / T-23-09).
// ---------------------------------------------------------------------------

test('SEED-005: writeDispatchRecord persists the EXACT dispatched string plus its sha256, keyed by direction and drawIndex', () => {
  const dirs = tempDirs();
  const claim = 'A report-shaped claim whose exact dispatched form must be recoverable after the run.';
  const sent = buildDispatchString({ claim, claimDate: '2020-07-07' });
  const record = writeDispatchRecord({ dir: dirs.dispatchDir, drawIndex: 7, direction: 'refuted', sent });

  assert.equal(record.sent, sent, 'the record carries the exact string, not a re-render');
  assert.equal(record.sha256, crypto.createHash('sha256').update(sent, 'utf8').digest('hex'));
  assert.ok(fs.existsSync(record.file), 'the record file exists on disk: ' + record.file);

  const onDisk = JSON.parse(fs.readFileSync(record.file, 'utf8'));
  assert.equal(onDisk.sent, sent);
  assert.equal(onDisk.direction, 'refuted');
  assert.equal(onDisk.drawIndex, 7);
  assert.equal(onDisk.sha256, record.sha256);
});

test('SEED-005: writeDispatchRecord REFUSES a second write to the same key (write-once, so a re-roll is distinguishable from a resume)', () => {
  const dirs = tempDirs();
  const sent = buildDispatchString({ claim: 'A claim dispatched exactly once and never re-dispatched.', claimDate: '2020-08-08' });
  writeDispatchRecord({ dir: dirs.dispatchDir, drawIndex: 3, direction: 'unrefuted', sent });

  assert.throws(
    () => writeDispatchRecord({ dir: dirs.dispatchDir, drawIndex: 3, direction: 'unrefuted', sent }),
    (err) => {
      assert.ok(err instanceof ContractError);
      assert.equal(err.file, 'writeDispatchRecord');
      assert.match(err.message, /3/, 'the message names the drawIndex it refused to overwrite');

      return true;
    },
  );
});

test('SEED-005: writeDispatchRecord validates its arguments (empty sent, bad direction, non-integer drawIndex)', () => {
  const dirs = tempDirs();
  const sent = buildDispatchString({ claim: 'A claim used only for the argument-validation cases.', claimDate: '2020-01-02' });
  assert.throws(() => writeDispatchRecord({ dir: dirs.dispatchDir, drawIndex: 0, direction: 'sideways', sent }), ContractError);
  assert.throws(() => writeDispatchRecord({ dir: dirs.dispatchDir, drawIndex: -1, direction: 'unrefuted', sent }), ContractError);
  assert.throws(() => writeDispatchRecord({ dir: dirs.dispatchDir, drawIndex: 1.5, direction: 'unrefuted', sent }), ContractError);
  assert.throws(() => writeDispatchRecord({ dir: dirs.dispatchDir, drawIndex: 0, direction: 'unrefuted', sent: '' }), ContractError);
  assert.throws(() => writeDispatchRecord(), ContractError);
});

// ---------------------------------------------------------------------------
// readSliceAVerdicts: fail-closed pairing (T-23-09).
// ---------------------------------------------------------------------------

test('SEED-005: readSliceAVerdicts pairs every verdict with its dispatch record', () => {
  const dirs = tempDirs();
  materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  const pairs = readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir });

  assert.equal(pairs.length, N_TOTAL, 'all ' + N_TOTAL + ' items pair');

  for (const pair of pairs) {
    assert.deepEqual(
      Object.keys(pair).sort(),
      ['direction', 'drawIndex', 'sent', 'sha256', 'verdict'],
      'a pair carries the verdict AND its provenance',
    );
    assert.equal(pair.sha256, crypto.createHash('sha256').update(pair.sent, 'utf8').digest('hex'));
  }
});

test('T-23-09 DISCRIMINATION: a verdict with NO dispatch record throws a ContractError naming the unmatched drawIndex', () => {
  // DISCRIMINATION: an advisory check would log this and read on, producing a tally over an
  // instrument that was never recorded. Fail-closed is the point of SEED-005.
  const dirs = tempDirs();
  materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  writeVerdict(dirs.verdictDir, 'unrefuted', 991, 'unrefuted');

  assert.throws(
    () => readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir }),
    (err) => {
      assert.ok(err instanceof ContractError);
      assert.equal(err.file, 'readSliceAVerdicts');
      assert.match(err.message, /991/, 'the message names the unmatched drawIndex');

      return true;
    },
  );
});

test('T-23-09 DISCRIMINATION: a dispatch record whose stored sha256 disagrees with its stored string throws', () => {
  const dirs = tempDirs();
  materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  const tampered = path.join(dirs.dispatchDir, 'refuted-5.dispatch.json');
  const record = JSON.parse(fs.readFileSync(tampered, 'utf8'));
  record.sent = record.sent + ' AND ONE EXTRA SENTENCE NOBODY DISPATCHED.';
  fs.writeFileSync(tampered, JSON.stringify(record, null, 2) + '\n', 'utf8');

  assert.throws(
    () => readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir }),
    (err) => {
      assert.ok(err instanceof ContractError);
      assert.equal(err.file, 'readSliceAVerdicts');
      assert.match(err.message, /sha256|digest/i, 'the message names the digest mismatch');

      return true;
    },
  );
});

test('readSliceAVerdicts: a missing directory, or a verdict outside the two-label enum, is a ContractError', () => {
  const dirs = tempDirs();
  assert.throws(
    () => readSliceAVerdicts({ dispatchDir: path.join(dirs.root, 'nope'), verdictDir: dirs.verdictDir }),
    ContractError,
  );
  materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  writeVerdict(dirs.verdictDir, 'unrefuted', 0, 'probably');
  assert.throws(() => readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir }), ContractError);
});

// ---------------------------------------------------------------------------
// sliceARead: the DESCRIPTIVE, NEVER-POOLED read (ENV-03).
// ---------------------------------------------------------------------------

test('ENV-03: sliceARead returns EXACTLY [drawSeed, n, provisionalLimits, refuted, unrefuted] -- no pooled rate, no accuracy, no interval, no pass/fail', () => {
  // The exact-key-set assertion is strictly stronger than checking that any particular pooled-metric
  // name is absent: it forecloses every one of them, including names nobody has thought of yet. This
  // is the relocated no-pooled-rate assertion -- it belongs on the PRODUCER of the output, not in the
  // frozen gold module's co-test.
  const dirs = tempDirs();
  const gold = materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  const pairs = readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir });
  const read = sliceARead({ pairs, gold, drawSeed: DRAW.SEED });

  assert.deepEqual(Object.keys(read).sort(), ['drawSeed', 'n', 'provisionalLimits', 'refuted', 'unrefuted']);
  assert.deepEqual(Object.keys(read.unrefuted).sort(), ['fn', 'tp']);
  assert.deepEqual(Object.keys(read.refuted).sort(), ['fp', 'tn']);
  assert.equal(read.n, N_TOTAL);
  assert.equal(read.drawSeed, DRAW.SEED);
});

test('ENV-03: sliceARead reports the four cells PER DIRECTION for a mixed voter', () => {
  const dirs = tempDirs();
  // The voter is right except on drawIndex 0 of each direction: one over-refusal (fn) and one
  // false-upheld (fp).
  const gold = materializeRun({
    ...dirs,
    verdictFor: ({ direction, drawIndex }) => {
      if (drawIndex === 0) {
        return direction === 'unrefuted' ? 'refuted' : 'unrefuted';
      }

      return direction;
    },
  });
  const pairs = readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir });
  const read = sliceARead({ pairs, gold, drawSeed: DRAW.SEED });

  assert.equal(read.unrefuted.tp, DRAW.N_PER_DIRECTION - 1);
  assert.equal(read.unrefuted.fn, 1);
  assert.equal(read.refuted.tn, DRAW.N_PER_DIRECTION - 1);
  assert.equal(read.refuted.fp, 1);
});

test('ENV-03: sliceARead carries the three PROVISIONAL limits, as a defensive copy', () => {
  const dirs = tempDirs();
  const gold = materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  const pairs = readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir });
  const read = sliceARead({ pairs, gold, drawSeed: DRAW.SEED });

  assert.equal(read.provisionalLimits.length, 3, 'the uniform-2020 cutoff, the topical narrowness, and the evidence-set mismatch');
  const joined = read.provisionalLimits.join(' | ').toLowerCase();
  assert.ok(/2020/.test(joined), 'the uniform-2020 cutoff is named');
  assert.ok(/topical|narrow/.test(joined), 'the topical narrowness is named');
  assert.ok(/evidence set|evidence-set/.test(joined), 'the evidence-set mismatch is named');

  read.provisionalLimits.push('MUTATED');
  const again = sliceARead({ pairs, gold, drawSeed: DRAW.SEED });
  assert.equal(again.provisionalLimits.length, 3, 'a caller cannot mutate the frozen source array');
});

test('ENV-03 DISCRIMINATION: an INCOMPLETE pool (fewer than 40 definite verdicts) is a ContractError, not a partial read', () => {
  // DISCRIMINATION: a partial read would return a smaller-n tally that looks exactly like a complete
  // one, and nothing downstream would know. The plan's balance guarantee only means something if the
  // read refuses to proceed without it.
  const dirs = tempDirs();
  const gold = materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  const pairs = readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir });

  assert.throws(
    () => sliceARead({ pairs: pairs.slice(0, N_TOTAL - 1), gold, drawSeed: DRAW.SEED }),
    (err) => {
      assert.ok(err instanceof ContractError);
      assert.equal(err.file, 'sliceARead');
      assert.match(err.message, new RegExp(String(N_TOTAL)), 'the message names the required count');

      return true;
    },
  );
});

test('ENV-03: an indefinite verdict does not count toward the 40, so an abstain-padded pool still throws', () => {
  const dirs = tempDirs();
  const gold = materializeRun({
    ...dirs,
    verdictFor: ({ drawIndex, direction }) => (drawIndex === 0 ? null : direction),
  });
  const pairs = readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir });
  assert.throws(() => sliceARead({ pairs, gold, drawSeed: DRAW.SEED }), ContractError);
});

test('ENV-03: a pair with NO gold entry, and a gold label disagreeing with the pair direction, both throw', () => {
  const dirs = tempDirs();
  const gold = materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  const pairs = readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir });

  assert.throws(() => sliceARead({ pairs, gold: gold.slice(1), drawSeed: DRAW.SEED }), ContractError);

  const flipped = gold.map((g) => (g.direction === 'unrefuted' && g.drawIndex === 0 ? { ...g, label: 'refuted' } : g));
  assert.throws(() => sliceARead({ pairs, gold: flipped, drawSeed: DRAW.SEED }), ContractError);
});

test('ENV-03: sliceARead validates drawSeed as a non-negative integer (the read records the seed it was drawn under)', () => {
  const dirs = tempDirs();
  const gold = materializeRun({ ...dirs, verdictFor: ({ direction }) => direction });
  const pairs = readSliceAVerdicts({ dispatchDir: dirs.dispatchDir, verdictDir: dirs.verdictDir });
  assert.throws(() => sliceARead({ pairs, gold, drawSeed: 1.5 }), ContractError);
  assert.throws(() => sliceARead({ pairs, gold, drawSeed: -1 }), ContractError);
  assert.throws(() => sliceARead({ pairs, gold }), ContractError);
});

// ---------------------------------------------------------------------------
// The module adds no package and performs no network call (zero-spend contract).
// ---------------------------------------------------------------------------

test('ZERO SPEND: the module imports no package and performs no network call', () => {
  const source = fs.readFileSync(MODULE_SOURCE, 'utf8');
  const specifiers = [...source.matchAll(/^import[^']*'([^']+)'/gm)].map((m) => m[1]);
  assert.ok(specifiers.length > 0, 'the module has imports to check');

  for (const spec of specifiers) {
    assert.ok(
      spec.startsWith('node:') || spec.startsWith('./') || spec.startsWith('../'),
      'only node stdlib and relative in-repo imports are allowed, got: ' + spec,
    );
  }

  assert.ok(!/\bfetch\s*\(/.test(source), 'no fetch call');
  assert.ok(!/node:https?\b/.test(source), 'no http/https import');
});
