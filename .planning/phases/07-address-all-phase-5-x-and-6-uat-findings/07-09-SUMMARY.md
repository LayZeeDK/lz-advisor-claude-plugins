---
phase: 07
plan: 09
subsystem: lz-advisor reviewer + security-reviewer agent prompts + smoke fixtures + plugin metadata
tags: [gap-closure, word-budget, reviewer, security-reviewer, fragment-grammar, effort-calibration]
requires:
  - plans: [07-04, 07-07, 07-08]
  - files:
      - plugins/lz-advisor/agents/reviewer.md
      - plugins/lz-advisor/agents/security-reviewer.md
      - plugins/lz-advisor/.claude-plugin/plugin.json
      - .planning/REQUIREMENTS.md
      - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md
      - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md
      - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh
      - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh
provides:
  - GAP-D-budget-empirical structurally CLOSED at contract + smoke fixture + version layers
  - Fragment-grammar emit template (`<file>:<line>: <severity>: <problem>. <fix>.`) with ASCII severity prefixes
  - Effort de-escalation reviewer/security-reviewer xhigh -> medium with binding 15% Class-1 recall reversion criterion
  - Plugin version 0.12.0 across 5 surfaces
affects:
  - lz-advisor.review skill behavior (reviewer agent output shape + effort)
  - lz-advisor.security-review skill behavior (security-reviewer agent output shape + effort + OWASP tag)
  - D-reviewer-budget.sh + D-security-reviewer-budget.sh smoke fixture parsers
tech-stack:
  added: []
  patterns:
    - "Fragment-grammar emit template (caveman-review pattern adapted to ASCII)"
    - "Effort calibration per Anthropic Best Practices Calibrating effort and thinking depth"
    - "DROP/KEEP positive-framing-by-omission lists per Anthropic Best Practices"
    - "Holistic worked example demonstrating aggregate cap is structurally reachable"
    - "Backward-compat LEGACY_RE fallback for transitional shape during gap-closure"
key-files:
  created: []
  modified:
    - plugins/lz-advisor/agents/reviewer.md
    - plugins/lz-advisor/agents/security-reviewer.md
    - plugins/lz-advisor/.claude-plugin/plugin.json
    - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
    - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
    - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
    - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md
    - .planning/REQUIREMENTS.md
decisions:
  - "Replace Plan 07-04 descriptive sub-cap prose with fragment-grammar emit template (Candidate A): empirically-validated by caveman benchmarks (65% mean output reduction across 10 prompts x 3 trials on Sonnet 4 + Opus 4.6)"
  - "De-escalate reviewer + security-reviewer effort xhigh -> medium (Candidate B): per Anthropic Best Practices for synthesis-of-packaged-findings tasks"
  - "Preserve advisor effort: high (control case; 88w empirical baseline already passes)"
  - "Backward-compat LEGACY_RE fallback in smoke fixtures: prevents spurious failures during transitional gap-closure period"
  - "Plugin SemVer minor bump 0.11.0 -> 0.12.0: matches Phase 7 precedent (0.10.0 -> 0.11.0 minor for Plan 07-07 ToolSearch rewrite)"
  - "BINDING reversion criterion: <=15% Class-1 recall drop on empirical UAT replay; otherwise revert effort to xhigh and use Candidate A alone"
metrics:
  duration: ~30 minutes
  tasks_completed: 4
  files_modified: 12
  commits: 4
  completed: 2026-05-02
---

# Phase 07 Plan 09: Gap closure for FIND-D word-budget regression Summary

Closed FIND-D word-budget regression by replacing Plan 07-04's descriptive sub-cap prose with a fragment-grammar emit template (`<file>:<line>: <severity>: <problem>. <fix>.`) and de-escalating reviewer + security-reviewer effort from xhigh to medium, with paired smoke fixture parser updates and plugin version bump 0.12.0.

## What This Plan Did

Plan 07-09 closes the 3 failed gaps from `07-UAT.md` (reviewer 396w / 32% over, security-reviewer 414w / 38% over, security-reviewer Missed surfaces 33w / 10% over) on plugin 0.11.0. Plan 07-04 landed structural sub-cap PROSE; empirical measurement after the smoke-fixture extraction repair in commit `0065425` confirmed prose alone does not bind output length on Sonnet 4.6 / Opus 4.7 with `effort: xhigh`. Plan 07-04's per-section caps (5x80w + 160w + 30w = 590w upper bound) were mathematically incompatible with the 300w aggregate.

The fix composes two structural changes per `07-RESEARCH-WORDBUDGET.md` ranked recommendation:

1. **Candidate A (Fragment-Grammar Output Template)** -- the descriptive sub-cap prose in `agents/reviewer.md` and `agents/security-reviewer.md` `## Output Constraint` sections is replaced with an explicit one-line-per-finding output template modeled on the empirically-validated caveman-review pattern. Each finding emits as `<file>:<line>: <severity>: <problem>. <fix>.` with ASCII severity prefixes (`crit:` / `imp:` / `sug:` / `q:`). Plus explicit DROP list (concrete phrases to omit) + KEEP list (concrete content to preserve) + 3 worked example pairs (verbose INCORRECT vs fragment-grammar CORRECT) + holistic worked example (~296w aggregate) demonstrating the 300w cap is structurally reachable.

2. **Candidate B (Effort De-escalation)** -- reviewer + security-reviewer frontmatter changes from `effort: xhigh` to `effort: medium` per Anthropic Best Practices "Calibrating effort and thinking depth" guidance. CONTEXT.md D-04 amends with a 2026-05-02 amendment block + binding reversion criterion (15% Class-1 recall drop on empirical UAT replay).

Plus smoke-fixture parser updates for the new fragment-grammar shape (per-line word target <=20w / <=22w; outlier soft cap 25w / 28w; backward-compat LEGACY_RE fallback for transitional Plan 07-04 shape) + plugin version bump 0.11.0 -> 0.12.0 across 5 surfaces (plugin.json + 4 SKILL.md frontmatter) + REQUIREMENTS.md GAP-D-budget-empirical row + 07-VERIFICATION.md amendment marking GAP-D-budget-empirical CLOSED structurally.

## Tasks Completed

### Task 1: Rewrite reviewer.md + security-reviewer.md Output Constraint with fragment-grammar emit template (commit `00638bd`)

- Replaced Plan 07-04 descriptive sub-cap prose (lines 51-81 reviewer / 52-83 security-reviewer) with fragment-grammar emit template
- Added ASCII severity prefixes (crit / imp / sug / q) mapped to existing Severity Classification
- Added explicit DROP list (concrete phrases-to-omit) + KEEP list (concrete content-to-preserve)
- Added 3 worked example pairs each (verbose INCORRECT vs fragment-grammar CORRECT)
- Added holistic worked example (~296w aggregate) demonstrating 7 findings + Cross-Cutting Patterns / Threat Patterns + Missed surfaces fitting under 300w
- security-reviewer added OWASP tag slot `[A0N]` + Class 2-S auto-clarity carve-out for CVE / advisory findings
- Preserved all existing sections byte-identically: Severity Classification, Class-2 Escalation Hook, Hedge Marker Discipline, OWASP Top 10 Lens, Boundaries, Context Trust Contract, Edge Cases
- Preserved `<verify_request>` block emission as per-finding-line trailing pattern
- Preserved `Unresolved hedge:` literal frame as `<fix>` clause when correctness-affecting

### Task 2: De-escalate reviewer + security-reviewer effort xhigh -> medium + CONTEXT.md D-04 amendment (commit `74929e1`)

- reviewer.md frontmatter `effort: xhigh` -> `effort: medium`
- security-reviewer.md frontmatter `effort: xhigh` -> `effort: medium`
- advisor.md `effort: high` UNCHANGED (control case; 88w empirical baseline passes)
- Updated Context Trust Contract prose mentions of `effort: xhigh` to `effort: medium` for consistency with frontmatter
- 07-CONTEXT.md: appended D-04 amendment 2026-05-02 with:
  - Trigger (3 failed gaps from 07-UAT.md)
  - Anthropic Best Practices anchor (Calibrating effort and thinking depth)
  - April 23, 2026 postmortem anchor (Opus 4.7 verbose at xhigh by design)
  - Binding reversion criterion (<=15% Class-1 recall drop on empirical UAT replay)
  - Composition with Candidate A relationship
- Original D-04 Option 1 + Option 2 reviewer web-tool design preserved verbatim

### Task 3: Update D-reviewer-budget.sh + D-security-reviewer-budget.sh fragment-grammar parser (commit `5787a3c`)

- Replaced ENTRY_CHECK_SCRIPT heredoc with fragment-grammar parser
- Per-line word target: <=20w (reviewer) / <=22w (security-reviewer with OWASP tag)
- Outlier soft cap: 25w / 28w respectively
- Backward-compat LEGACY_RE fallback handles Plan 07-04 numbered-section transitional shape with `[WARN]` signaling preferred fragment shape
- Aggregate <=300w assertion PRESERVED BYTE-IDENTICALLY (load-bearing gate that closes the gap)
- CCP / Threat Patterns <=160w + Missed surfaces <=30w + section-presence assertions PRESERVED
- bash -n passes on both fixtures
- ASCII-only

### Task 4: Plugin version bump 0.12.0 + REQUIREMENTS.md + 07-VERIFICATION.md amendment (commit `24e80c6`)

- plugin.json + 4 SKILL.md frontmatter version: 0.11.0 -> 0.12.0 (5 surfaces total)
- REQUIREMENTS.md gained GAP-D-budget-empirical row in Gap-Closure Requirements (Phase 7) section
- REQUIREMENTS.md added traceability row + updated coverage 41 -> 42
- 07-VERIFICATION.md: appended Amendment 2026-05-02 marking GAP-D-budget-empirical CLOSED structurally with:
  - 12-row structural verification table
  - Closure mechanism citing Candidate A + Candidate B with anchors
  - Smoke fixture parser update summary
  - Empirical verification deferred section with binding 15% Class-1 recall reversion criterion
  - Phase 7 sealing readiness updated: PASS-with-residual ready (Gap 1 + Gap 2 + GAP-D-budget-empirical all closed)

## Verification

Per-task automated verify blocks all pass:

- Task 1: 9 path-anchored fragment-grammar assertions pass; ASCII byte check passes; preserved sections (Severity Classification, Class-2 Escalation Hook, Hedge Marker Discipline, OWASP Top 10 Lens, etc.) byte-identical
- Task 2: effort frontmatter changed in both reviewer + security-reviewer; advisor unchanged (control); CONTEXT.md amendment block present with all required citations
- Task 3: bash -n passes on both fixtures; fragment-grammar regex + backward-compat LEGACY_RE present; aggregate <=300w + CCP/TP <=160w + Missed surfaces <=30w assertions preserved byte-identically
- Task 4: 5 plugin surfaces at 0.12.0 with zero remnants of 0.11.0; REQUIREMENTS.md GAP-D-budget-empirical row + traceability + coverage updated; 07-VERIFICATION.md amendment present with all required content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated `effort: xhigh` prose references to `effort: medium` in Context Trust Contract sections**

- **Found during:** Task 2
- **Issue:** Plan acceptance criterion line 666 mandates `git grep -c -F "effort: xhigh" plugins/lz-advisor/agents/reviewer.md` returns 0 (zero remaining occurrences after de-escalation). However, the plan's `<action>` text only specified frontmatter changes, not prose changes. Inside `## Context Trust Contract` sections, both reviewer.md (line 189) and security-reviewer.md (line 199) had prose mentions: `Your \`effort: xhigh\` budget permits...`. After only changing the frontmatter, `effort: xhigh` count remained at 1 in each file, violating the acceptance criterion.
- **Fix:** Updated the prose mentions to `Your \`effort: medium\` budget permits...` in both files, restoring consistency between frontmatter and prose. The acceptance criterion `effort: xhigh = 0` is now satisfied. Side effect: `effort: medium` count is now 2 per file (frontmatter + prose) instead of the 1 the criterion expected, but this represents the consistent and correct end state.
- **Files modified:** plugins/lz-advisor/agents/reviewer.md, plugins/lz-advisor/agents/security-reviewer.md
- **Commit:** 74929e1

**2. [Rule 1 - Documented Acceptance-Criterion Discrepancy] `### Missed surfaces (optional)` count is 2 in reviewer.md, not 1**

- **Found during:** Task 1 verification
- **Issue:** Plan acceptance criterion line 537 expects `git grep -c -F "### Missed surfaces (optional)"` to return 1. Actual count is 2: one inside the holistic worked example block (line 140, inside `>` blockquote), and one as the actual section header (line 152). The plan REQUIRES the holistic example to demonstrate the full output structure including the Missed surfaces header.
- **Fix:** No code change needed. The holistic example legitimately requires the header to appear inside the quoted demonstration. The structural intent (preserve the `### Missed surfaces (optional)` header in the actual section) is satisfied. Documenting as an acceptance-criterion observation, not a deviation requiring action.
- **Files modified:** None (no fix required)
- **Commit:** N/A

**3. [Rule 1 - Documented Acceptance-Criterion Discrepancy] `Fragment-grammar shape detected` count is 2 in D-reviewer-budget.sh, not 1**

- **Found during:** Task 3 verification
- **Issue:** Plan acceptance criterion line 873 expects `git grep -c -F "Fragment-grammar shape detected" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` returns 1. Actual count is 2: one in the comment line (`// Fragment-grammar shape detected (Plan 07-09 contract).`) and one in the console.log line (`console.log(\`[INFO] Fragment-grammar shape detected: ...\`)`). Both are the literal phrase from the plan's action text.
- **Fix:** No code change. The criterion `>=1` is satisfied; count of 2 reflects the comment + log structure both using the canonical phrase. Documenting as observation only.
- **Files modified:** None
- **Commit:** N/A

### Worktree Setup Note

Initial worktree HEAD was 99741b0 (older base), expected base was 38a8ec3. Per worktree_branch_check guidance, `git reset --soft 38a8ec37bdf345fcac5da23825f4a395817d8d79` reset to the correct base. The reset surfaced staged changes (ROADMAP.md, STATE.md, 07-UAT.md begin-phase markers from the orchestrator) and "deleted" status for 07-09-PLAN.md + 07-RESEARCH-WORDBUDGET.md (which were already at HEAD post-reset). Restored the PLAN/RESEARCH files from HEAD; unstaged the orchestrator-owned ROADMAP/STATE/UAT changes (preserving them in the working tree but excluding from task commits per the "orchestrator owns those writes" instruction).

## Threat Model Compliance

Per Plan 07-09 `<threat_model>` section, 4 STRIDE threats with `mitigate` (3) + `accept` (1) dispositions:

| Threat ID | Mitigation Surface | Status |
|-----------|---------------------|--------|
| T-07-09-01 (Information Disclosure / Tampering: silent truncation) | Soft per-finding word target (20w/22w with 25w/28w outlier safety) + DROP/KEEP lists + auto-clarity carve-out for security findings + binding empirical recall gate | LANDED |
| T-07-09-02 (DoS via silent quality degradation at medium effort) | CONTEXT.md D-04 amendment 2026-05-02 binding reversion criterion (<=15% Class-1 recall drop) | LANDED (deferred empirical verification) |
| T-07-09-03 (smoke fixture vacuous pass on transitional shape) | Backward-compat LEGACY_RE fallback + 4 distinct word-budget assertions per fixture | LANDED |
| T-07-09-04 (cost-cliff at borderline recall drop) | Accepted as design intent; 15% threshold is the binding line | DOCUMENTED |

No new tool grants. No new attack surface. `<verify_request>` Class-2 hook + `Unresolved hedge:` frame composition preserved.

## Self-Check: PASSED

All 12 modified files exist and contain expected content; all 4 commits exist in git log:

- `00638bd`: feat(07-09): rewrite reviewer + security-reviewer Output Constraint with fragment-grammar emit template
- `74929e1`: feat(07-09): de-escalate reviewer + security-reviewer effort xhigh -> medium per CONTEXT.md D-04 amendment 2026-05-02
- `5787a3c`: feat(07-09): update D-reviewer + D-security-reviewer fixtures for fragment-grammar shape
- `24e80c6`: feat(07-09): plugin 0.11.0 -> 0.12.0 + GAP-D-budget-empirical CLOSED amendment + REQUIREMENTS row

Files:
- `plugins/lz-advisor/agents/reviewer.md`: FOUND (fragment-grammar template + effort: medium frontmatter)
- `plugins/lz-advisor/agents/security-reviewer.md`: FOUND (fragment-grammar template with OWASP + effort: medium frontmatter + Class 2-S auto-clarity)
- `plugins/lz-advisor/agents/advisor.md`: UNCHANGED (control)
- `plugins/lz-advisor/.claude-plugin/plugin.json`: FOUND ("version": "0.12.0")
- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md`: FOUND (version: 0.12.0)
- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md`: FOUND (version: 0.12.0)
- `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md`: FOUND (version: 0.12.0)
- `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md`: FOUND (version: 0.12.0)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh`: FOUND (fragment-grammar parser; bash -n passes)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh`: FOUND (fragment-grammar parser with OWASP; bash -n passes)
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md`: FOUND (D-04 amendment 2026-05-02 block)
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md`: FOUND (Amendment 2026-05-02 GAP-D-budget-empirical CLOSED)
- `.planning/REQUIREMENTS.md`: FOUND (GAP-D-budget-empirical row + traceability + coverage 42)
