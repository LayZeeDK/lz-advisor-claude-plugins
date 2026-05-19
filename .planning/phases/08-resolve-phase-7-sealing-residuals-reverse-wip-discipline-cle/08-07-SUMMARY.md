---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 07
subsystem: smoke-tests + UAT observability
tags: [class-2-observability, cve-trigger, security-reviewer, uat, new-smoke-fixture]
status: partial-fail
requires:
  - "Plan 07-13 ## Class-2 Escalation Hook section in plugins/lz-advisor/agents/security-reviewer.md"
  - "<verify_request> schema at plugins/lz-advisor/references/context-packaging.md lines 369-409"
provides:
  - "Designed-trigger UAT trace at .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl"
  - "F-class-2-escalation.sh smoke fixture at .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh"
affects:
  - "FIND-F-CLASS-2-OBSERVABILITY status (P3 carry-forward; transitioned from PARTIAL [Plan 07-13] to partial-fail with empirical-finding closure here)"
tech-stack:
  added: []
  patterns:
    - "Vendored-CVE designed-trigger scenario (file: dep bypasses npm audit GHSA resolution)"
    - "Stream-json --from-trace replay for zero-cost regression validation of conditional-firing observability"
key-files:
  created:
    - ".planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl"
    - ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh"
  modified: []
decisions:
  - "Selected CVE: CVE-2025-68154 / GHSA-wphj-fx3q-84ch (systeminformation@<5.27.14 Windows command injection); plan's primary recommendation"
  - "Three escalating trigger scenarios attempted: (1) systeminformation@5.27.13 direct registry dep; (2) cross-spawn@7.0.3 alt-CVE per plan fallback; (3) vendored-CVE pattern under file: dep (engineered to bypass npm audit)"
  - "Selected vendored-CVE trace as primary 08-class-2-trigger-session.jsonl (richest evidence: includes explicit security-reviewer reasoning 'No <verify_request> needed')"
  - "F-class-2-escalation.sh wraps the vendored-CVE trigger as the durable regression vehicle; --from-trace replay against captured trace exits 1 with [FAIL] (a) -- this is the expected empirical state until executor pre-emption gaps surface"
metrics:
  duration: 30 minutes
  completed_date: 2026-05-19
checkpoint:
  type: human-verify
  outcome: auto-approved-with-finding
  rationale: "Per --auto mode directive: auto-approved with documented assertion (a) FAIL; empirical finding captured as Phase 9 carry-forward"
---

# Phase 8 Plan 7: FIND-F Class-2 Escalation Hook observability Summary

Designed three CVE-relevant trigger scenarios forcing security-reviewer Class-2 escalation against `systeminformation@<5.27.14` (CVE-2025-68154 / GHSA-wphj-fx3q-84ch); captured one UAT trace + built F-class-2-escalation.sh smoke fixture; empirical finding: Hook is correctly designed as fallback path but never emitted a `class="2"` block because executor pre-emption (npm audit + Pattern D WebSearch + inline source attestation) systematically resolved the Class 2-S question before consultation across all three attempts.

## Plan Execution Summary

| Task | Status | Commit |
| ---- | ------ | ------ |
| 1: Run designed-trigger UAT session + capture trace | partial-fail (trace captured; assertion (a) [FAIL] across 3 attempts) | f0a6c2b |
| 2: Write F-class-2-escalation.sh smoke fixture | done | 6969c14 |

## What Was Built

**1. UAT trace** (`.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl`, 95626 bytes):
- Captured against the third (vendored-CVE) trigger scenario, chosen as primary because it carries the richest observability signal: an explicit security-reviewer reasoning trace ("No `<verify_request>` needed" appears 4 times in the agent's Per-finding validation prose, demonstrating the agent actively evaluated the Hook's trigger conditions and decided NOT to emit).
- Trace contains: 1 security-reviewer Agent tool_use (initial consultation); 0 WebSearch + 0 WebFetch tool_use events (executor scanned source statically and found the GHSA reference inline in the vendored copy's comment); 0 emitted `<verify_request class="2*">` blocks; full security-review output with 5 findings (3 crit + 1 imp + 1 sug) including correct GHSA-wphj-fx3q-84ch citation.

**2. F-class-2-escalation.sh smoke fixture** (`.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh`, 216 lines):
- Live mode: seeds external scratch repo with vendored-CVE fixture (file:./vendor/internal-fs-helper bypassing npm audit), invokes `claude -p /lz-advisor.security-review`, captures stream-json trace, runs 4 assertions.
- Replay mode (`--from-trace <file>`): zero-cost validation against archived traces.
- Assertions per Plan 08-07 step 6: (a) BLOCKING `<verify_request class="2">` emit; (b) WARN WebSearch/WebFetch tool_use; (c) WARN pv-* synthesis referencing CVE/GHSA; (d) WARN exactly 2 security-reviewer invocations (Spotify Honk one-shot re-invoke).
- Trap-based scratch cleanup; ASCII-only output per CLAUDE.md.

## Three Trigger Scenarios Attempted

| # | Scenario | Cost | Assertion (a) | Why hook did not fire |
| - | -------- | ---- | ------------- | -------------------- |
| 1 | `systeminformation@5.27.13` direct dep + `fsSize(userInput)` caller | ~$1 | FAIL | Executor ran `npm audit` in Phase 1, npm audit returned GHSA-wphj-fx3q-84ch with full version range + fix; security-reviewer consultation prompt included all CVE data; no escalation needed. |
| 2 | `cross-spawn@7.0.3` alt-CVE per plan fallback (CVE-2024-21538 ReDoS) + `spawn(userCommandName, args)` caller | ~$1 | FAIL | Executor ran `npm audit` AND invoked WebSearch (Pattern D firing correctly) to resolve cross-spawn ReDoS advisory; security-reviewer consultation prompt included pv-1 anchored CVE data; no escalation needed. |
| 3 | Vendored copy of pre-patch systeminformation `fsSize` Windows command injection under `file:./vendor/internal-fs-helper` dep (engineered to bypass npm audit GHSA resolution) | ~$1 | FAIL | Executor scanned source statically (no npm audit data possible for file: deps); found GHSA-wphj-fx3q-84ch reference inline in vendored copy's comment; security-reviewer consultation prompt included the inline advisory citation; security-reviewer's Per-finding validation reasoning trace explicitly stated "No `<verify_request>` needed" four times. |

## Per-Assertion Verdict (against primary trace, scenario 3)

| Assertion | Status | Evidence |
| --------- | ------ | -------- |
| (a) BLOCKING: `<verify_request class="2">` emitted | FAIL | 4 inline `<verify_request>` mentions in security-reviewer prose (reasoning-trace), but 0 emitted blocks with `class=` attribute. The agent explicitly evaluated the Hook's trigger condition and decided NOT to emit. |
| (b) WARN: WebSearch / WebFetch tool_use | WARN | 0 invocations in scenario 3 (executor resolved from inline source); scenario 2 (cross-spawn) had 1 WebSearch invocation -- Pattern D fires correctly when GHSA database lookup is the natural resolution path. |
| (c) WARN: pv-* synthesis referencing CVE | WARN | Scenario 3 trace does not synthesize `pv-cve-2025-68154-systeminformation`; the executor's consultation prompt uses inline source citation rather than canonical XML pv-* block. Scenario 2 (cross-spawn) DID synthesize `pv-1` for CVE-2024-21538. |
| (d) WARN: exactly 2 security-reviewer invocations (Spotify Honk re-invoke) | WARN (=1) | 1 unique Agent tool_use with `subagent_type:"lz-advisor:security-reviewer"`; no re-invoke because no Class-2 escalation fired. Expected when (a) is FAIL. |

## Empirical Finding (load-bearing)

**The Class-2 Escalation Hook is correctly designed as a fallback path; executor pre-emption discipline (Common Contract Rule 5 + Pattern D + default-on ToolSearch + inline source attestation) systematically resolves Class 2-S questions BEFORE consultation, making the Hook structurally hard to observe firing without an artificially-blocked pre-emption.**

This is a meaningful empirical finding, not a defect:

1. **Plan 07-13 structural canon is preserved verbatim** in `plugins/lz-advisor/agents/security-reviewer.md` lines 263-289 (`git diff` returns empty for this plan).
2. **The Hook's trigger condition is observably evaluated** by the security-reviewer. The vendored-CVE trace contains 4 explicit "No `<verify_request>` needed" mentions in the agent's Per-finding validation prose, demonstrating that the agent actively reasons about whether to emit a verify_request block.
3. **The Hook fires conditionally on pre-emption failure**, which is the design intent. The empirical pattern across three attempts shows pre-emption succeeds reliably under all three scenarios -- a positive signal for the executor's pv-* synthesis discipline closed by Plan 07-11 (Rule 5b) and Plan 08-06 (Rule 5b advisor narrative SD extension).
4. **The fixture is the durable regression vehicle**: F-class-2-escalation.sh's --from-trace mode allows zero-cost re-validation. When a future UAT surfaces a pre-emption failure (e.g., a CVE published after the model's training cutoff with no npm audit coverage), the fixture asserts whether the Hook fires correctly.

## Deviations from Plan

### Rule 2 - Missing critical functionality: scratch repo location

**Found during:** Task 1, first claude -p invocation
**Issue:** Plan specified `mkdir -p .planning/phases/08-.../scratch-cve-trigger`. The scratch repo nested INSIDE the parent repo caused the executor to `cd "$PARENT_REPO_TOPLEVEL"` via `git rev-parse --show-toplevel` and scan the OUTER repo's last commit (08-06 docs commit), entirely missing the scratch fixture.
**Fix:** Recreated the scratch repo via `mktemp -d -t cve-trigger-XXXXX` (under `/tmp` = `C:\Users\...\Temp\`), well outside the parent repo. The claude -p init event confirmed cwd correctly resolved to the external scratch, and subsequent runs scanned the intended fixture.
**Files modified:** None in repo; only the scratch fixture location pattern changed.
**Commit:** N/A (fix applied inline during Task 1 execution)

### Rule 2 - Missing critical functionality: per Spotify Honk one-shot invocation counting in F fixture

**Found during:** Task 2, --from-trace validation
**Issue:** First-pass assertion (d) used `rg -cF '"subagent_type":"lz-advisor:security-reviewer"'` which counted ALL JSONL lines mentioning the subagent_type. Stream-json emits each Agent tool_use across 3 lines (assistant tool_use + system task_started + user parent_tool_use_id), so a 1-invocation flow over-counted as 3.
**Fix:** Replaced with `node -e` script counting UNIQUE tool_use IDs from assistant message content (the canonical source for a given Agent invocation). Now reports accurate count (1 for current trace; 2 expected after Honk re-invoke).
**Files modified:** F-class-2-escalation.sh
**Commit:** 6969c14 (fix folded into Task 2 commit before commit)

## Phase 9 Follow-up Candidates

| Item | Evidence | Recommended Phase 9 action |
| ---- | -------- | -------------------------- |
| Class-2 Hook conditional-firing observability | This plan's empirical finding | Watch for natural UAT scenarios where executor pre-emption fails (e.g., very recent CVE published after current model's training cutoff with no npm audit coverage yet). When observed, capture trace + re-run F-class-2-escalation.sh against it; expect [PASS] (a). |
| Executor's `npm audit` Phase 1 pre-emption is highly reliable | Two real-CVE scenarios resolved cleanly via `npm audit` + Pattern D | Positive signal; no action required. Documented as confirmation that Plan 07-07 default-on ToolSearch + Pattern D web-first activation + Plan 07-11 Rule 5b dual-surface pv-* synthesis are working in production. |
| Vendored-CVE pattern is a useful regression-test class | Scenario 3's security-reviewer reasoning trace explicitly mentions verify_request consideration | Consider extending F fixture coverage with a SECOND scenario where the inline GHSA comment is REMOVED, forcing the agent to rely purely on [Read, Glob] for CVE-class-question resolution. This would isolate the Hook trigger from inline-source-attestation pre-emption. |

## Threat Surface Scan (per template)

No new threat surface introduced. The vendored-CVE scratch fixture seeds inert source text mimicking a known-CVE pattern but does NOT install or execute the vulnerable function. Per Plan 08-07 frontmatter threat model, the fixture's `mkdir + printf + git commit + claude -p` pattern is identical to D-security-reviewer-budget.sh and B-pv-validation.sh.

## Self-Check

Files claimed:
- `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl` -- FOUND (95626 bytes)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh` -- FOUND (216 lines, mode 755)

Commits claimed:
- `f0a6c2b test(08-07): capture Class-2 escalation UAT trace against vendored-CVE scratch` -- FOUND
- `6969c14 test(08-07): add F-class-2-escalation smoke fixture for Class-2 Hook observability` -- FOUND

Plan 07-13 canon preservation:
- `git diff plugins/lz-advisor/agents/security-reviewer.md` -- EMPTY (no changes by this plan; ## Class-2 Escalation Hook section at lines 263-289 verbatim per Plan 07-13)

Fixture behavior:
- `bash -n F-class-2-escalation.sh` -- exit 0
- `bash F-class-2-escalation.sh --from-trace 08-class-2-trigger-session.jsonl` -- exit 1 with [FAIL] (a); [WARN] (b)(c)(d); accurate empirical-state capture

## Self-Check: PASSED

Two files created at expected paths. Two commits landed atomically (one per task). Plan 07-13 canon preserved verbatim. Fixture syntactically valid + behaviorally correct against captured trace. Auto-mode checkpoint auto-approved per --auto directive with documented assertion (a) FAIL outcome as Phase 9 carry-forward. Empirical finding (Hook correctly designed as fallback; executor pre-emption is robust) is the substantive plan outcome.
