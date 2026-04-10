---
phase: 1
slug: plugin-scaffold-and-advisor-agent
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 1 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation + plugin-validator agent |
| **Config file** | None -- plugin components validated by Claude Code's discovery system |
| **Quick run command** | `claude --plugin-dir . --debug` (verify plugin loads) |
| **Full suite command** | plugin-validator agent + manual agent invocation test |
| **Estimated runtime** | ~30 seconds (manual steps) |

---

## Sampling Rate

- **After every task commit:** Run `claude --plugin-dir . --debug` -- check for plugin load errors
- **After every plan wave:** Run plugin-validator agent scan
- **Before `/gsd-verify-work`:** Full manual agent invocation test
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INFRA-01 | -- | Only recognized fields in plugin.json | smoke | `claude --plugin-dir . --debug` | W0 | pending |
| 01-01-02 | 01 | 1 | INFRA-02 | -- | Directory structure follows conventions | smoke | plugin-validator agent scan | W0 | pending |
| 01-01-03 | 01 | 1 | INFRA-03 | -- | Reference file under 5,000 tokens | manual | `wc -w skills/lz-advisor-plan/references/advisor-timing.md` | W0 | pending |
| 01-02-01 | 02 | 1 | ADVR-01 | -- | Agent spawns on Opus 4.6 | manual | `claude --plugin-dir . --debug` (check model selection) | Manual only | pending |
| 01-02-02 | 02 | 1 | ADVR-02 | -- | Output under 100 words | manual | Invoke agent, count response words | Manual only | pending |
| 01-02-03 | 02 | 1 | ADVR-03 | T-01-01 | Read-only tools (no Write/Edit/Bash) | smoke | `git grep "tools:" agents/lz-advisor.md` | W0 | pending |
| 01-02-04 | 02 | 1 | ADVR-04 | -- | maxTurns: 1 (single-turn) | manual | Invoke agent, verify single response | Manual only | pending |
| 01-02-05 | 02 | 1 | ADVR-05 | -- | effort: high | manual | `claude --plugin-dir . --debug` (check effort level) | Manual only | pending |
| 01-02-06 | 02 | 1 | ADVR-06 | T-01-02 | No MUST/CRITICAL/ALWAYS in prompt | smoke | `git grep -iE "MUST\|CRITICAL\|ALWAYS" agents/lz-advisor.md` (expect 0 matches) | W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] Verification checklist document with exact manual test steps for ADVR-01 through ADVR-06
- [ ] No automated test framework needed -- plugin components are validated by structure and manual invocation

*Existing infrastructure covers automated verifications (plugin-validator agent, `claude --debug`).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Agent spawns on Opus 4.6 | ADVR-01 | Model selection only visible in debug logs | 1. Run `claude --plugin-dir . --debug` 2. Invoke lz-advisor agent 3. Check debug output for `model: opus` |
| Output under 100 words | ADVR-02 | Response length varies per prompt | 1. Invoke agent with test prompt 2. Count words in response 3. Verify under 100 |
| maxTurns: 1 respected | ADVR-04 | Turn count only observable in debug | 1. Invoke agent 2. Verify single response (no multi-turn loop) |
| effort: high applied | ADVR-05 | Effort level only visible in debug logs | 1. Run `claude --plugin-dir . --debug` 2. Invoke agent 3. Check debug for effort setting |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
