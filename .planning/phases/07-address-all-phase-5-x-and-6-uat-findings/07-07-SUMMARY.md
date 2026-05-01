---
phase: 07
plan: 07
subsystem: prompt-rule-canon + smoke-fixture + verification-amendments
tags: [gap-closure, ToolSearch, default-on, worked-examples, byte-identical-canon, version-bump, smoke-fixture, verification-amendment, requirements-traceability]
requires:
  - 07-01 (byte-identical context_trust_contract canon precedent + Rule 5b)
  - 07-06 (plugin version-bump precedent 0.9.0 -> 0.10.0)
  - 07-VERIFICATION.md Gap 1 declaration
  - 07-RESEARCH-GAP-1-toolsearch.md Candidates A + B
provides:
  - Default-on ToolSearch rule landed in 4-skill byte-identical context_trust_contract canon
  - 2 worked examples (positive + boundary) wrapped in <example> tags within the same canon
  - Aligned Rule 5b ToolSearch precondition sub-rule in references/context-packaging.md
  - Plugin version 0.11.0 across 5 surfaces (plugin.json + 4 SKILL.md frontmatter)
  - B-pv-validation.sh Assertion 5 (default-on ToolSearch firing on agent-generated input) + second scratch-repo scenario
  - 07-VERIFICATION.md amendment marking Gap 1 CLOSED structurally
  - 06-VERIFICATION.md Amendment 7 (seventh) sealing residual #1 with updated residual list table
  - GAP-G1-firing requirement registered in REQUIREMENTS.md with traceability row
affects:
  - lz-advisor.plan/SKILL.md, lz-advisor.execute/SKILL.md, lz-advisor.review/SKILL.md, lz-advisor.security-review/SKILL.md
  - plugins/lz-advisor/references/context-packaging.md
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md
  - .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md
  - .planning/REQUIREMENTS.md
tech-stack:
  added: []
  patterns:
    - default-on-rule (replaces text-steered AND-conjunction with unconditional Phase 1 first action)
    - cost-asymmetry-framing (provides user-visible WHY for tool-use steering on Sonnet 4.6 / Opus 4.7)
    - worked-examples-in-context-trust-contract (positive + boundary <example> blocks for comprehension scaffolding)
    - byte-identical-canon-edit (4-skill cross-file diff invariance preserved)
    - paired-prevention-and-detection (prompt-rule reframe + smoke-fixture assertion landing together)
key-files:
  created: []
  modified:
    - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
    - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
    - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
    - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
    - plugins/lz-advisor/references/context-packaging.md
    - plugins/lz-advisor/.claude-plugin/plugin.json
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md
    - .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md
    - .planning/REQUIREMENTS.md
decisions:
  - Adopted Candidate B (default-on conversion) + Candidate A (worked examples) per 07-RESEARCH-GAP-1-toolsearch.md Recommendation; the AND-conjunction ranking-precondition framing was the load-bearing failure mode (6 of 8 UAT sessions skipped firing).
  - Selected MINOR version bump 0.10.0 -> 0.11.0 over PATCH bump per OQ-8: Plan 07-07 ships in tandem with Plan 07-08 as a gap-closure pair within wave 5; combined cross-cutting contract changes (context_trust_contract reframe + verify_before_commit tightening) match Phase 6 -> Phase 7 0.9.0 -> 0.10.0 precedent.
  - Used full-file Write for B-pv-validation.sh (not 4 sequential Edit calls) to minimize fragility around fenced bash blocks and trap re-arming; the file has been fully read in this session.
  - Applied Edit tool with exact-anchor matching for the 4 SKILL.md context_trust_contract reframe; the AND-conjunction paragraph is unique enough to identify unambiguously, and the byte-identical canon constraint means the same Edit call is valid against all 4 files (verified post-edit via 3 cross-file diffs).
metrics:
  duration: ~50 minutes
  completed: 2026-05-02
  tasks: 6
  commits: 6
  files_changed: 10
  lines_added: 198
  lines_removed: 14
---

# Phase 7 Plan 07: Default-on ToolSearch + Worked Examples + Verification Amendments Summary

Closes Gap 1 (ToolSearch precondition firing rate 2 of 8 on plugin 0.10.0) at the prompt-rule + smoke-fixture + verification layers; lands paired Candidates B + A from 07-RESEARCH-GAP-1-toolsearch.md and seals residual #1 in 06-VERIFICATION.md Amendment 7.

## Goal Achieved

Plan 07-07 closes the ToolSearch firing-rate gap empirically observed across 6 of 8 UAT sessions on plugin 0.10.0. The closure mechanism replaces the text-steered AND-conjunction precondition rule ("WHEN agent-generated source AND Class 2/3/4 THEN invoke ToolSearch BEFORE ranking") with a default-on Phase 1 first action ("WHEN agent-generated source THEN invoke ToolSearch as Phase 1 first action, regardless of question class"), anchored in cost-asymmetry framing per Anthropic's published prompting best practices for Sonnet 4.6 / Opus 4.7. Two worked examples wrapped in `<example>` tags provide comprehension scaffolding the rule lacked. The aligned Rule 5b sub-rule, B-pv-validation.sh Assertion 5, plugin version bump, VERIFICATION amendments, and REQUIREMENTS.md traceability row complete the structural closure.

## Tasks Completed

| # | Task | Commit | Key Surfaces |
|---|------|--------|--------------|
| 1 | Reframe ToolSearch rule + add 2 worked examples in 4 SKILL.md byte-identical canon | bd2d418 | 4 SKILL.md context_trust_contract blocks |
| 2 | Align Common Contract Rule 5b ToolSearch precondition sub-rule with default-on framing | f73e24f | references/context-packaging.md |
| 3 | Bump plugin version 0.10.0 -> 0.11.0 across 5 surfaces | deb1fb2 | plugin.json + 4 SKILL.md frontmatter |
| 4 | Extend B-pv-validation.sh with Assertion 5 (default-on ToolSearch firing) | dd2bdf1 | B-pv-validation.sh (88 -> 141 lines) |
| 5 | Amend 07-VERIFICATION.md (Gap 1 CLOSED) + 06-VERIFICATION.md (Amendment 7 sealing residual #1) | 5a7e74c | 07-VERIFICATION.md, 06-VERIFICATION.md |
| 6 | Register GAP-G1-firing requirement in REQUIREMENTS.md (Phase 7 traceability) | 7c0c1ed | REQUIREMENTS.md |

## Closure Mechanism (Gap 1)

### Candidate B: Default-on conversion

The ToolSearch availability rule in the 4-skill byte-identical `<context_trust_contract>` block was reframed:

- **Before (Plan 07-01):** "When the input prompt contains agent-generated source material AND the question classifies as Class 2 / 3 / 4 per orient-exploration.md, invoke ToolSearch BEFORE ranking. This step fires regardless of whether the orient ranking has classified the question yet; it is a precondition for ranking, not a result of it."
- **After (Plan 07-07):** "ToolSearch availability rule (default-on Phase 1 first action). When the input prompt contains agent-generated source material -- detected via the three signals above -- invoke ToolSearch select:WebSearch,WebFetch as the FIRST Phase 1 action, before any local-project read or `<orient_exploration_ranking>` step. This rule fires unconditionally on the agent-generated-source signal; it does NOT wait for the orient ranking to classify the question as Class 2 / 3 / 4."

The cost-asymmetry framing ("one redundant ToolSearch invocation costs approximately 0 tokens and 100ms latency [...] whereas synthesizing a confabulated `<pre_verified>` block on an agent-generated input that should have triggered web verification costs an entire advisor consultation plus the downstream confidence-laundering cascade") provides the user-visible WHY that Anthropic's published guidance identifies as load-bearing for tool-use steering on Sonnet 4.6 / Opus 4.7.

### Candidate A: Worked examples

Two `<example>` blocks added immediately after the reframed rule:

1. **Positive:** `/lz-advisor.plan Address findings in @plans/upstream-review.md` -- the @-mention `/plans/` path triggers the agent-generated-source signal; ToolSearch fires as Phase 1 first action regardless of sub-question class.
2. **Boundary:** `/lz-advisor.plan` with `---`-delimited Storybook 10.3.5 release notes block -- vendor-doc authoritative source rules out the agent-generated signal; ToolSearch does NOT fire.

The worked examples close the gap that Plan 07-01 left open (the rule had no `<example>` block; Anthropic's documented best practice for Sonnet 4.6 / Opus 4.7 is 3-5 examples wrapped in `<example>` tags).

### Cross-surface alignment

- `references/context-packaging.md` Rule 5b ToolSearch precondition sub-rule reframed with matching cost-asymmetry phrasing (approximately 0 tokens, approximately 100ms) and a cross-reference back to 07-RESEARCH-GAP-1-toolsearch.md.
- `B-pv-validation.sh` extended with a second scratch-repo scenario seeding `plans/upstream-review.md` (the empirical session 4 / 7 UAT shape) and Assertion 5 grep-asserts that ToolSearch fires on agent-generated input. `bash -n` syntax check passes; ASCII-only constraint honored.
- Plugin version bumped 0.10.0 -> 0.11.0 across 5 surfaces (minor; gap-closure pair landing in tandem with Plan 07-08).

## Byte-Identical Canon Verification

All 4 SKILL.md `<context_trust_contract>` blocks remained byte-identical after the Task 1 edit. Verified via 3 cross-file diffs:

```
diff <(awk '/<context_trust_contract>/,/<\/context_trust_contract>/' lz-advisor.plan/SKILL.md) \
     <(awk '/<context_trust_contract>/,/<\/context_trust_contract>/' lz-advisor.execute/SKILL.md)
# exit 0 (byte-identical)
```

Same exit status for plan vs review and plan vs security-review.

## Plugin Version Surfaces

| Surface | Pre | Post |
|---------|-----|------|
| `plugins/lz-advisor/.claude-plugin/plugin.json` | 0.10.0 | 0.11.0 |
| `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` (frontmatter) | 0.10.0 | 0.11.0 |
| `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` (frontmatter) | 0.10.0 | 0.11.0 |
| `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` (frontmatter) | 0.10.0 | 0.11.0 |
| `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (frontmatter) | 0.10.0 | 0.11.0 |

Verified post-bump: `rg -c "0\.11\.0"` returns 1 per file across all 5 surfaces; `rg -c "0\.10\.0"` returns 0 across all 5 surfaces (no remnants).

## Smoke Fixture Extension

`B-pv-validation.sh` extended from 4 to 5 assertions:

- **Assertion 1-4:** Unchanged (FIND-B.2 XML format, FIND-B.1 synthesis count, FIND-H self-anchor rejection, FIND-H empty-evidence + source-grounded). Run against scenario 1 ($OUT).
- **Assertion 5 NEW (GAP-G1-firing default-on):** Run against scenario 2 ($OUT2). Detects whether the JSONL trace contains a ToolSearch tool_use event when agent-generated input signals are present (`@plans/`, `@.planning/`, review file paths, plan-md paths). On detection without ToolSearch invocation, FAIL=1; the default-on rule failed.

The fixture's second scenario seeds a fresh `SCRATCH2` scratch repo with `plans/upstream-review.md` containing hedged Storybook 10 + Compodoc claims (matching the empirical session 4 / 7 UAT shape that broke 6 of 8 sessions on plugin 0.10.0). The trap cleanup is updated to remove both `$SCRATCH` and `$SCRATCH2`. The failure-trace dump now includes both scenarios (last 200 lines of $OUT + last 100 lines of $OUT2).

## Verification Amendment Cross-Reference

- **07-VERIFICATION.md** (file grew from 103 -> 134 lines): "Amendment 2026-05-01 -- Gap 1 CLOSED via Plan 07-07" appended at end. Documents closure mechanism (Candidates B + A), 5-item structural verification list, and deferred empirical verification scope.
- **06-VERIFICATION.md** (file grew from 551 -> 600 lines): "Amendment 2026-05-01 (seventh) -- Phase 7 Gap 1 (residual #1) CLOSED via Plan 07-07; plugin 0.11.0 published" appended after Amendment 6. Documents fix mechanism (5 items), empirical evidence from session-notes, updated residual list table marking residual #1 CLOSED structurally + residual #2 in-flight via Plan 07-08, and plugin version table 0.10.0 -> 0.11.0.

Cross-references between the two surfaces let future milestone audits trace closure to Plan 07-07 specifically.

## Updated Residual List (post-Amendment 7)

| # | Residual | Status |
|---|----------|--------|
| 1 | Plan 07-01 ToolSearch precondition firing | CLOSED structurally via Plan 07-07 (this plan) |
| 2 | Plan 07-02 wip-discipline scope ambiguity | OPEN -- closing via Plan 07-08 (in-flight wave 5) |
| 3 | Cross-Skill Hedge Tracking gap (P8-12) | DEFERRED to Phase 8 |
| 4 | Reconciliation rule NOT invoked when advisor reframes packaged claim (P8-03) | DEFERRED to Phase 8 |
| 5 | Self-anchor pattern leaks through advisor narrative SD prose (P8-18) | DEFERRED to Phase 8 |

## REQUIREMENTS.md Traceability

New sub-section `### Gap-Closure Requirements (Phase 7)` added between Security Review Skill and v2 Requirements sections. New requirement `GAP-G1-firing` registered with cross-references to:

- 4 SKILL.md `<context_trust_contract>` blocks (default-on rule + 2 worked examples)
- `plugins/lz-advisor/references/context-packaging.md` Rule 5b ToolSearch precondition sub-rule
- `B-pv-validation.sh` Assertion 5 (detection layer)

Coverage count bumped 39 -> 40. Traceability table row: `| GAP-G1-firing | Phase 7 | Pending |` (Pending status; flips to Complete when empirical UAT replay confirms 8 of 8 firing rate).

## Empirical Verification (Deferred)

The empirical closure criterion -- a fresh UAT replay subset on plugin 0.11.0 confirming ToolSearch firing in 8 of 8 sessions where agent-generated source is present -- is OUT of Plan 07-07 scope per `<verification>` block. The structural surfaces are in place; behavioral confirmation lands in the next phase's UAT replay if Phase 7 is sealed before then, or in a follow-up empirical-validation cycle.

## Co-landing with Plan 07-08

Plan 07-07 + Plan 07-08 ship in tandem within wave 5 as the Phase 7 gap-closure pair. They edit disjoint XML blocks (`<context_trust_contract>` for 07-07; `<verify_before_commit>` for 07-08) but share file paths (`lz-advisor.execute/SKILL.md` is touched by both). The version bump in Task 3 (this plan) is owned by Plan 07-07; Plan 07-08 must NOT re-bump.

## Threat Mitigation Status

Per the plan's `<threat_model>`:

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-07-01 (Tampering: ToolSearch availability rule prose) | mitigate | DONE -- Task 1 reframes the rule with cost-asymmetry framing; Task 2 aligns the cross-reference; Task 4 Assertion 5 provides downstream-detection compensation |
| T-07-07-02 (Repudiation: confabulated pv-* synthesis) | mitigate | DONE -- Task 4 Assertion 5 grep-asserts ToolSearch tool_use events appear before pv-* synthesis on agent-generated input |
| T-07-07-03 (Tampering: plugin version drift) | mitigate | DONE -- Task 3 atomically bumps all 5 surfaces; verified zero 0.10.0 remnants |
| T-07-07-04 (Repudiation: milestone-audit traceability) | mitigate | DONE -- Task 5 amendments to 07-VERIFICATION.md + 06-VERIFICATION.md provide audit trail with cross-references |
| T-07-07-05 (Information Disclosure: worked example testbed details) | accept | ACCEPTED -- Storybook + Compodoc + signal API names are public OSS; testbed-specific phrasing is the residual cost |

## Deviations from Plan

None - plan executed exactly as written. Per-task acceptance criteria all passed on first verification run.

## Self-Check: PASSED

All 6 created commits verified present in git log. All 10 modified files exist on disk. All plan-level verification criteria pass:

- 4 SKILL.md `<context_trust_contract>` blocks byte-identical (3 cross-file diffs exit 0)
- Plugin version 0.11.0 across 5 surfaces (zero 0.10.0 remnants)
- B-pv-validation.sh `bash -n` OK; ASCII-only OK
- Both VERIFICATION amendments present (Gap 1 CLOSED + Amendment 7 seventh)
- REQUIREMENTS.md GAP-G1-firing registered with traceability row + coverage count 40
