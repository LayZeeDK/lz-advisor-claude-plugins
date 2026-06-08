---
phase: 13-empirical-verification
plan: 07
subsystem: live-uat-evidence
tags: [uat, claude-p, headless, gate-02, sc-4, budget-gate, pass-at-k, third-re-measure, gap-closure, GATE-02-CLOSED]
requires:
  - "13-06 FIXED agents (FIX-R2-A/B/C, commits bfb8003 + 91ee635)"
  - "13-05 / 13-01 proven re-provision + capture->extract->budget pipeline + deterministic seed shape (4fa7fd7)"
provides:
  - "n=3-per-skill LIVE budget THIRD RE-MEASURE on the 13-06 fixed agents (stream-json + report.md + agent.md each)"
  - "GRADE-LOG-R3.md (per-run SHAPE + BUDGET) + PASS-K-R3.md (Pass@k/Pass^k=1.0) + WORKTREE-PROVENANCE-R3.md"
  - "MEASURED SC-4 verdict: GREEN (combined c=6/6, every run exit 0 under the UNCHANGED hard gate) -> GATE-02 budget half CLOSED"
affects:
  - "Phase 13 VERIFICATION (GATE-02 close-out: SC-4 now PASS, all five criteria PASS)"
  - "Milestone v1.0.1 (the last open phase criterion is closed)"
tech-stack:
  added: []
  patterns:
    - "Deterministic re-provisioning: recover seed files byte-identical from the dangling seed commit (4fa7fd7) via git show, diff-verify, re-seed on a new throwaway branch"
    - "Worktree-scoped gitdir HEAD read (.git/worktrees/<name>/HEAD) for ACTUAL_BASE -- a main-repo rev-parse HEAD is a false-drift signal"
    - "Seed commit from INSIDE the worktree (no --git-dir / -C) to avoid HEAD resolving against the main repo index (T-13-07-01)"
    - "CRLF-normalize (tr -d '\\r') before $-anchored SHAPE header grep -- the parent .result render is CRLF-terminated (the budget fixtures already normalize internally)"
    - "Script-file for-loop (not an inline Bash-tool loop) to capture per-run exit codes reliably with durable per-run output files"
key-files:
  created:
    - ".planning/phases/13-empirical-verification/uat/WORKTREE-PROVENANCE-R3.md"
    - ".planning/phases/13-empirical-verification/uat/GRADE-LOG-R3.md"
    - ".planning/phases/13-empirical-verification/uat/PASS-K-R3.md"
    - ".planning/phases/13-empirical-verification/uat/r3-review-{1,2,3}.{streamjson,err,report.md,agent.md}"
    - ".planning/phases/13-empirical-verification/uat/r3-security-{1,2,3}.{streamjson,err,report.md,agent.md}"
    - ".planning/phases/13-empirical-verification/uat/_capture-r3.sh"
    - ".planning/phases/13-empirical-verification/13-07-SUMMARY.md"
  modified:
    - ".planning/phases/13-empirical-verification/13-UAT.md"
decisions:
  - "SC-4 marked PASS: every n=3-per-skill run exits 0 under the UNCHANGED hard gate (combined c=6/6, Pass@k=Pass^k=1.0); the 13-06 fix fully landed, the close is genuine (fixtures never edited)"
  - "n=3 floor (not escalated to n=5): all 6 runs were clean exit 0 with no residual stray, so the n=3 floor is statistically sufficient -- escalation is only warranted when a residual appears (13-05 precedent)"
  - "Seeds recovered byte-identical from dangling commit 4fa7fd7 (diff-verified empty), guaranteeing the SAME deterministic defect shape as 13-01 / 13-05"
metrics:
  duration: ~30min
  completed: 2026-06-08
  tasks: 3
  files: 30
---

# Phase 13 Plan 07: SC-4 THIRD LIVE budget RE-MEASURE (GATE-02 close-out) Summary

Re-measured SC-4 (the per-finding 28w word-budget gate) on LIVE agent emission a
THIRD time, AFTER the 13-06 FIX-R2-A/B/C iteration-2 concision fix (commits
`bfb8003` + `91ee635`). Re-provisioned the deterministic ngx worktree substrate on
a new throwaway branch `uat/phase-13-render-r3` off `019a26a`, recovered the seeds
byte-identical from the dangling 13-01 seed commit `4fa7fd7`, ran n=3 headless
`claude -p` captures per review skill against the seeded targets (now hitting the
13-06 FIXED agents), dual-extracted SHAPE (parent `.result`) + BUDGET (subagent
JSONL), ran the `--from-trace` budget gate on every live emission, recomputed
Pass@k/Pass^k, wrote all evidence into `uat/` before teardown, tore down the R3
worktree, and updated `13-UAT.md`.

**Headline (MEASURED, not reasoned -- D-04): the 13-06 fix FULLY LANDED. All 6
LIVE runs (n=3 per skill) exit 0 under the UNCHANGED hard gate. Combined c=6/6
(R2 was 7/10; pre-fix 2/6). Pass@k = Pass^k = 1.0 at every k. SC-4 measures GREEN.
GATE-02 is now FULLY SATISFIED (render half SC-1/2/3/5 + budget half SC-4). The two
`tests/D-*-budget.sh` fixtures were NEVER edited -- the close is genuine concision,
not a gamed gate.**

## SC-4 third-re-measure verdict (per-run BUDGET exits -- authoritative)

| Skill | run-1 | run-2 | run-3 | c / n |
|-------|-------|-------|-------|-------|
| Reviewer (`/lz-advisor:review`) | 0 (PASS) | 0 (PASS) | 0 (PASS) | 3 / 3 |
| Security (`/lz-advisor:security-review`) | 0 (PASS) | 0 (PASS) | 0 (PASS) | 3 / 3 |

Combined c = **6 / 6** (R2 was 7/10; pre-fix 2/6). SHAPE-only c = **6 / 6**
(Pass^k = 1.0 -- grouped grammar render flawless, OWASP `[Axx]` byte-intact every
security run, zero anchored shorthand every run). Worst finding per run: reviewer
22w (run-1), security 27w (run-1) -- both comfortably under the 28w cap.

## Pass@k / Pass^k (recomputed, n=3 per skill; full table in uat/PASS-K-R3.md)

Combined (SHAPE clean AND BUDGET exit 0):

| Scope | n | c | Pass@1 | Pass@3 | Pass^1 | Pass^3 |
|-------|---|---|--------|--------|--------|--------|
| Reviewer | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Security | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Overall | 6 | 6 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

c = n on every scope, so even the conservative Pass^k ("ALL k samples pass")
saturates at 1.0. R2 -> R3 delta: combined Pass@1 0.700 -> 1.000; Pass^3 0.2917 ->
1.000.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Re-provision deterministic R3 substrate (worktree + seeds + provenance) | `4d02c07` | WORKTREE-PROVENANCE-R3.md (this repo); seed commit `cd1b9c8` (ngx R3 branch) |
| 2 | Capture + dual-extract + budget gate + Pass@k (n=3/skill) | `20d3e1b` | GRADE-LOG-R3.md + PASS-K-R3.md + 24 r3-*.* captures + _capture-r3.sh |
| 3 | Teardown R3 worktree; update 13-UAT.md SC-4 PASS | `087fd8b` | 13-UAT.md |

## What was done

### Task 1 -- R3 substrate (deterministic re-provision off 019a26a)

- Asserted the checkpoint branch `lz-advisor-compodoc-storybook-uat-base` exists
  BEFORE the add; EXPECTED_BASE = `019a26a6cf17fb4968791817eecfab14ec81b369`.
- Created the R3 worktree on a new throwaway branch `uat/phase-13-render-r3` off the
  checkpoint, at `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r3`.
- Verified ACTUAL_BASE == EXPECTED_BASE by reading the WORKTREE-SCOPED gitdir HEAD
  (a main-repo `rev-parse HEAD` returned `2d4d9f0` -- the CURRENT ngx live main,
  which has advanced from 13-05's `bad1aed`; recorded as a documented false-drift
  signal, not our base).
- Recovered both 13-01 seed files VERBATIM from the dangling seed commit `4fa7fd7`,
  `diff`-verified byte-identical (empty diff), and committed as `cd1b9c8` on the R3
  branch ONLY (HEAD~1 == `019a26a`, provenance preserved).
- **T-13-07-01 caught + reverted:** a first seed-commit attempt used a shared
  `--git-dir` + `-C <worktree>` invocation that resolved HEAD against the MAIN ngx
  repo index, creating a stray commit `ec9cc92` on ngx `main` (parent `2d4d9f0`,
  containing ONLY the 2 seed files). Caught by the isolation assertion; surgically
  reverted via `git reset --mixed 2d4d9f0` from the main checkout, which restored
  `main` to `2d4d9f0`, removed the seeds, and PRESERVED the user's pre-existing
  uncommitted working-tree modifications. The corrected seed commit was then made
  from INSIDE the worktree. ngx main verified untouched.
- Asserted isolation: seeds present on R3, absent from ngx main, absent from this
  repo. Wrote WORKTREE-PROVENANCE-R3.md.

### Task 2 -- n=3 live captures + dual extraction + budget gate + Pass@k

- Ran n=3 per skill (6 captures) from CWD = the R3 worktree, `--plugin-dir` = THIS
  repo's `plugins/lz-advisor` (the 13-06 FIXED agents), `--permission-mode auto`,
  prose target (no @file mention), `--verbose --output-format stream-json`, via a
  durable script-file for-loop (`_capture-r3.sh`).
- Verified a `result` event (subtype=success) on every capture (`jq -e`); all 6
  returned cleanly (no 429 / out_of_credits).
- Dual-extracted (D-03): SHAPE from parent `.result` -> `r3-<skill>-N.report.md`;
  BUDGET from the per-session subagent JSONL assistant text -> `r3-<skill>-N.agent.md`.
- Ran `tests/D-reviewer-budget.sh --from-trace` / `tests/D-security-reviewer-budget.sh
  --from-trace` on every agent.md: ALL 6 exit 0. SHAPE graded per run (four headers
  + analytical section + OWASP `[Axx]` security; anchored `\b(crit|imp|sug|q):` = 0,
  after CRLF-normalizing the parent render).
- Recomputed Pass@k/Pass^k (1.0 everywhere); wrote GRADE-LOG-R3.md + PASS-K-R3.md.

### Task 3 -- teardown + UAT update

- D-08 custody gate: asserted all 27 evidence files (24 captures + GRADE-LOG-R3 +
  PASS-K-R3 + WORKTREE-PROVENANCE-R3) present AND committed BEFORE teardown.
- Tore down by EXACT name: `worktree remove ...-uat-13-r3 --force` +
  `branch -D uat/phase-13-render-r3` (was `cd1b9c8`). Post-teardown: the R3 dir is
  removed; `rev-parse --verify uat/phase-13-render-r3` fails; no seed leakage on the
  ngx live tree; ngx `main` ref preserved at `2d4d9f0`.
- Updated 13-UAT.md: SC-4 `issue` -> `pass` (R3 evidence cited), Summary 4/1 -> 5/0,
  R3 Pass@k table added (R2 preserved), GAP-13-BUDGET-R2 marked CLOSED, frontmatter
  `status` `needs-review` -> `resolved` and `verdict` -> pass / GATE-02 fully satisfied.

## The close is genuine (T-13-07-02 -- the gate was not gamed)

`git status --porcelain tests/` is EMPTY throughout the plan. The two
`tests/D-*-budget.sh` fixtures were run `--from-trace` read-only on every live
emission; no cap was lowered, no fixture edited. The close is achieved by the 13-06
FIXED agents genuinely producing <=28w finding bodies:

- FIX-R2-A routed the reviewer's context-heavy Question elaboration into the
  existing 60w `### Per-finding validation` valve (R2's 45w multi-clause Question is
  now a 21w terse binary question in r3-review-2).
- FIX-R2-C split the reviewer causal chain (R2's 29w deref-chain is now a 15-18w
  body + a separate numbered consequence finding).
- FIX-R2-B's fix-clause reference-by-shape names the safe API in backticks without
  the full call expression or a second clause (R2's four 30-33w security fix-prose
  findings are all now <=27w).

## No residual stray (D-10 honest reporting)

Every n=3 run per skill exits 0; no residual over-cap surfaced. Had a lone
stochastic stray appeared, it would have been recorded faithfully (word count +
class) as the evidence for the deferred FIX-R2-D gate-tolerance-band question; none
occurred. SC-4 is GREEN; the FIX-R2-D decision is NOT needed to close SC-4 (it
remains a flagged product-contract decision the user may settle independently per
13-06-SUMMARY).

## GATE-02 close-out verdict

GATE-02 has two halves: (1) the render-proof half (SC-1/SC-2/SC-3/SC-5) -- fully
satisfied since 13-02/13-03 and re-confirmed across R2/R3 (SHAPE Pass^k = 1.0,
OWASP `[Axx]` byte-intact); and (2) the budget half (SC-4) -- now GREEN on the third
live re-measure. **GATE-02 is FULLY SATISFIED.** The honest measured progression
(pre-fix 2/6 -> 13-04 fix 7/10 -> 13-06 fix 6/6) is on record; the milestone goal
(no shorthands in user-facing reports) was empirically achieved at the render layer
throughout, and the per-finding budget concision -- the separate axis that gated
SC-4 -- is now also fully green under the unchanged hard cap.

## Deviations from Plan

- **The plan stated "EXPECT exit 0 now" but instructed honest reporting either way.**
  The measured result is the expected GREEN: 6/6 exit 0, no residual stray. No
  honest-residual path was needed; recorded as a clean PASS.
- **n=3 floor, not escalated to n=5.** All 6 runs were clean exit 0 with no residual
  at the n=3 floor, so escalation was not warranted (13-05 escalated only because a
  residual appeared). The plan permits n=3 as the floor.
- **T-13-07-01 tampering incident caught + reverted mid-Task-1** (Rule 1 auto-fix):
  a stray `--git-dir`/`-C` seed commit landed on ngx `main` and was surgically
  reverted via `git reset --mixed` (preserving the user's working tree), then the
  seed was re-committed from inside the worktree. This is the documented threat the
  isolation assertion exists to catch; the assertion fired and the work self-corrected.
- **SHAPE header grep required CRLF normalization** (`tr -d '\r'`) -- the parent
  `.result` render is CRLF-terminated, which broke the `$`-anchored header count
  until normalized (the budget fixtures already normalize internally, so BUDGET was
  never affected). Not a behavioral deviation; a grading-method note.

## Known Stubs

None -- this plan produces evidence files (captures + grades) and a markdown record
update, not source code. All seeded review targets were consumed live; no
placeholder/empty-data surfaces.

## Self-Check: PASSED

- All R3 evidence files present + committed in uat/ (verified: 24 r3-*.* captures +
  GRADE-LOG-R3.md + PASS-K-R3.md + WORKTREE-PROVENANCE-R3.md via `git ls-files`).
- Commits exist: `4d02c07` (Task 1), `20d3e1b` (Task 2), `087fd8b` (Task 3).
- Per-run BUDGET exits re-verified individually: reviewer [0,0,0], security [0,0,0]
  -- combined c=6/6.
- R3 worktree + branch torn down: `rev-parse --verify uat/phase-13-render-r3` fails;
  R3 dir removed; ngx main ref `2d4d9f0` preserved; no seed leakage.
- Fixtures UNMODIFIED: `git status --porcelain tests/` empty (the close is genuine).
