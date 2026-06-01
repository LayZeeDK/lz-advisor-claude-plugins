---
phase: 09-rename-skills
plan: 02
subsystem: docs
tags: [skill-rename, claude-code-plugin, evals, smoke-tests, headless-invocation]

# Dependency graph
requires:
  - phase: 05.2-rename-skills-and-resolve-preamble-waste-for-advisor-agent
    provides: the dotted lz-advisor.<skill> convention this plan reverses (D-01/D-02)
provides:
  - CLAUDE.md rewritten to the plain-name skill convention with clean qualified lz-advisor:<skill> forms
  - 4 eval JSON query strings + conciseness-assessment.md de-prefixed (bare skill name)
  - 4 eval workspace directories renamed via git mv (history preserved)
  - 11 maintained smoke fixtures qualified to headless /lz-advisor:<skill> -p strings (D-07)
affects: [09-01-plugin-rename, 09-03-resolution-probe, milestone-audit]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Context-dependent invocation policy (D-07): bare /<skill> interactive, qualified /lz-advisor:<skill> headless"
    - "Occurrence-count verification (git grep -o | wc -l) over line-count for multi-ref lines"

key-files:
  created:
    - .planning/phases/09-rename-skills/deferred-items.md
  modified:
    - CLAUDE.md
    - evals/lz-advisor/lz-advisor-plan-eval.json
    - evals/lz-advisor/lz-advisor-execute-eval.json
    - evals/lz-advisor/lz-advisor-review-eval.json
    - evals/lz-advisor/lz-advisor-security-review-eval.json
    - evals/lz-advisor/conciseness-assessment.md
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/*.sh (11 fixtures)

key-decisions:
  - "L212 normalization gotcha rewritten semantically: clean lz-advisor:<skill> form, no dot-to-hyphen artifact"
  - "Eval prompts use bare skill name (description-matching, not slash resolution; RESEARCH Open Question 1)"
  - "HIA-discipline.sh skill-dir path ref retargeted to skills/plan/ to match Plan 09-01 directory rename"

patterns-established:
  - "Eval JSON filenames stay hyphenated (plugin-prefix convention); only content query strings change"
  - "Directory-path references to renamed skill dirs become plain skills/<skill>/, not slash-command colon forms"

requirements-completed: [D-05, D-06, D-07, D-09]

# Metrics
duration: 6min
completed: 2026-06-01
---

# Phase 9 Plan 02: Rename Skills -- Docs, Evals, and Smoke-Fixture Sweep Summary

**Swept the dotted `lz-advisor.<skill>` convention out of CLAUDE.md, the eval infrastructure (4 JSON query strings + conciseness-assessment.md + 4 git-mv'd workspace dirs), and the 11 maintained regression-gate smoke fixtures, applying the D-07 context-dependent invocation policy (qualified `/lz-advisor:<skill>` headless).**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-01T06:32:16Z
- **Completed:** 2026-06-01T06:38:20Z
- **Tasks:** 3
- **Files modified:** 25 (+ 1 created: deferred-items.md)

## Accomplishments

- **CLAUDE.md per-line semantic rewrite:** directory-structure diagram (`lz-advisor.plan/` -> `plan/`), qualified-form comments (`lz-advisor:lz-advisor.plan` -> `lz-advisor:plan`), the L78 table, the L145 naming-convention prose (reverses Phase 5.2 D-08 to describe the plain-name convention), all 6 headless `claude -p` example strings (dot -> colon), and the L212 normalization gotcha (semantic rewrite to the clean `lz-advisor:<skill>` form with no stale dot-to-hyphen warning).
- **Eval infrastructure de-prefixed:** 4 JSON query strings and 5 conciseness-assessment.md prompts now use the bare skill name; 4 eval workspace directories renamed via `git mv` (history preserved, shown as `R` renames). The 4 hyphenated eval JSON filenames are unchanged (RESEARCH Pitfall 5).
- **11 maintained smoke fixtures qualified:** 20 headless `-p "/lz-advisor:<skill> ..."` slash-command strings (D-07; the picker-less headless path needs qualification so bare `/review` / `/security-review` cannot resolve to Claude Code built-ins), plus the HIA-discipline.sh skill-directory path reference retargeted to `skills/plan/`.
- **D-06 scope discipline preserved:** 367 frozen `.planning/` artifacts retain their accurate dotted history refs; no frozen file touched.

## Task Commits

Each task was committed atomically (`--no-verify`, by-name staging, parallel-worktree isolation):

1. **Task 1: CLAUDE.md per-line transform** - `4999e37` (docs)
2. **Task 2: Eval infrastructure (JSON + conciseness + git mv workspaces)** - `07c3af7` (refactor)
3. **Task 3: Maintained smoke fixtures qualified** - `f7a94af` (test)

## Files Created/Modified

- `CLAUDE.md` - plain-name skill convention, clean qualified forms, qualified headless example strings, semantically rewritten L212 note
- `evals/lz-advisor/lz-advisor-{plan,execute,review,security-review}-eval.json` - bare skill name in the dotted query string (filenames unchanged)
- `evals/lz-advisor/conciseness-assessment.md` - 5 prompts/placeholder de-prefixed to bare `/<skill>` form
- `evals/lz-advisor/{plan,execute,review,security-review}-workspace/` - renamed via git mv from `lz-advisor.<skill>-workspace/`
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/*.sh` (11 files) - qualified `-p` strings; HIA path ref retargeted
- `.planning/phases/09-rename-skills/deferred-items.md` - logged 1 pre-existing out-of-scope defect

## Decisions Made

- **L212 normalization gotcha is a semantic rewrite, not a token swap.** After the directory rename the skill directory is `execute` (no dot), so the qualified name is simply `lz-advisor:execute` with no dot-to-hyphen normalization artifact. The note now states the clean form directly and removes the stale "normalizes dot -> hyphen" warning (D-09).
- **Eval prompts use the bare skill name.** Evals exercise description-matching, not headless slash resolution, so they are not subject to the headless built-in collision (RESEARCH Open Question 1 recommendation).
- **The 4 eval JSON filenames stay hyphenated.** `lz-advisor-plan-eval.json` uses the plugin-prefix hyphen convention, not the dotted skill name; renaming would break the eval pipeline's file expectations (RESEARCH Pitfall 5).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Retargeted HIA-discipline.sh skill-directory path reference**
- **Found during:** Task 3 (smoke-fixture sweep)
- **Issue:** HIA-discipline.sh:38 references the skill directory path `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` in a `git grep` assertion. Plan 09-01 (the parallel wave-1 agent) renames that directory to `skills/plan/`. Leaving the dotted path would make the assertion target a directory that no longer exists after the wave merges, breaking the gate. The plan's interfaces list only enumerated the `-p` slash-command strings, but this path reference is the same dotted skill-name token and matches the sweep regex.
- **Fix:** Retargeted to `plugins/lz-advisor/skills/plan/SKILL.md` (plain skill-name directory, matching the 09-01 rename). This is a directory path, NOT a `/lz-advisor:plan` slash-command form.
- **Files modified:** `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/HIA-discipline.sh`
- **Verification:** `git grep` confirms the path is now `skills/plan/SKILL.md`; the file has zero dotted residue.
- **Committed in:** `f7a94af` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking). **Impact on plan:** Necessary for cross-plan gate consistency once Plan 09-01's directory rename merges. No scope creep -- the path reference is in the same in-scope file and is the same dotted token the sweep targets.

### Acceptance-count note (not a deviation, a clarification)

Task 3 acceptance criterion 2 literally expected `git grep -o /lz-advisor:(...) | wc -l == 21`. The observed count is **20**. This is correct: of the 21 dotted refs in the 11 fixtures, 20 are `-p` slash-command strings (now qualified colon forms) and the 21st (HIA-discipline.sh:38) was a directory PATH reference, correctly transformed to `skills/plan/` rather than a `/lz-advisor:plan` slash form. The literal `==21` count conflated the path reference with the slash-command forms; the load-bearing criteria -- zero dotted residue (V2 EMPTY) and all 21 dotted refs swept -- both hold.

## Issues Encountered

None. All three tasks executed cleanly. One pre-existing out-of-scope defect was logged but not fixed (see Deferred Issues).

## Deferred Issues

**DEF-09-01: J-narrative-isolation.sh uses `grep -q`** (logged to `.planning/phases/09-rename-skills/deferred-items.md`). The fixture's assertion at line 37 uses `grep -q` rather than `rg -q`; on this Windows arm64 box `grep` returns silent zero results. Pre-existing defect unrelated to the rename task -- out of scope per D-05/D-06. Recommended one-line fix in a future maintenance pass.

## Known Stubs

None. This plan edits documentation, eval prompts, and shell-fixture invocation strings only -- no data-rendering code, no hardcoded empty values, no placeholder UI.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- This plan (wave 1) ran in worktree isolation alongside Plan 09-01 (the plugin rename: 4 skill directory `git mv` + `name:`/version surfaces). The orchestrator merges both wave-1 worktrees, after which the HIA-discipline.sh `skills/plan/` path reference resolves correctly.
- **The D-08 headless resolution probe is NOT run by this plan.** Per the phase structure and the threat register (T-09-05), the `claude -p` probe asserting `<command-name>/lz-advisor:plan</command-name>` for all 4 skills is owned by the downstream resolution-probe plan (09-03) / phase verification, executed after the directory renames land. The documented headless `-p` strings in this plan's fixtures and CLAUDE.md are written to the qualified form D-07 specifies and the probe is expected to confirm.
- STATE.md / ROADMAP.md are intentionally NOT updated here -- the orchestrator owns those writes after all wave agents complete.

## Self-Check: PASSED

- FOUND: `.planning/phases/09-rename-skills/09-02-SUMMARY.md`
- FOUND: `.planning/phases/09-rename-skills/deferred-items.md`
- FOUND: 4 renamed eval workspace dirs (plan/execute/review/security-review)-workspace
- FOUND commits: `4999e37`, `07c3af7`, `f7a94af`

---
*Phase: 09-rename-skills*
*Completed: 2026-06-01*
