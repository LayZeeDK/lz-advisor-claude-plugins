---
status: partial
phase: 07-address-all-phase-5-x-and-6-uat-findings
source: [07-VERIFICATION.md]
started: 2026-05-03T00:05:00Z
updated: 2026-05-03T00:05:00Z
---

## Current Test

[awaiting human testing on plugin 0.12.0]

## Tests

### 1. Empirical UAT replay against plugin 0.12.0
expected: |
  8-session UAT chain on canonical Compodoc + Storybook + Angular signals scenario produces:
  (a) ToolSearch firing in 8 of 8 sessions where agent-generated source signals are present (Plan 07-07 closure of GAP-G1-firing)
  (b) wip-prefix discipline on commits with `## Outstanding Verification` body sections (Plan 07-08 closure of GAP-G2-wip-scope)
  (c) reviewer aggregate <=300w AND security-reviewer aggregate <=300w on representative inputs (Plan 07-09 closure of GAP-D-budget-empirical)
  (d) Class-1 (API-correctness) recall does NOT drop more than 15% vs the prior xhigh baseline (Plan 07-09 reversion criterion)
result: [pending]
notes: |
  Plugin 0.12.0 was published by Plan 07-09 commit 24e80c6. UAT replay against plugin 0.12.0 has NOT yet been run.
  The prior 8-session replay on plugin 0.10.0 (sessions f2d669f3 / 6276171a / a1503efa / 0d55118f / 29db446f / 2b5f3ae5 /
  bfa913fa / b614d3dd) was conducted before Plans 07-07, 07-08, 07-09 landed.

  Per CLAUDE.md "Skill Verification with claude -p" convention, this can be auto-tested via:
    claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.<skill> <prompt>" --verbose
  against the canonical fixture once a plugin 0.12.0 UAT replay is initiated.

  Binding reversion criterion (Plan 07-09 / 07-CONTEXT.md D-04 amendment 2026-05-02): if empirical Class-1 recall drops
  more than 15% on review/security-review skills with effort: medium vs the xhigh baseline, REVERT D-04 amendment
  (effort medium -> xhigh; keep Candidate A fragment-grammar template alone).

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
