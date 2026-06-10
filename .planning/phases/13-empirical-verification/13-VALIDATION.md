---
phase: 13
slug: empirical-verification
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-08
validated: 2026-06-10
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

> Task IDs reconciled by the planner (2026-06-08). The plan-time map below was
> written for a 3-plan structure (13-01 provisioning, 13-02 live runs, 13-03
> sweep + teardown + UAT record). **Execution expanded to SEVEN plans:** the
> initial 13-02 live runs surfaced GAP-13-BUDGET (SC-4 2/6 over-cap), which drove
> two agent-contract concision iterations + re-measures -- R2 (13-04 fix + 13-05
> re-measure, n=5/skill, 7/10) and R3 (13-06 fix + 13-07 re-measure, n=3/skill,
> **6/6 GREEN**). The rows below are the SC->command contract each task satisfies;
> the **Status** column reflects the FINAL R3 outcome (independently re-confirmed
> at HEAD by this validation audit 2026-06-10). Task ID = `<plan>.T<task>`.

| Task ID | Plan | Wave | Requirement (SC) | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|------------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01.T1 + 13-01.T2 + 13-01.T3 | 13-01 | 1 | GATE-02 / setup | T-13-01, T-13-02 | worktree isolation; seeded slice on throwaway branch only | provisioning | `git --git-dir=.../ngx/.git branch --list 'lz-advisor-compodoc-storybook-uat-base'` prints the branch; `worktree add -b uat/phase-13-render <wt> lz-advisor-compodoc-storybook-uat-base`; seed `review-src/*.ts`; create `uat/` evidence dir | ✅ (uat/ dir + WORKTREE-PROVENANCE.md) | 🟩 green |
| 13-02.T1 | 13-02 | 2 | SC-1 | T-13-03 | trace read-only | shape grade | `tr -d '\r' < review-N.report.md \| rg -q '^### Critical' && rg -q '^### Cross-Cutting Patterns' review-N.report.md && ! rg -q 'crit:\|imp:\|sug:\|q:' review-N.report.md` | ✅ (review-*.report.md + r2/r3) | 🟩 green |
| 13-02.T2 | 13-02 | 2 | SC-2 | T-13-03 | trace read-only | shape grade | as SC-1 over `security-N.report.md` plus `rg -q '\[A[0-9]{2}\]\|\[Uncategorized\]' security-N.report.md` (OWASP [Axx] preserved) | ✅ (security-*.report.md + r2/r3) | 🟩 green |
| 13-01.T1 (recorded) + 13-02.T1 (cross-ref) | 13-01 / 13-02 | 1 / 2 | SC-3 | T-13-01 | worktree isolation (never `main`) | provenance check | `git --git-dir=.../ngx/.git worktree list` shows `uat/phase-13-render` off `019a26a`; EXPECTED_BASE match recorded in WORKTREE-PROVENANCE.md | ✅ (WORKTREE-PROVENANCE{,-R2,-R3}.md) | 🟨 green-with-deviation |
| 13-02.T1 + 13-02.T2 (R1) → 13-05 (R2) → 13-07 (R3) | 13-02 / 13-05 / 13-07 | 2 | SC-4 | T-13-03 | trace read-only | budget fixture | `bash tests/D-reviewer-budget.sh --from-trace r3-review-N.agent.md` exit 0 (xN>=3); `bash tests/D-security-reviewer-budget.sh --from-trace r3-security-N.agent.md` exit 0 (xN>=3) | ✅ (GATE-01 fixtures + r3-*.agent.md) | 🟩 green (R3 6/6; re-confirmed at HEAD) |
| 13-02.T3 | 13-02 / 13-05 / 13-07 | 2 | SC-1/2/4 reliability | — | N/A | Pass@k/Pass^k | compute Pass@k = `1 - C(n-c,k)/C(n,k)`, Pass^k = `C(c,k)/C(n,k)` per skill + overall; write `uat/PASS-K.md` | ✅ (PASS-K{,-R2,-R3}.md) | 🟩 green (R3 Pass@k=Pass^k=1.0) |
| 13-03.T1 | 13-03 | 3 | SC-5 | T-13-05 | frozen history untouched | residue sweep | `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` exit 1; `git grep -nE 'formerly High\|formerly Medium' -- plugins/lz-advisor/` exit 1 | ✅ (RESIDUE-SWEEP.md + repo HEAD) | 🟩 green (re-confirmed at HEAD) |
| 13-03.T2 | 13-03 | 3 | D-08 teardown | T-13-06 | extract-before-remove; exact branch name | teardown | `worktree list` no longer shows `ngx-smart-components-uat-13`; `rev-parse --verify uat/phase-13-render` fails | ✅ (RESIDUE-SWEEP.md Teardown; R3 torn down) | 🟩 green |
| 13-03.T3 | 13-03 | 3 | GATE-02 closeout | — | N/A | UAT record | `13-UAT.md` has 5 SC entries + Pass@k table + `## Summary` + `## Gaps` (D-10 disposition) | ✅ (13-UAT.md, status: resolved) | 🟩 green |

*Status: pending · green · green-with-deviation · red · flaky*

---

## Wave 0 Requirements

> Note on wave numbering: this map's logical "W0" provisioning maps to PLAN
> wave 1 (Plan 13-01); the live runs to wave 2 (Plan 13-02); the sweep/teardown
> to wave 3 (Plan 13-03). The three plans are strictly sequential
> (`depends_on`) because each consumes the prior's output and the nested
> `claude -p` runs share the 5-hour session pool (cannot be parallelized).

- [x] Seeded reviewable source slice in the THROWAWAY ngx worktree (RESEARCH Q3 Option A) — a small file with deliberate, reviewable issues (e.g. `review-src/handler.ts`: unguarded `JSON.parse`, braceless `if`, missing types, dead code) so every `:review` run clears `MIN_FINDINGS=5` and exercises Critical+Important+Suggestion caps; a `disk-info.ts`-style file (attacker-controlled string -> sink, vulnerable dep pin) for `:security-review` to clear 5 OWASP-tagged findings. Lived ONLY on the throwaway render branches, never on ngx `main` in the FINAL state. **[Plan 13-01.T2; re-seeded byte-identical for R2/R3 from the dangling 13-01 seed commit `4fa7fd7`]**
- [x] `.planning/phases/13-empirical-verification/uat/` evidence directory created and populated: 3 capture rounds (R1 `review/security-*`, R2 `r2-*`, R3 `r3-*`) x4 file kinds each (`*.streamjson`, `*.report.md`, `*.agent.md`, `*.err`) + `GRADE-LOG{,-R2,-R3}.md` + `PASS-K{,-R2,-R3}.md` + `WORKTREE-PROVENANCE{,-R2,-R3}.md` + `RESIDUE-SWEEP.md`. **[Plan 13-01.T3 + 13-05 + 13-07]**
- [x] No framework install needed — both budget fixtures exist GREEN (GATE-01); `jq`, `rg`, `git`, `claude` CLI all present.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live `claude -p` nested sessions | SC-1, SC-2, SC-4 | Each run spawns a real nested Claude session drawing on the shared 5-hour pool; cannot run in a pure unit harness (may hit `out_of_credits`/429). The CAPTURE is manual-triggered; the GRADING of each capture is fully automated. | RESOLVED 2026-06-08: captured n>=3/skill across 3 rounds (R1 n=3, R2 n=5, R3 n=3); each `.streamjson` confirmed to carry a `result` event; SHAPE + BUDGET graders run and committed under `uat/`. The automated graders (SC-4 budget fixtures, SC-1/2 SHAPE greps) were re-run by this validation audit at HEAD against the committed R3 captures -> GREEN. (Plans 13-02 / 13-05 / 13-07.) |
| ngx checkpoint branch confirmation | SC-3 | The spec-named branch `uat/pre-storybook-compodoc` does not exist; the base was human-confirmed at plan time. | RESOLVED 2026-06-08: user confirmed `lz-advisor-compodoc-storybook-uat-base` (`019a26a`). Execution asserted the branch before each `worktree add`; EXPECTED_BASE == ACTUAL_BASE == `019a26a` on all 3 rounds (WORKTREE-PROVENANCE*.md). |
| **ngx safety-branch cleanup (post-deviation)** | SC-3 | The transient T-13-07-01 seed-commit breach (see Audit 2026-06-10) left an INERT quarantine branch `safety/edge-aion-986dae1` in the ngx repo, off both `main` and the user's active work. Deleting it is the user's call on their own repo; not a phase blocker. | OPTIONAL, user-discretion in the external ngx repo: `git --git-dir=<ngx>/.git branch -D safety/edge-aion-986dae1` (makes the dangling stray `ec9cc92` GC-eligible). ngx `main` (`2d4d9f0`) and the user's active branch (`98e9e42`) are independently confirmed clean. |

---

## Validation Sign-Off

- [x] Every SC has an automated grader command OR a Wave 0 dependency (seeded target / evidence dir)
- [x] Sampling continuity: each captured run graded for both SHAPE and BUDGET before the next
- [x] Wave 0 covers the seeded review target + evidence directory
- [x] No watch-mode flags (fixtures are one-shot)
- [x] Feedback latency < 15s for fixture/grep gates
- [x] `nyquist_compliant: true` set in frontmatter (planner reconciled task IDs 2026-06-08; post-execution audit confirmed 2026-06-10)

**Approval:** task IDs reconciled; phase executed; validation audit confirms every SC has automated verification with committed evidence. NYQUIST-COMPLIANT.

---

## Validation Audit 2026-06-10

State-A audit of the executed phase (the plan-time map above was reconciled against
the 7-plan execution reality and the FINAL R3 verdict). This is a VERIFY-ONLY phase:
its "tests" are the UAT grader commands themselves, and its deliverables are committed
EVIDENCE, not new production source. No new test files were generated -- every SC
already had an automated grader (the two GATE-01 budget fixtures + the SHAPE/residue
greps), all run during execution with evidence committed under `uat/`.

**Independent re-confirmation at HEAD (audit did NOT trust the SUMMARY/VERIFICATION narratives):**

| SC | Grader re-run by audit | Result |
|----|------------------------|--------|
| SC-4 budget | `bash tests/D-reviewer-budget.sh --from-trace uat/r3-review-{1,2,3}.agent.md` + security equivalent | reviewer `[0,0,0]`, security `[0,0,0]` -> **6/6 GREEN** |
| SC-4 gate integrity | `git status --porcelain tests/`; last `tests/` commit | porcelain EMPTY; last `tests/` commit is Phase 12's `3bc7f11` -- fixtures UNMODIFIED, close is genuine concision not gate-gaming |
| SC-4 caps | `git grep` cap constants in both fixtures | `PER_ENTRY_CAP=28 / MIN_FINDINGS=5 / AUTO_CLARITY_CAP=75` -- unchanged |
| SC-5 residue | `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` + `formerly High\|formerly Medium\|formerly Low` | both **exit 1 (clean)** |

| Metric | Count |
|--------|-------|
| Requirements (SCs) | 5 |
| Gaps found | 0 |
| Resolved | 0 (none to resolve -- all SCs already had automated graders with committed evidence) |
| Escalated to manual-only | 0 (the live-capture/checkpoint manual items pre-existed and are RESOLVED) |
| Auditor (gsd-nyquist-auditor) spawned | No -- zero MISSING gaps, so Step 5 skipped per workflow Step 3 |

**Status reconciliation:** `status: draft -> validated`; `wave_0_complete: false -> true`;
Per-Task Map `pending -> green` (SC-3 `green-with-deviation`, mirroring the
VERIFICATION.md PASS-WITH-DEVIATION on the transient T-13-07-01 seed-commit breach,
caught and reverted, FINAL ngx state independently confirmed clean).
