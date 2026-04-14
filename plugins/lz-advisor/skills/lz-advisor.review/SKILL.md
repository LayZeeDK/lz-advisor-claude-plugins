---
name: review
description: >
  This skill should be used when the user wants a code quality
  review of completed work, looking for bugs, logic errors, and
  edge cases. Trigger phrases include "review this code", "check
  my changes", "review these files", "look for issues",
  "lz-advisor review", "check this module for bugs", "look over
  my code", "find bugs in", "review my recent commits", and
  "check for correctness". This skill provides Opus-level code
  quality review at Sonnet cost by consulting the reviewer agent
  for deep analysis of correctness, edge cases, and
  maintainability. Findings are classified as Critical, Important,
  or Suggestion. This skill should NOT be used for security-focused
  reviews, vulnerability audits, or threat modeling -- use
  lz-advisor:security-review instead. It should also NOT be used
  for planning or implementing tasks -- use lz-advisor:plan or
  lz-advisor:execute instead.
version: 0.1.0
allowed-tools: Agent(lz-advisor:reviewer)
---

The lz-advisor:reviewer agent is backed by a stronger model (Opus). Invoke it
via the Agent tool at the strategic moment described below. For guidance on
context packaging, see:

@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md

This skill follows a three-phase workflow: scan, consult, then output.

<scan>
## Phase 1: Scan

Determine the review scope from the user's request:

- If the user specified files or directories, read those
- If the user asked to review "recent changes" or "my changes", use
  `git diff` or `git log` to identify changed files, then read them
- If the user's request is in conversation context (for example, they
  just finished coding), review the files they were working on

Read any CLAUDE.md files in the reviewed directories -- project guidelines
inform what counts as an issue.

Scan the code with high-signal criteria. Flag:

- Logic errors and bugs
- CLAUDE.md violations
- Security issues (surface-level -- deep security analysis is for
  `/lz-advisor.security-review`)
- Clear correctness problems
- Edge cases not handled

Skip (do not flag):

- Issues a linter or type checker would catch (formatting, unused
  imports, type errors)
- Style preferences or subjective suggestions
- Pre-existing issues outside the review scope
- Pedantic nitpicks

Curate the top 3-5 highest-signal findings with file:line references
and relevant code context. Read thoroughly within scope -- do not skim.

Do not consult the reviewer agent during scanning. Scanning is
preparation.
</scan>

<consult>
## Phase 2: Consult the Reviewer

Package the scan results and invoke the lz-advisor:reviewer agent via
the Agent tool with a self-contained prompt containing:

1. Review scope description (what files, directories, or changes were
   reviewed)
2. Top 3-5 findings, each with:
   - Description of the issue
   - File path and line number
   - Relevant code snippet (keep concise -- do not paste entire files)
   - Initial severity assessment (Critical / Important / Suggestion)
3. Any CLAUDE.md guidelines relevant to the findings
4. Request: "Validate these findings and provide cross-cutting analysis.
   Which findings should be confirmed, which rejected, and what patterns
   connect them?"

One reviewer consultation per review invocation. The reviewer starts
with fresh context and cannot see the conversation -- all relevant
context goes in the prompt.
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
