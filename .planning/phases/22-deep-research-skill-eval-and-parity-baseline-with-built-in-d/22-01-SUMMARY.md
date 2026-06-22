---
phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
plan: 01
subsystem: testing
tags: [eval, parity, llm-judge, position-swap, mechanical-verdict, node-test, zero-spend]

# Dependency graph
requires:
  - phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-gating-eval
    provides: "the eval/ tree conventions -- frozen-constant mechanical verdict (lockRuleVerdict + Object.freeze EVAL_THRESHOLDS), the one-directional eval->runtime import boundary, the shared fail-closed readJson, the FILE-form node:test gate"
provides:
  - "eval/lz-eval-parity-judge.mjs -- the off-model SCORING side of the Opus parity judge: cellVerdict (position-swap agreement, D-06), scoreJudgeCells (group by question x dimension, resolve A/B->lz|builtin per ordering, descriptive mean + SEM over k), PARITY_K_RANGE (frozen 3..5)"
  - "eval/lz-eval-parity-verdict.mjs -- the two-layer mechanical verdict: PARITY_BAR (Object.freeze) + parityVerdict (absolute FLOOR + comparative PARITY bar, D-05/D-07) emitting PARITY | SCOPED-PARITY-OR-NAMED-GAP | NAMED-GAP"
  - "the scored-cell shape (per-cell win/tie/loss + descriptive mean/SEM) the verdict consumes, and the floorPassByQuestion + lossByDimension verdict inputs"
affects: [22-02 (gold-anchoring modules feed the judge), 22-04 (pre-registration FREEZE records PARITY_BAR + PARITY_K_RANGE numbers with a timestamp), 22-05 (the live spend run drives the Opus judge -> these modules score from disk -> emit the verdict)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pattern 1 (transport split): the session drives the Opus judge + lands JSON on disk; these node modules score from disk -- ZERO model spend"
    - "Pattern 2 (frozen-constant mechanical verdict): PARITY_BAR + PARITY_K_RANGE are Object.freeze'd module-level literals chosen before grading (anti-result-shopping, D-20); the verdict is a pure count comparison, no statistics (D-07)"
    - "Pattern 3 (position-swap agreement): a per-cell win is recorded ONLY when both orderings agree, else TIE (D-06)"

key-files:
  created:
    - "eval/lz-eval-parity-judge.mjs"
    - "eval/lz-eval-parity-judge.test.mjs"
    - "eval/lz-eval-parity-verdict.mjs"
    - "eval/lz-eval-parity-verdict.test.mjs"
  modified:
    - ".planning/ROADMAP.md (22-01 plan checkbox)"

key-decisions:
  - "PAR-04/PAR-05 stay Pending in REQUIREMENTS.md traceability: this plan builds the deterministic SCORE+VERDICT engine (the scoring side of PAR-04, the verdict mechanism of PAR-05) but runs NO judge and emits NO real verdict; they close end-to-end in Plan 22-05 (mirrors the Phase 18 EVAL-02/04 deterministic-engine-vs-live-eval split -- do not orphan the live-eval close)."
  - "SEM is the sample-stddev (n-1) / sqrt(k), a pure arithmetic DESCRIPTOR reported alongside the mean; NEVER a CI gate (D-07 forbids statistics at n=2-3). No jstat import in either new module."
  - "scoreJudgeCells fails closed (T-22-01): exactly 2 orderings per cell, both within PARITY_K_RANGE, matching k, an ordering label in orderingMap, and a consistent preferred token per ordering -- a missing/half/mismatched cell is a ContractError, never a silent half-cell."
  - "parityVerdict validates lossByDimension keys against the fixed 5 D-04 dims (factual, citation, completeness, source_quality, tool_process_efficiency) -- an unknown dim is a ContractError; floor flags must be boolean; loss counts must be non-negative integers."

patterns-established:
  - "Frozen-constant mechanical verdict mirrored from lz-eval-aggregate.mjs lockRuleVerdict (PARITY_BAR Object.freeze + a pure verdict function reading it)"
  - "Position-swap agreement as a single pure cellVerdict function (the discrimination anchor)"
  - "One-directional eval->runtime import (readJson + ContractError) carried verbatim; co-located FILE-form node:test per module"

requirements-completed: []  # PAR-04 / PAR-05 satisfied at the deterministic-engine level only; they stay Pending until the Plan 22-05 live eval validates them end-to-end.

# Metrics
duration: ~30min
completed: 2026-06-22
---

# Phase 22 Plan 01: Deterministic parity SCORE+VERDICT core Summary

**Two zero-spend eval modules -- the off-model position-swap judge-cell scorer (cellVerdict / scoreJudgeCells / frozen PARITY_K_RANGE) and the two-layer mechanical parity verdict (frozen PARITY_BAR + parityVerdict emitting PARITY / SCOPED-PARITY-OR-NAMED-GAP / NAMED-GAP) -- each discrimination-proven via an invert-the-fix run.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-06-22T~21:10:00+02:00
- **Completed:** 2026-06-22T21:39:24+02:00
- **Tasks:** 2 (both TDD: RED -> GREEN)
- **Files modified:** 4 created + 1 planning doc (ROADMAP)

## Accomplishments

- `eval/lz-eval-parity-judge.mjs`: `cellVerdict(orderAB, orderBA)` encodes the D-06 / Pattern-3 position-swap rule (win iff both orderings agree on the same system, else TIE); `scoreJudgeCells({ records, orderingMap })` groups landed judge records by (question, dimension), resolves each ordering's preferred A/B into lz|builtin via the per-ordering map, applies `cellVerdict`, and reports a descriptive per-cell `{ verdict, meanScoreLz, meanScoreBuiltin, semLz, semBuiltin, k }`. `PARITY_K_RANGE = Object.freeze({ MIN: 3, MAX: 5 })`. Imports `readJson` from `lz-eval-readjson.mjs`; no jstat (SEM is plain arithmetic). 14 FILE-form tests green.
- `eval/lz-eval-parity-verdict.mjs`: `PARITY_BAR = Object.freeze({ FLOOR_DIMS ['factual','citation'], MAX_LOSS_FLOOR_DIMS 0, MAX_LOSS_OTHER_DIMS 1, PASS_THRESHOLD 0.7 })`; `parityVerdict({ floorPassByQuestion, lossByDimension })` returns `PARITY` iff the absolute floor passes on every question AND zero floor-dim loss AND <=1 other-dim loss, `NAMED-GAP` if the floor fails on any question (load-bearing, D-05), else `SCOPED-PARITY-OR-NAMED-GAP`. Pure (no I/O/clock/randomness); no jstat (a count comparison, D-07). 14 FILE-form tests green.
- Both new modules verified against the existing one-directional packaging boundary (`node --test eval/lz-eval-packaging-boundary.test.mjs` exits 0 -- the boundary test scans the whole plugin tree with no enumerated list, so it covers the new modules automatically).

## Task Commits

Each task was committed atomically:

1. **Task 1: Judge-cell scorer (position-swap agreement + SEM)** - `8033835` (feat) -- one commit (test + impl together; RED was proven by running the test before the module existed, ERR_MODULE_NOT_FOUND, then GREEN 14/14).
2. **Task 2: Two-layer mechanical verdict (floor + parity bar, frozen constants)** - `f28ae7e` (feat) -- one commit (test + impl together; RED proven before the module existed, then GREEN 14/14).

**Plan metadata:** this SUMMARY + ROADMAP + STATE (docs commit, see final commit).

_Note: both tasks are tdd="true"; RED was demonstrated by running the co-located test before authoring the module (module-not-found), then GREEN. The committed unit changes (test + source) landed in one atomic feat commit per task._

## Files Created/Modified

- `eval/lz-eval-parity-judge.mjs` - off-model judge-cell scorer: cellVerdict (position-swap agreement), scoreJudgeCells (group/resolve/score), loadJudgeRecords (fail-closed on-disk read), PARITY_K_RANGE (frozen), guarded CLI.
- `eval/lz-eval-parity-judge.test.mjs` - 14 FILE-form node:test cases incl. the disagreement->tie discrimination case.
- `eval/lz-eval-parity-verdict.mjs` - two-layer mechanical verdict: PARITY_BAR (frozen), parityVerdict (pure), guarded CLI.
- `eval/lz-eval-parity-verdict.test.mjs` - 14 FILE-form node:test cases incl. the Object.isFrozen + floor-loss-flip discrimination cases.
- `.planning/ROADMAP.md` - 22-01 plan checkbox marked done.

## Decisions Made

- **PAR-04/PAR-05 stay Pending in traceability:** this plan delivers only the deterministic SCORE+VERDICT engine. The judge is not run and no real verdict is emitted here; both requirements close end-to-end in Plan 22-05 (the human-authorized live spend). This mirrors the Phase 18 precedent where EVAL-02/04 were "satisfied at the deterministic-engine level" but stayed Pending until the live eval validated them -- so the live-eval close is not orphaned.
- **SEM is descriptive only:** `semLz`/`semBuiltin` are sample-stddev (n-1) / sqrt(k), reported for description; the verdict never routes through statistics (D-07). Confirmed no jstat import in either module via `git grep -n jstat`.
- **Fail-closed cell contract (T-22-01):** scoreJudgeCells throws a ContractError on a missing ordering, a k outside PARITY_K_RANGE, a mismatched k between the two orderings, an ordering label absent from orderingMap, or an inconsistent preferred token within an ordering -- never a silent half-cell.

## Deviations from Plan

None - plan executed exactly as written. Both modules, both co-located FILE-form tests, the frozen constants (PARITY_K_RANGE, PARITY_BAR), the position-swap rule (D-06), the two-layer verdict (D-05/D-07), and both invert-the-fix discrimination cases match the plan's behavior + acceptance_criteria.

## Issues Encountered

- The `rg -E "<pattern>"` flag form was rejected as an unknown-encoding error when the pattern began with a leading token; switched to the `rg -e "<pattern>"` form for output filtering. No impact on the code or tests.

## Discrimination Proofs (req #6: prove tests fail on the inverted/old behavior)

- **Task 1:** Temporarily relaxed `cellVerdict` to the "win if EITHER ordering prefers lz/builtin" rule -> the suite went 11 pass / 3 fail (the disagreement->tie cases failed, as required). Restored the correct module -> 14/14 green, exit 0. The restored file is byte-identical to the committed `8033835` version.
- **Task 2:** Temporarily relaxed `MAX_LOSS_FLOOR_DIMS` from 0 to 1 -> the suite went 8 pass / 6 fail (the single-factual-loss-breaks-parity cases + the frozen-value assertions failed). Restored -> 14/14 green, exit 0. The restored file is byte-identical to the committed `f28ae7e` version.

## Verification (plan <verification> block)

- `node --test eval/lz-eval-parity-judge.test.mjs` exits 0 (14/14).
- `node --test eval/lz-eval-parity-verdict.test.mjs` exits 0 (14/14).
- `node --test eval/lz-eval-packaging-boundary.test.mjs` exits 0 (2/2) -- the one-directional eval->runtime boundary is intact for the new modules.
- `git grep -n "jstat" -- eval/lz-eval-parity-judge.mjs eval/lz-eval-parity-verdict.mjs` returns nothing.
- All four new files are ASCII-only, LF line endings, no BOM. Zero new packages; zero model spend.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The deterministic SCORE+VERDICT core is ready for Plan 22-02 (gold-anchoring: judge-calibration MCC gate + Slice-A AVeriTeC filter + baseline-manifest) and Plan 22-04 (the pre-registration FREEZE must record PARITY_BAR + PARITY_K_RANGE numbers with a timestamp, with an anti-drift test asserting the lock-rule prose matches these frozen constants byte-for-byte).
- Plan 22-05 (the human-authorized live spend) consumes these modules: the session drives the Opus judge, lands JSON on disk, then these node modules score the cells and emit the two-layer verdict. No blockers.

## Self-Check: PASSED

- All 4 created source/test files exist on disk.
- The SUMMARY exists on disk.
- Both task commits (`8033835`, `f28ae7e`) exist in git history.

---
*Phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d*
*Completed: 2026-06-22*
