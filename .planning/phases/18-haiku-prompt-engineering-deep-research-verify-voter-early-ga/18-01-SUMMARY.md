---
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
plan: 01
subsystem: testing
tags: [haiku, prompt-engineering, eval, verify-voter, fairness, references, claude-4-best-practices]

# Dependency graph
requires:
  - phase: 17-schema
    provides: "frozen vote-record contract (verdict enum + reserved voter envelope) in references/lz-deep-research-schema.md that the Haiku voter prompt targets"
provides:
  - "EVAL-05 deliverable: plugins/lz-advisor/references/lz-haiku-prompt-engineering.md -- the shipped, pure-prose Haiku 4.5 prompt-engineering reference (H1-H12 verified techniques + D-08 fairness framing + stale-pattern corrections)"
  - "The D-08 fairness premise stated in writing: the Haiku voter prompt is engineered to the SAME task contract as the Sonnet baseline (identical schema, dataset, grader)"
  - "A research-grounded prompt grounding that PRECEDES authoring any Haiku agent (consumed by Plan 18-05 and the Phase-19 Haiku search-worker author)"
affects: [18-05-haiku-voter-author, 19-search-extract-workers, haiku-prompt-engineering]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "House-style references/ doc: lead with 'single source of truth for ...', name downstream consumers explicitly, reference scripts via ${CLAUDE_PLUGIN_ROOT}, anti-drift framing (mirrors lz-deep-research-schema.md)"
    - "Verified-source tagging: every load-bearing technique carries a [CITED: ...] tag; un-promoted claims keep [ASSUMED] verbatim (T-18-01 mitigation)"

key-files:
  created:
    - plugins/lz-advisor/references/lz-haiku-prompt-engineering.md
  modified: []

key-decisions:
  - "Authored EVAL-05 as a shipped plugin-tree references/ doc (pure prose, zero-dep), per the architectural responsibility map -- it ships with the plugin and is consumed by the planner + the Haiku-agent author"
  - "Preserved the [ASSUMED] tags on H7 (abstain-when-unsure) and H10 (step-bounded 3-5 steps) verbatim; did NOT promote either assumption to a verified fact (T-18-01 information-integrity mitigation)"
  - "Stated the stale-pattern corrections (budget_tokens deprecated, prefill 400 on 4.6, CRITICAL/MUST/NEVER overtriggers, stale Structured-Outputs BETA caveat) as a section the Haiku prompt must avoid; named lz-nx-ai-plugins MODEL-OPTIMIZATION-HAIKU.md as the NON-authoritative starting point only"
  - "Section ordering (Claude's Discretion per D-CONTEXT): fairness framing first, then sourcing note, then H1-H12, then Haiku facts, then stale patterns, then provenance tracking -- fairness leads because it is the load-bearing premise of the whole phase"

patterns-established:
  - "EVAL-05 fairness contract: the Haiku voter is NOT a Sonnet prompt on model: haiku and NOT an unfairly-tuned variant -- it targets the same frozen verdict enum and reserved envelope so the eval measures MODEL capability"
  - "Stale-pattern guardrails for cheap-model prompts: no budget_tokens, no prefill, plain phrasing over CRITICAL/MUST/NEVER"

requirements-completed: [EVAL-05]

# Metrics
duration: 7min
completed: 2026-06-16
---

# Phase 18 Plan 01: Haiku Prompt-Engineering Reference Artifact (EVAL-05) Summary

**Shipped a pure-prose references/ doc capturing 12 verified Haiku 4.5 prompt-engineering techniques (H1-H12), the D-08 fairness framing, and the stale-pattern corrections -- the research grounding that must precede authoring any Haiku agent.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-16T09:26:00Z
- **Completed:** 2026-06-16T09:33:01Z
- **Tasks:** 1
- **Files modified:** 1 (created)

## Accomplishments

- Created `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` -- the EVAL-05 deliverable: a shipped, zero-dep, pure-prose reference doc.
- Opened with the D-08 fairness framing paragraph: the Haiku voter prompt is engineered to the SAME task contract as the Sonnet baseline (identical schema, identical dataset, identical grader), so the gating eval measures MODEL capability, not prompt quality.
- Named the downstream consumers explicitly: the author of `agents/research-verify-voter-haiku.md` (Plan 18-05) and the Phase-19 Haiku search-worker author.
- Carried all 12 verified techniques H1-H12 from 18-RESEARCH.md, each as a section with WHAT it is, WHY it helps a cheap model on a skeptic-voter task, and the verified source tag (`[CITED: ...]`) exactly as in RESEARCH; preserved the `[ASSUMED]` tags on H7 and H10 verbatim.
- Added a "Stale patterns to AVOID" section: `budget_tokens` deprecated, prefill returns 400 on 4.6, aggressive `CRITICAL`/`MUST`/`NEVER` overtriggers, and the stale Structured-Outputs BETA caveat; stated that the local `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` was used ONLY as a NON-authoritative starting point with every used item re-verified.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author the Haiku prompt-engineering reference artifact (EVAL-05)** - `08876be` (docs)

**Plan metadata:** (this SUMMARY + STATE/ROADMAP updates committed separately)

## Files Created/Modified

- `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` - The EVAL-05 reference artifact (259 lines): fairness framing, sourcing note, H1-H12 verified techniques, Haiku 4.5 facts, stale-pattern corrections, provenance/assumption tracking.

## Decisions Made

- Authored as a shipped plugin-tree `references/` doc (pure prose, zero-dep), consistent with the architectural responsibility map and the house-style analog (`lz-deep-research-schema.md` / `verify-target-selection.md`).
- Used one section per technique (rather than a single table) for H1-H12 so each carries its own WHAT / WHY-for-a-cheap-model / source prose; the verified source tags are reproduced exactly as in RESEARCH.
- Preserved both `[ASSUMED]` tags verbatim and added a dedicated provenance section restating the A1/A3 risk-if-wrong context, so no assumption is laundered into a verified fact (T-18-01 mitigation).
- Section ordering (Claude's Discretion): fairness framing first because it is the load-bearing premise of the entire phase.

## Deviations from Plan

None - plan executed exactly as written. The single task was a doc-authoring task transforming the already-complete 18-RESEARCH.md (H1-H12 table, State of the Art stale-pattern table, Fairness framing note, Assumptions Log A1-A8) into the shipped artifact, preserving the `[CITED:]`/`[ASSUMED]` tags verbatim. No bugs, no missing critical functionality, no blocking issues, no architectural changes.

## Issues Encountered

None.

## Security / Threat Surface

- T-18-01 (Tampering / information integrity of the technique claims): MITIGATED as planned. Every load-bearing technique carries a `[CITED: ...]` verified-source tag; the two `[ASSUMED]` tags (H7, H10) are preserved verbatim and explicitly flagged as non-load-bearing for the gate. No technique is asserted as fact without a source.
- T-18-02 (Information Disclosure of the shipped doc): ACCEPTED as planned. Pure-prose public reference; no secrets, no tokens, no PII; ships with the open-source plugin by design.
- No new threat surface introduced (no network endpoints, auth paths, file access, or schema changes).

## Verification

- Plan automated gate (`test -f ... && node -e "..."`): **OK**. The file exists, contains zero non-ASCII / box-drawing / emoji codepoints (confirmed via a full byte scan: 0 non-ASCII codepoints), carries `CITED:` source tags, and contains the `budget_tokens` / `prefill` stale-pattern corrections.
- Acceptance-criteria scan: all 12 checks pass -- D-08 fairness paragraph (same schema/dataset/grader; measures MODEL capability not prompt quality), lz-nx-ai-plugins named NON-authoritative, budget_tokens deprecated + prefill 400 + CRITICAL/MUST/NEVER overtriggers corrections, >=12 `[CITED:]` tags, `[ASSUMED]` tags preserved, downstream consumers (Plan 18-05 + Phase-19 search-worker) named, `${CLAUDE_PLUGIN_ROOT}` reference present, H1..H12 all present.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- EVAL-05 is satisfied at the artifact level: the research-grounded Haiku prompt-engineering reference exists and PRECEDES any Haiku agent (the fairness premise D-08 holds).
- The artifact is ready to be consumed by Plan 18-05 (the `research-verify-voter-haiku.md` author) and later by the Phase-19 Haiku search-worker author.
- No blockers. The remaining Phase 18 work (voter agents, eval/ harness scaffolding, dataset loader, eval aggregator with the pinned jstat CI math, the pre-registered lock rule, and the live gating eval) is unaffected by this plan.

## Self-Check: PASSED

- File exists: `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` -- FOUND.
- Commit exists: `08876be` -- FOUND in git log.

---
*Phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga*
*Completed: 2026-06-16*
