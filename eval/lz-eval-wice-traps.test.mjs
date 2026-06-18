// lz-eval-wice-traps.test.mjs
//
// FILE-form deterministic validation for the NET-NEW WiCE CLOSED-BOOK trap+control arm (Plan 19-04,
// Task 3b; RE-PLAN-7, W1/F7). Dev-only eval-tree test: imports the module under test (which REUSES the
// committed Phase-18 WiCE loader remapLabel/stratify over the vendored records) plus node stdlib only.
// NO network / NO real model calls -- the probes + subjectDifficultyProbe hooks are injected as
// deterministic stubs, and the vendored WiCE records under eval/__fixtures__/wice-vendored/records are
// the committed corpus.
//
// The WiCE arm is closed-book-NATIVE: it does NOT call the AVeriTeC dateFilter / >=5-survivor /
// staticKsAdapter / enrichKsForClaim machinery (WiCE has no dated-URL KS -- the evidence is GIVEN
// closed-book). It carries the trap BULK (the F7 WiCE-heavy de-risk of the AVeriTeC median-5 collapse).
//
// Every behavior assertion is DISCRIMINATING (proves the function actually flips/decides, never a
// tautology). Coverage:
//   - a partially_supported|not_supported WiCE seed -> a gold=refuted TRAP (via remapLabel);
//   - a supported WiCE seed -> a gold=unrefuted CONTROL (via remapLabel) -- DISCRIMINATING vs the trap;
//   - the WiCE arm does NOT touch the AVeriTeC dateFilter/survivor pipeline (a WiCE seed with no
//     dated-URL KS still yields a trap because the evidence is GIVEN closed-book);
//   - the OUT-OF-FAMILY all-agree consensus + the F5 subjectDifficultyProbe + the F6 cluster
//     independence apply identically to the AVeriTeC arm;
//   - the rows carry NO recipe + NO text field (recipe-not-text); the build-floor is pinned 3 (W2).
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) gate ONLY on the
// explicit FILE form: node --test eval/lz-eval-wice-traps.test.mjs (the directory form spuriously exits
// 1 even when every real test passes). The eval tree requires eval/node_modules/ restored first.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { assembleWiceTraps } from './lz-eval-wice-traps.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WICE_RECORDS = path.join(HERE, '__fixtures__', 'wice-vendored', 'records');

// Load the committed vendored WiCE records (the closed-book corpus). Each record carries the human label
// at TOP LEVEL as `label` and the id under `meta.id` (the plan-checker-confirmed shape), the claim text,
// and the given closed-book evidence array.
function loadVendoredRecords() {
  const files = fs.readdirSync(WICE_RECORDS).filter((f) => f.endsWith('.json')).sort();

  return files.map((f) => JSON.parse(fs.readFileSync(path.join(WICE_RECORDS, f), 'utf8')));
}

// An all-agree OUT-OF-FAMILY consensus probe: it returns the entails read that MATCHES the expectation
// ('false' for a refuted-gold trap, 'true' for an unrefuted-gold control), so an all-agree set retains.
const agreeProbe = async ({ expectedEntailment }) => ({
  accepted: true,
  reason: 'agree',
  entails: expectedEntailment,
});

// A held-out Claude subjectDifficultyProbe that does NOT ace the set (it upholds every trap, i.e. it is
// FOOLED by the closed-book evidence -- catch-rate 0). This keeps the F5 difficulty floor MET.
const weakSubjectProbe = async () => 'unrefuted';

test('assembleWiceTraps: a partially_supported|not_supported WiCE seed -> a gold=refuted TRAP; a supported seed -> a gold=unrefuted CONTROL (DISCRIMINATING via remapLabel)', async () => {
  const records = loadVendoredRecords();
  const res = await assembleWiceTraps({
    records,
    probes: [agreeProbe],
    subjectDifficultyProbe: weakSubjectProbe,
  });

  const trapRows = res.strata['evidence-absent'];
  const controlRows = res.strata['positive-control'];

  assert.ok(trapRows.length >= 3, 'the WiCE trap arm reached the build-floor (>= 3 refuted traps)');
  assert.ok(controlRows.length >= 3, 'the WiCE control arm reached the build-floor (>= 3 controls)');

  // DISCRIMINATING: every trap is refuted-gold; every control is unrefuted-gold (the inverse).
  for (const row of trapRows) {
    assert.equal(row.expected_verdict, 'refuted', 'a WiCE trap is refuted-gold (partially/not_supported)');
    assert.equal(res.goldLabels[row.uid], 'refuted', 'goldLabels marks the trap uid refuted');
  }

  for (const row of controlRows) {
    assert.equal(row.expected_verdict, 'unrefuted', 'a WiCE control is unrefuted-gold (supported)');
    assert.equal(res.goldLabels[row.uid], 'unrefuted', 'goldLabels marks the control uid unrefuted');
  }

  // The two gold classes are distinct (remapLabel genuinely flips supported vs partially/not_supported).
  assert.notEqual(trapRows[0].expected_verdict, controlRows[0].expected_verdict, 'trap and control gold differ (remapLabel flips)');
});

test('assembleWiceTraps: the WiCE arm is CLOSED-BOOK NATIVE -- a seed with NO dated-URL KS still yields a trap (the evidence is GIVEN closed-book; no AVeriTeC dateFilter/survivor pipeline)', async () => {
  // The vendored WiCE records have NO dated-URL knowledge store -- their evidence is the GIVEN closed-book
  // evidence array. DISCRIMINATING: assembleWiceTraps still produces traps + controls from them. A
  // regression that routed WiCE through the AVeriTeC >=5-dated-survivor floor would drop every WiCE seed
  // (none has a dated URL) and the strata would be empty (below floor -> throw).
  const records = loadVendoredRecords();

  // Confirm the corpus genuinely has no dated-URL KS (the closed-book-native premise).
  const hasDatedUrlKs = records.some((r) => Array.isArray(r.knowledge_store) || (r.evidence && r.evidence.some && r.evidence.some((e) => typeof e === 'object' && e.url)));
  assert.equal(hasDatedUrlKs, false, 'the vendored WiCE records carry NO dated-URL KS (closed-book-native)');

  const res = await assembleWiceTraps({
    records,
    probes: [agreeProbe],
    subjectDifficultyProbe: weakSubjectProbe,
  });

  assert.ok(res.strata['evidence-absent'].length >= 3, 'the WiCE trap arm builds from closed-book seeds (no dated-URL KS needed)');
});

test('assembleWiceTraps: the OUT-OF-FAMILY all-agree consensus gates the trap arm -- a packet ANY probe splits on is DROPPED + counted in probeDropped (F2/F3, mirroring the AVeriTeC arm)', async () => {
  const records = loadVendoredRecords();

  // Two probes; the second SPLITS on every other trap (reads the evidence as ENTAILING the claim's
  // overreach -- entails:true when the expected was 'false'). ALL-AGREE-RETAIN: those packets drop.
  let trapSeen = 0;
  const splitOnEvenTraps = async ({ expectedEntailment }) => {
    if (expectedEntailment === 'false') {
      trapSeen += 1;

      if (trapSeen % 2 === 0) {
        return { accepted: true, reason: 'OOF reads evidence as entailing the overreach -> split', entails: 'true' };
      }
    }

    return { accepted: true, reason: 'agree', entails: expectedEntailment };
  };

  const allAgree = await assembleWiceTraps({ records, probes: [agreeProbe], subjectDifficultyProbe: weakSubjectProbe });
  const withSplit = await assembleWiceTraps({ records, probes: [agreeProbe, splitOnEvenTraps], subjectDifficultyProbe: weakSubjectProbe });

  // DISCRIMINATING: the split probe drops strictly more traps than the all-agree run.
  assert.ok(withSplit.attrition.probeDropped >= 1, 'the OOF split drops >= 1 trap (the consensus gates)');
  assert.ok(
    withSplit.strata['evidence-absent'].length < allAgree.strata['evidence-absent'].length,
    'the all-agree consensus retains strictly more traps than the split run (the OOF probe is load-bearing)',
  );
  assert.ok(withSplit.attrition.probeSplitDropped >= 1, 'an inter-judge split is counted in probeSplitDropped');
});

test('assembleWiceTraps: the F5 subjectDifficultyProbe gates the WORKS-relevant difficulty -- a Claude reference that ACES the retained traps surfaces VOID-difficulty (DISCRIMINATING vs a fooled reference)', async () => {
  const records = loadVendoredRecords();

  // A subjectDifficultyProbe that CORRECTLY refutes (catches) every trap -> catch-rate 1.0 -> the set is
  // too easy for the subject family to certify capability -> VOID-difficulty.
  const acingSubjectProbe = async () => 'refuted';

  await assert.rejects(
    () => assembleWiceTraps({ records, probes: [agreeProbe], subjectDifficultyProbe: acingSubjectProbe, subjectDifficultyMaxCatchRate: 0.5 }),
    (e) => e.name === 'ContractError' && /difficulty/i.test(e.message) && e.attrition && e.attrition.difficultyFloorMet === false,
    'a Claude reference that aces the retained traps -> VOID-difficulty (the F5 subject-specific floor)',
  );

  // DISCRIMINATING: the SAME corpus with a FOOLED reference (catch-rate 0) keeps the floor MET (no throw).
  const ok = await assembleWiceTraps({ records, probes: [agreeProbe], subjectDifficultyProbe: weakSubjectProbe, subjectDifficultyMaxCatchRate: 0.5 });
  assert.equal(ok.attrition.difficultyFloorMet, true, 'a fooled reference (below the cap) -> the difficulty floor is MET');
});

test('assembleWiceTraps: F6 cluster independence -- WiCE sub-claims sharing a source/seed cluster collapse to ONE retained primary claim per cluster (DISCRIMINATING vs naive per-claim retention)', async () => {
  // The vendored WiCE ids are dev<NNNNN>-<k> (e.g. dev00003-0, dev00003-1, dev00003-2): the dev<NNNNN>
  // prefix is the source/seed cluster (one Wikipedia claim, several sub-claims). F6 keeps ONE per cluster
  // so the per-claim CP denominator is not anti-conservative (the sub-claims are positively correlated).
  const records = loadVendoredRecords();
  const res = await assembleWiceTraps({
    records,
    probes: [agreeProbe],
    subjectDifficultyProbe: weakSubjectProbe,
    clusterIndependence: true,
  });

  // Group the retained rows by cluster (the dev<NNNNN> prefix of the source id) -- at most ONE per cluster.
  const allRows = [...res.strata['evidence-absent'], ...res.strata['positive-control']];
  const clusterOf = (uid) => String(uid).replace(/^wice-/, '').replace(/-\d+$/, '');
  const byCluster = new Map();

  for (const row of allRows) {
    const c = clusterOf(row.uid);
    byCluster.set(c, (byCluster.get(c) || 0) + 1);
  }

  for (const [cluster, count] of byCluster) {
    assert.equal(count, 1, 'at most ONE retained primary claim per source/seed cluster (' + cluster + ' has ' + count + ')');
  }

  // DISCRIMINATING: without cluster independence the SAME corpus retains MORE rows (multiple sub-claims
  // per cluster), proving the collapse is real, not a constant.
  const naive = await assembleWiceTraps({ records, probes: [agreeProbe], subjectDifficultyProbe: weakSubjectProbe, clusterIndependence: false });
  const naiveTotal = naive.strata['evidence-absent'].length + naive.strata['positive-control'].length;
  assert.ok(naiveTotal > allRows.length, 'naive per-claim retention keeps MORE rows than one-per-cluster (F6 collapse is real)');
});

test('assembleWiceTraps: the rows carry NO recipe + NO text field (recipe-not-text); the build-floor default is pinned 3 (W2)', async () => {
  const records = loadVendoredRecords();
  const res = await assembleWiceTraps({
    records,
    probes: [agreeProbe],
    subjectDifficultyProbe: weakSubjectProbe,
  });

  const allRows = [...res.strata['evidence-absent'], ...res.strata['positive-control']];
  assert.ok(allRows.length >= 1, 'non-vacuous (>= 1 assembled WiCE row)');

  for (const row of allRows) {
    assert.equal('text' in row, false, 'a WiCE row carries NO text field (recipe-not-text -- the closed-book evidence stays out of the committed manifest)');
    assert.equal('recipe' in row, false, 'a WiCE row carries NO overreach recipe (the trap is the native partially/not_supported claim, not a mutation)');
  }

  // The build-floor default is 3 (W2 -- the 36/24 adequacy power-floor lives at certifyModel, NOT here).
  assert.equal(res.runConfig.perStratumFloor, 3, 'the WiCE build-floor default is 3 (W2)');
  assert.equal(res.runConfig.positiveControlFloor, 3, 'the WiCE control build-floor default is 3 (W2)');
});

test('assembleWiceTraps: the build-floor FAILS CLOSED -- too few retained traps throws /perStratumFloor/ (the floor is load-bearing, never relaxed)', async () => {
  // A probe that rejects every trap candidate -> the trap arm falls below the build-floor of 3 -> throw.
  const records = loadVendoredRecords();
  const rejectAllTraps = async ({ expectedEntailment }) => {
    if (expectedEntailment === 'false') {
      return { accepted: false, reason: 'evidence entails the claim -> disqualify the trap' };
    }

    return { accepted: true, reason: 'agree', entails: expectedEntailment };
  };

  await assert.rejects(
    () => assembleWiceTraps({ records, probes: [rejectAllTraps], subjectDifficultyProbe: weakSubjectProbe }),
    (e) => e.name === 'ContractError' && /perStratumFloor/.test(e.message),
    'a WiCE trap arm below the build-floor fails closed (load-bearing, never relaxed)',
  );
});

test('assembleWiceTraps source is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(new URL('./lz-eval-wice-traps.mjs', import.meta.url));

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'non-ASCII byte 0x' + buf[i].toString(16) + ' at offset ' + i);
  }
});
