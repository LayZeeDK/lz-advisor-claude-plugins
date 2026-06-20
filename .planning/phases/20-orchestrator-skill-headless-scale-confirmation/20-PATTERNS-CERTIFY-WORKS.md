# Phase 20: Certified-WORKS RE-PLAN - Pattern Map

**Mapped:** 2026-06-20
**Scope:** ONLY the certified-WORKS RE-PLAN of the live verify-voter certification (the re-authored Plan 20-05 + sibling build plans). The already-executed orchestrator-skill Plans 20-01..20-04 are NOT re-mapped (their patterns live in the untouched `20-PATTERNS.md`).
**Authority:** `CERTIFY-WORKS-BOARD-DECISION.md` (the converged methodology) + `20-CONTEXT.md` D-21 (the board re-plan directive) + D-02..D-07 / D-19 / D-20 (the cert decisions).
**Net-new build items analyzed:** 5
**Analogs found (eval/ dev tree):** 5 / 5 (every net-new item has a close in-tree analog; the certified-WORKS RE-PLAN is overwhelmingly REUSE + a thin additive surface, not new machinery)

> The `eval/` tree is a gitignored repo-level dev harness that NEVER ships (the only dep is `jstat@1.9.6`, pinned). All `eval/` files below were read directly with `Read` -- `git grep` cannot see them. The SKILL/reference files (item 5) DO ship and ARE tracked.

---

## File Classification

| Net-new build surface | Role | Data Flow | Closest existing analog | Match Quality | Net-new vs reuse |
|-----------------------|------|-----------|-------------------------|---------------|------------------|
| Contrastive minimal-pair AUTHORING + adjudication harness (arm A; N>=30 false-uphold traps as minimal edits of REAL live dense bundles) | service (construction) + adjudicator | transform + batch | `eval/lz-eval-contrastive-screen.mjs` (`runContrastiveScreen`); `eval/lz-eval-control-construction.mjs` (`constructControls`); `eval/lz-eval-trap-assembler.mjs` (`runProbeConsensus`, `enrichKsForClaim`); `eval/lz-eval-harvest.mjs` (the REAL dense-bundle source) | exact (contrastive-screen is the offline twin of this exact harness) | ~85% reuse; net-new = the live-bundle minimal-edit authoring loop + N>=30 + the live OOF wiring |
| Zero-dep lexical-overlap AUC check (construct-validity gate (a)) | utility (metric) | transform | `eval/lz-eval-baseline-guard.mjs` (`dualBaselineGuard`, `lexicalBaselineSeparation`, `AT_CHANCE_MCC`) | role-match (separation-MCC analog; AUC is the additive read) | ~70% reuse; net-new = emit an AUC + compare to the 0.60-0.65 ceiling (per-pair), alongside the existing at-chance separation read |
| One-sided difficulty-proxy guard (gate (b): easier-direction SMD > 0.5) | utility (metric/guard) | transform | `eval/lz-eval-survival-probe.mjs` (`computeCovariateMatch`, `decideControlArm`); the F5 floors consumed by `certifyModel` (`difficultyFloorMet`/`covariateOverlapMet`); `eval/lz-eval-mcc.mjs` (the resampling/CI primitives) | role-match (covariate-divergence is the closest existing distribution-overlap check; SMD is the additive directional read) | ~60% reuse; net-new = the difficulty proxy (corroboration dist + claim length + paraphrase spread) + the one-sided SMD comparison |
| 10-pair pre-scale probe driver (gold-panel unanimity >=9/10 + lexical AUC; scored voter RUN-but-NOT-gated) | service (probe orchestrator) | batch + request-response | `eval/lz-eval-survival-probe.mjs` (`runSurvivalProbe`, `decideControlArm`); `eval/lz-eval-live-cert.mjs` (`stage0FeasibilityProbe`) | exact (survival-probe is the build-OR-descope probe pattern; this is its contrastive analog) | ~75% reuse; net-new = the >=9/10 unanimity gate + the run-but-not-gate scored-voter telemetry |
| Cross-session resumability (the SKILL feature; disk-state recovery on HTTP 429) | hook/skill prose + schema (additive) | event-driven (crash/resume) + file-I/O | `eval/lz-eval-live-cert.mjs` (`persistDualRunVote` skip-already-done) + `eval/lz-eval-offline-read.mjs` (`persistVote`); the blackboard run-dir layout in `SKILL.md` + `references/lz-deep-research-schema.md` + `references/lz-deep-research-orchestration.md` | role-match (the VOTING harness is already resumable; the SKILL is the gap) | ~50% reuse (the persist pattern + blackboard); net-new = `decompose.json` / `run_state.json` sentinels + per-phase skip guards + slug-match resume-detect |

---

## Frozen primitives consumed BYTE-IDENTICAL (REUSE; do NOT modify)

These are the seams every net-new item composes. They are NOT edited; the planner's tasks must reference them, never re-author or re-derive them.

### `certifyModel` -- the WORKS-iff-both-gates verdict (DO NOT MODIFY)

**Source:** `eval/lz-eval-offline-read.mjs:402-523`

The over-refusal CP gate MOVED to the live arm but the verdict logic is unchanged. WORKS iff `estimandA.pass` (false-uphold CP1s <= TAU_FU) AND `estimandB.pass` (over-refusal CP1s <= TAU_OR) with the floors met; the two arms are passed SEPARATELY (`falseUpholds, nTrap` is ESTIMAND A; `overRefusals, nCtrl` is ESTIMAND B) and NEVER pooled. The pre-registered verdict order (never tuned):

```javascript
// (1) VOID-on-power: nTrap < N_TRAP_FLOOR OR nCtrl < N_CTRL_FLOOR
// (1b) F7: evidenceAbsentStratumMet === false -> VOID-on-power scoped
// (2) F5: difficultyFloorMet === false -> VOID-difficulty; covariateOverlapMet === false -> VOID-covariate
// (3) VOID-artifact: alwaysRefuteArtifact && !estimandB.pass; OR uphold on min-not-met/truncated/quota-killed
// (4) WORKS iff estimandA.pass && estimandB.pass
// (5) else DOES-NOT-WORK
```

The CP estimator `clopperPearsonUpperOneSided` is applied INSIDE `certifyModel` (lines 466-471) -- NEVER called directly by new code. The F5/F7 floor flags (`difficultyFloorMet`, `covariateOverlapMet`, `evidenceAbsentStratumMet`) are REQUIRED booleans -- the read fails closed without them (lines 433-437). The `traceAudit.upheldRecords.length` MUST equal `falseUpholds` (lines 449-455). **The new arm-A difficulty guard and arm-B harvest feed these flags; they never bypass `certifyModel`.**

### `decisionMatrix` -- raiseToUser ALWAYS true (DO NOT MODIFY)

**Source:** `eval/lz-eval-offline-read.mjs:543-604`

```javascript
return Object.freeze({
  cell,               // Haiku x Sonnet cross-product ONLY; a subject VOID surfaces 'VOID(...)'
  opusReference,      // { verdict, opusFailsBar }
  nearOpusDiagnostic, // conditional on Opus clearing the bar
  raiseToUser: true,  // ALWAYS -- a both-WORKS cell does NOT auto-flip Haiku ON (D-06)
  framing: 'clears-the-closed-book-SCREEN',
});
```

### `clopperPearsonUpperOneSided` + `EVAL_THRESHOLDS`

**Source:** `eval/lz-eval-aggregate.mjs` (imported, never re-derived). The frozen values referenced byte-identical: `TAU_OR 0.15`, `TAU_FU 0.10`, `N_CTRL_FLOOR 24`. The live N TARGETS (N_ctrl 40 / floor 30; N_trap ~34-40 / floor 30) sit ABOVE the frozen floor and are run-config (`HARVEST_TARGETS` / `LIVE_N_TARGETS`), NOT threshold changes (D-03). NEVER relax a TAU to fit a realized N.

### The frozen live-cert seams (`eval/lz-eval-live-cert.mjs` -- REUSE byte-identical, the file may gain wiring at spend time only)

- `freezeArms({ overRefusalControls, denseTrapMonitor })` (lines 141-182) -- the N-FREEZE GUARD: both arms at-or-above floor + DISJOINT (no shared uid) + a `Object.freeze` snapshot `{ nCtrl, nTrap, ctrlUids, trapUids, frozenAt: 'stage-1' }`. The two arms are NEVER pooled here.
- `persistDualRunVote(voteDir, vote, opts)` (lines 703-705) -- thin compose over frozen `persistVote`; SKIP-ALREADY-DONE resumable.
- `scoreFromPersistedVotes({ frozen, ctrlArm, trapArm, ctrlVoteDir, trapVoteDir, model, ... })` (lines 344-391) -- the NO-SPEND node scorer; reads votes off disk, builds the two un-pooled per-arm inputs, calls `certifyModel`. Fails closed if `ctrlArm.length !== frozen.nCtrl` / `trapArm.length !== frozen.nTrap` (no optional stopping).
- `makeOofAdjudicator({ seed, ... })` (lines 497-535) -- ONE `makeBatchedOofProbe` per FROZEN OOF model (gpt-5.5 + gemini-3.1-pro-preview) + a `prepare(packets)` pre-pass; HARD-GUARDED transitively (each probe's callModel calls `requireSpend('callOof')`).
- `classifyAdjudicationResidue({ oofProbes, cheapVerdict })` (lines 552-580) -- the D-04 residue router: `oof` (all-agree, PRIMARY) | `human` with `oof-split` / `response-set-indeterminate` (Guerdan exclusion) / `cheap-vs-unanimous-oof`.
- `requireSpend(stageLabel)` (lines 121-130) -- THROWS unless `process.env.LZ_SPEND === '1'`. Every model-spend path calls this FIRST.
- `makeCopilotCallModel({ model, runner })` (lines 428-481) -- the Copilot CLI transport; PIPES the prompt via stdin (NO `-p`), OMITS `--allow-all-tools`, passes `--model <slug> --effort high`. `requireSpend('callOof')` first.

### The OOF all-agree gold pair (REUSE)

**Source:** `eval/lz-eval-oof-batch.mjs` (`makeBatchedOofProbe`) + `eval/lz-eval-trap-assembler.mjs:343-373` (`runProbeConsensus`). Identity: `gpt-5.5` + `gemini-3.1-pro-preview`, `--effort high`, gold-blind. Defined as `FROZEN_OOF_PAIR` in `lz-eval-live-cert.mjs:100` and as `FROZEN_PAIR` in the contrastive-screen + survival-probe consumers. **The arm-A authoring harness and the 10-pair probe consume this exact pair as the gold adjudicator -- NO new gold identity.**

---

## Pattern Assignments

### Item 1: Contrastive minimal-pair AUTHORING + adjudication harness (arm A: false-uphold)

**Role:** service (construction) + adjudicator. **Data flow:** transform (real bundle -> minimal edit -> pair) + batch (OOF adjudication).

**Primary analog:** `eval/lz-eval-contrastive-screen.mjs` (`runContrastiveScreen`) -- this is the OFFLINE twin of the exact harness the board now wants live. It already (1) runs the dual-baseline guard FIRST, (2) flattens `{ supported, refuted }` pairs into a 24-item OOF-judged sequence via the SAME strict `runProbeConsensus` contract on both arms, (3) maps `expectedEntailment` per gold direction WITHOUT rendering it into the prompt.

**Pair shape + flatten pattern to COPY** (`lz-eval-contrastive-screen.mjs:106-138`):

```javascript
// A pair is { supported, refuted }; each side { id?, claim, evidence (string|array) }.
function itemPacket(item, i) {
  const id = item && item.id !== undefined ? String(item.id) : 'ci-' + i;
  const claim = item && typeof item.claim === 'string' ? item.claim : '';
  const survivors = asSurvivors(item ? item.evidence : undefined);
  // The gold direction the consensus compares to (NEVER rendered into the prompt).
  const expectedEntailment = item && item.gold === 'unrefuted' ? 'true' : 'false';
  return { trap: { uid: id, claim, enrichedKs: survivors }, enrichedKs: survivors,
           stratum: 'contrastive', decisiveRank: -1, expectedEntailment };
}
// flattenPairItems: pair.supported -> gold 'unrefuted'; pair.refuted -> gold 'refuted'
```

**The minimal-edit construction guards to COPY** (`lz-eval-control-construction.mjs:58-74`): the pre-registered literal constants enforcing "minimal edit of a real bundle, not synthetic-from-scratch":

```javascript
export const SUBSTRING_REJECT_MAX_CHARS = 40;   // reject a member sharing a >=40-char exact run (lexically dominated)
export const MIN_COMPLEXITY_TOKENS = 12;        // reject a trivially-short member (pass-by-style)
export const COVARIATE_STRATA = Object.freeze(['domain','date-cutoff','excerpt-count','claim-length','specificity','retrieval-sparsity']);
export const HARD_POSITIVE_FRACTION = 1 / 3;
```

**The OOF all-agree adjudication contract to REUSE** (`lz-eval-trap-assembler.mjs:343-373`, `runProbeConsensus`): a packet is RETAINED only if EVERY probe agrees `accepted:true` AND `entails === expectedEntailment`. For the live arm, gold-blind adjudication is via `makeOofAdjudicator` (reused from `lz-eval-live-cert.mjs`) -> `runProbeConsensus`; residue routes through `classifyAdjudicationResidue` (the OOF all-agree pair via the SAME pre-pass `prepare(packets)` shape).

**The REAL dense-bundle source (arm A edits FROM here)** (`lz-eval-harvest.mjs:267-351`, `harvest`): the over-refusal arm B stays live-harvested from this; arm A's minimal edits start from the SAME class of dense bundle. A dense bundle is `isDenseClaim` (corroboration >= `DENSE_SOURCE_FLOOR` 2 OR Contested, lines 100-108). The harvested `denseTrapMonitor` array's members carry the run-dir-qualified `uid` (`<run-basename>::<clusterId>`) + the evidence; the authoring harness flips ONLY the truth-value, preserving density/length/style.

**REUSE-vs-ADDITIVE boundary:**
- REUSE byte-identical: `runProbeConsensus`, `makeOofAdjudicator`, `classifyAdjudicationResidue`, `makeBatchedOofProbe`, the `itemPacket` / `flattenPairItems` shape, the `SUBSTRING_REJECT_MAX_CHARS` / `MIN_COMPLEXITY_TOKENS` / `HARD_POSITIVE_FRACTION` construction guards, the FROZEN OOF pair.
- ADDITIVE net-new: (a) the live-bundle minimal-edit authoring loop (read a real `denseTrapMonitor` member, produce a SUPPORTED/REFUTED pair whose REFUTED side flips only the truth-value); (b) EXPAND the 12-trap seed to N>=30 (CP-upper(0/12) ~ 0.22-0.27 > TAU_FU 0.10 is underpowered; 0/30 clears 0.10); (c) the live OOF gold-blind adjudication (vs the offline screen's stubbed consensus).

---

### Item 2: Zero-dep lexical-overlap AUC check (construct-validity gate (a))

**Role:** utility (metric). **Data flow:** transform (pairs -> separability scalar).

**Primary analog:** `eval/lz-eval-baseline-guard.mjs` (`dualBaselineGuard`). It already answers the EXACT adjacent question -- "can a zero-dep lexical model separate the SUPPORTED from the REFUTED members of a pair?" -- via a deterministic leave-one-PAIR-out log-odds classifier and a separation-MCC at-chance read. The board's gate (a) is "AUC <= ceiling 0.60-0.65 per contrastive pair"; this module supplies the separation machinery the AUC read sits on top of.

**How the existing dual-baseline guard computes overlap/separation** (`lz-eval-baseline-guard.mjs:154-294`):

```javascript
// separationVerdicts: leave-one-PAIR-out token log-odds (Laplace SMOOTH=0.5) over a feature (claim+evidence, or claim-only).
//   score = sum over tokens of log((supCount+SMOOTH)/(refCount+SMOOTH)); score>0 -> 'unrefuted' else 'refuted'.
//   Leave-one-PAIR-out (not leave-one-OUT) removes PARTNER-PULL: the near-identical opposite-class partner is excluded
//   so an artifact-free corpus scores ~chance (separation-MCC ~ 0) and a real lexical artifact scores well above 0.
// runBaseline -> { separationMcc, lowerCI }  (lowerCI via bcaBootstrapLowerCI from lz-eval-mcc.mjs)
// dualBaselineGuard({ pairs }) -> { lexicalSeparation, claimOnlySeparation, lexicalAtChance, claimOnlyAtChance, guardPasses }
export const AT_CHANCE_MCC = 0; // chance for separation-MCC is 0, NOT 0.5 (load-bearing scale pin)
```

The guard is MECHANICAL (no discretionary knob): `lowerCI <= AT_CHANCE_MCC (0)` is at chance. **This is the structural template -- a deterministic, zero-dep, leave-one-pair-out separability metric -- but the metric it emits is separation-MCC, not AUC.**

**REUSE-vs-ADDITIVE boundary:**
- REUSE byte-identical: the `flattenPairs` -> `{ gold, claimTokens, evidenceTokens }` normalization, the `tokenize` / `termFreq` / `tokenSet` primitives, the leave-one-PAIR-out partner-pull mitigation, the `cellsOf` confusion mapping, the zero-dep + `pairId` discipline.
- ADDITIVE net-new: emit a lexical-overlap AUC (a ranking-separability scalar over the per-pair lexical-overlap score) and compare it to the pre-registered ceiling (0.60-0.65) per contrastive pair. The cleanest additive surface is a sibling export (e.g. `lexicalOverlapAuc({ pairs })`) that reuses the SAME `lexicalFeature` token bag and the SAME leave-one-pair-out discipline, computing AUC from the per-item overlap score ranking instead of a thresholded verdict. The pre-registered ceiling is a NEW module-level literal (frozen BEFORE any pair is authored, mirroring the `MCC_BAR_POINT` pre-register discipline below). MUST stay zero-dep (the eval tree's only dep is jstat; the lexical baseline stays zero-dep per the board + `lz-eval-baseline-guard.mjs:14`).

> NOTE on AUC tie-handling + zero-dep: the existing module hand-rolls all index/counting math and routes only quantile/normal-inverse math through jstat (`lz-eval-mcc.mjs`). An AUC (Mann-Whitney-U / rank-based) is a pure counting/ranking computation -- author it hand-rolled like `cellsOf`, NOT via a stats lib. Keep the +1/2 tie credit explicit and deterministic.

---

### Item 3: One-sided difficulty-proxy guard (gate (b): easier-direction SMD > 0.5)

**Role:** utility (metric/guard). **Data flow:** transform (two cells -> directional SMD -> pass/fail).

**Primary analog:** `eval/lz-eval-survival-probe.mjs` (`computeCovariateMatch`) -- the closest existing trap-vs-control distribution-comparison check; it bins both cells and compares per-bin relative-frequency divergence within a tolerance. The board's gate (b) is a ONE-SIDED directional read (FAIL only if the constructed cell is detectably EASIER), which is a different statistic but plugs into the SAME "two cells -> distribution comparison -> a boolean the verdict consumes" slot.

**The distribution-comparison pattern to COPY** (`lz-eval-survival-probe.mjs:106-164`, `computeCovariateMatch`):

```javascript
// For each shared axis, compare the retained controls' per-bin distribution to the trap distribution;
// MATCHED when, across every shared axis, the max per-bin relative-frequency divergence is within tolerance.
// Returns { matched, perAxis: { axis -> maxBinDivergence } }. Deterministic; no model call.
```

**Where the one-sided SMD plugs in:** `certifyModel` reads `difficultyFloorMet` + `covariateOverlapMet` as REQUIRED booleans (`lz-eval-offline-read.mjs:433-437`, VOID-difficulty / VOID-covariate at lines 497-503). The arm-A guard MUST feed these flags. The difficulty proxy per the board = corroboration distribution + claim length + paraphrase spread:
- corroboration distribution: `rec.corroboration_lower_bound` (already on the harvested member; `isDenseClaim` reads it, `stratifyOversampleDense` sorts by it -- `lz-eval-harvest.mjs:100-108, 230-239`).
- claim length: `tokenCount(candidate.claim)` (the existing token-count helper, `lz-eval-control-construction.mjs:119-124`).
- paraphrase spread: an additive read over the pair members' lexical variation (reuse `tokenize` from the baseline guard).

**The resampling/CI primitives to REUSE for the SMD CI** (`lz-eval-mcc.mjs:190-362`): `mulberry32` / `hash32` (the seeded deterministic PRNG -- resampling is allowed, D-07), `bcaBootstrapLowerCI` (the jstat-backed BCa interval). The one-sided alpha mirrors `MCC_CI_ALPHA = 0.05`. SMD itself (mean-difference / pooled-SD) is a pure hand-rolled computation; only the CI quantile math routes through jstat.

**REUSE-vs-ADDITIVE boundary:**
- REUSE byte-identical: the `computeCovariateMatch` two-cell-distribution-comparison shape, the deterministic `mulberry32`/`hash32` PRNG, `bcaBootstrapLowerCI`, the `tokenCount` / `tokenize` helpers, the boolean-flag interface into `certifyModel`.
- ADDITIVE net-new: the difficulty proxy (corroboration + claim length + paraphrase spread) + the ONE-SIDED SMD comparison (FAIL iff the constructed cell is detectably EASIER beyond the easier-direction margin SMD > 0.5; PASS if harder or statistically indistinguishable). The pre-registered easier-direction margin (0.5) + the one-sided alpha are NEW frozen literals. Report descriptively per the board (the guard FAILS the certificate only in the easier direction; a symmetric TOST is explicitly REJECTED as underpowered at N~30).

---

### Item 4: 10-pair pre-scale probe driver

**Role:** service (probe orchestrator). **Data flow:** batch (10 pairs through the OOF panel) + request-response (the scored voter telemetry).

**Primary analog:** `eval/lz-eval-survival-probe.mjs` (`runSurvivalProbe` + `decideControlArm`) -- the existing PRE-REGISTERED build-OR-descope probe: it builds one batched OOF probe per frozen-pair model, runs the documented `prepare(packets)` pre-pass, screens candidates through `runProbeConsensus`, computes a distribution statistic, and returns a `decision` from a fixed rule. This IS the probe-driver pattern; the contrastive 10-pair probe is its direct sibling.

**The probe-driver structure to COPY** (`lz-eval-survival-probe.mjs:183-274`):

```javascript
// (1) Build one batched OOF probe per frozen-pair model (makeBatchedOofProbe), SAME strict all-agree screen.
// (2) PRE-PASS: await probe.prepare(packets) over the FULL candidate set BEFORE the consensus loop
//     (an unprepared packet fail-closes to DROP -- the documented adapter shape).
// (3) SCREEN each candidate through runProbeConsensus (entails=true for a control / =false for a trap).
// (4) Compute the distribution statistic + call the PRE-REGISTERED decision rule.
// runSurvivalProbe is NON-GATING for the trap arm: it decides ONLY the control arm's build-vs-descope.
```

**The pre-registered fixed decision rule to MIRROR** (`lz-eval-survival-probe.mjs:79-94`, `decideControlArm`): a boolean conjunction over `retainedCount >= floor`, `covariateMatched`, `licenseDateUsable`, `!selectionEasy` -> `'build' | 'descope'`. **The 10-pair probe's analogous rule:** gate on gold-panel-unanimity >= 9/10 AND lexical-AUC <= ceiling -> scale | reconstruct.

**The stage-0 feasibility probe shape** (`lz-eval-live-cert.mjs:597-611`, `stage0FeasibilityProbe`): a NO-SPEND probe returning `{ feasible, harvest, raiseToUser, shipsSonnetDefault, reason }`. The 10-pair probe mirrors this `Object.freeze({...})` receipt-shape result.

**REUSE-vs-ADDITIVE boundary:**
- REUSE byte-identical: the `makeBatchedOofProbe` + `prepare(packets)` pre-pass + `runProbeConsensus` screen loop, the `FROZEN_PAIR` gold identity, the `decideControlArm`-style fixed-conjunction decision rule, the `Object.freeze` receipt result, the `requireSpend` hard-guard for any voter spend, the `persistDualRunVote` skip-already-done for the scored voter's persisted votes.
- ADDITIVE net-new: (a) the 10-pair gold-panel unanimity gate (>= 9/10 items the OOF all-agree pair unanimously admits); (b) the lexical-AUC gate (item 2) folded into the probe decision; (c) the RUN-but-NOT-GATE scored-voter telemetry -- the scored voter runs (cast votes via `persistDualRunVote`, scored via `scoreFromPersistedVotes`) for pipeline/telemetry validation + a VOLUNTARY early-stop signal (>= 1 false-uphold on the probe -> investigate the pipeline / re-pre-register, NEVER edit items), but is EXCLUDED from the certification pass/fail. This is the crucial new wiring: telemetry-only, never a gate, never tunes the corpus.

---

### Item 5: Cross-session resumability (the SKILL feature)

**Role:** hook/skill prose + schema (additive). **Data flow:** event-driven (crash at HTTP 429 / resume) + file-I/O (disk-state recovery).

**Authority:** `20-RESUMABILITY-SCOPING.md` (Opus-design + Sonnet-impl classification). This FOLDS IN a SHIPPED user-facing feature (promotes v2 SCALE-03). The eval VOTING harness is already resumable; the GAP is the SKILL.

**Primary analogs:**

1. The already-resumable persist pattern (`eval/lz-eval-live-cert.mjs:703-705` `persistDualRunVote` -> `eval/lz-eval-offline-read.mjs:829-886` `persistVote`):

```javascript
// SKIP-ALREADY-DONE (D-08): a re-run does NOT re-cast or overwrite an existing vote unless told to.
if (!overwrite && fs.existsSync(p)) {
  return Object.freeze({ persisted: false, skipped: true, path: p });
}
```

This is the per-item done-signal pattern: a re-run skips an already-persisted artifact. The SKILL's per-phase resume guards are the same idea at phase granularity.

2. The blackboard run-dir layout (the done-signals) (`references/lz-deep-research-schema.md:80-95` + `SKILL.md:86-89`):

```
<run-dir>/candidates/<worker-id>.json   (Phase 2 done-signal)
<run-dir>/claims|excerpts|sources/...    (Phase 3 done-signals)
<run-dir>/survivors.json                 (Phase 4 stage-1 done-signal -- BUT the degenerate-aggregate trap)
<run-dir>/votes/<clusterN>-<seat>.json   (Phase 5 per-seat done-signals)
<run-dir>/scope.md                       (Phase 0 done-signal)
<run-dir>/report.md                      (Phase 6 done-signal -- the terminal sentinel)
```

The immutable per-phase blackboard makes resume = a per-phase completion check + a conditional skip. Cluster IDs are reproducible (`mergeClusters` deterministic) and are already the vote-file keys, so existing votes stay valid even if aggregate stage-1 is re-run -- no keying re-derivation needed (`20-RESUMABILITY-SCOPING.md:47-52`).

**The per-phase done-signals + the degenerate-aggregate trap mitigation** (`20-RESUMABILITY-SCOPING.md:39-46`, the highest-risk correctness item):
- A crashed run can leave a `survivors.json` that is a PREMATURE stage-1 product (e.g. Montreal: 20/20 Unsupported, written before the stage-2 tally). A naive resume that sees `survivors.json` + jumps to report would emit a silently-wrong all-Unsupported report.
- MITIGATION: when `report.md` is absent, ALWAYS re-run aggregate stage 2 (the aggregator is idempotent + cheap) after filling missing votes; back it with an explicit `run_state.json { stage2_complete: true }` sentinel (additive; written by the SKILL, not the aggregator). NEVER infer completion from `survivors.json` confidence values alone.

**REUSE-vs-ADDITIVE boundary:**
- REUSE: the immutable blackboard architecture, the `persistVote` skip-already-done idiom (at phase granularity), the cluster-id-keyed votes (no re-keying), the aggregator's idempotence (ZERO aggregator changes recommended -- `20-RESUMABILITY-SCOPING.md:54-57`), the `${CLAUDE_PLUGIN_ROOT}` reference convention, the `Assuming <X> (unverified)` headless-fallback frame (no AskUserQuestion under `-p`).
- ADDITIVE net-new (Sonnet-impl): one new artifact `decompose.json` `{ angles:[{id,text,priority}], gate1_note, selected_urls }` (written right after Gate 1, BEFORE any search worker -- lets resume skip decompose + the Opus Gate-1 spend); the `run_state.json` sentinel; per-phase skip guards in `SKILL.md` (+50-80 lines); the additive schema records in `references/lz-deep-research-schema.md` (+20-30); the resume UX + slug-match heuristic in `references/lz-deep-research-orchestration.md` (+20-30); a NEW eval/integration fixture (a partial-verify run-dir + expected resume behavior, anti-drift lockstep test).
- ADDITIVE net-new (Opus-design, per `20-RESUMABILITY-SCOPING.md:15-21`): the stage-1-vs-stage-2 discrimination / sentinel strategy (the degenerate-aggregate trap); the headless slug-match resume-detect heuristic spec; partial-write detection prose that does not violate the aggregator `ContractError` discipline; the exact anti-drift lockstep update set.

**The resume UX (recommended, slug-match auto-detect)** (`20-RESUMABILITY-SCOPING.md:32-37`): a `<resume>` skill-body section BEFORE scope -- normalize the question to a slug, scan `.lz-research/` for a partial run dir (no `report.md`) whose slug/scope matches, pick the most recent, surface "Resuming <run-id>", jump to the first incomplete phase. Works under `-p` (no interactive prompt). Fallback: explicit `--resume <run-id>`.

---

## Shared Patterns (apply across multiple net-new items)

### LZ_SPEND hard-guard (every model-spend path)

**Source:** `eval/lz-eval-live-cert.mjs:121-130` (`requireSpend`). **Apply to:** items 1 (live OOF authoring adjudication), 4 (the probe's scored voter + OOF), and any new spend path.

```javascript
export function requireSpend(stageLabel) {
  if (process.env.LZ_SPEND !== '1') {
    throw new ContractError('refusing to spend at ' + String(stageLabel) + ': set LZ_SPEND=1 ...', 'lz-eval-live-cert');
  }
  return true;
}
```

Every model-spend path calls this FIRST; the dry-run + the entire test suite run STUBS only (no spend). Stub tests MUST exercise the no-spend path. The transport split (D-20): `callVoter` / `callAuditor` are session-Agent-driven (NOT node-wireable -- the Agent tool is unavailable to a bare `node` process); only `callOof` (Copilot CLI) is node-wireable.

### The two arms are NEVER pooled

**Source:** `eval/lz-eval-harvest.mjs:334-350` (separate frozen arrays, no combined-N field) + `eval/lz-eval-live-cert.mjs:141-182` (`freezeArms` DISJOINT guard) + `scoreFromPersistedVotes` (separate per-arm scoring). **Apply to:** items 1, 4. The over-refusal control arm (ESTIMAND B) and the dense-trap/false-uphold arm (ESTIMAND A) are frozen as SEPARATE counts, scored separately, passed separately to `certifyModel`. A function or return shape that pools them is a DEFECT.

### Pre-register-then-author-then-score discipline

**Source:** `eval/lz-eval-mcc.mjs:53-65` (`MCC_BAR_POINT` / `MCC_CI_ALPHA` / `MCC_CI_LOWER_FLOOR` as module literals frozen BEFORE any pair) + `eval/lz-eval-live-lock-rule.md` (the prose lock rule committed BEFORE any scored vote). **Apply to:** items 2 (the AUC ceiling 0.60-0.65), 3 (the SMD margin 0.5 + one-sided alpha), 4 (the >=9/10 unanimity gate). The bar is literature-unspecified, so the pre-register -> author -> score ORDERING is the ONLY defense against result-shopping. New constants are module-level literals, recorded in the live lock rule + a manifest WITH A TIMESTAMP, NOT computed from the corpus. N frozen before scoring; no optional stopping.

### Cross-tree dependency boundary (eval -> runtime, one-directional)

**Source:** every `eval/*.mjs` header (e.g. `lz-eval-control-construction.mjs:32-34`, `lz-eval-harvest.mjs:28-33`). **Apply to:** every new eval/ file. The eval tree imports the SHIPPED runtime aggregator's hardening primitives (`ContractError`, `safeId`, `listJson`) ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). NEVER add an eval/ import to any plugin-tree file. Zero npm deps (jstat is the only allowed dep, under eval/ only).

---

## Conventions to honor (so the planner's tasks comply)

| Convention | Source | Rule |
|------------|--------|------|
| node:test FILE form ONLY | `eval/lz-eval-baseline-guard.test.mjs:7-13` | `node --test eval/<name>.test.mjs` -- NEVER the directory form (host quirk: `node --test <dir>` spuriously exits 1 even when all tests pass). Every verify step gates on the explicit `.test.mjs` file. |
| ASCII-only, no BOM | every `eval/*.mjs` header line "no literal byte-order mark and is strictly ASCII (per CLAUDE.md)" | No emojis, no Unicode, no em/en dashes, no curly quotes. CRLF/BOM/path-safe (JSON reads go through `lz-eval-readjson.mjs` which strips a BOM). |
| Zero runtime deps; lexical baseline stays zero-dep | `lz-eval-baseline-guard.mjs:14`; board decision section 6 | The eval tree's only dep is `jstat@1.9.6` (pinned). The lexical-overlap AUC (item 2) MUST be hand-rolled (rank/counting math), NOT a stats lib. Only normal-inverse/quantile math routes through jstat (item 3's CI). |
| Every model-spend path behind LZ_SPEND=1 + stub tests on the no-spend path | `requireSpend` + all `stage*` entrypoints | The build is NO-SPEND; the seam is exercisable with stubs. The actual spend is the human-authorized BLOCKING checkpoint (Stage 1 `[HUMAN BLOCK]`, `autonomous: false`). |
| The two arms NEVER pooled | `freezeArms` / `harvest` / `scoreFromPersistedVotes` | Separate frozen counts, separate scoring, separate `certifyModel` inputs; no combined-N field. |
| Thin guarded CLI | every `eval/*.mjs` tail (`if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]))`) | New eval files expose a `--<mode>` CLI guarded so `import` does NOT run it; under `/* node:coverage disable */`. |
| Pure functions exported for the test fixture | every `eval/*.mjs` header | Construction/metric functions are pure + exported; the spend wiring stays behind the guard. `Object.freeze` the return shapes. |
| Anti-drift lockstep for the schema/SKILL additions (item 5) | `20-RESUMABILITY-SCOPING.md:62-64`; D-12 lockstep | `decompose.json` / `run_state.json` records added to the schema + SKILL + orchestration reference in ONE lockstep change + a dev-time identity test; the aggregator is NOT changed (ZERO aggregator changes). |

---

## No Analog Found

None. Every net-new build surface in the certified-WORKS RE-PLAN has a close in-tree analog -- the offline Phase-19 contrastive machinery (`lz-eval-contrastive-screen.mjs`, `lz-eval-baseline-guard.mjs`, `lz-eval-mcc.mjs`, `lz-eval-control-construction.mjs`, `lz-eval-survival-probe.mjs`) is the offline twin of the live arm A, and the live-cert seams (`lz-eval-live-cert.mjs`) supply the freeze / score / OOF / spend-guard / resumable-persist primitives byte-identical. The work is overwhelmingly REUSE + a thin additive surface (the live-bundle minimal-edit authoring loop, the AUC read, the one-sided SMD, the 10-pair probe gate, the SKILL resume sentinels), NOT new machinery.

---

## Metadata

**Analog search scope:** `eval/` (the gitignored dev harness; read directly), `plugins/lz-advisor/skills/lz-deep-research/`, `plugins/lz-advisor/references/`, and the phase-20 planning artifacts.
**Files read:** `eval/lz-eval-control-construction.mjs`, `eval/lz-eval-baseline-guard.mjs`, `eval/lz-eval-survival-probe.mjs`, `eval/lz-eval-contrastive-screen.mjs`, `eval/lz-eval-mcc.mjs`, `eval/lz-eval-harvest.mjs`, `eval/lz-eval-live-cert.mjs`, `eval/lz-eval-offline-read.mjs` (certifyModel/decisionMatrix/persistVote ranges), `eval/lz-eval-trap-assembler.mjs` (enrichKsForClaim/runProbeConsensus/assembleStage1Traps ranges), `eval/lz-eval-live-lock-rule.md`, `eval/lz-eval-live-cert-driver.md`, `plugins/lz-advisor/skills/lz-deep-research/SKILL.md`, `plugins/lz-advisor/references/lz-deep-research-orchestration.md`, `plugins/lz-advisor/references/lz-deep-research-schema.md` (run-dir layout + escalate record), the board decision + `20-CONTEXT.md` + `20-05-PLAN.md` + `20-05-LIVE-CERT-RESULT.md` + `20-RESUMABILITY-SCOPING.md`.
**Pattern extraction date:** 2026-06-20
