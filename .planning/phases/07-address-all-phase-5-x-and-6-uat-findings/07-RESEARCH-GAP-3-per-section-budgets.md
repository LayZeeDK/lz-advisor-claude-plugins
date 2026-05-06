# Phase 7 GAP CLOSURE 3: Per-Section Word Budgets -- Research

**Researched:** 2026-05-06
**Domain:** Agent prompt-engineering -- output-length contract redesign on plugin lz-advisor 0.12.2
**Confidence:** HIGH on the load-bearing recommendations (per-section budgets, byte-identity preservation, smoke-fixture redesign); MEDIUM on the SemVer phase boundary (the project convention is the load-bearing input, not external research).

## Summary

Phase 7 sealed `passed_with_residual` on 0.12.2. The 2026-05-06 regression-gate UAT confirmed three structural budget gaps (security-reviewer 5/5 over 300w aggregate; reviewer 1/1 over at 520w; advisor visually ~143w on the Compodoc + Storybook scenario). The user's 2026-05-06 directive to replace the aggregate cap with per-section budgets is the right move: it aligns with Anthropic's own April 2026 postmortem evidence that **strict aggregate output-length caps degrade reasoning quality** [CITED: anthropic.com/engineering/april-23-postmortem], and with the AgentIF benchmark finding that **per-section structural constraints outperform aggregate constraints** for instruction-following [CITED: AgentIF paper, Tsinghua KEG]. The per-finding-validation prose the agents are emitting (`Validation of Finding N:`, `Severity revisions vs.`) is information the model judges valuable enough to surface across two different agents on two different scenarios -- budgeting it explicitly is more defensible than forbidding it.

The cross-pollination phenomenon (reviewer regressing without its agent file changing) is consistent with **shared-canon-read-in-context** as a real attention-budget effect. Byte-identity should be preserved (operationally cheap, audit-friendly), but the contract redesign needs to bound the surface that's drifting -- per-finding validation prose -- via an explicit per-section budget rather than via a cross-cutting aggregate that scales perversely with finding count.

**Primary recommendation:** Adopt the user's proposed contract verbatim with two refinements: (1) place the per-finding-validation budget inside an XML `<output_constraints>` block per the AgentIF / Anthropic XML-tag pattern so Sonnet 4.6 / Opus 4.7 honour it 15-20% better than prose; (2) ship as 0.13.0 MINOR coordinated with the Phase 8 wip-discipline reversal so the plugin only takes one breaking-fixture-API hit. Extend Phase 7 with Plans 07-14+ rather than cutting to Phase 8: the existing 5-amendment chain in 07-VERIFICATION.md is the established convention, and "the plan-skill addendum is already there" pattern matches Plans 07-09 through 07-13.

## User Constraints (from Phase Description and 2026-05-06 Addendum)

### Locked Decisions

- **Replace aggregate `<=300w` cap on reviewer + security-reviewer with per-section budgets.** Quality should emerge from each component being concise, not from a total-volume ceiling that scales perversely with finding count. (User directive 2026-05-06; load-bearing for closure.)
- **Phase 7 stays sealed at `passed_with_residual`.** This research informs gap-closure plans 07-14+; it does not reopen Phase 7's structural deliverables. Plans 07-01..07-13 remain landed.
- **In-scope requirements:** FIND-D, GAP-D-budget-empirical only. FIND-A, B, C, E, F, G, H + GAP-G1+G2-empirical + GAP-G1-firing + GAP-G2-wip-scope + FIND-B.2-format-scope are SATISFIED on 0.12.0/0.12.1/0.12.2 per 07-VERIFICATION.md and OUT OF SCOPE for this gap-closure research.
- **Reviewer + security-reviewer share byte-identical `<context_trust_contract>` and `<orient_exploration_ranking>` canon** (Phase 6 Plan 06-05 + Phase 7 Plan 07-03 commitments). Cross-pollination must be addressed without breaking the canon-byte-identity invariant.
- **No external API dependency, no hooks for v1, model availability is Sonnet 4.6 + Opus 4.7** (PROJECT.md inheritance).
- **Existing per-section caps preserved verbatim:** per-finding entry <=22w target / <=28w outlier soft cap; CCP/TP <=160w; Missed surfaces <=30w. (User directive 2026-05-06 table.)
- **NEW per-finding validation prose budget: <=60w per finding (caps at finding count).** (User directive 2026-05-06 table; load-bearing for the regression closure.)
- **Aggregate cap: DROP.** (User directive 2026-05-06 table.)

### Claude's Discretion

- Exact XML wrapping shape for the new per-section budgets in `agents/{reviewer,security-reviewer}.md` `## Output Constraint` sections.
- Whether the per-finding-validation surface should be REQUIRED, OPTIONAL, or REJECTED in the redesigned contract (Q1c). Recommendation in Closing Recommendations table.
- SemVer bump strategy (0.12.2 -> 0.12.3 PATCH vs 0.13.0 MINOR vs 1.0.0 MAJOR; coordination with Phase 8 wip-discipline reversal). Recommendation in Plugin Version + Phase 7/8 Boundary section.
- Smoke-fixture parser approach for the new per-finding-validation surface (mandatory header `### Per-finding validation` vs regex on emergent prose forms `Validation of Finding N:` / `Severity revisions vs.`). Recommendation in Validation Architecture section.
- Whether to run the counterfactual rollback experiment (Q2c, Q5) before or after the contract redesign lands. Recommendation in Counterfactual Rollback Experiment section.
- Plan numbering and ownership boundary between fixture extraction-pattern updates and prompt-canon edits.

### Deferred Ideas (OUT OF SCOPE)

- Reviewer tool-grant extension (Option 3 of FIND-F). Permanently deferred per OWASP / arXiv 2601.11893 / Claude Code Issue #20264.
- 1.0.0 marketplace cut. Deferred until Phase 7 closes empirically AND a follow-up regression cycle confirms zero residuals.
- Hard-rules layer for word-budget. Deferred unless 0.13.x cycle confirms hybrid is insufficient. Anthropic's Apr 2026 ablation showed ~3% coding-quality cost; defer the cost until empirical evidence demands it.
- README "Recommended prompt shape" section. Deferred from Phase 5.5 / 5.6 / 6 / 7; not opening here.
- `wip:` prefix discipline. Phase 8 reversal target per `feedback_no_wip_commits.md`; not in scope for this research's primary deliverables but is a coordination consideration for the SemVer bump (see Plugin Version section).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FIND-D | Word-budget regression closure (advisor 100w / reviewer 300w / security-reviewer 300w aggregate) | Q1 contract redesign + Q3 fixture redesign sections; specifically the per-section budget shape and the XML-wrapped output_constraints block design |
| GAP-D-budget-empirical | Reviewer + security-reviewer aggregate <=300w on canonical scenarios (now SUPERSEDED to per-section caps per 2026-05-06 user directive) | Q1c per-finding-validation budget design + Q5 acceptance-criteria pre-registration |

## Project Constraints (from CLAUDE.md)

The following directives from `CLAUDE.md` govern any plan derived from this research:

- **No AI attribution in commits.** Never `Co-Authored-By` or `Generated with` trailers.
- **ASCII-only output.** No emojis, em/en dashes, curly quotes. Use `--`, `*`, `->`, `[OK]`, `[ERROR]`, `[WARN]`. (Already enforced project-wide; existing fixtures and 07-VERIFICATION.md amendments follow this.)
- **Never `git add .` / `git add -A` / `git add -u`.** Stage specific files by name.
- **Prefer `git mv` for renames** (not relevant here; no renames in scope).
- **`git grep` is primary content search; `rg -uu` only for git-ignored paths.** Smoke fixtures already use `rg` correctly; no change needed.
- **Skill verification convention:** `claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.<skill> <prompt>" --verbose` for non-interactive UAT replay. The existing D-*-budget.sh fixtures follow this; new fixtures must too.
- **GSD workflow enforcement.** All edits go through `/gsd-execute-phase`; do not bypass.
- **Heredocs for commit messages**, not inline.
- **No `cd <path> &&` prefixes** in commands; the Bash tool persists working directory.
- **No multi-line file content via heredoc/echo.** Use Write tool. (Smoke fixtures use `cat << 'EOF'` for embedded Node ESM scripts; this is the documented exception in fixture context.)

## Standard Stack

### Core (no change for this gap closure)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code Agent tool | (inherited) | Reviewer + security-reviewer + advisor invocation | Project constraint: zero external dependencies |
| Sonnet 4.6 (executor) | (released 2026-02-17) | Skill executor | Available on Team Plan; project requirement |
| Opus 4.7 (agents) | (released ~Apr 2026) | Reviewer / security-reviewer / advisor | Available on Team Plan; project requirement |
| `effort: medium` | (current) | Reviewer + security-reviewer effort cap | Plan 07-09 amendment; preserved -- the verbosity cause is structural (Plan 07-13 surface), not effort |
| `effort: high` | (current) | Advisor effort cap | Plan 07-10 fragment-grammar template proven sufficient on 0.12.1 |
| `maxTurns: 3` | (current) | All 3 agents | Plan 06-05 architecture; preserved |
| `tools: ["Read", "Glob"]` | (current) | All 3 agents | Principle of least privilege; preserved |

### Supporting (load-bearing for new contract)

| Pattern | Source | When to Use | Confidence |
|---------|--------|-------------|------------|
| XML-wrapped `<output_constraints>` block with per-section `<section name="..." max_words="N">` children | Anthropic best practices [CITED: docs.anthropic.com/en/docs/build-with-claude/prompt-engineering] + cloud-authority Jan 2026 [CITED: cloud-authority.com/xml-is-making-a-comeback-in-prompt-engineering] + AgentIF benchmark | When per-section length matters and the model is Sonnet 4.6 / Opus 4.7 (XML compliance is 15-20% higher than prose on Claude per cited testing) | HIGH |
| Negative constraint enumeration (`Do not include X, Y, Z`) | Anthropic prompt engineering guide [CITED: docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices] + buildmvpfast 2026 system-prompt guide | When agents emit unauthorized sections; explicit rejection list is more reliable than reliance on omission | HIGH |
| Adaptive thinking + effort calibration | Anthropic 2026 docs [CITED: anthropic.com/news/claude-sonnet-4-6] | Already applied (Plan 07-09 effort: medium); preserve | HIGH |
| Versioned prompts as production code | buildmvpfast 2026 + AgentIF | Already applied via SKILL.md `version:` frontmatter; preserve | HIGH |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Per-section budgets (user directive) | Restore aggregate <=300w cap with stricter prose | REJECTED -- empirically falsified by 5/5 over-cap on 0.12.2 + Anthropic Apr 2026 postmortem evidence that aggregate caps degrade quality |
| Per-section budgets (user directive) | Hard-rules layer (ALL-CAPS imperatives, "MUST NOT exceed N words") | REJECTED -- Anthropic Apr 2026 ablation: 3% coding-quality drop from a single verbosity cap. Hard rules are deferred per CONTEXT.md. The structural fix (XML output_constraints) is the Pareto choice. |
| Per-section budgets (user directive) | Effort de-escalation `medium -> low` | REJECTED -- Plan 07-09 amendment already applied medium; further reduction risks recall regression on Class-1 (API-correctness) findings (CONTEXT.md D-04 reversion criterion). The verbosity is structural (induced by Plan 07-13 prose), not effort-related. |
| XML `<output_constraints>` block | Markdown table with Section / Budget columns | XML wins per cloud-authority Jan 2026 + AgentIF: 15-20% better instruction compliance on Claude. Markdown table is the **format** users see in CONTEXT.md / CLAUDE.md; XML is the **internal-prompt format** the agent reads. They can coexist. |

**Installation:** No new packages. Plugin remains zero-dependency.

**Version verification:** Sonnet 4.6 and Opus 4.7 versions are current as of search date 2026-05-06 [CITED: anthropic.com/news/claude-sonnet-4-6 + benchlm.ai/blog/posts/claude-api-pricing]. No `npm view` step needed.

## Architecture Patterns

### Recommended Approach: XML output_constraints with explicit Per-Finding Validation surface

```
agents/reviewer.md and agents/security-reviewer.md ## Output Constraint section:

<output_constraints>
  <section name="findings" type="repeating">
    <per_entry max_words="22" outlier_soft_cap="28"/>
    <max_count>15</max_count>
  </section>
  <section name="cross_cutting_patterns" max_words="160"/>
  <section name="missed_surfaces" max_words="30" optional="true"/>
  <section name="per_finding_validation" type="repeating" optional="true">
    <per_entry max_words="60"/>
    <one_per>finding</one_per>
    <description>Optional severity-revision or confirmation prose per finding. When emitted, MUST appear under the literal heading `### Per-finding validation` and MUST itemise per-finding entries with the literal prefix `Validation of Finding N:` (where N matches the Findings entry index).</description>
  </section>
  <aggregate_cap>none</aggregate_cap>
  <do_not_include>
    <item>preamble or throat-clearing</item>
    <item>"Severity revisions vs. {initial,executor}:" prose section without the canonical `### Per-finding validation` heading</item>
    <item>any section not enumerated in this constraints block</item>
  </do_not_include>
</output_constraints>
```

**Rationale:**

1. **XML beats prose on Claude.** The prompt-engineering literature converges on 15-20% better instruction compliance with XML tags vs prose-only on Claude models [CITED: cloud-authority.com + multiple sources]. Plan 07-09 + 07-13 used markdown prose; the regression evidence shows that prose alone is insufficient. The agent ALREADY parses XML for `<verify_request>` and `<pre_verified>`; extending the pattern to `<output_constraints>` is consistent.

2. **Explicit per-finding-validation surface honours the empirical signal.** The agents emit this surface because they judge severity-revision reasoning useful. The empirical evidence: **two different agents on two different scenarios converge on the same emergent pattern**. Forbidding it would suppress information the model has decided to surface. Budgeting it preserves the information at predictable cost.

3. **Drop aggregate cap.** The user directive is right on first principles: the aggregate scales perversely with finding count. A 6-finding security review with rich CVE / GHSA / CWE prose CANNOT compress to 300w without losing information; the cap was empirically falsified at 5/5 in 2026-05-06.

4. **Negative constraints (`<do_not_include>`) prevent unauthorized sections.** Anthropic best practices: "Constraints tell Claude what to leave out, not just what to include" [CITED: docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices]. The current contract is silent on the unauthorized post-Findings prose; the new contract should enumerate it explicitly.

### Pattern: Mandatory Stable Header for the New Surface

**What:** Require `### Per-finding validation` heading when the validation surface is present.
**When to use:** Always, when emitting per-finding validation prose. Optional whether to emit at all; mandatory format when emitting.
**Example:**

```
### Findings

`src/auth.ts:42: crit: ...`
`src/api.ts:88-140: imp: ...`

### Per-finding validation

Validation of Finding 1: Confirmed Critical. <up to 60w explanation of severity confirmation or revision rationale, with concrete reasoning, not throat-clearing.>

Validation of Finding 2: Severity revised Important -> Suggestion. <up to 60w explanation citing the empirical observation that flips the severity.>

### Cross-Cutting Patterns

...
```

**Why a stable header:** the smoke fixture parser needs ONE deterministic anchor. The empirical evidence shows the agents have emitted this surface under at least 3 different headings: `Severity revisions vs. initial:` (smoke n=4), `Severity revisions vs. executor:` (S4 UAT), `Validation of Finding N:` (S3 UAT). Mandating `### Per-finding validation` as the canonical heading collapses parser variance to a single-regex match while preserving the agent's ability to omit the surface entirely.

### Anti-Patterns to Avoid

- **Aggregate cap restoration.** REJECTED per user directive + falsified empirically + Anthropic postmortem evidence.
- **Per-finding aggregate that scales with finding-count squared.** Tempting (e.g., `total_findings * 60w + base_overhead`) but creates the same scaling pathology the aggregate cap had. Per-finding-bounded is the right primitive.
- **Forbidding the validation surface.** Suppressing what the model judges useful is the wrong direction; budgeting it is the right direction. (Direction of travel matches the user directive's framing rationale: "Authorize the patterns the agents are emitting.")
- **Cross-file canon parameterization.** Tempting to add `role="reviewer"` vs `role="security-reviewer"` to the shared `<context_trust_contract>` block to prevent cross-pollination, but this BREAKS the byte-identity invariant the project committed to in Phase 6 Plan 06-05 + Phase 7 Plan 07-03. Cross-pollination is real but should be addressed via the per-section budget contract, not via canon-divergence.
- **`maxTurns` increase to give the agent more synthesis room.** Tempting but rejected -- the regression is verbosity-emission, not turn-budget exhaustion. Plan 07-09 + 07-10 demonstrated the structural intervention works at maxTurns: 3.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-section budget enforcement at runtime | Custom JS validator that wraps the agent response | `<output_constraints>` XML block in the agent prompt | The model is the enforcement mechanism; trying to validate post-hoc and re-prompt is iterative loop pattern (rejected per Spotify Honk one-shot principle, Plan 07-05 D-04). |
| Smoke-fixture word counter | Custom AST parser for markdown sections | Existing `awk` + `wc -w` pattern in current D-*-budget.sh | The current pattern is adequate; extend, don't rewrite. |
| Cross-pollination prevention | Per-role canon divergence | Per-section budgets that bound the drift surface | Byte-identity is project-invariant per Phase 6 + Phase 7. The drift is in the emit-pattern surface; bound that surface. |

**Key insight:** The model IS the enforcement mechanism for output-shape contracts. Custom validators add complexity and don't catch the actual failure mode (which is verbosity-emission patterns, not parseable rule violations). The right intervention is at the prompt-construction layer.

## Q1 -- Per-Section Word-Budget Contract Design

### (a) How do other AI-agent emit-contract systems handle component vs aggregate budgets?

**Finding (HIGH confidence):** The 2026 prompt-engineering literature converges on **per-section structural constraints** as the right primitive for output-length control on instruction-following models. The most authoritative empirical anchor is the **AgentIF benchmark** [CITED: keg.cs.tsinghua.edu.cn/persons/xubin/papers/AgentIF.pdf]:

> "Constraints fall into three main types: (1) formatting constraints, which specify the structure or presentation of the output; (2) semantic constraints, which require semantic understanding to check, e.g., language style; (3) tool constraints, which involve adherence to tool specifications."
>
> "Formatting constraints include (1) Syntax Formatting: requiring outputs in formats like JSON, XML, or Markdown; (2) Layout Structure: specifying bullet points, tables, or paragraph length; (3) Symbol Conventions; (4) Instructional Structure."

The benchmark contains 707 high-quality manually annotated instructions with an average of **11.9 constraints per instruction** -- evidence that production agentic instructions are typically expressed as 10+ small per-section constraints, not as a single aggregate cap.

**Anthropic-specific evidence (HIGH confidence):** the April 2026 postmortem [CITED: anthropic.com/engineering/april-23-postmortem] documented that adding a SINGLE aggregate output-length cap caused a 3% coding-quality regression that was reverted within 4 days:

> "On April 16, they added a system prompt instruction to reduce verbosity ('Length limits: keep text between tool calls to <=25 words. Keep final responses to <=100 words unless the task requires more detail.'). In combination with other prompt changes, it hurt coding quality and was reverted on April 20."

This is direct evidence at a higher-than-lz-advisor scale: even Anthropic's internal team retracted a global aggregate cap when the empirical regression surfaced. The lz-advisor finding count (5-7 findings on representative scenarios) is exactly the regime where per-section is more honest than aggregate.

**Recommendation:** Per-section is the standard 2026 pattern. Confidence: HIGH.

### (b) Is the 60w per-finding-validation budget defensible?

**Finding (MEDIUM-HIGH confidence):** The empirical n=5 sample size on 0.12.2 supports the user's proposed 60w. Concrete evidence:

| Source | Surface | Per-finding validation prose word count |
|--------|---------|------------------------------------------|
| S3 UAT review-report.md (520w aggregate) | "Validation of Finding 1: Confirmed Important." | ~80w (Finding 1 longest); 30-50w typical |
| S3 UAT review-report.md | "Validation of Finding 5: Confirmed Suggestion." | ~12w (shortest) |
| S4 UAT security-review-report.md | "Severity revisions vs. executor:" 5 bullets | ~10w each; ~50w total |
| Smoke n=1 (run 1 / 427w) | "Severity revisions vs. initial:" 4 bullets | ~80-100w total |
| Smoke n=4 mean | (post-Findings prose section) | ~50w mean across runs |

The user's proposed 60w/finding cap is at the **median** of observed per-finding emission lengths (~30-50w typical, with rare outliers at 80w on Critical findings or CVE-rich security findings). Specifically:

- **30-50w covers the typical case** (4 of 5 S3 UAT findings)
- **60w accommodates the outlier case** (the Finding 1 / 80w case is rare; the 60w cap forces the agent to compress the rationale for the longest, which is exactly what the empirical evidence showed it can do at the typical case)
- **At 6 findings (smoke baseline), 60w/finding = 360w on the validation surface alone**, plus ~150w Findings + ~100w CCP + ~25w Missed surfaces = ~635w total. This is structurally larger than the old 300w aggregate -- but that's the point. The aggregate was unrealistic.

**Defensibility:** Strong. The 60w cap is the empirical median + outlier accommodation. A 50w cap would be tighter but force the agent to suppress the Finding 1 / 80w-typical case (e.g., the security-review of a CVE with multiple cited GHSA / CWE references). A 75w cap would be more permissive but invites verbosity drift. 60w is the right Pareto point.

**XML expression matters more than the number.** Per AgentIF + Anthropic best practices, the budget being expressed as `<per_entry max_words="60"/>` inside `<output_constraints>` will bind 15-20% better than the same number in prose. Confidence: HIGH on the structural form; MEDIUM on the exact 60w number (prefer empirical re-calibration after the first 3-run smoke against the redesigned contract).

### (c) Should the per-finding-validation surface be REQUIRED, OPTIONAL, or REJECTED?

Three design options ranked by load-bearing-ness for the gap closure:

#### Option C1: OPTIONAL with stable header (RECOMMENDED)

The agent MAY emit a `### Per-finding validation` section. When emitted, each entry MUST start with `Validation of Finding N:` and MUST be <=60w. When NOT emitted, no section is added.

**Rationale:**

- Aligns with the empirical signal: the agents emit it when they have something to say (severity revision, confirmation rationale) and skip it when they don't. The S4 UAT showed it for 1-of-6 findings (Finding 3 only); the S3 UAT showed it for 5-of-5. The model is already self-pacing.
- Aligns with the agent's existing `### Missed surfaces (optional)` pattern -- precedent for "optional section with stable header" exists in both reviewer.md and security-reviewer.md.
- Aligns with Anthropic best practices: "Constraints tell Claude what to leave out, not just what to include" -- by making it optional but enumerated, the model knows it's authorized but not required.
- Smoke-fixture parser stays simple (one regex on the stable header).

#### Option C2: REQUIRED per finding

Every finding MUST be paired with a `Validation of Finding N:` paragraph.

**Rationale (against):**

- Forces emission even when the model has nothing to add. On low-severity Suggestions, the agent's typical "Confirmed Suggestion" 5-word entry burns budget for no informational gain.
- Violates the empirical signal. The S4 UAT showed 1-of-6 findings with a validation note; the model's pacing was right.
- Increases prompt complexity; doesn't address the failure mode (which was unauthorized-section emission, not under-emission).

#### Option C3: REJECTED (mirror security-reviewer.md WR-01 Hedge Marker carve-out scope)

The agent MUST NOT emit any post-Findings prose section.

**Rationale (against):**

- Contradicts the user directive's first-principles framing ("Authorize the patterns the agents are emitting; budget them explicitly").
- Suppresses information the model judges valuable (severity-revision rationale specifically -- the kind of analytical depth that the agent prompts ASK FOR via "Focus on confirming or escalating the executor's severity assessments").
- Equivalent to fighting the model's training; per Anthropic's own postmortem, this is exactly the kind of intervention that backfires.

**Decision recommendation:** Option C1 (OPTIONAL with stable header) for both reviewer and security-reviewer. Confidence: HIGH.

## Q2 -- Cross-Pollination via Byte-Identical Shared Canon

### Empirical Phenomenon

Reviewer + security-reviewer share byte-identical `<context_trust_contract>` and `<orient_exploration_ranking>` canon blocks. Plan 07-13 added a ~32-line `## Class-2 Escalation Hook` section to security-reviewer.md (changing its surroundings) and renamed severity vocabulary across both. Result on 0.12.2:

- Security-reviewer (changed surface): 5/5 over-cap (mean 354w / 18% over)
- Reviewer (UNCHANGED surface): 1/1 over-cap (520w UAT / 84% over) -- same emit-pattern (`Validation of Finding N:`)

This is structurally consistent with **shared-canon-read-in-context attention budget effect**: the canon is byte-identical but the agent's interpretation of it varies with the surrounding text in each agent's full prompt. Plan 07-13 increased security-reviewer's surroundings (~32 line addition + carve-out adjustments); the model's processing of the shared canon shifted; the same shift bled into reviewer because the model's "what does this canon authorize" inference now includes the post-Findings-prose-emission pattern.

### (a) Is byte-identity the right primitive?

**Finding (MEDIUM-HIGH confidence):** Yes, preserve byte-identity. The cross-pollination is real but the alternatives are worse:

| Approach | Pro | Con | Verdict |
|----------|-----|-----|---------|
| Strict byte-identity (current) | Stable, audit-friendly via SHA256 cross-file diff; project-invariant since Phase 6 | Couples behavior across agents | KEEP |
| Parameterized canon (`role="reviewer"` vs `role="security-reviewer"`) | Allows per-role adaptation while preserving structural shared scope | Breaks byte-identity invariant; doubles maintenance surface; XML pattern doesn't have established precedent for "same-block-with-role-attribute" semantic; doesn't address the cause (drift surface) | REJECT |
| Canon-as-imported-reference (`@./references/canon.md`) | Single source of truth | Loses Sonnet's "read-in-place" verbatim observability per Plan 06-05 design rationale; same coupling problem since both agents `@`-load the same content | REJECT |
| No-shared-canon (each agent gets its own) | Maximum decoupling | Drift risk reverts to pre-Phase-6 baseline; cross-agent inconsistency is exactly what Phase 6 / 7 fixed | REJECT |

**Why preserve byte-identity:** The cross-pollination root cause is **not** in the shared canon. The shared canon hasn't changed; what changed is one agent's surroundings. The fix is to bound the drift surface (per-finding validation prose) at the per-agent `## Output Constraint` section, not at the shared-canon layer.

### (b) Anthropic guidance on system prompt copying between agents

[CITED: anthropic.com/engineering/multi-agent-research-system + anthropic.com/research/building-effective-agents]:

> "Since each agent is controlled by its prompt, small changes in phrasing could make the difference between efficient research and wasted effort... By mentally modeling how the agents interpret prompts, engineers could predict these failure modes and adjust the wording to steer agents toward better behavior."

> "How do we prevent agents from making conflicting assumptions about the same task? In Anthropic's research system, multiple sub-agents were assigned to collect different types of information about a single topic. If there were no shared task framing, one agent might focus on sourcing recent quantitative data, while another could interpret the same topic through qualitative or outdated sources."

Anthropic's own multi-agent research system uses shared task framing (the equivalent of lz-advisor's byte-identical canon) -- explicitly. The pattern is endorsed; the failure mode (cross-pollination on edits to one agent's surroundings) is a known small-changes-have-big-effects pattern that's expected and should be defended against by **bounding the surface that changes**, not by breaking the shared frame.

### (c) Counterfactual rollback experiment design

**Hypothesis:** if Plan 07-13's surface changes to security-reviewer.md (the ~32-line `## Class-2 Escalation Hook` addition + Hedge Marker Discipline carve-out) are reverted, reviewer's aggregate (which doesn't have the section) returns to pre-Plan-07-13 baseline (~197w on 0.12.0 per `D-reviewer-budget.sh` 3x mean cited in 07-VERIFICATION.md final_closure block).

**Pre-registered acceptance criteria (write before running, per Q5):**

1. Run `D-reviewer-budget.sh` 3x against current 0.12.2 = baseline reviewer behavior.
2. Create branch `experiment/p7-rollback-revert-07-13`. Revert commits b5916ea (WR-03 Class-2 Hook) and 92cac0b (WR-01 severity rename) on the branch -- security-reviewer.md only.
3. Run `D-reviewer-budget.sh` 3x against the rollback branch.
4. **Cross-pollination CONFIRMED if:** reviewer mean on rollback drops by >=30% vs baseline (e.g., 520w -> ~200-300w). The 30% threshold is calibrated to be detectable above per-run variance (smoke std-dev ~52w).
5. **Cross-pollination DISCONFIRMED if:** reviewer mean on rollback stays >=400w. This would suggest the regression is NOT shared-canon-mediated but is general Sonnet/Opus drift since Plan 07-09 baseline.
6. **Inconclusive if:** reviewer mean drops by 10-30%. Re-run with n=5 for higher confidence.

**Cost:** ~$0.50 per 3-run (smoke fixture) + ~5min wall time per run; <=$3 total + 30min for the rollback experiment.

**Decision recommendation:** **Run the experiment AFTER the contract redesign lands**, not before. Reasoning: (a) if the redesign closes the regression at both agents, the rollback question becomes academic; (b) if the redesign fails on reviewer specifically, the rollback experiment's data is the disambiguation between "fix the shared canon" vs "fix the per-agent contract harder". Confidence: MEDIUM (the experiment is valuable; the timing is judgment-call; running before would cost less but provide less actionable data).

## Q3 -- Smoke-Fixture Pattern Update for Per-Section Enforcement

### Validation Architecture

#### Test Framework

| Property | Value |
|----------|-------|
| Framework | Bash + `awk` + `wc -w` + Node ESM (per-finding parser); existing pattern from `D-*-budget.sh` |
| Config file | None -- fixtures are self-contained |
| Quick run command | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` (one-shot single run) |
| Full suite (3x re-run for halt-criterion) | Loop in shell: `for i in 1 2 3; do bash D-reviewer-budget.sh > run-$i.log; done` |
| Phase gate | `D-reviewer-budget.sh` 3x mean PASS + `D-security-reviewer-budget.sh` 3x mean PASS + `D-advisor-budget.sh` 3x mean PASS |

#### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIND-D | Per-section budgets enforced (per-finding entry <=22/28w; CCP/TP <=160w; Missed surfaces <=30w; per-finding validation <=60w; aggregate cap DROPPED) | smoke (3-run mean) | `bash D-reviewer-budget.sh` and `bash D-security-reviewer-budget.sh` | UPDATE (existing files; new assertion set) |
| GAP-D-budget-empirical | Per-section caps green on canonical D-*-budget.sh scenarios; aggregate assertion REMOVED | smoke (3-run mean) | same | UPDATE |
| FIND-D (advisor sub-component) | Advisor SD per-item <=15/22w + aggregate <=100w on Compodoc + Storybook scenario | smoke (1-run + n=1 visual UAT comparison) | `bash D-advisor-budget.sh` | UPDATE (3-run mean) |

#### Per-Section Assertion Redesign

Current `D-reviewer-budget.sh` assertion set (lines 37-181):

1. Section presence (Findings + CCP) -- KEEP
2. Per-finding entry word count (<=20 target / <=25 outlier in current; bump to <=22 / <=28 to match user directive table) -- UPDATE thresholds
3. Cross-Cutting Patterns <=160w -- KEEP
4. Missed surfaces <=30w (if present) -- KEEP
5. Aggregate <=300w -- **REMOVE**
6. Per-finding validation <=60w (NEW; per-entry parser on lines starting with `Validation of Finding N:` under `### Per-finding validation` heading) -- ADD

Concrete extraction-pattern for the new surface:

```bash
# Per-finding validation block extraction (after Findings section)
PFV_BODY="$SCRATCH/pfv-body.txt"
awk '
  /^### Per-finding validation/ {flag=1; next}
  flag && /^### |^---|^\*\*Verdict scope/ {flag=0}
  flag {print}
' "$OUT" > "$PFV_BODY" || true

# Per-entry word count via Node script (mirrors existing check-entries.mjs pattern)
PFV_CHECK_SCRIPT="$SCRATCH/check-pfv-entries.mjs"
cat > "$PFV_CHECK_SCRIPT" << 'EOF'
import { readFileSync } from 'node:fs';
const body = readFileSync(process.argv[2], 'utf8');

// Match `Validation of Finding N: <body>` entries.
// Each entry is one paragraph (terminated by blank line or next entry).
const PFV_RE = /^Validation of Finding \d+:\s+([\s\S]+?)(?=\n\nValidation of Finding|\n*$)/gm;

const matches = [...body.matchAll(PFV_RE)];

if (matches.length === 0) {
  console.log('[OK] Per-finding validation: section absent (optional)');
  process.exit(0);
}

console.log(`[INFO] Per-finding validation: ${matches.length} entries`);
let bad = 0;
matches.forEach((m, idx) => {
  const wc = m[1].trim().split(/\s+/).filter(Boolean).length;
  if (wc > 60) {
    console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>60 cap)`);
    bad++;
  } else {
    console.log(`[OK] Per-finding validation entry ${idx + 1}: ${wc} words (<=60 cap)`);
  }
});
process.exit(bad === 0 ? 0 : 1);
EOF

if ! node "$PFV_CHECK_SCRIPT" "$PFV_BODY"; then
  FAIL=1
fi
```

This pattern is consistent with the existing `check-entries.mjs` shape; new fixture code follows established convention.

#### Sampling Rate

- **Per task commit:** `bash D-reviewer-budget.sh` (single run; ~$0.10, ~2min) -- detects gross regressions
- **Per wave merge:** 3-run mean across `D-{reviewer,security-reviewer,advisor}-budget.sh` -- ~$0.90, ~10min -- the empirically-anchored halt criterion (Plan 07-12 disconfirmation protocol)
- **Phase gate:** 3-run mean for all 3 fixtures + UAT replay subset (S1 plan + S3 review + S4 security-review on canonical Compodoc + Storybook scenario) -- ~$3, ~30min

#### Wave 0 Gaps

- [ ] `D-reviewer-budget.sh` per-finding-validation parser (NEW assertion 6, per pattern above)
- [ ] `D-reviewer-budget.sh` aggregate-cap assertion REMOVED (cleanup)
- [ ] `D-reviewer-budget.sh` per-finding entry threshold update (20w -> 22w / 25w -> 28w)
- [ ] `D-security-reviewer-budget.sh` per-finding-validation parser (NEW; same pattern as reviewer)
- [ ] `D-security-reviewer-budget.sh` aggregate-cap assertion REMOVED
- [ ] `D-security-reviewer-budget.sh` per-finding entry threshold update (22w -> 22w / 28w -> 28w; KEEP since user table shows the security-reviewer band aligns)
- [ ] `D-advisor-budget.sh` rerun against fresh trace to confirm Plan 07-10 closure on 0.12.2 + Compodoc scenario (Phase 8 worklist item 9 from 07-VERIFICATION.md)

### Q3(c) -- Robust extraction patterns

The agents emit the validation surface inconsistently across runs (3 observed shapes). Robust extraction requires **mandating a stable section header in the contract** and treating the parser as enforcing the contract:

| Observed shape (current) | Source | Recommended unified shape (new contract) |
|--------------------------|--------|------------------------------------------|
| `Validation of Finding 1: Confirmed Important.` paragraphs (S3 UAT) | reviewer.md | `### Per-finding validation\nValidation of Finding 1: <body>` |
| `Severity revisions vs. executor:` then bullets (S4 UAT) | security-reviewer.md | `### Per-finding validation\nValidation of Finding 1: <severity revision body>` |
| `Severity revisions vs. initial:` then bullets (smoke n=4) | security-reviewer.md (synthetic) | same as above |

**Strategy:** mandate `### Per-finding validation` heading + `Validation of Finding N:` per-entry prefix in the new contract. The parser's job is to enforce this single canonical shape; if the agent emits the legacy shapes (`Severity revisions vs.`), the parser fails them as non-conforming, which is the correct signal.

This is consistent with Plan 07-09's contract pattern: define a canonical emit shape; parse against the canonical shape; treat deviation as non-conforming. The agents already learned to emit `### Findings` + `### Cross-Cutting Patterns` + `### Threat Patterns` + `### Missed surfaces (optional)`; adding `### Per-finding validation (optional)` is mechanically the same.

## Q4 -- Plugin Version + Phase 7/8 Boundary

### SemVer Recommendation

**Recommended: 0.12.2 -> 0.13.0 MINOR.**

Rationale:

1. **0.x convention.** Per SemVer 2.0.0 [CITED: semver.org]: "Major version zero (0.y.z) is for initial development. Anything MAY change at any time. The public API SHOULD NOT be considered stable." However, the established project convention in this repo (per Phase 6 + 7 history) is to bump MINOR for contract-shape changes within the 0.x track.
2. **Contract-shape change.** Dropping the aggregate cap + adding a new per-finding-validation surface is a contract-shape change at the smoke-fixture API layer (the fixtures' assertion set changes; downstream consumers reading the fixtures' exit codes break if they assumed the aggregate-cap assertion). The skill invocation surface (`/lz-advisor.{plan,execute,review,security-review}`) does NOT change for users.
3. **Coordination with Phase 8 wip-discipline reversal.** Per `feedback_no_wip_commits.md` and 07-VERIFICATION.md final_closure note, Phase 8's wip-discipline reversal (REMOVE Plan 07-08 wip-discipline rule + bump 0.12.x -> 0.13.0 MINOR) is a coordinated breaking-fixture-API change. **Bundling both in 0.13.0 is the right move:** users only see one breaking-contract bump, both changes are documented in the same release notes.
4. **NOT 0.12.3 PATCH.** A PATCH bump is appropriate for "backward compatible bug fixes" (SemVer 2.0.0 §6); the per-section budget redesign is NOT backward-compatible at the smoke-fixture API. Anyone who wrote tooling against `D-reviewer-budget.sh`'s aggregate exit code would be surprised. PATCH is wrong.
5. **NOT 1.0.0 MAJOR.** Per CONTEXT.md D-06: "1.0.0 marketplace-readiness cut deferred until Phase 7 closes empirically AND a follow-up regression cycle confirms zero residuals." Phase 7's verify-chain-integrity scope is not feature-complete; this gap closure is the third such follow-up; another regression cycle is realistic. Defer 1.0.0 until at least one full Phase 8 + UAT replay cycle confirms zero residuals.

### Phase 7/8 Boundary Recommendation

**Recommended: Extend Phase 7 with Plans 07-14+ (gap closure) + Phase 8 stays as the wip-discipline reversal phase.**

Rationale:

1. **The pattern matches.** 07-VERIFICATION.md already has 5 amendment blocks (closure_amendment_2026_05_03, closure_amendment_2026_05_04, empirical_subverification_2026_05_03, ..., addendum_2026_05_06_user_directive). Adding 07-14+ for the contract redesign is the established pattern from Plans 07-09 / 07-10 / 07-11 / 07-12 / 07-13 -- each was a "close gap from prior plan" follow-up.
2. **The user invoked `/gsd-plan-phase 7 --gaps`.** Honour the user's framing: this is Phase 7 gap closure 3, not Phase 8 P1 Item 1. The Phase 8 worklist memory `project_phase_8_candidates_post_07.md` was written before the user's directive and was speculative; the directive is now load-bearing.
3. **Phase 8 stays as wip-discipline reversal.** It's a clean phase with a single coordinated change (REMOVE Plan 07-08 rule across SKILL.md, agents, references, smoke fixtures + bump 0.13.0 alongside the budget contract redesign).
4. **Coordination via shared 0.13.0.** The 0.13.0 release ships BOTH (a) the contract redesign from Plans 07-14+ AND (b) the wip-discipline reversal from Phase 8 Plan 08-01. Both are breaking-fixture-API changes; bundling is honest about the cost; users only take one bump.

**Alternative considered (REJECTED): cut to Phase 8 cleanly, leave Phase 7 frozen.**

- Pro: cleaner phase boundary; matches `project_phase_8_candidates_post_07.md` framing.
- Con: contradicts the user's `/gsd-plan-phase 7 --gaps` invocation; breaks the established 07-* amendment pattern; introduces a Phase 8 that has 2 unrelated concerns (wip + budget) competing for ownership.

**Decision:** Plans 07-14+ for the contract redesign; Phase 8 owns the wip-discipline reversal exclusively; both ship in 0.13.0. Confidence: MEDIUM (judgment call on the pattern continuity vs the worklist memory framing; the user directive is the disambiguator).

## Q5 -- Counterfactual Rollback Empirical Methodology

### Pre-registered acceptance criteria

Write the criteria BEFORE running the rollback experiment. Avoids post-hoc rationalization.

| Criterion | Threshold | Decision |
|-----------|-----------|----------|
| Reviewer 3-run mean drops by >=30% vs current 0.12.2 baseline | mean falls below 360w (down from 520w UAT / cross-checked against fresh smoke baseline) | Cross-pollination CONFIRMED -- shared-canon-read-in-context attention budget effect is empirically real; the per-section contract redesign must explicitly prevent canon-mediated drift surfaces (e.g., enumerate forbidden post-Findings prose patterns in `<do_not_include>`) |
| Reviewer 3-run mean drops by 10-30% vs baseline | mean falls in 365-470w range | INCONCLUSIVE -- re-run with n=5; if still inconclusive, treat as evidence of a partial cross-pollination effect (some structural + some general drift); contract redesign should still proceed with explicit forbidden-section enumeration as defense-in-depth |
| Reviewer 3-run mean drops by <10% vs baseline | mean stays >=470w | Cross-pollination DISCONFIRMED -- the regression is NOT canon-mediated; the cause is general Sonnet/Opus drift since Plan 07-09 baseline; per-section contract redesign is the right intervention regardless but the canon-byte-identity is not implicated |

### Sample-size guidance

- **n=3 minimum** (Plan 07-12 disconfirmation protocol, established convention)
- **n=5 if any single run is more than 1 std-dev from the mean** (use existing smoke std-dev ~52w as reference)
- **n=10 if the n=5 mean is in the inconclusive 365-470w range** (rare; only if the regression is genuinely noisy)

### Cost / value tradeoff

- **n=3:** ~$0.30, ~10min. Sufficient if the answer is clear.
- **n=5:** ~$0.50, ~15min. Use if n=3 is borderline.
- **n=10:** ~$1.00, ~30min. Only for genuine noise.

### Decision recommendation

**Run the experiment AFTER Plans 07-14+ contract redesign lands**, on a branch, with the rollback applied to security-reviewer.md but the contract redesign retained. The retained contract redesign is the intervention; the rollback is the diagnostic. If the redesign closes the regression at both agents on 0.12.3 (post-redesign baseline), the rollback experiment becomes optional (the practical question is closed even if the theoretical question stays open). If the redesign fails on reviewer specifically, the rollback's data disambiguates whether to (a) tighten the per-section contract harder or (b) reconsider the canon-byte-identity invariant.

## Q6 -- Phase 7 vs Phase 8 Boundary Justification

Covered in Q4 above. Summary: extend Phase 7 with Plans 07-14+; Phase 8 stays as the wip-discipline reversal phase; both ship in 0.13.0. Anchored in (a) user's `/gsd-plan-phase 7 --gaps` invocation, (b) established 5-amendment-chain pattern in 07-VERIFICATION.md, (c) clean separation of concerns (wip is independent of budget).

## Runtime State Inventory

This is a prompt-canon refactor + smoke-fixture-API change phase. Analogous to a rename in some respects (the contract surface is being renamed/restructured). Per CLAUDE.md GSD enforcement, walk all 5 categories:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None -- the agent prompts are read from disk on each session; no persisted state in databases / memory stores. | None |
| Live service config | None -- lz-advisor is a marketplace plugin, not a hosted service; there are no UI-configured workflows or external service registrations. | None |
| OS-registered state | None -- no scheduled tasks, pm2 processes, systemd units, or launchd plists registered by the plugin. The `claude` CLI is invoked transiently via `--plugin-dir`. | None |
| Secrets / env vars | None -- no env vars referenced by the prompts; no `.env` files. | None |
| Build artifacts | None -- the plugin has no build step (zero dependencies; pure markdown + YAML). However: cached plugin install at `~/.claude/plugins/cache/...` may carry stale agent.md files for users who installed earlier 0.12.x versions; **this is a marketplace-update concern, not a runtime-state concern**, and is handled by the standard `claude-code` plugin update flow. | Document in 0.13.0 release notes that users should update via marketplace. |

**Nothing found in any category that affects this gap closure beyond the agent.md + smoke-fixture file edits themselves.**

## Common Pitfalls

### Pitfall 1: Adding the new section without enumerating it in `<do_not_include>` for the legacy emission patterns

**What goes wrong:** The agent might emit BOTH the new canonical `### Per-finding validation` heading AND the legacy `Severity revisions vs.` prose, doubling the surface.

**Why it happens:** Models hedge -- when given a new authorized pattern, they sometimes emit both old and new to be "safe".

**How to avoid:** Explicitly forbid the legacy patterns in `<do_not_include>` with the literal strings: `Severity revisions vs.`, `Severity revisions:`, post-Findings prose without a header. Worked example in the contract.

**Warning signs:** Smoke fixture detects both patterns; aggregate word count balloons even though per-section caps appear honored.

### Pitfall 2: Smoke fixture parser shadowing the new surface as part of the existing Findings extraction

**What goes wrong:** The current `D-reviewer-budget.sh` extracts Findings as `awk '/^### Findings/,/^### Cross-Cutting Patterns/'`. If the new `### Per-finding validation` section is between Findings and CCP, the awk range silently includes it, inflating the per-finding entry count and triggering false `[ERROR] Findings entry N: 90 words (>22 outlier soft cap)` alerts.

**Why it happens:** awk range patterns are inclusive of intermediate sections.

**How to avoid:** Update the awk range to terminate on EITHER `### Cross-Cutting Patterns` OR `### Per-finding validation` (whichever fires first). New extraction pattern:

```bash
awk '
  /^### Findings/ {flag=1; next}
  flag && /^### / {flag=0}
  flag {print}
' "$OUT" > "$FINDINGS_BODY"
```

This terminates on ANY subsequent `###` heading, which is more robust to future surface additions.

**Warning signs:** Findings entry count in fixture log > visible Findings count in agent output.

### Pitfall 3: Reviewer + security-reviewer divergence on the new contract section ordering

**What goes wrong:** If the contract is added to reviewer.md and security-reviewer.md at different times (e.g., separate plans), one agent sees `### Per-finding validation` between Findings and CCP while the other sees it after Missed surfaces. The shared canon's "what does the contract authorize" inference becomes inconsistent.

**Why it happens:** Sequential plan execution; one plan lands first.

**How to avoid:** Single atomic plan touching both `agents/reviewer.md` and `agents/security-reviewer.md` `## Output Constraint` sections. Same section ordering in both files: `### Findings -> ### Per-finding validation (optional) -> ### Cross-Cutting Patterns / Threat Patterns -> ### Missed surfaces (optional)`.

**Warning signs:** Reviewer fixture green; security-reviewer fixture red on the same revision (or vice versa).

### Pitfall 4: Effort calibration drift

**What goes wrong:** The contract redesign succeeds on `effort: medium`; someone later bumps to `xhigh` thinking "more compute = better quality"; budget regresses again.

**Why it happens:** Reviewer + security-reviewer effort was deliberately downgraded medium per Plan 07-09 amendment 2026-05-02 (CONTEXT.md D-04). The reasoning is non-obvious to drive-by editors.

**How to avoid:** Add a comment in the agent.md frontmatter: `# effort: medium per Plan 07-09 amendment 2026-05-02 (do not bump without re-running word-budget regression suite)`. NOTE: YAML doesn't support inline comments after key-value pairs in all parsers; alternative: add the rationale as a top-level prose paragraph immediately after the frontmatter.

**Warning signs:** Effort field changed; smoke fixtures regress; UAT replay shows verbose justification chains.

## Code Examples

### Example 1: Recommended `## Output Constraint` redesign for `agents/reviewer.md`

```markdown
## Output Constraint

Your response MUST begin with the literal text `### Findings` on its own line.
Section ordering: Findings -> Per-finding validation (optional) -> Cross-Cutting
Patterns -> Missed surfaces (optional). Section budgets per the
<output_constraints> block below.

<output_constraints>
  <section name="findings" type="repeating">
    <per_entry max_words="22" outlier_soft_cap="28"/>
    <max_count>15</max_count>
    <required>true</required>
  </section>
  <section name="per_finding_validation" type="repeating" optional="true">
    <per_entry max_words="60"/>
    <required_when_emitted>
      <heading>### Per-finding validation</heading>
      <per_entry_prefix>Validation of Finding N:</per_entry_prefix>
    </required_when_emitted>
    <description>
      Optional severity-revision or confirmation prose, one paragraph per
      finding. Use when severity differs from the executor's assessment OR
      when confirmation rationale is non-obvious. Skip on routine
      confirmations.
    </description>
  </section>
  <section name="cross_cutting_patterns" max_words="160" required="true">
    <heading>### Cross-Cutting Patterns</heading>
  </section>
  <section name="missed_surfaces" max_words="30" optional="true">
    <heading>### Missed surfaces (optional)</heading>
  </section>
  <aggregate_cap>none</aggregate_cap>
  <do_not_include>
    <item>Preamble or throat-clearing</item>
    <item>"Severity revisions vs. {initial,executor}:" prose without the canonical `### Per-finding validation` heading</item>
    <item>Any section heading not enumerated in this constraints block</item>
    <item>Post-Findings prose paragraphs without the `Validation of Finding N:` per-entry prefix</item>
  </do_not_include>
</output_constraints>

[Existing fragment-grammar shape rules + worked examples remain
unchanged. The XML <output_constraints> block above SUPERSEDES the
prior aggregate-cap prose.]
```

### Example 2: Smoke-fixture assertion redesign

```bash
# In D-reviewer-budget.sh -- REMOVE the aggregate assertion (lines 165-181 in current).
# REPLACE with:

# 1. KEEP per-finding entry word-count check (existing check-entries.mjs;
#    update thresholds 20w -> 22w / 25w -> 28w to match user directive table).
# 2. KEEP CCP <=160w check (existing).
# 3. KEEP Missed surfaces <=30w check (existing).
# 4. ADD per-finding-validation <=60w check (new check-pfv-entries.mjs).
# 5. REMOVE aggregate <=300w check (entire AGG_BODY block).

# Per-finding-validation parser
PFV_BODY="$SCRATCH/pfv-body.txt"
awk '
  /^### Per-finding validation/ {flag=1; next}
  flag && /^### |^---|^\*\*Verdict scope/ {flag=0}
  flag {print}
' "$OUT" > "$PFV_BODY" || true

# Per-entry word count via Node ESM (mirrors existing pattern)
PFV_CHECK_SCRIPT="$SCRATCH/check-pfv-entries.mjs"
cat > "$PFV_CHECK_SCRIPT" << 'EOF'
import { readFileSync } from 'node:fs';
const body = readFileSync(process.argv[2], 'utf8');
const PFV_RE = /^Validation of Finding \d+:\s+([\s\S]+?)(?=\n\nValidation of Finding|\n*$)/gm;
const matches = [...body.matchAll(PFV_RE)];
if (matches.length === 0) {
  console.log('[OK] Per-finding validation: section absent (optional)');
  process.exit(0);
}
console.log(`[INFO] Per-finding validation: ${matches.length} entries`);
let bad = 0;
matches.forEach((m, idx) => {
  const wc = m[1].trim().split(/\s+/).filter(Boolean).length;
  if (wc > 60) {
    console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>60 cap)`);
    bad++;
  } else {
    console.log(`[OK] Per-finding validation entry ${idx + 1}: ${wc} words (<=60 cap)`);
  }
});
process.exit(bad === 0 ? 0 : 1);
EOF

if ! node "$PFV_CHECK_SCRIPT" "$PFV_BODY"; then
  FAIL=1
fi
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Aggregate output-length cap (single `<=300w` total) | Per-section budgets in XML `<output_constraints>` block | Empirically falsified 2026-05-06 (lz-advisor 5/5 over) + Anthropic Apr 2026 postmortem (3% coding-quality drop on aggregate cap) | Universal. Per-section is the 2026 standard pattern. |
| Markdown prose constraints | XML-tagged structural constraints | 15-20% better instruction compliance on Claude per cloud-authority Jan 2026 + AgentIF | Sonnet 4.6 / Opus 4.7 +; Anthropic-specific |
| Forbid emergent agent emissions | Authorize + budget the patterns the model has chosen to surface | User directive 2026-05-06 + Anthropic best practices "Constraints tell Claude what to leave out, not just what to include" | When the emission is informationally valuable |

**Deprecated/outdated:**

- **Aggregate `<=300w` cap.** Empirically falsified at lz-advisor scale + at Anthropic-internal scale. Replaced by per-section.
- **Effort `xhigh` for budget compliance.** Plan 07-09 amendment already retired this; effort calibration is the wrong lever for verbosity (the right lever is structural -- per-section budgets in XML).
- **Hard-rules ALL-CAPS layer for word-budget.** Plan 07-10 explicitly rejected; Anthropic Apr 2026 evidence reinforces.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The per-finding-validation surface emission pattern (`Validation of Finding N:` etc.) will continue to manifest under per-section budgets | Q1c, Architecture Patterns | If suppressed, the per-finding-validation budget allocation goes unused and the new contract overshoots by exactly the per-finding-validation surface budget (60w x finding count). Low harm. |
| A2 | The 60w per-finding cap is empirically defensible based on n=5 sample | Q1b | If the typical case is much higher (e.g., 80-100w on CVE-rich findings), the cap forces information loss. Re-calibrate empirically after first 3-run smoke against the redesigned contract. |
| A3 | XML `<output_constraints>` will bind on Sonnet 4.6 / Opus 4.7 with `effort: medium` | Architecture Patterns | If the XML pattern doesn't bind (model ignores), fall back to prose constraints + ALL-CAPS for the per-finding-validation cap specifically. Plan 07-09 + 07-10 demonstrated prose binds at medium effort for the existing per-section caps; XML is expected to be at LEAST as effective. |
| A4 | Cross-pollination is real but bounded by the per-section contract redesign | Q2 | If the redesign closes security-reviewer but not reviewer (or vice versa), the rollback experiment (Q5) is the disambiguation; canon-byte-identity may need re-evaluation. |
| A5 | Plan 07-08 wip-discipline reversal is the right Phase 8 owner | Q4, Q6 | If the user prefers wip-discipline reversal in Phase 7 (pulled forward), the SemVer bump strategy still stands but the phase numbering shifts. Coordinate with user before plan execution if uncertain. |
| A6 | Project convention is to bump MINOR for contract-shape changes within 0.x | Q4 | If the project convention is actually PATCH (per strict SemVer 0.x reading), the bump is wrong. CHECK against `git log` of prior version bumps before committing. |

**If this table is empty:** All claims in this research were verified or cited. (It's not empty; flagged claims need confirmation.)

## Open Questions

1. **Are there additional emergent emission patterns we haven't observed yet?**
   - What we know: 3 patterns observed across n=5 (`Validation of Finding N:`, `Severity revisions vs. initial:`, `Severity revisions vs. executor:`).
   - What's unclear: whether other 0.12.x scenarios (e.g., a multi-CVE security review, a refactor review with no severity-revision) trigger different surfaces.
   - Recommendation: Plan 07-14 should run `D-reviewer-budget.sh` + `D-security-reviewer-budget.sh` 5x across diverse scenarios (unvalidated-handler synthetic + Compodoc UAT + a multi-CVE synthetic + a refactor synthetic) before finalizing the `<do_not_include>` enumeration.

2. **Does the advisor agent's residual-advisor-budget on the Compodoc + Storybook scenario require its own per-section redesign?**
   - What we know: ~143w visual estimate on S1 plan; n=1 visual; not fixture-grade.
   - What's unclear: whether D-advisor-budget.sh against session-1-plan.jsonl confirms or refutes; whether the executor's plan repackaging is the variable.
   - Recommendation: Plan 07-14 should include the advisor extraction-script run as a Wave 0 task. If confirmed, follow Plan 07-10 fragment-grammar pattern (already proven on 0.12.1); if not, defer per Phase 8 worklist item 9.

3. **Will the byte-identity preservation hold across both reviewer.md and security-reviewer.md when the new section ordering is applied?**
   - What we know: shared canon is `<context_trust_contract>` + `<orient_exploration_ranking>` (per `git grep` cross-file SHA256). The `## Output Constraint` section is NOT byte-identical -- it's per-agent customized.
   - What's unclear: introducing the same XML `<output_constraints>` shape in both agents may be the right move, but the per-finding word target differs (reviewer 22w / security-reviewer 22w + OWASP tag prefix accommodation).
   - Recommendation: ship the XML shape as byte-identical structurally (same `<section>` element names, same attribute ordering); per-cap NUMBERS may differ per agent if the empirical evidence justifies.

4. **Should the `<verify_request>` and `<pre_verified>` schemas also move to a unified `<output_constraints>` framing?**
   - What we know: those schemas already use XML and bind well.
   - What's unclear: whether bundling all output structure under one parent block improves coherence.
   - Recommendation: out of scope for this gap closure; consider for 1.0.0 polish phase.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `claude` CLI | UAT replay + smoke fixtures | Yes (verified by current 0.12.2 fixtures running) | (current marketplace install) | -- |
| Node.js | Smoke fixture per-entry parser scripts | Yes (FNM-managed; ESM supported) | -- | -- |
| Git Bash | Smoke fixture shell | Yes (Windows arm64 default) | -- | -- |
| `awk` | Section extraction | Yes | -- | -- |
| `rg` | Section presence check (already in fixtures) | Yes (Chocolatey x86_64 under QEMU) | -- | -- |
| `cygpath` | Windows path translation | Yes (existing fixture pattern) | -- | -- |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

**Plugin file system access:** All target files (`agents/{reviewer,security-reviewer}.md`, `D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`, `D-advisor-budget.sh`) exist and are tracked in git. No new files needed for the redesign. Plan 07-14 may add `D-advisor-budget.sh` adjustments (per Q3 Wave 0 gap 7).

## Validation Architecture

(See Q3 Validation Architecture section above for the full table -- it covers Test Framework, Phase Requirements -> Test Map, Sampling Rate, and Wave 0 Gaps.)

### Test framework summary

| Property | Value |
|----------|-------|
| Framework | Bash + awk + Node ESM (existing pattern) |
| Per-task quick run | `bash D-reviewer-budget.sh` (~$0.10, 2min) |
| Wave 0 gate | 3-run mean across all 3 D-*-budget.sh fixtures (~$0.90, 10min) |
| Phase gate | 3-run mean + UAT replay subset (S1+S3+S4) (~$3, 30min) |

## Cross-pollination mitigation summary

| Strategy | Decision |
|----------|----------|
| Preserve byte-identical canon (`<context_trust_contract>` + `<orient_exploration_ranking>`) | KEEP. Project invariant since Phase 6 Plan 06-05. |
| Add per-section budget XML block to `agents/{reviewer,security-reviewer}.md` `## Output Constraint` | ADD. Per-section budgets bound the drift surface explicitly. |
| Enumerate forbidden post-Findings prose patterns in `<do_not_include>` | ADD. Defense-in-depth against canon-mediated drift. |
| Run counterfactual rollback experiment (Q2c) | DEFER until after redesign lands; run as diagnostic if redesign partial-fails. |
| Parameterize canon by role | REJECT. Breaks byte-identity invariant; doesn't address the cause. |
| Refactor canon as imported reference | REJECT. Same coupling problem; loses observability. |

## Plugin version + Phase 7/8 boundary summary

- **SemVer:** 0.12.2 -> **0.13.0 MINOR**, bundled with Phase 8 wip-discipline reversal
- **Phase boundary:** Extend Phase 7 with Plans 07-14+; Phase 8 stays as wip-discipline reversal phase
- **Coordination:** 0.13.0 release ships both contract redesign AND wip-discipline removal

## Risks and Open Questions

1. **A2 risk -- 60w cap may be too tight for CVE-rich security findings.** Mitigation: re-calibrate empirically after first 3-run smoke. Worst case: bump to 75w via amendment; not a structural redesign.
2. **A4 risk -- cross-pollination not bounded by per-section budget alone.** Mitigation: run rollback experiment (Q5); add explicit forbidden-pattern enumeration in `<do_not_include>`; if both fail, reconsider canon-byte-identity invariant in Phase 8.
3. **Q1c risk -- Optional-with-stable-header may still see legacy `Severity revisions vs.` emission.** Mitigation: explicit `<do_not_include>` enumeration of legacy strings.
4. **Q3 risk -- new fixture parser shadowing.** Mitigation: terminate awk ranges on ANY `### ` heading (covered in Pitfall 2).
5. **Q4 risk -- 0.13.0 bundling with wip-discipline confuses release notes.** Mitigation: clear release-note structure with separate sub-sections for budget redesign vs wip-discipline.

**Suggested further empirical experiments:**

- **Diversify smoke scenarios:** add a multi-CVE synthetic + a refactor synthetic to the smoke baseline to surface other emergent patterns.
- **Run `D-advisor-budget.sh` against `session-1-plan.jsonl`** to resolve the residual-advisor-budget question (Phase 8 worklist item 9).
- **Empirical 60w vs 75w A/B** if first 3-run smoke shows information loss on CVE-rich findings.

## Closing Recommendations

Ranked by load-bearing-ness for the gap-closure plans:

| # | Recommendation | Rationale | Load-bearing |
|---|----------------|-----------|--------------|
| 1 | Adopt user's per-section budget table with the new <=60w per-finding-validation cap; DROP aggregate cap | Empirically validated by n=5 0.12.2 + Anthropic Apr 2026 postmortem evidence | LOAD-BEARING for FIND-D + GAP-D-budget-empirical closure |
| 2 | Express budgets in XML `<output_constraints>` block (not prose) | 15-20% better instruction compliance on Claude per AgentIF + cloud-authority | LOAD-BEARING for the redesign actually binding |
| 3 | Make per-finding-validation OPTIONAL with stable `### Per-finding validation` heading and `Validation of Finding N:` per-entry prefix | Aligns with empirical signal (model self-paces); enables single-regex parser; matches existing optional-section convention | LOAD-BEARING for smoke-fixture parser stability |
| 4 | Update `D-reviewer-budget.sh` + `D-security-reviewer-budget.sh` to remove aggregate assertion and add per-finding-validation parser | Required for the contract to be testable | LOAD-BEARING for closure verification |
| 5 | Bump 0.12.2 -> 0.13.0 MINOR coordinated with Phase 8 wip-discipline reversal | Single breaking-fixture-API bump; honest about cost; matches established 0.x convention | Important for coordination but not load-bearing for FIND-D |
| 6 | Preserve byte-identical canon; address cross-pollination via `<do_not_include>` enumeration | Project invariant; the right intervention is at the drift surface, not the shared frame | Important for cross-pollination mitigation |
| 7 | Extend Phase 7 with Plans 07-14+; Phase 8 stays as wip-discipline reversal | Honour user `/gsd-plan-phase 7 --gaps` invocation; matches established 5-amendment chain | Process / framing recommendation |
| 8 | Run counterfactual rollback experiment AFTER redesign as diagnostic | Empirical validation of cross-pollination hypothesis without blocking redesign delivery | Diagnostic; not closure-blocking |

## Sources

### Primary (HIGH confidence)

- [Anthropic April 2026 Postmortem](https://www.anthropic.com/engineering/april-23-postmortem) -- Direct evidence that aggregate output-length caps degrade reasoning quality (3% coding-quality drop). Reverted within 4 days. Confidence anchor for "drop aggregate cap" recommendation.
- [Anthropic Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) -- "Context as finite resource with diminishing marginal returns; attention budget; per-token depletion." Confidence anchor for shared-canon-read-in-context attention-budget effect.
- [Anthropic Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) -- "Small changes in phrasing could make the difference between efficient research and wasted effort." Confidence anchor for cross-pollination phenomenon.
- [Anthropic Claude 4 Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) -- "Constraints tell Claude what to leave out, not just what to include. Each constraint added is one less editing decision required after generation." Confidence anchor for `<do_not_include>` negative constraints.
- [Semantic Versioning 2.0.0](https://semver.org/) -- "Major version zero (0.y.z) is for initial development. Anything MAY change at any time." Confidence anchor for SemVer bump strategy.

### Secondary (MEDIUM-HIGH confidence)

- [AgentIF Benchmark (Tsinghua KEG)](https://keg.cs.tsinghua.edu.cn/persons/xubin/papers/AgentIF.pdf) -- "Constraints fall into formatting, semantic, tool. Avg 11.9 constraints per real instruction." Anchors per-section pattern as 2026 standard.
- [Cloud Authority XML Comeback Jan 2026](https://cloud-authority.com/xml-is-making-a-comeback-in-prompt-engineering-and-it-makes-llms-better) -- "XML-structured prompts produce 15-20% better instruction compliance on Claude compared to plain text."
- [Claude Code Plugin Dependencies Documentation](https://code.claude.com/docs/en/plugin-dependencies) -- Plugin SemVer constraint conventions; tag naming `{plugin-name}--v{version}`.
- [BuildMVPFast System Prompt Design 2026](https://www.buildmvpfast.com/blog/system-prompt-design-best-practices-llm-instructions-engineering-2026) -- "Prompts as production code; version control; regression testing."
- [APXML Output Length Control](https://apxml.com/courses/intro-large-language-models/chapter-3-communicating-with-llms-prompts/controlling-output-length-format) -- "LLMs generate text probabilistically; length constraints are not deterministic but significantly increase likelihood of desired length."

### Tertiary (LOW confidence -- training-knowledge cross-checks only)

- (None used; all claims verified against named sources.)

### In-repository (project context)

- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` -- 5 amendment blocks; addendum_2026_05_06 user directive; final_closure 2026_05_05; empirical_subverification 2026_05_06.
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-UAT-REGRESSION-0.12.2.md` -- sealed UAT report; n=5 evidence.
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.12.2/D-security-reviewer-budget*.log` -- 4 smoke run logs.
- `D:/projects/github/LayZeeDK/ngx-smart-components/plans/review-report.md` -- S3 UAT 520w aggregate.
- `D:/projects/github/LayZeeDK/ngx-smart-components/plans/security-review-report.md` -- S4 UAT 407w aggregate.
- `plugins/lz-advisor/agents/reviewer.md` lines 52-159 -- current Output Constraint to be redesigned.
- `plugins/lz-advisor/agents/security-reviewer.md` lines 52-163 -- current Output Constraint to be redesigned.
- `plugins/lz-advisor/agents/advisor.md` lines 51-101 -- current Output Constraint (Plan 07-10 fragment-grammar template; reference baseline).
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-{advisor,reviewer,security-reviewer}-budget.sh` -- existing fixtures to update.
- Memory `project_phase_8_candidates_post_07.md` -- Phase 8 candidate list (P1 Item 1 was contract redesign; superseded by user 2026-05-06 directive routing this to Plans 07-14+).
- Memory `feedback_no_wip_commits.md` -- Phase 8 wip-discipline reversal context.

## Metadata

**Confidence breakdown:**

- Per-section budget design (Q1): HIGH -- multiple authoritative anchors + empirical n=5 evidence + user directive
- XML expression form (Q1, Q3): HIGH -- AgentIF + Anthropic + cloud-authority converge
- Per-finding-validation 60w cap defensibility (Q1b): MEDIUM-HIGH -- empirical median + outlier accommodation; pre-empirical re-calibration is the natural mitigation
- Optional-with-stable-header (Q1c): HIGH -- aligns with empirical signal + existing optional-section convention
- Cross-pollination mitigation strategy (Q2a): MEDIUM-HIGH -- byte-identity preservation rationale is strong; per-section bound is hypothesis-mode until empirically validated post-redesign
- Counterfactual rollback methodology (Q5): MEDIUM -- design is sound; whether to actually run is judgment call
- Smoke-fixture redesign (Q3): HIGH -- mechanical extension of existing pattern
- SemVer bump strategy (Q4): MEDIUM -- judgment call between PATCH (strict 0.x) and MINOR (project convention); recommendation hinges on coordination with Phase 8 wip-discipline
- Phase 7/8 boundary (Q6): MEDIUM -- judgment call honoring user invocation pattern

**Research date:** 2026-05-06
**Valid until:** 2026-06-05 (1 month; faster-moving prompt-engineering space than typical infrastructure research)

---

*Phase: 07-address-all-phase-5-x-and-6-uat-findings*
*Research: GAP-3 Per-Section Budgets (closure of FIND-D + GAP-D-budget-empirical)*
*Researcher: Claude (gsd-phase-researcher)*
