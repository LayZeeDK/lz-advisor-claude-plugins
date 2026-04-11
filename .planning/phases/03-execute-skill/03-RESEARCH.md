# Phase 3: Execute Skill - Research

**Researched:** 2026-04-11
**Domain:** Claude Code plugin skill authoring -- executor-advisor loop orchestration
**Confidence:** HIGH

## Summary

Phase 3 creates the most complex skill in the lz-advisor plugin: `lz-advisor-execute`. Unlike the plan skill (one advisor consultation), the execute skill orchestrates a full coding loop with up to 4 strategic Opus consultations -- before work, when stuck, when changing approach, and before declaring done. The primary engineering challenge is instructing the Sonnet executor to package sufficient context into each advisor call (since Claude Code subagents start fresh -- no transcript sharing).

All architectural foundations are proven. The advisor agent (`agents/advisor.md`) works correctly, the skill format is validated by Phase 2, and the `@references/` include mechanism is tested. Phase 3 adds: (1) the execute skill SKILL.md itself, (2) moving `advisor-timing.md` to a shared plugin-root `references/` directory per D-05, (3) updating the plan skill's output location to `plans/<task-slug>.plan.md` per D-02, and (4) ensuring the execute skill can consume plan files mentioned via `@`.

**Primary recommendation:** Model the execute skill on the plan skill's structure (XML-sectioned phases, imperative form, `allowed-tools` with `Agent(lz-advisor:advisor)`) but extend from 3 phases to 6 phases: orient, first-consult, execute, [conditional consults], make-durable, final-consult. Keep the SKILL.md under 5,000 tokens by leveraging the shared `advisor-timing.md` reference for timing/weight/packaging details.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** User-mention only via `@` file reference. The user explicitly passes a plan file (e.g., `/lz-advisor.execute @plans/add-favicon.plan.md`). No auto-detection of plan files. When no plan is mentioned, the executor orients from scratch (same as plan skill's orient phase). This keeps the interface explicit and avoids false positives from stray plan files.
- **D-02:** Update the plan skill (`skills/lz-advisor-plan/SKILL.md`) to write plans to `plans/<task-slug>.plan.md` instead of `plan-<task-slug>.md` in the project root. Keeps the repo root clean and aligns with the user's global convention for plan file locations.
- **D-03:** Git commit before the final advisor call. The executor writes all files AND commits them (staging specific files by name, never `git add .` or `git add -A`) before the final "before declaring done" advisor consultation. This matches the advisor-timing.md guidance: "make your deliverable durable: write the file, save the result, commit the change." The commit survives session interruptions during the final Opus call.
- **D-04:** All 4 consultation moments described, executor judges which apply per task. Matches the API advisor tool pattern exactly -- the suggested system prompt describes all 4 moments (before substantive work, when stuck, when changing approach, before declaring done) and the executor decides which are relevant. No mandatory/conditional distinction. The advisor-timing.md reference file already carries this guidance; the SKILL.md reinforces it in the workflow structure.
- **D-05:** Shared `references/` directory at plugin root. Move `advisor-timing.md` from `skills/lz-advisor-plan/references/` to `references/advisor-timing.md` at the plugin root. All skills (plan, execute, review, security-review) reference this single copy. Non-standard relative to official plugin conventions (which use per-skill `references/`), but DRY for a file shared by all 4 skills. Implementation note: the `@references/` include syntax resolves relative to the skill directory -- the planner must determine the correct include path (e.g., `@../../references/advisor-timing.md` or Read tool with `${CLAUDE_PLUGIN_ROOT}/references/`).

### Claude's Discretion
- Exact workflow structure and section ordering in the SKILL.md -- must cover the complete executor-advisor loop (orient, consult, work, consult-done) but section naming and XML tag structure are flexible.
- How the skill prompt instructs the executor to detect "stuck" and "approach change" moments -- the guidance from advisor-timing.md provides the framework, but exact phrasing is the planner's choice.
- Reconciliation pattern phrasing -- must instruct executor to surface conflicts in one more advisor call (per IMPL-08), but exact wording and placement in the skill prompt are flexible.
- How the executor summarizes context for each advisor consultation -- must be self-contained summaries (advisor has no transcript access), but the level of prescription in the skill prompt is flexible.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IMPL-01 | Skill instructs executor to consult advisor before substantive work (after orientation) | Anthropic timing guidance verified: "Call advisor BEFORE substantive work -- before writing, before committing to an interpretation." SKILL.md must have explicit first-consult phase after orient. |
| IMPL-02 | Skill instructs executor to consult advisor when stuck (errors recurring, approach not converging) | Anthropic timing guidance: "When stuck -- errors recurring, approach not converging, results that don't fit." Conditional consultation in execute phase. |
| IMPL-03 | Skill instructs executor to consult advisor when considering a change of approach | Anthropic timing guidance: "When considering a change of approach." Conditional consultation in execute phase. |
| IMPL-04 | Skill instructs executor to consult advisor before declaring done (after making deliverable durable) | Anthropic timing guidance + D-03: commit first, then final advisor call. SKILL.md must have make-durable phase before final-consult phase. |
| IMPL-05 | Skill accepts optional plan file input (from `/lz-advisor.plan` or other sources) | D-01: user mentions plan via `@` file reference. Orient phase checks for mentioned plan file and uses it to guide orientation. |
| IMPL-06 | Skill instructs executor to make deliverable durable (write files, commit) before final advisor call | D-03: explicit make-durable phase with git commit (specific files, never `git add .`). |
| IMPL-07 | Skill instructs executor to give advice serious weight but adapt if empirical evidence contradicts | Anthropic advice-weight text from advisor-timing.md: "Give the advice serious weight. If you follow a step and it fails empirically...adapt." |
| IMPL-08 | Skill implements reconciliation pattern: when executor findings conflict with advisor, surface conflict in one more advisor call | Anthropic reconciliation text from advisor-timing.md: "Surface the conflict in one more advisor call -- 'I found X, you suggest Y, which constraint breaks the tie?'" |
| IMPL-09 | Skill instructs executor to package relevant context at each advisor consultation point | Subagent context isolation requires explicit packaging. advisor-timing.md "What to Include" section lists: task, findings, current state, specific question. |
| IMPL-10 | Skill inherits session model for executor (no model override) | No `model` or `effort` field in skill frontmatter. Verified pattern from Phase 2 plan skill. |
</phase_requirements>

## Standard Stack

### Core Components

| Component | Format | Purpose | Why Standard |
|-----------|--------|---------|--------------|
| SKILL.md | Markdown + YAML frontmatter | Execute skill definition | Claude Code's native skill format; Phase 2 validates the pattern [VERIFIED: existing plan skill] |
| advisor.md | Markdown + YAML frontmatter | Opus advisor agent (existing) | Already created in Phase 1; model: opus, maxTurns: 1, effort: high [VERIFIED: agents/advisor.md] |
| advisor-timing.md | Markdown reference | Shared timing/weight/packaging guidance | Already created in Phase 1; moving to plugin root per D-05 [VERIFIED: skills/lz-advisor-plan/references/advisor-timing.md] |

### Supporting

| Component | Format | Purpose | When to Use |
|-----------|--------|---------|-------------|
| `plans/` directory | Convention | Plan file output location | D-02 changes plan skill output from `plan-<slug>.md` to `plans/<slug>.plan.md` |

### No External Dependencies

Zero npm packages, no build steps, no runtime dependencies. The "stack" is entirely Claude Code's native plugin system. [VERIFIED: project CLAUDE.md]

## Architecture Patterns

### Recommended Project Structure (After Phase 3)

```
lz-advisor/
|-- .claude-plugin/
|   '-- plugin.json
|-- agents/
|   '-- advisor.md                        # Opus advisor (Phase 1, unchanged)
|-- references/
|   '-- advisor-timing.md                 # Shared reference (moved per D-05)
|-- skills/
|   |-- lz-advisor-plan/
|   |   '-- SKILL.md                      # Plan skill (updated per D-02)
|   '-- lz-advisor-execute/
|       '-- SKILL.md                      # Execute skill (Phase 3, new)
|-- plans/                                # Plan output directory (D-02)
|-- LICENSE
'-- README.md
```

### Pattern 1: Multi-Phase Executor-Advisor Loop

**What:** The execute skill defines 6 phases in the SKILL.md body, each as an XML-tagged section. The executor follows them sequentially, with conditional advisor consultations in the middle phases. [VERIFIED: plan skill uses this XML section pattern; Anthropic's timing guidance validated it]

**When to use:** Any skill that needs the executor to drive work with strategic advisor consultations.

**Structure:**

```
<orient>     -- Read files, understand scope, check for plan input
<consult>    -- First advisor call: before substantive work
<execute>    -- Do the actual coding work (with conditional advisor calls)
<durable>    -- Write files, commit changes (specific files, never git add .)
<final>      -- Final advisor call: before declaring done
<complete>   -- Apply corrections if any, present to user
```

**Key constraint:** The execute phase contains embedded instructions for two conditional consultation types (stuck, approach-change) that the executor judges per-task. These are not separate phases -- they are decision points within the execute phase. [CITED: advisor-tool.md lines 580-598]

### Pattern 2: Context Packaging for Subagent Invocation

**What:** Each advisor call requires the executor to package a self-contained summary because Claude Code subagents start with fresh context -- no transcript sharing. [VERIFIED: ARCHITECTURE.md subagent context isolation section]

**Per-consultation context template:**

1. The original task (quote user's request or goal)
2. Key findings from orientation (files, patterns, constraints)
3. Current state of work (what has been done, what remains) -- varies by consultation point
4. The specific decision or question needing guidance

**Adapts by consultation type:**

- First consult (before work): task + orientation findings + proposed approach
- Stuck consult: task + what was tried + what failed + error details
- Approach-change consult: task + current approach + why changing + proposed new direction
- Final consult: task + summary of changes + what was committed + test results

[CITED: advisor-timing.md "What to Include in the Advisor Prompt" section]

### Pattern 3: Reconciliation Pattern (IMPL-08)

**What:** When executor findings conflict with advisor guidance, the executor surfaces the conflict in one more advisor call rather than silently ignoring advice. [CITED: advisor-tool.md lines 596-598]

**Exact Anthropic wording (proven in benchmarks):**

> If you've already retrieved data pointing one way and the advisor points another: don't silently switch. Surface the conflict in one more advisor call -- "I found X, you suggest Y, which constraint breaks the tie?"

**Implementation in SKILL.md:** Include this as part of the execute phase's conditional consultation instructions. The reconciliation call is a specific type of "stuck" consultation where the conflict is evidence-based, not a general "help me" call.

### Pattern 4: Plan File Consumption (IMPL-05)

**What:** The execute skill checks if the user mentioned a plan file via `@`. If present, the plan file augments the orientation phase -- the executor reads it and uses it as a starting point instead of orienting from scratch. [VERIFIED: D-01 in CONTEXT.md]

**Implementation:** The orient phase includes conditional logic: "If a plan file was mentioned by the user (via @ file reference), read it and use its Strategic Direction and Steps as the foundation for the task. Orient by verifying the plan's assumptions against the current codebase state. If no plan was mentioned, orient from scratch."

### Pattern 5: Reference File Include Path (D-05)

**What:** After moving `advisor-timing.md` to the plugin root `references/` directory, skills need an include path that works across different skill directories.

**Recommended approach:** Use `@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md` in skill bodies. The `${CLAUDE_PLUGIN_ROOT}` variable resolves to the plugin's absolute installation path, making the include portable regardless of skill directory depth. [CITED: plugin-dev command-development SKILL.md documents `@${CLAUDE_PLUGIN_ROOT}/` syntax for file references]

**Fallback if `@${CLAUDE_PLUGIN_ROOT}` does not resolve in skill bodies:** The skill can instruct the executor to use the Read tool: "Read the advisor timing guidance from `${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md`." This is less elegant but guaranteed to work since it uses the Read tool directly. [ASSUMED]

**Risk assessment:** The `@${CLAUDE_PLUGIN_ROOT}` syntax is documented for commands but not explicitly for skills. Commands and skills share the same Markdown loading mechanism, so it likely works, but this has not been empirically tested in this project. The planner should implement with `@${CLAUDE_PLUGIN_ROOT}` first and fall back to the Read tool instruction if it does not resolve.

### Anti-Patterns to Avoid

- **Per-tool-call consultation:** Consulting the advisor before every Read, Write, or Bash call. The advisor adds value at strategic moments (2-3 per task), not on mechanical operations. [CITED: advisor-tool.md "On short reactive tasks where the next action is dictated by tool output you just read, you don't need to keep calling"]
- **Raw context dumps:** Pasting entire file contents into the advisor prompt. Wastes Opus input tokens ($15/MTok). Summarize findings instead. [VERIFIED: ARCHITECTURE.md anti-pattern #5]
- **Advisor with write tools:** The advisor must never write files -- it provides guidance only. `tools: ["Read", "Glob"]` enforced in agent definition. [VERIFIED: agents/advisor.md]
- **Overriding executor effort:** Do not set `effort` in skill frontmatter. Respect user's session effort level. [VERIFIED: ARCHITECTURE.md anti-pattern #4]
- **Using `context: fork`:** Execute skill must run inline (no `context: fork`) to access the main conversation history and user's mentioned files. [VERIFIED: ARCHITECTURE.md anti-pattern #3]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Advisor timing logic | Custom consultation triggers | Anthropic's exact timing text in SKILL.md | Their wording was validated through SWE-bench benchmarks; changing it risks degrading performance [CITED: advisor-tool.md lines 576-598] |
| Advice weight instructions | Custom "how to treat advice" text | Anthropic's exact advice-weight text | Same benchmark validation. "A passing self-test is not evidence the advice is wrong" is a tested insight [CITED: advisor-tool.md lines 594-598] |
| Conciseness constraint | Per-skill conciseness instructions | Agent-level "under 100 words, enumerated steps" | Already in advisor.md system prompt. Cut output tokens 35-45% in Anthropic testing [CITED: advisor-tool.md lines 601-609] |
| Context packaging guidance | Custom instructions per skill | Shared advisor-timing.md reference | Already written and tested in Phase 1/2. Moving to shared location per D-05 [VERIFIED: advisor-timing.md] |

## Common Pitfalls

### Pitfall 1: SKILL.md Exceeds Compaction Budget

**What goes wrong:** Skill body exceeds 5,000 tokens and gets truncated after context compaction, losing critical instructions.
**Why it happens:** The execute skill is the most complex (6 phases vs plan's 3). Natural tendency to include verbose instructions for each consultation type.
**How to avoid:** Keep SKILL.md under 5,000 tokens (~2,000 words). Move timing/weight/packaging details to `advisor-timing.md` reference file. Only include phase workflow structure and consultation-specific context packaging templates in SKILL.md.
**Warning signs:** Word count exceeding 2,500 words in the skill body.
[CITED: ARCHITECTURE.md compaction behavior section; skill-development SKILL.md progressive disclosure guidelines]

### Pitfall 2: Executor Forgets Context Packaging

**What goes wrong:** Executor calls the advisor agent with a vague prompt like "What should I do next?" without packaging the task, findings, and specific question.
**Why it happens:** The Claude Code subagent starts fresh -- no transcript sharing. Unlike the API advisor tool where context is automatic, our pattern requires explicit packaging.
**How to avoid:** Include concrete context packaging instructions at each consultation point in the SKILL.md. Use numbered lists of what to include. The advisor-timing.md reference reinforces this.
**Warning signs:** Advisor returns generic advice not specific to the task.
[VERIFIED: ARCHITECTURE.md "What Subagents See (and Don't See)" section]

### Pitfall 3: No Durability Before Final Advisor Call

**What goes wrong:** Executor calls the final advisor before committing. Session ends during Opus inference (5-15s). Work is lost.
**Why it happens:** Natural temptation to get advisor approval before committing.
**How to avoid:** D-03 locks the order: write files, commit (specific files by name), THEN final advisor call. The SKILL.md must make this sequence explicit.
**Warning signs:** Final advisor call appears before any git commit instructions in the skill workflow.
[CITED: advisor-tool.md "make your deliverable durable: write the file, save the result, commit the change"]

### Pitfall 4: Aggressive Language Triggers Opus Overtriggering

**What goes wrong:** Using "MUST", "CRITICAL", "ALWAYS" in the skill prompt causes Opus 4.6 to overtrigger or over-comply.
**Why it happens:** Opus 4.6 is more sensitive to system prompt language than previous models.
**How to avoid:** Use calm, direct language throughout the skill. "Call the advisor before substantive work" not "You MUST ALWAYS call the advisor before ANY substantive work." This applies to the SKILL.md body (which instructs the Sonnet executor) and indirectly to the advisor prompt (which Opus reads).
**Warning signs:** Executor calling advisor unnecessarily for trivial operations.
[CITED: MODEL-OPTIMIZATION-OPUS.md Optimization 3: System Prompt Sensitivity]

### Pitfall 5: Plan File Path Mismatch After D-02

**What goes wrong:** Execute skill looks for plan files in the old location (`plan-<slug>.md` in project root) while plan skill writes to the new location (`plans/<slug>.plan.md`).
**Why it happens:** D-02 changes the plan skill output location. The execute skill must expect files at the new location.
**How to avoid:** The execute skill's orient phase instructions should reference `plans/` directory. The `@` file mention mechanism is user-driven (user types `@plans/add-auth.plan.md`), so the skill itself doesn't hardcode paths.
**Warning signs:** Execute skill instructions mention the old path format.

### Pitfall 6: Second-Person Writing Style

**What goes wrong:** SKILL.md body uses "You should..." or "You need to..." instead of imperative form.
**Why it happens:** Natural tendency when writing instructions.
**How to avoid:** Use imperative/infinitive form throughout: "Explore the codebase" not "You should explore the codebase." This is a hard requirement from skill-development guidelines.
**Warning signs:** "You" appearing in the skill body.
[CITED: plugin-dev skill-development SKILL.md writing style requirements]

## Code Examples

### Execute Skill Frontmatter

```yaml
---
name: lz-advisor-execute
description: >
  This skill should be used when the user asks to "implement this task",
  "execute this plan", "build this feature", "code this up",
  "lz-advisor execute", or needs to implement a coding task with
  strategic Opus advisor guidance at high-leverage moments.
  Pairs Sonnet execution with Opus strategic consultation for
  near-Opus intelligence at Sonnet cost.
version: 0.1.0
allowed-tools: Agent(lz-advisor:advisor)
---
```

Source: Derived from plan skill frontmatter pattern + ARCHITECTURE.md execute skill spec. [VERIFIED: plan skill SKILL.md frontmatter]

Note: `allowed-tools` only lists `Agent(lz-advisor:advisor)` -- all standard tools (Read, Write, Edit, Glob, Bash) are available by default. The `allowed-tools` field pre-approves the agent invocation so it does not require user confirmation. [VERIFIED: plan skill uses same pattern]

### Advisor Invocation Context Template (First Consult)

```markdown
When calling the lz-advisor:advisor agent via the Agent tool, include
a prompt structured as follows:

Task: <quote the user's original request>

Orientation findings:
- <key files examined and what they contain>
- <patterns, constraints, and integration points discovered>
- <current state of the codebase relevant to the task>

Question: Given these findings, what approach and sequence of
steps do you recommend? What should I watch out for?
```

Source: Adapted from advisor-timing.md packaging guidance + plan skill's consult phase. [VERIFIED: advisor-timing.md; plan skill SKILL.md consult section]

### Advisor Invocation Context Template (Final Consult)

```markdown
Task: <quote the user's original request>

Work completed:
- <summary of changes made, files written/modified>
- <test results if applicable>
- <commit hash/message>

Question: Review the approach taken. Are there concerns,
missed edge cases, or improvements to flag before declaring done?
```

Source: Derived from Anthropic's final-call timing guidance. [CITED: advisor-tool.md lines 585-588]

### Plan Skill Output Path Update (D-02)

Current plan skill SKILL.md line 65:
```markdown
Write to: `plan-<task-slug>.md` in the project root directory.
```

Updated to:
```markdown
Write to: `plans/<task-slug>.plan.md`
Use a short kebab-case slug derived from the task description.
Create the `plans/` directory if it does not exist.
Example: for "add user authentication", write `plans/add-user-auth.plan.md`.
```

Source: D-02 from CONTEXT.md. [VERIFIED: 03-CONTEXT.md D-02]

### Reference File Include (D-05)

In each SKILL.md body, include the shared reference:

```markdown
@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md
```

Or, if `${CLAUDE_PLUGIN_ROOT}` does not resolve in skill bodies, instruct the executor:

```markdown
For detailed guidance on advisor timing, advice weight, and context
packaging, read the reference file at
`${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md` using the Read tool.
```

Source: D-05 from CONTEXT.md + plugin-dev command-development SKILL.md. [VERIFIED: 03-CONTEXT.md D-05; ASSUMED: ${CLAUDE_PLUGIN_ROOT} resolution in skills]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API advisor_20260301 tool | Plugin Agent tool with model: opus | Project decision (D-06 from requirements) | Plugin approach requires explicit context packaging; API approach shares transcript automatically |
| Per-skill references/ | Shared plugin-root references/ | D-05 (Phase 3) | DRY for advisor-timing.md shared by all skills |
| Plan files in project root | Plan files in plans/ directory | D-02 (Phase 3) | Cleaner repo root; aligns with user's global plan file convention |

## Assumptions Log

> List all claims tagged [ASSUMED] in this research. The planner and discuss-phase use this
> section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md` syntax resolves correctly in SKILL.md bodies (not just commands) | Pattern 5: Reference File Include Path | Include fails silently; skill loses timing/weight/packaging guidance. Fallback: use Read tool instruction or relative path `@../../references/advisor-timing.md` |
| A2 | Read tool fallback instruction in SKILL.md will cause executor to explicitly read the reference file before proceeding | Pattern 5: Reference File Include Path | Executor may skip reading the reference, reducing consultation quality. Low risk -- Sonnet follows literal instructions |

**If this table is empty:** All claims in this research were verified or cited -- no user confirmation needed.

## Open Questions

1. **`@${CLAUDE_PLUGIN_ROOT}` in skill bodies**
   - What we know: Plugin-dev documents this syntax for commands. Commands and skills share the same Markdown loading mechanism. The plan skill successfully uses `@references/advisor-timing.md` (relative to skill directory).
   - What's unclear: Whether `${CLAUDE_PLUGIN_ROOT}` is expanded when the `@` include appears in a SKILL.md body (as opposed to a command .md body).
   - Recommendation: Implement with `@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md` first. If it doesn't resolve, fall back to instructing the executor to read the file via Read tool. Test during Phase 3 execution.

2. **Execute skill word count budget**
   - What we know: SKILL.md must stay under 5,000 tokens (~2,000 words) for compaction resilience. The execute skill has 6 phases (vs plan's 3).
   - What's unclear: Whether all 6 phases plus context packaging templates fit within the budget.
   - Recommendation: Keep phase descriptions terse (3-5 bullet points each). Rely on advisor-timing.md for timing/weight/packaging details. Defer description optimization to Phase 5 (INFRA-04).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | claude -p (CLI non-interactive invocation) |
| Config file | none -- uses --plugin-dir flag |
| Quick run command | `claude --model sonnet --effort medium --plugin-dir . -p "/lz-advisor.execute <task>"` |
| Full suite command | Manual test of all 4 consultation types across different task complexities |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IMPL-01 | Executor consults advisor before substantive work | smoke | `claude --model sonnet --effort medium --plugin-dir . -p "/lz-advisor.execute implement a simple hello world script" --verbose` | N/A (prompt-based) |
| IMPL-02 | Executor consults advisor when stuck | manual-only | Requires inducing a stuck state; cannot script reliably | N/A |
| IMPL-03 | Executor consults advisor on approach change | manual-only | Requires a task complex enough to trigger approach reconsideration | N/A |
| IMPL-04 | Executor consults advisor before declaring done (after commit) | smoke | Same as IMPL-01 -- verify commit happens before final Agent call in output | N/A |
| IMPL-05 | Skill accepts plan file input | smoke | Create a test plan file, then `claude --model sonnet --effort medium --plugin-dir . -p "/lz-advisor.execute @plans/test.plan.md implement the plan"` | N/A |
| IMPL-06 | Executor makes deliverable durable before final call | smoke | Same as IMPL-04 -- verify commit before final advisor call | N/A |
| IMPL-07 | Executor gives advice serious weight | manual-only | Requires observing executor behavior when advice conflicts with evidence | N/A |
| IMPL-08 | Reconciliation pattern surfaces conflicts | manual-only | Requires a scenario where executor evidence contradicts advisor guidance | N/A |
| IMPL-09 | Executor packages context at each consultation | smoke | Verify Agent tool prompts in verbose output contain task + findings + question | N/A |
| IMPL-10 | Skill inherits session model (no model override) | unit | `git grep "^model:" skills/lz-advisor-execute/SKILL.md` returns exit 1 | Wave 0 |

### Sampling Rate

- **Per task commit:** `git grep "^model:" skills/lz-advisor-execute/SKILL.md` (returns exit 1 = pass)
- **Per wave merge:** Smoke test with `claude --plugin-dir . -p "/lz-advisor.execute ..."` 
- **Phase gate:** All smoke tests pass + structural verification before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `skills/lz-advisor-execute/SKILL.md` -- the primary deliverable (does not exist yet)
- [ ] `references/advisor-timing.md` -- shared reference at plugin root (exists at skill level, needs move)
- [ ] `plans/` directory -- plan output convention (does not exist yet)

## Project Constraints (from CLAUDE.md)

The following CLAUDE.md directives are directly relevant to Phase 3 implementation:

- **No `git add .` or `git add -A`**: D-03 requires commit before final advisor call. The SKILL.md must explicitly instruct "stage specific files by name, never git add . or git add -A." This matches the user's global CLAUDE.md rule.
- **No aggressive language**: Opus sensitivity + user's global rule. SKILL.md and all advisor prompts use calm, direct language.
- **Prefer `git mv` for renames**: D-05 moves advisor-timing.md. Use `git mv` for the file move.
- **No AI attribution in commits**: The SKILL.md should not instruct the executor to add Co-Authored-By trailers.
- **Skill verification with `claude -p`**: Phase 2 established the pattern for automated UAT. Use `/lz-advisor.execute <task>` syntax (not natural-language triggers) for reliable skill activation.
- **Plan file location convention**: CLAUDE.md specifies plans go to `plans/<descriptive-name>.plan.md`. D-02 aligns the plan skill with this convention.

## Sources

### Primary (HIGH confidence)
- `research/anthropic/docs/advisor-tool.md` -- API advisor tool reference; timing guidance lines 580-598; advice weight lines 594-598; trimming instruction lines 601-609
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Strategy rationale, benchmark results
- `.planning/research/ARCHITECTURE.md` -- Execute skill flow diagram, subagent context isolation, anti-patterns, compaction behavior
- `.planning/research/STACK.md` -- Skill file format, frontmatter fields, directory structure
- `agents/advisor.md` -- Existing advisor agent definition (Phase 1 output)
- `skills/lz-advisor-plan/SKILL.md` -- Existing plan skill (Phase 2 output, template for execute skill)
- `skills/lz-advisor-plan/references/advisor-timing.md` -- Timing/weight/packaging reference (Phase 1 output)
- `research/prompt-engineering/MODEL-OPTIMIZATION-SONNET.md` -- Sonnet literal instruction following, structured XML
- `research/prompt-engineering/MODEL-OPTIMIZATION-OPUS.md` -- Opus system prompt sensitivity
- Plugin-dev `skills/skill-development/SKILL.md` -- Skill writing style, progressive disclosure, third-person descriptions
- Plugin-dev `skills/command-development/SKILL.md` -- `@${CLAUDE_PLUGIN_ROOT}` syntax documentation

### Secondary (MEDIUM confidence)
- Plugin-dev `skills/command-development/SKILL.md` `@${CLAUDE_PLUGIN_ROOT}` examples -- verified in command context but applied to skill context by inference

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all components verified from existing Phase 1/2 outputs and CLAUDE.md
- Architecture: HIGH -- patterns directly derived from Anthropic's tested timing guidance and validated plan skill structure
- Pitfalls: HIGH -- all identified from verified sources (compaction limits, subagent isolation, Opus sensitivity)
- Reference include path: MEDIUM -- `@${CLAUDE_PLUGIN_ROOT}` documented for commands but not explicitly for skills

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (30 days -- stable domain, no fast-moving dependencies)
