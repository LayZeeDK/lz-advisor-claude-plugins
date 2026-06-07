---
phase: 12-atomic-grouped-grammar-rewrite
plan: 04
subsystem: release
tags: [version-bump, changelog, phase-atomicity-gate, residue-sweep, red-green-proof, few-shot-drift, sync-02]

# Dependency graph
requires:
  - phase: 12-atomic-grouped-grammar-rewrite
    provides: "12-01 reviewer.md + D-reviewer-budget.sh, 12-02 security-reviewer.md + D-security-reviewer-budget.sh, 12-03 both skill render-verbatim contracts + context-packaging sync -- all on the grouped grammar. This plan validates their combined result and lands the version identity."
provides:
  - "Plugin version 1.0.1 atomically across all 5 surfaces (plugin.json + 4 SKILL.md version: fields); zero surface left at 1.0.0"
  - "README 'What's New' ### 1.0.1 changelog entry describing the grouped spelled-out severity grammar (above the retained ### 1.0.0 entry)"
  - "Phase-atomicity completeness gate PASSED: both budget fixtures GREEN-on-new + RED-on-old + RED-on-self-test (+ security RED-on-[Axx]-missing); zero crit:|imp:|sug:|q: and zero formerly-X residue in plugins/lz-advisor/; AGNT-03 protected behaviors intact; .planning/ frozen history untouched"
affects: [13-empirical-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Atomic 5-surface version bump (SYNC-02): plugin.json version field + 4 SKILL.md version: frontmatter fields move together; README 'What's New' is a separate changelog edit, not the 5th surface (16-phase precedent)"
    - "Phase-atomicity completeness gate (few-shot-drift guard, D-11): both fixtures GREEN-on-new + RED-on-old + cross-surface residue sweep scoped to plugins/lz-advisor/ ONLY proves no half-converted surface survives; .planning/ frozen history excluded (Phase 9 precedent)"
    - "Changelog history references describe the dropped grammar with a PHRASE, not the live shorthand tokens (mirrors the 12-01/12-02 agent convention), so the strict zero-residue grep stays clean"

key-files:
  created:
    - ".planning/phases/12-atomic-grouped-grammar-rewrite/12-04-SUMMARY.md"
  modified:
    - "plugins/lz-advisor/.claude-plugin/plugin.json - version 1.0.0 -> 1.0.1"
    - "plugins/lz-advisor/skills/plan/SKILL.md - version: 1.0.0 -> 1.0.1"
    - "plugins/lz-advisor/skills/execute/SKILL.md - version: 1.0.0 -> 1.0.1"
    - "plugins/lz-advisor/skills/review/SKILL.md - version: 1.0.0 -> 1.0.1"
    - "plugins/lz-advisor/skills/security-review/SKILL.md - version: 1.0.0 -> 1.0.1"
    - "plugins/lz-advisor/README.md - ### 1.0.1 What's New entry added above the retained ### 1.0.0 entry"

key-decisions:
  - "README 'What's New' is a SEPARATE changelog edit, NOT the 5th of the 5 surfaces (5 = plugin.json + 4 SKILL.md version: fields; RESEARCH 5-surface tally clarification + 16-phase precedent)"
  - "The 1.0.1 changelog entry describes the OLD grammar with a phrase ('inline two-letter severity fragment shorthand'), NOT the literal crit:/imp:/sug:/q: tokens, so the phase-atomicity residue sweep over plugins/lz-advisor/ returns zero (the initial wording wrote the live tokens and was reworded -- see Deviations)"
  - "Residue sweep scoped to plugins/lz-advisor/ ONLY; .planning/ frozen history (~362 artifacts) is UNTOUCHED (Phase 9 precedent, T-12-13 accept disposition)"

requirements-completed: [SYNC-02, RPT-01, RPT-02, AGNT-01, SYNC-01]

# Metrics
duration: ~9min
completed: 2026-06-07
---

# Phase 12 Plan 04: Atomic version bump + phase-atomicity completeness gate Summary

**Landed the atomic 5-surface version bump 1.0.0 -> 1.0.1 (plugin.json + 4 SKILL.md version: fields) with a separate README ### 1.0.1 changelog entry, and ran the phase-atomicity completeness gate that closes the atomic unit: both budget fixtures GREEN on the new grouped grammar AND RED on the old shorthand sample, zero crit:/imp:/sug:/q: and zero formerly-X residue across plugins/lz-advisor/, AGNT-03 protected behaviors intact, and the .planning/ frozen history untouched.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-06-07T20:25:19Z
- **Completed:** 2026-06-07T20:34:01Z
- **Tasks:** 2
- **Files modified:** 6 (5 version surfaces + README)

## Accomplishments

- **Atomic 5-surface version bump (SYNC-02):** plugin.json `version` field and the four `SKILL.md` `version:` frontmatter fields (plan/execute/review/security-review) all moved 1.0.0 -> 1.0.1 in one commit. Exactly 5 surfaces carry 1.0.1; zero surface is left at 1.0.0. No split version ships (T-12-11 mitigated).
- **README ### 1.0.1 changelog entry:** added immediately above the retained `### 1.0.0` entry, describing the grouped spelled-out severity grammar (`### Critical` / `### Important` / `### Suggestions` / `### Questions` in fixed order, continuous integer numbering, explicit `(none)` empty markers, OWASP `[Axx]` preserved verbatim, render-verbatim + per-section word-budget gates intact). README "What's New" is a separate changelog edit, NOT the 5th of the 5 surfaces (16-phase precedent / RESEARCH A3).
- **Phase-atomicity completeness gate PASSED** (the few-shot-drift guard's final gate, D-10/D-11):
  - Both fixtures GREEN on the new grammar (reviewer 7 findings / 10 assertions, security 6 findings / 9 assertions, both exit 0).
  - Both fixtures RED on the old shorthand sample (`--from-trace`, 0 findings parsed, anti-vacuous guard fires, exit 1).
  - Both fixtures RED on `--self-test` (zero-finding input trips the guard, exit 1).
  - Security additionally RED on a NEW-grammar-but-`[Axx]`-missing sample (`--from-trace`, 0 findings, exit 1 -- the OWASP bracket assertion is load-bearing).
  - `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` returns NOTHING (zero residue in the plugin tree; T-12-12 mitigated).
  - `git grep -nE 'formerly High|formerly Medium' -- plugins/lz-advisor/` returns NOTHING.
  - The only `crit:|imp:|sug:|q:` hits under `tests/` are the two fixtures' own descriptive history comments (both `#`-prefixed comment lines describing the OLD shorthand sample) -- confirmed programmatically, not live parser tokens.
- **AGNT-03 protected behaviors re-confirmed intact:** `## Class-2 Escalation Hook` (count 1 each agent), `## Hedge Marker Discipline` (count 1 each agent), and all `severity="` values lowercase machine lexicon (`important`, BNF `<critical|important|suggestion>`) across both agents + context-packaging.md. No Title-Case leak.
- **.planning/ frozen history untouched:** `git status --porcelain .planning/` clean; the residue sweep is scoped to `plugins/lz-advisor/` only (Phase 9 precedent, T-12-13 accept).

## Phase-Atomicity Gate Evidence

All commands run from repo root `D:/projects/github/LayZeeDK/lz-advisor-claude-plugins`.

### 1. Both fixtures GREEN on the new grammar
```
$ bash tests/D-reviewer-budget.sh
7 findings parsed
[PASS] anti-vacuous: matched_count 7 >= 5
[PASS] per-finding budget ... (7 findings, all <= 28)
[PASS] Cross-Cutting Patterns budget: 63 <= 160
[PASS] Missed surfaces budget: 17 <= 30
Results: 10/10 passed
Status: [PASS] -- all assertions passed        (exit 0)

$ bash tests/D-security-reviewer-budget.sh
6 findings parsed
[PASS] anti-vacuous: matched_count 6 >= 5
[PASS] per-entry budget ... (incl. CVE carve-out 36 <= 75)
[PASS] threat_patterns budget: 62 <= 160
[PASS] missed_surfaces budget: 10 <= 30
Results: 9/9 passed
Status: [PASS] -- all assertions passed        (exit 0)
```

### 2. Both fixtures RED on the old shorthand sample + self-test
```
$ bash tests/D-reviewer-budget.sh --from-trace <old-reviewer-shorthand>
0 findings parsed
[FAIL] anti-vacuous: only 0 findings parsed (need >= 5)
Status: [FAIL] -- anti-vacuous guard fired     (exit 1)

$ bash tests/D-security-reviewer-budget.sh --from-trace <old-security-shorthand>
0 findings parsed
[FAIL] anti-vacuous: only 0 findings parsed (need >= 5)   (exit 1)

$ bash tests/D-security-reviewer-budget.sh --from-trace <new-grammar-no-[Axx]>
0 findings parsed
[FAIL] anti-vacuous: only 0 findings parsed (need >= 5)   (exit 1)   # bracket assertion load-bearing

$ bash tests/D-reviewer-budget.sh --self-test         -> exit 1 (guard fires, fail-loudly)
$ bash tests/D-security-reviewer-budget.sh --self-test -> exit 1 (guard fires, fail-loudly)
```
Old-shorthand sample shape used: a single `### Findings` header + finding lines `<path>:<line>: crit: <problem>. <fix>.` (no leading `N.`, inline severity) -- matches neither `SEV_HEADERS` nor `FINDING_RE`, so 0 findings parse. Temp sample files were deleted after the proof.

### 3. Cross-surface residue sweep (plugins/lz-advisor/ ONLY)
```
$ git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/        -> (no output; zero residue)
$ git grep -nE 'formerly High|formerly Medium' -- plugins/lz-advisor/ -> (no output)
$ git grep -nE 'crit:|imp:|sug:|q:' -- tests/D-*-budget.sh
  tests/D-reviewer-budget.sh:211:# shorthand sample (`<path>:<line>: crit: ...` ...   (COMMENT)
  tests/D-security-reviewer-budget.sh:199:# shorthand sample (`<path>:<line>: crit: [A02] ...` ...   (COMMENT)
```

### 4. AGNT-03 survival
```
$ git grep -c '^## Class-2 Escalation Hook$' agents/reviewer.md agents/security-reviewer.md  -> 1, 1
$ git grep -c '^## Hedge Marker Discipline$' agents/reviewer.md agents/security-reviewer.md  -> 1, 1
$ git grep -n 'severity="' agents/ references/context-packaging.md  -> only lowercase values
```

### 5. .planning/ untouched
```
$ git status --porcelain .planning/   -> (clean; no uncommitted frozen-history changes)
```

### Consolidated gate line
```
$ bash tests/D-reviewer-budget.sh >/dev/null && bash tests/D-security-reviewer-budget.sh >/dev/null \
  && test "$(git grep -cE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/ | wc -l)" = "0" \
  && test "$(git grep -cE 'formerly High|formerly Medium' -- plugins/lz-advisor/ | wc -l)" = "0" \
  && echo GATE-OK
GATE-OK
```

### Version-identity evidence
```
1.0.1 hits across 5 surfaces: 5    (plugin.json + 4 SKILL.md)
1.0.0 hits across 5 surfaces: 0
README ### 1.0.1: present (1 hit)   README ### 1.0.0: retained below
```

## Task Commits

Each task was committed atomically:

1. **Task 1: Atomic 5-surface version bump 1.0.0 -> 1.0.1 + README ### 1.0.1 changelog entry (SYNC-02)** - `311dc67` (feat)
2. **Task 1 residue fix (Rule 1): reword README 1.0.1 entry to drop live shorthand tokens** - `1e82259` (fix)

Task 2 (phase-atomicity completeness gate) is verification-only and makes no plugin file edits beyond the Rule 1 README fix that the gate itself surfaced; it records the gate evidence above.

## Files Created/Modified

- `plugins/lz-advisor/.claude-plugin/plugin.json` - `version` field 1.0.0 -> 1.0.1.
- `plugins/lz-advisor/skills/{plan,execute,review,security-review}/SKILL.md` - `version:` frontmatter 1.0.0 -> 1.0.1 (the 4 SKILL.md surfaces of the 5-surface tally).
- `plugins/lz-advisor/README.md` - `### 1.0.1` "What's New" entry added above the retained `### 1.0.0` entry; describes the grouped spelled-out severity grammar without writing the live shorthand tokens.

## Decisions Made

- **README "What's New" is a separate changelog edit, not the 5th surface.** The established 16-phase convention (RESEARCH A3, CONTEXT.md:160 flagged for confirmation) is: 5 surfaces = plugin.json + 4 SKILL.md `version:` fields. The README changelog is updated alongside but is not counted in the tally. Confirmed: exactly 5 hits at 1.0.1, README separate.
- **Changelog history reference uses a phrase, not the live shorthand tokens.** The first draft of the 1.0.1 entry wrote the literal `` `crit:`/`imp:`/`sug:`/`q:` `` tokens to describe what was replaced. The phase-atomicity residue sweep (`git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/`) counts that as surviving residue in the plugin tree, which fails the strict zero-residue acceptance criterion. Reworded to "inline two-letter severity fragment shorthand that prefixed each finding line" -- mirroring the exact convention 12-01/12-02 used for the agents' negative references (describe the dropped concept with a phrase, never the shorthand). The entry still names the grouped headlines, `(none)`, and `[Axx]`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Reworded README 1.0.1 entry to remove live shorthand tokens that failed the residue sweep**
- **Found during:** Task 2 (phase-atomicity residue sweep, step 3a)
- **Issue:** Task 1's README `### 1.0.1` entry described the old grammar using the literal `` `crit:`/`imp:`/`sug:`/`q:` `` code-span tokens. The plan's zero-residue acceptance criterion requires `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` to return NOTHING; the README hit (in the plugin tree) violated it. While the README is human-facing documentation (not an agent system prompt that could induce few-shot drift), the gate's literal contract is "zero residue in the plugin tree", and `plugins/lz-advisor/README.md` is in that tree.
- **Fix:** Reworded line 84 to "replacing the prior inline two-letter severity fragment shorthand that prefixed each finding line" -- describing the dropped grammar without the live tokens, exactly as 12-01/12-02 handled the agents' negative references. The entry retains the grouped-headline / `(none)` / `[Axx]` description.
- **Files modified:** plugins/lz-advisor/README.md
- **Verification:** `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` returns nothing; consolidated gate line returns GATE-OK.
- **Committed in:** `1e82259` (fix)

---

**Total deviations:** 1 auto-fixed (1 bug, surfaced by the gate this plan runs).
**Impact on plan:** The fix kept the changelog accurate while satisfying the strict zero-residue gate -- the few-shot-drift guard's whole purpose is to catch surviving shorthand, and it correctly caught my own changelog wording. No scope creep: the edit stayed within the plan-scoped README and changed only the descriptive phrasing.

## Issues Encountered

- **Temp-file path mismatch (Git Bash `/tmp` vs Write tool `/tmp`).** The RED-on-old `--from-trace` proof needs sample files on disk. The Write tool's `/tmp/...` path did not resolve to Git Bash's `/tmp` (which maps to `C:/Users/LarsGyrupBrinkNielse/AppData/Local/Temp`), so the first `--from-trace` runs failed with "No such file or directory" (still exit 1, but for the wrong reason). Resolved by writing the sample files to the Git-Bash-real temp directory via its absolute Windows path; the fixtures then read them and produced the genuine RED (0 findings parsed, anti-vacuous guard fires). Temp files deleted after the proof.

## Threat Model Compliance

- **T-12-11 (Tampering, 5-surface version bump):** Mitigated. Acceptance asserted exactly 5 hits at 1.0.1 and zero at 1.0.0 across plugin.json + 4 SKILL.md -- no split version ships.
- **T-12-12 (Repudiation, few-shot-drift residue / the WR-05 scar):** Mitigated. The cross-surface residue sweep returns zero `crit:|imp:|sug:|q:` and zero `formerly-X` in `plugins/lz-advisor/`; no half-converted surface survives to produce mixed runtime output. (The gate itself caught a residual changelog token -- Deviation 1 -- proving the control works.)
- **T-12-13 (Tampering, .planning/ frozen history):** Accepted per Phase 9 precedent. The sweep is scoped to `plugins/lz-advisor/`; `.planning/` was not modified (`git status --porcelain .planning/` clean).
- **T-12-SC (package installs):** N/A -- this plan installs no packages (pure Markdown/YAML/bash). No legitimacy checkpoint required.

## TDD Gate Compliance

Both tasks are `type="auto"` (not `tdd="true"`). Task 1 is a version-string + changelog edit with no runtime code path. Task 2 is the phase-atomicity completeness gate that RUNS the budget fixtures (the binding regression tests retargeted in 12-01/12-02) in RED/GREEN lockstep -- GREEN-on-new + RED-on-old + RED-on-self-test (+ security RED-on-`[Axx]`-missing) -- but authors no new test. No RED/GREEN commit gate applies to this plan; the proof is the recorded gate evidence above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The atomic unit is COMPLETE: both agents (12-01/12-02), both skill render-verbatim contracts + context-packaging sync (12-03), both fixtures retargeted in lockstep, and the 5-surface version bump (this plan) all ship the grouped spelled-out severity grammar. The phase-atomicity completeness gate passes with zero residue.
- Phase 13 (Empirical verification, GATE-02) can proceed: headless `claude -p /lz-advisor:review` + `/lz-advisor:security-review` against the dedicated worktree (off the `uat/pre-storybook-compodoc` checkpoint branch), capture `--output-format stream-json`, grep the RAW agent text for the four headers + zero shorthand, n>=3 per-section budget measurement (NOT whole-report neutrality assertion, per the 3x-burned trap). Phase 13's fresh sessions load the post-rewrite files directly via `--plugin-dir`; no persisted grammar to migrate.
- No blockers introduced by this plan.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-atomic-grouped-grammar-rewrite/12-04-SUMMARY.md`
- FOUND: commit `311dc67` (Task 1: 5-surface version bump + README changelog)
- FOUND: commit `1e82259` (Task 1 residue fix: README reword)
- FOUND: `plugins/lz-advisor/.claude-plugin/plugin.json` (version 1.0.1)
- FOUND: `plugins/lz-advisor/README.md` (### 1.0.1 entry)
- Gate re-confirmed: 5 surfaces at 1.0.1 / 0 at 1.0.0; both fixtures GREEN; zero crit:/imp:/sug:/q: + zero formerly-X residue in plugins/lz-advisor/; AGNT-03 intact; .planning/ untouched; consolidated gate line returns GATE-OK.

---
*Phase: 12-atomic-grouped-grammar-rewrite*
*Completed: 2026-06-07*
