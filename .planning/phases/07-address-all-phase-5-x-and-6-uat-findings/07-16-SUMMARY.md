---
phase: 07-address-all-phase-5-x-and-6-uat-findings
plan: 16
subsystem: regression-gate-diagnostic
tags:
  - advisor-budget
  - empirical-confirmation
  - diagnostic
  - phase-8-candidate
requires:
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay-0.12.2/session-1-plan.jsonl
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/extract-advisor-sd.mjs
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh
provides:
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.12.2/D-advisor-budget-against-session-1-plan.log
affects:
  - Plan 07-17 closure_amendment_2026_05_06_per_section_budgets block (Phase 8 candidate row)
tech_stack_added: []
tech_stack_patterns:
  - fixture-grade extraction via JSONL stream-json + tool_use_id binding (no claude -p re-run)
  - per-item parity-script copied verbatim from D-advisor-budget.sh lines 89-141
key_files_created:
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.12.2/D-advisor-budget-against-session-1-plan.log
key_files_modified: []
decisions:
  - n=1 fixture-grade FAIL records a Phase 8 candidate, not a Phase 7 structural change (per 07-VERIFICATION.md `closure_amendment_2026_05_05_severity_vocabulary_alignment` boundary precedent)
  - Plan 07-14 redesign was scoped to reviewer + security-reviewer; advisor redesign is out of scope here even though the same per-section budget pattern would likely apply
metrics:
  duration_minutes: 2
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  completed_at: 2026-05-06
---

# Phase 07 Plan 16: D-advisor-budget extraction against session-1-plan.jsonl Summary

Fixture-grade advisor Strategic Direction word-count extraction against the existing 2026-05-06 UAT trace (`uat-replay-0.12.2/session-1-plan.jsonl`) to disambiguate UAT-REGRESSION-0.12.2 Issue 4 (advisor SD ~143w visual estimate) from a true advisor regression vs. an executor plan-artifact repackaging artifact.

## What Was Built

A single diagnostic log file:
- **Path:** `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.12.2/D-advisor-budget-against-session-1-plan.log`
- **Sections:** raw extracted Strategic Direction (post-Critical-block strip), per-item word counts (D-advisor-budget.sh 3-band parity), aggregate verdict, disposition branch.

## Verdict

- **Aggregate (whole-body wc -w):** 155 words against 100w cap -> **FAIL**
- **Per-item aggregate (sum of fragment bodies):** 146 words; 3 of 9 items over per-item outlier cap (>18w non-frame).
- **Per-item ERROR items:** 3 (22w), 5 (28w), 7 (24w) -- all three carry inline configuration code (compodocArgs JSON array, addon-docs setCompodocJson initializer, signal-input/output declarations + JSDoc). Fragment-grammar template binding compresses prose advice but not inline code-block advice.

## Disposition

advisor budget regression EMPIRICALLY CONFIRMED on plugin 0.12.2 + Compodoc scenario at fixture grade. Plan 07-10 fragment-grammar template binding does NOT hold for this scenario shape. Plan 07-14 redesign was scoped to reviewer + security-reviewer; advisor redesign would be a Phase 8 follow-up. Plan 07-17 closure amendment will record this as a Phase 8 candidate (analogous to `project_phase_8_candidates_post_07.md` item 9 framing per `07-VERIFICATION.md closure_amendment_2026_05_05` boundary precedent).

n=1 caveat: this is a single trace from the 2026-05-06 UAT. Phase 8 should re-run n>=3 across heterogeneous scenarios (Compodoc, generic feature implementation, refactor) before declaring a structural advisor redesign needed.

## Plan 07-17 Hand-off

Plan 07-17 will incorporate this verdict into its `closure_amendment_2026_05_06_per_section_budgets` block as a Phase 8 candidate row referencing this log. The amendment text should:

1. State that UAT-REGRESSION-0.12.2 Issue 4 is empirically CONFIRMED at fixture grade (not disconfirmed as the visual estimate had hoped).
2. Quote the per-item evidence (items 3/5/7 with inline-code blocks; fragment-grammar binding does not compress code-block advice).
3. Note that the Phase 7 verdict remains `passed_with_residual` because Plan 07-14 was explicitly scoped to reviewer + security-reviewer per the user directive 2026-05-06 + per the 07-RESEARCH-GAP-3-per-section-budgets.md scope decision.
4. Flag the n=1 caveat: Phase 8 should re-run n>=3 before declaring a structural advisor redesign.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scratch script path translation**

- **Found during:** Step 5 (per-item count script invocation)
- **Issue:** The Plan's Step 5 instruction created the script at `${SCRATCH_BODY}.check.mjs` where `${SCRATCH_BODY}` resolves to a Git Bash `/tmp/...` path. The Write tool, on Windows, does not write to Git Bash's `/tmp` mount; it uses Windows path semantics directly, which dropped the file. Subsequent `node ${SCRATCH_BODY}.check.mjs` resolved a non-existent Windows path under `C:\Users\...\AppData\Local\Temp\` and failed with `MODULE_NOT_FOUND`.
- **Fix:** Wrote the parity script to a worktree-local scratch path `./.scratch-07-16-per-item-count.mjs` (absolute `D:\...` path resolved cleanly by both Write tool and Node.js); ran via `node ./.scratch-07-16-per-item-count.mjs <body-file>`. The script content is byte-identical to the Plan's Step 5 specification (verbatim copy of `D-advisor-budget.sh` lines 89-141), so T-07-16-02 "no parser drift" is preserved. Cleaned up the scratch script in Step 7.
- **Files modified:** none (scratch script was deleted; final log is unaffected)
- **Commit:** included in `3eec715` (single commit for the plan)

### Auth Gates

None.

### Architectural Changes

None.

## Self-Check

- [x] Log file exists at `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.12.2/D-advisor-budget-against-session-1-plan.log`
- [x] Log contains `advisor Strategic Direction aggregate: 155w (cap 100w)` line
- [x] Log contains exactly one `verdict: FAIL` line (no `verdict: PASS` line; one branch only)
- [x] Disposition branch matches verdict (FAIL branch present; PASS branch absent)
- [x] Raw extracted Strategic Direction body included for audit trail
- [x] Per-item breakdown uses 3-band `[OK]` / `[INFO]` / `[ERROR]` ASCII tags (no `[OVER]` tag)
- [x] Frame-status annotation present (none of the 9 items used the Assuming-frame; all reported as non-frame; that is itself accurate annotation)
- [x] `git status -s plugins/lz-advisor/agents/advisor.md` empty
- [x] `git status -s plugins/lz-advisor/agents/reviewer.md` empty
- [x] `git status -s plugins/lz-advisor/agents/security-reviewer.md` empty
- [x] `git status -s plugins/lz-advisor/.claude-plugin/plugin.json` empty
- [x] ASCII-only output (no emojis, em dashes, curly quotes)
- [x] Commit `3eec715` exists in branch history

## Self-Check: PASSED

## Commits

| Task   | Description                                       | Commit  |
| ------ | ------------------------------------------------- | ------- |
| Task 1 | D-advisor-budget extraction + log + FAIL verdict | 3eec715 |
