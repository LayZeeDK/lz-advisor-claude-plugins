# Project Research Summary

**Project:** lz-advisor -- Claude Code marketplace plugin implementing the advisor strategy
**Domain:** Claude Code plugin (multi-model Opus/Sonnet orchestration)
**Researched:** 2026-04-10
**Confidence:** HIGH

## Executive Summary

The lz-advisor plugin implements Anthropic's advisor strategy as a zero-dependency Claude Code marketplace plugin. The core mechanism is straightforward: one Opus 4.6 advisor agent paired with multiple skill definitions that orchestrate executor-advisor consultation loops. The advisor agent uses the `model: opus` frontmatter field to ensure it always runs on Opus regardless of the user's session model, while all mechanical execution (file reads, writes, tool calls) stays in the cheaper session model (typically Sonnet 4.6). Anthropic's benchmarks validate this approach: Sonnet 4.6 medium-effort with an Opus advisor achieves 63.4% on Terminal-Bench 2.0 at $0.88 cost, while Sonnet alone scores 59.6% at $0.94 -- better intelligence at lower cost.

The recommended approach is four skills covering the development lifecycle: plan (orient then consult Opus before making a plan), implement (full executor-advisor loop with Anthropic's timing pattern), review (Opus runs directly via `context: fork`), and security review (same fork pattern with security-specific prompt). The advisor agent enforces conciseness -- under 100 words, enumerated steps -- which Anthropic proved cuts output tokens 35-45% without quality loss. The key architectural insight is that subagents in Claude Code do NOT automatically inherit conversation context, unlike the API `advisor_20260301` tool. Every advisor invocation requires the executor to explicitly package relevant context (task, orientation findings, current state) into the agent prompt. This is the primary prompt engineering challenge for the plugin.

The two largest risks are cost runaway and silent failures. Cost runaway happens when advisor consultations trigger too frequently (overtriggering from aggressive prompt language) or produce verbose output (missing conciseness instruction). Silent failures happen when `plugin.json` contains unrecognized fields, causing the entire plugin to fail loading with no error message. Both risks are fully preventable with known mitigations: use calm natural language ("use this when" not "CRITICAL: MUST"), enforce the conciseness instruction from day one, and keep `plugin.json` minimal. Every pitfall documented has a concrete prevention strategy from Anthropic's official documentation or confirmed GitHub issues.

## Key Findings

### Recommended Stack

This plugin has zero external dependencies -- no npm packages, no build steps, no API calls. The entire stack is Claude Code's native plugin component system: one agent definition (Markdown + YAML frontmatter with `model: opus`), four skills (Markdown with frontmatter), and a `plugin.json` manifest. All components are discovered automatically by Claude Code from standard directories (`agents/`, `skills/*/SKILL.md`, `.claude-plugin/plugin.json`). Distribution is via GitHub as a marketplace plugin; installation requires no configuration beyond enabling the plugin.

**Core technologies:**
- Agent definition (`agents/lz-advisor.md`): Opus advisor persona -- the `model: opus` frontmatter field is the sole mechanism for spawning Opus from a Sonnet session; `effort: high` ensures deep strategic reasoning
- Inline skills (`skills/lz-advisor-plan/`, `skills/lz-advisor-execute/`): Orchestrate executor-advisor workflows; run in the session model's context with full conversation history
- Forked skills (`skills/lz-advisor-review/`, `skills/lz-advisor-security-review/`): Run Opus directly via `context: fork` + `model: opus`; no executor-advisor loop needed for reviews
- Plugin manifest (`.claude-plugin/plugin.json`): Must be kept minimal; any unrecognized field causes silent loading failure
- Reference files (`references/advisor-timing.md`): Detailed Anthropic timing guidance offloaded from SKILL.md to stay under the 5,000-token compaction limit

### Expected Features

**Must have (table stakes):**
- Opus advisor agent with concise output (under 100 words, enumerated steps) -- the plugin's core mechanism; without it, there is no product
- Plan skill: orient -> Opus consult -> produce actionable plan; faster and simpler than compound-engineering's 3-agent research pipeline
- Execute skill: full Anthropic timing pattern (consult before work, when stuck, when changing approach, before declaring done); the plugin's highest-value feature
- Review skill: Opus direct review of completed work via `context: fork`; table stakes for coding plugins in 2026
- Advisor consultation at Anthropic-recommended timing points -- wrong timing means the advisor adds no value regardless of model quality
- Conciseness enforcement in advisor system prompt -- without it, the cost advantage disappears
- Accept external plan files in execute skill -- rejecting external plans blocks adoption from users of compound-engineering, deep-plan, or manual specs

**Should have (competitive):**
- Security review skill: dedicated threat-modeling lens from Opus, rare in the ecosystem; prompt variation of review skill, not a new orchestration pattern
- Reconciliation pattern: when executor empirical findings contradict advisor guidance, one targeted advisor call resolves the conflict rather than silent switching
- Durable deliverable enforcement: write all files before the final advisor call, protecting work from session timeouts during Opus inference
- Zero external dependencies: major UX advantage over compound-engineering (optional Gemini/OpenAI) and deep-plan (optional external LLM)

**Defer (v2+):**
- Hooks-based automatic advisor triggering: hooks are global, lack conversation context, add cost with no user intent signal
- Task-type-specific skills (refactor, test, infra): advisor timing pattern is identical regardless of task type; user's prompt provides context; would duplicate skill logic with minor prompt variations
- Multi-agent parallel review: compound-engineering's approach; contradicts this plugin's single-focused-Opus value proposition
- Plan storage and lifecycle management: unnecessary complexity; plans are conversation artifacts; execute skill accepts a plan file path but does not manage plan lifecycle

### Architecture Approach

The architecture splits into two execution patterns determined by whether the skill needs iterative tool use. Plan and execute skills run inline (no `context: fork`) so the Sonnet executor retains full conversation history and drives all tool calls; the skill instructs the executor when to spawn the `lz-advisor` agent via the Agent tool. Review and security-review skills run as forked Opus contexts (`context: fork` + `model: opus`): Opus runs the review directly with no executor-advisor loop, because reviews need deep analysis of completed work with no file editing. The critical constraint throughout: subagents cannot spawn other subagents, the advisor agent must be text-only (read-only tools at most), and the executor must package all needed context into the agent invocation prompt since subagents do not inherit parent conversation history.

**Major components:**
1. `lz-advisor` agent (`agents/lz-advisor.md`) -- Opus 4.6, effort: high, tools: Read/Glob, maxTurns: 1; strategic consultant only, never takes action
2. `lz-advisor-plan` skill -- inline, session model, no effort override; orient -> consult -> produce plan; testbed for advisor prompt calibration
3. `lz-advisor-execute` skill -- inline, session model, no effort override; full Anthropic timing loop with stuck detection, reconciliation, and durable deliverable enforcement
4. `lz-advisor-review` skill -- forked, model: opus, effort: high, read-only git tools; Opus runs review directly; no advisor loop
5. `lz-advisor-security-review` skill -- same fork pattern as review, OWASP-focused prompt with threat modeling lens
6. `references/advisor-timing.md` -- Anthropic's timing guidance loaded on demand; keeps SKILL.md lean for compaction resilience

### Critical Pitfalls

1. **Aggressive prompt language causes overtriggering** -- Opus/Sonnet 4.6 are far more responsive to system prompts than older models. "CRITICAL: MUST" language triggers advisor calls on every turn, exploding Opus cost. Use calm natural language: "call the advisor when..." not "ALWAYS call when in doubt." Monitor call frequency; more than 3 advisor calls per typical task signals over-aggressive prompting. Anthropic's official docs explicitly address this migration from pre-4.6 prompting patterns.

2. **Advisor called too late (after approach crystallizes)** -- Without explicit timing guidance, executors treat the advisor as a "check my work" tool and call it after writing code. At that point the advice is largely useless (sunk cost). Embed Anthropic's timing block verbatim: "Call advisor BEFORE substantive work -- before writing, before committing to an interpretation. Orientation is not substantive work. Writing, editing, and declaring an answer are." Anthropic's benchmarks show the first advisor call (before approach crystallizes) contributes most of the intelligence gain.

3. **Verbose advisor output eliminates cost advantage** -- Opus without conciseness instructions produces 400-700 word explanations at $75/MTok output rate. A single instruction in the advisor system prompt -- "respond in under 100 words and use enumerated steps, not explanations" -- cuts output tokens 35-45% without quality loss (Anthropic internal testing). This must be in the agent definition from day one.

4. **Silent plugin manifest failures** -- `plugin.json` with any unrecognized field causes the entire plugin to silently fail to load. Skills appear installed but never trigger. No error message is shown. Keep the manifest minimal. Test with `claude --debug` immediately after installation and verify all skill names appear in the registration output. Multiple confirmed GitHub issues (#20409, #30366, #31384) document this behavior.

5. **Subagent context isolation** -- Unlike the API `advisor_20260301` tool (which sees the full transcript automatically), Claude Code subagents start with a fresh context. The executor MUST package relevant context into the agent invocation prompt: original task, orientation findings, current state, specific question. Skill prompts must explicitly instruct this context packaging or the advisor gives generic responses unrelated to the user's actual task. This is the primary architectural difference between the plugin approach and the API tool approach.

## Implications for Roadmap

Based on research, the build order is determined by hard dependencies and learning opportunities. The advisor agent must exist before any inline skill can reference `Agent(lz-advisor)`. The plan skill is simpler than implement and serves as a testbed for advisor prompt calibration. Review skills have no dependency on the advisor agent (they use `context: fork` to run Opus directly) and can be built independently.

### Phase 1: Plugin Scaffold and Advisor Agent

**Rationale:** Everything depends on the plugin manifest and the advisor agent. Getting the scaffold right first avoids the manifest validation pitfall entirely. The advisor agent is the most critical component -- its model setting, effort level, tool restrictions, and conciseness instruction affect every subsequent skill that invokes it.
**Delivers:** Working plugin with the advisor agent discoverable and invocable; manifest validated with `claude --debug`; advisor callable via Agent tool with Opus model, effort: high, read-only tools, and conciseness enforcement in system prompt
**Addresses:** Opus advisor agent (table stakes #1)
**Avoids:** Silent manifest failures (Pitfall 5), verbose advisor output (Pitfall 4), advisor given write tools (Pitfall 13)

### Phase 2: Plan Skill

**Rationale:** Simplest orchestration pattern (orient -> consult -> produce). Serves as the testbed for tuning context packaging instructions and validating that advisor timing works correctly before tackling the more complex execute skill. Learnings from this phase -- description optimization, context packaging prompt wording, advisor call frequency calibration -- directly improve the execute skill design.
**Delivers:** Working `/lz-advisor.plan` skill; user can get Opus-guided strategic plans before writing code; validated context packaging pattern
**Addresses:** Plan skill (table stakes #2), advisor timing (table stakes #5)
**Avoids:** Late advisor call (Pitfall 2), subagent context isolation requiring explicit context packaging (Pitfall 5 architectural), skill description truncation (Pitfall 7)

### Phase 3: Execute Skill

**Rationale:** The core workflow and highest-value feature. More complex than plan because it requires multi-phase conditional advisor calls (before work, when stuck, when changing approach, before done), stuck detection heuristics, reconciliation pattern, and durable deliverable enforcement. Builds on plan skill learnings about context packaging and advisor prompt tone.
**Delivers:** Working `/lz-advisor.execute` skill; full executor-advisor loop covering the complete development cycle; accepts optional external plan file
**Addresses:** Execute skill (table stakes #3), advisor timing (table stakes #5), external plan acceptance (table stakes #7), reconciliation (differentiator), durable deliverable enforcement (differentiator)
**Avoids:** Late advisor call (Pitfall 2), blind advice following without empirical check (Pitfall 3), missing durable deliverable before final advisor call (Pitfall 6), overtriggering from aggressive prompting (Pitfall 1)

### Phase 4: Review Skills

**Rationale:** Review and security review share the same forked-Opus architectural pattern and can be built in parallel with each other. They have no dependency on the advisor agent (they run Opus directly via `context: fork`). Placed after implement because implement is the higher priority feature and because review skill descriptions benefit from description optimization lessons learned in phases 2-3. Security review is a prompt variation of the review skill, not a new orchestration pattern -- build them together.
**Delivers:** Working `/lz-advisor.review` and `/lz-advisor.security-review` skills; completes the development lifecycle (plan -> implement -> review); Opus holistic review vs. compound-engineering's 12-parallel-Sonnet approach
**Addresses:** Review skill (table stakes #4), security review (differentiator #1)
**Avoids:** Using `context: fork` for plan/execute (Anti-Pattern 3); `context: fork` correctly scoped to review only; review skill similarity confusion requiring differentiated descriptions (Pitfall 20)

### Phase 5: Polish, Docs, and Marketplace Publication

**Rationale:** After all components exist and are individually validated, address cross-cutting concerns: skill-creator description optimization eval loops, README with installation verification steps, plugin version hygiene, and full marketplace install flow testing (not just `--plugin-dir` development flow). Several pitfalls are documentation/distribution concerns rather than code concerns and belong in this phase.
**Delivers:** Marketplace-ready plugin with optimized skill descriptions, cost expectation documentation, installation verification guide, and validated full install flow
**Addresses:** All competitive differentiators documented; zero-dependency advantage communicated clearly
**Avoids:** Install-not-enabled bug (Pitfall 11), version caching preventing updates (Pitfall 15), cost tracking blind spots undermining user trust (Pitfall 19), skill descriptions truncated before key trigger words (Pitfall 7)

### Phase Ordering Rationale

- Agent before skills: hard dependency -- `Agent(lz-advisor)` in skill `allowed-tools` requires the agent to exist first
- Plan before implement: plan validates the advisor consultation mechanism with simpler orchestration; implement borrows the proven context packaging pattern
- Review skills after implement: no hard dependency, but description optimization lessons from phases 2-3 improve review skill descriptions; both review skills share one architectural pattern and can be built in parallel
- Polish after code: description optimization requires working skills to run against; marketplace testing requires all components to be complete
- Subagent context isolation (the primary architectural difference from the API tool) is addressed in Phase 1 (agent design) and Phase 2 (skill context packaging instructions) rather than being discovered late

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Plan skill):** Skill description optimization is empirical -- requires running skill-creator eval loops with realistic trigger queries after the skill is drafted. The right keyword placement and description length can only be confirmed by testing with multiple plugins installed simultaneously.
- **Phase 3 (Execute skill):** Stuck detection thresholds (when exactly to trigger a mid-work advisor call) require testing to calibrate. "Errors recurring after 2-3 attempts" is Anthropic's guidance, not a hard rule. The prompt wording for stuck detection will need iteration based on real task behavior.
- **Phase 4 (Review skills):** The `disable-model-invocation: true` + slash command interaction bug (Pitfall 18, GitHub #26251) may affect review skill invocation. Verify current status at implementation time; have a documented workaround ready (remove the flag, rely on descriptive naming).

Phases with standard patterns (skip research-phase):
- **Phase 1 (Scaffold and agent):** Plugin manifest format and agent frontmatter are fully documented in the installed plugin-dev plugin. The `model: opus` field behavior is confirmed. No unknowns.
- **Phase 5 (Polish and publication):** Standard plugin documentation and marketplace publication patterns. Known process.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings from plugin-dev and skill-creator installed plugins; no external sources required; manifest format verified against confirmed GitHub issues |
| Features | HIGH | Advisor timing pattern, output format, and reconciliation from Anthropic's official docs directly; competitive landscape MEDIUM (ecosystem moves fast) |
| Architecture | HIGH | Subagent context isolation, model resolution order, `context: fork` behavior, tool restrictions all from official Claude Code docs with no ambiguity |
| Pitfalls | HIGH | All critical pitfalls sourced from Anthropic official docs or confirmed GitHub issues with issue numbers; moderate pitfalls from multiple independent sources |

**Overall confidence:** HIGH

### Gaps to Address

- **`disable-model-invocation: true` bug (GitHub #26251):** Known issue with current fix status unclear. Test slash command invocation explicitly on every skill using this flag during Phase 4. Documented workaround: if affected, remove the flag and rely on descriptive skill naming to prevent unwanted auto-invocation.
- **Marketplace publication exact flow:** Official docs at code.claude.com were blocked during research. Publication requirements were inferred from examining existing installed plugins. Validate the exact submission process at the start of Phase 5.
- **Advisor effort level calibration:** Research recommends `effort: high` for the advisor agent for deep strategic reasoning. Pitfall 10 warns that Opus 4.6 at higher effort does excessive upfront exploration, causing 30+ second latency. Starting recommendation is `effort: high`; adjust down to `effort: medium` if advisor latency consistently exceeds 15 seconds in Phase 2 testing.
- **Sonnet 4.6 instruction-following reliability for agent invocations:** How reliably Sonnet follows skill instructions to invoke the advisor at the right timing moments is an empirical question. Phase 2 testing will reveal whether prompt wording needs iteration.
- **Exact `opusplan` cost comparison:** The directional comparison (2-3 Opus advisor calls vs. all plan-mode tokens at Opus rate) is sound, but exact cost ratios depend on task length. Document in README as a qualitative advantage rather than a specific cost ratio.

## Sources

### Primary (HIGH confidence)
- Anthropic advisor tool docs (platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) -- timing guidance, cost control, suggested system prompts, output trimming data, advice-handling instructions, durable deliverable pattern
- Anthropic advisor strategy blog (claude.com/blog/the-advisor-strategy) -- benchmark results (Terminal-Bench 2.0, cost comparisons), architecture rationale
- Claude 4.6 best practices (platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- overtriggering, aggressive language migration, overthinking behavior, prefill deprecation
- Claude Code skills docs (code.claude.com/docs/en/skills) -- skill lifecycle, frontmatter reference, 250-char description limit, 5,000-token compaction behavior
- Claude Code subagents docs (code.claude.com/docs/en/sub-agents) -- model override resolution order, nesting limits, context isolation, tool restrictions
- plugin-dev plugin (installed at ~/.claude/plugins/) -- plugin structure, agent frontmatter fields including model/effort/tools/maxTurns, skill writing style, manifest format
- skill-creator plugin (installed at ~/.claude/plugins/) -- skill development methodology, description optimization loop, eval framework, progressive disclosure

### Secondary (MEDIUM confidence)
- GitHub issues on anthropics/claude-code (#17832, #20409, #26251, #17283, #19751, #30366, #31384, #34144) -- confirmed platform bugs affecting plugin development and distribution
- GitHub issues on anthropics/claude-plugins-official (#1244) -- marketplace schema validation errors
- Compound Engineering Plugin (github.com/EveryInc/compound-engineering-plugin) -- competitive landscape reference
- Deep Trilogy Plugins (github.com/piercelamb/deep-plan) -- competitive landscape reference
- Claude Sonnet 4.6 complete guide (nxcode.io) -- benchmark data compilation, effort parameter behavior
- Anthropic Claude Opus 4.6 release coverage (marktechpost.com) -- model capabilities and release details

### Tertiary (LOW confidence)
- oh-my-claude multi-model plugin (github.com/lgcyaxi/oh-my-claude) -- competitive landscape, WebSearch summary only
- Best Claude Code Plugins 2026 (buildtolaunch.substack.com) -- ecosystem overview, WebSearch summary
- Claude Code Plugins Review 2026 (aitoolanalysis.com) -- ecosystem overview, WebSearch summary

---
*Research completed: 2026-04-10*
*Ready for roadmap: yes*
