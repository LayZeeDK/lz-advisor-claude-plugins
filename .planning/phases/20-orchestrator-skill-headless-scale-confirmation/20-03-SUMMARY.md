---
phase: 20-orchestrator-skill-headless-scale-confirmation
plan: 03
subsystem: skills
tags: [lz-deep-research, orchestrator, skill, advisor-strategy, wave-batch, aggregator, opus-gates, citation-provenance, progressive-disclosure]

# Dependency graph
requires:
  - phase: 16-deterministic-off-model-aggregator
    provides: the frozen off-model aggregator (lz-deep-research-aggregate.mjs) the skill shells once per stage
  - phase: 17-json-schema-verification-contract
    provides: the frozen JSON shapes (survivor record, report claim record, tally rubric, confidence enum, named ceilings, two assurances)
  - phase: 19-search-extract-worker-agents
    provides: research-search-worker / research-extract-worker / research-verify-voter-sonnet / advisor agents the skill dispatches
  - phase: 20-orchestrator-skill-headless-scale-confirmation
    provides: Plan 20-01 additive escalate flag + load_bearing carry + AUDIT_SAMPLE_RATE on the aggregator/schema the skill consumes
provides:
  - the lz-deep-research orchestrator SKILL.md (workstream A main deliverable) wiring the 7-phase pipeline as a thin dispatcher
  - the lz-deep-research-orchestration.md progressive-disclosure reference (report micro-format, citation join, two-gate packaging, wave-batch/per-invocation-model reminders)
affects: [20-04-headless-scale-spike, 20-05-live-cert-harvest, gsd-verifier, milestone-audit]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Thin-dispatcher orchestrator skill: main session holds only receipts + bounded summaries + 2 advisor notes; the off-model aggregator and worker subagents do the volume"
    - "Progressive disclosure into references/ with @-mention; no cross-skill body references (shared knowledge lives in the reference)"
    - "Per-invocation model dispatch (frontmatter model: inert); allowed-tools as parsed-not-enforced documentation"

key-files:
  created:
    - plugins/lz-advisor/skills/lz-deep-research/SKILL.md
    - plugins/lz-advisor/references/lz-deep-research-orchestration.md
  modified: []

key-decisions:
  - "Frontmatter allowed-tools declares bare Agent (the skill dispatches many agents) + Bash(node:*) command-prefix form, as documentation/intent (D-10)"
  - "Eval-only Opus voter is referred to descriptively (the Opus voter variant), never by its literal agent name, so the SKILL.md satisfies the zero-hit git grep gate while keeping the prohibition explicit (D-18)"
  - "Two @-mentions: the new orchestration reference (report micro-format/citation/two-gate packaging) AND the existing schema reference (frozen JSON shapes) -- the skill points at both, inlines neither"
  - "Run-dir directory names in the SKILL body match the schema's frozen run-dir layout byte-for-byte (candidates/, claims/, excerpts/, sources/, votes/)"

patterns-established:
  - "7-phase deep-research orchestrator: scope -> decompose+Gate1 -> search -> extract -> aggregate -> verify -> synthesize+Gate2 (mirrors lz-execute phase-block convention)"
  - "Wave-batch as a hard counted skill-body instruction: N = min(remaining, 5) foreground per turn, ceil(count/5) sub-waves, never a sixth concurrent Agent call"
  - "aggregate -> dispatch -> aggregate with cluster-id vote keying; escalate flag read from survivors.json drives the re-vote (never recomputed off-disk)"

requirements-completed: [PIPE-01, PIPE-02, PIPE-06, PIPE-08, PIPE-09, COST-01, COST-03, COST-04, AGG-05]

# Metrics
duration: ~11min
completed: 2026-06-19
---

# Phase 20 Plan 03: Orchestrator skill + orchestration reference Summary

**Authored the lz-deep-research orchestrator SKILL.md as a thin 7-phase dispatcher (scope -> decompose+Gate1 -> search -> extract -> aggregate -> verify -> synthesize+Gate2) plus its progressive-disclosure reference, wiring the frozen aggregator, the four worker/advisor agents, the escalate re-vote, the wave-batch <=5 cap, cluster-id vote keying, exactly-two Opus gates, per-invocation model dispatch, and the 5-section cited report on the Anthropic-API floor.**

## Performance

- **Duration:** ~11 min authoring (across a quota-reset boundary; bookkeeping completed after resume)
- **Started:** 2026-06-19T20:48:00Z
- **Completed:** 2026-06-19T20:58:53Z
- **Tasks:** 2
- **Files modified:** 2 (both created)

## Accomplishments

- Authored `references/lz-deep-research-orchestration.md` (170 lines): the report 5-section micro-format (D-11), the citation-provenance join + canonical-URL rule (D-17), the two advisor-gate consult packaging (COST-01/D-18), and the wave-batch + per-invocation-model reminders (D-08/D-15) -- the single progressive-disclosure home so the SKILL.md stays free of cross-skill body references.
- Authored `skills/lz-deep-research/SKILL.md` (236 lines): the thin-dispatcher orchestrator wiring the full SESSION-DESIGN section-5 pipeline, mirroring `lz-execute`'s frontmatter + phase-block + @-mention conventions.
- Both files pass the plan's `<verify>` git grep gates and all zero-hit acceptance gates; run-dir directory names match the frozen schema layout; ASCII-only; no fenced code blocks inside instructions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author the orchestration reference** - `4d00762` (docs)
2. **Task 2: Author the SKILL.md orchestrator** - `2e8d21c` (feat)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `plugins/lz-advisor/references/lz-deep-research-orchestration.md` - Progressive-disclosure reference: report micro-format, citation/claim_support rules, two-gate advisor packaging, wave-batch/per-invocation-model reminders.
- `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` - The orchestrator skill: frontmatter (name lz-deep-research, third-person description with trigger phrases + sibling exclusion, version 2.1.0, allowed-tools with bare Agent + Bash(node:*)) and a 7-phase body wiring scope-guard, decompose+Gate1, search wave, extract wave, aggregate stage-1, verify wave + aggregate stage-2, and synthesize+Gate2.

## Decisions Made

- **Eval-only Opus voter referenced descriptively, not by literal name.** Task 2's acceptance criterion is a hard `git grep "research-verify-voter-opus"` zero-hit gate. The initial draft named the eval-only voter twice in prohibition statements ("Never spawn research-verify-voter-opus"), which would have failed the literal gate. Rewrote both prohibitions to "the Opus voter variant ... eval-reference-only" -- the prohibition stays explicit and the zero-hit gate passes. The Sonnet voter we DO spawn (`research-verify-voter-sonnet`) is still named explicitly.
- **Two @-mentions, not one.** The plan's Task 2 names the orchestration reference; the SKILL.md also @-mentions the existing schema reference so the frozen JSON shapes (survivor record + escalate, report claim record, tally rubric, ceilings, two assurances) are reachable without inlining them. Both are progressive-disclosure pointers; neither is inlined.
- **`allowed-tools` declares bare `Agent`.** The deep-research orchestrator dispatches many agents per invocation, so it declares bare `Agent` (vs lz-execute's narrowed `Agent(lz-advisor:advisor)`), with `Bash(node:*)` in command-prefix form, as documentation/intent per D-10.

## Deviations from Plan

None - plan executed exactly as written. The descriptive rewrite of the eval-only voter prohibition (above) is a faithful realization of acceptance criterion 2 (the zero-hit `git grep` gate is the explicit success condition), not a scope change: it keeps the D-18 discipline the plan requires while satisfying the gate as the plan worded it.

## Issues Encountered

- **Quota-reset boundary mid-plan.** Both authoring tasks (Task 1 `4d00762`, Task 2 `2e8d21c`) committed before a quota reset interrupted the session ahead of plan-completion bookkeeping. On resume, re-ran the plan's `<verify>` markers against the committed files (Task 1 gate 14 matches, Task 2 gate 24 matches, all zero-hit gates clean) and produced this bookkeeping without re-authoring or re-editing the two committed files.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The orchestrator skill + its reference are complete and contract-aligned with the frozen aggregator (Phase 16), schema (Phase 17), workers/advisor (Phase 19), and the Plan 20-01 escalate/load_bearing extension. The skill is ready for the Plan 20-04 SC-5 headless-scale spike (`claude -p --output-format stream-json`, max-in-flight <=5 across >=3 waves, advisor spawns == 2) and the Plan 20-05 live-cert harvest.
- INTEG-01 (discoverability of `lz-advisor:lz-deep-research`), INTEG-02 (`.gitignore` of `.lz-research/`), and the behavioral confirmation of PIPE-01/02/09 + COST-01/03 + AGG-05 land in the Plan 20-04 spike; this plan delivers the static wiring those spikes exercise.

## Self-Check: PASSED

Created files verified on disk:
- FOUND: plugins/lz-advisor/skills/lz-deep-research/SKILL.md
- FOUND: plugins/lz-advisor/references/lz-deep-research-orchestration.md
- FOUND: .planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-03-SUMMARY.md

Task commits verified in git log:
- FOUND: 4d00762 (Task 1: orchestration reference)
- FOUND: 2e8d21c (Task 2: orchestrator SKILL.md)

Plan `<verify>` markers re-run against the committed files: Task-1 gate 14 matches, Task-2 gate 24 matches; zero-hit gates (research-verify-voter-opus, CLAUDE_SKILL_DIR, bedrock/vertex/foundry in SKILL.md; cross-skill body refs in the orchestration reference) all clean.

---
*Phase: 20-orchestrator-skill-headless-scale-confirmation*
*Completed: 2026-06-19*
