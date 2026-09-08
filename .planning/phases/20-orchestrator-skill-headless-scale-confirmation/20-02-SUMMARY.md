---
phase: 20-orchestrator-skill-headless-scale-confirmation
plan: 02
subsystem: testing
tags: [eval, live-cert, clopper-pearson, certifyModel, over-refusal, false-uphold, oof-adjudication, LZ_SPEND, pre-registration, node-test]

# Dependency graph
requires:
  - phase: 19-search-extract-worker-agents
    provides: "the frozen certifyModel/decisionMatrix/clopperPearsonUpperOneSided/EVAL_THRESHOLDS seams, the OOF batch adapter, persistVote + the lock-rule discipline, the survivor-record schema"
  - phase: 17-json-schema-and-verification-contract
    provides: "the frozen survivor.json record shape ({id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence, escalate}) the harvester reads"
provides:
  - "eval/lz-eval-harvest.mjs -- the run-the-skill-on-itself control-set loader (SUPPORTED selection + dense/contested oversampling; two arms never pooled)"
  - "eval/lz-eval-live-cert.mjs -- the staged LIVE certification orchestrator composing the frozen seams; the LZ_SPEND hard-guard; Stage 0/1/2/3; the OOF+human hybrid adjudicator residue router; the N-freeze guard"
  - "eval/lz-eval-live-lock-rule.md -- the pre-registered live lock rule (frozen TAU references byte-identical; N targets above the floor; distribution-scope limit; no optional stopping)"
  - "the deterministic-seam FILE-form test suites (29 tests total) proving the seams on stubs with ZERO model spend"
affects: [20-05-blocking-live-cert-spend, 20-orchestrator-skill, milestone-audit]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Compose-the-frozen-seams: the live arm imports certifyModel/decisionMatrix/clopperPearsonUpperOneSided/EVAL_THRESHOLDS byte-identical, never re-derives them (the over-refusal CP gate MOVED to the live arm)"
    - "LZ_SPEND hard-guard: every model-spend stage throws unless process.env.LZ_SPEND==='1'; the dry-run + the entire test suite run stubs only"
    - "Two-arms-never-pooled: the over-refusal control arm (nCtrl) and the dense-trap monitor arm (nTrap) are frozen as SEPARATE counts and passed separately to certifyModel (ESTIMAND B / ESTIMAND A)"
    - "Pre-registration sibling lock rule: prose threshold numbers byte-identical to EVAL_THRESHOLDS; freeze-before-scoring; no optional stopping"

key-files:
  created:
    - eval/lz-eval-harvest.mjs
    - eval/lz-eval-harvest.test.mjs
    - eval/lz-eval-live-cert.mjs
    - eval/lz-eval-live-cert.test.mjs
    - eval/lz-eval-live-lock-rule.md
  modified: []

key-decisions:
  - "The harvester emits TWO SEPARATE arms (over-refusal N_ctrl target 40/floor 30; dense-trap N_trap target 40/floor 30) as distinct disjoint arrays with NO combined-N field -- pooling them is a defect the tests guard"
  - "SUPPORTED-confidence selection = High|Medium (the strongly-supported positives); Low/Contested/Unsupported are NOT SUPPORTED positives; the dense band is corroboration_lower_bound >= 2 OR Contested"
  - "The Stage-2/Stage-3 model-spend scored loops are wired as LZ_SPEND-hard-guarded entrypoints that throw 'not wired in this no-spend build' AFTER the guard -- the actual spend is the human-authorized Plan 20-05"
  - "The N-freeze guard (freezeArms) freezes the two arms at-or-above-floor + disjoint into an Object.frozen snapshot at the Stage-1 [HUMAN BLOCK] boundary -- anti-optional-stopping, N cannot grow"

patterns-established:
  - "Run-dir-qualified uid (<run-basename>::<clusterId>) so a cluster id repeated across run dirs is distinct across the harvested corpus"
  - "Guerdan response-set exclusion in the hybrid adjudicator: a multi-defensible (non-boolean OOF) item leaves the binary denominator and routes to the maintainer, never coerced to a forced binary gold"

requirements-completed: []

# Metrics
duration: 24min
completed: 2026-06-19
---

# Phase 20 Plan 02: Live over-refusal + full-WORKS certification harness Summary

**A no-spend LIVE certification harness that composes the frozen certifyModel/decisionMatrix/clopperPearsonUpperOneSided/EVAL_THRESHOLDS seams byte-identical (the over-refusal CP gate moved to the live arm), harvests SUPPORTED positives from the shipping skill's own run dirs into two never-pooled arms, hard-guards every model-spend stage behind LZ_SPEND=1, and pre-registers the live lock rule -- all proven on stubs with ZERO spend.**

## Performance

- **Duration:** ~24 min
- **Started:** 2026-06-19T20:30:00Z (approx)
- **Completed:** 2026-06-19T20:54:00Z (approx)
- **Tasks:** 3
- **Files modified:** 5 created

## Accomplishments
- `eval/lz-eval-harvest.mjs` -- the run-the-skill-on-itself control-set loader (D-02): reads survivors.json from a curated corpus of real run dirs, selects SUPPORTED (High/Medium) claims, difficulty-stratifies to OVERSAMPLE the dense/contested-evidence band, and emits TWO SEPARATE arms (over-refusal control N_ctrl + dense-trap monitor N_trap) that are NEVER pooled into one N (D-03). Pure on-disk loader: no network, no LZ_SPEND code path.
- `eval/lz-eval-live-cert.mjs` -- the staged orchestrator (D-04/D-07/D-19): composes `certifyModel`/`decisionMatrix` over the two arms passed SEPARATELY (ESTIMAND B over-refusal reads nCtrl -- the gate MOVED here; ESTIMAND A false-uphold reads nTrap), reuses `clopperPearsonUpperOneSided`/`EVAL_THRESHOLDS` byte-identical (imported, never re-derived), composes the OOF all-agree + human-residue hybrid adjudicator (`classifyAdjudicationResidue`, Guerdan response-set exclusion), reuses `persistVote` for the resumable dual-run vote set, and stages Stage 0 (feasibility, no spend) -> Stage 1 [HUMAN BLOCK] freeze -> Stage 2 dual-run -> Stage 3 audit. Every model-spend stage hard-guards behind `LZ_SPEND=1` (T-20-05).
- `eval/lz-eval-live-lock-rule.md` -- the pre-registered live lock rule (D-03/D-05): the frozen TAU references byte-identical (TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24 -- run-config N targets, NOT threshold changes), the live N targets above the floor (N_ctrl 40/floor 30, N_trap ~34-40/floor 30, two arms never pooled), the N=24-knife-edge arithmetic, WORKS = both live gates pass (Haiku flip deferred, settle-OR-raise, Sonnet ships regardless), the maintainer-curated distribution-scope limit, and the no-optional-stopping discipline. ASCII-only.
- Both phase-gate test suites pass on the FILE form with ZERO model spend: `node --test eval/lz-eval-harvest.test.mjs` (13/13) and `node --test eval/lz-eval-live-cert.test.mjs` (16/16). No regression on the reused frozen seams (offline-read 58/58, aggregate, worker-contract, oof-batch all green).

## Task Commits

Each task was committed atomically:

1. **Task 1: Author lz-eval-harvest.mjs + tests** - `9b6024b` (feat)
2. **Task 2: Author lz-eval-live-cert.mjs + deterministic-seam tests** - `64e7599` (feat)
3. **Task 3: Author the pre-registered live lock rule** - `872d36b` (docs)

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created/Modified
- `eval/lz-eval-harvest.mjs` - The two-arms control-set loader: SUPPORTED selection + dense oversampling + two-arms-never-pooled, over the shipping skill's own run dirs.
- `eval/lz-eval-harvest.test.mjs` - 13 FILE-form deterministic tests over a stub run-dir corpus (SUPPORTED-only selection, dense oversampling, two-arms-never-pooled, fail-closed reads, no-spend invariant).
- `eval/lz-eval-live-cert.mjs` - The staged orchestrator composing the frozen seams; the LZ_SPEND hard-guard; the N-freeze guard; the OOF+human residue router; Stage 0/1/2/3 entrypoints; the guarded CLI.
- `eval/lz-eval-live-cert.test.mjs` - 16 FILE-form deterministic-seam tests on stubs (hard-guard throws, certifyModel composition with the over-refusal arm, N-freeze guard, residue router, frozen-seam imports, guarded CLI).
- `eval/lz-eval-live-lock-rule.md` - The pre-registered live lock rule (frozen TAU byte-identical, N targets above floor, distribution-scope limit, no optional stopping).

## Decisions Made
- **SUPPORTED-confidence = High|Medium.** The frozen confidence enum is High|Medium|Low|Contested|Unsupported; the live positives the voter SHOULD uphold are the strongly-supported band (High/Medium). Low/Contested/Unsupported are NOT SUPPORTED positives. The dense-trap MONITOR arm additionally treats a Contested claim as dense (it is, by construction, in the correlated-cheap-error band). Rationale: D-02 harvests the SUPPORTED claims the skill emitted; the over-refusal arm needs claims a competent voter should uphold.
- **The dense band = corroboration_lower_bound >= 2 OR Contested** (HARVEST_TARGETS.DENSE_SOURCE_FLOOR=2). Front-weighted deterministic ordering (densest first, tie-broken by uid; no PRNG) so a fixed-size draw oversamples dense vs a flat sample.
- **The two arms are built from DISJOINT draws** over the dense-oversampled order (the dense-trap arm draws the dense band first; the over-refusal arm draws the remaining dense-oversampled order). A claim is never in both arms; the result carries no combined-N field. This is the structural enforcement of D-03 "never pooled."
- **The Stage-2/Stage-3 scored loops are deferred to Plan 20-05** as LZ_SPEND-hard-guarded entrypoints. They call `requireSpend()` first (throws unless LZ_SPEND=1), then -- in this no-spend build -- throw "not wired in this no-spend build." This keeps the build NO-SPEND while making the hard-guard and the staging seam exercisable on stubs. The actual scored pass is the human-authorized blocking checkpoint.

## Deviations from Plan

None - plan executed exactly as written. All three tasks (harvest loader, staged orchestrator, live lock rule) were authored per the PLAN.md actions, against the analogs named in 20-PATTERNS.md, composing the frozen seams byte-identical per 20-RESEARCH.md. The frozen primitives (certifyModel, decisionMatrix, clopperPearsonUpperOneSided, EVAL_THRESHOLDS, the OOF pair identity, persistVote) were imported and consumed unchanged -- no engine number edited.

One micro-adjustment inside Task 1's own test (not a plan deviation): an initial no-spend-invariant assertion checked for any literal `LZ_SPEND` substring in the harvester source, which false-tripped on a prose comment that names the term ("the spend lives in lz-eval-live-cert.mjs"). Tightened the assertion to the genuine invariant -- no `process.env.LZ_SPEND` code PATH -- which is what the acceptance criterion ("No ... LZ_SPEND code in the harvester itself") means. Caught and fixed within Task 1 before its commit.

## Issues Encountered
- The acceptance-criterion `git grep` checks in the plan target the `eval/` tree, whose `.mjs`/`.md` SOURCE files ARE tracked (only `eval/.cache/` and `eval/node_modules/` are gitignored). The host CLAUDE.md mandates `git grep` for tracked files; verification was confirmed via `rg` where the gitignore note in the prompt context referred to the cache/deps subtrees, not the source. All acceptance greps pass (boundary statement present in the harvester; frozen-seam imports present and no local redefinitions in the live-cert orchestrator; TAU_OR/TAU_FU/N_CTRL_FLOOR/maintainer-curated/optional present in the lock rule).

## User Setup Required
None - no external service configuration required. The eval tree's only dependency (jstat@1.9.6) is already pinned and committed; no new install. This plan triggers NO live spend.

## Next Phase Readiness
- The deterministic seams + the pre-registration discipline are ready for the human-authorized BLOCKING spend (Plan 20-05): the harvest loader, the staged orchestrator (Stage 0 feasibility probe runnable no-spend; Stages 2/3 hard-guarded behind LZ_SPEND=1), and the pre-registered live lock rule are all in place.
- The over-refusal CP gate is now composed at the live arm (moved from the offline read, RE-PLAN-12), frozen primitives byte-identical. The two arms are frozen as separate counts before any scored vote.
- No blockers. Plan 20-05 is the gated spend boundary (HALT + RAISE); this plan does not trigger it.

## Self-Check: PASSED

Files verified present on disk:
- FOUND: eval/lz-eval-harvest.mjs
- FOUND: eval/lz-eval-harvest.test.mjs
- FOUND: eval/lz-eval-live-cert.mjs
- FOUND: eval/lz-eval-live-cert.test.mjs
- FOUND: eval/lz-eval-live-lock-rule.md

Commits verified in git log:
- FOUND: 9b6024b (Task 1)
- FOUND: 64e7599 (Task 2)
- FOUND: 872d36b (Task 3)

Phase gates verified (FILE form, ZERO spend -- LZ_SPEND unset):
- node --test eval/lz-eval-harvest.test.mjs -> exit 0 (13/13)
- node --test eval/lz-eval-live-cert.test.mjs -> exit 0 (16/16)

---
*Phase: 20-orchestrator-skill-headless-scale-confirmation*
*Completed: 2026-06-19*
