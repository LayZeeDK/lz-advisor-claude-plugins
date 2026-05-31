---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 09
subsystem: skills
tags: [lz-advisor, execute-skill, advisor-agent, context-packaging, maxturns, pack-then-trust, version-sync, gap-closure]

# Dependency graph
requires:
  - phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
    provides: "Plan 08-08 E.3 change-surface verify-target subsection in lz-advisor.execute Phase 3.5 (Wave 1); this plan edits the same execute/SKILL.md in Wave 2 and carries the version bump that captures both gaps' edits"
provides:
  - "Phase 5 post-change-content packing instruction (`## Relevant File Contents` block) in lz-advisor.execute final consult -- removes the advisor's reason to disk-hunt for changed files"
  - "Final-review one-shot synthesize-from-packed-content clause in advisor.md Context Trust Contract (names the `.component.ts` glob trap; maxTurns stays 3, effort stays high)"
  - "Atomic 5-surface plugin version bump 0.14.0 -> 0.14.1 (PATCH)"
affects: [lz-advisor.execute, advisor, GAP-S10, project_advisor_maxturns_exhaustion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pack-then-trust two-layer fix mirroring the existing two-layer hedge-marker design: execute-side packing (primary, removes the disk-hunt trigger) + advisor-side trust clause (reinforcement, instructs synthesize-don't-search)"
    - "Both halves reference the SAME anchors (`## Relevant File Contents` block + the `.component.ts` trap), so the agent-side clause binds to the execute-side packing the way the hedge-marker two-layer design composes"
    - "Prompt-side fix, NOT a budget increase: maxTurns stays 3 and effort stays high (locked decision per feedback_advisor_fix_approach)"
    - "Descriptive-trigger phrasing per reference_sonnet_46_prompt_steering: worked-anchor house style (`Final-review one-shot:` matching the existing `One-shot:`), no MUST/CRITICAL/NEVER imperatives"

key-files:
  created: []
  modified:
    - "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md"
    - "plugins/lz-advisor/agents/advisor.md"
    - "plugins/lz-advisor/.claude-plugin/plugin.json"
    - "plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.review/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md"

key-decisions:
  - "Pack-then-trust over maxTurns increase: GAP-S10 fixed PROMPT-SIDE on both ends (execute packs post-change content, advisor trusts it) -- maxTurns stays 3, effort stays high per the locked feedback_advisor_fix_approach decision"
  - "Both layers reference the same `## Relevant File Contents` block + `.component.ts` trap so the two-layer fix composes the way the existing hedge-marker two-layer design does"
  - "PATCH magnitude (0.14.0 -> 0.14.1): GAP-S9 + GAP-S10 are prompt-discipline gap closures (refinements of existing Phase 3.5 / Phase 5 / advisor behavior), not new public-facing skill contracts"
  - "review + security-review SKILL.md change version-string-only (no content over-broadcast); this plan's content edits touch only execute/SKILL.md + advisor.md"

patterns-established:
  - "Final-review consult packs the changed files' current contents or the commit diff in a `## Relevant File Contents` block, not just a prose summary -- a summary tells the advisor what you did, the file text/diff is what lets it review the work"
  - "When a changed file does not match the naming convention the advisor expects (e.g. a component not named `*.component.ts`), packing its contents removes the advisor's reason to search for it on disk"

requirements-completed: [GAP-S10]

# Metrics
duration: 2min
completed: 2026-05-31
---

# Phase 8 Plan 09: Pack-Then-Trust Final-Consult (GAP-S10) Summary

**Closes GAP-S10 via pack-then-trust: lz-advisor.execute Phase 5 now packs post-change file contents / commit diff into a `## Relevant File Contents` block in the final consult (primary, removes the disk-hunt trigger), and advisor.md carries a Final-review one-shot clause to synthesize from packed content rather than re-locate changed files on disk (reinforcement) -- maxTurns stays 3, effort stays high; plugin bumped 0.14.0 -> 0.14.1 atomically across all 5 surfaces.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-31T19:03:12Z
- **Completed:** 2026-05-31T19:05:41Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added a `## Relevant File Contents` packing instruction to the execute skill's Phase 5 `<final>` block (`## Phase 5: Final Advisor Consultation`), inserted between the "the advisor does not produce that shape." paragraph and the "This is a final check, not a request for approval." paragraph. It directs the executor to pack the changed files' current contents (or the commit's `git diff` / `git show`), names the `.component.ts` glob trap, and carries the 3-turn budget-exhaustion rationale ("it can exhaust that budget on disk before synthesizing") -- applying Common Contract Rule 1 (inline file contents) + Rule 4 (turn-budget-aware packing).
- Appended a `Final-review one-shot:` clause to advisor.md's `## Context Trust Contract` (after the existing `One-shot:` worked example, before `## Verification Process`), matching the worked-anchor house style. It instructs the advisor to synthesize from the packaged summary + post-change contents, "Do not re-locate changed files on disk," names the same `.component.ts` trap and `## Relevant File Contents` block (binding the agent-side clause to the execute-side packing), and carries the rationale "burns your 3-turn budget before you synthesize."
- Bumped the plugin version 0.14.0 -> 0.14.1 atomically and byte-consistently across all 5 surfaces (plugin.json + the 4 SKILL.md frontmatter version fields). PATCH magnitude for prompt-discipline gap closure; review + security-review SKILL.md changed version-only (no content over-broadcast); plugin.json remains valid JSON.
- Wired the two-layer pack-then-trust fix so both halves reference the same anchors (`## Relevant File Contents` + the `.component.ts` trap), composing the way the existing two-layer hedge-marker design does. maxTurns stays 3 and effort stays high -- the locked prompt-side-not-budget-increase decision (feedback_advisor_fix_approach) is honored.

## Task Commits

Each task was committed atomically (with `--no-verify` per the parallel worktree-execution protocol):

1. **Task 1: Pack post-change file contents / commit diff into the execute Phase 5 final consult** - `e186bbb` (feat)
2. **Task 2: Add a final-review synthesize-from-packed-content clause to advisor.md (maxTurns unchanged)** - `807a0a2` (feat)
3. **Task 3: Atomic 5-surface version bump 0.14.0 -> 0.14.1 (PATCH)** - `62ec907` (chore)

**Plan metadata:** STATE.md / ROADMAP.md are written by the orchestrator after all Wave 2 worktree agents complete (this agent does not write them, per the plan objective and parallel-execution protocol).

## Files Created/Modified

- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` - +2 net lines (content + version): new `## Relevant File Contents` packing paragraph in Phase 5; version 0.14.0 -> 0.14.1. The Wave-1 E.3 subsection (Plan 08-08) and all other Phase 5 text (Findings-list skip, `### Handling a **Critical:** Block`) are unchanged.
- `plugins/lz-advisor/agents/advisor.md` - +2 lines: new `Final-review one-shot:` clause appended to `## Context Trust Contract`. Frontmatter `maxTurns: 3` (line 45) and `effort: high` (line 43) unchanged.
- `plugins/lz-advisor/.claude-plugin/plugin.json` - version 0.14.0 -> 0.14.1 (still valid JSON).
- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` - version 0.14.0 -> 0.14.1 (the GAP-S9 content edit landed in Plan 08-08; this plan touches version only).
- `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` - version 0.14.0 -> 0.14.1 only (no content change).
- `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` - version 0.14.0 -> 0.14.1 only (no content change).

Total: 6 files, 9 insertions, 5 deletions. Matches the plan's expected `git diff --stat` exactly.

## Decisions Made

- **Pack-then-trust, not maxTurns increase.** GAP-S10 (recurrence of project_advisor_maxturns_exhaustion) is fixed PROMPT-SIDE on both ends: execute Phase 5 packs the post-change content (primary, removes the disk-hunt trigger) and advisor.md instructs trust + synthesize (reinforcement). maxTurns stays 3, effort stays high -- the locked decision per feedback_advisor_fix_approach.
- **Same anchors on both layers.** Both the execute-side packing and the advisor-side clause name the `## Relevant File Contents` block and the `.component.ts` glob trap, so the two-layer fix composes like the existing two-layer hedge-marker design.
- **PATCH magnitude.** 0.14.0 -> 0.14.1: GAP-S9 + GAP-S10 are prompt-discipline gap closures (verify-target heuristic + pack-then-trust packaging), refinements of existing behavior, not new public-facing skill contracts. Per feedback_version_numbers_not_load_bearing_prerelease, SemVer rigor is optional in this solo pre-release, but the atomic 5-surface sync is required when any version string changes.
- **No content over-broadcast.** review + security-review SKILL.md change version-only; the content edits touch only execute/SKILL.md (Phase 5) + advisor.md.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Worktree branch base mismatch (fixed at start).** The worktree HEAD (`56ff109`) was an ancestor of the required Wave-2 base (`1fd2385e`, which carries Plan 08-08's E.3 work) -- the worktree had been created from an older commit (a known Windows worktree issue). Resolved with a non-destructive `git merge --ff-only 1fd2385e...` (clean fast-forward, no divergent local work), which materialized 08-09-PLAN.md, 08-08-SUMMARY.md, and the E.3 section in execute/SKILL.md. Re-verified `git grep -c "E.3" -- .../lz-advisor.execute/SKILL.md` returned 1 before any plan work began, confirming the base carries Wave-1's E.3 deliverable to build on.

## User Setup Required

None - no external service configuration required. These are skill-prompt / agent-prompt prose edits plus a version-string bump with no runtime, dependency, or environment changes.

## Known Stubs

None. All edits are prose additions to Markdown prompt files plus a version-string bump; there is no data-rendering code, no hardcoded empty values, and no placeholder/TODO content.

## Next Phase Readiness

- GAP-S10 closed via pack-then-trust on both layers: execute Phase 5 packs post-change contents/diff (primary) + advisor.md final-review clause (reinforcement). maxTurns stays 3, effort stays high.
- Plugin synced atomically to 0.14.1 across all 5 surfaces; no 0.14.0 residue anywhere in `plugins/lz-advisor/`; plugin.json valid.
- Both Wave-2 content edits (execute Phase 5 + advisor.md) reference the same `## Relevant File Contents` + `.component.ts` anchors, so the two-layer fix is wired on both sides.
- Wave 1 (Plan 08-08, GAP-S9) and Wave 2 (this plan, GAP-S10) together close both PLUGIN gaps surfaced by the 2026-05-31 Compodoc natural UAT. The orchestrator writes STATE.md / ROADMAP.md after all Wave-2 worktree agents complete; the gap-closure cycle is then ready for the phase-goal verification step (gsd-verifier) per the GSD workflow.

## Self-Check: PASSED

- Files exist: `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md`, `plugins/lz-advisor/agents/advisor.md`, `plugins/lz-advisor/.claude-plugin/plugin.json`, `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` -- all FOUND.
- Commits exist: `e186bbb` (Task 1), `807a0a2` (Task 2), `62ec907` (Task 3) -- all FOUND in git log.
- `## Relevant File Contents` packing instruction present in execute/SKILL.md (1 match), scoped to execute only (no broadcast).
- `Final-review one-shot:` clause present in advisor.md (1 match); `maxTurns: 3` unchanged; `effort: high` unchanged.
- 0.14.1 present on all 5 surfaces (1 each); no 0.14.0 residue in `plugins/lz-advisor/`; plugin.json valid JSON.

---
*Phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle*
*Completed: 2026-05-31*
