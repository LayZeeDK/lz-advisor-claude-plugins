# 20-05 PROVE-OR-DISPROVE cross-family board decision

**Date:** 2026-06-21
**Board:** 2 in-family Opus lenses (validity; decision/closure) + 2 out-of-family Copilot models (GPT-5.5;
gemini-3.1-pro-preview). Preceded by a research pass (`20-05-PROVE-DISPROVE-RESEARCH.md`).
**Spend:** Copilot ~20.3 AI Credits (GPT-5.5 13.9 + Gemini 6.42); Opus lenses on the in-plan session pool.
**Status:** CONVERGED. Awaiting maintainer ratification + the re-adjudication spend go.

## The question
How to validly PROVE OR DISPROVE the Sonnet (ship-default) + Haiku (deferred) verify-voters for
lz-deep-research, given (Breakdown 1) the false-uphold/specificity arm is VOID on-distribution and
(Breakdown 2) the over-refusal/sensitivity arm is CONFOUNDED -- the closed-book excerpt-entailment gold
admitted overclaimed controls that the open-book voter correctly refuted (4/30, nominal CP-upper 0.28 > 0.15).

## Convergence (4 members)
| Item | GPT-5.5 | Gemini | Opus-A (validity) | Opus-B (decision) | Result |
|------|---------|--------|-------------------|-------------------|--------|
| Bundle | 2 (scoped, N-correct) | 2 | 2 (+hard guard) | 2 (+429 fallback to 1) | **2 SURGICAL-RESCUE -> SCOPED sensitivity-only (UNANIMOUS)** |
| Q1 construct | wrong-construct | wrong-construct | wrong-construct (sound; indicts BOTH arms) | wrong-construct | **wrong-construct (UNANIMOUS)** |
| Q2 result-shopping | no, if pre-reg | no | no, IF two-sided+one-pass | no, if one-shot+accept-fail | **not result-shopping IF the guard holds (UNANIMOUS)** |
| Q3 full WORKS | no | no | no (confirm-VOID cheap) | no (sunk-cost) | **NO -- do not chase WORKS (UNANIMOUS)** |
| Q4 formal status | informal | formal | informal | informal | **INFORMAL (3-1)** |

## The decisive guards (load-bearing -- ratified into the execution)
1. **TWO-SIDED re-adjudication (Opus-A, the single most important guard).** The pre-registered re-adjudication
   must be provably SYMMETRIC: the same blind, open-book pass must be able to CONVICT the voter (surface a
   false-uphold the closed-book gold missed -> ADD to the false-uphold numerator) as well as exonerate it
   (reclassify a correct refute as a gold error -> remove from the over-refusal numerator). A pass that can
   ONLY remove over-refusals is result-shopping by construction -> revert to Bundle 1.
2. **Pre-registration, frozen + timestamped BEFORE any re-adjudication call:** the exact 30-control set, the 4
   disagreement IDs, the voter verdicts, the original gold; the open-book adjudication question text; the
   blind-control-mix size + random seed; the reclassification rule (an item moves ONLY IF both OOF
   adjudicators independently agree, human resolves residue/indeterminate = EXCLUDED, never coerced); ONE pass
   only; pre-committed fail semantics (if CP-upper > 0.15 after the rule, the arm FAILS and that is reported).
3. **N-floor (Opus-A):** if the rule drops the valid positive pool below N=30 -> re-freeze + top up from a
   PRE-EXISTING never-scored positive reserve (preferred), else report UNDER-POWERED at the realized N<30
   (CP widens honestly); NEVER pass-at-reduced-N by dropping only adverse items.
4. **Do NOT launder sensitivity-only into WORKS.** The certificate is SCOPED sensitivity-only; specificity
   (the catastrophic arm) is explicitly UNVERIFIED on-distribution. The off-distribution Phase-19 SCREEN-PASS
   is reported AS a non-certifying diagnostic, NOT as the specificity half of a two-arm result. The
   construct-mismatch (closed-book gold vs open-book voter) is the HEADLINE of the RAISE.
5. **Defer the Haiku-vs-Sonnet flip** until an open-book over-refusal gold exists (Opus-B + Gemini tier-flip
   artifact: a stronger open-book judge correctly refutes contaminated controls and scores WORSE on a
   confounded metric, so a cheap "tie" is spurious). Sonnet-default ships regardless (D-01).

## The ratified path (pending maintainer go + the metered re-adjudication)
1. Confirm-VOID the false-uphold arm CHEAPLY: document the structural claim~=evidence mechanism + the failed
   minimal-edit attempt + the off-distribution Phase-19 SCREEN-PASS as the VOID evidence (no full B1 spend).
2. PRE-REGISTER the two-sided re-adjudication (guard 1+2) -> commit BEFORE spending.
3. Re-adjudicate the 4 disagreements + a blind control sample OPEN-BOOK via the frozen OOF pair (~10-15
   credits) -> apply the frozen rule -> re-derive the over-refusal numerator (two-sided) -> CP.
4. Compose the verdict in `20-05-LIVE-CERT-RESULT.md` + `20-05-SUMMARY.md`: SCOPED sensitivity-only (if the
   arm clears after a valid two-sided correction at N>=30) OR honest VOID/under-powered + RAISE; specificity
   VOID-on-distribution + RAISE the open-book-gold rebuild; full WORKS NOT certified; Sonnet-default ships;
   Haiku flip DEFERRED.
5. 429 FALLBACK: if the budget block persists, ship Bundle 1 (cheapest-honest: VOID/RAISE + Sonnet-default)
   now and queue Bundle 2 for when payable -- never let temporary infra convert honesty into a stall.

## Provenance
Research: `20-05-PROVE-DISPROVE-RESEARCH.md`. Board briefs/outputs: gitignored
`eval/.cache/p20-live/board-prove-disprove-brief.md` + the GPT-5.5/Gemini transcripts. Decision authorities
extended: D-01 (settle-OR-raise; Sonnet ships), D-04 (cheap-vs-unanimous-oof residue -> maintainer),
D-05 (shadow), D-22 (native refuted-gold). Frozen primitives unchanged; two arms never pooled; N frozen
before scoring.
