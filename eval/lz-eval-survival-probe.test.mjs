// lz-eval-survival-probe.test.mjs
//
// FILE-form deterministic coverage for the NET-NEW RE-PLAN-9 survival-probe harness + the PRE-REGISTERED
// build-OR-descope decision rule (eval/lz-eval-survival-probe.mjs). Dev-only eval-tree test: drives
// decideControlArm + runSurvivalProbe with deterministic STUB callModels (NO SPEND, no network, no model
// call). Asserts the DISCRIMINATING behaviors from the plan's <behavior> block.
//
// Asserts (each a DISTINCT named test, never a tautology):
//   - decideControlArm is DISCRIMINATING across the pre-registered rule: retainedCount=24 +
//     covariateMatched + licenseDateUsable + NOT selectionEasy -> 'build'; retainedCount=23 -> 'descope'
//     (NO floor relaxation); covariate divergence / unusable license-date / selection-easy -> 'descope';
//     on 'descope' provisional===true.
//   - the CI-headroom anchors hold against the FROZEN engine (CP1s(0,24)<=0.15; CP1s(1,24)>0.15;
//     CP1s(1,30)<=0.15).
//   - runSurvivalProbe over STUB callModels returns the retained set + covariate-match + decision; the
//     SAME strict screen on both arms (NO asymmetric criterion); decision -> provisional.
//   - runSurvivalProbe is NON-GATING for the trap arm (it returns no signal that alters the trap retain).
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-survival-probe.test.mjs
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  decideControlArm,
  runSurvivalProbe,
  computeCovariateMatch,
  FROZEN_PAIR,
} from './lz-eval-survival-probe.mjs';
import { clopperPearsonUpperOneSided, EVAL_THRESHOLDS } from './lz-eval-aggregate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// A gold-blind STUB callModel reused from the carried adapter pattern (lz-eval-oof-batch.test.mjs): it
// PARSES the rendered prompt to recover (opaqueId -> claim), answers entails per a claim -> boolean GT
// map, and emits the DP2 JSON array (NO SPEND). runSurvivalProbe wraps it as callModel(model, prompt);
// this stub ignores the model arg (gold-blind: it reads ONLY the rendered prompt).
// ---------------------------------------------------------------------------

function parsePromptItems(promptText) {
  const afterItems = promptText.split('\nITEMS:\n')[1] || '';
  const blocks = afterItems.split('\n\n').filter((b) => b.trim().length > 0);
  const items = [];

  for (const b of blocks) {
    const lines = b.split('\n');
    const idLine = lines.find((l) => /^(p[0-9a-f]+)\)$/.test(l.trim()));
    const idMatch = idLine ? idLine.trim().match(/^(p[0-9a-f]+)\)$/) : null;

    if (!idMatch) {
      continue;
    }

    const opaque = idMatch[1];
    const claimLine = lines.find((l) => l.startsWith('CLAIM: '));
    const claim = claimLine ? claimLine.slice('CLAIM: '.length) : '';
    items.push({ opaque, claim });
  }

  return items;
}

// A stub that answers entails by a claim -> boolean GT. Both frozen-pair models share the GT (so an
// all-agree-true control is RETAINED). Emits the JSON array in reverse (a permutation) to prove de-mapping.
function makeStubCallModel(claimGT) {
  return async function callModel(_model, promptText) {
    const items = parsePromptItems(promptText);
    const objs = items.map(({ opaque, claim }) => ({ id: opaque, entails: claimGT[claim], reason: 'stub' }));
    objs.reverse();

    return JSON.stringify(objs);
  };
}

// Build N control candidates that all GENUINELY entail (claimGT true) -- the all-agree-true RETAIN path.
function mkRetainableControls(n) {
  const candidates = [];
  const claimGT = {};

  for (let i = 0; i < n; i += 1) {
    const claim = 'positive control claim number ' + i;
    candidates.push({
      uid: 'ctrl-' + i,
      claim,
      evidence: [{ text: 'supporting excerpt for control ' + i + ' with enough verified descriptive tokens here' }],
      covariateBin: { domain: 'science', 'claim-length': 'medium', 'excerpt-count': 'sparse' },
    });
    claimGT[claim] = true;
  }

  return { candidates, claimGT };
}

// ---------------------------------------------------------------------------
// decideControlArm -- the PRE-REGISTERED rule, DISCRIMINATING.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 decideControlArm: 24 + matched + usable + NOT selection-easy -> build; 23 -> descope (NO floor relaxation, DISCRIMINATING)', () => {
  // At the FROZEN 24 floor with all conditions clear -> 'build'.
  assert.equal(
    decideControlArm({ retainedCount: 24, covariateMatched: true, licenseDateUsable: true, selectionEasy: false, nCtrlFloor: 24 }),
    'build',
    'retainedCount === the FROZEN 24 floor + all conditions clear -> build',
  );

  // One below the floor (23) -> 'descope'. NO floor relaxation: a regression that built at 23 (or
  // descoped at 24) fails this assertion.
  assert.equal(
    decideControlArm({ retainedCount: 23, covariateMatched: true, licenseDateUsable: true, selectionEasy: false, nCtrlFloor: 24 }),
    'descope',
    'retainedCount 23 (below the FROZEN 24 floor) -> descope (NO floor relaxation)',
  );
});

test('RE-PLAN-9 decideControlArm: FAILS ANY condition -> descope (covariate divergence / unusable license-date / selection-easy)', () => {
  const base = { retainedCount: 30, covariateMatched: true, licenseDateUsable: true, selectionEasy: false, nCtrlFloor: 24 };

  // Sanity: the base clears.
  assert.equal(decideControlArm(base), 'build', 'the base (30, all clear) builds');

  // covariate divergence beyond tolerance -> descope.
  assert.equal(decideControlArm({ ...base, covariateMatched: false }), 'descope', 'covariateMatched=false -> descope');

  // unusable license/date -> descope.
  assert.equal(decideControlArm({ ...base, licenseDateUsable: false }), 'descope', 'licenseDateUsable=false -> descope');

  // selection-easy / substring-dominated -> descope.
  assert.equal(decideControlArm({ ...base, selectionEasy: true }), 'descope', 'selectionEasy=true -> descope');
});

test('RE-PLAN-9 decideControlArm defaults nCtrlFloor to the FROZEN N_CTRL_FLOOR (24) -- no floor relaxation', () => {
  // With no explicit nCtrlFloor the default IS the frozen engine value (24). A regression that relaxed the
  // default below 24 would let 23 build here.
  assert.equal(EVAL_THRESHOLDS.N_CTRL_FLOOR, 24, 'the frozen engine floor is 24');
  assert.equal(
    decideControlArm({ retainedCount: 23, covariateMatched: true, licenseDateUsable: true, selectionEasy: false }),
    'descope',
    'with the default frozen floor (24), 23 descopes',
  );
  assert.equal(
    decideControlArm({ retainedCount: 24, covariateMatched: true, licenseDateUsable: true, selectionEasy: false }),
    'build',
    'with the default frozen floor (24), 24 builds',
  );
});

// ---------------------------------------------------------------------------
// The CI-headroom anchors hold against the FROZEN engine.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 the CI-headroom anchors hold against the FROZEN engine (CP1s(0,24)<=0.15; CP1s(1,24)>0.15; CP1s(1,30)<=0.15)', () => {
  const cp1s = (x, n) => clopperPearsonUpperOneSided(x, n, EVAL_THRESHOLDS.ALPHA);

  // CP1s(0,24)=0.1173 <= TAU_OR (0.15): the 0-over-refusal clear at the FROZEN 24 floor.
  assert.ok(Math.abs(cp1s(0, 24) - 0.1173) < 1e-3, 'CP1s(0,24) ~= 0.1173');
  assert.ok(cp1s(0, 24) <= EVAL_THRESHOLDS.TAU_OR, 'CP1s(0,24) <= TAU_OR (0.15) -- 0-over-refusal clears at 24');

  // CP1s(1,24)=0.1829 > TAU_OR: a single over-refusal at 24 BREACHES (24 is the 0-OR floor).
  assert.ok(Math.abs(cp1s(1, 24) - 0.1829) < 1e-3, 'CP1s(1,24) ~= 0.1829');
  assert.ok(cp1s(1, 24) > EVAL_THRESHOLDS.TAU_OR, 'CP1s(1,24) > TAU_OR (0.15) -- one over-refusal at 24 breaches');

  // CP1s(1,30)=0.1486 <= TAU_OR: the ~30 target ABSORBS one over-refusal (the reason the probe targets 30+).
  assert.ok(Math.abs(cp1s(1, 30) - 0.1486) < 1e-3, 'CP1s(1,30) ~= 0.1486');
  assert.ok(cp1s(1, 30) <= EVAL_THRESHOLDS.TAU_OR, 'CP1s(1,30) <= TAU_OR (0.15) -- the 30 target absorbs one over-refusal');
});

// ---------------------------------------------------------------------------
// runSurvivalProbe structure + the build/descope -> provisional mapping (STUB callModels, NO SPEND).
// ---------------------------------------------------------------------------

test('RE-PLAN-9 runSurvivalProbe (build): all-agree-true controls at >= 24 retained -> decision build, provisional false (STUB, NO SPEND)', async () => {
  const { candidates, claimGT } = mkRetainableControls(26);
  const callModel = makeStubCallModel(claimGT);

  const out = await runSurvivalProbe({
    controlCandidates: candidates,
    trapStrata: { domain: { science: 26 }, 'claim-length': { medium: 26 } },
    callModel,
    frozenPair: FROZEN_PAIR,
    covariateTolerance: 0.5,
    licenseDateUsable: true,
    selectionEasy: false,
    nCtrlFloor: 24,
    target: 30,
  });

  assert.equal(out.retainedCount, 26, 'all 26 all-agree-true controls are retained by the strict screen');
  assert.equal(out.decision, 'build', 'a covariate-matched 26 >= the FROZEN 24 floor + usable + not-easy -> build');
  assert.equal(out.provisional, false, 'on build, provisional is false');
  assert.equal(out.covariateMatched, true, 'the trap-vs-control covariate distributions match within tolerance');
});

test('RE-PLAN-9 runSurvivalProbe (descope -> PROVISIONAL): below the FROZEN 24 floor -> decision descope, provisional true (STUB, NO SPEND)', async () => {
  // Only 20 candidates all-agree-true -> retainedCount 20 < 24 -> descope.
  const { candidates, claimGT } = mkRetainableControls(20);
  const callModel = makeStubCallModel(claimGT);

  const out = await runSurvivalProbe({
    controlCandidates: candidates,
    trapStrata: { domain: { science: 20 } },
    callModel,
    frozenPair: FROZEN_PAIR,
    covariateTolerance: 0.5,
    nCtrlFloor: 24,
  });

  assert.equal(out.retainedCount, 20, 'all 20 are retained but that is below the floor');
  assert.equal(out.decision, 'descope', 'below the FROZEN 24 floor -> descope');
  assert.equal(out.provisional, true, 'on descope, SATURATION-as-WORKS is DEMOTED to PROVISIONAL (the over-refusal arm deferred to Phase-20)');
});

test('RE-PLAN-9 runSurvivalProbe uses the SAME strict screen on both arms (NO asymmetric criterion): a control the OOF pair reads as NOT entailing is DROPPED', async () => {
  // 26 candidates, but the stub answers entails=FALSE for 6 of them (the OOF pair does not read those as
  // entailing the claim) -> they are NOT retained (the SAME strict entails=true screen as the trap arm's
  // entails=false). A Path-B regression that applied a LOOSER 'support' criterion to controls would
  // wrongly retain them.
  const candidates = [];
  const claimGT = {};

  for (let i = 0; i < 26; i += 1) {
    const claim = 'mixed control claim ' + i;
    candidates.push({
      uid: 'mix-' + i,
      claim,
      evidence: [{ text: 'excerpt for ' + i + ' with enough verified descriptive tokens carried here now' }],
      covariateBin: { domain: 'science' },
    });
    // 6 of the 26 do NOT entail (entails=false) -> dropped by the strict screen.
    claimGT[claim] = i >= 6;
  }

  const callModel = makeStubCallModel(claimGT);

  const out = await runSurvivalProbe({
    controlCandidates: candidates,
    trapStrata: { domain: { science: 20 } },
    callModel,
    frozenPair: FROZEN_PAIR,
    nCtrlFloor: 24,
  });

  // DISCRIMINATING: exactly 20 retained (the 6 non-entailing controls are DROPPED by the SAME strict
  // entails=true screen) -> below the floor -> descope. A looser control criterion (Path B) would have
  // retained all 26 and built.
  assert.equal(out.retainedCount, 20, 'the 6 non-entailing controls are DROPPED by the strict screen (NO asymmetric criterion)');
  assert.equal(out.decision, 'descope', 'after the strict screen drops the non-entailing controls, 20 < 24 -> descope');
});

test('RE-PLAN-9 runSurvivalProbe is NON-GATING for the trap arm (it returns only the control build-vs-descope; no trap-retain signal)', async () => {
  const { candidates, claimGT } = mkRetainableControls(26);
  const out = await runSurvivalProbe({
    controlCandidates: candidates,
    trapStrata: { domain: { science: 26 } },
    callModel: makeStubCallModel(claimGT),
    nCtrlFloor: 24,
  });

  // The output decides ONLY the control arm's build-vs-descope (decision + provisional). It carries NO
  // field that could alter the trap retain (no trapRetained / trapDrop / trap consensus signal). The
  // survival probe cannot enter the trap-arm consensus.
  assert.ok('decision' in out && 'provisional' in out, 'the output is the control-arm build-vs-descope decision');
  assert.equal('trapRetained' in out, false, 'no trap-retain signal');
  assert.equal('trapDecision' in out, false, 'no trap-arm decision');
  assert.equal('trapDrop' in out, false, 'no trap-drop signal -- NON-GATING for the trap arm');
});

// ---------------------------------------------------------------------------
// computeCovariateMatch: a trap-vs-control divergence beyond tolerance is detected.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 computeCovariateMatch detects a trap-vs-control divergence beyond tolerance (DISCRIMINATING)', () => {
  // Controls all in domain=science; traps all in domain=politics -> the per-bin divergence on the domain
  // axis is 1.0 > tolerance 0.5 -> NOT matched.
  const controls = [
    { covariateBin: { domain: 'science' } },
    { covariateBin: { domain: 'science' } },
  ];
  const trapStrata = { domain: { politics: 10 } };

  const mismatch = computeCovariateMatch(controls, trapStrata, 0.5);
  assert.equal(mismatch.matched, false, 'a domain divergence of 1.0 > 0.5 tolerance is NOT matched');

  // Controls + traps both in domain=science -> matched.
  const matchStrata = { domain: { science: 10 } };
  const match = computeCovariateMatch(controls, matchStrata, 0.5);
  assert.equal(match.matched, true, 'aligned domain distributions are matched within tolerance');
});

// ---------------------------------------------------------------------------
// The harness reuses the score.mjs slice (no second parser) + the frozen pair identity.
// ---------------------------------------------------------------------------

test('RE-PLAN-9 the harness reuses the score.mjs slice (no second parser) and the FROZEN OOF gold-decider pair', () => {
  assert.deepEqual(FROZEN_PAIR, ['gpt-5.5', 'gemini-3.1-pro-preview'], 'the FROZEN gold-decider pair is byte-identical');

  // DISCRIMINATING: the harness SOURCE imports sliceByIdEntails (the reused score.mjs slice) and does NOT
  // declare its own JSON-array parser (no second parser).
  const src = fs.readFileSync(path.join(HERE, 'lz-eval-survival-probe.mjs'), 'utf8');
  assert.ok(/import\s*\{\s*sliceByIdEntails\s*\}\s*from\s*'\.\/lz-eval-oof-batch-parse\.mjs'/.test(src), 'the harness imports the reused score.mjs slice (sliceByIdEntails)');
  assert.ok(/makeBatchedOofProbe/.test(src), 'the harness reuses makeBatchedOofProbe (the carried strict screen)');
  assert.ok(/runProbeConsensus/.test(src), 'the harness reuses runProbeConsensus (the all-agree-retain decider)');
});
