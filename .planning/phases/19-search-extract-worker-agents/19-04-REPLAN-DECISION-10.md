# RE-PLAN-10 decision: board-converged probe-first control-arm rescue-or-descope

**Status:** DECIDED (cross-family board converged; user-endorsed). Pre-registered BEFORE the probe runs.
**Authority chain:** supersedes the RE-PLAN-9 control SOURCE only (FEVER+VitaminC), carries everything else.
**Date:** 2026-06-19.

## Trigger

RE-PLAN-9 (FEVER + VitaminC entailment-native control source) was FALSIFIED at the Task-10 NO-SPEND
prep stage (before any spend), mirroring how T-spend-1 caught the AVeriTeC collapse at the gold-build:

- **FEVER (`fever/fever`)** is offline-UNCONSTRUCTIBLE on the free path: the HF repo is a loader
  script (no committed rows; datasets-server refuses it), and evidence is sentence POINTERS requiring
  a multi-GB Wikipedia-dump join to recover text. Fails joint constraint (b) free-text-fetchability.
- **VitaminC (`tals/vitaminc`)** is entailment-native + free-fetchable + license-clean, BUT its
  evidence is a SINGLE Wikipedia sentence by design -> excerpt-count covariate divergence is MAXIMAL
  (1.0 vs the frozen 0.5 tolerance) against the dense (multi-document/multi-sentence) traps. Because
  build-vs-descope is AND-gated, `covariateMatched=false` forces descope regardless of the OOF
  retained-count -- so the survival-probe spend cannot change the outcome.

The RE-PLAN-9 build (Tasks 6-9: lz-eval-control-source/-construction/-survival-probe + the additive
re-pre-registration) is COMMITTED, suite-green, and CARRIED -- the modules are reused; only the SOURCE
is superseded.

## The board

Cross-family, de-identified, fact-only, advisor-authored synthesis (NO imposed synthesis), per
[[feedback_board_convergence_methodology]]:
- 2 in-family Opus lenses (a pragmatic FIXER + a validity SKEPTIC, via the Agent tool).
- 2 out-of-family models via the Copilot CLI: gpt-5.5 + gemini-3.1-pro-preview (--effort high).
- R1 independent on a neutral brief -> R2 fact-only convergence. ~36.3 Copilot AI Credits
  (R1 20.0 + R2 16.3). Transcripts gitignored: eval/.cache/replan10-board/.

R1: 3 DESCOPE (both Opus + gpt-5.5) vs 1 conditional BUILD-via-synthetic-generation (gemini).
R2: UNANIMOUS convergence on the framework below.

## Converged decision (the ONLY substantive RE-PLAN-10 change: the control SOURCE + a probe-gate)

A BOUNDED CHECK FIRST, under a PRE-REGISTERED build-or-descope rule, with DESCOPE as the default. The
W-vs-Z disagreement (is trap-corpus synthetic generation a rescue or a selection-easy confound?) is
resolved by a SHARED, LOAD-BEARING FALSIFIER:

- **THE MULTI-EXCERPT-NECESSITY FALSIFIER:** any candidate control must genuinely require MULTIPLE
  excerpts jointly to entail the claim. Re-screen each retained candidate against EACH SINGLE excerpt
  IN ISOLATION; if one excerpt alone entails it, it is cosmetic density (selection-easy) -> DISCARD.
  The surviving genuinely-multi-excerpt count is what counts toward the floor.

### The pre-registered PASS BAR (all must hold; fixed BEFORE the probe)

1. (a) entailment-native (survives the UNCHANGED strict symmetric OOF all-agree screen);
2. (b) evidence TEXT free-fetchable -- NO multi-GB dump join (bounded free MediaWiki title+revid text
   fetches are acceptable, the same class already used for VitaminC dates);
3. (c) per-claim strict pre-claim-date derivable on a free path;
4. (d) native per-claim excerpt-count density covariate-MATCHES the dense traps within the FROZEN 0.5
   tolerance (and passes the multi-excerpt-necessity falsifier -- density must be NATIVE, not cosmetic);
5. (e) redistributable license, fetch-only (no raw licensed text committed);
6. screen-eligible SUPPORTED pool large enough that even a pessimistic strict-screen retention
   (~30-50%, the attempt-1 collapse rate) projects >=24 retained (target ~30+).

### The branches (build-or-descope; pre-registered)

- **STEP 1 (NO SPEND): the fetched-source inventory** of HoVer (multi-hop, multi-document), FEVEROUS
  (natively multi-element: sentences + table cells), SciFact (multi-sentence rationales; domain-match
  is the risk). For each, measure (b)(c)(d)(e) + pool size + the multi-excerpt-necessity lens on the
  FREE path only. NO model spend.
- **STEP 1 CLEARS** (>=1 fetched source passes ALL of the pass bar) -> recommend BUILD via the paid
  OOF strict-entailment screen on that source. HALT + RAISE -- the paid screen is a SEPARATE spend
  boundary, NOT pre-authorized (user directive: report inventory results before any spend).
- **STEP 1 FAILS** (no fetched source clears) -> run the PRE-AUTHORIZED synthetic-generation pilot
  (Position Z; an LLM-generation + screen SPEND, mirroring how the trap arm was built): generate a
  small batch (~20-40) of SUPPORTED claims over UNUSED dense trap-corpus evidence clusters, screen via
  the UNCHANGED strict OOF decider, then apply the single-excerpt-isolation falsifier. CLEARS (projects
  >=24 genuinely-multi-excerpt controls, covariate-matched) -> recommend BUILD (HALT + RAISE the full
  build, a further spend boundary). FAILS (cosmetic-density / low retention) -> DESCOPE.
- **DESCOPE (the default fallback, unchanged from RE-PLAN-9):** defer the over-refusal arm to the
  Phase-20 LIVE shadow; ship the offline read TRAP-ONLY + explicitly incomplete; DEMOTE
  SATURATION-as-WORKS to PROVISIONAL until the live stage clears TAU_OR; Sonnet-default ships.

## FROZEN -- carried byte-identical (NO change; DEAD paths stay dead)

The strict symmetric OOF all-agree screen + the OOF gold-decider identity (gpt-5.5 +
gemini-3.1-pro-preview, --effort high); EVAL_THRESHOLDS incl. N_CTRL_FLOOR=24 (NO floor relaxation --
Path A DEAD) + TAU_FU/TAU_OR/N_TRAP_FLOOR; covariateOverlapTolerance=0.5; the 6 covariate axes;
URL_DATE_RULE; clopperPearsonUpperOneSided; certifyModel + decisionMatrix; the HEALTHY trap arm
(cleared T-spend-1 12/12); the RE-PLAN-9 Tasks 6-9 modules (loadControlSource/constructControls/
runSurvivalProbe -- REUSED; new sources need only new source adapters mirroring lz-eval-control-source).
NO asymmetric "support" criterion for controls (Path B DEAD). Pre-registration discipline: this is
ADDITIVE inside the still-open zero-votes window (the gold VOIDed pre-vote), the rule is FIXED before
the probe, N stays frozen post-screen.

## User decisions (2026-06-19)

1. Run the NO-SPEND fetched-source inventory now (-> this RE-PLAN-10), report before any spend.
2. PRE-AUTHORIZED: the synthetic-generation pilot IF the no-spend inventory finds no clean fetched
   source. (The paid OOF screen on a CLEARED fetched source, and any full build, remain SEPARATE
   spend boundaries requiring a fresh go.)
