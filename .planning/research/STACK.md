# Technology Stack

**Project:** lz-advisor -- Claude Code marketplace plugin implementing the advisor strategy
**Researched:** 2026-04-10
**Overall confidence:** HIGH

## Recommended Stack

This plugin has zero external dependencies. The entire "stack" is Claude Code's native plugin component system: skills, agents, commands, and the Agent tool with model overrides. There are no npm packages, no build steps, no runtime dependencies.

### Core Components

| Component | Format | Purpose | Why |
|-----------|--------|---------|-----|
| Skills (SKILL.md) | Markdown + YAML frontmatter | Orchestrate executor-advisor workflows | Skills are the primary entry point; they trigger contextually and contain the full workflow prompt |
| Agent (agents/*.md) | Markdown + YAML frontmatter | Opus advisor persona | Agents support `model: opus` override; this is the mechanism for spawning Opus from a Sonnet session |
| plugin.json | JSON manifest | Plugin identity and metadata | Required for marketplace discovery and installation |

### Infrastructure

| Technology | Format | Purpose | Why |
|------------|--------|---------|-----|
| Git + GitHub | Repository | Distribution via marketplace | Claude Code marketplace uses GitHub repos as sources |
| Markdown | .md files | All component definitions | Claude Code's native format for skills, agents, and commands |
| YAML | Frontmatter blocks | Component metadata and configuration | Built into Claude Code's component discovery system |

### No External Dependencies

| Category | Decision | Rationale |
|----------|----------|-----------|
| Runtime | None | Plugin uses only Claude Code's Agent tool -- no API calls, no SDK |
| Build | None | All components are plain Markdown files; no compilation or bundling |
| Testing | skill-creator plugin | Eval framework for testing skills; already installed |
| Validation | plugin-dev plugin | Validation scripts for agents and plugin structure; already installed |

## Plugin Directory Structure

This is the exact layout for the lz-advisor plugin:

```
lz-advisor/
|-- .claude-plugin/
|   '-- plugin.json              # Required: plugin manifest
|-- agents/
|   '-- lz-advisor.md            # Opus advisor agent
|-- skills/
|   |-- lz-advisor-plan/
|   |   |-- SKILL.md             # Plan skill: orient -> advise -> plan
|   |   '-- references/
|   |       '-- advisor-timing.md  # Anthropic's suggested timing patterns
|   |-- lz-advisor-execute/
|   |   '-- SKILL.md             # Execute skill: full executor-advisor loop
|   |-- lz-advisor-review/
|   |   '-- SKILL.md             # Review skill: Opus reviews completed work
|   '-- lz-advisor-security-review/
|       '-- SKILL.md             # Security review skill: Opus reviews with threat focus
|-- LICENSE
'-- README.md
```

**Rationale for structure decisions:**

- **No `commands/` directory**: Skills (not commands) are the right component type. Skills auto-trigger on context match and support progressive disclosure. Commands are legacy format (per plugin-dev docs: "The `.claude/commands/` directory is a legacy format. For new skills, use the `.claude/skills/<name>/SKILL.md` directory format").
- **No `hooks/` directory**: Hooks are out of scope for v1 (cost control, no noise, can't scope to skill execution).
- **No `.mcp.json`**: No external services; the Agent tool is the sole mechanism.
- **Single agent, multiple skills**: The advisor persona is constant; skills define different workflows that invoke it.
- **`lz-advisor` prefix**: Namespace all components to avoid collision with other plugins.

## Plugin Manifest (plugin.json)

```json
{
  "name": "lz-advisor",
  "version": "0.1.0",
  "description": "Advisor strategy: pair Opus advisor with your session model for near-Opus intelligence at Sonnet cost",
  "author": {
    "name": "Lars Gyrup Brink Nielsen",
    "url": "https://github.com/LayZeeDK"
  },
  "repository": "https://github.com/LayZeeDK/lz-advisor-claude-plugins",
  "license": "MIT",
  "keywords": [
    "advisor",
    "opus",
    "sonnet",
    "intelligence",
    "cost-optimization",
    "code-review",
    "planning"
  ]
}
```

**Confidence:** HIGH -- derived directly from plugin-dev manifest-reference.md and existing marketplace plugins.

**Name validation:** `lz-advisor` matches regex `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` (starts with letter, kebab-case, 3+ chars).

## Agent File Format

### lz-advisor.md -- The Opus Advisor Agent

The agent definition is the core mechanism for invoking Opus from a Sonnet session. The `model: opus` field in frontmatter tells Claude Code's Agent tool to spawn this agent on Opus 4.6 regardless of the session model.

**Required frontmatter fields** (per plugin-dev agent-development SKILL.md):

| Field | Value | Notes |
|-------|-------|-------|
| `name` | `lz-advisor` | 3-50 chars, lowercase + hyphens, must start/end alphanumeric |
| `description` | Triggering conditions + examples | Most critical field; determines when agent triggers |
| `model` | `opus` | Overrides session model; spawns on Opus 4.6 |
| `color` | `magenta` | Visual identifier; magenta = creative/strategic |
| `tools` | `["Read", "Glob"]` | Read-only; advisor reads context but never writes |

**Agent frontmatter format:**

```markdown
---
name: lz-advisor
description: Use this agent when a skill needs strategic advisor consultation from a stronger model. The advisor reads conversation context and provides concise, actionable guidance (under 100 words, enumerated steps). Examples:

<example>
Context: A planning skill needs Opus-level strategic direction after Sonnet has gathered context
user: "Plan the implementation for the authentication refactor"
assistant: "I've gathered the codebase context. Let me consult the advisor for strategic direction."
<commentary>
The plan skill has completed orientation. Before creating the plan, consult lz-advisor for Opus-level strategic guidance on approach.
</commentary>
assistant: "I'll use the lz-advisor agent for a strategic assessment."
</example>

<example>
Context: An implementation skill is stuck on a complex problem
user: "Implement the caching layer"
assistant: "I've tried two approaches and both have issues. Let me consult the advisor."
<commentary>
Executor is stuck. This is a key advisor timing moment per Anthropic's suggested system prompt.
</commentary>
assistant: "I'll use the lz-advisor agent to get guidance on the caching approach."
</example>

model: opus
color: magenta
tools: ["Read", "Glob"]
---

[System prompt body goes here -- defines advisor persona and output format]
```

**Confidence:** HIGH -- `model: opus` is documented in plugin-dev agent-development SKILL.md with explicit options: `inherit`, `sonnet`, `opus`, `haiku`. This is also how Claude Code's own code-review command spawns Haiku and Sonnet agents (observed in the code-review plugin).

### Key Design Constraint: Advisor Output Trimming

The advisor agent's system prompt must enforce conciseness because advisor output is the largest cost driver. Per Anthropic's advisor tool docs:

> "The advisor should respond in under 100 words and use enumerated steps, not explanations."

This instruction cut total advisor output tokens by ~35-45% in Anthropic's internal testing without changing call frequency.

## Skill File Format

### SKILL.md Structure

Skills are the primary orchestration mechanism. Each skill defines a complete executor-advisor workflow.

**Frontmatter fields** (per skill-creator and plugin-dev skill-development):

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Skill identifier, kebab-case |
| `description` | Yes | Trigger conditions; MUST use third person ("This skill should be used when...") |
| `version` | Optional | Semantic versioning |

**SKILL.md template:**

```markdown
---
name: lz-advisor-plan
description: This skill should be used when the user asks to "plan an implementation", "create a plan", "plan before implementing", "think through the approach", "lz-advisor plan", or needs strategic planning before substantive coding work. Provides Opus-level strategic planning at Sonnet cost by orchestrating an executor-advisor consultation loop. Always use this skill when the user wants a plan, even if they do not explicitly mention "advisor" or "opus".
version: 0.1.0
---

# Advisor-Assisted Planning

[Skill body in imperative form...]
```

### Description Optimization (Critical)

The description is the primary triggering mechanism. Per skill-creator docs, Claude tends to "undertrigger" skills -- failing to use them when useful. Descriptions must be "pushy":

**Pattern (from skill-creator):**

```
This skill should be used when the user asks to "[phrase 1]", "[phrase 2]", "[phrase 3]", or needs [broader description]. [Value proposition]. Always use this skill when [common scenario], even if [hedging case].
```

**DO:**
- Use third person: "This skill should be used when..."
- Include specific trigger phrases users would actually type
- Be concrete and slightly "pushy" about when to trigger
- Cover both explicit requests and contextual matches
- Mention the `lz-advisor` prefix as a trigger phrase

**DO NOT:**
- Use second person: "Use this skill when you..."
- Be vague: "Provides guidance for planning"
- Omit trigger phrases
- Assume users will use exact skill names

### Progressive Disclosure

Skills use three-level loading (per skill-creator and plugin-dev):

1. **Metadata** (~100 words) -- Always in context: name + description from frontmatter
2. **SKILL.md body** (<5,000 words, ideal 1,500-2,000) -- Loaded when skill triggers
3. **Bundled resources** (unlimited) -- Loaded on demand via references/, scripts/, assets/

**For the advisor skills:** Keep each SKILL.md body under 2,000 words. Move Anthropic's full advisor timing guidance to `references/advisor-timing.md` and reference it from the plan skill. The execute skill references the timing guidance too but its core loop is self-contained.

### Writing Style (Imperative Form)

Per plugin-dev skill-development SKILL.md, skill bodies MUST use imperative/infinitive form:

**Correct:**
```
Gather context about the task by reading relevant files.
Consult the lz-advisor agent for strategic direction.
Produce an actionable plan based on the advisor's guidance.
```

**Incorrect:**
```
You should gather context about the task.
Claude needs to consult the advisor.
The user will receive an actionable plan.
```

## Agent Tool Model Override Mechanism

This is the core mechanism that makes the advisor strategy work in a plugin context.

### How It Works

1. User runs a session with their chosen model (typically Sonnet 4.6)
2. A skill triggers and its instructions tell the session model to spawn an agent
3. The agent definition has `model: opus` in frontmatter
4. Claude Code's Agent tool (internally called "Task" tool) spawns a subagent on Opus 4.6
5. The Opus subagent receives the system prompt from the agent's markdown body
6. The Opus subagent reads the conversation context and produces advice
7. The advice returns to the session model, which continues with the skill workflow

### Key Differences from API Advisor Tool

| Aspect | API Advisor Tool | Plugin Advisor Pattern |
|--------|-----------------|----------------------|
| Mechanism | `advisor_20260301` server-side tool | Agent tool with `model: opus` |
| Context | Server-side, full transcript automatically | Agent reads via tools (Read, Glob) |
| Output | 400-700 tokens typical | Must be constrained via system prompt |
| Cost control | `max_uses` parameter | Prompt-level discipline (2-3 calls per task) |
| Integration | Single API request | Multiple agent spawns within skill execution |
| Thinking | Advisor thinking dropped automatically | Must instruct agent to be concise |

**Confidence:** HIGH -- Agent model override (`model: opus`) is documented in plugin-dev. The code-review marketplace plugin demonstrates multi-model agent spawning (Haiku for triage, Sonnet for review). PROJECT.md confirms Agent tool supports model overrides.

### Cost Implications

Each advisor consultation spawns a full Opus inference. Unlike the API advisor tool (which drops thinking blocks and typically produces 400-700 text tokens), the plugin agent approach gives the full model context. The system prompt must enforce:

1. Under 100 words output
2. Enumerated steps, not explanations
3. No tool calls from the advisor (read-only via `tools: ["Read", "Glob"]`)

## Marketplace Publishing Requirements

**Confidence:** MEDIUM -- derived from examining the marketplace README and existing plugins. The official docs at code.claude.com are blocked.

### Repository Structure

Marketplace plugins are hosted as GitHub repositories. The marketplace can be:
- **Official**: `anthropics/claude-plugins-official` (Anthropic-maintained)
- **Community**: Any GitHub repo registered as a marketplace

For a community plugin like lz-advisor:

1. **Repository** contains the plugin directory at its root
2. **`.claude-plugin/plugin.json`** must exist at the plugin root
3. **`README.md`** documents installation and usage
4. **`LICENSE`** file required for distribution

### Installation Command

Users install with:
```
/plugin install lz-advisor@<marketplace-name>
```

Or from a GitHub repo directly:
```
/plugin install LayZeeDK/lz-advisor-claude-plugins
```

### Quality Conventions (from examining official plugins)

- All official plugins include LICENSE files (MIT common)
- README.md describes purpose, installation, usage
- Skills follow progressive disclosure
- Agent descriptions include `<example>` blocks
- Components use kebab-case naming throughout
- No hardcoded paths (use `${CLAUDE_PLUGIN_ROOT}`)

## Skill-Creator Guidelines (Authoritative for Skills)

The skill-creator plugin is authoritative for skill development best practices. Key guidelines that apply to lz-advisor skills:

### Description Optimization Loop

After creating skills, run the description optimization:

1. Generate 20 trigger eval queries (10 should-trigger, 10 should-not-trigger)
2. Queries must be realistic (file paths, personal context, abbreviations, casual speech)
3. Should-not-trigger queries must be near-misses, not obviously irrelevant
4. Run `scripts/run_loop.py` with eval set for automated optimization
5. Apply `best_description` to SKILL.md frontmatter

**For lz-advisor:** Schedule description optimization after initial skill drafts. Example should-trigger queries:
- "help me plan this refactor before I start coding"
- "ok so I need to implement this new API endpoint, can you help me think through the approach first"
- "review the authentication changes I just made"

Example should-not-trigger near-misses:
- "plan my weekly schedule" (not a coding plan)
- "review this restaurant" (not a code review)
- "implement this feature" (implement without asking for advisor -- should this trigger? Edge case to test)

### Skill Testing with skill-creator

Use the skill-creator's eval framework:
1. Draft 2-3 realistic test prompts
2. Spawn parallel with-skill and without-skill runs
3. Grade with assertions
4. Launch eval viewer for human review
5. Iterate until satisfied

### Key Insight: Explain the "Why"

From skill-creator (emphasis original):

> "Try hard to explain the **why** behind everything you're asking the model to do. Today's LLMs are *smart*. They have good theory of mind and when given a good harness can go beyond rote instructions."

For advisor skills, this means explaining WHY the executor should consult the advisor at specific moments, not just commanding "call the advisor now." The model will follow advisor timing more reliably if it understands the cost-benefit.

## Plugin-Dev Guidelines (Authoritative for Structure)

The plugin-dev plugin is authoritative for plugin structure and component organization. Key guidelines:

### Component Discovery

Claude Code automatically discovers:
- `commands/*.md` -- All .md files
- `agents/*.md` -- All .md files
- `skills/*/SKILL.md` -- All subdirectories containing SKILL.md
- `hooks/hooks.json` -- Hook configuration
- `.mcp.json` -- MCP server definitions

Discovery happens at plugin load time. No restart required for changes (next session picks them up).

### Naming Conventions

- Plugin name: kebab-case (`lz-advisor`)
- Agent files: kebab-case `.md` (`lz-advisor.md`)
- Skill directories: kebab-case (`lz-advisor-plan/`)
- SKILL.md files: Exactly `SKILL.md` (not `skill.md` or `README.md`)

### Component Lifecycle

1. **Discovery**: Claude Code reads `.claude-plugin/plugin.json`, scans default paths
2. **Registration**: Components become available
3. **Activation**: Skills trigger on context match; agents invoked by Agent tool

### Validation Checklist (from plugin-dev)

- [ ] `.claude-plugin/plugin.json` exists with valid `name`
- [ ] All component directories at plugin root (not inside `.claude-plugin/`)
- [ ] SKILL.md frontmatter has `name` and `description`
- [ ] Agent frontmatter has `name`, `description`, `model`, `color`
- [ ] Description uses third person for skills, examples for agents
- [ ] All paths use `${CLAUDE_PLUGIN_ROOT}` (no hardcoded paths)
- [ ] kebab-case naming throughout

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Entry point | Skills | Commands | Skills auto-trigger on context; commands require `/invoke`. Commands are legacy format per plugin-dev. |
| Advisor mechanism | Agent with `model: opus` | API advisor tool | Project constraint: no API dependency, plugin-only |
| Multiple agents | Single `lz-advisor` agent | Per-skill agents (plan-advisor, review-advisor) | The advisor persona is constant; skills define different workflows. One agent, many skills. |
| Agent tools | `["Read", "Glob"]` | Full tool access | Principle of least privilege. Advisor reads context but never writes. Reduces cost and prevents advisor from taking action. |
| Hooks | None for v1 | PreToolUse for auto-advising | Hooks are global (can't scope to skill), lack conversation context, add cost/noise without clear value |

## Sources

All findings derive from files on the local filesystem:

- **skill-creator plugin** (installed): `~/.claude/plugins/cache/claude-plugins-official/skill-creator/unknown/skills/skill-creator/SKILL.md` -- Authoritative for skill development methodology, description optimization, eval framework
- **plugin-dev plugin** (installed): `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/unknown/` -- Authoritative for plugin structure, agent format, command format, hooks, MCP integration
- **plugin-dev agent-development**: `skills/agent-development/SKILL.md` -- Agent frontmatter fields including `model: opus`
- **plugin-dev skill-development**: `skills/skill-development/SKILL.md` -- Skill writing style, progressive disclosure, third-person descriptions
- **plugin-dev plugin-structure**: `skills/plugin-structure/SKILL.md` + `references/manifest-reference.md` -- Plugin.json format, directory layout
- **plugin-dev command-development**: `skills/command-development/SKILL.md` + `references/frontmatter-reference.md` -- Command frontmatter including `model` override field
- **Anthropic advisor tool docs**: `research/anthropic/docs/advisor-tool.md` -- API advisor tool reference, timing guidance, trimming instructions
- **Anthropic advisor blog post**: `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Strategy rationale, benchmark results
- **Official marketplace**: `~/.claude/plugins/marketplaces/claude-plugins-official/` -- Real plugin structures, README conventions
- **code-review plugin**: `plugins/code-review/commands/code-review.md` -- Multi-model agent spawning pattern (Haiku + Sonnet)
- **example-plugin**: `plugins/example-plugin/` -- Reference implementation for marketplace plugins
