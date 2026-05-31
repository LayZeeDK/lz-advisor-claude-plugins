---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 08
subsystem: skills
tags: [lz-advisor, execute-skill, plan-skill, verify-before-commit, change-surface, nx, storybook, gap-closure]

# Dependency graph
requires:
  - phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
    provides: "Phase 3.5 verify-before-commit block (E.1 hedge resolution, E.2 plan-step shape rule, Pre-commit validation scope) shipped at plugin 0.14.0"
provides:
  - "E.3 change-surface verify-target selection subsection in lz-advisor.execute Phase 3.5 (execute-side safety net for the no-plan / wrong-plan case)"
  - "Tooling-state-freshness clause (stale-daemon-is-not-a-verification) appended to E.3"
  - "Change-surface-matched Validate-step rule in lz-advisor.plan Steps guidance (proven plan-side mitigation path)"
affects: [08-09, lz-advisor.execute, lz-advisor.plan, GAP-S10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Defense-in-depth across two skills: plan-side proven mitigation (surface-matched Validate step) + execute-side safety net (E.3 target selection by change surface)"
    - "Cross-skill key-link: plan SKILL.md references the execute skill's E.3 rule by name as an inline code-span anchor (not an over-broadcast of the rule definition)"
    - "Descriptive-trigger phrasing per reference_sonnet_46_prompt_steering: decision heuristic + contrastive worked examples + generalization clause, no MUST/CRITICAL/NEVER imperatives"

key-files:
  created: []
  modified:
    - "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md"

key-decisions:
  - "E.3 is execute-only (real ### heading); the plan skill references it inline as a cross-skill key-link, not as a duplicated rule definition -- no over-broadcast to review/security-review"
  - "No version bump in this plan; the atomic 5-surface 0.14.0 -> 0.14.1 PATCH bump is deferred to Plan 08-09 so it captures both GAP-S9 and GAP-S10 edits to execute/SKILL.md in one cadence"
  - "E.3 inserted BEFORE Pre-commit validation scope so target SELECTION (which target) precedes the cheap-vs-long-running EXECUTION decision (how to run it)"

patterns-established:
  - "Change-surface-to-target mapping shared verbatim between the plan skill (emit Validate step) and the execute skill (E.3 select target): build-config -> build target, dev-server config -> dev-server target, source -> unit-test target, lint config -> lint target"
  - "Generalization clause 'When in doubt, run the target whose executor reads the file you edited.' lets Sonnet 4.6 extend beyond the four listed (illustrative, not exhaustive) surfaces"

requirements-completed: [GAP-S9]

# Metrics
duration: 2min
completed: 2026-05-31
---

# Phase 8 Plan 08: Change-Surface Verify-Target Selection (GAP-S9) Summary

**Closes GAP-S9 at the contract layer: lz-advisor.execute Phase 3.5 now selects the pre-commit verify target by CHANGE SURFACE (new E.3 subsection + tooling-freshness clause), and lz-advisor.plan now emits a change-surface-matched Validate step that the execute skill's existing E.2 rule runs pre-commit.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-31T18:56:16Z
- **Completed:** 2026-05-31T18:58:42Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `### Select the verify target by change surface (E.3)` to the execute skill's `<verify_before_commit>` block, inserted immediately before `### Pre-commit validation scope` so target selection precedes the cheap-vs-long-running execution rule. The subsection is a decision heuristic (four illustrative change surfaces) + generalization clause + two contrastive worked examples (the `browserTarget`-removal regression that `nx test` missed, and a correct `@Input()`-type change verified under `nx test`) + a tooling-state-freshness closing paragraph (stale Nx/Turborepo/Gradle daemon graphs return false-pass verifications).
- Added a `**Emit a change-surface-matched Validate step.**` prose rule to the plan skill's Steps guidance, between the `## Steps` template and the `## Key Decisions` template. It instructs the planner to emit a final `**Validate**` step whose `Run:` command matches the dominant change surface, using the same surface-to-target mapping E.3 applies, and references E.3 by name as the cross-skill key-link.
- Wired defense-in-depth per the 2026-05-31 Compodoc UAT evidence: the plan-side path (empirically proven in UAT Sessions 8-9 where an explicit `Run: nx storybook` step made the executor verify the correct surface) plus the execute-side safety net (closes the no-plan / wrong-plan case from Sessions 5 + 7b where `nx test` was used to "verify" a Storybook-config change).

## Task Commits

Each task was committed atomically (with `--no-verify` per the parallel worktree-execution protocol):

1. **Task 1: Add E.3 change-surface verify-target selection (+ tooling-freshness clause) to execute Phase 3.5** - `c020a9d` (feat)
2. **Task 2: Add a change-surface-matched Validate-step rule to the plan-file Steps guidance** - `8a233ee` (feat)

**Plan metadata:** committed by the orchestrator after all wave-1 agents complete (this agent does not write STATE.md/ROADMAP.md).

## Files Created/Modified

- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` - +17 lines: new E.3 subsection in `<verify_before_commit>` (before `### Pre-commit validation scope`); E.1, E.2, and the Pre-commit-validation-scope body unchanged.
- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` - +8 lines: new change-surface-matched Validate-step prose rule between `## Steps` and `## Key Decisions`; all surrounding template text unchanged.

Total: 2 files, 25 insertions, 0 deletions (additions-only).

## Decisions Made

- **E.3 is execute-only as a rule; plan references it inline.** The real `### Select the verify target by change surface (E.3)` heading exists only in execute/SKILL.md. The plan skill mentions the phrase only inside an inline code-span in prose (the required cross-skill key-link anchor), confirmed not to be a real line-start `###` heading. This satisfies both the Task 2 "reference E.3 by name" criterion and the no-over-broadcast intent of the plan's verification block.
- **No version bump.** Deferred to Plan 08-09 so the atomic 5-surface 0.14.0 -> 0.14.1 PATCH bump bundles both GAP-S9 and GAP-S10 edits to execute/SKILL.md in one cadence (per the plan objective and STATE.md).
- **Descriptive phrasing, no imperatives.** Both inserted blocks use decision-heuristic + worked-example framing with no MUST/CRITICAL/NEVER, per reference_sonnet_46_prompt_steering (descriptive triggers steer Sonnet 4.x better than imperatives for tool-use selection).

## Deviations from Plan

None - plan executed exactly as written.

The plan's `<verification>` block stated `git grep -l -F "Select the verify target by change surface (E.3)"` should return ONLY execute/SKILL.md, while Task 2's acceptance criteria require the plan skill to reference that exact phrase by name. These are complementary, not contradictory: the verification block refers to where the E.3 *rule* (the `###` line-start heading) lives, while Task 2 requires an *inline reference* to it. Verified with an anchored pattern (`^### Select...`) that the real heading exists only in execute/SKILL.md (1 match) and not in plan/SKILL.md (0 matches as a line-start heading; the phrase appears once inside an inline code-span). No work-around or scope change was needed.

## Issues Encountered

- **Worktree branch base mismatch (fixed at start).** The worktree HEAD (`56ff109`) was an ancestor of the required feature-branch base (`3b10709`) -- the worktree had been created from an older commit (a known Windows worktree issue) so the 08-08-PLAN.md file was not yet present. The auto-mode classifier denied `git reset --hard` (only `--soft` was pre-authorized). Resolved with `git merge --ff-only 3b10709...` -- a clean fast-forward (no divergent local work) that moved the branch ref forward and materialized the plan file and all phase-08 planning docs. Base re-verified as correct (BASE_OK) before any plan work began.

## User Setup Required

None - no external service configuration required. These are skill-prompt prose edits with no runtime, dependency, or environment changes.

## Known Stubs

None. Both edits are prose additions to skill-prompt Markdown; there is no data-rendering code, no hardcoded empty values, and no placeholder/TODO content.

## Next Phase Readiness

- GAP-S9 closed at the contract layer (target SELECTION by change surface in execute E.3 + surface-matched Validate step in plan).
- Plan 08-09 (GAP-S10, depends_on 08-08) is unblocked: it adds final-consult post-change file CONTENT packing to execute Phase 5 + the advisor.md "synthesize, don't re-locate files" clause, and carries the atomic 5-surface 0.14.0 -> 0.14.1 PATCH bump that will capture both this plan's and 08-09's edits to execute/SKILL.md.
- No version bump landed here by design; the version surfaces remain at 0.14.0 pending Plan 08-09.

## Self-Check: PASSED

- Files exist: `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md`, `08-08-SUMMARY.md` -- all FOUND.
- Commits exist: `c020a9d` (Task 1), `8a233ee` (Task 2) -- both FOUND in git log.
- E.3 `###` heading present in execute/SKILL.md (1 match); Validate-step rule present in plan/SKILL.md (1 match).

---
*Phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle*
*Completed: 2026-05-31*
