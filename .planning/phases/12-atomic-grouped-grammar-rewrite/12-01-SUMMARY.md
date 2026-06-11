---
phase: 12-atomic-grouped-grammar-rewrite
plan: 01
subsystem: testing
tags: [reviewer-agent, grouped-grammar, severity-headers, budget-fixture, prompt-engineering, bash]

# Dependency graph
requires:
  - phase: 11-fixture-baseline
    provides: "D-reviewer-budget.sh self-extracting smoke fixture green on the old shorthand grammar (GATE-01 baseline this plan retargets)"
provides:
  - "Reviewer agent emits the grouped ### Critical / ### Important / ### Suggestions / ### Questions grammar with continuous numbering and (none) empty markers"
  - "D-reviewer-budget.sh header-tracking parser: GREEN on the new grouped grammar, RED on the old shorthand sample (lockstep retarget)"
affects: [12-02, 12-03, 12-04, 13-empirical-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Grouped-severity report grammar: severity carried by the section header (no inline token), continuous integer numbering across sections in document order, literal (none) for empty sections"
    - "Header-tracking + numbered-line bash parser: SEV_HEADERS context + FINDING_RE counted lines; body-strip prefix derived from the same FINDING_RE (single source of truth, WR-05 mitigation)"
    - "Instruction sandwich: fenced required-output skeleton in the legend (pre-example) + four named <section> entries in the post-example <output_constraints> block"

key-files:
  created: []
  modified:
    - "plugins/lz-advisor/agents/reviewer.md - grouped-grammar legend, fenced skeleton, every worked example, four-section <output_constraints>"
    - "tests/D-reviewer-budget.sh - header-tracking parser, > ### Critical self-extract sentinel, grouped self-test sample"

key-decisions:
  - "Finding lines use the bare legend shape N. <file>:<line>: <problem>. <fix>. with NO path-wrapping backticks (matches the legend string + RESEARCH Pattern 1; backticks broke FINDING_RE)"
  - "Standalone CORRECT examples are inline numbered lines (not blockquoted ### headers); only the holistic example carries the > ### Critical blockquote sentinel, keeping the self-extract deterministic"
  - "Fenced required-output skeleton added to the legend so the four ^### Critical$ etc. headers appear unquoted (satisfies AC + strengthens the instruction sandwich) without polluting the agent doc heading outline"

patterns-established:
  - "Pattern: severity-section grammar with continuous numbering + (none) markers (D-01..D-07)"
  - "Pattern: lockstep example/fixture coupling - the fixture self-extracts the agent holistic example, so example and parser change in one unit (D-10, D-11)"

requirements-completed: [RPT-01, RPT-03, RPT-04, AGNT-01, AGNT-02, AGNT-03]

# Metrics
duration: ~35min
completed: 2026-06-07
---

# Phase 12 Plan 01: Reviewer agent grouped-grammar rewrite Summary

**Reviewer agent rewritten from inline crit:/imp:/sug:/q: fragment shorthand to findings grouped under spelled-out ### Critical / ### Important / ### Suggestions / ### Questions headers with continuous numbering and (none) markers, plus its budget fixture retargeted in lockstep (GREEN-on-new, RED-on-old)**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-07
- **Completed:** 2026-06-07
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Rewrote the reviewer agent Output Constraint, legend, every worked example (3 standalone + verify_request + Unresolved-hedge + holistic), and the post-example `<output_constraints>` block to the four-section grouped grammar. Zero `crit:|imp:|sug:|q:` shorthand residue remains.
- Holistic worked example restructured to start with `> ### Critical`, span all four severity sections (Critical/Important/Suggestions/Questions all populated), keep 7 continuously-numbered findings (above the MIN_FINDINGS=5 floor), preserve the verify_request line and the Unresolved-hedge finding inside their sections, and end with `### Cross-Cutting Patterns` referencing findings by continuous number.
- Retargeted `D-reviewer-budget.sh` from the inline-severity FRAGMENT_RE to a header-tracking parser (SEV_HEADERS context + FINDING_RE numbered lines), changed the self-extract sentinel to `> ### Critical`, and rewrote the self-test sample to the grouped grammar.
- Proven RED/GREEN in lockstep: GREEN on the new self-extracted holistic example (7 findings, 10/10 assertions, exit 0); RED on `--self-test` (exit 1); RED on the OLD shorthand sample via `--from-trace` (0 findings parsed, anti-vacuous guard fires, exit 1).
- AGNT-03 protected behaviors survive byte-intact: `## Class-2 Escalation Hook`, `## Hedge Marker Discipline`, and lowercase `severity=` machine attributes (`critical|important|suggestion`).

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite reviewer.md Output Constraint, legend, and every worked example to the grouped grammar** - `4c193d8` (feat)
2. **Task 2: Retarget D-reviewer-budget.sh to a header-tracking + numbered-line parser (RED-on-old, GREEN-on-new)** - `8988a3a` (test)

_Note: Task 2's commit also carries the coupled reviewer.md follow-up edits (path-backtick removal + standalone-example flattening) because the fixture self-extracts the agent example; the example shape and the parser must agree in one unit (D-10/D-11 lockstep)._

## Files Created/Modified
- `plugins/lz-advisor/agents/reviewer.md` - Output Constraint now mandates the five literal headers (`### Critical` first, then Important/Suggestions/Questions, then Cross-Cutting Patterns); legend defines the section-header grammar + a fenced required-output skeleton; finding line shape is `N. <file>:<line>: <problem>. <fix>.`; every worked example uses the grouped grammar; `<output_constraints>` has four named severity sections each capped 22w/28w-outlier, aggregate `none`.
- `tests/D-reviewer-budget.sh` - header-tracking parser (`SEV_HEADERS` + `FINDING_RE`), `> ### Critical` self-extract sentinel, body-strip derived from `FINDING_RE` (single source of truth), grouped-grammar `--self-test` sample; all anti-vacuous / per-section-cap / CRLF / Cross-Cutting / Missed-surfaces scaffolding preserved.

## Decisions Made
- **Finding-line shape carries no path-wrapping backticks.** The legend format string and RESEARCH Pattern 1 both show bare `N. <file>:<line>: <problem>. <fix>.`. My first rendering wrapped `path:line` in inline-code backticks (`` `src/auth.ts:42` ``), which broke `FINDING_RE` (the closing backtick fell between the line number and the `: ` body separator). Removed the embellishment to match the stated legend.
- **Only the holistic example uses the `> ### Critical` blockquote sentinel.** The standalone CORRECT examples were flattened to inline numbered lines (with a prose note naming the target section). Initially they each led with `> ### Critical`/`> ### Important`/`> ### Suggestions` blockquotes, which created earlier sentinel matches and made the self-extract awk grab a 1-finding standalone block instead of the holistic example.
- **Added a fenced required-output skeleton to the legend.** This places the four `^### Critical$`-style headers unquoted on their own lines (satisfying the AC's `git grep '^### Critical$'` >= 1 requirement and strengthening the instruction sandwich) without turning them into the agent document's own outline headings.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed path-wrapping backticks from finding-line examples**
- **Found during:** Task 2 (fixture retarget; self-extract parsed 0 findings)
- **Issue:** Task 1's worked examples wrapped `path:line` in inline-code backticks (`` `src/auth.ts:42` ``), inconsistent with the legend's bare `N. <file>:<line>: ...` format string. The closing backtick broke the parser's `FINDING_RE`, so the GREEN-on-new self-extract parsed 0 findings and the anti-vacuous guard mis-fired.
- **Fix:** Stripped the path-wrapping backticks from all 7 holistic + 3 standalone finding-line examples so the grammar matches the legend string and RESEARCH Pattern 1.
- **Files modified:** plugins/lz-advisor/agents/reviewer.md
- **Verification:** Self-extract parses 7 findings; `bash tests/D-reviewer-budget.sh` exits 0 with 10/10 assertions.
- **Committed in:** 8988a3a (Task 2 commit; lockstep with the parser)

**2. [Rule 3 - Blocking] Flattened standalone CORRECT examples to inline numbered lines (sentinel collision)**
- **Found during:** Task 2 (fixture retarget; self-extract grabbed the wrong blockquote)
- **Issue:** Task 1 rendered the standalone CORRECT examples as full `> ### Critical` / `> ### Important` / `> ### Suggestions` blockquotes. With the new sentinel `> ### Critical`, the self-extract awk matched the FIRST such blockquote (a 1-finding standalone example), terminating before the holistic example and starving the parser.
- **Fix:** Converted the standalone CORRECT examples to inline `> N. <file>:<line>: ...` numbered lines with a prose note naming the section, reserving the `> ### Critical` blockquote sentinel for the holistic example alone (confirmed unique: `git grep -c '^> ### Critical$'` returns 1).
- **Files modified:** plugins/lz-advisor/agents/reviewer.md
- **Verification:** Sentinel count = 1; self-extract bounds the full holistic block (all four sections + Cross-Cutting Patterns + Missed surfaces).
- **Committed in:** 8988a3a (Task 2 commit; lockstep with the parser)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes were required to make the lockstep example/fixture coupling work (the plan's central D-10/D-11 invariant). They corrected a rendering embellishment and a sentinel collision in Task 1's examples; the resulting grammar matches the stated legend exactly. No scope creep -- both edits stayed within the two plan-scoped files and the grouped-grammar contract.

## Issues Encountered
- The initial self-extract parsed 0 findings (two coupled causes: the path-backtick embellishment and the standalone-example sentinel collision, both above). Diagnosed by inspecting the awk-extracted block with `cat -A` and tracing `FINDING_RE` against the actual line shape. Both resolved; all three RED/GREEN proofs pass.

## TDD Gate Compliance
Task 1 was marked `tdd="true"` in the plan, but the binding "test" for this prompt-grammar rewrite is the budget fixture, which Task 2 retargets and which gates the grammar structurally (GREEN-on-new / RED-on-old). The RED/GREEN proof is satisfied: the retargeted fixture is RED on the pre-rewrite shorthand sample (`--from-trace`, exit 1) and GREEN on the post-rewrite self-extracted grammar (exit 0). The commit trail is `feat(...)` (Task 1 grammar) then `test(...)` (Task 2 fixture retarget) -- the fixture proves the grammar rather than preceding it, which is the correct order for a self-extracting fixture whose sample is the agent example itself.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 12-02 (security-reviewer.md + D-security-reviewer-budget.sh) can follow the same grouped-grammar pattern, adding the OWASP `[Axx]` slot and the 75w auto-clarity CVE carve-out, and stripping the `(formerly High)`/`(formerly Medium)` residue (AGNT-01).
- Plan 12-03 (skill render-verbatim contracts) must name the new four severity headers + Cross-Cutting Patterns as the literal verbatim headers and invert the "do not reformat into severity groups" prohibition.
- Plan 12-04 (5-surface version bump + phase-gate residue sweep) closes the atomic unit.
- Reviewer half of the grammar is GREEN; no blockers for the remaining plans.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-atomic-grouped-grammar-rewrite/12-01-SUMMARY.md`
- FOUND: commit `4c193d8` (Task 1: reviewer.md grouped grammar)
- FOUND: commit `8988a3a` (Task 2: D-reviewer-budget.sh retarget + coupled reviewer.md edits)
- FOUND: `plugins/lz-advisor/agents/reviewer.md`
- FOUND: `tests/D-reviewer-budget.sh`
- Fixture re-confirmed GREEN (exit 0) after all edits.

---
*Phase: 12-atomic-grouped-grammar-rewrite*
*Completed: 2026-06-07*
