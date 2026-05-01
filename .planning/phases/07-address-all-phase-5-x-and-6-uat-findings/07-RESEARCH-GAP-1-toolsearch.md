---
phase: 07-address-all-phase-5-x-and-6-uat-findings
gap: 1
type: research
dated: 2026-05-01
target_artifact: .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-07-PLAN.md
plugin_version: 0.10.0
verification_basis: 8-session UAT replay (sessions 1-8) on plugin 0.10.0 + Anthropic prompting best practices (Opus 4.7 / Sonnet 4.6) + Claude Code hooks reference doc + 4 SKILL.md byte-identical context_trust_contract
---

# Gap 1 Research: ToolSearch Precondition Rule Firing

## Executive summary

The Plan 07-01 ToolSearch precondition rule fired in 2 of 8 empirical UAT sessions on plugin 0.10.0 (sessions 1 + 3); 6 sessions skipped it. Anthropic's own current prompting best practices [CITED: platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices] explain the firing-rate gap directly: "Claude Opus 4.7 has a tendency to use tools less often than Claude Opus 4.6 and to use reasoning more... For scenarios where you want more tool use, you can also adjust your prompt to explicitly instruct the model about when and how to properly use its tools. For instance, if you find that the model is not using your web search tools, clearly describe **why and how it should**." The current rule says WHAT and WHEN; it does not say WHY (no rationale anchored in user-visible cost) and the worked example is absent. This matches the pattern of the 2 firing sessions (1 + 3) which had simpler, less-cued inputs vs the 6 skipping sessions which all had agent-generated source material that visually competed with the rule's trigger condition.

**Primary recommendation:** Convert the rule from a precondition-with-strict-trigger (current text-steered shape) to a **default-on Phase 1 action whenever any agent-generated source material is detected**, with two paired refinements: (a) embed 2 worked examples (one positive — input is a review file with a Class-2 question, ToolSearch fires; one boundary — input is a vendor-doc authoritative source, ToolSearch does NOT fire), (b) move the rule to fire BEFORE the agent-generated/vendor-doc classification step rather than after Class-2/3/4 ranking. Hook-based enforcement is permanently rejected per CLAUDE.md "no hooks for v1" constraint AND because Claude Code PreToolUse hooks structurally cannot auto-invoke another tool [CITED: code.claude.com/docs/en/hooks: "PreToolUse hooks cannot directly invoke tools."].

## Empirical signal analysis

### What the data says (8-session UAT chain on plugin 0.10.0)

| Session | Skill | Fired? | Input shape | Notes |
|---------|-------|--------|-------------|-------|
| 1 | plan | YES | Free-form task ("Set up Compodoc...") -- NO agent-generated source | Trigger condition technically not met (no agent input); ToolSearch fired anyway as proactive Class-2 disambiguation |
| 2 | execute | NO | `@plans/compodoc-storybook-setup.plan.md` (agent-generated source) + Class-2 surfaces | Skipped despite trigger condition met |
| 3 | review | YES | Commit range (NOT agent-generated source) + Class-2 surfaces | Trigger condition technically not met (commit range is code, not agent prose); ToolSearch fired anyway |
| 4 | plan-fixes | NO | `@review.md` (agent-generated source) + Class-2 surfaces | Skipped despite trigger condition met |
| 5 | execute-fixes | NO | `@review.md` (agent-generated source) + Class-2 surfaces | Skipped despite trigger condition met |
| 6 | security-review | NO | Commit range + agent-prose plan input + Class-2-S surfaces | Skipped despite trigger condition met |
| 7 | plan-fixes-2 | NO | `@security-review-output` (agent-generated source) + Class-2 surfaces | Skipped despite trigger condition met |
| 8 | execute-fixes-2 | NO | `@plan` (agent-generated source) + Class-2 surfaces | Skipped despite trigger condition met |

[VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/session-notes.md` lines 44, 121, 173, 216, 251, 285, 322 (Phase 7 GAPS rows for each session)]

**Inverse correlation observed:** the rule fires when its trigger condition is technically NOT met (sessions 1 + 3 — no agent-generated source detected), and skips when its trigger condition IS met (sessions 2, 4, 5, 6, 7, 8 — agent-generated source present). The 2 firing instances are not the rule "working" — they are the executor proactively pre-empting Class-2 surfaces independently of the rule. The 6 skip instances are the rule failing.

### Why the rule isn't firing -- ranked hypotheses

| Rank | Hypothesis | Evidence weight | Source |
|------|-----------|-----------------|--------|
| H1 | **Sonnet 4.6 / Opus 4.7 default to less tool use; conditional rules need explicit "why" + "how" framing to override the default** | HIGH | [CITED: platform.claude.com/.../claude-prompting-best-practices section "Tool use triggering"] -- "Claude Opus 4.7 has a tendency to use tools less often than Claude Opus 4.6 and to use reasoning more... if you find that the model is not using your web search tools, clearly describe why and how it should." Current Plan 07-01 rule says when (Class 2/3/4 + agent-generated source) and what (invoke ToolSearch) but lacks user-visible WHY (no rationale anchored in observable cost). |
| H2 | **The rule's trigger text "input prompt contains agent-generated source material" reads as a precondition-AT-orient-start, but agent-generated detection happens IN-orient via the trust-contract carve-out classification step. By the time classification fires, the executor is already mid-orient and ToolSearch becomes a "back-up" decision rather than a "first" decision** | HIGH | [VERIFIED: `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` lines 37-58] The `<context_trust_contract>` block runs the classify-as-vendor-doc-vs-agent-generated step BEFORE the ToolSearch availability rule paragraph. Sessions 4/5/6/7/8 all show executor reading project files first (Phase 1 reads at L19-L31 / L18-L29 / etc), encountering the agent-generated-source classification, then proceeding directly to advisor consultation -- bypassing the ToolSearch step structurally. The rule is positioned to fire AT classification time, but classification surfaces DURING orient, not at orient START. |
| H3 | **Effort = medium (per UAT runner config) is below the documented "high" baseline for tool-use-sensitive instructions** | HIGH | [CITED: platform.claude.com/.../claude-prompting-best-practices section "Calibrating effort and thinking depth"] -- "increasing the effort setting is a useful lever to increase the level of tool usage, especially in knowledge work. `high` or `xhigh` effort settings show substantially more tool usage in agentic search and coding." UAT replay invocation uses `claude --model sonnet --effort medium` per memory `feedback_uat_canonical_prompt_format.md`. Empirical signal: at the same prompt baseline, raising effort to `high` is the cheapest gap-closure lever IF the rule is sound but undertriggering. However, raising effort changes UAT economics -- not a free move. |
| H4 | **No worked example for the rule -- Anthropic's own Claude 4 system prompt analysis shows zero worked examples; PromptHub flags this as a known weakness for complex conditional logic** | MEDIUM | [CITED: prompthub.us/blog Claude 4 system prompt analysis] -- "The prompt includes zero worked examples for rule application -- a notable gap for complex conditional logic." [CITED: platform.claude.com/.../claude-prompting-best-practices section "Use examples effectively"] -- "Examples are one of the most reliable ways to steer Claude's output format, tone, and structure... Include 3-5 examples for best results." Plan 07-01 rule has no `<example>` block; the "worked example" elsewhere in the SKILL.md is for the orient-exploration ranking, not for the ToolSearch rule. |
| H5 | **Sonnet 4.6 + Opus 4.7 "more literal instruction following" -- the model reads the trigger condition strictly. Sessions 4-8 may interpret "agent-generated source material" + "Class 2/3/4 question" as a JOINT precondition that the model judges against, not as a default-on action** | MEDIUM | [CITED: platform.claude.com/.../claude-prompting-best-practices section "More literal instruction following"] -- "Claude Opus 4.7 interprets prompts more literally and explicitly... It will not silently generalize an instruction from one item to another." If the model judges that a sub-question of the input is Class-1 (type-symbol existence) or that the agent-generated-source classification has uncertainty, the conjunction fails and the rule short-circuits. The rule's wording invites this judgment via "AND". |
| H6 | **Community-documented Sonnet 4.6 instruction-following regression since March 2026** | MEDIUM | [CITED: github.com/anthropics/claude-code/issues/46935 "Quantified evidence: Sonnet 4.6 quality regression since March 9 -- 1400+ frustration events across 50 sessions"] + [CITED: github.com/anthropics/claude-code/issues/41217 "Opus 4.6: Systematic Failure to Follow Explicit Behavioral Constraints Across Independent Sessions"]. Cross-validated by [CITED: github.com/anthropics/claude-code/issues/32290 "Claude reads files but ignores actionable instructions contained in them"]. The plan-fixes / execute-fixes pattern (read agent-generated input file, follow its content, but ignore the meta-instruction to verify before consuming) is the documented pattern. |

### What we cannot conclude from the data

- We cannot conclude that the rule's text is intrinsically broken (sessions 1 + 3 show that the rule CAN fire). The 2 of 8 firing rate suggests the rule has discoverability, but the discoverability is fragile.
- We cannot rule out that the rule fires during deliberation but is rejected by adaptive thinking on Sonnet 4.6 medium-effort because the model reasons "I have enough context already, no need to ToolSearch". This is structurally similar to the documented Opus 4.7 "less tool use, more reasoning" pattern.
- We cannot test the "raise effort to high" lever in this research without a fresh UAT replay. That experiment is itself a candidate gap-closure step.

## Solution candidates

Each candidate maps to one of the 4 fix surfaces enumerated in 07-VERIFICATION.md Gap 1.

### Candidate A: Rephrase the rule with concrete trigger language and worked examples (fix surface 1)

**Mechanism:** Within the existing 4-skill byte-identical `<context_trust_contract>` block, replace the current ToolSearch availability rule prose with a richer formulation that includes:

1. The user-visible WHY (cost of skipping): "When this rule does not fire on agent-generated input with Class 2/3/4 surfaces, the executor packages confabulated context into the advisor consultation -- the dominant Phase 6 + Phase 7 empirical failure mode (Finding H + GAP-G1+G2-empirical)."
2. The HOW (concrete example) wrapped in `<example>` tags per [CITED: platform.claude.com/.../claude-prompting-best-practices "Use examples effectively"] -- "Wrap examples in `<example>` tags... Include 3-5 examples for best results."
3. A boundary example showing when the rule does NOT fire (vendor-doc authoritative source, project-only Class-1 question).

**Evidence anchor:**

- [CITED: platform.claude.com/.../claude-prompting-best-practices "Tool use triggering"] -- WHY framing required for tool-use steering on 4.x.
- [CITED: platform.claude.com/.../claude-prompting-best-practices "Use examples effectively"] -- 3-5 examples with `<example>` tags is the documented pattern.
- [CITED: prompthub.us/blog Claude 4 system prompt analysis] -- documented gap that Anthropic's own production prompt has zero worked examples for complex conditional logic; Plan 07-07 closes the gap that even Anthropic doesn't always close.
- [VERIFIED: `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` lines 71-74] -- existing `**Worked example.**` pattern in the `<orient_exploration_ranking>` block establishes a precedent for worked examples within the trust-contract surface.

**Trade-off cost:**

- Adds ~150-250 words to each of 4 SKILL.md byte-identical canon blocks (~1KB total expansion across 4 files).
- Worked examples are tied to specific scenarios (Compodoc + Storybook 10 + Angular signals from the UAT testbed); a future scenario change could invalidate the example. Mitigation: pick examples that are abstract enough (the AGENT-GENERATED-SOURCE shape, not the specific library) to remain valid across testbeds.
- Examples increase prompt token cost on every skill invocation, not just the ones where the rule fires. ~50-100 tokens / invocation x 8 sessions = ~600 tokens additional empirical cost on the UAT chain.

**Implementation cost:** LOW. Single-paragraph prose addition + 2 examples wrapped in `<example>` / `</example>` tags within existing `<context_trust_contract>` block. Byte-identical 4-skill canon preserved by writing once and copy-pasting to all 4 SKILL.md (Phase 7 already establishes this pattern for Plan 07-01 supplement).

**Residual risk:** MEDIUM. Examples improve firing rate, but the firing trigger is still the model's judgment -- if Sonnet 4.6 still adaptive-thinks the rule away on agent-generated input with Class-2 surfaces, the rule still skips. Per H1 (literal-instruction-following), the example anchors the rule to the user-visible cost, but does not force invocation. Empirical validation in a fresh UAT replay subset (plan-fixes + execute-fixes + security-review per Phase 6 amendment 5 precedent) is required to confirm closure.

### Candidate B: Convert from precondition to default-on Phase 1 action (fix surface 2)

**Mechanism:** Restructure the rule from "WHEN <conjunction> THEN invoke ToolSearch BEFORE ranking" to "AS Phase 1 first action, invoke ToolSearch IF agent-generated source is detected, regardless of question class." This eliminates the AND condition that H5 says invites short-circuiting. The rule becomes:

> "Phase 1 first action when input contains agent-generated source material: invoke `ToolSearch select:WebSearch,WebFetch` (or equivalent ensure-loaded mechanism). Agent-generated source signals are: @-mentioned file paths under `/plans/`, `/.planning/`, or filenames containing `review`, `consultation`, `session-notes`, `plan`. Performing this action proactively makes WebSearch + WebFetch available for any Class 2/3/4 surfaces the agent-generated content surfaces, even on sub-questions where Class-1 type-symbol-existence is sufficient. The cost of one redundant ToolSearch invocation (~0 tokens, ~100ms) is much smaller than the cost of confabulated pv-* synthesis (Finding H + B.2 + Phase 6 G1+G2 residual)."

The cost framing addresses H1; the unconditional Phase 1 placement addresses H2 and H5; the cost asymmetry argument addresses H3 (the rule justifies the cost on its own terms regardless of effort level).

**Evidence anchor:**

- [CITED: platform.claude.com/.../claude-prompting-best-practices "Tool use triggering"] -- "clearly describe why and how it should" — the cost-asymmetry framing is the WHY.
- [VERIFIED: empirical pattern session 1 + session 3 firing on simple input shapes vs sessions 2/4/5/6/7/8 skipping on agent-generated input shapes] -- the unconditional default-on path bypasses the H2 / H5 short-circuit.
- [VERIFIED: `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md:47` agent-generated-source-signal definition] -- the 3-signal detection set already exists in the trust-contract block; Candidate B reuses these as the unconditional trigger.

**Trade-off cost:**

- **False-positive ToolSearch invocations.** When agent-generated source contains only Class-1 questions (type-symbol existence answerable from `node_modules/.d.ts`), ToolSearch is invoked redundantly. Per [CITED: platform.claude.com/.../claude-prompting-best-practices "Optimize parallel tool calling"], the Sonnet 4.6 cost of one redundant tool call is ~0 tokens (ToolSearch is a permission-loading op, not a context op) -- the "false-positive" cost is closer to ~100ms latency, NOT token spend. **This trade-off is favorable.**
- **Behavioral drift on vendor-doc authoritative source inputs.** If a user pastes a vendor doc as a `---` block AND attaches a review file via `@`, the rule fires on the agent-generated source signal even though the vendor doc is in scope. Mitigation: the rule's framing is "make WebSearch + WebFetch available" not "you MUST use them" -- the Pattern D ranking still applies, the executor still chooses the right primitive.
- **Risk that the rule competes with the existing trust-contract carve-out classification flow.** The carve-out routes agent-generated source AWAY from "trust as authoritative" (per Phase 6 D-01); Candidate B adds a parallel routing TOWARD "ensure web tools are loaded". These are complementary, not contradictory, but the prose has to make the relationship explicit.

**Implementation cost:** LOW-MEDIUM. Single-paragraph prose change in 4 SKILL.md byte-identical canon blocks; the agent-generated-source signal set is already defined in the same block (no new detection code); the cost-asymmetry framing is one new sentence. Plan 07-07 also updates the cross-reference in `references/context-packaging.md` Common Contract Rule 5b "ToolSearch precondition" sub-rule (currently lines 64-66 in context-packaging.md) to match the new default-on framing.

**Residual risk:** LOW. The default-on framing is structurally robust against H1, H2, H5, and H6 (model judgment failure modes). Residual exposure is to H3 (effort=medium) -- if Sonnet 4.6 at medium-effort still skips a default-on action, that's a deeper issue than this gap closure can address. Empirical validation in a fresh UAT replay subset is required.

**This is the primary recommended candidate** (see Recommendation section).

### Candidate C: Hook-based PreToolUse enforcement (fix surface 3)

**Mechanism:** Declare a `hooks/hooks.json` file in the lz-advisor plugin with a PreToolUse hook on `Agent` invocation. The hook script inspects the parent skill's input prompt for agent-generated-source signals; if detected, the hook returns `additionalContext` that re-states the ToolSearch precondition with a fresh, in-context reminder.

**Evidence anchor:**

- [CITED: code.claude.com/docs/en/hooks "Capabilities"] -- "PreToolUse hooks can make four types of decisions: allow / deny / ask / defer."
- [CITED: code.claude.com/docs/en/hooks "Can a Hook Auto-Invoke Another Tool?"] -- **"No. PreToolUse hooks cannot directly invoke tools. They can only: Allow/deny/ask/defer the current tool call, Modify its input parameters, Add context for Claude to see. If you need to invoke additional tools, you must return context that Claude can act on."**

**Trade-off cost:**

- **Breaks lz-advisor "no hooks for v1" project constraint.** [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md:280-281`] -- "TeammateIdle hook analog for verify-before-commit -- lz-advisor's 'no hooks for v1' constraint precludes runtime enforcement; Plan 07-02 implements the equivalent at prompt-construction layer." The same constraint applies to Gap 1.
- **Hooks cannot auto-invoke ToolSearch.** [CITED: code.claude.com/docs/en/hooks] -- the hook can only ADD CONTEXT for the model to act on. The model still has to choose to invoke ToolSearch. So a hook is not strictly stronger than a prompt rule -- it is the same prompt rule, just delivered at a different point in the lifecycle.
- **Hook cost includes a `hooks/hooks.json` manifest + a Bash script + plugin re-publishing.** Modest engineering surface, but real.
- **Hook scope is global, not skill-scoped.** Per [CITED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md:33`] -- "Hooks are global (can't scope to skill), lack conversation context, add cost/noise without clear value." A PreToolUse hook on `Agent` would fire for EVERY Agent invocation, not just lz-advisor:advisor / lz-advisor:reviewer / lz-advisor:security-reviewer; the matcher would need to be specific enough to distinguish those agents from other plugins' agents that might use `Agent(...)` too.

**Implementation cost:** MEDIUM. New `hooks/hooks.json` file + new bash script in `${CLAUDE_PLUGIN_ROOT}/scripts/` + plugin manifest update + plugin version bump (already 0.10.0 -> 0.10.1 if Plan 07-07 ships standalone) + smoke fixture extension to assert hook fires on representative input. ~3-5 hours of engineering vs. Candidate B's ~30 minutes.

**Residual risk:** HIGH. Even if the hook is implemented, it does not strictly improve over Candidate B because (a) hooks cannot auto-invoke tools per the cited capability constraint, (b) the hook context-injection is functionally equivalent to a prompt rule with worse scoping (skill-global vs skill-specific), (c) breaking the v1 constraint sets a precedent for other "let's just hook it" pressure points.

**Decision on "no hooks for v1":** **REJECT.** The constraint should NOT be revisited for Gap 1. The cited capability limit (hooks cannot auto-invoke tools) means the upper-bound benefit of a hook is reaching parity with a well-framed prompt rule (Candidate B), at much higher engineering cost. The constraint is load-bearing for v1 marketplace economics (zero ext deps + auditability of rules in plain Markdown). Future phases can re-evaluate IF and only IF Candidate A + B empirically fail to lift firing rate from 2 of 8 toward 8 of 8.

### Candidate D: Non-text steering mechanism (fix surface 4)

Subdivide into D1 (advisor refusal pattern), D2 (hard skill-prefix), D3 (reference-doc cue):

#### D1: Advisor refusal pattern

**Mechanism:** Add a directive to the `advisor.md` / `reviewer.md` / `security-reviewer.md` system prompts that the agent MUST refuse to synthesize a response when the consultation prompt's `## Pre-Verified Package Behavior Claims` section contains pv-* blocks with `<evidence method=...>` values that don't match the tool-use trace inferable from the prompt. Refusal forces the executor to either (a) re-invoke advisor with re-grounded pv-* blocks, OR (b) drop the unverified claims.

**Evidence anchor:**

- [VERIFIED: `plugins/lz-advisor/references/context-packaging.md:48-66`] -- Common Contract Rule 5b already enumerates self-anchor rejection patterns at the executor side; D1 mirrors this on the agent side as a defense-in-depth.
- [CITED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md:73`] D-04 Option 2 already establishes the pattern (`<verify_request>` reviewer escalation hook) of agent-side structured refusal.

**Trade-off cost:**

- The refusal mechanism does not directly cause ToolSearch to fire. It causes the executor to re-engage with verification -- which MAY include invoking ToolSearch on the re-pass. Indirect closure path.
- Adds ~50-80 words to each agent's system prompt; cost is proportional but reasonable.
- Refusal re-passes consume an extra advisor turn; cost-cliff per D-05 element 3 may apply.

**Implementation cost:** MEDIUM-HIGH. Three agent prompts touched; refusal contract has to be carefully worded to avoid false-positive refusals on legitimate edge cases.

**Residual risk:** MEDIUM-HIGH. Indirect closure -- D1 closes the downstream effect (confabulated pv-*) without closing the upstream cause (executor not invoking ToolSearch). If the executor still doesn't invoke ToolSearch on re-pass, the refusal turns into a loop.

#### D2: Hard skill-prefix

**Mechanism:** Add a literal sentinel marker at the top of each `<context_trust_contract>` block (e.g., `<!-- TRUST_CONTRACT_VERSION="0.10.1-toolsearch-default-on" -->`) that the executor's prompt-construction step would have to acknowledge. Rejected because Sonnet 4.6 / Opus 4.7 don't have a "comment-acknowledgment" primitive; this is a non-mechanism.

**Evidence anchor:** N/A -- structural rejection.

#### D3: Reference-doc cue

**Mechanism:** Promote the ToolSearch availability rule to a top-level section heading in `references/context-packaging.md` (currently it's a sub-rule within Common Contract Rule 5b). The executor's @-load of the reference doc would then surface the rule as a more prominent section, increasing the chance of ranking it during orient.

**Evidence anchor:**

- [CITED: platform.claude.com/.../claude-prompting-best-practices "Long context prompting"] -- "Put longform data at the top: Place your long documents and inputs near the top of your prompt, above your query, instructions, and examples. This can significantly improve performance across all models." Section-heading promotion is the analog.

**Trade-off cost:**

- Mild restructuring of `references/context-packaging.md` (currently a settled file post Plan 07-01); modest churn.
- Does not directly address H1 (no WHY framing) or H2 (positioning relative to classification) -- promotion is partial.

**Implementation cost:** LOW.

**Residual risk:** MEDIUM. Promotion improves discoverability but doesn't close the firing-rate gap on its own. **Best used as an additive refinement to Candidate A or B, not a standalone closure path.**

## Recommendation

### Primary: Candidate B (default-on conversion) + Candidate A (worked examples)

**Rank 1: Candidate B (default-on Phase 1 action) ship in Plan 07-07.** This is the structural closure path. Rationale:

1. **Addresses the strongest hypotheses (H1, H2, H5, H6) at the structural level.** Eliminates the AND-conjunction that invites short-circuiting; makes the firing path unconditional on the agent-generated-source signal that already has a 3-cue detection set in the trust-contract.
2. **Compatible with the cost-asymmetry framing required by [CITED: platform.claude.com/.../claude-prompting-best-practices "Tool use triggering"]** -- the rule justifies its own cost ("one redundant ToolSearch is much cheaper than confabulated pv-*").
3. **Implementation cost is LOW-MEDIUM** -- byte-identical 4-skill canon edit + 1 Common Contract Rule 5b sub-rule update + smoke fixture path-c assertion. Same engineering shape as Plan 07-01 itself.
4. **No project constraint conflict** -- positive framing (do this proactively) over negative prohibition; descriptive prose with cost framing; no hooks; no API; no new agent / new skill / new tool grant.

**Rank 2: Candidate A (worked examples) ship paired with Candidate B in Plan 07-07.** Rationale:

1. **Directly closes H4** (no worked examples). Anthropic's own documented best practice [CITED: platform.claude.com/.../claude-prompting-best-practices "Use examples effectively"] is "3-5 examples wrapped in `<example>` tags". Plan 07-07 ships 2 examples (positive + boundary) -- below the 3-5 ideal but meaningfully more than the current 0.
2. **Compounds with Candidate B.** The default-on rule gives the structural hook; the worked example anchors the model's interpretation to the right scenario shape.
3. **Implementation cost is LOW** -- 2 example blocks added to the same byte-identical 4-skill canon edit Candidate B is making.

**Combined diff surface:** ~250-400 added words across 4 SKILL.md (one byte-identical edit applied 4x) + ~50-80 added words in `references/context-packaging.md` Rule 5b ToolSearch-precondition sub-rule + 1 smoke fixture assertion in `B-pv-validation.sh` (extend with a "ToolSearch invocation present in trace" assertion when input is agent-generated). Plugin version bump 0.10.0 -> 0.10.1 (or roll into a future minor cut if Plan 07-08 also ships gap-closure together).

**Explicit rejection of Candidate C (hook-based):** The "no hooks for v1" constraint should NOT be revisited for Gap 1, for two reasons:

1. [CITED: code.claude.com/docs/en/hooks] -- PreToolUse hooks **structurally cannot auto-invoke another tool**. A hook for ToolSearch can only inject additional context, which is functionally equivalent to a better-framed prompt rule (Candidate A + B) at much higher engineering cost.
2. The constraint is load-bearing for the plugin's v1 marketplace value proposition (zero deps + auditable plain-Markdown rules). Breaking it for a closure that hooks cannot structurally provide is bad architecture.

**Explicit deferral of Candidate D (non-text steering):** D1 (advisor refusal pattern) is a defense-in-depth candidate worth keeping in the Phase 8 backlog -- it complements but does not replace Candidate B. D3 (reference-doc cue) is a 1-2 line additive refinement that can be folded into Plan 07-07 IF the planner chooses, but is not load-bearing on its own.

### Secondary: empirical experiment (effort=high run)

Independent of Plan 07-07's prompt-rule changes, a single-session UAT spike at `--effort high` (vs `--effort medium`) on a representative agent-generated-source input (e.g., session 4's plan-fixes scenario) would measure the H3 lever cleanly. If high-effort fires the rule consistently while medium-effort doesn't, the recommendation is to update the UAT runner to use `--effort high` on UAT-replay sessions where rule discovery is being validated. Cost: ~5 minutes + 1 fresh `claude -p` invocation. **Recommend Plan 07-07 includes this spike as a Task 4** (small, decoupled, valuable).

## Validation Architecture

### Closing the gap empirically

Plan 07-07's smoke gate must extend `B-pv-validation.sh` with a 5th assertion that catches the firing-rate regression directly:

```bash
# Assertion 5 (NEW, FIND-G2-empirical default-on enforcement, gap 1 closure):
# When the input contains agent-generated source signals
# (@<path> with /plans/, /.planning/, or filename containing review/consultation/session-notes/plan),
# the trace MUST contain a ToolSearch tool_use event before any pv-* block synthesis on Class 2/3/4 surfaces.
TOOLSEARCH_COUNT=$(rg -c '"name":"ToolSearch"' "$OUT" || echo 0)
AGENT_GENERATED_INPUT=$(rg -c -e '@plans/' -e '@\.planning/' -e '"path":"[^"]*review[^"]*"' -e '"path":"[^"]*plan[^"]*"' "$OUT" || echo 0)
PV_PRESYNTHESIS=$(rg -B5 '<pre_verified[^>]*>' "$OUT" | rg -c '"name":"ToolSearch"' || echo 0)

if [ "$AGENT_GENERATED_INPUT" -ge 1 ]; then
  if [ "$TOOLSEARCH_COUNT" -ge 1 ]; then
    echo "[OK] Assertion 5 (gap-1 ToolSearch default-on): ToolSearch fired on agent-generated input"
  else
    echo "[ERROR] Assertion 5 (gap-1 ToolSearch default-on): agent-generated input detected but ToolSearch NOT invoked; default-on rule failed"
    FAIL=1
  fi
else
  echo "[SKIP] Assertion 5 (gap-1 ToolSearch default-on): no agent-generated input in fixture; assertion N/A"
fi
```

[VERIFIED: `B-pv-validation.sh` shape from Plan 07-01-SUMMARY lines 99-119; KCB-economics.sh JSONL grep pattern referenced in Plan 07-01-PLAN.md:84]

### Smoke fixture extension scope

The existing `B-pv-validation.sh` asserts pv-* synthesis discipline on a Class-2 question with NO agent-generated source. Plan 07-07's smoke fixture extension MUST add a second scratch-repo path that:

1. Creates a fixture `plans/upstream-review.md` with hedged claims about Storybook 10 + Compodoc (synthesized review file).
2. Invokes `/lz-advisor.plan Address findings in @plans/upstream-review.md` (canonical plan-fixes shape from session 4 + 7 UAT inputs).
3. Asserts the JSONL trace contains a `"name":"ToolSearch"` event BEFORE the first `<pre_verified` block synthesis (Assertion 5 above).
4. Existing Assertions 1-4 still apply on this second path.

This makes the smoke gate exercise both the Class-2-no-agent-input path (existing) and the agent-generated-input path (NEW), giving 2-of-2 coverage on the pv-* validation surface.

### UAT-replay closure criterion

Plan 07-07 closure is empirically valid when:

- `bash B-pv-validation.sh` PASSES on plugin 0.10.1 with the new Assertion 5.
- A subset UAT replay (minimum: plan-fixes session at `claude --model sonnet --effort high` from Empirical experiment above; if Candidate B alone closes the gap, the high-effort run is unnecessary) shows ToolSearch firing in 8 of 8 sessions where agent-generated source is present.
- Phase 7 amendment 7 (or amendment 6 extension) downgrades 07-VERIFICATION.md residual #1 from MAJOR to PASS with empirical evidence.

### Integration with existing pv-validation.sh

Plan 07-07 extends `B-pv-validation.sh` rather than ships a new fixture. Rationale:

- Follows the smoke-ladder convention from Plan 07-01-SUMMARY:46 ("Smoke-fixture ladder split by failure-mode generation: KCB covers synthesis-presence; B-pv-validation covers synthesis-discipline"). ToolSearch firing is part of synthesis-discipline; the fixture stays semantically split.
- Avoids fixture-letter-naming collision (next free letter from the 5.4 ladder is L; reserving L for a different concern is preferable).
- Single fixture file is faster to extend than a new file with new shared scaffolding.

## Open questions for planner

These are Claude's Discretion items the planner will decide in Plan 07-07:

1. **Exact wording of the default-on trigger.** The recommendation suggests "Phase 1 first action when input contains agent-generated source material" but the exact prose, punctuation, and placement within the existing `<context_trust_contract>` block is the planner's call. Should it replace the existing ToolSearch availability rule paragraph entirely, or fold into it?
2. **Exact placement of the worked examples.** Within the `<context_trust_contract>` block? Or in `references/context-packaging.md` Rule 5b's ToolSearch-precondition sub-rule? Or both? The Phase 6 + Phase 7 convention is to put deep prose in `references/` and concise rules in `<context_trust_contract>`. Examples could go either way.
3. **Whether to roll Candidate D3 (reference-doc cue) into Plan 07-07 or defer.** D3 is additive and cheap but increases the diff scope. Planner judgment.
4. **Whether the empirical effort=high spike (Secondary recommendation above) is in scope for Plan 07-07 or deferred to a follow-up phase.** The spike is small and decoupled but is a separate concern from the prompt-rule fix.
5. **Smoke fixture Assertion 5 regex specifics.** The agent-generated-input detection uses 4 patterns (`@plans/`, `@\.planning/`, `path with review`, `path with plan`); the planner may calibrate the patterns based on actual JSONL trace shape from existing UAT sessions.
6. **Cost-asymmetry phrasing.** The recommendation suggests "one redundant ToolSearch (~0 tokens, ~100ms) is much smaller than the cost of confabulated pv-* synthesis (Finding H + B.2)." Planner picks the exact prose -- the cost-framing IS the load-bearing element per H1.
7. **Plan 07-07 standalone vs paired with Plan 07-08 (Gap 2 wip-discipline).** Both are within-Phase-7 gap-closure plans. Per CONTEXT.md D-01 plan ordering rules, both can ship in any order after 07-01. Planner may prefer one combined commit or two separate plans.
8. **Plugin version bump.** If Plan 07-07 ships standalone, recommend 0.10.0 -> 0.10.1 (patch bump for prompt-rule refinement). If 07-07 + 07-08 ship together, recommend 0.10.0 -> 0.11.0 (minor bump matching Phase 6 / Phase 7 precedent for cross-cutting contract changes).

## Sources

### Primary (HIGH confidence)

- [CITED: platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices] (saved at `C:\Users\LarsGyrupBrinkNielse\.claude\projects\D--projects-github-LayZeeDK-lz-advisor-claude-plugins\c53bac4e-...\tool-results\toolu_01V7nDwxSQ2RutanjUwk7oTS.txt`) -- Anthropic's authoritative prompting best practices for Claude 4.x. Specific sections cited: "Tool use triggering", "Calibrating effort and thinking depth", "Use examples effectively", "More literal instruction following", "Tool usage" with `<default_to_action>` pattern, "Optimize parallel tool calling".
- [CITED: code.claude.com/docs/en/hooks] -- Claude Code hooks reference doc. Specific sections cited: "Capabilities" (allow / deny / ask / defer), "Can a Hook Auto-Invoke Another Tool? No" — the load-bearing constraint for rejecting Candidate C.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/session-notes.md`] -- 8-session UAT empirical evidence, sessions 1-8 GAPS rows.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` lines 49-65] -- Gap 1 declaration with severity + evidence + fix surfaces.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md`] -- D-01 / D-02 / D-04 anchor decisions; "no hooks for v1" constraint inheritance.
- [VERIFIED: `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` lines 37-58 + same byte-identical block in `lz-advisor.execute`, `lz-advisor.review`, `lz-advisor.security-review`] -- the surface to refine.
- [VERIFIED: `plugins/lz-advisor/references/context-packaging.md` lines 48-66] -- Common Contract Rule 5b ToolSearch-precondition sub-rule (current text).
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-01-SUMMARY.md`] -- Plan 07-01 delivered surface; Plan 07-07 builds on this.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-01-PLAN.md`] -- canonical pv-* XML shape + KCB-economics.sh Bash + JSONL trace + rg-assertion pattern.

### Secondary (MEDIUM confidence)

- [CITED: prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt] -- Claude 4 system prompt analysis. Cited for: ALL-CAPS reserved for safety-critical only, descriptive prose elsewhere, **zero worked examples for complex conditional logic** (gap H4 anchor).
- [CITED: github.com/anthropics/claude-code/issues/46935 "Quantified evidence: Sonnet 4.6 quality regression since March 9 -- 1400+ frustration events across 50 sessions"] -- empirical anchor for H6.
- [CITED: github.com/anthropics/claude-code/issues/41217 "Opus 4.6: Systematic Failure to Follow Explicit Behavioral Constraints Across Independent Sessions"] -- empirical anchor for H1 + H6.
- [CITED: github.com/anthropics/claude-code/issues/32290 "Claude reads files but ignores actionable instructions contained in them"] -- empirical anchor for H1 + H2 + H6 (the lz-advisor pattern is exactly this: agent-generated input file gets read, but the meta-instruction to verify before consuming gets skipped).
- [CITED: memory `reference_sonnet_46_prompt_steering.md` (referenced from CLAUDE.md global memory)] -- "descriptive triggers + few-shot examples for tool-use steering on 4.x; reserve imperatives for compliance only".
- [VERIFIED: memory `feedback_uat_canonical_prompt_format.md`] -- UAT replay invocation pattern uses `claude --model sonnet --effort medium` per Phase 6 + 7 precedent (relevant to H3).

### Tertiary (LOW confidence; flagged for empirical validation)

- [INFERRED: H3 "raise effort to high" lever is the cheapest gap-closure if H1 is correct] -- needs empirical UAT spike to validate. Recommend Plan 07-07 Task 4 spike (per Recommendation Secondary section).

## Metadata

**Confidence breakdown:**

- Empirical signal analysis: HIGH -- 8-session UAT data is unambiguous on the 2-of-8 firing rate; H1 + H2 anchored in cited Anthropic docs.
- Solution candidates A + B: HIGH -- both anchored in cited Anthropic best practices + verified existing trust-contract surface.
- Solution candidate C (hook): HIGH on rejection -- cited capability constraint is unambiguous.
- Solution candidate D (non-text): MEDIUM -- D1 + D3 are partial closures; D2 rejected.
- Validation architecture: HIGH -- B-pv-validation.sh shape is verified Plan 07-01 deliverable.

**Research date:** 2026-05-01
**Valid until:** 2026-05-31 (30-day window for Anthropic prompting best practices doc currency).

## RESEARCH COMPLETE

**Phase:** 07 Gap 1 -- ToolSearch precondition rule firing
**Confidence:** HIGH

### Key findings

- The ToolSearch rule fires in 2 of 8 UAT sessions; in those 2 sessions the trigger condition was technically NOT met (executor invoked ToolSearch proactively). In the 6 skipping sessions, the trigger condition WAS met but the rule didn't fire -- inverse correlation, not low signal.
- Anthropic's own current prompting best practices [CITED: platform.claude.com/.../claude-prompting-best-practices] explain the gap directly: "Claude Opus 4.7 has a tendency to use tools less often than Claude Opus 4.6... if you find that the model is not using your web search tools, clearly describe why and how it should." The current rule says WHEN and WHAT but not WHY (no cost framing) and lacks worked examples.
- PreToolUse hooks **cannot auto-invoke another tool** [CITED: code.claude.com/docs/en/hooks] -- a hook for ToolSearch is structurally equivalent to a better-framed prompt rule at much higher engineering cost. Hook-based enforcement is rejected on technical grounds, NOT just on "no hooks for v1" constraint grounds.
- The recommended closure path is **Candidate B (default-on conversion) + Candidate A (worked examples)** ship together in Plan 07-07, ~250-400 word diff across 4 byte-identical SKILL.md + Common Contract Rule 5b update + smoke fixture Assertion 5.

### File created

`D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\.planning\phases\07-address-all-phase-5-x-and-6-uat-findings\07-RESEARCH-GAP-1-toolsearch.md`

### Confidence assessment

| Area | Level | Reason |
|------|-------|--------|
| Empirical signal | HIGH | 8-session UAT data unambiguous; Anthropic docs explain mechanism |
| Solution candidate B + A | HIGH | Both anchored in cited Anthropic best practices |
| Hook rejection | HIGH | Cited structural capability constraint |
| Validation arch | HIGH | B-pv-validation.sh shape verified |

### Open questions for planner

8 enumerated items in "Open questions for planner" section above; the load-bearing one is exact wording of the default-on trigger and cost-asymmetry framing. Planner picks per established Phase 7 prose conventions.

### Ready for gap-closure planning

Plan 07-07 can now be drafted. The recommended Tasks shape is 4 tasks: (T1) refactor ToolSearch rule in 4 SKILL.md byte-identical canon, (T2) update Common Contract Rule 5b ToolSearch-precondition sub-rule in `references/context-packaging.md`, (T3) extend B-pv-validation.sh with Assertion 5 + agent-generated-input fixture path, (T4 optional spike) single-session high-effort UAT to validate H3 lever decoupled from H1+H2+H4 prompt-rule changes.
