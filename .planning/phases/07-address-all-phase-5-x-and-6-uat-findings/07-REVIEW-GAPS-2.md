---
phase: 07-address-all-phase-5-x-and-6-uat-findings
reviewed: 2026-05-05T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/references/context-packaging.md
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 07 Gap-Closure Wave 2: Code Review Report

**Reviewed:** 2026-05-05T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Wave 8 (Plan 07-12, halted-by-design at Task 1, no source-file changes) and Wave 9 (Plan 07-13, all 4 tasks shipped) deliver the WR-01 / WR-02 / WR-03 gap closures plus the 0.12.1 -> 0.12.2 PATCH bump. The four shipped commits (`92cac0b`, `ea2045e`, `b5916ea`, `bd3c378`) cleanly land:

- **WR-01:** `agents/security-reviewer.md:312` Hedge Marker carve-out severity tokens renamed from `Severity: Medium` -> `Severity: Suggestion` and from `high-severity` -> `important-severity`. Confirmed: `git show 6e96b27...` shows the prior text was `'Severity: Medium pending verification of <hedge action>.' Severity escalates if verification confirms the threat; until then, the hedge prevents premature high-severity classification.`; current state is `'Severity: Suggestion pending verification of <hedge action>.' ... important-severity classification.`. Clean.
- **WR-02:** 5 of 6 surfaces correctly aligned to `Critical / Important / Suggestion`. The 6th surface, `references/context-packaging.md:376`, is the schema declaration for `<verify_request>` and STILL permits the legacy `high|medium` values in its enumerated `severity=` allow-list -- this is a residual gap (WR-04 below).
- **WR-03:** New `## Class-2 Escalation Hook` section at `agents/security-reviewer.md:232+` is fully self-contained -- it includes the schema, attribute definitions, class-value table, executor-side flow, and one-shot re-invocation contract without any pointer to `agents/reviewer.md`. Cross-reference integrity verified: `git grep "agents/reviewer.md"` returns zero matches across the three security surfaces (security-reviewer.md, context-packaging.md, lz-advisor.security-review/SKILL.md). Forward reference at line 119 (`see ## Class-2 Escalation Hook below`) resolves correctly.
- **Plugin 0.12.2 bump:** All 5 surfaces consistent (`plugin.json:3`, plus `version: 0.12.2` in 4 SKILL.md frontmatter occurrences). Verified via `git grep "0.12.1\|0.12.2"`.

Two warnings remain: a residual legacy severity value in the schema declaration that contradicts the field definition (WR-04), and an open question about a worked-example `Severity: High` line that may be intentional source-material (IN-01). Two informational items round out the review (IN-02 narrow scope of `important-severity` rename pattern; IN-03 schema-vs-field-definition contradiction noted but defer-able).

ASCII-only rule, fenced-block balance (12 fences in context-packaging.md, 2 in security-reviewer.md, both even), and YAML frontmatter validity all pass.

## Warnings

### WR-04: Schema declaration still permits legacy `high|medium` severity values

**File:** `plugins/lz-advisor/references/context-packaging.md:376`
**Issue:** The `<verify_request>` schema declaration at line 376 permits the legacy values `high|medium` in its severity allow-list:

```
<verify_request question="<one-sentence Class-2 question>" class="<2|2-S|3|4>" anchor_target="pv-<id-suggestion>" severity="<critical|important|suggestion|high|medium>">
```

This contradicts the field definition four lines below at line 388, which only enumerates `Critical / Important / Suggestion`:

> **`severity`** (OPTIONAL): matches the affected finding's severity (Critical / Important / Suggestion for reviewer; Critical / Important / Suggestion for security-reviewer). Helps the executor prioritize verification effort when multiple verify_request blocks are emitted.

WR-02's commit message claims "5-surface legacy 'Critical / High / Medium' -> 'Critical / Important / Suggestion' alignment in lz-advisor.security-review/SKILL.md (lines 14, 126, 164) + references/context-packaging.md (lines 289, 388)" -- but missed the schema BNF declaration on line 376. The two agent-side schemas (reviewer.md:230, security-reviewer.md:239) both correctly use `<critical|important|suggestion>` only. This is a single-character drift in the canonical reference file.

Severity: Warning (not Critical) because (a) all worked examples in the same file use `severity="important"` correctly, (b) the field definition four lines later is the authoritative shape, and (c) no agent or skill currently emits `severity="high"` or `severity="medium"`. But the schema is the canonical contract; a future agent reading line 376 alone could legitimately emit `severity="medium"` and parsers built off the BNF would accept it.

**Fix:** Tighten the BNF allow-list to match the field definition. Replace line 376:

```
<verify_request question="<one-sentence Class-2 question>" class="<2|2-S|3|4>" anchor_target="pv-<id-suggestion>" severity="<critical|important|suggestion>">
```

(removes `|high|medium` from the union). No worked-example or agent-side schema needs to change.

### WR-05: Worked-example `Severity: High` in Verification Template demo

**File:** `plugins/lz-advisor/references/context-packaging.md:317`
**Issue:** The "Worked Example (adapted from the successful security-review pattern)" block (lines 305-329) uses `Severity: High` on line 317 inside the demo Findings block:

```
1. @compodoc/compodoc not in package.json -- File: package.json:1-40
   Severity: High
   OWASP: A06 Vulnerable and Outdated Components
```

The scope_note explicitly flagged this as an open question: "Determine if this is in scope of WR-02 or intentional (showing a SOURCE reviewer's legacy assignment that security-reviewer is asked to verify/re-classify)."

Determination: this IS in scope of WR-02 and was missed. The Verification Template's role is to show the executor packaging an INITIAL severity assessment that the security-reviewer then validates / revises. The Findings template at line 288 explicitly mandates the executor use `Critical/Important/Suggestion` for the initial severity field (post-WR-02 alignment); shipping a worked example that uses `Severity: High` in that same field directly contradicts the template the example is supposed to illustrate. There is no "narrative reason" for the demo to use legacy vocab -- the example pre-dates WR-02 and was simply missed.

The scope_note's alternative reading (executor packages legacy severity from upstream review file, security-reviewer reclassifies) is plausible but inconsistent with the demo: the example shows the executor's own initial assessment of a finding the executor itself surfaced (`Compodoc is a transitive dep, so npm install may resolve a different version`) -- not a reclassification of someone else's earlier `Severity: High` assignment.

**Fix:** Replace line 317 with `Severity: Important` (the closest mapping under the new vocabulary -- exploitable supply-chain risk, defense-in-depth applies). Update the line in place; no surrounding lines need to change.

## Info

### IN-01: WR-01 paraphrased "Medium" -> "Suggestion" but kept "high-severity" -> "important-severity" pattern

**File:** `plugins/lz-advisor/agents/security-reviewer.md:312`
**Issue:** WR-01's rename of `high-severity` -> `important-severity` is grammatically slightly awkward in context: "the hedge prevents premature important-severity classification." The adjective `important-severity` reads less naturally than `high-severity` (which is a well-established compound modifier in security literature). However, this is the trade-off the chosen vocabulary requires -- once `Important` replaces `High` as the severity name, the adjective form follows.

The rename is consistent: `git grep "high-severity\|medium-severity\|important-severity\|suggestion-severity"` returns the single line in security-reviewer.md:312 plus zero other matches. No phantom legacy compound modifiers remain elsewhere.

**Fix:** None needed. Note for future writing-style polishing: consider rephrasing to avoid the compound modifier entirely (e.g., "the hedge prevents premature classification as Important"). Defer to a wording-polish pass; not blocking.

### IN-02: WR-03 self-contained section duplicates ~40% of context-packaging.md "Verify Request Schema" content

**File:** `plugins/lz-advisor/agents/security-reviewer.md:232-258`
**Issue:** The new self-contained `## Class-2 Escalation Hook` section in security-reviewer.md duplicates substantial content from `references/context-packaging.md` "Verify Request Schema" section (lines 369-424), specifically the schema BNF, the field definitions for `class` / `anchor_target` / `severity` / `<context>`, and the one-shot executor-side flow description.

This is by design per the scope_note ("NEW '## Class-2 Escalation Hook' section in agents/security-reviewer.md (line 232+) replacing a previously-broken cross-file pointer to agents/reviewer.md"). Eliminating the cross-file pointer in favor of in-place duplication is the correct trade-off: agent prompts have their own context budget and cannot resolve `${CLAUDE_PLUGIN_ROOT}/references/...` includes at runtime, so a self-contained section is the only architecturally sound option.

The duplication does introduce a future maintenance hazard: if the schema in context-packaging.md changes (e.g., WR-04 fix above tightens the BNF), the agent-side section MUST be re-synced. Line 246 in security-reviewer.md correctly already uses the tight `<critical|important|suggestion>` form, so the agent-side is currently CORRECT and the canonical reference file is the laggard. After WR-04 ships, the two surfaces will be aligned again.

**Fix:** None blocking. Recommendation: when WR-04 ships, reviewer.md:230 + security-reviewer.md:239 + context-packaging.md:376 should all be touched in the same commit to enforce schema parity. No code change needed for this Wave-9 review.

---

_Reviewed: 2026-05-05T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
