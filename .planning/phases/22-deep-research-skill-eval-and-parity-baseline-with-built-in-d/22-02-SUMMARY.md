---
phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
plan: 02
subsystem: testing
tags: [eval, mcc, calibration, averitec, wice, llm-aggrefact, manifest, parity, node-test, jstat]

# Dependency graph
requires:
  - phase: 18-19 (eval core)
    provides: lz-eval-mcc.mjs (mccFromPairs, bcaBootstrapLowerCI, frozen bars), lz-eval-dataset.mjs (remapLabel), lz-eval-readjson.mjs (readJson), the lz-deep-research-aggregate.mjs ContractError
  - phase: 22 plan 01
    provides: the parity SCORE+VERDICT core + the established eval-tree conventions (frozen-constant verdict, CLI guard, one-directional eval->runtime import)
provides:
  - The judge-MCC-calibration gate (PAR-02 / D-13): a tested DISQUALIFIER over the closed-book WiCE+LLM-AggreFact judge verdicts, delegating mccFromPairs + bcaBootstrapLowerCI
  - The Slice-A AVeriTeC filter + 4-way->binary collapse + per-confusion-matrix-direction descriptive tally + the frozen feasibility gate (PAR-06 / D-11 / D-14)
  - The baseline-capture MANIFEST writer/validator (PAR-03 / D-15 / D-16): fail-closed on a missing CC-version+model pin
  - A small committed synthetic AVeriTeC-shaped fixture (eval/__fixtures__/sliceA-seed.json)
affects: [22-04 pre-registration freeze, 22-05 human-authorized capture+calibrate+grade spend]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Closed-book gold calibrates the JUDGE (judge-calibration); open-book gold scores the open-book voter DESCRIPTIVELY (Slice A) -- the ratified construct-validity role separation"
    - "Below-bar calibration is a returned DISQUALIFIER flag (the driver enforces the stop), never a silent grade"
    - "Per-confusion-matrix-direction tally reusing the mccFromPairs cell mapping, never a pooled rate / CP / CI / pass-fail cert (D-11)"
    - "Fail-closed MANIFEST validation (a truncated/unpinned headless capture cannot be graded)"
    - "Discrimination-proven tests: each behavior was empirically verified to fail on the inverted/old code"

key-files:
  created:
    - eval/lz-eval-judge-calibration.mjs
    - eval/lz-eval-judge-calibration.test.mjs
    - eval/lz-eval-sliceA-gold.mjs
    - eval/lz-eval-sliceA-gold.test.mjs
    - eval/lz-eval-baseline-manifest.mjs
    - eval/lz-eval-baseline-manifest.test.mjs
    - eval/__fixtures__/sliceA-seed.json
  modified: []

key-decisions:
  - "judge-calibration derives the subtle marker via remapLabel (DELEGATED to lz-eval-dataset.mjs) rather than only accepting a subtle:true marker -- honors the plan SOURCE acceptance criterion + the key_link, keeps WICE_LABEL_MAP private"
  - "A PERFECT (MCC 1.0) calibration set is the at-floor discriminator: its zero-variance bootstrap collapses the one-sided BCa lower CI to exactly the floor (0), so the STRICT `> LOWER_FLOOR` gate disqualifies it -- a `>=` bug would wrongly clear it"
  - "The 'clears' calibration case uses a near-perfect (11/12 each direction) set, since a perfect set has zero bootstrap variance and a lowerCI at the floor"

patterns-established:
  - "Synthetic gold fixtures for CC-BY-NC datasets: author plausible synthetic AVeriTeC-shaped rows (never copy the licensed corpus), with deliberate leaky-token/pronoun/over-long claims to exercise the filter exclusions offline"

requirements-completed: [PAR-02, PAR-03, PAR-06]

# Metrics
duration: 35min
completed: 2026-06-22
---

# Phase 22 Plan 02: Deterministic gold-anchoring eval modules Summary

**Three off-model node modules that compose the existing eval core into the parity eval's construct-validity backstops: a judge-MCC-calibration DISQUALIFIER (D-13), the AVeriTeC Slice-A judge-free per-direction descriptive tally + frozen feasibility gate (D-11/D-14), and a fail-closed baseline-capture MANIFEST validator (D-15/D-16) -- zero model spend, zero new packages, each test discrimination-proven.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-22
- **Completed:** 2026-06-22
- **Tasks:** 3 (plus one in-task alignment refactor)
- **Files created:** 7 (3 modules + 3 co-tests + 1 fixture)

## Accomplishments

- **Task 1 -- Judge-MCC-calibration gate (PAR-02 / D-13):** `judgeCalibrationGate({ verdicts, gold })` delegates `mccFromPairs` + `bcaBootstrapLowerCI` (D-07: no hand-rolled stats) and returns `{ mcc, lowerCI, cleared }` where `cleared === (mcc >= JUDGE_MCC_BAR.POINT && lowerCI > JUDGE_MCC_BAR.LOWER_FLOOR)`. Below the bar is a returned DISQUALIFIER (the 22-05 driver enforces the stop), never a silent grade. `dedupAgreFactVsWice` drops WiCE-embedded AggreFact uids (mandatory). A zero-subtle calibration set is a `ContractError`. `JUDGE_MCC_BAR` is `Object.freeze` re-exporting the frozen `lz-eval-mcc.mjs` bars. `goldFromWiceLabel` delegates to `remapLabel` for the subtle-substratum derivation.
- **Task 2 -- Slice-A AVeriTeC anchoring (PAR-06 / D-11 / D-14):** `collapseAvtLabel` (Supported->unrefuted, Refuted->refuted, Conflicting->null EXCLUDE, NEI->null HOLD OUT); `filterSliceA` strips every leaky gold field and emits `claim + claim_date` only, rejecting pronoun/leaky-token/over-long claims, partitioned per direction; `sliceAFeasibilityGate` clears at `N_SUP_MIN/N_REF_MIN` with both directions populated and always names the uniform-2020 + topical-narrowness provisional limits; `tallyPerDirection` reuses the `mccFromPairs` cell mapping and reports per-direction cells, NEVER pooled, no CP / CI / pass-fail cert. `SLICE_A_GATE` is `Object.freeze({ N_SUP_MIN: 8, N_REF_MIN: 8 })`. A 12-row synthetic AVeriTeC-shaped fixture exercises the collapse/filter/gate offline.
- **Task 3 -- Baseline-capture MANIFEST (PAR-03 / D-15 / D-16):** `extractSystemInit` parses the first system/init event (throws on a missing model / CC version / no-init -- an unpinned run cannot be graded); `buildManifest` pins CC version + model + report + per-run cost + surface + qid + runK; `validateManifest` fails closed on a missing model / missing report file / missing cost (each a distinct `ContractError`), and the built-in + lz surfaces validate symmetrically.

## Task Commits

1. **Task 1: Judge-MCC-calibration gate** - `1f90492` (feat)
2. **Task 2: Slice-A AVeriTeC filter + collapse + per-direction tally + frozen gate** - `cd54ea2` (feat)
3. **Task 3: Baseline-capture MANIFEST writer/validator** - `49c01cb` (feat)
4. **Task 1 alignment: judge-calibration delegates to remapLabel** - `d349a59` (refactor)

_TDD note: each module was authored test-first (RED: import fails) then implemented (GREEN), with the discrimination case empirically proven by inverting the fix and confirming the test flips to failing, then reverting byte-identical._

## Files Created/Modified

- `eval/lz-eval-judge-calibration.mjs` - The off-model judge-calibration DISQUALIFIER gate; exports `JUDGE_MCC_BAR`, `dedupAgreFactVsWice`, `goldFromWiceLabel`, `judgeCalibrationGate`.
- `eval/lz-eval-judge-calibration.test.mjs` - 12 tests (gate clears/disqualifies, de-dup, zero-subtle ContractError, at-floor strict-`>` discrimination, remapLabel derivation).
- `eval/lz-eval-sliceA-gold.mjs` - The Slice-A filter/collapse/gate/per-direction tally; exports `SLICE_A_GATE`, `collapseAvtLabel`, `filterSliceA`, `sliceAFeasibilityGate`, `tallyPerDirection`.
- `eval/lz-eval-sliceA-gold.test.mjs` - 18 tests (collapse, leaky-field strip, exclude/hold-out, gate, per-direction never-pooled, leaky-token + falsehood-only discrimination).
- `eval/lz-eval-baseline-manifest.mjs` - The fail-closed MANIFEST writer/validator; exports `extractSystemInit`, `buildManifest`, `validateManifest`.
- `eval/lz-eval-baseline-manifest.test.mjs` - 11 tests (init parse, fail-closed model/report/cost, surface symmetry, invert-the-fix model-guard discrimination).
- `eval/__fixtures__/sliceA-seed.json` - 12-row synthetic AVeriTeC-shaped fixture (mixed Supported/Refuted/Conflicting/NEI + claim_date + leaky-token + pronoun + over-long claims). Synthetic, NOT copied from CC-BY-NC AVeriTeC.

## Decisions Made

- **remapLabel delegation (Task 1):** The plan's SOURCE acceptance criterion + key_link require importing `remapLabel` from `./lz-eval-dataset.mjs`. The initial GREEN implementation validated a `subtle:true` marker directly (permitted by the behavior bullet's "OR" clause). To honor the explicit import contract while keeping `WICE_LABEL_MAP` private, added `goldFromWiceLabel` which DELEGATES to `remapLabel` to derive `{ id, gold, subtle }` from a WiCE source label -- the same canonical remap the dataset loader uses, never a re-implemented table.
- **At-floor discrimination via the perfect set:** Empirically, a perfect MCC=1.0 calibration set has a zero-variance bootstrap, so its one-sided BCa lower CI collapses to exactly the floor (0). This makes the perfect set the natural invert-the-fix discriminator: the STRICT `lowerCI > LOWER_FLOOR` gate disqualifies it (a `>=` bug would wrongly clear it because MCC 1.0 >= the POINT bar). The "clears" case therefore uses a near-perfect (11/12 per direction, MCC ~0.83, lowerCI ~0.53) set.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical contract-conformance] judge-calibration did not import remapLabel as the SOURCE criterion + key_link require**
- **Found during:** Task 1 (post-GREEN verification of the SOURCE acceptance criterion + key_links)
- **Issue:** The first GREEN implementation validated the `subtle` marker on gold directly (allowed by the behavior bullet's "carry a subtle:true marker OR accept a count argument") but did not import `remapLabel` from `./lz-eval-dataset.mjs`. The plan's SOURCE acceptance criterion and the `key_links` entry both require that import (the canonical remap, with `WICE_LABEL_MAP` staying private).
- **Fix:** Added `goldFromWiceLabel({ id, wiceLabel })` which delegates to `remapLabel` to derive `{ id, gold, subtle }`, plus 3 covering tests. `WICE_LABEL_MAP` is never imported (it stays module-private; only referenced in comments).
- **Files modified:** eval/lz-eval-judge-calibration.mjs, eval/lz-eval-judge-calibration.test.mjs
- **Verification:** `git grep` confirms `remapLabel` imported from `./lz-eval-dataset.mjs` and zero `WICE_LABEL_MAP` import; 12/12 tests green.
- **Committed in:** `d349a59` (refactor)

---

**Total deviations:** 1 auto-fixed (Rule 2 - contract conformance)
**Impact on plan:** The fix aligns the module with the plan's explicit SOURCE import contract + key_link; no scope creep, no behavior change to the gate predicate.

## Issues Encountered

- **Perfect-set lowerCI collapses to the floor:** The initial Task-1 test assumed a perfect (6/6 + 6/6) calibration set would have `lowerCI > 0`. The BCa bootstrap of a perfect MCC=1.0 set is zero-variance, so the one-sided lower CI is exactly 0 -- the set does NOT clear the strict gate. Resolved by probing several candidate sets, switching the "clears" case to a near-perfect set, and repurposing the perfect set as the at-floor strict-`>` discriminator (a stronger discrimination case than originally planned).

## Verification

- `node --test eval/lz-eval-judge-calibration.test.mjs` -> 12/12, exit 0
- `node --test eval/lz-eval-sliceA-gold.test.mjs` -> 18/18, exit 0 (over the committed fixture)
- `node --test eval/lz-eval-baseline-manifest.test.mjs` -> 11/11, exit 0
- `node --test eval/lz-eval-packaging-boundary.test.mjs` -> 2/2, exit 0 (one-directional eval->runtime boundary intact)
- `git grep -n "callOof\|copilot\|gpt-5\|gemini" -- eval/lz-eval-judge-calibration.mjs eval/lz-eval-sliceA-gold.mjs eval/lz-eval-baseline-manifest.mjs` -> no matches (no OOF transport, D-18)
- Full tracked eval suite (per-file loop over `eval/*.test.mjs`): 35 files, 0 failures
- Discrimination proven for all three modules by inverting the fix (strict `>` -> `>=`; remove leaky-token filter; drop the both-directions gate; neutralize the fail-closed model guard) and confirming the matching test flips to failing, then reverting byte-identical.
- ASCII-only, no BOM, LF on all 7 files; zero new packages; zero model spend.

## Known Stubs

None. All three modules are complete deterministic functions over their inputs; no placeholder data, no unwired UI. (The session-driven inputs they score -- judge verdicts, voter verdicts, captured stream-json/report -- are produced by the human-authorized Plan 22-05 spend, which is out of scope for this no-spend plan.)

## Self-Check: PASSED

- All 7 created files verified present on disk.
- All 4 task commits (`1f90492`, `cd54ea2`, `49c01cb`, `d349a59`) verified present in git history.
