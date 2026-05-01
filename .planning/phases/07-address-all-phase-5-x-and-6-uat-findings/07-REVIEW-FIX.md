---
phase: 07-address-all-phase-5-x-and-6-uat-findings
fixed_at: 2026-05-01T00:00:00Z
review_path: .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 7: Code Review Fix Report

**Fixed at:** 2026-05-01T00:00:00Z
**Source review:** .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 2 (Critical: 0, Warning: 2; Info findings excluded per `critical_warning` scope)
- Fixed: 2
- Skipped: 0

## Fixed Issues

### WR-01: Reviewer/security-reviewer aggregate word-budget arithmetic is inconsistent with per-section caps

**Files modified:** `plugins/lz-advisor/agents/reviewer.md`, `plugins/lz-advisor/agents/security-reviewer.md`
**Commit:** 8c00c3e
**Applied fix:** Adopted interpretation (a) from the review: the 300w aggregate is the binding cap; per-section caps (250w Findings, 160w CCP / Threat Patterns, 30w Missed surfaces) are loose upper bounds that the aggregate constrains in practice. Rewrote the closing paragraph in both `reviewer.md:81` and `security-reviewer.md:83` to state this explicitly, illustrate with the worked example "a maximally-used Findings section (250w) leaves only 50w for CCP + Missed surfaces combined", and accurately describe the smoke fixture's enforcement (per-entry 80w + per-section CCP/TP 160w + per-section Missed-surfaces 30w + 300w aggregate). Cross-checked against `D-reviewer-budget.sh` (lines 67-106) and `D-security-reviewer-budget.sh` (lines 67-108): both fixtures enforce all four caps, so the new prose accurately describes runtime behavior. The smoke fixture regex/awk assertions parse by section header (`^### Findings`, `^### Cross-Cutting Patterns`, `^### Threat Patterns`, `^### Missed surfaces`) and word-counts; my edits do NOT alter any of those headers or the agent's emit-time caps -- only the prose paragraph that describes them. Smoke-gate impact: nil.

### WR-02: Reviewer Class-2 Escalation Hook description bundles "migration / deprecation" under Class-2

**Files modified:** `plugins/lz-advisor/agents/reviewer.md`
**Commit:** ae8fd68
**Applied fix:** Adopted the narrower fix from the review: separated Class-2 from Class-3 in the escalation-hook prose. Four coordinated changes in `reviewer.md`:
1. Line 148: parenthetical narrowed from "API currency, configuration, recommended pattern, or migration / deprecation" to two distinct phrases -- "(per `references/orient-exploration.md` -- API currency, configuration, recommended pattern) or a Class-3 question (migration / deprecation)".
2. Line 153: schema example updated from `class="2"` to `class="<2|3|2-S>"`, and `question="<one-sentence Class-2 question>"` widened to `question="<one-sentence Class-2 or Class-3 question>"`.
3. Line 162: Class-value documentation extended to enumerate `"3"` for migration / deprecation questions explicitly, between the existing `"2"` and `"2-S"` clauses, so the reviewer knows what value to emit when escalating Class-3 questions.
4. Line 164: "(one per unresolved Class-2 question)" widened to "(one per unresolved Class-2 or Class-3 question)" for coherence with the new dual-class scope.

Cross-validated against `references/orient-exploration.md:29` (Class 2 definition) and `:83` (Class 3 definition) -- the taxonomy now matches. Cross-validated against `references/context-packaging.md` "Verify Request Schema" section -- the schema accepts `"2"|"2-S"|"3"|"4"`, so `"3"` was already a canonical class value; this fix simply teaches the reviewer agent prose to emit it for the migration / deprecation case.

---

_Fixed: 2026-05-01T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
