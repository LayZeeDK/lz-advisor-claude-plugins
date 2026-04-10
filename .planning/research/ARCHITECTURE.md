# Architecture Patterns

**Domain:** Claude Code marketplace plugin -- advisor strategy orchestration
**Researched:** 2026-04-10

## Recommended Architecture

The plugin implements the advisor strategy using only Claude Code's native plugin
components: one agent definition (`lz-advisor`) and multiple skill definitions
that orchestrate the executor-advisor loop.

```
lz-advisor plugin
|
|-- .claude-plugin/
|   '-- plugin.json                   # Plugin metadata
|
|-- agents/
|   '-- lz-advisor.md                 # Opus advisor agent definition
|       model: opus                    - Strategic guidance (<100 words)
|       effort: high                   - Deep thinking for advice
|       tools: Read, Glob             - Read-only, never writes
|       maxTurns: 1                    - Single-turn response
|
'-- skills/
    |-- lz-advisor-plan/
    |   |-- SKILL.md                  # Plan skill (orient -> consult -> produce)
    |   '-- references/
    |       '-- advisor-timing.md     # Anthropic's timing guidance
    |
    |-- lz-advisor-implement/
    |   '-- SKILL.md                  # Implement skill (full advisor loop)
    |
    |-- lz-advisor-review/
    |   '-- SKILL.md                  # Review skill (Opus direct)
    |
    '-- lz-advisor-security-review/
        '-- SKILL.md                  # Security review skill (Opus direct)
```

### Component Boundaries

| Component | Type | Model | Responsibility | Communicates With |
|-----------|------|-------|----------------|-------------------|
| `lz-advisor` agent | Agent definition | `opus` (effort: high) | Concise strategic guidance (<100 words, enumerated) | Skills invoke via Agent tool |
| `lz-advisor-plan` skill | Skill (inline) | Inherits session | Orient, consult advisor, produce plan | `lz-advisor` agent |
| `lz-advisor-implement` skill | Skill (inline) | Inherits session | Full build loop with advisor consultations | `lz-advisor` agent |
| `lz-advisor-review` skill | Skill (`context: fork`) | `opus` | Post-work quality review (Opus direct) | None (runs as Opus) |
| `lz-advisor-security-review` skill | Skill (`context: fork`) | `opus` | Security-focused review (Opus direct) | None (runs as Opus) |
| `references/advisor-timing.md` | Reference file | N/A | Anthropic's suggested advisor timing patterns | Loaded by skills when needed |

### Key Architectural Decision: Inline vs Forked Skills

Two skill execution modes serve different purposes in the advisor pattern:

**Inline skills** (`lz-advisor-plan`, `lz-advisor-implement`): The skill content loads
into the executor's (Sonnet's) conversation context. The executor follows the skill's
instructions and uses the Agent tool to spawn the `lz-advisor` subagent when the
instructions say to consult the advisor. The executor retains full conversation history
and tool access throughout.

**Forked skills** (`lz-advisor-review`, `lz-advisor-security-review`): The skill runs
in a separate subagent context using `context: fork` with `model: opus`. Opus runs the
review directly -- no executor-advisor loop needed because Opus IS the reviewer.

This split is intentional: plan and implement need the executor to drive work (file
edits, tool calls, iterative development) with strategic advisor consultation. Reviews
need Opus intelligence applied directly to completed work with no file editing.

## Model Optimization Findings

### Sonnet 4.6 (Executor Model)

**Release:** February 17, 2026
**Confidence:** HIGH (verified from official Anthropic docs and blog)

#### Capabilities

| Benchmark | Sonnet 4.5 | Sonnet 4.6 | Delta |
|-----------|------------|------------|-------|
| SWE-bench Verified | 77.2% | 79.6% | +2.4pp |
| Terminal-Bench 2.0 | -- | 59.1% | -- |
| ARC-AGI-2 | 13.6% | 58.3% | +44.7pp (4.3x) |
| Math | 62% | 89% | +27pp |
| OSWorld-Verified | 61.4% | 72.5% | +11.1pp |

- **1M token context window:** Generally available (previously Opus-only)
- **64k max output tokens**
- **Pricing:** $3 input / $15 output per million tokens (unchanged from 4.5)

#### Key Changes from Sonnet 4.5

1. **1M context window** (was 200k) -- enables full codebase analysis in a single prompt
2. **Adaptive thinking** replaces manual extended thinking as recommended mode
3. **Effort parameter** support (new to Sonnet family -- low/medium/high/max)
4. **Better instruction following** -- developers preferred Sonnet 4.6 over Opus 4.5
   59% of the time, citing less overengineering
5. **70% fewer tokens** consumed on file operations with 38% accuracy increase
6. Users preferred Sonnet 4.6 over Sonnet 4.5 ~70% of the time in Claude Code

#### Effort Parameter for Executor

The blog post's best benchmarks used **medium-effort Sonnet + Opus advisor**:

| Configuration | Terminal-Bench 2.0 | Cost |
|--------------|-------------------|------|
| Sonnet 4.6 medium + Opus advisor | **63.4%** | **$0.88** |
| Sonnet 4.6 medium solo | 59.6% | $0.94 |

The advisor tool docs explicitly state: "For coding tasks, pairing a Sonnet executor
at medium effort with an Opus advisor achieves intelligence comparable to Sonnet at
default effort, at lower cost. For maximum intelligence, keep the executor at default
effort."

**Recommendation for plugin:** Do NOT set `effort` in skill frontmatter. Let the user's
session effort level drive the executor. The skill is optimized for Sonnet 4.6 at any
effort level. Users who want the cost-optimal configuration can set `/effort medium`
themselves. This respects the user's choice and avoids unexpected behavior.

#### Adaptive Thinking

- `thinking: {type: "adaptive"}` is the recommended mode for Claude 4.6
- `thinking: {type: "enabled"}` with `budget_tokens` is deprecated
- At medium effort, Claude may skip thinking for simpler problems
- At high/max effort, Claude almost always thinks
- Adaptive thinking automatically enables interleaved thinking
- `interleaved-thinking-2025-05-14` beta header is deprecated

In Claude Code, users control thinking via `/effort` command or `ultrathink` keyword
in prompts. Skills can include `ultrathink` in content to trigger extended thinking.

#### Breaking Changes from 4.5

- **Prefill removal:** Prefilling assistant messages is NOT supported on Opus 4.6.
  Requests with prefilled assistant messages return a 400 error. This may affect
  Sonnet 4.6 patterns as well -- verify before using in prompts.
- **Tool parameter quoting:** Slightly different JSON string escaping in tool call
  arguments. Standard JSON parsers handle this automatically.

### Opus 4.6 (Advisor Model)

**Release:** February 5, 2026
**Confidence:** HIGH (verified from official Anthropic docs and blog)

#### Capabilities

| Benchmark | Opus 4.6 | Sonnet 4.6 | Opus Lead |
|-----------|----------|------------|-----------|
| SWE-bench Verified | 80.8% | 79.6% | +1.2pp |
| Terminal-Bench 2.0 | 65.4% | 59.1% | +6.3pp |
| ARC-AGI-2 | 68.8% | 58.3% | +10.5pp |
| GPQA Diamond | 91.3% | 74.1% | +17.2pp |
| BrowseComp | 84.0% | -- | -- |

- **1M token context window:** Generally available
- **128k max output tokens**
- **Pricing:** $15 input / $75 output per million tokens

**Where Opus 4.6 adds most value over Sonnet 4.6:**
- Deep reasoning tasks (GPQA Diamond: 17.2pp gap)
- Novel problem-solving (ARC-AGI-2: 10.5pp gap)
- Complex terminal coding (Terminal-Bench: 6.3pp gap)
- Security and IAM policy evaluation
- Ambiguous problem judgment

This confirms the advisor pattern's thesis: Opus intelligence matters most for
*strategic decisions* (which approach to take, what to watch out for), not for
mechanical execution (reading files, writing code).

#### Effort Parameter for Advisor

| Level | Available On | When to Use |
|-------|-------------|-------------|
| `low` | Opus 4.6, Sonnet 4.6 | Speed-sensitive, simple tasks |
| `medium` | Opus 4.6, Sonnet 4.6 | Balanced cost/quality |
| `high` | Opus 4.6, Sonnet 4.6 | **Recommended for advisor** -- deep strategic thinking |
| `max` | Opus 4.6, Sonnet 4.6 | Absolute maximum capability |

The `effort` field in agent frontmatter overrides the session effort level for that
subagent. This is critical: even if the user runs their session at medium effort
(for fast Sonnet execution), the advisor agent runs at high effort for deep thinking.

**Recommendation:** Set `effort: high` in the `lz-advisor` agent definition. The
advisor's value comes from deep strategic reasoning -- skimping on effort undermines
the pattern.

#### Conciseness for Advisor Output

From Anthropic's advisor tool docs:

> "The advisor should respond in under 100 words and use enumerated steps, not
> explanations."

This instruction cut total advisor output tokens by 35-45% in Anthropic's testing
without changing call frequency. Include this as a core part of the agent's system
prompt, not as a per-invocation instruction.

Advisor output is typically 400-700 text tokens, or 1,400-1,800 tokens total including
thinking. With the conciseness instruction, expect ~220-450 text tokens.

#### Opus 4.6 Fast Mode (beta)

Fast mode (`speed: "fast"`) delivers up to 2.5x faster output token generation for
Opus models at premium pricing ($30/$150 per MTok). This is the same model with faster
inference. NOT available in Claude Code subagents (API-only feature). Noted for
awareness; not applicable to the plugin architecture.

## Skill-Agent Orchestration Mechanism

### How Skills Spawn Agents in Claude Code

**Verified from official docs (HIGH confidence):**

Skills do NOT directly spawn agents. Here is the actual mechanism:

1. A skill loads its SKILL.md content into the executor's conversation context
2. The skill instructions tell the executor WHEN to consult the advisor
3. The executor uses the **Agent tool** to spawn the `lz-advisor` subagent
4. Claude Code matches the agent name to the agent definition file
   (`<plugin>/agents/lz-advisor.md` for plugin agents)
5. The subagent runs with its own context window, model, and tool restrictions
6. The subagent's final message returns to the executor as the Agent tool result
7. All intermediate tool calls and reasoning stay inside the subagent's context

The skill's job is to structure the executor's workflow. The agent's job is to
provide the advisor persona and configuration. The Agent tool is the bridge.

### Agent Model Resolution Order

**Verified from official docs (HIGH confidence):**

When Claude invokes a subagent, the model is resolved in this order (highest first):

1. `CLAUDE_CODE_SUBAGENT_MODEL` environment variable (if set)
2. Per-invocation `model` parameter from the executor
3. Agent definition's `model` frontmatter
4. Main conversation's model (inherit)

For the advisor agent, we set `model: opus` in frontmatter. This ensures the advisor
always runs on Opus regardless of the session model (priority 3 is sufficient since
users rarely set the environment variable).

The `model` field accepts:
- **Aliases:** `sonnet`, `opus`, `haiku`
- **Full IDs:** `claude-opus-4-6`, `claude-sonnet-4-6`
- **`inherit`** (default if omitted): uses the session model

### What Subagents See (and Don't See)

**Verified from official docs (HIGH confidence):**

Subagents receive ONLY:
- The prompt string from the parent (what the executor writes when invoking the Agent tool)
- The system prompt from the agent's markdown body
- Environment details (working directory, platform)
- Preloaded skills listed in the `skills` frontmatter
- CLAUDE.md content (loaded through normal message flow)

Subagents do NOT inherit:
- The parent's conversation history
- Prior tool calls or results
- Other subagents' outputs
- The parent's system prompt (gets agent's own system prompt instead)

**Critical architectural implication:** The executor must pass sufficient context IN
the prompt when spawning the advisor. Unlike the API advisor tool (where the advisor
sees the full transcript automatically), Claude Code subagents start with a fresh
context. The skill instructions must guide the executor to include:
- The original task/goal
- Key findings from orientation
- Current state of work (for mid-work or final consultations)
- Any specific questions or decisions needed

This is the biggest prompt engineering challenge for the plugin vs the API tool.

### Subagent Constraints

**Verified from official docs (HIGH confidence):**

- Subagents **cannot spawn other subagents**. The advisor cannot delegate.
- Subagents cannot use the Skill tool (cannot invoke skills).
- Each invocation creates a **fresh context** -- no memory between advisor calls.
- The `maxTurns` field caps agentic turns. Set to 1 for the advisor.
- Background subagents run concurrently but auto-deny unpreapproved permissions.

### Return Value Handling

The subagent's final message returns to the executor as the Agent tool result. All
intermediate tool calls and reasoning stay inside the subagent's context window --
only the final summary returns. This is efficient for the advisor pattern: we want
the concise guidance, not verbose exploration traces.

### Skill Frontmatter: `allowed-tools` with Agent Scoping

**Verified from official docs (HIGH confidence):**

Skills can pre-approve agent spawning with scoped tool permissions:

```yaml
allowed-tools: Agent(lz-advisor)
```

This means the executor can spawn the `lz-advisor` subagent without prompting the
user for permission. This is essential for a smooth advisor consultation experience --
without it, every advisor call would require user approval.

The `allowed-tools` field supports space-separated entries:

```yaml
allowed-tools: Read Write Edit Glob Bash Agent(lz-advisor)
```

### Skill Frontmatter: `effort` Field

**Verified from official docs (HIGH confidence):**

Skills support the `effort` frontmatter field:

```yaml
effort: medium
```

Options: `low`, `medium`, `high`, `max` (Opus 4.6 only for `max`).
This overrides the session effort level while the skill is active.

**Recommendation:** Do NOT set effort in plan/implement skills. Let the user's session
effort drive the executor. Setting it would override the user's choice.

DO set `effort: high` on review skills since they run as Opus via `context: fork`.

### Skill Compaction Behavior

**Verified from official docs (HIGH confidence):**

After auto-compaction, Claude Code re-attaches invoked skills (first 5,000 tokens
each, combined budget of 25,000 tokens). Skills are attached starting from most
recently invoked, so older skills can be dropped.

This means:
- Keep SKILL.md under 5,000 tokens for compaction resilience
- Move detailed reference material to `references/` subdirectory
- Critical instructions should be in the first 5,000 tokens

## Data Flow Diagrams

### Plan Skill Flow

```
User invokes /lz-advisor-plan <task>
  |
  v
Skill content loads into executor context (Sonnet 4.6 / session model)
Executor receives instructions for orient -> consult -> produce workflow
  |
  v
[1. ORIENT] Executor reads files, explores codebase
  |          Uses Read, Glob, Grep, Bash
  |          Builds understanding of task scope and current state
  |          This is NOT substantive work -- reading is orientation
  v
[2. CONSULT] Executor spawns lz-advisor agent (Opus 4.6)
  |           Prompt includes: task description + orientation summary
  |           Agent returns: enumerated strategic steps (<100 words)
  |           Agent context destroyed after response
  v
[3. PRODUCE] Executor synthesizes advisor guidance into actionable plan
  |           Writes plan to file or presents to user
  |           Plan format: numbered steps with rationale
  v
Done -- plan available for /lz-advisor-implement
```

### Implement Skill Flow

```
User invokes /lz-advisor-implement <task> [optional plan reference]
  |
  v
Skill content loads into executor context (Sonnet 4.6 / session model)
  |
  v
[1. ORIENT] Executor reads files, understands scope
  |          If plan provided, reads plan file
  |          Gathers codebase context
  v
[2. FIRST CONSULT] Executor spawns lz-advisor agent (Opus 4.6)
  |                 BEFORE any substantive work (writing, editing)
  |                 Prompt: task + orientation findings + proposed approach
  |                 Agent returns: strategic direction (<100 words)
  v
[3. EXECUTE] Executor implements following advisor guidance
  |          Uses all tools: Read, Write, Edit, Bash, Glob, Grep
  |          Iterates toward solution
  |          |
  |          +-- [IF STUCK] Spawn lz-advisor again
  |          |   Prompt: task + what was tried + what failed
  |          |   Agent returns: course correction
  |          |
  |          +-- [IF CHANGING APPROACH] Spawn lz-advisor again
  |              Prompt: task + why approach changed + new direction
  |              Agent returns: validation or alternative
  v
[4. MAKE DURABLE] Executor writes all files, saves results
  |                Must happen BEFORE final consultation
  |                If session ends during advisor call, work persists
  v
[5. FINAL CONSULT] Executor spawns lz-advisor agent (Opus 4.6)
  |                 Prompt: task + what was done + summary of changes
  |                 Agent returns: approval or specific corrections
  v
[6. FINALIZE] If corrections needed, apply them
  |           Present completed work to user
  v
Done
```

### Review Skill Flow

```
User invokes /lz-advisor-review <scope>
  |
  v
Skill runs in forked context with model: opus, effort: high
Opus subagent receives SKILL.md content as its task prompt
  |
  v
[1. GATHER] Opus reads changed files via git diff, git log
  |          Reads relevant source files
  v
[2. ANALYZE] Opus evaluates quality, correctness, best practices
  |           Uses deep reasoning (high effort adaptive thinking)
  v
[3. REPORT] Opus returns structured review
  |          Critical issues, warnings, suggestions
  |          Specific file:line references
  v
Review returned to main conversation
Done
```

## Comparison: Plugin Advisor vs API Advisor Tool

| Aspect | Plugin (this project) | API `advisor_20260301` |
|--------|----------------------|----------------------|
| Context sharing | Manual -- executor must package context into agent prompt | Automatic -- advisor sees full transcript server-side |
| Model control | Agent `model` field + `CLAUDE_CODE_SUBAGENT_MODEL` env var | `model` in tool definition |
| Cost tracking | Via Claude Code's usage display | Separate `iterations[]` in usage response |
| Cost control | `maxTurns: 1` on agent; count calls in skill logic | `max_uses` parameter on tool |
| Streaming | Agent tool blocks until complete | `server_tool_use` pauses stream, resumes after |
| Context persistence | Fresh per agent invocation (no carryover) | `advisor_tool_result` blocks persisted in messages |
| Advisor caching | Not applicable (subagent context is ephemeral) | Advisor-side prompt caching available |
| Effort control | Agent `effort` field | Via `output_config.effort` on executor |
| Platform | Claude Code only | Claude API (any client) |
| Dependencies | Zero (Claude Code Agent tool only) | Anthropic API + beta header |

**Key architectural difference:** The API advisor tool shares full conversation
context automatically. Our plugin advisor requires explicit context packaging. This
means our skill prompts must be more explicit about WHAT context the executor should
pass to the advisor. This is the primary prompt engineering challenge.

## Patterns to Follow

### Pattern 1: Advisor Timing Guidance in Skill Prompt

**What:** Embed Anthropic's suggested timing instructions directly in the skill's
SKILL.md content so the executor knows WHEN to consult the advisor.

**Rationale:** Anthropic's internal coding evaluations found this timing pattern
produced "the highest intelligence at near-Sonnet cost."

**Example (lz-advisor-implement SKILL.md excerpt):**

```markdown
You have access to a `lz-advisor` agent backed by a stronger reviewer model (Opus).
When you invoke it via the Agent tool, pass a clear prompt summarizing the task, your
findings so far, and what you need guidance on. The advisor cannot see your
conversation -- you must provide all relevant context in the prompt.

Call the advisor BEFORE substantive work -- before writing, before committing to an
interpretation, before building on an assumption. If the task requires orientation
first (finding files, fetching a source, seeing what's there), do that, then call
the advisor. Orientation is not substantive work. Writing, editing, and declaring
an answer are.

Also call the advisor:
- When you believe the task is complete. BEFORE this call, make your deliverable
  durable: write the file, save the result. The advisor call takes time; if the
  session ends during it, a durable result persists and an unwritten one does not.
- When stuck -- errors recurring, approach not converging, results that don't fit.
- When considering a change of approach.
```

### Pattern 2: Context Packaging for Agent Invocation

**What:** The skill instructs the executor to package relevant context when spawning
the advisor agent, since the subagent cannot see the parent's conversation history.

**Why:** Unlike the API advisor tool (where the advisor sees the full transcript
automatically), Claude Code subagents start with a fresh context. The executor must
explicitly pass context.

**Example instruction in skill:**

```markdown
When calling the lz-advisor agent, include in your prompt:
1. The original task (quote the user's request)
2. What you found during orientation (key files, patterns, constraints)
3. Your current thinking or proposed approach
4. Any specific decision you need guidance on

Keep the prompt focused. The advisor works best with clear, summarized context -- not
raw file dumps or verbose tool output.
```

### Pattern 3: Advice Weight Instructions

**What:** Tell the executor how to treat the advisor's response.

**From Anthropic's suggested system prompt:**

```markdown
Give the advice serious weight. If you follow a step and it fails empirically, or
you have primary-source evidence that contradicts a specific claim, adapt. A passing
self-test is not evidence the advice is wrong -- it is evidence your test doesn't
check what the advice is checking.

If you've already retrieved data pointing one way and the advisor points another:
don't silently switch. Surface the conflict -- "I found X, you suggest Y" -- and
make a judgment call based on evidence.
```

### Pattern 4: Review Skills as Direct Opus Execution

**What:** Review skills use `context: fork` with `model: opus` to run Opus directly,
bypassing the executor-advisor pattern entirely.

**Why:** Reviews don't need iterative tool use or file editing. They need deep
analysis of completed work. Running Opus directly is simpler and more effective than
having Sonnet ask Opus for a review and then relay it.

**Example (lz-advisor-review SKILL.md frontmatter):**

```yaml
---
name: lz-advisor-review
description: >
  Review completed work for quality, correctness, and best practices.
  Use after implementing code, refactoring, or completing a task.
context: fork
model: opus
effort: high
disable-model-invocation: true
allowed-tools: Read Glob Bash(git diff *) Bash(git log *) Bash(git show *)
---
```

### Pattern 5: Progressive Disclosure for Skills

**What:** Keep SKILL.md lean (<5,000 tokens); move detailed reference material to
`references/` subdirectory.

**When:** All skills. Especially important since skills re-attach after compaction
with a 5,000-token cap per skill and 25,000-token combined budget.

**Why:** SKILL.md content loads every time the skill triggers and persists through
compaction cycles. Large skills waste tokens and risk being truncated after compaction.

**Example structure:**

```
lz-advisor-plan/
|-- SKILL.md                    # Core workflow (<5,000 tokens)
'-- references/
    '-- advisor-timing.md       # Full Anthropic timing guidance (~800 words)
```

### Pattern 6: Skill Description Optimization

**What:** Write skill descriptions with concrete trigger phrases.

**Why:** Claude undertriggers skills -- it doesn't use them when they would be useful
unless the description explicitly matches the user's intent. Front-load key use cases
since descriptions are truncated at 250 characters.

**Example:**

```yaml
description: >
  Plan a task with Opus advisor guidance. Use when asked to plan, strategize,
  think through an approach, or create an implementation plan before coding.
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Advisor Agent with Write/Execute Access

**What:** Giving the advisor agent Write, Edit, or Bash tools.
**Why bad:** The advisor should never take action. Per Anthropic: "The advisor never
calls tools or produces user-facing output, and only provides guidance to the executor."
If it writes files, it becomes an executor, doubling cost and creating confusion about
which model made changes.
**Instead:** `tools: Read, Glob` only. The advisor reads context and returns guidance.

### Anti-Pattern 2: Per-Tool-Call Consultation

**What:** Consulting the advisor before every Read, Write, or Bash tool call.
**Why bad:** Most tool calls are mechanical. Per Anthropic: "On short reactive tasks
where the next action is dictated by tool output you just read, you don't need to
keep calling -- the advisor adds most of its value on the first call, before the
approach crystallizes."
**Instead:** 2-3 strategic consultations per task.

### Anti-Pattern 3: Using `context: fork` for Plan/Implement Skills

**What:** Running the plan or implement skill in a forked subagent context.
**Why bad:** The skill loses access to the main conversation history. The executor
can't use prior context, @-mentioned files, or conversation state. The skill becomes
a one-shot prompt rather than an interactive workflow.
**Instead:** Run plan/implement inline (no `context: fork`). The skill content guides
the executor's behavior within the existing conversation.

### Anti-Pattern 4: Overriding Executor Effort in Skill

**What:** Setting `effort: medium` or any explicit effort in the plan/implement skill.
**Why bad:** Overrides the user's session effort choice without their knowledge.
Users set effort intentionally via `/effort` command. The skill should work well at
any effort level.
**Instead:** Omit the `effort` field from inline skills. Only set effort on forked
review skills where Opus runs directly.

### Anti-Pattern 5: Dumping Raw Context into Agent Prompt

**What:** Dumping the entire orientation output or raw file contents into the advisor
agent prompt.
**Why bad:** Wastes Opus input tokens (billed at $15/MTok). Buries the signal in
noise. The advisor's value comes from strategic thinking on focused input.
**Instead:** Have the executor summarize context: task, key findings, current state,
specific question.

### Anti-Pattern 6: Advisor Returning Long Explanations

**What:** Letting the advisor return verbose explanations, background context, or
code blocks.
**Why bad:** Advisor output tokens are billed at Opus rates ($75/MTok output). Long
output wastes the cost advantage the pattern is designed to provide.
**Instead:** Agent system prompt enforces "under 100 words, enumerated steps, not
explanations."

## Plugin Component Specifications

### Agent Definition: `agents/lz-advisor.md`

```yaml
---
name: lz-advisor
description: >
  Strategic advisor backed by Opus. Provides concise guidance in under 100 words
  using enumerated steps. Use before starting substantive work, when stuck, when
  changing approach, and when declaring work complete.
model: opus
effort: high
tools: Read, Glob
maxTurns: 1
---

You are a strategic coding advisor. Your role is to provide concise, actionable
guidance to help the executor model make better decisions.

## Output Format

Respond in under 100 words. Use enumerated steps, not explanations.

[Full advisor system prompt continues...]
```

Key configuration rationale:
- `model: opus` -- ensures advisor always runs on Opus regardless of session model
- `effort: high` -- deep thinking for strategic guidance (overrides session effort)
- `tools: Read, Glob` -- read-only access for context gathering; no write tools
- `maxTurns: 1` -- advisor responds in a single turn; no multi-turn exploration

### Skill Definition: `skills/lz-advisor-plan/SKILL.md`

```yaml
---
name: lz-advisor-plan
description: >
  Plan a task with Opus advisor guidance. Use when asked to plan, strategize,
  think through an approach, or create an implementation plan before coding.
disable-model-invocation: true
allowed-tools: Read Glob Bash(git *) Agent(lz-advisor)
---

[Skill instructions: orient -> consult -> produce plan]
```

Key configuration rationale:
- No `model` field -- inherits session model (optimized for Sonnet 4.6, works with any)
- No `effort` field -- inherits session effort (respects user's choice)
- No `context: fork` -- runs inline to access conversation context
- `disable-model-invocation: true` -- user-triggered only (cost control)
- `allowed-tools` includes `Agent(lz-advisor)` -- pre-approves advisor spawning

### Skill Definition: `skills/lz-advisor-implement/SKILL.md`

```yaml
---
name: lz-advisor-implement
description: >
  Implement a task with Opus advisor guidance. Sonnet orients, consults Opus before
  substantive work, executes the implementation, then consults Opus for final review.
  Use for any coding task where strategic guidance improves the outcome.
disable-model-invocation: true
allowed-tools: Read Write Edit Glob Bash Agent(lz-advisor)
---

[Skill instructions: orient -> first consult -> execute -> final consult]
```

Key configuration rationale:
- Full tool access for implementation work
- `Agent(lz-advisor)` pre-approved for seamless advisor consultation

### Skill Definition: `skills/lz-advisor-review/SKILL.md`

```yaml
---
name: lz-advisor-review
description: >
  Review completed work for quality. Opus directly analyzes code changes,
  architecture decisions, and implementation quality.
context: fork
model: opus
effort: high
disable-model-invocation: true
allowed-tools: Read Glob Bash(git diff *) Bash(git log *) Bash(git show *)
---

[Review instructions: gather changes, analyze quality, report findings]
```

Key configuration rationale:
- `context: fork` + `model: opus` -- runs as Opus directly, no advisor loop
- `effort: high` -- deep analysis of completed work
- Read-only tools + git commands only -- review should not modify code
- No `agent` field -- runs as standalone forked subagent

## Scalability Considerations

| Concern | At v1 (single user) | At scale (team adoption) |
|---------|---------------------|------------------------|
| Context usage | Skill content loads once (~2-5KB). After compaction, first 5K tokens re-attached | Multiple skills share 25K combined budget after compaction. Keep skills lean |
| Advisor cost | 2-3 Opus calls per task (~$0.05-0.15 at current rates) | Teams may want per-project consultation budget. Future: plugin settings |
| Advisor latency | ~5-15s per consultation (Opus inference time) | Acceptable for strategic consultations. Not suitable for per-tool-call use |
| Subagent context | Fresh per invocation (no carryover between calls) | No context accumulation risk. Each consultation is independent |
| Plugin installation | Single plugin install via marketplace | All team members get consistent advisor behavior |

## Build Order (Dependencies)

1. **Agent definition first** (`agents/lz-advisor.md`)
   - No dependencies. The advisor persona, model, effort, tools, and system prompt.
   - Must exist before any skill can reference `Agent(lz-advisor)`.

2. **Plan skill second** (`skills/lz-advisor-plan/`)
   - Depends on: agent definition
   - Simplest orchestration pattern (orient -> consult -> produce)
   - Good testbed for tuning advisor prompt and context packaging

3. **Implement skill third** (`skills/lz-advisor-implement/`)
   - Depends on: agent definition, learnings from plan skill
   - Most complex orchestration (multi-phase with conditional consultations)
   - May reference plans produced by the plan skill

4. **Review skills last** (`skills/lz-advisor-review/`, `skills/lz-advisor-security-review/`)
   - No dependency on agent definition (runs Opus directly via `context: fork`)
   - Can be built in parallel with each other
   - Simpler pattern (forked Opus execution, no advisor loop)

5. **Plugin metadata** (`plugin.json`)
   - Can be created at any point but finalized after all components exist

**Rationale:** The agent definition is the foundation -- all executor-advisor skills
depend on it. The plan skill is simpler than implement and lets us iterate on the
advisor prompt before tackling the more complex implement flow. Review skills are
independent and can be built in parallel. They don't use the agent at all -- they
run Opus directly.

## Sources

- [What's new in Claude 4.6](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-6) -- Official Anthropic docs (HIGH)
- [Effort parameter](https://platform.claude.com/docs/en/build-with-claude/effort) -- Official Anthropic docs (HIGH)
- [Advisor tool docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) -- Official Anthropic docs (HIGH)
- [The advisor strategy blog post](https://claude.com/blog/the-advisor-strategy) -- Official Anthropic blog (HIGH)
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents) -- Official Claude Code docs (HIGH)
- [Claude Code skills](https://code.claude.com/docs/en/skills) -- Official Claude Code docs (HIGH)
- [Create plugins](https://code.claude.com/docs/en/plugins) -- Official Claude Code docs (HIGH)
- [Introducing Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6) -- Official Anthropic announcement (HIGH)
- [Claude Sonnet 4.6 complete guide](https://www.nxcode.io/resources/news/claude-sonnet-4-6-complete-guide-benchmarks-pricing-2026) -- Third-party compilation (MEDIUM)
- [Anthropic releases Claude Opus 4.6](https://www.marktechpost.com/2026/02/05/anthropic-releases-claude-opus-4-6-with-1m-context-agentic-coding-adaptive-reasoning-controls-and-expanded-safety-tooling-capabilities/) -- Third-party reporting (MEDIUM)
