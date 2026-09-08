# 20-05 over-refusal re-adjudication -- PRE-REGISTRATION (frozen BEFORE any re-adjudication call)

**Frozen:** 2026-06-21, BEFORE any re-adjudication OOF call runs. Board-ratified (Bundle 2 surgical-rescue,
`20-05-PROVE-DISPROVE-BOARD-DECISION.md`). This document is committed BEFORE the metered run; the result is
whatever the rule below outputs, accepted even if it leaves the arm failing/under-powered (no second pass, no
prompt edits mid-flight, no item added/removed after scoring begins).

## Why (the confound this corrects)
The 30 over-refusal controls were confirmed CLOSED-BOOK ("does the provided excerpt entail the claim?"). The
voter ran OPEN-BOOK (live web) and refuted 4/30 (CP-upper 0.28 > TAU_OR 0.15). Inspection: the 4 refutes are
substantively correct (overclaims/contradictions vs the broader literature). The board ruled this a
WRONG-CONSTRUCT problem (closed-book gold vs open-book voter). This pre-registers a TWO-SIDED re-adjudication
to determine the TRUE over-refusal rate, with anti-result-shopping guards.

## Frozen inputs (committed; immutable after this point)
- The over-refusal control set: the 30 OOF-confirmed controls in `armB-oof-gold-result.json` confirmed_uids.
- The 4 DISAGREEMENTS (voter `refuted`; closed-gold `entailed`): `armB-over-refusal-score.json` over_refusal_uids =
  20260620-120000-montreal-protocol-ozone::cluster40, 20260620-181439-crispr-cas9-gene-editing::cluster47,
  20260620-192024-transformer-self-attention-scaling::cluster38, 20260620-212412-antibiotic-resistance-mechanisms::cluster24.
- The 26 AGREED controls (voter `unrefuted`; closed-gold `entailed`): the other 26 confirmed_uids.
- The voter verdicts (frozen in votes/sonnet/ctrl/).

## The re-adjudication SAMPLE (blind mix)
- ALL 4 disagreements + a BLIND RANDOM SAMPLE of 6 agreed controls (seed-pinned: sort the 26 agreed uids
  lexicographically, take a deterministic seeded shuffle [seed = "p20-rejudication"], pick the first 6).
- The 10 items are SHUFFLED together (same seed) and presented to the adjudicators with NO indication of which
  are disputed, what the voter said, or the original gold (gold-blind + verdict-blind + disputed-blind).

## The OPEN-BOOK re-adjudication QUESTION (frozen prompt content)
For each item, the FROZEN out-of-family pair (gpt-5.5 + gemini-3.1-pro-preview, --effort high, via the Copilot
CLI) is asked, gold-blind, the OPEN-BOOK / against-the-reference question:
> "Here is a CLAIM and the EVIDENCE it cites. Considering the evidence AND your knowledge of the established
>  literature, is the CLAIM ACCURATELY SUPPORTED -- i.e. true as stated, not overclaimed, not contradicted by
>  the cited source or the broader literature? Answer SUPPORTED only if the claim is accurate and does not
>  overreach the evidence; answer NOT-SUPPORTED if it overclaims, mis-states, or is contradicted (by its own
>  cited source or established knowledge); answer UNCLEAR if you cannot tell."
This is STRICTER than the original closed-book excerpt-entailment question (it adds "not overclaimed / not
contradicted by the literature") -- deliberately, because the closed-book gold was too lenient.

## The reclassification RULE (frozen; TWO-SIDED -- the decisive guard)
An item's re-adjudicated label = the consensus of the pair: SUPPORTED iff BOTH say SUPPORTED; NOT-SUPPORTED iff
BOTH say NOT-SUPPORTED; otherwise RESIDUE (split/unclear -> EXCLUDED from both numerator and denominator,
Guerdan response-set; routed to the maintainer for the record, never coerced).

Apply to the FULL re-adjudicated set (disputed AND blind-agreed -- the rule does not know which is which):
- An item re-adjudicated NOT-SUPPORTED was a CONTAMINATED control (not genuinely supported) -> it is REMOVED
  from the valid over-refusal control set (denominator). Then:
  - if the voter REFUTED it (a disagreement) -> the voter was CORRECT -> NOT an over-refusal (gold error).
  - if the voter UPHELD it (an agreed control) -> the voter wrongly upheld a bad claim -> a FALSE-UPHOLD the
    closed gold missed (CONVICTS the voter; recorded in the false-uphold tally). THIS IS THE TWO-SIDED ARM:
    the same blind pass can move an item AGAINST the voter.
- An item re-adjudicated SUPPORTED is a VALID supported control (stays in the denominator). Then:
  - if the voter REFUTED it -> a GENUINE OVER-REFUSAL (stays in the over-refusal numerator).
  - if the voter UPHELD it -> a correct uphold (no error).
- RESIDUE -> excluded from both numerator and denominator.

The un-re-adjudicated 20 agreed controls are ASSUMED valid supported controls (closed-gold + voter concur);
the blind sample BOUNDS their contamination rate. This introduces PARTIAL-VERIFICATION BIAS -- NAMED in the
result, never hidden; the reported over-refusal rate is the decontaminated estimate WITH this caveat.

## Scoring + the N-floor (frozen)
- Over-refusal numerator = # SUPPORTED-and-voter-REFUTED. Denominator = valid supported controls = 30 minus
  (items re-adjudicated NOT-SUPPORTED) minus (residues among the re-adjudicated). The un-re-adjudicated 20
  stay in the denominator (verification-bias caveat applies).
- CP = clopperPearsonUpperOneSided(overRefusals, validN) vs TAU_OR 0.15 (frozen).
- N-FLOOR: if validN < N_CTRL_FLOOR (24, frozen) -> VOID-on-power. If 24 <= validN < 30 -> report as
  UNDER-POWERED-relative-to-target with the realized N + CP, NEVER a clean "pass" presented without the
  reduced-N + verification-bias caveats. NEVER drop only adverse items to manufacture a pass (the rule removes
  contaminated controls on BOTH sides, decided by the consensus label, not by their effect on the rate).
- Report BOTH the raw (4/30, CP 0.28) and the decontaminated CP, with the full reclassification itemized.

## Verdict frame (frozen)
- If the decontaminated over-refusal CP <= 0.15 at validN >= 24 AND a valid two-sided correction held (the
  pass can convict) -> a SCOPED SENSITIVITY-ONLY certificate (specificity VOID-on-distribution; NOT WORKS).
- Else (CP > 0.15, or validN < 24, or the correction is one-sided) -> honest VOID / under-powered + RAISE.
- In EVERY case: specificity (false-uphold) is the catastrophic UNVERIFIED arm; the off-distribution Phase-19
  SCREEN-PASS is reported AS a non-certifying diagnostic, NOT the specificity half; the construct-mismatch is
  the RAISE headline; full WORKS NOT certified; Sonnet-default ships (D-01); Haiku flip DEFERRED (D-06).

## Anti-result-shopping commitments
ONE pass. The rule + question + sample + seed are frozen here, before any call. The result stands as output.
The re-adjudication is provably TWO-SIDED (it can ADD a false-uphold, not only remove an over-refusal). No
re-run after seeing a fail. The two arms are never pooled. Frozen primitives (CP estimator, TAU_OR) unchanged.
