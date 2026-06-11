---
phase: 12-atomic-grouped-grammar-rewrite
plan: 02
subsystem: testing
tags: [security-reviewer-agent, grouped-grammar, severity-headers, owasp-tag, cve-carve-out, budget-fixture, prompt-engineering, bash]

# Dependency graph
requires:
  - phase: 11-fixture-baseline
    provides: "D-security-reviewer-budget.sh self-extracting smoke fixture green on the old 4-slot OWASP shorthand grammar (the baseline this plan retargets)"
  - phase: 12-atomic-grouped-grammar-rewrite
    provides: "12-01 established the grouped-grammar shape + header-tracking parser conventions (flattened standalone examples, single > ### Critical sentinel, body-strip derived from FINDING_RE) that this plan mirrors for cross-agent consistency"
provides:
  - "Security-reviewer agent emits the unified grouped ### Critical / ### Important / ### Suggestions / ### Questions grammar with the OWASP [Axx] tag preserved after the location, continuous numbering, and (none) empty markers"
  - "D-security-reviewer-budget.sh header-tracking parser with the [Axx] bracket assertion in FINDING_RE + 75w CVE auto-clarity carve-out: GREEN on the new grouped grammar, RED on the old shorthand sample and on [Axx]-missing finding lines (lockstep retarget)"
affects: [12-03, 12-04, 13-empirical-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Security grouped-severity report grammar: severity carried by the section header (no inline token), OWASP [Axx] tag immediately after the location before the body, continuous integer numbering across sections, literal (none) for empty sections, CVE/GHSA/CWE auto-clarity full-prose carve-out"
    - "Header-tracking + numbered-line bash parser with a load-bearing [<tag>] bracket assertion in FINDING_RE: a finding losing its OWASP/CVE tag fails to parse and the anti-vacuous guard catches the shortfall; body-strip prefix derived from the same FINDING_RE (single source of truth, WR-05 mitigation)"
    - "Auto-clarity carve-out detection runs on the body AFTER the leading [Axx] tag is stripped, so a [CVE-...] token as a SECOND bracket still triggers the 75w escalation"

key-files:
  created: []
  modified:
    - "plugins/lz-advisor/agents/security-reviewer.md - grouped-grammar Output Constraint + legend + every worked example (standalone OWASP + verify_request + hedge + CVE carve-out + holistic) + four-section <output_constraints>; formerly-X residue stripped; protected sections byte-intact"
    - "tests/D-security-reviewer-budget.sh - header-tracking parser, FINDING_RE [Axx] assertion, > ### Critical self-extract sentinel, 75w CVE carve-out preserved, grouped self-test sample"

key-decisions:
  - "Negative references to the dropped inline token use the Title-Case display labels (Critical: / Important:), NOT the crit:/imp: shorthand, so the strict zero-shorthand acceptance grep passes (mirrors reviewer.md 12-01 convention)"
  - "Holistic example uses 6 continuously-numbered findings spread Critical(3)/Important(2)/Suggestions(none)/Questions(1); only the holistic example carries the > ### Critical blockquote sentinel; standalone CORRECT examples are flattened inline numbered lines (no per-example blockquoted headers) to keep the self-extract deterministic"
  - "auto_clarity_cap=75 surfaced as a per_entry attribute on all four severity sections + an <auto_clarity_carve_out> element in <output_constraints>, so the agent doc states the carve-out the fixture enforces"

patterns-established:
  - "Pattern: security grouped-severity grammar with OWASP [Axx] preservation + CVE auto-clarity carve-out (D-01..D-07 + Security Domain)"
  - "Pattern: FINDING_RE bracket assertion as a provenance control - the [<tag>] requirement makes a tag-less finding unparseable, which the anti-vacuous guard then catches (T-12-04 mitigation)"

requirements-completed: [RPT-02, RPT-03, RPT-04, AGNT-01, AGNT-02, AGNT-03]

# Metrics
duration: ~10min
completed: 2026-06-07
---

# Phase 12 Plan 02: Security-reviewer agent grouped-grammar rewrite Summary

**Security-reviewer agent rewritten from the inline 4-slot OWASP fragment shorthand (`crit: [Axx] ...`) to findings grouped under the unified spelled-out ### Critical / ### Important / ### Suggestions / ### Questions headers with the OWASP [Axx] tag preserved after the location, continuous numbering, (none) markers, the trailing ### Threat Patterns section, and the 75w CVE auto-clarity carve-out retained; formerly-X residue stripped; its budget fixture retargeted in lockstep (GREEN-on-new, RED-on-old, RED-on-[Axx]-missing)**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-07T19:57:43Z
- **Completed:** 2026-06-07
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Rewrote the security-reviewer Output Constraint, legend (with required-output skeleton), every worked example (3 standalone OWASP CORRECT examples + verify_request + Unresolved-hedge + CVE auto-clarity carve-out + 6-finding holistic), and the post-example `<output_constraints>` block to the four-section grouped grammar. Zero `crit:|imp:|sug:|q:` shorthand residue and zero `(formerly High)`/`(formerly Medium)` residue remain.
- Preserved the OWASP `[Axx]` tag immediately after the location on every worked-example finding line (13 `[A0N]` hits), and retained the CVE auto-clarity full-prose finding (`[A06] [CVE-2025-1234]`) restructured under `### Critical` with a leading continuous number.
- Holistic worked example restructured to start with `> ### Critical`, span all four severity sections (Suggestions = `(none)`), keep 6 continuously-numbered findings (above MIN_FINDINGS=5), preserve the verify_request line and the CVE full-prose finding inside their sections, and end with `### Threat Patterns` referencing findings by continuous number.
- Retargeted `D-security-reviewer-budget.sh` from the 4-slot inline-severity FRAGMENT_RE to a header-tracking parser (`SEV_HEADERS` context + `FINDING_RE` numbered lines), where FINDING_RE asserts the `\[[^]]+\]` OWASP/CVE bracket is present after the location (a tag-less finding fails to parse). Changed the self-extract sentinel to `> ### Critical`, derived the body-strip from FINDING_RE (single source of truth), and rewrote the self-test sample to the grouped grammar.
- Preserved the 75w `AUTO_CLARITY_CAP` carve-out: the CVE finding parses at 36w under the 75w cap (it would FAIL the 28w default cap, proving the carve-out fires). The carve-out detection runs on the body AFTER the leading `[Axx]` is stripped, so the second `[CVE-...]` bracket still triggers it.
- Proven RED/GREEN in lockstep: GREEN on the new self-extracted holistic example (6 findings, 9/9 assertions, exit 0); RED on `--self-test` (exit 1); RED on the OLD shorthand sample via `--from-trace` (0 findings parsed, anti-vacuous guard fires, exit 1); RED on a grouped-grammar sample with `[Axx]`-missing finding lines (0 findings parsed, exit 1 -- the bracket assertion is load-bearing).
- AGNT-03 protected behaviors survive byte-intact: `## Class-2 Escalation Hook`, `## Hedge Marker Discipline`, `## OWASP Top 10 Lens` (and its category list), `## Context Trust Contract`, `## Threat Modeling`, `## Boundaries`, the `[Read, Glob]` tool grant, the `<verify_request>` schema, and all `severity="..."` lowercase machine attributes (`important`, BNF `<critical|important|suggestion>`).

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite security-reviewer.md to the unified grouped grammar; preserve OWASP [Axx] + CVE carve-out; strip formerly-X residue** - `450afd2` (feat)
2. **Task 2: Retarget D-security-reviewer-budget.sh to the header-tracking parser with [Axx] assertion + 75w CVE cap preserved** - `f9f29e6` (test)

_Note: Unlike 12-01 (which had coupled follow-up edits in the Task 2 commit), this plan's two tasks committed cleanly with no cross-task fixups -- the 12-01 conventions (flattened standalone examples, single sentinel, no path-wrapping backticks) were applied up front in Task 1, so the self-extract bounded the holistic example correctly on the first fixture run._

## Files Created/Modified
- `plugins/lz-advisor/agents/security-reviewer.md` - Output Constraint now mandates the five literal headers (`### Critical` first, then Important/Suggestions/Questions, then `### Threat Patterns`); legend defines the section-header grammar + a fenced required-output skeleton + the OWASP tag definition + Keep/Drop lists; finding line shape is `N. <file>:<line>: [<OWASP-tag>] <threat>. <fix>.`; every worked example uses the grouped grammar with `[Axx]` preserved; CVE auto-clarity full-prose carve-out retained; `<output_constraints>` has four named severity sections each capped 22w/28w-outlier/75w-auto-clarity, plus an `<auto_clarity_carve_out cap="75">` element, aggregate `none`.
- `tests/D-security-reviewer-budget.sh` - header-tracking parser (`SEV_HEADERS` + `FINDING_RE` with the `\[[^]]+\]` bracket assertion), `> ### Critical` self-extract sentinel, body-strip derived from FINDING_RE (strips the leading `[Axx]` so wc -w counts the `<threat>. <fix>.` span only), `AUTO_CLARITY_CAP=75` carve-out preserved with post-strip CVE/GHSA/CWE detection, grouped-grammar `--self-test` sample; all anti-vacuous / per-section-cap / REQUIRED Threat Patterns presence check / Missed-surfaces / CRLF / `extract_section` tolerant-anchored scaffolding preserved.

## Decisions Made
- **Negative references use Title-Case labels, not shorthand.** The legend's "never add an inline `Critical:` / `Important:` label" sentence and the `<do_not_include>` "An inline severity token (e.g. `Critical:`)" item describe the dropped concept WITHOUT writing `crit:`/`imp:`, so the strict `git grep -nE 'crit:|imp:|sug:|q:'` zero-residue acceptance criterion passes. This mirrors the reviewer.md (12-01) convention exactly.
- **Auto-clarity cap exposed in the agent doc, not just the fixture.** Added `auto_clarity_cap="75"` to each severity section's `<per_entry>` and an explicit `<auto_clarity_carve_out cap="75">` element in `<output_constraints>`, so the agent's own contract states the carve-out the fixture enforces (the prior shorthand version only documented it in prose). The fixture's `AUTO_CLARITY_CAP=75` is the binding gate.
- **Hedge-marker severity-downgrade prose rephrased to placement language.** The old text said the hedge attaches "as a severity downgrade rationale: 'Severity: Suggestion pending verification...'" -- an inline-severity-token phrasing incompatible with header-carried severity. Reworded to "placed under `### Suggestions` while the threat is unconfirmed ... Move the finding up to `### Important` or `### Critical` if verification confirms" so the hedge discipline expresses severity via section placement, not an inline token.

## Deviations from Plan

None - plan executed exactly as written. All Task 1 and Task 2 acceptance criteria passed on the first verification run; no auto-fixes, no blocking issues, no architectural decisions required. The 12-01 lockstep lessons (flattened standalone examples, single `> ### Critical` sentinel, no path-wrapping backticks, body-strip derived from FINDING_RE) were applied proactively in Task 1, avoiding the self-extract sentinel-collision and backtick bugs that 12-01 had to auto-fix.

## Issues Encountered
None. The reviewer half (12-01) had already surfaced and documented the two coupling hazards (path-backtick embellishment, standalone-example sentinel collision); applying its resolved conventions up front meant the security fixture self-extracted the holistic example and parsed 6 findings on the first run.

## TDD Gate Compliance
Task 1 was marked `tdd="true"` in the plan. As with 12-01, the binding "test" for this prompt-grammar rewrite is the budget fixture, which Task 2 retargets and which gates the grammar structurally (GREEN-on-new / RED-on-old / RED-on-[Axx]-missing). The RED/GREEN proof is satisfied: the retargeted fixture is RED on the pre-rewrite shorthand sample (`--from-trace`, exit 1), RED on a grouped sample whose findings lack the `[Axx]` bracket (`--from-trace`, exit 1, proving the bracket assertion is load-bearing), and GREEN on the post-rewrite self-extracted grammar (exit 0). The commit trail is `feat(...)` (Task 1 grammar) then `test(...)` (Task 2 fixture retarget) -- the fixture proves the grammar rather than preceding it, the correct order for a self-extracting fixture whose sample is the agent example itself.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both review agents (reviewer 12-01, security-reviewer 12-02) now emit the unified grouped grammar; both fixtures are GREEN-on-new / RED-on-old in lockstep. The agent half of the atomic unit is complete.
- Plan 12-03 (skill render-verbatim contracts) must name the four severity headers as the literal verbatim headers for BOTH skills, append `### Cross-Cutting Patterns` (review) / `### Threat Patterns` (security-review) to the contracted header set, and invert the "do not reformat into severity groups" prohibition in both `review/SKILL.md` and `security-review/SKILL.md`. The `execute/SKILL.md:261` negative reference to the old `### Findings` shape needs a minimal precision edit (Pitfall 6).
- Plan 12-04 (5-surface version bump + phase-gate residue sweep) closes the atomic unit: plugin.json + 4 SKILL.md `version:` 1.0.0 -> 1.0.1, README "What's New" 1.0.1 entry, and the final `git grep` residue sweep across `plugins/lz-advisor/` (the two agents are already clean; the skills + context-packaging surfaces are 12-03's responsibility).
- No blockers introduced by this plan.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-atomic-grouped-grammar-rewrite/12-02-SUMMARY.md`
- FOUND: commit `450afd2` (Task 1: security-reviewer.md grouped grammar)
- FOUND: commit `f9f29e6` (Task 2: D-security-reviewer-budget.sh retarget)
- FOUND: `plugins/lz-advisor/agents/security-reviewer.md`
- FOUND: `tests/D-security-reviewer-budget.sh`
- Fixture re-confirmed GREEN (exit 0, 6 findings, 9/9 assertions) after all edits; `--self-test` RED (exit 1); RED on old-shorthand and [Axx]-missing samples.

---
*Phase: 12-atomic-grouped-grammar-rewrite*
*Completed: 2026-06-07*
