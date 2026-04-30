---
phase: 07-address-all-phase-5-x-and-6-uat-findings
plan: 03
subsystem: skills+references
tags: [confidence-laundering-guards, hedge-propagation, version-qualifier-anchoring, scope-disambiguated-provenance, cross-skill-hedge-tracking, finding-c, byte-identical-canon]

# Dependency graph
requires:
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    plan: 01
    provides: "Common Contract Rule 5b (pv-* synthesis discipline) -- the empirical-evidence anchor that Rule 5c hedge-resolution path (a) and Rule 5d pv-version-anchor synthesis both reuse"
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    plan: 02
    provides: "Agent-side ## Hedge Marker Discipline section in advisor / reviewer / security-reviewer; Plan 07-03 packaging-side rule 5c is the executor-layer counterpart that preserves markers so the agent can flag them"
  - phase: 06-address-phase-5-6-uat-findings
    provides: "Plan 06-05 sentinel regex set for verify-first markers (5 patterns) reused verbatim in Rules 5c and Cross-Skill Hedge Tracking; PHASE-7-CANDIDATES.md Finding C 7-hop chain documentation; orient-exploration.md Pattern D 4-class taxonomy + Class 2-S sub-pattern (Phase 6 canon stays byte-identical)"
provides:
  - "Common Contract Rule 5c (Hedge propagation) in references/context-packaging.md -- packaging-layer rule forbidding silent strip; sentinel regex set reused verbatim from Plan 06-05"
  - "Common Contract Rule 5d (Version-qualifier anchoring) in references/context-packaging.md -- pv-version-anchor block on match, strip-and-replace on mismatch"
  - "Scope-Disambiguated Provenance Markers section in references/context-packaging.md -- 4 scope values + downstream consumer rule"
  - "Cross-Skill Hedge Tracking section in references/orient-exploration.md -- workflow-level rule with Tracking rule + Multi-skill chain example sub-sections"
  - "**Verdict scope:** scope: <value> output-template marker in all 4 SKILL.md (plan + execute + review + security-review) with per-skill defaults: plan/execute/review = api-correctness, security-review = security-threats"
affects: ["plan-07-04", "plan-07-05", "plan-07-06", "phase-6-verification-amendment-6"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Four complementary guards across two layers: packaging-layer (Rules 5c + 5d) and verdict-emission-layer (Scope markers in 4 SKILL.md output templates) plus workflow-level guard (Cross-Skill Hedge Tracking section in orient-exploration.md). Each guard addresses one hop in the 7-hop confidence-laundering chain documented in PHASE-7-CANDIDATES.md."
    - "Sentinel regex set canonicalization: same 5-regex set from Plan 06-05 now appears verbatim in 7 places across the plugin (3 agents + execute SKILL + review SKILL + Rule 5c + Cross-Skill Hedge Tracking). Future regex changes propagate atomically across all surfaces."
    - "Scope marker shape canonicalization: the literal token `**Verdict scope:** scope: <value>` appears verbatim across all 4 SKILL.md output templates with per-skill default values, preserving grep-ability for downstream skills."
    - "pv-version-anchor sub-class of pv-* synthesis: new claim_id naming pattern `pv-version-anchor-N` extends Plan 07-01's pv-* primitive without changing its XML shape. Rule 5b's source-grounded evidence requirement applies; the new sub-class enforces the source attribute = `package.json` (or equivalent manifest)."

key-files:
  created: []
  modified:
    - "plugins/lz-advisor/references/context-packaging.md"
    - "plugins/lz-advisor/references/orient-exploration.md"
    - "plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.review/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md"

key-decisions:
  - "Rule 5c places hedge resolution path (a) BEFORE carry-verbatim path (b) so the empirical-resolution path is the recommended default; carry-verbatim is the fallback when verification is impossible. Mirrors Plan 07-02 advisor-side discipline that flags markers rather than ignoring them."
  - "Rule 5d uses worked example anchored on @storybook/angular@10.3.5 (the empirical anchor from Phase 6 / Phase 7 UAT cycles) so the pattern is illustrated with the same training-data-bleed surface that exposed Finding C hop 5. Project-agnostic alternatives (`<library> >= <version>`, prose-form) are enumerated in the rule body so the pattern transfers."
  - "Scope-Disambiguated Provenance Markers section ships in context-packaging.md (the cross-cutting reference) rather than per-skill so the marker shape canon is single-sourced. Per-skill defaults are documented in the section AND restated in each SKILL.md template prose, but the literal marker line shape `**Verdict scope:** scope: <value>` is byte-identical."
  - "Cross-Skill Hedge Tracking section appended AFTER ## Closing Note rather than inserted within the Class 1-4 + Class 2-S structure. This preserves Phase 6 Plan 06-06 byte-identical canon while extending the file with a workflow-level addendum (a different abstraction layer than question-class taxonomy)."
  - "Per-skill scope marker placement varies to match each SKILL.md's existing template structure: plan uses a new ## Verdict section in the plan-file template body; execute uses a new ### Completion Verdict (scope-disambiguated) sub-section in Phase 6; review and security-review use ### Verdict scope marker sub-sections after the Required output shape block. The marker LINE itself is byte-identical across all four; the surrounding prose is per-skill calibrated."

patterns-established:
  - "Three-tier confidence-laundering defense: (1) prompt-construction layer (Rules 5c + 5d in context-packaging.md), (2) workflow-coordination layer (Cross-Skill Hedge Tracking in orient-exploration.md), (3) verdict-emission layer (scope markers in 4 SKILL.md). Each tier addresses a different surface of the 7-hop chain without redundancy."
  - "Worked-example anchoring on the same empirical artifact across rules: @storybook/angular@10.3.5 anchors Rule 5d (Phase 7 Plan 03), Class 2 example in orient-exploration.md (Phase 6), and pv-* example in Rule 5b (Phase 7 Plan 01). Cross-rule consistency makes the empirical context recognizable to readers who land in any single rule."
  - "Cross-reference graph integrity: every new section in this plan cross-references at least one upstream section (Rule 5c -> Rule 5b + agents Hedge Marker Discipline; Rule 5d -> Rule 5b + Pre-Verified Package Behavior Claims; Scope Markers -> per-skill default per skill; Cross-Skill Hedge Tracking -> Rule 5c + Pattern D classes). The references compose into a navigable web rather than a flat rule list."

requirements-completed: [FIND-C]

# Metrics
duration: approximately 8min
completed: 2026-05-01
---

# Phase 07 Plan 03: confidence-laundering guards (Finding C) Summary

**Landed four complementary guards closing the 7-hop confidence-laundering chain documented in PHASE-7-CANDIDATES.md across both API-correctness and security-clearance axes: (1) Common Contract Rule 5c (Hedge propagation rule) in `references/context-packaging.md` mandating either empirical resolution OR verbatim carry of verify-first markers; (2) Common Contract Rule 5d (Version-qualifier anchoring rule) requiring `package.json` read + pv-version-anchor synthesis or strip-and-replace before propagating qualifiers like "Storybook 8+"; (3) Cross-Skill Hedge Tracking section in `references/orient-exploration.md` formalizing the workflow-level rule that downstream skills MUST NOT strip upstream verify-first markers; (4) `**Verdict scope:** scope: <value>` provenance marker in all 4 SKILL.md output templates with per-skill defaults (plan/execute/review = api-correctness, security-review = security-threats) and downstream consumer rule that scope-mismatch verdicts are NOT authoritative for off-axis questions.**

## Performance

- **Duration:** approximately 8 minutes
- **Started:** 2026-05-01 (worktree-agent-a8421d04767978c57)
- **Tasks completed:** 3 of 3 (no checkpoints, no deviations)
- **Files modified:** 6
- **Files created:** 0

## What Was Done

### Task 1: Common Contract Rules 5c + 5d + Scope-Disambiguated Provenance Markers section in references/context-packaging.md (FIND-C hops 3, 5, 8b)

Three additive edits to `plugins/lz-advisor/references/context-packaging.md`:

**Edit 1 -- Rule 5c (Hedge propagation rule).** Inserted between Rule 5b (Plan 07-01) and Rule 6 with 3-space indentation matching existing 5a/5b sub-rules. The rule mandates that source material containing a verify-first marker (sentinel patterns: `\b(unverified)\b`, `\bverify .+ before acting\b`, `\bAssuming .+ \(unverified\)\b`, `\bconfirm .+ before\b`, `\bfall back to .+ if .+\b`) MUST take ONE of two actions before consulting:

- **(a) Resolve the hedge empirically.** Perform the verification step (WebSearch / WebFetch / Read / Bash) and replace the marker with an evidence citation -- synthesize a `<pre_verified>` block per Rule 5b citing the verification source.
- **(b) Carry the marker verbatim.** Place the source material into the consultation prompt's `## Source Material` section with the marker preserved verbatim. Forbidden: packaging the same content under `## Pre-Verified Package Behavior Claims` (the laundering pathway Finding C documented at hop 3).

The rule complements the agent-side `## Hedge Marker Discipline` section in the 3 agent prompts (Plan 07-02 Task 1): the agent flags unresolved hedges with the literal `Unresolved hedge:` frame; the executor packaging rule (Rule 5c) preserves the marker so the agent can see it. Both layers are necessary.

**Edit 2 -- Rule 5d (Version-qualifier anchoring rule).** Inserted between Rule 5c and Rule 6 with 3-space indentation. The rule mandates that vendor-library version qualifiers (`Storybook 8+`, `Angular 17+`, `TypeScript 5+`, `Nx 19+`, `Node 20+`, `<library> >= <version>`, or any prose-form version constraint) be verified against the installed version BEFORE propagating into the consultation prompt. Mechanism:

1. Read the relevant dependency manifest (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) and `package-lock.json` for npm projects with range specifiers.
2. Compare via SemVer / project-appropriate comparison.
3. If qualifier matches: synthesize a `<pre_verified>` block with `claim_id="pv-version-anchor-N"` (worked example shows `@storybook/angular@10.3.5` anchoring "Storybook 8+").
4. If qualifier does NOT match: STRIP and replace with empirically observed version + record annotation in `## Orientation Findings` so the agent sees the divergence.

The pv-version-anchor naming extends Rule 5b's pv-* primitive without changing the XML shape; Rule 5b's source-grounded evidence requirement applies (source attribute MUST be `package.json` or equivalent manifest read in the current skill execution).

**Edit 3 -- Scope-Disambiguated Provenance Markers section.** Appended after the existing `## When to Use Each Template` section as a top-level h2. The section enumerates 4 scope tag values (`api-correctness`, `security-threats`, `performance`, `accessibility`), defines per-skill defaults (plan/execute/review = api-correctness, security-review = security-threats), specifies the output template requirement (`**Verdict scope:** scope: <value>` line in a recognizable position), and adds a downstream consumer rule: when a downstream skill reads an upstream verdict, it MUST check `scope:` match BEFORE treating the verdict as authoritative for off-axis questions.

The downstream consumer rule closes Finding C hop 8b: a security-review's `scope: security-threats` verdict cannot be reused as evidence that upstream API claims are correct, regardless of how confident the security-review's prose appeared.

Rule ordering preserved: 5a (line 46) < 5b (line 48) < 5c (line 68) < 5d (line 77) < 6 (line 98). All existing rules + sub-rules preserved byte-identically around the insertion points.

**Commit:** `690cf3f feat(07-03): add Common Contract Rules 5c+5d + Scope-Disambiguated Provenance Markers`

### Task 2: Cross-Skill Hedge Tracking section in references/orient-exploration.md (FIND-C hop 3, workflow-level)

Appended a new top-level `## Cross-Skill Hedge Tracking` section AFTER the existing `## Closing Note` (line 119) -- preserves the Phase 6 Plan 06-06 Class 1-4 + Class 2-S byte-identical canon. The new section ships a workflow-level addendum (different abstraction layer than question-class taxonomy).

The section opens by describing how an upstream skill's verify-first markers MUST NOT be silently stripped by a downstream skill (sentinel patterns reused verbatim from Plan 06-05). It documents the laundering pathway Finding C hop 3 captures: an upstream review's "Assuming X (unverified) ... Verify Y before acting" gets repackaged as "X" without the hedge by the downstream plan-fixes executor, the plan output asserts X as established fact, downstream execute and security-review propagate X with no verification anchor.

Three sub-sections:

- **Tracking rule.** For every input artifact (file path supplied via @ mention, file referenced in the user prompt, prior consultation output cited in source material), the executor MUST scan for sentinel patterns at the start of orient. For each surviving marker, take ONE action per Rule 5c: (a) resolve empirically + synthesize pv-* block, OR (b) carry verbatim into `## Source Material`.
- **Workflow-level note.** The rule applies WITHIN one user-driven workflow. Across separate user invocations, pasted prior content is treated as any other source material and Rule 5c applies. No persistent state required.
- **Multi-skill chain example.** A 4-skill workflow (review -> plan -> execute -> security-review) is walked through end-to-end showing how the marker survives all 4 hops or gets resolved at the first hop where empirical verification is available. The chain breaks only when stripping occurs without verification.

Closing cross-reference to the agent-side counterpart in `agents/{advisor,reviewer,security-reviewer}.md` `## Hedge Marker Discipline` section (Plan 07-02 Task 1).

Order preserved: `## Closing Note` (line 119) < `## Cross-Skill Hedge Tracking` (line 128). Class 1-4 + Class 2-S sections preserved byte-identically.

**Commit:** `a03df5f feat(07-03): add Cross-Skill Hedge Tracking section to orient-exploration.md`

### Task 3: Scope-disambiguated provenance marker in 4 SKILL.md output templates (FIND-C hop 8b, byte-identical canon for marker shape)

Added the literal token `**Verdict scope:** scope: <value>` to the user-visible output template in all 4 SKILL.md files, with per-skill default values and per-skill placement variations. The marker LINE itself is byte-identical across all 4 files; the surrounding prose is per-skill calibrated.

**lz-advisor.plan/SKILL.md** -- new `## Verdict` section in the plan-file template body, AFTER `## Dependencies` and BEFORE the closing triple-backtick. Default: `**Verdict scope:** scope: api-correctness`. Prose explains scope coverage (API integration / framework usage / build-tool orchestration) and explicit non-coverage (security threats, performance, accessibility).

**lz-advisor.execute/SKILL.md** -- new `### Completion Verdict (scope-disambiguated)` sub-section after the Phase 6 Complete block. Lists all 4 scope values with per-task-type guidance. Default: `scope: api-correctness` unless task explicitly named a different axis.

**lz-advisor.review/SKILL.md** -- new `### Verdict scope marker` sub-section after the `Required output shape` template block. Default: `**Verdict scope:** scope: api-correctness`. Prose explicitly excludes security threats (use `/lz-advisor.security-review`) and performance/accessibility.

**lz-advisor.security-review/SKILL.md** -- mirrored shape with `### Verdict scope marker` sub-section. Default: `**Verdict scope:** scope: security-threats`. Prose explicitly notes that a `scope: security-threats` verdict does NOT vouch for API correctness; that is the review skill's domain.

All 4 files cross-reference `references/context-packaging.md` "Scope-Disambiguated Provenance Markers" for the canonical definitions.

**Commit:** `a418caf feat(07-03): add scope-disambiguated provenance marker to 4 SKILL.md output templates`

## Verification

### Per-task verification

All 3 tasks pass their automated `<verify>` and `<acceptance_criteria>` blocks:

- **Task 1:** Rule 5c count = 1; Rule 5d count = 1; `## Scope-Disambiguated Provenance Markers` count = 1; `scope: api-correctness` count = 2; `scope: security-threats` count = 3; `scope: performance` count = 1; `scope: accessibility` count = 1; `pv-version-anchor` count = 2; `@storybook/angular` count = 4; Rule 5a + Rule 5b preserved (each count = 1); rule ordering 5a (46) < 5b (48) < 5c (68) < 5d (77) < 6 (98) confirmed via awk.
- **Task 2:** `## Cross-Skill Hedge Tracking` count = 1; `### Tracking rule` count = 1; `### Multi-skill chain example` count = 1; `Common Contract Rule 5c` xref count = 1; `## Hedge Marker Discipline` xref count = 1; existing `## Class 1: Type-symbol existence`, `## Class 2: API currency`, `### Class 2-S: Security currency`, `## Closing Note` each count = 1; ordering `## Closing Note` (119) < `## Cross-Skill Hedge Tracking` (128) confirmed via awk.
- **Task 3:** all 4 SKILL.md contain `**Verdict scope:**` (verified via `git grep -l`); plan default `**Verdict scope:** scope: api-correctness` count = 1; execute file enumerates all 4 scope values (api-correctness count = 2, security-threats / performance / accessibility each count = 1); review default `**Verdict scope:** scope: api-correctness` count = 1; security-review default `**Verdict scope:** scope: security-threats` count = 1; all 4 SKILL.md cross-reference `Scope-Disambiguated Provenance Markers` (verified via `git grep -l`); plan `## Verdict` count = 1; review `### Verdict scope marker` count = 1; security-review `### Verdict scope marker` count = 1; execute `### Completion Verdict (scope-disambiguated)` count = 1.

### Plan-level verification

| Check | Result |
|-------|--------|
| Rules 5c + 5d + Scope Markers section in context-packaging.md | All 3 present (counts: 1 / 1 / 1) |
| Rule ordering 5a < 5b < 5c < 5d < 6 | OK (46 / 48 / 68 / 77 / 98) |
| Cross-Skill Hedge Tracking after Closing Note in orient-exploration.md | OK (119 / 128) |
| Sentinel regex set reused verbatim across Rule 5c + Cross-Skill Hedge Tracking | All 5 patterns present in both surfaces |
| **Verdict scope:** marker in all 4 SKILL.md | All 4 present |
| Per-skill default values: plan/execute/review = api-correctness, security-review = security-threats | All 4 confirmed |
| Cross-references between context-packaging.md, orient-exploration.md, 4 SKILL.md, agents Hedge Marker Discipline | All bidirectional and consistent |
| Behavioral end-to-end UAT verification | Deferred to Plan 07-06 |

### Threat register closure

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-03-01 (Tampering: Hedge stripping at skill boundaries, Finding C hop 3) | mitigate | Closed at packaging layer: Common Contract Rule 5c (Task 1) forbids strip-without-verify; combined with Plan 07-02 agent-side `## Hedge Marker Discipline` (executor flags) and Plan 07-03 Cross-Skill Hedge Tracking (Task 2 workflow-level), the hedge marker survives every hop or gets resolved with evidence. Three layers of defense. |
| T-07-03-02 (Tampering: Version-qualifier injection from training data, Finding C hop 5) | mitigate | Closed at packaging layer: Rule 5d (Task 1) requires package.json read + pv-version-anchor synthesis on match OR strip-and-replace on mismatch. Worked example anchored on @storybook/angular@10.3.5 -- the empirical anchor from Phase 6 / Phase 7 UAT cycles. |
| T-07-03-03 (Repudiation: Cross-axis confidence laundering, Finding C hop 8b) | mitigate | Closed at verdict-emission layer: scope-disambiguated provenance markers (Task 1 + Task 3) with downstream consumer rule (in context-packaging.md) requiring scope-match check before treating verdict as authoritative for non-default axes. Per-skill defaults (plan/execute/review = api-correctness, security-review = security-threats) prevent reuse across axes. |
| T-07-03-04 (Information Disclosure: Cross-skill hedge tracking via filesystem-readable artifacts) | accept | Hedge markers in plan / review files are user-visible artifacts; the rule operates on file content the user already sees. No new disclosure surface introduced. |
| T-07-03-05 (Tampering: Prompt injection via fetched content interacting with hedge markers) | accept | Common Contract Rule 5a (Plan 5.4 Phase 7 inherits unchanged) wraps fetched content in `<fetched source="..." trust="untrusted">` tags; agents flag (not comply with) imperatives in fetched content. Rule 5c hedge markers are sourced from upstream skills (not fetched URLs), so 5a's untrusted-wrapper is orthogonal. |

## Deviations from Plan

None -- plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered, no Rule 4 architectural questions raised, no authentication gates encountered.

The worktree branch was reset from `c797c16` (origin/main snapshot lacking 07-01 + 07-02 deliverables) to the expected base `323d489` (last 07-02 commit) per the `<worktree_branch_check>` instructions before executing any task. Then `git checkout HEAD -- .` repopulated the working tree from the expected base. This is environmental setup, not a plan deviation.

## Known Stubs

None. All edits ship complete prose; no placeholder text, no TODO/FIXME markers introduced. The literal placeholder `<value>` in prose explanations of `**Verdict scope:** scope: <value>` is documentation convention (matching the existing `Assuming X (unverified), do Y. Verify X before acting.` placeholder syntax in agent prompts); the actual marker line in each SKILL.md template uses a concrete value (`api-correctness` or `security-threats`), and downstream skills grep for the literal token.

## Followups

- **Plan 07-04:** word-budget enforcement on 3 agent prompts. Independent from this plan; ships in any order. The new Rule 5d worked example adds approximately 14 lines to context-packaging.md (a reference file, not a runtime agent prompt), so no agent runtime word budget is consumed by these additions.
- **Plan 07-05:** reviewer web-tool design (Option 1+2 in tandem). Cross-references Rule 5b synthesis mandate when the executor pre-empts Class-2 findings before reviewer consultation; Plan 07-03's Rule 5d adds version-anchoring as another pre-emption pathway the executor may invoke.
- **Plan 07-06:** smoke fixture suite + UAT replay + version bump 0.9.0 -> 0.10.0 + `07-VERIFICATION.md` + `06-VERIFICATION.md` amendment 6. The behavioral UAT replay closes Plan 07-03's structural surface empirically: the 4-skill workflow chain (review -> plan-fixes -> execute-fixes -> security-review) on a representative Compodoc + Storybook scenario MUST produce (a) hedge markers surviving all 4 hops or getting resolved with pv-* evidence; (b) version-qualifier strip-and-replace if installed version doesn't match; (c) scope-disambiguated verdicts with no cross-axis confusion.
- **Future plan:** smoke fixture exercising the full 5-hop confidence-laundering chain (review -> plan -> execute -> review -> security-review) with synthesized hedge marker, version qualifier, and scope-mismatch attempt; asserts all four guards fire. The fixture is referenced in CONTEXT.md but not yet implemented; Plan 07-06 may include it or defer to a follow-up plan.

## Self-Check: PASSED

Verified all claims:

- File `plugins/lz-advisor/references/context-packaging.md` exists and contains `5c. Hedge propagation rule.` (count: 1), `5d. Version-qualifier anchoring rule.` (count: 1), `## Scope-Disambiguated Provenance Markers` (count: 1)
- File `plugins/lz-advisor/references/orient-exploration.md` exists and contains `## Cross-Skill Hedge Tracking` (count: 1), `### Tracking rule` (count: 1), `### Multi-skill chain example` (count: 1)
- File `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` exists and contains `**Verdict scope:** scope: api-correctness` (count: 1) and `## Verdict` (count: 1)
- File `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` exists and contains `### Completion Verdict (scope-disambiguated)` (count: 1) with all 4 scope values enumerated
- File `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` exists and contains `### Verdict scope marker` (count: 1) and `**Verdict scope:** scope: api-correctness` (count: 1)
- File `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` exists and contains `### Verdict scope marker` (count: 1) and `**Verdict scope:** scope: security-threats` (count: 1)
- Commit `690cf3f` exists in `git log` (Task 1)
- Commit `a03df5f` exists in `git log` (Task 2)
- Commit `a418caf` exists in `git log` (Task 3)
