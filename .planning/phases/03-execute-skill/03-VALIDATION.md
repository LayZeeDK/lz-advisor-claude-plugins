---
phase: 3
slug: execute-skill
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 3 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | claude -p (CLI non-interactive invocation) |
| **Config file** | none -- uses --plugin-dir flag |
| **Quick run command** | `claude --model sonnet --effort medium --plugin-dir . -p "/lz-advisor.execute implement a simple hello world script" --verbose` |
| **Full suite command** | Manual test of all 4 consultation types across different task complexities |
| **Estimated runtime** | ~60-120 seconds per smoke test |

---

## Sampling Rate

- **After every task commit:** `git grep "^model:" skills/lz-advisor-execute/SKILL.md` (returns exit 1 = pass for IMPL-10)
- **After every plan wave:** Smoke test with `claude --plugin-dir . -p "/lz-advisor.execute ..."` 
- **Before `/gsd-verify-work`:** All smoke tests pass + structural verification
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | IMPL-10 | -- | N/A | unit | `git grep "^model:" skills/lz-advisor-execute/SKILL.md` (exit 1 = pass) | N/A | pending |
| 03-01-02 | 01 | 1 | IMPL-01 | -- | N/A | smoke | `claude --model sonnet --effort medium --plugin-dir . -p "/lz-advisor.execute implement a hello world script" --verbose` | N/A | pending |
| 03-01-03 | 01 | 1 | IMPL-04, IMPL-06 | -- | N/A | smoke | Verify in verbose output: commit appears before final Agent call | N/A | pending |
| 03-01-04 | 01 | 1 | IMPL-05 | -- | N/A | smoke | `claude --model sonnet --effort medium --plugin-dir . -p "/lz-advisor.execute @plans/test.plan.md implement the plan"` | N/A | pending |
| 03-01-05 | 01 | 1 | IMPL-09 | -- | N/A | smoke | Verify Agent tool prompts in verbose output contain task + findings + question | N/A | pending |
| 03-01-06 | 01 | 1 | IMPL-02 | -- | N/A | manual-only | Requires inducing a stuck state | N/A | pending |
| 03-01-07 | 01 | 1 | IMPL-03 | -- | N/A | manual-only | Requires task complex enough to trigger approach reconsideration | N/A | pending |
| 03-01-08 | 01 | 1 | IMPL-07 | -- | N/A | manual-only | Requires observing executor when advice conflicts with evidence | N/A | pending |
| 03-01-09 | 01 | 1 | IMPL-08 | -- | N/A | manual-only | Requires scenario where executor evidence contradicts advisor | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `skills/lz-advisor-execute/SKILL.md` -- the primary deliverable (does not exist yet)
- [ ] `references/advisor-timing.md` -- shared reference at plugin root (exists at skill level, needs move)
- [ ] `plans/` directory -- plan output convention (does not exist yet)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Executor consults advisor when stuck | IMPL-02 | Requires inducing a stuck state that cannot be scripted reliably | Run a complex task with known blockers, verify advisor is consulted in verbose output |
| Executor consults advisor on approach change | IMPL-03 | Requires task complex enough to trigger approach reconsideration | Run a task where initial approach is suboptimal, verify advisor consultation |
| Executor gives advice serious weight | IMPL-07 | Requires observing executor behavior when advice conflicts with evidence | Run task, compare executor actions against advisor guidance |
| Reconciliation pattern surfaces conflicts | IMPL-08 | Requires scenario where executor evidence contradicts advisor guidance | Manually create a conflicting scenario and observe reconciliation call |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
