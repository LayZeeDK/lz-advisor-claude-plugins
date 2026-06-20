// lz-eval-armA-native.test.mjs
//
// Validation fixture for the AMENDED ARM-A assembly path (Phase 20, Plan 20-05 ARM-A amendment; the
// certified-WORKS RATIFICATION, original cross-family board, UNANIMOUS 4/4 -- see
// CERTIFY-WORKS-RATIFICATION.md / 20-CONTEXT.md D-22). The amended ARM A is NO LONGER authored
// minimal-edit contrastive pairs. It is the skill's OWN naturally-occurring refuted-gold
// (Contested/Unsupported/Low) claims, harvested from real run dirs, RETAINED as refuted-gold ONLY by the
// FROZEN out-of-family all-agree gold-blind pair ("evidence does NOT entail the claim"; gold = the OOF
// read, NEVER the skill self-tag), difficulty-matched STATISTICALLY to the ARM-B SUPPORTED controls, with
// construct-validity gates (a) lexical-AUC + (b) one-sided not-easier RE-RUN on the retained set (gate (d)
// minimal-edit is DROPPED under option C).
//
// THIS IS A NO-SPEND TEST. It sets NO LZ_SPEND, dispatches NO real OOF/Copilot call, and spawns NO
// verify-voter Agent. Every OOF judge is a deterministic in-process STUB. The real harvest + OOF
// adjudication + voting happen later under a separate human-authorized spend gate.
//
// Every behavior assertion is DISCRIMINATING (proves the function actually selects / retains / matches /
// gates), never a tautology that would pass if the function returned a constant. Coverage (each a DISTINCT
// named test):
//   (1) harvestRefutedGoldCandidates pulls Contested/Unsupported/Low (NOT SUPPORTED) claims, cluster-keyed
//       by source-doc-within-run, uids ':'-free;
//   (2) adjudicateNativeRefutedGold RETAINs only all-agree "does-not-entail" over a STUB callModel, routes
//       a split candidate to residue/excludedIndeterminate, runs ZERO spend, and the gold direction is the
//       OOF read NOT the skill self-tag;
//   (3) assembleArmA computes the matching guards + gates (a)/(b) on the retained set, constructValid folds
//       covariate+difficulty+cluster+lexical+notEasier (NO minimalEdit term), and reports smd;
//   (4) requireSpend throws on a real-dispatch path with LZ_SPEND unset;
//   (5) the two arms are NEVER pooled (the module never concatenates arm A + arm B into one N).
//
// HOST QUIRK (load-bearing): on this host (Node v24.x / Windows arm64 / Git Bash) the phase gate MUST
// target the explicit FILE form:
//   node --test eval/lz-eval-armA-native.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes. The suite is one file, so the file form is the equivalent reliable gate.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  harvestRefutedGoldCandidates,
  adjudicateNativeRefutedGold,
  assembleArmA,
  ARM_A_EXPECTED_ENTAILMENT,
} from './lz-eval-armA-native.mjs';

import { FROZEN_OOF_PAIR } from './lz-eval-live-cert.mjs';
import { LEXICAL_AUC_CEILING } from './lz-eval-baseline-guard.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
void HERE;

// ---------------------------------------------------------------------------
// Helper: write a stub run-dir corpus. `dirs` maps a run-dir basename -> an array of survivor records.
// Each run dir gets a survivors.json. Returns the corpus dir path. The records use the FROZEN survivor
// shape ({ id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence, escalate }) PLUS the
// optional source_doc/cluster field the source-doc-within-run cluster key reads.
// ---------------------------------------------------------------------------
function writeCorpus(dirs) {
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-armA-corpus-'));

  for (const [name, survivors] of Object.entries(dirs)) {
    const runDir = path.join(corpus, name);
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify(survivors, null, 2) + '\n', 'utf8');
  }

  return corpus;
}

// Build a survivor record with the frozen shape. `source_doc` is the source-doc/seed WITHIN a run (the
// lock-(a) cluster key); claim text + sources are carried so the OOF stub + the guards have real content.
function survivor({ id, confidence = 'High', corroboration = 1, claim, sources, source_doc }) {
  const rec = {
    id,
    claim: claim || ('claim ' + id),
    sources: sources || Array.from({ length: corroboration }, (_v, i) => 's' + i),
    corroboration_lower_bound: corroboration,
    quote_fidelity: 'verified',
    confidence,
    escalate: false,
  };

  if (source_doc !== undefined) {
    rec.source_doc = source_doc;
  }

  return rec;
}

// ---------------------------------------------------------------------------
// A gold-blind SEMANTIC OOF judge stub matching the makeBatchedOofProbe callModel(promptText) contract
// (SINGLE arg -- the rendered batched prompt). It reads ONLY the rendered prompt's EVIDENCE + CLAIM blocks
// (gold-blind: it never sees the skill self-tag or the expectedEntailment). The semantic rule: the
// EVIDENCE entails the CLAIM iff the CLAIM leads with the SAME entity the EVIDENCE leads with (the entity
// ORDER is the semantic signal). For a refuted-gold candidate we want entails=false (does NOT entail), so
// the stub corpus is built with claims that lead with a DIFFERENT entity than the evidence.
// `disagreeOn` (a Set of opaque-id-free claim substrings) lets ONE model flip its read to force a SPLIT.
// ---------------------------------------------------------------------------
function makeOofJudgeStub({ flipFor = null, modelTag = null } = {}) {
  const leadEntity = (text) => {
    const m = String(text).toLowerCase().match(/\b(alpha|beta|gamma)\b/);

    return m ? m[1] : '';
  };

  return async function callModel(promptText) {
    const afterItems = String(promptText).split('\nITEMS:\n')[1] || '';
    const blocks = afterItems.split('\n\n').filter((b) => b.trim().length > 0);
    const objs = [];

    for (const b of blocks) {
      const lines = b.split('\n');
      const idLine = lines.find((l) => /^(p[0-9a-f]+)\)$/.test(l.trim()));
      const idMatch = idLine ? idLine.trim().match(/^(p[0-9a-f]+)\)$/) : null;

      if (!idMatch) {
        continue;
      }

      const claimLine = lines.find((l) => l.startsWith('CLAIM: '));
      const claim = claimLine ? claimLine.slice('CLAIM: '.length) : '';
      const evidenceLines = lines.filter((l) => l.startsWith('- '));
      const evidence = evidenceLines.join(' ');

      let entails = leadEntity(claim) === leadEntity(evidence);

      // Force a SPLIT: this model flips its entailment read on a targeted claim substring.
      if (flipFor != null && claim.includes(flipFor)) {
        entails = !entails;
      }

      void modelTag;
      objs.push({ id: idMatch[1], entails, reason: 'semantic-oof-stub' });
    }

    return JSON.stringify(objs);
  };
}

// A factory: ONE stub callModel per FROZEN OOF model. By default both agree (no split). With `splitFlipFor`
// the SECOND model flips on the targeted claim, producing an inter-judge SPLIT for that candidate.
function makeOofPairStubs({ splitFlipFor = null } = {}) {
  return FROZEN_OOF_PAIR.map((model, i) =>
    makeOofJudgeStub({ flipFor: i === 1 ? splitFlipFor : null, modelTag: model }),
  );
}

// ===========================================================================
// (1) harvestRefutedGoldCandidates: pulls Contested/Unsupported/Low (the INVERSE of isSupportedClaim),
// cluster-keyed by source-doc-within-run, uids ':'-free.
// ===========================================================================

test('harvestRefutedGoldCandidates pulls Contested/Unsupported/Low (NOT SUPPORTED High/Medium) refuted-gold candidates', () => {
  const survivors = [
    survivor({ id: 'c0', confidence: 'High', corroboration: 3 }), // SUPPORTED -> EXCLUDED
    survivor({ id: 'c1', confidence: 'Medium', corroboration: 2 }), // SUPPORTED -> EXCLUDED
    survivor({ id: 'c2', confidence: 'Contested', corroboration: 3 }), // refuted-gold candidate
    survivor({ id: 'c3', confidence: 'Unsupported', corroboration: 1 }), // refuted-gold candidate
    survivor({ id: 'c4', confidence: 'Low', corroboration: 2 }), // refuted-gold candidate
  ];
  const corpus = writeCorpus({ run0: survivors });

  try {
    const res = harvestRefutedGoldCandidates({ corpusDir: corpus });
    const ids = res.candidates.map((r) => r.claim_id || r.source_id);

    assert.equal(res.candidates.length, 3, 'exactly the 3 NON-SUPPORTED claims (Contested/Unsupported/Low) are candidates');
    assert.ok(!ids.includes('c0') && !ids.includes('c1'), 'the SUPPORTED High/Medium claims are EXCLUDED (the inverse of isSupportedClaim)');

    const confidences = res.candidates.map((r) => r.confidence).sort();
    assert.deepEqual(confidences, ['Contested', 'Low', 'Unsupported'], 'the candidate confidences are the refuted-gold source buckets');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('harvestRefutedGoldCandidates uids are run-dir-qualified, ":"-free (the "::" separator), and the cluster key is source-doc WITHIN a run (lock a)', () => {
  // TWO runs, each with two candidates sharing a source_doc. The cluster key must be source-doc WITHIN a
  // run -- so the SAME source_doc in two DIFFERENT runs is TWO distinct clusters (4 runs -> many clusters,
  // never collapsing to ~4). And a candidate carrying NO source_doc falls back to a per-claim cluster.
  const corpus = writeCorpus({
    runA: [
      survivor({ id: 'a0', confidence: 'Contested', corroboration: 2, source_doc: 'docX' }),
      survivor({ id: 'a1', confidence: 'Unsupported', corroboration: 1, source_doc: 'docX' }),
    ],
    runB: [
      survivor({ id: 'b0', confidence: 'Low', corroboration: 2, source_doc: 'docX' }),
    ],
  });

  try {
    const res = harvestRefutedGoldCandidates({ corpusDir: corpus });
    const byId = new Map(res.candidates.map((r) => [r.uid, r]));

    // uids ':'-free, run-dir-qualified with the '::' separator.
    for (const uid of byId.keys()) {
      assert.ok(!uid.includes(':') || uid.includes('::'), 'the uid uses the "::" separator');
      assert.ok(!/:(?!:)|(?<!:):/.test(uid.replace(/::/g, '')), 'no bare single ":" remains after removing the "::" separators');
      assert.ok(uid.startsWith('runA::') || uid.startsWith('runB::'), 'the uid is run-dir-qualified: ' + uid);
    }

    // The cluster key is source-doc WITHIN a run: runA's two docX candidates share a cluster; runB's docX
    // candidate is a SEPARATE cluster (same source_doc, different run -> distinct cluster).
    const clusters = new Set(res.candidates.map((r) => r.source_cluster));
    assert.equal(clusters.size, 2, 'runA::docX and runB::docX are TWO distinct clusters (cluster key = source-doc WITHIN a run, NOT the run-question)');

    const aCluster = res.candidates.filter((r) => r.source_run_dir === 'runA').map((r) => r.source_cluster);
    assert.equal(new Set(aCluster).size, 1, 'runA two docX candidates share ONE cluster');

    const aClusterVal = aCluster[0];
    const bClusterVal = res.candidates.find((r) => r.source_run_dir === 'runB').source_cluster;
    assert.notEqual(aClusterVal, bClusterVal, 'the SAME source_doc in different runs is a DIFFERENT cluster (4 runs do NOT collapse to ~4)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('harvestRefutedGoldCandidates carries evidence/sources + corroboration_lower_bound + source_run_dir per candidate', () => {
  const corpus = writeCorpus({
    run0: [survivor({ id: 'c0', confidence: 'Contested', corroboration: 3, claim: 'alpha overtook gamma', sources: ['gamma led the field', 'beta trailed'] })],
  });

  try {
    const res = harvestRefutedGoldCandidates({ corpusDir: corpus });
    const cand = res.candidates[0];

    assert.equal(cand.claim, 'alpha overtook gamma', 'the candidate carries the claim text');
    assert.ok(Array.isArray(cand.evidence) || typeof cand.evidence === 'string', 'the candidate carries evidence/sources');
    assert.equal(cand.corroboration_lower_bound, 3, 'the candidate carries corroboration_lower_bound');
    assert.equal(cand.source_run_dir, 'run0', 'the candidate carries the source_run_dir');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// (2) adjudicateNativeRefutedGold: RETAIN only all-agree "does-not-entail" over a STUB callModel; route a
// split to residue/excludedIndeterminate; ZERO spend; gold = the OOF read NOT the skill self-tag.
// ===========================================================================

// Build refuted-gold candidates whose claim leads with a DIFFERENT entity than the evidence (so the
// semantic OOF stub reads entails=false = "does not entail" = RETAIN as refuted-gold). One candidate
// (the `splitClaim`) is targeted to force a model SPLIT.
function refutedCandidates() {
  return [
    { uid: 'runA::r0', claim_id: 'r0', confidence: 'Contested', source_run_dir: 'runA', source_cluster: 'runA::docX', corroboration_lower_bound: 3, claim: 'beta surpassed everyone', evidence: ['alpha led the race', 'gamma followed'] },
    { uid: 'runA::r1', claim_id: 'r1', confidence: 'Unsupported', source_run_dir: 'runA', source_cluster: 'runA::docY', corroboration_lower_bound: 2, claim: 'gamma doubled output', evidence: ['alpha grew steadily', 'beta held flat'] },
    { uid: 'runB::r2', claim_id: 'r2', confidence: 'Low', source_run_dir: 'runB', source_cluster: 'runB::docZ', corroboration_lower_bound: 2, claim: 'beta won the contract', evidence: ['alpha bid lowest', 'gamma was rejected'] },
  ];
}

test('adjudicateNativeRefutedGold RETAINs only candidates BOTH OOF models all-agree do NOT entail (gold-blind), ZERO spend', async () => {
  const candidates = refutedCandidates();
  const callModel = makeOofPairStubs(); // both agree

  const res = await adjudicateNativeRefutedGold({ candidates, callModel });

  // The semantic stub reads entails=false on every candidate (claim entity != evidence lead) -> all-agree
  // does-not-entail -> RETAIN all 3 as refuted-gold.
  assert.equal(res.retained.length, 3, 'all 3 all-agree does-not-entail candidates are RETAINED as refuted-gold');
  assert.equal(res.excludedIndeterminate.length, 0, 'no candidate is indeterminate when both models agree');
  assert.deepEqual(res.retained.map((r) => r.uid).sort(), ['runA::r0', 'runA::r1', 'runB::r2'], 'the retained uids are run-dir-qualified');
});

test('adjudicateNativeRefutedGold ROUTES a split candidate to residue/excludedIndeterminate (Guerdan response-set exclusion, D-04)', async () => {
  const candidates = refutedCandidates();
  // The SECOND OOF model flips its read on the candidate whose claim contains "doubled output" -> a SPLIT
  // on runA::r1 -> EXCLUDED from the binary denominator + flagged for human routing.
  const callModel = makeOofPairStubs({ splitFlipFor: 'doubled output' });

  const res = await adjudicateNativeRefutedGold({ candidates, callModel });

  const retainedUids = res.retained.map((r) => r.uid);
  assert.ok(!retainedUids.includes('runA::r1'), 'the SPLIT candidate is NOT retained as refuted-gold');
  assert.equal(res.retained.length, 2, 'the two all-agree candidates are retained; the split one is excluded');

  const excludedUids = res.excludedIndeterminate.map((r) => r.uid);
  assert.ok(excludedUids.includes('runA::r1'), 'the split candidate is routed to excludedIndeterminate (human routing, D-04)');
  assert.ok(Array.isArray(res.residue), 'a residue list is reported for the maintainer');
});

test('adjudicateNativeRefutedGold gold direction is the OOF READ, NOT the skill self-tag', async () => {
  // A candidate the skill tagged "Contested" (a refuted-gold SOURCE BUCKET) but whose evidence the OOF
  // pair reads as ENTAILING the claim (entails=true -> "does entail" -> NOT a valid refuted-gold) must NOT
  // be retained -- the gold is the OOF read, not the self-tag. The claim leads with the SAME entity as the
  // evidence so the semantic stub reads entails=true.
  const candidates = [
    { uid: 'runA::e0', claim_id: 'e0', confidence: 'Contested', source_run_dir: 'runA', source_cluster: 'runA::docE', corroboration_lower_bound: 2, claim: 'alpha led the race decisively', evidence: ['alpha led the race', 'beta trailed'] },
  ];
  const callModel = makeOofPairStubs();

  const res = await adjudicateNativeRefutedGold({ candidates, callModel });

  assert.equal(res.retained.length, 0, 'a self-tagged Contested item the OOF pair reads as ENTAILED is NOT retained -- gold = the OOF read, never the self-tag');
  // The entailed candidate LEAVES the binary denominator: it is excluded (and surfaced in the residue for
  // human routing -- residue is the SAME excluded set, not a separate count).
  assert.equal(res.excludedIndeterminate.length, 1, 'the entailed candidate leaves the binary denominator (excludedIndeterminate)');
  assert.equal(res.residue.length, 1, 'the same excluded candidate is surfaced in the residue for the maintainer');
  assert.equal(res.excludedIndeterminate[0].uid, 'runA::e0', 'the entailed candidate is the one excluded');
});

test('adjudicateNativeRefutedGold runs ZERO spend: it never sets LZ_SPEND and never reaches a real-dispatch guard with a stub', async () => {
  // The stub callModel is reached (it IS the injected transport), but LZ_SPEND is never set + no real OOF
  // subprocess is spawned. We assert the env is clean across the call (no accidental spend authorization).
  const before = process.env.LZ_SPEND;
  const candidates = refutedCandidates();
  await adjudicateNativeRefutedGold({ candidates, callModel: makeOofPairStubs() });
  assert.equal(process.env.LZ_SPEND, before, 'the adjudication never mutates LZ_SPEND (no spend authorization)');
  assert.notEqual(process.env.LZ_SPEND, '1', 'LZ_SPEND is NOT 1 (the stub path is no-spend)');
});

// ===========================================================================
// (3) assembleArmA: the matching guards + gates (a)/(b) on the retained set; constructValid folds
// covariate+difficulty+cluster+lexical+notEasier (NO minimalEdit term); reports smd.
// ===========================================================================

// Build a retained ARM-A refuted cell + an ARM-B dense-SUPPORTED control cell, difficulty-matched (similar
// length / corroboration), and lexically clean (the truth-value not readable from the bag of words). N>=4
// per cell so the AUC + SMD have cross-class pairs.
function retainedAndControls() {
  const retainedTraps = [
    { uid: 'runA::t0', source_cluster: 'runA::docA', corroboration_lower_bound: 2, claim: 'the quarterly revenue tripled within the fiscal year', evidence: ['the quarterly revenue rose modestly within the fiscal year'] },
    { uid: 'runA::t1', source_cluster: 'runA::docB', corroboration_lower_bound: 2, claim: 'the regional output doubled across the survey window', evidence: ['the regional output increased slightly across the survey window'] },
    { uid: 'runB::t2', source_cluster: 'runB::docC', corroboration_lower_bound: 2, claim: 'the annual membership expanded fivefold over the decade', evidence: ['the annual membership grew gradually over the decade'] },
    { uid: 'runB::t3', source_cluster: 'runB::docD', corroboration_lower_bound: 2, claim: 'the export volume quadrupled during the trade period', evidence: ['the export volume edged upward during the trade period'] },
  ];
  const armBControls = [
    { uid: 'runA::c0', source_cluster: 'runA::docE', corroboration_lower_bound: 2, claim: 'the quarterly revenue rose modestly within the fiscal year', evidence: ['the quarterly revenue rose modestly within the fiscal year'] },
    { uid: 'runA::c1', source_cluster: 'runA::docF', corroboration_lower_bound: 2, claim: 'the regional output increased slightly across the survey window', evidence: ['the regional output increased slightly across the survey window'] },
    { uid: 'runB::c2', source_cluster: 'runB::docG', corroboration_lower_bound: 2, claim: 'the annual membership grew gradually over the decade', evidence: ['the annual membership grew gradually over the decade'] },
    { uid: 'runB::c3', source_cluster: 'runB::docH', corroboration_lower_bound: 2, claim: 'the export volume edged upward during the trade period', evidence: ['the export volume edged upward during the trade period'] },
  ];

  return { retainedTraps, armBControls };
}

test('assembleArmA runs gates (a) lexical-AUC + (b) one-sided not-easier ON THE RETAINED SET and reports the realized SMD', async () => {
  const { retainedTraps, armBControls } = retainedAndControls();
  const res = await assembleArmA({ retainedTraps, armBControls });

  assert.equal(res.nTrap, retainedTraps.length, 'nTrap is the retained refuted-gold count');
  assert.equal(typeof res.lexicalAuc, 'number', 'gate (a) lexical-overlap AUC is computed on the retained set');
  assert.ok(res.lexicalAuc <= LEXICAL_AUC_CEILING, 'the clean retained corpus passes the lexical-AUC ceiling (gate a)');
  assert.equal(res.lexicalGatePass, res.lexicalAuc <= LEXICAL_AUC_CEILING, 'lexicalGatePass folds the AUC vs the ceiling');
  assert.equal(typeof res.notEasier, 'boolean', 'gate (b) one-sided not-easier guard is computed on the retained set');
  assert.equal(typeof res.smd, 'number', 'the realized difficulty SMD is REPORTED for post-hoc auditability');
});

test('assembleArmA constructValid folds covariate AND difficulty AND cluster AND lexical AND notEasier -- NO minimalEdit term (gate (d) DROPPED)', async () => {
  const { retainedTraps, armBControls } = retainedAndControls();
  const res = await assembleArmA({ retainedTraps, armBControls });

  // The fold: constructValid = covariate AND difficulty AND cluster AND lexicalGatePass AND notEasier.
  const expected = res.covariateOverlapMet && res.difficultyFloorMet && res.clusterIndependenceMet && res.lexicalGatePass && res.notEasier;
  assert.equal(res.constructValid, expected, 'constructValid is the AND of the five remaining instruments');

  // Gate (d) minimal-edit / source_uid is DROPPED: the result carries NO minimalEdit term and requires no
  // source_uid on the traps (none of the fixtures carry one).
  assert.ok(!('minimalEdit' in res), 'the result carries NO minimalEdit term (gate (d) DROPPED under option C)');
  assert.ok(res.constructValid, 'a clean, difficulty-matched, cluster-independent retained set is construct-valid');
});

test('assembleArmA FAILS construct validity when gate (a) trips (a lexical artifact in the retained set)', async () => {
  // A retained cell where EVERY refuted trap carries a recurring class marker token ("REFUTEDMARK") absent
  // from every control -> the lexical-overlap baseline separates the classes -> AUC well above the ceiling
  // -> gate (a) fails -> constructValid false (the by-construction artifact gate (a) exists to catch).
  const retainedTraps = [];
  const armBControls = [];

  for (let i = 0; i < 6; i += 1) {
    retainedTraps.push({ uid: 'runA::t' + i, source_cluster: 'runA::doc' + i, corroboration_lower_bound: 2, claim: 'REFUTEDMARK token marks every refuted item number ' + i, evidence: ['neutral evidence sentence number ' + i] });
    armBControls.push({ uid: 'runA::c' + i, source_cluster: 'runA::ctl' + i, corroboration_lower_bound: 2, claim: 'a plain control claim number ' + i, evidence: ['neutral evidence sentence number ' + i] });
  }

  const res = await assembleArmA({ retainedTraps, armBControls });

  assert.ok(res.lexicalAuc > LEXICAL_AUC_CEILING, 'the recurring class marker pushes the lexical-AUC above the ceiling (got ' + res.lexicalAuc + ')');
  assert.equal(res.lexicalGatePass, false, 'gate (a) FAILS on the lexical artifact');
  assert.equal(res.constructValid, false, 'a lexical artifact -> NOT construct-valid (VOID-on-validity)');
});

test('assembleArmA reports clusterIndependenceMet false when the retained refuted cell repeats a within-run source-doc cluster', async () => {
  // Two retained traps share the SAME source_cluster (runA::docDUP) -> they are positively correlated ->
  // cluster-independence is NOT met (the per-claim CP denominator would double-count one cluster).
  const retainedTraps = [
    { uid: 'runA::t0', source_cluster: 'runA::docDUP', corroboration_lower_bound: 2, claim: 'the revenue tripled within the year', evidence: ['the revenue rose modestly within the year'] },
    { uid: 'runA::t1', source_cluster: 'runA::docDUP', corroboration_lower_bound: 2, claim: 'the output doubled across the window', evidence: ['the output increased slightly across the window'] },
    { uid: 'runB::t2', source_cluster: 'runB::docC', corroboration_lower_bound: 2, claim: 'the membership expanded fivefold over the decade', evidence: ['the membership grew gradually over the decade'] },
  ];
  const { armBControls } = retainedAndControls();

  const res = await assembleArmA({ retainedTraps, armBControls });

  assert.equal(res.clusterIndependenceMet, false, 'a repeated within-run source-doc cluster fails cluster independence');
  assert.equal(res.constructValid, false, 'cluster dependence -> NOT construct-valid (the fold includes the cluster term)');
});

// ===========================================================================
// (4) requireSpend throws on a real-dispatch path with LZ_SPEND unset.
// ===========================================================================

test('a real (non-stub) OOF dispatch is guarded by requireSpend(callOof): it THROWS with LZ_SPEND unset', async () => {
  assert.notEqual(process.env.LZ_SPEND, '1', 'precondition: LZ_SPEND is not set in the test env');

  const candidates = refutedCandidates();
  // The real-dispatch path: build the OOF adjudicator over the FROZEN copilot transport (NOT a stub). Its
  // callModel calls requireSpend('callOof') FIRST -> it must THROW before any subprocess spawn.
  await assert.rejects(
    () => adjudicateNativeRefutedGold({ candidates, useFrozenTransport: true }),
    (e) => e.name === 'ContractError' && /LZ_SPEND/.test(e.message) && /callOof/.test(e.message),
    'the real OOF dispatch refuses to spend without LZ_SPEND=1 (requireSpend callOof)',
  );
});

// ===========================================================================
// (5) The two arms are NEVER pooled (the module never concatenates arm A + arm B into one N).
// ===========================================================================

test('assembleArmA NEVER pools the two arms: it reports nTrap only (no combined N) and the ARM-B controls stay read-only', async () => {
  const { retainedTraps, armBControls } = retainedAndControls();
  const controlsSnapshot = JSON.parse(JSON.stringify(armBControls));
  const res = await assembleArmA({ retainedTraps, armBControls });

  // The result reports the ARM-A count ONLY -- no pooled / combined-N field.
  assert.equal(res.nTrap, retainedTraps.length, 'nTrap is the ARM-A refuted count');
  assert.ok(!('n' in res) && !('nPooled' in res) && !('nTotal' in res) && !('nCtrl' in res), 'the result carries NO combined/pooled N field (the two arms are NEVER pooled)');

  // ARM-B controls are consumed READ-ONLY for the matching guards -- never mutated / merged.
  assert.deepEqual(armBControls, controlsSnapshot, 'the ARM-B controls are consumed READ-ONLY (never mutated/merged into ARM A)');
});

// ===========================================================================
// Source-level invariants: the frozen seams are IMPORTED (not re-authored); the module is no-spend by
// construction (no LZ_SPEND-set, no network), ASCII-only.
// ===========================================================================

test('the module IMPORTS the frozen seams byte-identical (makeBatchedOofProbe, runProbeConsensus, requireSpend, FROZEN_OOF_PAIR, lexicalOverlapAuc, oneSidedNotEasierGuard) -- never re-authored', () => {
  const src = fs.readFileSync(new URL('./lz-eval-armA-native.mjs', import.meta.url), 'utf8');

  assert.ok(/import\s+\{[\s\S]*\brunProbeConsensus\b[\s\S]*\}\s+from\s+'\.\/lz-eval-trap-assembler\.mjs'/.test(src), 'runProbeConsensus is IMPORTED from the trap-assembler');
  assert.ok(/import\s+\{[\s\S]*\bmakeBatchedOofProbe\b[\s\S]*\}\s+from\s+'\.\/lz-eval-oof-batch\.mjs'/.test(src), 'makeBatchedOofProbe is IMPORTED from the oof-batch module');
  assert.ok(/import\s+\{[\s\S]*\brequireSpend\b[\s\S]*\bFROZEN_OOF_PAIR\b[\s\S]*\}\s+from\s+'\.\/lz-eval-live-cert\.mjs'|import\s+\{[\s\S]*\bFROZEN_OOF_PAIR\b[\s\S]*\brequireSpend\b[\s\S]*\}\s+from\s+'\.\/lz-eval-live-cert\.mjs'/.test(src), 'requireSpend + FROZEN_OOF_PAIR are IMPORTED from live-cert');
  assert.ok(/import\s+\{[\s\S]*\blexicalOverlapAuc\b[\s\S]*\}\s+from\s+'\.\/lz-eval-baseline-guard\.mjs'/.test(src), 'lexicalOverlapAuc (gate a) is IMPORTED');
  assert.ok(/import\s+\{[\s\S]*\boneSidedNotEasierGuard\b[\s\S]*\}\s+from\s+'\.\/lz-eval-difficulty-proxy\.mjs'/.test(src), 'oneSidedNotEasierGuard (gate b) is IMPORTED');
  assert.ok(/from\s+'\.\/lz-eval-harvest\.mjs'/.test(src), 'the harvest run-dir reader is IMPORTED');

  // The frozen seams are NOT re-implemented in this module (no local function re-definition of them).
  assert.ok(!/function\s+makeBatchedOofProbe\b/.test(src), 'makeBatchedOofProbe is NOT re-authored locally');
  assert.ok(!/function\s+runProbeConsensus\b/.test(src), 'runProbeConsensus is NOT re-authored locally');
  assert.ok(!/function\s+lexicalOverlapAuc\b/.test(src), 'lexicalOverlapAuc is NOT re-authored locally');
});

test('the module carries NO LZ_SPEND-set and NO network code (no-spend by construction); gate (d) minimal-edit is DROPPED', () => {
  const src = fs.readFileSync(new URL('./lz-eval-armA-native.mjs', import.meta.url), 'utf8');

  // No spend AUTHORIZATION: the module never SETS process.env.LZ_SPEND (reading it via the imported
  // requireSpend guard is fine; an assignment would be the defect).
  assert.ok(!/process\.env\.LZ_SPEND\s*=/.test(src), 'the module never SETS LZ_SPEND (no self-authorization)');
  assert.ok(!/\bfetch\s*\(/.test(src) && !/https?:\/\//.test(src), 'the module performs no network I/O');

  // Gate (d) minimal-edit / source_uid is DROPPED under option C.
  assert.ok(!/minimalEdit/.test(src), 'no minimalEdit term (gate (d) DROPPED)');

  // The expected entailment for a refuted-gold candidate is "false" (does NOT entail).
  assert.equal(String(ARM_A_EXPECTED_ENTAILMENT), 'false', 'a refuted-gold candidate expects entails=false (does NOT entail)');
});

test('the source is strictly ASCII with no byte-order mark (CLAUDE.md)', () => {
  const buf = fs.readFileSync(new URL('./lz-eval-armA-native.mjs', import.meta.url));
  assert.notEqual(buf[0], 0xef, 'no UTF-8 BOM byte 0');

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'byte ' + i + ' is ASCII (<= 0x7f): got 0x' + buf[i].toString(16));
  }
});
