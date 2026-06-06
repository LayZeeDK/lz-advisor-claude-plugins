---
phase: 11
slug: fixture-baseline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-07
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash assertions (`pass()`/`fail()` + counters), the committed `tests/` convention -- no external runner |
| **Config file** | none -- scripts are self-contained, run from repo root |
| **Quick run command** | `bash tests/D-reviewer-budget.sh && bash tests/D-security-reviewer-budget.sh` |
| **Full suite command** | `for f in tests/*.sh; do bash "$f" || exit 1; done` (includes existing validate-phase scripts) |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run the just-authored fixture in all three modes (default, `--self-test`, and `--from-trace` against a small captured-or-synthesized sample)
- **After every plan wave:** Both new fixtures green in default mode + both `--self-test` exit non-zero
- **Before `/gsd:verify-work`:** Both fixtures exit 0 on HEAD (self-extract); both `--self-test` exit non-zero
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD (planner assigns) | TBD | TBD | GATE-01 | T-11-01 | `--from-trace` arg validated + quoted before read | smoke | `bash tests/D-reviewer-budget.sh` | NEW (this phase) | pending |
| TBD (planner assigns) | TBD | TBD | GATE-01 | T-11-01 | `--from-trace` arg validated + quoted before read | smoke | `bash tests/D-security-reviewer-budget.sh` | NEW (this phase) | pending |
| TBD (planner assigns) | TBD | TBD | GATE-01 | N/A | `--self-test` synthesizes input via printf, no file read | smoke | `bash tests/D-reviewer-budget.sh --self-test` exits non-zero; same for security fixture | NEW (this phase) | pending |
| TBD (planner assigns) | TBD | TBD | GATE-01 | T-11-01 | quoted expansions, no eval, no source | smoke | `bash tests/D-reviewer-budget.sh --from-trace <file>` | NEW (capability this phase; live traces Phase 13) | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tests/D-reviewer-budget.sh` -- covers GATE-01 (reviewer baseline)
- [ ] `tests/D-security-reviewer-budget.sh` -- covers GATE-01 (security baseline)
- [ ] No framework install needed -- bash + coreutils present; the existing `tests/` convention is the template
- [ ] (Optional) a tiny committed sample trace for `--from-trace` smoke verification, OR synthesize inline -- planner's discretion (D-02 capability; Phase 13 supplies live traces)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|

*None: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
