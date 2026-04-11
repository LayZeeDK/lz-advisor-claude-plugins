---
phase: 2
slug: plan-skill
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 2 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | skill-creator eval framework (manual observation) |
| **Config file** | none -- skill-creator provides scripts |
| **Quick run command** | Manual invocation: `/lz-advisor.plan <task>` |
| **Full suite command** | skill-creator eval with 3-5 test prompts |
| **Estimated runtime** | ~60-120 seconds per invocation |

---

## Sampling Rate

- **After every task commit:** Manual invocation with a simple task ("plan adding a login page") -- verify three phases execute
- **After every plan wave:** Full skill-creator eval with 3 test prompts
- **Before `/gsd-verify-work`:** All 6 PLAN requirements verified via conversation observation
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PLAN-06 | -- | N/A | unit | Verify SKILL.md frontmatter has no `model` field | N/A | pending |
| 02-01-02 | 01 | 1 | PLAN-01 | -- | N/A | manual-only | Observe: executor calls Read/Glob before Agent tool | N/A | pending |
| 02-01-03 | 01 | 1 | PLAN-02 | -- | N/A | manual-only | Observe: agent invocation prompt contains packaged findings | N/A | pending |
| 02-01-04 | 01 | 1 | PLAN-03 | -- | N/A | manual-only | Count words in advisor response (<100) | N/A | pending |
| 02-01-05 | 01 | 1 | PLAN-04 | -- | N/A | manual-only | Review plan file for steps + file paths + rationale | N/A | pending |
| 02-01-06 | 01 | 1 | PLAN-05 | -- | N/A | manual-only | Check plan file exists after skill completion | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements. No test framework installation needed -- this phase produces a markdown prompt file, not executable code. skill-creator eval framework is already installed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Executor orients before consulting | PLAN-01 | Requires observing LLM session tool call order | Invoke `/lz-advisor.plan "add a login page"` and verify Read/Glob calls precede Agent call |
| Executor packages findings | PLAN-02 | Requires inspecting agent invocation prompt content | Check the Agent tool prompt contains orientation findings, not raw file dumps |
| Advisor conciseness | PLAN-03 | Requires counting words in advisor response | Check advisor response is <100 words with enumerated steps |
| Plan detail level | PLAN-04 | Requires reviewing generated plan quality | Verify plan has numbered steps with file paths, approach rationale, risk warnings |
| Plan file durability | PLAN-05 | Can be partially automated | Verify `plan-*.md` file exists in project root after skill completion |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
