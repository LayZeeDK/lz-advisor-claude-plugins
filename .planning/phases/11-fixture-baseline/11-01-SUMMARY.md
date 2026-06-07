---
phase: 11-fixture-baseline
plan: 01
subsystem: testing
tags: [bash, smoke-fixture, fragment-grammar, word-budget, reviewer-agent, regression-gate]

# Dependency graph
requires:
  - phase: 09 (v1.0)
    provides: "plugins/lz-advisor/agents/reviewer.md at the post-reorg path (the self-extract parse target)"
provides:
  - "tests/D-reviewer-budget.sh -- the reviewer half of the Phase 11 regression baseline (GATE-01)"
  - "Reusable 3-slot FRAGMENT_RE parser + per-section budget assertions for --from-trace replay in Phase 13"
  - "Anti-vacuous matched_count >= 5 guard + --self-test fail-loudly proof"
affects: [12-grouped-grammar, 13-live-trace-capture]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Self-extracting smoke fixture: parses the agent file's holistic worked example as its own baseline input, creating lockstep coupling (Phase 12's grammar edit flips it RED)"
    - "Three-mode bash fixture: default self-extract / --from-trace <file> / --self-test"
    - "Anti-vacuous-pass guard before the budget loop (matched_count >= MIN_FINDINGS) with always-printed parsed count"
    - "Parser-layer budget tolerance only (agent <output_constraints> never loosened)"

key-files:
  created:
    - "tests/D-reviewer-budget.sh"
  modified: []

key-decisions:
  - "self-extract awk range stops at the first non-blockquote line (stops before reviewer.md:144 prose), keeping the example block clean"
  - "--self-test exits NON-zero when the anti-vacuous guard fires (binding contract resolved an internal plan contradiction; see Deviations)"
  - "verify_request lines are SKIPPED via continue (not counted, not budget-checked) per the Recovered Phase 08 Contract"

patterns-established:
  - "Self-extracting regression fixture coupled to the agent prompt's worked example"
  - "Mode-dispatched bash smoke gate (default / --from-trace / --self-test)"

requirements-completed: [GATE-01]

# Metrics
duration: 18min
completed: 2026-06-07
---

# Phase 11 Plan 01: Fixture baseline (reviewer half) Summary

**tests/D-reviewer-budget.sh -- a standalone bash smoke fixture that self-extracts the reviewer agent's holistic worked example, parses 7 findings via a 3-slot fragment-grammar regex, and asserts the per-section word budgets green on HEAD against the current shorthand grammar.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-06-07
- **Completed:** 2026-06-07
- **Tasks:** 1
- **Files modified:** 1 (created)

## Accomplishments
- Authored `tests/D-reviewer-budget.sh` (236 lines, standalone, zero-dependency, ASCII-only), green on HEAD.
- Default self-extract mode parses exactly 7 fragment-grammar findings (verify_request line excluded) and prints `7 findings parsed`; exits 0 with 10/10 assertions passing.
- Anti-vacuous `matched_count >= 5` guard runs BEFORE the per-finding budget loop; `--self-test` synthesizes zero findings and exits NON-zero (1), proving the fail-loudly guard fires.
- `--from-trace <file>` round-trips the self-extracted report through the same parser + assertions (exits 0), establishing the Phase 13 replay capability.
- Per-section budgets asserted at the parser layer: per-finding bodies (prefix excluded) <= 28w (measured 10/9/11/7/17/13/16); Cross-Cutting Patterns 65w <= 160w; Missed surfaces 18w <= 30w. The agent's stated budget was never loosened (D-07).

## Task Commits

Each task was committed atomically:

1. **Task 1: Author tests/D-reviewer-budget.sh** - `0fef58f` (test)

_Note: plan metadata (this SUMMARY) committed separately in worktree mode (SUMMARY + REQUIREMENTS only; STATE/ROADMAP owned by the orchestrator)._

## Files Created/Modified
- `tests/D-reviewer-budget.sh` - 3-slot reviewer budget smoke fixture; self-extracts the holistic worked example from `plugins/lz-advisor/agents/reviewer.md`, parses findings with a backtick-tolerant `FRAGMENT_RE`, skips `<verify_request` lines, asserts the per-section word budgets, and exits non-zero on any failure. Three modes: default self-extract, `--from-trace <file>`, `--self-test`.

## Decisions Made
- **awk self-extract range:** start at `^> ### Findings$`, print all blockquote-prefixed lines, stop at the first line that is NOT blockquote-prefixed. This captures the full holistic example (Findings + Cross-Cutting Patterns + Missed surfaces, reviewer.md:125-142) and stops before the prose "Word count breakdown:" paragraph at reviewer.md:144. Verified empirically.
- **verify_request handling:** SKIP via `continue` (Recovered Phase 08 Contract recommendation; reviewer.md:114 treats it as a separate trailing line, not a finding). Keeps `matched_count` at 7 and avoids mis-applying the 28w cap to the ~20w XML attribute string.
- **Correct path:** `REVIEWER_AGENT="plugins/lz-advisor/agents/reviewer.md"` (post-Phase-9), with an explicit `[ -f ]` loud-fail guard -- NOT the stale top-level `agents/reviewer.md` the legacy validate-phase-04.sh analog uses (RESEARCH Pitfall 1).
- **T-11-01 mitigation:** `"$TRACE_FILE"` quoted everywhere; read via `cat`, never `eval`/`source`; `${2:?--from-trace needs a file}` + `set -u` catch a missing arg.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] --self-test exit-code contract contradiction in the plan**
- **Found during:** Task 1 (running the plan's own `<automated>` verify block)
- **Issue:** The plan's task step 8 prose said `--self-test` should print a PASS line and `exit 0` when the zero-finding guard fires. This directly contradicts the binding contract repeated in the plan's `<done>` ("`--self-test` exits NON-zero"), `<acceptance_criteria>` ("exits NON-zero (CLI: `echo $?` != 0)"), `<verification>` ("`--self-test` exits non-zero"), `<success_criteria>`/D-05 ("asserts the fixture exits NON-zero -- proving fail-loudly behavior"), AND the `<automated>` gate itself (`bash ... --self-test; test $? -ne 0 && echo OK-SELFTEST-NONZERO`). An `exit 0` would have failed the plan's own automated verification.
- **Fix:** `--self-test` now prints a `[PASS]` line confirming the guard fired, then prints a `Status: [FAIL] -- self-test exits non-zero by design` line and `exit 1`. The dominant, repeated contract (4 plan sections + D-05 + the automated gate) wins over the single outlier sentence in step 8.
- **Files modified:** tests/D-reviewer-budget.sh
- **Verification:** `bash tests/D-reviewer-budget.sh --self-test; echo $?` -> 1 (non-zero); the plan's automated block now prints `OK-SELFTEST-NONZERO`. Default mode and `--from-trace` still exit 0.
- **Committed in:** 0fef58f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix was necessary to satisfy the plan's own automated verification and the D-05 fail-loudly intent. No scope change -- the fixture, parser, modes, and budgets are exactly as specified.

## Issues Encountered
- The Cygwin `rg` build on this machine misparses the `-E` short flag (treats `-E` as `--encoding`), which produced spurious "unknown encoding" errors and one false-FATAL in the per-commit HEAD-safety assertion. Resolved by using bash native regex matching (`[[ =~ ]]`) for the worktree-namespace assertion instead of `rg -Eq`. Did not affect the committed fixture (which uses `grep -E` only via bash `[[ =~ ]]` internally and never calls the external `rg` binary).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Reviewer half of GATE-01 is green on HEAD. Phase 12's grouped-grammar rewrite of `plugins/lz-advisor/agents/reviewer.md` will flip this fixture RED (self-extract lockstep coupling), then GREEN once the parser is retargeted -- exactly the intended baseline behavior.
- The security half (`tests/D-security-reviewer-budget.sh`) is a sibling deliverable (wave 1) tracked separately; both together complete the Phase 11 GATE-01 baseline.
- The `--from-trace` parser is ready for Phase 13 live `claude -p` trace replay (n>=3 budget-gate runs).

## Self-Check: PASSED

- FOUND: tests/D-reviewer-budget.sh
- FOUND: commit 0fef58f
- default mode exits 0, prints "7 findings parsed", 10/10 assertions pass
- --self-test exits 1 (non-zero); --from-trace exits 0
- ASCII-only confirmed (LC_ALL=C scan returns no non-ASCII bytes)

---
*Phase: 11-fixture-baseline*
*Completed: 2026-06-07*
