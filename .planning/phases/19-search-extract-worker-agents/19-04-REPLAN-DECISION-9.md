# 19-04 RE-PLAN-9 decision: control-arm redesign (cross-family board, UNANIMOUS)

**Date:** 2026-06-19. **Trigger:** the T-spend-1 VOID (19-04-T-SPEND-1-OUTCOME.md) -- the offline positive-control arm collapsed under the strict out-of-family entailment screen (real-world "Supported" claims are not strictly entailed by sparse date-filtered excerpts). **Method:** a de-identified, fact-only cross-family board (the project pattern), routed at the user's direction.

## Board
Panel (4 independent advisors): 2 in-family Opus lenses (a pragmatic FIXER + a validity SKEPTIC, via the Agent tool) + GPT-5.5 + Gemini-3.1-pro-preview (out-of-family, via the Copilot CLI; ~4 OOF calls, ~$1-2 AI Credits). R1 = independent proposals on a neutral brief; R2 = fact-only convergence -- the four anonymized R1 positions were fed back with NO proposed synthesis and NO leading phrasing (each advisor was asked: does your position hold/move, what FACT would change your mind, where is the genuine common ground vs disagreement, and is a consensus/compromise all four could accept reachable). All four MOVED to the same compromise. Transcripts: gitignored `eval/.cache/replan9-board/` (brief.md, r1-*, r2-brief.md, r2-*).

## CONVERGED DECISION (unanimous)
Pre-register, BEFORE any subject vote, a **probe-gated build-OR-descope** of the positive-control arm:

1. **Build attempt (the default path to try first).** Rebuild the control arm from an **entailment-native, family-independent, license-clean, date-filterable source**, screened by the **UNCHANGED strict out-of-family all-agree decider** (gpt-5.5 + gemini-3.1-pro-preview), with the **N_CTRL_FLOOR=24 FROZEN**. Controls are constructed by a PRE-SPECIFIED rule (never a post-hoc rescue of weak controls), with three stacked easiness guards: (a) trap-matched COVARIATE strata -- domain / date-cutoff / excerpt-count / claim-length / specificity / retrieval-sparsity; (b) exact-substring-overlap REJECTION + a complexity/length filter (force semantic, not lexical, entailment); (c) a >=1/3 HARD-POSITIVE stratum (controls carrying a specific magnitude/attribution the excerpts DO entail).
2. **Gate it on a single pre-registered SURVIVAL PROBE (~40-60 items, target ~50)** scored by that unchanged strict screen, plus a trap-vs-control covariate-match check and a human confirmation of the retained set.
3. **Pre-registered decision rule (fixed before the probe; the probe outcome -- a fact -- decides the branch, preserving pre-registration discipline):**
   - **Clears the floor cleanly** -- retains **>=24** controls (TARGET **~30+** for CI headroom: at N=24 the one-sided Clopper-Pearson upper clears TAU_OR=0.15 only at 0 over-refusals [CP1s(0,24)=0.117]; a single realized over-refusal at N=24 breaches it [CP1s(1,24)=0.183], whereas N=30 absorbs one [CP1s(1,30)=0.149]) -- that are covariate-matched within tolerance and human-confirmed -> **BUILD the offline over-refusal arm** at the frozen 24 floor.
   - **Fails any condition** (survival below a clean covariate-matched 24; covariate divergence beyond tolerance; unusable license/date; selection-easy/substring-dominated) -> **AUTO-DESCOPE the over-refusal arm to the Phase-20 LIVE shadow**, ship the offline read **trap-only + explicitly incomplete**, and **demote SATURATION-as-WORKS to PROVISIONAL** for any model until the live stage clears TAU_OR. This is a PRE-COMMITTED fallback branch, not a result-shopped retreat.

No floor relaxation, no asymmetric criterion, no auto-lock (the build-vs-descope decision is human-confirmed).

## Dead by consensus (all four)
- **Path B (a looser "support" criterion for controls only): rejected** -- it makes the two arms asymmetric (a voter could pass controls under a looser bar than it's failed on for traps), breaking the false-uphold vs over-refusal comparability. All four keep strict-entailment on BOTH arms.
- **Path A (relax the 24 floor to fit thin controls): rejected** -- under-power; the floor stays frozen.

## Residual (NOT a blocking split; resolved empirically by the probe)
First-source order: FEVER-first (FIXER + GPT-5.5 -- large, redistributable CC BY-SA/CC0, date-anchored via the Wikipedia dump revision, entailment-native at sentence granularity) vs VitaminC-first (SKEPTIC + Gemini -- contrastive design is the closest construct match + forces semantic entailment; verify its license/date-derivation). Both camps agree the other is the backfill. RESOLUTION: the probe tries BOTH entailment-native sources; the pre-registered survival + covariate + substring + hard-positive criteria decide which (or the pooled set) is used. The license/date-derivation of each source is a fact to confirm IN the probe (a source with no defensible pre-claim-date cutoff is dropped).

## Constraints preserved (verified against the locked design)
Family-independence (the subject family never makes gold; the out-of-family decider is unchanged); the healthy TRAP arm + the absolute per-model design (certifyModel + decisionMatrix + the 2 TAU + the frozen engine) UNCHANGED; the anti-confound PURPOSE of positive controls preserved (either a valid offline over-refusal arm, or an explicit, named, deferred obligation under PROVISIONAL); closed-book offline scope (a SCREEN feeding the Phase-20 live shadow); pre-registration discipline (the redesign + the decision rule fixed before any vote; no result-shopping).

## Next steps
gsd-planner re-authors 19-04-PLAN.md to RE-PLAN-9 (carrying the trap arm + the frozen primitives byte-identical; the control-arm source/criterion/probe + the decision rule recorded as an ADDITIVE re-pre-registration in the still-open zero-votes window), then gsd-plan-checker. This is DESIGN-ONLY (no eval spend; the board's OOF consult spend is already incurred). The new T-spend (the survival probe + any rebuilt gold + the three-voter runs) is a FRESH spend boundary -> HALT + RAISE for a new authorization before re-executing.
