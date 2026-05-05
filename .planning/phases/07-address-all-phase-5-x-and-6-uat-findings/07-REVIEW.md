---
phase: 07-address-all-phase-5-x-and-6-uat-findings
reviewed: 2026-05-04T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - plugins/lz-advisor/agents/advisor.md
  - plugins/lz-advisor/references/context-packaging.md
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
findings:
  critical: 0
  warning: 0
  info: 2
  total: 2
status: issues_found
---

# Phase 7 Gap-Closure: Code Review Report

**Reviewed:** 2026-05-04T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found (info-only; no Critical or Warning findings)

## Summary

Replaces the original 07-REVIEW.md to scope the review strictly to gap-closure plans 07-10 and 07-11.

Plan 07-10 rewrites `plugins/lz-advisor/agents/advisor.md`'s `## Output Constraint` from descriptive-prose form to fragment-grammar emit-template form. The pattern matches the Plan 07-09 reviewer.md / security-reviewer.md template structurally: `Format:` line + per-item word target + `Drop:` list (7 items) + `Keep:` list (5 items) + worked-example anchor pointer + `Aggregate cap:` paragraph with empirical citation. The two pre-existing `### Density example` blocks (full-context 95-100w and thin-context 95-100w) are preserved byte-identically and serve as the worked-example anchors per the new prose ("Treat them as the worked-example anchors of this output contract."). The Edge Cases Assuming-frame contract (lines 179-203) is preserved including the literal frame, two worked substitutions, and the 10-item forbidden-paraphrase list.

Plan 07-11 amends `plugins/lz-advisor/references/context-packaging.md` Common Contract Rule 5b's Format mandate with dual-surface differentiation: internal-prompt surface keeps the canonical-XML mandate (Sonnet 4.6 / Opus 4.7 XML-tag parsing rationale cited), user-facing artifact surface relaxes to permit three token-form shapes (Verified: trailer, prose citation, inline parenthetical) ONLY paired with concrete-source backing. Trust contract preservation is enforced via the new Assertion 6 of `B-pv-validation.sh` (resolution check). The amendment is a strict narrowing of the format mandate scope without relaxing the trust contract; the four SKILL.md `pv-* synthesis precondition` blocks (which reference Rule 5b for evidence-grounding, not format-shape) remain consistent post-amendment.

The plugin SemVer bump 0.12.0 -> 0.12.1 is correctly classified as PATCH per SemVer: Plan 07-10 changes the agent's internal output shape (no public API change, no new feature surface) and Plan 07-11 strictly relaxes a constraint (format mandate scope narrowed; backward-compatible with all existing canonical-XML usage). Neither plan introduces breaking changes or new feature surfaces. The five files (`plugin.json` + 4 `SKILL.md`) all show consistent `0.12.0 -> 0.12.1` bumps in commit `bf8a8db`.

No Critical or Warning findings. Two Info items below note minor consistency observations that do not block phase closure.

## Info

### IN-01: advisor.md Format spec uses period delimiters but Density example items flow as single sentences

**File:** `plugins/lz-advisor/agents/advisor.md:60`
**Issue:** The new `Format:` line specifies `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.` -- the period delimiters between the three angle-bracket placeholders suggest a three-sentence-per-item shape. The preserved Density examples (lines 86-100) emit single-sentence items combining verb + object + rationale via clauses, e.g., "Add `inputs: [...]` and `outputs: [...]` to the `compodoc` target in `libs/my-lib/project.json` so Nx caches on upstream deps." (one sentence, three logical clauses). The prose at line 82 calls the Density examples "the worked-example anchors of this output contract" -- so the examples take precedence -- but a reader following the Format spec literally could emit three short choppy sentences per item, working against the 15w-per-item target. The advisor agent will likely follow the worked-example shape (since the prose explicitly anchors it), but the Format line could be tightened to match the example shape.
**Fix:**
```
Either (a) leave as-is and rely on the Density-example anchor (cheapest;
no smoke-fixture impact), or (b) tighten the Format line to make the
clause-level intent unambiguous. Concrete edit for option (b):

  Format: each numbered item is one sentence: `<verb-led action> <concrete
  object or path> <one-clause rationale or Assuming-frame if needed>.` --
  three logical clauses, one terminal period; see the Density examples
  below for the canonical shape.

Recommendation: option (a). The prose already anchors the examples as
authoritative; the Format spec is a reading aid. Defer until the next
empirical signal (smoke-fixture run on 0.12.1) shows whether Opus
interprets the period delimiters as sentence boundaries.
```

### IN-02: Aggregate cap empirical-anchor paragraph cites three different empirical points without a single timestamped baseline

**File:** `plugins/lz-advisor/agents/advisor.md:84`
**Issue:** The new Aggregate cap paragraph (line 84) cites three empirical anchors in one sentence: (a) "Plan 07-04 descriptive prose was empirically insufficient on plugin 0.12.0 (118w aggregate, 18% over per `07-VERIFICATION.md` `empirical_subverification_2026_05_03`)", (b) "Plan 07-09 reduced reviewer 396w / 32% over to 197w / 34% under-cap" on 0.12.0, (c) "security-reviewer 414w / 38% over to 285w / 5% under-cap on plugin 0.12.0 via the same technique applied at `effort: medium`". The reviewer.md and security-reviewer.md aggregate-cap paragraphs (lines 158, 163) cite the `caveman` baseline by absolute Windows path (the IN-03 issue from the prior 07-REVIEW.md). The advisor.md rewrite WISELY does NOT propagate that absolute-path anti-pattern -- it cites the in-project `07-VERIFICATION.md` empirical timestamp instead. Net: advisor.md is now portable while reviewer.md / security-reviewer.md remain non-portable. This is a pre-existing inconsistency surfaced by the rewrite, not a regression.
**Fix:**
```
No action required for Plan 07-10 / 07-11 closure -- the rewrite is the
better citation pattern. Track as a follow-up to harmonize
reviewer.md:158 + security-reviewer.md:163 with the advisor.md citation
style (drop the absolute Windows path, replace with in-project
empirical-anchor reference). The follow-up is the IN-03 item carried
forward from the prior 07-REVIEW.md and is already a Phase 8 candidate.

Recommendation: defer. The rewrite introduces no new regression; the
inconsistency is asymmetrically improving (advisor.md leads,
reviewer.md / security-reviewer.md lag).
```

## Resolved Gaps (gap-list amendment 2026-05-05)

The 2026-05-05 ultrathink against `07-RESEARCH-GAPS-2.md` Gap 2 surfaced three residual severity-vocabulary-alignment gaps (WR-01, WR-02, WR-03) that originated as gap-list items adjacent to this review (commit `6e96b27`, "docs(07): plan gap closures 2 -- WR-01/02/03 + security-reviewer 0.12.1 budget regression"). They were re-evaluated as in-phase and closed via Plan 07-13.

**WR-01: RESOLVED via Plan 07-13 Task 1 (commit 92cac0b; plugin 0.12.2).**

Closure: `agents/security-reviewer.md:284` Hedge Marker Discipline security-clearance carve-out paragraph severity-vocabulary aligned (`Severity: Medium pending verification` -> `Severity: Suggestion pending verification`; `premature high-severity classification` -> `premature important-severity classification`). Verified via `git grep -c "Severity: Suggestion pending verification" plugins/lz-advisor/agents/security-reviewer.md` returns 1 + `git grep -c "Severity: Medium pending verification" plugins/lz-advisor/agents/security-reviewer.md` returns 0.

**WR-02: RESOLVED via Plan 07-13 Task 2 (commit ea2045e; plugin 0.12.2).**

Closure: 5 surfaces aligned to renamed Critical/Important/Suggestion lexicon. Surface 1: `lz-advisor.security-review/SKILL.md:14` user-visible comma-form skill description (matches sister skill `lz-advisor.review/SKILL.md:13`); Surface 2: `lz-advisor.security-review/SKILL.md:126` Phase 1 Scan vocabulary; Surface 3: `lz-advisor.security-review/SKILL.md:164` Phase 3 Output reformat-prohibition vocabulary; Surface 4: `references/context-packaging.md:289` Verification template severity guidance; Surface 5 (design-bearing): `references/context-packaging.md:388` Verify Request Schema severity attribute (Option A full alignment per 07-RESEARCH-GAPS-2.md Gap 2 Surface 4 ranked recommendation; no external consumer of internal verify_request schema). Verified via `git grep -F "Critical / High / Medium" plugins/lz-advisor/` returns 0 + `git grep -F "Critical/High/Medium" plugins/lz-advisor/` returns 0 + `rg -F "Critical, High" plugins/lz-advisor/` returns 0 lines.

**WR-03: RESOLVED via Plan 07-13 Task 3 (commit b5916ea; plugin 0.12.2).**

Closure: `agents/security-reviewer.md` gains self-contained `## Class-2 Escalation Hook` section between `## Threat Modeling` and `## Final Response Discipline`, mirroring `agents/reviewer.md` lines 223-249 with security-specific adaptations (Class 2-S primary; renamed severity lexicon; pv-cve-... / pv-advisory-ghsa-... / pv-compodoc-... anchor_target conventions; security-tool guidance for npm audit / GHSA / OSV / NVD CVE lookups; Plan 07-05 D-04 + OWASP / arXiv 2601.11893 / Claude Code Issue #20264 privilege-escalation anchors). Cross-file pointer on line 119 replaced with self-contained reference; carve-out enumeration on line 129 updated. Verified via `git grep -c "^## Class-2 Escalation Hook$" plugins/lz-advisor/agents/security-reviewer.md` returns 1 + `git grep -c "see \`## Class-2 Escalation Hook\` in reviewer.md" plugins/lz-advisor/agents/security-reviewer.md` returns 0.

---

_Reviewed: 2026-05-04T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Scope: Plan 07-10 (advisor.md fragment-grammar emit template) + Plan 07-11 (Rule 5b dual-surface differentiation) + plugin SemVer bump 0.12.0 -> 0.12.1 PATCH_
_Amendment 2026-05-05: WR-01/02/03 RESOLVED via Plan 07-13 (severity-vocabulary alignment + Class-2 Escalation Hook addition); plugin 0.12.1 -> 0.12.2 PATCH_
