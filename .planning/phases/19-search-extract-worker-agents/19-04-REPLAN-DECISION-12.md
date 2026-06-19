# RE-PLAN-12 decision: the board-converged STAGED path to certified WORKS (DECISION recorded; plan re-authoring PAUSED)

**Status:** DECIDED (cross-family board CONSENSUS, 2 rounds; user paused BEFORE the plan re-authoring).
**Authority for the eventual RE-PLAN-12** of Phase 19 + Phase 20. The re-authoring of the PLAN files is NOT done
here (paused per user); this records WHAT was decided.
**Inputs:** 19-04-CERTIFY-WORKS-RESEARCH.md (deep-research synthesis) + 19-04-REPLAN-11-OUTCOME.md (the descope
that triggered the question) + the user's full-re-plan-of-19+20 authorization.
**Date:** 2026-06-19.

## Trigger
The RE-PLAN-11 re-run DESCOPED the synthetic offline over-refusal arm (thin genuine-synthesis yield ~7/40,
negative-EV; board-unanimous). The user then asked: given our results, HOW could we reach a certified-WORKS
verdict? -> a deep-research pass + a cross-family board, with a full re-plan of the remaining work authorized.

## The board
Cross-family, fact-only, de-identified: 2 in-family Opus lenses (an eval-redesign ARCHITECT + a validity SKEPTIC,
via the Agent tool) + GPT-5.5 + Gemini-3.1-pro-preview (out-of-family, Copilot CLI), fed the deep-research
findings + our results. R1 = a genuine 4-way split (offline-WORKS-reachable vs live-primary). R2 = CONSENSUS:
all four accept the STAGED design below (the ARCHITECT moved off offline-WORKS; the SKEPTIC moved to accept with
hard guards). ~33 Copilot AI Credits (R1 ~16.5 + R2 ~16.4); transcripts gitignored eval/.cache/replan10-board/works-*.

## THE CONSENSUS: a STAGED certification (the answer to "how to reach certified WORKS")

Certified WORKS is reached in TWO stages -- an offline confound-robust SCREEN (gates progression, never earns the
word WORKS) and a LIVE operational stage that is the PRIMARY full-WORKS certifier. This respects the decisive SDT
constraint (F5/F7: a valid sensitivity/WORKS verdict REQUIRES positive trials -- trap-only cannot certify), cracks
the difficulty-confound that stalled RE-PLAN-9/10/11 (via contrastive-on-the-same-bundles construction), and is
honest about what offline can vs cannot certify.

### OFFLINE arm (Phase 19) -- a confound-robust SCREEN, label = SCREEN-PASS / PROVISIONAL (NEVER "WORKS")
- CONSTRUCTION: manual CONTRASTIVE MINIMAL-PAIRS (NOT expanded-synthetic -- rejected: it scales the
  superficial-conjunction skew the audit caught + stays non-matched). Author ~12 SUPPORTED claims as minimal
  label-flipping edits on the SAME ~12 dense trap evidence bundles -> a 24-item contrastive corpus,
  difficulty-matched BY CONSTRUCTION (same multi-doc density + reasoning depth; only the label-determining edit
  differs). The edit must be on the EVIDENCE (or symmetric), not claim-side (kills the F3 "myopia" claim-side
  artifact).
- METRIC + BAR (PRE-REGISTERED before building/scoring; scripts frozen; pre-registration -- not a
  defensible-sounding number -- is what answers the result-shopping objection, since the bar is
  literature-unspecified): MCC, point >= 0.5 AND one-sided 95% lower-CI bound > 0; BCa bootstrap for the interval
  + a label-permutation test for MCC > 0. Minimum N = 24 items (12 pairs); below that the interval is
  non-informative -> diagnostic-only.
- DECISIVE ARTIFACT GUARD (the SKEPTIC's sufficiency condition; mechanical, not discretionary): BOTH a
  lexical/overlap baseline (TF-IDF / bag-of-words on claim+evidence) AND a no-evidence claim-only baseline must
  score AT CHANCE (CI includes 0.5) on separating the pairs. If EITHER separates them, a lexical/claim-side
  artifact exists -> the screen AUTO-DEMOTES to a non-gating diagnostic.
- GATING (conditional): a GATING screen IF the guard passes (pass = "offline screen clears" -> progress to live;
  fail-the-screen = a cheap offline FALSIFICATION of the judge); if the guard FAILS, auto-demote to non-gating
  diagnostic and offline reverts to trap-only. It NEVER certifies WORKS.
- The HEALTHY dense-trap FALSE-UPHOLD arm (Estimand A; cleared 12/12) is kept as built + reported as a scoped
  certification (NOT WORKS).

### LIVE arm (Phase 20) -- the PRIMARY over-refusal + full-WORKS certifier
- Over ADJUDICATED production-distribution SUPPORTED claims (the only difficulty-matched-AND-real positives we
  will have). PRE-REGISTERED gates (committed before live data accrues): CP-upper of the over-refusal rate <=
  TAU_OR (0.15), N_ctrl >= 24+; carry the dense-trap false-uphold CP-upper <= TAU_FU (0.10) as a continuing
  monitor. MCC / balanced-accuracy as a SECONDARY confound-robust scalar once both live arms have data.
- WORKS = BOTH live gates pass. ONLY the live stage certifies WORKS.

## The one empirical unknown (resolved DURING execution, not a blocker)
Whether ~12 manual minimal-pairs on dense multi-doc bundles can be authored with a genuinely label-flipping edit
WITHOUT a claim-side lexical artifact is literature-unsolved (GAP) -> the DUAL-BASELINE GUARD adjudicates it:
both baselines at chance -> construction validated, difficulty-confound empirically retired, offline screen GATES;
either baseline separates -> artifact, screen DEMOTES to diagnostic, WORKS lands entirely at live. Either way the
staged design holds.

## What RE-PLAN-12 WILL implement (the PAUSED next step -- not done here)
- 19-04 -> re-scoped to the offline manual-contrastive MCC SCREEN (+ dual-baseline guard + pre-registered bar);
  the synthetic-control-arm certification attempt (RE-PLAN-9/10/11) RETIRED; the healthy trap/false-uphold arm +
  carried machinery KEPT; output = SCREEN-PASS / PROVISIONAL.
- 19-05 (stale conditional Haiku read) -> reconciled / retired (subsumed by the staged design).
- Phase 20 -> amended so the live/operational stage is the PRIMARY over-refusal + full-WORKS certifier
  (adjudicated-positive pipeline + pre-registered CP gates + MCC secondary).

## Carried / frozen
The engine + EVAL_THRESHOLDS (TAU_FU 0.10 / TAU_OR 0.15 / N_CTRL_FLOOR 24 -- now applied at the LIVE arm) +
clopperPearsonUpperOneSided + the OOF identity + the HEALTHY trap arm + the contamination gate stay. The offline
VERDICT mechanism changes from two-separate-CP-gates to an MCC confound-robust screen; the over-refusal CP gate
MOVES to the live arm. "Sonnet-default ships regardless" is unchanged; the Haiku-vs-Sonnet worker-tier decision
is settled at the live stage (consistent with the prior SCREEN-not-certificate framing).
