---
phase: 05-polish-and-marketplace-readiness
plan: 02
subsystem: agents
tags: [opus, advisor, reviewer, security-reviewer, plugin-dev, marketplace]

# Dependency graph
requires:
  - phase: 05-01
    provides: Restructured plugin at plugins/lz-advisor/ with marketplace.json
provides:
  - Expanded agent system prompts (500+ words each) per plugin-dev guidelines
  - Reviewer agent color corrected to cyan (analysis/review semantic)
  - All agents have 3 example blocks in descriptions
  - Plugin passes manual plugin-dev validation (10 steps)
affects: [05-03, 05-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Agent system prompt structure: Output Constraint, Process, Awareness, Response Structure, Edge Cases, Boundaries"
    - "Severity Classification in reviewer: Critical/Important/Suggestion with definitions"
    - "OWASP edge case handling: Uncategorized findings, auth-gated severity adjustment, deprecated-to-A06 mapping"

key-files:
  created: []
  modified:
    - plugins/lz-advisor/agents/advisor.md
    - plugins/lz-advisor/agents/reviewer.md
    - plugins/lz-advisor/agents/security-reviewer.md

key-decisions:
  - "Kept security-reviewer color as yellow (caution/validation) rather than red (too aggressive per ADVR-06)"
  - "Added consistent section structure across all agents: Edge Cases + Boundaries sections"
  - "Reviewer severity classification aligned with skill output format (Critical/Important/Suggestion)"

patterns-established:
  - "Agent system prompt minimum 500 words with structured sections"
  - "No aggressive language (MUST/CRITICAL/ALWAYS) in agent prompts per ADVR-06"
  - "Color semantics: magenta=creative/strategic, cyan=analysis/review, yellow=caution/validation"

requirements-completed: [INFRA-04]

# Metrics
duration: 4min
completed: 2026-04-13
---

# Phase 5 Plan 2: Agent Verification and Fixes Summary

**Expanded all 3 agent system prompts to 500+ words with structured sections, fixed reviewer color to cyan, added missing examples, and validated plugin passes all 10 plugin-dev checks**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-13T19:43:14Z
- **Completed:** 2026-04-13T19:46:52Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Expanded advisor.md from 244 to 550 words with Response Structure, Edge Cases, and Boundaries sections
- Expanded reviewer.md from 211 to 529 words with Severity Classification, Edge Cases, and Boundaries sections; changed color from green to cyan; added third example block
- Expanded security-reviewer.md from 356 to 621 words with Edge Cases and Boundaries sections; added third example block
- All agents verified to contain no aggressive language (MUST/CRITICAL/ALWAYS)
- Manual plugin-dev validation passed all 10 steps (manifest, structure, agents, skills, security)
- Plugin loads with --plugin-dir and all 4 skills + 3 agents are discoverable

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand agent system prompts and fix structural issues** - `af67279` (feat)
2. **Task 2: Run plugin-dev:plugin-validator on restructured plugin** - validation only, no files changed

## Files Created/Modified

- `plugins/lz-advisor/agents/advisor.md` - Expanded system prompt (244 -> 550 words), added Response Structure/Edge Cases/Boundaries sections
- `plugins/lz-advisor/agents/reviewer.md` - Expanded system prompt (211 -> 529 words), color green -> cyan, added third example, added Severity Classification/Edge Cases/Boundaries sections
- `plugins/lz-advisor/agents/security-reviewer.md` - Expanded system prompt (356 -> 621 words), added third example, added Edge Cases/Boundaries sections

## Decisions Made

- Kept security-reviewer color as yellow rather than red -- yellow (caution/validation) is defensible and red would be too aggressive per the ADVR-06 calm language convention
- Added consistent section structure across all agents (Edge Cases + Boundaries) for uniform agent behavior
- Aligned reviewer severity classification (Critical/Important/Suggestion) with the skill output format to ensure consistency between scan and review phases

## Deviations from Plan

None - plan executed exactly as written.

## Validation Results (Task 2)

Manual plugin-dev validation (10 steps):

| Step | Check | Result |
|------|-------|--------|
| 1 | Plugin root located | PASS - .claude-plugin/ directory exists |
| 2 | Manifest validation | PASS - name field present: lz-advisor |
| 3 | Directory structure | PASS - agents/ and skills/ at plugin root |
| 4 | Commands | N/A - no commands directory |
| 5 | Agent validation | PASS - all 3 agents have name, description, model, color |
| 6 | Skill validation | PASS - all 4 SKILL.md files have name and description |
| 7 | Hooks | N/A - no hooks directory |
| 8 | MCP config | N/A - no .mcp.json |
| 9 | File organization | PASS - README.md and LICENSE exist |
| 10 | Security checks | PASS - no hardcoded credentials or paths |

Plugin load test: `claude --plugin-dir plugins/lz-advisor` discovers all 4 skills (lz-advisor-plan, lz-advisor-execute, lz-advisor-review, lz-advisor-security-review) and all 3 agents (advisor, reviewer, security-reviewer).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All agents now meet plugin-dev guidelines (500+ words, 3+ examples, correct colors)
- Plugin passes structural validation and loads correctly
- Ready for description optimization (05-03) and final marketplace packaging (05-04)

## Self-Check: PASSED

All files verified present. Commit af67279 verified in git log.

---
*Phase: 05-polish-and-marketplace-readiness*
*Completed: 2026-04-13*
