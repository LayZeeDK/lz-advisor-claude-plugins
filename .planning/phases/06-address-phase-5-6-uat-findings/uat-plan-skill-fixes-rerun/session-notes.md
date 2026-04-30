---
status: fail
phase: 06-address-phase-5-6-uat-findings
type: gap-closure-replay
source_uat: plan-skill-fixes
plugin_version: 0.9.0
target_workspace: D:/projects/github/LayZeeDK/ngx-smart-components
target_branch: uat/manual-s4-v089-compodoc
target_commit: ff4acb4414478d920ffe7aa95983aac80fa85b3f
source_input_path: D:/projects/github/LayZeeDK/ngx-smart-components/plans/compodoc-storybook-angular-signals.review.md
original_session_log: 26868ae7-1f9a-4a71-a146-16e7781b74c6.jsonl
replay_session_log: c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/0c6698fd-5010-4225-be83-f0086078bfba.jsonl
started: 2026-04-29T23:49:15Z
ended: 2026-04-29T23:51:54Z
session_duration_min: 2.6
web_uses_count: 0
toolsearch_web_count: 0
pv_blocks_count: 0
hedge_marker_count: 3
verdict: FAIL
---

# Plan-fixes Skill Gap-Closure Replay -- Plugin 0.9.0

Original plan-fixes UAT (session log `26868ae7-1f9a-4a71-a146-16e7781b74c6.jsonl`, plugin 0.8.9, 2026-04-29) showed Pattern D suppressed on agent-generated review-file input. The trust-contract carve-out fired on `<context_trust_contract>` shape detection without classifying source provenance. Replay against plugin 0.9.0 (Plan 06-05 trust-contract rewrite + Plan 06-06 Class 2-S) tests whether the new provenance-classification (vendor-doc vs agent-generated) and the ToolSearch-availability rule fire on the same review-file input. Verdict: FAIL.

## Empirical metrics

| Metric | Original (0.8.9) | Replay (0.9.0) | Delta |
|--------|------------------|-----------------|-------|
| WebSearch + WebFetch tool_use count | 0 | 0 | 0 |
| ToolSearch with WebSearch select | 0 | 0 | 0 |
| pv-* blocks synthesized in consultation prompt | 0 | 0 | 0 |
| Hedge marker `Verify .+ before acting` survival in trace | preserved in source | 3 | preserved |
| Total assistant tool_use turns | 7 | ~9 (Read 4, Glob 2, Bash 1, Skill 1, Agent 1, Write 1) | similar shape |

Trace size 174 KB / 48 events. Tool-name distribution: Read x4, Glob x2, Skill x1, Bash x1, Agent x1, Write x1. WebSearch / WebFetch / ToolSearch invocations: zero.

## Observations

1. **Pattern D's web-first prescription remained suppressed on the same review-file input.** The G1+G2 trust-contract rewrite (Plan 06-05) is structurally landed in the SKILL.md the executor loaded (the entire rewritten `<context_trust_contract>` block including provenance-classification subsections and the ToolSearch-availability rule appears in the trace as part of the skill prose), yet the executor still treated the review file as authoritative for the contested vendor-API question. The "agent-generated" branch of the new contract did not steer behavior on this fixture.
2. **ToolSearch was never invoked.** The new ToolSearch-availability rule was loaded into the skill prose but the executor did not exercise it. Plugin 0.9.0 leaves the same ToolSearch-loading-layer suppression observed in the original UAT and amendment 3.
3. **Hedge markers survived into the trace 3 times.** All three appearances are inside the SKILL prose (the `Verify .+ before acting` regex literal in the trust-contract block) plus the literal review-file string `Verify Storybook Angular version behavior before acting`. Hedge survival into the consultation `## Source Material` section is not directly testable from this trace alone (the consultation prompt body is inside the Agent invocation; further forensic extraction would be needed for the full conclusion). Reading-level hedge survival is consistent with the contract's intent.
4. **Reads observed:** stories.ts, .gitignore, prior plan file (`compodoc-storybook-angular-signals.plan.md`), output plan file (`address-review-findings-compodoc-storybook.plan.md`). One Bash invocation (`rtk git log --oneline -10`) for repository orientation. One Agent invocation to `lz-advisor:advisor`. One Write to produce the updated plan.
5. **No `<pre_verified>` blocks synthesized for the consultation.** The 1 raw match for `<pre_verified source=` is from the attached `references/context-packaging.md` template in the session attachment, not from a synthesized consultation block. This is consistent with the original UAT's pv-* gap and reaffirms Phase 7 Finding B.1 broadened scope.

## Verdict + closure note

**FAIL on the G2 closure signal for the plan-fixes UAT input.** Plugin 0.9.0's Plan 06-05 contract rewrite did not produce non-zero web-tool usage or ToolSearch invocation on this specific review-file input. Two interpretations:

- The new "agent-generated source material" branch is loaded but not behaviorally selected by Sonnet 4.6 on this fixture. Possible cause: the path heuristic `/plans/` may not be discriminating enough when the user prompt only @-mentions a single file (the executor may already classify the review content as part of the user's intent, not as agent-generated source).
- The ToolSearch-availability rule sits behind a Class-2/3/4 classification step that the executor still short-circuits on the agent-generated input.

Either way, the empirical gate did not flip on plugin 0.9.0 for this UAT. The structural surface is correct (Plan 06-05 sentinels are present in the SKILL the executor loaded), but the behavioral surface remains the same as 0.8.9. Phase 6 closure status downgrades from "G2 closed" to "G2 structurally landed but empirically residual"; the residual surface inherits to Phase 7 alongside Findings A / B.1+B.2 / C / D.

The hedge-marker preservation half of G1 is consistent with the contract's intent at the read-trace layer (3 hedge appearances tracked). The web-tool half of G2 remains open. A Phase 7 plan that addresses Pattern D refinements should include a stronger steering mechanism than text-based prose -- either an advisor refusal-pattern (per 05.6 Path C1 evaluation), a hook (Path C3), or a tighter executor-side orient prescription with concrete decision examples that the model can pattern-match.
