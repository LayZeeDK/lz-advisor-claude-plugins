---
phase: 07
plan: 08
subsystem: gap-closure
tags: [gap-closure, wip-discipline, smoke-fixture, verification, phase-7-sealing]
gap_closure: true
requirements:
  - GAP-G2-wip-scope
dependency_graph:
  requires:
    - 07-02-PLAN.md (cost-cliff allowance subsection -- the surface being tightened)
    - 07-06-PLAN.md (E-verify-before-commit.sh -- the fixture being extended)
    - 07-07-PLAN.md (plugin version 0.11.0; default-on ToolSearch reframing co-landed in same wave)
  provides:
    - "lz-advisor.execute/SKILL.md `<verify_before_commit>` Phase 3.5 Subject-prefix discipline subsection"
    - "lz-advisor.execute/SKILL.md `<verify_before_commit>` Phase 3.5 3-shape worked example pair"
    - "E-verify-before-commit.sh path-d negative assertion"
    - "E-verify-before-commit.sh synthesized in-process path-d scenario (Gap 2 structural closure proof)"
    - "E-verify-before-commit.sh --replay <sha> manual-auditor flag with structural error-path"
    - "REQUIREMENTS.md GAP-G2-wip-scope traceability"
    - "07-VERIFICATION.md Gap 2 CLOSED amendment"
    - "06-VERIFICATION.md Amendment 8 sealing residual #2 + Phase 7 sealing verdict"
  affects:
    - "Phase 7 sealing readiness (PASS-with-residual)"
tech-stack:
  added: []
  patterns:
    - "positive-default + narrow-enumerated-exception + explicit-motivation contract structure (Anthropic Claude 4 best practices)"
    - "3-shape worked example pair (CORRECT + INCORRECT + carve-out) anchoring rejection to a concrete pattern"
    - "synthesized in-process scenario as structural closure proof (bypasses cross-repo SHA dependency)"
    - "manual-auditor --replay flag with documented error-path (exit 65 on cross-repo SHAs)"
    - "differentiated exit codes (0 pass / 1 broken-assertion / 2 violation) for regression dashboards"
key-files:
  created:
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-08-REPLAY-RESULTS.md
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-08-SUMMARY.md
  modified:
    - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh
    - .planning/REQUIREMENTS.md
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md
    - .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md
decisions:
  - "Gap 2 closes structurally via three coordinated surfaces (contract tightening + worked example pair + path-d detection with synthesized scenario), not via empirical replay against cross-repo testbed SHAs"
  - "Synthesized in-process path-d scenario provides the load-bearing closure proof: a non-wip commit + Outstanding Verification + non-zero file changes is created in the scratch repo so path-d fires structurally within this plugin repo's smoke run"
  - "--replay flag is a manual-auditor convenience tool, not a phase-closure gate: empirical UAT replay against ngx-smart-components testbed is documented but out of scope"
  - "Three differentiated exit codes (0 pass / 1 broken-assertion or no-path / 2 path-d violation) enable per-release regression dashboards to categorize gap-2 violations separately"
  - "Plan 07-08 does NOT bump plugin version: Plan 07-07's 0.10.0 -> 0.11.0 minor bump already covered the cross-cutting contract change for the gap-closure pair"
  - "Trailer-only follow-up carve-out anchored in `git diff --stat HEAD~1..HEAD` semantics (zero file changes) -- deterministic, agent-readable criterion"
metrics:
  tasks: 5
  files_created: 2
  files_modified: 5
  commits: 5
  completed_date: "2026-05-01"
---

# Phase 7 Plan 08: Close Gap 2 (wip-discipline scope ambiguity) Summary

Closes Phase 7 within-phase Gap 2 -- the Plan 07-02 wip-discipline scope ambiguity that surfaced empirically in 2 of 8 UAT sessions on plugin 0.10.0 (sessions 2 + 5 in the external ngx-smart-components testbed) -- via three coordinated surfaces landing together: (1) tightened `<verify_before_commit>` Phase 3.5 contract language with positive-default subject-prefix discipline + trailer-only carve-out anchored in `git diff --stat` semantics; (2) 3-shape worked example pair (CORRECT wip + INCORRECT per-commit reading + CORRECT carve-out trailer-only follow-up); (3) E-verify-before-commit.sh path-d negative assertion + synthesized in-process scenario for structural closure proof + `--replay <sha>` manual-auditor flag. Co-lands with Plan 07-07 (Gap 1 closure) in wave 5 to seal Phase 7 as PASS-with-residual.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Tighten `<verify_before_commit>` Phase 3.5 Subject-prefix discipline + 3-shape worked examples | `0d61b9f` | plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md |
| 2 | Extend E-verify-before-commit.sh with path-d + synthesized scenario + --replay flag | `7c2126c` | .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh |
| 3 | Capture structural validation results in 07-08-REPLAY-RESULTS.md | `515a707` | .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-08-REPLAY-RESULTS.md |
| 4 | Register GAP-G2-wip-scope in REQUIREMENTS.md with Phase 7 traceability | `328d028` | .planning/REQUIREMENTS.md |
| 5 | Amend 07-VERIFICATION.md (Gap 2 CLOSED) + 06-VERIFICATION.md (Amendment 8 sealing residual #2) | `49c51a8` | .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md, .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md |

## Outcome

**Gap 2 (Plan 07-02 wip-discipline scope ambiguity): CLOSED structurally** at three layers:

1. **Contract surface (lz-advisor.execute/SKILL.md)** -- `<verify_before_commit>` Phase 3.5 cost-cliff allowance subsection extends with NEW `### Subject-prefix discipline when Outstanding Verification is populated` subsection. The rule states the positive default ("when a commit body contains `## Outstanding Verification`, subject MUST use `wip:` prefix") + the trailer-only carve-out ("UNLESS the commit ONLY records additional `Verified:` trailers with ZERO file changes per `git diff --stat HEAD~1..HEAD`") + the BRANCH-STATE preservation motivation. The shared regex `^wip(\(.+\))?:|^chore\(wip\):` is documented in both the SKILL.md text and the smoke-fixture path-d assertion, so a divergence between contract and detection layers cannot occur silently.

2. **Worked example surface (lz-advisor.execute/SKILL.md)** -- `<verify_before_commit>` Phase 3.5 extends with NEW `### Worked example: wip subject + Outstanding Verification` subsection containing 3 commit shapes: Shape 1 CORRECT (parent wip commit with Outstanding Verification + Verified trailers), Shape 2 INCORRECT (the per-commit reading: follow-up `fix:` commit while parent's Outstanding Verification is still pending), Shape 3 CORRECT carve-out (trailer-only follow-up: zero file changes, drops `wip:` prefix per the carve-out rule). Shape 2 explicitly names the failure mode the executor is likely to exhibit, anchoring rejection to a concrete pattern.

3. **Detection surface (E-verify-before-commit.sh)** -- extends the existing 3-path positive-assertion suite (paths a/b/c) with a NEW path-d negative assertion. Path-d fires when subject does not match the wip-prefix regex AND body contains `## Outstanding Verification` AND `git diff --stat HEAD~1..HEAD` shows non-zero file changes (i.e., violation outside the trailer-only carve-out). The fixture also adds a SYNTHESIZED in-process scenario that creates a non-wip commit + Outstanding Verification + non-zero file changes inside the scratch repo, so path-d fires structurally within the smoke run -- this is the load-bearing closure proof, bypassing the cross-repo SHA constraint entirely. The `--replay <sha>` flag provides manual-auditor regression validation against historical commits (exits 65 with clear error when SHA is not in current repo). Three exit codes differentiated: 0 pass, 1 broken-assertion or no-path, 2 path-d violation (synthesized expected firing OR executor's own commit).

## Structural Validation Evidence

Per 07-08-REPLAY-RESULTS.md (Task 3 deliverable):

| Step | Expected exit | Observed exit | Verdict |
|------|---------------|---------------|---------|
| 1: synthesized in-process scenario | 2 | 2 | PASS |
| 2: --replay 8c25c9e (testbed SHA) | 65 | 65 | PASS |
| 3: --replay 06af4cf (testbed SHA) | 65 | 65 | PASS |
| 4: --replay 15d8fac (testbed SHA) | 65 | 65 | PASS |

**Overall verdict: PASS** (4/4 structural-validation steps satisfied). The synthesized in-process path-d scenario fires exit 2 within the smoke run, structurally validating the gap-2 assertion's correctness without cross-repo SHA dependency. The --replay flag's error-path emits clear "cannot read commit" messages with exit 65 for all three testbed-only SHAs, structurally validating the flag is wired correctly.

Empirical replay against the live ngx-smart-components testbed (where session 2 / 5 / 8 commits live) is a manual-auditor operation, NOT a phase-closure gate.

## Phase 7 Sealing Status

With Plan 07-07 (Gap 1 CLOSED structurally) + Plan 07-08 (Gap 2 CLOSED structurally) co-landed in wave 5, Phase 7 is now READY TO SEAL as **PASS-with-residual**:

- Plans 07-01..07-05: structural Phase 7 deliverables.
- Plan 07-06: plugin 0.10.0 + UAT replay infrastructure + 8-session UAT chain + Amendment 6.
- Plan 07-07: Gap 1 CLOSED structurally (default-on ToolSearch + worked examples + plugin 0.11.0).
- Plan 07-08: Gap 2 CLOSED structurally (subject-prefix discipline + 3-shape worked example + path-d assertion + synthesized in-process scenario + --replay flag).

Out-of-phase residuals (3, 4, 5) and 22 Phase 8 candidates hand off to a hypothetical Phase 8 per `06-VERIFICATION.md` Amendment 6.

## Deviations from Plan

None - plan executed exactly as written.

The plan was self-contained with all replacement text specified verbatim. Each task's automated verification + acceptance criteria passed on first attempt. The structural-validation steps (Task 3) all passed expected outcomes (exit 2 synthesized + exit 65 replay against 3 testbed SHAs), so the conditional STOP-and-report fallback in the plan was not triggered.

## Plugin Version

Plan 07-08 does NOT bump plugin version. Plan 07-07's 0.10.0 -> 0.11.0 minor bump in wave 5 already covered the cross-cutting contract change for the Plan 07-07 + 07-08 gap-closure pair (per CLAUDE.md plugin versioning convention: one bump per wave for related contract changes).

| Surface | Pre-wave-5 | Post-wave-5 |
|---------|------------|-------------|
| `plugins/lz-advisor/.claude-plugin/plugin.json` | 0.10.0 | 0.11.0 (Plan 07-07) |
| 4 SKILL.md frontmatter | 0.10.0 | 0.11.0 (Plan 07-07) |

## Self-Check: PASSED

Verified all created files exist:
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-08-REPLAY-RESULTS.md` FOUND
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-08-SUMMARY.md` FOUND (this file)

Verified all commit hashes exist in git log:
- `0d61b9f` FOUND (Task 1)
- `7c2126c` FOUND (Task 2)
- `515a707` FOUND (Task 3)
- `328d028` FOUND (Task 4)
- `49c51a8` FOUND (Task 5)

All key files modified contain the required content per acceptance criteria (verified inline during each task).

## Sources

- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-08-PLAN.md` -- the plan executed
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-RESEARCH-GAP-2-wip-discipline.md` -- Candidates 1 + 2 + 3 design rationale
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` -- Gap 2 declaration + Gap 2 CLOSED amendment (this plan)
- `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` -- Amendment 8 sealing residual #2 + Phase 7 sealing verdict
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-08-REPLAY-RESULTS.md` -- structural-validation outcomes
