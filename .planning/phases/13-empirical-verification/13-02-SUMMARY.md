---
phase: 13-empirical-verification
plan: 02
subsystem: live-uat-evidence
tags: [uat, claude-p, headless, gate-02, sc-1, sc-2, sc-4, budget-gate, pass-at-k]
requires:
  - "Plan 13-01 ngx worktree + seeded review-src/handler.ts + review-src/disk-info.ts + uat/ evidence dir"
provides:
  - "n=3 live :review captures + n=3 live :security-review captures (stream-json + report.md + agent.md each)"
  - "GRADE-LOG.md (per-run SHAPE + BUDGET grade) + PASS-K.md (Pass@k/Pass^k)"
  - "EMPIRICAL PROOF SC-1/SC-2: grouped spelled-out grammar reaches rendered report 6/6 (SHAPE saturated)"
  - "EMPIRICAL SC-4 RESULT: per-finding budget exceeded on live emission 4/6 runs -> Phase 12.x gap"
affects:
  - "Plan 13-03 (residue sweep + worktree teardown; reads this evidence)"
  - "Phase 13 VERIFICATION (GATE-02 close-out: SC-1/2 PASS, SC-4 budget gap to route)"
  - "A future Phase 12.x gap-closure REPLAN (per-finding concision tightening on live agent emission)"
tech-stack:
  added: []
  patterns:
    - "Dual-surface capture: parent stream .result (SHAPE) + subagent JSONL assistant text (BUDGET)"
    - "Live --from-trace budget gate on agent emission, not the self-extracted example (D-04)"
    - "Word-boundary-anchored severity-shorthand check to disposition the q:-in-req: prose false positive (D-09)"
key-files:
  created:
    - ".planning/phases/13-empirical-verification/uat/GRADE-LOG.md"
    - ".planning/phases/13-empirical-verification/uat/PASS-K.md"
    - ".planning/phases/13-empirical-verification/uat/review-{1,2,3}.{streamjson,err,report.md,agent.md}"
    - ".planning/phases/13-empirical-verification/uat/security-{1,2,3}.{streamjson,err,report.md,agent.md}"
  modified: []
decisions:
  - "q: prose false positive (matches inside req:) dispositioned via word-boundary anchor \\b(crit|imp|sug|q): -- innocuous, not substantive (D-09, RESEARCH Q4)"
  - "Per-finding budget over-cap on live emission (4/6 runs) is a SUBSTANTIVE SC-4 result routed to a Phase 12.x gap-closure REPLAN, NOT patched in this verify phase (D-10)"
  - "n=3 floor not escalated to n=5: the over-cap pattern is consistent across both skills and the disposition is unambiguous"
metrics:
  duration: ~35min
  completed: 2026-06-08
---

# Phase 13 Plan 02: Live headless UAT Summary

Ran the GATE-02 empirical UAT live: n=3 headless `claude -p /lz-advisor:review` +
n=3 `/lz-advisor:security-review` captures against the seeded ngx worktree (Plan
13-01), dual-extracted each (parent `.result` for SHAPE, subagent JSONL for
BUDGET), graded every run, and aggregated Pass@k/Pass^k. **Headline: the Phase 12
grouped spelled-out grammar reaches the rendered user-facing report on 6/6 runs
with zero shorthand (SC-1 + SC-2 EMPIRICALLY PROVEN, SHAPE saturated). The
per-finding 28-word budget is exceeded on LIVE emission in 4/6 runs (SC-4 FAILS
on live output) -- the exact "measured, not reasoned" budget-neutrality regression
this phase exists to catch -- routed to a Phase 12.x gap-closure REPLAN per D-10.**

## Success-criteria verdicts

| SC | Verdict | Evidence |
|----|---------|----------|
| SC-1 (`:review` grouped headers + zero shorthand, rendered) | **PASS** | review-{1,2,3}.report.md: `### Critical`/`### Important`/`### Suggestions`/`### Questions` + `(none)` + `### Cross-Cutting Patterns`, zero severity-shorthand (anchored), 3/3 |
| SC-2 (`:security-review` grouped + `[Axx]` + zero shorthand, rendered) | **PASS** | security-{1,2,3}.report.md: same grouped shape + OWASP `[Axx]` preserved + `### Threat Patterns`, zero shorthand, 3/3 |
| SC-3 provenance (dedicated worktree off checkpoint) | **PASS** | `git worktree list` recorded in GRADE-LOG: runs in `ngx-smart-components-uat-13 [uat/phase-13-render]`, live `main` untouched |
| SC-4 (n>=3 budget gate GREEN on live agent emission) | **FAIL (live over-cap)** | per-finding 28w cap exceeded in review-2 (46w), security-1 (35w), security-2 (31w), security-3 (34w + 36w). Combined fully-passing c=2/6 |
| Pass@k / Pass^k reported | **DONE** | PASS-K.md per skill + overall + SHAPE-only sub-metric |

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Capture + grade live `:review` runs (SC-1, SC-3 provenance, SC-4 reviewer half) | `13cd9d1` | GRADE-LOG.md + review-{1,2,3}.{streamjson,err,report.md,agent.md} |
| 2 | Capture + grade live `:security-review` runs (SC-2, SC-4 security half) | `75fa853` | GRADE-LOG.md + security-{1,2,3}.{streamjson,err,report.md,agent.md} |
| 3 | Aggregate Pass@k / Pass^k per skill + overall | `3f6309d` | PASS-K.md |

## Verification Results

**SHAPE (SC-1 / SC-2) -- the grammar reaches rendered output, 6/6:**
- All 6 runs: spelled-out `### Critical` present; review has `### Cross-Cutting
  Patterns`, security has `### Threat Patterns`; `(none)` markers on empty
  severities; security preserves OWASP `[Axx]` (`[A01]`/`[A02]`/`[A03]`/`[A06]`/
  `[A07]`/`[A09]`) byte-intact. [OK]
- Zero severity-shorthand tokens on all 6 runs (word-boundary anchored). [OK]
- SHAPE-only Pass^1 = Pass^3 = 1.0 for both skills (saturated). [OK]

**BUDGET (SC-4) -- the per-finding cap is exceeded on live emission, 4/6 FAIL:**
- review-1: budget exit 0 (6 findings, all <=28w). [OK]
- review-2: budget exit 1 -- Finding 1 = 46w > 28 (severity-divergence rationale
  bundled into the finding body). [FAIL]
- review-3: budget exit 0 (7 findings). [OK]
- security-1: budget exit 1 -- Finding 4 = 35w > 28 (two sinks merged into one
  `[A02]` finding). [FAIL]
- security-2: budget exit 1 -- Finding 3 = 31w > 28 (verbose inline `curl` code). [FAIL]
- security-3: budget exit 1 -- Finding 2 = 34w + Finding 8 = 36w > 28 (second-order
  injection code reproduction + multi-clause Question body). [FAIL]
- Every run cleared the anti-vacuous `>=5 findings` guard (6-8 parsed), so none of
  these are thin-target artifacts (Pitfall 1) -- the budget overage is real.

**SC-3 provenance:** `git worktree list` shows
`ngx-smart-components-uat-13 4fa7fd7 [uat/phase-13-render]` (off
`lz-advisor-compodoc-storybook-uat-base` @ `019a26a`); the live `main` worktree
reads `bad1aed [main]`, untouched. All 6 runs ran with CWD = the dedicated
worktree (confirmed by the subagent JSONL path hash
`D--projects-github-LayZeeDK-ngx-smart-components-uat-13`). [OK]

## Pass@k / Pass^k headline (full table in PASS-K.md)

Combined ("fully passes" = SHAPE clean AND budget exit 0):

| Scope | n | c | Pass@1 | Pass@3 | Pass^1 | Pass^3 |
|-------|---|---|--------|--------|--------|--------|
| Reviewer | 3 | 2 | 0.6667 | 1.0000 | 0.6667 | 0.0000 |
| Security | 3 | 0 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| Overall | 6 | 2 | 0.3333 | 0.8000 | 0.3333 | 0.0000 |

SHAPE-only sub-metric is saturated (Pass^k = 1.0 everywhere) -- the grammar render
is reliable; the budget gate is the sole discriminator.

## Gap (D-10 SUBSTANTIVE failure -> Phase 12.x gap-closure REPLAN)

**GAP-13-BUDGET: per-finding word budget exceeded on live agent emission.**

- **What:** The reviewer/security-reviewer per-finding 28-word cap
  (`PER_ENTRY_CAP=28`) is exceeded on 4/6 live runs. The Phase 11/12 fixtures were
  proven GREEN on the agents' SELF-EXTRACTED hand-authored worked examples; LIVE
  emission routinely overshoots by appending verbose tails: severity-divergence
  rationales, merged multi-sink findings, inline code reproductions, multi-clause
  Question bodies.
- **Why it is a gap, not an inline fix:** the remedy is an agent-contract concision
  tightening (per-finding terseness discipline on live emission) -- an
  agent-contract rewrite. Per D-10, a SUBSTANTIVE behavioral result is routed to a
  Phase 12.x gap-closure REPLAN; verification observes, it does not silently
  rewrite the contract (the documented WR-05 partial-rewrite scar).
- **What is NOT broken:** the grouped spelled-out grammar itself (SC-1/SC-2) is
  flawless on live output (6/6) -- the v1.0.1 milestone goal (no shorthands in
  user-facing reports) is empirically achieved. The gap is budget concision, a
  separate axis from the shorthand-removal that defined this milestone.
- **Routing:** record in Phase 13 VERIFICATION; surface to the user before marking
  the phase complete. Candidate fix: tighten the per-finding output constraint in
  `agents/reviewer.md` + `agents/security-reviewer.md` to keep severity rationale /
  multi-sink splits / code snippets out of the counted per-finding span (or split
  bundled findings), then re-run this UAT.

## Deviations from Plan

- **The plan `<verify>` blocks require all 3 runs of each skill GREEN on both SHAPE
  AND BUDGET.** SHAPE is green 6/6; BUDGET is green 2/6. Rather than treat this as
  an execution failure, it is recorded faithfully as the empirical SC-4 result
  (operational guidance D-10: "a real failure is a valid, important outcome, not
  something to mask"). No agent contract was patched in this verify phase.
- **`q:` prose false positive dispositioned (D-09):** the plan's literal SHAPE
  grep `! rg -q 'crit:|imp:|sug:|q:'` is unanchored and fires on the substring
  `q:` inside the TypeScript identifier `req:` (e.g. `req: RawRequest`) in review-1
  and review-3. 13-RESEARCH.md Q4 and 13-CONTEXT.md D-09 explicitly anticipate this
  ("`q:`... matches ordinary prose"; "matched with word-boundary care"). The
  authoritative SHAPE verdict uses the word-boundary-anchored `\b(crit|imp|sug|q):`
  (zero matches, all 6 runs), which is the substantive severity-shorthand test.
  Both the unanchored count and the anchored verdict are recorded per run in
  GRADE-LOG. This is a NOTED INNOCUOUS prose false positive, not a grammar failure.

## Known Stubs

None -- this plan produces evidence files (captures + grades), not source code.
All seeded review targets were consumed live; no placeholder/empty-data surfaces.

## Self-Check: PASSED

- All 6 `report.md` + 6 `agent.md` + 6 `streamjson` + 6 `err` captures present in
  `uat/`.
- GRADE-LOG.md present with one row per run (6 rows) + the SC-4 cross-skill summary.
- PASS-K.md present with Pass@ and Pass^ rows per skill + overall + SHAPE sub-metric.
- Commits `13cd9d1`, `75fa853`, `3f6309d` exist in `git log`.
- Each `<skill>-N.streamjson` contains a `result` event (verified pre-grade via
  `jq -e 'select(.type=="result")'`).
