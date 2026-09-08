# 19-04 RE-PLAN-DECISION-7 -- ABSOLUTE per-model eval (prove whether EACH of Haiku AND Sonnet works)

Status: CONSOLIDATED decision record. Board-converged via (1) an Opus design panel (5 lenses + synthesis) that
produced the absolute per-model eval design, and (2) a cross-family VALIDATION board -- GPT-5.5 + Gemini-3.1-Pro
(out-of-family) + one Opus peer, all reviewing BLIND as equal peers -- returning UNANIMOUS VALID-WITH-FIXES.
Board transcripts (gitignored): eval/.cache/eval-design/{gpt-5.5.val.txt, gemini-3.1-pro.val.txt} + the Opus
peer review + eval/.cache/eval-design/packet-validate.md.

## What this supersedes / carries

SUPERSEDES the RE-PLAN-5 relative Haiku-MINUS-Sonnet delta calibrator AND the held RE-PLAN-6 OOF-gate-only
draft (19-04-REPLAN-DECISION-6.md). CARRIES FORWARD: Finding 1 (interleaved gold=unrefuted positive controls --
now promoted to a co-equal Estimand B); the frozen primitives + EVAL_THRESHOLDS engine + URL_DATE_RULE; the
Phase-16 aggregator + Phase-17 schema + Phase-18 datasets/harness; the construct-scope boundary (closed-book =
JUDGMENT; retrieval/end-to-end = Phase-20 live shadow); the RE-PLAN-6 outcome that the mandatory
OOF-gate-on-the-voter's-verdict is DEAD; and the targeted re-audit of magnitude/open-bound traps + restore any
traps the Finding-2 author altered.

## THE PIVOT (the operator's directive)

From a RELATIVE delta (Haiku-MINUS-Sonnet, Sonnet assumed-good baseline) to an ABSOLUTE per-model verdict:
prove, for BOTH Haiku 4.5 AND Sonnet 4.6, WHETHER each WORKS as the lz-deep-research verify-voter. Sonnet is a
SUBJECT on trial, not the yardstick. KEY REFRAME: saturation (both ~0 false-upholds) on a HARD, REPRESENTATIVE
set with a tight CI AND a passing over-refusal arm is now PROOF both work -- NOT a VOID. CRITICAL SCOPE: this is
a closed-book SCREEN feeding Phase-20, NOT a ship certificate; an offline PASS NEVER auto-flips Haiku ON (the
Phase-20 live shadow remains the named precondition for any flip, and for the real retrieval/end-to-end proof).

## The design (validated)

Per model M in {Haiku, Sonnet, AND Opus-as-reference -- see #3}, voter role, two estimands, pooled PER-CLAIM
(denominator N_claims, never N*k -- the k=9 votes share one packet, positively correlated):
- ESTIMAND A -- FALSE-UPHOLD rate over retained refuted-gold traps; statistic = clopperPearsonUpper(x_FU, N_trap);
  PASS_A iff CP-upper <= TAU_FU. (Catastrophic arm: silently shipped bad research.)
- ESTIMAND B -- OVER-REFUSAL rate over gold=unrefuted positive controls (the mandatory always-refute detector,
  = Finding 1); CP-upper(x_OR, N_ctrl); PASS_B iff CP-upper <= TAU_OR. Symmetric any-uphold reduction on both arms.
- VERDICT(M) = WORKS iff PASS_A AND PASS_B; DOES-NOT-WORK if either CI exceeds its TAU; VOID-on-power if N below
  floor; VOID-artifact if always-refute / min-not-met-trace. DECISION MATRIX = cross-product of the independent
  per-model verdicts {both / only-Sonnet / only-Haiku / neither} with VOID rows explicit.
- SATURATION-AS-PASS certifies WORKS only when ALL THREE hold jointly: (a) difficulty floor met (set is
  hard+representative -- now incl. a SUBJECT-SPECIFIC Claude check, F5), (b) CI upper bound tight (<= TAU at N),
  (c) positive-control arm passes (the 0 is earned, not always-refuse).

## Locked decisions (operator)

- #1 TAU_FU = 0.10 as the SCREEN bar (one-sided 95% CI; tolerates 1 miss near N=60). The real gate is Phase-20.
  (Stricter 0.06 NOT adopted -- it is zero-tolerant + hostage to the feasibility risk; 0.10-as-screen is
  honest given Sonnet-default + the Phase-20 safety net.)
- #2 PER-MODEL FAIR PROMPTS, not a shared prompt (overrides the board's shared-prompt suggestion; re-aligns
  with EVAL-05/D-08): Haiku gets its own research-grounded prompt (lz-haiku-prompt-engineering.md +
  research-verify-voter-haiku.md); Sonnet (and Opus) its own. Each prompt frozen + sha'd in the manifest. A
  per-model verdict is "works UNDER ITS OWN BEST PROMPT" -- the deployment-realistic question; this is the
  principled resolution of ATTACK-7 (F8).
- #3 DROP Opus from the gold-DECIDER (retain predicate) -- the gold must be independent of the family on trial,
  else it grades Claude on a curve drawn by Claude; reinforced by the plugin concept (we must validate that
  Opus-level judgment is itself correct, not assume it). Keep Opus only as a NON-GATING annotation. ADD Opus
  as a THIRD MEASURED VOTER on the same objective gold: (a) validates the quality anchor the whole plugin leans
  on ("near-Opus" only has value if Opus is itself correct), and (b) yields the NEAR-OPUS diagnostic (how
  closely Haiku/Sonnet track Opus). Opus-as-voter is Claude-pool spend (not Copilot credits).
  OPUS-VOTER NUANCES (encode in the plan): (i) Opus = the validated REFERENCE/anchor + the near-Opus
  yardstick, NOT a deployable matrix cell -- the ship decision matrix stays Haiku x Sonnet (the cheap tiers);
  (ii) NEW first-class outcome "OPUS ITSELF FAILS the absolute bar" -> a MAJOR finding (the quality anchor the
  plugin leans on is below its own gate -> the near-Opus thesis is in question -> RAISE TO USER), distinct from
  any Haiku/Sonnet cell; (iii) the near-Opus diagnostic is CONDITIONAL on Opus clearing the bar (tracking a
  model that is itself wrong is not reassurance); (iv) Opus-voter at k=9 is the priciest tier (Claude pool,
  not Copilot) -- pace it. Opus-as-SUBJECT scored against the OUT-OF-FAMILY gold is a clean cross-family
  measurement and does NOT reintroduce the gold-curation bias that #3 removed (it is tested, not testing).

## Board findings applied (all VALID-WITH-FIXES, unanimous)

- F1 N_ctrl floor 18 is mathematically broken (0/18 CP-upper=0.185 > TAU_OR=0.15 -> a perfect arm fails). FIX:
  N_ctrl floor >= 24 (target 30 for 1-miss slack); recompute against the pinned CI convention.
- F2 CI convention: pin ONE-SIDED 95% upper (correct for a one-directional ceiling); recompute ALL TAU/floor
  brackets; assert prose==code byte-for-byte in the anti-drift test.
- F3 the "drop Opus = lower N" framing was backwards (under all-agree AND, dropping a conjunct LOOSENS ->
  retains MORE -> higher N + purer gold). APPLIED via #3 (drop + add-as-voter).
- F4 relabel the matrix from "both WORK" to "both clear the closed-book SCREEN"; strip any production-safe
  implication; lock the screen-not-certificate framing.
- F5 the difficulty floor was calibrated against the wrong axis (weak-verifier + OOF only). ADD a
  SUBJECT-SPECIFIC (Claude) difficulty-floor check (a held-out Claude reference must not ace the retained set)
  + a trap/control COVARIATE OVERLAP check (length/complexity, so models cannot pass by style) + hard/matched
  positive controls (not trivially-easy native Supported).
- F6 define the k=9 -> per-claim aggregation explicitly = CONSERVATIVE any-seat-false-uphold = fail
  (deployment-matched); enforce CLUSTER INDEPENDENCE (one primary claim per source/seed cluster, or
  cluster-level failure) so the per-claim CP is not anti-conservative.
- F7 pre-register a STRATUM-LEVEL MINIMUM for evidence-absent (the deployment-critical sub-construct WiCE does
  not supply), OR explicitly scope "both work" to exclude evidence-absent and defer it to Phase-20 by name --
  so WiCE power is not laundered into an evidence-absent claim.
- F8 prompt-fairness -> resolved by #2 (per-model fair prompts), documented as a principled override of the
  board's shared-prompt suggestion.
- F9 the construct concern (closed-book proxy vs live retrieval-grounded voter) is HELD AT BAY by F4 + F7 +
  the screen framing: this is a SCREEN; the real construct is Phase-20. If the build team ever treats an
  offline "both work" as a ship green-light, the verdict flips to REDESIGN -- so the framing is load-bearing.

## Dataset + gold

REUSE Phase-18 (no new corpora): WiCE (human 3-way labels; closed-book SUBTLE-overreach spine; partially/not_supported
-> refuted traps, supported -> controls) carries the BULK of the traps (de-risks the AVeriTeC median-5 collapse,
F7-relevant); AVeriTeC (CC-BY-NC fetch-only) supplies the evidence-absent trap stratum + native unmutated controls.
Target N_trap ~55-62 (floor 36 at TAU_FU=0.10 one-sided -- recompute under F2), N_ctrl target 30 (floor 24, F1),
~1:1, k=9 attack-mode-diverse seats. Strata: subtle-overreach(>=30) / not-supported(>=15) / evidence-absent
(stratum-floor per F7) / positive-control(>=24). GOLD VALIDITY: OUT-OF-FAMILY all-probes-agree consensus
(GPT-5.5 + Gemini via copilot CLI) + 20% human audit + the probe-strictness rubric (disqualify survivors-support-
more-than-overreach + unbounded-quantifier/vague-hedge mutations; seed-75-class disqualified) + the F5 difficulty
floors. Opus NOT in the retain predicate (#3). Leak-safe: WiCE pure closed-book; AVeriTeC date-filtered strict-pre-cutoff.

## Offline vs live (carried)

OFFLINE-DECIDABLE NOW: the verify-voter SCREEN (both arms) for all three voters. DEFERRED to Phase-20 live shadow:
retrieval quality, end-to-end report/citation fidelity, and the actual Haiku-ON flip. "near-Opus at cheap cost"
is proven by three legs: (i) cheap voter clears the absolute objective screen, (ii) cheap voter tracks Opus
closely (the near-Opus diagnostic), (iii) the end-to-end product (cheap executor + Opus advisor at the 2 gates)
works in Phase-20.

## Scope / reuse

NET-NEW: certifyModel (4 labels) + decisionMatrix + the 2 TAU keys + N floors (one-sided CI) + the
subject-specific difficulty-floor + covariate check + the k-aggregation/clustering spec + the evidence-absent
stratum floor + Opus-as-voter wiring + the per-model prompt freeze + the absolute lock-rule rewrite + anti-drift
tests. REUSE byte-identical: the jstat CP/Wilson engine + EVAL_THRESHOLDS numbers (only the 2 new TAU + floors
added) + scorePositiveControls (= Estimand B) + the classifyCalibration control-collapse kernel (lifted +
de-Sonnet-hardcoded into certifyModel) + the closed-book dispatch + persistVote + the datasets/manifest. FROZEN
(untouched): parseAvtDate/safeParse/dateFilter/staticKsAdapter/searchAndStop, URL_DATE_RULE, the schema.
PRE-REGISTRATION: lock the complete absolute decision function as code with passing anti-drift tests in the
zero-votes window BEFORE any vote; freeze N post-OOF-consensus before vote 1. CARRY the RE-PLAN-6 targeted
re-audit (magnitude/open-bound traps + restore Finding-2-author-altered traps).

## Open / execute-time

- OOF GOLD-BUILDING spend (GPT-5.5 + Gemini all-probes-agree consensus over the trap set + the 20% human audit)
  -- Copilot AI Credits; confirm at execute-time. The batched cheaper-model work (RE-PLAN-5/6) is reused for it.
- Opus-as-voter + Haiku + Sonnet votes -- Claude pool; k=9; resumable/paced.
- Final N after attrition; recompute + re-freeze TAU/N brackets if realized N differs (never relax a TAU to fit N).
