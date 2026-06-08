---
phase: 13
slug: empirical-verification
status: draft
nyquist_compliant: false
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

> Task IDs are assigned by the planner (step 8). Rows below are the SC->command
> contract each task MUST satisfy; the nyquist auditor reconciles task IDs after
> planning.

| Task ID | Plan | Wave | Requirement (SC) | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|------------------|------------|-----------------|-----------|-------------------|-------------|--------|
| (planner) | TBD | 0 | GATE-02 / setup | — | N/A | provisioning | `git --git-dir=.../ngx/.git branch --list 'lz-advisor-compodoc-storybook-uat-base'` prints the branch; `worktree add -b uat/phase-13-render <wt> lz-advisor-compodoc-storybook-uat-base` | ❌ W0 (worktree at exec) | ⬜ pending |
| (planner) | TBD | 1 | SC-1 | — | N/A | shape grade | `tr -d '\r' < review-N.report.md \| rg -q '^### Critical' && rg -q '^### Cross-Cutting Patterns' review-N.report.md && ! rg -q 'crit:\|imp:\|sug:\|q:' review-N.report.md` | ❌ W0 (live run) | ⬜ pending |
| (planner) | TBD | 1 | SC-2 | — | N/A | shape grade | as SC-1 over `security-N.report.md` plus `rg -q '\[A[0-9]{2}\]\|\[Uncategorized\]' security-N.report.md` (OWASP [Axx] preserved) | ❌ W0 (live run) | ⬜ pending |
| (planner) | TBD | 1 | SC-3 | — | worktree isolation (never `main`) | provenance check | `git --git-dir=.../ngx/.git worktree list` shows `uat/phase-13-render` off `019a26a`; EXPECTED_BASE match recorded | ❌ W0 (worktree at exec) | ⬜ pending |
| (planner) | TBD | 1 | SC-4 | — | N/A | budget fixture | `bash tests/D-reviewer-budget.sh --from-trace review-N.agent.md` exit 0 (xN>=3); `bash tests/D-security-reviewer-budget.sh --from-trace security-N.agent.md` exit 0 (xN>=3) | ✅ (GATE-01) | ⬜ pending |
| (planner) | TBD | 2 | SC-5 | — | frozen history untouched | residue sweep | `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` exit 1; `git grep -nE 'formerly High\|formerly Medium' -- plugins/lz-advisor/` exit 1 | ✅ (repo HEAD) | ⬜ pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] Seeded reviewable source slice in the THROWAWAY ngx worktree (RESEARCH Q3 Option A) — a small file with deliberate, reviewable issues (e.g. `review-src/handler.ts`: unguarded `JSON.parse`, braceless `if`, missing types, dead code) so every `:review` run clears `MIN_FINDINGS=5` and exercises Critical+Important+Suggestion caps; a `disk-info.ts`-style file (attacker-controlled string -> sink, vulnerable dep pin) for `:security-review` to clear 5 OWASP-tagged findings. Lives ONLY on `uat/phase-13-render`, never `main`.
- [ ] `.planning/phases/13-empirical-verification/uat/` evidence directory (created at execution; holds `*.streamjson`, `*.report.md`, `*.agent.md`, grade logs).
- [ ] No framework install needed — both budget fixtures exist GREEN (GATE-01); `jq`, `rg`, `git`, `claude` CLI all present.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live `claude -p` nested sessions | SC-1, SC-2, SC-4 | Each run spawns a real nested Claude session drawing on the shared 5-hour pool; cannot run in a pure unit harness (may hit `out_of_credits`/429). The CAPTURE is manual-triggered; the GRADING of each capture is fully automated. | Run the locked command form per skill (n>=3); confirm each `.streamjson` has a `result` event; then run the automated SHAPE + BUDGET graders above. Escalate n=3 -> n=5 only if pool headroom allows. |
| ngx checkpoint branch confirmation | SC-3 | The spec-named branch `uat/pre-storybook-compodoc` does not exist; the base was human-confirmed at plan time. | RESOLVED 2026-06-08: user confirmed `lz-advisor-compodoc-storybook-uat-base` (`019a26a`). No further manual step; execution asserts the branch exists before `worktree add`. |

---

## Validation Sign-Off

- [ ] Every SC has an automated grader command OR a Wave 0 dependency (seeded target / evidence dir)
- [ ] Sampling continuity: each captured run graded for both SHAPE and BUDGET before the next
- [ ] Wave 0 covers the seeded review target + evidence directory
- [ ] No watch-mode flags (fixtures are one-shot)
- [ ] Feedback latency < 15s for fixture/grep gates
- [ ] `nyquist_compliant: true` set in frontmatter (after planner reconciles task IDs)

**Approval:** pending
