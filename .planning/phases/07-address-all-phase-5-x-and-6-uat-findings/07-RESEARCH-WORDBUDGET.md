---
status: complete
phase: 07-address-all-phase-5-x-and-6-uat-findings
artifact: word-budget-regression-research
research_date: 2026-05-01
researcher: gsd-phase-researcher
trigger:
  - 07-UAT.md gap (reviewer 396w aggregate / 300w cap, 32% over)
  - 07-UAT.md gap (security-reviewer 414w aggregate / 300w cap, 38% over)
  - 07-UAT.md gap (security-reviewer Missed surface 33w / 30w cap)
question: |
  What prompt-engineering techniques bind Sonnet 4.6 / Opus 4.7 agent output length
  when descriptive sub-cap prose alone fails? Plan 07-04's hybrid pattern (descriptive
  triggers + worked example + structural sub-caps) lands prose but does not constrain
  empirical output to <=300w aggregate on plugin 0.11.0.
requirements_addressed:
  - FIND-D (extension)
  - GAP-D-budget-empirical (proposed new identifier for this regression)
sources_ranked:
  authoritative:
    - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices
    - https://www.anthropic.com/engineering/april-23-postmortem
    - https://platform.claude.com/docs/en/build-with-claude/effort
    - https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7
  community_verified:
    - https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
    - https://claude.com/blog/best-practices-for-using-claude-opus-4-7-with-claude-code
    - https://github.com/JuliusBrussee/caveman (D:\projects\JuliusBrussee\caveman cloned locally)
  community_unverified:
    - https://www.keepmyprompts.com/en/blog/claude-opus-4-7-prompting-guide-whats-changed
    - https://medium.com/@tentenco/stop-using-old-prompts-the-claude-opus-4-7-hack-guide-1379a9ecdd69
    - https://claudefa.st/blog/guide/development/opus-4-7-best-practices
    - https://prosperinai.substack.com/p/official-claude-prompting-everything
    - https://sider.ai/blog/ai-tools/system-prompt-tweaks-for-claude-sonnet-4_5-that-actually-enforce-style-without-breaking-your-brain
    - https://www.ibuildwith.ai/blog/effort-thinking-opus-4-7-changed-the-rules/
    - https://allthings.how/claude-opus-4-7-xhigh-effort-level-explained/
    - https://www.indiehackers.com/post/the-complete-guide-to-writing-agent-system-prompts-lessons-from-reverse-engineering-claude-code-6e18d54294
---

# Phase 7 Word-Budget Regression Research

## Executive Summary

Plan 07-04 landed structural sub-cap PROSE in `agents/reviewer.md` and `agents/security-reviewer.md` (Findings <=80w each, Cross-Cutting Patterns / Threat Patterns <=160w, Missed surfaces <=30w, total <=300w aggregate). Empirical measurement on plugin 0.11.0 (after the smoke-fixture extraction defects were repaired in commit `0065425`) confirms the prose alone does NOT bind output length:

- **Reviewer:** 396w aggregate, **32% over** the 300w cap.
- **Security-reviewer:** 414w aggregate, **38% over** the 300w cap.
- **Security-reviewer Missed surfaces:** 33w, 10% over the 30w cap.
- **Advisor (control):** 88w / 100w cap, **PASSES.** Same descriptive-prose technique works.

**The asymmetry is the central diagnostic clue.** Advisor uses `effort: high`, single Strategic Direction block, no sub-caps. Reviewer + security-reviewer use `effort: xhigh` (escalated for Opus 4.7 per CONTEXT.md D-04), multi-section output with per-entry / per-section / aggregate budgets. Anthropic's own April 2026 postmortem and current docs converge on three explanations:

1. **`effort: xhigh` produces verbose justification chains by design.** Anthropic explicitly documents this: "Opus 4.7 has a behavioral quirk relative to its predecessor: it tends to be quite verbose. This makes it smarter on hard problems, but it also produces more output tokens." [Source: Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem)

2. **Aggregate caps fight per-section caps.** When a prompt advertises both "Findings 250w aggregate" AND "<=300w total," the model treats the per-section cap as the operative target and uses the slack. The reviewer's per-section caps sum to 250+160+30 = 440w; the 300w aggregate is mathematically incompatible with maximum usage of each section.

3. **Anthropic's own ablation confirms output-length system-prompt instructions carry an intelligence cost.** "Length limits: keep text between tool calls to <=25 words. Keep final responses to <=100 words unless the task requires more detail." was added April 16, 2026; reverted April 20, 2026 after a "3% drop for both Opus 4.6 and 4.7" on a broad evaluation suite. [Source: Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem) The hybrid descriptive-prose approach was chosen for Plan 07-04 to avoid this cost; the 32-38% empirical overrun is the cost of that choice.

**Primary recommendation:** Adopt **Candidate A (Fragment-Grammar Output Template)** — replace the descriptive sub-cap prose with an explicit structural output grammar (`L<line>: <severity>: <problem>. <fix>.`) modeled on the empirically-validated `caveman` pattern. This binds output length structurally rather than descriptively, achieves 65% mean output reduction in Anthropic-Cookbook-style benchmarks (range 22-87% across 10 prompts on Sonnet 4 / Opus 4.6), and composes additively with existing rules (Hedge Marker Discipline, Class-2 escalation hook, Context Trust Contract).

**Secondary recommendation:** Adopt **Candidate B (Effort Calibration)** — drop reviewer + security-reviewer from `effort: xhigh` to `effort: medium` (or `effort: high`). This addresses the root cause directly: xhigh produces verbose chain-of-thought by design. Lower effort scopes work to what was asked. Anthropic's own guidance: "if your code-review harness was tuned for an earlier model, you may initially see lower recall... if you observe shallow reasoning on complex problems, raise effort rather than prompting around it. If you need to keep effort at `low` for latency, add targeted guidance." [Source: Anthropic Claude 4 Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**A and B compose.** They are not mutually exclusive. Recommend shipping both: structural output grammar (A) + effort de-escalation (B), with smoke fixtures gating both regression surfaces.

---

## User Constraints (from CONTEXT.md)

These constrain any proposed fix. The fix MUST honor all of these or explicitly justify deviation.

### Locked Decisions (D-03 + D-04 from CONTEXT.md)

- **D-03 phrasing style:** ALL-CAPS reserved for safety-critical rules (per Anthropic Claude 4 system prompt analysis); descriptive prose for everything else. Word-budget is currently in descriptive layer per Plan 07-04. **Word-budget is not safety-critical.**
- **D-03 hybrid pattern:** descriptive triggers + worked example + structural sub-caps + per-agent smoke fixtures. The hybrid pattern is not failed; the per-section caps within the hybrid are mathematically incompatible with the aggregate cap.
- **D-04 effort levels:** reviewer + security-reviewer use `effort: xhigh` (escalated for Opus 4.7 per quick-260417-lhe assessment). Plan 07-05 PERMANENTLY REJECTED Option 3 (extending tool grant beyond `["Read", "Glob"]`) per OWASP / arXiv 2601.11893 / Claude Code Issue #20264.
- **Hard-rules layer:** explicitly DEFERRED unless 0.11.0 cycle confirms hybrid is insufficient. Anthropic's April 2026 ablation showed ~3% coding-quality cost. **Plan 07-04's empirical regression is the empirical evidence required to escalate to a hard-rules layer.** Per CONTEXT.md deferred-ideas section: "deferred unless 0.10.0 cycle confirms hybrid is insufficient" — that condition has now been met empirically.
- **Plugin native components only:** no Claude API, no `advisor_20260301` tool, no `max_tokens` parameter control. Cannot use the API-level structured-output JSON schema feature. All enforcement is at agent prompt level.
- **Byte-identical canon:** changes that touch the 4 SKILL.md `<context_trust_contract>` block must apply byte-identically across plan/execute/review/security-review SKILL.md.
- **Reviewer + security-reviewer tools:** `["Read", "Glob"]` only. No Bash, no WebSearch, no WebFetch for these agents (Plan 07-05 D-04).

### Claude's Discretion

- Exact word-count thresholds in the structural output grammar (caveman uses one-line-per-finding; this research recommends evaluating both 1-line and 2-line shapes against the empirical input population).
- Whether to lower reviewer + security-reviewer effort from `xhigh` to `medium` (Anthropic-recommended) vs `high` (compromise).
- Specific severity-prefix syntax (`bug:|risk:|nit:|q:` text vs Unicode emoji vs single-char prefix). **Constraint reminder: the project CLAUDE.md forbids emoji and non-ASCII Unicode in all output, scripts, and prose.** The cavecrew-reviewer's `🔴 / 🟡 / 🔵 / ❓` syntax is non-portable to this project. Use ASCII text severity prefixes: `bug:`, `risk:`, `nit:`, `q:` (or the existing `Critical / Important / Suggestion` mapped to `crit:`, `imp:`, `sug:`).

### Deferred Ideas (OUT OF SCOPE)

- Any change requiring API-level access (max_tokens, stop_sequences, tool-use JSON schema with `maxLength` constraints, batch API output budget headers).
- Any change requiring extending reviewer/security-reviewer tool grant.
- Any change requiring removing maxTurns: 3.
- Hooks or runtime middleware (project is "no hooks for v1").
- New skills (Phase 7 boundary excludes new skills).

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FIND-D (extension) | Word-budget regression on reviewer + security-reviewer agents — empirical 32-38% overrun on plugin 0.11.0 despite Plan 07-04 sub-cap prose | Sections "Anthropic-recommended techniques", "Reference Implementation: caveman", "Effort-level tradeoff" support recommended candidates A + B. Empirical baselines from caveman benchmarks (65% output reduction on Sonnet 4 + Opus 4.6) anchor expected effectiveness. |
| GAP-D-budget-empirical (proposed) | New identifier for the empirical-regression-not-just-soft-cap-overrun gap — the regression is structural (per-section caps don't compose to aggregate cap) plus model-behavioral (xhigh effort produces verbose justifications by design) | Section "Anthropic April 2026 verbosity-prompt postmortem" + "Effort-level tradeoff" both quantify the model-behavioral side. Per-section-vs-aggregate arithmetic in Section "Diagnostic: why Plan 07-04's hybrid did not bind". |

---

## Anthropic-Recommended Techniques

### 1. Positive examples beat negative instructions (HIGH confidence)

Direct quote from Anthropic Claude 4 Best Practices:

> "Positive examples showing how Claude can communicate with the appropriate level of concision tend to be more effective than negative examples or instructions that tell the model what not to do."

[Source: Anthropic Claude 4 Best Practices, "Response length and verbosity" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**Application to lz-advisor:** Plan 07-04's prose IS positive-framed (the existing Density example for advisor IS a positive example, which is why advisor passes the budget). Reviewer and security-reviewer have no equivalent worked-example block showing "this is what 296 words of finding-plus-CCP-plus-missed-surfaces looks like." A 296w worked example would close part of the regression by showing the target, not just describing it.

### 2. Tell Claude what to do, not what not to do (HIGH confidence)

Direct quote from Anthropic Claude 4 Best Practices:

> "Tell Claude what to do instead of what not to do
> - Instead of: 'Do not use markdown in your response'
> - Try: 'Your response should be composed of smoothly flowing prose paragraphs.'"

[Source: Anthropic Claude 4 Best Practices, "Control the format of responses" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**Application to lz-advisor:** The current reviewer.md prose says things like "If the executor packaged more findings than can be covered in 250 words, prioritize by severity and skip lower-impact items." This is not a positive instruction; it's a fallback. The agent reads "skip lower-impact items" and emits all 5 findings anyway because there's no positive instruction telling it WHAT to emit. A positive-frame replacement: "Emit at most 3 findings unless severity warrants more. Each finding follows the template `<file:line>: <severity>: <problem>. <fix>.` (one to two sentences)."

### 3. Match prompt style to desired output (HIGH confidence)

Direct quote from Anthropic Claude 4 Best Practices:

> "The formatting style used in your prompt may influence Claude's response style. If you are still experiencing steerability issues with output formatting, try matching your prompt style to your desired output style as closely as possible. For example, removing markdown from your prompt can reduce the volume of markdown in the output."

[Source: Anthropic Claude 4 Best Practices, "Control the format of responses" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**Application to lz-advisor:** The current reviewer.md prose describing the 80w-per-entry cap is itself **257 words** of prose-explaining-prose. The agent system prompt is verbose; the output is verbose. Removing the meta-commentary about the cap and replacing it with a short worked example would tighten the prompt's own style and reduce the model's verbosity by reflection.

### 4. xhigh effort produces verbose justification chains (HIGH confidence)

Direct quote from Anthropic April 23 postmortem:

> "Claude Opus 4.7 has a notable behavioral quirk relative to its predecessor: it tends to be quite verbose. This makes it smarter on hard problems, but it also produces more output tokens."

[Source: Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem)

Direct quote from Anthropic Claude 4 Best Practices:

> "Meaningfully changing from Claude Opus 4.6, Claude Opus 4.7 respects effort levels strictly, especially at the low end. At `low` and `medium`, the model scopes its work to what was asked rather than going above and beyond."

[Source: Anthropic Claude 4 Best Practices, "Calibrating effort and thinking depth" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**Application to lz-advisor:** Per CONTEXT.md D-04, reviewer + security-reviewer use `effort: xhigh`. The xhigh effort level is **the proximate cause** of verbose output — it's by-design. Anthropic's recommendation is that effort and verbosity prompts are inversely related: higher effort produces more thorough (longer) responses; lower effort scopes the response. Continuing to use xhigh while fighting verbosity in prose is fighting the model's training. The empirical evidence: advisor (`effort: high`, 100w cap) PASSES; reviewer + security-reviewer (`effort: xhigh`, 300w cap) miss by 32-38%.

### 5. Anthropic's own April 2026 ablation: hard-rules layer carries 3% intelligence cost (HIGH confidence)

Direct quote from Anthropic April 23 postmortem:

> "On April 16, Anthropic added a system prompt instruction to reduce verbosity. In combination with other prompt changes, it hurt coding quality and was reverted on April 20. This impacted Sonnet 4.6, Opus 4.6, and Opus 4.7."

The exact instruction:

> "Length limits: keep text between tool calls to <=25 words. Keep final responses to <=100 words unless the task requires more detail."

The ablation result:

> "As part of this investigation, Anthropic ran more ablations (removing lines from the system prompt to understand the impact of each line) using a broader set of evaluations. One of these evaluations showed a 3% drop for both Opus 4.6 and 4.7. They immediately reverted the prompt as part of the April 20 release."

[Source: Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem)

**Application to lz-advisor:** This is the empirical anchor for CONTEXT.md's hard-rules-layer deferral. Plan 07-04's hybrid descriptive approach was chosen explicitly to avoid this 3% cost. Now that the hybrid has empirically failed (32-38% overrun), the cost-benefit changes:
- **Hybrid (current):** 0% intelligence cost, 32-38% budget overrun. Useless as a budget gate.
- **Hard-rules layer (deferred):** ~3% intelligence cost, expected close-to-zero budget overrun.

The empirical evidence required to escalate the hard-rules layer per CONTEXT.md deferred-ideas is now present. **However, the recommendation in this research is NOT to escalate to a hard-rules layer** — the recommendation is to use a structural output grammar (Candidate A) which Anthropic Best Practices implies should be more effective than imperatives without paying the same intelligence tax. See "Recommendation" section below.

### 6. Code-review harness specifically: report-everything beats filter-by-importance (HIGH confidence)

Direct quote from Anthropic Claude 4 Best Practices:

> "When a review prompt says things like 'only report high-severity issues,' 'be conservative,' or 'don't nitpick,' Claude Opus 4.7 may follow that instruction more faithfully than earlier models did — it may investigate the code just as thoroughly, identify the bugs, and then not report findings it judges to be below your stated bar. This can show up as the model doing the same depth of investigation but converting fewer investigations into reported findings, especially on lower-severity bugs. Precision typically rises, but measured recall can fall even though the model's underlying bug-finding ability has improved."
>
> "Some recommended prompt language: 'Report every issue you find, including ones you are uncertain about or consider low-severity. Do not filter for importance or confidence at this stage - a separate verification step will do that. Your goal here is coverage: it is better to surface a finding that later gets filtered out than to silently drop a real bug. For each finding, include your confidence level and an estimated severity so a downstream filter can rank them.'"

[Source: Anthropic Claude 4 Best Practices, "Code review harnesses" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**Application to lz-advisor:** This is THE Anthropic-official guidance for code-review-harness design with Opus 4.7. **Critical implication:** the lz-advisor reviewer.md is currently optimized in the OPPOSITE direction — "If the executor packaged more findings than can be covered in 250 words, prioritize by severity and skip lower-impact items." This trades coverage for compression. Anthropic recommends trading compression for coverage. **This means the word-budget itself may be an architectural anti-pattern for Opus 4.7 reviewers.** The right design is short-per-finding (caveman one-line) + many findings, NOT few findings + verbose justification per finding. The fragment-grammar pattern resolves the conflict: short shape per finding allows MORE findings within the same budget.

### 7. Structured output via XML format indicators (HIGH confidence)

Direct quote from Anthropic Claude 4 Best Practices:

> "Use XML format indicators
> - Try: 'Write the prose sections of your response in `<smoothly_flowing_prose_paragraphs>` tags.'"

[Source: Anthropic Claude 4 Best Practices, "Control the format of responses" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**Application to lz-advisor:** The current reviewer/security-reviewer use Markdown headers (`### Findings`, `### Cross-Cutting Patterns`, `### Threat Patterns`, `### Missed surfaces`) which Anthropic Best Practices implies are LESS reliable for instruction-following than XML tags. A migration from `### Findings` to `<findings>...</findings>` would tighten the structural anchor — though it conflicts with the existing `D-reviewer-budget.sh` smoke fixture parser (which uses `awk '/^### Findings/...'`). Mitigation: smoke fixture parser updated to detect both shapes, or stay with Markdown headers and add inline XML tags around individual findings. **Trade-off: substantial structural change with non-trivial smoke-fixture migration cost. Lower priority than fragment-grammar approach.**

---

## Community Findings 2026

These are 2026 Q1-Q2 community findings on Sonnet 4.6 / Opus 4.7 instruction-following for output length. Community sources need verification against authoritative sources; flagged accordingly.

### Sonnet 4.6 + Opus 4.7 instruction-following is more literal (HIGH confidence — verified against Anthropic docs)

> "Claude Opus 4.7 interprets prompts more literally and explicitly than Claude Opus 4.6, particularly at lower effort levels. It will not silently generalize an instruction from one item to another, and it will not infer requests you didn't make."

[Source: Anthropic Claude 4 Best Practices, "More literal instruction following" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

[Verification: Multiple community sources confirm — keepmyprompts.com Opus 4.7 prompting guide, ibuildwith.ai Opus 4.7 effort thinking guide, claudefa.st Opus 4.7 best practices]

**Application:** The reviewer.md prose contains "if the executor packaged more findings than can be covered in 250 words, prioritize by severity and skip lower-impact items." Opus 4.7 reads this LITERALLY: it will skip items if it judges them low-impact, but it will NOT compress its high-impact items. The escape valve is "lower-impact items," not "compress everything."

### Hedge phrases ("try to", "if possible") weaken instructions on Opus 4.7 (MEDIUM confidence — community-source reasoning)

> "Kill vague hedges. Remove 'try to,' 'if possible,' 'you might want to.' In 4.6, these worked because the model interpreted them generously. In 4.7, they weaken your instructions. Replace every hedge with a direct command."

[Source: keepmyprompts.com Opus 4.7 prompting guide](https://www.keepmyprompts.com/en/blog/claude-opus-4-7-prompting-guide-whats-changed) (community, unverified)

**Application:** The reviewer.md word-budget prose contains "if your draft response runs long, the corrective is to compress wording (reduce explanatory adjectives, collapse two short sentences into one, drop trailing rationale) rather than to drop content." This is conditional ("if your draft runs long...") rather than direct ("compose with these rules from the start..."). Opus 4.7's literal reading: agent doesn't notice it's running long until it's already running long; the conditional fires too late.

### Effort xhigh tends toward verbose self-reflection (MEDIUM confidence — community-source verified by Anthropic engineering blog)

> "For routine coding tasks, a larger thinking budget does not buy reliability but it buys more verbose self-reflection that can actively hurt performance if output budget is not large enough to absorb it."

[Source: claudefa.st Opus 4.7 best practices](https://claudefa.st/blog/guide/development/opus-4-7-best-practices) (community, verified by Anthropic engineering postmortem context)

**Application:** Reviewer + security-reviewer at `effort: xhigh` are running with thinking budgets calibrated for "advanced coding and complex agentic work requiring extended exploration." Code review with packaged findings is NOT extended-exploration work — the executor already did the exploration in Phase 1 of `lz-advisor.review/SKILL.md`. The reviewer's job is **synthesis-and-validation**, not exploration. Lower effort fits the synthesis-and-validation shape.

### Word-budget compliance on Opus 4.7 requires structural anchors, not soft caps (MEDIUM confidence — community pattern)

Multiple community sources converge:

> "State your constraints as rules. Claude respects numbered rules and `<rules>` blocks more consistently than inline instructions buried in paragraphs."
[Source: NeuraPulse — Best Prompts for Anthropic Claude AI](https://neuraplus-ai.github.io/blog/best-prompts-for-anthropic-claude-ai.html) (community, unverified)

> "A practical example pattern for length-constrained outputs: Write 5 different opening paragraphs for an article titled '[title]'. Each should use a different hook technique: 1. Surprising statistic 2. Provocative question 3. Common misconception 4. Short story/anecdote 5. Bold contrarian claim. Keep each under 80 words."
[Source: NeuraPulse — Best Prompts for Anthropic Claude AI](https://neuraplus-ai.github.io/blog/best-prompts-for-anthropic-claude-ai.html) (community, unverified)

> "Claude tends to behave best when you give it a clear structure."
[Source: PromptBuilder — Claude Prompt Engineering Best Practices 2026](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026) (community, unverified)

**Application:** The reviewer's current structure is `### Findings` / `### Cross-Cutting Patterns` / `### Missed surfaces` with prose budgets. Community guidance suggests the budgets should be **structural** (in the form of an emit template) not **descriptive**. Section "Reference Implementation: caveman" below details the canonical empirical pattern.

### Self-check / post-emission verification block (MEDIUM confidence — community pattern)

Community pattern documented in multiple guides:

> "For agent workflows, structured outputs are essential for reliable prompt chaining. For important prompts, append a tiny self-check block: BEFORE RESPONDING, verify: ☐ Did you follow the output format exactly? ☐ Are any claims uncertain? If yes, mark them with [UNCERTAIN]. ☐ Are all steps actionable (not vague)? ☐ Did you stay within the stated constraints? This uses Claude's ability to review its own output. It will often catch mistakes when you explicitly ask it to check."

[Source: PromptBuilder — Claude Prompt Engineering Best Practices 2026](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026) (community, unverified)

> "Append something like 'Before you finish, verify your answer against [test criteria].' This catches errors reliably, especially for coding and math."
[Source: Anthropic Claude 4 Best Practices, "Leverage thinking & interleaved thinking capabilities" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) (HIGH — Anthropic-verified)

**Application:** A pre-emission self-check block could be added to reviewer.md / security-reviewer.md asking the agent to count words and rewrite the response if over-budget. This is a single-pass mechanism (no separate API call), lower complexity than chained-prompt self-correction. **However**, the empirical evidence on whether this works for word-budget specifically is mixed; community sources document it for content-correctness self-check more than length self-check. Flagged as Candidate D (lower-priority) below.

---

## Reference Implementation: caveman -- empirical 65% output reduction via fragment grammar + drop/keep lists + severity prefixes

The user clone of `https://github.com/JuliusBrussee/caveman` to `D:\projects\JuliusBrussee\caveman` is a Claude Code skill/plugin that demonstrates empirical 65% output-token reduction via prompt-engineering alone. Sources below cite the cloned-local files by absolute path; cite to the GitHub URL when external readers need to verify.

### Empirical baselines (Anthropic API)

Caveman's `benchmarks/run.py` runs 10 fixed prompts × 2 modes (normal vs caveman) × 3 trials against the Anthropic API directly. The README tabulates the result (`D:\projects\JuliusBrussee\caveman\README.md` lines 270-285):

| Task | Normal (tokens) | Caveman (tokens) | Saved |
|------|---------------:|----------------:|------:|
| Explain React re-render bug | 1180 | 159 | 87% |
| Fix auth middleware token expiry | 704 | 121 | 83% |
| Set up PostgreSQL connection pool | 2347 | 380 | 84% |
| Explain git rebase vs merge | 702 | 292 | 58% |
| Refactor callback to async/await | 387 | 301 | 22% |
| Architecture: microservices vs monolith | 446 | 310 | 30% |
| Review PR for security issues | 678 | 398 | 41% |
| Docker multi-stage build | 1042 | 290 | 72% |
| Debug PostgreSQL race condition | 1200 | 232 | 81% |
| Implement React error boundary | 3454 | 456 | 87% |
| **Average** | **1214** | **294** | **65%** |

**Critical model-gap caveat:** Caveman's `benchmarks/run.py` defaults to `claude-sonnet-4-20250514` (Sonnet 4, line 244) and the eval snapshot in `evals/snapshots/results.json` uses `claude-opus-4-6`. **No Opus 4.7 empirical data exists in the caveman repo.** Lz-advisor's reviewer + security-reviewer use Opus 4.7. The 65% Sonnet 4 / Opus 4.6 baseline transfers to Opus 4.7 only by analogy. Anthropic's April 23 postmortem explicitly notes Opus 4.7 is more verbose than Opus 4.6, so the relative reduction MAY be higher (more headroom to compress) or LOWER (the new tokenizer maps text to 1.0-1.35x more tokens than 4.6 per [keepmyprompts.com Opus 4.7 prompting guide](https://www.keepmyprompts.com/en/blog/claude-opus-4-7-prompting-guide-whats-changed)). **Recommend: empirical UAT on Opus 4.7 to confirm the technique transfers before committing the full pattern.**

### The fragment-grammar mechanism

The activation rule (`D:\projects\JuliusBrussee\caveman\rules\caveman-activate.md` lines 1-15) is itself terse:

```
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
```

**Load-bearing line: `Pattern: [thing] [action] [reason]. [next step].`** This is an explicit OUTPUT GRAMMAR (not a word cap). The model is told what shape to emit, not just how short to be. Anthropic Best Practices "match prompt style to desired output" + "tell Claude what to do not what not to do" both compose with this approach.

### caveman-review skill (DIRECT ANALOGUE to lz-advisor reviewer/security-reviewer)

The caveman-review skill (`D:\projects\JuliusBrussee\caveman\skills\caveman-review\SKILL.md`) is the closest analogue to lz-advisor's reviewer.md. The full body, lines 9-52:

```
Write code review comments terse and actionable. One line per finding. Location, problem, fix. No throat-clearing.

## Rules

**Format:** `L<line>: <problem>. <fix>.` -- or `<file>:L<line>: ...` when reviewing multi-file diffs.

**Severity prefix (optional, when mixed):**
- 🔴 bug: -- broken behavior, will cause incident
- 🟡 risk: -- works but fragile (race, missing null check, swallowed error)
- 🔵 nit: -- style, naming, micro-optim. Author can ignore
- ❓ q: -- genuine question, not a suggestion

**Drop:**
- "I noticed that...", "It seems like...", "You might want to consider..."
- "This is just a suggestion but..." -- use `nit:` instead
- "Great work!", "Looks good overall but..." -- say it once at the top, not per comment
- Restating what the line does -- the reviewer can read the diff
- Hedging ("perhaps", "maybe", "I think") -- if unsure use `q:`

**Keep:**
- Exact line numbers
- Exact symbol/function/variable names in backticks
- Concrete fix, not "consider refactoring this"
- The *why* if the fix isn't obvious from the problem statement

## Examples

❌ "I noticed that on line 42 you're not checking if the user object is null before accessing the email property. This could potentially cause a crash if the user is not found in the database. You might want to add a null check here."

✅ `L42: 🔴 bug: user can be null after .find(). Add guard before .email.`

❌ "It looks like this function is doing a lot of things and might benefit from being broken up into smaller functions for readability."

✅ `L88-140: 🔵 nit: 50-line fn does 4 things. Extract validate/normalize/persist.`

❌ "Have you considered what happens if the API returns a 429? I think we should probably handle that case."

✅ `L23: 🟡 risk: no retry on 429. Wrap in withBackoff(3).`

## Auto-Clarity

Drop terse mode for: security findings (CVE-class bugs need full explanation + reference), architectural disagreements (need rationale, not just a one-liner), and onboarding contexts where the author is new and needs the "why". In those cases write a normal paragraph, then resume terse for the rest.

## Boundaries

Reviews only -- does not write the code fix, does not approve/request-changes, does not run linters. Output the comment(s) ready to paste into the PR. "stop caveman-review" or "normal mode": revert to verbose review style.
```

**Load-bearing techniques:**
1. **Explicit output template** (`Format: L<line>: <problem>. <fix>.`) — this BINDS the shape rather than describing the budget.
2. **Drop list** — concrete, enumerated phrases the agent must omit. Replaces vague "be concise" with specific "don't say `I noticed that`."
3. **Keep list** — concrete, enumerated content the agent must preserve. Anthropic-recommended positive framing.
4. **Worked example pairs** (`❌ verbose / ✅ terse`) — Anthropic-recommended positive examples; the agent generalizes from the pattern.
5. **Auto-clarity carve-out** — security findings drop terse mode and emit full prose. Directly maps to lz-advisor's Class 2-S sub-pattern.

### cavecrew-reviewer agent (DIRECT ANALOGUE to lz-advisor reviewer agent)

The cavecrew-reviewer agent (`D:\projects\JuliusBrussee\caveman\agents\cavecrew-reviewer.md`) shows how an agent prompt encodes the fragment-grammar pattern. The full body, lines 11-49:

```
Caveman-ultra. Findings only. No "looks good", no "I'd suggest", no preamble.

## Severity

| Emoji | Tier | Use for |
|---|---|---|
| 🔴 | bug | Wrong output, crash, security hole, data loss |
| 🟡 | risk | Edge case, race, leak, perf cliff, missing guard |
| 🔵 | nit | Style, naming, micro-perf -- emit only if user asked thorough |
| ❓ | question | Need author intent before judging |

## Output

```
path/to/file.ts:42: 🔴 bug: token expiry uses `<` not `<=`. Off-by-one allows expired tokens 1 tick.
path/to/file.ts:118: 🟡 risk: pool not closed on error path. Add `try/finally`.
src/utils.ts:7: ❓ question: why duplicate `.trim()` here?
totals: 1🔴 1🟡 1❓
```

Zero findings → `No issues.`
File order, ascending line numbers within file.

## Boundaries

- Review only what's in front of you. No "while we're here".
- No big-refactor proposals.
- Need more context → append `(see L<n> in <file>)`. Don't guess.
- Formatting nits skipped unless they change meaning.

## Tools

`Bash` only for `git diff`/`git log -p`/`git show`. No mutating commands.

## Auto-clarity

Security findings → state risk in plain English first sentence, then caveman fix line.
```

**Frontmatter (lines 1-10):**

```yaml
name: cavecrew-reviewer
description: >
  Diff/branch/file reviewer. One line per finding, severity-tagged, no praise,
  no scope creep. Output format `path:line: <emoji> <severity>: <problem>. <fix>.`
  ...
tools: Read, Grep, Bash
model: haiku
```

**Critical compatibility note:** caveman uses `model: haiku`. Lz-advisor's reviewer + security-reviewer use `model: opus` (Opus 4.7 per CONTEXT.md D-04). Haiku is ~10x cheaper than Opus and naturally more terse by training. The caveman empirical 65% reduction is on Sonnet 4 / Opus 4.6 (per benchmarks/), but the cavecrew agent specifically downgrades to Haiku. **Lowering lz-advisor reviewer + security-reviewer to Haiku would be a much bigger architectural change than tweaking prompt prose** — it would fundamentally change the role from "Opus-level deep analysis" to "Haiku-level pattern matching." This is OUT OF SCOPE for Phase 7 closure (would require new phase, new UAT cycle, marketplace re-publishing). **Flagged as deferred-not-out-of-scope-forever** for a future phase if Candidates A + B fail.

### Persistence directive — addresses session drift

The skills/caveman/SKILL.md `## Persistence` section (`D:\projects\JuliusBrussee\caveman\skills\caveman\SKILL.md` lines 14-15):

```
ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift. Still active if unsure. Off only: "stop caveman" / "normal mode".
```

**Critical observation:** This is ALL-CAPS for "ACTIVE EVERY RESPONSE." Per CONTEXT.md D-03, lz-advisor reserves ALL-CAPS for safety-critical rules. **Caveman uses ALL-CAPS for persistence/anti-drift, treating it as load-bearing.** This is empirical evidence that caveman's authors found the descriptive layer alone insufficient for persistence. The ALL-CAPS use is purpose-coupled (drift prevention, not safety enforcement).

**Application to lz-advisor:** A persistence directive would address a related but distinct problem — agents that start terse and drift verbose over a long session. lz-advisor's reviewer/security-reviewer are typically invoked once per skill session (no multi-turn drift surface), so persistence is lower-priority than for caveman's skill (which spans full coding sessions).

### Auto-clarity carve-out — direct analogue to lz-advisor Class 2-S

Caveman's auto-clarity rules (`D:\projects\JuliusBrussee\caveman\skills\caveman\SKILL.md` lines 56-62):

```
Drop caveman when:
- Security warnings
- Irreversible action confirmations
- Multi-step sequences where fragment order or omitted conjunctions risk misread
- Compression itself creates technical ambiguity (e.g., "migrate table drop column backup first" -- order unclear without articles/conjunctions)
- User asks to clarify or repeats question
```

**Direct analogue to lz-advisor:** The security-reviewer's Class 2-S sub-pattern (CVE / supply-chain / advisory questions) deserves a similar carve-out. The fragment grammar is appropriate for `🔴 bug:` and `🟡 risk:` findings; for security advisories citing CVE numbers, advisory URLs, version ranges, the agent should emit FULL prose explaining the threat. This composes cleanly with the existing lz-advisor `Hedge Marker Discipline` rule and the Plan 07-05 `<verify_request>` Class-2 escalation hook.

### Explicit DROP / KEEP lists — Anthropic positive-framing in disguise

The skill's rules section (`D:\projects\JuliusBrussee\caveman\skills\caveman\SKILL.md` lines 19-24):

```
Drop: articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries (sure/certainly/of course/happy to), hedging. Fragments OK. Short synonyms (big not extensive, fix not "implement a solution for"). Technical terms exact. Code blocks unchanged. Errors quoted exact.

Pattern: `[thing] [action] [reason]. [next step].`

Not: "Sure! I'd be happy to help you with that. The issue you're experiencing is likely caused by..."
Yes: "Bug in auth middleware. Token expiry check use `<` not `<=`. Fix:"
```

**Anthropic-recommended pattern: positive examples + concrete actionable rules.** The DROP list is technically negative ("don't use these phrases") but it's CONCRETE — specific phrases listed verbatim, not vague concepts. This is structurally different from "be concise"; it tells the model exactly what to omit. Anthropic Best Practices "tell Claude what to do not what not to do" applies more strictly to abstract concepts than to concrete enumerated items; specific phrases-to-omit are effectively whitelist-by-omission.

### Severity-prefix collapsing — single-token severity assertion

In caveman-review, severity is `🔴 bug:` / `🟡 risk:` / `🔵 nit:` / `❓ q:` — a single token (one Unicode glyph + one short word). Compare to current lz-advisor reviewer.md which writes "Severity: Critical / Important / Suggestion" — three to seven tokens per finding.

**Token math (10 findings):** caveman 10 tokens / lz-advisor 30-70 tokens = 67-86% reduction on severity assertion alone.

**Project portability constraint:** lz-advisor CLAUDE.md forbids emoji and non-ASCII in all output. Lz-advisor adaptation: replace `🔴 / 🟡 / 🔵 / ❓` with ASCII text severity tags (`crit:` / `imp:` / `sug:`) while keeping the single-token compression principle. The smoke fixture parser (`D-reviewer-budget.sh`) already handles `### Findings` and entry numbering; adapting to detect `crit: <text>` lines is a small parser change.

---

## Diagnostic: why Plan 07-04's hybrid did not bind

Per-section caps and aggregate cap arithmetic:

| Section | Per-section cap | Plan 07-04 prose says |
|---------|-----------------|------------------------|
| Findings (5 entries × 80w each) | 400w | "aggregate Findings section <=250w" |
| Cross-Cutting Patterns / Threat Patterns | 160w | "<=160 words" |
| Missed surfaces | 30w | "<=30 words" |
| **Sum of caps** | **440w** | — |
| **Aggregate cap** | — | "<=300 words aggregate" |

The mathematical impossibility: a max-usage-per-section response is 440w, **47% over** the 300w aggregate cap. The agent cannot maximize each section without violating the aggregate. The current prose attempts to resolve this by saying "the per-section caps are loose upper bounds; the 300w aggregate constrains usage in practice -- a maximally-used Findings section (250w) leaves only 50w for CCP + Missed surfaces combined." This relies on the agent doing arithmetic in real-time during emission — Anthropic Best Practices community guidance on Opus 4.7 explicitly says the model interprets prompts literally; it does NOT consistently do real-time arithmetic to balance multiple budgets.

**Empirical observation:** the regression is in the per-section direction. Reviewer entries are 52-63w (under 80w cap, GOOD), CCP is 132w (under 160w cap, GOOD), Missed surfaces 33w (slightly over 30w cap), but the sum is 396w. Each section "behaves" relative to its per-section cap; the aggregate is the casualty. **The aggregate cap is descriptive; the per-section caps are operative.**

Two architectural fixes:

1. **Make caps mathematically compatible.** Reduce per-section caps so their sum equals the aggregate. E.g., 5 × 50w Findings + 30w CCP + 20w Missed = 300w. **This is mechanical; reduces flexibility but binds.**
2. **Switch from word caps to shape caps.** Replace per-section word budgets with an output-template grammar. E.g., one-line-per-finding, no aggregate cap stated; let the line-count + line-length-shape produce the budget by structure. **This is the caveman approach.**

Recommendation: option 2. Option 1 is safer but produces less-helpful reviews (50w per finding is too tight for substantive analysis). Option 2 produces shorter findings BUT allows MORE findings — which Anthropic Best Practices explicitly recommends for code review harnesses on Opus 4.7 (the "report every issue you find, do not filter" prompt language).

---

## Effort-level tradeoff analysis

### What Anthropic recommends

Direct quote from Anthropic Claude 4 Best Practices, "Calibrating effort and thinking depth":

> "Start with the new `xhigh` effort level for coding and agentic use cases, and use a minimum of `high` effort for most intelligence-sensitive use cases. Experiment with other effort levels to further tune token usage and intelligence:
> - **`xhigh` (new):** Extra high effort is the best setting for most coding and agentic use cases.
> - **`high`:** This setting balances token usage and intelligence. For most intelligence-sensitive use cases, we recommend a minimum of `high` effort.
> - **`medium`:** Good for cost-sensitive use cases that need to reduce token usage while trading off intelligence.
> - **`low`:** Reserve for short, scoped tasks and latency-sensitive workloads that are not intelligence-sensitive."

[Source: Anthropic Claude 4 Best Practices, "Calibrating effort and thinking depth" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

> "If you observe shallow reasoning on complex problems, raise effort to `high` or `xhigh` rather than prompting around it."

[Source: Anthropic Claude 4 Best Practices, "Calibrating effort and thinking depth" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**Key signal:** `medium` is "good for cost-sensitive use cases that need to reduce token usage while trading off intelligence." This is exactly the lz-advisor reviewer trade-off after Plan 07-04: the reviewer's Class 2-S escalation hook (Plan 07-05) handles the genuinely-hard cases via re-invocation; the base-case reviewer is doing synthesis-and-validation on packaged findings, not exploration. **Medium effort fits the synthesis-and-validation shape.**

### Quantification of the trade

Per Anthropic effort levels documentation:
- `low`: minimal thinking budget
- `medium`: moderate thinking budget
- `high`: 5,000 thinking tokens (per [allthings.how Opus 4.7 xhigh effort guide](https://allthings.how/claude-opus-4-7-xhigh-effort-level-explained/))
- `xhigh`: 10,000 thinking tokens (community sources, unverified)
- `max`: 20,000 thinking tokens (community sources, unverified)

Token-budget halving (xhigh → medium) is approximately a 5x reduction in thinking tokens. Verbosity reduction is not 1:1 with thinking-token reduction (output tokens are different from thinking tokens), but the empirical relationship is: lower effort → less self-reflection → tighter output.

### Quality cost

Anthropic's April 23 postmortem confirms the verbosity-prompt cost was 3% on broad evaluations. The effort-level reduction cost is NOT directly documented in the same form, but inferable from:

> "Claude Opus 4.7 respects effort levels strictly, especially at the low end. At `low` and `medium`, the model scopes its work to what was asked rather than going above and beyond."

[Source: Anthropic Claude 4 Best Practices, "Calibrating effort and thinking depth" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)

**Synthesis:** Lowering reviewer + security-reviewer from xhigh to medium is the Anthropic-recommended action when the role is synthesis-and-validation (which is exactly the lz-advisor reviewer role per CONTEXT.md). The intelligence cost is proportional to the role mismatch — for synthesis tasks, medium is correctly-sized; for exploration tasks, medium is undersized. **Lz-advisor reviewer is a synthesis task.** The risk: code-quality assessment may miss subtle bugs that xhigh's deeper exploration would catch. Mitigation: smoke fixtures + UAT replay would catch this empirically.

### Recommendation: Candidate B = drop reviewer + security-reviewer to `effort: medium`

Rationale:
1. Anthropic explicitly recommends medium for "cost-sensitive use cases that need to reduce token usage while trading off intelligence."
2. Reviewer + security-reviewer roles per CONTEXT.md are synthesis-of-packaged-findings, not exploration.
3. Plan 07-05's Class-2 escalation hook handles the hard cases (the executor pre-empts and re-invokes); base-case reviewer doesn't need xhigh for the synthesis pass.
4. Lower effort directly addresses the verbosity root cause; works with the model rather than against it.

Risk: code-quality recall may decline relative to xhigh. Mitigation: empirical UAT to compare medium vs xhigh on representative findings; revert to xhigh if recall regresses materially.

---

## Structural alternatives — 5 candidates ranked

### Candidate A: Fragment-Grammar Output Template (RECOMMENDED — primary)

**Mechanism:** Replace the prose sub-cap budgets in `agents/reviewer.md` and `agents/security-reviewer.md` with an explicit one-line-per-finding output template, modeled on caveman-review:

```
Format: <file>:<line>: <severity>: <problem>. <fix>.
Severity prefixes: crit: / imp: / sug: / q: (genuine question only)

Examples:
src/auth.ts:42: crit: user can be null after .find(). Add guard before .email.
src/api.ts:118: imp: pool not closed on error path. Add try/finally.
src/utils.ts:7: q: why duplicate .trim() here?

After all findings, emit ### Cross-Cutting Patterns (or ### Threat Patterns) with one to three SHORT sentences (no per-sentence cap; aim for under 60 words total).
After Cross-Cutting Patterns, optionally emit ### Missed surfaces with one short sentence (under 25 words).
```

**Expected effectiveness:** HIGH (anchored in caveman's empirical 65% mean output reduction on Sonnet 4 / Opus 4.6; technique transfer to Opus 4.7 needs UAT confirmation).

**Complexity:** MEDIUM. Requires:
- Rewrite `agents/reviewer.md` `## Output Constraint` section (~80 lines of prose replaced with ~40 lines of template + DROP/KEEP lists + 3 worked examples).
- Mirror edit to `agents/security-reviewer.md`.
- Update `D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` to detect new shape (line-by-line per-finding word counts, not section-aware budgets).
- New worked examples need to be representative of what the empirical UAT replay produces — ideally extracted FROM the empirical output and condensed.

**Risk:** Low-MEDIUM. Risk: agent emits the template literally without filling it in (e.g., emits `<problem>` placeholder). Mitigation: positive examples + drop-list naming the placeholder concern. Risk: smoke fixture parser becomes complex (per-line shape detection vs section-block shape detection); mitigation: simpler parser since one-line-per-finding eliminates sub-section nesting.

**Byte-identical-canon implications:** This change is in `agents/*.md` files only — those are NOT part of the 4 SKILL.md byte-identical canon (`<context_trust_contract>`, `<orient_exploration_ranking>`). No canon disruption.

**Compatibility with locked decisions:**
- D-03 phrasing style: passes (no new ALL-CAPS imperatives; positive-framed template).
- D-04 effort levels: independent (composes with effort change in Candidate B).
- D-04 reviewer tools: passes (`["Read", "Glob"]` unchanged).
- Plan 07-05 Class-2 escalation: passes (`<verify_request>` block emission stays in `### Findings` per existing rule).
- Plan 07-02 Hedge Marker Discipline: passes (Hedge frame `Unresolved hedge: <X>. Verify <Y> before/after committing.` fits the per-finding template — emit as the entry's `<fix>` clause when correctness-affecting).

**Empirical anchor:**
- Caveman's `D:\projects\JuliusBrussee\caveman\benchmarks\run.py` lines 271-285 (10-prompt × 3-trial run, 65% mean output token reduction on `claude-sonnet-4-20250514` and `claude-opus-4-6` per evals/snapshots/results.json).
- arXiv 2604.00025 (Brevity Constraints Reverse Performance Hierarchies, March 2026) — referenced in caveman README; cited as evidence that brevity constraints can improve accuracy by 26pp on certain benchmarks. [Note: paper URL `arxiv.org/abs/2604.00025` returned no validated metadata in this research session; cite with `[unverified citation]` until directly inspected.]

**Sources for this candidate:**
- `D:\projects\JuliusBrussee\caveman\skills\caveman-review\SKILL.md` (the direct analogue — output format, drop/keep lists, worked examples, auto-clarity).
- `D:\projects\JuliusBrussee\caveman\agents\cavecrew-reviewer.md` (agent-frontmatter equivalent — output template inside agent prompt, severity table, boundaries).
- `D:\projects\JuliusBrussee\caveman\rules\caveman-activate.md` (the canonical 15-line activation rule — proves the pattern works in minimal prose).
- `D:\projects\JuliusBrussee\caveman\README.md` lines 270-285 (empirical benchmark table — Sonnet 4 model + 65% average reduction).

---

### Candidate B: Effort de-escalation (RECOMMENDED — secondary, composes with A)

**Mechanism:** Drop `effort: xhigh` to `effort: medium` for `agents/reviewer.md` and `agents/security-reviewer.md`. Keep `effort: high` for `agents/advisor.md` (already passing).

**Frontmatter change:**
```diff
 ---
 name: reviewer
 model: opus
 color: cyan
-effort: xhigh
+effort: medium
 tools: ["Read", "Glob"]
 maxTurns: 3
 ---
```

**Expected effectiveness:** HIGH. xhigh is "by-design verbose"; lower effort scopes work to what was asked. Per Anthropic Best Practices, medium is the right level for "cost-sensitive use cases that need to reduce token usage while trading off intelligence" — exactly the situation here.

**Complexity:** LOW. Single-line YAML change in two agent files.

**Risk:** MEDIUM. Code-quality recall may decline if synthesis-task reviewer needs xhigh-level reasoning. Mitigation:
- UAT replay to compare medium vs xhigh on representative findings.
- Smoke fixtures detect quality regression (DEF-response-structure.sh F slot already gates section-presence).
- If recall regresses materially, revert to `effort: high` (intermediate value not yet tested empirically) instead of all the way back to xhigh.

**Byte-identical-canon implications:** None. Frontmatter change.

**Compatibility with locked decisions:**
- CONTEXT.md D-04 explicitly named `effort: xhigh` for reviewer + security-reviewer. **This candidate proposes to OVERRIDE that decision.** Justification: D-04 was made before Plan 07-04's empirical regression was visible (Plan 07-04 SUMMARY.md predates the empirical measurement; the vacuous-pass extraction defect masked the regression). D-04's rationale was "Opus 4.7 escalation aligns with quick-260417-lhe assessment"; the empirical evidence now shows xhigh produces verbose justification chains that miss the budget. **D-04 should be re-opened in a CONTEXT.md amendment rather than violated silently.**

**Empirical anchor:**
- Anthropic Claude 4 Best Practices "Calibrating effort and thinking depth" section directly recommends medium for cost-sensitive synthesis tasks.
- April 23 postmortem on verbosity-prompt cost suggests effort calibration is the preferred lever over prose-imposed verbosity controls.

**Sources for this candidate:**
- [Anthropic Claude 4 Best Practices, "Calibrating effort and thinking depth"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) (HIGH).
- [Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortec) (HIGH).
- [allthings.how Opus 4.7 xhigh effort guide](https://allthings.how/claude-opus-4-7-xhigh-effort-level-explained/) (community, MEDIUM).

---

### Candidate C: Hard-rules layer with worked compliance example

**Mechanism:** Add an ALL-CAPS imperative at the top of `## Output Constraint` in reviewer.md and security-reviewer.md, followed by a worked 296-word compliant response (showing what 296w of Findings + CCP + Missed surfaces actually looks like). Format:

```
## Output Constraint

CRITICAL: TOTAL RESPONSE <=300 WORDS. NON-NEGOTIABLE.

The 300-word total is a hard rule. If your draft exceeds 300 words, REWRITE before responding. Do not emit responses over 300 words. The smoke fixture <D-reviewer-budget.sh> rejects over-budget responses.

Worked example (296 words; the empirical target):
[296-word example showing 5 findings + CCP + Missed surfaces, calibrated to representative input]
```

**Expected effectiveness:** MEDIUM. Anthropic's April 16 hard-rule was simpler ("<=100 words unless...") and reverted because it cost 3% on coding evals. This variant adds a worked example, which Anthropic Best Practices says is more effective than hedge-prose ("if too long, compress"). The intelligence cost SHOULD be lower than the April 16 instruction because the worked example shows the agent what to emit rather than just bounding what NOT to emit.

**Complexity:** MEDIUM. Requires:
- Calibrating a representative 296-word response that covers Findings + CCP + Missed surfaces.
- Adding to both agent files.
- ALL-CAPS layer crosses the D-03 phrasing-style boundary (currently reserved for safety-critical; word-budget is not safety-critical). **CONTEXT.md amendment needed to unlock this candidate.**

**Risk:** HIGH. Anthropic explicitly documented the intelligence cost of length imperatives. Even with the worked example, this is the "hard-rules layer" deferred under CONTEXT.md. The 3% coding-quality cost may be the worst-case; the variant with worked example may show <3%. Empirical UAT required.

**Byte-identical-canon implications:** None.

**Compatibility with locked decisions:**
- **CONFLICTS with D-03 phrasing style** (ALL-CAPS for safety-critical only).
- Conflicts with CONTEXT.md deferred-ideas: "Hard-rules layer for word-budget — deferred unless 0.10.0 cycle confirms hybrid is insufficient. Anthropic's Apr 2026 ablation showed ~3% coding-quality cost from cap addition." The "0.10.0 cycle confirms hybrid is insufficient" condition is now empirically met. **D-03 amendment needed to allow this candidate.**

**Empirical anchor:**
- [Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem) — direct measurement of intelligence cost, ~3% on broad evaluations.

**Sources:**
- [Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem) (HIGH).
- [PromptHub Claude 4 system prompt analysis](https://www.prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt) (community MEDIUM, cited in CONTEXT.md anchors).

---

### Candidate D: Pre-emission self-check / self-trim block

**Mechanism:** Add a directive to the END of `## Output Constraint` in reviewer.md and security-reviewer.md instructing the agent to count words and rewrite if over-budget:

```
Before emitting your final response, count the words in your draft (excluding code blocks). If over 300 words, rewrite to fit under 300. Do this once; if your second draft is still over, prioritize Findings, drop Missed surfaces, then trim CCP/Threat Patterns to its minimum (one sentence).
```

**Expected effectiveness:** LOW-MEDIUM. Community sources document self-check as effective for content-correctness but mixed for length. Risk: the agent counts words inaccurately and emits an over-budget response asserting it's under-budget.

**Complexity:** LOW. Single paragraph addition.

**Risk:** MEDIUM. Self-check requires the agent to perform meta-cognition during emission. Opus 4.7's literal interpretation may execute the rewrite step (good) or may execute it inaccurately (bad). Empirical evidence on self-trim for Sonnet 4.6 / Opus 4.7 specifically is not present in the research sources.

**Byte-identical-canon implications:** None.

**Compatibility with locked decisions:** Passes all D-03 / D-04 / Plan 07-05 / Plan 07-02 constraints.

**Sources:**
- [PromptBuilder Claude Prompt Engineering Best Practices 2026](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026) (community LOW-MEDIUM).
- [Anthropic Claude 4 Best Practices, "Leverage thinking" section](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) — documents self-check as effective for content-correctness (HIGH but indirect for length).

---

### Candidate E: Section-by-section emit with per-section length signal

**Mechanism:** Add per-section length signals so the agent emits each section with the budget visible at emission time. E.g., before each section header in the agent's output template:

```
### Findings (target: 5 findings × ~40 words each = ~200 words)

[entries here]

### Cross-Cutting Patterns (target: ~60 words; aim for under 80)

[CCP body here]

### Missed surfaces (target: ~20 words; OPTIONAL)

[Missed surfaces body here]
```

**Expected effectiveness:** LOW-MEDIUM. The signal is in the section header which the agent emits and immediately follows. Whether the agent uses it as a budget cue or treats it as decoration is uncertain.

**Complexity:** LOW.

**Risk:** LOW-MEDIUM. The smoke fixture parser must tolerate the new section-header text format. Worst-case: no behavior change, agent ignores the signal.

**Byte-identical-canon implications:** None.

**Compatibility with locked decisions:** Passes all D-03 / D-04 constraints.

**Sources:**
- No direct anchor; speculative pattern based on community signals about prompt-style-matches-output and explicit-budget-visibility.

---

## Empirical baselines from comparable plugins

### caveman (DIRECT analogue, comprehensive)

See section "Reference Implementation: caveman" above. **Empirical: 65% mean output reduction on Sonnet 4 / Opus 4.6, range 22-87%, 10-prompt benchmark.** Model gap: no Opus 4.7 measurement.

### Other published reviewer-style agents

Searched for: Claude Code marketplace plugins implementing reviewer or code-review style agents with documented word-budget compliance. **Result: caveman-review and cavecrew-reviewer are the only directly comparable patterns.** Anthropic's official `code-review` plugin (cited in lz-advisor's `plugins/lz-advisor/CLAUDE.md`) uses a multi-model agent-spawning pattern (Haiku + Sonnet) but does not document an explicit word-budget. Lz-advisor's own DEF-response-structure.sh is the closest other pattern (advisor 100w cap; pre-existed Plan 07-04).

**Open question:** Are there other published reviewer-style plugins with empirical word-budget compliance data? **Could not be answered from web research within reasonable depth.** Suggest: empirical UAT on lz-advisor reviewer + security-reviewer with Candidate A applied is the load-bearing data point; published comparables are not the priority.

---

## Compatibility matrix: candidates × locked decisions

| Constraint | A: Fragment Grammar | B: Effort Medium | C: Hard-Rules | D: Self-Trim | E: Per-Section Signal |
|------------|---------------------|------------------|----------------|---------------|------------------------|
| D-03 phrasing (no ALL-CAPS for non-safety) | PASS | PASS (no prose change) | **CONFLICT** | PASS | PASS |
| D-04 effort xhigh (current) | INDEPENDENT | **OVERRIDES** (CONTEXT.md amendment needed) | PASS | PASS | PASS |
| D-04 reviewer tools `[Read, Glob]` | PASS | PASS | PASS | PASS | PASS |
| Plan 07-05 Class-2 escalation `<verify_request>` | PASS (compose in `### Findings` block) | PASS | PASS | PASS | PASS |
| Plan 07-02 Hedge Marker Discipline | PASS (Hedge frame fits per-line shape) | PASS | PASS | PASS | PASS |
| Byte-identical canon (4 SKILL.md `<context_trust_contract>`) | PASS (touches agents/, not skills/) | PASS | PASS | PASS | PASS |
| Plugin native components only (no API features) | PASS | PASS | PASS | PASS | PASS |
| ASCII-only project rule | **REQUIRES emoji-to-ASCII adaptation** | PASS | PASS | PASS | PASS |
| Smoke fixture parser compatibility | **Parser update required** | PASS | Parser update for new ALL-CAPS prefix | PASS | Minor parser update |
| Anthropic Best Practices | RECOMMENDED (positive examples + structural format) | RECOMMENDED (medium for synthesis tasks) | OPPOSED (April 16 instruction reverted at 3% cost) | NEUTRAL (self-check effective for correctness, untested for length) | NEUTRAL |

---

## Recommendation: Candidate A + Candidate B (compose, not exclusive)

### Primary: Candidate A (Fragment-Grammar Output Template)

**Land first.** The empirical anchor is strong (65% reduction on Sonnet 4 / Opus 4.6 across 10 prompts). The structural mechanism addresses the root cause — Plan 07-04's per-section caps don't compose to the aggregate cap; an emit template binds shape rather than describing budget. Anthropic Best Practices "tell Claude what to do" + "match prompt style to output" + "use structured XML / template format indicators" all converge.

**Deliverables (suggested for downstream planning):**
1. Rewrite `agents/reviewer.md` `## Output Constraint` and `## Final Response Discipline` sections.
2. Mirror to `agents/security-reviewer.md` (use `### Threat Patterns` instead of `### Cross-Cutting Patterns`).
3. Update `D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` to detect the new shape (per-line entry shape: `<file>:<line>: <severity>: <problem>. <fix>.`).
4. New representative worked example for each agent (296-word target, calibrated against the canonical Compodoc + Storybook scenario).
5. Smoke-fixture re-runs to verify enforcement on plugin 0.12.0.

### Secondary: Candidate B (Effort Medium)

**Land in tandem with A** OR after A's empirical validation. Anthropic's documented guidance is direct: medium effort for synthesis-tasks-with-cost-sensitivity. Lz-advisor reviewer + security-reviewer fit this profile per CONTEXT.md (synthesis of executor-packaged findings + Plan 07-05 Class-2 escalation hook handles hard cases via re-invocation).

**Deliverables:**
1. CONTEXT.md amendment overriding D-04 from `effort: xhigh` to `effort: medium` for reviewer + security-reviewer.
2. Frontmatter change in both agent files.
3. Empirical UAT to confirm code-quality recall doesn't regress materially.

### Order of operations

Recommend Candidate A first, then Candidate B if A alone doesn't reach the 300w cap. Rationale:
- A is the structural change; B is the model-tuning change.
- A is reversible (revert to prose budget if catastrophic).
- B requires a CONTEXT.md amendment (D-04 was a locked decision); spending the amendment cost only after A's empirical results are visible is conservative.
- If A alone reaches the 300w cap empirically, B may not be necessary (saves coding-quality cost).
- If A + B together over-shoot the cap (well under 300w), can revert B to xhigh while keeping A.

### Deferred (do not ship in Phase 7 follow-up gap closure)

- Candidate C (hard-rules layer): has 3% intelligence cost; D-03 amendment required; wait for A + B empirical results.
- Candidate D (self-trim): empirically untested for length on Opus 4.7; lower priority.
- Candidate E (per-section signal): speculative; no anchor.
- Model downgrade to Haiku (caveman pattern): out of scope (architectural; new phase + UAT cycle + marketplace re-publishing).

---

## Open questions — flagged for empirical UAT to resolve

1. **Does caveman's 65% reduction transfer from Sonnet 4 / Opus 4.6 to Opus 4.7?** Caveman has no Opus 4.7 benchmark data. The new tokenizer maps text to 1.0-1.35x more tokens than 4.6; verbosity profile differs. **Resolution: UAT replay on plugin 0.12.0 with Candidate A applied.**

2. **Does effort: medium produce material code-quality recall regression on reviewer + security-reviewer?** Anthropic recommends medium for cost-sensitive synthesis tasks; lz-advisor reviewer fits the profile but the empirical recall measurement requires UAT. **Resolution: parallel UAT runs on plugin 0.12.0 with Candidates A+B applied vs Candidate A alone.**

3. **Does the fragment-grammar pattern compose with Plan 07-05 Class-2 escalation hook structurally?** The `<verify_request>` block emit lives inside `### Findings`. The new template emits one line per finding. Where does `<verify_request>` go in a one-line shape? **Resolution: design choice in downstream plan — recommend `<verify_request>` becomes an additional line trailing the affected finding (`<file>:<line>: <severity>: <problem>. <fix>.\n<verify_request question="..." class="2" anchor_target="..."/>`), parsed by the same Phase 3 detection logic.**

4. **Does ASCII severity prefix (`crit:` / `imp:` / `sug:` / `q:`) read as well as caveman's emoji prefix on Opus 4.7?** Caveman uses single Unicode glyph; lz-advisor cannot. ASCII prefixes are 4-5 chars; one-token-budget impact is similar. **Resolution: UAT replay measures finding-density and budget compliance on the ASCII variant; if material difference vs caveman empirical baseline, investigate.**

5. **Does the worked-example pattern need to be calibrated per UAT scenario, or is one canonical example enough?** Anthropic Best Practices recommend 3-5 examples. caveman uses 3 worked-example pairs. **Resolution: ship 3 worked-example pairs in agent prompt; calibrate against representative inputs from Phase 6 / Phase 7 UAT scenarios.**

6. **Does the absence of an aggregate cap in the new template create a regression risk?** Removing the 300w aggregate from the prose may allow over-budget output via "just one more finding" drift. **Resolution: smoke fixture asserts both per-line shape AND aggregate ≤300w; the smoke is the empirical gate even if the prose doesn't say it.**

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The 65% empirical reduction on caveman benchmarks (Sonnet 4 / Opus 4.6) transfers to Opus 4.7 with at least 30-40% relative reduction (enough to bring 396w → under 300w). | "Reference Implementation: caveman" + "Recommendation" | Candidate A may not reach the cap; would need to combine with Candidate B (effort de-escalation). UAT replay catches this. |
| A2 | Lowering reviewer + security-reviewer to `effort: medium` preserves enough code-quality recall to remain useful. | "Effort-level tradeoff" | Quality regression; mitigation via empirical UAT comparison. Revert path: `effort: high` (intermediate value). |
| A3 | The fragment-grammar pattern composes with Plan 07-05 `<verify_request>` block emission via a per-line trailing block. | Open Question 3 | Compatibility error; would need design iteration in downstream plan. |
| A4 | Anthropic's "report every issue, do not filter" recommendation for code-review harnesses applies to lz-advisor's reviewer (which is a synthesis task on packaged findings, not exploration). | "Anthropic-Recommended Techniques #6" | Possible mismatch — lz-advisor's review skill packages 3-5 findings; reviewer validates them. The "report every issue" guidance applies more to discovery-stage reviewers. The synthesis stage does need filtering by severity. **Reconcile: keep Plan 07-04 prioritize-by-severity; add fragment grammar to make EACH finding shorter, allowing more findings within the same budget.** |
| A5 | arXiv 2604.00025 (referenced by caveman README) confirms brevity constraints can improve accuracy. | "Reference Implementation: caveman: empirical baselines" | The paper URL was not directly fetched/verified in this research session. Treating as unverified anchor. Caveman's empirical benchmarks (65% mean reduction on 10 prompts × 3 trials) are the load-bearing evidence; the paper is supportive. |
| A6 | Anthropic-published `code-review` plugin's multi-model pattern does not document explicit word-budget compliance (research-search did not find one). | "Empirical baselines from comparable plugins" | If a comparable benchmark exists and was missed, the recommendation could be tuned by it. Confidence: MEDIUM (web search was thorough but not exhaustive). |

---

## Sources

### Primary (HIGH confidence)

- [Anthropic Claude 4 Best Practices (current docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) — comprehensive section-by-section official guidance. Sections referenced: "Response length and verbosity," "Calibrating effort and thinking depth," "Tool use triggering," "More literal instruction following," "Code review harnesses," "Control the format of responses," "Communication style and verbosity."
- [Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem) — direct quotes of the April 16 verbosity-reduction instruction, the April 20 reversion, the 3% intelligence cost ablation result.
- [Anthropic effort docs](https://platform.claude.com/docs/en/build-with-claude/effort) — effort levels low/medium/high/xhigh/max with Anthropic-recommended use cases.
- [Anthropic Opus 4.7 release notes](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7) — Opus 4.7 behavioral changes vs 4.6.

### Reference Implementation (HIGH confidence — locally verified)

- `D:\projects\JuliusBrussee\caveman\rules\caveman-activate.md` — 15-line activation rule (the canonical fragment-grammar pattern in minimal prose).
- `D:\projects\JuliusBrussee\caveman\skills\caveman\SKILL.md` — main skill: persistence directive, drop/keep lists, intensity levels, auto-clarity carve-outs, worked examples.
- `D:\projects\JuliusBrussee\caveman\skills\caveman-review\SKILL.md` — DIRECT ANALOGUE to lz-advisor's reviewer/security-reviewer scenario.
- `D:\projects\JuliusBrussee\caveman\agents\cavecrew-reviewer.md` — DIRECT ANALOGUE to lz-advisor's reviewer agent (frontmatter, severity table, output template, boundaries).
- `D:\projects\JuliusBrussee\caveman\README.md` — empirical benchmark table (lines 270-285): 65% mean output reduction on Sonnet 4, range 22-87% across 10 prompts.
- `D:\projects\JuliusBrussee\caveman\benchmarks\run.py` — benchmark methodology (Anthropic API, 3 trials × 10 prompts × 2 modes).
- `D:\projects\JuliusBrussee\caveman\evals\snapshots\results.json` — full eval snapshot showing actual generated outputs by mode (`__baseline__`, `__terse__`, `caveman`); model: `claude-opus-4-6`.
- `D:\projects\JuliusBrussee\caveman\evals\README.md` — three-arm eval methodology (baseline / terse / skill) addressing measurement isolation.

### Secondary (MEDIUM confidence — verified against authoritative source)

- [claude.com Best practices for using Claude Opus 4.7 with Claude Code](https://claude.com/blog/best-practices-for-using-claude-opus-4-7-with-claude-code) — Anthropic blog companion to the API docs.
- [PromptHub Claude 4 system prompt analysis](https://www.prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt) — third-party reverse-engineering of Claude Code system prompts, cited in CONTEXT.md anchors.
- [zenvanriel.com Claude Opus 4.7 Complete Guide for AI Engineers](https://zenvanriel.com/ai-engineer-blog/claude-opus-4-7-complete-guide-ai-engineers/) — third-party Opus 4.7 prompting guide.

### Tertiary (LOW-MEDIUM confidence — community sources, partial verification)

- [keepmyprompts.com Claude Opus 4.7 Prompting Guide: Breaking Changes](https://www.keepmyprompts.com/en/blog/claude-opus-4-7-prompting-guide-whats-changed) — community Opus 4.7 prompting guide; cited for hedge-phrase weakness on Opus 4.7.
- [claudefa.st Opus 4.7 Best Practices](https://claudefa.st/blog/guide/development/opus-4-7-best-practices) — community guide; cited for xhigh thinking-budget verbose-self-reflection observation.
- [allthings.how Claude Opus 4.7 xhigh Effort Level Explained](https://allthings.how/claude-opus-4-7-xhigh-effort-level-explained/) — community guide; cited for thinking-token budget per effort level.
- [PromptBuilder Claude Prompt Engineering Best Practices 2026](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026) — community guide; cited for self-check pre-emission pattern.
- [NeuraPulse Best Prompts for Anthropic Claude AI](https://neuraplus-ai.github.io/blog/best-prompts-for-anthropic-claude-ai.html) — community guide; cited for "state your constraints as rules" pattern.
- [ibuildwith.ai Effort, Thinking, and How Claude Opus 4.7 Changed the Rules](https://www.ibuildwith.ai/blog/effort-thinking-opus-4-7-changed-the-rules/) — community Opus 4.7 effort/thinking guide.
- [sider.ai 20 System-Prompt Tweaks for Claude Sonnet 4.5 That Actually Enforce Style](https://sider.ai/blog/ai-tools/system-prompt-tweaks-for-claude-sonnet-4_5-that-actually-enforce-style-without-breaking-your-brain) — community Sonnet 4.5 style-enforcement patterns.
- [indiehackers.com Complete Guide to Writing Agent System Prompts](https://www.indiehackers.com/post/the-complete-guide-to-writing-agent-system-prompts-lessons-from-reverse-engineering-claude-code-6e18d54294) — third-party reverse-engineering of Claude Code agent prompts.

### Cited but not directly verified in this session

- arXiv 2604.00025 "Brevity Constraints Reverse Performance Hierarchies in Language Models" (March 2026) — referenced in caveman README. URL not fetched in this research session; treating as unverified citation. The 26pp accuracy improvement claim is supportive context, not load-bearing.
- [Anthropic Cookbook crop tool](https://platform.claude.com/cookbook/multimodal-crop-tool) — not relevant to this research, listed in upstream Anthropic docs.

---

## Confidence breakdown

| Area | Level | Reason |
|------|-------|--------|
| Anthropic-recommended techniques | HIGH | Direct quotes from Anthropic Best Practices docs + April 23 postmortem; multiple cross-references. |
| Caveman empirical baseline | HIGH for Sonnet 4 / Opus 4.6; MEDIUM for transfer to Opus 4.7 | Caveman benchmark methodology is sound (10 prompts × 3 trials × Anthropic API); model gap means Opus 4.7 transfer is by analogy not direct measurement. |
| Effort-level tradeoff (Candidate B) | HIGH for "medium scopes work to what was asked"; MEDIUM for "lz-advisor reviewer is a synthesis task that fits medium" | Anthropic explicitly recommends medium for cost-sensitive synthesis; lz-advisor reviewer fits the profile per CONTEXT.md but recall hasn't been measured at medium yet. |
| Fragment grammar effectiveness on Opus 4.7 | MEDIUM | Pattern works empirically on Sonnet 4 / Opus 4.6 (caveman benchmarks); transfer to Opus 4.7 inferred from Anthropic Best Practices "structured outputs" + "match prompt style to output." Not directly measured. |
| Per-section vs aggregate cap arithmetic incompatibility | HIGH | Direct math: 5×80 + 160 + 30 = 590 (or 250 + 160 + 30 = 440 if Findings is the aggregate); both exceed 300w aggregate. Not contestable. |
| Hard-rules layer 3% intelligence cost | HIGH | Direct citation from Anthropic April 23 postmortem. |

**Research date:** 2026-05-01

**Valid until:** 30 days for stable Anthropic guidance; 7 days for community sources on Opus 4.7 (rapidly evolving model). Re-check Anthropic docs and the April 23 postmortem if planning is delayed past 2026-05-30.

---

*Research complete. Downstream consumer: `gsd-planner` for Phase 7 follow-up gap-closure plan addressing word-budget regression.*
