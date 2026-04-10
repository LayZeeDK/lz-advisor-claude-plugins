# Phase 1: Plugin Scaffold and Advisor Agent - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a valid Claude Code marketplace plugin structure with an Opus advisor agent that provides concise strategic guidance when invoked by skills. This phase creates the foundation that all subsequent skills (Phases 2-4) depend on: the plugin manifest, the agent definition, and the shared reference file.

</domain>

<decisions>
## Implementation Decisions

### Advisor Persona and Voice

- **D-01:** Agent system prompt uses one-sentence role opening ("You are a strategic engineering advisor specializing in concise, actionable guidance for coding tasks.") followed by structured instruction sections (Output Constraint, Process, Consultation Context). Follows the official plugin-dev pattern observed across all 3 plugin-dev agents and 6 pr-review-toolkit agents.
- **D-02:** maxTurns: 1 with reactive tool use. Advisor reads files only to verify executor claims within a single turn. Mirrors the API advisor's no-tools philosophy while compensating for the missing transcript. Keeps Opus cost to a single inference pass per consultation.
- **D-03:** Advisor always commits to a recommendation even with incomplete context. States assumptions explicitly ("Assuming X, do Y. If X is wrong, do Z instead."). Never responds with "I need more context" -- that wastes the single turn.
- **D-04:** System prompt is model-agnostic. References "an executor" not "Sonnet." Portable if model names change. Avoids the advisor "dumbing down" advice.
- **D-05:** Advisor stance is not prescribed in the system prompt. Consultation framing (from the executor's prompt, guided by skill instructions in Phases 2-4) drives whether the advisor orients, diagnoses, verifies, or evaluates. This keeps the agent flexible for all four consultation types.
- **D-06:** Output format uses Anthropic's validated conciseness instruction: "Respond in under 100 words. Use enumerated steps, not explanations. Focus on what to do, not why." No structured template. Anthropic tested this exact instruction and it cut output tokens 35-45% without quality loss.
- **D-07:** Single `lz-advisor` agent with consultation awareness section rather than multiple consultation-specific agents. Matches the API advisor tool's single-advisor architecture. Skills define different workflows; agent defines the advisor persona.
- **D-08:** Color: magenta. Follows plugin-dev semantics (magenta = creative/strategic). Same color as `agent-creator` which is also a strategic/generative role.
- **D-09:** Positive-only instruction style -- no "What Not to Do" section. Follows the plugin-dev pattern where all 3 official agents and 6 pr-review-toolkit agents define behavior entirely through positive instructions. Read-only tool list and conciseness constraint already prevent unwanted behaviors.

### Agent Description Triggers

- **D-10:** Style A description (prescribed pattern): "Use this agent to..." + 3 `<example>` blocks with Context/user/assistant/commentary structure. Matches agent-creator guidance and 11 of 16 frontmatter agents across official plugins.
- **D-11:** Agent is skill-orchestrated only, not intended for direct user invocation. Description states "Requires structured context packaging from the executor; not intended for direct invocation." All 3 examples show skill-driven scenarios (before work, when stuck, before declaring done). No proactive triggering language to avoid costly unsolicited Opus calls.

### Reference File Scope

- **D-12:** `references/advisor-timing.md` covers all three operational concerns: WHEN to consult (Anthropic's timing guidance), HOW to treat advice (weight instructions), and WHAT to include in the prompt (context packaging for the subagent gap). Skills load one file and get everything the executor needs.
- **D-13:** Reference file text adapted from Anthropic's tested system prompt wording, modified for the plugin context (agent name, explicit context packaging, "cannot see your conversation" caveat). Their wording was validated through benchmarks -- changing it risks degrading performance.

### Plugin Identity

- **D-14:** Full recommended field set in plugin.json: name, description, version (0.1.0), author, license (MIT), repository, keywords. Most thorough manifest approach. Follows the plugin-dev manifest-reference "recommended for distribution" guidance.

### Project-Level Naming

- **D-15:** Renamed `/lz-advisor.implement` to `/lz-advisor.execute` across all planning artifacts and documentation. Clearer intent: the skill executes tasks, not just "implements" code. Affects Phase 3 name ("Execute Skill") and all directory/component references (`lz-advisor-execute`).

### Claude's Discretion

- System prompt exact wording and section ordering -- the decisions above define the structure and content principles; the planner has flexibility on exact phrasing within those constraints.
- Reference file internal section ordering and exact word count -- must cover all three concerns (timing, weight, packaging) and adapt Anthropic's tested text, but section flow is flexible.
- Agent description example scenario details -- must follow Style A pattern with 3 skill-driven examples, but specific task scenarios in examples are flexible.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Anthropic Advisor Strategy
- `research/anthropic/docs/advisor-tool.md` -- API advisor tool reference with timing guidance, suggested system prompt blocks, trimming instructions, and advice-weight instructions. The source text for D-06, D-12, D-13.
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Strategy rationale, benchmark results (Sonnet + Opus = +2.7pp at -11.9% cost), architecture diagram.

### Plugin Architecture
- `.planning/research/ARCHITECTURE.md` -- Agent definition spec, skill-agent orchestration mechanism, model resolution order, subagent context isolation, data flow diagrams. Source for D-02, D-05, D-07.
- `.planning/research/STACK.md` -- Directory structure, plugin manifest format, agent frontmatter fields, skill file format, marketplace publishing requirements.

### Plugin-Dev Guidelines (authoritative for structure)
- Installed at `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/unknown/`
- `skills/agent-development/SKILL.md` + `references/system-prompt-design.md` -- Agent system prompt writing: second person, one-sentence role opening, 500-3000 word body, positive-only instructions. Source for D-01, D-09.
- `skills/plugin-structure/references/manifest-reference.md` -- Plugin.json schema, field constraints, validation regex for name field. Source for D-14.
- `agents/plugin-validator.md` -- Validation rules the plugin must pass: name kebab-case, valid color, description with examples, system prompt >20 chars.

### Requirements and Pitfalls
- `.planning/REQUIREMENTS.md` -- INFRA-01 through INFRA-03, ADVR-01 through ADVR-06. Hard constraints for this phase.
- `.planning/research/PITFALLS.md` -- Critical pitfalls #1 (aggressive language), #4 (verbose output), #5 (silent manifest failures), #13 (write tools). All directly relevant to Phase 1 implementation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None -- greenfield plugin. No existing code to reuse.

### Established Patterns
- Plugin-dev agents follow: one-sentence "You are [role] specializing in [domain]" opening + structured sections (Core Responsibilities, Process, Quality Standards, Output Format). The lz-advisor agent should match this pattern per D-01.
- Official agent descriptions follow Style A: "Use this agent when..." + 2-3 `<example>` blocks with Context/user/assistant/commentary structure.

### Integration Points
- Plugin loads from `.claude-plugin/plugin.json` at plugin root
- Agent discovered from `agents/lz-advisor.md`
- Skills will reference `Agent(lz-advisor)` in `allowed-tools` (Phases 2-4)
- Reference file loaded by skills via `@references/advisor-timing.md` (Phases 2-4)

</code_context>

<specifics>
## Specific Ideas

- The advisor's consultation awareness section should briefly list the four consultation moments (orient, diagnose, verify, evaluate) so it adapts naturally to each -- without prescribing a rigid stance.
- Reference file's context packaging section is our key addition beyond Anthropic's text -- it compensates for the architectural difference where our subagent doesn't see the transcript. This section must be clear enough that skill prompts in Phases 2-4 can reference it.

</specifics>

<deferred>
## Deferred Ideas

- Review skills architecture conflict: STATE.md says "context: fork with model: opus -- no advisor agent loop" but PROJECT.md says "All skills use advisor pattern (no context: fork)." ARCHITECTURE.md resolves this in favor of fork for reviews. Deferred to Phase 4 discussion.
- Multiple consultation-specific agents (lz-advisor-orient, lz-advisor-stuck, etc.) -- decided against for v1 (D-07) but could revisit if Phase 2-3 testing shows the single agent doesn't adapt well.

</deferred>

---

*Phase: 01-plugin-scaffold-and-advisor-agent*
*Context gathered: 2026-04-10*
