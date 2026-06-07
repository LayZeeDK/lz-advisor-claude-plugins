# Phase 13: Empirical verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 13-empirical-verification
**Mode:** autonomous (`--auto --analyze --chain`)
**Areas discussed:** Behavioral UAT harness, Budget-gate measurement source, ngx-smart-components worktree provisioning, Residue sweep + failure disposition

> `--auto`: every area auto-resolved to the recommended option; no AskUserQuestion.
> `--analyze`: the trade-off tables below were generated for the audit trail.
> The WHAT/WHY (the five SC + GATE-02) is locked in ROADMAP.md + REQUIREMENTS.md
> and was not re-litigated.

---

## Behavioral UAT harness (SC-1, SC-2) -> D-01, D-02, D-03

| Option | Description | Selected |
|--------|-------------|----------|
| n>=3 runs/skill, reused for budget gate | Sample >=3 headless `claude -p` runs per skill, capture stream-json, grade shape AND feed the same captures to the budget gate; report Pass@k/Pass^k | [x] |
| Single binary run/skill | One run per skill; cheapest on the session pool | |
| Self-review on lz-advisor's own files | Skip the external repo; review recently-changed plugin files | |

**Auto-selected:** n>=3 runs/skill, captures reused for SC-4.
**Notes:** Few-shot drift is probabilistic -- a single clean run can mask intermittent shorthand leakage. SC-4 already mandates n>=3 measured, so one set of >=3 captures per skill satisfies SC-1/2/4 together and yields Pass@k/Pass^k reliability (per the CLAUDE.md skill-creator convention). Self-review rejected: SC-3 specifically names ngx-smart-components as the review subject. Shape graded from the parent stream's rendered report (the render-verbatim user surface); budget measured from the agent's raw emission in the subagent JSONL.

---

## Budget-gate measurement source (SC-4) -> D-04, D-05

| Option | Description | Selected |
|--------|-------------|----------|
| `--from-trace` replay of live captures | Feed the live n>=3 agent output into `tests/D-*-budget.sh --from-trace`; reuse the existing per-section caps + anti-vacuous guard | [x] |
| Standalone agent calls + `wc -w` | Invoke the agents separately and word-count the output | |
| Existing self-extracted example sample | Re-run the fixtures against their hand-authored worked example | |

**Auto-selected:** `--from-trace` replay of the live UAT captures.
**Notes:** The fixtures already encode the per-section sub-caps, the anti-vacuous `matched_count >= min` guard, and (security) the `[Axx]` bracket assertion -- so a live-capture replay yields a measured verdict on REAL output, exactly what the locked D-09 decision demands ("measured, not reasoned; burned 3x on budget-neutrality"). The self-extracted-example option is explicitly vacuous for SC-4 (it would re-measure the hand-authored example, not live agent output). A small jq extraction converts stream-json/JSONL to the plain-text shape `--from-trace` expects (exact one-liner is planner discretion).

---

## ngx-smart-components worktree provisioning (SC-3) -> D-06, D-07, D-08

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated worktree off verified checkpoint branch, baseRef defended, artifacts extracted pre-removal | `git worktree add` off `uat/pre-storybook-compodoc` (name verified first), EXPECTED_BASE captured + `git merge --ff-only` correction, traces copied to lz-advisor `.planning/` before removal | [x] |
| Run on the live ngx working tree | No worktree setup overhead | |
| Self-review on lz-advisor's own files | Avoid the external repo entirely | |

**Auto-selected:** Dedicated worktree off the verified checkpoint branch with full isolation safeguards.
**Notes:** SC-3 is non-negotiable and the ngx repo has active WIP (STATE.md blocker) -- the live-tree option would contaminate their work. This is a MANUAL `git worktree add` in the external repo (at `/d/projects/github/LayZeeDK/ngx-smart-components`), NOT a Claude Code subagent `isolation: worktree` (which branches from origin/HEAD). Two documented failure modes defended structurally: the `worktree.baseRef` origin/HEAD base-drift gotcha (capture EXPECTED_BASE, correct via `git merge --ff-only` not `reset --soft`) and worktree-removal artifact loss (extract traces/findings/Pass@k into lz-advisor `.planning/` first). Exact branch-name verification deferred to plan time per SC-3.

---

## Residue sweep + failure disposition (SC-5) -> D-09, D-10

| Option | Description | Selected |
|--------|-------------|----------|
| One-shot scoped `git grep` + split failure disposition | `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` recorded as evidence; fix mechanical residue in-phase, route substantive behavioral drift to a Phase 12.x replan | [x] |
| New committed tracked residue test | Build `tests/D-residue-sweep.sh` as a standing regression guard | |
| Whole-repo grep with `:(exclude)` pathspecs | Sweep everything, exclude each frozen dir explicitly | |

**Auto-selected:** One-shot scoped `git grep` confined to `plugins/lz-advisor/`, with a split failure disposition.
**Notes:** The `-- plugins/lz-advisor/` pathspec alone excludes every frozen `.planning/` history artifact -- no fragile `:(exclude)` list and no risk of flagging accurate history (Phase 9 precedent: history stays as history). The tracked regression test is real value but is Phase-12-style hardening, deferred (verify-only phase; the retargeted budget fixtures already partly guard the grammar). Failure disposition is SPLIT: mechanical residue (stray shorthand/typo on one surface) is a find-and-clean deliverable, fixed in-phase and re-swept; a substantive behavioral failure (grouped grammar not reaching the rendered report) is an agent-contract rewrite that routes to a planned Phase 12.x gap-closure, not an inline verify-phase patch (the WR-05 partial-rewrite scar).

---

## Claude's Discretion

- Exact `uat/pre-storybook-compodoc` branch name + whether a newer checkpoint supersedes it (SC-3 defers to plan time).
- The realistic ngx review target (which changed files / diff slice) -- pick a slice yielding >=5 findings so the anti-vacuous guard and budget caps are exercised.
- Exact n (3 floor; 5 sharpens Pass@k) -- planner picks against the 5-hour session-pool / credit budget (nested `claude -p` shares the pool; can hit `out_of_credits`).
- The stream-json/JSONL -> trace-file extraction one-liner.
- Throwaway grader script vs inline `rg`/`git grep` over the captured rendered text.

## Deferred Ideas

- Standing residue regression test (`tests/D-residue-sweep.sh`) -- future-milestone hardening, not built in this verify-only phase.
- RPT-F01 (per-severity roll-up counts), RPT-F02 (severity/kind axis split), RPT-F03 (severity-prefixed finding IDs) -- carried from 12-CONTEXT.md; future-milestone report-format enhancements.
- **research-rtk-command-suitability-for-skills-and-agents** (todo, score 0.6) -- reviewed, NOT folded (orthogonal RTK-tooling research; folding into a verify-only phase is scope creep; same call Phase 12 made; deliberate deviation from the `--auto` >=0.4 auto-fold heuristic, flagged for audit).
