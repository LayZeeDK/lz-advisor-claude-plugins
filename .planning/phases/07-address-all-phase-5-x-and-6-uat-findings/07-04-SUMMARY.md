---
phase: 07-address-all-phase-5-x-and-6-uat-findings
plan: 04
subsystem: agents+smoke-tests
tags: [word-budget, sub-caps, finding-d, descriptive-prose, anthropic-prose-style, hybrid-pattern, smoke-fixtures, missed-surfaces, parallel-wave-2]

# Dependency graph
requires:
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    plan: 01
    provides: "07-01 lands first per CONTEXT.md D-01 ordering. 07-04 is independent of 07-01 deliverables (no shared files); the dependency is structural ordering only -- 07-04 modifies 3 agent files + creates 3 new smoke fixtures, no overlap with pv-* validation surfaces."
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    plan: 02
    provides: "Hedge Marker Discipline section in 3 agent prompts (advisor / reviewer / security-reviewer); 07-04 preserves this section byte-identically and composes the new word-budget structure additively (descriptive prose at end of Output Constraint, before Density examples in advisor; sub-cap structure + Missed surfaces section in reviewer / security-reviewer Output Constraint)."
  - phase: 05.4-address-uat-findings-a-k
    provides: "Existing smoke-test framework (KCB-economics.sh, DEF-response-structure.sh, HIA-discipline.sh, J-narrative-isolation.sh) and extract-advisor-sd.mjs JSONL extractor. 07-04 reuses the canonical word-budget assertion pattern (sed strip **Critical:** + wc -w) from DEF-response-structure.sh lines 73-74."
  - phase: 05.5-resolve-phase-5-4-uat-test-5-pipeline-findings
    provides: "Density examples in advisor.md (full-context + thin-context, 95-100 words each) from Plan 05.5-03. 07-04 preserves both byte-identically; the new descriptive-prose paragraph references them explicitly as the empirical anchor for the 100w cap."
provides:
  - "Reinforced 100w word-budget for advisor agent via descriptive trigger paragraph + worked example reference (existing Density examples preserved); references D-advisor-budget.sh smoke fixture as regression gate"
  - "Structural sub-caps for reviewer agent: each Findings entry <=80 words, ### Cross-Cutting Patterns <=160 words, ### Missed surfaces (optional) <=30 words, total <=300 words aggregate; descriptive prose anchored in Anthropic Claude 4 system prompt convention"
  - "Structural sub-caps for security-reviewer agent: same shape as reviewer (Findings <=80w / Threat Patterns <=160w / Missed surfaces <=30w / total <=300w); WORST regression among 3 agents (46% on plugin 0.9.0) and strongest reinforcement reason"
  - "New optional ### Missed surfaces (optional) sub-section header in reviewer + security-reviewer Output Constraint (parser-discoverable; <=30 words when present)"
  - "D-advisor-budget.sh smoke fixture asserting advisor SD <=100w on canonical Compodoc + Storybook scenario via /lz-advisor.plan invocation; reuses extract-advisor-sd.mjs JSONL extractor; 77 lines"
  - "D-reviewer-budget.sh smoke fixture parsing reviewer output by section header (### Findings / ### Cross-Cutting Patterns / ### Missed surfaces); per-entry 80w cap via Node ESM script split on numbered-entry regex; section-level + aggregate caps via awk + sed + wc; 113 lines"
  - "D-security-reviewer-budget.sh smoke fixture mirroring D-reviewer-budget.sh shape with ### Threat Patterns and /lz-advisor.security-review invocation; 117 lines"
affects: ["plan-07-06"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hybrid word-budget enforcement (CONTEXT.md D-03): descriptive triggers + worked example + structural sub-caps + per-agent smoke fixtures. Phrasing style is descriptive prose matching Anthropic Claude 4 system prompt convention; ALL-CAPS reserved for safety-critical rules only (existing Common Contract rules 5/5a/5b/5c/5d/6 stay imperative; word-budget joins descriptive layer alongside existing Output Constraint contract)."
    - "Per-agent placement variations distinguish role-specific contracts: advisor reinforces existing 100w cap with reference to D-advisor-budget.sh and the existing Density example anchors (no sub-caps because advisor's single Strategic Direction block already worked in Phase 5.5 D-04). Reviewer + security-reviewer get structural sub-caps because their two-named-section output (Findings + CCP/Threat Patterns) creates the section boundary natural to per-section caps. New ### Missed surfaces (optional) sub-section is parser-discoverable (smoke fixture asserts on the literal header) but optional in usage."
    - "Smoke fixture parse-by-header pattern: D-reviewer-budget.sh and D-security-reviewer-budget.sh use `awk '/^### SectionName/,/^### NextSection|^---|^$/'` to extract section bodies, then `wc -w` for section-level caps; per-entry caps use a Node ESM script written via heredoc to a scratch tempdir splitting on `^\\d+\\.\\s` numbered-entry regex. Aggregate cap counts the entire `### Findings ... ---` span and asserts <=300w. Pattern composes additively with DEF-response-structure.sh F slot section-presence assertions."
    - "Critical-block stripping discipline reused verbatim: D-advisor-budget.sh applies `sed '/^\\*\\*Critical:\\*\\*/,$d' \"$SD_FILE\" | wc -w | tr -d ' '` exactly as in DEF-response-structure.sh lines 73-74. The sed pattern anchors at column 0 to prevent indented matches inside code fences from false-positive-stripping. Phase 5.4 D-15 contract preserved: **Critical:** content is part of advisor response but excluded from budget accounting."
    - "Worsening-regression-strongest-reinforcement principle: per CONTEXT.md, the 3 agents' word-budget overruns rank security-reviewer (46% on 0.9.0, worsening from 37% on 0.8.9) > reviewer (37% on 0.9.0) > advisor (9-21% on 0.9.0). The agent with the worst overrun gets the strongest empirical reinforcement note in its Output Constraint prose -- security-reviewer.md explicitly says 'WORST regression among the 3 agents and the strongest reinforcement reason.'"

key-files:
  created:
    - ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh"
    - ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh"
    - ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh"
  modified:
    - "plugins/lz-advisor/agents/advisor.md"
    - "plugins/lz-advisor/agents/reviewer.md"
    - "plugins/lz-advisor/agents/security-reviewer.md"

key-decisions:
  - "Per-agent placement variations distinguish role-specific contracts. Advisor.md adds a single descriptive paragraph at the END of `## Output Constraint` (after the existing trust-context paragraph, before the existing `### Density example` sub-sections); the paragraph references both Density example blocks as the empirical anchor for the 100w cap and names D-advisor-budget.sh as the regression gate. No sub-caps for advisor (single Strategic Direction block; existing pattern from Phase 5.5 D-04 already worked). Reviewer.md and security-reviewer.md restructure their existing `### Findings` and `### Cross-Cutting Patterns / ### Threat Patterns` budgets into structural sub-caps (each entry <=80w, section <=160w, missed surfaces <=30w, total <=300w aggregate) and add a new optional `### Missed surfaces (optional)` sub-section header that the smoke fixture parses on but the agent emits only when adjacent attack surfaces or code paths warrant attention."
  - "Descriptive prose, not ALL-CAPS imperatives. Per CONTEXT.md D-03 phrasing style: Anthropic Claude 4 system prompt analysis (PromptHub) reserves ALL-CAPS for safety-critical rules ('MUST refuse', 'NEVER reproduce copyrighted material'); descriptive prose for everything else. Word-budget is not safety-critical (3% coding-quality cost from hard-rules layer per Anthropic April 2026 ablation); descriptive triggers + worked example is the Pareto choice. Existing Common Contract rules 5/5a/5b/5c/5d/6 stay imperative; word-budget joins descriptive layer alongside existing Output Constraint."
  - "Smoke fixtures reuse extract-advisor-sd.mjs and DEF-response-structure.sh canonical pattern. D-advisor-budget.sh reuses the existing JSONL extractor (matches Agent tool_use_id with subagent_type lz-advisor:advisor) rather than introducing a new extractor; the canonical word-budget assertion (`sed '/^\\*\\*Critical:\\*\\*/,$d' \"$SD_FILE\" | wc -w | tr -d ' '`) is byte-identical to DEF-response-structure.sh line 74. D-reviewer-budget.sh and D-security-reviewer-budget.sh mirror DEF F slot section-presence pattern (lines 95-105) with awk-based section extraction and per-entry / per-section / aggregate word counts. No new extractor scripts; all parsing via existing Bash + rg + awk + sed + wc + node ESM toolchain."
  - "Per-entry 80w cap via Node ESM script in scratch tempdir. Splitting on numbered-entry regex `/^\\d+\\.\\s/m` requires multiline regex which Bash sed/awk cannot do robustly; node ESM is the simplest portable solution. Script is written inline via `cat > $ENTRY_CHECK_SCRIPT << 'EOF' ... EOF` heredoc into the scratch tempdir (mirrors KCB-economics.sh lines 16-22 fixture-creation pattern). Per CLAUDE.md 'no heredocs for multi-line content' rule: this is the recommended fallback (write to temp file, run with `node`); not an inline `-e` invocation."
  - "Per-fixture failure semantics: ALL fixtures exit 1 on any FAIL=1 trip (sub-cap miss, section absence, parse failure); exit 0 only when every assertion is [OK]. The fixtures print extracted advisor SD / reviewer body / security-reviewer body for debugging on failure (`tail -n 100/200 \"$OUT\"`). Pattern matches DEF-response-structure.sh exit semantics. Behavioral validation deferred to Plan 07-06 UAT replay."

patterns-established:
  - "Three-agent word-budget canon: each agent has a smoke fixture dedicated to its budget structure. D-advisor-budget.sh (100w cap, single SD block), D-reviewer-budget.sh (per-entry 80w + per-section 160w / 30w + aggregate 300w), D-security-reviewer-budget.sh (same as reviewer with Threat Patterns header). The 3 fixtures form a regression-gate triple; future agent additions follow the same per-agent dedicated-fixture pattern."
  - "Optional-section-header pattern (`### Missed surfaces (optional)`): the section header MUST be enumerated in the agent prompt so smoke fixtures can assert on it via parse-by-header (rg `^### Missed surfaces`); the section body is OPTIONAL in usage (agent emits only when adjacent surfaces warrant attention). This composes additively with existing mandatory-header pattern (`### Findings`, `### Cross-Cutting Patterns`, `### Threat Patterns` are MANDATORY -- the parser requires them even when bodies are short)."
  - "Worsening-regression-strongest-reinforcement principle: agents with the worst empirical word-budget overruns get the strongest descriptive-prose reinforcement notes. Security-reviewer (46% on 0.9.0, worsening from 37% on 0.8.9) explicitly carries the 'WORST regression among the 3 agents and the strongest reinforcement reason' note. Reviewer (37%) and advisor (9-21%) carry their respective baselines. Future word-budget regressions update the prose with the new empirical baseline."

requirements-completed: [FIND-D]

# Metrics
duration: approximately 5min
completed: 2026-04-30
---

# Phase 07 Plan 04: word-budget enforcement (FIND-D) Summary

**Landed hybrid word-budget enforcement on all 3 Opus agents using the descriptive-triggers + worked-example + structural-sub-caps pattern (CONTEXT.md D-03), plus 3 dedicated smoke fixtures forming a regression-gate triple. Advisor.md gets a reinforcement paragraph referencing the existing Density examples (Phase 5.5 D-04) and D-advisor-budget.sh; reviewer.md and security-reviewer.md restructure their `## Output Constraint` into per-entry / per-section / aggregate sub-caps with a new optional `### Missed surfaces (optional)` sub-section. Phrasing is descriptive prose matching Anthropic Claude 4 system prompt convention (ALL-CAPS reserved for safety-critical rules only).**

## Performance

- **Duration:** approximately 5 minutes
- **Started:** 2026-04-30 (worktree-agent-a8f3580df8d035a5f, wave 2 parallel)
- **Tasks completed:** 3 of 3 (no checkpoints, no deviations)
- **Files modified:** 3 (3 agent prompts)
- **Files created:** 3 (3 smoke fixtures)
- **Commits:** 3 per-task atomic commits with `--no-verify` (parallel-execution discipline; orchestrator validates hooks once after wave completes)

## What Was Done

### Task 1: Reinforce advisor 100w + add reviewer/security-reviewer structural sub-caps (FIND-D)

Three coordinated edits to the agent prompts, all using descriptive prose (not ALL-CAPS) per CONTEXT.md D-03 phrasing style.

**advisor.md:** Added a single new paragraph at the end of `## Output Constraint` (after the existing trust-context paragraph, before the existing `### Density example (full-context, 95-100 words)` sub-section). The paragraph reinforces the 100-word ceiling as a soft cap intended to keep output strategically dense, references the two existing Density example blocks (Phase 5.5 D-04, preserved byte-identically) as the empirical anchor for what 95-100 words of strategic direction looks like, names the corrective ('compress wording -- reduce explanatory adjectives, collapse two short sentences into one, drop trailing rationale -- rather than drop content'), and names the smoke fixture `D-advisor-budget.sh` as the regression gate. Empirical baseline noted: 'observed overruns of approximately 9-21% on plugin 0.9.0'.

**reviewer.md:** Restructured the `## Output Constraint` section. The opening line gains 'plus an optional Missed-surfaces line.' The `### Findings` Budget line changes from 'Budget: 250 words' to 'Budget: each finding entry <=80 words; up to 5 finding entries; aggregate Findings section <=250 words.' Existing one-paragraph-description note updated from 'approximately 60 words maximum' to 'approximately 60 words maximum within the 80-word entry budget'. New closing sentence: 'The 80-word per-entry cap encourages density: a single finding's analysis should fit on a screen without scrolling.' The `### Cross-Cutting Patterns` Budget line changes from 'Budget: 100 to 150 words' to 'Budget: <=160 words.' New `### Missed surfaces (optional)` sub-section added with prose: 'If you noticed adjacent attack surfaces, code paths, or files outside the scoped findings that warrant attention, add a one-paragraph note <=30 words at the end of your response (after `### Cross-Cutting Patterns`). This slot is optional -- omit when no missed surfaces apply.' The closing total changes from 'approximately 400 words' to '<=300 words aggregate'; closing sentence references `D-reviewer-budget.sh` as the regression gate and notes the 37% empirical baseline on plugin 0.9.0.

**security-reviewer.md:** Mirror of reviewer.md changes, with `### Threat Patterns` instead of `### Cross-Cutting Patterns`. Same `### Missed surfaces (optional)` sub-section added (this time noting 'after `### Threat Patterns`'). Closing prose references `D-security-reviewer-budget.sh` as the regression gate and notes the 46% empirical baseline on plugin 0.9.0 -- 'the worst regression among the 3 agents and the strongest reinforcement.' This is the strongest empirical reinforcement among the 3 agents (worsening pattern: 412w on 0.8.9 -> 438w on 0.9.0).

**Hedge Marker Discipline (07-02) preservation:** All 3 agent prompts retain the `## Hedge Marker Discipline` section added in Plan 07-02 byte-identically. The new word-budget prose composes additively with the existing structure -- new prose lands inside `## Output Constraint`, before the existing Density example sub-sections (advisor) or before the new `### Missed surfaces (optional)` sub-section (reviewer / security-reviewer); Hedge Marker Discipline remains between `## Edge Cases` and `## Boundaries` per Plan 07-02 placement.

**Section-ordering verification:** awk-traced section boundaries confirm preservation:
- advisor.md: `## Output Constraint` (line 51) -> `### Density example (full-context, 95-100 words)` (line 62) -> `### Density example (thin-context, 95-100 words)` (line 70) -> `## Visibility Model` (line 78). Density examples intact.
- reviewer.md: `## Output Constraint` (line 51) -> `### Findings` (line 57) -> `### Cross-Cutting Patterns` (line 71) -> `### Missed surfaces (optional)` (line 77) -> `## Severity Classification` (line 83). New sub-section present.
- security-reviewer.md: `## Output Constraint` (line 52) -> `### Findings` (line 58) -> `### Threat Patterns` (line 73) -> `### Missed surfaces (optional)` (line 79) -> `## OWASP Top 10 Lens` (line 85). New sub-section present.

**Commit:** `91fc26b feat(07-04): add word-budget enforcement to 3 agents (FIND-D)`

### Task 2: D-advisor-budget.sh smoke fixture (FIND-D, advisor side)

Created `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` (77 lines). The fixture:

1. Creates a scratch tempdir with `mktemp -d -t lz-advisor-d-advisor-XXXX` and `trap 'rm -rf "$SCRATCH"' EXIT` (matches existing fixture cleanup pattern from KCB-economics.sh + DEF-response-structure.sh).
2. Seeds a representative `package.json` declaring `@storybook/angular@10.3.5`, `@compodoc/compodoc@1.2.1`, `@angular/core@18.2.0`, `nx@19.0.0` (matches the ngx-smart-components testbed shape from the empirical UAT chain that surfaced Finding D).
3. Invokes `claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" --dangerously-skip-permissions -p "/lz-advisor.plan Set up Compodoc with Storybook in this Nx Angular library so the Docs tab renders descriptions for component inputs and outputs." --verbose --output-format stream-json` against the scratch repo. Prompt shape matches 06-UAT.md Test 8 (advisor SD = 120w on plugin 0.9.0, the empirical baseline).
4. Extracts the advisor Strategic Direction from the JSONL trace using the existing `extract-advisor-sd.mjs` (matches Agent tool_use_id with subagent_type `lz-advisor:advisor`). No new extractor script.
5. Asserts `WC <= 100` after stripping the `**Critical:**` block (`sed '/^\*\*Critical:\*\*/,$d' "$SD_FILE" | wc -w | tr -d ' '`) -- byte-identical to DEF-response-structure.sh line 74. Prints `[OK]` on pass, `[ERROR]` on fail; tails the JSONL trace on failure.
6. Exit 0 on cap enforcement, exit 1 on regression. ASCII-only output markers.

**Commit:** `153dd80 test(07-04): add D-advisor-budget.sh smoke fixture (FIND-D)`

### Task 3: D-reviewer-budget.sh + D-security-reviewer-budget.sh smoke fixtures (FIND-D, review/security-review side)

Created two parallel fixtures in `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/` (113 lines + 117 lines).

**D-reviewer-budget.sh:**

1. Scratch tempdir + trap-on-EXIT cleanup (same pattern as Task 2).
2. Seeds `review-src/handler.ts` (unvalidated `JSON.parse(req.body)` handler -- mirrors DEF-response-structure.sh F slot fixture verbatim) + `review-src/validate.ts` (trivial null check); commits to provide a real change for the reviewer to scan.
3. Invokes `claude ... -p "/lz-advisor.review Review the last commit." --verbose` (no stream-json -- the reviewer agent's final response is the user-visible text, not an intermediate tool_result, mirroring DEF F slot pattern).
4. Section-presence check via `rg -q "^### Findings"` and `rg -q "^### Cross-Cutting Patterns"` (rejects output missing the named slots).
5. Findings body extraction via `awk '/^### Findings/,/^### Cross-Cutting Patterns/' "$OUT" | sed '1d;$d'` (extract between the section headers, drop header rows).
6. Per-entry 80w cap via inline Node ESM script written to scratch tempdir via `cat > "$ENTRY_CHECK_SCRIPT" << 'EOF' ... EOF` heredoc. The script reads the Findings body, splits on `/^\d+\.\s/m` numbered-entry regex, counts words per entry, and exits non-zero if any entry exceeds 80w. Per CLAUDE.md 'no heredocs for multi-line content' rule: this is the recommended fallback (write to temp file, run with `node`); not an inline `-e` invocation.
7. CCP body extraction via `awk '/^### Cross-Cutting Patterns/,/^### Missed surfaces|^---|^$/' "$OUT" | sed '1d'`; word-count via `wc -w | tr -d ' '`; assert <=160w.
8. Optional Missed surfaces section: presence check via `rg -q "^### Missed surfaces"`; if present, body extraction via `awk` + word count; assert <=30w. If absent, prints `[OK] Missed surfaces: section absent (optional)` and continues (no failure).
9. Aggregate cap: full body extraction from `### Findings` to end-of-output (or `^---` separator); word count; assert <=300w.
10. Exit 0 only when ALL caps enforced. ASCII-only output markers. No `| grep` usage (CLAUDE.md content-search rule); only `awk + rg + sed + wc + node`.

**D-security-reviewer-budget.sh:** Identical structure with these substitutions:
- `### Cross-Cutting Patterns` -> `### Threat Patterns` (in section-presence check, awk extraction, body-file naming, output messages)
- `/lz-advisor.review` -> `/lz-advisor.security-review`
- Header comment renames `Finding D (reviewer side)` -> `Finding D (security-reviewer side)`
- Empirical baseline note updates: 'observed 412 words on plugin 0.8.9, 438 words on plugin 0.9.0 (46% over 300w cap) -- WORST regression among the 3 agents and the strongest reinforcement reason.'

All other logic (per-entry 80w cap, named section 160w cap, missed surfaces 30w cap, aggregate 300w cap, scratch fixture, claude -p invocation, output parsing, exit semantics) is byte-identical to D-reviewer-budget.sh.

**Commit:** `abb8a7d test(07-04): add D-reviewer + D-security-reviewer budget fixtures (FIND-D)`

## Verification

### Per-task verification

All 3 tasks pass their automated `<verify>` and `<acceptance_criteria>` blocks:

- **Task 1:**
  - `git grep -c -F "smoke fixture \`D-advisor-budget.sh\`" plugins/lz-advisor/agents/advisor.md` returns 1
  - `git grep -c -F "D-advisor-budget.sh" plugins/lz-advisor/agents/advisor.md` returns 1
  - `git grep -c -F "### Density example (full-context, 95-100 words)" plugins/lz-advisor/agents/advisor.md` returns 1 (Phase 5.5 D-04 preserved)
  - `git grep -c -F "### Density example (thin-context, 95-100 words)" plugins/lz-advisor/agents/advisor.md` returns 1 (Phase 5.5 D-04 preserved)
  - `git grep -c -F "each finding entry <=80 words" plugins/lz-advisor/agents/reviewer.md` returns 1 (sub-cap landed)
  - `git grep -c -F "Budget: <=160 words" plugins/lz-advisor/agents/reviewer.md` returns 1
  - `git grep -c -F "### Missed surfaces (optional)" plugins/lz-advisor/agents/reviewer.md` returns 1 (new sub-section)
  - `git grep -c -F "<=300 words aggregate" plugins/lz-advisor/agents/reviewer.md` returns 1
  - `git grep -c -F "D-reviewer-budget.sh" plugins/lz-advisor/agents/reviewer.md` returns 1
  - `git grep -c -F "### Cross-Cutting Patterns" plugins/lz-advisor/agents/reviewer.md` returns 5 (existing references preserved)
  - All same-shape checks pass for security-reviewer.md (Threat Patterns 5; Findings 80w cap; 160w cap; Missed surfaces; 300w aggregate; D-security-reviewer-budget.sh reference)
  - `git grep -c -F "## Hedge Marker Discipline"` returns 1 across all 3 agents (07-02 preservation confirmed)

- **Task 2:**
  - `test -f .../D-advisor-budget.sh` exits 0
  - `bash -n .../D-advisor-budget.sh` exits 0 (syntax valid)
  - Plan-skill invocation: `git grep -c -F "claude --model sonnet --effort medium --plugin-dir" .../D-advisor-budget.sh` returns 1
  - Stream-json output: `git grep -c -F -- "--output-format stream-json" .../D-advisor-budget.sh` returns 1
  - Reuses extract-advisor-sd.mjs: `git grep -c -F "extract-advisor-sd.mjs" .../D-advisor-budget.sh` returns 1
  - 100w cap assertion present (verified via direct rg of the WC -le 100 expression)
  - Critical block strip pattern present (verified via direct rg of `sed '/^\\*\\*Critical:\\*\\*/,$d'`)
  - No `| grep` violations: 0 matches

- **Task 3:**
  - Both files exist: `test -f .../D-reviewer-budget.sh && test -f .../D-security-reviewer-budget.sh` exits 0
  - Both pass `bash -n` (syntax valid)
  - D-reviewer-budget.sh invokes review skill: `git grep -c -F "/lz-advisor.review Review the last commit." .../D-reviewer-budget.sh` returns 1
  - D-security-reviewer-budget.sh invokes security-review skill: `git grep -c -F "/lz-advisor.security-review Review the last commit." .../D-security-reviewer-budget.sh` returns 1
  - D-reviewer-budget.sh references Cross-Cutting Patterns: 8 occurrences (header comment, awk pattern, output messages)
  - D-security-reviewer-budget.sh references Threat Patterns: 9 occurrences
  - Both fixtures contain per-entry 80w cap: `wc > 80` matches in Node ESM script (1 each)
  - Both fixtures contain section caps: `<=160` (4 each), `<=30` (7 each), `<=300` (4 each)
  - No `| grep` violations: 0 matches in either fixture

### Plan-level verification

| Check | Result |
|-------|--------|
| All 3 fixtures present and `bash -n` valid | 3/3 |
| All 3 agent prompts contain word-budget enforcement | 3/3 |
| Hedge Marker Discipline (07-02) preserved across 3 agents | 3/3 |
| Density examples (Phase 5.5 D-04) preserved in advisor.md | 2/2 (full-context + thin-context) |
| Section ordering preserved across 3 agents | 3/3 (verified via awk line-number trace) |
| Descriptive prose phrasing (no new ALL-CAPS imperatives) | confirmed via visual review |
| End-to-end smoke verification on plugin 0.10.0 | Deferred to Plan 07-06 |

### Threat register closure

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-04-01 (-- not security; cost discipline) | mitigate | Closed structurally: descriptive sub-cap prose lands in 3 agent prompts (Task 1) + 3 smoke fixtures land as regression gate (Tasks 2 + 3). Behavioral confirmation via Plan 07-06 UAT replay. |
| T-07-04-02 (low; `--dangerously-skip-permissions` in fixtures) | accept | Inherits Phase 5.4 fixture-pattern precedent (KCB-economics.sh, DEF-response-structure.sh). Scratch repos isolated via `mktemp -d` + trap-on-EXIT cleanup; no persistent side effects. |

### Wave 2 parallel-execution discipline

This plan ran as a parallel worktree agent (wave 2 with 07-02, 07-03; depends on 07-01). The `<worktree_branch_check>` step detected the worktree was at the older bootstrap commit `c797c16` and reset to the expected base `c1d4872` (post 07-01 + 07-02 + 07-03 commits). Soft reset showed inverted staged changes (HEAD was older than expected base); hard reset to `c1d4872` was correct because no uncommitted work existed in this worktree at session start. After hard reset, all 07-01 / 07-02 / 07-03 deliverables are present and the agent files include Hedge Marker Discipline from 07-02 verbatim. Per-task commits use `--no-verify` per parallel-execution discipline; orchestrator validates hooks once after wave merges.

## Deviations from Plan

None -- plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered, no Rule 4 architectural questions raised, no authentication gates encountered.

The worktree branch base correction (soft-then-hard reset to pick up 07-01/02/03 commits that landed on main while this worktree branch was based on the older bootstrap commit) is environmental setup per the `<worktree_branch_check>` instructions, not a plan deviation.

## Known Stubs

None. All edits ship complete prose; no placeholder text, no TODO/FIXME markers introduced. The literal `D-advisor-budget.sh`, `D-reviewer-budget.sh`, `D-security-reviewer-budget.sh` filename references in the new prose are smoke-fixture path tokens that the smoke fixtures themselves implement (Tasks 2 + 3); they are documented contract anchors, not stubs.

## Followups

- **Plan 07-06:** Comprehensive multi-hop chain UAT replay on plugin 0.10.0. The 3 D-* smoke fixtures from this plan must run green AND observed word counts from the UAT replay must satisfy the per-agent caps. Per CONTEXT.md D-03 closure criterion: 'all three smoke fixtures green on plugin 0.10.0 + observed word counts in Phase 7 Plan 07-06 UAT replay <=cap (no agent exceeds its cap on representative inputs).'
- **DEF-response-structure.sh extension (deferred per CONTEXT.md):** Plan 07-04 ships dedicated D-* fixtures rather than extending DEF-response-structure.sh with sub-cap assertions. The dedicated-fixture-per-agent pattern is more discoverable and easier to extend than nested assertions in DEF; if a future agent (e.g., a hypothetical fourth specialized agent) is added, the per-agent-fixture pattern provides clean extension. DEF stays as the integrated output-shape gate.
- **Phase 8 hard-rules layer escalation:** If the 0.10.0 cycle confirms the descriptive sub-cap prose is insufficient (e.g., observed UAT word counts still exceed caps), Phase 8 may escalate to a hard-rules layer (option 4 in original CONTEXT.md D-03 framing). Anthropic's April 2026 ablation showed ~3% coding-quality cost from hard-rules layer; this is the deferred fallback only if hybrid is empirically insufficient.

## Self-Check: PASSED

Verified all claims:

- File `plugins/lz-advisor/agents/advisor.md` exists and contains:
  - `D-advisor-budget.sh` reference (count: 1, smoke fixture path token in new prose)
  - Existing `### Density example (full-context, 95-100 words)` (count: 1) -- preserved from Phase 5.5 D-04
  - Existing `### Density example (thin-context, 95-100 words)` (count: 1) -- preserved from Phase 5.5 D-04
  - Existing `## Hedge Marker Discipline` (count: 1) -- preserved from Plan 07-02
- File `plugins/lz-advisor/agents/reviewer.md` exists and contains:
  - `each finding entry <=80 words` (count: 1) -- new sub-cap prose
  - `Budget: <=160 words` (count: 1) -- new sub-cap prose
  - `### Missed surfaces (optional)` (count: 1) -- new optional sub-section
  - `<=300 words aggregate` (count: 1) -- new aggregate cap prose
  - `D-reviewer-budget.sh` (count: 1) -- smoke fixture reference
  - Existing `### Cross-Cutting Patterns` (count: 5) -- preserved
  - Existing `## Hedge Marker Discipline` (count: 1) -- preserved from Plan 07-02
- File `plugins/lz-advisor/agents/security-reviewer.md` exists and contains:
  - `each finding entry <=80 words` (count: 1) -- new sub-cap prose
  - `Budget: <=160 words` (count: 1) -- new sub-cap prose
  - `### Missed surfaces (optional)` (count: 1) -- new optional sub-section
  - `D-security-reviewer-budget.sh` (count: 1) -- smoke fixture reference
  - Existing `### Threat Patterns` (count: 5) -- preserved
  - Existing `## Hedge Marker Discipline` (count: 1) -- preserved from Plan 07-02
- File `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` exists, passes `bash -n`, and contains:
  - `claude --model sonnet --effort medium --plugin-dir` invocation (1)
  - `--output-format stream-json` flag (1)
  - `extract-advisor-sd.mjs` extractor reference (1)
  - 100w cap assertion `if [ "$WC" -le 100 ]` (verified via direct rg)
  - Critical-block strip `sed '/^\*\*Critical:\*\*/,$d'` (verified via direct rg)
  - No `| grep` (0)
- File `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` exists, passes `bash -n`, and contains:
  - `/lz-advisor.review Review the last commit.` invocation (1)
  - `Cross-Cutting Patterns` references (8)
  - `wc > 80` per-entry cap assertion in Node ESM script (1)
  - `<=160` (4), `<=30` (7), `<=300` (4) sub-cap literals
  - No `| grep` (0)
- File `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` exists, passes `bash -n`, and contains:
  - `/lz-advisor.security-review Review the last commit.` invocation (1)
  - `Threat Patterns` references (9)
  - `wc > 80` per-entry cap assertion in Node ESM script (1)
  - `<=160` (4), `<=30` (7), `<=300` (4) sub-cap literals
  - No `| grep` (0)
- Commit `91fc26b` exists in `git log` (Task 1)
- Commit `153dd80` exists in `git log` (Task 2)
- Commit `abb8a7d` exists in `git log` (Task 3)
