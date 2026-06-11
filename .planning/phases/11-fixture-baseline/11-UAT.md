---
status: complete
phase: 11-fixture-baseline
source: 11-01-SUMMARY.md, 11-02-SUMMARY.md
mode: automated
started: 2026-06-07T14:43:12Z
updated: 2026-06-07T14:48:30Z
---

## Current Test

[testing complete]

## Tests

### 1. Reviewer fixture green on HEAD
expected: `bash tests/D-reviewer-budget.sh` exits 0, prints "7 findings parsed", 10/10 assertions pass against the current shorthand grammar in plugins/lz-advisor/agents/reviewer.md.
result: pass
evidence: exit 0; "7 findings parsed"; "Results: 10/10 passed"; per-finding bodies 10/9/11/7/17/13/16w all <= 28w; Cross-Cutting Patterns 63w <= 160w; Missed surfaces 17w <= 30w.

### 2. Reviewer --self-test fail-loudly
expected: `bash tests/D-reviewer-budget.sh --self-test` exits NON-zero (1) -- the anti-vacuous guard fires on synthesized zero-finding input, proving the gate cannot pass vacuously.
result: pass
evidence: exit 1; "0 findings parsed"; "[PASS] --self-test: zero-finding input correctly trips the anti-vacuous guard (fail-loudly)".

### 3. Reviewer --from-trace round-trip
expected: Extracting the self-extracted report to a file and replaying it via `--from-trace <file>` exits 0 with the same 7 findings and assertions passing (Phase 13 replay capability).
result: pass
evidence: exit 0; identical output to default mode -- "7 findings parsed", 10/10 assertions.

### 4. Security fixture green on HEAD
expected: `bash tests/D-security-reviewer-budget.sh` exits 0, prints "6 findings parsed", 9/9 assertions pass against the current shorthand grammar in plugins/lz-advisor/agents/security-reviewer.md.
result: pass
evidence: exit 0; "6 findings parsed"; "Results: 9/9 passed"; per-entry budgets 17/9/15/9/13w <= 28w + CVE 36w <= 75w; threat_patterns 60w <= 160w; missed_surfaces 10w <= 30w.

### 5. Security --self-test fail-loudly
expected: `bash tests/D-security-reviewer-budget.sh --self-test` exits NON-zero (1) -- the anti-vacuous guard fires on zero-finding input.
result: pass
evidence: exit 1; "0 findings parsed"; "[OK] --self-test: zero-finding input tripped the anti-vacuous guard; exiting NON-zero to prove fail-loudly".

### 6. Security --from-trace round-trip
expected: Replaying the security fixture's self-extracted report via `--from-trace <file>` exits 0 with 6 findings parsed and all assertions passing.
result: pass
evidence: exit 0; "6 findings parsed"; "Results: 9/9 passed" -- identical to default mode.

### 7. CVE auto-clarity carve-out
expected: The 36-word CVE finding in the security holistic example passes under the 75w auto-clarity cap (keyed on [CVE|GHSA|CWE token), while the 5 normal findings hold the 28w per-entry cap. Output shows the carve-out applied, not a budget failure.
result: pass
evidence: "[PASS] per-entry budget: 36 <= 75" (carve-out applied to the CVE finding); the 5 normal findings each assert against 28 ("17 <= 28", "9 <= 28", "15 <= 28", "9 <= 28", "13 <= 28").

### 8. Anti-vacuous guard short-circuit
expected: Feeding `--from-trace` a trace with fewer than 5 findings (e.g. 1 finding) exits NON-zero with a loud guard message BEFORE the budget loop -- no spurious per-finding budget PASS lines are printed.
result: pass
evidence: Both fixtures on a 1-finding trace: exit 1; "[FAIL] anti-vacuous: only 1 findings parsed (need >= 5)"; "Status: [FAIL] -- anti-vacuous guard fired; skipping budget checks"; zero budget PASS lines emitted (WR-01 short-circuit confirmed).

### 9. Bad-mode arg handling
expected: An unknown flag (e.g. `--bogus`) exits 2 and prints usage to stderr for both fixtures.
result: pass
evidence: Both fixtures: exit 2; "usage: tests/D-<name>-budget.sh [--from-trace <file> | --self-test]" on stderr.

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]

## Notes

- UAT executed in automated mode per user directive ("Automate the UAT"). All deliverables are local, zero-dependency bash fixtures; every test was verified by direct execution from repo root.
- ngx-smart-components was NOT needed: no Phase 11 deliverable touches an external target repo, so no worktree was created.
- Temp trace files used for tests 3, 6, 8 were cleaned up after execution.
