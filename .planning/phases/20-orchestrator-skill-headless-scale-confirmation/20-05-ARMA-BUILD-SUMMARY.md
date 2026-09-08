---
phase: 20-orchestrator-skill-headless-scale-confirmation
plan: 05-ARMA-BUILD
subsystem: testing
tags: [eval, certified-works, arm-a, native-refuted-gold, oof-all-agree, gold-blind, construct-validity, lexical-auc, smd, cluster-independence, no-spend, node-test, d-22]

# Dependency graph
requires:
  - phase: 20-orchestrator-skill-headless-scale-confirmation
    provides: "the live-cert harness (lz-eval-live-cert.mjs requireSpend / makeOofAdjudicator / makeCopilotCallModel / FROZEN_OOF_PAIR), the harvest run-dir reader + SUPPORTED predicate (lz-eval-harvest.mjs readRunDirClaims/listRunDirs/isSupportedClaim), the OOF batch adapter (lz-eval-oof-batch.mjs makeBatchedOofProbe), the all-agree consensus (lz-eval-trap-assembler.mjs runProbeConsensus), the gate-(a) lexical-overlap AUC (lz-eval-baseline-guard.mjs lexicalOverlapAuc / LEXICAL_AUC_CEILING), the gate-(b) one-sided not-easier guard (lz-eval-difficulty-proxy.mjs oneSidedNotEasierGuard / EASIER_DIRECTION_SMD_MARGIN)"
provides:
  - "The AMENDED ARM-A assembly path (lz-eval-armA-native.mjs): harvestRefutedGoldCandidates (the skill's OWN Contested/Unsupported/Low claims, the INVERSE of isSupportedClaim, cluster-keyed by source-doc WITHIN a run) + adjudicateNativeRefutedGold (OOF all-agree RETAIN gold-blind, expectedEntailment 'false'; split/entailed -> excludedIndeterminate/residue) + assembleArmA (covariate/difficulty/cluster matching guards + gates (a)/(b) on the post-OOF retained set; constructValid fold; realized smd)"
  - "The re-authored live-cert driver Stage 0 (lz-eval-live-cert-driver.md): harvest native refuted-gold -> OOF all-agree RETAIN -> statistical matching + gates (a)/(b) on the retained set, superseding the minimal-edit authoring prose"
affects: [20-05, lz-deep-research-live-cert, certified-works]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Harvest-then-OOF-retain-then-gate: ARM A is the skill's OWN naturally-occurring refuted-gold, RETAINED gold-blind by the frozen OOF all-agree pair (gold = the OOF read of non-entailment, NEVER the skill self-tag); the construct-validity gates re-run on the POST-OOF retained set"
    - "OOF all-agree RETAIN over the SAME strict gold-blind contract as the offline screen (runProbeConsensus expectedEntailment 'false'); a split / entailed / ambiguous read leaves the binary denominator + routes to the maintainer (Guerdan response-set exclusion, D-04)"
    - "Cluster key = source-doc/seed WITHIN a run (run-basename '::' source-doc), NOT the run-question -- 4 runs yield MANY independent clusters, never collapsing to ~4 (lock a)"
    - "Two arms NEVER pooled: assembleArmA owns ONLY arm A, reports nTrap only (no combined-N field), consumes the ARM-B controls READ-ONLY for the matching guards (lock e)"
    - "Frozen seams imported byte-identical (makeBatchedOofProbe / runProbeConsensus / requireSpend / FROZEN_OOF_PAIR / lexicalOverlapAuc / oneSidedNotEasierGuard / readRunDirClaims / isSupportedClaim), never re-authored"
    - "callModel injected (single fn for both OOF models, or an array of one per FROZEN model to drive a split); the real path is useFrozenTransport behind requireSpend('callOof') -- the no-spend build uses deterministic stubs only"

key-files:
  created:
    - eval/lz-eval-armA-native.mjs
    - eval/lz-eval-armA-native.test.mjs
  modified:
    - eval/lz-eval-live-cert-driver.md

key-decisions:
  - "ARM A is the INVERSE of isSupportedClaim: the refuted-gold candidate buckets are Contested/Unsupported/Low (the complement of the SUPPORTED High/Medium band); the bucket is a SOURCE BUCKET, NEVER the gold"
  - "Gate (d) minimal-edit / source_uid is DROPPED (no edits under option C); constructValid = covariate AND difficulty AND cluster AND lexicalGatePass AND notEasier -- no minimalEdit term"
  - "The realized difficulty SMD (refuted-gold cell vs SUPPORTED controls) is reported for post-hoc auditability alongside the gate verdict (CERTIFY-WORKS-RATIFICATION.md)"
  - "difficultyFloorMet is an INJECTED flag (default true) in the no-spend seam -- the held-out Claude reference catch-rate is a model read computed at the human-gated Plan 20-05 spend; the fold + the gates stay exercisable deterministically"
  - "adjudicateNativeRefutedGold accepts callModel as a single fn (same gold-blind judge for both OOF models) OR an array (one per FROZEN model) so a test can drive an inter-judge SPLIT without a real dispatch"

patterns-established:
  - "Construct-validity fold under option C: drop gate (d) minimal-edit; re-run gates (a)/(b) + the covariate/difficulty/cluster matching guards on the EXACT post-OOF retained set, never assumed"
  - "N_trap frozen the instant the OOF consensus finishes, before vote 1 (lock d); a post-OOF retained N_trap below MIN_TRAP_PAIRS is a documented VOID-on-power -> SCOPED external arm + RAISE (lock f), never a floor relaxation"

requirements-completed: []

# Metrics
metrics:
  duration: ~13 min
  completed: 2026-06-20
  tasks: 3
  files-created: 2
  files-modified: 1
  tests: 16
  commits: 4
---

# Phase 20 Plan 05 ARM-A Build: Amended ARM-A Native-Refuted-Gold Assembly Path Summary

NO-SPEND build of the amended ARM-A assembly path (D-22 / CERTIFY-WORKS-RATIFICATION.md): harvest the skill's
OWN naturally-occurring refuted-gold (Contested/Unsupported/Low) claims, RETAIN them as refuted-gold ONLY via
the FROZEN out-of-family all-agree gold-blind pair ("evidence does NOT entail the claim"; gold = the OOF read,
NEVER the skill self-tag), difficulty-match STATISTICALLY to the ARM-B SUPPORTED controls (covariate-overlap +
subject-difficulty + cluster-independence), and re-run construct-validity gates (a) lexical-overlap AUC + (b)
one-sided not-easier on the POST-OOF retained set (gate (d) minimal-edit DROPPED under option C). All
stub-exercised, ZERO model spend; the real harvest + OOF adjudication + voting are the later human-authorized
spend gate.

## What was built

**`eval/lz-eval-armA-native.mjs`** (new, ASCII-only, zero new deps, thin guarded CLI) exporting:

- `harvestRefutedGoldCandidates({ corpusDir | runDirs })` -- reads run dirs via the FROZEN `readRunDirClaims`
  / `listRunDirs`, returns the refuted-gold CANDIDATES = the Contested + Unsupported + Low claims (the
  INVERSE of `isSupportedClaim`). Each candidate carries `{ uid (run-dir-qualified ':'-free '::'), claim,
  evidence, corroboration_lower_bound, source_run_dir, source_cluster, confidence }`. The cluster key is the
  source-doc WITHIN a run (`<run-basename>::<source-doc>`, lock a) so the SAME source doc in two runs is two
  distinct clusters.
- `adjudicateNativeRefutedGold({ candidates, callModel | useFrozenTransport })` -- builds ONE
  `makeBatchedOofProbe` per `FROZEN_OOF_PAIR` model, runs the documented `prepare()` PRE-PASS over the FULL
  candidate set, then `runProbeConsensus` per candidate with `expectedEntailment: 'false'`. RETAINS as
  refuted-gold ONLY if BOTH OOF models all-agree the evidence does NOT entail the claim (gold-blind; lock b).
  A non-unanimous / split / entailed read -> `excludedIndeterminate` + `residue` (Guerdan response-set
  exclusion, D-04). The real path (`useFrozenTransport`) is hard-guarded behind `requireSpend('callOof')`.
- `assembleArmA({ retainedTraps, armBControls })` -- the covariate-overlap + cluster-independence matching
  guards (mirroring the trap-assembler's F5/F6 formulas) between the retained refuted cell and the ARM-B
  SUPPORTED control cell (READ-ONLY), gate (a) `lexicalOverlapAuc` + gate (b) `oneSidedNotEasierGuard` ON THE
  RETAINED SET, and the fold `constructValid = covariateOverlapMet AND difficultyFloorMet AND
  clusterIndependenceMet AND lexicalGatePass AND notEasier` (NO minimalEdit term). Reports the realized `smd`.
  Reports `nTrap` only -- NO combined/pooled N field (lock e).

**`eval/lz-eval-armA-native.test.mjs`** (new, FILE-form, stub-exercised, ZERO spend) -- 16 DISCRIMINATING
tests covering all five required behaviors: (1) refuted-gold candidate selection + cluster key + ':'-free
uids; (2) OOF all-agree RETAIN, split routing, gold = the OOF read not the self-tag, zero spend; (3) the
matching guards + gates (a)/(b) on the retained set + the construct-validity fold (no minimalEdit) + the smd;
(4) `requireSpend('callOof')` throws on the real-dispatch path with LZ_SPEND unset; (5) the two arms are
never pooled. Plus source-level invariants: frozen seams imported (not re-authored), no LZ_SPEND-set / no
network code, ASCII + no BOM.

**`eval/lz-eval-live-cert-driver.md`** (modified) -- Stage 0 re-authored to the amended ARM A: 0b harvests
native refuted-gold candidates -> OOF all-agree RETAIN (freezing N_trap at OOF-consensus-finish, lock d); 0c
runs the matching guards + gates (a)/(b) on the post-OOF retained set via `assembleArmA`; 0d demotes the
scored voter to run-but-NOT-gate telemetry. Preserved the D-20 transport split, the `requireSpend` gating,
the freeze-before-scoring discipline, and the ARM-B harvest. The 20-06 `authorContrastivePair` / `ARM_A_SEED`
is noted UNUSED for the live cert (not deleted; still a frozen no-spend seam). Cross-refs
`CERTIFY-WORKS-RATIFICATION.md` + D-22.

## Verification

- `node --test eval/lz-eval-armA-native.test.mjs` -> exit 0, 16 pass / 0 fail (FILE form; stubs; ZERO spend;
  no LZ_SPEND set; no real OOF/voter dispatch).
- Imported-module suites still green (exit 0 each): baseline-guard (10), difficulty-proxy (8), live-cert
  (27), harvest (13), trap-assembler (34), oof-batch (11).
- Frozen seams confirmed IMPORTED not re-authored (`makeBatchedOofProbe`, `runProbeConsensus`,
  `requireSpend`, `FROZEN_OOF_PAIR`, `lexicalOverlapAuc`, `oneSidedNotEasierGuard`, `readRunDirClaims`,
  `isSupportedClaim`) -- a source-level test asserts the imports + the absence of local re-definitions.
- The driver doc Stage 0 is re-authored to the native-refuted-gold ARM A and is ASCII-only (25982 bytes, 0
  non-ASCII).

## Deviations from Plan

None of the Rules 1-4 fired. The build followed the ratified spec exactly. Two minor in-build corrections,
both internal to this build and resolved before the GREEN commit:

**1. callModel single-vs-array shape (build-internal).** The spec said "ONE makeBatchedOofProbe per
FROZEN_OOF_PAIR model". To exercise an inter-judge SPLIT deterministically (test (2)), the injected
`callModel` accepts EITHER a single function (the same gold-blind judge for both OOF models) OR an array of
one per FROZEN model. This is a superset of the spec (it still builds one probe per model) and is required to
test the split-routing behavior without a real dispatch. Resolved before the feat commit.

**2. test assertion double-count (test-internal).** The "gold = the OOF read" test initially asserted
`residue.length + excludedIndeterminate.length === 1`, but `residue` surfaces the SAME excluded items for
human routing (not a separate count), so the sum was 2 for one excluded item. Corrected to assert each list
== 1 and the excluded uid. A test-side fix, not a module change.

## Known Stubs

`difficultyFloorMet` is an INJECTED flag (default `true`) in `assembleArmA`. This is INTENTIONAL and
documented: the F5 subject-specific difficulty floor (the held-out Claude reference must NOT ace the retained
traps) requires a model read (a held-out Claude verifier catch-rate), which is the human-authorized Plan
20-05 spend, not a no-spend computation. The fold + the deterministic gates (a)/(b) + the covariate/cluster
guards stay fully exercisable; the flag is wired into the construct-validity fold so the spend-time driver
supplies the realized value. No data-rendering stub exists; this is a deferred-to-spend input, not a
placeholder masking missing functionality.

## Out of scope (the later human-authorized spend gate)

This build triggers NO live spend: no lz-deep-research run, no real OOF/Copilot call, no verify-voter Agent.
LZ_SPEND is never set. The real harvest + OOF adjudication + voting + the held-out-Claude difficulty floor
are the separate human-authorized Plan 20-05 spend, driven by the re-authored `lz-eval-live-cert-driver.md`.

## Commits

- `142ac31` test(20-05): failing test for the amended ARM-A native-refuted-gold assembly path (TDD RED)
- `284028b` feat(20-05): amended ARM-A native-refuted-gold assembly path (NO-SPEND, stub-exercised) (GREEN)
- `b878e52` docs(20-05): re-author live-cert driver Stage 0 to the amended ARM A (native refuted-gold)

## Self-Check: PASSED

- FOUND: eval/lz-eval-armA-native.mjs
- FOUND: eval/lz-eval-armA-native.test.mjs
- FOUND: .planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-05-ARMA-BUILD-SUMMARY.md
- FOUND commit: 142ac31 (test, RED)
- FOUND commit: 284028b (feat, GREEN)
- FOUND commit: b878e52 (docs, driver Stage 0 re-author)
