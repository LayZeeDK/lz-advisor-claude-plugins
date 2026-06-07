---
phase: 11
slug: fixture-baseline
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-07
audited: 2026-06-07
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
| 11-01 Task 1 | 01 | 1 | GATE-01 | T-11-01 | `--from-trace` arg validated + quoted before read | smoke | `bash tests/D-reviewer-budget.sh` | yes (`tests/D-reviewer-budget.sh`, commit 0fef58f) | green |
| 11-02 Task 1 | 02 | 1 | GATE-01 | T-11-01 | `--from-trace` arg validated + quoted before read | smoke | `bash tests/D-security-reviewer-budget.sh` | yes (`tests/D-security-reviewer-budget.sh`, commit c75ec93) | green |
| 11-01/11-02 Task 1 | 01, 02 | 1 | GATE-01 | N/A | `--self-test` synthesizes input via printf, no file read | smoke | `bash tests/D-reviewer-budget.sh --self-test` exits non-zero; same for security fixture | yes (both fixtures) | green |
| 11-01/11-02 Task 1 | 01, 02 | 1 | GATE-01 | T-11-01 | quoted expansions, no eval, no source | smoke | `bash tests/D-reviewer-budget.sh --from-trace <file>` (and security sibling) | yes (capability this phase; live traces Phase 13) | green |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] `tests/D-reviewer-budget.sh` -- covers GATE-01 (reviewer baseline)
- [x] `tests/D-security-reviewer-budget.sh` -- covers GATE-01 (security baseline)
- [x] No framework install needed -- bash + coreutils present; the existing `tests/` convention is the template
- [x] (Optional) a tiny committed sample trace for `--from-trace` smoke verification, OR synthesize inline -- planner chose synthesize-inline: `--self-test` synthesizes via printf; `--from-trace` capability smoke-verified against the self-extracted report (D-02 capability; Phase 13 supplies live traces)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|

*None: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s (~5s for both fixtures)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (validation audit 2026-06-07)

---

## Validation Audit 2026-06-07

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 4 verification-map rows re-run green against HEAD:

- `bash tests/D-reviewer-budget.sh` -- exit 0, `7 findings parsed`, 10/10 assertions
- `bash tests/D-security-reviewer-budget.sh` -- exit 0, `6 findings parsed`, 9/9 assertions
- `--self-test` -- exit 1 (non-zero) for both fixtures (fail-loudly guard fires)
- `--from-trace <extracted-report>` -- exit 0 for both fixtures (Phase 13 replay capability)

No auditor spawn required; no new tests generated.
