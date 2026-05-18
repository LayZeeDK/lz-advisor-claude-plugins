---
phase: 8
slug: resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 8 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash smoke tests (`.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/*.sh`) + `claude -p` non-interactive sessions |
| **Config file** | none -- smoke tests are self-contained shell scripts |
| **Quick run command** | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/<fixture>.sh` (per-plan; see Per-Task Verification Map) |
| **Full suite command** | `for f in .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/*.sh; do bash "$f" || exit 1; done` |
| **Estimated runtime** | Per-fixture: 1-5s (regex parsers); Plan 3 + Plan 7 UAT sessions: 60-300s each (`claude -p` invocations) |

---

## Sampling Rate

- **After every task commit:** Run the smoke fixture touched by the task (e.g., `bash D-reviewer-budget.sh` after Plan 2 SHAPE edit)
- **After every plan wave:** Run all smoke fixtures in the directory (full suite command above)
- **Before `/gsd-verify-work`:** Full suite must be green; 08-MEASUREMENT.md must exist and contain n=3 (or n=5) gate decision
- **Max feedback latency:** 5s for parser smoke tests; up to 300s for `claude -p` UAT sessions

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-XX | 01 | 1 | RES-WIP-DISCIPLINE-REVERSAL | -- | wip-discipline section removed; smoke fixture still PASSES post-removal | file-diff + smoke | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` | ✅ | ⬜ pending |
| 08-02-XX | 02 | 1 | RES-SHAPE-REGRESSION-PARSER, RES-PFV-OUTLIER-CAP | T-2-ReDoS | regex change does not introduce catastrophic backtracking; trace-replay flips FAIL->PASS | trace-replay + smoke + n=3 PFV | `bash D-reviewer-budget.sh --from-trace <trace>` (x5 SHAPE traces) + `bash D-security-reviewer-budget.sh --from-trace <trace>` (x5 SHAPE + x4 PFV traces) + n=3 fresh `claude -p` re-runs for PFV | ✅ | ⬜ pending |
| 08-03-XX | 03 | 2 | RES-ADVISOR-FRAGMENT-GRAMMAR | -- | parser extension does not break existing fragment parsing; 08-MEASUREMENT.md schema-conformant | parser smoke + n=3 `claude -p` sessions | `bash D-advisor-budget.sh --from-trace <existing-trace>` (regression) + 3x `claude --plugin-dir plugins/lz-advisor -p "/lz-advisor.plan <scenario-prompt>"` | ✅ | ⬜ pending |
| 08-03.5-XX | 03.5 | 2 | RES-ADVISOR-FRAGMENT-GRAMMAR (auto-extend) | -- | conditional: triggers IF Plan 3 emits INCONCLUSIVE | 2x `claude -p` sessions | 2x `claude --plugin-dir plugins/lz-advisor -p "/lz-advisor.plan <scenario-prompt>"` | conditional | ⬜ pending |
| 08-04-XX | 04 | 3 | RES-ADVISOR-FRAGMENT-GRAMMAR (structural) | -- | conditional: ships IF Plan 3 (or 3.5) gate decision is FAIL; advisor.md fragment-grammar template extended OR density example audited OR `<output_constraints>` XML escalation | parser smoke + n=3 re-runs against post-fix advisor | `bash D-advisor-budget.sh` (regression) + 3x `claude -p` post-fix verification | conditional | ⬜ pending |
| 08-05-XX | 05 | 1 | WR-04, WR-05 (reconciliation) | -- | stale deferral references removed from REQUIREMENTS.md + CONTEXT.md + 07-VERIFICATION.md closure_amendment; no plugin file changes | file-diff + grep | `git grep -n "WR-04\|WR-05" .planning/` (must show no open / deferred references) | ✅ | ⬜ pending |
| 08-06-XX | 06 | 2 | P8-18 advisor narrative SD self-anchor | -- | new sub-rule added to context-packaging.md Rule 5b (or 5c); smoke fixture asserts executor verifies or flags advisor SD load-bearing claims | new smoke fixture | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/<G-advisor-narrative-sd-pv.sh-or-planner-name>.sh` | NEW (Plan 6) | ⬜ pending |
| 08-07-XX | 07 | 2 | FIND-F-CLASS-2-OBSERVABILITY | T-7-CVE-test-scenario | 1 UAT session against CVE-relevant prompt triggers `<verify_request class="2">`; executor parses + invokes WebSearch/WebFetch + re-invokes security-reviewer one-shot | 1x `claude -p` UAT + optional smoke fixture | `claude --plugin-dir plugins/lz-advisor -p "/lz-advisor.security-review <CVE-prompt>"` + trace capture + (optional) `bash F-class-2-escalation.sh` | NEW (Plan 7) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Notes:**

- Task ID column uses `08-NN-XX` placeholder; planner fills `XX` per task in each PLAN.md.
- "File Exists" = ✅ if the test infrastructure (smoke fixture) is already in the repo; NEW if Plan creates it; conditional if the plan's tasks only fire when an upstream gate fires.
- T-2-ReDoS = Plan 2 regex change should be a non-catastrophic-backtracking pattern (current proposed `/^\`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+?)\`?$/gm` is linear -- non-greedy `(.+?)` does not enable ReDoS because the alternation set is finite and the anchors bound the line).
- T-7-CVE-test-scenario = Plan 7 trigger scenario uses real CVE data (systeminformation@<5.27.14 CVE-2025-68154 per researcher) but only as prompt text; no actual install of vulnerable code.

---

## Wave 0 Requirements

- [ ] No new test framework required -- existing bash smoke tests + `claude -p` infrastructure cover all phase requirements.
- [ ] Plan 3 + Plan 6 + Plan 7 each create NEW smoke fixtures during their execution (not Wave 0):
  - Plan 3: extends `D-advisor-budget.sh` with per-item code-block flag detection (in-place edit, not new fixture)
  - Plan 6: creates new fixture (planner names; suggested `G-advisor-narrative-sd-pv.sh`)
  - Plan 7: creates new fixture `F-class-2-escalation.sh` OR extends `E-verify-before-commit.sh` with path-e assertion (planner's discretion -- suggested standalone for letter-anchor consistency)

*All infrastructure exists. No Wave 0 setup tasks required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Plan 7 Class-2 trigger UAT session produces observable `<verify_request class="2">` block | FIND-F-CLASS-2-OBSERVABILITY | The session output structure depends on Sonnet 4.6 + Opus 4.7 model behavior under a designed CVE-relevant prompt; smoke fixture can assert block emission post-hoc but the trigger session itself is a `claude -p` invocation captured to disk for trace inventory | 1. Run: `claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.security-review <CVE-prompt>" --verbose --output-format=stream-json 2>&1 | tee 08-class-2-trigger-session.jsonl`. 2. Verify session log contains `<verify_request` with `class="2"`. 3. Verify executor invokes WebSearch or WebFetch in subsequent turns. 4. Verify second security-reviewer invocation receives pv-* anchors. |
| Plan 3 + Plan 3.5 measurement disposition: gate decision (PASS/FAIL/INCONCLUSIVE) accuracy | RES-ADVISOR-FRAGMENT-GRAMMAR | Compound OR-gate evaluation is mechanical per D-02 borderline band rules, but classification depends on `claude -p` session output; human spot-check confirms parser counted correctly | 1. After Plan 3 emits 08-MEASUREMENT.md, spot-check per-item word counts against raw session logs. 2. Confirm `>=2/3 FAIL` (D1) or aggregate-band rules (D2) applied correctly. 3. If INCONCLUSIVE, confirm Plan 3.5 auto-spawned with n=2 extension. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify (smoke fixture or `claude -p` session) or are conditional on upstream gate
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (Plan 1 + Plan 5 each have single file-diff verify; OK)
- [ ] Wave 0 covers all infrastructure (no Wave 0 needed per analysis above)
- [ ] No watch-mode flags in any `claude -p` invocation (all use `--output-format=stream-json` and exit on completion)
- [ ] Feedback latency < 5s for parser smokes; UAT sessions are async-acceptable up to 300s
- [ ] `nyquist_compliant: true` set in frontmatter once planner fills task IDs and verifies coverage

**Approval:** pending
