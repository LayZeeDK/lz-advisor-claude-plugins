---
phase: 13-empirical-verification
plan: 05
subsystem: live-uat-evidence
tags: [uat, claude-p, headless, gate-02, sc-4, budget-gate, pass-at-k, re-measure, gap-closure]
requires:
  - "Plan 13-04 FIXED agents (commit 5085bca, FIX-1..4 concision discipline)"
  - "Plan 13-01 recorded provisioning sequence + seed-defect shape (reproduced on a new throwaway branch)"
provides:
  - "n=5-per-skill LIVE budget RE-MEASURE on the 13-04 fixed agents (stream-json + report.md + agent.md each)"
  - "GRADE-LOG-R2.md (per-run SHAPE + BUDGET) + PASS-K-R2.md (recomputed Pass@k/Pass^k) + WORKTREE-PROVENANCE-R2.md"
  - "MEASURED SC-4 verdict: IMPROVED (combined c=2/6 -> 7/10) but NOT fully GREEN -> GAP-13-BUDGET-R2 (second concision iteration)"
affects:
  - "Phase 13 VERIFICATION (GATE-02 close-out: SC-4 re-measured, still PARTIAL)"
  - "A follow-on gap-closure plan (second per-finding concision iteration on the FIX/Question side)"
tech-stack:
  added: []
  patterns:
    - "Deterministic re-provisioning: recover prior seed files verbatim from the dangling seed commit (4fa7fd7) via git show, diff-verify byte-identical, re-seed on a new throwaway branch"
    - "Worktree-scoped gitdir HEAD read (.git/worktrees/<name>) for ACTUAL_BASE -- a main-repo rev-parse HEAD is a false-drift signal"
    - "Escalate n=3 -> n=5 on a measured residual when the session pool has headroom"
    - "Script-file for-loop (not an inline Bash-tool loop) to capture per-run script exit codes reliably"
key-files:
  created:
    - ".planning/phases/13-empirical-verification/uat/WORKTREE-PROVENANCE-R2.md"
    - ".planning/phases/13-empirical-verification/uat/GRADE-LOG-R2.md"
    - ".planning/phases/13-empirical-verification/uat/PASS-K-R2.md"
    - ".planning/phases/13-empirical-verification/uat/r2-review-{1..5}.{streamjson,err,report.md,agent.md}"
    - ".planning/phases/13-empirical-verification/uat/r2-security-{1..5}.{streamjson,err,report.md,agent.md}"
    - ".planning/phases/13-empirical-verification/13-05-SUMMARY.md"
  modified:
    - ".planning/phases/13-empirical-verification/13-UAT.md"
decisions:
  - "SC-4 NOT marked PASS: the re-measure is a LARGE improvement (combined c=2/6 -> 7/10) but 3/10 runs retain a residual over-cap; SC-4 PASS requires every run exit 0, so it is recorded as GAP-13-BUDGET-R2 (D-10 honest reporting), not masked"
  - "Escalated n=3 -> n=5 per skill: a residual appeared on both skills at the n=3 floor and the session pool had clear headroom, so a fuller statistical picture was captured"
  - "Seeds recovered byte-identical from the dangling 13-01 seed commit 4fa7fd7 (diff-verified empty) rather than re-authored, guaranteeing the SAME deterministic defect shape"
metrics:
  duration: ~40min
  completed: 2026-06-08
  tasks: 3
  files: 33
---

# Phase 13 Plan 05: SC-4 LIVE budget RE-MEASURE (GATE-02 close-out) Summary

Re-measured SC-4 (the per-finding 28w word-budget gate) on LIVE agent emission AFTER
the 13-04 concision fix (commit `5085bca`). Re-provisioned the deterministic ngx
worktree substrate, ran n=5 headless `claude -p` captures per review skill against
the seeded targets (now hitting the FIXED agents), dual-extracted SHAPE (parent
`.result`) + BUDGET (subagent JSONL), ran the `--from-trace` budget gate on every
live emission, recomputed Pass@k/Pass^k, wrote all evidence into `uat/` before
teardown, tore down the R2 worktree, and updated `13-UAT.md`.

**Headline (MEASURED, not reasoned -- D-04): the 13-04 fix produced a LARGE
improvement (combined fully-passing c=2/6 -> 7/10; Pass@1 0.333 -> 0.700; security
half 0/3 -> 4/5; worst finding-body overshoot 46w -> 33w) but SC-4 is NOT yet fully
GREEN. 3/10 LIVE runs retain a residual over-cap (GAP-13-BUDGET-R2). GATE-02 stays
PARTIAL; a second concision iteration is required.**

## SC-4 re-measure verdict (per-run BUDGET exits -- authoritative)

| Skill | run-1 | run-2 | run-3 | run-4 | run-5 | c / n |
|-------|-------|-------|-------|-------|-------|-------|
| Reviewer (`/lz-advisor:review`) | 0 (PASS) | 0 (PASS) | 1 (29w) | 1 (45w Q) | 0 (PASS) | 3 / 5 |
| Security (`/lz-advisor:security-review`) | 1 (4x 30-33w) | 0 (PASS) | 0 (PASS) | 0 (PASS) | 0 (PASS) | 4 / 5 |

Combined c = **7 / 10** (pre-fix baseline was 2/6). SHAPE-only c = **10 / 10**
(Pass^k = 1.0 everywhere -- the grouped grammar render is flawless, OWASP `[Axx]`
byte-intact every security run, zero anchored shorthand every run).

## Pass@k / Pass^k (recomputed, n=5 per skill; full table in uat/PASS-K-R2.md)

Combined (SHAPE clean AND BUDGET exit 0):

| Scope | n | c | Pass@1 | Pass@3 | Pass@5 | Pass^1 | Pass^3 | Pass^5 |
|-------|---|---|--------|--------|--------|--------|--------|--------|
| Reviewer | 5 | 3 | 0.6000 | 1.0000 | 1.0000 | 0.6000 | 0.1000 | 0.0000 |
| Security | 5 | 4 | 0.8000 | 1.0000 | 1.0000 | 0.8000 | 0.4000 | 0.0000 |
| Overall | 10 | 7 | 0.7000 | 0.9917 | 1.0000 | 0.7000 | 0.2917 | 0.0833 |

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Re-provision deterministic R2 substrate (worktree + seeds + provenance) | `411c28f` | WORKTREE-PROVENANCE-R2.md (this repo); seed commit `b8f99e1` (ngx R2 branch) |
| 2a | Capture + grade n=3 live `:review` R2 runs | `1055b1f` | GRADE-LOG-R2.md + r2-review-{1,2,3}.* |
| 2b | Capture n=5 security + reviewer escalation; PASS-K-R2 | `a5159ab` | r2-review-{4,5}.* + r2-security-{1..5}.* + PASS-K-R2.md |
| 3 | Teardown R2 worktree; update 13-UAT.md SC-4 re-measure | `28fdcf3` | 13-UAT.md |

## What was done

### Task 1 -- R2 substrate (deterministic re-provision off 019a26a)

- Asserted the checkpoint branch `lz-advisor-compodoc-storybook-uat-base` exists BEFORE the add; EXPECTED_BASE = `019a26a6cf17fb4968791817eecfab14ec81b369`.
- Created the R2 worktree on a NEW throwaway branch `uat/phase-13-render-r2` off the checkpoint, at `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r2`.
- Verified ACTUAL_BASE == EXPECTED_BASE by reading the WORKTREE-SCOPED gitdir HEAD (a main-repo `rev-parse HEAD` returns `bad1aed` -- a documented false-drift signal; recorded the disposition in provenance).
- Recovered both 13-01 seed files VERBATIM from the dangling seed commit `4fa7fd7` (the commit object survives the `uat/phase-13-render` branch deletion until GC), `diff`-verified byte-identical, wrote them into the R2 worktree, and committed as `b8f99e1` on the R2 branch ONLY.
- Asserted isolation: seeds present on R2, absent from ngx main (still `bad1aed`), absent from this repo. Wrote WORKTREE-PROVENANCE-R2.md.

### Task 2 -- n=5 live captures + dual extraction + budget gate + Pass@k

- Ran n=3 then escalated to n=5 per skill (10 captures) from CWD = the R2 worktree, `--plugin-dir` = THIS repo's `plugins/lz-advisor` (the 13-04 FIXED agents), `--permission-mode auto`, prose target, `--verbose --output-format stream-json`.
- Verified a `result` event on every capture (`jq -e`); all 10 returned cleanly (no 429 / out_of_credits).
- Dual-extracted (D-03): SHAPE from parent `.result` -> `r2-<skill>-N.report.md`; BUDGET from the subagent JSONL assistant text (CWD hash `D--projects-github-LayZeeDK-ngx-smart-components-uat-13-r2`) -> `r2-<skill>-N.agent.md`.
- Ran `tests/D-reviewer-budget.sh --from-trace` / `tests/D-security-reviewer-budget.sh --from-trace` on every agent.md. SHAPE graded per run (four headers + analytical section + OWASP `[Axx]` security; anchored `\b(crit|imp|sug|q):` = 0).
- Recomputed Pass@k/Pass^k; wrote GRADE-LOG-R2.md (per-run rows) + PASS-K-R2.md.

### Task 3 -- teardown + UAT update

- D-08 custody gate: asserted all 30 capture files (10 report.md + 10 agent.md + 10 streamjson) + 10 err + GRADE-LOG-R2.md + PASS-K-R2.md + WORKTREE-PROVENANCE-R2.md present AND committed BEFORE teardown.
- Tore down by EXACT name: `worktree remove ...-uat-13-r2 --force` + `branch -D uat/phase-13-render-r2`. Post-teardown: ngx `worktree list` shows only `[main]` at `bad1aed`; `rev-parse --verify uat/phase-13-render-r2` fails; R2 path removed.
- Updated 13-UAT.md: SC-4 evidence rewritten with the R2 re-measure (per-run exits, residual detail), Pass@k tables updated (R2 authoritative + pre-fix baseline preserved), Summary updated, GAP-13-BUDGET-R2 appended (supersedes GAP-13-BUDGET), frontmatter `verdict` updated, status KEPT `needs-review` (SC-4 not fully PASS).

## Residual (GAP-13-BUDGET-R2): second concision iteration needed

The 13-04 fix landed in the right direction but did not fully eliminate the
per-finding over-cap. Three residual classes survive, all on the FIX/Question side
the first iteration under-addressed:

1. **Reviewer multi-clause Question** (r2-review-4, 45w): the reviewer grammar has
   NO 75w auto-clarity carve-out (13-04 FIX-4 was security-only), so a long reviewer
   Question is hard-capped at 28w with no escape. Candidate: a reviewer Question
   concision rule (FIX-4 analog) or a reviewer Per-finding-validation routing.
2. **Verbose security FIX-clause prose** (r2-security-1, four findings 30-33w): the
   remediation clause carries a code snippet (`execFile(...)`, `Authorization`
   header) + a second sentence. FIX-3 addressed FINDING-code reproduction; the FIX
   clause needs the same reference-by-shape discipline.
3. **Marginal reviewer deref-chain finding** (r2-review-3, 29w): a 1w overflow from
   a multi-clause causal chain; a terseness nudge in the reviewer body rule.

These are a follow-on gap-closure plan (an agent-contract rewrite, NOT patched in
this re-measure plan, per D-10 / WR-05). SC-4 stays NOT-fully-PASS and GATE-02 stays
PARTIAL until a third re-measure shows every run exit 0.

## GATE-02 close-out verdict

GATE-02 has two halves: (1) the render-proof half (SC-1/SC-2/SC-3/SC-5) -- fully
satisfied since 13-02/13-03 and re-confirmed here (SHAPE 10/10, Pass^k=1.0); and
(2) the budget half (SC-4) -- IMPROVED but NOT GREEN. GATE-02 is therefore still
**PARTIALLY satisfied**. The honest measured outcome supersedes the earlier
"close GATE-02" expectation: a second concision iteration is required first.

## Deviations from Plan

- **The plan expected SC-4 to re-measure GREEN (6/6) and GATE-02 to close.** The
  measured result is 7/10 (a large improvement, not a full pass). Per the plan's own
  explicit HONEST-OUTCOME clause (D-10) and the operational guidance, this is
  recorded faithfully as GAP-13-BUDGET-R2, NOT masked, NOT re-worded to pass, NOT
  patched inline. SC-4 stays `issue`/residual; status stays `needs-review`.
- **Escalated n=3 -> n=5 per skill** (plan floor was n>=3). A residual appeared on
  both skills at the n=3 floor and the session pool had clear headroom, so a fuller
  statistical picture was captured (10 valid captures, no 429).
- **Seeds recovered from the dangling seed commit `4fa7fd7`** rather than
  re-authored from the 13-01-SUMMARY inventory. The commit object survives the
  branch deletion; `diff` confirmed byte-identical to the original, guaranteeing the
  SAME deterministic defect shape with zero transcription drift.

## Known Stubs

None -- this plan produces evidence files (captures + grades) and markdown record
updates, not source code. All seeded review targets were consumed live; no
placeholder/empty-data surfaces.

## Self-Check: PASSED

- All 30 R2 capture files + 3 record files present in uat/ (verified via `git ls-files`: 10 report.md, 10 agent.md, 10 streamjson committed).
- Commits exist: `411c28f` (Task 1), `1055b1f` (Task 2a), `a5159ab` (Task 2b), `28fdcf3` (Task 3).
- Per-run BUDGET exits re-verified individually (script-file loop): reviewer [0,0,1,1,0], security [1,0,0,0,0] -- combined c=7/10.
- R2 worktree + branch torn down: ngx `worktree list` = `[main]` only; `rev-parse --verify uat/phase-13-render-r2` fails.
