---
phase: 11-fixture-baseline
verified: 2026-06-07T01:10:08Z
status: passed
score: 4/4 must-haves verified
overrides_applied: 0
---

# Phase 11: Fixture baseline Verification Report

**Phase Goal:** The two budget smoke fixtures exist as committed, tracked tests that pass green against the CURRENT shorthand grammar, establishing a regression baseline before any grammar change.
**Verified:** 2026-06-07T01:10:08Z
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

The four success criteria from ROADMAP.md are the binding contract. Each was verified against the codebase (not the SUMMARY claims) by reading the fixtures, running them in all three modes, and reading the agent files they parse.

| # | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | `D-reviewer-budget.sh` (3-slot `FRAGMENT_RE` for `crit`/`imp`/`sug`/`q`) and `D-security-reviewer-budget.sh` (4-slot, OWASP `[Axx]` bracket preserved) exist as committed files in the repo | VERIFIED | Both files present (`tests/D-reviewer-budget.sh` 259 lines, `tests/D-security-reviewer-budget.sh` 246 lines), `git ls-files` confirms both tracked, `git status --short` clean (no uncommitted changes), `git diff HEAD` empty. Reviewer `FRAGMENT_RE` = `^\`?[^[:space:]]+:[0-9]+(-[0-9]+)?: (crit\|imp\|sug\|q): ` (3-slot, D-reviewer-budget.sh:131-132). Security `FRAGMENT_RE` adds `\[[^]]+\] ` OWASP slot (4-slot, D-security-reviewer-budget.sh:108). |
| 2 | Both fixtures exit 0 (green) when run against the current shorthand-grammar agent prompts | VERIFIED | Ran both myself. `bash tests/D-reviewer-budget.sh` -> exit 0, "7 findings parsed", 10/10 assertions. `bash tests/D-security-reviewer-budget.sh` -> exit 0, "6 findings parsed", 9/9 assertions. Agent files confirmed to carry the CURRENT shorthand grammar (`crit:`/`imp:`/`sug:`/`q:`) in their holistic worked examples (reviewer.md:125-142, security-reviewer.md:133-149). |
| 3 | Each fixture carries an anti-vacuous-pass assertion (`matched_count >= min`) that runs BEFORE the word-budget loop | VERIFIED | Reviewer: `matched_count >= MIN_FINDINGS` (MIN_FINDINGS=5) printed + asserted at lines 158-189, the per-finding budget loop starts at line 197 (guard is textually + behaviorally BEFORE). Security: same guard at lines 134-164, budget loop at line 170. Behaviorally proven: a 1-finding `--from-trace` input short-circuits non-zero ("anti-vacuous guard fired; skipping budget checks") with NO spurious budget PASS lines (WR-01 fix). `--self-test` (zero findings) exits non-zero (1) in both fixtures. |
| 4 | The fixtures match the documented 3-slot / 4-slot FRAGMENT_RE shape from the Phase 08 fixture decisions (parser extracts findings from the two-inline-code-span emission shape) | VERIFIED | Reviewer parses the 3-slot shape `<file>:<line>: <severity>: <problem>. <fix>.` (7 findings, verify_request line SKIPPED). Security parses the 4-slot shape `<file>:<line>: <severity>: [<OWASP-tag>] <threat>. <fix>.` with the OWASP `[Axx]` bracket preserved as a parsed slot (`[Uncategorized]` matched by `\[[^]]+\]`), 6 findings. Verified the security prefix-strip removes `<file>:<line>: <severity>: [A06] ` but RETAINS the inner `[CVE-2025-1234]` token in the body so the 75w auto-clarity carve-out (D-08) triggers on the 36w CVE finding. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `tests/D-reviewer-budget.sh` | 3-slot reviewer budget smoke fixture (self-extract / --from-trace / --self-test); contains FRAGMENT_RE; >=80 lines | VERIFIED | Exists (259 lines), git-tracked, contains `FRAGMENT_RE`, `set -euo pipefail`, `MIN_FINDINGS=5`, `matched_count`, three modes. Wired to `plugins/lz-advisor/agents/reviewer.md` via self-extract. Data flows: default mode parses 7 real findings from the live agent file. |
| `tests/D-security-reviewer-budget.sh` | 4-slot security-reviewer budget smoke fixture with OWASP bracket slot + 75w auto-clarity carve-out; contains FRAGMENT_RE; >=90 lines | VERIFIED | Exists (246 lines), git-tracked, contains 4-slot `FRAGMENT_RE` with `\[[^]]+\]`, `AUTO_CLARITY_CAP=75` keyed on `\[(CVE\|GHSA\|CWE)`, `### Threat Patterns` heading (not Cross-Cutting), three modes. Wired to `plugins/lz-advisor/agents/security-reviewer.md` via self-extract. Data flows: default mode parses 6 real findings. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `tests/D-reviewer-budget.sh` | `plugins/lz-advisor/agents/reviewer.md` | self-extract of the holistic worked example block (default mode) | WIRED | `REVIEWER_AGENT="plugins/lz-advisor/agents/reviewer.md"` (line 32, post-Phase-9 path; NOT the stale top-level `agents/reviewer.md`), `[ -f ]` loud-fail guard, awk-range self-extract reads the live block. Running default mode parses 7 real findings out of the agent file. |
| `tests/D-reviewer-budget.sh` | `matched_count >= MIN_FINDINGS` guard | anti-vacuous assertion before the budget loop | WIRED | Guard at lines 183-189, before the budget loop at line 197. `matched_count` populated by the parse loop (lines 136-151). |
| `tests/D-security-reviewer-budget.sh` | `plugins/lz-advisor/agents/security-reviewer.md` | self-extract of the holistic worked example block (default mode) | WIRED | `SECURITY_AGENT="plugins/lz-advisor/agents/security-reviewer.md"` (line 25), `[ -f ]` guard, awk-range self-extract. Running default mode parses 6 real findings. |
| `tests/D-security-reviewer-budget.sh` | 75w auto-clarity outlier cap | CVE/GHSA/CWE token detection raises the per-entry cap | WIRED | `if [[ "$body" =~ \[(CVE\|GHSA\|CWE) ]]; then cap="$AUTO_CLARITY_CAP"` (lines 173-174). Verified: the 36w CVE finding triggers the 75w cap and passes; the 5 normal findings hold the 28w cap. |

### Data-Flow Trace (Level 4)

The fixtures render dynamic data (findings parsed from the live agent files), so Level 4 applies.

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `tests/D-reviewer-budget.sh` | `matched_count` / `FINDING_BODIES` | `get_report()` awk-extract of reviewer.md holistic block | Yes -- 7 real findings (measured bodies 10/9/11/7/17/13/16 words) flow into the budget loop; not a hardcoded count | FLOWING |
| `tests/D-security-reviewer-budget.sh` | `matched_count` / `FINDING_BODIES` | `get_report()` awk-extract of security-reviewer.md holistic block | Yes -- 6 real findings (5 normal 17/9/15/9/13w + 1 CVE auto-clarity 36w) flow into the budget loop with the carve-out | FLOWING |

The self-extract is genuinely coupled to the agent files: the parser does not hardcode the finding text, it reads and de-quotes the live blockquoted worked example. This is the intended lockstep coupling (Phase 12's grammar edit will flip these RED).

### Behavioral Spot-Checks

All behaviors are runnable bash fixtures with no external dependencies, so every must-have was verified by direct execution (not deferred to human).

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Reviewer green on HEAD | `bash tests/D-reviewer-budget.sh` | exit 0, "7 findings parsed", 10/10 | PASS |
| Security green on HEAD | `bash tests/D-security-reviewer-budget.sh` | exit 0, "6 findings parsed", 9/9 | PASS |
| Reviewer fail-loudly | `bash tests/D-reviewer-budget.sh --self-test` | exit 1 (guard fires on zero findings) | PASS |
| Security fail-loudly | `bash tests/D-security-reviewer-budget.sh --self-test` | exit 1 (guard fires on zero findings) | PASS |
| Reviewer --from-trace replay | `bash tests/D-reviewer-budget.sh --from-trace <extracted-report>` | exit 0, 7 findings, 10/10 | PASS |
| Security --from-trace replay | `bash tests/D-security-reviewer-budget.sh --from-trace <extracted-report>` | exit 0, 6 findings, 9/9 | PASS |
| Bad-mode arg handling | `bash tests/D-reviewer-budget.sh --bogus` | exit 2, usage to stderr | PASS |
| WR-01 adversarial: too-few-findings short-circuit | `--from-trace` with 1 finding | exit 1, loud FAIL, NO spurious budget PASS lines | PASS |
| WR-03 adversarial: renamed required heading fails loudly | security `--from-trace` with `### Threat Analysis` instead of `### Threat Patterns` | exit 1, "REQUIRED '### Threat Patterns' heading not found" (not a vacuous pass) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| GATE-01 | 11-01-PLAN, 11-02-PLAN | Budget smoke fixtures (`D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`) committed as tracked tests with anti-vacuous-pass assertions (`matched_count >= min`) | SATISFIED | Both fixtures exist, tracked, green on HEAD, carry the `matched_count >= 5` guard before the budget loop, prove fail-loudly via `--self-test`. Both halves complete. |

**Note on the GATE-01 wording vs the Phase 11 goal.** REQUIREMENTS.md GATE-01 reads "re-authored against the GROUPED grammar." The Phase 11 ROADMAP goal and both PLANs explicitly scope Phase 11 to the CURRENT shorthand grammar as build-order step 0 -- the baseline MUST be green on HEAD so Phase 12's grouped-grammar rewrite has a fixture to flip RED, then GREEN. The grouped grammar does not exist yet. This is intended sequencing, not a gap: the Traceability table maps GATE-01 to Phase 11 and the four ROADMAP Success Criteria (the binding per-phase contract) all specify the CURRENT shorthand grammar. The "against the grouped grammar" clause in the prose requirement is satisfied across Phase 11 (author the baseline) + Phase 12 (retarget to grouped, in lockstep). All four Phase 11 Success Criteria are met; no Phase 11 deliverable is missing.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none) | -- | -- | -- | No debt markers (TBD/FIXME/XXX), no TODO/HACK/PLACEHOLDER, no real `eval`/`source` of the trace file (the four `eval/source` grep hits are documentation comments stating the T-11-01 mitigation, not invocations), ASCII-only confirmed (LC_ALL=C scan returns no non-ASCII bytes in either file). |

### Deviations Reviewed

Both SUMMARYs document one auto-fixed deviation each: an intra-plan contradiction on the `--self-test` exit code, resolved in favor of the dominant, repeated contract (non-zero exit = fail-loudly proof). Verified directly: both `--self-test` modes exit 1, matching the binding acceptance criterion. The resolution is correct -- a green run on zero-finding input would be the defect.

The post-execution code review (11-REVIEW.md) found 2 Critical + 5 Warning findings; 11-REVIEW-FIX.md reports all 7 fixed (status all_fixed), commits a58db4f..a607904. Verified: the full fix chain is present in HEAD, the fixtures are clean/committed at the fixed state, and the two highest-risk fixes (CR-01 section-agnostic terminator, WR-01 short-circuit, WR-03 heading-drift guard) were re-proven behaviorally with adversarial traces during this verification, not merely re-read.

### Human Verification Required

None. Every must-have is a runnable, zero-dependency bash fixture verified by direct execution in this verification (default / --self-test / --from-trace / adversarial traces / bad-mode). No visual, real-time, or external-service surface exists.

### Gaps Summary

No gaps. All four ROADMAP Success Criteria are VERIFIED against the codebase: both fixtures exist as committed, tracked tests; both exit 0 green against the current shorthand grammar; both carry the `matched_count >= 5` anti-vacuous guard before the budget loop (proven non-vacuous via `--self-test` and adversarial traces); both match the documented 3-slot / 4-slot FRAGMENT_RE shapes with the OWASP `[Axx]` bracket preserved. GATE-01 is satisfied. The phase goal -- a green regression baseline on the current shorthand grammar before any grammar change -- is achieved.

---

_Verified: 2026-06-07T01:10:08Z_
_Verifier: Claude (gsd-verifier)_
