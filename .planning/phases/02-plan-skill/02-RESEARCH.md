# Phase 2: Plan Skill - Research

**Researched:** 2026-04-11
**Domain:** Claude Code skill authoring -- executor-advisor orchestration workflow
**Confidence:** HIGH

## Summary

Phase 2 creates a single SKILL.md file at `skills/lz-advisor-plan/SKILL.md` that orchestrates a three-step workflow: Sonnet executor orients (explores codebase), packages findings for the Opus advisor agent (`lz-advisor:advisor`), then expands the advisor's concise strategic direction into a detailed actionable plan written to a file. The directory already exists with `references/advisor-timing.md` from Phase 1.

The primary implementation challenge is prompt engineering: the skill must instruct the Sonnet executor to (1) explore the codebase before consulting the advisor, (2) package orientation findings into a self-contained advisor prompt (the subagent cannot see conversation history), and (3) expand the advisor's terse ~100-word enumerated output into a detailed plan file matching `/plan` granularity with Opus strategic enrichment. All behavior is controlled through the SKILL.md markdown body -- no code, no scripts, no external dependencies.

**Primary recommendation:** Write a SKILL.md under 2,000 words using structured XML sections, imperative form, and calm natural language. The skill body defines three phases (orient, consult, produce) with explicit instructions for context packaging and plan file output format. Load `@references/advisor-timing.md` for detailed timing/weight/packaging guidance rather than duplicating it in the skill body.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Plan writes to a durable markdown file. Creates a handoff artifact that `/lz-advisor.execute` can consume (IMPL-05). User reviews and optionally edits before executing.
- **D-02:** One Opus advisor call per plan invocation -- direction before planning. Grounded in Anthropic docs ("the advisor adds most of its value on the first call, before the approach crystallizes"), the blog post (`max_uses: 3` covers the full agent loop, not just planning), and ARCHITECTURE.md (plan flow: orient -> consult -> produce). The user is the quality gate for the plan artifact, not a second Opus call.
- **D-03:** Scoped executor framing + measure. The plan skill naturally constrains the advisor question (packaged orientation findings + specific strategic ask, not broad open-ended prompts). Measure with real skill-driven invocations during Phase 2 execution. Tune the agent system prompt in Phase 5 only if still verbose.
- **D-04:** `/plan` parity + Opus strategy. The plan artifact matches Claude Code's native `/plan` granularity (numbered steps, file paths, specific changes) but is enriched with Opus strategic insight: approach rationale, risk warnings, dependency ordering, key decisions. The skill prompt specifies the output format explicitly -- Sonnet follows literally per the "Claude 4.x takes you literally" optimization pattern.

### Claude's Discretion
- Exact plan file naming convention and output location -- must be discoverable by execute skill, details flexible.
- Orientation instructions specificity -- how much guidance the skill gives the executor about what to explore before consulting the advisor. Goal-oriented ("understand the task scope and codebase state") preferred over prescriptive ("run these specific glob patterns").
- Internal structure of the plan file (section headings, formatting) -- must include strategic direction section and steps section per D-04 preview, but exact layout is flexible.
- Skill prompt wording and section ordering -- follows Sonnet 4.6 optimization patterns (structured XML, explicit constraints, literal instruction following) but exact phrasing is the planner's choice.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLAN-01 | Skill instructs executor to orient first (read files, explore codebase) before consulting advisor | Orientation phase pattern from ARCHITECTURE.md data flow; Anthropic's timing guidance ("orientation is not substantive work"); skill-creator's progressive disclosure pattern |
| PLAN-02 | Skill instructs executor to package orientation findings into advisor agent invocation | Context packaging pattern from ARCHITECTURE.md; subagent context isolation (fresh context per invocation); `references/advisor-timing.md` section 3 (What to Include) |
| PLAN-03 | Advisor returns concise strategic direction (under 100 words) | Advisor agent system prompt enforces this (ADVR-02 from Phase 1); D-03 locks scoped framing approach |
| PLAN-04 | Executor expands advisor's terse guidance into a detailed, actionable plan | D-04 locks plan parity with `/plan` + Opus enrichment; Sonnet literal instruction following (explicit output format in skill body) |
| PLAN-05 | Skill outputs a durable plan artifact (written to file or displayed for user) | D-01 locks file output; plan file naming is Claude's discretion; must be discoverable by execute skill (IMPL-05) |
| PLAN-06 | Skill inherits session model for executor (no model override) | No `model` field in skill frontmatter; ARCHITECTURE.md anti-pattern 4 (no effort override in inline skills) |
</phase_requirements>

## Standard Stack

This phase creates a single markdown file. No libraries, packages, or external dependencies.

### Core Components

| Component | Format | Purpose | Why Standard |
|---------|--------|---------|--------------|
| SKILL.md | Markdown + YAML frontmatter | Skill definition and workflow orchestration | Claude Code's native skill format; auto-discovered from `skills/*/SKILL.md` [VERIFIED: codebase] |
| advisor-timing.md | Markdown reference | Detailed timing, weight, and context packaging guidance | Already exists from Phase 1; loaded via `@references/advisor-timing.md` [VERIFIED: codebase] |
| advisor.md | Markdown agent definition | Opus advisor agent | Already exists from Phase 1; invoked as `lz-advisor:advisor` via Agent tool [VERIFIED: codebase] |

### Existing Assets (Phase 1 Output)

| Asset | Path | Status | Role in Phase 2 |
|-------|------|--------|------------------|
| Agent definition | `agents/advisor.md` | Complete | Target of `Agent(lz-advisor:advisor)` in `allowed-tools` |
| Reference file | `skills/lz-advisor-plan/references/advisor-timing.md` | Complete | Loaded by skill via `@references/advisor-timing.md` |
| Plugin manifest | `.claude-plugin/plugin.json` | Complete | No changes needed |
| Directory placeholder | `skills/lz-advisor-plan/references/.gitkeep` | To be replaced | Remove once SKILL.md is created |

## Architecture Patterns

### Recommended File Structure

```
skills/lz-advisor-plan/
|-- SKILL.md                    # Phase 2 deliverable (~1,500-2,000 words)
'-- references/
    '-- advisor-timing.md       # Already exists from Phase 1
```

[VERIFIED: directory exists in codebase]

### Pattern 1: Three-Phase Skill Workflow (Orient -> Consult -> Produce)

**What:** The skill body instructs the executor through three sequential phases, each with clear entry/exit conditions.

**When to use:** Plan skill (this phase). The same pattern applies to the execute skill in Phase 3 with additional phases.

**Source:** ARCHITECTURE.md data flow diagram [VERIFIED: codebase]

```markdown
# Phase 1: Orient

Explore the codebase to understand the task scope and current state.
Read relevant files, examine directory structure, and identify constraints.
Do not consult the advisor yet -- orientation is not substantive work.

# Phase 2: Consult

Invoke the lz-advisor:advisor agent with a focused prompt containing:
1. The original task (quote the user's request)
2. Key findings from orientation
3. A specific question: "What approach should I take?"

# Phase 3: Produce

Expand the advisor's enumerated steps into a detailed plan.
Write the plan to a markdown file.
```

### Pattern 2: Context Packaging for Subagent Invocation

**What:** The executor must package all relevant context into the Agent tool prompt because the subagent cannot see the conversation history.

**When to use:** Every advisor consultation.

**Source:** ARCHITECTURE.md subagent context isolation; `references/advisor-timing.md` section 3 [VERIFIED: codebase]

**Critical architectural difference from API advisor tool:** The API advisor sees the full transcript automatically. Our plugin advisor starts with a fresh context. The skill must explicitly instruct the executor to summarize and include: (1) the original task, (2) key findings from orientation, (3) the specific decision or question.

### Pattern 3: Plan File as Handoff Artifact

**What:** The plan is written to a durable markdown file that the execute skill can later consume.

**When to use:** Every plan skill invocation (D-01).

**Source:** CONTEXT.md D-01; REQUIREMENTS.md IMPL-05 [VERIFIED: codebase]

**Naming convention recommendation:** `plan-<slugified-task-description>.md` in the project root or a `.plans/` directory. The execute skill needs a discoverable convention. Convention must be stated in the plan skill's output instructions so the executor uses it consistently.

### Pattern 4: Explicit Output Format for Sonnet Literal Compliance

**What:** Specify the exact plan file sections in the skill body. Sonnet 4.6 follows literal instructions -- if the skill says "write a file with these sections," Sonnet produces exactly those sections.

**When to use:** Plan file output (D-04).

**Source:** Sonnet 4.6 optimization research; CONTEXT.md D-04 [VERIFIED: codebase research]

```markdown
The plan file must contain these sections:

## Strategic Direction
[Advisor's enumerated guidance, attributed to the advisor]

## Steps
[Numbered steps with file paths and specific changes]

## Key Decisions
[Approach rationale, risk warnings, dependency ordering]
```

### Pattern 5: Skill Frontmatter Configuration

**What:** The plan skill uses specific frontmatter fields to control execution.

**Source:** ARCHITECTURE.md skill specifications; plugin-dev skill-development SKILL.md [VERIFIED: codebase]

```yaml
---
name: lz-advisor-plan
description: >
  This skill should be used when the user asks to "plan a task",
  "create an implementation plan", "think through the approach",
  "plan before coding", "lz-advisor plan", or needs strategic
  planning guidance before starting substantive coding work.
  Provides Opus-level strategic direction at Sonnet cost by
  consulting the advisor agent for high-leverage guidance.
version: 0.1.0
allowed-tools: Agent(lz-advisor:advisor)
---
```

**Key frontmatter decisions:**
- No `model` field -- inherits session model (PLAN-06) [VERIFIED: ARCHITECTURE.md anti-pattern 4]
- No `effort` field -- respects user's session effort choice [VERIFIED: ARCHITECTURE.md]
- No `context: fork` -- runs inline to access conversation context [VERIFIED: ARCHITECTURE.md anti-pattern 3]
- `allowed-tools: Agent(lz-advisor:advisor)` -- pre-approves advisor spawning without user permission prompt [VERIFIED: ARCHITECTURE.md]
- Agent qualified name is `lz-advisor:advisor` (plugin-name:agent-name) based on Phase 1 rename [VERIFIED: git log `7af0d3f`]

**NOTE on `disable-model-invocation`:** ARCHITECTURE.md examples show this flag on plan/execute skills for cost control (prevent auto-triggering). However, Pitfall 18 (GitHub #26251) documents a bug where this flag can also block slash command invocation. Decision point: whether to include this flag. Including it prevents costly unsolicited Opus calls but may break slash commands. Omitting it allows auto-triggering but the skill description should be specific enough to avoid false triggers.

### Anti-Patterns to Avoid

- **Dumping raw context into advisor prompt:** Wastes Opus input tokens ($15/MTok). Instruct executor to summarize findings, not paste entire files. [VERIFIED: ARCHITECTURE.md anti-pattern 5]
- **Multiple advisor calls in plan skill:** D-02 locks one call per invocation. The advisor adds most value on the first call. [VERIFIED: CONTEXT.md D-02]
- **Using `context: fork`:** Would lose access to conversation history. The executor needs prior context. [VERIFIED: ARCHITECTURE.md anti-pattern 3; Pitfall 9]
- **Aggressive prompt language:** Use calm natural language. No "MUST", "CRITICAL", "ALWAYS". [VERIFIED: Pitfall 1; ADVR-06; Phase 1 D-09]
- **Overriding executor effort:** Do not set `effort` in frontmatter for inline skills. [VERIFIED: ARCHITECTURE.md anti-pattern 4]
- **Using "ultrathink" in skill body:** Would accidentally trigger extended thinking. [VERIFIED: Pitfall 17]
- **Second person in skill body:** Use imperative form ("Explore the codebase") not second person ("You should explore the codebase"). [VERIFIED: plugin-dev skill-development SKILL.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Advisor timing guidance | Custom timing instructions in skill body | `@references/advisor-timing.md` | Already written, tested, covers all three concerns (timing, weight, packaging). Keeps SKILL.md lean. [VERIFIED: codebase] |
| Output conciseness | Per-invocation conciseness instructions | Advisor agent system prompt (already enforces <100 words) | Anthropic validated this instruction cut output 35-45%. Already in agent definition. [VERIFIED: codebase] |
| Plan file format | Let executor decide format | Explicit section template in skill body | Sonnet follows literal instructions. Specify format for consistency. [VERIFIED: MODEL-OPTIMIZATION-SONNET.md] |

## Common Pitfalls

### Pitfall 1: Advisor Called with Broad Open-Ended Question

**What goes wrong:** The executor invokes the advisor with a vague prompt like "What should I do?" instead of a focused question with packaged context. The advisor responds with generic advice that doesn't address the specific codebase state.

**Why it happens:** Without explicit packaging instructions, the executor defaults to asking the advisor the same way a human would ask a colleague -- broadly. The Phase 1 UAT note confirms this: "Advisor conciseness constraint was not respected when invoked with broad open-ended questions."

**How to avoid:** The skill body must instruct the executor to package specific findings. D-03 confirms that scoped executor framing (packaged orientation + specific ask) naturally constrains the advisor question. [VERIFIED: CONTEXT.md D-03; Phase 1 UAT note]

**Warning signs:** Advisor response is generic (could apply to any project) rather than specific to the user's codebase.

### Pitfall 2: Skill Body Too Long (Compaction Risk)

**What goes wrong:** SKILL.md exceeds 5,000 tokens and gets truncated after auto-compaction. Critical instructions (like the plan file format) are lost.

**Why it happens:** Including detailed timing guidance, context packaging instructions, and plan format all in the skill body.

**How to avoid:** Keep SKILL.md under 2,000 words. Load detailed timing/weight/packaging guidance from `@references/advisor-timing.md`. Front-load the most critical instructions (workflow phases, plan format) in the first 5,000 tokens. [VERIFIED: skill-creator SKILL.md; ARCHITECTURE.md Pattern 5]

**Warning signs:** Skill body exceeds 500 lines or 2,000 words.

### Pitfall 3: Agent Qualified Name Wrong

**What goes wrong:** The `allowed-tools` field references the wrong agent name, causing the Agent tool invocation to fail or prompt the user for permission.

**Why it happens:** Phase 1 renamed the agent file from `lz-advisor.md` to `advisor.md`. The agent `name` field is `advisor`, making the qualified name `lz-advisor:advisor` (plugin-name:agent-name). Some ARCHITECTURE.md references still say `Agent(lz-advisor)` (pre-rename).

**How to avoid:** Use `Agent(lz-advisor:advisor)` in both `allowed-tools` frontmatter and skill body instructions. [VERIFIED: `agents/advisor.md` name field = `advisor`; git log `7af0d3f`]

**Warning signs:** User gets a permission prompt when the executor tries to consult the advisor, or Agent tool returns "unknown agent."

### Pitfall 4: Plan File Not Discoverable by Execute Skill

**What goes wrong:** The plan skill writes the plan to a location or with a naming convention that the execute skill (Phase 3) cannot find. The handoff artifact becomes a dead file.

**Why it happens:** No convention established yet. D-01 says "must be discoverable by execute skill" but leaves details to Claude's discretion.

**How to avoid:** Establish a clear, documented naming convention in this phase that Phase 3 can reference. The plan skill output instructions and the execute skill input instructions must use the same convention. [VERIFIED: CONTEXT.md D-01; REQUIREMENTS.md IMPL-05]

**Warning signs:** User runs execute skill and it asks "where is the plan?" instead of finding it.

### Pitfall 5: `disable-model-invocation` Bug Breaking Slash Commands

**What goes wrong:** Adding `disable-model-invocation: true` to prevent auto-triggering also prevents `/lz-advisor.plan` from working via slash command.

**Why it happens:** GitHub #26251 -- known bug where the model interprets this flag as "do not use Skill tool at all."

**How to avoid:** Test slash command invocation explicitly. If broken, remove the flag and rely on specific description to avoid false triggers. The plan skill description should be specific enough that it only triggers on planning requests. [VERIFIED: Pitfall 18; GitHub #26251]

**Warning signs:** User types `/lz-advisor.plan` and gets "Unknown skill" or the skill never loads.

## Code Examples

### Example 1: SKILL.md Frontmatter

```yaml
---
name: lz-advisor-plan
description: >
  This skill should be used when the user asks to "plan a task",
  "create an implementation plan", "think through the approach",
  "plan before coding", "lz-advisor plan", or needs strategic
  planning guidance before starting substantive coding work.
  Provides Opus-level strategic direction at Sonnet cost by
  consulting the advisor agent for high-leverage guidance.
version: 0.1.0
allowed-tools: Agent(lz-advisor:advisor)
---
```

Source: ARCHITECTURE.md skill specification + Phase 1 agent rename [VERIFIED: codebase]

### Example 2: Orient Phase Instructions (Imperative Form)

```markdown
<orient>
## Phase 1: Orient

Explore the codebase to understand the task scope and current state.

- Read files relevant to the user's request
- Examine directory structure and dependencies
- Identify constraints, patterns, and integration points
- Note what exists and what needs to change

Do not write code or make changes during orientation.
Orientation is not substantive work -- it is preparation for
the advisor consultation.

Load @references/advisor-timing.md for detailed guidance on
what to include when consulting the advisor.
</orient>
```

Source: ARCHITECTURE.md data flow; Anthropic timing guidance [VERIFIED: codebase]

### Example 3: Consult Phase with Context Packaging

```markdown
<consult>
## Phase 2: Consult the Advisor

Invoke the lz-advisor:advisor agent via the Agent tool.
Include in the prompt:

1. The user's original task (quote their request)
2. Key findings from orientation (files examined, patterns
   found, constraints discovered)
3. A specific question: "Given these findings, what approach
   and sequence of steps would you recommend?"

Keep the prompt focused and summarized. Do not paste entire
files -- summarize what was found.

One advisor consultation per plan invocation. The advisor
returns concise strategic direction (enumerated steps under
100 words). This becomes the foundation of the plan.
</consult>
```

Source: ARCHITECTURE.md Pattern 2; advisor-timing.md section 3 [VERIFIED: codebase]

### Example 4: Produce Phase with Plan File Format

```markdown
<produce>
## Phase 3: Produce the Plan

Expand the advisor's enumerated guidance into a detailed,
actionable plan. Write the plan to a markdown file.

### Plan File Location

Write to: `plan-<task-slug>.md` in the project root directory.
Use a short kebab-case slug derived from the task description.

### Plan File Format

```markdown
# Plan: <Task Title>

## Strategic Direction

<The advisor's guidance, attributed and quoted>

## Steps

1. **<Step title>**
   - File: `<path/to/file>`
   - Change: <specific description>
   - Rationale: <why this step>

2. ...

## Key Decisions

- **<Decision>**: <rationale from advisor + executor analysis>
- **<Risk>**: <what could go wrong and mitigation>

## Dependencies

<Order constraints between steps, if any>
```

Present the plan file path to the user for review.
</produce>
```

Source: CONTEXT.md D-04; Sonnet literal instruction following [VERIFIED: codebase research]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Commands (`.claude/commands/`) | Skills (`skills/*/SKILL.md`) | Plugin-dev docs, current | Skills auto-trigger on context match; commands are legacy format [VERIFIED: STACK.md] |
| `thinking: {type: "enabled", budget_tokens: N}` | `thinking: {type: "adaptive"}` | Claude 4.6 | Adaptive thinking is recommended; explicit budgets deprecated [VERIFIED: ARCHITECTURE.md] |
| Agent name `lz-advisor` | Agent name `advisor` (qualified: `lz-advisor:advisor`) | Phase 1 refactor | `allowed-tools` must use `Agent(lz-advisor:advisor)` [VERIFIED: git log `7af0d3f`] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Plan file naming `plan-<task-slug>.md` in project root is the best convention for discoverability by execute skill | Architecture Patterns, Pattern 3 | Execute skill (Phase 3) might not find plan files. Low risk: convention can be adjusted in Phase 3 since both skills are authored by the same project. |
| A2 | Omitting `disable-model-invocation: true` is safer than including it given GitHub #26251 | Architecture Patterns, Pattern 5 | Auto-triggering could cause unwanted Opus costs. Medium risk: specific description should mitigate false triggers, but untested. |
| A3 | `allowed-tools: Agent(lz-advisor:advisor)` syntax with colon-separated qualified name works correctly | Architecture Patterns, Pattern 5 | If wrong, advisor invocation would require user permission. Medium risk: ARCHITECTURE.md examples show unqualified `Agent(lz-advisor)` but those predate the rename. Need to verify at implementation. |

## Open Questions (RESOLVED)

1. **Agent qualified name syntax in `allowed-tools`**
   - What we know: Agent file is `agents/advisor.md` with `name: advisor`. Plugin is `lz-advisor`. ARCHITECTURE.md examples (pre-rename) use `Agent(lz-advisor)`.
   - RESOLVED: Use `Agent(lz-advisor:advisor)` (qualified name) with `Agent(advisor)` as runtime fallback. The plan skill frontmatter uses `allowed-tools: Agent(lz-advisor:advisor)`. If the qualified syntax fails at runtime, the executor falls back to `Agent(advisor)`. This is documented in the plan's action instructions.

2. **`disable-model-invocation` inclusion**
   - What we know: ARCHITECTURE.md examples include it. GitHub #26251 documents a bug where it blocks slash commands.
   - RESOLVED: Omit `disable-model-invocation` from skill frontmatter. The GitHub #26251 bug risk outweighs the auto-triggering risk. The skill description is specific enough to prevent false triggers (references "plan a task", "implementation plan", "lz-advisor plan" etc.).

3. **Plan file location convention**
   - What we know: D-01 says durable file, discoverable by execute skill. IMPL-05 says execute skill accepts optional plan file input.
   - RESOLVED: `plan-<task-slug>.md` in the project root directory. Simple, visible to the user, easy for execute skill to glob for. If users dislike root clutter, Phase 3 can adjust the convention since both skills are authored by the same project.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | skill-creator eval framework |
| Config file | None -- skill-creator provides scripts |
| Quick run command | Manual invocation: `/lz-advisor.plan <task>` |
| Full suite command | skill-creator eval with 3-5 test prompts |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLAN-01 | Executor reads files before consulting advisor | manual-only | Observe conversation: executor calls Read/Glob before Agent tool | N/A |
| PLAN-02 | Executor packages findings in advisor prompt | manual-only | Observe agent invocation prompt content | N/A |
| PLAN-03 | Advisor returns <100 words | manual-only | Count words in advisor response | N/A |
| PLAN-04 | Executor produces detailed plan from advisor guidance | manual-only | Review plan file content for steps + file paths + rationale | N/A |
| PLAN-05 | Plan written to durable file | manual-only | Check file exists after skill completion | N/A |
| PLAN-06 | No model override in skill | unit | Verify SKILL.md frontmatter has no `model` field | Wave 0 |

**Justification for manual-only:** This phase's deliverable is a skill prompt (SKILL.md). Its requirements describe behavioral qualities of the LLM response when the skill is invoked. These cannot be unit-tested -- they require observing an LLM session executing the skill. The skill-creator eval framework is the appropriate test mechanism.

### Sampling Rate

- **Per task commit:** Manual invocation with a simple task ("plan adding a login page") -- verify three phases execute
- **Per wave merge:** Full skill-creator eval with 3 test prompts
- **Phase gate:** All 6 PLAN requirements verified via conversation observation

### Wave 0 Gaps

- [ ] Test prompts for skill-creator eval (3-5 prompts covering simple, complex, and edge-case tasks)
- [ ] Assertion criteria for each test prompt (what constitutes pass/fail)

## Security Domain

Not applicable -- this phase creates a markdown prompt file with no code execution, no user input handling, no data persistence, and no network communication. The SKILL.md is a prompt template, not a program.

## Sources

### Primary (HIGH confidence)
- `agents/advisor.md` -- Verified agent definition with name, model, tools, system prompt [codebase]
- `skills/lz-advisor-plan/references/advisor-timing.md` -- Verified reference file content [codebase]
- `.planning/research/ARCHITECTURE.md` -- Skill-agent orchestration, data flow, anti-patterns [codebase]
- `.planning/research/STACK.md` -- Skill file format, frontmatter fields, directory structure [codebase]
- `.planning/research/PITFALLS.md` -- Domain pitfalls with prevention strategies [codebase]
- `research/anthropic/docs/advisor-tool.md` -- Anthropic's advisor timing guidance, suggested system prompt [local copy of official docs]
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Strategy rationale, benchmark results [local copy of official blog]
- `research/prompt-engineering/MODEL-OPTIMIZATION-SONNET.md` -- Sonnet literal instruction following, structured XML [codebase]
- `research/prompt-engineering/MODEL-OPTIMIZATION-OPUS.md` -- Opus system prompt sensitivity, calm language [codebase]
- Plugin-dev `skills/skill-development/SKILL.md` -- Skill writing style, progressive disclosure, third-person descriptions [installed plugin]
- Skill-creator `skills/skill-creator/SKILL.md` -- Skill creation methodology, description optimization [installed plugin]

### Secondary (MEDIUM confidence)
- `.planning/phases/01-plugin-scaffold-and-advisor-agent/01-CONTEXT.md` -- Phase 1 decisions (D-01 through D-15) [codebase]
- `.planning/phases/01-plugin-scaffold-and-advisor-agent/01-01-SUMMARY.md` -- Phase 1 execution results [codebase]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all components verified in codebase
- Architecture: HIGH -- patterns derived from verified ARCHITECTURE.md + Anthropic docs
- Pitfalls: HIGH -- all pitfalls verified against codebase research + GitHub issues
- Agent qualified name: MEDIUM -- rename verified in git log but `allowed-tools` syntax with qualified name not tested at runtime

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (stable domain -- skill format and agent mechanism unlikely to change within 30 days)
