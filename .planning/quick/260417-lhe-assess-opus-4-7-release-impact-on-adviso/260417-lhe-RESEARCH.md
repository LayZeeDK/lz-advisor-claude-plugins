# Opus 4.7 Release Impact on lz-advisor -- Research

**Researched:** 2026-04-17
**Domain:** Anthropic model migration (Opus 4.6 -> 4.7) for a Claude Code plugin
**Confidence:** HIGH (both primary sources fetched verbatim)

## TL;DR

1. **`xhigh` is a new effort tier between `high` and `max`.** Anthropic explicitly recommends it as "the best setting for most coding and agentic use cases" [CITED: migration guide]. Claude Code itself has raised the default effort to `xhigh` for plans [CITED: release post].
2. **Opus 4.7 uses tools LESS often, not more, at the same effort level.** "Claude Opus 4.7 has a tendency to use tools less often than Claude Opus 4.6 and to use reasoning more" [CITED]. This directly addresses our advisor's `maxTurns: 3` exhaustion -- the new default behavior is closer to what our advisor prompt is already trying to enforce.
3. **`model: opus` in Claude Code auto-routes to 4.7.** Confirmed empirically: this session's system prompt reports `claude-opus-4-7[1m]` as the backing model. No plugin frontmatter change is required to pick up 4.7; the `opus` alias resolves to the current generation.
4. **4.7 follows instructions more literally** -- good news for our "start with '1.', no preamble" constraint, but Anthropic warns: "prompts written for earlier models can sometimes now produce unexpected results... Users should re-tune their prompts and harnesses accordingly" [CITED: release post]. We must verify our word-limit and enumeration directives still fire.
5. **Response length is now task-calibrated, not verbosity-calibrated** -- 4.7 "calibrates response length to how complex it judges the task to be, rather than defaulting to a fixed verbosity" [CITED]. Our 100-word / 300-word caps are still enforceable via prompting, but Anthropic recommends positive examples over negative instructions.
6. **Per-agent recommendation (at a glance):** advisor -> `xhigh`, reviewer -> `xhigh`, security-reviewer -> `xhigh`. All three are coding/agentic use cases and Anthropic's explicit guidance is "Start with the new `xhigh` effort level for coding and agentic use cases."

## Sources

Both URLs fetched via `markdown.new` (POST to https://markdown.new/). HTTP 200 both. No fallback needed.

| URL | Method | Status | Size |
|-----|--------|--------|------|
| https://www.anthropic.com/news/claude-opus-4-7 | markdown.new | 200 | 25.4 KB |
| https://platform.claude.com/docs/en/about-claude/models/migration-guide#migrating-to-claude-opus-4-7 | markdown.new | 200 | 66.5 KB |

Files cached at:
- `C:/Users/LARSGY~1/AppData/Local/Temp/opus-4-7-release.md`
- `C:/Users/LARSGY~1/AppData/Local/Temp/opus-4-7-migration.md`
- `C:/Users/LARSGY~1/AppData/Local/Temp/opus-4-7-migration-section.md` (extracted Opus 4.7 section)

Anthropic's `docs.claude.com` replacement, `platform.claude.com`, did NOT block markdown.new in this session.

## What xhigh Does

### Authoritative quote (migration guide)

> The effort parameter allows you to tune Claude's intelligence vs. token spend, trading off capability for faster speed and lower costs. Start with the new `xhigh` effort level for coding and agentic use cases, and use a minimum of `high` effort for most intelligence-sensitive use cases.
>
> - **`max`:** Max effort can deliver performance gains in some use cases, but may show diminishing returns from increased token usage. This setting can also sometimes be prone to overthinking. We recommend testing max effort for intelligence-demanding tasks.
> - **`xhigh` (new):** Extra high effort is the best setting for most coding and agentic use cases.
> - **`high`:** This setting balances token usage and intelligence. For most intelligence-sensitive use cases, we recommend a minimum of `high` effort.
> - **`medium`:** Good for cost-sensitive use cases that need to reduce token usage while trading off intelligence.
> - **`low`:** Reserve for short, scoped tasks and latency-sensitive workloads that are not intelligence-sensitive.
>
> We expect effort to be more important for this model than for any prior Opus, and recommend experimenting with it actively when you upgrade.

### Authoritative quote (release post)

> **More effort control**: Opus 4.7 introduces a new `xhigh` ("extra high") effort level between `high` and `max`, giving users finer control over the tradeoff between reasoning and latency on hard problems. In Claude Code, we've raised the default effort level to `xhigh` for all plans. When testing Opus 4.7 for coding and agentic use cases, we recommend starting with `high` or `xhigh` effort.

### Interpretation

- **Effort controls thinking depth, not tool budget.** Effort is the knob for adaptive thinking (`thinking: {type: "adaptive"}`), which replaces the old fixed `budget_tokens`. The model self-allocates thinking tokens based on the effort tier.
- **Order is: `low` < `medium` < `high` < `xhigh` < `max`.** `xhigh` is the second-highest tier. `max` is not recommended as a default because it "can... be prone to overthinking."
- **Token cost:** Higher effort = more thinking tokens = more output cost. Anthropic does not publish a specific multiplier for `xhigh` vs `high`, but recommends setting `max_tokens >= 64k` when using `xhigh` or `max` to give the model room to think.
- **Latency cost:** Not quantified. The release post implies faster median latency on 4.7 overall (quote from AWS: "faster median latency and strict instruction following").
- **Free win from Hex:** "low-effort Opus 4.7 is roughly equivalent to medium-effort Opus 4.6" [CITED: release post]. Implies `effort: high` on 4.7 is stronger than `effort: high` on 4.6.

## Tool-Use Loop Behavior

This is the most important finding for our `maxTurns: 3` problem.

### Authoritative quote (migration guide -- Behavior Change #7)

> **Fewer tool calls by default:** Claude Opus 4.7 has a tendency to use tools less often than Claude Opus 4.6 and to use reasoning more. This produces better results in most cases.
>
> To increase tool usage, raise the effort setting. `high` or `xhigh` effort settings show substantially more tool usage in agentic search and coding. You can also adjust your prompt to explicitly instruct the model about when and how to properly use its tools.

### Authoritative quote (migration guide -- Behavior Change #5)

> **Fewer subagents spawned by default:** Claude Opus 4.7 tends to spawn fewer subagents by default. However, this behavior is steerable through prompting; give Claude Opus 4.7 explicit guidance around when subagents are desirable.

### Interpretation (critical)

The user's concern was that `effort: high` on 4.6 exhausted `maxTurns: 3` by re-reading files. 4.7 inverts this:

1. **Baseline (any effort):** 4.7 uses fewer tool calls than 4.6. It prefers reasoning over reading. Good for our advisor -- reduces the "preamble + three reads + no synthesis" failure mode.
2. **At `xhigh`:** Tool usage goes back up ("substantially more tool usage in agentic search and coding"). This is appropriate for reviewer and security-reviewer, which genuinely need to verify findings against source files. It is a concern for advisor, which already over-reads.
3. **The knob works in both directions.** If `xhigh` makes advisor over-read again, we can drop it to `high` (Anthropic's stated minimum for intelligence-sensitive tasks) and still benefit from 4.7's lower baseline tool usage.

**Net effect:** Effort DOES affect tool-call count on 4.7, but only upward relative to the new lower baseline. Moving advisor from `high` on 4.6 to `high` on 4.7 likely REDUCES tool calls (solves our preamble/maxTurns problem for free). Moving to `xhigh` probably keeps tool-call count near parity with 4.6 `high` but with deeper reasoning between calls.

## 4.7 Behavioral Changes Relevant to Advisor Plugin

All quotes from the migration guide "Behavior changes" section.

### 1. Literal instruction following (high impact)

> **More literal instruction following:** Claude Opus 4.7 interprets prompts more literally and explicitly than Claude Opus 4.6, particularly at lower effort levels. It will not silently generalize an instruction from one item to another, and it will not infer requests you didn't make. The upside of this literalism is precision and less thrash. It generally performs better for API use cases with carefully tuned prompts, structured extraction, and pipelines where you want predictable behavior. A prompt and harness review may be especially helpful for migration to Claude Opus 4.7.

Release post reinforces:

> Opus 4.7 is substantially better at following instructions. Interestingly, this means that prompts written for earlier models can sometimes now produce unexpected results: where previous models interpreted instructions loosely or skipped parts entirely, Opus 4.7 takes the instructions literally. Users should re-tune their prompts and harnesses accordingly.

**Impact on advisor.md:**
- `Begin your response with "1." -- no preamble, no intent-announcing phrases.` -- likely enforced more reliably on 4.7. This is the Phase 5.2 preamble waste problem; 4.7 may fix it without prompt changes.
- `Respond in under 100 words.` -- needs verification. 4.7 calibrates length to task complexity (see below); a strict cap may need a positive example.
- `The first item in the response should answer the question directly.` -- literal interpretation helps here.

**Impact on reviewer.md / security-reviewer.md:**
- The structured "Validation + Strategic analysis / Threat analysis" format should be taken more seriously. Good.
- `Respond in under 300 words.` may be interpreted even more strictly, potentially truncating cross-cutting analysis. Verify in UAT.

### 2. Response length calibration (medium impact)

> **Response length varies by use case:** Claude Opus 4.7 calibrates response length to how complex it judges the task to be, rather than defaulting to a fixed verbosity. This usually means shorter answers on simple lookups and much longer ones on open-ended analysis.
>
> If your product depends on a certain style or verbosity of output, you may need to tune your prompts. For example, to decrease verbosity, add: "Provide concise, focused responses. Skip non-essential context, and keep examples minimal." If you see specific kinds of over-explaining, add targeted instructions in your prompt to prevent them.
>
> Positive examples showing how Claude can communicate with the appropriate level of concision tend to be more effective than negative examples or instructions that tell the model what not to do.

**Impact:** Our word caps are framed negatively ("under 100 words"). Anthropic explicitly recommends positive examples for 4.7. Consider adding a one-shot example to advisor.md if the 100-word cap starts being ignored.

### 3. More direct tone (low impact, aligned)

> **More direct tone:** Claude Opus 4.7 is more direct and opinionated, with less validation-forward phrasing and fewer emoji than Claude Opus 4.6's warmer style.

Aligned with our advisor's "commit to one approach -- do not list alternatives" directive. Neutral-to-positive.

### 4. Built-in progress updates (low impact)

> **Built-in progress updates in agentic traces:** Claude Opus 4.7 provides more regular, higher-quality updates to the user throughout long agentic traces. If you've added scaffolding to force interim status messages ("After every 3 tool calls, summarize progress"), try removing it.

Advisor doesn't do long traces (maxTurns: 3). Not applicable. Reviewer/security-reviewer may see slightly more narration -- watch for it in UAT.

### 5. Stricter effort calibration (high impact for potential downgrade)

> **Stricter effort calibration:** Meaningfully changing from Claude Opus 4.6, Claude Opus 4.7 respects effort levels strictly, especially at the low end. At `low` and `medium`, the model scopes its work to what was asked rather than going above and beyond.

Good news: our STATE.md "Blockers/Concerns" lists calibrating down from `high` to `medium` if latency is bad. On 4.7, `medium` is strictly scoped -- actually lighter than `medium` on 4.6. That fallback is still viable if `high` on 4.7 proves too slow.

### 6. Non-breaking API changes we don't hit

These are migration guide "Breaking changes" that only affect direct API callers, not Claude Code plugin authors:
- Extended thinking `budget_tokens` removed -> irrelevant; we don't set thinking params in agent frontmatter.
- `temperature`, `top_p`, `top_k` removed -> irrelevant; we don't set these.
- Prefill removal -> irrelevant.
- Tokenizer change (up to 1.35x input tokens) -> relevant for cost forecasting but not for behavior. See "Migration Mechanics" below.

## Migration Mechanics in Claude Code Plugins

### Model aliasing (verified empirically)

The current Claude Code session shows `claude-opus-4-7[1m]` as the backing model when the user is on Team Plan and Opus is selected. The `model: opus` string in agent frontmatter (all three of our agents use this) is an alias that resolves to the current Opus generation.

**Implication:** No code change is required to adopt 4.7 for users on Team Plan or later. Our agents already pick up 4.7 the moment Claude Code's alias resolver points there.

**Evidence:**
- Release post: "Developers can use `claude-opus-4-7` via the Claude API" -- explicit ID exists and is available.
- Release post: "Opus 4.7 is available today across all Claude products and our API" -- Claude Code is a "Claude product."
- System-reminder in this session: `powered by the model named Opus 4.7 (1M context). The exact model ID is claude-opus-4-7[1m]`.

### Should we pin or keep the alias?

| Option | Pros | Cons |
|--------|------|------|
| Keep `model: opus` (alias) | Auto-upgrades on future Opus releases; one-line frontmatter; matches plugin-dev examples | Behavior changes without our approval; users on older Claude Code versions may still resolve to 4.6 |
| Pin `model: claude-opus-4-7` | Deterministic; survives future Opus releases unchanged; users know exactly what they're getting | Requires a plugin release every time a new Opus ships; may not be a supported Claude Code frontmatter value (unverified) |

**Recommendation:** keep the alias. Opus 4.7 is described as "a direct upgrade to Opus 4.6" with "strong out-of-the-box performance on existing Claude Opus 4.6 prompts and evals" [CITED: migration guide]. The behavior-change risks we care about (tool-use, instruction literalism) are improvements for our use case.

**Open:** Does Claude Code's agent frontmatter accept `model: claude-opus-4-7` (the full model ID) as a valid value, or only named aliases (`opus`, `sonnet`, `haiku`)? Neither source documents this. Needs empirical test if pinning becomes desirable.

### Tokenizer change cost impact

> Claude Opus 4.7 uses a new tokenizer... The tradeoff is that the same input can map to more tokens -- roughly 1.0-1.35x depending on the content type.
>
> Opus 4.7 thinks more at higher effort levels, particularly on later turns in agentic settings. This improves its reliability on hard problems, but it does mean it produces more output tokens.

Cost math for our advisor (prompt ~1-4 KB, output ~100 words):
- Input: tokenizer change may add 0-35% tokens. Input cost stays at $5/Mtok.
- Output: stays at $25/Mtok. Thinking tokens for `xhigh` aren't separately priced but count as output tokens.
- Net: likely a 10-30% cost increase per advisor call if we move to `xhigh`. Likely a 5-15% increase if we stay at `high`. Small in absolute terms (advisor budget is tens of thousands of output tokens per task, not millions).

The "near-Opus intelligence at Sonnet cost" core value proposition is preserved -- the advisor is still called 2-3 times per task, not per tool call. Cost envelope is unchanged in kind.

### Task budgets (beta) -- not applicable now

Migration guide introduces `task_budget` (beta header `task-budgets-2026-03-13`) as an advisory agentic budget. This is an API-only feature and doesn't map to Claude Code agent frontmatter. Skip.

### /ultrareview slash command

Release post mentions a new `/ultrareview` command in Claude Code. This is adjacent to our `lz-advisor.review` and `lz-advisor.security-review` skills and may be positioned as competition or as a complement. Noted for product positioning, not for this migration.

## Per-Agent Recommendation

| Agent | Current (4.6) | Recommended (4.7) | Rationale |
|-------|---------------|-------------------|-----------|
| advisor | `effort: high`, `maxTurns: 3` | `effort: high`, `maxTurns: 3` (no change yet); test `xhigh` in Phase 2-style UAT | 4.7's lower baseline tool usage + stricter instruction following + stricter effort calibration should fix the preamble waste and maxTurns exhaustion WITHOUT changing effort. Only raise to `xhigh` if UAT shows weak synthesis on hard consultations. |
| reviewer | `effort: high`, `maxTurns: 3` | `effort: xhigh`, `maxTurns: 3` | Reviewer is a coding/agentic use case on hard problems (cross-cutting pattern analysis). Anthropic's explicit guidance is "the best setting for most coding and agentic use cases." `xhigh` brings substantially more tool usage, which reviewer legitimately needs for claim verification. |
| security-reviewer | `effort: high`, `maxTurns: 3` | `effort: xhigh`, `maxTurns: 3` | Same rationale as reviewer. Threat modeling and attack-chain analysis are the canonical "hard, long-horizon reasoning" task Anthropic optimized 4.7 for. The "thinks more at higher effort levels, particularly on later turns" quote is especially relevant here. |

### Why advisor stays at `high` and reviewers move to `xhigh`

- **Advisor's job is synthesis, not exploration.** Under 100 words, first token "1.", no alternatives. Anthropic's guidance to drop unnecessary scaffolding on 4.7 applies: we may be over-spending effort budget on a task that's deliberately constrained. Test at `high` first.
- **Reviewers' job is exploration AND synthesis.** They package 300 words of analysis with OWASP/severity mapping plus cross-cutting patterns. That's an open-ended analysis task where "longer... open-ended analysis" [CITED] is appropriate. `xhigh` fits.

### Prompt changes required on all three agents

None required to enable 4.7. Recommended to verify:

1. **Verify 100-word / 300-word caps still fire.** 4.7's task-calibrated length may start expanding reviewer output if findings are complex. If so, add a positive example rather than strengthening the negative constraint (per Anthropic's guidance).
2. **Remove or soften "Final Response Discipline" anti-preamble block.** 4.7's stricter instruction following may make this prompt real-estate redundant. If empirical testing confirms no preamble on 4.7, trim the block to free budget for more substantive guidance.
3. **Keep `tools: ["Read", "Glob"]`.** 4.7's lower baseline tool usage makes this even safer. No expansion needed.

### What about `max`?

Not recommended for any agent. Migration guide: "prone to overthinking." Our agents all have strict word budgets -- overthinking manifests as wasted tokens, not better synthesis. `xhigh` is the ceiling for our use case.

## Open Questions (need empirical tests)

1. **Does Claude Code agent frontmatter accept `effort: xhigh`?** The documented effort tiers are from the Claude API's `output_config.effort`. It's unverified whether Claude Code's agent frontmatter parser accepts `xhigh` as a literal string (vs. only `low`/`medium`/`high`/`max`). First test: change reviewer.md to `effort: xhigh`, run `claude --debug --plugin-dir plugins/lz-advisor`, look for validation errors.

2. **Does `model: opus` route to 4.7 on all Claude Code plan tiers?** Confirmed on Team Plan (this session). Unverified for Pro, Free, or older Claude Code versions. May need a README note ("requires Claude Code version >= X").

3. **Does 4.7 at `effort: high` actually reduce tool calls for our advisor prompt?** This is the central empirical question. Measure: run `/lz-advisor.execute` with a realistic task, count advisor tool calls, compare to pre-4.7 baseline. If tool calls drop to <=1 per consultation, keep `high`. If they stay at 3 and synthesis is weak, try `xhigh`.

4. **Does 4.7's "more direct tone" over-apply to reviewer?** Reviewer's severity classification is tactfully worded ("state the disagreement and explain your reasoning briefly"). A more opinionated 4.7 may be blunter than intended. Watch for tone drift in UAT.

5. **Is `maxTurns: 3` the right ceiling at `xhigh`?** `xhigh` may extend thinking but NOT tool-use rounds. If so, 3 is still correct. If `xhigh` somehow expands tool-use rounds, `maxTurns: 3` may artificially truncate reviewer's verification. Migration guide is ambiguous on this. Test reviewer and security-reviewer at `xhigh` with current maxTurns first.

6. **Does the `(1M context)` tag in this session's model ID matter?** The system reports `claude-opus-4-7[1m]`. Our agents get fresh contexts (they can't see the session), so the 1M window is mostly irrelevant to a single consultation. Only relevant if packaged context grows beyond 200K (rare for our use case).

## Sources (full citation)

### HIGH confidence

- **Anthropic -- Introducing Claude Opus 4.7** (Apr 16, 2026). https://www.anthropic.com/news/claude-opus-4-7
  - Effort tier naming and Claude Code default, instruction-following changes, tokenizer change, pricing (unchanged), availability across Claude products
- **Anthropic -- Migration Guide: Migrating to Claude Opus 4.7**. https://platform.claude.com/docs/en/about-claude/models/migration-guide#migrating-to-claude-opus-4-7
  - Effort tier definitions including `xhigh`, complete behavior-change list, breaking API changes (not applicable to plugin), tokenizer details, `max_tokens` recommendation for xhigh/max

### Empirical (this session)

- Claude Code system-reminder confirms `model: opus` alias resolves to `claude-opus-4-7[1m]` for Team Plan users as of 2026-04-17

### Not consulted (out of scope for this quick task)

- Claude Opus 4.7 System Card (alignment details)
- Project Glasswing announcement (cybersecurity context)
- effort docs page, adaptive-thinking docs page (API-specific; quoted sections in migration guide are sufficient)
