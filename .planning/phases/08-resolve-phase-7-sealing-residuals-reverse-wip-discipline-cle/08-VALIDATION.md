---
phase: 8
slug: resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-18
updated: 2026-05-18
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
| 08-01-01 | 01 | 1 | RES-WIP-DISCIPLINE-REVERSAL | -- | wip-discipline section removed from execute SKILL.md; grep verifies zero residuals | grep + file-diff | `git grep -n "wip:" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md ; test $? -eq 1` | [OK] | [pending] |
| 08-01-02 | 01 | 1 | RES-WIP-DISCIPLINE-REVERSAL | -- | path-d / --replay / SYNTHESIZE_PATH_D removed; E-fixture still PASSES on positive 3-path criterion | bash-n + smoke | `bash -n E-verify-before-commit.sh && bash E-verify-before-commit.sh` | [OK] | [pending] |
| 08-01-03 | 01 | 1 | RES-WIP-DISCIPLINE-REVERSAL | -- | REQUIREMENTS GAP-G2 row removed; atomic 5-surface version bump 0.13.1 -> 0.14.0 | grep + 5-surface count | `git grep -nF "GAP-G2-wip-scope" .planning/REQUIREMENTS.md ; test $? -eq 1 && git grep -c "0.14.0" plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/lz-advisor.*/SKILL.md` | [OK] | [pending] |
| 08-02-01 | 02 | 1 | RES-SHAPE-REGRESSION-PARSER | T-8-02-01 (ReDoS) | regex change accepts backtick-wrapped fragment lines; D-reviewer trace replay flips FAIL->PASS | trace-replay | `for trace in .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/*D-reviewer-budget*.txt; do bash D-reviewer-budget.sh --from-trace "$trace" || exit 1; done` | [OK] | [pending] |
| 08-02-02 | 02 | 1 | RES-SHAPE-REGRESSION-PARSER, RES-PFV-OUTLIER-CAP | T-8-02-01 | D-security-reviewer regex + PFV cap raised 66->75w; trace-replay green + n=3 fresh re-runs green | trace-replay + n=3 | `for trace in .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/*D-security-reviewer-budget*.txt; do bash D-security-reviewer-budget.sh --from-trace "$trace" || exit 1; done && for i in 1 2 3; do bash D-security-reviewer-budget.sh || exit 1; done` | [OK] | [pending] |
| 08-03-01 | 03 | 2 | RES-ADVISOR-FRAGMENT-GRAMMAR | -- | D-advisor-budget.sh extended with CODE_BLOCK_RE + [ITEM] structured log; bash -n valid | bash-n + grep | `bash -n D-advisor-budget.sh && rg -nF "[ITEM] idx=" D-advisor-budget.sh` | [OK] | [pending] |
| 08-03-02 | 03 | 2 | RES-ADVISOR-FRAGMENT-GRAMMAR | -- | n=3 fresh sessions captured; 08-MEASUREMENT.md emitted with full schema + gate decision + disposition | file + grep | `test -f 08-MEASUREMENT.md && rg -qE "Gate decision|Disposition" 08-MEASUREMENT.md` | [OK] | [pending] |
| 08-03.5-01 | 03.5 | 3 | RES-ADVISOR-FRAGMENT-GRAMMAR (auto-extend) | -- | conditional gate check; aborts if Plan 3 not INCONCLUSIVE | grep | `rg -qiE "Compound:.*INCONCLUSIVE" 08-MEASUREMENT.md` | conditional | [pending] |
| 08-03.5-02 | 03.5 | 3 | RES-ADVISOR-FRAGMENT-GRAMMAR (auto-extend) | -- | n=2 more sessions captured (total n=5); MEASUREMENT.md re-evaluated at n=5 thresholds | file + grep | `test -f uat-replay-0.14.x/scenario-4-plan.jsonl && test -f uat-replay-0.14.x/scenario-5-plan.jsonl && rg -qE "n=5|Run 5" 08-MEASUREMENT.md` | conditional | [pending] |
| 08-04-01 | 04 | 3 | RES-ADVISOR-FRAGMENT-GRAMMAR (structural) | -- | conditional gate check; aborts if Plan 3/3.5 not FAIL | grep | `rg -qE "Compound:.*FAIL\|Disposition:.*(fragment-grammar\|density\|both\|escalation)" 08-MEASUREMENT.md` | conditional | [pending] |
| 08-04-02 | 04 | 3 | RES-ADVISOR-FRAGMENT-GRAMMAR (structural) | T-8-04-01 | advisor.md modified per disposition (D1/D2/both/escalation) | git diff | `git diff --stat plugins/lz-advisor/agents/advisor.md` (must show modifications) | conditional | [pending] |
| 08-04-03 | 04 | 3 | RES-ADVISOR-FRAGMENT-GRAMMAR (structural) | -- | atomic 5-surface version bump (0.14.1 PATCH or 0.15.0 MINOR); post-fix n=3 gate PASS | grep + n=3 | `! git grep -F 0.14.0 plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/lz-advisor.*/SKILL.md` | conditional | [pending] |
| 08-05-01 | 05 | 1 | WR-04, WR-05 (reconciliation) | -- | git grep discovery; classifies each WR-04/05 reference as HISTORICAL/OPEN-DEFERRAL/CONTEXT-CARRY-FORWARD | grep | `git grep -n "WR-04\|WR-05" .planning/ ; true` | [OK] | [pending] |
| 08-05-02 | 05 | 1 | WR-04, WR-05 (reconciliation) | -- | 07-VERIFICATION.md closure_amendment updated; WR-04/05 marked pre_closed_on_main_2026_05_05 | grep | `git grep -n "pre_closed_on_main_2026_05_05" .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` | [OK] | [pending] |
| 08-05-03 | 05 | 1 | WR-04, WR-05 (reconciliation) | -- | 08-05-SUMMARY.md created with discovery + repurpose decision documented | file + grep | `test -f 08-05-SUMMARY.md && git grep -n "pre_closed_on_main_2026_05_05" 08-05-SUMMARY.md` | [OK] | [pending] |
| 08-06-01 | 06 | 2 | P8-18 advisor narrative SD self-anchor | T-8-06-01 | Rule 5b extension (or 5c) added to context-packaging.md | grep | `git grep -nF "Advisor narrative SD self-anchor" plugins/lz-advisor/references/context-packaging.md` | [OK] | [pending] |
| 08-06-02 | 06 | 2 | P8-18 advisor narrative SD self-anchor | T-8-06-02 | New smoke fixture G-advisor-narrative-sd-pv.sh created; bash -n valid | file + bash-n | `test -f .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh && bash -n .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh` | NEW (Plan 6) | [pending] |
| 08-07-01 | 07 | 2 | FIND-F-CLASS-2-OBSERVABILITY | T-8-07-01 (CVE-test-scenario) | UAT session captured; verify_request class="2" emitted | trace capture + grep | `test -f 08-class-2-trigger-session.jsonl && rg -qF "<verify_request" 08-class-2-trigger-session.jsonl && rg -qF "class=\"2" 08-class-2-trigger-session.jsonl` | NEW (trace) | [pending] |
| 08-07-02 | 07 | 2 | FIND-F-CLASS-2-OBSERVABILITY | T-8-07-02 | F-class-2-escalation.sh smoke fixture created; bash -n valid | file + bash-n | `test -f .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh && bash -n .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh` | NEW (Plan 7) | [pending] |

*Status: [pending] -> [green] / [red] / [flaky]*

**Notes:**

- Task IDs use the convention `08-NN-MM` where NN = plan number (01, 02, 03, 03.5, 04, 05, 06, 07) and MM = task number within plan (01, 02, 03).
- "File Exists" = `[OK]` if the test infrastructure (smoke fixture) is already in the repo; `NEW` if Plan creates it; `conditional` if the plan's tasks only fire when an upstream gate fires.
- T-8-02-01 ReDoS = Plan 2 regex change is non-catastrophic-backtracking pattern (proposed `/^\`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+?)\`?$/gm` is linear -- non-greedy `(.+?)` does not enable ReDoS because the alternation set is finite and the anchors bound the line).
- T-8-07-01 CVE-test-scenario = Plan 7 trigger scenario uses real CVE data (systeminformation<5.27.14 CVE-2025-68154 per researcher) but only as prompt text; no actual install of vulnerable code.
- Plans 03.5 and 04 are CONDITIONAL: 03.5 ships only if 03 emits INCONCLUSIVE; 04 ships only if 03 (or 03.5) emits FAIL. Their task verification is gated on upstream gate state.

---

## Wave 0 Requirements

- No new test framework required -- existing bash smoke tests + `claude -p` infrastructure cover all phase requirements.
- Plans 3 + 6 + 7 each create NEW smoke fixtures during their execution (not Wave 0):
  - Plan 3: extends `D-advisor-budget.sh` with per-item code-block flag detection (in-place edit, not new fixture)
  - Plan 6: creates new fixture `G-advisor-narrative-sd-pv.sh`
  - Plan 7: creates new fixture `F-class-2-escalation.sh`

*All infrastructure exists. No Wave 0 setup tasks required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Plan 7 Class-2 trigger UAT session produces observable `<verify_request class="2">` block | FIND-F-CLASS-2-OBSERVABILITY | The session output structure depends on Sonnet 4.6 + Opus 4.7 model behavior under a designed CVE-relevant prompt; smoke fixture can assert block emission post-hoc but the trigger session itself is a `claude -p` invocation captured to disk for trace inventory | 1. Run: `claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.security-review <CVE-prompt>" --verbose --output-format=stream-json 2>&1 | tee 08-class-2-trigger-session.jsonl`. 2. Verify session log contains `<verify_request` with `class="2"`. 3. Verify executor invokes WebSearch or WebFetch in subsequent turns. 4. Verify second security-reviewer invocation receives pv-* anchors. |
| Plan 3 + Plan 3.5 measurement disposition: gate decision (PASS/FAIL/INCONCLUSIVE) accuracy | RES-ADVISOR-FRAGMENT-GRAMMAR | Compound OR-gate evaluation is mechanical per D-02 borderline band rules, but classification depends on `claude -p` session output; human spot-check confirms parser counted correctly | 1. After Plan 3 emits 08-MEASUREMENT.md, spot-check per-item word counts against raw session logs. 2. Confirm `>=2/3 FAIL` (D1) or aggregate-band rules (D2) applied correctly. 3. If INCONCLUSIVE, confirm Plan 3.5 auto-spawned with n=2 extension. |

---

## Validation Sign-Off

- All tasks have automated verify (smoke fixture or `claude -p` session) or are conditional on upstream gate
- Sampling continuity: no 3 consecutive tasks without automated verify (Plan 1 + Plan 5 each have file-diff/grep verify; OK)
- Wave 0 covers all infrastructure (no Wave 0 needed per analysis above)
- No watch-mode flags in any `claude -p` invocation (all use `--output-format=stream-json` and exit on completion)
- Feedback latency < 5s for parser smokes; UAT sessions are async-acceptable up to 300s
- `nyquist_compliant: true` set in frontmatter after planner filled task IDs and verified coverage

**Approval:** approved 2026-05-18 (planner-completed; task IDs filled per planning phase)
