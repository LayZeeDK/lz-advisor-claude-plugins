---
phase: 07-address-all-phase-5-x-and-6-uat-findings
reviewed: 2026-05-01T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/agents/advisor.md
  - plugins/lz-advisor/agents/reviewer.md
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/references/context-packaging.md
  - plugins/lz-advisor/references/orient-exploration.md
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-05-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Phase 7 landed prompt-engineering changes across the lz-advisor marketplace plugin. The reviewed surface is markdown prompts (4 SKILL.md, 3 agents/*.md, 2 references/*.md) plus one JSON manifest. Internal-consistency checks performed:

- **Byte-identity canon (4 SKILL.md).** The `<context_trust_contract>` block and the `<orient_exploration_ranking>` block are byte-identical across all four SKILL.md files (verified via `diff` pairwise against execute/SKILL.md). No drift.
- **ASCII-only constraint.** All 10 files are ASCII-clean (verified via `rg -P '[^\x00-\x7F]'`). No em dashes, en dashes, curly quotes, ellipsis, emojis, or box-drawing characters.
- **YAML frontmatter.** All agent and SKILL frontmatter blocks parse cleanly; required fields (`name`, `description`, `model`, `color`, `tools`, `version`, `allowed-tools`) are present and well-formed.
- **Version consistency.** plugin.json (`0.11.0`) matches all four SKILL.md `version:` fields. No skew across surfaces.
- **Tool-grant least-privilege.** All three agents (advisor, reviewer, security-reviewer) declare `tools: ["Read", "Glob"]`. The verify_request escalation hook (Plan 07-05) preserves this grant rather than expanding it.
- **Word-budget calibration.** Both advisor density examples (full-context and thin-context) measure exactly 100 and 95 words respectively, matching the 95-100 word claim in the surrounding prose.

Two warnings flag internal-consistency defects in the reviewer/security-reviewer agent prose: an arithmetic inconsistency in the word-budget composition claim, and a Class taxonomy slip in the reviewer's Class-2 Escalation Hook description. Three info items capture minor self-contradictions and a duplicate-prose opportunity.

No security regressions, prompt-injection vectors, broken JSON, or missing required frontmatter fields detected.

## Warnings

### WR-01: Reviewer/security-reviewer aggregate word-budget arithmetic is inconsistent with per-section caps

**File:** `plugins/lz-advisor/agents/reviewer.md:81` and `plugins/lz-advisor/agents/security-reviewer.md:83`

**Issue:** Both agent files claim three independent per-section caps that "compose to the 300w aggregate":

- Findings section: aggregate `<=250 words`
- Cross-Cutting Patterns / Threat Patterns: `<=160 words`
- Missed surfaces: `<=30 words`

The arithmetic is `250 + 160 + 30 = 440`, not 300. The prose "the per-entry Findings cap (80w) and the per-section caps (160w CCP, 30w Missed surfaces) compose to the 300w aggregate" mixes the per-entry Findings cap (80w, applies to a single finding) with the per-section CCP and Missed-surfaces caps, which is also internally inconsistent (the Findings section can hold up to 5 entries of 80w each = 400w by the per-entry rule, capped at 250w by the per-section rule).

The 300w aggregate is non-recoverable from the per-section caps as stated. Either:
- (a) The aggregate is the binding cap and the per-section caps are loose upper bounds that the aggregate constrains in practice (e.g., a 250w Findings section leaves only 50w for CCP + Missed surfaces). The prose should say so.
- (b) The aggregate is wrong and should be 440w (the sum of per-section caps).
- (c) One or more per-section caps need to come down so they sum to 300w.

The smoke fixtures `D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` (per the agent prose, "parses by section header and asserts each sub-cap") presumably enforce the per-section caps individually but the aggregate claim has no consistent reading.

**Fix:** Decide which cap is binding and rewrite the closing paragraph for clarity. If interpretation (a) is intended:

```
Total: <=300 words aggregate (binding cap). Per-section caps (250w Findings, 160w CCP, 30w Missed surfaces) are loose upper bounds; the aggregate cap constrains usage in practice -- a maximally-used Findings section (250w) leaves only 50w for CCP + Missed surfaces combined. The smoke fixture `D-reviewer-budget.sh` enforces the aggregate cap and the per-entry Findings cap (80w); per-section caps are advisory.
```

Apply the equivalent edit to `security-reviewer.md` line 83 (substituting "Threat Patterns" for "CCP").

---

### WR-02: Reviewer Class-2 Escalation Hook description bundles "migration / deprecation" under Class-2

**File:** `plugins/lz-advisor/agents/reviewer.md:148`

**Issue:** The reviewer agent's Class-2 Escalation Hook prose says:

> When you encounter a Class-2 question (per `references/orient-exploration.md` -- API currency, configuration, recommended pattern, **or migration / deprecation**) ...

Per `references/orient-exploration.md:83`, "Migration / deprecation" is **Class 3**, not Class 2. Class 2 is API currency / configuration / recommended pattern only (line 29). The reviewer agent's parenthetical mis-attributes Class 3 to Class 2.

This matters because the schema's `class=` attribute encodes the question class; the reviewer agent's instruction tells it to emit `class="2"` even for migration / deprecation questions, which would tag a Class-3 question as Class-2 in the executor's downstream routing. Per context-packaging.md "Verify Request Schema" (line 372), the `class` field accepts `"2"|"2-S"|"3"|"4"`, so the canonical schema supports Class 3 explicitly.

**Fix:** Either narrow the parenthetical to remove "or migration / deprecation" and instruct the reviewer to emit `class="3"` for those questions, OR broaden the heading to "Class-2/3 Escalation Hook" and document both class values in the schema example. The narrower fix:

```diff
-When you encounter a Class-2 question (per `references/orient-exploration.md` -- API currency, configuration, recommended pattern, or migration / deprecation) that the executor's Phase 1 pre-emption did NOT anticipate AND that you cannot resolve from your `[Read, Glob]` tool access alone, emit a structured `<verify_request>` block in addition to the affected `### Findings` entry.
+When you encounter a Class-2 question (per `references/orient-exploration.md` -- API currency, configuration, recommended pattern) or a Class-3 question (migration / deprecation) that the executor's Phase 1 pre-emption did NOT anticipate AND that you cannot resolve from your `[Read, Glob]` tool access alone, emit a structured `<verify_request>` block in addition to the affected `### Findings` entry.
```

And update the schema example on line 153 to show `class="<2|3|2-S>"` instead of `class="2"` so the reviewer knows Class-3 is also valid for the hook.

## Info

### IN-01: Reviewer agent contradicts itself on Class 2-S scope ("security-reviewer only" vs "reviewer agent rarely encounters... but may emit them")

**File:** `plugins/lz-advisor/agents/reviewer.md:162`

**Issue:** The reviewer agent's Class value documentation says:

> Class value: `"2"` for API currency / configuration / recommended pattern questions; `"2-S"` for security currency / CVE / advisory questions (security-reviewer only -- the reviewer agent rarely encounters Class 2-S surfaces but may emit them when a code-quality question has a supply-chain dimension).

The parenthetical "(security-reviewer only ... but may emit them when a code-quality question has a supply-chain dimension)" contradicts itself within the same sentence. If the reviewer "may emit them", it is not "security-reviewer only".

**Fix:** Remove the absolute "security-reviewer only" qualifier and rely on the rare-but-permitted framing:

```diff
-Class value: `"2"` for API currency / configuration / recommended pattern questions; `"2-S"` for security currency / CVE / advisory questions (security-reviewer only -- the reviewer agent rarely encounters Class 2-S surfaces but may emit them when a code-quality question has a supply-chain dimension).
+Class value: `"2"` for API currency / configuration / recommended pattern questions; `"2-S"` for security currency / CVE / advisory questions (primarily security-reviewer surface; the reviewer agent rarely encounters Class 2-S but may emit it when a code-quality question has a supply-chain dimension).
```

---

### IN-02: ToolSearch worked example references `/lz-advisor.plan` in all four SKILL.md files

**File:** `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md:59`, `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md:57`, `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:58` (also present in the canonical plan SKILL.md)

**Issue:** The `<example>` blocks inside `<context_trust_contract>` use `/lz-advisor.plan Address findings in @plans/upstream-review.md` as the worked-example input across all four SKILL.md files. This is intentional byte-identity (the canon block must be identical for the diff-zero invariant), but a reader of `lz-advisor.execute/SKILL.md` sees an example that invokes `/lz-advisor.plan`, which is a different skill. The example is correct from the canonical-block perspective but slightly confusing in-context for readers of the non-plan SKILL files.

This is NOT a defect to fix mechanically -- breaking byte-identity to vary the slug-name per skill would defeat the canon-invariant the smoke fixtures enforce. Documenting the intentional choice (e.g., a one-line comment "Example uses `/lz-advisor.plan` as the canonical agent-generated-source trigger; the rule applies to all four skills uniformly") inside the canonical block would clarify, but it would also bloat the canon.

**Fix:** Optional. Either accept as-is (recommended -- byte-identity > per-skill clarity for canonical blocks) or add a single explanatory sentence inside the canonical block before the first `<example>`:

```
The example below uses `/lz-advisor.plan` as the trigger skill; the rule and example apply identically to lz-advisor.execute, lz-advisor.review, and lz-advisor.security-review when their inputs match the agent-generated-source signal.
```

If applied, this addition must land in all four SKILL.md files in the same byte-identical position to preserve the canon invariant.

---

### IN-03: Density example word-counts are exact at the boundaries (100 and 95) -- consider broader spread for empirical realism

**File:** `plugins/lz-advisor/agents/advisor.md:62-68` (full-context example) and `:70-76` (thin-context example)

**Issue:** The full-context density example is exactly 100 words; the thin-context example is exactly 95 words. The advisor's Output Constraint says "Respond in under 100 words" (line 53) and the surrounding prose calls the 100-word ceiling a "soft cap" and tells the executor "Aim to match the density: every numbered item earns its words". A 100-word example sits exactly on the ceiling -- the soft-cap framing implies the typical advisor output should be <100 words, not at the cap.

This is a calibration nuance, not a defect: the density examples are explicitly labeled "(95-100 words)" so the reader knows they're at the upper boundary. The risk is that the advisor anchor-effects on the 100-word example and routinely emits 99-100 word responses where 80-90 words would be denser.

**Fix:** Optional. Consider adding one shorter example (e.g., 60-70 words) labeled "Density example (terse, 60-70 words)" to anchor the lower end of the budget and reinforce that under-cap is the intent, not the limit. Not load-bearing; the existing examples are correct on the upper boundary.

---

_Reviewed: 2026-05-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
