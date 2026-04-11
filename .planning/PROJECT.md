# lz-advisor

## What This Is

A Claude Code marketplace plugin that implements the advisor strategy -- pairing a stronger advisor model (Opus) with a faster executor model (Sonnet) -- using only Claude Code's native plugin components (skills, agents). No Claude API or `advisor_20260301` tool dependency. Users invoke skills that orchestrate an executor-advisor loop where Sonnet drives the work and consults an Opus agent at strategic moments for concise guidance.

## Core Value

Near-Opus intelligence at Sonnet cost for coding tasks, achieved through strategic advisor consultation at high-leverage moments rather than running Opus end-to-end.

## Requirements

### Validated

- [x] Plugin manifest and directory structure (INFRA-01, INFRA-02) -- Validated in Phase 1
- [x] Opus advisor agent discoverable and invocable (ADVR-01, ADVR-02, ADVR-03, ADVR-04, ADVR-05) -- Validated in Phase 1
- [x] Advisor timing reference file (INFRA-03) -- Validated in Phase 1
- [x] Agent namespaced as `lz-advisor:lz-advisor` when loaded via `--plugin-dir` -- discovered in Phase 1 UAT

### Active

- [ ] Opus advisor agent (`lz-advisor`) provides concise guidance (under 100 words, enumerated steps)
- [ ] Plan skill (`/lz-advisor.plan`) -- Sonnet orients, Opus advises, Sonnet produces actionable plan
- [ ] Execute skill (`/lz-advisor.execute`) -- full executor-advisor loop with advisor consulted before substantive work, when stuck, and before declaring done
- [ ] Execute skill accepts optional plan from `/lz-advisor.plan` or other sources
- [ ] Review skill (`/lz-advisor.review`) -- Sonnet scans code, Opus advisor provides deep quality analysis
- [ ] Security review skill (`/lz-advisor.security-review`) -- Sonnet scans for attack surfaces, Opus advisor provides threat analysis
- [ ] Skills inherit session model for executor (optimized for Sonnet 4.6)
- [ ] Advisor agent uses Opus 4.6
- [ ] Advisor consultation timing follows Anthropic's suggested system prompt patterns
- [ ] Advisor output is trimmed: under 100 words, enumerated steps, not explanations
- [ ] Plugin components use `lz-advisor` prefix

### Out of Scope

- Claude API / Anthropic SDK dependency -- plugin uses Claude Code's Agent tool only
- `advisor_20260301` server-side tool -- plugin replicates the pattern client-side
- Hooks -- advisor consultation stays purely skill-driven for v1 (cost control, no noise)
- Task-type-specific skills (refactoring, testing, infra) -- phase-based skills cover all task types
- Automatic advisor triggering -- user explicitly invokes skills

## Context

- Based on Anthropic's "advisor strategy" blog post (April 9, 2026) and advisor tool docs
- The API advisor tool shows: Sonnet + Opus advisor = +2.7pp on SWE-bench Multilingual at 11.9% lower cost
- Key insight: advisor adds most value on first call (before approach crystallizes) and final check (after work done)
- Suggested system prompt timing: after orientation before substantive work, when stuck, when changing approach, when done
- Trimming advisor output by ~35-45% with conciseness instruction without changing call frequency
- Claude Code's Agent tool supports `model: "opus"` overrides for spawning advisor agents
- Plugin-dev and skill-creator plugins define best practices for component design
- Skill-creator plugin is authoritative for agent skill guidelines, overriding plugin-dev overlap

## Constraints

- **Platform**: Claude Code marketplace plugin only -- no standalone API usage
- **Dependencies**: Zero external dependencies -- Claude Code Agent tool is the only mechanism
- **Model availability**: Requires user has access to both Sonnet 4.6 and Opus 4.6
- **Prompt optimization**: Executor prompts optimized for Sonnet 4.6, advisor prompts optimized for Opus 4.6
- **Cost**: Advisor consultations should be strategic (2-3 per task), not per-tool-call

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phase-based skills over task-type skills | Advisor timing pattern is the same regardless of task type (refactor, test, feature) -- prompt concern, not orchestration concern | -- Pending |
| No hooks for v1 | Hooks are global (can't scope to skill execution), lack conversation context, and would add cost/noise without clear value | -- Pending |
| Single advisor agent, multiple skills | Skills define the workflow; agent defines the advisor persona. Review variants differ by prompt, not orchestration | -- Pending |
| Inherit session model for executor | Users choose their session model; plugin shouldn't override. Skills optimized for Sonnet 4.6 but work with any model | -- Pending |
| Agent file renamed to `advisor.md` (qualified: `lz-advisor:advisor`) | Original `lz-advisor.md` produced redundant `lz-advisor:lz-advisor`. Renamed to `advisor.md` so qualified name is `lz-advisor:advisor`. Skills use `lz-advisor:advisor` as `subagent_type`. | Phase 1 UAT rename |
| All skills use advisor pattern (no `context: fork`) | Review skills with `context: fork` + `model: opus` would be indistinguishable from `/review` + `/model opus`. Advisor pattern (Sonnet scans, packages context, Opus advises) genuinely differentiates. Consistent architecture across all skills. | -- Pending |
| Conciseness calibration deferred to Phase 2 | Under 100 words constraint not respected with broad open-ended questions. Scoped skill prompts may suffice; measure with real invocations before tuning agent system prompt. | Phase 1 UAT finding |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -- still the right priority?
3. Audit Out of Scope -- reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 after Phase 1 completion*
