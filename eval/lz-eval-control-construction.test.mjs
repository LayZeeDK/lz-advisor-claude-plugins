// lz-eval-control-construction.test.mjs
//
// FILE-form deterministic coverage for the NET-NEW RE-PLAN-9 PRE-SPECIFIED control-construction rule
// (eval/lz-eval-control-construction.mjs). Dev-only eval-tree test: imports the SCRIPT under test (which
// imports the SHIPPED runtime aggregator's ContractError across trees, one-directional eval -> runtime)
// plus node stdlib only. NO network and NO model call -- deterministic (NO SPEND).
//
// Asserts the RE-PLAN-9 construction behaviors (each a DISTINCT named test that genuinely exercises the
// behavior, never a tautology):
//   - constructControls bins into the 6 covariate strata (DISCRIMINATING -- a control with a given
//     (domain, excerpt-count, claim-length) lands in the matching bin).
//   - a substring-dominated control (exact overlap >= SUBSTRING_REJECT_MAX_CHARS=40 with the trap
//     evidence) is REJECTED (DISCRIMINATING -- in `rejected`, NOT in `controls`); a paraphrase below 40
//     chars survives.
//   - a trivially-short / low-complexity control (< MIN_COMPLEXITY_TOKENS=12) is REJECTED by the
//     complexity filter; a 12-token control passes.
//   - the >=1/3 hard-positive stratum is enforced (an under-1/3-hard set is FLAGGED, not silently passed).
//   - constructControls produces candidates only (NO retain decision -- the OOF decider decides retain).
//   - the thresholds are fixed pre-registered module-level constants (never tuned toward N).
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-control-construction.test.mjs
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  constructControls,
  SUBSTRING_REJECT_MAX_CHARS,
  MIN_COMPLEXITY_TOKENS,
  HARD_POSITIVE_FRACTION,
  COVARIATE_STRATA,
} from './lz-eval-control-construction.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// A 12+-token evidence string (clears the complexity floor) that does NOT lexically overlap the trap.
const LONG_EV = 'The independent census bureau reported a verified resident population figure for the metropolitan region last decade.';

// ---------------------------------------------------------------------------
// Covariate strata binning.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 constructControls bins candidates into the 6 trap-matched covariate strata (DISCRIMINATING)', () => {
  const candidates = [
    {
      uid: 'c1',
      claim: 'This is a medium length control claim with roughly fifteen distinct descriptive tokens carried right here now.',
      evidence: [{ text: LONG_EV }, { text: 'A second supporting excerpt with enough verified tokens to count.' }, { text: 'A third one too.' }],
      cutoff: '2009-01-01T00:00:00.000Z',
      covariates: { domain: 'science', specificity: 'high' },
    },
  ];

  const out = constructControls({ candidates, substringRejectAgainst: ['totally unrelated trap text'] });

  // All 6 covariate axes are reported.
  for (const axis of COVARIATE_STRATA) {
    assert.ok(out.strata[axis] && typeof out.strata[axis] === 'object', 'the per-stratum distribution reports the ' + axis + ' axis');
  }

  // DISCRIMINATING: the candidate's domain bin is 'science' (from its covariates), excerpt-count bin is
  // 'moderate' (3 evidence items), claim-length bin is 'medium' (12-24 tokens), date-cutoff bin is the
  // cutoff year (2009).
  assert.equal(out.controls.length, 1, 'the candidate survives the filters and is a control candidate');
  const bin = out.controls[0].covariateBin;
  assert.equal(bin.domain, 'science', 'the domain axis bins from the recorded covariate');
  assert.equal(bin['excerpt-count'], 'moderate', '3 evidence items -> the moderate excerpt-count bin');
  assert.equal(bin['claim-length'], 'medium', 'a 12-24-token claim -> the medium claim-length bin');
  assert.equal(bin['date-cutoff'], '2009', 'the date-cutoff axis bins by the cutoff year');
  assert.equal(out.strata.domain.science, 1, 'the science domain bin counts the surviving control');
});

// ---------------------------------------------------------------------------
// Exact-substring-overlap rejection at the pinned threshold (40 chars).
// ---------------------------------------------------------------------------

test('RE-PLAN-9 a substring-dominated control (>= 40-char exact overlap with the trap evidence) is REJECTED; a sub-40 paraphrase survives (DISCRIMINATING)', () => {
  // A >= 40-char shared run with the trap text (lexically-dominated -> rejected).
  const sharedClause = 'the gross domestic product grew by exactly four point two percent in the fiscal year';
  assert.ok(sharedClause.length >= 40, 'the shared clause is at least 40 chars (a real overlap)');

  const candidates = [
    {
      uid: 'near-copy',
      claim: 'A near-copy control whose evidence reuses a long trap clause verbatim here now.',
      evidence: [{ text: 'Reports confirm that ' + sharedClause + ' across the region.' }],
    },
    {
      uid: 'paraphrase',
      claim: 'A genuine paraphrase control that shares no long exact run with the trap text at all.',
      evidence: [{ text: 'Economic output rose moderately over the same reporting window per the bureau.' }],
    },
  ];

  const out = constructControls({ candidates, substringRejectAgainst: ['According to the filing, ' + sharedClause + '.'] });

  // DISCRIMINATING: the near-copy is REJECTED (in `rejected`, NOT in `controls`); the paraphrase survives.
  assert.ok(out.rejected.some((r) => r.uid === 'near-copy' && r.reason === 'substring-dominated'), 'the >= 40-char overlap control is rejected as substring-dominated');
  assert.ok(!out.controls.some((c) => c.uid === 'near-copy'), 'the substring-dominated control is NOT in controls');
  assert.ok(out.controls.some((c) => c.uid === 'paraphrase'), 'the sub-40-char paraphrase survives');
});

// ---------------------------------------------------------------------------
// Complexity/length filter at the pinned floor (12 tokens).
// ---------------------------------------------------------------------------

test('RE-PLAN-9 a low-complexity control (< 12 evidence tokens) is REJECTED; a 12-token control passes (DISCRIMINATING)', () => {
  // An 11-token evidence string (below the floor) vs a 12-token one (at the floor).
  const elevenTokens = 'one two three four five six seven eight nine ten eleven';
  const twelveTokens = 'one two three four five six seven eight nine ten eleven twelve';
  assert.equal(elevenTokens.trim().split(/\s+/).length, 11, 'the 11-token fixture is 11 tokens');
  assert.equal(twelveTokens.trim().split(/\s+/).length, 12, 'the 12-token fixture is 12 tokens');

  const candidates = [
    { uid: 'short', claim: 'A short-evidence control claim with several tokens carried here now today.', evidence: [{ text: elevenTokens }] },
    { uid: 'ok', claim: 'An adequate-evidence control claim with several tokens carried here now today.', evidence: [{ text: twelveTokens }] },
  ];

  const out = constructControls({ candidates, substringRejectAgainst: ['unrelated trap'] });

  // DISCRIMINATING: the 11-token control is rejected; the 12-token control passes the floor.
  assert.ok(out.rejected.some((r) => r.uid === 'short' && r.reason === 'complexity-below-floor'), 'an 11-token control is rejected by the complexity floor');
  assert.ok(!out.controls.some((c) => c.uid === 'short'), 'the low-complexity control is NOT in controls');
  assert.ok(out.controls.some((c) => c.uid === 'ok'), 'a 12-token control passes the complexity floor');
});

// ---------------------------------------------------------------------------
// >=1/3 hard-positive stratum enforcement.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 the >=1/3 HARD-POSITIVE stratum is enforced: an under-1/3-hard set is FLAGGED (not silently passed)', () => {
  // 3 controls, only 0 hard positives -> under 1/3 -> flagged.
  const allEasy = [0, 1, 2].map((i) => ({
    uid: 'easy-' + i,
    claim: 'An easy control claim number ' + i + ' with several distinct descriptive tokens carried here.',
    evidence: [{ text: LONG_EV }],
    hardPositive: false,
  }));

  const easyOut = constructControls({ candidates: allEasy, substringRejectAgainst: ['unrelated trap'] });
  assert.equal(easyOut.hardPositiveCount, 0, 'an all-easy set reports 0 hard positives');
  assert.equal(easyOut.underHardPositive, true, 'an under-1/3-hard set is FLAGGED (underHardPositive)');

  // 3 controls, 1 hard positive -> exactly 1/3 -> NOT flagged (>= 1/3 clears).
  const oneThird = [
    { uid: 'hp', claim: 'A hard-positive control carrying a specific magnitude the excerpts do entail here.', evidence: [{ text: LONG_EV }], hardPositive: true },
    { uid: 'e1', claim: 'An easy control claim one with several distinct descriptive tokens carried here.', evidence: [{ text: LONG_EV }], hardPositive: false },
    { uid: 'e2', claim: 'An easy control claim two with several distinct descriptive tokens carried here.', evidence: [{ text: LONG_EV }], hardPositive: false },
  ];

  const thirdOut = constructControls({ candidates: oneThird, substringRejectAgainst: ['unrelated trap'] });
  assert.equal(thirdOut.hardPositiveCount, 1, 'the 1/3-hard set reports 1 hard positive');
  assert.equal(thirdOut.underHardPositive, false, 'a >=1/3-hard set is NOT flagged (>= 1/3 clears)');
});

// ---------------------------------------------------------------------------
// constructControls produces candidates only (NO retain decision).
// ---------------------------------------------------------------------------

test('RE-PLAN-9 constructControls produces CANDIDATES only -- it returns NO retain decision (the OOF decider decides retain)', () => {
  const out = constructControls({
    candidates: [{ uid: 'c', claim: 'A control claim with several distinct descriptive tokens carried here now today.', evidence: [{ text: LONG_EV }], hardPositive: true }],
    substringRejectAgainst: ['unrelated trap'],
  });

  // The return shape is { controls, strata, rejected, hardPositiveCount, ... } -- there is NO `retained` /
  // `retain` / `decision` field. The strict OOF all-agree decider (runProbeConsensus, entails=true) is the
  // SOLE retain decider over `out.controls`.
  assert.ok(Array.isArray(out.controls), 'constructControls returns a controls candidate array');
  assert.ok(Array.isArray(out.rejected), 'constructControls returns a rejected array');
  assert.equal('retained' in out, false, 'constructControls returns NO retain decision (no `retained` field)');
  assert.equal('retain' in out, false, 'constructControls returns NO `retain` decision');
  assert.equal('decision' in out, false, 'constructControls returns NO build/descope `decision` (that is the survival probe, Task 8)');
});

// ---------------------------------------------------------------------------
// The thresholds are fixed pre-registered constants (never tuned toward N).
// ---------------------------------------------------------------------------

test('RE-PLAN-9 the construction thresholds are fixed pre-registered module-level constants (never computed from the candidate count)', () => {
  assert.equal(SUBSTRING_REJECT_MAX_CHARS, 40, 'SUBSTRING_REJECT_MAX_CHARS is the pre-registered literal 40');
  assert.equal(MIN_COMPLEXITY_TOKENS, 12, 'MIN_COMPLEXITY_TOKENS is the pre-registered literal 12');
  assert.ok(Math.abs(HARD_POSITIVE_FRACTION - 1 / 3) < 1e-12, 'HARD_POSITIVE_FRACTION is the pre-registered 1/3');
  assert.equal(COVARIATE_STRATA.length, 6, 'there are exactly 6 covariate strata');

  // DISCRIMINATING (never tuned toward N): the module SOURCE pins SUBSTRING_REJECT_MAX_CHARS = 40 +
  // MIN_COMPLEXITY_TOKENS = 12 as literals, NOT computed from a candidate count. Assert the literals are
  // present in the source (a regression that derived them from candidates.length would not carry the
  // literal `= 40` / `= 12`).
  const src = fs.readFileSync(path.join(HERE, 'lz-eval-control-construction.mjs'), 'utf8');
  assert.ok(/export const SUBSTRING_REJECT_MAX_CHARS = 40;/.test(src), 'the source pins SUBSTRING_REJECT_MAX_CHARS = 40 as a module-level literal');
  assert.ok(/export const MIN_COMPLEXITY_TOKENS = 12;/.test(src), 'the source pins MIN_COMPLEXITY_TOKENS = 12 as a module-level literal');

  // The default reported thresholds match the constants (so a run records prose == code).
  const out = constructControls({ candidates: [], substringRejectAgainst: [] });
  assert.equal(out.substringRejectMaxChars, 40, 'the run records substringRejectMaxChars == 40 (prose == code)');
  assert.equal(out.minComplexity, 12, 'the run records minComplexity == 12 (prose == code)');
});
