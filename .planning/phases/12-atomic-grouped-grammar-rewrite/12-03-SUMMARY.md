---
phase: 12-atomic-grouped-grammar-rewrite
plan: 03
subsystem: skills
tags: [review-skill, security-review-skill, render-verbatim-contract, grouped-grammar, severity-headers, context-packaging, prompt-engineering, sync-disposition]

# Dependency graph
requires:
  - phase: 12-atomic-grouped-grammar-rewrite
    provides: "12-01 reviewer.md emits ### Critical/### Important/### Suggestions/### Questions + ### Cross-Cutting Patterns; 12-02 security-reviewer.md emits the same four headers + ### Threat Patterns with OWASP [Axx] preserved -- the literal headers this plan names as the skills' verbatim contract"
provides:
  - "Both review skills' Phase 3 render-verbatim contracts name the four severity headers (### Critical/### Important/### Suggestions/### Questions) + the trailing analytical section (### Cross-Cutting Patterns for review, ### Threat Patterns for security) as the protected literal headers that MUST reach the user"
  - "The standing 'do not reformat into severity groups' prohibition is INVERTED in both skills -- the four grouped headers ARE the contracted shape; render-verbatim stays absolute"
  - "context-packaging.md display surfaces aligned to the grouped grammar; lowercase severity= machine attribute + INPUT-side Verification template Findings list KEPT (SYNC-01 per-surface disposition)"
  - "execute/SKILL.md negative reference precision-edited so it no longer asserts a reviewer grammar that no longer exists"
affects: [12-04, 13-empirical-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Render-verbatim contract: mechanism preserved, expected header set changed -- the four severity headers + trailing analytical section become the protected literal headers; the skill passes the grouped shape through unchanged, never reformats"
    - "Inverted prohibition: the agent ALREADY groups by severity (header is sole severity source); the skill MUST NOT collapse/merge/reorder/flatten the sections or drop a (none) marker"
    - "Per-surface disposition (SYNC-01): display/OUTPUT surfaces CHANGE to grouped grammar; machine attributes (lowercase severity=) and INPUT-side packaging (executor's prompt TO the agent) KEEP"

key-files:
  created: []
  modified:
    - "plugins/lz-advisor/skills/review/SKILL.md - Phase 3 render-verbatim contract names the four severity headers + ### Cross-Cutting Patterns; prohibition inverted; (none) preservation mandated"
    - "plugins/lz-advisor/skills/security-review/SKILL.md - same treatment with ### Threat Patterns + OWASP [Axx] tag-preservation rule"
    - "plugins/lz-advisor/references/context-packaging.md - :60 inline pv display anchor + :396 Verify Request OUTPUT-shape illustration + :411 prose aligned to grouped grammar; lowercase severity= machine attr + INPUT-side Findings template KEPT"
    - "plugins/lz-advisor/skills/execute/SKILL.md - :261 negative reference precision-edited to 'reviewer-style grouped findings report'"

key-decisions:
  - "context-packaging.md :396 Verify Request worked example classified (a) CHANGE: it illustrates the agent's OUTPUT report shape (where a <verify_request> rides), so its ### Findings header was aligned to ### Critical (the agent's actual first header under the grouped grammar); :411 prose reworded to 'finding entry under its severity section'"
  - "context-packaging.md :60 inline pv example classified (a) CHANGE (low-risk display-anchor reword): 'in the body of a ### Findings entry' -> 'in the body of a finding entry under its severity section' (it references a user-facing finding-line location)"
  - "context-packaging.md INPUT-side Verification template ## Findings list (:286-294) + 'Severity (initial): [Critical/Important/Suggestion]' labels (:290) classified (b) KEEP -- it is the executor's prompt TO the agent (spelled-out LABELS, not shorthand), not user-facing output (Pitfall 5 / Assumption A5)"
  - "context-packaging.md lowercase severity=\"<critical|important|suggestion>\" BNF (:378), field doc (:390), worked example severity=\"important\" (:402) classified (b) KEEP -- machine lexicon (D-08, AGNT-03)"
  - "execute/SKILL.md :261 classified (a) PRECISION EDIT (Pitfall 6): minimal reword preserving the negative-instruction INTENT (advisor does not emit a findings-list), no longer asserting the defunct '### Findings with severity tags' shape"

requirements-completed: [SKILL-01, SYNC-01]

# Metrics
duration: ~20min
completed: 2026-06-07
---

# Phase 12 Plan 03: Skill render-verbatim contracts + context-packaging sync Summary

**Both review skills' Phase 3 render-verbatim contracts now name the four grouped severity headers (### Critical / ### Important / ### Suggestions / ### Questions) + the trailing analytical section (### Cross-Cutting Patterns for review, ### Threat Patterns for security) as the protected literal headers that MUST reach the user; the standing "do not reformat into severity groups" prohibition is INVERTED (grouped IS the contract) with render-verbatim kept absolute; context-packaging.md display surfaces aligned to the grouped grammar while the lowercase severity= machine attribute and the INPUT-side Verification template are KEPT; the execute/SKILL.md negative reference is precision-edited (SKILL-01, SYNC-01)**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-06-07
- **Completed:** 2026-06-07
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- **review/SKILL.md Phase 3:** Rewrote the render-verbatim clause to name the five literal headers the reviewer now emits (`### Critical`, `### Important`, `### Suggestions`, `### Questions`, then `### Cross-Cutting Patterns`), updated the required-output-shape block to "Begins with `### Critical`, continues with the four severity sections (each header always present; empty sections show `(none)`), then `### Cross-Cutting Patterns`", INVERTED the prohibition (the four headers ARE the contracted shape; the skill MUST NOT collapse/merge/reorder/flatten them), and updated the header-protection rules to the new protected set with mandated `(none)` preservation. Render-verbatim kept ABSOLUTE.
- **security-review/SKILL.md Phase 3:** Same treatment with `### Threat Patterns` substituted for `### Cross-Cutting Patterns`, plus an explicit OWASP `[Axx]` tag-preservation rule on finding lines (the existing `[A03]` example reference stays accurate).
- **context-packaging.md:** Applied the SYNC-01 per-surface disposition table hit-by-hit (audit trail below). Changed only genuine OUTPUT/display surfaces; KEPT the lowercase `severity=` machine attribute (BNF + worked example) and the INPUT-side Verification template `## Findings` list with its `Severity (initial): [Critical/Important/Suggestion]` labels.
- **execute/SKILL.md:** Applied the Pitfall-6 minimal precision edit -- the negative reference now reads "Do not fabricate a reviewer-style grouped findings report -- the advisor does not produce that shape", no longer asserting the defunct `### Findings`-with-severity-tags grammar.
- **No `.planning/` file modified** by the implementation tasks; only the four plan-scoped files touched. The Wave-1 agents/fixtures (12-01/12-02) were not modified.

## Task Commits

Each task was committed atomically:

1. **Task 1: Invert the prohibition and name the grouped headers as the verbatim contract in both review skills (SKILL-01)** - `2902311` (feat)
2. **Task 2: Align context-packaging.md display surfaces + apply execute/SKILL.md precision edit, per the SYNC-01 disposition table** - `ef8a791` (feat)

## Files Created/Modified

- `plugins/lz-advisor/skills/review/SKILL.md` - Phase 3 `<output>` block now contracts the four severity headers + `### Cross-Cutting Patterns` as the verbatim shape; prohibition inverted (grouped IS the contract); `(none)` empty-section preservation mandated; render-verbatim absolute; Reviewer Escalation Hook + `**Verdict scope:**` markers untouched.
- `plugins/lz-advisor/skills/security-review/SKILL.md` - same, with `### Threat Patterns` + OWASP `[Axx]` tag-preservation rule; `**Verdict scope:**` marker untouched.
- `plugins/lz-advisor/references/context-packaging.md` - three display/OUTPUT surfaces aligned to the grouped grammar (`:60`, `:396`, `:411`); machine attribute + INPUT template KEPT.
- `plugins/lz-advisor/skills/execute/SKILL.md` - `:261` negative reference precision-edited.

## SYNC-01 Per-Surface Disposition Audit Trail

Every `### Findings` / `severity=` / severity-vocab hit in `context-packaging.md` (plus the execute negative ref) classified per D-08: (a) CHANGE display/OUTPUT surface; (b) KEEP machine attribute or INPUT-side packaging.

| Surface | Line | Content | Disposition | Action taken + rationale |
|---------|------|---------|-------------|--------------------------|
| Inline pv example | :60 | "literal token in the body of a `### Findings` entry" | (a) CHANGE | Reworded to "in the body of a finding entry under its severity section". It references a user-facing finding-line location anchor; the single `### Findings` header no longer exists. Low-risk precision reword. |
| Verification template Findings list | :286-294 | `## Findings [Numbered list of 3-5 curated findings]` + `Severity (initial): [Critical/Important/Suggestion]` labels | (b) KEEP | Unchanged. This is the executor's PROMPT TO the agent (INPUT-side packaging), not user-facing output. It already carries spelled-out LABELS (not shorthand). Rewriting it would diverge the consultation prompt from the agent's expectation (Pitfall 5 / Assumption A5 MEDIUM-risk). |
| Worked Example consultation prompt | :317 | `## Findings` (numbered list the executor SENDS) | (b) KEEP | Unchanged. Same INPUT-side consultation-prompt surface as :286-294 -- the executor's prompt TO the agent, not the agent OUTPUT contract. |
| Verify Request Schema BNF | :378 | `<verify_request ... severity="<critical|important|suggestion>">` | (b) KEEP | Unchanged. Lowercase machine lexicon (D-08, AGNT-03). Confirmed only lowercase values present. |
| `severity` field doc | :390 | "matches the affected finding's severity (Critical / Important / Suggestion ...)" | (b) KEEP | Unchanged. Prose field documentation describing the machine attribute's meaning; not a display-output header. |
| Verify Request worked example header | :396 | `### Findings` illustrating where a `<verify_request>` rides in the agent OUTPUT report | (a) CHANGE | Aligned to `### Critical` (the agent's actual first header under the grouped grammar). This block illustrates the agent's OUTPUT report shape -- under the new grammar the report begins with `### Critical`, not a single `### Findings` header. |
| Verify Request worked example attr | :402 | `severity="important"` machine attr | (b) KEEP | Unchanged. Lowercase machine lexicon (D-08). |
| Verify Request worked example prose | :411 | "The reviewer's `### Findings` entry references the verify_request..." | (a) CHANGE | Reworded to "The reviewer's finding entry (under its severity section) references...". OUTPUT-shape prose describing where the agent's finding sits. |
| execute/SKILL.md negative ref | :261 | "Do not fabricate `### Findings` entries with severity tags -- the advisor does not produce that shape." | (a) PRECISION EDIT (Pitfall 6) | Reworded to "Do not fabricate a reviewer-style grouped findings report -- the advisor does not produce that shape." Preserves the negative-instruction INTENT (advisor emits a 100-word enumerated response, not a findings-list); no longer asserts the defunct grammar. Load-bearing PRESENCE assertion: the new phrase `reviewer-style grouped findings report` is now present (count = 1). |
| `.planning/**` (~362 artifacts) | -- | frozen history with shorthand | (c) UNTOUCHED | Not in this plan's files_modified; Phase 9 precedent / Phase 13 residue sweep exempts these. No `.planning/` file modified. |

## Decisions Made

- **`:396` Verify Request worked example treated as (a) CHANGE, not (b) KEEP.** The disposition table flagged this hit as "(b) KEEP / review -- confirm by reading; if it is illustrating the agent's OUTPUT shape, treat as (a) CHANGE." On reading, the block (lines 394-411) illustrates the agent's OUTPUT report -- numbered findings (`1.`/`2.`/`3.`) with an embedded `<verify_request>` and a closing prose sentence describing "the reviewer's ... entry". That is the agent OUTPUT shape, so it was aligned to the grouped grammar: the header became `### Critical` (the agent's actual first header) and the `:411` prose was reworded to a severity-section reference. The numbered finding placeholders already match the new continuous-numbering grammar, so no other change was needed.
- **`:60` inline pv example treated as a low-risk display-anchor reword.** It references "the body of a `### Findings` entry" as a user-facing finding-line location; reworded to "a finding entry under its severity section" so it does not name a header that no longer exists.
- **INPUT-side Verification template (`:286-294`, `:317`) and the lowercase `severity=` machine attribute (`:378`, `:390`, `:402`) explicitly KEPT.** These are the executor's prompt TO the agent and the machine lexicon, respectively -- not user-facing OUTPUT. The Verification template already carries spelled-out `Severity (initial): [Critical/Important/Suggestion]` LABELS (not shorthand), so it required no change and rewriting it would have diverged the consultation prompt from the agent's expectation (Pitfall 5 / A5 / threat T-12-10).

## Deviations from Plan

None - plan executed exactly as written. All Task 1 and Task 2 acceptance criteria passed on the first verification run; no auto-fixes, no blocking issues, no architectural decisions required. The one discretionary call flagged in the plan (`:396` KEEP vs CHANGE) was resolved to CHANGE after reading the surrounding block, as the disposition table instructed.

## Issues Encountered

None. The `git grep -c` automated-verify line in Task 2 emitted a benign `test: integer expected` message because `git grep -c` returns `filename:count` (e.g. `...SKILL.md:1`) rather than a bare integer; extracting the count field (`cut -d: -f2`) confirmed the precision-edit phrase is present exactly once, and all acceptance criteria passed.

## Threat Model Compliance

- **T-12-08 (Tampering, render-verbatim contract):** Mitigated. The prohibition was inverted but render-verbatim kept ABSOLUTE; the four grouped headers + trailing analytical section are named as protected literal headers, and the inverted Do-NOT list forbids collapsing/merging/reordering/flattening the sections or dropping a `(none)` marker. The old "reformat into severity groups" prohibition is gone (grep returns nothing).
- **T-12-09 (Tampering, lowercase `severity=` machine attribute):** Mitigated. `git grep 'severity="'` in context-packaging.md returns only lowercase values (`<critical|important|suggestion>` BNF + `important` example); no Title-Case leak.
- **T-12-10 (Spoofing/Tampering, INPUT-side Verification template):** Mitigated. The executor's prompt-TO-agent `## Findings` list and its `Severity (initial)` labels survive unconverted, so the consultation prompt does not diverge from the agent's expectation.

## TDD Gate Compliance

Both tasks are `type="auto"` (not `tdd="true"`); this plan rewrites prompt-contract prose in skill/reference Markdown with no runtime code path and no binding test fixture (the budget fixtures gate the agents, not the skills). Verification is by `git grep` presence/absence assertions in the acceptance criteria, all of which passed. No RED/GREEN gate applies.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The skill layer now CARRIES the grouped grammar to the user without reformatting; the cross-agent consistency surface (context-packaging.md) agrees on display while keeping machine lexicon + INPUT packaging. The agents (12-01/12-02) + skills (12-03) all align on the four-header grouped grammar.
- Plan 12-04 (5-surface version bump + phase-gate residue sweep) closes the atomic unit: plugin.json + 4 SKILL.md `version:` 1.0.0 -> 1.0.1, README "What's New" 1.0.1 entry, and the final `git grep` residue sweep across `plugins/lz-advisor/` (the two agents are already clean per 12-01/12-02; the skills + context-packaging surfaces are now clean per this plan -- the OUTPUT-contract `### Findings` headers are gone and no `crit:|imp:|sug:|q:` shorthand was introduced).
- No blockers introduced by this plan.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-atomic-grouped-grammar-rewrite/12-03-SUMMARY.md`
- FOUND: commit `2902311` (Task 1: invert prohibition + name grouped headers in both review skills)
- FOUND: commit `ef8a791` (Task 2: context-packaging display surfaces + execute precision edit)
- FOUND: `plugins/lz-advisor/skills/review/SKILL.md`
- FOUND: `plugins/lz-advisor/skills/security-review/SKILL.md`
- FOUND: `plugins/lz-advisor/references/context-packaging.md`
- FOUND: `plugins/lz-advisor/skills/execute/SKILL.md`
- Acceptance criteria re-confirmed: both skills name all four severity headers + trailing section; old prohibition grep returns nothing; `(none)` preservation named; lowercase `severity=` only; INPUT-side `Severity (initial)` labels intact; `reviewer-style grouped findings report` present (count = 1); no `crit:|imp:|sug:|q:` shorthand introduced; no `.planning/` file modified.

---
*Phase: 12-atomic-grouped-grammar-rewrite*
*Completed: 2026-06-07*
