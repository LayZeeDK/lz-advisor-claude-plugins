---
phase: 07-address-all-phase-5-x-and-6-uat-findings
fixed_at: 2026-05-05T00:00:00Z
review_path: .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 0
skipped: 2
status: none_fixed
---

# Phase 7 Gap-Closure: Code Review Fix Report

**Fixed at:** 2026-05-05T00:00:00Z
**Source review:** .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 2 (Critical: 0, Warning: 0, Info: 2 -- all-scope review per `--all including info`)
- Fixed: 0
- Skipped: 2 (both deferred to Phase 8 per the reviewer's own explicit recommendation)

This report supersedes the prior 07-REVIEW-FIX.md (dated 2026-05-01, iteration 1, scoped to the original 0.12.0-era WR-01 / WR-02 findings on `reviewer.md` + `security-reviewer.md`). The current 07-REVIEW.md (dated 2026-05-04) is a fresh gap-closure review scoped strictly to Plans 07-10 (advisor.md fragment-grammar emit template) and 07-11 (Rule 5b dual-surface differentiation) plus the plugin SemVer bump 0.12.0 -> 0.12.1. The prior WR-01 / WR-02 fixes remain durable in `git log` (commits `8c00c3e` and `ae8fd68`); they are not invalidated, only out-of-scope for this iteration.

## Fixed Issues

None -- both in-scope findings were skipped per the reviewer's explicit deferral recommendations.

## Skipped Issues

### IN-01: advisor.md Format spec uses period delimiters but Density example items flow as single sentences

**File:** `plugins/lz-advisor/agents/advisor.md:60`
**Reason:** Deferred to Phase 8 per the reviewer's explicit recommendation (option (a): "leave as-is and rely on the Density-example anchor"). Classification: `defer_to_phase_8`.

**Original issue:** The new `Format:` line at line 60 specifies `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.` -- the period delimiters between the three angle-bracket placeholders suggest a three-sentence-per-item shape. The preserved Density examples (lines 86-100) emit single-sentence items combining verb + object + rationale via clauses (one sentence, three logical clauses). The prose at line 82 calls the Density examples "the worked-example anchors of this output contract" -- so the examples take precedence -- but a reader following the Format spec literally could emit three short choppy sentences per item.

**Deferral rationale (verbatim from reviewer):** "Recommendation: option (a). The prose already anchors the examples as authoritative; the Format spec is a reading aid. Defer until the next empirical signal (smoke-fixture run on 0.12.1) shows whether Opus interprets the period delimiters as sentence boundaries."

**Verification of source-file alignment:** Confirmed by re-reading `plugins/lz-advisor/agents/advisor.md` lines 60-82 and lines 86-100 in the current working tree on 2026-05-05. Line 60 matches the cited Format spec verbatim; line 82 matches the cited "worked-example anchors" prose verbatim; the two `### Density example` blocks are intact at lines 86-100. No drift between review context (2026-05-04) and current source state.

**Phase 8 carry-forward:** This becomes a Phase 8 candidate gated on the empirical 0.12.1 smoke-fixture signal. If `D-advisor-budget.sh` aggregate-cap assertion passes on 0.12.1 with the current Format spec, the issue self-resolves (option (a) was correct). If the assertion fails AND the failure mode is per-item word inflation traceable to three-sentence interpretation, Phase 8 should apply option (b) (tighten the Format line to make the clause-level intent unambiguous).

### IN-02: Aggregate cap empirical-anchor paragraph cites three different empirical points without a single timestamped baseline

**File:** `plugins/lz-advisor/agents/advisor.md:84`
**Reason:** Deferred to Phase 8 per the reviewer's explicit recommendation. The advisor.md rewrite is correctly identified as the BETTER citation pattern -- not a regression. Classification: `defer_to_phase_8`.

**Original issue:** The new Aggregate cap paragraph (line 84) cites three empirical anchors via the in-project `07-VERIFICATION.md` empirical-subverification timestamp. The reviewer.md (line 158) and security-reviewer.md (line 163) aggregate-cap paragraphs cite the `caveman` baseline by absolute Windows path. The advisor.md rewrite WISELY does NOT propagate the absolute-path anti-pattern -- it cites the in-project empirical anchor instead. Net: advisor.md is portable; reviewer.md / security-reviewer.md remain non-portable. This is a pre-existing inconsistency surfaced by the rewrite, not a regression.

**Deferral rationale (verbatim from reviewer):** "No action required for Plan 07-10 / 07-11 closure -- the rewrite is the better citation pattern. Track as a follow-up to harmonize reviewer.md:158 + security-reviewer.md:163 with the advisor.md citation style (drop the absolute Windows path, replace with in-project empirical-anchor reference). The follow-up is the IN-03 item carried forward from the prior 07-REVIEW.md and is already a Phase 8 candidate. Recommendation: defer. The rewrite introduces no new regression; the inconsistency is asymmetrically improving (advisor.md leads, reviewer.md / security-reviewer.md lag)."

**Verification of source-file alignment:** Confirmed by re-reading `plugins/lz-advisor/agents/advisor.md` line 84 in the current working tree on 2026-05-05. The Aggregate cap paragraph cites `07-VERIFICATION.md` `empirical_subverification_2026_05_03` (in-project, portable) and references Plan 07-09's reviewer (197w / 34% under-cap) and security-reviewer (285w / 5% under-cap) baselines on plugin 0.12.0. No drift between review context (2026-05-04) and current source state.

**Phase 8 carry-forward:** The harmonization follow-up is already tracked in project memory (`project_phase_8_candidates_post_07.md`) and surfaced in `07-RESEARCH-GAPS.md` and `07-11-SUMMARY.md`. Phase 8 should harmonize `plugins/lz-advisor/agents/reviewer.md:158` and `plugins/lz-advisor/agents/security-reviewer.md:163` to the advisor.md citation style: drop the absolute `D:\projects\JuliusBrussee\caveman` Windows path; replace with an in-project empirical-anchor reference (Plan 07-09's empirical fire on plugin 0.12.0 documented in `07-VERIFICATION.md`).

---

## Phase Closure Disposition

Both in-scope findings (IN-01, IN-02) are info-only with explicit reviewer-authored deferral recommendations. The reviewer's REVIEW.md status (`issues_found`) is informational, not blocking; the prose explicitly states "Two Info items below note minor consistency observations that do not block phase closure." Phase 7 gap-closure (Plans 07-10 and 07-11) remains structurally complete -- the SemVer 0.12.0 -> 0.12.1 PATCH bump in `bf8a8db` is correctly classified, and neither finding identifies a regression.

No source files were modified during this fix iteration. No commits were created.

---

_Fixed: 2026-05-05T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
