# Phase 7: Address all Phase 5.x and 6 UAT findings - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the verification-chain-integrity failure surface that the 8-skill UAT chain on plugin 0.9.0 (against `ngx-smart-components` Compodoc + Storybook scenario, sessions `a75fae2f` / `bf522c6e` / `48bd9cc5` / `fc44ddc9` / `c28c99cb` / `e01a5a7e` / `5cb44a72` / `188bac4f`; 64 tests, 45 PASS, 19 ISSUES) plus 5 prior 0.8.9 UATs surfaced. Phase 7 ships paired upstream-prevention + downstream-detection rules across the three Opus agents, all four SKILL.md files, the shared context-packaging reference, and a smoke-test suite exercising the multi-hop chain.

The phase delivers six themed plans (5 fix plans + 1 verification plan) targeting eight candidate findings from `PHASE-7-CANDIDATES.md`:

- **Finding A** (silent apply-then-revert reconciliation; n=1 in-skill empirical confirmation but needs n>=3 across heterogeneous override scenarios)
- **Finding B.1** (pv-* carry-forward gap + synthesis mandate for orient-phase empirical findings)
- **Finding B.2** (executor confabulates content under "Pre-verified Claims" header without verification)
- **Finding C** (4-guard cross-skill confidence-laundering chain: hedge propagation, cross-skill hedge tracking, version-qualifier anchoring, scope-disambiguated provenance markers)
- **Finding D** (word-budget regression: security-reviewer +46% worsening, reviewer +37%, advisor +9-21%)
- **Finding E.1** (apply-without-verify on surviving hedge markers in plan rationale)
- **Finding E.2** (apply-without-verify on EXPLICIT Run:/Verify: directives in numbered plan steps; cost-cliff at long-running async validations)
- **Finding F** (reviewer agent has no web-tool grant by design; Class-2 questions surfaced by reviewer cannot be self-verified)
- **Finding G** (review skill does not provide safety net for verify-before-commit gaps in changed code)
- **Finding H** (executor self-confabulates pv-* anchor from claimed framework knowledge despite trust-contract carve-out firing - refines G1+G2 empirical residual root cause from "rule miss" to "rule bypass via self-anchor")
- **Silent-resolve sub-pattern** (plan SKILL.md silently drops numbered input findings without acknowledgment)

Phase 7 also folds Phase 6 G1+G2 empirical residuals into Plan 07-01 as acceptance criteria; Phase 6 06-VERIFICATION.md gets a final amendment downgrading PASS-with-caveat to PASS once Plan 07-01 verification passes.

**Not in scope:**
- New skills
- New allowed-tools surface (existing per-skill allowed-tools profiles A/B/C from Phase 5.4 D-11 stay)
- Marketplace re-publishing beyond version bump
- Agent architectural changes (`maxTurns: 3`, `model: opus`, `effort: high|xhigh` stay)
- Pro/Free tier UAT cross-tier verification (structurally impossible from Team subscription)
- README "Recommended prompt shape" section (deferred from Phase 5.5 / 5.6 / 6, deferred again)
- Retroactive refactor of Pattern A/B inline blocks (Phase 5.6 Plan 06/07 canon stays)
- Reviewer tool grant extension (Option 3 of Finding F; permanently deferred per OWASP / arXiv 2601.11893 / Claude Code Issue #20264 on subagent privilege escalation)
- 1.0.0 marketplace-readiness cut (deferred until Phase 7 closes empirically AND a follow-up regression cycle confirms)
- Hard-rules layer for word-budget (deferred unless 0.10.0 cycle confirms hybrid is insufficient; Anthropic's Apr 2026 ablation showed ~3% coding-quality cost from cap addition)

</domain>

<decisions>
## Implementation Decisions

### Plan structure (foundational)

- **D-01:** Phase 7 ships **6 themed plans** matching the empirical failure-class clustering across 13 UAT cycles, with explicit ordering. Plan 07-01 lands first because its pv-* validation rule is the empirical anchor for downstream guards. Plans 07-02..07-05 may run in any order after 07-01; 07-06 lands last:

  - **07-01: pv-* synthesis discipline** - Closes B.1 (carry-forward + synthesis mandate) + B.2 (XML-format mandate, source+evidence required, plain-bullet "Pre-verified Claims" sections forbidden) + H (block confabulated synthesis on Class-2/3/4 questions; ToolSearch availability rule fires before pv-* synthesis when input contains agent-generated source). Touches `references/context-packaging.md` Common Contract Rule 5 strengthening + new pv-validation rule + 4 SKILL.md `<context_trust_contract>` byte-identical canon (Plan 06-05 G2 supplement). Acceptance criteria include G1+G2 empirical closure (re-run plan-fixes + execute-fixes UAT subset; verify ToolSearch availability rule fires OR pv-* synthesis structurally rejects empty-evidence blocks).
  - **07-02: verify-skip discipline (verify-before-commit + safety net)** - Closes A (Reconciliation policy extension to apply-then-revert flow) + E.1 (advisor refuse-or-flag rule in 3 agent prompts when source material contains hedge markers) + E.2 (plan-step-shape rule in lz-advisor.execute/SKILL.md: numbered Run:<cmd> + Verify:<conditions> directives MUST execute as Bash before commit) + G (review-skill scan criterion for hedged claims without `Verified:` trailer / pv-* anchor) + silent-resolve sub-pattern (plan-skill output convention: ALL numbered input findings receive explicit disposition). Touches `agents/{advisor,reviewer,security-reviewer}.md` + `lz-advisor.execute/SKILL.md` `<verify_before_commit>` block + `lz-advisor.review/SKILL.md` scan criterion + `lz-advisor.plan/SKILL.md` output convention.
  - **07-03: confidence-laundering guards (Finding C)** - Four guards: (i) hedge propagation rule in `references/context-packaging.md` Common Contract; (ii) cross-skill hedge tracking in `references/orient-exploration.md`; (iii) version-qualifier anchoring rule in `references/context-packaging.md` Common Contract; (iv) scope-disambiguated provenance markers (`scope: api-correctness`, `scope: security-threats`, etc.) on each SKILL.md output template + Common Contract.
  - **07-04: word-budget enforcement (Finding D)** - All 3 agent prompts (advisor / reviewer / security-reviewer) get descriptive triggers + worked example + structural sub-caps (per D-03). Three new smoke fixtures: `D-advisor-budget.sh`, `D-reviewer-budget.sh`, `D-security-reviewer-budget.sh` in `.planning/phases/05.4-.../smoke-tests/`.
  - **07-05: reviewer web-tool design (Finding F)** - Option 1+2 in tandem (per D-04). Touches `lz-advisor.review/SKILL.md` Phase 1 (pre-emptive Class-2 surface enumeration) + `agents/reviewer.md` (structured `<verify_request>` block emit) + `lz-advisor.review/SKILL.md` Phase 3 (executor parses `<verify_request>` + re-invokes reviewer once with anchors).
  - **07-06: smoke fixture + UAT replay + version bump + VERIFICATION.md** - Single comprehensive multi-hop chain fixture exercising plan->execute->review->plan-fixes->execute-fixes->security-review with synthesized hedge marker, version qualifier, and Class-2 surface; subset UAT replay (minimum: plan-fixes + execute-fixes + security-review per Phase 6 amendment 5 precedent); plugin version bump 0.9.0 -> 0.10.0; `07-VERIFICATION.md` produced AND `06-VERIFICATION.md` amendment 6 written downgrading PASS-with-caveat to PASS.

### Phase 6 G1+G2 ownership (foundational)

- **D-02:** **Phase 6 G1+G2 empirical residuals fold into Phase 7 Plan 07-01** as acceptance criteria. Per Finding H, the residual root cause is rule-bypass-via-self-anchor (not rule-miss); Plan 07-01's structural pv-* validation closes it as a side-effect of H's fix. Phase 6 06-VERIFICATION.md gets amendment 6 (written by Plan 07-06) downgrading PASS-with-caveat to PASS once Plan 07-01 verification passes. Phase 6 stays in `executing` state for milestone-audit purposes until Phase 7 closes.

### Word-budget enforcement (Finding D, Plan 07-04)

- **D-03:** Hybrid pattern: **descriptive triggers + worked example + structural sub-caps + per-agent smoke fixtures**. Research-backed; no contention across sources.

  - **Phrasing style:** descriptive prose matching Anthropic's own production prompt (PromptHub Claude 4 analysis). Reserve ALL-CAPS for safety-critical rules only (existing Common Contract rules 5/5a/6 stay imperative; word-budget joins descriptive layer alongside Output Constraint).
  - **Sub-cap structure** for `agents/reviewer.md` and `agents/security-reviewer.md`:
    - Each Findings block: <=80w
    - Threat Patterns / Cross-Cutting Patterns block: <=160w
    - Missed-surfaces block: <=30w
    - Total: <=300w
  - **Advisor (`agents/advisor.md`)** stays 100w with no sub-caps (single Strategic Direction block; existing Density example from Phase 5.5 D-04 already worked).
  - **Per-agent smoke fixtures:**
    - `D-advisor-budget.sh` - invokes advisor on canonical Compodoc+Storybook scenario; asserts SD <=100w
    - `D-reviewer-budget.sh` - invokes reviewer on canonical scenario; parses sections by header regex; asserts each Findings block <=80w, Threat Patterns <=160w, total <=300w
    - `D-security-reviewer-budget.sh` - same shape as D-reviewer-budget.sh but for security-reviewer
  - **Closure criterion:** all three smoke fixtures green on plugin 0.10.0 + observed word counts in Phase 7 Plan 07-06 UAT replay <=cap (no agent exceeds its cap on representative inputs).
  - **Anchored in:** Anthropic Claude 4 system prompt analysis (PromptHub) + Blockchain Council Output Control "firm budget + strict structure" guide + claudefa.st three-layer self-validating architecture.

### Reviewer web-tool design (Finding F, Plan 07-05)

- **D-04:** **Option 1+2 in tandem.** Reviewer tool grant stays `["Read", "Glob"]` (preserves principle of least privilege; Option 3 explicitly rejected per OWASP + arXiv 2601.11893 + Claude Code Issue #20264).

  - **Option 1 (pre-emptive Class-2 scan in executor):** `lz-advisor.review/SKILL.md` Phase 1 (Scan) gains an explicit step: "Before consulting the reviewer, identify likely Class-2 surfaces in the changed code (vendor library imports, framework version-conditional patterns, build-tool target configs) and pre-empt them with WebSearch / WebFetch + pv-* synthesis. The pre-empted answers anchor the reviewer's findings; the reviewer can then close hedges that the pre-emption resolved." Anchored in Qwen Code production default (deterministic-first, LLM-second).
  - **Option 2 (reviewer escalation hook):** `agents/reviewer.md` system prompt gains a directive to emit a structured `<verify_request question="..." class="2" anchor_target="pv-..."/>` block when the reviewer cannot resolve a Class-2 question. `lz-advisor.review/SKILL.md` Phase 3 (Output) detects these blocks before final user output: if present, the executor performs the requested verification (WebSearch / WebFetch), synthesizes pv-* blocks, and re-invokes the reviewer **once** with the new anchors so the reviewer can close the hedge. **One-shot only** (Spotify Honk principle); no iterative loop.
  - **Anchored in:** OWASP AI Agent Security Cheat Sheet (structured-output as security control) + InfoQ Least-Privilege AI Agent Gateway (gateway architecture, MCP-style discovery + JSON-RPC structured calls) + Spotify Honk one-shot pass/fail principle.

#### Amendment 2026-05-02 -- D-04 effort de-escalation (Plan 07-09 Gap closure for FIND-D + GAP-D-budget-empirical)

**Trigger:** 07-UAT.md gaps (reviewer aggregate 396w / 32% over, security-reviewer aggregate 414w / 38% over, security-reviewer Missed surfaces 33w / 10% over) on plugin 0.11.0 after the smoke-fixture extraction defects were repaired in commit `0065425`. Plan 07-04 landed structural sub-cap PROSE; the prose alone does not bind output length on Sonnet 4.6 / Opus 4.7 with `effort: xhigh`.

**Amendment:** Reviewer + security-reviewer effort frontmatter changes from `xhigh` to `medium`. Advisor stays at `effort: high` (passing per 88w empirical baseline; same descriptive-prose technique works at high).

**Rationale anchored in Anthropic Best Practices ([Calibrating effort and thinking depth](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)):**

> "Good for cost-sensitive use cases that need to reduce token usage while trading off intelligence."

Lz-advisor reviewer + security-reviewer roles per CONTEXT.md (Plan 07-05 D-04) are synthesis-of-packaged-findings: the executor's Phase 1 already did the exploration; Plan 07-05 Class-2 escalation hook handles the genuinely-hard cases via Option 1 (pre-emptive scan in executor) + Option 2 (`<verify_request>` re-invocation). The base-case reviewer is doing synthesis-and-validation, not exploration. Per Anthropic's Apr 23, 2026 postmortem ([engineering/april-23-postmortem](https://www.anthropic.com/engineering/april-23-postmortem)), Opus 4.7 at xhigh produces verbose justification chains by design ("notable behavioral quirk: tends to be quite verbose"); fighting this verbosity in prose is fighting the model's training. Effort calibration is the documented Anthropic-preferred lever.

**Reversion criterion (binding):** Empirical UAT replay on plugin 0.12.0 must show the reviewer + security-reviewer code-quality recall does NOT drop more than 15% on Class-1 (API-correctness) findings vs the prior xhigh baseline. Recall is measured by:

- Number of confirmed-true bugs identified per finding-set, against a curated answer key from Phase 6 / Phase 7 UAT scenarios (e.g., the ngx-smart-components testbed's known-bug set from sessions 1-8)
- Severity assessment accuracy (does medium-effort reviewer correctly tag Critical bugs as Critical, vs xhigh baseline)
- OWASP category mapping accuracy (security-reviewer specific)

If recall drops more than 15% on any of these axes empirically, REVERT to `effort: xhigh` and use Candidate A (fragment grammar) ALONE; Candidate A's empirical 65% mean output reduction (caveman benchmarks on Sonnet 4 + Opus 4.6) may be sufficient without effort calibration. The intermediate value `effort: high` is also acceptable as a compromise revert target.

**Composition with Candidate A (Plan 07-09 Task 1 fragment-grammar emit template):** Candidates A and B compose additively. A is the structural change (binds shape); B is the model-tuning change (reduces verbose justification chain depth). Per `07-RESEARCH-WORDBUDGET.md` Recommendation: ship A first as the primary intervention, then B in tandem to reach the 300w aggregate cap with margin. If A alone overshoots (well under 300w on UAT replay), B may be reverted to `high` while keeping A.

**Plan 07-09** lands the amendment + the reviewer.md and security-reviewer.md frontmatter changes atomically. The original D-04 decision (Option 1 + Option 2 reviewer web-tool design) remains in force; this amendment ONLY adds the effort component.

### Verify-before-commit pattern (Finding E.1+E.2, Plan 07-02)

- **D-05:** **Cost-cliff aware 4-element pattern.** Research-backed; no contention. Anchored in 8th UAT empirical evidence (advisor Critical-flag triggered verification reliably; cheap synchronous Run directives executed 3/4; long-running async skipped 1/4) + Cursor TDD anchor + outcome-based verification 5-check + Spotify Honk one-shot.

  - **Element 1 - Advisor refuse-or-flag rule (E.1):** `agents/{advisor,reviewer,security-reviewer}.md` system prompts gain a directive: when consultation source material contains an unresolved verify-first marker (sentinel regexes from Plan 06-05: `\b(unverified)\b`, `\bverify .+ before acting\b`, `\bAssuming .+ \(unverified\)\b`, `\bconfirm .+ before\b`, `\bfall back to .+ if .+\b`) on a load-bearing implementation choice, the advisor's Strategic Direction (or reviewer/security-reviewer's Findings) MUST flag the unresolved hedge with a literal frame: `"Unresolved hedge: <marker text>. Verify <action> before/after committing."`
  - **Element 2 - Plan-step-shape rule (E.2):** `lz-advisor.execute/SKILL.md` gains a `<verify_before_commit>` block: when the plan input contains a numbered, executable step structured as `**Validate** (or Verify, Test, Confirm) - Run: <command> - Verify: <observable conditions>`, the executor MUST execute the `Run:` command as a Bash invocation AND check the `Verify:` conditions BEFORE the commit that ships the related changes. Failure to execute the `Run:` directive is a verify-skip violation.
  - **Element 3 - Cost-cliff allowance:** cheap synchronous validations (`npm ls`, `git grep`, `git check-ignore`, lint, `tsc --noEmit`) execute pre-commit. Long-running async validations (full test suite, dev server startup like `nx storybook`, `nx run-many` over many projects) move to a `wip:` prefixed commit + `## Outstanding Verification` section in commit body listing the pending checks. The advisor's final-consult prompt template gains an Outstanding Verification section that surfaces these. Threshold heuristic for "cheap vs long-running" is **Claude's Discretion** for the planner (suggested: timeout-based, e.g., commands expected to complete in <30 seconds run pre-commit; or command-pattern based, e.g., `nx storybook` and `nx test`/`nx test-storybook` fall in long-running by name).
  - **Element 4 - `Verified:` trailer convention:** when an executor performs a verification action, the corresponding commit body MUST include a `Verified: <claim>` trailer naming the claim verified. The trailer is a **detection signal**, not a verification mechanism (per outcome-based verification research: don't trust agent self-reports). The smoke fixture grep-checks the JSONL trace for the corresponding `tool_use` event AND the trailer presence; either alone is non-conforming.
  - **Smoke fixture (`E-verify-before-commit.sh` in Plan 07-06):** synthesizes a hedge-marker survival scenario + an explicit `Run:` directive in plan steps; asserts (a) advisor flags unresolved hedge with canonical frame, OR (b) executor performs verification action AND adds `Verified:` trailer, OR (c) executor produces `wip:` commit + `## Outstanding Verification` section.

### Confidence-laundering guards (Finding C, Plan 07-03)

- **D-07:** **Four complementary guards** ship together in Plan 07-03. The 7-hop chain documented in PHASE-7-CANDIDATES.md (review -> executor -> advisor -> plan output -> execute consultation -> commit -> security-review imprimatur) requires all four to break the chain across both API-correctness and security-clearance axes.

  - **Hedge propagation rule** (in `references/context-packaging.md` Common Contract): when source material contains a verify-first marker, the executor MUST either (a) perform the verification step and replace the marker with an evidence citation, or (b) carry the marker verbatim into the consultation prompt's `## Source Material` section, forbidden from packaging the same content under `## Pre-verified Claims`.
  - **Cross-skill hedge tracking** (in `references/orient-exploration.md`): a workflow-level note that successive skills MUST NOT strip verify-first markers introduced by upstream skills.
  - **Version-qualifier anchoring rule** (in `references/context-packaging.md` Common Contract): when an upstream artifact introduces a version qualifier for a vendor library (e.g., "Storybook 8+", "Angular 17+", "TypeScript 5+"), the executor MUST verify the qualifier against the installed version before propagating into the consultation prompt. Mechanism: read the relevant `package.json` for the actual installed version; either confirm the qualifier matches and synthesize a `pv-version-anchor` block, or strip the qualifier and replace with the empirically observed version.
  - **Scope-disambiguated provenance markers on verdicts** (in `references/context-packaging.md` Common Contract + each SKILL.md output template): when a skill issues a verdict (PASS-with-observations, security-cleared, review-approved), the verdict MUST be tagged with the question-class scope it covers (`scope: api-correctness`, `scope: security-threats`, `scope: performance`, `scope: accessibility`). Downstream skills reading the verdict MUST check scope-match before treating it as authoritative.

### Plugin version (Plan 07-06)

- **D-06:** **Plugin version 0.9.0 -> 0.10.0 (SemVer minor).** Matches Phase 6 precedent (0.8.4 -> 0.9.0 minor for trust-contract rewrite). Contract-shape changes (new Common Contract pv-validation rule, new `<verify_before_commit>` SKILL.md block, new reviewer escalation `<verify_request>` structured output, sub-caps in agent word-budget, scope-disambiguated provenance markers) match the minor-bump convention. No breaking change to skill invocation surface (`/lz-advisor.{plan,execute,review,security-review}` invocations stay identical for users). Applies to `plugins/lz-advisor/.claude-plugin/plugin.json` + 4 SKILL.md frontmatter `version:` fields. Not research-anchored (project convention).

  **Not 1.0.0:** marketplace-readiness cut deferred until Phase 7 closes empirically AND a follow-up regression cycle confirms zero residuals. Phase 7's verify-chain-integrity scope is not feature-complete; subsequent phases may surface new findings.

### Claude's Discretion

- Exact threshold heuristic for cost-cliff in D-05 Element 3 (timeout-based vs command-name pattern vs explicit plan annotation; suggested: command-name pattern with explicit override list `nx storybook`, `nx test*`, `nx serve*`, full test suites)
- Smoke fixture letter naming for new fixtures (existing: A-K from 5.4, G+H from 5.5, I from 5.6, J from 5.4 mechanism C; next free letters: L, M, N. Suggest: D-{advisor,reviewer,security-reviewer}-budget.sh keeps D historical anchor; E-verify-before-commit.sh keeps E anchor; B-pv-validation.sh or H-self-anchor.sh for pv-* validation)
- Exact word-count sub-cap thresholds in D-03 (suggested 80w / 160w / 30w but planner may calibrate based on observed structural breakdown of representative outputs)
- Exact `<verify_request>` schema in D-04 (suggested fields: `question`, `class`, `anchor_target`, optional `severity`; planner picks; documented in `references/context-packaging.md`)
- Reviewer re-invoke behavior if first re-invoke still surfaces the same hedge (suggested: emit ungrounded finding with explicit "verification unsuccessful" tag; do NOT loop)
- WIP commit prefix convention details (suggested: `wip:` lowercase prefix; alternative `chore(wip):`; planner picks aligned with existing project conventional-commits style)
- `Verified: <claim>` trailer format (suggested: one trailer per verified claim, format `Verified: <claim text>` with optional `Verified-by: <tool_use_id>` for trace cross-reference)
- UAT replay scope in Plan 07-06 (minimum: plan-fixes + execute-fixes + security-review per Phase 6 amendment 5 precedent; planner may extend to full 8-skill chain if budget allows)
- Smoke fixture design for B/H pv-* validation: parser approach (XML-aware vs regex on `<evidence>` content) and rejection criteria for empty/claimed-knowledge `<evidence>` fields
- Whether to extend existing `KCB-economics.sh` with B+H assertions vs ship a new `B-pv-validation.sh` (existing convention: KCB owns Findings K + C + B; ladder may grow)
- Plan ordering 07-04 / 07-05 vs 07-02 / 07-03 (D-01 says 07-01 first then any order; planner may parallelize or serialize based on commit-revert preference)

### Folded Todos

(No todos folded from `cross_reference_todos` step - the only pending todo is `research-rtk-command-suitability-for-skills-and-agents` which is unrelated to verify-chain-integrity scope.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 7 source material (immediate)

- `.planning/phases/06-address-phase-5-6-uat-findings/PHASE-7-CANDIDATES.md` - 8 candidate findings (A through H + silent-resolve sub-pattern) with empirical evidence from 13 UAT cycles. Sections "Update 2026-04-30 (continued, 8th UAT, FINAL) -- Execute-fixes-2 UAT on security-findings plan" + "Synthesis: 8-skill UAT chain summary" + "Phase 7 design implications (refined from 8-UAT chain)" are the load-bearing anchors.
- `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` - Phase 6 PARTIAL gate verdict + 5 amendments. G1+G2 unclosed gaps section (lines 18-46) is the Phase 7 acceptance criteria source for Plan 07-01. Amendment 5 (refined root cause from "rule miss" to "rule bypass via self-anchor") is the empirical anchor for Finding H.
- `.planning/phases/06-address-phase-5-6-uat-findings/06-CONTEXT.md` - Phase 6 D-01..D-06 locked decisions; Phase 7 inherits and does NOT re-open Pattern D 4-class taxonomy, 4-skill byte-identical canon, Common Contract Rules 1-7.
- `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes-2/session-notes.md` - 8th UAT session notes (the STRONG POSITIVE evidence for E proposed direction working in spirit).

### Plugin files Phase 7 modifies

- `plugins/lz-advisor/agents/advisor.md` - Plan 07-02 adds advisor refuse-or-flag rule for hedge markers (E.1). Plan 07-04 adds descriptive triggers + worked example + 100w sub-cap reinforcement (D).
- `plugins/lz-advisor/agents/reviewer.md` - Plan 07-04 adds descriptive triggers + worked example + structural sub-caps (Findings <=80w / Threat Patterns <=160w / Missed-surfaces <=30w / total <=300w). Plan 07-05 adds reviewer escalation hook directive for `<verify_request>` block emission. Plan 07-02 adds reviewer scan criterion for verify-before-commit gaps.
- `plugins/lz-advisor/agents/security-reviewer.md` - Plan 07-04 adds same word-budget structure as reviewer.md. Plan 07-02 adds advisor-equivalent refuse-or-flag rule.
- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` - Plan 07-02 adds silent-resolve-sub-pattern fix (output convention requiring explicit disposition for ALL numbered input findings). Plan 07-03 adds scope-disambiguated provenance markers in output template. Plan 07-06 version bump 0.9.0 -> 0.10.0.
- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` - Plan 07-02 adds `<verify_before_commit>` block (E.1 hedge-marker resolution + E.2 plan-step-shape Run/Verify rule + cost-cliff allowance + Verified: trailer convention). Plan 07-03 adds scope-disambiguated provenance markers + version-qualifier anchoring rule cross-reference. Plan 07-01 adds ToolSearch availability rule supplement to `<context_trust_contract>` block (G2 closure). Plan 07-06 version bump.
- `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` - Plan 07-05 adds Phase 1 pre-emptive Class-2 surface enumeration + Phase 3 `<verify_request>` block detection + executor re-invoke logic. Plan 07-02 adds review-skill scan criterion for verification gaps. Plan 07-06 version bump.
- `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` - Plan 07-03 adds scope-disambiguated provenance markers in output template. Plan 07-06 version bump.
- `plugins/lz-advisor/references/context-packaging.md` - Plan 07-01 strengthens Common Contract Rule 5 with new pv-validation rule (mandatory XML format, `<evidence>` MUST cite source path or URL read in this skill execution + tool-output excerpt). Plan 07-03 adds hedge propagation rule + version-qualifier anchoring rule + scope-disambiguated provenance markers section.
- `plugins/lz-advisor/references/orient-exploration.md` - Plan 07-03 adds cross-skill hedge tracking section.
- `plugins/lz-advisor/.claude-plugin/plugin.json` - Plan 07-06 version bump 0.9.0 -> 0.10.0.

### Smoke test scripts (Phase 7 adds)

- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` (NEW, Plan 07-04) - asserts advisor SD <=100w on representative input.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` (NEW, Plan 07-04) - parses reviewer output by section header; asserts each Findings <=80w, Threat Patterns <=160w, Missed-surfaces <=30w, total <=300w.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` (NEW, Plan 07-04) - same shape as D-reviewer-budget.sh for security-reviewer.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` (NEW, Plan 07-02 + 07-06) - synthesizes hedge-marker + Run:/Verify: directive scenario; asserts (a) advisor flags unresolved hedge OR (b) executor verifies + Verified: trailer OR (c) wip: commit + Outstanding Verification section.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh` or extend `KCB-economics.sh` (NEW or extended, Plan 07-01 + 07-06) - asserts pv-* blocks use canonical XML format + `<evidence>` cites source path/URL + tool-output excerpt; rejects empty / claimed-knowledge `<evidence>`.

### Smoke tests Phase 7 re-runs as regression coverage

- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/KCB-economics.sh` - Findings K + C + B for executor web-tool usage. Phase 7 keeps unchanged (or extends with B-pv-validation.sh assertions per planner).
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/DEF-response-structure.sh` - Advisor/reviewer/security-reviewer output-shape gate. Plan 07-04 may extend with sub-cap assertions.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/HIA-discipline.sh` - Cross-cutting regression coverage.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/J-narrative-isolation.sh` - Mechanism C scope-derivation regression coverage.

### UAT fixtures (reused for Plan 07-06 replay)

- `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/runners/` - Phase 6 runner shape (`run-all.sh`, `run-session.sh`, `tally.mjs`). Phase 7 copies/adapts to `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/`.
- `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-{1..6}-<skill>.txt` - Reshaped prompts. Phase 7 may reuse or further reshape per planner.

### Discuss-phase research (Phase 7 specific)

- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/discuss-research/area-2-word-budget.md` - Research notes anchoring D-03 (Anthropic prose-style + 3% quality cost ablation + claudefa.st 3-layer architecture).
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/discuss-research/area-3-reviewer-web-tools.md` - Research notes anchoring D-04 (Qwen Code production default + OWASP structured-output + InfoQ gateway + Spotify Honk).
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/discuss-research/area-4-verify-before-commit.md` - Research notes anchoring D-05 (Cursor TDD anchor + outcome-based verification 5-check + 8th UAT empirical).

### External research (anchors decisions D-03, D-04, D-05)

- <https://www.prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt> - Claude 4 system prompt analysis (descriptive prose for non-safety rules; ALL-CAPS for safety-critical only). Anchor for D-03.
- <https://www.buildthisnow.com/blog/models/claude-code-quality-regression-2026> - Anthropic's Apr 2026 ablation showing 3% coding-quality drop from verbosity cap addition. Anchor for D-03 (rejecting hard-rules layer).
- <https://www.blockchain-council.org/claude-ai/claude-output-control/> - Layered output control + "firm budget + strict structure" guidance. Anchor for D-03.
- <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices> - Anthropic prompting best practices (layered constraints). Anchor for D-03.
- <https://claudefa.st/blog/tools/hooks/self-validating-agents> - Three-layer self-validating architecture (micro/macro/team). Anchor for D-03 + D-05 (lz-advisor analog: Output Constraint / smoke fixture / UAT replay).
- <https://qwenlm.github.io/qwen-code-docs/en/users/features/code-review/> - Code review production default (linters/typecheckers run before LLM analysis). Anchor for D-04 Option 1.
- <https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html> - Principle of Least Privilege + structured-output-as-security-control. Anchor for D-04 (Option 3 rejection + Option 2 design).
- <https://arxiv.org/html/2601.11893v1> - Formal treatment of agent privilege escalation. Anchor for D-04 Option 3 rejection.
- <https://github.com/anthropics/claude-code/issues/20264> - Subagent privilege inheritance escalation concern. Anchor for D-04 Option 3 rejection.
- <https://www.infoq.com/articles/building-ai-agent-gateway-mcp/> - Least-privilege AI Agent Gateway (MCP discovery + JSON-RPC structured calls + OPA authorization). Anchor for D-04 Option 2 (`<verify_request>` structured output).
- <https://dev.to/moonrunnerkc/ai-coding-agents-lie-about-their-work-outcome-based-verification-catches-it-12b4> - Outcome-based verification 5-check model + Spotify Honk one-shot pass/fail. Anchor for D-04 + D-05.
- <https://cursor.com/blog/agent-best-practices> - TDD anchor pattern (separate test from impl). Anchor for D-05 Element 1 (advisor refuse-or-flag).
- <https://www.augmentcode.com/blog/best-practices-for-using-ai-coding-agents> - Verification bottleneck (only 48% of devs verify AI code). Anchor for paired upstream-prevention (E) + downstream-detection (G) in Plan 07-02.

### Project conventions (carried forward)

- `CLAUDE.md` - Skill Verification with `claude -p` convention; Git Bash Windows arm64 shell rules; ASCII-only constraint; fetch fallback chain (markdown.new -> WebFetch -> url-to-markdown -> playwright-cli); RTK prefix convention; Phase 7 plan execution constrained by these.
- `.planning/PROJECT.md` - Plugin constraints (no hooks for v1; zero external dependencies; Sonnet 4.6 + Opus 4.7 model availability). Phase 7 inherits all.
- `plugins/lz-advisor/references/advisor-timing.md` - Anthropic timing guidance reference (existing).
- `plugins/lz-advisor/references/orient-exploration.md` - Pattern D 4-class taxonomy (Phase 6 D-01) + Class 2-S sub-pattern (Phase 6 amendment 4 / Plan 06-06). Phase 7 Plan 07-03 extends with cross-skill hedge tracking section.
- `plugins/lz-advisor/references/context-packaging.md` - Common Contract Rules 1-7. Phase 7 Plan 07-01 strengthens Rule 5 with new pv-validation rule. Plan 07-03 adds hedge propagation rule + version-qualifier anchoring rule + scope-disambiguated provenance markers.

### Anthropic foundational research (preserved from prior phases)

- `research/anthropic/docs/advisor-tool.md` - Advisor tool docs.
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` - Executor-holds-tools split.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **Phase 6 UAT runner shape** (`.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/runners/`) - Plan 07-06 copies `run-all.sh`, `run-session.sh`, `tally.mjs` to a Phase 7 replay subdirectory. The `claude -p` invocation pattern is the same; tally.mjs may be extended with `verified_trailer_count` + `wip_commit_count` columns for the Plan 07-02 smoke gate.
- **Existing smoke-test framework** (`.planning/phases/05.4-.../smoke-tests/{KCB,DEF,HIA,J}-*.sh`) - Plan 07-04's per-agent budget fixtures and Plan 07-02's E-verify-before-commit fixture mirror the Bash + `rg` + JSONL trace-grepping pattern. `KCB-economics.sh` lines 28-50 are the canonical `"name":"WebSearch|WebFetch"` pattern; new fixtures grep the trace for `"name":"Bash"` + `Verified:` trailer presence + `wip:` commit prefix.
- **`<orient_exploration_ranking>` byte-identical canon across 4 SKILL.md** (Phase 5.6 Plan 06/07 + Phase 6 Plan 02) - Plan 07-03 adds cross-skill hedge tracking via the same `@`-load pattern (one new line per SKILL.md inside existing `<orient_exploration_ranking>` block + content addition in `references/orient-exploration.md`). No retroactive churn on Pattern A/B/D inline blocks.
- **`<context_trust_contract>` byte-identical canon across 4 SKILL.md** (Phase 6 Plan 06-05) - Plan 07-01 adds ToolSearch-availability supplement (G2 closure) via additive content within the existing block; preserves byte-identical canon.
- **Existing pv-* XML format** (Phase 5.4 D-07 / Phase 6 D-01) - Plan 07-01 strengthens validation rules without changing the XML shape (`<pre_verified source="..." claim_id="...">...<evidence method="...">...</evidence></pre_verified>`).
- **Existing `<verify_before_acting>` regex sentinel set** (Plan 06-05) - Plan 07-02's advisor refuse-or-flag rule reuses the same regex set: `\b(unverified)\b`, `\bverify .+ before acting\b`, `\bAssuming .+ \(unverified\)\b`, `\bconfirm .+ before\b`, `\bfall back to .+ if .+\b`.

### Established Patterns

- **Letter-based smoke-test naming** (A-K from 5.4, G+H from 5.5, I from 5.6, J from 5.4 Mechanism C) - next free letters: L, M, N. Plan 07 reuses D-prefix for budget fixtures (D-* historical anchor for word-budget concerns) + E-prefix for verify-before-commit (E historical anchor for hedge-marker / Assuming-frame concerns) + B-prefix for pv-* validation if standalone (B historical anchor for `<pre_verified>` Pre-Verified Package Behavior Claims).
- **Three-stage verification simplified to two-stage** (Phase 6 simplified Phase 5.6's three-stage) - Plan 07-06 keeps two-stage: smoke (all 4-7 fixtures green) + UAT replay (subset + per-skill D-11 thresholds). No diagnostic forward-capture stage (Phase 7 has no diagnostic, the gap is named).
- **Prompt rule + smoke-test lock** (Phase 5.4 D-15, Phase 5.5 D-04+D-05, Phase 5.6 D-03+D-05, Phase 6 D-03+D-04) - Phase 7 follows same pattern: each fix-mechanism plan (07-01 through 07-05) lands paired with a smoke fixture in 07-06.
- **Positive framing over negative prohibitions** (Phase 5.3 / 5.4 / 5.6 / 6 convention) - Phase 7 D-03 (descriptive word-budget triggers), D-04 (`<verify_request>` structured output), D-05 (advisor refuse-or-flag literal frame) all positive-form.
- **Byte-identical 4-skill canon for shared blocks** (Phase 5.6 Plan 06/07 / Phase 6 Plan 02) - Plan 07-01 (ToolSearch supplement) + Plan 07-03 (provenance markers in output template) preserve canon.
- **Sentinel-regex preservation** (Plan 06-05 sentinels) - Plan 07-02 reuses verbatim; no regex changes.

### Integration Points

- 3 agent files (`advisor.md`, `reviewer.md`, `security-reviewer.md`) modified across Plans 07-02 + 07-04 + 07-05.
- 4 SKILL.md files modified across Plans 07-01 + 07-02 + 07-03 + 07-05 + 07-06; byte-identical canon contract preserved for `<context_trust_contract>` (07-01) and `<orient_exploration_ranking>` (07-03 hedge-tracking cross-reference).
- 2 reference files (`context-packaging.md`, `orient-exploration.md`) modified across Plans 07-01 + 07-03.
- `plugin.json` version bump in 07-06.
- Smoke-test directory `.planning/phases/05.4-.../smoke-tests/` gains 4-5 new scripts (D-advisor-budget.sh, D-reviewer-budget.sh, D-security-reviewer-budget.sh, E-verify-before-commit.sh, optionally B-pv-validation.sh).
- Phase 7 phase directory `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/` gains a `uat-replay/` subdirectory mirroring Phase 6's `uat-pattern-d-replay/` shape.

</code_context>

<specifics>
## Specific Ideas

- **8th UAT's STRONG POSITIVE evidence is the empirical anchor for D-05.** The execute-fixes-2 UAT (session `188bac4f-...`) showed the advisor Critical-flag mechanism works in spirit when triggered: pre-execute advisor flagged Husky as Critical, executor responded with `npm ls husky` + `git grep postinstall`, final summary attributed verification. Phase 7 Plan 07-02 makes this the RELIABLE pathway: advisor MUST flag unresolved hedges; the mechanism is empirically validated, the gap is making it trigger consistently.
- **The cost-cliff pattern in 8th UAT (3 of 4 cheap directives ran; 1 long-running skipped) is the empirical anchor for D-05 Element 3.** Plan 07-02's WIP-commit fallback for long-running validations is not a hack; it's the observed empirical pattern formalized into a rule. Cheap synchronous validations DO run when the advisor flags them; long-running async DO get skipped; the WIP commit + Outstanding Verification section turns the skip into a documented commitment instead of a silent loss.
- **Anthropic's own production prompt (Claude 4 system) is the strongest evidence for D-03 phrasing style.** PromptHub analysis: ALL-CAPS reserved for safety-critical rules ("MUST refuse", "NEVER reproduce copyrighted material"); descriptive prose for everything else. Lz-advisor word-budget is not safety-critical; descriptive triggers + worked example is the research-backed pattern.
- **Anthropic's own April 2026 ablation showed 3% coding-quality drop from a single verbosity cap addition.** This is the empirical reason hard-rules layer (option 4 in original framing) is rejected. The Phase 7 hybrid is the Pareto choice: enforces the budget without paying the literal-interpretation penalty.
- **The reviewer's `[Read, Glob]` tool grant is the principle-of-least-privilege anchor for D-04.** OWASP, arXiv 2601.11893, and Claude Code Issue #20264 all converge: subagent over-grant is a documented escalation risk. Plan 07-05 closes Finding F by adding the `<verify_request>` escalation hook + pre-emptive Class-2 scan in the executor (which already has WebSearch/WebFetch per D-11 Profile A); the reviewer never gains additional privilege.
- **Spotify's Honk one-shot pass/fail principle is the design constraint for the reviewer re-invoke.** Plan 07-05's reviewer escalation hook re-invokes the reviewer ONCE with new pv-* anchors; never iteratively. "Agent doesn't know how verification works, just gets pass/fail" - this prevents the reviewer from gaming the verifier feedback (the failure mode that makes self-reports unreliable per outcome-based verification research).
- **The `Verified: <claim>` trailer is a detection signal, not a verification mechanism.** Per outcome-based verification research, agent self-reports lie systematically. Plan 07-02's smoke fixture must grep both the trailer AND the corresponding tool_use event in the JSONL trace; either alone is non-conforming. This is the architectural difference between transcript-parsing verification (unreliable) and outcome-based verification (reliable).
- **Phase 6 Plan 06-05 hedge-marker preservation is empirically robust at the prompt-construction layer (8 UATs all show hedge survival).** Plan 07-02 does NOT touch Plan 06-05's sentinels or preservation rule. The gap Plan 07-02 closes is the EXECUTE-side completion: prompt-layer preservation is necessary but not sufficient; the executor must also DO the verification.
- **Plan 07-01 lands first because its pv-* validation rule is the empirical anchor for downstream guards.** Without structural pv-* validation (D-01 plan ordering), Plans 07-02/07-03/07-05 have no enforcement layer for the empirical-evidence anchoring that Findings A/C/E/G/H all assume. The 13-UAT empirical evidence is unambiguous: Finding H (executor self-confabulation) is the upstream cause of Findings B.2 + C + E + G failure modes.

</specifics>

<deferred>
## Deferred Ideas

- **README "Recommended prompt shape" section** - deferred from Phase 5.5 / 5.6 / 6, deferred again. Phase 7 reshapes UAT prompts privately; user-facing prompt-shape guidance is a polish phase concern.
- **1.0.0 marketplace-readiness cut** - deferred until Phase 7 closes empirically AND a follow-up regression cycle confirms zero residuals.
- **Hard-rules layer for word-budget** (option 4 in D-03 framing) - deferred unless 0.10.0 cycle confirms hybrid is insufficient. Anthropic's Apr 2026 ablation showed ~3% coding-quality cost; defer the cost until empirical evidence demands it.
- **Reviewer tool grant extension (Option 3 of Finding F)** - permanently deferred per OWASP / arXiv 2601.11893 / Claude Code Issue #20264.
- **Strict verify-before-commit (no cost-cliff allowance)** - deferred unless cost-cliff-aware fails next UAT. The 8th UAT empirical pattern is the load-bearing reason cost-cliff allowance is necessary.
- **`maxTurns` cap removal or SendMessage-based bidirectional advisor** - architectural change, deferred since Phase 5.3 / 5.4 / 5.5 / 5.6 / 6. Still deferred.
- **Pro / Free plan tier UAT cross-tier verification** - structurally impossible from Team subscription. Inherits prior deferred status.
- **Pattern D as a `claude -p` linter / pre-flight check** - deferred from Phase 6.
- **Fifth catch-all class in Pattern D** - deferred from Phase 6 unless reshaped UAT prompts reveal cases where the four classes don't fit cleanly.
- **Smoke-test extension for per-class web-tool coverage** (per-class assertions e.g., "S2 trace must show migration-class WebFetch") - deferred from Phase 6.
- **Retroactive extraction of Pattern A + B to shared reference** - deferred from Phase 6.
- **KCB-economics.sh extension for `.d.ts` reads as Pre-Verified Claim source** - deferred from Phase 6.
- **Plugin README update for Pattern D / verify-before-commit / pv-* validation rule** - out of Phase 7 scope. The README documents skills + agents; verify-chain-integrity is internal contract refinement. Defer to next polish phase.
- **TeammateIdle hook analog** for verify-before-commit - lz-advisor's "no hooks for v1" constraint precludes runtime enforcement; Plan 07-02 implements the equivalent at prompt-construction layer (advisor refuse-or-flag rule). Future phase may revisit if hook-based plugin architecture is added.
- **Reviewer iterative re-invoke loop** (multiple `<verify_request>` rounds) - deferred per Spotify Honk one-shot principle. Plan 07-05's re-invoke is one-shot only; multi-round verification is a future enhancement if empirical data shows one-shot is insufficient.
- **`Verified-by: <tool_use_id>` trailer field** for trace cross-reference - suggested in Claude's Discretion but planner may defer if trailer parsing complexity outweighs traceability gain.

</deferred>

---

*Phase: 07-address-all-phase-5-x-and-6-uat-findings*
*Context gathered: 2026-04-30*
