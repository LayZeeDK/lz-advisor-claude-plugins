# Phase 1: Plugin Scaffold and Advisor Agent - Research

**Researched:** 2026-04-11
**Domain:** Claude Code marketplace plugin structure + Opus advisor agent definition
**Confidence:** HIGH

## Summary

Phase 1 delivers the foundational plugin structure and the Opus advisor agent that all subsequent skills depend on. The work is entirely greenfield -- creating `.claude-plugin/plugin.json`, `agents/lz-advisor.md`, `skills/lz-advisor-plan/references/advisor-timing.md`, and supporting files (LICENSE, README.md). No external dependencies, no build steps, no npm packages.

The core technical challenge is writing an agent system prompt that produces concise, strategic output (under 100 words, enumerated steps) while allowing the advisor to read project files when needed for context verification. The prompt must use calm, natural language -- no "MUST", "CRITICAL", or "ALWAYS" -- because Opus 4.6 overtriggers on aggressive language. The architecture research (ARCHITECTURE.md) and Anthropic's advisor tool documentation provide the exact prompt patterns to adapt.

**Primary recommendation:** Build the plugin manifest first (minimal fields only), then the agent definition, then the reference file. Validate each component with `claude --debug` before moving to the next. Use the plugin-dev `plugin-validator` agent for structural validation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Agent system prompt uses one-sentence role opening followed by structured instruction sections (Output Constraint, Process, Consultation Context). Follows the plugin-dev pattern.
- **D-02:** maxTurns: 1 with reactive tool use. Advisor reads files only to verify executor claims within a single turn.
- **D-03:** Advisor always commits to a recommendation even with incomplete context. States assumptions explicitly.
- **D-04:** System prompt is model-agnostic. References "an executor" not "Sonnet."
- **D-05:** Advisor stance is not prescribed in the system prompt. Consultation framing drives behavior.
- **D-06:** Output format uses Anthropic's validated conciseness instruction: "Respond in under 100 words. Use enumerated steps, not explanations. Focus on what to do, not why."
- **D-07:** Single lz-advisor agent with consultation awareness section rather than multiple agents.
- **D-08:** Color: magenta.
- **D-09:** Positive-only instruction style -- no "What Not to Do" section.
- **D-10:** Style A description: "Use this agent to..." + 3 example blocks.
- **D-11:** Agent is skill-orchestrated only. Description states not intended for direct invocation.
- **D-12:** references/advisor-timing.md covers WHEN (timing), HOW (advice weight), and WHAT (context packaging).
- **D-13:** Reference file text adapted from Anthropic's tested wording, modified for plugin context.
- **D-14:** Full recommended field set in plugin.json (name, description, version 0.1.0, author, license MIT, repository, keywords).
- **D-15:** Renamed /lz-advisor.implement to /lz-advisor.execute.

### Claude's Discretion
- System prompt exact wording and section ordering (within D-01 structure constraints)
- Reference file internal section ordering and word count (must cover timing, weight, packaging)
- Agent description example scenario details (must follow Style A with 3 skill-driven examples)

### Deferred Ideas (OUT OF SCOPE)
- Review skills architecture conflict (deferred to Phase 4)
- Multiple consultation-specific agents (decided against for v1 per D-07)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Plugin has minimal plugin.json manifest with no unrecognized fields | Manifest reference (manifest-reference.md) documents exact valid fields. Official plugins use minimal manifests (name + description + author only). D-14 adds version/license/repository/keywords which are all documented valid fields. |
| INFRA-02 | Plugin directory structure follows marketplace conventions | STACK.md provides exact layout. plugin-dev documents auto-discovery paths. |
| INFRA-03 | Reference file offloads timing guidance to stay under 5,000-token compaction limit | Skill compaction re-attaches first 5,000 tokens per skill after auto-compaction. Moving advisor timing to references/ keeps SKILL.md lean. |
| ADVR-01 | Agent uses model: opus to always run on Opus 4.6 | Agent frontmatter `model` field documented in plugin-dev agent-development with options: inherit, sonnet, opus, haiku. Verified in code-review plugin (multi-model pattern). |
| ADVR-02 | Agent enforces conciseness: under 100 words, enumerated steps | Anthropic's validated trimming instruction cuts output 35-45%. Goes in agent system prompt body per D-06. |
| ADVR-03 | Agent has read-only tools (Read, Glob) | Agent `tools` field documented in plugin-dev. Principle of least privilege. |
| ADVR-04 | Agent uses maxTurns: 1 | maxTurns documented in Claude Code subagent docs per ARCHITECTURE.md research. Not present in plugin-dev reference -- verify at implementation time. |
| ADVR-05 | Agent uses effort: high | effort field documented in Claude Code skills/subagent docs per ARCHITECTURE.md research. Not present in plugin-dev agent reference -- verify at implementation time. |
| ADVR-06 | System prompt uses calm natural language | Anthropic's Claude 4.6 best practices: calm prompting prevents overtriggering. Pitfall #1. |
</phase_requirements>

## Standard Stack

### Core
| Component | Format | Purpose | Why Standard |
|-----------|--------|---------|--------------|
| plugin.json | JSON | Plugin identity and marketplace metadata | Required by Claude Code for plugin discovery [VERIFIED: manifest-reference.md] |
| agents/lz-advisor.md | Markdown + YAML frontmatter | Opus advisor agent definition | Agents support model: opus override for spawning Opus from Sonnet session [VERIFIED: plugin-dev agent-development] |
| references/advisor-timing.md | Markdown | Advisor timing, advice weight, context packaging guidance | Keeps SKILL.md under 5,000-token compaction limit [VERIFIED: skill-development SKILL.md] |
| LICENSE | Text | MIT license file | Required for marketplace distribution [VERIFIED: plugin-dev plugin-structure] |

### Supporting
| Component | Format | Purpose | When to Use |
|-----------|--------|---------|-------------|
| README.md | Markdown | Installation and usage docs | Required for marketplace quality [VERIFIED: official plugins all include README] |
| .gitignore | Text | Git ignore rules | If any generated/temp files exist |

### No External Dependencies
| Category | Decision | Rationale |
|----------|----------|-----------|
| Runtime | None | Plugin uses only Claude Code's Agent tool [VERIFIED: project constraint] |
| Build | None | All components are plain Markdown/JSON files [VERIFIED: project constraint] |
| Testing | skill-creator plugin (eval framework) | Already installed; used in Phase 5 for description optimization |
| Validation | plugin-dev plugin (plugin-validator agent) | Already installed; use for structural validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single lz-advisor agent | Per-skill agents (lz-advisor-orient, etc.) | Decided against (D-07): persona is constant, skills define workflows |
| Read + Glob tools on advisor | No tools at all | Read/Glob allows advisor to verify executor claims reactively within its single turn (D-02) |
| Full plugin.json fields (D-14) | Minimal name-only manifest | D-14 is a locked decision. Official plugins use minimal manifests, but D-14 adds documented valid fields for distribution readiness |

## Architecture Patterns

### Project Structure (Phase 1 deliverables)
```
lz-advisor-claude-plugins/
|-- .claude-plugin/
|   '-- plugin.json              # Plugin manifest (INFRA-01)
|-- agents/
|   '-- lz-advisor.md            # Opus advisor agent (ADVR-01 through ADVR-06)
|-- skills/
|   '-- lz-advisor-plan/
|       '-- references/
|           '-- advisor-timing.md # Timing guidance (INFRA-03)
|-- LICENSE                       # MIT license
|-- README.md                     # Installation + usage
|-- CLAUDE.md                     # (already exists)
|-- .gitignore                    # (already exists)
'-- research/                     # (already exists -- Anthropic docs)
```

**Note:** The `skills/lz-advisor-plan/SKILL.md` file is NOT part of Phase 1. Only the `references/advisor-timing.md` file is created here because it is shared infrastructure (INFRA-03). The SKILL.md files are created in Phase 2+.

### Pattern 1: Agent Definition with Model Override
**What:** Agent frontmatter uses `model: opus` to spawn on Opus 4.6 regardless of session model.
**When to use:** For the single advisor agent.
**Source:** [VERIFIED: plugin-dev agent-development SKILL.md -- model field with options inherit/sonnet/opus/haiku]

```yaml
---
name: lz-advisor
description: |
  Use this agent when a skill needs strategic advisor consultation from
  a stronger model. Requires structured context packaging from the
  executor; not intended for direct invocation.

  <example>
  Context: A planning skill completed orientation and needs strategic direction
  user: "Plan the implementation for the authentication refactor"
  assistant: "I've gathered the codebase context. Let me consult the advisor for strategic direction."
  <commentary>
  The plan skill has completed orientation. Before creating the plan,
  consult lz-advisor for Opus-level strategic guidance on approach.
  </commentary>
  assistant: "I'll use the lz-advisor agent for a strategic assessment."
  </example>

  <example>
  Context: An implementation skill is stuck on a recurring error
  user: "Implement the caching layer"
  assistant: "I've tried two approaches and both have issues. Let me consult the advisor."
  <commentary>
  Executor is stuck. This is a key advisor timing moment per
  Anthropic's guidance.
  </commentary>
  assistant: "I'll use the lz-advisor agent to get guidance on the caching approach."
  </example>

  <example>
  Context: Executor finished implementation and needs final verification
  user: "Build the database migration system"
  assistant: "Implementation is complete and committed. Let me get a final advisor review."
  <commentary>
  Executor has made deliverable durable. Final advisor consultation
  before declaring done.
  </commentary>
  assistant: "I'll use the lz-advisor agent for a final check."
  </example>

model: opus
color: magenta
effort: high
tools: ["Read", "Glob"]
maxTurns: 1
---

[System prompt body -- see Code Examples section]
```

### Pattern 2: Agent System Prompt Structure (per D-01)
**What:** One-sentence role opening + structured sections.
**When to use:** For the lz-advisor agent system prompt body.
**Source:** [VERIFIED: plugin-dev system-prompt-design.md -- "You are [specific role] specializing in [specific domain]" pattern]

Structure:
1. One-sentence role opening: "You are a strategic engineering advisor specializing in concise, actionable guidance for coding tasks."
2. Output Constraint section: under 100 words, enumerated steps, not explanations (D-06)
3. Process section: how to handle each consultation type
4. Consultation Context section: the four moments (orient, diagnose, verify, evaluate) -- awareness without prescription (D-05)
5. Edge Cases: what to do with incomplete context (D-03)

### Pattern 3: Reference File as Shared Infrastructure
**What:** `references/advisor-timing.md` placed inside the plan skill directory but loaded by all skills.
**When to use:** For Anthropic's timing guidance that skills include via `@references/advisor-timing.md`.
**Source:** [VERIFIED: skill-development SKILL.md -- references/ for documentation loaded on demand]

The reference file covers three concerns (D-12):
1. **WHEN to consult** -- adapted from Anthropic's suggested timing block
2. **HOW to treat advice** -- adapted from Anthropic's advice weight block
3. **WHAT to include** -- context packaging guidance specific to the subagent gap

### Pattern 4: Minimal Plugin Manifest
**What:** Only documented valid fields in plugin.json.
**When to use:** Always -- unrecognized fields cause silent plugin rejection (Pitfall #5).
**Source:** [VERIFIED: manifest-reference.md -- field reference with validation regex]

```json
{
  "name": "lz-advisor",
  "version": "0.1.0",
  "description": "Advisor strategy: pair Opus advisor with session model for near-Opus intelligence at Sonnet cost",
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

**All fields verified as valid in manifest-reference.md:** name, version, description, author (object with name/url), repository (string URL), license (SPDX), keywords (string array). [VERIFIED: manifest-reference.md]

### Anti-Patterns to Avoid
- **Aggressive prompt language:** No "MUST", "CRITICAL", "ALWAYS" in system prompt. Opus 4.6 overtriggers on these. Use calm natural language. (Pitfall #1) [VERIFIED: PITFALLS.md citing Anthropic claude-4-best-practices]
- **Write tools on advisor:** Never give the advisor Write, Edit, or Bash. It becomes an executor, doubling cost. (Pitfall #13) [VERIFIED: Anthropic advisor tool docs -- "The advisor never calls tools"]
- **Custom fields in plugin.json:** Any unrecognized root-level field causes silent rejection. (Pitfall #5) [VERIFIED: GitHub issues #30366, #31384]
- **Verbose advisor output:** Without conciseness instruction, Opus defaults to 400-700 text token explanations. The trimming instruction cuts this 35-45%. (Pitfall #4) [VERIFIED: Anthropic advisor tool docs]
- **Second person in skills:** Skills use imperative form ("Gather context about..."), not second person ("You should gather context..."). Agents use second person ("You are a..."). Different conventions. [VERIFIED: plugin-dev skill-development]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Plugin validation | Manual file-by-file checking | plugin-dev `plugin-validator` agent | Comprehensive validation including manifest, agents, skills, naming |
| Advisor timing instructions | Custom wording from scratch | Anthropic's suggested system prompt blocks (adapted) | Their wording was validated through benchmarks; changing it risks degrading performance (D-13) |
| Conciseness enforcement | Custom "be brief" wording | "Respond in under 100 words. Use enumerated steps, not explanations." | Exact line from Anthropic that cut output 35-45% in testing (D-06) |
| Agent description format | Freeform text | Style A pattern with `<example>` blocks | Matches 11 of 16 agents across official plugins (D-10) |

**Key insight:** This phase is primarily prompt engineering. The "stack" is Markdown files with specific YAML frontmatter. The quality depends entirely on the exact wording of the agent system prompt and reference file -- Anthropic has tested specific phrasings that work, and we should adapt rather than rewrite them.

## Common Pitfalls

### Pitfall 1: Aggressive Prompt Language Causing Overtriggering
**What goes wrong:** Using "MUST", "CRITICAL", "ALWAYS" causes Opus 4.6 to invoke tools and agents far more often than intended, leading to cost explosion.
**Why it happens:** Opus 4.6 is significantly more responsive to system prompt instructions than previous models.
**How to avoid:** Use calm, natural language throughout. "Use this when..." not "You MUST use this when..." (ADVR-06). Remove all "if in doubt" fallback language.
**Warning signs:** Advisor called more than 3 times per typical task during Phase 2+ testing.
[VERIFIED: PITFALLS.md citing platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices]

### Pitfall 2: Verbose Advisor Output (Cost Explosion)
**What goes wrong:** Without the conciseness instruction, Opus generates 500+ word explanations at $75/MTok output rate.
**Why it happens:** Opus defaults to thorough explanations.
**How to avoid:** Include Anthropic's exact trimming instruction as the first advisor-related line in the system prompt (D-06). Do not add "explain your reasoning" or "provide alternatives."
**Warning signs:** Advisor output regularly exceeds 150 words.
[VERIFIED: Anthropic advisor tool docs, "Trimming advisor output length" section]

### Pitfall 3: Silent Plugin Manifest Rejection
**What goes wrong:** Unrecognized fields in plugin.json cause skills to silently fail to load.
**Why it happens:** Claude Code's plugin.json parser uses strict schema validation.
**How to avoid:** Only use documented fields from manifest-reference.md. Test with `claude --debug` to verify plugin loads. Omit any field you are unsure about.
**Warning signs:** Skills show as "Unknown skill" after installation.
[VERIFIED: GitHub issues #20409, #30366, #31384]

### Pitfall 4: Opus Overthinking and Excessive Exploration
**What goes wrong:** Advisor takes 30+ seconds instead of 5-10 seconds for routine guidance.
**Why it happens:** Opus 4.6 does significantly more upfront exploration at higher effort settings.
**How to avoid:** Set effort: high (not max) on the advisor agent. Include conciseness instruction. Keep system prompt short and focused.
**Warning signs:** Advisor responses consistently over 15 seconds.
[CITED: PITFALLS.md citing platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices]

### Pitfall 5: Plugin Installed But Not Enabled
**What goes wrong:** Plugin is correctly installed but not added to enabledPlugins in settings.json.
**Why it happens:** Known bug (GitHub issue #17832).
**How to avoid:** Include verification steps in README. Test with `claude --debug`. Document the manual enablement workaround.
**Warning signs:** Skills installed but never trigger.
[VERIFIED: GitHub issue #17832]

### Pitfall 6: Naming Conflicts with Other Plugins
**What goes wrong:** Agent name conflicts with user-level or project-level agents of the same name.
**Why it happens:** Plugin components have lowest priority in name resolution.
**How to avoid:** The `lz-advisor` prefix on all components provides namespace isolation (already decided). Test with other popular plugins installed.
**Warning signs:** Agent spawning returns unexpected behavior or wrong model.
[VERIFIED: PITFALLS.md citing Claude Code subagent docs scope priority table]

## Code Examples

### Agent System Prompt Body (complete draft)

Based on decisions D-01 through D-09, D-11, adapted from Anthropic's tested patterns:

```markdown
You are a strategic engineering advisor specializing in concise, actionable
guidance for coding tasks.

## Output Constraint

Respond in under 100 words. Use enumerated steps, not explanations. Focus on
what to do, not why. If recommending an approach, commit to one -- do not list
alternatives unless the executor explicitly asks for options.

## Consultation Process

When consulted, read the executor's prompt carefully. It contains the task
description, findings gathered so far, and a specific question or decision point.

If the executor's findings are insufficient or claims seem questionable, use
Read or Glob to verify against the actual project files before responding. Do
this within a single turn -- gather what you need, then respond.

If context is incomplete, state your assumptions explicitly and provide guidance
conditional on those assumptions: "Assuming X, do Y. If X is wrong, do Z
instead."

## Consultation Awareness

The executor consults you at strategic moments during task execution. The
framing of each consultation tells you the type of guidance needed:

- Orientation summary with proposed approach -- provide strategic direction
- Description of a recurring error or stalled progress -- diagnose the root
  cause and suggest a specific correction
- Completed work summary asking for review -- verify the approach is sound
  and flag any concerns
- Description of conflicting evidence -- evaluate the tradeoffs and recommend
  which path to take

Adapt your response to match what the executor needs. Do not repeat information
the executor already knows.
```

**Source:** Adapted from Anthropic's advisor tool docs suggested system prompt + plugin-dev system-prompt-design.md patterns + locked decisions D-01 through D-09. [CITED: research/anthropic/docs/advisor-tool.md, plugin-dev system-prompt-design.md]

### Reference File: advisor-timing.md (complete draft)

Based on decisions D-12, D-13, adapted from Anthropic's tested timing and advice blocks:

```markdown
# Advisor Timing and Context Packaging

## When to Consult the Advisor

The `lz-advisor` agent is backed by a stronger model. When invoked via the
Agent tool, pass a clear prompt summarizing the task, findings so far, and
what guidance is needed. The advisor cannot see the conversation -- all relevant
context must be included in the prompt.

Call the advisor before substantive work -- before writing, before committing to
an interpretation, before building on an assumption. If the task requires
orientation first (finding files, reading source, seeing what is there), do that
first, then call the advisor. Orientation is not substantive work. Writing,
editing, and declaring an answer are.

Also call the advisor:
- When the task is believed to be complete. Before this call, make the
  deliverable durable: write the file, save the result, commit the change.
  The advisor call takes time; if the session ends during it, a durable result
  persists and an unwritten one does not.
- When stuck -- errors recurring, approach not converging, results that do
  not fit.
- When considering a change of approach.

On tasks longer than a few steps, call the advisor at least once before
committing to an approach and once before declaring done. On short reactive
tasks where the next action is dictated by tool output just read, additional
calls are unnecessary -- the advisor adds most value on the first call, before
the approach crystallizes.

## How to Treat the Advice

Give the advice serious weight. If a step fails empirically, or there is
primary-source evidence that contradicts a specific claim (the file says X,
the documentation states Y), adapt. A passing self-test is not evidence the
advice is wrong -- it is evidence the test does not check what the advice is
checking.

If findings point one way and the advisor points another: do not silently
switch. Surface the conflict in one more advisor call -- "I found X, you
suggest Y, which constraint breaks the tie?" The advisor saw the provided
evidence but may have underweighted it; a reconcile call is cheaper than
committing to the wrong branch.

## What to Include in the Advisor Prompt

The advisor starts with a fresh context each time -- it cannot see the
conversation history. Every consultation must be self-contained.

Include in the advisor prompt:
1. The original task (quote the user's request or goal)
2. Key findings from orientation (files examined, patterns found, constraints
   discovered)
3. Current state of work (what has been done, what remains)
4. The specific decision or question that needs guidance

Keep the prompt focused and summarized. The advisor works best with clear,
organized context -- not raw file dumps or verbose tool output. Summarize
findings; do not paste entire files.
```

**Source:** Adapted verbatim from Anthropic's suggested system prompt blocks for coding tasks, with additions for context packaging (the subagent gap). [CITED: research/anthropic/docs/advisor-tool.md -- "Suggested system prompt for coding tasks" section]

### Plugin Manifest (exact content)

```json
{
  "name": "lz-advisor",
  "version": "0.1.0",
  "description": "Advisor strategy: pair Opus advisor with session model for near-Opus intelligence at Sonnet cost",
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

**All fields verified valid:** [VERIFIED: manifest-reference.md field specifications]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "MUST", "CRITICAL" in prompts | Calm natural language | Opus 4.6 (Feb 2026) | Prevents overtriggering; less aggressive = better results on 4.6 |
| Manual extended thinking budgets | Adaptive thinking (default) | Claude 4.6 (Feb 2026) | No need to set thinking mode; adaptive is automatic |
| Prefilled assistant messages | Not supported on 4.6 | Claude 4.6 (Feb 2026) | Hard 400 error; do not attempt |
| Commands for user-initiated actions | Skills (auto-triggering) | Claude Code evolution | Commands are legacy format per plugin-dev; skills are the standard |

**Deprecated/outdated:**
- `thinking: {type: "enabled"}` with `budget_tokens` -- replaced by adaptive thinking [CITED: ARCHITECTURE.md citing official docs]
- `interleaved-thinking-2025-05-14` beta header -- deprecated [CITED: ARCHITECTURE.md]
- Prefilling assistant messages -- 400 error on 4.6 [CITED: ARCHITECTURE.md]
- `.claude/commands/` directory -- legacy format; use `skills/*/SKILL.md` [VERIFIED: plugin-dev skill-development]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `maxTurns` is a valid agent frontmatter field | Architecture Patterns, Pattern 1 | Agent might not respect single-turn constraint; advisor could enter multi-turn tool loops. Mitigation: the `tools: ["Read", "Glob"]` restriction and conciseness instruction provide secondary enforcement. Verify with `claude --debug` during testing. |
| A2 | `effort` is a valid agent frontmatter field | Architecture Patterns, Pattern 1 | Advisor might run at session default effort instead of high. Mitigation: if the field is ignored, the advisor still produces good output (just possibly at lower thinking depth). Verify with `claude --debug`. |
| A3 | `disable-model-invocation` works on skills (not just commands) | Phase Requirements table note | Known bug #26251 may block slash commands. Relevant for Phase 2+ skill definitions, not Phase 1 agent. |
| A4 | `context: fork` with `model: opus` works for skills | Deferred (Phase 4) | Only relevant for review skills. If broken (issue #17283), review skills would need alternative architecture. |

**Note:** A1 and A2 are documented as verified in the project's ARCHITECTURE.md research, citing official Claude Code docs at code.claude.com. However, the plugin-dev authoritative plugin (which is the implementation reference) does not document these fields for agents. The project research may have verified them from a different documentation source. The planner should include explicit verification steps after file creation.

## Open Questions

1. **maxTurns and effort as agent frontmatter fields**
   - What we know: ARCHITECTURE.md claims these are verified from official Claude Code docs (code.claude.com/docs/en/sub-agents). The plugin-dev agent-development skill documents only name, description, model, color, tools.
   - What is unclear: Whether these fields are parsed from agent definition frontmatter or only set per-invocation via the Agent tool call.
   - Recommendation: Include them in the agent frontmatter as specified in locked decisions (D-02, ADVR-04, ADVR-05). Add a verification step: after creating the agent, test with `claude --debug` to confirm the fields are recognized. If they are ignored, the system prompt conciseness instruction and Read/Glob tool restriction provide adequate fallback enforcement.

2. **Reference file location under plan skill vs. shared location**
   - What we know: D-12 specifies `references/advisor-timing.md`. STACK.md places it under `skills/lz-advisor-plan/references/`. Other skills in Phase 2+ load it via `@references/advisor-timing.md`.
   - What is unclear: Whether skills from different directories can reference another skill's references/ files using relative paths or `${CLAUDE_PLUGIN_ROOT}`.
   - Recommendation: Place the file at `skills/lz-advisor-plan/references/advisor-timing.md` as specified. If cross-skill reference loading doesn't work (which would be discovered in Phase 2), the file can be duplicated or moved to a shared location. The content is the important part, not the exact path.

3. **plugin.json field validation strictness**
   - What we know: Pitfall #5 warns about unrecognized fields causing silent rejection. GitHub issues #30366, #31384 confirm this. manifest-reference.md documents the valid fields.
   - What is unclear: Whether `repository` (as a string URL rather than an object) is accepted without issue, and whether `keywords` is recognized by the client validator (it may only be used by the marketplace).
   - Recommendation: Start with the full D-14 field set. If plugin fails to load with `claude --debug`, strip to minimal (name-only) and add fields back one at a time. The manifest-reference.md documents all these fields as valid, so they should work.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual validation + plugin-validator agent |
| Config file | None -- plugin components are validated by Claude Code's discovery system |
| Quick run command | `claude --plugin-dir . --debug` (verify plugin loads) |
| Full suite command | plugin-validator agent + manual agent invocation test |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | plugin.json has only recognized fields | smoke | `claude --plugin-dir . --debug` -- check for plugin load errors | Wave 0: create test checklist |
| INFRA-02 | Directory structure follows conventions | smoke | plugin-validator agent scan | Wave 0: create test checklist |
| INFRA-03 | advisor-timing.md exists and is under 5,000 tokens | manual | Word count check: `wc -w` on the file (~3,750 words = ~5,000 tokens) | Wave 0: create test checklist |
| ADVR-01 | Agent spawns on Opus 4.6 | manual | Invoke agent, check `claude --debug` logs for model selection | Manual only |
| ADVR-02 | Output under 100 words | manual | Invoke agent with test prompt, count response words | Manual only |
| ADVR-03 | Read-only tools only | smoke | Check agent frontmatter `tools` field | Wave 0: create test checklist |
| ADVR-04 | maxTurns: 1 | manual | Invoke agent, verify single-turn response | Manual only |
| ADVR-05 | effort: high | manual | Invoke agent, check `claude --debug` for effort level | Manual only |
| ADVR-06 | No aggressive language | manual | Grep system prompt for MUST/CRITICAL/ALWAYS | Wave 0: create test checklist |

### Sampling Rate
- **Per task commit:** `claude --plugin-dir . --debug` (verify plugin loads without errors)
- **Per wave merge:** Full plugin-validator agent scan
- **Phase gate:** Manual agent invocation test confirming Opus response, conciseness, read-only behavior

### Wave 0 Gaps
- [ ] Verification checklist file (document exact manual test steps for ADVR-01 through ADVR-06)
- [ ] No automated test framework needed -- plugin components are validated by structure and manual invocation

## Security Domain

Security enforcement is not explicitly set to false in config.json, so including this section.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- plugin has no auth layer |
| V3 Session Management | No | N/A -- no sessions |
| V4 Access Control | Yes (minimal) | Agent tools restricted to Read/Glob only (principle of least privilege) |
| V5 Input Validation | No | N/A -- no user input processing beyond Claude Code's own handling |
| V6 Cryptography | No | N/A -- no secrets or encryption |

### Known Threat Patterns for Plugin Architecture

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Agent given write tools by mistake | Elevation of Privilege | tools: ["Read", "Glob"] in frontmatter -- never include Write/Edit/Bash |
| Hardcoded credentials in plugin files | Information Disclosure | No secrets in any plugin file; use env vars if needed (not applicable for v1) |
| Path traversal via ${CLAUDE_PLUGIN_ROOT} | Information Disclosure | Only use relative paths; never reference outside plugin root |

## Sources

### Primary (HIGH confidence)
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/unknown/skills/agent-development/SKILL.md` -- Agent frontmatter fields (name, description, model, color, tools), agent structure, triggering examples
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/unknown/skills/agent-development/references/system-prompt-design.md` -- System prompt patterns, second person writing, structured sections
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/unknown/skills/plugin-structure/references/manifest-reference.md` -- plugin.json field reference, validation regex, path resolution
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/unknown/skills/skill-development/SKILL.md` -- Skill structure, progressive disclosure, imperative writing style, references/ pattern
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/unknown/agents/plugin-validator.md` -- Validation rules and process
- `research/anthropic/docs/advisor-tool.md` -- API advisor tool reference, timing guidance, trimming instructions, advice weight blocks, cost data
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Strategy rationale, benchmark results (Sonnet + Opus = +2.7pp at -11.9% cost)

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` -- Agent definition spec with maxTurns/effort fields, model resolution order, subagent context isolation. Claims verified from code.claude.com but not cross-referenced with plugin-dev.
- `.planning/research/STACK.md` -- Directory structure, plugin manifest draft, agent frontmatter example
- `.planning/research/PITFALLS.md` -- 20 pitfalls with GitHub issue references, Anthropic docs citations

### Tertiary (LOW confidence)
- Real official plugin manifests examined (plugin-dev, skill-creator): Both use minimal manifests (name + description + author only, no version/license/keywords). This doesn't invalidate D-14's full field set, but suggests the ecosystem norm is minimal.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all components verified against plugin-dev authoritative source
- Architecture: HIGH for core pattern (model: opus, tools restriction, system prompt); MEDIUM for maxTurns/effort fields (documented in project research but not in plugin-dev reference)
- Pitfalls: HIGH -- documented with GitHub issue numbers and Anthropic docs citations

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (stable domain -- Claude Code plugin format unlikely to change drastically in 30 days)
