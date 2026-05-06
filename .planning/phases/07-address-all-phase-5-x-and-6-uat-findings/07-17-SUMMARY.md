---
phase: 07
plan: 17
subsystem: plugin-version-bump + empirical-gate + closure-amendment
tags: [version-bump, empirical-gate, closure-amendment, gap-closure-3, failed-gap-closure-3]
requires:
  - 07-14 (per-section <output_constraints> XML contract on agents/{reviewer,security-reviewer}.md; landed in commits 76ac386 + bb455e0 + 20325c8)
  - 07-15 (smoke-fixture rebind to per-section budgets; aggregate-cap removal; PFV parser; landed in commits 7f332f0 + d6a5997 + 53132e3)
  - 07-16 (advisor diagnostic against session-1-plan.jsonl; FAIL n=1 at fixture grade; landed in commit be27bc8 + 3fa003c)
  - User directive 2026-05-06 (per-section budgets; replace aggregate w-cap)
  - 07-RESEARCH-GAP-3-per-section-budgets.md (Q4 SemVer recommendation: 0.12.2 -> 0.13.0 MINOR)
  - 07-UAT-REGRESSION-0.12.2.md (n=4 D-security-reviewer-budget mean 354.25w; empirical falsification baseline of aggregate-cap pattern)
provides:
  - Plugin 0.13.0 atomic 5-surface stamp (plugin.json + 4 SKILL.md frontmatter version: fields)
  - regression-gate-0.13.0/D-reviewer-budget-3x.log (empirical 3x re-run evidence; verdict FAIL_2_of_3)
  - regression-gate-0.13.0/D-security-reviewer-budget-3x.log (empirical 3x re-run evidence; verdict FAIL_1_of_3)
  - 07-VERIFICATION.md `## closure_amendment_2026_05_06_per_section_budgets` body H2 amendment block
  - Phase 7 status reconfirmed: failed_gap_closure_3 (not passed_with_residual; gap closure 3 did NOT empirically close FIND-D + GAP-D-budget-empirical at the 3x re-run gate)
  - Three Phase 8 candidates documented: residual-wip-discipline-reversal (unchanged from final_closure_2026_05_05), residual-per-section-budget-not-empirically-closed (NEW), residual-advisor-fragment-grammar-not-binding-on-code-blocks (NEW from Plan 07-16)
affects:
  - Phase 7 closure verdict reconfirmed as FAILED at gap closure 3 empirical gate; sealing UNREADY
  - Phase 8 worklist gains 2 NEW residuals + recommended next steps (counterfactual rollback, per-section cap recalibration, XML <output_constraints> binding re-evaluation, advisor n>=3 confirmation)
  - Top-level frontmatter status / plugin_version / plugin_version_milestone_trail fields updated to reflect 0.13.0 milestone + FAIL verdict
tech-stack:
  added: []
  patterns:
    - "5-surface atomic version bump pattern (plugin.json + 4 SKILL.md frontmatter version: fields edited together; precedent: Plan 07-11 commit bf8a8db for 0.12.0 -> 0.12.1; Plan 07-13 for 0.12.1 -> 0.12.2)"
    - "Empirical 3x re-run gate as load-bearing closure-criterion (n=3 per-fixture sequential live `claude -p` invocations; per-run exit code captured via `;` separator after redirect; aggregated log with verdict line + per-section breakdowns; convention from Plan 07-12 disconfirmation protocol)"
    - "Closure amendment block as body-markdown H2 heading (placement convention: after the most recent prior amendment's verifier signature line; established by 2026-05-05 / 2026-05-06 amendments at lines 564, 631, 778, 855)"
    - "Empirical-gate-fails-honestly contract (per the plan's empirical_gate_note: do NOT silently re-run or alter the parser to make it pass; record FAIL evidence + Phase 7 status changes to failed_gap_closure_3 + new Phase 8 residuals are documented; the gate is symmetric on PASS / FAIL paths)"
key-files:
  created:
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.13.0/D-reviewer-budget-3x.log
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.13.0/D-security-reviewer-budget-3x.log
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-17-SUMMARY.md
  modified:
    - plugins/lz-advisor/.claude-plugin/plugin.json (Task 1; version 0.12.2 -> 0.13.0)
    - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md (Task 1; frontmatter version 0.12.2 -> 0.13.0)
    - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md (Task 1; frontmatter version 0.12.2 -> 0.13.0)
    - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md (Task 1; frontmatter version 0.12.2 -> 0.13.0)
    - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md (Task 1; frontmatter version 0.12.2 -> 0.13.0)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md (Task 3; status / plugin_version / milestone trail updated; closure_amendment_2026_05_06_per_section_budgets H2 block appended)
decisions:
  - "Honor the empirical FAIL verdict rather than re-running. Per the plan's empirical_gate_note, the gate is load-bearing for closure: if any of the 6 runs FAILS, the closure amendment records the FAIL evidence and Phase 7 status changes to failed_gap_closure_3. We observed 3 of 6 runs FAIL (D-reviewer 1/3 fail; D-security-reviewer 2/3 fail), each with a distinct failure mode (CCP overflow on one, shape regression + outlier breach on another). Recording honestly preserves audit trail integrity and surfaces the per-section contract's empirical inadequacy at 3x sampling. No silent re-runs, no parser tweaks to mask failures."
  - "5-surface atomic stamp committed as a single feat(07-17) commit per the precedent from Plans 07-11 (0.12.0 -> 0.12.1) and 07-13 (0.12.1 -> 0.12.2). All 5 files staged explicitly (no git add . / -A) per CLAUDE.md. Zero remnants of any earlier version (0.12.2, 0.12.1, 0.12.0, 0.11.0) in version surfaces post-bump."
  - "MINOR semver bump 0.12.2 -> 0.13.0 (not PATCH) per 07-RESEARCH-GAP-3 Q4 + project 0.x convention. Contract-shape change at smoke-fixture API layer (aggregate-cap assertion REMOVED; per-finding-validation parser ADDED). Skill invocation surface (`/lz-advisor.{plan,execute,review,security-review}`) UNCHANGED for users. Coordination with Phase 8 wip-discipline reversal preserved: Phase 8 may share 0.13.0 if its independent timeline aligns; if not, Phase 8 bumps separately to 0.13.1+ at its own discretion."
  - "Sequential per-run execution (not parallel) per the plan's `<action>` Note. Established 07-12 protocol; sequential makes per-run debugging easier when reading the logs. Each run takes ~3min wall time; total 6 runs ~18min wall time. Per-run cost ~$0.10-0.15; total ~$0.60-0.90 cost on the gap-closure budget."
  - "Closure amendment block placement as body-markdown H2 heading (no trailing colon) appended to end of file. Preserves established 2026-05-05 / 2026-05-06 amendment convention used by ## closure_amendment_2026_05_05_severity_vocabulary_alignment, ## final_closure_2026_05_05_post_07_12_07_13, ## empirical_subverification_2026_05_06, ## addendum_2026_05_06_user_directive_per_section_budgets. All prior amendment blocks preserved byte-identically."
  - "Phase 7 status field changed from passed_with_residual to failed_gap_closure_3 per must_haves contract. Inline annotation appended to score: field documenting the FAIL_2_of_3 + FAIL_1_of_3 verdicts. Phase 7 sealing UNREADY post-amendment; Phase 8 inherits 3 residuals (1 unchanged + 2 NEW) and recommended next steps (counterfactual rollback, per-section cap recalibration, XML binding re-evaluation, advisor n>=3 confirmation)."
metrics:
  duration: ~28min
  completed: 2026-05-06
  tasks: 3
  files_modified: 6
  files_created: 3
---

# Phase 07 Plan 17: Plugin 0.13.0 Bump + Empirical Gate + Closure Amendment Summary

Bumps plugin SemVer 0.12.2 -> 0.13.0 MINOR atomically across 5 surfaces (per 07-RESEARCH-GAP-3 Q4). Runs `D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` 3 times each on plugin 0.13.0 to empirically test whether the Plan 07-14 + 07-15 per-section `<output_constraints>` contract redesign closes the n=5 over-cap regression observed on 0.12.2. Appends `closure_amendment_2026_05_06_per_section_budgets` to 07-VERIFICATION.md documenting the bump + empirical verdicts + Plan 07-16 advisor diagnostic + Phase 7 status reconfirmation.

**Empirical verdict: FAIL.** Both fixtures showed 3x re-run failures on plugin 0.13.0 (D-reviewer FAIL_2_of_3; D-security-reviewer FAIL_1_of_3) with three distinct failure modes (CCP overflow 162w; fragment-grammar shape regression to paragraph-bullet variant; per-finding entry outlier 34w). Phase 7 status reconfirmed as `failed_gap_closure_3`; sealing UNREADY. Phase 8 inherits 3 residuals with recommended next steps documented in the closure amendment.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Bump plugin version 0.12.2 -> 0.13.0 atomically across 5 surfaces | 6fd916d | plugins/lz-advisor/.claude-plugin/plugin.json + 4 SKILL.md |
| 2 + 3 | Run D-reviewer-budget.sh + D-security-reviewer-budget.sh 3x each on plugin 0.13.0; capture logs to regression-gate-0.13.0/; append closure_amendment_2026_05_06_per_section_budgets to 07-VERIFICATION.md + update top-level fields | 429fcfe | 07-VERIFICATION.md + 2 logs |

## What Shipped

### Task 1: 5-surface atomic version bump (commit 6fd916d)

5 surgical edits, single commit, 5 files changed (5 insertions / 5 deletions):

- `plugins/lz-advisor/.claude-plugin/plugin.json` line 3: `"version": "0.12.2",` -> `"version": "0.13.0",`
- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` line 18: `version: 0.12.2` -> `version: 0.13.0`
- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` line 19: `version: 0.12.2` -> `version: 0.13.0`
- `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` line 19: `version: 0.12.2` -> `version: 0.13.0`
- `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` line 19: `version: 0.12.2` -> `version: 0.13.0`

Zero remnants of any earlier version (0.12.2, 0.12.1, 0.12.0, 0.11.0) in the 5 version surfaces post-bump (verified via `git grep -F`).

### Task 2: Six smoke runs on plugin 0.13.0

Sequential live `claude -p` invocations against scratch repos. Per-run wall time ~3min; total ~18min (6 runs). Per-run cost ~$0.10-0.15; total ~$0.60-0.90.

**D-reviewer-budget.sh 3x** -> `regression-gate-0.13.0/D-reviewer-budget-3x.log`:

| Run | Findings entries (words) | Per-finding validation | CCP | Missed surfaces | Verdict |
|-----|--------------------------|------------------------|-----|-----------------|---------|
| 1 | 5 entries (14, 14, 25, 14, 20w; one 25w within outlier) | 5 entries (33-53w, all <=60w) | 88w | 28w | PASS |
| 2 | 3 entries (16, 14, 11w, all under 22w target) | absent | **162w (>160 cap)** | absent | **FAIL** |
| 3 | 6 entries (15, 17, 21, 13, 18, 14w, all under 22w target) | 4 entries (29-60w, all <=60w) | 76w | 30w | PASS |

**Aggregate verdict: FAIL_2_of_3** (run 2 CCP overflow = 2w over 160w cap)

**D-security-reviewer-budget.sh 3x** -> `regression-gate-0.13.0/D-security-reviewer-budget-3x.log`:

| Run | Findings entries (words) | Per-finding validation | Threat Patterns | Missed surfaces | Verdict |
|-----|--------------------------|------------------------|-----------------|-----------------|---------|
| 1 | 5 entries (21, 18, 20, 22, 21w, all <=22 target) | 2 entries (43-46w) | 83w | 30w | PASS |
| 2 | parser fallback failed (paragraph-bullet shape; neither fragment-grammar nor Plan 07-04 numbered shape matched) | 4 entries (22-41w) | 91w | 29w | **FAIL** (no findings detected) |
| 3 | 5 entries (22, 21, 21, **34**, 23w; entry 4 BREACHED 28w outlier soft cap by 6w) | absent | 85w | absent | **FAIL** |

**Aggregate verdict: FAIL_1_of_3** (run 2 shape regression; run 3 outlier breach)

**Combined gate verdict: FAIL.** 3 of 6 runs failed across the two fixtures with three distinct failure modes:

1. **CCP overflow (D-reviewer run 2):** 162w over 160w cap = 2w breach. Distribution-tail leak.
2. **Shape regression (D-security-reviewer run 2):** Output emitted as paragraph-separated bullet-prefix entries; fragment-grammar parser AND legacy numbered-section parser both failed to match. XML `<output_constraints>` binding is not deterministic across the security-reviewer's output distribution.
3. **Per-entry outlier (D-security-reviewer run 3):** Finding line 4 at 34w over 28w outlier soft cap = 6w breach.

### Task 3: Closure amendment block in 07-VERIFICATION.md (commit 429fcfe)

Three frontmatter edits + one body-markdown H2 block append:

**Frontmatter edits:**

- Line 5 (`status:`): `passed_with_residual` -> `failed_gap_closure_3`
- Line 6 (`score:`): inline annotation appended documenting the FAIL_2_of_3 + FAIL_1_of_3 verdicts
- Line 7 (`plugin_version:`): `0.12.2` -> `0.13.0`
- Lines 8-15 (`plugin_version_milestone_trail:`): new entry appended `- 0.13.0 -- Plans 07-14 + 07-15 + 07-17 (per-section <output_constraints> contract redesign + smoke-fixture parser update + 3x re-run empirical gate + Plan 07-16 advisor diagnostic)`

**Body markdown append (after line 889 verifier signature; new H2 starts at line 894):**

`## closure_amendment_2026_05_06_per_section_budgets` block with all required fields:

- context (the 2026-05-05 sealing -> 2026-05-06 regression-gate UAT n=4 mean 354.25w + S3 UAT 520w -> Plans 07-14/07-15/07-16/07-17 redesign + empirical confirmation)
- user_directive
- research_anchor
- plan_07_14_disposition: closed_structurally
- plan_07_14_artifacts (reviewer.md + security-reviewer.md per-section XML blocks)
- plan_07_15_disposition: closed_structurally
- plan_07_15_artifacts (D-reviewer-budget.sh + D-security-reviewer-budget.sh)
- plan_07_16_disposition: FAIL_at_fixture_grade with quoted advisor diagnostic verdict text (155w aggregate vs 100w cap; 3 of 9 items over per-item outlier; items 3/5/7 carry inline configuration code)
- plan_07_16_advisor_diagnostic (verdict + per-item evidence + n=1 caveat)
- plugin_version_bump: 0.12.2 -> 0.13.0 MINOR (5 surfaces atomically)
- plugin_version_surfaces (5 paths)
- semver_rationale (MINOR per 07-RESEARCH-GAP-3 Q4 + project 0.x convention)
- empirical_gate.d_reviewer_budget_3x (verdict + log + per_run_summary)
- empirical_gate.d_security_reviewer_budget_3x (verdict + log + per_run_summary)
- phase_7_status_reconfirmed: failed_gap_closure_3
- phase_7_residual_remaining (3 residuals: existing wip-discipline-reversal + 2 NEW)
- cross_pollination_disposition (per Q2c: counterfactual rollback experiment RECOMMENDED for Phase 8)
- closure_commits (7 hashes: 76ac386, bb455e0, 7f332f0, d6a5997, be27bc8, 6fd916d, 429fcfe)
- sealing_readiness_post_gap_closure_3 (UNREADY; 3 distinct failure modes documented; 4 recommended Phase 8 next steps a/b/c/d)
- phase_7_residual_remaining_summary (table form)

All prior amendment blocks preserved byte-identically (frontmatter blocks: empirical_subverification_2026_05_03, closure_amendment_2026_05_04, final_status_after_07_10_07_11_2026_05_04, empirical_subverification_2026_05_05, final_status_after_empirical_2026_05_05, final_closure_2026_05_05_post_07_12_07_13; body H2 blocks: closure_amendment_2026_05_05_severity_vocabulary_alignment, final_closure_2026_05_05_post_07_12_07_13, empirical_subverification_2026_05_06, addendum_2026_05_06_user_directive_per_section_budgets).

## Acceptance Criteria Pass Evidence

### Task 1 -- Plugin 0.13.0 atomic 5-surface stamp

| Criterion | Command | Result |
|-----------|---------|--------|
| plugin.json at 0.13.0 | `git grep -nF '"version": "0.13.0"' plugins/lz-advisor/.claude-plugin/plugin.json` | 1 match (line 3) |
| 4 SKILL.md at 0.13.0 | `git grep -nE "^version: 0\.13\.0$" plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` | 4 matches (1 per file at line 18 or 19) |
| Zero 0.12.2 remnants | `git grep -F "0.12.2" plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/` | exit 1 (0 matches) |
| Zero 0.12.1 / 0.12.0 / 0.11.0 remnants | same shape | exit 1 each (0 matches) |
| 5-file commit | `git show --stat 6fd916d` | exactly 5 files changed |

### Task 2 -- Empirical 3x re-run gate

| Criterion | Command | Result |
|-----------|---------|--------|
| Directory exists | `test -d .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.13.0` | true |
| Reviewer log exists | `test -f .../regression-gate-0.13.0/D-reviewer-budget-3x.log` | true |
| Security-reviewer log exists | `test -f .../regression-gate-0.13.0/D-security-reviewer-budget-3x.log` | true |
| 3 run markers in reviewer log | `rg -c "=== Run " .../D-reviewer-budget-3x.log` | 3 |
| 3 run markers in security-reviewer log | `rg -c "=== Run " .../D-security-reviewer-budget-3x.log` | 3 |
| Verdict line in reviewer log | `rg -n "verdict: FAIL_2_of_3" .../D-reviewer-budget-3x.log` | line 107 |
| Verdict line in security-reviewer log | `rg -n "verdict: FAIL_1_of_3" .../D-security-reviewer-budget-3x.log` | line 156 |
| Header comment with plan + version + date + contract | inspection | both logs include header lines 1-6 |
| Full per-run stdout/stderr | inspection | both logs include `--- Run N output (full) ---` blocks with the fixture's complete output |
| Summary section | inspection | both logs include Pass count + Fail count + canonical verdict |
| ASCII-only | inspection | no emojis / em dashes / curly quotes / box-drawing |

### Task 3 -- Closure amendment block

| Criterion | Command | Result |
|-----------|---------|--------|
| H2 heading present | `git grep -nF "## closure_amendment_2026_05_06_per_section_budgets" .../07-VERIFICATION.md` | 1 match (line 894) |
| plugin_version updated | `git grep -nE "^plugin_version: 0\.13\.0$" .../07-VERIFICATION.md` | 1 match (line 7) |
| Milestone trail entry | `git grep -nF "0.13.0 -- Plans 07-14 + 07-15 + 07-17" .../07-VERIFICATION.md` | 1 match (line 15) |
| Status updated | `git grep -nE "^status: (passed_with_residual\|failed_gap_closure_3)$" .../07-VERIFICATION.md` | 1 match (line 5: `failed_gap_closure_3`) |
| Prior frontmatter blocks preserved (each appears with trailing colon) | `git grep -cF` for 5 keys | 1 each |
| Prior body H2 blocks preserved (each appears once) | `git grep -cF` for 4 H2 headings | 1 each |
| Dual-surface entries (token in both surfaces) | `git grep -cF "final_closure_2026_05_05_post_07_12_07_13"` | 2 |
| 3 files staged in closure commit | `git show --stat 429fcfe` | 3 files (07-VERIFICATION.md + 2 logs) |
| All 18 required amendment fields present | inspection of body H2 block lines 894-1062 | all present (context, user_directive, research_anchor, plan_07_14_disposition + artifacts, plan_07_15_disposition + artifacts, plan_07_16_disposition + advisor_diagnostic, plugin_version_bump, plugin_version_surfaces, semver_rationale, empirical_gate.d_reviewer_budget_3x, empirical_gate.d_security_reviewer_budget_3x, phase_7_status_reconfirmed, phase_7_residual_remaining, cross_pollination_disposition, closure_commits, sealing_readiness_post_gap_closure_3, phase_7_residual_remaining_summary) |

## Empirical Gate Disposition

The empirical 3x re-run gate **FAILED** on plugin 0.13.0:

- D-reviewer-budget: 2/3 PASS (1 CCP overflow at run 2)
- D-security-reviewer-budget: 1/3 PASS (1 shape regression at run 2; 1 outlier breach at run 3)

This means **gap closure 3 did NOT empirically close FIND-D + GAP-D-budget-empirical** at the 3x sampling threshold on the new contract. The Plan 07-14 XML `<output_constraints>` redesign closes the regression *structurally* (per Plan 07-14's own structural verification) but does NOT bind the prompt deterministically enough to achieve 3/3 PASS on either fixture.

**Three distinct failure modes** were observed, each suggesting a different layer of the prompt-binding contract is leaking:

1. **CCP overflow (run 2):** Per-section cap is correct in spirit but the Cross-Cutting Patterns section's natural distribution has tail probability mass over 160w. Recalibration to 180w (covers 95th-percentile) would close this without changing the contract shape.

2. **Shape regression (run 2):** The fragment-grammar fragment shape is one of multiple emission shapes the security-reviewer reaches for; the XML `<output_constraints>` block does NOT enforce it deterministically across runs. This is a **prompt-binding architecture failure**, not a recalibration target.

3. **Per-entry outlier (run 3):** Finding line 4 at 34w breached the 28w outlier soft cap by 6w. The "soft cap" framing in the XML may be insufficient signal vs hard `max_words` attribute. Recalibration to 32w + framing as hard cap would close this.

**Per the plan's empirical_gate_note:** "if the n=3 runs FAIL (any single run exits non-zero), the per-section contract redesign has not closed the regression and the closure_amendment must record the FAIL evidence -- do NOT silently re-run or alter the parser to make it pass. Empirical evidence is load-bearing here." This summary records the FAIL evidence honestly with no silent re-runs and no parser tweaks.

## Phase 8 Inheritance

The closure amendment documents 3 residuals for Phase 8:

| Residual | Origin | Phase | Disposition |
|---|---|---|---|
| residual-wip-discipline-reversal | user directive 2026-05-03 / memory feedback_no_wip_commits.md | 8 | unchanged from final_closure_2026_05_05 |
| residual-per-section-budget-not-empirically-closed | this Plan 07-17 3x gate FAIL_2_of_3 + FAIL_1_of_3 | 8 | NEW; Phase 8 a/b/c steps below |
| residual-advisor-fragment-grammar-not-binding-on-code-blocks | Plan 07-16 fixture-grade FAIL n=1 | 8 | NEW; Phase 8 step d below |

Recommended Phase 8 next steps (from sealing_readiness_post_gap_closure_3 field):

a. **Counterfactual rollback experiment (Q2c):** Roll back the per-section XML contract while keeping the smoke-fixture parser update; re-run 3x on plugin 0.13.0-rollback. If reviewer 3/3 PASS, the per-section contract is the regression source. If still 2/3 PASS, the regression is in the smoke-fixture parser and the per-section caps need recalibration.

b. **Per-section cap recalibration:** Raise CCP cap 160w -> 180w (covers 95th-percentile reviewer emission); raise outlier soft cap 28w -> 32w (covers run-3 security-reviewer entry distribution). Re-run 3x; if still failures, the prompt binding is not tight enough and architecture-grade redesign is required.

c. **Re-evaluate XML `<output_constraints>` binding:** Plan 07-14 assumed XML wrapping binds 15-20% better than prose on Claude. Empirical evidence on plugin 0.13.0 shows distinct per-section failures that look like prompt-binding leaks rather than aggregate volatility. Consider hybrid contract (XML schema + repeated prose admonition + few-shot examples per section).

d. **Bundle Plan 07-16 advisor verdict (FAIL n=1):** Phase 8 should also redesign advisor.md per-section budgets per Plan 07-16's diagnostic verdict. Advisor n=1 -> n>=3 across heterogeneous scenarios first to size the per-section caps.

## Closure Commits

5 commits across Plans 07-14 through 07-17 (per the plan's `closure_commits:` field):

| Commit | Plan | Description |
|--------|------|-------------|
| 76ac386 | 07-14 | replace aggregate-cap prose with XML `<output_constraints>` block in agents/reviewer.md |
| bb455e0 | 07-14 | replace aggregate-cap prose with XML `<output_constraints>` block in agents/security-reviewer.md |
| 7f332f0 | 07-15 | update D-reviewer-budget.sh per-section parser + remove aggregate assertion |
| d6a5997 | 07-15 | update D-security-reviewer-budget.sh per-section parser + remove aggregate assertion |
| be27bc8 | 07-16 | record advisor diagnostic against session-1-plan.jsonl on 0.12.2 |
| 6fd916d | 07-17 | bump plugin SemVer 0.12.2 -> 0.13.0 MINOR (5 surfaces atomically) |
| 429fcfe | 07-17 | add closure_amendment_2026_05_06_per_section_budgets block + 3x re-run logs |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree branch base reset**

- **Found during:** Pre-flight worktree_branch_check
- **Issue:** Worktree branch base was at `4b7ab92` (main commit) instead of expected `53132e3` (Plan 07-15 SUMMARY commit, which depends on Plans 07-14 + 07-16). This is the documented Windows EnterWorktree bug. Without the reset, the executor would have launched from a base lacking the 07-14, 07-15, 07-16 prerequisites.
- **Fix:** `git reset --hard 53132e3c63077ed35ae723d2514df1091729094b` per the plan's `<worktree_branch_check>` instruction. Verified all prerequisite commits in HEAD lineage via `git log --oneline 53132e3 -10` (Plan 07-15 commits at top, then 07-16, then 07-14, then b06ea10 baseline).
- **Files modified:** none (just worktree HEAD pointer)
- **Commit:** none (pre-flight infrastructure step)

### Auth Gates

None.

### Architectural Changes

None. The empirical FAIL verdict is recorded honestly per the plan's empirical_gate_note; no scope expansion, no parser tweaks, no silent re-runs. Phase 8 inherits the recommended next steps as documented residuals.

## Threat Model

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-17-01 (Tampering: verdict transcription error from log to amendment block) | mitigate | Closed -- amendment block's empirical_gate fields verbatim match the verdict lines and per-run summaries from the actual log files. Cross-checked at commit prep before the closure-amendment commit. |
| T-07-17-02 (Repudiation: silent downgrade to passed_with_residual on actual FAIL) | mitigate | Closed -- 3 of 6 runs FAILED; status field changed from passed_with_residual to failed_gap_closure_3 per must_haves contract. Score field inline annotation documents the FAIL_2_of_3 + FAIL_1_of_3 verdicts. No silent masking. |
| T-07-17-03 (Information Disclosure: n=3 sample is not a tight statistical bound) | accept | Acknowledged -- closure amendment notes the borderline failure modes (run 2 CCP 162w = 2w over cap; run 3 entry 4 34w = 6w over cap). Phase 8 step b proposes per-section cap recalibration; Phase 8 step a proposes the counterfactual rollback experiment that would tighten the bound by isolating the regression source. |
| T-07-17-04 (DoS: live `claude -p` 6 runs cost ~$0.60-0.90 + 12-18min wall time) | accept | Confirmed -- 6 sequential runs completed at ~3min wall time each (~18min total). Cost approved per Phase 7 gap-closure budget. The gate is empirically load-bearing; cheaper alternatives (n=1 sampling, smaller scratch repos) would have weaker confidence in the FAIL verdict. |

## Self-Check: PASSED

- File `plugins/lz-advisor/.claude-plugin/plugin.json` at version 0.13.0 (verified via Read at line 3)
- 4 SKILL.md files at version 0.13.0 in frontmatter (verified via git grep)
- File `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.13.0/D-reviewer-budget-3x.log` exists (3 run markers + verdict line at 107)
- File `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.13.0/D-security-reviewer-budget-3x.log` exists (3 run markers + verdict line at 156)
- File `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` updated with closure amendment H2 at line 894 + frontmatter status / plugin_version / milestone trail edits
- Commit `6fd916d` exists (Task 1; verified via `git rev-parse --short HEAD` after commit)
- Commit `429fcfe` exists (Task 2 + 3 closure commit; verified via `git rev-parse --short HEAD` after commit)
- All prior amendment blocks preserved byte-identically (verified via `git grep -cF`)
- No emojis / em dashes / curly quotes / box-drawing in any artifact
- Empirical FAIL verdict recorded honestly with no silent re-runs and no parser tweaks per the plan's empirical_gate_note
