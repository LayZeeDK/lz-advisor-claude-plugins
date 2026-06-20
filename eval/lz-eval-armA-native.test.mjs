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
  joinClusterEvidence,
  resetEvidenceJoinCache,
  ARM_A_EXPECTED_ENTAILMENT,
} from './lz-eval-armA-native.mjs';

import { FROZEN_OOF_PAIR } from './lz-eval-live-cert.mjs';
import { LEXICAL_AUC_CEILING } from './lz-eval-baseline-guard.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
void HERE;

// ---------------------------------------------------------------------------
// Helper: write a stub run-dir corpus. `dirs` maps a run-dir basename -> an array of survivor records.
// Each run dir gets a survivors.json PLUS a claims/ dir + an excerpts/ dir SYNTHESIZED from the survivors so
// the evidence-text JOIN (cluster -> claims -> excerpts) has real worker quotes + excerpt passages to
// recover (the BLOCKING-BUG fix's contract: each candidate's evidence is the stored TEXT, never a URL).
// Returns the corpus dir path. The records use the FROZEN survivor shape
// ({ id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence, escalate }) PLUS the
// optional source_doc/cluster field the source-doc-within-run cluster key reads.
//
// The JOIN builds, per run dir, ONE worker file (w-extract-1.json) whose `claims[]` carry one entry per
// survivor: { id, text: <survivor.claim>, quote: <survivor.__quote>, excerpt_id: <survivor.__excerptId> }
// with `source` set to the survivor's FIRST source. Each referenced excerpt id gets an excerpts/<id>.txt
// passage. A survivor flagged `__noEvidence:true` is OMITTED from the worker file -- its cluster has no
// recoverable evidence text and MUST be dropped by the harvest.
// ---------------------------------------------------------------------------
function writeCorpus(dirs) {
  resetEvidenceJoinCache();
  const corpus = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-armA-corpus-'));

  for (const [name, survivors] of Object.entries(dirs)) {
    const runDir = path.join(corpus, name);
    fs.mkdirSync(runDir, { recursive: true });
    fs.mkdirSync(path.join(runDir, 'claims'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'excerpts'), { recursive: true });

    // The on-disk survivors.json carries ONLY the frozen survivor fields (strip the test-only __* hints).
    const frozenSurvivors = survivors.map((s) => {
      const out = {};

      for (const k of Object.keys(s)) {
        if (!k.startsWith('__')) {
          out[k] = s[k];
        }
      }

      return out;
    });
    fs.writeFileSync(path.join(runDir, 'survivors.json'), JSON.stringify(frozenSurvivors, null, 2) + '\n', 'utf8');

    // Synthesize the worker claims + excerpts that JOIN to each survivor cluster (exact-text by default).
    // Each worker claim's `source` must match a cluster's sources for the join to be eligible, so group the
    // synthesized claims by the survivor's FIRST source and emit one worker file per source.
    const excerptTexts = {};
    const claimsBySource = {};
    let excerptSeq = 0;

    for (const s of survivors) {
      if (s.__noEvidence === true) {
        continue;
      }

      const source = (Array.isArray(s.sources) && s.sources[0]) || 's0';
      const excerptId = s.__excerptId || ('e' + (excerptSeq += 1));
      const quote = s.__quote || ('verbatim quote backing ' + s.id);
      const workerText = s.__workerText || s.claim || ('claim ' + s.id);
      (claimsBySource[source] = claimsBySource[source] || []).push({
        id: 'wc-' + s.id,
        text: workerText,
        quote,
        excerpt_id: excerptId,
        load_bearing: true,
      });

      if (!(excerptId in excerptTexts)) {
        excerptTexts[excerptId] = s.__excerptText || ('Excerpt passage for ' + s.id + ': ' + quote + ' (full context follows).');
      }
    }

    let wIdx = 0;

    for (const [source, claims] of Object.entries(claimsBySource)) {
      wIdx += 1;
      fs.writeFileSync(
        path.join(runDir, 'claims', 'w-extract-' + wIdx + '.json'),
        JSON.stringify({ worker: 'w-extract-' + wIdx, source, claims }, null, 2) + '\n',
        'utf8',
      );
    }

    for (const [excerptId, text] of Object.entries(excerptTexts)) {
      fs.writeFileSync(path.join(runDir, 'excerpts', excerptId + '.txt'), text + '\n', 'utf8');
    }
  }

  return corpus;
}

// Build a survivor record with the frozen shape. `source_doc` is the source-doc/seed WITHIN a run (the
// lock-(a) cluster key); claim text + sources are carried so the OOF stub + the guards have real content.
// The test-only __* hints (__quote, __excerptId, __excerptText, __workerText, __noEvidence) steer the
// synthesized claims/excerpts the evidence-text JOIN recovers; they are STRIPPED from the on-disk
// survivors.json by writeCorpus.
function survivor({ id, confidence = 'High', corroboration = 1, claim, sources, source_doc, hints }) {
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

  if (hints && typeof hints === 'object') {
    for (const [k, v] of Object.entries(hints)) {
      rec['__' + k] = v;
    }
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

test('harvestRefutedGoldCandidates carries the JOINED evidence TEXT (NOT a URL) + corroboration_lower_bound + source_run_dir per candidate', () => {
  const corpus = writeCorpus({
    run0: [survivor({
      id: 'c0', confidence: 'Contested', corroboration: 3,
      claim: 'alpha overtook gamma',
      sources: ['https://example.org/alpha', 'https://example.org/beta'],
      hints: { quote: 'alpha overtook gamma in the final lap', excerptText: 'Race report: alpha overtook gamma in the final lap, with beta trailing.' },
    })],
  });

  try {
    const res = harvestRefutedGoldCandidates({ corpusDir: corpus });
    const cand = res.candidates[0];

    assert.equal(cand.claim, 'alpha overtook gamma', 'the candidate carries the claim text');
    assert.ok(Array.isArray(cand.evidence), 'the candidate carries an evidence array of { sentence } objects');
    assert.ok(cand.evidence.every((e) => e && typeof e.sentence === 'string' && e.sentence.length > 0), 'every evidence item is a non-empty { sentence: <text> }');

    // BLOCKING-BUG fix: the evidence is the stored TEXT (the worker quote + the excerpt passage), NEVER a URL.
    const joined = JSON.stringify(cand.evidence);
    assert.ok(!/https?:\/\//.test(joined), 'the evidence is the stored TEXT, NEVER a bare URL (the bug)');
    assert.ok(cand.evidence.some((e) => e.sentence.includes('alpha overtook gamma in the final lap')), 'the matched verbatim quote text is present in the evidence');

    assert.equal(cand.corroboration_lower_bound, 3, 'the candidate carries corroboration_lower_bound');
    assert.equal(cand.source_run_dir, 'run0', 'the candidate carries the source_run_dir');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

// ===========================================================================
// (1b) THE EVIDENCE-TEXT JOIN (BLOCKING-BUG fix): each harvested member's evidence is the real stored
// excerpt/quote TEXT (joined cluster -> claims -> excerpts), NEVER a bare URL; a cluster with no recoverable
// evidence text is DROPPED + counted in droppedNoEvidence. Both the EXACT-match and the OVERLAP-match paths
// are covered, plus joinClusterEvidence directly.
// ===========================================================================

test('joinClusterEvidence returns the worker QUOTE + excerpt TEXT (NOT a URL) via the EXACT-match path', () => {
  const corpus = writeCorpus({
    run0: [survivor({
      id: 'c0', confidence: 'Contested', corroboration: 2,
      claim: 'beta led for three quarters of the race',
      sources: ['https://example.org/race-report'],
      hints: { quote: 'beta led for three quarters of the race', excerptText: 'Lap log: beta led for three quarters of the race before fading.' },
    })],
  });

  try {
    resetEvidenceJoinCache();
    const runDir = path.join(corpus, 'run0');
    const cluster = { id: 'c0', claim: 'beta led for three quarters of the race', sources: ['https://example.org/race-report'] };
    const joined = joinClusterEvidence(runDir, cluster);

    assert.equal(joined.matched, true, 'the exact-text worker claim is matched');
    assert.equal(joined.reason, 'exact', 'the match path is EXACT (the cluster claim is a verbatim worker text)');
    assert.ok(joined.evidence.length >= 1, 'at least one evidence sentence is recovered');
    const text = JSON.stringify(joined.evidence);
    assert.ok(!/https?:\/\//.test(text), 'the recovered evidence is TEXT, NEVER a URL');
    assert.ok(joined.evidence.some((e) => e.sentence.includes('beta led for three quarters of the race')), 'the verbatim quote is present');
    assert.ok(joined.evidence.some((e) => e.sentence.includes('before fading')), 'the excerpt passage text is present (joined from excerpts/<id>.txt)');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence recovers evidence via the OVERLAP-match path when the cluster claim is a paraphrase (no exact worker text)', () => {
  // The cluster claim is a PARAPHRASE of the worker claim text (high token overlap, NOT byte-exact) so the
  // exact path misses and the Jaccard-overlap fallback fires. The recovered evidence is still the worker
  // quote + excerpt TEXT, never a URL.
  const corpus = writeCorpus({
    run0: [survivor({
      id: 'c0', confidence: 'Low', corroboration: 2,
      claim: 'the annual regional output doubled across the full survey window period',
      sources: ['https://example.org/survey'],
      hints: {
        workerText: 'the annual regional output doubled across the survey window period reportedly',
        quote: 'regional output doubled across the survey window',
        excerptText: 'Survey: the annual regional output doubled across the survey window period reportedly, per the audit.',
      },
    })],
  });

  try {
    resetEvidenceJoinCache();
    const runDir = path.join(corpus, 'run0');
    const cluster = { id: 'c0', claim: 'the annual regional output doubled across the full survey window period', sources: ['https://example.org/survey'] };
    const joined = joinClusterEvidence(runDir, cluster);

    assert.equal(joined.matched, true, 'the paraphrased cluster claim matches the worker text via overlap');
    assert.equal(joined.reason, 'overlap', 'the match path is OVERLAP (Jaccard fallback, no exact byte match)');
    const text = JSON.stringify(joined.evidence);
    assert.ok(!/https?:\/\//.test(text), 'the overlap-recovered evidence is TEXT, NEVER a URL');
    assert.ok(joined.evidence.some((e) => e.sentence.includes('regional output doubled across the survey window')), 'the matched worker quote is present');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence FLAGS matched:false when no worker claim matches the cluster (no recoverable evidence text)', () => {
  // A cluster whose claim shares no source / no overlapping worker text -> the join recovers nothing and
  // flags matched:false with a reason. The caller (harvest) must DROP it, never emit a URL.
  const corpus = writeCorpus({
    run0: [survivor({
      id: 'present', confidence: 'High', corroboration: 2,
      claim: 'an entirely unrelated supported statement about chemistry',
      sources: ['https://example.org/chem'],
      hints: { quote: 'chemistry quote', excerptText: 'chemistry passage' },
    })],
  });

  try {
    resetEvidenceJoinCache();
    const runDir = path.join(corpus, 'run0');
    // The cluster references a DIFFERENT source with NO matching worker claim.
    const cluster = { id: 'orphan', claim: 'a claim with no backing worker evidence whatsoever', sources: ['https://example.org/nonexistent'] };
    const joined = joinClusterEvidence(runDir, cluster);

    assert.equal(joined.matched, false, 'no matching worker claim -> matched:false');
    assert.equal(joined.evidence.length, 0, 'no evidence text is emitted (never a URL, never an empty packet passed downstream)');
    assert.ok(typeof joined.reason === 'string' && joined.reason.length > 0, 'a reason is surfaced for the maintainer');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('harvestRefutedGoldCandidates DROPS a cluster with no recoverable evidence text and counts it in droppedNoEvidence (never emits a URL)', () => {
  // Two refuted-gold clusters: c0 has recoverable evidence (joined); c1 is flagged __noEvidence (no worker
  // claim / excerpt synthesized) -> it MUST be dropped + counted, never emitted carrying a URL.
  const corpus = writeCorpus({
    run0: [
      survivor({ id: 'c0', confidence: 'Contested', corroboration: 2, claim: 'gamma posted the fastest split', sources: ['https://example.org/splits'], hints: { quote: 'gamma posted the fastest split', excerptText: 'Timing: gamma posted the fastest split overall.' } }),
      survivor({ id: 'c1', confidence: 'Unsupported', corroboration: 1, claim: 'delta withdrew before the start', sources: ['https://example.org/withdrawals'], hints: { noEvidence: true } }),
    ],
  });

  try {
    const res = harvestRefutedGoldCandidates({ corpusDir: corpus });

    assert.equal(res.nCandidates, 1, 'only the cluster with recoverable evidence text is a candidate');
    assert.equal(res.droppedNoEvidence, 1, 'the no-evidence cluster is counted in droppedNoEvidence');
    assert.equal(res.dropped.length, 1, 'the dropped cluster is surfaced for the maintainer');
    assert.ok(res.dropped[0].uid.endsWith('::c1'), 'the dropped uid is the no-evidence cluster');
    assert.ok(typeof res.dropped[0].reason === 'string' && res.dropped[0].reason.length > 0, 'the drop carries a reason');

    // The surviving candidate carries TEXT, never a URL.
    const cand = res.candidates[0];
    assert.ok(cand.uid.endsWith('::c0'), 'the kept candidate is the one with evidence');
    assert.ok(!/https?:\/\//.test(JSON.stringify(cand.evidence)), 'the kept candidate evidence is TEXT, never a URL');
  } finally {
    fs.rmSync(corpus, { recursive: true, force: true });
  }
});

test('joinClusterEvidence caps an oversized excerpt passage + strips non-ASCII bytes (ASCII-safe, length-capped)', () => {
  // An excerpt longer than the documented cap + carrying non-ASCII bytes. The recovered passage must be
  // ASCII-only and not exceed the cap; the verbatim quote (the load-bearing snippet) is emitted IN FULL.
  const bigPassage = 'PASSAGE-START ' + 'x'.repeat(5000) + ' PASSAGE-END';
  // Build the accented string from char codes so THIS test source stays strictly ASCII (CLAUDE.md). The
  // codes 0xe9 (e-acute) / 0xef (i-diaeresis) are the non-ASCII bytes the join must STRIP from the quote.
  const accent = (cp) => String.fromCharCode(cp);
  const nonAscii = 'caf' + accent(0xe9) + ' na' + accent(0xef) + 've r' + accent(0xe9) + 'sum' + accent(0xe9) + ' quote text'; // accented chars must be stripped
  const corpus = writeCorpus({
    run0: [survivor({
      id: 'c0', confidence: 'Contested', corroboration: 2,
      claim: 'the cap test claim sentence',
      sources: ['https://example.org/cap'],
      hints: { quote: nonAscii, excerptText: bigPassage },
    })],
  });

  try {
    resetEvidenceJoinCache();
    const runDir = path.join(corpus, 'run0');
    const cluster = { id: 'c0', claim: 'the cap test claim sentence', sources: ['https://example.org/cap'] };
    const joined = joinClusterEvidence(runDir, cluster);

    assert.equal(joined.matched, true, 'the cap-test cluster is matched');

    for (const e of joined.evidence) {
      for (let i = 0; i < e.sentence.length; i += 1) {
        assert.ok(e.sentence.charCodeAt(i) <= 0x7f, 'every evidence char is ASCII (<= 0x7f)');
      }

      assert.ok(e.sentence.length <= 1200, 'no evidence sentence exceeds the documented 1200-char cap (got ' + e.sentence.length + ')');
    }

    // The quote is recovered with the non-ASCII bytes STRIPPED (e.g. "cafe naive resume quote text").
    assert.ok(joined.evidence.some((e) => e.sentence.includes('quote text')), 'the (ASCII-stripped) quote text is present');
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
