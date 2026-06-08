---
phase: 13-empirical-verification
verified: 2026-06-08T00:00:00Z
status: gaps_found
score: 4/5 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  round: 2
  gaps_closed: []
  gaps_remaining:
    - "SC-4: per-finding 28w budget still over-cap on 3/10 LIVE runs after the 13-04 concision fix (GAP-13-BUDGET -> GAP-13-BUDGET-R2)"
  gaps_improved:
    - "SC-4: combined fully-passing c=2/6 -> 7/10; Pass@1 0.333 -> 0.700; security half 0/3 -> 4/5; worst finding-body overshoot 46w -> 33w"
  regressions: []
gaps:
  - truth: "SC-4: an empirical n>=3 budget-gate run on the new grammar confirms both agents stay within the per-finding word-budget cap on LIVE agent emission (measured, not reasoned)"
    status: partial
    reason: "RE-MEASURED in round 2 (Plan 13-05, n=5 per skill) against the 13-04 FIXED agents (commit 5085bca). Independently re-ran tests/D-*-budget.sh --from-trace against all 10 committed r2-*.agent.md captures in my own process. The 28w per-finding cap held on 7/10 LIVE runs (reviewer 3/5, security 4/5) -- a LARGE improvement from the pre-fix 2/6 -- but 3/10 runs retain a residual over-cap. SC-4 PASS requires EVERY run exit 0, so SC-4 is IMPROVED but NOT yet fully GREEN. This is the budget half of the phase goal ('the budget stays within cap on the new grammar') and is still NOT met; GATE-02 stays PARTIAL. The SHAPE/shorthand half of the goal IS achieved (SC-1/2/3/5 PASS, re-confirmed on 10/10 R2 runs)."
    artifacts:
      - path: "plugins/lz-advisor/agents/reviewer.md"
        issue: "Two residual reviewer over-caps: (1) r2-review-3 Finding 5 = 29w -- a marginal 1w overflow from a multi-clause deref-chain body; (2) r2-review-4 = 45w multi-clause Question -- the REVIEWER grammar has NO 75w auto-clarity carve-out (13-04 FIX-4 was security-only; reviewer's only escape valve is the 60w per_finding_validation), so a long reviewer Question is hard-capped at 28w with no sanctioned escape."
      - path: "plugins/lz-advisor/agents/security-reviewer.md"
        issue: "One residual security over-cap: r2-security-1 = four findings at 30-33w -- verbose FIX-clause prose carrying a remediation code snippet (execFile(...), Authorization header) plus a second clause. 13-04 FIX-3 addressed FINDING-side code reproduction; the FIX clause needs the same reference-by-shape discipline. The 4 over-cap security findings (33/33/33/30w) are all the remediation-prose family, not the inline-code family FIX-3 targeted."
    missing:
      - "FIX-R2-A (reviewer.md): add a reviewer Question concision rule. The reviewer has NO 75w auto-clarity carve-out (only security does, bracket-gated on [CVE]/[GHSA]/[CWE]). Either (a) add an analogous reviewer Question carve-out, or (b) route long-Question elaboration into the reviewer's existing 60w ### Per-finding validation section, keeping the Question body <=28w. r2-review-4's 45w multi-clause type-mismatch Question is the target shape."
      - "FIX-R2-B (security-reviewer.md): extend the FIX-3 reference-by-shape discipline to the FIX/remediation clause, not just the FINDING/threat clause. r2-security-1's four 30-33w findings each pack a remediation code snippet (execFile arg-array, Authorization header) + a second sentence into the fix clause. Reference the remediation by shape (name the safe API in backticks, point at the pattern) instead of pasting a full call expression + a second clause."
      - "FIX-R2-C (reviewer.md): a marginal terseness nudge in the reviewer body rule for multi-clause causal chains. r2-review-3 Finding 5 = 29w (1w over) bundled a deref + a TypeError + a swallowed-catch + a both-return-null consequence into one finding body. A split-the-causal-chain or trim-to-the-defect nudge clears the marginal case."
      - "CAP VERDICT (unchanged from round 1, CONFIRMED): do NOT recalibrate the 28w cap. Independently verified the agents still carry per_entry max_words=22 / outlier_soft_cap=28 / auto_clarity_cap=75 (security only) and the fixtures still carry PER_ENTRY_CAP=28 / MIN_FINDINGS=5 / AUTO_CLARITY_CAP=75 -- 13-04 did NOT recalibrate any cap and did NOT modify tests/ to game the gate (commit 5085bca touched only the two agent .md files). The residual is agent VERBOSITY on the FIX/Question side, addressable with the contract's existing 60w per-finding-validation valve (reviewer) + reference-by-shape discipline (security)."
      - "ATOMICITY (WR-05 guard, unchanged): apply FIX-R2-A..C to BOTH agents' rules AND every affected worked example in ONE atomic plan; the grouped grammar SHAPE (SC-1/SC-2) must stay byte-intact (it is already flawless 10/10 on R2). 13-04 honored this (SHAPE/AGNT-03 byte-intact; both fixtures self-extract GREEN on the edited examples) -- the R2 follow-on must do the same."
      - "RE-MEASURE SC-4 a THIRD time on live output after the second fix: re-provision the deterministic UAT substrate from uat/WORKTREE-PROVENANCE-R2.md (base 019a26a; seeds recoverable byte-identical from the dangling seed commit 4fa7fd7 via git show), re-run the n>=3 headless claude -p captures per skill, re-run the --from-trace budget gate; SC-4 closes only when EVERY run exits 0."
      - "DISPOSITION (D-10, carried forward): close in-phase via a follow-on `/gsd:plan-phase 13 --gaps` -> one atomic agent-edit plan (FIX-R2-A..C) + one re-measure plan -> `/gsd:execute-phase 13 --gaps-only` -> re-verify. GATE-02 stays PARTIAL and REQUIREMENTS.md GATE-02 stays Pending until the third re-measure is GREEN on every run."
human_verification: []
---

# Phase 13: Empirical verification Verification Report

**Phase Goal:** Behavioral and budget evidence confirms the rewritten grammar actually reaches the rendered user-facing report on both review skills, the budget stays within cap on the new grammar, and no unintended shorthand residue or `.planning/` history corruption slipped in.
**Verified:** 2026-06-08
**Status:** gaps_found
**Re-verification:** Yes -- round 2, after the GAP-13-BUDGET gap-closure (Plans 13-04 + 13-05). Round-1 record preserved below the R2 section for the audit trail.
**Requirement:** GATE-02 (Phase 13)

## Re-Verification (R2)

This round re-verifies the phase goal after the GAP-13-BUDGET gap-closure landed two plans:

- **13-04 (commit `5085bca`):** FIX-1..4 concision discipline applied to `plugins/lz-advisor/agents/reviewer.md` + `security-reviewer.md` (route severity-divergence rationale to `### Per-finding validation`; one-issue-per-finding; reference-code-by-location; resolve the security auto-clarity carve-out ambiguity). CAP unchanged; SHAPE + AGNT-03 byte-intact.
- **13-05:** RE-MEASURED SC-4 on LIVE output (n=5 per skill, escalated from the n=3 floor) against the FIXED agents, in a fresh R2 worktree off `019a26a`. Committed `uat/r2-*` captures (10 streamjson + 10 report.md + 10 agent.md), `GRADE-LOG-R2.md`, `PASS-K-R2.md`, `WORKTREE-PROVENANCE-R2.md`.

### What I re-ran independently (did NOT trust 13-04/13-05-SUMMARY or 13-UAT.md)

| Check | Method | Result |
| ----- | ------ | ------ |
| **SC-4 reviewer (the gap)** | `bash tests/D-reviewer-budget.sh --from-trace uat/r2-review-{1..5}.agent.md` in my own process | exits `[0, 0, 1, 1, 0]` -> **c=3/5**. review-3 Finding 5 = 29w (1w over); review-4 = 45w multi-clause Question. Reproduces GRADE-LOG-R2 exactly. |
| **SC-4 security (the gap)** | `bash tests/D-security-reviewer-budget.sh --from-trace uat/r2-security-{1..5}.agent.md` | exits `[1, 0, 0, 0, 0]` -> **c=4/5**. security-1 = four findings at 33/33/33/30w (verbose FIX-clause prose). Reproduces exactly. |
| **Combined SC-4** | sum of the two | **c=7/10**; SC-4 PASS needs every run exit 0 -> **3/10 over-cap, SC-4 NOT GREEN** |
| **SC-1 SHAPE (no regression)** | grouped-header + anchored-shorthand grep on `uat/r2-review-{1,3,4}.report.md` | all four `### Critical/Important/Suggestions/Questions` + `### Cross-Cutting Patterns` present; anchored `\b(crit\|imp\|sug\|q):` = 0 (exit 1). No SHAPE regression. |
| **SC-2 SHAPE (no regression)** | header + OWASP `[Axx]` + anchored-shorthand grep on `uat/r2-security-{1,2,4}.report.md` | four headers + `### Threat Patterns` + OWASP `[Axx]` byte-intact; anchored shorthand = 0 (exit 1). No SHAPE regression. |
| **SC-3 provenance** | `r2-*.streamjson` `init.cwd` + live ngx `worktree list` + branch rev-parse + checkpoint rev-parse | init.cwd = `ngx-smart-components-uat-13-r2`; ngx `[main]` only at `bad1aed` (untouched); `uat/phase-13-render-r2` deleted (exit 128); `019a26a` checkpoint intact. |
| **SC-5 residue sweep (post-edit)** | three scoped `git grep` over `plugins/lz-advisor/` | unanchored `crit:\|imp:\|sug:\|q:` exit 1; anchored exit 1; `formerly High\|formerly Medium` exit 1. Clean after the 13-04 agent edits. |
| **CAP not recalibrated** | `git grep` cap constants in agents + fixtures; `git show --stat 5085bca` | agents: `max_words=22 outlier_soft_cap=28 auto_clarity_cap=75`; fixtures: `PER_ENTRY_CAP=28 MIN_FINDINGS=5 AUTO_CLARITY_CAP=75` -- all unchanged. Commit 5085bca touched ONLY the two agent `.md` files; `tests/` untouched. |
| **Fixtures not gamed** | `bash tests/D-*-budget.sh` (self-extract) + `--self-test` | self-extract exit 0 on the EDITED holistic examples; `--self-test` exit 1 (anti-vacuous guard fires). Gate integrity intact. |
| **D-08 evidence custody** | `jq -e 'select(.type=="result")'` on all 10 R2 streamjson | all 10 have a real result event; captures survived teardown. |

### R2 verdict

**The 13-04 fix produced a LARGE, independently-confirmed measured improvement, but SC-4 is still NOT fully GREEN.**

| Metric | Pre-fix (round 1, n=6) | Post-fix R2 (round 2, n=10) | Delta |
| ------ | ---------------------- | --------------------------- | ----- |
| Combined fully-passing c/n | 2/6 (0.333) | 7/10 (0.700) | **+0.367 Pass@1** |
| Reviewer c/n | 2/3 | 3/5 | worst overshoot 46w -> 29w finding / 45w Question |
| Security c/n | 0/3 | 4/5 | **0.000 -> 0.800 Pass@1 (large)** |
| Worst finding-body overshoot | 46w (review-2) | 33w (security-1) / 29w (review-3) | **collapsed 46w -> 33w** |
| SHAPE-only Pass^k | 1.0 | 1.0 | held (saturated, 10/10 clean) |

The fix worked in the intended direction (the security half went 0/3 -> 4/5; the worst finding-body overshoot collapsed 46w -> 33w) but did NOT eliminate the per-finding over-cap on every run. **3/10 R2 runs retain a residual** -- now reclassified as **GAP-13-BUDGET-R2** (a SECOND concision iteration is required):

1. **Reviewer multi-clause Question** (r2-review-4, 45w): the reviewer grammar has NO 75w auto-clarity carve-out, so a long Question is hard-capped at 28w with no escape. Fix candidate: reviewer Question concision rule (a FIX-4 analog) OR route Question elaboration into the reviewer's existing 60w `### Per-finding validation`.
2. **Verbose security FIX-clause prose** (r2-security-1, four findings 30-33w): 13-04 FIX-3 addressed FINDING-side code reproduction; the FIX/remediation clause still packs a code snippet + a second clause. Fix candidate: extend reference-by-shape discipline to the FIX clause.
3. **Marginal reviewer deref-chain finding** (r2-review-3, 29w): a 1w overflow from a multi-clause causal chain. Fix candidate: a terseness nudge in the reviewer body rule.

**GATE-02 remains PARTIAL** -- the render half (SC-1/SC-2/SC-3/SC-5) is fully satisfied and re-confirmed on 10/10 R2 runs (SHAPE Pass^k = 1.0); the budget half (SC-4) is IMPROVED but not closed. GATE-02 is NOT marked green; REQUIREMENTS.md GATE-02 correctly stays `Pending`. The honest measured progress (combined 2/6 -> 7/10; worst overshoot 46w -> 33w) is on record so the improvement is auditable.

### R2 Observable Truths

| #   | Truth (Success Criterion)                                                                                                       | Status (R2) | Evidence |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| SC-1 | `:review` rendered report has the four grouped spelled-out headers + Cross-Cutting Patterns, zero shorthand (LIVE)             | VERIFIED    | Independently graded `uat/r2-review-{1,3,4}.report.md`: four headers + `### Cross-Cutting Patterns` present; anchored shorthand = 0. No regression from the 13-04 edit. SHAPE-only Pass^k = 1.0 across all 5 reviewer R2 runs. |
| SC-2 | `:security-review` grouped shape + OWASP `[Axx]` + zero shorthand (LIVE)                                                       | VERIFIED    | Independently graded `uat/r2-security-{1,2,4}.report.md`: four headers + `### Threat Patterns` + OWASP `[Axx]` byte-intact; anchored shorthand = 0. No regression. SHAPE-only Pass^k = 1.0 across all 5 security R2 runs. |
| SC-3 | Ran in a dedicated worktree off checkpoint `019a26a`, never ngx main                                                            | VERIFIED    | `r2-*.streamjson` `init.cwd = ngx-smart-components-uat-13-r2`; ngx `worktree list` = `[main]` only (`bad1aed`, untouched); `uat/phase-13-render-r2` deleted (exit 128); checkpoint `019a26a` intact. `WORKTREE-PROVENANCE-R2.md` EXPECTED_BASE == ACTUAL_BASE == `019a26a`. |
| SC-4 | n>=3 budget gate GREEN on LIVE emission via `--from-trace`, both skills (per-finding 28w cap)                                  | **FAILED**  | Independently re-ran the fixtures on all 10 R2 agent.md: reviewer `[0,0,1,1,0]`, security `[1,0,0,0,0]` -> combined **c=7/10**. 3/10 over-cap (29w deref-chain; 45w uncarved reviewer Question; 4x 30-33w security FIX-clause prose). IMPROVED from 2/6 but NOT GREEN. = **GAP-13-BUDGET-R2**. |
| SC-5 | Scoped `git grep` residue sweep clean in `plugins/lz-advisor/`; frozen `.planning/` history untouched                          | VERIFIED    | Independently re-ran after the 13-04 agent edits: unanchored `crit:\|imp:\|sug:\|q:` exit 1; anchored exit 1; `formerly High\|formerly Medium` exit 1. ZERO matches under `plugins/lz-advisor/` (cleaner than round 1 -- even the unanchored form is clean in the plugin tree). |

**R2 Score:** 4/5 truths verified (SC-1, SC-2, SC-3, SC-5 PASS; SC-4 FAILED -> GAP-13-BUDGET-R2)

### R2 Anti-Patterns / Regression Check

| Check | Result |
| ----- | ------ |
| 13-04 recalibrated the cap? | NO -- agents `22/28/75` + fixtures `28/5/75` unchanged |
| 13-04 modified `tests/` to game the gate? | NO -- commit 5085bca touched ONLY `agents/reviewer.md` + `agents/security-reviewer.md` |
| SHAPE regressed by the fix? | NO -- 10/10 R2 reports clean; four grouped headers + analytical section + OWASP `[Axx]` byte-intact; anchored shorthand 0/10 |
| AGNT-03 protected behaviors intact? | YES -- `verify_request` (13/14x) + lowercase `severity=` machine attrs (3x each) present in both agents |
| Fixture self-extract GREEN on edited examples? | YES -- both self-extract exit 0; both `--self-test` exit 1 (anti-vacuous fires) |
| Debt markers (TBD/FIXME/XXX) in modified files? | NONE (the modified files are agent contracts + evidence markdown) |

---

# Round 1 (initial verification) -- preserved for the audit trail

> The section below is the original 2026-06-08 round-1 report (status gaps_found, GAP-13-BUDGET on 4/6 LIVE runs). It is preserved verbatim for the audit trail; the R2 section above supersedes its SC-4 verdict (now GAP-13-BUDGET-R2, 3/10 LIVE runs).

## Verification Method (round 1)

This is a VERIFY-ONLY (meta) phase whose deliverables are EVIDENCE, not new production source. Every claim below was independently re-derived from the committed evidence files -- I did NOT trust the SUMMARY/UAT narratives:

- **SC-4 (the load-bearing gap):** I re-ran `bash tests/D-reviewer-budget.sh --from-trace` and `bash tests/D-security-reviewer-budget.sh --from-trace` against all 6 captured `*.agent.md` LIVE emissions in my own process. Exit codes and per-finding word counts reproduced the GRADE-LOG verdict exactly (see table).
- **SC-1/SC-2 (SHAPE):** I graded all 6 `*.report.md` rendered reports myself (grouped-header greps, anchored vs unanchored shorthand, OWASP `[Axx]` extraction), and inspected the unanchored hits to confirm the `q:`-in-`req:` false positive.
- **SC-3:** I read the captured stream-json `init` events directly -- `cwd = ...ngx-smart-components-uat-13` -- and re-checked the ngx worktree list + branch deletion live.
- **SC-5:** I re-ran the three scoped `git grep` sweeps over `plugins/lz-advisor/` myself and re-derived the structural-scoping proof.

## Goal Achievement (round 1)

The phase goal has TWO halves joined by "and":
1. "the rewritten grammar actually reaches the rendered user-facing report on both review skills" -- **ACHIEVED** (SC-1, SC-2, plus SC-3 isolation and SC-5 residue cleanliness).
2. "the budget stays within cap on the new grammar" -- **NOT ACHIEVED** (SC-4 fails on LIVE emission, GAP-13-BUDGET).

Because the goal is a conjunction, achieving the first half does not satisfy the goal. The milestone v1.0.1 *core* objective (no shorthands in user-facing reports) is empirically proven; the *budget-neutrality* half of this phase's goal is empirically disproven. **GATE-02 is PARTIALLY satisfied -- SC-4 open.**

### Observable Truths (round 1)

| #   | Truth (Success Criterion)                                                                                                            | Status     | Evidence |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- | -------- |
| SC-1 | `:review` rendered report has the four grouped spelled-out headers + Cross-Cutting Patterns, zero shorthand (LIVE, n=3)            | VERIFIED   | Independently graded `uat/review-{1,2,3}.report.md`: each has `### Critical`/`### Important`/`### Suggestions`/`### Questions` (1 each) + `### Cross-Cutting Patterns`; anchored `\b(crit\|imp\|sug\|q):` = 0 on all 3. Unanchored fired 1x on review-1 + review-3 -- both are `q:` inside `req: RawRequest` (TS identifier in a finding body), confirmed innocuous prose, not severity shorthand. |
| SC-2 | `:security-review` same grouped shape + OWASP `[Axx]` preserved + zero shorthand (LIVE, n=3)                                       | VERIFIED   | Independently graded `uat/security-{1,2,3}.report.md`: each has `### Critical` + `### Threat Patterns`; OWASP tags preserved byte-intact (`[A01] [A02] [A03] [A06] [A07] [A09]`, security-3 also `[A04]`); anchored shorthand = 0 on all 3; zero unanchored false positives. |
| SC-3 | Ran in a dedicated worktree off the confirmed checkpoint `lz-advisor-compodoc-storybook-uat-base` (@019a26a), never ngx main      | VERIFIED   | Captured stream-json `init` events show `cwd = D:\projects\github\LayZeeDK\ngx-smart-components-uat-13` (review-1, security-1). `WORKTREE-PROVENANCE.md`: EXPECTED_BASE == ACTUAL_BASE == `019a26a`. Live re-check: ngx `worktree list` = `[main]` only (`bad1aed`, untouched); `uat/phase-13-render` deleted (rev-parse exit 128); checkpoint `019a26a` intact for re-provisioning. |
| SC-4 | n>=3 budget gate GREEN on LIVE agent emission via `tests/D-*-budget.sh --from-trace`, both skills (per-finding 28-word cap)        | **FAILED** | Independently re-ran the fixtures: review-1 exit 0 / review-2 **exit 1 (46>28)** / review-3 exit 0 / security-1 **exit 1 (35>28)** / security-2 **exit 1 (31>28)** / security-3 **exit 1 (34>28 and 36>28)**. 4/6 over-cap; combined fully-passing c=2/6. Every run cleared MIN_FINDINGS (6-8 parsed) -- the over-caps are real, not thin-target artifacts. = **GAP-13-BUDGET**. |
| SC-5 | Scoped `git grep` residue sweep clean in `plugins/lz-advisor/`; frozen `.planning/` history untouched                              | VERIFIED   | Independently re-ran: `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` exit 1; anchored form exit 1; `formerly High\|formerly Medium` exit 1. 0 files under `plugins/lz-advisor/` match. Frozen `.planning/milestones/` last touched by `84f6e77 chore: complete v1.0 milestone` (not by Phase 13); `.planning/` working tree clean. |

**Score (round 1):** 4/5 truths verified (SC-1, SC-2, SC-3, SC-5 PASS; SC-4 FAILED)

### Required Artifacts (round 1)

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `uat/WORKTREE-PROVENANCE.md` | EXPECTED_BASE match + worktree list (SC-3) | VERIFIED | Exists, contains `uat/phase-13-render` + `019a26a`. |
| `uat/GRADE-LOG.md` | Per-run SHAPE + BUDGET + findings count | VERIFIED | Exists; per-run rows reproduce my independent fixture re-run exactly. |
| `uat/PASS-K.md` | Pass@k/Pass^k per skill + overall | VERIFIED | Exists; combined c=2/6, SHAPE-only c=6/6. |
| `uat/RESIDUE-SWEEP.md` | Exit-1 evidence both sweeps + teardown | VERIFIED | Exists; sweep verdicts reproduce my independent re-run. |
| `13-UAT.md` | 5 SCs + Pass@k + gaps | VERIFIED | Exists; honest mixed-outcome record, SC-4 = issue. |
| 6x `*.report.md` | Rendered user-facing reports (SHAPE source) | VERIFIED | All 6 present, substantive, graded clean. |
| 6x `*.agent.md` | Subagent LIVE emission (BUDGET source) | VERIFIED | All 6 present, substantive; fed to `--from-trace`. |

### Requirements Coverage (round 1)

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| GATE-02 | 13-01, 13-02, 13-03 | Headless `claude -p` UAT proves grouped spelled-out reports reach rendered output on both review skills; ngx run uses a dedicated worktree off the checkpoint | **PARTIAL** | The render-proof half is fully satisfied (SC-1/SC-2 rendered reports clean 6/6; SC-3 dedicated worktree off `019a26a`; SC-5 residue clean). The budget half (SC-4, part of the phase goal "budget stays within cap") is NOT satisfied -- 4/6 LIVE over-cap (GAP-13-BUDGET). REQUIREMENTS.md correctly still shows GATE-02 `Pending`. |

## Gaps Summary (round 1)

**GAP-13-BUDGET (BLOCKER for GATE-02 / SC-4) -- independently confirmed real.**

The reviewer/security-reviewer per-finding 28-word cap (`PER_ENTRY_CAP=28`) is exceeded on **4 of 6 LIVE agent emissions**. I re-ran the binding budget fixtures myself against the committed `*.agent.md` captures and reproduced the GRADE-LOG verdict exactly:

- review-1: exit 0 (clean, 6 findings)
- review-2: **exit 1** -- Finding 1 = 46w > 28 (severity-divergence rationale bundled into the finding body)
- review-3: exit 0 (clean, 7 findings)
- security-1: **exit 1** -- Finding 4 = 35w > 28 (two sinks merged into one `[A02]` finding)
- security-2: **exit 1** -- Finding 3 = 31w > 28 (verbose inline `curl` code reproduction)
- security-3: **exit 1** -- Finding 2 = 34w + Finding 8 = 36w > 28 (second-order-injection code reproduction + multi-clause Question body)

**Disposition (CONTEXT D-10):** route to an in-phase gap-closure REPLAN (agent-contract concision tightening). **SC-4 MUST be RE-MEASURED on live output after the fix.** [SUPERSEDED by the R2 section above: the fix landed as 13-04 + the re-measure as 13-05; SC-4 improved to 7/10 but remains a residual -> GAP-13-BUDGET-R2.]

---

_Verified: 2026-06-08 (round 1); re-verified 2026-06-08 (round 2 -- post GAP-13-BUDGET gap-closure)_
_Verifier: Claude (gsd-verifier) -- independent re-measurement against committed evidence_
