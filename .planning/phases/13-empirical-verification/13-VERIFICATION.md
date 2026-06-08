---
phase: 13-empirical-verification
verified: 2026-06-08T00:00:00Z
status: gaps_found
score: 4/5 must-haves verified
overrides_applied: 0
gaps:
  - truth: "SC-4: an empirical n>=3 budget-gate run on the new grammar confirms both agents stay within the per-finding word-budget cap on LIVE agent emission (measured, not reasoned)"
    status: failed
    reason: "Independently re-ran tests/D-*-budget.sh --from-trace against all 6 captured *.agent.md emissions. The per-finding PER_ENTRY_CAP=28 is exceeded on 4 of 6 LIVE runs. This is the budget half of the phase goal ('the budget stays within cap on the new grammar') and is NOT met; GATE-02 is therefore only PARTIALLY satisfied. The SHAPE/shorthand half of the goal IS achieved (SC-1/2/3/5 PASS)."
    artifacts:
      - path: "plugins/lz-advisor/agents/reviewer.md"
        issue: "Live emission appends a verbose severity-divergence rationale to a finding body (review-2: Finding 1 = 46w > 28); the per-finding output constraint does not bound the live-emission span the way it bounds the hand-authored worked example the Phase 11/12 fixtures self-extracted."
      - path: "plugins/lz-advisor/agents/security-reviewer.md"
        issue: "Live emission overshoots the per-finding cap by merging multi-sink findings (security-1: Finding 4 = 35w), embedding inline code reproductions (security-2: Finding 3 = 31w; security-3: Finding 2 = 34w), and emitting multi-clause Question-tier bodies (security-3: Finding 8 = 36w). 3/3 security runs over-cap."
    missing:
      - "Agent-contract concision tightening in plugins/lz-advisor/agents/reviewer.md + security-reviewer.md so the per-finding span stays <=28w on LIVE emission (keep severity-divergence rationale / multi-sink splits / inline code snippets out of the counted finding body, or split bundled findings)."
      - "Re-measure SC-4 on live output after the fix: re-provision the deterministic UAT substrate from uat/WORKTREE-PROVENANCE.md (base 019a26a, review-src/handler.ts + review-src/disk-info.ts), re-run the n>=3 headless claude -p captures, and re-run the --from-trace budget gate to GREEN."
      - "Disposition (CONTEXT D-10): route to a Phase 12.x gap-closure REPLAN; do NOT patch the agent contract inside this verify phase (WR-05 partial-rewrite scar). Surface GAP-13-BUDGET to the user for the spin-up decision before GATE-02 is marked green."
human_verification: []
---

# Phase 13: Empirical verification Verification Report

**Phase Goal:** Behavioral and budget evidence confirms the rewritten grammar actually reaches the rendered user-facing report on both review skills, the budget stays within cap on the new grammar, and no unintended shorthand residue or `.planning/` history corruption slipped in.
**Verified:** 2026-06-08
**Status:** gaps_found
**Re-verification:** No -- initial verification
**Requirement:** GATE-02 (Phase 13)

## Verification Method

This is a VERIFY-ONLY (meta) phase whose deliverables are EVIDENCE, not new production source. Every claim below was independently re-derived from the committed evidence files -- I did NOT trust the SUMMARY/UAT narratives:

- **SC-4 (the load-bearing gap):** I re-ran `bash tests/D-reviewer-budget.sh --from-trace` and `bash tests/D-security-reviewer-budget.sh --from-trace` against all 6 captured `*.agent.md` LIVE emissions in my own process. Exit codes and per-finding word counts reproduced the GRADE-LOG verdict exactly (see table).
- **SC-1/SC-2 (SHAPE):** I graded all 6 `*.report.md` rendered reports myself (grouped-header greps, anchored vs unanchored shorthand, OWASP `[Axx]` extraction), and inspected the unanchored hits to confirm the `q:`-in-`req:` false positive.
- **SC-3:** I read the captured stream-json `init` events directly -- `cwd = ...ngx-smart-components-uat-13` -- and re-checked the ngx worktree list + branch deletion live.
- **SC-5:** I re-ran the three scoped `git grep` sweeps over `plugins/lz-advisor/` myself and re-derived the structural-scoping proof.

## Goal Achievement

The phase goal has TWO halves joined by "and":
1. "the rewritten grammar actually reaches the rendered user-facing report on both review skills" -- **ACHIEVED** (SC-1, SC-2, plus SC-3 isolation and SC-5 residue cleanliness).
2. "the budget stays within cap on the new grammar" -- **NOT ACHIEVED** (SC-4 fails on LIVE emission, GAP-13-BUDGET).

Because the goal is a conjunction, achieving the first half does not satisfy the goal. The milestone v1.0.1 *core* objective (no shorthands in user-facing reports) is empirically proven; the *budget-neutrality* half of this phase's goal is empirically disproven. **GATE-02 is PARTIALLY satisfied -- SC-4 open.**

### Observable Truths

| #   | Truth (Success Criterion)                                                                                                            | Status     | Evidence |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- | -------- |
| SC-1 | `:review` rendered report has the four grouped spelled-out headers + Cross-Cutting Patterns, zero shorthand (LIVE, n=3)            | VERIFIED   | Independently graded `uat/review-{1,2,3}.report.md`: each has `### Critical`/`### Important`/`### Suggestions`/`### Questions` (1 each) + `### Cross-Cutting Patterns`; anchored `\b(crit\|imp\|sug\|q):` = 0 on all 3. Unanchored fired 1x on review-1 + review-3 -- both are `q:` inside `req: RawRequest` (TS identifier in a finding body), confirmed innocuous prose, not severity shorthand. |
| SC-2 | `:security-review` same grouped shape + OWASP `[Axx]` preserved + zero shorthand (LIVE, n=3)                                       | VERIFIED   | Independently graded `uat/security-{1,2,3}.report.md`: each has `### Critical` + `### Threat Patterns`; OWASP tags preserved byte-intact (`[A01] [A02] [A03] [A06] [A07] [A09]`, security-3 also `[A04]`); anchored shorthand = 0 on all 3; zero unanchored false positives. |
| SC-3 | Ran in a dedicated worktree off the confirmed checkpoint `lz-advisor-compodoc-storybook-uat-base` (@019a26a), never ngx main      | VERIFIED   | Captured stream-json `init` events show `cwd = D:\projects\github\LayZeeDK\ngx-smart-components-uat-13` (review-1, security-1). `WORKTREE-PROVENANCE.md`: EXPECTED_BASE == ACTUAL_BASE == `019a26a`. Live re-check: ngx `worktree list` = `[main]` only (`bad1aed`, untouched); `uat/phase-13-render` deleted (rev-parse exit 128); checkpoint `019a26a` intact for re-provisioning. |
| SC-4 | n>=3 budget gate GREEN on LIVE agent emission via `tests/D-*-budget.sh --from-trace`, both skills (per-finding 28-word cap)        | **FAILED** | Independently re-ran the fixtures: review-1 exit 0 / review-2 **exit 1 (46>28)** / review-3 exit 0 / security-1 **exit 1 (35>28)** / security-2 **exit 1 (31>28)** / security-3 **exit 1 (34>28 and 36>28)**. 4/6 over-cap; combined fully-passing c=2/6. Every run cleared MIN_FINDINGS (6-8 parsed) -- the over-caps are real, not thin-target artifacts. = **GAP-13-BUDGET**. |
| SC-5 | Scoped `git grep` residue sweep clean in `plugins/lz-advisor/`; frozen `.planning/` history untouched                              | VERIFIED   | Independently re-ran: `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` exit 1; anchored form exit 1; `formerly High\|formerly Medium` exit 1. 0 files under `plugins/lz-advisor/` match. Frozen `.planning/milestones/` last touched by `84f6e77 chore: complete v1.0 milestone` (not by Phase 13); `.planning/` working tree clean. |

**Score:** 4/5 truths verified (SC-1, SC-2, SC-3, SC-5 PASS; SC-4 FAILED)

### Must-Haves Check (from PLAN frontmatter)

| Plan | Must-have category | Status | Note |
| ---- | ------------------ | ------ | ---- |
| 13-01 | SC-3 worktree off 019a26a, never main (D-06/D-07) | VERIFIED | Provenance + live re-check; capture `init.cwd` confirms worktree CWD. |
| 13-01 | Seeded slices yield >=5 findings each | VERIFIED | Budget fixtures parsed 6-8 findings per run (anti-vacuous cleared on all 6). |
| 13-01 | Evidence-custody dir in this repo (D-08) | VERIFIED | `uat/.gitkeep` present; all 15 captures survived teardown. |
| 13-02 | SC-1 grouped headers + zero shorthand (LIVE) | VERIFIED | Independently graded report.md x3. |
| 13-02 | SC-2 grouped + `[Axx]` + zero shorthand (LIVE) | VERIFIED | Independently graded report.md x3. |
| 13-02 | SC-4 n>=3 budget GREEN on LIVE agent emission (D-04) | **FAILED** | Independently re-ran fixtures: 4/6 over-cap. GAP-13-BUDGET. |
| 13-02 | Pass@k/Pass^k reported per skill + overall | VERIFIED | `PASS-K.md` present; arithmetic checks out (c=2/6 combined; SHAPE-only c=6/6). |
| 13-03 | SC-5 scoped sweep clean; frozen history untouched (D-09) | VERIFIED | Independently re-ran all three sweeps (exit 1); structural scoping holds. |
| 13-03 | Worktree torn down after D-08 extraction | VERIFIED | ngx `[main]`-only; branch deleted; evidence intact in this repo. |
| 13-03 | 13-UAT.md records all 5 SCs + Pass@k + gaps (D-10) | VERIFIED | `13-UAT.md` has per-SC entries, Pass@k/Pass^k tables, `## Gaps` GAP-13-BUDGET with D-10 routing, `status: needs-review`. |

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `uat/WORKTREE-PROVENANCE.md` | EXPECTED_BASE match + worktree list (SC-3) | VERIFIED | Exists, contains `uat/phase-13-render` + `019a26a`. SDK artifact check passed. |
| `uat/.gitkeep` | Evidence custody dir (D-08) | VERIFIED | Exists; dir survived teardown with 15 files. |
| `uat/GRADE-LOG.md` | Per-run SHAPE + BUDGET + findings count | VERIFIED | Exists; per-run rows reproduce my independent fixture re-run exactly. |
| `uat/PASS-K.md` | Pass@k/Pass^k per skill + overall | VERIFIED | Exists; combined c=2/6, SHAPE-only c=6/6. |
| `uat/RESIDUE-SWEEP.md` | Exit-1 evidence both sweeps + teardown | VERIFIED | Exists; sweep verdicts reproduce my independent re-run. |
| `13-UAT.md` | 5 SCs + Pass@k + gaps | VERIFIED | Exists; honest mixed-outcome record, SC-4 = issue. |
| 6x `*.report.md` | Rendered user-facing reports (SHAPE source) | VERIFIED | All 6 present, substantive (279-404w), graded clean. |
| 6x `*.agent.md` | Subagent LIVE emission (BUDGET source) | VERIFIED | All 6 present, substantive (310-467w); fed to `--from-trace`. |
| 6x `*.streamjson` | Raw captures | VERIFIED | All 6 contain a real `result` event + distinct session IDs; init `cwd` = worktree. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| stream-json STDOUT | report.md (SHAPE) | `jq .result` | WIRED | report.md content matches the grouped grammar; greps pass. |
| result `.session_id` | agent.md (BUDGET) | subagent JSONL extraction | WIRED | All 6 agent.md are substantive emissions; session IDs present in captures. |
| agent.md | `tests/D-*-budget.sh --from-trace` | live budget gate | WIRED (gate RED) | The pipeline is correctly wired -- the gate runs and parses; it correctly returns exit 1 on the 4 over-cap runs. The wiring is sound; the LIVE OUTPUT fails the cap. |
| `git grep` sweep | `-- plugins/lz-advisor/` pathspec | structural scope | WIRED | Pathspec excludes all `.planning/` history; 0 plugin-tree matches. |
| worktree teardown | evidence already in this repo's uat/ | D-08 gate | WIRED | All 15 files committed before teardown; nothing lost. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Reviewer budget gate on LIVE emission (n=3) | `bash tests/D-reviewer-budget.sh --from-trace uat/review-{1,2,3}.agent.md` | review-1 exit 0 (9/9), review-2 exit 1 (8/9, Finding1 46>28), review-3 exit 0 (10/10) | PASS (gate ran; correctly RED on review-2) |
| Security budget gate on LIVE emission (n=3) | `bash tests/D-security-reviewer-budget.sh --from-trace uat/security-{1,2,3}.agent.md` | security-1 exit 1 (35>28), security-2 exit 1 (31>28), security-3 exit 1 (34>28, 36>28) | PASS (gate ran; correctly RED 3/3) |
| Review SHAPE grouped headers + zero anchored shorthand | grep over `uat/review-*.report.md` | 4 headers + Cross-Cutting on all 3; anchored shorthand = 0 | PASS |
| Security SHAPE + OWASP `[Axx]` | grep over `uat/security-*.report.md` | 4 headers + Threat Patterns + `[Axx]` byte-intact on all 3 | PASS |
| SC-5 residue sweep | `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` | exit 1, no output | PASS |
| Worktree teardown | `git --git-dir=.../ngx/.git worktree list` + `rev-parse --verify uat/phase-13-render` | `[main]` only; branch deleted (exit 128) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| GATE-02 | 13-01, 13-02, 13-03 | Headless `claude -p` UAT proves grouped spelled-out reports reach rendered output on both review skills; ngx run uses a dedicated worktree off the checkpoint | **PARTIAL** | The render-proof half is fully satisfied (SC-1/SC-2 rendered reports clean 6/6; SC-3 dedicated worktree off `019a26a`; SC-5 residue clean). The budget half (SC-4, part of the phase goal "budget stays within cap") is NOT satisfied -- 4/6 LIVE over-cap (GAP-13-BUDGET). GATE-02 cannot be marked green until SC-4 is re-measured GREEN after the routed fix. REQUIREMENTS.md correctly still shows GATE-02 `Pending`. |

Note: REQUIREMENTS.md line 44 names the checkpoint as `uat/pre-storybook-compodoc`. That spec name was confirmed at plan time to NOT exist; the actually-used (and correct) checkpoint is `lz-advisor-compodoc-storybook-uat-base` @ `019a26a` (documented in ROADMAP SC-3 and WORKTREE-PROVENANCE.md). This is a known spec-vs-reality reconciliation, not a gap.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none in modified files) | - | - | - | This phase modified only evidence/record markdown under `.planning/`. No production source touched (verify-only meta-phase). No TBD/FIXME/XXX debt markers, no stub returns, no hardcoded-empty data in the phase deliverables. The seeded `review-src/*.ts` files were deliberately-vulnerable UAT TEXT on a now-deleted throwaway ngx branch -- never in this repo. |

### Deviations / Minor Discrepancies (informational, not gaps)

1. **SUMMARY/RESIDUE-SWEEP structural-proof count drift.** RESIDUE-SWEEP.md and 13-UAT.md state the `crit:|imp:|sug:|q:` pattern matches "41 files total, EVERY ONE under .planning/". My independent re-run finds **50 files repo-wide**, of which **2 are outside `.planning/`** -- namely `tests/D-reviewer-budget.sh` and `tests/D-security-reviewer-budget.sh` (which legitimately contain the tokens in their parser regexes/comments). This does NOT affect the SC-5 verdict: the scoped sweep over `plugins/lz-advisor/` is genuinely clean (0 matches), and `tests/` is the regression harness (outside both the plugin tree and frozen `.planning/` history). The narrative count is stale/imprecise; the verdict is correct. Worth a one-line correction in the record if the milestone audit cares about precision.

## Gaps Summary

**GAP-13-BUDGET (BLOCKER for GATE-02 / SC-4) -- independently confirmed real.**

The reviewer/security-reviewer per-finding 28-word cap (`PER_ENTRY_CAP=28`) is exceeded on **4 of 6 LIVE agent emissions**. I re-ran the binding budget fixtures myself against the committed `*.agent.md` captures and reproduced the GRADE-LOG verdict exactly:

- review-1: exit 0 (clean, 6 findings)
- review-2: **exit 1** -- Finding 1 = 46w > 28 (severity-divergence rationale bundled into the finding body)
- review-3: exit 0 (clean, 7 findings)
- security-1: **exit 1** -- Finding 4 = 35w > 28 (two sinks merged into one `[A02]` finding)
- security-2: **exit 1** -- Finding 3 = 31w > 28 (verbose inline `curl` code reproduction)
- security-3: **exit 1** -- Finding 2 = 34w + Finding 8 = 36w > 28 (second-order-injection code reproduction + multi-clause Question body)

Every run cleared the anti-vacuous `MIN_FINDINGS=5` guard (6-8 findings parsed), so none of these are thin-target artifacts -- the over-caps are real. The grammar SHAPE (SC-1/SC-2) reaches the rendered report flawlessly on 6/6 runs (SHAPE-only Pass^k = 1.0), so the milestone's core "no shorthands" goal is empirically achieved -- but the phase goal's budget clause ("the budget stays within cap on the new grammar") is empirically disproven.

**Disposition (CONTEXT D-10):** route to a **Phase 12.x gap-closure REPLAN** (agent-contract concision tightening in `plugins/lz-advisor/agents/reviewer.md` + `security-reviewer.md` so the per-finding span stays <=28w on LIVE emission). Do NOT patch the agent contract inside this verify phase (the documented WR-05 partial-rewrite scar; verification observes, it does not rewrite). **SC-4 MUST be RE-MEASURED on live output after the fix** -- re-provisioning is deterministic from `uat/WORKTREE-PROVENANCE.md` (base `019a26a`, `review-src/handler.ts` + `review-src/disk-info.ts`), re-run the n>=3 headless captures, re-run the `--from-trace` gate to GREEN.

**Not a deferred item (Step 9b).** Phase 13 is the last phase in the roadmap; the "Phase 12.x gap-closure REPLAN" does not yet exist and awaits a user spin-up decision. GAP-13-BUDGET therefore remains a real, actionable, open gap (already logged as a STATE.md blocker), not a gap covered by an existing later phase.

**Surface to the user before marking Phase 13 / GATE-02 complete.**

---

_Verified: 2026-06-08_
_Verifier: Claude (gsd-verifier)_
