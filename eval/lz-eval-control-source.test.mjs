// lz-eval-control-source.test.mjs
//
// FILE-form deterministic coverage for the NET-NEW RE-PLAN-9 entailment-native control-source loader
// (eval/lz-eval-control-source.mjs). Dev-only eval-tree test: imports the SCRIPT under test (which imports
// the SHIPPED runtime aggregator's ContractError across trees, one-directional eval -> runtime) plus node
// stdlib only. NO network and NO model call -- every assertion is driven by deterministic STUB fetchers
// (NO SPEND).
//
// Asserts the RE-PLAN-9 control-source behaviors (each a DISTINCT named test that genuinely exercises the
// behavior, never a tautology):
//   - loadControlSource tries BOTH FEVER + VitaminC over stub fetchers; a SUPPORTS row is remapped to the
//     positive-control gold; a NEI/REFUTES row is NOT a control (DISCRIMINATING -- filtered out).
//   - verifyControlSourceLicense accepts CC-BY-SA-3.0 + RECORDS the license; an unrecognized license/source
//     throws ContractError (fail closed -- a silent default is forbidden, DISCRIMINATING).
//   - verifyControlSourceDate derives a pre-claim-date for a dated row + null for an undated row -> the
//     undated row/source is DROPPED (DISCRIMINATING -- the dropped source contributes zero controls).
//   - the strict-`<` date-filter drops a same-day / post-cutoff evidence row; a strictly-pre-cutoff row
//     survives.
//   - remapControlLabel maps SUPPORTS -> unrefuted/positive-control and rejects an unknown label (fail
//     closed).
//
// HOST QUIRK (load-bearing): on this host (Node v24.x / Windows arm64 / Git Bash) the phase gate MUST
// target the explicit FILE form: `node --test eval/lz-eval-control-source.test.mjs`. The directory form
// (`node --test <dir>`) spuriously exits 1 on this host even when every real test passes.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  loadControlSource,
  verifyControlSourceLicense,
  verifyControlSourceDate,
  remapControlLabel,
  CONTROL_SOURCES,
} from './lz-eval-control-source.mjs';

// ---------------------------------------------------------------------------
// Deterministic STUB fetchers (NO network, NO spend). Each returns a small fixture row set shaped like the
// source's real rows. A SUPPORTS row carries dated evidence; a NEI/REFUTES row is a non-control.
// ---------------------------------------------------------------------------

// FEVER stub: rows carry a Wikipedia dump-revision date (wiki_dump_date). The SUPPORTS row has two
// strictly-pre-cutoff evidence items + one same-day item (which the strict `<` filter must drop). The
// REFUTES row is a non-control (filtered out).
function feverFetchStub() {
  return async () => [
    {
      id: 'f1',
      claim: 'The treaty was signed in 1648.',
      label: 'SUPPORTS',
      claim_date: '2010-01-01',
      wiki_dump_date: '2009-06-01',
      evidence: [
        { text: 'The Peace of Westphalia was a series of peace treaties signed in 1648.', date: '2008-03-15' },
        { text: 'The treaties ended the Thirty Years War.', date: '2008-04-20' },
        // Same-day == claim_date: dropped by the strict `<` filter (leak-safe).
        { text: 'A same-day leak that must be dropped.', date: '2010-01-01' },
      ],
    },
    {
      id: 'f2',
      claim: 'A refuted claim that is not a positive control.',
      label: 'REFUTES',
      claim_date: '2010-01-01',
      wiki_dump_date: '2009-06-01',
      evidence: [{ text: 'irrelevant', date: '2008-01-01' }],
    },
    {
      id: 'f3',
      claim: 'A not-enough-info claim.',
      label: 'NOT ENOUGH INFO',
      claim_date: '2010-01-01',
      wiki_dump_date: '2009-06-01',
      evidence: [{ text: 'irrelevant', date: '2008-01-01' }],
    },
  ];
}

// VitaminC stub: rows carry a per-example wiki_revision_id timestamp. The SUPPORTS row has a
// strictly-pre-cutoff evidence item.
function vitamincFetchStub() {
  return async () => [
    {
      id: 'v1',
      claim: 'The population exceeded one million.',
      label: 'SUPPORTS',
      claim_date: '2015-05-01',
      wiki_revision_id: { id: 778899, timestamp: '2014-02-01' },
      evidence: [
        { text: 'The city had a population of 1,200,000 according to the 2013 census.', date: '2013-12-01' },
      ],
    },
    {
      id: 'v2',
      claim: 'A refuted VitaminC claim.',
      label: 'REFUTES',
      claim_date: '2015-05-01',
      wiki_revision_id: { id: 778900, timestamp: '2014-02-01' },
      evidence: [{ text: 'irrelevant', date: '2013-01-01' }],
    },
  ];
}

// A VitaminC-shaped stub where the SUPPORTS row carries ONLY a bare numeric revision id (no timestamp) --
// verifyControlSourceDate must return null and loadControlSource must DROP it (drop-on-no-date).
function vitamincUndatedFetchStub() {
  return async () => [
    {
      id: 'v-undated',
      claim: 'A SUPPORTS claim with no defensible date.',
      label: 'SUPPORTS',
      claim_date: '2015-05-01',
      wiki_revision_id: 778899, // a bare numeric id -- NO embedded date.
      evidence: [{ text: 'pre-cutoff evidence', date: '2013-01-01' }],
    },
  ];
}

// ---------------------------------------------------------------------------
// loadControlSource tries BOTH sources + remaps SUPPORTS -> control gold; NEI/REFUTES filtered out.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 loadControlSource(fever): a SUPPORTS row is remapped to the positive-control gold; NEI/REFUTES are NOT controls (DISCRIMINATING)', async () => {
  const controls = await loadControlSource({ source: 'fever', fetch: feverFetchStub() });

  // Exactly ONE control survives (f1=SUPPORTS); f2=REFUTES + f3=NEI are filtered out (NOT controls).
  assert.equal(controls.length, 1, 'exactly one SUPPORTS row becomes a control; REFUTES + NEI are filtered out');

  const c = controls[0];
  assert.equal(c.expected_verdict, 'unrefuted', 'a control is gold=unrefuted (the positive-control gold)');
  assert.equal(c.stratum, 'positive-control', 'a control is in the positive-control stratum');
  assert.equal(c.source, 'fever', 'the control records its source');
  assert.equal(c.uid, 'fever-f1', 'the control uid is namespaced by source');

  // DISCRIMINATING: a REFUTES/NEI row never appears in the controls (the filter is real, not a tautology).
  assert.ok(!controls.some((x) => /f2|f3/.test(x.uid)), 'no REFUTES/NEI row is returned as a control');
});

test('RE-PLAN-9 loadControlSource(vitaminc): the same SUPPORTS -> control remap over the VitaminC claim/evidence/label/wiki_revision_id shape', async () => {
  const controls = await loadControlSource({ source: 'vitaminc', fetch: vitamincFetchStub() });

  assert.equal(controls.length, 1, 'exactly one SUPPORTS VitaminC row becomes a control (the REFUTES row is filtered out)');
  assert.equal(controls[0].uid, 'vitaminc-v1', 'the VitaminC control uid is namespaced by source');
  assert.equal(controls[0].expected_verdict, 'unrefuted', 'a VitaminC control is gold=unrefuted');
  assert.equal(controls[0].stratum, 'positive-control', 'a VitaminC control is in the positive-control stratum');
});

test('RE-PLAN-9 BOTH sources are tried (the registry exposes fever/fever + tals/vitaminc, both CC-BY-SA-3.0)', () => {
  // The board: the probe tries BOTH entailment-native sources; the pre-registered criteria decide which
  // (or the pooled set) is used. The registry pins both repos + the redistributable license.
  assert.equal(CONTROL_SOURCES.fever.repo, 'fever/fever', 'FEVER repo is fever/fever');
  assert.equal(CONTROL_SOURCES.vitaminc.repo, 'tals/vitaminc', 'VitaminC repo is tals/vitaminc');
  assert.equal(CONTROL_SOURCES.fever.license, 'CC-BY-SA-3.0', 'FEVER license is CC-BY-SA-3.0');
  assert.equal(CONTROL_SOURCES.vitaminc.license, 'CC-BY-SA-3.0', 'VitaminC license is CC-BY-SA-3.0');
});

// ---------------------------------------------------------------------------
// verifyControlSourceLicense fails closed (CC-BY-SA passes; an unrecognized license/source throws).
// ---------------------------------------------------------------------------

test('RE-PLAN-9 verifyControlSourceLicense accepts + RECORDS CC-BY-SA-3.0; an unrecognized source fails closed (DISCRIMINATING)', () => {
  assert.equal(verifyControlSourceLicense('fever'), 'CC-BY-SA-3.0', 'FEVER license is recorded CC-BY-SA-3.0 (redistributable)');
  assert.equal(verifyControlSourceLicense('vitaminc'), 'CC-BY-SA-3.0', 'VitaminC license is recorded CC-BY-SA-3.0');

  // DISCRIMINATING: an unrecognized source is a fail-closed ContractError, never a silent default.
  assert.throws(
    () => verifyControlSourceLicense('some-other-corpus'),
    (e) => e.name === 'ContractError',
    'an unrecognized control source fails closed (no silent default)',
  );
});

// ---------------------------------------------------------------------------
// verifyControlSourceDate -> a defensible pre-claim-date or null-drop.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 verifyControlSourceDate derives the FEVER dump-revision date + the VitaminC wiki_revision_id timestamp', () => {
  const fever = verifyControlSourceDate({ source: 'fever', row: { wiki_dump_date: '2009-06-01' } });
  assert.ok(fever instanceof Date, 'FEVER derives a Date cutoff from the dump revision date');
  assert.equal(fever.getUTCFullYear(), 2009, 'the FEVER cutoff year matches the dump revision');

  const vc = verifyControlSourceDate({ source: 'vitaminc', row: { wiki_revision_id: { id: 1, timestamp: '2014-02-01' } } });
  assert.ok(vc instanceof Date, 'VitaminC derives a Date cutoff from the wiki_revision_id timestamp');
  assert.equal(vc.getUTCFullYear(), 2014, 'the VitaminC cutoff year matches the revision timestamp');
});

test('RE-PLAN-9 verifyControlSourceDate returns null for an undated row -> the undated source contributes ZERO controls (DISCRIMINATING)', async () => {
  // A bare numeric wiki_revision_id (no embedded timestamp) has NO defensible cutoff -> null.
  const undated = verifyControlSourceDate({ source: 'vitaminc', row: { wiki_revision_id: 778899 } });
  assert.equal(undated, null, 'a bare numeric revision id (no timestamp) yields NO defensible cutoff -> null');

  // DISCRIMINATING: loadControlSource over an all-undated source drops every row (zero controls -- the
  // build does NOT silently proceed on an undated source).
  const controls = await loadControlSource({ source: 'vitaminc', fetch: vitamincUndatedFetchStub() });
  assert.equal(controls.length, 0, 'an undated SUPPORTS row is DROPPED (drop-the-source-on-no-date)');
});

// ---------------------------------------------------------------------------
// The strict-`<` date-filter drops same-day / post-cutoff evidence; a strictly-pre-cutoff row survives.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 the strict-`<` date-filter drops same-day/post-cutoff evidence; strictly-pre-cutoff evidence survives (DISCRIMINATING)', async () => {
  // The FEVER stub's f1 SUPPORTS row carries two pre-cutoff evidence items + one SAME-DAY (== claim_date)
  // item. The strict `<` must keep exactly the two pre-cutoff items and drop the same-day item.
  const controls = await loadControlSource({ source: 'fever', fetch: feverFetchStub() });
  assert.equal(controls.length, 1, 'the SUPPORTS row survives (it has strictly-pre-cutoff evidence)');

  const c = controls[0];
  assert.equal(c.evidence.length, 2, 'exactly the two strictly-pre-cutoff evidence items survive; the same-day item is DROPPED');
  assert.ok(
    !c.evidence.some((ev) => ev.date === '2010-01-01'),
    'the same-day (== claim_date) evidence item is dropped by the strict `<` cutoff (leak-safe)',
  );
});

test('RE-PLAN-9 a SUPPORTS row whose evidence is ALL same-day/post-cutoff is DROPPED (no strictly-pre-cutoff survivor -> not a usable control)', async () => {
  const allSameDayFetch = async () => [
    {
      id: 'edge',
      claim: 'A claim whose only evidence is same-day.',
      label: 'SUPPORTS',
      claim_date: '2010-01-01',
      wiki_dump_date: '2009-06-01',
      evidence: [{ text: 'same-day only', date: '2010-01-01' }],
    },
  ];

  const controls = await loadControlSource({ source: 'fever', fetch: allSameDayFetch });
  assert.equal(controls.length, 0, 'a control with no strictly-pre-cutoff surviving evidence is dropped');
});

// ---------------------------------------------------------------------------
// remapControlLabel: SUPPORTS -> unrefuted/positive-control; an unknown label throws (fail closed).
// ---------------------------------------------------------------------------

test('RE-PLAN-9 remapControlLabel maps SUPPORTS -> unrefuted/positive-control and fails closed on an unknown label', () => {
  const mapped = remapControlLabel('SUPPORTS');
  assert.equal(mapped.expected_verdict, 'unrefuted', 'SUPPORTS -> unrefuted (the positive-control gold)');
  assert.equal(mapped.stratum, 'positive-control', 'SUPPORTS -> positive-control stratum');

  // DISCRIMINATING: REFUTES / NEI / an unknown label is NOT a control -> fail closed (no silent default).
  for (const bad of ['REFUTES', 'NOT ENOUGH INFO', 'mostly_true']) {
    assert.throws(
      () => remapControlLabel(bad),
      (e) => e.name === 'ContractError',
      'a non-SUPPORTS label (' + bad + ') is not a control -> remapControlLabel fails closed',
    );
  }
});
