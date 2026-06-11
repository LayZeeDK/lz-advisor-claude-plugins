---
phase: quick-260611-c5l
plan: 01
subsystem: testing
tags: [reviewer-agent, security-reviewer-agent, budget-fixture, render-verbatim, code-review]

# Dependency graph
requires:
  - phase: 13-empirical-verification
    provides: the grouped spelled-out grammar + the two budget regression fixtures (GATE-01/GATE-02) this task tightens
provides:
  - Reviewer/security-reviewer agent prompts with consistent hedge placement, repointed example references, consolidated CVE carve-out prose, demoted Severity-sections heading, genericized provenance, and keep-in-sync maintenance notes
  - Both budget fixtures with max_count=15 + Per-finding validation 60w/entry assertions, a non-fatal 22w soft-target warning, a generic next-### extraction boundary in the reviewer fixture, and a prefix-tolerant SEV_HEADERS
  - Two review skills acknowledging the optional ### Per-finding validation + ### Missed surfaces pass-through sections
  - context-packaging.md severity field de-duplicated with plural Suggestions wording
affects: [v1.0.1 PR #1 merge, future reviewer/security-reviewer prompt edits]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Generic next-### extraction boundary shared in shape (not code, per D-10) across both budget fixtures"
    - "Optional-section skip-when-absent assertion pattern (Per-finding validation, Missed surfaces)"
    - "Non-fatal soft-target [WARN] that never increments FAIL_COUNT (decouples the 22w target from the 28w hard cap)"

key-files:
  created:
    - .planning/quick/260611-c5l-address-all-review-findings/260611-c5l-SUMMARY.md
  modified:
    - plugins/lz-advisor/agents/reviewer.md
    - plugins/lz-advisor/agents/security-reviewer.md
    - tests/D-reviewer-budget.sh
    - tests/D-security-reviewer-budget.sh
    - plugins/lz-advisor/skills/review/SKILL.md
    - plugins/lz-advisor/skills/security-review/SKILL.md
    - plugins/lz-advisor/references/context-packaging.md

key-decisions:
  - "Finding #10 (fixture dedup into a shared helper) is WON'T-FIX -- it reverses Phase 11 D-10"
  - "Finding #6 keeps Hedge Marker Discipline duplicated (agents do NOT @-load references); added a keep-in-sync note instead of extracting"
  - "Finding #1 resolved by the PREFERRED section-move of the standalone teaching example to ### Suggestions (outside the self-extract blockquote), plus a placement note on the holistic finding 3 (outside its blockquote)"

patterns-established:
  - "Budget fixtures assert max_count + PFV with skip-when-absent on the holistic baselines"
  - "Soft target (22w) is a warning; the hard cap (28w / 75w auto-clarity) is the gate"

requirements-completed: [REVIEW-PR1]

# Metrics
duration: ~20min
completed: 2026-06-11
---

# Quick Task 260611-c5l: Address all review findings Summary

**Folded the verified /code-review findings on PR #1 into the unmerged 1.0.1: consistent hedge placement, max_count + Per-finding-validation budget assertions, a prefix-tolerant SEV_HEADERS, and a generic extraction boundary -- all 4 fixture modes stay GREEN (0/0/1/1) and the render-verbatim header set is byte-unchanged.**

## Performance

- **Duration:** ~20 min
- **Tasks:** 3 (all `type="auto"`)
- **Files modified:** 7
- **Commits:** 3 atomic task commits

## Accomplishments

- 11 planned findings (#1, #2, #3, #4, #5, #6, #7, #8, #9, #11, #12) applied; #10 recorded WON'T-FIX
- Both budget fixtures gained two assertions each (reviewer 10 -> 12, security 9 -> 11): the `max_count=15` ceiling and the Per-finding-validation 60w/entry cap (skip-when-absent on the holistic baselines), plus a non-fatal 22w soft-target `[WARN]` that respects the security auto-clarity carve-out and never changes exit codes
- Render-verbatim contract preserved: the five contract headers per agent are byte-unchanged; the demoted `### Severity sections` heading was a prompt body heading, not an output contract header
- No version surface touched (plugin.json + 4 SKILL.md `version:` fields all unchanged at 1.0.1)

## Task Commits

Each task was committed atomically:

1. **Task 1: Agent-prompt consistency + cleanup fixes (#1, #5, #6, #8, #9, #12)** - `62028cb` (fix)
2. **Task 2: Budget-fixture coverage + robustness fixes (#2, #3, #4)** - `b329954` (test)
3. **Task 3: Skill output-shape + reference-doc prose fixes (#7, #11)** - `5b57a0a` (docs)

## Files Created/Modified

- `plugins/lz-advisor/agents/reviewer.md` - Demoted `### Severity sections` to bold prose (#9), genericized stale run-id provenance (#12), added Hedge Marker Discipline keep-in-sync note (#6)
- `plugins/lz-advisor/agents/security-reviewer.md` - Moved the standalone CORS hedge example to `### Suggestions` (#1) + holistic-finding-3 placement note, repointed the dangling "example 3" reference (#5), trimmed the redundant 75w CVE carve-out prose restatement (#8), demoted `### Severity sections` (#9), genericized provenance (#12), added keep-in-sync note (#6)
- `tests/D-reviewer-budget.sh` - Added `MAX_COUNT`/`PFV_CAP`/`SOFT_TARGET` constants, max_count + PFV assertions, 22w soft-target warning, `extract_section()` helper with generic next-`### ` boundary (#2, #3), dropped trailing `$` from SEV_HEADERS (#4)
- `tests/D-security-reviewer-budget.sh` - Added `MAX_COUNT`/`PFV_CAP`/`SOFT_TARGET` constants, max_count + PFV assertions, carve-out-respecting 22w soft-target warning (#2), dropped trailing `$` from SEV_HEADERS (#4)
- `plugins/lz-advisor/skills/review/SKILL.md` - Pass-through note for optional `### Per-finding validation` + `### Missed surfaces` (#7)
- `plugins/lz-advisor/skills/security-review/SKILL.md` - Same pass-through note, referencing `### Threat Patterns` (#7)
- `plugins/lz-advisor/references/context-packaging.md` - De-duplicated the severity field clause, plural `Suggestions` (#11)

## Decisions Made

### Finding #10 -- WON'T-FIX (deduplicate the two fixtures into a shared helper)

Recorded as WON'T-FIX. Deduplicating the two budget fixtures into a shared helper library (or a parameterized single script) would **reverse Phase 11 D-10** (`.planning/phases/11-fixture-baseline/11-CONTEXT.md:34`, decided 2026-06-07, this same milestone): "Two standalone scripts (no shared helper lib, no parameterized single script) ... duplication across exactly 2 zero-dependency files is acceptable and keeps each gate independently runnable." The narrower #3 asymmetry fix WAS applied -- the reviewer fixture now uses a generic next-`### ` extraction boundary via its OWN `extract_section()` helper, aligning the boundary LOGIC with the security fixture's helper of the same name without merging the two files. Each gate stays independently runnable with no shared dependency. The duplication is the locked, intentional design; D-10 is not reversed.

### Finding #6 -- duplication retained (not extracted)

Pre-verified during planning and re-confirmed: the agents reference `references/context-packaging.md` only in PROSE; they do NOT `@`-load it. Extracting the "Hedge Marker Discipline" section to a shared reference would silently drop the content from each system prompt. The duplication is retained; a one-line keep-in-sync maintenance note was added to the top of the `## Hedge Marker Discipline` section in both agents, each naming the correct sibling filename.

### Finding #1 -- section-move (PREFERRED resolution)

The standalone teaching example (security-reviewer.md, formerly under `### Important`) was moved to `### Suggestions` to agree with the `:470` rule (an unconfirmed security-clearance hedge sits under `### Suggestions` until verified). This example is OUTSIDE the self-extracted holistic blockquote, so the fixture baseline did not shift. Per the PLAN-CHECKER warning, the holistic example's finding 3 (inside the self-extract blockquote, under `### Important`) was NOT edited; instead a one-clause prose note was added to the holistic example's word-count-breakdown paragraph (outside the blockquote) explaining that the holistic finding 3 illustrates the post-verification (confirmed) `### Important` placement, while the standalone example shows the pre-verification (unconfirmed) `### Suggestions` placement.

## Deviations from Plan

None - plan executed exactly as written. All 11 planned findings were applied via their PREFERRED / MINIMAL SAFE resolutions; no finding had to be deferred-and-left.

### Finding-#8 and Finding-#12 deferral status

No deferrals were needed:

- **#8 (CVE carve-out consolidation):** The `<auto_clarity_carve_out cap="75">` element remains the canonical source. The redundant FULL-PROSE restatement at the "Auto-clarity (Class 2-S security carve-out)" block was trimmed to a short reference that explicitly defers to the element. The FIX-4 concision rule (~line 107) was left intact -- it already defers to the element ("see the `<auto_clarity_carve_out>` element") and serves the distinct purpose of gating bracket-less findings to terse output, so trimming it would have disturbed the FIX-4 worked-example cross-reference. The "Auto-clarity (bracket-gated ...)" block was kept as the surviving readable prose pointer (it already self-admits it "mirrors" the element). The 75w value, the `[CVE]`/`[GHSA]`/`[CWE]` bracket-gating (D-09), and the holistic CVE finding (36w) are all unchanged.
- **#12 (stale run-id provenance):** Every targeted run-id citation in both agents was successfully genericized to "a documented anti-pattern" / "documented over-caps" -- `git grep` for `review-2|review-3|review-4|security-1|r2-security-1|security-3 F8|security-2|security-3 F2` over the agents returns no matches. No FIX-* rule ID was renamed (security count 16, reviewer count 13, both unchanged from baseline).

## Issues Encountered

None. The baseline was confirmed GREEN (reviewer 10/10, 7 findings; security 9/9, 6 findings; both `--self-test` exit 1) before any edit, and the four-mode matrix was re-asserted after every agent/fixture edit and at the end of Tasks 1 and 2.

## Verification

- **Four-mode matrix (final):** `bash tests/D-reviewer-budget.sh` exit 0; `bash tests/D-security-reviewer-budget.sh` exit 0; both `--self-test` exit 1. GREEN.
- **Assertion counts increased:** reviewer 10 -> 12, security 9 -> 11 (max_count + PFV-absent-skip on each).
- **Render-verbatim headers byte-unchanged:** reviewer 6, security 6 (the five contract headers + the holistic-example duplicates).
- **No version surface touched:** plugin.json porcelain empty; all four SKILL.md `version:` fields still `1.0.1`.
- **Scope confined:** all three commits touch only `plugins/lz-advisor/` and `tests/`; no file deletions across the three commits.
- **`### Severity sections` demoted:** `git grep -c "^### Severity sections"` returns no match in either agent.
- **SEV_HEADERS prefix-tolerant:** no trailing `$` in either fixture; finding parse counts unchanged (7 reviewer, 6 security).
- **PFV pass-through documented:** `### Per-finding validation` now appears in both skills' output-shape blocks (review -> `### Cross-Cutting Patterns`, security -> `### Threat Patterns`).
- **Duplicated severity clause gone:** the redundant context-packaging.md clause no longer matches; the lowercase `severity=` machine attribute is untouched.

## Next Phase Readiness

- The PR #1 (v1.0.1) corrections are folded in; both regression gates stay GREEN and the render-verbatim contract is intact.
- No blockers. The deferred FIX-R2-D (gate tolerance band) remains a flagged product-contract decision the user may settle independently; it is NOT part of this task and was NOT touched.

## Self-Check: PASSED

All 7 modified files + the SUMMARY exist on disk; all three task commits (`62028cb`, `b329954`, `5b57a0a`) are present in `git log`.

---
*Phase: quick-260611-c5l*
*Completed: 2026-06-11*
