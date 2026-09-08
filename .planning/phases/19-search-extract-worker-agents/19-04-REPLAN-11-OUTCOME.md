# RE-PLAN-11 re-run outcome: DESCOPE the offline positive-control (over-refusal) arm (board-converged, user-confirmed)

**Status:** DESCOPE -- CONFIRMED (unanimous cross-family decision board + user human-confirmation, 2026-06-19).
**Authority:** 19-04-REPLAN-DECISION-11.md (the amended construction rule + the pre-registered DESCOPE branch).

## What ran (the tightened re-run; spend)

After RE-PLAN-11 added the genuine-synthesis generator constraint + the conjunction-decomposition reject gate, the
pilot was re-run over the same 40-cluster pilot (of the 163-cluster unused-dense-dated pool):

| Stage | RE-PLAN-11 (tightened) | RE-PLAN-10 (confounded, for contrast) |
|-------|------------------------|----------------------------------------|
| Generated (Opus, genuine-synthesis prompt) | 40 | 40 |
| Strict OOF entailment SCREEN retained | 14 (35%) | 26 (65%) |
| Single-excerpt FALSIFIER survived | 13 (1 cosmetic) | 22 |
| CONJUNCTION gate survived (GENUINE syntheses) | 7 (6 superficial rejected) | n/a (gate did not exist) |
| GENUINE-SYNTHESIS yield | 7/40 = 17.5% | -- |
| Projection to 163-pool | POINT 28.5 (clears 24); 95% CP CI ~[12, 54] (lower FAILS) | 89 (confounded -- counted conjunctions) |

The tightening WORKED (it cut the confounded 89 to a real 28, and the conjunction gate still rejected 6/13 even
after the tightened generator -- genuine syntheses are hard to mass-produce from this corpus), but the genuine
yield CLEARS THE FROZEN 24 FLOOR ONLY THINLY: the point projection (28) is below the ~30 target (24 is a
0-over-refusal-only floor: CP1s(1,24)=0.183 > TAU_OR 0.15), and the 95% Clopper-Pearson lower bound projects ~12,
failing the floor.

## The decision board (unanimous DESCOPE)

A cross-family board (2 in-family Opus lenses -- a STATISTICIAN + a PRAGMATIST -- + GPT-5.5 + Gemini-3.1-pro-preview,
out-of-family via Copilot CLI; one round, fact-only, ~20 Copilot AI Credits; transcripts gitignored
eval/.cache/replan10-board/decision-*) UNANIMOUSLY converged on DESCOPE:

1. CI-AWARE is the honest standard (not the point estimate): the eval is one-sided-Clopper-Pearson-disciplined
   throughout, so reading the yield projection at its POINT (28) while every other rate uses a CP lower bound is a
   methodological double-standard (the result-shopping signature). The honest read is the CP lower bound ~12,
   which FAILS the 24 floor.
2. NEGATIVE EV: proceeding to the scaled gold build spends ~4x the pilot to buy a near-coin-flip on a floor the
   pilot cannot confidently project past, for a best case (28, below the 30 target) that only scrapes the
   0-over-refusal-only minimum.
3. THE UNRUN DIFFICULTY-MATCH MAKES IT DECISIVE: it is a SECOND serial, still-unrun, BLOCKING kill-gate (the
   earlier audit board's unanimous flip-fact) AND an ATTRITION step -- with only a ~4-control buffer (28 vs 24) it
   would likely discard more than 4 -> drive the final N below 24 (Gemini). Joint survival P(N>=24) x
   P(difficulty-match) ~= 0.3 or lower.
4. The flip-conditions all four named are NOT available: a CP-lower-bound-clearing yield (the pool is FIXED at 163;
   the yield is 7/40), a >300-cluster pool, or a difficulty-match de-risked first. No cheap rescue exists.

## The DESCOPE (pre-registered; NO frozen primitive changed)

- The offline over-refusal arm (ESTIMAND B) is DEFERRED to the Phase-20 LIVE operational shadow -- a NAMED,
  EXPLICIT obligation, NOT silently dropped (the anti-confound purpose of positive controls is preserved as a
  deferred obligation).
- The offline read (Stage 1) ships TRAP-ONLY + EXPLICITLY INCOMPLETE.
- SATURATION-as-WORKS is DEMOTED to PROVISIONAL for any model until the Phase-20 live stage clears TAU_OR.
- Sonnet-default ships regardless (unchanged; the cheap-tier deployment default is a separate downstream matter).
- The N_CTRL_FLOOR=24 was NOT relaxed (this is a descope, not a floor fudge); the converged design was honored;
  no frozen primitive changed; the still-open zero-votes window stayed clean (no subject vote was cast -- the
  pilot was a gold-CONSTRUCTION probe).

## What stands

- The HEALTHY TRAP arm is intact (it cleared at T-spend-1: contamination gate 12/12 both frozen-pair models).
  The offline trap-only read measures ESTIMAND A (false-uphold over refuted-gold traps) per model.
- The RE-PLAN-7/8/9 frozen build + the RE-PLAN-10/11 synthetic machinery (gitignored cache) are byte-unchanged.

## Spend (this arc)

~142 Copilot AI Credits cumulative across the RE-PLAN-9/10/11 boards + the audit board + this decision board;
~220 pilot copilot calls (RE-PLAN-10 + 11); ~80 Opus generations (Claude plan). The checkpoint design caught a
fragile, negative-EV build BEFORE the ~4x scale spend + the three-voter k=9 runs.

## NEXT (open downstream decision -- separate spend boundary)

Under descope the gold is TRAP-ONLY. Two paths for 19-04, NOT yet decided:
1. Run the three-voter TRAP-ONLY runs (T-spend-2; Haiku + Sonnet + Opus, k=9) for ESTIMAND A (false-uphold) per
   model -> a PARTIAL per-model verdict (false-uphold only; over-refusal PROVISIONAL/Phase-20). A fresh,
   NOT-yet-authorized Claude-pool spend boundary.
2. Close 19-04 TRAP-ONLY-INCOMPLETE without the voter runs (no per-model numbers; the whole offline verdict
   PROVISIONAL/deferred to Phase-20), then phase close-out.
