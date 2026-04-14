<!-- GSD:project-start source:PROJECT.md -->
## Project

**lz-advisor**

A Claude Code marketplace plugin that implements the advisor strategy -- pairing a stronger advisor model (Opus) with a faster executor model (Sonnet) -- using only Claude Code's native plugin components (skills, agents). No Claude API or `advisor_20260301` tool dependency. Users invoke skills that orchestrate an executor-advisor loop where Sonnet drives the work and consults an Opus agent at strategic moments for concise guidance.

**Core Value:** Near-Opus intelligence at Sonnet cost for coding tasks, achieved through strategic advisor consultation at high-leverage moments rather than running Opus end-to-end.

### Constraints

- **Platform**: Claude Code marketplace plugin only -- no standalone API usage
- **Dependencies**: Zero external dependencies -- Claude Code Agent tool is the only mechanism
- **Model availability**: Requires user has access to both Sonnet 4.6 and Opus 4.6
- **Prompt optimization**: Executor prompts optimized for Sonnet 4.6, advisor prompts optimized for Opus 4.6
- **Cost**: Advisor consultations should be strategic (2-3 per task), not per-tool-call
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
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
plugins/lz-advisor/
|-- .claude-plugin/
|   '-- plugin.json              # Required: plugin manifest
|-- agents/
|   |-- advisor.md               # Opus advisor agent (qualified: lz-advisor:advisor)
|   |-- reviewer.md              # Opus code quality reviewer agent
|   '-- security-reviewer.md     # Opus security reviewer agent
|-- skills/
|   |-- lz-advisor.plan/
|   |   '-- SKILL.md             # Plan skill: orient -> advise -> plan (qualified: lz-advisor:lz-advisor.plan)
|   |-- lz-advisor.execute/
|   |   '-- SKILL.md             # Execute skill: full executor-advisor loop (qualified: lz-advisor:lz-advisor.execute)
|   |-- lz-advisor.review/
|   |   '-- SKILL.md             # Review skill: Opus reviews completed work (qualified: lz-advisor:lz-advisor.review)
|   '-- lz-advisor.security-review/
|       '-- SKILL.md             # Security review skill: Opus reviews with threat focus (qualified: lz-advisor:lz-advisor.security-review)
|-- references/
|   '-- advisor-timing.md        # Anthropic's suggested timing patterns
|-- README.md
'-- LICENSE
- **No `commands/` directory**: Skills (not commands) are the right component type. Skills auto-trigger on context match and support progressive disclosure. Commands are legacy format (per plugin-dev docs: "The `.claude/commands/` directory is a legacy format. For new skills, use the `.claude/skills/<name>/SKILL.md` directory format").
- **No `hooks/` directory**: Hooks are out of scope for v1 (cost control, no noise, can't scope to skill execution).
- **No `.mcp.json`**: No external services; the Agent tool is the sole mechanism.
- **Three agents, four skills**: A general-purpose advisor for plan and execute workflows, plus specialized reviewer and security-reviewer agents for review and security-review skills.
- **`lz-advisor` prefix**: Namespace all components to avoid collision with other plugins.
## Plugin Manifest (plugin.json)
## Agent File Format
### advisor.md -- The Opus Advisor Agent (qualified: lz-advisor:advisor)
| Field | Value | Notes |
|-------|-------|-------|
| `name` | `advisor` | 3-50 chars, lowercase + hyphens; qualified as `lz-advisor:advisor` |
| `description` | Triggering conditions + examples | Most critical field; determines when agent triggers |
| `model` | `opus` | Overrides session model; spawns on Opus 4.6 |
| `color` | `magenta` | Visual identifier; magenta = creative/strategic |
| `tools` | `["Read", "Glob"]` | Read-only; advisor reads context but never writes |
| `effort` | `high` | Deep strategic reasoning; reviewer and security-reviewer also use `high` |
| `maxTurns` | `3` | 2 tool-use turns + free synthesis turn; prevents preamble-as-response from maxTurns: 1 |
### Key Design Constraint: Advisor Output Trimming
## Skill File Format
### SKILL.md Structure
| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Skill identifier, kebab-case |
| `description` | Yes | Trigger conditions; MUST use third person ("This skill should be used when...") |
| `version` | Optional | Semantic versioning |
# Advisor-Assisted Planning
### Description Optimization (Critical)
- Use third person: "This skill should be used when..."
- Include specific trigger phrases users would actually type
- Be concrete and slightly "pushy" about when to trigger
- Cover both explicit requests and contextual matches
- Mention the `lz-advisor` prefix as a trigger phrase
- Use second person: "Use this skill when you..."
- Be vague: "Provides guidance for planning"
- Omit trigger phrases
- Assume users will use exact skill names
### Progressive Disclosure
### Writing Style (Imperative Form)
## Agent Tool Model Override Mechanism
### How It Works
### Key Differences from API Advisor Tool
| Aspect | API Advisor Tool | Plugin Advisor Pattern |
|--------|-----------------|----------------------|
| Mechanism | `advisor_20260301` server-side tool | Agent tool with `model: opus` |
| Context | Server-side, full transcript automatically | Agent reads via tools (Read, Glob) |
| Output | 400-700 tokens typical | Must be constrained via system prompt |
| Cost control | `max_uses` parameter | Prompt-level discipline (2-3 calls per task) |
| Integration | Single API request | Multiple agent spawns within skill execution |
| Thinking | Advisor thinking dropped automatically | Must instruct agent to be concise |
### Cost Implications
## Marketplace Publishing Requirements
### Repository Structure
- **Official**: `anthropics/claude-plugins-official` (Anthropic-maintained)
- **Community**: Any GitHub repo registered as a marketplace
### Installation Command
### Quality Conventions (from examining official plugins)
- All official plugins include LICENSE files (MIT common)
- README.md describes purpose, installation, usage
- Skills follow progressive disclosure
- Agent descriptions include `<example>` blocks
- Components use kebab-case naming throughout
- No hardcoded paths (use `${CLAUDE_PLUGIN_ROOT}`)
## Skill-Creator Guidelines (Authoritative for Skills)
### Description Optimization Loop
- "help me plan this refactor before I start coding"
- "ok so I need to implement this new API endpoint, can you help me think through the approach first"
- "review the authentication changes I just made"
- "plan my weekly schedule" (not a coding plan)
- "review this restaurant" (not a code review)
- "implement this feature" (implement without asking for advisor -- should this trigger? Edge case to test)
### Skill Testing with skill-creator
### Key Insight: Explain the "Why"
## Plugin-Dev Guidelines (Authoritative for Structure)
### Component Discovery
- `commands/*.md` -- All .md files
- `agents/*.md` -- All .md files
- `skills/*/SKILL.md` -- All subdirectories containing SKILL.md
- `hooks/hooks.json` -- Hook configuration
- `.mcp.json` -- MCP server definitions
### Naming Conventions
- Plugin name: kebab-case (`lz-advisor`)
- Agent files: kebab-case `.md` (`advisor.md`)
- Skill directories: dotted-prefix (`lz-advisor.plan/`, `lz-advisor.execute/`, `lz-advisor.review/`, `lz-advisor.security-review/` -- explicit namespace for unique user-facing shorthands)
- SKILL.md files: Exactly `SKILL.md` (not `skill.md` or `README.md`)
### Component Lifecycle
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
| Multiple agents | Three role-specialized agents (advisor, reviewer, security-reviewer) | Single shared agent for all skills | Review and security-review workflows need different personas, severity classifications, and word budgets than general advisory. |
| Agent tools | `["Read", "Glob"]` | Full tool access | Principle of least privilege. Advisor reads context but never writes. Reduces cost and prevents advisor from taking action. |
| Hooks | None for v1 | PreToolUse for auto-advising | Hooks are global (can't scope to skill), lack conversation context, add cost/noise without clear value |
## Sources
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

### Skill Verification with `claude -p`

When phase verification produces `human_needed` items for skill testing, verify them automatically using a non-interactive CLI invocation instead of deferring to manual testing:

```bash
claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.<skill-name> <realistic task prompt>" --verbose
```

- Use `/lz-advisor.<skill-name>` syntax (not natural-language triggers) for reliable skill activation
- Choose a realistic task prompt that exercises the skill's full workflow
- After the command completes, verify:
  1. **Orientation**: output references specific codebase files (proves executor explored before consulting)
  2. **Advisor conciseness**: Strategic Direction section is under 100 words, enumerated
  3. **Artifact output**: expected file was written with all required sections
- Clean up any test artifacts (plan files, etc.) after verification
- Update the UAT file status from `partial` to `resolved` and VERIFICATION.md status from `human_needed` to `passed`

This approach was validated in Phase 2: all 3 UAT items passed via `claude -p "/lz-advisor.plan ..."` without requiring an interactive session.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
