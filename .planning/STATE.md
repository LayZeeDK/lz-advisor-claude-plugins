---
gsd_state_version: 1.0
milestone: v1.0.1
milestone_name: No review report shorthands
status: Awaiting next milestone
stopped_at: Completed 13-07-PLAN.md (SC-4 third live re-measure GREEN 6/6; GATE-02 fully satisfied)
last_updated: "2026-06-11T10:14:57.504Z"
last_activity: 2026-06-11 — Milestone v1.0.1 completed and archived
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 13
  completed_plans: 13
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-11)

**Core value:** Near-Opus intelligence at Sonnet cost for coding tasks, through strategic advisor consultation at high-leverage moments
**Current focus:** v1.0.1 shipped (plugin 1.0.1, PR #1 merged); planning next milestone

## Deferred Items

Items acknowledged and deferred at the v1.0.1 milestone close (2026-06-11):

| Category | Item | Status | Note |
|----------|------|--------|------|
| backlog-todo | research-rtk-command-suitability-for-skills-and-agents | open | Future investigation: RTK command suitability for skills/agents (plugin-tooling); out of v1.0.1 scope -- carries to backlog. |
| tech-debt (Phase 12) | dangling "Reviewer Escalation Hook" cross-ref | open | Pre-existing, out-of-scope; review-skill side IS wired, security-skill side unwired. Track as backlog. |
| tech-debt (Phase 13) | FIX-R2-D budget-gate tolerance band | moot | Recorded deferred decision; now moot -- SC-4 closed GREEN 6/6 via genuine concision, no tolerance band needed. |
| tech-debt (Phase 13) | external-repo safety branch safety/edge-aion-986dae1 (ngx clone) | open | Inert quarantine of a transient UAT stray; ngx main + user work confirmed clean. Cleanup when convenient. |

(The 6 quick-task entries flagged by `audit-open` were false positives -- their SUMMARYs lack a `status:` frontmatter field but all are verified-complete; the Phase 13 UAT "gap" was already `resolved` with 0 open scenarios.)

## Current Position

Phase: Milestone v1.0.1 complete
Plan: —
Status: Awaiting next milestone
Last activity: 2026-06-11 — Milestone v1.0.1 completed and archived

### Milestone v1.0.1 roadmap

3 phases, continuing from the v1.0 milestone's final integer phase (Phase 10):

- **Phase 11 (Fixture baseline):** GATE-01 -- re-author the missing `D-reviewer-budget.sh` / `D-security-reviewer-budget.sh` smoke fixtures as committed, tracked tests green on the CURRENT shorthand grammar (regression gate before any change; build-order step 0).
- **Phase 12 (Atomic grouped-grammar rewrite):** RPT-01..04, AGNT-01..03, SKILL-01, SYNC-01..02 -- both agents + both skill render-verbatim contracts + context-packaging sync rewritten to the grouped spelled-out `### Critical`/`### Important`/`### Suggestions`/`### Questions` shape in one atomic unit, with lockstep fixture retarget and the 5-surface 1.0.0 -> 1.0.1 bump.
- **Phase 13 (Empirical verification):** GATE-02 -- headless `claude -p` UAT proves grouped spelled-out reports reach the rendered output on both review skills (ngx-smart-components run in a dedicated worktree off the `uat/pre-storybook-compodoc` checkpoint branch); n>=3 budget-gate run; residue + `.planning/`-history-preservation sweep.

Locked decisions: Route A (agent-emit, verbatim contract absolute); section-per-severity layout with `(none)` markers + continuous finding numbers; unified Critical/Important/Suggestion/Question vocabulary; plugin 1.0.0 -> 1.0.1.

### Historical position (v1.0 milestone -- SHIPPED 2026-06-01)

v1.0 MVP shipped at plugin 1.0.0: 16 phases, 80 plans, 187 tasks. Re-audit clean on all hard gates
(52/52 requirements, 6/6 integration, 5/5 flows, 16/16 Nyquist-complete). Milestone archived to
`milestones/v1.0-*`. Tagged `v1.0` (NOT pushed -- marketplace publication deferred per user directive).
Advisor runtime-proven on Opus 4.8. Final phase: Phase 10 (documentation-hygiene cleanup).

## Performance Metrics

**Velocity:**

- Total plans completed: 116 (v1.0 milestone, all phases)
- Average duration: -
- Total execution time: 0 hours

**By Phase (v1.0 milestone):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | - | - |
| 02 | 1 | - | - |
| 03 | 2 | - | - |
| 04 | 2 | - | - |
| 05.1 | 1 | - | - |
| 05.2 | 4 | - | - |
| 05.4 | 7 | - | - |
| 05.6 | 7 | - | - |
| 06 | 7 | - | - |
| 07 | 13 | - | - |
| 08 | 10 | - | - |
| 9 | 3 | - | - |
| 11 | 2 | - | - |
| 12 | 4 | - | - |
| 13 | 7 | - | - |

**By Phase (v1.0.1 milestone):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 11 | TBD | - | - |
| 12 | TBD | - | - |
| 13 | TBD | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 12 P12-01 | 35min | 2 tasks | 2 files |
| Phase 12 P12-02 | 10min | 2 tasks | 2 files |
| Phase 12 P12-03 | 20min | 2 tasks | 4 files |
| Phase 12 P12-04 | 9min | 2 tasks | 6 files |
| Phase 13 P01 | 6min | 3 tasks | 3 files |
| Phase 13 P02 | 35min | 3 tasks | 26 files |
| Phase 13 P03 | 12min | 3 tasks | 2 files |
| Phase 13 P04 | 18min | 3 tasks | 2 files |
| Phase 13 P05 | ~40min | 3 tasks | 33 files |
| Phase 13 P06 | ~25min | 3 tasks | 2 files |
| Phase 13 P07 | ~30min | 3 tasks | 30 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table and REQUIREMENTS.md locked-decisions table.
Recent decisions affecting current work (v1.0.1):

- [v1.0.1]: Route A (agent-emit) over Route B (skill-layer expansion) -- agents emit the grouped spelled-out shape directly; render-verbatim contract stays absolute. Route B would erode the verbatim contract that 16 phases of UAT hardened against paraphrase-creep.
- [v1.0.1]: Section-per-severity layout (`### Critical`/`### Important`/`### Suggestions`/`### Questions`) over inline-in-place labels -- user's original plan; requires continuous finding numbers + explicit `(none)` markers so ordinal cross-references stay unambiguous. Inverts the existing "Do NOT reformat into severity groups" prohibition.
- [v1.0.1]: Unified Critical/Important/Suggestion/Question vocabulary across both skills -- the decided Phase 7 lexicon; reverting security-review to Critical/High/Medium would reintroduce the WR-01..WR-05 cross-surface drift.
- [v1.0.1]: Plugin version 1.0.0 -> 1.0.1 (PATCH despite contract-shape change; user directive matches plugin version to milestone name).
- [v1.0.1]: Build-order step 0 (Phase 11) -- re-author the budget fixtures green on CURRENT shorthand FIRST; they live nowhere on disk (lived in cleared `.planning/phases/` workspaces), so "update fixtures in lockstep" is vacuous until they exist.
- [v1.0.1]: Word budgets are `wc -w`-based and the severity prefix sits OUTSIDE the counted span (`crit:` and `Critical:` each count as one word), so the spell-out is budget-neutral in principle -- but the project has been burned 3x assuming budget-neutrality, so Phase 13 measures it empirically (n>=3), not by reasoning.
- [v1.0.1 / 12-01]: Reviewer agent emits grouped ### Critical/Important/Suggestions/Questions grammar (header is sole severity source, continuous numbering, (none) empty markers); D-reviewer-budget.sh retargeted to a header-tracking parser, GREEN-on-new / RED-on-old in lockstep. AGNT-03 protected behaviors (Class-2 hook, Hedge Marker Discipline, lowercase severity= attrs) survive byte-intact.
- [v1.0.1 / 12-02]: Security-reviewer emits grouped grammar with OWASP [Axx] preserved + 75w CVE carve-out; fixture FINDING_RE asserts the [Axx] bracket, GREEN-on-new/RED-on-old/RED-on-[Axx]-missing; AGNT-03 protected behaviors byte-intact.
- [v1.0.1 / 12-03]: Both review skills' Phase 3 render-verbatim contracts name the four grouped severity headers (### Critical/### Important/### Suggestions/### Questions) + the trailing analytical section (### Cross-Cutting Patterns for review, ### Threat Patterns for security) as the protected literal headers; the "do not reformat into severity groups" prohibition is INVERTED (grouped IS the contract) with render-verbatim absolute and (none) preservation mandated. context-packaging.md display surfaces aligned (:60 inline pv anchor, :396 Verify Request OUTPUT illustration -> ### Critical, :411 prose); lowercase severity= machine attr (BNF/example) + INPUT-side Verification template ## Findings list KEPT (SYNC-01 per-surface disposition, Pitfall 5 / D-08); execute/SKILL.md :261 precision-edited to "reviewer-style grouped findings report" (Pitfall 6).
- [Phase ?]: [v1.0.1 / 12-04]: Atomic 5-surface version bump 1.0.0 -> 1.0.1 (plugin.json + 4 SKILL.md version: fields) landed; README ### 1.0.1 changelog entry added (separate from the 5-surface tally). Phase-atomicity completeness gate PASSED: both budget fixtures GREEN-on-new + RED-on-old/self-test (+ security RED-on-[Axx]-missing); zero crit:/imp:/sug:/q: + zero formerly-X residue in plugins/lz-advisor/; AGNT-03 protected behaviors intact; .planning/ frozen history untouched. The atomic grouped-grammar unit is complete.
- [Phase ?]: [v1.0.1 / 13-01]: UAT substrate provisioned -- dedicated ngx worktree on uat/phase-13-render off lz-advisor-compodoc-storybook-uat-base @ 019a26a (EXPECTED_BASE==ACTUAL_BASE, never main); seeded review-src/handler.ts (reviewer >=5 findings) + review-src/disk-info.ts (security >=5 OWASP-tagged) on the throwaway branch ONLY (A2 stated as decision: a slice within ngx, not a mutation of the active tree); evidence-custody dir .planning/.../uat/ created in this repo (D-08).
- [Phase ?]: [v1.0.1 / 13-02]: Live headless UAT executed -- n=3 :review + n=3 :security-review claude -p captures, dual-extracted (parent .result for SHAPE, subagent JSONL for BUDGET), graded + Pass@k/Pass^k. SC-1/SC-2 EMPIRICALLY PROVEN: grouped spelled-out grammar reaches the rendered report 6/6 (SHAPE saturated, Pass^k=1.0 both skills, OWASP [Axx] preserved, zero shorthand). SC-4 FAILS on live emission: per-finding 28w cap exceeded in 4/6 runs (review-2 46w; security-1 35w; security-2 31w; security-3 34w+36w) -- the "measured not reasoned" budget-neutrality regression -> routed to a Phase 12.x gap-closure REPLAN (D-10, NOT patched in verify phase). q:-in-req: prose false positive dispositioned via word-boundary anchor (D-09).
- [Phase ?]: [v1.0.1 / 13-03]: GATE-02 closeout. SC-5 residue sweep CLEAN: `git grep crit:|imp:|sug:|q:` and `formerly High|formerly Medium` over `plugins/lz-advisor/` both exit 1 (the same pattern matches 41 files repo-wide, ALL under frozen `.planning/` history, ZERO under the plugin tree -- pathspec scoping is the structural guard, Phase 9 precedent). No `q:` disposition needed (the `req:` false positive lives in the ngx worktree, not the plugin tree). Throwaway ngx worktree `ngx-smart-components-uat-13` + branch `uat/phase-13-render` torn down by exact name AFTER asserting all 15 evidence files were present + committed (D-08); ngx back to `[main]`-only, live tree untouched. `13-UAT.md` consolidated: SC-1/2/3/5 PASS, SC-4 FAIL (GAP-13-BUDGET), Pass@k/Pass^k tables, `## Gaps` with the D-10 routing. PHASE VERDICT MIXED: milestone goal (no shorthands) empirically achieved; GATE-02 NOT green pending GAP-13-BUDGET resolution + a user decision.
- [Phase ?]: [v1.0.1 / 13-06]: GAP-13-BUDGET-R2 iteration-2 concision fix landed (commits bfb8003 reviewer, 91ee635 security). FIX-R2-A/B/C applied atomically (WR-05) across both agents: FIX-R2-A routes a context-heavy reviewer Question's observation+evidence into the EXISTING 60w `### Per-finding validation` (body stays <=28w binary question; NO new 75w reviewer carve-out -- 13-GAP-RESEARCH Q3 option (b); PFV entries don't match the fixture FINDING_RE so the words leave the counted span); FIX-R2-B extends FIX-3 reference-by-shape to the security FIX/remediation clause (name the safe API in backticks, no full call expression, no second clause); FIX-R2-C splits the reviewer causal-chain (body = defect + fix <=28w, downstream consequence -> `### Cross-Cutting Patterns`). CAP VERDICT honored: 22/28/75/60 unchanged in agents, 28/5/75 unchanged in fixtures, `git status --porcelain tests/` empty (the close is genuine concision, the gate is NOT gamed). WRONG->RIGHT worked examples modeled on the actual over-cap captures (r2-review-4 45w->24w+45w PFV; r2-review-3 29w->15w; r2-security-1 33w->27w); do_not_include lists reinforced. WR-05 atomicity gate GREEN: both fixtures self-extract exit 0, self-test exit 1, residue sweeps exit 1, SHAPE + AGNT-03 byte-intact. FIX-R2-D (gate tolerance band) recorded as a flagged DEFERRED product-contract decision (a gate-design correction the user settles deliberately, NOT gaming the gate), NOT implemented here. Input for Plan 13-07 to re-measure SC-4 a THIRD time on live emission under the unchanged gate.
- [Phase ?]: [v1.0.1 / 13-05]: SC-4 LIVE budget RE-MEASURE on the 13-04 fixed agents (n=5 per skill, R2 worktree off 019a26a, seeds byte-identical to 13-01 recovered from dangling commit 4fa7fd7). MEASURED (not reasoned, D-04): the 13-04 fix produced a LARGE improvement -- combined fully-passing c=2/6 -> 7/10 (Pass@1 0.333 -> 0.700; security half 0/3 -> 4/5; worst finding-body overshoot 46w -> 33w) -- but SC-4 is NOT fully GREEN: 3/10 runs retain a residual over-cap (r2-review-3 29w marginal deref-chain; r2-review-4 45w multi-clause Question with no reviewer carve-out; r2-security-1 four findings 30-33w verbose FIX-clause prose). SHAPE-only 10/10 (Pass^k=1.0, OWASP [Axx] byte-intact). Recorded HONESTLY (D-10) as GAP-13-BUDGET-R2 -> a SECOND concision iteration needed (reviewer Question concision/carve-out + security FIX-clause reference-by-shape + marginal reviewer body nudge), NOT patched in this re-measure plan. R2 worktree + branch torn down by exact name after D-08 custody; ngx [main]-only at bad1aed. GATE-02 stays PARTIAL. Evidence: uat/GRADE-LOG-R2.md + PASS-K-R2.md + 10 r2-*.agent.md + WORKTREE-PROVENANCE-R2.md.
- [Phase ?]: [v1.0.1 / 13-04]: GAP-13-BUDGET atomic concision fix landed (commit 5085bca). FIX-1..4 applied to BOTH review agents in one plan (WR-05 atomicity): FIX-1 routes severity-divergence rationale to `### Per-finding validation` (60w, both agents), body stays terse; FIX-2 splits merged two-sink findings into separate numbered findings (security); FIX-3 references code by `path:line`, no multi-token inline reproduction (both); FIX-4 locks the 75w auto-clarity escape to `[CVE]`/`[GHSA]`/`[CWE]` brackets and corrects the prose to AGREE with the UNCHANGED `<auto_clarity_carve_out>` element (security) -- bracket-less Questions/architectural-disagreements stay terse. CAP VERDICT honored: PER_ENTRY_CAP/28/22/75 unchanged in agents AND fixtures. WRONG->RIGHT worked example added per fix; do_not_include lists reinforced. ATOMICITY GATE GREEN: both budget fixtures self-extract exit 0 on the edited worked examples; self-test exit 1; residue sweeps exit 1; SHAPE + AGNT-03 byte-intact; `git status --porcelain tests/` empty (fixtures unmodified). Input for Plan 13-05 to re-measure SC-4 GREEN on live emission and close GATE-02.

### Pending Todos

- [research-rtk-command-suitability-for-skills-and-agents](./todos/pending/research-rtk-command-suitability-for-skills-and-agents.md) -- analyze whether `rtk git diff` / `rtk gh pr diff` are appropriate for review + security-review skills/agents (token savings vs. detail-loss trade-off). Captured 2026-04-26 during Phase 05.6 Test 2 review.

### Blockers/Concerns

- [RESOLVED 13-07] GAP-13-BUDGET-R2 (13-05, SUPERSEDED GAP-13-BUDGET): the iteration-2 concision fix (Plan 13-06, FIX-R2-A/B/C, commits bfb8003 + 91ee635) was RE-MEASURED on live emission in Plan 13-07 -- the THIRD SC-4 re-measure (n=3 per skill against the 13-06 FIXED agents, R3 worktree off 019a26a). RESULT: combined c=6/6, every `--from-trace` budget gate run exit 0 under the UNCHANGED hard gate (reviewer [0,0,0], security [0,0,0]); Pass@k=Pass^k=1.0 at every k. The three R2 residual classes are ELIMINATED: worst reviewer finding 45w/29w -> 22w (FIX-R2-A routed the Question elaboration to the 60w Per-finding validation valve; FIX-R2-C split the causal chain to Cross-Cutting Patterns); worst security finding 33w -> 27w (FIX-R2-B fix-clause reference-by-shape). SHAPE clean 6/6 (OWASP [Axx] byte-intact, anchored shorthand=0). The fixtures were NEVER edited (`git status --porcelain tests/` empty throughout) -- the close is genuine concision, not a gamed gate (T-13-07-02). No residual stray surfaced, so the deferred FIX-R2-D gate-tolerance-band decision is NOT needed to close SC-4 (it remains a flagged product-contract decision the user may settle independently per 13-06-SUMMARY, NOT a blocker). SC-4 is GREEN; GATE-02's budget half is CLOSED; all five UAT criteria PASS. Progression: pre-fix 2/6 -> 13-04 fix 7/10 (R2) -> 13-06 fix 6/6 (R3). Evidence: `.planning/phases/13-empirical-verification/uat/GRADE-LOG-R3.md` + `PASS-K-R3.md` + the 6 `r3-*.agent.md` captures + `WORKTREE-PROVENANCE-R3.md` + `13-07-SUMMARY.md`.
- [SUPERSEDED by GAP-13-BUDGET-R2] GAP-13-BUDGET (13-02): the per-finding 28w cap was exceeded on LIVE emission in 4/6 UAT runs (review-2 46w; security-1 35w; security-2 31w; security-3 34w+36w). ADDRESSED by the 13-04 fix (commit 5085bca, FIX-1..4) and re-measured in 13-05 (2/6 -> 7/10); a residual remains -> tracked as GAP-13-BUDGET-R2 above. Pre-fix evidence preserved in `uat/GRADE-LOG.md` + `PASS-K.md`.
- [RESOLVED 13-03] GATE-02 worktree constraint: the Phase 13 UAT ran in a dedicated ngx worktree off the confirmed checkpoint `lz-advisor-compodoc-storybook-uat-base` @ `019a26a` (the spec name `uat/pre-storybook-compodoc` does not exist), never on ngx `main` (SC-3 PASS). The throwaway worktree + `uat/phase-13-render` branch are torn down (D-08); ngx is back to `[main]`-only.
- Few-shot drift risk (Phase 12): LLMs follow worked examples over stated rules. The Format line and all 8+ worked examples (including holistic example, Hedge Marker examples, verify_request example tokens) must change in ONE atomic unit or output will be mixed (this is the documented Phase 7 WR-05 scar).
- Cross-surface lexicon drift (Phase 12): the vocabulary lives on 6+ surfaces; a per-surface disposition table must distinguish display labels (Title-Case rename) from machine XML attributes (`severity=` lowercase, leave canonical) from leave-as-history (~362 frozen `.planning/` artifacts -- exclude from every sweep).

### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
| 260417-lhe | Assess Opus 4.7 release impact on advisor plugin and propose upgrade path | 2026-04-17 | 593920d | Verified | [260417-lhe-assess-opus-4-7-release-impact-on-adviso](./quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/) |
| 260601-f2a | Correct /plan "no built-in twin" claim in 09-03-SUMMARY + 09-VERIFICATION (Claude Code ships a built-in /plan; picker disambiguates) | 2026-06-01 | 401b7af | - | [260601-f2a-correct-the-no-built-in-twin-claim-for-p](./quick/260601-f2a-correct-the-no-built-in-twin-claim-for-p/) |
| 260610-w0f | Correct dangling "Reviewer Escalation Hook" cross-ref (security-reviewer.md -> review/SKILL.md; security side hedged not-yet-wired) | 2026-06-10 | 0e3f6c4 | - | [260610-w0f-correct-dangling-reviewer-escalation-hoo](./quick/260610-w0f-correct-dangling-reviewer-escalation-hoo/) |
| 260611-c5l | Address all PR #1 /code-review findings (#1-#9, #11, #12 fixed; #10 won't-fix per Phase 11 D-10) | 2026-06-11 | 5b57a0a | Verified | [260611-c5l-address-all-review-findings](./quick/260611-c5l-address-all-review-findings/) |
| 260611-ebt | Address 2nd /code-review pass findings (#1 deeper fix: confirmed Finding 3; #2 multi-line PFV + loud-fail; #3 plural revert; #4 dead var; #5 closed-vocab anchor) | 2026-06-11 | 56e8172 | Verified | [260611-ebt-address-the-review-findings](./quick/260611-ebt-address-the-review-findings/) |
| 260611-f98 | Address 3rd /code-review pass findings (#1 PFV multi-paragraph under-count + #2 dead `### ` branch -> two-arm loop; #3 Threat Patterns names confirmed Finding 3) | 2026-06-11 | 1a46b93 | Verified | [260611-f98-address-the-review-findings](./quick/260611-f98-address-the-review-findings/) |

### Roadmap Evolution

- **Milestone v1.0.1 roadmap created (2026-06-07):** 3 phases (11-13), continuing integer numbering from the v1.0 milestone's final Phase 10. Derived from the research-recommended build-order: fixture baseline first (Phase 11, build-order step 0), atomic grouped-grammar rewrite (Phase 12, the lockstep unit), empirical verification last (Phase 13). All 12 v1.0.1 requirements mapped, 0 orphans. ROADMAP.md replaced the v1.0 milestone index (v1.0 detail preserved via links to `milestones/v1.0-*`).

(v1.0 milestone roadmap-evolution history archived in `milestones/v1.0-ROADMAP.md`.)

## Session Continuity

Last session: 2026-06-08T21:30:38.617Z
Stopped at: Completed 13-07-PLAN.md (SC-4 third live re-measure GREEN 6/6; GATE-02 fully satisfied)
Resume file: None
Resume next: Phase 13 verification (verify_phase_goal -> spawn gsd-verifier for 13-VERIFICATION.md). All 7 plans executed; SC-4 is now GREEN on the 13-07 third live re-measure (combined c=6/6, Pass@k=Pass^k=1.0, every run exit 0 under the UNCHANGED hard gate; the 13-06 FIX-R2-A/B/C concision fix fully landed, fixtures never edited -- the close is genuine). All five UAT criteria PASS (SC-1/2/3/5 already PASS; SC-4 closed in 13-07). GATE-02 is FULLY SATISFIED (render half + budget half). NEXT: run the independent phase-goal verification (gsd-verifier) to produce 13-VERIFICATION.md, then the milestone audit. FIX-R2-D (gate tolerance band) was NOT needed to close SC-4 -- no residual stray surfaced; it remains a flagged product-contract decision the user may settle independently per 13-06-SUMMARY, NOT a blocker.

## Operator Next Steps

- Start the next milestone with /gsd-new-milestone
