---
phase: 19-search-extract-worker-agents
plan: 04
subsystem: testing
tags: [eval, re-plan-7, absolute-per-model, certify-model, decision-matrix, one-sided-cp, tau-fu, tau-or, n-trap-floor, n-ctrl-floor, saturation-as-pass, screen-not-certificate, out-of-family-only-retain, opus-as-voter, subject-difficulty-floor, covariate-overlap, cluster-independence, evidence-absent-stratum-floor, wice-closed-book-trap-arm, wice-heavy, per-model-fair-prompts, prompt-fairness-gate, prompt-sha-freeze, three-voter-dispatch, opus-reference-voter, re-pre-registration, anti-drift, no-spend, zero-votes-window, haiku-vs-sonnet, gating-read, node-test, pre-registration, re-plan-12, mcc-screen, contrastive-minimal-pairs, dual-baseline-guard, bca-bootstrap, label-permutation, screen-pass, sdt-positive-trials, offline-never-works, over-refusal-moved-to-live]

# Dependency graph
requires:
  - phase: 19-01
    provides: "the search-and-stop spine (searchAndStop, staticKsAdapter, dateFilter, parseAvtDate, safeParse, SEARCH_DEFAULTS) -- FROZEN, byte-identical, consumed not rewritten"
  - phase: 19-03
    provides: "the trap recipe machinery (mutateOverreach, validityGate, writeTrap, loadDevSeedsAndKs) + the WiCE loader (remapLabel, stratify) + the re-registered lock rule + manifest"
  - phase: 18-03
    provides: "the frozen off-model engine (countFalseUpholds, delta, clopperPearsonUpper, passAtK, passHatK, lockRuleVerdict, EVAL_THRESHOLDS) -- the EXISTING numbers byte-identical"
  - phase: 19-04 (RE-PLAN-5, prior commits a3c3507/7cf2d4d/edf6bf2)
    provides: "the CARRIED multi-probe consensus (runProbeConsensus) + interleaved positive controls + k=9 + ATTACK_MODES seat diversity + the closed-book 3-part dispatch + persistVote + scorePositiveControls + classifyCalibration (calibratorGate/readDelta/resolveOutcome STAY for back-compat)"
provides:
  - "eval/lz-eval-aggregate.mjs -- the FROZEN jstat CP/Wilson engine, RE-PLAN-7 ADD-only: clopperPearsonUpperOneSided(x,n) (the F2-pinned ONE-SIDED 95% upper) + the 2 new EVAL_THRESHOLDS keys TAU_FU=0.10 / TAU_OR=0.15 + the N floors N_TRAP_FLOOR=36 / N_CTRL_FLOOR=24. The EXISTING numbers (ALPHA/RELIABLE_TRIALS/MIN_K/ESCALATION_KILL_*/DELTA_UPPER_MAX/STRATA) + clopperPearsonUpper (two-sided) + wilsonUpper/passAtK/passHatK/countFalseUpholds/delta/lockRuleVerdict are byte-identical"
  - "eval/lz-eval-offline-read.mjs -- RE-PLAN-7 ADDS certifyModel (the 4-label ABSOLUTE per-model verdict via the ONE-SIDED CP at TAU_FU/TAU_OR with the 36/24 floors; PASS_A AND PASS_B; the W-3 mechanical min-not-met derivation; certifyModel is the AUTHORITATIVE power gate) + decisionMatrix (the Haiku x Sonnet ship cell + the Opus reference row + the CONDITIONAL near-Opus diagnostic + the OPUS-FAILS-BAR major finding -- the four Opus-voter nuances; framing always clears-the-closed-book-SCREEN). The RE-PLAN-5 SATURATED-VOID framing is RETIRED for the decision path; scorePositiveControls/calibratorGate/classifyCalibration/persistVote STAY for back-compat"
  - "eval/lz-eval-trap-assembler.mjs -- RE-PLAN-7: the RETAIN predicate is OUT-OF-FAMILY-only (#3/F3; the injected probes array is the decider, the optional inFamilyAnnotationProbe is a non-gating diagnostic) + the F5 subjectDifficultyProbe (VOID-difficulty) + covariate-overlap check (VOID-covariate) + F6 cluster independence (one primary claim per source/seed cluster) + runProbeConsensus EXPORTED for the WiCE arm. The build-floor DEFAULTS stay 3/3 (W2). The frozen primitives + EVAL_THRESHOLDS numbers + URL_DATE_RULE byte-identical"
  - "eval/lz-eval-wice-traps.mjs -- NET-NEW (W1/F7): assembleWiceTraps, the WiCE CLOSED-BOOK trap+control arm carrying the trap BULK. Reuses the Phase-18 vendored WiCE loader (remapLabel) over eval/__fixtures__/wice-vendored/records; NO AVeriTeC dateFilter/survivor pipeline (closed-book-native, book:'closed'); screened by the SAME OUT-OF-FAMILY consensus + the F5/F6 floors; recipe-not-text + license-clean (ODC-BY/MIT); build-floor 3/3"
  - "eval/lz-eval-voter-dispatch.workflow.mjs -- RE-PLAN-7: parameterized over THREE measured voter seats (sonnet/haiku/opus) recording the SELECTED model + the frozen per-model prompt-sha per seat + on each scored vote (#2); reducePooledVerdict applied symmetrically on both arms (F6). The closed-book 3-part realization + k=9 + ATTACK_MODES + the scored-quantity reconciliation (T-19-19) CARRIED byte-identical"
  - "plugins/lz-advisor/agents/research-verify-voter-opus.md -- NET-NEW (W4): the measured Opus REFERENCE voter agent, best-effort engineered to the closed-book judge task contract (NO-ABSTENTION definite verdict; the attack-mode rotation; entailment-gap + absence-of-evidence discipline) -- NOT a verbatim Sonnet copy"
  - "eval/__fixtures__/lz-eval-manifest.json + eval/lz-eval-lock-rule.md -- RE-PRE-REGISTERED (zero-votes window): the absolute per-model design + the 2 TAU + N floors (one-sided, verified anchors) + decisionMatrix + the four Opus-voter nuances + the OUT-OF-FAMILY-only retain + the F5/F6/F7 floors + the per-model prompt shas + the WiCE-heavy dataset + the prompt-fairness gate + the SCREEN-not-certificate framing; the relative-delta + SATURATED-VOID prose RETIRED for the decision path (prose == code byte-for-byte, F2)"
affects: [phase-19-04-task-4-gold-build-SPEND, phase-19-04-task-5-three-voter-run-SPEND, phase-19-05-stage2-haiku, phase-20-orchestrator, phase-20-shadow-canary, voter-tier-default]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ABSOLUTE per-model verdict (the PIVOT): certifyModel proves WHETHER each model WORKS as a verify-voter via TWO estimands (false-uphold over traps; over-refusal over controls) pooled PER-CLAIM with a ONE-SIDED CP at TAU_FU/TAU_OR -- a clean EARNED 0 on a hard, covariate-matched set with the controls upheld + the CI tight certifies WORKS (SATURATION-as-PASS; the SATURATED-VOID framing is RETIRED)"
    - "TWO floor sites of intentionally different magnitudes (W2/W3): the assembler BUILD-floor (3/3 -- can we even build an arm) vs the certifyModel adequacy POWER-floor (36/24 -- is the arm adequately powered for the one-sided CP to bind); certifyModel is the authoritative power gate"
    - "OUT-OF-FAMILY-only retain (#3/F3): the gold is decided by GPT-5.5 + Gemini ONLY (family-independent); the in-family Opus probe is a non-gating annotation; Opus is ADDED as a measured reference voter (tested, not testing) -- dropping the in-family conjunct LOOSENS the AND -> retains MORE"
    - "Closed-book-native WiCE arm: assembleWiceTraps builds the trap BULK from the GIVEN closed-book WiCE evidence (remapLabel) WITHOUT the AVeriTeC dateFilter/survivor pipeline -- WiCE has no dated-URL KS"
    - "Per-model fair prompts + frozen prompt-sha freeze (#2/F8): each voter prompt is sha256'd in the manifest in the zero-votes window; the dispatch records the per-seat prompt-sha; the anti-drift test asserts each recorded sha matches the agent file (a per-model verdict is 'works UNDER ITS OWN BEST PROMPT')"
    - "Re-pre-registration in the ZERO-VOTES window: the complete absolute decision function is locked AS CODE with passing anti-drift tests + the lock-rule/manifest prose == code byte-for-byte BEFORE any vote (anti-result-shopping)"

key-files:
  created:
    - "eval/lz-eval-wice-traps.mjs"
    - "eval/lz-eval-wice-traps.test.mjs"
    - "plugins/lz-advisor/agents/research-verify-voter-opus.md"
    - "eval/lz-eval-mcc.mjs (RE-PLAN-12 Task 6)"
    - "eval/lz-eval-mcc.test.mjs (RE-PLAN-12 Task 6)"
    - "eval/lz-eval-baseline-guard.mjs (RE-PLAN-12 Task 7)"
    - "eval/lz-eval-baseline-guard.test.mjs (RE-PLAN-12 Task 7)"
    - "eval/lz-eval-contrastive-screen.mjs (RE-PLAN-12 Task 8)"
    - "eval/lz-eval-contrastive-screen.test.mjs (RE-PLAN-12 Task 8)"
  modified:
    - "eval/lz-eval-aggregate.mjs"
    - "eval/lz-eval-aggregate.test.mjs"
    - "eval/lz-eval-offline-read.mjs"
    - "eval/lz-eval-offline-read.test.mjs"
    - "eval/lz-eval-trap-assembler.mjs"
    - "eval/lz-eval-trap-assembler.test.mjs"
    - "eval/lz-eval-voter-dispatch.workflow.mjs"
    - "eval/lz-eval-voter-dispatch.workflow.harness.test.mjs"
    - "eval/lz-eval-dataset.test.mjs"
    - "eval/__fixtures__/lz-eval-manifest.json"
    - "eval/lz-eval-lock-rule.md"

decisions:
  - "TAU_FU = 0.10 as the false-uphold SCREEN bar (decision #1; one-sided 95% CI); the stricter 0.06 NOT adopted -- 0.10-as-SCREEN is honest given Sonnet-default ships + the Phase-20 live shadow is the REAL gate"
  - "PER-MODEL FAIR PROMPTS, not a shared prompt (decision #2/F8); the Opus reference prompt is best-effort-engineered, NOT a Sonnet mirror (W4) -- a per-model verdict is 'works under its own best prompt'"
  - "DROP Opus from the gold-DECIDER + ADD Opus as a THIRD MEASURED VOTER (decision #3/F3) -- the gold is family-independent; Opus validates the quality anchor + yields the near-Opus diagnostic"
  - "SATURATION-as-PASS: a clean EARNED 0 certifies WORKS (the RE-PLAN-5 SATURATED-VOID label is RETIRED for the decision path)"
  - "SCREEN-not-certificate (F4/F9): an offline WORKS clears the closed-book SCREEN, NEVER auto-flips Haiku ON; the Phase-20 live shadow is the named precondition for any flip"

# Metrics
metrics:
  duration: ~70min (RE-PLAN-7) + RE-PLAN-8 + RE-PLAN-12
  completed: 2026-06-19
  tasks_completed: 9
  tasks_pending: 0
  files_created: 9
  files_modified: 11
  eval_tree_tests_green: 389
  re_plan_12_decision: SCREEN-PASS (gate to Phase-20 live; offline never WORKS)
---

# Phase 19 Plan 04: ABSOLUTE per-model eval (RE-PLAN-7) -- Tasks 1-3 (no-spend build) Summary

The RE-PLAN-7 no-spend build of the ABSOLUTE per-model verify-voter eval: the one-sided CP engine
primitives + certifyModel/decisionMatrix + the OUT-OF-FAMILY-only assembler with the F5/F6 floors + the
WiCE closed-book trap arm + the Opus-as-third-voter dispatch + the re-pre-registration -- locked AS CODE
with passing anti-drift tests in the ZERO-VOTES window, with ZERO model spend.

## Status

- **Tasks 1-3 (RE-PLAN-7 absolute per-model NO-SPEND build): COMPLETE + committed.** NO model spend of
  any kind.
  - Task 1 -- `c84e6d0`: `clopperPearsonUpperOneSided` + TAU_FU=0.10 + TAU_OR=0.15 + N_TRAP_FLOOR=36 +
    N_CTRL_FLOOR=24 ADDED to the frozen engine.
  - Task 2 -- `dca8d43`: `certifyModel` (the 4-label absolute per-model verdict) + `decisionMatrix` (the
    four Opus-voter nuances) ADDED to the offline-read; the SATURATED-VOID framing RETIRED for the
    decision path.
  - Task 3 -- `8c97f01`: the OUT-OF-FAMILY-only retain predicate + the F5 difficulty/covariate floors +
    F6 cluster independence in the assembler; the NET-NEW WiCE closed-book trap arm
    (`assembleWiceTraps`); the Opus-as-third-voter dispatch wiring + the per-model prompt-sha freeze;
    `research-verify-voter-opus.md` authored; the lock-rule + manifest re-pre-registration + anti-drift
    tests.
- **Task 4 (T-spend-1: OUT-OF-FAMILY gold build, Copilot AI Credits): PENDING the blocking spend
  boundary.** NOT executed -- awaiting user authorization.
- **Task 5 (T-spend-2: three-voter k=9 runs -> certifyModel per model -> decision matrix, Claude pool):
  PENDING the blocking spend boundary.** NOT executed -- awaiting user authorization.

Execution HALTED at the spend boundary per the hard constraint. The orchestrator handles the spend
authorization with the user via AskUserQuestion.

## What was built (no spend)

### Task 1 -- the one-sided CP helper + the 2 TAU + the 2 N floors (the engine, ADD-only)

- `clopperPearsonUpperOneSided(x, n, alpha = ALPHA)` = `jStat.beta.inv(1 - alpha, x+1, n-x)` -- the
  F2-pinned ONE-SIDED 95% upper (the 0.95 quantile, a one-directional ceiling) the absolute per-model
  gate reads. The two-sided `clopperPearsonUpper` (1 - alpha/2) stays the recorded run-artifact LABEL for
  the carried relative read; both coexist. Same degenerate-boundary guards (n===0 -> 1; x===n -> 1; x>n
  THROWS).
- `EVAL_THRESHOLDS` gains, inside the SAME `Object.freeze` after the existing keys: `TAU_FU: 0.10`,
  `TAU_OR: 0.15`, `N_TRAP_FLOOR: 36`, `N_CTRL_FLOOR: 24`. The EXISTING numbers are byte-unchanged.
- Engine-verified anchors (used in the discriminating tests + the lock-rule prose==code assertion):
  `CP1s(0,18)=0.1533 vs CP2s(0,18)=0.1853` (one-sided != two-sided); `CP1s(0,24)=0.1173 <= 0.15`;
  `CP1s(0,36)=0.0798 <= 0.10`; `CP1s(1,46)=0.0990 <= 0.10`; `CP1s(0,18)=0.1533 > 0.15` (the OLD floor 18
  mathematically FAILS, F1).

### Task 2 -- certifyModel + decisionMatrix (the offline-read, THE PIVOT)

- `certifyModel({ model, falseUpholds, nTrap, overRefusals, nCtrl, traceAudit, difficultyFloorMet,
  covariateOverlapMet, evidenceAbsentStratumMet })` -> `{ verdict, estimandA:{cpUpper,pass},
  estimandB:{cpUpper,pass}, anyUpholdOnMinNotMet, reason }`. The pre-registered verdict order:
  VOID-on-power FIRST (nTrap < 36 OR nCtrl < 24 OR the evidence-absent stratum unmet, F7) -> VOID-difficulty
  (F5) -> VOID-covariate (F5) -> VOID-artifact (always-refute control collapse OR an uphold on a
  min-not-met/truncated/quota-killed trace, W-3 mechanical derivation) -> WORKS (PASS_A AND PASS_B via the
  ONE-SIDED CP) -> DOES-NOT-WORK. The PIVOT: a clean EARNED 0 certifies WORKS.
- `decisionMatrix({ haiku, sonnet, opus })` -> `{ cell, opusReference:{verdict, opusFailsBar},
  nearOpusDiagnostic:{meaningful, value}, raiseToUser, framing }`. The SHIP cell is the Haiku x Sonnet
  cross-product ONLY (nuance i); opusFailsBar is the NEW first-class MAJOR finding (nuance ii); the
  near-Opus diagnostic is CONDITIONAL on Opus clearing the bar (nuance iii); framing is always
  `clears-the-closed-book-SCREEN` (F4) and raiseToUser is always true (settle-OR-raise).
- The SATURATED-VOID framing is RETIRED for the decision path: a discriminating test proves the SAME
  clean-earned-0 inputs the carried `classifyCalibration` labels SATURATED-VOID now certify WORKS via the
  RE-PLAN-7 `certifyModel` path. No RE-PLAN-7 test asserts a clean earned 0 -> VOID.

### Task 3 -- the family-independent assembler, the WiCE arm, the three-voter dispatch, the re-registration

- **OUT-OF-FAMILY-only retain (#3/F3):** the injected `probes` array is the retain decider; the optional
  `inFamilyAnnotationProbe` is run per packet for the OOF-vs-in-family agreement diagnostic ONLY (it does
  NOT enter the retain AND). An OOF-agreed packet is retained even when the in-family annotation differs.
- **The F5 floors:** `subjectDifficultyProbe` (a held-out Claude reference that ACES the retained traps
  beyond `subjectDifficultyMaxCatchRate` -> VOID-difficulty) + the covariate-overlap check (trap vs control
  claim-length means diverge beyond `covariateOverlapTolerance` -> VOID-covariate). Both load-bearing,
  opt-in (only fire when the hook/flag is injected, so the carried 3/3-floor tests stay green).
- **F6 cluster independence:** one primary claim per source/seed cluster (the AVeriTeC source fact-check
  URL; the WiCE dev<NNNNN> source id) -- duplicate-cluster sub-claims collapse (counted in
  `attrition.clusterCollapsed`).
- **NET-NEW `eval/lz-eval-wice-traps.mjs` (`assembleWiceTraps`):** the WiCE CLOSED-BOOK trap+control arm,
  the trap BULK (W1/F7). Reuses `remapLabel` over the vendored records (top-level `label`, `meta.id`);
  closed-book-native (NO AVeriTeC dateFilter/survivor pipeline); screened by the SAME OUT-OF-FAMILY
  consensus (`runProbeConsensus`, now exported) + the F5/F6 floors; recipe-not-text + license-clean
  (book:'closed'); build-floor 3/3.
- **Three-voter dispatch + per-model prompt freeze (#2):** the dispatch is parameterized over
  `{sonnet, haiku, opus}`, records the SELECTED model + the frozen per-model prompt-sha per seat + on each
  scored vote; `reducePooledVerdict` (any-uphold) applies symmetrically on both arms (F6 -- any-seat-refute
  on a control = the over-refusal event). The closed-book 3-part realization + k=9 + ATTACK_MODES carried
  byte-identical.
- **`research-verify-voter-opus.md` authored (W4):** the measured Opus REFERENCE voter, best-effort
  engineered (entailment-gap + absence-of-evidence discipline, the attack-mode rotation, the NO-ABSTENTION
  definite-verdict contract) -- NOT a verbatim Sonnet copy. The three per-model prompt sha256 are frozen in
  the manifest:
  - sonnet `883b67578aab7b80535f653266b051f64fe78f5e43edf1bd177b6fd7a769bac6`
  - haiku `fcc5533f0781801b73124d21574af879da745b4947fa5fb0bba057216f43d2b3`
  - opus `f19f2d244fcda014f1c94fca4b3aa7dae1c6b980e7e965e3bbe6de66840f9c95`
- **The RE-PRE-REGISTRATION (zero-votes window):** the lock-rule + manifest record the absolute per-model
  design + the 2 TAU + N floors (one-sided, verified anchors) + decisionMatrix + the four Opus-voter
  nuances + the OUT-OF-FAMILY-only retain + Opus-as-voter + the F5 difficulty/covariate floors + F6
  cluster independence + the F7 evidence-absent stratum floor + the per-model prompt shas + the WiCE-heavy
  dataset + the prompt-fairness gate + the SCREEN-not-certificate framing. The relative-delta +
  SATURATED-VOID prose is RETIRED for the decision path. Anti-drift tests assert prose == code
  byte-for-byte (the TAU/floor numbers match `EVAL_THRESHOLDS`; the one-sided-CI anchors match the engine;
  each per-model prompt sha matches its agent file).

## Verification (all green; FILE-form node:test gates)

- Task 1 gate: `node --test eval/lz-eval-aggregate.test.mjs` -> 39 pass.
- Task 2 gate: `node --test eval/lz-eval-offline-read.test.mjs` -> 58 pass.
- Task 3 gate: `node --test eval/lz-eval-trap-assembler.test.mjs eval/lz-eval-wice-traps.test.mjs
  eval/lz-eval-voter-dispatch.workflow.harness.test.mjs eval/lz-eval-aggregate.test.mjs
  eval/lz-eval-dataset.test.mjs` -> 138 pass.
- **The FULL carried eval-tree suite (the 11 baseline files + the new WiCE file) -> 308 tests green** (271
  baseline + 37 net-new). The plugin-tree aggregator test (`lz-deep-research-aggregate.test.mjs`) -> 41
  pass.

## Byte-identity confirmation (frozen primitives + EVAL_THRESHOLDS existing numbers + URL_DATE_RULE)

- `eval/lz-eval-search-loop.mjs` (parseAvtDate / safeParse / dateFilter / staticKsAdapter / searchAndStop)
  + `eval/lz-eval-traps.mjs` (the recipe machinery): UNTOUCHED -- no diff this plan.
- `eval/lz-eval-aggregate.mjs`: pure ADD-only (zero deleted lines) -- the existing EVAL_THRESHOLDS numbers
  (ALPHA 0.05, RELIABLE_TRIALS 15, MIN_K 5, ESCALATION_KILL_LOW 0.4, ESCALATION_KILL_HIGH 0.5,
  DELTA_UPPER_MAX 0.25, STRATA) + clopperPearsonUpper (two-sided) + wilsonUpper/passAtK/passHatK/
  countFalseUpholds/delta/lockRuleVerdict byte-identical.
- `URL_DATE_RULE` byte-identical: the manifest's recorded `url_date_rule` still equals
  `URL_DATE_RULE.source` byte-for-byte (the Task-3 anti-drift assertion is green).
- The Phase-17 schema + the closed-book 3-part dispatch realization + persistVote + the
  datasets/manifest example rows are carried unchanged (only the stage1_pre_registration block + the
  dispatch seat/prompt-sha recording changed).

## Deviations from Plan

### Auto-fixed / clarified during execution (Rule 3 -- blocking-issue resolution within scope)

**1. [Rule 3 - Blocking] The F6 cluster key for AVeriTeC seeds is the source fact-check URL, not a
synthetic `cluster` field.**
- **Found during:** Task 3, the F6 cluster-independence test.
- **Issue:** `loadDevSeedsAndKs` strips arbitrary seed fields (it returns only claim_id/claim/label/
  claim_date + the source-URL fields), so a synthetic `seed.cluster` field is not preserved through the
  loader -- the cluster never collapsed.
- **Fix:** `clusterKeyFor` derives the cluster from the source URL (`cached_original_claim_url` /
  `original_claim_url` / `fact_checking_article`) when present -- the real AVeriTeC cluster signal
  (seeds derived from the same fact-check share a source) -- falling back to an explicit `seed.cluster`
  then the claim_id. The test was updated to seed `cached_original_claim_url` (a loader-preserved field)
  instead of `cluster`. This is faithful to the plan's "source/seed cluster" intent (the WiCE arm uses the
  dev<NNNNN> source id, the AVeriTeC arm uses the source URL).
- **Files:** eval/lz-eval-trap-assembler.mjs, eval/lz-eval-trap-assembler.test.mjs.
- **Commit:** 8c97f01.

**2. [Rule 3 - Blocking] The lock-rule TAU_FU prose cell records `0.1` (the JS-stringified frozen value),
not `0.10`.**
- **Found during:** Task 3, the prose==code anti-drift assertion.
- **Issue:** the anti-drift test builds the needle from `EVAL_THRESHOLDS.TAU_FU` (which JS stringifies as
  `0.1`); a `0.10` table cell would not match byte-for-byte.
- **Fix:** the lock-rule TAU_FU table cell reads `0.1` (with a parenthetical noting the literal frozen
  value is 0.10), matching the engine string form -- mirroring the existing anti-drift pattern.
- **Files:** eval/lz-eval-lock-rule.md.
- **Commit:** 8c97f01.

### Scope clarifications (no behavior deviation)

- The F5 floors + cluster independence in `assembleStage1Traps` are OPT-IN (only enforced when the
  relevant injected hook/flag is supplied; the build-floor default stays 3/3, clusterIndependence defaults
  false). This keeps every carried RE-PLAN-5/4 assembler test green byte-identical while adding the
  RE-PLAN-7 capability. The WiCE arm defaults clusterIndependence ON (its sub-claim structure is the
  primary F6 motivation).
- The carried `classifyCalibration` / `calibratorGate` / `readDelta` / `resolveOutcome` were kept for
  back-compat (the plan permits "re-point OR retire"); the re-pointed approach (a discriminating test
  proving the same clean-earned-0 inputs now certify WORKS via certifyModel) was chosen so no carried test
  is deleted.

## Spend boundary

Tasks 4 and 5 were NOT started. ZERO model calls were made (no `copilot`, no `claude -p`, no
voter-dispatch Workflow run, no OOF probe). STATE.md and ROADMAP.md were NOT modified (the orchestrator
owns them; the plan is mid-flight). `.claude/settings.json` was NOT staged or modified (its pre-existing
unrelated modification is left untouched). Execution halted cleanly at the board-gated spend boundary.

## Self-Check: PASSED
- FOUND: eval/lz-eval-wice-traps.mjs
- FOUND: eval/lz-eval-wice-traps.test.mjs
- FOUND: plugins/lz-advisor/agents/research-verify-voter-opus.md
- FOUND commit c84e6d0 (Task 1)
- FOUND commit dca8d43 (Task 2)
- FOUND commit 8c97f01 (Task 3)
- 308 eval-tree tests green; frozen primitives + EVAL_THRESHOLDS existing numbers + URL_DATE_RULE byte-identical.

---

# RE-PLAN-8 Tasks 4-5 (NET-NEW, NO-SPEND) -- bulk OOF batching + non-gating cheaper-model pilot + k=1 stability lever

The sections ABOVE document the CARRIED RE-PLAN-7 Tasks 1-3 (committed c84e6d0 / dca8d43 / 8c97f01) and
are PRESERVED byte-identical. This section documents the NET-NEW RE-PLAN-8 build for the RENUMBERED
plan (19-04-PLAN.md as re-authored under 19-04-REPLAN-DECISION-8.md): Tasks 1-3 are the carried RE-PLAN-7
work; Tasks 4-5 are the NET-NEW no-spend build below; Tasks 6-7 are the blocking SPEND checkpoints
(T-spend-1 gold build + T-spend-2 three-voter k=9), still human-gated and NOT executed. (Note: the
"Spend boundary" paragraph above used the OLD RE-PLAN-7 task numbering where "Tasks 4-5" were the spend
checkpoints; under RE-PLAN-8 those became Tasks 6-7.)

## Tasks completed (RE-PLAN-8, NO SPEND)

### Task 4 (commit 5e048a3): the BATCHED OUT-OF-FAMILY probe adapter + the contamination gate (DP1-DP4)

- `eval/lz-eval-oof-batch.mjs` (NET-NEW) exports `makeBatchedOofProbe({ callModel, model, batchSize=8,
  hardBatchSize=6, hardNearBoundaryIds, seed, score })` -> a probe with the EXISTING runProbeConsensus
  per-packet contract (`{ accepted, reason, entails }`), ONE element per OOF model. CHOSEN SHAPE
  (documented in the module): the `prepareBatches(packets) -> resolverMap` PRE-PASS (avoids the
  flush-boundary deadlock -- runProbeConsensus drives packets one-at-a-time and short-circuits on the
  first decline, so a buffering-per-packet probe could hang; the pre-pass dispatches every batch up
  front and the per-packet probe reads the resolved map). Packs <=8 packets/call; hard near-boundary ids
  ride in <=6-packet batches (a 7-hard set splits 6+1). OPAQUE NON-ORDINAL per-call ids (hash tokens,
  not c1/c2/.. -- no interleave/position leak). Per-call-and-per-model order reshuffle via a
  deterministic PRNG keyed by seed+model+callIndex (recorded seed). Renders its OWN per-item
  EVIDENCE+CLAIM block from the real packets' date-filtered survivors using the REUSED gold-blind rubric
  PREAMBLE -- the expected direction (trap=false/control=true) + the per-packet expectedEntailment NEVER
  enter the prompt.
- `eval/lz-eval-oof-batch-parse.mjs` (NET-NEW) is the byte-faithful port of the
  `eval/.cache/oof-probe/score.mjs` slice (fence-strip + first-`[`/last-`]` + `JSON.parse` + the byId
  `{ id -> entails }` extraction); it REUSES ONLY the slice + byId (NOT score.mjs's hardcoded 6-case GT
  / c1-c6 ITEMS). DP3-hardened: a non-boolean entails is PRESERVED (not coerced to false) so the adapter
  fail-closed-DROPS it rather than fabricating a retain.
- DP3 FAIL-CLOSED-TO-DROP: a per-packet defect (missing/extra/duplicate id, non-boolean entails,
  batch-level summary) -> that packet `{ accepted:false }` (a probe-decline) -> counted in
  `attrition.probeDropped` by runProbeConsensus (verified DISCRIMINATING -- the others resolve, the
  defective one drops, NEVER a fabricated retain). A WHOLE-BATCH JSON failure -> re-run the batch ONCE,
  then SPLIT it in half (both recorded in `batchEvents`).
- `runContaminationGate({ singleResults, batchedResults, model })` -> `{ agreement, pass, directive }`:
  >=11/12 exact single-vs-batched entails agreement PASSES (incl. one reversed-order variant in the
  12-slice); <11/12 returns `directive:'batch-size-5-and-revalidate'` (11/12 tolerates one benign flip;
  100% would false-trip).
- `eval/lz-eval-oof-batch.test.mjs`: 11 DISCRIMINATING tests (de-mapping under a permuted opaque-id
  order; hard near-boundary 6+1 batching; DP3 per-packet + whole-batch re-run-once-then-split; the
  prompt carries neither the gold word refuted/unrefuted nor the expectedEntailment; the gate 12/12 +
  11/12 pass vs 10/12 -> the batch-5 directive; the module returns the model-reported entails unchanged
  so a model-entails-true on a refuted-gold trap surfaces as a consensus SPLIT, not a flipped retain).
  FILE-form green (11 pass).

### Task 5 (commit 9652c5e): the NON-GATING cheaper-model pilot + the k=1 stability certificate + ADDITIVE re-pre-registration (DP7-DP10)

- `eval/lz-eval-cheaper-pilot.mjs` (NET-NEW) exports `classifyCheaperRole(...)` ->
  `'decider'|'pre-filter'|'diagnostic-annotator'|'none'` via `clopperPearsonUpperOneSided` +
  `EVAL_THRESHOLDS.TAU_FU/TAU_OR` on the PER-ARM PACKET counts (false-accepts/36 traps;
  false-vetoes/30 controls), NEVER pooled over n*k (DP8/Pitfall 3). Thresholds fixed before any pilot
  run (DP9): decider (AMENDMENT-ONLY) = 0 false-accepts AND control CP1s(falseVetoes,30)<=TAU_OR AND
  <=1 self-split AND frozen-pair agreement>=62/66; pre-filter = agreement>=62 AND 0 false-accepts (not
  all decider sub-bars); diagnostic-annotator = self-consistency>=0.95 AND agreement>=60/66; else none.
  Verified: CP1s(0,36)=0.0798 clears the decider trap bar, CP1s(1,36)=0.1251 fails it (a 1-false-accept
  arm would need N>=46), CP1s(1,30)=0.1486 clears the control bar where CP1s(1,24)=0.1829 would not.
- `runCheaperPilot(...)` -> `{ perModel, frozenPairSelfConsistency, stabilityCertificate, gating:false,
  sampleSizes }`: samples n=66 = 36 traps / 30 controls FROM the gold candidates weighted to hard
  near-boundary; the FROZEN-PAIR all-agree consensus on the sampled packets is the reference label;
  k=5 by order reshuffle (recorded seed); measured models gpt-5-mini + gemini-3.5-flash + gpt-5.4-mini
  (operator decision 3) + the frozen pair (gpt-5.5 + gemini-3.1-pro-preview) as the anchor + its own
  self-consistency. Per model: `{ falseAccepts, nTrap, falseVetoes, nCtrl, estimandA:{cpUpper},
  estimandB:{cpUpper}, selfConsistency, selfSplits, frozenPairAgreement, role }`. NON-GATING by
  construction (no retain/membership signal; consumes `candidates` read-only; sets no gold freeze).
- DP10 k=1 stability certificate: `stabilityCertificate = { k1: frozenPairSelfConsistency === 1.0,
  frozenPairSelfConsistency }` -- frozen-pair 100% self-consistent across the pilot k=5 -> main
  gold-screen k=1; gating-stability ONLY (the per-voter k=9 arm is UNCHANGED).
- ADDITIVE re-pre-registration (zero-votes window, prose==code): 5 NEW lock-rule sections (the OOF
  bulk-batching note DP1-DP4; the contamination gate DP4; the non-gating pilot DP7-DP9; the k=1
  certificate DP10; cheaper-as-decider amendment-only and NOT adopted) appended after the RE-PLAN-7
  sections (RE-PLAN-7 sections UNCHANGED). 5 NEW manifest `stage1_pre_registration` keys
  (`oof_bulk_batching`, `contamination_gate`, `cheaper_model_pilot`, `k1_stability_certificate`,
  `cheaper_as_decider_not_adopted`) appended after `screen_not_certificate_framing` (the only diff to an
  existing manifest line is the trailing comma required to append; the value is byte-identical).
- `eval/lz-eval-aggregate.test.mjs`: ADDED the RE-PLAN-8 anti-drift assertion (the lock-rule + manifest
  record the 5 ADDITIVE keys; the DP1 batch sizes 8/6 match `BATCH_DEFAULTS`; the DP9 numbers
  60/66/62/66/36/30 match `PILOT_THRESHOLDS` byte-for-byte; the RE-PLAN-7 keys + EVAL_THRESHOLDS existing
  numbers + URL_DATE_RULE + the OOF decider identity gpt-5.5 + gemini-3.1-pro-preview byte-identical).
  `BATCH_DEFAULTS` exported from the adapter for the prose==code pin.
- `eval/lz-eval-cheaper-pilot.test.mjs`: 14 DISCRIMINATING tests (the DP9 role boundaries incl. the
  per-arm-CP-NOT-n*k discriminator; runCheaperPilot structure; the DP10 certificate true at 100% vs
  false otherwise; the non-gating + read-only-candidates + no-freeze assertions; a false-accepting cheap
  model is measured and is NEVER decider). FILE-form green (14 pass).

## Deviations from Plan

None for Tasks 4-5 -- the plan was executed exactly as written. Two test-only adjustments (not behavior
deviations): (1) the unit-stub prompt parser locates the opaque-id line by content rather than assuming
it is the first line (the rendered item block has a leading newline); (2) two lock-rule anti-drift
regexes were made whitespace-tolerant to survive prose line-wrapping (`UNFROZEN operational\s+latitude`;
`per-voter k=9[\s\S]{0,80}UNCHANGED`). Neither alters a threshold, the prose, or any code behavior.

## No frozen primitive changed; no spend

- `eval/lz-eval-aggregate.mjs` (the frozen jstat engine) and `eval/lz-eval-trap-assembler.mjs`
  (runProbeConsensus) are BYTE-UNCHANGED (`git diff --stat` shows no change). The new adapter imports
  neither's numbers/identity; it composes the score.mjs slice + the injected callModel transport. The
  pilot consumes ONLY `clopperPearsonUpperOneSided` + `TAU_FU/TAU_OR` and edits nothing.
- Only ADDITIVE keys/sections were added to the lock-rule + manifest; every RE-PLAN-7 key is
  byte-identical and the EXISTING EVAL_THRESHOLDS numbers + URL_DATE_RULE + the OOF gold-decider
  identity are byte-identical (asserted by the RE-PLAN-8 anti-drift test).
- ZERO model calls: no `copilot`, no `claude -p`, no WebSearch/WebFetch, no voter-dispatch Workflow run,
  no OOF probe spend. All Tasks 4-5 machinery is exercised ONLY with deterministic STUB callModels.
- Tasks 6-7 (the blocking SPEND checkpoints) were NOT started. STATE.md / ROADMAP.md were NOT modified
  (the orchestrator owns plan-completion tracking; the plan has remaining human-gated spend tasks).
  `.claude/settings.json` was NOT staged or modified (its pre-existing unrelated modification is left
  untouched and unstaged).

## Test results (RE-PLAN-8, FILE-form gates)

- `node --test eval/lz-eval-oof-batch.test.mjs` -> 11 pass / 0 fail.
- `node --test eval/lz-eval-cheaper-pilot.test.mjs` -> 14 pass / 0 fail.
- `node --test eval/lz-eval-aggregate.test.mjs` -> 40 pass / 0 fail (39 carried RE-PLAN-7/5 + 1
  RE-PLAN-8 anti-drift; all carried assertions green).
- Full deterministic eval-tree suite (14 FILE-form test files: aggregate, dataset, packaging-boundary,
  search-loop, traps, offline-read, trap-assembler, wice-traps, voter-dispatch.workflow.harness,
  oof-batch, cheaper-pilot, worker-contract, lz-review-gate.workflow.harness, lz-review-gate-check) ->
  334 pass / 0 fail (was 308 in RE-PLAN-7; +26 = 11 oof-batch + 14 pilot + 1 RE-PLAN-8 anti-drift).
- Plugin-tree aggregator `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`
  -> 41 pass / 0 fail.

## RE-PLAN-8 Self-Check: PASSED
- FOUND: eval/lz-eval-oof-batch.mjs
- FOUND: eval/lz-eval-oof-batch-parse.mjs
- FOUND: eval/lz-eval-oof-batch.test.mjs
- FOUND: eval/lz-eval-cheaper-pilot.mjs
- FOUND: eval/lz-eval-cheaper-pilot.test.mjs
- FOUND commit 5e048a3 (Task 4)
- FOUND commit 9652c5e (Task 5)
- 334 eval-tree + 41 plugin-aggregator tests green; frozen engine + assembler byte-unchanged; only ADDITIVE lock-rule/manifest keys; ASCII-only; no spend.

---

# RE-PLAN-12 Tasks 6-8 (NET-NEW, NO-SPEND) + Task 9 (SPEND -> SCREEN-PASS) -- the offline confound-robust MCC SCREEN

The sections ABOVE document the CARRIED RE-PLAN-7 Tasks 1-3 (c84e6d0 / dca8d43 / 8c97f01) and RE-PLAN-8
Tasks 4-5 (5e048a3 / 9652c5e), PRESERVED byte-identical. This section documents RE-PLAN-12 (the
board-converged STAGED path to certified WORKS; THE AUTHORITY is 19-04-REPLAN-DECISION-12.md +
19-04-CERTIFY-WORKS-RESEARCH.md): the OFFLINE verdict mechanism is RE-SCOPED to a confound-robust MCC
SCREEN over MANUAL CONTRASTIVE MINIMAL-PAIRS + a dual-baseline artifact guard + a PRE-REGISTERED bar. The
synthetic positive-control-arm attempt (RE-PLAN-9/10/11) is RETIRED; the over-refusal CP gate MOVES to
the Phase-20 LIVE arm. The carried Tasks 1-5 machinery is NOT re-touched.

## Status -- COMPLETE (Tasks 1-8 built + green; Task 9 SCREEN-PASS, human-confirmed 2026-06-19)

- **Tasks 1-5 (CARRIED RE-PLAN-7/8): verified green, NOT re-touched** (byte-identical; their FILE-form
  tests pass).
- **Tasks 6-8 (NET-NEW RE-PLAN-12, NO-SPEND): built + committed atomically.**
  - Task 6 -- `81db062`: `eval/lz-eval-mcc.mjs` -- `matthewsCorrelation` (a degenerate single-class matrix
    -> 0, NOT NaN, F4), `mccFromPairs`, `bcaBootstrapLowerCI` (one-sided 95% BCa; RESAMPLING allowed, the
    quantile + normal-inverse math route through jstat, NEVER hand-rolled, D-07), `labelPermutationTestMccPositive`,
    + the PRE-REGISTERED bar constants `MCC_BAR_POINT=0.5` / `MCC_CI_ALPHA=0.05` / `MCC_CI_LOWER_FLOOR=0`.
    13 FILE-form tests.
  - Task 7 -- `41c2aaa`: `eval/lz-eval-baseline-guard.mjs` -- `dualBaselineGuard` (a lexical TF baseline +
    a claim-only no-evidence baseline; `guardPasses` iff BOTH at chance -- each separation-MCC one-sided
    BCa lower CI <= `AT_CHANCE_MCC` (0, NOT 0.5)). Realized with a leave-one-PAIR-out log-odds classifier
    (a leave-one-OUT/centroid scheme suffers partner-pull on near-identical contrastive pairs). 6 tests.
  - Task 8 -- `24a84ea`: `eval/lz-eval-contrastive-screen.mjs` -- `decideContrastiveScreen` ('gate' iff
    guardPasses AND mcc>=0.5 AND mccLowerCI>0 AND permutationP<0.05; else 'demote'; NO auto-lock) +
    `runContrastiveScreen` (guard FIRST; OOF-judges the 24 items via the carried `makeBatchedOofProbe` ->
    `runProbeConsensus`, the SAME strict screen on both arms; provisional ALWAYS true; N<24 ->
    diagnostic-only). Plus the ADDITIVE re-pre-registration: lock-rule RE-PLAN-12 section + the RE-PLAN-9
    SUPERSEDED banner; manifest 5 NEW keys (contrastive_construction / mcc_screen / dual_baseline_guard /
    screen_decision_rule / over_refusal_moved_to_live) + the RE-PLAN-9 synthetic keys annotated
    `superseded_by_replan12` (preserved); aggregate.test.mjs RE-PLAN-12 anti-drift. The MCC bar was
    PRE-REGISTERED + TIMESTAMPED `2026-06-19T16:07:00Z` BEFORE any pair was authored or scored (the
    anti-drift test machine-asserts the timestamp parses as ISO-8601 UTC, rejects the placeholder, and is
    in the past). 9 contrastive-screen tests + 42 aggregate anti-drift tests.
- **Task 9 (SPEND -- T-spend, AMENDED for RE-PLAN-12): SCREEN-PASS, human-confirmed.**

## Task 9 -- the contrastive minimal-pairs + the dual-baseline guard + the MCC SCREEN (the spend)

### Construction (manual; NO spend) -- 12 contrastive minimal-pairs on the SAME dense trap bundles

Authored 12 contrastive minimal-pairs (a 24-item corpus) on 12 of the 18 retained WiCE dense trap
evidence bundles from the healthy false-uphold arm (the T-spend-1 `run-stage1` gold; AVeriTeC arm VOIDed,
WiCE retained 18 traps). For each: the REFUTED side is the original trap (claimText + enrichedKs
verbatim, gold refuted); the SUPPORTED side keeps the claim BYTE-IDENTICAL and applies exactly ONE
minimal label-flipping edit ON THE EVIDENCE (gold unrefuted). Verified properties: 12/12 claims
byte-identical across the pair (the F3 claim-side artifact structurally excluded); 12/12 minimal
one-sentence edits (11 in-place swaps with identical doc counts, 1 single-sentence injection); each edit
in the claim's own domain vocabulary (no recurring stock supporting token across pairs); difficulty-matched
BY CONSTRUCTION (same dense multi-doc bundle, 26-261 docs; only the label-determining fact differs).
Topics span film, finance/history, video games, sports, music, biography, linguistics. The corpus +
per-pair rationale live in gitignored `eval/.cache/contrastive/` (recipe-not-text; no committed NC/CC
text; `git status` shows none). A small human review confirmed each SUPPORTED item genuinely entails its
edited bundle and each REFUTED item genuinely does not.

### Dual-baseline artifact guard (NO spend, deterministic) -- PASS

`dualBaselineGuard({ pairs })` over the 24 items: lexical separation-MCC 0, one-sided BCa lower CI
-0.348 (<= 0 -> at chance); claim-only separation-MCC 0, lower CI 0 (<= 0 -> at chance, zero signal by
construction since claims are byte-identical); `lexicalAtChance` true, `claimOnlyAtChance` true,
**guardPasses true**. The construction is mechanically artifact-free (no lexical or F3 claim-side
artifact separates SUPPORTED from REFUTED above chance).

### MCC SCREEN (the spend: 6 Copilot calls, frozen OOF pair) -- MCC 1.0

Ran `runContrastiveScreen` over the 24 items via the carried `makeBatchedOofProbe` with the FROZEN OOF
pair `gpt-5.5` + `gemini-3.1-pro-preview --effort high` (the gold-blind all-agree screen, the SAME strict
screen as the trap arm -- NO asymmetric criterion). A no-spend STUB dry-run validated the wiring first
(24/24 packets resolved, no drops). The real run = 6 Copilot calls (3 batches x 2 models, batchSize 8),
NO retries/splits/failures; genuine gold-blind per-item OOF reasoning de-mapped by opaque id. The
contamination gate was SKIPPED by decision (it is NOT a leg of `decideContrastiveScreen` nor a board /
pre-registration gating step -- DECISION-12 lists it under Carried/frozen; the lock-rule pins it as "run
ONCE at T-spend-1" where it cleared 12/12; the new entails=true direction's only residual risk is
one-directional -- it can depress MCC, never inflate it, under the DP1-DP3 anti-leakage design -- so it
was kept as an on-demand diagnostic for a suspicious demote, which did not arise).

Result (gitignored `eval/.cache/contrastive/screen-result.json`):
- Confusion matrix: **tp=12, tn=12, fp=0, fn=0** (every SUPPORTED item judged `unrefuted`, every REFUTED
  item judged `refuted`).
- **MCC = 1.0**; **one-sided 95% BCa lower-CI = 1.0** (> 0); **label-permutation p ~= 0.0002** (< 0.05).
- All four PRE-REGISTERED legs pass: guardPasses AND mcc>=0.5 AND mccLowerCI>0 AND permutationP<0.05.
- `decideContrastiveScreen` -> **`gate`**; label **`SCREEN-PASS`**; `provisional` **true** (ALWAYS --
  offline NEVER WORKS, the SDT positive-trials constraint).

### Human-confirmed decision: SCREEN-PASS (gate to the Phase-20 live stage)

The pre-registered recommendation was SCREEN-PASS; the gate-vs-demote was HUMAN-CONFIRMED (no auto-lock),
approved 2026-06-19. Interpretation: the offline gold instrument is VALID (it discriminates -- a
degenerate always-refute judge would score MCC 0, F4 -- and the discrimination is artifact-free per the
guard), and the difficulty-confound that stalled RE-PLAN-9/10/11 is empirically retired by the
contrastive-on-the-SAME-bundles construction. A SCREEN-PASS GATES progression to the Phase-20 LIVE stage
(the PRIMARY over-refusal + full-WORKS certifier over adjudicated production-distribution positives); it
does NOT certify WORKS and does NOT flip Haiku ON. Sonnet-default ships regardless.

## What is NOT in this offline read (named Phase-20 obligations)

- The SUBJECT-voter false-uphold read (Estimand A, the three-voter k=9 dispatch over the healthy traps)
  was NOT run this session (a separate spend); offline `certifyModel` top-level verdict is `VOID-on-power`
  because nCtrl=0 (the over-refusal arm MOVED to the live stage) -- EXPECTED, not the healthy-arm result.
- The over-refusal CP gate (CP-upper <= TAU_OR 0.15, N_ctrl >= 24) + the full-WORKS certification + the
  Haiku-vs-Sonnet worker-tier flip are all Phase-20 (live) work.

## Verification (all green; FILE-form node:test gates)

- Tasks 6-8 gates: `node --test eval/lz-eval-mcc.test.mjs` (13) / `eval/lz-eval-baseline-guard.test.mjs`
  (6) / `eval/lz-eval-contrastive-screen.test.mjs` (9) / `eval/lz-eval-aggregate.test.mjs` (42) -- green.
- The FULL eval-tree suite (20 FILE-form test files) -> **389 pass / 0 fail**; the plugin-tree aggregator
  `lz-deep-research-aggregate.test.mjs` -> 41 pass. Carried Tasks 1-5 tests green, NOT re-touched.

## No frozen primitive changed

`git diff --stat 8ce9790..HEAD` on the engine files (lz-eval-aggregate.mjs, lz-eval-trap-assembler.mjs,
lz-eval-offline-read.mjs, lz-eval-oof-batch.mjs, lz-eval-cheaper-pilot.mjs, lz-eval-wice-traps.mjs,
lz-eval-voter-dispatch.workflow.mjs) = ZERO changes. EVAL_THRESHOLDS (TAU_FU 0.10 / TAU_OR 0.15 /
N_TRAP_FLOOR 36 / N_CTRL_FLOOR 24) + clopperPearsonUpperOneSided + URL_DATE_RULE + the OOF gold-decider
identity byte-identical. Task 8 is ADDITIVE only (5 new manifest keys + the RE-PLAN-9 SUPERSEDED
annotation; no existing key altered). All created/edited files ASCII-only, no BOM. The new modules live in
the repo-level eval/ dev tree (never the distributed plugin tree).

## Spend accounting

NO-SPEND build (Tasks 6-8) + the manual pair authoring + the deterministic dual-baseline guard = ZERO AI
Credits. The MCC SCREEN = 6 Copilot calls (the only RE-PLAN-12 spend; the contamination gate was skipped
as an on-demand diagnostic). All run artifacts (the authored pairs, the rationale, the screen prompts +
responses, the screen result) live under gitignored `eval/.cache/contrastive/`.

## RE-PLAN-12 Self-Check: PASSED
- FOUND: eval/lz-eval-mcc.mjs + eval/lz-eval-mcc.test.mjs
- FOUND: eval/lz-eval-baseline-guard.mjs + eval/lz-eval-baseline-guard.test.mjs
- FOUND: eval/lz-eval-contrastive-screen.mjs + eval/lz-eval-contrastive-screen.test.mjs
- FOUND commit 81db062 (Task 6), 41c2aaa (Task 7), 24a84ea (Task 8)
- 389 eval-tree + 41 plugin-aggregator tests green; frozen primitives byte-identical; ASCII-only.
- Task 9: dual-baseline guard PASS; MCC SCREEN MCC 1.0 / lowerCI 1.0 / permutationP ~0.0002 -> SCREEN-PASS (human-confirmed); 6 Copilot calls; offline NEVER WORKS (provisional always true).
