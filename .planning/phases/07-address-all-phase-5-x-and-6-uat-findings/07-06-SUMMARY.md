---
phase: 07-address-all-phase-5-x-and-6-uat-findings
plan: 06
subsystem: verification
tags: [verification, uat-replay, smoke-gate, plugin-version-bump, 06-verification-amendment-6, gap-g1-g2-empirical-closure, phase-7-closure]

# Dependency graph
requires:
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    provides:
      - Plan 07-01 (Rule 5b pv-* validation + ToolSearch supplement) -- empirical anchor for the synthesis layer
      - Plan 07-02 (verify-before-commit + hedge marker discipline + silent-resolve sub-pattern) -- discipline E.1 + E.2 + Finding A
      - Plan 07-03 (4 confidence-laundering guards + scope-disambiguated provenance markers) -- Finding C
      - Plan 07-04 (word-budget structural sub-caps + 3 D-*-budget smoke fixtures) -- Finding D
      - Plan 07-05 (reviewer Class-2 escalation hook Option 1 + Option 2) -- Finding F
provides:
  - Plugin 0.10.0 version bump (5 surfaces: plugin.json + 4 SKILL.md frontmatter)
  - E-verify-before-commit.sh smoke fixture (3-path OR-assertion: hedge-flag OR verify-trailer OR wip-commit)
  - Phase 7 UAT replay infrastructure copy from Phase 6 + tally.mjs extended with verified_trailer_count + wip_commit_count
  - 8-session UAT replay execution against plugin 0.10.0 on ngx-smart-components testbed
  - 06-VERIFICATION.md amendment 6 (PASS-with-residual; GAP-G1+G2-empirical CLOSED)
affects: ["phase-6-verification-amendment-6", "phase-7-closure", "phase-8-candidates"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Verification-stage layered closure: structural change (Plan 07-01..07-05) + smoke fixture (E-verify-before-commit.sh + B-pv-validation.sh + 3 D-*-budget) + multi-session UAT replay + cross-skill chain test on canonical Compodoc+Storybook scenario. Each layer rejects different empirical failure modes."
    - "Cross-axis verdict scope inheritance: when plan-fixes / execute-fixes consume a security-review file, the downstream output's verdict scope inherits the input axis (security-threats) rather than defaulting to api-correctness. Empirically confirmed across plan + execute (sessions 7 + 8)."
    - "Final-advisor Critical block as load-bearing surface: caught verification gaps the plan didn't include in 2 of 8 sessions (sessions 5 + 8). Validates that final advisor consultation remains valuable even on small tasks."

key-files:
  created:
    - ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh"
    - ".planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/runners/run-all.sh"
    - ".planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/runners/run-session.sh"
    - ".planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/runners/tally.mjs"
    - ".planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/session-notes.md"
    - ".planning/phases/07-address-all-phase-5-x-and-6-uat-findings/smoke-results/extract-uat-transcript.mjs"
    - ".planning/phases/07-address-all-phase-5-x-and-6-uat-findings/smoke-results/{B-pv-validation,D-advisor-budget,D-reviewer-budget,D-security-reviewer-budget,DEF-response-structure,E-verify-before-commit,HIA-discipline,J-narrative-isolation,KCB-economics}.log"
    - ".planning/phases/07-address-all-phase-5-x-and-6-uat-findings/smoke-results/uat-{plan,execute,review,plan-fixes,execute-fixes,security-review,plan-fixes-2,execute-fixes-2}-transcript.txt"
  modified:
    - "plugins/lz-advisor/.claude-plugin/plugin.json"
    - "plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.review/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md"
    - ".planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md"

key-decisions:
  - "UAT replay scenario: version-agnostic Compodoc + Storybook + Angular signals prompt (per memory `project_compodoc_uat_initial_plan_prompt.md`). Forces Pattern D web-first ranking + Plan 07-01 pv-* synthesis discipline + Plan 07-03 version-qualifier anchoring to fire organically without prompt-side priming."
  - "8-session chain (plan -> execute -> review -> plan-fixes -> execute-fixes -> security-review -> plan-fixes-2 -> execute-fixes-2) covers full cross-skill workflow including BOTH plan-fixes UATs (review-driven AND security-driven). Tests Plan 07-02 silent-resolve sub-pattern in both axes."
  - "06-VERIFICATION.md amendment 6 verdict: PARTIAL -> PASS-with-residual (NOT PASS). Plan 07-01 ToolSearch precondition fired correctly in 2 of 8 sessions but was bypassed in 6 of 8 -- the rule is structurally landed but empirically operates inconsistently. The closure of GAP-G1+G2-empirical is real (sessions 1 + 3 demonstrate the synthesis layer working as designed) but the rule's literal text needs strengthening for reliable cross-session firing. Amendment 6 captures this nuance rather than forcing PASS."
  - "Smoke gate verdict: 6 of 9 fixtures PASS (all 5 NEW Phase 7 fixtures pass). 3 failures classified: 2 confirmed false-flags (HIA stale assertion on string deliberately removed in 0.8.4; KCB structural-form on a session that produced a correct outcome) + 1 word-budget residual (DEF advisor 110w in code-dense scenario). Smoke gate is GREEN for Phase 7's new fixtures; legacy failures are pre-existing and outside Phase 7's scope to fix."
  - "Phase 8 candidates: 22 surfaced across the 8-session chain. Strongest is P8-03 (Pre-Verified Contradiction Rule) -- the advisor reframed reviewer/plan claims as fact in 2 of 8 sessions without flagging the reframing. Recommended as the highest-priority Phase 8 finding. Other notable candidates: P8-12 (auto-detect plan-fixes plan from review file path; partial cause of session 5 input mismatch), P8-13 (cost-cliff allowance language ambiguity for wip-discipline), P8-17 (codify threat-model context as required pre-consult prompt section for security-review)."
---

# Plan 07-06 Summary -- Verification Stage + UAT Replay + Amendment 6

## Goal

Land the verification stage of Phase 7: plugin version bump 0.9.0 -> 0.10.0 (5 surfaces), 1 new comprehensive smoke fixture (E-verify-before-commit.sh exercising the multi-hop chain), UAT replay infrastructure (copied from Phase 6 + extended), UAT replay subset execution against plugin 0.10.0, and 06-VERIFICATION.md amendment 6 (PASS-with-residual once Plan 07-01 verification passes).

## Outcome

**Plan 07-06 COMPLETE.** All 5 tasks executed:

| Task | Status | Commits / Artifacts |
|------|--------|---------------------|
| 1: Plugin version bump 0.9.0 -> 0.10.0 (5 surfaces) | DONE | `27bd95f` -- plugin.json + 4 SKILL.md frontmatter |
| 2: E-verify-before-commit.sh smoke fixture (3-path OR-assertion) | DONE | `b58ff94` -- 134 lines, bash -n valid, all 3 paths labeled |
| 3: UAT replay infrastructure copy + tally.mjs extension | DONE | `56ec124` -- 3 runner files + tally.mjs with verified_trailer_count + wip_commit_count |
| 4: UAT replay subset execution + manual review | DONE | 8-session chain on plugin 0.10.0 against ngx-smart-components testbed; full evidence in `uat-replay/session-notes.md` |
| 5: 06-VERIFICATION.md amendment 6 | DONE | Amendment appended; status: PARTIAL -> PASS-with-residual |

**Phase 7 verdict:** PASS-with-residual

## What was built

### Task 1: Version bump 0.9.0 -> 0.10.0 (commit `27bd95f`)

5 surfaces bumped byte-identically:

- `plugins/lz-advisor/.claude-plugin/plugin.json` (`"version": "0.10.0"`)
- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` (frontmatter `version: 0.10.0`)
- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` (frontmatter `version: 0.10.0`)
- `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` (frontmatter `version: 0.10.0`)
- `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (frontmatter `version: 0.10.0`)

SemVer minor bump per CONTEXT.md D-06 (Phase 7 introduces new contract-shape additions: Rule 5b pv-validation, hedge marker discipline, scope markers, structural sub-caps, verify_request hook).

### Task 2: E-verify-before-commit.sh smoke fixture (commit `b58ff94`)

134-line fixture exercising the multi-hop chain via synthesized hedge-marker plan + explicit Run/Verify directives + invoking the execute skill on a scratch repo. Three-path OR-assertion:

- **Path (a) Hedge-flag:** Advisor's Strategic Direction contains literal `Unresolved hedge:` frame
- **Path (b) Verify-trailer:** Commit body has `Verified:` trailer AND JSONL trace contains tool_use event for verification command
- **Path (c) WIP-commit:** Commit subject starts with `wip:` AND body has `## Outstanding Verification` section

Per Plan 07-02 cost-cliff allowance, AT LEAST ONE path must satisfy. On smoke-gate run against plugin 0.10.0: path (b) satisfied with 2 Verified: trailers + 4 Bash tool_use events. PASS.

### Task 3: UAT replay infrastructure (commit `56ec124`)

Three files at `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/runners/`:

- `run-all.sh` -- orchestrates run-session.sh for all session prompts in `prompts/`
- `run-session.sh` -- single `claude -p` invocation with `--output-format stream-json` + tee to JSONL
- `tally.mjs` -- aggregates per-session metrics. Extends Phase 6 baseline with two NEW columns: `verified_trailer_count` (parses JSONL for `git commit -m "...Verified:..."` patterns) and `wip_commit_count` (parses for `wip:` subject prefix)

### Task 4: 8-session UAT replay (executed manually by the user across the chain)

| # | Skill | Session ID | Output / Commit |
|---|-------|-----------|-----------------|
| 1 | lz-advisor.plan | `f2d669f3-...` | `plans/compodoc-storybook-setup.plan.md` |
| 2 | lz-advisor.execute | `6276171a-...` | `eb9107f` (wip:) + `8c25c9e` (fix:) |
| 3 | lz-advisor.review | `a1503efa-...` | review output rendered to user |
| 4 | lz-advisor.plan (plan-fixes against review) | `0d55118f-...` | `plans/address-compodoc-storybook-review-findings.plan.md` |
| 5 | lz-advisor.execute (execute-fixes) | `29db446f-...` | `06af4cf` (fix:) + `f1c8ccd` (fix:) |
| 6 | lz-advisor.security-review | `2b5f3ae5-...` | review output rendered to user |
| 7 | lz-advisor.plan (plan-fixes-2 against security findings) | `bfa913fa-...` | `plans/address-security-review-findings.plan.md` |
| 8 | lz-advisor.execute (execute-fixes-2) | `b614d3dd-...` | `15d8fac` (fix(deps): atomic) |

### Task 5: 06-VERIFICATION.md amendment 6

Appended at end of `06-VERIFICATION.md`. Status: PARTIAL -> PASS-with-residual. Cites Plan 07-01 + Plan 07-06 UAT replay as the empirical closure mechanism for GAP-G1+G2-empirical. Captures 9 residuals (5 major + 4 minor) and 22 Phase 8 candidates.

## Smoke gate state on plugin 0.10.0

| Fixture | Status | Note |
|---------|--------|------|
| B-pv-validation.sh | PASS | All 4 assertions: XML format + synthesis count + no self-anchor + source-grounded evidence |
| D-advisor-budget.sh | PASS | 71w / 100w cap on advisor SD |
| D-reviewer-budget.sh | PASS | All sub-caps enforced |
| D-security-reviewer-budget.sh | PASS | All sub-caps enforced |
| E-verify-before-commit.sh | PASS | Path (b) verify-trailer satisfied |
| J-narrative-isolation.sh | PASS | session.ts scanned despite plan narrative |
| KCB-economics.sh | FAIL | Confirmed false-flag (structural-form gap on a session that produced correct outcome) |
| HIA-discipline.sh | FAIL | Confirmed obsolete (asserts on string removed in 0.8.4) |
| DEF-response-structure.sh | FAIL (1 of 6) | Word-budget assertion: advisor 110w / 100w cap (same-class regression as Phase 7 word-budget residual) |

**Net:** 6 PASS, 3 FAIL. All 5 NEW Phase 7 fixtures (B-pv, D-*, E-verify) PASS on plugin 0.10.0. The 3 failures are 2 confirmed false-flags + 1 word-budget residual.

## Phase 7 empirical closure scorecard

### Closures (capture in amendment 6)

1. **GAP-G1+G2-empirical CLOSED at synthesis layer** -- Plan 07-01 ToolSearch precondition empirically fired in sessions 1 + 3 (FIRST empirical confirmations across 8+ UAT cycles since Phase 5). pv-* synthesis with source-grounded evidence in sessions 1, 3, 6 (9 conformant blocks total).
2. **Confidence-laundering chain BROKEN across api-correctness AND security-threats axes.**
3. **Plan 07-02 verify-before-commit discipline** firing across sessions 2, 5, 8 with progressive correctness (session 8 first-try conformant).
4. **Plan 07-02 Hedge Marker Discipline** working end-to-end across 6 of 8 sessions (canonical frames + executor empirical resolution).
5. **Plan 07-02 Silent-resolve sub-pattern CLOSED in BOTH plan-fixes UATs** (sessions 4 + 7).
6. **Plan 07-05 Option 1 + Option 2 in tandem** -- pre-emptive Class-2/2-S scan + reviewer accept-pv-* anchor (sessions 3 + 6); zero verify_request escalations.
7. **Plan 07-03 Cross-axis verdict scope inheritance** -- sessions 7 + 8 inherited `scope: security-threats` from session 6 review file (FIRST empirical instance, robust across 2 skills).
8. **Final advisor Critical block as load-bearing surface** -- caught plan gaps in sessions 5 + 8 (dependsOn wiring; package-lock.json integrity field).

### Residuals (capture in amendment 6 with severity)

5 MAJOR recurring/structural + 4 MINOR. See amendment 6 for full evidence.

### Phase 8 candidates (22 total)

P8-01 through P8-22. Strongest: P8-03 (Pre-Verified Contradiction Rule) with two empirical instances (sessions 2 + 7). Documented in `uat-replay/session-notes.md` with hypothesis sketches for each candidate.

## Risks / Notes

- **Plan 07-01 ToolSearch precondition rule needs strengthening for Phase 8** -- the rule fired in 2 of 8 sessions; literal text reading does not hold empirically across 6 sessions (sessions 2, 4, 5, 6, 7, 8 all bypassed). Possible remediation: convert from precondition to default-on Phase 1 action when input contains agent-generated source material, regardless of question class.

- **Plan 07-02 wip-discipline language needs disambiguation** -- 2 of 8 sessions shipped non-wip commits with populated `## Outstanding Verification` sections (per-commit interpretation). Session 8 got it right (no Outstanding Verification, no wip prefix). SKILL.md text is ambiguous between per-commit and branch-state interpretation.

- **P8-03 (Pre-Verified Contradiction Rule) is the strongest Phase 8 candidate** -- 2 empirical instances across 8 sessions confirm the pattern is real. Strongest candidate for Phase 8 promotion.

- **Cross-axis verdict scope inheritance is empirically robust** but not currently documented in plan SKILL.md or context-packaging.md. P8-19 + P8-21 candidates propose codifying the empirically-observed default.

## Phase 7 status

**COMPLETE -- PASS-with-residual.**

Plan 07-06 closes Phase 7 with all 5 tasks done:

- 5 plans (07-01..07-05) landed structurally (smoke gate green for new fixtures)
- 8-session UAT replay confirms empirical closure of GAP-G1+G2-empirical
- 06-VERIFICATION.md amendment 6 captures the closure + residuals
- Plugin version 0.10.0 published in 5 surfaces

The 5 major + 4 minor residuals + 22 Phase 8 candidates are documented in `uat-replay/session-notes.md` and amendment 6 for hypothetical Phase 8 scope. Phase 7 closes with empirical evidence that the load-bearing gains land on plugin 0.10.0.
