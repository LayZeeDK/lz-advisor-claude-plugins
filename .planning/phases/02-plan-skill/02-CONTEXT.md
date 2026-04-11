# Phase 2: Plan Skill - Context

**Gathered:** 2026-04-11 (discuss mode, --analyze)
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a SKILL.md for `lz-advisor-plan` that orchestrates a three-step workflow: Sonnet executor orients (explores codebase), packages findings for the Opus advisor agent (`lz-advisor:advisor`), then expands the advisor's concise strategic direction into a detailed actionable plan written to a file. One Opus consultation per invocation.

</domain>

<decisions>
## Implementation Decisions

### Plan Artifact Delivery
- **D-01:** Plan writes to a durable markdown file. Creates a handoff artifact that `/lz-advisor.execute` can consume (IMPL-05). User reviews and optionally edits before executing.

### Advisor Consultation Count
- **D-02:** One Opus advisor call per plan invocation -- direction before planning. Grounded in Anthropic docs ("the advisor adds most of its value on the first call, before the approach crystallizes"), the blog post (`max_uses: 3` covers the full agent loop, not just planning), and ARCHITECTURE.md (plan flow: orient -> consult -> produce). The user is the quality gate for the plan artifact, not a second Opus call. Two+ calls are reserved for the execute skill (Phase 3), where "before declaring done" applies to file writes and test outputs.

### Conciseness Calibration
- **D-03:** Scoped executor framing + measure. The plan skill naturally constrains the advisor question (packaged orientation findings + specific strategic ask, not broad open-ended prompts). Anthropic's conciseness instruction was validated with scoped interactions. Measure with real skill-driven invocations during Phase 2 execution. Tune the agent system prompt in Phase 5 only if still verbose. Root cause of Phase 1 UAT finding was broad manual invocation, not the conciseness instruction itself.

### Plan Detail Level
- **D-04:** `/plan` parity + Opus strategy. The plan artifact matches Claude Code's native `/plan` granularity (numbered steps, file paths, specific changes) but is enriched with Opus strategic insight: approach rationale, risk warnings, dependency ordering, key decisions. The skill prompt specifies the output format explicitly -- Sonnet follows literally per the "Claude 4.x takes you literally" optimization pattern. The differentiation is strategic quality, not detail level.

### Claude's Discretion

- Exact plan file naming convention and output location -- must be discoverable by execute skill, details flexible.
- Orientation instructions specificity -- how much guidance the skill gives the executor about what to explore before consulting the advisor. Goal-oriented ("understand the task scope and codebase state") preferred over prescriptive ("run these specific glob patterns").
- Internal structure of the plan file (section headings, formatting) -- must include strategic direction section and steps section per D-04 preview, but exact layout is flexible.
- Skill prompt wording and section ordering -- follows Sonnet 4.6 optimization patterns (structured XML, explicit constraints, literal instruction following) but exact phrasing is the planner's choice.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Anthropic Advisor Strategy
- `research/anthropic/docs/advisor-tool.md` -- API advisor tool reference with timing guidance, suggested system prompt blocks, trimming instructions. Source for D-02 (first call value), D-03 (scoped conciseness).
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Strategy rationale, benchmark results (Sonnet + Opus = +2.7pp at -11.9% cost), architecture diagram, `max_uses: 3` context.

### Plugin Architecture
- `.planning/research/ARCHITECTURE.md` -- Plan skill flow diagram (orient -> consult -> produce), skill-agent orchestration mechanism, subagent context isolation, anti-patterns (no raw context dumps, no per-tool-call consultation). Source for D-02 (one-consult flow).
- `.planning/research/STACK.md` -- Skill file format, frontmatter fields, `allowed-tools` syntax, plugin manifest format.

### Existing Components (Phase 1 output)
- `agents/advisor.md` -- Opus advisor agent definition. System prompt, output constraint (<100 words, enumerated steps), consultation awareness, tools (Read, Glob), maxTurns: 1.
- `skills/lz-advisor-plan/references/advisor-timing.md` -- When to consult (timing), how to treat advice (weight), what to include in the prompt (context packaging). Skills load via `@references/advisor-timing.md`.

### Prompt Engineering
- `research/prompt-engineering/MODEL-OPTIMIZATION-SONNET.md` -- Sonnet literal instruction following, structured XML, parallel tool use, phase-based thinking, minimal implementation constraints. Source for D-04 (explicit format, Sonnet follows literally).
- `research/prompt-engineering/MODEL-OPTIMIZATION-OPUS.md` -- Opus system prompt sensitivity (no aggressive language), first-try correctness. Relevant to advisor prompt calibration.

### Phase 1 Context
- `.planning/phases/01-plugin-scaffold-and-advisor-agent/01-CONTEXT.md` -- Prior decisions D-01 through D-15. Key carry-forwards: D-05 (advisor stance driven by consultation framing), D-06 (under 100 words), D-07 (single advisor, multiple skills), D-12 (reference file covers timing/weight/packaging).

### Requirements
- `.planning/REQUIREMENTS.md` -- PLAN-01 through PLAN-06 are the hard constraints for this phase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `agents/advisor.md` -- Complete Opus advisor agent, ready to invoke as `lz-advisor:advisor`. System prompt enforces conciseness (<100 words, enumerated steps). Consultation awareness section adapts to framing.
- `skills/lz-advisor-plan/references/advisor-timing.md` -- Complete reference file covering timing, advice weight, and context packaging. Already in the plan skill's `references/` directory.
- `.claude-plugin/plugin.json` -- Valid plugin manifest (v0.1.0).

### Established Patterns
- Agent system prompt uses calm natural language, no aggressive keywords (D-09 from Phase 1).
- Agent description follows Style A: "Use this agent when..." + 3 example blocks (D-10, D-11 from Phase 1).
- Plugin uses kebab-case naming throughout (`lz-advisor-plan`, `advisor-timing.md`).
- Reference files loaded via `@references/` include syntax in skill prompts.

### Integration Points
- Skill created at `skills/lz-advisor-plan/SKILL.md` -- directory already exists (has `references/`).
- Skill invokes `lz-advisor:advisor` via Agent tool -- pre-approved via `allowed-tools: Agent(lz-advisor:advisor)`.
- Plan file written to project directory -- must be discoverable by `/lz-advisor.execute` (Phase 3, IMPL-05).
- No `context: fork` -- skill runs inline to access conversation context.
- No `model` or `effort` override in skill frontmatter -- inherits session model.

</code_context>

<specifics>
## Specific Ideas

- Plan file format previewed during discussion: "Strategic Direction" section (from advisor) + "Steps" section (numbered, with file paths) + "Key Decisions" section (approach rationale). This mirrors `/plan` output but adds the Opus strategic layer.
- The advisor's terse enumerated output (~100 words) becomes the "Strategic Direction" section. The executor expands this into the detailed "Steps" section. This separation makes the Opus contribution visible to the user.
- Sonnet's literal instruction following means the plan format is fully controlled by the skill prompt. Specify the exact sections and Sonnet will produce them.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 02-plan-skill*
*Context gathered: 2026-04-11*
