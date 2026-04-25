---
title: Research RTK command suitability for skills and agents
area: plugin-tooling
priority: high
status: pending
created: 2026-04-26
source_session: gsd-verify-work 05.6 Test 2
related_phase: 05.6
---

## Question

Should the lz-advisor plugin's skills and agents use RTK commands (e.g.,
`rtk git diff`, `rtk gh pr diff`, `rtk git status`, `rtk git log`) instead
of their unfiltered `git ...` and `gh ...` equivalents?

The trade-off is concrete and bidirectional:

- **For (cost):** RTK filters output and reduces token consumption by 60-90%
  on common operations. `rtk git diff` claims 80% reduction; `rtk gh pr view`
  87% reduction; `rtk git status` 59% reduction. Lower token use directly
  reduces advisor consultation cost and parent-session cost.
- **Against (accuracy):** RTK removes detail by design. For review and
  security-review workflows, omitted lines, hunks, file moves, or context
  windows could mask the exact patterns that drive a finding -- a vulnerability
  hidden in trimmed output, a refactor whose blast radius RTK collapses,
  whitespace-only changes that look like real logic edits in compact form.

## Why this matters now

This question surfaced during Phase 05.6 Test 2 (S2 execute) analysis on
2026-04-25. The execute skill currently uses `Bash(git:*)` allow-list and
emits raw git commands. The review and security-review skills have not been
field-tested against scenarios where RTK's compaction would change the
finding set.

The plugin's stated value proposition is "near-Opus intelligence at Sonnet
cost." Token economy matters. But the value proposition collapses if a
review skill misses a real finding because the diff was compacted before
the advisor saw it.

## Scope of analysis

Per skill / agent, decide:

| Skill / agent | Likely fit | Why |
|---|---|---|
| lz-advisor.plan | Probably yes | Orient phase reads project files; git status / log are auxiliary |
| lz-advisor.execute | Mixed | Final-review consults advisor on commit set; need full diff for advisor packaging |
| lz-advisor.review | **Probably NO** | Review correctness depends on full diff fidelity |
| lz-advisor.security-review | **Probably NO** | Security findings often hide in single removed lines or whitespace |
| advisor agent | N/A | Agent has Read+Glob only, no git tools |
| reviewer agent | Critical decision point | If reviewer reads diff via `git diff` itself, RTK applied at the agent level removes findings before the model sees them |
| security-reviewer agent | Critical decision point | Same as reviewer; security findings are highest-value-per-token, lowest tolerance for compaction |

## Investigation approach

1. **Identify all git/gh invocations** across `plugins/lz-advisor/skills/**/SKILL.md`
   and `plugins/lz-advisor/agents/**.md`. Catalog by purpose (status check,
   diff fetch, log walk, PR introspection).
2. **Run paired diffs** on a representative review fixture: same diff
   processed through (a) raw `git diff` and (b) `rtk git diff`. Feed each
   to the reviewer agent. Compare findings sets. Quantify what RTK loses.
3. **Decide per-call-site** based on (1) whether the consumer is the model
   (accuracy-critical) vs. the user (display-only), and (2) whether the
   compaction loses signal that drives a finding.
4. **If RTK is suitable for some call sites:** update SKILL.md `allowed-tools`
   to permit `Bash(rtk git:*)` alongside or instead of `Bash(git:*)`.
   Document the policy in references/context-packaging.md so the executor
   knows when to use RTK vs raw git.

## Decision artifacts to produce

- Per-skill / per-agent recommendation (use RTK / raw / hybrid)
- If hybrid: rule for when each variant is correct
- Token-savings estimate vs. accuracy-loss estimate
- SKILL.md / agents/*.md edits implementing the decision

## Related context

- RTK token-savings table: ~/.claude/CLAUDE.md "Rust Token Killer" section
  (rtk git diff: 80%, rtk gh pr view: 87%, rtk git status: 59%)
- Plugin invocation budget: advisor.md xhigh effort calls cost ~7-9s and
  18-19k tokens each; review/security-review allow up to 3 calls per task.
- Phase 05.6 Test 2 finding: end-state correctness depends on advisor
  catching subtle inconsistencies (e.g., setCompodocJson false claim).
  RTK compaction risks hiding the exact text that drove the catch.

## Estimated effort

Small phase or large plan. Cataloging + paired-diff fixture + decision
table + skill edits is bounded. Likely 1 plan, 4-6 atomic commits.

## Suggested timing

After Phase 05.6 closes (Tests 3-6 + remediation of node_modules permission
gap). Not urgent enough to insert as a decimal phase; can be Phase 06 in
the next milestone or as a v1.x post-MVP polish item.
