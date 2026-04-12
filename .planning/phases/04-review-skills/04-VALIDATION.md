---
phase: 4
slug: review-skills
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 4 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash assertions + git grep (same as Phase 3) |
| **Config file** | none -- bash scripts in `tests/` |
| **Quick run command** | `bash tests/validate-phase-04.sh` |
| **Full suite command** | `bash tests/validate-phase-04.sh && claude --model sonnet --effort medium --plugin-dir . -p "/lz-advisor.review <target>" --verbose` |
| **Estimated runtime** | ~5 seconds (structural), ~60 seconds (smoke test) |

---

## Sampling Rate

- **After every task commit:** Run `bash tests/validate-phase-04.sh`
- **After every plan wave:** Run full suite command (structural + smoke test)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds (structural assertions)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | REVW-01 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-01-02 | 01 | 1 | REVW-02 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-01-03 | 01 | 1 | REVW-03 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-01-04 | 01 | 1 | REVW-04 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-01-05 | 01 | 1 | REVW-05 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-01-06 | 01 | 1 | REVW-06 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-02-01 | 02 | 1 | SECR-01 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-02-02 | 02 | 1 | SECR-02 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-02-03 | 02 | 1 | SECR-03 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-02-04 | 02 | 1 | SECR-04 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-02-05 | 02 | 1 | SECR-05 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-02-06 | 02 | 1 | SECR-06 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |
| 04-02-07 | 02 | 1 | SECR-07 | -- | N/A | structural | `bash tests/validate-phase-04.sh` | W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tests/validate-phase-04.sh` -- structural assertions for all 13 requirements
- [ ] `skills/lz-advisor-review/SKILL.md` -- review skill (primary deliverable)
- [ ] `skills/lz-advisor-security-review/SKILL.md` -- security review skill (primary deliverable)
- [ ] `agents/reviewer.md` -- code quality reviewer agent
- [ ] `agents/security-reviewer.md` -- security reviewer agent

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Opus reviewer provides deep analysis | REVW-03, SECR-03, SECR-04 | Requires LLM judgment to verify analysis quality | Run `claude -p "/lz-advisor.review <target>"` and verify output contains cross-cutting analysis |
| Findings are actionable with fix suggestions | REVW-04, SECR-05 | Actionability is subjective | Verify each finding in output has a concrete "Fix:" suggestion |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
