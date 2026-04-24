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
- [x] Plan skill (`/lz-advisor.plan`) -- Sonnet orients, Opus advises, Sonnet produces actionable plan -- Validated in Phase 2
- [x] Execute skill (`/lz-advisor.execute`) -- full executor-advisor loop with 6 phases (orient, consult, execute, durable, final, complete) -- Validated in Phase 3
- [x] Execute skill accepts optional plan from `/lz-advisor.plan` via @ file mention -- Validated in Phase 3
- [x] Shared advisor-timing reference at plugin-root `references/` -- Validated in Phase 3
- [x] Review skill (`/lz-advisor.review`) -- Sonnet scans code, packages findings, Opus reviewer provides deep quality analysis with cross-cutting patterns -- Validated in Phase 4
- [x] Security review skill (`/lz-advisor.security-review`) -- Sonnet scans for attack surfaces, packages findings, Opus security-reviewer provides OWASP-informed threat analysis -- Validated in Phase 4
- [x] Both review skills produce structured severity-classified output (Critical/Important/Suggestion for review, Critical/High/Medium for security) -- Validated in Phase 4
- [x] Both review skills use scan-consult-output pattern consistent with plan and execute skills -- Validated in Phase 4
- [x] Review + security-review scan phases derive scope mechanically from git (not narrative) -- Validated in Phase 5.4 (Mechanism C + Narrative-Isolation Rule; live smoke test J)
- [x] Context-packaging Common Contract rules 5, 5a, 6 (external claim verification, fetched content isolation, graceful tool-use degradation) -- Validated in Phase 5.4 (live smoke tests C, B, H, I)
- [x] D-11 per-skill allowed-tools profile ladder (A for review skills, B for plan, C for execute) with WebSearch + WebFetch on all four -- Validated in Phase 5.4
- [x] Advisor + reviewer + security-reviewer response-structure polish: Position B Critical marker, inline Assuming X framing, two-slot outputs -- Validated in Phase 5.4 (D-runtime + E-runtime + F-runtime all [OK] in DEF-response-structure.sh; E-runtime closed at skill-orchestration layer via lz-advisor.plan Phase 3 stdout pass-through, Plan 07)

### Active

- [x] Opus advisor agent (`lz-advisor:advisor`) provides concise guidance (under 100 words, enumerated steps) -- Validated in Phase 5.2 (maxTurns: 3 structural fix + behavioral confirmation)
- [x] Skills inherit session model for executor (optimized for Sonnet 4.6) -- Validated in Phase 5
- [x] Advisor agent uses Opus 4.6 -- Validated in Phase 1
- [x] Advisor consultation timing follows Anthropic's suggested system prompt patterns -- Validated in Phase 5
- [x] Advisor output is trimmed: under 100 words, enumerated steps, not explanations -- Validated in Phase 5.2 (Visibility Model + effort: high)
- [x] Plugin components use `lz-advisor` prefix -- Validated in Phase 5.2 (skills renamed to `lz-advisor.*` dotted pattern)

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
- **Model availability**: Requires user has access to Sonnet 4.6 (or later) and Opus 4.7 (or later). The `model: opus` alias auto-resolves to the current Opus generation.
- **Prompt optimization**: Executor prompts optimized for Sonnet 4.6; advisor prompts optimized for Opus 4.7 (literal instruction following, lower baseline tool usage, task-calibrated response length).
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
| Mechanism C: review scope derives from git diff, not conversation | Plan narrative claiming "file X is unchanged" previously collapsed review scope. Mechanical derivation via `git diff HEAD --name-only` + `git ls-files --others --exclude-standard` with explicit Narrative-Isolation Rule makes the reviewer robust to executor framing. | Phase 5.4 validated (D-04/D-05/D-06) |
| Common Contract rule 5 + 5a: executor pre-verifies external claims; fetched content is untrusted source material | Executors routinely punt on "is method X still exported from package Y" rather than resolve during orient. Rule 5 mandates pre-verification with Pre-Verified Package Behavior Claims block; rule 5a wraps WebSearch/WebFetch content in `<fetched source trust="untrusted">` tags to block prompt-injection from docs. | Phase 5.4 validated (D-07/D-08/D-09/D-10) |
| Common Contract rule 6: graceful degradation on tool-use failure | Denied tools previously produced "Interrupted" halt. Rule 6 enumerates four sub-rules: primitive swap on first denial, cheaper-primitive fallback, mark-unavailable-and-continue, never halt. Pairs with D-11 three-profile allowed-tools ladder. | Phase 5.4 validated (D-13) |

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
*Last updated: 2026-04-24 -- Phase 5.6 complete: Finding E regression closed via Shape 3 diagnosis (stdout-echo vs JSONL measurement layer); density bifurcation + DEF JSONL redesign shipped; 6-session Compodoc UAT replay against real ngx-smart-components validated S4 overage resolved (-22w) and S5 mid-execute calls eliminated; plugin bumped to 0.8.1. v1.0 milestone ready for audit.*
