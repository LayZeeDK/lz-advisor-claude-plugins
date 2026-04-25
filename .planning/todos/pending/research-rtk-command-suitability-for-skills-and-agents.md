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

## Field evidence -- 2026-04-26 (Phase 05.6 Test 3)

First observed RTK failure during a real plugin invocation. Recording here
for the research phase fixture.

**Context:** `/lz-advisor.review` with the session-3-review.txt prompt against
branch `uat/phase-5.6-rerun`. Executor on Sonnet/medium, plugin 0.8.3.

**Failure:**

| Step | Command | Result |
|---|---|---|
| 1 | `rtk git log main..uat/phase-5.6-rerun --oneline` | Worked correctly -- 5 commits listed |
| 2 | `rtk git diff main..uat/phase-5.6-rerun --name-only` | **stdout: '' (empty)** |
| 3 | `git diff main..uat/phase-5.6-rerun --name-only` (fallback) | 7 files listed correctly |

The executor noticed the empty output and recovered automatically by
re-running with raw `git diff`. Net cost: 1 wasted tool call. Net risk
avoided: if the executor had trusted `rtk`'s empty stdout, the review
scope would have been zero files and the reviewer would have produced
empty findings.

**Pattern this validates:**

The RTK token-savings story is averaged across many runs. For any single
invocation, RTK can drop signal entirely rather than compact it. `--name-only`
output is already compact (7 file names, ~150 tokens) -- there is nothing
for RTK to compress, so its filter logic appears to swallow the entire
output instead of passing it through.

**Recommendation for the research phase:**

1. RTK should NEVER intercept `git diff --name-only`, `git diff --stat`,
   `git status --porcelain`, or any other already-compact-output flag.
   These are below RTK's compaction threshold; the only outcome is signal
   loss.
2. RTK is most useful for full-content diffs (raw `git diff`, raw
   `git show`) where the expected output is hundreds-to-thousands of
   lines.
3. For review and security-review skills, the fidelity argument
   strengthens: if a paired-diff fixture shows RTK dropping single-line
   diffs (the kind that hide security findings), RTK should be excluded
   from those skills entirely.

**Source:** `c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/016169a2-8331-4824-bcf7-0707630ed1f6.jsonl` entries 18-21.

## Field evidence -- 2026-04-26 (paired RTK vs raw comparison from Phase 05.6 Test 3 fixture)

Reproduced all three RTK command variants used (or attempted) during the
S3 review run, paired with their raw `git`/`gh` equivalents, and analyzed
detail loss against the actual review findings produced.

### Command 1: `git log --oneline`

| | Output |
|---|---|
| Raw | Full commit subjects intact (e.g., "feat(storybook): enable Compodoc in storybook and build-storybook targets") |
| RTK | Truncated at ~80 chars (e.g., "and build-storybook tar..."; "and ignore documentation..."); 5/5 commit prefixes preserved |

**Detail loss:** Bounded subject truncation. For review-scope derivation, conventional-commit prefix + ~70 chars survive. Risk: subject suffix ambiguity (e.g., "documentation..." could be `documentation.json` or `documentation/`). Token savings minimal -- output was already compact.

### Command 2: `git diff --name-only`

| | Output |
|---|---|
| Raw | 7 files: .gitignore, package-lock.json, package.json, .storybook/preview.ts, .storybook/tsconfig.json, project.json, plans/add-compodoc-storybook.plan.md |
| RTK | **stdout: '' (empty), exit 0** |

**Detail loss:** Total. RTK's filter doesn't pass `--name-only` through. Already-compact output has nothing to compress, so the filter returns empty rather than echoing. Token savings: negative (1 wasted tool call + fallback).

### Command 3: `git diff` full content (re-run for comparison; the executor used raw git in S3)

| | Output size | Stripped vs raw |
|---|---|---|
| Raw | 77 lines | n/a |
| RTK | 63 lines (~18% reduction) | `diff --git a/X b/X` headers, `index abc..def` blob hashes, `--- a/X` / `+++ b/X` markers, `\ No newline at end of file` markers, ~3 lines of leading context per hunk |

**Critical detail loss for Finding 4:** RTK strips `\ No newline at end of file` markers. The S3 review's Finding 4 (missing trailing newline in `.gitignore` after the new entry) depends entirely on those markers. A review run on RTK-only diff output would not catch Finding 4.

**Asymmetric context preservation:** RTK keeps ~3 trailing context lines per hunk but strips most leading context. Example from `.storybook/tsconfig.json` hunk: raw shows `{`, `"extends": "../tsconfig.json"`, `"compilerOptions": {` before the change; RTK shows nothing before the change. The leading context tells a reviewer which JSON object owns the addition; it's still inferable here from indentation + trailing `},`, but for nested or repeated structures the asymmetry could mislead.

### Mapping detail loss to S3 review findings

| Finding | Severity | Signal source | RTK preserves? |
|---|---|---|---|
| F1: Static import of gitignored generated file | Important | `+import documentation from '../documentation.json'` | YES |
| F2: compodoc `-d` writes to package source root | Suggestion | compodocArgs JSON in project.json | YES |
| F3: `unknown` global typing | Suggestion | `var __STORYBOOK_COMPODOC_JSON__: unknown` | YES |
| **F4: missing trailing newline** | Suggestion | `\ No newline at end of file` markers | **NO** |
| Cross-cutting pattern (compodoc target dependency mismatch) | Structural | `compodoc: true` + `compodocArgs` mirrored across both targets | YES (both targets visible in compacted form) |
| Emergent observation (workspace-relative compodocArgs paths) | Suggestion | Path strings inside compodocArgs | YES |

**Net loss:** 1 of 6 review items (Finding 4) is RTK-blind. Severity: Suggestion (low priority hygiene). Quantifiable but not catastrophic for this fixture.

**Generalization concern:** Trailing newline / EOL markers are the kind of low-frequency, single-line signal that security reviews depend on. A whitespace-only change, a BOM-marker change, a CRLF/LF flip -- all are precisely the patterns RTK's compaction is designed to remove and precisely the patterns a security reviewer needs to catch. The Finding 4 blind-spot here is a low-severity instance of a high-severity class.

### Per-command verdict

| Command | Verdict | Where to allow |
|---|---|---|
| `rtk git log` (with or without `--oneline`) | Acceptable with caveat about subject truncation | All four skills |
| `rtk git status` | Likely acceptable (need fixture run to confirm) | All four skills |
| `rtk git diff --name-only` | **Forbidden** -- broken | None |
| `rtk git diff --stat` | Likely broken (untested -- already-compact output) | None |
| `rtk git diff` (full content) | **Forbidden** for review + security-review (signal loss); allowed for plan + execute | plan, execute |
| `rtk gh pr diff` | Untested; same hypothesis as `rtk git diff` -- likely safe for plan/execute, unsafe for review/security-review |

### Proposed allowed-tools edits (post-research-phase)

| SKILL.md | Allow `Bash(rtk:*)` for | Require raw `Bash(git:*)` for |
|---|---|---|
| lz-advisor.plan | `git log`, `git status` | (none -- plan rarely needs full diff) |
| lz-advisor.execute | `git log`, `git status`, `git diff` (final-review packaging) | `git diff --name-only` |
| lz-advisor.review | `git log` only | All `git diff` invocations |
| lz-advisor.security-review | `git log` only | All `git diff` invocations |

**Source:** Re-run on 2026-04-26 from `D:/projects/github/LayZeeDK/ngx-smart-components` on branch `uat/phase-5.6-rerun` (commit a46be57). Paired diffs saved to /tmp/raw.diff and /tmp/rtk.diff in the lz-advisor-claude-plugins working tree's bash session.
