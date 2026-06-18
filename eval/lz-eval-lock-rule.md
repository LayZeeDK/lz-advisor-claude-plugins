# lz-advisor Haiku-vs-Sonnet verify-voter gating eval -- pre-registered lock rule (EVAL-04)

This is the single source of truth for the PASS / FAIL-RAISE / VOID thresholds of the Haiku-vs-Sonnet
verify-voter gating eval. It is PRE-REGISTERED: it is written and committed BEFORE any model call,
so the eval verdict cannot be rationalized post-hoc (D-01 / D-06 / D-07 / EVAL-04). The eval run
consumes this rule; the verdict it produces is fixed by these numbers, decided here, in advance.

## Re-registration timing (CRITICAL -- EVAL-04 / V-integrity)

This rule was RE-REGISTERED in Plan 19-03 in the LEGITIMATE ZERO-VOTES WINDOW -- BEFORE any Plan-04
vote is cast. The re-registration ADDS, all in the same zero-votes pre-registration: (1) the pooled-n
Clopper-Pearson formula ceiling; (2) the D-06 saturation pre-condition + the VOID outcome; (3) the
trap-construction rules; (4) the concrete PINNED mechanical search-minimums (OQ-2). Locking these
BEFORE any vote is what makes the pre-registration genuine -- the gate cannot be result-shopped after
seeing a vote. The anti-drift test in `eval/lz-eval-aggregate.test.mjs` asserts the prose
gate-threshold numbers match `EVAL_THRESHOLDS` byte-for-byte AND that `clopperPearsonUpper(1, N)` at
the locked N matches the recorded ceiling.

The rule is MECHANICALLY ENFORCED by `eval/lz-eval-aggregate.mjs` -- the deterministic, off-model
eval aggregator. Every threshold below MUST match that script's frozen `EVAL_THRESHOLDS`
(`Object.freeze({...})`) byte-for-byte (anti-drift). The code is authoritative; if a number here
ever disagrees with `EVAL_THRESHOLDS`, the code wins and this document is wrong and must be
corrected to match. Do NOT change a threshold in one place without changing it in the other.

## THE PIVOT to the ABSOLUTE per-model eval (RE-PLAN-7, board-converged; re-registered in the ZERO-VOTES window)

RE-PLAN-7 PIVOTS the offline READ from a RELATIVE Haiku-MINUS-Sonnet delta (Sonnet assumed-good
baseline) to an ABSOLUTE per-model verdict. This is re-registered in the LEGITIMATE ZERO-VOTES window
(BEFORE any model vote -- anti-result-shopping, mirroring RE-PLAN-3/4/5). The relative-delta + the
RE-PLAN-5 SATURATED-VOID framing below are RETIRED for the DECISION PATH (the carried
calibratorGate/readDelta/resolveOutcome/classifyCalibration STAY for back-compat but are NOT the
RE-PLAN-7 decision path). A clean EARNED 0 is now PROOF the model WORKS, NOT a VOID.

The board: an Opus design panel produced the ABSOLUTE per-model eval, validated by a cross-family board
(GPT-5.5 + Gemini-3.1-pro out-of-family + an Opus peer, all BLIND, UNANIMOUS VALID-WITH-FIXES; the nine
findings F1-F9 all applied). Decision record: 19-04-REPLAN-DECISION-7.md.

### The ABSOLUTE per-model design (certifyModel + decisionMatrix)

Prove, for BOTH Haiku 4.5 AND Sonnet 4.6 (AND Opus 4.6 as the measured REFERENCE), WHETHER each WORKS as
the lz-deep-research verify-voter. Sonnet is a SUBJECT on trial, NOT the yardstick. Per model M, voter
role, TWO estimands pooled PER-CLAIM (denominator N_claims, NEVER N*k -- the k=9 votes share one packet,
positively correlated):

- ESTIMAND A -- the FALSE-UPHOLD rate over the retained refuted-gold traps. Statistic =
  `clopperPearsonUpperOneSided(x_FU, N_trap)` (the F2-pinned ONE-SIDED 95% upper). PASS_A iff
  `CP1s <= TAU_FU` (`0.10`). The catastrophic arm: silently shipped bad research.
- ESTIMAND B -- the OVER-REFUSAL rate over the gold=unrefuted positive controls (the F1 always-refute
  detector, reusing `scorePositiveControls`' over-refusal count). `CP1s(x_OR, N_ctrl)`. PASS_B iff
  `CP1s <= TAU_OR` (`0.15`). Symmetric any-uphold reduction on BOTH arms.

VERDICT(M) = `WORKS` iff PASS_A AND PASS_B (with the floors met); `DOES-NOT-WORK` if either CI exceeds
its TAU; `VOID-on-power` if N below its floor (N_TRAP_FLOOR=36 / N_CTRL_FLOOR=24) or the evidence-absent
stratum floor is unmet (F7); `VOID-artifact` on an always-refute / min-not-met-trace collapse;
`VOID-difficulty` / `VOID-covariate` from the F5 floors. SATURATION-as-PASS certifies WORKS only when ALL
THREE hold JOINTLY: (a) the difficulty floor is met (hard+representative -- including the F5
subject-specific Claude held-out check + the covariate-overlap check), (b) the CI upper bound is tight
(CP1s <= TAU at the realized N), (c) the positive-control arm passes (the 0 is EARNED, not always-refuse).
`certifyModel` + `decisionMatrix` (eval/lz-eval-offline-read.mjs, Task 2) encode this.

### TAU_FU / TAU_OR + the N floors at one-sided 95% CI (F1/F2; verified engine anchors)

Two NEW `EVAL_THRESHOLDS` keys + two N floors are ADDED (the EXISTING numbers are byte-unchanged):

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `TAU_FU` | 0.1 | The false-uphold SCREEN bar (decision #1; the literal frozen value is 0.10). The stricter 0.06 is NOT adopted (zero-tolerant + hostage to the feasibility risk); 0.10-as-SCREEN is honest given Sonnet-default ships + the Phase-20 live shadow is the REAL gate. |
| `TAU_OR` | 0.15 | The over-refusal bar. |
| `N_TRAP_FLOOR` | 36 | The 0-miss trap-arm floor where a CLEAN arm certifies WORKS at TAU_FU under the ONE-SIDED CP. A model with >=1 false-uphold needs N_trap >= 46. |
| `N_CTRL_FLOOR` | 24 | The F1-corrected control floor. The OLD floor 18 was mathematically broken under one-sided CP. |

VERIFIED against the actual engine, ONE-SIDED (`clopperPearsonUpperOneSided`, the 0.95 quantile):
`CP1s(0,36)=0.0798 <= 0.10` (the 0-miss N_trap floor 36); `CP1s(1,46)=0.0990 <= 0.10` (a 1-miss arm needs
N_trap >= 46); `CP1s(0,24)=0.1173 <= 0.15` (the corrected N_ctrl floor 24 holds); `CP1s(0,18)=0.1533 >
0.15` (the OLD floor 18 mathematically FAILS, F1). The CI convention is ONE-SIDED 95% upper (F2 -- a
one-directional ceiling); ALL TAU/floor brackets are recomputed against it; the anti-drift test asserts
prose == code byte-for-byte AND the one-sided-CI anchors. NEVER relax a TAU to fit a realized N.

### The decision matrix + the four Opus-voter nuances

`decisionMatrix({haiku, sonnet, opus})`: the SHIP cell is the Haiku x Sonnet cross-product ONLY (nuance i
-- Opus is NOT a ship cell): both / only-sonnet / only-haiku / neither, with a subject VOID surfaced.
`opusReference.opusFailsBar` (opus.verdict !== WORKS) is the NEW first-class MAJOR finding (nuance ii --
the quality anchor the plugin leans on is below its own gate -> the near-Opus thesis is in question ->
RAISE TO USER). The near-Opus diagnostic is CONDITIONAL on Opus clearing the bar (nuance iii -- suppressed
when Opus fails; tracking a wrong model is not reassurance). Opus-voter at k=9 is the priciest Claude-pool
tier (nuance iv -- paced). `framing` is always `clears-the-closed-book-SCREEN` (F4 -- never
'production-safe'); `raiseToUser` is always true (settle-OR-raise).

### The OUT-OF-FAMILY-only retain predicate + Opus-as-measured-voter (#3/F3)

The assembler RETAIN predicate is the OUT-OF-FAMILY all-probes-agree consensus (GPT-5.5 + Gemini) ONLY --
the in-family Opus probe is recorded as a NON-GATING annotation per packet (the gold is INDEPENDENT of the
family on trial; it cannot grade Claude on a curve drawn by Claude). F3 framing correction: dropping the
in-family conjunct LOOSENS the all-agree AND -> retains MORE -> higher N + purer gold (the 'drop = lower N'
framing was backwards). Opus is ADDED as a THIRD MEASURED VOTER on the same OUT-OF-FAMILY-screened gold (a
clean cross-family measurement -- tested, not testing).

### The subject-specific difficulty floor + the covariate-overlap check (F5)

A held-out Claude reference verifier (subjectDifficultyProbe) run over the RETAINED refuted-trap set must
NOT ACE it (above the pre-registered max catch-rate -> VOID-difficulty). The trap/control COVARIATE-OVERLAP
check (claim length / survivor count / token-complexity within a pre-registered tolerance) prevents a model
passing by STYLE not judgment (below tolerance -> VOID-covariate). Both floors are load-bearing, never
tuned; `certifyModel` requires `difficultyFloorMet AND covariateOverlapMet` for WORKS.

### Cluster independence (F6) + the evidence-absent stratum floor (F7)

F6: one PRIMARY claim per source/seed cluster is retained (or the cluster fails as a unit), so the
per-claim CP denominator is not anti-conservative; `reducePooledVerdict` applies any-uphold SYMMETRICALLY
on both arms (any-seat-false-uphold on a trap = fail; any-seat-refute on a control = the over-refusal
event). F7: the evidence-absent sub-construct has its own pre-registered per-stratum minimum
(`evidenceAbsentStratumMet`); an unmet stratum is VOID-on-power scoped to evidence-absent, NOT a silent
WORKS over a sub-construct WiCE cannot supply (or it is explicitly DEFERRED to Phase-20 by name).

### Per-model fair prompts + the frozen prompt shas (#2/F8)

Per-model FAIR PROMPTS, not a shared prompt (overrides the board's shared-prompt suggestion; re-aligns
with EVAL-05/D-08): Haiku gets its own research-grounded prompt
(`research-verify-voter-haiku.md` + `lz-haiku-prompt-engineering.md`); Sonnet
(`research-verify-voter-sonnet.md`) and Opus (`research-verify-voter-opus.md`) each get their own. The
Opus prompt is best-effort-engineered, NOT a verbatim Sonnet copy (a thin mirror would under-test Opus and
corrupt the reference anchor, W4). Each prompt is FROZEN + sha256'd in the manifest
(`per_model_prompt_shas`); the dispatch records the selected model + the frozen prompt-sha per seat, and
the anti-drift test asserts each recorded sha matches the agent file. A per-model verdict is "works UNDER
ITS OWN BEST PROMPT" (the deployment-realistic question; the principled resolution of ATTACK-7). The
PROMPT-FAIRNESS gate (W4): a DOES-NOT-WORK verdict for ANY model cannot be finalized until a
prompt-sensitivity check on a HELD-OUT TUNING SPLIT (disjoint from the scored set) clears.

### The WiCE-heavy dataset

WiCE carries the BULK of the traps (the closed-book-native WiCE arm, `assembleWiceTraps`) -- it de-risks
the AVeriTeC median-5 collapse (F7-relevant). AVeriTeC supplies the SEPARATE evidence-absent trap stratum
+ native unmutated controls. WiCE is screened by the SAME OUT-OF-FAMILY all-agree consensus + the F5
difficulty/covariate floors + F6 cluster independence; its rows are recipe-not-text + license-clean (WiCE
ODC-BY/MIT, the only commit-safe corpus).

### The SCREEN-not-certificate framing (F4/F9, load-bearing)

This is a closed-book SCREEN feeding the Phase-20 live shadow, NOT a ship certificate. The decision-matrix
cells read 'clears the closed-book SCREEN', NEVER 'WORKS=production-safe'. An offline PASS NEVER auto-flips
Haiku ON; retrieval + end-to-end + the actual flip DEFER to Phase-20 by name; Sonnet-default ships in
EVERY case. If the build team ever treats an offline 'both work' as a ship green-light the verdict flips to
REDESIGN -- the framing is load-bearing.

## What the gate measures (CARRIED relative read -- RETIRED for the RE-PLAN-7 decision path)

- (CARRIED, back-compat) The relative read's SOLE HARD GATE was the SUBTLE-/open-book, Haiku-MINUS-Sonnet
  false-uphold DELTA -- NEVER Haiku's absolute false-uphold rate (D-06). Sonnet was run on the IDENTICAL
  sampled strata as the calibration baseline; the gated quantity was the EXCESS (Haiku count minus Sonnet
  count) on the shared trial pool. RE-PLAN-7 RETIRES this relative delta for the decision path (the
  ABSOLUTE per-model verdict above supersedes it); the function stays for back-compat.
- A FALSE-UPHOLD event is deterministic: `expected_verdict === 'refuted' && verdict === 'unrefuted'`
  -- a bad / refuted-gold claim wrongly called `unrefuted`. There is NO LLM-as-judge variance in the
  hard gate (D-01); the harness mirrors the runtime aggregator's off-model verdict-vs-gold-label
  discipline.
- The interval is the Clopper-Pearson (exact-binomial) UPPER bound on that DELTA, computed by the
  pinned `jstat` library (`jStat.beta.inv`), NEVER hand-rolled and NEVER Wald / bootstrap (D-07).

## Frozen thresholds (must match `EVAL_THRESHOLDS` byte-for-byte)

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `ALPHA` | 0.05 | Two-sided significance for the Clopper-Pearson upper bound (95% CI). |
| `RELIABLE_TRIALS` | 15 | The per-claim trial count the SUBTLE subset MUST reach before a PASS may be declared. A PASS is never declared on fewer trials. |
| `MIN_K` | 5 | EVAL-02 floor: run each claim k >= 5. |
| `ESCALATION_KILL_LOW` | 0.40 | Low edge of the cost-gate kill band. |
| `ESCALATION_KILL_HIGH` | 0.50 | High edge of the cost-gate kill band; this is the kill threshold the rule enforces. |
| `DELTA_UPPER_MAX` | 0.25 | The per-claim-reliability anchor scalar. It sits between the zero-excess-at-reliable-15 Clopper-Pearson ceiling (CP(0,15) ~= 0.218, which PASSES) and the one-excess ceiling (CP(1,15) ~= 0.319, which FAILS), so a clean zero-excess Haiku clears and any non-zero excess false-uphold fails. (See "The pooled-n CP(1,N) formula ceiling" below: the pooled run-artifact ceiling is the FORMULA, not this scalar -- the scalar is retained as the per-claim anchor the mechanical `lockRuleVerdict` engine enforces.) |
| `STRATA.SUPPORTED_FRACTION` | 0.40 | EVAL-01 sampling: ~40% supported. |
| `STRATA.BAD_FRACTION` | 0.60 | EVAL-01 sampling: ~60% bad. |
| `STRATA.SUBTLE_FRACTION_OF_BAD` | 0.50 | EVAL-01 sampling: ~half the bad items are SUBTLE. |

## The pooled-n CP(1,N) formula ceiling (D-05, the re-registered run-artifact ceiling)

The recorded gate ceiling for the open-book read is the FORMULA `clopperPearsonUpper(1, N_pooled, ALPHA)`
evaluated at the REALIZED pooled n -- NOT a fixed scalar. The binomial `n` is the POOLED claim-trials
across the discriminating strata (D-05). At the target N band the formula evaluates to:

| Realized pooled N | `clopperPearsonUpper(1, N, 0.05)` (recorded LABEL) |
|-------------------|----------------------------------------------------|
| 60 | ~0.0894 |
| 80 | ~0.0677 |
| 100 | ~0.0545 |

So the pooled ceiling is ~0.05-0.09 across N=60-100 (it is ~0.05 at the upper end). The realized N and
its CP(1,N) value are RECORDED in the run artifact at eval time; this table is the pre-registered
expectation, not a substitute for the realized computation.

### Reconciliation with the `DELTA_UPPER_MAX = 0.25` scalar (State-of-the-Art note)

The engine-enforced `DELTA_UPPER_MAX = 0.25` scalar anchor and the pooled-n FORMULA are TWO DIFFERENT
QUANTITIES that coexist, NOT a contradiction (the scalar is CURRENT + enforced, not superseded):

- The `DELTA_UPPER_MAX = 0.25` scalar is the PER-CLAIM-RELIABILITY anchor: it sits between CP(0,15)
  (~0.218, PASS) and CP(1,15) (~0.319, FAIL), so the mechanical `lockRuleVerdict` engine PASSES a
  clean zero-excess Haiku at reliable=15 and FAILS any non-zero excess. This is what the frozen
  `EVAL_THRESHOLDS.DELTA_UPPER_MAX` encodes and the engine enforces.
- The pooled-n `clopperPearsonUpper(1, N_pooled, ALPHA)` FORMULA is the POOLED run-artifact ceiling
  (~0.05 at N=60-100), the recorded value of record for the open-book pooled read.

Doc and code mirror each other byte-for-byte (the code wins). If `EVAL_THRESHOLDS` must change, change
it and this prose IN LOCKSTEP.

### The pooled-n clustering caveat (Pitfall 3 -- do NOT re-derive)

Pooling claim-trials assumes the trials are exchangeable; trials WITHIN one claim are correlated
(clustered), so a naive pooled CI is anti-conservative. The locked gate SIDESTEPS this by gating on the
EXACT-ZERO pooled excess count -- ANY single Haiku-only excess false-uphold fails, independent of CI
width. The recorded `CP(1,N)` value is a LABEL, NOT a coverage guarantee; it is never re-derived as a
clustered / design-effect CI (that would re-open the frozen formula), and "~0.05" is never presented as
a coverage guarantee.

## The D-06 SATURATION pre-condition + the VOID outcome (gate-on-the-gate, load-bearing)

Before reading ANY Haiku-vs-Sonnet delta, the curated traps MUST be shown to DISCRIMINATE -- Sonnet
(the difficulty calibrator) must be demonstrably BELOW the ceiling on at least one hardened stratum.
This is a gate ON the gate, decided BEFORE the mechanical engine runs:

1. Run Sonnet on each candidate stratum at k >= 5 over the autonomous-search loop (NOT supplied
   evidence). Sonnet is the difficulty calibrator (range validation, not circular -- model
   performance VALIDATES, it does not DEFINE, the difficulty range).
2. If Sonnet scores near-ceiling (near-zero false-upholds) on a stratum, that stratum is
   NON-DISCRIMINATING -> HARDEN it (deeper burial, stronger distractors, tighter date windows) and
   re-calibrate.
3. If NO hardened stratum can put Sonnet below ceiling, the offline read is VOID / INCONCLUSIVE
   -> RAISE TO USER -> defer the tier to Phase-20 shadow; the Sonnet-default voter SHIPS in the
   interim. A both-models-ace tie is NEVER read as Haiku-safe (the saturation fallacy that voided the
   Phase-18 supplied-evidence pilots).
4. Only on a stratum where Sonnet is demonstrably below ceiling may the Haiku-MINUS-Sonnet DELTA be
   read by the mechanical engine.

**VOID is a THIRD outcome alongside PASS / FAIL-RAISE.** Division of responsibility: the engine's
`lockRuleVerdict` returns PASS / FAIL-RAISE only; VOID is the PRE-CONDITION outcome decided BEFORE the
engine runs (the saturation check is not in the deterministic engine -- it is the calibrator step's
verdict). A VOID is a LEGITIMATE completion (settle-OR-raise), not a failure; it RAISES to the user and
ships Sonnet-default.

## The trap-construction rules (locked here, in the zero-votes window)

The offline known-gold trap set is built by these rules (19-RESEARCH.md lines 319-360); they are
locked in this pre-registration so the construction cannot be tuned after a vote:

1. **ONE offline CLOSED-BOOK JUDGMENT-difficulty stratum** -- evidence-absent (a one-step-overreach
   mutation whose refutation is NOT in the KS; it retains the original unmutated SUPPORTING docs as
   plausible text -- a genuine text-based temptation to false-uphold). The difficulty lives in CLOSED-BOOK
   JUDGMENT (resist-uphold-on-absence), NEVER claim subtlety (the subtlety axis is empirically proven
   saturated -- Haiku 0/30 == Sonnet 0/30) and NEVER retrieval orchestration (which is not cleanly +
   leak-safely measurable offline -- the frozen staticKsAdapter ignores the query -- and defers to the
   Phase-20 live operational shadow; see the construct-scope boundary below). evidence-absent is the SOLE
   offline arm: the one genuinely-new failure mode vs the saturated Phase-18 subtle arm.
   **buried is DROPPED ENTIRELY from the offline gate** (re-plan 19-04-REPLAN-DECISION-4, UNANIMOUS board
   OPTION A; see "The buried-DROPPED rule" below): it is NOT validly + leak-safely constructible offline
   (D-RP4-1, the synthetic disconfirmer flag is text-unverified, a FAKE construct) and the count-vs-rank
   predicate error (D-RP4-2) mis-classified ALL 62 qualifying seeds as buried. Deep-refuter detection is
   retrieval-adjacent / context-attention, deferred to the Phase-20 live shadow.
   **date-sensitive is DEFERRED to the Phase-20 live phase** (re-plan 19-04-REPLAN-DECISION-2 item 1, now
   alongside buried as a Phase-20-deferred construct): its STRONGER arm (post-cutoff-doc leakage) is NOT
   constructible offline -- the static KS adapter applies the FROZEN dateFilter BEFORE any voter sees a
   doc, so a post-cutoff "leak" is dropped identically for both seats and neither can false-uphold from
   it. True date-sensitivity (and its qualifying seeds) migrate to Phase-20, where the model controls
   retrieval and can actually face a post-cutoff doc.
2. **No hand-authoring.** Mutate EXISTING AVeriTeC-dev Supported seeds via a one-step-overreach recipe
   (scope / causation / magnitude / certainty) so the gold flips to refuted. The mutation PROSE is
   produced by a GENERATOR OUTSIDE the Haiku/Sonnet voter families (A3, generator hygiene) -- the
   committed manifest carries only the uid + remapped label + the mutation recipe/seed, NEVER the
   CC-BY-NC text (D-07; mutated text is gitignored in eval/.cache/ only).
3. **The deliberately-weak-verifier validity gate.** Accept a trap into the set ONLY if it flips a
   deliberately-weak reference verifier (a family-neutral difficulty anchor); a trap the weak verifier
   already catches is too easy to discriminate the tiers and is rejected.
4. **OQ-1 leakage screen (GATING).** The dev seeds are screened over the revised-2.0 KS with the
   per-claim `dateFilter` ENFORCED + the `fact_checking_article` / `cached_original_claim_url` URL
   EXCLUSION before the manifest is locked. The GATING `leakageProbe` (lz-eval-traps.mjs) must return
   CLEAN on the ~10-seed screen; a leaky KS ESCALATES to the user (prefer revised TEST-set KS seeds,
   or defer) -- it NEVER silently proceeds. (Run in Plan 19-03: CLEAN on the 10 dev seeds, exit 0.)
5. **The KS-enrichment layer + the byte-locked URL_DATE_RULE** (re-plan 19-04-REPLAN-DECISION-2; net-new
   assembly layer, the frozen primitives untouched). The raw dev KS docs are `{sentence, url}` with ZERO
   date fields + ZERO decisive/disconfirmer/verdict flags, so without enrichment the frozen `dateFilter`
   drops every doc and `staticKsAdapter` returns an EMPTY set for every claim (the offline read is
   degenerate). The assembly layer (`eval/lz-eval-trap-assembler.mjs`) attaches a date to every doc + the
   decisive/disconfirmer/verdict flags ONLY at the pre-registered ranks (returning NEW objects -- the
   shared-mutation guard). Dates are extracted by the BYTE-LOCKED strict path-only URL_DATE_RULE:

   `(19|20)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])(\/|$)`

   range-checked through the FROZEN `safeParse`. An archive-wrapped URL yields the INNER publication date
   (the 14-digit wrapper timestamp has no slash separators). A no-match / out-of-range / implausibly-future
   date returns null (fail closed -- DROP only, never leak). The manifest carries this EXACT source string;
   the `eval/lz-eval-aggregate.test.mjs` anti-drift test asserts it equals `URL_DATE_RULE.source`
   byte-for-byte. The single-digit-day fix is a SET-ASSEMBLY normalizer (`normalizeClaimDate`) -- the
   FROZEN `parseAvtDate` stays frozen and still throws on a raw single-digit day like `9-10-2020`.

## SCORING RECONCILIATION (T-19-19, pre-registered + harness-test-guarded)

The SCORED quantity is the MODEL voter's free-text `vote.verdict` over the date-filtered KS text,
persisted in `{unrefuted, refuted}` and read by `countFalseUpholds`. `searchAndStop`'s flag-driven
mechanical verdict enum `{judge-result, 'refuted-default', 'insufficient'}` is the TRACE + the mechanical
minimums ONLY and NEVER overrides the recorded vote (it is not even the persisted-vote enum). The
`decisive` / `disconfirmer` / `verdict` flags the enrichment layer attaches drive ONLY `searchAndStop`'s
trace + `classifySeed`'s stratum assignment. The D-08 dispatch Workflow's `toScoredVote` takes the
verdict from the MODEL vote, NEVER from `searchAndStop`'s enum; the harness-slice test
(`eval/lz-eval-voter-dispatch.workflow.harness.test.mjs`) FAILS if the dispatch records `searchAndStop`'s
verdict instead of the model's. If this reconciliation could not hold, the offline read would be
structurally VOID (defer to Phase-20 live) -- the flags are NEVER hand-skewed to manufacture
discrimination.

## NO-ABSTENTION rule (W1, pre-registered + harness-test-guarded)

The offline-read dispatch prompt REQUIRES a definite `refuted` / `unrefuted` verdict -- the gating read
measures the BINARY false-uphold, so abstention is NOT a valid vote here. A null / abstain / unparseable
vote is NOT persisted (`persistVote` rejects a verdict not in `{unrefuted, refuted}`) and is RE-CAST on
the next pass (skip-already-done skips only a DEFINITE persisted vote; a never-persisted abstain is
re-attempted until a definite vote lands). So each seat's pool completes only with definite votes and
`readDelta` proceeds only at a complete exactly-`nPooled` pool (the F3/F4 realized-count guard).

## The k->1 reduction + the false-uphold-over-k rule (I2, pre-registered BEFORE any vote)

The dispatch persists `k` votes/claim keyed `seat-uid-k`, but `readDelta` consumes ONE pooled
record/claim keyed by the claim uid (the F3/F4 realized-count guard wants exactly `nPooled` records --
one per claim). The reduction is `reducePooledVerdict` (the dispatch Workflow's SHARED block, Task 2).

**The chosen rule is ANY-UPHOLD (stated explicitly, locked here before the calibrator vote):** a claim's
pooled verdict is a FALSE-UPHOLD (`unrefuted` on a refuted-gold trap) if ANY of its `k` votes upholds --
NOT majority. Rationale: a single silent uphold-on-absence is exactly the failure the gate hunts, and the
conservative any-uphold rule mirrors the shipped pipeline tally's downgrade-not-delete posture (so the
eval measures production). The rule is unit-tested DISCRIMINATING (a single uphold among `k` flips the
pooled verdict) and pre-registered here in the zero-votes window.

## Construct-scope boundary (CLOSED-BOOK JUDGMENT, NOT retrieval; pre-registered)

The offline gate measures CLOSED-BOOK JUDGMENT (resist-uphold-on-absence) over an orchestrator-supplied
date-window evidence packet -- NOT retrieval orchestration. A closed-book PASS tests JUDGMENT difficulty,
NOT query-formulation / search-depth / premature-stop. Retrieval is NOT cleanly + leak-safely measurable
offline: the frozen `staticKsAdapter` IGNORES the query (so the model's query-formulation is not
exercised through this seam), and a leak-safe model-driven offline retrieval would need a NET-NEW ranked
top-k index over a thin median-5 corpus (poor ROI). Retrieval DEFERS to the **Phase-20 LIVE operational
shadow** (shadow -> canary -> tier-1; ROADMAP SC-6), which is OPERATIONAL, not a clean leak-controlled
gold-known retrieval eval (on the live web the published gold verdict is reachable at vote time -- the
leak the offline gate exists to prevent). So retrieval is NEVER silently assumed-covered, and a
closed-book PASS NEVER certifies retrieval. This boundary is recorded BOTH here and in the run artifact
(19-04-REPLAN-DECISION-3 item 4 + the lone-dissent reconciliation).

## The buried-DROPPED rule (construct-invalid offline; pre-registered, RE-PLAN-4)

`buried` is DROPPED ENTIRELY from the offline gate (NOT auto-gated, NOT auto-dropped at run time -- it is
removed from the strata definition). `evidence-absent` is the SOLE offline arm (resist-uphold-on-absence
-- the one genuinely-new failure mode vs the saturated Phase-18 subtle arm).

WHY buried is dropped (UNANIMOUS cross-family board, 5/5, 19-04-REPLAN-DECISION-4):

- **D-RP4-1 (construct-invalid offline):** `buried` is NOT validly + leak-safely constructible offline. The
  synthetic `disconfirmer=true` flag on an arbitrary deep surviving doc is TEXT-UNVERIFIED -- the doc's
  text almost never refutes the SPECIFIC mutated overreach, so a blind probe would reject most
  synthetic-buried. It measures "is the voter fooled by a label with no real refuting evidence" -- a FAKE
  construct. Deep-refuter detection is a retrieval-adjacent / context-attention property already DEFERRED to
  the Phase-20 live shadow. Dropping buried does NOT materially weaken the gate (evidence-absent is the one
  genuinely-new arm; the offline gate's legitimate job is JUDGMENT).

evidence-absent is the SOLE offline arm; it FAILS CLOSED below the floor (a degenerate corpus) -- see "The
gold-blind entailment validity probe" + "The strict-cutoff / no-date-shift / >=5-survivor rules" below.

## The gold-blind entailment validity probe (the mandatory mitigation, load-bearing -- FATAL if omitted)

Before any verify-vote, screen every candidate evidence-absent packet with a PRE-REGISTERED, GOLD-BLIND
model judge (NO AVeriTeC label, NO mutation knowledge). It reads ONLY the date-filtered surviving SUPPORTING
docs + the mutated OVERREACH claim and answers:

  "Do these docs explicitly state OR directly ENTAIL the one-step OVERREACH, or only the weaker ORIGINAL
   Supported claim?"

- **DISQUALIFY** (drop; REPORT the count in `attrition.probeDropped`, never silently absorb) any packet
  where the survivors plausibly entail/license the overreach -- there `unrefuted` is a legitimate read and
  gold=refuted is indefensible (the same defect that killed buried: a fake false-uphold would invalidate
  the gate).
- **RETAIN** as valid gold=refuted ONLY packets whose survivors support the ORIGINAL claim but do NOT entail
  the overreach (the overreach is unsupported-by-the-packet, not contradicted) -- exactly
  resist-uphold-on-absence.

The probe is GOLD-BLIND so it does NOT bootstrap the gold it validates (else it breaks closed-book). The
retained-gold floor is `>= perStratumFloor` (3, matching the assembler); the RETAINED set < floor (AFTER the
probe drops invalid packets) = a documented VOID (the corpus cannot honestly build the PRIMARY arm). NEVER
tune the probe threshold toward a desired N (result-shopping) -- the floor is LOAD-BEARING, NOT a knob (board
guardrail 5; D-RP4-3). The probe is brokered at run time as a model role (like generate + the voter); the
assembler consumes it via the injected `validityProbe({trap, enrichedKs, stratum, decisiveRank})` at SCREEN
2 (after the SCREEN-1 weak-verifier flip). The two unmeasured numbers that decide the outcome (N_retained;
Sonnet's resist-uphold-on-absence rate over the retained set) are UNMEASURED until the Task-4 calibrator
runs; if N_retained < 3 -> VOID.

## The interleaved POSITIVE CONTROLS (the mandatory power/plumbing check -- Finding 1, load-bearing, RE-PLAN-5)

RE-REGISTERED in the ZERO-VOTES window (BEFORE any Sonnet vote -- anti result-shopping, mirroring
RE-PLAN-3/4). With EVERY retained trap gold=refuted, a 0-false-uphold result is CONFOUNDED --
observationally identical to a DEGENERATE ALWAYS-REFUTE prior (a voter that refutes everything on thin
evidence scores a perfect 0 for the WRONG reason and measures nothing). The design MUST interleave
gold=unrefuted POSITIVE CONTROLS -- native UNMUTATED AVeriTeC-Supported seeds whose date-filtered survivors
GENUINELY ENTAIL the claim (the inverse of the trap screen: ALL probes agree entails=true) --
indistinguishable to the voter. The voter SHOULD vote unrefuted on them. If Sonnet REFUTES them too -> an
ALWAYS-REFUTE-ARTIFACT -> VOID/uninterpretable, NOT a clean saturation.

- The positive-control floor is `>= 3` (its OWN floor, INDEPENDENT of the evidence-absent trap floor;
  below-floor = VOID-on-control-floor -- the read cannot prove the voter CAN uphold).
- Report the voter's positive-control accuracy ALONGSIDE the false-uphold rate.
- `scorePositiveControls` reads ONLY 'unrefuted'-gold records and FAILS CLOSED on a 'refuted'-gold record
  in the control voteDir (the control arm is gold-separated from the trap arm; W-2). The PRE-REGISTERED
  tolerance is ZERO: ANY positive-control refute on a clean trace voids the saturation read.

## The OUT-OF-FAMILY probe consensus (the highest-leverage de-confounder -- Finding 2, mandatory, all-agree-retain, RE-PLAN-5)

The in-family gold-blind probe is SAME-FAMILY with the voter (Opus GENERATEs, Opus PROBEs, Sonnet VOTES)
and is DEMONSTRABLY TOO LENIENT -- PROVEN on pilot seed 75: overreach "income DOUBLED"; survivors
"$200K -> millions" EXCEED 2x, so the survivors plausibly ENTAIL "doubled"; the in-family probe RETAINED it
ONLY by a strict-literal "no explicit 2x ratio" reading; a Sonnet voter reading it loosely would CORRECTLY
vote unrefuted -> a FAKE false-uphold against gold=refuted (the exact T-19-17 defect the probe exists to
prevent). MANDATORY: a SECOND, OUT-OF-FAMILY gold-blind probe pass (GPT-5.5 + Gemini) via
`cat <prompt> | copilot --model {gpt-5.5|gemini-3.1-pro-preview} --effort high` (NO `-p`, NO
`--allow-all-tools`; output captured to gitignored `eval/.cache/`). Each is a GOLD-BLIND judge reading ONLY
the date-filtered survivors + the claim.

- RETAIN a TRAP packet only if ALL probes (in-family Opus + GPT-5.5 + Gemini) agree entails=false.
- RETAIN a positive CONTROL only if ALL probes agree entails=true.
- ANY split DISQUALIFIES (drop, REPORT the count in `attrition.probeDropped` + `attrition.probeSplitDropped`).
- OUT-OF-FAMILY GENERATE is DEFERRED with rationale (board guardrail 7): generation is gold-aware and
  inspection already found real one-step overreaches; the bigger same-family risk is the PROBE, which IS
  moved out-of-family. Out-of-family generate is a secondary nice-to-have.

## The probe-strictness rubric (pre-registered BEFORE any vote, RE-PLAN-5)

A packet whose survivors support MORE than the overreach (e.g. the survivors entail >2x when the overreach
says "doubled") is DISQUALIFIED -- the survivors ENTAIL the overreach, so gold=refuted is indefensible
there. RETAIN ONLY packets whose survivors support the ORIGINAL claim STRICTLY but do NOT entail the
overreach. The seed-75 example ("income DOUBLED"; survivors "$200K -> millions" EXCEED 2x) is the canonical
DISQUALIFY case.

## k=9 attack-mode-diverse seats (pre-registered, picked ONCE, RE-PLAN-5)

Raise k above the MIN_K=5 floor to k=9 (zone 9-11; k is AT-OR-ABOVE the frozen MIN_K floor, NOT a threshold
change -- the DISPATCH DEFAULT becomes 9, kFloorAtLeast still admits any explicit k>=MIN_K). Under
any-uphold each extra vote is one more independent opportunity to expose a false-uphold -> strictly MORE
conservative for a saturation/accept-the-null gate; diminishing returns past ~11. The extra k is spent on
SEAT DIVERSITY across distinct attack-modes (the ATTACK_MODES rotation: factual-contradiction /
scope-causality-overclaim / source-provenance / absence-of-evidence / quantifier-scope / causality-certainty
/ contradiction-vs-support), NOT identical re-draws. k is chosen ONCE here -- re-choosing after seeing
Stage-1 would be result-shopping (it also pre-loads the Stage-2 Haiku delta's conservatism).

## The NON-ZERO decision rule (pre-registered BEFORE vote 1 -- Finding 3, RE-PLAN-5)

The engine returns only saturated-vs-below-ceiling and does NOT fix what "1 false-uphold over N" MEANS, so
without a written rule a single uphold could be relabeled post hoc. The EXACT wording is locked here BEFORE
any vote:

> A Sonnet false-uphold over the retained N counts as a GENUINE below-ceiling PROCEED signal ONLY IF (i)
> the packet survived the ALL-PROBES-AGREE consensus (in-family Opus + GPT-5.5 + Gemini all said
> entails=false), (ii) the per-vote search trace is min-MET (minQueries+minDocs satisfied) and stop_reason
> is exhausted or decisive-evidence (NEVER min-not-met / truncated / quota-killed), and (iii) the positive
> controls were UPHELD (not an always-refute artifact). A false-uphold failing (i)/(ii) is an
> ARTIFACT-to-investigate (void/redo that vote), never a below-ceiling PROCEED. 0 false-upholds with
> positive-controls UPHELD on clean traces is a LEGITIMATE evidence-justified SATURATED->VOID; 0
> false-upholds with positive-controls REFUTED is an ALWAYS-REFUTE-ARTIFACT->VOID/uninterpretable.

`classifyCalibration` encodes this rule and returns ONE of FOUR terminal labels: SATURATED-VOID /
ALWAYS-REFUTE-ARTIFACT-VOID / BELOW-CEILING-PROCEED / ARTIFACT-VOID-REDO. The min-not-met leg of (ii) is
DERIVED MECHANICALLY by classifyCalibration from the pooled trace stop_reason over upheld claims (W-3);
ONLY the truncated/quota-killed leg is human-inspection (an out-of-band run condition not recoverable from
the persisted trace enum). `classifyCalibration` WRAPS `calibratorGate` byte-identical -- it never edits it.

## The CP(0,N) gate statistic + per-vote-secondary + per-class + frozen N_retained (UNANIMOUS-3, RE-PLAN-5)

The gate statistic is CP(0, N_claims) two-sided upper bound on the POOLED per-claim rate (matches the frozen
engine -- `calibratorGate.trials` = N pooled claims; every CP value is a LABEL, never a clustered CI). Do
NOT report CP over N*k as if independent (the k votes share one packet/claim/prompt -- positively
correlated); per-vote 0/(N*k) is a LABELED SECONDARY diagnostic only. Report the PER-CLASS breakdown (~one
per attack-mode, ~equal split of N_retained) so a globally-clean pooled rate cannot mask a single weak
class. READ THE FULL retained N (RELIABLE_TRIALS=15 is a reportability FLOOR, not a stopping target;
CP(0,60)~=0.05 vs CP(0,15)~=0.218 -- a ~4.6x tighter ceiling for free; a sub-full cap is a pure validity
loss). FREEZE N_retained (the post-consensus denominator) the instant the consensus probe finishes, before
vote 1; the run artifact records a partition checksum `calibratorGate.trials(traps) + nControls ==
frozen N_retained(total)` (W-2). Audit the min-not-met trace on every uphold (board guardrail 4): a verdict
on a min-not-met / truncated / quota-killed trace is an artifact, not resistance.

## The count-vs-rank predicate-error record (D-RP4-2) + the synthetic-disconfirmer finding (D-RP4-1)

The RE-PLAN-3 assembler assigned the stratum by `isBuried = (INDEX of the deepest surviving doc in the
0..99 KS list >= BURIED_RANK_FLOOR=20)`. This conflated survivor COUNT (median 5) with survivor
RANK/position (0..99). Measured: the ~8.6% dated survivors scatter across positions 0..99 so the DEEPEST
survivor index is almost always >= 20 (measured 97/97/96/80/76) -> ALL 62 qualifying seeds classified
`buried`, ZERO `evidence-absent` -> the assembler HARD-THREW on the PRIMARY evidence-absent floor and the
calibrator could not run. The committed RE-PLAN-3 pre-registration's `rank-20 burial is impossible at
median-5` claim is empirically FALSE. This is the principled, capability-irrelevant basis for the
amendment (the SECOND construct defect on this instrument; C1 -- the dispatch object/text return -- was
the first). The synthetic-disconfirmer finding (D-RP4-1, above) is the companion: even where a deep
survivor existed, flagging it `disconfirmer=true` is TEXT-UNVERIFIED and a blind probe would reject it.
Re-pre-registration timing guardrail: this amendment is SOUND in the ZERO-VOTES window (no votes -> no
result to shop); the corrected spec locks BEFORE any vote (board guardrail 1).

## The no-MCP-build decision + rationale (pre-registered)

The offline gate is CLOSED-BOOK judgment (Option A). The dev MCP + a NET-NEW ranked-retrieval index
(Option B) is NOT built: bounded downside (it gates only an OFF-by-default flag -- Sonnet ships
regardless) + a thin/low-fidelity median-5 corpus + redundancy with the Phase-20 live pilot make the index
build poor ROI. Decided by THREE independent consult rounds (a blind in-family Opus panel, an in-family
reconciliation after a claude-code-guide capability consult, and a cross-family advisory board to explicit
consensus -- 19-04-REPLAN-DECISION-3). A clean offline model-driven retrieval gate is a CONDITIONAL
follow-on (separately pre-registered; NOT in 19-04/19-05), triggered ONLY IF: (a) the evidence-absent arm
discriminates, (b) the owner explicitly signs off that a clean retrieval read is wanted given Phase-20-live
cannot give it, AND (c) a `>= 100`-doc leak-safe trap set proves feasible (the corpus collapse to median-5
may make this infeasible). Recorded so Phase-20 is NEVER assumed to cover retrieval.

## Haiku-ON preconditions (the lone dissent, reconciled; pre-registered)

Turning the Haiku-first Tier-1 flag ON requires BOTH:
1. an offline CLOSED-BOOK PASS on `evidence-absent` (the strata must DISCRIMINATE -- a non-saturated
   calibrator: Sonnet demonstrably below ceiling), AND
2. live shadow -> canary OPERATIONAL evidence on retrieval within a pre-committed tolerance of Sonnet.

On a closed-book PASS ALONE the flag STAYS OFF, with retrieval as the NAMED pre-registered precondition for
any future flip (EVAL-03 raise-to-user). A closed-book PASS tests JUDGMENT difficulty, NOT retrieval, so it
does NOT certify retrieval. OFF-by-default + pre-committed rollback throughout.

## The strict-cutoff / no-date-shift / >=5-survivor rules (pre-registered)

- **STRICT cutoff, NO date-shift.** No `claimDate-1` imputation (rejected by all three reviewers). Undated
  AND same-day (`== claimDate`) docs are DROPPED by the strict `<` in the frozen `dateFilter`.
- **>=5 strictly-pre-cutoff surviving docs per seed.** A seed with fewer than 5 surviving dated docs is
  EXCLUDED (else `min-not-met` silently changes the trap). Per-stratum attrition is recorded in the run
  artifact.
- **>=3 RETAINED distinct surviving claims (the SINGLE evidence-absent stratum).** The SOLE offline
  stratum (evidence-absent) must reach at least 3 distinct claims AFTER the gold-blind entailment probe
  drops invalid packets, so the pooled `nPooled >= reliableTrials = 15` holds at `k = 5`; the assembler
  FAILS CLOSED otherwise (the RETAINED set < floor = the documented VOID condition, the floor is
  load-bearing, never relaxed).
- **Deterministic seed selection.** ALL qualifying Supported seeds by ASCENDING `claim_id` (no
  hand-picking -- anti result-shopping, T-19-15).

## The mechanical search-minimums (OQ-2, PINNED here in the zero-votes window)

The autonomous search-and-stop loop enforces concrete mechanical minimums before an uphold is
permitted -- pinned here, BEFORE any vote, so the pre-registration is genuine:

- **`minQueries = 3`** distinct queries (at least one a disconfirming / negation query).
- **`minDocs = 5`** distinct in-window KS docs explored.

These are demanding enough to discriminate yet satisfiable on the static KS. The Plan-04
Sonnet-calibrator step may ONLY TIGHTEN them (raise N / M if a stratum saturates); it may NEVER LOOSEN
them (lowering N / M to fit an observed result is forbidden result-shopping). Any tightening is recorded
in the run artifact WITH its rationale; the pre-registered `3 / 5` floor is the anti-loosening anchor
(a one-way ratchet upward only).

NOTE: `minQueries` / `minDocs` are search-loop PARAMETERS (consumed by the search-and-stop core in
`eval/lz-eval-search-loop.mjs` -- `SEARCH_DEFAULTS`), NOT `EVAL_THRESHOLDS` keys. They are
pre-registered prose values whose only invariant is the calibrator-tighten-only ratchet; the anti-drift
test does NOT assert them against the engine struct (they are not engine thresholds).

## The rule

`lockRuleVerdict({ subtleOpenBookDeltaUpper, escalationFraction, reliableTrials })` returns `PASS`
only when ALL THREE gates clear; otherwise it returns `FAIL-RAISE`. (VOID is the SEPARATE pre-condition
outcome decided before this engine runs -- see the saturation pre-condition above.)

1. **False-uphold hard gate (sole hard gate).** `subtleOpenBookDeltaUpper <= DELTA_UPPER_MAX` (0.25).
   The open-book Haiku-MINUS-Sonnet false-uphold DELTA upper-CI bound must be ~0 -- at or below the
   zero-excess-at-reliable-15 Clopper-Pearson ceiling. Any non-zero excess false-uphold pushes the
   upper bound above 0.25 and FAILS. (The pooled run-artifact ceiling is the CP(1,N) formula above;
   the engine enforces the per-claim 0.25 anchor.)
2. **Cost gate.** `escalationFraction < ESCALATION_KILL_HIGH` (0.50). The enforced kill threshold is
   the 0.50 HIGH edge (strict `<`, so 0.50 itself FAILS); the 0.40 LOW edge is carried for context but
   is NOT the threshold (an escalation of e.g. 0.45 still clears). At or above 0.50 escalation, Haiku
   is killed on cost even if the false-uphold gate clears.
3. **Reliability gate.** `reliableTrials >= RELIABLE_TRIALS` (15). A PASS may only be declared after
   the SUBTLE subset is escalated to reliable = 15 trials. Fewer trials cannot declare PASS, even on
   a clean DELTA -- there is not yet enough evidence.

## On PASS / on FAIL-RAISE / on VOID

- **PASS** -- all three gates clear at reliable = 15 AND the saturation pre-condition held (Sonnet was
  below ceiling on a hardened stratum). The OFF-by-default Haiku-first Tier-1 flag flips ON (COST-02).
  Haiku has demonstrably no excess open-book false-upholds and is materially cheaper.
- **FAIL-RAISE** -- any gate fails. The decision (drop the Haiku variant, keep it behind the OFF flag,
  or invest further) is RAISED TO THE USER, never auto-resolved (EVAL-03). The Sonnet-default voter
  ships in the interim regardless; the Haiku-first flag stays OFF.
- **VOID / INCONCLUSIVE** -- the saturation pre-condition did NOT hold (no hardened stratum put Sonnet
  below ceiling). The read is deferred to the Phase-20 shadow; RAISED TO THE USER. Sonnet-default
  ships; the Haiku-first flag stays OFF. A both-models-ace tie is NEVER read as Haiku-safe.

Abort the eval early ONLY on a clear FAIL (a non-zero excess false-uphold or escalation above the
kill band at any stage). For any provisional PASS, escalate the SUBTLE subset to reliable = 15 before
declaring PASS.
