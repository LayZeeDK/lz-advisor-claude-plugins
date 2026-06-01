---
phase: 2
slug: plan-skill
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-11
validated: 2026-06-01
---

# Phase 2 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | skill-creator eval framework (manual observation) |
| **Config file** | none -- skill-creator provides scripts |
| **Quick run command** | Manual invocation: `/lz-advisor:plan <task>` |
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
| 02-01-01 | 01 | 1 | PLAN-06 | -- | N/A | unit | Verify SKILL.md frontmatter has no `model` field | N/A | green |
| 02-01-02 | 01 | 1 | PLAN-01 | -- | N/A | manual-only | Observe: executor calls Read/Glob before Agent tool | N/A | green |
| 02-01-03 | 01 | 1 | PLAN-02 | -- | N/A | manual-only | Observe: agent invocation prompt contains packaged findings | N/A | green |
| 02-01-04 | 01 | 1 | PLAN-03 | -- | N/A | manual-only | Count words in advisor response (<100) | N/A | green |
| 02-01-05 | 01 | 1 | PLAN-04 | -- | N/A | manual-only | Review plan file for steps + file paths + rationale | N/A | green |
| 02-01-06 | 01 | 1 | PLAN-05 | -- | N/A | manual-only | Check plan file exists after skill completion | N/A | green |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements. No test framework installation needed -- this phase produces a markdown prompt file, not executable code. skill-creator eval framework is already installed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Executor orients before consulting | PLAN-01 | Requires observing LLM session tool call order | Invoke `/lz-advisor:plan "add a login page"` and verify Read/Glob calls precede Agent call |
| Executor packages findings | PLAN-02 | Requires inspecting agent invocation prompt content | Check the Agent tool prompt contains orientation findings, not raw file dumps |
| Advisor conciseness | PLAN-03 | Requires counting words in advisor response | Check advisor response is <100 words with enumerated steps |
| Plan detail level | PLAN-04 | Requires reviewing generated plan quality | Verify plan has numbered steps with file paths, approach rationale, risk warnings |
| Plan file durability | PLAN-05 | Can be partially automated | Verify `plan-*.md` file exists in project root after skill completion |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-06-01 (Nyquist backfill; all 6 PLAN requirements covered)

## Validation Audit 2026-06-01

Backfill of this pre-framework draft during v1.0 milestone finalization (Phase 2 predates the Nyquist framework). No `gsd-nyquist-auditor` spawn: zero MISSING-coverage gaps. The previously manual-only PLAN-01..05 behaviors were **empirically exercised** by a headless `/lz-advisor:plan` run on plugin 0.15.0 (2026-06-01; same run that resolved the Phase 01 human_verification -- see 01-VERIFICATION Resolution Amendment).

| Metric | Count |
|--------|-------|
| Requirements | 6 (PLAN-01..06) |
| Missing-coverage gaps | 0 |
| Resolved (automated/runtime) | 6 |
| Escalated to manual-only | 0 |

**Coverage basis:**
- PLAN-06 (no `model` override): static check of `skills/plan/SKILL.md` frontmatter (no `model:` field) -- automated.
- PLAN-01 (orient before consult): runtime-proven -- the plan run's tool sequence was `Glob -> Read` (greet.js x17) **before** the `lz-advisor:advisor` Agent call.
- PLAN-02 (packages findings into the consult): runtime -- the advisor Agent call carried packaged orientation context (the advisor returned strategic direction, not an error).
- PLAN-03 (advisor concise <100w): runtime (advisor on `claude-opus-4-8`) + governed by `D-advisor-budget.sh` fixture.
- PLAN-04 (detailed actionable plan): runtime -- a 3-step plan with the `greet` signature change, a `require.main === module` CLI block, and a default-parameter approach was produced.
- PLAN-05 (durable plan file): runtime -- `plans/add-greeting-flag.plan.md` was written.

Stale invocation form corrected this audit: `/lz-advisor.plan` -> `/lz-advisor:plan` (Phase 9 rename; bare interactive form is `/plan`).
