---
phase: 14-lz-skill-rename
plan: 01
subsystem: infra
tags: [claude-code-plugin, skill-rename, git-mv, command-shadowing, markdown, yaml]

# Dependency graph
requires:
  - phase: 09-skill-rename
    provides: "git mv rename methodology + pathspec-scoped git grep closing gate (commits d88df91 + c21ab2f); the dotted->plain rename template Phase 14 mirrors"
provides:
  - "Four lz-prefixed skill directories (skills/lz-plan, skills/lz-execute, skills/lz-review, skills/lz-security-review) + name: lz-<bare> frontmatter, history-preserved via git mv"
  - "De-shadowed Claude Code built-in /plan, /review, /security-review (qualified invocation is now lz-advisor:lz-<skill>, slash form /lz-<skill>)"
  - "Complete lockstep cross-reference sweep across 13 files; closing 5-pattern git grep gate GREEN at HEAD"
  - "Recorded RENAME-02 interactive-picker verification recipe (human_needed)"
affects: [15-release-publication]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mechanical, behavior-preserving rename: git mv (history) + lockstep cross-ref sweep + identifier-form git grep regression gate, pathspec-scoped to plugins/lz-advisor/"
    - "arm64 leading-slash git-grep hazard mitigated by bracketed [/] gate patterns"

key-files:
  created:
    - .planning/phases/14-lz-skill-rename/14-RENAME-02-PICKER-RECIPE.md
  modified:
    - plugins/lz-advisor/skills/lz-plan/SKILL.md
    - plugins/lz-advisor/skills/lz-execute/SKILL.md
    - plugins/lz-advisor/skills/lz-review/SKILL.md
    - plugins/lz-advisor/skills/lz-security-review/SKILL.md
    - plugins/lz-advisor/README.md
    - plugins/lz-advisor/references/orient-exploration.md
    - plugins/lz-advisor/references/context-packaging.md
    - plugins/lz-advisor/agents/reviewer.md
    - plugins/lz-advisor/agents/security-reviewer.md
    - CLAUDE.md
    - .gitignore
    - evals/lz-advisor/conciseness-assessment.md

key-decisions:
  - "Mirrored Phase 9 two-commit shape: commit 1 = the four git mv + name: fields (pure rename, --follow legibility); commit 2 = the cross-reference sweep"
  - "All four skills lz-prefixed including execute (no built-in twin) for suite consistency + /lz- autocomplete grouping (D-02)"
  - "No version bump / CHANGELOG / What's-New 2.0.0 / tag / Release in Phase 14 -- all Phase 15 (D-09)"
  - "RENAME-02 / SC-4 marked human_needed: bare-form collision is only observable in the interactive command picker; a headless claude -p probe is structurally blind to it (D-10)"

patterns-established:
  - "Gate-correction #2: prose slash-separated skill-name lists (e.g. plan/review) are caught by P3 and get edited to the lz- form for accuracy, never carved out of the gate"

requirements-completed: [RENAME-01, RENAME-03]

# Metrics
duration: 9min
completed: 2026-06-13
---

# Phase 14 Plan 01: lz- skill rename Summary

**Renamed all four lz-advisor skills (plan/execute/review/security-review -> lz-plan/lz-execute/lz-review/lz-security-review) via git mv to de-shadow Claude Code's built-in /plan, /review, /security-review, with a complete lockstep cross-reference sweep and a GREEN 5-pattern arm64-bracketed git grep gate; RENAME-02 picker check recorded as human_needed.**

## Performance

- **Duration:** ~9 min (538s)
- **Started:** 2026-06-13T23:32:08Z
- **Completed:** 2026-06-13T23:41:06Z
- **Tasks:** 2 fully automated (Task 1 rename, Task 2 sweep) + Task 3 automated gate GREEN; Task 3 RENAME-02 picker check recorded human_needed
- **Files modified:** 13 (12 edited + 1 verification artifact created)

## Accomplishments
- 4 skill directories git-mv'd to the lz- prefix with `name: lz-<bare>` frontmatter; history preserved (`git log --follow` resolves through Phase 9 rename commit d88df91 for all 4).
- Lockstep cross-reference sweep across 13 files: plugin README slash refs + What's-New historical tokens, the 4 SKILL.md worked-example invocations + sibling-pointer description prose, references worked scenario + prose slash-lists + 5 directory-form `<bare>/SKILL.md` cross-refs (the GAP-1 class), CLAUDE.md tree comments + claude -p qualified examples + current-state prose, .gitignore comment, eval conciseness runnable prefixes.
- Closing 5-pattern git grep gate prints `[GATE-PASS]` at HEAD: P1-P5 each EXIT 1, A1+A2 hold, all 4 history checks resolve through d88df91.
- LEAVE-list tokens kept byte-intact: `@plans/upstream-review.md` (4 hits), `/plans/` ignore pattern, `<execute>`/`</execute>` XML wrapper (2 hits), quoted natural-language trigger phrases, all 5 version: surfaces at 1.0.1, agent NAME refs (`lz-advisor:advisor`/`reviewer`/`security-reviewer`).
- RENAME-02 / SC-4 interactive-picker recipe recorded verbatim in `14-RENAME-02-PICKER-RECIPE.md`, marked human_needed (NOT auto-passed, NOT a headless probe).

## Task Commits

Each task was committed atomically:

1. **Task 1: git mv four skill dirs + rename name: fields (RENAME-01)** - `e52a7bb` (refactor)
2. **Task 2: lockstep cross-reference sweep (RENAME-03)** - `f9636b8` (refactor)
3. **Task 3: closing gate + history check + RENAME-02 recipe** - verification-only; produced `14-RENAME-02-PICKER-RECIPE.md` (committed with plan metadata). No source edits.

**Plan metadata:** see final docs(14-01) commit (SUMMARY + STATE + ROADMAP + REQUIREMENTS + picker recipe).

## Files Created/Modified
- `plugins/lz-advisor/skills/lz-plan/SKILL.md` - renamed dir + `name: lz-plan`; worked-example + sibling-pointer prose retargeted
- `plugins/lz-advisor/skills/lz-execute/SKILL.md` - renamed dir + `name: lz-execute`; worked-example + description prose retargeted
- `plugins/lz-advisor/skills/lz-review/SKILL.md` - renamed dir + `name: lz-review`; worked-example + `/lz-security-review` refs + description prose retargeted
- `plugins/lz-advisor/skills/lz-security-review/SKILL.md` - renamed dir + `name: lz-security-review`; worked-example + description prose retargeted
- `plugins/lz-advisor/README.md` - command table rows, prose, What's-New historical slash tokens -> /lz-*
- `plugins/lz-advisor/references/orient-exploration.md` - worked-scenario invocations (:149/:150/:152) + the plan/review prose slash-list (:130) -> lz- forms
- `plugins/lz-advisor/references/context-packaging.md` - pv-* prose slash-lists (:54/:58) + 3 directory-form cross-refs (:373/:417/:418) -> lz- forms
- `plugins/lz-advisor/agents/reviewer.md` - `review/SKILL.md` -> `lz-review/SKILL.md` (:388)
- `plugins/lz-advisor/agents/security-reviewer.md` - `review/SKILL.md` -> `lz-review/SKILL.md` (:410)
- `CLAUDE.md` - tree dir labels + comments, claude -p qualified examples, current-state prose -> lz-advisor:lz-*
- `.gitignore` - comment `/plan` -> `/lz-plan` (ignore pattern `/plans/` unchanged)
- `evals/lz-advisor/conciseness-assessment.md` - runnable invocation prefixes (:18/:31/:45/:59) -> /lz-*
- `.planning/phases/14-lz-skill-rename/14-RENAME-02-PICKER-RECIPE.md` - RENAME-02 interactive-picker verification recipe (human_needed)

## Decisions Made
- Followed the Phase 9 two-commit shape (pure-move commit, then sweep commit) for `git log --follow` legibility, as recommended by RESEARCH.
- No version/CHANGELOG/release work performed (D-09 / Phase 15 boundary): all 5 version surfaces stay at 1.0.1; plugin.json byte-unchanged from HEAD.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Edited the prose slash-list `plan/review` at orient-exploration.md:130**
- **Found during:** Task 2 (cross-reference sweep), surfaced by the P3 gate.
- **Issue:** RESEARCH judged line 130 "gate-invisible" (bare prose nouns "plan-skill"/"execute-skill"), but the line also contains the slash-separated prose list `prior plan/review passed to security-review`. The `/review` inside `plan/review` IS matched by P3 (`[^<][/](...)`), so the gate false-RED'd. This is exactly the gate-correction #2 class (English "and/or" separator in prose).
- **Fix:** Edited only `plan/review` -> `lz-plan/lz-review` (the slash-separated noun list); left the bare nouns "plan-skill"/"execute-skill" and the trailing bare `security-review` verbatim. Per the locked gate-correction #2 disposition, prose slash-lists are edited for accuracy, NOT carved out of the gate.
- **Files modified:** plugins/lz-advisor/references/orient-exploration.md
- **Verification:** P3 re-ran EXIT 1 (GREEN); the full combined gate prints [GATE-PASS].
- **Committed in:** f9636b8 (Task 2 commit)

**2. [Rule 1 - Accuracy] Updated the CLAUDE.md directory-tree path labels (plan/ -> lz-plan/, etc.)**
- **Found during:** Task 2 (cross-reference sweep).
- **Issue:** The verified surface enumerated only the `(qualified: lz-advisor:plan)` tree COMMENTS at :52/:54/:56/:58. The directory-name LABELS in the same tree block (`|-- plan/`, `|-- execute/`, `|-- review/`, `'-- security-review/`) describe the directory structure, which the git mv renamed -- leaving them bare would make the tree factually inaccurate.
- **Fix:** Updated the four tree path labels to `lz-plan/`, `lz-execute/`, `lz-review/`, `lz-security-review/` in lockstep with the comment retargeting. CLAUDE.md is outside the gate scope (not under plugins/lz-advisor/), so this does not affect the gate; it is a D-05 accuracy edit consistent with the verified surface's intent.
- **Files modified:** CLAUDE.md
- **Verification:** CLAUDE.md qualified-form check `lz-advisor:(plan|execute|review|security-review)([^a-z-]|$)` returns EXIT 1; diff confirms only the intended tree-block + claude -p + prose lines changed.
- **Committed in:** f9636b8 (Task 2 commit)

---

**Total deviations:** 2 (1 Rule 3 blocking gate-fix, 1 Rule 1 accuracy edit)
**Impact on plan:** Both are accuracy edits within the locked disposition (gate-correction #2 for #1; D-05 accuracy intent for #2). No scope creep, no behavior change, no version/release work.

## Issues Encountered
None beyond the two deviations above. The arm64 leading-slash git-grep hazard was pre-mitigated by the plan's bracketed `[/]` gate patterns and did not cause a false-GREEN.

## RENAME-02 / SC-4 (human_needed)

The bare-form de-shadowing check (built-in `/plan` / `/review` / `/security-review` no longer shadowed by the plugin) is recorded as **human_needed** and surfaced to the user by phase verification. It CANNOT be auto-validated and was NOT substituted with a headless `claude -p` probe (D-10; memory `project_headless_probe_misses_bare_form_collisions`). The precise interactive-picker recipe (start interactive session, type each bare built-in and the four `/lz-*` forms, record picker observations) is in `14-RENAME-02-PICKER-RECIPE.md`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The rename is complete and gate-green at HEAD. Phase 15 (v2.0.0 release & publication) can proceed: atomic 5-surface 1.0.1 -> 2.0.0 bump + CHANGELOG `[2.0.0]` migration table + README "What's New" 2.0.0 entry + git tag v2.0.0 + GitHub Release.
- Blocker for full SC closure: RENAME-02 / SC-4 awaits the human interactive-picker confirmation (recipe recorded). Phase 15 is gated on Phase 14 verification per the milestone roadmap.

## Self-Check: PASSED

- All 4 renamed SKILL.md exist at the lz- paths; `14-RENAME-02-PICKER-RECIPE.md` and `14-01-SUMMARY.md` exist.
- Task commits `e52a7bb` (rename) and `f9636b8` (sweep) exist in history.
- Closing gate prints `[GATE-PASS]` at HEAD (P1-P5 EXIT 1, A1+A2 hold, 4/4 history checks resolve through d88df91).

---
*Phase: 14-lz-skill-rename*
*Completed: 2026-06-13*
