# lz-advisor Haiku-vs-Sonnet verify-voter gating eval -- pre-registered lock rule (EVAL-04)

This is the single source of truth for the PASS / FAIL-RAISE thresholds of the Haiku-vs-Sonnet
verify-voter gating eval. It is PRE-REGISTERED: it is written and committed BEFORE any model call,
so the eval verdict cannot be rationalized post-hoc (D-01 / D-06 / D-07 / EVAL-04). The eval run in
Plan 18-05 consumes this rule; the verdict it produces is fixed by these numbers, decided here, in
advance.

The rule is MECHANICALLY ENFORCED by `eval/lz-eval-aggregate.mjs` -- the deterministic, off-model
eval aggregator. Every threshold below MUST match that script's frozen `EVAL_THRESHOLDS`
(`Object.freeze({...})`) byte-for-byte (anti-drift). The code is authoritative; if a number here
ever disagrees with `EVAL_THRESHOLDS`, the code wins and this document is wrong and must be
corrected to match. Do NOT change a threshold in one place without changing it in the other.

## What the gate measures

- The SOLE HARD GATE is the SUBTLE-stratum, open-book, Haiku-MINUS-Sonnet false-uphold DELTA --
  NEVER Haiku's absolute false-uphold rate (D-06). Sonnet is run on the IDENTICAL sampled SUBTLE
  strata as the calibration baseline; the gated quantity is the EXCESS (Haiku count minus Sonnet
  count) on the shared trial pool.
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
| `DELTA_UPPER_MAX` | 0.25 | The SUBTLE open-book false-uphold DELTA upper-CI ceiling that encodes "~0". It sits between the zero-excess-at-reliable-15 Clopper-Pearson ceiling (CP(0,15) ~= 0.218, which PASSES) and the one-excess ceiling (CP(1,15) ~= 0.319, which FAILS), so a clean zero-excess Haiku clears and any non-zero excess false-uphold fails. |
| `STRATA.SUPPORTED_FRACTION` | 0.40 | EVAL-01 sampling: ~40% supported. |
| `STRATA.BAD_FRACTION` | 0.60 | EVAL-01 sampling: ~60% bad. |
| `STRATA.SUBTLE_FRACTION_OF_BAD` | 0.50 | EVAL-01 sampling: ~half the bad items are SUBTLE. |

## The rule

`lockRuleVerdict({ subtleOpenBookDeltaUpper, escalationFraction, reliableTrials })` returns `PASS`
only when ALL THREE gates clear; otherwise it returns `FAIL-RAISE`.

1. **False-uphold hard gate (sole hard gate).** `subtleOpenBookDeltaUpper <= DELTA_UPPER_MAX` (0.25).
   The SUBTLE open-book Haiku-MINUS-Sonnet false-uphold DELTA upper-CI bound must be ~0 -- at or below
   the zero-excess-at-reliable-15 Clopper-Pearson ceiling. Any non-zero excess false-uphold pushes
   the upper bound above 0.25 and FAILS.
2. **Cost gate.** `escalationFraction < ESCALATION_KILL_HIGH` (0.50). If the escalation fraction
   crosses the 0.40-0.50 kill band, Haiku is killed on cost even if the false-uphold gate clears.
3. **Reliability gate.** `reliableTrials >= RELIABLE_TRIALS` (15). A PASS may only be declared after
   the SUBTLE subset is escalated to reliable = 15 trials. Fewer trials cannot declare PASS, even on
   a clean DELTA -- there is not yet enough evidence.

## On PASS / on FAIL-RAISE

- **PASS** -- all three gates clear at reliable = 15. The OFF-by-default Haiku-first Tier-1 flag flips
  ON (COST-02). Haiku has demonstrably no excess open-book false-upholds on SUBTLE and is materially
  cheaper.
- **FAIL-RAISE** -- any gate fails. The decision (drop the Haiku variant, keep it behind the OFF
  flag, or invest further) is RAISED TO THE USER, never auto-resolved (EVAL-03). The Sonnet-default
  voter ships in the interim regardless; the Haiku-first flag stays OFF.

Abort the eval early ONLY on a clear FAIL (a non-zero excess false-uphold or escalation above the
kill band at any stage). For any provisional PASS, escalate the SUBTLE subset to reliable = 15 before
declaring PASS.
