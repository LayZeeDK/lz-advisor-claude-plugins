---
phase: 19-search-extract-worker-agents
plan: 04
subsystem: testing
tags: [eval, re-plan-7, absolute-per-model, certify-model, decision-matrix, one-sided-cp, tau-fu, tau-or, n-trap-floor, n-ctrl-floor, saturation-as-pass, screen-not-certificate, out-of-family-only-retain, opus-as-voter, subject-difficulty-floor, covariate-overlap, cluster-independence, evidence-absent-stratum-floor, wice-closed-book-trap-arm, wice-heavy, per-model-fair-prompts, prompt-fairness-gate, prompt-sha-freeze, three-voter-dispatch, opus-reference-voter, re-pre-registration, anti-drift, no-spend, zero-votes-window, haiku-vs-sonnet, gating-read, node-test, pre-registration]

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
  duration: ~70min
  completed: 2026-06-18
  tasks_completed: 3
  tasks_pending: 2
  files_created: 3
  files_modified: 11
  eval_tree_tests_green: 308
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
