---
phase: 06-address-phase-5-6-uat-findings
plan: 01
subsystem: infra

tags:
  - reference-file
  - orient-exploration
  - pattern-d
  - question-class-taxonomy
  - sonnet-4-prompt-steering

requires:
  - phase: 05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t
    provides: "Pattern A/B inline canon in 4 SKILL.md files; references/ directory convention; Common Contract Rule 5/5a/6/7 packaging contract"

provides:
  - "Shared Pattern D reference file at plugins/lz-advisor/references/orient-exploration.md"
  - "Four-class question-class-aware orient ranking taxonomy (D-01)"
  - "Concrete first-orient-action defaults per class with worked examples"
  - "Descriptive-trigger phrasing style (D-03) anchored in Anthropic 4.x best-practices doc"

affects:
  - "06-02 (SKILL.md @-load wiring -- Pattern D consumed by all 4 SKILLs)"
  - "06-03 (UAT replay -- prompts reshaped to hit Pattern D web-first classes)"
  - "06-04 (smoke-test gate + version bump 0.8.4 -> 0.8.5)"
  - "Future phases that adjust orient ranking semantics"

tech-stack:
  added: []
  patterns:
    - "Shared @-loadable reference for content used by 2+ SKILLs (matches references/advisor-timing.md and references/context-packaging.md)"
    - "Question-class-aware orient ranking branch on top of standard <orient_exploration_ranking>"
    - "Descriptive trigger sentences (When the question is about ...) plus concrete first orient action plus 1-2 worked classification examples per class"
    - "Positive directives only for tool-use steering -- no MUST/NEVER/REQUIRED/CRITICAL keywords"

key-files:
  created:
    - "plugins/lz-advisor/references/orient-exploration.md"
  modified: []

key-decisions:
  - "Followed D-01 four-class taxonomy verbatim: Type-symbol existence, API currency, Migration / deprecation, Language semantics"
  - "Followed D-03 phrasing contract: descriptive triggers + 1-2 worked examples per class + positive directives + no MUST/NEVER/REQUIRED/CRITICAL keywords"
  - "Class 1 + Class 4 ship 1 worked example; Class 2 + Class 3 ship 2 worked examples (load-bearing classes most often misclassified per Plan 07 UAT)"
  - "setCompodocJson example anchored verbatim from research Code Example 1 to Class 3 (migration / deprecation)"
  - "Storybook 10.x docs configuration example anchored verbatim from research Code Example 1 to Class 2 (API currency)"
  - "Tightened intro and closing-note prose to land within the 350-700 word acceptance range (final word count 681)"

patterns-established:
  - "Pattern D class block shape: trigger sentence + first-action sentence + corroboration sentence + 1-2 worked examples (each example is single-line: Question / Class / First action)"
  - "Closing-note cross-reference to references/context-packaging.md Rule 5 anchors Pattern D inside the broader packaging contract"

requirements-completed:
  - D-01
  - D-03

# Metrics
duration: 4min
completed: 2026-04-28
---

# Phase 06 Plan 01: Add Pattern D Orient-Exploration Reference Summary

**New shared reference file ships the Pattern D four-class question-class taxonomy (Type-symbol existence, API currency, Migration / deprecation, Language semantics) ready to be @-loaded by all four SKILL.md files in Plan 02.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-28T11:53:35Z
- **Completed:** 2026-04-28T11:58:18Z
- **Tasks:** 1
- **Files created:** 1
- **Files modified:** 0

## Accomplishments

- Created `plugins/lz-advisor/references/orient-exploration.md` (681 words, ASCII-only, zero MUST/NEVER/REQUIRED/CRITICAL imperatives applied to tool-use steering).
- Defined exactly four Pattern D classes with concrete first-orient-action defaults: Type-symbol existence (read local `.d.ts` first), API currency / configuration / recommended pattern (`WebFetch` of official source first), Migration / deprecation (`WebFetch` of release notes / migration guides first), Language semantics (empirical compile or `WebFetch` of language spec first).
- Anchored both load-bearing examples verbatim to research Code Example 1: setCompodocJson question to Class 3 (migration / deprecation); Storybook 10.x docs configuration question to Class 2 (API currency).
- Followed D-03 phrasing contract precisely: descriptive trigger openings ("When the question is about ..."), positive directives, 1-2 worked examples per class, no imperatives for tool-use steering.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create orient-exploration.md with Pattern D 4-class taxonomy** -- `6ad60d2` (feat)

_Plan metadata commit pending; orchestrator owns final-commit and STATE.md/ROADMAP.md updates after the wave completes._

## Files Created/Modified

- `plugins/lz-advisor/references/orient-exploration.md` -- NEW. Shared reference for Pattern D four-class question-class-aware orient ranking. Plain markdown, no frontmatter, ASCII-only. ~80-130 words per class block; total 681 words. Each class block contains a trigger sentence, a first-action sentence, a corroboration sentence, and 1-2 worked classification examples. Closing note cross-references `references/context-packaging.md` Rule 5.

## Decisions Made

- **Anchored examples verbatim from research Code Example 1.** The Class 2 Storybook 10.x docs configuration example and the Class 3 setCompodocJson example mirror the research's verified shape exactly, so reviewers can cross-reference without ambiguity.
- **One worked example for unambiguous classes (1, 4); two worked examples for load-bearing classes (2, 3).** Plan 07 UAT evidence indicates the executor most often misclassifies questions into Class 2 vs Class 3; two examples per class makes the boundary easier to learn from a glance.
- **Single-line example blocks instead of multi-line "Question / Class / First action" wrapping.** Single-line form avoids the line-break trap where `git grep -c "First action:"` would skip wrapped occurrences and undercount the acceptance criterion. Final count: 6 "First action:" matches, 4 "When the question is about" trigger sentences -- both meet the plan's `>=` thresholds.
- **Tightened example rationale clauses.** The first revision wrote "Class: API currency, because the question asks for the documented current best practice" for each Class 2 / 3 / 4 example. The acceptance criterion's word ceiling (700 words) required dropping the redundant `, because ...` clauses where the class itself was self-evident, while preserving the rationale where it added classification clarity (kept on Class 1 setCompodocJson example -- moved to Class 3 trigger sentence instead). Final word count: 681.

## Deviations from Plan

None -- plan executed exactly as written. Two intermediate trims were applied during composition to land the file within the 350-700 word ceiling and to ensure `git grep -c "First action:"` returns at least 6 (single-line example blocks rather than wrapped lines). These are not deviations from the plan -- they are normal composition iterations against the plan's acceptance criteria.

**Total deviations:** 0
**Impact on plan:** None. All acceptance criteria pass on the final committed file.

## Issues Encountered

- **`rg -E` flag rejected on Windows arm64 build.** Initial verification used `rg -E '\b(MUST|NEVER|REQUIRED|CRITICAL)\b'` which returned `error parsing flag -E: grep config error: unknown encoding`. Switched to plain `rg '\b(MUST|...)\b'` (default Rust regex with `\b` word boundary support) -- exit code 1 confirms zero matches, satisfying the acceptance criterion. The plan's `<verify>` block uses `rg -E`; future plans should drop the `-E` for Windows arm64 portability or wrap with PCRE2 (`--pcre2`).
- **`PreToolUse` Read-before-Edit hook fires on every Write/Edit.** The hook required a fresh Read between every Write/Edit call. Worked around by reading the file once between each Write so the tool sequence remained deterministic; final file state is correct.

## Verification Run (Acceptance Criteria)

All acceptance criteria from the plan pass on the final committed file (`plugins/lz-advisor/references/orient-exploration.md` at commit `6ad60d2`):

| Criterion | Expected | Actual | Result |
|-----------|----------|--------|--------|
| File exists | yes | yes | PASS |
| `git grep -l "Type-symbol existence"` | path returned | path returned | PASS |
| `git grep -l "API currency"` | path returned | path returned | PASS |
| `git grep -l "Migration / deprecation"` | path returned | path returned | PASS |
| `git grep -l "Language semantics"` | path returned | path returned | PASS |
| `git grep -c "First action:"` | `>=6` | 6 | PASS |
| `git grep -c "When the question is about"` | `>=4` | 4 | PASS |
| No imperatives (`MUST|NEVER|REQUIRED|CRITICAL`) | zero matches | zero matches | PASS |
| ASCII-only | zero non-ASCII | zero non-ASCII | PASS |
| Word count | 350-700 | 681 | PASS |
| H1 header `# Orient Exploration: Pattern D` | present | present | PASS |
| `setCompodocJson` example | present | Class 3 example | PASS |
| `Storybook 10` example | present | Class 1 + Class 3 + Class 3 examples | PASS |

## Anchor Quotes from Anthropic 4.x Best-Practices Doc

The Pattern D file's shape and tone are anchored in four verbatim quotes from the canonical Anthropic 4.x best-practices doc (cited via 06-RESEARCH.md R-01):

1. "if you find that the model is not using your web search tools, clearly describe why and how it should." -- anchors the why-and-how shape of each class block (trigger sentence + first-action sentence).
2. "Tell Claude what to do instead of what not to do" -- anchors positive-form phrasing throughout.
3. "Use examples effectively. Examples are one of the most reliable ways to steer Claude's output format, tone, and structure." -- anchors the 1-2 worked classification examples per class.
4. "Where you might have said 'CRITICAL: You MUST use this tool when...', you can use more normal prompting like 'Use this tool when...'." -- anchors the no-imperatives-for-tool-steering rule (zero MUST/NEVER/REQUIRED/CRITICAL keywords in the file).

## User Setup Required

None -- no external service configuration required. The file is plain markdown loaded via Claude Code's `@`-reference mechanism at SKILL.md execution time.

## Next Phase Readiness

- The new shared reference is committed and ready to be `@`-loaded by Plan 02's SKILL.md edits in all four skills (`lz-advisor.plan`, `lz-advisor.execute`, `lz-advisor.review`, `lz-advisor.security-review`).
- Plan 02 should add a single `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md` line inside each SKILL.md's existing `<orient_exploration_ranking>` block per D-02. No retroactive churn on Patterns A / B inline canon (Phase 5.6 Plan 06 / 07 byte-identical canon stays intact).
- Plan 03's reshaped UAT prompts can rely on Pattern D's class boundaries to land each S1..S6 prompt unambiguously into a target class per D-04.
- Plan 04's smoke-test additions (web-usage gate + version bump) are independent of this plan and can proceed in parallel once Plan 02 completes.

## Self-Check: PASSED

- File created: `plugins/lz-advisor/references/orient-exploration.md` -- FOUND
- Commit `6ad60d2` -- FOUND in `git log`
- Acceptance criteria: all 13 PASS (file exists, four class names present, 6 First-action matches, 4 trigger sentences, zero imperatives, zero non-ASCII, 681 words in 350-700 range, H1 header present, anchored examples present)

---
*Phase: 06-address-phase-5-6-uat-findings*
*Plan: 01*
*Completed: 2026-04-28*
