---
phase: 01-plugin-scaffold-and-advisor-agent
plan: 02
subsystem: infra
tags: [advisor-timing, reference-file, readme, marketplace, documentation]

# Dependency graph
requires:
  - phase: none
    provides: greenfield -- no prior phase dependencies
provides:
  - Shared advisor timing reference file for all skills (Phases 2-4)
  - Marketplace-quality README with installation and usage documentation
affects: [02-plan-skill, 03-execute-skill, 04-review-skills, 05-polish-and-optimization]

# Tech tracking
tech-stack:
  added: []
  patterns: [advisor-timing-reference-pattern, calm-language-convention]

key-files:
  created:
    - skills/lz-advisor-plan/references/advisor-timing.md
    - README.md
  modified: []

key-decisions:
  - "Adapted Anthropic's tested system prompt wording rather than rewriting from scratch (D-13)"
  - "Reference file covers three concerns in one file: WHEN, HOW, WHAT (D-12)"

patterns-established:
  - "Calm language convention: no MUST/CRITICAL/ALWAYS in advisor-related content (ADVR-06)"
  - "Reference file as shared infrastructure: placed under lz-advisor-plan/references/ for cross-skill loading"

requirements-completed: [INFRA-03]

# Metrics
duration: 2min
completed: 2026-04-11
---

# Phase 1 Plan 2: Shared Reference and README Summary

**Advisor timing reference file adapted from Anthropic's tested system prompt blocks, plus marketplace-quality README with installation, cost expectations, and known issues**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-10T23:33:14Z
- **Completed:** 2026-04-10T23:35:01Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- Created `advisor-timing.md` covering all three operational concerns (WHEN to consult, HOW to treat advice, WHAT to include in prompts) adapted from Anthropic's benchmark-validated wording
- Created `README.md` documenting all 4 skills, installation with verification steps, cost expectations ($0.05-0.15 per task), and the enabledPlugins known issue
- Reference file is 458 words -- well under the 3,750-word proxy for 5,000-token compaction limit

## Task Commits

Each task was committed atomically:

1. **Task 1: Create advisor timing reference file** - `71f82d1` (feat)
2. **Task 2: Create plugin README for marketplace quality** - `c3db102` (feat)

## Files Created/Modified

- `skills/lz-advisor-plan/references/advisor-timing.md` - Shared advisor timing, advice weight, and context packaging guidance for all skills
- `README.md` - Plugin documentation for marketplace discovery, installation, and usage

## Decisions Made

- Adapted Anthropic's tested wording verbatim where possible, modifying only for plugin context (agent name, subagent context gap caveat) per D-13
- Reference file sections ordered WHEN -> HOW -> WHAT to follow the natural consultation flow

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness

- Reference file ready for skills to load via `@references/advisor-timing.md` in Phases 2-4
- README ready for marketplace publishing; will be updated as skills are added
- Cross-skill reference loading (from lz-advisor-execute, lz-advisor-review, lz-advisor-security-review to lz-advisor-plan/references/) needs verification in Phase 2 when the first SKILL.md is created

## Self-Check: PASSED

- [x] `skills/lz-advisor-plan/references/advisor-timing.md` exists
- [x] `README.md` exists
- [x] Commit `71f82d1` found (Task 1)
- [x] Commit `c3db102` found (Task 2)

---
*Phase: 01-plugin-scaffold-and-advisor-agent*
*Completed: 2026-04-11*
