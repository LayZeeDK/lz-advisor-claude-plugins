# Domain Pitfalls

**Domain:** Claude Code marketplace plugin implementing the advisor strategy (multi-model Opus/Sonnet orchestration)
**Researched:** 2026-04-10

## Critical Pitfalls

Mistakes that cause rewrites, cost explosions, or fundamental architectural failures.

### Pitfall 1: Aggressive Prompt Language Causing Overtriggering

**What goes wrong:** Using "MUST", "CRITICAL", "ALWAYS", or "If in doubt, use [tool]" in skill prompts causes Opus 4.6 and Sonnet 4.6 to overtrigger -- invoking tools, skills, and advisor consultations far more often than intended. This was a known issue with Opus 4.5 and is confirmed still relevant for 4.6 models by Anthropic's official documentation.

**Why it happens:** Opus 4.5 and 4.6 are significantly more responsive to system prompt instructions than previous models. Prompts designed to reduce undertriggering on older models now cause overtriggering. Anthropic's official docs state: "Where you might have said 'CRITICAL: You MUST use this tool when...', you can use more normal prompting like 'Use this tool when...'"

**Consequences:**
- Advisor agent called on every turn instead of 2-3 strategic moments, causing cost explosion (Opus tokens are expensive)
- Skills triggering when not relevant, polluting the conversation context
- Executor ignoring its own judgment and deferring to advisor for trivial decisions

**Prevention:**
- Use calm, natural language in all skill and agent prompts: "Use this when..." not "CRITICAL: You MUST use this when..."
- Remove all "if in doubt" fallback language -- 4.6 models trigger appropriately without it
- Replace blanket defaults with targeted instructions: "Use the advisor when it would improve your architectural decisions" not "Default to calling the advisor"
- Test with both Sonnet 4.6 and Opus 4.6 as executor to verify triggering behavior
- Dial back any anti-laziness prompting from older prompt patterns

**Detection:** Monitor advisor call frequency during testing. If advisor is called more than 3 times per typical task, prompt language is too aggressive.

**Phase relevance:** Phase 1 (core agent + skills). Get prompt tone right from the start -- every subsequent skill inherits this calibration.

**Confidence:** HIGH (Anthropic official docs: platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

---

### Pitfall 2: Advisor Called Too Late (Approach Already Crystallized)

**What goes wrong:** The executor completes substantive work (writes files, commits to an approach) before consulting the advisor. By this point the advisor's guidance is wasted because the executor has already invested in a direction and is reluctant to change course.

**Why it happens:** Without explicit timing guidance, the executor treats the advisor as a "check my work" tool rather than a "help me plan" tool. The natural LLM tendency is to start working immediately. Anthropic's internal evaluations show the advisor adds most value on the first call, before the approach crystallizes.

**Consequences:**
- Advisor's strategic guidance arrives after the executor has already written code
- Executor ignores advisor output that contradicts work already done (sunk cost)
- Near-zero quality improvement despite paying for Opus tokens
- Defeats the entire purpose of the advisor pattern

**Prevention:**
- Include Anthropic's suggested timing block verbatim in skill prompts: "Call advisor BEFORE substantive work -- before writing, before committing to an interpretation, before building on an assumption."
- Explicitly distinguish orientation from substantive work: "Orientation is not substantive work. Writing, editing, and declaring an answer are."
- Structure the implement skill to enforce advisor-first: orientation phase -> advisor call -> execution phase
- On short reactive tasks where the next action is dictated by tool output, skip the advisor -- it adds most value before the approach crystallizes

**Detection:** Review conversation transcripts. If the advisor is first called after file writes or code generation, timing is wrong.

**Phase relevance:** Phase 1 (skill prompt design). The timing block is part of the system prompt, not a feature to add later.

**Confidence:** HIGH (Anthropic advisor tool docs, suggested system prompt section)

---

### Pitfall 3: Executor Blindly Following Bad Advice Without Empirical Check

**What goes wrong:** The executor receives advisor guidance and follows it without verifying against the actual codebase state. The advisor may have misread the context or may not have seen recent file changes.

**Why it happens:** LLMs are trained to be compliant. When a "stronger" model provides advice, the executor defaults to obedience. Anthropic explicitly warns about this: "A passing self-test is not evidence the advice is wrong -- it's evidence your test doesn't check what the advice is checking."

**Consequences:**
- Executor introduces bugs by following advice that contradicts actual file contents
- Silent regressions where the advisor's suggestion was correct in general but wrong for this specific codebase
- Loss of the executor's own context advantages (it has tool access; the advisor in our plugin pattern is text-only)

**Prevention:**
- Include Anthropic's advice-handling block in skill prompts: "Give the advice serious weight. If you follow a step and it fails empirically, or you have primary-source evidence that contradicts a specific claim, adapt."
- Add reconciliation guidance: "If you've already retrieved data pointing one way and the advisor points another: don't silently switch. Surface the conflict in one more advisor call."
- Instruct executor to verify advisor suggestions against actual file state before implementing
- The executor has the tools; the advisor has the strategic reasoning. Neither should be trusted absolutely.

**Detection:** Test cases where the advisor gives plausible but wrong advice (e.g., suggests a pattern that doesn't match the project's actual dependency structure). Does the executor catch it?

**Phase relevance:** Phase 1 (implement skill prompt). This is prompt language, not architecture.

**Confidence:** HIGH (Anthropic advisor tool docs, "How the executor should treat the advice" section)

---

### Pitfall 4: Advisor Output Too Verbose (Cost Explosion)

**What goes wrong:** Advisor generates 500+ word explanations instead of concise enumerated steps. Since advisor output is billed at Opus rates and is the advisor's largest cost driver, verbose output can make the advisor pattern more expensive than running Opus end-to-end.

**Why it happens:** Without conciseness instructions, Opus defaults to thorough explanations. It naturally wants to explain reasoning, provide alternatives, and caveat its advice. The advisor tool docs note typical output is 400-700 text tokens (1,400-1,800 total with thinking).

**Consequences:**
- Total advisor output tokens dominate cost, eliminating the cost savings that justify the advisor pattern
- Verbose advice floods the executor's context, diluting other important information
- Executor may get confused by nuanced, multi-paragraph advice when it needs clear steps

**Prevention:**
- Include Anthropic's recommended conciseness instruction as the first advisor-related line in the system prompt: "The advisor should respond in under 100 words and use enumerated steps, not explanations."
- This single line cuts total advisor output tokens by 35-45% without changing call frequency (Anthropic's internal testing)
- The advisor agent's own system prompt should reinforce: respond concisely, enumerate steps, skip explanations
- Do NOT include "explain your reasoning" or "provide alternatives" in the advisor prompt

**Detection:** Monitor advisor response length during testing. If advisor output regularly exceeds 150 words, conciseness instructions are not working.

**Phase relevance:** Phase 1 (advisor agent definition). The conciseness instruction must be in the agent's system prompt from day one.

**Confidence:** HIGH (Anthropic advisor tool docs, "Trimming advisor output length" section)

---

### Pitfall 5: Plugin Manifest Validation Failures (Silent Skill Loading)

**What goes wrong:** Plugin's `plugin.json` contains unrecognized fields, malformed JSON, or misplaced component files, causing skills to silently fail to load. Neither the user nor the agent receives any error indication.

**Why it happens:** Claude Code's `plugin.json` parser uses strict schema validation that rejects plugins with unknown root-level fields. The marketplace itself has had schema inconsistencies (GitHub issue #1244). Fields like `category` and `source` that appear in marketplace metadata are not recognized by the client validator (issues #30366, #31384).

**Consequences:**
- Skills appear installed but never trigger -- user types `/lz-advisor.plan` and gets "Unknown skill"
- Hours of debugging with no error messages
- Plugin appears to work in development (`--plugin-dir`) but fails after marketplace publication due to additional metadata fields

**Prevention:**
- Keep `plugin.json` minimal: `name` is the only required field. Omit any field you don't explicitly need
- Only place `plugin.json` in `.claude-plugin/`. Components (skills, agents, hooks) go at the plugin root, not inside `.claude-plugin/`
- Test with `claude --debug` and look for "loading plugin" messages to verify all components are discovered
- Do NOT add custom fields to `plugin.json` -- any unrecognized key causes silent rejection
- Validate JSON syntax before committing
- If using standard directories, omit path fields entirely from `plugin.json`

**Detection:** Run `claude --debug` and verify skill registration. Test slash command invocation immediately after installation. Check for "Unknown skill" errors.

**Phase relevance:** Phase 1 (plugin scaffold). Get the manifest right before writing any skills.

**Confidence:** HIGH (Multiple GitHub issues: #20409, #30366, #31384 on anthropics/claude-code)

---

### Pitfall 6: Missing "Make Deliverable Durable" Before Final Advisor Call

**What goes wrong:** The executor calls the advisor for a final review, but hasn't saved its work to disk first. The advisor call takes time (the Opus sub-inference doesn't stream in the API version, and the Agent tool in Claude Code has similar latency). If the session ends, times out, or hits a context limit during the advisor call, all unsaved work is lost.

**Why it happens:** The natural flow is: finish work -> ask for review. But "finish work" in the executor's mind means "done generating" not "written to files." The API advisor tool explicitly pauses the stream while Opus runs, creating a window where no output is being produced. Our plugin's Agent tool call creates a similar pause.

**Consequences:**
- Work completed but not persisted to files is lost during advisor agent execution
- Session timeout or context exhaustion during advisor call means starting over
- Particularly painful for long-running implement tasks

**Prevention:**
- Include Anthropic's explicit durability instruction: "BEFORE this call, make your deliverable durable: write the file, save the result, commit the change. The advisor call takes time; if the session ends during it, a durable result persists and an unwritten one doesn't."
- Structure the implement skill with an explicit "persist work" step before "final advisor review" step
- This is verbatim from Anthropic's suggested system prompt -- don't paraphrase it

**Detection:** In testing, simulate a session interruption during the final advisor call. Was work saved?

**Phase relevance:** Phase 1 (implement skill prompt). This is a prompt instruction, not an architectural concern.

**Confidence:** HIGH (Anthropic advisor tool docs, suggested system prompt: "make your deliverable durable")

---

## Moderate Pitfalls

### Pitfall 7: Skill Description Truncation Losing Trigger Keywords

**What goes wrong:** Skill descriptions are truncated at 250 characters in the skill listing. Keywords that Claude needs to match user requests are stripped, causing skills to not trigger when they should.

**Why it happens:** Claude Code loads all skill names into context but budgets descriptions dynamically (1% of context window, fallback 8,000 characters). With multiple plugins installed, each skill's description gets shortened. The budget is shared across ALL installed skills.

**Consequences:**
- `/lz-advisor.plan` shows up in the list but Claude never auto-invokes it because the description was truncated before the relevant keywords
- Users must manually invoke skills instead of getting automatic invocation

**Prevention:**
- Front-load the key use case in descriptions -- put the most important trigger words in the first 100 characters
- Keep descriptions concise: "Plans tasks with Opus advisor guidance" not "A comprehensive planning skill that leverages the advisor strategy to pair Sonnet as executor with Opus as advisor for strategic guidance during the planning phase of development tasks"
- Each description is hard-capped at 250 characters regardless of budget
- Test with multiple plugins installed to verify descriptions survive truncation
- If needed, users can raise the limit with `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable

**Detection:** Ask Claude "What skills are available?" and check if lz-advisor descriptions appear complete and meaningful.

**Phase relevance:** Phase 1 (all skill definitions). Write tight descriptions from the start.

**Confidence:** HIGH (Official Claude Code skills docs, "Skill descriptions are cut short" troubleshooting section)

---

### Pitfall 8: Subagent Cannot Spawn Other Subagents (No Nested Delegation)

**What goes wrong:** Plugin author designs skills expecting the advisor agent (a subagent) to spawn its own sub-subagents for exploration or research. This fails because Claude Code prevents infinite nesting -- subagents cannot spawn other subagents.

**Why it happens:** The plugin author thinks in terms of the API advisor tool (which composes with other tools inside a single request) and assumes the Claude Code Agent tool works the same way. It doesn't. The API's `advisor_20260301` runs inside a single Messages request. Claude Code's Agent tool spawns a separate context window with strict nesting limits.

**Consequences:**
- Advisor agent fails to delegate mechanical work (file reading, searching) to cheaper Haiku subagents
- Opus agent must do all exploration in its own context window, consuming expensive tokens on mechanical work
- Architecture must be redesigned to avoid nested delegation

**Prevention:**
- Design skills so the executor (Sonnet, running in the main conversation) handles ALL tool calls
- The advisor agent should only provide guidance text -- limit its tools to Read and Glob (read-only) at most
- If the advisor needs codebase context, the executor should gather it BEFORE calling the advisor (aligns with Anthropic's pattern: orientation first, then advisor call)
- Structure: executor reads files -> executor calls advisor -> advisor responds with guidance text -> executor implements
- This constraint actually aligns perfectly with the advisor strategy: the advisor is a consultant, not a doer

**Detection:** If any skill design has the advisor agent writing files, running bash commands, or needing to spawn other agents, the architecture is wrong.

**Phase relevance:** Phase 1 (architecture). This constrains the fundamental interaction pattern.

**Confidence:** HIGH (Official Claude Code subagent docs: "Subagents cannot spawn other subagents")

---

### Pitfall 9: `context: fork` Loses Conversation History

**What goes wrong:** A skill with `context: fork` runs in an isolated subagent that has no access to the main conversation history. The forked agent receives only the skill content as its prompt, not what the user discussed previously.

**Why it happens:** `context: fork` is designed for isolation -- that's its feature. But plugin authors may not realize that the forked agent doesn't see the user's request context, file contents already read, or prior tool results. The official docs warn: "It won't have access to your conversation history."

**Consequences:**
- Advisor agent doesn't know what the user asked for
- Advisor can't reference files the executor already explored
- Skills that need both isolation (for cost) and context (for relevance) can't have both
- The `AskUserQuestion` tool is also broken inside `context: fork` (GitHub issue #19751)

**Prevention:**
- Do NOT use `context: fork` for the primary advisor consultation mechanism. The advisor needs to see the conversation transcript to provide relevant guidance
- Use the Agent tool directly (via the skill prompt instructing the executor to "call the lz-advisor agent") rather than forking the skill context
- Reserve `context: fork` for review skills where the entire task can be described in the skill content plus `$ARGUMENTS`
- For review skills that DO use fork, pass complete context through arguments or file references
- Test that the advisor's responses are specific to the user's task, not generic

**Detection:** If the advisor responds with generic advice unrelated to the actual task, it's likely not seeing the conversation.

**Phase relevance:** Phase 1 (skill architecture decision). Must decide fork vs. inline before writing skills.

**Confidence:** HIGH (Official Claude Code skills docs; GitHub issues #17283, #19751)

---

### Pitfall 10: Opus 4.6 Overthinking and Excessive Exploration

**What goes wrong:** The advisor agent (Opus 4.6) does extensive upfront exploration, generates very long thinking traces, and takes much longer than expected. This inflates thinking tokens and delays responses significantly.

**Why it happens:** Opus 4.6 does significantly more upfront exploration than previous models, especially at higher effort settings. Anthropic's official docs note: "Claude Opus 4.6 does significantly more upfront exploration than previous models... the model may gather extensive context or pursue multiple threads of research without being prompted." The effort level defaults compound this -- with adaptive thinking, complex system prompts trigger deeper reasoning.

**Consequences:**
- Advisor response takes 30+ seconds instead of 5-10 seconds, frustrating users
- Thinking tokens (invisible to the executor) inflate cost
- Executor waits idle during the advisor call
- Users perceive the plugin as slow

**Prevention:**
- Set explicit effort level on the advisor agent definition: `effort: medium` or `effort: high` (not `max`)
- Include thinking guidance in the advisor's system prompt: "Choose an approach and commit to it. Avoid revisiting decisions unless you encounter new information that directly contradicts your reasoning."
- The conciseness instruction ("respond in under 100 words") also naturally constrains thinking depth
- Do NOT add thorough exploration instructions to the advisor -- it explores enough on its own
- Keep the advisor's system prompt itself short and focused to avoid triggering disproportionately deep thinking

**Detection:** Time the advisor responses. If consistently over 15 seconds for routine guidance, effort level is too high or the prompt is triggering excessive reasoning.

**Phase relevance:** Phase 1 (advisor agent configuration). The `effort` frontmatter field.

**Confidence:** MEDIUM (Anthropic best practices docs confirm the behavior; exact impact depends on workload)

---

### Pitfall 11: Plugin Installed But Not Enabled

**What goes wrong:** Plugin is correctly added to `installed_plugins.json` but NOT automatically added to `enabledPlugins` in `settings.json`. Skills exist on disk but are invisible to Claude.

**Why it happens:** Known bug (GitHub issue #17832). The marketplace installation pipeline registers the plugin but doesn't always update the enabled list. This also manifests with custom `CLAUDE_CONFIG_DIR` (issue #34144) where slash commands fail even when the Skill tool works.

**Consequences:**
- Users install the plugin, see it in the UI, but skills don't trigger
- Support burden: users report "skill not working" when the fix is toggling a setting
- First impression of the plugin is "broken"

**Prevention:**
- Include clear installation verification steps in the plugin's README
- Tell users to verify: check `settings.json` for `enabledPlugins` including `lz-advisor`
- Document the difference between slash command resolution and Skill tool resolution (they use different lookup paths)
- Test the full marketplace installation flow, not just `--plugin-dir` development flow
- Test with both default and custom `CLAUDE_CONFIG_DIR`

**Detection:** After installing, run `/lz-advisor.plan` -- if "Unknown skill", check `enabledPlugins` in `settings.json`.

**Phase relevance:** Phase 2 or later (testing/distribution). Not a code issue, but a UX issue to document clearly.

**Confidence:** HIGH (GitHub issues #17832, #34144 on anthropics/claude-code)

---

### Pitfall 12: Naming Conflicts Between Plugin Components

**What goes wrong:** Plugin uses a component name that conflicts with built-in agents, other plugins, or reserved names. The conflict causes the wrong component to load or the plugin's component to be shadowed.

**Why it happens:** Claude Code resolves name conflicts by priority: managed settings > CLI flags > project > user > plugin. Plugin components always have the lowest priority. If a user has their own agent named `advisor` in `~/.claude/agents/`, it shadows the plugin's agent.

**Consequences:**
- Plugin's advisor agent shadowed by a user-level or project-level agent with the same name
- Skills from different plugins conflict
- User's existing `advisor` agent definition takes precedence over the plugin's

**Prevention:**
- Use the `lz-advisor` prefix consistently on all components (already decided per PROJECT.md)
- Plugin skills automatically namespace as `lz-advisor:plan`, `lz-advisor:implement`, etc.
- Avoid generic names like `advisor`, `plan`, `review` -- always prefix
- Test with other popular plugins installed to verify no conflicts
- Document that if the user has a `lz-advisor` agent in their project, it will override the plugin's

**Detection:** Install the plugin alongside common plugins (plugin-dev, skill-creator, etc.) and verify all components resolve correctly.

**Phase relevance:** Phase 1 (component naming convention). Already decided, but must be enforced.

**Confidence:** HIGH (Official Claude Code subagent docs, scope priority table)

---

### Pitfall 13: Advisor Agent Given Write Tools (Breaks the Advisor Pattern)

**What goes wrong:** The advisor agent is given Write, Edit, or Bash tools, and starts taking actions instead of just advising. This fundamentally breaks the advisor pattern where the advisor provides guidance and the executor acts.

**Why it happens:** Seems useful to let the advisor "help" with implementation. Or copying from other agent examples that have full tool access. Opus 4.6 has "a strong predilection for subagents and may spawn them in situations where a simpler, direct approach would suffice" -- with tools available, it will try to do work directly.

**Consequences:**
- Advisor takes actions that should be the executor's responsibility
- Cost explosion: Opus performing mechanical file writes at Opus token rates
- Loss of the dual-check pattern (executor can't verify advisor's work if advisor made the changes directly)
- Possible permission conflicts between advisor and executor

**Prevention:**
- Agent `tools` field should be read-only at most: `Read, Glob, Grep`
- Better yet, give the advisor NO tools and let it work purely from the conversation transcript (matching the API advisor tool's behavior where "The advisor itself runs without tools")
- If the advisor needs to understand the codebase, the executor should explore first and include findings in the conversation before calling the advisor
- Never add Write, Edit, or Bash to the advisor agent

**Detection:** If the advisor agent's transcript shows tool calls to Write, Edit, or Bash, the tool configuration is wrong.

**Phase relevance:** Phase 1 (agent definition). Decide tool restrictions upfront.

**Confidence:** HIGH (Anthropic advisor tool docs: "The advisor itself runs without tools and without context management")

---

## Minor Pitfalls

### Pitfall 14: Skill Content Lifecycle Misunderstanding

**What goes wrong:** Skill author writes one-time setup instructions expecting them to re-execute on each turn. In reality, skill content loads once and stays in conversation for the rest of the session. After auto-compaction, the first 5,000 tokens of each skill are retained; older skills may be dropped entirely if the 25,000-token combined budget is exhausted.

**Prevention:**
- Write skill content as standing instructions, not one-time steps
- Keep SKILL.md under 500 lines (official recommendation)
- Front-load the most critical instructions in the first 5,000 tokens (they survive compaction)
- Move detailed reference material to supporting files that Claude reads on demand

**Phase relevance:** Phase 1 (skill writing style).

**Confidence:** HIGH (Official Claude Code skills docs, "Skill content lifecycle" section)

---

### Pitfall 15: Plugin Version Caching Preventing Updates

**What goes wrong:** Developer updates plugin code but doesn't bump the version in `plugin.json`. Existing users don't see changes due to caching.

**Prevention:**
- Bump version in `plugin.json` for every change pushed to the marketplace
- Include version bumping in the development workflow checklist
- Test updates by uninstalling and reinstalling, not just reloading

**Phase relevance:** Phase 2 or later (distribution/maintenance).

**Confidence:** MEDIUM (Mentioned in official plugin docs)

---

### Pitfall 16: Prefilled Assistant Responses Not Supported on 4.6

**What goes wrong:** Prompt engineering technique of prefilling the assistant's first message (common in older Claude models) returns a 400 error on Opus 4.6.

**Prevention:**
- Never use prefilled assistant turns in any prompt
- Use structured outputs, XML tags, or explicit instructions instead
- This is a hard constraint, not a deprecation -- requests fail immediately on 4.6

**Phase relevance:** Phase 1 (prompt design). Relevant if borrowing prompt patterns from older Claude cookbooks.

**Confidence:** HIGH (Anthropic official 4.6 best practices)

---

### Pitfall 17: "ultrathink" Keyword Accidentally Enabling Extended Thinking

**What goes wrong:** Including the word "ultrathink" anywhere in skill content enables extended thinking for that skill invocation. If the skill author uses this word in documentation, comments, or explanations within the SKILL.md, it triggers extended thinking unintentionally, adding latency and cost.

**Prevention:**
- Never use the word "ultrathink" in skill content unless you specifically want extended thinking
- Use "consider", "evaluate", or "reason through" instead of "think" where possible (Claude Opus 4.5 was particularly sensitive to "think")
- Set appropriate effort levels via frontmatter instead of relying on prompt-based thinking triggers
- If you DO want extended thinking for a specific skill, use "ultrathink" intentionally

**Phase relevance:** Phase 1 (prompt wording). Minor but easy to avoid.

**Confidence:** HIGH (Official Claude Code skills docs: "include the word 'ultrathink' anywhere in your skill content" enables thinking)

---

### Pitfall 18: `disable-model-invocation: true` Also Blocking Slash Commands

**What goes wrong:** Setting `disable-model-invocation: true` on a skill intended to prevent auto-triggering also prevents the skill from being invoked via slash command in some cases. The model interprets this as "I cannot use the Skill tool for this skill at all."

**Prevention:**
- Known bug (GitHub issue #26251). Test slash command invocation explicitly on every skill with this flag
- If slash commands don't work, users can still invoke by mentioning the skill name naturally
- Monitor for a fix in Claude Code updates
- Consider whether `disable-model-invocation: true` is truly needed -- for advisor skills, auto-invocation may actually be desirable

**Phase relevance:** Phase 1 (skill configuration). Affects skills intended for manual-only invocation.

**Confidence:** HIGH (GitHub issue #26251 on anthropics/claude-code)

---

### Pitfall 19: Cost Tracking Blind Spots

**What goes wrong:** Users don't realize how much the advisor pattern costs because advisor tokens are tracked separately from executor tokens. In the API version, the advisor's thinking tokens are dropped before reaching the executor. In the Claude Code plugin version, the Agent tool spawns a separate context window whose token usage is not surfaced to the user.

**Prevention:**
- Document expected cost per skill invocation in the plugin's README
- The advisor typically generates 400-700 text tokens (1,400-1,800 total with thinking) per call
- With 2-3 calls per task, expect ~4,000-5,000 Opus tokens per task in advisor costs alone
- Plugin can't directly show costs, but documentation should set clear expectations
- Recommend users check Claude Code's cost summary at session end

**Phase relevance:** Phase 2 (documentation/user guidance). Not a code fix, but critical for adoption and trust.

**Confidence:** HIGH (Anthropic advisor tool docs, "Usage and billing" section)

---

### Pitfall 20: Review Skills Not Distinguishable from Each Other

**What goes wrong:** The review and security-review skills have nearly identical descriptions, causing Claude to trigger the wrong one or be uncertain which to use. User asks for a "review" and gets a security audit, or asks for security review and gets general code review.

**Prevention:**
- Security review description should emphasize unique keywords: "security", "vulnerability", "threat model", "attack surface", "authentication", "authorization", "injection"
- General review description should emphasize: "code quality", "readability", "best practices", "maintainability", "patterns"
- Include negative routing: "For security-focused review, use lz-advisor:security-review instead"
- Test with ambiguous prompts ("review this code") to verify correct routing

**Phase relevance:** Phase 1 (skill descriptions for review variants).

**Confidence:** MEDIUM (Domain-specific concern; general plugin design best practice)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Plugin scaffold | Silent manifest failures (#5) | Minimal plugin.json, test with `--debug`, no custom fields |
| Advisor agent definition | Verbose output (#4), overthinking (#10), write tools (#13) | Conciseness instruction + effort level + read-only tools |
| Skill prompt writing | Aggressive language (#1), late advisor call (#2) | Use calm natural language; use Anthropic's suggested timing block |
| Implement skill | Missing durability (#6), blind following (#3) | Include both timing and advice-handling blocks from Anthropic |
| Context architecture | Fork loses history (#9), no nested agents (#8) | Executor drives tools, advisor provides text only, no fork for advisor |
| Description tuning | Truncation (#7), skill similarity (#20) | Front-load keywords, stay under 250 chars, differentiate descriptions |
| Skill lifecycle | Content loaded once (#14), ultrathink trigger (#17) | Standing instructions, careful word choice |
| Marketplace publishing | Install-not-enabled (#11), version caching (#15) | Test full install flow, bump versions, document verification steps |
| Naming | Component conflicts (#12) | Enforce lz-advisor prefix consistently |
| Cost management | Invisible tokens (#19), overtriggering (#1) | Document costs, test call frequency, set effort levels |

## Sources

### Anthropic Official Documentation (HIGH confidence)
- [Advisor tool docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) -- Timing guidance, cost control, suggested system prompts, output trimming data
- [Prompting best practices for Claude 4.6](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- Overtriggering, aggressive language, migration, overthinking, prefill deprecation
- [Claude Code Skills docs](https://code.claude.com/docs/en/skills) -- Skill lifecycle, frontmatter reference, description limits, ultrathink trigger
- [Claude Code Subagents docs](https://code.claude.com/docs/en/sub-agents) -- Model override, nesting limits, context isolation, tool restrictions
- [Advisor strategy blog post](https://claude.com/blog/the-advisor-strategy) -- Benchmark results, architecture overview, cost data

### GitHub Issues (HIGH confidence)
- [#20409](https://github.com/anthropics/claude-code/issues/20409) -- Silent skill loading failure in plugins
- [#26251](https://github.com/anthropics/claude-code/issues/26251) -- disable-model-invocation blocks slash commands
- [#17283](https://github.com/anthropics/claude-code/issues/17283) -- context: fork and agent fields ignored by Skill tool
- [#19751](https://github.com/anthropics/claude-code/issues/19751) -- context: fork breaks AskUserQuestion
- [#30366](https://github.com/anthropics/claude-code/issues/30366) -- Unrecognized manifest keys (category, source)
- [#31384](https://github.com/anthropics/claude-code/issues/31384) -- Manifest validation rejects unrecognized keys after installation
- [#17832](https://github.com/anthropics/claude-code/issues/17832) -- Plugin installed but not enabled
- [#34144](https://github.com/anthropics/claude-code/issues/34144) -- Plugin slash commands fail with custom CLAUDE_CONFIG_DIR
- [#31977](https://github.com/anthropics/claude-code/issues/31977) -- In-process team agents lack Agent tool
- [#1244](https://github.com/anthropics/claude-plugins-official/issues/1244) -- Marketplace schema validation errors

### Community Sources (MEDIUM confidence)
- [Multi-agent routing guide (BSWEN)](https://docs.bswen.com/blog/2026-03-22-claude-code-multi-agent-routing/) -- Cost mistakes, vague descriptions, too many agents
- [Pitfalls of Claude Code (DEV Community)](https://dev.to/cheetah100/pitfalls-of-claude-code-1nb6) -- Rush to completion, sycophancy, unasked changes
- [Claude Code updates broke engineering (DEV Community)](https://dev.to/shuicici/claude-codes-feb-mar-2026-updates-quietly-broke-complex-engineering-heres-the-technical-5b4h) -- Effort level changes, adaptive thinking side effects
