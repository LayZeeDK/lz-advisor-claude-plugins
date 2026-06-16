---
phase: 19-search-extract-worker-agents
plan: 04
subsystem: testing
tags: [eval, clopper-pearson, jstat, haiku-vs-sonnet, gating-read, voter, false-uphold, node-test, resumable]

# Dependency graph
requires:
  - phase: 19-01
    provides: "the search-and-stop spine (searchAndStop, staticKsAdapter, dateFilter, parseAvtDate)"
  - phase: 19-03
    provides: "the re-registered lock rule (pooled-n CP(1,N) ceiling, D-06 saturation/VOID, pinned minimums) + the trap recipe (lz-eval-traps.mjs)"
  - phase: 18-03
    provides: "the frozen off-model engine (countFalseUpholds, delta, clopperPearsonUpper, passAtK, passHatK, lockRuleVerdict, EVAL_THRESHOLDS)"
provides:
  - "eval/lz-eval-offline-read.mjs -- the DETERMINISTIC offline-read decision driver (calibrator gate, pooled DELTA read, VOID/PASS/FAIL-RAISE outcome resolver, resumable vote persistence + per-vote search trace)"
  - "eval/lz-eval-offline-read.test.mjs -- FILE-form deterministic coverage (17 discriminating tests, no model calls) of every outcome branch"
affects: [phase-20-orchestrator, phase-20-shadow-canary, voter-tier-default, search-worker-tier]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deterministic decision seam around model votes: the unit-tested driver owns the calibrator gate + delta read + outcome resolver; the model vote DISPATCH is the (out-of-band) D-08 Workflow"
    - "EXACT-ZERO pooled-excess count gate (Pitfall 3): the engine-facing delta upper is CP(indicator, reliableTrials) so any single excess FAILs at the per-claim reliability scale regardless of the large pooled n; the pooled CP(1,N) is a recorded LABEL only"
    - "VOID precedes the frozen engine: a saturated calibrator (Sonnet aces a stratum) forces VOID before lockRuleVerdict runs -- a both-models-ace tie is never read as Haiku-safe"
    - "Resumable skip-already-done filesystem vote persistence with a required per-vote search trace"

key-files:
  created:
    - "eval/lz-eval-offline-read.mjs"
    - "eval/lz-eval-offline-read.test.mjs"
  modified: []

key-decisions:
  - "Engine-facing subtleOpenBookDeltaUpper is computed as CP(excessIndicator, reliableTrials), NOT CP(excess, nPooled): at the large pooled n CP(>=1,N) sits well below the 0.25 per-claim anchor (e.g. CP(2,80)~=0.087), so reading the engine anchor at the pooled n would let a non-zero excess SLIDE UNDER the gate. Computing it at the per-claim reliability scale keeps any-single-excess-fails MECHANICALLY true (CP(0,15)~=0.218 PASS, CP(1,15)~=0.319 FAIL) and honors the Pitfall-3 EXACT-ZERO-count framing. The pooled CP(1,N) is recorded separately as the run-artifact LABEL."
  - "calibratorGate's mechanical 'below-ceiling' reading is sonnetFalseUpholds >= 1 (Sonnet recorded at least one false-uphold on the stratum); zero is 'saturated' (the both-models-ace fallacy). This is the literal D-06 discrimination decision; the recorded CP(1,N) ceiling is a LABEL, never a CI-width comparison."
  - "The driver does NOT spawn subagents: it reads persisted vote files and computes the mechanical decision. The model dispatch is the Task-2 D-08 Workflow."

patterns-established:
  - "EXACT-ZERO-count gate via a 0/1 indicator into CP at the reliability scale (decouples the gate from the pooled-CI width -- the clustering caveat is honored, not re-derived)"
  - "VOID-before-engine outcome resolver (the pre-condition outcome is decided before the frozen PASS/FAIL-RAISE engine; the engine never sees a saturated stratum)"

requirements-completed: [EVAL-02]

# Metrics
duration: ~35min
completed: 2026-06-16
---

# Phase 19 Plan 04: Offline known-gold gating read (Task 1) Summary

**Deterministic offline-read decision driver: the D-06 Sonnet-as-calibrator gate, the Haiku-MINUS-Sonnet pooled DELTA read over the frozen engine, the VOID/PASS/FAIL-RAISE outcome resolver, and resumable skip-already-done vote persistence with a required per-vote search trace -- 17 discriminating FILE-form tests, every outcome branch covered, no model calls.**

> SCOPE NOTE: This plan has TWO tasks. **Task 1 is DONE** (the deterministic driver + test, committed atomically). **Task 2 is PENDING-CHECKPOINT** -- it is a `checkpoint:human-verify` (gate=blocking) that runs the ACTUAL gating read via the D-08 dynamic Workflow dispatching real Sonnet + Haiku voter subagents over the trap set. A worktree executor cannot reliably drive the Workflow tool; Task 2 is executed by the orchestrator + human at the session level. The Task-2 checkpoint state is returned to the orchestrator (see "Next Phase Readiness").

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-16T~19:24Z
- **Completed:** 2026-06-16T19:59Z
- **Tasks:** 1 of 2 (Task 2 is a blocking human-verify checkpoint, NOT run)
- **Files modified:** 2 created (eval/lz-eval-offline-read.mjs 445 lines, eval/lz-eval-offline-read.test.mjs 487 lines)

## Accomplishments

- **The deterministic decision driver** (`eval/lz-eval-offline-read.mjs`): exports `calibratorGate` (D-06 saturation pre-condition), `readDelta` (the pooled Haiku-MINUS-Sonnet false-uphold DELTA over the frozen engine + Pass@1/Pass^k/pooled-CP labels), `resolveOutcome` (VOID/PASS/FAIL-RAISE), and the resumable vote persistence trio (`votePath`, `votePersisted`, `persistVote`). It consumes the frozen engine (`countFalseUpholds`, `delta`, `clopperPearsonUpper`, `passAtK`, `passHatK`, `lockRuleVerdict`, `EVAL_THRESHOLDS`) and the Plan-01 spine -- it never re-derives the CI math (Pitfall 3).
- **VOID precedes the engine:** a saturated calibrator (Sonnet aces a stratum -> zero false-upholds) resolves to VOID BEFORE `lockRuleVerdict` runs (the frozen engine has no VOID branch). A both-models-ace tie is never read as Haiku-safe (D-06).
- **The EXACT-ZERO pooled-excess gate** is mechanically true: the engine-facing `subtleOpenBookDeltaUpper` is `CP(excessIndicator, reliableTrials)` (0/1 indicator at the per-claim reliability scale), so ANY single Haiku-only excess FAILs identically (1 excess and 5 excess both FAIL), independent of the large pooled n. The pooled `CP(1,N_pooled)` is recorded separately as the run-artifact LABEL, never re-derived as a clustered CI.
- **Resumability (D-08) + per-vote trace (D-10):** `persistVote` skips an already-persisted vote (so a credit/account interruption mid-run is recoverable) and REQUIRES the `{queries[], depth, stop_reason}` search trace (so a null delta is diagnosable as parity vs both-stopped-early). The vote basename is `safeId`-guarded (T-19-TRAVERSE).
- **17 discriminating FILE-form tests, all green** (exit 0); the full eval-tree engine+spine+traps+new suite is 78/78 green together.

## Task Commits

1. **Task 1: Author the resumable offline-read driver + its deterministic test** - `00aa81a` (feat)

_Task 2 is a blocking `checkpoint:human-verify` -- NOT run (see "Next Phase Readiness"). No plan-metadata commit yet (STATE.md / ROADMAP.md are owned by the orchestrator after the wave completes; this worktree does NOT modify them)._

## Files Created/Modified

- `eval/lz-eval-offline-read.mjs` - the deterministic offline-read decision driver (calibrator gate -> pooled delta read -> VOID/PASS/FAIL-RAISE; resumable vote persistence + per-vote trace; guarded `--resolve <run-dir>` CLI tail).
- `eval/lz-eval-offline-read.test.mjs` - FILE-form deterministic coverage: calibrator gate discriminates saturated vs below-ceiling; VOID on a saturated calibrator regardless of the Haiku delta; FAIL-RAISE on a non-zero pooled excess at reliable>=15; PASS only on a zero excess AT reliable=15 with escalation below the kill band; the conjunctive PASS gates (reliability + cost); the exact-zero-count gate (any non-zero excess maps to the same CP(1,reliable) value); negative-excess clamp; trace fields populated; skip-already-done resumability; safeId traversal rejection.

## Decisions Made

- **Engine-facing delta upper at the per-claim reliability scale, not the pooled n** (see frontmatter key-decisions). Verified numerically against the frozen engine: CP(0,15)=0.218 (<=0.25, PASS), CP(1,15)=0.319 (>0.25, FAIL); the pooled CP(1,N) table matches the lock-rule prose (0.089/0.068/0.054 at N=60/80/100). This is the only design choice that required care; everything else is direct consumption of the frozen contracts.
- **`below-ceiling` = Sonnet false-upholds >= 1.** The literal D-06 discrimination decision (Sonnet demonstrably below ceiling). Zero is the saturation fallacy.
- The driver is a pure decision seam (no subagent spawning) -- per the plan, the model dispatch is the Task-2 Workflow.

## Deviations from Plan

None - plan executed exactly as written for Task 1. The one design choice that needed resolution (engine-facing delta upper scale) is faithful to the lock rule's EXACT-ZERO-pooled-excess framing (Pitfall 3) and the frozen `EVAL_THRESHOLDS.DELTA_UPPER_MAX = 0.25` per-claim anchor; it is not a deviation from any plan instruction.

## Known Stubs

None. The `liveWebSearchAdapter` (Plan-01) is a documented protocol-shape stub the eval never executes (the offline read drives the static-KS adapter only, D-05/D-07); it is not introduced by this plan and is intentional per Plan 01.

## Issues Encountered

- The worktree's `eval/node_modules` (jstat) was absent on spawn; restored with `cd eval && npm ci` (1 package; gitignored, never committed). This is the standard eval-deps restore documented in the plan's Task-2 verify step and 19-RESEARCH.md Runtime State Inventory; no code change.

## Carry-forward note for the Task-2 read (single-digit-day claim_date)

The frozen `parseAvtDate` (Plan 19-01) uses a two-digit-day regex `/^\d{2}-\d{2}-\d{4}$/` and THROWS on a single-digit-day `claim_date` like `"9-10-2020"`. The frozen parser must NOT be modified. When the Task-2 D-08 Workflow builds the full N=60-100 read set from AVeriTeC dev seeds, it MUST tolerate this (skip or zero-pad such seeds when assembling the read set) so a single-digit-day seed does not crash the run. The Task-1 driver/test never exercise `parseAvtDate` directly (the test injects vote files and pre-computed counts), so this carry-forward binds the Task-2 read, not Task 1.

## Next Phase Readiness -- TASK 2 CHECKPOINT (PENDING)

**Task 2 is a blocking `checkpoint:human-verify` and is NOT run by this worktree executor.** It is returned to the orchestrator for the orchestrator + human to execute at the session level (it needs the Workflow tool to dispatch real voter subagents).

- **What is built (ready):** the deterministic offline-read driver (Task 1) + the Plan-01 search loop + the Plan-03 trap set and re-registered lock rule. The driver computes the calibrator gate, the Haiku-MINUS-Sonnet pooled DELTA, the CP(1,N_pooled) label, Pass@1/Pass^k/per-stratum false-uphold, and the PASS/FAIL-RAISE/VOID outcome over PERSISTED votes.
- **How to verify (Task 2, for the orchestrator + human):**
  1. Restore eval deps if needed: `cd eval && npm ci`.
  2. Run the full deterministic eval-tree suite (must be green before the read), each by explicit FILE path:
     `node --test eval/lz-eval-aggregate.test.mjs eval/lz-eval-dataset.test.mjs eval/lz-eval-packaging-boundary.test.mjs eval/lz-eval-search-loop.test.mjs eval/lz-eval-traps.test.mjs eval/lz-eval-offline-read.test.mjs`
     then `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`.
  3. Execute the offline read via the D-08 dynamic Workflow (Sonnet calibrator step FIRST). Confirm from the per-vote search traces that on a hardened stratum Sonnet is demonstrably BELOW ceiling (a non-trivial false-uphold count). If NO hardened stratum puts Sonnet below ceiling -> VOID/INCONCLUSIVE.
  4. On a Sonnet-below-ceiling stratum, read the Haiku-MINUS-Sonnet pooled DELTA + the CP(1,N) ceiling at reliable=15; record Pass@1, Pass^k, per-stratum false-uphold.
  5. Interpret: PASS (zero pooled excess at reliable=15, escalation below the kill band) -> clear Haiku for the Phase-20 shadow/canary; FAIL-RAISE (non-zero excess or kill-band escalation) -> RAISE to the user, Sonnet-default ships; VOID (saturation) -> RAISE to the user, defer to the Phase-20 shadow, Sonnet-default ships. A both-models-ace tie is NEVER read as Haiku-safe.
  6. Write the outcome + per-vote search traces + realized pooled n + CP(1,N) label into a run artifact under gitignored `eval/.cache/` (and summarize in the SUMMARY). NO mutated NC text leaves the cache.
- **Resume signal:** Type "approved" with the recorded outcome (PASS / FAIL-RAISE / VOID), or describe issues. On FAIL-RAISE or VOID, confirm the decision is raised to the user and Sonnet-default ships in the interim.

## Self-Check: PASSED

- FOUND: eval/lz-eval-offline-read.mjs
- FOUND: eval/lz-eval-offline-read.test.mjs
- FOUND: .planning/phases/19-search-extract-worker-agents/19-04-SUMMARY.md
- FOUND commit: 00aa81a (Task 1)
- Test gate: `node --test eval/lz-eval-offline-read.test.mjs` -> 17/17 pass, exit 0
- Joint eval-tree gate (engine+spine+traps+new): 78/78 pass, exit 0

---
*Phase: 19-search-extract-worker-agents*
*Completed (Task 1): 2026-06-16*
