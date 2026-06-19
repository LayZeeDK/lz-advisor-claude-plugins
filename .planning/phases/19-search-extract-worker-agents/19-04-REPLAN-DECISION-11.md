# RE-PLAN-11 decision: tighten the synthetic positive-control construction (genuine-synthesis + conjunction gate + difficulty-match)

**Status:** DECIDED (cross-family audit board converged; user-chose the focused re-plan). Pre-registered BEFORE the tightened re-run.
**Authority chain:** amends ONLY the RE-PLAN-10 positive-control CONSTRUCTION RULE + its BUILD CRITERION. Everything else carried byte-identical.
**Date:** 2026-06-19.

## Trigger

The RE-PLAN-10 synthetic-from-trap-corpus pilot CLEARED its pre-registered rule on paper (40 generated -> 26
screen-retained -> 22 survived the single-excerpt falsifier -> projected ~89 >> the frozen 24 floor ->
recommendation BUILD). The build-vs-descope decision is HUMAN-CONFIRMED, so the 22 survivors were sent to a
cross-family audit board (the human operator delegated the audit, lacking domain expertise). The board
falsified the clean-BUILD read.

## The audit board

Cross-family, fact-only, de-identified, neutral rubric (NO conjunction theory pre-fed -- the advisors surfaced
it independently): 2 in-family Opus lenses (a fair AUDITOR + a validity SKEPTIC, via the Agent tool) + GPT-5.5 +
Gemini-3.1-pro-preview (out-of-family, Copilot CLI). One round. ~33 Copilot AI Credits. Transcripts gitignored
eval/.cache/replan10-board/audit-*.

## The audit verdict (two findings + one corrected artifact)

1. ENTAILMENT VALIDITY: the controls are entailment-VALID. The two OOF models flagged 3-5 as hallucinated/
   unsupported, BUT this was mostly an ARTIFACT of the audit BRIEF (it showed only the 2-3 supporting excerpts,
   not the full ~17-excerpt cluster the screen evaluated). Verified against the FULL clusters: 0038
   ("eldest/brain cancer/2015"), 0079 ("State Department emails"), 0100 ("Feb 7 2019") ARE in their full
   clusters -> false positives; the SCREEN was right. ~1 genuine subtle distortion remains (0048: "40 million
   tested CASES" vs the cluster's "40 million people TESTED"). A secondary real issue: the generator's
   self-reported supporting_excerpt_indices are INCOMPLETE/inaccurate (harmless to the scope-(a) falsifier,
   which tests all excerpts, but it made the audit presentation misleading).
2. THE BINDING FINDING -- SUPERFICIAL-CONJUNCTION SKEW: only ~4 (both OOF) to ~12 (Opus) of the 22 survivors are
   GENUINE reasoning SYNTHESES (a new fact derivable only by LINKING excerpts -- coreference resolution,
   causal/temporal chaining, claim-vs-evidence reconciliation, entity disambiguation, quantitative/legal
   inference). The rest are SUPERFICIAL CONJUNCTIONS ("entity X, who [fact B], [fact A]") -- two independently
   verifiable facts glued by apposition/relative-clause. The single-excerpt falsifier is STRUCTURALLY BLIND to
   this (no single excerpt has BOTH halves, so conjunctions pass). This is a REAL DIFFICULTY-CONFOUND: positive
   controls systematically EASIER than the reasoning-heavy traps would let a lazy/refuse-happy judge post a
   deceptively low over-refusal rate (perfect on easy positives, failing the hard traps) -- the exact
   asymmetry the positive-control arm exists to prevent.
3. OVERALL: NOT build-sound as-is. 3 advisors "YES-WITH-CONDITIONS" + 1 "NO as-is" = unanimous "fix the
   construction first." All four named the SAME conditions + the SAME flip-fact (an empirical difficulty match).

## The converged FIX (the amended construction rule; the ONLY substantive RE-PLAN-11 change)

1. GENUINE-SYNTHESIS GENERATOR CONSTRAINT: the generator MUST produce claims that require GENUINE cross-excerpt
   LINKING (coreference resolution / causal-temporal chaining / claim-vs-evidence reconciliation / entity
   disambiguation / quantitative-legal inference). It MUST explicitly FORBID conjunctions + appositive
   insertions ("entity X, who [fact B], [fact A]" / "fact A, and (separately) fact B"). The 8-12 genuine
   syntheses from the pilot (e.g. 0004 coreference "the company"->Vitas; 0079 "Abedin's husband Weiner") are
   the template; the apposition pattern is the anti-pattern to suppress.
2. CONJUNCTION-DECOMPOSITION REJECT GATE (NEW -- the missing second gate, beyond the single-excerpt falsifier):
   a claim mechanically separable into "fact-A (excerpt i) AND fact-B (excerpt j)" with NO linking inference is
   REJECTED. This catches the superficial controls the single-excerpt falsifier passes. Both gates apply: the
   single-excerpt falsifier (no single excerpt entails the whole claim) AND the conjunction-decomposition gate
   (the multi-excerpt requirement is a genuine inference, not a conjunction).
3. AMENDED BUILD CRITERION (the pilot's was insufficient -- it counted superficial conjunctions): BUILD iff
   (a) the GENUINE-SYNTHESIS controls (post both gates) project >= the FROZEN N_CTRL_FLOOR (24; target ~30+)
   covariate-matched, AND (b) an EMPIRICAL DIFFICULTY-MATCH holds -- a held-out judge's accuracy on the controls
   is statistically NOT-EASIER-THAN its accuracy on the reasoning-heavy traps (controls near-saturated while
   traps lag -> the confound is confirmed -> NOT build). Superficial conjunctions do NOT count toward the floor.

## Floor risk (the genuinely re-opened question)

On GENUINE syntheses alone, the CURRENT-generator yield is uncertain vs the floor: the OOF count (~4/26) projects
~16 (BELOW 24); the Opus count (~12/26) projects ~49 (clears). So the tightened generator MUST RAISE the
genuine-synthesis yield; whether the floor holds is RE-MEASURED by the tightened re-run, NOT assumed. If the
tightened construction cannot clear the floor on genuine syntheses, the pre-registered DESCOPE applies.

## FROZEN -- carried byte-identical (NO change)

The engine + EVAL_THRESHOLDS incl. N_CTRL_FLOOR=24 (NOT relaxed); certifyModel + decisionMatrix + the estimands;
the strict OOF all-agree SCREEN + the OOF gold-decider identity (gpt-5.5 + gemini-3.1-pro-preview, --effort
high); URL_DATE_RULE; clopperPearsonUpperOneSided; the HEALTHY trap arm; the single-excerpt FALSIFIER (scope (a)
+ early-exit + discard-if-either -- RETAINED, the conjunction gate is ADDED alongside it). The synthetic
controls still draw from the unused dense dated trap-corpus clusters (RE-PLAN-10), now via the TIGHTENED
generator + the conjunction gate.

## DESCOPE remains the pre-registered fallback

If the tightened genuine-synthesis construction cannot clear the 24 floor or fails the empirical difficulty-match
-> AUTO-DESCOPE the over-refusal arm to the Phase-20 LIVE shadow, ship the offline read TRAP-ONLY + explicitly
incomplete, DEMOTE SATURATION-as-WORKS to PROVISIONAL; Sonnet-default ships regardless.

## Pre-registration discipline

ADDITIVE, inside the STILL-OPEN ZERO-VOTES window (no subject vote cast -- the pilot was a gold-CONSTRUCTION
probe). The amended construction rule + build criterion are FIXED HERE, before the tightened re-run. The full
TRACKED lock-rule + manifest re-pre-registration (prose == code + anti-drift) is done at the GOLD-FREEZE (before
any subject vote), recording the RE-PLAN-10 synthetic pivot (FEVER+VitaminC fetched source SUPERSEDED) + the
RE-PLAN-11 genuine-synthesis tightening + the conjunction gate + the amended build criterion. The frozen
primitives stay byte-identical; N is frozen post-construction before vote 1.

## Path (focused re-plan, user-chosen)

NO-SPEND build of the fix: the genuine-synthesis generator prompt + the conjunction-decomposition reject gate +
a dry-run proving the gate REJECTS a planted conjunction and KEEPS a genuine synthesis (DISCRIMINATING). THEN the
tightened re-run (a fresh spend boundary): regenerate (Opus, genuine-synthesis prompt) -> re-screen -> re-falsify
-> conjunction-decomposition gate -> re-measure the genuine-synthesis yield vs the 24 floor + the empirical
difficulty-match -> HALT + RAISE the build-vs-descope. The gold freeze + the three-voter k=9 runs remain
SEPARATE, NOT-yet-authorized spend boundaries.

## Audit board provenance + the disclosed brief flaw

The audit brief showed only supporting excerpts (a flaw): it produced false hallucination flags, corrected by a
full-cluster check (above). The conjunction-skew finding is ROBUST to the flaw (visible from the claim + the
supporting excerpts; more excerpts cannot turn a conjunction into a synthesis). ~33 Copilot AI Credits; total
OOF board spend across RE-PLAN-9/10/11 ~89 credits + the pilot ~136 OOF calls + 40 Opus generations.
