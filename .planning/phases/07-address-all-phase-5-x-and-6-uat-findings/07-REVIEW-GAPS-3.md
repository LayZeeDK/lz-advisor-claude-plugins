---
phase: 07-address-all-phase-5-x-and-6-uat-findings
reviewed: 2026-05-06T00:00:00Z
depth: quick
files_reviewed: 7
files_reviewed_list:
  - plugins/lz-advisor/agents/reviewer.md
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 07 Gap-Closure-3: Code Review Report

**Reviewed:** 2026-05-06
**Depth:** quick
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Quick-depth review of the per-section-budget contract redesign (commits 76ac386..23c4e1d, base b06ea10). The review covers two agent system prompts (`reviewer.md`, `security-reviewer.md`) plus a coordinated 0.12.2 -> 0.13.0 MINOR version bump across `plugin.json` and four SKILL.md frontmatter files.

The new XML `<output_constraints>` block is well-formed, structurally symmetric across both agent files (modulo the intended `cross_cutting_patterns` vs `threat_patterns` asymmetry per each skill's two-slot contract), and consistent with the YAML version stamps. Empirical 3x regression failure (D-reviewer FAIL_2_of_3 + D-security-reviewer FAIL_1_of_3) is documented in 07-VERIFICATION.md and is out of scope for code review — that is a prompt-binding limit at the model boundary, not a defect in the schema source.

The findings below are residual prose contradictions: the new XML declares `<aggregate_cap>none</aggregate_cap>`, but multi-paragraph commentary surrounding the XML still asserts the old <=300w aggregate cap as binding. Three Warning-level contradictions and four Info-level loose ends. No Critical-severity issues; no security issues; no broken cross-references; no version-stamp drift.

## Warnings

### WR-01: reviewer.md asserts aggregate-300w cap binding in prose despite XML declaring `<aggregate_cap>none</aggregate_cap>`

**File:** `plugins/lz-advisor/agents/reviewer.md:144`
**Issue:** The narrative text immediately following the holistic worked example states: "The executor MUST count words in their own output and stay <=300w aggregate; the per-finding 20w target is GUIDANCE." This directly contradicts the new XML on line 180 (`<aggregate_cap>none</aggregate_cap>`) and the line-189 commentary that "the aggregate cap was empirically falsified ... and replaced with per-section budgets". A model reading the system prompt sees both rules and must choose; given the explicit "MUST" in the prose, it is the more imperative directive and likely wins, partially explaining why the regression test still saw aggregate-style overflow on 0.13.0.
**Fix:** Replace the contradictory sentence with one that aligns with the new contract. Suggested text:
```
Word counts in this worked example are illustrative; the binding budgets are the per-section <max_words> values in the <output_constraints> block (per-entry <=22w/<=28w outlier; cross_cutting_patterns <=160w; missed_surfaces <=30w; per_finding_validation <=60w/entry). There is no aggregate cap.
```

### WR-02: security-reviewer.md asserts aggregate-300w cap "remains binding" in prose despite XML declaring `<aggregate_cap>none</aggregate_cap>`

**File:** `plugins/lz-advisor/agents/security-reviewer.md:151`
**Issue:** Mirror of WR-01, but more explicit and more harmful: "The aggregate <=300w cap remains binding regardless of per-finding distribution." This directly contradicts line 72 ("there is no aggregate cap") within the same Output Constraint section and line 185 (`<aggregate_cap>none</aggregate_cap>`) in the XML block. The contradiction is internal to a single section read by the model in a single pass; the model has no way to resolve which rule binds. This is the most likely prompt-level driver of the n=1/3 D-security-reviewer regression: the model is being told "no aggregate cap" and "300w cap remains binding" in adjacent paragraphs.
**Fix:** Same shape as WR-01:
```
Word counts in this worked example are illustrative; the binding budgets are the per-section <max_words> values in the <output_constraints> block. There is no aggregate cap. The auto-clarity carve-out (Finding 7 with CVE-2025-1234 in this example) is INTENTIONAL -- security advisories need full prose, and per_finding_validation absorbs that volume without conflicting with per-entry findings caps.
```

### WR-03: Holistic worked example narration in both files retains "fitting under 300w" framing

**File:** `plugins/lz-advisor/agents/reviewer.md:123` and `plugins/lz-advisor/agents/security-reviewer.md:131`
**Issue:** Both files introduce their holistic worked example with "demonstrates ... fitting under 300w" (reviewer line 123: "demonstrates 7 findings + Cross-Cutting Patterns + Missed surfaces fitting under 300w"; security-reviewer line 131: "demonstrates 6 findings ... fitting under 300w"). These framing sentences are leftovers from the aggregate-cap regime. They do not name the new per-section budgets, so a model parsing the example treats "300w" as the implicit pass criterion and may unconsciously compress legitimate per-section content to stay under it (defeating the purpose of the redesign), or alternatively treat the 300w as a softer guideline alongside the new XML and overshoot it (the observed regression mode).
**Fix:** Replace the introductory sentence in each file. Reviewer suggested:
```
Holistic worked example (demonstrates 7 findings + Cross-Cutting Patterns + Missed surfaces conforming to the per-section budgets in the <output_constraints> block; aggregate length is unconstrained and naturally lands around 220-300w when the fragment-grammar shape is followed):
```
Apply the analogous rewording in security-reviewer.md.

## Info

### IN-01: `<do_not_include>` enumeration is permissive against the n=5 over-cap regression vector

**File:** `plugins/lz-advisor/agents/reviewer.md:181-186` and `plugins/lz-advisor/agents/security-reviewer.md:186-191`
**Issue:** Item 2 forbids `Severity revisions vs. {initial,executor}:` prose ONLY when emitted "without the canonical `### Per-finding validation` heading." With the heading present and per-finding `Validation of Finding N:` prefix, up to 15 findings * 60w = 900w of validation prose is permitted. The Phase 7 empirical regression (n=5 over-cap on 0.12.2; n=4 mean 354.25w) was driven precisely by validation-style prose; the new contract opens a 900w channel for the same content under a different heading. This is by design per the user directive (per-section budgets explicitly permit category-bounded prose), but it is also the structural reason why the 3x regression gate still failed: D-reviewer FAIL_2_of_3 likely emitted exactly this kind of validation prose, just routed through the new channel.
**Fix:** No change required at the source-file level — this is the architecture-grade limit documented in 07-VERIFICATION.md `closure_amendment_2026_05_06_per_section_budgets`. Future sealing would tighten `per_finding_validation` `max_words` from 60 to 30, or reduce `max_count` to 5, or both. Defer to Phase 8 / future planning per the empirical evidence.

### IN-02: Worked example word-count breakdown narration uses out-of-date totals

**File:** `plugins/lz-advisor/agents/reviewer.md:144` ("aggregate ~220w") and `plugins/lz-advisor/agents/security-reviewer.md:151` ("aggregate ~265w")
**Issue:** The "Word count breakdown" narration after each holistic example reports an aggregate total ("aggregate ~220w" / "aggregate ~265w") without context. Under the new contract, an aggregate count is not a contract gate — only the per-section breakdowns are. Reporting the aggregate without flagging it as informational risks the model treating it as a target.
**Fix:** Add a parenthetical to each breakdown line:
```
... aggregate ~220w (informational; not a contract gate -- per-section budgets are the binding constraint).
```

### IN-03: `Section ordering` line claims "Plan 07-14 + 07-15 land this contract" — verify plan numbers post-revision

**File:** `plugins/lz-advisor/agents/reviewer.md:189` and `plugins/lz-advisor/agents/security-reviewer.md:194`
**Issue:** Both files reference "Plan 07-14 + 07-15 land this contract" as the source-of-truth attribution. Per recent commit history (commits b06ea10 "phase 07 plan count 17", 65e82a7 "revise gap-closure 3 plans per checker feedback"), the gap-closure-3 plan numbers may have shifted during checker-driven revision. If the actual landing plans are now 07-15 / 07-16 / 07-17, this attribution drifts.
**Fix:** Cross-check against `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/STATE.md` or the actual plan files; update the plan-number reference to match. If the numbers are correct, no action.

### IN-04: Asymmetric reference between agent files: reviewer cites `agents/reviewer.md` from inside reviewer.md (self-reference loop noise)

**File:** `plugins/lz-advisor/agents/security-reviewer.md:163`
**Issue:** security-reviewer.md correctly notes "same structural shape as `agents/reviewer.md` `<output_constraints>` block, with `cross_cutting_patterns` replaced by `threat_patterns`". This is correct cross-reference. However, reviewer.md (line 158) does NOT have a corresponding "see also `agents/security-reviewer.md`" or "this is the canonical shape; security-reviewer mirrors it" pointer. Asymmetric cross-referencing makes future maintenance harder: editing reviewer.md without knowing security-reviewer.md mirrors it risks divergence.
**Fix:** Add to reviewer.md after line 158:
```
This block is mirrored in `agents/security-reviewer.md` `<output_constraints>` (with `cross_cutting_patterns` -> `threat_patterns`); when editing, update both files in sync to preserve symmetry.
```

---

_Reviewed: 2026-05-06_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
