---
phase: 04-review-skills
plan: 02
subsystem: security-review
tags: [opus, security-review, owasp, threat-modeling, advisor-pattern, skill, agent]

# Dependency graph
requires:
  - phase: 01-plugin-scaffold-and-advisor-agent
    provides: "advisor.md agent pattern, plugin manifest, advisor-timing.md"
  - phase: 02-plan-skill
    provides: "orient-consult-produce workflow pattern in SKILL.md"
  - plan: 04-01
    provides: "reviewer.md agent pattern, review SKILL.md pattern, validate-phase-04.sh"
provides:
  - "agents/security-reviewer.md -- Opus security reviewer agent with OWASP Top 10 methodology"
  - "skills/lz-advisor-security-review/SKILL.md -- security-focused scan-consult-output workflow"
affects: [05-polish-and-optimization]

# Tech tracking
tech-stack:
  added: []
  patterns: ["OWASP Top 10 lens for structured vulnerability classification", "threat modeling with attack chain detection across findings", "security-specific scan criteria (input handling, auth, data exposure, attack surfaces, crypto, dependencies)"]

key-files:
  created:
    - agents/security-reviewer.md
    - skills/lz-advisor-security-review/SKILL.md
  modified: []

key-decisions:
  - "Security-reviewer agent uses yellow color (caution/warnings) matching silent-failure-hunter precedent"
  - "Security skill uses Critical/High/Medium severity tiers (CVSS/OWASP-aligned) instead of review skill's Critical/Important/Suggestion"
  - "Scan exclusions focus on non-security concerns (code quality, theoretical vulns, SAST pattern matching without context)"

patterns-established:
  - "Security reviewer agent: OWASP Top 10 as structured classification framework, threat modeling for cross-finding attack chains"
  - "Security skill scan: six security-specific focus areas (input, auth, data exposure, attack surfaces, crypto, dependencies)"
  - "Security output: OWASP category tags on findings, remediation guidance (specific fixes not generic advice)"

requirements-completed: [SECR-01, SECR-02, SECR-03, SECR-04, SECR-05, SECR-06, SECR-07]

# Metrics
duration: 2min
completed: 2026-04-12
---

# Phase 4 Plan 02: Security Review Skill and Security Reviewer Agent Summary

**OWASP-informed security review skill with threat modeling, Critical/High/Medium severity tiers, and Opus security-reviewer agent with attack chain detection**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-12T21:46:45Z
- **Completed:** 2026-04-12T21:49:10Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- Created Opus security reviewer agent with OWASP Top 10 methodology (all 10 categories A01-A10), threat modeling for attack chain detection, ~300 word output budget, and calm natural language throughout
- Created security review skill with three-phase scan-consult-output workflow, six security-specific scan focus areas (input handling, auth, data exposure, attack surfaces, crypto, dependencies), and Critical/High/Medium severity-classified output with remediation guidance

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Opus security reviewer agent** - `55087c0` (feat)
2. **Task 2: Create security review skill** - `412670c` (feat)

## Files Created/Modified

- `agents/security-reviewer.md` - Opus security reviewer agent with OWASP Top 10 lens and threat modeling
- `skills/lz-advisor-security-review/SKILL.md` - Security review skill with scan-consult-output workflow

## Decisions Made

- Security-reviewer agent uses `color: yellow` (caution/warnings) following silent-failure-hunter's color precedent for security-focused agents
- Security skill uses Critical/High/Medium severity tiers (CVSS/OWASP-aligned) rather than review skill's Critical/Important/Suggestion tiers
- Scan exclusion list targets non-security concerns: code quality issues, theoretical vulnerabilities in unexposed code paths, and SAST-style pattern matching without context

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None -- no external service configuration required.

## Verification Results

Full Phase 4 validation: 28/28 assertions passed
- REVW-01 through REVW-06: 17/17 passed (from Plan 01)
- SECR-01 through SECR-07: 11/11 passed (this plan)

Additional manual checks:
- security-reviewer.md: 2 example blocks, no MUST/CRITICAL/ALWAYS, all OWASP A01-A10 present
- SKILL.md: advisor-timing.md include, no model override, remediation guidance, Security Review Summary header

## Self-Check: PASSED

- [x] agents/security-reviewer.md exists
- [x] skills/lz-advisor-security-review/SKILL.md exists
- [x] 04-02-SUMMARY.md exists
- [x] Commit 55087c0 found
- [x] Commit 412670c found

---
*Phase: 04-review-skills*
*Completed: 2026-04-12*
