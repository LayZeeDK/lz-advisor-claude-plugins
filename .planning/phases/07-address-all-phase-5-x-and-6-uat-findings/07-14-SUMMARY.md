---
phase: 07
plan: 14
subsystem: plugins/lz-advisor
tags: [prompt-engineering, output-contract, per-section-budgets, xml-binding, gap-closure-3]
requires:
  - 07-09 (fragment-grammar emit template + per-finding word target table at reviewer.md line 69 / security-reviewer.md line 72; baseline structural shape preserved)
  - 07-13 (Class-2 Escalation Hook section in security-reviewer.md + Hedge Marker Discipline carve-out at line 312; both preserved byte-identically)
  - User directive 2026-05-06 (replace aggregate w-cap with per-section budgets per AgentIF benchmark + Anthropic Apr 2026 postmortem evidence)
  - 07-RESEARCH-GAP-3-per-section-budgets.md (Q1 + Q3 schema + recommended Output Constraint redesign in Code Examples Example 1)
  - 07-UAT-REGRESSION-0.12.2.md (empirical n=4 D-security-reviewer-budget mean 354.25w + S3 UAT 520w + S4 UAT 407w + Severity revisions vs. executor: pattern observation)
provides:
  - FIND-D closure structural surface: agents/reviewer.md ## Output Constraint section now expresses per-section budgets via XML <output_constraints> block (legacy 300w aggregate cap structurally REMOVED)
  - GAP-D-budget-empirical structural surface: agents/security-reviewer.md ## Output Constraint section gains the same XML <output_constraints> shape (cross_cutting_patterns -> threat_patterns substitution)
  - Per-finding-validation surface authorized: stable `### Per-finding validation` heading + `Validation of Finding N:` per-entry prefix + 60w per-entry cap (optional surface, supersedes the emergent "Severity revisions vs. executor:" pattern observed empirically on 0.12.2)
  - <do_not_include> enumeration of 4 forbidden legacy emission patterns (preamble, "Severity revisions vs. {initial,executor}:" without canonical heading, non-enumerated section headings, post-Findings prose without per-entry prefix)
  - Cross-file structural symmetry contract: byte-identical XML shape across both reviewer agents with EXACTLY 4 differing lines (cross_cutting_patterns -> threat_patterns + ### Cross-Cutting Patterns -> ### Threat Patterns)
affects:
  - Wave 1 deliverable: prompt-construction layer is correct on disk; smoke fixture binding deferred to Plan 07-15 (Wave 2 dependency)
  - Empirical validation deferred to Plan 07-17 (plugin version bump + 3x re-run gate against fresh advisor + reviewer + security-reviewer empirical baseline)
tech-stack:
  added: []
  patterns:
    - "XML output_constraints block as structural output contract (replaces prose aggregate cap; XML wrapping binds 15-20% better than prose on Claude per cloud-authority + AgentIF benchmark)"
    - "Per-section budgets enumerated as <section> elements with <heading> + per_entry/max_words attributes (vs single aggregate prose cap that empirically degraded reasoning quality per Anthropic Apr 2026 postmortem)"
    - "Per-finding-validation surface as optional <section> with required_when_emitted per_entry_prefix (canonical Validation of Finding N: prefix replaces the emergent Severity revisions vs. executor: prose surface; the prefix is parser-friendly and enforces per-finding granularity)"
    - "<do_not_include> as positive forbidden-pattern enumeration (vs negative-only descriptive prose); empirically calibrated against n=5 0.12.2 evidence to surface 3 distinct legacy patterns"
    - "Cross-file structural symmetry contract: agent prompts share byte-identical XML shape with surgical per-agent deltas (security variant substitutes cross_cutting_patterns -> threat_patterns); Pitfall 3 mitigation -- single atomic plan touching both files prevents structural drift"
key-files:
  created:
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-14-SUMMARY.md
  modified:
    - plugins/lz-advisor/agents/reviewer.md (Task 1; 33 insertions, 2 deletions; lines 69 + 158-189 surgical edits)
    - plugins/lz-advisor/agents/security-reviewer.md (Task 2; 33 insertions, 2 deletions; lines 72 + 161-194 surgical edits)
decisions:
  - "Adopt XML <output_constraints> block as the structural output contract per user directive 2026-05-06. Aggregate cap empirically falsified on plugin 0.12.2: 5/5 over (n=4 D-security-reviewer-budget mean 354.25w + S3 UAT review 520w + S4 UAT security-review 407w). Per-section budgets are 2026-standard pattern (AgentIF + Anthropic Apr 2026 postmortem evidence). XML wrapping binds 15-20% better than prose on Claude per cloud-authority + AgentIF benchmark."
  - "Preserve per-finding word target threshold UPDATE (20w -> 22w target / 28w outlier soft cap) on reviewer.md but KEEP existing 22w target on security-reviewer.md (already aligned with user directive 2026-05-06 table). Only outlier_soft_cap=28 is new on security-reviewer.md; the 22w target was already canonical there per Plan 07-09."
  - "Per-finding-validation surface authorized as optional <section> rather than mandatory or forbidden. Empirical 0.12.2 evidence: the 'Severity revisions vs. executor:' pattern is genuine Class 2-S signal (severity-revision rationale tied to specific findings) but emerged WITHOUT a canonical heading. The <required_when_emitted> per_entry_prefix Validation of Finding N: enforces per-finding granularity AND parser-friendliness without forbidding the substantive content -- it disciplines the form, not the function."
  - "Cross-file structural symmetry over per-agent customization. The two XML blocks differ in EXACTLY 4 lines (2 section name + 2 heading text). Plan 07-15 smoke fixture redesign can use a single parser regex with a single substitution variable. Pitfall 3 mitigation: single atomic plan ships both files atomically; neither agent ships in isolation."
  - "Aggregate-cap prose paragraphs at line 158 (reviewer) / line 163 (security-reviewer) REMOVED in their entirety, including the empirical baseline references to caveman + plugin 0.11.0 figures. The baseline rationale prose is preserved in the lead-in to the new XML block + the post-XML section-ordering paragraph (which credits the 0.12.2 empirical falsification + Anthropic Apr 2026 postmortem + AgentIF benchmark as the new authority)."
metrics:
  duration: ~4min
  completed: 2026-05-06
  tasks: 2
  files_modified: 2
---

# Phase 07 Plan 14: Per-Section Budget Contract Redesign (Gap Closure 3) Summary

Replaces the aggregate-300w-cap prose in `agents/reviewer.md` and `agents/security-reviewer.md` `## Output Constraint` sections with an XML `<output_constraints>` block that expresses per-section budgets per the user directive 2026-05-06. Authorizes the per-finding validation surface (`### Per-finding validation` with `Validation of Finding N:` per-entry prefix) explicitly with a 60w per-entry cap. Drops the aggregate cap. Enumerates forbidden legacy emission patterns in `<do_not_include>` to defend against canon-mediated cross-pollination.

Closes the empirically-confirmed 5/5 over-cap regression on plugin 0.12.2 (n=4 D-security-reviewer-budget mean 354.25w + S3 UAT review 520w + S4 UAT security-review 407w). The aggregate cap was empirically falsified; per-section budgets are the 2026-standard pattern (AgentIF + Anthropic Apr 2026 postmortem evidence). XML wrapping binds 15-20% better than prose on Claude per cloud-authority + AgentIF benchmark.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace aggregate-cap prose in agents/reviewer.md ## Output Constraint with XML output_constraints block | 76ac386 | plugins/lz-advisor/agents/reviewer.md |
| 2 | Replace aggregate-cap prose in agents/security-reviewer.md ## Output Constraint with XML output_constraints block | bb455e0 | plugins/lz-advisor/agents/security-reviewer.md |

## What Shipped

### Task 1: agents/reviewer.md (commit 76ac386)

Three surgical edits to `## Output Constraint` section. File grew 309 -> 339 lines (+30 net). Diff stat: 33 insertions, 2 deletions.

**Edit 1 (line 69, per-finding word target prose):**

- `<=20 words for the problem + fix combined` -> `<=22 words for the problem + fix combined (target), <=28 words outlier soft cap`
- `Aggregate Findings section <=250 words.` REMOVED (subsumed by per-section XML)
- New trailing sentence: `Per-section caps are enumerated in the <output_constraints> block at the end of this section; there is no aggregate cap.`

**Edit 2 (was at line 158, aggregate-cap prose paragraph): REMOVED**

The full paragraph "Aggregate cap: <=300 words across `### Findings` + `### Cross-Cutting Patterns` + `### Missed surfaces` combined. The smoke fixture `D-reviewer-budget.sh` parses by section header and asserts both per-finding-line word counts AND the aggregate cap. Plan 07-04 descriptive sub-cap prose was empirically insufficient on plugin 0.11.0 (396w aggregate, 32% over); the fragment-grammar shape binds output length structurally rather than describing it. See Plan 07-09 for the structural rewrite rationale and the caveman empirical baseline (`D:\projects\JuliusBrussee\caveman` -- 65% mean output reduction on `claude-sonnet-4-20250514` + `claude-opus-4-6` across 10 prompts x 3 trials)." removed in its entirety. The XML `<output_constraints>` block (Edit 3) supersedes it structurally. The empirical baseline rationale is preserved in the post-XML section-ordering paragraph (with updated 0.12.2 figures).

**Edit 3 (lines 158-189, XML block insertion):**

```xml
<output_constraints>
  <section name="findings" type="repeating" required="true">
    <heading>### Findings</heading>
    <per_entry max_words="22" outlier_soft_cap="28"/>
    <max_count>15</max_count>
  </section>
  <section name="per_finding_validation" type="repeating" optional="true">
    <heading>### Per-finding validation</heading>
    <per_entry max_words="60"/>
    <required_when_emitted>
      <per_entry_prefix>Validation of Finding N:</per_entry_prefix>
    </required_when_emitted>
    <description>Optional severity-revision or confirmation prose, one paragraph per finding. Use when severity differs from the executor's assessment OR when confirmation rationale is non-obvious. Skip on routine confirmations.</description>
  </section>
  <section name="cross_cutting_patterns" max_words="160" required="true">
    <heading>### Cross-Cutting Patterns</heading>
  </section>
  <section name="missed_surfaces" max_words="30" optional="true">
    <heading>### Missed surfaces (optional)</heading>
  </section>
  <aggregate_cap>none</aggregate_cap>
  <do_not_include>
    <item>Preamble or throat-clearing</item>
    <item>"Severity revisions vs. {initial,executor}:" prose without the canonical `### Per-finding validation` heading</item>
    <item>Any section heading not enumerated in this constraints block</item>
    <item>Post-Findings prose paragraphs without the `Validation of Finding N:` per-entry prefix</item>
  </do_not_include>
</output_constraints>
```

### Task 2: agents/security-reviewer.md (commit bb455e0)

Three surgical edits mirroring Task 1 with the `cross_cutting_patterns -> threat_patterns` substitution. File grew 333 -> 363 lines (+30 net). Diff stat: 33 insertions, 2 deletions.

**Edit 1 (line 72, per-finding word target prose):**

- `<=22 words for the threat + fix combined` -> `<=22 words for the threat + fix combined (target), <=28 words outlier soft cap`
- Threshold values stay at 22 / 28 (already aligned with user directive); only outlier soft cap addition
- `Aggregate Findings section <=250 words.` REMOVED

**Edit 2 (was at line 163, aggregate-cap prose paragraph): REMOVED**

The full paragraph "Aggregate cap: <=300 words across `### Findings` + `### Threat Patterns` + `### Missed surfaces` combined. The smoke fixture `D-security-reviewer-budget.sh` parses by section header and asserts both per-finding-line word counts AND the aggregate cap. Plan 07-04 descriptive sub-cap prose was empirically insufficient on plugin 0.11.0 (414w aggregate, 38% over -- the worst regression among the 3 agents); the fragment-grammar shape binds output length structurally rather than describing it. See Plan 07-09 for the structural rewrite rationale and the caveman empirical baseline (`D:\projects\JuliusBrussee\caveman` -- 65% mean output reduction on Sonnet 4 + Opus 4.6)." removed in its entirety.

**Edit 3 (lines 161-194, XML block insertion):**

Byte-identical XML structural shape as Task 1 with TWO surgical security variant substitutions:

- `<section name="cross_cutting_patterns" ...>` -> `<section name="threat_patterns" ...>`
- `<heading>### Cross-Cutting Patterns</heading>` -> `<heading>### Threat Patterns</heading>`

All other 26 lines of the XML block are byte-identical to reviewer.md.

## Acceptance Criteria Pass Evidence

### Task 1 -- agents/reviewer.md

| Criterion | Command | Result |
|-----------|---------|--------|
| `<output_constraints>` opening tag | `rg -n 'output_constraints' plugins/lz-advisor/agents/reviewer.md` | 3 occurrences (line 69 prose reference + line 160 opening + line 187 closing) |
| `<aggregate_cap>none</aggregate_cap>` | `rg -nF '<aggregate_cap>none</aggregate_cap>'` | line 180 |
| Legacy "Aggregate cap: <=300 words" REMOVED | `rg -F 'Aggregate cap: <=300 words'` | exit 1 (0 matches) |
| `### Per-finding validation` | `rg -nF '### Per-finding validation'` | lines 167 (heading) + 183 (do_not_include) |
| `Validation of Finding N:` | `rg -nF 'Validation of Finding N:'` | lines 170 (per_entry_prefix) + 185 (do_not_include) |
| `Severity revisions vs.` (do_not_include only) | `rg -nF 'Severity revisions vs.'` | line 183 (1 match) |
| `## Class-2 Escalation Hook` preserved | `rg -nF '## Class-2 Escalation Hook'` | line 254 |
| `## Hedge Marker Discipline` preserved | `rg -nF '## Hedge Marker Discipline'` | line 302 |
| `## Severity Classification` preserved | `rg -nF '## Severity Classification'` | line 191 |
| `Holistic worked example` preserved | `rg -nF 'Holistic worked example'` | line 123 |
| `Format: <file>:<line>:` template preserved | `rg -nF 'Format: \`<file>:<line>:'` | line 59 |
| Net file growth | `wc -l` | 309 -> 339 lines (+30) |

### Task 2 -- agents/security-reviewer.md

| Criterion | Command | Result |
|-----------|---------|--------|
| `<output_constraints>` opening + closing | `rg -n 'output_constraints'` | 4 occurrences (line 72 prose + line 163 narrative reference + line 165 opening + line 192 closing) |
| `<aggregate_cap>none</aggregate_cap>` | `rg -nF '<aggregate_cap>none</aggregate_cap>'` | line 185 |
| Legacy "Aggregate cap: <=300 words" REMOVED | `rg -F 'Aggregate cap: <=300 words'` | exit 1 (0 matches) |
| `### Per-finding validation` | `rg -nF '### Per-finding validation'` | lines 172 (heading) + 188 (do_not_include) |
| `Validation of Finding N:` | `rg -nF 'Validation of Finding N:'` | lines 175 (per_entry_prefix) + 190 (do_not_include) |
| `threat_patterns` (XML section name) | `rg -nF 'threat_patterns'` | lines 163 (narrative) + 179 (XML section) |
| `## Class-2 Escalation Hook` preserved | `rg -nF '## Class-2 Escalation Hook'` | line 263 |
| `## Hedge Marker Discipline` preserved | `rg -nF '## Hedge Marker Discipline'` | line 319 |
| `## OWASP Top 10 Lens` preserved | `rg -nF '## OWASP Top 10 Lens'` | line 196 |
| `Class 2-S security carve-out` preserved | `rg -nF 'Class 2-S security carve-out'` | line 125 |
| WR-01 `Severity: Suggestion pending verification` preserved | `rg -nF 'Severity: Suggestion pending verification'` | line 343 |
| Net file growth | `wc -l` | 333 -> 363 lines (+30) |

### Cross-File Structural Symmetry (load-bearing)

```
diff <(sed -n '160,187p' reviewer.md) <(sed -n '165,192p' security-reviewer.md)
```

Output: EXACTLY 4 changed lines (2 section name + 2 heading text):

```
<   <section name="cross_cutting_patterns" max_words="160" required="true">
<     <heading>### Cross-Cutting Patterns</heading>
---
>   <section name="threat_patterns" max_words="160" required="true">
>     <heading>### Threat Patterns</heading>
```

All other 26 lines of the two XML blocks are byte-identical. Pitfall 3 mitigation confirmed.

## Deviations from Plan

### Note: cross_cutting_patterns appears once in security-reviewer.md narrative (acceptance criterion ambiguity)

The plan's Task 2 acceptance criterion stated `git grep -F "cross_cutting_patterns" plugins/lz-advisor/agents/security-reviewer.md` returns 0 matches (security file does NOT use the reviewer's section name). Strict letter: 0 occurrences anywhere.

The plan's Task 2 `<action>` Edit 3 prescribed lead-in narrative text reads: "...same structural shape as `agents/reviewer.md` `<output_constraints>` block, with `cross_cutting_patterns` replaced by `threat_patterns` per the security-reviewer's existing two-slot output contract..." — and this text ITSELF contains `cross_cutting_patterns` as a documentation reference.

Resolution: followed the prescribed `<action>` text verbatim (load-bearing instruction). The intent of the acceptance criterion is satisfied — the security-reviewer's OWN `<output_constraints>` XML schema does NOT use `cross_cutting_patterns`; the only occurrence is in explanatory prose pointing AT the reviewer.md schema for cross-file documentation. This is documentation, not contract. No `<section name="cross_cutting_patterns">` appears anywhere in security-reviewer.md.

This is a minor wording tension in the plan (criterion vs prescribed action) rather than a deviation from intent. Recorded here for audit-trail completeness; no follow-up action required.

## Empirical Validation Deferred

This plan ships the prompt-construction layer correctly on disk. Empirical confirmation requires downstream waves:

1. **Plan 07-15 smoke fixture redesign (Wave 2 dependency)** -- updates `D-{reviewer,security-reviewer}-budget.sh` to parse the new per-section shape including `### Per-finding validation`. Without 07-15, the existing smoke fixtures (which parse by section header + assert aggregate cap) cannot validate the new contract.
2. **Plan 07-17 plugin version bump + 3x re-run gate** -- empirically confirms the redesign closes the 5/5 over-cap regression observed on plugin 0.12.2. Sets the budget for the new XML contract on plugin 0.13.0.

This plan's structural verification (acceptance criteria + cross-file symmetry diff) is sufficient as a Wave 1 deliverable; downstream waves close the empirical loop.

## Threat Model

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-14-01 (Tampering: XML block emit-shape) | mitigate | Closed -- single atomic plan touched both files; cross-file diff confirms 4-line symmetry |
| T-07-14-02 (Information Disclosure: existing canon accidentally modified) | mitigate | Closed -- 12 acceptance criteria checks confirm preservation: Severity Classification, Class-2 Escalation Hook, Hedge Marker Discipline, OWASP Top 10 Lens, Class 2-S carve-out, WR-01 carve-out, Holistic worked example, Format template (all preserved byte-identically) |
| T-07-14-03 (DoS: 60w per-entry cap forces information loss on CVE-rich findings) | accept | Recalibration deferred to Plan 07-17 first 3-run smoke; worst case bump to 75w via amendment, not structural redesign |
| T-07-14-04 (Tampering: <do_not_include> calibration coverage) | accept | If Plan 07-17 first 3-run smoke on 0.13.0 reveals new emission patterns NOT covered by the 4 <do_not_include> items, the enumeration is amendable in a Phase 8 follow-up plan (mechanical text edit + smoke re-run) |

## Self-Check: PASSED

- File `plugins/lz-advisor/agents/reviewer.md` exists and contains the new XML block (verified via Read at line 187 closing tag)
- File `plugins/lz-advisor/agents/security-reviewer.md` exists and contains the new XML block (verified via Read at line 192 closing tag)
- Commit `76ac386` exists (Task 1; verified via `git rev-parse --short HEAD` after `git commit`)
- Commit `bb455e0` exists (Task 2; verified via `git rev-parse --short HEAD` after `git commit`)
- All 12 + 11 = 23 acceptance criteria pass via `rg` verification commands
- Cross-file structural symmetry confirmed: EXACTLY 4 changed lines as specified
