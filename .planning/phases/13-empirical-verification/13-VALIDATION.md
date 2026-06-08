---
phase: 13
slug: empirical-verification
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-08
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> This is a VERIFY-ONLY phase: deliverables are EVIDENCE (captured traces,
> graded reports, budget verdicts, a residue-sweep result) + a VERIFICATION
> report, not new source code. The "tests" are the UAT gates themselves. Each
> of the five GATE-02 success criteria maps to a discrete checkable command
> below (sourced from `13-RESEARCH.md` Validation Architecture).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash + coreutils budget fixtures (`tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh`) + `jq` (1.8.1) + `rg` + `git grep` graders; live capture via `claude -p ... --output-format stream-json` (CLI 2.1.168) |
| **Config file** | none — standalone zero-dependency fixtures (GATE-01, already GREEN) |
| **Quick run command** | `bash tests/D-reviewer-budget.sh` (self-extract self-check, ~2s) |
| **Full suite command** | both fixtures `--from-trace <capture>` per live run + SHAPE greps over each `report.md` + residue sweep `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` |
| **Estimated runtime** | fixtures + greps ~10s; live `claude -p` capture ~2-5 min/run (n>=3 x 2 skills = 6-10 nested runs; shares the 5-hour session pool) |

---

## Sampling Rate

- **After every captured run:** extract `report.md` (parent `.result`, SHAPE) + `agent.md` (subagent JSONL, BUDGET); grade both immediately.
- **Per skill:** aggregate n>=3 runs into Pass@k / Pass^k (k=1,3; add 5 if n=5).
- **After all captures:** run the residue sweep + the companion `formerly-X` sweep.
- **Before `/gsd:verify-work`:** all five SCs satisfied; `13-UAT.md` + evidence committed under `.planning/phases/13-empirical-verification/uat/`.
- **Max feedback latency:** budget/grep gates < 15s; live-capture latency bounded by the session pool (verify each `.streamjson` has a `result` event before grading).

---

## Per-Task Verification Map

> Task IDs reconciled by the planner (2026-06-08). Three plans, one per wave:
> 13-01 (wave 1, provisioning), 13-02 (wave 2, live runs), 13-03 (wave 3,
> sweep + teardown + UAT record). Rows below are the SC->command contract each
> task satisfies. Task ID = `<plan>.T<task>`.

| Task ID | Plan | Wave | Requirement (SC) | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|------------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01.T1 + 13-01.T2 + 13-01.T3 | 13-01 | 1 | GATE-02 / setup | T-13-01, T-13-02 | worktree isolation; seeded slice on throwaway branch only | provisioning | `git --git-dir=.../ngx/.git branch --list 'lz-advisor-compodoc-storybook-uat-base'` prints the branch; `worktree add -b uat/phase-13-render <wt> lz-advisor-compodoc-storybook-uat-base`; seed `review-src/*.ts`; create `uat/` evidence dir | ❌ W0 (worktree at exec) | ⬜ pending |
| 13-02.T1 | 13-02 | 2 | SC-1 | T-13-03 | trace read-only | shape grade | `tr -d '\r' < review-N.report.md \| rg -q '^### Critical' && rg -q '^### Cross-Cutting Patterns' review-N.report.md && ! rg -q 'crit:\|imp:\|sug:\|q:' review-N.report.md` | ❌ W0 (live run) | ⬜ pending |
| 13-02.T2 | 13-02 | 2 | SC-2 | T-13-03 | trace read-only | shape grade | as SC-1 over `security-N.report.md` plus `rg -q '\[A[0-9]{2}\]\|\[Uncategorized\]' security-N.report.md` (OWASP [Axx] preserved) | ❌ W0 (live run) | ⬜ pending |
| 13-01.T1 (recorded) + 13-02.T1 (cross-ref) | 13-01 / 13-02 | 1 / 2 | SC-3 | T-13-01 | worktree isolation (never `main`) | provenance check | `git --git-dir=.../ngx/.git worktree list` shows `uat/phase-13-render` off `019a26a`; EXPECTED_BASE match recorded in WORKTREE-PROVENANCE.md | ❌ W0 (worktree at exec) | ⬜ pending |
| 13-02.T1 + 13-02.T2 | 13-02 | 2 | SC-4 | T-13-03 | trace read-only | budget fixture | `bash tests/D-reviewer-budget.sh --from-trace review-N.agent.md` exit 0 (xN>=3); `bash tests/D-security-reviewer-budget.sh --from-trace security-N.agent.md` exit 0 (xN>=3) | ✅ (GATE-01) | ⬜ pending |
| 13-02.T3 | 13-02 | 2 | SC-1/2/4 reliability | — | N/A | Pass@k/Pass^k | compute Pass@k = `1 - C(n-c,k)/C(n,k)`, Pass^k = `C(c,k)/C(n,k)` per skill + overall; write `uat/PASS-K.md` | ❌ W0 (from grade log) | ⬜ pending |
| 13-03.T1 | 13-03 | 3 | SC-5 | T-13-05 | frozen history untouched | residue sweep | `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` exit 1; `git grep -nE 'formerly High\|formerly Medium' -- plugins/lz-advisor/` exit 1 | ✅ (repo HEAD) | ⬜ pending |
| 13-03.T2 | 13-03 | 3 | D-08 teardown | T-13-06 | extract-before-remove; exact branch name | teardown | `worktree list` no longer shows `ngx-smart-components-uat-13`; `rev-parse --verify uat/phase-13-render` fails | ❌ (exec) | ⬜ pending |
| 13-03.T3 | 13-03 | 3 | GATE-02 closeout | — | N/A | UAT record | `13-UAT.md` has 5 SC entries + Pass@k table + `## Summary` + `## Gaps` (D-10 disposition) | ❌ (exec) | ⬜ pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

> Note on wave numbering: this map's logical "W0" provisioning maps to PLAN
> wave 1 (Plan 13-01); the live runs to wave 2 (Plan 13-02); the sweep/teardown
> to wave 3 (Plan 13-03). The three plans are strictly sequential
> (`depends_on`) because each consumes the prior's output and the nested
> `claude -p` runs share the 5-hour session pool (cannot be parallelized).

- [ ] Seeded reviewable source slice in the THROWAWAY ngx worktree (RESEARCH Q3 Option A) — a small file with deliberate, reviewable issues (e.g. `review-src/handler.ts`: unguarded `JSON.parse`, braceless `if`, missing types, dead code) so every `:review` run clears `MIN_FINDINGS=5` and exercises Critical+Important+Suggestion caps; a `disk-info.ts`-style file (attacker-controlled string -> sink, vulnerable dep pin) for `:security-review` to clear 5 OWASP-tagged findings. Lives ONLY on `uat/phase-13-render`, never `main`. **[Plan 13-01.T2]**
- [ ] `.planning/phases/13-empirical-verification/uat/` evidence directory (created at execution; holds `*.streamjson`, `*.report.md`, `*.agent.md`, grade logs). **[Plan 13-01.T3]**
- [ ] No framework install needed — both budget fixtures exist GREEN (GATE-01); `jq`, `rg`, `git`, `claude` CLI all present.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live `claude -p` nested sessions | SC-1, SC-2, SC-4 | Each run spawns a real nested Claude session drawing on the shared 5-hour pool; cannot run in a pure unit harness (may hit `out_of_credits`/429). The CAPTURE is manual-triggered; the GRADING of each capture is fully automated. | Run the locked command form per skill (n>=3); confirm each `.streamjson` has a `result` event; then run the automated SHAPE + BUDGET graders above. Escalate n=3 -> n=5 only if pool headroom allows. (Plan 13-02.T1/T2.) |
| ngx checkpoint branch confirmation | SC-3 | The spec-named branch `uat/pre-storybook-compodoc` does not exist; the base was human-confirmed at plan time. | RESOLVED 2026-06-08: user confirmed `lz-advisor-compodoc-storybook-uat-base` (`019a26a`). No further manual step; execution asserts the branch exists before `worktree add` (Plan 13-01.T1). |

---

## Validation Sign-Off

- [x] Every SC has an automated grader command OR a Wave 0 dependency (seeded target / evidence dir)
- [x] Sampling continuity: each captured run graded for both SHAPE and BUDGET before the next
- [x] Wave 0 covers the seeded review target + evidence directory
- [x] No watch-mode flags (fixtures are one-shot)
- [x] Feedback latency < 15s for fixture/grep gates
- [x] `nyquist_compliant: true` set in frontmatter (planner reconciled task IDs 2026-06-08)

**Approval:** task IDs reconciled; ready for execution.
