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

## What the gate measures

- The SOLE HARD GATE is the SUBTLE-/open-book, Haiku-MINUS-Sonnet false-uphold DELTA -- NEVER
  Haiku's absolute false-uphold rate (D-06). Sonnet is run on the IDENTICAL sampled strata as the
  calibration baseline; the gated quantity is the EXCESS (Haiku count minus Sonnet count) on the
  shared trial pool.
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

1. **Three retrieval-difficulty strata** -- buried (a decisive pre-cutoff in-corpus disconfirmer
   ranked DEEP behind distractors), evidence-absent (a one-step-overreach mutation whose refutation is
   NOT in the KS), date-sensitive (the decisive disconfirmer is date-gated). The difficulty lives in
   RETRIEVAL ORCHESTRATION, NEVER claim subtlety (the subtlety axis is empirically proven saturated:
   Haiku 0/30 == Sonnet 0/30).
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
