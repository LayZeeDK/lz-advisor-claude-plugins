---
name: lz-advisor.review
description: >
  This skill should be used when the user wants a code quality
  review of completed work, looking for bugs, logic errors, and
  edge cases. Trigger phrases include "review this code", "check
  my changes", "review these files", "look for issues",
  "lz-advisor.review", "check this module for bugs", "look over
  my code", "find bugs in", "review my recent commits", and
  "check for correctness". This skill provides Opus-level code
  quality review at Sonnet cost by consulting the reviewer agent
  for deep analysis of correctness, edge cases, and
  maintainability. Findings are classified as Critical, Important,
  or Suggestion. This skill should NOT be used for security-focused
  reviews, vulnerability audits, or threat modeling -- use
  lz-advisor.security-review instead. It should also NOT be used
  for planning or implementing tasks -- use lz-advisor.plan or
  lz-advisor.execute instead.
version: 0.5.0
allowed-tools: Agent(lz-advisor:reviewer), WebSearch, WebFetch
---

The lz-advisor:reviewer agent is backed by a stronger model (Opus). Invoke it
via the Agent tool at the strategic moment described below. For guidance on
timing and context packaging, see:

@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md

@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md

This skill follows a three-phase workflow: scan, consult, then output.

<scan>
## Phase 1: Scan

Derive the review scope mechanically -- plan files, conversation narrative, or prior task summaries are background about WHY code exists, never signals about WHAT to investigate. If a plan says "no changes to file X," file X is still in scope when its directory is in the diff.

### Scope Derivation

1. If the user specified files or directories, those are the scope. Also include every sibling file in each specified directory (coupling through shared module state is the highest-risk review surface).
2. Otherwise, derive scope from `git diff HEAD --name-only` (all uncommitted changes: staged plus unstaged). Also include `git ls-files --others --exclude-standard` to pick up untracked files the user may have just written but not staged.
3. If the user asked for a commit-range review (for example, "review the last 3 commits"), use `git diff <base>..HEAD --name-only`. Use `git log` to identify the base if commits were specified by count.
4. Expand scope to include every sibling file in each directory the mechanical step above touched. Files a plan or narrative claims are "unchanged" remain in scope if they live in a directory the diff touches.

Read any CLAUDE.md files in the reviewed directories -- project guidelines inform what counts as an issue.

### Narrative-Isolation Rule

Treat any plan file, conversation narrative, or background context as explanatory material about WHY code exists. Never treat narrative as a scope signal about WHAT to investigate. The review skill's value comes from INDEPENDENT triage: narrative can describe intent, but scope is derived from the code.

### Scan Criteria

Scan the code with high-signal criteria. Flag:

- Logic errors and bugs
- CLAUDE.md violations
- Security issues (surface-level -- deep security analysis is for `/lz-advisor.security-review`)
- Clear correctness problems
- Edge cases not handled

Skip (do not flag):

- Issues a linter or type checker would catch (formatting, unused imports, type errors)
- Style preferences or subjective suggestions
- Pre-existing issues outside the review scope
- Pedantic nitpicks

Curate the top 3-5 highest-signal findings with file:line references and relevant code context. Read thoroughly within scope -- do not skim.

Do not consult the reviewer agent during scanning. Scanning is preparation.
</scan>

<consult>
## Phase 2: Consult the Reviewer

Package the scan results and invoke the lz-advisor:reviewer agent via the
Agent tool. Package the consultation prompt per the Verification template
in `@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md`. The
executor's 3-5 curated findings from Phase 1 become the Findings section
of the template.

One reviewer consultation per review invocation. The reviewer starts with
fresh context and cannot see the conversation -- all relevant context
goes in the prompt.
</consult>

<output>
## Phase 3: Structure Output

Present findings to the user as console output.

Start with a summary header:

```
## Review Summary

Reviewed: [scope description -- files, directories, or change range]
Findings: [N] Critical, [N] Important, [N] Suggestion
```

Then group findings by severity (Critical / Important / Suggestion):

For each finding:
- Finding title with file:line reference
- Description with the reviewer's analysis woven in seamlessly (no
  attribution, no separate "Strategic Direction" section)
- Concrete fix suggestion

Include only findings the reviewer validated. Drop findings the
reviewer rejected.

Do not include:
- A strengths or positive observations section
- A "Recommended Action" or next-steps section
- Opus attribution tags or a separate reviewer analysis section

If the reviewer identified cross-cutting patterns, weave them into the
findings naturally -- for example, note the shared root cause when
presenting related findings.
</output>

Present the review findings to the user. If no significant issues were found
during scanning, report that the reviewed code looks sound and note any minor
observations.
