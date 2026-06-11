---
phase: 11-fixture-baseline
plan: 02
subsystem: testing
tags: [bash, smoke-fixture, fragment-grammar, owasp, word-budget, regression-gate, security-reviewer]

# Dependency graph
requires:
  - phase: 09-skill-rename
    provides: "plugins/lz-advisor/agents/security-reviewer.md post-reorg path (the self-extract source of truth)"
provides:
  - "tests/D-security-reviewer-budget.sh -- the security half of the Phase 11 regression baseline (GATE-01 security half)"
  - "A reusable 4-slot OWASP fragment-grammar parser + per-section budget asserter with a --from-trace replay mode for Phase 13 live claude -p captures"
  - "An anti-vacuous matched_count >= 5 guard + --self-test fail-loudly proof (silent-pass detection for the regression gate)"
affects: [12-grouped-grammar-rewrite, 13-live-budget-gate]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Self-extracting smoke fixture: the agent markdown holistic worked example IS the baseline input; the fixture awk-ranges + de-quotes it (Phase 12 lockstep coupling)"
    - "Anti-vacuous guard before the budget loop: matched_count >= MIN_FINDINGS exits non-zero on a zero-match regex so the gate can never pass vacuously"
    - "Parser-layer tolerance only: 75w auto-clarity outlier cap lives in the fixture, never in the agent <output_constraints> (D-07 ef97e21 precedent)"

key-files:
  created:
    - "tests/D-security-reviewer-budget.sh"
  modified: []

key-decisions:
  - "Author against the CURRENT shorthand grammar (crit/imp/sug/q + OWASP [Axx]), NOT the grouped grammar -- Phase 11 is build-order step 0; baseline must be GREEN on HEAD"
  - "Security holistic example has 6 fragment-grammar findings (5 normal + 1 CVE auto-clarity), NOT 7; MIN_FINDINGS=5 leaves headroom of 1 (PATTERNS correction)"
  - "CVE auto-clarity finding (36w measured) passes under the 75w cap via [CVE|GHSA|CWE bracket detection, NOT the 28w per-entry cap (Pitfall 3)"
  - "--self-test exits NON-zero by design (the plan's acceptance criterion is authoritative over the RESEARCH code example which exited 0)"
  - "verify_request lines are SKIPPED (not counted, not budget-checked) -- they trail the affected finding as a separate line"

patterns-established:
  - "Three-mode smoke fixture: default self-extract / --from-trace <file> / --self-test"
  - "T-11-01 mitigation: quote $TRACE_FILE at the read site, read via cat (never eval/source), ${2:?} catches a missing arg under set -u"

requirements-completed: [GATE-01]

# Metrics
duration: 18min
completed: 2026-06-07
---

# Phase 11 Plan 02: Security-reviewer budget smoke fixture Summary

**Standalone bash smoke fixture that self-extracts the 6-finding 4-slot OWASP holistic example from security-reviewer.md, asserts per-section word budgets with a 75w auto-clarity carve-out for CVE/GHSA/CWE findings, and exits green on the current shorthand grammar (GATE-01 security half).**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-07
- **Completed:** 2026-06-07
- **Tasks:** 1
- **Files modified:** 1 (created)

## Accomplishments
- Authored `tests/D-security-reviewer-budget.sh` (216 lines, standalone, zero-dependency, ASCII-only) following the `validate-phase-03.sh` house style.
- Default self-extract mode parses exactly 6 fragment-grammar findings (verify_request line skipped) and exits 0 against the live agent prompt.
- Anti-vacuous `matched_count >= 5` guard runs BEFORE the per-section budget loop and prints the parsed count (D-04/D-06 silent-pass detection).
- 75w auto-clarity outlier cap (RES-PFV-OUTLIER-CAP) correctly admits the 36w CVE finding while the 5 normal findings (17/9/15/9/13w) hold the 28w per-entry cap.
- `--self-test` feeds zero-finding input and exits non-zero (fail-loudly proof); `--from-trace <file>` replays a captured report through the same parser (Phase 13 capability).

## Task Commits

Each task was committed atomically:

1. **Task 1: Author tests/D-security-reviewer-budget.sh (4-slot OWASP security budget smoke fixture, green on HEAD)** - `c75ec93` (test)

## Files Created/Modified
- `tests/D-security-reviewer-budget.sh` - Three-mode (default self-extract / --from-trace / --self-test) bash smoke fixture. Parses the 4-slot security fragment grammar (`<file>:<line>: <severity>: [<OWASP-tag>] <threat>. <fix>.`), skips `<verify_request>` lines, enforces an anti-vacuous `matched_count >= 5` guard, then asserts per-finding (<=28w, or <=75w for CVE/GHSA/CWE auto-clarity findings), threat_patterns (<=160w), and missed_surfaces (<=30w, when present) budgets.

## Decisions Made
- **Author against current shorthand grammar, not grouped:** Phase 11 is the build-order-zero baseline; the fixture must be GREEN on HEAD so Phase 12's grouped-grammar rewrite has something to flip RED. The grouped grammar does not exist yet.
- **6 findings, not 7:** Verified against the live agent file (5 normal findings at security-reviewer.md:135-139 + 1 CVE auto-clarity at :141; the verify_request at :140 is skipped). The PATTERNS correction is authoritative; MIN_FINDINGS=5 keeps headroom of 1.
- **CVE detection on the body retaining the `[CVE-...]` token:** The prefix-strip removes `<file>:<line>: <severity>: [<OWASP-tag>] ` (the OWASP tag `[A06]`), but the body still carries the inner `[CVE-2025-1234]` bracket, so `[[ =~ \[(CVE|GHSA|CWE) ]]` correctly triggers the 75w carve-out. Measured 36w (RESEARCH said 35w; the 1-word difference is `wc -w` tokenization of `some-pkg@<2.4.1` and is harmless -- both pass 75w and fail 28w as intended).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] --self-test exit-code semantics corrected to match the binding acceptance criterion**
- **Found during:** Task 1 (verification of the three modes)
- **Issue:** The RESEARCH.md code example (lines 353-363) had `--self-test` print a `[PASS]` line and `exit 0` when the anti-vacuous guard fired. The PLAN's task spec, `<done>` criteria, and `acceptance_criteria` all explicitly require `bash tests/D-security-reviewer-budget.sh --self-test` to exit NON-zero. As first written, the fixture exited 0 on self-test, contradicting the authoritative acceptance criterion.
- **Fix:** Changed the guard-fired branch to emit an `[OK]` line explaining that the non-zero exit IS the fail-loudly proof, and `exit 1`. A green (0) run on zero-finding input is now treated as the defect. The fail-to-trip branch also exits 1 (correct -- a parser that matches findings in synthetic empty input is a silent-pass defect).
- **Files modified:** tests/D-security-reviewer-budget.sh
- **Verification:** `bash tests/D-security-reviewer-budget.sh --self-test; echo $?` prints 1; default mode still exits 0; the plan's exact automated verify command passes.
- **Committed in:** `c75ec93` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix aligns the deliverable with the binding acceptance criterion (`--self-test` exits non-zero). No scope change; the fail-loudly behavior is now correct and the gate is provably non-vacuous.

## Issues Encountered
- **Naive awk range over-captured the worked example.** A first-pass `awk` range from `> ### Findings` to the Missed-surfaces blank line swallowed the prose "Word count breakdown:" paragraph at security-reviewer.md:151. Fixed by terminating the range at the first non-blockquote line AFTER the Missed-surfaces heading (`f && m && !/^>/ { exit }`), validated empirically before writing the script. Resolved during authoring; no impact on the committed fixture.

## User Setup Required
None - no external service configuration required. The fixture is pure bash + bundled coreutils (wc, sed, awk), runnable green from repo root at zero session-pool cost.

## Next Phase Readiness
- GATE-01 security half satisfied: `tests/D-security-reviewer-budget.sh` is committed, tracked, and green on HEAD.
- Phase 12 retargets this fixture to the grouped grammar in lockstep (RED-on-old, GREEN-on-new); the FRAGMENT_RE + the de-quote/awk-range self-extract are the coupling points to update.
- Phase 13 reuses the same parser via `--from-trace` against captured live `claude -p` responses (no live invocation lives in the fixture per D-03).
- Sibling reviewer fixture (`tests/D-reviewer-budget.sh`, 3-slot, Cross-Cutting Patterns) is the wave's other half (Plan 11-01).

## Self-Check: PASSED
- `tests/D-security-reviewer-budget.sh` exists (created, 216 lines).
- Commit `c75ec93` exists in the branch history.
- Default mode exits 0 and prints "6 findings parsed"; `--self-test` exits non-zero; `--from-trace` replays green; ASCII-only verified; no Cross-Cutting Patterns reference; FRAGMENT_RE includes the OWASP `\[[^]]+\]` slot; AUTO_CLARITY_CAP=75 keyed on CVE|GHSA|CWE.

---
*Phase: 11-fixture-baseline*
*Completed: 2026-06-07*
