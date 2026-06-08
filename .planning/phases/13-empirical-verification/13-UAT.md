---
status: needs-review
phase: 13-empirical-verification
source: [13-01-SUMMARY.md, 13-02-SUMMARY.md, 13-03-SUMMARY.md]
started: 2026-06-08T00:00:00Z
updated: 2026-06-08T00:00:00Z
mode: autonomous
gate: GATE-02
verdict: mixed (SC-1/2/3/5 PASS; SC-4 FAIL -> GAP-13-BUDGET routed to Phase 12.x replan)
---

## Current Test

[testing complete -- mixed outcome recorded honestly; SC-4 failure is a measured result, not masked]

<!--
AUTONOMOUS UAT. Phase 13 is the GATE-02 empirical-verification phase: it proves
(or disproves) that the Phase 12 grouped spelled-out severity grammar reaches the
LIVE rendered user-facing report through real headless `claude -p` sessions, and
that no shorthand residue or frozen-history corruption slipped in. The evidence is
the n=3-per-skill live capture set (Plan 13-02), the residue sweep (Plan 13-03),
and the worktree provenance (Plan 13-01). Every result below is the real command
output captured under uat/, not a SUMMARY claim.

HONEST OUTCOME: this UAT produced a SPLIT result. The milestone GOAL -- no
shorthands in user-facing reports -- is EMPIRICALLY ACHIEVED (SHAPE 6/6,
Pass^k=1.0). But SC-4 (the per-finding word-budget gate measured on LIVE agent
emission) FAILS: the 28-word per-finding cap is exceeded in 4/6 runs
(GAP-13-BUDGET). This is exactly the "measured, not reasoned" budget-neutrality
regression SC-4 exists to catch. Per D-10 it is a SUBSTANTIVE behavioral result
routed to a Phase 12.x gap-closure REPLAN (agent-contract concision tightening),
NOT patched in this verify phase. GATE-02 is therefore NOT fully green.
-->

## Tests

### SC-1. `:review` rendered report has the four grouped spelled-out headers + zero shorthand (LIVE)
expected: A headless `claude -p /lz-advisor:review` run yields a rendered user-facing report (parent stream `.result`) containing `### Critical` / `### Important` / `### Suggestions` / `### Questions`, `(none)` markers on empty severities, a trailing `### Cross-Cutting Patterns`, and ZERO `crit:`/`imp:`/`sug:`/`q:` severity shorthand (word-boundary anchored). n=3 runs, all clean.
result: pass
evidence: "review-{1,2,3}.report.md (parent .result, captured from the dedicated ngx worktree): all 3 show `### Critical` + `### Cross-Cutting Patterns` + `(none)` markers; severity-shorthand (anchored `\\b(crit|imp|sug|q):`) = 0 on all 3. GRADE-LOG.md reviewer table: SHAPE [OK] x3. SHAPE-only Pass^1=Pass^3=1.0 (PASS-K.md). The unanchored grep fired 1 prose hit each on review-1/review-3 (`q:` inside the seeded `req: RawRequest` TS identifier) -- documented INNOCUOUS false positive, dispositioned via the anchored form (D-09); not a grammar failure."

### SC-2. `:security-review` rendered report has the grouped shape + OWASP `[Axx]` preserved + zero shorthand (LIVE)
expected: A headless `claude -p /lz-advisor:security-review` run yields the same grouped spelled-out shape (`### Critical`/`### Important`/`### Suggestions`/`### Questions` + `(none)`), a trailing `### Threat Patterns`, OWASP `[Axx]` tags preserved byte-intact immediately after the location, and ZERO shorthand. n=3 runs, all clean.
result: pass
evidence: "security-{1,2,3}.report.md (parent .result): all 3 show the four grouped headers + `### Threat Patterns`; OWASP `[A01]/[A02]/[A03]/[A06]/[A07]/[A09]` preserved byte-intact; severity-shorthand (anchored) = 0 on all 3. GRADE-LOG.md security table: SHAPE [OK] x3, `[Axx]` [OK] x3. SHAPE-only Pass^1=Pass^3=1.0 (PASS-K.md). Zero unanchored prose false positives on the security captures."

### SC-3. The ngx UAT ran in a DEDICATED worktree off the confirmed checkpoint, never on ngx `main`
expected: The UAT runs in a dedicated `git worktree` branched from the user-confirmed checkpoint `lz-advisor-compodoc-storybook-uat-base` @ `019a26a` (the spec name `uat/pre-storybook-compodoc` does NOT exist) on a NEW throwaway branch `uat/phase-13-render`, with EXPECTED_BASE == ACTUAL_BASE and the ngx live `main` tree untouched.
result: pass
evidence: "WORKTREE-PROVENANCE.md (Plan 13-01): worktree `/d/.../ngx-smart-components-uat-13` on `uat/phase-13-render`, created via manual `git worktree add -b uat/phase-13-render <wt> lz-advisor-compodoc-storybook-uat-base`; EXPECTED_BASE == ACTUAL_BASE == `019a26a6cf17fb4968791817eecfab14ec81b369` (no drift). GRADE-LOG.md provenance block: all 6 runs ran with CWD = the worktree (subagent JSONL path hash `D--projects-github-LayZeeDK-ngx-smart-components-uat-13`); ngx `main` worktree read `bad1aed [main]`, untouched. Worktree torn down in Plan 13-03 AFTER evidence custody (RESIDUE-SWEEP.md Teardown section): ngx now `[main]`-only, branch deleted, live tree never touched."

### SC-4. n>=3 budget gate is GREEN on LIVE agent emission for BOTH skills (per-finding 28-word cap)
expected: An empirical n>=3 budget-gate run on the NEW grammar -- `bash tests/D-reviewer-budget.sh --from-trace <skill>-N.agent.md` and the security equivalent, measured on the LIVE subagent emission (NOT the self-extracted worked example, D-04) -- confirms BOTH agents stay within the per-finding word-budget cap on every run (exit 0).
result: issue
evidence: "GRADE-LOG.md BUDGET column, measured on the live subagent emission (`<skill>-N.agent.md`): the per-finding 28-word cap is EXCEEDED in 4 of 6 runs. review-1 exit 0 (6 findings, all <=28w); review-2 exit 1 (Finding 1 = 46w > 28, severity-divergence rationale bundled into the finding body); review-3 exit 0 (7 findings); security-1 exit 1 (Finding 4 = 35w > 28, two sinks merged into one `[A02]` finding); security-2 exit 1 (Finding 3 = 31w > 28, verbose inline `curl` code); security-3 exit 1 (Finding 2 = 34w + Finding 8 = 36w > 28, second-order-injection code reproduction + multi-clause Question body). Every run cleared the anti-vacuous `>=5 findings` guard (6-8 parsed), so none are thin-target artifacts -- the over-cap is real. Combined fully-passing c=2/6 (reviewer 2/3, security 0/3). This is the measured budget-neutrality regression SC-4 exists to catch (D-04/D-10). Routed to GAP-13-BUDGET below."

### SC-5. Zero `crit:|imp:|sug:|q:` and zero `formerly-X` residue in `plugins/lz-advisor/`; frozen history untouched
expected: A scoped `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` returns nothing (exit 1) and the companion `git grep -nE 'formerly High|formerly Medium' -- plugins/lz-advisor/` returns nothing (exit 1); the `-- plugins/lz-advisor/` pathspec ALONE excludes every frozen `.planning/` history artifact (no `:(exclude)` list), so no historical shorthand reference is touched.
result: pass
evidence: "RESIDUE-SWEEP.md (Plan 13-03, run 2026-06-08 from this repo root): `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` -> exit 1, no output; word-boundary-anchored `\\b(crit|imp|sug|q):` -> exit 1; `formerly High|formerly Medium` -> exit 1. Structural-scoping proof: the same pattern matches 50 tracked files repo-wide (48 under `.planning/` frozen v1.0/v1.0.1 history + 2 under `tests/` where the tokens are the budget fixtures' own detector-regex literals, NOT residue), ZERO under `plugins/lz-advisor/` -- the pathspec excludes all 50 (Phase 9 leave-history-as-history precedent). [count corrected post-verification 2026-06-08; SC-5 verdict unchanged] No `q:` prose false positive in the plugin tree (the `req:` identifier lives in the ngx worktree, not here), so no disposition needed; no mechanical residue to fix in-phase (D-10)."

## Pass@k / Pass^k (from uat/PASS-K.md)

"Fully passes" = SHAPE grade clean (grouped headers + `(none)` + analytical section + zero anchored shorthand + (security) `[Axx]` preserved) AND BUDGET fixture exits 0. n=3 per skill (the floor; not escalated to n=5 -- the over-cap pattern is consistent across both skills and the disposition is unambiguous). Pass@k = `1 - C(n-c,k)/C(n,k)`; Pass^k = `C(c,k)/C(n,k)`.

### Combined metric (SHAPE clean AND BUDGET exit 0)

| Scope | n | c | Pass@1 | Pass@3 | Pass^1 | Pass^3 |
|-------|---|---|--------|--------|--------|--------|
| Reviewer (`/lz-advisor:review`) | 3 | 2 | 0.6667 | 1.0000 | 0.6667 | 0.0000 |
| Security-reviewer (`/lz-advisor:security-review`) | 3 | 0 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| Overall | 6 | 2 | 0.3333 | 0.8000 | 0.3333 | 0.0000 |

### SHAPE-only sub-metric (SC-1 / SC-2 -- the grammar reaches the rendered report)

| Scope | n | c (SHAPE clean) | Pass@1 | Pass@3 | Pass^1 | Pass^3 |
|-------|---|-----------------|--------|--------|--------|--------|
| Reviewer SHAPE | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Security SHAPE | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Overall SHAPE | 6 | 6 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

SHAPE-only is SATURATED (Pass^k = 1.0 everywhere): the grouped spelled-out grammar
reaches the rendered user-facing report on 6/6 runs with zero shorthand. SC-1 and
SC-2 are EMPIRICALLY PROVEN at the render layer. The combined metric's failure is
driven SOLELY by the per-finding BUDGET gate (SC-4) -- a separate axis from the
shorthand removal that defines this milestone.

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 0

**MIXED OUTCOME (honest).** The milestone GOAL -- no `crit:`/`imp:`/`sug:`/`q:`
shorthands in user-facing review reports -- is **EMPIRICALLY ACHIEVED**: the
grouped spelled-out grammar (`### Critical`/`### Important`/`### Suggestions`/
`### Questions` + `(none)` + the analytical section, OWASP `[Axx]` preserved on
security) reaches the LIVE rendered report on 6/6 runs with zero shorthand (SHAPE
Pass^k = 1.0), the residue sweep is clean (exit 1 both), and the UAT ran in an
isolated worktree off the confirmed checkpoint (SC-1, SC-2, SC-3, SC-5 PASS).

GATE-02 is **NOT fully green**, however: SC-4 FAILS. The per-finding 28-word
budget is exceeded on LIVE agent emission in 4/6 runs (GAP-13-BUDGET). This is the
"measured, not reasoned" budget-neutrality regression SC-4 was designed to catch
(the project's documented 3x burn assuming `wc -w` neutrality). Per D-10 this is a
SUBSTANTIVE behavioral result routed to a Phase 12.x gap-closure REPLAN -- it is an
agent-contract concision tightening, NOT a verify-phase inline patch (the
documented WR-05 partial-rewrite scar). GATE-02 closure is gated on resolving
GAP-13-BUDGET + phase verification + a user decision.

## Gaps

### GAP-13-BUDGET: per-finding word budget exceeded on LIVE agent emission (SC-4)

- **What:** The reviewer/security-reviewer per-finding 28-word cap
  (`PER_ENTRY_CAP=28`) is exceeded on 4/6 live runs. The Phase 11/12 fixtures were
  proven GREEN on the agents' SELF-EXTRACTED hand-authored worked examples; LIVE
  emission routinely overshoots by appending verbose tails: severity-divergence
  rationales (review-2, 46w), merged multi-sink findings (security-1, 35w), inline
  code reproductions (security-2, 31w; security-3 Finding 2, 34w), and multi-clause
  Question bodies (security-3 Finding 8, 36w).
- **Why it is a gap, not an inline fix:** the remedy is an agent-contract concision
  tightening (per-finding terseness on live emission) -- an agent-contract rewrite.
  Per D-10, a SUBSTANTIVE behavioral result is routed to a Phase 12.x gap-closure
  REPLAN; verification observes, it does not silently rewrite the contract inside a
  verify phase (the documented WR-05 partial-rewrite scar).
- **What is NOT broken:** the grouped spelled-out grammar itself (SC-1/SC-2) is
  flawless on live output (6/6). The v1.0.1 milestone goal (no shorthands in
  user-facing reports) is empirically achieved. The gap is budget CONCISION, a
  separate axis from the shorthand removal that defined this milestone.
- **Disposition (D-10):** route to a Phase 12.x gap-closure REPLAN (agent-contract
  concision tightening on live emission). Candidate fix: tighten the per-finding
  output constraint in `plugins/lz-advisor/agents/reviewer.md` +
  `plugins/lz-advisor/agents/security-reviewer.md` to keep severity-divergence
  rationale / multi-sink splits / inline code snippets out of the counted
  per-finding span (or split bundled findings). **SC-4 MUST be RE-MEASURED on live
  output after the fix** (re-run this UAT's capture+`--from-trace` gate; the
  re-provisioning is deterministic from WORKTREE-PROVENANCE.md's seed shape).
- **Routing status:** logged as a STATE.md blocker; surfaced to the user before
  marking Phase 13 / GATE-02 complete. Evidence:
  `uat/GRADE-LOG.md` ("SC-4 cross-skill summary") + `uat/PASS-K.md` + the per-run
  `*.agent.md` captures.

## Notes

- Mode: autonomous. All five SC results are real command outputs captured under
  `uat/` (the n=3-per-skill live `claude -p` captures from Plan 13-02, the residue
  sweep from Plan 13-03, the worktree provenance from Plan 13-01), not SUMMARY
  claims.
- SHAPE vs BUDGET are two distinct surfaces (D-03): SHAPE graded from the PARENT
  stream `.result` (`*.report.md` -- the user-facing render), BUDGET measured from
  the SUBAGENT emission (`*.agent.md` -- the agent's raw output) via the
  `--from-trace` fixtures. Grading the wrong surface (Pitfall 2) was avoided.
- `q:` prose false positive (D-09): the unanchored `crit:|imp:|sug:|q:` grep fires
  on `req:`-style TS identifiers in the captured ngx report.md (SC-1 grade); the
  authoritative test is the word-boundary-anchored `\b(crit|imp|sug|q):` (zero
  matches, all surfaces). The SC-5 sweep over `plugins/lz-advisor/` had ZERO
  matches even unanchored (the `req:` identifier lives in the ngx worktree, not the
  plugin tree).
- The two budget fixtures (`tests/D-reviewer-budget.sh`,
  `tests/D-security-reviewer-budget.sh`, GATE-01) ARE the binding budget gates,
  reused via `--from-trace` on live captures (D-04) -- no new measurement code was
  built (verify-only phase).
- Deferred (out of scope): the standing residue regression test
  (`tests/D-residue-sweep.sh`) is a future-milestone hardening idea, not built
  here; RPT-F01/F02/F03 report-format enhancements remain deferred.
