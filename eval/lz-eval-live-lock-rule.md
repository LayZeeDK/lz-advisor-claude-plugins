# lz-advisor LIVE over-refusal + full-WORKS verify-voter certification -- pre-registered lock rule (Phase 20, RE-PLAN-12 live arm)

This is the single source of truth for the WORKS / DOES-NOT-WORK / VOID thresholds of the LIVE
over-refusal + full-WORKS certification of the lz-deep-research verify-voter. It is a NEW pre-registered
SIBLING of `eval/lz-eval-lock-rule.md` (the offline gating lock rule) -- it CARRIES the offline lock
rule's pre-registration discipline and ADDS the live-arm specifics. It is PRE-REGISTERED: it is written
and committed BEFORE any CHEAP scored vote, so the live verdict cannot be rationalized post-hoc
(D-01 / D-02 / D-07 / D-19; mirrors `eval/lz-eval-lock-rule.md`).

The authority for the staged certification is `19-04-REPLAN-DECISION-12.md` (the offline MCC SCREEN
GATES progression; the LIVE stage is the PRIMARY over-refusal + full-WORKS certifier; the over-refusal
CP gate MOVES to the live arm; the frozen primitives carry byte-identical). The HOW-decisions are
`20-CONTEXT.md` D-02..D-07 (the cross-family board consensus) + D-19 (the feasibility probe).

## What the LIVE stage certifies (RE-PLAN-12; the SDT positive-trials constraint)

The LIVE stage is the ONLY stage that can certify the verify-voter "WORKS." A valid WORKS REQUIRES
positive trials (the Signal-Detection-Theory positive-trials constraint, F5/F7): a trap-only arm cannot
certify WORKS. The Phase-19 offline MCC SCREEN GATES progression to here but does NOT certify WORKS.
WORKS is settled HERE, over adjudicated production-distribution SUPPORTED positives.

The Sonnet-default voter SHIPS regardless of the live-cert outcome. The outcome is honestly
settle-OR-raise (D-01): if WORKS cannot be cleared, RAISE to the user; Sonnet-default ships. The
Haiku-first FLIP is DEFERRED (D-06) -- Phase 20 ships only the gated mechanism + guardrails + a
pre-committed rollback; the flip itself is a future human checkpoint after a live WORKS pass + a clean
unanimous-uphold audit + a real cost win.

## The frozen thresholds (BYTE-IDENTICAL to EVAL_THRESHOLDS -- references, NOT new numbers, D-03)

The live N TARGETS sit ABOVE the frozen floor. They are run-config N TARGETS, NOT threshold changes:
the frozen `EVAL_THRESHOLDS` numbers stay BYTE-IDENTICAL. This document references them; it never
introduces a new threshold. The anti-drift discipline of the offline lock rule applies: the code
(`eval/lz-eval-aggregate.mjs` `EVAL_THRESHOLDS`, `Object.freeze({...})`) is authoritative; if a number
here ever disagrees, the code wins and this document is wrong and must be corrected to match.

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `TAU_FU` | 0.10 | The dense-trap FALSE-UPHOLD bar (ESTIMAND A). PASS_A iff `clopperPearsonUpperOneSided(falseUpholds, nTrap) <= TAU_FU`. The catastrophic arm: silently shipped bad research. Byte-identical to `EVAL_THRESHOLDS.TAU_FU` (the literal frozen value is 0.10). |
| `TAU_OR` | 0.15 | The OVER-REFUSAL bar (ESTIMAND B). PASS_B iff `clopperPearsonUpperOneSided(overRefusals, nCtrl) <= TAU_OR`. The over-refusal CP gate MOVED to this live arm (RE-PLAN-12). Byte-identical to `EVAL_THRESHOLDS.TAU_OR`. |
| `N_CTRL_FLOOR` | 24 | The F1-corrected control-arm power floor under the one-sided CP -- byte-identical to `EVAL_THRESHOLDS.N_CTRL_FLOOR`. The live N_ctrl TARGET sits ABOVE this floor (40, run-config floor 30). NOT a new number -- the frozen floor referenced. |

The CP estimator is the FROZEN `clopperPearsonUpperOneSided` (the F2-pinned one-sided 95% upper) --
jstat-backed, NEVER hand-rolled and NEVER Wald / bootstrap (the offline lock-rule discipline, D-07).
NEVER relax a TAU to fit a realized N.

## The live N targets (D-03; run-config TARGETS above the frozen floor, the two arms NEVER pooled)

Two SEPARATE arms, NEVER pooled into one N:

- **Over-refusal control arm: N_ctrl = 40 (run-config floor 30).** The harvested adjudicated SUPPORTED
  positives the voter SHOULD uphold; an over-refusal is a wrong refute on one of these. ESTIMAND B reads
  this arm.
- **Dense-trap false-uphold MONITOR arm: N_trap ~34-40 (run-config floor 30).** The harvested dense /
  contested-evidence claims (the band where correlated cheap-tier errors live); a false-uphold is a wrong
  uphold of an unsupported overreach. ESTIMAND A reads this arm.

The two arms are NEVER pooled into one N. They are frozen as SEPARATE counts BEFORE any scored vote
(the N-freeze guard `freezeArms` in `eval/lz-eval-live-cert.mjs` enforces at-or-above-floor + disjoint
arms + a frozen snapshot). N=30 absorbs one adjudication artifact; N=40 absorbs two. The harvest run-
config (`HARVEST_TARGETS` / `LIVE_N_TARGETS`) records these TARGETS byte-for-byte; this prose matches it.

### The N=24-knife-edge arithmetic (the decisive reason the targets sit ABOVE the frozen floor)

N=24 is a knife-edge, NOT a target. At the one-sided 95% Clopper-Pearson:

- `CP1s(0,24) = ~0.117` clears `TAU_OR` (0.15) ONLY at exactly zero over-refusals -- and `~0.117` can
  FAIL the separate `TAU_FU` (0.10) gate;
- `CP1s(1,24) = ~0.183` FAILS `TAU_OR` (0.15) -- a SINGLE over-refusal at N=24 breaches the bar;
- `CP1s(1,30) = ~0.149` clears `TAU_OR` (0.15) -- so the floor-30 arm absorbs one adjudication artifact;
- `CP1s(2,40)` is comfortably below `TAU_OR` -- so the target-40 arm absorbs two.

This is why the targets sit ABOVE the frozen floor (N_ctrl 40 / N_trap ~34-40), never the bare 24
knife-edge. Raising the N TARGET above `N_CTRL_FLOOR=24` keeps `EVAL_THRESHOLDS` byte-identical (D-03);
it is frozen-floor headroom, not a threshold change. NEVER relax a TAU to fit a realized N.

## The acceptance rule (WORKS = BOTH live gates pass, N floors met)

`certifyModel` (`eval/lz-eval-offline-read.mjs`, CONSUMED byte-identical -- the over-refusal CP gate now
applies at this live arm) returns the per-model verdict:

> WORKS = ESTIMAND A (CP1s false-uphold `<= TAU_FU` 0.10 over the dense-trap monitor arm) AND ESTIMAND B
> (CP1s over-refusal `<= TAU_OR` 0.15 over the harvested SUPPORTED control arm), with the N floors met.

- `DOES-NOT-WORK` if either CI exceeds its TAU.
- `VOID-on-power` if an arm is below its floor (the read lacks power).
- `VOID-difficulty` / `VOID-covariate` from the F5 floors; `VOID-artifact` on an always-refute / bad-trace
  collapse (carried from the frozen `certifyModel`).

The CP estimator is `clopperPearsonUpperOneSided`. MCC / balanced-accuracy is a SECONDARY scalar once both
arms have data (never the gate). The two arms are passed SEPARATELY to `certifyModel`
(`overRefusals, nCtrl` is ESTIMAND B; `falseUpholds, nTrap` is ESTIMAND A) -- NEVER pooled into one N.

The Haiku-first flip is DEFERRED (settle-OR-raise; Sonnet-default ships regardless). `decisionMatrix`
sets `raiseToUser: true` ALWAYS -- a both-WORKS cell does NOT auto-flip Haiku ON. The decision (drop the
Haiku variant, keep it behind the OFF flag, or invest further) is RAISED TO THE USER, never auto-resolved
(EVAL-03 / D-06). The flip flips ON only after a FUTURE run clears BOTH CP gates jointly + a clean
unanimous-uphold audit + a demonstrated real cost win, at an explicit human checkpoint.

## The adjudicator (D-04; HYBRID -- frozen OOF all-agree PRIMARY + maintainer-resolved residue)

The gold is the FROZEN OUT-OF-FAMILY all-agree gold-decider pair (carried byte-identical):
gpt-5.5 + gemini-3.1-pro-preview, `--effort high`, all-agree, gold-blind. The adjudicator stays
OUT-OF-FAMILY from any tier under test (OR-Bench rejected a same-family judge as too conservative).

The solo maintainer (the only available human) resolves ONLY the RESIDUE:

- `oof-split` -- the OOF pair disagrees (or a probe abstained);
- `response-set-indeterminate` -- a multi-defensible item (Guerdan response-set elicitation, NeurIPS 2025):
  it LEAVES the binary denominator and routes to the human, NEVER coerced to a forced binary gold (which
  biases judge selection up to 31%);
- `cheap-vs-unanimous-oof` -- CHEAP contradicts a unanimous OOF verdict.

A small OOF-vs-human CALIBRATION subset (the maintainer adjudicates a handful blind, compared to the OOF
pair) validates the OOF oracle BEFORE it is trusted as primary (D-04). The residue router
(`classifyAdjudicationResidue`) is deterministic over the already-collected verdicts.

## The DISTRIBUTION-SCOPE LIMIT (D-05; "no theatre" -- name the limit in the report)

There is NO production traffic, so a staged operational shadow -> canary -> Tier-1 is NOT literally
applicable and MUST NOT be faked (theatre). The verdict certifies on the MAINTAINER-CURATED DISTRIBUTION,
NOT "all production." This limit is NAMED in the run artifact / report -- a WORKS verdict over-generalizes
if the report omits it. `decisionMatrix.framing` ('clears-the-closed-book-SCREEN' analog) + the always-true
`raiseToUser` encode the non-terminal framing; the report surfaces the distribution scope explicitly.

The honest substitute for shadow/canary (D-05):
1. "shadow" = a maintainer-driven offline DUAL-RUN of CHEAP vs STRONG voters (run-without-acting) over the
   SAME frozen harvested claim/evidence bundles, gold-blind-adjudicated, scored on the two pre-registered
   CP gates;
2. the correlated-unanimous-false-uphold guard = load-bearing-claim auto-escalation to STRONG/OOF + an
   audit of CHEAP unanimous upholds (CENSUS on load-bearing / high-consequence claims, sample elsewhere)
   -- the only mechanisms that can catch a unanimous (contested-trigger-invisible) false-uphold;
3. the closest honest "canary" = an OPT-IN dogfood beta (CHEAP behind an explicit OFF-by-default flag).
   "Rollback" degenerates to "the flag stays OFF" -- free and real, since STRONG ships regardless.

## The staging (D-07; staged, pre-registered, human-authorized BLOCKING spend)

The certification SPEND is a STAGED, PRE-REGISTERED, human-authorized BLOCKING spend (matches the
project's blocking-checkpoint pattern; mirrors 19-04 Task 9). Every model-spend stage is hard-guarded
behind `LZ_SPEND=1` (the dry-run + the entire test suite run STUBS only).

- **Stage 0 (D-19 harvest feasibility probe; NO SPEND):** confirm the shipping skill can emit `>= 30`
  difficulty-representative SUPPORTED claims in the dense / contested-evidence band per arm. If it cannot
  (the board's #1 named uncertainty -- difficulty-matched dense-evidence positives are literature-
  unsolved), the over-refusal arm is not constructible at the target N -> CHEAP is not certifiable under
  current constraints -> keep STRONG indefinitely, RAISE to the user. Sonnet-default ships regardless.
- **Stage 1 [HUMAN BLOCK]:** harvest STRONG outputs + OOF/human adjudicate + FREEZE the gold control set
  (N_ctrl) + the dense-trap set (N_trap) + the acceptance rule (the N targets, the 0.15/0.10 ceilings, the
  CP estimator) BEFORE any CHEAP scored vote.
- **Stage 2:** dual-run CHEAP + STRONG over the FROZEN artifacts in ONE scored pass; compute CP via
  `certifyModel`.
- **Stage 3:** the unanimous-uphold audit / load-bearing census folded in.

A cheap pilot may validate harness / plumbing before the main spend.

## NO optional stopping (the anti-result-shopping discipline)

NO optional-stopping / add-until-pass: N is FROZEN in advance (the N-freeze guard freezes the two arms at
Stage 1, before any CHEAP scored vote). The two arms are NEVER pooled into one N. The prose threshold
numbers MATCH `EVAL_THRESHOLDS` byte-for-byte (the offline lock-rule anti-drift discipline). N does NOT
grow after the first CP read; a TAU is NEVER relaxed to fit a realized N. Mirror the offline lock rule's
zero-votes-window discipline: this rule is committed BEFORE any CHEAP scored vote, so the gate cannot be
result-shopped after seeing a vote.

## On WORKS / on DOES-NOT-WORK / on VOID / on RAISE

- **WORKS** -- BOTH live gates pass (ESTIMAND A false-uphold CP-upper `<= TAU_FU` AND ESTIMAND B
  over-refusal CP-upper `<= TAU_OR`), the N floors met. The verdict certifies on the maintainer-curated
  distribution (named in the report), NOT "all production." It does NOT auto-flip Haiku ON; the flip is
  DEFERRED to a future human checkpoint (D-06). `decisionMatrix.raiseToUser` is true.
- **DOES-NOT-WORK** -- a CI exceeds its TAU. RAISE to the user; Sonnet-default ships; the Haiku-first
  flag stays OFF.
- **VOID** -- the read lacks power / fails a floor (an arm below floor, the D-19 feasibility shortfall,
  an always-refute or bad-trace artifact). RAISE to the user; Sonnet-default ships.
- **RAISE** -- `raiseToUser` is true in EVERY case (settle-OR-raise). The Sonnet-default voter SHIPS
  regardless of the live-cert outcome.
