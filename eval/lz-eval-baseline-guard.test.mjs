// lz-eval-baseline-guard.test.mjs
//
// FILE-form DISCRIMINATING coverage for the DUAL-BASELINE artifact guard (RE-PLAN-12, NO-SPEND;
// Task 7). Three fixtures (at-chance, lexical-artifact, claim-side-artifact), each DISCRIMINATING, plus
// the pinned-comparator + mechanical-rule assertions. Deterministic -- no spend.
//
// HOST QUIRK (load-bearing, CLAUDE.md): on this host `node --test <dir>` spuriously exits 1 even when
// all tests pass; ALWAYS gate by the explicit FILE path:
//   node --test eval/lz-eval-baseline-guard.test.mjs
//
// Strictly ASCII, no BOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  lexicalBaselineSeparation,
  claimOnlyBaselineSeparation,
  dualBaselineGuard,
  AT_CHANCE_MCC,
} from './lz-eval-baseline-guard.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// FIXTURE BUILDERS (12 pairs / 24 items each). The label-flip is the ONLY thing that varies the
// construction's artifact-ness across fixtures.
// ---------------------------------------------------------------------------

// AT-CHANCE: within each pair the SUPPORTED + REFUTED items have the SAME token set (the label-flip is
// a swap of which entity binds which relation -- "alpha rose more than beta" vs "beta rose more than
// alpha" -- a SEMANTIC distinction invisible to a bag of words; same shared evidence). Across pairs the
// vocabulary repeats, so no token SYSTEMATICALLY marks a class. The leave-one-pair-out log-odds scorer
// therefore finds NO class signal -> separation-MCC ~ 0 -> both baselines at chance.
function atChancePairs() {
  const topics = ['region', 'sector', 'market', 'district', 'cohort', 'sample', 'county', 'province', 'zone', 'area', 'unit', 'group'];
  const pairs = [];

  for (let i = 0; i < 12; i += 1) {
    const t = topics[i % topics.length];
    const evidence = ['The ' + t + ' alpha measure and the ' + t + ' beta measure are both recorded.'];
    pairs.push({
      supported: {
        claim: 'alpha rose more than beta in the ' + t + ' less change overall',
        evidence,
      },
      refuted: {
        claim: 'beta rose more than alpha in the ' + t + ' less change overall',
        evidence,
      },
    });
  }

  return pairs;
}

// LEXICAL-ARTIFACT: every SUPPORTED item's EVIDENCE shares an obvious lexical marker token
// ("confirmedmarker") that the REFUTED items' evidence lacks -- and the CLAIM text is identical across
// the pair. So a lexical bag-of-words model (claim+evidence) can separate the classes above chance
// (lexicalAtChance=false), while a claim-only model CANNOT (the claim carries no marker -> claim-only
// stays at chance). This isolates the LEXICAL baseline as the discriminating catcher.
function lexicalArtifactPairs() {
  const pairs = [];

  for (let i = 0; i < 12; i += 1) {
    const subject = 'study ' + i + ' region alpha beta gamma metric value sample cohort baseline period';
    pairs.push({
      supported: {
        claim: subject + ' the value rose over the period',
        evidence: [
          'confirmedmarker confirmedmarker the cohort report lists the metric for case ' + i + '.',
          'confirmedmarker a baseline value and a follow-up value are recorded for the period.',
        ],
      },
      refuted: {
        claim: subject + ' the value rose over the period',
        evidence: [
          'The cohort report lists the metric for case ' + i + ' in plain terms.',
          'A baseline value and a follow-up value are recorded for the period under review.',
        ],
      },
    });
  }

  return pairs;
}

// WEAK-LEXICAL-ARTIFACT: only a SUBSET of the SUPPORTED items carry the lexical marker (the artifact
// is partial / noisy) -> the lexical baseline separates ABOVE chance but only MODERATELY (separation-MCC
// lower CI in (0, 0.5)). This is the exact band a buggy 0.5 comparator would misread as "at chance".
function weakLexicalArtifactPairs() {
  const pairs = [];

  for (let i = 0; i < 12; i += 1) {
    const subject = 'study ' + i + ' region alpha beta gamma metric value sample cohort baseline period extra detail row';
    // The marker appears in only ~half the SUPPORTED items (a partial artifact).
    const marked = i % 2 === 0;
    pairs.push({
      supported: {
        claim: subject + (marked ? ' confirmedmarker' : '') + ' the value rose over the period',
        evidence: [
          (marked ? 'confirmedmarker ' : '') + 'the cohort report lists the metric for case ' + i + '.',
          'A baseline value and a follow-up value are recorded for the period under review.',
        ],
      },
      refuted: {
        claim: subject + ' the value rose over the period',
        evidence: [
          'The cohort report lists the metric for case ' + i + ' in plain terms.',
          'A baseline value and a follow-up value are recorded for the period under review.',
        ],
      },
    });
  }

  return pairs;
}

// CLAIM-SIDE-ARTIFACT (the F3 myopia case): every SUPPORTED claim carries a distinctive marker token
// ("supportedtoken") in the CLAIM ONLY (the evidence is identical across the pair). A claim-only model
// separates the pair (separation-MCC > 0, lower CI > 0) WITHOUT evidence -- the edit is claim-side.
function claimSideArtifactPairs() {
  const pairs = [];

  for (let i = 0; i < 12; i += 1) {
    const subject = 'study ' + i + ' region alpha beta gamma metric value sample cohort baseline period';
    const evidence = [
      'The cohort report for region case ' + i + ' lists the metric and the sample period.',
      'A baseline value and a follow-up value are both recorded for the period under review.',
    ];
    pairs.push({
      supported: {
        claim: subject + ' supportedtoken the value rose over the period',
        evidence,
      },
      refuted: {
        claim: subject + ' the value rose over the period',
        evidence,
      },
    });
  }

  return pairs;
}

// ---------------------------------------------------------------------------
// FIXTURE 1: AT-CHANCE -> guard passes (DISCRIMINATING).
// ---------------------------------------------------------------------------

test('Task-7 AT-CHANCE pairs -> BOTH baselines at chance -> guardPasses=true (DISCRIMINATING)', () => {
  const pairs = atChancePairs();
  const guard = dualBaselineGuard({ pairs });

  assert.equal(guard.lexicalAtChance, true, 'the lexical baseline is at chance (lower CI <= 0)');
  assert.equal(guard.claimOnlyAtChance, true, 'the claim-only baseline is at chance (lower CI <= 0)');
  assert.equal(guard.guardPasses, true, 'BOTH at chance -> the guard passes');

  // The lower CI does not clear 0 for either baseline (the construction is artifact-free).
  assert.ok(guard.lexicalSeparation.lowerCI <= 0, 'lexical separation-MCC lower CI <= 0 (got ' + guard.lexicalSeparation.lowerCI + ')');
  assert.ok(guard.claimOnlySeparation.lowerCI <= 0, 'claim-only separation-MCC lower CI <= 0 (got ' + guard.claimOnlySeparation.lowerCI + ')');
});

// ---------------------------------------------------------------------------
// FIXTURE 2: LEXICAL-ARTIFACT -> guard fails on the lexical baseline (DISCRIMINATING).
// ---------------------------------------------------------------------------

test('Task-7 LEXICAL-ARTIFACT pairs -> lexicalAtChance=false -> guardPasses=false (auto-demote, DISCRIMINATING)', () => {
  const pairs = lexicalArtifactPairs();
  const guard = dualBaselineGuard({ pairs });

  assert.equal(guard.lexicalAtChance, false, 'the lexical baseline SEPARATES the pairs (lower CI > 0)');
  assert.equal(guard.guardPasses, false, 'a separating lexical baseline -> the guard FAILS (auto-demote)');

  // The marker is EVIDENCE-only, so the claim-only baseline stays at chance -- the LEXICAL baseline is
  // the isolated discriminating catcher here (proves the lexical leg, not the claim-only leg, fired).
  assert.equal(guard.claimOnlyAtChance, true, 'the claim-only baseline stays at chance (the marker is evidence-only)');

  // DISCRIMINATING on the comparator: the lexical separation-MCC clears 0 with a lower CI > 0.
  assert.ok(guard.lexicalSeparation.lowerCI > 0, 'the lexical separation-MCC lower CI is strictly > 0 (got ' + guard.lexicalSeparation.lowerCI + ')');
  assert.ok(guard.lexicalSeparation.separationMcc > 0, 'the lexical separation-MCC is well above 0 (got ' + guard.lexicalSeparation.separationMcc + ')');
});

// ---------------------------------------------------------------------------
// FIXTURE 3: CLAIM-SIDE-ARTIFACT (the F3 myopia case) -> guard fails on the claim-only baseline.
// ---------------------------------------------------------------------------

test('Task-7 CLAIM-SIDE-ARTIFACT pairs (F3 myopia) -> claimOnlyAtChance=false -> guardPasses=false (DISCRIMINATING)', () => {
  const pairs = claimSideArtifactPairs();
  const guard = dualBaselineGuard({ pairs });

  assert.equal(guard.claimOnlyAtChance, false, 'the claim-only baseline SEPARATES the pair from the claim text alone (F3)');
  assert.equal(guard.guardPasses, false, 'a separating claim-only baseline -> the guard FAILS (auto-demote)');
  assert.ok(guard.claimOnlySeparation.lowerCI > 0, 'the claim-only separation-MCC lower CI is strictly > 0 (got ' + guard.claimOnlySeparation.lowerCI + ')');
});

// ---------------------------------------------------------------------------
// The comparator value is PINNED at 0 (NOT 0.5) -- the scale-mix guard, DISCRIMINATING.
// ---------------------------------------------------------------------------

test('Task-7 the at-chance comparator constant is 0 (chance for MCC), NOT 0.5 (the scale-mix guard, DISCRIMINATING)', () => {
  assert.equal(AT_CHANCE_MCC, 0, 'the at-chance comparator is 0 (chance for MCC is 0, NOT the 0.5 accuracy scale)');

  // DISCRIMINATING: a real (partial) lexical artifact has a separation-MCC lower CI > 0 but typically
  // < 0.5. Under the CORRECT comparator (<= 0) the guard FAILS (artifact caught). Under a buggy 0.5
  // comparator (<= 0.5) it would be WRONGLY called at-chance and the guard would PASS. We prove the
  // WEAK-lexical-artifact fixture's lower CI sits in (0, 0.5) -- exactly the band a 0.5 comparator misreads.
  const pairs = weakLexicalArtifactPairs();
  const lex = lexicalBaselineSeparation({ pairs });
  assert.ok(lex.lowerCI > 0 && lex.lowerCI < 0.5, 'the weak-lexical-artifact lower CI is in (0, 0.5) -- the exact band a 0.5 comparator would misread (got ' + lex.lowerCI + ')');

  // The guard's mechanical rule (lowerCI <= 0) catches it; a 0.5 rule would not.
  assert.equal(lex.lowerCI <= AT_CHANCE_MCC, false, 'under the pinned 0 comparator the artifact is NOT at-chance (the guard fails)');
  assert.equal(lex.lowerCI <= 0.5, true, 'under a buggy 0.5 comparator the SAME artifact would be wrongly called at-chance');
});

// ---------------------------------------------------------------------------
// The guard is MECHANICAL -- the SAME bcaBootstrapLowerCI-vs-AT_CHANCE_MCC rule for both baselines.
// ---------------------------------------------------------------------------

test('Task-7 the guard is mechanical: the SAME bcaBootstrapLowerCI-vs-0 rule for both baselines (no tuned knob)', () => {
  // The at-chance flags are EXACTLY (lowerCI <= AT_CHANCE_MCC) for each baseline -- recompute the rule
  // from the returned separations and assert it equals the guard's flags (no per-baseline magic number).
  const pairs = atChancePairs();
  const guard = dualBaselineGuard({ pairs });

  assert.equal(guard.lexicalAtChance, guard.lexicalSeparation.lowerCI <= AT_CHANCE_MCC, 'lexicalAtChance == (lexical lowerCI <= 0)');
  assert.equal(guard.claimOnlyAtChance, guard.claimOnlySeparation.lowerCI <= AT_CHANCE_MCC, 'claimOnlyAtChance == (claim-only lowerCI <= 0)');
  assert.equal(guard.guardPasses, guard.lexicalAtChance && guard.claimOnlyAtChance, 'guardPasses == (BOTH at chance)');

  // Source-level: there is no per-baseline tuned threshold -- both go through the same comparator constant.
  const src = fs.readFileSync(path.join(HERE, 'lz-eval-baseline-guard.mjs'), 'utf8');
  assert.ok(/lowerCI <= AT_CHANCE_MCC/.test(src), 'the shared at-chance rule is bcaBootstrapLowerCI <= AT_CHANCE_MCC');
  assert.ok(!/<=\s*0\.5/.test(src), 'no 0.5 comparator appears in the module (the scale-mix bug is absent)');
});

test('Task-7 the module source is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(path.join(HERE, 'lz-eval-baseline-guard.mjs'));

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'lz-eval-baseline-guard.mjs byte at offset ' + i + ' must be ASCII (<= 0x7F), got 0x' + buf[i].toString(16));
  }
});
